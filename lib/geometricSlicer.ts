/**
 * Geometric layer slicer — same algorithm used by OrcaSlicer/PrusaSlicer/libslic3r
 *
 * For each horizontal layer (z = n × layerHeight) the mesh is intersected with a
 * plane, producing line segments whose total signed area gives the exact cross-section
 * area and whose total length gives the perimeter. Shell and infill volumes are derived
 * directly from those measurements, layer by layer. Support material is estimated from
 * downward-facing triangle faces (overhangs > 45°).
 */

import type { Orientation, SliceInput, SliceResult } from './slicerEstimate'

// ─── Types ──────────────────────────────────────────────────────────────────

interface Vec2 { x: number; y: number }
interface Vec3 { x: number; y: number; z: number }
interface Tri  { v0: Vec3; v1: Vec3; v2: Vec3 }

// ─── Orientation rotations (same as ModelViewer.tsx) ────────────────────────

const ROTATIONS: Record<Orientation, [number, number, number]> = {
  'z-': [0,             0, 0],
  'z+': [Math.PI,       0, 0],
  'y+': [Math.PI / 2,   0, 0],
  'y-': [-Math.PI / 2,  0, 0],
  'x+': [0,  0, -Math.PI / 2],
  'x-': [0,  0,  Math.PI / 2],
}

// ─── Math helpers ────────────────────────────────────────────────────────────

function rotateVec3(v: Vec3, rx: number, ry: number, rz: number): Vec3 {
  let { x, y, z } = v

  if (rx !== 0) {
    const c = Math.cos(rx), s = Math.sin(rx)
    const ny = y * c - z * s
    const nz = y * s + z * c
    y = ny; z = nz
  }
  if (ry !== 0) {
    const c = Math.cos(ry), s = Math.sin(ry)
    const nx = x * c + z * s
    const nz = -x * s + z * c
    x = nx; z = nz
  }
  if (rz !== 0) {
    const c = Math.cos(rz), s = Math.sin(rz)
    const nx = x * c - y * s
    const ny = x * s + y * c
    x = nx; y = ny
  }
  return { x, y, z }
}

// Intersect a single edge with z-plane. Returns interpolated XY point or null.
function intersectEdge(a: Vec3, b: Vec3, z: number): Vec2 | null {
  const da = a.z - z
  const db = b.z - z
  // Intersection exists only when the edge crosses strictly (opposite sides)
  if ((da > 0) === (db > 0)) return null
  if (da === db) return null
  const t = da / (da - db)
  return { x: a.x + t * (b.x - a.x), y: a.y + t * (b.y - a.y) }
}

// Intersect a triangle with a horizontal plane. Returns the crossing segment or null.
function intersectTri(tri: Tri, z: number): { a: Vec2; b: Vec2 } | null {
  const pts: Vec2[] = []
  const e01 = intersectEdge(tri.v0, tri.v1, z); if (e01) pts.push(e01)
  const e12 = intersectEdge(tri.v1, tri.v2, z); if (e12) pts.push(e12)
  const e20 = intersectEdge(tri.v2, tri.v0, z); if (e20) pts.push(e20)
  if (pts.length >= 2) return { a: pts[0], b: pts[1] }
  return null
}

// Face normal (unit vector)
function faceNormal(tri: Tri): Vec3 {
  const ax = tri.v1.x - tri.v0.x, ay = tri.v1.y - tri.v0.y, az = tri.v1.z - tri.v0.z
  const bx = tri.v2.x - tri.v0.x, by = tri.v2.y - tri.v0.y, bz = tri.v2.z - tri.v0.z
  const nx = ay * bz - az * by
  const ny = az * bx - ax * bz
  const nz = ax * by - ay * bx
  const len = Math.sqrt(nx * nx + ny * ny + nz * nz)
  if (len < 1e-12) return { x: 0, y: 0, z: 0 }
  return { x: nx / len, y: ny / len, z: nz / len }
}

// Projected area of triangle onto XY plane
function projectedArea(tri: Tri): number {
  const ax = tri.v1.x - tri.v0.x, ay = tri.v1.y - tri.v0.y
  const bx = tri.v2.x - tri.v0.x, by = tri.v2.y - tri.v0.y
  return Math.abs(ax * by - ay * bx) / 2
}

// ─── STL parser ──────────────────────────────────────────────────────────────

function parseSTLTriangles(buffer: ArrayBuffer): Tri[] {
  const tris: Tri[] = []

  // Peek at header to detect ASCII vs binary
  const header5 = new Uint8Array(buffer, 0, Math.min(5, buffer.byteLength))
  const isMaybeAscii = String.fromCharCode(...header5).toLowerCase().startsWith('solid')

  if (isMaybeAscii) {
    const text = new TextDecoder().decode(buffer)
    const re = /vertex\s+([\d.eE+\-]+)\s+([\d.eE+\-]+)\s+([\d.eE+\-]+)/g
    const verts: Vec3[] = []
    let m: RegExpExecArray | null
    while ((m = re.exec(text)) !== null) {
      verts.push({ x: +m[1], y: +m[2], z: +m[3] })
    }
    for (let i = 0; i + 2 < verts.length; i += 3) {
      tris.push({ v0: verts[i], v1: verts[i + 1], v2: verts[i + 2] })
    }
    return tris
  }

  // Binary: 80-byte header + 4-byte count + 50 bytes/triangle
  if (buffer.byteLength < 84) return tris
  const view  = new DataView(buffer)
  const count = view.getUint32(80, true)
  const maxCount = Math.floor((buffer.byteLength - 84) / 50)
  const safeCount = Math.min(count, maxCount)

  for (let i = 0; i < safeCount; i++) {
    const o = 84 + i * 50
    tris.push({
      v0: { x: view.getFloat32(o + 12, true), y: view.getFloat32(o + 16, true), z: view.getFloat32(o + 20, true) },
      v1: { x: view.getFloat32(o + 24, true), y: view.getFloat32(o + 28, true), z: view.getFloat32(o + 32, true) },
      v2: { x: view.getFloat32(o + 36, true), y: view.getFloat32(o + 40, true), z: view.getFloat32(o + 44, true) },
    })
  }
  return tris
}

// ─── Main slicer ─────────────────────────────────────────────────────────────

export function geometricSlice(buffer: ArrayBuffer, input: SliceInput): SliceResult {
  const { orientation, material, layerHeight, infill, supports, perimeters } = input
  const lineWidth = 0.4 // mm — standard 0.4 mm nozzle

  // 1. Parse raw triangles
  const rawTris = parseSTLTriangles(buffer)
  if (rawTris.length === 0) {
    return { shellGrams: 0, infillGrams: 0, supportGrams: 0, totalGrams: 0, printHours: 0 }
  }

  // 2. Rotate to chosen orientation
  const [rx, ry, rz] = ROTATIONS[orientation]
  const rotated: Tri[] = (rx === 0 && ry === 0 && rz === 0)
    ? rawTris
    : rawTris.map(t => ({
        v0: rotateVec3(t.v0, rx, ry, rz),
        v1: rotateVec3(t.v1, rx, ry, rz),
        v2: rotateVec3(t.v2, rx, ry, rz),
      }))

  // 3. Find Z extent and translate to z ≥ 0 (place on build plate)
  let zMin = Infinity, zMax = -Infinity
  for (const t of rotated) {
    zMin = Math.min(zMin, t.v0.z, t.v1.z, t.v2.z)
    zMax = Math.max(zMax, t.v0.z, t.v1.z, t.v2.z)
  }
  const height  = zMax - zMin
  const zOffset = -zMin

  const tris: Tri[] = rotated.map(t => ({
    v0: { x: t.v0.x, y: t.v0.y, z: t.v0.z + zOffset },
    v1: { x: t.v1.x, y: t.v1.y, z: t.v1.z + zOffset },
    v2: { x: t.v2.x, y: t.v2.y, z: t.v2.z + zOffset },
  }))

  // 4. Pre-compute per-triangle Z range for fast layer rejection
  const triZMin = new Float32Array(tris.length)
  const triZMax = new Float32Array(tris.length)
  for (let i = 0; i < tris.length; i++) {
    const t = tris[i]
    triZMin[i] = Math.min(t.v0.z, t.v1.z, t.v2.z)
    triZMax[i] = Math.max(t.v0.z, t.v1.z, t.v2.z)
  }

  // 5. Slice layer by layer — accumulate shell and infill volumes
  const layerCount = Math.ceil(height / layerHeight)
  let totalShellMm3  = 0
  let totalInfillMm3 = 0

  for (let li = 0; li < layerCount; li++) {
    const z = (li + 0.5) * layerHeight // sample at mid-layer
    let signedArea = 0
    let perimeter  = 0

    for (let ti = 0; ti < tris.length; ti++) {
      // Fast Z-range reject
      if (triZMin[ti] >= z || triZMax[ti] <= z) continue

      const seg = intersectTri(tris[ti], z)
      if (!seg) continue

      // Signed area contribution (divergence theorem):
      // Σ (ax×by − bx×ay)/2 = total enclosed area with correct sign
      signedArea += (seg.a.x * seg.b.y - seg.b.x * seg.a.y) * 0.5

      const dx = seg.b.x - seg.a.x
      const dy = seg.b.y - seg.a.y
      perimeter += Math.sqrt(dx * dx + dy * dy)
    }

    const area = Math.abs(signedArea)

    // Shell area: all perimeter lines at this layer
    const shellArea = Math.min(area, perimeter * perimeters * lineWidth)
    const coreArea  = Math.max(0, area - shellArea)

    totalShellMm3  += shellArea * layerHeight
    totalInfillMm3 += coreArea * (infill / 100) * layerHeight
  }

  // 6. Support material — detect overhanging faces (normal.z < −cos 45° ≈ −0.5)
  //    Only faces above the first 2 layers need supports (faces at z=0 are on the plate).
  let supportMm3 = 0
  if (supports) {
    const baseThreshold = layerHeight * 2

    for (let ti = 0; ti < tris.length; ti++) {
      const t   = tris[ti]
      const nrm = faceNormal(t)
      if (nrm.z >= -0.5) continue // not a significant overhang

      const centroidZ = (t.v0.z + t.v1.z + t.v2.z) / 3
      if (centroidZ <= baseThreshold) continue // sitting on or near the build plate

      // Support column: projected area × height × 15 % fill density
      supportMm3 += projectedArea(t) * centroidZ * 0.15
    }
  }

  // 7. Mass calculation
  const shellGrams   = (totalShellMm3   / 1000) * material.density
  const infillGrams  = (totalInfillMm3  / 1000) * material.density
  const supportGrams = (supportMm3       / 1000) * material.density
  const totalGrams   = shellGrams + infillGrams + supportGrams

  // 8. Print time
  //    Total extrusion path length = volume / (lineWidth × layerHeight)
  //    Print speed: 60 mm/s (conservative OrcaSlicer default for outer walls)
  const printSpeed   = 60 // mm/s
  const totalVolMm3  = totalShellMm3 + totalInfillMm3 + supportMm3
  const extrudeMm    = totalVolMm3 / (lineWidth * layerHeight)
  const extrudeTimeS = extrudeMm / printSpeed

  // Travel overhead: ~1.5 s/layer average (layer changes, retraction, wipe)
  const travelTimeS = layerCount * 1.5

  // Fixed overhead: heat-up, first layer, end sequence (~3 min)
  const overheadS = 180

  const printHours = (extrudeTimeS + travelTimeS + overheadS) / 3600

  return {
    shellGrams:   Math.round(shellGrams   * 10) / 10,
    infillGrams:  Math.round(infillGrams  * 10) / 10,
    supportGrams: Math.round(supportGrams * 10) / 10,
    totalGrams:   Math.round(totalGrams   * 10) / 10,
    printHours:   Math.round(printHours   * 100) / 100,
  }
}

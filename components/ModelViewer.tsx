'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import type { Orientation } from '@/lib/slicerEstimate'

const ORIENTATION_ROTATIONS: Record<Orientation, [number, number, number]> = {
  'z-': [0,             0, 0],
  'z+': [Math.PI,       0, 0],
  'y+': [Math.PI / 2,   0, 0],
  'y-': [-Math.PI / 2,  0, 0],
  'x+': [0,  0, -Math.PI / 2],
  'x-': [0,  0,  Math.PI / 2],
}

interface ModelViewerProps {
  buffer: ArrayBuffer
  orientation?: Orientation
}

export default function ModelViewer({ buffer, orientation = 'z-' }: ModelViewerProps) {
  const mountRef = useRef<HTMLDivElement>(null)
  const meshRef  = useRef<THREE.Mesh | null>(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0xf8f8f8)

    const width  = mount.clientWidth
    const height = mount.clientHeight

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 10000)
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(width, height)
    renderer.setPixelRatio(window.devicePixelRatio)
    mount.appendChild(renderer.domElement)

    // Lighting
    scene.add(new THREE.AmbientLight(0xffffff, 0.6))
    const d1 = new THREE.DirectionalLight(0xffffff, 0.8)
    d1.position.set(1, 2, 3)
    scene.add(d1)
    const d2 = new THREE.DirectionalLight(0xffffff, 0.3)
    d2.position.set(-2, -1, -1)
    scene.add(d2)

    // Load STL
    const loader   = new STLLoader()
    const geometry = loader.parse(buffer.slice(0))
    geometry.computeVertexNormals()
    geometry.center()

    const mat  = new THREE.MeshPhongMaterial({ color: 0x5E33D9, specular: 0x444444, shininess: 40 })
    const mesh = new THREE.Mesh(geometry, mat)
    scene.add(mesh)
    meshRef.current = mesh

    // Apply initial orientation
    const [rx, ry, rz] = ORIENTATION_ROTATIONS[orientation]
    mesh.rotation.set(rx, ry, rz)

    // Auto-fit camera
    const box     = new THREE.Box3().setFromObject(mesh)
    const size    = box.getSize(new THREE.Vector3())
    const maxDim  = Math.max(size.x, size.y, size.z)
    const fovRad  = (camera.fov * Math.PI) / 180
    const distance = (maxDim / 2 / Math.tan(fovRad / 2)) * 2.2

    camera.position.set(distance * 0.7, distance * 0.5, distance)
    camera.lookAt(0, 0, 0)

    // Build plate grid
    const gridSize = maxDim * 2
    const grid = new THREE.GridHelper(gridSize, 10, 0xdddddd, 0xeeeeee)
    grid.position.y = -size.y / 2
    scene.add(grid)

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.08
    controls.enablePan    = false
    controls.minDistance  = distance * 0.3
    controls.maxDistance  = distance * 4
    controls.autoRotate   = true
    controls.autoRotateSpeed = 1.5

    const stopAutoRotate = () => { controls.autoRotate = false }
    renderer.domElement.addEventListener('pointerdown', stopAutoRotate)

    let animId: number
    const animate = () => {
      animId = requestAnimationFrame(animate)
      controls.update()
      renderer.render(scene, camera)
    }
    animate()

    const handleResize = () => {
      if (!mount) return
      const w = mount.clientWidth
      const h = mount.clientHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }
    const ro = new ResizeObserver(handleResize)
    ro.observe(mount)

    return () => {
      cancelAnimationFrame(animId)
      ro.disconnect()
      renderer.domElement.removeEventListener('pointerdown', stopAutoRotate)
      controls.dispose()
      renderer.dispose()
      geometry.dispose()
      mat.dispose()
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement)
      meshRef.current = null
    }
  }, [buffer]) // re-mount only when buffer changes

  // Update rotation without re-mounting
  useEffect(() => {
    if (!meshRef.current) return
    const [rx, ry, rz] = ORIENTATION_ROTATIONS[orientation]
    meshRef.current.rotation.set(rx, ry, rz)
  }, [orientation])

  return (
    <div className="relative w-full rounded-xl overflow-hidden border border-gray-200 bg-gray-50" style={{ height: '280px' }}>
      <div ref={mountRef} className="w-full h-full" />
      <p className="absolute bottom-2 right-3 text-xs text-gray-400 pointer-events-none">
        Arrastra · Scroll para zoom
      </p>
    </div>
  )
}

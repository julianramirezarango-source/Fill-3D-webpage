/**
 * Parses an STL file (binary or ASCII) and returns the volume in cm³.
 * Volume is computed via the divergence theorem (signed tetrahedra sum).
 */

function signedVolumeOfTriangle(
  p1x: number, p1y: number, p1z: number,
  p2x: number, p2y: number, p2z: number,
  p3x: number, p3y: number, p3z: number
): number {
  return (
    p1x * (p2y * p3z - p2z * p3y) +
    p1y * (p2z * p3x - p2x * p3z) +
    p1z * (p2x * p3y - p2y * p3x)
  ) / 6.0;
}

function isBinarySTL(buffer: ArrayBuffer): boolean {
  if (buffer.byteLength < 84) return false;
  const view = new DataView(buffer);
  const numTriangles = view.getUint32(80, true);
  const expectedSize = 84 + numTriangles * 50;
  // Allow small tolerance for files with extra data
  return Math.abs(buffer.byteLength - expectedSize) < 10;
}

function parseBinarySTL(buffer: ArrayBuffer): number {
  const view = new DataView(buffer);
  const numTriangles = view.getUint32(80, true);
  let volume = 0;
  let offset = 84;

  for (let i = 0; i < numTriangles; i++) {
    // Skip normal (12 bytes), read 3 vertices (9 floats = 36 bytes)
    offset += 12;
    const v1x = view.getFloat32(offset, true);
    const v1y = view.getFloat32(offset + 4, true);
    const v1z = view.getFloat32(offset + 8, true);
    offset += 12;
    const v2x = view.getFloat32(offset, true);
    const v2y = view.getFloat32(offset + 4, true);
    const v2z = view.getFloat32(offset + 8, true);
    offset += 12;
    const v3x = view.getFloat32(offset, true);
    const v3y = view.getFloat32(offset + 4, true);
    const v3z = view.getFloat32(offset + 8, true);
    offset += 12;
    offset += 2; // attribute byte count

    volume += signedVolumeOfTriangle(v1x, v1y, v1z, v2x, v2y, v2z, v3x, v3y, v3z);
  }

  return Math.abs(volume);
}

function parseAsciiSTL(text: string): number {
  const vertexPattern = /vertex\s+([\d.eE+\-]+)\s+([\d.eE+\-]+)\s+([\d.eE+\-]+)/g;
  const vertices: number[][] = [];
  let match;

  while ((match = vertexPattern.exec(text)) !== null) {
    vertices.push([parseFloat(match[1]), parseFloat(match[2]), parseFloat(match[3])]);
  }

  if (vertices.length % 3 !== 0) {
    throw new Error('Archivo STL inválido: número de vértices incorrecto');
  }

  let volume = 0;
  for (let i = 0; i < vertices.length; i += 3) {
    const [v1, v2, v3] = [vertices[i], vertices[i + 1], vertices[i + 2]];
    volume += signedVolumeOfTriangle(
      v1[0], v1[1], v1[2],
      v2[0], v2[1], v2[2],
      v3[0], v3[1], v3[2]
    );
  }

  return Math.abs(volume);
}

/**
 * Returns volume in cm³ from an STL ArrayBuffer.
 * STL units are typically mm, so we convert mm³ → cm³.
 */
export async function parseSTL(buffer: ArrayBuffer): Promise<number> {
  let volumeMm3: number;

  if (isBinarySTL(buffer)) {
    volumeMm3 = parseBinarySTL(buffer);
  } else {
    const text = new TextDecoder().decode(buffer);
    if (!text.trimStart().toLowerCase().startsWith('solid')) {
      throw new Error('Formato de archivo STL no reconocido');
    }
    volumeMm3 = parseAsciiSTL(text);
  }

  // Convert mm³ to cm³
  const volumeCm3 = volumeMm3 / 1000;
  return volumeCm3;
}

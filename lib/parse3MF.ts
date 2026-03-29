import JSZip from 'jszip';

/**
 * Signed tetrahedron volume helper (same as in parseSTL)
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

/**
 * Returns volume in cm³ from a 3MF ArrayBuffer.
 * 3MF files use mm units by default.
 */
export async function parse3MF(buffer: ArrayBuffer): Promise<number> {
  const zip = await JSZip.loadAsync(buffer);

  // Find the model file (usually 3D/3dmodel.model)
  let modelContent: string | null = null;
  const candidates = ['3D/3dmodel.model', '3dmodel.model'];

  for (const path of candidates) {
    const file = zip.file(path);
    if (file) {
      modelContent = await file.async('text');
      break;
    }
  }

  // If not found by exact path, search for any .model file
  if (!modelContent) {
    const files = Object.keys(zip.files);
    const modelFile = files.find((f) => f.endsWith('.model'));
    if (modelFile) {
      modelContent = await zip.files[modelFile].async('text');
    }
  }

  if (!modelContent) {
    throw new Error('Archivo 3MF inválido: no se encontró el modelo 3D');
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(modelContent, 'application/xml');

  const parseError = doc.querySelector('parsererror');
  if (parseError) {
    throw new Error('Archivo 3MF inválido: error al parsear XML');
  }

  // Extract all vertices and triangles from all mesh objects
  const meshes = doc.querySelectorAll('mesh');
  let totalVolumeMm3 = 0;

  meshes.forEach((mesh) => {
    const vertexNodes = mesh.querySelectorAll('vertices > vertex');
    const triangleNodes = mesh.querySelectorAll('triangles > triangle');

    const verts: number[][] = [];
    vertexNodes.forEach((v) => {
      verts.push([
        parseFloat(v.getAttribute('x') || '0'),
        parseFloat(v.getAttribute('y') || '0'),
        parseFloat(v.getAttribute('z') || '0'),
      ]);
    });

    let meshVolume = 0;
    triangleNodes.forEach((t) => {
      const i1 = parseInt(t.getAttribute('v1') || '0', 10);
      const i2 = parseInt(t.getAttribute('v2') || '0', 10);
      const i3 = parseInt(t.getAttribute('v3') || '0', 10);
      if (verts[i1] && verts[i2] && verts[i3]) {
        meshVolume += signedVolumeOfTriangle(
          verts[i1][0], verts[i1][1], verts[i1][2],
          verts[i2][0], verts[i2][1], verts[i2][2],
          verts[i3][0], verts[i3][1], verts[i3][2]
        );
      }
    });

    totalVolumeMm3 += Math.abs(meshVolume);
  });

  // Convert mm³ to cm³
  return totalVolumeMm3 / 1000;
}

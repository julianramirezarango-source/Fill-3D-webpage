export interface Material {
  id: string
  name: string
  description: string
  pricePerGram: number // COP por gramo
  density: number      // g/cm³
  color: string        // hex para la UI
}

export const MATERIALS: Material[] = [
  { id: 'pla',  name: 'PLA',  description: 'Uso general, fácil de imprimir', pricePerGram: 80,  density: 1.24, color: '#22c55e' },
  { id: 'plap', name: 'PLA+', description: 'Más resistente que PLA estándar', pricePerGram: 90,  density: 1.24, color: '#3b82f6' },
  { id: 'petg', name: 'PETG', description: 'Resistente al calor y humedad',   pricePerGram: 100, density: 1.27, color: '#f97316' },
  { id: 'abs',  name: 'ABS',  description: 'Alta temperatura, post-procesable', pricePerGram: 95, density: 1.04, color: '#ef4444' },
  { id: 'tpu',  name: 'TPU',  description: 'Flexible, absorbe impactos',      pricePerGram: 150, density: 1.21, color: '#a855f7' },
  { id: 'asa',  name: 'ASA',  description: 'Resistente a UV, uso exterior',   pricePerGram: 110, density: 1.07, color: '#eab308' },
]

export function getMaterial(id: string): Material {
  return MATERIALS.find(m => m.id === id) ?? MATERIALS[0]
}

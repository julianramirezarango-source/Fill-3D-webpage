import { Material } from './materials'

export type Orientation = 'z-' | 'z+' | 'y+' | 'y-' | 'x+' | 'x-'

export interface SliceInput {
  volumeCm3: number
  orientation: Orientation
  material: Material
  layerHeight: 0.15 | 0.2 | 0.3
  infill: number        // 10–100
  supports: boolean
  perimeters: 2 | 3 | 4
}

export interface SliceResult {
  shellGrams: number
  infillGrams: number
  supportGrams: number
  totalGrams: number
  printHours: number
}

// Fraction of model volume that needs supports per orientation
const SUPPORT_FACTORS: Record<Orientation, number> = {
  'z-': 0.04,  // natural orientation — minimal overhangs
  'z+': 0.28,  // upside down — entire base needs supports
  'y+': 0.18,
  'y-': 0.18,
  'x+': 0.20,
  'x-': 0.20,
}

export function estimateSlice(input: SliceInput): SliceResult {
  const { volumeCm3, orientation, material, layerHeight, infill, supports, perimeters } = input
  const volMm3 = volumeCm3 * 1000
  const lineWidth = 0.4 // mm (typical 0.4mm nozzle)

  // Approximate surface area via equivalent sphere radius
  const r = Math.cbrt((3 * volMm3) / (4 * Math.PI))
  const surfaceMm2 = 4 * Math.PI * r * r

  // Shell volume: perimeters × lineWidth × surface area, capped at 80% of total
  const shellVolumeMm3 = Math.min(volMm3 * 0.80, surfaceMm2 * perimeters * lineWidth)
  const coreVolumeMm3  = Math.max(0, volMm3 - shellVolumeMm3)
  const infillVolumeMm3 = coreVolumeMm3 * (infill / 100)

  // Support material
  const supportFactor   = supports ? SUPPORT_FACTORS[orientation] : 0
  const supportVolumeMm3 = volMm3 * supportFactor

  const totalVolumeMm3 = shellVolumeMm3 + infillVolumeMm3 + supportVolumeMm3

  const shellGrams   = (shellVolumeMm3   / 1000) * material.density
  const infillGrams  = (infillVolumeMm3  / 1000) * material.density
  const supportGrams = (supportVolumeMm3 / 1000) * material.density
  const totalGrams   = (totalVolumeMm3   / 1000) * material.density

  // Print time: volumetric flow rate scales with layer height
  // Baseline: ~10 mm³/s at 0.2mm layer, 60 mm/s print speed
  const baseFlowMm3PerSec = 10 * (layerHeight / 0.2)
  const pureTimeSec = totalVolumeMm3 / baseFlowMm3PerSec
  const printHours  = (pureTimeSec * 1.35) / 3600  // +35% for travel, warmup, etc.

  return {
    shellGrams:   Math.round(shellGrams   * 10) / 10,
    infillGrams:  Math.round(infillGrams  * 10) / 10,
    supportGrams: Math.round(supportGrams * 10) / 10,
    totalGrams:   Math.round(totalGrams   * 10) / 10,
    printHours:   Math.round(printHours   * 100) / 100,
  }
}

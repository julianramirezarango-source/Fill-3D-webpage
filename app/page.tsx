'use client'

import { useReducer, useMemo, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import FileUpload from '@/components/FileUpload'
import { Section } from '@/components/Section'
import { OrientationSelector } from '@/components/OrientationSelector'
import { PrintConfig } from '@/components/PrintConfig'
import { SlicerSection } from '@/components/SlicerSection'
import { MachineConfig } from '@/components/MachineConfig'
import { TimeInput } from '@/components/TimeInput'
import { MarginInput } from '@/components/MarginInput'
import { ShippingInput } from '@/components/ShippingInput'
import { FinalSummary } from '@/components/FinalSummary'
import { getMaterial } from '@/lib/materials'
import { estimateSlice } from '@/lib/slicerEstimate'
import { calculateFullPrice } from '@/lib/fullPriceCalc'
import { exportToPDF, exportToExcel } from '@/lib/export'
import type { Orientation } from '@/lib/slicerEstimate'

const ModelViewer = dynamic(() => import('@/components/ModelViewer'), { ssr: false })

// ─── State ──────────────────────────────────────────────────────────────────

interface CalcState {
  fileName: string | null
  stlBuffer: ArrayBuffer | null
  volumeCm3: number | null

  orientation: Orientation
  materialId: string
  layerHeight: 0.15 | 0.2 | 0.3
  infill: number
  supports: boolean
  perimeters: 2 | 3 | 4

  slicerMode: 'estimate' | 'manual'
  manualGrams: string
  manualHours: string

  pricePerGram: number
  wattsPerHour: number
  kwhPriceCOP: number
  machineCostCOP: number
  machineLifetimeHours: number

  prepMinutes: number
  postMinutes: number
  hourlyRateCOP: number

  failureRate: number
  profitMargin: number

  packagingEnabled: boolean
  packagingCost: number
  shippingCost: number
  taxEnabled: boolean
  taxPercent: number

  error: string | null
}

type Action =
  | { type: 'SET_FILE'; fileName: string; stlBuffer: ArrayBuffer | null; volumeCm3: number }
  | { type: 'SET_ERROR'; msg: string }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SET_ORIENTATION'; v: Orientation }
  | { type: 'SET_MATERIAL'; v: string }
  | { type: 'SET_LAYER_HEIGHT'; v: 0.15 | 0.2 | 0.3 }
  | { type: 'SET_INFILL'; v: number }
  | { type: 'SET_SUPPORTS'; v: boolean }
  | { type: 'SET_PERIMETERS'; v: 2 | 3 | 4 }
  | { type: 'SET_SLICER_MODE'; v: 'estimate' | 'manual' }
  | { type: 'SET_MANUAL_GRAMS'; v: string }
  | { type: 'SET_MANUAL_HOURS'; v: string }
  | { type: 'SET_MACHINE'; field: string; v: number }
  | { type: 'SET_TIME'; field: string; v: number }
  | { type: 'SET_MARGIN'; field: string; v: number }
  | { type: 'SET_SHIPPING'; field: string; v: number | boolean }
  | { type: 'RESET' }

const DEFAULT_PRICE_PER_GRAM = getMaterial('pla').pricePerGram

const initialState: CalcState = {
  fileName: null,
  stlBuffer: null,
  volumeCm3: null,

  orientation: 'z-',
  materialId: 'pla',
  layerHeight: 0.2,
  infill: 20,
  supports: false,
  perimeters: 3,

  slicerMode: 'estimate',
  manualGrams: '',
  manualHours: '',

  pricePerGram: DEFAULT_PRICE_PER_GRAM,
  wattsPerHour: 250,
  kwhPriceCOP: 900,
  machineCostCOP: 2500000,
  machineLifetimeHours: 2000,

  prepMinutes: 15,
  postMinutes: 10,
  hourlyRateCOP: 15000,

  failureRate: 5,
  profitMargin: 30,

  packagingEnabled: false,
  packagingCost: 2000,
  shippingCost: 0,
  taxEnabled: false,
  taxPercent: 19,

  error: null,
}

function reducer(s: CalcState, a: Action): CalcState {
  switch (a.type) {
    case 'SET_FILE':    return { ...s, fileName: a.fileName, stlBuffer: a.stlBuffer ?? null, volumeCm3: a.volumeCm3, error: null }
    case 'SET_ERROR':   return { ...s, error: a.msg }
    case 'CLEAR_ERROR': return { ...s, error: null }
    case 'SET_ORIENTATION': return { ...s, orientation: a.v }
    case 'SET_MATERIAL': {
      const mat = getMaterial(a.v)
      return { ...s, materialId: a.v, pricePerGram: mat.pricePerGram }
    }
    case 'SET_LAYER_HEIGHT': return { ...s, layerHeight: a.v }
    case 'SET_INFILL':      return { ...s, infill: a.v }
    case 'SET_SUPPORTS':    return { ...s, supports: a.v }
    case 'SET_PERIMETERS':  return { ...s, perimeters: a.v }
    case 'SET_SLICER_MODE': return { ...s, slicerMode: a.v }
    case 'SET_MANUAL_GRAMS': return { ...s, manualGrams: a.v }
    case 'SET_MANUAL_HOURS': return { ...s, manualHours: a.v }
    case 'SET_MACHINE':  return { ...s, [a.field]: a.v }
    case 'SET_TIME':     return { ...s, [a.field]: a.v }
    case 'SET_MARGIN':   return { ...s, [a.field]: a.v }
    case 'SET_SHIPPING': return { ...s, [a.field]: a.v }
    case 'RESET': return { ...initialState }
    default: return s
  }
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function CalculadoraPage() {
  const [s, dispatch] = useReducer(reducer, initialState)

  // Persist machine/time/margin prefs in localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('fill3d-prefs')
      if (saved) {
        const p = JSON.parse(saved)
        const fields = ['pricePerGram','wattsPerHour','kwhPriceCOP','machineCostCOP','machineLifetimeHours','prepMinutes','postMinutes','hourlyRateCOP','failureRate','profitMargin']
        fields.forEach(f => { if (p[f] != null) dispatch({ type: 'SET_MACHINE', field: f, v: p[f] }) })
      }
    } catch { /* ignore */ }
  }, [])

  useEffect(() => {
    try {
      const prefs = { pricePerGram: s.pricePerGram, wattsPerHour: s.wattsPerHour, kwhPriceCOP: s.kwhPriceCOP, machineCostCOP: s.machineCostCOP, machineLifetimeHours: s.machineLifetimeHours, prepMinutes: s.prepMinutes, postMinutes: s.postMinutes, hourlyRateCOP: s.hourlyRateCOP, failureRate: s.failureRate, profitMargin: s.profitMargin }
      localStorage.setItem('fill3d-prefs', JSON.stringify(prefs))
    } catch { /* ignore */ }
  }, [s.pricePerGram, s.wattsPerHour, s.kwhPriceCOP, s.machineCostCOP, s.machineLifetimeHours, s.prepMinutes, s.postMinutes, s.hourlyRateCOP, s.failureRate, s.profitMargin])

  const material = useMemo(() => getMaterial(s.materialId), [s.materialId])

  const sliceEstimate = useMemo(() => {
    if (!s.volumeCm3 || s.slicerMode !== 'estimate') return null
    return estimateSlice({
      volumeCm3: s.volumeCm3,
      orientation: s.orientation,
      material,
      layerHeight: s.layerHeight,
      infill: s.infill,
      supports: s.supports,
      perimeters: s.perimeters,
    })
  }, [s.volumeCm3, s.orientation, material, s.layerHeight, s.infill, s.supports, s.perimeters, s.slicerMode])

  const effectiveGrams = s.slicerMode === 'estimate'
    ? (sliceEstimate?.totalGrams ?? 0)
    : (parseFloat(s.manualGrams) || 0)

  const effectiveHours = s.slicerMode === 'estimate'
    ? (sliceEstimate?.printHours ?? 0)
    : (parseFloat(s.manualHours) || 0)

  const breakdown = useMemo(() => {
    if (!effectiveGrams && !effectiveHours) return null
    return calculateFullPrice({
      grams: effectiveGrams,
      hours: effectiveHours,
      pricePerGram: s.pricePerGram,
      wattsPerHour: s.wattsPerHour,
      kwhPriceCOP: s.kwhPriceCOP,
      machineCostCOP: s.machineCostCOP,
      machineLifetimeHours: s.machineLifetimeHours,
      prepMinutes: s.prepMinutes,
      postMinutes: s.postMinutes,
      hourlyRateCOP: s.hourlyRateCOP,
      failureRate: s.failureRate,
      profitMargin: s.profitMargin,
      packagingEnabled: s.packagingEnabled,
      packagingCost: s.packagingCost,
      shippingCost: s.shippingCost,
      taxEnabled: s.taxEnabled,
      taxPercent: s.taxPercent,
    })
  }, [effectiveGrams, effectiveHours, s.pricePerGram, s.wattsPerHour, s.kwhPriceCOP, s.machineCostCOP, s.machineLifetimeHours, s.prepMinutes, s.postMinutes, s.hourlyRateCOP, s.failureRate, s.profitMargin, s.packagingEnabled, s.packagingCost, s.shippingCost, s.taxEnabled, s.taxPercent])

  // Accumulate buffer+volume before dispatching SET_FILE
  const pendingBuffer = useRef<{ buf: ArrayBuffer; type: 'stl' | '3mf' } | null>(null)

  const fileLoaded = !!s.volumeCm3

  const handleExportPDF = async () => {
    if (!breakdown || !s.fileName) return
    await exportToPDF({
      fileName: s.fileName,
      materialName: material.name,
      layerHeight: s.layerHeight,
      infill: s.infill,
      supports: s.supports,
      grams: effectiveGrams,
      hours: effectiveHours,
      breakdown,
    })
  }

  const handleExportExcel = async () => {
    if (!breakdown || !s.fileName) return
    await exportToExcel({
      fileName: s.fileName,
      materialName: material.name,
      layerHeight: s.layerHeight,
      infill: s.infill,
      supports: s.supports,
      grams: effectiveGrams,
      hours: effectiveHours,
      breakdown,
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🖨️</span>
            <span className="font-bold text-gray-900">Fill-3D</span>
            <span className="text-gray-400 text-sm hidden sm:inline">· Calculadora de Impresión</span>
          </div>
          {fileLoaded && (
            <button
              onClick={() => dispatch({ type: 'RESET' })}
              className="text-sm text-gray-500 hover:text-orange-500 transition-colors cursor-pointer"
            >
              ↺ Nueva pieza
            </button>
          )}
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {/* Error banner */}
        {s.error && (
          <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-start gap-2">
            <span>⚠️</span>
            <span className="flex-1">{s.error}</span>
            <button onClick={() => dispatch({ type: 'CLEAR_ERROR' })} className="text-red-400 hover:text-red-600 cursor-pointer">✕</button>
          </div>
        )}

        {/* 1 — Archivo */}
        <Section step={1} title="Carga tu modelo 3D">
          {!fileLoaded ? (
            <div>
              <p className="text-sm text-gray-500 mb-4">
                Acepta <span className="font-mono">.STL</span> y <span className="font-mono">.3MF</span>. El archivo se procesa en tu navegador — no se sube a ningún servidor.
              </p>
              <FileUpload
                onBufferReady={(buf, type) => { pendingBuffer.current = { buf, type } }}
                onVolumeParsed={(vol, name) => {
                  const stlBuf = pendingBuffer.current?.type === 'stl' ? pendingBuffer.current.buf : null
                  pendingBuffer.current = null
                  dispatch({ type: 'SET_FILE', fileName: name, stlBuffer: stlBuf!, volumeCm3: vol })
                }}
                onError={msg => dispatch({ type: 'SET_ERROR', msg })}
              />
            </div>
          ) : (
            <div className="flex items-center gap-3 text-sm text-gray-700">
              <span className="text-green-500 text-xl">✓</span>
              <span className="font-medium">{s.fileName}</span>
              <span className="text-gray-400">·</span>
              <span className="text-gray-500">{s.volumeCm3?.toFixed(2)} cm³</span>
              <button
                onClick={() => dispatch({ type: 'RESET' })}
                className="ml-auto text-xs text-gray-400 hover:text-orange-500 underline cursor-pointer"
              >
                Cambiar
              </button>
            </div>
          )}
        </Section>

        {/* 2 — Orientación */}
        <Section step={2} title="Orientación de impresión" isLocked={!fileLoaded}>
          <div className="grid md:grid-cols-2 gap-4">
            {s.stlBuffer && (
              <ModelViewer buffer={s.stlBuffer} orientation={s.orientation} />
            )}
            <OrientationSelector
              value={s.orientation}
              onChange={v => dispatch({ type: 'SET_ORIENTATION', v })}
            />
          </div>
        </Section>

        {/* 3 — Configuración */}
        <Section step={3} title="Configuración de impresión" isLocked={!fileLoaded}>
          <PrintConfig
            materialId={s.materialId}
            layerHeight={s.layerHeight}
            infill={s.infill}
            supports={s.supports}
            perimeters={s.perimeters}
            onMaterial={v => dispatch({ type: 'SET_MATERIAL', v })}
            onLayerHeight={v => dispatch({ type: 'SET_LAYER_HEIGHT', v })}
            onInfill={v => dispatch({ type: 'SET_INFILL', v })}
            onSupports={v => dispatch({ type: 'SET_SUPPORTS', v })}
            onPerimeters={v => dispatch({ type: 'SET_PERIMETERS', v })}
          />
        </Section>

        {/* 4 — Material y tiempo */}
        <Section step={4} title="Material y tiempo estimado" isLocked={!fileLoaded}>
          <SlicerSection
            mode={s.slicerMode}
            estimate={sliceEstimate}
            manualGrams={s.manualGrams}
            manualHours={s.manualHours}
            onMode={v => dispatch({ type: 'SET_SLICER_MODE', v })}
            onManualGrams={v => dispatch({ type: 'SET_MANUAL_GRAMS', v })}
            onManualHours={v => dispatch({ type: 'SET_MANUAL_HOURS', v })}
          />
        </Section>

        {/* 5 — Costos de máquina */}
        <Section step={5} title="Costos de máquina" isLocked={!fileLoaded}>
          <MachineConfig
            materialId={s.materialId}
            pricePerGram={s.pricePerGram}
            wattsPerHour={s.wattsPerHour}
            kwhPriceCOP={s.kwhPriceCOP}
            machineCostCOP={s.machineCostCOP}
            machineLifetimeHours={s.machineLifetimeHours}
            onChange={(field, v) => dispatch({ type: 'SET_MACHINE', field, v })}
          />
        </Section>

        {/* 6 — Tu tiempo */}
        <Section step={6} title="Tu tiempo" isLocked={!fileLoaded}>
          <TimeInput
            prepMinutes={s.prepMinutes}
            postMinutes={s.postMinutes}
            hourlyRateCOP={s.hourlyRateCOP}
            onChange={(field, v) => dispatch({ type: 'SET_TIME', field, v })}
          />
        </Section>

        {/* 7 — Margen y riesgo */}
        <Section step={7} title="Margen y tasa de fallo" isLocked={!fileLoaded}>
          <MarginInput
            failureRate={s.failureRate}
            profitMargin={s.profitMargin}
            onChange={(field, v) => dispatch({ type: 'SET_MARGIN', field, v })}
          />
        </Section>

        {/* 8 — Envío y extras */}
        <Section step={8} title="Envío, empaque e impuestos" isLocked={!fileLoaded}>
          <ShippingInput
            packagingEnabled={s.packagingEnabled}
            packagingCost={s.packagingCost}
            shippingCost={s.shippingCost}
            taxEnabled={s.taxEnabled}
            taxPercent={s.taxPercent}
            onChange={(field, v) => dispatch({ type: 'SET_SHIPPING', field, v })}
          />
        </Section>

        {/* 9 — Resumen final */}
        {breakdown && (
          <Section step={9} title="Resumen y precio final">
            <FinalSummary
              breakdown={breakdown}
              grams={effectiveGrams}
              hours={effectiveHours}
              onExportPDF={handleExportPDF}
              onExportExcel={handleExportExcel}
            />
          </Section>
        )}
      </main>

      <footer className="text-center py-8 text-xs text-gray-400">
        © {new Date().getFullYear()} Fill-3D · Colombia ·{' '}
        <a href="https://fill-3d.com" className="hover:underline">fill-3d.com</a>
      </footer>
    </div>
  )
}

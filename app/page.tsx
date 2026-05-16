'use client'

import { useReducer, useMemo, useEffect, useRef, useState } from 'react'
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
import { geometricSlice } from '@/lib/geometricSlicer'
import { calculateFullPrice } from '@/lib/fullPriceCalc'
import { exportToPDF, exportToExcel } from '@/lib/export'
import type { Orientation, SliceResult } from '@/lib/slicerEstimate'

const ModelViewer = dynamic(() => import('@/components/ModelViewer'), { ssr: false })

// ─── State ───────────────────────────────────────────────────────────────────

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

  pricePerGram: getMaterial('pla').pricePerGram,
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
    case 'SET_FILE':     return { ...s, fileName: a.fileName, stlBuffer: a.stlBuffer ?? null, volumeCm3: a.volumeCm3, error: null }
    case 'SET_ERROR':    return { ...s, error: a.msg }
    case 'CLEAR_ERROR':  return { ...s, error: null }
    case 'SET_ORIENTATION': return { ...s, orientation: a.v }
    case 'SET_MATERIAL': {
      const mat = getMaterial(a.v)
      return { ...s, materialId: a.v, pricePerGram: mat.pricePerGram }
    }
    case 'SET_LAYER_HEIGHT':  return { ...s, layerHeight: a.v }
    case 'SET_INFILL':        return { ...s, infill: a.v }
    case 'SET_SUPPORTS':      return { ...s, supports: a.v }
    case 'SET_PERIMETERS':    return { ...s, perimeters: a.v }
    case 'SET_SLICER_MODE':   return { ...s, slicerMode: a.v }
    case 'SET_MANUAL_GRAMS':  return { ...s, manualGrams: a.v }
    case 'SET_MANUAL_HOURS':  return { ...s, manualHours: a.v }
    case 'SET_MACHINE':  return { ...s, [a.field]: a.v }
    case 'SET_TIME':     return { ...s, [a.field]: a.v }
    case 'SET_MARGIN':   return { ...s, [a.field]: a.v }
    case 'SET_SHIPPING': return { ...s, [a.field]: a.v }
    case 'RESET':        return { ...initialState }
    default: return s
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CalculadoraPage() {
  const [s, dispatch] = useReducer(reducer, initialState)
  const [fileMode, setFileMode] = useState<'upload' | 'skip'>('upload')
  const dataReady = fileMode === 'skip' || !!s.volumeCm3

  useEffect(() => {
    try {
      const saved = localStorage.getItem('fill3d-prefs')
      if (!saved) return
      const p = JSON.parse(saved) as Record<string, number>
      const fields = ['pricePerGram','wattsPerHour','kwhPriceCOP','machineCostCOP','machineLifetimeHours','prepMinutes','postMinutes','hourlyRateCOP','failureRate','profitMargin']
      fields.forEach(f => { if (p[f] != null) dispatch({ type: 'SET_MACHINE', field: f, v: p[f] }) })
    } catch { /* ignore */ }
  }, [])

  useEffect(() => {
    try {
      const prefs = { pricePerGram: s.pricePerGram, wattsPerHour: s.wattsPerHour, kwhPriceCOP: s.kwhPriceCOP, machineCostCOP: s.machineCostCOP, machineLifetimeHours: s.machineLifetimeHours, prepMinutes: s.prepMinutes, postMinutes: s.postMinutes, hourlyRateCOP: s.hourlyRateCOP, failureRate: s.failureRate, profitMargin: s.profitMargin }
      localStorage.setItem('fill3d-prefs', JSON.stringify(prefs))
    } catch { /* ignore */ }
  }, [s.pricePerGram, s.wattsPerHour, s.kwhPriceCOP, s.machineCostCOP, s.machineLifetimeHours, s.prepMinutes, s.postMinutes, s.hourlyRateCOP, s.failureRate, s.profitMargin])

  const material = useMemo(() => getMaterial(s.materialId), [s.materialId])

  const [sliceResult, setSliceResult] = useState<SliceResult | null>(null)
  const [slicing, setSlicing] = useState(false)

  useEffect(() => {
    if (s.slicerMode !== 'estimate') { setSliceResult(null); return }
    if (s.stlBuffer) {
      setSlicing(true)
      const id = setTimeout(() => {
        try {
          const result = geometricSlice(s.stlBuffer!, {
            volumeCm3: s.volumeCm3 ?? 1,
            orientation: s.orientation,
            material,
            layerHeight: s.layerHeight,
            infill: s.infill,
            supports: s.supports,
            perimeters: s.perimeters,
          })
          setSliceResult(result)
        } catch (e) {
          console.error('geometricSlice error:', e)
          setSliceResult(null)
        } finally { setSlicing(false) }
      }, 20)
      return () => clearTimeout(id)
    }
    if (s.volumeCm3) {
      setSliceResult(estimateSlice({
        volumeCm3: s.volumeCm3,
        orientation: s.orientation,
        material,
        layerHeight: s.layerHeight,
        infill: s.infill,
        supports: s.supports,
        perimeters: s.perimeters,
      }))
    } else {
      setSliceResult(null)
    }
  }, [s.stlBuffer, s.volumeCm3, s.orientation, s.materialId, s.layerHeight, s.infill, s.supports, s.perimeters, s.slicerMode, material])

  const effectiveGrams = s.slicerMode === 'estimate' ? (sliceResult?.totalGrams ?? 0) : (parseFloat(s.manualGrams) || 0)
  const effectiveHours = s.slicerMode === 'estimate' ? (sliceResult?.printHours ?? 0) : (parseFloat(s.manualHours) || 0)

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

  const pendingBuffer = useRef<{ buf: ArrayBuffer; type: 'stl' | '3mf' } | null>(null)

  const handleExportPDF = async () => {
    if (!breakdown) return
    await exportToPDF({ fileName: s.fileName ?? 'modelo', materialName: material.name, layerHeight: s.layerHeight, infill: s.infill, supports: s.supports, grams: effectiveGrams, hours: effectiveHours, breakdown })
  }

  const handleExportExcel = async () => {
    if (!breakdown) return
    await exportToExcel({ fileName: s.fileName ?? 'modelo', materialName: material.name, layerHeight: s.layerHeight, infill: s.infill, supports: s.supports, grams: effectiveGrams, hours: effectiveHours, breakdown })
  }

  const handleSwitchFileMode = (mode: 'upload' | 'skip') => {
    setFileMode(mode)
    if (mode === 'skip') dispatch({ type: 'SET_SLICER_MODE', v: 'manual' })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/logo.svg" alt="Fill-3D" className="h-8 w-auto" />
            <span className="font-bold text-gray-900">Fill-3D</span>
            <span className="text-gray-400 text-sm hidden sm:inline">· Calculadora de Impresión</span>
          </div>
          {dataReady && (
            <button
              onClick={() => { dispatch({ type: 'RESET' }); setFileMode('upload') }}
              className="text-sm text-gray-500 hover:text-[#5E33D9] transition-colors cursor-pointer"
            >
              ↺ Nueva pieza
            </button>
          )}
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {s.error && (
          <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-start gap-2">
            <span>⚠️</span>
            <span className="flex-1">{s.error}</span>
            <button onClick={() => dispatch({ type: 'CLEAR_ERROR' })} className="text-red-400 hover:text-red-600 cursor-pointer">✕</button>
          </div>
        )}

        <Section step={1} title="Carga tu modelo 3D">
          <div className="flex gap-2 mb-4">
            {(['upload', 'skip'] as const).map(mode => (
              <button key={mode} onClick={() => handleSwitchFileMode(mode)}
                className={`flex-1 py-2 rounded-xl border-2 text-sm font-medium transition-all cursor-pointer
                  ${fileMode === mode ? 'border-[#5E33D9] bg-[#f5f3ff] text-[#4F25C6]' : 'border-gray-200 text-gray-600 hover:border-[#c4b5fd]'}`}
              >
                {mode === 'upload' ? '📁 Subir archivo STL / 3MF' : '✏️ Ingresar datos manualmente'}
              </button>
            ))}
          </div>
          {fileMode === 'upload' && !s.volumeCm3 && (
            <div>
              <p className="text-sm text-gray-500 mb-4">El archivo se procesa completamente en tu navegador — no se sube a ningún servidor.</p>
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
          )}
          {fileMode === 'upload' && s.volumeCm3 && (
            <div className="flex items-center gap-3 text-sm text-gray-700">
              <span className="text-green-500 text-xl">✓</span>
              <span className="font-medium">{s.fileName}</span>
              <span className="text-gray-400">·</span>
              <span className="text-gray-500">{s.volumeCm3.toFixed(2)} cm³</span>
              <button onClick={() => dispatch({ type: 'RESET' })} className="ml-auto text-xs text-gray-400 hover:text-[#5E33D9] underline cursor-pointer">Cambiar</button>
            </div>
          )}
          {fileMode === 'skip' && (
            <p className="text-sm text-gray-500">Ingresa los gramos y tiempo directamente en la sección de material y tiempo (desde tu slicer).</p>
          )}
        </Section>

        {fileMode === 'upload' && (
          <Section step={2} title="Orientación de impresión" isLocked={!s.volumeCm3}>
            <div className="grid md:grid-cols-2 gap-4">
              {s.stlBuffer && <ModelViewer buffer={s.stlBuffer} orientation={s.orientation} />}
              <OrientationSelector value={s.orientation} onChange={v => dispatch({ type: 'SET_ORIENTATION', v })} />
            </div>
          </Section>
        )}

        <Section step={fileMode === 'upload' ? 3 : 2} title="Configuración de impresión" isLocked={!dataReady}>
          <PrintConfig
            materialId={s.materialId} layerHeight={s.layerHeight} infill={s.infill}
            supports={s.supports} perimeters={s.perimeters}
            onMaterial={v => dispatch({ type: 'SET_MATERIAL', v })}
            onLayerHeight={v => dispatch({ type: 'SET_LAYER_HEIGHT', v })}
            onInfill={v => dispatch({ type: 'SET_INFILL', v })}
            onSupports={v => dispatch({ type: 'SET_SUPPORTS', v })}
            onPerimeters={v => dispatch({ type: 'SET_PERIMETERS', v })}
          />
        </Section>

        <Section step={fileMode === 'upload' ? 4 : 3} title="Material y tiempo" isLocked={!dataReady}>
          <SlicerSection
            mode={s.slicerMode} estimate={sliceResult} slicing={slicing}
            manualGrams={s.manualGrams} manualHours={s.manualHours} hasBuffer={!!s.stlBuffer}
            onMode={v => dispatch({ type: 'SET_SLICER_MODE', v })}
            onManualGrams={v => dispatch({ type: 'SET_MANUAL_GRAMS', v })}
            onManualHours={v => dispatch({ type: 'SET_MANUAL_HOURS', v })}
          />
        </Section>

        <Section step={fileMode === 'upload' ? 5 : 4} title="Costos de máquina" isLocked={!dataReady}>
          <MachineConfig
            materialId={s.materialId} pricePerGram={s.pricePerGram} wattsPerHour={s.wattsPerHour}
            kwhPriceCOP={s.kwhPriceCOP} machineCostCOP={s.machineCostCOP} machineLifetimeHours={s.machineLifetimeHours}
            onChange={(field, v) => dispatch({ type: 'SET_MACHINE', field, v })}
          />
        </Section>

        <Section step={fileMode === 'upload' ? 6 : 5} title="Tu tiempo" isLocked={!dataReady}>
          <TimeInput
            prepMinutes={s.prepMinutes} postMinutes={s.postMinutes} hourlyRateCOP={s.hourlyRateCOP}
            onChange={(field, v) => dispatch({ type: 'SET_TIME', field, v })}
          />
        </Section>

        <Section step={fileMode === 'upload' ? 7 : 6} title="Margen y tasa de fallo" isLocked={!dataReady}>
          <MarginInput failureRate={s.failureRate} profitMargin={s.profitMargin} onChange={(field, v) => dispatch({ type: 'SET_MARGIN', field, v })} />
        </Section>

        <Section step={fileMode === 'upload' ? 8 : 7} title="Envío, empaque e impuestos" isLocked={!dataReady}>
          <ShippingInput
            packagingEnabled={s.packagingEnabled} packagingCost={s.packagingCost}
            shippingCost={s.shippingCost} taxEnabled={s.taxEnabled} taxPercent={s.taxPercent}
            onChange={(field, v) => dispatch({ type: 'SET_SHIPPING', field, v })}
          />
        </Section>

        {breakdown && (
          <Section step={fileMode === 'upload' ? 9 : 8} title="Resumen y precio final">
            <FinalSummary breakdown={breakdown} grams={effectiveGrams} hours={effectiveHours} onExportPDF={handleExportPDF} onExportExcel={handleExportExcel} />
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

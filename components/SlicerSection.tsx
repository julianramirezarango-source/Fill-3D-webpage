import type { SliceResult } from '@/lib/slicerEstimate'

function formatHours(h: number): string {
  const hh = Math.floor(h)
  const mm = Math.round((h - hh) * 60)
  if (hh === 0) return `${mm} min`
  if (mm === 0) return `${hh} h`
  return `${hh} h ${mm} min`
}

interface Props {
  mode: 'estimate' | 'manual'
  estimate: SliceResult | null
  manualGrams: string
  manualHours: string
  onMode: (m: 'estimate' | 'manual') => void
  onManualGrams: (v: string) => void
  onManualHours: (v: string) => void
}

export function SlicerSection({
  mode, estimate, manualGrams, manualHours,
  onMode, onManualGrams, onManualHours,
}: Props) {
  return (
    <div className="space-y-4">
      {/* Toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => onMode('estimate')}
          className={`flex-1 py-2 rounded-xl border-2 text-sm font-medium transition-all cursor-pointer
            ${mode === 'estimate'
              ? 'border-orange-500 bg-orange-50 text-orange-700'
              : 'border-gray-200 text-gray-600 hover:border-orange-300'
            }`}
        >
          Usar estimador
        </button>
        <button
          onClick={() => onMode('manual')}
          className={`flex-1 py-2 rounded-xl border-2 text-sm font-medium transition-all cursor-pointer
            ${mode === 'manual'
              ? 'border-orange-500 bg-orange-50 text-orange-700'
              : 'border-gray-200 text-gray-600 hover:border-orange-300'
            }`}
        >
          Ingresar manualmente
        </button>
      </div>

      {mode === 'estimate' && estimate && (
        <div className="bg-gray-50 rounded-xl p-4 space-y-3">
          <p className="text-xs text-gray-400 italic">Estimación matemática basada en geometría del modelo (sin OrcaSlicer)</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-lg p-3 border border-gray-200 text-center">
              <p className="text-2xl font-bold text-orange-600">{estimate.totalGrams.toFixed(1)} g</p>
              <p className="text-xs text-gray-500 mt-1">Filamento total</p>
            </div>
            <div className="bg-white rounded-lg p-3 border border-gray-200 text-center">
              <p className="text-2xl font-bold text-orange-600">{formatHours(estimate.printHours)}</p>
              <p className="text-xs text-gray-500 mt-1">Tiempo de impresión</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs text-gray-500 text-center">
            <div>
              <span className="font-medium text-gray-700">{estimate.shellGrams.toFixed(1)} g</span>
              <br />Paredes
            </div>
            <div>
              <span className="font-medium text-gray-700">{estimate.infillGrams.toFixed(1)} g</span>
              <br />Relleno
            </div>
            <div>
              <span className="font-medium text-gray-700">{estimate.supportGrams.toFixed(1)} g</span>
              <br />Soportes
            </div>
          </div>
        </div>
      )}

      {mode === 'manual' && (
        <div className="space-y-3">
          <p className="text-sm text-gray-500">Ingresa los valores exactos de tu slicer (OrcaSlicer, Cura, etc.)</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Gramos de filamento</label>
              <div className="relative">
                <input
                  type="number" min={0} step={0.1} value={manualGrams}
                  onChange={e => onManualGrams(e.target.value)}
                  placeholder="45.3"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm pr-8 focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
                <span className="absolute right-3 top-2 text-xs text-gray-400">g</span>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Tiempo de impresión (horas)</label>
              <div className="relative">
                <input
                  type="number" min={0} step={0.1} value={manualHours}
                  onChange={e => onManualHours(e.target.value)}
                  placeholder="2.5"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm pr-8 focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
                <span className="absolute right-3 top-2 text-xs text-gray-400">h</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

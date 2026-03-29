import { MATERIALS } from '@/lib/materials'

const LAYER_HEIGHTS = [0.15, 0.2, 0.3] as const
const INFILL_PRESETS = [15, 20, 40, 80]
const PERIMETERS = [2, 3, 4] as const

interface Props {
  materialId: string
  layerHeight: 0.15 | 0.2 | 0.3
  infill: number
  supports: boolean
  perimeters: 2 | 3 | 4
  onMaterial: (id: string) => void
  onLayerHeight: (h: 0.15 | 0.2 | 0.3) => void
  onInfill: (v: number) => void
  onSupports: (v: boolean) => void
  onPerimeters: (v: 2 | 3 | 4) => void
}

export function PrintConfig({
  materialId, layerHeight, infill, supports, perimeters,
  onMaterial, onLayerHeight, onInfill, onSupports, onPerimeters,
}: Props) {
  return (
    <div className="space-y-6">
      {/* Material */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Material</label>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {MATERIALS.map(m => (
            <button
              key={m.id}
              onClick={() => onMaterial(m.id)}
              title={m.description}
              className={`flex flex-col items-center gap-1 p-2 rounded-xl border-2 transition-all cursor-pointer
                ${materialId === m.id
                  ? 'border-[#5E33D9] bg-[#f5f3ff]'
                  : 'border-gray-200 hover:border-gray-300'
                }`}
            >
              <span className="w-5 h-5 rounded-full border border-white shadow" style={{ background: m.color }} />
              <span className="text-xs font-semibold text-gray-700">{m.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Layer height */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Altura de capa</label>
        <div className="flex gap-2">
          {LAYER_HEIGHTS.map(h => (
            <button
              key={h}
              onClick={() => onLayerHeight(h)}
              className={`flex-1 py-2 rounded-xl border-2 text-sm font-medium transition-all cursor-pointer
                ${layerHeight === h
                  ? 'border-[#5E33D9] bg-[#f5f3ff] text-[#4F25C6]'
                  : 'border-gray-200 text-gray-600 hover:border-[#c4b5fd]'
                }`}
            >
              {h} mm
            </button>
          ))}
        </div>
      </div>

      {/* Infill */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="text-sm font-semibold text-gray-700">Relleno (infill)</label>
          <span className="text-sm font-bold text-[#5E33D9]">{infill}%</span>
        </div>
        <div className="flex gap-2 mb-2">
          {INFILL_PRESETS.map(p => (
            <button
              key={p}
              onClick={() => onInfill(p)}
              className={`px-3 py-1 rounded-lg text-xs font-medium border transition-all cursor-pointer
                ${infill === p
                  ? 'border-[#5E33D9] bg-[#f5f3ff] text-[#4F25C6]'
                  : 'border-gray-200 text-gray-500 hover:border-[#c4b5fd]'
                }`}
            >
              {p}%
            </button>
          ))}
        </div>
        <input
          type="range" min={10} max={100} step={5} value={infill}
          onChange={e => onInfill(Number(e.target.value))}
          className="w-full accent-[#5E33D9]"
        />
      </div>

      {/* Supports + Perimeters */}
      <div className="flex flex-wrap gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Soportes</label>
          <div className="flex gap-2">
            {[false, true].map(v => (
              <button
                key={String(v)}
                onClick={() => onSupports(v)}
                className={`px-4 py-2 rounded-xl border-2 text-sm font-medium transition-all cursor-pointer
                  ${supports === v
                    ? 'border-[#5E33D9] bg-[#f5f3ff] text-[#4F25C6]'
                    : 'border-gray-200 text-gray-600 hover:border-[#c4b5fd]'
                  }`}
              >
                {v ? 'Sí' : 'No'}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Perímetros (paredes)</label>
          <div className="flex gap-2">
            {PERIMETERS.map(p => (
              <button
                key={p}
                onClick={() => onPerimeters(p)}
                className={`w-10 py-2 rounded-xl border-2 text-sm font-medium transition-all cursor-pointer
                  ${perimeters === p
                    ? 'border-[#5E33D9] bg-[#f5f3ff] text-[#4F25C6]'
                    : 'border-gray-200 text-gray-600 hover:border-[#c4b5fd]'
                  }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

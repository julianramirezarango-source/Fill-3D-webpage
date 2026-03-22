import type { Orientation } from '@/lib/slicerEstimate'

interface Option {
  value: Orientation
  label: string
  icon: string
  sub: string
}

const OPTIONS: Option[] = [
  { value: 'z-', label: 'Normal',      icon: '⬆️', sub: 'Base abajo' },
  { value: 'z+', label: 'Invertido',   icon: '⬇️', sub: 'Techo abajo' },
  { value: 'y+', label: 'Frente',      icon: '⬅️', sub: 'Frente abajo' },
  { value: 'y-', label: 'Atrás',       icon: '➡️', sub: 'Atrás abajo' },
  { value: 'x+', label: 'Derecha',     icon: '🔄', sub: 'Derecha abajo' },
  { value: 'x-', label: 'Izquierda',   icon: '🔄', sub: 'Izquierda abajo' },
]

interface Props {
  value: Orientation
  onChange: (o: Orientation) => void
}

export function OrientationSelector({ value, onChange }: Props) {
  return (
    <div>
      <p className="text-sm text-gray-500 mb-3">¿Qué cara queda sobre la placa de impresión?</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {OPTIONS.map(opt => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 text-sm font-medium transition-all cursor-pointer
              ${value === opt.value
                ? 'border-orange-500 bg-orange-50 text-orange-700'
                : 'border-gray-200 bg-white text-gray-600 hover:border-orange-300 hover:bg-orange-50/40'
              }`}
          >
            <span className="text-xl">{opt.icon}</span>
            <span className="font-semibold">{opt.label}</span>
            <span className="text-xs text-gray-400 font-normal">{opt.sub}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

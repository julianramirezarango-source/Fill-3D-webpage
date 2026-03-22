interface Props {
  prepMinutes: number
  postMinutes: number
  hourlyRateCOP: number
  onChange: (field: string, value: number) => void
}

function SliderInput({ label, value, min, max, step, unit, onChange }: {
  label: string; value: number; min: number; max: number; step: number; unit: string
  onChange: (v: number) => void
}) {
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <label className="text-sm font-semibold text-gray-700">{label}</label>
        <span className="text-sm font-bold text-[#5E33D9]">{value} {unit}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full accent-[#5E33D9]"
      />
      <div className="flex justify-between text-xs text-gray-400 mt-0.5">
        <span>{min} {unit}</span>
        <span>{max} {unit}</span>
      </div>
    </div>
  )
}

export function TimeInput({ prepMinutes, postMinutes, hourlyRateCOP, onChange }: Props) {
  return (
    <div className="space-y-5">
      <SliderInput
        label="Preparación (nivelado, ajustes, inicio)"
        value={prepMinutes} min={0} max={120} step={5} unit="min"
        onChange={v => onChange('prepMinutes', v)}
      />
      <SliderInput
        label="Post-procesado (limpieza, soportes, pintura)"
        value={postMinutes} min={0} max={120} step={5} unit="min"
        onChange={v => onChange('postMinutes', v)}
      />
      <div>
        <div className="flex justify-between items-center mb-1">
          <label className="text-sm font-semibold text-gray-700">Tu tarifa por hora</label>
          <span className="text-sm font-bold text-[#5E33D9]">
            {new Intl.NumberFormat('es-CO').format(hourlyRateCOP)} COP/h
          </span>
        </div>
        <input
          type="number" min={0} step={1000} value={hourlyRateCOP}
          onChange={e => onChange('hourlyRateCOP', Number(e.target.value))}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#5E33D9]"
        />
      </div>
    </div>
  )
}

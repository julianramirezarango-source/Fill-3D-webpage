interface Props {
  failureRate: number
  profitMargin: number
  onChange: (field: string, value: number) => void
}

function PercentSlider({ label, hint, value, max, onChange }: {
  label: string; hint: string; value: number; max: number; onChange: (v: number) => void
}) {
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <div>
          <span className="text-sm font-semibold text-gray-700">{label}</span>
          <p className="text-xs text-gray-400">{hint}</p>
        </div>
        <span className="text-lg font-bold text-[#5E33D9] ml-2">{value}%</span>
      </div>
      <input
        type="range" min={0} max={max} step={1} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full accent-[#5E33D9]"
      />
      <div className="flex justify-between text-xs text-gray-400 mt-0.5">
        <span>0%</span>
        <span>{max}%</span>
      </div>
    </div>
  )
}

export function MarginInput({ failureRate, profitMargin, onChange }: Props) {
  return (
    <div className="space-y-6">
      <PercentSlider
        label="Tasa de fallo"
        hint="% del costo que cubres por impresiones fallidas"
        value={failureRate} max={30}
        onChange={v => onChange('failureRate', v)}
      />
      <PercentSlider
        label="Margen de ganancia"
        hint="% de beneficio sobre el costo total"
        value={profitMargin} max={200}
        onChange={v => onChange('profitMargin', v)}
      />
    </div>
  )
}

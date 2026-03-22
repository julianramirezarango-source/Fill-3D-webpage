import { getMaterial } from '@/lib/materials'

interface Props {
  materialId: string
  pricePerGram: number
  wattsPerHour: number
  kwhPriceCOP: number
  machineCostCOP: number
  machineLifetimeHours: number
  onChange: (field: string, value: number) => void
}

function NumInput({ label, value, onChange, min, step, suffix }: {
  label: string; value: number; onChange: (v: number) => void
  min?: number; step?: number; suffix?: string
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-1">{label}</label>
      <div className="relative">
        <input
          type="number" min={min ?? 0} step={step ?? 1} value={value}
          onChange={e => onChange(Number(e.target.value))}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5E33D9]"
        />
        {suffix && <span className="absolute right-3 top-2 text-xs text-gray-400">{suffix}</span>}
      </div>
    </div>
  )
}

export function MachineConfig({ materialId, pricePerGram, wattsPerHour, kwhPriceCOP, machineCostCOP, machineLifetimeHours, onChange }: Props) {
  const mat = getMaterial(materialId)
  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-400">Ajusta estos valores a tu configuración real. Se guardan para la próxima vez.</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <NumInput
          label={`Precio filamento ${mat.name} (COP/g)`}
          value={pricePerGram} step={5}
          onChange={v => onChange('pricePerGram', v)}
          suffix="COP/g"
        />
        <NumInput
          label="Consumo impresora (W)"
          value={wattsPerHour} step={10}
          onChange={v => onChange('wattsPerHour', v)}
          suffix="W"
        />
        <NumInput
          label="Tarifa kWh (COP)"
          value={kwhPriceCOP} step={50}
          onChange={v => onChange('kwhPriceCOP', v)}
          suffix="COP"
        />
        <NumInput
          label="Costo impresora (COP)"
          value={machineCostCOP} step={100000}
          onChange={v => onChange('machineCostCOP', v)}
          suffix="COP"
        />
        <NumInput
          label="Vida útil estimada (horas)"
          value={machineLifetimeHours} step={100}
          onChange={v => onChange('machineLifetimeHours', v)}
          suffix="h"
        />
      </div>
    </div>
  )
}

interface Props {
  packagingEnabled: boolean
  packagingCost: number
  shippingCost: number
  taxEnabled: boolean
  taxPercent: number
  onChange: (field: string, value: number | boolean) => void
}

export function ShippingInput({ packagingEnabled, packagingCost, shippingCost, taxEnabled, taxPercent, onChange }: Props) {
  return (
    <div className="space-y-4">
      {/* Packaging */}
      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox" checked={packagingEnabled}
            onChange={e => onChange('packagingEnabled', e.target.checked)}
            className="w-4 h-4 accent-[#5E33D9]"
          />
          <span className="text-sm font-semibold text-gray-700">Empaque</span>
        </label>
        {packagingEnabled && (
          <div className="relative flex-1 max-w-xs">
            <input
              type="number" min={0} step={500} value={packagingCost}
              onChange={e => onChange('packagingCost', Number(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5E33D9]"
            />
            <span className="absolute right-3 top-2 text-xs text-gray-400">COP</span>
          </div>
        )}
      </div>

      {/* Shipping */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Costo de envío (COP)</label>
        <div className="relative max-w-xs">
          <input
            type="number" min={0} step={1000} value={shippingCost}
            onChange={e => onChange('shippingCost', Number(e.target.value))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5E33D9]"
          />
          <span className="absolute right-3 top-2 text-xs text-gray-400">COP</span>
        </div>
      </div>

      {/* Tax */}
      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox" checked={taxEnabled}
            onChange={e => onChange('taxEnabled', e.target.checked)}
            className="w-4 h-4 accent-[#5E33D9]"
          />
          <span className="text-sm font-semibold text-gray-700">Impuestos / IVA</span>
        </label>
        {taxEnabled && (
          <div className="flex items-center gap-2">
            <div className="relative w-24">
              <input
                type="number" min={0} max={100} step={1} value={taxPercent}
                onChange={e => onChange('taxPercent', Number(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5E33D9]"
              />
              <span className="absolute right-3 top-2 text-xs text-gray-400">%</span>
            </div>
            <span className="text-xs text-gray-400">(IVA Colombia = 19%)</span>
          </div>
        )}
      </div>
    </div>
  )
}

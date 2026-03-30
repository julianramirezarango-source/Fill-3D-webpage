import { PriceBreakdown, formatCOP } from '@/lib/fullPriceCalc'

interface RowProps { label: string; value: number; bold?: boolean; indent?: boolean }

function Row({ label, value, bold, indent }: RowProps) {
  return (
    <div className={`flex justify-between py-1.5 ${indent ? 'pl-4' : ''} ${bold ? 'font-semibold' : ''}`}>
      <span className={`text-sm ${bold ? 'text-gray-800' : 'text-gray-600'}`}>{label}</span>
      <span className={`text-sm font-mono ${bold ? 'text-gray-900' : 'text-gray-700'}`}>{formatCOP(value)}</span>
    </div>
  )
}

function Divider() {
  return <div className="border-t border-gray-200 my-1" />
}

interface Props {
  breakdown: PriceBreakdown
  grams: number
  hours: number
  onExportPDF: () => void
  onExportExcel: () => void
}

function formatHours(h: number): string {
  const hh = Math.floor(h)
  const mm = Math.round((h - hh) * 60)
  if (hh === 0) return `${mm} min`
  if (mm === 0) return `${hh} h`
  return `${hh} h ${mm} min`
}

export function FinalSummary({ breakdown, grams, hours, onExportPDF, onExportExcel }: Props) {
  return (
    <div className="space-y-4">
      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-[#f5f3ff] rounded-xl p-3 text-center">
          <p className="text-xl font-bold text-[#5E33D9]">{grams.toFixed(1)} g</p>
          <p className="text-xs text-gray-500 mt-0.5">Filamento</p>
        </div>
        <div className="bg-[#f5f3ff] rounded-xl p-3 text-center">
          <p className="text-xl font-bold text-[#5E33D9]">{formatHours(hours)}</p>
          <p className="text-xs text-gray-500 mt-0.5">Impresión</p>
        </div>
        <div className="bg-[#f5f3ff] rounded-xl p-3 text-center">
          <p className="text-xl font-bold text-[#5E33D9]">{formatCOP(breakdown.pricePerGram)}</p>
          <p className="text-xs text-gray-500 mt-0.5">Precio/gramo</p>
        </div>
      </div>

      {/* Breakdown */}
      <div className="bg-gray-50 rounded-xl p-4">
        <Row label="Filamento"           value={breakdown.filamentCost}      indent />
        <Row label="Energía eléctrica"   value={breakdown.energyCost}        indent />
        <Row label="Depreciación máquina" value={breakdown.depreciationCost} indent />
        <Divider />
        <Row label="Subtotal material + máquina" value={breakdown.subtotalMachine} bold />

        <div className="mt-2" />
        <Row label="Tu tiempo (prep + post + impresión)" value={breakdown.timeCost} indent />
        <Divider />
        <Row label="Subtotal antes de fallo"  value={breakdown.subtotalMachine + breakdown.timeCost} bold />

        <div className="mt-2" />
        <Row label="Tasa de fallo"       value={breakdown.failureCost}       indent />
        <Divider />
        <Row label="Subtotal de costos"  value={breakdown.subtotalCost}      bold />

        <div className="mt-2" />
        <Row label="Margen de ganancia"  value={breakdown.marginAmount}      indent />
        <Divider />
        <Row label="Subtotal con margen" value={breakdown.subtotalWithMargin} bold />

        {(breakdown.packagingCost > 0 || breakdown.shippingCost > 0 || breakdown.taxAmount > 0) && (
          <>
            <div className="mt-2" />
            {breakdown.packagingCost > 0 && <Row label="Empaque"   value={breakdown.packagingCost} indent />}
            {breakdown.shippingCost  > 0 && <Row label="Envío"     value={breakdown.shippingCost}  indent />}
            {breakdown.taxAmount     > 0 && <Row label="Impuestos" value={breakdown.taxAmount}     indent />}
          </>
        )}
      </div>

      {/* Total */}
      <div className="bg-gray-900 rounded-xl px-5 py-4 flex justify-between items-center">
        <span className="text-white font-semibold text-lg">Precio final sugerido</span>
        <span className="text-[#7c5ce1] font-bold text-2xl font-mono">{formatCOP(breakdown.total)}</span>
      </div>

      {/* Export */}
      <div className="flex gap-3">
        <button
          onClick={onExportPDF}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold transition-colors cursor-pointer"
        >
          <span>📄</span> Exportar PDF
        </button>
        <button
          onClick={onExportExcel}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold transition-colors cursor-pointer"
        >
          <span>📊</span> Exportar Excel
        </button>
      </div>

      <p className="text-xs text-gray-400 text-center">
        Cotización estimada · Los precios finales pueden variar según condiciones reales de impresión.
      </p>
    </div>
  )
}

'use client';

import { PriceBreakdown, formatCOP } from '@/lib/calculatePrice';
import { Material, Quality } from '@/lib/materials';

interface PriceResultProps {
  breakdown: PriceBreakdown;
  material: Material;
  quality: Quality;
  fileName: string;
}

function Row({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`flex justify-between items-center py-2 ${highlight ? 'font-bold text-gray-900' : 'text-gray-600'}`}>
      <span className="text-sm">{label}</span>
      <span className={`font-mono ${highlight ? 'text-lg text-orange-600' : 'text-sm'}`}>{value}</span>
    </div>
  );
}

export default function PriceResult({ breakdown, material, quality, fileName }: PriceResultProps) {
  return (
    <div className="bg-white rounded-2xl border-2 border-orange-500 shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-orange-500 px-6 py-4">
        <h3 className="text-white font-bold text-lg">Cotización estimada</h3>
        <p className="text-orange-100 text-sm truncate">{fileName}</p>
      </div>

      {/* Model info */}
      <div className="px-6 pt-4 pb-2 border-b border-gray-100">
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="px-2 py-1 bg-gray-100 rounded-full">
            <span className="text-gray-500">Material: </span>
            <span className="font-semibold" style={{ color: material.color }}>{material.name}</span>
          </span>
          <span className="px-2 py-1 bg-gray-100 rounded-full">
            <span className="text-gray-500">Calidad: </span>
            <span className="font-semibold text-gray-700">{quality.name}</span>
          </span>
          <span className="px-2 py-1 bg-gray-100 rounded-full">
            <span className="text-gray-500">Volumen: </span>
            <span className="font-semibold text-gray-700">{breakdown.volumeCm3} cm³</span>
          </span>
          <span className="px-2 py-1 bg-gray-100 rounded-full">
            <span className="text-gray-500">Peso: </span>
            <span className="font-semibold text-gray-700">{breakdown.weightGrams} g</span>
          </span>
        </div>
      </div>

      {/* Cost breakdown */}
      <div className="px-6 py-4 divide-y divide-gray-100">
        <Row
          label={`Material (${breakdown.weightGrams} g × $${material.pricePerGram}/g)`}
          value={formatCOP(breakdown.materialCost)}
        />
        <Row
          label={`Tiempo de impresión (~${breakdown.hoursEstimated} h)`}
          value={formatCOP(breakdown.timeCost)}
        />
        <div className="pt-3 mt-1">
          <Row
            label="PRECIO TOTAL ESTIMADO"
            value={formatCOP(breakdown.total)}
            highlight
          />
        </div>
      </div>

      {/* Disclaimer */}
      <div className="px-6 pb-5">
        <p className="text-xs text-gray-400 leading-relaxed">
          * Precio estimado. El valor final puede variar según geometría, porcentaje de relleno,
          soportes y acabados adicionales. Contáctanos para una cotización exacta.
        </p>
        <a
          href="https://fill-3d.com"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 block w-full text-center bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-xl transition-colors"
        >
          Solicitar cotización exacta →
        </a>
      </div>
    </div>
  );
}

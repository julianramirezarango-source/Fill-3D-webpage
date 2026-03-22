'use client';

import { Material, MATERIALS } from '@/lib/materials';

interface MaterialSelectorProps {
  selected: Material;
  onChange: (material: Material) => void;
}

export default function MaterialSelector({ selected, onChange }: MaterialSelectorProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {MATERIALS.map((material) => {
        const isSelected = material.id === selected.id;
        return (
          <button
            key={material.id}
            onClick={() => onChange(material)}
            className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all text-left
              ${isSelected
                ? 'border-orange-500 bg-orange-50 shadow-md'
                : 'border-gray-200 bg-white hover:border-orange-300 hover:bg-orange-50'
              }`}
          >
            {/* Color swatch */}
            <div
              className="w-8 h-8 rounded-full border-2 border-white shadow"
              style={{ backgroundColor: material.color }}
            />
            <span className="font-bold text-gray-800 text-sm">{material.name}</span>
            <span className="text-xs text-gray-500 text-center leading-tight">
              {material.description}
            </span>
            <span
              className="mt-auto text-xs font-semibold px-2 py-1 rounded-full"
              style={{
                backgroundColor: isSelected ? material.color + '33' : '#f3f4f6',
                color: isSelected ? material.color : '#6b7280',
              }}
            >
              ${material.pricePerGram}/g
            </span>
          </button>
        );
      })}
    </div>
  );
}

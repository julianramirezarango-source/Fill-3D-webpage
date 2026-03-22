'use client';

import { Quality, QUALITIES } from '@/lib/materials';

interface QualitySelectorProps {
  selected: Quality;
  onChange: (quality: Quality) => void;
}

const icons: Record<string, string> = {
  draft: '⚡',
  standard: '⚙️',
  fine: '💎',
};

export default function QualitySelector({ selected, onChange }: QualitySelectorProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {QUALITIES.map((quality) => {
        const isSelected = quality.id === selected.id;
        return (
          <button
            key={quality.id}
            onClick={() => onChange(quality)}
            className={`flex flex-col gap-1 p-4 rounded-xl border-2 transition-all text-left
              ${isSelected
                ? 'border-orange-500 bg-orange-50 shadow-md'
                : 'border-gray-200 bg-white hover:border-orange-300 hover:bg-orange-50'
              }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-2xl">{icons[quality.id]}</span>
              <span className="font-bold text-gray-800">{quality.name}</span>
            </div>
            <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-0.5 rounded w-fit">
              Capa: {quality.layerHeight}
            </span>
            <p className="text-sm text-gray-600 leading-snug mt-1">
              {quality.description}
            </p>
          </button>
        );
      })}
    </div>
  );
}

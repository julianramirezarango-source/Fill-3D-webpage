'use client';

import { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import FileUpload from '@/components/FileUpload';
import MaterialSelector from '@/components/MaterialSelector';
import QualitySelector from '@/components/QualitySelector';
import PriceResult from '@/components/PriceResult';
import { MATERIALS, QUALITIES, Material, Quality } from '@/lib/materials';
import { calculatePrice, PriceBreakdown } from '@/lib/calculatePrice';

// Three.js viewer — client-side only (uses browser APIs)
const ModelViewer = dynamic(() => import('@/components/ModelViewer'), { ssr: false });

type Step = 'upload' | 'material' | 'quality' | 'result';

function StepIndicator({ current }: { current: Step }) {
  const steps: { id: Step; label: string; icon: string }[] = [
    { id: 'upload', label: 'Archivo', icon: '📁' },
    { id: 'material', label: 'Material', icon: '🧱' },
    { id: 'quality', label: 'Calidad', icon: '⚙️' },
    { id: 'result', label: 'Precio', icon: '💰' },
  ];
  const order: Step[] = ['upload', 'material', 'quality', 'result'];
  const currentIdx = order.indexOf(current);

  return (
    <div className="flex items-center justify-center gap-0 mb-8 overflow-x-auto">
      {steps.map((step, i) => {
        const done = i < currentIdx;
        const active = i === currentIdx;
        return (
          <div key={step.id} className="flex items-center">
            <div
              className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap
                ${active ? 'bg-orange-500 text-white shadow-md' : done ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}
            >
              <span>{done ? '✓' : step.icon}</span>
              <span className="hidden sm:inline">{step.label}</span>
            </div>
            {i < steps.length - 1 && (
              <div className={`h-0.5 w-6 mx-1 ${i < currentIdx ? 'bg-green-400' : 'bg-gray-200'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function CalculadoraPage() {
  const [step, setStep] = useState<Step>('upload');
  const [volumeCm3, setVolumeCm3] = useState<number | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [stlBuffer, setStlBuffer] = useState<ArrayBuffer | null>(null);
  const [material, setMaterial] = useState<Material>(MATERIALS[0]);
  const [quality, setQuality] = useState<Quality>(QUALITIES[1]);
  const [breakdown, setBreakdown] = useState<PriceBreakdown | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleVolumeParsed = useCallback((vol: number, name: string) => {
    setVolumeCm3(vol);
    setFileName(name);
    setError(null);
    setStep('material');
  }, []);

  const handleBufferReady = useCallback((buffer: ArrayBuffer, fileType: 'stl' | '3mf') => {
    if (fileType === 'stl') {
      setStlBuffer(buffer);
    } else {
      setStlBuffer(null); // 3MF: no viewer yet
    }
  }, []);

  const handleError = useCallback((msg: string) => {
    setError(msg);
  }, []);

  const handleQualityNext = () => {
    if (volumeCm3 !== null) {
      const result = calculatePrice(volumeCm3, material, quality);
      setBreakdown(result);
      setStep('result');
    }
  };

  const handleReset = () => {
    setStep('upload');
    setVolumeCm3(null);
    setFileName('');
    setStlBuffer(null);
    setMaterial(MATERIALS[0]);
    setQuality(QUALITIES[1]);
    setBreakdown(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🖨️</span>
            <span className="font-bold text-gray-900">Fill-3D</span>
            <span className="text-gray-400 text-sm hidden sm:inline">· Calculadora de Impresión</span>
          </div>
          {step !== 'upload' && (
            <button
              onClick={handleReset}
              className="text-sm text-gray-500 hover:text-orange-500 transition-colors"
            >
              ↺ Reiniciar
            </button>
          )}
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <StepIndicator current={step} />

        {/* Error banner */}
        {error && (
          <div className="mb-6 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-start gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Step 1: File Upload */}
        {step === 'upload' && (
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Sube tu modelo 3D
            </h2>
            <p className="text-gray-500 mb-6">
              Acepta archivos <span className="font-mono">.STL</span> y{' '}
              <span className="font-mono">.3MF</span>. El archivo se procesa
              completamente en tu navegador — no se sube a ningún servidor.
            </p>
            <FileUpload
              onVolumeParsed={handleVolumeParsed}
              onBufferReady={handleBufferReady}
              onError={handleError}
            />
          </section>
        )}

        {/* Step 2: Material — show viewer + selector */}
        {step === 'material' && (
          <section className="flex flex-col gap-6">
            {/* 3D preview */}
            {stlBuffer ? (
              <div>
                <p className="text-sm font-medium text-gray-500 mb-2">Vista previa del modelo</p>
                <ModelViewer buffer={stlBuffer} />
              </div>
            ) : (
              <div className="flex items-center gap-2 px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-700 text-sm">
                <span>ℹ️</span>
                <span>Vista previa disponible solo para archivos .STL</span>
              </div>
            )}

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Selecciona el material
              </h2>
              <p className="text-gray-500 mb-4">
                Cada material tiene diferentes propiedades mecánicas y precio.
              </p>
              <MaterialSelector selected={material} onChange={setMaterial} />
            </div>

            <button
              onClick={() => setStep('quality')}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition-colors"
            >
              Continuar →
            </button>
          </section>
        )}

        {/* Step 3: Quality — show viewer + selector */}
        {step === 'quality' && (
          <section className="flex flex-col gap-6">
            {stlBuffer && (
              <div>
                <p className="text-sm font-medium text-gray-500 mb-2">Vista previa del modelo</p>
                <ModelViewer buffer={stlBuffer} />
              </div>
            )}

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Selecciona la calidad
              </h2>
              <p className="text-gray-500 mb-4">
                Mayor calidad = capas más delgadas = más tiempo de impresión.
              </p>
              <QualitySelector selected={quality} onChange={setQuality} />
            </div>

            <button
              onClick={handleQualityNext}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition-colors"
            >
              Ver precio →
            </button>
          </section>
        )}

        {/* Step 4: Result */}
        {step === 'result' && breakdown && (
          <section className="flex flex-col gap-4">
            {stlBuffer && (
              <div>
                <p className="text-sm font-medium text-gray-500 mb-2">Tu modelo</p>
                <ModelViewer buffer={stlBuffer} />
              </div>
            )}

            <h2 className="text-2xl font-bold text-gray-900">
              Tu cotización
            </h2>
            <PriceResult
              breakdown={breakdown}
              material={material}
              quality={quality}
              fileName={fileName}
            />
            <button
              onClick={handleReset}
              className="w-full border-2 border-gray-200 hover:border-orange-400 text-gray-600 hover:text-orange-600 font-semibold py-3 rounded-xl transition-colors"
            >
              ↺ Calcular otra pieza
            </button>
          </section>
        )}
      </main>

      <footer className="text-center py-8 text-xs text-gray-400">
        © {new Date().getFullYear()} Fill-3D · Colombia ·{' '}
        <a href="https://fill-3d.com" className="hover:underline">fill-3d.com</a>
      </footer>
    </div>
  );
}

'use client';

import React, { useCallback, useState } from 'react';
import { parseSTL } from '@/lib/parseSTL';
import { parse3MF } from '@/lib/parse3MF';

interface FileUploadProps {
  onVolumeParsed: (volumeCm3: number, fileName: string) => void;
  onBufferReady?: (buffer: ArrayBuffer, fileType: 'stl' | '3mf') => void;
  onError: (message: string) => void;
}

export default function FileUpload({ onVolumeParsed, onBufferReady, onError }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const processFile = useCallback(
    async (file: File) => {
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (ext !== 'stl' && ext !== '3mf') {
        onError('Solo se aceptan archivos .STL o .3MF');
        return;
      }

      setIsLoading(true);
      setFileName(file.name);

      try {
        const buffer = await file.arrayBuffer();
        let volume: number;

        if (ext === 'stl') {
          volume = await parseSTL(buffer);
          onBufferReady?.(buffer, 'stl');
        } else {
          volume = await parse3MF(buffer);
          // 3MF viewer not supported yet
          onBufferReady?.(buffer, '3mf');
        }

        if (volume <= 0) {
          throw new Error('No se pudo calcular el volumen del modelo');
        }

        onVolumeParsed(volume, file.name);
      } catch (err) {
        onError(
          err instanceof Error
            ? err.message
            : 'Error al procesar el archivo. Verifica que sea un STL o 3MF válido.'
        );
        setFileName(null);
      } finally {
        setIsLoading(false);
      }
    },
    [onVolumeParsed, onBufferReady, onError]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer
        ${isDragging
          ? 'border-orange-500 bg-orange-50'
          : fileName
            ? 'border-green-500 bg-green-50'
            : 'border-gray-300 bg-gray-50 hover:border-orange-400 hover:bg-orange-50'
        }`}
    >
      <input
        type="file"
        accept=".stl,.3mf"
        onChange={handleFileChange}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        aria-label="Subir archivo STL o 3MF"
      />

      {isLoading ? (
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-600 font-medium">Analizando modelo 3D...</p>
        </div>
      ) : fileName ? (
        <div className="flex flex-col items-center gap-3">
          <div className="text-4xl">✅</div>
          <p className="font-semibold text-green-700">{fileName}</p>
          <p className="text-sm text-gray-500">Haz clic para cambiar el archivo</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3">
          <div className="text-5xl">📁</div>
          <p className="font-semibold text-gray-700 text-lg">
            Arrastra tu archivo aquí
          </p>
          <p className="text-gray-500">o haz clic para seleccionarlo</p>
          <span className="mt-1 px-3 py-1 bg-gray-200 text-gray-600 rounded-full text-sm font-mono">
            .STL &nbsp;|&nbsp; .3MF
          </span>
        </div>
      )}
    </div>
  );
}

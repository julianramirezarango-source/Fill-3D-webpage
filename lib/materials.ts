// ============================================================
// CONFIGURACIÓN DE MATERIALES Y PRECIOS DE FILL-3D
// Edita este archivo para ajustar precios y materiales.
// ============================================================

export interface Material {
  id: string;
  name: string;
  description: string;
  pricePerGram: number;  // COP por gramo de filamento
  density: number;       // g/cm³
  color: string;         // color hex para la UI
}

export interface Quality {
  id: string;
  name: string;
  layerHeight: string;
  description: string;
  timeMultiplier: number;
}

// Precios en COP por gramo — ajusta según tus costos reales
export const MATERIALS: Material[] = [
  {
    id: 'pla',
    name: 'PLA',
    description: 'Uso general, biodegradable, fácil de imprimir',
    pricePerGram: 80,
    density: 1.24,
    color: '#22c55e',
  },
  {
    id: 'plap',
    name: 'PLA+',
    description: 'Mayor resistencia que el PLA estándar',
    pricePerGram: 90,
    density: 1.24,
    color: '#3b82f6',
  },
  {
    id: 'petg',
    name: 'PETG',
    description: 'Resistente a impactos y humedad',
    pricePerGram: 100,
    density: 1.27,
    color: '#f97316',
  },
  {
    id: 'abs',
    name: 'ABS',
    description: 'Alta resistencia al calor y durabilidad',
    pricePerGram: 95,
    density: 1.04,
    color: '#ef4444',
  },
  {
    id: 'tpu',
    name: 'TPU',
    description: 'Flexible y resistente a impactos',
    pricePerGram: 150,
    density: 1.21,
    color: '#a855f7',
  },
];

export const QUALITIES: Quality[] = [
  {
    id: 'draft',
    name: 'Borrador',
    layerHeight: '0.3 mm',
    description: 'Impresión rápida, acabado básico. Ideal para prototipos funcionales.',
    timeMultiplier: 0.65,
  },
  {
    id: 'standard',
    name: 'Estándar',
    layerHeight: '0.2 mm',
    description: 'Equilibrio entre calidad y tiempo. Recomendado para la mayoría de piezas.',
    timeMultiplier: 1.0,
  },
  {
    id: 'fine',
    name: 'Alta Calidad',
    layerHeight: '0.1 mm',
    description: 'Acabado detallado y suave. Para piezas decorativas o de alta precisión.',
    timeMultiplier: 1.85,
  },
];

// Configuración de producción — ajusta según tu equipo e infraestructura
export const PRINT_CONFIG = {
  speedGPerHour: 28,        // gramos por hora de impresión promedio
  hourlyRateCOP: 6000,      // tarifa por hora de operación en COP
  markupMultiplier: 1.30,   // margen de ganancia (1.30 = 30%)
  minimumPriceCOP: 12000,   // precio mínimo por pieza en COP
};

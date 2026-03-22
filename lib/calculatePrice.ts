import { Material, Quality, PRINT_CONFIG } from './materials';

export interface PriceBreakdown {
  weightGrams: number;
  volumeCm3: number;
  materialCost: number;
  timeCost: number;
  hoursEstimated: number;
  subtotal: number;
  total: number;
}

export function calculatePrice(
  volumeCm3: number,
  material: Material,
  quality: Quality
): PriceBreakdown {
  const weightGrams = volumeCm3 * material.density;

  const materialCost = weightGrams * material.pricePerGram;

  const hoursEstimated =
    (weightGrams / PRINT_CONFIG.speedGPerHour) * quality.timeMultiplier;
  const timeCost = hoursEstimated * PRINT_CONFIG.hourlyRateCOP;

  const subtotal = materialCost + timeCost;
  const withMarkup = subtotal * PRINT_CONFIG.markupMultiplier;
  const total = Math.max(withMarkup, PRINT_CONFIG.minimumPriceCOP);

  return {
    weightGrams: Math.round(weightGrams * 10) / 10,
    volumeCm3: Math.round(volumeCm3 * 100) / 100,
    materialCost: Math.round(materialCost),
    timeCost: Math.round(timeCost),
    hoursEstimated: Math.round(hoursEstimated * 10) / 10,
    subtotal: Math.round(subtotal),
    total: Math.round(total),
  };
}

export function formatCOP(amount: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(amount);
}

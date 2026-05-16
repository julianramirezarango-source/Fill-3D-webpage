export interface PriceInputs {
  // From slicer (estimate or manual)
  grams: number
  hours: number

  // Machine config
  pricePerGram: number       // COP/g
  wattsPerHour: number       // W
  kwhPriceCOP: number        // COP per kWh
  machineCostCOP: number     // total printer cost
  machineLifetimeHours: number

  // User time
  prepMinutes: number
  postMinutes: number
  hourlyRateCOP: number

  // Risk & margin
  failureRate: number   // 0–100
  profitMargin: number  // 0–200

  // Shipping & extras
  packagingEnabled: boolean
  packagingCost: number
  shippingCost: number
  taxEnabled: boolean
  taxPercent: number
}

export interface PriceBreakdown {
  filamentCost: number
  energyCost: number
  depreciationCost: number
  subtotalMachine: number

  timeCost: number

  failureCost: number
  subtotalCost: number

  marginAmount: number
  subtotalWithMargin: number

  packagingCost: number
  shippingCost: number
  taxAmount: number

  total: number

  pricePerGram: number
  pricePerHour: number
}

export function calculateFullPrice(inputs: PriceInputs): PriceBreakdown {
  const filamentCost    = inputs.grams * inputs.pricePerGram
  const energyCost      = inputs.hours * (inputs.wattsPerHour / 1000) * inputs.kwhPriceCOP
  const depreciationCost = inputs.hours * (inputs.machineCostCOP / inputs.machineLifetimeHours)
  const subtotalMachine = filamentCost + energyCost + depreciationCost

  const totalTimeHours = (inputs.prepMinutes + inputs.postMinutes) / 60
  const timeCost       = totalTimeHours * inputs.hourlyRateCOP

  const subtotalBeforeFailure = subtotalMachine + timeCost
  const failureCost           = subtotalBeforeFailure * (inputs.failureRate / 100)
  const subtotalCost          = subtotalBeforeFailure + failureCost

  const marginAmount      = subtotalCost * (inputs.profitMargin / 100)
  const subtotalWithMargin = subtotalCost + marginAmount

  const packaging  = inputs.packagingEnabled ? inputs.packagingCost : 0
  const taxBase    = subtotalWithMargin + packaging + inputs.shippingCost
  const taxAmount  = inputs.taxEnabled ? taxBase * (inputs.taxPercent / 100) : 0

  const total = subtotalWithMargin + packaging + inputs.shippingCost + taxAmount

  return {
    filamentCost:      Math.round(filamentCost),
    energyCost:        Math.round(energyCost),
    depreciationCost:  Math.round(depreciationCost),
    subtotalMachine:   Math.round(subtotalMachine),
    timeCost:          Math.round(timeCost),
    failureCost:       Math.round(failureCost),
    subtotalCost:      Math.round(subtotalCost),
    marginAmount:      Math.round(marginAmount),
    subtotalWithMargin: Math.round(subtotalWithMargin),
    packagingCost:     Math.round(packaging),
    shippingCost:      Math.round(inputs.shippingCost),
    taxAmount:         Math.round(taxAmount),
    total:             Math.round(total),
    pricePerGram:      inputs.grams > 0 ? Math.round(total / inputs.grams) : 0,
    pricePerHour:      inputs.hours > 0 ? Math.round(total / inputs.hours) : 0,
  }
}

export function formatCOP(amount: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

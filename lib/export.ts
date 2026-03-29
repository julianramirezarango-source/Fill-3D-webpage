import { PriceBreakdown, formatCOP } from './fullPriceCalc'

interface ExportData {
  fileName: string
  materialName: string
  layerHeight: number
  infill: number
  supports: boolean
  grams: number
  hours: number
  breakdown: PriceBreakdown
}

export async function exportToPDF(data: ExportData): Promise<void> {
  const { default: jsPDF } = await import('jspdf')
  const { default: autoTable } = await import('jspdf-autotable')

  const doc = new jsPDF()

  // Header
  doc.setFillColor(249, 115, 22) // orange-500
  doc.rect(0, 0, 210, 28, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text('Fill-3D — Cotización de Impresión', 14, 12)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`Generado: ${new Date().toLocaleDateString('es-CO')}`, 14, 22)

  // File info
  doc.setTextColor(0, 0, 0)
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('Archivo:', 14, 38)
  doc.setFont('helvetica', 'normal')
  doc.text(data.fileName, 40, 38)

  // Print config table
  autoTable(doc, {
    startY: 44,
    head: [['Parámetro', 'Valor']],
    body: [
      ['Material', data.materialName],
      ['Altura de capa', `${data.layerHeight} mm`],
      ['Relleno (infill)', `${data.infill}%`],
      ['Soportes', data.supports ? 'Sí' : 'No'],
      ['Filamento estimado', `${data.grams.toFixed(1)} g`],
      ['Tiempo de impresión', formatHours(data.hours)],
    ],
    headStyles: { fillColor: [94, 51, 217] },
    theme: 'striped',
  })

  const afterConfig = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8

  // Cost breakdown table
  autoTable(doc, {
    startY: afterConfig,
    head: [['Concepto', 'Costo (COP)']],
    body: [
      ['Filamento', formatCOP(data.breakdown.filamentCost)],
      ['Energía eléctrica', formatCOP(data.breakdown.energyCost)],
      ['Depreciación máquina', formatCOP(data.breakdown.depreciationCost)],
      ['Subtotal material+máquina', formatCOP(data.breakdown.subtotalMachine)],
      ['Tu tiempo', formatCOP(data.breakdown.timeCost)],
      ['Tasa de fallo', formatCOP(data.breakdown.failureCost)],
      ['Subtotal costos', formatCOP(data.breakdown.subtotalCost)],
      ['Margen de ganancia', formatCOP(data.breakdown.marginAmount)],
      ['Subtotal con margen', formatCOP(data.breakdown.subtotalWithMargin)],
      ...(data.breakdown.packagingCost > 0 ? [['Empaque', formatCOP(data.breakdown.packagingCost)]] : []),
      ...(data.breakdown.shippingCost > 0  ? [['Envío', formatCOP(data.breakdown.shippingCost)]] : []),
      ...(data.breakdown.taxAmount > 0     ? [['Impuestos', formatCOP(data.breakdown.taxAmount)]] : []),
    ],
    foot: [['PRECIO FINAL SUGERIDO', formatCOP(data.breakdown.total)]],
    headStyles: { fillColor: [94, 51, 217] },
    footStyles: { fillColor: [30, 30, 30], fontStyle: 'bold', fontSize: 12 },
    theme: 'striped',
  })

  doc.save(`fill3d-cotizacion-${data.fileName.replace(/\.[^.]+$/, '')}.pdf`)
}

export async function exportToExcel(data: ExportData): Promise<void> {
  const XLSX = await import('xlsx')

  const rows = [
    ['Fill-3D — Cotización de Impresión'],
    [`Fecha: ${new Date().toLocaleDateString('es-CO')}`],
    [],
    ['ARCHIVO', data.fileName],
    ['Material', data.materialName],
    ['Altura de capa (mm)', data.layerHeight],
    ['Relleno (%)', data.infill],
    ['Soportes', data.supports ? 'Sí' : 'No'],
    ['Gramos estimados', data.grams],
    ['Horas de impresión', data.hours],
    [],
    ['COSTOS', ''],
    ['Filamento (COP)', data.breakdown.filamentCost],
    ['Energía (COP)', data.breakdown.energyCost],
    ['Depreciación (COP)', data.breakdown.depreciationCost],
    ['Subtotal material+máquina', data.breakdown.subtotalMachine],
    ['Tu tiempo (COP)', data.breakdown.timeCost],
    ['Tasa de fallo (COP)', data.breakdown.failureCost],
    ['Subtotal costos', data.breakdown.subtotalCost],
    ['Margen de ganancia (COP)', data.breakdown.marginAmount],
    ['Subtotal con margen', data.breakdown.subtotalWithMargin],
    ['Empaque (COP)', data.breakdown.packagingCost],
    ['Envío (COP)', data.breakdown.shippingCost],
    ['Impuestos (COP)', data.breakdown.taxAmount],
    [],
    ['PRECIO FINAL SUGERIDO (COP)', data.breakdown.total],
  ]

  const ws = XLSX.utils.aoa_to_sheet(rows)
  ws['!cols'] = [{ wch: 32 }, { wch: 20 }]

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Cotización')
  XLSX.writeFile(wb, `fill3d-cotizacion-${data.fileName.replace(/\.[^.]+$/, '')}.xlsx`)
}

function formatHours(hours: number): string {
  const h = Math.floor(hours)
  const m = Math.round((hours - h) * 60)
  if (h === 0) return `${m} min`
  if (m === 0) return `${h} h`
  return `${h} h ${m} min`
}

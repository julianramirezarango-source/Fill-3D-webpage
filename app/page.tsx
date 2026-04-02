import type { Metadata } from 'next'
import WikiClient from './wiki-client'

export const metadata: Metadata = {
  title: 'Wiki Fill-3D | Documentación técnica de impresión 3D',
  description:
    'Documentación técnica oficial de Fill-3D Colombia. Guías de calibración, materiales, perfiles de slicer y soporte técnico para imprimir mejor con PLA Turbo.',
  keywords: ['impresión 3D', 'wiki', 'guías', 'calibración', 'PLA', 'filamento', 'Colombia', 'Fill-3D'],
}

export default function WikiPage() {
  return <WikiClient />
}

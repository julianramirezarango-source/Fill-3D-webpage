// app/perfiles-orcaslicer/page.tsx
// Página estática SEO de los perfiles OrcaSlicer — la de mayor valor de búsqueda
// (la demanda busca por marca de impresora: Bambu Lab, Creality K1, Ender 3).

import type { Metadata } from 'next'
import { fetchNavBuild, SITE } from '@/lib/routes'
import { FILAMENTS } from '@/lib/profiles-data'
import WikiShell from '@/components/WikiShell'

export const dynamic = 'force-static'

const TITLE = 'Perfil OrcaSlicer para PLA Turbo HS y filamentos Fill3D'
const DESCRIPTION = 'Descarga perfiles OrcaSlicer validados para filamentos Fill3D: PLA Turbo HS, PLA Basic, PETG, PA Nylon, PP y PP-CF. Compatibles con Bambu Lab P1S, A1 y X1 Carbon, Creality K1 y K1C, Ender 3 V3 y cualquier impresora soportada por OrcaSlicer.'
const CANONICAL = `${SITE}/wiki/perfiles-orcaslicer/`

export const metadata: Metadata = {
  title: `${TITLE} | Wiki Fill3D`,
  description: DESCRIPTION,
  alternates: { canonical: CANONICAL },
  openGraph: { title: `${TITLE} | Wiki Fill3D`, description: DESCRIPTION, url: CANONICAL, type: 'article', siteName: 'Wiki Fill3D', locale: 'es_CO' },
}

const DL = '/wiki/profiles'

export default async function PerfilesOrcaPage() {
  const nav = await fetchNavBuild()
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: TITLE,
    description: DESCRIPTION,
    inLanguage: 'es',
    mainEntityOfPage: CANONICAL,
    url: CANONICAL,
    publisher: { '@type': 'Organization', name: 'Fill3D', url: `${SITE}/`, logo: { '@type': 'ImageObject', url: `${SITE}/wiki/logo.svg` } },
    author: { '@type': 'Organization', name: 'Fill3D' },
  }

  return (
    <WikiShell nav={nav} currentMd="__perfiles-filamento__" breadcrumb={{ group: 'Lo básico', article: 'Perfiles OrcaSlicer' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="max-w-3xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">{TITLE}</h1>
        <p className="text-gray-500 leading-relaxed mb-2">
          Perfiles de filamento oficiales de Fill3D para OrcaSlicer, con parámetros validados en
          producción real con filamento fabricado en nuestra planta de <strong className="text-gray-700">Itagüí, Antioquia</strong>.
        </p>
        <p className="text-gray-500 leading-relaxed mb-8">
          Funcionan en cualquier impresora soportada por OrcaSlicer: <strong className="text-gray-700">Bambu Lab P1S, P1P, A1, A1 mini y X1 Carbon</strong>,{' '}
          <strong className="text-gray-700">Creality K1, K1C y K1 Max</strong>, <strong className="text-gray-700">Ender 3 V3 / KE</strong>, Voron, Prusa y más.
          Si imprimes con <a href="https://www.fill-3d.com/pla-hs/" className="text-[#753CFF] underline underline-offset-2 hover:text-[#5A2ED9]">PLA Turbo HS</a> o{' '}
          <a href="https://www.fill-3d.com/petg/" className="text-[#753CFF] underline underline-offset-2 hover:text-[#5A2ED9]">PETG Fill3D</a>, este es tu punto de partida.
        </p>

        {/* Descargar todos */}
        <div className="bg-[#F3EEFF] border border-[#E4D5FF] rounded-2xl p-5 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-gray-800 mb-1">Descargar biblioteca completa</p>
            <p className="text-sm text-gray-500">Todos los perfiles en un solo archivo <code className="bg-white text-[#753CFF] px-1.5 py-0.5 rounded text-xs font-mono">OrcaFilamentLibrary.json</code></p>
          </div>
          <a href={`${DL}/OrcaFilamentLibrary.json`} download="OrcaFilamentLibrary.json"
            className="shrink-0 inline-flex items-center gap-2 bg-[#753CFF] hover:bg-[#5A2ED9] text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors">
            Descargar todos
          </a>
        </div>

        {/* Perfiles individuales */}
        <h2 className="text-xl font-bold text-gray-800 mb-4">Perfiles por material</h2>
        <div className="grid sm:grid-cols-2 gap-4 mb-10">
          {FILAMENTS.map(f => (
            <div key={f.id} className="border border-gray-100 rounded-2xl p-5 hover:border-[#E4D5FF] hover:shadow-sm transition-all">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: f.color }} />
                <h3 className="font-bold text-gray-900">{f.name}</h3>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed mb-3">{f.description}</p>
              <p className="text-xs text-gray-400 font-mono mb-4">{f.specs}</p>
              <a href={`${DL}/FILL3D/${encodeURIComponent(f.file)}`} download={f.file}
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#753CFF] hover:text-[#5A2ED9] border border-[#E4D5FF] hover:border-[#753CFF] px-4 py-2 rounded-xl transition-colors">
                Descargar perfil
              </a>
            </div>
          ))}
        </div>

        <h2 className="text-xl font-bold text-gray-800 mb-4">Cómo importar el perfil en OrcaSlicer</h2>
        <ol className="list-decimal list-outside ml-5 space-y-2 text-gray-600 leading-relaxed mb-8">
          <li>Descarga el archivo <code className="bg-[#F3EEFF] text-[#753CFF] px-1.5 py-0.5 rounded text-[0.85em] font-mono">.json</code> del material que usas.</li>
          <li>Abre OrcaSlicer (versión 1.9 o superior).</li>
          <li>Ve a <strong className="text-gray-800">Archivo → Importar → Importar configuraciones</strong> y selecciona el archivo.</li>
          <li>En el panel de filamento busca «FILL3D» y selecciona el perfil importado.</li>
          <li>Los perfiles están optimizados para filamento Fill3D original; si tu ambiente difiere (altitud, humedad), ajusta ±5 °C la boquilla.</li>
        </ol>

        <p className="text-sm text-gray-500">
          ¿Aún no tienes el filamento? Consíguelo con envío gratis desde $80.000 en la{' '}
          <a href="https://www.fill-3d.com/tienda/" className="text-[#753CFF] underline underline-offset-2 hover:text-[#5A2ED9]">tienda Fill3D</a>
          {' '}— pedidos antes de la 1:00 p.m. se despachan el mismo día hábil.
        </p>
      </div>
    </WikiShell>
  )
}

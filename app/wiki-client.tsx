'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  NavGroup, NavItem, IconType,
  DEFAULT_NAV, fetchNav, fetchArticle, extractTitle, parseMarkdown,
} from '@/lib/wiki'

// ─── Brand teal ──────────────────────────────────────────────────────────────
// #753CFF  primary
// #5A2ED9  dark hover
// #F3EEFF  light bg
// #E4D5FF  medium bg

// ─── Nav icons ────────────────────────────────────────────────────────────────

function NavIcon({ type, className = '' }: { type?: IconType; className?: string }) {
  const base = `w-[14px] h-[14px] shrink-0 ${className}`
  switch (type) {
    case 'play':
      return (
        <svg className={base} viewBox="0 0 16 16" fill="currentColor">
          <path d="M4 2.5l10 5.5-10 5.5V2.5z" />
        </svg>
      )
    case 'circle':
      return (
        <svg className={base} viewBox="0 0 16 16" fill="currentColor">
          <circle cx="8" cy="8" r="5.5" />
        </svg>
      )
    case 'square':
      return (
        <svg className={base} viewBox="0 0 16 16" fill="currentColor">
          <rect x="2.5" y="2.5" width="11" height="11" rx="2.5" />
        </svg>
      )
    case 'loader':
      return (
        <svg className={base} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
          <circle cx="8" cy="8" r="5" strokeDasharray="7 5" />
        </svg>
      )
    case 'triangle':
      return (
        <svg className={base} viewBox="0 0 16 16" fill="currentColor">
          <path d="M8 1.5L15 13.5H1L8 1.5z" />
        </svg>
      )
    case 'pencil':
      return (
        <svg className={base} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 2.5a2 2 0 012.8 2.8L4.5 14H2v-2.5L11 2.5z" />
          <path d="M9.5 4l2.5 2.5" />
        </svg>
      )
    case 'dot':
      return (
        <svg className={base} viewBox="0 0 16 16" fill="currentColor">
          <circle cx="8" cy="8" r="3" />
        </svg>
      )
    case 'box':
      return (
        <svg className={base} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8 1.5L14 4.5v7L8 14.5l-6-3v-7L8 1.5z" />
          <path d="M8 1.5v13M2 4.5l6 3 6-3" />
        </svg>
      )
    case 'book':
      return (
        <svg className={base} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 2.5A2.5 2.5 0 014.5 0h8v14H4.5A2.5 2.5 0 012 11.5v-9z" />
          <path d="M8 0v14M4.5 4h3M4.5 7h3" />
        </svg>
      )
    case 'folder':
      return (
        <svg className={base} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M1 4a1 1 0 011-1h4l2 2h6a1 1 0 011 1v6a1 1 0 01-1 1H2a1 1 0 01-1-1V4z" />
        </svg>
      )
    case 'download':
      return (
        <svg className={base} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8 2v8M5 7l3 3 3-3M2 12h12" />
        </svg>
      )
    default:
      return <svg className={base} viewBox="0 0 16 16" fill="currentColor"><circle cx="8" cy="8" r="3" /></svg>
  }
}

// ─── Sidebar item ─────────────────────────────────────────────────────────────

function SidebarItem({
  item,
  currentPath,
  onNavigate,
  depth = 0,
}: {
  item: NavItem
  currentPath: string | null
  onNavigate: (path: string) => void
  depth?: number
}) {
  const [open, setOpen] = useState(false)
  const isActive = !!item.path && item.path === currentPath

  useEffect(() => {
    if (item.children?.some(c => c.path === currentPath)) setOpen(true)
  }, [currentPath, item.children])

  // icon color — triangle warning gets amber
  const iconColor = item.icon === 'triangle' ? 'text-amber-500' : 'text-[#753CFF]'

  if (item.children) {
    return (
      <li>
        <button
          onClick={() => setOpen(o => !o)}
          className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg transition-colors cursor-pointer group
            ${open ? 'text-gray-900' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'}`}
        >
          <NavIcon type={item.icon} className={iconColor} />
          <span className="flex-1 text-left font-medium">{item.label}</span>
          <svg
            className={`w-3.5 h-3.5 text-gray-300 transition-transform shrink-0 ${open ? 'rotate-90' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
        {open && (
          <ul className="ml-5 mt-0.5 border-l border-gray-100 pl-3 space-y-0.5 pb-1">
            {item.children.map(child => (
              <SidebarItem
                key={child.path ?? child.label}
                item={child}
                currentPath={currentPath}
                onNavigate={onNavigate}
                depth={depth + 1}
              />
            ))}
          </ul>
        )}
      </li>
    )
  }

  return (
    <li>
      <button
        onClick={() => item.path && onNavigate(item.path)}
        className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg transition-colors cursor-pointer
          ${isActive
            ? 'bg-[#F3EEFF] text-[#753CFF] font-medium'
            : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'}`}
      >
        <NavIcon type={item.icon} className={isActive ? 'text-[#753CFF]' : iconColor} />
        <span className="flex-1 text-left leading-snug">{item.label}</span>
        <svg
          className="w-3.5 h-3.5 text-gray-200 shrink-0"
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </li>
  )
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

function Sidebar({
  nav, currentPath, onNavigate,
}: {
  nav: NavGroup[]
  currentPath: string | null
  onNavigate: (path: string) => void
}) {
  return (
    <nav className="py-5 px-2 space-y-5">
      {nav.map(group => (
        <div key={group.label}>
          <p className="px-3 mb-2 text-[10px] font-bold text-gray-400 uppercase tracking-[0.12em]">
            {group.label}
          </p>
          <ul className="space-y-0.5">
            {group.items.map(item => (
              <SidebarItem
                key={item.path ?? item.label}
                item={item}
                currentPath={currentPath}
                onNavigate={onNavigate}
              />
            ))}
          </ul>
        </div>
      ))}
    </nav>
  )
}

// ─── FAQ accordion ────────────────────────────────────────────────────────────

const FAQ_ITEMS = [
  {
    q: '¿Dónde encuentro el perfil para mi slicer?',
    a: 'En la sección de perfiles del menú. Selecciona tu slicer, descarga el archivo e impórtalo. ¿Dudas? WhatsApp +57 314 745 8472.',
  },
  {
    q: '¿Los parámetros están validados o son estimaciones?',
    a: 'Validados en producción real con filamento de nuestra planta en Bogotá. No son rangos genéricos — funcionan en condiciones reales de impresión.',
  },
  {
    q: '¿Qué es el Turbo Club?',
    a: 'Membresía de Fill-3D: PLA Turbo a $65.000 COP/kg (vs $75.000 público), soporte técnico directo y prioridad en despachos.',
  },
  {
    q: '¿Hacen envíos a todo Colombia?',
    a: 'Sí. Desde Bogotá a todo el país. Pedidos por WhatsApp, Instagram o en nuestro punto físico en Auros Calle 72, Bogotá.',
  },
]

function FaqAccordion() {
  const [openIdx, setOpenIdx] = useState<number | null>(null)
  return (
    <div className="divide-y divide-gray-100">
      {FAQ_ITEMS.map((item, i) => (
        <div key={i}>
          <button
            onClick={() => setOpenIdx(openIdx === i ? null : i)}
            className="w-full flex items-center justify-between py-4 text-left text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors cursor-pointer"
          >
            <span>{item.q}</span>
            <svg
              className={`w-4 h-4 text-gray-300 shrink-0 ml-4 transition-transform ${openIdx === i ? 'rotate-180' : ''}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {openIdx === i && (
            <p className="pb-4 text-sm text-gray-500 leading-relaxed">{item.a}</p>
          )}
        </div>
      ))}
    </div>
  )
}

// ─── Home page ────────────────────────────────────────────────────────────────

function WikiHome({
  nav, onNavigate,
}: {
  nav: NavGroup[]
  onNavigate: (path: string) => void
}) {
  function firstLeaf(items: NavItem[]): string | null {
    for (const item of items) {
      if (item.path) return item.path
      if (item.children) { const f = firstLeaf(item.children); if (f) return f }
    }
    return null
  }

  const CARD_ICONS: Record<string, React.ReactNode> = {
    'Lo básico': (
      <svg className="w-10 h-10 text-[#753CFF]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
      </svg>
    ),
    'Consejos de impresión': (
      <svg className="w-10 h-10 text-[#753CFF]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
      </svg>
    ),
    'Glosario': (
      <svg className="w-10 h-10 text-[#753CFF]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
      </svg>
    ),
  }

  return (
    <div className="max-w-3xl">
      {/* Hero */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <svg className="w-5 h-5 text-[#753CFF]" fill="currentColor" viewBox="0 0 24 24">
            <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
          </svg>
          <span className="text-sm font-semibold text-[#753CFF]">Wiki Fill-3D</span>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Wiki Fill-3D</h1>
        <p className="text-base text-gray-500 leading-relaxed max-w-xl">
          Documentación técnica oficial. Perfiles validados en producción, guías de calibración y soporte
          técnico para imprimir mejor con <strong className="text-gray-700">PLA Turbo Fill-3D</strong> — fabricado en Colombia.
        </p>
      </div>

      <hr className="border-gray-100 mb-8" />

      {/* FAQ */}
      <section className="mb-8">
        <div className="flex items-center gap-2.5 mb-4">
          <svg className="w-4 h-4 text-[#753CFF]" viewBox="0 0 16 16" fill="currentColor">
            <circle cx="8" cy="8" r="7" />
          </svg>
          <h2 className="text-base font-semibold text-gray-800">Preguntas frecuentes</h2>
        </div>
        <FaqAccordion />
      </section>

      <hr className="border-gray-100 mb-8" />

      {/* Empieza aquí */}
      <section>
        <div className="flex items-center gap-2.5 mb-5">
          <svg className="w-4 h-4 text-[#753CFF]" fill="currentColor" viewBox="0 0 24 24">
            <path fillRule="evenodd" d="M14.615 1.595a.75.75 0 01.359.852L12.982 9.75h7.268a.75.75 0 01.548 1.262l-10.5 11.25a.75.75 0 01-1.272-.71l1.992-7.302H3.268a.75.75 0 01-.548-1.262l10.5-11.25a.75.75 0 01.913-.143z" clipRule="evenodd" />
          </svg>
          <h2 className="text-base font-semibold text-gray-800">Empieza aquí</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {nav.map(group => {
            const first = firstLeaf(group.items)
            return (
              <button
                key={group.label}
                onClick={() => first && onNavigate(first)}
                className="text-left bg-[#F3EEFF] hover:bg-[#E4D5FF] border border-[#E4D5FF] hover:border-[#C4B5FD] rounded-2xl p-5 transition-all cursor-pointer group"
              >
                <div className="mb-4">{CARD_ICONS[group.label] ?? <NavIcon type="circle" className="w-10 h-10 text-[#753CFF]" />}</div>
                <h3 className="font-semibold text-gray-800 text-sm mb-1 group-hover:text-[#753CFF] transition-colors">
                  {group.label}
                </h3>
                <p className="text-xs text-gray-400">
                  {group.items.reduce((acc, item) => acc + (item.children ? item.children.length : 1), 0)} artículos
                </p>
              </button>
            )
          })}
        </div>
      </section>
    </div>
  )
}

// ─── Filament profiles page ───────────────────────────────────────────────────

const PROFILES_REPO = '/wiki/profiles'

const FILAMENTS = [
  {
    id: 'pla-basic',
    name: 'PLA Basic',
    file: 'FILL3D PLA Basic @System.json',
    color: '#4CAF50',
    description: 'Filamento estándar de ácido poliláctico. Fácil de imprimir, baja deformación y buena adhesión entre capas. Ideal para prototipos, piezas decorativas y proyectos generales.',
    specs: 'Temp. boquilla: 210–230 °C · Cama: 50–60 °C',
  },
  {
    id: 'pla-turbo',
    name: 'PLA Turbo',
    file: 'FILL3D PLA Turbo @System.json',
    color: '#753CFF',
    description: 'PLA de alto rendimiento fabricado en Colombia por Fill-3D. Formulado para impresión a alta velocidad (hasta 350 mm/s) con mayor resistencia mecánica y acabado premium.',
    specs: 'Temp. boquilla: 220–240 °C · Cama: 55–65 °C',
  },
  {
    id: 'petg',
    name: 'PETG',
    file: 'FILL3D PETG @System.json',
    color: '#2196F3',
    description: 'Tereftalato de polietileno con glicol. Combina la facilidad de impresión del PLA con mayor resistencia mecánica y química. Buena transparencia y flexibilidad moderada.',
    specs: 'Temp. boquilla: 230–250 °C · Cama: 70–85 °C',
  },
  {
    id: 'pp',
    name: 'PP',
    file: 'FILL3D PP @System.json',
    color: '#FF9800',
    description: 'Polipropileno. Material muy ligero, altamente resistente a químicos y a la fatiga por flexión. Ideal para bisagras vivas, contenedores y piezas de uso industrial.',
    specs: 'Temp. boquilla: 220–240 °C · Cama: 85–100 °C',
  },
  {
    id: 'ppcf',
    name: 'PP-CF',
    file: 'FILL3D PPCF @System.json',
    color: '#333333',
    description: 'Polipropileno reforzado con fibra de carbono. Mayor rigidez, resistencia térmica y estabilidad dimensional que el PP estándar. Requiere boquilla endurecida.',
    specs: 'Temp. boquilla: 230–250 °C · Cama: 90–105 °C · Boquilla: acero endurecido',
  },
  {
    id: 'pa',
    name: 'PA / Nylon',
    file: 'FILL3D PA @System.json',
    color: '#E91E63',
    description: 'Poliamida de alta performance. Excelente resistencia mecánica, al desgaste y al impacto. Ideal para engranajes, rodamientos y piezas funcionales sometidas a estrés continuo.',
    specs: 'Temp. boquilla: 240–260 °C · Cama: 70–90 °C · Secar antes de usar',
  },
]

function FilamentProfilesPage({ onNavigate }: { onNavigate: (path: string) => void }) {
  return (
    <div className="max-w-3xl">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-xs text-gray-400 mb-6">
        <button
          onClick={() => { window.location.hash = ''; window.scrollTo({ top: 0 }) }}
          className="hover:text-[#753CFF] transition-colors cursor-pointer"
        >
          Inicio
        </button>
        <span>›</span>
        <span>Lo básico</span>
        <span>›</span>
        <span className="text-gray-600">Perfiles OrcaSlicer</span>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <svg className="w-5 h-5 text-[#753CFF]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
          <span className="text-sm font-semibold text-[#753CFF]">Perfiles de filamento</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Perfiles OrcaSlicer Fill-3D</h1>
        <p className="text-gray-500 leading-relaxed">
          Perfiles de filamento oficiales de Fill-3D para OrcaSlicer. Parámetros validados en producción real con filamento fabricado en nuestra planta en Bogotá, Colombia.
        </p>
      </div>

      {/* Download all */}
      <div className="bg-[#F3EEFF] border border-[#E4D5FF] rounded-2xl p-5 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <p className="font-semibold text-gray-800 mb-1">Descargar biblioteca completa</p>
          <p className="text-sm text-gray-500">Todos los perfiles en un solo archivo <code className="bg-white text-[#753CFF] px-1.5 py-0.5 rounded text-xs font-mono">OrcaFilamentLibrary.json</code></p>
        </div>
        <a
          href={`${PROFILES_REPO}/OrcaFilamentLibrary.json`}
          download="OrcaFilamentLibrary.json"
          className="shrink-0 inline-flex items-center gap-2 bg-[#753CFF] hover:bg-[#5A2ED9] text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
          Descargar todos
        </a>
      </div>

      {/* Profile cards */}
      <div className="grid sm:grid-cols-2 gap-4 mb-10">
        {FILAMENTS.map(f => (
          <div key={f.id} className="border border-gray-100 rounded-2xl p-5 hover:border-[#E4D5FF] hover:shadow-sm transition-all">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: f.color }} />
              <h3 className="font-bold text-gray-900">{f.name}</h3>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed mb-3">{f.description}</p>
            <p className="text-xs text-gray-400 font-mono mb-4">{f.specs}</p>
            <a
              href={`${PROFILES_REPO}/FILL3D/${encodeURIComponent(f.file)}`}
              download={f.file}
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#753CFF] hover:text-[#5A2ED9] border border-[#E4D5FF] hover:border-[#753CFF] px-4 py-2 rounded-xl transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              Descargar perfil
            </a>
          </div>
        ))}
      </div>

      <hr className="border-gray-100 mb-8" />

      {/* How to import */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-gray-800 mb-5">Cómo importar el perfil en OrcaSlicer</h2>
        <div className="space-y-4">
          {[
            {
              step: '1',
              title: 'Descarga el archivo',
              desc: 'Haz clic en "Descargar perfil" del material que usas. Se descargará un archivo .json a tu computador.',
            },
            {
              step: '2',
              title: 'Abre OrcaSlicer',
              desc: 'Inicia OrcaSlicer. Asegúrate de tener la versión 1.9 o superior para compatibilidad completa.',
            },
            {
              step: '3',
              title: 'Importa el perfil',
              desc: 'En el menú superior ve a Archivo → Importar → Importar configuraciones. Selecciona el archivo .json descargado.',
            },
            {
              step: '4',
              title: 'Selecciona el filamento',
              desc: 'En el panel de filamento (columna derecha), abre el desplegable y busca "FILL3D". Selecciona el perfil importado.',
            },
            {
              step: '5',
              title: 'Ajusta si es necesario',
              desc: 'Los perfiles están optimizados para filamento Fill-3D original. Si usas condiciones distintas (altitud, humedad), ajusta ±5 °C en temperatura de boquilla.',
            },
          ].map(({ step, title, desc }) => (
            <div key={step} className="flex gap-4">
              <div className="shrink-0 w-8 h-8 rounded-full bg-[#F3EEFF] text-[#753CFF] text-sm font-bold flex items-center justify-center">
                {step}
              </div>
              <div className="pt-1">
                <p className="font-semibold text-gray-800 text-sm mb-1">{title}</p>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <div className="pt-6 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3 text-xs text-gray-400">
        <span>
          Perfiles desde{' '}
          <a
            href="https://github.com/Ju4n5e/fill3d-orca-profiles"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-gray-600 transition-colors"
          >
            fill3d-orca-profiles
          </a>
        </span>
        <a
          href="https://wa.me/573147458472"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#753CFF] hover:text-[#5A2ED9] font-medium transition-colors"
        >
          ¿Dudas? WhatsApp →
        </a>
      </div>
    </div>
  )
}

// ─── Article skeleton ─────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <div className="max-w-3xl animate-pulse">
      <div className="h-7 bg-gray-100 rounded-lg w-2/3 mb-4" />
      <div className="space-y-2 mb-8">
        <div className="h-4 bg-gray-100 rounded w-full" />
        <div className="h-4 bg-gray-100 rounded w-5/6" />
        <div className="h-4 bg-gray-100 rounded w-4/6" />
      </div>
      <div className="h-5 bg-gray-100 rounded w-1/3 mb-3" />
      <div className="space-y-2">
        <div className="h-4 bg-gray-100 rounded w-full" />
        <div className="h-4 bg-gray-100 rounded w-3/4" />
      </div>
    </div>
  )
}

// ─── WikiClient ───────────────────────────────────────────────────────────────

export default function WikiClient() {
  const [nav, setNav] = useState<NavGroup[]>(DEFAULT_NAV)
  const [currentPath, setCurrentPath] = useState<string | null>(null)
  const [html, setHtml] = useState('')
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => { fetchNav().then(setNav) }, [])

  useEffect(() => {
    const sync = () => {
      const hash = decodeURIComponent(window.location.hash.slice(1))
      setCurrentPath(hash || null)
    }
    sync()
    window.addEventListener('hashchange', sync)
    return () => window.removeEventListener('hashchange', sync)
  }, [])

  useEffect(() => {
    if (!currentPath || currentPath === '__perfiles-filamento__') { setHtml(''); setTitle(''); setLoading(false); return }
    setLoading(true)
    fetchArticle(currentPath).then(md => {
      if (md) {
        setTitle(extractTitle(md))
        setHtml(parseMarkdown(md, currentPath))
      } else {
        setTitle('Artículo no disponible')
        setHtml('<p class="text-gray-400">Este artículo aún no ha sido publicado.</p>')
      }
      setLoading(false)
    })
  }, [currentPath])

  const navigate = useCallback((path: string) => {
    window.location.hash = encodeURIComponent(path)
    setSidebarOpen(false)
    window.scrollTo({ top: 0 })
  }, [])

  // breadcrumb lookup
  function findBreadcrumb(): { group: string; parent?: string; article: string } | null {
    if (!currentPath) return null
    for (const group of nav) {
      for (const item of group.items) {
        if (item.path === currentPath) return { group: group.label, article: item.label }
        if (item.children) {
          for (const child of item.children) {
            if (child.path === currentPath)
              return { group: group.label, parent: item.label, article: child.label }
          }
        }
      }
    }
    return null
  }

  const bc = findBreadcrumb()

  return (
    <div className="min-h-screen bg-white flex flex-col">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100 h-[60px] flex items-center px-5 gap-4">

        {/* Mobile hamburger */}
        <button
          onClick={() => setSidebarOpen(o => !o)}
          className="lg:hidden p-2 -ml-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Logo */}
        <button
          onClick={() => { window.location.hash = ''; setSidebarOpen(false); window.scrollTo({ top: 0 }) }}
          className="flex items-center gap-2 cursor-pointer shrink-0"
        >
          <img src="/wiki/logo.svg" alt="Fill-3D" style={{ height: '28px' }} />
          <span className="text-[9px] font-bold bg-[#753CFF] text-white px-1.5 py-[3px] rounded uppercase tracking-widest">
            Wiki
          </span>
        </button>

        {/* Search */}
        <div className="hidden sm:flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-400 cursor-text ml-1 min-w-[200px]">
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803a7.5 7.5 0 0010.607 0z" />
          </svg>
          <span>Buscar...</span>
        </div>

        <div className="flex-1" />

        {/* External nav */}
        <nav className="flex items-center gap-1">
          {/* Calculadora button */}
          <a
            href="https://fill-3d.com/wiki/calculadora/"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 15.75V18m-7.5-6.75h.008v.008H8.25v-.008zm0 3h.008v.008H8.25v-.008zm0 3h.008v.008H8.25v-.008zm3-6h.008v.008H11.25v-.008zm0 3h.008v.008H11.25v-.008zm0 3h.008v.008H11.25v-.008zm3-6h.008v.008H14.25v-.008zm0 3h.008v.008H14.25v-.008zm0 3h.008v.008H14.25v-.008zm3-9H6a1.5 1.5 0 00-1.5 1.5v12A1.5 1.5 0 006 21h12a1.5 1.5 0 001.5-1.5V9A1.5 1.5 0 0018 7.5H15V6a3 3 0 10-6 0v1.5H6a1.5 1.5 0 00-1.5 1.5" />
            </svg>
            Calculadora
          </a>
          <a
            href="https://fill-3d.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:block text-sm text-gray-500 hover:text-gray-800 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Tienda
          </a>
          <a
            href="https://fill-3d.com/turbo-club/"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:block text-sm text-gray-500 hover:text-gray-800 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Turbo Club
          </a>
          <a
            href="https://wa.me/573147458472"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-semibold text-white bg-[#753CFF] hover:bg-[#5A2ED9] px-4 py-1.5 rounded-xl transition-colors ml-1"
          >
            Pedir →
          </a>
        </nav>
      </header>

      <div className="flex flex-1">

        {/* ── Desktop sidebar ─────────────────────────────────────────────── */}
        <aside className="hidden lg:block w-[260px] shrink-0 border-r border-gray-100 sticky top-[60px] h-[calc(100vh-60px)] overflow-y-auto">
          <Sidebar nav={nav} currentPath={currentPath} onNavigate={navigate} />
        </aside>

        {/* ── Mobile sidebar drawer ────────────────────────────────────────── */}
        {sidebarOpen && (
          <>
            <div className="lg:hidden fixed inset-0 z-40 bg-black/20" onClick={() => setSidebarOpen(false)} />
            <aside className="lg:hidden fixed top-[60px] left-0 bottom-0 z-50 w-[280px] bg-white border-r border-gray-100 overflow-y-auto shadow-xl">
              <Sidebar nav={nav} currentPath={currentPath} onNavigate={navigate} />
            </aside>
          </>
        )}

        {/* ── Main content ─────────────────────────────────────────────────── */}
        <main className="flex-1 min-w-0 px-6 py-10 lg:px-16">
          {!currentPath ? (
            <WikiHome nav={nav} onNavigate={navigate} />
          ) : currentPath === '__perfiles-filamento__' ? (
            <FilamentProfilesPage onNavigate={navigate} />
          ) : loading ? (
            <Skeleton />
          ) : (
            <article className="max-w-3xl">
              {/* Breadcrumb */}
              {bc && (
                <nav className="flex items-center flex-wrap gap-1 text-xs text-gray-400 mb-6">
                  <button
                    onClick={() => { window.location.hash = ''; window.scrollTo({ top: 0 }) }}
                    className="hover:text-[#753CFF] transition-colors cursor-pointer"
                  >
                    Inicio
                  </button>
                  <span>›</span>
                  <span>{bc.group}</span>
                  {bc.parent && <><span>›</span><span>{bc.parent}</span></>}
                  <span>›</span>
                  <span className="text-gray-600">{bc.article}</span>
                </nav>
              )}

              {/* Rendered markdown — title comes from the H1 inside the markdown itself */}
              <div dangerouslySetInnerHTML={{ __html: html }} />

              {/* Footer */}
              <div className="mt-12 pt-6 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3 text-xs text-gray-400">
                <span>
                  Contenido desde{' '}
                  <a
                    href="https://github.com/Ju4n5e/fill3d-wiki-content"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-gray-600 transition-colors"
                  >
                    fill3d-wiki-content
                  </a>
                </span>
                <a
                  href="https://wa.me/573147458472"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#753CFF] hover:text-[#5A2ED9] font-medium transition-colors"
                >
                  ¿Dudas? WhatsApp →
                </a>
              </div>
            </article>
          )}
        </main>
      </div>
    </div>
  )
}

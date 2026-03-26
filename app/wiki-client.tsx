'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  NavGroup,
  NavItem,
  DEFAULT_NAV,
  fetchNav,
  fetchArticle,
  extractTitle,
  parseMarkdown,
} from '@/lib/wiki'

// ─── Sidebar nav item ─────────────────────────────────────────────────────────

function NavLeafItem({
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

  // Auto-open folder if a child is active
  useEffect(() => {
    if (item.children?.some(c => c.path === currentPath)) setOpen(true)
  }, [currentPath, item.children])

  if (item.children) {
    return (
      <li>
        <button
          onClick={() => setOpen(o => !o)}
          className="w-full flex items-center justify-between px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
        >
          <span className={depth > 0 ? 'pl-3' : ''}>{item.label}</span>
          <svg
            className={`w-3.5 h-3.5 text-gray-400 transition-transform shrink-0 ${open ? 'rotate-90' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
        {open && (
          <ul className="mt-0.5 ml-3 border-l border-gray-100 pl-2 space-y-0.5">
            {item.children.map(child => (
              <NavLeafItem
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
        className={`w-full text-left px-3 py-1.5 text-sm rounded-lg transition-colors cursor-pointer
          ${isActive
            ? 'bg-[#f5f3ff] text-[#5E33D9] font-medium border-l-2 border-[#5E33D9] rounded-l-none -ml-px pl-[11px]'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }
          ${depth > 0 ? 'pl-3' : ''}
        `}
      >
        {item.label}
      </button>
    </li>
  )
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

function Sidebar({
  nav,
  currentPath,
  onNavigate,
  onHome,
}: {
  nav: NavGroup[]
  currentPath: string | null
  onNavigate: (path: string) => void
  onHome: () => void
}) {
  return (
    <nav className="py-4 px-3 space-y-6">
      {/* Home link */}
      <button
        onClick={onHome}
        className={`w-full text-left px-3 py-1.5 text-sm rounded-lg transition-colors cursor-pointer flex items-center gap-2
          ${!currentPath
            ? 'bg-[#f5f3ff] text-[#5E33D9] font-medium'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}
      >
        <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
        Inicio
      </button>

      {nav.map(group => (
        <div key={group.label}>
          <p className="px-3 mb-1.5 text-[11px] font-semibold text-gray-400 uppercase tracking-widest">
            {group.label}
          </p>
          <ul className="space-y-0.5">
            {group.items.map(item => (
              <NavLeafItem
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

// ─── Home page ────────────────────────────────────────────────────────────────

function WikiHome({
  nav,
  onNavigate,
}: {
  nav: NavGroup[]
  onNavigate: (path: string) => void
}) {
  const ICONS: Record<string, string> = {
    'Lo básico': '📚',
    'Consejos de impresión': '💡',
    'Glosario': '📖',
  }

  // Find first leaf path in each group for the "open group" action
  function firstLeaf(items: NavItem[]): string | null {
    for (const item of items) {
      if (item.path) return item.path
      if (item.children) {
        const found = firstLeaf(item.children)
        if (found) return found
      }
    }
    return null
  }

  return (
    <div className="max-w-3xl">
      {/* Hero */}
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">Wiki Fill-3D</h1>
        <p className="text-lg text-gray-500 leading-relaxed">
          Documentación técnica para imprimir mejor. Guías de calibración,
          materiales, slicers y soporte técnico — fabricado en Bogotá, Colombia.
        </p>
      </div>

      {/* Section cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-10">
        {nav.map(group => {
          const first = firstLeaf(group.items)
          return (
            <button
              key={group.label}
              onClick={() => first && onNavigate(first)}
              className="text-left bg-white border border-gray-200 rounded-2xl p-5 hover:border-[#5E33D9] hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="text-3xl mb-3">{ICONS[group.label] ?? '📄'}</div>
              <h2 className="font-semibold text-gray-900 mb-1 group-hover:text-[#5E33D9] transition-colors">
                {group.label}
              </h2>
              <p className="text-xs text-gray-500">
                {group.items.length} {group.items.length === 1 ? 'sección' : 'secciones'}
              </p>
            </button>
          )
        })}
      </div>

      {/* All articles list */}
      <div>
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-4">
          Todo el contenido
        </h2>
        <div className="space-y-6">
          {nav.map(group => (
            <div key={group.label}>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">{group.label}</h3>
              <ul className="space-y-1">
                {group.items.map(item => {
                  if (item.path) {
                    return (
                      <li key={item.path}>
                        <button
                          onClick={() => onNavigate(item.path!)}
                          className="text-sm text-[#5E33D9] hover:underline cursor-pointer"
                        >
                          {item.label}
                        </button>
                      </li>
                    )
                  }
                  if (item.children) {
                    return (
                      <li key={item.label}>
                        <span className="text-sm text-gray-600 font-medium">{item.label}</span>
                        <ul className="ml-4 mt-1 space-y-1">
                          {item.children.map(child => (
                            <li key={child.path}>
                              <button
                                onClick={() => child.path && onNavigate(child.path)}
                                className="text-sm text-[#5E33D9] hover:underline cursor-pointer"
                              >
                                {child.label}
                              </button>
                            </li>
                          ))}
                        </ul>
                      </li>
                    )
                  }
                  return null
                })}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────

function ArticleSkeleton() {
  return (
    <div className="max-w-3xl animate-pulse">
      <div className="h-8 bg-gray-200 rounded-lg w-2/3 mb-4" />
      <div className="h-4 bg-gray-100 rounded w-full mb-2" />
      <div className="h-4 bg-gray-100 rounded w-5/6 mb-2" />
      <div className="h-4 bg-gray-100 rounded w-4/6 mb-8" />
      <div className="h-6 bg-gray-200 rounded w-1/3 mb-3" />
      <div className="h-4 bg-gray-100 rounded w-full mb-2" />
      <div className="h-4 bg-gray-100 rounded w-3/4 mb-2" />
    </div>
  )
}

// ─── Main WikiClient component ────────────────────────────────────────────────

export default function WikiClient() {
  const [nav, setNav] = useState<NavGroup[]>(DEFAULT_NAV)
  const [currentPath, setCurrentPath] = useState<string | null>(null)
  const [html, setHtml] = useState('')
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Load nav from repo on mount (falls back to DEFAULT_NAV on error)
  useEffect(() => {
    fetchNav().then(setNav)
  }, [])

  // Sync currentPath with URL hash
  useEffect(() => {
    const sync = () => {
      const hash = decodeURIComponent(window.location.hash.slice(1))
      setCurrentPath(hash || null)
    }
    sync()
    window.addEventListener('hashchange', sync)
    return () => window.removeEventListener('hashchange', sync)
  }, [])

  // Fetch and render the article whenever currentPath changes
  useEffect(() => {
    if (!currentPath) {
      setHtml('')
      setTitle('')
      return
    }
    setLoading(true)
    fetchArticle(currentPath).then(md => {
      if (md) {
        setTitle(extractTitle(md))
        setHtml(parseMarkdown(md, currentPath))
      } else {
        setTitle('Artículo no encontrado')
        setHtml('<p class="text-gray-500">Este artículo no está disponible o aún no ha sido publicado.</p>')
      }
      setLoading(false)
    })
  }, [currentPath])

  const navigate = useCallback((path: string) => {
    window.location.hash = encodeURIComponent(path)
    setSidebarOpen(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const goHome = useCallback(() => {
    window.location.hash = ''
    setSidebarOpen(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  // Breadcrumb label for the current article
  function breadcrumb(): { group: string; article: string } | null {
    if (!currentPath) return null
    for (const group of nav) {
      for (const item of group.items) {
        if (item.path === currentPath) return { group: group.label, article: item.label }
        if (item.children) {
          for (const child of item.children) {
            if (child.path === currentPath) return { group: `${group.label} › ${item.label}`, article: child.label }
          }
        }
      }
    }
    return null
  }

  const bc = breadcrumb()

  return (
    <div className="min-h-screen bg-white flex flex-col">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 h-14 flex items-center px-4 gap-3">
        {/* Mobile hamburger */}
        <button
          onClick={() => setSidebarOpen(o => !o)}
          className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors cursor-pointer"
          aria-label="Abrir menú"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Logo */}
        <button onClick={goHome} className="flex items-center gap-2 cursor-pointer shrink-0">
          <span className="font-bold text-gray-900 text-lg leading-none">Fill-3D</span>
          <span className="text-[10px] font-semibold bg-[#5E33D9] text-white px-1.5 py-0.5 rounded uppercase tracking-wider">
            Wiki
          </span>
        </button>

        {/* Spacer */}
        <div className="flex-1" />

        {/* External links */}
        <nav className="hidden sm:flex items-center gap-1">
          <a
            href="https://fill-3d.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-gray-500 hover:text-gray-900 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Tienda
          </a>
          <a
            href="https://fill-3d.com/turbo-club/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-gray-500 hover:text-gray-900 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Turbo Club
          </a>
          <a
            href="https://wa.me/573147458472"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-white bg-[#5E33D9] hover:bg-[#4F25C6] px-3 py-1.5 rounded-lg transition-colors"
          >
            Pedir →
          </a>
        </nav>
      </header>

      <div className="flex flex-1">

        {/* ── Sidebar (desktop) ───────────────────────────────────────────── */}
        <aside className="hidden lg:block w-64 shrink-0 border-r border-gray-100 sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto">
          <Sidebar nav={nav} currentPath={currentPath} onNavigate={navigate} onHome={goHome} />
        </aside>

        {/* ── Sidebar (mobile overlay) ────────────────────────────────────── */}
        {sidebarOpen && (
          <>
            {/* Backdrop */}
            <div
              className="lg:hidden fixed inset-0 z-40 bg-black/30"
              onClick={() => setSidebarOpen(false)}
            />
            {/* Drawer */}
            <aside className="lg:hidden fixed top-14 left-0 bottom-0 z-50 w-72 bg-white border-r border-gray-100 overflow-y-auto shadow-xl">
              <Sidebar nav={nav} currentPath={currentPath} onNavigate={navigate} onHome={goHome} />
            </aside>
          </>
        )}

        {/* ── Main content ─────────────────────────────────────────────────── */}
        <main className="flex-1 min-w-0 px-6 py-8 lg:px-12">
          {!currentPath ? (
            <WikiHome nav={nav} onNavigate={navigate} />
          ) : loading ? (
            <ArticleSkeleton />
          ) : (
            <article className="max-w-3xl">
              {/* Breadcrumb */}
              {bc && (
                <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-6">
                  <button onClick={goHome} className="hover:text-[#5E33D9] transition-colors cursor-pointer">
                    Inicio
                  </button>
                  <span>›</span>
                  <span>{bc.group}</span>
                  <span>›</span>
                  <span className="text-gray-600">{bc.article}</span>
                </div>
              )}

              {/* Article title */}
              {title && (
                <h1 className="text-3xl font-bold text-gray-900 mb-6">{title}</h1>
              )}

              {/* Rendered markdown */}
              <div
                className="prose-wiki"
                dangerouslySetInnerHTML={{ __html: html }}
              />

              {/* Footer */}
              <div className="mt-12 pt-6 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
                <span>
                  Contenido desde{' '}
                  <a
                    href="https://github.com/Ju4n5e/fill3d-wiki-content"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-gray-600"
                  >
                    fill3d-wiki-content
                  </a>
                </span>
                <a
                  href="https://wa.me/573147458472"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#5E33D9] hover:underline font-medium"
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

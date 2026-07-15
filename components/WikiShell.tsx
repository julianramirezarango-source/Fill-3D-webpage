// components/WikiShell.tsx
// Cascarón SERVIDOR para las páginas estáticas de artículos: header + sidebar con
// <a href> reales (Google los descubre en el HTML crudo) + contenido + footer.

import { type NavGroup, type NavItem, type IconType } from '@/lib/wiki'
import { hrefFor } from '@/lib/routes'

function NavIcon({ type }: { type?: IconType }) {
  const cls = 'w-[14px] h-[14px] shrink-0'
  switch (type) {
    case 'play':
      return <svg className={cls} viewBox="0 0 16 16" fill="currentColor"><path d="M4 2.5l10 5.5-10 5.5V2.5z" /></svg>
    case 'download':
      return <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
    case 'book':
      return <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>
    case 'triangle':
      return <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>
    case 'dot':
      return <svg className={cls} viewBox="0 0 16 16" fill="currentColor"><circle cx="8" cy="8" r="2.5" /></svg>
    default:
      return <svg className={cls} viewBox="0 0 16 16" fill="currentColor"><circle cx="8" cy="8" r="5" /></svg>
  }
}

function SideLink({ item, currentMd }: { item: NavItem; currentMd?: string }) {
  const active = !!item.path && item.path === currentMd
  const iconColor = item.icon === 'triangle' ? 'text-amber-500' : 'text-[#753CFF]'
  return (
    <li>
      <a
        href={item.path ? hrefFor(item.path) : '/wiki/'}
        className={`flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg transition-colors
          ${active ? 'bg-[#F3EEFF] text-[#753CFF] font-medium' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'}`}
      >
        <span className={active ? 'text-[#753CFF]' : iconColor}><NavIcon type={item.icon} /></span>
        <span className="flex-1 leading-snug">{item.label}</span>
      </a>
    </li>
  )
}

function SidebarStatic({ nav, currentMd }: { nav: NavGroup[]; currentMd?: string }) {
  return (
    <nav className="py-5 px-2 space-y-5">
      {nav.map(group => (
        <div key={group.label}>
          <p className="px-3 mb-2 text-[10px] font-bold text-gray-400 uppercase tracking-[0.12em]">{group.label}</p>
          <ul className="space-y-0.5">
            {group.items.map(item =>
              item.children ? (
                <li key={item.label}>
                  <details open={item.children.some(c => c.path === currentMd)}>
                    <summary className="flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg text-gray-500 hover:text-gray-800 hover:bg-gray-50 cursor-pointer list-none font-medium">
                      <span className="text-[#753CFF]"><NavIcon type={item.icon} /></span>
                      {item.label}
                    </summary>
                    <ul className="ml-5 mt-0.5 border-l border-gray-100 pl-3 space-y-0.5 pb-1">
                      {item.children.map(c => <SideLink key={c.path ?? c.label} item={c} currentMd={currentMd} />)}
                    </ul>
                  </details>
                </li>
              ) : (
                <SideLink key={item.path ?? item.label} item={item} currentMd={currentMd} />
              ),
            )}
          </ul>
        </div>
      ))}
    </nav>
  )
}

export default function WikiShell({
  nav, currentMd, breadcrumb, children,
}: {
  nav: NavGroup[]
  currentMd?: string
  breadcrumb?: { group: string; parent?: string; article: string }
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <header className="sticky top-0 z-30 h-[60px] bg-white/95 backdrop-blur border-b border-gray-100 flex items-center justify-between px-4 sm:px-6">
        <a href="/wiki/" className="flex items-center gap-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/wiki/logo.svg" alt="Fill3D" className="h-7 w-auto" />
          <span className="font-bold text-gray-900 tracking-tight">Wiki <span className="text-[#753CFF]">Fill3D</span></span>
        </a>
        <nav className="flex items-center gap-1 sm:gap-2">
          <a href="https://www.fill-3d.com/tienda/" className="hidden sm:block text-sm font-medium text-gray-500 hover:text-gray-800 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">Tienda</a>
          <a href="https://www.fill-3d.com/turbo-club/" className="hidden sm:block text-sm font-medium text-gray-500 hover:text-gray-800 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">Turbo Club</a>
          <a href="/wiki/calculadora/" className="hidden sm:block text-sm font-medium text-gray-500 hover:text-gray-800 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">Calculadora</a>
          <a href="https://wa.me/573147458472" target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-white bg-[#753CFF] hover:bg-[#5A2ED9] px-4 py-1.5 rounded-xl transition-colors ml-1">Pedir →</a>
        </nav>
      </header>

      <div className="flex flex-1">
        {/* Sidebar (desktop) */}
        <aside className="hidden lg:block w-[260px] shrink-0 border-r border-gray-100 sticky top-[60px] h-[calc(100vh-60px)] overflow-y-auto">
          <SidebarStatic nav={nav} currentMd={currentMd} />
        </aside>

        {/* Contenido */}
        <main className="flex-1 min-w-0 px-4 sm:px-8 lg:px-12 py-8">
          {breadcrumb && (
            <nav className="flex items-center gap-1 text-xs text-gray-400 mb-6 flex-wrap">
              <a href="/wiki/" className="hover:text-[#753CFF] transition-colors">Inicio</a>
              <span>›</span>
              <span>{breadcrumb.group}</span>
              {breadcrumb.parent && (<><span>›</span><span>{breadcrumb.parent}</span></>)}
              <span>›</span>
              <span className="text-gray-600">{breadcrumb.article}</span>
            </nav>
          )}
          {children}

          {/* Footer del artículo */}
          <div className="max-w-3xl mt-12 pt-6 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3 text-xs text-gray-400">
            <span>Wiki Fill3D — filamento fabricado en Itagüí, Antioquia · <a href="https://www.fill-3d.com/tienda/" className="underline hover:text-gray-600 transition-colors">tienda</a></span>
            <a href="https://wa.me/573147458472" target="_blank" rel="noopener noreferrer" className="text-[#753CFF] hover:text-[#5A2ED9] font-medium transition-colors">¿Dudas? WhatsApp →</a>
          </div>
        </main>
      </div>
    </div>
  )
}

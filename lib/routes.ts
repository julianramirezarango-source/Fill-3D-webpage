// lib/routes.ts
// Rutas estáticas por artículo (SEO) + fetchers de build + extracción de metadata.
// Las rutas viven bajo basePath /wiki: mdToRoute('lo-basico/pla.md') → '/lo-basico/pla/'

import { REPO_RAW, DEFAULT_NAV, type NavGroup, type NavItem } from './wiki'

export const SITE = 'https://www.fill-3d.com'

// Rutas de las páginas especiales (no-markdown)
export const SPECIAL_ROUTES: Record<string, string> = {
  '__perfiles-filamento__': '/perfiles-orcaslicer/',
  '__perfiles-creality__': '/perfiles-creality-print/',
}

/** Ruta estática (relativa al basePath) para un path de navegación. */
export function mdToRoute(path: string): string | null {
  if (SPECIAL_ROUTES[path]) return SPECIAL_ROUTES[path]
  if (path.startsWith('__')) return null
  return '/' + path.replace(/\.md$/, '').replace(/\/index$/, '') + '/'
}

/** href completo (con basePath) para usar en <a> del cliente. */
export function hrefFor(path: string): string {
  const r = mdToRoute(path)
  return r ? `/wiki${r}` : '/wiki/'
}

export interface WikiPage {
  mdPath: string
  slug: string[]        // segmentos de la ruta, ej. ['lo-basico', 'pla']
  label: string
  group: string
  parent?: string
}

/** Aplana la navegación en la lista de páginas markdown a generar. */
export function collectPages(nav: NavGroup[]): WikiPage[] {
  const pages: WikiPage[] = []
  const walk = (items: NavItem[], group: string, parent?: string) => {
    for (const it of items) {
      if (it.children) { walk(it.children, group, it.label); continue }
      if (!it.path || it.path.startsWith('__')) continue
      const route = mdToRoute(it.path)
      if (!route) continue
      pages.push({
        mdPath: it.path,
        slug: route.split('/').filter(Boolean),
        label: it.label,
        group,
        parent,
      })
    }
  }
  for (const g of nav) walk(g.items, g.label)
  return pages
}

// ─── Fetchers de BUILD (sin no-store: compatibles con output:'export') ─────────

export async function fetchNavBuild(): Promise<NavGroup[]> {
  try {
    const res = await fetch(`${REPO_RAW}/navigation.json`)
    if (res.ok) {
      const data = await res.json()
      if (Array.isArray(data?.groups)) return data.groups as NavGroup[]
    }
  } catch { /* fallback */ }
  return DEFAULT_NAV
}

export async function fetchArticleBuild(path: string): Promise<string | null> {
  try {
    const res = await fetch(`${REPO_RAW}/${path}`)
    if (!res.ok) return null
    return res.text()
  } catch {
    return null
  }
}

// ─── Metadata desde el markdown ────────────────────────────────────────────────

/** Meta description: el blockquote inicial o el primer párrafo largo, sin sintaxis md. */
export function extractDescription(markdown: string, fallback: string): string {
  const body = markdown.replace(/^---[\s\S]*?---\s*/, '')
  const quote = (body.match(/^>\s*(.+)$/m) || [])[1]?.trim()
  const para = body.split(/\r?\n\r?\n/).map(s => s.trim())
    .find(s => s && !/^[#>|!\-*\d`]/.test(s) && s.length > 60)
  let desc = (quote || para || fallback)
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/\*\*|\*|`/g, '')
    .replace(/\s+/g, ' ')
    .trim()
  if (desc.length > 155) desc = desc.slice(0, 152).replace(/\s\S*$/, '') + '…'
  return desc
}

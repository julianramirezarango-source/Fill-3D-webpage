// lib/wiki.ts
// Navigation types, GitHub content fetchers, and markdown renderer for the Fill-3D wiki.

export const REPO_RAW = 'https://raw.githubusercontent.com/Ju4n5e/fill3d-wiki-content/master'

// ─── Navigation types ────────────────────────────────────────────────────────

export type IconType =
  | 'play' | 'circle' | 'square' | 'loader' | 'triangle'
  | 'pencil' | 'dot' | 'box' | 'book' | 'folder'

export interface NavItem {
  label: string
  path?: string
  icon?: IconType
  children?: NavItem[]
}

export interface NavGroup {
  label: string
  items: NavItem[]
}

// ─── Default navigation ──────────────────────────────────────────────────────

export const DEFAULT_NAV: NavGroup[] = [
  {
    label: 'Lo básico',
    items: [
      { label: 'Introducción a la impresión 3D', path: 'lo-basico/introduccion-impresion-3d.md', icon: 'play' },
      { label: 'Materiales de impresión 3D',     path: 'lo-basico/materiales-impresion-3d.md',  icon: 'circle' },
      { label: 'Impresoras 3D',                  path: 'lo-basico/impresoras-3d.md',            icon: 'square' },
      { label: 'Slicers de impresión',            path: 'lo-basico/slicers.md',                  icon: 'loader' },
      { label: 'Aplicaciones',                   path: 'lo-basico/aplicaciones.md',             icon: 'circle' },
      { label: 'Datos curiosos del 3D',           path: 'lo-basico/datos-curiosos.md',           icon: 'circle' },
      {
        label: 'Partes de la impresora', icon: 'folder',
        children: [
          { label: 'Boquillas',         path: 'lo-basico/partes-impresora/boquillas.md',          icon: 'dot' },
          { label: 'Camas de impresión',path: 'lo-basico/partes-impresora/camas-de-impresion.md', icon: 'dot' },
          { label: 'Extrusores',        path: 'lo-basico/partes-impresora/extrusores.md',         icon: 'dot' },
        ],
      },
      {
        label: 'Materiales', icon: 'folder',
        children: [
          { label: 'PLA',             path: 'lo-basico/materiales/pla.md',            icon: 'circle' },
          { label: 'PETG',            path: 'lo-basico/materiales/petg.md',           icon: 'circle' },
          { label: 'PA / Nylon',      path: 'lo-basico/materiales/pa-nylon.md',       icon: 'circle' },
          { label: 'PP',              path: 'lo-basico/materiales/pp.md',             icon: 'circle' },
          { label: 'Fibras aditivas', path: 'lo-basico/materiales/fibras-aditivas.md',icon: 'circle' },
        ],
      },
      {
        label: 'Mantenimiento', icon: 'folder',
        children: [
          { label: 'Mantenimiento',        path: 'lo-basico/mantenimiento/mantenimiento.md',         icon: 'dot' },
          { label: 'Accesorios y repuestos',path: 'lo-basico/mantenimiento/accesorios-y-repuestos.md',icon: 'dot' },
        ],
      },
    ],
  },
  {
    label: 'Consejos de impresión',
    items: [
      { label: 'Por tipo de material',  path: 'consejos-de-impresion/por-tipo-de-material.md',  icon: 'circle' },
      { label: 'Problemas comunes',     path: 'consejos-de-impresion/problemas-comunes.md',     icon: 'triangle' },
      { label: 'Post-procesado',        path: 'consejos-de-impresion/post-procesado.md',        icon: 'pencil' },
      { label: 'Ciencia de materiales', path: 'consejos-de-impresion/ciencia-de-materiales.md', icon: 'circle' },
    ],
  },
  {
    label: 'Glosario',
    items: [
      { label: 'Glosario', path: 'glosario/index.md', icon: 'book' },
    ],
  },
]

// ─── GitHub fetchers ─────────────────────────────────────────────────────────

export async function fetchNav(): Promise<NavGroup[]> {
  try {
    const res = await fetch(`${REPO_RAW}/navigation.json`, { cache: 'no-store' })
    if (!res.ok) return DEFAULT_NAV
    const data = await res.json()
    if (Array.isArray(data?.groups)) return data.groups as NavGroup[]
  } catch { /* network error — use default */ }
  return DEFAULT_NAV
}

export async function fetchArticle(path: string): Promise<string | null> {
  try {
    const res = await fetch(`${REPO_RAW}/${path}`, { cache: 'no-store' })
    if (!res.ok) return null
    return res.text()
  } catch {
    return null
  }
}

export function extractTitle(markdown: string): string {
  const fm = markdown.match(/^---[\s\S]*?título:\s*["']?([^\n"']+)["']?/m)
  if (fm) return fm[1].trim()
  const stripped = markdown.replace(/^---[\s\S]*?\n---\n/, '')
  const h1 = stripped.match(/^#\s+(.+)$/m)
  if (h1) return h1[1].trim()
  return ''
}

// ─── Markdown renderer ───────────────────────────────────────────────────────

function stripFrontmatter(src: string): string {
  if (!src.startsWith('---')) return src
  const end = src.indexOf('\n---', 3)
  if (end === -1) return src
  return src.slice(end + 4).trimStart()
}

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function resolveImg(src: string, filePath: string): string {
  if (/^https?:\/\//.test(src)) return src
  const dir = filePath.split('/').slice(0, -1).join('/')
  const rel = src.replace(/^\.\//, '')
  return `${REPO_RAW}/${dir ? dir + '/' : ''}${rel}`
}

function inlineMd(text: string, filePath: string): string {
  return text
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_, alt, src) =>
      `<img src="${resolveImg(src, filePath)}" alt="${esc(alt)}" loading="lazy" class="max-w-full rounded-xl my-4" />`)
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, t, href) => {
      const ext = /^https?:\/\//.test(href)
      return `<a href="${esc(href)}"${ext ? ' target="_blank" rel="noopener noreferrer"' : ''} class="text-[#0D9488] underline underline-offset-2 hover:text-[#0F766E] transition-colors">${esc(t)}</a>`
    })
    .replace(/\*\*([^*\n]+)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>')
    .replace(/(?<!\*)\*([^*\n]+)\*(?!\*)/g, '<em>$1</em>')
    .replace(/`([^`\n]+)`/g, '<code class="bg-[#F0FDFA] text-[#0D9488] px-1.5 py-0.5 rounded text-[0.85em] font-mono">$1</code>')
}

function renderTable(rows: string[], filePath: string): string {
  const parseRow = (line: string) => line.split('|').slice(1, -1).map(c => c.trim())
  const allRows = rows.map(parseRow)
  if (allRows.length < 2) return ''
  const [header, , ...body] = allRows
  const th = header.map(h =>
    `<th class="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide bg-gray-50 border-b border-gray-200">${inlineMd(h, filePath)}</th>`
  ).join('')
  const trs = body.map((row, ri) => {
    const tds = row.map(c => `<td class="px-4 py-2 text-sm text-gray-700 border-b border-gray-100">${inlineMd(c, filePath)}</td>`).join('')
    return `<tr class="${ri % 2 === 1 ? 'bg-gray-50/60' : ''}">${tds}</tr>`
  }).join('')
  return `<div class="overflow-x-auto my-5 rounded-xl border border-gray-200 shadow-sm"><table class="min-w-full"><thead><tr>${th}</tr></thead><tbody>${trs}</tbody></table></div>`
}

export function parseMarkdown(markdown: string, filePath = ''): string {
  const src = stripFrontmatter(markdown)
  const lines = src.split('\n')
  const out: string[] = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    if (line.startsWith('```')) {
      const code: string[] = []
      i++
      while (i < lines.length && !lines[i].startsWith('```')) { code.push(lines[i]); i++ }
      i++
      out.push(`<pre class="bg-gray-900 text-gray-100 rounded-xl p-4 overflow-x-auto text-sm my-5 font-mono leading-relaxed"><code>${esc(code.join('\n'))}</code></pre>`)
      continue
    }

    if (/^([*\-_])\1{2,}\s*$/.test(line)) {
      out.push('<hr class="border-gray-200 my-6" />')
      i++; continue
    }

    const hm = line.match(/^(#{1,4})\s+(.+)$/)
    if (hm) {
      const lvl = hm[1].length
      const txt = hm[2]
      const id = txt.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-')
      const cls = [
        'text-3xl font-bold text-gray-900 mt-8 mb-4',
        'text-2xl font-bold text-gray-800 mt-8 mb-3 pb-2 border-b border-gray-100',
        'text-xl font-semibold text-gray-800 mt-6 mb-2',
        'text-base font-semibold text-gray-700 mt-4 mb-1',
      ][lvl - 1]
      out.push(`<h${lvl} id="${id}" class="${cls}">${inlineMd(txt, filePath)}</h${lvl}>`)
      i++; continue
    }

    if (line.startsWith('>')) {
      const ql: string[] = []
      while (i < lines.length && lines[i].startsWith('>')) { ql.push(lines[i].slice(1).trim()); i++ }
      out.push(`<blockquote class="border-l-4 border-[#0D9488] bg-[#F0FDFA] rounded-r-xl px-4 py-3 my-4 text-gray-700">${inlineMd(ql.join(' '), filePath)}</blockquote>`)
      continue
    }

    if (/^[-*+] /.test(line)) {
      const items: string[] = []
      while (i < lines.length && /^[-*+] /.test(lines[i])) {
        items.push(`<li class="mb-1 leading-relaxed">${inlineMd(lines[i].replace(/^[-*+] /, ''), filePath)}</li>`)
        i++
      }
      out.push(`<ul class="list-disc list-outside ml-5 space-y-0.5 my-3 text-gray-700">${items.join('')}</ul>`)
      continue
    }

    if (/^\d+\. /.test(line)) {
      const items: string[] = []
      while (i < lines.length && /^\d+\. /.test(lines[i])) {
        items.push(`<li class="mb-1 leading-relaxed">${inlineMd(lines[i].replace(/^\d+\. /, ''), filePath)}</li>`)
        i++
      }
      out.push(`<ol class="list-decimal list-outside ml-5 space-y-0.5 my-3 text-gray-700">${items.join('')}</ol>`)
      continue
    }

    if (line.startsWith('|')) {
      const tl: string[] = []
      while (i < lines.length && lines[i].startsWith('|')) { tl.push(lines[i]); i++ }
      out.push(renderTable(tl, filePath))
      continue
    }

    if (line.trim() === '') { i++; continue }

    const pl: string[] = []
    while (
      i < lines.length &&
      lines[i].trim() !== '' &&
      !/^#{1,4} /.test(lines[i]) &&
      !lines[i].startsWith('>') &&
      !lines[i].startsWith('```') &&
      !/^[-*+] /.test(lines[i]) &&
      !/^\d+\. /.test(lines[i]) &&
      !/^([*\-_])\1{2,}\s*$/.test(lines[i]) &&
      !lines[i].startsWith('|')
    ) { pl.push(lines[i]); i++ }
    if (pl.length) {
      out.push(`<p class="text-gray-600 leading-relaxed my-3">${inlineMd(pl.join(' '), filePath)}</p>`)
    }
  }

  return out.join('')
}

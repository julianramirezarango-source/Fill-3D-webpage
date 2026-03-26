// lib/wiki.ts
// Navigation types, GitHub content fetchers, and markdown renderer for the Fill-3D wiki.

export const REPO_RAW = 'https://raw.githubusercontent.com/Ju4n5e/fill3d-wiki-content/master'

// ─── Navigation types ────────────────────────────────────────────────────────

export interface NavItem {
  label: string
  path?: string       // present on leaf items (the .md file path in the repo)
  children?: NavItem[] // present on folder items
}

export interface NavGroup {
  label: string
  items: NavItem[]
}

// ─── Default navigation ──────────────────────────────────────────────────────
// Hardcoded from the known repo structure. Overridden by navigation.json if present.

export const DEFAULT_NAV: NavGroup[] = [
  {
    label: 'Lo básico',
    items: [
      { label: 'Introducción a la impresión 3D', path: 'lo-basico/introduccion-impresion-3d.md' },
      { label: 'Materiales de impresión 3D', path: 'lo-basico/materiales-impresion-3d.md' },
      { label: 'Impresoras 3D', path: 'lo-basico/impresoras-3d.md' },
      { label: 'Slicers de impresión', path: 'lo-basico/slicers.md' },
      { label: 'Aplicaciones', path: 'lo-basico/aplicaciones.md' },
      { label: 'Datos curiosos del 3D', path: 'lo-basico/datos-curiosos.md' },
      {
        label: 'Partes de la impresora',
        children: [
          { label: 'Boquillas', path: 'lo-basico/partes-impresora/boquillas.md' },
          { label: 'Camas de impresión', path: 'lo-basico/partes-impresora/camas-de-impresion.md' },
          { label: 'Extrusores', path: 'lo-basico/partes-impresora/extrusores.md' },
        ],
      },
      {
        label: 'Materiales',
        children: [
          { label: 'PLA', path: 'lo-basico/materiales/pla.md' },
          { label: 'PETG', path: 'lo-basico/materiales/petg.md' },
          { label: 'PA / Nylon', path: 'lo-basico/materiales/pa-nylon.md' },
          { label: 'PP', path: 'lo-basico/materiales/pp.md' },
          { label: 'Fibras aditivas', path: 'lo-basico/materiales/fibras-aditivas.md' },
        ],
      },
      {
        label: 'Mantenimiento',
        children: [
          { label: 'Mantenimiento', path: 'lo-basico/mantenimiento/mantenimiento.md' },
          { label: 'Accesorios y repuestos', path: 'lo-basico/mantenimiento/accesorios-y-repuestos.md' },
        ],
      },
    ],
  },
  {
    label: 'Consejos de impresión',
    items: [
      { label: 'Por tipo de material', path: 'consejos-de-impresion/por-tipo-de-material.md' },
      { label: 'Problemas comunes', path: 'consejos-de-impresion/problemas-comunes.md' },
      { label: 'Post-procesado', path: 'consejos-de-impresion/post-procesado.md' },
      { label: 'Ciencia de materiales', path: 'consejos-de-impresion/ciencia-de-materiales.md' },
    ],
  },
  {
    label: 'Glosario',
    items: [
      { label: 'Glosario', path: 'glosario/index.md' },
    ],
  },
]

// ─── GitHub fetchers ─────────────────────────────────────────────────────────

/** Try to load navigation.json from the repo. Falls back to DEFAULT_NAV. */
export async function fetchNav(): Promise<NavGroup[]> {
  try {
    const res = await fetch(`${REPO_RAW}/navigation.json`, { cache: 'no-store' })
    if (!res.ok) return DEFAULT_NAV
    const data = await res.json()
    if (Array.isArray(data?.groups)) return data.groups as NavGroup[]
  } catch { /* network error — use default */ }
  return DEFAULT_NAV
}

/** Fetch a markdown file from the repo by its path (e.g. "lo-basico/slicers.md"). */
export async function fetchArticle(path: string): Promise<string | null> {
  try {
    const res = await fetch(`${REPO_RAW}/${path}`, { cache: 'no-store' })
    if (!res.ok) return null
    return res.text()
  } catch {
    return null
  }
}

/** Extract the article title from frontmatter or the first H1 heading. */
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
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/** Resolve a possibly-relative image src to an absolute raw GitHub URL. */
function resolveImg(src: string, filePath: string): string {
  if (/^https?:\/\//.test(src)) return src
  const dir = filePath.split('/').slice(0, -1).join('/')
  const rel = src.replace(/^\.\//, '')
  return `${REPO_RAW}/${dir ? dir + '/' : ''}${rel}`
}

/** Render inline markdown: bold, italic, code, links, images. */
function inlineMd(text: string, filePath: string): string {
  return text
    // Images (must come before links)
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_, alt, src) =>
      `<img src="${resolveImg(src, filePath)}" alt="${esc(alt)}" loading="lazy" class="max-w-full rounded-lg my-3" />`)
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, t, href) => {
      const isExternal = /^https?:\/\//.test(href)
      return `<a href="${esc(href)}"${isExternal ? ' target="_blank" rel="noopener noreferrer"' : ''} class="text-[#5E33D9] underline underline-offset-2 hover:text-[#4F25C6] transition-colors">${esc(t)}</a>`
    })
    // Bold
    .replace(/\*\*([^*\n]+)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>')
    // Italic
    .replace(/(?<!\*)\*([^*\n]+)\*(?!\*)/g, '<em class="italic">$1</em>')
    // Inline code
    .replace(/`([^`\n]+)`/g, '<code class="bg-gray-100 text-[#5E33D9] px-1.5 py-0.5 rounded text-[0.85em] font-mono">$1</code>')
}

function renderTable(rows: string[], filePath: string): string {
  const parseRow = (line: string) => line.split('|').slice(1, -1).map(c => c.trim())
  const allRows = rows.map(parseRow)
  if (allRows.length < 2) return ''
  const [header, , ...body] = allRows
  const th = header
    .map(h => `<th class="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide bg-gray-50 border-b border-gray-200 whitespace-nowrap">${inlineMd(h, filePath)}</th>`)
    .join('')
  const trs = body
    .map((row, ri) => {
      const tds = row
        .map(c => `<td class="px-4 py-2 text-sm text-gray-700 border-b border-gray-100">${inlineMd(c, filePath)}</td>`)
        .join('')
      return `<tr class="${ri % 2 === 1 ? 'bg-gray-50' : ''}">${tds}</tr>`
    })
    .join('')
  return `<div class="overflow-x-auto my-4 rounded-xl border border-gray-200 shadow-sm"><table class="min-w-full"><thead><tr>${th}</tr></thead><tbody>${trs}</tbody></table></div>`
}

/** Convert a markdown string to an HTML string. Strips YAML frontmatter. */
export function parseMarkdown(markdown: string, filePath = ''): string {
  const src = stripFrontmatter(markdown)
  const lines = src.split('\n')
  const out: string[] = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    // ── Fenced code block ────────────────────────────────────────────────────
    if (line.startsWith('```')) {
      const code: string[] = []
      i++
      while (i < lines.length && !lines[i].startsWith('```')) {
        code.push(lines[i])
        i++
      }
      i++ // skip closing ```
      out.push(
        `<pre class="bg-gray-900 text-gray-100 rounded-xl p-4 overflow-x-auto text-sm my-4 font-mono leading-relaxed"><code>${esc(code.join('\n'))}</code></pre>`,
      )
      continue
    }

    // ── Horizontal rule ──────────────────────────────────────────────────────
    if (/^([*\-_])\1{2,}\s*$/.test(line)) {
      out.push('<hr class="border-gray-200 my-6" />')
      i++
      continue
    }

    // ── Heading ──────────────────────────────────────────────────────────────
    const hm = line.match(/^(#{1,4})\s+(.+)$/)
    if (hm) {
      const lvl = hm[1].length
      const txt = hm[2]
      const id = txt
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
      const cls = [
        'text-3xl font-bold text-gray-900 mt-8 mb-4',
        'text-2xl font-bold text-gray-800 mt-8 mb-3 pb-2 border-b border-gray-200',
        'text-xl font-semibold text-gray-800 mt-6 mb-2',
        'text-base font-semibold text-gray-700 mt-4 mb-1',
      ][lvl - 1]
      out.push(`<h${lvl} id="${id}" class="${cls}">${inlineMd(txt, filePath)}</h${lvl}>`)
      i++
      continue
    }

    // ── Blockquote ───────────────────────────────────────────────────────────
    if (line.startsWith('>')) {
      const ql: string[] = []
      while (i < lines.length && lines[i].startsWith('>')) {
        ql.push(lines[i].slice(1).trim())
        i++
      }
      out.push(
        `<blockquote class="border-l-4 border-[#5E33D9] bg-[#f5f3ff] rounded-r-xl px-4 py-3 my-4 text-gray-700 not-italic">${inlineMd(ql.join(' '), filePath)}</blockquote>`,
      )
      continue
    }

    // ── Unordered list ───────────────────────────────────────────────────────
    if (/^[-*+] /.test(line)) {
      const items: string[] = []
      while (i < lines.length && /^[-*+] /.test(lines[i])) {
        items.push(`<li class="mb-1 leading-relaxed">${inlineMd(lines[i].replace(/^[-*+] /, ''), filePath)}</li>`)
        i++
      }
      out.push(`<ul class="list-disc list-outside ml-5 space-y-0.5 my-3 text-gray-700">${items.join('')}</ul>`)
      continue
    }

    // ── Ordered list ─────────────────────────────────────────────────────────
    if (/^\d+\. /.test(line)) {
      const items: string[] = []
      while (i < lines.length && /^\d+\. /.test(lines[i])) {
        items.push(`<li class="mb-1 leading-relaxed">${inlineMd(lines[i].replace(/^\d+\. /, ''), filePath)}</li>`)
        i++
      }
      out.push(`<ol class="list-decimal list-outside ml-5 space-y-0.5 my-3 text-gray-700">${items.join('')}</ol>`)
      continue
    }

    // ── Table ────────────────────────────────────────────────────────────────
    if (line.startsWith('|')) {
      const tl: string[] = []
      while (i < lines.length && lines[i].startsWith('|')) {
        tl.push(lines[i])
        i++
      }
      out.push(renderTable(tl, filePath))
      continue
    }

    // ── Empty line ───────────────────────────────────────────────────────────
    if (line.trim() === '') {
      i++
      continue
    }

    // ── Paragraph ────────────────────────────────────────────────────────────
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
    ) {
      pl.push(lines[i])
      i++
    }
    if (pl.length) {
      out.push(`<p class="text-gray-700 leading-relaxed my-3">${inlineMd(pl.join(' '), filePath)}</p>`)
    }
  }

  return out.join('')
}

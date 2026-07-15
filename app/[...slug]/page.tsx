// app/[...slug]/page.tsx
// Página estática por artículo (SSG): el markdown se descarga y renderiza EN BUILD,
// así el texto completo queda en el HTML crudo — indexable por Google y crawlers de IA.

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { parseMarkdown, extractTitle } from '@/lib/wiki'
import { fetchNavBuild, fetchArticleBuild, collectPages, extractDescription, SITE } from '@/lib/routes'
import WikiShell from '@/components/WikiShell'

export const dynamic = 'force-static'
export const dynamicParams = false

export async function generateStaticParams() {
  const nav = await fetchNavBuild()
  return collectPages(nav).map(p => ({ slug: p.slug }))
}

async function pageFor(slug: string[]) {
  const nav = await fetchNavBuild()
  const page = collectPages(nav).find(p => p.slug.join('/') === slug.join('/'))
  return { nav, page }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string[] }> }): Promise<Metadata> {
  const { slug } = await params
  const { page } = await pageFor(slug)
  if (!page) return {}
  const md = await fetchArticleBuild(page.mdPath)
  const title = `${(md && extractTitle(md)) || page.label} | Wiki Fill3D`
  const description = md
    ? extractDescription(md, `${page.label} — guía técnica de impresión 3D por Fill3D, fabricantes de filamento en Itagüí, Colombia.`)
    : `${page.label} — guía técnica de impresión 3D por Fill3D.`
  const canonical = `${SITE}/wiki/${slug.join('/')}/`
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { title, description, url: canonical, type: 'article', siteName: 'Wiki Fill3D', locale: 'es_CO' },
  }
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params
  const { nav, page } = await pageFor(slug)
  if (!page) notFound()

  const md = await fetchArticleBuild(page.mdPath)
  if (!md) notFound()

  const title = extractTitle(md) || page.label
  const description = extractDescription(md, `${page.label} — guía técnica de impresión 3D por Fill3D.`)
  const canonical = `${SITE}/wiki/${slug.join('/')}/`
  const html = parseMarkdown(md, page.mdPath)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: title,
    description,
    inLanguage: 'es',
    mainEntityOfPage: canonical,
    url: canonical,
    publisher: {
      '@type': 'Organization',
      name: 'Fill3D',
      url: `${SITE}/`,
      logo: { '@type': 'ImageObject', url: `${SITE}/wiki/logo.svg` },
    },
    author: { '@type': 'Organization', name: 'Fill3D' },
  }

  return (
    <WikiShell
      nav={nav}
      currentMd={page.mdPath}
      breadcrumb={{ group: page.group, parent: page.parent, article: title }}
    >
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {/* El H1 viene del propio markdown (un solo H1 por página) */}
      <article className="max-w-3xl" dangerouslySetInnerHTML={{ __html: html }} />
    </WikiShell>
  )
}

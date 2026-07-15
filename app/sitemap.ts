// app/sitemap.ts
// Genera /wiki/sitemap.xml en build con todas las rutas estáticas de la wiki.

import type { MetadataRoute } from 'next'
import { fetchNavBuild, collectPages, SITE } from '@/lib/routes'

export const dynamic = 'force-static'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const nav = await fetchNavBuild()
  const now = new Date()

  const urls: MetadataRoute.Sitemap = [
    { url: `${SITE}/wiki/`, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE}/wiki/perfiles-orcaslicer/`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${SITE}/wiki/perfiles-creality-print/`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${SITE}/wiki/calculadora/`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
  ]
  for (const p of collectPages(nav)) {
    urls.push({
      url: `${SITE}/wiki/${p.slug.join('/')}/`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    })
  }
  return urls
}

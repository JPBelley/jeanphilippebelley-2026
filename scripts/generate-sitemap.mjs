import { writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')

// ── Import data ────────────────────────────────────────────────────────────────
const { default: posts }       = await import(`${ROOT}/app/data/posts.js`)
const { default: experiments } = await import(`${ROOT}/app/data/experiments.js`)

const BASE = 'https://jeanphilippebelley.com'

const staticRoutes = [
  { url: BASE,                     priority: '1.0', changefreq: 'monthly' },
  { url: `${BASE}/blog`,           priority: '0.8', changefreq: 'weekly'  },
  { url: `${BASE}/experiments`,    priority: '0.8', changefreq: 'weekly'  },
  { url: `${BASE}/design-system`,  priority: '0.6', changefreq: 'monthly' },
  { url: `${BASE}/architecture`,   priority: '0.6', changefreq: 'monthly' },
]

const postRoutes = posts
  .filter(p => p.published)
  .map(p => ({ url: `${BASE}/blog/${p.slug}`, priority: '0.7', changefreq: 'monthly' }))

const experimentRoutes = experiments
  .filter(e => e.published)
  .map(e => ({ url: `${BASE}${e.href}`, priority: '0.5', changefreq: 'monthly' }))

const routes = [...staticRoutes, ...postRoutes, ...experimentRoutes]

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes.map(r => `  <url>
    <loc>${r.url}</loc>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority}</priority>
  </url>`).join('\n')}
</urlset>`

const outPath = resolve(ROOT, 'out', 'sitemap.xml')
writeFileSync(outPath, xml, 'utf-8')
console.log(`✓ sitemap.xml generated (${routes.length} URLs)`)

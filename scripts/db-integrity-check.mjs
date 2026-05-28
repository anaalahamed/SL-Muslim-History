/**
 * Supabase Database Integrity Check & Fix Script
 *
 * Run with:
 *   SUPABASE_URL=https://uwyqvqnqtzpbrjmhavvq.supabase.co \
 *   SUPABASE_SERVICE_KEY=<service_role key from Dashboard → Settings → API> \
 *   node scripts/db-integrity-check.mjs
 *
 * Flags:
 *   --fix                  Apply automatic corrections (default: dry-run / report only)
 *   --delete-malformed     DELETE rows with unrecoverable slugs (requires --fix)
 *
 * Table names (actual schema):
 *   articles   — id, slug, title, category, category_slug, author, published_at, ...
 *   news       — id, slug, title, news_type, published_at, ...
 *   categories — id, slug, name_en, name_ta, ...
 */

import { createClient } from '@supabase/supabase-js'

const FIX    = process.argv.includes('--fix')
const DELETE = process.argv.includes('--delete-malformed')
const DRY    = !FIX

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('ERROR: Set SUPABASE_URL and SUPABASE_SERVICE_KEY environment variables.')
  console.error('  SUPABASE_URL        — project URL (e.g. https://uwyqvqnqtzpbrjmhavvq.supabase.co)')
  console.error('  SUPABASE_SERVICE_KEY — service_role key from Dashboard → Settings → API')
  process.exit(1)
}

const db = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
})

// ── helpers ──────────────────────────────────────────────────────────────────

function isValidSlug(slug) {
  if (!slug || typeof slug !== 'string' || slug.trim() === '') return false
  if (slug.length < 3) return false
  if (/--/.test(slug)) return false
  if (slug.startsWith('-') || slug.endsWith('-')) return false
  return true
}

function findDuplicates(rows) {
  const seen = {}, dups = []
  for (const r of rows) {
    if (!r.slug) continue
    if (seen[r.slug]) dups.push(r.slug)
    else seen[r.slug] = true
  }
  return [...new Set(dups)]
}

function report(label, items) {
  if (items.length === 0) {
    console.log(`  ✅  ${label}: none`)
  } else {
    console.log(`  ⚠️  ${label}: ${items.length} found`)
    for (const item of items) console.log('     ', JSON.stringify(item))
  }
}

// ── fetch ────────────────────────────────────────────────────────────────────

console.log('\n📥 Fetching all records…\n')

const [artRes, newsRes, catRes] = await Promise.all([
  db.from('articles')
    .select('id, slug, title, category_slug, author, published_at')
    .order('published_at', { ascending: false }),
  db.from('news')
    .select('id, slug, title, news_type, published_at')
    .order('published_at', { ascending: false }),
  db.from('categories')
    .select('id, slug, name_en, name_ta'),
])

if (artRes.error)  { console.error('articles fetch failed:',   artRes.error.message);  process.exit(1) }
if (newsRes.error) { console.error('news fetch failed:',       newsRes.error.message); process.exit(1) }
if (catRes.error)  { console.error('categories fetch failed:', catRes.error.message);  process.exit(1) }

const articles   = artRes.data  ?? []
const news       = newsRes.data ?? []
const categories = catRes.data  ?? []
const catSlugs   = new Set(categories.map(c => c.slug))

console.log(`  articles:   ${articles.length}`)
console.log(`  news:       ${news.length}`)
console.log(`  categories: ${categories.length}`)

// ── articles ─────────────────────────────────────────────────────────────────

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('ARTICLES')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

const artNullSlug  = articles.filter(a => !a.slug || a.slug.trim() === '')
const artBadSlug   = articles.filter(a => a.slug && !isValidSlug(a.slug))
const artDupSlug   = findDuplicates(articles)
const artBadCat    = articles.filter(a => a.category_slug && !catSlugs.has(a.category_slug))
const artNoAuthor  = articles.filter(a => !a.author || a.author.trim() === '')

report('Null/empty slugs',     artNullSlug.map(a => ({ id: a.id, slug: a.slug, title: a.title?.slice(0, 50) })))
report('Malformed slugs',      artBadSlug.map(a => ({ id: a.id, slug: a.slug, title: a.title?.slice(0, 50) })))
report('Duplicate slugs',      artDupSlug.map(s => ({ slug: s })))
report('Broken category_slug', artBadCat.map(a => ({ id: a.id, slug: a.slug, category_slug: a.category_slug })))
report('Missing author',       artNoAuthor.map(a => ({ id: a.id, slug: a.slug })))

// ── news ──────────────────────────────────────────────────────────────────────

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('NEWS')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

const newsNullSlug  = news.filter(n => !n.slug || n.slug.trim() === '')
const newsBadSlug   = news.filter(n => n.slug && !isValidSlug(n.slug))
const newsDupSlug   = findDuplicates(news)
const newsBadType   = news.filter(n => !['janaza', 'special'].includes(n.news_type))

report('Null/empty slugs',  newsNullSlug.map(n => ({ id: n.id, slug: n.slug, title: n.title?.slice(0, 50) })))
report('Malformed slugs',   newsBadSlug.map(n => ({ id: n.id, slug: n.slug, title: n.title?.slice(0, 50) })))
report('Duplicate slugs',   newsDupSlug.map(s => ({ slug: s })))
report('Invalid news_type', newsBadType.map(n => ({ id: n.id, news_type: n.news_type })))

// ── categories ────────────────────────────────────────────────────────────────

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('CATEGORIES')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

const catNullSlug = categories.filter(c => !c.slug || c.slug.trim() === '')
const catBadSlug  = categories.filter(c => c.slug && !isValidSlug(c.slug))
const catDupSlug  = findDuplicates(categories)
const catNoName   = categories.filter(c => !c.name_en || !c.name_ta)

report('Null/empty slugs',       catNullSlug.map(c => ({ id: c.id, slug: c.slug })))
report('Malformed slugs',        catBadSlug.map(c => ({ id: c.id, slug: c.slug, name_en: c.name_en })))
report('Duplicate slugs',        catDupSlug.map(s => ({ slug: s })))
report('Missing name_en/name_ta', catNoName.map(c => ({ id: c.id, slug: c.slug })))

// ── fixes ─────────────────────────────────────────────────────────────────────

const malformedArticles = [...artNullSlug, ...artBadSlug]
const malformedNews     = [...newsNullSlug, ...newsBadSlug]

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log(DRY ? 'DRY RUN — no changes written' : 'APPLYING FIXES')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

if (malformedArticles.length === 0 && malformedNews.length === 0) {
  console.log('  Nothing to fix — all slugs are valid.\n')
} else if (DRY) {
  console.log(`  Would act on ${malformedArticles.length} article(s) and ${malformedNews.length} news post(s).`)
  console.log('  Re-run with --fix --delete-malformed to delete them.')
} else if (DELETE) {
  for (const a of malformedArticles) {
    console.log(`  🗑  Deleting article id=${a.id}  slug="${a.slug}"`)
    const { error } = await db.from('articles').delete().eq('id', a.id)
    console.log(error ? `     ERROR: ${error.message}` : '     ✅ deleted')
  }
  for (const n of malformedNews) {
    console.log(`  🗑  Deleting news id=${n.id}  slug="${n.slug}"`)
    const { error } = await db.from('news').delete().eq('id', n.id)
    console.log(error ? `     ERROR: ${error.message}` : '     ✅ deleted')
  }
} else {
  console.log('  Malformed rows found — review and fix manually in Supabase, or re-run with --delete-malformed.')
  for (const a of malformedArticles) console.log(`    article id=${a.id}  slug="${a.slug}"  "${a.title?.slice(0, 60)}"`)
  for (const n of malformedNews)     console.log(`    news    id=${n.id}  slug="${n.slug}"  "${n.title?.slice(0, 60)}"`)
}

// ── summary ───────────────────────────────────────────────────────────────────

const total =
  artNullSlug.length + artBadSlug.length + artDupSlug.length + artBadCat.length +
  newsNullSlug.length + newsBadSlug.length + newsDupSlug.length +
  catNullSlug.length + catBadSlug.length + catDupSlug.length

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('SUMMARY')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log(`  Total issues: ${total}`)
console.log(`  Articles:     ${articles.length} rows checked`)
console.log(`  News:         ${news.length} rows checked`)
console.log(`  Categories:   ${categories.length} rows checked`)
console.log()

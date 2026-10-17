import { readdir, readFile, stat } from 'node:fs/promises'
import { dirname, extname, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parse } from 'yaml'

const appRoot = fileURLToPath(new URL('..', import.meta.url))
const sourceRoot = resolve(appRoot, 'src/app')
const docsRoot = resolve(sourceRoot, 'docs')

const pairs = [
  ['templates/plugin/README.md', 'src/app/templates/plugin/plugin-template.md'],
  ['src/app/documentation.lua', 'test/documentation/src/documentation.lua'],
]

let failed = false
for (const [source, published] of pairs) {
  const [left, right] = await Promise.all([
    readFile(new URL(`../${source}`, import.meta.url), 'utf8'),
    readFile(new URL(`../${published}`, import.meta.url), 'utf8'),
  ])
  if (left !== right) {
    console.error(`Wiki mirror is stale: ${published} must match ${source}`)
    failed = true
  }
}

async function walk(directory) {
  const out = []
  for (const item of await readdir(directory, { withFileTypes: true })) {
    const full = resolve(directory, item.name)
    if (item.isDirectory()) out.push(...await walk(full))
    else out.push(full)
  }
  return out
}

// Documentation entries live in any registry index under src/app, not only the
// namespace definition file.
const registryIndexes = (await walk(sourceRoot)).filter((file) => file.endsWith(`${sep}_index.yaml`)).sort()
const registryEntries = (await Promise.all(registryIndexes.map(async (file) => {
  const registry = parse(await readFile(file, 'utf8'))
  return (registry.entries ?? []).map((entry) => ({ entry, base: dirname(file) }))
}))).flat()
if (registryEntries.some(({ entry }) => entry.kind === 'ns.definition' && Object.hasOwn(entry, 'wiki'))) {
  console.error('Documentation must use wippy.documentation.page registry entries, not ns.definition.wiki')
  failed = true
}

const documentEntries = registryEntries
  .flatMap(({ entry, base }) => {
    if (entry.kind !== 'registry.entry' || entry.meta?.type !== 'wippy.documentation.page') return []
    const name = entry.name
    const { path, content: source, document_kind: kind } = entry.data ?? {}
    const content = typeof source === 'string' ? source.match(/^file:\/\/(.+\.md)$/)?.[1] : undefined
    if (typeof name !== 'string' || !name || typeof path !== 'string' || !path.endsWith('.md')
      || !content || typeof kind !== 'string' || !kind) {
      console.error(`Invalid documentation page entry: ${name ?? 'unknown'}`)
      failed = true
      return []
    }
    return [{ id: `app:${name}`, path, content: relative(sourceRoot, resolve(base, content)).split(sep).join('/'), kind }]
  })

const documentSources = new Set()
const documentPaths = new Set()
for (const entry of documentEntries) {

  if (!new Set(['guide', 'rfc']).has(entry.kind)) {
    console.error(`Unsupported documentation kind for ${entry.id}: ${entry.kind}`)
    failed = true
  }

  try {
    await stat(resolve(sourceRoot, entry.content))
  } catch {
    console.error(`Documentation entry source does not exist: ${entry.content}`)
    failed = true
  }

  if (documentSources.has(entry.content)) {
    console.error(`Duplicate documentation source: ${entry.content}`)
    failed = true
  }
  if (documentPaths.has(entry.path)) {
    console.error(`Duplicate documentation path: ${entry.path}`)
    failed = true
  }
  documentSources.add(entry.content)
  documentPaths.add(entry.path)
}

function* navigationDocuments(items) {
  for (const item of items) {
    if (Object.hasOwn(item, 'document')) yield item.document
    if (item.items) yield* navigationDocuments(item.items)
  }
}

const navigationEntry = registryEntries.map(({ entry }) => entry).find((entry) =>
  entry.name === 'documentation.navigation' && entry.kind === 'registry.entry'
    && entry.meta?.type === 'wippy.documentation.navigation',
)
if (!navigationEntry) {
  console.error('Missing documentation.navigation registry entry')
  failed = true
} else {
  const documentIDs = new Set(documentEntries.map((entry) => entry.id))
  for (const id of navigationDocuments(navigationEntry.data.items)) {
    if (!documentIDs.has(id)) {
      console.error(`Documentation navigation references an unknown page: ${id}`)
      failed = true
    }
  }
}

const pages = [
  resolve(sourceRoot, 'README.md'),
  ...(await walk(docsRoot)).filter((path) => extname(path) === '.md'),
  resolve(sourceRoot, 'templates/plugin/plugin-template.md'),
]

let totalBytes = 0
for (const page of pages) {
  const sourceRelative = relative(sourceRoot, page).split(sep).join('/')
  if (!documentSources.has(sourceRelative)) {
    console.error(`Documentation page is not published by a registry entry: ${sourceRelative}`)
    failed = true
  }

  const pageStat = await stat(page)
  totalBytes += pageStat.size
  if (pageStat.size > 256 * 1024) {
    console.error(`Documentation page exceeds 256 KiB: ${sourceRelative}`)
    failed = true
  }

  const markdown = await readFile(page, 'utf8')
  const markdownLines = markdown.split('\n')
  let fenced = false
  for (let index = 0; index + 1 < markdownLines.length; index += 1) {
    const line = markdownLines[index]
    if (/^\s*(```|~~~)/.test(line)) {
      fenced = !fenced
      continue
    }
    if (!fenced && /^\s*\|.*\|\s*$/.test(line)
      && /^\s*\|(?:\s*:?-{3,}:?\s*\|)+\s*$/.test(markdownLines[index + 1])) {
      console.error(`Unsupported pipe table in documentation page: ${sourceRelative}:${index + 1}`)
      failed = true
    }
  }

  const links = markdown.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)
  for (const match of links) {
    const rawTarget = match[1].trim().replace(/^<|>$/g, '')
    if (!rawTarget || rawTarget.startsWith('#') || /^[a-z][a-z0-9+.-]*:/i.test(rawTarget)) continue
    const fileTarget = rawTarget.split('#', 1)[0]
    if (!fileTarget) continue
    const resolvedTarget = resolve(dirname(page), decodeURIComponent(fileTarget))
    if (!resolvedTarget.startsWith(`${sourceRoot}${sep}`) && resolvedTarget !== sourceRoot) {
      console.error(`Documentation link escapes published source root: ${sourceRelative} -> ${rawTarget}`)
      failed = true
      continue
    }
    try {
      await stat(resolvedTarget)
    } catch {
      console.error(`Broken documentation link: ${sourceRelative} -> ${rawTarget}`)
      failed = true
    }
  }
}

if (totalBytes > 2 * 1024 * 1024) {
  console.error(`Documentation exceeds 2 MiB total: ${totalBytes} bytes`)
  failed = true
}

if (failed) process.exit(1)
console.log(`Documentation source check passed (${pages.length} pages, ${totalBytes} bytes)`)

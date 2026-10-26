import { readFile, stat } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

export async function checkAppBundle(appDir) {
  const bundle = resolve(appDir, 'static/app/main')
  async function requireFile(path) {
    const info = await stat(path)
    if (!info.isFile() || info.size === 0) throw new Error(`Application asset is empty: ${path}`)
  }
  function localAsset(reference, from = bundle) {
    const value = reference.split(/[?#]/, 1)[0].replace(/^\/app\/app\/main\//, '')
    const path = resolve(from, value)
    const within = relative(bundle, path)
    if (within.startsWith('../') || within === '..' || within === '' || value.startsWith('/')) {
      throw new Error(`Application contains an invalid local asset path: ${reference}`)
    }
    return path
  }
  const htmlPath = join(bundle, 'app.html')
  await requireFile(htmlPath)
  const html = await readFile(htmlPath, 'utf8')
  if (!/<div\b[^>]*\bid=["']app["']/.test(html)) throw new Error('Application mount point is missing')
  const references = [...html.matchAll(/(?:src|href)=["']([^"']+)["']/g)]
    .map(match => match[1])
    .filter(value => !/^(?:[a-z]+:|\/\/|#)/i.test(value))
    .map(value => value.replace(/^\/app\/app\/main\//, '').replace(/^\.\//, ''))
    .filter(Boolean)
  if (!references.some(value => value.endsWith('.js'))) throw new Error('Local JavaScript entrypoint is missing')
  for (const reference of new Set(references)) {
    const path = resolve(bundle, reference)
    const fromBundle = relative(bundle, path)
    if (fromBundle.startsWith('../') || fromBundle === '..' || path === bundle || reference.startsWith('/')) {
      throw new Error(`Application contains an invalid local asset path: ${reference}`)
    }
    await requireFile(path)
  }
  await requireFile(join(bundle, 'wippy-meta.json'))
  const manifest = JSON.parse(await readFile(join(bundle, 'vendor/manifest.json'), 'utf8'))
  if (!manifest.files || !manifest.imports || !Object.keys(manifest.files).length) {
    throw new Error('Application vendor manifest is missing its assets')
  }
  for (const [name, expected] of Object.entries(manifest.files)) {
    const path = localAsset(name)
    await requireFile(path)
    const digest = 'sha256-' + createHash('sha256').update(await readFile(path)).digest('base64')
    if (digest !== expected) throw new Error(`Application asset integrity mismatch: ${name}`)
  }
  for (const entry of Object.values(manifest.imports)) await requireFile(localAsset(entry.file))
  const importMapText = html.match(/<script\b[^>]*type=["']importmap["'][^>]*>([\s\S]*?)<\/script>/)?.[1]
  if (!importMapText) throw new Error('Application import map is missing')
  const importMap = JSON.parse(importMapText)
  for (const entry of Object.values(manifest.imports)) {
    if (!Object.values(importMap.imports || {}).includes('/app/app/main/' + entry.file)) {
      throw new Error(`Application import map omits vendor asset: ${entry.file}`)
    }
  }
  const stylesheets = Object.keys(manifest.files).filter(name => name.endsWith('.css'))
    .map(name => join(bundle, name))
  stylesheets.push(resolve(appDir, 'static/custom-css.facade.generated.css'))
  for (const stylesheet of stylesheets) {
    await requireFile(stylesheet)
    const css = await readFile(stylesheet, 'utf8')
    for (const match of css.matchAll(/url\(\s*["']?([^\s"')]+)["']?\s*\)/g)) {
      const reference = match[1]
      if (/^(?:[a-z]+:|\/\/|#)/i.test(reference)) continue
      await requireFile(localAsset(reference, reference.startsWith('/app/app/main/') ? bundle : dirname(stylesheet)))
    }
  }
  return references.length
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const count = await checkAppBundle(join(dirname(fileURLToPath(import.meta.url)), '..'))
  console.log(`Application bundle verified: ${count} local asset reference(s)`)
}

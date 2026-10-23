import { readFile, readdir, stat } from 'node:fs/promises'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

export async function checkAppBundle(appDir) {
  const bundle = resolve(appDir, 'static/app/main')
  async function requireFile(path) {
    const info = await stat(path)
    if (!info.isFile() || info.size === 0) throw new Error(`Application asset is empty: ${path}`)
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
  const staticDir = resolve(appDir, 'static')
  for (const name of await readdir(staticDir, { recursive: true })) {
    if (!name.endsWith('.css')) continue
    const path = join(staticDir, name)
    const css = await readFile(path, 'utf8')
    for (const match of css.matchAll(/url\(\s*(?:(["'])(.*?)\1|([^\s)]+))\s*\)/g)) {
      const reference = match[2] ?? match[3]
      if (/^(?:[a-z]+:|\/\/|#)/i.test(reference)) continue
      const target = reference.startsWith('/app/')
        ? resolve(staticDir, reference.slice('/app/'.length))
        : resolve(dirname(path), reference)
      const fromStatic = relative(staticDir, target)
      if (fromStatic.startsWith('../') || fromStatic === '..' || target === staticDir) {
        throw new Error(`Application contains an invalid local asset path: ${reference}`)
      }
      await requireFile(target)
    }
  }
  return references.length
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const count = await checkAppBundle(join(dirname(fileURLToPath(import.meta.url)), '..'))
  console.log(`Application bundle verified: ${count} local asset reference(s)`)
}

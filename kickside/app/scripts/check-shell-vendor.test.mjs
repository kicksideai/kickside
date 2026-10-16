import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { createRequire } from 'node:module'
import { posix } from 'node:path'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import test from 'node:test'

const app = new URL('../', import.meta.url)
const bundle = new URL('static/app/main/', app)
const require = createRequire(new URL('frontend/applications/main/package.json', app))
const { init, parse } = await import(require.resolve('es-module-lexer'))
await init
const sri = bytes => 'sha256-' + createHash('sha256').update(bytes).digest('base64')

test('EE2-2576: shell import map resolves lockfile versions and verified local artifacts', async () => {
  const html = await readFile(new URL('app.html', bundle), 'utf8')
  const match = html.match(/<script\b[^>]*type="importmap"[^>]*>([\s\S]*?)<\/script>/)
  assert.ok(match, 'Shell import map exists')
  assert.ok(match.index < html.indexOf('data-role="@wippy/scripts"'),
    'Shell import map precedes host bootstrap module resolution')
  assert.match(match[0], /id="kickside-shell-import-map"/, 'Shell import map has explicit ownership')
  assert.match(html, /<script\b[^>]*data-role=["']@wippy\/scripts["'][^>]*>/,
    'Shell preserves the host bootstrap injection marker')
  const imports = JSON.parse(match[1]).imports
  assert.deepEqual(JSON.parse(match[1]).scopes, { '/app/app/main/': imports },
    'Shell dependencies retain their own import-map scope when the host merges its global imports')
  assert.ok(Object.keys(imports).length > 30, 'Existing shell module mappings remain available')
  for (const [specifier, path] of Object.entries(imports)) {
    assert.ok(path.startsWith('/app/app/main/vendor/'), `${specifier} uses a vendored instance asset: ${path}`)
  }
  assert.doesNotMatch(html.replace(/<script\b[^>]*type="application\/json"[^>]*>[\s\S]*?<\/script>/g, ''),
    /(?:src|href)=["'](?:https?:)?\/\//, 'Shell contains no remote script, font or preload')
  const manifest = JSON.parse(await readFile(new URL('vendor/manifest.json', bundle), 'utf8'))
  const lock = JSON.parse(await readFile(new URL('frontend/applications/main/package-lock.json', app), 'utf8'))
  assert.ok(manifest.packages['node_modules/@iconify-json/tabler'],
    'SHELL-VENDOR-ICONS-001: canonical Tabler data belongs to the verified bundle')
  assert.deepEqual(Object.keys(manifest.imports).sort(), Object.keys(imports).sort())
  for (const [specifier, path] of Object.entries(imports)) {
    const entry = manifest.imports[specifier]
    const pinned = lock.packages['node_modules/' + entry.package]
    assert.equal(entry.version, pinned.version, specifier)
    assert.equal(entry.integrity, pinned.integrity, specifier)
    assert.equal(path, '/app/app/main/' + entry.file, specifier)
    assert.ok(entry.file.includes('@' + pinned.version + '/'), `${specifier} URL identifies its lock version`)
    assert.ok(manifest.files[entry.file], `${specifier} has an artifact digest`)
  }
  for (const [name, digest] of Object.entries(manifest.files)) {
    assert.ok(!name.startsWith('/') && !name.split('/').includes('..'), name)
    const bytes = await readFile(new URL(name, bundle))
    assert.equal(sri(bytes), digest, name)
    if (name.endsWith('.js')) {
      for (const reference of parse(bytes.toString())[0]) {
        if (!reference.n) continue
        if (reference.n.startsWith('./') || reference.n.startsWith('../')) {
          const target = posix.normalize(posix.join(posix.dirname(name), reference.n))
          assert.ok(manifest.files[target], `${name} resolves ${reference.n} to a verified local artifact`)
        } else {
          assert.ok(reference.n.startsWith('/app/app/main/'), `${name} imports an instance asset: ${reference.n}`)
          assert.ok(manifest.files[reference.n.slice('/app/app/main/'.length)],
            `${name} imports a verified vendored artifact: ${reference.n}`)
        }
      }
    }
  }
  for (const [name, pinned] of Object.entries(manifest.packages)) {
    assert.equal(pinned.version, lock.packages[name].version, name)
    assert.equal(pinned.integrity, lock.packages[name].integrity, name)
  }
  const css = await readFile(new URL('static/custom-css.facade.generated.css', app), 'utf8')
  for (const reference of css.matchAll(/url\(['"](\/app\/app\/main\/[^'"]+)['"]\)/g)) {
    assert.ok(manifest.files[reference[1].slice('/app/app/main/'.length)], reference[1])
  }
  assert.doesNotMatch(css, /(?:https?:)?\/\//, 'App CSS contains no remote font import')
  const login = await readFile(new URL('src/app/login/login.jet', app), 'utf8')
  assert.doesNotMatch(login, /@import\s+url\(["']?(?:https?:)?\/\//,
    'Login uses the vendored fonts from app CSS')
  console.log('Verified ' + fileURLToPath(bundle))
})

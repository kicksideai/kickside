// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { checkAppBundle } from './check-app-bundle.mjs'

async function fixture(t) {
  const root = await mkdtemp(join(tmpdir(), 'app-release-assets-'))
  t.after(() => rm(root, { recursive: true, force: true }))
  const bundle = join(root, 'static/app/main')
  await mkdir(join(bundle, 'vendor'), { recursive: true })
  await mkdir(join(bundle, 'fonts'), { recursive: true })
  const files = {
    'app.html': '<script type="importmap">{"imports":{"vue":"/app/app/main/vendor/vue.js"}}</script><div id="app"></div><script src="./app.js"></script><link href="./app.css" rel="stylesheet">',
    'app.js': 'export const app = true',
    'app.css': '@font-face{src:url(./fonts/main.woff2)}',
    'fonts/main.woff2': 'fixture-font',
    'vendor/vue.js': 'export const vendor = true',
  }
  for (const [name, content] of Object.entries(files)) await writeFile(join(bundle, name), content)
  await writeFile(join(bundle, 'wippy-meta.json'), '{}')
  await writeFile(join(root, 'static/custom-css.facade.generated.css'), '@font-face{src:url(/app/app/main/fonts/main.woff2)}')
  const manifest = { imports: { vue: { file: 'vendor/vue.js' } }, files: {} }
  for (const [name, bytes] of Object.entries(files)) {
    manifest.files[name] = 'sha256-' + createHash('sha256').update(bytes).digest('base64')
  }
  await writeFile(join(bundle, 'vendor/manifest.json'), JSON.stringify(manifest))
  return { root, bundle, manifest }
}

test('accepts a built page with its vendor modules and referenced fonts', async t => {
  const { root } = await fixture(t)
  assert.equal(await checkAppBundle(root), 2)
})

test('rejects a package containing the shell but no built application', async t => {
  const { root, bundle } = await fixture(t)
  await rm(join(bundle, 'app.html'))
  await assert.rejects(checkAppBundle(root), /ENOENT/)
})

test('rejects missing font bytes even when the HTML and entrypoint exist', async t => {
  const { root, bundle } = await fixture(t)
  await rm(join(bundle, 'fonts/main.woff2'))
  await assert.rejects(checkAppBundle(root), /ENOENT/)
})

test('rejects a missing vendored import behind a valid HTML entrypoint', async t => {
  const { root, bundle } = await fixture(t)
  await rm(join(bundle, 'vendor/vue.js'))
  await assert.rejects(checkAppBundle(root), /ENOENT/)
})

test('rejects stale or corrupted built assets', async t => {
  const { root, bundle } = await fixture(t)
  await writeFile(join(bundle, 'app.js'), 'stale-build')
  await assert.rejects(checkAppBundle(root), /integrity mismatch/)
})

test('checks font references supplied by facade CSS as well as page CSS', async t => {
  const { root } = await fixture(t)
  await writeFile(join(root, 'static/custom-css.facade.generated.css'), '@font-face{src:url(/app/app/main/fonts/missing.woff2)}')
  await assert.rejects(checkAppBundle(root), /ENOENT/)
})

test('rejects paths escaping the application bundle', async t => {
  const { root, bundle, manifest } = await fixture(t)
  manifest.files['../outside.js'] = 'sha256-unsafe'
  await writeFile(join(bundle, 'vendor/manifest.json'), JSON.stringify(manifest))
  await assert.rejects(checkAppBundle(root), /invalid local asset path/)
})

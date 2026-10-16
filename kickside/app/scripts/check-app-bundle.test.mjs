import assert from 'node:assert/strict'
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'
import { checkAppBundle } from './check-app-bundle.mjs'

async function fixture(t) {
  const app = await mkdtemp(join(tmpdir(), 'app-bundle-'))
  t.after(() => rm(app, { recursive: true }))
  const bundle = join(app, 'static/app/main')
  await mkdir(bundle, { recursive: true })
  await writeFile(join(bundle, 'app.html'), '<div id="app"></div><script src="/app/app/main/index.js"></script><link href="./main.css">')
  await writeFile(join(bundle, 'index.js'), 'export {}')
  await writeFile(join(bundle, 'main.css'), ':root {}')
  await writeFile(join(bundle, 'wippy-meta.json'), '{}')
  return { app, bundle }
}

test('accepts a deployable application bundle', async t => {
  const { app } = await fixture(t)
  assert.equal(await checkAppBundle(app), 2)
})
for (const name of ['app.html', 'index.js', 'main.css', 'wippy-meta.json']) {
  test(`rejects a missing ${name}`, async t => {
    const { app, bundle } = await fixture(t)
    await rm(join(bundle, name))
    await assert.rejects(checkAppBundle(app), new RegExp(name.replaceAll('.', '\\.')))
  })
  test(`rejects an empty ${name}`, async t => {
    const { app, bundle } = await fixture(t)
    await writeFile(join(bundle, name), '')
    await assert.rejects(checkAppBundle(app), /empty/)
  })
}
for (const [html, error] of [
  ['<script src="index.js"></script>', /mount point/],
  ['<div id="app"></div>', /JavaScript entrypoint/],
  ['<div id="app"></div><script src="../outside.js"></script>', /invalid local asset path/],
]) {
  test(`rejects malformed bundle: ${error.source}`, async t => {
    const { app, bundle } = await fixture(t)
    await writeFile(join(bundle, 'app.html'), html)
    await assert.rejects(checkAppBundle(app), error)
  })
}

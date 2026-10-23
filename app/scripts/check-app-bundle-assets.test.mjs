// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
import assert from 'node:assert/strict'
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'
import { checkAppBundle } from './check-app-bundle.mjs'

async function fixture(t, reference) {
  const app = await mkdtemp(join(tmpdir(), 'app-assets-'))
  t.after(() => rm(app, { recursive: true }))
  const bundle = join(app, 'static/app/main')
  await mkdir(join(bundle, 'fonts'), { recursive: true })
  await writeFile(join(bundle, 'app.html'), '<div id="app"></div><script src="app.js"></script>')
  await writeFile(join(bundle, 'app.js'), 'export {}')
  await writeFile(join(bundle, 'wippy-meta.json'), '{}')
  await writeFile(join(app, 'static/custom-css.facade.generated.css'),
    `@font-face { font-family: Example; src: url(${reference}); }`)
  return { app, font: join(bundle, 'fonts/example.woff2') }
}

for (const reference of [
  "'/app/app/main/fonts/example.woff2'",
  '"app/main/fonts/example.woff2"',
  'app/main/fonts/example.woff2',
]) {
  test(`rejects an absent CSS asset: ${reference}`, async t => {
    const { app } = await fixture(t, reference)
    await assert.rejects(checkAppBundle(app), /example\.woff2/)
  })
  test(`accepts an existing CSS asset: ${reference}`, async t => {
    const { app, font } = await fixture(t, reference)
    await writeFile(font, 'font bytes')
    assert.equal(await checkAppBundle(app), 1)
  })
}

test('rejects an empty CSS asset', async t => {
  const { app, font } = await fixture(t, 'app/main/fonts/example.woff2')
  await writeFile(font, '')
  await assert.rejects(checkAppBundle(app), /empty/)
})

test('checks assets relative to nested stylesheets', async t => {
  const { app } = await fixture(t, 'data:font/woff2;base64,AA==')
  await writeFile(join(app, 'static/app/main/main.css'), '@font-face { src: url(./fonts/example.woff2); }')
  await assert.rejects(checkAppBundle(app), /example\.woff2/)
})

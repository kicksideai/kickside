// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
import assert from 'node:assert/strict'
import { readdirSync, readFileSync } from 'node:fs'
import { test } from 'node:test'

const root = new URL('../package/', import.meta.url)
const read = name => readFileSync(new URL(name, root), 'utf8')
const modules = {
  './component-deletion.css': 'component-deletion.css',
  './ComponentDeletion.vue': 'ComponentDeletion.vue',
  './useComponentDeletion': 'useComponentDeletion.ts',
  './componentRealtime': 'componentRealtime.ts',
  './latestRequest': 'latestRequest.ts',
  './errMsg': 'errMsg.ts',
}

test('deletion tracking ships as package exports and files', () => {
  const pkg = JSON.parse(read('package.json'))
  for (const [subpath, file] of Object.entries(modules)) {
    assert.equal(pkg.exports[subpath], `./${file}`)
    assert.ok(pkg.files.includes(file), file)
  }
  for (const file of readdirSync(root).filter(name => /\.(ts|vue|css)$/.test(name))) {
    assert.ok(pkg.files.includes(file), `${file} is packaged`)
  }
})

test('package sources import only declared peers and package-local modules', () => {
  const pkg = JSON.parse(read('package.json'))
  const peers = Object.keys(pkg.peerDependencies)
  for (const file of Object.values(modules).filter(name => !name.endsWith('.css'))) {
    for (const [, specifier] of read(file).matchAll(/from\s+'([^']+)'/g)) {
      if (specifier.startsWith('./')) continue
      assert.ok(peers.some(peer => specifier === peer || specifier.startsWith(`${peer}/`)), `${file}: ${specifier}`)
    }
  }
})

// A consumer's shadow root loads only its inline stylesheet, so component rules
// ship as a CSS export the consumer imports.
test('Vue components carry no style blocks', () => {
  for (const file of readdirSync(root).filter(name => name.endsWith('.vue'))) {
    assert.doesNotMatch(read(file), /<style[\s>]/, file)
  }
})

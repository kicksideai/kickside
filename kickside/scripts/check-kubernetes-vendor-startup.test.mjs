import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { chmodSync, lstatSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'

test('AWS and Kubernetes startups keep bundled modules in a writable vendor directory', () => {
  const definition = readFileSync(new URL('../app/src/deployment/_index.yaml', import.meta.url), 'utf8')
  const lines = definition.split('\n').filter(value => value.includes('mkdir -p /data/.wippy'))
  assert.equal(lines.length, 2)
  assert.equal((definition.match(/"working_directory": "\/data"/g) || []).length, 2)

  for (const line of lines) {
    const command = JSON.parse(line.trim().replace(/,$/, ''))
    const prefix = command.split(' && exec /usr/local/bin/wippy')[0]
    const root = mkdtempSync(join(tmpdir(), 'kickside-vendor-'))
    const source = join(root, 'app')
    const data = join(root, 'data')

    try {
      mkdirSync(join(source, '.wippy/vendor/kickside/models'), { recursive: true })
      mkdirSync(data)
      writeFileSync(join(source, 'wippy.lock'), 'lock')
      writeFileSync(join(source, '.wippy/vendor/kickside/models/bundled'), 'module')
      chmodSync(join(source, '.wippy/vendor'), 0o555)
      mkdirSync(join(data, '.wippy'))
      const localCommand = prefix.replaceAll('/app/', `${source}/`).replaceAll('/data/', `${data}/`)

      execFileSync('/bin/sh', ['-ec', localCommand])
      const vendor = join(data, '.wippy/vendor')
      assert.equal(lstatSync(vendor).isSymbolicLink(), false)
      assert.equal(readFileSync(join(vendor, 'kickside/models/bundled'), 'utf8'), 'module')
      writeFileSync(join(vendor, 'kickside/models/installed'), 'new module')
      execFileSync('/bin/sh', ['-ec', localCommand])
      assert.equal(readFileSync(join(vendor, 'kickside/models/installed'), 'utf8'), 'new module')
    } finally {
      chmodSync(join(source, '.wippy/vendor'), 0o755)
      const copiedVendor = join(data, '.wippy/vendor')
      if (lstatSync(copiedVendor).isDirectory()) chmodSync(copiedVendor, 0o755)
      rmSync(root, { recursive: true, force: true })
    }
  }
})

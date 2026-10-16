import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'
const root = fileURLToPath(new URL('../', import.meta.url))

test('the Windows full build seeds exist in the canonical Make module set', () => {
  const result = spawnSync('make', ['-s', '-f', 'Makefile', '-f', '-', 'module-list'], {
    cwd: root, input: 'module-list:\n\t@echo $(FE_MODULES)\n', encoding: 'utf8',
  })
  assert.equal(result.status, 0, result.stderr)
  const modules = new Set(result.stdout.trim().split(/\s+/))
  const script = readFileSync(resolve(root, 'make.ps1'), 'utf8')
  const seeds = script.match(/\$mods\s*=\s*@\(([^)]*)\)/)?.[1]
  assert.ok(seeds, 'the full build declares its root packages')
  for (const match of seeds.matchAll(/'([^']+)'/g)) {
    assert.ok(modules.has(match[1]), `Windows full build names an unavailable module: ${match[1]}`)
  }
})

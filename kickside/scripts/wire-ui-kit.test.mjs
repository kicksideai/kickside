import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { spawnSync } from 'node:child_process'
const script = new URL('./wire-ui-kit.mjs', import.meta.url).pathname
for (const pkg of [
  { name: 'fixture', workspaces: ['./.wippy/npm/@*/*'], dependencies: { '@kickside/ui-kit': '*' } },
  { name: 'fixture', workspaces: ['packages/*'], dependencies: {} },
]) {
  test(`validates manifest without writing (${Boolean(pkg.dependencies['@kickside/ui-kit'])})`, () => {
    const root = mkdtempSync(join(tmpdir(), 'ui-kit-manifest-'))
    try {
      const path = join(root, 'package.json')
      const original = JSON.stringify(pkg, null, 2) + '\n'
      writeFileSync(path, original)
      const result = spawnSync(process.execPath, [script], { cwd: root, encoding: 'utf8' })
      assert.equal(readFileSync(path, 'utf8'), original)
      assert.equal(result.status, pkg.dependencies['@kickside/ui-kit'] ? 0 : 1)
    } finally { rmSync(root, { recursive: true }) }
  })
}

import assert from 'node:assert/strict'
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { resolve } from 'node:path'
import { initialize } from '../../scripts/init-module.mjs'
const root = resolve(import.meta.dirname, '../..')
const target = await mkdtemp(resolve(tmpdir(), 'template-release-'))
try {
  await mkdir(resolve(target, 'ui/src/app'), {recursive: true})
  await mkdir(resolve(target, '.github/workflows'), {recursive: true})
  await writeFile(resolve(target, 'ui/src/app/starter.vue'), '<template>Starter</template>')
  await writeFile(resolve(target, '.kickside-module.json'), JSON.stringify({initialized: false}))
  await writeFile(resolve(target, '.github/modules.json'), JSON.stringify({modules: {'.': {
    organization: 'acme', module: 'starter', embed: ['acme.starter:ui_fs']
  }}}, null, 2))
  await writeFile(resolve(target, 'release-please-config.json'), JSON.stringify({packages: {'.': {component: 'starter'}}}))
  await writeFile(resolve(target, '.github/workflows/ci.yml'), 'createdb acme_test_starter\ndropdb --if-exists --force acme_test_starter\n')
  await initialize(['--organization', 'orbit', '--module', 'tasks', '--title', 'Orbit Tasks'], target)
  const plan = JSON.parse(await readFile(resolve(target, '.github/modules.json'), 'utf8'))
  const config = JSON.parse(await readFile(resolve(target, 'release-please-config.json'), 'utf8'))
  assert.equal(plan.modules['.'].organization, 'orbit')
  assert.equal(plan.modules['.'].module, 'tasks')
  assert.deepEqual(plan.modules['.'].embed, ['orbit.tasks:ui_fs'])
  assert.equal(config.packages['.'].component, 'tasks')
  const ci = await readFile(resolve(target, '.github/workflows/ci.yml'), 'utf8')
  assert.ok(ci.includes('createdb orbit_test_tasks'))
  assert.ok(ci.includes('dropdb --if-exists --force orbit_test_tasks'))
  console.log('Template release identity and CI database names follow initialization')
} finally {
  await rm(target, {recursive: true, force: true})
}

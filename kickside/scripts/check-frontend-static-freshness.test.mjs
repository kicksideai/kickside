import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, test } from 'node:test'
import { changedPaths, createSnapshot } from './check-frontend-static-freshness.mjs'

const repositories = []

function git(root, ...args) {
  return execFileSync('git', args, { cwd: root, encoding: 'utf8', windowsHide: true })
}

function createRepository() {
  const root = mkdtempSync(join(tmpdir(), 'kickside-static-freshness-'))
  repositories.push(root)
  for (const directory of [
    'app/static',
    'app/templates/plugin/static',
    'platform/example/static',
  ]) mkdirSync(join(root, directory), { recursive: true })

  writeFileSync(join(root, '.gitignore'), 'app/static/app/\napp/templates/plugin/static/*.map\n')
  writeFileSync(join(root, 'app/static/committed.js'), 'original\n')
  git(root, 'init', '--quiet')
  git(root, 'config', 'user.name', 'KickSide CI')
  git(root, 'config', 'user.email', 'ci@kickside.local')
  git(root, 'add', '.gitignore', 'app/static/committed.js')
  git(root, 'commit', '--quiet', '-m', 'fixture')
  return root
}

afterEach(() => {
  for (const root of repositories.splice(0)) rmSync(root, { recursive: true, force: true })
})

test('unchanged committed output is stable', () => {
  const root = createRepository()
  const snapshot = createSnapshot(root)
  assert.deepEqual(changedPaths(snapshot, createSnapshot(root)), [])
})

test('modified tracked output is reported', () => {
  const root = createRepository()
  const snapshot = createSnapshot(root)
  writeFileSync(join(root, 'app/static/committed.js'), 'changed\n')
  assert.deepEqual(changedPaths(snapshot, createSnapshot(root)), ['app/static/committed.js'])
})

test('deleted tracked output is reported', () => {
  const root = createRepository()
  const snapshot = createSnapshot(root)
  rmSync(join(root, 'app/static/committed.js'))
  assert.deepEqual(changedPaths(snapshot, createSnapshot(root)), ['app/static/committed.js'])
})

test('new non-ignored output is reported', () => {
  const root = createRepository()
  const snapshot = createSnapshot(root)
  writeFileSync(join(root, 'platform/example/static/new.js'), 'new\n')
  assert.deepEqual(changedPaths(snapshot, createSnapshot(root)), ['platform/example/static/new.js'])
})

test('explicitly ignored runtime output is excluded', () => {
  const root = createRepository()
  const snapshot = createSnapshot(root)
  mkdirSync(join(root, 'app/static/app/main'), { recursive: true })
  writeFileSync(join(root, 'app/static/app/main/app.js'), 'runtime\n')
  writeFileSync(join(root, 'app/templates/plugin/static/index.js.map'), '{}\n')
  assert.deepEqual(changedPaths(snapshot, createSnapshot(root)), [])
})

test('export rules exclude source maps while served JavaScript still detects changes', () => {
  const root = createRepository()
  writeFileSync(join(root, '.gitattributes'), '*.js.map export-ignore\n')
  const snapshot = createSnapshot(root)
  writeFileSync(join(root, 'platform/example/static/index.js.map'), '{}\n')
  writeFileSync(join(root, 'app/static/committed.js'), 'changed\n')
  assert.deepEqual(changedPaths(snapshot, createSnapshot(root)), ['app/static/committed.js'])
})

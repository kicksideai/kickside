import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'

const [mode, snapshotPath] = process.argv.slice(2)

export function createSnapshot(root) {
  const roots = [
    'app/static',
    'app/templates/plugin/static',
    ...readdirSync(join(root, 'platform'), { withFileTypes: true })
      .filter(entry => entry.isDirectory())
      .map(entry => `platform/${entry.name}/static`),
  ]

  // Compare the repository's committed static contract. Explicitly ignored
  // runtime build products are still exercised by `make build-all`, but they do
  // not exist in a clean checkout and therefore cannot be freshness-gated.
  // `--others --exclude-standard` keeps newly generated, non-ignored outputs in
  // the inventory so CI still fails until those assets are committed.
  const paths = execFileSync(
    'git',
    ['ls-files', '-z', '--cached', '--others', '--exclude-standard', '--', ...roots],
    { cwd: root, encoding: 'utf8', windowsHide: true },
  ).split('\0').filter(Boolean)

  const attributes = execFileSync('git', ['check-attr', '-z', '--stdin', 'export-ignore'], {
    cwd: root, input: `${paths.join('\0')}\0`, encoding: 'utf8', windowsHide: true,
  }).split('\0')
  const exported = new Set()
  for (let index = 0; index + 2 < attributes.length; index += 3) {
    if (attributes[index + 2] !== 'set') exported.add(attributes[index])
  }

  const files = []
  for (const path of paths.filter(path => exported.has(path))) {
    const absolutePath = join(root, path)
    const hash = existsSync(absolutePath)
      ? createHash('sha256').update(readFileSync(absolutePath)).digest('hex')
      : '<missing>'
    files.push(`${path.replaceAll('\\', '/')}:${hash}`)
  }
  return `${files.sort().join('\n')}\n`
}

export function changedPaths(expected, actual) {
  const rows = snapshot => new Map(snapshot.trimEnd().split('\n').filter(Boolean).map((line) => {
    const separator = line.lastIndexOf(':')
    return [line.slice(0, separator), line.slice(separator + 1)]
  }))
  const before = rows(expected)
  const after = rows(actual)
  return [...new Set([...before.keys(), ...after.keys()])]
    .filter(path => before.get(path) !== after.get(path))
    .sort()
}

export function run(mode, snapshotPath, root = resolve(import.meta.dirname, '..')) {
  if (!['snapshot', 'check'].includes(mode) || !snapshotPath) {
    console.error('Usage: node scripts/check-frontend-static-freshness.mjs <snapshot|check> <snapshot-file>')
    return 2
  }

  const snapshot = createSnapshot(root)
  const fileCount = snapshot.trimEnd().split('\n').filter(Boolean).length
  if (mode === 'snapshot') {
    writeFileSync(snapshotPath, snapshot)
    console.log(`Recorded ${fileCount} served frontend files in ${snapshotPath}.`)
    return 0
  }

  const expected = readFileSync(snapshotPath, 'utf8')
  const changed = changedPaths(expected, snapshot)
  if (changed.length > 0) {
    console.error(`Served frontend static output changed after the Make-owned build (${changed.length} paths):`)
    for (const path of changed) console.error(`  ${path}`)
    return 1
  }

  console.log(`Verified ${fileCount} served frontend files are unchanged from ${snapshotPath}.`)
  return 0
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(import.meta.filename)) {
  process.exitCode = run(mode, snapshotPath)
}

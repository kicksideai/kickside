import { readFileSync } from 'node:fs'

const pkg = JSON.parse(readFileSync('package.json', 'utf8'))
if (!pkg.workspaces?.includes('./.wippy/npm/@*/*') || pkg.dependencies?.['@kickside/ui-kit'] !== '*') {
  throw new Error('package.json must declare the materialized @kickside/ui-kit workspace and dependency')
}

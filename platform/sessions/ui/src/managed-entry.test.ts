import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import ts from 'typescript'

// A managed host imports entries in a new frame before tag declaration runs.
describe('managed component entry exports', () => {
  for (const name of ['index', 'artifacts', 'artifact_panel', 'artifact_coordinator']) {
    it(`exports the factory from the served ${name} entry`, () => {
      const source = readFileSync(resolve(__dirname, `../../static/${name}.js`), 'utf8')
      const module = ts.createSourceFile(`${name}.js`, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS)
      const exports = module.statements.flatMap(node => ts.isExportDeclaration(node) && node.exportClause && ts.isNamedExports(node.exportClause)
        ? node.exportClause.elements.map(specifier => specifier.name.text) : [])
      expect(exports).toContain('webComponent')
    })
  }
})

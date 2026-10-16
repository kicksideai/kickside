/// <reference types="node" />
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const APP = dirname(fileURLToPath(import.meta.url))

function source(path: string): string {
  return readFileSync(join(APP, path), 'utf8')
}

function template(path: string): string {
  return source(path).split('<template>')[1] || ''
}

describe('transient workflow UI copy', () => {
  it('keeps the import dialog in user language', () => {
    const imported = source('list/ImportModal.vue')
    expect(imported).not.toContain('portable workflow export')
    expect(imported).toContain('We’ll create a draft copy')
  })

  it('does not expose schema, payload, graph, or binding jargon in primary actions', () => {
    expect(template('canvas/RunWithInputDialog.vue')).not.toContain('Start schema')
    expect(template('embed/EmbedWorkflow.vue')).not.toContain('empty payload')
    expect(template('ComponentWorkflows.vue')).not.toContain('Bind existing')

    const history = source('runs/VersionHistoryPanel.vue')
    expect(history).not.toContain('Version graph delta')
    expect(history).not.toContain("label: 'Nodes added'")
    expect(history).not.toContain("label: 'Edges added'")
  })

  it('keeps runtime identifiers behind a technical-details disclosure', () => {
    const drawer = source('runs/RunNodeOutput.vue')
    expect(drawer).toContain('header="Technical details"')
    expect(drawer).toContain('toggleable collapsed')
    expect(drawer).not.toContain('<details')
    expect(drawer).not.toContain('<summary')
    expect(drawer).toContain('Download run details')
    expect(drawer).not.toContain('Export redacted JSON')
  })
})

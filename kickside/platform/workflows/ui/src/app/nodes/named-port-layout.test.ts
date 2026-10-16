import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const nodeStyles = readFileSync(fileURLToPath(new URL('../../styles/nodes.css', import.meta.url)), 'utf8')

describe('named outcome port layout', () => {
  it('anchors the handle edge at the card boundary and keeps its label above the edge', () => {
    expect(nodeStyles).toMatch(/\.wfn-portrow\s*\{[^}]*bottom:\s*-22px;/s)
    expect(nodeStyles).toMatch(/\.wfn-portlabel\s*\{[^}]*top:\s*-16px;/s)
  })
})

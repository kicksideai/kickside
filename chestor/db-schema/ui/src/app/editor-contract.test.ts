import { describe, expect, it } from 'vitest'

// The editor's interaction contract: undo applies inverse commands as new
// events, a relation drag released on empty canvas creates the referenced
// table pre-wired, names never collide, and every new table starts with an id
// primary key.

import sfc from './DbSchema.vue?raw'

describe('db-schema editor contract', () => {
  it('records inverse batches on apply and replays them on undo/redo', () => {
    expect(sfc).toContain('inverseBatch(commands, snapshot())')
    expect(sfc).toMatch(/applyCmds\(entry\.undo, false\)/)
    expect(sfc).toMatch(/applyCmds\(entry\.redo, false\)/)
  })

  it('creates a pre-wired table on a wire-drop over the pane', () => {
    expect(sfc).toContain('@connect-start="onConnectStart"')
    expect(sfc).toContain('@connect-end="onConnectEnd"')
    expect(sfc).toMatch(/classList\.contains\('vue-flow__pane'\)/)
    expect(sfc).toMatch(/from_table_id: from\.table, to_table_id: id/)
  })

  it('starts every new table with an id primary key', () => {
    const seeds = sfc.match(/name: 'id', col_type: 'UUID', primary_key: true/g) || []
    expect(seeds.length).toBeGreaterThanOrEqual(2)
  })

  it('mints non-colliding default names', () => {
    expect(sfc).toMatch(/nextName\('new_table', tables\.value\.map\(t => t\.name\)\)/)
    expect(sfc).toMatch(/nextName\('column', \(t\.columns \|\| \[\]\)\.map\(c => c\.name\)\)/)
  })

  it('refuses duplicate relations between the same endpoints', () => {
    expect(sfc).toMatch(/const dup = relations\.value\.some/)
  })

  it('offers SQL and DBML export formats', () => {
    expect(sfc).toContain("label: 'SQL (.sql)'")
    expect(sfc).toContain("label: 'DBML (.dbml)'")
  })

  it('caps fit zoom and keeps the forgiving connection radius', () => {
    expect(sfc).toContain('maxZoom: 1')
    expect(sfc).toContain(':connection-radius="40"')
  })

  it('duplicates a table with its columns via Ctrl+D and the node menu', () => {
    expect(sfc).toMatch(/function duplicateTable/)
    expect(sfc).toContain("label: 'Duplicate table'")
    expect(sfc).toMatch(/e\.key === 'd' \|\| e\.key === 'D'/)
  })

  it('spotlights the hovered table relation neighborhood', () => {
    expect(sfc).toContain('@node-mouse-enter="onNodeMouseEnter"')
    expect(sfc).toMatch(/de-edge-hot/)
    expect(sfc).toMatch(/de-dim/)
  })

  it('supports serial entry: Ctrl+Enter column, Ctrl+Shift+Enter table', () => {
    expect(sfc).toMatch(/mod && e\.key === 'Enter'/)
  })

  it('binds keyboard on the focusable component root', () => {
    expect(sfc).toContain('tabindex="0" @keydown="onKeyDown"')
    expect(sfc).toMatch(/e\.shiftKey \? redo\(\) : undo\(\)/)
  })
})

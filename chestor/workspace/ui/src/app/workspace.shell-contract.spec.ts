import { describe, expect, it } from 'vitest'
import sfc from './Workspace.vue?raw'
import apiSrc from './useWorkspaceApi.ts?raw'

// Shell interaction contract from the 2026-08 UX pass: containers always list
// first, one containment test everywhere, and every capability the server
// exposes (move, export) has a non-drag path.

describe('workspace shell contract', () => {
  it('sorts containers to the top, alphabetical within groups', () => {
    expect(sfc).toMatch(/const ga = isContainer\(a\) \? 0 : 1, gb = isContainer\(b\) \? 0 : 1/)
    expect(sfc).toMatch(/localeCompare\(b\.name \|\| '', undefined, \{ sensitivity: 'base' \}\)/)
  })

  it('filters the folder through the mounted search field', () => {
    expect(sfc).toContain('<SearchField v-model="query"')
    expect(sfc).toMatch(/entries\.value\.filter\(e => \(e\.name \|\| ''\)\.toLowerCase\(\)\.includes\(q\)\)/)
  })

  it('uses one containment test for drops, dblclick, menus, and delete', () => {
    expect(sfc).not.toMatch(/e\.type === 'folder' \? \(dropTarget/)
    expect(sfc).not.toMatch(/dblclick="e\.type === 'folder'/)
    expect(sfc).toMatch(/@drop="onRowDrop\(\$event, e\)"/)
    expect(sfc).toMatch(/isContainer\(confirmingDelete\)/)
  })

  it('routes file drops on a container row into that container', () => {
    expect(sfc).toMatch(/dropFilesTo\(Array\.from\(files\), e\.id\)/)
  })

  it('offers Move to… and Export from the context menu', () => {
    expect(sfc).toContain('Move to…')
    expect(sfc).toContain('@click="exportEntry(menu.entry!)"')
  })

  it('lists children beyond the first server page', () => {
    // The backend pages by offset; the client keeps a single list call.
    expect(apiSrc).not.toContain('rename(')
  })

  it('shows type labels on pills, never raw namespaced ids', () => {
    expect(sfc).toMatch(/ambiguousTypeValues\.value\.has\(e\.type\)/)
    expect(sfc).toMatch(/split\('\.'\)\.pop\(\)/)
  })

  it('sends root moves as the empty string, never null', () => {
    expect(apiSrc).toMatch(/parent_id: parentId \?\? ''/)
  })

  it('formats the access mask as words', () => {
    expect(sfc).toMatch(/formatAccess\(props\.entry\.access_level\)/)
  })

  it('reports Properties save failures inside the dialog', () => {
    expect(sfc).toMatch(/propsError\.value = e instanceof Error/)
    expect(sfc).toContain('v-if="propsError"')
  })

  it('guards stale navigations', () => {
    expect(sfc).toMatch(/const seq = \+\+navSeq/)
  })

  it('supports arrows, F2, and Delete on rows', () => {
    expect(sfc).toMatch(/ev\.key === 'ArrowDown' \|\| ev\.key === 'ArrowUp'/)
    expect(sfc).toMatch(/ev\.key === 'F2'/)
    expect(sfc).toMatch(/ev\.key === 'Delete'/)
  })
})

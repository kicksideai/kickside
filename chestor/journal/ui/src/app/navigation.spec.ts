import { describe, expect, it } from 'vitest'
import {
  JOURNAL_FOCUS, LENS_KEYS, NavigationStore, decodeRoute, encodeRoute, focusKey, graphOf, recordOf, samePlace,
} from './navigation'
import type { Focus, Place } from './navigation'

const graph = (id: string, label = id): Focus => ({ kind: 'graph', id, label, graphId: id })
const branch = (id: string, graphId: string): Focus => ({ kind: 'branch', id, label: id, graphId })
const record = (id: string, graphId: string): Focus => ({ kind: 'node', id, label: id, graphId })

describe('routes', () => {
  it('carries the lens and the descent, and nothing a rename could invalidate', () => {
    const place: Place = { lens: 'graph', focus: [JOURNAL_FOCUS, graph('map'), branch('root-1', 'map')] }
    expect(encodeRoute(place)).toBe('graph/graph:map/branch:root-1')
    const restored = decodeRoute(encodeRoute(place))
    expect(restored.lens).toBe('graph')
    expect(restored.focus.map(item => [item.kind, item.id]))
      .toEqual([['journal', ''], ['graph', 'map'], ['branch', 'root-1']])
  })

  it('survives ids that need escaping', () => {
    const place: Place = { lens: 'outline', focus: [JOURNAL_FOCUS, graph('map'), record('event:a/b c', 'map')] }
    expect(decodeRoute(encodeRoute(place)).focus[2].id).toBe('event:a/b c')
  })

  it('lands on the journal when a route says nothing usable', () => {
    expect(decodeRoute('').focus).toEqual([JOURNAL_FOCUS])
    expect(decodeRoute('').lens).toBe('now')
    expect(decodeRoute('nonsense/kind:x').lens).toBe('now')
    expect(decodeRoute('graph/bogus:x').focus).toEqual([JOURNAL_FOCUS])
  })

  it('reads the graph and the record out of a place', () => {
    const place: Place = { lens: 'graph', focus: [JOURNAL_FOCUS, graph('map'), record('n7', 'map')] }
    expect(graphOf(place)).toBe('map')
    expect(recordOf(place)).toBe('n7')
    expect(recordOf({ lens: 'now', focus: [JOURNAL_FOCUS] })).toBe('')
    expect(graphOf({ lens: 'now', focus: [JOURNAL_FOCUS] })).toBe('')
  })

  it('names a focus independently of the lens reading it', () => {
    expect(focusKey([JOURNAL_FOCUS, graph('map')])).toBe('journal:/graph:map')
  })

  it('answers the lens each letter opens', () => {
    expect(LENS_KEYS.g).toBe('graph')
    expect(LENS_KEYS.o).toBe('outline')
    expect(LENS_KEYS.t).toBe('lanes')
    expect(LENS_KEYS.r).toBe('recall')
  })
})

describe('focus stack', () => {
  it('descends and steps back out, with the journal as the floor', () => {
    const store = new NavigationStore()
    expect(store.ascend()).toBe(false)
    store.descend(graph('map'))
    store.descend(branch('root-1', 'map'))
    expect(store.depth).toBe(3)
    expect(store.current.id).toBe('root-1')
    expect(store.ascend()).toBe(true)
    expect(store.current.id).toBe('map')
  })

  it('returns to a step already on the stack instead of stacking it twice', () => {
    const store = new NavigationStore()
    store.descend(graph('map'))
    store.descend(branch('root-1', 'map'))
    store.descend(record('n7', 'map'))
    store.descend(graph('map'))
    expect(store.focus.map(item => item.id)).toEqual(['', 'map'])
  })

  it('keeps the place when the lens changes', () => {
    const store = new NavigationStore()
    store.descend(graph('map'))
    store.descend(record('n7', 'map'))
    store.setLens('graph')
    expect(store.lens).toBe('graph')
    expect(store.focus.map(item => item.id)).toEqual(['', 'map', 'n7'])
  })

  it('relabels crumbs once the data that names them arrives', () => {
    const store = new NavigationStore()
    store.descend({ kind: 'graph', id: 'map', label: 'map' })
    store.relabel(new Map([['graph:map', 'Program transformer']]))
    expect(store.current.label).toBe('Program transformer')
  })
})

describe('back and forward', () => {
  it('returns the reader where they were, not one level up', () => {
    const store = new NavigationStore()
    store.descend(graph('map'))
    store.descend(branch('root-1', 'map'))
    store.setLens('outline')
    expect(store.canBack).toBe(true)
    expect(store.back()).toBe(true)
    expect(store.lens).toBe('now')
    expect(store.current.id).toBe('root-1')
    expect(store.back()).toBe(true)
    expect(store.current.id).toBe('map')
    expect(store.forward()).toBe(true)
    expect(store.current.id).toBe('root-1')
  })

  it('stops at both ends rather than wrapping', () => {
    const store = new NavigationStore()
    expect(store.back()).toBe(false)
    expect(store.forward()).toBe(false)
    store.descend(graph('map'))
    expect(store.forward()).toBe(false)
  })

  it('drops the forward trail when the reader takes a new step', () => {
    const store = new NavigationStore()
    store.descend(graph('map'))
    store.descend(branch('root-1', 'map'))
    store.back()
    store.descend(branch('root-2', 'map'))
    expect(store.canForward).toBe(false)
    expect(store.current.id).toBe('root-2')
  })

  it('records nothing when a step lands where the reader already is', () => {
    const store = new NavigationStore()
    store.setLens('now')
    store.toIndex(0)
    expect(store.canBack).toBe(false)
  })
})

describe('viewport memory', () => {
  it('remembers each lens’s arrangement of each focus', () => {
    const store = new NavigationStore()
    store.descend(graph('map'))
    store.setLens('graph')
    store.rememberViewport({ zoom: 1.8, x: 40, y: -20 })
    store.setLens('outline')
    store.rememberViewport({ scrollTop: 640 })
    expect(store.viewport()).toEqual({ scrollTop: 640 })
    store.setLens('graph')
    expect(store.viewport()).toEqual({ zoom: 1.8, x: 40, y: -20 })
  })

  it('keeps one focus’s arrangement out of another’s', () => {
    const store = new NavigationStore()
    store.descend(graph('map'))
    store.rememberViewport({ scrollTop: 200 })
    store.descend(branch('root-1', 'map'))
    expect(store.viewport()).toBeUndefined()
    store.ascend()
    expect(store.viewport()).toEqual({ scrollTop: 200 })
  })

  it('merges into what it already remembers rather than replacing it', () => {
    const store = new NavigationStore()
    store.rememberViewport({ scrollTop: 100 })
    store.rememberViewport({ selectedId: 'n7' })
    expect(store.viewport()).toEqual({ scrollTop: 100, selectedId: 'n7' })
  })

  it('holds a bounded number of arrangements, keeping the places most recently read', () => {
    // A reader descends through a journal of any size. What is remembered has
    // to stop somewhere, and the place to stop is the one they touched longest
    // ago — never the one they are standing in.
    const store = new NavigationStore()
    store.descend(graph('map'))
    for (let index = 0; index < 400; index++) {
      store.descend(record(`n${index}`, 'map'))
      store.rememberViewport({ scrollTop: index })
      store.ascend()
    }
    store.descend(record('n399', 'map'))
    expect(store.viewport()).toEqual({ scrollTop: 399 })
    store.ascend()
    store.descend(record('n0', 'map'))
    expect(store.viewport()).toBeUndefined()
  })
})

describe('places', () => {
  it('compares a place by its lens and its descent', () => {
    const one: Place = { lens: 'graph', focus: [JOURNAL_FOCUS, graph('map')] }
    const same: Place = { lens: 'graph', focus: [JOURNAL_FOCUS, graph('map', 'renamed')] }
    expect(samePlace(one, same)).toBe(true)
    expect(samePlace(one, { ...one, lens: 'outline' })).toBe(false)
  })
})

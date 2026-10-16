import { describe, expect, it } from 'vitest'
import { isEditingTarget, resolveAction, resolveLens } from './keymap'

describe('resolveAction', () => {
  it('maps ctrl+z to undo and ctrl+shift+z to redo', () => {
    expect(resolveAction({ key: 'z', ctrlKey: true })).toBe('undo')
    expect(resolveAction({ key: 'z', ctrlKey: true, shiftKey: true })).toBe('redo')
    expect(resolveAction({ key: 'y', ctrlKey: true })).toBe('redo')
    expect(resolveAction({ key: 'z', metaKey: true })).toBe('undo')
  })

  it('maps delete/backspace to delete and escape to escape', () => {
    expect(resolveAction({ key: 'Delete' })).toBe('delete')
    expect(resolveAction({ key: 'Backspace' })).toBe('delete')
    expect(resolveAction({ key: 'Escape' })).toBe('escape')
  })

  it('ignores keys while a form field is focused', () => {
    expect(resolveAction({ key: 'Delete', target: { tagName: 'INPUT' } })).toBeNull()
    expect(resolveAction({ key: 'z', ctrlKey: true, target: { tagName: 'TEXTAREA' } })).toBeNull()
  })

  it('returns null for unmapped keys', () => {
    expect(resolveAction({ key: 'a' })).toBeNull()
  })
})

describe('resolveLens', () => {
  it('maps the bare digits onto the four lenses in order', () => {
    expect(resolveLens({ key: '1' })).toBe('timeline')
    expect(resolveLens({ key: '2' })).toBe('horizons')
    expect(resolveLens({ key: '3' })).toBe('strata')
    expect(resolveLens({ key: '4' })).toBe('outcomes')
  })

  it('leaves digits outside the lens range and modified digits alone', () => {
    expect(resolveLens({ key: '5' })).toBeNull()
    expect(resolveLens({ key: '0' })).toBeNull()
    expect(resolveLens({ key: '1', ctrlKey: true })).toBeNull()
    expect(resolveLens({ key: '1', shiftKey: true })).toBeNull()
    expect(resolveLens({ key: '1', target: { tagName: 'INPUT' } })).toBeNull()
    expect(resolveLens({ key: 'a' })).toBeNull()
  })
})

describe('isEditingTarget', () => {
  it('detects input/textarea/select', () => {
    expect(isEditingTarget({ tagName: 'SELECT' })).toBe(true)
    expect(isEditingTarget({ tagName: 'DIV' })).toBe(false)
    expect(isEditingTarget(null)).toBe(false)
  })
})

import { describe, expect, it } from 'vitest'
import { isEditingTarget, resolveAction, resolveTypeIntent } from './keymap'

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

describe('resolveTypeIntent', () => {
  it('renames the selected node on a printable character', () => {
    expect(resolveTypeIntent({ key: 'e' }, true)).toBe('rename')
    expect(resolveTypeIntent({ key: 'E' }, true)).toBe('rename')
  })

  it('renames the selected node on Enter and F2', () => {
    expect(resolveTypeIntent({ key: 'Enter' }, true)).toBe('rename')
    expect(resolveTypeIntent({ key: 'F2' }, true)).toBe('rename')
    expect(resolveTypeIntent({ key: 'Enter' }, false)).toBeNull()
  })

  it('searches on printable characters with nothing selected', () => {
    expect(resolveTypeIntent({ key: 'e' }, false)).toBe('search')
  })

  it('always searches on slash', () => {
    expect(resolveTypeIntent({ key: '/' }, true)).toBe('search')
    expect(resolveTypeIntent({ key: '/' }, false)).toBe('search')
  })

  it('ignores space, modifiers, and form fields', () => {
    expect(resolveTypeIntent({ key: ' ' }, true)).toBeNull()
    expect(resolveTypeIntent({ key: 'e', ctrlKey: true }, true)).toBeNull()
    expect(resolveTypeIntent({ key: 'e', altKey: true }, false)).toBeNull()
    expect(resolveTypeIntent({ key: 'e', target: { tagName: 'INPUT' } }, true)).toBeNull()
  })
})

describe('isEditingTarget', () => {
  it('detects input/textarea/select', () => {
    expect(isEditingTarget({ tagName: 'SELECT' })).toBe(true)
    expect(isEditingTarget({ tagName: 'DIV' })).toBe(false)
    expect(isEditingTarget(null)).toBe(false)
  })
})

describe('sota shortcuts', () => {
  it('maps mod+D to duplicate', () => {
    expect(resolveAction({ key: 'd', metaKey: true })).toBe('duplicate')
    expect(resolveAction({ key: 'D', ctrlKey: true })).toBe('duplicate')
  })

  it('maps Shift+1/Shift+2 to fit and zoom-selection, including shifted symbols', () => {
    expect(resolveAction({ key: '1', shiftKey: true })).toBe('fit')
    expect(resolveAction({ key: '!', shiftKey: true })).toBe('fit')
    expect(resolveAction({ key: '2', shiftKey: true })).toBe('zoom-selection')
    expect(resolveAction({ key: '@', shiftKey: true })).toBe('zoom-selection')
  })

  it('maps mod+C/mod+V to copy and paste', () => {
    expect(resolveAction({ key: 'c', metaKey: true })).toBe('copy')
    expect(resolveAction({ key: 'v', ctrlKey: true })).toBe('paste')
  })

  it('never fires canvas shortcuts from form fields', () => {
    expect(resolveAction({ key: 'd', metaKey: true, target: { tagName: 'INPUT' } })).toBeNull()
  })
})

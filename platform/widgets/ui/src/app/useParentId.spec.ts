import { ref } from 'vue'
import { describe, it, expect } from 'vitest'
import { useParentId } from './useParentId'

// WippyVueElement exposes host attributes camelCased (attribute `parent-id` -> prop key `parentId`).
// useParentId is the single source of truth.
describe('useParentId', () => {
  it('reads the camelCased parentId key (the runtime shape from useProps)', () => {
    const props = ref<Record<string, unknown>>({ parentId: 'folder-123' })
    expect(useParentId(props).value).toBe('folder-123')
  })

  it('is empty at the workspace root (no parent attribute set)', () => {
    expect(useParentId(ref({})).value).toBe('')
    expect(useParentId(ref(undefined as any)).value).toBe('')
  })

  it('trims and stays reactive to prop changes', () => {
    const props = ref<Record<string, unknown>>({ parentId: '  x  ' })
    const parentId = useParentId(props)
    expect(parentId.value).toBe('x')
    props.value = { parentId: 'y' }
    expect(parentId.value).toBe('y')
  })

  it('ignores a non-string parentId', () => {
    const props = ref<Record<string, unknown>>({ parentId: 123 })
    expect(useParentId(props).value).toBe('')
  })
})

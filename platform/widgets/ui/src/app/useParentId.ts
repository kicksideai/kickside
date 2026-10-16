import { computed } from 'vue'
import type { ReadableValue } from './readableValue'

interface ParentIdProps {
  parentId?: unknown
}

// The workspace "+" folder a create view is mounted under (empty = root). Wippy's
// WippyVueElement exposes host attributes camelCased (parent-id -> parentId), so the
// runtime key is `parentId`. Every
// create/install web component should place the new entry under this id.
export function useParentId<T extends ParentIdProps | undefined | null>(props: ReadableValue<T>): ReadableValue<string> {
  return computed(() => {
    const v = props.value
    if (!v) return ''
    const camel = typeof v.parentId === 'string' ? v.parentId : ''
    return camel.trim()
  })
}

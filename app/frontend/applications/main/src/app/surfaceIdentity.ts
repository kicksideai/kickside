import type { NavItem } from '../composables/useSurfaces'
import { normalizePath } from '../router/path'

export function surfaceIdentity(path: string, routeName: string, item?: NavItem): string {
  // Retention is owned by the nav declaration, not the renderer implementation:
  // two entries may intentionally mount the same tag with independent state.
  // Nested routes under one declaration retain that declaration's one instance.
  if (typeof item?.id === 'string' && item.id) return `nav:${item.id}`
  if (item?.render === 'component' && typeof item.component_tag === 'string' && item.component_tag.includes('-')) {
    return `component:${item.component_tag}`
  }
  const renderer = item?.surface || item?.route_name || routeName
  if (renderer && renderer !== 'surface') return `surface:${renderer}`
  const root = normalizePath(path).split('/').filter(Boolean)[0] || 'home'
  return `path-root:${root}`
}

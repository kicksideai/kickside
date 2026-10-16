// Props for the shared async multi-select web component. All are attributes on
// the <wc-multiselect> element; `selected` carries the initial ids as a JSON
// array string, a CSV string, or a single id. Rows come either from a list
// endpoint (`source`) or from a connection's discovery (`connectionId`).
export interface ComponentProps {
  source?: string
  connectionId?: string
  discoverPath?: string
  search?: 'server' | 'local' | string
  pageSize?: number
  idKey?: string
  labelKey?: string
  descKey?: string
  iconKey?: string
  metaKey?: string
  drillKey?: string
  unselectableHint?: string
  selected?: string | string[]
  multi?: boolean
  placeholder?: string
  responseKey?: string
}

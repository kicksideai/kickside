// Host-driven props for <wc-icon-picker>. `value` is the selected icon name
// (e.g. tabler:home); `fallback` is the glyph shown on the trigger when value
// is empty. Selection is reported via the `select` event (see constants.ts).
export interface ComponentProps {
  value?: string
  fallback?: string
}

// Props for the shared connection-picker web component. All are attributes on the
// <wc-connection-picker> element. `value` (and the `config` alias) carries the
// current selection as a JSON object string {connection_id}.
export interface ComponentProps {
  source?: string
  providers?: string
  provider?: string
  label?: string
  replyOnly?: string
  value?: string
  config?: string
  placeholder?: string
}

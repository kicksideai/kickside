// Props for the shared component-picker web component. All are attributes on the
// <wc-component-picker> element. `thread_class` (or the `meta` object carrying it)
// scopes the thread class; `implId` narrows the stored component binding.
// `value`/`config` carries the current
// selection as a JSON object string {thread_id}.
export interface ComponentProps {
  source?: string
  // The host passes the selected config field as JSON schema. A field may declare
  // its own catalog source (for example the published workflow catalog)
  // instead of relying on the thread-component default.
  schema?: string
  threadClass?: string
  implId?: string
  meta?: string
  // The scoped field's title (e.g. "Knowledge base", "Automation"); drives the
  // prompt noun when set, either directly or from the `meta` object.
  title?: string
  value?: string
  config?: string
  placeholder?: string
  // Optional base endpoint enabling per-row deletion: DELETE <deleteEndpoint>/<id>.
  // Empty disables the affordance. Also accepted via `meta.delete_endpoint`.
  deleteEndpoint?: string
}

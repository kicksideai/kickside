// Host-driven props for <wc-model-picker>. `value` is the selected model name or
// a "class:<name>" reference (e.g. class:fast). `capability` filters the list:
// "generate" (default), "embed" (models only), or any capability tag such as
// "vision", passed to /api/v1/models/list. Classes include those whose resolved model
// matches the filter, plus the declared vocabulary for that capability.
// `mode: "classes"` restricts the panel to model classes — for settings that
// must stay portable across deployments, where a concrete model name would pin
// an installation-specific card. Selection is reported via the `select` event
// (see constants.ts).
export interface ComponentProps {
  value?: string
  capability?: string
  mode?: string
}

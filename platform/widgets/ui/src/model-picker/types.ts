// Host-driven props for <wc-model-picker>. `value` is the selected model name or
// a "class:<name>" reference (e.g. class:fast). `capability` filters the list:
// "generate" (default — chat/tool-use models + class shortcuts) or "embed"
// (embedding models, no class section), passed straight to /api/v1/models/list.
// `mode: "classes"` restricts the panel to model classes — for settings that
// must stay portable across deployments, where a concrete model name would pin
// an installation-specific card. Selection is reported via the `select` event
// (see constants.ts).
export interface ComponentProps {
  value?: string
  capability?: string
  mode?: string
}

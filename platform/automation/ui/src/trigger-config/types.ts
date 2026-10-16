// Host-facing surface of <kickside-trigger-config> — the complete public API a
// consumer relies on. Every field mirrors a property published on the registry
// entry's props schema (see ../index.ts). The component carries no
// consumer-specific branch: each product difference flows through one attribute
// here, so a new host configures the editor entirely from the outside.

export interface TriggerConfigProps {
  // Trigger Spec v2 — a JSON object string (attribute) or an object (property).
  // Empty starts a fresh spec; non-empty seeds every section (edit/reconfigure).
  value?: unknown
  // CSV of offered families in consumer terms: "timer" (the "On a schedule" row)
  // and/or "source" (the source catalog).
  allowed?: string
  // CSV filter over source-declared classes; when set, only bindings declaring one
  // of these classes are OFFERED (resolution still reads the full catalog).
  sourceClasses?: string
  // A collection source's initial History: "all" (import everything) or "none"
  // (only new). Hosts may supply an explicit initial history choice.
  historyDefault?: 'all' | 'none'
  // Disable every edit.
  disabled?: boolean
  // Editing an installed trigger: structural fields (source, instance, options,
  // filter, history) render locked; only the cadence stays editable.
  reconfigure?: boolean
}

export interface TriggerConfigEvents {
  // Per edit: the current Trigger Spec v2 draft, whether it resolves against the platform
  // rules, and the one human gate message (When / How often / History vocabulary,
  // never a raw code) when it does not.
  change: { spec: Record<string, unknown>; valid: boolean; error?: string; output_schema?: unknown }
  // Emitted once the catalog is ready; withheld when the catalog fetch failed.
  load: undefined
  // The catalog fetch failed (source editors only).
  error: { message: string; error?: unknown }
}

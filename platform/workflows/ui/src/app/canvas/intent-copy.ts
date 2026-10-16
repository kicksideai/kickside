// User-facing copy for the intent-edge interaction (W11.1), kept out of the Vue templates
// so every string is one sentence, teaches, and is unit-testable. The interaction is sugar
// over the one grammar and the one assist family — the words carry the whole promise, so
// they stay honest: they say what the system did, or ask plainly what the user means.

// The auto-map reveal moment: shown the instant an obvious mapping applies, then it fades
// to the persistent trace. It states that the system acted and what it did.
export const AUTO_REVEAL_TITLE = 'Mapped automatically'
export const AUTO_TRACE_LABEL = 'Mapped automatically — view'
export const AUTO_REVEAL_HINT = 'Click to open the full mapper.'
export function autoRevealSummary(count: number): string {
  return `Mapped ${count} field${count === 1 ? '' : 's'} by name and type.`
}

// The ambiguous flow: a one-line intent prompt at the edge midpoint, teaching by example.
export const INTENT_PROMPT = 'What should flow here?'
export const INTENT_PLACEHOLDER = 'e.g. use the first search result’s link'
export const INTENT_HELP = 'Describe what should happen — mapping, branching and failure routes are previewed before anything changes.'
export const INTENT_SUBMIT = 'Draft'
export const INTENT_DRAFTING = 'Drafting from your description — this can take up to a minute.'

// The drafted-preview stage: accept the draft, open the full mapper for control, or dismiss.
export const PREVIEW_TITLE = 'Here’s the mapping I drafted'
export const PREVIEW_ACCEPT = 'Apply'
export const PREVIEW_OPEN_MAPPER = 'Open mapper'
export const PREVIEW_RETRY = 'Redraft'
export const INTENT_DISMISS = 'Dismiss'

// Honest degrade (W13): the assistant couldn't draft, the typed intent is preserved, and
// the two ways forward are named — try again, or map it by hand.
export const INTENT_DEGRADE = 'I couldn’t draft that connection — edit your description and try again, or open the mapper to continue by hand.'

// The dismiss consequence, stated where the user decides: the edge stays, it just needs a
// mapping before the workflow can publish.
export const INTENT_DISMISS_HINT = 'The connection stays — it needs a mapping before this Workflow can run.'

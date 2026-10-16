export interface ComponentProps {
  // Deep-link sub-path under /knowledge: a kb id, optionally followed by an
  // in-KB node path (e.g. "kbId" or "kbId/nodeId"). Empty = the KB list.
  route?: string
}

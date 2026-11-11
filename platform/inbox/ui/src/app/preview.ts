// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0

// One-line list preview of an item's Markdown body: its first line that carries text
// once the leading block markers (quote >, heading #s, list bullet or number) are
// removed, so the row leads with the content itself. The rest of the line stays
// literal, inline Markdown included; the detail pane renders the full Markdown.

const BLOCK_MARKER = /^[ \t]*(?:>[ \t]?|#{1,6}(?=[ \t]|$)[ \t]*|[-*+][ \t]+|\d{1,9}[.)][ \t]+)/

function stripMarkers(line: string): string {
  let rest = line
  for (let next = rest.replace(BLOCK_MARKER, ''); next !== rest; next = rest.replace(BLOCK_MARKER, '')) rest = next
  return rest.replace(/\s+/g, ' ').trim()
}

export function previewText(markdown: string | undefined): string {
  if (!markdown) return ''
  for (const line of markdown.split(/\r?\n/)) {
    const text = stripMarkers(line)
    if (text) return text
  }
  return ''
}

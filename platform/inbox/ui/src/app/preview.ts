// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0

// One-line list preview of an item's Markdown body: the first line that carries
// text, as plain text. Block markers (headings, quotes, list bullets, fences,
// rules, table rules) and inline syntax (emphasis, code, links, images, HTML)
// are removed so the row leads with the content itself. The detail pane renders
// the full Markdown.

const FENCE = /^ {0,3}(`{3,}|~{3,})/
const THEMATIC_BREAK = /^ {0,3}([-*_])(?:[ \t]*\1){2,}[ \t]*$/
const SETEXT_UNDERLINE = /^ {0,3}=+[ \t]*$/
const TABLE_RULE = /^[ \t]*\|?[ \t]*:?-+:?[ \t]*(?:\|[ \t]*:?-+:?[ \t]*)*\|?[ \t]*$/
const BLOCK_PREFIX = /^[ \t]*(?:>[ \t]?|#{1,6}(?=[ \t]|$)[ \t]*|[-*+][ \t]+(?:\[[ xX]\][ \t]+)?|\d{1,9}[.)][ \t]+(?:\[[ xX]\][ \t]+)?)/
const ESCAPABLE = /\\([!-/:-@[-`{-~])/g
const PROTECTED = /\u0000(\d+)\u0000/g

function stripBlockPrefixes(line: string): string {
  let rest = line
  for (let next = rest.replace(BLOCK_PREFIX, ''); next !== rest; next = rest.replace(BLOCK_PREFIX, '')) rest = next
  return rest.replace(/[ \t]+#+[ \t]*$/, '')
}

// Escaped characters are literal text: they are set aside before any syntax is
// removed and restored afterwards.
function protectEscapes(text: string, literals: string[]): string {
  return text.replace(ESCAPABLE, (_, char: string) => `\u0000${literals.push(char) - 1}\u0000`)
}

function stripInline(text: string, literals: string[]): string {
  return text
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]+)\]\[[^\]]*\]/g, '$1')
    .replace(/<((?:https?|mailto):[^>\s]+)>/g, '$1')
    .replace(/<\/?[A-Za-z][^>]*>/g, '')
    .replace(/(\*\*|__)(?=\S)(.+?)(?<=\S)\1/g, '$2')
    .replace(/~~(?=\S)(.+?)(?<=\S)~~/g, '$1')
    .replace(/\*(?=\S)(.+?)(?<=\S)\*/g, '$1')
    .replace(/(^|[^\w])_(?=\S)(.+?)(?<=\S)_(?!\w)/g, '$1$2')
    .replace(PROTECTED, (_, index: string) => literals[Number(index)])
}

// Code spans keep their contents verbatim; only the text around them loses syntax.
function plainInline(text: string): string {
  const literals: string[] = []
  const protectedText = protectEscapes(text, literals)
  let out = ''
  let last = 0
  for (const span of protectedText.matchAll(/(`+)(.+?)\1(?!`)/g)) {
    out += stripInline(protectedText.slice(last, span.index), literals)
    out += span[2].trim().replace(PROTECTED, (_, index: string) => `\\${literals[Number(index)]}`)
    last = (span.index ?? 0) + span[0].length
  }
  return out + stripInline(protectedText.slice(last), literals)
}

function tableCells(line: string): string[] | null {
  const trimmed = line.trim()
  if (!trimmed.startsWith('|')) return null
  const cells = trimmed.slice(1).replace(/(?<!\\)\|$/, '').split(/(?<!\\)\|/)
  return cells.map(cell => plainInline(cell).trim()).filter(Boolean)
}

function collapse(text: string): string {
  return text.replace(/\s+/g, ' ').trim()
}

export function previewText(markdown: string | undefined): string {
  if (!markdown) return ''
  let fence = ''
  for (const line of markdown.split(/\r?\n/)) {
    const opener = FENCE.exec(line)
    if (fence) {
      if (opener && opener[1][0] === fence[0] && opener[1].length >= fence.length && !line.slice(opener[0].length).trim()) fence = ''
      else if (line.trim()) return collapse(line)
      continue
    }
    if (opener) { fence = opener[1]; continue }
    if (!line.trim() || THEMATIC_BREAK.test(line) || SETEXT_UNDERLINE.test(line) || TABLE_RULE.test(line)) continue
    const block = stripBlockPrefixes(line)
    const cells = tableCells(block)
    const text = collapse(cells ? cells.join(' · ') : plainInline(block))
    if (text) return text
  }
  return ''
}

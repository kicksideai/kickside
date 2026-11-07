// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0

// One-line list preview of an item's Markdown body: the first line that carries
// text, as plain text. Block markers (headings, quotes, list bullets, fences,
// thematic breaks) and inline syntax (emphasis, code, links, images, autolinks,
// HTML) are removed so the row leads with the content itself; a leading table
// reads as its header cells. The detail pane renders the full Markdown.

const FENCE = /^ {0,3}(`{3,}|~{3,})/
const THEMATIC_BREAK = /^ {0,3}([-*_])(?:[ \t]*\1){2,}[ \t]*$/
const TABLE_DELIMITER = /^[ \t]*\|?[ \t]*:?-+:?[ \t]*(?:\|[ \t]*:?-+:?[ \t]*)*\|?[ \t]*$/
const CONTAINER_PREFIX = /^[ \t]*(?:>[ \t]?|[-*+][ \t]+(?:\[[ xX]\][ \t]+)?|\d{1,9}[.)][ \t]+(?:\[[ xX]\][ \t]+)?)/
const HEADING_PREFIX = /^[ \t]*#{1,6}(?=[ \t]|$)[ \t]*/
const HEADING_CLOSE = /(?:^|[ \t]+)#+[ \t]*$/
const ESCAPABLE = /[!-/:-@[-`{-~]/
const PROTECTED = /\u0000(\d+)\u0000/g
const URI_AUTOLINK = /<([A-Za-z][A-Za-z0-9+.-]{1,31}:[^\s<>]*)>/g
const EMAIL_AUTOLINK = /<([A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?)*)>/g

function stripBlockPrefixes(line: string): string {
  let rest = line
  for (let next = rest.replace(CONTAINER_PREFIX, ''); next !== rest; next = rest.replace(CONTAINER_PREFIX, '')) rest = next
  const heading = rest.replace(HEADING_PREFIX, '')
  return heading === rest ? rest : heading.replace(HEADING_CLOSE, '')
}

// Index of the backtick run of exactly `length` that closes a code span opened before `from`.
function closingRun(text: string, from: number, length: number): number {
  const runs = /`+/g
  runs.lastIndex = from
  for (let run = runs.exec(text); run; run = runs.exec(text)) {
    if (run[0].length === length) return run.index
  }
  return -1
}

// Code spans and backslash escapes are literal text. They are set aside as
// placeholders before any syntax is removed, and restored afterwards.
function protectLiterals(text: string, literals: string[]): string {
  const protect = (literal: string) => `\u0000${literals.push(literal) - 1}\u0000`
  let out = ''
  let i = 0
  while (i < text.length) {
    if (text[i] === '\\' && ESCAPABLE.test(text[i + 1] ?? '')) {
      out += protect(text[i + 1])
      i += 2
    } else if (text[i] === '`') {
      const run = /^`+/.exec(text.slice(i))![0]
      const close = closingRun(text, i + run.length, run.length)
      if (close < 0) {
        out += protect(run)
        i += run.length
      } else {
        const code = text.slice(i + run.length, close)
        out += protect(/^ .*[^ ].* $/.test(code) ? code.slice(1, -1) : code)
        i = close + run.length
      }
    } else {
      out += text[i]
      i += 1
    }
  }
  return out
}

function plainInline(text: string): string {
  const literals: string[] = []
  return protectLiterals(text, literals)
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]+)\]\[[^\]]*\]/g, '$1')
    .replace(URI_AUTOLINK, '$1')
    .replace(EMAIL_AUTOLINK, '$1')
    .replace(/<\/?[A-Za-z][A-Za-z0-9-]*(?:\s[^<>]*)?\/?>/g, '')
    .replace(/\*\*(?=\S)(.+?)(?<=\S)\*\*/g, '$1')
    .replace(/(?<![\p{L}\p{N}_])__(?![_\s])(.+?)(?<![_\s])__(?![\p{L}\p{N}_])/gu, '$1')
    .replace(/~~(?=\S)(.+?)(?<=\S)~~/g, '$1')
    .replace(/\*(?=\S)(.+?)(?<=\S)\*/g, '$1')
    .replace(/(?<![\p{L}\p{N}_])_(?![_\s])(.+?)(?<![_\s])_(?![\p{L}\p{N}_])/gu, '$1')
    .replace(PROTECTED, (_, index: string) => literals[Number(index)])
}

function rowCells(line: string): string[] {
  return line.trim().replace(/^\|/, '').replace(/(?<!\\)\|$/, '').split(/(?<!\\)\|/)
}

// A table header row: the line is read as cells only when a delimiter row with the
// same number of cells follows it.
function tableCells(line: string, next: string | undefined): string[] | null {
  if (next === undefined || !TABLE_DELIMITER.test(next) || !next.includes('|')) return null
  const cells = rowCells(line)
  if (cells.length !== rowCells(next).length) return null
  return cells.map(cell => plainInline(cell).trim()).filter(Boolean)
}

// An opening code fence; a backtick fence's info string carries no backticks, so a
// line such as ```status``` opens an inline code span instead.
function fenceOpener(line: string): string {
  const opener = FENCE.exec(line)
  if (!opener || (opener[1][0] === '`' && line.slice(opener[0].length).includes('`'))) return ''
  return opener[1]
}

function collapse(text: string): string {
  return text.replace(/\s+/g, ' ').trim()
}

export function previewText(markdown: string | undefined): string {
  if (!markdown) return ''
  const lines = markdown.split(/\r?\n/)
  let fence = ''
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (fence) {
      const closer = FENCE.exec(line)
      if (closer && closer[1][0] === fence[0] && closer[1].length >= fence.length && !line.slice(closer[0].length).trim()) fence = ''
      else if (line.trim()) return collapse(line)
      continue
    }
    const opener = fenceOpener(line)
    if (opener) { fence = opener; continue }
    if (!line.trim() || THEMATIC_BREAK.test(line)) continue
    const block = stripBlockPrefixes(line)
    const cells = tableCells(block, lines[i + 1])
    const text = collapse(cells ? cells.join(' · ') : plainInline(block))
    if (text) return text
  }
  return ''
}

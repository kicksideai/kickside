// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
import { describe, it, expect } from 'vitest'
import { previewText } from './preview'

describe('Inbox list preview text', () => {
  it('leads a reviewed decision card with its first fact', () => {
    const content = [
      '- account: Kestrel Labs',
      '- owner: Maya Chen',
      '',
      '**digest**',
      '',
      '### Executive Summary',
      '',
      '| Metric | Value |',
      '| --- | --- |',
      '| ARR | $150,000 |',
    ].join('\n')
    expect(previewText(content)).toBe('account: Kestrel Labs')
    expect(previewText('- account: Brightline Energy')).toBe('account: Brightline Energy')
  })

  it('removes block markers', () => {
    expect(previewText('## Weekly digest ##\n\nBody')).toBe('Weekly digest')
    expect(previewText('> > quoted *note*')).toBe('quoted note')
    expect(previewText('3. third step')).toBe('third step')
    expect(previewText('- [x] shipped')).toBe('shipped')
  })

  it('skips lines that carry no text', () => {
    expect(previewText('\n\n---\n\n***\nAfter the rules')).toBe('After the rules')
    expect(previewText('<br>\n\nFirst words')).toBe('First words')
    expect(previewText('')).toBe('')
    expect(previewText(undefined)).toBe('')
    expect(previewText('\n  \n')).toBe('')
  })

  it('reads a leading table as its header cells', () => {
    expect(previewText('| amount | name |\n| ---: | :--- |\n| 61000 | Mobile \\| App |')).toBe('amount · name')
    expect(previewText('| Mobile \\| App | 61000 |\n| --- | --- |')).toBe('Mobile | App · 61000')
  })

  it('reads a leading code fence as its first code line', () => {
    expect(previewText('```json\n\n{"name": "Maya *Chen*"}\n```')).toBe('{"name": "Maya *Chen*"}')
    expect(previewText('~~~\n~~~\nAfter an empty fence')).toBe('After an empty fence')
  })

  it('keeps the text of inline syntax and drops the syntax', () => {
    expect(previewText('[Review documents](/knowledge/example/review) with **suggestions**.'))
      .toBe('Review documents with suggestions.')
    expect(previewText('![chart](/c.png) _up_ ~~down~~ <b>bold</b> <https://example.com>'))
      .toBe('chart up down bold https://example.com')
    expect(previewText('Run `a * b` on snake_case_name')).toBe('Run a * b on snake_case_name')
    expect(previewText('Literal \\*stars\\* and `\\*code\\*`')).toBe('Literal *stars* and \\*code\\*')
  })

  it('reads lines that only resemble block syntax as text', () => {
    expect(previewText('Press #')).toBe('Press #')
    expect(previewText('# Issue #12')).toBe('Issue #12')
    expect(previewText('--')).toBe('--')
    expect(previewText('===\nnext')).toBe('===')
    expect(previewText('a -- b === c')).toBe('a -- b === c')
    expect(previewText('| --- | --- |\n| a | b |')).toBe('| --- | --- |')
    expect(previewText('| a | b |\nplain')).toBe('| a | b |')
    expect(previewText('Title\n=====')).toBe('Title')
  })

  it('keeps autolinked addresses', () => {
    expect(previewText('Contact <support@example.com> now')).toBe('Contact support@example.com now')
    expect(previewText('See <ftp://files.example.com/a> later')).toBe('See ftp://files.example.com/a later')
  })

  it('keeps code span contents literal', () => {
    expect(previewText('`C:\\` is a path')).toBe('C:\\ is a path')
    expect(previewText('`` a`b `` and `*x*`')).toBe('a`b and *x*')
    expect(previewText('Use \\`not code\\` here')).toBe('Use `not code` here')
    expect(previewText('An `unclosed span')).toBe('An `unclosed span')
  })

  it('keeps intraword underscores literal', () => {
    expect(previewText('Use build__prod__backup today')).toBe('Use build__prod__backup today')
    expect(previewText('Use snake_case_name and __bold__ and _it_')).toBe('Use snake_case_name and bold and it')
    expect(previewText('Keep **strong** and in**word**')).toBe('Keep strong and inword')
  })

  it('reads a backtick line with a closing run as inline code, not a fence', () => {
    expect(previewText('```status``` is the field name')).toBe('status is the field name')
    expect(previewText('```js\nconst a = 1\n```')).toBe('const a = 1')
    expect(previewText('~~~ a`b\ncode line\n~~~')).toBe('code line')
  })

  it('reads a row as table cells only when the delimiter row has as many cells', () => {
    expect(previewText('A | B | C\n--- | ---')).toBe('A | B | C')
    expect(previewText('A | B | C\n--- | --- | ---')).toBe('A · B · C')
  })

  it('collapses whitespace into one line', () => {
    expect(previewText('  spaced \t  words  ')).toBe('spaced words')
  })
})

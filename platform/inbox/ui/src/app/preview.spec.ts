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
    expect(previewText('| --- | --- |\n| Mobile \\| App | 61000 |')).toBe('Mobile | App · 61000')
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

  it('collapses whitespace into one line', () => {
    expect(previewText('  spaced \t  words  ')).toBe('spaced words')
  })
})

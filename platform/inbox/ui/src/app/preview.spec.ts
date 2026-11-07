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
      '| Metric | Value |',
      '| --- | --- |',
    ].join('\n')
    expect(previewText(content)).toBe('account: Kestrel Labs')
    expect(previewText('- account: Brightline Energy')).toBe('account: Brightline Energy')
  })

  it('removes leading block markers', () => {
    expect(previewText('## Weekly digest')).toBe('Weekly digest')
    expect(previewText('> > quoted note')).toBe('quoted note')
    expect(previewText('3. third step')).toBe('third step')
    expect(previewText('2) second step')).toBe('second step')
    expect(previewText('* starred item')).toBe('starred item')
    expect(previewText('> - quoted item')).toBe('quoted item')
  })

  it('takes the first line that carries text', () => {
    expect(previewText('\n  \n- \nFirst words\nSecond line')).toBe('First words')
    expect(previewText('')).toBe('')
    expect(previewText(undefined)).toBe('')
    expect(previewText('\n  \n#\n')).toBe('')
  })

  it('keeps the rest of the line literal', () => {
    expect(previewText('Press # to search')).toBe('Press # to search')
    expect(previewText('#hashtag first')).toBe('#hashtag first')
    expect(previewText('Use build__prod__backup with **care**')).toBe('Use build__prod__backup with **care**')
    expect(previewText('- [x] shipped `v2`')).toBe('[x] shipped `v2`')
    expect(previewText('-not a bullet')).toBe('-not a bullet')
  })

  it('collapses whitespace into one line', () => {
    expect(previewText('  spaced \t  words  ')).toBe('spaced words')
  })
})

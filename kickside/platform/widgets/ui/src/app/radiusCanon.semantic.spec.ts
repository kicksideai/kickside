import { describe, expect, it } from 'vitest'
import { semanticRadiusViolation, type RadiusCtx } from './radiusCanon'

function ctx(selector: string, resolved: string): RadiusCtx {
  return { file: 'fixture.css', selector, raw: resolved, resolved }
}

describe('radius canon semantic roles', () => {
  it.each([
    'button',
    '.retry-button',
    '.dialog-actions .save-btn',
    '.panel > button:hover',
  ])('rejects 999px on the action selector %s', (selector) => {
    expect(semanticRadiusViolation(ctx(selector, '999px'))).toContain('8px control radius')
  })

  it('still permits 999px for a non-action switch track', () => {
    expect(semanticRadiusViolation(ctx('.switch-track', '999px'))).toBeNull()
  })

  it('permits the canonical 8px action radius', () => {
    expect(semanticRadiusViolation(ctx('.retry-button', '8px'))).toBeNull()
  })
})

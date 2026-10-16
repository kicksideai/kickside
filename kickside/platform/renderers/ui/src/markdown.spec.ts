import { describe, expect, it } from 'vitest'
import { renderMarkdown } from './markdown'

describe('markdown renderer', () => {
  it('typesets inline LaTeX as MathML', () => {
    const html = renderMarkdown('Effect $\\beta=0.147$ holds, so $A \\rightarrow B$.')
    expect(html).toContain('<math')
    expect(html).toContain('β')
    expect(html).toContain('→')
    expect(html).not.toContain('$\\beta')
  })

  it('typesets display LaTeX as a block equation', () => {
    const html = renderMarkdown('$$\nx = \\frac{1}{2}\n$$')
    expect(html).toMatch(/<math[^>]*display="block"/)
    expect(html).toContain('<mfrac>')
  })

  it('leaves currency amounts as text', () => {
    const html = renderMarkdown('It costs $5 and $10 today.')
    expect(html).not.toContain('<math')
    expect(html).toContain('$5 and $10')
  })

  it('marks a mermaid fence as a diagram carrying its source, not as a code block', () => {
    const html = renderMarkdown('```mermaid\ngantt\n  title Plan\n  task A :a1, 2026-01-01, 3d\n```')
    expect(html).toContain('<div class="md-mermaid">')
    expect(html).toContain('gantt')
    expect(html).not.toContain('<pre class="hljs">')
  })

  it('keeps scripts and event handlers out of rendered math and diagrams', () => {
    const html = renderMarkdown('```mermaid\ngraph TD; A-->B\n```\n\n$x$ <img src=x onerror=alert(1)>')
    expect(html).not.toMatch(/<img|<script|<[^>]*\son\w+=/)
  })
})

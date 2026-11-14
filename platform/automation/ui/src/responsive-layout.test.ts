import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))

describe('automation row composition', () => {
  it('reflows status and the complete action cluster instead of clipping narrow rows', () => {
    const css = readFileSync(join(HERE, 'styles.css'), 'utf8')

    // The wide row places identity, status and actions on one line with a
    // full-width footer for the status message and metric chips beneath.
    expect(css).toContain('"main status actions"')
    expect(css).toContain('"foot foot   foot"')
    // At a narrow width the status pill drops to its own line instead of the
    // cluster clipping, and the actions keep their own column.
    expect(css).toContain('@media (max-width: 560px)')
    expect(css).toContain('"status status"')
    expect(css).toMatch(/\.kx-actions\s*\{[^}]*flex-wrap:\s*wrap/)
  })
})

import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const read = (file: string) => readFileSync(resolve(process.cwd(), file), 'utf8')

describe('shared picker option rhythm', () => {
  it('publishes one title, subtitle, icon, and spacing contract', () => {
    const css = read('src/picker-base.css')
    expect(css).toContain('--kx-picker-option-icon-size: 17px')
    expect(css).toContain('--kx-picker-option-icon-gap: 10px')
    expect(css).toContain('--kx-picker-option-stack-gap: 1px')
    expect(css).toContain('--kx-picker-option-title-size: 13px')
    expect(css).toContain('--kx-picker-option-title-weight: 600')
    expect(css).toContain('--kx-picker-option-subtitle-size: 11.5px')
    expect(css).toContain('--kx-picker-option-subtitle-line-height: 1.4')
  })

  it.each([
    'src/app/pickerselect.css',
    'src/model-picker/styles.css',
    'src/multiselect/styles.css',
  ])('%s consumes the shared contract', (file) => {
    const css = read(file)
    expect(css).toContain('var(--kx-picker-option-icon-gap)')
    expect(css).toContain('var(--kx-picker-option-title-size)')
    expect(css).toContain('var(--kx-picker-option-subtitle-size)')
  })
})

/** @vitest-environment happy-dom */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import ChatFlap from './ChatFlap.vue'

const source = readFileSync(resolve(process.cwd(), 'src/app/ChatFlap.vue'), 'utf8')

describe('ChatFlap', () => {
  it('emits show from the compat-sized right-edge flap', async () => {
    const wrapper = mount(ChatFlap)

    expect(wrapper.find('.right-flap-container').classes()).toEqual(expect.arrayContaining([
      'fixed', 'top-1/2', 'right-0', '-translate-y-1/2', 'z-10',
    ]))
    expect(wrapper.find('.right-flap').classes()).toEqual(expect.arrayContaining([
      'rounded-l-md', 'shadow-md',
    ]))
    expect(source).toMatch(/\.right-flap-container\s*\{[\s\S]*?width: 48px;[\s\S]*?height: 80px;/)
    expect(source).toMatch(/\.right-flap\s*\{[\s\S]*?right: -8px;[\s\S]*?width: 40px;[\s\S]*?height: 80px;[\s\S]*?transform: translateX\(28px\);/)

    await wrapper.get('button[aria-label="Open chat"]').trigger('click')
    expect(wrapper.emitted('show')).toHaveLength(1)
  })
})

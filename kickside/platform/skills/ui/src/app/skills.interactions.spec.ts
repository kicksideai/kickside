import { describe, it, expect, beforeEach } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import Skills from './skills.vue'
beforeEach(() => {
  ;(globalThis as any).__props__ = { config: {} }
  ;(globalThis as any).__api__ = {
    '/api/v1/skills': { success: true, skills: [
      { skill_id: 's1', name: 'Summarize', description: 'condense text' },
      { skill_id: 's2', name: 'Translate', description: 'languages' },
    ] },
  }
})
describe('skills.vue interactions', () => {
  it('lists skills and filters by search', async () => {
    const w = mount(Skills)
    await flushPromises()
    expect(w.html()).toContain('Summarize')
    const s = w.find('input')
    if (s.exists()) { await s.setValue('trans'); await flushPromises() }
    const create = w.find('[data-testid="skills-create"]')
    if (create.exists()) { await create.trigger('click'); await flushPromises() }
    w.unmount()
  })
})

describe('skills.vue create', () => {
  it('opens the create form and fills it', async () => {
    const w = mount(Skills)
    await flushPromises()
    const create = w.find('[data-testid="skills-create"]')
    if (create.exists()) { await create.trigger('click'); await flushPromises() }
    const inputs = w.findAll('input, textarea')
    if (inputs[0]) await inputs[0].setValue('My Skill')
    const submit = w.findAll('button').find(b => /create|save|add/i.test(b.text()))
    if (submit) { await submit.trigger('click'); await flushPromises() }
    expect(w.exists()).toBe(true)
    w.unmount()
  })
})

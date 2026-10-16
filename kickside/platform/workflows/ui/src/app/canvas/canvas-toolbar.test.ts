// @vitest-environment happy-dom
import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import CanvasToolbar from './CanvasToolbar.vue'

vi.mock('@iconify/vue', () => ({ Icon: { props: ['icon'], template: '<i :data-icon="icon" />' } }))

const props = {
  paletteOpen: true,
  countLabel: '16 steps · 27 connections',
  canUndo: true,
  canRedo: false,
  viewingRun: false,
  layoutDir: 'TB' as const,
  runsOpen: false,
  runActive: false,
  simBusy: false,
  publishedVersion: 2,
  exportBusy: false,
  historyOpen: false,
  publishBusy: false,
}
const mountToolbar = (attachTo?: Element) => mount(CanvasToolbar, {
  props,
  attachTo,
})

describe('CanvasToolbar', () => {
  it('keeps the primary actions explicit: Undo, Redo, Add trigger, Run, Publish', () => {
    const wrapper = mountToolbar()
    expect(wrapper.find('[aria-label="Undo"]').exists()).toBe(true)
    expect(wrapper.find('[aria-label="Redo"]').exists()).toBe(true)
    expect(wrapper.findAll('button').some((b) => b.text() === 'Add trigger')).toBe(true)
    expect(wrapper.findAll('button').some((b) => b.text().includes('Run'))).toBe(true)
    expect(wrapper.findAll('button').some((b) => b.text() === 'Publish')).toBe(true)
  })

  it('opens the non-pointer connection editor from an explicit toolbar action', async () => {
    const wrapper = mountToolbar()
    const action = wrapper.get('[aria-label="Edit connections"]')
    await action.trigger('click')
    expect(wrapper.emitted('edit-connections')).toHaveLength(1)
    expect(wrapper.emitted('edit-connections')?.[0]).toEqual([action.element])
  })

  it('reports the invoking element so the canvas can anchor the surface it opens', async () => {
    const wrapper = mountToolbar()
    const runs = wrapper.get('[aria-label="Past runs"]')
    await runs.trigger('click')
    expect(wrapper.emitted('toggle-runs')?.[0]).toEqual([runs.element])
    const versions = wrapper.get('[aria-label="Versions"]')
    await versions.trigger('click')
    expect(wrapper.emitted('toggle-history')?.[0]).toEqual([versions.element])
  })

  it('labels Past runs and Versions distinctly instead of two near-synonyms', () => {
    const wrapper = mountToolbar()
    const pastRuns = wrapper.get('[aria-label="Past runs"]')
    expect(pastRuns.text()).toBe('Past runs')
    const versions = wrapper.get('[aria-label="Versions"]')
    expect(versions.text()).toBe('Versions')
    expect(versions.attributes('title')).toBe('Version history')
  })

  it('collapses canvas-view controls (fit, auto layout, direction, hide steps) into one View menu', async () => {
    const wrapper = mountToolbar()
    expect(wrapper.find('[role="menu"]').exists()).toBe(false)
    await wrapper.get('[aria-label="View controls"]').trigger('click')
    const menu = wrapper.get('[aria-label="View controls"][role="menu"]')
    expect(menu.text()).toContain('Fit view')
    expect(menu.text()).toContain('Auto layout')
    expect(menu.text()).toContain('Lay out left to right')
    expect(menu.text()).toContain('Hide steps')
  })

  it('collapses Export and Share into the overflow menu, and nothing else', async () => {
    const wrapper = mountToolbar()
    await wrapper.get('[aria-label="More workflow actions"]').trigger('click')
    const menu = wrapper.get('[aria-label="More workflow actions"][role="menu"]')
    expect(menu.text()).toContain('Share')
    expect(menu.text()).toContain('Export')
    expect(menu.text()).not.toContain('Fit view')
    expect(menu.text()).not.toContain('Past runs')
  })

  it('toggles steps visibility from the View menu and names the current action', async () => {
    const wrapper = mountToolbar()
    await wrapper.get('[aria-label="View controls"]').trigger('click')
    expect(wrapper.get('[data-testid="palette-toggle"]').text()).toBe('Hide steps')

    await wrapper.setProps({ paletteOpen: false })
    expect(wrapper.get('[data-testid="palette-toggle"]').text()).toBe('Show steps')
  })

  it('gates Add trigger until the Workflow has a published revision', async () => {
    const wrapper = mount(CanvasToolbar, { props: { ...props, publishedVersion: 0 } })
    const button = wrapper.findAll('button').find((b) => b.text() === 'Add trigger')!
    expect(button.attributes('disabled')).toBeDefined()
    expect(button.attributes('title')).toBe('Publish this Workflow before adding a trigger')
    await button.trigger('click')
    expect(wrapper.emitted('add-trigger')).toBeUndefined()
  })

  it('allows Add trigger when an exact published revision exists', async () => {
    const wrapper = mountToolbar()
    const button = wrapper.findAll('button').find((b) => b.text() === 'Add trigger')!
    expect(button.attributes('disabled')).toBeUndefined()
    expect(button.attributes('title')).toBe('Choose when this Workflow runs')
    await button.trigger('click')
    expect(wrapper.emitted('add-trigger')).toHaveLength(1)
  })

  it('emits a View menu command, closes the menu, and returns focus to its opener', async () => {
    const wrapper = mountToolbar(document.body)
    const view = wrapper.get<HTMLButtonElement>('[aria-label="View controls"]')
    await view.trigger('click')
    await wrapper.get('[aria-label="View controls"][role="menu"]').findAll('button').find((b) => b.text() === 'Fit view')!.trigger('click')
    expect(wrapper.emitted('fit')).toHaveLength(1)
    expect(wrapper.find('[role="menu"]').exists()).toBe(false)
    expect(document.activeElement).toBe(view.element)
    wrapper.unmount()
  })

  it('hands focus back before an overflow command opens its next surface', async () => {
    const wrapper = mountToolbar(document.body)
    const more = wrapper.get<HTMLButtonElement>('[aria-label="More workflow actions"]')
    await more.trigger('click')
    await wrapper.get('[aria-label="More workflow actions"][role="menu"]').findAll('button').find((b) => b.text() === 'Share')!.trigger('click')
    expect(wrapper.emitted('share')).toHaveLength(1)
    expect(document.activeElement).toBe(more.element)
    wrapper.unmount()
  })

  it('closes the View menu on Escape and restores focus to its opener', async () => {
    const wrapper = mountToolbar(document.body)
    const view = wrapper.get<HTMLButtonElement>('[aria-label="View controls"]')
    await view.trigger('click')
    await wrapper.get('[role="menu"]').trigger('keydown', { key: 'Escape' })
    expect(wrapper.find('[role="menu"]').exists()).toBe(false)
    expect(document.activeElement).toBe(view.element)
    wrapper.unmount()
  })

  it('keeps only one toolbar dropdown open at a time', async () => {
    const wrapper = mountToolbar()
    await wrapper.get('[aria-label="View controls"]').trigger('click')
    expect(wrapper.findAll('[role="menu"]')).toHaveLength(1)
    await wrapper.get('[aria-label="More workflow actions"]').trigger('click')
    const menus = wrapper.findAll('[role="menu"]')
    expect(menus).toHaveLength(1)
    expect(menus[0].attributes('aria-label')).toBe('More workflow actions')
  })
})

describe('BOT-WORKFLOW-PUBLISHED-LAUNCH', () => {
  it('offers a separate published run and preserves draft Run', async () => {
    const w = mountToolbar()
    await w.get('[aria-label="Run published"]').trigger('click')
    expect(w.emitted('run-published')).toHaveLength(1)
    expect(w.emitted('run')).toBeUndefined()
    await w.findAll('button').find(b => b.text() === 'Run')!.trigger('click')
    expect(w.emitted('run')).toHaveLength(1)
    w.unmount()
  })
  it('refuses a published launch when no frozen version exists or a run is being viewed', () => {
    for (const changes of [{ publishedVersion: 0 }, { viewingRun: true }]) {
      const w = mount(CanvasToolbar, { props: { ...props, ...changes } })
      expect(w.get('[aria-label="Run published"]').attributes('disabled')).toBeDefined()
      w.unmount()
    }
  })
})

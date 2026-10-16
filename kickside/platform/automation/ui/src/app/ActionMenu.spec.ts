import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import ActionMenu from './ActionMenu.vue'
import AnchoredPanel from '@widgets/app/AnchoredPanel.vue'
import type { ActionItem } from './action-model'

const items: ActionItem[] = [{ method: 'run_now', label: 'Run now', description: 'Run the task',
  group: 'run', icon: 'tabler:player-play', kind: 'call' }]

describe('AUTOMATION-DRAWER-ACTION-MENU-PLACEMENT', () => {
  it('anchors through the shared panel and emits one action before closing', async () => {
    const w = mount(ActionMenu, { props: { items, name: 'Task' } })
    await w.get('button[aria-label="More actions for Task"]').trigger('click')
    expect(w.getComponent(AnchoredPanel).props()).toMatchObject({ open: true, align: 'right', width: 264, gap: 6 })
    expect(w.getComponent(AnchoredPanel).props('anchor')).toBe(w.get('.kx-menu').element)
    await w.get('[role="menuitem"]').trigger('click')
    expect(w.emitted('select')).toEqual([['run_now']])
    expect(w.find('[role="menu"]').exists()).toBe(false)
    w.unmount()
  })
  it('closes on Escape and outside click without choosing an action', async () => {
    const w = mount(ActionMenu, { props: { items, name: 'Task' } })
    const trigger = w.get('button[aria-label="More actions for Task"]')
    await trigger.trigger('click')
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await w.vm.$nextTick()
    expect(w.find('[role="menu"]').exists()).toBe(false)
    await trigger.trigger('click')
    document.body.click()
    await w.vm.$nextTick()
    expect(w.find('[role="menu"]').exists()).toBe(false)
    expect(w.emitted('select')).toBeUndefined()
    w.unmount()
  })
})

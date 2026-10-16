import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import DetailDrawer from './DetailDrawer.vue'
import WcMount from '@widgets/app/WcMount.vue'

describe('BOT-AUTOMATION-IDENTITY-EDITOR drawer integration', () => {
  it('mounts the same owning editor for an ADMIN root', async () => {
    const w = mount(DetailDrawer, { props: { automation: { id: 'root', access_level: 15 } }, global: { stubs: { WcMount: true } } })
    await w.get('[data-testid="drawer-tab-config"]').trigger('click')
    expect(w.getComponent(WcMount).props()).toMatchObject({ tag: 'wc-execution-identity-editor', attrs: { root: 'root' } })
    w.unmount()
  })
  it('does not open the protected editor for read/write or absent access projections', async () => {
    for (const access_level of [undefined, 0, 1, 3, 7]) {
      const w = mount(DetailDrawer, { props: { automation: { id: 'root', access_level } }, global: { stubs: { WcMount: true } } })
      await w.get('[data-testid="drawer-tab-config"]').trigger('click')
      expect(w.findComponent(WcMount).exists()).toBe(false)
      w.unmount()
    }
  })
})

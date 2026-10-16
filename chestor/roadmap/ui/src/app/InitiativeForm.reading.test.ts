// @vitest-environment happy-dom
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import InitiativeForm from './InitiativeForm.vue'
import { initiative, roadmap } from './fixtures'
import { EMPTY_TRACE } from './trace'
describe('initiative dependency labels', () => {
  it('names an unavailable dependency without exposing its address', () => {
    const view = mount(InitiativeForm, { props: { state: roadmap(), initiative: initiative('selected'), trace: { ...EMPTY_TRACE, needs: new Set(['opaque-address']) }, editable: false } })
    expect(view.text()).not.toContain('opaque-address')
    expect(view.text()).toContain('Unavailable initiative')
    view.unmount()
  })
})

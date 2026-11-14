// @vitest-environment happy-dom
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { vi } from 'vitest'
import Select from 'primevue/select'
import SelectButton from 'primevue/selectbutton'

// The Icon mock keeps its own text/label out of the DOM so the only element children a
// toolbar item carries are the ones this component adds.
vi.mock('@iconify/vue', () => ({ Icon: { template: '<span class="ico" aria-hidden="true" />' } }))

const WorkflowListHeader = (await import('./WorkflowListHeader.vue')).default

function head(overrides: Record<string, unknown> = {}) {
  return mount(WorkflowListHeader, {
    props: {
      totalCount: 3,
      labelVocab: ['CRM', 'Sales'],
      q: '',
      labelFilter: null,
      groupBy: 'flat',
      ...overrides,
    },
  })
}

// The toolbar is a single flat row of direct children under .kx-head-actions. Stable
// feature hooks pin the compact-row order without depending on PrimeVue presentation classes.
function actionSignature(wrapper: ReturnType<typeof head>): string[] {
  const actions = wrapper.get('.kx-head-actions').element
  return Array.from(actions.children).map((el) => {
    if (el.classList.contains('kx-search')) return 'search'
    if (el.classList.contains('wf-label-filter')) return 'labels'
    if (el.classList.contains('kx-seg')) return 'toggle'
    if (el.classList.contains('kx-count')) return 'count'
    if ((el as HTMLElement).dataset.testid === 'create-workflow') return 'new'
    if ((el as HTMLElement).dataset.testid === 'import-workflow') return 'import'
    return el.className
  })
}

describe('WorkflowListHeader compact single-row composition', () => {
  it('is one header row with no stacked subtitle block', () => {
    const wrapper = head()
    expect(wrapper.findAll('header.kx-head')).toHaveLength(1)
    expect(wrapper.find('.kx-head-sub').exists()).toBe(false)
    expect(wrapper.find('.kx-title').text()).toBe('Workflows')
  })

  it('preserves the page description as the title tooltip instead of a visible line', () => {
    const wrapper = head()
    expect(wrapper.get('.kx-title').attributes('title')).toContain('Build Workflows from steps')
  })

  it('orders the single toolbar row: search, label filter, toggle, Import, count, primary', () => {
    expect(actionSignature(head())).toEqual([
      'search',
      'labels',
      'toggle',
      'import',
      'count',
      'new',
    ])
  })

  it('drops the label filter cleanly when no labels exist, keeping the same order', () => {
    expect(actionSignature(head({ labelVocab: [] }))).toEqual([
      'search',
      'toggle',
      'import',
      'count',
      'new',
    ])
  })

  it('renders the count as quiet muted text (no icon) right before the primary action', () => {
    const wrapper = head()
    const count = wrapper.get('.kx-count')
    expect(count.text()).toBe('3 Workflows')
    expect(count.element.children).toHaveLength(0)
    const actions = wrapper.get('.kx-head-actions').element
    const kids = Array.from(actions.children)
    const countIdx = kids.findIndex((el) => el.classList.contains('kx-count'))
    expect((kids[countIdx + 1] as HTMLElement).dataset.testid).toBe('create-workflow')
  })

  it('singularizes the count for a lone workflow', () => {
    expect(head({ totalCount: 1 }).get('.kx-count').text()).toBe('1 Workflow')
  })

  it('keeps the primary New action as the last item in the row', () => {
    const wrapper = head()
    const actions = wrapper.get('.kx-head-actions').element
    const last = actions.children[actions.children.length - 1]
    expect((last as HTMLElement).dataset.testid).toBe('create-workflow')
    expect(last.textContent).toContain('New Workflow')
  })

  it('still drives search, the view toggle, the label filter and both actions', async () => {
    const wrapper = head()
    await wrapper.get('.kx-search-input').setValue('lead')
    expect(wrapper.emitted('update:q')?.[0]).toEqual(['lead'])

    wrapper.getComponent(SelectButton).vm.$emit('update:modelValue', 'label')
    await wrapper.vm.$nextTick()
    expect(wrapper.emitted('update:groupBy')?.[0]).toEqual(['label'])

    wrapper.getComponent(Select).vm.$emit('update:modelValue', 'CRM')
    await wrapper.vm.$nextTick()
    expect(wrapper.emitted('update:labelFilter')?.[0]).toEqual(['CRM'])

    await wrapper.get('[data-testid="import-workflow"]').trigger('click')
    await wrapper.get('[data-testid="create-workflow"]').trigger('click')
    expect(wrapper.emitted('import')?.[0]?.[0]).toBe(wrapper.get('[data-testid="import-workflow"]').element)
    expect(wrapper.emitted('create')?.[0]?.[0]).toBe(wrapper.get('[data-testid="create-workflow"]').element)
  })
})

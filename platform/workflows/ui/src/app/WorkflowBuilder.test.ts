// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
// @vitest-environment happy-dom
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'

const host = vi.hoisted(() => ({emit: vi.fn()}))
const props = ref({route: 'draft/return/%2Fautomations'})
vi.mock('@wippy-fe/webcomponent-vue', () => ({useProps: () => props, useEvents: () => host.emit}))
vi.mock('./list/WorkflowList.vue', () => ({default: {template: '<div />'}}))
vi.mock('./WorkflowPreview.vue', () => ({default: {template: '<div />'}}))
vi.mock('./canvas/WorkflowCanvas.vue', () => ({default: {name: 'WorkflowCanvas', props: ['workflowId'], emits: ['back', 'published'], template: '<div />'}}))
const WorkflowBuilder = (await import('./WorkflowBuilder.vue')).default
beforeEach(() => host.emit.mockReset())
describe('Workflow builder return navigation', () => {
  it('opens the created draft and returns after publishing', async () => {
    const wrapper = mount(WorkflowBuilder)
    const canvas = wrapper.findComponent({name: 'WorkflowCanvas'})
    expect(canvas.props('workflowId')).toBe('draft')
    canvas.vm.$emit('published', {kind: 'flow', id: 'draft', version: 1})
    expect(host.emit).toHaveBeenCalledWith('navigate', {route: '/automations'})
  })
  it('returns on Back without publishing', async () => {
    const wrapper = mount(WorkflowBuilder)
    wrapper.findComponent({name: 'WorkflowCanvas'}).vm.$emit('back')
    expect(host.emit).toHaveBeenCalledWith('navigate', {route: '/automations'})
  })
})

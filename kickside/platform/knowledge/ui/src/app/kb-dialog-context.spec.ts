import { describe, expect, it } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import KbDialog from './KbDialog.vue'

const engine = {
  kb_type: 'wiki',
  label: 'Wiki',
  create_ui_id: 'kx-test-kb-config',
}

interface EditTarget {
  id: string
  name?: string
  kb_type?: string
  embedding_model?: string
  config?: Record<string, unknown>
}

async function openDialog(target: EditTarget | null) {
  const wrapper = mount(KbDialog, {
    props: {
      open: false,
      api: { get: async () => ({ data: {} }), post: async () => ({ data: {} }), put: async () => ({ data: {} }) },
      engines: [engine],
      models: [],
      target,
    },
  })
  await wrapper.setProps({ open: true })
  await flushPromises()
  const element = wrapper.element.querySelector('kx-test-kb-config')
  expect(element).toBeTruthy()
  return { wrapper, config: JSON.parse(element!.getAttribute('config') || '{}') }
}

describe('KbDialog engine component context', () => {
  it('passes the canonical id to an edit-mode engine component', async () => {
    const { wrapper, config } = await openDialog({
      id: 'kb-edit-123',
      name: 'Existing knowledge',
      kb_type: 'wiki',
      embedding_model: 'embed-v1',
      config: { chunk_size: 400 },
    })

    expect(config).toMatchObject({ id: 'kb-edit-123', kb_type: 'wiki', edit: true })
    wrapper.unmount()
  })

  it('does not pass an id to a create-mode engine component', async () => {
    const { wrapper, config } = await openDialog(null)

    expect(config).toMatchObject({ kb_type: 'wiki', edit: false })
    expect(config).not.toHaveProperty('id')
    wrapper.unmount()
  })
})

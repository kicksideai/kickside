import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import WebhookCreate from './WebhookCreate.vue'
import Webhooks from './Webhooks.vue'

function emitSpy() { return (globalThis as any).__emit__ }
function apiMock() { return (globalThis as any).__api_mock__ }

function byTitle(w: any, title: string) {
  return w.findAll('button').find((b: any) => b.attributes('title') === title)
}
function byText(w: any, text: string) {
  return w.findAll('button').find((b: any) => b.text().includes(text))
}

beforeEach(() => {
  ;(globalThis as any).__api__ = {}
  ;(globalThis as any).__props__ = {}
  ;(globalThis as any).__emit__ = undefined
  ;(globalThis as any).__confirm__ = vi.fn(() => Promise.resolve(true))
  ;(globalThis as any).__hostVisible__ = null
  apiMock().get.mockClear()
  apiMock().post.mockClear()
  apiMock().patch.mockClear()
  apiMock().delete.mockClear()
  ;((navigator as any).clipboard.writeText as any).mockClear?.()
})

describe('WebhookCreate', () => {
  it('emits created with the new id and posts the name + schema', async () => {
    ;(globalThis as any).__api__['/api/v1/webhooks'] = {
      success: true,
      webhook: { webhook_id: 'wh-1', url: '/api/public/hooks/wh-1', secret: 'kshook_topsecret' },
    }
    const w = mount(WebhookCreate)
    await w.find('input').setValue('Orders')
    await w.find('form').trigger('submit')
    await flushPromises()

    const post = apiMock().post.mock.calls.find((c: unknown[]) => String(c[0]).includes('/webhooks'))
    expect(post).toBeTruthy()
    expect(post[1].label).toBe('Orders')
    expect(post[1].schema.type).toBe('object')

    expect((emitSpy().mock.calls || []).find((c: unknown[]) => c[0] === 'created')).toBeFalsy()
    await byText(w, 'Done')?.trigger('click')
    const created = emitSpy().mock.calls.find((c: unknown[]) => c[0] === 'created')
    expect(created).toBeTruthy()
    expect(created[1].webhook_id).toBe('wh-1')
    w.unmount()
  })

  it('reveals the secret once and copies it', async () => {
    ;(globalThis as any).__api__['/api/v1/webhooks'] = {
      success: true,
      webhook: { webhook_id: 'wh-1', url: '/api/public/hooks/wh-1', secret: 'kshook_topsecret' },
    }
    const w = mount(WebhookCreate)
    await w.find('form').trigger('submit')
    await flushPromises()

    expect(w.text()).toContain('Webhook created')
    expect(w.text()).toContain('shown once')
    expect(w.text()).toContain('kshook_topsecret')
    // The create fields are gone once the secret is revealed.
    expect(w.find('[data-test="wh-create"]').exists()).toBe(false)

    await byTitle(w, 'Copy secret')?.trigger('click')
    await flushPromises()
    expect((navigator as any).clipboard.writeText).toHaveBeenCalledWith('kshook_topsecret')
    w.unmount()
  })

  it('blocks invalid schema JSON before calling the API', async () => {
    const w = mount(WebhookCreate)
    await byText(w, 'Edit as JSON')?.trigger('click')
    await w.find('textarea').setValue('{ not json')
    await w.find('form').trigger('submit')
    await flushPromises()
    expect(apiMock().post).not.toHaveBeenCalled()
    const created = (emitSpy()?.mock.calls || []).find((c: unknown[]) => c[0] === 'created')
    expect(created).toBeFalsy()
    w.unmount()
  })

  it('renders a backend create error normalized through errMsg', async () => {
    ;(globalThis as any).__api__['/api/v1/webhooks'] = { success: false, error: 'payload schema rejected by server' }
    const w = mount(WebhookCreate)
    await w.find('form').trigger('submit')
    await flushPromises()
    expect(w.text()).toContain('payload schema rejected by server')
    w.unmount()
  })
})

describe('Webhooks management', () => {
  it('refreshes retained data without remounting', async () => {
    ;(globalThis as any).__api__['/api/v1/webhooks'] = { success: true, webhooks: [] }
    const w = mount(Webhooks)
    await flushPromises()
    const root = w.element
    expect(apiMock().get).toHaveBeenCalledTimes(1)
    await (globalThis as any).__setHostVisible__(true)
    await flushPromises()
    expect(apiMock().get).toHaveBeenCalledTimes(1)
    await (globalThis as any).__setHostVisible__(false)
    await (globalThis as any).__setHostVisible__(true)
    await flushPromises()
    expect(apiMock().get).toHaveBeenCalledTimes(2)
    expect(w.element).toBe(root)
    w.unmount()
  })

  it('shows status and usage on the card', async () => {
    ;(globalThis as any).__api__['/api/v1/webhooks'] = {
      success: true,
      webhooks: [{ webhook_id: 'wh-2', label: 'Orders', status: 'active', secret_prefix: 'kshook_ab', subscriber_count: 2, created_at: 1_700_000_000 }],
    }
    const w = mount(Webhooks)
    await flushPromises()
    // Status renders via the label map, not the raw enum.
    expect(w.text()).toContain('Active')
    // Usage is surfaced as an automations count, not a raw "subscribers" field.
    expect(w.text()).toContain('2 automations')
    w.unmount()
  })

  it('reveals the endpoint URL in the detail modal', async () => {
    ;(globalThis as any).__api__['/api/v1/webhooks'] = {
      success: true,
      webhooks: [{ webhook_id: 'wh-2', label: 'Orders', status: 'active', secret_prefix: 'kshook_ab', created_at: 1_700_000_000 }],
    }
    const w = mount(Webhooks)
    await flushPromises()
    await w.find('.kx-card').trigger('click')
    await flushPromises()
    expect(w.text()).toContain('http://localhost:3000/api/public/hooks/wh-2')
    // Secret is never re-shown in full — only the prefix.
    expect(w.text()).toContain('kshook_ab')
    w.unmount()
  })

  it('revokes only after host.confirm accepts', async () => {
    ;(globalThis as any).__api__['/api/v1/webhooks'] = {
      success: true,
      webhooks: [{ webhook_id: 'wh-2', label: 'Orders', status: 'active', subscriber_count: 2, created_at: 1_700_000_000 }],
    }
    const w = mount(Webhooks)
    await flushPromises()

    await byTitle(w, 'Revoke')?.trigger('click')
    await flushPromises()
    expect((globalThis as any).__confirm__).toHaveBeenCalled()
    expect(apiMock().post).toHaveBeenCalledWith(expect.stringContaining('/api/v1/webhooks/wh-2/revoke'), {})
    w.unmount()
  })

  it('offers removal for an active webhook', async () => {
    ;(globalThis as any).__api__['/api/v1/webhooks'] = {
      success: true,
      webhooks: [{ webhook_id: 'wh-active', label: 'Active hook', status: 'active', created_at: 1_700_000_000 }],
    }
    const w = mount(Webhooks)
    await flushPromises()

    await byTitle(w, 'Remove')?.trigger('click')
    await flushPromises()
    expect(apiMock().delete).toHaveBeenCalledWith(expect.stringContaining('/api/v1/webhooks/wh-active'))
    w.unmount()
  })

  it('blocks removal while a webhook backs automation subscribers', async () => {
    ;(globalThis as any).__api__['/api/v1/webhooks'] = {
      success: true,
      webhooks: [{ webhook_id: 'wh-used', label: 'In use', status: 'active', subscriber_count: 3, created_at: 1_700_000_000 }],
    }
    const w = mount(Webhooks)
    await flushPromises()

    const remove = byTitle(w, 'Remove')
    expect(remove?.attributes('disabled')).toBeDefined()

    await remove?.trigger('click')
    await flushPromises()
    expect(apiMock().delete).not.toHaveBeenCalled()
    expect((globalThis as any).__confirm__).not.toHaveBeenCalled()
    w.unmount()
  })

  it('does not revoke when confirm is declined', async () => {
    ;(globalThis as any).__confirm__ = vi.fn(() => Promise.resolve(false))
    ;(globalThis as any).__api__['/api/v1/webhooks'] = {
      success: true,
      webhooks: [{ webhook_id: 'wh-3', label: 'Leads', status: 'active', created_at: 1_700_000_000 }],
    }
    const w = mount(Webhooks)
    await flushPromises()
    await byTitle(w, 'Revoke')?.trigger('click')
    await flushPromises()
    expect((globalThis as any).__confirm__).toHaveBeenCalled()
    expect(apiMock().post).not.toHaveBeenCalledWith(expect.stringContaining('/api/v1/webhooks/wh-3/revoke'), {})
    w.unmount()
  })

  it('removes a revoked webhook through the delete endpoint', async () => {
    ;(globalThis as any).__api__['/api/v1/webhooks'] = {
      success: true,
      webhooks: [{ webhook_id: 'wh-old', label: 'Old hook', status: 'revoked', created_at: 1_700_000_000 }],
    }
    const w = mount(Webhooks)
    await flushPromises()
    expect(w.text()).toContain('Revoked')

    await byTitle(w, 'Remove')?.trigger('click')
    await flushPromises()
    expect((globalThis as any).__confirm__).toHaveBeenCalled()
    expect(apiMock().delete).toHaveBeenCalledWith(expect.stringContaining('/api/v1/webhooks/wh-old'))
    w.unmount()
  })

  it('closes the create modal and reloads the list when Create finishes', async () => {
    ;(globalThis as any).__api__['/api/v1/webhooks'] = (body?: any) =>
      body
        ? { success: true, webhook: { webhook_id: 'wh-new', url: '/api/public/hooks/wh-new', secret: 'kshook_x' } }
        : { success: true, webhooks: [] }
    const w = mount(Webhooks)
    await flushPromises()
    apiMock().get.mockClear()

    await byText(w, 'New webhook')?.trigger('click')
    await flushPromises()
    expect(w.findComponent(WebhookCreate).exists()).toBe(true)

    // Submit the create form, then press Done — the Vue-child listeners must fire.
    await w.find('form').trigger('submit')
    await flushPromises()
    await byText(w, 'Done')?.trigger('click')
    await flushPromises()

    expect(w.findComponent(WebhookCreate).exists()).toBe(false)
    expect(apiMock().get).toHaveBeenCalledWith('/api/v1/webhooks')
    w.unmount()
  })

  it('maps the internal component-not-found delete error to friendly copy', async () => {
    ;(globalThis as any).__api__ = {}
    ;(globalThis as any).__api__['/api/v1/webhooks/wh-orphan'] = { success: false, error: 'Component not found or insufficient access to delete' }
    ;(globalThis as any).__api__['/api/v1/webhooks'] = {
      success: true,
      webhooks: [{ webhook_id: 'wh-orphan', label: 'Orphan', status: 'revoked', created_at: 1_700_000_000 }],
    }
    const w = mount(Webhooks)
    await flushPromises()

    await byTitle(w, 'Remove')?.trigger('click')
    await flushPromises()

    expect(apiMock().delete).toHaveBeenCalledWith(expect.stringContaining('/api/v1/webhooks/wh-orphan'))
    expect(w.text()).not.toContain('insufficient access')
    expect(w.text()).toContain('already have been removed')
    w.unmount()
  })

  it('renames and updates schema from the detail modal', async () => {
    ;(globalThis as any).__api__['/api/v1/webhooks'] = {
      success: true,
      webhooks: [{
        webhook_id: 'wh-4',
        label: 'Events',
        status: 'active',
        schema: { type: 'object', properties: { name: { type: 'string' } } },
        created_at: 1_700_000_000,
      }],
    }
    const w = mount(Webhooks)
    await flushPromises()

    await w.find('.kx-card').trigger('click')
    await flushPromises()
    // Rename via the modal name field.
    await w.find('[data-test="wh-name"]').setValue('Order events')
    // Open the raw JSON editor and rewrite the schema.
    await byText(w, 'Edit as JSON')?.trigger('click')
    await w.find('textarea').setValue(JSON.stringify({ type: 'object', properties: { total: { type: 'number' } } }))
    await byText(w, 'Save changes')?.trigger('click')
    await flushPromises()

    const call = apiMock().patch.mock.calls.find((c: unknown[]) => String(c[0]).includes('/webhooks/wh-4'))
    expect(call).toBeTruthy()
    expect(call[1].label).toBe('Order events')
    expect(call[1].schema.properties.total.type).toBe('number')
    w.unmount()
  })

  it('renders the payload schema as a readable field list', async () => {
    ;(globalThis as any).__api__['/api/v1/webhooks'] = {
      success: true,
      webhooks: [{
        webhook_id: 'wh-6',
        label: 'Events',
        status: 'active',
        schema: { type: 'object', required: ['total'], properties: { total: { type: 'number', description: 'order total' } } },
        created_at: 1_700_000_000,
      }],
    }
    const w = mount(Webhooks)
    await flushPromises()
    await w.find('.kx-card').trigger('click')
    await flushPromises()
    expect(w.text()).toContain('total')
    expect(w.text()).toContain('number')
    expect(w.text()).toContain('required')
    expect(w.text()).toContain('order total')
    w.unmount()
  })

  it('blocks invalid schema JSON before updating', async () => {
    ;(globalThis as any).__api__['/api/v1/webhooks'] = {
      success: true,
      webhooks: [{ webhook_id: 'wh-5', label: 'Events', status: 'active', schema: { type: 'object' } }],
    }
    const w = mount(Webhooks)
    await flushPromises()

    await w.find('.kx-card').trigger('click')
    await flushPromises()
    await byText(w, 'Edit as JSON')?.trigger('click')
    await w.find('textarea').setValue('{ nope')
    await byText(w, 'Save changes')?.trigger('click')
    await flushPromises()

    expect(apiMock().patch).not.toHaveBeenCalled()
    expect(w.text()).toContain('Expected property name')
    w.unmount()
  })
})

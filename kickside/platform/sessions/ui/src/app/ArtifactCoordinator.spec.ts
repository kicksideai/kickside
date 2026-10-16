/**
 * Routing contract for the artifact coordinator.
 *
 * The rule under test: the artifact side panel is only meaningful next to the
 * session in the URL. On a `/sessions/<id>` route an artifact opens there; off
 * it — where the same chat component runs as a floating sidebar over unrelated
 * pages — it opens in a modal, and an artifact that merely *arrives* opens
 * nothing at all.
 *
 * Every case here corresponds to a defect that shipped at least once, so these
 * are regression guards rather than illustrations.
 */
import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import ArtifactCoordinator from './ArtifactCoordinator.vue'

const hooks = vi.hoisted(() => ({
  manager: {
    expandPanel: vi.fn(),
    openDrawer: vi.fn(),
    collapsePanel: vi.fn(),
    closeDrawer: vi.fn(),
  },
  layout: {
    openModal: vi.fn(),
    closeModal: vi.fn(),
  },
  bus: {
    broadcast: vi.fn(),
    subscribe: vi.fn(),
  },
  artifact: vi.fn(),
  /** Handlers the component registers, captured at mount. */
  busHandler: null as null | ((event: unknown) => void),
  wsHandler: null as null | ((message: unknown) => void),
}))

vi.mock('@wippy-fe/proxy', () => ({
  getLayoutManager: () => hooks.manager,
  on: (_topic: string, handler: (message: unknown) => void) => {
    hooks.wsHandler = handler
    return () => {}
  },
}))

vi.mock('@wippy-fe/webcomponent-vue', () => ({
  useHost: () => ({ layout: hooks.layout }),
  useLayoutBus: () => ({
    broadcast: hooks.bus.broadcast,
    subscribe: (handler: (event: unknown) => void) => {
      hooks.busHandler = handler
      return () => {}
    },
  }),
  useProps: () => ({ value: {} }),
  useEvents: () => vi.fn(),
  useHostVisibilityRefresh: (callback: () => unknown) => callback(),
}))

vi.mock('./useSessionsApi.ts', () => ({
  useSessionsApi: () => ({ artifact: hooks.artifact }),
}))

const SESSION = 's-1'

function setPath(path: string) {
  window.history.pushState({}, '', path)
}

/** Drains the title fetch and the deferred `setTimeout(0)` broadcast. */
async function settle() {
  await flushPromises()
  await vi.advanceTimersByTimeAsync(0)
  await flushPromises()
}

function openIntent(extra: Record<string, unknown> = {}, sourcePanelId: string | null = 'main') {
  return {
    channel: '@HOST/intent',
    payload: { intent: 'openArtifact', uuid: 'a-1', target: 'sidebar', ...extra },
    sourcePanelId,
  }
}

function mountCoordinator() {
  const wrapper = mount(ArtifactCoordinator)
  return wrapper
}

beforeEach(() => {
  vi.clearAllMocks()
  hooks.busHandler = null
  hooks.wsHandler = null
  hooks.artifact.mockResolvedValue({ title: 'Quarterly report' })
  setPath('/')
})

describe('on a session route', () => {
  beforeEach(() => setPath(`/sessions/${SESSION}`))

  it('seeds the active session from the address bar', async () => {
    // A click can land before the shell broadcasts, so the panel must already
    // be considered valid at mount.
    mountCoordinator()
    hooks.busHandler!(openIntent({ reason: 'click' }))
    await settle()

    expect(hooks.manager.expandPanel).toHaveBeenCalledWith('artifact')
    expect(hooks.layout.openModal).not.toHaveBeenCalled()
  })

  it('opens a clicked artifact in the panel and tells it which one', async () => {
    mountCoordinator()
    hooks.busHandler!(openIntent({ reason: 'click' }))
    await settle()

    expect(hooks.manager.expandPanel).toHaveBeenCalledWith('artifact')
    expect(hooks.manager.openDrawer).toHaveBeenCalledWith('artifact')
    expect(hooks.bus.broadcast).toHaveBeenCalledWith('kickside:artifact-open', { uuid: 'a-1' })
  })

  it('opens an arriving artifact in the panel', async () => {
    mountCoordinator()
    hooks.busHandler!(openIntent({ reason: 'arrival' }))
    await settle()

    expect(hooks.manager.expandPanel).toHaveBeenCalledWith('artifact')
  })

  it('honours an explicit request for a modal', async () => {
    // A child that asks for a modal knows something the coordinator does not;
    // being on a session route must not override it.
    mountCoordinator()
    hooks.busHandler!(openIntent({ reason: 'click', target: 'modal' }))
    await settle()

    expect(hooks.layout.openModal).toHaveBeenCalled()
    expect(hooks.manager.expandPanel).not.toHaveBeenCalled()
  })
})

describe('off a session route', () => {
  beforeEach(() => setPath('/agents'))

  it('opens a clicked artifact in a modal, never the panel', async () => {
    mountCoordinator()
    hooks.busHandler!(openIntent({ reason: 'click' }))
    await settle()

    expect(hooks.manager.expandPanel).not.toHaveBeenCalled()
    expect(hooks.layout.openModal).toHaveBeenCalledWith(
      'artifact-modal',
      expect.objectContaining({ kind: 'artifact', id: 'a-1', title: 'Quarterly report' }),
    )
  })

  it('opens nothing when an artifact merely arrives', async () => {
    // The sidebar chat runs over unrelated pages; an artifact appearing there
    // must not throw a modal over whatever the reader is doing.
    mountCoordinator()
    hooks.busHandler!(openIntent({ reason: 'arrival' }))
    await settle()

    expect(hooks.layout.openModal).not.toHaveBeenCalled()
    expect(hooks.manager.expandPanel).not.toHaveBeenCalled()
  })

  it('treats an intent with no reason as a deliberate open', async () => {
    // Publishers that predate `reason` omit it; they were always clicks.
    mountCoordinator()
    hooks.busHandler!(openIntent())
    await settle()

    expect(hooks.layout.openModal).toHaveBeenCalled()
  })

  it('still opens a modal when the title lookup fails', async () => {
    hooks.artifact.mockRejectedValue(new Error('gone'))
    mountCoordinator()
    hooks.busHandler!(openIntent({ reason: 'click' }))
    await settle()

    expect(hooks.layout.openModal).toHaveBeenCalledWith(
      'artifact-modal',
      expect.objectContaining({ id: 'a-1', title: 'Artifact' }),
    )
  })

  it('closes the modal before reopening it', async () => {
    // The receiver silently drops `openModal` for an id that is already open,
    // so replacing a live modal's contents does nothing without this.
    mountCoordinator()
    hooks.busHandler!(openIntent({ reason: 'click' }))
    await settle()

    const closeOrder = hooks.layout.closeModal.mock.invocationCallOrder.at(-1)!
    const openOrder = hooks.layout.openModal.mock.invocationCallOrder.at(-1)!
    expect(closeOrder).toBeLessThan(openOrder)
  })

  it('does not let a superseded title lookup reopen a stale artifact', async () => {
    // Two clicks in flight: the first resolving last must not win.
    let resolveFirst!: (value: unknown) => void
    hooks.artifact
      .mockImplementationOnce(() => new Promise((resolve) => { resolveFirst = resolve }))
      .mockResolvedValueOnce({ title: 'Second' })

    mountCoordinator()
    hooks.busHandler!(openIntent({ uuid: 'a-old', reason: 'click' }))
    hooks.busHandler!(openIntent({ uuid: 'a-new', reason: 'click' }))
    await settle()
    resolveFirst({ title: 'First' })
    await settle()

    const opened = hooks.layout.openModal.mock.calls.map(call => (call[1] as { id: string }).id)
    expect(opened).toEqual(['a-new'])
  })
})

describe('following the shell', () => {
  it('closes both surfaces when the session changes', async () => {
    setPath(`/sessions/${SESSION}`)
    mountCoordinator()
    hooks.busHandler!({ channel: 'kickside:artifact-session', payload: { sessionId: 's-2' } })
    await settle()

    expect(hooks.manager.collapsePanel).toHaveBeenCalledWith('artifact')
    expect(hooks.manager.closeDrawer).toHaveBeenCalledWith('artifact')
    expect(hooks.layout.closeModal).toHaveBeenCalledWith('artifact-modal')
  })

  it('closes the modal on a route change that keeps the same session', async () => {
    // Walking between two non-session routes broadcasts an empty id twice. The
    // modal belongs to the page it was opened over, so it must still close.
    setPath('/agents')
    mountCoordinator()
    hooks.busHandler!({ channel: 'kickside:artifact-session', payload: { sessionId: '' } })
    await settle()

    expect(hooks.layout.closeModal).toHaveBeenCalledWith('artifact-modal')
    expect(hooks.manager.collapsePanel).not.toHaveBeenCalled()
  })

  it('stops routing to the panel once the session is gone', async () => {
    setPath(`/sessions/${SESSION}`)
    mountCoordinator()
    hooks.busHandler!({ channel: 'kickside:artifact-session', payload: { sessionId: '' } })
    hooks.busHandler!(openIntent({ reason: 'click' }))
    await settle()

    expect(hooks.manager.expandPanel).not.toHaveBeenCalled()
    expect(hooks.layout.openModal).toHaveBeenCalled()
  })
})

describe('websocket sidebar pushes', () => {
  beforeEach(() => setPath(`/sessions/${SESSION}`))

  it('reads the command from the topic, not a payload field', async () => {
    // The proxy delivers the raw `{ topic, data }` envelope; reading
    // `envelope.action` matched nothing and made this handler dead code.
    mountCoordinator()
    hooks.wsHandler!({ topic: 'action:sidebar', data: { artifact_uuid: 'a-9' } })
    await settle()

    expect(hooks.bus.broadcast).toHaveBeenCalledWith('kickside:artifact-open', { uuid: 'a-9' })
  })

  it('ignores commands other than sidebar', async () => {
    mountCoordinator()
    hooks.wsHandler!({ topic: 'action:refresh', data: { artifact_uuid: 'a-9' } })
    await settle()

    expect(hooks.manager.expandPanel).not.toHaveBeenCalled()
  })

  it('ignores a push aimed at a different session', async () => {
    mountCoordinator()
    hooks.wsHandler!({ topic: 'action:sidebar', data: { artifact_uuid: 'a-9', session_id: 'other' } })
    await settle()

    expect(hooks.manager.expandPanel).not.toHaveBeenCalled()
  })

  it('never throws a modal over an unrelated page', async () => {
    // A server push is not a click. Off a session route it must stay silent.
    setPath('/agents')
    mountCoordinator()
    hooks.wsHandler!({ topic: 'action:sidebar', data: { artifact_uuid: 'a-9' } })
    await settle()

    expect(hooks.layout.openModal).not.toHaveBeenCalled()
  })
})

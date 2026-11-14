/**
 * Session scoping for the artifact preview panel.
 *
 * The panel is scoped to the session in the URL. Two things had to be true and
 * were not: it must refuse an artifact belonging to some other session, and
 * refusing must not cost the reader the artifact they were already looking at.
 * The selection was blanked before the ownership check ran, so a rejected
 * lookup left the panel empty with no explanation.
 */
import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import ArtifactPanel from './ArtifactPanel.vue'

const hooks = vi.hoisted(() => ({
  artifacts: vi.fn(),
  artifact: vi.fn(),
  artifactContent: vi.fn(),
  busHandler: null as null | ((event: unknown) => void),
}))

vi.mock('@wippy-fe/proxy', () => ({
  api: {},
  on: () => () => {},
}))

vi.mock('@wippy-fe/webcomponent-vue', () => ({
  useLayoutBus: () => ({
    broadcast: vi.fn(),
    subscribe: (handler: (event: unknown) => void) => {
      hooks.busHandler = handler
      return () => {}
    },
  }),
  useHostVisibilityRefresh: (callback: () => unknown) => {
    callback()
    return true
  },
  useProps: () => ({ value: {} }),
  useEvents: () => vi.fn(),
}))

vi.mock('./useSessionsApi.ts', () => ({
  useSessionsApi: () => ({
    artifacts: hooks.artifacts,
    artifact: hooks.artifact,
    artifactContent: hooks.artifactContent,
  }),
}))

const ARTIFACT = 'w-artifact-stub'
const SESSION = 's-1'
const MINE = { uuid: 'a-mine', artifact_id: 'a-mine', title: 'Mine', session_id: SESSION }

function mountPanel() {
  // `w-artifact` is a real custom element in the browser; Vue would try to
  // resolve it as a component here, so stub it and assert on the stub.
  return mount(ArtifactPanel, { global: { stubs: { Select: true, 'w-artifact': true } } })
}

function selectedArtifactId(wrapper: ReturnType<typeof mountPanel>): string | undefined {
  return wrapper.find(ARTIFACT).attributes('id')
}

/** The catalog load is debounced by 150ms, so promises alone are not enough. */
async function settle() {
  await flushPromises()
  await vi.advanceTimersByTimeAsync(150)
  await flushPromises()
}

beforeEach(() => {
  vi.clearAllMocks()
  hooks.busHandler = null
  hooks.artifacts.mockResolvedValue({ artifacts: [MINE], hasMore: false, nextCursor: '' })
  window.history.pushState({}, '', `/sessions/${SESSION}`)
})

describe('session scoping', () => {
  it('shows an artifact belonging to the session in the URL', async () => {
    const wrapper = mountPanel()
    await settle()

    expect(selectedArtifactId(wrapper)).toBe('a-mine')
  })

  it('keeps the current artifact when asked to show a foreign one', async () => {
    const wrapper = mountPanel()
    await settle()
    expect(selectedArtifactId(wrapper)).toBe('a-mine')

    hooks.artifact.mockResolvedValue({
      uuid: 'a-foreign',
      artifact_id: 'a-foreign',
      title: 'Someone else’s',
      session_id: 'other-session',
    })
    hooks.busHandler!({ channel: 'kickside:artifact-open', payload: { uuid: 'a-foreign' } })
    // Deliberately NOT settle(): the 150ms catalog refresh re-selects the
    // first artifact anyway, which would mask a missing restore. Assert in
    // the window after the lookup resolves and before the refresh fires.
    await flushPromises()

    expect(selectedArtifactId(wrapper)).toBe('a-mine')
  })

  it('shows an artifact of this session that was not in the first page', async () => {
    const wrapper = mountPanel()
    await settle()

    hooks.artifact.mockResolvedValue({
      uuid: 'a-late',
      artifact_id: 'a-late',
      title: 'Late arrival',
      session_id: SESSION,
    })
    hooks.busHandler!({ channel: 'kickside:artifact-open', payload: { uuid: 'a-late' } })
    await settle()

    expect(selectedArtifactId(wrapper)).toBe('a-late')
  })

  it('refuses any artifact when no session is active', async () => {
    // Off a `/sessions/<id>` route there is no session the artifact could
    // belong to, so the panel must not render one at all.
    window.history.pushState({}, '', '/agents')
    const wrapper = mountPanel()
    await settle()

    hooks.busHandler!({ channel: 'kickside:artifact-open', payload: { uuid: 'a-any' } })
    await settle()

    expect(hooks.artifact).not.toHaveBeenCalled()
    expect(wrapper.find(ARTIFACT).exists()).toBe(false)
  })

  it('clears the panel when the shell switches session', async () => {
    const wrapper = mountPanel()
    await settle()
    expect(selectedArtifactId(wrapper)).toBe('a-mine')

    hooks.artifacts.mockResolvedValue({ artifacts: [], hasMore: false, nextCursor: '' })
    hooks.busHandler!({ channel: 'kickside:artifact-session', payload: { sessionId: 's-2' } })
    await settle()

    expect(wrapper.find(ARTIFACT).exists()).toBe(false)
  })
})

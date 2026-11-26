// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
// @vitest-environment happy-dom
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { defineComponent, ref } from 'vue'
import { createMemoryHistory, createRouter, type Router } from 'vue-router'
import type { Window as HappyDOMWindow } from 'happy-dom'
import { classifyLink, host as proxyHost, setLocalRouter } from '@wippy-fe/proxy'
import { createAppRouter, routes } from '../router'
import type { NavItem } from '../composables/useSurfaces'
import { useHostLinks } from './use-host-links'

// The real proxy entry reads the Host API eagerly, even for its pure exports.
vi.hoisted(() => {
  vi.stubGlobal('__WIPPY_APP_API__', { host: {}, config: {}, on: vi.fn() })
})
afterAll(() => vi.unstubAllGlobals())

vi.mock('./SurfaceHost.vue', () => ({ default: { render: () => null } }))
vi.mock('../composables/useSurfaces', () => ({ useSurfaces: () => ({ navItems }) }))

const navItems = ref<NavItem[]>([])
const { resolve } = createRouter({ history: createMemoryHistory(), routes })

function navItem(path: string): NavItem {
  return {
    id: path, path, label: 'Reports', icon: 'tabler:chart-bar',
    route_name: 'reports', category: '', order: 0,
    render: 'component', component_tag: 'test-reports',
  }
}

beforeEach(() => { navItems.value = [navItem('/dashboards')] })

// Preserve the click's cancellation state without following unhandled anchors.
const navigationSettings = (window as unknown as HappyDOMWindow).happyDOM.settings.navigation
const originalNavigationSettings = { ...navigationSettings }
beforeAll(() => Object.assign(navigationSettings, {
  disableMainFrameNavigation: true,
  disableChildFrameNavigation: true,
  disableChildPageNavigation: true,
  disableFallbackToSetURL: true,
}))
afterAll(() => Object.assign(navigationSettings, originalNavigationSettings))

const context = {
  selfPageId: 'app.views:main',
  mountRoutes: {
    '/:part(.*)*': 'app.views:main',
    '/keeper/:part(.*)*': 'keeper.views:main',
  },
  routePrefix: '/app',
  hostOrigin: 'http://localhost:8098',
}

function setup(router: Pick<Router, 'push' | 'resolve'> = { push: vi.fn(), resolve }) {
  const host = {
    classifyLink: vi.fn((href: string | null | undefined) => classifyLink(href, context)),
    navigate: vi.fn(),
  }
  const wrapper = mount(defineComponent({
    setup() {
      useHostLinks(host, router)
      return () => null
    },
  }))
  return { host, router, wrapper }
}

function anchor(href = '/dashboards/dash/orders?view=all#latest', shadow = true) {
  const container = document.createElement('div')
  document.body.append(container)
  const root = shadow ? container.attachShadow({ mode: 'open' }) : container
  const link = document.createElement('a')
  link.setAttribute('href', href)
  const label = document.createElement('span')
  label.textContent = 'Open report'
  link.append(label)
  root.append(link)
  return { link, label }
}

function click(element: HTMLElement, options: MouseEventInit = {}) {
  const event = new MouseEvent('click', {
    bubbles: true, composed: true, cancelable: true, button: 0, ...options,
  })
  element.dispatchEvent(event)
  return event
}

afterEach(() => {
  setLocalRouter(null)
  document.body.replaceChildren()
})

describe('shell host links', () => {
  it.each([true, false])('pushes child-nav once on the shell router (shadow root: %s)', (shadow) => {
    const { host, router } = setup()
    const href = '/dashboards/dash/orders?view=all#latest'
    const { label } = anchor(href, shadow)
    const event = click(label)
    expect(event.defaultPrevented).toBe(true)
    expect(host.classifyLink).toHaveBeenCalledExactlyOnceWith(href)
    expect(host.classifyLink.mock.results[0]?.value.kind).toBe('child-nav')
    expect(router.push).toHaveBeenCalledExactlyOnceWith(href)
    expect(host.navigate).not.toHaveBeenCalled()
  })

  it.each(['/', '/sessions', '/sessions/abc', '/system/settings/profile', '/connections', '/inbox'])(
    'pushes the named shell route %s without nav items', (href) => {
      navItems.value = []
      const { host, router } = setup()
      expect(click(anchor(href).label).defaultPrevented).toBe(true)
      expect(host.classifyLink.mock.results[0]?.value.kind).toBe('child-nav')
      expect(router.push).toHaveBeenCalledExactlyOnceWith(href)
      expect(host.navigate).not.toHaveBeenCalled()
    },
  )

  it.each(['/api/v1/uploads/x/download', '/app/assets/report.pdf', '/@static/assets/main.js',
    '/webcomponents-reports/main.js', '/unknown', '/dashboards-other'])(
    'leaves the unowned child-nav path %s to the browser', (href) => {
      const { host, router } = setup()
      expect(click(anchor(href).label).defaultPrevented).toBe(false)
      expect(host.classifyLink.mock.results[0]?.value.kind).toBe('child-nav')
      expect(router.push).not.toHaveBeenCalled()
      expect(host.navigate).not.toHaveBeenCalled()
    },
  )

  it.each(['/dashboards?view=all#latest', '/dashboards/dash/orders?view=all#latest'])(
    'matches the normalized nav-item path for %s', (href) => {
      navItems.value = [navItem(' dashboards ')]
      const { host, router } = setup()
      expect(click(anchor(href).label).defaultPrevented).toBe(true)
      expect(router.push).toHaveBeenCalledExactlyOnceWith(href)
      expect(host.navigate).not.toHaveBeenCalled()
    },
  )

  it('uses the current effective navigation when a nav item is added or removed', () => {
    navItems.value = []
    const { router } = setup()
    const href = '/reports/orders'
    const { label } = anchor(href)
    expect(click(label).defaultPrevented).toBe(false)
    navItems.value = [navItem('/reports')]
    expect(click(label).defaultPrevented).toBe(true)
    navItems.value = []
    expect(click(label).defaultPrevented).toBe(false)
    expect(router.push).toHaveBeenCalledExactlyOnceWith(href)
  })

  it('does not treat the root nav item as owning every path', () => {
    navItems.value = [navItem('/')]
    const { host, router } = setup()
    expect(click(anchor('/api/v1/uploads/x/download').label).defaultPrevented).toBe(false)
    expect(router.push).not.toHaveBeenCalled()
    expect(host.navigate).not.toHaveBeenCalled()
  })

  it.each([true, false])('navigates host-nav once through the host (shadow root: %s)', (shadow) => {
    const { host, router } = setup()
    const href = '/app/keeper/example?view=all#latest'
    expect(click(anchor(href, shadow).label).defaultPrevented).toBe(true)
    expect(host.classifyLink.mock.results[0]?.value.kind).toBe('host-nav')
    expect(host.navigate).toHaveBeenCalledExactlyOnceWith('/keeper/example?view=all#latest')
    expect(router.push).not.toHaveBeenCalled()
  })

  it('reports a listener router push through the shell afterEach to the host', async () => {
    const host = { ...proxyHost, navigate: vi.fn(), onRouteChanged: vi.fn() }
    const router = createAppRouter('/sessions', { host, on: null })
    await router.push('/sessions')
    host.onRouteChanged.mockClear()
    const push = vi.spyOn(router, 'push')
    const { host: linkHost } = setup(router)
    const href = '/dashboards/dash/orders?view=all#latest'
    expect(click(anchor(href).label).defaultPrevented).toBe(true)
    await flushPromises()
    expect(push).toHaveBeenCalledExactlyOnceWith(href)
    expect(router.currentRoute.value.fullPath).toBe(href)
    expect(host.onRouteChanged).toHaveBeenCalledExactlyOnceWith(href, undefined)
    expect(host.navigate).not.toHaveBeenCalled()
    expect(linkHost.navigate).not.toHaveBeenCalled()
  })

  it.each(['host-nav', 'child-nav'] as const)('uses a validated href without normalizedPath (%s)', (kind) => {
    const { host, router } = setup()
    const href = '/dashboards/dash/orders'
    host.classifyLink.mockReturnValue({ kind, href })
    expect(click(anchor(href).label).defaultPrevented).toBe(true)
    expect(kind === 'host-nav' ? host.navigate : router.push).toHaveBeenCalledExactlyOnceWith(href)
    expect(kind === 'host-nav' ? router.push : host.navigate).not.toHaveBeenCalled()
  })

  it('handles an explicit _self target', () => {
    const { host, router } = setup()
    const { link, label } = anchor()
    link.target = '_self'
    click(label)
    expect(router.push).toHaveBeenCalledTimes(1)
    expect(host.navigate).not.toHaveBeenCalled()
  })

  it.each([
    { ctrlKey: true }, { metaKey: true }, { shiftKey: true }, { altKey: true },
    { button: 1 }, { button: 2 },
  ])('leaves modified and non-primary clicks alone (%j)', (options) => {
    const { host, router } = setup()
    expect(click(anchor().label, options).defaultPrevented).toBe(false)
    expect(host.classifyLink).not.toHaveBeenCalled()
    expect(host.navigate).not.toHaveBeenCalled()
    expect(router.push).not.toHaveBeenCalled()
  })

  it.each([
    ['target', '_blank'], ['target', 'report-window'], ['download', ''],
    ['href', ''], ['href', null],
  ])('leaves anchors with %s=%s alone', (name, value) => {
    const { host, router } = setup()
    const { link, label } = anchor()
    if (value === null) link.removeAttribute(name)
    else link.setAttribute(name, value)
    expect(click(label).defaultPrevented).toBe(false)
    expect(host.classifyLink).not.toHaveBeenCalled()
    expect(host.navigate).not.toHaveBeenCalled()
    expect(router.push).not.toHaveBeenCalled()
  })

  it.each([
    '//keeper/x', '/keeper//x', 'javascript:alert(1)', 'https://example.com/keeper/x',
    'http://localhost:8098/keeper/x', 'custom:keeper/x', 'keeper/x',
    '\\keeper\\x', '/keeper\\x', '/keeper/\nx', '/keeper/\tx', '/keeper/\u007fx',
    '/keeper/\u0085x', '/keeper/x?value=\nx',
  ])('leaves unsafe or external href %j alone with the real classifier', (href) => {
    const { host, router } = setup()
    expect(click(anchor(href).label).defaultPrevented).toBe(false)
    expect(host.navigate).not.toHaveBeenCalled()
    expect(router.push).not.toHaveBeenCalled()
  })

  it.each(['host-nav', 'child-nav'] as const)('rejects an invalid normalizedPath for %s', (kind) => {
    const { host, router } = setup()
    for (const normalizedPath of ['//keeper/x', '/keeper//x', 'javascript:alert(1)',
      'https://example.com/x', '/keeper\\x', '/keeper/\nx']) {
      host.classifyLink.mockReturnValue({ kind, href: '/keeper/example', normalizedPath })
      expect(click(anchor('/keeper/example').label).defaultPrevented).toBe(false)
    }
    expect(host.navigate).not.toHaveBeenCalled()
    expect(router.push).not.toHaveBeenCalled()
  })

  it.each([true, false].flatMap(shadow => ['', '#', '#latest'].map(href => ({ href, shadow }))))(
    'leaves an empty or hash href $href to the browser (shadow root: $shadow)', ({ href, shadow }) => {
      const { host, router } = setup()
      expect(click(anchor(href, shadow).label).defaultPrevented).toBe(false)
      if (href) expect(host.classifyLink.mock.results[0]?.value.kind).toBe('ignore')
      else expect(host.classifyLink).not.toHaveBeenCalled()
      expect(host.navigate).not.toHaveBeenCalled()
      expect(router.push).not.toHaveBeenCalled()
    },
  )

  it('allows double slashes in a query or fragment', () => {
    const { host, router } = setup()
    const href = '/keeper/example?return=https://example.com/x#https://example.com/y'
    expect(click(anchor(href).label).defaultPrevented).toBe(true)
    expect(host.navigate).toHaveBeenCalledExactlyOnceWith(href)
    expect(router.push).not.toHaveBeenCalled()
  })

  it('respects an event prevented inside the shadow root', () => {
    const { host, router } = setup()
    const { label } = anchor()
    label.addEventListener('click', event => event.preventDefault())
    expect(click(label).defaultPrevented).toBe(true)
    expect(host.classifyLink).not.toHaveBeenCalled()
    expect(host.navigate).not.toHaveBeenCalled()
    expect(router.push).not.toHaveBeenCalled()
  })

  it('skips light-DOM events already handled by the Host proxy', () => {
    const navigate = vi.fn()
    const proxyHandler = (event: MouseEvent) => {
      const link = (event.target as Element).closest('a')
      if (!link) return
      event.preventDefault()
      navigate(link.getAttribute('href'))
    }
    document.addEventListener('click', proxyHandler)
    const { host, router } = setup()
    try {
      expect(click(anchor('/keeper/example', false).label).defaultPrevented).toBe(true)
      expect(navigate).toHaveBeenCalledExactlyOnceWith('/keeper/example')
      expect(host.classifyLink).not.toHaveBeenCalled()
      expect(host.navigate).not.toHaveBeenCalled()
      expect(router.push).not.toHaveBeenCalled()
    } finally {
      document.removeEventListener('click', proxyHandler)
    }
  })

  it('ignores clicks without an anchor', () => {
    const { host, router } = setup()
    const button = document.createElement('button')
    document.body.append(button)
    expect(click(button).defaultPrevented).toBe(false)
    expect(host.classifyLink).not.toHaveBeenCalled()
    expect(host.navigate).not.toHaveBeenCalled()
    expect(router.push).not.toHaveBeenCalled()
  })

  it('removes the document listener on unmount', () => {
    const { host, router, wrapper } = setup()
    const { label } = anchor()
    wrapper.unmount()
    expect(click(label).defaultPrevented).toBe(false)
    expect(host.classifyLink).not.toHaveBeenCalled()
    expect(host.navigate).not.toHaveBeenCalled()
    expect(router.push).not.toHaveBeenCalled()
  })
})

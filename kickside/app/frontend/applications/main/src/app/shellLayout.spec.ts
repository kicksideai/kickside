import { describe, expect, it } from 'vitest'
import { defineComponent } from 'vue'
import { buildShellLayout } from './shellLayout'

const Target = defineComponent({ render: () => null })
const components = { nav: Target, surface: Target, sessions: Target, chat: Target }

describe('app-owned shell layout', () => {
  it('keeps one stable panel registry across ordinary and sessions routes', () => {
    const ordinary = buildShellLayout({ sessionsRoute: false, horizontalNav: false, navCollapsed: false, chatOpen: false }, components)
    const sessions = buildShellLayout({ sessionsRoute: true, horizontalNav: false, navCollapsed: false, chatOpen: true }, components)

    expect(Object.keys(ordinary.panels)).toEqual(['nav', 'surface', 'sessions', 'chat'])
    expect(Object.keys(sessions.panels)).toEqual(Object.keys(ordinary.panels))
    expect(JSON.stringify(ordinary.layouts.lg)).toContain('surface')
    expect(JSON.stringify(sessions.layouts.lg)).not.toContain('surface')
    expect(JSON.stringify(sessions.layouts.lg)).toContain('sessions')
    expect(JSON.stringify(sessions.layouts.lg)).toContain('chat')
  })

  it('builds the initial sessions declaration with the persisted collapsed rail', () => {
    const initial = buildShellLayout({
      sessionsRoute: true,
      horizontalNav: false,
      navCollapsed: true,
      chatOpen: false,
    }, components)

    expect(JSON.stringify(initial.layouts.lg)).toContain('sessions')
    expect(JSON.stringify(initial.layouts.lg)).not.toContain('"panel":"surface"')
    expect(initial.layouts.lg.children[0]).toMatchObject({ panel: 'nav', size: '64px', fixed: true })
  })

  it('uses drawers for narrow auxiliary panels', () => {
    const ordinary = buildShellLayout({ sessionsRoute: false, horizontalNav: false, navCollapsed: true, chatOpen: true }, components)
    const sessions = buildShellLayout({ sessionsRoute: true, horizontalNav: false, navCollapsed: true, chatOpen: true }, components)

    expect(JSON.stringify(ordinary.layouts.default)).toContain('drawer-right')
    expect(JSON.stringify(ordinary.layouts.default)).toContain('drawer-left')
    expect(JSON.stringify(sessions.layouts.default)).toContain('drawer-left')
  })

  it('keeps desktop chat inline while toggling its collapsed state', () => {
    const closed = buildShellLayout({ sessionsRoute: false, horizontalNav: false, navCollapsed: false, chatOpen: false }, components)
    const open = buildShellLayout({ sessionsRoute: false, horizontalNav: false, navCollapsed: false, chatOpen: true }, components)

    expect(JSON.stringify(closed.layouts.lg)).toContain('"panel":"chat"')
    expect(JSON.stringify(closed.layouts.lg)).toContain('"collapsed":true')
    expect(JSON.stringify(closed.layouts.lg)).toContain('"collapseSize":"0px"')
    expect(JSON.stringify(open.layouts.lg)).not.toContain('drawer-right')
    expect(JSON.stringify(open.layouts.lg)).toContain('"panel":"chat"')
    expect(JSON.stringify(open.layouts.lg)).toContain('"collapsed":false')
  })

  it('keeps mobile drawers mutually exclusive', () => {
    const nav = buildShellLayout({
      sessionsRoute: false,
      horizontalNav: false,
      navCollapsed: true,
      chatOpen: true,
      navOpen: true,
      sessionsOpen: true,
    }, components)
    expect(nav.panels.nav.drawerOpen).toBe(true)
    expect(nav.panels.sessions.drawerOpen).toBe(false)
    expect(nav.panels.chat.drawerOpen).toBe(false)

    const sessions = buildShellLayout({
      sessionsRoute: true,
      horizontalNav: false,
      navCollapsed: true,
      chatOpen: true,
      navOpen: false,
      sessionsOpen: true,
    }, components)
    expect(sessions.panels.nav.drawerOpen).toBe(false)
    expect(sessions.panels.sessions.drawerOpen).toBe(true)
    expect(sessions.panels.chat.drawerOpen).toBe(false)
  })

  it('places horizontal navigation above content', () => {
    const layout = buildShellLayout({ sessionsRoute: false, horizontalNav: true, navCollapsed: false, chatOpen: false }, components)
    expect(layout.layouts.lg.direction).toBe('vertical')
    expect(layout.layouts.lg.children[0]).toMatchObject({ panel: 'nav', size: '56px' })
  })
})

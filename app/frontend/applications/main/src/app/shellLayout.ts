import type { LayoutDeclaration, PanelDef, PanelSlot, PanelTree, SizeValue } from '@wippy-fe/layout'
import type { Component } from 'vue'

export const NAV_TARGET = 'kickside-layout-nav'
export const SURFACE_TARGET = 'kickside-layout-surface'
export const SESSIONS_TARGET = 'kickside-layout-sessions'
export const CHAT_TARGET = 'kickside-layout-chat'

export interface ShellLayoutOptions {
  sessionsRoute: boolean
  horizontalNav: boolean
  navCollapsed: boolean
  navOpen?: boolean
  /** Retained for callers compiled against the former separate Sessions drawer. */
  sessionsOpen?: boolean
}

export interface ShellPanelComponents {
  nav: Component
  surface: Component
  sessions: Component
  chat: Component
}

function inline(panel: string, size: SizeValue, extra: Partial<PanelSlot> = {}): PanelSlot {
  return { panel, size, ...extra }
}

function row(children: PanelTree['children']): PanelTree {
  return { direction: 'horizontal', children }
}

function column(children: PanelTree['children']): PanelTree {
  return { direction: 'vertical', children }
}

function contentTree(opts: ShellLayoutOptions, narrow: boolean): PanelTree {
  if (opts.sessionsRoute) {
    if (narrow) {
      return row([
        inline('sessions', '320px', {
          display: 'drawer-left',
          drawerSize: { width: '320px' },
        }),
        inline('chat', '1fr'),
      ])
    }

    return row([
      inline('sessions', '360px', {
        minSize: '288px',
        maxSize: '432px',
        collapsible: true,
      }),
      inline('chat', '1fr', { minSize: '352px' }),
    ])
  }

  // Off Sessions the chat is the host's `chat` panel, outside this page.
  return row([inline('surface', '1fr', narrow ? {} : { minSize: '320px' })])
}

function withNavigation(opts: ShellLayoutOptions, content: PanelTree, narrow: boolean): PanelTree {
  if (opts.horizontalNav)
    return column([inline('nav', '56px', { fixed: true }), content])

  if (narrow) {
    return row([
      inline('nav', '320px', { display: 'drawer-left', drawerSize: { width: '320px' } }),
      content,
    ])
  }

  return row([
    inline('nav', opts.navCollapsed ? '64px' : '224px', {
      minSize: '64px',
      maxSize: '320px',
      fixed: opts.navCollapsed,
    }),
    content,
  ])
}

export function buildShellLayout(
  opts: ShellLayoutOptions,
  components: ShellPanelComponents,
): LayoutDeclaration {
  const pageTree = (narrow: boolean) => {
    const content = contentTree(opts, narrow)
    return withNavigation(opts, content, narrow)
  }
  const panels: Record<string, PanelDef> = {
    nav: {
      component: components.nav,
      props: { targetId: NAV_TARGET },
      title: 'Navigation',
      drawerOpen: !!opts.navOpen,
    },
    surface: { component: components.surface, props: { targetId: SURFACE_TARGET }, title: 'Content' },
    sessions: {
      component: components.sessions,
      props: { targetId: SESSIONS_TARGET },
      title: 'Sessions',
      drawerOpen: !opts.navOpen && !!opts.sessionsOpen,
    },
    chat: { component: components.chat, props: { targetId: CHAT_TARGET }, title: 'Chat' },
  }

  return {
    breakpoints: { md: 768, lg: 1024 },
    layouts: {
      default: pageTree(true),
      md: pageTree(false),
      lg: pageTree(false),
    },
    panels,
  }
}

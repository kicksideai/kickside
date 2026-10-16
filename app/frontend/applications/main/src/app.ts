import { createPinia } from 'pinia'
import { createApp } from 'vue'
import { PrimeVuePlugin } from '@wippy-fe/theme/primevue-plugin'
import wippy from '@wippy-fe/proxy'

import App from './app/app.vue'
import { APP_TITLE, AXIOS_INSTANCE, HOST_API, WIPPY_INSTANCE } from './constants'
import { createAppRouter, resolveInitialPath } from './router'
import { registerShellIcons, type CustomIcon } from './icons'
import type { WippyConfig } from './types'
import '@wippy-fe/theme/theme-config.css'
import './styles.css'
import './tailwind.css'

interface HostI18nConfig {
  appName?: string
  appTitle?: string
}

type MainAppConfig = WippyConfig & {
  customization?: {
    icons?: Record<string, CustomIcon>
    i18n?: HostI18nConfig
  }
  theming?: {
    host?: {
      i18n?: HostI18nConfig
    }
  }
}

export function createMainApp() {
  // Canonical boot: read host wiring from the synchronous `@wippy-fe/proxy`
  // exports (`wippy` is the default `resolvers` instance) rather than the
  // host-injected `window.$W` async getters. Same underlying objects, no await.
  const config = wippy.config
  const hostApi = wippy.host
  const axios = wippy.api
  const instance = wippy

  // The host context supplies the initial deep link.
  const initialPath = resolveInitialPath(config)
  const cfg = config as MainAppConfig

  registerShellIcons(cfg.customization?.icons)

  // The facade supplies the app title through its host theme.
  const appTitle: string =
    cfg.theming?.host?.i18n?.appName ||
    cfg.theming?.host?.i18n?.appTitle ||
    'KickSide'

  const app = createApp(App)

  app.use(createPinia())
  app.use(PrimeVuePlugin)

  app.provide(HOST_API, hostApi)
  app.provide(AXIOS_INSTANCE, axios)
  app.provide(WIPPY_INSTANCE, instance)
  app.provide(APP_TITLE, appTitle)

  const router = createAppRouter(initialPath)
  app.use(router)

  return app
}

export async function mountApp(elementId: string = '#app') {
  const app = await createMainApp()
  app.mount(elementId)
  return app
}

mountApp()

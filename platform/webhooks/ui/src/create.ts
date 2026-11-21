import { WippyVueElement, define, lazyVueConfig } from '@wippy-fe/webcomponent-vue'
import type { WippyElementConfig, WippyPropsSchema } from '@wippy-fe/webcomponent-vue'
import { PrimeVuePlugin } from '@wippy-fe/theme/primevue-plugin'

import stylesText from './styles.css?inline'
import pkg from '../package.json'
import type { ComponentProps, Events } from './types'



class KicksideWebhookCreateElement extends WippyVueElement<ComponentProps, Events> {
  static get wippyConfig(): WippyElementConfig<ComponentProps> {
    return {
      propsSchema: pkg.wippy.props as WippyPropsSchema,
      hostCssKeys: ['themeConfigUrl', 'primeVueCssUrl'] as const,
      inlineCss: stylesText,
    }
  }

  static get vueConfig() {
    return lazyVueConfig(() => import('./app/WebhookCreate.vue').then(module => ({ rootComponent: module.default, plugins: [PrimeVuePlugin] })), { surface: 'compact', loading: 'Loading webhook form…', failed: 'Could not load the webhook form. Reload the page to try again.', delay: 200, timeout: 30000 })
  }
}

export async function webComponent() {
  return KicksideWebhookCreateElement
}

define(import.meta.url, KicksideWebhookCreateElement)

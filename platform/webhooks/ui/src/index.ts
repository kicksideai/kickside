import { WippyVueElement, define } from '@wippy-fe/webcomponent-vue'
import type { WippyElementConfig, WippyPropsSchema } from '@wippy-fe/webcomponent-vue'
import { PrimeVuePlugin } from '@wippy-fe/theme/primevue-plugin'
import Webhooks from './app/Webhooks.vue'
import stylesText from './styles.css?inline'
import pkg from '../package.json'
import type { ComponentProps, Events } from './types'

class KicksideWebhooksElement extends WippyVueElement<ComponentProps, Events> {
  static get wippyConfig(): WippyElementConfig<ComponentProps> {
    return {
      propsSchema: pkg.wippy.props as WippyPropsSchema,
      hostCssKeys: ['themeConfigUrl', 'primeVueCssUrl'] as const,
      inlineCss: stylesText,
    }
  }

  static get vueConfig() {
    return { rootComponent: Webhooks, plugins: [PrimeVuePlugin] }
  }
}

export async function webComponent() {
  return KicksideWebhooksElement
}

define(import.meta.url, KicksideWebhooksElement)

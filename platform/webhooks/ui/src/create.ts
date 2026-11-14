import { WippyVueElement, define, useEvents } from '@wippy-fe/webcomponent-vue'
import type { WippyElementConfig, WippyPropsSchema } from '@wippy-fe/webcomponent-vue'
import { PrimeVuePlugin } from '@wippy-fe/theme/primevue-plugin'
import { lazyControl } from '@widgets/lazy'
import stylesText from './styles.css?inline'
import pkg from '../package.json'
import type { ComponentProps, Events } from './types'

const Root = lazyControl(
  () => import('./app/WebhookCreate.vue'),
  { loading: 'Loading webhook form…', failed: 'Could not load the webhook form. Reload the page to try again.' },
  useEvents,
)

class KicksideWebhookCreateElement extends WippyVueElement<ComponentProps, Events> {
  static get wippyConfig(): WippyElementConfig<ComponentProps> {
    return {
      propsSchema: pkg.wippy.props as WippyPropsSchema,
      hostCssKeys: ['themeConfigUrl', 'primeVueCssUrl'] as const,
      inlineCss: stylesText,
    }
  }

  static get vueConfig() {
    return { rootComponent: Root, plugins: [PrimeVuePlugin] }
  }
}

export async function webComponent() {
  return KicksideWebhookCreateElement
}

define(import.meta.url, KicksideWebhookCreateElement)

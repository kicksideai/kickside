import { WippyVueElement, define, lazyVueConfig } from '@wippy-fe/webcomponent-vue'
import type { WippyElementConfig, WippyPropsSchema } from '@wippy-fe/webcomponent-vue'
import { PrimeVuePlugin } from '@wippy-fe/theme/primevue-plugin'

import stylesText from './styles.css?inline'



interface Props { config?: unknown; value?: unknown }
interface Events {
  change: { id: string; state?: unknown }
  close: Record<string, never>
  error: { message: string; error: unknown }
}

const PROPS_SCHEMA: WippyPropsSchema = {
  type: 'object',
  properties: {
    config: { type: 'object' },
    value: { type: 'object' },
  },
}

class KicksideChannelResponderManageElement extends WippyVueElement<Props, Events> {
  static get wippyConfig(): WippyElementConfig<Props> {
    return {
      propsSchema: PROPS_SCHEMA,
      hostCssKeys: ['themeConfigUrl', 'primeVueCssUrl'] as const,
      inlineCss: stylesText,
    }
  }

  static get vueConfig() {
    return lazyVueConfig(() => import('./app/ChannelResponderManage.vue').then(module => ({ rootComponent: module.default, plugins: [PrimeVuePlugin] })), { surface: 'compact', loading: 'Loading channel responder settings…', failed: 'Could not load the channel responder settings. Reload the page to try again.', delay: 200, timeout: 30000 })
  }
}

export async function webComponent() {
  return KicksideChannelResponderManageElement
}

define(import.meta.url, KicksideChannelResponderManageElement)

import { WippyVueElement, define } from '@wippy-fe/webcomponent-vue'
import type { WippyElementConfig, WippyPropsSchema } from '@wippy-fe/webcomponent-vue'
import { PrimeVuePlugin } from '@wippy-fe/theme/primevue-plugin'
import ChannelResponderManage from './app/ChannelResponderManage.vue'
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
    return { rootComponent: ChannelResponderManage, plugins: [PrimeVuePlugin] }
  }
}

export async function webComponent() {
  return KicksideChannelResponderManageElement
}

define(import.meta.url, KicksideChannelResponderManageElement)

import { WippyVueElement, define, useEvents } from '@wippy-fe/webcomponent-vue'
import type { WippyElementConfig, WippyPropsSchema } from '@wippy-fe/webcomponent-vue'
import { PrimeVuePlugin } from '@wippy-fe/theme/primevue-plugin'
import { lazyControl } from '@widgets/lazy'
import stylesText from './styles.css?inline'

const ChannelResponderManage = lazyControl(
  () => import('./app/ChannelResponderManage.vue'),
  { loading: 'Loading channel responder settings…', failed: 'Could not load the channel responder settings. Reload the page to try again.' },
  useEvents,
)

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

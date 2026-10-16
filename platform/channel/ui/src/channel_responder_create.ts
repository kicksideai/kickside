import { WippyVueElement, define } from '@wippy-fe/webcomponent-vue'
import type { WippyElementConfig, WippyPropsSchema } from '@wippy-fe/webcomponent-vue'
import { PrimeVuePlugin } from '@wippy-fe/theme/primevue-plugin'
import ChannelResponderCreate from './app/ChannelResponderCreate.vue'
import stylesText from './styles.css?inline'

interface Props { 'type-id'?: string; 'parent-id'?: string; 'submit-nonce'?: string }
interface Events {
  'automation-installed': { success: boolean; id?: string; error?: string }
  error: { message: string; error: unknown }
}

// `submit-nonce` is the automation manager's inbound submit command: it bumps this
// observed attribute and the form watches it, instead of reaching into the shadow root.
const PROPS_SCHEMA: WippyPropsSchema = {
  type: 'object',
  properties: { 'type-id': { type: 'string' }, 'parent-id': { type: 'string' }, 'submit-nonce': { type: 'string' } },
}

class KicksideChannelResponderCreateElement extends WippyVueElement<Props, Events> {
  static get wippyConfig(): WippyElementConfig<Props> {
    return {
      propsSchema: PROPS_SCHEMA,
      hostCssKeys: ['themeConfigUrl', 'primeVueCssUrl'] as const,
      inlineCss: stylesText,
    }
  }

  static get vueConfig() {
    return { rootComponent: ChannelResponderCreate, plugins: [PrimeVuePlugin] }
  }
}

export async function webComponent() {
  return KicksideChannelResponderCreateElement
}

define(import.meta.url, KicksideChannelResponderCreateElement)

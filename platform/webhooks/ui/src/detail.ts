import { WippyVueElement, define } from '@wippy-fe/webcomponent-vue'
import type { WippyElementConfig, WippyPropsSchema } from '@wippy-fe/webcomponent-vue'
import WebhookSourceDetail from './app/WebhookSourceDetail.vue'
import stylesText from './styles.css?inline'
import type { ComponentProps, Events } from './types'

// The selected webhook id arrives on `value`/`config` (the WcMount picker-value
// convention: a JSON object string {thread_id} or a bare id).
const PROPS_SCHEMA: WippyPropsSchema = {
  type: 'object',
  properties: {
    value: { type: 'string', default: '', description: 'Selected webhook: a JSON object string {thread_id} or a bare id.' },
    config: { type: 'string', default: '', description: 'Alias of value used by the data-flow config form.' },
  },
}

class KicksideWebhookDetailElement extends WippyVueElement<ComponentProps, Events> {
  static get wippyConfig(): WippyElementConfig<ComponentProps> {
    return {
      propsSchema: PROPS_SCHEMA,
      hostCssKeys: ['themeConfigUrl'] as const,
      inlineCss: stylesText,
    }
  }

  static get vueConfig() {
    return { rootComponent: WebhookSourceDetail }
  }
}

export async function webComponent() {
  return KicksideWebhookDetailElement
}

define(import.meta.url, KicksideWebhookDetailElement)

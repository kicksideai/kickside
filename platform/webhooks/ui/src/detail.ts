import { WippyVueElement, define, useEvents } from '@wippy-fe/webcomponent-vue'
import type { WippyElementConfig, WippyPropsSchema } from '@wippy-fe/webcomponent-vue'
import { lazyControl } from '@widgets/lazy'
import stylesText from './styles.css?inline'
import type { ComponentProps, Events } from './types'

const Root = lazyControl(
  () => import('./app/WebhookSourceDetail.vue'),
  { immediate: true, loading: 'Loading webhook details…', failed: 'Could not load the webhook details. Reload the page to try again.' },
  useEvents,
)

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
    return { rootComponent: Root }
  }
}

export async function webComponent() {
  return KicksideWebhookDetailElement
}

define(import.meta.url, KicksideWebhookDetailElement)

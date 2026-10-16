import { WippyVueElement, define } from '@wippy-fe/webcomponent-vue'
import type { WippyElementConfig, WippyPropsSchema } from '@wippy-fe/webcomponent-vue'
import { PrimeVuePlugin } from '@wippy-fe/theme/primevue-plugin'
import type { ComponentProps } from './types.ts'
import type { Events } from './constants.ts'
import ConnectionPicker from './app/ConnectionPicker.vue'
import stylesText from './styles.css?inline'

const PROPS_SCHEMA: WippyPropsSchema = {
  type: 'object',
  properties: {
    source: { type: 'string', default: '/api/v1/connections', description: 'Endpoint listing connections. Filtered by ?provider= when "providers" is set.' },
    providers: { type: 'string', default: '', description: 'CSV of providers to show (e.g. discord,slack). Empty shows every connection.' },
    provider: { type: 'string', default: '', description: 'Single provider to scope the fetch to (e.g. hubspot); merged with "providers" when both are set.' },
    label: { type: 'string', default: '', description: 'Human noun for this connection field (e.g. "HubSpot connection"), used in the placeholder and when a seeded id cannot be resolved.' },
    'reply-only': { type: 'string', default: 'true', description: 'When "true", lists only connections that expose channels (reply_provider). Set "false" to list every connection.' },
    value: { type: 'string', default: '', description: 'Current selection: a JSON object string {connection_id} or empty.' },
    config: { type: 'string', default: '', description: 'Alias of value: a JSON object string {connection_id}. Used by the poller config form.' },
    placeholder: { type: 'string', default: 'Select a connection…', description: 'Text shown when nothing is selected.' },
  },
}

class KicksideConnectionPickerElement extends WippyVueElement<ComponentProps, Events> {
  static get wippyConfig(): WippyElementConfig<ComponentProps> {
    return {
      propsSchema: PROPS_SCHEMA,
      hostCssKeys: ['themeConfigUrl', 'primeVueCssUrl'] as const,
      inlineCss: stylesText,
    }
  }

  static get vueConfig() {
    return { rootComponent: ConnectionPicker, plugins: [PrimeVuePlugin] }
  }
}

export async function webComponent() {
  return KicksideConnectionPickerElement
}

define(import.meta.url, KicksideConnectionPickerElement)

import { WippyVueElement, define } from '@wippy-fe/webcomponent-vue'
import type { WippyElementConfig, WippyPropsSchema } from '@wippy-fe/webcomponent-vue'
import type { ComponentProps } from './types.ts'
import type { Events } from './constants.ts'
import ChannelPicker from './app/ChannelPicker.vue'
import stylesText from './styles.css?inline'

const PROPS_SCHEMA: WippyPropsSchema = {
  type: 'object',
  properties: {
    'connections-source': { type: 'string', default: '/api/v1/connections', description: "Endpoint listing connections (the tree roots). Filtered by ?provider= when 'providers' is set." },
    'discover-path': { type: 'string', default: '/api/v1/connections/{id}/discover_resources', description: "POST endpoint template for a connection's resources. {id} is replaced by the connection component id; the request body carries drill-down args." },
    providers: { type: 'string', default: '', description: 'CSV of providers to show as roots (e.g. discord,slack). Empty shows every connection.' },
    'child-arg': { type: 'string', default: 'parent_id', description: "discover_resources arg key used to drill into a container node (the parent's id)." },
    value: { type: 'string', default: '', description: 'Pre-selected channel: a JSON object string {connection_id, channel_id} or empty.' },
    placeholder: { type: 'string', default: 'Select a channel…', description: 'Text shown when nothing is selected.' },
  },
}

class KicksideChannelPickerElement extends WippyVueElement<ComponentProps, Events> {
  static get wippyConfig(): WippyElementConfig<ComponentProps> {
    return {
      propsSchema: PROPS_SCHEMA,
      hostCssKeys: ['themeConfigUrl'] as const,
      inlineCss: stylesText,
    }
  }

  static get vueConfig() {
    return { rootComponent: ChannelPicker }
  }
}

export async function webComponent() {
  return KicksideChannelPickerElement
}

define(import.meta.url, KicksideChannelPickerElement)

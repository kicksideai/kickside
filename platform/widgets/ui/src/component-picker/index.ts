import { WippyVueElement, define } from '@wippy-fe/webcomponent-vue'
import type { WippyElementConfig, WippyPropsSchema } from '@wippy-fe/webcomponent-vue'
import type { ComponentProps } from './types.ts'
import type { Events } from './constants.ts'
import ComponentPicker from './app/ComponentPicker.vue'
import stylesText from './styles.css?inline'

const PROPS_SCHEMA: WippyPropsSchema = {
  type: 'object',
  properties: {
    source: { type: 'string', description: 'Endpoint listing the picker catalog. When absent, the field schema\'s declared source wins, then the thread endpoint default.' },
    schema: { type: 'string', default: '', description: 'Field schema. Its primary field may declare source to select a non-thread picker catalog.' },
    'thread-class': { type: 'string', default: '', description: 'The component class to scope the instance list to (meta.thread_class).' },
    meta: { type: 'string', default: '', description: 'JSON object {type:"thread", thread_class}. Supplies thread_class when set; the poller mount passes it.' },
    value: { type: 'string', default: '', description: 'Current selection: a JSON object string {thread_id} or empty.' },
    config: { type: 'string', default: '', description: 'Alias of value: a JSON object string {thread_id}. Used by the poller config form.' },
    placeholder: { type: 'string', default: '', description: 'Text shown when nothing is selected. Empty lets the field title drive the prompt ("Select a <noun>…"), falling back to a neutral "Select…".' },
    'delete-endpoint': { type: 'string', default: '', description: 'Base endpoint enabling per-row deletion (DELETE <endpoint>/<id>). Empty disables it. Also read from meta.delete_endpoint.' },
  },
}

class KicksideComponentPickerElement extends WippyVueElement<ComponentProps, Events> {
  static get wippyConfig(): WippyElementConfig<ComponentProps> {
    return {
      propsSchema: PROPS_SCHEMA,
      hostCssKeys: ['themeConfigUrl'] as const,
      inlineCss: stylesText,
    }
  }

  static get vueConfig() {
    return { rootComponent: ComponentPicker }
  }
}

export async function webComponent() {
  return KicksideComponentPickerElement
}

define(import.meta.url, KicksideComponentPickerElement)

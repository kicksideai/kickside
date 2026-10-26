import { WippyVueElement, define } from '@wippy-fe/webcomponent-vue'
import type { WippyElementConfig, WippyPropsSchema } from '@wippy-fe/webcomponent-vue'
import KbPicker from './app/kb-picker.vue'
import stylesText from './picker.css?inline'

// The reusable Knowledge config component. Trait contexts use `config.kb_ids`;
// a host that passes a schema declaring `kb_id` receives and reports one sink
// destination id instead. The schema controls that durable key.
interface PickerProps {
  config?: { kb_id?: string; kb_ids?: string[] }
  schema?: { properties?: Record<string, unknown> }
}
interface PickerEvents {
  'config-changed': { kb_id: string } | { kb_ids: string[] }
  load: undefined
  error: { message: string; error: unknown }
}

const PROPS_SCHEMA = {
  type: 'object',
  properties: {
    config: { type: 'object', description: 'Trait context { kb_ids: string[] } or sink configuration { kb_id: string }.' },
    schema: { type: 'object', description: 'Optional declared field schema; a kb_id field selects one destination knowledge base.' },
  },
} as unknown as WippyPropsSchema

class KbPickerElement extends WippyVueElement<PickerProps, PickerEvents> {
  static get wippyConfig(): WippyElementConfig<PickerProps> {
    return {
      propsSchema: PROPS_SCHEMA,
      hostCssKeys: ['themeConfigUrl'] as const,
      inlineCss: stylesText,
    }
  }

  static get vueConfig() {
    return { rootComponent: KbPicker }
  }
}

export async function webComponent() {
  return KbPickerElement
}

define(import.meta.url, KbPickerElement)

import { WippyVueElement, define } from '@wippy-fe/webcomponent-vue'
import type { WippyElementConfig, WippyPropsSchema } from '@wippy-fe/webcomponent-vue'
import KbPicker from './app/kb-picker.vue'
import stylesText from './picker.css?inline'

// The Knowledge trait config component (wc-kb-picker). A separate element from
// the knowledge surface, built as its own bundle (picker.js) and registered as
// its own view.component. Receives the trait context as the `config` prop and
// reports the chosen knowledge bases via the `config-changed` event — the generic
// trait config contract the agent editor consumes. Used by the kb_reader and
// kb_writer traits, whose tools read context.kb_ids.
interface PickerProps { config?: { kb_ids?: string[] } }
interface PickerEvents {
  'config-changed': { kb_ids: string[] }
  load: undefined
  error: { message: string; error: unknown }
}

const PROPS_SCHEMA = {
  type: 'object',
  properties: {
    config: { type: 'object', description: 'Capability context: { kb_ids: string[] }' },
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

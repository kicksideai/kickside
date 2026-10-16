import { WippyVueElement, define } from '@wippy-fe/webcomponent-vue'
import type { WippyElementConfig, WippyPropsSchema } from '@wippy-fe/webcomponent-vue'
import { PrimeVuePlugin } from '@wippy-fe/theme/primevue-plugin'
import AgentPicker from './app/AgentPicker.vue'
import stylesText from './styles.css?inline'

interface AgentPickerProps {
  selected?: string | string[]
  multi?: boolean
  placeholder?: string
  value?: string
}

interface AgentPickerEvents {
  change: { selected: string[]; labels?: string[]; agent_id?: string }
}

const PROPS_SCHEMA: WippyPropsSchema = {
  type: 'object',
  properties: {
    selected: { type: 'array', items: { type: 'string' }, default: [] },
    multi: { type: 'boolean', default: true },
    placeholder: { type: 'string' },
    // Config-host convention (WcMount): the current config as a JSON object string
    // whose agent_id names the selection, or a bare agent ref. Presence switches the
    // picker to single-select and adds agent_id to the change detail.
    value: { type: 'string', default: '' },
  },
}

class KicksideAgentPickerElement extends WippyVueElement<AgentPickerProps, AgentPickerEvents> {
  static get wippyConfig(): WippyElementConfig<AgentPickerProps> {
    return {
      propsSchema: PROPS_SCHEMA,
      hostCssKeys: ['themeConfigUrl', 'primeVueCssUrl'] as const,
      inlineCss: stylesText,
    }
  }

  static get vueConfig() {
    return { rootComponent: AgentPicker, plugins: [PrimeVuePlugin] }
  }
}

export async function webComponent() {
  return KicksideAgentPickerElement
}

define(import.meta.url, KicksideAgentPickerElement)

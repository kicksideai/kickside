import { WippyVueElement, define, useEvents } from '@wippy-fe/webcomponent-vue'
import type { WippyElementConfig, WippyPropsSchema } from '@wippy-fe/webcomponent-vue'
import { PrimeVuePlugin } from '@wippy-fe/theme/primevue-plugin'
import { lazyControl } from '@widgets/lazy'
import stylesText from './styles.css?inline'

interface AgentPickerProps {
  selected?: string | string[]
  multi?: boolean
  placeholder?: string
  config?: string
  schema?: string
}

interface AgentPickerEvents {
  change: { selected: string[]; labels?: string[] } | Record<string, string>
}

const PROPS_SCHEMA: WippyPropsSchema = {
  type: 'object',
  properties: {
    selected: { type: 'array', items: { type: 'string' }, default: [] },
    multi: { type: 'boolean', default: true },
    placeholder: { type: 'string' },
    config: { type: 'string', default: '' },
    schema: { type: 'string', default: '' },
  },
}

const AgentPicker = lazyControl(
  () => import('./app/AgentPicker.vue'),
  { loading: 'Loading agent picker…', failed: 'Could not load the agent picker. Reload the page to try again.', iconOnly: true },
  useEvents,
)

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

import { WippyVueElement, define } from '@wippy-fe/webcomponent-vue'
import type { WippyElementConfig, WippyPropsSchema } from '@wippy-fe/webcomponent-vue'
import { PrimeVuePlugin } from '@wippy-fe/theme/primevue-plugin'
import AgentEdit from './app/AgentEdit.vue'
import stylesText from './styles.css?inline'

interface AgentEditProps {
  route?: string
  'parent-id'?: string
  'component-id'?: string
  'entry-id'?: string
  mode?: string
}

const PROPS_SCHEMA: WippyPropsSchema = {
  type: 'object',
  properties: {
    route: { type: 'string' },
    'parent-id': { type: 'string' },
    'component-id': { type: 'string' },
    'entry-id': { type: 'string' },
    mode: { type: 'string' },
  },
}

class KicksideAgentEditElement extends WippyVueElement<AgentEditProps> {
  static get wippyConfig(): WippyElementConfig<AgentEditProps> {
    return {
      propsSchema: PROPS_SCHEMA,
      hostCssKeys: ['themeConfigUrl', 'primeVueCssUrl'] as const,
      inlineCss: stylesText,
    }
  }

  static get vueConfig() {
    return { rootComponent: AgentEdit, plugins: [PrimeVuePlugin] }
  }
}

export async function webComponent() {
  return KicksideAgentEditElement
}

define(import.meta.url, KicksideAgentEditElement)

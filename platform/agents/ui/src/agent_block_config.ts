import { WippyVueElement, define } from '@wippy-fe/webcomponent-vue'
import type { WippyElementConfig, WippyPropsSchema } from '@wippy-fe/webcomponent-vue'
import { PrimeVuePlugin } from '@wippy-fe/theme/primevue-plugin'
import AgentBlockConfig from './app/AgentBlockConfig.vue'
import stylesText from './agent-block-config.css?inline'

export interface AgentBlockConfigValue {
  agent_id?: string
  instructions?: string
  name?: string
  model?: string
  tools?: string[]
  exit_schema?: Record<string, unknown>
  tool_calling?: 'auto' | 'any' | 'none'
  context?: Record<string, unknown>
}

interface Props { config?: AgentBlockConfigValue | null }
interface Events { 'config-changed': AgentBlockConfigValue }

const PROPS_SCHEMA: WippyPropsSchema = {
  type: 'object',
  properties: { config: { type: 'object', description: 'Canonical Agent Block instance configuration.' } },
}

class KicksideAgentBlockConfigElement extends WippyVueElement<Props, Events> {
  static get wippyConfig(): WippyElementConfig<Props> {
    return {
      propsSchema: PROPS_SCHEMA,
      hostCssKeys: ['themeConfigUrl', 'primeVueCssUrl'] as const,
      inlineCss: stylesText,
    }
  }
  static get vueConfig() { return { rootComponent: AgentBlockConfig, plugins: [PrimeVuePlugin] } }
}

export async function webComponent() { return KicksideAgentBlockConfigElement }
define(import.meta.url, KicksideAgentBlockConfigElement)

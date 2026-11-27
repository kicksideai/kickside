import { WippyVueElement, define, lazyVueConfig } from '@wippy-fe/webcomponent-vue'
import type { WippyElementConfig, WippyPropsSchema } from '@wippy-fe/webcomponent-vue'
import { PrimeVuePlugin } from '@wippy-fe/theme/primevue-plugin'

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
    return lazyVueConfig(() => import('./app/AgentEdit.vue').then(module => ({ rootComponent: module.default, plugins: [PrimeVuePlugin] })), { surface: 'compact', loading: 'Loading agent editor…', failed: 'Could not load the agent editor. Reload the page to try again.', delay: 200, timeout: 30000 })
  }
}

export async function webComponent() {
  return KicksideAgentEditElement
}

define(import.meta.url, KicksideAgentEditElement)

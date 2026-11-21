import { WippyVueElement, define, lazyVueConfig } from '@wippy-fe/webcomponent-vue'
import type { WippyElementConfig, WippyPropsSchema } from '@wippy-fe/webcomponent-vue'
import { PrimeVuePlugin } from '@wippy-fe/theme/primevue-plugin'

import stylesText from './styles.css?inline'

interface KbCreateProps {
  'parent-id'?: string
}



const PROPS_SCHEMA: WippyPropsSchema = {
  type: 'object',
  properties: {
    'parent-id': { type: 'string' },
  },
}

class KicksideKbCreateElement extends WippyVueElement<KbCreateProps> {
  static get wippyConfig(): WippyElementConfig<KbCreateProps> {
    return {
      propsSchema: PROPS_SCHEMA,
      hostCssKeys: ['themeConfigUrl', 'primeVueCssUrl'] as const,
      inlineCss: stylesText,
    }
  }

  static get vueConfig() {
    return lazyVueConfig(() => import('./app/KbCreate.vue').then(module => ({ rootComponent: module.default, plugins: [PrimeVuePlugin] })), { surface: 'compact', loading: 'Loading the new knowledge base dialog…', failed: 'Could not load the new knowledge base dialog. Reload the page to try again.', delay: 200, timeout: 30000 })
  }
}

export async function webComponent() {
  return KicksideKbCreateElement
}

define(import.meta.url, KicksideKbCreateElement)

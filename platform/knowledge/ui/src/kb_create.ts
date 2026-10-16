import { WippyVueElement, define } from '@wippy-fe/webcomponent-vue'
import type { WippyElementConfig, WippyPropsSchema } from '@wippy-fe/webcomponent-vue'
import { PrimeVuePlugin } from '@wippy-fe/theme/primevue-plugin'
import KbCreate from './app/KbCreate.vue'
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
    return { rootComponent: KbCreate, plugins: [PrimeVuePlugin] }
  }
}

export async function webComponent() {
  return KicksideKbCreateElement
}

define(import.meta.url, KicksideKbCreateElement)

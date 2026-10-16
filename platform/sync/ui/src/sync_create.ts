import { WippyVueElement, define } from '@wippy-fe/webcomponent-vue'
import type { WippyElementConfig, WippyPropsSchema } from '@wippy-fe/webcomponent-vue'
import { PrimeVuePlugin } from '@wippy-fe/theme/primevue-plugin'
import SyncCreate from './app/SyncCreate.vue'
import stylesText from './styles.css?inline'

interface SyncCreateProps {
  input?: string
  'type-id'?: string
  'parent-id'?: string
  'submit-nonce'?: string
}

interface SyncCreateEvents {
  'automation-installed': { success: boolean; id?: string; error?: string }
}

const PROPS_SCHEMA: WippyPropsSchema = {
  type: 'object',
  properties: {
    input: { type: 'string' },
    'type-id': { type: 'string' },
    'parent-id': { type: 'string' },
    // The automation manager's inbound submit command: it bumps this observed
    // attribute and the form watches it, instead of reaching into the shadow root.
    'submit-nonce': { type: 'string' },
  },
}

class KicksideSyncCreateElement extends WippyVueElement<SyncCreateProps, SyncCreateEvents> {
  static get wippyConfig(): WippyElementConfig<SyncCreateProps> {
    return {
      propsSchema: PROPS_SCHEMA,
      hostCssKeys: ['themeConfigUrl', 'primeVueCssUrl'] as const,
      inlineCss: stylesText,
    }
  }

  static get vueConfig() {
    return { rootComponent: SyncCreate, plugins: [PrimeVuePlugin] }
  }
}

export async function webComponent() {
  return KicksideSyncCreateElement
}

define(import.meta.url, KicksideSyncCreateElement)

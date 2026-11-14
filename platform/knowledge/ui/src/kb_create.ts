import { WippyVueElement, define, useEvents } from '@wippy-fe/webcomponent-vue'
import type { WippyElementConfig, WippyPropsSchema } from '@wippy-fe/webcomponent-vue'
import { PrimeVuePlugin } from '@wippy-fe/theme/primevue-plugin'
import { lazyControl } from '@widgets/lazy'
import stylesText from './styles.css?inline'

interface KbCreateProps {
  'parent-id'?: string
}

const Root = lazyControl(
  () => import('./app/KbCreate.vue'),
  { loading: 'Loading the new knowledge base dialog…', failed: 'Could not load the new knowledge base dialog. Reload the page to try again.' },
  useEvents,
)

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
    return { rootComponent: Root, plugins: [PrimeVuePlugin] }
  }
}

export async function webComponent() {
  return KicksideKbCreateElement
}

define(import.meta.url, KicksideKbCreateElement)

import { WippyVueElement, define } from '@wippy-fe/webcomponent-vue'
import type { WippyElementConfig, WippyPropsSchema } from '@wippy-fe/webcomponent-vue'
import { PrimeVuePlugin } from '@wippy-fe/theme/primevue-plugin'
import Performance from './app/performance.vue'
import stylesText from './styles.css?inline'

interface PerformanceProps { config?: unknown }
interface PerformanceEvents {
  load: undefined
  error: { message: string, error: unknown }
}

const PROPS_SCHEMA: WippyPropsSchema = { type: 'object', properties: { config: { type: 'object' } } }

class KicksideSettingsPerformanceElement extends WippyVueElement<PerformanceProps, PerformanceEvents> {
  static get wippyConfig(): WippyElementConfig<PerformanceProps> {
    return {
      propsSchema: PROPS_SCHEMA,
      hostCssKeys: ['themeConfigUrl', 'primeVueCssUrl'] as const,
      inlineCss: stylesText,
    }
  }

  static get vueConfig() {
    return { rootComponent: Performance, plugins: [PrimeVuePlugin] }
  }
}

export async function webComponent() {
  return KicksideSettingsPerformanceElement
}

define(import.meta.url, KicksideSettingsPerformanceElement)

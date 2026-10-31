// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
import { WippyVueElement, define } from '@wippy-fe/webcomponent-vue'
import type { WippyElementConfig, WippyPropsSchema } from '@wippy-fe/webcomponent-vue'
import { PrimeVuePlugin } from '@wippy-fe/theme/primevue-plugin'
import Performance from './app/App.vue'
import stylesText from './styles.css?inline'
import pkg from '../package.json'

interface PerformanceProps { config?: unknown }
interface PerformanceEvents {
  load: undefined
  error: { message: string, error: unknown }
}

const PROPS_SCHEMA = pkg.wippy.props as WippyPropsSchema

class KicksideJobsAdminElement extends WippyVueElement<PerformanceProps, PerformanceEvents> {
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
  return KicksideJobsAdminElement
}

define(import.meta.url, KicksideJobsAdminElement)

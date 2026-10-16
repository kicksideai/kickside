import { WippyVueElement, define } from '@wippy-fe/webcomponent-vue'
import type { WippyElementConfig, WippyPropsSchema } from '@wippy-fe/webcomponent-vue'
import { PrimeVuePlugin } from '@wippy-fe/theme/primevue-plugin'
import type { ComponentProps } from './types.ts'
import type { Events } from './constants.ts'
import OnboardRecommendations from './app/OnboardRecommendations.vue'
import stylesText from './styles.css?inline'

class KicksideOnboardModulesElement extends WippyVueElement<ComponentProps, Events> {
  static get wippyConfig(): WippyElementConfig<ComponentProps> {
    return {
      propsSchema: { type: 'object', properties: {} } as WippyPropsSchema,
      hostCssKeys: ['themeConfigUrl', 'primeVueCssUrl'] as const,
      inlineCss: stylesText,
    }
  }

  static get vueConfig() {
    return { rootComponent: OnboardRecommendations, plugins: [PrimeVuePlugin] }
  }
}

export async function webComponent() {
  return KicksideOnboardModulesElement
}

define(import.meta.url, KicksideOnboardModulesElement)

import { WippyVueElement, define } from '@wippy-fe/webcomponent-vue'
import type { WippyElementConfig, WippyPropsSchema } from '@wippy-fe/webcomponent-vue'
import { PrimeVuePlugin } from '@wippy-fe/theme/primevue-plugin'
import type { ComponentProps } from './types.ts'
import type { Events } from './constants.ts'
import Onboard from './app/Onboard.vue'
import stylesText from './styles.css?inline'

// Separate entry point for the onboarding element. The host's loadByTagName loads
// a view.component's entry module and uses its webComponent() export as the root,
// so the onboarding tag must ship its own module returning the onboarding root --
// it cannot share index.js (whose webComponent() is the full Models surface).
class KicksideOnboardModelsElement extends WippyVueElement<ComponentProps, Events> {
  static get wippyConfig(): WippyElementConfig<ComponentProps> {
    return {
      propsSchema: { type: 'object', properties: {} } as WippyPropsSchema,
      hostCssKeys: ['themeConfigUrl', 'primeVueCssUrl', 'iframeCssUrl'] as const,
      inlineCss: stylesText,
    }
  }

  static get vueConfig() {
    return { rootComponent: Onboard, plugins: [PrimeVuePlugin] }
  }
}

export async function webComponent() {
  return KicksideOnboardModelsElement
}

define(import.meta.url, KicksideOnboardModelsElement)

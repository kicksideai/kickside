import { WippyVueElement, define, useEvents } from '@wippy-fe/webcomponent-vue'
import type { WippyElementConfig, WippyPropsSchema } from '@wippy-fe/webcomponent-vue'
import { PrimeVuePlugin } from '@wippy-fe/theme/primevue-plugin'
import { lazyControl } from '@widgets/lazy'
import type { ComponentProps } from './types.ts'
import type { Events } from './constants.ts'
import stylesText from './styles.css?inline'

const OnboardRecommendations = lazyControl(
  () => import('./app/OnboardRecommendations.vue'),
  { loading: 'Loading module recommendations…', failed: 'Could not load module recommendations. Reload the page to try again.' },
  useEvents,
)

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

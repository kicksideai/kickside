import { WippyVueElement, define, useEvents } from '@wippy-fe/webcomponent-vue'
import type { WippyElementConfig, WippyPropsSchema } from '@wippy-fe/webcomponent-vue'
import { PrimeVuePlugin } from '@wippy-fe/theme/primevue-plugin'
import { lazyControl } from '@widgets/lazy'
import type { ComponentProps } from './types.ts'
import type { Events } from './constants.ts'
import stylesText from './styles.css?inline'

const Onboard = lazyControl(
  () => import('./app/Onboard.vue'),
  { loading: 'Loading services…', failed: 'Could not load the connections step. Reload the page to try again.' },
  useEvents,
)

// Separate entry for the onboarding element. The host's loadByTagName loads a
// view.component's entry module and uses its webComponent() export as the root,
// so the onboarding tag ships its own module returning the onboarding root rather
// than sharing index.js (whose root is the full Connections surface).
class KicksideOnboardConnectionsElement extends WippyVueElement<ComponentProps, Events> {
  static get wippyConfig(): WippyElementConfig<ComponentProps> {
    return {
      propsSchema: { type: 'object', properties: {} } as WippyPropsSchema,
      hostCssKeys: ['themeConfigUrl', 'iframeCssUrl', 'primeVueCssUrl'] as const,
      inlineCss: stylesText,
    }
  }

  static get vueConfig() {
    return { rootComponent: Onboard, plugins: [PrimeVuePlugin] }
  }
}

export async function webComponent() {
  return KicksideOnboardConnectionsElement
}

define(import.meta.url, KicksideOnboardConnectionsElement)

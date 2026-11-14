import { WippyVueElement, define, useEvents } from '@wippy-fe/webcomponent-vue'
import type { WippyElementConfig, WippyPropsSchema } from '@wippy-fe/webcomponent-vue'
import { PrimeVuePlugin } from '@wippy-fe/theme/primevue-plugin'
import { lazyControl } from '@widgets/lazy'
import type { ComponentProps } from './types.ts'
import type { Events } from './constants.ts'
import stylesText from './styles.css?inline'
import pkg from '../package.json'

const Assist = lazyControl(
  () => import('./app/assist.vue'),
  {
    loading: 'Loading the transform assistant…',
    failed: 'Could not load the transform assistant. Reload the page to try again.',
  },
  useEvents,
)

class KicksideTransformAssistElement extends WippyVueElement<ComponentProps, Events> {
  static get wippyConfig(): WippyElementConfig<ComponentProps> {
    return {
      propsSchema: pkg.wippy.props as WippyPropsSchema,
      hostCssKeys: ['themeConfigUrl', 'primeVueCssUrl'] as const,
      inlineCss: stylesText,
    }
  }

  static get vueConfig() {
    return { rootComponent: Assist, plugins: [PrimeVuePlugin] }
  }
}

export async function webComponent() {
  return KicksideTransformAssistElement
}

define(import.meta.url, KicksideTransformAssistElement)

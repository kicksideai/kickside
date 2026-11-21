import { WippyVueElement, define, lazyVueConfig } from '@wippy-fe/webcomponent-vue'
import type { WippyElementConfig, WippyPropsSchema } from '@wippy-fe/webcomponent-vue'
import { PrimeVuePlugin } from '@wippy-fe/theme/primevue-plugin'

import type { ComponentProps } from './types.ts'
import type { Events } from './constants.ts'
import stylesText from './styles.css?inline'
import pkg from '../package.json'



class KicksideTransformAssistElement extends WippyVueElement<ComponentProps, Events> {
  static get wippyConfig(): WippyElementConfig<ComponentProps> {
    return {
      propsSchema: pkg.wippy.props as WippyPropsSchema,
      hostCssKeys: ['themeConfigUrl', 'primeVueCssUrl'] as const,
      inlineCss: stylesText,
    }
  }

  static get vueConfig() {
    return lazyVueConfig(() => import('./app/assist.vue').then(module => ({ rootComponent: module.default, plugins: [PrimeVuePlugin] })), { surface: 'compact', loading: 'Loading the transform assistant…', failed: 'Could not load the transform assistant. Reload the page to try again.', delay: 200, timeout: 30000 })
  }
}

export async function webComponent() {
  return KicksideTransformAssistElement
}

define(import.meta.url, KicksideTransformAssistElement)

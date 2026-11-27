import { WippyVueElement, define, lazyVueConfig } from '@wippy-fe/webcomponent-vue'
import type { WippyElementConfig, WippyPropsSchema } from '@wippy-fe/webcomponent-vue'
import type { ComponentProps } from './types.ts'
import type { Events } from './constants.ts'

import stylesText from './styles.css?inline'
import pkg from '../package.json'



class KicksideIconPickerElement extends WippyVueElement<ComponentProps, Events> {
  static get wippyConfig(): WippyElementConfig<ComponentProps> {
    return {
      propsSchema: pkg.wippy.props as WippyPropsSchema,
      hostCssKeys: ['themeConfigUrl'] as const,
      inlineCss: stylesText,
    }
  }

  static get vueConfig() {
    return lazyVueConfig(() => import('./app/IconPicker.vue').then(module => ({ rootComponent: module.default })), { surface: 'compact', loading: 'Loading icon picker…', failed: 'Could not load the icon picker. Reload the page to try again.', iconOnly: true, delay: 200, timeout: 30000 })
  }
}

export async function webComponent() {
  return KicksideIconPickerElement
}

define(import.meta.url, KicksideIconPickerElement)

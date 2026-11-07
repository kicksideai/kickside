import { WippyVueElement, define, useEvents } from '@wippy-fe/webcomponent-vue'
import type { WippyElementConfig, WippyPropsSchema } from '@wippy-fe/webcomponent-vue'
import type { ComponentProps } from './types.ts'
import type { Events } from './constants.ts'
import { lazyControl } from './lazy'
import stylesText from './styles.css?inline'
import pkg from '../package.json'

const IconPicker = lazyControl(
  () => import('./app/IconPicker.vue'),
  {
    loading: 'Loading icon picker…',
    failed: 'Could not load the icon picker. Reload the page to try again.',
    iconOnly: true,
  },
  useEvents,
)

class KicksideIconPickerElement extends WippyVueElement<ComponentProps, Events> {
  static get wippyConfig(): WippyElementConfig<ComponentProps> {
    return {
      propsSchema: pkg.wippy.props as WippyPropsSchema,
      hostCssKeys: ['themeConfigUrl'] as const,
      inlineCss: stylesText,
    }
  }

  static get vueConfig() {
    return { rootComponent: IconPicker }
  }
}

export async function webComponent() {
  return KicksideIconPickerElement
}

define(import.meta.url, KicksideIconPickerElement)

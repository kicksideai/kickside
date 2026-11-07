import { WippyVueElement, define, useEvents } from '@wippy-fe/webcomponent-vue'
import type { WippyElementConfig, WippyPropsSchema } from '@wippy-fe/webcomponent-vue'
import type { ComponentProps } from './types.ts'
import type { Events } from './constants.ts'
import { lazyPage } from '@widgets/lazy'
import stylesText from './styles.css?inline'
import pkg from '../package.json'

class KicksideSettingsElement extends WippyVueElement<ComponentProps, Events> {
  static get wippyConfig(): WippyElementConfig<ComponentProps> {
    return {
      propsSchema: pkg.wippy.props as WippyPropsSchema,
      hostCssKeys: ['themeConfigUrl', 'primeVueCssUrl'] as const,
      inlineCss: stylesText,
    }
  }

  static get vueConfig() {
    return {
      lazyConfig: lazyPage(
        () => import('./lazy-mount').then((module) => module.mountConfig),
        'Could not load Settings. Reload the page to try again.',
        useEvents,
      ),
    }
  }
}

export async function webComponent() {
  return KicksideSettingsElement
}

define(import.meta.url, KicksideSettingsElement)

import { WippyVueElement, define, lazyVueConfig } from '@wippy-fe/webcomponent-vue'
import type { WippyElementConfig, WippyPropsSchema } from '@wippy-fe/webcomponent-vue'

import type { ComponentProps } from './types.ts'
import type { Events } from './constants.ts'
import stylesText from './styles.css?inline'
import pkg from '../package.json'

class KicksideInboxElement extends WippyVueElement<ComponentProps, Events> {
  static get wippyConfig(): WippyElementConfig<ComponentProps> {
    return {
      propsSchema: pkg.wippy.props as WippyPropsSchema,
      hostCssKeys: ['themeConfigUrl', 'primeVueCssUrl'] as const,
      inlineCss: stylesText,
    }
  }

  static get vueConfig() {
    return {
      ...lazyVueConfig(() => import('./lazy-mount').then((module) => module.mountConfig), { surface: 'page', loading: 'Loading…', failed: 'Could not load the inbox. Reload the page to try again.', timeout: 30000 }),
    }
  }
}

export async function webComponent() {
  return KicksideInboxElement
}

define(import.meta.url, KicksideInboxElement)

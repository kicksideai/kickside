// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
import { WippyVueElement, define, useEvents } from '@wippy-fe/webcomponent-vue'
import type { WippyElementConfig, WippyPropsSchema } from '@wippy-fe/webcomponent-vue'
import { lazyPage } from '@widgets/lazy'
import type { ComponentProps } from './types.ts'
import type { Events } from './constants.ts'
import stylesText from './styles.css?inline'
import pkg from '../package.json'

class KicksideSessionsElement extends WippyVueElement<ComponentProps, Events> {
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
        () => import('./index-mount').then((module) => module.mountConfig),
        'Could not load the sessions list. Reload the page to try again.',
        useEvents,
      ),
    }
  }
}

export async function webComponent() {
  return KicksideSessionsElement
}

define(import.meta.url, KicksideSessionsElement)

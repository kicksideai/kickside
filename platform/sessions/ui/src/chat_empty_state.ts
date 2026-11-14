// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
import { WippyVueElement, define, useEvents } from '@wippy-fe/webcomponent-vue'
import type { WippyElementConfig, WippyPropsSchema } from '@wippy-fe/webcomponent-vue'
import { lazyPage } from '@widgets/lazy'
import type { Events } from './constants.ts'
import stylesText from './styles.css?inline'

class KicksideChatEmptyStateElement extends WippyVueElement<Record<string, unknown>, Events> {
  static get wippyConfig(): WippyElementConfig<Record<string, unknown>> {
    return {
      propsSchema: { type: 'object', properties: {} } as WippyPropsSchema,
      hostCssKeys: ['themeConfigUrl', 'primeVueCssUrl'] as const,
      inlineCss: stylesText,
    }
  }

  static get vueConfig() {
    return {
      lazyConfig: lazyPage(
        () => import('./chat_empty_state-mount').then((module) => module.mountConfig),
        'Could not load the chat start screen. Reload the page to try again.',
        useEvents,
      ),
    }
  }
}

export async function webComponent() {
  return KicksideChatEmptyStateElement
}

define(import.meta.url, KicksideChatEmptyStateElement)

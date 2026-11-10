// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
import { WippyVueElement, define } from '@wippy-fe/webcomponent-vue'
import type { WippyElementConfig, WippyPropsSchema } from '@wippy-fe/webcomponent-vue'
import type { Events } from './constants.ts'
import ChatCoordinator from './app/ChatCoordinator.vue'

// Eager on purpose: a headless coordinator has no UI to defer and must hear the
// first chat intent.
class KicksideChatCoordinatorElement extends WippyVueElement<Record<string, unknown>, Events> {
  static get wippyConfig(): WippyElementConfig<Record<string, unknown>> {
    return { propsSchema: { type: 'object', properties: {} } as WippyPropsSchema }
  }

  static get vueConfig() {
    return { rootComponent: ChatCoordinator }
  }
}

export async function webComponent() {
  return KicksideChatCoordinatorElement
}

define(import.meta.url, KicksideChatCoordinatorElement)

import { WippyVueElement, define } from '@wippy-fe/webcomponent-vue'
import type { WippyElementConfig, WippyPropsSchema } from '@wippy-fe/webcomponent-vue'
import type { Events } from './constants.ts'
import ArtifactCoordinator from './app/ArtifactCoordinator.vue'

class KicksideArtifactCoordinatorElement extends WippyVueElement<Record<string, unknown>, Events> {
  static get wippyConfig(): WippyElementConfig<Record<string, unknown>> {
    return { propsSchema: { type: 'object', properties: {} } as WippyPropsSchema }
  }

  static get vueConfig() {
    return { rootComponent: ArtifactCoordinator }
  }
}

export async function webComponent() {
  return KicksideArtifactCoordinatorElement
}

define(import.meta.url, KicksideArtifactCoordinatorElement)

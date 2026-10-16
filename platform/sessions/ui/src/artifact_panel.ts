import { WippyVueElement, define } from '@wippy-fe/webcomponent-vue'
import type { WippyElementConfig, WippyPropsSchema } from '@wippy-fe/webcomponent-vue'
import { PrimeVuePlugin } from '@wippy-fe/theme/primevue-plugin'
import type { Events } from './constants.ts'
import ArtifactPanel from './app/ArtifactPanel.vue'
import stylesText from './styles.css?inline'

class KicksideArtifactPanelElement extends WippyVueElement<Record<string, unknown>, Events> {
  static get wippyConfig(): WippyElementConfig<Record<string, unknown>> {
    return {
      propsSchema: { type: 'object', properties: {} } as WippyPropsSchema,
      hostCssKeys: ['themeConfigUrl', 'primeVueCssUrl'] as const,
      inlineCss: stylesText,
    }
  }

  static get vueConfig() {
    return { rootComponent: ArtifactPanel, plugins: [PrimeVuePlugin] }
  }
}

export async function webComponent() {
  return KicksideArtifactPanelElement
}

define(import.meta.url, KicksideArtifactPanelElement)

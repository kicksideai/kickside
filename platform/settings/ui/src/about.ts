import { WippyVueElement, define } from '@wippy-fe/webcomponent-vue'
import type { WippyElementConfig, WippyPropsSchema } from '@wippy-fe/webcomponent-vue'
import About from './app/about.vue'
import stylesText from './styles.css?inline'

class KicksideSettingsAboutElement extends WippyVueElement {
  static get wippyConfig(): WippyElementConfig {
    return {
      propsSchema: { type: 'object', properties: {} } as WippyPropsSchema,
      hostCssKeys: ['themeConfigUrl'] as const,
      inlineCss: stylesText,
    }
  }

  static get vueConfig() {
    return { rootComponent: About }
  }
}

export async function webComponent() {
  return KicksideSettingsAboutElement
}

define(import.meta.url, KicksideSettingsAboutElement)

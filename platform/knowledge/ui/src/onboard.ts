import { WippyVueElement, define } from '@wippy-fe/webcomponent-vue'
import type { WippyElementConfig, WippyPropsSchema } from '@wippy-fe/webcomponent-vue'
import type { ComponentProps } from './types.ts'
import type { Events } from './constants.ts'
import Onboard from './app/Onboard.vue'
import stylesText from './styles.css?inline'

// Separate entry for the onboarding element (kickside-onboard-knowledge). The host
// loads a view.component's entry module and uses its webComponent() export as the
// root, so the onboarding tag ships its own module rather than sharing index.js
// (whose root is the full Knowledge surface).
class KicksideOnboardKnowledgeElement extends WippyVueElement<ComponentProps, Events> {
  static get wippyConfig(): WippyElementConfig<ComponentProps> {
    return {
      propsSchema: { type: 'object', properties: {} } as unknown as WippyPropsSchema,
      hostCssKeys: ['themeConfigUrl', 'iframeCssUrl'] as const,
      inlineCss: stylesText,
    }
  }

  static get vueConfig() {
    return { rootComponent: Onboard }
  }
}

export async function webComponent() {
  return KicksideOnboardKnowledgeElement
}

define(import.meta.url, KicksideOnboardKnowledgeElement)

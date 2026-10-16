import { WippyVueElement, define } from '@wippy-fe/webcomponent-vue'
import type { WippyElementConfig, WippyPropsSchema } from '@wippy-fe/webcomponent-vue'
import { PrimeVuePlugin } from '@wippy-fe/theme/primevue-plugin'
import type { ComponentProps } from './types.ts'
import type { Events } from './constants.ts'
import Skills from './app/skills.vue'
import stylesText from './styles.css?inline'
import pkg from '../package.json'

class KicksideSkillsElement extends WippyVueElement<ComponentProps, Events> {
  static get wippyConfig(): WippyElementConfig<ComponentProps> {
    return {
      propsSchema: pkg.wippy.props as WippyPropsSchema,
      hostCssKeys: ['themeConfigUrl', 'primeVueCssUrl'] as const,
      inlineCss: stylesText,
    }
  }

  static get vueConfig() {
    return { rootComponent: Skills, plugins: [PrimeVuePlugin] }
  }
}

export async function webComponent() {
  return KicksideSkillsElement
}

define(import.meta.url, KicksideSkillsElement)

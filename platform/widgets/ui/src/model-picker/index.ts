import { WippyVueElement, define } from '@wippy-fe/webcomponent-vue'
import type { WippyElementConfig, WippyPropsSchema } from '@wippy-fe/webcomponent-vue'
import { PrimeVuePlugin } from '@wippy-fe/theme/primevue-plugin'
import type { ComponentProps } from './types.ts'
import type { Events } from './constants.ts'
import ModelPicker from './app/ModelPicker.vue'
import stylesText from './styles.css?inline'

const PROPS_SCHEMA: WippyPropsSchema = {
  type: 'object',
  properties: {
    value: { type: 'string', default: '', description: 'Currently selected model name, or a "class:<name>" reference (e.g. class:fast).' },
    capability: { type: 'string', default: 'generate', description: 'Which models to list: "generate" (default — chat/tool-use + class shortcuts) or "embed" (embedding models, no classes).' },
    mode: { type: 'string', default: '', description: '"classes" restricts the panel to model classes (portable "class:<name>" refs); empty lists classes and concrete models.' },
  },
}

class KicksideModelPickerElement extends WippyVueElement<ComponentProps, Events> {
  static get wippyConfig(): WippyElementConfig<ComponentProps> {
    return {
      propsSchema: PROPS_SCHEMA,
      hostCssKeys: ['themeConfigUrl', 'primeVueCssUrl'] as const,
      inlineCss: stylesText,
    }
  }

  static get vueConfig() {
    return { rootComponent: ModelPicker, plugins: [PrimeVuePlugin] }
  }
}

export async function webComponent() {
  return KicksideModelPickerElement
}

define(import.meta.url, KicksideModelPickerElement)

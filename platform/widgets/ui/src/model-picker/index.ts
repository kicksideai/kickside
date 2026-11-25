import { WippyVueElement, define, lazyVueConfig } from '@wippy-fe/webcomponent-vue'
import type { WippyElementConfig, WippyPropsSchema } from '@wippy-fe/webcomponent-vue'
import { PrimeVuePlugin } from '@wippy-fe/theme/primevue-plugin'
import type { ComponentProps } from './types.ts'
import type { Events } from './constants.ts'

import stylesText from './styles.css?inline'

const PROPS_SCHEMA: WippyPropsSchema = {
  type: 'object',
  properties: {
    label: { type: 'string', default: '', description: 'Accessible name supplied by the containing form.' },
    description: { type: 'string', default: '', description: 'Accessible help supplied by the containing form.' },
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
    return lazyVueConfig(() => import('./app/ModelPicker.vue').then(module => ({ rootComponent: module.default, plugins: [PrimeVuePlugin] })), { surface: 'compact', loading: 'Loading model picker…', failed: 'Could not load the model picker. Reload the page to try again.', iconOnly: true, delay: 200, timeout: 30000 })
  }
}

export async function webComponent() {
  return KicksideModelPickerElement
}

define(import.meta.url, KicksideModelPickerElement)

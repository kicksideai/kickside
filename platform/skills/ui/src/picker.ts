import { WippyVueElement, define, lazyVueConfig } from '@wippy-fe/webcomponent-vue'
import type { WippyElementConfig, WippyPropsSchema } from '@wippy-fe/webcomponent-vue'

import type { PickerProps, PickerEvents } from './picker-types.ts'
import stylesText from './picker.css?inline'



// The Skills trait config component (kickside-skill-picker). A separate element
// from the skills surface, built as its own bundle (picker.js) and registered as
// its own view.component. Receives the trait context as the `config` prop and
// reports the chosen skills via the `config-changed` event — the generic trait
// config contract the agent editor consumes.

const PROPS_SCHEMA = {
  type: 'object',
  properties: {
    config: { type: 'object', description: 'Capability context: { skill_ids: string[] }' },
  },
} as unknown as WippyPropsSchema

class KicksideSkillPickerElement extends WippyVueElement<PickerProps, PickerEvents> {
  static get wippyConfig(): WippyElementConfig<PickerProps> {
    return {
      propsSchema: PROPS_SCHEMA,
      hostCssKeys: ['themeConfigUrl'] as const,
      inlineCss: stylesText,
    }
  }

  static get vueConfig() {
    return lazyVueConfig(() => import('./app/skill-picker.vue').then(module => ({ rootComponent: module.default })), { surface: 'compact', loading: 'Loading skill picker…', failed: 'Could not load the skill picker. Reload the page to try again.', delay: 200, timeout: 30000 })
  }
}

export async function webComponent() {
  return KicksideSkillPickerElement
}

define(import.meta.url, KicksideSkillPickerElement)

import { WippyVueElement, define, useEvents } from '@wippy-fe/webcomponent-vue'
import type { WippyElementConfig, WippyPropsSchema } from '@wippy-fe/webcomponent-vue'
import { lazyControl } from '@widgets/lazy'
import type { PickerProps, PickerEvents } from './picker-types.ts'
import stylesText from './picker.css?inline'

const Root = lazyControl(
  () => import('./app/skill-picker.vue'),
  { loading: 'Loading skill picker…', failed: 'Could not load the skill picker. Reload the page to try again.' },
  useEvents,
)

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
    return { rootComponent: Root }
  }
}

export async function webComponent() {
  return KicksideSkillPickerElement
}

define(import.meta.url, KicksideSkillPickerElement)

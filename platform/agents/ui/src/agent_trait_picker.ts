import { WippyVueElement, define, lazyVueConfig } from '@wippy-fe/webcomponent-vue'
import type { WippyElementConfig, WippyPropsSchema } from '@wippy-fe/webcomponent-vue'
import { PrimeVuePlugin } from '@wippy-fe/theme/primevue-plugin'

import stylesText from './trait-picker.css?inline'

interface AgentTraitPickerProps { value?: string; refreshKey?: number; keepMenuOpenOnAdd?: boolean }
interface AgentTraitPickerEvents {
  change: { traits: string[]; trait_contexts: Record<string, unknown> }
}

const PROPS_SCHEMA: WippyPropsSchema = {
  type: 'object',
  properties: {
    // JSON-encoded { traits: string[], trait_contexts: Record<string, unknown> }.
    value: { type: 'string', default: '{"traits":[],"trait_contexts":{}}' },
    // Increment to reload the public trait catalog without remounting the picker.
    'refresh-key': { type: 'integer', default: 0 },
    // Match consumers whose add flow keeps the filtered menu open after selection.
    'keep-menu-open-on-add': { type: 'boolean', default: false },
  },
}



class KicksideAgentTraitPickerElement extends WippyVueElement<AgentTraitPickerProps, AgentTraitPickerEvents> {
  static get wippyConfig(): WippyElementConfig<AgentTraitPickerProps> {
    return {
      propsSchema: PROPS_SCHEMA,
      hostCssKeys: ['themeConfigUrl', 'primeVueCssUrl'] as const,
      inlineCss: stylesText,
    }
  }

  static get vueConfig() {
    return lazyVueConfig(() => import('./app/AgentTraitPicker.vue').then(module => ({ rootComponent: module.default, plugins: [PrimeVuePlugin] })), { surface: 'compact', loading: 'Loading capability picker…', failed: 'Could not load the capability picker. Reload the page to try again.', delay: 200, timeout: 30000 })
  }
}

export async function webComponent() {
  return KicksideAgentTraitPickerElement
}

define(import.meta.url, KicksideAgentTraitPickerElement)

import { WippyVueElement, define, lazyVueConfig } from '@wippy-fe/webcomponent-vue'
import type { WippyElementConfig, WippyPropsSchema } from '@wippy-fe/webcomponent-vue'
import { PrimeVuePlugin } from '@wippy-fe/theme/primevue-plugin'

import stylesText from './styles.css?inline'



interface Config { connection_id?: string }
interface Props { config?: Config | null; provider?: string; label?: string }
interface Events { 'config-changed': Config }

const propsSchema: WippyPropsSchema = {
  type: 'object',
  properties: {
    // config carries { connection_id } as a JSON object; the host parser only
    // needs the top-level type here (WippyPropDefinition has no nested schema).
    config: { type: 'object' },
    provider: { type: 'string' },
    label: { type: 'string' },
  },
}

class ConnectionTraitPickerElement extends WippyVueElement<Props, Events> {
  static get wippyConfig(): WippyElementConfig<Props> {
    return {
      propsSchema,
      hostCssKeys: ['themeConfigUrl', 'primeVueCssUrl'] as const,
      inlineCss: stylesText,
    }
  }

  static get vueConfig() {
    return lazyVueConfig(() => import('./app/ConnectionTraitPicker.vue').then(module => ({ rootComponent: module.default, plugins: [PrimeVuePlugin] })), { surface: 'compact', loading: 'Loading connection picker…', failed: 'Could not load the connection picker. Reload the page to try again.', delay: 200, timeout: 30000 })
  }
}

export async function webComponent() {
  return ConnectionTraitPickerElement
}

define(import.meta.url, ConnectionTraitPickerElement)

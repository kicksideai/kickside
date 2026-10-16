import { WippyVueElement, define } from '@wippy-fe/webcomponent-vue'
import type { WippyElementConfig, WippyPropsSchema } from '@wippy-fe/webcomponent-vue'
import { PrimeVuePlugin } from '@wippy-fe/theme/primevue-plugin'
import MasterNamespacePicker from './app/MasterNamespacePicker.vue'
import stylesText from './styles.css?inline'

// The master capabilities' config component (kickside-master-namespace-picker). Used by
// both Capability Manager and Agent Roster to edit their runtime scope. Receives the
// trait context as the `config` prop and reports the updated context through
// `config-changed` — the generic trait config contract the agent editor consumes.

interface MasterPickerProps {
  config?: { namespaces?: string[]; trait_ids?: string[]; inject_trait_catalog?: boolean } | string[] | null
}

interface MasterPickerEvents {
  'config-changed': { namespaces: string[]; trait_ids: string[]; inject_trait_catalog: boolean }
}

const PROPS_SCHEMA: WippyPropsSchema = {
  type: 'object',
  properties: {
    config: {
      type: 'object',
      description: 'Capability context: { namespaces: string[], trait_ids: string[], inject_trait_catalog: boolean }',
    },
  },
}

class KicksideMasterNamespacePickerElement extends WippyVueElement<MasterPickerProps, MasterPickerEvents> {
  static get wippyConfig(): WippyElementConfig<MasterPickerProps> {
    return {
      propsSchema: PROPS_SCHEMA,
      hostCssKeys: ['themeConfigUrl', 'primeVueCssUrl'] as const,
      inlineCss: stylesText,
    }
  }

  static get vueConfig() {
    return { rootComponent: MasterNamespacePicker, plugins: [PrimeVuePlugin] }
  }
}

export async function webComponent() {
  return KicksideMasterNamespacePickerElement
}

define(import.meta.url, KicksideMasterNamespacePickerElement)

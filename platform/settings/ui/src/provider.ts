import { WippyVueElement, define } from '@wippy-fe/webcomponent-vue'
import type { WippyElementConfig, WippyPropsSchema } from '@wippy-fe/webcomponent-vue'
import { PrimeVuePlugin } from '@wippy-fe/theme/primevue-plugin'
import Provider from './app/provider.vue'
import stylesText from './styles.css?inline'

// kickside-settings-provider — the shared, config-driven provider settings card.
// One element reused by every connection/tool provider block: its block passes a
// `config = { namespace, title?, icon?, help? }` (WcMount forwards it as a JSON
// `config` attribute) and it renders that namespace's declared settings as a
// tidy, purpose-built card. It carries no provider knowledge, so all providers
// share it. A distinct bundle (provider.js) from the Settings shell, mounted by
// each provider's kickside.settings:block via component_tag.
interface ProviderProps { config?: unknown }
interface ProviderEvents {
  load: undefined
  error: { message: string, error: unknown }
}

const PROPS_SCHEMA: WippyPropsSchema = { type: 'object', properties: { config: { type: 'object' } } }

class KicksideSettingsProviderElement extends WippyVueElement<ProviderProps, ProviderEvents> {
  static get wippyConfig(): WippyElementConfig<ProviderProps> {
    return {
      propsSchema: PROPS_SCHEMA,
      hostCssKeys: ['themeConfigUrl', 'primeVueCssUrl'] as const,
      inlineCss: stylesText,
    }
  }

  static get vueConfig() {
    return { rootComponent: Provider, plugins: [PrimeVuePlugin] }
  }
}

export async function webComponent() {
  return KicksideSettingsProviderElement
}

define(import.meta.url, KicksideSettingsProviderElement)

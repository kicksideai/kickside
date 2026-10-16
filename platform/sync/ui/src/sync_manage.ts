import { WippyVueElement, define } from '@wippy-fe/webcomponent-vue'
import type { WippyElementConfig, WippyPropsSchema } from '@wippy-fe/webcomponent-vue'
import { PrimeVuePlugin } from '@wippy-fe/theme/primevue-plugin'
import SyncManage from './app/SyncManage.vue'
import stylesText from './styles.css?inline'

interface SyncManageProps { config?: unknown; value?: unknown }

interface SyncManageEvents {
  change: { id: string }
  close: Record<string, never>
  error: { message: string; error: unknown }
}

const PROPS_SCHEMA: WippyPropsSchema = {
  type: 'object',
  properties: {
    // Config-host convention: { id } names the installed data sync; value is its alias.
    config: { type: 'object' },
    value: { type: 'object' },
  },
}

class KicksideSyncManageElement extends WippyVueElement<SyncManageProps, SyncManageEvents> {
  static get wippyConfig(): WippyElementConfig<SyncManageProps> {
    return {
      propsSchema: PROPS_SCHEMA,
      hostCssKeys: ['themeConfigUrl', 'primeVueCssUrl'] as const,
      inlineCss: stylesText,
    }
  }

  static get vueConfig() {
    return { rootComponent: SyncManage, plugins: [PrimeVuePlugin] }
  }
}

export async function webComponent() {
  return KicksideSyncManageElement
}

define(import.meta.url, KicksideSyncManageElement)

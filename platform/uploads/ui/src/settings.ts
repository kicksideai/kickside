import { WippyVueElement, define } from '@wippy-fe/webcomponent-vue'
import type { WippyElementConfig, WippyPropsSchema } from '@wippy-fe/webcomponent-vue'
import { PrimeVuePlugin } from '@wippy-fe/theme/primevue-plugin'
import Storage from './app/storage-settings.vue'
import stylesText from './settings-styles.css?inline'

// kickside-settings-storage — the consolidated Files & Uploads settings panel.
// A bespoke block editor: it gathers the several upload/document/rasterization
// settings namespaces into one grouped, well-labeled surface, replacing the
// three separate per-namespace blocks with a single coherent one. A distinct
// element from the Settings shell, built as its own bundle (storage.js) and
// mounted by its kickside.settings:block via component_tag.
interface StorageProps {}
interface StorageEvents {
  load: undefined
  error: { message: string, error: unknown }
}

const PROPS_SCHEMA = { type: 'object', properties: {} } as unknown as WippyPropsSchema

class KicksideSettingsStorageElement extends WippyVueElement<StorageProps, StorageEvents> {
  static get wippyConfig(): WippyElementConfig<StorageProps> {
    return {
      propsSchema: PROPS_SCHEMA,
      hostCssKeys: ['themeConfigUrl', 'primeVueCssUrl'] as const,
      inlineCss: stylesText,
    }
  }

  static get vueConfig() {
    return { rootComponent: Storage, plugins: [PrimeVuePlugin] }
  }
}

export async function webComponent() {
  return KicksideSettingsStorageElement
}

define(import.meta.url, KicksideSettingsStorageElement)

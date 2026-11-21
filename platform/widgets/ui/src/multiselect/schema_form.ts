import { WippyVueElement, define, lazyVueConfig } from '@wippy-fe/webcomponent-vue'
import type { WippyElementConfig, WippyPropsSchema } from '@wippy-fe/webcomponent-vue'

import stylesText from './styles.css?inline'



interface SchemaFormProps {
  schema?: unknown
  config?: unknown
}
interface SchemaFormEvents {
  'config-changed': Record<string, unknown>
}

const PROPS_SCHEMA: WippyPropsSchema = {
  type: 'object',
  properties: {
    schema: { type: 'object', description: 'JSON Schema describing the config fields (object or JSON string).' },
    config: { type: 'object', description: 'Current config values.' },
  },
}

class KicksideSchemaFormElement extends WippyVueElement<SchemaFormProps, SchemaFormEvents> {
  static get wippyConfig(): WippyElementConfig<SchemaFormProps> {
    return {
      propsSchema: PROPS_SCHEMA,
      hostCssKeys: ['themeConfigUrl'] as const,
      inlineCss: stylesText,
    }
  }

  static get vueConfig() {
    return lazyVueConfig(() => import('./app/SchemaForm.vue').then(module => ({ rootComponent: module.default })), { surface: 'compact', loading: 'Loading schema form…', failed: 'Could not load the schema form. Reload the page to try again.', delay: 200, timeout: 30000 })
  }
}

export async function webComponent() {
  return KicksideSchemaFormElement
}

define(import.meta.url, KicksideSchemaFormElement)

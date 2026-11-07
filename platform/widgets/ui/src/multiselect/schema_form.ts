import { WippyVueElement, define, useEvents } from '@wippy-fe/webcomponent-vue'
import type { WippyElementConfig, WippyPropsSchema } from '@wippy-fe/webcomponent-vue'
import { lazyControl } from '../lazy'
import stylesText from './styles.css?inline'

const SchemaForm = lazyControl(
  () => import('./app/SchemaForm.vue'),
  { loading: 'Loading schema form…', failed: 'Could not load the schema form. Reload the page to try again.' },
  useEvents,
)

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
    return { rootComponent: SchemaForm }
  }
}

export async function webComponent() {
  return KicksideSchemaFormElement
}

define(import.meta.url, KicksideSchemaFormElement)

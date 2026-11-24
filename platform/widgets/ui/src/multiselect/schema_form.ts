import { WippyVueElement, define, useEvents } from '@wippy-fe/webcomponent-vue'
import type { WippyElementConfig, WippyPropsSchema } from '@wippy-fe/webcomponent-vue'
import { lazyControl } from '../lazy'
import type { SchemaChoice, SchemaFormValidity } from './schema-form-validation'
import stylesText from './styles.css?inline'

const SchemaForm = lazyControl(
  () => import('./app/SchemaForm.vue'),
  { loading: 'Loading schema form…', failed: 'Could not load the schema form. Reload the page to try again.' },
  useEvents,
)

interface SchemaFormProps {
  schema?: unknown
  config?: unknown
  fieldErrors?: Record<string, string>
  allowUnset?: boolean
  choices?: Record<string, SchemaChoice[]>
  disabled?: boolean
}
interface SchemaFormEvents {
  'config-changed': Record<string, unknown>
  'validity-changed': SchemaFormValidity
}

const PROPS_SCHEMA: WippyPropsSchema = {
  type: 'object',
  properties: {
    schema: { type: 'object', description: 'JSON Schema describing the config fields (object or JSON string).' },
    config: { type: 'object', description: 'Current config values.' },
    'field-errors': { type: 'object', description: 'Server validation messages by field key.' },
    'allow-unset': { type: 'boolean', description: 'Allow missing overrides to inherit from the host.' },
    choices: { type: 'object', description: 'Named choice sets of {value, label} that fields select through x-choices.' },
    disabled: { type: 'boolean', description: 'Disable every control.' },
  },
}

class KicksideSchemaFormElement extends WippyVueElement<SchemaFormProps, SchemaFormEvents> {
  reportValidity(): boolean {
    const form = this.shadowRoot?.querySelector('form.sf')
    return form?.dispatchEvent(new Event('schema-form-report', { cancelable: true })) ?? false
  }

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

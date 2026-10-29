import { WippyVueElement, define } from '@wippy-fe/webcomponent-vue'
import type { WippyElementConfig, WippyPropsSchema } from '@wippy-fe/webcomponent-vue'
import { PrimeVuePlugin } from '@wippy-fe/theme/primevue-plugin'
import WorkflowSetup from './app/WorkflowSetup.vue'
import stylesText from './workflow-setup.css?inline'

interface WorkflowSetupProps {
  'parent-id'?: string
  'submit-nonce'?: string
  'source-context'?: string
}

interface WorkflowSetupEvents {
  'submit-state': { saving: boolean }
  created: { id?: string }
}

const PROPS_SCHEMA: WippyPropsSchema = {
  type: 'object',
  properties: {
    'parent-id': { type: 'string' },
    'submit-nonce': { type: 'string' },
    'source-context': { type: 'string' },
  },
}

class KicksideWorkflowSetupElement extends WippyVueElement<WorkflowSetupProps, WorkflowSetupEvents> {
  static get wippyConfig(): WippyElementConfig<WorkflowSetupProps> {
    return {
      propsSchema: PROPS_SCHEMA,
      hostCssKeys: ['themeConfigUrl', 'primeVueCssUrl'] as const,
      inlineCss: stylesText,
    }
  }

  static get vueConfig() {
    return { rootComponent: WorkflowSetup, plugins: [PrimeVuePlugin] }
  }
}

export async function webComponent() {
  return KicksideWorkflowSetupElement
}

define(import.meta.url, KicksideWorkflowSetupElement)

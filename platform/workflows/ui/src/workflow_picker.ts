import { WippyVueElement, define } from '@wippy-fe/webcomponent-vue'
import type { WippyElementConfig, WippyPropsSchema } from '@wippy-fe/webcomponent-vue'
import { PrimeVuePlugin } from '@wippy-fe/theme/primevue-plugin'
import WorkflowPicker from './app/embed/WorkflowPicker.vue'
import pickerCss from '@widgets/app/pickerselect.css?inline'
import stylesText from './workflow-embed.css?inline'

interface Props { config?: string; schema?: string }
interface FlowRef { kind: 'flow'; id: string; version: number }
interface Events { change: Record<string, FlowRef> }

const PROPS_SCHEMA: WippyPropsSchema = {
  type: 'object',
  properties: {
    config: { type: 'string', default: '{}' },
    schema: { type: 'string', default: '' },
  },
}

class WorkflowPickerElement extends WippyVueElement<Props, Events> {
  static get wippyConfig(): WippyElementConfig<Props> {
    return {
      propsSchema: PROPS_SCHEMA,
      hostCssKeys: ['themeConfigUrl', 'markdownCssUrl', 'primeVueCssUrl'] as const,
      inlineCss: [pickerCss, stylesText].join('\n'),
    }
  }
  static get vueConfig() {
    return { rootComponent: WorkflowPicker, plugins: [PrimeVuePlugin] }
  }
}
export async function webComponent() { return WorkflowPickerElement }
define(import.meta.url, WorkflowPickerElement)

import { WippyVueElement, define } from '@wippy-fe/webcomponent-vue'
import type { WippyElementConfig, WippyPropsSchema } from '@wippy-fe/webcomponent-vue'
import { PrimeVuePlugin } from '@wippy-fe/theme/primevue-plugin'
import EmbedWorkflow from './app/embed/EmbedWorkflow.vue'
import pickerCss from '@widgets/app/pickerselect.css?inline'
import stylesText from './workflow-embed.css?inline'

// The embed shares the schema-form and markdown widgets (loaded by tag at runtime) and the
// builder's own --wf token layer. The PickerSelect stylesheet rides in the shadow sheet the
// same way the builder mounts it, since composed widgets may render into this root.
const SHADOW_CSS = [pickerCss, stylesText].join('\n')

interface Props {
  'flow-id'?: string
  input?: string
  mode?: string
  label?: string
}

interface Events {
  // Reserved for hosts that want to observe lifecycle without polling themselves; the embed
  // renders its own status, so this stays optional.
  navigate: { route: string }
}

const PROPS_SCHEMA: WippyPropsSchema = {
  type: 'object',
  properties: {
    'flow-id': { type: 'string' },
    input: { type: 'string' },
    mode: { type: 'string' },
    label: { type: 'string' },
  },
}

class KicksideWorkflowEmbedElement extends WippyVueElement<Props, Events> {
  static get wippyConfig(): WippyElementConfig<Props> {
    return {
      propsSchema: PROPS_SCHEMA,
      hostCssKeys: ['themeConfigUrl', 'markdownCssUrl', 'primeVueCssUrl'] as const,
      inlineCss: SHADOW_CSS,
    }
  }

  static get vueConfig() {
    return { rootComponent: EmbedWorkflow, plugins: [PrimeVuePlugin] }
  }
}

export async function webComponent() {
  return KicksideWorkflowEmbedElement
}

define(import.meta.url, KicksideWorkflowEmbedElement)

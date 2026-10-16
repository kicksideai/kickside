import { WippyVueElement, define } from '@wippy-fe/webcomponent-vue'
import type { WippyElementConfig, WippyPropsSchema } from '@wippy-fe/webcomponent-vue'
import { PrimeVuePlugin } from '@wippy-fe/theme/primevue-plugin'
import ConfirmationService from 'primevue/confirmationservice'
import ToastService from 'primevue/toastservice'
import type { App } from 'vue'
import WorkflowBuilder from './app/WorkflowBuilder.vue'
import vfCore from '@vue-flow/core/dist/style.css?inline'
import vfTheme from '@vue-flow/core/dist/theme-default.css?inline'
import vfControls from '@vue-flow/controls/dist/style.css?inline'
import vfMinimap from '@vue-flow/minimap/dist/style.css?inline'
import vfResizer from '@vue-flow/node-resizer/dist/style.css?inline'
import pickerCss from '@widgets/app/pickerselect.css?inline'
import fieldMapperCss from '@widgets/app/field-mapper.css?inline'
import stylesText from './styles.css?inline'

// VueFlow ships its base CSS as real stylesheets; the shadow root can't see the
// document's, so they are concatenated into the element's own inline sheet (the
// approach proven in chestor/graph). The shared PickerSelect stylesheet rides in the
// same way. --wf styles ride last so they win the cascade.
const SHADOW_CSS = [vfCore, vfTheme, vfControls, vfMinimap, vfResizer, pickerCss, fieldMapperCss, stylesText].join('\n')
const WorkflowPrimeVueServices = {
  install(app: App) {
    app.use(ConfirmationService)
    app.use(ToastService)
  },
}

interface Props {
  route?: string
  mode?: string
}
interface Events {
  navigate: { route: string }
}

const PROPS_SCHEMA: WippyPropsSchema = {
  type: 'object',
  properties: {
    route: { type: 'string' },
    // 'preview' renders the compact glance card the workspace preview panel
    // mounts every renderer with; anything else is the full builder.
    mode: { type: 'string' },
  },
}

class KicksideWorkflowBuilderElement extends WippyVueElement<Props, Events> {
  static get wippyConfig(): WippyElementConfig<Props> {
    return {
      propsSchema: PROPS_SCHEMA,
      hostCssKeys: ['themeConfigUrl', 'iframeCssUrl', 'primeVueCssUrl'] as const,
      inlineCss: SHADOW_CSS,
    }
  }

  static get vueConfig() {
    return { rootComponent: WorkflowBuilder, plugins: [PrimeVuePlugin, WorkflowPrimeVueServices] }
  }
}

export async function webComponent() {
  return KicksideWorkflowBuilderElement
}

define(import.meta.url, KicksideWorkflowBuilderElement)

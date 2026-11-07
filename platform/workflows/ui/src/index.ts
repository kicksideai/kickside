import { WippyVueElement, define, useEvents } from '@wippy-fe/webcomponent-vue'
import type { WippyElementConfig, WippyPropsSchema } from '@wippy-fe/webcomponent-vue'
import { lazyPage } from '@widgets/lazy'
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
    return {
      lazyConfig: lazyPage(
        () => import('./lazy-mount').then((module) => module.mountConfig),
        'Could not load the Workflow builder. Reload the page to try again.',
        useEvents,
      ),
    }
  }
}

export async function webComponent() {
  return KicksideWorkflowBuilderElement
}

define(import.meta.url, KicksideWorkflowBuilderElement)

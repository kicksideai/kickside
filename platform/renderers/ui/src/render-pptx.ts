import { WippyVueElement, define } from '@wippy-fe/webcomponent-vue'
import type { WippyElementConfig, WippyPropsSchema } from '@wippy-fe/webcomponent-vue'
import RenderPptx from './app/RenderPptx.vue'
import stylesText from './styles.css?inline'

// <wc-render-pptx> — isolated PowerPoint viewer (pptx-to-html slide carousel).
const propsSchema = {
  type: 'object',
  properties: {
    'source-url': { type: 'string', default: '', description: 'URL to fetch the .pptx bytes from (auth via proxy).' },
  },
} as const

class RenderPptxElement extends WippyVueElement<{ sourceUrl?: string }> {
  static get wippyConfig(): WippyElementConfig<{ sourceUrl?: string }> {
    return {
      propsSchema: propsSchema as WippyPropsSchema,
      hostCssKeys: ['themeConfigUrl'] as const,
      inlineCss: stylesText,
    }
  }
  static get vueConfig() { return { rootComponent: RenderPptx } }
}

export async function webComponent() { return RenderPptxElement }
define(import.meta.url, RenderPptxElement)

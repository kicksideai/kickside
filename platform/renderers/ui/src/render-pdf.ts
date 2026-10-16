import { WippyVueElement, define } from '@wippy-fe/webcomponent-vue'
import type { WippyElementConfig, WippyPropsSchema } from '@wippy-fe/webcomponent-vue'
import RenderPdf from './app/RenderPdf.vue'
import stylesText from './styles.css?inline'

// <wc-render-pdf> — isolated PDF viewer. pdfjs-dist (the heavy dep) lives in THIS
// bundle only, loaded by tag when a PDF is actually viewed.
const propsSchema = {
  type: 'object',
  properties: {
    'source-url': { type: 'string', default: '', description: 'URL to fetch the PDF bytes from (auth via proxy).' },
  },
} as const

class RenderPdfElement extends WippyVueElement<{ sourceUrl?: string }> {
  static get wippyConfig(): WippyElementConfig<{ sourceUrl?: string }> {
    return {
      propsSchema: propsSchema as WippyPropsSchema,
      hostCssKeys: ['themeConfigUrl'] as const,
      inlineCss: stylesText,
    }
  }
  static get vueConfig() { return { rootComponent: RenderPdf } }
}

export async function webComponent() { return RenderPdfElement }
define(import.meta.url, RenderPdfElement)

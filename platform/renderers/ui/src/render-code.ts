import { WippyVueElement, define } from '@wippy-fe/webcomponent-vue'
import type { WippyElementConfig, WippyPropsSchema } from '@wippy-fe/webcomponent-vue'
import RenderCode from './app/RenderCode.vue'
import stylesText from './styles.css?inline'

// <wc-render-code> — isolated source/data viewer (highlight.js + CSV/TSV table).
type Props = { source?: string; sourceUrl?: string; contentType?: string; filename?: string }

const propsSchema = {
  type: 'object',
  properties: {
    source: { type: 'string', default: '', description: 'Inline source/data text to render.' },
    'source-url': { type: 'string', default: '', description: 'URL to fetch the text from (auth via proxy) when source is empty.' },
    'content-type': { type: 'string', default: '', description: 'MIME type, used to pick the highlight language / table mode.' },
    filename: { type: 'string', default: '', description: 'Filename, used to infer language from the extension.' },
  },
} as const

class RenderCodeElement extends WippyVueElement<Props> {
  static get wippyConfig(): WippyElementConfig<Props> {
    return {
      propsSchema: propsSchema as WippyPropsSchema,
      hostCssKeys: ['themeConfigUrl'] as const,
      inlineCss: stylesText,
    }
  }
  static get vueConfig() { return { rootComponent: RenderCode } }
}

export async function webComponent() { return RenderCodeElement }
define(import.meta.url, RenderCodeElement)

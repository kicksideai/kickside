import { WippyVueElement, define } from '@wippy-fe/webcomponent-vue'
import type { WippyElementConfig, WippyPropsSchema } from '@wippy-fe/webcomponent-vue'
import RenderXlsx from './app/RenderXlsx.vue'
import stylesText from './styles.css?inline'

// <wc-render-xlsx> — isolated spreadsheet viewer (SheetJS sheet-to-html + tabs).
const propsSchema = {
  type: 'object',
  properties: {
    'source-url': { type: 'string', default: '', description: 'URL to fetch the workbook bytes from (auth via proxy).' },
  },
} as const

class RenderXlsxElement extends WippyVueElement<{ sourceUrl?: string }> {
  static get wippyConfig(): WippyElementConfig<{ sourceUrl?: string }> {
    return {
      propsSchema: propsSchema as WippyPropsSchema,
      hostCssKeys: ['themeConfigUrl'] as const,
      inlineCss: stylesText,
    }
  }
  static get vueConfig() { return { rootComponent: RenderXlsx } }
}

export async function webComponent() { return RenderXlsxElement }
define(import.meta.url, RenderXlsxElement)

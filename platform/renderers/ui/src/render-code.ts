// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
import { WippyVueElement, define, lazyVueConfig } from '@wippy-fe/webcomponent-vue'
import type { WippyElementConfig, WippyPropsSchema } from '@wippy-fe/webcomponent-vue'

import stylesText from './styles.css?inline'

// highlight.js is most of this viewer's weight, so the implementation loads on first mount.


// Reserved only while the implementation loads, so a loaded viewer keeps its own size.
const hostCss = ':host > div:empty, :host > div:has(> [data-lazy-state]) { min-height: 96px; }'

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
      inlineCss: `${stylesText}\n${hostCss}`,
    }
  }
  static get vueConfig() { return lazyVueConfig(() => import('./app/RenderCode.vue').then(module => ({ rootComponent: module.default })), { surface: 'compact', loading: 'Loading the code viewer…', failed: 'Could not load the code viewer. Reload the page to try again.', delay: 200, timeout: 30000 }) }
}

export async function webComponent() { return RenderCodeElement }
define(import.meta.url, RenderCodeElement)

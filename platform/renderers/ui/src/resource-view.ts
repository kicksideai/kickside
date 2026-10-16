import { WippyVueElement, define } from '@wippy-fe/webcomponent-vue'
import type { WippyElementConfig, WippyPropsSchema } from '@wippy-fe/webcomponent-vue'
import ResourceView from './app/ResourceView.vue'
import stylesText from './styles.css?inline'

// <wc-resource-view> — the reusable host. Tiny (no heavy deps): given a
// content-type + a source/source-url it loads the matching viewer bundle by tag
// and mounts it. Any component (wiki, uploads, inbox) embeds this one element.
const propsSchema = {
  type: 'object',
  properties: {
    'content-type': { type: 'string', default: '', description: 'MIME type of the resource (e.g. text/markdown, application/pdf, image/png).' },
    source: { type: 'string', default: '', description: 'Inline text source (markdown/plain) when there is no URL.' },
    'source-url': { type: 'string', default: '', description: 'URL to fetch the resource bytes/text from (auth via proxy).' },
    alt: { type: 'string', default: '', description: 'Alt text for image resources.' },
    filename: { type: 'string', default: '', description: 'Original filename, forwarded to viewers that infer type from the extension.' },
  },
} as const

class ResourceViewElement extends WippyVueElement<{ contentType?: string; source?: string; sourceUrl?: string; alt?: string; filename?: string }> {
  static get wippyConfig(): WippyElementConfig<{ contentType?: string; source?: string; sourceUrl?: string; alt?: string; filename?: string }> {
    return {
      propsSchema: propsSchema as WippyPropsSchema,
      hostCssKeys: ['themeConfigUrl'] as const,
      inlineCss: stylesText,
    }
  }
  static get vueConfig() { return { rootComponent: ResourceView } }
}

export async function webComponent() { return ResourceViewElement }
define(import.meta.url, ResourceViewElement)

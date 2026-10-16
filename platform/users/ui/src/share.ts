import { WippyVueElement, define } from '@wippy-fe/webcomponent-vue'
import type { WippyElementConfig, WippyPropsSchema } from '@wippy-fe/webcomponent-vue'
import { PrimeVuePlugin } from '@wippy-fe/theme/primevue-plugin'
import Share from './app/share.vue'
import stylesText from './share.css?inline'

// kickside-share — the reusable share popup. A separate element from the users
// surface, built as its own bundle (share.js) and registered as its own
// view.component. Any resource backed by the component access model mounts it by
// tag and passes its access/share endpoints via the `config` prop:
//   { resource_id, access_url, share_url, title }
// It discovers shareable principals through the directory seam (/principals),
// never the user backend directly.
interface ShareConfig {
  resource_id?: string
  access_url?: string
  share_url?: string
  title?: string
}
interface ShareProps { config?: ShareConfig }
interface ShareEvents {
  changed: { resource_id?: string }
  load: undefined
  error: { message: string; error: unknown }
}

const PROPS_SCHEMA = {
  type: 'object',
  properties: {
    config: {
      type: 'object',
      description: 'Share target: { resource_id, access_url, share_url, title }',
    },
  },
} as unknown as WippyPropsSchema

class KicksideShareElement extends WippyVueElement<ShareProps, ShareEvents> {
  static get wippyConfig(): WippyElementConfig<ShareProps> {
    return {
      propsSchema: PROPS_SCHEMA,
      hostCssKeys: ['themeConfigUrl', 'primeVueCssUrl'] as const,
      inlineCss: stylesText,
    }
  }

  static get vueConfig() {
    return { rootComponent: Share, plugins: [PrimeVuePlugin] }
  }
}

export async function webComponent() {
  return KicksideShareElement
}

define(import.meta.url, KicksideShareElement)

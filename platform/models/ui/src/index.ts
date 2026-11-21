import { WippyVueElement, define, lazyVueConfig } from '@wippy-fe/webcomponent-vue'
import type { WippyElementConfig, WippyPropsSchema } from '@wippy-fe/webcomponent-vue'

import type { ComponentProps, ProviderEditorProps } from './types.ts'
import type { Events, ProviderEditorEvents } from './constants.ts'
import { EDITOR_TAGS } from './providerTags.ts'
import stylesText from './styles.css?inline'
import pkg from '../package.json'

class KicksideModelsElement extends WippyVueElement<ComponentProps, Events> {
  static get wippyConfig(): WippyElementConfig<ComponentProps> {
    return {
      propsSchema: pkg.wippy.props as WippyPropsSchema,
      hostCssKeys: ['themeConfigUrl', 'primeVueCssUrl'] as const,
      inlineCss: stylesText,
    }
  }

  static get vueConfig() {
    return {
      ...lazyVueConfig(() => import('./lazy-mount').then((module) => module.mountConfig), { surface: 'page', loading: 'Loading…', failed: 'Could not load Models. Reload the page to try again.', timeout: 30000 }),
    }
  }
}

const providerEditorProps = {
  type: 'object',
  properties: {
    mode: { type: 'string' },
    adapter: { type: 'object' },
    preset: { type: 'object' },
    profile: { type: 'object' },
    saving: { type: 'boolean' },
  },
}

function makeEditorElement(specKey: string) {
  return class extends WippyVueElement<ProviderEditorProps, ProviderEditorEvents> {
    static get wippyConfig(): WippyElementConfig<ProviderEditorProps> {
      return {
        propsSchema: providerEditorProps as WippyPropsSchema,
        hostCssKeys: ['themeConfigUrl', 'primeVueCssUrl'] as const,
        inlineCss: stylesText,
      }
    }

    static get vueConfig() {
      return {
        ...lazyVueConfig(() => import('./provider-editor-mount').then((module) => module.editorMountConfig(specKey)), { surface: 'page', loading: 'Loading…', failed: 'Could not load the provider editor. Reload the page to try again.', timeout: 30000 }),
      }
    }
  }
}

export async function webComponent() {
  return KicksideModelsElement
}

define(import.meta.url, KicksideModelsElement)

for (const [tag, specKey] of Object.entries(EDITOR_TAGS)) {
  if (!customElements.get(tag)) customElements.define(tag, makeEditorElement(specKey))
}

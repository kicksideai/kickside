import { WippyVueElement, define, useEvents } from '@wippy-fe/webcomponent-vue'
import type { WippyElementConfig, WippyPropsSchema } from '@wippy-fe/webcomponent-vue'
import { lazyPage } from '@widgets/lazy'
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
      lazyConfig: lazyPage(
        () => import('./lazy-mount').then((module) => module.mountConfig),
        'Could not load Models. Reload the page to try again.',
        useEvents,
      ),
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
        lazyConfig: lazyPage(
          () => import('./provider-editor-mount').then((module) => module.editorMountConfig(specKey)),
          'Could not load the provider editor. Reload the page to try again.',
          useEvents,
        ),
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

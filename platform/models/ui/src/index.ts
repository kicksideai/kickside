import { WippyVueElement, define, useEvents, useProps } from '@wippy-fe/webcomponent-vue'
import type { WippyElementConfig, WippyPropsSchema } from '@wippy-fe/webcomponent-vue'
import { PrimeVuePlugin } from '@wippy-fe/theme/primevue-plugin'
import { defineComponent, h } from 'vue'
import type { ComponentProps, ProviderEditorProps } from './types.ts'
import type { Events, ProviderEditorEvents } from './constants.ts'
import Models from './app/models.vue'
import ProviderProfileEditor from './app/ProviderProfileEditor.vue'
import { EDITOR_TAGS } from './providerSpecs.ts'
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
    return { rootComponent: Models, plugins: [PrimeVuePlugin] }
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

// Each declared provider_profile_editor tag mounts the shared spec-driven editor
// pinned to its spec key. Host props/events cross the bridge via useProps/useEvents
// (the bridge mounts the root with no Vue props), so the root reads props from the
// host and re-emits the editor's save/cancel/test back to it.
function editorRoot(specKey: string) {
  return defineComponent({
    name: `provider-editor-${specKey}`,
    setup() {
      const props = useProps<ProviderEditorProps>()
      const emit = useEvents<ProviderEditorEvents>()
      return () => h(ProviderProfileEditor, {
        ...props.value,
        specKey,
        onSave: (payload: Record<string, unknown>) => emit('save', payload),
        onCancel: () => emit('cancel', undefined),
        onTest: () => emit('test', undefined),
      })
    },
  })
}

function makeEditorElement(specKey: string) {
  const rootComponent = editorRoot(specKey)
  return class extends WippyVueElement<ProviderEditorProps, ProviderEditorEvents> {
    static get wippyConfig(): WippyElementConfig<ProviderEditorProps> {
      return {
        propsSchema: providerEditorProps as WippyPropsSchema,
        hostCssKeys: ['themeConfigUrl', 'primeVueCssUrl'] as const,
        inlineCss: stylesText,
      }
    }

    static get vueConfig() {
      return { rootComponent, plugins: [PrimeVuePlugin] }
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

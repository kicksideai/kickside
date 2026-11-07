// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
import type { WippyVueMountConfig } from '@wippy-fe/webcomponent-vue'
import { useEvents, useProps } from '@wippy-fe/webcomponent-vue'
import { PrimeVuePlugin } from '@wippy-fe/theme/primevue-plugin'
import { defineComponent, h } from 'vue'
import type { ProviderEditorProps } from './types.ts'
import type { ProviderEditorEvents } from './constants.ts'
import ProviderProfileEditor from './app/ProviderProfileEditor.vue'

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

export function editorMountConfig(specKey: string): WippyVueMountConfig {
  return { rootComponent: editorRoot(specKey), plugins: [PrimeVuePlugin] }
}

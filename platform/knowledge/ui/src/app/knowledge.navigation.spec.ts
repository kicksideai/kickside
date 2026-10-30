// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
import { afterEach, expect, it, vi } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import { computed, defineComponent, ref } from 'vue'
import { useKnowledgeDetail } from './useKnowledgeDetail'
import type { KbDetail } from './knowledge.types'

vi.mock('@wippy-fe/proxy', () => ({ api: {}, loadByTagName: vi.fn() }))
vi.mock('@widgets/app/componentRealtime', () => ({ subscribeComponentMeta: vi.fn() }))

let wrapper: VueWrapper | undefined
afterEach(() => {
  wrapper?.unmount()
  vi.restoreAllMocks()
})

it('asks the shell to go Back within the KB, and closes the KB from its root', () => {
  const navigate = vi.fn()
  const detail = ref<KbDetail | null>({ id: 'library', kb_type: 'files' })
  let controller!: ReturnType<typeof useKnowledgeDetail>
  wrapper = mount(defineComponent({
    setup() {
      controller = useKnowledgeDetail({
        detail, detailUnsub: ref(null), kbs: ref([]), engines: ref([]),
        engineFor: () => undefined, applyComponentMetaEvent: vi.fn(),
        route: computed(() => 'library/files/document'), navigate,
        loadEngines: vi.fn(),
      })
      return () => null
    },
  }))
  const browserBack = vi.spyOn(history, 'back')
  controller.innerRoute.value = 'files/document'
  controller.backDetail()
  expect(navigate).toHaveBeenLastCalledWith({ path: 'library', back: { within: 'library' } })
  expect(browserBack).not.toHaveBeenCalled()
  expect(detail.value?.id).toBe('library')

  controller.innerRoute.value = ''
  controller.backDetail()
  expect(navigate).toHaveBeenLastCalledWith('')
  expect(detail.value).toBeNull()
})

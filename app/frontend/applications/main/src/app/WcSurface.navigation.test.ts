// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
import { expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'
import WcSurface from './WcSurface.vue'

vi.mock('../composables/useWippy', () => ({
  useWippy: () => ({ loadByTagName: vi.fn().mockResolvedValue(undefined) }),
}))
vi.mock('@wippy-fe/proxy', () => ({ on: vi.fn() }))

async function surface(initial: string) {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/:pathMatch(.*)*', component: { render: () => null } }],
  })
  await router.push(initial)
  const wrapper = mount(defineComponent({
    setup: () => () => h(WcSurface, {
      tag: 'test-knowledge', basePath: '/knowledge',
      path: router.currentRoute.value.fullPath,
    }),
  }), { global: { plugins: [router] } })
  await flushPromises()
  return {
    router,
    async navigate(detail: unknown) {
      wrapper.get('test-knowledge').element.dispatchEvent(new CustomEvent('navigate', { detail }))
      await flushPromises()
    },
    route: () => wrapper.get('test-knowledge').attributes('route'),
  }
}

const back = { path: 'library', back: { within: 'library' } }

it('repeated Back follows real memory history inside the KB, preserving query and hash', async () => {
  const app = await surface('/knowledge/library')
  await app.navigate('library/files/document?view=source#paragraph')
  await app.navigate({ path: 'library/review' })
  await app.navigate({ route: 'library/files/other' })
  await app.navigate(back)
  expect(app.router.currentRoute.value.fullPath).toBe('/knowledge/library/review')
  expect(app.route()).toBe('library/review')
  await app.navigate(back)
  expect(app.router.currentRoute.value.fullPath).toBe('/knowledge/library/files/document?view=source#paragraph')
  await app.navigate(back)
  expect(app.router.currentRoute.value.fullPath).toBe('/knowledge/library')
  await app.navigate('')
  expect(app.router.currentRoute.value.fullPath).toBe('/knowledge')
})

it('opens the KB root when a nested page was loaded directly', async () => {
  const app = await surface('/knowledge/library/files/document')
  await app.navigate(back)
  expect(app.router.currentRoute.value.fullPath).toBe('/knowledge/library')
})

it('does not go Back into a different KB whose id has the same prefix', async () => {
  const app = await surface('/knowledge/library-peer/review')
  await app.navigate('library/files/document')
  await app.navigate(back)
  expect(app.router.currentRoute.value.fullPath).toBe('/knowledge/library')
})

it('preserves absolute cross-surface navigation, query and hash', async () => {
  const app = await surface('/knowledge/library')
  await app.navigate('/inbox?view=mine#latest')
  expect(app.router.currentRoute.value.fullPath).toBe('/inbox?view=mine#latest')
})

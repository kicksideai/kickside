// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
import { inject, nextTick, onBeforeUnmount, provide, ref, watch } from 'vue'
import type { InjectionKey, Ref } from 'vue'
import { setWippyVisibility } from '@wippy-fe/shared'

// The Web Host retires this page when another page (Keeper, Git) takes the main
// panel and brings it back later. The proxy used to reload the page on every
// return (`refreshWhenVisible`), which refreshed every surface but also threw
// away unsent drafts and aborted requests in flight. With that reload off, the
// surfaces still need the signal they always had: their own host-visibility
// attribute going from false to true, which their `useHostVisibilityRefresh`
// answers by refetching. The surfaces' visibility here is the shell's own
// (which buffer is on show), so the host's return reaches them only through
// this relay. It adds no refresh of its own.

const HOST_RETURN: InjectionKey<Ref<number>> = Symbol('kickside-host-return')

/**
 * Count the times the host brought this page back after hiding it. The first
 * `visible: true` on boot, and a repeat of it, are not returns.
 */
export function provideHostReturn(subscribe: (handler: (visible: boolean) => void) => (() => void) | undefined) {
  const returns = ref(0)
  let hidden = false
  const stop = subscribe((visible) => {
    if (!visible) {
      hidden = true
      return
    }
    if (!hidden) return
    hidden = false
    returns.value++
  })
  onBeforeUnmount(() => stop?.())
  provide(HOST_RETURN, returns)
}

/**
 * On each return, give the surface element on show a real false-to-true edge
 * through the same `data-wippy-visible` attribute the shell already drives. The
 * attribute is cleared and a tick is allowed to pass before it is set again, so
 * the surface's reactive visibility sees both values. A surface that is not on
 * show is left as it is.
 */
export function useHostReturnRefresh(element: () => Element | null | undefined, onShow: () => boolean) {
  const returns = inject(HOST_RETURN, null)
  if (!returns) return
  watch(returns, async () => {
    const target = element()
    if (!target || !onShow()) return
    setWippyVisibility(target, false)
    await nextTick()
    if (element() === target && onShow()) setWippyVisibility(target, true)
  })
}

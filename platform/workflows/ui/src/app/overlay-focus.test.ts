// @vitest-environment happy-dom
import { describe, expect, it, vi } from 'vitest'
import { restoreOverlayFocusAfterHide } from './overlay-focus'

function visible(element: HTMLElement) {
  element.getClientRects = () => [new DOMRect(0, 0, 10, 10)] as unknown as DOMRectList
  return element
}

describe('overlay focus fallback', () => {
  it('preserves another meaningful control focused during the hide delay', async () => {
    const host = document.createElement('div')
    document.body.append(host)
    const root = host.attachShadow({ mode: 'open' })
    const invoker = visible(document.createElement('button'))
    const other = visible(document.createElement('button'))
    root.append(invoker, other)

    const restoring = restoreOverlayFocusAfterHide({
      root,
      target: invoker,
      fallback: null,
      isCurrent: () => true,
    })
    other.focus()
    await vi.advanceTimersByTimeAsync(500)
    await restoring

    expect(root.activeElement).toBe(other)
    host.remove()
  })

  it('replaces transient menu focus with the persistent fallback', async () => {
    const host = document.createElement('div')
    document.body.append(host)
    const root = host.attachShadow({ mode: 'open' })
    const menuItem = visible(document.createElement('button'))
    menuItem.setAttribute('role', 'menuitem')
    const fallback = visible(document.createElement('button'))
    root.append(menuItem, fallback)
    menuItem.focus()

    const restoring = restoreOverlayFocusAfterHide({
      root,
      target: menuItem,
      fallback,
      isCurrent: () => true,
    })
    await vi.advanceTimersByTimeAsync(500)
    await restoring

    expect(root.activeElement).toBe(fallback)
    host.remove()
  })
})

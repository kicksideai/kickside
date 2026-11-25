import { onMounted, onUnmounted } from 'vue'
import type { Router } from 'vue-router'
import type { HostApi } from '../types'

function isInAppPath(path: string): boolean {
  const pathPart = path.split(/[?#]/, 1)[0] ?? ''
  return path.startsWith('/') && !pathPart.includes('//') &&
    !/[\\\u0000-\u001f\u007f-\u009f]/.test(path)
}

export function useHostLinks(
  host: Pick<HostApi, 'classifyLink' | 'navigate'>,
  router: Pick<Router, 'push'>,
) {
  function handleClick(event: MouseEvent) {
    if (event.defaultPrevented || event.button !== 0 ||
      event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return

    // The event target is retargeted outside a web component's shadow root.
    const anchor = event.composedPath().find(
      (target): target is HTMLAnchorElement => target instanceof HTMLAnchorElement,
    )
    if (!anchor) return
    const target = anchor.getAttribute('target')
    const href = anchor.getAttribute('href')
    if ((target && target !== '_self') || anchor.hasAttribute('download') || !href) return

    const link = host.classifyLink(href)
    if (link.kind === 'external') return
    if (link.kind === 'ignore') {
      event.preventDefault()
      return
    }
    const path = link.normalizedPath ?? href
    if (!isInAppPath(href) || !isInAppPath(path)) return
    event.preventDefault()
    if (link.kind === 'child-nav') router.push(path)
    else host.navigate(path)
  }

  // The Host proxy still handles light-DOM anchors first. Skip events it prevents;
  // this listener adds shadow-root and child-nav handling.
  onMounted(() => document.addEventListener('click', handleClick))
  onUnmounted(() => document.removeEventListener('click', handleClick))
}

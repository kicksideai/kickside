export interface OverlayFocusRestoreOptions {
  root: ShadowRoot | null
  target: HTMLElement | null
  fallback: HTMLElement | null
  isCurrent: () => boolean
  delayMs?: number
}

export function isMeaningfulOverlayFocus(element: Element | null): element is HTMLElement {
  return element instanceof HTMLElement
    && element.isConnected
    && element.getClientRects().length > 0
    && !element.closest(
      '[hidden], [inert], [aria-hidden="true"], [role="dialog"], [role="menu"], [role="menuitem"]',
    )
}

export async function restoreOverlayFocusAfterHide({
  root,
  target,
  fallback,
  isCurrent,
  delayMs = 500,
}: OverlayFocusRestoreOptions): Promise<boolean> {
  await new Promise<void>((resolve) => window.setTimeout(resolve, delayMs))
  if (!isCurrent()) return false
  if (isMeaningfulOverlayFocus(root?.activeElement ?? null)) return true

  if (target && isMeaningfulOverlayFocus(target)) target.focus()
  if (!isMeaningfulOverlayFocus(root?.activeElement ?? null)
    && fallback
    && isMeaningfulOverlayFocus(fallback)) fallback.focus()
  return true
}

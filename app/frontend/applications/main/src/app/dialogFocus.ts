// SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
function dialogControls(root: Element | ShadowRoot): HTMLElement[] {
  const controls: HTMLElement[] = []
  for (const child of root.children) {
    if (child instanceof HTMLElement && child.matches('button, input, select, textarea, a[href], summary, [tabindex], [contenteditable="true"]')
      && child.tabIndex >= 0 && !child.matches(':disabled') && child.checkVisibility({ visibilityProperty: true })) {
      controls.push(child)
    }
    const assigned = child instanceof HTMLSlotElement ? child.assignedElements({ flatten: true }) : []
    if (assigned.length) {
      for (const element of assigned) {
        if (element instanceof HTMLElement && element.tabIndex >= 0 && !element.matches(':disabled')
          && element.checkVisibility({ visibilityProperty: true })) controls.push(element)
        controls.push(...dialogControls(element.shadowRoot || element))
      }
    } else controls.push(...dialogControls(child.shadowRoot || child))
  }
  return controls
}

export function cycleDialogTab(event: KeyboardEvent) {
  if (event.key !== 'Tab' || event.defaultPrevented) return
  const dialog = event.currentTarget
  if (!(dialog instanceof HTMLDialogElement)) return
  const path = event.composedPath()
  // A contributed action can open a dialog of its own.
  const owner = path.find(node => node instanceof Element && node.matches('dialog[open], [role="dialog"][aria-modal="true"]'))
  if (owner !== dialog) return
  const controls = dialogControls(dialog)
  const first = controls[0]
  const last = controls[controls.length - 1]
  if (event.shiftKey && path[0] === first) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && path[0] === last) {
    event.preventDefault()
    first.focus()
  }
}

// A type contributes its own create and manage views as registry view components.
// The manager mounts them by tag name and speaks to them only through the public
// inbound command (submit-nonce) and their outbound events, so it never reaches
// into another module's form.

import type { Automation, AutomationType, ViewComponentRef } from './automation-types'

function tagOf(view: ViewComponentRef | undefined): string {
  const tag = view?.tag_name
  return typeof tag === 'string' ? tag.trim() : ''
}

// Where the bundle is served from, for the message shown when it fails to load.
function locationOf(view: ViewComponentRef | undefined): string {
  const base = typeof view?.base_path === 'string' ? view.base_path.trim() : ''
  const entry = typeof view?.entry_point === 'string' ? view.entry_point.trim() : ''
  if (base && entry) return `/${base}/${entry}`
  const url = typeof view?.url === 'string' ? view.url.trim() : ''
  return url
}

export function customCreateTag(t: AutomationType | null | undefined): string {
  return tagOf(t?.component?.create_ui)
}
export function customCreateLocation(t: AutomationType | null | undefined): string {
  return locationOf(t?.component?.create_ui)
}
export function manageTagOf(t: AutomationType | null | undefined): string {
  return tagOf(t?.component?.manage_ui)
}
export function manageLocationOf(t: AutomationType | null | undefined): string {
  return locationOf(t?.component?.manage_ui)
}

// The config a mounted manage view receives: the instance id first, then the row
// and its type for views that render from them.
export function manageConfigOf(a: Automation, t: AutomationType | undefined): Record<string, unknown> {
  return { id: a.id, automation: a, public_state: a.public_state || {}, type: t }
}

// The one public inbound command a mounted create view accepts: a changed nonce
// asks it to submit. Shared by the install popup footer and the edit modal.
let submitNonce = 0
export function requestCustomSubmit(el: HTMLElement | null) {
  if (!el) return
  submitNonce += 1
  el.setAttribute('submit-nonce', String(submitNonce))
}

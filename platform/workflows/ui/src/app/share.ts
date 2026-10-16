import { loadByTagName } from '@wippy-fe/proxy'

// Workflows are ordinary components for access purposes. Keep the generic share
// widget contract in one place so the list and builder cannot drift into bespoke
// sharing APIs or accidentally point at a definition/event endpoint.
export const WORKFLOW_SHARE_TAG = 'kickside-share'

export function workflowShareConfig(workflowId: string, title = 'Workflow') {
  return {
    resource_id: workflowId,
    access_url: `/api/v1/component-access/grants/${encodeURIComponent(workflowId)}`,
    share_url: `/api/v1/component-access/share/${encodeURIComponent(workflowId)}`,
    title: title.trim() || 'Workflow',
  }
}

export async function mountWorkflowShare(host: HTMLElement, workflowId: string, title: string, onClose: () => void) {
  host.innerHTML = ''
  if (!customElements.get(WORKFLOW_SHARE_TAG)) {
    try { await loadByTagName(WORKFLOW_SHARE_TAG, { timeoutMs: 8000 }) } catch { /* render inertly if the host cannot load it */ }
  }
  const el = document.createElement(WORKFLOW_SHARE_TAG)
  el.setAttribute('config', JSON.stringify(workflowShareConfig(workflowId, title)))
  el.style.display = 'block'
  let observer: MutationObserver | null = null
  let seenDialog = false
  let closed = false
  const finish = () => {
    if (closed) return
    closed = true
    observer?.disconnect()
    onClose()
  }
  const checkDialog = () => {
    const visible = !!el.shadowRoot?.querySelector('[role="dialog"]')
    if (visible) seenDialog = true
    else if (seenDialog) finish()
  }
  el.addEventListener('close', finish)
  host.appendChild(el)
  queueMicrotask(() => {
    if (!el.shadowRoot) return
    observer = new MutationObserver(checkDialog)
    observer.observe(el.shadowRoot, { childList: true, subtree: true })
    checkDialog()
  })
  return el
}

import { WippyElement, define } from '@wippy-fe/webcomponent-core'
import type { WippyElementConfig, WippyPropsSchema } from '@wippy-fe/webcomponent-core'
import { loadByTagName } from '@wippy-fe/proxy'

/** Parsed props: schema keys are the literal attribute names, camelCased. */
interface NoticeProps {
  content: string
  dataMeta: string
}

interface NoticeField {
  label: unknown
  value: unknown
}

/** Component-scoped CSS injected into the shadow root — `:host` applies here. */
const inlineCss = `
  :host { display: block; color: inherit; font-family: inherit; }
  .notice { display: flex; flex-direction: column; gap: 14px; }
  .content { display: block; margin: 0; font-size: 13.5px; line-height: 1.6; color: var(--p-text-color, currentColor); }
  .fields { border: 1px solid var(--p-content-border-color, #d4d4d8); border-radius: 10px; overflow: hidden; }
  .field { display: flex; justify-content: space-between; gap: 18px; padding: 10px 12px; border-bottom: 1px solid var(--p-content-border-color, #d4d4d8); font-size: 13px; }
  .field:last-child { border-bottom: 0; }
  .label { color: var(--p-text-muted-color, #71717a); }
  .value { color: var(--p-text-color, currentColor); font-weight: 600; text-align: right; }
`

function esc(v: unknown): string {
  return String(v ?? '').replace(/[&<>"']/g, (ch) => (({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  } as Record<string, string>)[ch] || ch))
}

function readFields(dataMeta: string): NoticeField[] {
  if (!dataMeta) return []
  try {
    const meta: unknown = JSON.parse(dataMeta)
    const fields = (meta as { fields?: unknown } | null)?.fields
    return Array.isArray(fields) ? (fields as NoticeField[]) : []
  } catch {
    return []
  }
}

function renderNotice(props: NoticeProps): string {
  const content = props.content ?? ''
  const fields = readFields(props.dataMeta ?? '')

  const contentHtml = content ? `<wc-render-markdown class="content" source="${esc(content)}"></wc-render-markdown>` : ''
  const fieldsHtml = fields.length
    ? `<div class="fields">${fields
        .map((f) => `<div class="field"><span class="label">${esc(f.label)}</span><span class="value">${esc(f.value)}</span></div>`)
        .join('')}</div>`
    : ''

  return `<div class="notice">${contentHtml}${fieldsHtml}</div>`
}

/**
 * Built-in renderer for inbox "notice" items. Lightweight, non-Vue: extends the
 * framework-agnostic `WippyElement` so the markup lives in shadow DOM (where the
 * `:host` rule applies) while staying an innerHTML renderer, as intended for the
 * fallback detail body. Reads `content` and `data-meta` attributes.
 */
class KicksideInboxNoticeElement extends WippyElement<NoticeProps> {
  // Return type is the base's un-parameterized config: the static getter on
  // WippyElement is declared as WippyElementConfig<Record<string, unknown>>, and
  // a narrower WippyElementConfig<NoticeProps> would break static-side variance
  // via the contravariant `validateProps` param (which this component omits).
  static get wippyConfig(): WippyElementConfig {
    return {
      propsSchema: {
        type: 'object',
        properties: {
          content: { type: 'string' },
          'data-meta': { type: 'string' },
        },
      } as WippyPropsSchema,
      // Self-styled fallback body; no host CSS needed (theme vars have fallbacks).
      hostCssKeys: [],
      inlineCss,
    }
  }

  private container: HTMLElement | null = null

  protected onMount(_shadow: ShadowRoot, container: HTMLElement, initialProps: NoticeProps): void {
    this.container = container
    container.innerHTML = renderNotice(initialProps)
    void loadByTagName('wc-render-markdown', { timeoutMs: 8000 }).catch((error: unknown) => this.onError(error))
  }

  protected onPropsChanged(props: NoticeProps): void {
    if (this.container) this.container.innerHTML = renderNotice(props)
  }

  protected onUnmount(): void {
    this.container = null
  }
}

export async function webComponent() {
  return KicksideInboxNoticeElement
}

define(import.meta.url, KicksideInboxNoticeElement)

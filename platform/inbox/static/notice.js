import { W as a } from "./index-DoQuo6nY.js";
import { define as c, loadByTagName as d } from "@wippy-fe/proxy";
const p = `
  :host { display: block; color: inherit; font-family: inherit; }
  .notice { display: flex; flex-direction: column; gap: 14px; }
  .content { display: block; margin: 0; font-size: 13.5px; line-height: 1.6; color: var(--p-text-color, currentColor); }
  .fields { border: 1px solid var(--p-content-border-color, #d4d4d8); border-radius: 10px; overflow: hidden; }
  .field { display: flex; justify-content: space-between; gap: 18px; padding: 10px 12px; border-bottom: 1px solid var(--p-content-border-color, #d4d4d8); font-size: 13px; }
  .field:last-child { border-bottom: 0; }
  .label { color: var(--p-text-muted-color, #71717a); }
  .value { color: var(--p-text-color, currentColor); font-weight: 600; text-align: right; }
`;
function i(t) {
  return String(t ?? "").replace(/[&<>"']/g, (e) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[e] || e);
}
function m(t) {
  if (!t) return [];
  try {
    const n = JSON.parse(t)?.fields;
    return Array.isArray(n) ? n : [];
  } catch {
    return [];
  }
}
function l(t) {
  const e = t.content ?? "", n = m(t.dataMeta ?? ""), o = e ? `<wc-render-markdown class="content" source="${i(e)}"></wc-render-markdown>` : "", r = n.length ? `<div class="fields">${n.map((s) => `<div class="field"><span class="label">${i(s.label)}</span><span class="value">${i(s.value)}</span></div>`).join("")}</div>` : "";
  return `<div class="notice">${o}${r}</div>`;
}
class f extends a {
  // Return type is the base's un-parameterized config: the static getter on
  // WippyElement is declared as WippyElementConfig<Record<string, unknown>>, and
  // a narrower WippyElementConfig<NoticeProps> would break static-side variance
  // via the contravariant `validateProps` param (which this component omits).
  static get wippyConfig() {
    return {
      propsSchema: {
        type: "object",
        properties: {
          content: { type: "string" },
          "data-meta": { type: "string" }
        }
      },
      // Self-styled fallback body; no host CSS needed (theme vars have fallbacks).
      hostCssKeys: [],
      inlineCss: p
    };
  }
  container = null;
  onMount(e, n, o) {
    this.container = n, n.innerHTML = l(o), d("wc-render-markdown", { timeoutMs: 8e3 }).catch((r) => this.onError(r));
  }
  onPropsChanged(e) {
    this.container && (this.container.innerHTML = l(e));
  }
  onUnmount() {
    this.container = null;
  }
}
c(import.meta.url, f);
//# sourceMappingURL=notice.js.map

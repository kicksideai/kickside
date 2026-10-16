import { W as a } from "./index-DoQuo6nY.js";
import { define as c } from "@wippy-fe/proxy";
const d = `
  :host { display: block; color: inherit; font-family: inherit; }
  .notice { display: flex; flex-direction: column; gap: 14px; }
  .content { margin: 0; font-size: 13.5px; line-height: 1.6; color: var(--p-text-color, currentColor); }
  .fields { border: 1px solid var(--p-content-border-color, #d4d4d8); border-radius: 10px; overflow: hidden; }
  .field { display: flex; justify-content: space-between; gap: 18px; padding: 10px 12px; border-bottom: 1px solid var(--p-content-border-color, #d4d4d8); font-size: 13px; }
  .field:last-child { border-bottom: 0; }
  .label { color: var(--p-text-muted-color, #71717a); }
  .value { color: var(--p-text-color, currentColor); font-weight: 600; text-align: right; }
`;
function r(e) {
  return String(e ?? "").replace(/[&<>"']/g, (t) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[t] || t);
}
function p(e) {
  if (!e) return [];
  try {
    const n = JSON.parse(e)?.fields;
    return Array.isArray(n) ? n : [];
  } catch {
    return [];
  }
}
function l(e) {
  const t = e.content ?? "", n = p(e.dataMeta ?? ""), o = t ? `<p class="content">${r(t)}</p>` : "", s = n.length ? `<div class="fields">${n.map((i) => `<div class="field"><span class="label">${r(i.label)}</span><span class="value">${r(i.value)}</span></div>`).join("")}</div>` : "";
  return `<div class="notice">${o}${s}</div>`;
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
      inlineCss: d
    };
  }
  container = null;
  onMount(t, n, o) {
    this.container = n, n.innerHTML = l(o);
  }
  onPropsChanged(t) {
    this.container && (this.container.innerHTML = l(t));
  }
  onUnmount() {
    this.container = null;
  }
}
c(import.meta.url, f);
//# sourceMappingURL=notice.js.map

import { u as M, W as T, s as E } from "./styles-ciEHWahf.js";
import { defineComponent as N, ref as v, onMounted as V, watch as L, onBeforeUnmount as B, openBlock as y, createElementBlock as d, createVNode as R, unref as p, createElementVNode as g, createTextVNode as k, toDisplayString as W, createCommentVNode as _, withDirectives as S, vShow as I } from "vue";
import { Icon as D } from "@iconify/vue";
import { loadByTagName as K, api as O, define as P } from "@wippy-fe/proxy";
const j = { class: "rv" }, F = {
  key: 0,
  class: "rv-fallback"
}, q = ["href"], z = /* @__PURE__ */ N({
  __name: "ResourceView",
  setup(b) {
    const s = M(), h = [
      { tag: "wc-render-pdf", types: ["application/pdf"], priority: 90 },
      { tag: "wc-render-image", types: ["image/*"], priority: 90 },
      { tag: "wc-render-markdown", types: ["text/markdown", "text/x-markdown", "application/markdown", "text/plain", ""], priority: 40 }
    ];
    let f = null;
    async function x() {
      return f || (f = O.get("/api/v1/renderers").then((r) => {
        const n = (r?.data?.renderers || []).filter((t) => t.tag_name && Array.isArray(t.content_types)).map((t) => ({ tag: t.tag_name, types: t.content_types, priority: Number(t.priority) || 0, label: t.label }));
        return n.length ? n : h;
      }).catch(() => h)), f;
    }
    function C(r, e) {
      let n = -1;
      for (const t of r) {
        const i = (t || "").toLowerCase().trim();
        i === e ? n = Math.max(n, 3) : i.endsWith("/*") && e.startsWith(i.slice(0, -1)) ? n = Math.max(n, 2) : i === "*/*" ? n = Math.max(n, 1) : i === "" && e === "" && (n = Math.max(n, 3));
      }
      return n;
    }
    async function A(r) {
      const e = (r || "").toLowerCase().split(";")[0].trim(), n = await x();
      let t = null, i = 0;
      for (const l of n) {
        const u = C(l.types, e);
        u <= 0 || (u > i || u === i && (!t || l.priority > t.priority)) && (t = l, i = u);
      }
      return !t && (e === "" || e.startsWith("text/")) && (t = n.find((l) => l.tag === "wc-render-markdown") || null), t;
    }
    const a = v(null), c = v(!1);
    let o = null, m = 0;
    function U(r) {
      const e = s.value;
      e?.source && r.setAttribute("source", e.source), e?.sourceUrl && r.setAttribute("source-url", e.sourceUrl), e?.contentType && r.setAttribute("content-type", e.contentType), e?.alt && r.setAttribute("alt", e.alt), e?.filename && r.setAttribute("filename", e.filename);
    }
    async function w() {
      const r = ++m;
      if (c.value = !1, o && (o.remove(), o = null), !a.value) return;
      const e = await A(s.value?.contentType || "");
      if (!(r !== m || !a.value)) {
        if (!e) {
          c.value = !0;
          return;
        }
        try {
          customElements.get(e.tag) || await K(e.tag, { timeoutMs: 1e4 });
        } catch {
        }
        r !== m || !a.value || (o = document.createElement(e.tag), U(o), o.style.display = "block", a.value.appendChild(o));
      }
    }
    return V(w), L(() => [s.value?.contentType, s.value?.source, s.value?.sourceUrl], w), B(() => {
      o && o.remove();
    }), (r, e) => (y(), d("div", j, [
      c.value ? (y(), d("div", F, [
        R(p(D), {
          icon: "tabler:file-unknown",
          "aria-hidden": "true"
        }),
        g("span", null, [
          e[0] || (e[0] = k("No inline viewer for ", -1)),
          g("strong", null, W(p(s)?.contentType || "this type"), 1),
          e[1] || (e[1] = k(".", -1))
        ]),
        p(s)?.sourceUrl ? (y(), d("a", {
          key: 0,
          href: p(s).sourceUrl,
          target: "_blank",
          rel: "noopener noreferrer"
        }, "Open ↗", 8, q)) : _("", !0)
      ])) : _("", !0),
      S(g("div", {
        ref_key: "host",
        ref: a
      }, null, 512), [
        [I, !c.value]
      ])
    ]));
  }
}), G = {
  type: "object",
  properties: {
    "content-type": { type: "string", default: "", description: "MIME type of the resource (e.g. text/markdown, application/pdf, image/png)." },
    source: { type: "string", default: "", description: "Inline text source (markdown/plain) when there is no URL." },
    "source-url": { type: "string", default: "", description: "URL to fetch the resource bytes/text from (auth via proxy)." },
    alt: { type: "string", default: "", description: "Alt text for image resources." },
    filename: { type: "string", default: "", description: "Original filename, forwarded to viewers that infer type from the extension." }
  }
};
class H extends T {
  static get wippyConfig() {
    return {
      propsSchema: G,
      hostCssKeys: ["themeConfigUrl"],
      inlineCss: E
    };
  }
  static get vueConfig() {
    return { rootComponent: z };
  }
}
P(import.meta.url, H);
//# sourceMappingURL=resource-view.js.map

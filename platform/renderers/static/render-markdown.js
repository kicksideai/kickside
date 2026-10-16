import { u as z, W as D, s as N } from "./styles-ciEHWahf.js";
import { defineComponent as P, ref as b, onBeforeUnmount as q, watch as w, computed as F, openBlock as c, createElementBlock as d, unref as t, createVNode as _, createElementVNode as v, createCommentVNode as C, toDisplayString as H, Fragment as x, renderList as R, createBlock as $, nextTick as I } from "vue";
import { Icon as L } from "@iconify/vue";
import { api as W, define as j } from "@wippy-fe/proxy";
import { u as A, _ as G } from "./TablePager.vue_vue_type_script_setup_true_lang-j7ct7P2v.js";
const K = {
  key: 0,
  class: "rv-state"
}, O = {
  key: 1,
  class: "rv-state err"
}, J = ["aria-busy", "innerHTML"], Q = /* @__PURE__ */ P({
  __name: "RenderMarkdown",
  setup(S) {
    const p = z(), u = A(), { result: i, loading: y, error: g } = u, f = b(!1);
    let m = 0, l = 0;
    const k = b(null);
    q(() => {
      m++, l++;
    });
    async function T() {
      const o = ++m;
      u.clear(), f.value = !1;
      const a = p.value?.source;
      if (typeof a == "string" && a.trim()) {
        u.markdown(a);
        return;
      }
      const n = p.value?.sourceUrl;
      if (n) {
        f.value = !0;
        try {
          const { data: r } = await W.get(n, { responseType: "text" });
          if (o !== m) return;
          u.markdown(typeof r == "string" ? r : String(r ?? ""));
        } catch (r) {
          if (o !== m) return;
          g.value = r instanceof Error ? r.message : "Could not load content";
        } finally {
          o === m && (f.value = !1);
        }
      }
    }
    w(() => [p.value?.source, p.value?.sourceUrl], T, { immediate: !0 });
    const E = F(() => i.value?.kind === "markdown" ? i.value.html : "");
    async function U() {
      const o = ++l;
      if (await I(), o !== l) return;
      const a = [...k.value?.querySelectorAll(".md-mermaid") ?? []];
      for (const n of a) {
        const r = n.textContent ?? "";
        try {
          const { default: s } = await import("./mermaid.core-CmK1425T.js").then((B) => B.cb);
          if (o !== l) return;
          const e = getComputedStyle(n), h = e.getPropertyValue("--p-content-background").trim(), V = e.getPropertyValue("--p-content-border-color").trim();
          s.initialize({
            startOnLoad: !1,
            securityLevel: "strict",
            htmlLabels: !1,
            theme: "base",
            themeVariables: {
              primaryColor: h,
              secondaryColor: h,
              tertiaryColor: h,
              primaryBorderColor: V,
              primaryTextColor: e.color,
              secondaryTextColor: e.color,
              tertiaryTextColor: e.color,
              textColor: e.color,
              lineColor: e.color,
              fontFamily: e.fontFamily,
              fontSize: e.fontSize
            }
          });
          const { svg: M } = await s.render(`md-mermaid-${crypto.randomUUID()}`, r);
          if (o !== l) return;
          n.innerHTML = M;
        } catch (s) {
          if (o !== l) return;
          const e = document.createElement("div");
          e.className = "md-mermaid-error", e.textContent = `Diagram could not render: ${s instanceof Error ? s.message : String(s)}`, n.appendChild(e);
        }
      }
    }
    return w(E, U, { immediate: !0 }), (o, a) => (c(), d("div", null, [
      f.value || t(y) && !t(i) ? (c(), d("div", K, [
        _(t(L), {
          icon: "tabler:loader-2",
          class: "spin",
          "aria-hidden": "true"
        }),
        a[0] || (a[0] = v("span", null, "Loading…", -1))
      ])) : C("", !0),
      t(g) ? (c(), d("div", O, [
        _(t(L), {
          icon: "tabler:alert-circle",
          "aria-hidden": "true"
        }),
        v("span", null, H(t(g)), 1)
      ])) : C("", !0),
      t(i)?.kind === "markdown" ? (c(), d(x, { key: 2 }, [
        (c(!0), d(x, null, R(t(i).tables, (n, r) => (c(), $(G, {
          key: r,
          size: n,
          page: t(i).pages[r],
          busy: t(y),
          onChange: (s) => t(u).page(r, s)
        }, null, 8, ["size", "page", "busy", "onChange"]))), 128)),
        v("div", {
          ref_key: "body",
          ref: k,
          class: "md markdown-body",
          "aria-busy": t(y),
          innerHTML: t(i).html
        }, null, 8, J)
      ], 64)) : C("", !0)
    ]));
  }
}), X = {
  type: "object",
  properties: {
    source: { type: "string", default: "", description: "Markdown/plain text to render inline." },
    "source-url": { type: "string", default: "", description: "URL to fetch the source text from (auth via proxy) when source is empty." }
  }
};
class Y extends D {
  static get wippyConfig() {
    return {
      propsSchema: X,
      hostCssKeys: ["themeConfigUrl"],
      inlineCss: N
    };
  }
  static get vueConfig() {
    return { rootComponent: Q };
  }
}
j(import.meta.url, Y);
//# sourceMappingURL=render-markdown.js.map

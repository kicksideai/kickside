import { u as f, W as y } from "./wc-runtime-DjtZy7dL.js";
import { defineComponent as k, ref as a, onMounted as g, openBlock as s, createElementBlock as r, createElementVNode as e, toDisplayString as l, Fragment as h, createTextVNode as _, createCommentVNode as c } from "vue";
import { loadByTagName as b, api as w, define as C } from "@wippy-fe/proxy";
import { s as E } from "./styles-D9m6R71p.js";
import "@iconify/vue";
const S = { class: "ks-about" }, x = {
  key: 0,
  class: "ks-loading"
}, K = {
  key: 1,
  role: "alert",
  class: "ks-err"
}, V = { class: "ks-about-facts" }, L = { class: "ks-about-runtime" }, N = { "aria-labelledby": "third-party-notices" }, T = {
  key: 0,
  role: "alert",
  class: "ks-err"
}, B = ["source"], M = /* @__PURE__ */ k({
  __name: "about",
  setup(m) {
    const n = a(null), i = a(""), u = a(!0);
    async function v() {
      u.value = !0, i.value = "";
      try {
        const { data: t } = await w.get("/api/v1/settings/about");
        if (!t?.success) throw new Error(t?.error || "Failed to load application information");
        n.value = t;
      } catch (t) {
        n.value = null, i.value = t instanceof Error ? t.message : String(t);
      } finally {
        u.value = !1;
      }
    }
    f(v);
    const d = a("");
    return g(() => {
      b("wc-render-markdown", { timeoutMs: 8e3 }).catch((t) => {
        d.value = t instanceof Error ? t.message : String(t);
      });
    }), (t, o) => (s(), r("div", S, [
      o[4] || (o[4] = e("header", { class: "ks-pane-head" }, [
        e("div", { class: "ks-pane-head-text" }, [
          e("h1", null, "About KickSide")
        ])
      ], -1)),
      u.value ? (s(), r("p", x, "Loading…")) : i.value ? (s(), r("p", K, l(i.value), 1)) : n.value ? (s(), r(h, { key: 2 }, [
        e("dl", V, [
          e("div", null, [
            o[0] || (o[0] = e("dt", null, "KickSide version", -1)),
            e("dd", null, l(n.value.version || "Development build"), 1)
          ]),
          o[1] || (o[1] = e("div", null, [
            e("dt", null, "Licence"),
            e("dd", null, [
              e("a", {
                href: "https://wippy.ai/license",
                target: "_blank",
                rel: "noopener noreferrer"
              }, "KickSide Community License")
            ])
          ], -1))
        ]),
        e("p", L, [
          o[2] || (o[2] = _("Runs on the Wippy runtime (MPL-2.0) ", -1)),
          e("span", null, l(n.value.runtime_version), 1)
        ]),
        e("section", N, [
          o[3] || (o[3] = e("h2", { id: "third-party-notices" }, "Third-party notices", -1)),
          d.value ? (s(), r("p", T, l(d.value), 1)) : c("", !0),
          e("wc-render-markdown", {
            class: "ks-about-notices",
            source: n.value.notices
          }, null, 8, B)
        ])
      ], 64)) : c("", !0)
    ]));
  }
});
class p extends y {
  static get wippyConfig() {
    return {
      propsSchema: { type: "object", properties: {} },
      hostCssKeys: ["themeConfigUrl"],
      inlineCss: E
    };
  }
  static get vueConfig() {
    return { rootComponent: M };
  }
}
async function j() {
  return p;
}
C(import.meta.url, p);
export {
  j as webComponent
};
//# sourceMappingURL=about.js.map

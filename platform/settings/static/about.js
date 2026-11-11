import { u as k, W as y } from "./wc-runtime-DjtZy7dL.js";
import { defineComponent as g, ref as a, onMounted as _, resolveComponent as h, openBlock as s, createElementBlock as r, createElementVNode as e, toDisplayString as l, Fragment as b, createTextVNode as w, createCommentVNode as c, createVNode as C } from "vue";
import { loadByTagName as E, api as S, define as x } from "@wippy-fe/proxy";
import { s as V } from "./styles-D9m6R71p.js";
import "@iconify/vue";
const K = { class: "ks-about" }, N = {
  key: 0,
  class: "ks-loading"
}, L = {
  key: 1,
  role: "alert",
  class: "ks-err"
}, T = { class: "ks-about-facts" }, B = { class: "ks-about-runtime" }, M = { "aria-labelledby": "third-party-notices" }, W = {
  key: 0,
  role: "alert",
  class: "ks-err"
}, A = /* @__PURE__ */ g({
  __name: "about",
  setup(m) {
    const n = a(null), i = a(""), u = a(!0);
    async function v() {
      u.value = !0, i.value = "";
      try {
        const { data: t } = await S.get("/api/v1/settings/about");
        if (!t?.success) throw new Error(t?.error || "Failed to load application information");
        n.value = t;
      } catch (t) {
        n.value = null, i.value = t instanceof Error ? t.message : String(t);
      } finally {
        u.value = !1;
      }
    }
    k(v);
    const d = a("");
    return _(() => {
      E("wc-render-markdown", { timeoutMs: 8e3 }).catch((t) => {
        d.value = t instanceof Error ? t.message : String(t);
      });
    }), (t, o) => {
      const f = h("wc-render-markdown");
      return s(), r("div", K, [
        o[4] || (o[4] = e("header", { class: "ks-pane-head" }, [
          e("div", { class: "ks-pane-head-text" }, [
            e("h1", null, "About KickSide")
          ])
        ], -1)),
        u.value ? (s(), r("p", N, "Loading…")) : i.value ? (s(), r("p", L, l(i.value), 1)) : n.value ? (s(), r(b, { key: 2 }, [
          e("dl", T, [
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
          e("p", B, [
            o[2] || (o[2] = w("Runs on the Wippy runtime (MPL-2.0) ", -1)),
            e("span", null, l(n.value.runtime_version), 1)
          ]),
          e("section", M, [
            o[3] || (o[3] = e("h2", { id: "third-party-notices" }, "Third-party notices", -1)),
            d.value ? (s(), r("p", W, l(d.value), 1)) : c("", !0),
            C(f, {
              class: "ks-about-notices",
              source: n.value.notices
            }, null, 8, ["source"])
          ])
        ], 64)) : c("", !0)
      ]);
    };
  }
});
class p extends y {
  static get wippyConfig() {
    return {
      propsSchema: { type: "object", properties: {} },
      hostCssKeys: ["themeConfigUrl"],
      inlineCss: V
    };
  }
  static get vueConfig() {
    return { rootComponent: A };
  }
}
async function P() {
  return p;
}
x(import.meta.url, p);
export {
  P as webComponent
};
//# sourceMappingURL=about.js.map

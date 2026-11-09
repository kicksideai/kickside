import { u as v, W as f, s as k } from "./styles-CrKXLCsi.js";
import { defineComponent as y, ref as a, onMounted as g, openBlock as n, createElementBlock as r, createElementVNode as e, toDisplayString as l, Fragment as h, createTextVNode as _, createCommentVNode as c } from "vue";
import { loadByTagName as b, api as w, define as C } from "@wippy-fe/proxy";
import "@iconify/vue";
const E = { class: "ks-about" }, S = {
  key: 0,
  class: "ks-loading"
}, x = {
  key: 1,
  role: "alert",
  class: "ks-err"
}, K = { class: "ks-about-facts" }, V = { class: "ks-about-runtime" }, L = { "aria-labelledby": "third-party-notices" }, N = {
  key: 0,
  role: "alert",
  class: "ks-err"
}, T = ["source"], B = /* @__PURE__ */ y({
  __name: "about",
  setup(p) {
    const o = a(null), i = a(""), u = a(!0);
    async function m() {
      u.value = !0, i.value = "";
      try {
        const { data: t } = await w.get("/api/v1/settings/about");
        if (!t?.success) throw new Error(t?.error || "Failed to load application information");
        o.value = t;
      } catch (t) {
        o.value = null, i.value = t instanceof Error ? t.message : String(t);
      } finally {
        u.value = !1;
      }
    }
    v(m);
    const d = a("");
    return g(() => {
      b("wc-render-markdown", { timeoutMs: 8e3 }).catch((t) => {
        d.value = t instanceof Error ? t.message : String(t);
      });
    }), (t, s) => (n(), r("div", E, [
      s[4] || (s[4] = e("header", { class: "ks-pane-head" }, [
        e("div", { class: "ks-pane-head-text" }, [
          e("h1", null, "About KickSide")
        ])
      ], -1)),
      u.value ? (n(), r("p", S, "Loading…")) : i.value ? (n(), r("p", x, l(i.value), 1)) : o.value ? (n(), r(h, { key: 2 }, [
        e("dl", K, [
          e("div", null, [
            s[0] || (s[0] = e("dt", null, "KickSide version", -1)),
            e("dd", null, l(o.value.version || "Development build"), 1)
          ]),
          s[1] || (s[1] = e("div", null, [
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
        e("p", V, [
          s[2] || (s[2] = _("Runs on the Wippy runtime (MPL-2.0) ", -1)),
          e("span", null, l(o.value.runtime_version), 1)
        ]),
        e("section", L, [
          s[3] || (s[3] = e("h2", { id: "third-party-notices" }, "Third-party notices", -1)),
          d.value ? (n(), r("p", N, l(d.value), 1)) : c("", !0),
          e("wc-render-markdown", {
            class: "ks-about-notices",
            source: o.value.notices
          }, null, 8, T)
        ])
      ], 64)) : c("", !0)
    ]));
  }
});
class M extends f {
  static get wippyConfig() {
    return {
      propsSchema: { type: "object", properties: {} },
      hostCssKeys: ["themeConfigUrl"],
      inlineCss: k
    };
  }
  static get vueConfig() {
    return { rootComponent: B };
  }
}
C(import.meta.url, M);
//# sourceMappingURL=about.js.map

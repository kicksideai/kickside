import { u as c, W as m, s as v } from "./styles-BCHHd4iE.js";
import { defineComponent as f, ref as u, openBlock as i, createElementBlock as r, createElementVNode as e, toDisplayString as a, Fragment as y, createTextVNode as k, createCommentVNode as g } from "vue";
import { api as h, define as b } from "@wippy-fe/proxy";
import "@iconify/vue";
const _ = { class: "ks-about" }, C = {
  key: 0,
  class: "ks-loading"
}, S = {
  key: 1,
  role: "alert",
  class: "ks-err"
}, E = { class: "ks-about-facts" }, w = { class: "ks-about-runtime" }, x = { "aria-labelledby": "third-party-notices" }, K = { class: "ks-about-notices" }, V = /* @__PURE__ */ f({
  __name: "about",
  setup(d) {
    const n = u(null), o = u(""), l = u(!0);
    async function p() {
      l.value = !0, o.value = "";
      try {
        const { data: s } = await h.get("/api/v1/settings/about");
        if (!s?.success) throw new Error(s?.error || "Failed to load application information");
        n.value = s;
      } catch (s) {
        n.value = null, o.value = s instanceof Error ? s.message : String(s);
      } finally {
        l.value = !1;
      }
    }
    return c(p), (s, t) => (i(), r("div", _, [
      t[4] || (t[4] = e("header", { class: "ks-pane-head" }, [
        e("div", { class: "ks-pane-head-text" }, [
          e("h1", null, "About KickSide")
        ])
      ], -1)),
      l.value ? (i(), r("p", C, "Loading…")) : o.value ? (i(), r("p", S, a(o.value), 1)) : n.value ? (i(), r(y, { key: 2 }, [
        e("dl", E, [
          e("div", null, [
            t[0] || (t[0] = e("dt", null, "KickSide version", -1)),
            e("dd", null, a(n.value.version || "Development build"), 1)
          ]),
          t[1] || (t[1] = e("div", null, [
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
        e("p", w, [
          t[2] || (t[2] = k("Runs on the Wippy runtime (MPL-2.0) ", -1)),
          e("span", null, a(n.value.runtime_version), 1)
        ]),
        e("section", x, [
          t[3] || (t[3] = e("h2", { id: "third-party-notices" }, "Third-party notices", -1)),
          e("pre", K, a(n.value.notices), 1)
        ])
      ], 64)) : g("", !0)
    ]));
  }
});
class L extends m {
  static get wippyConfig() {
    return {
      propsSchema: { type: "object", properties: {} },
      hostCssKeys: ["themeConfigUrl"],
      inlineCss: v
    };
  }
  static get vueConfig() {
    return { rootComponent: V };
  }
}
b(import.meta.url, L);
//# sourceMappingURL=about.js.map

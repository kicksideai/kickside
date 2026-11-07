import { u as m, W as f } from "./wc-runtime-DjtZy7dL.js";
import { defineComponent as v, ref as u, openBlock as i, createElementBlock as r, createElementVNode as e, toDisplayString as a, Fragment as y, createTextVNode as k, createCommentVNode as g } from "vue";
import { api as b, define as h } from "@wippy-fe/proxy";
import { s as _ } from "./styles-B9e-D7Mq.js";
import "@iconify/vue";
const C = { class: "ks-about" }, S = {
  key: 0,
  class: "ks-loading"
}, w = {
  key: 1,
  role: "alert",
  class: "ks-err"
}, x = { class: "ks-about-facts" }, E = { class: "ks-about-runtime" }, K = { "aria-labelledby": "third-party-notices" }, V = { class: "ks-about-notices" }, L = /* @__PURE__ */ v({
  __name: "about",
  setup(d) {
    const n = u(null), o = u(""), l = u(!0);
    async function c() {
      l.value = !0, o.value = "";
      try {
        const { data: s } = await b.get("/api/v1/settings/about");
        if (!s?.success) throw new Error(s?.error || "Failed to load application information");
        n.value = s;
      } catch (s) {
        n.value = null, o.value = s instanceof Error ? s.message : String(s);
      } finally {
        l.value = !1;
      }
    }
    return m(c), (s, t) => (i(), r("div", C, [
      t[4] || (t[4] = e("header", { class: "ks-pane-head" }, [
        e("div", { class: "ks-pane-head-text" }, [
          e("h1", null, "About KickSide")
        ])
      ], -1)),
      l.value ? (i(), r("p", S, "Loading…")) : o.value ? (i(), r("p", w, a(o.value), 1)) : n.value ? (i(), r(y, { key: 2 }, [
        e("dl", x, [
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
        e("p", E, [
          t[2] || (t[2] = k("Runs on the Wippy runtime (MPL-2.0) ", -1)),
          e("span", null, a(n.value.runtime_version), 1)
        ]),
        e("section", K, [
          t[3] || (t[3] = e("h2", { id: "third-party-notices" }, "Third-party notices", -1)),
          e("pre", V, a(n.value.notices), 1)
        ])
      ], 64)) : g("", !0)
    ]));
  }
});
class p extends f {
  static get wippyConfig() {
    return {
      propsSchema: { type: "object", properties: {} },
      hostCssKeys: ["themeConfigUrl"],
      inlineCss: _
    };
  }
  static get vueConfig() {
    return { rootComponent: L };
  }
}
async function D() {
  return p;
}
h(import.meta.url, p);
export {
  D as webComponent
};
//# sourceMappingURL=about.js.map

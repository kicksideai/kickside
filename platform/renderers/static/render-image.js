import { u as g, W as y, s as _ } from "./styles-ciEHWahf.js";
import { defineComponent as h, ref as i, watch as U, onBeforeUnmount as b, openBlock as o, createElementBlock as a, createVNode as p, unref as c, createElementVNode as m, toDisplayString as C, createCommentVNode as k } from "vue";
import { Icon as d } from "@iconify/vue";
import { api as R, define as L } from "@wippy-fe/proxy";
const x = { class: "imgv" }, j = {
  key: 0,
  class: "rv-state"
}, E = {
  key: 1,
  class: "rv-state err"
}, V = ["src", "alt"], w = /* @__PURE__ */ h({
  __name: "RenderImage",
  setup(v) {
    const s = g(), n = i(!1), r = i(""), t = i("");
    function u() {
      t.value && (URL.revokeObjectURL(t.value), t.value = "");
    }
    async function f() {
      r.value = "", u();
      const l = s.value?.sourceUrl;
      if (l) {
        n.value = !0;
        try {
          const { data: e } = await R.get(l, { responseType: "blob" });
          t.value = URL.createObjectURL(e);
        } catch (e) {
          r.value = e?.response?.data?.error || e?.message || "could not load image";
        } finally {
          n.value = !1;
        }
      }
    }
    return U(() => s.value?.sourceUrl, f, { immediate: !0 }), b(u), (l, e) => (o(), a("div", x, [
      n.value ? (o(), a("div", j, [
        p(c(d), {
          icon: "tabler:loader-2",
          class: "spin",
          "aria-hidden": "true"
        }),
        e[0] || (e[0] = m("span", null, "Loading image…", -1))
      ])) : r.value ? (o(), a("div", E, [
        p(c(d), {
          icon: "tabler:alert-circle",
          "aria-hidden": "true"
        }),
        m("span", null, C(r.value), 1)
      ])) : t.value ? (o(), a("img", {
        key: 2,
        src: t.value,
        alt: c(s)?.alt || ""
      }, null, 8, V)) : k("", !0)
    ]));
  }
}), B = {
  type: "object",
  properties: {
    "source-url": { type: "string", default: "", description: "URL to fetch the image bytes from (auth via proxy)." },
    alt: { type: "string", default: "", description: "Alt text." }
  }
};
class I extends y {
  static get wippyConfig() {
    return {
      propsSchema: B,
      hostCssKeys: ["themeConfigUrl"],
      inlineCss: _
    };
  }
  static get vueConfig() {
    return { rootComponent: w };
  }
}
L(import.meta.url, I);
//# sourceMappingURL=render-image.js.map

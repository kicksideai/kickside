import { u as y, W as _ } from "./wc-runtime-h8e5VJvv.js";
import { defineComponent as h, ref as i, watch as b, onBeforeUnmount as U, openBlock as o, createElementBlock as a, createVNode as p, unref as c, createElementVNode as m, toDisplayString as C, createCommentVNode as k } from "vue";
import { Icon as d } from "@iconify/vue";
import { api as R, define as x } from "@wippy-fe/proxy";
import { s as L } from "./styles-HTuIrRec.js";
const j = { class: "imgv" }, w = {
  key: 0,
  class: "rv-state"
}, E = {
  key: 1,
  class: "rv-state err"
}, V = ["src", "alt"], B = /* @__PURE__ */ h({
  __name: "RenderImage",
  setup(v) {
    const n = y(), s = i(!1), r = i(""), t = i("");
    function u() {
      t.value && (URL.revokeObjectURL(t.value), t.value = "");
    }
    async function g() {
      r.value = "", u();
      const l = n.value?.sourceUrl;
      if (l) {
        s.value = !0;
        try {
          const { data: e } = await R.get(l, { responseType: "blob" });
          t.value = URL.createObjectURL(e);
        } catch (e) {
          r.value = e?.response?.data?.error || e?.message || "could not load image";
        } finally {
          s.value = !1;
        }
      }
    }
    return b(() => n.value?.sourceUrl, g, { immediate: !0 }), U(u), (l, e) => (o(), a("div", j, [
      s.value ? (o(), a("div", w, [
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
        alt: c(n)?.alt || ""
      }, null, 8, V)) : k("", !0)
    ]));
  }
}), I = {
  type: "object",
  properties: {
    "source-url": { type: "string", default: "", description: "URL to fetch the image bytes from (auth via proxy)." },
    alt: { type: "string", default: "", description: "Alt text." }
  }
};
class f extends _ {
  static get wippyConfig() {
    return {
      propsSchema: I,
      hostCssKeys: ["themeConfigUrl"],
      inlineCss: L
    };
  }
  static get vueConfig() {
    return { rootComponent: B };
  }
}
async function A() {
  return f;
}
x(import.meta.url, f);
export {
  A as webComponent
};
//# sourceMappingURL=render-image.js.map

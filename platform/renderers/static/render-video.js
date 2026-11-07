import { u as _, W as h } from "./wc-runtime-h8e5VJvv.js";
import { defineComponent as g, ref as i, watch as b, onBeforeUnmount as U, openBlock as r, createElementBlock as a, createVNode as u, unref as d, createElementVNode as p, toDisplayString as C, createCommentVNode as k } from "vue";
import { Icon as m } from "@iconify/vue";
import { api as R, define as L } from "@wippy-fe/proxy";
import { s as V } from "./styles-HTuIrRec.js";
const x = { class: "mediav" }, j = {
  key: 0,
  class: "rv-state"
}, w = {
  key: 1,
  class: "rv-state err"
}, E = ["src"], B = /* @__PURE__ */ g({
  __name: "RenderVideo",
  setup(f) {
    const l = _(), s = i(!1), o = i(""), t = i("");
    function c() {
      t.value && (URL.revokeObjectURL(t.value), t.value = "");
    }
    async function y() {
      o.value = "", c();
      const n = l.value?.sourceUrl;
      if (n) {
        s.value = !0;
        try {
          const { data: e } = await R.get(n, { responseType: "blob" });
          t.value = URL.createObjectURL(e);
        } catch (e) {
          o.value = e?.response?.data?.error || e?.message || "could not load video";
        } finally {
          s.value = !1;
        }
      }
    }
    return b(() => l.value?.sourceUrl, y, { immediate: !0 }), U(c), (n, e) => (r(), a("div", x, [
      s.value ? (r(), a("div", j, [
        u(d(m), {
          icon: "tabler:loader-2",
          class: "spin",
          "aria-hidden": "true"
        }),
        e[0] || (e[0] = p("span", null, "Loading video…", -1))
      ])) : o.value ? (r(), a("div", w, [
        u(d(m), {
          icon: "tabler:alert-circle",
          "aria-hidden": "true"
        }),
        p("span", null, C(o.value), 1)
      ])) : t.value ? (r(), a("video", {
        key: 2,
        class: "mediav-video",
        src: t.value,
        controls: "",
        preload: "metadata"
      }, null, 8, E)) : k("", !0)
    ]));
  }
}), N = {
  type: "object",
  properties: {
    "source-url": { type: "string", default: "", description: "URL to fetch the video bytes from (auth via proxy)." }
  }
};
class v extends h {
  static get wippyConfig() {
    return {
      propsSchema: N,
      hostCssKeys: ["themeConfigUrl"],
      inlineCss: V
    };
  }
  static get vueConfig() {
    return { rootComponent: B };
  }
}
async function I() {
  return v;
}
L(import.meta.url, v);
export {
  I as webComponent
};
//# sourceMappingURL=render-video.js.map

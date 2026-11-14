import { u as _, W as h } from "./wc-runtime-h8e5VJvv.js";
import { defineComponent as g, ref as i, watch as b, onBeforeUnmount as U, openBlock as r, createElementBlock as a, createVNode as c, unref as d, createElementVNode as p, toDisplayString as C, createCommentVNode as k } from "vue";
import { Icon as m } from "@iconify/vue";
import { api as R, define as L } from "@wippy-fe/proxy";
import { s as x } from "./styles-HTuIrRec.js";
const j = { class: "mediav" }, w = {
  key: 0,
  class: "rv-state"
}, E = {
  key: 1,
  class: "rv-state err"
}, V = ["src"], B = /* @__PURE__ */ g({
  __name: "RenderAudio",
  setup(f) {
    const l = _(), s = i(!1), o = i(""), t = i("");
    function u() {
      t.value && (URL.revokeObjectURL(t.value), t.value = "");
    }
    async function y() {
      o.value = "", u();
      const n = l.value?.sourceUrl;
      if (n) {
        s.value = !0;
        try {
          const { data: e } = await R.get(n, { responseType: "blob" });
          t.value = URL.createObjectURL(e);
        } catch (e) {
          o.value = e?.response?.data?.error || e?.message || "could not load audio";
        } finally {
          s.value = !1;
        }
      }
    }
    return b(() => l.value?.sourceUrl, y, { immediate: !0 }), U(u), (n, e) => (r(), a("div", j, [
      s.value ? (r(), a("div", w, [
        c(d(m), {
          icon: "tabler:loader-2",
          class: "spin",
          "aria-hidden": "true"
        }),
        e[0] || (e[0] = p("span", null, "Loading audio…", -1))
      ])) : o.value ? (r(), a("div", E, [
        c(d(m), {
          icon: "tabler:alert-circle",
          "aria-hidden": "true"
        }),
        p("span", null, C(o.value), 1)
      ])) : t.value ? (r(), a("audio", {
        key: 2,
        class: "mediav-audio",
        src: t.value,
        controls: "",
        preload: "metadata"
      }, null, 8, V)) : k("", !0)
    ]));
  }
}), N = {
  type: "object",
  properties: {
    "source-url": { type: "string", default: "", description: "URL to fetch the audio bytes from (auth via proxy)." }
  }
};
class v extends h {
  static get wippyConfig() {
    return {
      propsSchema: N,
      hostCssKeys: ["themeConfigUrl"],
      inlineCss: x
    };
  }
  static get vueConfig() {
    return { rootComponent: B };
  }
}
async function D() {
  return v;
}
L(import.meta.url, v);
export {
  D as webComponent
};
//# sourceMappingURL=render-audio.js.map

import { u as y, W as _, s as h } from "./styles-ciEHWahf.js";
import { defineComponent as g, ref as l, watch as U, onBeforeUnmount as b, openBlock as r, createElementBlock as a, createVNode as c, unref as d, createElementVNode as p, toDisplayString as C, createCommentVNode as k } from "vue";
import { Icon as m } from "@iconify/vue";
import { api as R, define as L } from "@wippy-fe/proxy";
const j = { class: "mediav" }, x = {
  key: 0,
  class: "rv-state"
}, E = {
  key: 1,
  class: "rv-state err"
}, V = ["src"], w = /* @__PURE__ */ g({
  __name: "RenderAudio",
  setup(v) {
    const i = y(), s = l(!1), o = l(""), t = l("");
    function u() {
      t.value && (URL.revokeObjectURL(t.value), t.value = "");
    }
    async function f() {
      o.value = "", u();
      const n = i.value?.sourceUrl;
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
    return U(() => i.value?.sourceUrl, f, { immediate: !0 }), b(u), (n, e) => (r(), a("div", j, [
      s.value ? (r(), a("div", x, [
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
}), B = {
  type: "object",
  properties: {
    "source-url": { type: "string", default: "", description: "URL to fetch the audio bytes from (auth via proxy)." }
  }
};
class N extends _ {
  static get wippyConfig() {
    return {
      propsSchema: B,
      hostCssKeys: ["themeConfigUrl"],
      inlineCss: h
    };
  }
  static get vueConfig() {
    return { rootComponent: w };
  }
}
L(import.meta.url, N);
//# sourceMappingURL=render-audio.js.map

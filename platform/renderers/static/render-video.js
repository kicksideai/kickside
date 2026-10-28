import { u as y, W as _, s as h } from "./styles-mh8-6VC8.js";
import { defineComponent as g, ref as l, watch as U, onBeforeUnmount as b, openBlock as r, createElementBlock as a, createVNode as u, unref as d, createElementVNode as p, toDisplayString as C, createCommentVNode as k } from "vue";
import { Icon as v } from "@iconify/vue";
import { api as R, define as L } from "@wippy-fe/proxy";
const V = { class: "mediav" }, j = {
  key: 0,
  class: "rv-state"
}, x = {
  key: 1,
  class: "rv-state err"
}, E = ["src"], w = /* @__PURE__ */ g({
  __name: "RenderVideo",
  setup(m) {
    const i = y(), s = l(!1), o = l(""), t = l("");
    function c() {
      t.value && (URL.revokeObjectURL(t.value), t.value = "");
    }
    async function f() {
      o.value = "", c();
      const n = i.value?.sourceUrl;
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
    return U(() => i.value?.sourceUrl, f, { immediate: !0 }), b(c), (n, e) => (r(), a("div", V, [
      s.value ? (r(), a("div", j, [
        u(d(v), {
          icon: "tabler:loader-2",
          class: "spin",
          "aria-hidden": "true"
        }),
        e[0] || (e[0] = p("span", null, "Loading video…", -1))
      ])) : o.value ? (r(), a("div", x, [
        u(d(v), {
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
}), B = {
  type: "object",
  properties: {
    "source-url": { type: "string", default: "", description: "URL to fetch the video bytes from (auth via proxy)." }
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
//# sourceMappingURL=render-video.js.map

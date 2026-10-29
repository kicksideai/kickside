import { u as y, W as g, s as _ } from "./styles-C28Y9Spn.js";
import { defineComponent as x, ref as a, onMounted as C, watch as b, onBeforeUnmount as k, openBlock as i, createElementBlock as l, createVNode as p, unref as m, createElementVNode as c, toDisplayString as w, createCommentVNode as U } from "vue";
import { Icon as f } from "@iconify/vue";
import { api as E, define as N } from "@wippy-fe/proxy";
const R = { class: "docxv" }, T = {
  key: 0,
  class: "rv-state"
}, V = {
  key: 1,
  class: "rv-state err"
}, W = /* @__PURE__ */ x({
  __name: "RenderDocx",
  setup(v) {
    const u = y(), n = a(!1), t = a(""), r = a(null);
    async function d() {
      t.value = "";
      const s = u.value?.sourceUrl, e = r.value;
      if (e && (e.innerHTML = ""), !(!s || !e)) {
        n.value = !0;
        try {
          const { renderAsync: o } = await import("./docx-preview-CtPnTDgT.js"), { data: h } = await E.get(s, { responseType: "blob" });
          await o(h, e, void 0, {
            className: "docx",
            inWrapper: !0,
            ignoreWidth: !1,
            ignoreHeight: !1,
            breakPages: !0,
            experimental: !0
          });
        } catch (o) {
          t.value = o?.response?.data?.error || o?.message || "could not render document";
        } finally {
          n.value = !1;
        }
      }
    }
    return C(d), b(() => u.value?.sourceUrl, d), k(() => {
      r.value && (r.value.innerHTML = "");
    }), (s, e) => (i(), l("div", R, [
      n.value ? (i(), l("div", T, [
        p(m(f), {
          icon: "tabler:loader-2",
          class: "spin",
          "aria-hidden": "true"
        }),
        e[0] || (e[0] = c("span", null, "Rendering document…", -1))
      ])) : t.value ? (i(), l("div", V, [
        p(m(f), {
          icon: "tabler:alert-circle",
          "aria-hidden": "true"
        }),
        c("span", null, w(t.value), 1)
      ])) : U("", !0),
      c("div", {
        ref_key: "host",
        ref: r,
        class: "docxv-host"
      }, null, 512)
    ]));
  }
}), B = {
  type: "object",
  properties: {
    "source-url": { type: "string", default: "", description: "URL to fetch the .docx bytes from (auth via proxy)." }
  }
};
class D extends g {
  static get wippyConfig() {
    return {
      propsSchema: B,
      hostCssKeys: ["themeConfigUrl"],
      inlineCss: _
    };
  }
  static get vueConfig() {
    return { rootComponent: W };
  }
}
N(import.meta.url, D);
//# sourceMappingURL=render-docx.js.map

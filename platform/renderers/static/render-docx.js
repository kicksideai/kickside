import { u as g, W as _ } from "./wc-runtime-h8e5VJvv.js";
import { defineComponent as x, ref as a, onMounted as C, watch as b, onBeforeUnmount as k, openBlock as i, createElementBlock as l, createVNode as d, unref as m, createElementVNode as c, toDisplayString as w, createCommentVNode as U } from "vue";
import { Icon as f } from "@iconify/vue";
import { api as E, define as N } from "@wippy-fe/proxy";
import { s as R } from "./styles-HTuIrRec.js";
const T = { class: "docxv" }, V = {
  key: 0,
  class: "rv-state"
}, W = {
  key: 1,
  class: "rv-state err"
}, B = /* @__PURE__ */ x({
  __name: "RenderDocx",
  setup(y) {
    const u = g(), n = a(!1), t = a(""), r = a(null);
    async function p() {
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
    return C(p), b(() => u.value?.sourceUrl, p), k(() => {
      r.value && (r.value.innerHTML = "");
    }), (s, e) => (i(), l("div", T, [
      n.value ? (i(), l("div", V, [
        d(m(f), {
          icon: "tabler:loader-2",
          class: "spin",
          "aria-hidden": "true"
        }),
        e[0] || (e[0] = c("span", null, "Rendering document…", -1))
      ])) : t.value ? (i(), l("div", W, [
        d(m(f), {
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
}), D = {
  type: "object",
  properties: {
    "source-url": { type: "string", default: "", description: "URL to fetch the .docx bytes from (auth via proxy)." }
  }
};
class v extends _ {
  static get wippyConfig() {
    return {
      propsSchema: D,
      hostCssKeys: ["themeConfigUrl"],
      inlineCss: R
    };
  }
  static get vueConfig() {
    return { rootComponent: B };
  }
}
async function j() {
  return v;
}
N(import.meta.url, v);
export {
  j as webComponent
};
//# sourceMappingURL=render-docx.js.map

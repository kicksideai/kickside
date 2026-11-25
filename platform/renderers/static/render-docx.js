import { u as x, W as C } from "./wc-runtime-soyJW63L.js";
import { defineComponent as b, ref as a, onMounted as k, watch as w, onBeforeUnmount as U, openBlock as i, createElementBlock as l, createVNode as d, unref as m, createElementVNode as c, toDisplayString as E, createCommentVNode as L } from "vue";
import { Icon as f } from "@iconify/vue";
import { api as N, define as R } from "@wippy-fe/proxy";
import { s as T } from "./styles-HTuIrRec.js";
const V = { class: "docxv" }, W = {
  key: 0,
  class: "rv-state"
}, B = {
  key: 1,
  class: "rv-state err"
}, D = /* @__PURE__ */ b({
  __name: "RenderDocx",
  setup(h) {
    const u = x(), n = a(!1), t = a(""), o = a(null);
    async function p() {
      t.value = "";
      const s = u.value?.sourceUrl, e = o.value;
      if (e && (e.innerHTML = ""), !(!s || !e)) {
        n.value = !0;
        try {
          const [{ defaultOptions: r, renderAsync: y }, { documentLinkFactory: g }] = await Promise.all([
            import("./docx-preview-CMyzyHb_.js"),
            import("./links-7T67xoOU.js")
          ]), { data: _ } = await N.get(s, { responseType: "blob" });
          await y(_, e, void 0, {
            className: "docx",
            inWrapper: !0,
            ignoreWidth: !1,
            ignoreHeight: !1,
            breakPages: !0,
            experimental: !0,
            h: g(r.h, e)
          });
        } catch (r) {
          t.value = r?.response?.data?.error || r?.message || "could not render document";
        } finally {
          n.value = !1;
        }
      }
    }
    return k(p), w(() => u.value?.sourceUrl, p), U(() => {
      o.value && (o.value.innerHTML = "");
    }), (s, e) => (i(), l("div", V, [
      n.value ? (i(), l("div", W, [
        d(m(f), {
          icon: "tabler:loader-2",
          class: "spin",
          "aria-hidden": "true"
        }),
        e[0] || (e[0] = c("span", null, "Rendering document…", -1))
      ])) : t.value ? (i(), l("div", B, [
        d(m(f), {
          icon: "tabler:alert-circle",
          "aria-hidden": "true"
        }),
        c("span", null, E(t.value), 1)
      ])) : L("", !0),
      c("div", {
        ref_key: "host",
        ref: o,
        class: "docxv-host"
      }, null, 512)
    ]));
  }
}), H = {
  type: "object",
  properties: {
    "source-url": { type: "string", default: "", description: "URL to fetch the .docx bytes from (auth via proxy)." }
  }
};
class v extends C {
  static get wippyConfig() {
    return {
      propsSchema: H,
      hostCssKeys: ["themeConfigUrl"],
      inlineCss: T
    };
  }
  static get vueConfig() {
    return { rootComponent: D };
  }
}
async function F() {
  return v;
}
R(import.meta.url, v);
export {
  F as webComponent
};
//# sourceMappingURL=render-docx.js.map

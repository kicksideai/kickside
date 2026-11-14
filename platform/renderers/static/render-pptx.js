import { u as S, W as U } from "./wc-runtime-h8e5VJvv.js";
import { defineComponent as H, ref as o, onMounted as N, watch as g, onBeforeUnmount as P, openBlock as c, createElementBlock as u, createVNode as p, unref as d, createElementVNode as a, toDisplayString as _, Fragment as V, normalizeStyle as w, createCommentVNode as W, nextTick as B } from "vue";
import { Icon as v } from "@iconify/vue";
import { api as D, define as I } from "@wippy-fe/proxy";
import { s as M } from "./styles-HTuIrRec.js";
const z = { class: "pptxv" }, F = {
  key: 0,
  class: "rv-state"
}, j = {
  key: 1,
  class: "rv-state err"
}, K = ["innerHTML"], O = { class: "pptxv-nav" }, $ = ["disabled"], q = { class: "pptxv-count" }, A = ["disabled"], x = 960, y = 540, G = /* @__PURE__ */ H({
  __name: "RenderPptx",
  setup(k) {
    const b = S(), f = o(!1), i = o(""), n = o([]), t = o(0), l = o(null), m = o(1);
    let r = null;
    function h() {
      const e = l.value?.clientWidth;
      e && e > 0 && (m.value = e / x);
    }
    async function T() {
      i.value = "", n.value = [], t.value = 0;
      const e = b.value?.sourceUrl;
      if (e) {
        f.value = !0;
        try {
          const { data: s } = await D.get(e, { responseType: "arraybuffer" }), { pptxToHtml: R } = await import("./index-Dtzr2iRB.js");
          n.value = await R(s, { width: x, height: y, scaleToFit: !0 }), await B(), h();
        } catch (s) {
          i.value = s?.response?.data?.error || s?.message || "could not render presentation";
        } finally {
          f.value = !1;
        }
      }
    }
    function E() {
      t.value > 0 && t.value--;
    }
    function L() {
      t.value < n.value.length - 1 && t.value++;
    }
    return N(() => {
      r = new ResizeObserver(h), l.value && r.observe(l.value);
    }), g(() => b.value?.sourceUrl, T, { immediate: !0 }), g(l, (e) => {
      e && r && (r.observe(e), h());
    }), P(() => {
      r?.disconnect(), r = null, n.value = [];
    }), (e, s) => (c(), u("div", z, [
      f.value ? (c(), u("div", F, [
        p(d(v), {
          icon: "tabler:loader-2",
          class: "spin",
          "aria-hidden": "true"
        }),
        s[0] || (s[0] = a("span", null, "Rendering slides…", -1))
      ])) : i.value ? (c(), u("div", j, [
        p(d(v), {
          icon: "tabler:alert-circle",
          "aria-hidden": "true"
        }),
        a("span", null, _(i.value), 1)
      ])) : n.value.length ? (c(), u(V, { key: 2 }, [
        a("div", {
          ref_key: "frame",
          ref: l,
          class: "pptxv-frame",
          style: w({ height: y * m.value + "px" })
        }, [
          a("div", {
            class: "pptxv-stage",
            style: w({ width: x + "px", height: y + "px", transform: `scale(${m.value})` }),
            innerHTML: n.value[t.value]
          }, null, 12, K)
        ], 4),
        a("div", O, [
          a("button", {
            class: "pptxv-btn",
            disabled: t.value === 0,
            "aria-label": "Previous slide",
            onClick: E
          }, [
            p(d(v), {
              icon: "tabler:chevron-left",
              "aria-hidden": "true"
            })
          ], 8, $),
          a("span", q, _(t.value + 1) + " / " + _(n.value.length), 1),
          a("button", {
            class: "pptxv-btn",
            disabled: t.value >= n.value.length - 1,
            "aria-label": "Next slide",
            onClick: L
          }, [
            p(d(v), {
              icon: "tabler:chevron-right",
              "aria-hidden": "true"
            })
          ], 8, A)
        ])
      ], 64)) : W("", !0)
    ]));
  }
}), J = {
  type: "object",
  properties: {
    "source-url": { type: "string", default: "", description: "URL to fetch the .pptx bytes from (auth via proxy)." }
  }
};
class C extends U {
  static get wippyConfig() {
    return {
      propsSchema: J,
      hostCssKeys: ["themeConfigUrl"],
      inlineCss: M
    };
  }
  static get vueConfig() {
    return { rootComponent: G };
  }
}
async function te() {
  return C;
}
I(import.meta.url, C);
export {
  te as webComponent
};
//# sourceMappingURL=render-pptx.js.map

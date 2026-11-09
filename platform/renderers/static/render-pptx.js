import { u as R, W as S, s as U } from "./styles-C28Y9Spn.js";
import { defineComponent as H, ref as l, onMounted as N, watch as b, onBeforeUnmount as P, openBlock as c, createElementBlock as u, createVNode as p, unref as d, createElementVNode as n, toDisplayString as _, Fragment as V, normalizeStyle as w, createCommentVNode as W, nextTick as B } from "vue";
import { Icon as v } from "@iconify/vue";
import { api as D, define as I } from "@wippy-fe/proxy";
const M = { class: "pptxv" }, z = {
  key: 0,
  class: "rv-state"
}, F = {
  key: 1,
  class: "rv-state err"
}, j = ["innerHTML"], K = { class: "pptxv-nav" }, O = ["disabled"], $ = { class: "pptxv-count" }, q = ["disabled"], g = 960, x = 540, A = /* @__PURE__ */ H({
  __name: "RenderPptx",
  setup(C) {
    const y = R(), f = l(!1), i = l(""), a = l([]), t = l(0), o = l(null), h = l(1);
    let r = null;
    function m() {
      const e = o.value?.clientWidth;
      e && e > 0 && (h.value = e / g);
    }
    async function k() {
      i.value = "", a.value = [], t.value = 0;
      const e = y.value?.sourceUrl;
      if (e) {
        f.value = !0;
        try {
          const { data: s } = await D.get(e, { responseType: "arraybuffer" }), { pptxToHtml: L } = await import("./index-Dtzr2iRB.js");
          a.value = await L(s, { width: g, height: x, scaleToFit: !0 }), await B(), m();
        } catch (s) {
          i.value = s?.response?.data?.error || s?.message || "could not render presentation";
        } finally {
          f.value = !1;
        }
      }
    }
    function T() {
      t.value > 0 && t.value--;
    }
    function E() {
      t.value < a.value.length - 1 && t.value++;
    }
    return N(() => {
      r = new ResizeObserver(m), o.value && r.observe(o.value);
    }), b(() => y.value?.sourceUrl, k, { immediate: !0 }), b(o, (e) => {
      e && r && (r.observe(e), m());
    }), P(() => {
      r?.disconnect(), r = null, a.value = [];
    }), (e, s) => (c(), u("div", M, [
      f.value ? (c(), u("div", z, [
        p(d(v), {
          icon: "tabler:loader-2",
          class: "spin",
          "aria-hidden": "true"
        }),
        s[0] || (s[0] = n("span", null, "Rendering slides…", -1))
      ])) : i.value ? (c(), u("div", F, [
        p(d(v), {
          icon: "tabler:alert-circle",
          "aria-hidden": "true"
        }),
        n("span", null, _(i.value), 1)
      ])) : a.value.length ? (c(), u(V, { key: 2 }, [
        n("div", {
          ref_key: "frame",
          ref: o,
          class: "pptxv-frame",
          style: w({ height: x * h.value + "px" })
        }, [
          n("div", {
            class: "pptxv-stage",
            style: w({ width: g + "px", height: x + "px", transform: `scale(${h.value})` }),
            innerHTML: a.value[t.value]
          }, null, 12, j)
        ], 4),
        n("div", K, [
          n("button", {
            class: "pptxv-btn",
            disabled: t.value === 0,
            "aria-label": "Previous slide",
            onClick: T
          }, [
            p(d(v), {
              icon: "tabler:chevron-left",
              "aria-hidden": "true"
            })
          ], 8, O),
          n("span", $, _(t.value + 1) + " / " + _(a.value.length), 1),
          n("button", {
            class: "pptxv-btn",
            disabled: t.value >= a.value.length - 1,
            "aria-label": "Next slide",
            onClick: E
          }, [
            p(d(v), {
              icon: "tabler:chevron-right",
              "aria-hidden": "true"
            })
          ], 8, q)
        ])
      ], 64)) : W("", !0)
    ]));
  }
}), G = {
  type: "object",
  properties: {
    "source-url": { type: "string", default: "", description: "URL to fetch the .pptx bytes from (auth via proxy)." }
  }
};
class J extends S {
  static get wippyConfig() {
    return {
      propsSchema: G,
      hostCssKeys: ["themeConfigUrl"],
      inlineCss: U
    };
  }
  static get vueConfig() {
    return { rootComponent: A };
  }
}
I(import.meta.url, J);
//# sourceMappingURL=render-pptx.js.map

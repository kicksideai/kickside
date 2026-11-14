import { u as C, W as x } from "./wc-runtime-h8e5VJvv.js";
import { defineComponent as w, ref as n, watch as b, onBeforeUnmount as k, openBlock as l, createElementBlock as i, createVNode as p, unref as d, createElementVNode as f, toDisplayString as H, normalizeStyle as L, createCommentVNode as T } from "vue";
import { Icon as v } from "@iconify/vue";
import { api as U, define as E } from "@wippy-fe/proxy";
import { s as M } from "./styles-HTuIrRec.js";
const S = { class: "htmlv" }, V = {
  key: 0,
  class: "rv-state"
}, B = {
  key: 1,
  class: "rv-state err"
}, N = ["srcdoc"], R = /* @__PURE__ */ w({
  __name: "RenderHtml",
  setup(h) {
    const s = C(), c = n(!1), a = n(""), t = n(""), u = n(null), m = n(420);
    async function g() {
      a.value = "";
      const o = s.value?.source;
      if (typeof o == "string" && o.trim()) {
        t.value = o;
        return;
      }
      const e = s.value?.sourceUrl;
      if (!e) {
        t.value = "";
        return;
      }
      c.value = !0;
      try {
        const { data: r } = await U.get(e, { responseType: "text" });
        t.value = typeof r == "string" ? r : String(r ?? "");
      } catch (r) {
        a.value = r?.response?.data?.error || r?.message || "could not load document";
      } finally {
        c.value = !1;
      }
    }
    function _() {
      const o = u.value;
      try {
        const e = o?.contentDocument?.body?.scrollHeight;
        e && e > 0 && (m.value = Math.min(e + 24, 2e4));
      } catch {
      }
    }
    return b(() => [s.value?.source, s.value?.sourceUrl], g, { immediate: !0 }), k(() => {
      t.value = "";
    }), (o, e) => (l(), i("div", S, [
      c.value ? (l(), i("div", V, [
        p(d(v), {
          icon: "tabler:loader-2",
          class: "spin",
          "aria-hidden": "true"
        }),
        e[0] || (e[0] = f("span", null, "Loading…", -1))
      ])) : a.value ? (l(), i("div", B, [
        p(d(v), {
          icon: "tabler:alert-circle",
          "aria-hidden": "true"
        }),
        f("span", null, H(a.value), 1)
      ])) : t.value ? (l(), i("iframe", {
        key: 2,
        ref_key: "frame",
        ref: u,
        class: "htmlv-frame",
        sandbox: "allow-same-origin",
        srcdoc: t.value,
        style: L({ height: m.value + "px" }),
        title: "HTML preview",
        onLoad: _
      }, null, 44, N)) : T("", !0)
    ]));
  }
}), D = {
  type: "object",
  properties: {
    source: { type: "string", default: "", description: "Inline HTML document to render." },
    "source-url": { type: "string", default: "", description: "URL to fetch the HTML from (auth via proxy) when source is empty." }
  }
};
class y extends x {
  static get wippyConfig() {
    return {
      propsSchema: D,
      hostCssKeys: ["themeConfigUrl"],
      inlineCss: M
    };
  }
  static get vueConfig() {
    return { rootComponent: R };
  }
}
async function P() {
  return y;
}
E(import.meta.url, y);
export {
  P as webComponent
};
//# sourceMappingURL=render-html.js.map

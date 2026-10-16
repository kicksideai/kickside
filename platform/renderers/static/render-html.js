import { u as _, W as C, s as x } from "./styles-ciEHWahf.js";
import { defineComponent as k, ref as n, watch as w, onBeforeUnmount as H, openBlock as l, createElementBlock as i, createVNode as d, unref as p, createElementVNode as f, toDisplayString as L, normalizeStyle as b, createCommentVNode as T } from "vue";
import { Icon as v } from "@iconify/vue";
import { api as U, define as E } from "@wippy-fe/proxy";
const M = { class: "htmlv" }, S = {
  key: 0,
  class: "rv-state"
}, V = {
  key: 1,
  class: "rv-state err"
}, B = ["srcdoc"], N = /* @__PURE__ */ k({
  __name: "RenderHtml",
  setup(h) {
    const s = _(), c = n(!1), a = n(""), t = n(""), u = n(null), m = n(420);
    async function y() {
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
    function g() {
      const o = u.value;
      try {
        const e = o?.contentDocument?.body?.scrollHeight;
        e && e > 0 && (m.value = Math.min(e + 24, 2e4));
      } catch {
      }
    }
    return w(() => [s.value?.source, s.value?.sourceUrl], y, { immediate: !0 }), H(() => {
      t.value = "";
    }), (o, e) => (l(), i("div", M, [
      c.value ? (l(), i("div", S, [
        d(p(v), {
          icon: "tabler:loader-2",
          class: "spin",
          "aria-hidden": "true"
        }),
        e[0] || (e[0] = f("span", null, "Loading…", -1))
      ])) : a.value ? (l(), i("div", V, [
        d(p(v), {
          icon: "tabler:alert-circle",
          "aria-hidden": "true"
        }),
        f("span", null, L(a.value), 1)
      ])) : t.value ? (l(), i("iframe", {
        key: 2,
        ref_key: "frame",
        ref: u,
        class: "htmlv-frame",
        sandbox: "allow-same-origin",
        srcdoc: t.value,
        style: b({ height: m.value + "px" }),
        title: "HTML preview",
        onLoad: g
      }, null, 44, B)) : T("", !0)
    ]));
  }
}), R = {
  type: "object",
  properties: {
    source: { type: "string", default: "", description: "Inline HTML document to render." },
    "source-url": { type: "string", default: "", description: "URL to fetch the HTML from (auth via proxy) when source is empty." }
  }
};
class D extends C {
  static get wippyConfig() {
    return {
      propsSchema: R,
      hostCssKeys: ["themeConfigUrl"],
      inlineCss: x
    };
  }
  static get vueConfig() {
    return { rootComponent: N };
  }
}
E(import.meta.url, D);
//# sourceMappingURL=render-html.js.map

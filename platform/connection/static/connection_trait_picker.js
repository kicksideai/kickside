import { u as T, a as w, b as V, r as B, C as x, W as A, s as I, P as L } from "./styles-FbmmpE4z.js";
import { defineComponent as O, ref as l, computed as u, watch as _, onMounted as U, resolveComponent as $, openBlock as t, createElementBlock as i, createElementVNode as y, toDisplayString as p, createBlock as j, createCommentVNode as a, normalizeClass as M } from "vue";
import { api as W, loadByTagName as z, define as D } from "@wippy-fe/proxy";
import "@iconify/vue";
const J = { class: "connpick" }, K = { class: "connpick-field" }, R = {
  key: 1,
  class: "connpick-hint"
}, q = {
  key: 2,
  class: "connpick-error"
}, F = {
  key: 3,
  class: "connpick-error"
}, G = /* @__PURE__ */ O({
  __name: "ConnectionTraitPicker",
  setup(C) {
    const v = T(), g = w(), s = l([]), o = l(""), d = l(!1), r = l(""), n = u(() => v.value.provider || ""), k = u(() => v.value.label || (n.value ? `${n.value} connection` : "Connection")), m = u(() => s.value.find((e) => e.component_id === o.value)), h = u(() => JSON.stringify({ connection_id: o.value }));
    _(
      () => v.value.config,
      (e) => {
        o.value = e?.connection_id || "";
      },
      { immediate: !0 }
    ), _(n, () => P(), { immediate: !0 });
    function f(e) {
      return e ? B(e.connection_state, e.expires_at) : "";
    }
    function b(e) {
      const c = f(e);
      return c ? x[c] : "";
    }
    function E() {
      g("config-changed", { connection_id: o.value || void 0 });
    }
    function N(e) {
      const c = e.detail;
      o.value = c?.connection_id || "", E();
    }
    async function P() {
      if (!n.value) {
        s.value = [];
        return;
      }
      d.value = !0, r.value = "";
      try {
        const { data: e } = await W.get(`/api/v1/connections?provider=${encodeURIComponent(n.value)}&limit=100`);
        s.value = e?.connections ?? [];
      } catch (e) {
        r.value = V(e);
      } finally {
        d.value = !1;
      }
    }
    return U(() => {
      z("wc-connection-picker", { timeoutMs: 8e3 }).catch(() => {
      });
    }), (e, c) => {
      const S = $("wc-connection-picker");
      return t(), i("div", J, [
        y("label", K, [
          y("span", null, p(k.value), 1),
          n.value ? (t(), j(S, {
            key: 0,
            source: "/api/v1/connections",
            providers: n.value,
            "reply-only": "false",
            placeholder: "Auto-select default",
            value: h.value,
            onChange: N
          }, null, 8, ["providers", "value"])) : a("", !0)
        ]),
        m.value ? (t(), i("div", {
          key: 0,
          class: M(["connpick-meta", `state-${f(m.value)}`])
        }, p(b(m.value)), 3)) : a("", !0),
        n.value && !s.value.length && !d.value ? (t(), i("p", R, "No " + p(n.value) + " connection yet.", 1)) : a("", !0),
        n.value ? a("", !0) : (t(), i("p", q, "Connection provider is not configured for this capability.")),
        r.value ? (t(), i("p", F, p(r.value), 1)) : a("", !0)
      ]);
    };
  }
}), H = {
  type: "object",
  properties: {
    // config carries { connection_id } as a JSON object; the host parser only
    // needs the top-level type here (WippyPropDefinition has no nested schema).
    config: { type: "object" },
    provider: { type: "string" },
    label: { type: "string" }
  }
};
class Q extends A {
  static get wippyConfig() {
    return {
      propsSchema: H,
      hostCssKeys: ["themeConfigUrl", "primeVueCssUrl"],
      inlineCss: I
    };
  }
  static get vueConfig() {
    return { rootComponent: G, plugins: [L] };
  }
}
D(import.meta.url, Q);
//# sourceMappingURL=connection_trait_picker.js.map

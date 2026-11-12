import { defineComponent as w, ref as s, computed as u, watch as f, onMounted as B, resolveComponent as T, openBlock as o, createElementBlock as a, createElementVNode as k, toDisplayString as v, createBlock as x, createCommentVNode as i, normalizeClass as A } from "vue";
import { api as I, loadByTagName as L } from "@wippy-fe/proxy";
import { a as O, r as P, C as V } from "./status-DezpiH2d.js";
import { a as $, u as M } from "./wc-runtime-KO3cNuNo.js";
const z = { class: "connpick" }, D = { class: "connpick-field" }, J = {
  key: 1,
  class: "connpick-hint"
}, R = {
  key: 2,
  class: "connpick-error"
}, U = {
  key: 3,
  class: "connpick-error"
}, K = /* @__PURE__ */ w({
  __name: "ConnectionTraitPicker",
  setup(j) {
    const p = $(), h = M(), l = s([]), t = s(""), d = s(!1), r = s(""), n = u(() => p.value.provider || ""), y = u(() => p.value.label || (n.value ? `${n.value} connection` : "Connection")), _ = u(() => l.value.find((e) => e.component_id === t.value)), C = u(() => JSON.stringify({ connection_id: t.value }));
    f(
      () => p.value.config,
      (e) => {
        t.value = e?.connection_id || "";
      },
      { immediate: !0 }
    ), f(n, () => b(), { immediate: !0 });
    function m(e) {
      return e ? P(e.connection_state, e.expires_at) : "";
    }
    function g(e) {
      const c = m(e);
      return c ? V[c] : "";
    }
    function N() {
      h("config-changed", { connection_id: t.value || void 0 });
    }
    function E(e) {
      const c = e.detail;
      t.value = c?.connection_id || "", N();
    }
    async function b() {
      if (!n.value) {
        l.value = [];
        return;
      }
      d.value = !0, r.value = "";
      try {
        const { data: e } = await I.get(`/api/v1/connections?provider=${encodeURIComponent(n.value)}&limit=100`);
        l.value = e?.connections ?? [];
      } catch (e) {
        r.value = O(e);
      } finally {
        d.value = !1;
      }
    }
    return B(() => {
      L("wc-connection-picker", { timeoutMs: 8e3 }).catch(() => {
      });
    }), (e, c) => {
      const S = T("wc-connection-picker");
      return o(), a("div", z, [
        k("label", D, [
          k("span", null, v(y.value), 1),
          n.value ? (o(), x(S, {
            key: 0,
            source: "/api/v1/connections",
            providers: n.value,
            "reply-only": "false",
            placeholder: "Auto-select default",
            value: C.value,
            onChange: E
          }, null, 8, ["providers", "value"])) : i("", !0)
        ]),
        _.value ? (o(), a("div", {
          key: 0,
          class: A(["connpick-meta", `state-${m(_.value)}`])
        }, v(g(_.value)), 3)) : i("", !0),
        n.value && !l.value.length && !d.value ? (o(), a("p", J, "No " + v(n.value) + " connection yet.", 1)) : i("", !0),
        n.value ? i("", !0) : (o(), a("p", R, "Connection provider is not configured for this capability.")),
        r.value ? (o(), a("p", U, v(r.value), 1)) : i("", !0)
      ]);
    };
  }
});
export {
  K as default
};
//# sourceMappingURL=ConnectionTraitPicker-3eGysQg5.js.map

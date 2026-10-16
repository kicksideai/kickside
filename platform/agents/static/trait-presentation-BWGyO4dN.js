import { defineComponent as B, ref as b, onMounted as M, watch as A, onBeforeUnmount as O, openBlock as g, createElementBlock as y, createElementVNode as T, nextTick as P } from "vue";
import { loadByTagName as N } from "@wippy-fe/proxy";
import { _ as W } from "./_plugin-vue_export-helper-CHgC5LLL.js";
const j = { class: "kx-wcmount" }, G = {
  key: 0,
  class: "kx-wcmount-fail",
  role: "alert"
}, H = /* @__PURE__ */ B({
  __name: "WcMount",
  props: {
    tag: {},
    config: {},
    schema: {},
    meta: {},
    provider: {},
    label: {},
    attrs: {}
  },
  emits: ["change", "created", "close", "error"],
  setup(s, { emit: c }) {
    const t = s, i = c, l = b(null), u = b(!1);
    let o = null, f = 0;
    const d = /* @__PURE__ */ new Set();
    function m(e) {
      e.composedPath()[0] === o && (e.stopPropagation(), i("change", e.detail));
    }
    function v(e) {
      return e.composedPath()[0] !== o ? !1 : (e.stopPropagation(), !0);
    }
    function E(e) {
      v(e) && i("created", e.detail);
    }
    function k(e) {
      v(e) && i("close", e.detail);
    }
    function _(e) {
      v(e) && i("error", e.detail);
    }
    function p(e) {
      if (typeof e == "string") return e;
      try {
        return JSON.stringify(e ?? {});
      } catch {
        return null;
      }
    }
    function L() {
      if (!o) return;
      const e = p(t.config);
      if (e !== null && o.setAttribute("config", e), t.schema !== void 0 && t.schema !== null) {
        const n = p(t.schema);
        n !== null && o.setAttribute("schema", n);
      }
      if (t.meta !== void 0 && t.meta !== null) {
        const n = p(t.meta);
        n !== null && o.setAttribute("meta", n);
      }
      t.provider && o.setAttribute("provider", t.provider), t.label && o.setAttribute("label", t.label);
      const a = t.attrs || {};
      for (const n of [...d])
        (!(n in a) || a[n] == null) && (o.removeAttribute(n), d.delete(n));
      for (const [n, r] of Object.entries(a)) {
        if (r == null) continue;
        const x = typeof r == "object" ? p(r) : String(r);
        x !== null && (o.setAttribute(n, x), d.add(n));
      }
    }
    function w(e = o) {
      e && (e.removeEventListener("config-changed", m), e.removeEventListener("change", m), e.removeEventListener("created", E), e.removeEventListener("close", k), e.removeEventListener("error", _), e === o && (o = null), d.clear());
    }
    async function C(e) {
      if (!customElements.get(e))
        try {
          await N(e, { timeoutMs: 8e3 });
        } catch {
        }
    }
    async function h() {
      const e = ++f, a = l.value, n = t.tag;
      if (u.value = !1, !!a && (w(), a.innerHTML = "", !!n))
        try {
          if (await C(n), e !== f || l.value !== a || t.tag !== n) return;
          const r = document.createElement(n);
          r.classList.add("kx-wcmount-surface"), o = r, L(), r.addEventListener("config-changed", m), r.addEventListener("change", m), r.addEventListener("created", E), r.addEventListener("close", k), r.addEventListener("error", _), r.style.display = "block", a.appendChild(r), u.value = !customElements.get(n);
        } catch {
          e === f && (u.value = !0);
        }
    }
    async function S() {
      u.value = !1, await P(), await h();
    }
    return M(h), A(() => t.tag, h), A(() => [t.config, t.schema, t.meta, t.provider, t.label, t.attrs], L, { deep: !0 }), O(() => {
      f += 1, w();
    }), (e, a) => (g(), y("div", j, [
      u.value ? (g(), y("div", G, [
        a[0] || (a[0] = T("span", null, "This setup panel couldn’t load.", -1)),
        T("button", {
          type: "button",
          onClick: S
        }, "Try again")
      ])) : (g(), y("div", {
        key: 1,
        ref_key: "host",
        ref: l
      }, null, 512))
    ]));
  }
}), R = /* @__PURE__ */ W(H, [["__scopeId", "data-v-3ec70c11"]]), z = [
  { key: "tools", label: "tools" },
  { key: "behavior", label: "behavior" },
  { key: "memory", label: "memory" }
];
function U() {
  const s = b(/* @__PURE__ */ new Set()), c = (i) => s.value.has(i);
  function t(i) {
    const l = new Set(s.value);
    l.has(i) ? l.delete(i) : l.add(i), s.value = l;
  }
  return { collapsedTraits: s, isTraitCollapsed: c, toggleTraitCollapsed: t };
}
function V(s) {
  const c = s.affects || {};
  return c.memory ? "memory" : c.behavior ? "behavior" : c.tools ? "tools" : "plain";
}
function q(s) {
  const c = s.affects || {};
  return z.filter((t) => c[t.key]);
}
export {
  R as W,
  q as b,
  V as t,
  U as u
};
//# sourceMappingURL=trait-presentation-BWGyO4dN.js.map

import { defineComponent as M, ref as b, onMounted as O, watch as T, onBeforeUnmount as P, openBlock as g, createElementBlock as y, createElementVNode as C, nextTick as N } from "vue";
import { loadByTagName as W } from "@wippy-fe/proxy";
import { _ as j } from "./_plugin-vue_export-helper-CHgC5LLL.js";
const G = { class: "kx-wcmount" }, H = {
  key: 0,
  class: "kx-wcmount-fail",
  role: "alert"
}, z = /* @__PURE__ */ M({
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
  emits: ["change", "select", "created", "close", "error"],
  setup(i, { emit: c }) {
    const t = i, s = c, l = b(null), u = b(!1);
    let r = null, f = 0;
    const d = /* @__PURE__ */ new Set();
    function m(e) {
      e.composedPath()[0] === r && (e.stopPropagation(), s("change", e.detail));
    }
    function p(e) {
      return e.composedPath()[0] !== r ? !1 : (e.stopPropagation(), !0);
    }
    function E(e) {
      p(e) && s("select", e.detail);
    }
    function k(e) {
      p(e) && s("created", e.detail);
    }
    function L(e) {
      p(e) && s("close", e.detail);
    }
    function _(e) {
      p(e) && s("error", e.detail);
    }
    function v(e) {
      if (typeof e == "string") return e;
      try {
        return JSON.stringify(e ?? {});
      } catch {
        return null;
      }
    }
    function w() {
      if (!r) return;
      const e = v(t.config);
      if (e !== null && r.setAttribute("config", e), t.schema !== void 0 && t.schema !== null) {
        const n = v(t.schema);
        n !== null && r.setAttribute("schema", n);
      }
      if (t.meta !== void 0 && t.meta !== null) {
        const n = v(t.meta);
        n !== null && r.setAttribute("meta", n);
      }
      t.provider && r.setAttribute("provider", t.provider), t.label && r.setAttribute("label", t.label);
      const a = t.attrs || {};
      for (const n of [...d])
        (!(n in a) || a[n] == null) && (r.removeAttribute(n), d.delete(n));
      for (const [n, o] of Object.entries(a)) {
        if (o == null) continue;
        const A = typeof o == "object" ? v(o) : String(o);
        A !== null && (r.setAttribute(n, A), d.add(n));
      }
    }
    function x(e = r) {
      e && (e.removeEventListener("config-changed", m), e.removeEventListener("change", m), e.removeEventListener("select", E), e.removeEventListener("created", k), e.removeEventListener("close", L), e.removeEventListener("error", _), e === r && (r = null), d.clear());
    }
    async function S(e) {
      if (!customElements.get(e))
        try {
          await W(e, { timeoutMs: 8e3 });
        } catch {
        }
    }
    async function h() {
      const e = ++f, a = l.value, n = t.tag;
      if (u.value = !1, !!a && (x(), a.innerHTML = "", !!n))
        try {
          if (await S(n), e !== f || l.value !== a || t.tag !== n) return;
          const o = document.createElement(n);
          o.classList.add("kx-wcmount-surface"), r = o, w(), o.addEventListener("config-changed", m), o.addEventListener("change", m), o.addEventListener("select", E), o.addEventListener("created", k), o.addEventListener("close", L), o.addEventListener("error", _), o.style.display = "block", a.appendChild(o), u.value = !customElements.get(n);
        } catch {
          e === f && (u.value = !0);
        }
    }
    async function B() {
      u.value = !1, await N(), await h();
    }
    return O(h), T(() => t.tag, h), T(() => [t.config, t.schema, t.meta, t.provider, t.label, t.attrs], w, { deep: !0 }), P(() => {
      f += 1, x();
    }), (e, a) => (g(), y("div", G, [
      u.value ? (g(), y("div", H, [
        a[0] || (a[0] = C("span", null, "This setup panel couldn’t load.", -1)),
        C("button", {
          type: "button",
          onClick: B
        }, "Try again")
      ])) : (g(), y("div", {
        key: 1,
        ref_key: "host",
        ref: l
      }, null, 512))
    ]));
  }
}), U = /* @__PURE__ */ j(z, [["__scopeId", "data-v-3d6a00f1"]]), D = [
  { key: "tools", label: "tools" },
  { key: "behavior", label: "behavior" },
  { key: "memory", label: "memory" }
];
function V() {
  const i = b(/* @__PURE__ */ new Set()), c = (s) => i.value.has(s);
  function t(s) {
    const l = new Set(i.value);
    l.has(s) ? l.delete(s) : l.add(s), i.value = l;
  }
  return { collapsedTraits: i, isTraitCollapsed: c, toggleTraitCollapsed: t };
}
function q(i) {
  const c = i.affects || {};
  return c.memory ? "memory" : c.behavior ? "behavior" : c.tools ? "tools" : "plain";
}
function F(i) {
  const c = i.affects || {};
  return D.filter((t) => c[t.key]);
}
export {
  U as W,
  F as b,
  q as t,
  V as u
};
//# sourceMappingURL=trait-presentation-lBqZZyB5.js.map

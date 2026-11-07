import { defineComponent as M, ref as b, onMounted as O, watch as x, onBeforeUnmount as P, openBlock as g, createElementBlock as y, createElementVNode as C, nextTick as N } from "vue";
import { loadByTagName as j } from "@wippy-fe/proxy";
const G = { class: "kx-wcmount" }, H = {
  key: 0,
  class: "kx-wcmount-fail",
  role: "alert"
}, R = /* @__PURE__ */ M({
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
  setup(i, { emit: l }) {
    const t = i, s = l, c = b(null), u = b(!1);
    let r = null, f = 0;
    const d = /* @__PURE__ */ new Set();
    function m(e) {
      e.composedPath()[0] === r && (e.stopPropagation(), s("change", e.detail));
    }
    function v(e) {
      return e.composedPath()[0] !== r ? !1 : (e.stopPropagation(), !0);
    }
    function E(e) {
      v(e) && s("select", e.detail);
    }
    function k(e) {
      v(e) && s("created", e.detail);
    }
    function L(e) {
      v(e) && s("close", e.detail);
    }
    function w(e) {
      v(e) && s("error", e.detail);
    }
    function p(e) {
      if (typeof e == "string") return e;
      try {
        return JSON.stringify(e ?? {});
      } catch {
        return null;
      }
    }
    function A() {
      if (!r) return;
      const e = p(t.config);
      if (e !== null && r.setAttribute("config", e), t.schema !== void 0 && t.schema !== null) {
        const n = p(t.schema);
        n !== null && r.setAttribute("schema", n);
      }
      if (t.meta !== void 0 && t.meta !== null) {
        const n = p(t.meta);
        n !== null && r.setAttribute("meta", n);
      }
      t.provider && r.setAttribute("provider", t.provider), t.label && r.setAttribute("label", t.label);
      const a = t.attrs || {};
      for (const n of [...d])
        (!(n in a) || a[n] == null) && (r.removeAttribute(n), d.delete(n));
      for (const [n, o] of Object.entries(a)) {
        if (o == null) continue;
        const _ = typeof o == "object" ? p(o) : String(o);
        _ !== null && (r.setAttribute(n, _), d.add(n));
      }
    }
    function T(e = r) {
      e && (e.removeEventListener("config-changed", m), e.removeEventListener("change", m), e.removeEventListener("select", E), e.removeEventListener("created", k), e.removeEventListener("close", L), e.removeEventListener("error", w), e === r && (r = null), d.clear());
    }
    async function S(e) {
      if (!customElements.get(e))
        try {
          await j(e, { timeoutMs: 8e3 });
        } catch {
        }
    }
    async function h() {
      const e = ++f, a = c.value, n = t.tag;
      if (u.value = !1, !!a && (T(), a.innerHTML = "", !!n))
        try {
          if (await S(n), e !== f || c.value !== a || t.tag !== n) return;
          const o = document.createElement(n);
          o.classList.add("kx-wcmount-surface"), r = o, A(), o.addEventListener("config-changed", m), o.addEventListener("change", m), o.addEventListener("select", E), o.addEventListener("created", k), o.addEventListener("close", L), o.addEventListener("error", w), o.style.display = "block", a.appendChild(o), u.value = !customElements.get(n);
        } catch {
          e === f && (u.value = !0);
        }
    }
    async function B() {
      u.value = !1, await N(), await h();
    }
    return O(h), x(() => t.tag, h), x(() => [t.config, t.schema, t.meta, t.provider, t.label, t.attrs], A, { deep: !0 }), P(() => {
      f += 1, T();
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
        ref: c
      }, null, 512))
    ]));
  }
}), z = [
  { key: "tools", label: "tools" },
  { key: "behavior", label: "behavior" },
  { key: "memory", label: "memory" }
];
function U() {
  const i = b(/* @__PURE__ */ new Set()), l = (s) => i.value.has(s);
  function t(s) {
    const c = new Set(i.value);
    c.has(s) ? c.delete(s) : c.add(s), i.value = c;
  }
  return { collapsedTraits: i, isTraitCollapsed: l, toggleTraitCollapsed: t };
}
function V(i) {
  const l = i.affects || {};
  return l.memory ? "memory" : l.behavior ? "behavior" : l.tools ? "tools" : "plain";
}
function W(i) {
  const l = i.affects || {};
  return z.filter((t) => l[t.key]);
}
export {
  R as _,
  W as b,
  V as t,
  U as u
};
//# sourceMappingURL=trait-presentation-DrlnUF8R.js.map

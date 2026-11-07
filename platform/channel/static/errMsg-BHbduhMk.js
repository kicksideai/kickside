import { defineComponent as B, ref as A, onMounted as P, watch as C, onBeforeUnmount as S, openBlock as h, createElementBlock as y, createElementVNode as M, nextTick as N } from "vue";
import { loadByTagName as O } from "@wippy-fe/proxy";
const W = { class: "kx-wcmount" }, H = {
  key: 0,
  class: "kx-wcmount-fail",
  role: "alert"
}, z = /* @__PURE__ */ B({
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
  setup(a, { emit: c }) {
    const t = a, r = c, l = A(null), u = A(!1);
    let s = null, f = 0;
    const d = /* @__PURE__ */ new Set();
    function m(e) {
      e.composedPath()[0] === s && (e.stopPropagation(), r("change", e.detail));
    }
    function p(e) {
      return e.composedPath()[0] !== s ? !1 : (e.stopPropagation(), !0);
    }
    function E(e) {
      p(e) && r("select", e.detail);
    }
    function b(e) {
      p(e) && r("created", e.detail);
    }
    function _(e) {
      p(e) && r("close", e.detail);
    }
    function k(e) {
      p(e) && r("error", e.detail);
    }
    function v(e) {
      if (typeof e == "string") return e;
      try {
        return JSON.stringify(e ?? {});
      } catch {
        return null;
      }
    }
    function L() {
      if (!s) return;
      const e = v(t.config);
      if (e !== null && s.setAttribute("config", e), t.schema !== void 0 && t.schema !== null) {
        const n = v(t.schema);
        n !== null && s.setAttribute("schema", n);
      }
      if (t.meta !== void 0 && t.meta !== null) {
        const n = v(t.meta);
        n !== null && s.setAttribute("meta", n);
      }
      t.provider && s.setAttribute("provider", t.provider), t.label && s.setAttribute("label", t.label);
      const i = t.attrs || {};
      for (const n of [...d])
        (!(n in i) || i[n] == null) && (s.removeAttribute(n), d.delete(n));
      for (const [n, o] of Object.entries(i)) {
        if (o == null) continue;
        const w = typeof o == "object" ? v(o) : String(o);
        w !== null && (s.setAttribute(n, w), d.add(n));
      }
    }
    function x(e = s) {
      e && (e.removeEventListener("config-changed", m), e.removeEventListener("change", m), e.removeEventListener("select", E), e.removeEventListener("created", b), e.removeEventListener("close", _), e.removeEventListener("error", k), e === s && (s = null), d.clear());
    }
    async function T(e) {
      if (!customElements.get(e))
        try {
          await O(e, { timeoutMs: 8e3 });
        } catch {
        }
    }
    async function g() {
      const e = ++f, i = l.value, n = t.tag;
      if (u.value = !1, !!i && (x(), i.innerHTML = "", !!n))
        try {
          if (await T(n), e !== f || l.value !== i || t.tag !== n) return;
          const o = document.createElement(n);
          o.classList.add("kx-wcmount-surface"), s = o, L(), o.addEventListener("config-changed", m), o.addEventListener("change", m), o.addEventListener("select", E), o.addEventListener("created", b), o.addEventListener("close", _), o.addEventListener("error", k), o.style.display = "block", i.appendChild(o), u.value = !customElements.get(n);
        } catch {
          e === f && (u.value = !0);
        }
    }
    async function j() {
      u.value = !1, await N(), await g();
    }
    return P(g), C(() => t.tag, g), C(() => [t.config, t.schema, t.meta, t.provider, t.label, t.attrs], L, { deep: !0 }), S(() => {
      f += 1, x();
    }), (e, i) => (h(), y("div", W, [
      u.value ? (h(), y("div", H, [
        i[0] || (i[0] = M("span", null, "This setup panel couldn’t load.", -1)),
        M("button", {
          type: "button",
          onClick: j
        }, "Try again")
      ])) : (h(), y("div", {
        key: 1,
        ref_key: "host",
        ref: l
      }, null, 512))
    ]));
  }
}), G = (a, c) => {
  const t = a.__vccOpts || a;
  for (const [r, l] of c)
    t[r] = l;
  return t;
}, R = /* @__PURE__ */ G(z, [["__scopeId", "data-v-3d6a00f1"]]);
function U(a, c) {
  if (a && typeof a == "object") {
    const t = a, r = t.response?.data?.error;
    if (typeof r == "string") return r;
    if (r && typeof r == "object" && typeof r.message == "string")
      return r.message;
    if (typeof t.message == "string" && t.message) return t.message;
  }
  return c;
}
export {
  R as W,
  U as e
};
//# sourceMappingURL=errMsg-BHbduhMk.js.map

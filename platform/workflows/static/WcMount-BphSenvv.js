import { defineComponent as P, ref as A, onMounted as S, watch as C, onBeforeUnmount as N, openBlock as h, createElementBlock as y, createElementVNode as T, nextTick as O } from "vue";
import { loadByTagName as W } from "@wippy-fe/proxy";
const j = { class: "kx-wcmount" }, H = {
  key: 0,
  class: "kx-wcmount-fail",
  role: "alert"
}, z = /* @__PURE__ */ P({
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
  setup(l, { emit: v }) {
    const t = l, s = v, a = A(null), c = A(!1);
    let r = null, u = 0;
    const f = /* @__PURE__ */ new Set();
    function d(e) {
      e.composedPath()[0] === r && (e.stopPropagation(), s("change", e.detail));
    }
    function m(e) {
      return e.composedPath()[0] !== r ? !1 : (e.stopPropagation(), !0);
    }
    function E(e) {
      m(e) && s("select", e.detail);
    }
    function b(e) {
      m(e) && s("created", e.detail);
    }
    function _(e) {
      m(e) && s("close", e.detail);
    }
    function k(e) {
      m(e) && s("error", e.detail);
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
      const i = t.attrs || {};
      for (const n of [...f])
        (!(n in i) || i[n] == null) && (r.removeAttribute(n), f.delete(n));
      for (const [n, o] of Object.entries(i)) {
        if (o == null) continue;
        const x = typeof o == "object" ? p(o) : String(o);
        x !== null && (r.setAttribute(n, x), f.add(n));
      }
    }
    function w(e = r) {
      e && (e.removeEventListener("config-changed", d), e.removeEventListener("change", d), e.removeEventListener("select", E), e.removeEventListener("created", b), e.removeEventListener("close", _), e.removeEventListener("error", k), e === r && (r = null), f.clear());
    }
    async function M(e) {
      if (!customElements.get(e))
        try {
          await W(e, { timeoutMs: 8e3 });
        } catch {
        }
    }
    async function g() {
      const e = ++u, i = a.value, n = t.tag;
      if (c.value = !1, !!i && (w(), i.innerHTML = "", !!n))
        try {
          if (await M(n), e !== u || a.value !== i || t.tag !== n) return;
          const o = document.createElement(n);
          o.classList.add("kx-wcmount-surface"), r = o, L(), o.addEventListener("config-changed", d), o.addEventListener("change", d), o.addEventListener("select", E), o.addEventListener("created", b), o.addEventListener("close", _), o.addEventListener("error", k), o.style.display = "block", i.appendChild(o), c.value = !customElements.get(n);
        } catch {
          e === u && (c.value = !0);
        }
    }
    async function B() {
      c.value = !1, await O(), await g();
    }
    return S(g), C(() => t.tag, g), C(() => [t.config, t.schema, t.meta, t.provider, t.label, t.attrs], L, { deep: !0 }), N(() => {
      u += 1, w();
    }), (e, i) => (h(), y("div", j, [
      c.value ? (h(), y("div", H, [
        i[0] || (i[0] = T("span", null, "This setup panel couldn’t load.", -1)),
        T("button", {
          type: "button",
          onClick: B
        }, "Try again")
      ])) : (h(), y("div", {
        key: 1,
        ref_key: "host",
        ref: a
      }, null, 512))
    ]));
  }
}), G = (l, v) => {
  const t = l.__vccOpts || l;
  for (const [s, a] of v)
    t[s] = a;
  return t;
}, R = /* @__PURE__ */ G(z, [["__scopeId", "data-v-3d6a00f1"]]);
export {
  R as W,
  G as _
};

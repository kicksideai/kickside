import { defineComponent as B, ref as x, onMounted as P, watch as A, onBeforeUnmount as N, openBlock as h, createElementBlock as y, createElementVNode as C, nextTick as O } from "vue";
import { loadByTagName as S } from "@wippy-fe/proxy";
const W = { class: "kx-wcmount" }, j = {
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
  setup(l, { emit: p }) {
    const t = l, a = p, s = x(null), c = x(!1);
    let o = null, u = 0;
    const f = /* @__PURE__ */ new Set();
    function d(e) {
      e.composedPath()[0] === o && (e.stopPropagation(), a("change", e.detail));
    }
    function v(e) {
      return e.composedPath()[0] !== o ? !1 : (e.stopPropagation(), !0);
    }
    function b(e) {
      v(e) && a("created", e.detail);
    }
    function E(e) {
      v(e) && a("close", e.detail);
    }
    function _(e) {
      v(e) && a("error", e.detail);
    }
    function m(e) {
      if (typeof e == "string") return e;
      try {
        return JSON.stringify(e ?? {});
      } catch {
        return null;
      }
    }
    function k() {
      if (!o) return;
      const e = m(t.config);
      if (e !== null && o.setAttribute("config", e), t.schema !== void 0 && t.schema !== null) {
        const n = m(t.schema);
        n !== null && o.setAttribute("schema", n);
      }
      if (t.meta !== void 0 && t.meta !== null) {
        const n = m(t.meta);
        n !== null && o.setAttribute("meta", n);
      }
      t.provider && o.setAttribute("provider", t.provider), t.label && o.setAttribute("label", t.label);
      const i = t.attrs || {};
      for (const n of [...f])
        (!(n in i) || i[n] == null) && (o.removeAttribute(n), f.delete(n));
      for (const [n, r] of Object.entries(i)) {
        if (r == null) continue;
        const w = typeof r == "object" ? m(r) : String(r);
        w !== null && (o.setAttribute(n, w), f.add(n));
      }
    }
    function L(e = o) {
      e && (e.removeEventListener("config-changed", d), e.removeEventListener("change", d), e.removeEventListener("created", b), e.removeEventListener("close", E), e.removeEventListener("error", _), e === o && (o = null), f.clear());
    }
    async function T(e) {
      if (!customElements.get(e))
        try {
          await S(e, { timeoutMs: 8e3 });
        } catch {
        }
    }
    async function g() {
      const e = ++u, i = s.value, n = t.tag;
      if (c.value = !1, !!i && (L(), i.innerHTML = "", !!n))
        try {
          if (await T(n), e !== u || s.value !== i || t.tag !== n) return;
          const r = document.createElement(n);
          r.classList.add("kx-wcmount-surface"), o = r, k(), r.addEventListener("config-changed", d), r.addEventListener("change", d), r.addEventListener("created", b), r.addEventListener("close", E), r.addEventListener("error", _), r.style.display = "block", i.appendChild(r), c.value = !customElements.get(n);
        } catch {
          e === u && (c.value = !0);
        }
    }
    async function M() {
      c.value = !1, await O(), await g();
    }
    return P(g), A(() => t.tag, g), A(() => [t.config, t.schema, t.meta, t.provider, t.label, t.attrs], k, { deep: !0 }), N(() => {
      u += 1, L();
    }), (e, i) => (h(), y("div", W, [
      c.value ? (h(), y("div", j, [
        i[0] || (i[0] = C("span", null, "This setup panel couldn’t load.", -1)),
        C("button", {
          type: "button",
          onClick: M
        }, "Try again")
      ])) : (h(), y("div", {
        key: 1,
        ref_key: "host",
        ref: s
      }, null, 512))
    ]));
  }
}), z = (l, p) => {
  const t = l.__vccOpts || l;
  for (const [a, s] of p)
    t[a] = s;
  return t;
}, J = /* @__PURE__ */ z(H, [["__scopeId", "data-v-b8277868"]]);
export {
  J as W
};
//# sourceMappingURL=WcMount-CoI3gyQ1.js.map

import { defineComponent as B, ref as A, onMounted as P, watch as C, onBeforeUnmount as S, openBlock as h, createElementBlock as y, createElementVNode as T, nextTick as N } from "vue";
import { loadByTagName as H } from "@wippy-fe/proxy";
function R(a, p) {
  if (a && typeof a == "object") {
    const t = a, i = t.response?.data?.error;
    if (typeof i == "string") return i;
    if (i && typeof i == "object" && typeof i.message == "string")
      return i.message;
    if (typeof t.message == "string" && t.message) return t.message;
  }
  return p;
}
const O = { class: "kx-wcmount" }, z = {
  key: 0,
  class: "kx-wcmount-fail",
  role: "alert"
}, U = /* @__PURE__ */ B({
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
  setup(a, { emit: p }) {
    const t = a, i = p, v = A(null), c = A(!1);
    let o = null, l = 0;
    const u = /* @__PURE__ */ new Set();
    function f(e) {
      e.composedPath()[0] === o && (e.stopPropagation(), i("change", e.detail));
    }
    function d(e) {
      return e.composedPath()[0] !== o ? !1 : (e.stopPropagation(), !0);
    }
    function E(e) {
      d(e) && i("select", e.detail);
    }
    function b(e) {
      d(e) && i("created", e.detail);
    }
    function L(e) {
      d(e) && i("close", e.detail);
    }
    function k(e) {
      d(e) && i("error", e.detail);
    }
    function m(e) {
      if (typeof e == "string") return e;
      try {
        return JSON.stringify(e ?? {});
      } catch {
        return null;
      }
    }
    function _() {
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
      const s = t.attrs || {};
      for (const n of [...u])
        (!(n in s) || s[n] == null) && (o.removeAttribute(n), u.delete(n));
      for (const [n, r] of Object.entries(s)) {
        if (r == null) continue;
        const x = typeof r == "object" ? m(r) : String(r);
        x !== null && (o.setAttribute(n, x), u.add(n));
      }
    }
    function w(e = o) {
      e && (e.removeEventListener("config-changed", f), e.removeEventListener("change", f), e.removeEventListener("select", E), e.removeEventListener("created", b), e.removeEventListener("close", L), e.removeEventListener("error", k), e === o && (o = null), u.clear());
    }
    async function M(e) {
      if (!customElements.get(e))
        try {
          await H(e, { timeoutMs: 8e3 });
        } catch {
        }
    }
    async function g() {
      const e = ++l, s = v.value, n = t.tag;
      if (c.value = !1, !!s && (w(), s.innerHTML = "", !!n))
        try {
          if (await M(n), e !== l || v.value !== s || t.tag !== n) return;
          const r = document.createElement(n);
          r.classList.add("kx-wcmount-surface"), o = r, _(), r.addEventListener("config-changed", f), r.addEventListener("change", f), r.addEventListener("select", E), r.addEventListener("created", b), r.addEventListener("close", L), r.addEventListener("error", k), r.style.display = "block", s.appendChild(r), c.value = !customElements.get(n);
        } catch {
          e === l && (c.value = !0);
        }
    }
    async function j() {
      c.value = !1, await N(), await g();
    }
    return P(g), C(() => t.tag, g), C(() => [t.config, t.schema, t.meta, t.provider, t.label, t.attrs], _, { deep: !0 }), S(() => {
      l += 1, w();
    }), (e, s) => (h(), y("div", O, [
      c.value ? (h(), y("div", z, [
        s[0] || (s[0] = T("span", null, "This setup panel couldn’t load.", -1)),
        T("button", {
          type: "button",
          onClick: j
        }, "Try again")
      ])) : (h(), y("div", {
        key: 1,
        ref_key: "host",
        ref: v
      }, null, 512))
    ]));
  }
});
export {
  U as _,
  R as e
};
//# sourceMappingURL=WcMount.vue_vue_type_script_setup_true_lang-DeFg3QZK.js.map

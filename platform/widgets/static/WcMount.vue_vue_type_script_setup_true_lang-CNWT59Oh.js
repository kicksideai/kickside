import { defineComponent as P, ref as w, onMounted as S, watch as A, onBeforeUnmount as N, openBlock as v, createElementBlock as h, createElementVNode as x, nextTick as j } from "vue";
import { loadByTagName as H } from "@wippy-fe/proxy";
const O = { class: "kx-wcmount" }, z = {
  key: 0,
  class: "kx-wcmount-fail",
  role: "alert"
}, R = /* @__PURE__ */ P({
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
  setup(C, { emit: T }) {
    const t = C, s = T, m = w(null), a = w(!1);
    let r = null, c = 0;
    const l = /* @__PURE__ */ new Set();
    function u(e) {
      e.composedPath()[0] === r && (e.stopPropagation(), s("change", e.detail));
    }
    function f(e) {
      return e.composedPath()[0] !== r ? !1 : (e.stopPropagation(), !0);
    }
    function g(e) {
      f(e) && s("select", e.detail);
    }
    function y(e) {
      f(e) && s("created", e.detail);
    }
    function E(e) {
      f(e) && s("close", e.detail);
    }
    function b(e) {
      f(e) && s("error", e.detail);
    }
    function d(e) {
      if (typeof e == "string") return e;
      try {
        return JSON.stringify(e ?? {});
      } catch {
        return null;
      }
    }
    function L() {
      if (!r) return;
      const e = d(t.config);
      if (e !== null && r.setAttribute("config", e), t.schema !== void 0 && t.schema !== null) {
        const n = d(t.schema);
        n !== null && r.setAttribute("schema", n);
      }
      if (t.meta !== void 0 && t.meta !== null) {
        const n = d(t.meta);
        n !== null && r.setAttribute("meta", n);
      }
      t.provider && r.setAttribute("provider", t.provider), t.label && r.setAttribute("label", t.label);
      const i = t.attrs || {};
      for (const n of [...l])
        (!(n in i) || i[n] == null) && (r.removeAttribute(n), l.delete(n));
      for (const [n, o] of Object.entries(i)) {
        if (o == null) continue;
        const _ = typeof o == "object" ? d(o) : String(o);
        _ !== null && (r.setAttribute(n, _), l.add(n));
      }
    }
    function k(e = r) {
      e && (e.removeEventListener("config-changed", u), e.removeEventListener("change", u), e.removeEventListener("select", g), e.removeEventListener("created", y), e.removeEventListener("close", E), e.removeEventListener("error", b), e === r && (r = null), l.clear());
    }
    async function B(e) {
      if (!customElements.get(e))
        try {
          await H(e, { timeoutMs: 8e3 });
        } catch {
        }
    }
    async function p() {
      const e = ++c, i = m.value, n = t.tag;
      if (a.value = !1, !!i && (k(), i.innerHTML = "", !!n))
        try {
          if (await B(n), e !== c || m.value !== i || t.tag !== n) return;
          const o = document.createElement(n);
          o.classList.add("kx-wcmount-surface"), r = o, L(), o.addEventListener("config-changed", u), o.addEventListener("change", u), o.addEventListener("select", g), o.addEventListener("created", y), o.addEventListener("close", E), o.addEventListener("error", b), o.style.display = "block", i.appendChild(o), a.value = !customElements.get(n);
        } catch {
          e === c && (a.value = !0);
        }
    }
    async function M() {
      a.value = !1, await j(), await p();
    }
    return S(p), A(() => t.tag, p), A(() => [t.config, t.schema, t.meta, t.provider, t.label, t.attrs], L, { deep: !0 }), N(() => {
      c += 1, k();
    }), (e, i) => (v(), h("div", O, [
      a.value ? (v(), h("div", z, [
        i[0] || (i[0] = x("span", null, "This setup panel couldn’t load.", -1)),
        x("button", {
          type: "button",
          onClick: M
        }, "Try again")
      ])) : (v(), h("div", {
        key: 1,
        ref_key: "host",
        ref: m
      }, null, 512))
    ]));
  }
});
export {
  R as _
};
//# sourceMappingURL=WcMount.vue_vue_type_script_setup_true_lang-CNWT59Oh.js.map

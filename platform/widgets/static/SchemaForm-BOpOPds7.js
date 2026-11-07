import { defineComponent as P, ref as S, useId as W, watch as R, openBlock as a, createElementBlock as l, Fragment as w, createElementVNode as k, unref as E, normalizeClass as $, toDisplayString as b, createCommentVNode as x, computed as C, renderList as j, createTextVNode as T, createBlock as O } from "vue";
import { a as z, u as D } from "./wc-runtime-CNDpK4lj.js";
import { W as B } from "./WcMount-N7EOK1cC.js";
function I(p, h) {
  if (Object.is(p, h)) return !0;
  if (!p || !h || typeof p != "object" || typeof h != "object") return !1;
  if (Array.isArray(p) || Array.isArray(h))
    return Array.isArray(p) && Array.isArray(h) && p.length === h.length && p.every((m, y) => I(m, h[y]));
  const c = p, g = h, _ = Object.keys(c);
  return _.length === Object.keys(g).length && _.every((m) => Object.hasOwn(g, m) && I(c[m], g[m]));
}
const G = ["rows", "value", "placeholder", "aria-invalid", "aria-describedby"], H = ["id"], M = /* @__PURE__ */ P({
  __name: "StructuredValueField",
  props: {
    value: {},
    fallback: {},
    kind: {},
    rows: { default: 7 },
    placeholder: { default: "" }
  },
  emits: ["change"],
  setup(p, { emit: h }) {
    const c = p, g = h;
    function _() {
      return c.kind === "array" ? [] : {};
    }
    function m(o) {
      return c.kind === "array" ? Array.isArray(o) : !!o && typeof o == "object" && !Array.isArray(o);
    }
    function y() {
      return m(c.value) ? c.value : m(c.fallback) ? c.fallback : _();
    }
    function A(o) {
      try {
        return JSON.stringify(o, null, 2);
      } catch {
        return JSON.stringify(_(), null, 2);
      }
    }
    const s = S(A(y())), u = S(""), q = W();
    let d = y();
    R(() => [c.value, c.fallback, c.kind], () => {
      const o = y();
      I(o, d) || (d = o, s.value = A(o), u.value = "");
    });
    function f(o) {
      s.value = o;
      let v;
      try {
        v = JSON.parse(o);
      } catch {
        u.value = "That isn’t valid JSON. Check commas, quotes, and brackets.";
        return;
      }
      if (!m(v)) {
        u.value = `Enter a JSON ${c.kind}.`;
        return;
      }
      u.value = "", !I(v, d) && (d = v, g("change", v));
    }
    return (o, v) => (a(), l(w, null, [
      k("textarea", {
        class: $(["sf-input sf-textarea sf-structured", u.value && "is-invalid"]),
        rows: p.rows,
        value: s.value,
        placeholder: p.placeholder,
        "aria-invalid": u.value ? "true" : void 0,
        "aria-describedby": u.value ? E(q) : void 0,
        spellcheck: "false",
        onInput: v[0] || (v[0] = (N) => f(N.target.value))
      }, null, 42, G),
      u.value ? (a(), l("span", {
        key: 0,
        id: E(q),
        class: "sf-error",
        role: "alert"
      }, b(u.value), 9, H)) : x("", !0)
    ], 64));
  }
}), K = { class: "sf" }, Q = { class: "sf-lbl" }, U = {
  key: 0,
  class: "sf-req"
}, X = ["required", "value", "onChange"], Y = ["value"], Z = ["required", "minlength", "maxlength", "rows", "value", "placeholder", "onInput"], ee = ["checked", "onChange"], te = ["required", "min", "max", "step", "value", "onInput"], ne = ["type", "required", "minlength", "maxlength", "value", "placeholder", "onInput"], re = {
  key: 7,
  class: "sf-hint"
}, ae = {
  key: 0,
  class: "sf-advanced"
}, le = { class: "sf-advanced-body" }, ue = { class: "sf-lbl" }, se = {
  key: 0,
  class: "sf-req"
}, ie = ["required", "value", "onChange"], oe = ["value"], ce = ["required", "minlength", "maxlength", "rows", "value", "placeholder", "onInput"], de = ["checked", "onChange"], pe = ["required", "min", "max", "step", "value", "onInput"], he = ["type", "required", "minlength", "maxlength", "value", "placeholder", "onInput"], me = {
  key: 7,
  class: "sf-hint"
}, ye = /* @__PURE__ */ P({
  __name: "SchemaForm",
  setup(p) {
    const h = z(), c = D(), g = C(() => {
      const n = h.value.schema;
      if (typeof n == "string")
        try {
          return JSON.parse(n);
        } catch {
          return {};
        }
      return n || {};
    }), _ = C(() => Object.entries(g.value.properties || {})), m = C(() => _.value.filter(([, n]) => n.group !== "advanced")), y = C(() => _.value.filter(([, n]) => n.group === "advanced")), A = C(() => new Set(g.value.required || [])), s = S({});
    R(() => h.value.config, (n) => {
      s.value = { ...n };
    }, { immediate: !0, flush: "sync" });
    function u(n, i) {
      I(s.value[n], i) || (s.value = { ...s.value, [n]: i }, c("config-changed", s.value));
    }
    function q(n) {
      return n.format === "password" ? "password" : n.format === "date" ? "date" : "text";
    }
    function d(n, i) {
      return A.value.has(n) || i.required === !0;
    }
    function f(n) {
      const i = Number(n.rows);
      return Number.isFinite(i) && i >= 1 ? Math.floor(i) : 4;
    }
    function o(n) {
      const i = typeof n.picker == "string" ? n.picker.trim() : "";
      return i === "wc-schema-form" ? "" : i;
    }
    function v(n, i) {
      return { properties: { [n]: i } };
    }
    function N(n) {
      return {
        ...n.class ? { thread_class: n.class } : {},
        ...n.title ? { title: n.title } : {}
      };
    }
    function L(n) {
      return typeof n.provider == "string" ? n.provider.trim() : "";
    }
    function V(n) {
      return typeof n.title == "string" ? n.title.trim() : "";
    }
    function F(n) {
      return g.value.properties?.[n]?.value_field ? { [n]: s.value[n] } : { thread_id: s.value[n] ?? "" };
    }
    function J(n, i) {
      if (i && typeof i == "object") {
        const t = i;
        return t[n] ?? t.thread_id ?? t.id ?? t.value ?? "";
      }
      return i ?? "";
    }
    return (n, i) => (a(), l("div", K, [
      (a(!0), l(w, null, j(m.value, ([t, e]) => (a(), l("label", {
        key: t,
        class: "sf-field"
      }, [
        k("span", Q, [
          T(b(e.title || t), 1),
          d(t, e) ? (a(), l("span", U, " *")) : x("", !0)
        ]),
        o(e) ? (a(), O(B, {
          key: 0,
          tag: o(e),
          schema: v(t, e),
          config: F(t),
          meta: N(e),
          provider: L(e),
          label: V(e),
          onChange: (r) => u(t, J(t, r))
        }, null, 8, ["tag", "schema", "config", "meta", "provider", "label", "onChange"])) : e.enum ? (a(), l("select", {
          key: 1,
          class: "sf-input",
          required: d(t, e),
          value: s.value[t] ?? e.default ?? "",
          onChange: (r) => u(t, r.target.value)
        }, [
          (a(!0), l(w, null, j(e.enum, (r) => (a(), l("option", {
            key: r,
            value: r
          }, b(r), 9, Y))), 128))
        ], 40, X)) : e.format === "textarea" ? (a(), l("textarea", {
          key: 2,
          class: "sf-input sf-textarea",
          required: d(t, e),
          minlength: e.minLength,
          maxlength: e.maxLength,
          rows: f(e),
          value: s.value[t] ?? e.default ?? "",
          placeholder: e.description || "",
          onInput: (r) => u(t, r.target.value)
        }, null, 40, Z)) : e.type === "object" || e.type === "array" ? (a(), O(M, {
          key: 3,
          value: s.value[t],
          fallback: e.default,
          kind: e.type,
          rows: f(e),
          placeholder: e.description || "",
          onChange: (r) => u(t, r)
        }, null, 8, ["value", "fallback", "kind", "rows", "placeholder", "onChange"])) : e.type === "boolean" ? (a(), l("input", {
          key: 4,
          class: "sf-check",
          type: "checkbox",
          checked: !!(s.value[t] ?? e.default),
          onChange: (r) => u(t, r.target.checked)
        }, null, 40, ee)) : e.type === "number" || e.type === "integer" ? (a(), l("input", {
          key: 5,
          class: "sf-input",
          type: "number",
          required: d(t, e),
          min: e.minimum,
          max: e.maximum,
          step: e.type === "integer" ? 1 : "any",
          value: s.value[t] ?? e.default ?? "",
          onInput: (r) => u(t, r.target.value === "" ? void 0 : Number(r.target.value))
        }, null, 40, te)) : (a(), l("input", {
          key: 6,
          class: "sf-input",
          type: q(e),
          required: d(t, e),
          minlength: e.minLength,
          maxlength: e.maxLength,
          value: s.value[t] ?? e.default ?? "",
          placeholder: e.description || "",
          onInput: (r) => u(t, r.target.value)
        }, null, 40, ne)),
        e.description ? (a(), l("span", re, b(e.description), 1)) : x("", !0)
      ]))), 128)),
      y.value.length ? (a(), l("details", ae, [
        i[0] || (i[0] = k("summary", { class: "sf-advanced-summary" }, "Advanced", -1)),
        k("div", le, [
          (a(!0), l(w, null, j(y.value, ([t, e]) => (a(), l("label", {
            key: t,
            class: "sf-field"
          }, [
            k("span", ue, [
              T(b(e.title || t), 1),
              d(t, e) ? (a(), l("span", se, " *")) : x("", !0)
            ]),
            o(e) ? (a(), O(B, {
              key: 0,
              tag: o(e),
              schema: v(t, e),
              config: F(t),
              meta: N(e),
              provider: L(e),
              label: V(e),
              onChange: (r) => u(t, J(t, r))
            }, null, 8, ["tag", "schema", "config", "meta", "provider", "label", "onChange"])) : e.enum ? (a(), l("select", {
              key: 1,
              class: "sf-input",
              required: d(t, e),
              value: s.value[t] ?? e.default ?? "",
              onChange: (r) => u(t, r.target.value)
            }, [
              (a(!0), l(w, null, j(e.enum, (r) => (a(), l("option", {
                key: r,
                value: r
              }, b(r), 9, oe))), 128))
            ], 40, ie)) : e.format === "textarea" ? (a(), l("textarea", {
              key: 2,
              class: "sf-input sf-textarea",
              required: d(t, e),
              minlength: e.minLength,
              maxlength: e.maxLength,
              rows: f(e),
              value: s.value[t] ?? e.default ?? "",
              placeholder: e.description || "",
              onInput: (r) => u(t, r.target.value)
            }, null, 40, ce)) : e.type === "object" || e.type === "array" ? (a(), O(M, {
              key: 3,
              value: s.value[t],
              fallback: e.default,
              kind: e.type,
              rows: f(e),
              placeholder: e.description || "",
              onChange: (r) => u(t, r)
            }, null, 8, ["value", "fallback", "kind", "rows", "placeholder", "onChange"])) : e.type === "boolean" ? (a(), l("input", {
              key: 4,
              class: "sf-check",
              type: "checkbox",
              checked: !!(s.value[t] ?? e.default),
              onChange: (r) => u(t, r.target.checked)
            }, null, 40, de)) : e.type === "number" || e.type === "integer" ? (a(), l("input", {
              key: 5,
              class: "sf-input",
              type: "number",
              required: d(t, e),
              min: e.minimum,
              max: e.maximum,
              step: e.type === "integer" ? 1 : "any",
              value: s.value[t] ?? e.default ?? "",
              onInput: (r) => u(t, r.target.value === "" ? void 0 : Number(r.target.value))
            }, null, 40, pe)) : (a(), l("input", {
              key: 6,
              class: "sf-input",
              type: q(e),
              required: d(t, e),
              minlength: e.minLength,
              maxlength: e.maxLength,
              value: s.value[t] ?? e.default ?? "",
              placeholder: e.description || "",
              onInput: (r) => u(t, r.target.value)
            }, null, 40, he)),
            e.description ? (a(), l("span", me, b(e.description), 1)) : x("", !0)
          ]))), 128))
        ])
      ])) : x("", !0)
    ]));
  }
});
export {
  ye as default
};
//# sourceMappingURL=SchemaForm-BOpOPds7.js.map

import { defineComponent as P, ref as L, watch as k, openBlock as c, createElementBlock as p, computed as O, useId as Y, onMounted as ee, withModifiers as te, Fragment as T, renderList as U, createBlock as $, resolveDynamicComponent as R, normalizeClass as B, withCtx as D, createCommentVNode as j, createElementVNode as re, createTextVNode as ne, toDisplayString as q, unref as ae, mergeProps as A } from "vue";
import { u as se, a as oe } from "./wc-runtime-Vcu3yWjv.js";
import { _ as ie } from "./WcMount.vue_vue_type_script_setup_true_lang-CNWT59Oh.js";
function y(s, a) {
  if (Object.is(s, a)) return !0;
  if (!s || !a || typeof s != "object" || typeof a != "object") return !1;
  if (Array.isArray(s) || Array.isArray(a))
    return Array.isArray(s) && Array.isArray(a) && s.length === a.length && s.every((d, _) => y(d, a[_]));
  const l = s, u = a, h = Object.keys(l);
  return h.length === Object.keys(u).length && h.every((d) => Object.hasOwn(u, d) && y(l[d], u[d]));
}
const ue = ["rows", "value"], ce = /* @__PURE__ */ P({
  __name: "StructuredValueField",
  props: {
    value: {},
    fallback: {},
    kind: {},
    rows: { default: 7 }
  },
  emits: ["change", "error"],
  setup(s, { emit: a }) {
    const l = s, u = a;
    function h() {
      return l.kind === "array" ? [] : {};
    }
    function d(f) {
      return l.kind === "array" ? Array.isArray(f) : !!f && typeof f == "object" && !Array.isArray(f);
    }
    function _() {
      return d(l.value) ? l.value : d(l.fallback) ? l.fallback : h();
    }
    function C(f) {
      try {
        return JSON.stringify(f, null, 2);
      } catch {
        return JSON.stringify(h(), null, 2);
      }
    }
    const I = L(C(_()));
    let m = _();
    k(() => [l.value, l.fallback, l.kind], () => {
      const f = _();
      y(f, m) || (m = f, I.value = C(f), u("error", ""));
    });
    function g(f) {
      I.value = f;
      let v;
      try {
        v = JSON.parse(f);
      } catch {
        u("error", "That isn’t valid JSON. Check commas, quotes, and brackets.");
        return;
      }
      if (!d(v)) {
        u("error", `Enter a JSON ${l.kind}.`);
        return;
      }
      u("error", ""), !y(v, m) && (m = v, u("change", v));
    }
    return (f, v) => (c(), p("textarea", {
      class: "sf-input sf-textarea sf-structured",
      rows: s.rows,
      value: I.value,
      spellcheck: "false",
      onInput: v[0] || (v[0] = (b) => g(b.target.value))
    }, null, 40, ue));
  }
});
function z(s, a, l) {
  if (a == null || a === "" && l) return l ? "A value is required." : "";
  if (s.enum) return s.enum.some((u) => u === a) ? "" : "Choose one of the available values.";
  switch (s.type) {
    case "integer":
    case "number":
      return typeof a != "number" || !Number.isFinite(a) || s.type === "integer" && !Number.isInteger(a) ? s.type === "integer" ? "Enter a whole number." : "Enter a number." : s.minimum !== void 0 && a < s.minimum ? `Enter at least ${s.minimum}.` : s.maximum !== void 0 && a > s.maximum ? `Enter at most ${s.maximum}.` : "";
    case "boolean":
      return typeof a == "boolean" ? "" : "Choose on or off.";
    case "array":
      if (!Array.isArray(a)) return "Enter a JSON array.";
      if (s.minItems !== void 0 && a.length < s.minItems) return `Use at least ${s.minItems} entries.`;
      if (s.maxItems !== void 0 && a.length > s.maxItems) return `Use at most ${s.maxItems} entries.`;
      if (s.uniqueItems && a.some((u, h) => a.slice(0, h).some((d) => y(u, d))))
        return "Remove duplicate entries.";
      if (s.items)
        for (const [u, h] of a.entries()) {
          const d = z(s.items, h, !0);
          if (d) return `Entry ${u + 1}: ${d}`;
        }
      return "";
    case "object":
      return typeof a == "object" && !Array.isArray(a) ? "" : "Enter a JSON object.";
  }
  if (typeof a != "string") return "Enter text.";
  if (s.minLength !== void 0 && a.length < s.minLength) return `Enter at least ${s.minLength} characters.`;
  if (s.maxLength !== void 0 && a.length > s.maxLength) return `Enter at most ${s.maxLength} characters.`;
  if (s.pattern)
    try {
      if (!new RegExp(s.pattern).test(a)) return "Use the required format.";
    } catch {
      return "The declared format is unavailable.";
    }
  if (s.format === "date" && a) {
    const u = /* @__PURE__ */ new Date(a + "T00:00:00Z");
    if (!Number.isFinite(u.getTime()) || u.toISOString().split("T")[0] !== a) return "Enter a valid date.";
  }
  return "";
}
const le = {
  key: 0,
  class: "sf-advanced-summary"
}, de = {
  key: 0,
  class: "sf-req",
  "aria-hidden": "true"
}, me = ["value", "onChange"], pe = {
  key: 0,
  value: ""
}, fe = ["value"], ve = ["minlength", "maxlength", "rows", "value", "onInput"], he = ["checked", "onChange"], ge = ["min", "max", "step", "value", "onInput"], be = ["type", "minlength", "maxlength", "value", "onInput"], ye = ["id"], _e = ["id"], Oe = /* @__PURE__ */ P({
  __name: "SchemaForm",
  setup(s) {
    const a = se(), l = oe(), u = O(() => {
      const e = a.value.schema;
      if (typeof e == "string")
        try {
          return JSON.parse(e);
        } catch {
          return {};
        }
      return e || {};
    }), h = O(() => Object.entries(u.value.properties || {})), d = O(() => [
      { advanced: !1, fields: h.value.filter(([, e]) => e.group !== "advanced") },
      { advanced: !0, fields: h.value.filter(([, e]) => e.group === "advanced") }
    ].filter((e) => e.fields.length)), _ = Y(), C = O(() => new Map(h.value.map(([e], n) => [e, n]))), I = L(), m = L({}), g = L(/* @__PURE__ */ new Map()), f = O(() => new Set(u.value.required || []));
    k(() => a.value.config, (e) => {
      const n = { ...e };
      for (const o of g.value.keys())
        y(n[o], m.value[o]) || g.value.delete(o);
      m.value = n;
    }, { immediate: !0, flush: "sync" }), k(() => a.value.schema, (e, n) => {
      y(e, n) || g.value.clear();
    });
    function v(e, n) {
      return (Object.hasOwn(m.value, e) ? m.value[e] : void 0) ?? n.default;
    }
    const b = O(() => {
      const e = /* @__PURE__ */ new Map(), n = a.value.fieldErrors ?? {};
      for (const { fields: o } of d.value)
        for (const [t, r] of o) {
          const i = a.value.allowUnset && (!Object.hasOwn(m.value, t) || m.value[t] == null), E = g.value.get(t) || Object.hasOwn(n, t) && n[t] || (i ? "" : z(r, v(t, r), J(t, r)));
          E && e.set(t, E);
        }
      return e;
    });
    ee(() => {
      k(() => Object.fromEntries(b.value), (e, n) => {
        y(e, n) || l("validity-changed", { valid: !b.value.size, errors: e });
      }, { immediate: !0, flush: "post" });
    });
    function S(e, n) {
      if (a.value.allowUnset && n === "" && (n = void 0), y(m.value[e], n)) return;
      const o = { ...m.value, [e]: n };
      n === void 0 && a.value.allowUnset && delete o[e], m.value = o, l("config-changed", o);
    }
    function V(e, n, o = !1) {
      if (n.validity.badInput) {
        g.value.set(e, o ? "Enter a number." : "Enter a valid date.");
        return;
      }
      g.value.delete(e), S(e, o ? n.value === "" ? void 0 : Number(n.value) : n.value);
    }
    function x(e) {
      return _ + "-field-" + C.value.get(e);
    }
    function w(e, n) {
      const o = x(e), t = [n.description ? o + "-help" : "", b.value.has(e) ? o + "-error" : ""].filter(Boolean);
      return {
        id: o,
        "aria-describedby": t.join(" ") || void 0,
        "aria-invalid": b.value.has(e) ? !0 : void 0,
        "aria-required": !a.value.allowUnset && J(e, n) ? !0 : void 0
      };
    }
    function F(e) {
      const n = b.value.keys().next().value;
      if (n === void 0) return;
      e?.preventDefault();
      const o = I.value?.getRootNode(), t = o?.getElementById(x(n)), r = t?.closest("details");
      if (r && (r.open = !0), !t) return;
      const i = t.shadowRoot, E = i?.querySelector('[role="combobox"], input:not([type="hidden"]):not(:disabled), select:not(:disabled), textarea:not(:disabled)') ?? i?.querySelector('button:not(:disabled), [tabindex="0"]');
      (E ?? t).focus(), !E && o?.activeElement !== t && !t.hasAttribute("tabindex") && (t.tabIndex = -1, t.focus(), t.removeAttribute("tabindex"));
    }
    function Z(e) {
      return e.format === "password" ? "password" : e.format === "date" ? "date" : "text";
    }
    function J(e, n) {
      return f.value.has(e) || n.required === !0;
    }
    function M(e) {
      const n = Number(e.rows);
      return Number.isFinite(n) && n >= 1 ? Math.floor(n) : 4;
    }
    function N(e) {
      const n = typeof e.picker == "string" ? e.picker.trim() : "";
      return n === "wc-schema-form" ? "" : n;
    }
    function G(e, n) {
      return { properties: { [e]: n } };
    }
    function H(e) {
      return {
        ...e.class ? { thread_class: e.class } : {},
        ...e.title ? { title: e.title } : {}
      };
    }
    function K(e) {
      return typeof e.provider == "string" ? e.provider.trim() : "";
    }
    function Q(e) {
      return typeof e.title == "string" ? e.title.trim() : "";
    }
    function W(e) {
      return u.value.properties?.[e]?.value_field ? { [e]: m.value[e] } : { thread_id: m.value[e] ?? "" };
    }
    function X(e, n) {
      if (n && typeof n == "object") {
        const o = n;
        return o[e] ?? o.thread_id ?? o.id ?? o.value ?? "";
      }
      return n ?? "";
    }
    return (e, n) => (c(), p("form", {
      ref_key: "form",
      ref: I,
      class: "sf",
      novalidate: "",
      onSubmit: n[0] || (n[0] = te((o) => F(), ["prevent"])),
      onSchemaFormReport: F
    }, [
      (c(!0), p(T, null, U(d.value, (o) => (c(), $(R(o.advanced ? "details" : "div"), {
        key: String(o.advanced),
        class: B(o.advanced ? "sf-advanced" : "sf-primary")
      }, {
        default: D(() => [
          o.advanced ? (c(), p("summary", le, "Advanced")) : j("", !0),
          re("div", {
            class: B(o.advanced ? "sf-advanced-body" : "sf-primary")
          }, [
            (c(!0), p(T, null, U(o.fields, ([t, r]) => (c(), p("div", {
              key: t,
              class: "sf-field"
            }, [
              (c(), $(R(N(r) ? "span" : "label"), {
                id: x(t) + "-label",
                for: N(r) ? void 0 : x(t),
                class: "sf-lbl"
              }, {
                default: D(() => [
                  ne(q(r.title || t), 1),
                  !ae(a).allowUnset && J(t, r) ? (c(), p("span", de, " *")) : j("", !0)
                ]),
                _: 2
              }, 1032, ["id", "for"])),
              N(r) ? (c(), $(ie, {
                key: 0,
                tag: N(r),
                schema: G(t, r),
                config: W(t),
                meta: H(r),
                provider: K(r),
                label: Q(r),
                attrs: { ...w(t, r), "aria-labelledby": x(t) + "-label", role: "group" },
                onChange: (i) => S(t, X(t, i))
              }, null, 8, ["tag", "schema", "config", "meta", "provider", "label", "attrs", "onChange"])) : r.enum ? (c(), p("select", A({
                key: 1,
                ref_for: !0
              }, w(t, r), {
                class: "sf-input",
                value: v(t, r) ?? "",
                onChange: (i) => S(t, r.enum[i.target.selectedIndex - (r.enum.includes("") ? 0 : 1)])
              }), [
                r.enum.includes("") ? j("", !0) : (c(), p("option", pe, "Choose a value")),
                (c(!0), p(T, null, U(r.enum, (i, E) => (c(), p("option", {
                  key: E,
                  value: i
                }, q(i), 9, fe))), 128))
              ], 16, me)) : r.format === "textarea" ? (c(), p("textarea", A({
                key: 2,
                ref_for: !0
              }, w(t, r), {
                class: "sf-input sf-textarea",
                minlength: r.minLength,
                maxlength: r.maxLength,
                rows: M(r),
                value: String(v(t, r) ?? ""),
                onInput: (i) => V(t, i.target)
              }), null, 16, ve)) : r.type === "object" || r.type === "array" ? (c(), $(ce, A({
                key: 3,
                ref_for: !0
              }, w(t, r), {
                value: m.value[t],
                fallback: r.default,
                kind: r.type,
                rows: M(r),
                onChange: (i) => S(t, i),
                onError: (i) => g.value.set(t, i)
              }), null, 16, ["value", "fallback", "kind", "rows", "onChange", "onError"])) : r.type === "boolean" ? (c(), p("input", A({
                key: 4,
                ref_for: !0
              }, w(t, r), {
                class: "sf-check",
                type: "checkbox",
                checked: !!v(t, r),
                onChange: (i) => S(t, i.target.checked)
              }), null, 16, he)) : r.type === "number" || r.type === "integer" ? (c(), p("input", A({
                key: 5,
                ref_for: !0
              }, w(t, r), {
                class: "sf-input",
                type: "number",
                min: r.minimum,
                max: r.maximum,
                step: r.type === "integer" ? 1 : "any",
                value: v(t, r) ?? "",
                onInput: (i) => V(t, i.target, !0)
              }), null, 16, ge)) : (c(), p("input", A({
                key: 6,
                ref_for: !0
              }, w(t, r), {
                class: "sf-input",
                type: Z(r),
                minlength: r.minLength,
                maxlength: r.maxLength,
                value: v(t, r) ?? "",
                onInput: (i) => V(t, i.target)
              }), null, 16, be)),
              r.description ? (c(), p("span", {
                key: 7,
                id: x(t) + "-help",
                class: "sf-hint"
              }, q(r.description), 9, ye)) : j("", !0),
              b.value.get(t) ? (c(), p("span", {
                key: 8,
                id: x(t) + "-error",
                class: "sf-error",
                role: "alert"
              }, q(b.value.get(t)), 9, _e)) : j("", !0)
            ]))), 128))
          ], 2)
        ]),
        _: 2
      }, 1032, ["class"]))), 128))
    ], 544));
  }
});
export {
  Oe as default
};
//# sourceMappingURL=SchemaForm-ByDx381X.js.map

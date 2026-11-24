import { defineComponent as R, ref as M, watch as V, openBlock as l, createElementBlock as d, Fragment as k, renderList as q, createElementVNode as S, toDisplayString as C, withDirectives as oe, mergeProps as E, vModelText as le, computed as N, useId as ue, onMounted as ce, withModifiers as de, createBlock as L, resolveDynamicComponent as K, normalizeClass as Z, withCtx as G, createCommentVNode as $, createTextVNode as me, unref as pe } from "vue";
import { a as fe, u as he } from "./wc-runtime-BOOCbdbY.js";
import { _ as ve } from "./WcMount.vue_vue_type_script_setup_true_lang-CNWT59Oh.js";
function O(s, i) {
  if (Object.is(s, i)) return !0;
  if (!s || !i || typeof s != "object" || typeof i != "object") return !1;
  if (Array.isArray(s) || Array.isArray(i))
    return Array.isArray(s) && Array.isArray(i) && s.length === i.length && s.every((p, _) => O(p, i[_]));
  const m = s, u = i, f = Object.keys(m);
  return f.length === Object.keys(u).length && f.every((p) => Object.hasOwn(u, p) && O(m[p], u[p]));
}
const ge = ["rows", "value"], be = /* @__PURE__ */ R({
  __name: "StructuredValueField",
  props: {
    value: {},
    fallback: {},
    kind: {},
    rows: { default: 7 }
  },
  emits: ["change", "error"],
  setup(s, { emit: i }) {
    const m = s, u = i;
    function f() {
      return m.kind === "array" ? [] : {};
    }
    function p(h) {
      return m.kind === "array" ? Array.isArray(h) : !!h && typeof h == "object" && !Array.isArray(h);
    }
    function _() {
      return p(m.value) ? m.value : p(m.fallback) ? m.fallback : f();
    }
    function j(h) {
      try {
        return JSON.stringify(h, null, 2);
      } catch {
        return JSON.stringify(f(), null, 2);
      }
    }
    const g = M(j(_()));
    let c = _();
    V(() => [m.value, m.fallback, m.kind], () => {
      const h = _();
      O(h, c) || (c = h, g.value = j(h), u("error", ""));
    });
    function b(h) {
      g.value = h;
      let v;
      try {
        v = JSON.parse(h);
      } catch {
        u("error", "That isn’t valid JSON. Check commas, quotes, and brackets.");
        return;
      }
      if (!p(v)) {
        u("error", `Enter a JSON ${m.kind}.`);
        return;
      }
      u("error", ""), !O(v, c) && (c = v, u("change", v));
    }
    return (h, v) => (l(), d("textarea", {
      class: "sf-input sf-textarea sf-structured",
      rows: s.rows,
      value: g.value,
      spellcheck: "false",
      onInput: v[0] || (v[0] = (x) => b(x.target.value))
    }, null, 40, ge));
  }
}), ye = { class: "sf-list" }, _e = { class: "sf-list-chip-label" }, xe = ["aria-label", "onClick"], we = ["placeholder", "aria-roledescription"], Ae = /* @__PURE__ */ R({
  __name: "StringListField",
  props: {
    value: {},
    label: {},
    placeholder: {}
  },
  emits: ["change"],
  setup(s, { emit: i }) {
    const m = s, u = i, f = M("");
    function p() {
      const g = f.value.trim();
      f.value = "", g && u("change", [...m.value, g]);
    }
    function _(g) {
      u("change", m.value.filter((c, b) => b !== g));
    }
    function j(g) {
      g.key === "Enter" || g.key === "," ? (g.preventDefault(), p()) : g.key === "Backspace" && !f.value && m.value.length && _(m.value.length - 1);
    }
    return (g, c) => (l(), d("div", ye, [
      (l(!0), d(k, null, q(s.value, (b, h) => (l(), d("span", {
        key: h + ":" + b,
        class: "sf-list-chip"
      }, [
        S("span", _e, C(b), 1),
        S("button", {
          type: "button",
          class: "sf-list-chip-x",
          "aria-label": "Remove " + b,
          onClick: (v) => _(h)
        }, [...c[1] || (c[1] = [
          S("svg", {
            viewBox: "0 0 24 24",
            "aria-hidden": "true"
          }, [
            S("path", {
              d: "M18 6 6 18M6 6l12 12",
              fill: "none",
              stroke: "currentColor",
              "stroke-width": "2",
              "stroke-linecap": "round"
            })
          ], -1)
        ])], 8, xe)
      ]))), 128)),
      oe(S("input", E(g.$attrs, {
        "onUpdate:modelValue": c[0] || (c[0] = (b) => f.value = b),
        class: "sf-list-input",
        type: "text",
        placeholder: s.value.length ? "" : s.placeholder ?? "Type a value and press Enter",
        "aria-roledescription": "list of " + s.label.toLocaleLowerCase(),
        onKeydown: j,
        onBlur: p
      }), null, 16, we), [
        [le, f.value]
      ])
    ]));
  }
});
function Q(s, i, m) {
  if (i == null || i === "" && m) return m ? "A value is required." : "";
  if (s.enum) return s.enum.some((u) => u === i) ? "" : "Choose one of the available values.";
  switch (s.type) {
    case "integer":
    case "number":
      return typeof i != "number" || !Number.isFinite(i) || s.type === "integer" && !Number.isInteger(i) ? s.type === "integer" ? "Enter a whole number." : "Enter a number." : s.minimum !== void 0 && i < s.minimum ? `Enter at least ${s.minimum}.` : s.maximum !== void 0 && i > s.maximum ? `Enter at most ${s.maximum}.` : "";
    case "boolean":
      return typeof i == "boolean" ? "" : "Choose on or off.";
    case "array":
      if (!Array.isArray(i)) return "Enter a JSON array.";
      if (s.minItems !== void 0 && i.length < s.minItems) return `Use at least ${s.minItems} entries.`;
      if (s.maxItems !== void 0 && i.length > s.maxItems) return `Use at most ${s.maxItems} entries.`;
      if (s.uniqueItems && i.some((u, f) => i.slice(0, f).some((p) => O(u, p))))
        return "Remove duplicate entries.";
      if (s.items)
        for (const [u, f] of i.entries()) {
          const p = Q(s.items, f, !0);
          if (p) return `Entry ${u + 1}: ${p}`;
        }
      return "";
    case "object":
      return typeof i == "object" && !Array.isArray(i) ? "" : "Enter a JSON object.";
  }
  if (typeof i != "string") return "Enter text.";
  if (s.minLength !== void 0 && i.length < s.minLength) return `Enter at least ${s.minLength} characters.`;
  if (s.maxLength !== void 0 && i.length > s.maxLength) return `Enter at most ${s.maxLength} characters.`;
  if (s.pattern)
    try {
      if (!new RegExp(s.pattern).test(i)) return "Use the required format.";
    } catch {
      return "The declared format is unavailable.";
    }
  if (s.format === "date" && i) {
    const u = /* @__PURE__ */ new Date(i + "T00:00:00Z");
    if (!Number.isFinite(u.getTime()) || u.toISOString().split("T")[0] !== i) return "Enter a valid date.";
  }
  return "";
}
const Ee = {
  key: 0,
  class: "sf-advanced-summary"
}, Oe = {
  key: 1,
  class: "sf-group-title"
}, Ce = {
  key: 0,
  class: "sf-req",
  "aria-hidden": "true"
}, Se = ["value", "onChange"], Ie = {
  key: 0,
  value: ""
}, je = ["value"], Ne = ["minlength", "maxlength", "rows", "value", "onInput"], $e = ["checked", "onChange"], Le = ["checked", "onChange"], ke = ["min", "max", "step", "value", "onInput"], qe = ["type", "minlength", "maxlength", "value", "onInput"], Me = ["id"], Ue = ["id"], Ve = ["id"], Fe = /* @__PURE__ */ R({
  __name: "SchemaForm",
  setup(s) {
    const i = fe(), m = he(), u = N(() => {
      const e = i.value.schema;
      if (typeof e == "string")
        try {
          return JSON.parse(e);
        } catch {
          return {};
        }
      return e || {};
    }), f = N(() => Object.entries(u.value.properties || {})), p = N(() => {
      const e = /* @__PURE__ */ new Map();
      for (const a of f.value) {
        if (a[1].group === "advanced") continue;
        const t = typeof a[1].group == "string" ? a[1].group.trim() : "";
        e.has(t) || e.set(t, []), e.get(t).push(a);
      }
      const n = e.get("") ?? [];
      return e.delete(""), [
        { advanced: !1, title: "", fields: n },
        ...[...e].map(([a, t]) => ({ advanced: !1, title: a, fields: t })),
        { advanced: !0, title: "", fields: f.value.filter(([, a]) => a.group === "advanced") }
      ].filter((a) => a.fields.length);
    }), _ = ue(), j = N(() => new Map(f.value.map(([e], n) => [e, n]))), g = M(), c = M({}), b = M(/* @__PURE__ */ new Map()), h = N(() => new Set(u.value.required || []));
    V(() => i.value.config, (e) => {
      const n = { ...e };
      for (const a of b.value.keys())
        O(n[a], c.value[a]) || b.value.delete(a);
      c.value = n;
    }, { immediate: !0, flush: "sync" }), V(() => i.value.schema, (e, n) => {
      O(e, n) || b.value.clear();
    });
    function v(e, n) {
      return (Object.hasOwn(c.value, e) ? c.value[e] : void 0) ?? n.default;
    }
    const x = N(() => {
      const e = /* @__PURE__ */ new Map(), n = i.value.fieldErrors ?? {};
      for (const { fields: a } of p.value)
        for (const [t, r] of a) {
          const o = i.value.allowUnset && (!Object.hasOwn(c.value, t) || c.value[t] == null), y = b.value.get(t) || Object.hasOwn(n, t) && n[t] || (o ? "" : Q(r, v(t, r), B(t, r)));
          y && e.set(t, y);
        }
      return e;
    });
    ce(() => {
      V(() => Object.fromEntries(x.value), (e, n) => {
        O(e, n) || m("validity-changed", { valid: !x.value.size, errors: e });
      }, { immediate: !0, flush: "post" });
    });
    function I(e, n) {
      if (i.value.allowUnset && n === "" && (n = void 0), O(c.value[e], n)) return;
      const a = { ...c.value, [e]: n };
      n === void 0 && i.value.allowUnset && delete a[e], c.value = a, m("config-changed", a);
    }
    function T(e, n, a = !1) {
      if (n.validity.badInput) {
        b.value.set(e, a ? "Enter a number." : "Enter a valid date.");
        return;
      }
      b.value.delete(e), I(e, a ? n.value === "" ? void 0 : Number(n.value) : n.value);
    }
    function w(e) {
      return _ + "-field-" + j.value.get(e);
    }
    function A(e, n) {
      const a = w(e), t = [n.description ? a + "-help" : "", F(e, n) ? a + "-default" : "", x.value.has(e) ? a + "-error" : ""].filter(Boolean);
      return {
        id: a,
        "aria-describedby": t.join(" ") || void 0,
        "aria-invalid": x.value.has(e) ? !0 : void 0,
        "aria-required": !i.value.allowUnset && B(e, n) ? !0 : void 0
      };
    }
    function D(e) {
      const n = x.value.keys().next().value;
      if (n === void 0) return;
      e?.preventDefault();
      const a = g.value?.getRootNode(), t = a?.getElementById(w(n)), r = t?.closest("details");
      if (r && (r.open = !0), !t) return;
      const o = t.shadowRoot, y = o?.querySelector('[role="combobox"], input:not([type="hidden"]):not(:disabled), select:not(:disabled), textarea:not(:disabled)') ?? o?.querySelector('button:not(:disabled), [tabindex="0"]');
      (y ?? t).focus(), !y && a?.activeElement !== t && !t.hasAttribute("tabindex") && (t.tabIndex = -1, t.focus(), t.removeAttribute("tabindex"));
    }
    function W(e) {
      return e.format === "password" ? "password" : e.format === "date" ? "date" : "text";
    }
    function B(e, n) {
      return h.value.has(e) || n.required === !0;
    }
    function X(e) {
      return e.type === "array" && e.items?.type === "string" && !e.items.enum;
    }
    function J(e) {
      return e.type === "array" && Array.isArray(e.items?.enum);
    }
    function P(e, n) {
      const a = v(e, n);
      return Array.isArray(a) ? a.map(String) : [];
    }
    function Y(e, n, a, t) {
      const r = Array.isArray(v(e, n)) ? v(e, n) : [], o = (n.items?.enum ?? []).filter((y) => y === a ? t : r.includes(y));
      I(e, o);
    }
    function ee(e) {
      return typeof e == "boolean" ? e ? "On" : "Off" : Array.isArray(e) ? e.length ? e.join(", ") : "None" : e && typeof e == "object" ? JSON.stringify(e) : String(e);
    }
    function F(e, n) {
      return Object.hasOwn(c.value, e) && c.value[e] != null ? "" : n.default !== void 0 ? "Default: " + ee(n.default) : i.value.allowUnset ? "Uses the application setting." : "";
    }
    function z(e) {
      const n = Number(e.rows);
      return Number.isFinite(n) && n >= 1 ? Math.floor(n) : 4;
    }
    function U(e) {
      const n = typeof e.picker == "string" ? e.picker.trim() : "";
      return n === "wc-schema-form" ? "" : n;
    }
    function te(e, n) {
      return { properties: { [e]: n } };
    }
    function re(e) {
      return {
        ...e.class ? { thread_class: e.class } : {},
        ...e.title ? { title: e.title } : {}
      };
    }
    function ne(e) {
      return typeof e.provider == "string" ? e.provider.trim() : "";
    }
    function ae(e) {
      return typeof e.title == "string" ? e.title.trim() : "";
    }
    function se(e) {
      return u.value.properties?.[e]?.value_field ? { [e]: c.value[e] } : { thread_id: c.value[e] ?? "" };
    }
    function ie(e, n) {
      if (n && typeof n == "object") {
        const a = n;
        return a[e] ?? a.thread_id ?? a.id ?? a.value ?? "";
      }
      return n ?? "";
    }
    return (e, n) => (l(), d("form", {
      ref_key: "form",
      ref: g,
      class: "sf",
      novalidate: "",
      onSubmit: n[0] || (n[0] = de((a) => D(), ["prevent"])),
      onSchemaFormReport: D
    }, [
      (l(!0), d(k, null, q(p.value, (a) => (l(), L(K(a.advanced ? "details" : a.title ? "fieldset" : "div"), {
        key: a.advanced + a.title,
        class: Z(a.advanced ? "sf-advanced" : a.title ? "sf-group" : "sf-primary")
      }, {
        default: G(() => [
          a.advanced ? (l(), d("summary", Ee, "Advanced")) : a.title ? (l(), d("legend", Oe, C(a.title), 1)) : $("", !0),
          S("div", {
            class: Z(a.advanced ? "sf-advanced-body" : a.title ? "sf-group-body" : "sf-primary")
          }, [
            (l(!0), d(k, null, q(a.fields, ([t, r]) => (l(), d("div", {
              key: t,
              class: "sf-field"
            }, [
              (l(), L(K(U(r) || J(r) ? "span" : "label"), {
                id: w(t) + "-label",
                for: U(r) || J(r) ? void 0 : w(t),
                class: "sf-lbl"
              }, {
                default: G(() => [
                  me(C(r.title || t), 1),
                  !pe(i).allowUnset && B(t, r) ? (l(), d("span", Ce, " *")) : $("", !0)
                ]),
                _: 2
              }, 1032, ["id", "for"])),
              U(r) ? (l(), L(ve, {
                key: 0,
                tag: U(r),
                schema: te(t, r),
                config: se(t),
                meta: re(r),
                provider: ne(r),
                label: ae(r),
                attrs: { ...A(t, r), "aria-labelledby": w(t) + "-label", role: "group" },
                onChange: (o) => I(t, ie(t, o))
              }, null, 8, ["tag", "schema", "config", "meta", "provider", "label", "attrs", "onChange"])) : r.enum ? (l(), d("select", E({
                key: 1,
                ref_for: !0
              }, A(t, r), {
                class: "sf-input",
                value: v(t, r) ?? "",
                onChange: (o) => I(t, r.enum[o.target.selectedIndex - (r.enum.includes("") ? 0 : 1)])
              }), [
                r.enum.includes("") ? $("", !0) : (l(), d("option", Ie, "Choose a value")),
                (l(!0), d(k, null, q(r.enum, (o, y) => (l(), d("option", {
                  key: y,
                  value: o
                }, C(o), 9, je))), 128))
              ], 16, Se)) : r.format === "textarea" ? (l(), d("textarea", E({
                key: 2,
                ref_for: !0
              }, A(t, r), {
                class: "sf-input sf-textarea",
                minlength: r.minLength,
                maxlength: r.maxLength,
                rows: z(r),
                value: String(v(t, r) ?? ""),
                onInput: (o) => T(t, o.target)
              }), null, 16, Ne)) : X(r) ? (l(), L(Ae, E({
                key: 3,
                ref_for: !0
              }, A(t, r), {
                label: r.title || t,
                value: P(t, r),
                onChange: (o) => I(t, o)
              }), null, 16, ["label", "value", "onChange"])) : J(r) ? (l(), d("div", E({
                key: 4,
                ref_for: !0
              }, { ...A(t, r), "aria-labelledby": w(t) + "-label" }, {
                role: "group",
                class: "sf-options"
              }), [
                (l(!0), d(k, null, q(r.items.enum, (o, y) => (l(), d("label", {
                  key: y,
                  class: "sf-option"
                }, [
                  S("input", {
                    type: "checkbox",
                    class: "sf-check",
                    checked: P(t, r).includes(String(o)),
                    onChange: (H) => Y(t, r, o, H.target.checked)
                  }, null, 40, $e),
                  S("span", null, C(o), 1)
                ]))), 128))
              ], 16)) : r.type === "object" || r.type === "array" ? (l(), L(be, E({
                key: 5,
                ref_for: !0
              }, A(t, r), {
                value: c.value[t],
                fallback: r.default,
                kind: r.type,
                rows: z(r),
                onChange: (o) => I(t, o),
                onError: (o) => b.value.set(t, o)
              }), null, 16, ["value", "fallback", "kind", "rows", "onChange", "onError"])) : r.type === "boolean" ? (l(), d("input", E({
                key: 6,
                ref_for: !0
              }, A(t, r), {
                class: "sf-switch",
                type: "checkbox",
                role: "switch",
                checked: !!v(t, r),
                onChange: (o) => I(t, o.target.checked)
              }), null, 16, Le)) : r.type === "number" || r.type === "integer" ? (l(), d("input", E({
                key: 7,
                ref_for: !0
              }, A(t, r), {
                class: "sf-input",
                type: "number",
                min: r.minimum,
                max: r.maximum,
                step: r.type === "integer" ? 1 : "any",
                value: v(t, r) ?? "",
                onInput: (o) => T(t, o.target, !0)
              }), null, 16, ke)) : (l(), d("input", E({
                key: 8,
                ref_for: !0
              }, A(t, r), {
                class: "sf-input",
                type: W(r),
                minlength: r.minLength,
                maxlength: r.maxLength,
                value: v(t, r) ?? "",
                onInput: (o) => T(t, o.target)
              }), null, 16, qe)),
              r.description ? (l(), d("span", {
                key: 9,
                id: w(t) + "-help",
                class: "sf-hint"
              }, C(r.description), 9, Me)) : $("", !0),
              F(t, r) ? (l(), d("span", {
                key: 10,
                id: w(t) + "-default",
                class: "sf-hint"
              }, C(F(t, r)), 9, Ue)) : $("", !0),
              x.value.get(t) ? (l(), d("span", {
                key: 11,
                id: w(t) + "-error",
                class: "sf-error",
                role: "alert"
              }, C(x.value.get(t)), 9, Ve)) : $("", !0)
            ]))), 128))
          ], 2)
        ]),
        _: 2
      }, 1032, ["class"]))), 128))
    ], 544));
  }
});
export {
  Fe as default
};
//# sourceMappingURL=SchemaForm-Cjz2rnMg.js.map

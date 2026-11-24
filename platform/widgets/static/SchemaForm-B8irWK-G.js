import { defineComponent as H, ref as V, watch as T, openBlock as l, createElementBlock as c, Fragment as M, renderList as U, createElementVNode as C, toDisplayString as j, withDirectives as de, mergeProps as O, vModelText as me, computed as L, useId as pe, onMounted as fe, withModifiers as he, unref as P, createBlock as q, resolveDynamicComponent as W, normalizeClass as X, withCtx as Y, createCommentVNode as k, createTextVNode as ve } from "vue";
import { a as ge, u as be } from "./wc-runtime-BOOCbdbY.js";
import { _ as ye } from "./WcMount.vue_vue_type_script_setup_true_lang-CNWT59Oh.js";
function S(i, s) {
  if (Object.is(i, s)) return !0;
  if (!i || !s || typeof i != "object" || typeof s != "object") return !1;
  if (Array.isArray(i) || Array.isArray(s))
    return Array.isArray(i) && Array.isArray(s) && i.length === s.length && i.every((p, y) => S(p, s[y]));
  const d = i, u = s, h = Object.keys(d);
  return h.length === Object.keys(u).length && h.every((p) => Object.hasOwn(u, p) && S(d[p], u[p]));
}
const _e = ["rows", "value"], xe = /* @__PURE__ */ H({
  __name: "StructuredValueField",
  props: {
    value: {},
    fallback: {},
    kind: {},
    rows: { default: 7 }
  },
  emits: ["change", "error"],
  setup(i, { emit: s }) {
    const d = i, u = s;
    function h() {
      return d.kind === "array" ? [] : {};
    }
    function p(f) {
      return d.kind === "array" ? Array.isArray(f) : !!f && typeof f == "object" && !Array.isArray(f);
    }
    function y() {
      return p(d.value) ? d.value : p(d.fallback) ? d.fallback : h();
    }
    function I(f) {
      try {
        return JSON.stringify(f, null, 2);
      } catch {
        return JSON.stringify(h(), null, 2);
      }
    }
    const v = V(I(y()));
    let g = y();
    T(() => [d.value, d.fallback, d.kind], () => {
      const f = y();
      S(f, g) || (g = f, v.value = I(f), u("error", ""));
    });
    function _(f) {
      v.value = f;
      let m;
      try {
        m = JSON.parse(f);
      } catch {
        u("error", "That isn’t valid JSON. Check commas, quotes, and brackets.");
        return;
      }
      if (!p(m)) {
        u("error", `Enter a JSON ${d.kind}.`);
        return;
      }
      u("error", ""), !S(m, g) && (g = m, u("change", m));
    }
    return (f, m) => (l(), c("textarea", {
      class: "sf-input sf-textarea sf-structured",
      rows: i.rows,
      value: v.value,
      spellcheck: "false",
      onInput: m[0] || (m[0] = (x) => _(x.target.value))
    }, null, 40, _e));
  }
}), we = { class: "sf-list" }, Ae = { class: "sf-list-chip-label" }, Ee = ["aria-label", "onClick"], Oe = ["placeholder", "aria-roledescription"], Ce = /* @__PURE__ */ H({
  inheritAttrs: !1,
  __name: "StringListField",
  props: {
    value: {},
    label: {},
    placeholder: {}
  },
  emits: ["change"],
  setup(i, { emit: s }) {
    const d = i, u = s, h = V("");
    function p() {
      const v = h.value.trim();
      h.value = "", v && u("change", [...d.value, v]);
    }
    function y(v) {
      u("change", d.value.filter((g, _) => _ !== v));
    }
    function I(v) {
      v.key === "Enter" || v.key === "," ? (v.preventDefault(), p()) : v.key === "Backspace" && !h.value && d.value.length && y(d.value.length - 1);
    }
    return (v, g) => (l(), c("div", we, [
      (l(!0), c(M, null, U(i.value, (_, f) => (l(), c("span", {
        key: f + ":" + _,
        class: "sf-list-chip"
      }, [
        C("span", Ae, j(_), 1),
        C("button", {
          type: "button",
          class: "sf-list-chip-x",
          "aria-label": "Remove " + _,
          onClick: (m) => y(f)
        }, [...g[1] || (g[1] = [
          C("svg", {
            viewBox: "0 0 24 24",
            "aria-hidden": "true"
          }, [
            C("path", {
              d: "M18 6 6 18M6 6l12 12",
              fill: "none",
              stroke: "currentColor",
              "stroke-width": "2",
              "stroke-linecap": "round"
            })
          ], -1)
        ])], 8, Ee)
      ]))), 128)),
      de(C("input", O(v.$attrs, {
        "onUpdate:modelValue": g[0] || (g[0] = (_) => h.value = _),
        class: "sf-list-input",
        type: "text",
        placeholder: i.value.length ? "" : i.placeholder ?? "Type a value and press Enter",
        "aria-roledescription": "list of " + i.label.toLocaleLowerCase(),
        onKeydown: I,
        onBlur: p
      }), null, 16, Oe), [
        [me, h.value]
      ])
    ]));
  }
});
function z(i, s, d) {
  if (s == null || s === "" && d) return d ? "A value is required." : "";
  if (i.not?.enum?.some((u) => u === s)) return "Choose a different value.";
  if (i.enum) return i.enum.some((u) => u === s) ? "" : "Choose one of the available values.";
  switch (i.type) {
    case "integer":
    case "number":
      return typeof s != "number" || !Number.isFinite(s) || i.type === "integer" && !Number.isInteger(s) ? i.type === "integer" ? "Enter a whole number." : "Enter a number." : i.minimum !== void 0 && s < i.minimum ? `Enter at least ${i.minimum}.` : i.maximum !== void 0 && s > i.maximum ? `Enter at most ${i.maximum}.` : "";
    case "boolean":
      return typeof s == "boolean" ? "" : "Choose on or off.";
    case "array":
      if (!Array.isArray(s)) return "Enter a JSON array.";
      if (i.minItems !== void 0 && s.length < i.minItems) return `Use at least ${i.minItems} entries.`;
      if (i.maxItems !== void 0 && s.length > i.maxItems) return `Use at most ${i.maxItems} entries.`;
      if (i.uniqueItems && s.some((u, h) => s.slice(0, h).some((p) => S(u, p))))
        return "Remove duplicate entries.";
      if (i.items)
        for (const [u, h] of s.entries()) {
          const p = z(i.items, h, !0);
          if (p) return `Entry ${u + 1}: ${p}`;
        }
      return "";
    case "object":
      return typeof s == "object" && !Array.isArray(s) ? "" : "Enter a JSON object.";
  }
  if (typeof s != "string") return "Enter text.";
  if (i.minLength !== void 0 && s.length < i.minLength) return `Enter at least ${i.minLength} characters.`;
  if (i.maxLength !== void 0 && s.length > i.maxLength) return `Enter at most ${i.maxLength} characters.`;
  if (i.pattern)
    try {
      if (!new RegExp(i.pattern).test(s)) return "Use the required format.";
    } catch {
      return "The declared format is unavailable.";
    }
  if (i.format === "date" && s) {
    const u = /* @__PURE__ */ new Date(s + "T00:00:00Z");
    if (!Number.isFinite(u.getTime()) || u.toISOString().split("T")[0] !== s) return "Enter a valid date.";
  }
  return "";
}
const Se = ["disabled"], Ie = {
  key: 0,
  class: "sf-advanced-summary"
}, je = {
  key: 1,
  class: "sf-group-title"
}, Ne = {
  key: 0,
  class: "sf-req",
  "aria-hidden": "true"
}, $e = ["value", "onChange"], Le = {
  key: 0,
  value: ""
}, ke = ["value"], qe = ["minlength", "maxlength", "rows", "value", "onInput"], Me = ["checked", "onChange"], Ue = {
  key: 0,
  class: "sf-hint"
}, Ve = ["checked", "onChange"], Je = ["min", "max", "step", "value", "onInput"], Te = ["type", "minlength", "maxlength", "value", "onInput"], Be = ["id"], Fe = ["id"], Re = ["id"], He = /* @__PURE__ */ H({
  __name: "SchemaForm",
  setup(i) {
    const s = ge(), d = be(), u = L(() => {
      const e = s.value.schema;
      if (typeof e == "string")
        try {
          return JSON.parse(e);
        } catch {
          return {};
        }
      return e || {};
    }), h = L(() => {
      const e = s.value.choices;
      if (typeof e == "string")
        try {
          return JSON.parse(e);
        } catch {
          return {};
        }
      return e || {};
    });
    function p(e) {
      const n = e.items && p(e.items), a = n === e.items ? e : { ...e, items: n }, t = e["x-choices"];
      if (typeof t != "string") return a;
      const r = (h.value[t] ?? []).filter((o) => !z(e, o.value, !0));
      return { ...a, enum: r.map((o) => o.value) };
    }
    function y(e, n) {
      const a = e["x-choices"];
      return (typeof a == "string" ? h.value[a]?.find((r) => r.value === n) : void 0)?.label ?? String(n);
    }
    const I = L(() => Object.entries(u.value.properties || {}).map(([e, n]) => [e, p(n)])), v = L(() => {
      const e = /* @__PURE__ */ new Map();
      for (const a of I.value) {
        if (a[1].group === "advanced") continue;
        const t = typeof a[1].group == "string" ? a[1].group.trim() : "";
        e.has(t) || e.set(t, []), e.get(t).push(a);
      }
      const n = e.get("") ?? [];
      return e.delete(""), [
        { advanced: !1, title: "", fields: n },
        ...[...e].map(([a, t]) => ({ advanced: !1, title: a, fields: t })),
        { advanced: !0, title: "", fields: I.value.filter(([, a]) => a.group === "advanced") }
      ].filter((a) => a.fields.length);
    }), g = pe(), _ = L(() => new Map(I.value.map(([e], n) => [e, n]))), f = V(), m = V({}), x = V(/* @__PURE__ */ new Map()), ee = L(() => new Set(u.value.required || []));
    T(() => s.value.config, (e) => {
      const n = { ...e };
      for (const a of x.value.keys())
        S(n[a], m.value[a]) || x.value.delete(a);
      m.value = n;
    }, { immediate: !0, flush: "sync" }), T(() => s.value.schema, (e, n) => {
      S(e, n) || x.value.clear();
    });
    function w(e, n) {
      return (Object.hasOwn(m.value, e) ? m.value[e] : void 0) ?? n.default;
    }
    const N = L(() => {
      const e = /* @__PURE__ */ new Map(), n = s.value.fieldErrors ?? {};
      for (const { fields: a } of v.value)
        for (const [t, r] of a) {
          const o = s.value.allowUnset && (!Object.hasOwn(m.value, t) || m.value[t] == null), b = x.value.get(t) || Object.hasOwn(n, t) && n[t] || (o ? "" : z(r, w(t, r), F(t, r)));
          b && e.set(t, b);
        }
      return e;
    });
    fe(() => {
      T(() => Object.fromEntries(N.value), (e, n) => {
        S(e, n) || d("validity-changed", { valid: !N.value.size, errors: e });
      }, { immediate: !0, flush: "post" });
    });
    function $(e, n) {
      if (s.value.allowUnset && n === "" && (n = void 0), S(m.value[e], n)) return;
      const a = { ...m.value, [e]: n };
      n === void 0 && s.value.allowUnset && delete a[e], m.value = a, d("config-changed", a);
    }
    function B(e, n, a = !1) {
      if (n.validity.badInput) {
        x.value.set(e, a ? "Enter a number." : "Enter a valid date.");
        return;
      }
      x.value.delete(e), $(e, a ? n.value === "" ? void 0 : Number(n.value) : n.value);
    }
    function A(e) {
      return g + "-field-" + _.value.get(e);
    }
    function E(e, n) {
      const a = A(e), t = [n.description ? a + "-help" : "", D(e, n) ? a + "-default" : "", N.value.has(e) ? a + "-error" : ""].filter(Boolean);
      return {
        id: a,
        "aria-describedby": t.join(" ") || void 0,
        "aria-invalid": N.value.has(e) ? !0 : void 0,
        "aria-required": !s.value.allowUnset && F(e, n) ? !0 : void 0
      };
    }
    function K(e) {
      const n = N.value.keys().next().value;
      if (n === void 0) return;
      e?.preventDefault();
      const a = f.value?.getRootNode(), t = a?.getElementById(A(n)), r = t?.closest("details");
      if (r && (r.open = !0), !t) return;
      const o = t.shadowRoot, b = o?.querySelector('[role="combobox"], input:not([type="hidden"]):not(:disabled), select:not(:disabled), textarea:not(:disabled)') ?? o?.querySelector('button:not(:disabled), [tabindex="0"]');
      (b ?? t).focus(), !b && a?.activeElement !== t && !t.hasAttribute("tabindex") && (t.tabIndex = -1, t.focus(), t.removeAttribute("tabindex"));
    }
    function te(e) {
      return e.format === "password" ? "password" : e.format === "date" ? "date" : "text";
    }
    function F(e, n) {
      return ee.value.has(e) || n.required === !0;
    }
    function re(e) {
      return e.type === "array" && e.items?.type === "string" && !e.items.enum;
    }
    function R(e) {
      return e.type === "array" && Array.isArray(e.items?.enum);
    }
    function Z(e, n) {
      const a = w(e, n);
      return Array.isArray(a) ? a.map(String) : [];
    }
    function ne(e, n, a, t) {
      const r = Array.isArray(w(e, n)) ? w(e, n) : [], o = (n.items?.enum ?? []).filter((b) => b === a ? t : r.includes(b));
      $(e, o);
    }
    function ae(e) {
      return typeof e == "boolean" ? e ? "On" : "Off" : Array.isArray(e) ? e.length ? e.join(", ") : "None" : e && typeof e == "object" ? JSON.stringify(e) : String(e);
    }
    function D(e, n) {
      return Object.hasOwn(m.value, e) && m.value[e] != null ? "" : n.default !== void 0 ? "Default: " + ae(n.default) : s.value.allowUnset ? "Uses the application setting." : "";
    }
    function G(e) {
      const n = Number(e.rows);
      return Number.isFinite(n) && n >= 1 ? Math.floor(n) : 4;
    }
    function J(e) {
      const n = typeof e.picker == "string" ? e.picker.trim() : "";
      return n === "wc-schema-form" ? "" : n;
    }
    function se(e, n) {
      return { properties: { [e]: n } };
    }
    function ie(e) {
      return {
        ...e.class ? { thread_class: e.class } : {},
        ...e.title ? { title: e.title } : {}
      };
    }
    function oe(e) {
      return typeof e.provider == "string" ? e.provider.trim() : "";
    }
    function le(e) {
      return typeof e.title == "string" ? e.title.trim() : "";
    }
    function ue(e) {
      return u.value.properties?.[e]?.value_field ? { [e]: m.value[e] } : { thread_id: m.value[e] ?? "" };
    }
    function ce(e, n) {
      if (n && typeof n == "object") {
        const a = n;
        return a[e] ?? a.thread_id ?? a.id ?? a.value ?? "";
      }
      return n ?? "";
    }
    return (e, n) => (l(), c("form", {
      ref_key: "form",
      ref: f,
      class: "sf",
      novalidate: "",
      onSubmit: n[0] || (n[0] = he((a) => K(), ["prevent"])),
      onSchemaFormReport: K
    }, [
      C("fieldset", {
        class: "sf-body",
        disabled: P(s).disabled
      }, [
        (l(!0), c(M, null, U(v.value, (a) => (l(), q(W(a.advanced ? "details" : a.title ? "fieldset" : "div"), {
          key: a.advanced + a.title,
          class: X(a.advanced ? "sf-advanced" : a.title ? "sf-group" : "sf-primary")
        }, {
          default: Y(() => [
            a.advanced ? (l(), c("summary", Ie, "Advanced")) : a.title ? (l(), c("legend", je, j(a.title), 1)) : k("", !0),
            C("div", {
              class: X(a.advanced ? "sf-advanced-body" : a.title ? "sf-group-body" : "sf-primary")
            }, [
              (l(!0), c(M, null, U(a.fields, ([t, r]) => (l(), c("div", {
                key: t,
                class: "sf-field"
              }, [
                (l(), q(W(J(r) || R(r) ? "span" : "label"), {
                  id: A(t) + "-label",
                  for: J(r) || R(r) ? void 0 : A(t),
                  class: "sf-lbl"
                }, {
                  default: Y(() => [
                    ve(j(r.title || t), 1),
                    !P(s).allowUnset && F(t, r) ? (l(), c("span", Ne, " *")) : k("", !0)
                  ]),
                  _: 2
                }, 1032, ["id", "for"])),
                J(r) ? (l(), q(ye, {
                  key: 0,
                  tag: J(r),
                  schema: se(t, r),
                  config: ue(t),
                  meta: ie(r),
                  provider: oe(r),
                  label: le(r),
                  attrs: { ...E(t, r), "aria-labelledby": A(t) + "-label", role: "group", inert: P(s).disabled || void 0 },
                  onChange: (o) => $(t, ce(t, o))
                }, null, 8, ["tag", "schema", "config", "meta", "provider", "label", "attrs", "onChange"])) : r.enum ? (l(), c("select", O({
                  key: 1,
                  ref_for: !0
                }, E(t, r), {
                  class: "sf-input",
                  value: w(t, r) ?? "",
                  onChange: (o) => $(t, r.enum[o.target.selectedIndex - (r.enum.includes("") ? 0 : 1)])
                }), [
                  r.enum.includes("") ? k("", !0) : (l(), c("option", Le, "Choose a value")),
                  (l(!0), c(M, null, U(r.enum, (o, b) => (l(), c("option", {
                    key: b,
                    value: o
                  }, j(y(r, o)), 9, ke))), 128))
                ], 16, $e)) : r.format === "textarea" ? (l(), c("textarea", O({
                  key: 2,
                  ref_for: !0
                }, E(t, r), {
                  class: "sf-input sf-textarea",
                  minlength: r.minLength,
                  maxlength: r.maxLength,
                  rows: G(r),
                  value: String(w(t, r) ?? ""),
                  onInput: (o) => B(t, o.target)
                }), null, 16, qe)) : re(r) ? (l(), q(Ce, O({
                  key: 3,
                  ref_for: !0
                }, E(t, r), {
                  label: r.title || t,
                  value: Z(t, r),
                  onChange: (o) => $(t, o)
                }), null, 16, ["label", "value", "onChange"])) : R(r) ? (l(), c("div", O({
                  key: 4,
                  ref_for: !0
                }, { ...E(t, r), "aria-labelledby": A(t) + "-label" }, {
                  role: "group",
                  class: "sf-options"
                }), [
                  (l(!0), c(M, null, U(r.items.enum, (o, b) => (l(), c("label", {
                    key: b,
                    class: "sf-option"
                  }, [
                    C("input", {
                      type: "checkbox",
                      class: "sf-check",
                      checked: Z(t, r).includes(String(o)),
                      onChange: (Q) => ne(t, r, o, Q.target.checked)
                    }, null, 40, Me),
                    C("span", null, j(y(r.items, o)), 1)
                  ]))), 128)),
                  r.items.enum.length ? k("", !0) : (l(), c("span", Ue, "No choices are available."))
                ], 16)) : r.type === "object" || r.type === "array" ? (l(), q(xe, O({
                  key: 5,
                  ref_for: !0
                }, E(t, r), {
                  value: m.value[t],
                  fallback: r.default,
                  kind: r.type,
                  rows: G(r),
                  onChange: (o) => $(t, o),
                  onError: (o) => x.value.set(t, o)
                }), null, 16, ["value", "fallback", "kind", "rows", "onChange", "onError"])) : r.type === "boolean" ? (l(), c("input", O({
                  key: 6,
                  ref_for: !0
                }, E(t, r), {
                  class: "sf-switch",
                  type: "checkbox",
                  role: "switch",
                  checked: !!w(t, r),
                  onChange: (o) => $(t, o.target.checked)
                }), null, 16, Ve)) : r.type === "number" || r.type === "integer" ? (l(), c("input", O({
                  key: 7,
                  ref_for: !0
                }, E(t, r), {
                  class: "sf-input",
                  type: "number",
                  min: r.minimum,
                  max: r.maximum,
                  step: r.type === "integer" ? 1 : "any",
                  value: w(t, r) ?? "",
                  onInput: (o) => B(t, o.target, !0)
                }), null, 16, Je)) : (l(), c("input", O({
                  key: 8,
                  ref_for: !0
                }, E(t, r), {
                  class: "sf-input",
                  type: te(r),
                  minlength: r.minLength,
                  maxlength: r.maxLength,
                  value: w(t, r) ?? "",
                  onInput: (o) => B(t, o.target)
                }), null, 16, Te)),
                r.description ? (l(), c("span", {
                  key: 9,
                  id: A(t) + "-help",
                  class: "sf-hint"
                }, j(r.description), 9, Be)) : k("", !0),
                D(t, r) ? (l(), c("span", {
                  key: 10,
                  id: A(t) + "-default",
                  class: "sf-hint"
                }, j(D(t, r)), 9, Fe)) : k("", !0),
                N.value.get(t) ? (l(), c("span", {
                  key: 11,
                  id: A(t) + "-error",
                  class: "sf-error",
                  role: "alert"
                }, j(N.value.get(t)), 9, Re)) : k("", !0)
              ]))), 128))
            ], 2)
          ]),
          _: 2
        }, 1032, ["class"]))), 128))
      ], 8, Se)
    ], 544));
  }
});
export {
  He as default
};
//# sourceMappingURL=SchemaForm-B8irWK-G.js.map

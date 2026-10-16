import { u as R, a as K, W as $ } from "./index-C70m2Vvt.js";
import { defineComponent as W, ref as A, useId as z, watch as B, openBlock as a, createElementBlock as l, Fragment as w, createElementVNode as k, unref as F, normalizeClass as D, toDisplayString as f, createCommentVNode as x, computed as q, renderList as N, createTextVNode as T, createBlock as O } from "vue";
import { W as M } from "./WcMount-CoI3gyQ1.js";
import { s as H } from "./styles-DR8LFeMF.js";
import "@iconify/vue";
import { define as U } from "@wippy-fe/proxy";
function S(p, h) {
  if (Object.is(p, h)) return !0;
  if (!p || !h || typeof p != "object" || typeof h != "object") return !1;
  if (Array.isArray(p) || Array.isArray(h))
    return Array.isArray(p) && Array.isArray(h) && p.length === h.length && p.every((m, y) => S(m, h[y]));
  const c = p, g = h, _ = Object.keys(c);
  return _.length === Object.keys(g).length && _.every((m) => Object.hasOwn(g, m) && S(c[m], g[m]));
}
const G = ["rows", "value", "placeholder", "aria-invalid", "aria-describedby"], Q = ["id"], P = /* @__PURE__ */ W({
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
    function j(o) {
      try {
        return JSON.stringify(o, null, 2);
      } catch {
        return JSON.stringify(_(), null, 2);
      }
    }
    const i = A(j(y())), s = A(""), C = z();
    let d = y();
    B(() => [c.value, c.fallback, c.kind], () => {
      const o = y();
      S(o, d) || (d = o, i.value = j(o), s.value = "");
    });
    function b(o) {
      i.value = o;
      let v;
      try {
        v = JSON.parse(o);
      } catch {
        s.value = "That isn’t valid JSON. Check commas, quotes, and brackets.";
        return;
      }
      if (!m(v)) {
        s.value = `Enter a JSON ${c.kind}.`;
        return;
      }
      s.value = "", !S(v, d) && (d = v, g("change", v));
    }
    return (o, v) => (a(), l(w, null, [
      k("textarea", {
        class: D(["sf-input sf-textarea sf-structured", s.value && "is-invalid"]),
        rows: p.rows,
        value: i.value,
        placeholder: p.placeholder,
        "aria-invalid": s.value ? "true" : void 0,
        "aria-describedby": s.value ? F(C) : void 0,
        spellcheck: "false",
        onInput: v[0] || (v[0] = (I) => b(I.target.value))
      }, null, 42, G),
      s.value ? (a(), l("span", {
        key: 0,
        id: F(C),
        class: "sf-error",
        role: "alert"
      }, f(s.value), 9, Q)) : x("", !0)
    ], 64));
  }
}), X = { class: "sf" }, Y = { class: "sf-lbl" }, Z = {
  key: 0,
  class: "sf-req"
}, ee = ["required", "value", "onChange"], te = ["value"], ne = ["required", "minlength", "maxlength", "rows", "value", "placeholder", "onInput"], re = ["checked", "onChange"], ae = ["required", "min", "max", "step", "value", "onInput"], le = ["type", "required", "minlength", "maxlength", "value", "placeholder", "onInput"], se = {
  key: 7,
  class: "sf-hint"
}, ie = {
  key: 0,
  class: "sf-advanced"
}, ue = { class: "sf-advanced-body" }, oe = { class: "sf-lbl" }, ce = {
  key: 0,
  class: "sf-req"
}, de = ["required", "value", "onChange"], pe = ["value"], he = ["required", "minlength", "maxlength", "rows", "value", "placeholder", "onInput"], me = ["checked", "onChange"], ve = ["required", "min", "max", "step", "value", "onInput"], ge = ["type", "required", "minlength", "maxlength", "value", "placeholder", "onInput"], _e = {
  key: 7,
  class: "sf-hint"
}, ye = /* @__PURE__ */ W({
  __name: "SchemaForm",
  setup(p) {
    const h = R(), c = K(), g = q(() => {
      const n = h.value.schema;
      if (typeof n == "string")
        try {
          return JSON.parse(n);
        } catch {
          return {};
        }
      return n || {};
    }), _ = q(() => Object.entries(g.value.properties || {})), m = q(() => _.value.filter(([, n]) => n.group !== "advanced")), y = q(() => _.value.filter(([, n]) => n.group === "advanced")), j = q(() => new Set(g.value.required || [])), i = A({});
    B(() => h.value.config, (n) => {
      i.value = { ...n };
    }, { immediate: !0, flush: "sync" });
    function s(n, u) {
      S(i.value[n], u) || (i.value = { ...i.value, [n]: u }, c("config-changed", i.value));
    }
    function C(n) {
      return n.format === "password" ? "password" : n.format === "date" ? "date" : "text";
    }
    function d(n, u) {
      return j.value.has(n) || u.required === !0;
    }
    function b(n) {
      const u = Number(n.rows);
      return Number.isFinite(u) && u >= 1 ? Math.floor(u) : 4;
    }
    function o(n) {
      const u = typeof n.picker == "string" ? n.picker.trim() : "";
      return u === "wc-schema-form" ? "" : u;
    }
    function v(n, u) {
      return { properties: { [n]: u } };
    }
    function I(n) {
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
    function E(n) {
      return g.value.properties?.[n]?.value_field ? { [n]: i.value[n] } : { thread_id: i.value[n] ?? "" };
    }
    function J(n, u) {
      if (u && typeof u == "object") {
        const t = u;
        return t[n] ?? t.thread_id ?? t.id ?? t.value ?? "";
      }
      return u ?? "";
    }
    return (n, u) => (a(), l("div", X, [
      (a(!0), l(w, null, N(m.value, ([t, e]) => (a(), l("label", {
        key: t,
        class: "sf-field"
      }, [
        k("span", Y, [
          T(f(e.title || t), 1),
          d(t, e) ? (a(), l("span", Z, " *")) : x("", !0)
        ]),
        o(e) ? (a(), O(M, {
          key: 0,
          tag: o(e),
          schema: v(t, e),
          config: E(t),
          meta: I(e),
          provider: L(e),
          label: V(e),
          onChange: (r) => s(t, J(t, r))
        }, null, 8, ["tag", "schema", "config", "meta", "provider", "label", "onChange"])) : e.enum ? (a(), l("select", {
          key: 1,
          class: "sf-input",
          required: d(t, e),
          value: i.value[t] ?? e.default ?? "",
          onChange: (r) => s(t, r.target.value)
        }, [
          (a(!0), l(w, null, N(e.enum, (r) => (a(), l("option", {
            key: r,
            value: r
          }, f(r), 9, te))), 128))
        ], 40, ee)) : e.format === "textarea" ? (a(), l("textarea", {
          key: 2,
          class: "sf-input sf-textarea",
          required: d(t, e),
          minlength: e.minLength,
          maxlength: e.maxLength,
          rows: b(e),
          value: i.value[t] ?? e.default ?? "",
          placeholder: e.description || "",
          onInput: (r) => s(t, r.target.value)
        }, null, 40, ne)) : e.type === "object" || e.type === "array" ? (a(), O(P, {
          key: 3,
          value: i.value[t],
          fallback: e.default,
          kind: e.type,
          rows: b(e),
          placeholder: e.description || "",
          onChange: (r) => s(t, r)
        }, null, 8, ["value", "fallback", "kind", "rows", "placeholder", "onChange"])) : e.type === "boolean" ? (a(), l("input", {
          key: 4,
          class: "sf-check",
          type: "checkbox",
          checked: !!(i.value[t] ?? e.default),
          onChange: (r) => s(t, r.target.checked)
        }, null, 40, re)) : e.type === "number" || e.type === "integer" ? (a(), l("input", {
          key: 5,
          class: "sf-input",
          type: "number",
          required: d(t, e),
          min: e.minimum,
          max: e.maximum,
          step: e.type === "integer" ? 1 : "any",
          value: i.value[t] ?? e.default ?? "",
          onInput: (r) => s(t, r.target.value === "" ? void 0 : Number(r.target.value))
        }, null, 40, ae)) : (a(), l("input", {
          key: 6,
          class: "sf-input",
          type: C(e),
          required: d(t, e),
          minlength: e.minLength,
          maxlength: e.maxLength,
          value: i.value[t] ?? e.default ?? "",
          placeholder: e.description || "",
          onInput: (r) => s(t, r.target.value)
        }, null, 40, le)),
        e.description ? (a(), l("span", se, f(e.description), 1)) : x("", !0)
      ]))), 128)),
      y.value.length ? (a(), l("details", ie, [
        u[0] || (u[0] = k("summary", { class: "sf-advanced-summary" }, "Advanced", -1)),
        k("div", ue, [
          (a(!0), l(w, null, N(y.value, ([t, e]) => (a(), l("label", {
            key: t,
            class: "sf-field"
          }, [
            k("span", oe, [
              T(f(e.title || t), 1),
              d(t, e) ? (a(), l("span", ce, " *")) : x("", !0)
            ]),
            o(e) ? (a(), O(M, {
              key: 0,
              tag: o(e),
              schema: v(t, e),
              config: E(t),
              meta: I(e),
              provider: L(e),
              label: V(e),
              onChange: (r) => s(t, J(t, r))
            }, null, 8, ["tag", "schema", "config", "meta", "provider", "label", "onChange"])) : e.enum ? (a(), l("select", {
              key: 1,
              class: "sf-input",
              required: d(t, e),
              value: i.value[t] ?? e.default ?? "",
              onChange: (r) => s(t, r.target.value)
            }, [
              (a(!0), l(w, null, N(e.enum, (r) => (a(), l("option", {
                key: r,
                value: r
              }, f(r), 9, pe))), 128))
            ], 40, de)) : e.format === "textarea" ? (a(), l("textarea", {
              key: 2,
              class: "sf-input sf-textarea",
              required: d(t, e),
              minlength: e.minLength,
              maxlength: e.maxLength,
              rows: b(e),
              value: i.value[t] ?? e.default ?? "",
              placeholder: e.description || "",
              onInput: (r) => s(t, r.target.value)
            }, null, 40, he)) : e.type === "object" || e.type === "array" ? (a(), O(P, {
              key: 3,
              value: i.value[t],
              fallback: e.default,
              kind: e.type,
              rows: b(e),
              placeholder: e.description || "",
              onChange: (r) => s(t, r)
            }, null, 8, ["value", "fallback", "kind", "rows", "placeholder", "onChange"])) : e.type === "boolean" ? (a(), l("input", {
              key: 4,
              class: "sf-check",
              type: "checkbox",
              checked: !!(i.value[t] ?? e.default),
              onChange: (r) => s(t, r.target.checked)
            }, null, 40, me)) : e.type === "number" || e.type === "integer" ? (a(), l("input", {
              key: 5,
              class: "sf-input",
              type: "number",
              required: d(t, e),
              min: e.minimum,
              max: e.maximum,
              step: e.type === "integer" ? 1 : "any",
              value: i.value[t] ?? e.default ?? "",
              onInput: (r) => s(t, r.target.value === "" ? void 0 : Number(r.target.value))
            }, null, 40, ve)) : (a(), l("input", {
              key: 6,
              class: "sf-input",
              type: C(e),
              required: d(t, e),
              minlength: e.minLength,
              maxlength: e.maxLength,
              value: i.value[t] ?? e.default ?? "",
              placeholder: e.description || "",
              onInput: (r) => s(t, r.target.value)
            }, null, 40, ge)),
            e.description ? (a(), l("span", _e, f(e.description), 1)) : x("", !0)
          ]))), 128))
        ])
      ])) : x("", !0)
    ]));
  }
}), fe = {
  type: "object",
  properties: {
    schema: { type: "object", description: "JSON Schema describing the config fields (object or JSON string)." },
    config: { type: "object", description: "Current config values." }
  }
};
class be extends $ {
  static get wippyConfig() {
    return {
      propsSchema: fe,
      hostCssKeys: ["themeConfigUrl"],
      inlineCss: H
    };
  }
  static get vueConfig() {
    return { rootComponent: ye };
  }
}
U(import.meta.url, be);
//# sourceMappingURL=schema_form.js.map

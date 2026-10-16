import { a as oe, u as re, W as ie, s as ue } from "./styles-BEaF_GAv.js";
import { s as ce, a as de, b as X, P as me } from "./index-8Dae-yYb.js";
import { defineComponent as Q, ref as L, onMounted as te, watch as q, onBeforeUnmount as ve, openBlock as l, createElementBlock as r, createElementVNode as _, nextTick as pe, computed as K, toDisplayString as x, createCommentVNode as w, Fragment as D, withDirectives as fe, vModelText as ye, renderList as z, createBlock as S, resolveDynamicComponent as B, normalizeClass as O, withCtx as P, createTextVNode as Z, unref as I, createVNode as H } from "vue";
import { Icon as J } from "@iconify/vue";
import { loadByTagName as he, api as W, define as ke } from "@wippy-fe/proxy";
const ge = () => oe();
function _e(f) {
  if (!f) return null;
  let k;
  if (typeof f == "number")
    k = f;
  else {
    const i = f.trim();
    if (/^\d+$/.test(i))
      k = Number(i);
    else {
      const y = Date.parse(i);
      return Number.isNaN(y) ? null : y;
    }
  }
  return Number.isFinite(k) ? k < 1e12 ? k * 1e3 : k : null;
}
function be(f, k) {
  const i = _e(f);
  if (i === null) return "";
  const y = k?.now ?? Date.now(), $ = k?.suffix ?? !0, b = k?.maxUnit ?? "day", d = k?.future ?? !1, c = 6e4, m = 60 * c, s = 24 * m, T = 30 * s, C = 365 * s, N = y - i;
  if (d && N < 0) {
    const g = -N;
    return g < c ? "in <1m" : g < m ? `in ${Math.floor(g / c)}m` : g < s ? `in ${Math.floor(g / m)}h` : `in ${Math.floor(g / s)}d`;
  }
  const u = Math.max(0, N);
  if (u < c) return "just now";
  const p = $ ? " ago" : "";
  return u < m ? `${Math.floor(u / c)}m${p}` : u < s ? `${Math.floor(u / m)}h${p}` : b === "year" ? u < T ? `${Math.floor(u / s)}d${p}` : u < C ? `${Math.floor(u / T)}mo${p}` : `${Math.floor(u / C)}y${p}` : `${Math.floor(u / s)}d${p}`;
}
const $e = { class: "kx-wcmount" }, we = {
  key: 0,
  class: "kx-wcmount-fail",
  role: "alert"
}, xe = /* @__PURE__ */ Q({
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
  setup(f, { emit: k }) {
    const i = f, y = k, $ = L(null), b = L(!1);
    let d = null, c = 0;
    const m = /* @__PURE__ */ new Set();
    function s(o) {
      o.composedPath()[0] === d && (o.stopPropagation(), y("change", o.detail));
    }
    function T(o) {
      return o.composedPath()[0] !== d ? !1 : (o.stopPropagation(), !0);
    }
    function C(o) {
      T(o) && y("created", o.detail);
    }
    function N(o) {
      T(o) && y("close", o.detail);
    }
    function u(o) {
      T(o) && y("error", o.detail);
    }
    function p(o) {
      if (typeof o == "string") return o;
      try {
        return JSON.stringify(o ?? {});
      } catch {
        return null;
      }
    }
    function g() {
      if (!d) return;
      const o = p(i.config);
      if (o !== null && d.setAttribute("config", o), i.schema !== void 0 && i.schema !== null) {
        const h = p(i.schema);
        h !== null && d.setAttribute("schema", h);
      }
      if (i.meta !== void 0 && i.meta !== null) {
        const h = p(i.meta);
        h !== null && d.setAttribute("meta", h);
      }
      i.provider && d.setAttribute("provider", i.provider), i.label && d.setAttribute("label", i.label);
      const A = i.attrs || {};
      for (const h of [...m])
        (!(h in A) || A[h] == null) && (d.removeAttribute(h), m.delete(h));
      for (const [h, E] of Object.entries(A)) {
        if (E == null) continue;
        const G = typeof E == "object" ? p(E) : String(E);
        G !== null && (d.setAttribute(h, G), m.add(h));
      }
    }
    function U(o = d) {
      o && (o.removeEventListener("config-changed", s), o.removeEventListener("change", s), o.removeEventListener("created", C), o.removeEventListener("close", N), o.removeEventListener("error", u), o === d && (d = null), m.clear());
    }
    async function V(o) {
      if (!customElements.get(o))
        try {
          await he(o, { timeoutMs: 8e3 });
        } catch {
        }
    }
    async function R() {
      const o = ++c, A = $.value, h = i.tag;
      if (b.value = !1, !!A && (U(), A.innerHTML = "", !!h))
        try {
          if (await V(h), o !== c || $.value !== A || i.tag !== h) return;
          const E = document.createElement(h);
          E.classList.add("kx-wcmount-surface"), d = E, g(), E.addEventListener("config-changed", s), E.addEventListener("change", s), E.addEventListener("created", C), E.addEventListener("close", N), E.addEventListener("error", u), E.style.display = "block", A.appendChild(E), b.value = !customElements.get(h);
        } catch {
          o === c && (b.value = !0);
        }
    }
    async function F() {
      b.value = !1, await pe(), await R();
    }
    return te(R), q(() => i.tag, R), q(() => [i.config, i.schema, i.meta, i.provider, i.label, i.attrs], g, { deep: !0 }), ve(() => {
      c += 1, U();
    }), (o, A) => (l(), r("div", $e, [
      b.value ? (l(), r("div", we, [
        A[0] || (A[0] = _("span", null, "This setup panel couldn’t load.", -1)),
        _("button", {
          type: "button",
          onClick: F
        }, "Try again")
      ])) : (l(), r("div", {
        key: 1,
        ref_key: "host",
        ref: $
      }, null, 512))
    ]));
  }
}), Ce = (f, k) => {
  const i = f.__vccOpts || f;
  for (const [y, $] of k)
    i[y] = $;
  return i;
}, ne = /* @__PURE__ */ Ce(xe, [["__scopeId", "data-v-3ec70c11"]]), Ee = { class: "ks-form" }, Le = {
  key: 0,
  class: "ks-err"
}, Me = {
  key: 1,
  class: "ks-loading"
}, Ae = {
  key: 2,
  class: "ks-empty"
}, Ne = {
  key: 0,
  class: "ks-group-head"
}, Se = { class: "ks-group-title" }, Ue = { class: "ks-group-count" }, Te = { key: 0 }, je = {
  key: 0,
  class: "ks-owner"
}, Oe = { class: "ks-row-head" }, Ve = { class: "ks-title" }, Ie = { class: "ks-key" }, De = {
  key: 0,
  class: "ks-tag kx-tag-caps ks-tag-on"
}, Pe = {
  key: 1,
  class: "ks-tag kx-tag-caps ks-tag-on"
}, Re = {
  key: 0,
  class: "ks-desc"
}, Be = {
  key: 1,
  class: "ks-hint"
}, He = {
  key: 2,
  class: "ks-prov"
}, Ke = { key: 0 }, Fe = { class: "ks-field" }, Ge = {
  key: 0,
  class: "ks-static"
}, Je = ["min", "max", "value", "onInput"], We = ["value", "onInput"], ze = ["placeholder", "value", "onInput"], Ye = ["minlength", "maxlength", "value", "onInput"], qe = {
  key: 6,
  class: "ks-saved"
}, Qe = {
  key: 0,
  class: "ks-field-err"
}, Y = "General", ee = /* @__PURE__ */ Q({
  __name: "SettingsForm",
  props: {
    namespace: {},
    all: { type: Boolean, default: !1 },
    blocks: { default: () => [] }
  },
  setup(f) {
    const k = f, i = L([]), y = L(!0), $ = L(""), b = L(""), d = L(""), c = L({}), m = L({}), s = (t) => `${t.namespace} ${t.key}`;
    function T(t) {
      const a = t.split(/[._\-\s]+/).filter(Boolean);
      return a.length ? a.map((n, e) => e === 0 ? n.charAt(0).toUpperCase() + n.slice(1) : n).join(" ") : t;
    }
    const C = (t) => t.title && t.title.length ? t.title : T(t.key), N = L(""), u = (t) => t.owner ? t.owner : k.blocks.find((n) => n.namespace === t.namespace || n.namespaces?.includes(t.namespace))?.title || t.namespace, p = K(() => {
      if (k.all) {
        const e = N.value.trim().toLowerCase(), v = i.value.filter((M) => !e || [
          C(M),
          M.key,
          M.namespace,
          u(M),
          M.description || ""
        ].some((j) => j.toLowerCase().includes(e)));
        return v.sort((M, j) => u(M).localeCompare(u(j)) || (M.order ?? 100) - (j.order ?? 100) || C(M).localeCompare(C(j))), [{ name: Y, items: v }];
      }
      const t = /* @__PURE__ */ new Map();
      for (const e of i.value) {
        const v = e.category && e.category.length ? e.category : Y;
        t.has(v) || t.set(v, []), t.get(v).push(e);
      }
      const a = (e) => typeof e.order == "number" ? e.order : 100, n = [];
      for (const [e, v] of t)
        v.sort((M, j) => a(M) - a(j) || C(M).localeCompare(C(j))), n.push({ name: e, items: v });
      return n.sort((e, v) => {
        const M = Math.min(...e.items.map(a)), j = Math.min(...v.items.map(a));
        return M - j || e.name.localeCompare(v.name);
      }), n;
    }), g = K(() => p.value.length === 1 && p.value[0].name === Y), U = (t) => Array.isArray(t.schema?.enum) ? t.schema.enum : null;
    function V(t) {
      return {
        namespace: t.namespace,
        key: t.key,
        value: t.value,
        value_type: t.value_type,
        default: t.default,
        has_value: t.has_value,
        is_secret: t.is_secret,
        description: t.description,
        title: C(t),
        schema: t.schema ?? null
      };
    }
    function R(t, a) {
      const n = t.schema;
      if (!n) return "";
      if (n.type === "integer" || n.type === "number") {
        const e = Number(a);
        if (Number.isNaN(e)) return "Must be a number";
        if (n.type === "integer" && !Number.isInteger(e)) return "Must be a whole number";
        if (typeof n.minimum == "number" && e < n.minimum) return `Must be ≥ ${n.minimum}`;
        if (typeof n.maximum == "number" && e > n.maximum) return `Must be ≤ ${n.maximum}`;
      }
      if (n.type === "string") {
        const e = String(a);
        if (typeof n.minLength == "number" && e.length < n.minLength) return `Must be at least ${n.minLength} characters`;
        if (typeof n.maxLength == "number" && e.length > n.maxLength) return `Must be at most ${n.maxLength} characters`;
        if (n.pattern && !new RegExp(n.pattern).test(e)) return "Does not match the required format";
      }
      return Array.isArray(n.enum) && !n.enum.includes(a) ? `Must be one of: ${n.enum.join(", ")}` : "";
    }
    function F(t) {
      const a = t.schema;
      if (!a) return "";
      const n = [];
      if (typeof a.minimum == "number" || typeof a.maximum == "number") {
        const e = typeof a.minimum == "number" ? a.minimum : "−∞", v = typeof a.maximum == "number" ? a.maximum : "∞";
        n.push(`range ${e}–${v}`);
      }
      return (typeof a.minLength == "number" || typeof a.maxLength == "number") && n.push(`length ${a.minLength ?? 0}–${a.maxLength ?? "∞"}`), Array.isArray(a.enum) && n.push(`one of ${a.enum.join(", ")}`), n.join(" · ");
    }
    function o(t) {
      const a = s(t);
      if (t.value_type === "secret" && !String(c.value[a] ?? "").length)
        return delete m.value[a], "";
      let n = c.value[a];
      t.value_type === "int" && (n = Number(n));
      const e = R(t, n);
      return e ? m.value[a] = e : delete m.value[a], e;
    }
    function A(t) {
      if (t.value_type === "secret") {
        c.value[s(t)] = "";
        return;
      }
      c.value[s(t)] = t.value_type === "json" ? JSON.stringify(t.value, null, 2) : t.value;
    }
    async function h() {
      y.value = !0, $.value = "";
      try {
        const t = k.all ? "/api/v1/settings" : `/api/v1/settings?namespace=${encodeURIComponent(k.namespace)}`, { data: a } = await W.get(t);
        if (!a?.success) throw new Error(a?.error || "failed to load settings");
        i.value = Array.isArray(a.settings) ? a.settings : [];
        for (const n of i.value) A(n);
      } catch (t) {
        $.value = t instanceof Error ? t.message : String(t);
      } finally {
        y.value = !1;
      }
    }
    function E(t, a) {
      switch (t.value_type) {
        case "int":
          return Math.trunc(Number(a));
        case "bool":
          return !!a;
        case "json":
          return JSON.parse(String(a));
        default:
          return String(a);
      }
    }
    const G = (t) => {
      const a = c.value[s(t)];
      return t.value_type === "secret" ? String(a ?? "").length > 0 : t.value_type === "json" ? a !== JSON.stringify(t.value, null, 2) : a !== t.value;
    };
    async function ae(t) {
      const a = s(t);
      if (!o(t)) {
        b.value = a, $.value = "";
        try {
          const n = E(t, c.value[a]), { data: e } = await W.put("/api/v1/settings", { namespace: t.namespace, key: t.key, value: n });
          if (!e?.success) {
            m.value[a] = e?.error || "save failed";
            return;
          }
          delete m.value[a], d.value = a, setTimeout(() => {
            d.value === a && (d.value = "");
          }, 2e3), await h();
        } catch (n) {
          m.value[a] = n instanceof Error ? n.message : String(n);
        } finally {
          b.value = "";
        }
      }
    }
    async function se(t) {
      const a = s(t);
      b.value = a, $.value = "";
      try {
        const { data: n } = await W.put("/api/v1/settings", { namespace: t.namespace, key: t.key, value: null });
        if (!n?.success) throw new Error(n?.error || "reset failed");
        await h();
      } catch (n) {
        $.value = n instanceof Error ? n.message : String(n);
      } finally {
        b.value = "";
      }
    }
    async function le() {
      await h();
    }
    return q(() => [k.namespace, k.all], h), te(h), (t, a) => (l(), r("div", Ee, [
      $.value ? (l(), r("div", Le, x($.value), 1)) : w("", !0),
      y.value ? (l(), r("div", Me, "Loading…")) : i.value.length ? (l(), r(D, { key: 3 }, [
        f.all ? fe((l(), r("input", {
          key: 0,
          "onUpdate:modelValue": a[0] || (a[0] = (n) => N.value = n),
          type: "search",
          class: "ks-input ks-all-search",
          "aria-label": "Search settings",
          placeholder: "Search settings"
        }, null, 512)), [
          [ye, N.value]
        ]) : w("", !0),
        (l(!0), r(D, null, z(p.value, (n) => (l(), r("section", {
          key: n.name,
          class: "ks-group"
        }, [
          g.value ? w("", !0) : (l(), r("div", Ne, [
            _("h2", Se, x(n.name), 1),
            _("span", Ue, x(n.items.length), 1)
          ])),
          (l(), S(B(f.all ? "table" : "div"), {
            class: O(["ks-list", { "ks-all-table": f.all }])
          }, {
            default: P(() => [
              f.all ? (l(), r("thead", Te, [...a[1] || (a[1] = [
                _("tr", null, [
                  _("th", { scope: "col" }, "Owner"),
                  _("th", { scope: "col" }, "Setting"),
                  _("th", { scope: "col" }, "Value")
                ], -1)
              ])])) : w("", !0),
              (l(), S(B(f.all ? "tbody" : "div"), null, {
                default: P(() => [
                  (l(!0), r(D, null, z(n.items, (e) => (l(), S(B(f.all ? "tr" : "div"), {
                    key: s(e),
                    class: O(["ks-row", { "ks-row-invalid": m.value[s(e)], "ks-row-wc": e.ui }])
                  }, {
                    default: P(() => [
                      f.all ? (l(), r("td", je, x(u(e)), 1)) : w("", !0),
                      (l(), S(B(f.all ? "td" : "div"), { class: "ks-row-main" }, {
                        default: P(() => [
                          _("div", Oe, [
                            _("span", Ve, x(C(e)), 1),
                            _("code", Ie, x(e.key), 1),
                            e.is_secret && e.has_value ? (l(), r("span", De, "set")) : !e.is_default && !e.is_secret ? (l(), r("span", Pe, "overridden")) : w("", !0)
                          ]),
                          e.description ? (l(), r("p", Re, x(e.description), 1)) : w("", !0),
                          F(e) ? (l(), r("p", Be, x(F(e)), 1)) : w("", !0),
                          !e.is_default && e.updated_by ? (l(), r("p", He, [
                            Z("by " + x(e.updated_by), 1),
                            e.updated_at ? (l(), r("span", Ke, " · " + x(I(be)(e.updated_at)), 1)) : w("", !0)
                          ])) : w("", !0)
                        ]),
                        _: 2
                      }, 1024)),
                      e.ui ? (l(), S(B(f.all ? "td" : "div"), {
                        key: 1,
                        class: "ks-wc-slot"
                      }, {
                        default: P(() => [
                          (l(), S(ne, {
                            key: s(e),
                            tag: e.ui,
                            config: V(e),
                            onChange: le
                          }, null, 8, ["tag", "config"]))
                        ]),
                        _: 2
                      }, 1024)) : (l(), S(B(f.all ? "td" : "div"), {
                        key: 2,
                        class: "ks-control"
                      }, {
                        default: P(() => [
                          _("div", Fe, [
                            e.editable === !1 ? (l(), r("span", Ge, x(e.value), 1)) : (l(), r(D, { key: 1 }, [
                              e.value_type === "bool" ? (l(), S(I(ce), {
                                key: 0,
                                "model-value": !!c.value[s(e)],
                                "aria-label": C(e),
                                "onUpdate:modelValue": (v) => c.value[s(e)] = v
                              }, null, 8, ["model-value", "aria-label", "onUpdate:modelValue"])) : U(e) ? (l(), S(I(de), {
                                key: 1,
                                class: O(["ks-select", { "ks-select-invalid": m.value[s(e)] }]),
                                "model-value": c.value[s(e)],
                                options: U(e),
                                "onUpdate:modelValue": (v) => {
                                  c.value[s(e)] = v, o(e);
                                }
                              }, null, 8, ["class", "model-value", "options", "onUpdate:modelValue"])) : e.value_type === "int" ? (l(), r("input", {
                                key: 2,
                                type: "number",
                                class: O(["ks-input", { "ks-input-invalid": m.value[s(e)] }]),
                                min: e.schema?.minimum,
                                max: e.schema?.maximum,
                                value: c.value[s(e)],
                                onInput: (v) => {
                                  c.value[s(e)] = Number(v.target.value), o(e);
                                }
                              }, null, 42, Je)) : e.value_type === "json" ? (l(), r("textarea", {
                                key: 3,
                                rows: "4",
                                class: O(["ks-input", { "ks-input-invalid": m.value[s(e)] }]),
                                value: c.value[s(e)],
                                onInput: (v) => {
                                  c.value[s(e)] = v.target.value, o(e);
                                }
                              }, null, 42, We)) : e.value_type === "secret" ? (l(), r("input", {
                                key: 4,
                                type: "password",
                                autocomplete: "off",
                                class: O(["ks-input", { "ks-input-invalid": m.value[s(e)] }]),
                                placeholder: e.has_value ? "•••••••• set — type to replace" : "Not set",
                                value: c.value[s(e)],
                                onInput: (v) => {
                                  c.value[s(e)] = v.target.value, o(e);
                                }
                              }, null, 42, ze)) : (l(), r("input", {
                                key: 5,
                                type: "text",
                                class: O(["ks-input", { "ks-input-invalid": m.value[s(e)] }]),
                                minlength: e.schema?.minLength,
                                maxlength: e.schema?.maxLength,
                                value: c.value[s(e)],
                                onInput: (v) => {
                                  c.value[s(e)] = v.target.value, o(e);
                                }
                              }, null, 42, Ye)),
                              d.value === s(e) ? (l(), r("span", qe, [...a[2] || (a[2] = [
                                _("span", { class: "ks-saved-tick" }, "✓", -1),
                                Z(" Saved", -1)
                              ])])) : w("", !0),
                              H(I(X), {
                                type: "button",
                                label: b.value === s(e) ? "Saving…" : "Save",
                                loading: b.value === s(e),
                                disabled: b.value === s(e) || !!m.value[s(e)] || e.value_type !== "bool" && !G(e),
                                onClick: (v) => ae(e)
                              }, null, 8, ["label", "loading", "disabled", "onClick"]),
                              e.is_default ? w("", !0) : (l(), S(I(X), {
                                key: 7,
                                type: "button",
                                severity: "secondary",
                                text: "",
                                rounded: "",
                                disabled: b.value === s(e),
                                title: "Reset to default",
                                "aria-label": "Reset to default",
                                onClick: (v) => se(e)
                              }, {
                                icon: P(() => [
                                  H(I(J), {
                                    icon: "tabler:rotate",
                                    "aria-hidden": "true"
                                  })
                                ]),
                                _: 1
                              }, 8, ["disabled", "onClick"]))
                            ], 64))
                          ]),
                          m.value[s(e)] ? (l(), r("p", Qe, x(m.value[s(e)]), 1)) : w("", !0)
                        ]),
                        _: 2
                      }, 1024))
                    ]),
                    _: 2
                  }, 1032, ["class"]))), 128))
                ]),
                _: 2
              }, 1024))
            ]),
            _: 2
          }, 1032, ["class"]))
        ]))), 128))
      ], 64)) : (l(), r("div", Ae, "No settings declared."))
    ]));
  }
}), Xe = { class: "ks" }, Ze = {
  key: 0,
  class: "ks-err"
}, et = {
  key: 1,
  class: "ks-loading"
}, tt = {
  key: 2,
  class: "ks-empty"
}, nt = {
  key: 3,
  class: "ks-shell"
}, at = {
  class: "ks-nav",
  "aria-label": "Settings sections"
}, st = {
  key: 0,
  class: "ks-nav-group"
}, lt = ["onClick"], ot = { class: "ks-nav-label" }, rt = { class: "ks-pane-head" }, it = { class: "ks-pane-ico" }, ut = { class: "ks-pane-head-text" }, ct = { key: 0 }, dt = {
  key: 2,
  class: "ks-empty"
}, mt = /* @__PURE__ */ Q({
  __name: "settings",
  setup(f) {
    const k = ge(), i = K(() => {
      const u = k.value?.route;
      return typeof u == "string" && u.length ? u : "";
    }), y = L([]), $ = L(!0), b = L(""), d = L(""), c = L(!1), m = K(() => {
      const u = [];
      for (const p of y.value) {
        const g = p.group || "", U = u[u.length - 1];
        U && U.group === g ? U.items.push(p) : u.push({ group: g, items: [p] });
      }
      return u;
    }), s = K(() => y.value.find((u) => u.key === d.value) || null);
    function T(u) {
      c.value = !1, d.value = u;
    }
    function C() {
      c.value = !0;
    }
    async function N() {
      $.value = !0, b.value = "";
      try {
        const { data: u } = await W.get("/api/v1/settings/blocks");
        if (!u?.success) throw new Error(u?.error || "failed to load settings blocks");
        y.value = Array.isArray(u.blocks) ? u.blocks : [];
        const p = i.value && y.value.some((g) => g.key === i.value) ? i.value : y.value.some((g) => g.key === d.value) ? d.value : y.value[0]?.key || "";
        d.value = p, i.value === "all-settings" && !y.value.some((g) => g.key === i.value) && (c.value = !0);
      } catch (u) {
        b.value = u instanceof Error ? u.message : String(u);
      } finally {
        $.value = !1;
      }
    }
    return re(N), (u, p) => (l(), r("div", Xe, [
      b.value ? (l(), r("div", Ze, x(b.value), 1)) : w("", !0),
      $.value ? (l(), r("div", et, "Loading…")) : y.value.length ? (l(), r("div", nt, [
        _("nav", at, [
          _("button", {
            type: "button",
            class: O(["ks-nav-item", { "ks-nav-item-active": c.value }]),
            onClick: C
          }, [
            H(I(J), {
              class: "ks-nav-ico",
              icon: "tabler:table",
              "aria-hidden": "true"
            }),
            p[0] || (p[0] = _("span", { class: "ks-nav-label" }, "All settings", -1))
          ], 2),
          (l(!0), r(D, null, z(m.value, (g, U) => (l(), r("div", {
            key: U,
            class: "ks-nav-section"
          }, [
            g.group ? (l(), r("div", st, x(g.group), 1)) : w("", !0),
            (l(!0), r(D, null, z(g.items, (V) => (l(), r("button", {
              key: V.key,
              type: "button",
              class: O(["ks-nav-item", { "ks-nav-item-active": !c.value && V.key === d.value }]),
              onClick: (R) => T(V.key)
            }, [
              H(I(J), {
                class: "ks-nav-ico",
                icon: V.icon || "tabler:adjustments",
                "aria-hidden": "true"
              }, null, 8, ["icon"]),
              _("span", ot, x(V.title), 1)
            ], 10, lt))), 128))
          ]))), 128))
        ]),
        _("section", {
          class: O(["ks-pane", { "ks-pane-flush": !c.value && s.value && s.value.component_tag }])
        }, [
          c.value ? (l(), r(D, { key: 0 }, [
            p[1] || (p[1] = _("header", { class: "ks-pane-head" }, [
              _("h1", null, "All settings")
            ], -1)),
            H(ee, {
              key: "all-settings-table",
              namespace: "",
              all: "",
              blocks: y.value
            }, null, 8, ["blocks"])
          ], 64)) : s.value ? (l(), r(D, { key: 1 }, [
            s.value.component_tag ? (l(), S(ne, {
              key: s.value.key,
              tag: s.value.component_tag,
              config: s.value.config
            }, null, 8, ["tag", "config"])) : s.value.namespace ? (l(), r(D, { key: 1 }, [
              _("header", rt, [
                _("span", it, [
                  H(I(J), {
                    icon: s.value.icon || "tabler:adjustments",
                    "aria-hidden": "true"
                  }, null, 8, ["icon"])
                ]),
                _("div", ut, [
                  _("h1", null, x(s.value.title), 1),
                  typeof s.value.config?.description == "string" ? (l(), r("p", ct, x(s.value.config.description), 1)) : w("", !0)
                ])
              ]),
              (l(), S(ee, {
                key: s.value.key,
                namespace: s.value.namespace
              }, null, 8, ["namespace"]))
            ], 64)) : (l(), r("div", dt, "This block has no editor."))
          ], 64)) : w("", !0)
        ], 2)
      ])) : (l(), r("div", tt, "No settings declared."))
    ]));
  }
}), vt = { props: { type: "object", properties: { route: { type: "string", default: "", description: "Deep-link to a settings block by key. Unset selects the first block." } } } }, pt = {
  wippy: vt
};
class ft extends ie {
  static get wippyConfig() {
    return {
      propsSchema: pt.wippy.props,
      hostCssKeys: ["themeConfigUrl", "primeVueCssUrl"],
      inlineCss: ue
    };
  }
  static get vueConfig() {
    return { rootComponent: mt, plugins: [me] };
  }
}
ke(import.meta.url, ft);
//# sourceMappingURL=index.js.map

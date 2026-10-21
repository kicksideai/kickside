import { a as ie, u as ue, W as ce, s as de } from "./styles-BEaF_GAv.js";
import { s as me, a as fe, b as Z, P as pe } from "./index-8Dae-yYb.js";
import { defineComponent as Q, ref as L, onMounted as ne, watch as Y, onBeforeUnmount as ve, openBlock as o, createElementBlock as r, createElementVNode as _, nextTick as ye, computed as K, toDisplayString as C, createCommentVNode as A, Fragment as D, withDirectives as he, vModelText as ke, renderList as W, createBlock as N, resolveDynamicComponent as q, normalizeClass as T, withCtx as R, createTextVNode as ee, unref as I, createVNode as H } from "vue";
import { Icon as J } from "@iconify/vue";
import { loadByTagName as ge, api as G, define as _e } from "@wippy-fe/proxy";
const be = () => ie();
function $e(v) {
  if (!v) return null;
  let k;
  if (typeof v == "number")
    k = v;
  else {
    const i = v.trim();
    if (/^\d+$/.test(i))
      k = Number(i);
    else {
      const y = Date.parse(i);
      return Number.isNaN(y) ? null : y;
    }
  }
  return Number.isFinite(k) ? k < 1e12 ? k * 1e3 : k : null;
}
function we(v, k) {
  const i = $e(v);
  if (i === null) return "";
  const y = k?.now ?? Date.now(), x = k?.suffix ?? !0, b = k?.maxUnit ?? "day", m = k?.future ?? !1, d = 6e4, f = 60 * d, a = 24 * f, U = 30 * a, M = 365 * a, j = y - i;
  if (m && j < 0) {
    const g = -j;
    return g < d ? "in <1m" : g < f ? `in ${Math.floor(g / d)}m` : g < a ? `in ${Math.floor(g / f)}h` : `in ${Math.floor(g / a)}d`;
  }
  const u = Math.max(0, j);
  if (u < d) return "just now";
  const p = x ? " ago" : "";
  return u < f ? `${Math.floor(u / d)}m${p}` : u < a ? `${Math.floor(u / f)}h${p}` : b === "year" ? u < U ? `${Math.floor(u / a)}d${p}` : u < M ? `${Math.floor(u / U)}mo${p}` : `${Math.floor(u / M)}y${p}` : `${Math.floor(u / a)}d${p}`;
}
const xe = { class: "kx-wcmount" }, Ae = {
  key: 0,
  class: "kx-wcmount-fail",
  role: "alert"
}, Ce = /* @__PURE__ */ Q({
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
  setup(v, { emit: k }) {
    const i = v, y = k, x = L(null), b = L(!1);
    let m = null, d = 0;
    const f = /* @__PURE__ */ new Set();
    function a(l) {
      l.composedPath()[0] === m && (l.stopPropagation(), y("change", l.detail));
    }
    function U(l) {
      return l.composedPath()[0] !== m ? !1 : (l.stopPropagation(), !0);
    }
    function M(l) {
      U(l) && y("created", l.detail);
    }
    function j(l) {
      U(l) && y("close", l.detail);
    }
    function u(l) {
      U(l) && y("error", l.detail);
    }
    function p(l) {
      if (typeof l == "string") return l;
      try {
        return JSON.stringify(l ?? {});
      } catch {
        return null;
      }
    }
    function g() {
      if (!m) return;
      const l = p(i.config);
      if (l !== null && m.setAttribute("config", l), i.schema !== void 0 && i.schema !== null) {
        const h = p(i.schema);
        h !== null && m.setAttribute("schema", h);
      }
      if (i.meta !== void 0 && i.meta !== null) {
        const h = p(i.meta);
        h !== null && m.setAttribute("meta", h);
      }
      i.provider && m.setAttribute("provider", i.provider), i.label && m.setAttribute("label", i.label);
      const S = i.attrs || {};
      for (const h of [...f])
        (!(h in S) || S[h] == null) && (m.removeAttribute(h), f.delete(h));
      for (const [h, E] of Object.entries(S)) {
        if (E == null) continue;
        const F = typeof E == "object" ? p(E) : String(E);
        F !== null && (m.setAttribute(h, F), f.add(h));
      }
    }
    function O(l = m) {
      l && (l.removeEventListener("config-changed", a), l.removeEventListener("change", a), l.removeEventListener("created", M), l.removeEventListener("close", j), l.removeEventListener("error", u), l === m && (m = null), f.clear());
    }
    async function V(l) {
      if (!customElements.get(l))
        try {
          await ge(l, { timeoutMs: 8e3 });
        } catch {
        }
    }
    async function P() {
      const l = ++d, S = x.value, h = i.tag;
      if (b.value = !1, !!S && (O(), S.innerHTML = "", !!h))
        try {
          if (await V(h), l !== d || x.value !== S || i.tag !== h) return;
          const E = document.createElement(h);
          E.classList.add("kx-wcmount-surface"), m = E, g(), E.addEventListener("config-changed", a), E.addEventListener("change", a), E.addEventListener("created", M), E.addEventListener("close", j), E.addEventListener("error", u), E.style.display = "block", S.appendChild(E), b.value = !customElements.get(h);
        } catch {
          l === d && (b.value = !0);
        }
    }
    async function B() {
      b.value = !1, await ye(), await P();
    }
    return ne(P), Y(() => i.tag, P), Y(() => [i.config, i.schema, i.meta, i.provider, i.label, i.attrs], g, { deep: !0 }), ve(() => {
      d += 1, O();
    }), (l, S) => (o(), r("div", xe, [
      b.value ? (o(), r("div", Ae, [
        S[0] || (S[0] = _("span", null, "This setup panel couldn’t load.", -1)),
        _("button", {
          type: "button",
          onClick: B
        }, "Try again")
      ])) : (o(), r("div", {
        key: 1,
        ref_key: "host",
        ref: x
      }, null, 512))
    ]));
  }
}), Me = (v, k) => {
  const i = v.__vccOpts || v;
  for (const [y, x] of k)
    i[y] = x;
  return i;
}, ae = /* @__PURE__ */ Me(Ce, [["__scopeId", "data-v-3ec70c11"]]), Ee = { class: "ks-form" }, Le = {
  key: 0,
  class: "ks-err"
}, Se = {
  key: 1,
  class: "ks-loading"
}, je = {
  key: 2,
  class: "ks-empty"
}, Ne = {
  key: 0,
  class: "ks-group-head"
}, Oe = { class: "ks-group-title" }, Ue = { class: "ks-group-count" }, Te = { key: 0 }, Ve = {
  key: 0,
  class: "ks-owner"
}, Ie = { class: "ks-row-head" }, De = { class: "ks-title" }, Pe = { class: "ks-key" }, Re = {
  key: 0,
  class: "ks-tag kx-tag-caps ks-tag-on"
}, Be = {
  key: 1,
  class: "ks-tag kx-tag-caps ks-tag-on"
}, qe = {
  key: 0,
  class: "ks-field-err",
  role: "alert"
}, He = {
  key: 1,
  class: "ks-desc"
}, Ke = {
  key: 2,
  class: "ks-hint"
}, Fe = {
  key: 3,
  class: "ks-prov"
}, Je = { key: 0 }, Ge = { class: "ks-field" }, We = {
  key: 0,
  class: "ks-static"
}, ze = ["min", "max", "value", "onInput"], Ye = ["value", "onInput"], Qe = ["placeholder", "value", "onInput"], Xe = ["minlength", "maxlength", "value", "onInput"], Ze = {
  key: 6,
  class: "ks-saved"
}, et = {
  key: 0,
  class: "ks-field-err"
}, z = "General", te = /* @__PURE__ */ Q({
  __name: "SettingsForm",
  props: {
    namespace: {},
    all: { type: Boolean, default: !1 },
    blocks: { default: () => [] }
  },
  setup(v) {
    const k = v, i = L([]), y = L(!0), x = L(""), b = L(""), m = L(""), d = L({}), f = L({}), a = (e) => `${e.namespace} ${e.key}`;
    function U(e) {
      const n = e.split(/[._\-\s]+/).filter(Boolean);
      return n.length ? n.map((s, t) => t === 0 ? s.charAt(0).toUpperCase() + s.slice(1) : s).join(" ") : e;
    }
    const M = (e) => e.title && e.title.length ? e.title : U(e.key), j = L(""), u = (e) => e.owner ? e.owner : k.blocks.find((s) => s.namespace === e.namespace || s.namespaces?.includes(e.namespace))?.title || e.namespace, p = K(() => {
      if (k.all) {
        const t = j.value.trim().toLowerCase(), c = i.value.filter(($) => !t || [
          M($),
          $.key,
          $.namespace,
          u($),
          $.description || ""
        ].some((w) => w.toLowerCase().includes(t)));
        return c.sort(($, w) => u($).localeCompare(u(w)) || ($.order ?? 100) - (w.order ?? 100) || M($).localeCompare(M(w))), [{ name: z, items: c }];
      }
      const e = /* @__PURE__ */ new Map();
      for (const t of i.value) {
        const c = t.category && t.category.length ? t.category : z;
        e.has(c) || e.set(c, []), e.get(c).push(t);
      }
      const n = (t) => typeof t.order == "number" ? t.order : 100, s = [];
      for (const [t, c] of e)
        c.sort(($, w) => n($) - n(w) || M($).localeCompare(M(w))), s.push({ name: t, items: c });
      return s.sort((t, c) => {
        const $ = Math.min(...t.items.map(n)), w = Math.min(...c.items.map(n));
        return $ - w || t.name.localeCompare(c.name);
      }), s;
    }), g = K(() => p.value.length === 1 && p.value[0].name === z), O = (e) => Array.isArray(e.schema?.enum) ? e.schema.enum : null;
    function V(e) {
      return {
        namespace: e.namespace,
        key: e.key,
        value: e.value,
        value_type: e.value_type,
        default: e.default,
        has_value: e.has_value,
        is_secret: e.is_secret,
        description: e.description,
        title: M(e),
        schema: e.schema ?? null
      };
    }
    function P(e, n, s = "") {
      if (!e) return "";
      const t = (c) => s ? `${s}: ${c}` : c;
      if (e.type === "array" && !Array.isArray(n)) return t("Must be an array");
      if (e.type === "object" && (n === null || typeof n != "object" || Array.isArray(n))) return t("Must be an object");
      if (e.type === "boolean" && typeof n != "boolean") return t("Must be a boolean");
      if (e.type === "null" && n !== null) return t("Must be null");
      if (e.type === "integer" || e.type === "number") {
        if (typeof n != "number" || !Number.isFinite(n)) return t("Must be a number");
        if (e.type === "integer" && !Number.isInteger(n)) return t("Must be a whole number");
      }
      if (e.type === "string" && typeof n != "string") return t("Must be a string");
      if (typeof n == "number") {
        if (typeof e.minimum == "number" && n < e.minimum) return t(`Must be ≥ ${e.minimum}`);
        if (typeof e.maximum == "number" && n > e.maximum) return t(`Must be ≤ ${e.maximum}`);
      }
      if (typeof n == "string") {
        if (typeof e.minLength == "number" && n.length < e.minLength) return t(`Must be at least ${e.minLength} characters`);
        if (typeof e.maxLength == "number" && n.length > e.maxLength) return t(`Must be at most ${e.maxLength} characters`);
        if (e.pattern && !new RegExp(e.pattern).test(n)) return t("Does not match the required format");
      }
      if (Array.isArray(e.enum) && !e.enum.includes(n))
        return t(`Must be one of: ${e.enum.join(", ")}`);
      if (Array.isArray(n) && e.items)
        for (let c = 0; c < n.length; c++) {
          const $ = P(e.items, n[c], `${s}[${c}]`);
          if ($) return $;
        }
      if (n !== null && typeof n == "object" && !Array.isArray(n)) {
        const c = n, $ = (w) => s ? `${s}.${w}` : w;
        for (const w of e.required ?? [])
          if (!Object.hasOwn(c, w)) return `${$(w)}: Required`;
        for (const [w, le] of Object.entries(e.properties ?? {})) {
          if (!Object.hasOwn(c, w)) continue;
          const X = P(le, c[w], $(w));
          if (X) return X;
        }
      }
      return "";
    }
    function B(e) {
      if (!e) return "";
      const n = [];
      if (e.type && n.push(e.type), typeof e.minimum == "number" || typeof e.maximum == "number") {
        const s = typeof e.minimum == "number" ? e.minimum : "−∞", t = typeof e.maximum == "number" ? e.maximum : "∞";
        n.push(`range ${s}–${t}`);
      }
      (typeof e.minLength == "number" || typeof e.maxLength == "number") && n.push(`length ${e.minLength ?? 0}–${e.maxLength ?? "∞"}`), e.pattern && n.push(`pattern ${e.pattern}`), Array.isArray(e.enum) && n.push(`one of ${e.enum.join(", ")}`), e.required?.length && n.push(`required: ${e.required.join(", ")}`), e.items && n.push(`items: ${B(e.items)}`);
      for (const [s, t] of Object.entries(e.properties ?? {}))
        n.push(`${s}: ${B(t)}`);
      return n.join(" · ");
    }
    function l(e) {
      const n = a(e);
      if (e.value_type === "secret" && !String(d.value[n] ?? "").length)
        return delete f.value[n], "";
      let s = d.value[n], t;
      try {
        e.value_type === "json" ? s = JSON.parse(String(s)) : ((e.value_type === "int" || e.schema?.type === "integer" || e.schema?.type === "number") && (s = Number(s)), e.schema?.type === "string" && (s = String(s))), t = P(e.schema, s);
      } catch (c) {
        t = c instanceof Error ? c.message : String(c);
      }
      return t ? f.value[n] = t : delete f.value[n], t;
    }
    function S(e) {
      if (e.value_type === "secret") {
        d.value[a(e)] = "";
        return;
      }
      d.value[a(e)] = e.value_type === "json" ? JSON.stringify(e.value, null, 2) : e.value;
    }
    async function h() {
      y.value = !0, x.value = "";
      try {
        const e = k.all ? "/api/v1/settings" : `/api/v1/settings?namespace=${encodeURIComponent(k.namespace)}`, { data: n } = await G.get(e);
        if (!n?.success) throw new Error(n?.error || "failed to load settings");
        i.value = Array.isArray(n.settings) ? n.settings : [];
        for (const s of i.value) S(s);
      } catch (e) {
        x.value = e instanceof Error ? e.message : String(e);
      } finally {
        y.value = !1;
      }
    }
    function E(e, n) {
      switch (e.value_type) {
        case "int":
          return Math.trunc(Number(n));
        case "bool":
          return !!n;
        case "json":
          return JSON.parse(String(n));
        default:
          return String(n);
      }
    }
    const F = (e) => {
      const n = d.value[a(e)];
      return e.value_type === "secret" ? String(n ?? "").length > 0 : e.value_type === "json" ? n !== JSON.stringify(e.value, null, 2) : n !== e.value;
    };
    async function oe(e) {
      const n = a(e);
      if (!l(e)) {
        b.value = n, x.value = "";
        try {
          const s = E(e, d.value[n]), { data: t } = await G.put("/api/v1/settings", { namespace: e.namespace, key: e.key, value: s });
          if (!t?.success) {
            f.value[n] = t?.error || "save failed";
            return;
          }
          delete f.value[n], m.value = n, setTimeout(() => {
            m.value === n && (m.value = "");
          }, 2e3), await h();
        } catch (s) {
          f.value[n] = s instanceof Error ? s.message : String(s);
        } finally {
          b.value = "";
        }
      }
    }
    async function se(e) {
      const n = a(e);
      b.value = n, x.value = "";
      try {
        const { data: s } = await G.put("/api/v1/settings", { namespace: e.namespace, key: e.key, value: null });
        if (!s?.success) throw new Error(s?.error || "reset failed");
        await h();
      } catch (s) {
        x.value = s instanceof Error ? s.message : String(s);
      } finally {
        b.value = "";
      }
    }
    async function re() {
      await h();
    }
    return Y(() => [k.namespace, k.all], h), ne(h), (e, n) => (o(), r("div", Ee, [
      x.value ? (o(), r("div", Le, C(x.value), 1)) : A("", !0),
      y.value ? (o(), r("div", Se, "Loading…")) : i.value.length ? (o(), r(D, { key: 3 }, [
        v.all ? he((o(), r("input", {
          key: 0,
          "onUpdate:modelValue": n[0] || (n[0] = (s) => j.value = s),
          type: "search",
          class: "ks-input ks-all-search",
          "aria-label": "Search settings",
          placeholder: "Search settings"
        }, null, 512)), [
          [ke, j.value]
        ]) : A("", !0),
        (o(!0), r(D, null, W(p.value, (s) => (o(), r("section", {
          key: s.name,
          class: "ks-group"
        }, [
          g.value ? A("", !0) : (o(), r("div", Ne, [
            _("h2", Oe, C(s.name), 1),
            _("span", Ue, C(s.items.length), 1)
          ])),
          (o(), N(q(v.all ? "table" : "div"), {
            class: T(["ks-list", { "ks-all-table": v.all }])
          }, {
            default: R(() => [
              v.all ? (o(), r("thead", Te, [...n[1] || (n[1] = [
                _("tr", null, [
                  _("th", { scope: "col" }, "Owner"),
                  _("th", { scope: "col" }, "Setting"),
                  _("th", { scope: "col" }, "Value")
                ], -1)
              ])])) : A("", !0),
              (o(), N(q(v.all ? "tbody" : "div"), null, {
                default: R(() => [
                  (o(!0), r(D, null, W(s.items, (t) => (o(), N(q(v.all ? "tr" : "div"), {
                    key: a(t),
                    class: T(["ks-row", { "ks-row-invalid": t.error || f.value[a(t)], "ks-row-wc": t.ui }])
                  }, {
                    default: R(() => [
                      v.all ? (o(), r("td", Ve, C(u(t)), 1)) : A("", !0),
                      (o(), N(q(v.all ? "td" : "div"), { class: "ks-row-main" }, {
                        default: R(() => [
                          _("div", Ie, [
                            _("span", De, C(M(t)), 1),
                            _("code", Pe, C(t.key), 1),
                            t.is_secret && t.has_value ? (o(), r("span", Re, "set")) : !t.is_default && !t.is_secret ? (o(), r("span", Be, "overridden")) : A("", !0)
                          ]),
                          t.error ? (o(), r("p", qe, C(t.error), 1)) : A("", !0),
                          t.description ? (o(), r("p", He, C(t.description), 1)) : A("", !0),
                          B(t.schema) ? (o(), r("p", Ke, C(B(t.schema)), 1)) : A("", !0),
                          !t.is_default && t.updated_by ? (o(), r("p", Fe, [
                            ee("by " + C(t.updated_by), 1),
                            t.updated_at ? (o(), r("span", Je, " · " + C(I(we)(t.updated_at)), 1)) : A("", !0)
                          ])) : A("", !0)
                        ]),
                        _: 2
                      }, 1024)),
                      t.ui ? (o(), N(q(v.all ? "td" : "div"), {
                        key: 1,
                        class: "ks-wc-slot"
                      }, {
                        default: R(() => [
                          (o(), N(ae, {
                            key: a(t),
                            tag: t.ui,
                            config: V(t),
                            onChange: re
                          }, null, 8, ["tag", "config"]))
                        ]),
                        _: 2
                      }, 1024)) : (o(), N(q(v.all ? "td" : "div"), {
                        key: 2,
                        class: "ks-control"
                      }, {
                        default: R(() => [
                          _("div", Ge, [
                            t.editable === !1 ? (o(), r("span", We, C(t.value), 1)) : (o(), r(D, { key: 1 }, [
                              t.value_type === "bool" ? (o(), N(I(me), {
                                key: 0,
                                "model-value": !!d.value[a(t)],
                                "aria-label": M(t),
                                "onUpdate:modelValue": (c) => d.value[a(t)] = c
                              }, null, 8, ["model-value", "aria-label", "onUpdate:modelValue"])) : O(t) ? (o(), N(I(fe), {
                                key: 1,
                                class: T(["ks-select", { "ks-select-invalid": f.value[a(t)] }]),
                                "model-value": d.value[a(t)],
                                options: O(t),
                                "onUpdate:modelValue": (c) => {
                                  d.value[a(t)] = c, l(t);
                                }
                              }, null, 8, ["class", "model-value", "options", "onUpdate:modelValue"])) : t.value_type === "int" ? (o(), r("input", {
                                key: 2,
                                type: "number",
                                class: T(["ks-input", { "ks-input-invalid": f.value[a(t)] }]),
                                min: t.schema?.minimum,
                                max: t.schema?.maximum,
                                value: d.value[a(t)],
                                onInput: (c) => {
                                  d.value[a(t)] = Number(c.target.value), l(t);
                                }
                              }, null, 42, ze)) : t.value_type === "json" ? (o(), r("textarea", {
                                key: 3,
                                rows: "4",
                                class: T(["ks-input", { "ks-input-invalid": f.value[a(t)] }]),
                                value: d.value[a(t)],
                                onInput: (c) => {
                                  d.value[a(t)] = c.target.value, l(t);
                                }
                              }, null, 42, Ye)) : t.value_type === "secret" ? (o(), r("input", {
                                key: 4,
                                type: "password",
                                autocomplete: "off",
                                class: T(["ks-input", { "ks-input-invalid": f.value[a(t)] }]),
                                placeholder: t.has_value ? "•••••••• set — type to replace" : "Not set",
                                value: d.value[a(t)],
                                onInput: (c) => {
                                  d.value[a(t)] = c.target.value, l(t);
                                }
                              }, null, 42, Qe)) : (o(), r("input", {
                                key: 5,
                                type: "text",
                                class: T(["ks-input", { "ks-input-invalid": f.value[a(t)] }]),
                                minlength: t.schema?.minLength,
                                maxlength: t.schema?.maxLength,
                                value: d.value[a(t)],
                                onInput: (c) => {
                                  d.value[a(t)] = c.target.value, l(t);
                                }
                              }, null, 42, Xe)),
                              m.value === a(t) ? (o(), r("span", Ze, [...n[2] || (n[2] = [
                                _("span", { class: "ks-saved-tick" }, "✓", -1),
                                ee(" Saved", -1)
                              ])])) : A("", !0),
                              H(I(Z), {
                                type: "button",
                                label: b.value === a(t) ? "Saving…" : "Save",
                                loading: b.value === a(t),
                                disabled: b.value === a(t) || !!f.value[a(t)] || t.value_type !== "bool" && !F(t),
                                onClick: (c) => oe(t)
                              }, null, 8, ["label", "loading", "disabled", "onClick"]),
                              t.is_default ? A("", !0) : (o(), N(I(Z), {
                                key: 7,
                                type: "button",
                                severity: "secondary",
                                text: "",
                                rounded: "",
                                disabled: b.value === a(t),
                                title: "Reset to default",
                                "aria-label": "Reset to default",
                                onClick: (c) => se(t)
                              }, {
                                icon: R(() => [
                                  H(I(J), {
                                    icon: "tabler:rotate",
                                    "aria-hidden": "true"
                                  })
                                ]),
                                _: 1
                              }, 8, ["disabled", "onClick"]))
                            ], 64))
                          ]),
                          f.value[a(t)] ? (o(), r("p", et, C(f.value[a(t)]), 1)) : A("", !0)
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
      ], 64)) : (o(), r("div", je, "No settings declared."))
    ]));
  }
}), tt = { class: "ks" }, nt = {
  key: 0,
  class: "ks-err"
}, at = {
  key: 1,
  class: "ks-loading"
}, ot = {
  key: 2,
  class: "ks-empty"
}, st = {
  key: 3,
  class: "ks-shell"
}, rt = {
  class: "ks-nav",
  "aria-label": "Settings sections"
}, lt = {
  key: 0,
  class: "ks-nav-group"
}, it = ["onClick"], ut = { class: "ks-nav-label" }, ct = { class: "ks-pane-head" }, dt = { class: "ks-pane-ico" }, mt = { class: "ks-pane-head-text" }, ft = { key: 0 }, pt = {
  key: 2,
  class: "ks-empty"
}, vt = /* @__PURE__ */ Q({
  __name: "settings",
  setup(v) {
    const k = be(), i = K(() => {
      const u = k.value?.route;
      return typeof u == "string" && u.length ? u : "";
    }), y = L([]), x = L(!0), b = L(""), m = L(""), d = L(!1), f = K(() => {
      const u = [];
      for (const p of y.value) {
        const g = p.group || "", O = u[u.length - 1];
        O && O.group === g ? O.items.push(p) : u.push({ group: g, items: [p] });
      }
      return u;
    }), a = K(() => y.value.find((u) => u.key === m.value) || null);
    function U(u) {
      d.value = !1, m.value = u;
    }
    function M() {
      d.value = !0;
    }
    async function j() {
      x.value = !0, b.value = "";
      try {
        const { data: u } = await G.get("/api/v1/settings/blocks");
        if (!u?.success) throw new Error(u?.error || "failed to load settings blocks");
        y.value = Array.isArray(u.blocks) ? u.blocks : [];
        const p = i.value && y.value.some((g) => g.key === i.value) ? i.value : y.value.some((g) => g.key === m.value) ? m.value : y.value[0]?.key || "";
        m.value = p, i.value === "all-settings" && !y.value.some((g) => g.key === i.value) && (d.value = !0);
      } catch (u) {
        b.value = u instanceof Error ? u.message : String(u);
      } finally {
        x.value = !1;
      }
    }
    return ue(j), (u, p) => (o(), r("div", tt, [
      b.value ? (o(), r("div", nt, C(b.value), 1)) : A("", !0),
      x.value ? (o(), r("div", at, "Loading…")) : y.value.length ? (o(), r("div", st, [
        _("nav", rt, [
          _("button", {
            type: "button",
            class: T(["ks-nav-item", { "ks-nav-item-active": d.value }]),
            onClick: M
          }, [
            H(I(J), {
              class: "ks-nav-ico",
              icon: "tabler:table",
              "aria-hidden": "true"
            }),
            p[0] || (p[0] = _("span", { class: "ks-nav-label" }, "All settings", -1))
          ], 2),
          (o(!0), r(D, null, W(f.value, (g, O) => (o(), r("div", {
            key: O,
            class: "ks-nav-section"
          }, [
            g.group ? (o(), r("div", lt, C(g.group), 1)) : A("", !0),
            (o(!0), r(D, null, W(g.items, (V) => (o(), r("button", {
              key: V.key,
              type: "button",
              class: T(["ks-nav-item", { "ks-nav-item-active": !d.value && V.key === m.value }]),
              onClick: (P) => U(V.key)
            }, [
              H(I(J), {
                class: "ks-nav-ico",
                icon: V.icon || "tabler:adjustments",
                "aria-hidden": "true"
              }, null, 8, ["icon"]),
              _("span", ut, C(V.title), 1)
            ], 10, it))), 128))
          ]))), 128))
        ]),
        _("section", {
          class: T(["ks-pane", { "ks-pane-flush": !d.value && a.value && a.value.component_tag }])
        }, [
          d.value ? (o(), r(D, { key: 0 }, [
            p[1] || (p[1] = _("header", { class: "ks-pane-head" }, [
              _("h1", null, "All settings")
            ], -1)),
            H(te, {
              key: "all-settings-table",
              namespace: "",
              all: "",
              blocks: y.value
            }, null, 8, ["blocks"])
          ], 64)) : a.value ? (o(), r(D, { key: 1 }, [
            a.value.component_tag ? (o(), N(ae, {
              key: a.value.key,
              tag: a.value.component_tag,
              config: a.value.config
            }, null, 8, ["tag", "config"])) : a.value.namespace ? (o(), r(D, { key: 1 }, [
              _("header", ct, [
                _("span", dt, [
                  H(I(J), {
                    icon: a.value.icon || "tabler:adjustments",
                    "aria-hidden": "true"
                  }, null, 8, ["icon"])
                ]),
                _("div", mt, [
                  _("h1", null, C(a.value.title), 1),
                  typeof a.value.config?.description == "string" ? (o(), r("p", ft, C(a.value.config.description), 1)) : A("", !0)
                ])
              ]),
              (o(), N(te, {
                key: a.value.key,
                namespace: a.value.namespace
              }, null, 8, ["namespace"]))
            ], 64)) : (o(), r("div", pt, "This block has no editor."))
          ], 64)) : A("", !0)
        ], 2)
      ])) : (o(), r("div", ot, "No settings declared."))
    ]));
  }
}), yt = { props: { type: "object", properties: { route: { type: "string", default: "", description: "Deep-link to a settings block by key. Unset selects the first block." } } } }, ht = {
  wippy: yt
};
class kt extends ce {
  static get wippyConfig() {
    return {
      propsSchema: ht.wippy.props,
      hostCssKeys: ["themeConfigUrl", "primeVueCssUrl"],
      inlineCss: de
    };
  }
  static get vueConfig() {
    return { rootComponent: vt, plugins: [pe] };
  }
}
_e(import.meta.url, kt);
//# sourceMappingURL=index.js.map

import { a as pe, u as ve, P as ye } from "./wc-runtime-4lROyJyk.js";
import { defineComponent as z, computed as D, openBlock as n, createElementBlock as s, Fragment as N, renderList as H, normalizeClass as q, toDisplayString as S, createCommentVNode as $, createBlock as M, unref as L, createElementVNode as w, ref as C, useId as he, watch as ge, onMounted as ke, withDirectives as be, vModelText as _e, resolveDynamicComponent as R, withCtx as E, createTextVNode as te, mergeProps as P, createVNode as B } from "vue";
import { Icon as Q } from "@iconify/vue";
import { _ as Y, s as $e, a as we, b as ae, c as ne } from "./setting-change-Dp6CFrHB.js";
import { api as F } from "@wippy-fe/proxy";
const xe = ["aria-label"], Se = {
  key: 0,
  class: "kx-settings-rail-group"
}, Ae = ["aria-current", "onClick"], Me = { class: "kx-settings-rail-label" }, Ce = /* @__PURE__ */ z({
  __name: "SettingsRail",
  props: {
    label: {},
    value: {},
    groups: {},
    leadingItem: {}
  },
  emits: ["update:value"],
  setup(p) {
    const m = p, y = D(() => m.leadingItem ? [{ items: [m.leadingItem] }, ...m.groups] : m.groups);
    function h(g) {
      const f = [...g.currentTarget.querySelectorAll(".kx-settings-rail-item")], v = f.indexOf(g.target);
      if (v < 0) return;
      let u;
      switch (g.key) {
        case "ArrowDown":
        case "ArrowRight":
          u = (v + 1) % f.length;
          break;
        case "ArrowUp":
        case "ArrowLeft":
          u = (v + f.length - 1) % f.length;
          break;
        case "Home":
          u = 0;
          break;
        case "End":
          u = f.length - 1;
          break;
        default:
          return;
      }
      g.preventDefault(), f[u]?.focus();
    }
    return (g, f) => (n(), s("nav", {
      class: "kx-settings-rail",
      "aria-label": p.label,
      onKeydown: h
    }, [
      (n(!0), s(N, null, H(y.value, (v, u) => (n(), s("div", {
        key: v.items[0]?.value ?? u,
        class: q(["kx-settings-rail-section", { "kx-settings-rail-leading": p.leadingItem && u === 0 }])
      }, [
        v.heading ? (n(), s("div", Se, S(v.heading), 1)) : $("", !0),
        (n(!0), s(N, null, H(v.items, (c) => (n(), s("button", {
          key: c.value,
          type: "button",
          class: "kx-settings-rail-item",
          "aria-current": c.value === p.value ? "true" : void 0,
          onClick: (r) => g.$emit("update:value", c.value)
        }, [
          c.icon ? (n(), M(L(Q), {
            key: 0,
            class: "kx-settings-rail-icon",
            icon: c.icon,
            "aria-hidden": "true"
          }, null, 8, ["icon"])) : $("", !0),
          w("span", Me, S(c.label), 1)
        ], 8, Ae))), 128))
      ], 2))), 128))
    ], 40, xe));
  }
}), je = () => pe();
function Ne(p) {
  if (!p) return null;
  let m;
  if (typeof p == "number")
    m = p;
  else {
    const y = p.trim();
    if (/^\d+$/.test(y))
      m = Number(y);
    else {
      const h = Date.parse(y);
      return Number.isNaN(h) ? null : h;
    }
  }
  return Number.isFinite(m) ? m < 1e12 ? m * 1e3 : m : null;
}
function Ie(p, m) {
  const y = Ne(p);
  if (y === null) return "";
  const h = m?.now ?? Date.now(), g = m?.suffix ?? !0, f = m?.maxUnit ?? "day", v = m?.future ?? !1, u = 6e4, c = 60 * u, r = 24 * c, _ = 30 * r, A = 365 * r, j = h - y;
  if (v && j < 0) {
    const d = -j;
    return d < u ? "in <1m" : d < c ? `in ${Math.floor(d / u)}m` : d < r ? `in ${Math.floor(d / c)}h` : `in ${Math.floor(d / r)}d`;
  }
  const o = Math.max(0, j);
  if (o < u) return "just now";
  const x = g ? " ago" : "";
  return o < c ? `${Math.floor(o / u)}m${x}` : o < r ? `${Math.floor(o / c)}h${x}` : f === "year" ? o < _ ? `${Math.floor(o / r)}d${x}` : o < A ? `${Math.floor(o / _)}mo${x}` : `${Math.floor(o / A)}y${x}` : `${Math.floor(o / r)}d${x}`;
}
const Le = { class: "ks-form" }, Oe = {
  key: 0,
  class: "ks-err"
}, Ee = {
  key: 1,
  class: "ks-loading"
}, Ue = {
  key: 2,
  class: "ks-empty"
}, Re = {
  key: 0,
  class: "ks-group-head"
}, De = { class: "ks-group-title" }, Ve = { class: "ks-group-count" }, Te = { key: 0 }, qe = {
  key: 0,
  class: "ks-owner"
}, Be = { class: "ks-row-head" }, Pe = ["id"], Fe = { class: "ks-key" }, He = {
  key: 0,
  class: "ks-tag kx-tag-caps ks-tag-on"
}, Ke = {
  key: 1,
  class: "ks-tag kx-tag-caps ks-tag-on"
}, Je = ["id"], Ge = ["id"], Ye = ["id"], ze = {
  key: 3,
  class: "ks-prov"
}, Qe = { key: 0 }, We = { class: "ks-field" }, Xe = {
  key: 0,
  class: "ks-static"
}, Ze = ["min", "max", "value", "onInput"], et = ["value", "onInput"], tt = ["placeholder", "value", "onInput"], at = ["minlength", "maxlength", "value", "onInput"], nt = {
  key: 7,
  class: "ks-saved"
}, lt = ["id"], G = "General", le = /* @__PURE__ */ z({
  __name: "SettingsForm",
  props: {
    namespace: {},
    all: { type: Boolean, default: !1 },
    blocks: { default: () => [] }
  },
  setup(p) {
    const m = p, y = C([]), h = C(!0), g = C(""), f = C(""), v = C(""), u = C({}), c = C({}), r = (e) => `${e.namespace} ${e.key}`, _ = he(), A = (e, a) => `${_}-${encodeURIComponent(e.namespace)}-${encodeURIComponent(e.key)}-${a}`, j = (e) => [
      e.description && A(e, "description"),
      V(e.schema) && A(e, "hint"),
      e.error && A(e, "error"),
      c.value[r(e)] && A(e, "validation")
    ].filter(Boolean).join(" ") || void 0, o = (e) => ({
      "aria-labelledby": A(e, "title"),
      "aria-describedby": j(e),
      "aria-invalid": !!(e.error || c.value[r(e)]) || void 0
    });
    function x(e) {
      const a = e.split(/[._\-\s]+/).filter(Boolean);
      return a.length ? a.map((l, t) => t === 0 ? l.charAt(0).toUpperCase() + l.slice(1) : l).join(" ") : e;
    }
    const d = (e) => e.title && e.title.length ? e.title : x(e.key), U = C(""), I = (e) => e.owner ? e.owner : m.blocks.find((l) => l.namespace === e.namespace || l.namespaces?.includes(e.namespace))?.title || e.namespace, K = D(() => {
      if (m.all) {
        const t = U.value.trim().toLowerCase(), i = y.value.filter((k) => !t || [
          d(k),
          k.key,
          k.namespace,
          I(k),
          k.description || ""
        ].some((b) => b.toLowerCase().includes(t)));
        return i.sort((k, b) => I(k).localeCompare(I(b)) || (k.order ?? 100) - (b.order ?? 100) || d(k).localeCompare(d(b))), [{ name: G, items: i }];
      }
      const e = /* @__PURE__ */ new Map();
      for (const t of y.value) {
        const i = t.category && t.category.length ? t.category : G;
        e.has(i) || e.set(i, []), e.get(i).push(t);
      }
      const a = (t) => typeof t.order == "number" ? t.order : 100, l = [];
      for (const [t, i] of e)
        i.sort((k, b) => a(k) - a(b) || d(k).localeCompare(d(b))), l.push({ name: t, items: i });
      return l.sort((t, i) => {
        const k = Math.min(...t.items.map(a)), b = Math.min(...i.items.map(a));
        return k - b || t.name.localeCompare(i.name);
      }), l;
    }), re = D(() => K.value.length === 1 && K.value[0].name === G), W = (e) => Array.isArray(e.schema?.enum) ? e.schema.enum : null;
    function oe(e) {
      return {
        namespace: e.namespace,
        key: e.key,
        value: e.value,
        value_type: e.value_type,
        default: e.default,
        has_value: e.has_value,
        is_secret: e.is_secret,
        description: e.description,
        title: d(e),
        schema: e.schema ?? null
      };
    }
    function J(e, a, l = "") {
      if (!e) return "";
      const t = (i) => l ? `${l}: ${i}` : i;
      if (e.type === "array" && !Array.isArray(a)) return t("Must be an array");
      if (e.type === "object" && (a === null || typeof a != "object" || Array.isArray(a))) return t("Must be an object");
      if (e.type === "boolean" && typeof a != "boolean") return t("Must be a boolean");
      if (e.type === "null" && a !== null) return t("Must be null");
      if (e.type === "integer" || e.type === "number") {
        if (typeof a != "number" || !Number.isFinite(a)) return t("Must be a number");
        if (e.type === "integer" && !Number.isInteger(a)) return t("Must be a whole number");
      }
      if (e.type === "string" && typeof a != "string") return t("Must be a string");
      if (typeof a == "number") {
        if (typeof e.minimum == "number" && a < e.minimum) return t(`Must be ≥ ${e.minimum}`);
        if (typeof e.maximum == "number" && a > e.maximum) return t(`Must be ≤ ${e.maximum}`);
      }
      if (typeof a == "string") {
        if (typeof e.minLength == "number" && a.length < e.minLength) return t(`Must be at least ${e.minLength} characters`);
        if (typeof e.maxLength == "number" && a.length > e.maxLength) return t(`Must be at most ${e.maxLength} characters`);
        if (e.pattern && !new RegExp(e.pattern).test(a)) return t("Does not match the required format");
      }
      if (Array.isArray(e.enum) && !e.enum.includes(a))
        return t(`Must be one of: ${e.enum.join(", ")}`);
      if (Array.isArray(a) && e.items)
        for (let i = 0; i < a.length; i++) {
          const k = J(e.items, a[i], `${l}[${i}]`);
          if (k) return k;
        }
      if (a !== null && typeof a == "object" && !Array.isArray(a)) {
        const i = a, k = (b) => l ? `${l}.${b}` : b;
        for (const b of e.required ?? [])
          if (!Object.hasOwn(i, b)) return `${k(b)}: Required`;
        for (const [b, fe] of Object.entries(e.properties ?? {})) {
          if (!Object.hasOwn(i, b)) continue;
          const ee = J(fe, i[b], k(b));
          if (ee) return ee;
        }
      }
      return "";
    }
    function V(e) {
      if (!e) return "";
      const a = [];
      if (e.type && a.push(e.type), typeof e.minimum == "number" || typeof e.maximum == "number") {
        const l = typeof e.minimum == "number" ? e.minimum : "−∞", t = typeof e.maximum == "number" ? e.maximum : "∞";
        a.push(`range ${l}–${t}`);
      }
      (typeof e.minLength == "number" || typeof e.maxLength == "number") && a.push(`length ${e.minLength ?? 0}–${e.maxLength ?? "∞"}`), e.pattern && a.push(`pattern ${e.pattern}`), Array.isArray(e.enum) && a.push(`one of ${e.enum.join(", ")}`), e.required?.length && a.push(`required: ${e.required.join(", ")}`), e.items && a.push(`items: ${V(e.items)}`);
      for (const [l, t] of Object.entries(e.properties ?? {}))
        a.push(`${l}: ${V(t)}`);
      return a.join(" · ");
    }
    function O(e) {
      const a = r(e);
      if (e.value_type === "secret" && !String(u.value[a] ?? "").length)
        return delete c.value[a], "";
      let l = u.value[a], t;
      try {
        e.value_type === "json" ? l = JSON.parse(String(l)) : ((e.value_type === "int" || e.schema?.type === "integer" || e.schema?.type === "number") && (l = Number(l)), e.schema?.type === "string" && (l = String(l))), t = J(e.schema, l);
      } catch (i) {
        t = i instanceof Error ? i.message : String(i);
      }
      return t ? c.value[a] = t : delete c.value[a], t;
    }
    function X(e, a) {
      u.value[r(e)] = e.value_type === "json" ? JSON.stringify(a, null, 2) : a;
    }
    function ie(e) {
      X(e, e.value_type === "secret" ? "" : e.value);
    }
    function se(e, a) {
      X(e, a), O(e);
    }
    async function T() {
      h.value = !0, g.value = "";
      try {
        const e = m.all ? "/api/v1/settings" : `/api/v1/settings?namespace=${encodeURIComponent(m.namespace)}`, { data: a } = await F.get(e);
        if (!a?.success) throw new Error(a?.error || "failed to load settings");
        y.value = Array.isArray(a.settings) ? a.settings : [];
        for (const l of y.value) ie(l);
      } catch (e) {
        g.value = e instanceof Error ? e.message : String(e);
      } finally {
        h.value = !1;
      }
    }
    function Z(e, a) {
      switch (e.value_type) {
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
    const ue = (e) => {
      const a = u.value[r(e)];
      return e.value_type === "secret" ? String(a ?? "").length > 0 : e.value_type === "json" ? a !== JSON.stringify(e.value, null, 2) : a !== e.value;
    };
    async function ce(e) {
      const a = r(e);
      if (!O(e) && !f.value) {
        f.value = a, g.value = "";
        try {
          const l = Z(e, u.value[a]);
          if (!await ne(e, l, d(e), "Save")) return;
          const { data: t } = await F.put("/api/v1/settings", { namespace: e.namespace, key: e.key, value: l });
          if (!t?.success) {
            c.value[a] = t?.error || "save failed";
            return;
          }
          delete c.value[a], v.value = a, setTimeout(() => {
            v.value === a && (v.value = "");
          }, 2e3), await T();
        } catch (l) {
          c.value[a] = l instanceof Error ? l.message : String(l);
        } finally {
          f.value = "";
        }
      }
    }
    async function de(e) {
      if (f.value) return;
      const a = r(e);
      f.value = a, g.value = "";
      try {
        if (!await ne(e, e.default, d(e), "Reset to default")) return;
        const { data: l } = await F.put("/api/v1/settings", { namespace: e.namespace, key: e.key, value: null });
        if (!l?.success) throw new Error(l?.error || "reset failed");
        await T();
      } catch (l) {
        g.value = l instanceof Error ? l.message : String(l);
      } finally {
        f.value = "";
      }
    }
    async function me() {
      await T();
    }
    return ge(() => [m.namespace, m.all], T), ke(T), (e, a) => (n(), s("div", Le, [
      g.value ? (n(), s("div", Oe, S(g.value), 1)) : $("", !0),
      h.value ? (n(), s("div", Ee, "Loading…")) : y.value.length ? (n(), s(N, { key: 3 }, [
        p.all ? be((n(), s("input", {
          key: 0,
          "onUpdate:modelValue": a[0] || (a[0] = (l) => U.value = l),
          type: "search",
          class: "ks-input ks-all-search",
          "aria-label": "Search settings",
          placeholder: "Search settings"
        }, null, 512)), [
          [_e, U.value]
        ]) : $("", !0),
        (n(!0), s(N, null, H(K.value, (l) => (n(), s("section", {
          key: l.name,
          class: "ks-group"
        }, [
          re.value ? $("", !0) : (n(), s("div", Re, [
            w("h2", De, S(l.name), 1),
            w("span", Ve, S(l.items.length), 1)
          ])),
          (n(), M(R(p.all ? "table" : "div"), {
            class: q(["ks-list", { "ks-all-table": p.all }])
          }, {
            default: E(() => [
              p.all ? (n(), s("thead", Te, [...a[1] || (a[1] = [
                w("tr", null, [
                  w("th", { scope: "col" }, "Owner"),
                  w("th", { scope: "col" }, "Setting"),
                  w("th", { scope: "col" }, "Value")
                ], -1)
              ])])) : $("", !0),
              (n(), M(R(p.all ? "tbody" : "div"), null, {
                default: E(() => [
                  (n(!0), s(N, null, H(l.items, (t) => (n(), M(R(p.all ? "tr" : "div"), {
                    key: r(t),
                    class: q(["ks-row", { "ks-row-invalid": t.error || c.value[r(t)], "ks-row-wc": t.ui }])
                  }, {
                    default: E(() => [
                      p.all ? (n(), s("td", qe, S(I(t)), 1)) : $("", !0),
                      (n(), M(R(p.all ? "td" : "div"), { class: "ks-row-main" }, {
                        default: E(() => [
                          w("div", Be, [
                            w("span", {
                              id: A(t, "title"),
                              class: "ks-title"
                            }, S(d(t)), 9, Pe),
                            w("code", Fe, S(t.key), 1),
                            t.is_secret && t.has_value ? (n(), s("span", He, "set")) : !t.is_default && !t.is_secret ? (n(), s("span", Ke, "overridden")) : $("", !0)
                          ]),
                          t.error ? (n(), s("p", {
                            key: 0,
                            id: A(t, "error"),
                            class: "ks-field-err",
                            role: "alert"
                          }, S(t.error), 9, Je)) : $("", !0),
                          t.description ? (n(), s("p", {
                            key: 1,
                            id: A(t, "description"),
                            class: "ks-desc"
                          }, S(t.description), 9, Ge)) : $("", !0),
                          V(t.schema) ? (n(), s("p", {
                            key: 2,
                            id: A(t, "hint"),
                            class: "ks-hint"
                          }, S(V(t.schema)), 9, Ye)) : $("", !0),
                          !t.is_default && t.updated_by ? (n(), s("p", ze, [
                            te("by " + S(t.updated_by), 1),
                            t.updated_at ? (n(), s("span", Qe, " · " + S(L(Ie)(t.updated_at)), 1)) : $("", !0)
                          ])) : $("", !0)
                        ]),
                        _: 2
                      }, 1024)),
                      t.ui ? (n(), M(R(p.all ? "td" : "div"), {
                        key: 1,
                        class: "ks-wc-slot"
                      }, {
                        default: E(() => [
                          (n(), M(Y, {
                            key: r(t),
                            tag: t.ui,
                            config: oe(t),
                            label: d(t),
                            attrs: { role: "group", ...o(t) },
                            onChange: me
                          }, null, 8, ["tag", "config", "label", "attrs"]))
                        ]),
                        _: 2
                      }, 1024)) : (n(), M(R(p.all ? "td" : "div"), {
                        key: 2,
                        class: "ks-control"
                      }, {
                        default: E(() => [
                          w("div", We, [
                            t.editable === !1 ? (n(), s("span", Xe, S(t.value), 1)) : (n(), s(N, { key: 1 }, [
                              t.control ? (n(), M(Y, {
                                key: 0,
                                tag: t.control.tag,
                                label: d(t),
                                attrs: { ...t.control.props, role: "group", description: t.description, ...o(t), value: Z(t, u.value[r(t)]) },
                                onSelect: (i) => se(t, i)
                              }, null, 8, ["tag", "label", "attrs", "onSelect"])) : t.value_type === "bool" ? (n(), M(L($e), {
                                key: 1,
                                pt: { input: o(t) },
                                "model-value": !!u.value[r(t)],
                                "onUpdate:modelValue": (i) => u.value[r(t)] = i
                              }, null, 8, ["pt", "model-value", "onUpdate:modelValue"])) : W(t) ? (n(), M(L(we), {
                                key: 2,
                                class: q(["ks-select", { "ks-select-invalid": c.value[r(t)] }]),
                                pt: { label: o(t) },
                                "model-value": u.value[r(t)],
                                options: W(t),
                                "onUpdate:modelValue": (i) => {
                                  u.value[r(t)] = i, O(t);
                                }
                              }, null, 8, ["pt", "class", "model-value", "options", "onUpdate:modelValue"])) : t.value_type === "int" ? (n(), s("input", P({
                                key: 3,
                                ref_for: !0
                              }, o(t), {
                                type: "number",
                                class: ["ks-input", { "ks-input-invalid": c.value[r(t)] }],
                                min: t.schema?.minimum,
                                max: t.schema?.maximum,
                                value: u.value[r(t)],
                                onInput: (i) => {
                                  u.value[r(t)] = Number(i.target.value), O(t);
                                }
                              }), null, 16, Ze)) : t.value_type === "json" ? (n(), s("textarea", P({
                                key: 4,
                                ref_for: !0
                              }, o(t), {
                                rows: "4",
                                class: ["ks-input", { "ks-input-invalid": c.value[r(t)] }],
                                value: u.value[r(t)],
                                onInput: (i) => {
                                  u.value[r(t)] = i.target.value, O(t);
                                }
                              }), null, 16, et)) : t.value_type === "secret" ? (n(), s("input", P({
                                key: 5,
                                ref_for: !0
                              }, o(t), {
                                type: "password",
                                autocomplete: "off",
                                class: ["ks-input", { "ks-input-invalid": c.value[r(t)] }],
                                placeholder: t.has_value ? "•••••••• set — type to replace" : "Not set",
                                value: u.value[r(t)],
                                onInput: (i) => {
                                  u.value[r(t)] = i.target.value, O(t);
                                }
                              }), null, 16, tt)) : (n(), s("input", P({
                                key: 6,
                                ref_for: !0
                              }, o(t), {
                                type: "text",
                                class: ["ks-input", { "ks-input-invalid": c.value[r(t)] }],
                                minlength: t.schema?.minLength,
                                maxlength: t.schema?.maxLength,
                                value: u.value[r(t)],
                                onInput: (i) => {
                                  u.value[r(t)] = i.target.value, O(t);
                                }
                              }), null, 16, at)),
                              v.value === r(t) ? (n(), s("span", nt, [...a[2] || (a[2] = [
                                w("span", { class: "ks-saved-tick" }, "✓", -1),
                                te(" Saved", -1)
                              ])])) : $("", !0),
                              B(L(ae), {
                                type: "button",
                                label: f.value === r(t) ? "Saving…" : "Save",
                                "aria-label": `Save ${d(t)}`,
                                "aria-describedby": j(t),
                                loading: f.value === r(t),
                                disabled: f.value === r(t) || !!c.value[r(t)] || t.value_type !== "bool" && !ue(t),
                                onClick: (i) => ce(t)
                              }, null, 8, ["label", "aria-label", "aria-describedby", "loading", "disabled", "onClick"]),
                              t.is_default ? $("", !0) : (n(), M(L(ae), {
                                key: 8,
                                type: "button",
                                severity: "secondary",
                                text: "",
                                rounded: "",
                                disabled: f.value === r(t),
                                title: "Reset to default",
                                "aria-label": `Reset ${d(t)} to default`,
                                "aria-describedby": j(t),
                                onClick: (i) => de(t)
                              }, {
                                icon: E(() => [
                                  B(L(Q), {
                                    icon: "tabler:rotate",
                                    "aria-hidden": "true"
                                  })
                                ]),
                                _: 1
                              }, 8, ["disabled", "aria-label", "aria-describedby", "onClick"]))
                            ], 64))
                          ]),
                          c.value[r(t)] ? (n(), s("p", {
                            key: 0,
                            id: A(t, "validation"),
                            role: "alert",
                            class: "ks-field-err"
                          }, S(c.value[r(t)]), 9, lt)) : $("", !0)
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
      ], 64)) : (n(), s("div", Ue, "No settings declared."))
    ]));
  }
}), rt = { class: "ks" }, ot = {
  key: 0,
  class: "ks-err"
}, it = {
  key: 1,
  class: "ks-loading"
}, st = {
  key: 2,
  class: "ks-empty"
}, ut = {
  key: 3,
  class: "ks-shell"
}, ct = { class: "ks-pane-head" }, dt = { class: "ks-pane-ico" }, mt = { class: "ks-pane-head-text" }, ft = { key: 0 }, pt = {
  key: 2,
  class: "ks-empty"
}, vt = /* @__PURE__ */ z({
  __name: "settings",
  setup(p) {
    const m = je(), y = D(() => {
      const o = m.value?.route;
      return typeof o == "string" && o.length ? o : "";
    }), h = C([]), g = C(!0), f = C(""), v = C(""), u = C(!1), c = { value: "", label: "All settings", icon: "tabler:table" }, r = D(() => {
      const o = [];
      for (const x of h.value) {
        const d = x.group || "", U = { value: x.key, label: x.title, icon: x.icon || "tabler:adjustments" }, I = o[o.length - 1];
        I && I.heading === d ? I.items.push(U) : o.push({ heading: d, items: [U] });
      }
      return o;
    }), _ = D(() => h.value.find((o) => o.key === v.value) || null);
    function A(o) {
      u.value = o === c.value, u.value || (v.value = o);
    }
    async function j() {
      g.value = !0, f.value = "";
      try {
        const { data: o } = await F.get("/api/v1/settings/blocks");
        if (!o?.success) throw new Error(o?.error || "failed to load settings blocks");
        h.value = Array.isArray(o.blocks) ? o.blocks : [];
        const x = y.value && h.value.some((d) => d.key === y.value) ? y.value : h.value.some((d) => d.key === v.value) ? v.value : h.value[0]?.key || "";
        v.value = x, y.value === "all-settings" && !h.value.some((d) => d.key === y.value) && (u.value = !0);
      } catch (o) {
        f.value = o instanceof Error ? o.message : String(o);
      } finally {
        g.value = !1;
      }
    }
    return ve(j), (o, x) => (n(), s("div", rt, [
      f.value ? (n(), s("div", ot, S(f.value), 1)) : $("", !0),
      g.value ? (n(), s("div", it, "Loading…")) : h.value.length ? (n(), s("div", ut, [
        B(Ce, {
          label: "Settings sections",
          value: u.value ? c.value : v.value,
          groups: r.value,
          "leading-item": c,
          "onUpdate:value": A
        }, null, 8, ["value", "groups"]),
        w("section", {
          class: q(["ks-pane", { "ks-pane-flush": !u.value && _.value && _.value.component_tag }])
        }, [
          u.value ? (n(), s(N, { key: 0 }, [
            x[0] || (x[0] = w("header", { class: "ks-pane-head" }, [
              w("h1", null, "All settings")
            ], -1)),
            B(le, {
              key: "all-settings-table",
              namespace: "",
              all: "",
              blocks: h.value
            }, null, 8, ["blocks"])
          ], 64)) : _.value ? (n(), s(N, { key: 1 }, [
            _.value.component_tag ? (n(), M(Y, {
              key: _.value.key,
              tag: _.value.component_tag,
              config: _.value.config
            }, null, 8, ["tag", "config"])) : _.value.namespace ? (n(), s(N, { key: 1 }, [
              w("header", ct, [
                w("span", dt, [
                  B(L(Q), {
                    icon: _.value.icon || "tabler:adjustments",
                    "aria-hidden": "true"
                  }, null, 8, ["icon"])
                ]),
                w("div", mt, [
                  w("h1", null, S(_.value.title), 1),
                  typeof _.value.config?.description == "string" ? (n(), s("p", ft, S(_.value.config.description), 1)) : $("", !0)
                ])
              ]),
              (n(), M(le, {
                key: _.value.key,
                namespace: _.value.namespace
              }, null, 8, ["namespace"]))
            ], 64)) : (n(), s("div", pt, "This block has no editor."))
          ], 64)) : $("", !0)
        ], 2)
      ])) : (n(), s("div", st, "No settings declared."))
    ]));
  }
}), _t = {
  rootComponent: vt,
  plugins: [ye]
};
export {
  _t as mountConfig
};
//# sourceMappingURL=lazy-mount-BY-M8ZX8.js.map

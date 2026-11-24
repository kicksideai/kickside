import { b as ye, u as he, P as ge } from "./wc-runtime-56DLhE4T.js";
import { defineComponent as F, useId as X, openBlock as n, createElementBlock as o, unref as j, normalizeClass as U, createElementVNode as y, createTextVNode as Q, toDisplayString as x, createCommentVNode as b, renderSlot as T, computed as V, createBlock as A, resolveDynamicComponent as R, normalizeProps as ke, guardReactiveProps as be, createSlots as _e, withCtx as N, Fragment as L, renderList as G, ref as C, watch as $e, onMounted as xe, withDirectives as we, vModelText as Se, mergeProps as H, createVNode as q } from "vue";
import { Icon as Z } from "@iconify/vue";
import { _ as W, s as Ae, a as Me, b as le, c as ie } from "./setting-change-8mKPr5b-.js";
import { api as K } from "@wippy-fe/proxy";
const Ce = ["aria-labelledby"], je = { class: "kx-railhead" }, Ne = ["id"], Ie = { key: 0 }, Le = { class: "kx-railhead-acts" }, Oe = { class: "kx-rail-body" }, Ee = /* @__PURE__ */ F({
  __name: "ListRail",
  props: {
    title: {},
    count: {},
    settings: { type: Boolean }
  },
  setup(u) {
    const m = X();
    return (p, h) => (n(), o("aside", {
      class: U(["kx-rail", { "kx-settings-list-rail": u.settings }]),
      "aria-labelledby": j(m)
    }, [
      y("div", je, [
        y("span", {
          id: j(m),
          class: "kx-railhead-title"
        }, [
          Q(x(u.title), 1),
          u.count !== void 0 ? (n(), o("b", Ie, x(u.count), 1)) : b("", !0)
        ], 8, Ne),
        y("div", Le, [
          T(p.$slots, "actions")
        ])
      ]),
      T(p.$slots, "toolbar"),
      y("div", Oe, [
        T(p.$slots, "default")
      ])
    ], 10, Ce));
  }
}), Re = ["aria-label"], Ue = {
  key: 0,
  class: "kx-settings-rail-group"
}, De = ["aria-current", "onClick"], Ve = { class: "kx-settings-rail-label" }, Pe = /* @__PURE__ */ F({
  __name: "SettingsRail",
  props: {
    label: {},
    title: {},
    count: {},
    value: {},
    groups: {},
    leadingItem: {}
  },
  emits: ["update:value"],
  setup(u) {
    const m = u, p = V(() => m.leadingItem ? [{ items: [m.leadingItem] }, ...m.groups] : m.groups);
    function h(g) {
      const v = [...g.currentTarget.querySelectorAll(".kx-settings-rail-item")], k = v.indexOf(g.target);
      if (k < 0) return;
      let c;
      switch (g.key) {
        case "ArrowDown":
        case "ArrowRight":
          c = (k + 1) % v.length;
          break;
        case "ArrowUp":
        case "ArrowLeft":
          c = (k + v.length - 1) % v.length;
          break;
        case "Home":
          c = 0;
          break;
        case "End":
          c = v.length - 1;
          break;
        default:
          return;
      }
      g.preventDefault(), v[c]?.focus();
    }
    return (g, v) => (n(), A(R(u.title ? Ee : "div"), ke(be(u.title ? { title: u.title, count: u.count, settings: !0 } : { class: "kx-settings-rail-standalone" })), _e({
      default: N(() => [
        y("nav", {
          class: U(["kx-settings-rail", { "kx-settings-rail-framed": u.title }]),
          "aria-label": u.label,
          onKeydown: h
        }, [
          (n(!0), o(L, null, G(p.value, (k, c) => (n(), o("div", {
            key: k.items[0]?.value ?? c,
            class: U(["kx-settings-rail-section", { "kx-settings-rail-leading": u.leadingItem && c === 0 }])
          }, [
            k.heading ? (n(), o("div", Ue, x(k.heading), 1)) : b("", !0),
            (n(!0), o(L, null, G(k.items, (d) => (n(), o("button", {
              key: d.value,
              type: "button",
              class: "kx-settings-rail-item",
              "aria-current": d.value === u.value ? "true" : void 0,
              onClick: (i) => g.$emit("update:value", d.value)
            }, [
              d.icon ? (n(), A(j(Z), {
                key: 0,
                class: "kx-settings-rail-icon",
                icon: d.icon,
                "aria-hidden": "true"
              }, null, 8, ["icon"])) : b("", !0),
              y("span", Ve, x(d.label), 1)
            ], 8, De))), 128))
          ], 2))), 128))
        ], 42, Re)
      ]),
      _: 2
    }, [
      u.title && g.$slots.actions ? {
        name: "actions",
        fn: N(() => [
          T(g.$slots, "actions")
        ]),
        key: "0"
      } : void 0
    ]), 1040));
  }
}), Be = () => ye();
function Te(u) {
  if (!u) return null;
  let m;
  if (typeof u == "number")
    m = u;
  else {
    const p = u.trim();
    if (/^\d+$/.test(p))
      m = Number(p);
    else {
      const h = Date.parse(p);
      return Number.isNaN(h) ? null : h;
    }
  }
  return Number.isFinite(m) ? m < 1e12 ? m * 1e3 : m : null;
}
function qe(u, m) {
  const p = Te(u);
  if (p === null) return "";
  const h = m?.now ?? Date.now(), g = m?.suffix ?? !0, v = m?.maxUnit ?? "day", k = m?.future ?? !1, c = 6e4, d = 60 * c, i = 24 * d, w = 30 * i, M = 365 * i, I = h - p;
  if (k && I < 0) {
    const f = -I;
    return f < c ? "in <1m" : f < d ? `in ${Math.floor(f / c)}m` : f < i ? `in ${Math.floor(f / d)}h` : `in ${Math.floor(f / i)}d`;
  }
  const r = Math.max(0, I);
  if (r < c) return "just now";
  const S = g ? " ago" : "";
  return r < d ? `${Math.floor(r / c)}m${S}` : r < i ? `${Math.floor(r / d)}h${S}` : v === "year" ? r < w ? `${Math.floor(r / i)}d${S}` : r < M ? `${Math.floor(r / w)}mo${S}` : `${Math.floor(r / M)}y${S}` : `${Math.floor(r / i)}d${S}`;
}
const Fe = ["aria-labelledby"], He = {
  key: 0,
  class: "kx-settings-group-head"
}, Ke = ["id"], Ge = {
  key: 0,
  class: "kx-settings-group-count"
}, Je = { class: "kx-settings-group-list" }, ze = /* @__PURE__ */ F({
  __name: "SettingsGroup",
  props: {
    title: {},
    count: {}
  },
  setup(u) {
    const m = X();
    return (p, h) => (n(), o("section", {
      class: "kx-settings-group",
      "aria-labelledby": u.title ? j(m) : void 0
    }, [
      u.title ? (n(), o("div", He, [
        y("h2", {
          id: j(m),
          class: "kx-settings-group-title"
        }, x(u.title), 9, Ke),
        u.count !== void 0 ? (n(), o("span", Ge, x(u.count), 1)) : b("", !0)
      ])) : b("", !0),
      y("div", Je, [
        T(p.$slots, "default")
      ])
    ], 8, Fe));
  }
}), Ye = { class: "ks-form" }, Qe = {
  key: 0,
  class: "ks-err"
}, We = {
  key: 1,
  class: "ks-loading"
}, Xe = {
  key: 2,
  class: "ks-empty"
}, Ze = { key: 0 }, et = {
  key: 0,
  class: "ks-owner"
}, tt = { class: "ks-row-head" }, at = ["id"], nt = { class: "ks-key" }, lt = {
  key: 0,
  class: "ks-tag kx-tag-caps ks-tag-on"
}, it = {
  key: 1,
  class: "ks-tag kx-tag-caps ks-tag-on"
}, ot = ["id"], rt = ["id"], st = ["id"], ut = {
  key: 3,
  class: "ks-prov"
}, ct = { key: 0 }, dt = { class: "ks-field" }, mt = {
  key: 0,
  class: "ks-static"
}, ft = ["min", "max", "value", "onInput"], pt = ["value", "onInput"], vt = ["placeholder", "value", "onInput"], yt = ["minlength", "maxlength", "value", "onInput"], ht = {
  key: 7,
  class: "ks-saved"
}, gt = ["id"], Y = "General", oe = /* @__PURE__ */ F({
  __name: "SettingsForm",
  props: {
    namespace: {},
    all: { type: Boolean, default: !1 },
    blocks: { default: () => [] }
  },
  setup(u) {
    const m = u, p = C([]), h = C(!0), g = C(""), v = C(""), k = C(""), c = C({}), d = C({}), i = (e) => `${e.namespace} ${e.key}`, w = X(), M = (e, a) => `${w}-${encodeURIComponent(e.namespace)}-${encodeURIComponent(e.key)}-${a}`, I = (e) => [
      e.description && M(e, "description"),
      P(e.schema) && M(e, "hint"),
      e.error && M(e, "error"),
      d.value[i(e)] && M(e, "validation")
    ].filter(Boolean).join(" ") || void 0, r = (e) => ({
      "aria-labelledby": M(e, "title"),
      "aria-describedby": I(e),
      "aria-invalid": !!(e.error || d.value[i(e)]) || void 0
    });
    function S(e) {
      const a = e.split(/[._\-\s]+/).filter(Boolean);
      return a.length ? a.map((l, t) => t === 0 ? l.charAt(0).toUpperCase() + l.slice(1) : l).join(" ") : e;
    }
    const f = (e) => e.title && e.title.length ? e.title : S(e.key), D = C(""), O = (e) => e.owner ? e.owner : m.blocks.find((l) => l.namespace === e.namespace || l.namespaces?.includes(e.namespace))?.title || e.namespace, J = V(() => {
      if (m.all) {
        const t = D.value.trim().toLowerCase(), s = p.value.filter((_) => !t || [
          f(_),
          _.key,
          _.namespace,
          O(_),
          _.description || ""
        ].some(($) => $.toLowerCase().includes(t)));
        return s.sort((_, $) => O(_).localeCompare(O($)) || (_.order ?? 100) - ($.order ?? 100) || f(_).localeCompare(f($))), [{ name: Y, items: s }];
      }
      const e = /* @__PURE__ */ new Map();
      for (const t of p.value) {
        const s = t.category && t.category.length ? t.category : Y;
        e.has(s) || e.set(s, []), e.get(s).push(t);
      }
      const a = (t) => typeof t.order == "number" ? t.order : 100, l = [];
      for (const [t, s] of e)
        s.sort((_, $) => a(_) - a($) || f(_).localeCompare(f($))), l.push({ name: t, items: s });
      return l.sort((t, s) => {
        const _ = Math.min(...t.items.map(a)), $ = Math.min(...s.items.map(a));
        return _ - $ || t.name.localeCompare(s.name);
      }), l;
    }), re = V(() => J.value.length === 1 && J.value[0].name === Y), ee = (e) => Array.isArray(e.schema?.enum) ? e.schema.enum : null;
    function se(e) {
      return {
        namespace: e.namespace,
        key: e.key,
        value: e.value,
        value_type: e.value_type,
        default: e.default,
        has_value: e.has_value,
        is_secret: e.is_secret,
        description: e.description,
        title: f(e),
        schema: e.schema ?? null
      };
    }
    function z(e, a, l = "") {
      if (!e) return "";
      const t = (s) => l ? `${l}: ${s}` : s;
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
        for (let s = 0; s < a.length; s++) {
          const _ = z(e.items, a[s], `${l}[${s}]`);
          if (_) return _;
        }
      if (a !== null && typeof a == "object" && !Array.isArray(a)) {
        const s = a, _ = ($) => l ? `${l}.${$}` : $;
        for (const $ of e.required ?? [])
          if (!Object.hasOwn(s, $)) return `${_($)}: Required`;
        for (const [$, ve] of Object.entries(e.properties ?? {})) {
          if (!Object.hasOwn(s, $)) continue;
          const ne = z(ve, s[$], _($));
          if (ne) return ne;
        }
      }
      return "";
    }
    function P(e) {
      if (!e) return "";
      const a = [];
      if (e.type && a.push(e.type), typeof e.minimum == "number" || typeof e.maximum == "number") {
        const l = typeof e.minimum == "number" ? e.minimum : "−∞", t = typeof e.maximum == "number" ? e.maximum : "∞";
        a.push(`range ${l}–${t}`);
      }
      (typeof e.minLength == "number" || typeof e.maxLength == "number") && a.push(`length ${e.minLength ?? 0}–${e.maxLength ?? "∞"}`), e.pattern && a.push(`pattern ${e.pattern}`), Array.isArray(e.enum) && a.push(`one of ${e.enum.join(", ")}`), e.required?.length && a.push(`required: ${e.required.join(", ")}`), e.items && a.push(`items: ${P(e.items)}`);
      for (const [l, t] of Object.entries(e.properties ?? {}))
        a.push(`${l}: ${P(t)}`);
      return a.join(" · ");
    }
    function E(e) {
      const a = i(e);
      if (e.value_type === "secret" && !String(c.value[a] ?? "").length)
        return delete d.value[a], "";
      let l = c.value[a], t;
      try {
        e.value_type === "json" ? l = JSON.parse(String(l)) : ((e.value_type === "int" || e.schema?.type === "integer" || e.schema?.type === "number") && (l = Number(l)), e.schema?.type === "string" && (l = String(l))), t = z(e.schema, l);
      } catch (s) {
        t = s instanceof Error ? s.message : String(s);
      }
      return t ? d.value[a] = t : delete d.value[a], t;
    }
    function te(e, a) {
      c.value[i(e)] = e.value_type === "json" ? JSON.stringify(a, null, 2) : a;
    }
    function ue(e) {
      te(e, e.value_type === "secret" ? "" : e.value);
    }
    function ce(e, a) {
      te(e, a), E(e);
    }
    async function B() {
      h.value = !0, g.value = "";
      try {
        const e = m.all ? "/api/v1/settings" : `/api/v1/settings?namespace=${encodeURIComponent(m.namespace)}`, { data: a } = await K.get(e);
        if (!a?.success) throw new Error(a?.error || "failed to load settings");
        p.value = Array.isArray(a.settings) ? a.settings : [];
        for (const l of p.value) ue(l);
      } catch (e) {
        g.value = e instanceof Error ? e.message : String(e);
      } finally {
        h.value = !1;
      }
    }
    function ae(e, a) {
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
    const de = (e) => {
      const a = c.value[i(e)];
      return e.value_type === "secret" ? String(a ?? "").length > 0 : e.value_type === "json" ? a !== JSON.stringify(e.value, null, 2) : a !== e.value;
    };
    async function me(e) {
      const a = i(e);
      if (!E(e) && !v.value) {
        v.value = a, g.value = "";
        try {
          const l = ae(e, c.value[a]);
          if (!await ie(e, l, f(e), "Save")) return;
          const { data: t } = await K.put("/api/v1/settings", { namespace: e.namespace, key: e.key, value: l });
          if (!t?.success) {
            d.value[a] = t?.error || "save failed";
            return;
          }
          delete d.value[a], k.value = a, setTimeout(() => {
            k.value === a && (k.value = "");
          }, 2e3), await B();
        } catch (l) {
          d.value[a] = l instanceof Error ? l.message : String(l);
        } finally {
          v.value = "";
        }
      }
    }
    async function fe(e) {
      if (v.value) return;
      const a = i(e);
      v.value = a, g.value = "";
      try {
        if (!await ie(e, e.default, f(e), "Reset to default")) return;
        const { data: l } = await K.put("/api/v1/settings", { namespace: e.namespace, key: e.key, value: null });
        if (!l?.success) throw new Error(l?.error || "reset failed");
        await B();
      } catch (l) {
        g.value = l instanceof Error ? l.message : String(l);
      } finally {
        v.value = "";
      }
    }
    async function pe() {
      await B();
    }
    return $e(() => [m.namespace, m.all], B), xe(B), (e, a) => (n(), o("div", Ye, [
      g.value ? (n(), o("div", Qe, x(g.value), 1)) : b("", !0),
      h.value ? (n(), o("div", We, "Loading…")) : p.value.length ? (n(), o(L, { key: 3 }, [
        u.all ? we((n(), o("input", {
          key: 0,
          "onUpdate:modelValue": a[0] || (a[0] = (l) => D.value = l),
          type: "search",
          class: "ks-input ks-all-search",
          "aria-label": "Search settings",
          placeholder: "Search settings"
        }, null, 512)), [
          [Se, D.value]
        ]) : b("", !0),
        (n(!0), o(L, null, G(J.value, (l) => (n(), A(ze, {
          key: l.name,
          title: re.value ? void 0 : l.name,
          count: l.items.length
        }, {
          default: N(() => [
            (n(), A(R(u.all ? "table" : "div"), {
              class: U({ "ks-all-table": u.all })
            }, {
              default: N(() => [
                u.all ? (n(), o("thead", Ze, [...a[1] || (a[1] = [
                  y("tr", null, [
                    y("th", { scope: "col" }, "Owner"),
                    y("th", { scope: "col" }, "Setting"),
                    y("th", { scope: "col" }, "Value")
                  ], -1)
                ])])) : b("", !0),
                (n(), A(R(u.all ? "tbody" : "div"), null, {
                  default: N(() => [
                    (n(!0), o(L, null, G(l.items, (t) => (n(), A(R(u.all ? "tr" : "div"), {
                      key: i(t),
                      class: U(["ks-row", { "ks-row-invalid": t.error || d.value[i(t)], "ks-row-wc": t.ui }])
                    }, {
                      default: N(() => [
                        u.all ? (n(), o("td", et, x(O(t)), 1)) : b("", !0),
                        (n(), A(R(u.all ? "td" : "div"), { class: "ks-row-main" }, {
                          default: N(() => [
                            y("div", tt, [
                              y("span", {
                                id: M(t, "title"),
                                class: "ks-title"
                              }, x(f(t)), 9, at),
                              y("code", nt, x(t.key), 1),
                              t.is_secret && t.has_value ? (n(), o("span", lt, "set")) : !t.is_default && !t.is_secret ? (n(), o("span", it, "overridden")) : b("", !0)
                            ]),
                            t.error ? (n(), o("p", {
                              key: 0,
                              id: M(t, "error"),
                              class: "ks-field-err",
                              role: "alert"
                            }, x(t.error), 9, ot)) : b("", !0),
                            t.description ? (n(), o("p", {
                              key: 1,
                              id: M(t, "description"),
                              class: "ks-desc"
                            }, x(t.description), 9, rt)) : b("", !0),
                            P(t.schema) ? (n(), o("p", {
                              key: 2,
                              id: M(t, "hint"),
                              class: "ks-hint"
                            }, x(P(t.schema)), 9, st)) : b("", !0),
                            !t.is_default && t.updated_by ? (n(), o("p", ut, [
                              Q("by " + x(t.updated_by), 1),
                              t.updated_at ? (n(), o("span", ct, " · " + x(j(qe)(t.updated_at)), 1)) : b("", !0)
                            ])) : b("", !0)
                          ]),
                          _: 2
                        }, 1024)),
                        t.ui ? (n(), A(R(u.all ? "td" : "div"), {
                          key: 1,
                          class: "ks-wc-slot"
                        }, {
                          default: N(() => [
                            (n(), A(W, {
                              key: i(t),
                              tag: t.ui,
                              config: se(t),
                              label: f(t),
                              attrs: { role: "group", ...r(t) },
                              onChange: pe
                            }, null, 8, ["tag", "config", "label", "attrs"]))
                          ]),
                          _: 2
                        }, 1024)) : (n(), A(R(u.all ? "td" : "div"), {
                          key: 2,
                          class: "ks-control"
                        }, {
                          default: N(() => [
                            y("div", dt, [
                              t.editable === !1 ? (n(), o("span", mt, x(t.value), 1)) : (n(), o(L, { key: 1 }, [
                                t.control ? (n(), A(W, {
                                  key: 0,
                                  tag: t.control.tag,
                                  label: f(t),
                                  attrs: { ...t.control.props, role: "group", description: t.description, ...r(t), value: ae(t, c.value[i(t)]) },
                                  onSelect: (s) => ce(t, s)
                                }, null, 8, ["tag", "label", "attrs", "onSelect"])) : t.value_type === "bool" ? (n(), A(j(Ae), {
                                  key: 1,
                                  pt: { input: r(t) },
                                  "model-value": !!c.value[i(t)],
                                  "onUpdate:modelValue": (s) => c.value[i(t)] = s
                                }, null, 8, ["pt", "model-value", "onUpdate:modelValue"])) : ee(t) ? (n(), A(j(Me), {
                                  key: 2,
                                  class: U(["ks-select", { "ks-select-invalid": d.value[i(t)] }]),
                                  pt: { label: r(t) },
                                  "model-value": c.value[i(t)],
                                  options: ee(t),
                                  "onUpdate:modelValue": (s) => {
                                    c.value[i(t)] = s, E(t);
                                  }
                                }, null, 8, ["pt", "class", "model-value", "options", "onUpdate:modelValue"])) : t.value_type === "int" ? (n(), o("input", H({
                                  key: 3,
                                  ref_for: !0
                                }, r(t), {
                                  type: "number",
                                  class: ["ks-input", { "ks-input-invalid": d.value[i(t)] }],
                                  min: t.schema?.minimum,
                                  max: t.schema?.maximum,
                                  value: c.value[i(t)],
                                  onInput: (s) => {
                                    c.value[i(t)] = Number(s.target.value), E(t);
                                  }
                                }), null, 16, ft)) : t.value_type === "json" ? (n(), o("textarea", H({
                                  key: 4,
                                  ref_for: !0
                                }, r(t), {
                                  rows: "4",
                                  class: ["ks-input", { "ks-input-invalid": d.value[i(t)] }],
                                  value: c.value[i(t)],
                                  onInput: (s) => {
                                    c.value[i(t)] = s.target.value, E(t);
                                  }
                                }), null, 16, pt)) : t.value_type === "secret" ? (n(), o("input", H({
                                  key: 5,
                                  ref_for: !0
                                }, r(t), {
                                  type: "password",
                                  autocomplete: "off",
                                  class: ["ks-input", { "ks-input-invalid": d.value[i(t)] }],
                                  placeholder: t.has_value ? "•••••••• set — type to replace" : "Not set",
                                  value: c.value[i(t)],
                                  onInput: (s) => {
                                    c.value[i(t)] = s.target.value, E(t);
                                  }
                                }), null, 16, vt)) : (n(), o("input", H({
                                  key: 6,
                                  ref_for: !0
                                }, r(t), {
                                  type: "text",
                                  class: ["ks-input", { "ks-input-invalid": d.value[i(t)] }],
                                  minlength: t.schema?.minLength,
                                  maxlength: t.schema?.maxLength,
                                  value: c.value[i(t)],
                                  onInput: (s) => {
                                    c.value[i(t)] = s.target.value, E(t);
                                  }
                                }), null, 16, yt)),
                                k.value === i(t) ? (n(), o("span", ht, [...a[2] || (a[2] = [
                                  y("span", { class: "ks-saved-tick" }, "✓", -1),
                                  Q(" Saved", -1)
                                ])])) : b("", !0),
                                q(j(le), {
                                  type: "button",
                                  label: v.value === i(t) ? "Saving…" : "Save",
                                  "aria-label": `Save ${f(t)}`,
                                  "aria-describedby": I(t),
                                  loading: v.value === i(t),
                                  disabled: v.value === i(t) || !!d.value[i(t)] || t.value_type !== "bool" && !de(t),
                                  onClick: (s) => me(t)
                                }, null, 8, ["label", "aria-label", "aria-describedby", "loading", "disabled", "onClick"]),
                                t.is_default ? b("", !0) : (n(), A(j(le), {
                                  key: 8,
                                  type: "button",
                                  severity: "secondary",
                                  text: "",
                                  rounded: "",
                                  disabled: v.value === i(t),
                                  title: "Reset to default",
                                  "aria-label": `Reset ${f(t)} to default`,
                                  "aria-describedby": I(t),
                                  onClick: (s) => fe(t)
                                }, {
                                  icon: N(() => [
                                    q(j(Z), {
                                      icon: "tabler:rotate",
                                      "aria-hidden": "true"
                                    })
                                  ]),
                                  _: 1
                                }, 8, ["disabled", "aria-label", "aria-describedby", "onClick"]))
                              ], 64))
                            ]),
                            d.value[i(t)] ? (n(), o("p", {
                              key: 0,
                              id: M(t, "validation"),
                              role: "alert",
                              class: "ks-field-err"
                            }, x(d.value[i(t)]), 9, gt)) : b("", !0)
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
          ]),
          _: 2
        }, 1032, ["title", "count"]))), 128))
      ], 64)) : (n(), o("div", Xe, "No settings declared."))
    ]));
  }
}), kt = { class: "ks" }, bt = {
  key: 0,
  class: "ks-err"
}, _t = {
  key: 1,
  class: "ks-loading"
}, $t = {
  key: 2,
  class: "ks-empty"
}, xt = {
  key: 3,
  class: "ks-shell"
}, wt = { class: "ks-pane-head" }, St = { class: "ks-pane-ico" }, At = { class: "ks-pane-head-text" }, Mt = { key: 0 }, Ct = {
  key: 2,
  class: "ks-empty"
}, jt = /* @__PURE__ */ F({
  __name: "settings",
  setup(u) {
    const m = Be(), p = V(() => {
      const r = m.value?.route;
      return typeof r == "string" && r.length ? r : "";
    }), h = C([]), g = C(!0), v = C(""), k = C(""), c = C(!1), d = { value: "", label: "All settings", icon: "tabler:table" }, i = V(() => {
      const r = [];
      for (const S of h.value) {
        const f = S.group || "", D = { value: S.key, label: S.title, icon: S.icon || "tabler:adjustments" }, O = r[r.length - 1];
        O && O.heading === f ? O.items.push(D) : r.push({ heading: f, items: [D] });
      }
      return r;
    }), w = V(() => h.value.find((r) => r.key === k.value) || null);
    function M(r) {
      c.value = r === d.value, c.value || (k.value = r);
    }
    async function I() {
      g.value = !0, v.value = "";
      try {
        const { data: r } = await K.get("/api/v1/settings/blocks");
        if (!r?.success) throw new Error(r?.error || "failed to load settings blocks");
        h.value = Array.isArray(r.blocks) ? r.blocks : [];
        const S = p.value && h.value.some((f) => f.key === p.value) ? p.value : h.value.some((f) => f.key === k.value) ? k.value : h.value[0]?.key || "";
        k.value = S, p.value === "all-settings" && !h.value.some((f) => f.key === p.value) && (c.value = !0);
      } catch (r) {
        v.value = r instanceof Error ? r.message : String(r);
      } finally {
        g.value = !1;
      }
    }
    return he(I), (r, S) => (n(), o("div", kt, [
      v.value ? (n(), o("div", bt, x(v.value), 1)) : b("", !0),
      g.value ? (n(), o("div", _t, "Loading…")) : h.value.length ? (n(), o("div", xt, [
        q(Pe, {
          label: "Settings sections",
          value: c.value ? d.value : k.value,
          groups: i.value,
          "leading-item": d,
          "onUpdate:value": M
        }, null, 8, ["value", "groups"]),
        y("section", {
          class: U(["ks-pane", { "ks-pane-flush": !c.value && w.value && w.value.component_tag }])
        }, [
          c.value ? (n(), o(L, { key: 0 }, [
            S[0] || (S[0] = y("header", { class: "ks-pane-head" }, [
              y("h1", null, "All settings")
            ], -1)),
            q(oe, {
              key: "all-settings-table",
              namespace: "",
              all: "",
              blocks: h.value
            }, null, 8, ["blocks"])
          ], 64)) : w.value ? (n(), o(L, { key: 1 }, [
            w.value.component_tag ? (n(), A(W, {
              key: w.value.key,
              tag: w.value.component_tag,
              config: w.value.config
            }, null, 8, ["tag", "config"])) : w.value.namespace ? (n(), o(L, { key: 1 }, [
              y("header", wt, [
                y("span", St, [
                  q(j(Z), {
                    icon: w.value.icon || "tabler:adjustments",
                    "aria-hidden": "true"
                  }, null, 8, ["icon"])
                ]),
                y("div", At, [
                  y("h1", null, x(w.value.title), 1),
                  typeof w.value.config?.description == "string" ? (n(), o("p", Mt, x(w.value.config.description), 1)) : b("", !0)
                ])
              ]),
              (n(), A(oe, {
                key: w.value.key,
                namespace: w.value.namespace
              }, null, 8, ["namespace"]))
            ], 64)) : (n(), o("div", Ct, "This block has no editor."))
          ], 64)) : b("", !0)
        ], 2)
      ])) : (n(), o("div", $t, "No settings declared."))
    ]));
  }
}), Rt = {
  rootComponent: jt,
  plugins: [ge]
};
export {
  Rt as mountConfig
};
//# sourceMappingURL=lazy-mount-8PVP98aG.js.map

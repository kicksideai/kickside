import { a as ye, u as he, P as ge } from "./wc-runtime-4lROyJyk.js";
import { defineComponent as J, useId as oe, openBlock as n, createElementBlock as s, unref as j, normalizeClass as U, createElementVNode as y, createTextVNode as Q, toDisplayString as x, createCommentVNode as $, renderSlot as F, computed as V, createBlock as M, resolveDynamicComponent as R, normalizeProps as ke, guardReactiveProps as be, createSlots as _e, withCtx as I, Fragment as L, renderList as K, ref as C, watch as $e, onMounted as xe, withDirectives as we, vModelText as Se, mergeProps as q, createVNode as T } from "vue";
import { Icon as X } from "@iconify/vue";
import { _ as W, s as Ae, a as Me, b as ne, c as le } from "./setting-change-Dp6CFrHB.js";
import { api as H } from "@wippy-fe/proxy";
const Ce = ["aria-labelledby"], je = { class: "kx-railhead" }, Ne = ["id"], Ie = { key: 0 }, Le = { class: "kx-railhead-acts" }, Oe = { class: "kx-rail-body" }, Ee = /* @__PURE__ */ J({
  __name: "ListRail",
  props: {
    title: {},
    count: {},
    settings: { type: Boolean }
  },
  setup(c) {
    const f = oe();
    return (v, k) => (n(), s("aside", {
      class: U(["kx-rail", { "kx-settings-list-rail": c.settings }]),
      "aria-labelledby": j(f)
    }, [
      y("div", je, [
        y("span", {
          id: j(f),
          class: "kx-railhead-title"
        }, [
          Q(x(c.title), 1),
          c.count !== void 0 ? (n(), s("b", Ie, x(c.count), 1)) : $("", !0)
        ], 8, Ne),
        y("div", Le, [
          F(v.$slots, "actions")
        ])
      ]),
      F(v.$slots, "toolbar"),
      y("div", Oe, [
        F(v.$slots, "default")
      ])
    ], 10, Ce));
  }
}), Re = ["aria-label"], Ue = {
  key: 0,
  class: "kx-settings-rail-group"
}, De = ["aria-current", "onClick"], Ve = { class: "kx-settings-rail-label" }, Pe = /* @__PURE__ */ J({
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
  setup(c) {
    const f = c, v = V(() => f.leadingItem ? [{ items: [f.leadingItem] }, ...f.groups] : f.groups);
    function k(h) {
      const p = [...h.currentTarget.querySelectorAll(".kx-settings-rail-item")], g = p.indexOf(h.target);
      if (g < 0) return;
      let u;
      switch (h.key) {
        case "ArrowDown":
        case "ArrowRight":
          u = (g + 1) % p.length;
          break;
        case "ArrowUp":
        case "ArrowLeft":
          u = (g + p.length - 1) % p.length;
          break;
        case "Home":
          u = 0;
          break;
        case "End":
          u = p.length - 1;
          break;
        default:
          return;
      }
      h.preventDefault(), p[u]?.focus();
    }
    return (h, p) => (n(), M(R(c.title ? Ee : "div"), ke(be(c.title ? { title: c.title, count: c.count, settings: !0 } : { class: "kx-settings-rail-standalone" })), _e({
      default: I(() => [
        y("nav", {
          class: U(["kx-settings-rail", { "kx-settings-rail-framed": c.title }]),
          "aria-label": c.label,
          onKeydown: k
        }, [
          (n(!0), s(L, null, K(v.value, (g, u) => (n(), s("div", {
            key: g.items[0]?.value ?? u,
            class: U(["kx-settings-rail-section", { "kx-settings-rail-leading": c.leadingItem && u === 0 }])
          }, [
            g.heading ? (n(), s("div", Ue, x(g.heading), 1)) : $("", !0),
            (n(!0), s(L, null, K(g.items, (d) => (n(), s("button", {
              key: d.value,
              type: "button",
              class: "kx-settings-rail-item",
              "aria-current": d.value === c.value ? "true" : void 0,
              onClick: (r) => h.$emit("update:value", d.value)
            }, [
              d.icon ? (n(), M(j(X), {
                key: 0,
                class: "kx-settings-rail-icon",
                icon: d.icon,
                "aria-hidden": "true"
              }, null, 8, ["icon"])) : $("", !0),
              y("span", Ve, x(d.label), 1)
            ], 8, De))), 128))
          ], 2))), 128))
        ], 42, Re)
      ]),
      _: 2
    }, [
      c.title && h.$slots.actions ? {
        name: "actions",
        fn: I(() => [
          F(h.$slots, "actions")
        ]),
        key: "0"
      } : void 0
    ]), 1040));
  }
}), Be = () => ye();
function Te(c) {
  if (!c) return null;
  let f;
  if (typeof c == "number")
    f = c;
  else {
    const v = c.trim();
    if (/^\d+$/.test(v))
      f = Number(v);
    else {
      const k = Date.parse(v);
      return Number.isNaN(k) ? null : k;
    }
  }
  return Number.isFinite(f) ? f < 1e12 ? f * 1e3 : f : null;
}
function qe(c, f) {
  const v = Te(c);
  if (v === null) return "";
  const k = f?.now ?? Date.now(), h = f?.suffix ?? !0, p = f?.maxUnit ?? "day", g = f?.future ?? !1, u = 6e4, d = 60 * u, r = 24 * d, w = 30 * r, A = 365 * r, N = k - v;
  if (g && N < 0) {
    const m = -N;
    return m < u ? "in <1m" : m < d ? `in ${Math.floor(m / u)}m` : m < r ? `in ${Math.floor(m / d)}h` : `in ${Math.floor(m / r)}d`;
  }
  const o = Math.max(0, N);
  if (o < u) return "just now";
  const S = h ? " ago" : "";
  return o < d ? `${Math.floor(o / u)}m${S}` : o < r ? `${Math.floor(o / d)}h${S}` : p === "year" ? o < w ? `${Math.floor(o / r)}d${S}` : o < A ? `${Math.floor(o / w)}mo${S}` : `${Math.floor(o / A)}y${S}` : `${Math.floor(o / r)}d${S}`;
}
const Fe = { class: "ks-form" }, He = {
  key: 0,
  class: "ks-err"
}, Ke = {
  key: 1,
  class: "ks-loading"
}, Je = {
  key: 2,
  class: "ks-empty"
}, ze = {
  key: 0,
  class: "ks-group-head"
}, Ge = { class: "ks-group-title" }, Ye = { class: "ks-group-count" }, Qe = { key: 0 }, We = {
  key: 0,
  class: "ks-owner"
}, Xe = { class: "ks-row-head" }, Ze = ["id"], et = { class: "ks-key" }, tt = {
  key: 0,
  class: "ks-tag kx-tag-caps ks-tag-on"
}, at = {
  key: 1,
  class: "ks-tag kx-tag-caps ks-tag-on"
}, nt = ["id"], lt = ["id"], rt = ["id"], ot = {
  key: 3,
  class: "ks-prov"
}, it = { key: 0 }, st = { class: "ks-field" }, ut = {
  key: 0,
  class: "ks-static"
}, ct = ["min", "max", "value", "onInput"], dt = ["value", "onInput"], mt = ["placeholder", "value", "onInput"], ft = ["minlength", "maxlength", "value", "onInput"], pt = {
  key: 7,
  class: "ks-saved"
}, vt = ["id"], Y = "General", re = /* @__PURE__ */ J({
  __name: "SettingsForm",
  props: {
    namespace: {},
    all: { type: Boolean, default: !1 },
    blocks: { default: () => [] }
  },
  setup(c) {
    const f = c, v = C([]), k = C(!0), h = C(""), p = C(""), g = C(""), u = C({}), d = C({}), r = (e) => `${e.namespace} ${e.key}`, w = oe(), A = (e, a) => `${w}-${encodeURIComponent(e.namespace)}-${encodeURIComponent(e.key)}-${a}`, N = (e) => [
      e.description && A(e, "description"),
      P(e.schema) && A(e, "hint"),
      e.error && A(e, "error"),
      d.value[r(e)] && A(e, "validation")
    ].filter(Boolean).join(" ") || void 0, o = (e) => ({
      "aria-labelledby": A(e, "title"),
      "aria-describedby": N(e),
      "aria-invalid": !!(e.error || d.value[r(e)]) || void 0
    });
    function S(e) {
      const a = e.split(/[._\-\s]+/).filter(Boolean);
      return a.length ? a.map((l, t) => t === 0 ? l.charAt(0).toUpperCase() + l.slice(1) : l).join(" ") : e;
    }
    const m = (e) => e.title && e.title.length ? e.title : S(e.key), D = C(""), O = (e) => e.owner ? e.owner : f.blocks.find((l) => l.namespace === e.namespace || l.namespaces?.includes(e.namespace))?.title || e.namespace, z = V(() => {
      if (f.all) {
        const t = D.value.trim().toLowerCase(), i = v.value.filter((b) => !t || [
          m(b),
          b.key,
          b.namespace,
          O(b),
          b.description || ""
        ].some((_) => _.toLowerCase().includes(t)));
        return i.sort((b, _) => O(b).localeCompare(O(_)) || (b.order ?? 100) - (_.order ?? 100) || m(b).localeCompare(m(_))), [{ name: Y, items: i }];
      }
      const e = /* @__PURE__ */ new Map();
      for (const t of v.value) {
        const i = t.category && t.category.length ? t.category : Y;
        e.has(i) || e.set(i, []), e.get(i).push(t);
      }
      const a = (t) => typeof t.order == "number" ? t.order : 100, l = [];
      for (const [t, i] of e)
        i.sort((b, _) => a(b) - a(_) || m(b).localeCompare(m(_))), l.push({ name: t, items: i });
      return l.sort((t, i) => {
        const b = Math.min(...t.items.map(a)), _ = Math.min(...i.items.map(a));
        return b - _ || t.name.localeCompare(i.name);
      }), l;
    }), ie = V(() => z.value.length === 1 && z.value[0].name === Y), Z = (e) => Array.isArray(e.schema?.enum) ? e.schema.enum : null;
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
        title: m(e),
        schema: e.schema ?? null
      };
    }
    function G(e, a, l = "") {
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
          const b = G(e.items, a[i], `${l}[${i}]`);
          if (b) return b;
        }
      if (a !== null && typeof a == "object" && !Array.isArray(a)) {
        const i = a, b = (_) => l ? `${l}.${_}` : _;
        for (const _ of e.required ?? [])
          if (!Object.hasOwn(i, _)) return `${b(_)}: Required`;
        for (const [_, ve] of Object.entries(e.properties ?? {})) {
          if (!Object.hasOwn(i, _)) continue;
          const ae = G(ve, i[_], b(_));
          if (ae) return ae;
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
      const a = r(e);
      if (e.value_type === "secret" && !String(u.value[a] ?? "").length)
        return delete d.value[a], "";
      let l = u.value[a], t;
      try {
        e.value_type === "json" ? l = JSON.parse(String(l)) : ((e.value_type === "int" || e.schema?.type === "integer" || e.schema?.type === "number") && (l = Number(l)), e.schema?.type === "string" && (l = String(l))), t = G(e.schema, l);
      } catch (i) {
        t = i instanceof Error ? i.message : String(i);
      }
      return t ? d.value[a] = t : delete d.value[a], t;
    }
    function ee(e, a) {
      u.value[r(e)] = e.value_type === "json" ? JSON.stringify(a, null, 2) : a;
    }
    function ue(e) {
      ee(e, e.value_type === "secret" ? "" : e.value);
    }
    function ce(e, a) {
      ee(e, a), E(e);
    }
    async function B() {
      k.value = !0, h.value = "";
      try {
        const e = f.all ? "/api/v1/settings" : `/api/v1/settings?namespace=${encodeURIComponent(f.namespace)}`, { data: a } = await H.get(e);
        if (!a?.success) throw new Error(a?.error || "failed to load settings");
        v.value = Array.isArray(a.settings) ? a.settings : [];
        for (const l of v.value) ue(l);
      } catch (e) {
        h.value = e instanceof Error ? e.message : String(e);
      } finally {
        k.value = !1;
      }
    }
    function te(e, a) {
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
      const a = u.value[r(e)];
      return e.value_type === "secret" ? String(a ?? "").length > 0 : e.value_type === "json" ? a !== JSON.stringify(e.value, null, 2) : a !== e.value;
    };
    async function me(e) {
      const a = r(e);
      if (!E(e) && !p.value) {
        p.value = a, h.value = "";
        try {
          const l = te(e, u.value[a]);
          if (!await le(e, l, m(e), "Save")) return;
          const { data: t } = await H.put("/api/v1/settings", { namespace: e.namespace, key: e.key, value: l });
          if (!t?.success) {
            d.value[a] = t?.error || "save failed";
            return;
          }
          delete d.value[a], g.value = a, setTimeout(() => {
            g.value === a && (g.value = "");
          }, 2e3), await B();
        } catch (l) {
          d.value[a] = l instanceof Error ? l.message : String(l);
        } finally {
          p.value = "";
        }
      }
    }
    async function fe(e) {
      if (p.value) return;
      const a = r(e);
      p.value = a, h.value = "";
      try {
        if (!await le(e, e.default, m(e), "Reset to default")) return;
        const { data: l } = await H.put("/api/v1/settings", { namespace: e.namespace, key: e.key, value: null });
        if (!l?.success) throw new Error(l?.error || "reset failed");
        await B();
      } catch (l) {
        h.value = l instanceof Error ? l.message : String(l);
      } finally {
        p.value = "";
      }
    }
    async function pe() {
      await B();
    }
    return $e(() => [f.namespace, f.all], B), xe(B), (e, a) => (n(), s("div", Fe, [
      h.value ? (n(), s("div", He, x(h.value), 1)) : $("", !0),
      k.value ? (n(), s("div", Ke, "Loading…")) : v.value.length ? (n(), s(L, { key: 3 }, [
        c.all ? we((n(), s("input", {
          key: 0,
          "onUpdate:modelValue": a[0] || (a[0] = (l) => D.value = l),
          type: "search",
          class: "ks-input ks-all-search",
          "aria-label": "Search settings",
          placeholder: "Search settings"
        }, null, 512)), [
          [Se, D.value]
        ]) : $("", !0),
        (n(!0), s(L, null, K(z.value, (l) => (n(), s("section", {
          key: l.name,
          class: "ks-group"
        }, [
          ie.value ? $("", !0) : (n(), s("div", ze, [
            y("h2", Ge, x(l.name), 1),
            y("span", Ye, x(l.items.length), 1)
          ])),
          (n(), M(R(c.all ? "table" : "div"), {
            class: U(["ks-list", { "ks-all-table": c.all }])
          }, {
            default: I(() => [
              c.all ? (n(), s("thead", Qe, [...a[1] || (a[1] = [
                y("tr", null, [
                  y("th", { scope: "col" }, "Owner"),
                  y("th", { scope: "col" }, "Setting"),
                  y("th", { scope: "col" }, "Value")
                ], -1)
              ])])) : $("", !0),
              (n(), M(R(c.all ? "tbody" : "div"), null, {
                default: I(() => [
                  (n(!0), s(L, null, K(l.items, (t) => (n(), M(R(c.all ? "tr" : "div"), {
                    key: r(t),
                    class: U(["ks-row", { "ks-row-invalid": t.error || d.value[r(t)], "ks-row-wc": t.ui }])
                  }, {
                    default: I(() => [
                      c.all ? (n(), s("td", We, x(O(t)), 1)) : $("", !0),
                      (n(), M(R(c.all ? "td" : "div"), { class: "ks-row-main" }, {
                        default: I(() => [
                          y("div", Xe, [
                            y("span", {
                              id: A(t, "title"),
                              class: "ks-title"
                            }, x(m(t)), 9, Ze),
                            y("code", et, x(t.key), 1),
                            t.is_secret && t.has_value ? (n(), s("span", tt, "set")) : !t.is_default && !t.is_secret ? (n(), s("span", at, "overridden")) : $("", !0)
                          ]),
                          t.error ? (n(), s("p", {
                            key: 0,
                            id: A(t, "error"),
                            class: "ks-field-err",
                            role: "alert"
                          }, x(t.error), 9, nt)) : $("", !0),
                          t.description ? (n(), s("p", {
                            key: 1,
                            id: A(t, "description"),
                            class: "ks-desc"
                          }, x(t.description), 9, lt)) : $("", !0),
                          P(t.schema) ? (n(), s("p", {
                            key: 2,
                            id: A(t, "hint"),
                            class: "ks-hint"
                          }, x(P(t.schema)), 9, rt)) : $("", !0),
                          !t.is_default && t.updated_by ? (n(), s("p", ot, [
                            Q("by " + x(t.updated_by), 1),
                            t.updated_at ? (n(), s("span", it, " · " + x(j(qe)(t.updated_at)), 1)) : $("", !0)
                          ])) : $("", !0)
                        ]),
                        _: 2
                      }, 1024)),
                      t.ui ? (n(), M(R(c.all ? "td" : "div"), {
                        key: 1,
                        class: "ks-wc-slot"
                      }, {
                        default: I(() => [
                          (n(), M(W, {
                            key: r(t),
                            tag: t.ui,
                            config: se(t),
                            label: m(t),
                            attrs: { role: "group", ...o(t) },
                            onChange: pe
                          }, null, 8, ["tag", "config", "label", "attrs"]))
                        ]),
                        _: 2
                      }, 1024)) : (n(), M(R(c.all ? "td" : "div"), {
                        key: 2,
                        class: "ks-control"
                      }, {
                        default: I(() => [
                          y("div", st, [
                            t.editable === !1 ? (n(), s("span", ut, x(t.value), 1)) : (n(), s(L, { key: 1 }, [
                              t.control ? (n(), M(W, {
                                key: 0,
                                tag: t.control.tag,
                                label: m(t),
                                attrs: { ...t.control.props, role: "group", description: t.description, ...o(t), value: te(t, u.value[r(t)]) },
                                onSelect: (i) => ce(t, i)
                              }, null, 8, ["tag", "label", "attrs", "onSelect"])) : t.value_type === "bool" ? (n(), M(j(Ae), {
                                key: 1,
                                pt: { input: o(t) },
                                "model-value": !!u.value[r(t)],
                                "onUpdate:modelValue": (i) => u.value[r(t)] = i
                              }, null, 8, ["pt", "model-value", "onUpdate:modelValue"])) : Z(t) ? (n(), M(j(Me), {
                                key: 2,
                                class: U(["ks-select", { "ks-select-invalid": d.value[r(t)] }]),
                                pt: { label: o(t) },
                                "model-value": u.value[r(t)],
                                options: Z(t),
                                "onUpdate:modelValue": (i) => {
                                  u.value[r(t)] = i, E(t);
                                }
                              }, null, 8, ["pt", "class", "model-value", "options", "onUpdate:modelValue"])) : t.value_type === "int" ? (n(), s("input", q({
                                key: 3,
                                ref_for: !0
                              }, o(t), {
                                type: "number",
                                class: ["ks-input", { "ks-input-invalid": d.value[r(t)] }],
                                min: t.schema?.minimum,
                                max: t.schema?.maximum,
                                value: u.value[r(t)],
                                onInput: (i) => {
                                  u.value[r(t)] = Number(i.target.value), E(t);
                                }
                              }), null, 16, ct)) : t.value_type === "json" ? (n(), s("textarea", q({
                                key: 4,
                                ref_for: !0
                              }, o(t), {
                                rows: "4",
                                class: ["ks-input", { "ks-input-invalid": d.value[r(t)] }],
                                value: u.value[r(t)],
                                onInput: (i) => {
                                  u.value[r(t)] = i.target.value, E(t);
                                }
                              }), null, 16, dt)) : t.value_type === "secret" ? (n(), s("input", q({
                                key: 5,
                                ref_for: !0
                              }, o(t), {
                                type: "password",
                                autocomplete: "off",
                                class: ["ks-input", { "ks-input-invalid": d.value[r(t)] }],
                                placeholder: t.has_value ? "•••••••• set — type to replace" : "Not set",
                                value: u.value[r(t)],
                                onInput: (i) => {
                                  u.value[r(t)] = i.target.value, E(t);
                                }
                              }), null, 16, mt)) : (n(), s("input", q({
                                key: 6,
                                ref_for: !0
                              }, o(t), {
                                type: "text",
                                class: ["ks-input", { "ks-input-invalid": d.value[r(t)] }],
                                minlength: t.schema?.minLength,
                                maxlength: t.schema?.maxLength,
                                value: u.value[r(t)],
                                onInput: (i) => {
                                  u.value[r(t)] = i.target.value, E(t);
                                }
                              }), null, 16, ft)),
                              g.value === r(t) ? (n(), s("span", pt, [...a[2] || (a[2] = [
                                y("span", { class: "ks-saved-tick" }, "✓", -1),
                                Q(" Saved", -1)
                              ])])) : $("", !0),
                              T(j(ne), {
                                type: "button",
                                label: p.value === r(t) ? "Saving…" : "Save",
                                "aria-label": `Save ${m(t)}`,
                                "aria-describedby": N(t),
                                loading: p.value === r(t),
                                disabled: p.value === r(t) || !!d.value[r(t)] || t.value_type !== "bool" && !de(t),
                                onClick: (i) => me(t)
                              }, null, 8, ["label", "aria-label", "aria-describedby", "loading", "disabled", "onClick"]),
                              t.is_default ? $("", !0) : (n(), M(j(ne), {
                                key: 8,
                                type: "button",
                                severity: "secondary",
                                text: "",
                                rounded: "",
                                disabled: p.value === r(t),
                                title: "Reset to default",
                                "aria-label": `Reset ${m(t)} to default`,
                                "aria-describedby": N(t),
                                onClick: (i) => fe(t)
                              }, {
                                icon: I(() => [
                                  T(j(X), {
                                    icon: "tabler:rotate",
                                    "aria-hidden": "true"
                                  })
                                ]),
                                _: 1
                              }, 8, ["disabled", "aria-label", "aria-describedby", "onClick"]))
                            ], 64))
                          ]),
                          d.value[r(t)] ? (n(), s("p", {
                            key: 0,
                            id: A(t, "validation"),
                            role: "alert",
                            class: "ks-field-err"
                          }, x(d.value[r(t)]), 9, vt)) : $("", !0)
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
      ], 64)) : (n(), s("div", Je, "No settings declared."))
    ]));
  }
}), yt = { class: "ks" }, ht = {
  key: 0,
  class: "ks-err"
}, gt = {
  key: 1,
  class: "ks-loading"
}, kt = {
  key: 2,
  class: "ks-empty"
}, bt = {
  key: 3,
  class: "ks-shell"
}, _t = { class: "ks-pane-head" }, $t = { class: "ks-pane-ico" }, xt = { class: "ks-pane-head-text" }, wt = { key: 0 }, St = {
  key: 2,
  class: "ks-empty"
}, At = /* @__PURE__ */ J({
  __name: "settings",
  setup(c) {
    const f = Be(), v = V(() => {
      const o = f.value?.route;
      return typeof o == "string" && o.length ? o : "";
    }), k = C([]), h = C(!0), p = C(""), g = C(""), u = C(!1), d = { value: "", label: "All settings", icon: "tabler:table" }, r = V(() => {
      const o = [];
      for (const S of k.value) {
        const m = S.group || "", D = { value: S.key, label: S.title, icon: S.icon || "tabler:adjustments" }, O = o[o.length - 1];
        O && O.heading === m ? O.items.push(D) : o.push({ heading: m, items: [D] });
      }
      return o;
    }), w = V(() => k.value.find((o) => o.key === g.value) || null);
    function A(o) {
      u.value = o === d.value, u.value || (g.value = o);
    }
    async function N() {
      h.value = !0, p.value = "";
      try {
        const { data: o } = await H.get("/api/v1/settings/blocks");
        if (!o?.success) throw new Error(o?.error || "failed to load settings blocks");
        k.value = Array.isArray(o.blocks) ? o.blocks : [];
        const S = v.value && k.value.some((m) => m.key === v.value) ? v.value : k.value.some((m) => m.key === g.value) ? g.value : k.value[0]?.key || "";
        g.value = S, v.value === "all-settings" && !k.value.some((m) => m.key === v.value) && (u.value = !0);
      } catch (o) {
        p.value = o instanceof Error ? o.message : String(o);
      } finally {
        h.value = !1;
      }
    }
    return he(N), (o, S) => (n(), s("div", yt, [
      p.value ? (n(), s("div", ht, x(p.value), 1)) : $("", !0),
      h.value ? (n(), s("div", gt, "Loading…")) : k.value.length ? (n(), s("div", bt, [
        T(Pe, {
          label: "Settings sections",
          value: u.value ? d.value : g.value,
          groups: r.value,
          "leading-item": d,
          "onUpdate:value": A
        }, null, 8, ["value", "groups"]),
        y("section", {
          class: U(["ks-pane", { "ks-pane-flush": !u.value && w.value && w.value.component_tag }])
        }, [
          u.value ? (n(), s(L, { key: 0 }, [
            S[0] || (S[0] = y("header", { class: "ks-pane-head" }, [
              y("h1", null, "All settings")
            ], -1)),
            T(re, {
              key: "all-settings-table",
              namespace: "",
              all: "",
              blocks: k.value
            }, null, 8, ["blocks"])
          ], 64)) : w.value ? (n(), s(L, { key: 1 }, [
            w.value.component_tag ? (n(), M(W, {
              key: w.value.key,
              tag: w.value.component_tag,
              config: w.value.config
            }, null, 8, ["tag", "config"])) : w.value.namespace ? (n(), s(L, { key: 1 }, [
              y("header", _t, [
                y("span", $t, [
                  T(j(X), {
                    icon: w.value.icon || "tabler:adjustments",
                    "aria-hidden": "true"
                  }, null, 8, ["icon"])
                ]),
                y("div", xt, [
                  y("h1", null, x(w.value.title), 1),
                  typeof w.value.config?.description == "string" ? (n(), s("p", wt, x(w.value.config.description), 1)) : $("", !0)
                ])
              ]),
              (n(), M(re, {
                key: w.value.key,
                namespace: w.value.namespace
              }, null, 8, ["namespace"]))
            ], 64)) : (n(), s("div", St, "This block has no editor."))
          ], 64)) : $("", !0)
        ], 2)
      ])) : (n(), s("div", kt, "No settings declared."))
    ]));
  }
}), Lt = {
  rootComponent: At,
  plugins: [ge]
};
export {
  Lt as mountConfig
};
//# sourceMappingURL=lazy-mount-Dw2aUvnq.js.map

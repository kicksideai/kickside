import { a as ie, u as ue, W as ce, s as me } from "./styles-DUWI6o6L.js";
import { s as Q, P as pe } from "./index-GXCRJfhs.js";
import { defineComponent as ee, ref as S, computed as q, watch as de, onMounted as fe, openBlock as o, createElementBlock as r, toDisplayString as b, createCommentVNode as _, Fragment as L, withDirectives as ve, vModelText as ye, renderList as H, createElementVNode as m, createBlock as M, resolveDynamicComponent as I, normalizeClass as A, withCtx as V, createTextVNode as X, unref as N, createVNode as R } from "vue";
import { Icon as K } from "@iconify/vue";
import { W, s as he, a as ke } from "./WcMount-BnlU48df.js";
import { api as F, define as ge } from "@wippy-fe/proxy";
const _e = () => ie();
function be(f) {
  if (!f) return null;
  let v;
  if (typeof f == "number")
    v = f;
  else {
    const k = f.trim();
    if (/^\d+$/.test(k))
      v = Number(k);
    else {
      const g = Date.parse(k);
      return Number.isNaN(g) ? null : g;
    }
  }
  return Number.isFinite(v) ? v < 1e12 ? v * 1e3 : v : null;
}
function $e(f, v) {
  const k = be(f);
  if (k === null) return "";
  const g = v?.now ?? Date.now(), w = v?.suffix ?? !0, $ = v?.maxUnit ?? "day", x = v?.future ?? !1, u = 6e4, c = 60 * u, a = 24 * c, D = 30 * a, C = 365 * a, j = g - k;
  if (x && j < 0) {
    const d = -j;
    return d < u ? "in <1m" : d < c ? `in ${Math.floor(d / u)}m` : d < a ? `in ${Math.floor(d / c)}h` : `in ${Math.floor(d / a)}d`;
  }
  const i = Math.max(0, j);
  if (i < u) return "just now";
  const p = w ? " ago" : "";
  return i < c ? `${Math.floor(i / u)}m${p}` : i < a ? `${Math.floor(i / c)}h${p}` : $ === "year" ? i < D ? `${Math.floor(i / a)}d${p}` : i < C ? `${Math.floor(i / D)}mo${p}` : `${Math.floor(i / C)}y${p}` : `${Math.floor(i / a)}d${p}`;
}
const we = { class: "ks-form" }, xe = {
  key: 0,
  class: "ks-err"
}, Ce = {
  key: 1,
  class: "ks-loading"
}, Me = {
  key: 2,
  class: "ks-empty"
}, Se = {
  key: 0,
  class: "ks-group-head"
}, Ae = { class: "ks-group-title" }, je = { class: "ks-group-count" }, Ne = { key: 0 }, Le = {
  key: 0,
  class: "ks-owner"
}, Oe = { class: "ks-row-head" }, Ee = { class: "ks-title" }, Ue = { class: "ks-key" }, Ve = {
  key: 0,
  class: "ks-tag kx-tag-caps ks-tag-on"
}, De = {
  key: 1,
  class: "ks-tag kx-tag-caps ks-tag-on"
}, Ie = {
  key: 0,
  class: "ks-field-err",
  role: "alert"
}, Re = {
  key: 1,
  class: "ks-desc"
}, Te = {
  key: 2,
  class: "ks-hint"
}, qe = {
  key: 3,
  class: "ks-prov"
}, Pe = { key: 0 }, Be = { class: "ks-field" }, Ke = {
  key: 0,
  class: "ks-static"
}, Fe = ["min", "max", "value", "onInput"], He = ["value", "onInput"], Je = ["placeholder", "value", "onInput"], We = ["minlength", "maxlength", "value", "onInput"], Ge = {
  key: 7,
  class: "ks-saved"
}, Ye = {
  key: 0,
  class: "ks-field-err"
}, J = "General", Z = /* @__PURE__ */ ee({
  __name: "SettingsForm",
  props: {
    namespace: {},
    all: { type: Boolean, default: !1 },
    blocks: { default: () => [] }
  },
  setup(f) {
    const v = f, k = S([]), g = S(!0), w = S(""), $ = S(""), x = S(""), u = S({}), c = S({}), a = (e) => `${e.namespace} ${e.key}`;
    function D(e) {
      const n = e.split(/[._\-\s]+/).filter(Boolean);
      return n.length ? n.map((l, t) => t === 0 ? l.charAt(0).toUpperCase() + l.slice(1) : l).join(" ") : e;
    }
    const C = (e) => e.title && e.title.length ? e.title : D(e.key), j = S(""), i = (e) => e.owner ? e.owner : v.blocks.find((l) => l.namespace === e.namespace || l.namespaces?.includes(e.namespace))?.title || e.namespace, p = q(() => {
      if (v.all) {
        const t = j.value.trim().toLowerCase(), s = k.value.filter((y) => !t || [
          C(y),
          y.key,
          y.namespace,
          i(y),
          y.description || ""
        ].some((h) => h.toLowerCase().includes(t)));
        return s.sort((y, h) => i(y).localeCompare(i(h)) || (y.order ?? 100) - (h.order ?? 100) || C(y).localeCompare(C(h))), [{ name: J, items: s }];
      }
      const e = /* @__PURE__ */ new Map();
      for (const t of k.value) {
        const s = t.category && t.category.length ? t.category : J;
        e.has(s) || e.set(s, []), e.get(s).push(t);
      }
      const n = (t) => typeof t.order == "number" ? t.order : 100, l = [];
      for (const [t, s] of e)
        s.sort((y, h) => n(y) - n(h) || C(y).localeCompare(C(h))), l.push({ name: t, items: s });
      return l.sort((t, s) => {
        const y = Math.min(...t.items.map(n)), h = Math.min(...s.items.map(n));
        return y - h || t.name.localeCompare(s.name);
      }), l;
    }), d = q(() => p.value.length === 1 && p.value[0].name === J), O = (e) => Array.isArray(e.schema?.enum) ? e.schema.enum : null;
    function E(e) {
      return {
        namespace: e.namespace,
        key: e.key,
        value: e.value,
        value_type: e.value_type,
        default: e.default,
        has_value: e.has_value,
        is_secret: e.is_secret,
        description: e.description,
        title: C(e),
        schema: e.schema ?? null
      };
    }
    function P(e, n, l = "") {
      if (!e) return "";
      const t = (s) => l ? `${l}: ${s}` : s;
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
        for (let s = 0; s < n.length; s++) {
          const y = P(e.items, n[s], `${l}[${s}]`);
          if (y) return y;
        }
      if (n !== null && typeof n == "object" && !Array.isArray(n)) {
        const s = n, y = (h) => l ? `${l}.${h}` : h;
        for (const h of e.required ?? [])
          if (!Object.hasOwn(s, h)) return `${y(h)}: Required`;
        for (const [h, re] of Object.entries(e.properties ?? {})) {
          if (!Object.hasOwn(s, h)) continue;
          const z = P(re, s[h], y(h));
          if (z) return z;
        }
      }
      return "";
    }
    function B(e) {
      if (!e) return "";
      const n = [];
      if (e.type && n.push(e.type), typeof e.minimum == "number" || typeof e.maximum == "number") {
        const l = typeof e.minimum == "number" ? e.minimum : "−∞", t = typeof e.maximum == "number" ? e.maximum : "∞";
        n.push(`range ${l}–${t}`);
      }
      (typeof e.minLength == "number" || typeof e.maxLength == "number") && n.push(`length ${e.minLength ?? 0}–${e.maxLength ?? "∞"}`), e.pattern && n.push(`pattern ${e.pattern}`), Array.isArray(e.enum) && n.push(`one of ${e.enum.join(", ")}`), e.required?.length && n.push(`required: ${e.required.join(", ")}`), e.items && n.push(`items: ${B(e.items)}`);
      for (const [l, t] of Object.entries(e.properties ?? {}))
        n.push(`${l}: ${B(t)}`);
      return n.join(" · ");
    }
    function U(e) {
      const n = a(e);
      if (e.value_type === "secret" && !String(u.value[n] ?? "").length)
        return delete c.value[n], "";
      let l = u.value[n], t;
      try {
        e.value_type === "json" ? l = JSON.parse(String(l)) : ((e.value_type === "int" || e.schema?.type === "integer" || e.schema?.type === "number") && (l = Number(l)), e.schema?.type === "string" && (l = String(l))), t = P(e.schema, l);
      } catch (s) {
        t = s instanceof Error ? s.message : String(s);
      }
      return t ? c.value[n] = t : delete c.value[n], t;
    }
    function G(e, n) {
      u.value[a(e)] = e.value_type === "json" ? JSON.stringify(n, null, 2) : n;
    }
    function te(e) {
      G(e, e.value_type === "secret" ? "" : e.value);
    }
    function ne(e, n) {
      G(e, n), U(e);
    }
    async function T() {
      g.value = !0, w.value = "";
      try {
        const e = v.all ? "/api/v1/settings" : `/api/v1/settings?namespace=${encodeURIComponent(v.namespace)}`, { data: n } = await F.get(e);
        if (!n?.success) throw new Error(n?.error || "failed to load settings");
        k.value = Array.isArray(n.settings) ? n.settings : [];
        for (const l of k.value) te(l);
      } catch (e) {
        w.value = e instanceof Error ? e.message : String(e);
      } finally {
        g.value = !1;
      }
    }
    function Y(e, n) {
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
    const ae = (e) => {
      const n = u.value[a(e)];
      return e.value_type === "secret" ? String(n ?? "").length > 0 : e.value_type === "json" ? n !== JSON.stringify(e.value, null, 2) : n !== e.value;
    };
    async function oe(e) {
      const n = a(e);
      if (!U(e)) {
        $.value = n, w.value = "";
        try {
          const l = Y(e, u.value[n]), { data: t } = await F.put("/api/v1/settings", { namespace: e.namespace, key: e.key, value: l });
          if (!t?.success) {
            c.value[n] = t?.error || "save failed";
            return;
          }
          delete c.value[n], x.value = n, setTimeout(() => {
            x.value === n && (x.value = "");
          }, 2e3), await T();
        } catch (l) {
          c.value[n] = l instanceof Error ? l.message : String(l);
        } finally {
          $.value = "";
        }
      }
    }
    async function le(e) {
      const n = a(e);
      $.value = n, w.value = "";
      try {
        const { data: l } = await F.put("/api/v1/settings", { namespace: e.namespace, key: e.key, value: null });
        if (!l?.success) throw new Error(l?.error || "reset failed");
        await T();
      } catch (l) {
        w.value = l instanceof Error ? l.message : String(l);
      } finally {
        $.value = "";
      }
    }
    async function se() {
      await T();
    }
    return de(() => [v.namespace, v.all], T), fe(T), (e, n) => (o(), r("div", we, [
      w.value ? (o(), r("div", xe, b(w.value), 1)) : _("", !0),
      g.value ? (o(), r("div", Ce, "Loading…")) : k.value.length ? (o(), r(L, { key: 3 }, [
        f.all ? ve((o(), r("input", {
          key: 0,
          "onUpdate:modelValue": n[0] || (n[0] = (l) => j.value = l),
          type: "search",
          class: "ks-input ks-all-search",
          "aria-label": "Search settings",
          placeholder: "Search settings"
        }, null, 512)), [
          [ye, j.value]
        ]) : _("", !0),
        (o(!0), r(L, null, H(p.value, (l) => (o(), r("section", {
          key: l.name,
          class: "ks-group"
        }, [
          d.value ? _("", !0) : (o(), r("div", Se, [
            m("h2", Ae, b(l.name), 1),
            m("span", je, b(l.items.length), 1)
          ])),
          (o(), M(I(f.all ? "table" : "div"), {
            class: A(["ks-list", { "ks-all-table": f.all }])
          }, {
            default: V(() => [
              f.all ? (o(), r("thead", Ne, [...n[1] || (n[1] = [
                m("tr", null, [
                  m("th", { scope: "col" }, "Owner"),
                  m("th", { scope: "col" }, "Setting"),
                  m("th", { scope: "col" }, "Value")
                ], -1)
              ])])) : _("", !0),
              (o(), M(I(f.all ? "tbody" : "div"), null, {
                default: V(() => [
                  (o(!0), r(L, null, H(l.items, (t) => (o(), M(I(f.all ? "tr" : "div"), {
                    key: a(t),
                    class: A(["ks-row", { "ks-row-invalid": t.error || c.value[a(t)], "ks-row-wc": t.ui }])
                  }, {
                    default: V(() => [
                      f.all ? (o(), r("td", Le, b(i(t)), 1)) : _("", !0),
                      (o(), M(I(f.all ? "td" : "div"), { class: "ks-row-main" }, {
                        default: V(() => [
                          m("div", Oe, [
                            m("span", Ee, b(C(t)), 1),
                            m("code", Ue, b(t.key), 1),
                            t.is_secret && t.has_value ? (o(), r("span", Ve, "set")) : !t.is_default && !t.is_secret ? (o(), r("span", De, "overridden")) : _("", !0)
                          ]),
                          t.error ? (o(), r("p", Ie, b(t.error), 1)) : _("", !0),
                          t.description ? (o(), r("p", Re, b(t.description), 1)) : _("", !0),
                          B(t.schema) ? (o(), r("p", Te, b(B(t.schema)), 1)) : _("", !0),
                          !t.is_default && t.updated_by ? (o(), r("p", qe, [
                            X("by " + b(t.updated_by), 1),
                            t.updated_at ? (o(), r("span", Pe, " · " + b(N($e)(t.updated_at)), 1)) : _("", !0)
                          ])) : _("", !0)
                        ]),
                        _: 2
                      }, 1024)),
                      t.ui ? (o(), M(I(f.all ? "td" : "div"), {
                        key: 1,
                        class: "ks-wc-slot"
                      }, {
                        default: V(() => [
                          (o(), M(W, {
                            key: a(t),
                            tag: t.ui,
                            config: E(t),
                            onChange: se
                          }, null, 8, ["tag", "config"]))
                        ]),
                        _: 2
                      }, 1024)) : (o(), M(I(f.all ? "td" : "div"), {
                        key: 2,
                        class: "ks-control"
                      }, {
                        default: V(() => [
                          m("div", Be, [
                            t.editable === !1 ? (o(), r("span", Ke, b(t.value), 1)) : (o(), r(L, { key: 1 }, [
                              t.control ? (o(), M(W, {
                                key: 0,
                                tag: t.control.tag,
                                attrs: { ...t.control.props, value: Y(t, u.value[a(t)]) },
                                onSelect: (s) => ne(t, s)
                              }, null, 8, ["tag", "attrs", "onSelect"])) : t.value_type === "bool" ? (o(), M(N(he), {
                                key: 1,
                                "model-value": !!u.value[a(t)],
                                "aria-label": C(t),
                                "onUpdate:modelValue": (s) => u.value[a(t)] = s
                              }, null, 8, ["model-value", "aria-label", "onUpdate:modelValue"])) : O(t) ? (o(), M(N(ke), {
                                key: 2,
                                class: A(["ks-select", { "ks-select-invalid": c.value[a(t)] }]),
                                "model-value": u.value[a(t)],
                                options: O(t),
                                "onUpdate:modelValue": (s) => {
                                  u.value[a(t)] = s, U(t);
                                }
                              }, null, 8, ["class", "model-value", "options", "onUpdate:modelValue"])) : t.value_type === "int" ? (o(), r("input", {
                                key: 3,
                                type: "number",
                                class: A(["ks-input", { "ks-input-invalid": c.value[a(t)] }]),
                                min: t.schema?.minimum,
                                max: t.schema?.maximum,
                                value: u.value[a(t)],
                                onInput: (s) => {
                                  u.value[a(t)] = Number(s.target.value), U(t);
                                }
                              }, null, 42, Fe)) : t.value_type === "json" ? (o(), r("textarea", {
                                key: 4,
                                rows: "4",
                                class: A(["ks-input", { "ks-input-invalid": c.value[a(t)] }]),
                                value: u.value[a(t)],
                                onInput: (s) => {
                                  u.value[a(t)] = s.target.value, U(t);
                                }
                              }, null, 42, He)) : t.value_type === "secret" ? (o(), r("input", {
                                key: 5,
                                type: "password",
                                autocomplete: "off",
                                class: A(["ks-input", { "ks-input-invalid": c.value[a(t)] }]),
                                placeholder: t.has_value ? "•••••••• set — type to replace" : "Not set",
                                value: u.value[a(t)],
                                onInput: (s) => {
                                  u.value[a(t)] = s.target.value, U(t);
                                }
                              }, null, 42, Je)) : (o(), r("input", {
                                key: 6,
                                type: "text",
                                class: A(["ks-input", { "ks-input-invalid": c.value[a(t)] }]),
                                minlength: t.schema?.minLength,
                                maxlength: t.schema?.maxLength,
                                value: u.value[a(t)],
                                onInput: (s) => {
                                  u.value[a(t)] = s.target.value, U(t);
                                }
                              }, null, 42, We)),
                              x.value === a(t) ? (o(), r("span", Ge, [...n[2] || (n[2] = [
                                m("span", { class: "ks-saved-tick" }, "✓", -1),
                                X(" Saved", -1)
                              ])])) : _("", !0),
                              R(N(Q), {
                                type: "button",
                                label: $.value === a(t) ? "Saving…" : "Save",
                                loading: $.value === a(t),
                                disabled: $.value === a(t) || !!c.value[a(t)] || t.value_type !== "bool" && !ae(t),
                                onClick: (s) => oe(t)
                              }, null, 8, ["label", "loading", "disabled", "onClick"]),
                              t.is_default ? _("", !0) : (o(), M(N(Q), {
                                key: 8,
                                type: "button",
                                severity: "secondary",
                                text: "",
                                rounded: "",
                                disabled: $.value === a(t),
                                title: "Reset to default",
                                "aria-label": "Reset to default",
                                onClick: (s) => le(t)
                              }, {
                                icon: V(() => [
                                  R(N(K), {
                                    icon: "tabler:rotate",
                                    "aria-hidden": "true"
                                  })
                                ]),
                                _: 1
                              }, 8, ["disabled", "onClick"]))
                            ], 64))
                          ]),
                          c.value[a(t)] ? (o(), r("p", Ye, b(c.value[a(t)]), 1)) : _("", !0)
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
      ], 64)) : (o(), r("div", Me, "No settings declared."))
    ]));
  }
}), ze = { class: "ks" }, Qe = {
  key: 0,
  class: "ks-err"
}, Xe = {
  key: 1,
  class: "ks-loading"
}, Ze = {
  key: 2,
  class: "ks-empty"
}, et = {
  key: 3,
  class: "ks-shell"
}, tt = {
  class: "ks-nav",
  "aria-label": "Settings sections"
}, nt = {
  key: 0,
  class: "ks-nav-group"
}, at = ["onClick"], ot = { class: "ks-nav-label" }, lt = { class: "ks-pane-head" }, st = { class: "ks-pane-ico" }, rt = { class: "ks-pane-head-text" }, it = { key: 0 }, ut = {
  key: 2,
  class: "ks-empty"
}, ct = /* @__PURE__ */ ee({
  __name: "settings",
  setup(f) {
    const v = _e(), k = q(() => {
      const i = v.value?.route;
      return typeof i == "string" && i.length ? i : "";
    }), g = S([]), w = S(!0), $ = S(""), x = S(""), u = S(!1), c = q(() => {
      const i = [];
      for (const p of g.value) {
        const d = p.group || "", O = i[i.length - 1];
        O && O.group === d ? O.items.push(p) : i.push({ group: d, items: [p] });
      }
      return i;
    }), a = q(() => g.value.find((i) => i.key === x.value) || null);
    function D(i) {
      u.value = !1, x.value = i;
    }
    function C() {
      u.value = !0;
    }
    async function j() {
      w.value = !0, $.value = "";
      try {
        const { data: i } = await F.get("/api/v1/settings/blocks");
        if (!i?.success) throw new Error(i?.error || "failed to load settings blocks");
        g.value = Array.isArray(i.blocks) ? i.blocks : [];
        const p = k.value && g.value.some((d) => d.key === k.value) ? k.value : g.value.some((d) => d.key === x.value) ? x.value : g.value[0]?.key || "";
        x.value = p, k.value === "all-settings" && !g.value.some((d) => d.key === k.value) && (u.value = !0);
      } catch (i) {
        $.value = i instanceof Error ? i.message : String(i);
      } finally {
        w.value = !1;
      }
    }
    return ue(j), (i, p) => (o(), r("div", ze, [
      $.value ? (o(), r("div", Qe, b($.value), 1)) : _("", !0),
      w.value ? (o(), r("div", Xe, "Loading…")) : g.value.length ? (o(), r("div", et, [
        m("nav", tt, [
          m("button", {
            type: "button",
            class: A(["ks-nav-item", { "ks-nav-item-active": u.value }]),
            onClick: C
          }, [
            R(N(K), {
              class: "ks-nav-ico",
              icon: "tabler:table",
              "aria-hidden": "true"
            }),
            p[0] || (p[0] = m("span", { class: "ks-nav-label" }, "All settings", -1))
          ], 2),
          (o(!0), r(L, null, H(c.value, (d, O) => (o(), r("div", {
            key: O,
            class: "ks-nav-section"
          }, [
            d.group ? (o(), r("div", nt, b(d.group), 1)) : _("", !0),
            (o(!0), r(L, null, H(d.items, (E) => (o(), r("button", {
              key: E.key,
              type: "button",
              class: A(["ks-nav-item", { "ks-nav-item-active": !u.value && E.key === x.value }]),
              onClick: (P) => D(E.key)
            }, [
              R(N(K), {
                class: "ks-nav-ico",
                icon: E.icon || "tabler:adjustments",
                "aria-hidden": "true"
              }, null, 8, ["icon"]),
              m("span", ot, b(E.title), 1)
            ], 10, at))), 128))
          ]))), 128))
        ]),
        m("section", {
          class: A(["ks-pane", { "ks-pane-flush": !u.value && a.value && a.value.component_tag }])
        }, [
          u.value ? (o(), r(L, { key: 0 }, [
            p[1] || (p[1] = m("header", { class: "ks-pane-head" }, [
              m("h1", null, "All settings")
            ], -1)),
            R(Z, {
              key: "all-settings-table",
              namespace: "",
              all: "",
              blocks: g.value
            }, null, 8, ["blocks"])
          ], 64)) : a.value ? (o(), r(L, { key: 1 }, [
            a.value.component_tag ? (o(), M(W, {
              key: a.value.key,
              tag: a.value.component_tag,
              config: a.value.config
            }, null, 8, ["tag", "config"])) : a.value.namespace ? (o(), r(L, { key: 1 }, [
              m("header", lt, [
                m("span", st, [
                  R(N(K), {
                    icon: a.value.icon || "tabler:adjustments",
                    "aria-hidden": "true"
                  }, null, 8, ["icon"])
                ]),
                m("div", rt, [
                  m("h1", null, b(a.value.title), 1),
                  typeof a.value.config?.description == "string" ? (o(), r("p", it, b(a.value.config.description), 1)) : _("", !0)
                ])
              ]),
              (o(), M(Z, {
                key: a.value.key,
                namespace: a.value.namespace
              }, null, 8, ["namespace"]))
            ], 64)) : (o(), r("div", ut, "This block has no editor."))
          ], 64)) : _("", !0)
        ], 2)
      ])) : (o(), r("div", Ze, "No settings declared."))
    ]));
  }
}), mt = { props: { type: "object", properties: { route: { type: "string", default: "", description: "Deep-link to a settings block by key. Unset selects the first block." } } } }, pt = {
  wippy: mt
};
class dt extends ce {
  static get wippyConfig() {
    return {
      propsSchema: pt.wippy.props,
      hostCssKeys: ["themeConfigUrl", "primeVueCssUrl"],
      inlineCss: me
    };
  }
  static get vueConfig() {
    return { rootComponent: ct, plugins: [pe] };
  }
}
ge(import.meta.url, dt);
//# sourceMappingURL=index.js.map

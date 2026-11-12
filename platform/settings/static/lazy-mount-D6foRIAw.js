import { P as ie } from "./primevue-plugin-CaP7wV_M.js";
import { defineComponent as ee, ref as A, computed as q, watch as ue, onMounted as ce, openBlock as o, createElementBlock as s, toDisplayString as b, createCommentVNode as _, Fragment as L, withDirectives as me, vModelText as de, renderList as J, createElementVNode as m, createBlock as S, resolveDynamicComponent as D, normalizeClass as C, withCtx as U, createTextVNode as W, unref as j, createVNode as R } from "vue";
import { Icon as F } from "@iconify/vue";
import { b as pe, u as fe } from "./wc-runtime-DjtZy7dL.js";
import X from "primevue/button";
import ve from "primevue/select";
import ye from "primevue/toggleswitch";
import { _ as G } from "./WcMount.vue_vue_type_script_setup_true_lang-CNWT59Oh.js";
import { api as H } from "@wippy-fe/proxy";
const he = () => pe();
function ke(h) {
  if (!h) return null;
  let f;
  if (typeof h == "number")
    f = h;
  else {
    const k = h.trim();
    if (/^\d+$/.test(k))
      f = Number(k);
    else {
      const g = Date.parse(k);
      return Number.isNaN(g) ? null : g;
    }
  }
  return Number.isFinite(f) ? f < 1e12 ? f * 1e3 : f : null;
}
function ge(h, f) {
  const k = ke(h);
  if (k === null) return "";
  const g = f?.now ?? Date.now(), w = f?.suffix ?? !0, $ = f?.maxUnit ?? "day", x = f?.future ?? !1, u = 6e4, c = 60 * u, a = 24 * c, V = 30 * a, M = 365 * a, N = g - k;
  if (x && N < 0) {
    const p = -N;
    return p < u ? "in <1m" : p < c ? `in ${Math.floor(p / u)}m` : p < a ? `in ${Math.floor(p / c)}h` : `in ${Math.floor(p / a)}d`;
  }
  const i = Math.max(0, N);
  if (i < u) return "just now";
  const d = w ? " ago" : "";
  return i < c ? `${Math.floor(i / u)}m${d}` : i < a ? `${Math.floor(i / c)}h${d}` : $ === "year" ? i < V ? `${Math.floor(i / a)}d${d}` : i < M ? `${Math.floor(i / V)}mo${d}` : `${Math.floor(i / M)}y${d}` : `${Math.floor(i / a)}d${d}`;
}
const _e = { class: "ks-form" }, be = {
  key: 0,
  class: "ks-err"
}, $e = {
  key: 1,
  class: "ks-loading"
}, we = {
  key: 2,
  class: "ks-empty"
}, xe = {
  key: 0,
  class: "ks-group-head"
}, Me = { class: "ks-group-title" }, Se = { class: "ks-group-count" }, Ae = { key: 0 }, Ce = {
  key: 0,
  class: "ks-owner"
}, Ne = { class: "ks-row-head" }, je = { class: "ks-title" }, Le = { class: "ks-key" }, Oe = {
  key: 0,
  class: "ks-tag kx-tag-caps ks-tag-on"
}, Ee = {
  key: 1,
  class: "ks-tag kx-tag-caps ks-tag-on"
}, Ie = {
  key: 0,
  class: "ks-field-err",
  role: "alert"
}, Ue = {
  key: 1,
  class: "ks-desc"
}, Ve = {
  key: 2,
  class: "ks-hint"
}, De = {
  key: 3,
  class: "ks-prov"
}, Re = { key: 0 }, Te = { class: "ks-field" }, qe = {
  key: 0,
  class: "ks-static"
}, Be = ["min", "max", "value", "onInput"], Pe = ["value", "onInput"], Fe = ["placeholder", "value", "onInput"], He = ["minlength", "maxlength", "value", "onInput"], Je = {
  key: 7,
  class: "ks-saved"
}, Ke = {
  key: 0,
  class: "ks-field-err"
}, K = "General", Z = /* @__PURE__ */ ee({
  __name: "SettingsForm",
  props: {
    namespace: {},
    all: { type: Boolean, default: !1 },
    blocks: { default: () => [] }
  },
  setup(h) {
    const f = h, k = A([]), g = A(!0), w = A(""), $ = A(""), x = A(""), u = A({}), c = A({}), a = (e) => `${e.namespace} ${e.key}`;
    function V(e) {
      const n = e.split(/[._\-\s]+/).filter(Boolean);
      return n.length ? n.map((l, t) => t === 0 ? l.charAt(0).toUpperCase() + l.slice(1) : l).join(" ") : e;
    }
    const M = (e) => e.title && e.title.length ? e.title : V(e.key), N = A(""), i = (e) => e.owner ? e.owner : f.blocks.find((l) => l.namespace === e.namespace || l.namespaces?.includes(e.namespace))?.title || e.namespace, d = q(() => {
      if (f.all) {
        const t = N.value.trim().toLowerCase(), r = k.value.filter((v) => !t || [
          M(v),
          v.key,
          v.namespace,
          i(v),
          v.description || ""
        ].some((y) => y.toLowerCase().includes(t)));
        return r.sort((v, y) => i(v).localeCompare(i(y)) || (v.order ?? 100) - (y.order ?? 100) || M(v).localeCompare(M(y))), [{ name: K, items: r }];
      }
      const e = /* @__PURE__ */ new Map();
      for (const t of k.value) {
        const r = t.category && t.category.length ? t.category : K;
        e.has(r) || e.set(r, []), e.get(r).push(t);
      }
      const n = (t) => typeof t.order == "number" ? t.order : 100, l = [];
      for (const [t, r] of e)
        r.sort((v, y) => n(v) - n(y) || M(v).localeCompare(M(y))), l.push({ name: t, items: r });
      return l.sort((t, r) => {
        const v = Math.min(...t.items.map(n)), y = Math.min(...r.items.map(n));
        return v - y || t.name.localeCompare(r.name);
      }), l;
    }), p = q(() => d.value.length === 1 && d.value[0].name === K), O = (e) => Array.isArray(e.schema?.enum) ? e.schema.enum : null;
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
        title: M(e),
        schema: e.schema ?? null
      };
    }
    function B(e, n, l = "") {
      if (!e) return "";
      const t = (r) => l ? `${l}: ${r}` : r;
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
        for (let r = 0; r < n.length; r++) {
          const v = B(e.items, n[r], `${l}[${r}]`);
          if (v) return v;
        }
      if (n !== null && typeof n == "object" && !Array.isArray(n)) {
        const r = n, v = (y) => l ? `${l}.${y}` : y;
        for (const y of e.required ?? [])
          if (!Object.hasOwn(r, y)) return `${v(y)}: Required`;
        for (const [y, se] of Object.entries(e.properties ?? {})) {
          if (!Object.hasOwn(r, y)) continue;
          const Q = B(se, r[y], v(y));
          if (Q) return Q;
        }
      }
      return "";
    }
    function P(e) {
      if (!e) return "";
      const n = [];
      if (e.type && n.push(e.type), typeof e.minimum == "number" || typeof e.maximum == "number") {
        const l = typeof e.minimum == "number" ? e.minimum : "−∞", t = typeof e.maximum == "number" ? e.maximum : "∞";
        n.push(`range ${l}–${t}`);
      }
      (typeof e.minLength == "number" || typeof e.maxLength == "number") && n.push(`length ${e.minLength ?? 0}–${e.maxLength ?? "∞"}`), e.pattern && n.push(`pattern ${e.pattern}`), Array.isArray(e.enum) && n.push(`one of ${e.enum.join(", ")}`), e.required?.length && n.push(`required: ${e.required.join(", ")}`), e.items && n.push(`items: ${P(e.items)}`);
      for (const [l, t] of Object.entries(e.properties ?? {}))
        n.push(`${l}: ${P(t)}`);
      return n.join(" · ");
    }
    function I(e) {
      const n = a(e);
      if (e.value_type === "secret" && !String(u.value[n] ?? "").length)
        return delete c.value[n], "";
      let l = u.value[n], t;
      try {
        e.value_type === "json" ? l = JSON.parse(String(l)) : ((e.value_type === "int" || e.schema?.type === "integer" || e.schema?.type === "number") && (l = Number(l)), e.schema?.type === "string" && (l = String(l))), t = B(e.schema, l);
      } catch (r) {
        t = r instanceof Error ? r.message : String(r);
      }
      return t ? c.value[n] = t : delete c.value[n], t;
    }
    function Y(e, n) {
      u.value[a(e)] = e.value_type === "json" ? JSON.stringify(n, null, 2) : n;
    }
    function te(e) {
      Y(e, e.value_type === "secret" ? "" : e.value);
    }
    function ne(e, n) {
      Y(e, n), I(e);
    }
    async function T() {
      g.value = !0, w.value = "";
      try {
        const e = f.all ? "/api/v1/settings" : `/api/v1/settings?namespace=${encodeURIComponent(f.namespace)}`, { data: n } = await H.get(e);
        if (!n?.success) throw new Error(n?.error || "failed to load settings");
        k.value = Array.isArray(n.settings) ? n.settings : [];
        for (const l of k.value) te(l);
      } catch (e) {
        w.value = e instanceof Error ? e.message : String(e);
      } finally {
        g.value = !1;
      }
    }
    function z(e, n) {
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
      if (!I(e)) {
        $.value = n, w.value = "";
        try {
          const l = z(e, u.value[n]), { data: t } = await H.put("/api/v1/settings", { namespace: e.namespace, key: e.key, value: l });
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
        const { data: l } = await H.put("/api/v1/settings", { namespace: e.namespace, key: e.key, value: null });
        if (!l?.success) throw new Error(l?.error || "reset failed");
        await T();
      } catch (l) {
        w.value = l instanceof Error ? l.message : String(l);
      } finally {
        $.value = "";
      }
    }
    async function re() {
      await T();
    }
    return ue(() => [f.namespace, f.all], T), ce(T), (e, n) => (o(), s("div", _e, [
      w.value ? (o(), s("div", be, b(w.value), 1)) : _("", !0),
      g.value ? (o(), s("div", $e, "Loading…")) : k.value.length ? (o(), s(L, { key: 3 }, [
        h.all ? me((o(), s("input", {
          key: 0,
          "onUpdate:modelValue": n[0] || (n[0] = (l) => N.value = l),
          type: "search",
          class: "ks-input ks-all-search",
          "aria-label": "Search settings",
          placeholder: "Search settings"
        }, null, 512)), [
          [de, N.value]
        ]) : _("", !0),
        (o(!0), s(L, null, J(d.value, (l) => (o(), s("section", {
          key: l.name,
          class: "ks-group"
        }, [
          p.value ? _("", !0) : (o(), s("div", xe, [
            m("h2", Me, b(l.name), 1),
            m("span", Se, b(l.items.length), 1)
          ])),
          (o(), S(D(h.all ? "table" : "div"), {
            class: C(["ks-list", { "ks-all-table": h.all }])
          }, {
            default: U(() => [
              h.all ? (o(), s("thead", Ae, [...n[1] || (n[1] = [
                m("tr", null, [
                  m("th", { scope: "col" }, "Owner"),
                  m("th", { scope: "col" }, "Setting"),
                  m("th", { scope: "col" }, "Value")
                ], -1)
              ])])) : _("", !0),
              (o(), S(D(h.all ? "tbody" : "div"), null, {
                default: U(() => [
                  (o(!0), s(L, null, J(l.items, (t) => (o(), S(D(h.all ? "tr" : "div"), {
                    key: a(t),
                    class: C(["ks-row", { "ks-row-invalid": t.error || c.value[a(t)], "ks-row-wc": t.ui }])
                  }, {
                    default: U(() => [
                      h.all ? (o(), s("td", Ce, b(i(t)), 1)) : _("", !0),
                      (o(), S(D(h.all ? "td" : "div"), { class: "ks-row-main" }, {
                        default: U(() => [
                          m("div", Ne, [
                            m("span", je, b(M(t)), 1),
                            m("code", Le, b(t.key), 1),
                            t.is_secret && t.has_value ? (o(), s("span", Oe, "set")) : !t.is_default && !t.is_secret ? (o(), s("span", Ee, "overridden")) : _("", !0)
                          ]),
                          t.error ? (o(), s("p", Ie, b(t.error), 1)) : _("", !0),
                          t.description ? (o(), s("p", Ue, b(t.description), 1)) : _("", !0),
                          P(t.schema) ? (o(), s("p", Ve, b(P(t.schema)), 1)) : _("", !0),
                          !t.is_default && t.updated_by ? (o(), s("p", De, [
                            W("by " + b(t.updated_by), 1),
                            t.updated_at ? (o(), s("span", Re, " · " + b(j(ge)(t.updated_at)), 1)) : _("", !0)
                          ])) : _("", !0)
                        ]),
                        _: 2
                      }, 1024)),
                      t.ui ? (o(), S(D(h.all ? "td" : "div"), {
                        key: 1,
                        class: "ks-wc-slot"
                      }, {
                        default: U(() => [
                          (o(), S(G, {
                            key: a(t),
                            tag: t.ui,
                            config: E(t),
                            onChange: re
                          }, null, 8, ["tag", "config"]))
                        ]),
                        _: 2
                      }, 1024)) : (o(), S(D(h.all ? "td" : "div"), {
                        key: 2,
                        class: "ks-control"
                      }, {
                        default: U(() => [
                          m("div", Te, [
                            t.editable === !1 ? (o(), s("span", qe, b(t.value), 1)) : (o(), s(L, { key: 1 }, [
                              t.control ? (o(), S(G, {
                                key: 0,
                                tag: t.control.tag,
                                attrs: { ...t.control.props, value: z(t, u.value[a(t)]) },
                                onSelect: (r) => ne(t, r)
                              }, null, 8, ["tag", "attrs", "onSelect"])) : t.value_type === "bool" ? (o(), S(j(ye), {
                                key: 1,
                                "model-value": !!u.value[a(t)],
                                "aria-label": M(t),
                                "onUpdate:modelValue": (r) => u.value[a(t)] = r
                              }, null, 8, ["model-value", "aria-label", "onUpdate:modelValue"])) : O(t) ? (o(), S(j(ve), {
                                key: 2,
                                class: C(["ks-select", { "ks-select-invalid": c.value[a(t)] }]),
                                "model-value": u.value[a(t)],
                                options: O(t),
                                "onUpdate:modelValue": (r) => {
                                  u.value[a(t)] = r, I(t);
                                }
                              }, null, 8, ["class", "model-value", "options", "onUpdate:modelValue"])) : t.value_type === "int" ? (o(), s("input", {
                                key: 3,
                                type: "number",
                                class: C(["ks-input", { "ks-input-invalid": c.value[a(t)] }]),
                                min: t.schema?.minimum,
                                max: t.schema?.maximum,
                                value: u.value[a(t)],
                                onInput: (r) => {
                                  u.value[a(t)] = Number(r.target.value), I(t);
                                }
                              }, null, 42, Be)) : t.value_type === "json" ? (o(), s("textarea", {
                                key: 4,
                                rows: "4",
                                class: C(["ks-input", { "ks-input-invalid": c.value[a(t)] }]),
                                value: u.value[a(t)],
                                onInput: (r) => {
                                  u.value[a(t)] = r.target.value, I(t);
                                }
                              }, null, 42, Pe)) : t.value_type === "secret" ? (o(), s("input", {
                                key: 5,
                                type: "password",
                                autocomplete: "off",
                                class: C(["ks-input", { "ks-input-invalid": c.value[a(t)] }]),
                                placeholder: t.has_value ? "•••••••• set — type to replace" : "Not set",
                                value: u.value[a(t)],
                                onInput: (r) => {
                                  u.value[a(t)] = r.target.value, I(t);
                                }
                              }, null, 42, Fe)) : (o(), s("input", {
                                key: 6,
                                type: "text",
                                class: C(["ks-input", { "ks-input-invalid": c.value[a(t)] }]),
                                minlength: t.schema?.minLength,
                                maxlength: t.schema?.maxLength,
                                value: u.value[a(t)],
                                onInput: (r) => {
                                  u.value[a(t)] = r.target.value, I(t);
                                }
                              }, null, 42, He)),
                              x.value === a(t) ? (o(), s("span", Je, [...n[2] || (n[2] = [
                                m("span", { class: "ks-saved-tick" }, "✓", -1),
                                W(" Saved", -1)
                              ])])) : _("", !0),
                              R(j(X), {
                                type: "button",
                                label: $.value === a(t) ? "Saving…" : "Save",
                                loading: $.value === a(t),
                                disabled: $.value === a(t) || !!c.value[a(t)] || t.value_type !== "bool" && !ae(t),
                                onClick: (r) => oe(t)
                              }, null, 8, ["label", "loading", "disabled", "onClick"]),
                              t.is_default ? _("", !0) : (o(), S(j(X), {
                                key: 8,
                                type: "button",
                                severity: "secondary",
                                text: "",
                                rounded: "",
                                disabled: $.value === a(t),
                                title: "Reset to default",
                                "aria-label": "Reset to default",
                                onClick: (r) => le(t)
                              }, {
                                icon: U(() => [
                                  R(j(F), {
                                    icon: "tabler:rotate",
                                    "aria-hidden": "true"
                                  })
                                ]),
                                _: 1
                              }, 8, ["disabled", "onClick"]))
                            ], 64))
                          ]),
                          c.value[a(t)] ? (o(), s("p", Ke, b(c.value[a(t)]), 1)) : _("", !0)
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
      ], 64)) : (o(), s("div", we, "No settings declared."))
    ]));
  }
}), Ge = { class: "ks" }, Ye = {
  key: 0,
  class: "ks-err"
}, ze = {
  key: 1,
  class: "ks-loading"
}, Qe = {
  key: 2,
  class: "ks-empty"
}, We = {
  key: 3,
  class: "ks-shell"
}, Xe = {
  class: "ks-nav",
  "aria-label": "Settings sections"
}, Ze = {
  key: 0,
  class: "ks-nav-group"
}, et = ["onClick"], tt = { class: "ks-nav-label" }, nt = { class: "ks-pane-head" }, at = { class: "ks-pane-ico" }, ot = { class: "ks-pane-head-text" }, lt = { key: 0 }, rt = {
  key: 2,
  class: "ks-empty"
}, st = /* @__PURE__ */ ee({
  __name: "settings",
  setup(h) {
    const f = he(), k = q(() => {
      const i = f.value?.route;
      return typeof i == "string" && i.length ? i : "";
    }), g = A([]), w = A(!0), $ = A(""), x = A(""), u = A(!1), c = q(() => {
      const i = [];
      for (const d of g.value) {
        const p = d.group || "", O = i[i.length - 1];
        O && O.group === p ? O.items.push(d) : i.push({ group: p, items: [d] });
      }
      return i;
    }), a = q(() => g.value.find((i) => i.key === x.value) || null);
    function V(i) {
      u.value = !1, x.value = i;
    }
    function M() {
      u.value = !0;
    }
    async function N() {
      w.value = !0, $.value = "";
      try {
        const { data: i } = await H.get("/api/v1/settings/blocks");
        if (!i?.success) throw new Error(i?.error || "failed to load settings blocks");
        g.value = Array.isArray(i.blocks) ? i.blocks : [];
        const d = k.value && g.value.some((p) => p.key === k.value) ? k.value : g.value.some((p) => p.key === x.value) ? x.value : g.value[0]?.key || "";
        x.value = d, k.value === "all-settings" && !g.value.some((p) => p.key === k.value) && (u.value = !0);
      } catch (i) {
        $.value = i instanceof Error ? i.message : String(i);
      } finally {
        w.value = !1;
      }
    }
    return fe(N), (i, d) => (o(), s("div", Ge, [
      $.value ? (o(), s("div", Ye, b($.value), 1)) : _("", !0),
      w.value ? (o(), s("div", ze, "Loading…")) : g.value.length ? (o(), s("div", We, [
        m("nav", Xe, [
          m("button", {
            type: "button",
            class: C(["ks-nav-item", { "ks-nav-item-active": u.value }]),
            onClick: M
          }, [
            R(j(F), {
              class: "ks-nav-ico",
              icon: "tabler:table",
              "aria-hidden": "true"
            }),
            d[0] || (d[0] = m("span", { class: "ks-nav-label" }, "All settings", -1))
          ], 2),
          (o(!0), s(L, null, J(c.value, (p, O) => (o(), s("div", {
            key: O,
            class: "ks-nav-section"
          }, [
            p.group ? (o(), s("div", Ze, b(p.group), 1)) : _("", !0),
            (o(!0), s(L, null, J(p.items, (E) => (o(), s("button", {
              key: E.key,
              type: "button",
              class: C(["ks-nav-item", { "ks-nav-item-active": !u.value && E.key === x.value }]),
              onClick: (B) => V(E.key)
            }, [
              R(j(F), {
                class: "ks-nav-ico",
                icon: E.icon || "tabler:adjustments",
                "aria-hidden": "true"
              }, null, 8, ["icon"]),
              m("span", tt, b(E.title), 1)
            ], 10, et))), 128))
          ]))), 128))
        ]),
        m("section", {
          class: C(["ks-pane", { "ks-pane-flush": !u.value && a.value && a.value.component_tag }])
        }, [
          u.value ? (o(), s(L, { key: 0 }, [
            d[1] || (d[1] = m("header", { class: "ks-pane-head" }, [
              m("h1", null, "All settings")
            ], -1)),
            R(Z, {
              key: "all-settings-table",
              namespace: "",
              all: "",
              blocks: g.value
            }, null, 8, ["blocks"])
          ], 64)) : a.value ? (o(), s(L, { key: 1 }, [
            a.value.component_tag ? (o(), S(G, {
              key: a.value.key,
              tag: a.value.component_tag,
              config: a.value.config
            }, null, 8, ["tag", "config"])) : a.value.namespace ? (o(), s(L, { key: 1 }, [
              m("header", nt, [
                m("span", at, [
                  R(j(F), {
                    icon: a.value.icon || "tabler:adjustments",
                    "aria-hidden": "true"
                  }, null, 8, ["icon"])
                ]),
                m("div", ot, [
                  m("h1", null, b(a.value.title), 1),
                  typeof a.value.config?.description == "string" ? (o(), s("p", lt, b(a.value.config.description), 1)) : _("", !0)
                ])
              ]),
              (o(), S(Z, {
                key: a.value.key,
                namespace: a.value.namespace
              }, null, 8, ["namespace"]))
            ], 64)) : (o(), s("div", rt, "This block has no editor."))
          ], 64)) : _("", !0)
        ], 2)
      ])) : (o(), s("div", Qe, "No settings declared."))
    ]));
  }
}), ht = {
  rootComponent: st,
  plugins: [ie]
};
export {
  ht as mountConfig
};
//# sourceMappingURL=lazy-mount-D6foRIAw.js.map

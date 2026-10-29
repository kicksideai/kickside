import { a as z, W as H, s as Y } from "./styles-DUWI6o6L.js";
import { s as q, P as Q } from "./index-GXCRJfhs.js";
import { defineComponent as X, computed as c, ref as _, onMounted as Z, openBlock as n, createElementBlock as s, createElementVNode as m, createVNode as f, toDisplayString as i, createCommentVNode as p, unref as y, createTextVNode as O, Fragment as S, renderList as $, createBlock as E, withCtx as ee } from "vue";
import { Icon as N } from "@iconify/vue";
import { W as te, s as ae, a as ne } from "./WcMount-BnlU48df.js";
import { api as V, define as oe } from "@wippy-fe/proxy";
import { _ as se } from "./SettingsToolbar.vue_vue_type_script_setup_true_lang-BAMz974F.js";
const le = { class: "ap" }, re = { class: "ap-body" }, ie = {
  key: 0,
  class: "ap-msg ap-err"
}, ue = {
  key: 1,
  class: "ap-loading"
}, ce = {
  key: 2,
  class: "ap-cards"
}, pe = { class: "ap-card" }, de = { class: "ap-h" }, ve = {
  key: 0,
  class: "ap-sub"
}, me = {
  key: 1,
  class: "ks-empty"
}, ye = {
  key: 0,
  class: "pv-group-title"
}, ge = { class: "pv-field-head" }, _e = { class: "ap-blabel" }, fe = {
  key: 0,
  class: "ks-tag kx-tag-caps ks-tag-on"
}, he = {
  key: 1,
  class: "ks-tag kx-tag-caps ks-tag-on"
}, ke = { key: 0 }, be = {
  key: 2,
  class: "ap-hint"
}, xe = {
  key: 1,
  class: "ap-toggle-row pv-toggle"
}, Ce = { class: "ap-toggle-text" }, Se = {
  key: 0,
  class: "ap-toggle-desc"
}, we = ["min", "max", "value", "onInput"], Ee = ["placeholder", "value", "onInput"], Ne = ["value", "onInput"], Ve = ["minlength", "maxlength", "value", "onInput"], Ie = {
  key: 5,
  class: "ap-hint"
}, B = "General", Ue = /* @__PURE__ */ X({
  __name: "provider",
  setup(L) {
    const R = z(), h = c(() => R.value?.config || null), I = c(() => h.value?.namespace || ""), D = c(() => h.value?.title || "Provider"), F = c(() => h.value?.icon || "tabler:plug-connected"), U = c(() => h.value?.help || ""), k = _(!0), d = _(!1), u = _(""), v = _([]), l = _({});
    function T(t) {
      const a = t.split(/[._\-\s]+/).filter(Boolean);
      return a.length ? a.map((r, e) => e === 0 ? r.charAt(0).toUpperCase() + r.slice(1) : r).join(" ") : t;
    }
    const g = (t) => t.title && t.title.length ? t.title : T(t.key), A = (t) => Array.isArray(t.schema?.enum) ? t.schema.enum : null, w = c(() => {
      const t = /* @__PURE__ */ new Map();
      for (const e of v.value) {
        const o = e.category && e.category.length ? e.category : B;
        t.has(o) || t.set(o, []), t.get(o).push(e);
      }
      const a = (e) => typeof e.order == "number" ? e.order : 100, r = [];
      for (const [e, o] of t)
        o.sort((x, C) => a(x) - a(C) || g(x).localeCompare(g(C))), r.push({ name: e, items: o });
      return r.sort((e, o) => {
        const x = Math.min(...e.items.map(a)), C = Math.min(...o.items.map(a));
        return x - C || e.name.localeCompare(o.name);
      }), r;
    }), W = c(() => w.value.length === 1 && w.value[0].name === B);
    function P(t, a) {
      l.value[t.key] = t.value_type === "json" ? JSON.stringify(a, null, 2) : a;
    }
    function j(t) {
      const a = l.value[t.key];
      return t.value_type === "secret" ? String(a ?? "").length > 0 : t.value_type === "json" ? a !== JSON.stringify(t.value, null, 2) : a !== t.value;
    }
    const G = c(() => v.value.some(j));
    function M(t, a) {
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
    async function b() {
      if (!I.value) {
        k.value = !1;
        return;
      }
      k.value = !0, u.value = "";
      try {
        const { data: t } = await V.get(`/api/v1/settings?namespace=${encodeURIComponent(I.value)}`);
        if (!t?.success) throw new Error(t?.error || "failed to load settings");
        v.value = Array.isArray(t.settings) ? t.settings : [], l.value = {};
        for (const a of v.value) P(a, a.value_type === "secret" ? "" : a.value);
      } catch (t) {
        u.value = t instanceof Error ? t.message : String(t);
      } finally {
        k.value = !1;
      }
    }
    async function J() {
      d.value = !0, u.value = "";
      try {
        for (const t of v.value) {
          if (!j(t)) continue;
          const a = M(t, l.value[t.key]), { data: r } = await V.put("/api/v1/settings", { namespace: t.namespace, key: t.key, value: a });
          if (!r?.success) throw new Error(r?.error || `could not save ${g(t)}`);
        }
        await b();
      } catch (t) {
        u.value = t instanceof Error ? t.message : String(t);
      } finally {
        d.value = !1;
      }
    }
    async function K(t) {
      d.value = !0, u.value = "";
      try {
        const { data: a } = await V.put("/api/v1/settings", { namespace: t.namespace, key: t.key, value: null });
        if (!a?.success) throw new Error(a?.error || "reset failed");
        await b();
      } catch (a) {
        u.value = a instanceof Error ? a.message : String(a);
      } finally {
        d.value = !1;
      }
    }
    return Z(b), (t, a) => (n(), s("div", le, [
      m("div", re, [
        f(se, {
          dirty: G.value,
          saving: d.value,
          onDiscard: b,
          onSave: J
        }, null, 8, ["dirty", "saving"]),
        u.value ? (n(), s("div", ie, i(u.value), 1)) : p("", !0),
        k.value ? (n(), s("div", ue, [
          f(y(N), {
            icon: "tabler:loader-2",
            class: "spin"
          }),
          a[0] || (a[0] = O(" Loading…", -1))
        ])) : (n(), s("div", ce, [
          m("section", pe, [
            m("header", de, [
              f(y(N), {
                icon: F.value,
                "aria-hidden": "true"
              }, null, 8, ["icon"]),
              O(" " + i(D.value), 1)
            ]),
            U.value ? (n(), s("p", ve, i(U.value), 1)) : p("", !0),
            v.value.length ? (n(!0), s(S, { key: 2 }, $(w.value, (r) => (n(), s("div", {
              key: r.name,
              class: "pv-group"
            }, [
              W.value ? p("", !0) : (n(), s("h3", ye, i(r.name), 1)),
              (n(!0), s(S, null, $(r.items, (e) => (n(), s("div", {
                key: e.key,
                class: "pv-field"
              }, [
                m("div", ge, [
                  m("label", _e, i(g(e)), 1),
                  e.is_secret && e.has_value ? (n(), s("span", fe, "set")) : !e.is_default && !e.is_secret ? (n(), s("span", he, "overridden")) : p("", !0),
                  e.is_default ? p("", !0) : (n(), E(y(q), {
                    key: 2,
                    class: "pv-reset",
                    type: "button",
                    severity: "secondary",
                    text: "",
                    rounded: "",
                    title: "Reset to default",
                    "aria-label": "Reset to default",
                    disabled: d.value,
                    onClick: (o) => K(e)
                  }, {
                    icon: ee(() => [
                      f(y(N), {
                        icon: "tabler:rotate",
                        "aria-hidden": "true"
                      })
                    ]),
                    _: 1
                  }, 8, ["disabled", "onClick"]))
                ]),
                e.control ? (n(), s(S, { key: 0 }, [
                  e.editable === !1 ? (n(), s("span", ke, i(e.value), 1)) : (n(), E(te, {
                    key: 1,
                    tag: e.control.tag,
                    attrs: { ...e.control.props, value: M(e, l.value[e.key]) },
                    onSelect: (o) => P(e, o)
                  }, null, 8, ["tag", "attrs", "onSelect"])),
                  e.description ? (n(), s("p", be, i(e.description), 1)) : p("", !0)
                ], 64)) : e.value_type === "bool" ? (n(), s("div", xe, [
                  m("div", Ce, [
                    e.description ? (n(), s("span", Se, i(e.description), 1)) : p("", !0)
                  ]),
                  f(y(ae), {
                    "model-value": !!l.value[e.key],
                    "aria-label": g(e),
                    "onUpdate:modelValue": (o) => l.value[e.key] = o
                  }, null, 8, ["model-value", "aria-label", "onUpdate:modelValue"])
                ])) : (n(), s(S, { key: 2 }, [
                  A(e) ? (n(), E(y(ne), {
                    key: 0,
                    class: "ap-select",
                    "model-value": l.value[e.key],
                    options: A(e),
                    "onUpdate:modelValue": (o) => l.value[e.key] = o
                  }, null, 8, ["model-value", "options", "onUpdate:modelValue"])) : e.value_type === "int" ? (n(), s("input", {
                    key: 1,
                    class: "ap-binput",
                    type: "number",
                    min: e.schema?.minimum,
                    max: e.schema?.maximum,
                    value: l.value[e.key],
                    onInput: (o) => l.value[e.key] = Number(o.target.value)
                  }, null, 40, we)) : e.value_type === "secret" ? (n(), s("input", {
                    key: 2,
                    class: "ap-binput",
                    type: "password",
                    autocomplete: "off",
                    placeholder: e.has_value ? "•••••••• set — type to replace" : "Not set",
                    value: l.value[e.key],
                    onInput: (o) => l.value[e.key] = o.target.value
                  }, null, 40, Ee)) : e.value_type === "json" ? (n(), s("textarea", {
                    key: 3,
                    class: "ap-binput pv-textarea",
                    rows: "4",
                    value: l.value[e.key],
                    onInput: (o) => l.value[e.key] = o.target.value
                  }, null, 40, Ne)) : (n(), s("input", {
                    key: 4,
                    class: "ap-binput",
                    type: "text",
                    minlength: e.schema?.minLength,
                    maxlength: e.schema?.maxLength,
                    value: l.value[e.key],
                    onInput: (o) => l.value[e.key] = o.target.value
                  }, null, 40, Ve)),
                  e.description ? (n(), s("p", Ie, i(e.description), 1)) : p("", !0)
                ], 64))
              ]))), 128))
            ]))), 128)) : (n(), s("div", me, "No settings declared."))
          ])
        ]))
      ])
    ]));
  }
}), Ae = { type: "object", properties: { config: { type: "object" } } };
class Pe extends H {
  static get wippyConfig() {
    return {
      propsSchema: Ae,
      hostCssKeys: ["themeConfigUrl", "primeVueCssUrl"],
      inlineCss: Y
    };
  }
  static get vueConfig() {
    return { rootComponent: Ue, plugins: [Q] };
  }
}
oe(import.meta.url, Pe);
//# sourceMappingURL=provider.js.map

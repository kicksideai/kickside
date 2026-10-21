import { a as Y, W as q, s as Q } from "./styles-BEaF_GAv.js";
import { b as N, s as X, a as Z, P as ee } from "./index-8Dae-yYb.js";
import { defineComponent as te, computed as d, ref as _, onMounted as ae, openBlock as n, createElementBlock as o, createElementVNode as v, createCommentVNode as u, createVNode as g, unref as c, withCtx as M, createBlock as V, toDisplayString as m, createTextVNode as B, Fragment as I, renderList as L } from "vue";
import { Icon as S } from "@iconify/vue";
import { api as U, define as ne } from "@wippy-fe/proxy";
const le = { class: "ap" }, oe = { class: "ap-body" }, se = { class: "ap-bar" }, re = {
  key: 0,
  class: "ap-dirty"
}, ie = {
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
}, ge = { class: "pv-field-head" }, he = { class: "ap-blabel" }, _e = {
  key: 0,
  class: "ks-tag kx-tag-caps ks-tag-on"
}, fe = {
  key: 1,
  class: "ks-tag kx-tag-caps ks-tag-on"
}, ke = {
  key: 0,
  class: "ap-toggle-row pv-toggle"
}, be = { class: "ap-toggle-text" }, Ce = {
  key: 0,
  class: "ap-toggle-desc"
}, xe = ["min", "max", "value", "onInput"], Se = ["placeholder", "value", "onInput"], we = ["value", "onInput"], Ee = ["minlength", "maxlength", "value", "onInput"], Ne = {
  key: 5,
  class: "ap-hint"
}, R = "General", Ve = /* @__PURE__ */ te({
  __name: "provider",
  setup($) {
    const D = Y(), f = d(() => D.value?.config || null), A = d(() => f.value?.namespace || ""), F = d(() => f.value?.title || "Provider"), T = d(() => f.value?.icon || "tabler:plug-connected"), P = d(() => f.value?.help || ""), k = _(!0), i = _(!1), p = _(""), y = _([]), s = _({});
    function G(e) {
      const a = e.split(/[._\-\s]+/).filter(Boolean);
      return a.length ? a.map((r, t) => t === 0 ? r.charAt(0).toUpperCase() + r.slice(1) : r).join(" ") : e;
    }
    const h = (e) => e.title && e.title.length ? e.title : G(e.key), j = (e) => Array.isArray(e.schema?.enum) ? e.schema.enum : null, w = d(() => {
      const e = /* @__PURE__ */ new Map();
      for (const t of y.value) {
        const l = t.category && t.category.length ? t.category : R;
        e.has(l) || e.set(l, []), e.get(l).push(t);
      }
      const a = (t) => typeof t.order == "number" ? t.order : 100, r = [];
      for (const [t, l] of e)
        l.sort((C, x) => a(C) - a(x) || h(C).localeCompare(h(x))), r.push({ name: t, items: l });
      return r.sort((t, l) => {
        const C = Math.min(...t.items.map(a)), x = Math.min(...l.items.map(a));
        return C - x || t.name.localeCompare(l.name);
      }), r;
    }), J = d(() => w.value.length === 1 && w.value[0].name === R);
    function K(e) {
      if (e.value_type === "secret") {
        s.value[e.key] = "";
        return;
      }
      if (e.value_type === "json") {
        s.value[e.key] = JSON.stringify(e.value, null, 2);
        return;
      }
      s.value[e.key] = e.value;
    }
    function O(e) {
      const a = s.value[e.key];
      return e.value_type === "secret" ? String(a ?? "").length > 0 : e.value_type === "json" ? a !== JSON.stringify(e.value, null, 2) : a !== e.value;
    }
    const E = d(() => y.value.some(O));
    function W(e, a) {
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
    async function b() {
      if (!A.value) {
        k.value = !1;
        return;
      }
      k.value = !0, p.value = "";
      try {
        const { data: e } = await U.get(`/api/v1/settings?namespace=${encodeURIComponent(A.value)}`);
        if (!e?.success) throw new Error(e?.error || "failed to load settings");
        y.value = Array.isArray(e.settings) ? e.settings : [], s.value = {};
        for (const a of y.value) K(a);
      } catch (e) {
        p.value = e instanceof Error ? e.message : String(e);
      } finally {
        k.value = !1;
      }
    }
    async function z() {
      i.value = !0, p.value = "";
      try {
        for (const e of y.value) {
          if (!O(e)) continue;
          const a = W(e, s.value[e.key]), { data: r } = await U.put("/api/v1/settings", { namespace: e.namespace, key: e.key, value: a });
          if (!r?.success) throw new Error(r?.error || `could not save ${h(e)}`);
        }
        await b();
      } catch (e) {
        p.value = e instanceof Error ? e.message : String(e);
      } finally {
        i.value = !1;
      }
    }
    async function H(e) {
      i.value = !0, p.value = "";
      try {
        const { data: a } = await U.put("/api/v1/settings", { namespace: e.namespace, key: e.key, value: null });
        if (!a?.success) throw new Error(a?.error || "reset failed");
        await b();
      } catch (a) {
        p.value = a instanceof Error ? a.message : String(a);
      } finally {
        i.value = !1;
      }
    }
    return ae(b), (e, a) => (n(), o("div", le, [
      v("div", oe, [
        v("header", se, [
          E.value ? (n(), o("span", re, "Unsaved changes")) : u("", !0),
          g(c(N), {
            type: "button",
            label: "Discard",
            severity: "secondary",
            outlined: "",
            disabled: !E.value || i.value,
            onClick: b
          }, null, 8, ["disabled"]),
          g(c(N), {
            type: "button",
            label: i.value ? "Saving…" : "Save",
            loading: i.value,
            disabled: !E.value || i.value,
            onClick: z
          }, {
            icon: M(() => [
              i.value ? u("", !0) : (n(), V(c(S), {
                key: 0,
                icon: "tabler:device-floppy",
                "aria-hidden": "true"
              }))
            ]),
            _: 1
          }, 8, ["label", "loading", "disabled"])
        ]),
        p.value ? (n(), o("div", ie, m(p.value), 1)) : u("", !0),
        k.value ? (n(), o("div", ue, [
          g(c(S), {
            icon: "tabler:loader-2",
            class: "spin"
          }),
          a[0] || (a[0] = B(" Loading…", -1))
        ])) : (n(), o("div", ce, [
          v("section", pe, [
            v("header", de, [
              g(c(S), {
                icon: T.value,
                "aria-hidden": "true"
              }, null, 8, ["icon"]),
              B(" " + m(F.value), 1)
            ]),
            P.value ? (n(), o("p", ve, m(P.value), 1)) : u("", !0),
            y.value.length ? (n(!0), o(I, { key: 2 }, L(w.value, (r) => (n(), o("div", {
              key: r.name,
              class: "pv-group"
            }, [
              J.value ? u("", !0) : (n(), o("h3", ye, m(r.name), 1)),
              (n(!0), o(I, null, L(r.items, (t) => (n(), o("div", {
                key: t.key,
                class: "pv-field"
              }, [
                v("div", ge, [
                  v("label", he, m(h(t)), 1),
                  t.is_secret && t.has_value ? (n(), o("span", _e, "set")) : !t.is_default && !t.is_secret ? (n(), o("span", fe, "overridden")) : u("", !0),
                  t.is_default ? u("", !0) : (n(), V(c(N), {
                    key: 2,
                    class: "pv-reset",
                    type: "button",
                    severity: "secondary",
                    text: "",
                    rounded: "",
                    title: "Reset to default",
                    "aria-label": "Reset to default",
                    disabled: i.value,
                    onClick: (l) => H(t)
                  }, {
                    icon: M(() => [
                      g(c(S), {
                        icon: "tabler:rotate",
                        "aria-hidden": "true"
                      })
                    ]),
                    _: 1
                  }, 8, ["disabled", "onClick"]))
                ]),
                t.value_type === "bool" ? (n(), o("div", ke, [
                  v("div", be, [
                    t.description ? (n(), o("span", Ce, m(t.description), 1)) : u("", !0)
                  ]),
                  g(c(X), {
                    "model-value": !!s.value[t.key],
                    "aria-label": h(t),
                    "onUpdate:modelValue": (l) => s.value[t.key] = l
                  }, null, 8, ["model-value", "aria-label", "onUpdate:modelValue"])
                ])) : (n(), o(I, { key: 1 }, [
                  j(t) ? (n(), V(c(Z), {
                    key: 0,
                    class: "ap-select",
                    "model-value": s.value[t.key],
                    options: j(t),
                    "onUpdate:modelValue": (l) => s.value[t.key] = l
                  }, null, 8, ["model-value", "options", "onUpdate:modelValue"])) : t.value_type === "int" ? (n(), o("input", {
                    key: 1,
                    class: "ap-binput",
                    type: "number",
                    min: t.schema?.minimum,
                    max: t.schema?.maximum,
                    value: s.value[t.key],
                    onInput: (l) => s.value[t.key] = Number(l.target.value)
                  }, null, 40, xe)) : t.value_type === "secret" ? (n(), o("input", {
                    key: 2,
                    class: "ap-binput",
                    type: "password",
                    autocomplete: "off",
                    placeholder: t.has_value ? "•••••••• set — type to replace" : "Not set",
                    value: s.value[t.key],
                    onInput: (l) => s.value[t.key] = l.target.value
                  }, null, 40, Se)) : t.value_type === "json" ? (n(), o("textarea", {
                    key: 3,
                    class: "ap-binput pv-textarea",
                    rows: "4",
                    value: s.value[t.key],
                    onInput: (l) => s.value[t.key] = l.target.value
                  }, null, 40, we)) : (n(), o("input", {
                    key: 4,
                    class: "ap-binput",
                    type: "text",
                    minlength: t.schema?.minLength,
                    maxlength: t.schema?.maxLength,
                    value: s.value[t.key],
                    onInput: (l) => s.value[t.key] = l.target.value
                  }, null, 40, Ee)),
                  t.description ? (n(), o("p", Ne, m(t.description), 1)) : u("", !0)
                ], 64))
              ]))), 128))
            ]))), 128)) : (n(), o("div", me, "No settings declared."))
          ])
        ]))
      ])
    ]));
  }
}), Ie = { type: "object", properties: { config: { type: "object" } } };
class Ue extends q {
  static get wippyConfig() {
    return {
      propsSchema: Ie,
      hostCssKeys: ["themeConfigUrl", "primeVueCssUrl"],
      inlineCss: Q
    };
  }
  static get vueConfig() {
    return { rootComponent: Ve, plugins: [ee] };
  }
}
ne(import.meta.url, Ue);
//# sourceMappingURL=provider.js.map

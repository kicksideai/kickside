import { a as Y, W as q, s as Q } from "./styles-BCHHd4iE.js";
import { b as I, W as X, s as Z, a as ee, P as te } from "./WcMount-CXaiZg2f.js";
import { defineComponent as ae, computed as v, ref as _, onMounted as ne, openBlock as n, createElementBlock as o, createElementVNode as y, createCommentVNode as u, createVNode as g, unref as c, withCtx as L, createBlock as S, toDisplayString as p, createTextVNode as R, Fragment as w, renderList as $ } from "vue";
import { Icon as E } from "@iconify/vue";
import { api as U, define as oe } from "@wippy-fe/proxy";
const le = { class: "ap" }, se = { class: "ap-body" }, re = { class: "ap-bar" }, ie = {
  key: 0,
  class: "ap-dirty"
}, ue = {
  key: 0,
  class: "ap-msg ap-err"
}, ce = {
  key: 1,
  class: "ap-loading"
}, pe = {
  key: 2,
  class: "ap-cards"
}, de = { class: "ap-card" }, ve = { class: "ap-h" }, ye = {
  key: 0,
  class: "ap-sub"
}, me = {
  key: 1,
  class: "ks-empty"
}, ge = {
  key: 0,
  class: "pv-group-title"
}, he = { class: "pv-field-head" }, _e = { class: "ap-blabel" }, fe = {
  key: 0,
  class: "ks-tag kx-tag-caps ks-tag-on"
}, ke = {
  key: 1,
  class: "ks-tag kx-tag-caps ks-tag-on"
}, be = { key: 0 }, Ce = {
  key: 2,
  class: "ap-hint"
}, xe = {
  key: 1,
  class: "ap-toggle-row pv-toggle"
}, Se = { class: "ap-toggle-text" }, we = {
  key: 0,
  class: "ap-toggle-desc"
}, Ee = ["min", "max", "value", "onInput"], Ne = ["placeholder", "value", "onInput"], Ve = ["value", "onInput"], Ie = ["minlength", "maxlength", "value", "onInput"], Ue = {
  key: 5,
  class: "ap-hint"
}, D = "General", Ae = /* @__PURE__ */ ae({
  __name: "provider",
  setup(F) {
    const T = Y(), f = v(() => T.value?.config || null), A = v(() => f.value?.namespace || ""), W = v(() => f.value?.title || "Provider"), G = v(() => f.value?.icon || "tabler:plug-connected"), P = v(() => f.value?.help || ""), k = _(!0), i = _(!1), d = _(""), m = _([]), s = _({});
    function J(t) {
      const a = t.split(/[._\-\s]+/).filter(Boolean);
      return a.length ? a.map((r, e) => e === 0 ? r.charAt(0).toUpperCase() + r.slice(1) : r).join(" ") : t;
    }
    const h = (t) => t.title && t.title.length ? t.title : J(t.key), j = (t) => Array.isArray(t.schema?.enum) ? t.schema.enum : null, N = v(() => {
      const t = /* @__PURE__ */ new Map();
      for (const e of m.value) {
        const l = e.category && e.category.length ? e.category : D;
        t.has(l) || t.set(l, []), t.get(l).push(e);
      }
      const a = (e) => typeof e.order == "number" ? e.order : 100, r = [];
      for (const [e, l] of t)
        l.sort((C, x) => a(C) - a(x) || h(C).localeCompare(h(x))), r.push({ name: e, items: l });
      return r.sort((e, l) => {
        const C = Math.min(...e.items.map(a)), x = Math.min(...l.items.map(a));
        return C - x || e.name.localeCompare(l.name);
      }), r;
    }), K = v(() => N.value.length === 1 && N.value[0].name === D);
    function M(t, a) {
      s.value[t.key] = t.value_type === "json" ? JSON.stringify(a, null, 2) : a;
    }
    function O(t) {
      const a = s.value[t.key];
      return t.value_type === "secret" ? String(a ?? "").length > 0 : t.value_type === "json" ? a !== JSON.stringify(t.value, null, 2) : a !== t.value;
    }
    const V = v(() => m.value.some(O));
    function B(t, a) {
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
      if (!A.value) {
        k.value = !1;
        return;
      }
      k.value = !0, d.value = "";
      try {
        const { data: t } = await U.get(`/api/v1/settings?namespace=${encodeURIComponent(A.value)}`);
        if (!t?.success) throw new Error(t?.error || "failed to load settings");
        m.value = Array.isArray(t.settings) ? t.settings : [], s.value = {};
        for (const a of m.value) M(a, a.value_type === "secret" ? "" : a.value);
      } catch (t) {
        d.value = t instanceof Error ? t.message : String(t);
      } finally {
        k.value = !1;
      }
    }
    async function z() {
      i.value = !0, d.value = "";
      try {
        for (const t of m.value) {
          if (!O(t)) continue;
          const a = B(t, s.value[t.key]), { data: r } = await U.put("/api/v1/settings", { namespace: t.namespace, key: t.key, value: a });
          if (!r?.success) throw new Error(r?.error || `could not save ${h(t)}`);
        }
        await b();
      } catch (t) {
        d.value = t instanceof Error ? t.message : String(t);
      } finally {
        i.value = !1;
      }
    }
    async function H(t) {
      i.value = !0, d.value = "";
      try {
        const { data: a } = await U.put("/api/v1/settings", { namespace: t.namespace, key: t.key, value: null });
        if (!a?.success) throw new Error(a?.error || "reset failed");
        await b();
      } catch (a) {
        d.value = a instanceof Error ? a.message : String(a);
      } finally {
        i.value = !1;
      }
    }
    return ne(b), (t, a) => (n(), o("div", le, [
      y("div", se, [
        y("header", re, [
          V.value ? (n(), o("span", ie, "Unsaved changes")) : u("", !0),
          g(c(I), {
            type: "button",
            label: "Discard",
            severity: "secondary",
            outlined: "",
            disabled: !V.value || i.value,
            onClick: b
          }, null, 8, ["disabled"]),
          g(c(I), {
            type: "button",
            label: i.value ? "Saving…" : "Save",
            loading: i.value,
            disabled: !V.value || i.value,
            onClick: z
          }, {
            icon: L(() => [
              i.value ? u("", !0) : (n(), S(c(E), {
                key: 0,
                icon: "tabler:device-floppy",
                "aria-hidden": "true"
              }))
            ]),
            _: 1
          }, 8, ["label", "loading", "disabled"])
        ]),
        d.value ? (n(), o("div", ue, p(d.value), 1)) : u("", !0),
        k.value ? (n(), o("div", ce, [
          g(c(E), {
            icon: "tabler:loader-2",
            class: "spin"
          }),
          a[0] || (a[0] = R(" Loading…", -1))
        ])) : (n(), o("div", pe, [
          y("section", de, [
            y("header", ve, [
              g(c(E), {
                icon: G.value,
                "aria-hidden": "true"
              }, null, 8, ["icon"]),
              R(" " + p(W.value), 1)
            ]),
            P.value ? (n(), o("p", ye, p(P.value), 1)) : u("", !0),
            m.value.length ? (n(!0), o(w, { key: 2 }, $(N.value, (r) => (n(), o("div", {
              key: r.name,
              class: "pv-group"
            }, [
              K.value ? u("", !0) : (n(), o("h3", ge, p(r.name), 1)),
              (n(!0), o(w, null, $(r.items, (e) => (n(), o("div", {
                key: e.key,
                class: "pv-field"
              }, [
                y("div", he, [
                  y("label", _e, p(h(e)), 1),
                  e.is_secret && e.has_value ? (n(), o("span", fe, "set")) : !e.is_default && !e.is_secret ? (n(), o("span", ke, "overridden")) : u("", !0),
                  e.is_default ? u("", !0) : (n(), S(c(I), {
                    key: 2,
                    class: "pv-reset",
                    type: "button",
                    severity: "secondary",
                    text: "",
                    rounded: "",
                    title: "Reset to default",
                    "aria-label": "Reset to default",
                    disabled: i.value,
                    onClick: (l) => H(e)
                  }, {
                    icon: L(() => [
                      g(c(E), {
                        icon: "tabler:rotate",
                        "aria-hidden": "true"
                      })
                    ]),
                    _: 1
                  }, 8, ["disabled", "onClick"]))
                ]),
                e.control ? (n(), o(w, { key: 0 }, [
                  e.editable === !1 ? (n(), o("span", be, p(e.value), 1)) : (n(), S(X, {
                    key: 1,
                    tag: e.control.tag,
                    attrs: { ...e.control.props, value: B(e, s.value[e.key]) },
                    onSelect: (l) => M(e, l)
                  }, null, 8, ["tag", "attrs", "onSelect"])),
                  e.description ? (n(), o("p", Ce, p(e.description), 1)) : u("", !0)
                ], 64)) : e.value_type === "bool" ? (n(), o("div", xe, [
                  y("div", Se, [
                    e.description ? (n(), o("span", we, p(e.description), 1)) : u("", !0)
                  ]),
                  g(c(Z), {
                    "model-value": !!s.value[e.key],
                    "aria-label": h(e),
                    "onUpdate:modelValue": (l) => s.value[e.key] = l
                  }, null, 8, ["model-value", "aria-label", "onUpdate:modelValue"])
                ])) : (n(), o(w, { key: 2 }, [
                  j(e) ? (n(), S(c(ee), {
                    key: 0,
                    class: "ap-select",
                    "model-value": s.value[e.key],
                    options: j(e),
                    "onUpdate:modelValue": (l) => s.value[e.key] = l
                  }, null, 8, ["model-value", "options", "onUpdate:modelValue"])) : e.value_type === "int" ? (n(), o("input", {
                    key: 1,
                    class: "ap-binput",
                    type: "number",
                    min: e.schema?.minimum,
                    max: e.schema?.maximum,
                    value: s.value[e.key],
                    onInput: (l) => s.value[e.key] = Number(l.target.value)
                  }, null, 40, Ee)) : e.value_type === "secret" ? (n(), o("input", {
                    key: 2,
                    class: "ap-binput",
                    type: "password",
                    autocomplete: "off",
                    placeholder: e.has_value ? "•••••••• set — type to replace" : "Not set",
                    value: s.value[e.key],
                    onInput: (l) => s.value[e.key] = l.target.value
                  }, null, 40, Ne)) : e.value_type === "json" ? (n(), o("textarea", {
                    key: 3,
                    class: "ap-binput pv-textarea",
                    rows: "4",
                    value: s.value[e.key],
                    onInput: (l) => s.value[e.key] = l.target.value
                  }, null, 40, Ve)) : (n(), o("input", {
                    key: 4,
                    class: "ap-binput",
                    type: "text",
                    minlength: e.schema?.minLength,
                    maxlength: e.schema?.maxLength,
                    value: s.value[e.key],
                    onInput: (l) => s.value[e.key] = l.target.value
                  }, null, 40, Ie)),
                  e.description ? (n(), o("p", Ue, p(e.description), 1)) : u("", !0)
                ], 64))
              ]))), 128))
            ]))), 128)) : (n(), o("div", me, "No settings declared."))
          ])
        ]))
      ])
    ]));
  }
}), Pe = { type: "object", properties: { config: { type: "object" } } };
class je extends q {
  static get wippyConfig() {
    return {
      propsSchema: Pe,
      hostCssKeys: ["themeConfigUrl", "primeVueCssUrl"],
      inlineCss: Q
    };
  }
  static get vueConfig() {
    return { rootComponent: Ae, plugins: [te] };
  }
}
oe(import.meta.url, je);
//# sourceMappingURL=provider.js.map

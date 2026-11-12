import { defineComponent as H, computed as v, ref as g, onMounted as K, openBlock as n, createElementBlock as o, createElementVNode as m, createCommentVNode as u, createVNode as _, unref as c, withCtx as D, createBlock as w, toDisplayString as p, createTextVNode as F, Fragment as C, renderList as R } from "vue";
import { Icon as N } from "@iconify/vue";
import U from "primevue/button";
import Q from "primevue/select";
import W from "primevue/toggleswitch";
import { b as X } from "./wc-runtime-DjtZy7dL.js";
import { api as V } from "@wippy-fe/proxy";
import { _ as Z } from "./WcMount.vue_vue_type_script_setup_true_lang-CNWT59Oh.js";
const ee = { class: "ap" }, te = { class: "ap-body" }, ae = { class: "ap-bar" }, ne = {
  key: 0,
  class: "ap-dirty"
}, oe = {
  key: 0,
  class: "ap-msg ap-err"
}, le = {
  key: 1,
  class: "ap-loading"
}, se = {
  key: 2,
  class: "ap-cards"
}, re = { class: "ap-card" }, ie = { class: "ap-h" }, ue = {
  key: 0,
  class: "ap-sub"
}, ce = {
  key: 1,
  class: "ks-empty"
}, pe = {
  key: 0,
  class: "pv-group-title"
}, de = { class: "pv-field-head" }, ve = { class: "ap-blabel" }, me = {
  key: 0,
  class: "ks-tag kx-tag-caps ks-tag-on"
}, ye = {
  key: 1,
  class: "ks-tag kx-tag-caps ks-tag-on"
}, _e = { key: 0 }, he = {
  key: 2,
  class: "ap-hint"
}, ge = {
  key: 1,
  class: "ap-toggle-row pv-toggle"
}, fe = { class: "ap-toggle-text" }, ke = {
  key: 0,
  class: "ap-toggle-desc"
}, be = ["min", "max", "value", "onInput"], xe = ["placeholder", "value", "onInput"], Se = ["value", "onInput"], we = ["minlength", "maxlength", "value", "onInput"], Ce = {
  key: 5,
  class: "ap-hint"
}, T = "General", Le = /* @__PURE__ */ H({
  __name: "provider",
  setup(Ne) {
    const $ = X(), f = v(() => $.value?.config || null), A = v(() => f.value?.namespace || ""), G = v(() => f.value?.title || "Provider"), J = v(() => f.value?.icon || "tabler:plug-connected"), B = v(() => f.value?.help || ""), k = g(!0), i = g(!1), d = g(""), y = g([]), s = g({});
    function P(t) {
      const a = t.split(/[._\-\s]+/).filter(Boolean);
      return a.length ? a.map((r, e) => e === 0 ? r.charAt(0).toUpperCase() + r.slice(1) : r).join(" ") : t;
    }
    const h = (t) => t.title && t.title.length ? t.title : P(t.key), O = (t) => Array.isArray(t.schema?.enum) ? t.schema.enum : null, E = v(() => {
      const t = /* @__PURE__ */ new Map();
      for (const e of y.value) {
        const l = e.category && e.category.length ? e.category : T;
        t.has(l) || t.set(l, []), t.get(l).push(e);
      }
      const a = (e) => typeof e.order == "number" ? e.order : 100, r = [];
      for (const [e, l] of t)
        l.sort((x, S) => a(x) - a(S) || h(x).localeCompare(h(S))), r.push({ name: e, items: l });
      return r.sort((e, l) => {
        const x = Math.min(...e.items.map(a)), S = Math.min(...l.items.map(a));
        return x - S || e.name.localeCompare(l.name);
      }), r;
    }), z = v(() => E.value.length === 1 && E.value[0].name === T);
    function j(t, a) {
      s.value[t.key] = t.value_type === "json" ? JSON.stringify(a, null, 2) : a;
    }
    function L(t) {
      const a = s.value[t.key];
      return t.value_type === "secret" ? String(a ?? "").length > 0 : t.value_type === "json" ? a !== JSON.stringify(t.value, null, 2) : a !== t.value;
    }
    const I = v(() => y.value.some(L));
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
      if (!A.value) {
        k.value = !1;
        return;
      }
      k.value = !0, d.value = "";
      try {
        const { data: t } = await V.get(`/api/v1/settings?namespace=${encodeURIComponent(A.value)}`);
        if (!t?.success) throw new Error(t?.error || "failed to load settings");
        y.value = Array.isArray(t.settings) ? t.settings : [], s.value = {};
        for (const a of y.value) j(a, a.value_type === "secret" ? "" : a.value);
      } catch (t) {
        d.value = t instanceof Error ? t.message : String(t);
      } finally {
        k.value = !1;
      }
    }
    async function Y() {
      i.value = !0, d.value = "";
      try {
        for (const t of y.value) {
          if (!L(t)) continue;
          const a = M(t, s.value[t.key]), { data: r } = await V.put("/api/v1/settings", { namespace: t.namespace, key: t.key, value: a });
          if (!r?.success) throw new Error(r?.error || `could not save ${h(t)}`);
        }
        await b();
      } catch (t) {
        d.value = t instanceof Error ? t.message : String(t);
      } finally {
        i.value = !1;
      }
    }
    async function q(t) {
      i.value = !0, d.value = "";
      try {
        const { data: a } = await V.put("/api/v1/settings", { namespace: t.namespace, key: t.key, value: null });
        if (!a?.success) throw new Error(a?.error || "reset failed");
        await b();
      } catch (a) {
        d.value = a instanceof Error ? a.message : String(a);
      } finally {
        i.value = !1;
      }
    }
    return K(b), (t, a) => (n(), o("div", ee, [
      m("div", te, [
        m("header", ae, [
          I.value ? (n(), o("span", ne, "Unsaved changes")) : u("", !0),
          _(c(U), {
            type: "button",
            label: "Discard",
            severity: "secondary",
            outlined: "",
            disabled: !I.value || i.value,
            onClick: b
          }, null, 8, ["disabled"]),
          _(c(U), {
            type: "button",
            label: i.value ? "Saving…" : "Save",
            loading: i.value,
            disabled: !I.value || i.value,
            onClick: Y
          }, {
            icon: D(() => [
              i.value ? u("", !0) : (n(), w(c(N), {
                key: 0,
                icon: "tabler:device-floppy",
                "aria-hidden": "true"
              }))
            ]),
            _: 1
          }, 8, ["label", "loading", "disabled"])
        ]),
        d.value ? (n(), o("div", oe, p(d.value), 1)) : u("", !0),
        k.value ? (n(), o("div", le, [
          _(c(N), {
            icon: "tabler:loader-2",
            class: "spin"
          }),
          a[0] || (a[0] = F(" Loading…", -1))
        ])) : (n(), o("div", se, [
          m("section", re, [
            m("header", ie, [
              _(c(N), {
                icon: J.value,
                "aria-hidden": "true"
              }, null, 8, ["icon"]),
              F(" " + p(G.value), 1)
            ]),
            B.value ? (n(), o("p", ue, p(B.value), 1)) : u("", !0),
            y.value.length ? (n(!0), o(C, { key: 2 }, R(E.value, (r) => (n(), o("div", {
              key: r.name,
              class: "pv-group"
            }, [
              z.value ? u("", !0) : (n(), o("h3", pe, p(r.name), 1)),
              (n(!0), o(C, null, R(r.items, (e) => (n(), o("div", {
                key: e.key,
                class: "pv-field"
              }, [
                m("div", de, [
                  m("label", ve, p(h(e)), 1),
                  e.is_secret && e.has_value ? (n(), o("span", me, "set")) : !e.is_default && !e.is_secret ? (n(), o("span", ye, "overridden")) : u("", !0),
                  e.is_default ? u("", !0) : (n(), w(c(U), {
                    key: 2,
                    class: "pv-reset",
                    type: "button",
                    severity: "secondary",
                    text: "",
                    rounded: "",
                    title: "Reset to default",
                    "aria-label": "Reset to default",
                    disabled: i.value,
                    onClick: (l) => q(e)
                  }, {
                    icon: D(() => [
                      _(c(N), {
                        icon: "tabler:rotate",
                        "aria-hidden": "true"
                      })
                    ]),
                    _: 1
                  }, 8, ["disabled", "onClick"]))
                ]),
                e.control ? (n(), o(C, { key: 0 }, [
                  e.editable === !1 ? (n(), o("span", _e, p(e.value), 1)) : (n(), w(Z, {
                    key: 1,
                    tag: e.control.tag,
                    attrs: { ...e.control.props, value: M(e, s.value[e.key]) },
                    onSelect: (l) => j(e, l)
                  }, null, 8, ["tag", "attrs", "onSelect"])),
                  e.description ? (n(), o("p", he, p(e.description), 1)) : u("", !0)
                ], 64)) : e.value_type === "bool" ? (n(), o("div", ge, [
                  m("div", fe, [
                    e.description ? (n(), o("span", ke, p(e.description), 1)) : u("", !0)
                  ]),
                  _(c(W), {
                    "model-value": !!s.value[e.key],
                    "aria-label": h(e),
                    "onUpdate:modelValue": (l) => s.value[e.key] = l
                  }, null, 8, ["model-value", "aria-label", "onUpdate:modelValue"])
                ])) : (n(), o(C, { key: 2 }, [
                  O(e) ? (n(), w(c(Q), {
                    key: 0,
                    class: "ap-select",
                    "model-value": s.value[e.key],
                    options: O(e),
                    "onUpdate:modelValue": (l) => s.value[e.key] = l
                  }, null, 8, ["model-value", "options", "onUpdate:modelValue"])) : e.value_type === "int" ? (n(), o("input", {
                    key: 1,
                    class: "ap-binput",
                    type: "number",
                    min: e.schema?.minimum,
                    max: e.schema?.maximum,
                    value: s.value[e.key],
                    onInput: (l) => s.value[e.key] = Number(l.target.value)
                  }, null, 40, be)) : e.value_type === "secret" ? (n(), o("input", {
                    key: 2,
                    class: "ap-binput",
                    type: "password",
                    autocomplete: "off",
                    placeholder: e.has_value ? "•••••••• set — type to replace" : "Not set",
                    value: s.value[e.key],
                    onInput: (l) => s.value[e.key] = l.target.value
                  }, null, 40, xe)) : e.value_type === "json" ? (n(), o("textarea", {
                    key: 3,
                    class: "ap-binput pv-textarea",
                    rows: "4",
                    value: s.value[e.key],
                    onInput: (l) => s.value[e.key] = l.target.value
                  }, null, 40, Se)) : (n(), o("input", {
                    key: 4,
                    class: "ap-binput",
                    type: "text",
                    minlength: e.schema?.minLength,
                    maxlength: e.schema?.maxLength,
                    value: s.value[e.key],
                    onInput: (l) => s.value[e.key] = l.target.value
                  }, null, 40, we)),
                  e.description ? (n(), o("p", Ce, p(e.description), 1)) : u("", !0)
                ], 64))
              ]))), 128))
            ]))), 128)) : (n(), o("div", ce, "No settings declared."))
          ])
        ]))
      ])
    ]));
  }
});
export {
  Le as default
};
//# sourceMappingURL=provider-CIIkcbCs.js.map

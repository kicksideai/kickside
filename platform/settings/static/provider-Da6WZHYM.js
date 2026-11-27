import { defineComponent as Z, computed as m, ref as k, useId as ee, onMounted as te, openBlock as n, createElementBlock as o, createElementVNode as f, createCommentVNode as u, createVNode as h, unref as c, withCtx as G, createBlock as $, toDisplayString as d, createTextVNode as J, Fragment as N, renderList as P, mergeProps as E } from "vue";
import { Icon as U } from "@iconify/vue";
import { b as R, _ as ae, s as ne, a as oe, c as T } from "./setting-change-Dp6CFrHB.js";
import { a as le } from "./wc-runtime-4lROyJyk.js";
import { api as j } from "@wippy-fe/proxy";
const re = { class: "ap" }, ie = { class: "ap-body" }, se = { class: "ap-bar" }, ue = {
  key: 0,
  class: "ap-dirty"
}, ce = {
  key: 0,
  class: "ap-msg ap-err"
}, de = {
  key: 1,
  class: "ap-loading"
}, pe = {
  key: 2,
  class: "ap-cards"
}, ve = { class: "ap-card" }, ye = { class: "ap-h" }, me = {
  key: 0,
  class: "ap-sub"
}, fe = {
  key: 1,
  class: "ks-empty"
}, _e = {
  key: 0,
  class: "pv-group-title"
}, ge = { class: "pv-field-head" }, he = ["id"], ke = {
  key: 0,
  class: "ks-tag kx-tag-caps ks-tag-on"
}, be = {
  key: 1,
  class: "ks-tag kx-tag-caps ks-tag-on"
}, xe = { key: 0 }, Se = ["id"], we = {
  key: 1,
  class: "ap-toggle-row pv-toggle"
}, Ce = { class: "ap-toggle-text" }, Ie = ["id"], $e = ["min", "max", "value", "onInput"], Ne = ["placeholder", "value", "onInput"], Ee = ["value", "onInput"], Ue = ["minlength", "maxlength", "value", "onInput"], Ae = ["id"], z = "General", Le = /* @__PURE__ */ Z({
  __name: "provider",
  setup(Ve) {
    const Y = le(), b = m(() => Y.value?.config || null), B = m(() => b.value?.namespace || ""), A = m(() => b.value?.title || "Provider"), q = m(() => b.value?.icon || "tabler:plug-connected"), x = m(() => b.value?.help || ""), S = k(!0), s = k(!1), p = k(""), _ = k([]), r = k({}), H = ee(), g = (t, a) => `${H}-${encodeURIComponent(t.key)}-${a}`, v = (t) => ({
      "aria-labelledby": g(t, "title"),
      "aria-describedby": t.description ? g(t, "description") : void 0
    });
    function K(t) {
      const a = t.split(/[._\-\s]+/).filter(Boolean);
      return a.length ? a.map((i, e) => e === 0 ? i.charAt(0).toUpperCase() + i.slice(1) : i).join(" ") : t;
    }
    const y = (t) => t.title && t.title.length ? t.title : K(t.key), D = (t) => Array.isArray(t.schema?.enum) ? t.schema.enum : null, V = m(() => {
      const t = /* @__PURE__ */ new Map();
      for (const e of _.value) {
        const l = e.category && e.category.length ? e.category : z;
        t.has(l) || t.set(l, []), t.get(l).push(e);
      }
      const a = (e) => typeof e.order == "number" ? e.order : 100, i = [];
      for (const [e, l] of t)
        l.sort((C, I) => a(C) - a(I) || y(C).localeCompare(y(I))), i.push({ name: e, items: l });
      return i.sort((e, l) => {
        const C = Math.min(...e.items.map(a)), I = Math.min(...l.items.map(a));
        return C - I || e.name.localeCompare(l.name);
      }), i;
    }), Q = m(() => V.value.length === 1 && V.value[0].name === z);
    function L(t, a) {
      r.value[t.key] = t.value_type === "json" ? JSON.stringify(a, null, 2) : a;
    }
    function M(t) {
      const a = r.value[t.key];
      return t.value_type === "secret" ? String(a ?? "").length > 0 : t.value_type === "json" ? a !== JSON.stringify(t.value, null, 2) : a !== t.value;
    }
    const O = m(() => _.value.some(M));
    function F(t, a) {
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
    async function w() {
      if (!B.value) {
        S.value = !1;
        return;
      }
      S.value = !0, p.value = "";
      try {
        const { data: t } = await j.get(`/api/v1/settings?namespace=${encodeURIComponent(B.value)}`);
        if (!t?.success) throw new Error(t?.error || "failed to load settings");
        _.value = Array.isArray(t.settings) ? t.settings : [], r.value = {};
        for (const a of _.value) L(a, a.value_type === "secret" ? "" : a.value);
      } catch (t) {
        p.value = t instanceof Error ? t.message : String(t);
      } finally {
        S.value = !1;
      }
    }
    async function W() {
      if (!s.value) {
        s.value = !0, p.value = "";
        try {
          const t = _.value.filter(M).map((a) => ({ s: a, value: F(a, r.value[a.key]) }));
          for (const { s: a, value: i } of t)
            if (!await T(a, i, y(a), "Save")) return;
          for (const { s: a, value: i } of t) {
            const { data: e } = await j.put("/api/v1/settings", { namespace: a.namespace, key: a.key, value: i });
            if (!e?.success) throw new Error(e?.error || `could not save ${y(a)}`);
          }
          await w();
        } catch (t) {
          p.value = t instanceof Error ? t.message : String(t);
        } finally {
          s.value = !1;
        }
      }
    }
    async function X(t) {
      if (!s.value) {
        s.value = !0, p.value = "";
        try {
          if (!await T(t, t.default, y(t), "Reset to default")) return;
          const { data: a } = await j.put("/api/v1/settings", { namespace: t.namespace, key: t.key, value: null });
          if (!a?.success) throw new Error(a?.error || "reset failed");
          await w();
        } catch (a) {
          p.value = a instanceof Error ? a.message : String(a);
        } finally {
          s.value = !1;
        }
      }
    }
    return te(w), (t, a) => (n(), o("div", re, [
      f("div", ie, [
        f("header", se, [
          O.value ? (n(), o("span", ue, "Unsaved changes")) : u("", !0),
          h(c(R), {
            type: "button",
            label: "Discard",
            "aria-label": `Discard ${A.value} changes`,
            "aria-description": x.value || void 0,
            severity: "secondary",
            outlined: "",
            disabled: !O.value || s.value,
            onClick: w
          }, null, 8, ["aria-label", "aria-description", "disabled"]),
          h(c(R), {
            type: "button",
            label: s.value ? "Saving…" : "Save",
            "aria-label": `Save ${A.value} settings`,
            "aria-description": x.value || void 0,
            loading: s.value,
            disabled: !O.value || s.value,
            onClick: W
          }, {
            icon: G(() => [
              s.value ? u("", !0) : (n(), $(c(U), {
                key: 0,
                icon: "tabler:device-floppy",
                "aria-hidden": "true"
              }))
            ]),
            _: 1
          }, 8, ["label", "aria-label", "aria-description", "loading", "disabled"])
        ]),
        p.value ? (n(), o("div", ce, d(p.value), 1)) : u("", !0),
        S.value ? (n(), o("div", de, [
          h(c(U), {
            icon: "tabler:loader-2",
            class: "spin"
          }),
          a[0] || (a[0] = J(" Loading…", -1))
        ])) : (n(), o("div", pe, [
          f("section", ve, [
            f("header", ye, [
              h(c(U), {
                icon: q.value,
                "aria-hidden": "true"
              }, null, 8, ["icon"]),
              J(" " + d(A.value), 1)
            ]),
            x.value ? (n(), o("p", me, d(x.value), 1)) : u("", !0),
            _.value.length ? (n(!0), o(N, { key: 2 }, P(V.value, (i) => (n(), o("div", {
              key: i.name,
              class: "pv-group"
            }, [
              Q.value ? u("", !0) : (n(), o("h3", _e, d(i.name), 1)),
              (n(!0), o(N, null, P(i.items, (e) => (n(), o("div", {
                key: e.key,
                class: "pv-field"
              }, [
                f("div", ge, [
                  f("span", {
                    id: g(e, "title"),
                    class: "ap-blabel"
                  }, d(y(e)), 9, he),
                  e.is_secret && e.has_value ? (n(), o("span", ke, "set")) : !e.is_default && !e.is_secret ? (n(), o("span", be, "overridden")) : u("", !0),
                  e.is_default ? u("", !0) : (n(), $(c(R), {
                    key: 2,
                    class: "pv-reset",
                    type: "button",
                    severity: "secondary",
                    text: "",
                    rounded: "",
                    title: "Reset to default",
                    "aria-label": `Reset ${y(e)} to default`,
                    "aria-describedby": v(e)["aria-describedby"],
                    disabled: s.value,
                    onClick: (l) => X(e)
                  }, {
                    icon: G(() => [
                      h(c(U), {
                        icon: "tabler:rotate",
                        "aria-hidden": "true"
                      })
                    ]),
                    _: 1
                  }, 8, ["aria-label", "aria-describedby", "disabled", "onClick"]))
                ]),
                e.control ? (n(), o(N, { key: 0 }, [
                  e.editable === !1 ? (n(), o("span", xe, d(e.value), 1)) : (n(), $(ae, {
                    key: 1,
                    tag: e.control.tag,
                    label: y(e),
                    attrs: { ...e.control.props, role: "group", description: e.description, ...v(e), value: F(e, r.value[e.key]) },
                    onSelect: (l) => L(e, l)
                  }, null, 8, ["tag", "label", "attrs", "onSelect"])),
                  e.description ? (n(), o("p", {
                    key: 2,
                    id: g(e, "description"),
                    class: "ap-hint"
                  }, d(e.description), 9, Se)) : u("", !0)
                ], 64)) : e.value_type === "bool" ? (n(), o("div", we, [
                  f("div", Ce, [
                    e.description ? (n(), o("span", {
                      key: 0,
                      id: g(e, "description"),
                      class: "ap-toggle-desc"
                    }, d(e.description), 9, Ie)) : u("", !0)
                  ]),
                  h(c(ne), {
                    pt: { input: v(e) },
                    "model-value": !!r.value[e.key],
                    "onUpdate:modelValue": (l) => r.value[e.key] = l
                  }, null, 8, ["pt", "model-value", "onUpdate:modelValue"])
                ])) : (n(), o(N, { key: 2 }, [
                  D(e) ? (n(), $(c(oe), {
                    key: 0,
                    class: "ap-select",
                    pt: { label: v(e) },
                    "model-value": r.value[e.key],
                    options: D(e),
                    "onUpdate:modelValue": (l) => r.value[e.key] = l
                  }, null, 8, ["pt", "model-value", "options", "onUpdate:modelValue"])) : e.value_type === "int" ? (n(), o("input", E({
                    key: 1,
                    ref_for: !0
                  }, v(e), {
                    class: "ap-binput",
                    type: "number",
                    min: e.schema?.minimum,
                    max: e.schema?.maximum,
                    value: r.value[e.key],
                    onInput: (l) => r.value[e.key] = Number(l.target.value)
                  }), null, 16, $e)) : e.value_type === "secret" ? (n(), o("input", E({
                    key: 2,
                    ref_for: !0
                  }, v(e), {
                    class: "ap-binput",
                    type: "password",
                    autocomplete: "off",
                    placeholder: e.has_value ? "•••••••• set — type to replace" : "Not set",
                    value: r.value[e.key],
                    onInput: (l) => r.value[e.key] = l.target.value
                  }), null, 16, Ne)) : e.value_type === "json" ? (n(), o("textarea", E({
                    key: 3,
                    ref_for: !0
                  }, v(e), {
                    class: "ap-binput pv-textarea",
                    rows: "4",
                    value: r.value[e.key],
                    onInput: (l) => r.value[e.key] = l.target.value
                  }), null, 16, Ee)) : (n(), o("input", E({
                    key: 4,
                    ref_for: !0
                  }, v(e), {
                    class: "ap-binput",
                    type: "text",
                    minlength: e.schema?.minLength,
                    maxlength: e.schema?.maxLength,
                    value: r.value[e.key],
                    onInput: (l) => r.value[e.key] = l.target.value
                  }), null, 16, Ue)),
                  e.description ? (n(), o("p", {
                    key: 5,
                    id: g(e, "description"),
                    class: "ap-hint"
                  }, d(e.description), 9, Ae)) : u("", !0)
                ], 64))
              ]))), 128))
            ]))), 128)) : (n(), o("div", fe, "No settings declared."))
          ])
        ]))
      ])
    ]));
  }
});
export {
  Le as default
};
//# sourceMappingURL=provider-Da6WZHYM.js.map

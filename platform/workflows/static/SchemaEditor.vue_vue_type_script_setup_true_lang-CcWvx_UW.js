import { defineComponent as ee, computed as B, ref as f, watch as ae, onBeforeUnmount as te, openBlock as c, createElementBlock as p, createElementVNode as b, toDisplayString as _, createCommentVNode as S, createBlock as K, unref as h, Fragment as R, createVNode as g, withKeys as le, withModifiers as se, withCtx as M, createTextVNode as P } from "vue";
import re from "primevue/inputtext";
import ne from "primevue/textarea";
import U from "primevue/button";
import oe from "primevue/selectbutton";
import { Icon as H } from "@iconify/vue";
import { _ as ue } from "./WcMount.vue_vue_type_script_setup_true_lang-CNWT59Oh.js";
import { S as ie } from "./WorkflowSearchList.vue_vue_type_script_setup_true_lang-1g5-myn1.js";
import { api as ce } from "@wippy-fe/proxy";
import { x as de } from "./http-error-4TebKSwQ.js";
function T(s) {
  const o = s.trim();
  if (!o) return { value: null, error: "" };
  try {
    const a = JSON.parse(o);
    return !a || typeof a != "object" || Array.isArray(a) ? { value: null, error: "Must be a JSON object." } : { value: a, error: "" };
  } catch (a) {
    return { value: null, error: `Invalid JSON: ${a instanceof Error ? a.message : "parse error"}` };
  }
}
const G = "AI assist is temporarily unavailable. Try again shortly.", fe = "AI assist isn’t available here yet.", ve = {
  assist_unavailable: G,
  "assist unavailable": G
};
function $(s) {
  return typeof s == "string" ? s.trim() : "";
}
function q(s, o) {
  const a = $(s?.message);
  if (a) return a;
  const t = $(s?.error);
  if (!t) return o;
  const i = ve[t.toLowerCase()];
  return i || (/_/.test(t) && !/\s/.test(t) ? o : t);
}
const me = 11e4;
function pe(s) {
  return "schema" in s;
}
const z = fe, F = "The assistant couldn’t draft a schema.";
async function he(s, o, a = {}, t) {
  const i = { intent: s };
  o != null && (i.current_schema = o);
  const v = {};
  a.surface && (v.surface = a.surface), a.sample !== void 0 && (v.sample = a.sample), Object.keys(v).length && (i.context = v);
  let d;
  try {
    d = (await ce.post("/api/v1/workflows/assist/schema", i, {
      timeout: me,
      signal: t
    })).data;
  } catch (n) {
    const x = String(n?.code || ""), O = String(n?.name || "");
    if (x === "ERR_CANCELED" || O === "CanceledError" || O === "AbortError")
      return { error: "Draft cancelled." };
    if (de(n) === 404) return { error: z, unavailable: !0 };
    const I = n?.response?.data;
    return I ? { error: q(I, n instanceof Error && n.message ? n.message : F) } : { error: n instanceof Error && n.message ? n.message : F };
  }
  if (!d || typeof d != "object") return { error: z, unavailable: !0 };
  const y = d;
  if (y.success === !1) return { error: q(y, F) };
  const r = y.schema;
  return !r || typeof r != "object" || Array.isArray(r) ? { error: "The assistant returned no schema." } : { schema: r, notes: y.notes != null ? String(y.notes) : void 0 };
}
const ye = { class: "wf-sed" }, we = { class: "wf-sed-bar" }, be = {
  key: 0,
  class: "wf-panel-label wf-sed-label"
}, ge = {
  key: 0,
  class: "wf-field-err"
}, Ae = { class: "wf-sed-assist" }, Se = {
  key: 0,
  class: "wf-sed-draft",
  role: "status",
  "aria-label": "Drafted fields ready to review"
}, Ee = { class: "wf-sed-draft-copy" }, Ve = { class: "wf-sed-draft-actions" }, ke = {
  key: 1,
  class: "wf-panel-hint wf-panel-hint--warn wf-sed-msg"
}, Ce = {
  key: 2,
  class: "wf-field-err wf-sed-msg"
}, Ne = "wc-schema-form", Ue = /* @__PURE__ */ ee({
  __name: "SchemaEditor",
  props: {
    modelValue: {},
    mode: { default: "schema" },
    schema: {},
    surface: {},
    sample: {},
    label: {},
    rows: { default: 10 },
    placeholder: {},
    resetKey: {},
    allowEmpty: { type: Boolean }
  },
  emits: ["update:modelValue", "change", "clear", "valid"],
  setup(s, { emit: o }) {
    const a = s, t = o, i = B(() => a.mode !== "value"), v = B(() => a.mode === "value" && ie(a.schema)), d = f("code"), y = [
      { label: "Form", value: "form" },
      { label: "JSON", value: "code" }
    ], r = f(""), n = f("");
    function x() {
      const l = a.modelValue;
      l && typeof l == "object" ? r.value = JSON.stringify(l, null, 2) : a.allowEmpty ? r.value = "" : r.value = JSON.stringify(i.value ? { type: "object", properties: {} } : {}, null, 2), n.value = "", D(), v.value || (d.value = "code"), t("valid", !0);
    }
    function O() {
      D();
      const l = !r.value.trim(), { value: e, error: u } = T(r.value);
      n.value = u, t("valid", !u), !(l || u || !e) && t("update:modelValue", e);
    }
    function I() {
      if (a.allowEmpty && !r.value.trim()) {
        n.value = "", D(), t("valid", !0), t("clear");
        return;
      }
      const { value: l, error: e } = T(r.value);
      n.value = e, t("valid", !e), !(e || !l) && (D(), t("update:modelValue", l), t("change", l));
    }
    function W(l) {
      if (!l || typeof l != "object") return;
      const e = { ...a.modelValue || {}, ...l };
      r.value = JSON.stringify(e, null, 2), t("update:modelValue", e), t("change", e);
    }
    const E = f(""), m = f(!1), V = f(""), A = f(!1), k = f(""), w = f(null), Y = B(() => w.value !== null);
    let C = null, J = 0;
    function j() {
      J++, C?.abort(), C = null, m.value = !1;
    }
    function D() {
      w.value = null, k.value = "", V.value = "";
    }
    async function L() {
      if (m.value) {
        j();
        return;
      }
      const l = E.value.trim();
      if (!l || A.value) return;
      const e = new AbortController(), u = ++J;
      C = e, m.value = !0, V.value = "";
      const Z = T(r.value).value, N = await he(l, Z, { surface: a.surface, sample: a.sample }, e.signal);
      e.signal.aborted || C !== e || u !== J || (C = null, m.value = !1, pe(N) ? (w.value = r.value, r.value = JSON.stringify(N.schema, null, 2), k.value = N.notes || "Drafted from your description — accept it or undo.", n.value = "", E.value = "") : (N.unavailable && (A.value = !0), V.value = N.error));
    }
    function Q() {
      const { value: l, error: e } = T(r.value);
      n.value = e, t("valid", !e), !(e || !l) && (t("update:modelValue", l), t("change", l), w.value = null, k.value = "");
    }
    function X() {
      w.value !== null && (r.value = w.value, w.value = null, k.value = "", n.value = "", t("valid", !0));
    }
    return ae(() => a.resetKey, () => {
      j(), x();
    }, { immediate: !0 }), te(j), (l, e) => (c(), p("div", ye, [
      b("div", we, [
        s.label ? (c(), p("span", be, _(s.label), 1)) : S("", !0),
        e[3] || (e[3] = b("span", { class: "wf-sed-spacer" }, null, -1)),
        v.value ? (c(), K(h(oe), {
          key: 1,
          modelValue: d.value,
          "onUpdate:modelValue": e[0] || (e[0] = (u) => d.value = u),
          class: "wf-sed-views",
          options: y,
          "option-label": "label",
          "option-value": "value",
          "aria-label": "Editor view"
        }, null, 8, ["modelValue"])) : S("", !0)
      ]),
      v.value && d.value === "form" ? (c(), K(ue, {
        key: 0,
        tag: Ne,
        schema: s.schema,
        config: s.modelValue || {},
        onChange: W
      }, null, 8, ["schema", "config"])) : (c(), p(R, { key: 1 }, [
        g(h(ne), {
          modelValue: r.value,
          "onUpdate:modelValue": e[1] || (e[1] = (u) => r.value = u),
          class: "wf-textarea wf-mono wf-sed-code",
          rows: s.rows,
          spellcheck: "false",
          placeholder: s.placeholder,
          "aria-label": s.label || (i.value ? "JSON schema" : "JSON value"),
          onInput: O,
          onChange: I
        }, null, 8, ["modelValue", "rows", "placeholder", "aria-label"]),
        n.value ? (c(), p("p", ge, _(n.value), 1)) : S("", !0)
      ], 64)),
      i.value ? (c(), p(R, { key: 2 }, [
        b("div", Ae, [
          g(h(re), {
            modelValue: E.value,
            "onUpdate:modelValue": e[2] || (e[2] = (u) => E.value = u),
            class: "wf-input wf-sed-intent",
            type: "text",
            placeholder: "Describe the expected fields — e.g. a lead with email and company",
            "aria-label": "Describe the expected fields",
            disabled: A.value,
            onKeydown: le(se(L, ["prevent"]), ["enter"])
          }, null, 8, ["modelValue", "disabled", "onKeydown"]),
          g(h(U), {
            type: "button",
            class: "wf-sed-go",
            disabled: A.value || !m.value && !E.value.trim(),
            title: A.value ? "AI assist unavailable" : m.value ? "Cancel this draft" : "Draft the fields with AI",
            onClick: L
          }, {
            default: M(() => [
              g(h(H), {
                icon: m.value ? "tabler:x" : "tabler:wand",
                "aria-hidden": "true"
              }, null, 8, ["icon"]),
              b("span", null, _(m.value ? "Cancel" : "Draft with AI"), 1)
            ]),
            _: 1
          }, 8, ["disabled", "title"])
        ]),
        Y.value ? (c(), p("div", Se, [
          b("div", Ee, [
            g(h(H), {
              icon: "tabler:sparkles",
              "aria-hidden": "true"
            }),
            b("span", null, _(k.value), 1)
          ]),
          b("div", Ve, [
            g(h(U), {
              type: "button",
              class: "wf-sed-undo",
              severity: "secondary",
              outlined: "",
              onClick: X
            }, {
              default: M(() => [...e[4] || (e[4] = [
                P("Undo", -1)
              ])]),
              _: 1
            }),
            g(h(U), {
              type: "button",
              class: "wf-sed-accept",
              onClick: Q
            }, {
              default: M(() => [...e[5] || (e[5] = [
                P("Accept", -1)
              ])]),
              _: 1
            })
          ])
        ])) : S("", !0),
        A.value ? (c(), p("p", ke, "AI assist isn’t available here yet.")) : V.value ? (c(), p("p", Ce, _(V.value), 1)) : S("", !0)
      ], 64)) : S("", !0)
    ]));
  }
});
export {
  fe as A,
  Ue as _,
  q as h
};

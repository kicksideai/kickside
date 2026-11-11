import { defineComponent as O, ref as v, onUnmounted as R, computed as x, openBlock as c, createElementBlock as W, Fragment as j, createVNode as f, unref as r, createBlock as p, withCtx as i, createTextVNode as d, createCommentVNode as k, toDisplayString as U } from "vue";
import w from "primevue/button";
import V from "primevue/dialog";
import T from "primevue/message";
import { on as A } from "@wippy-fe/proxy";
import { a as D, u as I } from "./wc-runtime-KO3cNuNo.js";
import { E as N, h as J } from "./WorkflowSearchList.vue_vue_type_script_setup_true_lang-1g5-myn1.js";
import { _ as P } from "./WcMount.vue_vue_type_script_setup_true_lang-CNWT59Oh.js";
import { g as z, b as F } from "./versions-BxnHuhqm.js";
import { _ as K } from "./EmbedWorkflowPicker.vue_vue_type_script_setup_true_lang-B2faQzpq.js";
const re = /* @__PURE__ */ O({
  __name: "WorkflowPicker",
  setup(M) {
    const n = D(), m = I(), s = v(!1), y = v(0), l = v("");
    let a = () => {
    };
    R(() => a());
    const b = x(() => Object.keys(N(n.value.schema)?.properties || {})[0] || "flow_ref"), S = x(() => N(n.value.config)?.[b.value]);
    async function $(t) {
      t.published_version && (a(), await C({ kind: "flow", id: t.id, version: t.published_version }));
    }
    function h(t) {
      return JSON.stringify(t, (e, o) => o && typeof o == "object" && !Array.isArray(o) ? Object.fromEntries(Object.entries(o).sort(([u], [g]) => u.localeCompare(g))) : o);
    }
    async function C(t) {
      l.value = "";
      try {
        if (n.value.sourceContext) {
          if (!n.value.sourceSchema) throw new Error("The source item schema is unavailable.");
          const e = JSON.parse(n.value.sourceSchema), o = await z(t.id, t.version);
          if (o.version !== t.version) throw new Error("The published Workflow version is unavailable.");
          const u = h(e) === h(o.input_schema) ? { kind: "none" } : { kind: "expr", expr: await F(t.id, e, o.input_schema) };
          m("select", { input_schema: o.input_schema, transform: u });
        }
        m("change", { [b.value]: t });
      } catch (e) {
        l.value = J(e, "Could not select the published Workflow.");
      }
    }
    function E(t) {
      const e = t?.id;
      e && (s.value = !1, a(), a = A(`workflow.${e}`, async (o) => {
        const _ = ((o?.data || o)?.events || []).find((B) => B.type === "kickside.workflows.events:version.published")?.body?.version;
        _ && (await C({ kind: "flow", id: e, version: _ }), a());
      }), m("navigate", { route: `/workflows/${encodeURIComponent(e)}/return/${encodeURIComponent(n.value.returnRoute || "")}` }));
    }
    return (t, e) => (c(), W(j, null, [
      f(K, {
        selected: S.value,
        onSelect: $
      }, null, 8, ["selected"]),
      r(n).sourceContext && r(n).returnRoute ? (c(), p(r(w), {
        key: 0,
        type: "button",
        "data-test": "new-workflow",
        severity: "secondary",
        outlined: "",
        onClick: e[0] || (e[0] = (o) => s.value = !0)
      }, {
        default: i(() => [...e[4] || (e[4] = [
          d("New workflow", -1)
        ])]),
        _: 1
      })) : k("", !0),
      l.value ? (c(), p(r(T), {
        key: 1,
        severity: "error",
        closable: !1
      }, {
        default: i(() => [
          d(U(l.value), 1)
        ]),
        _: 1
      })) : k("", !0),
      f(r(V), {
        visible: s.value,
        "onUpdate:visible": e[3] || (e[3] = (o) => s.value = o),
        modal: "",
        header: "New workflow"
      }, {
        footer: i(() => [
          f(r(w), {
            type: "button",
            severity: "secondary",
            outlined: "",
            onClick: e[1] || (e[1] = (o) => s.value = !1)
          }, {
            default: i(() => [...e[5] || (e[5] = [
              d("Cancel", -1)
            ])]),
            _: 1
          }),
          f(r(w), {
            type: "button",
            onClick: e[2] || (e[2] = (o) => y.value += 1)
          }, {
            default: i(() => [...e[6] || (e[6] = [
              d("Create", -1)
            ])]),
            _: 1
          })
        ]),
        default: i(() => [
          s.value ? (c(), p(P, {
            key: 0,
            tag: "kickside-workflow-setup",
            attrs: { "source-context": r(n).sourceContext, "submit-nonce": y.value || void 0 },
            onCreated: E
          }, null, 8, ["attrs"])) : k("", !0)
        ]),
        _: 1
      }, 8, ["visible"])
    ], 64));
  }
});
export {
  re as default
};

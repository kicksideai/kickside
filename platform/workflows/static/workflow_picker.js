import { u as U, a as V, s as j, W as O, P as R } from "./index-BhiG6P-P.js";
import { defineComponent as B, ref as d, onUnmounted as T, computed as x, openBlock as c, createElementBlock as A, Fragment as I, createVNode as p, unref as n, createBlock as v, withCtx as i, createTextVNode as f, createCommentVNode as y, toDisplayString as J } from "vue";
import { L as S, f as k, h as K, X as M, Y as z } from "./wc-mount-krbIT6pk.js";
import { s as D, g as F, c as H } from "./versions-d9QvfoPQ.js";
import { on as L, define as X } from "@wippy-fe/proxy";
import { _ as Y } from "./WcMount.vue_vue_type_script_setup_true_lang-CNWT59Oh.js";
import { _ as q, s as G } from "./workflow-embed-BXNW4FQr.js";
import "@iconify/vue";
const Q = /* @__PURE__ */ B({
  __name: "WorkflowPicker",
  setup($) {
    const s = U(), m = V(), r = d(!1), w = d(0), l = d("");
    let a = () => {
    };
    T(() => a());
    const C = x(() => Object.keys(S(s.value.schema)?.properties || {})[0] || "flow_ref"), E = x(() => S(s.value.config)?.[C.value]);
    async function N(o) {
      o.published_version && (a(), await b({ kind: "flow", id: o.id, version: o.published_version }));
    }
    function g(o) {
      return JSON.stringify(o, (e, t) => t && typeof t == "object" && !Array.isArray(t) ? Object.fromEntries(Object.entries(t).sort(([u], [h]) => u.localeCompare(h))) : t);
    }
    async function b(o) {
      l.value = "";
      try {
        if (s.value.sourceContext) {
          if (!s.value.sourceSchema) throw new Error("The source item schema is unavailable.");
          const e = JSON.parse(s.value.sourceSchema), t = await F(o.id, o.version);
          if (t.version !== o.version) throw new Error("The published Workflow version is unavailable.");
          const u = g(e) === g(t.input_schema) ? { kind: "none" } : { kind: "expr", expr: await H(o.id, e, t.input_schema) };
          m("select", { input_schema: t.input_schema, transform: u });
        }
        m("change", { [C.value]: o });
      } catch (e) {
        l.value = K(e, "Could not select the published Workflow.");
      }
    }
    function P(o) {
      const e = o?.id;
      e && (r.value = !1, a(), a = L(`workflow.${e}`, async (t) => {
        const _ = ((t?.data || t)?.events || []).find((W) => W.type === "kickside.workflows.events:version.published")?.body?.version;
        _ && (await b({ kind: "flow", id: e, version: _ }), a());
      }), m("navigate", { route: `/workflows/${encodeURIComponent(e)}/return/${encodeURIComponent(s.value.returnRoute || "")}` }));
    }
    return (o, e) => (c(), A(I, null, [
      p(q, {
        selected: E.value,
        onSelect: N
      }, null, 8, ["selected"]),
      n(s).sourceContext && n(s).returnRoute ? (c(), v(n(k), {
        key: 0,
        type: "button",
        "data-test": "new-workflow",
        severity: "secondary",
        outlined: "",
        onClick: e[0] || (e[0] = (t) => r.value = !0)
      }, {
        default: i(() => [...e[4] || (e[4] = [
          f("New workflow", -1)
        ])]),
        _: 1
      })) : y("", !0),
      l.value ? (c(), v(n(j), {
        key: 1,
        severity: "error",
        closable: !1
      }, {
        default: i(() => [
          f(J(l.value), 1)
        ]),
        _: 1
      })) : y("", !0),
      p(n(D), {
        visible: r.value,
        "onUpdate:visible": e[3] || (e[3] = (t) => r.value = t),
        modal: "",
        header: "New workflow"
      }, {
        footer: i(() => [
          p(n(k), {
            type: "button",
            severity: "secondary",
            outlined: "",
            onClick: e[1] || (e[1] = (t) => r.value = !1)
          }, {
            default: i(() => [...e[5] || (e[5] = [
              f("Cancel", -1)
            ])]),
            _: 1
          }),
          p(n(k), {
            type: "button",
            onClick: e[2] || (e[2] = (t) => w.value += 1)
          }, {
            default: i(() => [...e[6] || (e[6] = [
              f("Create", -1)
            ])]),
            _: 1
          })
        ]),
        default: i(() => [
          r.value ? (c(), v(Y, {
            key: 0,
            tag: "kickside-workflow-setup",
            attrs: { "source-context": n(s).sourceContext, "submit-nonce": w.value || void 0 },
            onCreated: P
          }, null, 8, ["attrs"])) : y("", !0)
        ]),
        _: 1
      }, 8, ["visible"])
    ], 64));
  }
}), Z = {
  type: "object",
  properties: {
    config: { type: "string", default: "{}" },
    schema: { type: "string", default: "" },
    "source-context": { type: "string" },
    "source-schema": { type: "string" },
    "return-route": { type: "string" }
  }
};
class ee extends O {
  static get wippyConfig() {
    return {
      propsSchema: Z,
      hostCssKeys: ["themeConfigUrl", "markdownCssUrl", "primeVueCssUrl"],
      inlineCss: [M, z, G].join(`
`)
    };
  }
  static get vueConfig() {
    return { rootComponent: Q, plugins: [R] };
  }
}
X(import.meta.url, ee);

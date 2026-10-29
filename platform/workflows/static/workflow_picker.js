import { u as U, a as V, s as j, W as O, P as R } from "./index-BhiG6P-P.js";
import { defineComponent as B, ref as m, onUnmounted as T, computed as S, openBlock as c, createElementBlock as A, Fragment as I, createVNode as p, unref as n, createBlock as v, withCtx as i, createTextVNode as f, createCommentVNode as y, toDisplayString as J } from "vue";
import { L as W, f as k, h as K, W as M } from "./pickerselect-CbBE-k9N.js";
import { s as z, g as D, c as F } from "./versions-BF_mXQIa.js";
import { on as H, define as L } from "@wippy-fe/proxy";
import { W as q } from "./WcMount-BphSenvv.js";
import { _ as G, s as Q } from "./workflow-embed-BP7UAaSy.js";
import "@iconify/vue";
const X = /* @__PURE__ */ B({
  __name: "WorkflowPicker",
  setup(_) {
    const s = U(), d = V(), r = m(!1), w = m(0), l = m("");
    let a = () => {
    };
    T(() => a());
    const C = S(() => Object.keys(W(s.value.schema)?.properties || {})[0] || "flow_ref"), E = S(() => W(s.value.config)?.[C.value]);
    async function $(o) {
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
          const e = JSON.parse(s.value.sourceSchema), t = await D(o.id, o.version);
          if (t.version !== o.version) throw new Error("The published Workflow version is unavailable.");
          const u = g(e) === g(t.input_schema) ? { kind: "none" } : { kind: "expr", expr: await F(o.id, e, t.input_schema) };
          d("select", { input_schema: t.input_schema, transform: u });
        }
        d("change", { [C.value]: o });
      } catch (e) {
        l.value = K(e, "Could not select the published Workflow.");
      }
    }
    function N(o) {
      const e = o?.id;
      e && (r.value = !1, a(), a = H(`workflow.${e}`, async (t) => {
        const x = ((t?.data || t)?.events || []).find((P) => P.type === "kickside.workflows.events:version.published")?.body?.version;
        x && (await b({ kind: "flow", id: e, version: x }), a());
      }), d("navigate", { route: `/workflows/${encodeURIComponent(e)}/return/${encodeURIComponent(s.value.returnRoute || "")}` }));
    }
    return (o, e) => (c(), A(I, null, [
      p(G, {
        selected: E.value,
        onSelect: $
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
      p(n(z), {
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
          r.value ? (c(), v(q, {
            key: 0,
            tag: "kickside-workflow-setup",
            attrs: { "source-context": n(s).sourceContext, "submit-nonce": w.value || void 0 },
            onCreated: N
          }, null, 8, ["attrs"])) : y("", !0)
        ]),
        _: 1
      }, 8, ["visible"])
    ], 64));
  }
}), Y = {
  type: "object",
  properties: {
    config: { type: "string", default: "{}" },
    schema: { type: "string", default: "" },
    "source-context": { type: "string" },
    "source-schema": { type: "string" },
    "return-route": { type: "string" }
  }
};
class Z extends O {
  static get wippyConfig() {
    return {
      propsSchema: Y,
      hostCssKeys: ["themeConfigUrl", "markdownCssUrl", "primeVueCssUrl"],
      inlineCss: [M, Q].join(`
`)
    };
  }
  static get vueConfig() {
    return { rootComponent: X, plugins: [R] };
  }
}
L(import.meta.url, Z);

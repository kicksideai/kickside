import { defineComponent as P, ref as d, watch as R, computed as q, onMounted as L, openBlock as s, createElementBlock as g, createElementVNode as n, createVNode as i, unref as a, createTextVNode as p, createBlock as h, withCtx as N, toDisplayString as A, createCommentVNode as b } from "vue";
import { loadByTagName as $ } from "@wippy-fe/proxy";
import { a as D, u as F } from "./wc-runtime-KO3cNuNo.js";
import w from "primevue/inputtext";
import O from "primevue/message";
import W from "primevue/progressspinner";
import J from "primevue/radiobutton";
import G from "primevue/select";
import V from "primevue/textarea";
import { M as H } from "./MultiSelectField-CJKHhAnf.js";
const K = { class: "kx-agent-block" }, Q = { class: "kx-agent-block__modes" }, X = { for: "agent-source-existing" }, Y = { for: "agent-source-inline" }, Z = {
  key: 0,
  class: "kx-agent-block__field"
}, ee = {
  key: 1,
  class: "kx-agent-block__loading",
  role: "status"
}, le = ["config"], te = { key: 3 }, oe = {
  key: 1,
  class: "kx-agent-block__field"
}, ne = { class: "kx-agent-block__field" }, ae = { class: "kx-agent-block__field" }, se = { class: "kx-agent-block__field" }, ie = {
  key: 2,
  class: "kx-agent-block__field"
}, ue = { class: "kx-agent-block__field" }, re = { class: "kx-agent-block__field" }, ye = /* @__PURE__ */ P({
  __name: "AgentBlockConfig",
  setup(de) {
    const C = D(), j = F(), v = C.value.config, u = d(v?.agent_id ? "existing" : "inline"), t = d({ ...v || {} }), f = d(v?.exit_schema ? JSON.stringify(v.exit_schema, null, 2) : ""), y = d(v?.context ? JSON.stringify(v.context, null, 2) : ""), m = d(""), k = d(""), x = d(!1), _ = d(""), U = [
      { label: "Auto", value: "auto" },
      { label: "Require a tool", value: "any" },
      { label: "No tools", value: "none" }
    ];
    R(() => C.value.config, (l) => {
      t.value = { ...l || {} }, u.value = t.value.agent_id ? "existing" : "inline", f.value = t.value.exit_schema ? JSON.stringify(t.value.exit_schema, null, 2) : "", y.value = t.value.context ? JSON.stringify(t.value.context, null, 2) : "";
    });
    const B = q(() => JSON.stringify({ agent_id: t.value.agent_id || "" }));
    function c() {
      const l = { ...t.value };
      u.value === "existing" ? delete l.instructions : delete l.agent_id;
      for (const e of Object.keys(l)) {
        const o = l[e];
        (o === "" || o == null || Array.isArray(o) && o.length === 0) && delete l[e];
      }
      t.value = l, j("config-changed", l);
    }
    function E(l) {
      u.value = l, l === "existing" ? delete t.value.instructions : delete t.value.agent_id, c();
    }
    function M(l) {
      if (l.composedPath()[0] !== l.currentTarget) return;
      const e = l.detail;
      t.value.agent_id = e?.agent_id || "", c();
    }
    function S(l, e) {
      t.value[l] = e || "", c();
    }
    function z(l) {
      t.value.tool_calling = l, t.value.tool_calling === "none" && (delete t.value.tools, delete t.value.exit_schema, f.value = "", m.value = ""), c();
    }
    function I(l) {
      t.value.tools = [...l], c();
    }
    function T(l, e) {
      e ||= "", l === "exit_schema" ? f.value = e : y.value = e;
      const o = l === "exit_schema" ? m : k;
      if (!e.trim()) {
        delete t.value[l], o.value = "", c();
        return;
      }
      try {
        const r = JSON.parse(e);
        if (!r || typeof r != "object" || Array.isArray(r)) throw new Error("Enter a JSON object.");
        if (l === "exit_schema" && r.type !== "object") throw new Error("Output shape must declare type: object.");
        if (l === "exit_schema" && t.value.tool_calling === "none") throw new Error("Output shape requires tool calling.");
        t.value[l] = r, o.value = "", c();
      } catch (r) {
        o.value = r instanceof Error ? r.message : "Enter a JSON object.";
      }
    }
    return L(async () => {
      x.value = !1, _.value = "";
      try {
        await $("wc-agent-picker", { timeoutMs: 8e3 }), x.value = !0;
      } catch {
        _.value = "Couldn’t load the Agent picker. Switch to inline instructions or try again.";
      }
    }), (l, e) => (s(), g("div", K, [
      n("fieldset", Q, [
        e[11] || (e[11] = n("legend", null, "Agent source", -1)),
        n("label", X, [
          i(a(J), {
            "input-id": "agent-source-existing",
            modelValue: u.value,
            "onUpdate:modelValue": e[0] || (e[0] = (o) => u.value = o),
            name: "agent-source",
            value: "existing",
            onChange: e[1] || (e[1] = (o) => E("existing"))
          }, null, 8, ["modelValue"]),
          e[9] || (e[9] = p(" Existing agent", -1))
        ]),
        n("label", Y, [
          i(a(J), {
            "input-id": "agent-source-inline",
            modelValue: u.value,
            "onUpdate:modelValue": e[2] || (e[2] = (o) => u.value = o),
            name: "agent-source",
            value: "inline",
            onChange: e[3] || (e[3] = (o) => E("inline"))
          }, null, 8, ["modelValue"]),
          e[10] || (e[10] = p(" Inline instructions", -1))
        ])
      ]),
      u.value === "existing" ? (s(), g("div", Z, [
        e[13] || (e[13] = n("span", null, "Agent", -1)),
        _.value ? (s(), h(a(O), {
          key: 0,
          severity: "error",
          size: "small",
          closable: !1
        }, {
          default: N(() => [
            p(A(_.value), 1)
          ]),
          _: 1
        })) : x.value ? (s(), g("wc-agent-picker", {
          key: 2,
          config: B.value,
          onChange: M
        }, null, 40, le)) : (s(), g("div", ee, [
          i(a(W), {
            class: "kx-agent-block__spinner",
            "stroke-width": "4",
            "aria-label": "Loading Agent picker"
          }),
          e[12] || (e[12] = n("span", null, "Loading Agent picker…", -1))
        ])),
        x.value ? (s(), g("small", te, "Select one exact installed Agent.")) : b("", !0)
      ])) : (s(), g("label", oe, [
        e[14] || (e[14] = n("span", null, "Instructions", -1)),
        i(a(V), {
          class: "kx-agent-block__control",
          "model-value": t.value.instructions || "",
          rows: "5",
          placeholder: "What should this step do?",
          "onUpdate:modelValue": e[4] || (e[4] = (o) => S("instructions", o))
        }, null, 8, ["model-value"]),
        e[15] || (e[15] = n("small", null, "The upstream Block output is provided as this Agent’s input.", -1))
      ])),
      n("label", ne, [
        e[16] || (e[16] = n("span", null, "Name", -1)),
        i(a(w), {
          class: "kx-agent-block__control",
          "model-value": t.value.name || "",
          placeholder: "Agent step",
          "onUpdate:modelValue": e[5] || (e[5] = (o) => S("name", o))
        }, null, 8, ["model-value"])
      ]),
      n("label", ae, [
        e[17] || (e[17] = n("span", null, "Model or class", -1)),
        i(a(w), {
          class: "kx-agent-block__control",
          "model-value": t.value.model || "",
          placeholder: "Use the Agent or system default",
          "onUpdate:modelValue": e[6] || (e[6] = (o) => S("model", o))
        }, null, 8, ["model-value"])
      ]),
      n("label", se, [
        e[18] || (e[18] = n("span", null, "Tool calling", -1)),
        i(a(G), {
          class: "kx-agent-block__control",
          "model-value": t.value.tool_calling || "auto",
          options: U,
          "option-label": "label",
          "option-value": "value",
          "onUpdate:modelValue": z
        }, null, 8, ["model-value"])
      ]),
      t.value.tool_calling !== "none" ? (s(), g("div", ie, [
        e[19] || (e[19] = n("span", null, "Tools", -1)),
        i(H, {
          source: "/api/v1/agents/tools",
          "response-key": "tools",
          "label-key": "title",
          "desc-key": "llm_description",
          "meta-key": "llm_alias",
          "icon-key": "icon",
          placeholder: "Search tools to add…",
          selected: t.value.tools || [],
          onChange: I
        }, null, 8, ["selected"]),
        e[20] || (e[20] = n("small", null, "Select exact installed tools.", -1))
      ])) : b("", !0),
      n("label", ue, [
        e[21] || (e[21] = n("span", null, "Output shape", -1)),
        i(a(V), {
          class: "kx-agent-block__control",
          "model-value": f.value,
          rows: "4",
          placeholder: "JSON Schema object",
          invalid: !!m.value,
          "onUpdate:modelValue": e[7] || (e[7] = (o) => T("exit_schema", o))
        }, null, 8, ["model-value", "invalid"]),
        m.value ? (s(), h(a(O), {
          key: 0,
          severity: "error",
          size: "small",
          closable: !1
        }, {
          default: N(() => [
            p(A(m.value), 1)
          ]),
          _: 1
        })) : b("", !0)
      ]),
      n("label", re, [
        e[22] || (e[22] = n("span", null, "Context", -1)),
        i(a(V), {
          class: "kx-agent-block__control",
          "model-value": y.value,
          rows: "3",
          placeholder: "JSON object",
          invalid: !!k.value,
          "onUpdate:modelValue": e[8] || (e[8] = (o) => T("context", o))
        }, null, 8, ["model-value", "invalid"]),
        k.value ? (s(), h(a(O), {
          key: 0,
          severity: "error",
          size: "small",
          closable: !1
        }, {
          default: N(() => [
            p(A(k.value), 1)
          ]),
          _: 1
        })) : b("", !0)
      ])
    ]));
  }
});
export {
  ye as default
};
//# sourceMappingURL=AgentBlockConfig-DPtr6hG4.js.map

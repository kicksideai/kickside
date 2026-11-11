import { defineComponent as W, openBlock as p, createElementBlock as m, Fragment as L, renderList as ee, normalizeClass as F, createElementVNode as t, createVNode as y, unref as o, toDisplayString as A, createCommentVNode as S, ref as N, onMounted as ce, watch as te, onBeforeUnmount as Me, computed as h, shallowRef as Te, withCtx as J, createTextVNode as M, withDirectives as D, vModelText as U, createBlock as ie, nextTick as $e } from "vue";
import { Icon as T } from "@iconify/vue";
import re from "primevue/button";
import Oe from "primevue/dialog";
import de from "primevue/toggleswitch";
import { loadByTagName as ae, api as Q } from "@wippy-fe/proxy";
import { _ as Ne } from "./WcMount.vue_vue_type_script_setup_true_lang-CNWT59Oh.js";
import { _ as Be } from "./toolCatalog-W6OjlU7E.js";
const je = {
  class: "kx-nav",
  role: "tablist",
  "aria-label": "Agent sections"
}, De = ["aria-selected", "onClick"], Ue = { class: "kx-nav-ico" }, Le = { class: "kx-nav-lbl" }, Pe = {
  key: 0,
  class: "kx-nav-meta"
}, Fe = /* @__PURE__ */ W({
  __name: "AgentNav",
  props: {
    items: {},
    active: {}
  },
  emits: ["select"],
  setup(a, { emit: C }) {
    const k = C;
    return (f, w) => (p(), m("nav", je, [
      (p(!0), m(L, null, ee(a.items, (l) => (p(), m("button", {
        key: l.key,
        type: "button",
        role: "tab",
        class: F(["kx-nav-item", a.active === l.key && "kx-nav-item-on"]),
        "aria-selected": a.active === l.key,
        onClick: (b) => k("select", l.key)
      }, [
        t("span", Ue, [
          y(o(T), {
            icon: l.icon,
            "aria-hidden": "true"
          }, null, 8, ["icon"])
        ]),
        t("span", Le, A(l.label), 1),
        l.meta ? (p(), m("span", Pe, A(l.meta), 1)) : S("", !0)
      ], 10, De))), 128))
    ]));
  }
}), We = /* @__PURE__ */ W({
  __name: "IconField",
  props: {
    modelValue: {},
    fallback: {}
  },
  emits: ["update:modelValue"],
  setup(a, { emit: C }) {
    const k = a, f = C, w = N(null);
    let l = null;
    function b(g) {
      f("update:modelValue", g.detail || "");
    }
    async function E() {
      if (w.value) {
        l && l.removeEventListener("select", b), w.value.innerHTML = "";
        try {
          customElements.get("wc-icon-picker") || await ae("wc-icon-picker", { timeoutMs: 8e3 });
        } catch {
        }
        w.value && (l = document.createElement("wc-icon-picker"), l.setAttribute("value", k.modelValue || ""), k.fallback && l.setAttribute("fallback", k.fallback), l.addEventListener("select", b), w.value.appendChild(l));
      }
    }
    return ce(E), te(() => k.modelValue, (g) => {
      l && l.getAttribute("value") !== g && l.setAttribute("value", g || "");
    }), Me(() => {
      l && l.removeEventListener("select", b);
    }), (g, R) => (p(), m("div", {
      ref_key: "host",
      ref: w,
      class: "wc-iconfield"
    }, null, 512));
  }
});
function ze({ form: a, traits: C, redirectTrait: k }) {
  const f = h(() => C().filter((d) => d.id !== k)), w = (d) => a.value.traits.includes(d.id), l = h(() => f.value.filter(w));
  function b(d) {
    return !!d && typeof d == "object" && !Array.isArray(d);
  }
  function E(d) {
    const _ = b(a.value.trait_contexts[d]) ? a.value.trait_contexts[d] : {}, n = b(a.value.trait_agent_options[d]) ? a.value.trait_agent_options[d] : null;
    return n ? { ..._, agent_options: n } : _;
  }
  function g(d, _) {
    if (b(_) && (Object.prototype.hasOwnProperty.call(_, "context") || Object.prototype.hasOwnProperty.call(_, "agent_options"))) {
      a.value.trait_contexts = { ...a.value.trait_contexts, [d]: b(_.context) ? _.context : {} };
      const r = { ...a.value.trait_agent_options };
      b(_.agent_options) && Object.keys(_.agent_options).length ? r[d] = _.agent_options : delete r[d], a.value.trait_agent_options = r;
      return;
    }
    a.value.trait_contexts = { ...a.value.trait_contexts, [d]: _ };
    const n = { ...a.value.trait_agent_options };
    delete n[d], a.value.trait_agent_options = n;
  }
  const R = h(() => a.value.traits.filter((d) => d !== k));
  function I(d) {
    a.value.traits = [...a.value.traits.filter((_) => _ === k), ...d];
  }
  return {
    selectableTraits: f,
    selectedCapabilities: R,
    activeTraits: l,
    traitMountConfig: E,
    onTraitConfig: g,
    onCapabilitiesChange: I
  };
}
const Z = "kickside.agents.traits:redirect", Je = "kickside.agents.traits:artifacts", qe = "kickside.uploads.traits:file_manager", q = "user_agent:";
function Ge({ form: a, agentId: C, agents: k, redirectTrait: f }) {
  const w = N("delegates");
  function l(r) {
    const u = r.detail;
    return u && Array.isArray(u.selected) ? u.selected.map(String) : [];
  }
  function b(r) {
    const u = new Set([C(), `${q}${C()}`].filter(Boolean));
    a.value.delegates = r.filter((v) => !u.has(v));
  }
  const E = (r) => r.startsWith(q) ? r.slice(q.length) : r, g = h(() => {
    const r = a.value.trait_contexts[f];
    return r && Array.isArray(r.targets) ? r.targets : [];
  }), R = h(() => g.value.map((r) => r.agent_id));
  function I(r) {
    a.value.trait_contexts = { ...a.value.trait_contexts, [f]: { targets: r } };
    const u = a.value.traits.indexOf(f);
    r.length && u < 0 ? a.value.traits.push(f) : !r.length && u >= 0 && a.value.traits.splice(u, 1);
  }
  function d(r) {
    const u = new Set([C(), `${q}${C()}`].filter(Boolean)), v = r.filter((x) => !u.has(x)), i = new Map(g.value.map((x) => [x.agent_id, x.comment]));
    I(v.map((x) => ({ agent_id: x, comment: i.get(x) || "" })));
  }
  function _(r) {
    const u = E(r);
    return k().find((v) => v.id === u)?.title || u;
  }
  function n(r, u) {
    I(g.value.map((v) => v.agent_id === r ? { ...v, comment: u } : v));
  }
  return { routeView: w, pickIds: l, onDelegatesChange: b, redirectTargets: g, redirectSelectedIds: R, setRedirects: I, onRedirectsChange: d, redirectLabel: _, setRedirectCommentById: n };
}
function ue(a, C) {
  if (a && typeof a == "object") {
    const k = a, f = k.response?.data?.error;
    if (typeof f == "string") return f;
    if (f && typeof f == "object" && typeof f.message == "string")
      return f.message;
    if (typeof k.message == "string" && k.message) return k.message;
  }
  return C;
}
function He({ form: a, valid: C, tab: k, blank: f, agentId: w, parentId: l, models: b, redirectTrait: E, emitSaved: g }) {
  const R = N(!1), I = N(!1), d = N("");
  async function _(u) {
    R.value = !0, a.value = f(!1);
    try {
      const { data: v } = await Q.get(`/api/v1/user-agents/${u}`);
      if (v?.success && v.agent) {
        const i = v.agent;
        a.value = {
          title: i.title || "",
          description: i.description || "",
          icon: i.icon || "tabler:robot",
          public: i.public === !0,
          prompt: i.prompt || "",
          model: i.model || b()[0]?.name || "",
          temperature: typeof i.temperature == "number" ? i.temperature : null,
          max_tokens: typeof i.max_tokens == "number" ? i.max_tokens : 8e3,
          thinking_effort: typeof i.thinking_effort == "number" ? i.thinking_effort : null,
          traits: Array.isArray(i.traits) ? [...i.traits] : [],
          trait_contexts: i.trait_contexts && typeof i.trait_contexts == "object" ? { ...i.trait_contexts } : {},
          trait_agent_options: i.trait_agent_options && typeof i.trait_agent_options == "object" ? { ...i.trait_agent_options } : {},
          tools: Array.isArray(i.tools) ? [...i.tools] : [],
          delegates: Array.isArray(i.delegates) ? [...i.delegates] : [],
          memory_target_id: i.memory_target_id || "",
          memory_provider_id: i.memory_provider_id || ""
        };
      }
    } catch (v) {
      d.value = ue(v, "could not load agent");
    } finally {
      R.value = !1;
    }
  }
  function n(u) {
    const v = {};
    for (const i of a.value.traits)
      Object.prototype.hasOwnProperty.call(u, i) && (v[i] = u[i]);
    return v;
  }
  async function r() {
    if (!C.value) {
      d.value = a.value.title.trim() ? "Check the model and token limits." : "Name is required.", a.value.title.trim() && (k.value = "model");
      return;
    }
    I.value = !0, d.value = "";
    const u = {
      title: a.value.title.trim(),
      description: a.value.description,
      icon: a.value.icon,
      public: a.value.public,
      prompt: a.value.prompt,
      model: a.value.model,
      temperature: a.value.temperature ?? !1,
      max_tokens: a.value.max_tokens,
      thinking_effort: a.value.thinking_effort ?? !1,
      traits: a.value.traits,
      trait_contexts: n(a.value.trait_contexts),
      trait_agent_options: n(a.value.trait_agent_options),
      tools: a.value.tools,
      delegates: a.value.delegates,
      memory_target_id: a.value.memory_target_id,
      memory_provider_id: a.value.memory_provider_id
    }, v = w();
    if (v) {
      const i = /* @__PURE__ */ new Set([v, `user_agent:${v}`]);
      u.delegates = u.delegates.filter(($) => !i.has($));
      const x = u.trait_contexts?.[E];
      if (x && Array.isArray(x.targets)) {
        const $ = x.targets.filter((B) => !i.has(B.agent_id));
        u.trait_contexts = { ...u.trait_contexts, [E]: { ...x, targets: $ } }, $.length || (u.traits = u.traits.filter((B) => B !== E));
      }
    }
    try {
      let i = v || "";
      if (v) {
        const { data: x } = await Q.put(`/api/v1/user-agents/${v}`, u);
        if (!x?.success) throw new Error(x?.error || "save failed");
      } else {
        const { data: x } = await Q.post("/api/v1/user-agents", { ...u, parent_id: l() || void 0 });
        if (!x?.success) throw new Error(x?.error || "create failed");
        i = x.component_id || "";
      }
      g(i);
    } catch (i) {
      d.value = ue(i, "save failed");
    } finally {
      I.value = !1;
    }
  }
  return { loading: R, saving: I, error: d, loadAgent: _, save: r };
}
const Ke = { class: "kx-modal-head" }, Xe = { class: "kx-modal-head-icon" }, Ye = { class: "kx-modal-head-text" }, Qe = { class: "kx-modal-head-title" }, Ze = { class: "kx-modal-head-sub" }, et = {
  key: 0,
  class: "kx-2p"
}, tt = { class: "kx-loading" }, at = {
  key: 1,
  class: "kx-2p"
}, nt = { class: "kx-2p-l" }, st = { class: "kx-form" }, lt = { class: "kx-field" }, ot = { class: "kx-name-row" }, it = { class: "kx-field" }, rt = { class: "kx-2p-r" }, dt = { class: "kx-2p-r-head" }, ut = { class: "kx-2p-r-body" }, ct = {
  key: 0,
  class: "kx-form kx-form-grow"
}, pt = { class: "kx-field kx-field-grow" }, mt = {
  key: 1,
  class: "kx-form"
}, vt = { class: "kx-field" }, gt = ["value"], kt = { class: "kx-field" }, _t = ["max"], ft = {
  key: 0,
  class: "kx-field-err"
}, xt = { class: "kx-field" }, ht = { class: "kx-toggle" }, bt = {
  key: 0,
  class: "kx-think"
}, yt = { class: "kx-field-hint-inline" }, Ct = { class: "kx-field" }, wt = {
  key: 0,
  class: "kx-toggle"
}, At = {
  key: 1,
  class: "kx-sec-foot"
}, It = {
  key: 2,
  class: "kx-think"
}, St = { class: "kx-field-hint-inline" }, Et = {
  key: 2,
  class: "kx-form"
}, Rt = {
  key: 0,
  class: "kx-group",
  "aria-label": "Existing direct tools"
}, Vt = { class: "kx-group-head" }, Mt = { class: "kx-group-meta" }, Tt = { class: "kx-direct-tools" }, $t = ["data-tool-id"], Ot = ["aria-label", "onClick"], Nt = {
  key: 3,
  class: "kx-form"
}, Bt = {
  class: "kx-seg",
  role: "tablist"
}, jt = ["aria-selected"], Dt = {
  key: 0,
  class: "kx-seg-count"
}, Ut = ["aria-selected"], Lt = {
  key: 0,
  class: "kx-seg-count"
}, Pt = ["selected"], Ft = ["selected"], Wt = {
  key: 0,
  class: "kx-redirect-comments"
}, zt = { class: "kx-redirect-comment-name" }, Jt = ["value", "onInput"], qt = { class: "kx-modal-foot" }, Gt = {
  key: 0,
  class: "kx-err inline kx-foot-err"
}, Ht = {
  key: 1,
  class: "kx-embed"
}, Kt = {
  class: "kx-modal kx-modal-agent kx-modal-embed",
  role: "dialog",
  "aria-modal": "true"
}, sa = /* @__PURE__ */ W({
  __name: "AgentForm",
  props: {
    open: { type: Boolean },
    embedded: { type: Boolean },
    agentId: {},
    traits: {},
    tools: {},
    models: {},
    agents: {},
    parentId: {}
  },
  emits: ["close", "saved"],
  setup(a, { emit: C }) {
    const k = Te(), f = W({
      setup(c, { slots: e }) {
        return k.value = e.default, () => {
        };
      }
    }), w = W({
      render() {
        return k.value ? k.value() : null;
      }
    }), l = a, b = C, E = h(() => {
      switch (g.value) {
        case "model":
          return "Model";
        case "caps":
          return "Capabilities";
        case "routing":
          return "Routing";
        default:
          return "Prompt";
      }
    }), g = N("prompt"), R = ["fast", "nano", "balanced", "premium"], I = h(() => {
      const c = /* @__PURE__ */ new Set();
      for (const e of l.models) for (const s of e.class || []) c.add(s);
      return [...c].sort((e, s) => {
        const V = R.indexOf(e), Y = R.indexOf(s);
        return (V < 0 ? 99 : V) - (Y < 0 ? 99 : Y) || e.localeCompare(s);
      });
    });
    function d() {
      return I.value.includes("fast") ? "class:fast" : I.value.length ? "class:" + I.value[0] : l.models[0]?.name || "";
    }
    function _(c = !0) {
      return {
        title: "",
        description: "",
        icon: "tabler:robot",
        prompt: "",
        public: !1,
        model: d(),
        temperature: null,
        max_tokens: 8e3,
        thinking_effort: null,
        traits: c ? [Je, qe] : [],
        trait_contexts: {},
        trait_agent_options: {},
        tools: [],
        delegates: [],
        memory_target_id: "",
        memory_provider_id: ""
      };
    }
    const n = N(_()), r = h(() => !!l.agentId), u = h(() => n.value.tools.map((c) => ({
      id: c,
      title: l.tools.find((e) => e.id === c)?.title || c
    }))), v = h({
      get: () => l.open,
      set: (c) => {
        c || b("close");
      }
    }), i = N(null);
    function x() {
      $e(() => i.value?.focus({ preventScroll: !0 }));
    }
    const $ = h({
      get: () => Math.round((n.value.temperature ?? 0.5) * 50),
      set: (c) => {
        n.value.temperature = Math.max(0, Math.min(2, (Number(c) || 0) / 50));
      }
    }), B = h({
      get: () => n.value.temperature !== null,
      set: (c) => {
        n.value.temperature = c ? n.value.temperature ?? 0.5 : null;
      }
    }), G = h(() => n.value.model.startsWith("class:") ? l.models.filter((c) => c.class?.includes(n.value.model.slice(6))) : l.models.filter((c) => c.name === n.value.model)), H = h(() => {
      const c = G.value.map((e) => e.output_tokens).filter((e) => typeof e == "number" && Number.isFinite(e) && e > 0);
      return c.length ? Math.min(...c) : 128e3;
    }), ne = h(() => !P.value && (G.value.length === 0 || G.value.some((c) => !c.capabilities?.includes("reasoning")))), pe = h(() => P.value ? "Extended thinking sets its own temperature." : "The selected models reason instead of sampling, so temperature is not applied."), K = h(() => !Number.isInteger(n.value.max_tokens) || n.value.max_tokens < 1 || n.value.max_tokens > H.value), se = h(() => n.value.title.trim().length > 0 && !!n.value.model && !K.value), me = He({
      form: n,
      valid: se,
      tab: g,
      blank: _,
      agentId: () => l.agentId,
      parentId: () => l.parentId,
      models: () => l.models,
      redirectTrait: Z,
      emitSaved: (c) => b("saved", c)
    }), { loading: ve, saving: z, error: X, loadAgent: ge, save: ke } = me;
    te(() => l.models, () => {
      !r.value && !n.value.model && (n.value.model = d());
    }, { immediate: !0 }), ce(() => {
      ae("wc-model-picker", { timeoutMs: 8e3 }).catch(() => {
      }), ae("wc-agent-picker", { timeoutMs: 8e3 }).catch(() => {
      });
    });
    function _e(c) {
      n.value.model = c.detail;
    }
    const P = h({
      get: () => n.value.thinking_effort !== null,
      set: (c) => {
        n.value.thinking_effort = c ? n.value.thinking_effort ?? 50 : null;
      }
    }), { selectableTraits: fe, selectedCapabilities: xe, activeTraits: le, traitMountConfig: he, onTraitConfig: be, onCapabilitiesChange: ye } = ze({ form: n, traits: () => l.traits, redirectTrait: Z }), Ce = Ge({
      form: n,
      agentId: () => l.agentId,
      agents: () => l.agents,
      redirectTrait: Z
    }), {
      routeView: O,
      pickIds: oe,
      onDelegatesChange: we,
      redirectTargets: j,
      redirectSelectedIds: Ae,
      onRedirectsChange: Ie,
      redirectLabel: Se,
      setRedirectCommentById: Ee
    } = Ce;
    te(() => [l.open, l.agentId], ([c]) => {
      c && (g.value = "prompt", O.value = "delegates", X.value = "", l.agentId ? ge(l.agentId) : n.value = _());
    }, { immediate: !0 });
    const Re = h(() => [
      { key: "prompt", label: "Prompt", icon: "tabler:keyboard", meta: n.value.prompt.trim() ? "•" : "" },
      { key: "model", label: "Model", icon: "tabler:cpu", meta: "" },
      { key: "caps", label: "Capabilities", icon: "tabler:puzzle", meta: le.value.length ? String(le.value.length) : "" },
      { key: "routing", label: "Routing", icon: "tabler:arrows-split-2", meta: n.value.delegates.length + j.value.length ? String(n.value.delegates.length + j.value.length) : "" }
    ]);
    return (c, e) => (p(), m(L, null, [
      y(o(f), null, {
        default: J(() => [
          t("div", Ke, [
            t("span", Xe, [
              y(o(T), {
                icon: n.value.icon || "tabler:robot",
                "aria-hidden": "true"
              }, null, 8, ["icon"])
            ]),
            t("span", Ye, [
              t("span", Qe, A(r.value ? "Edit agent" : "New agent"), 1),
              t("span", Ze, A(n.value.title.trim() || "Configure persona, model and capabilities."), 1)
            ]),
            t("button", {
              class: "kx-modal-x",
              "aria-label": "Close",
              onClick: e[0] || (e[0] = (s) => b("close"))
            }, [
              y(o(T), {
                icon: "tabler:x",
                "aria-hidden": "true"
              })
            ])
          ]),
          o(ve) ? (p(), m("div", et, [
            t("div", tt, [
              y(o(T), {
                icon: "tabler:loader-2",
                class: "spin",
                "aria-hidden": "true"
              }),
              e[17] || (e[17] = M(" Loading…", -1))
            ])
          ])) : (p(), m("div", at, [
            t("div", nt, [
              t("div", st, [
                t("div", lt, [
                  e[18] || (e[18] = t("span", { class: "kx-field-lbl" }, "Name", -1)),
                  t("div", ot, [
                    y(We, {
                      class: "kx-name-icon",
                      modelValue: n.value.icon,
                      "onUpdate:modelValue": e[1] || (e[1] = (s) => n.value.icon = s),
                      fallback: "tabler:robot"
                    }, null, 8, ["modelValue"]),
                    D(t("input", {
                      ref_key: "agentNameInput",
                      ref: i,
                      "onUpdate:modelValue": e[2] || (e[2] = (s) => n.value.title = s),
                      class: "kx-input",
                      "data-agent-name": "",
                      "aria-label": "Agent name",
                      placeholder: "e.g. Research assistant"
                    }, null, 512), [
                      [U, n.value.title]
                    ])
                  ])
                ]),
                t("label", it, [
                  e[19] || (e[19] = t("span", { class: "kx-field-lbl" }, [
                    M("Description "),
                    t("span", { class: "kx-field-hint-inline" }, "— shown in pickers")
                  ], -1)),
                  D(t("textarea", {
                    "onUpdate:modelValue": e[3] || (e[3] = (s) => n.value.description = s),
                    class: "kx-input kx-textarea kx-textarea-sm",
                    rows: "2",
                    placeholder: "What this agent is for."
                  }, null, 512), [
                    [U, n.value.description]
                  ])
                ])
              ]),
              y(Fe, {
                items: Re.value,
                active: g.value,
                onSelect: e[4] || (e[4] = (s) => g.value = s)
              }, null, 8, ["items", "active"])
            ]),
            t("div", rt, [
              t("div", dt, A(E.value), 1),
              t("div", ut, [
                g.value === "prompt" ? (p(), m("div", ct, [
                  t("label", pt, [
                    e[20] || (e[20] = t("span", { class: "kx-field-lbl" }, [
                      M("System prompt "),
                      t("span", { class: "kx-field-hint-inline" }, "— the agent's persona and instructions")
                    ], -1)),
                    D(t("textarea", {
                      "onUpdate:modelValue": e[5] || (e[5] = (s) => n.value.prompt = s),
                      class: "kx-input kx-textarea kx-textarea-lg",
                      placeholder: "You are a helpful assistant that…"
                    }, null, 512), [
                      [U, n.value.prompt]
                    ])
                  ]),
                  e[21] || (e[21] = t("p", { class: "kx-sec-foot" }, "Keep the prompt clear and operational. Capabilities and routing are configured in their own sections.", -1))
                ])) : g.value === "model" ? (p(), m("div", mt, [
                  t("div", vt, [
                    e[22] || (e[22] = t("span", { class: "kx-field-lbl" }, "Model", -1)),
                    t("wc-model-picker", {
                      value: n.value.model || "",
                      onSelect: _e
                    }, null, 40, gt)
                  ]),
                  t("label", kt, [
                    e[23] || (e[23] = t("span", { class: "kx-field-lbl" }, [
                      M("Max tokens "),
                      t("span", { class: "kx-field-hint-inline" }, "— response length cap")
                    ], -1)),
                    D(t("input", {
                      "onUpdate:modelValue": e[6] || (e[6] = (s) => n.value.max_tokens = s),
                      type: "number",
                      min: "1",
                      max: H.value,
                      step: "1",
                      class: F(["kx-input", K.value && "kx-input-err"])
                    }, null, 10, _t), [
                      [
                        U,
                        n.value.max_tokens,
                        void 0,
                        { number: !0 }
                      ]
                    ]),
                    K.value ? (p(), m("span", ft, "Must be between 1 and " + A(H.value) + ".", 1)) : S("", !0)
                  ]),
                  t("div", xt, [
                    t("div", ht, [
                      y(o(de), {
                        modelValue: P.value,
                        "onUpdate:modelValue": e[7] || (e[7] = (s) => P.value = s),
                        "input-id": "agent-thinking"
                      }, null, 8, ["modelValue"]),
                      e[24] || (e[24] = t("label", {
                        for: "agent-thinking",
                        class: "kx-toggle-copy"
                      }, [
                        t("span", { class: "kx-field-lbl" }, "Extended thinking")
                      ], -1))
                    ]),
                    P.value ? (p(), m("div", bt, [
                      t("span", yt, "Effort: " + A(n.value.thinking_effort) + "%", 1),
                      D(t("input", {
                        "onUpdate:modelValue": e[8] || (e[8] = (s) => n.value.thinking_effort = s),
                        type: "range",
                        min: "0",
                        max: "100",
                        step: "5",
                        class: "kx-range"
                      }, null, 512), [
                        [
                          U,
                          n.value.thinking_effort,
                          void 0,
                          { number: !0 }
                        ]
                      ])
                    ])) : S("", !0)
                  ]),
                  t("div", Ct, [
                    ne.value ? (p(), m("div", wt, [
                      y(o(de), {
                        modelValue: B.value,
                        "onUpdate:modelValue": e[9] || (e[9] = (s) => B.value = s),
                        "input-id": "agent-temperature"
                      }, null, 8, ["modelValue"]),
                      e[25] || (e[25] = t("label", {
                        for: "agent-temperature",
                        class: "kx-toggle-copy"
                      }, [
                        t("span", { class: "kx-field-lbl" }, "Custom temperature")
                      ], -1))
                    ])) : (p(), m("p", At, A(pe.value), 1)),
                    ne.value && B.value ? (p(), m("div", It, [
                      t("span", St, A($.value) + "% · higher is more creative · unsupported on most current models", 1),
                      D(t("input", {
                        "onUpdate:modelValue": e[10] || (e[10] = (s) => $.value = s),
                        type: "range",
                        min: "0",
                        max: "100",
                        step: "1",
                        class: "kx-range"
                      }, null, 512), [
                        [
                          U,
                          $.value,
                          void 0,
                          { number: !0 }
                        ]
                      ])
                    ])) : S("", !0)
                  ])
                ])) : g.value === "caps" ? (p(), m("div", Et, [
                  y(Be, {
                    traits: o(fe),
                    tools: a.tools,
                    selected: o(xe),
                    onChange: o(ye)
                  }, {
                    config: J(({ trait: s }) => [
                      s.web_component ? (p(), ie(Ne, {
                        key: 0,
                        tag: s.web_component,
                        config: o(he)(s.id),
                        schema: s.context_schema,
                        provider: s.provider,
                        onChange: (V) => o(be)(s.id, V)
                      }, null, 8, ["tag", "config", "schema", "provider", "onChange"])) : S("", !0)
                    ]),
                    _: 1
                  }, 8, ["traits", "tools", "selected", "onChange"]),
                  n.value.tools.length ? (p(), m("section", Rt, [
                    t("div", Vt, [
                      e[26] || (e[26] = t("span", { class: "kx-group-title" }, "Existing direct tools", -1)),
                      t("span", Mt, A(n.value.tools.length), 1)
                    ]),
                    t("ul", Tt, [
                      (p(!0), m(L, null, ee(u.value, ({ id: s, title: V }) => (p(), m("li", {
                        key: s,
                        "data-tool-id": s
                      }, [
                        t("span", null, A(V), 1),
                        t("button", {
                          type: "button",
                          class: "kx-trait-x",
                          "aria-label": `Remove ${V} tool`,
                          onClick: (Y) => n.value.tools = n.value.tools.filter((Ve) => Ve !== s)
                        }, [
                          y(o(T), {
                            icon: "tabler:x",
                            "aria-hidden": "true"
                          })
                        ], 8, Ot)
                      ], 8, $t))), 128))
                    ])
                  ])) : S("", !0)
                ])) : g.value === "routing" ? (p(), m("div", Nt, [
                  t("div", Bt, [
                    t("button", {
                      type: "button",
                      role: "tab",
                      class: F(["kx-seg-btn", o(O) === "delegates" && "kx-seg-btn-on"]),
                      "aria-selected": o(O) === "delegates",
                      onClick: e[11] || (e[11] = (s) => O.value = "delegates")
                    }, [
                      y(o(T), {
                        icon: "tabler:arrow-ramp-right-3",
                        "aria-hidden": "true"
                      }),
                      e[27] || (e[27] = M(" Delegates ", -1)),
                      n.value.delegates.length ? (p(), m("span", Dt, A(n.value.delegates.length), 1)) : S("", !0)
                    ], 10, jt),
                    t("button", {
                      type: "button",
                      role: "tab",
                      class: F(["kx-seg-btn", o(O) === "redirects" && "kx-seg-btn-on"]),
                      "aria-selected": o(O) === "redirects",
                      onClick: e[12] || (e[12] = (s) => O.value = "redirects")
                    }, [
                      y(o(T), {
                        icon: "tabler:arrows-split-2",
                        "aria-hidden": "true"
                      }),
                      e[28] || (e[28] = M(" Redirects ", -1)),
                      o(j).length ? (p(), m("span", Lt, A(o(j).length), 1)) : S("", !0)
                    ], 10, Ut)
                  ]),
                  o(O) === "delegates" ? (p(), m(L, { key: 0 }, [
                    e[29] || (e[29] = t("p", { class: "kx-sec-foot" }, "When this agent decides a task belongs to another, it can hand off while keeping the chat. Pick the agents it may delegate to.", -1)),
                    t("wc-agent-picker", {
                      placeholder: "Search agents to delegate to…",
                      selected: JSON.stringify(n.value.delegates),
                      onChange: e[13] || (e[13] = (s) => o(we)(o(oe)(s)))
                    }, null, 40, Pt)
                  ], 64)) : (p(), m(L, { key: 1 }, [
                    e[30] || (e[30] = t("p", { class: "kx-sec-foot" }, [
                      M("A redirect is not a delegate: it "),
                      t("strong", null, "transfers the whole chat"),
                      M(" — the target agent takes over and this one stops. Pick the agents it may hand off to, and note when (injected into the prompt).")
                    ], -1)),
                    t("wc-agent-picker", {
                      placeholder: "Search agents to redirect to…",
                      selected: JSON.stringify(o(Ae)),
                      onChange: e[14] || (e[14] = (s) => o(Ie)(o(oe)(s)))
                    }, null, 40, Ft),
                    o(j).length ? (p(), m("div", Wt, [
                      (p(!0), m(L, null, ee(o(j), (s) => (p(), m("div", {
                        key: s.agent_id,
                        class: "kx-redirect-comment-row"
                      }, [
                        t("span", zt, [
                          y(o(T), {
                            icon: "tabler:arrows-split-2",
                            "aria-hidden": "true"
                          }),
                          M(" " + A(o(Se)(s.agent_id)), 1)
                        ]),
                        t("input", {
                          value: s.comment,
                          class: "kx-input kx-redirect-comment",
                          placeholder: "When to redirect here (injected into the prompt)…",
                          onInput: (V) => o(Ee)(s.agent_id, V.target.value)
                        }, null, 40, Jt)
                      ]))), 128))
                    ])) : S("", !0)
                  ], 64))
                ])) : S("", !0)
              ])
            ])
          ])),
          t("div", qt, [
            o(X) ? (p(), m("div", Gt, A(o(X)), 1)) : S("", !0),
            y(o(re), {
              type: "button",
              label: "Cancel",
              severity: "secondary",
              outlined: "",
              disabled: o(z),
              onClick: e[15] || (e[15] = (s) => b("close"))
            }, null, 8, ["disabled"]),
            y(o(re), {
              type: "button",
              "data-testid": "agent-form-save",
              label: o(z) ? r.value ? "Saving…" : "Creating…" : r.value ? "Save changes" : "Create agent",
              loading: o(z),
              disabled: o(z) || !se.value,
              onClick: o(ke)
            }, {
              icon: J(({ class: s }) => [
                y(o(T), {
                  icon: r.value ? "tabler:device-floppy" : "tabler:plus",
                  class: F(s),
                  "aria-hidden": "true"
                }, null, 8, ["icon", "class"])
              ]),
              _: 1
            }, 8, ["label", "loading", "disabled", "onClick"])
          ])
        ]),
        _: 1
      }),
      a.embedded ? a.open ? (p(), m("div", Ht, [
        t("div", Kt, [
          y(o(w))
        ])
      ])) : S("", !0) : (p(), ie(o(Oe), {
        key: 0,
        visible: v.value,
        "onUpdate:visible": e[16] || (e[16] = (s) => v.value = s),
        modal: "",
        "block-scroll": "",
        "show-header": !1,
        "dismissable-mask": !0,
        draggable: !1,
        pt: { root: { class: "kx-modal kx-modal-agent", role: "dialog", "aria-modal": "true", "aria-label": r.value ? "Edit agent" : "New agent" }, content: { class: "kx-modal-content" } },
        onShow: x
      }, {
        default: J(() => [
          y(o(w))
        ]),
        _: 1
      }, 8, ["visible", "pt"]))
    ], 64));
  }
});
export {
  sa as _,
  ue as e
};
//# sourceMappingURL=AgentForm.vue_vue_type_script_setup_true_lang-BFkHUx4K.js.map

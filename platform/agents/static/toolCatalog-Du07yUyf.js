import { defineComponent as G, openBlock as d, createElementBlock as c, Fragment as D, renderList as F, normalizeClass as B, createElementVNode as e, createVNode as y, unref as s, toDisplayString as x, createCommentVNode as A, ref as E, computed as C, withDirectives as W, vModelText as H, onMounted as Re, watch as ue, onBeforeUnmount as Ke, nextTick as me, shallowRef as Je, withCtx as re, createTextVNode as P, isRef as Ae, createBlock as Ge } from "vue";
import { Icon as L } from "@iconify/vue";
import ge from "primevue/button";
import Xe from "primevue/dialog";
import Ie from "primevue/toggleswitch";
import { loadByTagName as ke, api as ce } from "@wippy-fe/proxy";
import { u as Ye, b as Ze, t as et, W as tt } from "./trait-presentation-lBqZZyB5.js";
import at from "primevue/checkbox";
import { _ as st } from "./AnchoredPanel.vue_vue_type_style_index_0_lang-DSLnUKFT.js";
const nt = {
  class: "kx-nav",
  role: "tablist",
  "aria-label": "Agent sections"
}, lt = ["aria-selected", "onClick"], ot = { class: "kx-nav-ico" }, it = { class: "kx-nav-lbl" }, rt = {
  key: 0,
  class: "kx-nav-meta"
}, dt = /* @__PURE__ */ G({
  __name: "AgentNav",
  props: {
    items: {},
    active: {}
  },
  emits: ["select"],
  setup(o, { emit: I }) {
    const f = I;
    return (h, T) => (d(), c("nav", nt, [
      (d(!0), c(D, null, F(o.items, (u) => (d(), c("button", {
        key: u.key,
        type: "button",
        role: "tab",
        class: B(["kx-nav-item", o.active === u.key && "kx-nav-item-on"]),
        "aria-selected": o.active === u.key,
        onClick: (w) => f("select", u.key)
      }, [
        e("span", ot, [
          y(s(L), {
            icon: u.icon,
            "aria-hidden": "true"
          }, null, 8, ["icon"])
        ]),
        e("span", it, x(u.label), 1),
        u.meta ? (d(), c("span", rt, x(u.meta), 1)) : A("", !0)
      ], 10, lt))), 128))
    ]));
  }
}), ct = {
  class: "tool-reference",
  "aria-label": "Tool reference"
}, ut = { class: "kx-field" }, pt = { class: "tool-reference__list" }, vt = ["data-tool-id"], mt = { class: "tool-reference__title" }, gt = { key: 0 }, kt = { class: "tool-reference__description" }, ft = { key: 0 }, _t = {
  key: 0,
  class: "kx-sec-foot"
}, xt = { "aria-label": "Tool combinations" }, ht = ["data-trait-id"], bt = {
  key: 0,
  class: "tool-reference__description"
}, yt = {
  key: 1,
  class: "tool-reference__description"
}, wt = { class: "tool-reference__list" }, Ct = { class: "tool-reference__description" }, Tt = {
  key: 0,
  class: "kx-sec-foot"
}, $t = /* @__PURE__ */ G({
  __name: "ToolReference",
  props: {
    tools: {},
    traits: {},
    selected: {},
    activeTraits: {},
    selectableIds: {}
  },
  emits: ["change", "addCapability"],
  setup(o, { emit: I }) {
    const f = o, h = I, T = E(""), u = C(() => T.value.trim().toLowerCase());
    function w(_) {
      return [_.id, _.title, _.llm_alias, _.llm_description].some((n) => n?.toLowerCase().includes(u.value));
    }
    const $ = C(() => f.tools.filter(w)), g = C(() => new Set(f.selectableIds ?? f.traits.map((_) => _.id)));
    function M(_) {
      const n = /* @__PURE__ */ new Map();
      for (const l of _.tools || []) {
        const p = new RegExp("^" + l.split("*").map((i) => i.replace(/[.+?^${}()|[\]\\]/g, "\\$&")).join(".*") + "$"), v = f.tools.filter((i) => p.test(i.id));
        v.length || n.set(l, { id: l });
        for (const i of v) n.set(i.id, { id: i.id, tool: i });
      }
      return [...n.values()];
    }
    const S = C(() => f.traits.filter((_) => _.tools?.length).map((_) => ({ trait: _, tools: M(_) })).filter(({ trait: _, tools: n }) => !u.value || [_.id, _.title, _.description, _.prompt].some((l) => l?.toLowerCase().includes(u.value)) || n.some(({ id: l, tool: p }) => p ? w(p) : l.toLowerCase().includes(u.value))));
    function O(_, n) {
      h("change", n ? [...f.selected, _] : f.selected.filter((l) => l !== _));
    }
    return (_, n) => (d(), c("section", ct, [
      e("label", ut, [
        n[1] || (n[1] = e("span", { class: "kx-field-lbl" }, "Search tools and combinations", -1)),
        W(e("input", {
          "onUpdate:modelValue": n[0] || (n[0] = (l) => T.value = l),
          class: "kx-input",
          type: "search",
          "aria-label": "Search tool reference",
          placeholder: "Search names, descriptions or aliases…"
        }, null, 512), [
          [H, T.value]
        ])
      ]),
      n[5] || (n[5] = e("p", { class: "kx-sec-foot" }, "Descriptions and guidance below come from the installed tools and capabilities.", -1)),
      n[6] || (n[6] = e("h3", { class: "kx-group-title" }, "Tools", -1)),
      e("ul", pt, [
        (d(!0), c(D, null, F($.value, (l) => (d(), c("li", {
          key: l.id,
          "data-tool-id": l.id,
          class: "tool-reference__item"
        }, [
          e("div", mt, [
            y(s(at), {
              "model-value": o.selected.includes(l.id),
              binary: "",
              "aria-label": `Select ${l.title || l.id}`,
              "onUpdate:modelValue": (p) => O(l.id, p === !0)
            }, null, 8, ["model-value", "aria-label", "onUpdate:modelValue"]),
            e("strong", null, x(l.title || l.id), 1),
            l.llm_alias ? (d(), c("code", gt, x(l.llm_alias), 1)) : A("", !0)
          ]),
          e("p", kt, x(l.llm_description || "No description declared."), 1),
          l.input_schema ? (d(), c("details", ft, [
            n[2] || (n[2] = e("summary", null, "Declared inputs", -1)),
            e("pre", null, x(JSON.stringify(l.input_schema, null, 2)), 1)
          ])) : A("", !0)
        ], 8, vt))), 128))
      ]),
      $.value.length ? A("", !0) : (d(), c("p", _t, "No matching tools.")),
      e("section", xt, [
        n[3] || (n[3] = e("h3", { class: "kx-group-title" }, "Tool combinations", -1)),
        n[4] || (n[4] = e("p", { class: "kx-sec-foot" }, "Adding a capability includes its declared tools automatically.", -1)),
        (d(!0), c(D, null, F(S.value, ({ trait: l, tools: p }) => (d(), c("details", {
          key: l.id,
          "data-trait-id": l.id,
          class: "tool-reference__item"
        }, [
          e("summary", null, x(l.title || l.id), 1),
          l.description ? (d(), c("p", bt, x(l.description), 1)) : A("", !0),
          l.prompt ? (d(), c("p", yt, x(l.prompt), 1)) : A("", !0),
          e("ul", wt, [
            (d(!0), c(D, null, F(p, ({ id: v, tool: i }) => (d(), c("li", { key: v }, [
              e("strong", null, x(i?.title || v), 1),
              e("p", Ct, x(i?.llm_description || (i ? "No description declared." : "This tool is not in the available catalog.")), 1)
            ]))), 128))
          ]),
          y(s(ge), {
            label: o.activeTraits.includes(l.id) ? "Capability added" : g.value.has(l.id) ? "Add capability" : "Managed in agent settings",
            disabled: o.activeTraits.includes(l.id) || !g.value.has(l.id),
            severity: "secondary",
            outlined: "",
            onClick: (v) => h("addCapability", l.id)
          }, null, 8, ["label", "disabled", "onClick"])
        ], 8, ht))), 128)),
        S.value.length ? A("", !0) : (d(), c("p", Tt, "No matching declared tool combinations."))
      ])
    ]));
  }
}), At = /* @__PURE__ */ G({
  __name: "IconField",
  props: {
    modelValue: {},
    fallback: {}
  },
  emits: ["update:modelValue"],
  setup(o, { emit: I }) {
    const f = o, h = I, T = E(null);
    let u = null;
    function w(g) {
      h("update:modelValue", g.detail || "");
    }
    async function $() {
      if (T.value) {
        u && u.removeEventListener("select", w), T.value.innerHTML = "";
        try {
          customElements.get("wc-icon-picker") || await ke("wc-icon-picker", { timeoutMs: 8e3 });
        } catch {
        }
        T.value && (u = document.createElement("wc-icon-picker"), u.setAttribute("value", f.modelValue || ""), f.fallback && u.setAttribute("fallback", f.fallback), u.addEventListener("select", w), T.value.appendChild(u));
      }
    }
    return Re($), ue(() => f.modelValue, (g) => {
      u && u.getAttribute("value") !== g && u.setAttribute("value", g || "");
    }), Ke(() => {
      u && u.removeEventListener("select", w);
    }), (g, M) => (d(), c("div", {
      ref_key: "host",
      ref: T,
      class: "wc-iconfield"
    }, null, 512));
  }
});
function It({ form: o, traits: I, redirectTrait: f }) {
  const { collapsedTraits: h, isTraitCollapsed: T, toggleTraitCollapsed: u } = Ye(), w = E(!0), $ = C(() => I().filter((r) => r.id !== f)), g = (r) => o.value.traits.includes(r.id), M = C(() => $.value.filter(g));
  function S(r) {
    return !!r && typeof r == "object" && !Array.isArray(r);
  }
  function O(r) {
    const m = S(o.value.trait_contexts[r]) ? o.value.trait_contexts[r] : {}, N = S(o.value.trait_agent_options[r]) ? o.value.trait_agent_options[r] : null;
    return N ? { ...m, agent_options: N } : m;
  }
  function _(r, m) {
    if (S(m) && (Object.prototype.hasOwnProperty.call(m, "context") || Object.prototype.hasOwnProperty.call(m, "agent_options"))) {
      o.value.trait_contexts = { ...o.value.trait_contexts, [r]: S(m.context) ? m.context : {} };
      const Q = { ...o.value.trait_agent_options };
      S(m.agent_options) && Object.keys(m.agent_options).length ? Q[r] = m.agent_options : delete Q[r], o.value.trait_agent_options = Q;
      return;
    }
    o.value.trait_contexts = { ...o.value.trait_contexts, [r]: m };
    const N = { ...o.value.trait_agent_options };
    delete N[r], o.value.trait_agent_options = N;
  }
  const n = E(""), l = E(!1), p = E(null), v = E(null), i = E([]), k = E(-1), U = "agent-capabilities-listbox", V = C(() => {
    const r = n.value.trim().toLowerCase();
    return $.value.filter((m) => !g(m)).filter((m) => !r || (m.title || m.id).toLowerCase().includes(r) || (m.description || "").toLowerCase().includes(r));
  }), X = C(() => k.value >= 0 ? `agent-capability-option-${k.value}` : void 0);
  ue([l, V], ([r, m]) => {
    i.value = [], k.value = r && m.length ? 0 : -1;
  });
  function ne(r, m) {
    r instanceof HTMLElement && (i.value[m] = r);
  }
  function Y(r, m = !1) {
    k.value = r, !(!m || r < 0) && me(() => i.value[r]?.scrollIntoView?.({ block: "nearest" }));
  }
  function Z() {
    l.value = !0, Y(V.value.length ? 0 : -1, !0);
  }
  function le(r) {
    const m = V.value.length;
    if (r.key === "Escape") {
      l.value = !1;
      return;
    }
    if (r.key === "Tab") {
      l.value = !1;
      return;
    }
    if (r.key === "ArrowDown" || r.key === "ArrowUp") {
      if (r.preventDefault(), l.value = !0, !m) return;
      const N = r.key === "ArrowDown" ? 1 : -1, Q = k.value < 0 ? N > 0 ? -1 : 0 : k.value;
      Y((Q + N + m) % m, !0);
      return;
    }
    if (r.key === "Home" || r.key === "End") {
      if (!l.value || !m) return;
      r.preventDefault(), Y(r.key === "Home" ? 0 : m - 1, !0);
      return;
    }
    if (r.key === "Enter" && l.value && k.value >= 0) {
      r.preventDefault();
      const N = V.value[k.value];
      N && oe(N.id);
    }
  }
  function oe(r) {
    o.value.traits.includes(r) || ie(r), n.value = "", l.value = !1, k.value = -1, me(() => v.value?.focus({ preventScroll: !0 }));
  }
  function ie(r) {
    const m = o.value.traits.indexOf(r);
    m >= 0 ? (o.value.traits.splice(m, 1), h.value.has(r) && u(r)) : o.value.traits.push(r);
  }
  function q(r) {
    o.value.tools = [...r];
  }
  return {
    collapsedTraits: h,
    isTraitCollapsed: T,
    toggleTraitCollapsed: u,
    showAdvancedTools: w,
    selectableTraits: $,
    traitOn: g,
    activeTraits: M,
    traitMountConfig: O,
    onTraitConfig: _,
    tintOf: et,
    badgesOf: Ze,
    traitQuery: n,
    traitMenuOpen: l,
    traitAddRoot: p,
    traitSearchInput: v,
    traitActiveIndex: k,
    traitListboxId: U,
    addableTraits: V,
    activeTraitOptionId: X,
    setTraitOptionRef: ne,
    onTraitQueryInput: Z,
    onTraitQueryKeydown: le,
    addTrait: oe,
    toggleTrait: ie,
    onToolsChange: q
  };
}
const ve = "kickside.agents.traits:redirect", St = "kickside.agents.traits:artifacts", Rt = "kickside.uploads.traits:file_manager", de = "user_agent:";
function Et({ form: o, agentId: I, agents: f, redirectTrait: h }) {
  const T = E("delegates");
  function u(l) {
    const p = l.detail;
    return p && Array.isArray(p.selected) ? p.selected.map(String) : [];
  }
  function w(l) {
    const p = new Set([I(), `${de}${I()}`].filter(Boolean));
    o.value.delegates = l.filter((v) => !p.has(v));
  }
  const $ = (l) => l.startsWith(de) ? l.slice(de.length) : l, g = C(() => {
    const l = o.value.trait_contexts[h];
    return l && Array.isArray(l.targets) ? l.targets : [];
  }), M = C(() => g.value.map((l) => l.agent_id));
  function S(l) {
    o.value.trait_contexts = { ...o.value.trait_contexts, [h]: { targets: l } };
    const p = o.value.traits.indexOf(h);
    l.length && p < 0 ? o.value.traits.push(h) : !l.length && p >= 0 && o.value.traits.splice(p, 1);
  }
  function O(l) {
    const p = new Set([I(), `${de}${I()}`].filter(Boolean)), v = l.filter((k) => !p.has(k)), i = new Map(g.value.map((k) => [k.agent_id, k.comment]));
    S(v.map((k) => ({ agent_id: k, comment: i.get(k) || "" })));
  }
  function _(l) {
    const p = $(l);
    return f().find((v) => v.id === p)?.title || p;
  }
  function n(l, p) {
    S(g.value.map((v) => v.agent_id === l ? { ...v, comment: p } : v));
  }
  return { routeView: T, pickIds: u, onDelegatesChange: w, redirectTargets: g, redirectSelectedIds: M, setRedirects: S, onRedirectsChange: O, redirectLabel: _, setRedirectCommentById: n };
}
function Se(o, I) {
  if (o && typeof o == "object") {
    const f = o, h = f.response?.data?.error;
    if (typeof h == "string") return h;
    if (h && typeof h == "object" && typeof h.message == "string")
      return h.message;
    if (typeof f.message == "string" && f.message) return f.message;
  }
  return I;
}
function Ot({ form: o, valid: I, tab: f, blank: h, agentId: T, parentId: u, models: w, redirectTrait: $, emitSaved: g }) {
  const M = E(!1), S = E(!1), O = E("");
  async function _(p) {
    M.value = !0, o.value = h(!1);
    try {
      const { data: v } = await ce.get(`/api/v1/user-agents/${p}`);
      if (v?.success && v.agent) {
        const i = v.agent;
        o.value = {
          title: i.title || "",
          description: i.description || "",
          icon: i.icon || "tabler:robot",
          public: i.public === !0,
          prompt: i.prompt || "",
          model: i.model || w()[0]?.name || "",
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
      O.value = Se(v, "could not load agent");
    } finally {
      M.value = !1;
    }
  }
  function n(p) {
    const v = {};
    for (const i of o.value.traits)
      Object.prototype.hasOwnProperty.call(p, i) && (v[i] = p[i]);
    return v;
  }
  async function l() {
    if (!I.value) {
      O.value = o.value.title.trim() ? "Check the model and token limits." : "Name is required.", o.value.title.trim() && (f.value = "model");
      return;
    }
    S.value = !0, O.value = "";
    const p = {
      title: o.value.title.trim(),
      description: o.value.description,
      icon: o.value.icon,
      public: o.value.public,
      prompt: o.value.prompt,
      model: o.value.model,
      temperature: o.value.temperature ?? !1,
      max_tokens: o.value.max_tokens,
      thinking_effort: o.value.thinking_effort ?? !1,
      traits: o.value.traits,
      trait_contexts: n(o.value.trait_contexts),
      trait_agent_options: n(o.value.trait_agent_options),
      tools: o.value.tools,
      delegates: o.value.delegates,
      memory_target_id: o.value.memory_target_id,
      memory_provider_id: o.value.memory_provider_id
    }, v = T();
    if (v) {
      const i = /* @__PURE__ */ new Set([v, `user_agent:${v}`]);
      p.delegates = p.delegates.filter((U) => !i.has(U));
      const k = p.trait_contexts?.[$];
      if (k && Array.isArray(k.targets)) {
        const U = k.targets.filter((V) => !i.has(V.agent_id));
        p.trait_contexts = { ...p.trait_contexts, [$]: { ...k, targets: U } }, U.length || (p.traits = p.traits.filter((V) => V !== $));
      }
    }
    try {
      let i = v || "";
      if (v) {
        const { data: k } = await ce.put(`/api/v1/user-agents/${v}`, p);
        if (!k?.success) throw new Error(k?.error || "save failed");
      } else {
        const { data: k } = await ce.post("/api/v1/user-agents", { ...p, parent_id: u() || void 0 });
        if (!k?.success) throw new Error(k?.error || "create failed");
        i = k.component_id || "";
      }
      g(i);
    } catch (i) {
      O.value = Se(i, "save failed");
    } finally {
      S.value = !1;
    }
  }
  return { loading: M, saving: S, error: O, loadAgent: _, save: l };
}
const Mt = { class: "kx-modal-head" }, Vt = { class: "kx-modal-head-icon" }, Nt = { class: "kx-modal-head-text" }, Lt = { class: "kx-modal-head-title" }, Dt = { class: "kx-modal-head-sub" }, Ut = {
  key: 0,
  class: "kx-2p"
}, jt = { class: "kx-loading" }, Bt = {
  key: 1,
  class: "kx-2p"
}, Pt = { class: "kx-2p-l" }, Ft = { class: "kx-form" }, zt = { class: "kx-field" }, Wt = { class: "kx-name-row" }, Ht = { class: "kx-field" }, Qt = { class: "kx-2p-r" }, qt = { class: "kx-2p-r-head" }, Kt = { class: "kx-2p-r-body" }, Jt = {
  key: 0,
  class: "kx-form kx-form-grow"
}, Gt = { class: "kx-field kx-field-grow" }, Xt = {
  key: 1,
  class: "kx-form"
}, Yt = { class: "kx-field" }, Zt = ["value"], ea = { class: "kx-field" }, ta = ["max"], aa = {
  key: 0,
  class: "kx-field-err"
}, sa = { class: "kx-field" }, na = { class: "kx-toggle" }, la = {
  key: 0,
  class: "kx-think"
}, oa = { class: "kx-field-hint-inline" }, ia = { class: "kx-field" }, ra = {
  key: 0,
  class: "kx-toggle"
}, da = {
  key: 1,
  class: "kx-sec-foot"
}, ca = {
  key: 2,
  class: "kx-think"
}, ua = { class: "kx-field-hint-inline" }, pa = {
  key: 2,
  class: "kx-form"
}, va = { class: "kx-group" }, ma = { class: "kx-group-head" }, ga = { class: "kx-group-meta" }, ka = ["aria-expanded", "aria-controls", "aria-activedescendant"], fa = ["id"], _a = ["id", "onMouseenter", "onClick"], xa = { class: "kx-tadd-opt-text" }, ha = { class: "kx-trait-name" }, ba = {
  key: 0,
  class: "kx-trait-desc"
}, ya = { class: "kx-trait-badges" }, wa = {
  key: 0,
  class: "kx-tadd-empty"
}, Ca = {
  key: 0,
  class: "kx-traits"
}, Ta = { class: "kx-trait-row" }, $a = { class: "kx-trait-text" }, Aa = { class: "kx-trait-name" }, Ia = {
  key: 0,
  class: "kx-trait-desc"
}, Sa = { class: "kx-trait-badges" }, Ra = { class: "kx-trait-actions" }, Ea = ["aria-expanded", "title", "aria-label", "onClick"], Oa = ["aria-label", "onClick"], Ma = {
  key: 0,
  class: "kx-trait-cfg"
}, Va = {
  key: 1,
  class: "kx-sec-foot"
}, Na = { class: "kx-group" }, La = ["aria-expanded"], Da = { class: "kx-group-meta" }, Ua = {
  key: 3,
  class: "kx-form"
}, ja = {
  class: "kx-seg",
  role: "tablist"
}, Ba = ["aria-selected"], Pa = {
  key: 0,
  class: "kx-seg-count"
}, Fa = ["aria-selected"], za = {
  key: 0,
  class: "kx-seg-count"
}, Wa = ["selected"], Ha = ["selected"], Qa = {
  key: 0,
  class: "kx-redirect-comments"
}, qa = { class: "kx-redirect-comment-name" }, Ka = ["value", "onInput"], Ja = { class: "kx-modal-foot" }, Ga = {
  key: 0,
  class: "kx-err inline kx-foot-err"
}, Xa = {
  key: 1,
  class: "kx-embed"
}, Ya = {
  class: "kx-modal kx-modal-agent kx-modal-embed",
  role: "dialog",
  "aria-modal": "true"
}, rs = /* @__PURE__ */ G({
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
  setup(o, { emit: I }) {
    const f = Je(), h = G({
      setup(b, { slots: t }) {
        return f.value = t.default, () => {
        };
      }
    }), T = G({
      render() {
        return f.value ? f.value() : null;
      }
    }), u = o, w = I, $ = C(() => {
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
    }), g = E("prompt"), M = ["fast", "nano", "balanced", "premium"], S = C(() => {
      const b = /* @__PURE__ */ new Set();
      for (const t of u.models) for (const a of t.class || []) b.add(a);
      return [...b].sort((t, a) => {
        const R = M.indexOf(t), j = M.indexOf(a);
        return (R < 0 ? 99 : R) - (j < 0 ? 99 : j) || t.localeCompare(a);
      });
    });
    function O() {
      return S.value.includes("fast") ? "class:fast" : S.value.length ? "class:" + S.value[0] : u.models[0]?.name || "";
    }
    function _(b = !0) {
      return {
        title: "",
        description: "",
        icon: "tabler:robot",
        prompt: "",
        public: !1,
        model: O(),
        temperature: null,
        max_tokens: 8e3,
        thinking_effort: null,
        traits: b ? [St, Rt] : [],
        trait_contexts: {},
        trait_agent_options: {},
        tools: [],
        delegates: [],
        memory_target_id: "",
        memory_provider_id: ""
      };
    }
    const n = E(_()), l = C(() => !!u.agentId), p = C({
      get: () => u.open,
      set: (b) => {
        b || w("close");
      }
    }), v = E(null);
    function i() {
      me(() => v.value?.focus({ preventScroll: !0 }));
    }
    const k = C({
      get: () => Math.round((n.value.temperature ?? 0.5) * 50),
      set: (b) => {
        n.value.temperature = Math.max(0, Math.min(2, (Number(b) || 0) / 50));
      }
    }), U = C({
      get: () => n.value.temperature !== null,
      set: (b) => {
        n.value.temperature = b ? n.value.temperature ?? 0.5 : null;
      }
    }), V = C(() => n.value.model.startsWith("class:") ? u.models.filter((b) => b.class?.includes(n.value.model.slice(6))) : u.models.filter((b) => b.name === n.value.model)), X = C(() => {
      const b = V.value.map((t) => t.output_tokens).filter((t) => typeof t == "number" && Number.isFinite(t) && t > 0);
      return b.length ? Math.min(...b) : 128e3;
    }), ne = C(() => !ee.value && (V.value.length === 0 || V.value.some((b) => !b.capabilities?.includes("reasoning")))), Y = C(() => ee.value ? "Extended thinking sets its own temperature." : "The selected models reason instead of sampling, so temperature is not applied."), Z = C(() => !Number.isInteger(n.value.max_tokens) || n.value.max_tokens < 1 || n.value.max_tokens > X.value), le = C(() => n.value.title.trim().length > 0 && !!n.value.model && !Z.value), oe = Ot({
      form: n,
      valid: le,
      tab: g,
      blank: _,
      agentId: () => u.agentId,
      parentId: () => u.parentId,
      models: () => u.models,
      redirectTrait: ve,
      emitSaved: (b) => w("saved", b)
    }), { loading: ie, saving: q, error: r, loadAgent: m, save: N } = oe;
    ue(() => u.models, () => {
      !l.value && !n.value.model && (n.value.model = O());
    }, { immediate: !0 }), Re(() => {
      ke("wc-model-picker", { timeoutMs: 8e3 }).catch(() => {
      }), ke("wc-agent-picker", { timeoutMs: 8e3 }).catch(() => {
      });
    });
    function Q(b) {
      n.value.model = b.detail;
    }
    const ee = C({
      get: () => n.value.thinking_effort !== null,
      set: (b) => {
        n.value.thinking_effort = b ? n.value.thinking_effort ?? 50 : null;
      }
    }), Ee = It({ form: n, traits: () => u.traits, redirectTrait: ve }), {
      isTraitCollapsed: te,
      toggleTraitCollapsed: Oe,
      showAdvancedTools: ae,
      selectableTraits: Me,
      activeTraits: se,
      traitMountConfig: Ve,
      onTraitConfig: Ne,
      tintOf: fe,
      badgesOf: _e,
      traitQuery: pe,
      traitMenuOpen: K,
      traitAddRoot: xe,
      traitSearchInput: Le,
      traitActiveIndex: he,
      traitListboxId: be,
      addableTraits: ye,
      activeTraitOptionId: De,
      setTraitOptionRef: Ue,
      onTraitQueryInput: we,
      onTraitQueryKeydown: Ce,
      addTrait: Te,
      toggleTrait: je,
      onToolsChange: Be
    } = Ee, Pe = Et({
      form: n,
      agentId: () => u.agentId,
      agents: () => u.agents,
      redirectTrait: ve
    }), {
      routeView: z,
      pickIds: $e,
      onDelegatesChange: Fe,
      redirectTargets: J,
      redirectSelectedIds: ze,
      onRedirectsChange: We,
      redirectLabel: He,
      setRedirectCommentById: Qe
    } = Pe;
    ue(() => [u.open, u.agentId], ([b]) => {
      b && (g.value = "prompt", z.value = "delegates", r.value = "", u.agentId ? m(u.agentId) : n.value = _());
    }, { immediate: !0 });
    const qe = C(() => [
      { key: "prompt", label: "Prompt", icon: "tabler:keyboard", meta: n.value.prompt.trim() ? "•" : "" },
      { key: "model", label: "Model", icon: "tabler:cpu", meta: "" },
      { key: "caps", label: "Capabilities", icon: "tabler:puzzle", meta: se.value.length ? String(se.value.length) : "" },
      { key: "routing", label: "Routing", icon: "tabler:arrows-split-2", meta: n.value.delegates.length + J.value.length ? String(n.value.delegates.length + J.value.length) : "" }
    ]);
    return (b, t) => (d(), c(D, null, [
      y(s(h), null, {
        default: re(() => [
          e("div", Mt, [
            e("span", Vt, [
              y(s(L), {
                icon: n.value.icon || "tabler:robot",
                "aria-hidden": "true"
              }, null, 8, ["icon"])
            ]),
            e("span", Nt, [
              e("span", Lt, x(l.value ? "Edit agent" : "New agent"), 1),
              e("span", Dt, x(n.value.title.trim() || "Configure persona, model and capabilities."), 1)
            ]),
            e("button", {
              class: "kx-modal-x",
              "aria-label": "Close",
              onClick: t[0] || (t[0] = (a) => w("close"))
            }, [
              y(s(L), {
                icon: "tabler:x",
                "aria-hidden": "true"
              })
            ])
          ]),
          s(ie) ? (d(), c("div", Ut, [
            e("div", jt, [
              y(s(L), {
                icon: "tabler:loader-2",
                class: "spin",
                "aria-hidden": "true"
              }),
              t[23] || (t[23] = P(" Loading…", -1))
            ])
          ])) : (d(), c("div", Bt, [
            e("div", Pt, [
              e("div", Ft, [
                e("div", zt, [
                  t[24] || (t[24] = e("span", { class: "kx-field-lbl" }, "Name", -1)),
                  e("div", Wt, [
                    y(At, {
                      class: "kx-name-icon",
                      modelValue: n.value.icon,
                      "onUpdate:modelValue": t[1] || (t[1] = (a) => n.value.icon = a),
                      fallback: "tabler:robot"
                    }, null, 8, ["modelValue"]),
                    W(e("input", {
                      ref_key: "agentNameInput",
                      ref: v,
                      "onUpdate:modelValue": t[2] || (t[2] = (a) => n.value.title = a),
                      class: "kx-input",
                      "data-agent-name": "",
                      "aria-label": "Agent name",
                      placeholder: "e.g. Research assistant"
                    }, null, 512), [
                      [H, n.value.title]
                    ])
                  ])
                ]),
                e("label", Ht, [
                  t[25] || (t[25] = e("span", { class: "kx-field-lbl" }, [
                    P("Description "),
                    e("span", { class: "kx-field-hint-inline" }, "— shown in pickers")
                  ], -1)),
                  W(e("textarea", {
                    "onUpdate:modelValue": t[3] || (t[3] = (a) => n.value.description = a),
                    class: "kx-input kx-textarea kx-textarea-sm",
                    rows: "2",
                    placeholder: "What this agent is for."
                  }, null, 512), [
                    [H, n.value.description]
                  ])
                ])
              ]),
              y(dt, {
                items: qe.value,
                active: g.value,
                onSelect: t[4] || (t[4] = (a) => g.value = a)
              }, null, 8, ["items", "active"])
            ]),
            e("div", Qt, [
              e("div", qt, x($.value), 1),
              e("div", Kt, [
                g.value === "prompt" ? (d(), c("div", Jt, [
                  e("label", Gt, [
                    t[26] || (t[26] = e("span", { class: "kx-field-lbl" }, [
                      P("System prompt "),
                      e("span", { class: "kx-field-hint-inline" }, "— the agent's persona and instructions")
                    ], -1)),
                    W(e("textarea", {
                      "onUpdate:modelValue": t[5] || (t[5] = (a) => n.value.prompt = a),
                      class: "kx-input kx-textarea kx-textarea-lg",
                      placeholder: "You are a helpful assistant that…"
                    }, null, 512), [
                      [H, n.value.prompt]
                    ])
                  ]),
                  t[27] || (t[27] = e("p", { class: "kx-sec-foot" }, "Keep the prompt clear and operational. Capabilities and routing are configured in their own sections.", -1))
                ])) : g.value === "model" ? (d(), c("div", Xt, [
                  e("div", Yt, [
                    t[28] || (t[28] = e("span", { class: "kx-field-lbl" }, "Model", -1)),
                    e("wc-model-picker", {
                      value: n.value.model || "",
                      onSelect: Q
                    }, null, 40, Zt)
                  ]),
                  e("label", ea, [
                    t[29] || (t[29] = e("span", { class: "kx-field-lbl" }, [
                      P("Max tokens "),
                      e("span", { class: "kx-field-hint-inline" }, "— response length cap")
                    ], -1)),
                    W(e("input", {
                      "onUpdate:modelValue": t[6] || (t[6] = (a) => n.value.max_tokens = a),
                      type: "number",
                      min: "1",
                      max: X.value,
                      step: "1",
                      class: B(["kx-input", Z.value && "kx-input-err"])
                    }, null, 10, ta), [
                      [
                        H,
                        n.value.max_tokens,
                        void 0,
                        { number: !0 }
                      ]
                    ]),
                    Z.value ? (d(), c("span", aa, "Must be between 1 and " + x(X.value) + ".", 1)) : A("", !0)
                  ]),
                  e("div", sa, [
                    e("div", na, [
                      y(s(Ie), {
                        modelValue: ee.value,
                        "onUpdate:modelValue": t[7] || (t[7] = (a) => ee.value = a),
                        "input-id": "agent-thinking"
                      }, null, 8, ["modelValue"]),
                      t[30] || (t[30] = e("label", {
                        for: "agent-thinking",
                        class: "kx-toggle-copy"
                      }, [
                        e("span", { class: "kx-field-lbl" }, "Extended thinking")
                      ], -1))
                    ]),
                    ee.value ? (d(), c("div", la, [
                      e("span", oa, "Effort: " + x(n.value.thinking_effort) + "%", 1),
                      W(e("input", {
                        "onUpdate:modelValue": t[8] || (t[8] = (a) => n.value.thinking_effort = a),
                        type: "range",
                        min: "0",
                        max: "100",
                        step: "5",
                        class: "kx-range"
                      }, null, 512), [
                        [
                          H,
                          n.value.thinking_effort,
                          void 0,
                          { number: !0 }
                        ]
                      ])
                    ])) : A("", !0)
                  ]),
                  e("div", ia, [
                    ne.value ? (d(), c("div", ra, [
                      y(s(Ie), {
                        modelValue: U.value,
                        "onUpdate:modelValue": t[9] || (t[9] = (a) => U.value = a),
                        "input-id": "agent-temperature"
                      }, null, 8, ["modelValue"]),
                      t[31] || (t[31] = e("label", {
                        for: "agent-temperature",
                        class: "kx-toggle-copy"
                      }, [
                        e("span", { class: "kx-field-lbl" }, "Custom temperature")
                      ], -1))
                    ])) : (d(), c("p", da, x(Y.value), 1)),
                    ne.value && U.value ? (d(), c("div", ca, [
                      e("span", ua, x(k.value) + "% · higher is more creative · unsupported on most current models", 1),
                      W(e("input", {
                        "onUpdate:modelValue": t[10] || (t[10] = (a) => k.value = a),
                        type: "range",
                        min: "0",
                        max: "100",
                        step: "1",
                        class: "kx-range"
                      }, null, 512), [
                        [
                          H,
                          k.value,
                          void 0,
                          { number: !0 }
                        ]
                      ])
                    ])) : A("", !0)
                  ])
                ])) : g.value === "caps" ? (d(), c("div", pa, [
                  e("div", va, [
                    e("div", ma, [
                      t[32] || (t[32] = e("span", { class: "kx-group-title" }, "Capabilities", -1)),
                      e("span", ga, x(s(se).length) + " active", 1)
                    ]),
                    e("div", {
                      ref_key: "traitAddRoot",
                      ref: xe,
                      class: "kx-tadd"
                    }, [
                      W(e("input", {
                        ref_key: "traitSearchInput",
                        ref: Le,
                        "onUpdate:modelValue": t[11] || (t[11] = (a) => Ae(pe) ? pe.value = a : null),
                        class: "kx-input kx-tadd-input",
                        type: "text",
                        role: "combobox",
                        "aria-label": "Search capabilities to add",
                        "aria-autocomplete": "list",
                        "aria-expanded": s(K),
                        "aria-controls": s(be),
                        "aria-activedescendant": s(K) ? s(De) : void 0,
                        placeholder: "Search capabilities to add…",
                        onFocus: t[12] || (t[12] = (a) => K.value = !0),
                        onInput: t[13] || (t[13] = //@ts-ignore
                        (...a) => s(we) && s(we)(...a)),
                        onKeydown: t[14] || (t[14] = //@ts-ignore
                        (...a) => s(Ce) && s(Ce)(...a))
                      }, null, 40, ka), [
                        [H, s(pe)]
                      ]),
                      y(st, {
                        open: s(K),
                        "onUpdate:open": t[15] || (t[15] = (a) => Ae(K) ? K.value = a : null),
                        anchor: s(xe)
                      }, {
                        default: re(() => [
                          e("div", {
                            id: s(be),
                            class: "kx-tadd-menu",
                            role: "listbox",
                            "aria-label": "Available capabilities"
                          }, [
                            (d(!0), c(D, null, F(s(ye), (a, R) => (d(), c("button", {
                              key: a.id,
                              id: `agent-capability-option-${R}`,
                              ref_for: !0,
                              ref: (j) => s(Ue)(j, R),
                              type: "button",
                              class: B(["kx-tadd-opt", R === s(he) && "kx-tadd-opt-active"]),
                              tabindex: "-1",
                              role: "option",
                              "aria-selected": !1,
                              onMouseenter: (j) => he.value = R,
                              onClick: (j) => s(Te)(a.id)
                            }, [
                              e("span", {
                                class: B(["kx-trait-ico", `kx-tint-${s(fe)(a)}`])
                              }, [
                                y(s(L), {
                                  icon: a.icon || "tabler:puzzle",
                                  "aria-hidden": "true"
                                }, null, 8, ["icon"])
                              ], 2),
                              e("span", xa, [
                                e("span", ha, x(a.title || a.id), 1),
                                a.description ? (d(), c("span", ba, x(a.description), 1)) : A("", !0)
                              ]),
                              e("span", ya, [
                                (d(!0), c(D, null, F(s(_e)(a), (j) => (d(), c("span", {
                                  key: j.key,
                                  class: B(["kx-badge kx-tag-caps", `kx-badge-${j.key}`])
                                }, x(j.label), 3))), 128))
                              ])
                            ], 42, _a))), 128)),
                            s(ye).length ? A("", !0) : (d(), c("div", wa, "No matching capabilities."))
                          ], 8, fa)
                        ]),
                        _: 1
                      }, 8, ["open", "anchor"])
                    ], 512),
                    s(se).length ? (d(), c("ul", Ca, [
                      (d(!0), c(D, null, F(s(se), (a) => (d(), c("li", {
                        key: a.id,
                        class: "kx-trait"
                      }, [
                        e("div", Ta, [
                          e("span", {
                            class: B(["kx-trait-ico", `kx-tint-${s(fe)(a)}`])
                          }, [
                            y(s(L), {
                              icon: a.icon || "tabler:puzzle",
                              "aria-hidden": "true"
                            }, null, 8, ["icon"])
                          ], 2),
                          e("span", $a, [
                            e("span", Aa, x(a.title || a.id), 1),
                            a.description ? (d(), c("span", Ia, x(a.description), 1)) : A("", !0)
                          ]),
                          e("span", Sa, [
                            (d(!0), c(D, null, F(s(_e)(a), (R) => (d(), c("span", {
                              key: R.key,
                              class: B(["kx-badge kx-tag-caps", `kx-badge-${R.key}`])
                            }, x(R.label), 3))), 128))
                          ]),
                          e("span", Ra, [
                            a.web_component ? (d(), c("button", {
                              key: 0,
                              type: "button",
                              class: "kx-trait-fold",
                              "aria-expanded": !s(te)(a.id),
                              title: s(te)(a.id) ? "Show settings" : "Hide settings",
                              "aria-label": s(te)(a.id) ? "Show settings" : "Hide settings",
                              onClick: (R) => s(Oe)(a.id)
                            }, [
                              y(s(L), {
                                icon: s(te)(a.id) ? "tabler:chevron-right" : "tabler:chevron-down",
                                "aria-hidden": "true"
                              }, null, 8, ["icon"])
                            ], 8, Ea)) : A("", !0),
                            e("button", {
                              type: "button",
                              class: "kx-trait-x",
                              "aria-label": `Remove ${a.title || a.id} capability`,
                              onClick: (R) => s(je)(a.id)
                            }, [
                              y(s(L), {
                                icon: "tabler:x",
                                "aria-hidden": "true"
                              })
                            ], 8, Oa)
                          ])
                        ]),
                        a.web_component && !s(te)(a.id) ? (d(), c("div", Ma, [
                          y(tt, {
                            tag: a.web_component,
                            config: s(Ve)(a.id),
                            provider: a.provider,
                            onChange: (R) => s(Ne)(a.id, R)
                          }, null, 8, ["tag", "config", "provider", "onChange"])
                        ])) : A("", !0)
                      ]))), 128))
                    ])) : (d(), c("p", Va, "No capabilities yet. Add one above to give this agent what it can do."))
                  ]),
                  e("div", Na, [
                    e("button", {
                      type: "button",
                      class: "kx-group-toggle",
                      "aria-expanded": s(ae),
                      onClick: t[16] || (t[16] = (a) => ae.value = !s(ae))
                    }, [
                      y(s(L), {
                        icon: s(ae) ? "tabler:chevron-down" : "tabler:chevron-right",
                        class: "kx-adv-caret",
                        "aria-hidden": "true"
                      }, null, 8, ["icon"]),
                      t[33] || (t[33] = e("span", { class: "kx-group-title" }, "Tools and combinations", -1)),
                      e("span", Da, x(n.value.tools.length) + " selected", 1)
                    ], 8, La),
                    s(ae) ? (d(), c(D, { key: 0 }, [
                      t[34] || (t[34] = e("p", { class: "kx-sec-foot" }, "Capabilities add the tools they need automatically. Pick individual tools only for fine-grained control.", -1)),
                      y($t, {
                        tools: o.tools,
                        traits: o.traits,
                        "selectable-ids": s(Me).map((a) => a.id),
                        selected: n.value.tools,
                        "active-traits": n.value.traits,
                        onChange: s(Be),
                        onAddCapability: s(Te)
                      }, null, 8, ["tools", "traits", "selectable-ids", "selected", "active-traits", "onChange", "onAddCapability"])
                    ], 64)) : A("", !0)
                  ])
                ])) : g.value === "routing" ? (d(), c("div", Ua, [
                  e("div", ja, [
                    e("button", {
                      type: "button",
                      role: "tab",
                      class: B(["kx-seg-btn", s(z) === "delegates" && "kx-seg-btn-on"]),
                      "aria-selected": s(z) === "delegates",
                      onClick: t[17] || (t[17] = (a) => z.value = "delegates")
                    }, [
                      y(s(L), {
                        icon: "tabler:arrow-ramp-right-3",
                        "aria-hidden": "true"
                      }),
                      t[35] || (t[35] = P(" Delegates ", -1)),
                      n.value.delegates.length ? (d(), c("span", Pa, x(n.value.delegates.length), 1)) : A("", !0)
                    ], 10, Ba),
                    e("button", {
                      type: "button",
                      role: "tab",
                      class: B(["kx-seg-btn", s(z) === "redirects" && "kx-seg-btn-on"]),
                      "aria-selected": s(z) === "redirects",
                      onClick: t[18] || (t[18] = (a) => z.value = "redirects")
                    }, [
                      y(s(L), {
                        icon: "tabler:arrows-split-2",
                        "aria-hidden": "true"
                      }),
                      t[36] || (t[36] = P(" Redirects ", -1)),
                      s(J).length ? (d(), c("span", za, x(s(J).length), 1)) : A("", !0)
                    ], 10, Fa)
                  ]),
                  s(z) === "delegates" ? (d(), c(D, { key: 0 }, [
                    t[37] || (t[37] = e("p", { class: "kx-sec-foot" }, "When this agent decides a task belongs to another, it can hand off while keeping the chat. Pick the agents it may delegate to.", -1)),
                    e("wc-agent-picker", {
                      placeholder: "Search agents to delegate to…",
                      selected: JSON.stringify(n.value.delegates),
                      onChange: t[19] || (t[19] = (a) => s(Fe)(s($e)(a)))
                    }, null, 40, Wa)
                  ], 64)) : (d(), c(D, { key: 1 }, [
                    t[38] || (t[38] = e("p", { class: "kx-sec-foot" }, [
                      P("A redirect is not a delegate: it "),
                      e("strong", null, "transfers the whole chat"),
                      P(" — the target agent takes over and this one stops. Pick the agents it may hand off to, and note when (injected into the prompt).")
                    ], -1)),
                    e("wc-agent-picker", {
                      placeholder: "Search agents to redirect to…",
                      selected: JSON.stringify(s(ze)),
                      onChange: t[20] || (t[20] = (a) => s(We)(s($e)(a)))
                    }, null, 40, Ha),
                    s(J).length ? (d(), c("div", Qa, [
                      (d(!0), c(D, null, F(s(J), (a) => (d(), c("div", {
                        key: a.agent_id,
                        class: "kx-redirect-comment-row"
                      }, [
                        e("span", qa, [
                          y(s(L), {
                            icon: "tabler:arrows-split-2",
                            "aria-hidden": "true"
                          }),
                          P(" " + x(s(He)(a.agent_id)), 1)
                        ]),
                        e("input", {
                          value: a.comment,
                          class: "kx-input kx-redirect-comment",
                          placeholder: "When to redirect here (injected into the prompt)…",
                          onInput: (R) => s(Qe)(a.agent_id, R.target.value)
                        }, null, 40, Ka)
                      ]))), 128))
                    ])) : A("", !0)
                  ], 64))
                ])) : A("", !0)
              ])
            ])
          ])),
          e("div", Ja, [
            s(r) ? (d(), c("div", Ga, x(s(r)), 1)) : A("", !0),
            y(s(ge), {
              type: "button",
              label: "Cancel",
              severity: "secondary",
              outlined: "",
              disabled: s(q),
              onClick: t[21] || (t[21] = (a) => w("close"))
            }, null, 8, ["disabled"]),
            y(s(ge), {
              type: "button",
              "data-testid": "agent-form-save",
              label: s(q) ? l.value ? "Saving…" : "Creating…" : l.value ? "Save changes" : "Create agent",
              loading: s(q),
              disabled: s(q) || !le.value,
              onClick: s(N)
            }, {
              icon: re(({ class: a }) => [
                y(s(L), {
                  icon: l.value ? "tabler:device-floppy" : "tabler:plus",
                  class: B(a),
                  "aria-hidden": "true"
                }, null, 8, ["icon", "class"])
              ]),
              _: 1
            }, 8, ["label", "loading", "disabled", "onClick"])
          ])
        ]),
        _: 1
      }),
      o.embedded ? o.open ? (d(), c("div", Xa, [
        e("div", Ya, [
          y(s(T))
        ])
      ])) : A("", !0) : (d(), Ge(s(Xe), {
        key: 0,
        visible: p.value,
        "onUpdate:visible": t[22] || (t[22] = (a) => p.value = a),
        modal: "",
        "block-scroll": "",
        "show-header": !1,
        "dismissable-mask": !0,
        draggable: !1,
        pt: { root: { class: "kx-modal kx-modal-agent", role: "dialog", "aria-modal": "true", "aria-label": l.value ? "Edit agent" : "New agent" }, content: { class: "kx-modal-content" } },
        onShow: i
      }, {
        default: re(() => [
          y(s(T))
        ]),
        _: 1
      }, 8, ["visible", "pt"]))
    ], 64));
  }
});
async function ds() {
  const o = [], I = /* @__PURE__ */ new Set(), f = /* @__PURE__ */ new Set();
  let h;
  do {
    const T = new URLSearchParams({ limit: "100" });
    h && T.set("cursor", h);
    const { data: u } = await ce.get(`/api/v1/agents/tools?${T.toString()}`), w = u;
    if (!w?.success) throw new Error("could not load tools");
    for (const g of w.tools || [])
      g.id && !I.has(g.id) && (I.add(g.id), o.push(g));
    const $ = typeof w.next_cursor == "string" && w.next_cursor ? w.next_cursor : void 0;
    if ($ && f.has($)) throw new Error("tool catalog pagination did not advance");
    $ && f.add($), h = $;
  } while (h);
  return o;
}
export {
  rs as _,
  Se as e,
  ds as l
};
//# sourceMappingURL=toolCatalog-Du07yUyf.js.map

import { defineComponent as Y, ref as k, computed as C, watch as S, onMounted as Z, openBlock as o, createElementBlock as s, createElementVNode as n, toDisplayString as p, withDirectives as tt, vModelText as et, createVNode as f, withCtx as at, Fragment as y, renderList as m, normalizeClass as b, unref as u, createCommentVNode as v, createTextVNode as it, nextTick as H } from "vue";
import { Icon as O } from "@iconify/vue";
import { api as ot } from "@wippy-fe/proxy";
import { a as st, u as nt } from "./wc-runtime-KO3cNuNo.js";
import { _ as rt } from "./WcMount.vue_vue_type_script_setup_true_lang-CNWT59Oh.js";
import { r as lt, u as ct, _ as ut, t as R, b as U } from "./trait-presentation-B3J8cp5c.js";
const dt = {
  class: "kx-agent-trait-picker",
  "data-testid": "agent-trait-picker"
}, pt = { class: "kx-group-head" }, vt = { class: "kx-group-meta" }, kt = ["aria-expanded", "aria-activedescendant"], _t = ["id", "onMouseenter", "onClick"], ft = { class: "kx-trait-option-text" }, xt = { class: "kx-trait-name" }, ht = {
  key: 0,
  class: "kx-trait-description"
}, yt = { class: "kx-trait-badges" }, mt = {
  key: 0,
  class: "kx-trait-empty"
}, bt = {
  key: 0,
  class: "kx-trait-list"
}, gt = ["data-trait-id"], wt = { class: "kx-trait-row" }, Tt = { class: "kx-trait-text" }, At = { class: "kx-trait-name" }, Ct = {
  key: 0,
  class: "kx-trait-id"
}, Ot = { class: "kx-trait-badges" }, $t = { class: "kx-trait-actions" }, It = ["aria-expanded", "aria-label", "onClick"], Et = ["aria-label", "onClick"], Mt = {
  key: 0,
  class: "kx-trait-config kx-trait-details"
}, St = {
  key: 0,
  class: "kx-trait-description"
}, Dt = {
  key: 1,
  class: "kx-trait-description"
}, Lt = {
  key: 2,
  class: "kx-trait-tools",
  "aria-label": "Declared tools"
}, Nt = ["data-declared-tool-id"], Vt = { class: "kx-trait-description" }, zt = {
  key: 1,
  class: "kx-trait-config"
}, Ht = {
  key: 1,
  class: "kx-trait-empty-state"
}, q = "agent-trait-picker-listbox", Bt = /* @__PURE__ */ Y({
  __name: "AgentTraitPicker",
  setup(Rt) {
    const x = st(), K = nt(), h = k([]), P = C(() => new Map(h.value.map((t) => [t.id, lt(t, [])]))), r = k(N(x.value.value)), { isTraitOpen: g, toggleTraitOpen: Q } = ct(() => r.value.traits), $ = C(() => h.value.filter((t) => r.value.traits.includes(t.id))), w = (t) => r.value.traits.includes(t), T = k(""), l = k(!1), D = k(null), L = k(null), I = k([]), d = k(-1);
    let E = 0;
    const _ = C(() => {
      const t = T.value.trim().toLowerCase();
      return h.value.filter((a) => !w(a.id)).filter((a) => !t || (a.title || a.id).toLowerCase().includes(t) || (a.description || "").toLowerCase().includes(t));
    }), j = C(() => d.value >= 0 ? `agent-trait-picker-option-${d.value}` : void 0);
    S([l, _], ([t, a]) => {
      I.value = [], d.value = t && a.length ? 0 : -1;
    }), S(() => x.value.value, (t) => {
      r.value = N(t);
    }), S(() => x.value.refreshKey, (t, a) => {
      t !== a && z();
    });
    function N(t) {
      if (typeof t != "string" || t === "") return { traits: [], trait_contexts: {} };
      try {
        const a = JSON.parse(t);
        if (!a || typeof a != "object" || Array.isArray(a)) return { traits: [], trait_contexts: {} };
        const e = Array.isArray(a.traits) ? a.traits.filter((c) => typeof c == "string") : [], i = a.trait_contexts && typeof a.trait_contexts == "object" && !Array.isArray(a.trait_contexts) ? a.trait_contexts : {};
        return { traits: e, trait_contexts: { ...i } };
      } catch {
        return { traits: [], trait_contexts: {} };
      }
    }
    function A(t) {
      r.value = t, K("change", {
        traits: [...t.traits],
        trait_contexts: { ...t.trait_contexts }
      });
    }
    function B(t, a) {
      t instanceof HTMLElement && (I.value[a] = t);
    }
    function M(t, a = !1) {
      d.value = t, !(!a || t < 0) && H(() => I.value[t]?.scrollIntoView?.({ block: "nearest" }));
    }
    function V(t) {
      w(t) || A({ ...r.value, traits: [...r.value.traits, t] }), T.value = "", x.value.keepMenuOpenOnAdd || (d.value = -1), H(() => {
        L.value?.focus({ preventScroll: !0 }), x.value.keepMenuOpenOnAdd || (l.value = !1);
      });
    }
    function F(t) {
      const a = r.value.traits.filter((i) => i !== t);
      w(t) || a.push(t);
      const e = { ...r.value.trait_contexts };
      if (!w(t)) {
        A({ ...r.value, traits: a, trait_contexts: e });
        return;
      }
      delete e[t], A({ traits: a, trait_contexts: e });
    }
    function J(t, a) {
      A({
        ...r.value,
        trait_contexts: { ...r.value.trait_contexts, [t]: a }
      });
    }
    function G() {
      l.value = !0, M(_.value.length ? 0 : -1, !0);
    }
    function W(t) {
      const a = _.value.length;
      if (t.key === "Escape" || t.key === "Tab") {
        t.key === "Escape" && l.value && t.stopPropagation(), l.value = !1;
        return;
      }
      if (t.key === "ArrowDown" || t.key === "ArrowUp") {
        if (t.preventDefault(), l.value = !0, !a) return;
        const e = t.key === "ArrowDown" ? 1 : -1, i = d.value < 0 ? e > 0 ? -1 : 0 : d.value;
        M((i + e + a) % a, !0);
        return;
      }
      if (t.key === "Home" || t.key === "End") {
        if (!l.value || !a) return;
        t.preventDefault(), M(t.key === "Home" ? 0 : a - 1, !0);
        return;
      }
      if (t.key === "Enter" && l.value && d.value >= 0) {
        t.preventDefault();
        const e = _.value[d.value];
        e && V(e.id);
      }
    }
    function X(t) {
      return typeof t.title == "string" && t.title.trim() ? t.title : "Unknown capability";
    }
    async function z() {
      const t = ++E;
      try {
        const { data: a } = await ot.get("/api/v1/agents/traits");
        t === E && (h.value = a?.success === !0 && Array.isArray(a.traits) ? a.traits : []);
      } catch {
        t === E && (h.value = []);
      }
    }
    return Z(() => {
      z();
    }), (t, a) => (o(), s("div", dt, [
      n("div", pt, [
        a[3] || (a[3] = n("span", { class: "kx-group-title" }, "Capabilities", -1)),
        n("span", vt, p($.value.length) + " active", 1)
      ]),
      n("div", {
        ref_key: "traitAddRoot",
        ref: D,
        class: "kx-tadd"
      }, [
        tt(n("input", {
          ref_key: "traitSearchInput",
          ref: L,
          "onUpdate:modelValue": a[0] || (a[0] = (e) => T.value = e),
          class: "kx-trait-search kx-focus-halo",
          type: "text",
          role: "combobox",
          "aria-label": "Search capabilities to add",
          "aria-autocomplete": "list",
          "aria-expanded": l.value,
          "aria-controls": q,
          "aria-activedescendant": l.value ? j.value : void 0,
          placeholder: "Search capabilities to add…",
          onFocus: a[1] || (a[1] = (e) => l.value = !0),
          onInput: G,
          onKeydown: W
        }, null, 40, kt), [
          [et, T.value]
        ]),
        f(ut, {
          open: l.value,
          "onUpdate:open": a[2] || (a[2] = (e) => l.value = e),
          anchor: D.value
        }, {
          default: at(() => [
            n("div", {
              id: q,
              class: "kx-trait-menu",
              role: "listbox",
              "aria-label": "Available capabilities"
            }, [
              (o(!0), s(y, null, m(_.value, (e, i) => (o(), s("button", {
                key: e.id,
                id: `agent-trait-picker-option-${i}`,
                ref_for: !0,
                ref: (c) => B(c, i),
                type: "button",
                class: b(["kx-trait-option", i === d.value && "kx-trait-option-active"]),
                tabindex: "-1",
                role: "option",
                "aria-selected": !1,
                onMouseenter: (c) => d.value = i,
                onClick: (c) => V(e.id)
              }, [
                n("span", {
                  class: b(["kx-trait-icon", `kx-tint-${u(R)(e)}`])
                }, [
                  f(u(O), {
                    icon: e.icon || "tabler:puzzle",
                    "aria-hidden": "true"
                  }, null, 8, ["icon"])
                ], 2),
                n("span", ft, [
                  n("span", xt, p(e.title || e.id), 1),
                  e.description ? (o(), s("span", ht, p(e.description), 1)) : v("", !0)
                ]),
                n("span", yt, [
                  (o(!0), s(y, null, m(u(U)(e), (c) => (o(), s("span", {
                    key: c.key,
                    class: b(["kx-trait-badge", `kx-badge-${c.key}`])
                  }, p(c.label), 3))), 128))
                ])
              ], 42, _t))), 128)),
              _.value.length ? v("", !0) : (o(), s("div", mt, "No matching capabilities."))
            ])
          ]),
          _: 1
        }, 8, ["open", "anchor"])
      ], 512),
      $.value.length ? (o(), s("ul", bt, [
        (o(!0), s(y, null, m($.value, (e) => (o(), s("li", {
          key: e.id,
          "data-trait-id": e.id,
          class: "kx-trait-row-wrap"
        }, [
          n("div", wt, [
            n("span", {
              class: b(["kx-trait-icon", `kx-tint-${u(R)(e)}`])
            }, [
              f(u(O), {
                icon: e.icon || "tabler:puzzle",
                "aria-hidden": "true"
              }, null, 8, ["icon"])
            ], 2),
            n("span", Tt, [
              n("span", At, [
                it(p(X(e)), 1),
                e.title?.trim() ? v("", !0) : (o(), s("span", Ct, p(e.id), 1))
              ])
            ]),
            n("span", Ot, [
              (o(!0), s(y, null, m(u(U)(e), (i) => (o(), s("span", {
                key: i.key,
                class: b(["kx-trait-badge", `kx-badge-${i.key}`])
              }, p(i.label), 3))), 128))
            ]),
            n("span", $t, [
              e.description || e.prompt || e.tools?.length ? (o(), s("button", {
                key: 0,
                type: "button",
                class: "kx-trait-fold kx-focus-outline",
                "aria-expanded": u(g)(e.id),
                "aria-label": u(g)(e.id) ? "Hide details" : "Show details",
                onClick: (i) => u(Q)(e.id)
              }, [
                f(u(O), {
                  icon: u(g)(e.id) ? "tabler:chevron-down" : "tabler:chevron-right",
                  "aria-hidden": "true"
                }, null, 8, ["icon"])
              ], 8, It)) : v("", !0),
              n("button", {
                type: "button",
                class: "kx-trait-remove kx-focus-outline",
                "aria-label": `Remove ${e.title || e.id} capability`,
                onClick: (i) => F(e.id)
              }, [
                f(u(O), {
                  icon: "tabler:x",
                  "aria-hidden": "true"
                })
              ], 8, Et)
            ])
          ]),
          u(g)(e.id) ? (o(), s("div", Mt, [
            e.description ? (o(), s("p", St, p(e.description), 1)) : v("", !0),
            e.prompt ? (o(), s("p", Dt, p(e.prompt), 1)) : v("", !0),
            e.tools?.length ? (o(), s("ul", Lt, [
              (o(!0), s(y, null, m(P.value.get(e.id), ({ id: i, tool: c }) => (o(), s("li", {
                key: i,
                "data-declared-tool-id": i
              }, [
                n("strong", null, p(c?.title || i), 1),
                n("p", Vt, p(c?.llm_description || (c ? "No description declared." : "This tool is not in the available catalog.")), 1)
              ], 8, Nt))), 128))
            ])) : v("", !0)
          ])) : v("", !0),
          e.web_component ? (o(), s("div", zt, [
            f(rt, {
              tag: e.web_component,
              config: r.value.trait_contexts[e.id] || {},
              schema: e.context_schema,
              provider: e.provider,
              onChange: (i) => J(e.id, i)
            }, null, 8, ["tag", "config", "schema", "provider", "onChange"])
          ])) : v("", !0)
        ], 8, gt))), 128))
      ])) : (o(), s("p", Ht, "No capabilities yet."))
    ]));
  }
});
export {
  Bt as default
};
//# sourceMappingURL=AgentTraitPicker-xdCMGDnJ.js.map

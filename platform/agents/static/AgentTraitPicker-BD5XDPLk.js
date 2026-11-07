import { defineComponent as Y, ref as p, computed as L, watch as M, onMounted as Z, openBlock as n, createElementBlock as o, createElementVNode as s, toDisplayString as v, withDirectives as tt, vModelText as et, createVNode as k, withCtx as at, Fragment as C, renderList as T, normalizeClass as _, unref as l, createCommentVNode as x, createTextVNode as it, nextTick as U } from "vue";
import { Icon as A } from "@iconify/vue";
import { api as nt } from "@wippy-fe/proxy";
import { a as ot, u as st } from "./wc-runtime-KO3cNuNo.js";
import { u as rt, t as q, b as K, W as lt } from "./trait-presentation-lBqZZyB5.js";
import { _ as ct } from "./AnchoredPanel.vue_vue_type_style_index_0_lang-DSLnUKFT.js";
const ut = {
  class: "kx-agent-trait-picker",
  "data-testid": "agent-trait-picker"
}, dt = { class: "kx-group-head" }, pt = { class: "kx-group-meta" }, vt = ["aria-expanded", "aria-activedescendant"], ft = ["id", "onMouseenter", "onClick"], kt = { class: "kx-trait-option-text" }, xt = { class: "kx-trait-name" }, _t = {
  key: 0,
  class: "kx-trait-description"
}, yt = { class: "kx-trait-badges" }, ht = {
  key: 0,
  class: "kx-trait-empty"
}, bt = {
  key: 0,
  class: "kx-trait-list"
}, mt = { class: "kx-trait-row" }, gt = { class: "kx-trait-text" }, wt = { class: "kx-trait-name" }, Ct = {
  key: 0,
  class: "kx-trait-id"
}, Tt = {
  key: 0,
  class: "kx-trait-description"
}, At = { class: "kx-trait-badges" }, $t = { class: "kx-trait-actions" }, It = ["aria-expanded", "aria-label", "onClick"], Ot = ["aria-label", "onClick"], St = {
  key: 0,
  class: "kx-trait-config"
}, Et = {
  key: 1,
  class: "kx-trait-empty-state"
}, Q = "agent-trait-picker-listbox", Rt = /* @__PURE__ */ Y({
  __name: "AgentTraitPicker",
  setup(Lt) {
    const y = ot(), j = st(), h = p([]), r = p(z(y.value.value)), { collapsedTraits: $, isTraitCollapsed: b, toggleTraitCollapsed: D } = rt(), I = L(() => h.value.filter((t) => r.value.traits.includes(t.id))), m = (t) => r.value.traits.includes(t), g = p(""), c = p(!1), N = p(null), V = p(null), O = p([]), u = p(-1);
    let S = 0;
    const f = L(() => {
      const t = g.value.trim().toLowerCase();
      return h.value.filter((e) => !m(e.id)).filter((e) => !t || (e.title || e.id).toLowerCase().includes(t) || (e.description || "").toLowerCase().includes(t));
    }), B = L(() => u.value >= 0 ? `agent-trait-picker-option-${u.value}` : void 0);
    M([c, f], ([t, e]) => {
      O.value = [], u.value = t && e.length ? 0 : -1;
    }), M(() => y.value.value, (t) => {
      r.value = z(t), $.value = new Set([...$.value].filter((e) => r.value.traits.includes(e)));
    }), M(() => y.value.refreshKey, (t, e) => {
      t !== e && R();
    });
    function z(t) {
      if (typeof t != "string" || t === "") return { traits: [], trait_contexts: {} };
      try {
        const e = JSON.parse(t);
        if (!e || typeof e != "object" || Array.isArray(e)) return { traits: [], trait_contexts: {} };
        const a = Array.isArray(e.traits) ? e.traits.filter((d) => typeof d == "string") : [], i = e.trait_contexts && typeof e.trait_contexts == "object" && !Array.isArray(e.trait_contexts) ? e.trait_contexts : {};
        return { traits: a, trait_contexts: { ...i } };
      } catch {
        return { traits: [], trait_contexts: {} };
      }
    }
    function w(t) {
      r.value = t, j("change", {
        traits: [...t.traits],
        trait_contexts: { ...t.trait_contexts }
      });
    }
    function F(t, e) {
      t instanceof HTMLElement && (O.value[e] = t);
    }
    function E(t, e = !1) {
      u.value = t, !(!e || t < 0) && U(() => O.value[t]?.scrollIntoView?.({ block: "nearest" }));
    }
    function H(t) {
      m(t) || w({ ...r.value, traits: [...r.value.traits, t] }), g.value = "", y.value.keepMenuOpenOnAdd || (c.value = !1, u.value = -1), U(() => V.value?.focus({ preventScroll: !0 }));
    }
    function P(t) {
      const e = r.value.traits.filter((i) => i !== t);
      m(t) || e.push(t);
      const a = { ...r.value.trait_contexts };
      if (!m(t)) {
        w({ ...r.value, traits: e, trait_contexts: a });
        return;
      }
      delete a[t], $.value.has(t) && D(t), w({ traits: e, trait_contexts: a });
    }
    function W(t, e) {
      w({
        ...r.value,
        trait_contexts: { ...r.value.trait_contexts, [t]: e }
      });
    }
    function J() {
      c.value = !0, E(f.value.length ? 0 : -1, !0);
    }
    function G(t) {
      const e = f.value.length;
      if (t.key === "Escape" || t.key === "Tab") {
        c.value = !1;
        return;
      }
      if (t.key === "ArrowDown" || t.key === "ArrowUp") {
        if (t.preventDefault(), c.value = !0, !e) return;
        const a = t.key === "ArrowDown" ? 1 : -1, i = u.value < 0 ? a > 0 ? -1 : 0 : u.value;
        E((i + a + e) % e, !0);
        return;
      }
      if (t.key === "Home" || t.key === "End") {
        if (!c.value || !e) return;
        t.preventDefault(), E(t.key === "Home" ? 0 : e - 1, !0);
        return;
      }
      if (t.key === "Enter" && c.value && u.value >= 0) {
        t.preventDefault();
        const a = f.value[u.value];
        a && H(a.id);
      }
    }
    function X(t) {
      return typeof t.title == "string" && t.title.trim() ? t.title : "Unknown capability";
    }
    async function R() {
      const t = ++S;
      try {
        const { data: e } = await nt.get("/api/v1/agents/traits");
        t === S && (h.value = e?.success === !0 && Array.isArray(e.traits) ? e.traits : []);
      } catch {
        t === S && (h.value = []);
      }
    }
    return Z(() => {
      R();
    }), (t, e) => (n(), o("div", ut, [
      s("div", dt, [
        e[3] || (e[3] = s("span", { class: "kx-group-title" }, "Capabilities", -1)),
        s("span", pt, v(I.value.length) + " active", 1)
      ]),
      s("div", {
        ref_key: "traitAddRoot",
        ref: N,
        class: "kx-tadd"
      }, [
        tt(s("input", {
          ref_key: "traitSearchInput",
          ref: V,
          "onUpdate:modelValue": e[0] || (e[0] = (a) => g.value = a),
          class: "kx-trait-search kx-focus-halo",
          type: "text",
          role: "combobox",
          "aria-label": "Search capabilities to add",
          "aria-autocomplete": "list",
          "aria-expanded": c.value,
          "aria-controls": Q,
          "aria-activedescendant": c.value ? B.value : void 0,
          placeholder: "Search capabilities to add…",
          onFocus: e[1] || (e[1] = (a) => c.value = !0),
          onInput: J,
          onKeydown: G
        }, null, 40, vt), [
          [et, g.value]
        ]),
        k(ct, {
          open: c.value,
          "onUpdate:open": e[2] || (e[2] = (a) => c.value = a),
          anchor: N.value
        }, {
          default: at(() => [
            s("div", {
              id: Q,
              class: "kx-trait-menu",
              role: "listbox",
              "aria-label": "Available capabilities"
            }, [
              (n(!0), o(C, null, T(f.value, (a, i) => (n(), o("button", {
                key: a.id,
                id: `agent-trait-picker-option-${i}`,
                ref_for: !0,
                ref: (d) => F(d, i),
                type: "button",
                class: _(["kx-trait-option", i === u.value && "kx-trait-option-active"]),
                tabindex: "-1",
                role: "option",
                "aria-selected": !1,
                onMouseenter: (d) => u.value = i,
                onClick: (d) => H(a.id)
              }, [
                s("span", {
                  class: _(["kx-trait-icon", `kx-tint-${l(q)(a)}`])
                }, [
                  k(l(A), {
                    icon: a.icon || "tabler:puzzle",
                    "aria-hidden": "true"
                  }, null, 8, ["icon"])
                ], 2),
                s("span", kt, [
                  s("span", xt, v(a.title || a.id), 1),
                  a.description ? (n(), o("span", _t, v(a.description), 1)) : x("", !0)
                ]),
                s("span", yt, [
                  (n(!0), o(C, null, T(l(K)(a), (d) => (n(), o("span", {
                    key: d.key,
                    class: _(["kx-trait-badge", `kx-badge-${d.key}`])
                  }, v(d.label), 3))), 128))
                ])
              ], 42, ft))), 128)),
              f.value.length ? x("", !0) : (n(), o("div", ht, "No matching capabilities."))
            ])
          ]),
          _: 1
        }, 8, ["open", "anchor"])
      ], 512),
      I.value.length ? (n(), o("ul", bt, [
        (n(!0), o(C, null, T(I.value, (a) => (n(), o("li", {
          key: a.id,
          class: "kx-trait-row-wrap"
        }, [
          s("div", mt, [
            s("span", {
              class: _(["kx-trait-icon", `kx-tint-${l(q)(a)}`])
            }, [
              k(l(A), {
                icon: a.icon || "tabler:puzzle",
                "aria-hidden": "true"
              }, null, 8, ["icon"])
            ], 2),
            s("span", gt, [
              s("span", wt, [
                it(v(X(a)), 1),
                a.title?.trim() ? x("", !0) : (n(), o("span", Ct, v(a.id), 1))
              ]),
              a.description ? (n(), o("span", Tt, v(a.description), 1)) : x("", !0)
            ]),
            s("span", At, [
              (n(!0), o(C, null, T(l(K)(a), (i) => (n(), o("span", {
                key: i.key,
                class: _(["kx-trait-badge", `kx-badge-${i.key}`])
              }, v(i.label), 3))), 128))
            ]),
            s("span", $t, [
              a.web_component ? (n(), o("button", {
                key: 0,
                type: "button",
                class: "kx-trait-fold kx-focus-outline",
                "aria-expanded": !l(b)(a.id),
                "aria-label": l(b)(a.id) ? "Show settings" : "Hide settings",
                onClick: (i) => l(D)(a.id)
              }, [
                k(l(A), {
                  icon: l(b)(a.id) ? "tabler:chevron-right" : "tabler:chevron-down",
                  "aria-hidden": "true"
                }, null, 8, ["icon"])
              ], 8, It)) : x("", !0),
              s("button", {
                type: "button",
                class: "kx-trait-remove kx-focus-outline",
                "aria-label": `Remove ${a.title || a.id} capability`,
                onClick: (i) => P(a.id)
              }, [
                k(l(A), {
                  icon: "tabler:x",
                  "aria-hidden": "true"
                })
              ], 8, Ot)
            ])
          ]),
          a.web_component && !l(b)(a.id) ? (n(), o("div", St, [
            k(lt, {
              tag: a.web_component,
              config: r.value.trait_contexts[a.id] || {},
              provider: a.provider,
              onChange: (i) => W(a.id, i)
            }, null, 8, ["tag", "config", "provider", "onChange"])
          ])) : x("", !0)
        ]))), 128))
      ])) : (n(), o("p", Et, "No capabilities yet."))
    ]));
  }
});
export {
  Rt as default
};
//# sourceMappingURL=AgentTraitPicker-BD5XDPLk.js.map

import { defineComponent as ne, ref as p, useId as oe, computed as S, watch as M, onBeforeUnmount as se, openBlock as f, createElementBlock as h, Fragment as O, createElementVNode as g, normalizeClass as A, createVNode as P, unref as x, toDisplayString as C, withCtx as ie, withDirectives as ue, vModelText as ce, renderList as pe, createCommentVNode as J, createTextVNode as ve, nextTick as U } from "vue";
import { Icon as N } from "@iconify/vue";
import { _ as de } from "./AnchoredPanel.vue_vue_type_style_index_0_lang-DSLnUKFT.js";
import { api as W } from "@wippy-fe/proxy";
function fe(l, o) {
  if (typeof l != "string" || !l.trim()) return "";
  const a = l.trim();
  if (a.startsWith("{"))
    try {
      const s = JSON.parse(a)[o];
      return typeof s == "string" ? s : s == null ? "" : String(s);
    } catch {
      return "";
    }
  return a;
}
function z(l) {
  const o = l && typeof l == "object" ? l : {};
  return Array.isArray(o.principals) ? o.principals.filter((a) => {
    if (!a || typeof a != "object") return !1;
    const r = a;
    return (r.type === "user" || r.type === "group") && typeof r.id == "string" && typeof r.label == "string";
  }) : [];
}
function G(l, o) {
  const a = l && typeof l == "object" ? l : {};
  if (a.success === !1) {
    const r = typeof a.error == "string" && a.error.trim() ? a.error : `${o} failed`;
    throw new Error(r);
  }
  return a;
}
async function he(l, o = 8, a) {
  const r = { q: l.trim(), limit: o };
  a?.length && (r.kinds = a.join(","));
  const { data: s } = await W.get("/api/v1/principals/search", { params: r });
  return z(G(s, "Principal search"));
}
async function ye(l) {
  if (!l.length) return [];
  const { data: o } = await W.post("/api/v1/principals/resolve", { refs: l });
  return z(G(o, "Principal resolution"));
}
async function me(l, o = ["user", "group"]) {
  const a = await ye(o.map((r) => ({ type: r, id: l })));
  for (const r of o) {
    const s = a.find(($) => $.id === l && $.type === r);
    if (s) return s;
  }
  return null;
}
const ge = { user: "Person", group: "Group" }, be = ["aria-expanded", "aria-controls"], ke = { class: "kpp-search" }, _e = ["aria-expanded", "aria-activedescendant"], Se = {
  key: 0,
  class: "kpp-state is-error",
  role: "alert"
}, Pe = {
  key: 1,
  class: "kpp-state"
}, xe = {
  key: 2,
  class: "kpp-state"
}, Ce = {
  key: 3,
  class: "kpp-state"
}, $e = ["id", "aria-selected", "onMousemove", "onClick"], Te = { class: "kpp-copy" }, Ie = { key: 0 }, De = { class: "kpp-kind" }, Ae = /* @__PURE__ */ ne({
  __name: "PrincipalPicker",
  props: {
    value: { default: "" },
    config: { default: "" },
    schema: { default: "" },
    placeholder: { default: "Select a person or group…" },
    kinds: { default: "user,group" }
  },
  emits: ["change", "load", "error"],
  setup(l, { emit: o }) {
    const a = l, r = o, s = p(null), $ = p(null), i = p(!1), j = p(""), b = p(!1), E = p(!1), T = p(!1), c = p([]), k = p(null), y = p(""), v = p(""), u = p(-1), I = `principal-options-${oe()}`;
    let d = null, D = 0, _ = 0;
    function K(e) {
      if (e && typeof e == "object") return e;
      if (typeof e == "string" && e.trim().startsWith("{"))
        try {
          return JSON.parse(e);
        } catch {
        }
      return {};
    }
    const V = S(() => K(K(a.schema).properties)), q = S(() => Object.keys(V.value)[0] || "principal_id"), w = S(() => K(V.value[q.value])), L = S(() => {
      const e = String(w.value.kinds || a.kinds).split(",").map((n) => n.trim()).filter((n) => n === "user" || n === "group");
      return e.length ? e : ["user", "group"];
    }), Q = S(() => String(w.value.empty_label || "Clear selection")), R = S(() => k.value?.label || (E.value ? "Finding selection…" : y.value ? "Unknown principal" : a.placeholder));
    function Y() {
      for (const e of [a.config, a.value]) for (const n of [q.value, "principal_id", "id", "thread_id"]) {
        const t = fe(e, n);
        if (t) return t;
      }
      return "";
    }
    async function H(e) {
      const n = ++D;
      if (k.value = null, !!e) {
        E.value = !0, v.value = "";
        try {
          const t = await me(e, L.value);
          if (n !== D) return;
          k.value = t, t || (v.value = "This person or group is no longer available."), r("load");
        } catch (t) {
          if (n !== D) return;
          v.value = "Could not resolve this selection.", r("error", { message: v.value, error: t });
        } finally {
          n === D && (E.value = !1);
        }
      }
    }
    M(() => [a.config, a.value, a.schema, a.kinds], () => {
      const e = Y();
      e === y.value && (k.value || E.value) || (y.value = e, H(e));
    }, { immediate: !0 });
    async function X(e, n, t) {
      try {
        const m = await he(n, 12, t);
        if (e !== _) return;
        c.value = m, u.value = m.length ? 0 : -1;
      } catch (m) {
        if (e !== _) return;
        c.value = [], v.value = "Could not search people and groups.", r("error", { message: v.value, error: m });
      } finally {
        e === _ && (b.value = !1);
      }
    }
    function Z() {
      d && clearTimeout(d);
      const e = ++_, n = j.value.trim(), t = [...L.value];
      if (c.value = [], u.value = -1, v.value = "", !n) {
        b.value = !1, T.value = !1, d = null;
        return;
      }
      b.value = !0, T.value = !0, d = setTimeout(() => {
        d = null, X(e, n, t);
      }, 180);
    }
    function ee() {
      i.value = !0, j.value = "", c.value = [], T.value = !1, v.value = "", u.value = -1, U(() => $.value?.focus());
    }
    function ae() {
      if (i.value) {
        i.value = !1;
        return;
      }
      ee();
    }
    function B() {
      U(() => s.value?.focus());
    }
    function F(e) {
      y.value = e.id, k.value = e, i.value = !1, r("change", { id: e.id, principal_id: e.id, type: e.type, label: e.label, [q.value]: e.id }), B();
    }
    function te() {
      const e = L.value[0] || "user";
      y.value = "", k.value = null, i.value = !1, r("change", { id: "", principal_id: "", type: e, label: "", [q.value]: "" }), B();
    }
    function le(e) {
      e.stopPropagation(), e.key === "ArrowDown" ? (e.preventDefault(), u.value = c.value.length ? (u.value + 1) % c.value.length : -1) : e.key === "ArrowUp" ? (e.preventDefault(), u.value = c.value.length ? (u.value - 1 + c.value.length) % c.value.length : -1) : e.key === "Enter" && u.value >= 0 ? (e.preventDefault(), F(c.value[u.value])) : e.key === "Escape" && (e.preventDefault(), i.value = !1, U(() => s.value?.focus()));
    }
    return M(i, (e) => {
      e || (d && (clearTimeout(d), d = null), _ += 1, b.value = !1);
    }), se(() => {
      D += 1, _ += 1, d && clearTimeout(d);
    }), (e, n) => (f(), h(O, null, [
      g("button", {
        ref_key: "anchor",
        ref: s,
        type: "button",
        class: A(["kpp-control", i.value && "is-open"]),
        "aria-expanded": i.value,
        "aria-controls": i.value ? I : void 0,
        "aria-haspopup": "listbox",
        onClick: ae
      }, [
        P(x(N), {
          icon: k.value?.type === "group" ? "tabler:users-group" : "tabler:user",
          "aria-hidden": "true"
        }, null, 8, ["icon"]),
        g("span", {
          class: A(!y.value && "is-placeholder")
        }, C(R.value), 3),
        P(x(N), {
          icon: "tabler:chevron-down",
          "aria-hidden": "true"
        })
      ], 10, be),
      P(de, {
        open: i.value,
        "onUpdate:open": n[1] || (n[1] = (t) => i.value = t),
        anchor: s.value,
        "min-width": 260,
        "max-height": 320
      }, {
        default: ie(() => [
          g("div", {
            class: "kpp-panel",
            onKeydown: le
          }, [
            g("label", ke, [
              P(x(N), {
                icon: b.value ? "tabler:loader-2" : "tabler:search",
                class: A(b.value && "spin"),
                "aria-hidden": "true"
              }, null, 8, ["icon", "class"]),
              ue(g("input", {
                ref_key: "input",
                ref: $,
                "onUpdate:modelValue": n[0] || (n[0] = (t) => j.value = t),
                type: "search",
                role: "combobox",
                autocomplete: "off",
                "aria-autocomplete": "list",
                "aria-expanded": i.value,
                "aria-controls": I,
                "aria-activedescendant": u.value >= 0 ? `${I}-${u.value}` : void 0,
                placeholder: "Search people or groups…",
                "aria-label": "Search people or groups",
                onInput: Z
              }, null, 40, _e), [
                [ce, j.value]
              ])
            ]),
            v.value ? (f(), h("div", Se, C(v.value), 1)) : b.value ? (f(), h("div", Pe, "Searching…")) : T.value && !c.value.length ? (f(), h("div", xe, "No people or groups found.")) : T.value ? (f(), h("div", {
              key: 4,
              id: I,
              class: "kpp-list",
              role: "listbox",
              "aria-label": "People and groups"
            }, [
              (f(!0), h(O, null, pe(c.value, (t, m) => (f(), h("button", {
                id: `${I}-${m}`,
                key: `${t.type}:${t.id}`,
                type: "button",
                role: "option",
                class: A(["kpp-row", [m === u.value && "is-active", t.id === y.value && "is-selected"]]),
                "aria-selected": t.id === y.value,
                onMousemove: (re) => u.value = m,
                onClick: (re) => F(t)
              }, [
                P(x(N), {
                  icon: t.type === "group" ? "tabler:users-group" : "tabler:user",
                  "aria-hidden": "true"
                }, null, 8, ["icon"]),
                g("span", Te, [
                  g("strong", null, C(t.label), 1),
                  t.sublabel ? (f(), h("small", Ie, C(t.sublabel), 1)) : J("", !0)
                ]),
                g("small", De, C(x(ge)[t.type]), 1)
              ], 42, $e))), 128))
            ])) : (f(), h("div", Ce, "Type a name or email.")),
            y.value ? (f(), h("button", {
              key: 5,
              type: "button",
              class: "kpp-clear",
              onClick: te
            }, [
              P(x(N), {
                icon: "tabler:arrow-back-up",
                "aria-hidden": "true"
              }),
              ve(C(Q.value), 1)
            ])) : J("", !0)
          ], 32)
        ]),
        _: 1
      }, 8, ["open", "anchor"])
    ], 64));
  }
});
export {
  Ae as _,
  ye as r
};
//# sourceMappingURL=PrincipalPicker.vue_vue_type_script_setup_true_lang-zrnf6sTm.js.map

import { defineComponent as V, ref as u, shallowRef as j, computed as C, watch as A, openBlock as n, createElementBlock as i, createElementVNode as x, withModifiers as I, normalizeClass as M, createVNode as k, unref as E, withCtx as L, withDirectives as W, vModelText as q, createCommentVNode as S, toDisplayString as D, Fragment as O, renderList as $, nextTick as z } from "vue";
import { listIcons as B, Icon as N } from "@iconify/vue";
import { u as H, a as X } from "./wc-runtime-Vcu3yWjv.js";
import { _ as G } from "./AnchoredPanel.vue_vue_type_script_setup_true_lang-CU5LLZRq.js";
const J = "ad71d353fc6fe19e4e6d37767b9aea1ff2f8b6cd930f888cfadfcb2bcb94c75a", K = () => H(), Q = () => X();
async function Y(_, b) {
  if (!globalThis.crypto?.subtle) return;
  const p = _.map((e) => e.slice(b.length + 1)).sort().join(`
`), v = await globalThis.crypto.subtle.digest("SHA-256", new TextEncoder().encode(p));
  return Array.from(new Uint8Array(v), (e) => e.toString(16).padStart(2, "0")).join("");
}
function Z(_, b, p, v = 120) {
  const e = b + ":", r = p.trim().toLowerCase(), d = (r.startsWith(e) ? r.slice(e.length) : r).replace(/[\s_]+/g, "-"), c = d.split("-").filter(Boolean);
  if (!c.length) return [];
  const h = /* @__PURE__ */ new Map();
  for (const t of _) {
    if (!t.startsWith(e)) continue;
    const o = t.slice(e.length);
    c.every((f) => o.includes(f)) && h.set(t, o === d ? 0 : o.startsWith(d) ? 1 : 2);
  }
  return [...h].sort(([t, o], [f, m]) => o - m || t.localeCompare(f)).slice(0, v).map(([t]) => t);
}
const ee = { class: "ip-root" }, te = { class: "ip-search" }, ae = {
  key: 0,
  class: "ip-state",
  role: "status"
}, le = {
  key: 1,
  class: "ip-state",
  role: "status"
}, re = {
  key: 2,
  class: "ip-state"
}, oe = {
  key: 3,
  class: "ip-grid"
}, se = ["title", "aria-label", "onClick"], y = "tabler", be = /* @__PURE__ */ V({
  __name: "IconPicker",
  setup(_) {
    const b = K(), p = Q(), v = [
      "tabler:home",
      "tabler:layout-dashboard",
      "tabler:inbox",
      "tabler:bell",
      "tabler:robot",
      "tabler:bolt",
      "tabler:bulb",
      "tabler:files",
      "tabler:folder",
      "tabler:books",
      "tabler:database",
      "tabler:plug",
      "tabler:settings",
      "tabler:adjustments",
      "tabler:users",
      "tabler:user",
      "tabler:message-circle",
      "tabler:messages",
      "tabler:search",
      "tabler:chart-bar",
      "tabler:chart-line",
      "tabler:calendar",
      "tabler:clock",
      "tabler:star",
      "tabler:heart",
      "tabler:flag",
      "tabler:tag",
      "tabler:bookmark",
      "tabler:rocket",
      "tabler:flask",
      "tabler:brain",
      "tabler:cloud",
      "tabler:world",
      "tabler:link",
      "tabler:mail",
      "tabler:device-laptop",
      "tabler:terminal",
      "tabler:code",
      "tabler:package",
      "tabler:packages",
      "tabler:shield",
      "tabler:lock",
      "tabler:key",
      "tabler:eye",
      "tabler:list",
      "tabler:layout-list",
      "tabler:apps",
      "tabler:grid-dots",
      "tabler:check",
      "tabler:circle"
    ], e = u(!1), r = u(""), d = j([]), c = u(!1), h = u(!1), t = u(!1), o = u(null), f = u(null), m = C(() => {
      const l = b.value?.value;
      return typeof l == "string" ? l : "";
    }), F = C(() => {
      const l = b.value?.fallback;
      return typeof l == "string" ? l : "";
    }), g = C(() => !!r.value.trim()), w = C(() => g.value ? Z([...B("", y), ...d.value], y, r.value) : v);
    A(g, async (l) => {
      if (!(!l || h.value || c.value || t.value)) {
        c.value = !0;
        try {
          const s = B("", y);
          if (await Y(s, y) !== J) {
            const { default: a } = await import("./_virtual_tabler-icon-names-BGNJRgn1.js");
            d.value = a.split(`
`).map((T) => y + ":" + T);
          }
          h.value = !0;
        } catch {
          t.value = !0;
        } finally {
          c.value = !1;
        }
      }
    });
    function P() {
      if (e.value) {
        e.value = !1;
        return;
      }
      e.value = !0, z(() => f.value?.focus());
    }
    function R(l) {
      p("select", l), e.value = !1;
    }
    function U() {
      p("select", ""), e.value = !1;
    }
    return (l, s) => (n(), i("div", ee, [
      x("button", {
        ref_key: "trigger",
        ref: o,
        type: "button",
        class: M(["ip-trigger", e.value && "ip-on"]),
        title: "Choose icon",
        "aria-label": "Choose icon",
        onClick: I(P, ["stop"])
      }, [
        k(E(N), {
          icon: m.value || F.value || "tabler:mood-smile",
          "aria-hidden": "true"
        }, null, 8, ["icon"]),
        k(E(N), {
          icon: "tabler:chevron-down",
          class: "ip-caret",
          "aria-hidden": "true"
        })
      ], 2),
      k(G, {
        open: e.value,
        "onUpdate:open": s[2] || (s[2] = (a) => e.value = a),
        anchor: o.value,
        width: 304,
        "max-height": 360,
        gap: 6
      }, {
        default: L(() => [
          x("div", {
            class: "ip-pop",
            onClick: s[1] || (s[1] = I(() => {
            }, ["stop"]))
          }, [
            x("div", te, [
              k(E(N), {
                icon: "tabler:search",
                "aria-hidden": "true"
              }),
              W(x("input", {
                ref_key: "searchEl",
                ref: f,
                "onUpdate:modelValue": s[0] || (s[0] = (a) => r.value = a),
                placeholder: "Search Tabler icons…",
                spellcheck: "false"
              }, null, 512), [
                [q, r.value]
              ]),
              m.value ? (n(), i("button", {
                key: 0,
                type: "button",
                class: "ip-reset",
                onClick: U
              }, "Reset")) : S("", !0)
            ]),
            g.value && t.value ? (n(), i("div", ae, "Some icons are unavailable.")) : S("", !0),
            g.value && c.value && !w.value.length ? (n(), i("div", le, "Loading icon names…")) : g.value && !w.value.length && !t.value ? (n(), i("div", re, "No icons for “" + D(r.value) + "”.", 1)) : w.value.length ? (n(), i("div", oe, [
              (n(!0), i(O, null, $(w.value, (a) => (n(), i("button", {
                key: a,
                type: "button",
                class: M(["ip-cell", a === m.value && "ip-cell-on"]),
                title: a.replace("tabler:", ""),
                "aria-label": a.replace("tabler:", ""),
                onClick: (T) => R(a)
              }, [
                k(E(N), {
                  icon: a,
                  "aria-hidden": "true"
                }, null, 8, ["icon"])
              ], 10, se))), 128))
            ])) : S("", !0)
          ])
        ]),
        _: 1
      }, 8, ["open", "anchor"])
    ]));
  }
});
export {
  be as default
};
//# sourceMappingURL=IconPicker-BsJ_KjBR.js.map

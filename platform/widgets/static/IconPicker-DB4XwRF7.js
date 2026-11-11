import { defineComponent as U, ref as n, computed as _, watch as B, onBeforeUnmount as I, openBlock as r, createElementBlock as o, createElementVNode as f, withModifiers as C, normalizeClass as w, createVNode as i, unref as b, withCtx as P, withDirectives as S, vModelText as $, createCommentVNode as j, createTextVNode as q, toDisplayString as A, Fragment as D, renderList as O, nextTick as R } from "vue";
import { Icon as p } from "@iconify/vue";
import { a as z, u as F } from "./wc-runtime-CNDpK4lj.js";
import { _ as L } from "./AnchoredPanel.vue_vue_type_script_setup_true_lang-CU5LLZRq.js";
const G = () => z(), H = () => F(), J = { class: "ip-root" }, K = { class: "ip-search" }, Q = {
  key: 0,
  class: "ip-state"
}, W = {
  key: 1,
  class: "ip-state"
}, X = {
  key: 2,
  class: "ip-grid"
}, Y = ["title", "aria-label", "onClick"], re = /* @__PURE__ */ U({
  __name: "IconPicker",
  setup(Z) {
    const m = G(), k = H(), x = [
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
    ], l = n(!1), s = n(""), c = n([]), d = n(!1), g = n(null), y = n(null), v = _(() => {
      const a = m.value?.value;
      return typeof a == "string" ? a : "";
    }), T = _(() => {
      const a = m.value?.fallback;
      return typeof a == "string" ? a : "";
    }), E = () => s.value.trim() ? c.value : x;
    let u;
    B(s, (a) => {
      u && clearTimeout(u);
      const e = a.trim();
      if (!e) {
        c.value = [], d.value = !1;
        return;
      }
      d.value = !0, u = setTimeout(async () => {
        try {
          const h = await (await fetch(`https://api.iconify.design/search?query=${encodeURIComponent(e)}&prefix=tabler&limit=120`)).json();
          c.value = Array.isArray(h.icons) ? h.icons : [];
        } catch {
          c.value = [];
        } finally {
          d.value = !1;
        }
      }, 220);
    });
    function N() {
      if (l.value) {
        l.value = !1;
        return;
      }
      l.value = !0, R(() => y.value?.focus());
    }
    function V(a) {
      k("select", a), l.value = !1;
    }
    function M() {
      k("select", ""), l.value = !1;
    }
    return I(() => {
      u && clearTimeout(u);
    }), (a, e) => (r(), o("div", J, [
      f("button", {
        ref_key: "trigger",
        ref: g,
        type: "button",
        class: w(["ip-trigger", l.value && "ip-on"]),
        title: "Choose icon",
        "aria-label": "Choose icon",
        onClick: C(N, ["stop"])
      }, [
        i(b(p), {
          icon: v.value || T.value || "tabler:mood-smile",
          "aria-hidden": "true"
        }, null, 8, ["icon"]),
        i(b(p), {
          icon: "tabler:chevron-down",
          class: "ip-caret",
          "aria-hidden": "true"
        })
      ], 2),
      i(L, {
        open: l.value,
        "onUpdate:open": e[2] || (e[2] = (t) => l.value = t),
        anchor: g.value,
        width: 304,
        "max-height": 360,
        gap: 6
      }, {
        default: P(() => [
          f("div", {
            class: "ip-pop",
            onClick: e[1] || (e[1] = C(() => {
            }, ["stop"]))
          }, [
            f("div", K, [
              i(b(p), {
                icon: "tabler:search",
                "aria-hidden": "true"
              }),
              S(f("input", {
                ref_key: "searchEl",
                ref: y,
                "onUpdate:modelValue": e[0] || (e[0] = (t) => s.value = t),
                placeholder: "Search Tabler icons…",
                spellcheck: "false"
              }, null, 512), [
                [$, s.value]
              ]),
              v.value ? (r(), o("button", {
                key: 0,
                type: "button",
                class: "ip-reset",
                onClick: M
              }, "Reset")) : j("", !0)
            ]),
            d.value ? (r(), o("div", Q, [
              i(b(p), {
                icon: "tabler:loader-2",
                class: "spin",
                "aria-hidden": "true"
              }),
              e[3] || (e[3] = q(" Searching…", -1))
            ])) : s.value.trim() && !c.value.length ? (r(), o("div", W, "No icons for “" + A(s.value) + "”.", 1)) : (r(), o("div", X, [
              (r(!0), o(D, null, O(E(), (t) => (r(), o("button", {
                key: t,
                type: "button",
                class: w(["ip-cell", t === v.value && "ip-cell-on"]),
                title: t.replace("tabler:", ""),
                "aria-label": t.replace("tabler:", ""),
                onClick: (h) => V(t)
              }, [
                i(b(p), {
                  icon: t,
                  "aria-hidden": "true"
                }, null, 8, ["icon"])
              ], 10, Y))), 128))
            ]))
          ])
        ]),
        _: 1
      }, 8, ["open", "anchor"])
    ]));
  }
});
export {
  re as default
};
//# sourceMappingURL=IconPicker-DB4XwRF7.js.map

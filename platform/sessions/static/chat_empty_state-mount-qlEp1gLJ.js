import { P as F } from "./primevue-plugin-CaP7wV_M.js";
import { defineComponent as G, ref as r, computed as B, watch as H, nextTick as q, onMounted as K, onBeforeUnmount as z, openBlock as s, createElementBlock as n, createVNode as m, unref as d, createElementVNode as a, toDisplayString as f, withDirectives as J, vModelText as O, Fragment as w, renderList as A, createCommentVNode as p, createBlock as Q, createTextVNode as D } from "vue";
import { Icon as v } from "@iconify/vue";
import { host as W } from "@wippy-fe/proxy";
import { a as X, b as Y } from "./wc-runtime-BJD-5iaH.js";
import { j as Z } from "./hostRoute-CHFKAd6h.js";
import { u as tt } from "./useSessionsApi-BQAm970o.js";
const et = { class: "kx-chat-start-controls" }, at = { class: "kx-chat-start-agent" }, st = ["aria-expanded", "disabled"], nt = {
  key: 0,
  id: "chat-start-agents",
  class: "kx-chat-start-menu"
}, ot = { class: "kx-chat-start-search" }, rt = { class: "kx-chat-start-list" }, lt = {
  key: 0,
  class: "kx-chat-start-group"
}, it = ["aria-current", "onClick"], ut = { class: "kx-chat-start-item-title" }, ct = {
  key: 0,
  class: "kx-chat-start-item-comment"
}, dt = {
  key: 0,
  class: "kx-chat-start-empty"
}, pt = ["disabled"], vt = {
  key: 0,
  class: "kx-chat-start-note is-error",
  role: "alert"
}, ht = {
  key: 1,
  class: "kx-chat-start-note"
}, mt = /* @__PURE__ */ G({
  __name: "ChatEmptyState",
  setup(ft) {
    const M = tt(), I = X(), k = r([]), u = r(null), y = r(!0), b = r(""), l = r(!1), _ = r(""), c = r(!1), g = r(null), S = r(null), L = r(null);
    let x = 0, P;
    const C = B(() => k.value.length > 0), E = B(() => {
      const t = _.value.trim().toLowerCase();
      return t ? k.value.map((e) => ({
        title: e.title,
        agents: e.agents.filter((o) => o.title.toLowerCase().includes(t) || (o.comment || "").toLowerCase().includes(t))
      })).filter((e) => e.agents.length > 0) : k.value;
    });
    async function N() {
      const t = ++x;
      y.value = !0, b.value = "";
      try {
        const e = await M.chatAgents();
        t === x && (k.value = e);
      } catch (e) {
        t === x && (b.value = e.message || "Could not load agents");
      } finally {
        t === x && (y.value = !1);
      }
    }
    function R() {
      c.value || !C.value || (l.value ? h() : l.value = !0);
    }
    function h(t = !1) {
      l.value && (l.value = !1, _.value = "", t && q(() => L.value?.focus()));
    }
    function T(t) {
      u.value = t, h(!0);
    }
    function $() {
      !u.value || c.value || (c.value = !0, h(), W.startChat(u.value.start_token, { sidebar: !0 }));
    }
    function U(t) {
      t.channel !== "kickside:chat-start" || !Z(t.payload) || t.payload.pending === !1 && (c.value = !1);
    }
    function V(t) {
      l.value && g.value && !t.composedPath().includes(g.value) && h();
    }
    function j(t) {
      t.key === "Escape" && l.value && (t.stopPropagation(), h(!0));
    }
    return H(l, (t) => {
      t && q(() => S.value?.focus());
    }), Y(N), K(() => {
      P = I?.subscribe(U), document.addEventListener("pointerdown", V, !0);
    }), z(() => {
      P?.(), document.removeEventListener("pointerdown", V, !0);
    }), (t, e) => (s(), n("section", {
      ref_key: "root",
      ref: g,
      class: "kx-chat-start",
      "aria-label": "Start a chat",
      onKeydown: j
    }, [
      m(d(v), {
        class: "kx-chat-start-icon",
        icon: "tabler:message-circle",
        "aria-hidden": "true"
      }),
      e[4] || (e[4] = a("h3", { class: "kx-chat-start-title" }, "No chat session selected", -1)),
      e[5] || (e[5] = a("p", { class: "kx-chat-start-text" }, "Please select a session from the dropdown above or start a new conversation.", -1)),
      a("div", et, [
        a("div", at, [
          a("button", {
            ref_key: "trigger",
            ref: L,
            type: "button",
            class: "p-button p-button-secondary",
            "aria-controls": "chat-start-agents",
            "aria-expanded": l.value,
            disabled: y.value || c.value || !C.value,
            onClick: R
          }, [
            m(d(v), {
              icon: "wippy:agent",
              "aria-hidden": "true"
            }),
            a("span", null, f(u.value ? u.value.title : "Select Agent"), 1),
            m(d(v), {
              icon: "tabler:caret-down-filled",
              class: "kx-chat-start-caret",
              "aria-hidden": "true"
            })
          ], 8, st),
          l.value ? (s(), n("div", nt, [
            a("div", ot, [
              e[1] || (e[1] = a("label", {
                class: "sr-only",
                for: "chat-start-search"
              }, "Search agents", -1)),
              J(a("input", {
                id: "chat-start-search",
                ref_key: "searchInput",
                ref: S,
                "onUpdate:modelValue": e[0] || (e[0] = (o) => _.value = o),
                type: "search",
                class: "p-inputtext",
                placeholder: "Search agents...",
                autocomplete: "off"
              }, null, 512), [
                [O, _.value]
              ])
            ]),
            a("div", rt, [
              (s(!0), n(w, null, A(E.value, (o) => (s(), n(w, {
                key: o.title
              }, [
                o.title ? (s(), n("div", lt, f(o.title), 1)) : p("", !0),
                (s(!0), n(w, null, A(o.agents, (i) => (s(), n("button", {
                  key: `${o.title}:${i.name}`,
                  type: "button",
                  class: "kx-chat-start-item",
                  "aria-current": u.value?.name === i.name ? "true" : void 0,
                  onClick: (kt) => T(i)
                }, [
                  a("span", ut, [
                    m(d(v), {
                      icon: i.icon || "wippy:agent",
                      "aria-hidden": "true"
                    }, null, 8, ["icon"]),
                    a("span", null, f(i.title || i.name), 1)
                  ]),
                  i.comment ? (s(), n("span", ct, f(i.comment), 1)) : p("", !0)
                ], 8, it))), 128))
              ], 64))), 128)),
              E.value.length === 0 ? (s(), n("p", dt, "No agents match.")) : p("", !0)
            ])
          ])) : p("", !0)
        ]),
        a("button", {
          type: "button",
          class: "p-button p-button-primary",
          disabled: !u.value || c.value,
          onClick: $
        }, [
          c.value ? (s(), Q(d(v), {
            key: 0,
            icon: "tabler:loader-2",
            class: "spin",
            "aria-hidden": "true"
          })) : p("", !0),
          e[2] || (e[2] = a("span", null, "Start Chat", -1))
        ], 8, pt)
      ]),
      b.value ? (s(), n("p", vt, [
        D(f(b.value) + " ", 1),
        a("button", {
          type: "button",
          class: "kx-chat-start-retry",
          onClick: N
        }, "Retry")
      ])) : !y.value && !C.value ? (s(), n("p", ht, [
        m(d(v), {
          icon: "tabler:alert-circle",
          "aria-hidden": "true"
        }),
        e[3] || (e[3] = D(" No agents available. Please contact your administrator. ", -1))
      ])) : p("", !0)
    ], 544));
  }
}), St = {
  rootComponent: mt,
  plugins: [F]
};
export {
  St as mountConfig
};
//# sourceMappingURL=chat_empty_state-mount-qlEp1gLJ.js.map

import { P as V } from "./primevue-plugin-CaP7wV_M.js";
import { defineComponent as N, ref as l, onMounted as B, onBeforeUnmount as E, openBlock as u, createElementBlock as d, createVNode as p, unref as f, createElementVNode as s, withCtx as P, toDisplayString as h, createCommentVNode as k, createTextVNode as y } from "vue";
import { Icon as b } from "@iconify/vue";
import q from "primevue/select";
import { host as w } from "@wippy-fe/proxy";
import { a as A, b as L } from "./wc-runtime-BJD-5iaH.js";
import { f as R } from "./hostRoute-C2evkQJy.js";
import { u as U } from "./useSessionsApi-DkMU6ZyM.js";
const D = {
  class: "kx-chat-start",
  "aria-label": "Start a chat"
}, H = { class: "kx-chat-start-option" }, I = { class: "kx-chat-start-option-title" }, M = {
  key: 0,
  class: "kx-chat-start-option-sub"
}, T = {
  key: 0,
  class: "kx-chat-start-note is-error",
  role: "alert"
}, j = {
  key: 1,
  class: "kx-chat-start-note"
}, z = /* @__PURE__ */ N({
  __name: "ChatEmptyState",
  setup(F) {
    const x = U(), _ = A(), r = l([]), m = l(null), o = l(!0), i = l(""), n = l(!1);
    let c = 0, v;
    async function g() {
      const e = ++c;
      o.value = !0, i.value = "";
      try {
        const t = await x.chatAgents();
        e === c && (r.value = t);
      } catch (t) {
        e === c && (i.value = t.message || "Could not load agents");
      } finally {
        e === c && (o.value = !1);
      }
    }
    function C(e) {
      !e || n.value || (n.value = !0, w.startChat(e.start_token, { sidebar: !0 }), m.value = null);
    }
    function S(e) {
      e.channel !== "kickside:chat-start" || !R(e.payload) || e.payload.pending === !1 && (n.value = !1);
    }
    return B(() => {
      v = _?.subscribe(S);
    }), E(() => v?.()), L(g), (e, t) => (u(), d("section", D, [
      p(f(b), {
        class: "kx-chat-start-icon",
        icon: "tabler:message-circle",
        "aria-hidden": "true"
      }),
      t[2] || (t[2] = s("h3", { class: "kx-chat-start-title" }, "No chat session selected", -1)),
      t[3] || (t[3] = s("p", { class: "kx-chat-start-text" }, "Select a session from the list above, or pick an agent to start a new conversation.", -1)),
      t[4] || (t[4] = s("label", {
        class: "sr-only",
        for: "chat-start-agent"
      }, "Agent", -1)),
      p(f(q), {
        "input-id": "chat-start-agent",
        modelValue: m.value,
        "onUpdate:modelValue": [
          t[0] || (t[0] = (a) => m.value = a),
          C
        ],
        class: "kx-chat-start-select",
        "overlay-class": "kx-chat-start-select-overlay",
        options: r.value,
        "option-label": "title",
        placeholder: o.value ? "Loading agents…" : n.value ? "Starting chat…" : "Select agent",
        disabled: o.value || n.value || r.value.length === 0
      }, {
        option: P(({ option: a }) => [
          s("span", H, [
            s("span", I, h(a.title || a.name), 1),
            a.comment ? (u(), d("span", M, h(a.comment), 1)) : k("", !0)
          ])
        ]),
        _: 1
      }, 8, ["modelValue", "options", "placeholder", "disabled"]),
      i.value ? (u(), d("p", T, [
        y(h(i.value) + " ", 1),
        s("button", {
          type: "button",
          class: "kx-chat-start-retry",
          onClick: g
        }, "Retry")
      ])) : !o.value && r.value.length === 0 ? (u(), d("p", j, [
        p(f(b), {
          icon: "tabler:alert-circle",
          "aria-hidden": "true"
        }),
        t[1] || (t[1] = y(" No agents available. Please contact your administrator. ", -1))
      ])) : k("", !0)
    ]));
  }
}), Z = {
  rootComponent: z,
  plugins: [V]
};
export {
  Z as mountConfig
};
//# sourceMappingURL=chat_empty_state-mount-D4n0yuXF.js.map

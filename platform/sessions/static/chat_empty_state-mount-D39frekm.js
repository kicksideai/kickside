import { B as de, f as ce, a as pe, n as fe, l as he, P as ve } from "./wc-runtime-D-UdhneU.js";
import { mergeProps as ne, openBlock as r, createElementBlock as s, defineComponent as me, computed as b, ref as c, watch as ge, nextTick as J, onMounted as xe, onBeforeUnmount as ye, normalizeClass as be, createElementVNode as u, Fragment as B, createVNode as g, unref as f, createCommentVNode as v, createTextVNode as D, toDisplayString as k, renderList as X, createBlock as ke } from "vue";
import { Icon as _ } from "@iconify/vue";
import { a as _e, s as we } from "./index-CG8BrS0R.js";
import { host as M, on as Z } from "@wippy-fe/proxy";
import { d as Te, u as Se } from "./useSessionsApi-BIuCYu5K.js";
import Ce from "markdown-it";
import { i as ze } from "./hostRoute-zAgJIcxb.js";
import { b as ee, a as te, d as O, C as ae } from "./chatStart-BnNVHJnO.js";
var $e = `
    .p-textarea {
        font-family: inherit;
        font-feature-settings: inherit;
        font-size: 1rem;
        color: dt('textarea.color');
        background: dt('textarea.background');
        padding-block: dt('textarea.padding.y');
        padding-inline: dt('textarea.padding.x');
        border: 1px solid dt('textarea.border.color');
        transition:
            background dt('textarea.transition.duration'),
            color dt('textarea.transition.duration'),
            border-color dt('textarea.transition.duration'),
            outline-color dt('textarea.transition.duration'),
            box-shadow dt('textarea.transition.duration');
        appearance: none;
        border-radius: dt('textarea.border.radius');
        outline-color: transparent;
        box-shadow: dt('textarea.shadow');
    }

    .p-textarea:enabled:hover {
        border-color: dt('textarea.hover.border.color');
    }

    .p-textarea:enabled:focus {
        border-color: dt('textarea.focus.border.color');
        box-shadow: dt('textarea.focus.ring.shadow');
        outline: dt('textarea.focus.ring.width') dt('textarea.focus.ring.style') dt('textarea.focus.ring.color');
        outline-offset: dt('textarea.focus.ring.offset');
    }

    .p-textarea.p-invalid {
        border-color: dt('textarea.invalid.border.color');
    }

    .p-textarea.p-variant-filled {
        background: dt('textarea.filled.background');
    }

    .p-textarea.p-variant-filled:enabled:hover {
        background: dt('textarea.filled.hover.background');
    }

    .p-textarea.p-variant-filled:enabled:focus {
        background: dt('textarea.filled.focus.background');
    }

    .p-textarea:disabled {
        opacity: 1;
        background: dt('textarea.disabled.background');
        color: dt('textarea.disabled.color');
    }

    .p-textarea::placeholder {
        color: dt('textarea.placeholder.color');
    }

    .p-textarea.p-invalid::placeholder {
        color: dt('textarea.invalid.placeholder.color');
    }

    .p-textarea-fluid {
        width: 100%;
    }

    .p-textarea-resizable {
        overflow: hidden;
        resize: none;
    }

    .p-textarea-sm {
        font-size: dt('textarea.sm.font.size');
        padding-block: dt('textarea.sm.padding.y');
        padding-inline: dt('textarea.sm.padding.x');
    }

    .p-textarea-lg {
        font-size: dt('textarea.lg.font.size');
        padding-block: dt('textarea.lg.padding.y');
        padding-inline: dt('textarea.lg.padding.x');
    }
`, Pe = {
  root: function(t) {
    var o = t.instance, d = t.props;
    return ["p-textarea p-component", {
      "p-filled": o.$filled,
      "p-textarea-resizable ": d.autoResize,
      "p-textarea-sm p-inputfield-sm": d.size === "small",
      "p-textarea-lg p-inputfield-lg": d.size === "large",
      "p-invalid": o.$invalid,
      "p-variant-filled": o.$variant === "filled",
      "p-textarea-fluid": o.$fluid
    }];
  }
}, Ae = de.extend({
  name: "textarea",
  style: $e,
  classes: Pe
}), Re = {
  name: "BaseTextarea",
  extends: _e,
  props: {
    autoResize: Boolean
  },
  style: Ae,
  provide: function() {
    return {
      $pcTextarea: this,
      $parentInstance: this
    };
  }
};
function P(e) {
  "@babel/helpers - typeof";
  return P = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, P(e);
}
function Le(e, t, o) {
  return (t = Ee(t)) in e ? Object.defineProperty(e, t, { value: o, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = o, e;
}
function Ee(e) {
  var t = Ie(e, "string");
  return P(t) == "symbol" ? t : t + "";
}
function Ie(e, t) {
  if (P(e) != "object" || !e) return e;
  var o = e[Symbol.toPrimitive];
  if (o !== void 0) {
    var d = o.call(e, t);
    if (P(d) != "object") return d;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var re = {
  name: "Textarea",
  extends: Re,
  inheritAttrs: !1,
  observer: null,
  mounted: function() {
    var t = this;
    this.autoResize && (this.observer = new ResizeObserver(function() {
      requestAnimationFrame(function() {
        t.resize();
      });
    }), this.observer.observe(this.$el));
  },
  updated: function() {
    this.autoResize && this.resize();
  },
  beforeUnmount: function() {
    this.observer && this.observer.disconnect();
  },
  methods: {
    resize: function() {
      if (this.$el.offsetParent) {
        var t = this.$el.style.height, o = parseInt(t) || 0, d = this.$el.scrollHeight, x = !o || d > o, i = o && d < o;
        i ? (this.$el.style.height = "auto", this.$el.style.height = "".concat(this.$el.scrollHeight, "px")) : x && (this.$el.style.height = "".concat(d, "px"));
      }
    },
    onInput: function(t) {
      this.autoResize && this.resize(), this.writeValue(t.target.value, t);
    }
  },
  computed: {
    attrs: function() {
      return ne(this.ptmi("root", {
        context: {
          filled: this.$filled,
          disabled: this.disabled
        }
      }), this.formField);
    },
    dataP: function() {
      return ce(Le({
        invalid: this.$invalid,
        fluid: this.$fluid,
        filled: this.$variant === "filled"
      }, this.size, this.size));
    }
  }
}, Ve = ["value", "name", "disabled", "aria-invalid", "data-p"];
function He(e, t, o, d, x, i) {
  return r(), s("textarea", ne({
    class: e.cx("root"),
    value: e.d_value,
    name: e.name,
    disabled: e.disabled,
    "aria-invalid": e.invalid || void 0,
    "data-p": i.dataP,
    onInput: t[0] || (t[0] = function() {
      return i.onInput && i.onInput.apply(i, arguments);
    })
  }, i.attrs), null, 16, Ve);
}
re.render = He;
const N = new Ce({ html: !1, linkify: !0 }), Be = N.validateLink.bind(N);
N.validateLink = (e) => {
  if (e.startsWith("//") || e.includes("\\") || !Be(e)) return !1;
  const t = /^[a-z][a-z0-9+.-]*:/i.exec(e)?.[0].toLowerCase();
  return t === void 0 || t === "http:" || t === "https:" || t === "mailto:";
};
function Me(e) {
  return N.render(e);
}
function Ne(e, t) {
  if (e.button !== 0 || e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) return;
  const d = (e.target instanceof Element ? e.target.closest("a[href]") : null)?.getAttribute("href");
  d?.startsWith("/") && !d.startsWith("//") && (e.preventDefault(), t(d));
}
const Ue = { class: "kx-chat-start-body" }, qe = {
  key: 0,
  class: "kx-chat-start-intro"
}, Ke = {
  key: 0,
  class: "kx-chat-start-title"
}, De = { class: "kx-chat-start-icon" }, Oe = ["data-alignment", "innerHTML"], je = { class: "kx-chat-start-compose" }, We = {
  key: 0,
  class: "kx-chat-start-field"
}, Fe = { class: "kx-chat-start-controls" }, Ge = {
  key: 0,
  class: "kx-chat-start-agent"
}, Qe = ["aria-expanded", "disabled"], Ye = {
  key: 0,
  id: "chat-start-agents",
  class: "kx-chat-start-menu"
}, Je = { class: "kx-chat-start-search" }, Xe = { class: "kx-chat-start-list" }, Ze = {
  key: 0,
  class: "kx-chat-start-group"
}, et = ["aria-current", "onClick"], tt = { class: "kx-chat-start-item-title" }, at = {
  key: 0,
  class: "kx-chat-start-item-comment"
}, nt = {
  key: 0,
  class: "kx-chat-start-empty"
}, rt = {
  key: 1,
  class: "kx-chat-start-default"
}, ot = ["disabled"], st = {
  key: 2,
  class: "kx-chat-start-note is-error",
  role: "alert"
}, it = {
  key: 3,
  class: "kx-chat-start-note",
  role: "status"
}, lt = {
  key: 4,
  class: "kx-chat-start-note",
  role: "status"
}, ut = {
  key: 5,
  class: "kx-chat-start-note",
  role: "status"
}, dt = {
  key: 6,
  class: "kx-chat-start-note is-error",
  role: "alert"
}, ct = /* @__PURE__ */ me({
  __name: "ChatEmptyState",
  setup(e) {
    const t = Se(), o = pe(), d = fe(), x = b(() => d.value?.surface === "sessions" ? "sessions" : "sidebar"), i = c(Te(x.value)), oe = b(() => i.value.intro === "markdown" ? Me(i.value.markdown) : ""), A = c(""), T = c([]), R = c(""), S = c(!0), C = c(""), m = c(!1), L = c(""), y = c(""), j = c(!1), W = c(!1), E = b(() => !!y.value || j.value || W.value), z = c(""), I = c(null), F = c(null);
    let $ = 0, U;
    const V = [], p = b(() => T.value.flatMap((a) => a.agents).find((a) => a.name === (i.value.show_agent_picker ? R.value : i.value.default_agent))), G = b(() => !!p.value && !S.value && !C.value && !E.value), q = b(() => T.value.length > 0), Q = b(() => {
      const a = L.value.trim().toLowerCase();
      return a ? T.value.map((n) => ({
        title: n.title,
        agents: n.agents.filter((l) => l.title.toLowerCase().includes(a) || (l.comment || "").toLowerCase().includes(a))
      })).filter((n) => n.agents.length > 0) : T.value;
    });
    async function H() {
      const a = ++$;
      S.value = !0, C.value = "";
      try {
        const n = await t.chatAgents(x.value);
        a === $ && (T.value = n.groups, i.value = n.screen, n.screen.show_agent_picker || w(), n.groups.some((l) => l.agents.some((h) => h.name === R.value)) || (R.value = ""));
      } catch (n) {
        a === $ && (C.value = n.message || "Could not load agents");
      } finally {
        a === $ && (S.value = !1);
      }
    }
    function se() {
      E.value || !q.value || (m.value ? w() : m.value = !0);
    }
    function w(a = !1) {
      m.value && (m.value = !1, L.value = "", a && J(() => F.value?.focus()));
    }
    function ie(a) {
      R.value = a.name, w(!0);
    }
    function le() {
      const a = p.value?.start_token;
      if (!G.value || !a) return;
      const n = crypto.getRandomValues(new Uint32Array(4)).join("-");
      y.value = n, z.value = "", w(), U = setTimeout(() => {
        y.value === n && (y.value = "", z.value = "Chat did not respond. Please try again.");
      }, 5e3);
      const l = { id: n, token: a, message: i.value.show_message ? A.value : "" };
      o ? o.send(O, ae, l) : M.layout.send(O, ae, l);
    }
    function K(a) {
      a.sourcePanelId !== O || !ze(a.payload) || (a.channel === ee && (j.value = a.payload.pending === !0), !(a.channel !== te || a.payload.id !== y.value) && (clearTimeout(U), a.payload.state !== "accepted" && (y.value = "", a.payload.state === "finished" && (W.value = !0, A.value = ""), typeof a.payload.error == "string" && (z.value = a.payload.error))));
    }
    function Y(a) {
      m.value && I.value && !a.composedPath().includes(I.value) && w();
    }
    function ue(a) {
      a.key === "Escape" && m.value && (a.stopPropagation(), w(!0));
    }
    return ge(m, (a) => {
      a && J(() => I.value?.querySelector("#chat-start-search")?.focus());
    }), he(H), xe(() => {
      o ? V.push(o.subscribe(K)) : V.push(M.layout.on(ee, K), M.layout.on(te, K)), V.push(Z("nav.changed", () => {
        H();
      }), Z("welcome", () => {
        H();
      })), document.addEventListener("pointerdown", Y, !0);
    }), ye(() => {
      $++, clearTimeout(U), V.forEach((a) => a()), document.removeEventListener("pointerdown", Y, !0);
    }), (a, n) => (r(), s("section", {
      ref_key: "root",
      ref: I,
      class: be(["kx-chat-start", { "kx-chat-start--sessions": x.value === "sessions" }]),
      "aria-label": "Start a chat",
      onKeydown: ue
    }, [
      u("div", Ue, [
        i.value.intro === "default" ? (r(), s("div", qe, [
          x.value === "sessions" ? (r(), s("h2", Ke, "What can I help you with?")) : (r(), s(B, { key: 1 }, [
            u("span", De, [
              g(f(_), {
                icon: "tabler:message-circle",
                "aria-hidden": "true"
              })
            ]),
            n[3] || (n[3] = u("h2", { class: "kx-chat-start-title" }, "Start a chat", -1)),
            n[4] || (n[4] = u("p", { class: "kx-chat-start-text" }, "You can also open a previous session above.", -1))
          ], 64))
        ])) : i.value.intro === "markdown" ? (r(), s("div", {
          key: 1,
          class: "kx-chat-start-intro kx-chat-intro-markdown",
          "data-alignment": i.value.markdown_alignment,
          innerHTML: oe.value,
          onClick: n[0] || (n[0] = (l) => f(Ne)(l, f(M).navigate))
        }, null, 8, Oe)) : v("", !0),
        u("div", je, [
          i.value.show_message ? (r(), s("label", We, [
            n[5] || (n[5] = u("span", null, [
              D("Message "),
              u("span", { class: "kx-chat-start-optional" }, "(optional)")
            ], -1)),
            g(f(re), {
              modelValue: A.value,
              "onUpdate:modelValue": n[1] || (n[1] = (l) => A.value = l),
              placeholder: "Type a message…",
              readonly: !!y.value,
              rows: "3",
              fluid: ""
            }, null, 8, ["modelValue", "readonly"])
          ])) : v("", !0),
          u("div", Fe, [
            i.value.show_agent_picker ? (r(), s("div", Ge, [
              u("button", {
                ref_key: "trigger",
                ref: F,
                type: "button",
                class: "kx-btn kx-btn-ghost kx-chat-start-picker",
                "aria-controls": "chat-start-agents",
                "aria-expanded": m.value,
                disabled: S.value || E.value || !q.value,
                onClick: se
              }, [
                g(f(_), {
                  icon: p.value?.icon || "wippy:agent",
                  "aria-hidden": "true"
                }, null, 8, ["icon"]),
                u("span", null, k(p.value ? p.value.title : "Select agent"), 1),
                g(f(_), {
                  icon: "tabler:chevron-down",
                  "aria-hidden": "true"
                })
              ], 8, Qe),
              m.value ? (r(), s("div", Ye, [
                u("div", Je, [
                  n[6] || (n[6] = u("label", {
                    class: "sr-only",
                    for: "chat-start-search"
                  }, "Search agents", -1)),
                  g(f(we), {
                    id: "chat-start-search",
                    modelValue: L.value,
                    "onUpdate:modelValue": n[2] || (n[2] = (l) => L.value = l),
                    type: "search",
                    placeholder: "Search agents…",
                    autocomplete: "off",
                    fluid: ""
                  }, null, 8, ["modelValue"])
                ]),
                u("div", Xe, [
                  (r(!0), s(B, null, X(Q.value, (l) => (r(), s(B, {
                    key: l.title
                  }, [
                    l.title ? (r(), s("div", Ze, k(l.title), 1)) : v("", !0),
                    (r(!0), s(B, null, X(l.agents, (h) => (r(), s("button", {
                      key: `${l.title}:${h.name}`,
                      type: "button",
                      class: "kx-chat-start-item",
                      "aria-current": p.value?.name === h.name ? "true" : void 0,
                      onClick: (pt) => ie(h)
                    }, [
                      u("span", tt, [
                        g(f(_), {
                          icon: h.icon || "wippy:agent",
                          "aria-hidden": "true"
                        }, null, 8, ["icon"]),
                        u("span", null, k(h.title || h.name), 1)
                      ]),
                      h.comment ? (r(), s("span", at, k(h.comment), 1)) : v("", !0)
                    ], 8, et))), 128))
                  ], 64))), 128)),
                  Q.value.length === 0 ? (r(), s("p", nt, "No agents match.")) : v("", !0)
                ])
              ])) : v("", !0)
            ])) : p.value ? (r(), s("div", rt, [
              g(f(_), {
                icon: p.value.icon || "wippy:agent",
                "aria-hidden": "true"
              }, null, 8, ["icon"]),
              u("span", null, k(p.value.title || p.value.name), 1)
            ])) : v("", !0),
            u("button", {
              type: "button",
              class: "kx-btn kx-btn-primary kx-chat-start-submit",
              disabled: !G.value,
              onClick: le
            }, [
              E.value ? (r(), ke(f(_), {
                key: 0,
                icon: "tabler:loader-2",
                class: "spin",
                "aria-hidden": "true"
              })) : v("", !0),
              n[7] || (n[7] = u("span", null, "Start chat", -1))
            ], 8, ot)
          ])
        ]),
        C.value ? (r(), s("p", st, [
          D(k(C.value) + " ", 1),
          u("button", {
            type: "button",
            class: "kx-chat-start-retry",
            onClick: H
          }, "Retry")
        ])) : S.value ? (r(), s("p", it, "Loading agents…")) : !i.value.show_agent_picker && !p.value ? (r(), s("p", lt, " The default agent is unavailable for your account. ")) : q.value ? v("", !0) : (r(), s("p", ut, [
          g(f(_), {
            icon: "tabler:alert-circle",
            "aria-hidden": "true"
          }),
          n[8] || (n[8] = D(" No agents available. Please contact your administrator. ", -1))
        ])),
        z.value ? (r(), s("p", dt, k(z.value), 1)) : v("", !0)
      ])
    ], 34));
  }
}), _t = {
  rootComponent: ct,
  plugins: [ve]
};
export {
  _t as mountConfig
};
//# sourceMappingURL=chat_empty_state-mount-D39frekm.js.map

import { B as Ae, L as Ye, i as ce, j as ie, o as et, U as tt, q as Be, g as nt, r as st, t as Te, w as at, c as ot, b as rt, f as it, x as xe, y as lt, l as ut, P as ct } from "./wc-runtime-D-UdhneU.js";
import { defineComponent as Ee, ref as S, computed as L, onMounted as Ne, onBeforeUnmount as Ke, openBlock as d, createElementBlock as m, normalizeClass as B, createElementVNode as i, createVNode as v, unref as p, withDirectives as Fe, withKeys as _e, withModifiers as $e, vModelText as ze, toDisplayString as F, createCommentVNode as E, createTextVNode as se, withCtx as N, nextTick as Ce, resolveComponent as Me, resolveDirective as dt, createBlock as he, mergeProps as H, Transition as ft, renderSlot as ne, Fragment as X, resolveDynamicComponent as pt, renderList as Le, watch as Re } from "vue";
import { Icon as k } from "@iconify/vue";
import { s as Y, d as mt, u as vt, a as ht, b as bt, e as yt, f as kt, g as wt } from "./useInventoryRefresh-DU_o_JEV.js";
import { on as ve, host as gt } from "@wippy-fe/proxy";
import { u as xt } from "./useSessionsApi-BIuCYu5K.js";
import { s as _t } from "./index-DiVT_d-J.js";
const $t = ["title", "aria-label"], Ct = {
  key: 0,
  class: "kx-row-main kx-row-main-edit"
}, St = ["onKeydown"], Lt = ["aria-current"], Et = ["title"], Ft = { class: "kx-row-meta" }, Ot = {
  key: 0,
  class: "kx-row-agent"
}, Dt = { key: 1 }, Pt = ["title"], Bt = {
  key: 3,
  class: "kx-sub-bad"
}, Mt = { class: "kx-row-end" }, Rt = ["disabled"], It = /* @__PURE__ */ Ee({
  __name: "SessionRow",
  props: {
    session: {},
    agent: {},
    favorite: { type: Boolean },
    active: { type: Boolean },
    providers: {}
  },
  emits: ["resume", "restart", "preview", "delete", "favorite", "rename"],
  setup(e, { emit: t }) {
    const n = e, r = t, c = S(!1), l = S(""), C = S(null), h = S(null), _ = S(null), g = S(null), w = S(!1), O = L(() => n.session.title?.trim() || "Untitled chat"), D = L(() => {
      const f = n.session.meta, u = f && typeof f == "object" ? f.provider : void 0, b = typeof u == "string" ? u.trim().toLowerCase() : "", $ = n.providers;
      return b && $ && Object.hasOwn($, b) ? $[b] : b ? { icon: "tabler:plug-connected", label: b } : (n.session.kind || "").toUpperCase() === "DM" ? { icon: "tabler:message-dots", label: "Direct message" } : { icon: "tabler:message-circle", label: "Chat" };
    }), M = L(() => (n.session.status || "idle").toLowerCase()), j = L(() => M.value === "failed" || M.value === "error"), R = L(() => {
      const f = n.session.meta?.tokens;
      if (!f || typeof f != "object") return null;
      const u = (Q) => typeof f[Q] == "number" ? f[Q] : 0, b = u("total_tokens") || u("prompt_tokens") + u("completion_tokens") + u("thinking_tokens");
      if (!b) return null;
      const $ = [];
      return u("prompt_tokens") && $.push(`${u("prompt_tokens").toLocaleString()} in`), u("completion_tokens") && $.push(`${u("completion_tokens").toLocaleString()} out`), u("thinking_tokens") && $.push(`${u("thinking_tokens").toLocaleString()} thinking`), {
        label: q(b),
        title: `${b.toLocaleString()} tokens${$.length ? ` (${$.join(" · ")})` : ""}`
      };
    });
    function q(f) {
      return f >= 1e6 ? `${(f / 1e6).toFixed(f >= 1e7 ? 0 : 1)}M` : f >= 1e3 ? `${(f / 1e3).toFixed(f >= 1e4 ? 0 : 1)}k` : String(f);
    }
    const A = L(() => {
      const f = n.session.last_message_date || n.session.start_date;
      if (!f) return "";
      const u = new Date(f).getTime();
      if (Number.isNaN(u)) return "";
      const b = Date.now() - u, $ = 6e4, Q = 36e5, oe = 864e5;
      return b < $ ? "just now" : b < Q ? `${Math.floor(b / $)}m ago` : b < oe ? `${Math.floor(b / Q)}h ago` : b < 7 * oe ? `${Math.floor(b / oe)}d ago` : new Date(f).toLocaleDateString();
    });
    async function J() {
      w.value = !1, l.value = n.session.title || "", c.value = !0, await Ce(), C.value?.focus(), C.value?.select();
    }
    function z() {
      const f = l.value.trim();
      c.value = !1, f && f !== (n.session.title || "") && r("rename", f);
    }
    function G() {
      c.value = !1;
    }
    function Z() {
      c.value || r("resume");
    }
    async function ae() {
      w.value = !0, await Ce(), g.value?.querySelector('[role="menuitem"]:not(:disabled)')?.focus();
    }
    function U(f = !1) {
      w.value = !1, f && Ce(() => _.value?.focus());
    }
    function K() {
      w.value ? U() : ae();
    }
    function P(f) {
      const u = [...g.value?.querySelectorAll('[role="menuitem"]:not(:disabled)') || []];
      if (!u.length) return;
      const b = Math.max(0, u.indexOf(document.activeElement));
      let $ = b;
      if (f.key === "ArrowDown") $ = (b + 1) % u.length;
      else if (f.key === "ArrowUp") $ = (b - 1 + u.length) % u.length;
      else if (f.key === "Home") $ = 0;
      else if (f.key === "End") $ = u.length - 1;
      else if (f.key === "Escape") {
        f.preventDefault(), U(!0);
        return;
      } else return;
      f.preventDefault(), u[$]?.focus();
    }
    function V(f) {
      U(), r(f === "restart" ? "restart" : f === "preview" ? "preview" : "delete");
    }
    function pe(f) {
      w.value && h.value && !f.composedPath().includes(h.value) && U();
    }
    return Ne(() => document.addEventListener("click", pe)), Ke(() => document.removeEventListener("click", pe)), (f, u) => (d(), m("div", {
      ref_key: "rowEl",
      ref: h,
      class: B(["kx-row", { "kx-row-edit": c.value, "kx-row-active": e.active }])
    }, [
      i("span", {
        class: "kx-src",
        title: D.value.label,
        "aria-label": D.value.label,
        role: "img"
      }, [
        v(p(k), {
          icon: D.value.icon,
          "aria-hidden": "true"
        }, null, 8, ["icon"])
      ], 8, $t),
      c.value ? (d(), m("div", Ct, [
        Fe(i("input", {
          ref_key: "inputEl",
          ref: C,
          "onUpdate:modelValue": u[0] || (u[0] = (b) => l.value = b),
          class: "kx-edit",
          "aria-label": "Rename chat",
          onKeydown: [
            _e($e(z, ["prevent"]), ["enter"]),
            _e($e(G, ["prevent"]), ["esc"])
          ],
          onBlur: z
        }, null, 40, St), [
          [ze, l.value]
        ])
      ])) : (d(), m("button", {
        key: 1,
        type: "button",
        class: "kx-row-main",
        "aria-current": e.active ? "page" : void 0,
        onClick: Z
      }, [
        i("span", {
          class: "kx-name",
          title: O.value
        }, F(O.value), 9, Et),
        i("span", Ft, [
          e.agent ? (d(), m("span", Ot, F(e.agent), 1)) : E("", !0),
          A.value ? (d(), m("span", Dt, F(A.value), 1)) : E("", !0),
          R.value ? (d(), m("span", {
            key: 2,
            class: "kx-tok",
            title: R.value.title
          }, [
            v(p(k), {
              icon: "tabler:coins",
              "aria-hidden": "true"
            }),
            se(F(R.value.label), 1)
          ], 8, Pt)) : E("", !0),
          j.value ? (d(), m("span", Bt, "failed")) : E("", !0)
        ])
      ], 8, Lt)),
      i("div", Mt, [
        v(p(Y), {
          type: "button",
          severity: "secondary",
          text: "",
          class: B(["kx-fav", { "kx-fav-on": e.favorite }]),
          title: e.favorite ? "Remove from favorites" : "Add to favorites",
          "aria-label": e.favorite ? "Remove from favorites" : "Add to favorites",
          "aria-pressed": e.favorite,
          onClick: u[1] || (u[1] = (b) => r("favorite"))
        }, {
          icon: N(({ class: b }) => [
            v(p(k), {
              icon: e.favorite ? "tabler:star-filled" : "tabler:star",
              class: B(b),
              "aria-hidden": "true"
            }, null, 8, ["icon", "class"])
          ]),
          _: 1
        }, 8, ["class", "title", "aria-label", "aria-pressed"]),
        v(p(Y), {
          ref_key: "menuTrigger",
          ref: _,
          type: "button",
          severity: "secondary",
          text: "",
          class: "kx-menu-trigger",
          title: "Session actions",
          "aria-label": "Session actions",
          "aria-haspopup": "menu",
          "aria-expanded": w.value,
          onClick: K,
          onKeydown: _e($e(ae, ["prevent"]), ["arrow-down"])
        }, {
          icon: N(({ class: b }) => [
            v(p(k), {
              icon: "tabler:dots-vertical",
              class: B(b),
              "aria-hidden": "true"
            }, null, 8, ["class"])
          ]),
          _: 1
        }, 8, ["aria-expanded", "onKeydown"]),
        w.value ? (d(), m("div", {
          key: 0,
          ref_key: "menuEl",
          ref: g,
          class: "kx-row-menu",
          role: "menu",
          "aria-label": "Session actions",
          onKeydown: P
        }, [
          i("button", {
            type: "button",
            class: "kx-menu-item",
            role: "menuitem",
            onClick: u[2] || (u[2] = (b) => V("restart"))
          }, [
            v(p(k), {
              icon: "tabler:refresh",
              "aria-hidden": "true"
            }),
            u[5] || (u[5] = i("span", null, "Restart as new chat", -1))
          ]),
          i("button", {
            type: "button",
            class: "kx-menu-item",
            role: "menuitem",
            onClick: u[3] || (u[3] = (b) => V("preview"))
          }, [
            v(p(k), {
              icon: "tabler:eye",
              "aria-hidden": "true"
            }),
            u[6] || (u[6] = i("span", null, "Preview messages", -1))
          ]),
          i("button", {
            type: "button",
            class: "kx-menu-item",
            role: "menuitem",
            disabled: c.value,
            onClick: J
          }, [
            v(p(k), {
              icon: "tabler:pencil",
              "aria-hidden": "true"
            }),
            u[7] || (u[7] = i("span", null, "Rename", -1))
          ], 8, Rt),
          i("button", {
            type: "button",
            class: "kx-menu-item kx-menu-item-danger",
            role: "menuitem",
            onClick: u[4] || (u[4] = (b) => V("delete"))
          }, [
            v(p(k), {
              icon: "tabler:trash",
              "aria-hidden": "true"
            }),
            u[8] || (u[8] = i("span", null, "Delete", -1))
          ])
        ], 544)) : E("", !0)
      ])
    ], 2));
  }
});
var jt = Ae.extend({
  name: "focustrap-directive"
}), At = et.extend({
  style: jt
});
function de(e) {
  "@babel/helpers - typeof";
  return de = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, de(e);
}
function Ie(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(e);
    t && (r = r.filter(function(c) {
      return Object.getOwnPropertyDescriptor(e, c).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function je(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? Ie(Object(n), !0).forEach(function(r) {
      Tt(e, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Ie(Object(n)).forEach(function(r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return e;
}
function Tt(e, t, n) {
  return (t = Nt(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Nt(e) {
  var t = Kt(e, "string");
  return de(t) == "symbol" ? t : t + "";
}
function Kt(e, t) {
  if (de(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (de(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var zt = At.extend("focustrap", {
  mounted: function(t, n) {
    var r = n.value || {}, c = r.disabled;
    c || (this.createHiddenFocusableElements(t, n), this.bind(t, n), this.autoElementFocus(t, n)), t.setAttribute("data-pd-focustrap", !0), this.$el = t;
  },
  updated: function(t, n) {
    var r = n.value || {}, c = r.disabled;
    c && this.unbind(t);
  },
  unmounted: function(t) {
    this.unbind(t);
  },
  methods: {
    getComputedSelector: function(t) {
      return ':not(.p-hidden-focusable):not([data-p-hidden-focusable="true"])'.concat(t ?? "");
    },
    bind: function(t, n) {
      var r = this, c = n.value || {}, l = c.onFocusIn, C = c.onFocusOut;
      t.$_pfocustrap_mutationobserver = new MutationObserver(function(h) {
        h.forEach(function(_) {
          if (_.type === "childList" && !t.contains(document.activeElement)) {
            var g = function(O) {
              var D = Be(O) ? Be(O, r.getComputedSelector(t.$_pfocustrap_focusableselector)) ? O : ie(t, r.getComputedSelector(t.$_pfocustrap_focusableselector)) : ie(O);
              return nt(D) ? D : O.nextSibling && g(O.nextSibling);
            };
            ce(g(_.nextSibling));
          }
        });
      }), t.$_pfocustrap_mutationobserver.disconnect(), t.$_pfocustrap_mutationobserver.observe(t, {
        childList: !0
      }), t.$_pfocustrap_focusinlistener = function(h) {
        return l && l(h);
      }, t.$_pfocustrap_focusoutlistener = function(h) {
        return C && C(h);
      }, t.addEventListener("focusin", t.$_pfocustrap_focusinlistener), t.addEventListener("focusout", t.$_pfocustrap_focusoutlistener);
    },
    unbind: function(t) {
      t.$_pfocustrap_mutationobserver && t.$_pfocustrap_mutationobserver.disconnect(), t.$_pfocustrap_focusinlistener && t.removeEventListener("focusin", t.$_pfocustrap_focusinlistener) && (t.$_pfocustrap_focusinlistener = null), t.$_pfocustrap_focusoutlistener && t.removeEventListener("focusout", t.$_pfocustrap_focusoutlistener) && (t.$_pfocustrap_focusoutlistener = null);
    },
    autoFocus: function(t) {
      this.autoElementFocus(this.$el, {
        value: je(je({}, t), {}, {
          autoFocus: !0
        })
      });
    },
    autoElementFocus: function(t, n) {
      var r = n.value || {}, c = r.autoFocusSelector, l = c === void 0 ? "" : c, C = r.firstFocusableSelector, h = C === void 0 ? "" : C, _ = r.autoFocus, g = _ === void 0 ? !1 : _, w = ie(t, "[autofocus]".concat(this.getComputedSelector(l)));
      g && !w && (w = ie(t, this.getComputedSelector(h))), ce(w);
    },
    onFirstHiddenElementFocus: function(t) {
      var n, r = t.currentTarget, c = t.relatedTarget, l = c === r.$_pfocustrap_lasthiddenfocusableelement || !((n = this.$el) !== null && n !== void 0 && n.contains(c)) ? ie(r.parentElement, this.getComputedSelector(r.$_pfocustrap_focusableselector)) : r.$_pfocustrap_lasthiddenfocusableelement;
      ce(l);
    },
    onLastHiddenElementFocus: function(t) {
      var n, r = t.currentTarget, c = t.relatedTarget, l = c === r.$_pfocustrap_firsthiddenfocusableelement || !((n = this.$el) !== null && n !== void 0 && n.contains(c)) ? Ye(r.parentElement, this.getComputedSelector(r.$_pfocustrap_focusableselector)) : r.$_pfocustrap_firsthiddenfocusableelement;
      ce(l);
    },
    createHiddenFocusableElements: function(t, n) {
      var r = this, c = n.value || {}, l = c.tabIndex, C = l === void 0 ? 0 : l, h = c.firstFocusableSelector, _ = h === void 0 ? "" : h, g = c.lastFocusableSelector, w = g === void 0 ? "" : g, O = function(R) {
        return tt("span", {
          class: "p-hidden-accessible p-hidden-focusable",
          tabIndex: C,
          role: "presentation",
          "aria-hidden": !0,
          "data-p-hidden-accessible": !0,
          "data-p-hidden-focusable": !0,
          onFocus: R?.bind(r)
        });
      }, D = O(this.onFirstHiddenElementFocus), M = O(this.onLastHiddenElementFocus);
      D.$_pfocustrap_lasthiddenfocusableelement = M, D.$_pfocustrap_focusableselector = _, D.setAttribute("data-pc-section", "firstfocusableelement"), M.$_pfocustrap_firsthiddenfocusableelement = D, M.$_pfocustrap_focusableselector = w, M.setAttribute("data-pc-section", "lastfocusableelement"), t.prepend(D), t.append(M);
    }
  }
});
function Ut() {
  at({
    variableName: Te("scrollbar.width").name
  });
}
function Vt() {
  st({
    variableName: Te("scrollbar.width").name
  });
}
var Ht = `
    .p-drawer {
        display: flex;
        flex-direction: column;
        transform: translate3d(0px, 0px, 0px);
        position: relative;
        transition: transform 0.3s;
        background: dt('drawer.background');
        color: dt('drawer.color');
        border-style: solid;
        border-color: dt('drawer.border.color');
        box-shadow: dt('drawer.shadow');
    }

    .p-drawer-content {
        overflow-y: auto;
        flex-grow: 1;
        padding: dt('drawer.content.padding');
    }

    .p-drawer-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-shrink: 0;
        padding: dt('drawer.header.padding');
    }

    .p-drawer-footer {
        padding: dt('drawer.footer.padding');
    }

    .p-drawer-title {
        font-weight: dt('drawer.title.font.weight');
        font-size: dt('drawer.title.font.size');
    }

    .p-drawer-full .p-drawer {
        transition: none;
        transform: none;
        width: 100vw !important;
        height: 100vh !important;
        max-height: 100%;
        top: 0px !important;
        left: 0px !important;
        border-width: 1px;
    }

    .p-drawer-left .p-drawer-enter-active {
        animation: p-animate-drawer-enter-left 0.5s cubic-bezier(0.32, 0.72, 0, 1);
    }
    .p-drawer-left .p-drawer-leave-active {
        animation: p-animate-drawer-leave-left 0.5s cubic-bezier(0.32, 0.72, 0, 1);
    }

    .p-drawer-right .p-drawer-enter-active {
        animation: p-animate-drawer-enter-right 0.5s cubic-bezier(0.32, 0.72, 0, 1);
    }
    .p-drawer-right .p-drawer-leave-active {
        animation: p-animate-drawer-leave-right 0.5s cubic-bezier(0.32, 0.72, 0, 1);
    }

    .p-drawer-top .p-drawer-enter-active {
        animation: p-animate-drawer-enter-top 0.5s cubic-bezier(0.32, 0.72, 0, 1);
    }
    .p-drawer-top .p-drawer-leave-active {
        animation: p-animate-drawer-leave-top 0.5s cubic-bezier(0.32, 0.72, 0, 1);
    }

    .p-drawer-bottom .p-drawer-enter-active {
        animation: p-animate-drawer-enter-bottom 0.5s cubic-bezier(0.32, 0.72, 0, 1);
    }
    .p-drawer-bottom .p-drawer-leave-active {
        animation: p-animate-drawer-leave-bottom 0.5s cubic-bezier(0.32, 0.72, 0, 1);
    }

    .p-drawer-full .p-drawer-enter-active {
        animation: p-animate-drawer-enter-full 0.5s cubic-bezier(0.32, 0.72, 0, 1);
    }
    .p-drawer-full .p-drawer-leave-active {
        animation: p-animate-drawer-leave-full 0.5s cubic-bezier(0.32, 0.72, 0, 1);
    }
    
    .p-drawer-left .p-drawer {
        width: 20rem;
        height: 100%;
        border-inline-end-width: 1px;
    }

    .p-drawer-right .p-drawer {
        width: 20rem;
        height: 100%;
        border-inline-start-width: 1px;
    }

    .p-drawer-top .p-drawer {
        height: 10rem;
        width: 100%;
        border-block-end-width: 1px;
    }

    .p-drawer-bottom .p-drawer {
        height: 10rem;
        width: 100%;
        border-block-start-width: 1px;
    }

    .p-drawer-left .p-drawer-content,
    .p-drawer-right .p-drawer-content,
    .p-drawer-top .p-drawer-content,
    .p-drawer-bottom .p-drawer-content {
        width: 100%;
        height: 100%;
    }

    .p-drawer-open {
        display: flex;
    }

    .p-drawer-mask:dir(rtl) {
        flex-direction: row-reverse;
    }

    @keyframes p-animate-drawer-enter-left {
        from {
            transform: translate3d(-100%, 0px, 0px);
        }
    }

    @keyframes p-animate-drawer-leave-left {
        to {
            transform: translate3d(-100%, 0px, 0px);
        }
    }

    @keyframes p-animate-drawer-enter-right {
        from {
            transform: translate3d(100%, 0px, 0px);
        }
    }

    @keyframes p-animate-drawer-leave-right {
        to {
            transform: translate3d(100%, 0px, 0px);
        }
    }

    @keyframes p-animate-drawer-enter-top {
        from {
            transform: translate3d(0px, -100%, 0px);
        }
    }

    @keyframes p-animate-drawer-leave-top {
        to {
            transform: translate3d(0px, -100%, 0px);
        }
    }

    @keyframes p-animate-drawer-enter-bottom {
        from {
            transform: translate3d(0px, 100%, 0px);
        }
    }

    @keyframes p-animate-drawer-leave-bottom {
        to {
            transform: translate3d(0px, 100%, 0px);
        }
    }

    @keyframes p-animate-drawer-enter-full {
        from {
            opacity: 0;
            transform: scale(0.93);
        }
    }

    @keyframes p-animate-drawer-leave-full {
        to {
            opacity: 0;
            transform: scale(0.93);
        }
    }
`, qt = {
  mask: function(t) {
    var n = t.position, r = t.modal;
    return {
      position: "fixed",
      height: "100%",
      width: "100%",
      left: 0,
      top: 0,
      display: "flex",
      justifyContent: n === "left" ? "flex-start" : n === "right" ? "flex-end" : "center",
      alignItems: n === "top" ? "flex-start" : n === "bottom" ? "flex-end" : "center",
      pointerEvents: r ? "auto" : "none"
    };
  },
  root: {
    pointerEvents: "auto"
  }
}, Zt = {
  mask: function(t) {
    var n = t.instance, r = t.props, c = ["left", "right", "top", "bottom"], l = c.find(function(C) {
      return C === r.position;
    });
    return ["p-drawer-mask", {
      "p-overlay-mask p-overlay-mask-enter-active": r.modal,
      "p-drawer-open": n.containerVisible,
      "p-drawer-full": n.fullScreen
    }, l ? "p-drawer-".concat(l) : ""];
  },
  root: function(t) {
    var n = t.instance;
    return ["p-drawer p-component", {
      "p-drawer-full": n.fullScreen
    }];
  },
  header: "p-drawer-header",
  title: "p-drawer-title",
  pcCloseButton: "p-drawer-close-button",
  content: "p-drawer-content",
  footer: "p-drawer-footer"
}, Wt = Ae.extend({
  name: "drawer",
  style: Ht,
  classes: Zt,
  inlineStyles: qt
}), Jt = {
  name: "BaseDrawer",
  extends: rt,
  props: {
    visible: {
      type: Boolean,
      default: !1
    },
    position: {
      type: String,
      default: "left"
    },
    header: {
      type: null,
      default: null
    },
    baseZIndex: {
      type: Number,
      default: 0
    },
    autoZIndex: {
      type: Boolean,
      default: !0
    },
    dismissable: {
      type: Boolean,
      default: !0
    },
    showCloseIcon: {
      type: Boolean,
      default: !0
    },
    closeButtonProps: {
      type: Object,
      default: function() {
        return {
          severity: "secondary",
          text: !0,
          rounded: !0
        };
      }
    },
    closeIcon: {
      type: String,
      default: void 0
    },
    modal: {
      type: Boolean,
      default: !0
    },
    blockScroll: {
      type: Boolean,
      default: !1
    },
    closeOnEscape: {
      type: Boolean,
      default: !0
    }
  },
  style: Wt,
  provide: function() {
    return {
      $pcDrawer: this,
      $parentInstance: this
    };
  }
};
function fe(e) {
  "@babel/helpers - typeof";
  return fe = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, fe(e);
}
function Se(e, t, n) {
  return (t = Gt(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Gt(e) {
  var t = Qt(e, "string");
  return fe(t) == "symbol" ? t : t + "";
}
function Qt(e, t) {
  if (fe(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (fe(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var Ue = {
  name: "Drawer",
  extends: Jt,
  inheritAttrs: !1,
  emits: ["update:visible", "show", "after-show", "hide", "after-hide", "before-hide"],
  data: function() {
    return {
      containerVisible: this.visible
    };
  },
  container: null,
  mask: null,
  content: null,
  headerContainer: null,
  footerContainer: null,
  closeButton: null,
  outsideClickListener: null,
  documentKeydownListener: null,
  watch: {
    dismissable: function(t) {
      t && !this.modal ? this.bindOutsideClickListener() : this.unbindOutsideClickListener();
    }
  },
  updated: function() {
    this.visible && (this.containerVisible = this.visible);
  },
  beforeUnmount: function() {
    this.disableDocumentSettings(), this.mask && this.autoZIndex && xe.clear(this.mask), this.container = null, this.mask = null;
  },
  methods: {
    hide: function() {
      this.$emit("update:visible", !1);
    },
    onEnter: function() {
      this.$emit("show"), this.focus(), this.bindDocumentKeyDownListener(), this.autoZIndex && xe.set("modal", this.mask, this.baseZIndex || this.$primevue.config.zIndex.modal);
    },
    onAfterEnter: function() {
      this.enableDocumentSettings(), this.$emit("after-show");
    },
    onBeforeLeave: function() {
      this.modal && !this.isUnstyled && lt(this.mask, "p-overlay-mask-leave-active"), this.$emit("before-hide");
    },
    onLeave: function() {
      this.$emit("hide");
    },
    onAfterLeave: function() {
      this.autoZIndex && xe.clear(this.mask), this.unbindDocumentKeyDownListener(), this.containerVisible = !1, this.disableDocumentSettings(), this.$emit("after-hide");
    },
    onMaskClick: function(t) {
      this.dismissable && this.modal && this.mask === t.target && this.hide();
    },
    focus: function() {
      var t = function(c) {
        return c && c.querySelector("[autofocus]");
      }, n = this.$slots.header && t(this.headerContainer);
      n || (n = this.$slots.default && t(this.container), n || (n = this.$slots.footer && t(this.footerContainer), n || (n = this.closeButton))), n && ce(n);
    },
    enableDocumentSettings: function() {
      this.dismissable && !this.modal && this.bindOutsideClickListener(), this.blockScroll && Ut();
    },
    disableDocumentSettings: function() {
      this.unbindOutsideClickListener(), this.blockScroll && Vt();
    },
    onKeydown: function(t) {
      t.code === "Escape" && this.closeOnEscape && this.hide();
    },
    containerRef: function(t) {
      this.container = t;
    },
    maskRef: function(t) {
      this.mask = t;
    },
    contentRef: function(t) {
      this.content = t;
    },
    headerContainerRef: function(t) {
      this.headerContainer = t;
    },
    footerContainerRef: function(t) {
      this.footerContainer = t;
    },
    closeButtonRef: function(t) {
      this.closeButton = t ? t.$el : void 0;
    },
    bindDocumentKeyDownListener: function() {
      this.documentKeydownListener || (this.documentKeydownListener = this.onKeydown, document.addEventListener("keydown", this.documentKeydownListener));
    },
    unbindDocumentKeyDownListener: function() {
      this.documentKeydownListener && (document.removeEventListener("keydown", this.documentKeydownListener), this.documentKeydownListener = null);
    },
    bindOutsideClickListener: function() {
      var t = this;
      this.outsideClickListener || (this.outsideClickListener = function(n) {
        t.isOutsideClicked(n) && t.hide();
      }, document.addEventListener("click", this.outsideClickListener, !0));
    },
    unbindOutsideClickListener: function() {
      this.outsideClickListener && (document.removeEventListener("click", this.outsideClickListener, !0), this.outsideClickListener = null);
    },
    isOutsideClicked: function(t) {
      return this.container && !this.container.contains(t.target);
    }
  },
  computed: {
    fullScreen: function() {
      return this.position === "full";
    },
    closeAriaLabel: function() {
      return this.$primevue.config.locale.aria ? this.$primevue.config.locale.aria.close : void 0;
    },
    dataP: function() {
      return it(Se(Se(Se({
        "full-screen": this.position === "full"
      }, this.position, this.position), "open", this.containerVisible), "modal", this.modal));
    }
  },
  directives: {
    focustrap: zt
  },
  components: {
    Button: Y,
    Portal: ot,
    TimesIcon: _t
  }
}, Xt = ["data-p"], Yt = ["role", "aria-modal", "data-p"];
function en(e, t, n, r, c, l) {
  var C = Me("Button"), h = Me("Portal"), _ = dt("focustrap");
  return d(), he(h, null, {
    default: N(function() {
      return [c.containerVisible ? (d(), m("div", H({
        key: 0,
        ref: l.maskRef,
        onMousedown: t[0] || (t[0] = function() {
          return l.onMaskClick && l.onMaskClick.apply(l, arguments);
        }),
        class: e.cx("mask"),
        style: e.sx("mask", !0, {
          position: e.position,
          modal: e.modal
        }),
        "data-p": l.dataP
      }, e.ptm("mask")), [v(ft, H({
        name: "p-drawer",
        onEnter: l.onEnter,
        onAfterEnter: l.onAfterEnter,
        onBeforeLeave: l.onBeforeLeave,
        onLeave: l.onLeave,
        onAfterLeave: l.onAfterLeave,
        appear: ""
      }, e.ptm("transition")), {
        default: N(function() {
          return [e.visible ? Fe((d(), m("div", H({
            key: 0,
            ref: l.containerRef,
            class: e.cx("root"),
            style: e.sx("root"),
            role: e.modal ? "dialog" : "complementary",
            "aria-modal": e.modal ? !0 : void 0,
            "data-p": l.dataP
          }, e.ptmi("root")), [e.$slots.container ? ne(e.$slots, "container", {
            key: 0,
            closeCallback: l.hide
          }) : (d(), m(X, {
            key: 1
          }, [i("div", H({
            ref: l.headerContainerRef,
            class: e.cx("header")
          }, e.ptm("header")), [ne(e.$slots, "header", {
            class: B(e.cx("title"))
          }, function() {
            return [e.header ? (d(), m("div", H({
              key: 0,
              class: e.cx("title")
            }, e.ptm("title")), F(e.header), 17)) : E("", !0)];
          }), e.showCloseIcon ? ne(e.$slots, "closebutton", {
            key: 0,
            closeCallback: l.hide
          }, function() {
            return [v(C, H({
              ref: l.closeButtonRef,
              type: "button",
              class: e.cx("pcCloseButton"),
              "aria-label": l.closeAriaLabel,
              unstyled: e.unstyled,
              onClick: l.hide
            }, e.closeButtonProps, {
              pt: e.ptm("pcCloseButton"),
              "data-pc-group-section": "iconcontainer"
            }), {
              icon: N(function(g) {
                return [ne(e.$slots, "closeicon", {}, function() {
                  return [(d(), he(pt(e.closeIcon ? "span" : "TimesIcon"), H({
                    class: [e.closeIcon, g.class]
                  }, e.ptm("pcCloseButton").icon), null, 16, ["class"]))];
                })];
              }),
              _: 3
            }, 16, ["class", "aria-label", "unstyled", "onClick", "pt"])];
          }) : E("", !0)], 16), i("div", H({
            ref: l.contentRef,
            class: e.cx("content")
          }, e.ptm("content")), [ne(e.$slots, "default")], 16), e.$slots.footer ? (d(), m("div", H({
            key: 0,
            ref: l.footerContainerRef,
            class: e.cx("footer")
          }, e.ptm("footer")), [ne(e.$slots, "footer")], 16)) : E("", !0)], 64))], 16, Yt)), [[_]]) : E("", !0)];
        }),
        _: 3
      }, 16, ["onEnter", "onAfterEnter", "onBeforeLeave", "onLeave", "onAfterLeave"])], 16, Xt)) : E("", !0)];
    }),
    _: 3
  });
}
Ue.render = en;
const tn = { class: "kx-drawer-title" }, nn = { class: "kx-drawer-b" }, sn = {
  key: 0,
  class: "kx-drawer-state"
}, an = {
  key: 1,
  class: "kx-drawer-state err"
}, on = {
  key: 2,
  class: "kx-drawer-state"
}, rn = {
  key: 3,
  class: "kx-msgs"
}, ln = { class: "kx-msg-role" }, un = { class: "kx-msg-body" }, cn = /* @__PURE__ */ Ee({
  __name: "MessagesDrawer",
  props: {
    open: { type: Boolean },
    title: {},
    messages: {},
    loading: { type: Boolean },
    error: {}
  },
  emits: ["close"],
  setup(e, { emit: t }) {
    const n = e, r = t;
    function c(h) {
      h || r("close");
    }
    function l(h) {
      if (!h.data) return "";
      try {
        const _ = JSON.parse(h.data);
        if (typeof _ == "string") return _;
        if (_ && typeof _ == "object") {
          const g = _, w = g.text ?? g.content ?? g.message;
          return typeof w == "string" ? w : JSON.stringify(_, null, 2);
        }
      } catch {
      }
      return h.data;
    }
    const C = L(
      () => n.messages.map((h) => ({
        id: h.message_id,
        role: (h.type || "message").replace(/_/g, " "),
        body: l(h),
        user: /user/i.test(h.type || "")
      }))
    );
    return (h, _) => (d(), he(p(Ue), {
      visible: e.open,
      position: "right",
      modal: !0,
      dismissable: !0,
      "close-on-escape": !0,
      style: { width: "min(560px, calc(100vw - 36px))" },
      "aria-label": `Messages — ${e.title}`,
      "onUpdate:visible": c
    }, {
      header: N(() => [
        i("span", tn, [
          v(p(k), {
            icon: "tabler:messages",
            "aria-hidden": "true"
          }),
          se(F(e.title), 1)
        ])
      ]),
      default: N(() => [
        i("div", nn, [
          e.loading ? (d(), m("div", sn, [
            v(p(k), {
              icon: "tabler:loader-2",
              class: "spin",
              "aria-hidden": "true"
            }),
            _[0] || (_[0] = se(" Loading messages… ", -1))
          ])) : e.error ? (d(), m("div", an, F(e.error), 1)) : C.value.length ? (d(), m("ol", rn, [
            (d(!0), m(X, null, Le(C.value, (g) => (d(), m("li", {
              key: g.id,
              class: B(["kx-msg", { "kx-msg-user": g.user }])
            }, [
              i("span", ln, F(g.role), 1),
              i("pre", un, F(g.body), 1)
            ], 2))), 128))
          ])) : (d(), m("div", on, "No messages yet."))
        ])
      ]),
      _: 1
    }, 8, ["visible", "aria-label"]));
  }
}), dn = {
  key: 0,
  class: "kx-side-head"
}, fn = ["aria-current"], pn = {
  key: 2,
  class: "kx-head"
}, mn = { class: "kx-head-icon" }, vn = { class: "kx-head-actions" }, hn = { class: "kx-search" }, bn = ["aria-pressed", "disabled", "title"], yn = { class: "kx-body" }, kn = {
  key: 0,
  class: "kx-side-section-title"
}, wn = {
  key: 1,
  class: "kx-err"
}, gn = {
  key: 2,
  class: "kx-err",
  role: "alert"
}, xn = {
  key: 3,
  class: "kx-loading"
}, _n = {
  key: 4,
  class: "kx-empty"
}, $n = { class: "kx-empty-ico" }, Cn = { class: "kx-empty-sub" }, Sn = {
  key: 5,
  class: "kx-empty"
}, Ln = { class: "kx-empty-ico" }, En = {
  key: 6,
  class: "kx-empty"
}, Fn = {
  key: 7,
  class: "kx-empty"
}, On = { class: "kx-list" }, Dn = {
  key: 0,
  class: "kx-pager",
  "aria-label": "Pagination"
}, Pn = { class: "kx-pager-info" }, Bn = { class: "kx-pager-ctrls" }, Mn = ["disabled"], Rn = {
  key: 0,
  class: "kx-pager-gap"
}, In = ["onClick"], jn = ["disabled"], le = 100, ue = 25, An = /* @__PURE__ */ Ee({
  __name: "sessions",
  setup(e) {
    const t = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i, n = xt(), r = mt(), c = vt(), l = L(() => r.value?.mode === "sidebar"), C = L(() => r.value?.mode === "navigation"), h = L(() => l.value || C.value), _ = L(() => r.value?.activeSessionId || ""), g = L(() => !!r.value?.artifactsActive), w = S([]), O = S({}), D = S({}), M = S(!1), j = S(""), R = S(""), q = S(""), A = S(!1), J = [], z = /* @__PURE__ */ new Map(), G = /* @__PURE__ */ new Set();
    function Z(a) {
      return !!a.public_meta?.favorite;
    }
    function ae(a) {
      const s = a.current_agent || "";
      if (!s) return "";
      const o = s.replace(/^user_agent:/, "");
      if (O.value[o]) return O.value[o];
      if (s.startsWith("user_agent:")) return "";
      const y = s.includes(":") ? s.split(":").pop() || "" : o;
      return t.test(y) ? "" : y;
    }
    const U = L(() => w.value.filter(Z).length), K = L(() => {
      const a = q.value.trim().toLowerCase();
      return [...w.value.filter((o) => A.value && !Z(o) ? !1 : a ? (o.title || "").toLowerCase().includes(a) || ae(o).toLowerCase().includes(a) : !0)].sort((o, y) => Number(Z(y)) - Number(Z(o)));
    }), P = S(1);
    Re([q, A], () => {
      P.value = 1;
    });
    const V = L(() => Math.max(1, Math.ceil(K.value.length / ue)));
    Re(V, (a) => {
      P.value > a && (P.value = a);
    });
    const pe = L(() => {
      const a = (P.value - 1) * ue;
      return K.value.slice(a, a + ue);
    }), f = L(() => K.value.length ? (P.value - 1) * ue + 1 : 0), u = L(() => Math.min(K.value.length, P.value * ue)), b = L(() => Q(P.value, V.value));
    function $(a) {
      P.value = Math.max(1, Math.min(V.value, a));
    }
    function Q(a, s) {
      if (s <= 7) return Array.from({ length: s }, (W, x) => x + 1);
      const o = [1], y = Math.max(2, a - 1), I = Math.min(s - 1, a + 1);
      y > 2 && o.push("…");
      for (let W = y; W <= I; W++) o.push(W);
      return I < s - 1 && o.push("…"), o.push(s), o;
    }
    async function oe() {
      j.value = "";
      try {
        const [{ sessions: a }, s, o] = await Promise.all([
          n.list(le, 0),
          n.agentTitles(),
          n.providerBadges()
        ]);
        w.value = a.filter((y) => !G.has(y.session_id)), O.value = s, D.value = o, M.value = !0;
      } catch (a) {
        j.value = a.message;
      }
    }
    function ee(a, s = {}, o = !1, y = !1) {
      const I = z.get(a);
      z.set(a, {
        patch: { ...I?.patch, ...s },
        read: o || I?.read === !0,
        deleted: y || I?.deleted === !0
      }), He();
    }
    async function Ve() {
      const a = [...z];
      z.clear();
      const s = new Set(w.value.map((x) => x.session_id)), o = /* @__PURE__ */ new Map();
      await Promise.all(a.map(async ([x, T]) => {
        if (!(T.deleted || G.has(x) || !T.read && s.has(x)))
          try {
            o.set(x, await n.session(x));
          } catch (re) {
            te(re);
          }
      }));
      const y = new Map(w.value.map((x) => [x.session_id, x]));
      let I = !1, W = !1;
      for (const [x, T] of a) {
        const re = o.get(x);
        if (T.deleted || re === null || G.has(x) || z.get(x)?.deleted)
          I = y.delete(x) || I;
        else if (re)
          y.set(x, re), W = !0;
        else {
          const ge = y.get(x);
          ge && (Object.hasOwn(T.patch, "last_message_date") && T.patch.last_message_date !== ge.last_message_date && (W = !0), Object.assign(ge, T.patch));
        }
      }
      if (I && s.size === le && y.size < le)
        try {
          const { sessions: x } = await n.list(le - y.size, y.size);
          for (const T of x)
            y.has(T.session_id) || y.set(T.session_id, T);
        } catch (x) {
          te(x);
        }
      !I && !W || (w.value = [...y.values()].filter((x) => !G.has(x.session_id) && !z.get(x.session_id)?.deleted).sort(wt).slice(0, le));
    }
    const { refreshing: Oe, refresh: me, queueUpdates: He } = ht(oe, Ve);
    function te(a) {
      R.value = a.message;
    }
    async function qe(a) {
      const s = !Z(a);
      a.public_meta = { ...a.public_meta || {}, favorite: s };
      try {
        await n.setFavorite(a.session_id, s);
      } catch (o) {
        a.public_meta = { ...a.public_meta || {}, favorite: !s }, te(o);
      } finally {
        ee(a.session_id, {}, !0);
      }
    }
    function Ze(a) {
      c("session-select", { sessionId: a.session_id }), c("kickside-chat-open", { kind: "session", sessionId: a.session_id });
    }
    async function We(a) {
      try {
        const s = await n.startToken(a.current_agent, a.current_model);
        c("kickside-chat-open", { kind: "start", startToken: s });
      } catch (s) {
        te(s);
      }
    }
    function De() {
      c("new-chat", void 0);
    }
    function Je() {
      c("artifacts-open", void 0);
    }
    async function Ge(a, s) {
      const o = a.title;
      a.title = s;
      try {
        await n.rename(a.session_id, s);
      } catch (y) {
        a.title = o, te(y);
      } finally {
        ee(a.session_id, {}, !0);
      }
    }
    async function Qe(a) {
      if (await gt.confirm({
        header: "Delete session",
        message: `Delete “${a.title?.trim() || "Untitled chat"}” and its messages? This can’t be undone.`,
        icon: "tabler:alert-triangle",
        acceptLabel: "Delete",
        rejectLabel: "Cancel",
        acceptClass: "p-button-danger"
      }))
        try {
          await n.remove(a.session_id), G.add(a.session_id), ee(a.session_id, {}, !1, !0);
        } catch (o) {
          te(o);
        }
    }
    const be = S(!1), Pe = S(""), ye = S([]), ke = S(!1), we = S("");
    async function Xe(a) {
      be.value = !0, Pe.value = a.title?.trim() || "Untitled chat", ye.value = [], we.value = "", ke.value = !0;
      try {
        ye.value = await n.messages(a.session_id);
      } catch (s) {
        we.value = s.message;
      } finally {
        ke.value = !1;
      }
    }
    return Ne(() => {
      J.push(ve("session:*", (a) => {
        const s = bt(a);
        s && (s.deleted || s.refresh || Object.keys(s.patch).length) && ee(s.sessionId, s.patch, s.refresh === !0, s.deleted);
      })), J.push(ve("session.opened", (a) => {
        const s = yt(a);
        s && !w.value.some((o) => o.session_id === s) && ee(s);
      })), J.push(ve("session:*:message:*", (a) => {
        const s = kt(a);
        s && ee(s, {}, !0);
      })), J.push(ve("@reconnect", me));
    }), ut(me), Ke(() => {
      J.forEach((a) => a());
    }), (a, s) => (d(), m("div", {
      class: B(["kx", { "kx-sidebar": h.value }])
    }, [
      l.value ? (d(), m("header", dn, [
        s[8] || (s[8] = i("h1", { class: "kx-side-title" }, "Sessions", -1)),
        v(p(Y), {
          type: "button",
          class: "kx-side-new",
          size: "small",
          label: "New chat",
          onClick: De
        }, {
          icon: N(({ class: o }) => [
            v(p(k), {
              icon: "tabler:plus",
              class: B(o),
              "aria-hidden": "true"
            }, null, 8, ["class"])
          ]),
          _: 1
        })
      ])) : E("", !0),
      l.value ? (d(), m("button", {
        key: 1,
        type: "button",
        class: B(["kx-side-artifacts", { "is-active": g.value }]),
        "aria-current": g.value ? "page" : void 0,
        onClick: Je
      }, [
        v(p(k), {
          icon: "tabler:binary-tree-2",
          "aria-hidden": "true"
        }),
        s[9] || (s[9] = i("span", null, "Artifacts", -1)),
        v(p(k), {
          icon: "tabler:chevron-right",
          class: "kx-side-artifacts-caret",
          "aria-hidden": "true"
        })
      ], 10, fn)) : C.value ? E("", !0) : (d(), m("header", pn, [
        i("span", mn, [
          v(p(k), {
            icon: "tabler:messages",
            "aria-hidden": "true"
          })
        ]),
        s[12] || (s[12] = i("div", { class: "kx-head-text" }, [
          i("h1", { class: "kx-title" }, "Sessions"),
          i("p", { class: "kx-head-sub" }, "Resume, restart, rename, and review your chats.")
        ], -1)),
        i("div", vn, [
          v(p(Y), {
            type: "button",
            size: "small",
            label: "New chat",
            onClick: De
          }, {
            icon: N(({ class: o }) => [
              v(p(k), {
                icon: "tabler:plus",
                class: B(o),
                "aria-hidden": "true"
              }, null, 8, ["class"])
            ]),
            _: 1
          }),
          i("label", hn, [
            s[10] || (s[10] = i("span", { class: "sr-only" }, "Search sessions", -1)),
            v(p(k), {
              icon: "tabler:search",
              class: "kx-search-ico",
              "aria-hidden": "true"
            }),
            Fe(i("input", {
              "onUpdate:modelValue": s[0] || (s[0] = (o) => q.value = o),
              class: "kx-search-input",
              type: "search",
              placeholder: "Search sessions"
            }, null, 512), [
              [ze, q.value]
            ]),
            q.value ? (d(), m("button", {
              key: 0,
              class: "kx-search-clear",
              "aria-label": "Clear search",
              onClick: s[1] || (s[1] = (o) => q.value = "")
            }, [
              v(p(k), {
                icon: "tabler:x",
                "aria-hidden": "true"
              })
            ])) : E("", !0)
          ]),
          i("button", {
            class: B(["kx-toggle", { "kx-toggle-on": A.value }]),
            "aria-pressed": A.value,
            disabled: !U.value,
            title: U.value ? "Show only favorites" : "No favorites yet",
            onClick: s[2] || (s[2] = (o) => A.value = !A.value)
          }, [
            v(p(k), {
              icon: A.value ? "tabler:star-filled" : "tabler:star",
              "aria-hidden": "true"
            }, null, 8, ["icon"]),
            i("span", null, [
              s[11] || (s[11] = se("Favorites", -1)),
              U.value ? (d(), m(X, { key: 0 }, [
                se(" · " + F(U.value), 1)
              ], 64)) : E("", !0)
            ])
          ], 10, bn),
          v(p(Y), {
            type: "button",
            severity: "secondary",
            outlined: "",
            title: "Refresh",
            "aria-label": "Refresh",
            loading: p(Oe),
            disabled: p(Oe),
            onClick: p(me)
          }, {
            icon: N(({ class: o }) => [
              v(p(k), {
                icon: "tabler:refresh",
                class: B(o),
                "aria-hidden": "true"
              }, null, 8, ["class"])
            ]),
            _: 1
          }, 8, ["loading", "disabled", "onClick"])
        ])
      ])),
      i("div", yn, [
        h.value ? (d(), m("div", kn, "Chats and tasks")) : E("", !0),
        R.value ? (d(), m("div", wn, [
          v(p(k), {
            icon: "tabler:alert-triangle",
            "aria-hidden": "true"
          }),
          i("span", null, F(R.value), 1),
          i("button", {
            class: "kx-err-x",
            "aria-label": "Dismiss",
            onClick: s[3] || (s[3] = (o) => R.value = "")
          }, [
            v(p(k), {
              icon: "tabler:x",
              "aria-hidden": "true"
            })
          ])
        ])) : E("", !0),
        M.value && j.value ? (d(), m("div", gn, [
          v(p(k), {
            icon: "tabler:alert-triangle",
            "aria-hidden": "true"
          }),
          i("span", null, F(j.value), 1),
          i("button", {
            class: "kx-err-x",
            "aria-label": "Dismiss",
            onClick: s[4] || (s[4] = (o) => j.value = "")
          }, [
            v(p(k), {
              icon: "tabler:x",
              "aria-hidden": "true"
            })
          ])
        ])) : E("", !0),
        !M.value && !j.value ? (d(), m("div", xn, [
          v(p(k), {
            icon: "tabler:loader-2",
            class: "spin",
            "aria-hidden": "true"
          }),
          s[13] || (s[13] = se(" Loading… ", -1))
        ])) : !M.value && j.value ? (d(), m("div", _n, [
          i("div", $n, [
            v(p(k), {
              icon: "tabler:alert-triangle",
              "aria-hidden": "true"
            })
          ]),
          s[14] || (s[14] = i("div", { class: "kx-empty-title" }, "Couldn’t load sessions", -1)),
          i("div", Cn, F(j.value), 1),
          v(p(Y), {
            type: "button",
            label: "Retry",
            onClick: p(me)
          }, {
            icon: N(({ class: o }) => [
              v(p(k), {
                icon: "tabler:refresh",
                class: B(o),
                "aria-hidden": "true"
              }, null, 8, ["class"])
            ]),
            _: 1
          }, 8, ["onClick"])
        ])) : w.value.length ? A.value && !K.value.length ? (d(), m("div", En, [...s[17] || (s[17] = [
          i("div", { class: "kx-empty-title" }, "No favorites", -1),
          i("div", { class: "kx-empty-sub" }, "Star a session to pin it to the top and find it here.", -1)
        ])])) : K.value.length ? (d(), m(X, { key: 8 }, [
          i("div", On, [
            (d(!0), m(X, null, Le(h.value ? K.value : pe.value, (o) => (d(), he(It, {
              key: o.session_id,
              session: o,
              agent: ae(o),
              providers: D.value,
              favorite: Z(o),
              active: o.session_id === _.value,
              onResume: (y) => Ze(o),
              onRestart: (y) => We(o),
              onPreview: (y) => Xe(o),
              onFavorite: (y) => qe(o),
              onRename: (y) => Ge(o, y),
              onDelete: (y) => Qe(o)
            }, null, 8, ["session", "agent", "providers", "favorite", "active", "onResume", "onRestart", "onPreview", "onFavorite", "onRename", "onDelete"]))), 128))
          ]),
          !h.value && V.value > 1 ? (d(), m("nav", Dn, [
            i("span", Pn, F(f.value) + "–" + F(u.value) + " of " + F(K.value.length), 1),
            i("div", Bn, [
              i("button", {
                class: "kx-pager-btn",
                disabled: P.value <= 1,
                "aria-label": "Previous page",
                onClick: s[5] || (s[5] = (o) => $(P.value - 1))
              }, [
                v(p(k), {
                  icon: "tabler:chevron-left",
                  "aria-hidden": "true"
                })
              ], 8, Mn),
              (d(!0), m(X, null, Le(b.value, (o, y) => (d(), m(X, { key: y }, [
                o === "…" ? (d(), m("span", Rn, "…")) : (d(), m("button", {
                  key: 1,
                  class: B(["kx-pager-num", { "kx-pager-cur": o === P.value }]),
                  onClick: (I) => $(o)
                }, F(o), 11, In))
              ], 64))), 128)),
              i("button", {
                class: "kx-pager-btn",
                disabled: P.value >= V.value,
                "aria-label": "Next page",
                onClick: s[6] || (s[6] = (o) => $(P.value + 1))
              }, [
                v(p(k), {
                  icon: "tabler:chevron-right",
                  "aria-hidden": "true"
                })
              ], 8, jn)
            ])
          ])) : E("", !0)
        ], 64)) : (d(), m("div", Fn, [...s[18] || (s[18] = [
          i("div", { class: "kx-empty-title" }, "No matches", -1),
          i("div", { class: "kx-empty-sub" }, "No sessions match the current search.", -1)
        ])])) : (d(), m("div", Sn, [
          i("div", Ln, [
            v(p(k), {
              icon: "tabler:message-plus",
              "aria-hidden": "true"
            })
          ]),
          s[15] || (s[15] = i("div", { class: "kx-empty-title" }, "No sessions yet", -1)),
          s[16] || (s[16] = i("div", { class: "kx-empty-sub" }, "Chats you start will show up here, ready to resume or restart.", -1))
        ]))
      ]),
      v(cn, {
        open: be.value,
        title: Pe.value,
        messages: ye.value,
        loading: ke.value,
        error: we.value,
        onClose: s[7] || (s[7] = (o) => be.value = !1)
      }, null, 8, ["open", "title", "messages", "loading", "error"])
    ], 2));
  }
}), qn = {
  rootComponent: An,
  plugins: [ct]
};
export {
  qn as mountConfig
};
//# sourceMappingURL=index-mount-BZvtMgN4.js.map

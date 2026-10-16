import { c as He, b as We, W as Ze } from "./useSessionsApi-WrUiyRNa.js";
import { B as Fe, L as qe, j as ne, l as ee, n as Je, U as Ge, o as $e, c as Xe, q as Qe, r as De, t as Ye, g as et, b as tt, f as nt, W as at, m as st, P as rt } from "./styles-DUbfgJ3E.js";
import { defineComponent as we, ref as _, computed as S, onMounted as Oe, onBeforeUnmount as Pe, openBlock as d, createElementBlock as p, normalizeClass as P, createElementVNode as i, createVNode as m, unref as v, withDirectives as ge, withKeys as me, withModifiers as ve, vModelText as Be, toDisplayString as D, createCommentVNode as L, createTextVNode as X, withCtx as M, nextTick as be, resolveComponent as Ce, resolveDirective as ot, createBlock as le, mergeProps as N, Transition as it, renderSlot as G, Fragment as Z, resolveDynamicComponent as lt, renderList as ke, watch as Se } from "vue";
import { Icon as y } from "@iconify/vue";
import { s as q, a as ut, u as ct } from "./constants-BWUFfCCG.js";
import { on as dt, host as ft, define as pt } from "@wippy-fe/proxy";
import { s as mt, x as he } from "./index-D3S3Ui1l.js";
const vt = ["title", "aria-label"], bt = {
  key: 0,
  class: "kx-row-main kx-row-main-edit"
}, ht = ["onKeydown"], yt = ["aria-current"], kt = ["title"], wt = { class: "kx-row-meta" }, gt = {
  key: 0,
  class: "kx-row-agent"
}, xt = { key: 1 }, _t = ["title"], $t = {
  key: 3,
  class: "kx-sub-bad"
}, Ct = { class: "kx-row-end" }, St = ["disabled"], Lt = /* @__PURE__ */ we({
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
    const n = e, s = t, c = _(!1), l = _(""), $ = _(null), b = _(null), w = _(null), k = _(null), g = _(!1), E = S(() => n.session.title?.trim() || "Untitled chat"), F = S(() => {
      const f = n.session.meta, u = f && typeof f == "object" ? f.provider : void 0, h = typeof u == "string" ? u.trim().toLowerCase() : "", x = n.providers;
      return h && x && Object.hasOwn(x, h) ? x[h] : h ? { icon: "tabler:plug-connected", label: h } : (n.session.kind || "").toUpperCase() === "DM" ? { icon: "tabler:message-dots", label: "Direct message" } : { icon: "tabler:message-circle", label: "Chat" };
    }), R = S(() => (n.session.status || "idle").toLowerCase()), U = S(() => R.value === "failed" || R.value === "error"), B = S(() => {
      const f = n.session.meta?.tokens;
      if (!f || typeof f != "object") return null;
      const u = (W) => typeof f[W] == "number" ? f[W] : 0, h = u("total_tokens") || u("prompt_tokens") + u("completion_tokens") + u("thinking_tokens");
      if (!h) return null;
      const x = [];
      return u("prompt_tokens") && x.push(`${u("prompt_tokens").toLocaleString()} in`), u("completion_tokens") && x.push(`${u("completion_tokens").toLocaleString()} out`), u("thinking_tokens") && x.push(`${u("thinking_tokens").toLocaleString()} thinking`), {
        label: J(h),
        title: `${h.toLocaleString()} tokens${x.length ? ` (${x.join(" · ")})` : ""}`
      };
    });
    function J(f) {
      return f >= 1e6 ? `${(f / 1e6).toFixed(f >= 1e7 ? 0 : 1)}M` : f >= 1e3 ? `${(f / 1e3).toFixed(f >= 1e4 ? 0 : 1)}k` : String(f);
    }
    const j = S(() => {
      const f = n.session.last_message_date || n.session.start_date;
      if (!f) return "";
      const u = new Date(f).getTime();
      if (Number.isNaN(u)) return "";
      const h = Date.now() - u, x = 6e4, W = 36e5, z = 864e5;
      return h < x ? "just now" : h < W ? `${Math.floor(h / x)}m ago` : h < z ? `${Math.floor(h / W)}h ago` : h < 7 * z ? `${Math.floor(h / z)}d ago` : new Date(f).toLocaleDateString();
    });
    async function T() {
      g.value = !1, l.value = n.session.title || "", c.value = !0, await be(), $.value?.focus(), $.value?.select();
    }
    function Q() {
      const f = l.value.trim();
      c.value = !1, f && f !== (n.session.title || "") && s("rename", f);
    }
    function H() {
      c.value = !1;
    }
    function V() {
      c.value || s("resume");
    }
    async function Y() {
      g.value = !0, await be(), k.value?.querySelector('[role="menuitem"]:not(:disabled)')?.focus();
    }
    function I(f = !1) {
      g.value = !1, f && be(() => w.value?.focus());
    }
    function A() {
      g.value ? I() : Y();
    }
    function O(f) {
      const u = [...k.value?.querySelectorAll('[role="menuitem"]:not(:disabled)') || []];
      if (!u.length) return;
      const h = Math.max(0, u.indexOf(document.activeElement));
      let x = h;
      if (f.key === "ArrowDown") x = (h + 1) % u.length;
      else if (f.key === "ArrowUp") x = (h - 1 + u.length) % u.length;
      else if (f.key === "Home") x = 0;
      else if (f.key === "End") x = u.length - 1;
      else if (f.key === "Escape") {
        f.preventDefault(), I(!0);
        return;
      } else return;
      f.preventDefault(), u[x]?.focus();
    }
    function K(f) {
      I(), s(f === "restart" ? "restart" : f === "preview" ? "preview" : "delete");
    }
    function re(f) {
      g.value && b.value && !f.composedPath().includes(b.value) && I();
    }
    return Oe(() => document.addEventListener("click", re)), Pe(() => document.removeEventListener("click", re)), (f, u) => (d(), p("div", {
      ref_key: "rowEl",
      ref: b,
      class: P(["kx-row", { "kx-row-edit": c.value, "kx-row-active": e.active }])
    }, [
      i("span", {
        class: "kx-src",
        title: F.value.label,
        "aria-label": F.value.label,
        role: "img"
      }, [
        m(v(y), {
          icon: F.value.icon,
          "aria-hidden": "true"
        }, null, 8, ["icon"])
      ], 8, vt),
      c.value ? (d(), p("div", bt, [
        ge(i("input", {
          ref_key: "inputEl",
          ref: $,
          "onUpdate:modelValue": u[0] || (u[0] = (h) => l.value = h),
          class: "kx-edit",
          "aria-label": "Rename chat",
          onKeydown: [
            me(ve(Q, ["prevent"]), ["enter"]),
            me(ve(H, ["prevent"]), ["esc"])
          ],
          onBlur: Q
        }, null, 40, ht), [
          [Be, l.value]
        ])
      ])) : (d(), p("button", {
        key: 1,
        type: "button",
        class: "kx-row-main",
        "aria-current": e.active ? "page" : void 0,
        onClick: V
      }, [
        i("span", {
          class: "kx-name",
          title: E.value
        }, D(E.value), 9, kt),
        i("span", wt, [
          e.agent ? (d(), p("span", gt, D(e.agent), 1)) : L("", !0),
          j.value ? (d(), p("span", xt, D(j.value), 1)) : L("", !0),
          B.value ? (d(), p("span", {
            key: 2,
            class: "kx-tok",
            title: B.value.title
          }, [
            m(v(y), {
              icon: "tabler:coins",
              "aria-hidden": "true"
            }),
            X(D(B.value.label), 1)
          ], 8, _t)) : L("", !0),
          U.value ? (d(), p("span", $t, "failed")) : L("", !0)
        ])
      ], 8, yt)),
      i("div", Ct, [
        m(v(q), {
          type: "button",
          severity: "secondary",
          text: "",
          class: P(["kx-fav", { "kx-fav-on": e.favorite }]),
          title: e.favorite ? "Remove from favorites" : "Add to favorites",
          "aria-label": e.favorite ? "Remove from favorites" : "Add to favorites",
          "aria-pressed": e.favorite,
          onClick: u[1] || (u[1] = (h) => s("favorite"))
        }, {
          icon: M(({ class: h }) => [
            m(v(y), {
              icon: e.favorite ? "tabler:star-filled" : "tabler:star",
              class: P(h),
              "aria-hidden": "true"
            }, null, 8, ["icon", "class"])
          ]),
          _: 1
        }, 8, ["class", "title", "aria-label", "aria-pressed"]),
        m(v(q), {
          ref_key: "menuTrigger",
          ref: w,
          type: "button",
          severity: "secondary",
          text: "",
          class: "kx-menu-trigger",
          title: "Session actions",
          "aria-label": "Session actions",
          "aria-haspopup": "menu",
          "aria-expanded": g.value,
          onClick: A,
          onKeydown: me(ve(Y, ["prevent"]), ["arrow-down"])
        }, {
          icon: M(({ class: h }) => [
            m(v(y), {
              icon: "tabler:dots-vertical",
              class: P(h),
              "aria-hidden": "true"
            }, null, 8, ["class"])
          ]),
          _: 1
        }, 8, ["aria-expanded", "onKeydown"]),
        g.value ? (d(), p("div", {
          key: 0,
          ref_key: "menuEl",
          ref: k,
          class: "kx-row-menu",
          role: "menu",
          "aria-label": "Session actions",
          onKeydown: O
        }, [
          i("button", {
            type: "button",
            class: "kx-menu-item",
            role: "menuitem",
            onClick: u[2] || (u[2] = (h) => K("restart"))
          }, [
            m(v(y), {
              icon: "tabler:refresh",
              "aria-hidden": "true"
            }),
            u[5] || (u[5] = i("span", null, "Restart as new chat", -1))
          ]),
          i("button", {
            type: "button",
            class: "kx-menu-item",
            role: "menuitem",
            onClick: u[3] || (u[3] = (h) => K("preview"))
          }, [
            m(v(y), {
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
            onClick: T
          }, [
            m(v(y), {
              icon: "tabler:pencil",
              "aria-hidden": "true"
            }),
            u[7] || (u[7] = i("span", null, "Rename", -1))
          ], 8, St),
          i("button", {
            type: "button",
            class: "kx-menu-item kx-menu-item-danger",
            role: "menuitem",
            onClick: u[4] || (u[4] = (h) => K("delete"))
          }, [
            m(v(y), {
              icon: "tabler:trash",
              "aria-hidden": "true"
            }),
            u[8] || (u[8] = i("span", null, "Delete", -1))
          ])
        ], 544)) : L("", !0)
      ])
    ], 2));
  }
});
var Et = Fe.extend({
  name: "focustrap-directive"
}), Ft = Je.extend({
  style: Et
});
function ae(e) {
  "@babel/helpers - typeof";
  return ae = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, ae(e);
}
function Le(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var s = Object.getOwnPropertySymbols(e);
    t && (s = s.filter(function(c) {
      return Object.getOwnPropertyDescriptor(e, c).enumerable;
    })), n.push.apply(n, s);
  }
  return n;
}
function Ee(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? Le(Object(n), !0).forEach(function(s) {
      Dt(e, s, n[s]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Le(Object(n)).forEach(function(s) {
      Object.defineProperty(e, s, Object.getOwnPropertyDescriptor(n, s));
    });
  }
  return e;
}
function Dt(e, t, n) {
  return (t = Ot(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Ot(e) {
  var t = Pt(e, "string");
  return ae(t) == "symbol" ? t : t + "";
}
function Pt(e, t) {
  if (ae(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var s = n.call(e, t);
    if (ae(s) != "object") return s;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var Bt = Ft.extend("focustrap", {
  mounted: function(t, n) {
    var s = n.value || {}, c = s.disabled;
    c || (this.createHiddenFocusableElements(t, n), this.bind(t, n), this.autoElementFocus(t, n)), t.setAttribute("data-pd-focustrap", !0), this.$el = t;
  },
  updated: function(t, n) {
    var s = n.value || {}, c = s.disabled;
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
      var s = this, c = n.value || {}, l = c.onFocusIn, $ = c.onFocusOut;
      t.$_pfocustrap_mutationobserver = new MutationObserver(function(b) {
        b.forEach(function(w) {
          if (w.type === "childList" && !t.contains(document.activeElement)) {
            var k = function(E) {
              var F = $e(E) ? $e(E, s.getComputedSelector(t.$_pfocustrap_focusableselector)) ? E : ee(t, s.getComputedSelector(t.$_pfocustrap_focusableselector)) : ee(E);
              return Xe(F) ? F : E.nextSibling && k(E.nextSibling);
            };
            ne(k(w.nextSibling));
          }
        });
      }), t.$_pfocustrap_mutationobserver.disconnect(), t.$_pfocustrap_mutationobserver.observe(t, {
        childList: !0
      }), t.$_pfocustrap_focusinlistener = function(b) {
        return l && l(b);
      }, t.$_pfocustrap_focusoutlistener = function(b) {
        return $ && $(b);
      }, t.addEventListener("focusin", t.$_pfocustrap_focusinlistener), t.addEventListener("focusout", t.$_pfocustrap_focusoutlistener);
    },
    unbind: function(t) {
      t.$_pfocustrap_mutationobserver && t.$_pfocustrap_mutationobserver.disconnect(), t.$_pfocustrap_focusinlistener && t.removeEventListener("focusin", t.$_pfocustrap_focusinlistener) && (t.$_pfocustrap_focusinlistener = null), t.$_pfocustrap_focusoutlistener && t.removeEventListener("focusout", t.$_pfocustrap_focusoutlistener) && (t.$_pfocustrap_focusoutlistener = null);
    },
    autoFocus: function(t) {
      this.autoElementFocus(this.$el, {
        value: Ee(Ee({}, t), {}, {
          autoFocus: !0
        })
      });
    },
    autoElementFocus: function(t, n) {
      var s = n.value || {}, c = s.autoFocusSelector, l = c === void 0 ? "" : c, $ = s.firstFocusableSelector, b = $ === void 0 ? "" : $, w = s.autoFocus, k = w === void 0 ? !1 : w, g = ee(t, "[autofocus]".concat(this.getComputedSelector(l)));
      k && !g && (g = ee(t, this.getComputedSelector(b))), ne(g);
    },
    onFirstHiddenElementFocus: function(t) {
      var n, s = t.currentTarget, c = t.relatedTarget, l = c === s.$_pfocustrap_lasthiddenfocusableelement || !((n = this.$el) !== null && n !== void 0 && n.contains(c)) ? ee(s.parentElement, this.getComputedSelector(s.$_pfocustrap_focusableselector)) : s.$_pfocustrap_lasthiddenfocusableelement;
      ne(l);
    },
    onLastHiddenElementFocus: function(t) {
      var n, s = t.currentTarget, c = t.relatedTarget, l = c === s.$_pfocustrap_firsthiddenfocusableelement || !((n = this.$el) !== null && n !== void 0 && n.contains(c)) ? qe(s.parentElement, this.getComputedSelector(s.$_pfocustrap_focusableselector)) : s.$_pfocustrap_firsthiddenfocusableelement;
      ne(l);
    },
    createHiddenFocusableElements: function(t, n) {
      var s = this, c = n.value || {}, l = c.tabIndex, $ = l === void 0 ? 0 : l, b = c.firstFocusableSelector, w = b === void 0 ? "" : b, k = c.lastFocusableSelector, g = k === void 0 ? "" : k, E = function(B) {
        return Ge("span", {
          class: "p-hidden-accessible p-hidden-focusable",
          tabIndex: $,
          role: "presentation",
          "aria-hidden": !0,
          "data-p-hidden-accessible": !0,
          "data-p-hidden-focusable": !0,
          onFocus: B?.bind(s)
        });
      }, F = E(this.onFirstHiddenElementFocus), R = E(this.onLastHiddenElementFocus);
      F.$_pfocustrap_lasthiddenfocusableelement = R, F.$_pfocustrap_focusableselector = w, F.setAttribute("data-pc-section", "firstfocusableelement"), R.$_pfocustrap_firsthiddenfocusableelement = F, R.$_pfocustrap_focusableselector = g, R.setAttribute("data-pc-section", "lastfocusableelement"), t.prepend(F), t.append(R);
    }
  }
});
function Rt() {
  Ye({
    variableName: De("scrollbar.width").name
  });
}
function Mt() {
  Qe({
    variableName: De("scrollbar.width").name
  });
}
var Tt = `
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
`, At = {
  mask: function(t) {
    var n = t.position, s = t.modal;
    return {
      position: "fixed",
      height: "100%",
      width: "100%",
      left: 0,
      top: 0,
      display: "flex",
      justifyContent: n === "left" ? "flex-start" : n === "right" ? "flex-end" : "center",
      alignItems: n === "top" ? "flex-start" : n === "bottom" ? "flex-end" : "center",
      pointerEvents: s ? "auto" : "none"
    };
  },
  root: {
    pointerEvents: "auto"
  }
}, jt = {
  mask: function(t) {
    var n = t.instance, s = t.props, c = ["left", "right", "top", "bottom"], l = c.find(function($) {
      return $ === s.position;
    });
    return ["p-drawer-mask", {
      "p-overlay-mask p-overlay-mask-enter-active": s.modal,
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
}, It = Fe.extend({
  name: "drawer",
  style: Tt,
  classes: jt,
  inlineStyles: At
}), Kt = {
  name: "BaseDrawer",
  extends: tt,
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
  style: It,
  provide: function() {
    return {
      $pcDrawer: this,
      $parentInstance: this
    };
  }
};
function se(e) {
  "@babel/helpers - typeof";
  return se = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, se(e);
}
function ye(e, t, n) {
  return (t = Nt(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Nt(e) {
  var t = Ut(e, "string");
  return se(t) == "symbol" ? t : t + "";
}
function Ut(e, t) {
  if (se(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var s = n.call(e, t);
    if (se(s) != "object") return s;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var Re = {
  name: "Drawer",
  extends: Kt,
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
    this.disableDocumentSettings(), this.mask && this.autoZIndex && he.clear(this.mask), this.container = null, this.mask = null;
  },
  methods: {
    hide: function() {
      this.$emit("update:visible", !1);
    },
    onEnter: function() {
      this.$emit("show"), this.focus(), this.bindDocumentKeyDownListener(), this.autoZIndex && he.set("modal", this.mask, this.baseZIndex || this.$primevue.config.zIndex.modal);
    },
    onAfterEnter: function() {
      this.enableDocumentSettings(), this.$emit("after-show");
    },
    onBeforeLeave: function() {
      this.modal && !this.isUnstyled && at(this.mask, "p-overlay-mask-leave-active"), this.$emit("before-hide");
    },
    onLeave: function() {
      this.$emit("hide");
    },
    onAfterLeave: function() {
      this.autoZIndex && he.clear(this.mask), this.unbindDocumentKeyDownListener(), this.containerVisible = !1, this.disableDocumentSettings(), this.$emit("after-hide");
    },
    onMaskClick: function(t) {
      this.dismissable && this.modal && this.mask === t.target && this.hide();
    },
    focus: function() {
      var t = function(c) {
        return c && c.querySelector("[autofocus]");
      }, n = this.$slots.header && t(this.headerContainer);
      n || (n = this.$slots.default && t(this.container), n || (n = this.$slots.footer && t(this.footerContainer), n || (n = this.closeButton))), n && ne(n);
    },
    enableDocumentSettings: function() {
      this.dismissable && !this.modal && this.bindOutsideClickListener(), this.blockScroll && Rt();
    },
    disableDocumentSettings: function() {
      this.unbindOutsideClickListener(), this.blockScroll && Mt();
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
      return nt(ye(ye(ye({
        "full-screen": this.position === "full"
      }, this.position, this.position), "open", this.containerVisible), "modal", this.modal));
    }
  },
  directives: {
    focustrap: Bt
  },
  components: {
    Button: q,
    Portal: et,
    TimesIcon: mt
  }
}, Vt = ["data-p"], zt = ["role", "aria-modal", "data-p"];
function Ht(e, t, n, s, c, l) {
  var $ = Ce("Button"), b = Ce("Portal"), w = ot("focustrap");
  return d(), le(b, null, {
    default: M(function() {
      return [c.containerVisible ? (d(), p("div", N({
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
      }, e.ptm("mask")), [m(it, N({
        name: "p-drawer",
        onEnter: l.onEnter,
        onAfterEnter: l.onAfterEnter,
        onBeforeLeave: l.onBeforeLeave,
        onLeave: l.onLeave,
        onAfterLeave: l.onAfterLeave,
        appear: ""
      }, e.ptm("transition")), {
        default: M(function() {
          return [e.visible ? ge((d(), p("div", N({
            key: 0,
            ref: l.containerRef,
            class: e.cx("root"),
            style: e.sx("root"),
            role: e.modal ? "dialog" : "complementary",
            "aria-modal": e.modal ? !0 : void 0,
            "data-p": l.dataP
          }, e.ptmi("root")), [e.$slots.container ? G(e.$slots, "container", {
            key: 0,
            closeCallback: l.hide
          }) : (d(), p(Z, {
            key: 1
          }, [i("div", N({
            ref: l.headerContainerRef,
            class: e.cx("header")
          }, e.ptm("header")), [G(e.$slots, "header", {
            class: P(e.cx("title"))
          }, function() {
            return [e.header ? (d(), p("div", N({
              key: 0,
              class: e.cx("title")
            }, e.ptm("title")), D(e.header), 17)) : L("", !0)];
          }), e.showCloseIcon ? G(e.$slots, "closebutton", {
            key: 0,
            closeCallback: l.hide
          }, function() {
            return [m($, N({
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
              icon: M(function(k) {
                return [G(e.$slots, "closeicon", {}, function() {
                  return [(d(), le(lt(e.closeIcon ? "span" : "TimesIcon"), N({
                    class: [e.closeIcon, k.class]
                  }, e.ptm("pcCloseButton").icon), null, 16, ["class"]))];
                })];
              }),
              _: 3
            }, 16, ["class", "aria-label", "unstyled", "onClick", "pt"])];
          }) : L("", !0)], 16), i("div", N({
            ref: l.contentRef,
            class: e.cx("content")
          }, e.ptm("content")), [G(e.$slots, "default")], 16), e.$slots.footer ? (d(), p("div", N({
            key: 0,
            ref: l.footerContainerRef,
            class: e.cx("footer")
          }, e.ptm("footer")), [G(e.$slots, "footer")], 16)) : L("", !0)], 64))], 16, zt)), [[w]]) : L("", !0)];
        }),
        _: 3
      }, 16, ["onEnter", "onAfterEnter", "onBeforeLeave", "onLeave", "onAfterLeave"])], 16, Vt)) : L("", !0)];
    }),
    _: 3
  });
}
Re.render = Ht;
const Wt = { class: "kx-drawer-title" }, Zt = { class: "kx-drawer-b" }, qt = {
  key: 0,
  class: "kx-drawer-state"
}, Jt = {
  key: 1,
  class: "kx-drawer-state err"
}, Gt = {
  key: 2,
  class: "kx-drawer-state"
}, Xt = {
  key: 3,
  class: "kx-msgs"
}, Qt = { class: "kx-msg-role" }, Yt = { class: "kx-msg-body" }, en = /* @__PURE__ */ we({
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
    const n = e, s = t;
    function c(b) {
      b || s("close");
    }
    function l(b) {
      if (!b.data) return "";
      try {
        const w = JSON.parse(b.data);
        if (typeof w == "string") return w;
        if (w && typeof w == "object") {
          const k = w, g = k.text ?? k.content ?? k.message;
          return typeof g == "string" ? g : JSON.stringify(w, null, 2);
        }
      } catch {
      }
      return b.data;
    }
    const $ = S(
      () => n.messages.map((b) => ({
        id: b.message_id,
        role: (b.type || "message").replace(/_/g, " "),
        body: l(b),
        user: /user/i.test(b.type || "")
      }))
    );
    return (b, w) => (d(), le(v(Re), {
      visible: e.open,
      position: "right",
      modal: !0,
      dismissable: !0,
      "close-on-escape": !0,
      style: { width: "min(560px, calc(100vw - 36px))" },
      "aria-label": `Messages — ${e.title}`,
      "onUpdate:visible": c
    }, {
      header: M(() => [
        i("span", Wt, [
          m(v(y), {
            icon: "tabler:messages",
            "aria-hidden": "true"
          }),
          X(D(e.title), 1)
        ])
      ]),
      default: M(() => [
        i("div", Zt, [
          e.loading ? (d(), p("div", qt, [
            m(v(y), {
              icon: "tabler:loader-2",
              class: "spin",
              "aria-hidden": "true"
            }),
            w[0] || (w[0] = X(" Loading messages… ", -1))
          ])) : e.error ? (d(), p("div", Jt, D(e.error), 1)) : $.value.length ? (d(), p("ol", Xt, [
            (d(!0), p(Z, null, ke($.value, (k) => (d(), p("li", {
              key: k.id,
              class: P(["kx-msg", { "kx-msg-user": k.user }])
            }, [
              i("span", Qt, D(k.role), 1),
              i("pre", Yt, D(k.body), 1)
            ], 2))), 128))
          ])) : (d(), p("div", Gt, "No messages yet."))
        ])
      ]),
      _: 1
    }, 8, ["visible", "aria-label"]));
  }
}), tn = {
  key: 0,
  class: "kx-side-head"
}, nn = ["aria-current"], an = {
  key: 2,
  class: "kx-head"
}, sn = { class: "kx-head-icon" }, rn = { class: "kx-head-actions" }, on = { class: "kx-search" }, ln = ["aria-pressed", "disabled", "title"], un = { class: "kx-body" }, cn = {
  key: 0,
  class: "kx-side-section-title"
}, dn = {
  key: 1,
  class: "kx-err"
}, fn = {
  key: 2,
  class: "kx-loading"
}, pn = {
  key: 3,
  class: "kx-empty"
}, mn = { class: "kx-empty-ico" }, vn = { class: "kx-empty-sub" }, bn = {
  key: 4,
  class: "kx-empty"
}, hn = { class: "kx-empty-ico" }, yn = {
  key: 5,
  class: "kx-empty"
}, kn = {
  key: 6,
  class: "kx-empty"
}, wn = { class: "kx-list" }, gn = {
  key: 0,
  class: "kx-pager",
  "aria-label": "Pagination"
}, xn = { class: "kx-pager-info" }, _n = { class: "kx-pager-ctrls" }, $n = ["disabled"], Cn = {
  key: 0,
  class: "kx-pager-gap"
}, Sn = ["onClick"], Ln = ["disabled"], En = 300, te = 25, Fn = /* @__PURE__ */ we({
  __name: "sessions",
  setup(e) {
    const t = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i, n = We(), s = ut(), c = ct(), l = S(() => s.value?.mode === "sidebar"), $ = S(() => s.value?.mode === "navigation"), b = S(() => l.value || $.value), w = S(() => s.value?.activeSessionId || ""), k = S(() => !!s.value?.artifactsActive), g = _([]), E = _(0), F = _({}), R = _({}), U = _(!0), B = _(""), J = _(""), j = _(""), T = _(!1), Q = [];
    let H = null;
    function V(o) {
      return !!o.public_meta?.favorite;
    }
    function Y(o) {
      const a = o.current_agent || "";
      if (!a) return "";
      const r = a.replace(/^user_agent:/, "");
      if (F.value[r]) return F.value[r];
      if (a.startsWith("user_agent:")) return "";
      const C = a.includes(":") ? a.split(":").pop() || "" : r;
      return t.test(C) ? "" : C;
    }
    const I = S(() => g.value.filter(V).length), A = S(() => {
      const o = j.value.trim().toLowerCase();
      return [...g.value.filter((r) => T.value && !V(r) ? !1 : o ? (r.title || "").toLowerCase().includes(o) || Y(r).toLowerCase().includes(o) : !0)].sort((r, C) => Number(V(C)) - Number(V(r)));
    }), O = _(1);
    Se([j, T], () => {
      O.value = 1;
    });
    const K = S(() => Math.max(1, Math.ceil(A.value.length / te)));
    Se(K, (o) => {
      O.value > o && (O.value = o);
    });
    const re = S(() => {
      const o = (O.value - 1) * te;
      return A.value.slice(o, o + te);
    }), f = S(() => A.value.length ? (O.value - 1) * te + 1 : 0), u = S(() => Math.min(A.value.length, O.value * te)), h = S(() => W(O.value, K.value));
    function x(o) {
      O.value = Math.max(1, Math.min(K.value, o));
    }
    function W(o, a) {
      if (a <= 7) return Array.from({ length: a }, (ie, ze) => ze + 1);
      const r = [1], C = Math.max(2, o - 1), pe = Math.min(a - 1, o + 1);
      C > 2 && r.push("…");
      for (let ie = C; ie <= pe; ie++) r.push(ie);
      return pe < a - 1 && r.push("…"), r.push(a), r;
    }
    async function z() {
      U.value = !0, B.value = "";
      try {
        const [{ sessions: o, total: a }, r, C] = await Promise.all([
          n.list(En, 0),
          n.agentTitles(),
          n.providerBadges()
        ]);
        g.value = o, E.value = a, F.value = r, R.value = C;
      } catch (o) {
        B.value = o.message;
      } finally {
        U.value = !1;
      }
    }
    function Te() {
      H && clearTimeout(H), H = setTimeout(() => {
        z();
      }, 150);
    }
    function oe(o) {
      J.value = o.message;
    }
    async function Ae(o) {
      const a = !V(o);
      o.public_meta = { ...o.public_meta || {}, favorite: a };
      try {
        await n.setFavorite(o.session_id, a);
      } catch (r) {
        o.public_meta = { ...o.public_meta || {}, favorite: !a }, oe(r);
      }
    }
    function je(o) {
      c("session-select", { sessionId: o.session_id }), c("kickside-chat-open", { kind: "session", sessionId: o.session_id });
    }
    async function Ie(o) {
      try {
        const a = await n.startToken(o.current_agent, o.current_model);
        c("kickside-chat-open", { kind: "start", startToken: a });
      } catch (a) {
        oe(a);
      }
    }
    function xe() {
      c("new-chat", void 0);
    }
    function Ke() {
      c("artifacts-open", void 0);
    }
    async function Ne(o, a) {
      const r = o.title;
      o.title = a;
      try {
        await n.rename(o.session_id, a);
      } catch (C) {
        o.title = r, oe(C);
      }
    }
    async function Ue(o) {
      if (await ft.confirm({
        header: "Delete session",
        message: `Delete “${o.title?.trim() || "Untitled chat"}” and its messages? This can’t be undone.`,
        icon: "tabler:alert-triangle",
        acceptLabel: "Delete",
        rejectLabel: "Cancel",
        acceptClass: "p-button-danger"
      }))
        try {
          await n.remove(o.session_id), g.value = g.value.filter((r) => r.session_id !== o.session_id), E.value = Math.max(0, E.value - 1);
        } catch (r) {
          oe(r);
        }
    }
    const ue = _(!1), _e = _(""), ce = _([]), de = _(!1), fe = _("");
    async function Ve(o) {
      ue.value = !0, _e.value = o.title?.trim() || "Untitled chat", ce.value = [], fe.value = "", de.value = !0;
      try {
        ce.value = await n.messages(o.session_id);
      } catch (a) {
        fe.value = a.message;
      } finally {
        de.value = !1;
      }
    }
    return He(z), Oe(() => Q.push(dt("session:*", Te))), Pe(() => {
      Q.forEach((o) => o()), H && clearTimeout(H);
    }), (o, a) => (d(), p("div", {
      class: P(["kx", { "kx-sidebar": b.value }])
    }, [
      l.value ? (d(), p("header", tn, [
        a[7] || (a[7] = i("h1", { class: "kx-side-title" }, "Sessions", -1)),
        m(v(q), {
          type: "button",
          class: "kx-side-new",
          size: "small",
          label: "New chat",
          onClick: xe
        }, {
          icon: M(({ class: r }) => [
            m(v(y), {
              icon: "tabler:plus",
              class: P(r),
              "aria-hidden": "true"
            }, null, 8, ["class"])
          ]),
          _: 1
        })
      ])) : L("", !0),
      l.value ? (d(), p("button", {
        key: 1,
        type: "button",
        class: P(["kx-side-artifacts", { "is-active": k.value }]),
        "aria-current": k.value ? "page" : void 0,
        onClick: Ke
      }, [
        m(v(y), {
          icon: "tabler:binary-tree-2",
          "aria-hidden": "true"
        }),
        a[8] || (a[8] = i("span", null, "Artifacts", -1)),
        m(v(y), {
          icon: "tabler:chevron-right",
          class: "kx-side-artifacts-caret",
          "aria-hidden": "true"
        })
      ], 10, nn)) : $.value ? L("", !0) : (d(), p("header", an, [
        i("span", sn, [
          m(v(y), {
            icon: "tabler:messages",
            "aria-hidden": "true"
          })
        ]),
        a[11] || (a[11] = i("div", { class: "kx-head-text" }, [
          i("h1", { class: "kx-title" }, "Sessions"),
          i("p", { class: "kx-head-sub" }, "Resume, restart, rename, and review your chats.")
        ], -1)),
        i("div", rn, [
          m(v(q), {
            type: "button",
            size: "small",
            label: "New chat",
            onClick: xe
          }, {
            icon: M(({ class: r }) => [
              m(v(y), {
                icon: "tabler:plus",
                class: P(r),
                "aria-hidden": "true"
              }, null, 8, ["class"])
            ]),
            _: 1
          }),
          i("label", on, [
            a[9] || (a[9] = i("span", { class: "sr-only" }, "Search sessions", -1)),
            m(v(y), {
              icon: "tabler:search",
              class: "kx-search-ico",
              "aria-hidden": "true"
            }),
            ge(i("input", {
              "onUpdate:modelValue": a[0] || (a[0] = (r) => j.value = r),
              class: "kx-search-input",
              type: "search",
              placeholder: "Search sessions"
            }, null, 512), [
              [Be, j.value]
            ]),
            j.value ? (d(), p("button", {
              key: 0,
              class: "kx-search-clear",
              "aria-label": "Clear search",
              onClick: a[1] || (a[1] = (r) => j.value = "")
            }, [
              m(v(y), {
                icon: "tabler:x",
                "aria-hidden": "true"
              })
            ])) : L("", !0)
          ]),
          i("button", {
            class: P(["kx-toggle", { "kx-toggle-on": T.value }]),
            "aria-pressed": T.value,
            disabled: !I.value,
            title: I.value ? "Show only favorites" : "No favorites yet",
            onClick: a[2] || (a[2] = (r) => T.value = !T.value)
          }, [
            m(v(y), {
              icon: T.value ? "tabler:star-filled" : "tabler:star",
              "aria-hidden": "true"
            }, null, 8, ["icon"]),
            i("span", null, [
              a[10] || (a[10] = X("Favorites", -1)),
              I.value ? (d(), p(Z, { key: 0 }, [
                X(" · " + D(I.value), 1)
              ], 64)) : L("", !0)
            ])
          ], 10, ln),
          m(v(q), {
            type: "button",
            severity: "secondary",
            outlined: "",
            title: "Refresh",
            "aria-label": "Refresh",
            loading: U.value,
            disabled: U.value,
            onClick: z
          }, {
            icon: M(({ class: r }) => [
              m(v(y), {
                icon: "tabler:refresh",
                class: P(r),
                "aria-hidden": "true"
              }, null, 8, ["class"])
            ]),
            _: 1
          }, 8, ["loading", "disabled"])
        ])
      ])),
      i("div", un, [
        b.value ? (d(), p("div", cn, "Chats and tasks")) : L("", !0),
        J.value ? (d(), p("div", dn, [
          m(v(y), {
            icon: "tabler:alert-triangle",
            "aria-hidden": "true"
          }),
          i("span", null, D(J.value), 1),
          i("button", {
            class: "kx-err-x",
            "aria-label": "Dismiss",
            onClick: a[3] || (a[3] = (r) => J.value = "")
          }, [
            m(v(y), {
              icon: "tabler:x",
              "aria-hidden": "true"
            })
          ])
        ])) : L("", !0),
        U.value ? (d(), p("div", fn, [
          m(v(y), {
            icon: "tabler:loader-2",
            class: "spin",
            "aria-hidden": "true"
          }),
          a[12] || (a[12] = X(" Loading… ", -1))
        ])) : B.value ? (d(), p("div", pn, [
          i("div", mn, [
            m(v(y), {
              icon: "tabler:alert-triangle",
              "aria-hidden": "true"
            })
          ]),
          a[13] || (a[13] = i("div", { class: "kx-empty-title" }, "Couldn’t load sessions", -1)),
          i("div", vn, D(B.value), 1),
          m(v(q), {
            type: "button",
            label: "Retry",
            onClick: z
          }, {
            icon: M(({ class: r }) => [
              m(v(y), {
                icon: "tabler:refresh",
                class: P(r),
                "aria-hidden": "true"
              }, null, 8, ["class"])
            ]),
            _: 1
          })
        ])) : g.value.length ? T.value && !A.value.length ? (d(), p("div", yn, [...a[16] || (a[16] = [
          i("div", { class: "kx-empty-title" }, "No favorites", -1),
          i("div", { class: "kx-empty-sub" }, "Star a session to pin it to the top and find it here.", -1)
        ])])) : A.value.length ? (d(), p(Z, { key: 7 }, [
          i("div", wn, [
            (d(!0), p(Z, null, ke(b.value ? A.value : re.value, (r) => (d(), le(Lt, {
              key: r.session_id,
              session: r,
              agent: Y(r),
              providers: R.value,
              favorite: V(r),
              active: r.session_id === w.value,
              onResume: (C) => je(r),
              onRestart: (C) => Ie(r),
              onPreview: (C) => Ve(r),
              onFavorite: (C) => Ae(r),
              onRename: (C) => Ne(r, C),
              onDelete: (C) => Ue(r)
            }, null, 8, ["session", "agent", "providers", "favorite", "active", "onResume", "onRestart", "onPreview", "onFavorite", "onRename", "onDelete"]))), 128))
          ]),
          !b.value && K.value > 1 ? (d(), p("nav", gn, [
            i("span", xn, D(f.value) + "–" + D(u.value) + " of " + D(A.value.length), 1),
            i("div", _n, [
              i("button", {
                class: "kx-pager-btn",
                disabled: O.value <= 1,
                "aria-label": "Previous page",
                onClick: a[4] || (a[4] = (r) => x(O.value - 1))
              }, [
                m(v(y), {
                  icon: "tabler:chevron-left",
                  "aria-hidden": "true"
                })
              ], 8, $n),
              (d(!0), p(Z, null, ke(h.value, (r, C) => (d(), p(Z, { key: C }, [
                r === "…" ? (d(), p("span", Cn, "…")) : (d(), p("button", {
                  key: 1,
                  class: P(["kx-pager-num", { "kx-pager-cur": r === O.value }]),
                  onClick: (pe) => x(r)
                }, D(r), 11, Sn))
              ], 64))), 128)),
              i("button", {
                class: "kx-pager-btn",
                disabled: O.value >= K.value,
                "aria-label": "Next page",
                onClick: a[5] || (a[5] = (r) => x(O.value + 1))
              }, [
                m(v(y), {
                  icon: "tabler:chevron-right",
                  "aria-hidden": "true"
                })
              ], 8, Ln)
            ])
          ])) : L("", !0)
        ], 64)) : (d(), p("div", kn, [...a[17] || (a[17] = [
          i("div", { class: "kx-empty-title" }, "No matches", -1),
          i("div", { class: "kx-empty-sub" }, "No sessions match the current search.", -1)
        ])])) : (d(), p("div", bn, [
          i("div", hn, [
            m(v(y), {
              icon: "tabler:message-plus",
              "aria-hidden": "true"
            })
          ]),
          a[14] || (a[14] = i("div", { class: "kx-empty-title" }, "No sessions yet", -1)),
          a[15] || (a[15] = i("div", { class: "kx-empty-sub" }, "Chats you start will show up here, ready to resume or restart.", -1))
        ]))
      ]),
      m(en, {
        open: ue.value,
        title: _e.value,
        messages: ce.value,
        loading: de.value,
        error: fe.value,
        onClose: a[6] || (a[6] = (r) => ue.value = !1)
      }, null, 8, ["open", "title", "messages", "loading", "error"])
    ], 2));
  }
}), Dn = { props: { type: "object", properties: { mode: { type: "string", default: "manager", description: "manager (default) or sidebar" }, "active-session-id": { type: "string", description: "Session currently rendered by the app-owned chat panel.", default: "" }, "artifacts-active": { type: "boolean", default: !1, description: "Whether the cross-session artifact gallery owns the adjacent workspace." } } } }, On = {
  wippy: Dn
};
class Me extends Ze {
  static get wippyConfig() {
    return {
      propsSchema: On.wippy.props,
      hostCssKeys: ["themeConfigUrl", "primeVueCssUrl"],
      inlineCss: st
    };
  }
  static get vueConfig() {
    return { rootComponent: Fn, plugins: [rt] };
  }
}
async function In() {
  return Me;
}
pt(import.meta.url, Me);
export {
  In as webComponent
};
//# sourceMappingURL=index.js.map

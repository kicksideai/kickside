import { B as mt, s as At, l as no, A as li, a as ri, b as zt, R as oo, c as ui, L as Eo, d as Le, v as Jt, U as di, I as uo, e as ci, r as To, f as pi, g as Fo, h as Vo, C as fi, i as mi, S as Do, _ as hi, W as bi, z as Bo, j as Pn, k as an, T as ln, F as vi, M as co, m as gi, n as yi, Y as ki, o as wi, D as Si, $ as $i, J as Ci, p as Xt, q as pn, t as ft, u as Mn, w as en, x as En, K as Kt, y as po, E as ze, G as Un, H as fo, N as mo, O as Ii, P as Tn, Q as _i, V as xi, X as Oi, Z as Li, a0 as zi, a1 as Ai, a2 as Ro, a3 as tn, a4 as fn, a5 as jo, a6 as Pi, a7 as On, a8 as ue, a9 as Mi, aa as Ei, ab as Ti, ac as Fi, ad as Vi, ae as dn, af as mn, ag as Fn, ah as cn, ai as Di, aj as Bi, ak as Ri } from "./styles-jZc5gmBk.js";
import { openBlock as a, createElementBlock as u, mergeProps as W, createElementVNode as r, renderSlot as ie, createTextVNode as M, toDisplayString as c, resolveComponent as Oe, resolveDirective as io, withDirectives as De, createBlock as ce, resolveDynamicComponent as hn, withCtx as ee, createCommentVNode as h, normalizeClass as ne, computed as q, createVNode as m, Transition as Ho, Fragment as X, renderList as se, normalizeProps as ji, createSlots as Hi, withModifiers as Ln, defineComponent as nn, ref as j, watch as Ne, nextTick as bn, onBeforeUnmount as Uo, normalizeStyle as qt, onUnmounted as so, onMounted as ao, unref as o, useId as Ui, vModelText as zn, vShow as rn, vModelCheckbox as Ni, isRef as Lt, withKeys as Ki } from "vue";
import { Icon as C } from "@iconify/vue";
import { api as lo, loadByTagName as No, host as Ko, on as qi, define as Gi } from "@wippy-fe/proxy";
function tt(...e) {
  if (e) {
    let t = [];
    for (let n = 0; n < e.length; n++) {
      let s = e[n];
      if (!s) continue;
      let i = typeof s;
      if (i === "string" || i === "number") t.push(s);
      else if (i === "object") {
        let l = Array.isArray(s) ? [tt(...s)] : Object.entries(s).map(([p, b]) => b ? p : void 0);
        t = l.length ? t.concat(l.filter((p) => !!p)) : t;
      }
    }
    return t.join(" ").trim();
  }
}
function Wi() {
  let e = [], t = (p, b, v = 999) => {
    let k = i(p, b, v), S = k.value + (k.key === p ? 0 : v) + 1;
    return e.push({ key: p, value: S }), S;
  }, n = (p) => {
    e = e.filter((b) => b.value !== p);
  }, s = (p, b) => i(p).value, i = (p, b, v = 0) => [...e].reverse().find((k) => !0) || { key: p, value: v }, l = (p) => p && parseInt(p.style.zIndex, 10) || 0;
  return { get: l, set: (p, b, v) => {
    b && (b.style.zIndex = String(t(p, !0, v)));
  }, clear: (p) => {
    p && (n(l(p)), p.style.zIndex = "");
  }, getCurrent: (p) => s(p) };
}
var Qt = Wi(), Zi = `
.p-icon {
    display: inline-block;
    vertical-align: baseline;
    flex-shrink: 0;
}

.p-icon-spin {
    -webkit-animation: p-icon-spin 2s infinite linear;
    animation: p-icon-spin 2s infinite linear;
}

@-webkit-keyframes p-icon-spin {
    0% {
        -webkit-transform: rotate(0deg);
        transform: rotate(0deg);
    }
    100% {
        -webkit-transform: rotate(359deg);
        transform: rotate(359deg);
    }
}

@keyframes p-icon-spin {
    0% {
        -webkit-transform: rotate(0deg);
        transform: rotate(0deg);
    }
    100% {
        -webkit-transform: rotate(359deg);
        transform: rotate(359deg);
    }
}
`, Yi = mt.extend({
  name: "baseicon",
  css: Zi
});
function vn(e) {
  "@babel/helpers - typeof";
  return vn = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, vn(e);
}
function ho(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var s = Object.getOwnPropertySymbols(e);
    t && (s = s.filter(function(i) {
      return Object.getOwnPropertyDescriptor(e, i).enumerable;
    })), n.push.apply(n, s);
  }
  return n;
}
function bo(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? ho(Object(n), !0).forEach(function(s) {
      Xi(e, s, n[s]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : ho(Object(n)).forEach(function(s) {
      Object.defineProperty(e, s, Object.getOwnPropertyDescriptor(n, s));
    });
  }
  return e;
}
function Xi(e, t, n) {
  return (t = Ji(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Ji(e) {
  var t = Qi(e, "string");
  return vn(t) == "symbol" ? t : t + "";
}
function Qi(e, t) {
  if (vn(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var s = n.call(e, t);
    if (vn(s) != "object") return s;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var Pt = {
  name: "BaseIcon",
  extends: At,
  props: {
    label: {
      type: String,
      default: void 0
    },
    spin: {
      type: Boolean,
      default: !1
    }
  },
  style: Yi,
  provide: function() {
    return {
      $pcIcon: this,
      $parentInstance: this
    };
  },
  methods: {
    pti: function() {
      var t = no(this.label);
      return bo(bo({}, !this.isUnstyled && {
        class: ["p-icon", {
          "p-icon-spin": this.spin
        }]
      }), {}, {
        role: t ? void 0 : "img",
        "aria-label": t ? void 0 : this.label,
        "aria-hidden": t
      });
    }
  }
};
function gn(e) {
  "@babel/helpers - typeof";
  return gn = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, gn(e);
}
function es(e, t) {
  if (!(e instanceof t)) throw new TypeError("Cannot call a class as a function");
}
function ts(e, t) {
  for (var n = 0; n < t.length; n++) {
    var s = t[n];
    s.enumerable = s.enumerable || !1, s.configurable = !0, "value" in s && (s.writable = !0), Object.defineProperty(e, os(s.key), s);
  }
}
function ns(e, t, n) {
  return t && ts(e.prototype, t), Object.defineProperty(e, "prototype", { writable: !1 }), e;
}
function os(e) {
  var t = is(e, "string");
  return gn(t) == "symbol" ? t : t + "";
}
function is(e, t) {
  if (gn(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var s = n.call(e, t);
    if (gn(s) != "object") return s;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return String(e);
}
var ss = /* @__PURE__ */ (function() {
  function e(t) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : function() {
    };
    es(this, e), this.element = t, this.listener = n;
  }
  return ns(e, [{
    key: "bindScrollListener",
    value: function() {
      this.scrollableParents = li(this.element);
      for (var n = 0; n < this.scrollableParents.length; n++)
        this.scrollableParents[n].addEventListener("scroll", this.listener);
    }
  }, {
    key: "unbindScrollListener",
    value: function() {
      if (this.scrollableParents)
        for (var n = 0; n < this.scrollableParents.length; n++)
          this.scrollableParents[n].removeEventListener("scroll", this.listener);
    }
  }, {
    key: "destroy",
    value: function() {
      this.unbindScrollListener(), this.element = null, this.listener = null, this.scrollableParents = null;
    }
  }]);
})(), as = ri(), Dn = {
  name: "SpinnerIcon",
  extends: Pt
};
function ls(e) {
  return cs(e) || ds(e) || us(e) || rs();
}
function rs() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function us(e, t) {
  if (e) {
    if (typeof e == "string") return Nn(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Nn(e, t) : void 0;
  }
}
function ds(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function cs(e) {
  if (Array.isArray(e)) return Nn(e);
}
function Nn(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, s = Array(t); n < t; n++) s[n] = e[n];
  return s;
}
function ps(e, t, n, s, i, l) {
  return a(), u("svg", W({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), ls(t[0] || (t[0] = [r("path", {
    d: "M6.99701 14C5.85441 13.999 4.72939 13.7186 3.72012 13.1832C2.71084 12.6478 1.84795 11.8737 1.20673 10.9284C0.565504 9.98305 0.165424 8.89526 0.041387 7.75989C-0.0826496 6.62453 0.073125 5.47607 0.495122 4.4147C0.917119 3.35333 1.59252 2.4113 2.46241 1.67077C3.33229 0.930247 4.37024 0.413729 5.4857 0.166275C6.60117 -0.0811796 7.76026 -0.0520535 8.86188 0.251112C9.9635 0.554278 10.9742 1.12227 11.8057 1.90555C11.915 2.01493 11.9764 2.16319 11.9764 2.31778C11.9764 2.47236 11.915 2.62062 11.8057 2.73C11.7521 2.78503 11.688 2.82877 11.6171 2.85864C11.5463 2.8885 11.4702 2.90389 11.3933 2.90389C11.3165 2.90389 11.2404 2.8885 11.1695 2.85864C11.0987 2.82877 11.0346 2.78503 10.9809 2.73C9.9998 1.81273 8.73246 1.26138 7.39226 1.16876C6.05206 1.07615 4.72086 1.44794 3.62279 2.22152C2.52471 2.99511 1.72683 4.12325 1.36345 5.41602C1.00008 6.70879 1.09342 8.08723 1.62775 9.31926C2.16209 10.5513 3.10478 11.5617 4.29713 12.1803C5.48947 12.7989 6.85865 12.988 8.17414 12.7157C9.48963 12.4435 10.6711 11.7264 11.5196 10.6854C12.3681 9.64432 12.8319 8.34282 12.8328 7C12.8328 6.84529 12.8943 6.69692 13.0038 6.58752C13.1132 6.47812 13.2616 6.41667 13.4164 6.41667C13.5712 6.41667 13.7196 6.47812 13.8291 6.58752C13.9385 6.69692 14 6.84529 14 7C14 8.85651 13.2622 10.637 11.9489 11.9497C10.6356 13.2625 8.85432 14 6.99701 14Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
Dn.render = ps;
var fs = `
    .p-badge {
        display: inline-flex;
        border-radius: dt('badge.border.radius');
        align-items: center;
        justify-content: center;
        padding: dt('badge.padding');
        background: dt('badge.primary.background');
        color: dt('badge.primary.color');
        font-size: dt('badge.font.size');
        font-weight: dt('badge.font.weight');
        min-width: dt('badge.min.width');
        height: dt('badge.height');
    }

    .p-badge-dot {
        width: dt('badge.dot.size');
        min-width: dt('badge.dot.size');
        height: dt('badge.dot.size');
        border-radius: 50%;
        padding: 0;
    }

    .p-badge-circle {
        padding: 0;
        border-radius: 50%;
    }

    .p-badge-secondary {
        background: dt('badge.secondary.background');
        color: dt('badge.secondary.color');
    }

    .p-badge-success {
        background: dt('badge.success.background');
        color: dt('badge.success.color');
    }

    .p-badge-info {
        background: dt('badge.info.background');
        color: dt('badge.info.color');
    }

    .p-badge-warn {
        background: dt('badge.warn.background');
        color: dt('badge.warn.color');
    }

    .p-badge-danger {
        background: dt('badge.danger.background');
        color: dt('badge.danger.color');
    }

    .p-badge-contrast {
        background: dt('badge.contrast.background');
        color: dt('badge.contrast.color');
    }

    .p-badge-sm {
        font-size: dt('badge.sm.font.size');
        min-width: dt('badge.sm.min.width');
        height: dt('badge.sm.height');
    }

    .p-badge-lg {
        font-size: dt('badge.lg.font.size');
        min-width: dt('badge.lg.min.width');
        height: dt('badge.lg.height');
    }

    .p-badge-xl {
        font-size: dt('badge.xl.font.size');
        min-width: dt('badge.xl.min.width');
        height: dt('badge.xl.height');
    }
`, ms = {
  root: function(t) {
    var n = t.props, s = t.instance;
    return ["p-badge p-component", {
      "p-badge-circle": zt(n.value) && String(n.value).length === 1,
      "p-badge-dot": no(n.value) && !s.$slots.default,
      "p-badge-sm": n.size === "small",
      "p-badge-lg": n.size === "large",
      "p-badge-xl": n.size === "xlarge",
      "p-badge-info": n.severity === "info",
      "p-badge-success": n.severity === "success",
      "p-badge-warn": n.severity === "warn",
      "p-badge-danger": n.severity === "danger",
      "p-badge-secondary": n.severity === "secondary",
      "p-badge-contrast": n.severity === "contrast"
    }];
  }
}, hs = mt.extend({
  name: "badge",
  style: fs,
  classes: ms
}), bs = {
  name: "BaseBadge",
  extends: At,
  props: {
    value: {
      type: [String, Number],
      default: null
    },
    severity: {
      type: String,
      default: null
    },
    size: {
      type: String,
      default: null
    }
  },
  style: hs,
  provide: function() {
    return {
      $pcBadge: this,
      $parentInstance: this
    };
  }
};
function yn(e) {
  "@babel/helpers - typeof";
  return yn = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, yn(e);
}
function vo(e, t, n) {
  return (t = vs(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function vs(e) {
  var t = gs(e, "string");
  return yn(t) == "symbol" ? t : t + "";
}
function gs(e, t) {
  if (yn(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var s = n.call(e, t);
    if (yn(s) != "object") return s;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var qo = {
  name: "Badge",
  extends: bs,
  inheritAttrs: !1,
  computed: {
    dataP: function() {
      return tt(vo(vo({
        circle: this.value != null && String(this.value).length === 1,
        empty: this.value == null && !this.$slots.default
      }, this.severity, this.severity), this.size, this.size));
    }
  }
}, ys = ["data-p"];
function ks(e, t, n, s, i, l) {
  return a(), u("span", W({
    class: e.cx("root"),
    "data-p": l.dataP
  }, e.ptmi("root")), [ie(e.$slots, "default", {}, function() {
    return [M(c(e.value), 1)];
  })], 16, ys);
}
qo.render = ks;
var ws = `
    .p-button {
        display: inline-flex;
        cursor: pointer;
        user-select: none;
        align-items: center;
        justify-content: center;
        overflow: hidden;
        position: relative;
        color: dt('button.primary.color');
        background: dt('button.primary.background');
        border: 1px solid dt('button.primary.border.color');
        padding: dt('button.padding.y') dt('button.padding.x');
        font-size: 1rem;
        font-family: inherit;
        font-feature-settings: inherit;
        transition:
            background dt('button.transition.duration'),
            color dt('button.transition.duration'),
            border-color dt('button.transition.duration'),
            outline-color dt('button.transition.duration'),
            box-shadow dt('button.transition.duration');
        border-radius: dt('button.border.radius');
        outline-color: transparent;
        gap: dt('button.gap');
    }

    .p-button:disabled {
        cursor: default;
    }

    .p-button-icon-right {
        order: 1;
    }

    .p-button-icon-right:dir(rtl) {
        order: -1;
    }

    .p-button:not(.p-button-vertical) .p-button-icon:not(.p-button-icon-right):dir(rtl) {
        order: 1;
    }

    .p-button-icon-bottom {
        order: 2;
    }

    .p-button-icon-only {
        width: dt('button.icon.only.width');
        padding-inline-start: 0;
        padding-inline-end: 0;
        gap: 0;
    }

    .p-button-icon-only.p-button-rounded {
        border-radius: 50%;
        height: dt('button.icon.only.width');
    }

    .p-button-icon-only .p-button-label {
        visibility: hidden;
        width: 0;
    }

    .p-button-icon-only::after {
        content: " ";
        visibility: hidden;
        width: 0;
    }

    .p-button-sm {
        font-size: dt('button.sm.font.size');
        padding: dt('button.sm.padding.y') dt('button.sm.padding.x');
    }

    .p-button-sm .p-button-icon {
        font-size: dt('button.sm.font.size');
    }

    .p-button-sm.p-button-icon-only {
        width: dt('button.sm.icon.only.width');
    }

    .p-button-sm.p-button-icon-only.p-button-rounded {
        height: dt('button.sm.icon.only.width');
    }

    .p-button-lg {
        font-size: dt('button.lg.font.size');
        padding: dt('button.lg.padding.y') dt('button.lg.padding.x');
    }

    .p-button-lg .p-button-icon {
        font-size: dt('button.lg.font.size');
    }

    .p-button-lg.p-button-icon-only {
        width: dt('button.lg.icon.only.width');
    }

    .p-button-lg.p-button-icon-only.p-button-rounded {
        height: dt('button.lg.icon.only.width');
    }

    .p-button-vertical {
        flex-direction: column;
    }

    .p-button-label {
        font-weight: dt('button.label.font.weight');
    }

    .p-button-fluid {
        width: 100%;
    }

    .p-button-fluid.p-button-icon-only {
        width: dt('button.icon.only.width');
    }

    .p-button:not(:disabled):hover {
        background: dt('button.primary.hover.background');
        border: 1px solid dt('button.primary.hover.border.color');
        color: dt('button.primary.hover.color');
    }

    .p-button:not(:disabled):active {
        background: dt('button.primary.active.background');
        border: 1px solid dt('button.primary.active.border.color');
        color: dt('button.primary.active.color');
    }

    .p-button:focus-visible {
        box-shadow: dt('button.primary.focus.ring.shadow');
        outline: dt('button.focus.ring.width') dt('button.focus.ring.style') dt('button.primary.focus.ring.color');
        outline-offset: dt('button.focus.ring.offset');
    }

    .p-button .p-badge {
        min-width: dt('button.badge.size');
        height: dt('button.badge.size');
        line-height: dt('button.badge.size');
    }

    .p-button-raised {
        box-shadow: dt('button.raised.shadow');
    }

    .p-button-rounded {
        border-radius: dt('button.rounded.border.radius');
    }

    .p-button-secondary {
        background: dt('button.secondary.background');
        border: 1px solid dt('button.secondary.border.color');
        color: dt('button.secondary.color');
    }

    .p-button-secondary:not(:disabled):hover {
        background: dt('button.secondary.hover.background');
        border: 1px solid dt('button.secondary.hover.border.color');
        color: dt('button.secondary.hover.color');
    }

    .p-button-secondary:not(:disabled):active {
        background: dt('button.secondary.active.background');
        border: 1px solid dt('button.secondary.active.border.color');
        color: dt('button.secondary.active.color');
    }

    .p-button-secondary:focus-visible {
        outline-color: dt('button.secondary.focus.ring.color');
        box-shadow: dt('button.secondary.focus.ring.shadow');
    }

    .p-button-success {
        background: dt('button.success.background');
        border: 1px solid dt('button.success.border.color');
        color: dt('button.success.color');
    }

    .p-button-success:not(:disabled):hover {
        background: dt('button.success.hover.background');
        border: 1px solid dt('button.success.hover.border.color');
        color: dt('button.success.hover.color');
    }

    .p-button-success:not(:disabled):active {
        background: dt('button.success.active.background');
        border: 1px solid dt('button.success.active.border.color');
        color: dt('button.success.active.color');
    }

    .p-button-success:focus-visible {
        outline-color: dt('button.success.focus.ring.color');
        box-shadow: dt('button.success.focus.ring.shadow');
    }

    .p-button-info {
        background: dt('button.info.background');
        border: 1px solid dt('button.info.border.color');
        color: dt('button.info.color');
    }

    .p-button-info:not(:disabled):hover {
        background: dt('button.info.hover.background');
        border: 1px solid dt('button.info.hover.border.color');
        color: dt('button.info.hover.color');
    }

    .p-button-info:not(:disabled):active {
        background: dt('button.info.active.background');
        border: 1px solid dt('button.info.active.border.color');
        color: dt('button.info.active.color');
    }

    .p-button-info:focus-visible {
        outline-color: dt('button.info.focus.ring.color');
        box-shadow: dt('button.info.focus.ring.shadow');
    }

    .p-button-warn {
        background: dt('button.warn.background');
        border: 1px solid dt('button.warn.border.color');
        color: dt('button.warn.color');
    }

    .p-button-warn:not(:disabled):hover {
        background: dt('button.warn.hover.background');
        border: 1px solid dt('button.warn.hover.border.color');
        color: dt('button.warn.hover.color');
    }

    .p-button-warn:not(:disabled):active {
        background: dt('button.warn.active.background');
        border: 1px solid dt('button.warn.active.border.color');
        color: dt('button.warn.active.color');
    }

    .p-button-warn:focus-visible {
        outline-color: dt('button.warn.focus.ring.color');
        box-shadow: dt('button.warn.focus.ring.shadow');
    }

    .p-button-help {
        background: dt('button.help.background');
        border: 1px solid dt('button.help.border.color');
        color: dt('button.help.color');
    }

    .p-button-help:not(:disabled):hover {
        background: dt('button.help.hover.background');
        border: 1px solid dt('button.help.hover.border.color');
        color: dt('button.help.hover.color');
    }

    .p-button-help:not(:disabled):active {
        background: dt('button.help.active.background');
        border: 1px solid dt('button.help.active.border.color');
        color: dt('button.help.active.color');
    }

    .p-button-help:focus-visible {
        outline-color: dt('button.help.focus.ring.color');
        box-shadow: dt('button.help.focus.ring.shadow');
    }

    .p-button-danger {
        background: dt('button.danger.background');
        border: 1px solid dt('button.danger.border.color');
        color: dt('button.danger.color');
    }

    .p-button-danger:not(:disabled):hover {
        background: dt('button.danger.hover.background');
        border: 1px solid dt('button.danger.hover.border.color');
        color: dt('button.danger.hover.color');
    }

    .p-button-danger:not(:disabled):active {
        background: dt('button.danger.active.background');
        border: 1px solid dt('button.danger.active.border.color');
        color: dt('button.danger.active.color');
    }

    .p-button-danger:focus-visible {
        outline-color: dt('button.danger.focus.ring.color');
        box-shadow: dt('button.danger.focus.ring.shadow');
    }

    .p-button-contrast {
        background: dt('button.contrast.background');
        border: 1px solid dt('button.contrast.border.color');
        color: dt('button.contrast.color');
    }

    .p-button-contrast:not(:disabled):hover {
        background: dt('button.contrast.hover.background');
        border: 1px solid dt('button.contrast.hover.border.color');
        color: dt('button.contrast.hover.color');
    }

    .p-button-contrast:not(:disabled):active {
        background: dt('button.contrast.active.background');
        border: 1px solid dt('button.contrast.active.border.color');
        color: dt('button.contrast.active.color');
    }

    .p-button-contrast:focus-visible {
        outline-color: dt('button.contrast.focus.ring.color');
        box-shadow: dt('button.contrast.focus.ring.shadow');
    }

    .p-button-outlined {
        background: transparent;
        border-color: dt('button.outlined.primary.border.color');
        color: dt('button.outlined.primary.color');
    }

    .p-button-outlined:not(:disabled):hover {
        background: dt('button.outlined.primary.hover.background');
        border-color: dt('button.outlined.primary.border.color');
        color: dt('button.outlined.primary.color');
    }

    .p-button-outlined:not(:disabled):active {
        background: dt('button.outlined.primary.active.background');
        border-color: dt('button.outlined.primary.border.color');
        color: dt('button.outlined.primary.color');
    }

    .p-button-outlined.p-button-secondary {
        border-color: dt('button.outlined.secondary.border.color');
        color: dt('button.outlined.secondary.color');
    }

    .p-button-outlined.p-button-secondary:not(:disabled):hover {
        background: dt('button.outlined.secondary.hover.background');
        border-color: dt('button.outlined.secondary.border.color');
        color: dt('button.outlined.secondary.color');
    }

    .p-button-outlined.p-button-secondary:not(:disabled):active {
        background: dt('button.outlined.secondary.active.background');
        border-color: dt('button.outlined.secondary.border.color');
        color: dt('button.outlined.secondary.color');
    }

    .p-button-outlined.p-button-success {
        border-color: dt('button.outlined.success.border.color');
        color: dt('button.outlined.success.color');
    }

    .p-button-outlined.p-button-success:not(:disabled):hover {
        background: dt('button.outlined.success.hover.background');
        border-color: dt('button.outlined.success.border.color');
        color: dt('button.outlined.success.color');
    }

    .p-button-outlined.p-button-success:not(:disabled):active {
        background: dt('button.outlined.success.active.background');
        border-color: dt('button.outlined.success.border.color');
        color: dt('button.outlined.success.color');
    }

    .p-button-outlined.p-button-info {
        border-color: dt('button.outlined.info.border.color');
        color: dt('button.outlined.info.color');
    }

    .p-button-outlined.p-button-info:not(:disabled):hover {
        background: dt('button.outlined.info.hover.background');
        border-color: dt('button.outlined.info.border.color');
        color: dt('button.outlined.info.color');
    }

    .p-button-outlined.p-button-info:not(:disabled):active {
        background: dt('button.outlined.info.active.background');
        border-color: dt('button.outlined.info.border.color');
        color: dt('button.outlined.info.color');
    }

    .p-button-outlined.p-button-warn {
        border-color: dt('button.outlined.warn.border.color');
        color: dt('button.outlined.warn.color');
    }

    .p-button-outlined.p-button-warn:not(:disabled):hover {
        background: dt('button.outlined.warn.hover.background');
        border-color: dt('button.outlined.warn.border.color');
        color: dt('button.outlined.warn.color');
    }

    .p-button-outlined.p-button-warn:not(:disabled):active {
        background: dt('button.outlined.warn.active.background');
        border-color: dt('button.outlined.warn.border.color');
        color: dt('button.outlined.warn.color');
    }

    .p-button-outlined.p-button-help {
        border-color: dt('button.outlined.help.border.color');
        color: dt('button.outlined.help.color');
    }

    .p-button-outlined.p-button-help:not(:disabled):hover {
        background: dt('button.outlined.help.hover.background');
        border-color: dt('button.outlined.help.border.color');
        color: dt('button.outlined.help.color');
    }

    .p-button-outlined.p-button-help:not(:disabled):active {
        background: dt('button.outlined.help.active.background');
        border-color: dt('button.outlined.help.border.color');
        color: dt('button.outlined.help.color');
    }

    .p-button-outlined.p-button-danger {
        border-color: dt('button.outlined.danger.border.color');
        color: dt('button.outlined.danger.color');
    }

    .p-button-outlined.p-button-danger:not(:disabled):hover {
        background: dt('button.outlined.danger.hover.background');
        border-color: dt('button.outlined.danger.border.color');
        color: dt('button.outlined.danger.color');
    }

    .p-button-outlined.p-button-danger:not(:disabled):active {
        background: dt('button.outlined.danger.active.background');
        border-color: dt('button.outlined.danger.border.color');
        color: dt('button.outlined.danger.color');
    }

    .p-button-outlined.p-button-contrast {
        border-color: dt('button.outlined.contrast.border.color');
        color: dt('button.outlined.contrast.color');
    }

    .p-button-outlined.p-button-contrast:not(:disabled):hover {
        background: dt('button.outlined.contrast.hover.background');
        border-color: dt('button.outlined.contrast.border.color');
        color: dt('button.outlined.contrast.color');
    }

    .p-button-outlined.p-button-contrast:not(:disabled):active {
        background: dt('button.outlined.contrast.active.background');
        border-color: dt('button.outlined.contrast.border.color');
        color: dt('button.outlined.contrast.color');
    }

    .p-button-outlined.p-button-plain {
        border-color: dt('button.outlined.plain.border.color');
        color: dt('button.outlined.plain.color');
    }

    .p-button-outlined.p-button-plain:not(:disabled):hover {
        background: dt('button.outlined.plain.hover.background');
        border-color: dt('button.outlined.plain.border.color');
        color: dt('button.outlined.plain.color');
    }

    .p-button-outlined.p-button-plain:not(:disabled):active {
        background: dt('button.outlined.plain.active.background');
        border-color: dt('button.outlined.plain.border.color');
        color: dt('button.outlined.plain.color');
    }

    .p-button-text {
        background: transparent;
        border-color: transparent;
        color: dt('button.text.primary.color');
    }

    .p-button-text:not(:disabled):hover {
        background: dt('button.text.primary.hover.background');
        border-color: transparent;
        color: dt('button.text.primary.color');
    }

    .p-button-text:not(:disabled):active {
        background: dt('button.text.primary.active.background');
        border-color: transparent;
        color: dt('button.text.primary.color');
    }

    .p-button-text.p-button-secondary {
        background: transparent;
        border-color: transparent;
        color: dt('button.text.secondary.color');
    }

    .p-button-text.p-button-secondary:not(:disabled):hover {
        background: dt('button.text.secondary.hover.background');
        border-color: transparent;
        color: dt('button.text.secondary.color');
    }

    .p-button-text.p-button-secondary:not(:disabled):active {
        background: dt('button.text.secondary.active.background');
        border-color: transparent;
        color: dt('button.text.secondary.color');
    }

    .p-button-text.p-button-success {
        background: transparent;
        border-color: transparent;
        color: dt('button.text.success.color');
    }

    .p-button-text.p-button-success:not(:disabled):hover {
        background: dt('button.text.success.hover.background');
        border-color: transparent;
        color: dt('button.text.success.color');
    }

    .p-button-text.p-button-success:not(:disabled):active {
        background: dt('button.text.success.active.background');
        border-color: transparent;
        color: dt('button.text.success.color');
    }

    .p-button-text.p-button-info {
        background: transparent;
        border-color: transparent;
        color: dt('button.text.info.color');
    }

    .p-button-text.p-button-info:not(:disabled):hover {
        background: dt('button.text.info.hover.background');
        border-color: transparent;
        color: dt('button.text.info.color');
    }

    .p-button-text.p-button-info:not(:disabled):active {
        background: dt('button.text.info.active.background');
        border-color: transparent;
        color: dt('button.text.info.color');
    }

    .p-button-text.p-button-warn {
        background: transparent;
        border-color: transparent;
        color: dt('button.text.warn.color');
    }

    .p-button-text.p-button-warn:not(:disabled):hover {
        background: dt('button.text.warn.hover.background');
        border-color: transparent;
        color: dt('button.text.warn.color');
    }

    .p-button-text.p-button-warn:not(:disabled):active {
        background: dt('button.text.warn.active.background');
        border-color: transparent;
        color: dt('button.text.warn.color');
    }

    .p-button-text.p-button-help {
        background: transparent;
        border-color: transparent;
        color: dt('button.text.help.color');
    }

    .p-button-text.p-button-help:not(:disabled):hover {
        background: dt('button.text.help.hover.background');
        border-color: transparent;
        color: dt('button.text.help.color');
    }

    .p-button-text.p-button-help:not(:disabled):active {
        background: dt('button.text.help.active.background');
        border-color: transparent;
        color: dt('button.text.help.color');
    }

    .p-button-text.p-button-danger {
        background: transparent;
        border-color: transparent;
        color: dt('button.text.danger.color');
    }

    .p-button-text.p-button-danger:not(:disabled):hover {
        background: dt('button.text.danger.hover.background');
        border-color: transparent;
        color: dt('button.text.danger.color');
    }

    .p-button-text.p-button-danger:not(:disabled):active {
        background: dt('button.text.danger.active.background');
        border-color: transparent;
        color: dt('button.text.danger.color');
    }

    .p-button-text.p-button-contrast {
        background: transparent;
        border-color: transparent;
        color: dt('button.text.contrast.color');
    }

    .p-button-text.p-button-contrast:not(:disabled):hover {
        background: dt('button.text.contrast.hover.background');
        border-color: transparent;
        color: dt('button.text.contrast.color');
    }

    .p-button-text.p-button-contrast:not(:disabled):active {
        background: dt('button.text.contrast.active.background');
        border-color: transparent;
        color: dt('button.text.contrast.color');
    }

    .p-button-text.p-button-plain {
        background: transparent;
        border-color: transparent;
        color: dt('button.text.plain.color');
    }

    .p-button-text.p-button-plain:not(:disabled):hover {
        background: dt('button.text.plain.hover.background');
        border-color: transparent;
        color: dt('button.text.plain.color');
    }

    .p-button-text.p-button-plain:not(:disabled):active {
        background: dt('button.text.plain.active.background');
        border-color: transparent;
        color: dt('button.text.plain.color');
    }

    .p-button-link {
        background: transparent;
        border-color: transparent;
        color: dt('button.link.color');
    }

    .p-button-link:not(:disabled):hover {
        background: transparent;
        border-color: transparent;
        color: dt('button.link.hover.color');
    }

    .p-button-link:not(:disabled):hover .p-button-label {
        text-decoration: underline;
    }

    .p-button-link:not(:disabled):active {
        background: transparent;
        border-color: transparent;
        color: dt('button.link.active.color');
    }
`;
function kn(e) {
  "@babel/helpers - typeof";
  return kn = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, kn(e);
}
function pt(e, t, n) {
  return (t = Ss(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Ss(e) {
  var t = $s(e, "string");
  return kn(t) == "symbol" ? t : t + "";
}
function $s(e, t) {
  if (kn(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var s = n.call(e, t);
    if (kn(s) != "object") return s;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var Cs = {
  root: function(t) {
    var n = t.instance, s = t.props;
    return ["p-button p-component", pt(pt(pt(pt(pt(pt(pt(pt(pt({
      "p-button-icon-only": n.hasIcon && !s.label && !s.badge,
      "p-button-vertical": (s.iconPos === "top" || s.iconPos === "bottom") && s.label,
      "p-button-loading": s.loading,
      "p-button-link": s.link || s.variant === "link"
    }, "p-button-".concat(s.severity), s.severity), "p-button-raised", s.raised), "p-button-rounded", s.rounded), "p-button-text", s.text || s.variant === "text"), "p-button-outlined", s.outlined || s.variant === "outlined"), "p-button-sm", s.size === "small"), "p-button-lg", s.size === "large"), "p-button-plain", s.plain), "p-button-fluid", n.hasFluid)];
  },
  loadingIcon: "p-button-loading-icon",
  icon: function(t) {
    var n = t.props;
    return ["p-button-icon", pt({}, "p-button-icon-".concat(n.iconPos), n.label)];
  },
  label: "p-button-label"
}, Is = mt.extend({
  name: "button",
  style: ws,
  classes: Cs
}), _s = {
  name: "BaseButton",
  extends: At,
  props: {
    label: {
      type: String,
      default: null
    },
    icon: {
      type: String,
      default: null
    },
    iconPos: {
      type: String,
      default: "left"
    },
    iconClass: {
      type: [String, Object],
      default: null
    },
    badge: {
      type: String,
      default: null
    },
    badgeClass: {
      type: [String, Object],
      default: null
    },
    badgeSeverity: {
      type: String,
      default: "secondary"
    },
    loading: {
      type: Boolean,
      default: !1
    },
    loadingIcon: {
      type: String,
      default: void 0
    },
    as: {
      type: [String, Object],
      default: "BUTTON"
    },
    asChild: {
      type: Boolean,
      default: !1
    },
    link: {
      type: Boolean,
      default: !1
    },
    severity: {
      type: String,
      default: null
    },
    raised: {
      type: Boolean,
      default: !1
    },
    rounded: {
      type: Boolean,
      default: !1
    },
    text: {
      type: Boolean,
      default: !1
    },
    outlined: {
      type: Boolean,
      default: !1
    },
    size: {
      type: String,
      default: null
    },
    variant: {
      type: String,
      default: null
    },
    plain: {
      type: Boolean,
      default: !1
    },
    fluid: {
      type: Boolean,
      default: null
    }
  },
  style: Is,
  provide: function() {
    return {
      $pcButton: this,
      $parentInstance: this
    };
  }
};
function wn(e) {
  "@babel/helpers - typeof";
  return wn = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, wn(e);
}
function Ee(e, t, n) {
  return (t = xs(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function xs(e) {
  var t = Os(e, "string");
  return wn(t) == "symbol" ? t : t + "";
}
function Os(e, t) {
  if (wn(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var s = n.call(e, t);
    if (wn(s) != "object") return s;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var le = {
  name: "Button",
  extends: _s,
  inheritAttrs: !1,
  inject: {
    $pcFluid: {
      default: null
    }
  },
  methods: {
    getPTOptions: function(t) {
      var n = t === "root" ? this.ptmi : this.ptm;
      return n(t, {
        context: {
          disabled: this.disabled
        }
      });
    }
  },
  computed: {
    disabled: function() {
      return this.$attrs.disabled || this.$attrs.disabled === "" || this.loading;
    },
    defaultAriaLabel: function() {
      return this.label ? this.label + (this.badge ? " " + this.badge : "") : this.$attrs.ariaLabel;
    },
    hasIcon: function() {
      return this.icon || this.$slots.icon;
    },
    attrs: function() {
      return W(this.asAttrs, this.a11yAttrs, this.getPTOptions("root"));
    },
    asAttrs: function() {
      return this.as === "BUTTON" ? {
        type: "button",
        disabled: this.disabled
      } : void 0;
    },
    a11yAttrs: function() {
      return {
        "aria-label": this.defaultAriaLabel,
        "data-pc-name": "button",
        "data-p-disabled": this.disabled,
        "data-p-severity": this.severity
      };
    },
    hasFluid: function() {
      return no(this.fluid) ? !!this.$pcFluid : this.fluid;
    },
    dataP: function() {
      return tt(Ee(Ee(Ee(Ee(Ee(Ee(Ee(Ee(Ee(Ee({}, this.size, this.size), "icon-only", this.hasIcon && !this.label && !this.badge), "loading", this.loading), "fluid", this.hasFluid), "rounded", this.rounded), "raised", this.raised), "outlined", this.outlined || this.variant === "outlined"), "text", this.text || this.variant === "text"), "link", this.link || this.variant === "link"), "vertical", (this.iconPos === "top" || this.iconPos === "bottom") && this.label));
    },
    dataIconP: function() {
      return tt(Ee(Ee({}, this.iconPos, this.iconPos), this.size, this.size));
    },
    dataLabelP: function() {
      return tt(Ee(Ee({}, this.size, this.size), "icon-only", this.hasIcon && !this.label && !this.badge));
    }
  },
  components: {
    SpinnerIcon: Dn,
    Badge: qo
  },
  directives: {
    ripple: oo
  }
}, Ls = ["data-p"], zs = ["data-p"];
function As(e, t, n, s, i, l) {
  var p = Oe("SpinnerIcon"), b = Oe("Badge"), v = io("ripple");
  return e.asChild ? ie(e.$slots, "default", {
    key: 1,
    class: ne(e.cx("root")),
    a11yAttrs: l.a11yAttrs
  }) : De((a(), ce(hn(e.as), W({
    key: 0,
    class: e.cx("root"),
    "data-p": l.dataP
  }, l.attrs), {
    default: ee(function() {
      return [ie(e.$slots, "default", {}, function() {
        return [e.loading ? ie(e.$slots, "loadingicon", W({
          key: 0,
          class: [e.cx("loadingIcon"), e.cx("icon")]
        }, e.ptm("loadingIcon")), function() {
          return [e.loadingIcon ? (a(), u("span", W({
            key: 0,
            class: [e.cx("loadingIcon"), e.cx("icon"), e.loadingIcon]
          }, e.ptm("loadingIcon")), null, 16)) : (a(), ce(p, W({
            key: 1,
            class: [e.cx("loadingIcon"), e.cx("icon")],
            spin: ""
          }, e.ptm("loadingIcon")), null, 16, ["class"]))];
        }) : ie(e.$slots, "icon", W({
          key: 1,
          class: [e.cx("icon")]
        }, e.ptm("icon")), function() {
          return [e.icon ? (a(), u("span", W({
            key: 0,
            class: [e.cx("icon"), e.icon, e.iconClass],
            "data-p": l.dataIconP
          }, e.ptm("icon")), null, 16, Ls)) : h("", !0)];
        }), e.label ? (a(), u("span", W({
          key: 2,
          class: e.cx("label")
        }, e.ptm("label"), {
          "data-p": l.dataLabelP
        }), c(e.label), 17, zs)) : h("", !0), e.badge ? (a(), ce(b, {
          key: 3,
          value: e.badge,
          class: ne(e.badgeClass),
          severity: e.badgeSeverity,
          unstyled: e.unstyled,
          pt: e.ptm("pcBadge")
        }, null, 8, ["value", "class", "severity", "unstyled", "pt"])) : h("", !0)];
      })];
    }),
    _: 3
  }, 16, ["class", "data-p"])), [[v]]);
}
le.render = As;
var ro = {
  name: "TimesIcon",
  extends: Pt
};
function Ps(e) {
  return Fs(e) || Ts(e) || Es(e) || Ms();
}
function Ms() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Es(e, t) {
  if (e) {
    if (typeof e == "string") return Kn(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Kn(e, t) : void 0;
  }
}
function Ts(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function Fs(e) {
  if (Array.isArray(e)) return Kn(e);
}
function Kn(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, s = Array(t); n < t; n++) s[n] = e[n];
  return s;
}
function Vs(e, t, n, s, i, l) {
  return a(), u("svg", W({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), Ps(t[0] || (t[0] = [r("path", {
    d: "M8.01186 7.00933L12.27 2.75116C12.341 2.68501 12.398 2.60524 12.4375 2.51661C12.4769 2.42798 12.4982 2.3323 12.4999 2.23529C12.5016 2.13827 12.4838 2.0419 12.4474 1.95194C12.4111 1.86197 12.357 1.78024 12.2884 1.71163C12.2198 1.64302 12.138 1.58893 12.0481 1.55259C11.9581 1.51625 11.8617 1.4984 11.7647 1.50011C11.6677 1.50182 11.572 1.52306 11.4834 1.56255C11.3948 1.60204 11.315 1.65898 11.2488 1.72997L6.99067 5.98814L2.7325 1.72997C2.59553 1.60234 2.41437 1.53286 2.22718 1.53616C2.03999 1.53946 1.8614 1.61529 1.72901 1.74767C1.59663 1.88006 1.5208 2.05865 1.5175 2.24584C1.5142 2.43303 1.58368 2.61419 1.71131 2.75116L5.96948 7.00933L1.71131 11.2675C1.576 11.403 1.5 11.5866 1.5 11.7781C1.5 11.9696 1.576 12.1532 1.71131 12.2887C1.84679 12.424 2.03043 12.5 2.2219 12.5C2.41338 12.5 2.59702 12.424 2.7325 12.2887L6.99067 8.03052L11.2488 12.2887C11.3843 12.424 11.568 12.5 11.7594 12.5C11.9509 12.5 12.1346 12.424 12.27 12.2887C12.4053 12.1532 12.4813 11.9696 12.4813 11.7781C12.4813 11.5866 12.4053 11.403 12.27 11.2675L8.01186 7.00933Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
ro.render = Vs;
var Go = {
  name: "WindowMaximizeIcon",
  extends: Pt
};
function Ds(e) {
  return Hs(e) || js(e) || Rs(e) || Bs();
}
function Bs() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Rs(e, t) {
  if (e) {
    if (typeof e == "string") return qn(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? qn(e, t) : void 0;
  }
}
function js(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function Hs(e) {
  if (Array.isArray(e)) return qn(e);
}
function qn(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, s = Array(t); n < t; n++) s[n] = e[n];
  return s;
}
function Us(e, t, n, s, i, l) {
  return a(), u("svg", W({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), Ds(t[0] || (t[0] = [r("path", {
    "fill-rule": "evenodd",
    "clip-rule": "evenodd",
    d: "M7 14H11.8C12.3835 14 12.9431 13.7682 13.3556 13.3556C13.7682 12.9431 14 12.3835 14 11.8V2.2C14 1.61652 13.7682 1.05694 13.3556 0.644365C12.9431 0.231785 12.3835 0 11.8 0H2.2C1.61652 0 1.05694 0.231785 0.644365 0.644365C0.231785 1.05694 0 1.61652 0 2.2V7C0 7.15913 0.063214 7.31174 0.175736 7.42426C0.288258 7.53679 0.44087 7.6 0.6 7.6C0.75913 7.6 0.911742 7.53679 1.02426 7.42426C1.13679 7.31174 1.2 7.15913 1.2 7V2.2C1.2 1.93478 1.30536 1.68043 1.49289 1.49289C1.68043 1.30536 1.93478 1.2 2.2 1.2H11.8C12.0652 1.2 12.3196 1.30536 12.5071 1.49289C12.6946 1.68043 12.8 1.93478 12.8 2.2V11.8C12.8 12.0652 12.6946 12.3196 12.5071 12.5071C12.3196 12.6946 12.0652 12.8 11.8 12.8H7C6.84087 12.8 6.68826 12.8632 6.57574 12.9757C6.46321 13.0883 6.4 13.2409 6.4 13.4C6.4 13.5591 6.46321 13.7117 6.57574 13.8243C6.68826 13.9368 6.84087 14 7 14ZM9.77805 7.42192C9.89013 7.534 10.0415 7.59788 10.2 7.59995C10.3585 7.59788 10.5099 7.534 10.622 7.42192C10.7341 7.30985 10.798 7.15844 10.8 6.99995V3.94242C10.8066 3.90505 10.8096 3.86689 10.8089 3.82843C10.8079 3.77159 10.7988 3.7157 10.7824 3.6623C10.756 3.55552 10.701 3.45698 10.622 3.37798C10.5099 3.2659 10.3585 3.20202 10.2 3.19995H7.00002C6.84089 3.19995 6.68828 3.26317 6.57576 3.37569C6.46324 3.48821 6.40002 3.64082 6.40002 3.79995C6.40002 3.95908 6.46324 4.11169 6.57576 4.22422C6.68828 4.33674 6.84089 4.39995 7.00002 4.39995H8.80006L6.19997 7.00005C6.10158 7.11005 6.04718 7.25246 6.04718 7.40005C6.04718 7.54763 6.10158 7.69004 6.19997 7.80005C6.30202 7.91645 6.44561 7.98824 6.59997 8.00005C6.75432 7.98824 6.89791 7.91645 6.99997 7.80005L9.60002 5.26841V6.99995C9.6021 7.15844 9.66598 7.30985 9.77805 7.42192ZM1.4 14H3.8C4.17066 13.9979 4.52553 13.8498 4.78763 13.5877C5.04973 13.3256 5.1979 12.9707 5.2 12.6V10.2C5.1979 9.82939 5.04973 9.47452 4.78763 9.21242C4.52553 8.95032 4.17066 8.80215 3.8 8.80005H1.4C1.02934 8.80215 0.674468 8.95032 0.412371 9.21242C0.150274 9.47452 0.00210008 9.82939 0 10.2V12.6C0.00210008 12.9707 0.150274 13.3256 0.412371 13.5877C0.674468 13.8498 1.02934 13.9979 1.4 14ZM1.25858 10.0586C1.29609 10.0211 1.34696 10 1.4 10H3.8C3.85304 10 3.90391 10.0211 3.94142 10.0586C3.97893 10.0961 4 10.147 4 10.2V12.6C4 12.6531 3.97893 12.704 3.94142 12.7415C3.90391 12.779 3.85304 12.8 3.8 12.8H1.4C1.34696 12.8 1.29609 12.779 1.25858 12.7415C1.22107 12.704 1.2 12.6531 1.2 12.6V10.2C1.2 10.147 1.22107 10.0961 1.25858 10.0586Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
Go.render = Us;
var Wo = {
  name: "WindowMinimizeIcon",
  extends: Pt
};
function Ns(e) {
  return Ws(e) || Gs(e) || qs(e) || Ks();
}
function Ks() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function qs(e, t) {
  if (e) {
    if (typeof e == "string") return Gn(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Gn(e, t) : void 0;
  }
}
function Gs(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function Ws(e) {
  if (Array.isArray(e)) return Gn(e);
}
function Gn(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, s = Array(t); n < t; n++) s[n] = e[n];
  return s;
}
function Zs(e, t, n, s, i, l) {
  return a(), u("svg", W({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), Ns(t[0] || (t[0] = [r("path", {
    "fill-rule": "evenodd",
    "clip-rule": "evenodd",
    d: "M11.8 0H2.2C1.61652 0 1.05694 0.231785 0.644365 0.644365C0.231785 1.05694 0 1.61652 0 2.2V7C0 7.15913 0.063214 7.31174 0.175736 7.42426C0.288258 7.53679 0.44087 7.6 0.6 7.6C0.75913 7.6 0.911742 7.53679 1.02426 7.42426C1.13679 7.31174 1.2 7.15913 1.2 7V2.2C1.2 1.93478 1.30536 1.68043 1.49289 1.49289C1.68043 1.30536 1.93478 1.2 2.2 1.2H11.8C12.0652 1.2 12.3196 1.30536 12.5071 1.49289C12.6946 1.68043 12.8 1.93478 12.8 2.2V11.8C12.8 12.0652 12.6946 12.3196 12.5071 12.5071C12.3196 12.6946 12.0652 12.8 11.8 12.8H7C6.84087 12.8 6.68826 12.8632 6.57574 12.9757C6.46321 13.0883 6.4 13.2409 6.4 13.4C6.4 13.5591 6.46321 13.7117 6.57574 13.8243C6.68826 13.9368 6.84087 14 7 14H11.8C12.3835 14 12.9431 13.7682 13.3556 13.3556C13.7682 12.9431 14 12.3835 14 11.8V2.2C14 1.61652 13.7682 1.05694 13.3556 0.644365C12.9431 0.231785 12.3835 0 11.8 0ZM6.368 7.952C6.44137 7.98326 6.52025 7.99958 6.6 8H9.8C9.95913 8 10.1117 7.93678 10.2243 7.82426C10.3368 7.71174 10.4 7.55913 10.4 7.4C10.4 7.24087 10.3368 7.08826 10.2243 6.97574C10.1117 6.86321 9.95913 6.8 9.8 6.8H8.048L10.624 4.224C10.73 4.11026 10.7877 3.95982 10.7849 3.80438C10.7822 3.64894 10.7192 3.50063 10.6093 3.3907C10.4994 3.28077 10.3511 3.2178 10.1956 3.21506C10.0402 3.21232 9.88974 3.27002 9.776 3.376L7.2 5.952V4.2C7.2 4.04087 7.13679 3.88826 7.02426 3.77574C6.91174 3.66321 6.75913 3.6 6.6 3.6C6.44087 3.6 6.28826 3.66321 6.17574 3.77574C6.06321 3.88826 6 4.04087 6 4.2V7.4C6.00042 7.47975 6.01674 7.55862 6.048 7.632C6.07656 7.70442 6.11971 7.7702 6.17475 7.82524C6.2298 7.88029 6.29558 7.92344 6.368 7.952ZM1.4 8.80005H3.8C4.17066 8.80215 4.52553 8.95032 4.78763 9.21242C5.04973 9.47452 5.1979 9.82939 5.2 10.2V12.6C5.1979 12.9707 5.04973 13.3256 4.78763 13.5877C4.52553 13.8498 4.17066 13.9979 3.8 14H1.4C1.02934 13.9979 0.674468 13.8498 0.412371 13.5877C0.150274 13.3256 0.00210008 12.9707 0 12.6V10.2C0.00210008 9.82939 0.150274 9.47452 0.412371 9.21242C0.674468 8.95032 1.02934 8.80215 1.4 8.80005ZM3.94142 12.7415C3.97893 12.704 4 12.6531 4 12.6V10.2C4 10.147 3.97893 10.0961 3.94142 10.0586C3.90391 10.0211 3.85304 10 3.8 10H1.4C1.34696 10 1.29609 10.0211 1.25858 10.0586C1.22107 10.0961 1.2 10.147 1.2 10.2V12.6C1.2 12.6531 1.22107 12.704 1.25858 12.7415C1.29609 12.779 1.34696 12.8 1.4 12.8H3.8C3.85304 12.8 3.90391 12.779 3.94142 12.7415Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
Wo.render = Zs;
var Ys = mt.extend({
  name: "focustrap-directive"
}), Xs = ui.extend({
  style: Ys
});
function Sn(e) {
  "@babel/helpers - typeof";
  return Sn = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, Sn(e);
}
function go(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var s = Object.getOwnPropertySymbols(e);
    t && (s = s.filter(function(i) {
      return Object.getOwnPropertyDescriptor(e, i).enumerable;
    })), n.push.apply(n, s);
  }
  return n;
}
function yo(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? go(Object(n), !0).forEach(function(s) {
      Js(e, s, n[s]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : go(Object(n)).forEach(function(s) {
      Object.defineProperty(e, s, Object.getOwnPropertyDescriptor(n, s));
    });
  }
  return e;
}
function Js(e, t, n) {
  return (t = Qs(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Qs(e) {
  var t = ea(e, "string");
  return Sn(t) == "symbol" ? t : t + "";
}
function ea(e, t) {
  if (Sn(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var s = n.call(e, t);
    if (Sn(s) != "object") return s;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var ta = Xs.extend("focustrap", {
  mounted: function(t, n) {
    var s = n.value || {}, i = s.disabled;
    i || (this.createHiddenFocusableElements(t, n), this.bind(t, n), this.autoElementFocus(t, n)), t.setAttribute("data-pd-focustrap", !0), this.$el = t;
  },
  updated: function(t, n) {
    var s = n.value || {}, i = s.disabled;
    i && this.unbind(t);
  },
  unmounted: function(t) {
    this.unbind(t);
  },
  methods: {
    getComputedSelector: function(t) {
      return ':not(.p-hidden-focusable):not([data-p-hidden-focusable="true"])'.concat(t ?? "");
    },
    bind: function(t, n) {
      var s = this, i = n.value || {}, l = i.onFocusIn, p = i.onFocusOut;
      t.$_pfocustrap_mutationobserver = new MutationObserver(function(b) {
        b.forEach(function(v) {
          if (v.type === "childList" && !t.contains(document.activeElement)) {
            var k = function(_) {
              var E = uo(_) ? uo(_, s.getComputedSelector(t.$_pfocustrap_focusableselector)) ? _ : Jt(t, s.getComputedSelector(t.$_pfocustrap_focusableselector)) : Jt(_);
              return zt(E) ? E : _.nextSibling && k(_.nextSibling);
            };
            Le(k(v.nextSibling));
          }
        });
      }), t.$_pfocustrap_mutationobserver.disconnect(), t.$_pfocustrap_mutationobserver.observe(t, {
        childList: !0
      }), t.$_pfocustrap_focusinlistener = function(b) {
        return l && l(b);
      }, t.$_pfocustrap_focusoutlistener = function(b) {
        return p && p(b);
      }, t.addEventListener("focusin", t.$_pfocustrap_focusinlistener), t.addEventListener("focusout", t.$_pfocustrap_focusoutlistener);
    },
    unbind: function(t) {
      t.$_pfocustrap_mutationobserver && t.$_pfocustrap_mutationobserver.disconnect(), t.$_pfocustrap_focusinlistener && t.removeEventListener("focusin", t.$_pfocustrap_focusinlistener) && (t.$_pfocustrap_focusinlistener = null), t.$_pfocustrap_focusoutlistener && t.removeEventListener("focusout", t.$_pfocustrap_focusoutlistener) && (t.$_pfocustrap_focusoutlistener = null);
    },
    autoFocus: function(t) {
      this.autoElementFocus(this.$el, {
        value: yo(yo({}, t), {}, {
          autoFocus: !0
        })
      });
    },
    autoElementFocus: function(t, n) {
      var s = n.value || {}, i = s.autoFocusSelector, l = i === void 0 ? "" : i, p = s.firstFocusableSelector, b = p === void 0 ? "" : p, v = s.autoFocus, k = v === void 0 ? !1 : v, S = Jt(t, "[autofocus]".concat(this.getComputedSelector(l)));
      k && !S && (S = Jt(t, this.getComputedSelector(b))), Le(S);
    },
    onFirstHiddenElementFocus: function(t) {
      var n, s = t.currentTarget, i = t.relatedTarget, l = i === s.$_pfocustrap_lasthiddenfocusableelement || !((n = this.$el) !== null && n !== void 0 && n.contains(i)) ? Jt(s.parentElement, this.getComputedSelector(s.$_pfocustrap_focusableselector)) : s.$_pfocustrap_lasthiddenfocusableelement;
      Le(l);
    },
    onLastHiddenElementFocus: function(t) {
      var n, s = t.currentTarget, i = t.relatedTarget, l = i === s.$_pfocustrap_firsthiddenfocusableelement || !((n = this.$el) !== null && n !== void 0 && n.contains(i)) ? Eo(s.parentElement, this.getComputedSelector(s.$_pfocustrap_focusableselector)) : s.$_pfocustrap_firsthiddenfocusableelement;
      Le(l);
    },
    createHiddenFocusableElements: function(t, n) {
      var s = this, i = n.value || {}, l = i.tabIndex, p = l === void 0 ? 0 : l, b = i.firstFocusableSelector, v = b === void 0 ? "" : b, k = i.lastFocusableSelector, S = k === void 0 ? "" : k, _ = function(N) {
        return di("span", {
          class: "p-hidden-accessible p-hidden-focusable",
          tabIndex: p,
          role: "presentation",
          "aria-hidden": !0,
          "data-p-hidden-accessible": !0,
          "data-p-hidden-focusable": !0,
          onFocus: N?.bind(s)
        });
      }, E = _(this.onFirstHiddenElementFocus), R = _(this.onLastHiddenElementFocus);
      E.$_pfocustrap_lasthiddenfocusableelement = R, E.$_pfocustrap_focusableselector = v, E.setAttribute("data-pc-section", "firstfocusableelement"), R.$_pfocustrap_firsthiddenfocusableelement = E, R.$_pfocustrap_focusableselector = S, R.setAttribute("data-pc-section", "lastfocusableelement"), t.prepend(E), t.append(R);
    }
  }
});
function ko() {
  pi({
    variableName: To("scrollbar.width").name
  });
}
function wo() {
  ci({
    variableName: To("scrollbar.width").name
  });
}
var na = `
    .p-dialog {
        max-height: 90%;
        transform: scale(1);
        border-radius: dt('dialog.border.radius');
        box-shadow: dt('dialog.shadow');
        background: dt('dialog.background');
        border: 1px solid dt('dialog.border.color');
        color: dt('dialog.color');
        will-change: transform;
    }

    .p-dialog-content {
        overflow-y: auto;
        padding: dt('dialog.content.padding');
        flex-grow: 1;
    }

    .p-dialog-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-shrink: 0;
        padding: dt('dialog.header.padding');
    }

    .p-dialog-title {
        font-weight: dt('dialog.title.font.weight');
        font-size: dt('dialog.title.font.size');
    }

    .p-dialog-footer {
        flex-shrink: 0;
        padding: dt('dialog.footer.padding');
        display: flex;
        justify-content: flex-end;
        gap: dt('dialog.footer.gap');
    }

    .p-dialog-header-actions {
        display: flex;
        align-items: center;
        gap: dt('dialog.header.gap');
    }

    .p-dialog-top .p-dialog,
    .p-dialog-bottom .p-dialog,
    .p-dialog-left .p-dialog,
    .p-dialog-right .p-dialog,
    .p-dialog-topleft .p-dialog,
    .p-dialog-topright .p-dialog,
    .p-dialog-bottomleft .p-dialog,
    .p-dialog-bottomright .p-dialog {
        margin: 1rem;
    }

    .p-dialog-maximized {
        width: 100vw !important;
        height: 100vh !important;
        top: 0px !important;
        left: 0px !important;
        max-height: 100%;
        height: 100%;
        border-radius: 0;
    }

    .p-dialog .p-resizable-handle {
        position: absolute;
        font-size: 0.1px;
        display: block;
        cursor: se-resize;
        width: 12px;
        height: 12px;
        right: 1px;
        bottom: 1px;
    }

    .p-dialog-enter-active {
        animation: p-animate-dialog-enter 300ms cubic-bezier(.19,1,.22,1);
    }

    .p-dialog-leave-active {
        animation: p-animate-dialog-leave 300ms cubic-bezier(.19,1,.22,1);
    }

    @keyframes p-animate-dialog-enter {
        from {
            opacity: 0;
            transform: scale(0.93);
        }
    }

    @keyframes p-animate-dialog-leave {
        to {
            opacity: 0;
            transform: scale(0.93);
        }
    }
`, oa = {
  mask: function(t) {
    var n = t.position, s = t.modal;
    return {
      position: "fixed",
      height: "100%",
      width: "100%",
      left: 0,
      top: 0,
      display: "flex",
      justifyContent: n === "left" || n === "topleft" || n === "bottomleft" ? "flex-start" : n === "right" || n === "topright" || n === "bottomright" ? "flex-end" : "center",
      alignItems: n === "top" || n === "topleft" || n === "topright" ? "flex-start" : n === "bottom" || n === "bottomleft" || n === "bottomright" ? "flex-end" : "center",
      pointerEvents: s ? "auto" : "none"
    };
  },
  root: {
    display: "flex",
    flexDirection: "column",
    pointerEvents: "auto"
  }
}, ia = {
  mask: function(t) {
    var n = t.props, s = ["left", "right", "top", "topleft", "topright", "bottom", "bottomleft", "bottomright"], i = s.find(function(l) {
      return l === n.position;
    });
    return ["p-dialog-mask", {
      "p-overlay-mask p-overlay-mask-enter-active": n.modal
    }, i ? "p-dialog-".concat(i) : ""];
  },
  root: function(t) {
    var n = t.props, s = t.instance;
    return ["p-dialog p-component", {
      "p-dialog-maximized": n.maximizable && s.maximized
    }];
  },
  header: "p-dialog-header",
  title: "p-dialog-title",
  headerActions: "p-dialog-header-actions",
  pcMaximizeButton: "p-dialog-maximize-button",
  pcCloseButton: "p-dialog-close-button",
  content: "p-dialog-content",
  footer: "p-dialog-footer"
}, sa = mt.extend({
  name: "dialog",
  style: na,
  classes: ia,
  inlineStyles: oa
}), aa = {
  name: "BaseDialog",
  extends: At,
  props: {
    header: {
      type: null,
      default: null
    },
    footer: {
      type: null,
      default: null
    },
    visible: {
      type: Boolean,
      default: !1
    },
    modal: {
      type: Boolean,
      default: null
    },
    contentStyle: {
      type: null,
      default: null
    },
    contentClass: {
      type: String,
      default: null
    },
    contentProps: {
      type: null,
      default: null
    },
    maximizable: {
      type: Boolean,
      default: !1
    },
    dismissableMask: {
      type: Boolean,
      default: !1
    },
    closable: {
      type: Boolean,
      default: !0
    },
    closeOnEscape: {
      type: Boolean,
      default: !0
    },
    showHeader: {
      type: Boolean,
      default: !0
    },
    blockScroll: {
      type: Boolean,
      default: !1
    },
    baseZIndex: {
      type: Number,
      default: 0
    },
    autoZIndex: {
      type: Boolean,
      default: !0
    },
    position: {
      type: String,
      default: "center"
    },
    breakpoints: {
      type: Object,
      default: null
    },
    draggable: {
      type: Boolean,
      default: !0
    },
    keepInViewport: {
      type: Boolean,
      default: !0
    },
    minX: {
      type: Number,
      default: 0
    },
    minY: {
      type: Number,
      default: 0
    },
    appendTo: {
      type: [String, Object],
      default: "body"
    },
    closeIcon: {
      type: String,
      default: void 0
    },
    maximizeIcon: {
      type: String,
      default: void 0
    },
    minimizeIcon: {
      type: String,
      default: void 0
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
    maximizeButtonProps: {
      type: Object,
      default: function() {
        return {
          severity: "secondary",
          text: !0,
          rounded: !0
        };
      }
    },
    _instance: null
  },
  style: sa,
  provide: function() {
    return {
      $pcDialog: this,
      $parentInstance: this
    };
  }
}, Zo = {
  name: "Dialog",
  extends: aa,
  inheritAttrs: !1,
  emits: ["update:visible", "show", "hide", "after-hide", "maximize", "unmaximize", "dragstart", "dragend"],
  provide: function() {
    var t = this;
    return {
      dialogRef: q(function() {
        return t._instance;
      })
    };
  },
  data: function() {
    return {
      containerVisible: this.visible,
      maximized: !1,
      focusableMax: null,
      focusableClose: null,
      target: null
    };
  },
  documentKeydownListener: null,
  container: null,
  mask: null,
  content: null,
  headerContainer: null,
  footerContainer: null,
  maximizableButton: null,
  closeButton: null,
  styleElement: null,
  dragging: null,
  documentDragListener: null,
  documentDragEndListener: null,
  lastPageX: null,
  lastPageY: null,
  maskMouseDownTarget: null,
  updated: function() {
    this.visible && (this.containerVisible = this.visible);
  },
  beforeUnmount: function() {
    this.unbindDocumentState(), this.unbindGlobalListeners(), this.destroyStyle(), this.mask && this.autoZIndex && Qt.clear(this.mask), this.container = null, this.mask = null;
  },
  mounted: function() {
    this.breakpoints && this.createStyle();
  },
  methods: {
    close: function() {
      this.$emit("update:visible", !1);
    },
    onEnter: function() {
      this.$emit("show"), this.target = document.activeElement, this.enableDocumentSettings(), this.bindGlobalListeners(), this.autoZIndex && Qt.set("modal", this.mask, this.baseZIndex || this.$primevue.config.zIndex.modal);
    },
    onAfterEnter: function() {
      this.focus();
    },
    onBeforeLeave: function() {
      this.modal && !this.isUnstyled && bi(this.mask, "p-overlay-mask-leave-active"), this.dragging && this.documentDragEndListener && this.documentDragEndListener();
    },
    onLeave: function() {
      this.$emit("hide"), Le(this.target), this.target = null, this.focusableClose = null, this.focusableMax = null;
    },
    onAfterLeave: function() {
      this.autoZIndex && Qt.clear(this.mask), this.containerVisible = !1, this.unbindDocumentState(), this.unbindGlobalListeners(), this.$emit("after-hide");
    },
    onMaskMouseDown: function(t) {
      this.maskMouseDownTarget = t.target;
    },
    onMaskMouseUp: function() {
      this.dismissableMask && this.modal && this.mask === this.maskMouseDownTarget && this.close();
    },
    focus: function() {
      var t = function(i) {
        return i && i.querySelector("[autofocus]");
      }, n = this.$slots.footer && t(this.footerContainer);
      n || (n = this.$slots.header && t(this.headerContainer), n || (n = this.$slots.default && t(this.content), n || (this.maximizable ? (this.focusableMax = !0, n = this.maximizableButton) : (this.focusableClose = !0, n = this.closeButton)))), n && Le(n, {
        focusVisible: !0
      });
    },
    maximize: function(t) {
      this.maximized ? (this.maximized = !1, this.$emit("unmaximize", t)) : (this.maximized = !0, this.$emit("maximize", t)), this.modal || (this.maximized ? ko() : wo());
    },
    enableDocumentSettings: function() {
      (this.modal || !this.modal && this.blockScroll || this.maximizable && this.maximized) && ko();
    },
    unbindDocumentState: function() {
      (this.modal || !this.modal && this.blockScroll || this.maximizable && this.maximized) && wo();
    },
    onKeyDown: function(t) {
      t.code === "Escape" && this.closeOnEscape && !t.isComposing && this.close();
    },
    bindDocumentKeyDownListener: function() {
      this.documentKeydownListener || (this.documentKeydownListener = this.onKeyDown.bind(this), window.document.addEventListener("keydown", this.documentKeydownListener));
    },
    unbindDocumentKeyDownListener: function() {
      this.documentKeydownListener && (window.document.removeEventListener("keydown", this.documentKeydownListener), this.documentKeydownListener = null);
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
    maximizableRef: function(t) {
      this.maximizableButton = t ? t.$el : void 0;
    },
    closeButtonRef: function(t) {
      this.closeButton = t ? t.$el : void 0;
    },
    createStyle: function() {
      if (!this.styleElement && !this.isUnstyled) {
        var t;
        this.styleElement = document.createElement("style"), this.styleElement.type = "text/css", hi(this.styleElement, "nonce", (t = this.$primevue) === null || t === void 0 || (t = t.config) === null || t === void 0 || (t = t.csp) === null || t === void 0 ? void 0 : t.nonce), document.head.appendChild(this.styleElement);
        var n = "";
        for (var s in this.breakpoints)
          n += `
                        @media screen and (max-width: `.concat(s, `) {
                            .p-dialog[`).concat(this.$attrSelector, `] {
                                width: `).concat(this.breakpoints[s], ` !important;
                            }
                        }
                    `);
        this.styleElement.innerHTML = n;
      }
    },
    destroyStyle: function() {
      this.styleElement && (document.head.removeChild(this.styleElement), this.styleElement = null);
    },
    initDrag: function(t) {
      t.target.closest("div").getAttribute("data-pc-section") !== "headeractions" && this.draggable && (this.dragging = !0, this.lastPageX = t.pageX, this.lastPageY = t.pageY, this.container.style.margin = "0", document.body.setAttribute("data-p-unselectable-text", "true"), !this.isUnstyled && Do(document.body, {
        "user-select": "none"
      }), this.$emit("dragstart", t));
    },
    bindGlobalListeners: function() {
      this.draggable && (this.bindDocumentDragListener(), this.bindDocumentDragEndListener()), this.closeOnEscape && this.bindDocumentKeyDownListener();
    },
    unbindGlobalListeners: function() {
      this.unbindDocumentDragListener(), this.unbindDocumentDragEndListener(), this.unbindDocumentKeyDownListener();
    },
    bindDocumentDragListener: function() {
      var t = this;
      this.documentDragListener = function(n) {
        if (t.dragging) {
          var s = Vo(t.container), i = fi(t.container), l = n.pageX - t.lastPageX, p = n.pageY - t.lastPageY, b = t.container.getBoundingClientRect(), v = b.left + l, k = b.top + p, S = mi(), _ = getComputedStyle(t.container), E = parseFloat(_.marginLeft), R = parseFloat(_.marginTop);
          t.container.style.position = "fixed", t.keepInViewport ? (v >= t.minX && v + s < S.width && (t.lastPageX = n.pageX, t.container.style.left = v - E + "px"), k >= t.minY && k + i < S.height && (t.lastPageY = n.pageY, t.container.style.top = k - R + "px")) : (t.lastPageX = n.pageX, t.container.style.left = v - E + "px", t.lastPageY = n.pageY, t.container.style.top = k - R + "px");
        }
      }, window.document.addEventListener("mousemove", this.documentDragListener);
    },
    unbindDocumentDragListener: function() {
      this.documentDragListener && (window.document.removeEventListener("mousemove", this.documentDragListener), this.documentDragListener = null);
    },
    bindDocumentDragEndListener: function() {
      var t = this;
      this.documentDragEndListener = function(n) {
        t.dragging && (t.dragging = !1, document.body.removeAttribute("data-p-unselectable-text"), !t.isUnstyled && (document.body.style["user-select"] = ""), t.$emit("dragend", n));
      }, window.document.addEventListener("mouseup", this.documentDragEndListener);
    },
    unbindDocumentDragEndListener: function() {
      this.documentDragEndListener && (window.document.removeEventListener("mouseup", this.documentDragEndListener), this.documentDragEndListener = null);
    }
  },
  computed: {
    maximizeIconComponent: function() {
      return this.maximized ? this.minimizeIcon ? "span" : "WindowMinimizeIcon" : this.maximizeIcon ? "span" : "WindowMaximizeIcon";
    },
    ariaLabelledById: function() {
      return this.header != null || this.$attrs["aria-labelledby"] !== null ? this.$id + "_header" : null;
    },
    closeAriaLabel: function() {
      return this.$primevue.config.locale.aria ? this.$primevue.config.locale.aria.close : void 0;
    },
    dataP: function() {
      return tt({
        maximized: this.maximized,
        modal: this.modal
      });
    }
  },
  directives: {
    ripple: oo,
    focustrap: ta
  },
  components: {
    Button: le,
    Portal: Fo,
    WindowMinimizeIcon: Wo,
    WindowMaximizeIcon: Go,
    TimesIcon: ro
  }
};
function $n(e) {
  "@babel/helpers - typeof";
  return $n = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, $n(e);
}
function So(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var s = Object.getOwnPropertySymbols(e);
    t && (s = s.filter(function(i) {
      return Object.getOwnPropertyDescriptor(e, i).enumerable;
    })), n.push.apply(n, s);
  }
  return n;
}
function $o(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? So(Object(n), !0).forEach(function(s) {
      la(e, s, n[s]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : So(Object(n)).forEach(function(s) {
      Object.defineProperty(e, s, Object.getOwnPropertyDescriptor(n, s));
    });
  }
  return e;
}
function la(e, t, n) {
  return (t = ra(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function ra(e) {
  var t = ua(e, "string");
  return $n(t) == "symbol" ? t : t + "";
}
function ua(e, t) {
  if ($n(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var s = n.call(e, t);
    if ($n(s) != "object") return s;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var da = ["data-p"], ca = ["aria-labelledby", "aria-modal", "data-p"], pa = ["id"], fa = ["data-p"];
function ma(e, t, n, s, i, l) {
  var p = Oe("Button"), b = Oe("Portal"), v = io("focustrap");
  return a(), ce(b, {
    appendTo: e.appendTo
  }, {
    default: ee(function() {
      return [i.containerVisible ? (a(), u("div", W({
        key: 0,
        ref: l.maskRef,
        class: e.cx("mask"),
        style: e.sx("mask", !0, {
          position: e.position,
          modal: e.modal
        }),
        onMousedown: t[1] || (t[1] = function() {
          return l.onMaskMouseDown && l.onMaskMouseDown.apply(l, arguments);
        }),
        onMouseup: t[2] || (t[2] = function() {
          return l.onMaskMouseUp && l.onMaskMouseUp.apply(l, arguments);
        }),
        "data-p": l.dataP
      }, e.ptm("mask")), [m(Ho, W({
        name: "p-dialog",
        onEnter: l.onEnter,
        onAfterEnter: l.onAfterEnter,
        onBeforeLeave: l.onBeforeLeave,
        onLeave: l.onLeave,
        onAfterLeave: l.onAfterLeave,
        appear: ""
      }, e.ptm("transition")), {
        default: ee(function() {
          return [e.visible ? De((a(), u("div", W({
            key: 0,
            ref: l.containerRef,
            class: e.cx("root"),
            style: e.sx("root"),
            role: "dialog",
            "aria-labelledby": l.ariaLabelledById,
            "aria-modal": e.modal,
            "data-p": l.dataP
          }, e.ptmi("root")), [e.$slots.container ? ie(e.$slots, "container", {
            key: 0,
            closeCallback: l.close,
            maximizeCallback: function(S) {
              return l.maximize(S);
            },
            initDragCallback: l.initDrag
          }) : (a(), u(X, {
            key: 1
          }, [e.showHeader ? (a(), u("div", W({
            key: 0,
            ref: l.headerContainerRef,
            class: e.cx("header"),
            onMousedown: t[0] || (t[0] = function() {
              return l.initDrag && l.initDrag.apply(l, arguments);
            })
          }, e.ptm("header")), [ie(e.$slots, "header", {
            class: ne(e.cx("title"))
          }, function() {
            return [e.header ? (a(), u("span", W({
              key: 0,
              id: l.ariaLabelledById,
              class: e.cx("title")
            }, e.ptm("title")), c(e.header), 17, pa)) : h("", !0)];
          }), r("div", W({
            class: e.cx("headerActions")
          }, e.ptm("headerActions")), [e.maximizable ? ie(e.$slots, "maximizebutton", {
            key: 0,
            maximized: i.maximized,
            maximizeCallback: function(S) {
              return l.maximize(S);
            }
          }, function() {
            return [m(p, W({
              ref: l.maximizableRef,
              autofocus: i.focusableMax,
              class: e.cx("pcMaximizeButton"),
              onClick: l.maximize,
              tabindex: e.maximizable ? "0" : "-1",
              unstyled: e.unstyled
            }, e.maximizeButtonProps, {
              pt: e.ptm("pcMaximizeButton"),
              "data-pc-group-section": "headericon"
            }), {
              icon: ee(function(k) {
                return [ie(e.$slots, "maximizeicon", {
                  maximized: i.maximized
                }, function() {
                  return [(a(), ce(hn(l.maximizeIconComponent), W({
                    class: [k.class, i.maximized ? e.minimizeIcon : e.maximizeIcon]
                  }, e.ptm("pcMaximizeButton").icon), null, 16, ["class"]))];
                })];
              }),
              _: 3
            }, 16, ["autofocus", "class", "onClick", "tabindex", "unstyled", "pt"])];
          }) : h("", !0), e.closable ? ie(e.$slots, "closebutton", {
            key: 1,
            closeCallback: l.close
          }, function() {
            return [m(p, W({
              ref: l.closeButtonRef,
              autofocus: i.focusableClose,
              class: e.cx("pcCloseButton"),
              onClick: l.close,
              "aria-label": l.closeAriaLabel,
              unstyled: e.unstyled
            }, e.closeButtonProps, {
              pt: e.ptm("pcCloseButton"),
              "data-pc-group-section": "headericon"
            }), {
              icon: ee(function(k) {
                return [ie(e.$slots, "closeicon", {}, function() {
                  return [(a(), ce(hn(e.closeIcon ? "span" : "TimesIcon"), W({
                    class: [e.closeIcon, k.class]
                  }, e.ptm("pcCloseButton").icon), null, 16, ["class"]))];
                })];
              }),
              _: 3
            }, 16, ["autofocus", "class", "onClick", "aria-label", "unstyled", "pt"])];
          }) : h("", !0)], 16)], 16)) : h("", !0), r("div", W({
            ref: l.contentRef,
            class: [e.cx("content"), e.contentClass],
            style: e.contentStyle,
            "data-p": l.dataP
          }, $o($o({}, e.contentProps), e.ptm("content"))), [ie(e.$slots, "default")], 16, fa), e.footer || e.$slots.footer ? (a(), u("div", W({
            key: 1,
            ref: l.footerContainerRef,
            class: e.cx("footer")
          }, e.ptm("footer")), [ie(e.$slots, "footer", {}, function() {
            return [M(c(e.footer), 1)];
          })], 16)) : h("", !0)], 64))], 16, ca)), [[v, {
            disabled: !e.modal
          }]]) : h("", !0)];
        }),
        _: 3
      }, 16, ["onEnter", "onAfterEnter", "onBeforeLeave", "onLeave", "onAfterLeave"])], 16, da)) : h("", !0)];
    }),
    _: 3
  }, 8, ["appendTo"]);
}
Zo.render = ma;
var Yo = {
  name: "BlankIcon",
  extends: Pt
};
function ha(e) {
  return ya(e) || ga(e) || va(e) || ba();
}
function ba() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function va(e, t) {
  if (e) {
    if (typeof e == "string") return Wn(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Wn(e, t) : void 0;
  }
}
function ga(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function ya(e) {
  if (Array.isArray(e)) return Wn(e);
}
function Wn(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, s = Array(t); n < t; n++) s[n] = e[n];
  return s;
}
function ka(e, t, n, s, i, l) {
  return a(), u("svg", W({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), ha(t[0] || (t[0] = [r("rect", {
    width: "1",
    height: "1",
    fill: "currentColor",
    "fill-opacity": "0"
  }, null, -1)])), 16);
}
Yo.render = ka;
var Xo = {
  name: "CheckIcon",
  extends: Pt
};
function wa(e) {
  return Ia(e) || Ca(e) || $a(e) || Sa();
}
function Sa() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function $a(e, t) {
  if (e) {
    if (typeof e == "string") return Zn(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Zn(e, t) : void 0;
  }
}
function Ca(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function Ia(e) {
  if (Array.isArray(e)) return Zn(e);
}
function Zn(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, s = Array(t); n < t; n++) s[n] = e[n];
  return s;
}
function _a(e, t, n, s, i, l) {
  return a(), u("svg", W({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), wa(t[0] || (t[0] = [r("path", {
    d: "M4.86199 11.5948C4.78717 11.5923 4.71366 11.5745 4.64596 11.5426C4.57826 11.5107 4.51779 11.4652 4.46827 11.4091L0.753985 7.69483C0.683167 7.64891 0.623706 7.58751 0.580092 7.51525C0.536478 7.44299 0.509851 7.36177 0.502221 7.27771C0.49459 7.19366 0.506156 7.10897 0.536046 7.03004C0.565935 6.95111 0.613367 6.88 0.674759 6.82208C0.736151 6.76416 0.8099 6.72095 0.890436 6.69571C0.970973 6.67046 1.05619 6.66385 1.13966 6.67635C1.22313 6.68886 1.30266 6.72017 1.37226 6.76792C1.44186 6.81567 1.4997 6.8786 1.54141 6.95197L4.86199 10.2503L12.6397 2.49483C12.7444 2.42694 12.8689 2.39617 12.9932 2.40745C13.1174 2.41873 13.2343 2.47141 13.3251 2.55705C13.4159 2.64268 13.4753 2.75632 13.4938 2.87973C13.5123 3.00315 13.4888 3.1292 13.4271 3.23768L5.2557 11.4091C5.20618 11.4652 5.14571 11.5107 5.07801 11.5426C5.01031 11.5745 4.9368 11.5923 4.86199 11.5948Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
Xo.render = _a;
var Jo = {
  name: "ChevronDownIcon",
  extends: Pt
};
function xa(e) {
  return Aa(e) || za(e) || La(e) || Oa();
}
function Oa() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function La(e, t) {
  if (e) {
    if (typeof e == "string") return Yn(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Yn(e, t) : void 0;
  }
}
function za(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function Aa(e) {
  if (Array.isArray(e)) return Yn(e);
}
function Yn(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, s = Array(t); n < t; n++) s[n] = e[n];
  return s;
}
function Pa(e, t, n, s, i, l) {
  return a(), u("svg", W({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), xa(t[0] || (t[0] = [r("path", {
    d: "M7.01744 10.398C6.91269 10.3985 6.8089 10.378 6.71215 10.3379C6.61541 10.2977 6.52766 10.2386 6.45405 10.1641L1.13907 4.84913C1.03306 4.69404 0.985221 4.5065 1.00399 4.31958C1.02276 4.13266 1.10693 3.95838 1.24166 3.82747C1.37639 3.69655 1.55301 3.61742 1.74039 3.60402C1.92777 3.59062 2.11386 3.64382 2.26584 3.75424L7.01744 8.47394L11.769 3.75424C11.9189 3.65709 12.097 3.61306 12.2748 3.62921C12.4527 3.64535 12.6199 3.72073 12.7498 3.84328C12.8797 3.96582 12.9647 4.12842 12.9912 4.30502C13.0177 4.48162 12.9841 4.662 12.8958 4.81724L7.58083 10.1322C7.50996 10.2125 7.42344 10.2775 7.32656 10.3232C7.22968 10.3689 7.12449 10.3944 7.01744 10.398Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
Jo.render = Pa;
var Qo = {
  name: "SearchIcon",
  extends: Pt
};
function Ma(e) {
  return Va(e) || Fa(e) || Ta(e) || Ea();
}
function Ea() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Ta(e, t) {
  if (e) {
    if (typeof e == "string") return Xn(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Xn(e, t) : void 0;
  }
}
function Fa(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function Va(e) {
  if (Array.isArray(e)) return Xn(e);
}
function Xn(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, s = Array(t); n < t; n++) s[n] = e[n];
  return s;
}
function Da(e, t, n, s, i, l) {
  return a(), u("svg", W({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), Ma(t[0] || (t[0] = [r("path", {
    "fill-rule": "evenodd",
    "clip-rule": "evenodd",
    d: "M2.67602 11.0265C3.6661 11.688 4.83011 12.0411 6.02086 12.0411C6.81149 12.0411 7.59438 11.8854 8.32483 11.5828C8.87005 11.357 9.37808 11.0526 9.83317 10.6803L12.9769 13.8241C13.0323 13.8801 13.0983 13.9245 13.171 13.9548C13.2438 13.985 13.3219 14.0003 13.4007 14C13.4795 14.0003 13.5575 13.985 13.6303 13.9548C13.7031 13.9245 13.7691 13.8801 13.8244 13.8241C13.9367 13.7116 13.9998 13.5592 13.9998 13.4003C13.9998 13.2414 13.9367 13.089 13.8244 12.9765L10.6807 9.8328C11.053 9.37773 11.3573 8.86972 11.5831 8.32452C11.8857 7.59408 12.0414 6.81119 12.0414 6.02056C12.0414 4.8298 11.6883 3.66579 11.0268 2.67572C10.3652 1.68564 9.42494 0.913972 8.32483 0.45829C7.22472 0.00260857 6.01418 -0.116618 4.84631 0.115686C3.67844 0.34799 2.60568 0.921393 1.76369 1.76338C0.921698 2.60537 0.348296 3.67813 0.115991 4.84601C-0.116313 6.01388 0.00291375 7.22441 0.458595 8.32452C0.914277 9.42464 1.68595 10.3649 2.67602 11.0265ZM3.35565 2.0158C4.14456 1.48867 5.07206 1.20731 6.02086 1.20731C7.29317 1.20731 8.51338 1.71274 9.41304 2.6124C10.3127 3.51206 10.8181 4.73226 10.8181 6.00457C10.8181 6.95337 10.5368 7.88088 10.0096 8.66978C9.48251 9.45868 8.73328 10.0736 7.85669 10.4367C6.98011 10.7997 6.01554 10.8947 5.08496 10.7096C4.15439 10.5245 3.2996 10.0676 2.62869 9.39674C1.95778 8.72583 1.50089 7.87104 1.31579 6.94046C1.13068 6.00989 1.22568 5.04532 1.58878 4.16874C1.95187 3.29215 2.56675 2.54292 3.35565 2.0158Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
Qo.render = Da;
var Ba = `
    .p-iconfield {
        position: relative;
        display: block;
    }

    .p-inputicon {
        position: absolute;
        top: 50%;
        margin-top: calc(-1 * (dt('icon.size') / 2));
        color: dt('iconfield.icon.color');
        line-height: 1;
        z-index: 1;
    }

    .p-iconfield .p-inputicon:first-child {
        inset-inline-start: dt('form.field.padding.x');
    }

    .p-iconfield .p-inputicon:last-child {
        inset-inline-end: dt('form.field.padding.x');
    }

    .p-iconfield .p-inputtext:not(:first-child),
    .p-iconfield .p-inputwrapper:not(:first-child) .p-inputtext {
        padding-inline-start: calc((dt('form.field.padding.x') * 2) + dt('icon.size'));
    }

    .p-iconfield .p-inputtext:not(:last-child) {
        padding-inline-end: calc((dt('form.field.padding.x') * 2) + dt('icon.size'));
    }

    .p-iconfield:has(.p-inputfield-sm) .p-inputicon {
        font-size: dt('form.field.sm.font.size');
        width: dt('form.field.sm.font.size');
        height: dt('form.field.sm.font.size');
        margin-top: calc(-1 * (dt('form.field.sm.font.size') / 2));
    }

    .p-iconfield:has(.p-inputfield-lg) .p-inputicon {
        font-size: dt('form.field.lg.font.size');
        width: dt('form.field.lg.font.size');
        height: dt('form.field.lg.font.size');
        margin-top: calc(-1 * (dt('form.field.lg.font.size') / 2));
    }
`, Ra = {
  root: "p-iconfield"
}, ja = mt.extend({
  name: "iconfield",
  style: Ba,
  classes: Ra
}), Ha = {
  name: "BaseIconField",
  extends: At,
  style: ja,
  provide: function() {
    return {
      $pcIconField: this,
      $parentInstance: this
    };
  }
}, ei = {
  name: "IconField",
  extends: Ha,
  inheritAttrs: !1
};
function Ua(e, t, n, s, i, l) {
  return a(), u("div", W({
    class: e.cx("root")
  }, e.ptmi("root")), [ie(e.$slots, "default")], 16);
}
ei.render = Ua;
var Na = {
  root: "p-inputicon"
}, Ka = mt.extend({
  name: "inputicon",
  classes: Na
}), qa = {
  name: "BaseInputIcon",
  extends: At,
  style: Ka,
  props: {
    class: null
  },
  provide: function() {
    return {
      $pcInputIcon: this,
      $parentInstance: this
    };
  }
}, ti = {
  name: "InputIcon",
  extends: qa,
  inheritAttrs: !1,
  computed: {
    containerClass: function() {
      return [this.cx("root"), this.class];
    }
  }
};
function Ga(e, t, n, s, i, l) {
  return a(), u("span", W({
    class: l.containerClass
  }, e.ptmi("root"), {
    "aria-hidden": "true"
  }), [ie(e.$slots, "default")], 16);
}
ti.render = Ga;
var Wa = {
  name: "BaseEditableHolder",
  extends: At,
  emits: ["update:modelValue", "value-change"],
  props: {
    modelValue: {
      type: null,
      default: void 0
    },
    defaultValue: {
      type: null,
      default: void 0
    },
    name: {
      type: String,
      default: void 0
    },
    invalid: {
      type: Boolean,
      default: void 0
    },
    disabled: {
      type: Boolean,
      default: !1
    },
    formControl: {
      type: Object,
      default: void 0
    }
  },
  inject: {
    $parentInstance: {
      default: void 0
    },
    $pcForm: {
      default: void 0
    },
    $pcFormField: {
      default: void 0
    }
  },
  data: function() {
    return {
      d_value: this.defaultValue !== void 0 ? this.defaultValue : this.modelValue
    };
  },
  watch: {
    modelValue: {
      deep: !0,
      handler: function(t) {
        this.d_value = t;
      }
    },
    defaultValue: function(t) {
      this.d_value = t;
    },
    $formName: {
      immediate: !0,
      handler: function(t) {
        var n, s;
        this.formField = ((n = this.$pcForm) === null || n === void 0 || (s = n.register) === null || s === void 0 ? void 0 : s.call(n, t, this.$formControl)) || {};
      }
    },
    $formControl: {
      immediate: !0,
      handler: function(t) {
        var n, s;
        this.formField = ((n = this.$pcForm) === null || n === void 0 || (s = n.register) === null || s === void 0 ? void 0 : s.call(n, this.$formName, t)) || {};
      }
    },
    $formDefaultValue: {
      immediate: !0,
      handler: function(t) {
        this.d_value !== t && (this.d_value = t);
      }
    },
    $formValue: {
      immediate: !1,
      handler: function(t) {
        var n;
        (n = this.$pcForm) !== null && n !== void 0 && n.getFieldState(this.$formName) && t !== this.d_value && (this.d_value = t);
      }
    }
  },
  formField: {},
  methods: {
    writeValue: function(t, n) {
      var s, i;
      this.controlled && (this.d_value = t, this.$emit("update:modelValue", t)), this.$emit("value-change", t), (s = (i = this.formField).onChange) === null || s === void 0 || s.call(i, {
        originalEvent: n,
        value: t
      });
    },
    // @todo move to @primeuix/utils
    findNonEmpty: function() {
      for (var t = arguments.length, n = new Array(t), s = 0; s < t; s++)
        n[s] = arguments[s];
      return n.find(zt);
    }
  },
  computed: {
    $filled: function() {
      return zt(this.d_value);
    },
    $invalid: function() {
      var t, n;
      return !this.$formNovalidate && this.findNonEmpty(this.invalid, (t = this.$pcFormField) === null || t === void 0 || (t = t.$field) === null || t === void 0 ? void 0 : t.invalid, (n = this.$pcForm) === null || n === void 0 || (n = n.getFieldState(this.$formName)) === null || n === void 0 ? void 0 : n.invalid);
    },
    $formName: function() {
      var t;
      return this.$formNovalidate ? void 0 : this.name || ((t = this.$formControl) === null || t === void 0 ? void 0 : t.name);
    },
    $formControl: function() {
      var t;
      return this.formControl || ((t = this.$pcFormField) === null || t === void 0 ? void 0 : t.formControl);
    },
    $formNovalidate: function() {
      var t;
      return (t = this.$formControl) === null || t === void 0 ? void 0 : t.novalidate;
    },
    $formDefaultValue: function() {
      var t, n;
      return this.findNonEmpty(this.d_value, (t = this.$pcFormField) === null || t === void 0 ? void 0 : t.initialValue, (n = this.$pcForm) === null || n === void 0 || (n = n.initialValues) === null || n === void 0 ? void 0 : n[this.$formName]);
    },
    $formValue: function() {
      var t, n;
      return this.findNonEmpty((t = this.$pcFormField) === null || t === void 0 || (t = t.$field) === null || t === void 0 ? void 0 : t.value, (n = this.$pcForm) === null || n === void 0 || (n = n.getFieldState(this.$formName)) === null || n === void 0 ? void 0 : n.value);
    },
    controlled: function() {
      return this.$inProps.hasOwnProperty("modelValue") || !this.$inProps.hasOwnProperty("modelValue") && !this.$inProps.hasOwnProperty("defaultValue");
    },
    // @deprecated use $filled instead
    filled: function() {
      return this.$filled;
    }
  }
}, ni = {
  name: "BaseInput",
  extends: Wa,
  props: {
    size: {
      type: String,
      default: null
    },
    fluid: {
      type: Boolean,
      default: null
    },
    variant: {
      type: String,
      default: null
    }
  },
  inject: {
    $parentInstance: {
      default: void 0
    },
    $pcFluid: {
      default: void 0
    }
  },
  computed: {
    $variant: function() {
      var t;
      return (t = this.variant) !== null && t !== void 0 ? t : this.$primevue.config.inputStyle || this.$primevue.config.inputVariant;
    },
    $fluid: function() {
      var t;
      return (t = this.fluid) !== null && t !== void 0 ? t : !!this.$pcFluid;
    },
    // @deprecated use $fluid instead
    hasFluid: function() {
      return this.$fluid;
    }
  }
}, Za = `
    .p-inputtext {
        font-family: inherit;
        font-feature-settings: inherit;
        font-size: 1rem;
        color: dt('inputtext.color');
        background: dt('inputtext.background');
        padding-block: dt('inputtext.padding.y');
        padding-inline: dt('inputtext.padding.x');
        border: 1px solid dt('inputtext.border.color');
        transition:
            background dt('inputtext.transition.duration'),
            color dt('inputtext.transition.duration'),
            border-color dt('inputtext.transition.duration'),
            outline-color dt('inputtext.transition.duration'),
            box-shadow dt('inputtext.transition.duration');
        appearance: none;
        border-radius: dt('inputtext.border.radius');
        outline-color: transparent;
        box-shadow: dt('inputtext.shadow');
    }

    .p-inputtext:enabled:hover {
        border-color: dt('inputtext.hover.border.color');
    }

    .p-inputtext:enabled:focus {
        border-color: dt('inputtext.focus.border.color');
        box-shadow: dt('inputtext.focus.ring.shadow');
        outline: dt('inputtext.focus.ring.width') dt('inputtext.focus.ring.style') dt('inputtext.focus.ring.color');
        outline-offset: dt('inputtext.focus.ring.offset');
    }

    .p-inputtext.p-invalid {
        border-color: dt('inputtext.invalid.border.color');
    }

    .p-inputtext.p-variant-filled {
        background: dt('inputtext.filled.background');
    }

    .p-inputtext.p-variant-filled:enabled:hover {
        background: dt('inputtext.filled.hover.background');
    }

    .p-inputtext.p-variant-filled:enabled:focus {
        background: dt('inputtext.filled.focus.background');
    }

    .p-inputtext:disabled {
        opacity: 1;
        background: dt('inputtext.disabled.background');
        color: dt('inputtext.disabled.color');
    }

    .p-inputtext::placeholder {
        color: dt('inputtext.placeholder.color');
    }

    .p-inputtext.p-invalid::placeholder {
        color: dt('inputtext.invalid.placeholder.color');
    }

    .p-inputtext-sm {
        font-size: dt('inputtext.sm.font.size');
        padding-block: dt('inputtext.sm.padding.y');
        padding-inline: dt('inputtext.sm.padding.x');
    }

    .p-inputtext-lg {
        font-size: dt('inputtext.lg.font.size');
        padding-block: dt('inputtext.lg.padding.y');
        padding-inline: dt('inputtext.lg.padding.x');
    }

    .p-inputtext-fluid {
        width: 100%;
    }
`, Ya = {
  root: function(t) {
    var n = t.instance, s = t.props;
    return ["p-inputtext p-component", {
      "p-filled": n.$filled,
      "p-inputtext-sm p-inputfield-sm": s.size === "small",
      "p-inputtext-lg p-inputfield-lg": s.size === "large",
      "p-invalid": n.$invalid,
      "p-variant-filled": n.$variant === "filled",
      "p-inputtext-fluid": n.$fluid
    }];
  }
}, Xa = mt.extend({
  name: "inputtext",
  style: Za,
  classes: Ya
}), Ja = {
  name: "BaseInputText",
  extends: ni,
  style: Xa,
  provide: function() {
    return {
      $pcInputText: this,
      $parentInstance: this
    };
  }
};
function Cn(e) {
  "@babel/helpers - typeof";
  return Cn = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, Cn(e);
}
function Qa(e, t, n) {
  return (t = el(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function el(e) {
  var t = tl(e, "string");
  return Cn(t) == "symbol" ? t : t + "";
}
function tl(e, t) {
  if (Cn(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var s = n.call(e, t);
    if (Cn(s) != "object") return s;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var oi = {
  name: "InputText",
  extends: Ja,
  inheritAttrs: !1,
  methods: {
    onInput: function(t) {
      this.writeValue(t.target.value, t);
    }
  },
  computed: {
    attrs: function() {
      return W(this.ptmi("root", {
        context: {
          filled: this.$filled,
          disabled: this.disabled
        }
      }), this.formField);
    },
    dataP: function() {
      return tt(Qa({
        invalid: this.$invalid,
        fluid: this.$fluid,
        filled: this.$variant === "filled"
      }, this.size, this.size));
    }
  }
}, nl = ["value", "name", "disabled", "aria-invalid", "data-p"];
function ol(e, t, n, s, i, l) {
  return a(), u("input", W({
    type: "text",
    class: e.cx("root"),
    value: e.d_value,
    name: e.name,
    disabled: e.disabled,
    "aria-invalid": e.$invalid || void 0,
    "data-p": l.dataP,
    onInput: t[0] || (t[0] = function() {
      return l.onInput && l.onInput.apply(l, arguments);
    })
  }, l.attrs), null, 16, nl);
}
oi.render = ol;
var il = `
    .p-virtualscroller-loader {
        background: dt('virtualscroller.loader.mask.background');
        color: dt('virtualscroller.loader.mask.color');
    }

    .p-virtualscroller-loading-icon {
        font-size: dt('virtualscroller.loader.icon.size');
        width: dt('virtualscroller.loader.icon.size');
        height: dt('virtualscroller.loader.icon.size');
    }
`, sl = `
.p-virtualscroller {
    position: relative;
    overflow: auto;
    contain: strict;
    transform: translateZ(0);
    will-change: scroll-position;
    outline: 0 none;
}

.p-virtualscroller-content {
    position: absolute;
    top: 0;
    left: 0;
    min-height: 100%;
    min-width: 100%;
    will-change: transform;
}

.p-virtualscroller-spacer {
    position: absolute;
    top: 0;
    left: 0;
    height: 1px;
    width: 1px;
    transform-origin: 0 0;
    pointer-events: none;
}

.p-virtualscroller-loader {
    position: sticky;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
}

.p-virtualscroller-loader-mask {
    display: flex;
    align-items: center;
    justify-content: center;
}

.p-virtualscroller-horizontal > .p-virtualscroller-content {
    display: flex;
}

.p-virtualscroller-inline .p-virtualscroller-content {
    position: static;
}

.p-virtualscroller .p-virtualscroller-loading {
    transform: none !important;
    min-height: 0;
    position: sticky;
    inset-block-start: 0;
    inset-inline-start: 0;
}
`, Co = mt.extend({
  name: "virtualscroller",
  css: sl,
  style: il
}), al = {
  name: "BaseVirtualScroller",
  extends: At,
  props: {
    id: {
      type: String,
      default: null
    },
    style: null,
    class: null,
    items: {
      type: Array,
      default: null
    },
    itemSize: {
      type: [Number, Array],
      default: 0
    },
    scrollHeight: null,
    scrollWidth: null,
    orientation: {
      type: String,
      default: "vertical"
    },
    numToleratedItems: {
      type: Number,
      default: null
    },
    delay: {
      type: Number,
      default: 0
    },
    resizeDelay: {
      type: Number,
      default: 10
    },
    lazy: {
      type: Boolean,
      default: !1
    },
    disabled: {
      type: Boolean,
      default: !1
    },
    loaderDisabled: {
      type: Boolean,
      default: !1
    },
    columns: {
      type: Array,
      default: null
    },
    loading: {
      type: Boolean,
      default: !1
    },
    showSpacer: {
      type: Boolean,
      default: !0
    },
    showLoader: {
      type: Boolean,
      default: !1
    },
    tabindex: {
      type: Number,
      default: 0
    },
    inline: {
      type: Boolean,
      default: !1
    },
    step: {
      type: Number,
      default: 0
    },
    appendOnly: {
      type: Boolean,
      default: !1
    },
    autoSize: {
      type: Boolean,
      default: !1
    }
  },
  style: Co,
  provide: function() {
    return {
      $pcVirtualScroller: this,
      $parentInstance: this
    };
  },
  beforeMount: function() {
    var t;
    Co.loadCSS({
      nonce: (t = this.$primevueConfig) === null || t === void 0 || (t = t.csp) === null || t === void 0 ? void 0 : t.nonce
    });
  }
};
function In(e) {
  "@babel/helpers - typeof";
  return In = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, In(e);
}
function Io(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var s = Object.getOwnPropertySymbols(e);
    t && (s = s.filter(function(i) {
      return Object.getOwnPropertyDescriptor(e, i).enumerable;
    })), n.push.apply(n, s);
  }
  return n;
}
function un(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? Io(Object(n), !0).forEach(function(s) {
      ii(e, s, n[s]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Io(Object(n)).forEach(function(s) {
      Object.defineProperty(e, s, Object.getOwnPropertyDescriptor(n, s));
    });
  }
  return e;
}
function ii(e, t, n) {
  return (t = ll(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function ll(e) {
  var t = rl(e, "string");
  return In(t) == "symbol" ? t : t + "";
}
function rl(e, t) {
  if (In(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var s = n.call(e, t);
    if (In(s) != "object") return s;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var si = {
  name: "VirtualScroller",
  extends: al,
  inheritAttrs: !1,
  emits: ["update:numToleratedItems", "scroll", "scroll-index-change", "lazy-load"],
  data: function() {
    var t = this.isBoth();
    return {
      first: t ? {
        rows: 0,
        cols: 0
      } : 0,
      last: t ? {
        rows: 0,
        cols: 0
      } : 0,
      page: t ? {
        rows: 0,
        cols: 0
      } : 0,
      numItemsInViewport: t ? {
        rows: 0,
        cols: 0
      } : 0,
      lastScrollPos: t ? {
        top: 0,
        left: 0
      } : 0,
      d_numToleratedItems: this.numToleratedItems,
      d_loading: this.loading,
      loaderArr: [],
      spacerStyle: {},
      contentStyle: {}
    };
  },
  element: null,
  content: null,
  lastScrollPos: null,
  scrollTimeout: null,
  resizeTimeout: null,
  defaultWidth: 0,
  defaultHeight: 0,
  defaultContentWidth: 0,
  defaultContentHeight: 0,
  isRangeChanged: !1,
  lazyLoadState: {},
  resizeListener: null,
  resizeObserver: null,
  initialized: !1,
  watch: {
    numToleratedItems: function(t) {
      this.d_numToleratedItems = t;
    },
    loading: function(t, n) {
      this.lazy && t !== n && t !== this.d_loading && (this.d_loading = t);
    },
    items: {
      handler: function(t, n) {
        (!n || n.length !== (t || []).length) && (this.init(), this.calculateAutoSize());
      },
      deep: !0
    },
    itemSize: function() {
      this.init(), this.calculateAutoSize();
    },
    orientation: function() {
      this.lastScrollPos = this.isBoth() ? {
        top: 0,
        left: 0
      } : 0;
    },
    scrollHeight: function() {
      this.init(), this.calculateAutoSize();
    },
    scrollWidth: function() {
      this.init(), this.calculateAutoSize();
    }
  },
  mounted: function() {
    this.viewInit(), this.lastScrollPos = this.isBoth() ? {
      top: 0,
      left: 0
    } : 0, this.lazyLoadState = this.lazyLoadState || {};
  },
  updated: function() {
    !this.initialized && this.viewInit();
  },
  unmounted: function() {
    this.unbindResizeListener(), this.initialized = !1;
  },
  methods: {
    viewInit: function() {
      Pn(this.element) && (this.setContentEl(this.content), this.init(), this.calculateAutoSize(), this.defaultWidth = an(this.element), this.defaultHeight = ln(this.element), this.defaultContentWidth = an(this.content), this.defaultContentHeight = ln(this.content), this.initialized = !0), this.element && this.bindResizeListener();
    },
    init: function() {
      this.disabled || (this.setSize(), this.calculateOptions(), this.setSpacerSize());
    },
    isVertical: function() {
      return this.orientation === "vertical";
    },
    isHorizontal: function() {
      return this.orientation === "horizontal";
    },
    isBoth: function() {
      return this.orientation === "both";
    },
    scrollTo: function(t) {
      this.element && this.element.scrollTo(t);
    },
    scrollToIndex: function(t) {
      var n = this, s = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "auto", i = this.isBoth(), l = this.isHorizontal(), p = i ? t.every(function(f) {
        return f > -1;
      }) : t > -1;
      if (p) {
        var b = this.first, v = this.element, k = v.scrollTop, S = k === void 0 ? 0 : k, _ = v.scrollLeft, E = _ === void 0 ? 0 : _, R = this.calculateNumItems(), T = R.numToleratedItems, N = this.getContentPosition(), z = this.itemSize, K = function() {
          var w = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0, A = arguments.length > 1 ? arguments[1] : void 0;
          return w <= A ? 0 : w;
        }, H = function(w, A, re) {
          return w * A + re;
        }, P = function() {
          var w = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0, A = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0;
          return n.scrollTo({
            left: w,
            top: A,
            behavior: s
          });
        }, B = i ? {
          rows: 0,
          cols: 0
        } : 0, d = !1, Q = !1;
        i ? (B = {
          rows: K(t[0], T[0]),
          cols: K(t[1], T[1])
        }, P(H(B.cols, z[1], N.left), H(B.rows, z[0], N.top)), Q = this.lastScrollPos.top !== S || this.lastScrollPos.left !== E, d = B.rows !== b.rows || B.cols !== b.cols) : (B = K(t, T), l ? P(H(B, z, N.left), S) : P(E, H(B, z, N.top)), Q = this.lastScrollPos !== (l ? E : S), d = B !== b), this.isRangeChanged = d, Q && (this.first = B);
      }
    },
    scrollInView: function(t, n) {
      var s = this, i = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : "auto";
      if (n) {
        var l = this.isBoth(), p = this.isHorizontal(), b = l ? t.every(function(z) {
          return z > -1;
        }) : t > -1;
        if (b) {
          var v = this.getRenderedRange(), k = v.first, S = v.viewport, _ = function() {
            var K = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0, H = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0;
            return s.scrollTo({
              left: K,
              top: H,
              behavior: i
            });
          }, E = n === "to-start", R = n === "to-end";
          if (E) {
            if (l)
              S.first.rows - k.rows > t[0] ? _(S.first.cols * this.itemSize[1], (S.first.rows - 1) * this.itemSize[0]) : S.first.cols - k.cols > t[1] && _((S.first.cols - 1) * this.itemSize[1], S.first.rows * this.itemSize[0]);
            else if (S.first - k > t) {
              var T = (S.first - 1) * this.itemSize;
              p ? _(T, 0) : _(0, T);
            }
          } else if (R) {
            if (l)
              S.last.rows - k.rows <= t[0] + 1 ? _(S.first.cols * this.itemSize[1], (S.first.rows + 1) * this.itemSize[0]) : S.last.cols - k.cols <= t[1] + 1 && _((S.first.cols + 1) * this.itemSize[1], S.first.rows * this.itemSize[0]);
            else if (S.last - k <= t + 1) {
              var N = (S.first + 1) * this.itemSize;
              p ? _(N, 0) : _(0, N);
            }
          }
        }
      } else
        this.scrollToIndex(t, i);
    },
    getRenderedRange: function() {
      var t = function(_, E) {
        return Math.floor(_ / (E || _));
      }, n = this.first, s = 0;
      if (this.element) {
        var i = this.isBoth(), l = this.isHorizontal(), p = this.element, b = p.scrollTop, v = p.scrollLeft;
        if (i)
          n = {
            rows: t(b, this.itemSize[0]),
            cols: t(v, this.itemSize[1])
          }, s = {
            rows: n.rows + this.numItemsInViewport.rows,
            cols: n.cols + this.numItemsInViewport.cols
          };
        else {
          var k = l ? v : b;
          n = t(k, this.itemSize), s = n + this.numItemsInViewport;
        }
      }
      return {
        first: this.first,
        last: this.last,
        viewport: {
          first: n,
          last: s
        }
      };
    },
    calculateNumItems: function() {
      var t = this.isBoth(), n = this.isHorizontal(), s = this.itemSize, i = this.getContentPosition(), l = this.element ? this.element.offsetWidth - i.left : 0, p = this.element ? this.element.offsetHeight - i.top : 0, b = function(E, R) {
        return Math.ceil(E / (R || E));
      }, v = function(E) {
        return Math.ceil(E / 2);
      }, k = t ? {
        rows: b(p, s[0]),
        cols: b(l, s[1])
      } : b(n ? l : p, s), S = this.d_numToleratedItems || (t ? [v(k.rows), v(k.cols)] : v(k));
      return {
        numItemsInViewport: k,
        numToleratedItems: S
      };
    },
    calculateOptions: function() {
      var t = this, n = this.isBoth(), s = this.first, i = this.calculateNumItems(), l = i.numItemsInViewport, p = i.numToleratedItems, b = function(S, _, E) {
        var R = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : !1;
        return t.getLast(S + _ + (S < E ? 2 : 3) * E, R);
      }, v = n ? {
        rows: b(s.rows, l.rows, p[0]),
        cols: b(s.cols, l.cols, p[1], !0)
      } : b(s, l, p);
      this.last = v, this.numItemsInViewport = l, this.d_numToleratedItems = p, this.$emit("update:numToleratedItems", this.d_numToleratedItems), this.showLoader && (this.loaderArr = n ? Array.from({
        length: l.rows
      }).map(function() {
        return Array.from({
          length: l.cols
        });
      }) : Array.from({
        length: l
      })), this.lazy && Promise.resolve().then(function() {
        var k;
        t.lazyLoadState = {
          first: t.step ? n ? {
            rows: 0,
            cols: s.cols
          } : 0 : s,
          last: Math.min(t.step ? t.step : v, ((k = t.items) === null || k === void 0 ? void 0 : k.length) || 0)
        }, t.$emit("lazy-load", t.lazyLoadState);
      });
    },
    calculateAutoSize: function() {
      var t = this;
      this.autoSize && !this.d_loading && Promise.resolve().then(function() {
        if (t.content) {
          var n = t.isBoth(), s = t.isHorizontal(), i = t.isVertical();
          t.content.style.minHeight = t.content.style.minWidth = "auto", t.content.style.position = "relative", t.element.style.contain = "none";
          var l = [an(t.element), ln(t.element)], p = l[0], b = l[1];
          (n || s) && (t.element.style.width = p < t.defaultWidth ? p + "px" : t.scrollWidth || t.defaultWidth + "px"), (n || i) && (t.element.style.height = b < t.defaultHeight ? b + "px" : t.scrollHeight || t.defaultHeight + "px"), t.content.style.minHeight = t.content.style.minWidth = "", t.content.style.position = "", t.element.style.contain = "";
        }
      });
    },
    getLast: function() {
      var t, n, s = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0, i = arguments.length > 1 ? arguments[1] : void 0;
      return this.items ? Math.min(i ? ((t = this.columns || this.items[0]) === null || t === void 0 ? void 0 : t.length) || 0 : ((n = this.items) === null || n === void 0 ? void 0 : n.length) || 0, s) : 0;
    },
    getContentPosition: function() {
      if (this.content) {
        var t = getComputedStyle(this.content), n = parseFloat(t.paddingLeft) + Math.max(parseFloat(t.left) || 0, 0), s = parseFloat(t.paddingRight) + Math.max(parseFloat(t.right) || 0, 0), i = parseFloat(t.paddingTop) + Math.max(parseFloat(t.top) || 0, 0), l = parseFloat(t.paddingBottom) + Math.max(parseFloat(t.bottom) || 0, 0);
        return {
          left: n,
          right: s,
          top: i,
          bottom: l,
          x: n + s,
          y: i + l
        };
      }
      return {
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        x: 0,
        y: 0
      };
    },
    setSize: function() {
      var t = this;
      if (this.element) {
        var n = this.isBoth(), s = this.isHorizontal(), i = this.element.parentElement, l = this.scrollWidth || "".concat(this.element.offsetWidth || i.offsetWidth, "px"), p = this.scrollHeight || "".concat(this.element.offsetHeight || i.offsetHeight, "px"), b = function(k, S) {
          return t.element.style[k] = S;
        };
        n || s ? (b("height", p), b("width", l)) : b("height", p);
      }
    },
    setSpacerSize: function() {
      var t = this, n = this.items;
      if (n) {
        var s = this.isBoth(), i = this.isHorizontal(), l = this.getContentPosition(), p = function(v, k, S) {
          var _ = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : 0;
          return t.spacerStyle = un(un({}, t.spacerStyle), ii({}, "".concat(v), (k || []).length * S + _ + "px"));
        };
        s ? (p("height", n, this.itemSize[0], l.y), p("width", this.columns || n[1], this.itemSize[1], l.x)) : i ? p("width", this.columns || n, this.itemSize, l.x) : p("height", n, this.itemSize, l.y);
      }
    },
    setContentPosition: function(t) {
      var n = this;
      if (this.content && !this.appendOnly) {
        var s = this.isBoth(), i = this.isHorizontal(), l = t ? t.first : this.first, p = function(S, _) {
          return S * _;
        }, b = function() {
          var S = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0, _ = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0;
          return n.contentStyle = un(un({}, n.contentStyle), {
            transform: "translate3d(".concat(S, "px, ").concat(_, "px, 0)")
          });
        };
        if (s)
          b(p(l.cols, this.itemSize[1]), p(l.rows, this.itemSize[0]));
        else {
          var v = p(l, this.itemSize);
          i ? b(v, 0) : b(0, v);
        }
      }
    },
    onScrollPositionChange: function(t) {
      var n = this, s = t.target, i = this.isBoth(), l = this.isHorizontal(), p = this.getContentPosition(), b = function(g, I) {
        return g ? g > I ? g - I : g : 0;
      }, v = function(g, I) {
        return Math.floor(g / (I || g));
      }, k = function(g, I, L, F, J, te) {
        return g <= J ? J : te ? L - F - J : I + J - 1;
      }, S = function(g, I, L, F, J, te, oe, me) {
        if (g <= te) return 0;
        var Ae = Math.max(0, oe ? g < I ? L : g - te : g > I ? L : g - 2 * te), ge = n.getLast(Ae, me);
        return Ae > ge ? ge - J : Ae;
      }, _ = function(g, I, L, F, J, te) {
        var oe = I + F + 2 * J;
        return g >= J && (oe += J + 1), n.getLast(oe, te);
      }, E = b(s.scrollTop, p.top), R = b(s.scrollLeft, p.left), T = i ? {
        rows: 0,
        cols: 0
      } : 0, N = this.last, z = !1, K = this.lastScrollPos;
      if (i) {
        var H = this.lastScrollPos.top <= E, P = this.lastScrollPos.left <= R;
        if (!this.appendOnly || this.appendOnly && (H || P)) {
          var B = {
            rows: v(E, this.itemSize[0]),
            cols: v(R, this.itemSize[1])
          }, d = {
            rows: k(B.rows, this.first.rows, this.last.rows, this.numItemsInViewport.rows, this.d_numToleratedItems[0], H),
            cols: k(B.cols, this.first.cols, this.last.cols, this.numItemsInViewport.cols, this.d_numToleratedItems[1], P)
          };
          T = {
            rows: S(B.rows, d.rows, this.first.rows, this.last.rows, this.numItemsInViewport.rows, this.d_numToleratedItems[0], H),
            cols: S(B.cols, d.cols, this.first.cols, this.last.cols, this.numItemsInViewport.cols, this.d_numToleratedItems[1], P, !0)
          }, N = {
            rows: _(B.rows, T.rows, this.last.rows, this.numItemsInViewport.rows, this.d_numToleratedItems[0]),
            cols: _(B.cols, T.cols, this.last.cols, this.numItemsInViewport.cols, this.d_numToleratedItems[1], !0)
          }, z = T.rows !== this.first.rows || N.rows !== this.last.rows || T.cols !== this.first.cols || N.cols !== this.last.cols || this.isRangeChanged, K = {
            top: E,
            left: R
          };
        }
      } else {
        var Q = l ? R : E, f = this.lastScrollPos <= Q;
        if (!this.appendOnly || this.appendOnly && f) {
          var w = v(Q, this.itemSize), A = k(w, this.first, this.last, this.numItemsInViewport, this.d_numToleratedItems, f);
          T = S(w, A, this.first, this.last, this.numItemsInViewport, this.d_numToleratedItems, f), N = _(w, T, this.last, this.numItemsInViewport, this.d_numToleratedItems), z = T !== this.first || N !== this.last || this.isRangeChanged, K = Q;
        }
      }
      return {
        first: T,
        last: N,
        isRangeChanged: z,
        scrollPos: K
      };
    },
    onScrollChange: function(t) {
      var n = this.onScrollPositionChange(t), s = n.first, i = n.last, l = n.isRangeChanged, p = n.scrollPos;
      if (l) {
        var b = {
          first: s,
          last: i
        };
        if (this.setContentPosition(b), this.first = s, this.last = i, this.lastScrollPos = p, this.$emit("scroll-index-change", b), this.lazy && this.isPageChanged(s)) {
          var v, k, S = {
            first: this.step ? Math.min(this.getPageByFirst(s) * this.step, (((v = this.items) === null || v === void 0 ? void 0 : v.length) || 0) - this.step) : s,
            last: Math.min(this.step ? (this.getPageByFirst(s) + 1) * this.step : i, ((k = this.items) === null || k === void 0 ? void 0 : k.length) || 0)
          }, _ = this.lazyLoadState.first !== S.first || this.lazyLoadState.last !== S.last;
          _ && this.$emit("lazy-load", S), this.lazyLoadState = S;
        }
      }
    },
    onScroll: function(t) {
      var n = this;
      if (this.$emit("scroll", t), this.delay) {
        if (this.scrollTimeout && clearTimeout(this.scrollTimeout), this.isPageChanged()) {
          if (!this.d_loading && this.showLoader) {
            var s = this.onScrollPositionChange(t), i = s.isRangeChanged, l = i || (this.step ? this.isPageChanged() : !1);
            l && (this.d_loading = !0);
          }
          this.scrollTimeout = setTimeout(function() {
            n.onScrollChange(t), n.d_loading && n.showLoader && (!n.lazy || n.loading === void 0) && (n.d_loading = !1, n.page = n.getPageByFirst());
          }, this.delay);
        }
      } else
        this.onScrollChange(t);
    },
    onResize: function() {
      var t = this;
      this.resizeTimeout && clearTimeout(this.resizeTimeout), this.resizeTimeout = setTimeout(function() {
        if (Pn(t.element)) {
          var n = t.isBoth(), s = t.isVertical(), i = t.isHorizontal(), l = [an(t.element), ln(t.element)], p = l[0], b = l[1], v = p !== t.defaultWidth, k = b !== t.defaultHeight, S = n ? v || k : i ? v : s ? k : !1;
          S && (t.d_numToleratedItems = t.numToleratedItems, t.defaultWidth = p, t.defaultHeight = b, t.defaultContentWidth = an(t.content), t.defaultContentHeight = ln(t.content), t.init());
        }
      }, this.resizeDelay);
    },
    bindResizeListener: function() {
      var t = this;
      this.resizeListener || (this.resizeListener = this.onResize.bind(this), window.addEventListener("resize", this.resizeListener), window.addEventListener("orientationchange", this.resizeListener), this.resizeObserver = new ResizeObserver(function() {
        t.onResize();
      }), this.resizeObserver.observe(this.element));
    },
    unbindResizeListener: function() {
      this.resizeListener && (window.removeEventListener("resize", this.resizeListener), window.removeEventListener("orientationchange", this.resizeListener), this.resizeListener = null), this.resizeObserver && (this.resizeObserver.disconnect(), this.resizeObserver = null);
    },
    getOptions: function(t) {
      var n = (this.items || []).length, s = this.isBoth() ? this.first.rows + t : this.first + t;
      return {
        index: s,
        count: n,
        first: s === 0,
        last: s === n - 1,
        even: s % 2 === 0,
        odd: s % 2 !== 0
      };
    },
    getLoaderOptions: function(t, n) {
      var s = this.loaderArr.length;
      return un({
        index: t,
        count: s,
        first: t === 0,
        last: t === s - 1,
        even: t % 2 === 0,
        odd: t % 2 !== 0
      }, n);
    },
    getPageByFirst: function(t) {
      return Math.floor(((t ?? this.first) + this.d_numToleratedItems * 4) / (this.step || 1));
    },
    isPageChanged: function(t) {
      return this.step && !this.lazy ? this.page !== this.getPageByFirst(t ?? this.first) : !0;
    },
    setContentEl: function(t) {
      this.content = t || this.content || Bo(this.element, '[data-pc-section="content"]');
    },
    elementRef: function(t) {
      this.element = t;
    },
    contentRef: function(t) {
      this.content = t;
    }
  },
  computed: {
    containerClass: function() {
      return ["p-virtualscroller", this.class, {
        "p-virtualscroller-inline": this.inline,
        "p-virtualscroller-both p-both-scroll": this.isBoth(),
        "p-virtualscroller-horizontal p-horizontal-scroll": this.isHorizontal()
      }];
    },
    contentClass: function() {
      return ["p-virtualscroller-content", {
        "p-virtualscroller-loading": this.d_loading
      }];
    },
    loaderClass: function() {
      return ["p-virtualscroller-loader", {
        "p-virtualscroller-loader-mask": !this.$slots.loader
      }];
    },
    loadedItems: function() {
      var t = this;
      return this.items && !this.d_loading ? this.isBoth() ? this.items.slice(this.appendOnly ? 0 : this.first.rows, this.last.rows).map(function(n) {
        return t.columns ? n : n.slice(t.appendOnly ? 0 : t.first.cols, t.last.cols);
      }) : this.isHorizontal() && this.columns ? this.items : this.items.slice(this.appendOnly ? 0 : this.first, this.last) : [];
    },
    loadedRows: function() {
      return this.d_loading ? this.loaderDisabled ? this.loaderArr : [] : this.loadedItems;
    },
    loadedColumns: function() {
      if (this.columns) {
        var t = this.isBoth(), n = this.isHorizontal();
        if (t || n)
          return this.d_loading && this.loaderDisabled ? t ? this.loaderArr[0] : this.loaderArr : this.columns.slice(t ? this.first.cols : this.first, t ? this.last.cols : this.last);
      }
      return this.columns;
    }
  },
  components: {
    SpinnerIcon: Dn
  }
}, ul = ["tabindex"];
function dl(e, t, n, s, i, l) {
  var p = Oe("SpinnerIcon");
  return e.disabled ? (a(), u(X, {
    key: 1
  }, [ie(e.$slots, "default"), ie(e.$slots, "content", {
    items: e.items,
    rows: e.items,
    columns: l.loadedColumns
  })], 64)) : (a(), u("div", W({
    key: 0,
    ref: l.elementRef,
    class: l.containerClass,
    tabindex: e.tabindex,
    style: e.style,
    onScroll: t[0] || (t[0] = function() {
      return l.onScroll && l.onScroll.apply(l, arguments);
    })
  }, e.ptmi("root")), [ie(e.$slots, "content", {
    styleClass: l.contentClass,
    items: l.loadedItems,
    getItemOptions: l.getOptions,
    loading: i.d_loading,
    getLoaderOptions: l.getLoaderOptions,
    itemSize: e.itemSize,
    rows: l.loadedRows,
    columns: l.loadedColumns,
    contentRef: l.contentRef,
    spacerStyle: i.spacerStyle,
    contentStyle: i.contentStyle,
    vertical: l.isVertical(),
    horizontal: l.isHorizontal(),
    both: l.isBoth()
  }, function() {
    return [r("div", W({
      ref: l.contentRef,
      class: l.contentClass,
      style: i.contentStyle
    }, e.ptm("content")), [(a(!0), u(X, null, se(l.loadedItems, function(b, v) {
      return ie(e.$slots, "item", {
        key: v,
        item: b,
        options: l.getOptions(v)
      });
    }), 128))], 16)];
  }), e.showSpacer ? (a(), u("div", W({
    key: 0,
    class: "p-virtualscroller-spacer",
    style: i.spacerStyle
  }, e.ptm("spacer")), null, 16)) : h("", !0), !e.loaderDisabled && e.showLoader && i.d_loading ? (a(), u("div", W({
    key: 1,
    class: l.loaderClass
  }, e.ptm("loader")), [e.$slots && e.$slots.loader ? (a(!0), u(X, {
    key: 0
  }, se(i.loaderArr, function(b, v) {
    return ie(e.$slots, "loader", {
      key: v,
      options: l.getLoaderOptions(v, l.isBoth() && {
        numCols: e.d_numItemsInViewport.cols
      })
    });
  }), 128)) : h("", !0), ie(e.$slots, "loadingicon", {}, function() {
    return [m(p, W({
      spin: "",
      class: "p-virtualscroller-loading-icon"
    }, e.ptm("loadingIcon")), null, 16)];
  })], 16)) : h("", !0)], 16, ul));
}
si.render = dl;
var cl = `
    .p-select {
        display: inline-flex;
        cursor: pointer;
        position: relative;
        user-select: none;
        background: dt('select.background');
        border: 1px solid dt('select.border.color');
        transition:
            background dt('select.transition.duration'),
            color dt('select.transition.duration'),
            border-color dt('select.transition.duration'),
            outline-color dt('select.transition.duration'),
            box-shadow dt('select.transition.duration');
        border-radius: dt('select.border.radius');
        outline-color: transparent;
        box-shadow: dt('select.shadow');
    }

    .p-select:not(.p-disabled):hover {
        border-color: dt('select.hover.border.color');
    }

    .p-select:not(.p-disabled).p-focus {
        border-color: dt('select.focus.border.color');
        box-shadow: dt('select.focus.ring.shadow');
        outline: dt('select.focus.ring.width') dt('select.focus.ring.style') dt('select.focus.ring.color');
        outline-offset: dt('select.focus.ring.offset');
    }

    .p-select.p-variant-filled {
        background: dt('select.filled.background');
    }

    .p-select.p-variant-filled:not(.p-disabled):hover {
        background: dt('select.filled.hover.background');
    }

    .p-select.p-variant-filled:not(.p-disabled).p-focus {
        background: dt('select.filled.focus.background');
    }

    .p-select.p-invalid {
        border-color: dt('select.invalid.border.color');
    }

    .p-select.p-disabled {
        opacity: 1;
        background: dt('select.disabled.background');
    }

    .p-select-clear-icon {
        align-self: center;
        color: dt('select.clear.icon.color');
        inset-inline-end: dt('select.dropdown.width');
    }

    .p-select-dropdown {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        background: transparent;
        color: dt('select.dropdown.color');
        width: dt('select.dropdown.width');
        border-start-end-radius: dt('select.border.radius');
        border-end-end-radius: dt('select.border.radius');
    }

    .p-select-label {
        display: block;
        white-space: nowrap;
        overflow: hidden;
        flex: 1 1 auto;
        width: 1%;
        padding: dt('select.padding.y') dt('select.padding.x');
        text-overflow: ellipsis;
        cursor: pointer;
        color: dt('select.color');
        background: transparent;
        border: 0 none;
        outline: 0 none;
        font-size: 1rem;
    }

    .p-select-label.p-placeholder {
        color: dt('select.placeholder.color');
    }

    .p-select.p-invalid .p-select-label.p-placeholder {
        color: dt('select.invalid.placeholder.color');
    }

    .p-select.p-disabled .p-select-label {
        color: dt('select.disabled.color');
    }

    .p-select-label-empty {
        overflow: hidden;
        opacity: 0;
    }

    input.p-select-label {
        cursor: default;
    }

    .p-select-overlay {
        position: absolute;
        top: 0;
        left: 0;
        background: dt('select.overlay.background');
        color: dt('select.overlay.color');
        border: 1px solid dt('select.overlay.border.color');
        border-radius: dt('select.overlay.border.radius');
        box-shadow: dt('select.overlay.shadow');
        min-width: 100%;
        transform-origin: inherit;
        will-change: transform;
    }

    .p-select-header {
        padding: dt('select.list.header.padding');
    }

    .p-select-filter {
        width: 100%;
    }

    .p-select-list-container {
        overflow: auto;
    }

    .p-select-option-group {
        cursor: auto;
        margin: 0;
        padding: dt('select.option.group.padding');
        background: dt('select.option.group.background');
        color: dt('select.option.group.color');
        font-weight: dt('select.option.group.font.weight');
    }

    .p-select-list {
        margin: 0;
        padding: 0;
        list-style-type: none;
        padding: dt('select.list.padding');
        gap: dt('select.list.gap');
        display: flex;
        flex-direction: column;
    }

    .p-select-option {
        cursor: pointer;
        font-weight: normal;
        white-space: nowrap;
        position: relative;
        overflow: hidden;
        display: flex;
        align-items: center;
        padding: dt('select.option.padding');
        border: 0 none;
        color: dt('select.option.color');
        background: transparent;
        transition:
            background dt('select.transition.duration'),
            color dt('select.transition.duration'),
            border-color dt('select.transition.duration'),
            box-shadow dt('select.transition.duration'),
            outline-color dt('select.transition.duration');
        border-radius: dt('select.option.border.radius');
    }

    .p-select-option:not(.p-select-option-selected):not(.p-disabled).p-focus {
        background: dt('select.option.focus.background');
        color: dt('select.option.focus.color');
    }

    .p-select-option:not(.p-select-option-selected):not(.p-disabled):hover {
        background: dt('select.option.focus.background');
        color: dt('select.option.focus.color');
    }

    .p-select-option.p-select-option-selected {
        background: dt('select.option.selected.background');
        color: dt('select.option.selected.color');
    }

    .p-select-option.p-select-option-selected.p-focus {
        background: dt('select.option.selected.focus.background');
        color: dt('select.option.selected.focus.color');
    }
   
    .p-select-option-blank-icon {
        flex-shrink: 0;
    }

    .p-select-option-check-icon {
        position: relative;
        flex-shrink: 0;
        margin-inline-start: dt('select.checkmark.gutter.start');
        margin-inline-end: dt('select.checkmark.gutter.end');
        color: dt('select.checkmark.color');
    }

    .p-select-empty-message {
        padding: dt('select.empty.message.padding');
    }

    .p-select-fluid {
        display: flex;
        width: 100%;
    }

    .p-select-sm .p-select-label {
        font-size: dt('select.sm.font.size');
        padding-block: dt('select.sm.padding.y');
        padding-inline: dt('select.sm.padding.x');
    }

    .p-select-sm .p-select-dropdown .p-icon {
        font-size: dt('select.sm.font.size');
        width: dt('select.sm.font.size');
        height: dt('select.sm.font.size');
    }

    .p-select-lg .p-select-label {
        font-size: dt('select.lg.font.size');
        padding-block: dt('select.lg.padding.y');
        padding-inline: dt('select.lg.padding.x');
    }

    .p-select-lg .p-select-dropdown .p-icon {
        font-size: dt('select.lg.font.size');
        width: dt('select.lg.font.size');
        height: dt('select.lg.font.size');
    }

    .p-floatlabel-in .p-select-filter {
        padding-block-start: dt('select.padding.y');
        padding-block-end: dt('select.padding.y');
    }
`, pl = {
  root: function(t) {
    var n = t.instance, s = t.props, i = t.state;
    return ["p-select p-component p-inputwrapper", {
      "p-disabled": s.disabled,
      "p-invalid": n.$invalid,
      "p-variant-filled": n.$variant === "filled",
      "p-focus": i.focused,
      "p-inputwrapper-filled": n.$filled,
      "p-inputwrapper-focus": i.focused || i.overlayVisible,
      "p-select-open": i.overlayVisible,
      "p-select-fluid": n.$fluid,
      "p-select-sm p-inputfield-sm": s.size === "small",
      "p-select-lg p-inputfield-lg": s.size === "large"
    }];
  },
  label: function(t) {
    var n, s = t.instance, i = t.props;
    return ["p-select-label", {
      "p-placeholder": !i.editable && s.label === i.placeholder,
      "p-select-label-empty": !i.editable && !s.$slots.value && (s.label === "p-emptylabel" || ((n = s.label) === null || n === void 0 ? void 0 : n.length) === 0)
    }];
  },
  clearIcon: "p-select-clear-icon",
  dropdown: "p-select-dropdown",
  loadingicon: "p-select-loading-icon",
  dropdownIcon: "p-select-dropdown-icon",
  overlay: "p-select-overlay p-component",
  header: "p-select-header",
  pcFilter: "p-select-filter",
  listContainer: "p-select-list-container",
  list: "p-select-list",
  optionGroup: "p-select-option-group",
  optionGroupLabel: "p-select-option-group-label",
  option: function(t) {
    var n = t.instance, s = t.props, i = t.state, l = t.option, p = t.focusedOption;
    return ["p-select-option", {
      "p-select-option-selected": n.isSelected(l) && s.highlightOnSelect,
      "p-focus": i.focusedOptionIndex === p,
      "p-disabled": n.isOptionDisabled(l)
    }];
  },
  optionLabel: "p-select-option-label",
  optionCheckIcon: "p-select-option-check-icon",
  optionBlankIcon: "p-select-option-blank-icon",
  emptyMessage: "p-select-empty-message"
}, fl = mt.extend({
  name: "select",
  style: cl,
  classes: pl
}), ml = {
  name: "BaseSelect",
  extends: ni,
  props: {
    options: Array,
    optionLabel: [String, Function],
    optionValue: [String, Function],
    optionDisabled: [String, Function],
    optionGroupLabel: [String, Function],
    optionGroupChildren: [String, Function],
    scrollHeight: {
      type: String,
      default: "14rem"
    },
    filter: Boolean,
    filterPlaceholder: String,
    filterLocale: String,
    filterMatchMode: {
      type: String,
      default: "contains"
    },
    filterFields: {
      type: Array,
      default: null
    },
    editable: Boolean,
    placeholder: {
      type: String,
      default: null
    },
    dataKey: null,
    showClear: {
      type: Boolean,
      default: !1
    },
    inputId: {
      type: String,
      default: null
    },
    inputClass: {
      type: [String, Object],
      default: null
    },
    inputStyle: {
      type: Object,
      default: null
    },
    labelId: {
      type: String,
      default: null
    },
    labelClass: {
      type: [String, Object],
      default: null
    },
    labelStyle: {
      type: Object,
      default: null
    },
    panelClass: {
      type: [String, Object],
      default: null
    },
    overlayStyle: {
      type: Object,
      default: null
    },
    overlayClass: {
      type: [String, Object],
      default: null
    },
    panelStyle: {
      type: Object,
      default: null
    },
    appendTo: {
      type: [String, Object],
      default: "body"
    },
    loading: {
      type: Boolean,
      default: !1
    },
    clearIcon: {
      type: String,
      default: void 0
    },
    dropdownIcon: {
      type: String,
      default: void 0
    },
    filterIcon: {
      type: String,
      default: void 0
    },
    loadingIcon: {
      type: String,
      default: void 0
    },
    resetFilterOnHide: {
      type: Boolean,
      default: !1
    },
    resetFilterOnClear: {
      type: Boolean,
      default: !1
    },
    virtualScrollerOptions: {
      type: Object,
      default: null
    },
    autoOptionFocus: {
      type: Boolean,
      default: !1
    },
    autoFilterFocus: {
      type: Boolean,
      default: !1
    },
    selectOnFocus: {
      type: Boolean,
      default: !1
    },
    focusOnHover: {
      type: Boolean,
      default: !0
    },
    highlightOnSelect: {
      type: Boolean,
      default: !0
    },
    checkmark: {
      type: Boolean,
      default: !1
    },
    filterMessage: {
      type: String,
      default: null
    },
    selectionMessage: {
      type: String,
      default: null
    },
    emptySelectionMessage: {
      type: String,
      default: null
    },
    emptyFilterMessage: {
      type: String,
      default: null
    },
    emptyMessage: {
      type: String,
      default: null
    },
    tabindex: {
      type: Number,
      default: 0
    },
    ariaLabel: {
      type: String,
      default: null
    },
    ariaLabelledby: {
      type: String,
      default: null
    }
  },
  style: fl,
  provide: function() {
    return {
      $pcSelect: this,
      $parentInstance: this
    };
  }
};
function _n(e) {
  "@babel/helpers - typeof";
  return _n = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, _n(e);
}
function hl(e) {
  return yl(e) || gl(e) || vl(e) || bl();
}
function bl() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function vl(e, t) {
  if (e) {
    if (typeof e == "string") return Jn(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Jn(e, t) : void 0;
  }
}
function gl(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function yl(e) {
  if (Array.isArray(e)) return Jn(e);
}
function Jn(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, s = Array(t); n < t; n++) s[n] = e[n];
  return s;
}
function _o(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var s = Object.getOwnPropertySymbols(e);
    t && (s = s.filter(function(i) {
      return Object.getOwnPropertyDescriptor(e, i).enumerable;
    })), n.push.apply(n, s);
  }
  return n;
}
function xo(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? _o(Object(n), !0).forEach(function(s) {
      Nt(e, s, n[s]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : _o(Object(n)).forEach(function(s) {
      Object.defineProperty(e, s, Object.getOwnPropertyDescriptor(n, s));
    });
  }
  return e;
}
function Nt(e, t, n) {
  return (t = kl(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function kl(e) {
  var t = wl(e, "string");
  return _n(t) == "symbol" ? t : t + "";
}
function wl(e, t) {
  if (_n(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var s = n.call(e, t);
    if (_n(s) != "object") return s;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var An = {
  name: "Select",
  extends: ml,
  inheritAttrs: !1,
  emits: ["change", "focus", "blur", "before-show", "before-hide", "show", "hide", "filter"],
  outsideClickListener: null,
  scrollHandler: null,
  resizeListener: null,
  labelClickListener: null,
  matchMediaOrientationListener: null,
  overlay: null,
  list: null,
  virtualScroller: null,
  searchTimeout: null,
  searchValue: null,
  isModelValueChanged: !1,
  data: function() {
    return {
      clicked: !1,
      focused: !1,
      focusedOptionIndex: -1,
      filterValue: null,
      overlayVisible: !1,
      queryOrientation: null
    };
  },
  watch: {
    modelValue: function() {
      this.isModelValueChanged = !0;
    },
    options: function() {
      this.autoUpdateModel();
    }
  },
  mounted: function() {
    this.autoUpdateModel(), this.bindLabelClickListener(), this.bindMatchMediaOrientationListener();
  },
  updated: function() {
    this.overlayVisible && this.isModelValueChanged && this.scrollInView(this.findSelectedOptionIndex()), this.isModelValueChanged = !1;
  },
  beforeUnmount: function() {
    this.unbindOutsideClickListener(), this.unbindResizeListener(), this.unbindLabelClickListener(), this.unbindMatchMediaOrientationListener(), this.scrollHandler && (this.scrollHandler.destroy(), this.scrollHandler = null), this.overlay && (Qt.clear(this.overlay), this.overlay = null);
  },
  methods: {
    getOptionIndex: function(t, n) {
      return this.virtualScrollerDisabled ? t : n && n(t).index;
    },
    getOptionLabel: function(t) {
      return this.optionLabel ? Xt(t, this.optionLabel) : t;
    },
    getOptionValue: function(t) {
      return this.optionValue ? Xt(t, this.optionValue) : t;
    },
    getOptionRenderKey: function(t, n) {
      return (this.dataKey ? Xt(t, this.dataKey) : this.getOptionLabel(t)) + "_" + n;
    },
    getPTItemOptions: function(t, n, s, i) {
      return this.ptm(i, {
        context: {
          option: t,
          index: s,
          selected: this.isSelected(t),
          focused: this.focusedOptionIndex === this.getOptionIndex(s, n),
          disabled: this.isOptionDisabled(t)
        }
      });
    },
    isOptionDisabled: function(t) {
      return this.optionDisabled ? Xt(t, this.optionDisabled) : !1;
    },
    isOptionGroup: function(t) {
      return this.optionGroupLabel && t.optionGroup && t.group;
    },
    getOptionGroupLabel: function(t) {
      return Xt(t, this.optionGroupLabel);
    },
    getOptionGroupChildren: function(t) {
      return Xt(t, this.optionGroupChildren);
    },
    getAriaPosInset: function(t) {
      var n = this;
      return (this.optionGroupLabel ? t - this.visibleOptions.slice(0, t).filter(function(s) {
        return n.isOptionGroup(s);
      }).length : t) + 1;
    },
    show: function(t) {
      this.$emit("before-show"), this.overlayVisible = !0, this.focusedOptionIndex = this.focusedOptionIndex !== -1 ? this.focusedOptionIndex : this.autoOptionFocus ? this.findFirstFocusedOptionIndex() : this.editable ? -1 : this.findSelectedOptionIndex(), t && Le(this.$refs.focusInput);
    },
    hide: function(t) {
      var n = this, s = function() {
        n.$emit("before-hide"), n.overlayVisible = !1, n.clicked = !1, n.focusedOptionIndex = -1, n.searchValue = "", n.resetFilterOnHide && (n.filterValue = null), t && Le(n.$refs.focusInput);
      };
      setTimeout(function() {
        s();
      }, 0);
    },
    onFocus: function(t) {
      this.disabled || (this.focused = !0, this.overlayVisible && (this.focusedOptionIndex = this.focusedOptionIndex !== -1 ? this.focusedOptionIndex : this.autoOptionFocus ? this.findFirstFocusedOptionIndex() : this.editable ? -1 : this.findSelectedOptionIndex(), this.scrollInView(this.focusedOptionIndex)), this.$emit("focus", t));
    },
    onBlur: function(t) {
      var n = this;
      setTimeout(function() {
        var s, i;
        n.focused = !1, n.focusedOptionIndex = -1, n.searchValue = "", n.$emit("blur", t), (s = (i = n.formField).onBlur) === null || s === void 0 || s.call(i, t);
      }, 100);
    },
    onKeyDown: function(t) {
      var n = this;
      if (this.disabled) {
        t.preventDefault();
        return;
      }
      if ($i())
        switch (t.code) {
          case "Backspace":
            this.onBackspaceKey(t, this.editable);
            break;
          case "Enter":
          case "NumpadDecimal":
            this.onEnterKey(t);
            break;
          default:
            t.preventDefault();
            return;
        }
      var s = t.metaKey || t.ctrlKey;
      switch (t.code) {
        case "ArrowDown":
          this.onArrowDownKey(t);
          break;
        case "ArrowUp":
          this.onArrowUpKey(t, this.editable);
          break;
        case "ArrowLeft":
        case "ArrowRight":
          this.onArrowLeftKey(t, this.editable);
          break;
        case "Home":
          this.onHomeKey(t, this.editable);
          break;
        case "End":
          this.onEndKey(t, this.editable);
          break;
        case "PageDown":
          this.onPageDownKey(t);
          break;
        case "PageUp":
          this.onPageUpKey(t);
          break;
        case "Space":
          this.onSpaceKey(t, this.editable);
          break;
        case "Enter":
        case "NumpadEnter":
          this.onEnterKey(t);
          break;
        case "Escape":
          this.onEscapeKey(t);
          break;
        case "Tab":
          this.onTabKey(t);
          break;
        case "Backspace":
          this.onBackspaceKey(t, this.editable);
          break;
        case "ShiftLeft":
        case "ShiftRight":
          break;
        default:
          !s && Ci(t.key) && (!this.overlayVisible && this.show(), !this.editable && this.searchOptions(t, t.key), this.filter && this.$nextTick(function() {
            n.$refs.filterInput && Le(n.$refs.filterInput.$el);
          }));
          break;
      }
      this.clicked = !1;
    },
    onEditableInput: function(t) {
      var n = t.target.value;
      this.searchValue = "";
      var s = this.searchOptions(t, n);
      !s && (this.focusedOptionIndex = -1), this.updateModel(t, n), !this.overlayVisible && zt(n) && this.show();
    },
    onContainerClick: function(t) {
      this.disabled || this.loading || t.target.tagName === "INPUT" || t.target.getAttribute("data-pc-section") === "clearicon" || t.target.closest('[data-pc-section="clearicon"]') || ((!this.overlay || !this.overlay.contains(t.target)) && (this.overlayVisible ? this.hide(!0) : this.show(!0)), this.clicked = !0);
    },
    onClearClick: function(t) {
      this.updateModel(t, null), this.resetFilterOnClear && (this.filterValue = null);
    },
    onFirstHiddenFocus: function(t) {
      var n = t.relatedTarget === this.$refs.focusInput ? Jt(this.overlay, ':not([data-p-hidden-focusable="true"])') : this.$refs.focusInput;
      Le(n);
    },
    onLastHiddenFocus: function(t) {
      var n = t.relatedTarget === this.$refs.focusInput ? Eo(this.overlay, ':not([data-p-hidden-focusable="true"])') : this.$refs.focusInput;
      Le(n);
    },
    onOptionSelect: function(t, n) {
      var s = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : !0;
      if (this.overlayVisible) {
        var i = this.getOptionValue(n);
        this.updateModel(t, i), s && this.hide(!0);
      }
    },
    onOptionMouseMove: function(t, n) {
      this.focusOnHover && this.changeFocusedOptionIndex(t, n);
    },
    onFilterChange: function(t) {
      var n = t.target.value;
      this.filterValue = n, this.focusedOptionIndex = -1, this.$emit("filter", {
        originalEvent: t,
        value: n
      }), !this.virtualScrollerDisabled && this.virtualScroller.scrollToIndex(0);
    },
    onFilterKeyDown: function(t) {
      if (!t.isComposing)
        switch (t.code) {
          case "ArrowDown":
            this.onArrowDownKey(t);
            break;
          case "ArrowUp":
            this.onArrowUpKey(t, !0);
            break;
          case "ArrowLeft":
          case "ArrowRight":
            this.onArrowLeftKey(t, !0);
            break;
          case "Home":
            this.onHomeKey(t, !0);
            break;
          case "End":
            this.onEndKey(t, !0);
            break;
          case "Enter":
          case "NumpadEnter":
            this.onEnterKey(t);
            break;
          case "Escape":
            this.onEscapeKey(t);
            break;
          case "Tab":
            this.onTabKey(t);
            break;
        }
    },
    onFilterBlur: function() {
      this.focusedOptionIndex = -1;
    },
    onFilterUpdated: function() {
      this.overlayVisible && this.alignOverlay();
    },
    onOverlayClick: function(t) {
      as.emit("overlay-click", {
        originalEvent: t,
        target: this.$el
      });
    },
    onOverlayKeyDown: function(t) {
      switch (t.code) {
        case "Escape":
          this.onEscapeKey(t);
          break;
      }
    },
    onArrowDownKey: function(t) {
      if (!this.overlayVisible)
        this.show(), this.editable && this.changeFocusedOptionIndex(t, this.findSelectedOptionIndex());
      else {
        var n = this.focusedOptionIndex !== -1 ? this.findNextOptionIndex(this.focusedOptionIndex) : this.clicked ? this.findFirstOptionIndex() : this.findFirstFocusedOptionIndex();
        this.changeFocusedOptionIndex(t, n);
      }
      t.preventDefault();
    },
    onArrowUpKey: function(t) {
      var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1;
      if (t.altKey && !n)
        this.focusedOptionIndex !== -1 && this.onOptionSelect(t, this.visibleOptions[this.focusedOptionIndex]), this.overlayVisible && this.hide(), t.preventDefault();
      else {
        var s = this.focusedOptionIndex !== -1 ? this.findPrevOptionIndex(this.focusedOptionIndex) : this.clicked ? this.findLastOptionIndex() : this.findLastFocusedOptionIndex();
        this.changeFocusedOptionIndex(t, s), !this.overlayVisible && this.show(), t.preventDefault();
      }
    },
    onArrowLeftKey: function(t) {
      var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1;
      n && (this.focusedOptionIndex = -1);
    },
    onHomeKey: function(t) {
      var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1;
      if (n) {
        var s = t.currentTarget;
        t.shiftKey ? s.setSelectionRange(0, t.target.selectionStart) : (s.setSelectionRange(0, 0), this.focusedOptionIndex = -1);
      } else
        this.changeFocusedOptionIndex(t, this.findFirstOptionIndex()), !this.overlayVisible && this.show();
      t.preventDefault();
    },
    onEndKey: function(t) {
      var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1;
      if (n) {
        var s = t.currentTarget;
        if (t.shiftKey)
          s.setSelectionRange(t.target.selectionStart, s.value.length);
        else {
          var i = s.value.length;
          s.setSelectionRange(i, i), this.focusedOptionIndex = -1;
        }
      } else
        this.changeFocusedOptionIndex(t, this.findLastOptionIndex()), !this.overlayVisible && this.show();
      t.preventDefault();
    },
    onPageUpKey: function(t) {
      this.scrollInView(0), t.preventDefault();
    },
    onPageDownKey: function(t) {
      this.scrollInView(this.visibleOptions.length - 1), t.preventDefault();
    },
    onEnterKey: function(t) {
      this.overlayVisible ? (this.focusedOptionIndex !== -1 && this.onOptionSelect(t, this.visibleOptions[this.focusedOptionIndex]), this.hide(!0)) : (this.focusedOptionIndex = -1, this.onArrowDownKey(t)), t.preventDefault();
    },
    onSpaceKey: function(t) {
      var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1;
      !n && this.onEnterKey(t);
    },
    onEscapeKey: function(t) {
      this.overlayVisible && this.hide(!0), t.preventDefault(), t.stopPropagation();
    },
    onTabKey: function(t) {
      var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1;
      n || (this.overlayVisible && this.hasFocusableElements() ? (Le(this.$refs.firstHiddenFocusableElementOnOverlay), t.preventDefault()) : (this.focusedOptionIndex !== -1 && this.onOptionSelect(t, this.visibleOptions[this.focusedOptionIndex]), this.overlayVisible && this.hide(this.filter)));
    },
    onBackspaceKey: function(t) {
      var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1;
      n && !this.overlayVisible && this.show();
    },
    onOverlayEnter: function(t) {
      var n = this;
      Qt.set("overlay", t, this.$primevue.config.zIndex.overlay), Do(t, {
        position: "absolute",
        top: "0"
      }), this.alignOverlay(), this.scrollInView(), this.$attrSelector && t.setAttribute(this.$attrSelector, ""), setTimeout(function() {
        n.autoFilterFocus && n.filter && Le(n.$refs.filterInput.$el), n.autoUpdateModel();
      }, 1);
    },
    onOverlayAfterEnter: function() {
      this.bindOutsideClickListener(), this.bindScrollListener(), this.bindResizeListener(), this.$emit("show");
    },
    onOverlayLeave: function(t) {
      var n = this;
      t.style.pointerEvents = "none", this.unbindOutsideClickListener(), this.unbindScrollListener(), this.unbindResizeListener(), this.autoFilterFocus && this.filter && !this.editable && this.$nextTick(function() {
        n.$refs.filterInput && Le(n.$refs.filterInput.$el);
      }), this.$emit("hide"), this.overlay = null;
    },
    onOverlayAfterLeave: function(t) {
      Qt.clear(t);
    },
    alignOverlay: function() {
      this.appendTo === "self" ? wi(this.overlay, this.$el) : this.overlay && (this.overlay.style.minWidth = Vo(this.$el) + "px", Si(this.overlay, this.$el));
    },
    bindOutsideClickListener: function() {
      var t = this;
      this.outsideClickListener || (this.outsideClickListener = function(n) {
        var s = n.composedPath();
        t.overlayVisible && t.overlay && !s.includes(t.$el) && !s.includes(t.overlay) && t.hide();
      }, document.addEventListener("click", this.outsideClickListener, !0));
    },
    unbindOutsideClickListener: function() {
      this.outsideClickListener && (document.removeEventListener("click", this.outsideClickListener, !0), this.outsideClickListener = null);
    },
    bindScrollListener: function() {
      var t = this;
      this.scrollHandler || (this.scrollHandler = new ss(this.$refs.container, function() {
        t.overlayVisible && t.hide();
      })), this.scrollHandler.bindScrollListener();
    },
    unbindScrollListener: function() {
      this.scrollHandler && this.scrollHandler.unbindScrollListener();
    },
    bindResizeListener: function() {
      var t = this;
      this.resizeListener || (this.resizeListener = function() {
        t.overlayVisible && !ki() && t.hide();
      }, window.addEventListener("resize", this.resizeListener));
    },
    unbindResizeListener: function() {
      this.resizeListener && (window.removeEventListener("resize", this.resizeListener), this.resizeListener = null);
    },
    bindLabelClickListener: function() {
      var t = this;
      if (!this.editable && !this.labelClickListener) {
        var n = document.querySelector('label[for="'.concat(this.labelId, '"]'));
        n && Pn(n) && (this.labelClickListener = function() {
          Le(t.$refs.focusInput);
        }, n.addEventListener("click", this.labelClickListener));
      }
    },
    unbindLabelClickListener: function() {
      if (this.labelClickListener) {
        var t = document.querySelector('label[for="'.concat(this.labelId, '"]'));
        t && Pn(t) && t.removeEventListener("click", this.labelClickListener);
      }
    },
    bindMatchMediaOrientationListener: function() {
      var t = this;
      if (!this.matchMediaOrientationListener) {
        var n = matchMedia("(orientation: portrait)");
        this.queryOrientation = n, this.matchMediaOrientationListener = function() {
          t.alignOverlay();
        }, this.queryOrientation.addEventListener("change", this.matchMediaOrientationListener);
      }
    },
    unbindMatchMediaOrientationListener: function() {
      this.matchMediaOrientationListener && (this.queryOrientation.removeEventListener("change", this.matchMediaOrientationListener), this.queryOrientation = null, this.matchMediaOrientationListener = null);
    },
    hasFocusableElements: function() {
      return yi(this.overlay, ':not([data-p-hidden-focusable="true"])').length > 0;
    },
    isOptionExactMatched: function(t) {
      var n;
      return this.isValidOption(t) && typeof this.getOptionLabel(t) == "string" && ((n = this.getOptionLabel(t)) === null || n === void 0 ? void 0 : n.toLocaleLowerCase(this.filterLocale)) == this.searchValue.toLocaleLowerCase(this.filterLocale);
    },
    isOptionStartsWith: function(t) {
      var n;
      return this.isValidOption(t) && typeof this.getOptionLabel(t) == "string" && ((n = this.getOptionLabel(t)) === null || n === void 0 ? void 0 : n.toLocaleLowerCase(this.filterLocale).startsWith(this.searchValue.toLocaleLowerCase(this.filterLocale)));
    },
    isValidOption: function(t) {
      return zt(t) && !(this.isOptionDisabled(t) || this.isOptionGroup(t));
    },
    isValidSelectedOption: function(t) {
      return this.isValidOption(t) && this.isSelected(t);
    },
    isSelected: function(t) {
      return gi(this.d_value, this.getOptionValue(t), this.equalityKey);
    },
    findFirstOptionIndex: function() {
      var t = this;
      return this.visibleOptions.findIndex(function(n) {
        return t.isValidOption(n);
      });
    },
    findLastOptionIndex: function() {
      var t = this;
      return co(this.visibleOptions, function(n) {
        return t.isValidOption(n);
      });
    },
    findNextOptionIndex: function(t) {
      var n = this, s = t < this.visibleOptions.length - 1 ? this.visibleOptions.slice(t + 1).findIndex(function(i) {
        return n.isValidOption(i);
      }) : -1;
      return s > -1 ? s + t + 1 : t;
    },
    findPrevOptionIndex: function(t) {
      var n = this, s = t > 0 ? co(this.visibleOptions.slice(0, t), function(i) {
        return n.isValidOption(i);
      }) : -1;
      return s > -1 ? s : t;
    },
    findSelectedOptionIndex: function() {
      var t = this;
      return this.visibleOptions.findIndex(function(n) {
        return t.isValidSelectedOption(n);
      });
    },
    findFirstFocusedOptionIndex: function() {
      var t = this.findSelectedOptionIndex();
      return t < 0 ? this.findFirstOptionIndex() : t;
    },
    findLastFocusedOptionIndex: function() {
      var t = this.findSelectedOptionIndex();
      return t < 0 ? this.findLastOptionIndex() : t;
    },
    searchOptions: function(t, n) {
      var s = this;
      this.searchValue = (this.searchValue || "") + n;
      var i = -1, l = !1;
      return zt(this.searchValue) && (i = this.visibleOptions.findIndex(function(p) {
        return s.isOptionExactMatched(p);
      }), i === -1 && (i = this.visibleOptions.findIndex(function(p) {
        return s.isOptionStartsWith(p);
      })), i !== -1 && (l = !0), i === -1 && this.focusedOptionIndex === -1 && (i = this.findFirstFocusedOptionIndex()), i !== -1 && this.changeFocusedOptionIndex(t, i)), this.searchTimeout && clearTimeout(this.searchTimeout), this.searchTimeout = setTimeout(function() {
        s.searchValue = "", s.searchTimeout = null;
      }, 500), l;
    },
    changeFocusedOptionIndex: function(t, n) {
      this.focusedOptionIndex !== n && (this.focusedOptionIndex = n, this.scrollInView(), this.selectOnFocus && this.onOptionSelect(t, this.visibleOptions[n], !1));
    },
    scrollInView: function() {
      var t = this, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : -1;
      this.$nextTick(function() {
        var s = n !== -1 ? "".concat(t.$id, "_").concat(n) : t.focusedOptionId, i = Bo(t.list, 'li[id="'.concat(s, '"]'));
        i ? i.scrollIntoView && i.scrollIntoView({
          block: "nearest",
          inline: "nearest"
        }) : t.virtualScrollerDisabled || t.virtualScroller && t.virtualScroller.scrollToIndex(n !== -1 ? n : t.focusedOptionIndex);
      });
    },
    autoUpdateModel: function() {
      this.autoOptionFocus && (this.focusedOptionIndex = this.findFirstFocusedOptionIndex()), this.selectOnFocus && this.autoOptionFocus && !this.$filled && this.onOptionSelect(null, this.visibleOptions[this.focusedOptionIndex], !1);
    },
    updateModel: function(t, n) {
      this.writeValue(n, t), this.$emit("change", {
        originalEvent: t,
        value: n
      });
    },
    flatOptions: function(t) {
      var n = this;
      return (t || []).reduce(function(s, i, l) {
        s.push({
          optionGroup: i,
          group: !0,
          index: l
        });
        var p = n.getOptionGroupChildren(i);
        return p && p.forEach(function(b) {
          return s.push(b);
        }), s;
      }, []);
    },
    overlayRef: function(t) {
      this.overlay = t;
    },
    listRef: function(t, n) {
      this.list = t, n && n(t);
    },
    virtualScrollerRef: function(t) {
      this.virtualScroller = t;
    }
  },
  computed: {
    visibleOptions: function() {
      var t = this, n = this.optionGroupLabel ? this.flatOptions(this.options) : this.options || [];
      if (this.filterValue) {
        var s = vi.filter(n, this.searchFields, this.filterValue, this.filterMatchMode, this.filterLocale);
        if (this.optionGroupLabel) {
          var i = this.options || [], l = [];
          return i.forEach(function(p) {
            var b = t.getOptionGroupChildren(p), v = b.filter(function(k) {
              return s.includes(k);
            });
            v.length > 0 && l.push(xo(xo({}, p), {}, Nt({}, typeof t.optionGroupChildren == "string" ? t.optionGroupChildren : "items", hl(v))));
          }), this.flatOptions(l);
        }
        return s;
      }
      return n;
    },
    // @deprecated use $filled instead
    hasSelectedOption: function() {
      return this.$filled;
    },
    label: function() {
      var t = this.findSelectedOptionIndex();
      return t !== -1 ? this.getOptionLabel(this.visibleOptions[t]) : this.placeholder || "p-emptylabel";
    },
    editableInputValue: function() {
      var t = this.findSelectedOptionIndex();
      return t !== -1 ? this.getOptionLabel(this.visibleOptions[t]) : this.d_value || "";
    },
    equalityKey: function() {
      return this.optionValue ? null : this.dataKey;
    },
    searchFields: function() {
      return this.filterFields || [this.optionLabel];
    },
    filterResultMessageText: function() {
      return zt(this.visibleOptions) ? this.filterMessageText.replaceAll("{0}", this.visibleOptions.length) : this.emptyFilterMessageText;
    },
    filterMessageText: function() {
      return this.filterMessage || this.$primevue.config.locale.searchMessage || "";
    },
    emptyFilterMessageText: function() {
      return this.emptyFilterMessage || this.$primevue.config.locale.emptySearchMessage || this.$primevue.config.locale.emptyFilterMessage || "";
    },
    emptyMessageText: function() {
      return this.emptyMessage || this.$primevue.config.locale.emptyMessage || "";
    },
    selectionMessageText: function() {
      return this.selectionMessage || this.$primevue.config.locale.selectionMessage || "";
    },
    emptySelectionMessageText: function() {
      return this.emptySelectionMessage || this.$primevue.config.locale.emptySelectionMessage || "";
    },
    selectedMessageText: function() {
      return this.$filled ? this.selectionMessageText.replaceAll("{0}", "1") : this.emptySelectionMessageText;
    },
    focusedOptionId: function() {
      return this.focusedOptionIndex !== -1 ? "".concat(this.$id, "_").concat(this.focusedOptionIndex) : null;
    },
    ariaSetSize: function() {
      var t = this;
      return this.visibleOptions.filter(function(n) {
        return !t.isOptionGroup(n);
      }).length;
    },
    isClearIconVisible: function() {
      return this.showClear && this.d_value != null && !this.disabled && !this.loading;
    },
    virtualScrollerDisabled: function() {
      return !this.virtualScrollerOptions;
    },
    containerDataP: function() {
      return tt(Nt({
        invalid: this.$invalid,
        disabled: this.disabled,
        focus: this.focused,
        fluid: this.$fluid,
        filled: this.$variant === "filled"
      }, this.size, this.size));
    },
    labelDataP: function() {
      return tt(Nt(Nt({
        placeholder: !this.editable && this.label === this.placeholder,
        clearable: this.showClear,
        disabled: this.disabled,
        editable: this.editable
      }, this.size, this.size), "empty", !this.editable && !this.$slots.value && (this.label === "p-emptylabel" || this.label.length === 0)));
    },
    dropdownIconDataP: function() {
      return tt(Nt({}, this.size, this.size));
    },
    overlayDataP: function() {
      return tt(Nt({}, "portal-" + this.appendTo, "portal-" + this.appendTo));
    }
  },
  directives: {
    ripple: oo
  },
  components: {
    InputText: oi,
    VirtualScroller: si,
    Portal: Fo,
    InputIcon: ti,
    IconField: ei,
    TimesIcon: ro,
    ChevronDownIcon: Jo,
    SpinnerIcon: Dn,
    SearchIcon: Qo,
    CheckIcon: Xo,
    BlankIcon: Yo
  }
}, Sl = ["id", "data-p"], $l = ["name", "id", "value", "placeholder", "tabindex", "disabled", "aria-label", "aria-labelledby", "aria-expanded", "aria-controls", "aria-activedescendant", "aria-invalid", "data-p"], Cl = ["name", "id", "tabindex", "aria-label", "aria-labelledby", "aria-expanded", "aria-controls", "aria-activedescendant", "aria-invalid", "aria-disabled", "data-p"], Il = ["data-p"], _l = ["id"], xl = ["id"], Ol = ["id", "aria-label", "aria-selected", "aria-disabled", "aria-setsize", "aria-posinset", "onMousedown", "onMousemove", "data-p-selected", "data-p-focused", "data-p-disabled"];
function Ll(e, t, n, s, i, l) {
  var p = Oe("SpinnerIcon"), b = Oe("InputText"), v = Oe("SearchIcon"), k = Oe("InputIcon"), S = Oe("IconField"), _ = Oe("CheckIcon"), E = Oe("BlankIcon"), R = Oe("VirtualScroller"), T = Oe("Portal"), N = io("ripple");
  return a(), u("div", W({
    ref: "container",
    id: e.$id,
    class: e.cx("root"),
    onClick: t[12] || (t[12] = function() {
      return l.onContainerClick && l.onContainerClick.apply(l, arguments);
    }),
    "data-p": l.containerDataP
  }, e.ptmi("root")), [e.editable ? (a(), u("input", W({
    key: 0,
    ref: "focusInput",
    name: e.name,
    id: e.labelId || e.inputId,
    type: "text",
    class: [e.cx("label"), e.inputClass, e.labelClass],
    style: [e.inputStyle, e.labelStyle],
    value: l.editableInputValue,
    placeholder: e.placeholder,
    tabindex: e.disabled ? -1 : e.tabindex,
    disabled: e.disabled,
    autocomplete: "off",
    role: "combobox",
    "aria-label": e.ariaLabel,
    "aria-labelledby": e.ariaLabelledby,
    "aria-haspopup": "listbox",
    "aria-expanded": i.overlayVisible,
    "aria-controls": i.overlayVisible ? e.$id + "_list" : void 0,
    "aria-activedescendant": i.focused ? l.focusedOptionId : void 0,
    "aria-invalid": e.invalid || void 0,
    onFocus: t[0] || (t[0] = function() {
      return l.onFocus && l.onFocus.apply(l, arguments);
    }),
    onBlur: t[1] || (t[1] = function() {
      return l.onBlur && l.onBlur.apply(l, arguments);
    }),
    onKeydown: t[2] || (t[2] = function() {
      return l.onKeyDown && l.onKeyDown.apply(l, arguments);
    }),
    onInput: t[3] || (t[3] = function() {
      return l.onEditableInput && l.onEditableInput.apply(l, arguments);
    }),
    "data-p": l.labelDataP
  }, e.ptm("label")), null, 16, $l)) : (a(), u("span", W({
    key: 1,
    ref: "focusInput",
    name: e.name,
    id: e.labelId || e.inputId,
    class: [e.cx("label"), e.inputClass, e.labelClass],
    style: [e.inputStyle, e.labelStyle],
    tabindex: e.disabled ? -1 : e.tabindex,
    role: "combobox",
    "aria-label": e.ariaLabel || (l.label === "p-emptylabel" ? void 0 : l.label),
    "aria-labelledby": e.ariaLabelledby,
    "aria-haspopup": "listbox",
    "aria-expanded": i.overlayVisible,
    "aria-controls": e.$id + "_list",
    "aria-activedescendant": i.focused ? l.focusedOptionId : void 0,
    "aria-invalid": e.invalid || void 0,
    "aria-disabled": e.disabled,
    onFocus: t[4] || (t[4] = function() {
      return l.onFocus && l.onFocus.apply(l, arguments);
    }),
    onBlur: t[5] || (t[5] = function() {
      return l.onBlur && l.onBlur.apply(l, arguments);
    }),
    onKeydown: t[6] || (t[6] = function() {
      return l.onKeyDown && l.onKeyDown.apply(l, arguments);
    }),
    "data-p": l.labelDataP
  }, e.ptm("label")), [ie(e.$slots, "value", {
    value: e.d_value,
    placeholder: e.placeholder
  }, function() {
    var z;
    return [M(c(l.label === "p-emptylabel" ? " " : (z = l.label) !== null && z !== void 0 ? z : "empty"), 1)];
  })], 16, Cl)), l.isClearIconVisible ? ie(e.$slots, "clearicon", {
    key: 2,
    class: ne(e.cx("clearIcon")),
    clearCallback: l.onClearClick
  }, function() {
    return [(a(), ce(hn(e.clearIcon ? "i" : "TimesIcon"), W({
      ref: "clearIcon",
      class: [e.cx("clearIcon"), e.clearIcon],
      onClick: l.onClearClick
    }, e.ptm("clearIcon"), {
      "data-pc-section": "clearicon"
    }), null, 16, ["class", "onClick"]))];
  }) : h("", !0), r("div", W({
    class: e.cx("dropdown")
  }, e.ptm("dropdown")), [e.loading ? ie(e.$slots, "loadingicon", {
    key: 0,
    class: ne(e.cx("loadingIcon"))
  }, function() {
    return [e.loadingIcon ? (a(), u("span", W({
      key: 0,
      class: [e.cx("loadingIcon"), "pi-spin", e.loadingIcon],
      "aria-hidden": "true"
    }, e.ptm("loadingIcon")), null, 16)) : (a(), ce(p, W({
      key: 1,
      class: e.cx("loadingIcon"),
      spin: "",
      "aria-hidden": "true"
    }, e.ptm("loadingIcon")), null, 16, ["class"]))];
  }) : ie(e.$slots, "dropdownicon", {
    key: 1,
    class: ne(e.cx("dropdownIcon"))
  }, function() {
    return [(a(), ce(hn(e.dropdownIcon ? "span" : "ChevronDownIcon"), W({
      class: [e.cx("dropdownIcon"), e.dropdownIcon],
      "aria-hidden": "true",
      "data-p": l.dropdownIconDataP
    }, e.ptm("dropdownIcon")), null, 16, ["class", "data-p"]))];
  })], 16), m(T, {
    appendTo: e.appendTo
  }, {
    default: ee(function() {
      return [m(Ho, W({
        name: "p-anchored-overlay",
        onEnter: l.onOverlayEnter,
        onAfterEnter: l.onOverlayAfterEnter,
        onLeave: l.onOverlayLeave,
        onAfterLeave: l.onOverlayAfterLeave
      }, e.ptm("transition")), {
        default: ee(function() {
          return [i.overlayVisible ? (a(), u("div", W({
            key: 0,
            ref: l.overlayRef,
            class: [e.cx("overlay"), e.panelClass, e.overlayClass],
            style: [e.panelStyle, e.overlayStyle],
            onClick: t[10] || (t[10] = function() {
              return l.onOverlayClick && l.onOverlayClick.apply(l, arguments);
            }),
            onKeydown: t[11] || (t[11] = function() {
              return l.onOverlayKeyDown && l.onOverlayKeyDown.apply(l, arguments);
            }),
            "data-p": l.overlayDataP
          }, e.ptm("overlay")), [r("span", W({
            ref: "firstHiddenFocusableElementOnOverlay",
            role: "presentation",
            "aria-hidden": "true",
            class: "p-hidden-accessible p-hidden-focusable",
            tabindex: 0,
            onFocus: t[7] || (t[7] = function() {
              return l.onFirstHiddenFocus && l.onFirstHiddenFocus.apply(l, arguments);
            })
          }, e.ptm("hiddenFirstFocusableEl"), {
            "data-p-hidden-accessible": !0,
            "data-p-hidden-focusable": !0
          }), null, 16), ie(e.$slots, "header", {
            value: e.d_value,
            options: l.visibleOptions
          }), e.filter ? (a(), u("div", W({
            key: 0,
            class: e.cx("header")
          }, e.ptm("header")), [m(S, {
            unstyled: e.unstyled,
            pt: e.ptm("pcFilterContainer")
          }, {
            default: ee(function() {
              return [m(b, {
                ref: "filterInput",
                type: "text",
                value: i.filterValue,
                onVnodeMounted: l.onFilterUpdated,
                onVnodeUpdated: l.onFilterUpdated,
                class: ne(e.cx("pcFilter")),
                placeholder: e.filterPlaceholder,
                variant: e.variant,
                unstyled: e.unstyled,
                role: "searchbox",
                autocomplete: "off",
                "aria-owns": e.$id + "_list",
                "aria-activedescendant": l.focusedOptionId,
                onKeydown: l.onFilterKeyDown,
                onBlur: l.onFilterBlur,
                onInput: l.onFilterChange,
                pt: e.ptm("pcFilter"),
                formControl: {
                  novalidate: !0
                }
              }, null, 8, ["value", "onVnodeMounted", "onVnodeUpdated", "class", "placeholder", "variant", "unstyled", "aria-owns", "aria-activedescendant", "onKeydown", "onBlur", "onInput", "pt"]), m(k, {
                unstyled: e.unstyled,
                pt: e.ptm("pcFilterIconContainer")
              }, {
                default: ee(function() {
                  return [ie(e.$slots, "filtericon", {}, function() {
                    return [e.filterIcon ? (a(), u("span", W({
                      key: 0,
                      class: e.filterIcon
                    }, e.ptm("filterIcon")), null, 16)) : (a(), ce(v, ji(W({
                      key: 1
                    }, e.ptm("filterIcon"))), null, 16))];
                  })];
                }),
                _: 3
              }, 8, ["unstyled", "pt"])];
            }),
            _: 3
          }, 8, ["unstyled", "pt"]), r("span", W({
            role: "status",
            "aria-live": "polite",
            class: "p-hidden-accessible"
          }, e.ptm("hiddenFilterResult"), {
            "data-p-hidden-accessible": !0
          }), c(l.filterResultMessageText), 17)], 16)) : h("", !0), r("div", W({
            class: e.cx("listContainer"),
            style: {
              "max-height": l.virtualScrollerDisabled ? e.scrollHeight : ""
            }
          }, e.ptm("listContainer")), [m(R, W({
            ref: l.virtualScrollerRef
          }, e.virtualScrollerOptions, {
            items: l.visibleOptions,
            style: {
              height: e.scrollHeight
            },
            tabindex: -1,
            disabled: l.virtualScrollerDisabled,
            pt: e.ptm("virtualScroller")
          }), Hi({
            content: ee(function(z) {
              var K = z.styleClass, H = z.contentRef, P = z.items, B = z.getItemOptions, d = z.contentStyle, Q = z.itemSize;
              return [r("ul", W({
                ref: function(w) {
                  return l.listRef(w, H);
                },
                id: e.$id + "_list",
                class: [e.cx("list"), K],
                style: d,
                role: "listbox"
              }, e.ptm("list")), [(a(!0), u(X, null, se(P, function(f, w) {
                return a(), u(X, {
                  key: l.getOptionRenderKey(f, l.getOptionIndex(w, B))
                }, [l.isOptionGroup(f) ? (a(), u("li", W({
                  key: 0,
                  id: e.$id + "_" + l.getOptionIndex(w, B),
                  style: {
                    height: Q ? Q + "px" : void 0
                  },
                  class: e.cx("optionGroup"),
                  role: "option"
                }, {
                  ref_for: !0
                }, e.ptm("optionGroup")), [ie(e.$slots, "optiongroup", {
                  option: f.optionGroup,
                  index: l.getOptionIndex(w, B)
                }, function() {
                  return [r("span", W({
                    class: e.cx("optionGroupLabel")
                  }, {
                    ref_for: !0
                  }, e.ptm("optionGroupLabel")), c(l.getOptionGroupLabel(f.optionGroup)), 17)];
                })], 16, xl)) : De((a(), u("li", W({
                  key: 1,
                  id: e.$id + "_" + l.getOptionIndex(w, B),
                  class: e.cx("option", {
                    option: f,
                    focusedOption: l.getOptionIndex(w, B)
                  }),
                  style: {
                    height: Q ? Q + "px" : void 0
                  },
                  role: "option",
                  "aria-label": l.getOptionLabel(f),
                  "aria-selected": l.isSelected(f),
                  "aria-disabled": l.isOptionDisabled(f),
                  "aria-setsize": l.ariaSetSize,
                  "aria-posinset": l.getAriaPosInset(l.getOptionIndex(w, B)),
                  onMousedown: function(re) {
                    return l.onOptionSelect(re, f);
                  },
                  onMousemove: function(re) {
                    return l.onOptionMouseMove(re, l.getOptionIndex(w, B));
                  },
                  onClick: t[8] || (t[8] = Ln(function() {
                  }, ["stop"])),
                  "data-p-selected": !e.checkmark && l.isSelected(f),
                  "data-p-focused": i.focusedOptionIndex === l.getOptionIndex(w, B),
                  "data-p-disabled": l.isOptionDisabled(f)
                }, {
                  ref_for: !0
                }, l.getPTItemOptions(f, B, w, "option")), [e.checkmark ? (a(), u(X, {
                  key: 0
                }, [l.isSelected(f) ? (a(), ce(_, W({
                  key: 0,
                  class: e.cx("optionCheckIcon")
                }, {
                  ref_for: !0
                }, e.ptm("optionCheckIcon")), null, 16, ["class"])) : (a(), ce(E, W({
                  key: 1,
                  class: e.cx("optionBlankIcon")
                }, {
                  ref_for: !0
                }, e.ptm("optionBlankIcon")), null, 16, ["class"]))], 64)) : h("", !0), ie(e.$slots, "option", {
                  option: f,
                  selected: l.isSelected(f),
                  index: l.getOptionIndex(w, B)
                }, function() {
                  return [r("span", W({
                    class: e.cx("optionLabel")
                  }, {
                    ref_for: !0
                  }, e.ptm("optionLabel")), c(l.getOptionLabel(f)), 17)];
                })], 16, Ol)), [[N]])], 64);
              }), 128)), i.filterValue && (!P || P && P.length === 0) ? (a(), u("li", W({
                key: 0,
                class: e.cx("emptyMessage"),
                role: "option"
              }, e.ptm("emptyMessage"), {
                "data-p-hidden-accessible": !0
              }), [ie(e.$slots, "emptyfilter", {}, function() {
                return [M(c(l.emptyFilterMessageText), 1)];
              })], 16)) : !e.options || e.options && e.options.length === 0 ? (a(), u("li", W({
                key: 1,
                class: e.cx("emptyMessage"),
                role: "option"
              }, e.ptm("emptyMessage"), {
                "data-p-hidden-accessible": !0
              }), [ie(e.$slots, "empty", {}, function() {
                return [M(c(l.emptyMessageText), 1)];
              })], 16)) : h("", !0)], 16, _l)];
            }),
            _: 2
          }, [e.$slots.loader ? {
            name: "loader",
            fn: ee(function(z) {
              var K = z.options;
              return [ie(e.$slots, "loader", {
                options: K
              })];
            }),
            key: "0"
          } : void 0]), 1040, ["items", "style", "disabled", "pt"])], 16), ie(e.$slots, "footer", {
            value: e.d_value,
            options: l.visibleOptions
          }), !e.options || e.options && e.options.length === 0 ? (a(), u("span", W({
            key: 1,
            role: "status",
            "aria-live": "polite",
            class: "p-hidden-accessible"
          }, e.ptm("hiddenEmptyMessage"), {
            "data-p-hidden-accessible": !0
          }), c(l.emptyMessageText), 17)) : h("", !0), r("span", W({
            role: "status",
            "aria-live": "polite",
            class: "p-hidden-accessible"
          }, e.ptm("hiddenSelectedMessage"), {
            "data-p-hidden-accessible": !0
          }), c(l.selectedMessageText), 17), r("span", W({
            ref: "lastHiddenFocusableElementOnOverlay",
            role: "presentation",
            "aria-hidden": "true",
            class: "p-hidden-accessible p-hidden-focusable",
            tabindex: 0,
            onFocus: t[9] || (t[9] = function() {
              return l.onLastHiddenFocus && l.onLastHiddenFocus.apply(l, arguments);
            })
          }, e.ptm("hiddenLastFocusableEl"), {
            "data-p-hidden-accessible": !0,
            "data-p-hidden-focusable": !0
          }), null, 16)], 16, Il)) : h("", !0)];
        }),
        _: 3
      }, 16, ["onEnter", "onAfterEnter", "onLeave", "onAfterLeave"])];
    }),
    _: 3
  }, 8, ["appendTo"])], 16, Sl);
}
An.render = Ll;
const zl = 2e3;
function Oo(e) {
  const t = e.margin ?? 8, n = e.gap ?? 4, s = Math.max(0, e.viewportWidth), i = Math.max(0, e.viewportHeight), l = Math.max(0, s - t * 2), p = Math.min(Math.max(0, e.requestedWidth), l), b = e.align === "right" ? e.anchor.right - p : e.anchor.left, v = Math.max(t, Math.min(b, s - t - p)), k = Math.max(0, i - e.anchor.bottom - n - t), S = Math.max(0, e.anchor.top - n - t), _ = k < e.requestedMaxHeight && S > k ? "above" : "below", E = _ === "above" ? S : k, R = Math.round(Math.min(Math.max(0, e.requestedMaxHeight), E)), T = Math.min(Math.max(0, e.panelHeight ?? R), R), N = _ === "above" ? e.anchor.top - n - T : e.anchor.bottom + n, z = e.containingBlockOrigin ?? { left: 0, top: 0 };
  return {
    left: Math.round(v - z.left),
    width: Math.round(p),
    maxHeight: R,
    side: _,
    top: Math.round(N - z.top)
  };
}
const ai = /* @__PURE__ */ nn({
  __name: "AnchoredPanel",
  props: {
    open: { type: Boolean },
    anchor: {},
    align: { default: "left" },
    width: { default: "anchor" },
    minWidth: { default: 0 },
    maxHeight: { default: 340 },
    gap: { default: 4 },
    zIndex: { default: zl }
  },
  emits: ["update:open"],
  setup(e, { emit: t }) {
    const n = e, s = t, i = j(null), l = j({ position: "fixed", visibility: "hidden" });
    function p() {
      const N = n.anchor, z = i.value;
      if (!N || !z) return;
      const K = N.getBoundingClientRect(), H = n.width === "anchor" ? Math.max(n.minWidth, K.width) : Math.max(n.minWidth, n.width), P = {
        anchor: K,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
        requestedWidth: H,
        requestedMaxHeight: n.maxHeight,
        align: n.align,
        gap: n.gap
      }, B = Oo(P);
      Object.assign(z.style, {
        position: "fixed",
        left: "0px",
        top: "0px",
        right: "auto",
        bottom: "auto",
        width: `${B.width}px`,
        maxHeight: `${B.maxHeight}px`,
        visibility: "hidden"
      });
      const d = z.getBoundingClientRect(), Q = Oo({
        ...P,
        containingBlockOrigin: { left: d.left, top: d.top },
        panelHeight: d.height
      }), f = {
        position: "fixed",
        left: `${Q.left}px`,
        top: `${Q.top}px`,
        width: `${Q.width}px`,
        maxHeight: `${Q.maxHeight}px`,
        "--anchored-panel-available-height": `${Q.maxHeight}px`,
        margin: "0",
        zIndex: String(n.zIndex),
        visibility: "visible"
      };
      l.value = f;
    }
    let b = null, v = !1;
    function k() {
      v || !n.open || (v = !0, requestAnimationFrame(() => {
        v = !1, n.open && p();
      }));
    }
    function S() {
      typeof ResizeObserver > "u" || (b = new ResizeObserver(k), i.value && b.observe(i.value), n.anchor && b.observe(n.anchor));
    }
    function _() {
      b?.disconnect(), b = null, v = !1;
    }
    Ne(() => n.open, async (N) => {
      _(), N && (l.value = { position: "fixed", visibility: "hidden" }, await bn(), p(), S());
    }, { immediate: !0 });
    function E(N) {
      if (!n.open) return;
      const z = N.composedPath();
      i.value && z.includes(i.value) || n.anchor && z.includes(n.anchor) || s("update:open", !1);
    }
    function R(N) {
      n.open && N.key === "Escape" && s("update:open", !1);
    }
    function T() {
      n.open && p();
    }
    return document.addEventListener("click", E), document.addEventListener("keydown", R), window.addEventListener("resize", T), window.addEventListener("scroll", T, !0), Uo(() => {
      _(), document.removeEventListener("click", E), document.removeEventListener("keydown", R), window.removeEventListener("resize", T), window.removeEventListener("scroll", T, !0);
    }), (N, z) => e.open ? (a(), u("div", {
      key: 0,
      ref_key: "panel",
      ref: i,
      class: "anchored-panel",
      style: qt(l.value)
    }, [
      ie(N.$slots, "default")
    ], 4)) : h("", !0);
  }
});
function Al(e) {
  if (!e) return null;
  let t;
  if (typeof e == "number")
    t = e;
  else {
    const n = e.trim();
    if (/^\d+$/.test(n))
      t = Number(n);
    else {
      const s = Date.parse(n);
      return Number.isNaN(s) ? null : s;
    }
  }
  return Number.isFinite(t) ? t < 1e12 ? t * 1e3 : t : null;
}
function Vn(e, t) {
  const n = Al(e);
  if (n === null) return "";
  const s = t?.now ?? Date.now(), i = t?.suffix ?? !0, l = t?.maxUnit ?? "day", p = t?.future ?? !1, b = 6e4, v = 60 * b, k = 24 * v, S = 30 * k, _ = 365 * k, E = s - n;
  if (p && E < 0) {
    const N = -E;
    return N < b ? "in <1m" : N < v ? `in ${Math.floor(N / b)}m` : N < k ? `in ${Math.floor(N / v)}h` : `in ${Math.floor(N / k)}d`;
  }
  const R = Math.max(0, E);
  if (R < b) return "just now";
  const T = i ? " ago" : "";
  return R < v ? `${Math.floor(R / b)}m${T}` : R < k ? `${Math.floor(R / v)}h${T}` : l === "year" ? R < S ? `${Math.floor(R / k)}d${T}` : R < _ ? `${Math.floor(R / S)}mo${T}` : `${Math.floor(R / _)}y${T}` : `${Math.floor(R / k)}d${T}`;
}
const Qn = {
  tool: { label: "Tools", icon: "tabler:tool" },
  "agent.trait": { label: "Agent capabilities", icon: "tabler:robot" },
  "contract.binding": { label: "Contract bindings", icon: "tabler:plug-connected" },
  "contract.definition": { label: "Contracts", icon: "tabler:file-description" },
  "view.page": { label: "Pages", icon: "tabler:browser" },
  "view.component": { label: "Components", icon: "tabler:components" }
};
function Pl(e) {
  const t = e.meta?.type || "";
  return t && Qn[t] ? t : e.kind;
}
function Ml(e) {
  return String(e.id).split(":").pop() || e.id;
}
function El(e) {
  const t = e.meta || {};
  return String(t.comment || t.title || "");
}
function Tl(e, t) {
  return String(e.meta?.icon || t);
}
function nt(e, t) {
  const n = t instanceof Error ? t.message : String(t);
  console.error(`[${e}]`, n, t);
}
function eo() {
  window.dispatchEvent(new CustomEvent("kickside:modules-changed")), window.dispatchEvent(new CustomEvent("kickside:nav-changed"));
}
function Fl(e) {
  const t = /* @__PURE__ */ new Map();
  for (const n of e.dependencies || []) {
    const s = String(n.component || n.name || n.id || "");
    s && t.set(s, {
      ...n,
      dependencyId: n.id,
      component: s,
      is_root: n.is_root ?? !0,
      used_by: n.used_by || [],
      used_by_count: n.used_by_count || 0,
      source: n.source || "hub"
    });
  }
  for (const n of e.modules || []) {
    const s = String(n.name || "");
    if (!s) continue;
    const i = t.get(s);
    if (i)
      t.set(s, {
        ...i,
        version: i.version || n.version || "",
        is_root: i.is_root ?? n.is_root ?? !n.transitive,
        used_by: i.used_by || n.used_by || [],
        used_by_count: i.used_by_count ?? n.used_by_count ?? 0,
        source: i.source || n.source || "hub"
      });
    else {
      const l = n.used_by || [], p = n.used_by_count || l.length || 0;
      if (n.is_root !== !0 && n.transitive === !0 && p === 0) continue;
      const b = s.split("/");
      t.set(s, {
        id: s,
        namespace: b.length > 1 ? b[0] : "",
        name: b[b.length - 1] || s,
        component: s,
        version: n.version || "",
        is_root: n.is_root ?? !n.transitive,
        used_by: l,
        used_by_count: p,
        source: n.source || "local"
      });
    }
  }
  return Array.from(t.values()).filter((n) => n.installed !== !1);
}
function Lo(e) {
  const t = e.migrations || [];
  if (t.length === 0) return "";
  const n = t.filter((l) => l.status === "applied").length, s = t.filter((l) => l.status === "pending").length, i = [];
  return n > 0 && i.push(`${n} applied`), s > 0 && i.push(`${s} pending`), i.join(", ") || `${t.length} migrations`;
}
function Vl({ hub: e, installed: t, catalog: n, installedDepFor: s, installedCanUpdate: i, installedUpdateDisabledReason: l, installedCanUninstall: p, installedIsPrivate: b }) {
  const v = j(null), k = j(null), S = j(""), _ = j([]), E = j(!1), R = j("readme"), T = j([]), N = q(() => _.value.filter((L) => L.kind === "env.variable")), z = q(() => _.value.filter((L) => L.kind === "ns.requirement")), K = q(() => {
    const L = {};
    for (const F of _.value) {
      if (F.kind === "env.variable" || F.kind === "ns.requirement") continue;
      const J = Pl(F);
      (L[J] ||= []).push(F);
    }
    return Object.entries(L).map(([F, J]) => ({
      key: F,
      label: Qn[F]?.label || F,
      icon: Qn[F]?.icon || "tabler:point",
      items: J
    })).sort((F, J) => J.items.length - F.items.length);
  }), H = q(() => T.value.find((L) => L.version === v.value?.version) || T.value[0]), P = q(() => v.value ? s(v.value.component) : void 0), B = q(() => !!(P.value && i(P.value))), d = q(() => P.value && !i(P.value) ? l(P.value) : ""), Q = q(() => !!(P.value && p(P.value))), f = q(() => pn(k.value) || !!(P.value && b(P.value)));
  async function w(L) {
    try {
      const F = t.value.find((oe) => oe.component === L);
      return F?.entries ? F.entries : ((await e.listDependencies({ component: L, includeMigrations: !1 })).dependencies || []).find((oe) => oe.component === L)?.entries || [];
    } catch (F) {
      return nt("modules:entries", F), [];
    }
  }
  async function A(L, F) {
    if (F && F.full_name) return F;
    const J = n.value.find((te) => En(te, L));
    if (J) return J;
    try {
      const te = L.split("/").pop() || L, me = ((await e.browseModules({ query: te, pageSize: 50 })).items || []).find((Ae) => En(Ae, L));
      if (me) return me;
    } catch {
    }
    return { full_name: L, component: L, latest_version: "", type: "library" };
  }
  async function re(L) {
    const F = "component" in L && typeof L.component == "string" && !("full_name" in L) ? L.component : Mn(L), J = s(F), te = "full_name" in L ? L : void 0;
    v.value = {
      component: F,
      label: te ? en(te) : F,
      description: te?.description || "",
      version: J ? ft(J) : String(te?.latest_version || ""),
      installed: !!J,
      installedId: J?.id
    }, k.value = te || null, S.value = "", _.value = [], T.value = [], R.value = "readme", E.value = !0;
    try {
      const [oe, me, Ae, ge] = await Promise.all([
        A(F, te),
        e.getReadme(F).then((Ke) => Ke.content || "").catch(() => ""),
        J ? w(F) : Promise.resolve([]),
        e.listVersions(F).then((Ke) => Ke.items || []).catch(() => [])
      ]);
      k.value = oe, S.value = me, _.value = Ae, T.value = ge, v.value && (v.value = {
        ...v.value,
        label: en(oe),
        description: oe.description || v.value.description,
        version: J ? ft(J) : String(oe.latest_version || v.value.version)
      }), me || (R.value = "overview");
    } finally {
      E.value = !1;
    }
  }
  function g() {
    v.value = null;
  }
  async function I() {
    if (!v.value) return;
    const L = v.value.component, F = s(L);
    v.value = {
      ...v.value,
      installed: !!F,
      installedId: F?.id,
      version: F ? ft(F) : v.value.version
    }, _.value = F ? await w(L) : [];
  }
  return {
    selected: v,
    selectedModule: k,
    detailReadme: S,
    detailEntries: _,
    detailLoading: E,
    detailTab: R,
    detailVersions: T,
    envVars: N,
    requirements: z,
    detailGroups: K,
    versionMeta: H,
    selectedInstalledDep: P,
    selectedCanUpdate: B,
    selectedUpdateDisabledReason: d,
    selectedCanUninstall: Q,
    selectedIsPrivate: f,
    loadEntriesFor: w,
    findModule: A,
    openDetail: re,
    closeDetail: g,
    refreshSelectedDetail: I
  };
}
const Dl = [
  { until: 1e3, label: "Planning uninstall" },
  { until: 4e3, label: "Stopping services" },
  { until: 6e3, label: "Removing entries" },
  { until: 8e3, label: "Updating lock" },
  { until: 1 / 0, label: "Finalizing" }
];
function Bl(e, t) {
  const n = j(0);
  let s = 0, i = null;
  function l() {
    i && (clearInterval(i), i = null);
  }
  Ne(e, (v) => {
    l(), v ? (s = Date.now(), n.value = 0, i = setInterval(() => {
      n.value = Date.now() - s;
    }, 200)) : n.value = 0;
  }), so(l);
  const p = q(() => t.find((v) => n.value < v.until)?.label || t[t.length - 1].label), b = q(() => Math.floor(n.value / 1e3));
  return { phase: p, elapsedSec: b };
}
function Rl({ hub: e, selected: t, selectedInstalledDep: n, installedIsRoot: s, installedUninstallDisabledReason: i, installedCanUninstall: l, refreshAll: p, refreshSelectedDetail: b, showToast: v, notifyModulesChanged: k }) {
  const S = j(!1), _ = j(null), E = j("block"), R = j(!1), T = j(!1), N = j(null), z = j([]), K = j(null), H = j(null), P = j([]), { phase: B, elapsedSec: d } = Bl(R, Dl), Q = q(() => {
    const I = n.value;
    return !t.value?.installed || !I || s(I) ? "" : i(I);
  }), f = q(() => _.value ? R.value ? "Uninstall is running." : T.value ? "Waiting for uninstall preview to finish." : P.value.length > 0 ? `Still required by: ${P.value.join(", ")}. Uninstall those root modules first.` : K.value === "MIGRATIONS_APPLIED" ? 'Applied migrations exist. Choose "Leave applied migrations" or "Revert (down)", then preview again.' : H.value && !N.value ? H.value : N.value ? "" : "Run Preview first so Keeper can show what will be removed." : ""), w = q(() => _.value ? R.value ? "Uninstall is running." : T.value ? "Waiting for uninstall preview to finish." : P.value.length > 0 ? `Still required by: ${P.value.join(", ")}. Uninstall those root modules first.` : K.value === "MIGRATIONS_APPLIED" ? 'Applied migrations exist. Choose "Leave applied migrations" or "Revert (down)", then preview again.' : "" : "No module selected.");
  async function A(I) {
    l(I) && (_.value = I, E.value = "block", K.value = null, H.value = null, P.value = [], N.value = null, z.value = [], S.value = !0, re());
  }
  async function re() {
    const I = _.value;
    if (I) {
      T.value = !0, K.value = null, H.value = null, P.value = [], N.value = null, z.value = [];
      try {
        const L = await e.uninstall({ id: I.id, component: I.component, dry_run: !0, migration_policy: E.value });
        N.value = L.preview || L.payload?.preview || null, N.value || (H.value = "Uninstall preview returned no preview data.");
      } catch (L) {
        if (nt("modules:uninstall-preview", L), L instanceof Kt && (K.value = L.code, P.value = po(L.details), L.code === "NOT_FOUND")) {
          S.value = !1, _.value = null, v("ok", "Module already removed; refreshed installed modules"), await p(), await b();
          return;
        }
        H.value = ze(L, "uninstall preview failed");
      } finally {
        T.value = !1;
      }
    }
  }
  async function g() {
    const I = _.value;
    if (!(!I || w.value)) {
      R.value = !0, K.value = null, H.value = null, z.value = [];
      try {
        const L = await e.uninstall({ id: I.id, component: I.component, migration_policy: E.value });
        z.value = Un(L), v("ok", `Module uninstalled: ${I.id}`), k(), await p(), await b();
      } catch (L) {
        if (nt("modules:uninstall", L), L instanceof Kt && (K.value = L.code, P.value = po(L.details), z.value = Un(L.details), L.code === "NOT_FOUND")) {
          S.value = !1, _.value = null, v("ok", "Module already removed; refreshed installed modules"), await p(), await b();
          return;
        }
        H.value = ze(L, "uninstall failed");
      } finally {
        R.value = !1;
      }
    }
  }
  return Ne(E, () => {
    S.value && _.value && !R.value && re();
  }), {
    uninstallDialogOpen: S,
    uninstallDep: _,
    uninstallPolicy: E,
    uninstallRunning: R,
    uninstallPreviewLoading: T,
    uninstallPreview: N,
    uninstallExecution: z,
    uninstallCode: K,
    uninstallError: H,
    uninstallRequiredBy: P,
    uninstallPhase: B,
    uninstallElapsedSec: d,
    selectedUninstallBlockedReason: Q,
    uninstallBlockedReason: f,
    uninstallActionBlockedReason: w,
    openUninstallDialog: A,
    previewUninstall: re,
    runUninstall: g
  };
}
function jl({ hub: e, installed: t, installedError: n, installedCanUpdate: s, installedIsRoot: i, showToast: l, notifyModulesChanged: p, refreshAll: b, refreshSelectedDetail: v }) {
  const k = j({}), S = j(!1), _ = j(!1), E = q(() => t.value.filter((g) => {
    const I = H(g);
    return s(g) && i(g) && I && ["available", "failed", "blocked", "skipped"].includes(I.status) && z(I.latestVersion, ft(g));
  }));
  function R(g) {
    return (String(g || "").trim().replace(/^[^\d]*/, "").match(/\d+(?:\.\d+)*/)?.[0] || "").split(".").filter(Boolean).map(Number);
  }
  function T(g, I) {
    const L = R(g), F = R(I), J = Math.max(L.length, F.length);
    for (let te = 0; te < J; te++) {
      const oe = L[te] || 0, me = F[te] || 0;
      if (oe !== me) return oe > me ? 1 : -1;
    }
    return String(g || "").localeCompare(String(I || ""));
  }
  function N(g = []) {
    const I = g.find((L) => L.is_latest) || g[0];
    return String(I?.version || "");
  }
  function z(g, I) {
    return !!(g && I && g !== I && T(g, I) > 0);
  }
  function K(g) {
    const I = String(g || "").trim().replace(/^[>=<~^]+v?/, "");
    return I ? `>=${I}` : ">=v0.0.0";
  }
  function H(g) {
    return g?.component && k.value[g.component] || null;
  }
  function P(g, I) {
    const L = k.value[g];
    k.value = {
      ...k.value,
      [g]: {
        component: g,
        currentVersion: I.currentVersion ?? L?.currentVersion ?? "",
        latestVersion: I.latestVersion ?? L?.latestVersion ?? "",
        status: I.status ?? L?.status ?? "current",
        message: I.message
      }
    };
  }
  function B(g) {
    const I = H(g);
    return I ? I.status === "available" ? `${I.currentVersion || "?"} → ${I.latestVersion || "?"}` : I.status === "queued" ? "queued" : I.status === "skipped" ? "skipped" : I.status === "planning" ? "planning" : I.status === "updating" ? "updating" : I.status === "updated" ? "updated" : I.status === "blocked" ? "blocked" : I.status === "failed" ? "failed" : "" : "";
  }
  function d(g) {
    const I = H(g)?.status;
    return I === "planning" || I === "updating" ? "tabler:loader-2" : I === "updated" ? "tabler:check" : I === "queued" ? "tabler:clock" : I === "skipped" ? "tabler:player-skip-forward" : I === "blocked" ? "tabler:lock" : I === "failed" ? "tabler:alert-triangle" : "tabler:arrow-up-circle";
  }
  function Q(g) {
    const I = H(g)?.status;
    return I === "planning" || I === "updating";
  }
  async function f() {
    if (!e || S.value) return;
    S.value = !0, n.value = null;
    const g = {};
    let I = 0, L = 0;
    try {
      for (const F of t.value) {
        if (!s(F) || !i(F)) continue;
        const J = ft(F);
        try {
          const te = await e.listVersions(F.component), oe = N(te.items), me = z(oe, J) ? "available" : "current";
          me === "available" && I++, g[F.component] = { component: F.component, currentVersion: J, latestVersion: oe, status: me }, k.value = { ...g };
        } catch (te) {
          L++, g[F.component] = {
            component: F.component,
            currentVersion: J,
            latestVersion: "",
            status: "failed",
            message: ze(te, "version scan failed")
          }, k.value = { ...g };
        }
      }
      l("ok", `Found ${I} update${I === 1 ? "" : "s"}${L ? `, ${L} failed` : ""}`);
    } finally {
      S.value = !1;
    }
  }
  async function w(g, I) {
    P(g, { status: "planning", message: void 0 });
    try {
      const L = await e.planInstall({ component: g, version: I, run_migrations: !0 }), F = L.missing_requirements || [];
      if (F.length) {
        const J = `Missing required settings: ${F.join(", ")}`;
        return P(g, { status: "blocked", message: J }), null;
      }
      return L;
    } catch (L) {
      const F = ze(L, "update plan failed");
      return P(g, { status: "failed", message: F }), null;
    }
  }
  async function A(g) {
    if (!e || !g.component) return !1;
    let I = H(g);
    if (!I) {
      const L = ft(g);
      try {
        const F = await e.listVersions(g.component), J = N(F.items);
        I = {
          component: g.component,
          currentVersion: L,
          latestVersion: J,
          status: z(J, L) ? "available" : "current"
        }, P(g.component, I);
      } catch (F) {
        return P(g.component, { status: "failed", message: ze(F, "version scan failed") }), !1;
      }
    }
    if (!I.latestVersion || !z(I.latestVersion, ft(g))) return !0;
    try {
      const L = K(I.latestVersion), F = await w(g.component, L);
      if (!F) return !1;
      const J = e.install({
        ...F.install_payload,
        component: g.component,
        version: L,
        run_migrations: !0,
        migration_policy: "up"
      });
      return P(g.component, { status: "updating" }), await J, P(g.component, {
        status: "updated",
        currentVersion: I.latestVersion,
        latestVersion: I.latestVersion,
        message: void 0
      }), p(), !0;
    } catch (L) {
      return P(g.component, { status: "failed", message: ze(L, "update failed") }), !1;
    }
  }
  async function re() {
    if (_.value || E.value.length === 0) return;
    _.value = !0;
    const g = [...E.value];
    try {
      for (const F of g) P(F.component, { status: "planning" });
      const I = await e.planBatchInstall({
        dependencies: g.map((F) => ({
          id: F.dependencyId,
          component: F.component,
          version: K(H(F).latestVersion)
        })),
        run_migrations: !0,
        migration_policy: "up"
      }), L = /* @__PURE__ */ new Map();
      for (const F of I.plans) {
        const J = F.missing_requirements || [], te = (F.requirements || []).filter((oe) => oe.invalid).map((oe) => `${oe.id || oe.parameter_name}: ${oe.invalid_reason || "invalid value"}`);
        if (F.applicable === !1 || J.length || te.length) {
          const oe = [
            J.length ? `Missing required settings: ${J.join(", ")}` : "",
            te.length ? `Invalid settings: ${te.join(", ")}` : ""
          ].filter(Boolean).join(". ") || "Update plan cannot be applied";
          L.set(F.dependency?.component || "Unknown module", oe);
        }
      }
      if (!I.applicable || L.size) {
        for (const F of g) P(F.component, {
          status: L.has(F.component) ? "blocked" : "skipped",
          message: L.get(F.component) || "Batch not applied because its plan is blocked"
        });
        l("error", L.size ? [...L].map(([F, J]) => `${F}: ${J}`).join("; ") : "Update plan cannot be applied. No modules were changed.");
        return;
      }
      if (!I.install_payload?.dependencies?.length) throw new Error("Update plan returned no install payload");
      for (const F of g) P(F.component, { status: "updating" });
      await e.install(I.install_payload);
      for (const F of g) P(F.component, { status: "updated" });
      p(), l("ok", `Updated ${g.length} module${g.length === 1 ? "" : "s"}`);
    } catch (I) {
      const L = ze(I, "update failed");
      for (const F of g) P(F.component, { status: "failed", message: L });
      l("error", L);
    } finally {
      try {
        await b(), await v();
      } catch (I) {
        l("error", `Module status could not be refreshed: ${ze(I, "refresh failed")}`);
      } finally {
        _.value = !1;
      }
    }
  }
  return {
    updateScan: k,
    updateScanLoading: S,
    updateAllRunning: _,
    availableUpdates: E,
    updateInfoForDep: H,
    updateStatusLabel: B,
    updateStatusIcon: d,
    updateStatusBusy: Q,
    scanInstalledUpdates: f,
    updateInstalledDependency: A,
    updateAllAvailable: re
  };
}
function Hl({ hub: e, loadCatalog: t }) {
  const n = j(!1), s = j(!1), i = j(!1), l = j(!1), p = j(null), b = j(""), v = j(!1), k = j(!1), S = j(null), _ = q(() => p.value?.orgs || []), E = q(() => p.value?.username || p.value?.user_id || ""), R = q(() => !!p.value?.authenticated), T = q(() => !!(p.value?.authenticated && p.value?.expired)), N = q(() => i.value ? "tabler:key" : T.value ? "tabler:alert-triangle" : "tabler:key-off"), z = q(() => i.value ? "Hub token set" : T.value ? "Hub token expired" : "Set Hub token"), K = q(() => {
    const f = p.value?.expires_at;
    if (!f) return "";
    const w = new Date(f);
    return isNaN(w.getTime()) ? "" : w.toLocaleDateString();
  });
  function H(f) {
    p.value = f?.authenticated ? f : null;
    const w = fo(f);
    i.value = w, l.value = w;
  }
  async function P() {
    try {
      const { data: f } = await lo.get("/api/v1/user/me");
      n.value = !!(f?.success && f?.security?.is_admin);
    } catch (f) {
      nt("modules:auth", f), n.value = !1;
    } finally {
      s.value = !0;
    }
  }
  async function B() {
    try {
      const f = await e.authStatus();
      H(f);
    } catch (f) {
      nt("modules:hub-auth", f);
    }
  }
  async function d() {
    const f = b.value.trim();
    if (!f) {
      S.value = "Paste a Hub token first.";
      return;
    }
    S.value = null, k.value = !0;
    try {
      const w = await e.authenticate(f);
      H(w), fo(w) ? (b.value = "", v.value = !1, await t()) : S.value = "That token is invalid or expired.";
    } catch (w) {
      S.value = ze(w, "failed to save Hub token");
    } finally {
      k.value = !1;
    }
  }
  async function Q() {
    S.value = null;
    try {
      await e.logout();
    } catch (f) {
      S.value = ze(f, "failed to clear Hub token");
      return;
    }
    H(null), await t();
  }
  return {
    isAdmin: n,
    authLoaded: s,
    hubConnected: i,
    hubUsable: l,
    hubStatus: p,
    hubToken: b,
    showTokenPanel: v,
    hubConnecting: k,
    hubError: S,
    hubOrgs: _,
    hubIdentity: E,
    hubTokenStored: R,
    hubTokenExpired: T,
    hubTokenIcon: N,
    hubTokenButtonLabel: z,
    hubExpiry: K,
    applyHubAuthStatus: H,
    loadAuth: P,
    loadHubAuth: B,
    saveHubToken: d,
    clearHubToken: Q
  };
}
const Ul = ["kickside", "kickside-plugin"], zo = "kickside", Nl = "https://portal.wippy.ai/account/tokens", Kl = [
  { label: "Block if any applied", value: "block" },
  { label: "Leave applied migrations", value: "leave" },
  { label: "Revert (down) - may lose data", value: "down" }
];
function ql() {
  const e = jo(lo), t = j(!0), n = j(null), s = Hl({ hub: e, loadCatalog: xn }), {
    isAdmin: i,
    authLoaded: l,
    hubConnected: p,
    hubUsable: b,
    hubStatus: v,
    hubToken: k,
    showTokenPanel: S,
    hubConnecting: _,
    hubError: E,
    hubOrgs: R,
    hubIdentity: T,
    hubTokenStored: N,
    hubTokenExpired: z,
    hubTokenIcon: K,
    hubTokenButtonLabel: H,
    hubExpiry: P,
    loadAuth: B,
    loadHubAuth: d,
    saveHubToken: Q,
    clearHubToken: f
  } = s, w = j([]), A = j(""), re = j("all"), g = j(!1), I = j(null), L = j(!0), F = j([]), J = j(!1), te = j(null), oe = j(""), me = j("downloads"), Ae = Vl({
    hub: e,
    installed: w,
    catalog: F,
    installedDepFor: _e,
    installedCanUpdate: St,
    installedUpdateDisabledReason: Yt,
    installedCanUninstall: Ot,
    installedIsPrivate: xt
  }), {
    selected: ge,
    selectedModule: Ke,
    detailReadme: Be,
    detailEntries: ht,
    detailLoading: qe,
    detailTab: bt,
    detailVersions: Mt,
    envVars: Et,
    requirements: Se,
    detailGroups: Gt,
    versionMeta: ot,
    selectedInstalledDep: Ge,
    selectedCanUpdate: vt,
    selectedUpdateDisabledReason: it,
    selectedCanUninstall: We,
    selectedIsPrivate: Re,
    openDetail: Te,
    closeDetail: $e,
    refreshSelectedDetail: Ze
  } = Ae, Ye = Rl({
    hub: e,
    selected: ge,
    selectedInstalledDep: Ge,
    installedIsRoot: Ie,
    installedUninstallDisabledReason: Zt,
    installedCanUninstall: Ot,
    refreshAll: Ht,
    refreshSelectedDetail: Ze,
    showToast: O,
    notifyModulesChanged: eo
  }), {
    uninstallDialogOpen: Tt,
    uninstallDep: st,
    uninstallPolicy: Xe,
    uninstallRunning: je,
    uninstallPreviewLoading: Ft,
    uninstallPreview: $,
    uninstallExecution: x,
    uninstallCode: D,
    uninstallError: U,
    uninstallRequiredBy: Z,
    uninstallPhase: Y,
    uninstallElapsedSec: de,
    selectedUninstallBlockedReason: ke,
    uninstallBlockedReason: at,
    uninstallActionBlockedReason: Vt,
    openUninstallDialog: fe,
    previewUninstall: Fe,
    runUninstall: lt
  } = Ye, gt = jl({
    hub: e,
    installed: w,
    installedError: I,
    installedCanUpdate: St,
    installedIsRoot: Ie,
    showToast: O,
    notifyModulesChanged: eo,
    refreshAll: Ht,
    refreshSelectedDetail: Ze
  }), {
    updateScanLoading: yt,
    updateAllRunning: ve,
    availableUpdates: Pe,
    updateInfoForDep: rt,
    updateStatusLabel: Je,
    updateStatusIcon: on,
    updateStatusBusy: Dt,
    scanInstalledUpdates: Ct,
    updateInstalledDependency: Ve,
    updateAllAvailable: He
  } = gt, kt = q(() => {
    const V = /* @__PURE__ */ new Set();
    for (const ae of w.value)
      if (ae.installed !== !1)
        for (const Ut of mo(ae)) V.add(Ut);
    return V;
  }), wt = q(() => Ii(F.value, oe.value)), we = q(() => wt.value.filter((V) => !$t(V))), ut = q(() => oe.value.trim() || we.value.length < 7 ? [] : [...we.value].sort((V, ae) => (ae.total_downloads || 0) - (V.total_downloads || 0)).slice(0, 6)), sn = q(() => new Set(ut.value.map(Tn))), It = q(() => _i(we.value.filter((V) => !sn.value.has(Tn(V))), me.value)), dt = q(() => w.value.filter((V) => V.installed !== !1).length), ct = q(() => {
    const V = A.value.trim().toLowerCase(), ae = re.value, Ut = w.value.filter((Me) => Me.installed === !1 || ae === "root" && !Ie(Me) || ae === "transitive" && Ie(Me) || ae === "local" && Me.source !== "local" ? !1 : V ? [
      Me.component,
      Me.id,
      Me.name,
      Me.namespace,
      Me.version,
      Me.source,
      Rt(Me),
      jt(Me),
      Lo(Me),
      ft(Me)
    ].filter(Boolean).join(" ").toLowerCase().includes(V) : !0);
    return xi(Ut, Ce);
  }), Qe = q(() => w.value.filter((V) => V.installed !== !1 && !!Ce(V.component)).length), ye = q(() => ct.value.filter((V) => !!Ce(V.component)).length), et = q(() => l.value && !i.value), be = j(null), Wt = q(() => be.value !== null);
  function Ce(V) {
    return F.value.find((ae) => En(ae, V));
  }
  function _t(V) {
    return fn({ full_name: V.component });
  }
  function Bt(V) {
    const ae = Ce(V.component);
    return ae ? tn(ae) : "tabler:package";
  }
  function xt(V) {
    return pn(Ce(V.component)) || pn(V);
  }
  function Ie(V) {
    return Oi(V || {});
  }
  function Rt(V) {
    return Li(V);
  }
  function jt(V) {
    return zi(V);
  }
  function Zt(V) {
    if (Ie(V)) return "";
    const ae = jt(V);
    return ae ? `Installed as a dependency; ${ae}` : "Installed as a dependency of another module";
  }
  function St(V) {
    return !!(V?.component && V.source !== "local");
  }
  function Yt(V) {
    return V.source === "local" ? "Local replacement; update from source" : "No Hub dependency update action available";
  }
  function Ot(V) {
    return !!(V && Ie(V));
  }
  function $t(V) {
    return mo(V).some((ae) => kt.value.has(ae));
  }
  function _e(V) {
    return w.value.find((ae) => En(ae, V));
  }
  function O(V, ae) {
    const Ut = Ko?.toast;
    typeof Ut == "function" ? Ut({ severity: V === "ok" ? "success" : "error", summary: ae }) : (n.value = { kind: V, message: ae }, setTimeout(() => {
      n.value?.message === ae && (n.value = null);
    }, 5e3));
  }
  function y() {
    ge.value && G({
      full_name: ge.value.component,
      latest_version: ge.value.version,
      description: ge.value.description
    });
  }
  function Ue() {
    const V = ge.value && _e(ge.value.component);
    V && St(V) && he(V);
  }
  function Bn() {
    const V = ge.value && _e(ge.value.component);
    V && Ot(V) && fe(V);
  }
  async function Rn() {
    g.value = !0, I.value = null;
    try {
      w.value = Fl(await e.listDependencies());
    } catch (V) {
      w.value = [], nt("modules:listDependencies", V), I.value = ze(V, "dependency graph unavailable");
    }
    g.value = !1;
  }
  async function xn() {
    J.value = !0, te.value = null;
    try {
      F.value = (await e.fetchAllByKeyword(Ul)).filter(Pi);
    } catch (V) {
      nt("modules:catalog", V), V instanceof Kt && (V.code === "UNAUTHORIZED" || V.code === "FORBIDDEN") ? b.value = !1 : te.value = ze(V, `failed to load ${zo} catalog`);
    } finally {
      J.value = !1;
    }
  }
  async function Ht() {
    await Promise.all([Rn(), xn()]);
  }
  function G(V) {
    const ae = Mn(V);
    be.value = {
      mode: "install",
      component: ae,
      version: V.latest_version ? String(V.latest_version) : "",
      currentId: null,
      catalogItem: Ce(ae) || V,
      installedDep: null
    };
  }
  function he(V) {
    St(V) && (be.value = {
      mode: "update",
      component: V.component,
      // Let the dialog load and select the newest published release. Seeding
      // this with the resolved version re-submits the current package while
      // presenting the operation as an update.
      version: "",
      currentId: V.dependencyId || null,
      catalogItem: Ce(V.component) || null,
      installedDep: V
    });
  }
  function pe() {
    be.value = null;
  }
  async function xe() {
    await Ht(), await Ze(), pe();
  }
  return ao(() => {
    No("wc-render-markdown", { timeoutMs: 8e3 }).catch(() => {
    });
  }), Ai(async () => {
    try {
      if (await B(), !i.value) return;
      await d(), await Ht();
    } finally {
      t.value = !1;
    }
  }), {
    LABEL: zo,
    HUB_PORTAL: Nl,
    UNINSTALL_MIGRATION_OPTIONS: Kl,
    initialLoading: t,
    accessDenied: et,
    statusBanner: n,
    hubConnected: p,
    hubStatus: v,
    hubToken: k,
    showTokenPanel: S,
    hubConnecting: _,
    hubError: E,
    hubOrgs: R,
    hubIdentity: T,
    hubTokenStored: N,
    hubTokenExpired: z,
    hubTokenIcon: K,
    hubTokenButtonLabel: H,
    hubExpiry: P,
    selected: ge,
    selectedModule: Ke,
    detailReadme: Be,
    detailEntries: ht,
    detailLoading: qe,
    detailTab: bt,
    detailVersions: Mt,
    envVars: Et,
    requirements: Se,
    detailGroups: Gt,
    versionMeta: ot,
    selectedCanUpdate: vt,
    selectedUpdateDisabledReason: it,
    selectedCanUninstall: We,
    selectedIsPrivate: Re,
    selectedUninstallBlockedReason: ke,
    entryName: Ml,
    entryDesc: El,
    entryIcon: Tl,
    installed: w,
    installedFilter: A,
    installedKindFilter: re,
    installedTotal: dt,
    updateScanLoading: yt,
    updateAllRunning: ve,
    availableUpdates: Pe,
    installedLoading: g,
    installedError: I,
    installedOpen: L,
    catalog: F,
    catalogLoading: J,
    catalogError: te,
    catalogInstalledTotal: Qe,
    visibleCatalogInstalled: ye,
    browseFilter: oe,
    sortBy: me,
    availableItems: we,
    featured: ut,
    sortedItems: It,
    visibleInstalled: ct,
    catalogItemFor: Ce,
    installedAccent: _t,
    installedIcon: Bt,
    installedIsPrivate: xt,
    installedIsRoot: Ie,
    installedRole: Rt,
    installedUsedBy: jt,
    installedCanUpdate: St,
    installedUpdateDisabledReason: Yt,
    installedCanUninstall: Ot,
    installedMigrationSummary: Lo,
    updateInfoForDep: rt,
    updateStatusLabel: Je,
    updateStatusIcon: on,
    updateStatusBusy: Dt,
    scanInstalledUpdates: Ct,
    updateInstalledDependency: Ve,
    updateAllAvailable: He,
    installDialogOpen: Wt,
    installTarget: be,
    closeInstallDialog: pe,
    onInstallChanged: xe,
    uninstallDialogOpen: Tt,
    uninstallDep: st,
    uninstallPolicy: Xe,
    uninstallRunning: je,
    uninstallPreviewLoading: Ft,
    uninstallPreview: $,
    uninstallExecution: x,
    uninstallCode: D,
    uninstallError: U,
    uninstallRequiredBy: Z,
    uninstallBlockedReason: at,
    uninstallActionBlockedReason: Vt,
    uninstallPhase: Y,
    uninstallElapsedSec: de,
    previewUninstall: Fe,
    executionStepLabel: Ro,
    openDetail: Te,
    closeDetail: $e,
    detailInstall: y,
    detailUpdate: Ue,
    detailUninstall: Bn,
    refreshAll: Ht,
    saveHubToken: Q,
    clearHubToken: f,
    openUpdateDialog: he,
    openUninstallDialog: fe,
    installedUninstallDisabledReason: Zt,
    runUninstall: lt
  };
}
const Gl = ["aria-label", "aria-busy"], Wl = /* @__PURE__ */ nn({
  __name: "NativeDialog",
  props: {
    visible: { type: Boolean },
    busy: { type: Boolean },
    label: {},
    headerClass: {},
    contentClass: {},
    footerClass: {}
  },
  emits: ["close"],
  setup(e, { emit: t }) {
    const n = e, s = t, i = j(null);
    async function l() {
      await bn();
      const b = i.value;
      b && (n.visible && !b.open ? b.showModal() : !n.visible && b.open && b.close());
    }
    function p(b) {
      b.preventDefault(), n.busy || s("close");
    }
    return Ne(() => n.visible, l), ao(l), Uo(() => {
      i.value?.open && i.value.close();
    }), (b, v) => (a(), u("dialog", {
      ref_key: "dialog",
      ref: i,
      class: "kx-native-dialog",
      "aria-label": e.label,
      "aria-modal": "true",
      "aria-busy": e.busy || void 0,
      onCancel: p,
      onClose: v[1] || (v[1] = () => {
        e.visible && !e.busy && s("close");
      })
    }, [
      r("header", {
        class: ne(e.headerClass)
      }, [
        ie(b.$slots, "header"),
        m(o(le), {
          type: "button",
          text: "",
          severity: "secondary",
          "aria-label": "Close dialog",
          disabled: e.busy,
          onClick: v[0] || (v[0] = (k) => s("close"))
        }, {
          default: ee(() => [...v[2] || (v[2] = [
            M("×", -1)
          ])]),
          _: 1
        }, 8, ["disabled"])
      ], 2),
      r("div", {
        class: ne(e.contentClass)
      }, [
        ie(b.$slots, "default")
      ], 2),
      b.$slots.footer ? (a(), u("footer", {
        key: 0,
        class: ne(e.footerClass)
      }, [
        ie(b.$slots, "footer")
      ], 2)) : h("", !0)
    ], 40, Gl));
  }
}), Zl = ["aria-expanded", "aria-controls", "aria-label", "disabled"], Yl = { class: "p-select-label" }, Xl = {
  key: 0,
  class: "kx-ps-val"
}, Jl = { class: "kx-ps-val-label" }, Ql = {
  key: 1,
  class: "kx-ps-ph"
}, er = { class: "p-select-dropdown" }, tr = { class: "p-select-overlay kx-ps-panel" }, nr = { class: "p-select-header" }, or = ["aria-label", "aria-controls", "aria-activedescendant"], ir = ["id", "aria-label"], sr = {
  class: "p-select-option-group",
  role: "presentation"
}, ar = ["id", "aria-selected", "onClick", "onMousemove"], lr = { class: "kx-ps-opt-body" }, rr = { class: "kx-ps-opt-title" }, ur = {
  key: 0,
  class: "kx-ps-opt-sub"
}, dr = {
  key: 0,
  class: "p-select-empty-message",
  role: "status"
}, cr = {
  key: 1,
  class: "p-select-empty-message",
  role: "presentation"
}, pr = {
  key: 0,
  class: "p-select-empty-message",
  role: "alert"
}, fr = ["disabled"], Ao = /* @__PURE__ */ nn({
  __name: "PickerSelect",
  props: {
    items: {},
    modelValue: {},
    placeholder: {},
    ariaLabel: {},
    disabled: { type: Boolean },
    remote: { type: Boolean },
    loading: { type: Boolean },
    more: { type: Boolean },
    error: {}
  },
  emits: ["update:modelValue", "search", "more"],
  setup(e, { emit: t }) {
    const n = e, s = t, i = j(null), l = j(null), p = j(!1), b = j(""), v = j(0), k = Ui(), S = q(() => {
      const z = b.value.trim().toLowerCase(), K = /* @__PURE__ */ new Map();
      for (const P of n.items) {
        if (!n.remote && z && ![P.title, P.subtitle, P.id, P.group].some((Q) => Q?.toLowerCase().includes(z))) continue;
        const B = P.group || "Other", d = K.get(B);
        d ? d.push(P) : K.set(B, [P]);
      }
      let H = 0;
      return [...K.entries()].sort((P, B) => P[0].localeCompare(B[0])).map(([P, B]) => ({ group: P, items: B.map((d) => ({ item: d, index: H++ })) }));
    }), _ = q(() => S.value.flatMap((z) => z.items)), E = q(() => n.items.find((z) => z.id === n.modelValue)), R = q(() => _.value[v.value] ? `${k}-${v.value}` : void 0);
    Ne(b, () => {
      v.value = 0;
    }), Ne([p, b], ([z, K]) => {
      z && n.remote && s("search", K);
    }), Ne(() => n.disabled, (z) => {
      z && (p.value = !1);
    }), Ne(p, async (z) => {
      if (!z) {
        i.value?.focus();
        return;
      }
      b.value = "", v.value = Math.max(0, _.value.findIndex(({ item: K }) => K.id === n.modelValue)), await bn(), l.value?.focus();
    });
    function T(z) {
      n.disabled || n.loading || (s("update:modelValue", z.id), p.value = !1);
    }
    async function N(z) {
      if (z.key === "Escape" && p.value) {
        z.preventDefault(), z.stopPropagation(), p.value = !1;
        return;
      }
      if (!["ArrowDown", "ArrowUp", "Home", "End", "Enter"].includes(z.key)) return;
      if (z.preventDefault(), !p.value) {
        p.value = !0;
        return;
      }
      if (z.key === "Enter") {
        const P = _.value[v.value];
        P && T(P.item);
        return;
      }
      const K = _.value.length - 1;
      v.value = z.key === "Home" ? 0 : z.key === "End" ? K : Math.max(0, Math.min(K, v.value + (z.key === "ArrowDown" ? 1 : -1))), await bn(), i.value?.getRootNode()?.querySelector(`[id="${R.value}"]`)?.scrollIntoView({ block: "nearest" });
    }
    return (z, K) => (a(), u(X, null, [
      r("button", {
        ref_key: "anchor",
        ref: i,
        type: "button",
        class: "kx-ps p-select",
        role: "combobox",
        "aria-haspopup": "listbox",
        "aria-expanded": p.value,
        "aria-controls": o(k),
        "aria-label": e.ariaLabel,
        disabled: e.disabled,
        onClick: K[0] || (K[0] = (H) => p.value = !p.value),
        onKeydown: N
      }, [
        r("span", Yl, [
          E.value ? (a(), u("span", Xl, [
            m(o(C), {
              icon: E.value.icon || "tabler:point",
              class: "kx-ps-val-ico",
              "aria-hidden": "true"
            }, null, 8, ["icon"]),
            r("span", Jl, c(E.value.title), 1)
          ])) : (a(), u("span", Ql, c(e.placeholder || "Select…"), 1))
        ]),
        r("span", er, [
          m(o(C), {
            icon: "tabler:chevron-down",
            "aria-hidden": "true"
          })
        ])
      ], 40, Zl),
      m(ai, {
        open: p.value,
        "onUpdate:open": K[3] || (K[3] = (H) => p.value = H),
        anchor: i.value
      }, {
        default: ee(() => [
          r("div", tr, [
            r("div", nr, [
              De(r("input", {
                ref_key: "search",
                ref: l,
                "onUpdate:modelValue": K[1] || (K[1] = (H) => b.value = H),
                type: "search",
                class: "p-inputtext p-select-filter",
                "aria-label": `Search ${e.ariaLabel || e.placeholder || "options"}`,
                "aria-controls": o(k),
                "aria-activedescendant": R.value,
                onKeydown: N
              }, null, 40, or), [
                [zn, b.value]
              ])
            ]),
            r("ul", {
              id: o(k),
              class: "p-select-list kx-ps-options",
              role: "listbox",
              "aria-label": e.ariaLabel || e.placeholder || "Options"
            }, [
              (a(!0), u(X, null, se(S.value, (H) => (a(), u(X, {
                key: H.group
              }, [
                r("li", sr, c(H.group), 1),
                (a(!0), u(X, null, se(H.items, ({ item: P, index: B }) => (a(), u("li", {
                  id: `${o(k)}-${B}`,
                  key: P.id,
                  class: ne(["p-select-option kx-ps-option", { "p-select-option-selected": P.id === e.modelValue, "p-focus": B === v.value }]),
                  role: "option",
                  "aria-selected": P.id === e.modelValue,
                  onClick: (d) => T(P),
                  onMousemove: (d) => v.value = B
                }, [
                  m(o(C), {
                    icon: P.icon || "tabler:point",
                    class: "kx-ps-opt-ico",
                    "aria-hidden": "true"
                  }, null, 8, ["icon"]),
                  r("span", lr, [
                    r("span", rr, c(P.title), 1),
                    P.subtitle ? (a(), u("span", ur, c(P.subtitle), 1)) : h("", !0)
                  ])
                ], 42, ar))), 128))
              ], 64))), 128)),
              e.loading ? (a(), u("li", dr, "Loading…")) : !_.value.length && !e.error ? (a(), u("li", cr, "No matches")) : h("", !0)
            ], 8, ir),
            e.error ? (a(), u("div", pr, c(e.error), 1)) : h("", !0),
            e.more ? (a(), u("button", {
              key: 1,
              type: "button",
              class: "p-button p-button-secondary",
              "data-testid": "picker-more",
              disabled: e.loading || e.disabled,
              onClick: K[2] || (K[2] = (H) => s("more"))
            }, "Load more", 8, fr)) : h("", !0)
          ])
        ]),
        _: 1
      }, 8, ["open", "anchor"])
    ], 64));
  }
});
function to() {
  return { status: "idle", modules: [], findings: [], scanned: 0, total: 0 };
}
function mr(e) {
  return e.some((t) => t.severity === "critical") ? "critical" : e.length > 0 ? "warnings" : "clean";
}
const Po = {
  info: { label: "Info", icon: "tabler:info-circle", tone: "info" },
  warning: { label: "Warning", icon: "tabler:alert-triangle", tone: "warn" },
  critical: { label: "Critical", icon: "tabler:shield-x", tone: "danger" }
};
function hr(e) {
  return e.severity !== "critical";
}
const br = ["clean", "warnings", "critical", "error", "unavailable", "skipped"];
function Mo(e) {
  return br.includes(e) ? e : "clean";
}
function vr(e) {
  return e === "critical" ? "critical" : e === "warning" ? "warning" : "info";
}
function gr(e) {
  const t = e && typeof e == "object" ? e : {}, n = [], s = [];
  for (const b of t.modules || []) {
    const v = String(b.module || ""), k = b.version ? String(b.version) : void 0, S = (b.findings || []).map((_, E) => ({
      id: `${v}#${E}`,
      module: v,
      version: k,
      severity: vr(_.severity),
      title: String(_.title || "Issue"),
      detail: _.detail ? String(_.detail) : void 0,
      location: _.location ? String(_.location) : void 0
    }));
    for (const _ of S) s.push(_);
    n.push({
      module: v,
      version: k,
      status: Mo(b.status),
      summary: b.summary ? String(b.summary) : void 0,
      findings: S
    });
  }
  const i = typeof t.total == "number" ? t.total : n.length, l = typeof t.scanned == "number" ? t.scanned : n.length;
  return {
    status: t.overall_status ? Mo(t.overall_status) : mr(s),
    summary: t.overall_summary ? String(t.overall_summary) : void 0,
    modules: n,
    findings: s,
    scanned: l,
    total: i
  };
}
function yr({ props: e, hub: t, plan: n, activeSection: s, versionArg: i, requirementPayload: l, invalidatePlan: p, refreshPlan: b, planCurrent: v }) {
  const k = j([]), S = j({}), _ = j({}), E = q(() => {
    const $ = /* @__PURE__ */ new Map();
    for (const x of k.value) {
      const D = String(x.module || "");
      $.has(D) || $.set(D, []), $.get(D).push(x);
    }
    return Array.from($.entries()).map(([x, D]) => ({ module: x, items: D, direct: !D.every((U) => On(U, e.component)) })).sort((x, D) => x.direct === D.direct ? x.module.localeCompare(D.module) : x.direct ? -1 : 1);
  }), R = q(() => k.value.filter(($) => !On($, e.component))), T = q(() => k.value.filter(($) => !Be($))), N = q(() => k.value.length - R.value.length), z = q(() => {
    const $ = [];
    for (const x of k.value) {
      const D = ue(x);
      !D || !x.required && !x.missing || g(S.value[D]) && $.push(D);
    }
    return $;
  }), K = q(() => k.value.filter(($) => !g(S.value[ue($)])).length), H = q(() => ot().length), P = j(!1), B = j(null);
  let d = null;
  const Q = j(0), f = j({}), w = q(() => Object.keys(f.value).length);
  let A = 0;
  const re = /* @__PURE__ */ new Set();
  function g($) {
    return $ == null || $ === "" || typeof $ == "string" && !$.trim() || Array.isArray($) && $.length === 0 || typeof $ == "object" && Object.keys($).length === 0;
  }
  function I($) {
    return $ == null ? "" : typeof $ == "object" ? JSON.stringify($) : String($);
  }
  function L($) {
    if ($.expected_type) return $.expected_type;
    const x = [$.value, $.default, ...($.suggestions || []).map((D) => D.value)];
    for (const D of x) {
      if (typeof D == "boolean" || typeof D == "number") return typeof D;
      if (Array.isArray(D)) return "array";
      if (D && typeof D == "object") return "object";
    }
    return "string";
  }
  function F($, x) {
    if (typeof x != "string") return x;
    const D = x.trim(), U = L($);
    if (U === "boolean") return /^(true|false)$/.test(D) ? D === "true" : x;
    if (U === "number" || U === "integer") return D && Number.isFinite(Number(D)) ? Number(D) : x;
    if (U === "array" || U === "object")
      try {
        return JSON.parse(D);
      } catch {
        return x;
      }
    return x;
  }
  function J($, x) {
    const D = L($);
    return D === "array" ? Array.isArray(x) : D === "object" ? x !== null && typeof x == "object" && !Array.isArray(x) : D === "integer" ? typeof x == "number" && Number.isInteger(x) : typeof x === D && (D !== "number" || Number.isFinite(x));
  }
  function te($, x) {
    const D = ue($);
    if (!D || Be($)) return;
    const U = F($, x ?? "");
    JSON.stringify(S.value[D]) !== JSON.stringify(U) && (re.add(D), S.value = { ...S.value, [D]: U }, p());
  }
  function oe($) {
    const x = S.value[ue($)];
    return !Be($) && !g(x) && !J($, x);
  }
  function me($) {
    const x = L($);
    return x === "boolean" ? "expects true or false" : `expects ${x === "integer" || x === "object" || x === "array" ? "an" : "a"} ${x}`;
  }
  const Ae = q(() => k.value.filter(oe).map(ue).filter(Boolean));
  function ge($) {
    return I(S.value[ue($)]);
  }
  function Ke($) {
    return ($.required || $.missing) === !0 && g(S.value[ue($)]);
  }
  function Be($) {
    return On($, e.component) && $.missing !== !0 && !re.has(ue($));
  }
  function ht($) {
    const x = /* @__PURE__ */ new Set(), D = [];
    for (const U of $.suggestions || []) {
      const Z = I(U.value).trim();
      if (!Z || x.has(Z)) continue;
      x.add(Z);
      const Y = String(U.label || Z).trim(), de = [U.kind, U.source, U.description].filter(Boolean).map(String).join(" | ");
      D.push({ label: Y && Y !== Z ? `${Y} (${Z})` : Z, value: Z, title: de });
    }
    return D;
  }
  function qe() {
    const $ = {}, x = (U, Z) => {
      if (U = String(U || "").trim(), !U) return;
      $[U] = Z;
      const Y = U.includes(":") && U.split(":").pop() || "";
      Y && $[Y] === void 0 && ($[Y] = $[U]);
    }, D = e.installedDep?.parameters;
    if (Array.isArray(D))
      for (const U of D)
        x(U.name, U.value);
    else if (D && typeof D == "object")
      for (const [U, Z] of Object.entries(D)) x(U, Z);
    return $;
  }
  async function bt() {
    if (_.value = {}, !!t)
      try {
        const $ = await t.listDependencies({ includeEntries: !1, includeMigrations: !1 }), x = {}, D = (U, Z) => {
          U = String(U || "").trim();
          const Y = String(Z ?? "").trim();
          if (!U || !Y || x[U] !== void 0) return;
          x[U] = Z;
          const de = U.includes(":") && U.split(":").pop() || "";
          de && x[de] === void 0 && (x[de] = x[U]);
        };
        for (const U of $.dependencies || []) {
          const Z = U.parameters;
          if (Array.isArray(Z))
            for (const Y of Z) D(Y.name, Y.value);
          else if (Z && typeof Z == "object")
            for (const [Y, de] of Object.entries(Z)) D(Y, de);
        }
        _.value = x;
      } catch ($) {
        nt("install:dependency-parameters", $);
      }
  }
  function Mt($) {
    for (const x of n.value?.recommended_parameters || [])
      if (x.name === $ && I(x.value).trim() !== "") return I(x.value);
    return "";
  }
  function Et($) {
    const x = [
      ue($),
      String($.parameter_name || ""),
      String($.full_id || ""),
      String($.name || ""),
      String($.short_name || "")
    ].map((D) => D.trim()).filter(Boolean);
    for (const D of x) {
      const U = I(_.value[D]).trim();
      if (U) return U;
      const Z = D.includes(":") && D.split(":").pop() || "";
      if (Z) {
        const Y = I(_.value[Z]).trim();
        if (Y) return Y;
      }
    }
    return "";
  }
  function Se($) {
    const x = ue($);
    if (!x || Be($) || String(S.value[x] ?? "").trim()) return "";
    const U = Mt(x).trim();
    if (U) return U;
    const Z = Et($);
    if (Z) return Z;
    const Y = I($.default).trim();
    if (Y) return Y;
    const de = ht($).map((at) => at.value).filter(Boolean);
    if (de.length === 1) return de[0];
    const ke = Gt($);
    return ke.length && ke[0].score > 0 && (ke.length === 1 || ke[0].score > ke[1].score) ? ke[0].value : "";
  }
  function Gt($) {
    return String($.expected_kind || "").trim() !== "security.scope" ? [] : ($.suggestions || []).map((x) => {
      const D = I(x.value).trim(), U = String(x.label || "").toLowerCase(), Z = String(x.description || "").toLowerCase();
      let Y = 0;
      return D || (Y -= 1e3), (U.includes("system") || Z.includes("system") || Z.includes("internal")) && (Y -= 50), (U.includes("admin") || Z.includes("full access") || Z.includes("assign sparingly")) && (Y -= 50), (Z.includes("signed-in") || Z.includes("authenticated")) && (Y += 30), (U === "user" || U === "member") && (Y += 20), { value: D, score: Y };
    }).filter((x) => x.value).sort((x, D) => D.score - x.score || x.value.localeCompare(D.value));
  }
  function ot() {
    const $ = [];
    for (const x of T.value) {
      if (!Ke(x)) continue;
      const D = ue(x), U = Se(x);
      D && U && $.push({ name: D, value: U });
    }
    return $;
  }
  function Ge($) {
    return Se($) !== "";
  }
  function vt($) {
    const x = ue($), D = Se($);
    if (!x || !D) {
      s.value = "requirements", Q.value++;
      return;
    }
    te($, D);
  }
  function it() {
    const $ = ot();
    if (!$.length) {
      s.value = "requirements", Q.value++;
      return;
    }
    for (const x of $) {
      const D = k.value.find((U) => ue(U) === x.name);
      D && te(D, String(x.value));
    }
  }
  function We() {
    return T.value.filter(($) => g(S.value[ue($)]) && ($.missing || $.value_source === "conflict" || $.expected_type || ht($).length)).map(($) => ({ name: $.full_id || ue($) }));
  }
  const Re = q(() => We().length);
  function Te($, x) {
    return g(x) || !J($, x) ? !1 : !$.expected_kind || !!$.suggestions?.some((D) => D.value === x);
  }
  function $e($) {
    const x = { ...f.value }, D = { ...S.value };
    for (const U of $) {
      const Z = x[U];
      Z?.value !== void 0 && (D[U] = Z.value, re.add(U), delete x[U]);
    }
    return S.value = D, p(), x;
  }
  async function Ze($) {
    if (!v.value || P.value) return;
    const x = $e($), D = A;
    if (await b(), D !== A || !v.value) return;
    const U = {};
    for (const Z of T.value) {
      const Y = ue(Z), de = x[Y];
      de && g(S.value[Y]) && Z.expected_type === de.expected_type && Z.expected_kind === de.expected_kind && Te(Z, de.value) && (U[Y] = de);
    }
    f.value = U;
  }
  function Ye($) {
    const x = { ...f.value };
    for (const D of $) delete x[D];
    f.value = x;
  }
  function Tt($) {
    !v.value || P.value || $e($);
  }
  async function st($) {
    const x = We();
    if (!v.value || !x.length || P.value) return;
    je();
    const D = A, U = new AbortController();
    d = U, P.value = !0, B.value = null, f.value = {}, await new Promise((Z) => {
      let Y = !1, de = !1;
      const ke = (fe) => {
        if (Y) return;
        if (Y = !0, clearTimeout(at), U.signal.aborted || D !== A || d !== U) {
          Z();
          return;
        }
        d = null;
        const Fe = fe && typeof fe == "object" ? fe : {};
        if (Fe.success === !0) {
          const lt = new Set(x.map((ve) => ve.name)), gt = {}, yt = new Map((Fe.requirements || []).map((ve) => [ve.full_id, ve]));
          k.value = k.value.map((ve) => ({
            ...ve,
            resolution_error: yt.get(ve.full_id)?.resolution_error
          }));
          for (const ve of Fe.parameters || []) {
            const Pe = k.value.find((rt) => (rt.full_id || ue(rt)) === ve.name || ue(rt) === ve.name);
            if (!Pe || !lt.has(Pe.full_id || ue(Pe)) || !Te(Pe, ve.value) || typeof ve.reason != "string" || !ve.reason.trim()) {
              B.value = { tone: "warning", code: "INVALID_CHOICE", message: "AI returns an invalid planned value or omits its reason. Choose a value manually." };
              continue;
            }
            gt[ue(Pe)] = { ...Pe, value: ve.value, choice_reason: ve.reason };
          }
          f.value = gt, Object.keys(gt).length ? B.value = { tone: "success", message: "Review AI suggestions before applying." } : B.value || (B.value = { tone: "warning", message: "No valid AI suggestion is available. Choose a value manually." });
        } else
          B.value = {
            tone: "warning",
            code: Fe.code,
            kind: Fe.kind,
            details: Fe.details,
            message: Fe.error || "AI could not resolve these settings. Choose a value manually."
          };
        P.value = !1, Z();
      }, at = setTimeout(() => {
        ke({ success: !1, code: "TIMEOUT", error: "AI requirement resolution timed out." }), U.abort();
      }, 2e4);
      U.signal.addEventListener("abort", () => {
        Y || (Y = !0, clearTimeout(at), Z());
      }, { once: !0 });
      const Vt = {
        component: e.component,
        ...i() ? { version: i() } : {},
        ...e.mode === "update" && e.currentId ? { current_id: e.currentId } : {},
        ...l(),
        requirements: x,
        signal: U.signal,
        accept: () => {
          Y || (de = !0);
        },
        respond: ke
      };
      $?.dispatchEvent(new CustomEvent("instrumentRequirementResolution", { detail: Vt, bubbles: !0, composed: !0 })), de || ke({ success: !1, code: "MODEL_UNAVAILABLE", error: "Configure an AI model to suggest settings, or choose values manually." });
    });
  }
  function Xe($, x) {
    n.value = $, k.value = ($.requirements || []).filter((Z) => Z.name !== "required_setup" && Z.short_name !== "required_setup");
    const D = qe(), U = {};
    for (const Z of k.value) {
      const Y = ue(Z);
      if (!Y) continue;
      const de = String(Z.name || Z.short_name || Y.split(":").pop() || "");
      U[Y] = (re.has(Y) ? x[Y] : g(x[Y]) ? void 0 : x[Y]) ?? D[Y] ?? D[de] ?? _.value[Y] ?? _.value[de] ?? Z.value ?? Z.default ?? "";
    }
    S.value = U;
    for (const Z of re)
      Z in U || re.delete(Z);
  }
  function je() {
    d?.abort(), d = null, P.value = !1, A++, f.value = {}, B.value = null;
  }
  function Ft() {
    je(), k.value = [], S.value = {}, re.clear(), _.value = {}, P.value = !1, B.value = null;
  }
  return {
    pendingSuggestions: f,
    pendingCount: w,
    acceptSuggestions: Ze,
    rejectSuggestions: Ye,
    editSuggestions: Tt,
    displayValue: I,
    requirements: k,
    parameterValues: S,
    installedParameterHints: _,
    requirementGroups: E,
    rootRequirements: R,
    editableRequirements: T,
    transitiveRequirementCount: N,
    missingRequirements: z,
    boundRequirementCount: K,
    autoFitCount: H,
    aiResolving: P,
    aiResolutionNotice: B,
    typeInvalidRequirements: Ae,
    highlightTick: Q,
    aiResolvableCount: Re,
    setParameter: te,
    requirementTypeInvalid: oe,
    requirementTypeHint: me,
    requirementValue: ge,
    requirementMissing: Ke,
    requirementReadOnly: Be,
    requirementOptions: ht,
    loadInstalledParameterHints: bt,
    applyPlan: Xe,
    recommendedValueFor: Mt,
    hintedValueFor: Et,
    autoFitValue: Se,
    canAutoFitRequirement: Ge,
    autoFitRequirement: vt,
    autoFitRequirements: it,
    resolveRequirementsWithAI: st,
    abortAI: je,
    resetRequirements: Ft
  };
}
function jn(e) {
  return e.map((t) => [t.module, t.version || ""].join("\0")).sort().join("");
}
function kr({ props: e, hub: t, plan: n, planCurrent: s, versionArg: i }) {
  const l = j(to()), p = j(/* @__PURE__ */ new Set()), b = j(!1);
  let v = 0, k = null;
  const S = q(() => l.value.findings.filter(hr)), _ = q(() => S.value.filter((H) => !p.value.has(H.id)));
  function E(H) {
    const P = new Set(p.value);
    P.add(H.id), p.value = P;
  }
  function R() {
    const H = new Set(p.value);
    for (const P of S.value) H.add(P.id);
    p.value = H;
  }
  function T(H) {
    const P = H ? jn(H) : null;
    P !== k && (v++, k = P, l.value = { ...to(), total: H?.length || 0 }, p.value = /* @__PURE__ */ new Set(), b.value = !1);
  }
  async function N() {
    if (!t || !e.component || !s.value) return;
    const H = n.value?.graph || [], P = jn(H), B = ++v;
    p.value = /* @__PURE__ */ new Set(), b.value = !1, l.value = { status: "scanning", modules: [], findings: [], scanned: 0, total: H.length };
    try {
      const d = await t.scan({ component: e.component, version: i() });
      if (B !== v) return;
      const Q = gr(d);
      if (jn(Q.modules) !== P)
        throw new Error("Security scan resolved different module versions. Refresh the install plan and scan again.");
      l.value = Q;
    } catch (d) {
      if (B === v) {
        const Q = d instanceof Kt && (d.status === 404 || d.code === "UNKNOWN" || d.code === "NETWORK");
        l.value = Q ? { status: "unavailable", modules: [], findings: [], scanned: 0, total: H.length, error: "Security scan unavailable" } : { status: "error", modules: [], findings: [], scanned: 0, total: H.length, error: ze(d, "scan failed") };
      }
    }
  }
  function z() {
    const H = n.value?.graph || [];
    v++, l.value = {
      status: "skipped",
      modules: [],
      findings: [],
      scanned: 0,
      total: H.length,
      summary: "Security scan skipped by operator."
    }, p.value = /* @__PURE__ */ new Set(), b.value = !1;
  }
  function K() {
    v++;
  }
  return { scan: l, acknowledged: p, criticalConfirmed: b, softFindings: S, unacknowledgedSoft: _, acknowledge: E, acknowledgeAllSoft: R, resetScanForPlan: T, runScanNow: N, skipScan: z, cancelScan: K };
}
const wr = {
  "hub.install.started": "Publishing changeset",
  "hub.install.finished": "Finalizing",
  "hub.migrations.started": "Running migrations",
  "hub.migrations.finished": "Migrations applied",
  "hub.uninstall.started": "Removing entries"
}, Hn = [
  { label: "Run migrations (up)", value: "up" },
  { label: "Skip migrations (none)", value: "none" }
];
function Sr(e) {
  if (!e || typeof e != "object") return "";
  const t = [e, e.data, e.payload, e.detail];
  for (const n of t)
    if (n && typeof n == "object" && typeof n.event == "string")
      return String(n.event);
  return "";
}
function $r(e, t) {
  const n = jo(lo), s = j("overview"), i = j(""), l = j("pin"), p = j([]), b = j(!1), v = q(() => [
    { label: "latest", value: "" },
    ...p.value.map((G) => String(G.version || "")).filter(Boolean).map((G) => ({ label: G, value: G }))
  ]), k = q(() => p.value.find((G) => G.version === i.value) || p.value[0]);
  function S() {
    const G = i.value.trim().replace(/^>=?/, "");
    if (G)
      return l.value === "track" ? `>=${G}` : G;
  }
  const _ = q(() => e.installedDep ? ft(e.installedDep) : ""), E = j(""), R = j(!1), T = j(null), N = j(!1), z = j(!1), K = j(null), H = j(null), P = j(null), B = q(() => (T.value?.graph || []).filter((G) => G.direct || G.module === e.component)), d = q(() => (T.value?.graph || []).filter((G) => !G.direct && G.module !== e.component)), Q = q(() => Mi(T.value?.graph || [])), f = q(() => {
    const G = [], he = (pe, xe) => {
      for (const V of pe)
        G.push({ ...V, level: xe }), he(V.children, xe + 1);
    };
    return he(Q.value, 0), G;
  }), w = q(() => T.value?.module_count || T.value?.graph?.length || 0), A = q(() => (T.value?.graph || []).reduce((G, he) => G + (he.size_bytes || 0), 0));
  function re(G) {
    return Fi(G, { currentVersion: _.value, targetModule: e.component });
  }
  const g = yr({ props: e, hub: n, plan: T, activeSection: s, versionArg: S, requirementPayload: _t, invalidatePlan: O, refreshPlan: $t, planCurrent: z }), {
    pendingSuggestions: I,
    pendingCount: L,
    acceptSuggestions: F,
    rejectSuggestions: J,
    editSuggestions: te,
    displayValue: oe,
    requirements: me,
    requirementGroups: Ae,
    rootRequirements: ge,
    transitiveRequirementCount: Ke,
    parameterValues: Be,
    editableRequirements: ht,
    missingRequirements: qe,
    boundRequirementCount: bt,
    autoFitCount: Mt,
    aiResolvableCount: Et,
    aiResolving: Se,
    aiResolutionNotice: Gt,
    resolveRequirementsWithAI: ot,
    highlightTick: Ge,
    setParameter: vt,
    requirementValue: it,
    requirementMissing: We,
    requirementReadOnly: Re,
    requirementOptions: Te,
    typeInvalidRequirements: $e,
    requirementTypeInvalid: Ze,
    requirementTypeHint: Ye,
    canAutoFitRequirement: Tt,
    autoFitRequirement: st,
    autoFitRequirements: Xe,
    loadInstalledParameterHints: je,
    applyPlan: Ft,
    resetRequirements: $,
    abortAI: x
  } = g, D = j("up"), U = j([]), Z = q(() => U.value.length > 0), Y = q({
    get: () => Z.value ? "up" : D.value,
    set: (G) => {
      D.value = G;
    }
  }), de = q(() => Z.value ? [Hn[0]] : Hn), ke = q(() => T.value?.migrations || []), at = q(() => T.value?.dependency?.id || T.value?.install_payload?.id || ""), Vt = kr({ props: e, hub: n, plan: T, planCurrent: z, versionArg: S }), {
    scan: fe,
    acknowledged: Fe,
    criticalConfirmed: lt,
    softFindings: gt,
    unacknowledgedSoft: yt,
    acknowledge: ve,
    acknowledgeAllSoft: Pe,
    resetScanForPlan: rt,
    runScanNow: Je,
    skipScan: on,
    cancelScan: Dt
  } = Vt, Ct = q(() => {
    const G = N.value || Se.value ? { tone: "loading" } : L.value ? { tone: "warn", badge: String(L.value) } : qe.value.length || $e.value.length ? { tone: "danger", badge: String(qe.value.length + $e.value.length) } : me.value.length ? { tone: "ok" } : { tone: "none" }, he = {
      scanning: "loading",
      clean: "ok",
      warnings: "warn",
      critical: "danger",
      error: "danger",
      unavailable: "none",
      idle: "none",
      skipped: "none"
    }[fe.value.status] || "none";
    return {
      overview: { tone: "none" },
      modules: N.value ? { tone: "loading" } : T.value ? { tone: "none", badge: String(w.value) } : { tone: "none" },
      requirements: G,
      scan: { tone: he, badge: fe.value.findings.length ? String(fe.value.findings.length) : void 0 },
      review: ke.value.length ? { tone: "none", badge: String(ke.value.length) } : { tone: "none" }
    };
  }), Ve = j(!1), He = j(!1), kt = j(null), wt = j(null), we = j(null), ut = j(null), sn = q(() => Un(kt.value || ut.value)), It = j(""), dt = j(0);
  let ct = null, Qe = null, ye = 0, et = 0, be = 0;
  function Wt() {
    It.value = "", dt.value = 0;
    const G = Date.now();
    ct = setInterval(() => {
      dt.value = Math.floor((Date.now() - G) / 1e3);
    }, 250);
    try {
      const he = qi("keeper.hub", (pe) => {
        const xe = wr[Sr(pe)];
        xe && (It.value = xe);
      });
      Qe = typeof he == "function" ? he : null;
    } catch {
      Qe = null;
    }
  }
  function Ce() {
    if (ct && (clearInterval(ct), ct = null), Qe) {
      try {
        Qe();
      } catch {
      }
      Qe = null;
    }
  }
  function _t() {
    const G = [], he = [];
    for (const pe of ht.value) {
      const xe = ue(pe);
      if (!xe) continue;
      const V = Be.value[xe], ae = typeof V == "string" ? V.trim() : V;
      if (ae == null || ae === "") continue;
      (On(pe, e.component) ? he : G).push({ name: xe, value: ae });
    }
    return {
      parameters: G.length ? G : void 0,
      requirement_bindings: he.length ? he : void 0
    };
  }
  function Bt(G, he) {
    const pe = Ko?.toast;
    typeof pe == "function" && pe({ severity: G === "ok" ? "success" : "error", summary: he });
  }
  async function xt(G) {
    if (!n || !e.component || !z.value || T.value?.applicable === !1 || L.value || Se.value) return;
    const he = ++be, pe = () => he === be && e.open;
    G ? He.value = !0 : Ve.value = !0, kt.value = null, we.value = null, wt.value = null, ut.value = null, G || Wt();
    let xe = !1;
    try {
      const V = await n.install({
        component: e.component,
        version: S(),
        id: e.mode === "update" && e.currentId ? e.currentId : void 0,
        dry_run: G || void 0,
        migration_policy: Y.value,
        ..._t()
      });
      if (!pe()) return;
      if (V.success !== !0) throw new Kt("INSTALL_INCOMPLETE", "Keeper does not confirm a successful install.", void 0, V);
      if (G || await Vi(n, U.value, {
        isCurrent: pe,
        onPhase: (ae) => {
          It.value = ae;
        }
      }), !pe()) return;
      if (kt.value = V, !G) {
        const ae = e.mode === "update" ? "updated" : "installed";
        Bt("ok", `Module ${ae}: ${V.dependency?.id || e.component}`), eo(), xe = !0;
      }
    } catch (V) {
      if (!pe()) return;
      nt("install:run", V), V instanceof Kt && (we.value = V.code, ut.value = V.details), wt.value = ze(V, G ? "preview failed" : "install failed"), Bt("error", wt.value);
    } finally {
      he === be && (G ? He.value = !1 : (Ve.value = !1, Ce()));
    }
    xe && t("changed");
  }
  const Ie = q(() => !T.value || K.value ? "modules" : L.value || Se.value || qe.value.length || $e.value.length || !z.value || T.value.applicable === !1 || me.value.some((G) => G.invalid) ? "requirements" : fe.value.status === "idle" || fe.value.status === "scanning" || fe.value.status === "critical" && !lt.value || yt.value.length ? "scan" : null), Rt = q(() => Ve.value || He.value || N.value || !T.value || !!K.value || !z.value || L.value > 0 || Se.value || fe.value.status === "scanning" || s.value === "scan" && fe.value.status === "idle"), jt = q(() => {
    if (L.value) return `Review ${L.value} AI suggestion${L.value === 1 ? "" : "s"}`;
    if (Se.value) return "Resolving settings…";
    if (!z.value) return "Validating settings…";
    const G = qe.value.length;
    return G ? `${G} required setting${G === 1 ? "" : "s"} missing` : "Review requirement errors";
  }), Zt = q(() => Ve.value || He.value || N.value || !T.value || !!K.value || !z.value || L.value > 0 || Se.value), St = q(() => Ve.value ? e.mode === "update" ? "Updating…" : "Installing…" : Ie.value === "scan" && fe.value.status === "idle" ? s.value === "scan" ? "Choose scan option" : "Review scan choice" : Ie.value === "scan" && s.value === "scan" && (fe.value.status === "warnings" || fe.value.status === "critical") ? "Install anyway" : e.mode === "update" ? "Update" : "Install");
  function Yt() {
    if (Rt.value) return;
    const G = Ie.value;
    if (G === "requirements") {
      s.value = "requirements", Ge.value++;
      return;
    }
    if (G === "scan") {
      if (s.value !== "scan") {
        s.value = "scan";
        return;
      }
      if (fe.value.status === "idle" || fe.value.status === "scanning" || fe.value.status === "critical" && !lt.value || (Pe(), Ie.value)) return;
    }
    if (G === "modules") {
      s.value = "modules";
      return;
    }
    xt(!1);
  }
  function Ot() {
    if (!z.value || T.value?.applicable === !1 || L.value || Se.value || me.value.some((G) => G.invalid) || qe.value.length || $e.value.length) {
      s.value = "requirements", Ge.value++;
      return;
    }
    s.value = "review", xt(!0);
  }
  async function $t() {
    if (!n || !e.component) return;
    _e && (clearTimeout(_e), _e = null);
    const G = ++ye;
    z.value = !1, N.value = !0, K.value = null, H.value = null, P.value = null;
    const he = { ...Be.value };
    try {
      const pe = await n.planInstall({
        component: e.component,
        version: S(),
        id: e.mode === "update" && e.currentId ? e.currentId : void 0,
        run_migrations: Y.value === "up",
        ..._t()
      });
      if (G !== ye || !e.open) return;
      const xe = Ti(pe.requirements || []);
      U.value = xe, Ft(pe, he), z.value = !0, rt(pe.graph || []);
    } catch (pe) {
      if (G !== ye || !e.open) return;
      nt("install:plan", pe), T.value = null, fe.value = to(), K.value = ze(pe, "failed to plan install"), pe instanceof Kt && (H.value = pe.code, P.value = pe.details);
    } finally {
      G === ye && (N.value = !1);
    }
  }
  let _e = null;
  function O() {
    ye++, z.value = !1, x(), y();
  }
  function y() {
    _e && clearTimeout(_e), _e = setTimeout(() => {
      $t();
    }, 350);
  }
  async function Ue() {
    if (p.value = [], !(!n || !e.component)) {
      b.value = !0;
      try {
        const G = await n.listVersions(e.component);
        p.value = G.items || [];
      } catch (G) {
        nt("install:versions", G);
      } finally {
        b.value = !1;
      }
    }
  }
  async function Bn() {
    if (E.value = "", !(!n || !e.component)) {
      R.value = !0;
      try {
        const G = await n.getReadme(e.component);
        E.value = G.content || "";
      } catch {
      } finally {
        R.value = !1;
      }
    }
  }
  function Rn() {
    ye++, s.value = "overview", T.value = null, z.value = !1, U.value = [], Ve.value = !1, He.value = !1, K.value = null, H.value = null, P.value = null, Y.value = "up", kt.value = null, wt.value = null, we.value = null, ut.value = null, $(), rt(), E.value = "", p.value = [];
  }
  async function xn() {
    const G = ++et;
    Rn(), i.value = e.mode === "update" ? "" : e.version || "", l.value = "track", await Promise.all([Ue(), Bn(), je()]), !(!e.open || G !== et) && (e.mode === "update" && !i.value && p.value.length && (i.value = String(p.value[0].version || "")), await $t());
  }
  Ne(() => e.open, (G) => {
    if (G) {
      xn();
      return;
    }
    x(), Ce(), be++, Ve.value = !1, He.value = !1, et++, ye++, Dt(), _e && (clearTimeout(_e), _e = null);
  }, { immediate: !0 }), Ne([i, l], () => {
    e.open && n && O();
  }, { flush: "sync" }), Ne(Y, () => {
    e.open && n && T.value && O();
  }, { flush: "sync" }), so(() => {
    be++, x(), Ce(), et++, ye++, Dt(), _e && clearTimeout(_e);
  });
  function Ht() {
    x(), be++, Ve.value = !1, He.value = !1, Ce(), t("close");
  }
  return {
    // nav
    activeSection: s,
    sectionStatus: Ct,
    blockingSection: Ie,
    // version
    version: i,
    versionMode: l,
    versionOptions: v,
    versionsLoading: b,
    versionMeta: k,
    currentVersion: _,
    // overview
    readme: E,
    readmeLoading: R,
    // plan
    plan: T,
    planCurrent: z,
    planLoading: N,
    planError: K,
    planCode: H,
    planErrorDetails: P,
    directModules: B,
    transitiveModules: d,
    planTree: Q,
    planRows: f,
    moduleCount: w,
    totalSize: A,
    badgesForNode: re,
    // requirements
    requirements: me,
    requirementGroups: Ae,
    rootRequirements: ge,
    editableRequirements: ht,
    transitiveRequirementCount: Ke,
    parameterValues: Be,
    missingRequirements: qe,
    boundRequirementCount: bt,
    autoFitCount: Mt,
    aiResolvableCount: Et,
    aiResolving: Se,
    aiResolutionNotice: Gt,
    resolveRequirementsWithAI: ot,
    pendingSuggestions: I,
    pendingCount: L,
    acceptSuggestions: F,
    rejectSuggestions: J,
    editSuggestions: te,
    displayValue: oe,
    highlightTick: Ge,
    setParameter: vt,
    requirementValue: it,
    requirementMissing: We,
    requirementReadOnly: Re,
    requirementOptions: Te,
    requirementConfiguredBy: Ei,
    typeInvalidRequirements: $e,
    requirementTypeInvalid: Ze,
    requirementTypeHint: Ye,
    canAutoFitRequirement: Tt,
    autoFitRequirement: st,
    autoFitRequirements: Xe,
    // review / options
    requiredSetup: Z,
    migrationPolicy: Y,
    migrationOptions: de,
    migrations: ke,
    destinationId: at,
    INSTALL_MIGRATION_OPTIONS: Hn,
    // scan
    scan: fe,
    acknowledged: Fe,
    criticalConfirmed: lt,
    softFindings: gt,
    unacknowledgedSoft: yt,
    acknowledge: ve,
    acknowledgeAllSoft: Pe,
    runScanNow: Je,
    skipScan: on,
    // execution
    running: Ve,
    dryRunning: He,
    result: kt,
    resultError: wt,
    resultCode: we,
    resultErrorDetails: ut,
    resultExecution: sn,
    executionStepLabel: Ro,
    progressPhase: It,
    elapsedSec: dt,
    requirementStatusMessage: jt,
    primaryDisabled: Rt,
    previewDisabled: Zt,
    primaryLabel: St,
    primaryAction: Yt,
    preview: Ot,
    refreshPlan: $t,
    close: Ht
  };
}
const Cr = { class: "km-2p-head-icon" }, Ir = { class: "km-2p-head-text" }, _r = { class: "km-2p-head-title" }, xr = { class: "km-2p-head-sub" }, Or = { class: "km-dim km-mono" }, Lr = { class: "km-2p" }, zr = {
  class: "km-2p-nav",
  "aria-label": "Install steps"
}, Ar = ["onClick"], Pr = { class: "km-2p-navlabel" }, Mr = { class: "km-2p-navstatus" }, Er = {
  key: 2,
  class: "km-dot km-dot-danger",
  "aria-hidden": "true"
}, Tr = {
  key: 3,
  class: "km-dot km-dot-warn",
  "aria-hidden": "true"
}, Fr = {
  key: 4,
  class: "km-navbadge"
}, Vr = { class: "km-sec" }, Dr = { class: "km-ov-hero" }, Br = { class: "km-ov-icon" }, Rr = { class: "km-grow km-min0" }, jr = { class: "km-row-wrap" }, Hr = { class: "km-ov-name" }, Ur = {
  key: 0,
  class: "badge-app kx-tag-caps"
}, Nr = {
  key: 1,
  class: "badge-warn kx-tag-caps"
}, Kr = { class: "km-ov-org km-mono" }, qr = {
  key: 0,
  class: "km-ov-desc"
}, Gr = {
  key: 1,
  class: "km-hint"
}, Wr = { class: "km-field" }, Zr = {
  class: "km-seg",
  role: "group",
  "aria-label": "Version mode"
}, Yr = ["aria-pressed"], Xr = ["aria-pressed"], Jr = { class: "km-hint" }, Qr = { class: "km-ov-meta" }, eu = { class: "km-meta-row" }, tu = {
  key: 0,
  class: "km-meta-row"
}, nu = {
  key: 1,
  class: "km-meta-row"
}, ou = ["title"], iu = {
  key: 2,
  class: "km-meta-row"
}, su = {
  key: 3,
  class: "km-meta-row"
}, au = {
  key: 4,
  class: "km-meta-row"
}, lu = {
  key: 5,
  class: "km-meta-row"
}, ru = {
  key: 2,
  class: "km-loading"
}, uu = {
  key: 3,
  class: "km-ov-readme"
}, du = { class: "km-sec" }, cu = {
  key: 1,
  class: "km-msg km-msg-err"
}, pu = {
  key: 0,
  class: "km-code"
}, fu = { class: "km-sec-title" }, mu = {
  key: 0,
  class: "km-dim"
}, hu = {
  key: 1,
  class: "km-tree-spacer",
  "aria-hidden": "true"
}, bu = { class: "km-mrow-badge kx-tag-caps" }, vu = { class: "km-mrow-name km-mono" }, gu = {
  key: 2,
  class: "km-mrow-ver km-mono"
}, yu = {
  key: 3,
  class: "km-dim km-mono"
}, ku = {
  key: 4,
  class: "km-dim"
}, wu = { class: "km-sec" }, Su = {
  key: 1,
  class: "km-empty-inline"
}, $u = { class: "km-sec-title" }, Cu = { class: "km-dim" }, Iu = { class: "km-req-toolbar" }, _u = {
  key: 0,
  class: "km-code"
}, xu = {
  key: 1,
  class: "km-code"
}, Ou = {
  key: 2,
  class: "km-mono"
}, Lu = {
  key: 1,
  class: "km-req-toolbar",
  role: "status"
}, zu = { class: "km-grow" }, Au = { class: "km-req-group-head" }, Pu = { class: "km-mono" }, Mu = {
  key: 0,
  class: "km-dim"
}, Eu = { class: "km-req-meta" }, Tu = { class: "km-mono km-req-name" }, Fu = {
  key: 0,
  class: "km-req-flag"
}, Vu = {
  key: 1,
  class: "km-chip km-mono"
}, Du = ["aria-label", "disabled", "value", "list", "placeholder", "onInput"], Bu = ["id"], Ru = ["value", "title"], ju = {
  key: 1,
  class: "km-readonly-field km-mono"
}, Hu = { class: "km-req-foot" }, Uu = {
  key: 0,
  class: "km-req-src"
}, Nu = {
  key: 1,
  class: "km-req-invalid"
}, Ku = {
  key: 2,
  class: "km-req-invalid"
}, qu = {
  key: 3,
  class: "km-req-info"
}, Gu = {
  key: 4,
  class: "km-req-info"
}, Wu = ["aria-label"], Zu = { class: "km-mono" }, Yu = { class: "km-row-gap" }, Xu = {
  key: 3,
  class: "km-msg km-msg-err",
  role: "alert"
}, Ju = { class: "km-code" }, Qu = { key: 0 }, ed = {
  key: 4,
  class: "km-req-desc"
}, td = { class: "km-sec" }, nd = { class: "km-sec-title" }, od = {
  key: 0,
  class: "km-scan-run"
}, id = {
  key: 1,
  class: "km-msg km-msg-info"
}, sd = {
  key: 2,
  class: "km-scan-run"
}, ad = { class: "km-grow" }, ld = {
  key: 3,
  class: "km-empty-inline"
}, rd = {
  key: 4,
  class: "km-msg km-msg-err"
}, ud = {
  key: 5,
  class: "km-msg km-msg-info"
}, dd = {
  key: 0,
  class: "km-scan-overall"
}, cd = {
  key: 1,
  class: "km-msg km-msg-err"
}, pd = { class: "km-scan-mod-head" }, fd = { class: "km-mono km-scan-mod-name" }, md = { class: "km-chip" }, hd = {
  key: 0,
  class: "km-scan-mod-sum"
}, bd = { class: "km-grow km-min0" }, vd = { class: "km-finding-head" }, gd = { class: "km-finding-title" }, yd = {
  key: 0,
  class: "km-finding-detail"
}, kd = {
  key: 1,
  class: "km-finding-loc km-mono"
}, wd = ["onClick"], Sd = {
  key: 1,
  class: "km-dim km-scan-mod-clean"
}, $d = {
  key: 2,
  class: "km-check km-mt"
}, Cd = { class: "km-sec" }, Id = { class: "km-sec-title" }, _d = { class: "km-review-grid" }, xd = { class: "km-review-tile" }, Od = { class: "km-review-tile" }, Ld = { class: "km-review-tile" }, zd = { class: "km-review-tile" }, Ad = { class: "km-field" }, Pd = {
  key: 0,
  class: "km-hint"
}, Md = {
  key: 1,
  class: "km-mig-list"
}, Ed = { class: "km-mono km-trunc" }, Td = { class: "km-chip" }, Fd = { class: "km-hint" }, Vd = { class: "km-adv" }, Dd = { class: "km-adv-body" }, Bd = { class: "km-meta-row" }, Rd = { class: "km-mono" }, jd = { class: "km-meta-row" }, Hd = { class: "km-mono" }, Ud = {
  key: 0,
  class: "km-panel km-panel-ok"
}, Nd = { class: "km-panel-title" }, Kd = {
  key: 0,
  class: "km-dim"
}, qd = {
  key: 1,
  class: "km-dim"
}, Gd = {
  key: 0,
  class: "km-dim"
}, Wd = {
  key: 1,
  class: "km-ledger"
}, Zd = { class: "km-ledger-step" }, Yd = { class: "km-grow" }, Xd = { class: "km-chip" }, Jd = {
  key: 0,
  class: "km-ledger-msg"
}, Qd = {
  key: 2,
  class: "km-msg km-msg-err"
}, ec = {
  key: 0,
  class: "km-code"
}, tc = {
  key: 0,
  class: "km-running km-2p-progress"
}, nc = { class: "km-grow km-running-label" }, oc = { class: "km-dim" }, ic = {
  key: 0,
  class: "km-foot-note"
}, sc = /* @__PURE__ */ nn({
  __name: "InstallDialog",
  props: {
    open: { type: Boolean },
    mode: {},
    component: {},
    version: {},
    currentId: {},
    catalogItem: {},
    installedDep: {}
  },
  emits: ["close", "changed"],
  setup(e, { emit: t }) {
    const n = e, i = $r(n, t), l = [
      { key: "overview", label: "Overview", icon: "tabler:info-circle" },
      { key: "modules", label: "Modules", icon: "tabler:hierarchy-2" },
      { key: "requirements", label: "Requirements", icon: "tabler:adjustments" },
      { key: "scan", label: "Security scan", icon: "tabler:shield-check" },
      { key: "review", label: "Review & install", icon: "tabler:checklist" }
    ], p = q(() => n.catalogItem || { full_name: n.component, component: n.component }), b = q(() => fn(p.value)), v = q(() => n.mode === "update" ? "Update module" : "Install module");
    function k(B) {
      const d = i.requirementOptions(B), Q = i.requirementValue(B);
      return Q && !d.some((f) => f.value === Q) ? [{ label: `${Q} (current)`, value: Q }, ...d] : d;
    }
    function S(B) {
      return `km-req-options-${ue(B).replace(/[^a-zA-Z0-9_-]/g, "-")}`;
    }
    function _(B) {
      return {
        provided: "you set this",
        provided_bare: "you set this",
        existing: "auto-detected",
        existing_bare: "auto-detected",
        default: "package default",
        registry: "from registry",
        conflict: "multiple candidates — pick one"
      }[String(B.value_source || "")] || "";
    }
    const E = j(null), R = j(!1);
    let T;
    so(() => clearTimeout(T)), Ne(() => i.highlightTick.value, async (B, d, Q) => {
      let f = !0;
      if (Q(() => {
        f = !1;
      }), i.activeSection.value !== "requirements" || (await bn(), !f)) return;
      E.value?.querySelector(".km-req.is-missing, .km-req.is-invalid")?.scrollIntoView({ block: "center", behavior: "smooth" }), R.value = !0, clearTimeout(T), T = setTimeout(() => {
        R.value = !1;
      }, 1200);
    });
    function N(B) {
      return Po[B.severity].tone;
    }
    function z(B) {
      return B === "critical" || B === "error" ? "km-dot-danger" : B === "warnings" ? "km-dot-warn" : "km-dot-ok";
    }
    function K(B) {
      return `km-plan-badge kx-tag-caps km-plan-badge-${B}`;
    }
    function H(B) {
      return B === "failed" || B === "rollback_failed" ? "km-ledger-bad" : B === "rolled_back" ? "km-ledger-warn" : "km-ledger-ok";
    }
    const P = q(() => i.progressPhase.value || (n.mode === "update" ? "Updating…" : "Installing…"));
    return ao(() => {
      No("wc-render-markdown", { timeoutMs: 8e3 }).catch(() => {
      });
    }), (B, d) => {
      const Q = Oe("wc-render-markdown");
      return a(), ce(Wl, {
        visible: e.open,
        busy: o(i).running.value || o(i).dryRunning.value,
        label: v.value,
        class: "km-dialog km-dialog-2p",
        "header-class": "km-modal-head km-2p-head",
        "content-class": "km-dialog-content km-dialog-content-2p",
        "footer-class": "km-modal-foot km-2p-foot",
        style: qt({ "--accent": b.value }),
        onClose: d[19] || (d[19] = (f) => o(i).close())
      }, {
        header: ee(() => [
          r("span", Cr, [
            m(o(C), {
              icon: o(tn)(p.value),
              "aria-hidden": "true"
            }, null, 8, ["icon"])
          ]),
          r("span", Ir, [
            r("span", _r, c(v.value), 1),
            r("span", xr, [
              M(c(o(en)(p.value)) + " ", 1),
              r("span", Or, c(n.component), 1)
            ])
          ])
        ]),
        footer: ee(() => [
          o(i).running.value ? (a(), u("div", tc, [
            m(o(C), {
              icon: "tabler:loader-2",
              class: "km-i spin km-accent",
              "aria-hidden": "true"
            }),
            r("span", nc, c(P.value), 1),
            r("span", oc, c(o(i).elapsedSec.value) + "s", 1)
          ])) : (a(), u(X, { key: 1 }, [
            o(i).blockingSection.value === "requirements" ? (a(), u("span", ic, [
              m(o(C), {
                icon: "tabler:alert-triangle",
                class: "km-i-sm",
                "aria-hidden": "true"
              }),
              M(" " + c(o(i).requirementStatusMessage.value), 1)
            ])) : h("", !0),
            o(i).blockingSection.value === "requirements" ? (a(), ce(o(le), {
              key: 1,
              size: "small",
              severity: "secondary",
              outlined: "",
              disabled: o(i).autoFitCount.value === 0,
              onClick: d[15] || (d[15] = (f) => o(i).autoFitRequirements())
            }, {
              default: ee(() => [
                m(o(C), {
                  icon: "tabler:wand",
                  class: "km-i",
                  "aria-hidden": "true"
                }),
                d[75] || (d[75] = M(" Auto-fit ", -1))
              ]),
              _: 1
            }, 8, ["disabled"])) : h("", !0),
            d[78] || (d[78] = r("span", { class: "km-grow" }, null, -1)),
            m(o(le), {
              size: "small",
              severity: "secondary",
              text: "",
              onClick: d[16] || (d[16] = (f) => o(i).close())
            }, {
              default: ee(() => [...d[76] || (d[76] = [
                M("Cancel", -1)
              ])]),
              _: 1
            }),
            m(o(le), {
              size: "small",
              severity: "secondary",
              outlined: "",
              disabled: o(i).previewDisabled.value,
              onClick: d[17] || (d[17] = (f) => o(i).preview())
            }, {
              default: ee(() => [
                m(o(C), {
                  icon: o(i).dryRunning.value ? "tabler:loader-2" : "tabler:eye",
                  class: ne(["km-i", o(i).dryRunning.value && "spin"]),
                  "aria-hidden": "true"
                }, null, 8, ["icon", "class"]),
                d[77] || (d[77] = M(" Preview changes ", -1))
              ]),
              _: 1
            }, 8, ["disabled"]),
            m(o(le), {
              size: "small",
              disabled: o(i).primaryDisabled.value,
              onClick: d[18] || (d[18] = (f) => o(i).primaryAction())
            }, {
              default: ee(() => [
                m(o(C), {
                  icon: n.mode === "update" ? "tabler:refresh-dot" : "tabler:download",
                  class: "km-i",
                  "aria-hidden": "true"
                }, null, 8, ["icon"]),
                M(" " + c(o(i).primaryLabel.value), 1)
              ]),
              _: 1
            }, 8, ["disabled"])
          ], 64))
        ]),
        default: ee(() => [
          r("div", Lr, [
            r("nav", zr, [
              (a(), u(X, null, se(l, (f) => r("button", {
                key: f.key,
                class: ne(["km-2p-navitem", { active: o(i).activeSection.value === f.key }]),
                onClick: (w) => o(i).activeSection.value = f.key
              }, [
                m(o(C), {
                  icon: f.icon,
                  class: "km-i",
                  "aria-hidden": "true"
                }, null, 8, ["icon"]),
                r("span", Pr, c(f.label), 1),
                r("span", Mr, [
                  o(i).sectionStatus.value[f.key].tone === "loading" ? (a(), ce(o(C), {
                    key: 0,
                    icon: "tabler:loader-2",
                    class: "km-i-sm spin km-dim",
                    "aria-hidden": "true"
                  })) : o(i).sectionStatus.value[f.key].tone === "ok" ? (a(), ce(o(C), {
                    key: 1,
                    icon: "tabler:circle-check-filled",
                    class: "km-i-sm km-sev-ok-fg",
                    "aria-hidden": "true"
                  })) : o(i).sectionStatus.value[f.key].tone === "danger" ? (a(), u("span", Er)) : o(i).sectionStatus.value[f.key].tone === "warn" ? (a(), u("span", Tr)) : h("", !0),
                  o(i).sectionStatus.value[f.key].badge ? (a(), u("span", Fr, c(o(i).sectionStatus.value[f.key].badge), 1)) : h("", !0)
                ])
              ], 10, Ar)), 64))
            ]),
            r("div", {
              ref_key: "mainRef",
              ref: E,
              class: "km-2p-main"
            }, [
              De(r("section", Vr, [
                r("div", Dr, [
                  r("span", Br, [
                    m(o(C), {
                      icon: o(tn)(p.value),
                      class: "km-i-lg",
                      "aria-hidden": "true"
                    }, null, 8, ["icon"])
                  ]),
                  r("div", Rr, [
                    r("div", jr, [
                      r("span", Hr, c(o(en)(p.value)), 1),
                      o(dn)(p.value) ? (a(), u("span", Ur, "app")) : h("", !0),
                      p.value.deprecated ? (a(), u("span", Nr, "deprecated")) : h("", !0)
                    ]),
                    r("div", Kr, c(n.component), 1)
                  ])
                ]),
                p.value.description ? (a(), u("p", qr, c(p.value.description), 1)) : h("", !0),
                n.mode === "update" && !n.currentId ? (a(), u("p", Gr, " Updating this module creates an application root dependency for the selected version. This version also applies to modules that depend on it; the plan shows any conflicts. ")) : h("", !0),
                r("div", Wr, [
                  d[21] || (d[21] = r("label", { class: "km-label" }, "Version", -1)),
                  m(Ao, {
                    modelValue: o(i).version.value,
                    "onUpdate:modelValue": d[0] || (d[0] = (f) => o(i).version.value = f),
                    items: o(i).versionOptions.value.map((f) => ({ id: f.value, title: f.label })),
                    placeholder: "latest",
                    "aria-label": "Version"
                  }, null, 8, ["modelValue", "items"]),
                  r("div", Zr, [
                    r("button", {
                      class: ne(["km-seg-btn", { active: o(i).versionMode.value === "pin" }]),
                      "aria-pressed": o(i).versionMode.value === "pin",
                      onClick: d[1] || (d[1] = (f) => o(i).versionMode.value = "pin")
                    }, [
                      m(o(C), {
                        icon: "tabler:pin",
                        class: "km-i-sm",
                        "aria-hidden": "true"
                      }),
                      M(" Pin " + c(o(i).version.value || "latest"), 1)
                    ], 10, Yr),
                    r("button", {
                      class: ne(["km-seg-btn", { active: o(i).versionMode.value === "track" }]),
                      "aria-pressed": o(i).versionMode.value === "track",
                      onClick: d[2] || (d[2] = (f) => o(i).versionMode.value = "track")
                    }, [
                      m(o(C), {
                        icon: "tabler:arrow-up-circle",
                        class: "km-i-sm",
                        "aria-hidden": "true"
                      }),
                      d[20] || (d[20] = M(" Track updates ", -1))
                    ], 10, Xr)
                  ]),
                  r("p", Jr, c(o(i).versionMode.value === "pin" ? "Locks to this exact version; future updates are manual." : `Tracks ${o(i).version.value ? "≥ " + o(i).version.value : "all"} releases on the next resolve.`), 1)
                ]),
                r("div", Qr, [
                  r("div", eu, [
                    m(o(C), {
                      icon: "tabler:download",
                      class: "km-i-sm",
                      "aria-hidden": "true"
                    }),
                    d[22] || (d[22] = r("span", null, "Downloads", -1)),
                    r("b", null, c(o(mn)(p.value.total_downloads)), 1)
                  ]),
                  p.value.favorites_count ? (a(), u("div", tu, [
                    m(o(C), {
                      icon: "tabler:star",
                      class: "km-i-sm",
                      "aria-hidden": "true"
                    }),
                    d[23] || (d[23] = r("span", null, "Favorites", -1)),
                    r("b", null, c(p.value.favorites_count), 1)
                  ])) : h("", !0),
                  p.value.license ? (a(), u("div", nu, [
                    m(o(C), {
                      icon: "tabler:license",
                      class: "km-i-sm",
                      "aria-hidden": "true"
                    }),
                    d[24] || (d[24] = r("span", null, "License", -1)),
                    r("b", {
                      title: p.value.license
                    }, c(o(Fn)(p.value.license)), 9, ou)
                  ])) : h("", !0),
                  p.value.type ? (a(), u("div", iu, [
                    m(o(C), {
                      icon: "tabler:category",
                      class: "km-i-sm",
                      "aria-hidden": "true"
                    }),
                    d[25] || (d[25] = r("span", null, "Type", -1)),
                    r("b", null, c(p.value.type), 1)
                  ])) : h("", !0),
                  o(i).versionMeta.value?.entry_count ? (a(), u("div", su, [
                    m(o(C), {
                      icon: "tabler:list-numbers",
                      class: "km-i-sm",
                      "aria-hidden": "true"
                    }),
                    d[26] || (d[26] = r("span", null, "Entries", -1)),
                    r("b", null, c(o(i).versionMeta.value.entry_count), 1)
                  ])) : h("", !0),
                  o(i).versionMeta.value?.size_bytes ? (a(), u("div", au, [
                    m(o(C), {
                      icon: "tabler:weight",
                      class: "km-i-sm",
                      "aria-hidden": "true"
                    }),
                    d[27] || (d[27] = r("span", null, "Size", -1)),
                    r("b", null, c(o(cn)(o(i).versionMeta.value.size_bytes)), 1)
                  ])) : h("", !0),
                  p.value.update_time ? (a(), u("div", lu, [
                    m(o(C), {
                      icon: "tabler:clock",
                      class: "km-i-sm",
                      "aria-hidden": "true"
                    }),
                    d[28] || (d[28] = r("span", null, "Updated", -1)),
                    r("b", null, c(o(Vn)(p.value.update_time, { maxUnit: "year" })), 1)
                  ])) : h("", !0)
                ]),
                o(i).readmeLoading.value ? (a(), u("div", ru, [
                  m(o(C), {
                    icon: "tabler:loader-2",
                    class: "km-i spin",
                    "aria-hidden": "true"
                  }),
                  d[29] || (d[29] = M(" Loading README…", -1))
                ])) : o(i).readme.value ? (a(), u("article", uu, [
                  m(Q, {
                    source: o(i).readme.value
                  }, null, 8, ["source"])
                ])) : h("", !0)
              ], 512), [
                [rn, o(i).activeSection.value === "overview"]
              ]),
              De(r("section", du, [
                o(i).planLoading.value ? (a(), u(X, { key: 0 }, [
                  d[30] || (d[30] = r("div", {
                    class: "km-skel km-skel-line",
                    style: { width: "40%" }
                  }, null, -1)),
                  (a(), u(X, null, se(4, (f) => r("div", {
                    class: "km-skel km-skel-card",
                    key: f
                  })), 64))
                ], 64)) : o(i).planError.value ? (a(), u("div", cu, [
                  o(i).planCode.value ? (a(), u("span", pu, c(o(i).planCode.value), 1)) : h("", !0),
                  M(c(o(i).planError.value), 1)
                ])) : o(i).plan.value ? (a(), u(X, { key: 2 }, [
                  r("div", fu, [
                    m(o(C), {
                      icon: "tabler:hierarchy-2",
                      class: "km-i km-accent",
                      "aria-hidden": "true"
                    }),
                    M(" Installs " + c(o(i).moduleCount.value) + " module" + c(o(i).moduleCount.value === 1 ? "" : "s") + " ", 1),
                    o(i).totalSize.value ? (a(), u("span", mu, "· " + c(o(cn)(o(i).totalSize.value)), 1)) : h("", !0)
                  ]),
                  d[32] || (d[32] = r("p", { class: "km-hint" }, "Includes these dependencies at the versions shown.", -1)),
                  (a(!0), u(X, null, se(o(i).planRows.value, (f) => (a(), u("div", {
                    key: f.path || f.module,
                    class: ne(["km-mrow", { "km-mrow-direct": f.direct || f.module === n.component, "km-mrow-transitive": !(f.direct || f.module === n.component) }]),
                    style: qt({ "--tree-level": f.level })
                  }, [
                    f.level > 0 ? (a(), ce(o(C), {
                      key: 0,
                      icon: "tabler:corner-down-right",
                      class: "km-i-sm km-dim",
                      "aria-hidden": "true"
                    })) : (a(), u("span", hu)),
                    r("span", bu, c(f.direct || f.module === n.component ? "direct" : "transitive"), 1),
                    r("span", vu, c(f.module), 1),
                    f.version ? (a(), u("span", gu, c(f.version), 1)) : h("", !0),
                    f.constraint ? (a(), u("span", yu, c(f.constraint), 1)) : h("", !0),
                    d[31] || (d[31] = r("span", { class: "km-grow" }, null, -1)),
                    (a(!0), u(X, null, se(o(i).badgesForNode(f), (w) => (a(), u("span", {
                      key: w.label,
                      class: ne(K(w.tone))
                    }, c(w.label), 3))), 128)),
                    f.size_bytes ? (a(), u("span", ku, c(o(cn)(f.size_bytes)), 1)) : h("", !0)
                  ], 6))), 128))
                ], 64)) : h("", !0)
              ], 512), [
                [rn, o(i).activeSection.value === "modules"]
              ]),
              De(r("section", wu, [
                o(i).planLoading.value ? (a(), u(X, { key: 0 }, [
                  d[33] || (d[33] = r("div", {
                    class: "km-skel km-skel-line",
                    style: { width: "30%" }
                  }, null, -1)),
                  (a(), u(X, null, se(3, (f) => r("div", {
                    class: "km-skel km-skel-field",
                    key: f
                  })), 64))
                ], 64)) : o(i).requirements.value.length ? (a(), u(X, { key: 2 }, [
                  r("div", $u, [
                    m(o(C), {
                      icon: "tabler:adjustments",
                      class: "km-i km-accent",
                      "aria-hidden": "true"
                    }),
                    d[35] || (d[35] = M(" Configuration ", -1)),
                    r("span", Cu, "(" + c(o(i).boundRequirementCount.value) + "/" + c(o(i).requirements.value.length) + " set)", 1)
                  ]),
                  r("div", Iu, [
                    d[37] || (d[37] = r("p", { class: "km-hint km-grow" }, "Connect required resources. Resources already configured by a dependency are shown for review.", -1)),
                    o(i).aiResolvableCount.value ? (a(), ce(o(le), {
                      key: 0,
                      size: "small",
                      severity: "secondary",
                      outlined: "",
                      disabled: o(i).aiResolving.value || !o(i).planCurrent.value,
                      onClick: d[3] || (d[3] = (f) => o(i).resolveRequirementsWithAI(E.value))
                    }, {
                      default: ee(() => [
                        m(o(C), {
                          icon: o(i).aiResolving.value ? "tabler:loader-2" : "tabler:sparkles",
                          class: ne(["km-i", o(i).aiResolving.value && "spin"]),
                          "aria-hidden": "true"
                        }, null, 8, ["icon", "class"]),
                        M(" " + c(o(i).aiResolving.value ? "Resolving…" : "Resolve with AI"), 1)
                      ]),
                      _: 1
                    }, 8, ["disabled"])) : h("", !0),
                    o(i).missingRequirements.value.length ? (a(), ce(o(le), {
                      key: 1,
                      size: "small",
                      severity: "secondary",
                      outlined: "",
                      disabled: o(i).autoFitCount.value === 0,
                      onClick: d[4] || (d[4] = (f) => o(i).autoFitRequirements())
                    }, {
                      default: ee(() => [
                        m(o(C), {
                          icon: "tabler:wand",
                          class: "km-i",
                          "aria-hidden": "true"
                        }),
                        d[36] || (d[36] = M(" Auto-fit ", -1))
                      ]),
                      _: 1
                    }, 8, ["disabled"])) : h("", !0)
                  ]),
                  o(i).aiResolutionNotice.value ? (a(), u("div", {
                    key: 0,
                    class: ne(["km-msg", o(i).aiResolutionNotice.value.tone === "success" ? "km-msg-ok" : "km-msg-warn"]),
                    role: "status"
                  }, [
                    o(i).aiResolutionNotice.value.code ? (a(), u("span", _u, c(o(i).aiResolutionNotice.value.code), 1)) : h("", !0),
                    o(i).aiResolutionNotice.value.kind ? (a(), u("span", xu, c(o(i).aiResolutionNotice.value.kind), 1)) : h("", !0),
                    M(" " + c(o(i).aiResolutionNotice.value.message) + " ", 1),
                    o(i).aiResolutionNotice.value.details ? (a(), u("pre", Ou, c(JSON.stringify(o(i).aiResolutionNotice.value.details, null, 2)), 1)) : h("", !0)
                  ], 2)) : h("", !0),
                  o(i).pendingCount.value ? (a(), u("div", Lu, [
                    r("span", zu, "Review " + c(o(i).pendingCount.value) + " AI suggestion" + c(o(i).pendingCount.value === 1 ? "" : "s") + " before applying.", 1),
                    m(o(le), {
                      size: "small",
                      disabled: !o(i).planCurrent.value,
                      onClick: d[5] || (d[5] = (f) => o(i).acceptSuggestions(Object.keys(o(i).pendingSuggestions.value)))
                    }, {
                      default: ee(() => [...d[38] || (d[38] = [
                        M("Accept all", -1)
                      ])]),
                      _: 1
                    }, 8, ["disabled"]),
                    m(o(le), {
                      size: "small",
                      severity: "secondary",
                      onClick: d[6] || (d[6] = (f) => o(i).rejectSuggestions(Object.keys(o(i).pendingSuggestions.value)))
                    }, {
                      default: ee(() => [...d[39] || (d[39] = [
                        M("Reject all", -1)
                      ])]),
                      _: 1
                    }),
                    m(o(le), {
                      size: "small",
                      severity: "secondary",
                      disabled: !o(i).planCurrent.value,
                      onClick: d[7] || (d[7] = (f) => o(i).editSuggestions(Object.keys(o(i).pendingSuggestions.value)))
                    }, {
                      default: ee(() => [...d[40] || (d[40] = [
                        M("Edit all", -1)
                      ])]),
                      _: 1
                    }, 8, ["disabled"])
                  ])) : h("", !0),
                  (a(!0), u(X, null, se(o(i).requirementGroups.value, (f) => (a(), u("div", {
                    key: f.module,
                    class: "km-req-group"
                  }, [
                    r("div", Au, [
                      m(o(C), {
                        icon: f.direct ? "tabler:package" : "tabler:corner-down-right",
                        class: "km-i-sm",
                        "aria-hidden": "true"
                      }, null, 8, ["icon"]),
                      r("span", Pu, c(f.module), 1),
                      f.direct ? h("", !0) : (a(), u("span", Mu, "dependency"))
                    ]),
                    (a(!0), u(X, null, se(f.items, (w) => (a(), u("div", {
                      key: o(ue)(w),
                      class: ne(["km-req", { "is-missing": o(i).requirementMissing(w), "is-invalid": o(i).requirementTypeInvalid(w), "is-flash": R.value && (o(i).requirementMissing(w) || o(i).requirementTypeInvalid(w)) }])
                    }, [
                      r("div", Eu, [
                        r("span", Tu, c(w.name || o(ue)(w)), 1),
                        w.required || w.missing ? (a(), u("span", Fu, "required")) : h("", !0),
                        w.expected_kind ? (a(), u("span", Vu, c(w.expected_kind), 1)) : h("", !0),
                        d[42] || (d[42] = r("span", { class: "km-grow" }, null, -1)),
                        o(i).requirementMissing(w) && o(i).canAutoFitRequirement(w) ? (a(), ce(o(le), {
                          key: 2,
                          size: "small",
                          severity: "secondary",
                          outlined: "",
                          class: "km-req-fit",
                          onClick: (A) => o(i).autoFitRequirement(w)
                        }, {
                          default: ee(() => [
                            m(o(C), {
                              icon: "tabler:wand",
                              class: "km-i-sm",
                              "aria-hidden": "true"
                            }),
                            d[41] || (d[41] = M(" Auto-fit ", -1))
                          ]),
                          _: 1
                        }, 8, ["onClick"])) : h("", !0)
                      ]),
                      o(i).requirementReadOnly(w) ? (a(), u("div", ju, c(o(i).requirementValue(w) || o(i).displayValue(w.default) || "not set"), 1)) : (a(), u(X, { key: 0 }, [
                        r("input", {
                          class: "km-input km-w-full",
                          "aria-label": w.name || o(ue)(w),
                          disabled: o(i).running.value || o(i).dryRunning.value,
                          value: o(i).requirementValue(w),
                          list: k(w).length ? S(w) : void 0,
                          placeholder: o(i).displayValue(w.default) || (w.expected_kind ? `Enter ${w.expected_kind} id` : "Enter registry id or value"),
                          onInput: (A) => o(i).setParameter(w, A.target.value)
                        }, null, 40, Du),
                        k(w).length ? (a(), u("datalist", {
                          key: 0,
                          id: S(w)
                        }, [
                          (a(!0), u(X, null, se(k(w), (A) => (a(), u("option", {
                            key: A.value,
                            value: A.value,
                            title: A.title
                          }, c(A.label), 9, Ru))), 128))
                        ], 8, Bu)) : h("", !0)
                      ], 64)),
                      r("div", Hu, [
                        _(w) ? (a(), u("span", Uu, [
                          m(o(C), {
                            icon: "tabler:wand",
                            class: "km-i-xs",
                            "aria-hidden": "true"
                          }),
                          M(" " + c(_(w)), 1)
                        ])) : h("", !0),
                        o(i).requirementTypeInvalid(w) ? (a(), u("span", Nu, [
                          m(o(C), {
                            icon: "tabler:alert-triangle",
                            class: "km-i-xs",
                            "aria-hidden": "true"
                          }),
                          M(" " + c(o(i).requirementTypeHint(w)), 1)
                        ])) : w.invalid ? (a(), u("span", Ku, [
                          m(o(C), {
                            icon: "tabler:alert-triangle",
                            class: "km-i-xs",
                            "aria-hidden": "true"
                          }),
                          M(" " + c(w.invalid_reason || "invalid value"), 1)
                        ])) : h("", !0),
                        o(i).requirementMissing(w) && !o(i).canAutoFitRequirement(w) ? (a(), u("span", qu, [
                          m(o(C), {
                            icon: "tabler:hand-click",
                            class: "km-i-xs",
                            "aria-hidden": "true"
                          }),
                          d[43] || (d[43] = M(" choose a value to continue ", -1))
                        ])) : h("", !0),
                        o(i).requirementReadOnly(w) ? (a(), u("span", Gu, [
                          m(o(C), {
                            icon: "tabler:lock",
                            class: "km-i-xs",
                            "aria-hidden": "true"
                          }),
                          M(" configured by " + c(o(i).requirementConfiguredBy(w)) + "; install it directly to override ", 1)
                        ])) : h("", !0)
                      ]),
                      o(i).pendingSuggestions.value[o(ue)(w)] ? (a(), u("div", {
                        key: 2,
                        class: "km-ai-proposal",
                        role: "group",
                        "aria-label": `AI suggestion for ${w.name || o(ue)(w)}`
                      }, [
                        r("div", Zu, "Suggested value: " + c(o(i).displayValue(o(i).pendingSuggestions.value[o(ue)(w)].value)), 1),
                        r("p", null, c(o(i).pendingSuggestions.value[o(ue)(w)].choice_reason), 1),
                        r("div", Yu, [
                          m(o(le), {
                            size: "small",
                            disabled: !o(i).planCurrent.value,
                            onClick: (A) => o(i).acceptSuggestions([o(ue)(w)])
                          }, {
                            default: ee(() => [...d[44] || (d[44] = [
                              M("Accept", -1)
                            ])]),
                            _: 1
                          }, 8, ["disabled", "onClick"]),
                          m(o(le), {
                            size: "small",
                            severity: "secondary",
                            onClick: (A) => o(i).rejectSuggestions([o(ue)(w)])
                          }, {
                            default: ee(() => [...d[45] || (d[45] = [
                              M("Reject", -1)
                            ])]),
                            _: 1
                          }, 8, ["onClick"]),
                          m(o(le), {
                            size: "small",
                            severity: "secondary",
                            onClick: (A) => o(i).editSuggestions([o(ue)(w)])
                          }, {
                            default: ee(() => [...d[46] || (d[46] = [
                              M("Edit", -1)
                            ])]),
                            _: 1
                          }, 8, ["onClick"])
                        ])
                      ], 8, Wu)) : h("", !0),
                      w.resolution_error ? (a(), u("div", Xu, [
                        r("span", Ju, c(w.resolution_error.kind || w.resolution_error.code), 1),
                        M(" " + c(w.resolution_error.message) + " ", 1),
                        w.resolution_error.details ? (a(), u("pre", Qu, c(JSON.stringify(w.resolution_error.details, null, 2)), 1)) : h("", !0)
                      ])) : h("", !0),
                      w.description ? (a(), u("div", ed, c(w.description), 1)) : h("", !0)
                    ], 2))), 128))
                  ]))), 128))
                ], 64)) : (a(), u("div", Su, [
                  m(o(C), {
                    icon: "tabler:circle-check",
                    class: "km-i-lg km-sev-ok-fg",
                    "aria-hidden": "true"
                  }),
                  d[34] || (d[34] = r("p", null, "Nothing to configure — this module needs no additional resources.", -1))
                ]))
              ], 512), [
                [rn, o(i).activeSection.value === "requirements"]
              ]),
              De(r("section", td, [
                r("div", nd, [
                  m(o(C), {
                    icon: "tabler:shield-check",
                    class: "km-i km-accent",
                    "aria-hidden": "true"
                  }),
                  d[47] || (d[47] = M(" Security scan", -1))
                ]),
                d[60] || (d[60] = r("p", { class: "km-hint" }, "An agent reviews the code of every module being installed. Heuristic, not a guarantee — review flagged items before proceeding.", -1)),
                o(i).scan.value.status === "idle" ? (a(), u("div", od, [
                  m(o(C), {
                    icon: "tabler:shield-question",
                    class: "km-i km-accent",
                    "aria-hidden": "true"
                  }),
                  d[50] || (d[50] = r("span", { class: "km-grow" }, "Security scan not run. Running the reviewer may spend LLM tokens.", -1)),
                  m(o(le), {
                    size: "small",
                    severity: "secondary",
                    outlined: "",
                    onClick: d[8] || (d[8] = (f) => o(i).skipScan())
                  }, {
                    default: ee(() => [
                      m(o(C), {
                        icon: "tabler:player-skip-forward",
                        class: "km-i",
                        "aria-hidden": "true"
                      }),
                      d[48] || (d[48] = M(" Skip scan ", -1))
                    ]),
                    _: 1
                  }),
                  m(o(le), {
                    size: "small",
                    disabled: !o(i).planCurrent.value,
                    onClick: d[9] || (d[9] = (f) => o(i).runScanNow())
                  }, {
                    default: ee(() => [
                      m(o(C), {
                        icon: "tabler:shield-check",
                        class: "km-i",
                        "aria-hidden": "true"
                      }),
                      d[49] || (d[49] = M(" Run scan ", -1))
                    ]),
                    _: 1
                  }, 8, ["disabled"])
                ])) : o(i).scan.value.status === "skipped" ? (a(), u("div", id, [
                  m(o(C), {
                    icon: "tabler:shield-off",
                    class: "km-i",
                    "aria-hidden": "true"
                  }),
                  d[52] || (d[52] = M(" Security scan skipped. Install can continue without spending reviewer tokens. ", -1)),
                  m(o(le), {
                    size: "small",
                    severity: "secondary",
                    outlined: "",
                    class: "km-mt",
                    disabled: !o(i).planCurrent.value,
                    onClick: d[10] || (d[10] = (f) => o(i).runScanNow())
                  }, {
                    default: ee(() => [
                      m(o(C), {
                        icon: "tabler:shield-check",
                        class: "km-i",
                        "aria-hidden": "true"
                      }),
                      d[51] || (d[51] = M(" Run scan", -1))
                    ]),
                    _: 1
                  }, 8, ["disabled"])
                ])) : o(i).scan.value.status === "scanning" ? (a(), u("div", sd, [
                  m(o(C), {
                    icon: "tabler:loader-2",
                    class: "km-i spin km-accent",
                    "aria-hidden": "true"
                  }),
                  r("span", ad, [
                    M("Scanning " + c(o(i).scan.value.total || "") + " module" + c(o(i).scan.value.total === 1 ? "" : "s") + "… ", 1),
                    d[53] || (d[53] = r("span", { class: "km-dim" }, "this can take a moment", -1))
                  ])
                ])) : o(i).scan.value.status === "clean" ? (a(), u("div", ld, [
                  m(o(C), {
                    icon: "tabler:shield-check-filled",
                    class: "km-i-lg km-sev-ok-fg",
                    "aria-hidden": "true"
                  }),
                  r("p", null, "No issues found across " + c(o(i).scan.value.scanned) + " module" + c(o(i).scan.value.scanned === 1 ? "" : "s") + ".", 1)
                ])) : o(i).scan.value.status === "error" ? (a(), u("div", rd, [
                  M(" Scan failed: " + c(o(i).scan.value.error) + " ", 1),
                  m(o(le), {
                    size: "small",
                    severity: "secondary",
                    outlined: "",
                    class: "km-mt",
                    disabled: !o(i).planCurrent.value,
                    onClick: d[11] || (d[11] = (f) => o(i).runScanNow())
                  }, {
                    default: ee(() => [
                      m(o(C), {
                        icon: "tabler:refresh",
                        class: "km-i",
                        "aria-hidden": "true"
                      }),
                      d[54] || (d[54] = M(" Retry", -1))
                    ]),
                    _: 1
                  }, 8, ["disabled"])
                ])) : o(i).scan.value.status === "unavailable" ? (a(), u("div", ud, [
                  m(o(C), {
                    icon: "tabler:shield-off",
                    class: "km-i",
                    "aria-hidden": "true"
                  }),
                  d[56] || (d[56] = M(" Security scan unavailable ", -1)),
                  m(o(le), {
                    size: "small",
                    severity: "secondary",
                    outlined: "",
                    class: "km-mt",
                    disabled: !o(i).planCurrent.value,
                    onClick: d[12] || (d[12] = (f) => o(i).runScanNow())
                  }, {
                    default: ee(() => [
                      m(o(C), {
                        icon: "tabler:refresh",
                        class: "km-i",
                        "aria-hidden": "true"
                      }),
                      d[55] || (d[55] = M(" Retry", -1))
                    ]),
                    _: 1
                  }, 8, ["disabled"])
                ])) : (a(), u(X, { key: 6 }, [
                  o(i).scan.value.summary ? (a(), u("p", dd, c(o(i).scan.value.summary), 1)) : h("", !0),
                  o(i).scan.value.status === "critical" ? (a(), u("div", cd, [
                    m(o(C), {
                      icon: "tabler:shield-x",
                      class: "km-i",
                      "aria-hidden": "true"
                    }),
                    d[57] || (d[57] = M(" Critical findings must be reviewed and confirmed before install.", -1))
                  ])) : h("", !0),
                  (a(!0), u(X, null, se(o(i).scan.value.modules, (f) => (a(), u("div", {
                    key: f.module,
                    class: "km-scan-mod"
                  }, [
                    r("div", pd, [
                      r("span", {
                        class: ne(["km-dot", z(f.status)]),
                        "aria-hidden": "true"
                      }, null, 2),
                      r("span", fd, [
                        M(c(f.module), 1),
                        f.version ? (a(), u(X, { key: 0 }, [
                          M("@" + c(f.version), 1)
                        ], 64)) : h("", !0)
                      ]),
                      d[58] || (d[58] = r("span", { class: "km-grow" }, null, -1)),
                      r("span", md, c(f.status), 1)
                    ]),
                    f.summary ? (a(), u("p", hd, c(f.summary), 1)) : h("", !0),
                    (a(!0), u(X, null, se(f.findings, (w) => (a(), u("div", {
                      key: w.id,
                      class: ne(["km-finding", `km-sev-${N(w)}`])
                    }, [
                      m(o(C), {
                        icon: o(Po)[w.severity].icon,
                        class: "km-i km-finding-icon",
                        "aria-hidden": "true"
                      }, null, 8, ["icon"]),
                      r("div", bd, [
                        r("div", vd, [
                          r("span", gd, c(w.title), 1)
                        ]),
                        w.detail ? (a(), u("div", yd, c(w.detail), 1)) : h("", !0),
                        w.location ? (a(), u("div", kd, c(w.location), 1)) : h("", !0),
                        w.severity !== "critical" ? (a(), u("button", {
                          key: 2,
                          class: ne(["km-ack", { done: o(i).acknowledged.value.has(w.id) }]),
                          onClick: (A) => o(i).acknowledge(w)
                        }, [
                          m(o(C), {
                            icon: o(i).acknowledged.value.has(w.id) ? "tabler:check" : "tabler:eye",
                            class: "km-i-xs",
                            "aria-hidden": "true"
                          }, null, 8, ["icon"]),
                          M(" " + c(o(i).acknowledged.value.has(w.id) ? "Acknowledged" : "Acknowledge"), 1)
                        ], 10, wd)) : h("", !0)
                      ])
                    ], 2))), 128)),
                    f.findings.length ? h("", !0) : (a(), u("p", Sd, "No issues in this module."))
                  ]))), 128)),
                  o(i).scan.value.status === "critical" ? (a(), u("label", $d, [
                    De(r("input", {
                      type: "checkbox",
                      "onUpdate:modelValue": d[13] || (d[13] = (f) => o(i).criticalConfirmed.value = f)
                    }, null, 512), [
                      [Ni, o(i).criticalConfirmed.value]
                    ]),
                    d[59] || (d[59] = r("span", null, "I understand the critical findings and want to install anyway.", -1))
                  ])) : h("", !0)
                ], 64))
              ], 512), [
                [rn, o(i).activeSection.value === "scan"]
              ]),
              De(r("section", Cd, [
                r("div", Id, [
                  m(o(C), {
                    icon: "tabler:checklist",
                    class: "km-i km-accent",
                    "aria-hidden": "true"
                  }),
                  d[61] || (d[61] = M(" Review & install", -1))
                ]),
                r("div", _d, [
                  r("div", xd, [
                    m(o(C), {
                      icon: "tabler:package",
                      class: "km-i km-accent",
                      "aria-hidden": "true"
                    }),
                    r("b", null, c(o(i).moduleCount.value), 1),
                    d[62] || (d[62] = r("span", null, "modules", -1))
                  ]),
                  r("div", Od, [
                    m(o(C), {
                      icon: "tabler:adjustments",
                      class: "km-i km-accent",
                      "aria-hidden": "true"
                    }),
                    r("b", null, c(o(i).boundRequirementCount.value) + "/" + c(o(i).requirements.value.length), 1),
                    d[63] || (d[63] = r("span", null, "configured", -1))
                  ]),
                  r("div", Ld, [
                    m(o(C), {
                      icon: "tabler:database",
                      class: "km-i km-accent",
                      "aria-hidden": "true"
                    }),
                    r("b", null, c(o(i).migrations.value.length), 1),
                    d[64] || (d[64] = r("span", null, "migrations", -1))
                  ]),
                  r("div", zd, [
                    m(o(C), {
                      icon: o(i).scan.value.status === "clean" ? "tabler:shield-check" : o(i).scan.value.status === "critical" ? "tabler:shield-x" : o(i).scan.value.status === "skipped" ? "tabler:shield-off" : "tabler:shield",
                      class: "km-i km-accent",
                      "aria-hidden": "true"
                    }, null, 8, ["icon"]),
                    r("b", null, c(o(i).scan.value.status === "scanning" ? "…" : o(i).scan.value.status === "skipped" || o(i).scan.value.status === "idle" ? "—" : o(i).scan.value.findings.length), 1),
                    d[65] || (d[65] = r("span", null, "scan findings", -1))
                  ])
                ]),
                r("div", Ad, [
                  d[68] || (d[68] = r("label", { class: "km-label" }, "Migration policy", -1)),
                  m(Ao, {
                    modelValue: o(i).migrationPolicy.value,
                    "onUpdate:modelValue": d[14] || (d[14] = (f) => o(i).migrationPolicy.value = f),
                    items: o(i).migrationOptions.value.map((f) => ({ id: f.value, title: f.label })),
                    "aria-label": "Migration policy"
                  }, null, 8, ["modelValue", "items"]),
                  o(i).requiredSetup.value ? (a(), u("p", Pd, "This module requires setup. Installation completes after migrations and setup pass verification.")) : h("", !0),
                  o(i).migrations.value.length ? (a(), u("div", Md, [
                    (a(!0), u(X, null, se(o(i).migrations.value, (f) => (a(), u("div", {
                      key: f.id,
                      class: "km-mig-row"
                    }, [
                      m(o(C), {
                        icon: "tabler:database-import",
                        class: "km-i-xs km-dim",
                        "aria-hidden": "true"
                      }),
                      r("span", Ed, c(f.id), 1),
                      d[66] || (d[66] = r("span", { class: "km-grow" }, null, -1)),
                      r("span", Td, c(f.status), 1)
                    ]))), 128))
                  ])) : h("", !0),
                  r("p", Fd, [
                    m(o(C), {
                      icon: "tabler:shield-lock",
                      class: "km-i-xs",
                      "aria-hidden": "true"
                    }),
                    d[67] || (d[67] = M(" Changes are transactional — if any step fails, the registry, lock and migrations are rolled back.", -1))
                  ])
                ]),
                r("details", Vd, [
                  d[71] || (d[71] = r("summary", null, "Advanced", -1)),
                  r("div", Dd, [
                    r("div", Bd, [
                      d[69] || (d[69] = r("span", null, "Installs as", -1)),
                      r("b", Rd, c(o(i).destinationId.value || "—"), 1)
                    ]),
                    r("div", jd, [
                      d[70] || (d[70] = r("span", null, "Version", -1)),
                      r("b", Hd, c(o(i).versionMode.value === "pin" ? o(i).version.value || "latest" : "≥ " + (o(i).version.value || "0.0.0")), 1)
                    ])
                  ])
                ]),
                o(i).result.value ? (a(), u("div", Ud, [
                  r("div", Nd, c(o(i).result.value.dry_run ? "Dry-run preview" : "Applied"), 1),
                  o(i).result.value.dry_run ? (a(), u(X, { key: 0 }, [
                    d[72] || (d[72] = r("div", { class: "km-dim" }, "No changes were applied.", -1)),
                    o(i).resultExecution.value.length ? (a(), u("div", Kd, c(o(i).resultExecution.value.length) + " planned step" + c(o(i).resultExecution.value.length === 1 ? "" : "s") + " below.", 1)) : (a(), u("div", qd, "No install steps are available for this preview."))
                  ], 64)) : (a(), u(X, { key: 1 }, [
                    d[73] || (d[73] = r("div", { class: "km-dim" }, "Changes applied successfully.", -1)),
                    o(i).result.value.apply?.message ? (a(), u("div", Gd, c(o(i).result.value.apply.message), 1)) : h("", !0)
                  ], 64))
                ])) : h("", !0),
                o(i).resultExecution.value.length ? (a(), u("div", Wd, [
                  d[74] || (d[74] = r("div", { class: "km-panel-title" }, "Install steps", -1)),
                  (a(!0), u(X, null, se(o(i).resultExecution.value, (f, w) => (a(), u("div", {
                    key: `${f.step}-${w}`,
                    class: ne(["km-ledger-row", H(f.status)])
                  }, [
                    r("span", Zd, c(w + 1), 1),
                    r("span", Yd, c(o(i).executionStepLabel(f)), 1),
                    r("span", Xd, c(f.status), 1),
                    f.message ? (a(), u("span", Jd, c(f.message), 1)) : h("", !0)
                  ], 2))), 128))
                ])) : h("", !0),
                o(i).resultError.value ? (a(), u("div", Qd, [
                  o(i).resultCode.value ? (a(), u("span", ec, c(o(i).resultCode.value), 1)) : h("", !0),
                  M(c(o(i).resultError.value), 1)
                ])) : h("", !0)
              ], 512), [
                [rn, o(i).activeSection.value === "review"]
              ])
            ], 512)
          ])
        ]),
        _: 1
      }, 8, ["visible", "busy", "label", "style"]);
    };
  }
}), ac = { class: "d-hero" }, lc = { class: "d-hero-icon" }, rc = { class: "km-grow km-min0" }, uc = { class: "km-row-wrap" }, dc = { class: "d-hero-name" }, cc = { class: "d-ver" }, pc = {
  key: 0,
  class: "badge-app kx-tag-caps"
}, fc = {
  key: 1,
  class: "badge-installed kx-tag-caps"
}, mc = {
  key: 2,
  class: "badge-private kx-tag-caps",
  title: "Private Hub module"
}, hc = {
  key: 3,
  class: "badge-warn kx-tag-caps"
}, bc = { class: "d-hero-org" }, vc = {
  key: 0,
  class: "d-hero-desc"
}, gc = { class: "d-hero-actions" }, yc = ["href"], kc = ["href"], wc = { class: "d-grid" }, Sc = { class: "d-side" }, $c = { class: "d-block" }, Cc = { class: "d-row" }, Ic = { class: "d-row-v" }, _c = {
  key: 0,
  class: "d-row"
}, xc = { class: "d-row-v" }, Oc = {
  key: 1,
  class: "d-row"
}, Lc = ["title"], zc = {
  key: 2,
  class: "d-row"
}, Ac = { class: "d-row-v" }, Pc = {
  key: 3,
  class: "d-row"
}, Mc = {
  key: 4,
  class: "d-row"
}, Ec = { class: "d-row-v" }, Tc = {
  key: 5,
  class: "d-row"
}, Fc = { class: "d-row-v" }, Vc = {
  key: 6,
  class: "d-row"
}, Dc = { class: "d-row-v" }, Bc = {
  key: 0,
  class: "d-block"
}, Rc = { class: "km-pills" }, jc = {
  key: 1,
  class: "d-block"
}, Hc = { class: "km-dep-list" }, Uc = { class: "km-trunc" }, Nc = { class: "km-dim" }, Kc = {
  key: 2,
  class: "d-block"
}, qc = { class: "km-pills" }, Gc = { class: "d-main" }, Wc = { class: "d-tabs" }, Zc = ["disabled"], Yc = {
  key: 0,
  class: "km-dim"
}, Xc = { class: "d-tab-body" }, Jc = {
  key: 0,
  class: "km-loading"
}, Qc = {
  key: 0,
  class: "d-empty"
}, ep = {
  key: 1,
  class: "rm"
}, tp = {
  key: 2,
  class: "km-stack-lg"
}, np = { key: 0 }, op = { class: "d-block-title d-accent" }, ip = { class: "km-dim" }, sp = { class: "km-2col" }, ap = { class: "d-field-i" }, lp = { class: "km-grow km-min0" }, rp = { class: "d-cfg-name" }, up = {
  key: 0,
  class: "d-cfg-desc"
}, dp = { key: 1 }, cp = { class: "d-block-title" }, pp = { class: "km-2col" }, fp = { class: "d-field-i d-field-i-req" }, mp = { class: "km-grow km-min0" }, hp = { class: "d-cfg-name" }, bp = {
  key: 0,
  class: "d-cfg-desc"
}, vp = { class: "d-field-i d-field-i-req" }, gp = { class: "km-grow km-min0" }, yp = { class: "d-cfg-name" }, kp = {
  key: 0,
  class: "d-cfg-desc"
}, wp = {
  key: 1,
  class: "d-cfg-desc km-mono"
}, Sp = { class: "d-block-title" }, $p = { key: 0 }, Cp = { class: "d-sub" }, Ip = { class: "km-pills" }, _p = {
  key: 1,
  class: "km-muted"
}, xp = {
  key: 1,
  class: "km-muted"
}, Op = {
  key: 2,
  class: "km-stack"
}, Lp = { class: "km-group-head" }, zp = { class: "km-dim" }, Ap = { class: "km-2col" }, Pp = { class: "d-entry-name" }, Mp = { class: "d-entry-id" }, Ep = {
  key: 0,
  class: "km-muted"
}, Tp = {
  key: 1,
  class: "d-vers"
}, Fp = { class: "d-ver-tag" }, Vp = {
  key: 0,
  class: "km-dim"
}, Dp = {
  key: 1,
  class: "km-dim km-inline"
}, Bp = {
  key: 2,
  class: "km-dim"
}, Rp = /* @__PURE__ */ nn({
  __name: "ModuleDetailView",
  props: {
    page: {}
  },
  setup(e) {
    const t = e, {
      selectedModule: n,
      selectedIsPrivate: s,
      selectedCanUpdate: i,
      selectedUpdateDisabledReason: l,
      selectedCanUninstall: p,
      selectedUninstallBlockedReason: b,
      detailUpdate: v,
      detailUninstall: k,
      detailInstall: S,
      closeDetail: _,
      versionMeta: E,
      detailTab: R,
      detailReadme: T,
      detailLoading: N,
      detailVersions: z,
      envVars: K,
      requirements: H,
      entryIcon: P,
      entryName: B,
      entryDesc: d,
      detailGroups: Q
    } = t.page, f = q(() => t.page.selected.value);
    return (w, A) => {
      const re = Oe("wc-render-markdown");
      return a(), u("div", {
        class: "d-page",
        style: qt({ "--accent": o(n) ? o(fn)(o(n)) : "var(--p-primary-color)" })
      }, [
        r("button", {
          class: "d-back",
          onClick: A[0] || (A[0] = //@ts-ignore
          (...g) => o(_) && o(_)(...g))
        }, [
          m(o(C), {
            icon: "tabler:arrow-left",
            class: "km-i-sm",
            "aria-hidden": "true"
          }),
          A[4] || (A[4] = M(" Back to modules ", -1))
        ]),
        r("header", ac, [
          r("div", lc, [
            m(o(C), {
              icon: o(n) ? o(tn)(o(n)) : "tabler:package",
              class: "km-i-lg",
              "aria-hidden": "true"
            }, null, 8, ["icon"])
          ]),
          r("div", rc, [
            r("div", uc, [
              r("h2", dc, c(f.value.label), 1),
              r("span", cc, c(f.value.version || "—"), 1),
              o(dn)(o(n)) ? (a(), u("span", pc, "app")) : h("", !0),
              f.value.installed ? (a(), u("span", fc, "installed")) : h("", !0),
              o(s) ? (a(), u("span", mc, [
                m(o(C), {
                  icon: "tabler:lock",
                  class: "km-i-xs",
                  "aria-hidden": "true"
                }),
                A[5] || (A[5] = M(" private", -1))
              ])) : h("", !0),
              o(n)?.deprecated ? (a(), u("span", hc, "deprecated")) : h("", !0)
            ]),
            r("div", bc, c(f.value.component), 1),
            f.value.description ? (a(), u("p", vc, c(f.value.description), 1)) : h("", !0),
            r("div", gc, [
              f.value.installed ? (a(), u(X, { key: 0 }, [
                o(i) ? (a(), ce(o(le), {
                  key: 0,
                  size: "small",
                  severity: "secondary",
                  outlined: "",
                  onClick: o(v)
                }, {
                  default: ee(() => [
                    m(o(C), {
                      icon: "tabler:refresh-dot",
                      class: "km-i",
                      "aria-hidden": "true"
                    }),
                    A[6] || (A[6] = M(" Update ", -1))
                  ]),
                  _: 1
                }, 8, ["onClick"])) : (a(), ce(o(le), {
                  key: 1,
                  size: "small",
                  severity: "secondary",
                  outlined: "",
                  disabled: "",
                  title: o(l) || void 0
                }, {
                  default: ee(() => [
                    m(o(C), {
                      icon: "tabler:refresh-off",
                      class: "km-i",
                      "aria-hidden": "true"
                    }),
                    A[7] || (A[7] = M(" Update ", -1))
                  ]),
                  _: 1
                }, 8, ["title"])),
                o(p) ? (a(), ce(o(le), {
                  key: 2,
                  size: "small",
                  severity: "danger",
                  text: "",
                  onClick: o(k)
                }, {
                  default: ee(() => [
                    m(o(C), {
                      icon: "tabler:trash",
                      class: "km-i",
                      "aria-hidden": "true"
                    }),
                    A[8] || (A[8] = M(" Uninstall ", -1))
                  ]),
                  _: 1
                }, 8, ["onClick"])) : o(b) ? (a(), ce(o(le), {
                  key: 3,
                  size: "small",
                  severity: "danger",
                  text: "",
                  disabled: "",
                  title: o(b)
                }, {
                  default: ee(() => [
                    m(o(C), {
                      icon: "tabler:trash-off",
                      class: "km-i",
                      "aria-hidden": "true"
                    }),
                    A[9] || (A[9] = M(" Uninstall ", -1))
                  ]),
                  _: 1
                }, 8, ["title"])) : h("", !0)
              ], 64)) : (a(), ce(o(le), {
                key: 1,
                size: "small",
                onClick: o(S)
              }, {
                default: ee(() => [
                  m(o(C), {
                    icon: "tabler:download",
                    class: "km-i",
                    "aria-hidden": "true"
                  }),
                  A[10] || (A[10] = M(" Install ", -1))
                ]),
                _: 1
              }, 8, ["onClick"])),
              o(n)?.repository ? (a(), u("a", {
                key: 2,
                href: String(o(n).repository),
                target: "_blank",
                rel: "noopener",
                class: "d-link"
              }, [
                m(o(C), {
                  icon: "tabler:brand-github",
                  class: "km-i-sm",
                  "aria-hidden": "true"
                }),
                A[11] || (A[11] = M(" Repository", -1))
              ], 8, yc)) : h("", !0),
              o(n)?.homepage ? (a(), u("a", {
                key: 3,
                href: String(o(n).homepage),
                target: "_blank",
                rel: "noopener",
                class: "d-link"
              }, [
                m(o(C), {
                  icon: "tabler:home",
                  class: "km-i-sm",
                  "aria-hidden": "true"
                }),
                A[12] || (A[12] = M(" Homepage", -1))
              ], 8, kc)) : h("", !0)
            ])
          ])
        ]),
        r("div", wc, [
          r("aside", Sc, [
            r("section", $c, [
              r("div", Cc, [
                m(o(C), {
                  icon: "tabler:download",
                  class: "d-row-i",
                  "aria-hidden": "true"
                }),
                A[13] || (A[13] = r("span", { class: "d-row-k" }, "Downloads", -1)),
                r("span", Ic, c(o(mn)(o(n)?.total_downloads)), 1)
              ]),
              o(n)?.favorites_count ? (a(), u("div", _c, [
                m(o(C), {
                  icon: "tabler:star",
                  class: "d-row-i",
                  "aria-hidden": "true"
                }),
                A[14] || (A[14] = r("span", { class: "d-row-k" }, "Favorites", -1)),
                r("span", xc, c(o(n).favorites_count), 1)
              ])) : h("", !0),
              o(n)?.license ? (a(), u("div", Oc, [
                m(o(C), {
                  icon: "tabler:license",
                  class: "d-row-i",
                  "aria-hidden": "true"
                }),
                A[15] || (A[15] = r("span", { class: "d-row-k" }, "License", -1)),
                r("span", {
                  class: "d-row-v",
                  title: o(n).license
                }, c(o(Fn)(o(n).license)), 9, Lc)
              ])) : h("", !0),
              o(n)?.type ? (a(), u("div", zc, [
                m(o(C), {
                  icon: "tabler:category",
                  class: "d-row-i",
                  "aria-hidden": "true"
                }),
                A[16] || (A[16] = r("span", { class: "d-row-k" }, "Type", -1)),
                r("span", Ac, c(o(n).type), 1)
              ])) : h("", !0),
              o(s) ? (a(), u("div", Pc, [
                m(o(C), {
                  icon: "tabler:lock",
                  class: "d-row-i",
                  "aria-hidden": "true"
                }),
                A[17] || (A[17] = r("span", { class: "d-row-k" }, "Visibility", -1)),
                A[18] || (A[18] = r("span", { class: "d-row-v" }, "Private", -1))
              ])) : h("", !0),
              o(n)?.update_time ? (a(), u("div", Mc, [
                m(o(C), {
                  icon: "tabler:clock",
                  class: "d-row-i",
                  "aria-hidden": "true"
                }),
                A[19] || (A[19] = r("span", { class: "d-row-k" }, "Updated", -1)),
                r("span", Ec, c(o(Vn)(o(n).update_time, { maxUnit: "year" })), 1)
              ])) : h("", !0),
              o(E)?.entry_count ? (a(), u("div", Tc, [
                m(o(C), {
                  icon: "tabler:list-numbers",
                  class: "d-row-i",
                  "aria-hidden": "true"
                }),
                A[20] || (A[20] = r("span", { class: "d-row-k" }, "Entries", -1)),
                r("span", Fc, c(o(E).entry_count), 1)
              ])) : h("", !0),
              o(E)?.size_bytes ? (a(), u("div", Vc, [
                m(o(C), {
                  icon: "tabler:weight",
                  class: "d-row-i",
                  "aria-hidden": "true"
                }),
                A[21] || (A[21] = r("span", { class: "d-row-k" }, "Size", -1)),
                r("span", Dc, c(o(cn)(o(E).size_bytes)), 1)
              ])) : h("", !0)
            ]),
            (o(n)?.keywords || []).length ? (a(), u("section", Bc, [
              A[22] || (A[22] = r("div", { class: "d-block-title" }, "Keywords", -1)),
              r("div", Rc, [
                (a(!0), u(X, null, se(o(n).keywords, (g) => (a(), u("span", {
                  key: g,
                  class: "provides-pill"
                }, c(g), 1))), 128))
              ])
            ])) : h("", !0),
            (o(E)?.dependencies || []).length ? (a(), u("section", jc, [
              A[23] || (A[23] = r("div", { class: "d-block-title" }, "Dependencies", -1)),
              r("div", Hc, [
                (a(!0), u(X, null, se(o(E).dependencies, (g, I) => (a(), u("div", {
                  key: I,
                  class: "km-dep"
                }, [
                  r("span", Uc, c(g.org) + "/" + c(g.name), 1),
                  r("span", Nc, c(g.version_constraint), 1)
                ]))), 128))
              ])
            ])) : h("", !0),
            (o(E)?.lua_modules || []).length ? (a(), u("section", Kc, [
              A[24] || (A[24] = r("div", { class: "d-block-title" }, "Lua modules", -1)),
              r("div", qc, [
                (a(!0), u(X, null, se(o(E).lua_modules, (g) => (a(), u("span", {
                  key: g,
                  class: "provides-pill"
                }, c(g), 1))), 128))
              ])
            ])) : h("", !0)
          ]),
          r("main", Gc, [
            r("div", Wc, [
              r("button", {
                class: ne(["d-tab", { active: o(R) === "readme" }]),
                disabled: !o(T) && !o(N),
                onClick: A[1] || (A[1] = (g) => R.value = "readme")
              }, "Readme", 10, Zc),
              r("button", {
                class: ne(["d-tab", { active: o(R) === "overview" }]),
                onClick: A[2] || (A[2] = (g) => R.value = "overview")
              }, "Overview", 2),
              r("button", {
                class: ne(["d-tab", { active: o(R) === "versions" }]),
                onClick: A[3] || (A[3] = (g) => R.value = "versions")
              }, [
                A[25] || (A[25] = M("Versions ", -1)),
                o(z).length ? (a(), u("span", Yc, c(o(z).length), 1)) : h("", !0)
              ], 2)
            ]),
            r("div", Xc, [
              o(N) ? (a(), u("div", Jc, [
                m(o(C), {
                  icon: "tabler:loader-2",
                  class: "km-i spin",
                  "aria-hidden": "true"
                }),
                A[26] || (A[26] = M(" Loading… ", -1))
              ])) : o(R) === "readme" ? (a(), u(X, { key: 1 }, [
                o(T) ? (a(), u("article", ep, [
                  m(re, { source: o(T) }, null, 8, ["source"])
                ])) : (a(), u("div", Qc, [
                  m(o(C), {
                    icon: "tabler:file-off",
                    class: "km-i-xl km-dim",
                    "aria-hidden": "true"
                  }),
                  A[27] || (A[27] = r("p", { class: "km-mt" }, "No README provided.", -1))
                ]))
              ], 64)) : o(R) === "overview" ? (a(), u("div", tp, [
                o(K).length ? (a(), u("section", np, [
                  r("div", op, [
                    m(o(C), {
                      icon: "tabler:settings-2",
                      class: "km-i-sm",
                      "aria-hidden": "true"
                    }),
                    A[28] || (A[28] = M(" Environment ", -1)),
                    r("span", ip, c(o(K).length), 1)
                  ]),
                  A[29] || (A[29] = r("p", { class: "d-sub" }, "Variables this module reads — set them in your environment.", -1)),
                  r("div", sp, [
                    (a(!0), u(X, null, se(o(K), (g) => (a(), u("div", {
                      key: g.id,
                      class: "d-field d-field-env"
                    }, [
                      r("span", ap, [
                        m(o(C), {
                          icon: o(P)(g, "tabler:variable"),
                          class: "km-i",
                          "aria-hidden": "true"
                        }, null, 8, ["icon"])
                      ]),
                      r("span", lp, [
                        r("span", rp, c(o(B)(g)), 1),
                        o(d)(g) ? (a(), u("span", up, c(o(d)(g)), 1)) : h("", !0)
                      ])
                    ]))), 128))
                  ])
                ])) : h("", !0),
                o(H).length || (o(E)?.requirements || []).length ? (a(), u("section", dp, [
                  r("div", cp, [
                    m(o(C), {
                      icon: "tabler:plug-connected",
                      class: "km-i-sm",
                      "aria-hidden": "true"
                    }),
                    A[30] || (A[30] = M(" Requires", -1))
                  ]),
                  A[31] || (A[31] = r("p", { class: "d-sub" }, "Host resources this module is wired to at install.", -1)),
                  r("div", pp, [
                    o(H).length ? (a(!0), u(X, { key: 0 }, se(o(H), (g) => (a(), u("div", {
                      key: g.id,
                      class: "d-field d-field-req"
                    }, [
                      r("span", fp, [
                        m(o(C), {
                          icon: "tabler:link",
                          class: "km-i",
                          "aria-hidden": "true"
                        })
                      ]),
                      r("span", mp, [
                        r("span", hp, c(o(B)(g)), 1),
                        o(d)(g) ? (a(), u("span", bp, c(o(d)(g)), 1)) : h("", !0)
                      ])
                    ]))), 128)) : (a(!0), u(X, { key: 1 }, se(o(E).requirements, (g, I) => (a(), u("div", {
                      key: I,
                      class: "d-field d-field-req"
                    }, [
                      r("span", vp, [
                        m(o(C), {
                          icon: "tabler:link",
                          class: "km-i",
                          "aria-hidden": "true"
                        })
                      ]),
                      r("span", gp, [
                        r("span", yp, c(g.name), 1),
                        g.description ? (a(), u("span", kp, c(g.description), 1)) : h("", !0),
                        g.default ? (a(), u("span", wp, "default: " + c(g.default), 1)) : h("", !0)
                      ])
                    ]))), 128))
                  ])
                ])) : h("", !0),
                r("section", null, [
                  r("div", Sp, [
                    m(o(C), {
                      icon: "tabler:package",
                      class: "km-i-sm d-accent-i",
                      "aria-hidden": "true"
                    }),
                    A[32] || (A[32] = M(" Provides", -1))
                  ]),
                  f.value.installed ? o(Q).length ? (a(), u("div", Op, [
                    (a(!0), u(X, null, se(o(Q), (g) => (a(), u("div", {
                      key: g.key
                    }, [
                      r("div", Lp, [
                        m(o(C), {
                          icon: g.icon,
                          class: "km-i-sm d-accent-i",
                          "aria-hidden": "true"
                        }, null, 8, ["icon"]),
                        M(" " + c(g.label) + " ", 1),
                        r("span", zp, c(g.items.length), 1)
                      ]),
                      r("div", Ap, [
                        (a(!0), u(X, null, se(g.items, (I) => (a(), u("div", {
                          key: I.id,
                          class: "d-entry"
                        }, [
                          r("div", Pp, c(I.meta && I.meta.title || o(B)(I)), 1),
                          r("div", Mp, c(I.id), 1)
                        ]))), 128))
                      ])
                    ]))), 128))
                  ])) : (a(), u("p", xp, "No registry entries.")) : (a(), u("div", $p, [
                    (o(E)?.entry_kinds || []).length ? (a(), u(X, { key: 0 }, [
                      r("p", Cp, "Publishes " + c(o(E).entry_count || o(E).entry_kinds.length) + " entries; per-entry detail resolves after install.", 1),
                      r("div", Ip, [
                        (a(!0), u(X, null, se(o(E).entry_kinds, (g) => (a(), u("span", {
                          key: g,
                          class: "provides-pill"
                        }, c(g), 1))), 128))
                      ])
                    ], 64)) : (a(), u("p", _p, [...A[33] || (A[33] = [
                      M("See the ", -1),
                      r("strong", null, "Readme", -1),
                      M(" tab for details.", -1)
                    ])]))
                  ]))
                ])
              ])) : (a(), u(X, { key: 3 }, [
                o(z).length ? (a(), u("div", Tp, [
                  (a(!0), u(X, null, se(o(z), (g) => (a(), u("div", {
                    key: g.version,
                    class: "d-ver-row"
                  }, [
                    r("span", Fp, c(g.version), 1),
                    g.create_time ? (a(), u("span", Vp, c(o(Vn)(g.create_time, { maxUnit: "year" })), 1)) : h("", !0),
                    A[34] || (A[34] = r("span", { class: "km-grow" }, null, -1)),
                    g.download_count ? (a(), u("span", Dp, [
                      m(o(C), {
                        icon: "tabler:download",
                        class: "km-i-xs",
                        "aria-hidden": "true"
                      }),
                      M(" " + c(o(mn)(g.download_count)), 1)
                    ])) : h("", !0),
                    g.size_bytes ? (a(), u("span", Bp, c(o(cn)(g.size_bytes)), 1)) : h("", !0)
                  ]))), 128))
                ])) : (a(), u("p", Ep, "No published versions."))
              ], 64))
            ])
          ])
        ])
      ], 4);
    };
  }
}), jp = { class: "km" }, Hp = {
  key: 1,
  class: "km-loading km-center km-initial-loading",
  role: "status",
  "aria-live": "polite"
}, Up = {
  key: 2,
  class: "km-denied"
}, Np = { class: "km-denied-box" }, Kp = {
  key: 3,
  class: "km-scroll"
}, qp = {
  key: 1,
  class: "km-list"
}, Gp = { class: "km-sec-bar km-sec-bar-toolbar" }, Wp = { class: "km-controls" }, Zp = {
  key: 0,
  class: "km-btn-count"
}, Yp = { class: "km-hub-auth-panel" }, Xp = { class: "km-hub-auth-row" }, Jp = {
  key: 0,
  class: "km-hub-auth-meta"
}, Qp = {
  key: 1,
  class: "km-hub-auth-meta"
}, ef = {
  key: 2,
  class: "km-hub-auth-orgs"
}, tf = { class: "km-hub-auth-org-name" }, nf = {
  key: 0,
  class: "km-hub-auth-org-role"
}, of = { class: "km-hub-auth-hint" }, sf = ["href"], af = { class: "km-hub-auth-actions" }, lf = {
  key: 0,
  class: "km-msg km-msg-err"
}, rf = {
  key: 1,
  class: "km-msg"
}, uf = {
  key: 2,
  class: "km-msg km-msg-err"
}, df = {
  key: 3,
  class: "km-loading km-center"
}, cf = { key: 0 }, pf = { class: "hub-section-head" }, ff = { class: "feat-grid" }, mf = ["onClick"], hf = { class: "feat-icon" }, bf = { class: "feat-body" }, vf = { class: "km-row-wrap" }, gf = { class: "feat-name" }, yf = {
  key: 0,
  class: "badge-app kx-tag-caps"
}, kf = {
  key: 1,
  class: "badge-private kx-tag-caps",
  title: "Private Hub module"
}, wf = {
  key: 2,
  class: "badge-warn kx-tag-caps"
}, Sf = { class: "feat-org" }, $f = {
  key: 0,
  class: "feat-desc"
}, Cf = { class: "feat-meta" }, If = { class: "meta-pill" }, _f = { class: "meta-pill" }, xf = ["title"], Of = { class: "hub-section-head" }, Lf = { class: "hub-section-title" }, zf = { class: "hub-section-sub" }, Af = { class: "mod-grid" }, Pf = ["onClick"], Mf = { class: "mod-icon" }, Ef = { class: "mod-body" }, Tf = { class: "km-row-wrap" }, Ff = { class: "mod-name" }, Vf = { class: "mod-version" }, Df = {
  key: 0,
  class: "badge-app kx-tag-caps"
}, Bf = {
  key: 1,
  class: "badge-private kx-tag-caps",
  title: "Private Hub module"
}, Rf = {
  key: 2,
  class: "badge-warn kx-tag-caps"
}, jf = { class: "mod-org" }, Hf = {
  key: 0,
  class: "mod-desc"
}, Uf = { class: "mod-foot" }, Nf = { class: "foot-stat" }, Kf = {
  key: 0,
  class: "foot-stat"
}, qf = ["title"], Gf = {
  key: 2,
  class: "foot-stat km-dim km-ml-auto"
}, Wf = {
  key: 5,
  class: "km-empty"
}, Zf = { class: "km-muted" }, Yf = { class: "km-mono" }, Xf = {
  key: 6,
  class: "km-empty"
}, Jf = {
  key: 7,
  class: "km-empty"
}, Qf = { class: "km-muted" }, em = { class: "km-mono" }, tm = {
  key: 0,
  class: "km-installed"
}, nm = ["aria-expanded"], om = { class: "km-sub" }, im = {
  key: 0,
  class: "km-update-count"
}, sm = {
  key: 1,
  class: "km-update-count"
}, am = {
  key: 0,
  class: "km-msg km-msg-err km-mb"
}, lm = {
  key: 1,
  class: "inst-toolbar"
}, rm = {
  key: 2,
  class: "inst-list"
}, um = ["onClick"], dm = { class: "inst-icon" }, cm = { class: "km-grow km-min0" }, pm = { class: "km-row-tight" }, fm = { class: "inst-name" }, mm = {
  key: 0,
  class: "badge-app kx-tag-caps"
}, hm = {
  key: 1,
  class: "badge-private kx-tag-caps",
  title: "Private Hub module"
}, bm = {
  key: 2,
  class: "km-chip"
}, vm = ["title"], gm = { class: "inst-id" }, ym = {
  key: 0,
  class: "km-dim"
}, km = {
  key: 0,
  class: "inst-update-msg"
}, wm = { class: "inst-ver" }, Sm = { class: "inst-migs" }, $m = { class: "inst-actions" }, Cm = ["disabled", "aria-label", "onClick"], Im = ["disabled", "aria-label", "onClick"], _m = ["title", "aria-label"], xm = ["aria-label", "onClick"], Om = ["title", "aria-label"], Lm = {
  key: 3,
  class: "km-empty inst-empty"
}, zm = { class: "km-modal-body" }, Am = { class: "km-uninstall-target" }, Pm = { class: "km-mono" }, Mm = { class: "km-dim" }, Em = {
  key: 0,
  class: "km-msg km-msg-err"
}, Tm = {
  key: 0,
  class: "km-code"
}, Fm = {
  key: 1,
  class: "km-mt"
}, Vm = {
  key: 1,
  class: "km-msg km-msg-info"
}, Dm = {
  key: 2,
  class: "km-running"
}, Bm = {
  key: 3,
  class: "km-uninstall-preview"
}, Rm = {
  key: 0,
  class: "km-msg"
}, jm = {
  key: 1,
  class: "km-preview-block"
}, Hm = { class: "km-mono" }, Um = { class: "km-dim" }, Nm = {
  key: 2,
  class: "km-preview-block"
}, Km = { class: "km-mono" }, qm = { class: "km-dim" }, Gm = {
  key: 3,
  class: "km-preview-block"
}, Wm = { class: "km-mono" }, Zm = { class: "km-dim" }, Ym = {
  key: 4,
  class: "km-ledger"
}, Xm = { class: "km-ledger-step" }, Jm = { class: "km-grow" }, Qm = { class: "km-chip" }, eh = {
  key: 0,
  class: "km-ledger-msg"
}, th = {
  key: 5,
  class: "km-running"
}, nh = { class: "km-grow km-running-label" }, oh = { class: "km-dim" }, ih = /* @__PURE__ */ nn({
  __name: "modules",
  setup(e) {
    const t = ql(), {
      LABEL: n,
      HUB_PORTAL: s,
      UNINSTALL_MIGRATION_OPTIONS: i,
      initialLoading: l,
      accessDenied: p,
      statusBanner: b,
      hubConnected: v,
      hubStatus: k,
      hubToken: S,
      showTokenPanel: _,
      hubConnecting: E,
      hubError: R,
      hubOrgs: T,
      hubIdentity: N,
      hubTokenStored: z,
      hubTokenExpired: K,
      hubTokenIcon: H,
      hubTokenButtonLabel: P,
      hubExpiry: B,
      saveHubToken: d,
      clearHubToken: Q,
      selected: f,
      selectedModule: w,
      detailReadme: A,
      detailLoading: re,
      detailTab: g,
      detailVersions: I,
      envVars: L,
      requirements: F,
      detailGroups: J,
      versionMeta: te,
      selectedCanUpdate: oe,
      selectedUpdateDisabledReason: me,
      selectedCanUninstall: Ae,
      selectedIsPrivate: ge,
      selectedUninstallBlockedReason: Ke,
      entryName: Be,
      entryDesc: ht,
      entryIcon: qe,
      openDetail: bt,
      closeDetail: Mt,
      detailInstall: Et,
      detailUpdate: Se,
      detailUninstall: Gt,
      installed: ot,
      installedFilter: Ge,
      installedKindFilter: vt,
      installedTotal: it,
      updateScanLoading: We,
      updateAllRunning: Re,
      availableUpdates: Te,
      installedLoading: $e,
      installedError: Ze,
      installedOpen: Ye,
      catalog: Tt,
      catalogLoading: st,
      catalogError: Xe,
      catalogInstalledTotal: je,
      visibleCatalogInstalled: Ft,
      browseFilter: $,
      sortBy: x,
      availableItems: D,
      featured: U,
      sortedItems: Z,
      visibleInstalled: Y,
      catalogItemFor: de,
      installedAccent: ke,
      installedIcon: at,
      installedIsRoot: Vt,
      installedIsPrivate: fe,
      installedRole: Fe,
      installedUsedBy: lt,
      installedCanUpdate: gt,
      installedUpdateDisabledReason: yt,
      installedCanUninstall: ve,
      installedUninstallDisabledReason: Pe,
      installedMigrationSummary: rt,
      updateInfoForDep: Je,
      updateStatusLabel: on,
      updateStatusIcon: Dt,
      updateStatusBusy: Ct,
      scanInstalledUpdates: Ve,
      updateInstalledDependency: He,
      updateAllAvailable: kt,
      refreshAll: wt,
      installTarget: we,
      closeInstallDialog: ut,
      onInstallChanged: sn,
      openUpdateDialog: It,
      uninstallDialogOpen: dt,
      uninstallDep: ct,
      uninstallPolicy: Qe,
      uninstallRunning: ye,
      uninstallPreviewLoading: et,
      uninstallPreview: be,
      uninstallExecution: Wt,
      uninstallCode: Ce,
      uninstallError: _t,
      uninstallRequiredBy: Bt,
      uninstallBlockedReason: xt,
      uninstallActionBlockedReason: Ie,
      uninstallPhase: Rt,
      uninstallElapsedSec: jt,
      openUninstallDialog: Zt,
      previewUninstall: St,
      executionStepLabel: Yt,
      runUninstall: Ot
    } = t, $t = j(null);
    return (_e, O) => (a(), u("div", jp, [
      o(b) ? (a(), u("div", {
        key: 0,
        class: ne(["km-banner", o(b).kind === "ok" ? "km-banner-ok" : "km-banner-err"])
      }, c(o(b).message), 3)) : h("", !0),
      o(l) ? (a(), u("div", Hp, [
        m(o(C), {
          icon: "tabler:loader-2",
          class: "km-i spin",
          "aria-hidden": "true"
        }),
        O[12] || (O[12] = M(" Loading modules… ", -1))
      ])) : o(p) ? (a(), u("div", Up, [
        r("div", Np, [
          m(o(C), {
            icon: "tabler:lock",
            class: "km-denied-icon",
            "aria-hidden": "true"
          }),
          O[13] || (O[13] = r("p", { class: "km-denied-title" }, "Admins only", -1)),
          O[14] || (O[14] = r("p", { class: "km-denied-sub" }, "You need admin access to manage modules.", -1))
        ])
      ])) : (a(), u("div", Kp, [
        o(f) ? (a(), ce(Rp, {
          key: 0,
          page: o(t)
        }, null, 8, ["page"])) : (a(), u("div", qp, [
          r("section", null, [
            r("div", Gp, [
              r("div", Wp, [
                m(o(le), {
                  size: "small",
                  severity: "secondary",
                  outlined: "",
                  disabled: o($e) || o(st),
                  onClick: o(wt)
                }, {
                  default: ee(() => [
                    m(o(C), {
                      icon: o($e) || o(st) ? "tabler:loader-2" : "tabler:refresh",
                      class: ne(["km-i", (o($e) || o(st)) && "spin"]),
                      "aria-hidden": "true"
                    }, null, 8, ["icon", "class"]),
                    O[15] || (O[15] = M(" Refresh ", -1))
                  ]),
                  _: 1
                }, 8, ["disabled", "onClick"]),
                m(o(le), {
                  size: "small",
                  severity: "secondary",
                  outlined: "",
                  disabled: o(We) || o(Re) || o($e) || o(it) === 0,
                  onClick: o(Ve)
                }, {
                  default: ee(() => [
                    m(o(C), {
                      icon: o(We) ? "tabler:loader-2" : "tabler:refresh-dot",
                      class: ne(["km-i", o(We) && "spin"]),
                      "aria-hidden": "true"
                    }, null, 8, ["icon", "class"]),
                    O[16] || (O[16] = M(" Scan updates ", -1))
                  ]),
                  _: 1
                }, 8, ["disabled", "onClick"]),
                m(o(le), {
                  size: "small",
                  disabled: o(Re) || o(We) || o(Te).length === 0,
                  onClick: o(kt)
                }, {
                  default: ee(() => [
                    m(o(C), {
                      icon: o(Re) ? "tabler:loader-2" : "tabler:download",
                      class: ne(["km-i", o(Re) && "spin"]),
                      "aria-hidden": "true"
                    }, null, 8, ["icon", "class"]),
                    O[17] || (O[17] = M(" Update all ", -1)),
                    o(Te).length ? (a(), u("span", Zp, c(o(Te).length), 1)) : h("", !0)
                  ]),
                  _: 1
                }, 8, ["disabled", "onClick"]),
                De(r("input", {
                  "onUpdate:modelValue": O[0] || (O[0] = (y) => Lt($) ? $.value = y : null),
                  class: "km-input km-filter",
                  placeholder: "Filter…"
                }, null, 512), [
                  [zn, o($)]
                ]),
                m(o(An), {
                  modelValue: o(x),
                  "onUpdate:modelValue": O[1] || (O[1] = (y) => Lt(x) ? x.value = y : null),
                  class: "km-sort",
                  options: [
                    { label: "Top downloads", value: "downloads" },
                    { label: "Name A→Z", value: "name" },
                    { label: "Recently updated", value: "recent" }
                  ],
                  "option-label": "label",
                  "option-value": "value",
                  "aria-label": "Sort modules"
                }, null, 8, ["modelValue"]),
                r("div", {
                  ref_key: "anchorEl",
                  ref: $t,
                  class: "km-hub-auth"
                }, [
                  m(o(le), {
                    size: "small",
                    severity: o(v) ? "secondary" : o(K) ? "warn" : void 0,
                    outlined: o(v) || o(K),
                    disabled: o(E),
                    onClick: O[2] || (O[2] = (y) => _.value = !o(_))
                  }, {
                    default: ee(() => [
                      m(o(C), {
                        icon: o(H),
                        class: "km-i",
                        "aria-hidden": "true"
                      }, null, 8, ["icon"]),
                      M(" " + c(o(P)) + " ", 1),
                      m(o(C), {
                        icon: "tabler:chevron-down",
                        class: "km-i-sm",
                        "aria-hidden": "true"
                      })
                    ]),
                    _: 1
                  }, 8, ["severity", "outlined", "disabled"]),
                  m(ai, {
                    open: o(_),
                    "onUpdate:open": O[5] || (O[5] = (y) => Lt(_) ? _.value = y : null),
                    anchor: $t.value,
                    align: "right",
                    width: 300
                  }, {
                    default: ee(() => [
                      r("div", Yp, [
                        O[21] || (O[21] = r("div", { class: "km-hub-auth-title" }, "Wippy Hub token", -1)),
                        o(z) ? (a(), u("div", {
                          key: 0,
                          class: ne(["km-hub-auth-active", o(K) && "is-expired"])
                        }, [
                          r("div", Xp, [
                            m(o(C), {
                              icon: o(K) ? "tabler:alert-triangle" : "tabler:circle-check-filled",
                              class: ne(["km-i-sm", o(K) ? "km-hub-warn" : "km-hub-ok"]),
                              "aria-hidden": "true"
                            }, null, 8, ["icon", "class"]),
                            r("span", null, [
                              M(c(o(K) ? "Token expired" : "Token active"), 1),
                              o(N) ? (a(), u(X, { key: 0 }, [
                                O[18] || (O[18] = M(" — ", -1)),
                                r("strong", null, c(o(N)), 1)
                              ], 64)) : h("", !0)
                            ])
                          ]),
                          o(k)?.registry ? (a(), u("div", Jp, c(o(k).registry), 1)) : h("", !0),
                          o(B) ? (a(), u("div", Qp, "Expires " + c(o(B)), 1)) : h("", !0),
                          o(T).length ? (a(), u("div", ef, [
                            O[19] || (O[19] = r("div", { class: "km-hub-auth-orgs-label" }, "Organizations", -1)),
                            (a(!0), u(X, null, se(o(T), (y) => (a(), u("div", {
                              key: y.id || y.name,
                              class: "km-hub-auth-org"
                            }, [
                              m(o(C), {
                                icon: "tabler:building",
                                class: "km-i-sm",
                                "aria-hidden": "true"
                              }),
                              r("span", tf, c(y.display_name || y.name), 1),
                              y.role ? (a(), u("span", nf, c(y.role), 1)) : h("", !0)
                            ]))), 128))
                          ])) : h("", !0)
                        ], 2)) : h("", !0),
                        r("p", of, [
                          M(c(o(z) ? "Replace the token, or" : "Paste a Hub registry token to browse and install private modules.") + " ", 1),
                          o(z) ? (a(), u(X, { key: 0 }, [
                            M("create a new one")
                          ], 64)) : h("", !0),
                          r("a", {
                            href: o(s),
                            target: "_blank",
                            rel: "noopener"
                          }, c(o(z) ? "↗" : "Create one →"), 9, sf)
                        ]),
                        De(r("input", {
                          "onUpdate:modelValue": O[3] || (O[3] = (y) => Lt(S) ? S.value = y : null),
                          type: "password",
                          class: "km-input km-hub-auth-input",
                          placeholder: "wpy_…",
                          autocomplete: "off",
                          onKeyup: O[4] || (O[4] = Ki(
                            //@ts-ignore
                            (...y) => o(d) && o(d)(...y),
                            ["enter"]
                          ))
                        }, null, 544), [
                          [zn, o(S)]
                        ]),
                        r("div", af, [
                          m(o(le), {
                            size: "small",
                            disabled: o(E),
                            onClick: o(d)
                          }, {
                            default: ee(() => [
                              m(o(C), {
                                icon: o(E) ? "tabler:loader-2" : "tabler:device-floppy",
                                class: ne(["km-i", o(E) && "spin"]),
                                "aria-hidden": "true"
                              }, null, 8, ["icon", "class"]),
                              M(" " + c(o(E) ? "Saving…" : o(z) ? "Replace token" : "Save token"), 1)
                            ]),
                            _: 1
                          }, 8, ["disabled", "onClick"]),
                          o(z) ? (a(), ce(o(le), {
                            key: 0,
                            size: "small",
                            severity: "secondary",
                            outlined: "",
                            onClick: o(Q)
                          }, {
                            default: ee(() => [
                              m(o(C), {
                                icon: "tabler:trash",
                                class: "km-i",
                                "aria-hidden": "true"
                              }),
                              O[20] || (O[20] = M(" Clear ", -1))
                            ]),
                            _: 1
                          }, 8, ["onClick"])) : h("", !0)
                        ])
                      ])
                    ]),
                    _: 1
                  }, 8, ["open", "anchor"])
                ], 512)
              ])
            ]),
            o(R) ? (a(), u("div", lf, c(o(R)), 1)) : h("", !0),
            !o(v) && o(K) ? (a(), u("div", rf, "Your Wippy Hub token is expired.")) : h("", !0),
            o(Xe) ? (a(), u("div", uf, c(o(Xe)), 1)) : h("", !0),
            o(st) || o($e) ? (a(), u("div", df, [
              m(o(C), {
                icon: "tabler:loader-2",
                class: "km-i spin",
                "aria-hidden": "true"
              }),
              O[22] || (O[22] = M(" Loading modules… ", -1))
            ])) : o(D).length > 0 ? (a(), u(X, { key: 4 }, [
              o(U).length ? (a(), u("div", cf, [
                r("div", pf, [
                  m(o(C), {
                    icon: "tabler:flame",
                    class: "km-i km-flame",
                    "aria-hidden": "true"
                  }),
                  O[23] || (O[23] = r("span", { class: "hub-section-title" }, "Most popular", -1)),
                  O[24] || (O[24] = r("span", { class: "hub-section-sub" }, "by downloads", -1))
                ]),
                r("div", ff, [
                  (a(!0), u(X, null, se(o(U), (y) => (a(), u("button", {
                    key: "f" + o(Tn)(y),
                    class: "feat-card",
                    style: qt({ "--accent": o(fn)(y) }),
                    onClick: (Ue) => o(bt)(y)
                  }, [
                    O[26] || (O[26] = r("span", { class: "feat-strip" }, null, -1)),
                    r("span", hf, [
                      m(o(C), {
                        icon: o(tn)(y),
                        class: "km-i-lg",
                        "aria-hidden": "true"
                      }, null, 8, ["icon"])
                    ]),
                    r("span", bf, [
                      r("span", vf, [
                        r("span", gf, c(o(en)(y)), 1),
                        o(dn)(y) ? (a(), u("span", yf, "app")) : h("", !0),
                        o(pn)(y) ? (a(), u("span", kf, [
                          m(o(C), {
                            icon: "tabler:lock",
                            class: "km-i-xs",
                            "aria-hidden": "true"
                          }),
                          O[25] || (O[25] = M(" private", -1))
                        ])) : h("", !0),
                        y.deprecated ? (a(), u("span", wf, "deprecated")) : h("", !0)
                      ]),
                      r("span", Sf, c(o(Mn)(y)), 1),
                      y.description ? (a(), u("span", $f, c(y.description), 1)) : h("", !0),
                      r("span", Cf, [
                        r("span", If, [
                          m(o(C), {
                            icon: "tabler:tag",
                            class: "km-i-xs",
                            "aria-hidden": "true"
                          }),
                          M(" " + c(y.latest_version || "?"), 1)
                        ]),
                        r("span", _f, [
                          m(o(C), {
                            icon: "tabler:download",
                            class: "km-i-xs",
                            "aria-hidden": "true"
                          }),
                          M(" " + c(o(mn)(y.total_downloads)), 1)
                        ]),
                        y.license ? (a(), u("span", {
                          key: 0,
                          class: "meta-pill",
                          title: y.license
                        }, [
                          m(o(C), {
                            icon: "tabler:license",
                            class: "km-i-xs",
                            "aria-hidden": "true"
                          }),
                          M(" " + c(o(Fn)(y.license)), 1)
                        ], 8, xf)) : h("", !0)
                      ])
                    ])
                  ], 12, mf))), 128))
                ])
              ])) : h("", !0),
              r("div", {
                class: ne(o(U).length ? "km-mt-sm" : "")
              }, [
                r("div", Of, [
                  m(o(C), {
                    icon: "tabler:apps",
                    class: "km-i km-accent",
                    "aria-hidden": "true"
                  }),
                  r("span", Lf, c(o(U).length ? "All modules" : "Available"), 1),
                  r("span", zf, c(o(D).length) + " available", 1)
                ]),
                r("div", Af, [
                  (a(!0), u(X, null, se(o(Z), (y) => (a(), u("button", {
                    key: o(Tn)(y),
                    class: "mod-card",
                    style: qt({ "--accent": o(fn)(y) }),
                    onClick: (Ue) => o(bt)(y)
                  }, [
                    r("span", Mf, [
                      m(o(C), {
                        icon: o(tn)(y),
                        class: "km-i",
                        "aria-hidden": "true"
                      }, null, 8, ["icon"])
                    ]),
                    r("span", Ef, [
                      r("span", Tf, [
                        r("span", Ff, c(o(en)(y)), 1),
                        r("span", Vf, c(y.latest_version || "—"), 1),
                        o(dn)(y) ? (a(), u("span", Df, "app")) : h("", !0),
                        o(pn)(y) ? (a(), u("span", Bf, [
                          m(o(C), {
                            icon: "tabler:lock",
                            class: "km-i-xs",
                            "aria-hidden": "true"
                          }),
                          O[27] || (O[27] = M(" private", -1))
                        ])) : h("", !0),
                        y.deprecated ? (a(), u("span", Rf, "deprecated")) : h("", !0)
                      ]),
                      r("span", jf, c(o(Mn)(y)), 1),
                      y.description ? (a(), u("span", Hf, c(y.description), 1)) : h("", !0),
                      r("span", Uf, [
                        r("span", Nf, [
                          m(o(C), {
                            icon: "tabler:download",
                            class: "km-i-xs",
                            "aria-hidden": "true"
                          }),
                          M(" " + c(o(mn)(y.total_downloads)), 1)
                        ]),
                        y.favorites_count ? (a(), u("span", Kf, [
                          m(o(C), {
                            icon: "tabler:star",
                            class: "km-i-xs",
                            "aria-hidden": "true"
                          }),
                          M(" " + c(y.favorites_count), 1)
                        ])) : h("", !0),
                        y.license ? (a(), u("span", {
                          key: 1,
                          class: "foot-stat km-dim",
                          title: y.license
                        }, c(o(Fn)(y.license)), 9, qf)) : h("", !0),
                        y.update_time ? (a(), u("span", Gf, c(o(Vn)(y.update_time, { maxUnit: "year" })), 1)) : h("", !0)
                      ])
                    ])
                  ], 12, Pf))), 128))
                ])
              ], 2)
            ], 64)) : !o(Xe) && o(Tt).length === 0 ? (a(), u("div", Wf, [
              m(o(C), {
                icon: "tabler:package-off",
                class: "km-i-xl km-dim km-block",
                "aria-hidden": "true"
              }),
              r("p", Zf, [
                O[28] || (O[28] = M(" No modules tagged ", -1)),
                r("code", Yf, c(o(n)), 1),
                O[29] || (O[29] = M(" are published yet. ", -1))
              ])
            ])) : !o(Xe) && o($) ? (a(), u("div", Xf, [...O[30] || (O[30] = [
              r("p", { class: "km-muted" }, "No available modules match this filter.", -1)
            ])])) : o(Xe) ? h("", !0) : (a(), u("div", Jf, [
              m(o(C), {
                icon: "tabler:circle-check",
                class: "km-i-xl km-dim km-block",
                "aria-hidden": "true"
              }),
              r("p", Qf, [
                O[31] || (O[31] = M(" All ", -1)),
                r("code", em, c(o(n)), 1),
                O[32] || (O[32] = M(" modules are installed — manage them under Installed below. ", -1))
              ])
            ]))
          ]),
          o(ot).length > 0 || o(Ze) ? (a(), u("section", tm, [
            r("button", {
              class: "km-collapse-head",
              "aria-expanded": o(Ye),
              onClick: O[6] || (O[6] = (y) => Ye.value = !o(Ye))
            }, [
              m(o(C), {
                icon: o(Ye) ? "tabler:chevron-down" : "tabler:chevron-right",
                class: "km-i",
                "aria-hidden": "true"
              }, null, 8, ["icon"]),
              O[33] || (O[33] = r("span", { class: "km-h2" }, "Installed", -1)),
              r("span", om, [
                M(c(o(Y).length), 1),
                o(Y).length !== o(it) ? (a(), u(X, { key: 0 }, [
                  M(" of " + c(o(it)), 1)
                ], 64)) : h("", !0),
                M(" module" + c(o(Y).length === 1 ? "" : "s"), 1)
              ]),
              o(je) > 0 && o(je) !== o(it) ? (a(), u("span", im, c(o(Ft)) + " of " + c(o(je)) + " hub module" + c(o(je) === 1 ? "" : "s"), 1)) : h("", !0),
              o(Te).length ? (a(), u("span", sm, c(o(Te).length) + " update" + c(o(Te).length === 1 ? "" : "s"), 1)) : h("", !0)
            ], 8, nm),
            o(Ye) ? (a(), u(X, { key: 0 }, [
              o(Ze) ? (a(), u("div", am, c(o(Ze)), 1)) : h("", !0),
              o(ot).length > 0 ? (a(), u("div", lm, [
                De(r("input", {
                  "onUpdate:modelValue": O[7] || (O[7] = (y) => Lt(Ge) ? Ge.value = y : null),
                  class: "km-input km-filter inst-filter",
                  placeholder: "Search installed…",
                  "aria-label": "Search installed modules"
                }, null, 512), [
                  [zn, o(Ge)]
                ]),
                m(o(An), {
                  modelValue: o(vt),
                  "onUpdate:modelValue": O[8] || (O[8] = (y) => Lt(vt) ? vt.value = y : null),
                  class: "km-sort",
                  options: [
                    { label: "All installed", value: "all" },
                    { label: "Root only", value: "root" },
                    { label: "Transitive only", value: "transitive" },
                    { label: "Local replacements", value: "local" }
                  ],
                  "option-label": "label",
                  "option-value": "value",
                  "aria-label": "Filter installed modules"
                }, null, 8, ["modelValue"])
              ])) : h("", !0),
              o(Y).length > 0 ? (a(), u("div", rm, [
                (a(!0), u(X, null, se(o(Y), (y) => (a(), u("button", {
                  key: y.id,
                  class: "inst-row",
                  style: qt({ "--accent": o(ke)(y) }),
                  onClick: (Ue) => o(bt)(y)
                }, [
                  O[35] || (O[35] = r("span", {
                    class: "inst-strip",
                    "aria-hidden": "true"
                  }, null, -1)),
                  r("div", dm, [
                    m(o(C), {
                      icon: o(at)(y),
                      class: "km-i",
                      "aria-hidden": "true"
                    }, null, 8, ["icon"])
                  ]),
                  r("div", cm, [
                    r("div", pm, [
                      r("span", fm, c(y.component), 1),
                      o(dn)(o(de)(y.component)) ? (a(), u("span", mm, "app")) : h("", !0),
                      r("span", {
                        class: ne(o(Vt)(y) ? "badge-installed kx-tag-caps" : "km-chip")
                      }, c(o(Fe)(y)), 3),
                      o(fe)(y) ? (a(), u("span", hm, [
                        m(o(C), {
                          icon: "tabler:lock",
                          class: "km-i-xs",
                          "aria-hidden": "true"
                        }),
                        O[34] || (O[34] = M(" private", -1))
                      ])) : h("", !0),
                      y.source ? (a(), u("span", bm, c(y.source), 1)) : h("", !0),
                      o(Je)(y) && o(Je)(y)?.status !== "current" ? (a(), u("span", {
                        key: 3,
                        class: ne(["inst-update", o(Je)(y)?.status]),
                        title: o(Je)(y)?.message || ""
                      }, [
                        m(o(C), {
                          icon: o(Dt)(y),
                          class: ne(["km-i-xs", o(Ct)(y) && "spin"]),
                          "aria-hidden": "true"
                        }, null, 8, ["icon", "class"]),
                        M(" " + c(o(on)(y)), 1)
                      ], 10, vm)) : h("", !0)
                    ]),
                    r("div", gm, [
                      M(c(y.id) + " ", 1),
                      o(lt)(y) ? (a(), u("span", ym, " · " + c(o(lt)(y)), 1)) : h("", !0)
                    ]),
                    o(Je)(y)?.message ? (a(), u("div", km, c(o(Je)(y)?.message), 1)) : h("", !0)
                  ]),
                  r("span", wm, c(o(ft)(y)), 1),
                  r("span", Sm, c(o(rt)(y)), 1),
                  r("div", $m, [
                    o(Je)(y)?.status === "available" || o(Ct)(y) ? (a(), u("button", {
                      key: 0,
                      class: "km-icon-btn",
                      disabled: o(Ct)(y) || o(Re),
                      "aria-label": `Update ${y.component}`,
                      onClick: Ln((Ue) => o(He)(y), ["stop"])
                    }, [
                      m(o(C), {
                        icon: o(Dt)(y),
                        class: ne(["km-i", o(Ct)(y) && "spin"]),
                        "aria-hidden": "true"
                      }, null, 8, ["icon", "class"])
                    ], 8, Cm)) : o(gt)(y) ? (a(), u("button", {
                      key: 1,
                      class: "km-icon-btn",
                      disabled: o(Re),
                      "aria-label": `Open update planner for ${y.component}`,
                      onClick: Ln((Ue) => o(It)(y), ["stop"])
                    }, [
                      m(o(C), {
                        icon: "tabler:refresh-dot",
                        class: "km-i",
                        "aria-hidden": "true"
                      })
                    ], 8, Im)) : (a(), u("button", {
                      key: 2,
                      class: "km-icon-btn",
                      disabled: "",
                      title: o(yt)(y),
                      "aria-label": `Cannot update ${y.component}: ${o(yt)(y)}`
                    }, [
                      m(o(C), {
                        icon: "tabler:refresh-off",
                        class: "km-i",
                        "aria-hidden": "true"
                      })
                    ], 8, _m)),
                    o(ve)(y) ? (a(), u("button", {
                      key: 3,
                      class: "km-icon-btn km-danger",
                      "aria-label": `Uninstall ${y.component}`,
                      onClick: Ln((Ue) => o(Zt)(y), ["stop"])
                    }, [
                      m(o(C), {
                        icon: "tabler:trash",
                        class: "km-i",
                        "aria-hidden": "true"
                      })
                    ], 8, xm)) : (a(), u("button", {
                      key: 4,
                      class: "km-icon-btn",
                      disabled: "",
                      title: o(Pe)(y),
                      "aria-label": `Cannot uninstall ${y.component}: ${o(Pe)(y)}`
                    }, [
                      m(o(C), {
                        icon: "tabler:trash-off",
                        class: "km-i",
                        "aria-hidden": "true"
                      })
                    ], 8, Om))
                  ]),
                  m(o(C), {
                    icon: "tabler:chevron-right",
                    class: "km-i km-chev",
                    "aria-hidden": "true"
                  })
                ], 12, um))), 128))
              ])) : o(ot).length > 0 ? (a(), u("div", Lm, [
                m(o(C), {
                  icon: "tabler:filter-off",
                  class: "km-i-xl km-dim km-block",
                  "aria-hidden": "true"
                }),
                O[36] || (O[36] = r("p", { class: "km-muted" }, "No installed modules match this filter.", -1))
              ])) : h("", !0)
            ], 64)) : h("", !0)
          ])) : h("", !0)
        ]))
      ])),
      o(we) ? (a(), ce(sc, {
        key: 4,
        open: !0,
        mode: o(we).mode,
        component: o(we).component,
        version: o(we).version,
        "current-id": o(we).currentId,
        "catalog-item": o(we).catalogItem,
        "installed-dep": o(we).installedDep,
        onClose: o(ut),
        onChanged: o(sn)
      }, null, 8, ["mode", "component", "version", "current-id", "catalog-item", "installed-dep", "onClose", "onChanged"])) : h("", !0),
      m(o(Zo), {
        visible: o(dt),
        "onUpdate:visible": O[11] || (O[11] = (y) => Lt(dt) ? dt.value = y : null),
        modal: "",
        closable: !o(ye),
        "dismissable-mask": !o(ye),
        "close-on-escape": !o(ye),
        class: "km-dialog",
        pt: { header: { class: "km-modal-head" }, content: { class: "km-dialog-content" }, footer: { class: "km-modal-foot" } },
        style: { width: "min(560px, calc(100vw - 40px))" }
      }, {
        header: ee(() => [...O[37] || (O[37] = [
          r("span", null, "Uninstall module", -1)
        ])]),
        footer: ee(() => [
          m(o(le), {
            size: "small",
            severity: "secondary",
            text: "",
            disabled: o(ye),
            onClick: O[10] || (O[10] = (y) => dt.value = !1)
          }, {
            default: ee(() => [...O[50] || (O[50] = [
              M("Cancel", -1)
            ])]),
            _: 1
          }, 8, ["disabled"]),
          m(o(le), {
            size: "small",
            severity: "secondary",
            outlined: "",
            disabled: o(ye) || o(et),
            onClick: o(St)
          }, {
            default: ee(() => [
              m(o(C), {
                icon: o(et) ? "tabler:loader-2" : "tabler:eye",
                class: ne(["km-i", o(et) && "spin"]),
                "aria-hidden": "true"
              }, null, 8, ["icon", "class"]),
              O[51] || (O[51] = M(" Preview ", -1))
            ]),
            _: 1
          }, 8, ["disabled", "onClick"]),
          m(o(le), {
            size: "small",
            severity: "danger",
            disabled: !!o(Ie),
            title: o(Ie) || void 0,
            onClick: o(Ot)
          }, {
            default: ee(() => [
              m(o(C), {
                icon: o(ye) ? "tabler:loader-2" : "tabler:trash",
                class: ne(["km-i", o(ye) && "spin"]),
                "aria-hidden": "true"
              }, null, 8, ["icon", "class"]),
              O[52] || (O[52] = M(" Uninstall ", -1))
            ]),
            _: 1
          }, 8, ["disabled", "title", "onClick"])
        ]),
        default: ee(() => [
          r("div", zm, [
            r("p", Am, [
              O[38] || (O[38] = M(" Uninstall ", -1)),
              r("code", Pm, c(o(ct)?.component), 1),
              r("span", Mm, "(" + c(o(ct)?.id) + ")", 1)
            ]),
            r("div", null, [
              O[39] || (O[39] = r("label", { class: "km-label" }, "Migration policy", -1)),
              m(o(An), {
                modelValue: o(Qe),
                "onUpdate:modelValue": O[9] || (O[9] = (y) => Lt(Qe) ? Qe.value = y : null),
                class: "km-sort km-w-full",
                options: o(i),
                "option-label": "label",
                "option-value": "value",
                "aria-label": "Uninstall migration policy"
              }, null, 8, ["modelValue", "options"]),
              O[40] || (O[40] = r("p", { class: "km-req-desc" }, [
                M("Default "),
                r("code", { class: "km-mono" }, "block"),
                M(". Choose "),
                r("code", { class: "km-mono" }, "down"),
                M(" only if the module's down migrations are safe; data loss is possible.")
              ], -1))
            ]),
            o(_t) ? (a(), u("div", Em, [
              o(Ce) ? (a(), u("span", Tm, c(o(Ce)), 1)) : h("", !0),
              M(c(o(_t)) + " ", 1),
              o(Bt).length ? (a(), u("div", Fm, "required by: " + c(o(Bt).join(", ")), 1)) : h("", !0)
            ])) : h("", !0),
            o(xt) ? (a(), u("div", Vm, [
              O[41] || (O[41] = r("strong", null, "Uninstall blocked:", -1)),
              M(" " + c(o(xt)), 1)
            ])) : h("", !0),
            o(et) ? (a(), u("div", Dm, [
              m(o(C), {
                icon: "tabler:loader-2",
                class: "km-i spin km-accent",
                "aria-hidden": "true"
              }),
              O[42] || (O[42] = r("span", { class: "km-grow km-running-label" }, "Previewing uninstall", -1))
            ])) : o(be) ? (a(), u("div", Bm, [
              o(be).warnings?.length ? (a(), u("div", Rm, [
                (a(!0), u(X, null, se(o(be).warnings, (y) => (a(), u("div", { key: y }, c(y), 1))), 128))
              ])) : h("", !0),
              o(be).removed?.length ? (a(), u("div", jm, [
                O[44] || (O[44] = r("div", { class: "km-preview-title" }, "Removed", -1)),
                (a(!0), u(X, null, se(o(be).removed, (y) => (a(), u("div", {
                  key: y.name || y.component,
                  class: "km-preview-row"
                }, [
                  m(o(C), {
                    icon: "tabler:minus",
                    class: "km-i-xs km-danger-fg",
                    "aria-hidden": "true"
                  }),
                  r("span", Hm, c(y.name || y.component), 1),
                  O[43] || (O[43] = r("span", { class: "km-grow" }, null, -1)),
                  r("span", Um, c(y.version), 1)
                ]))), 128))
              ])) : h("", !0),
              o(be).kept?.length ? (a(), u("div", Nm, [
                O[46] || (O[46] = r("div", { class: "km-preview-title" }, "Kept, still needed", -1)),
                (a(!0), u(X, null, se(o(be).kept, (y) => (a(), u("div", {
                  key: y.name || y.component,
                  class: "km-preview-row"
                }, [
                  m(o(C), {
                    icon: "tabler:lock",
                    class: "km-i-xs km-dim",
                    "aria-hidden": "true"
                  }),
                  r("span", Km, c(y.name || y.component), 1),
                  O[45] || (O[45] = r("span", { class: "km-grow" }, null, -1)),
                  r("span", qm, c(y.version), 1)
                ]))), 128))
              ])) : h("", !0),
              o(be).kept_under_uncertainty?.length ? (a(), u("div", Gm, [
                O[48] || (O[48] = r("div", { class: "km-preview-title" }, "Kept because usage is unclear", -1)),
                (a(!0), u(X, null, se(o(be).kept_under_uncertainty, (y) => (a(), u("div", {
                  key: y.name || y.component,
                  class: "km-preview-row"
                }, [
                  m(o(C), {
                    icon: "tabler:help",
                    class: "km-i-xs km-dim",
                    "aria-hidden": "true"
                  }),
                  r("span", Wm, c(y.name || y.component), 1),
                  O[47] || (O[47] = r("span", { class: "km-grow" }, null, -1)),
                  r("span", Zm, c(y.reason || y.version), 1)
                ]))), 128))
              ])) : h("", !0)
            ])) : h("", !0),
            o(Wt).length ? (a(), u("div", Ym, [
              O[49] || (O[49] = r("div", { class: "km-panel-title" }, "Uninstall steps", -1)),
              (a(!0), u(X, null, se(o(Wt), (y, Ue) => (a(), u("div", {
                key: `${y.step}-${Ue}`,
                class: ne(["km-ledger-row", y.status === "failed" || y.status === "rollback_failed" ? "km-ledger-bad" : y.status === "rolled_back" ? "km-ledger-warn" : "km-ledger-ok"])
              }, [
                r("span", Xm, c(Ue + 1), 1),
                r("span", Jm, c(o(Yt)(y)), 1),
                r("span", Qm, c(y.status), 1),
                y.message ? (a(), u("span", eh, c(y.message), 1)) : h("", !0)
              ], 2))), 128))
            ])) : h("", !0),
            o(ye) ? (a(), u("div", th, [
              m(o(C), {
                icon: "tabler:loader-2",
                class: "km-i spin km-accent",
                "aria-hidden": "true"
              }),
              r("span", nh, c(o(Rt)), 1),
              r("span", oh, c(o(jt)) + "s", 1)
            ])) : h("", !0)
          ])
        ]),
        _: 1
      }, 8, ["visible", "closable", "dismissable-mask", "close-on-escape"])
    ]));
  }
}), sh = { props: { type: "object", properties: {} } }, ah = {
  wippy: sh
};
class lh extends Di {
  static get wippyConfig() {
    return {
      propsSchema: ah.wippy.props,
      hostCssKeys: ["themeConfigUrl", "primeVueCssUrl"],
      inlineCss: Bi
    };
  }
  static get vueConfig() {
    return { rootComponent: ih, plugins: [Ri] };
  }
}
Gi(import.meta.url, lh);
//# sourceMappingURL=index.js.map

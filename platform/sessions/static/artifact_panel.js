import { s as fe, B as me, b as Se, z as xe, e as he, R as se, T as oe, c as Ne, d as We, f as ce, g as de, F as qe, M as Ce, k as Ze, h as Ye, i as U, Y as Je, C as Qe, I as Xe, v as _e, D as et, x as ve, S as tt, O as nt, L as it, j as st, $ as ot, J as lt, p as te, a as rt, u as at, l as ut, W as ct, P as dt } from "./wc-runtime-D-UdhneU.js";
import { openBlock as m, createElementBlock as y, mergeProps as h, createElementVNode as b, renderSlot as z, resolveComponent as G, Fragment as ie, renderList as ye, createCommentVNode as j, createVNode as H, resolveDirective as pt, createTextVNode as re, toDisplayString as E, normalizeClass as Q, createBlock as ne, resolveDynamicComponent as ke, withCtx as N, Transition as ht, normalizeProps as ft, createSlots as mt, withDirectives as Me, withModifiers as vt, defineComponent as yt, ref as q, computed as gt, onMounted as bt, onBeforeUnmount as It, unref as Z, vShow as Ot } from "vue";
import { Icon as pe } from "@iconify/vue";
import { on as Le, define as wt } from "@wippy-fe/proxy";
import { s as Pe, a as Y } from "./artifactPresentation-Dh1vHZDS.js";
import { s as St } from "./index-DiVT_d-J.js";
import { s as Ct, a as kt } from "./index-CG8BrS0R.js";
import { s as ze, a as Lt, l as zt, e as Tt, b as Ft, A as Vt } from "./hostRoute-zAgJIcxb.js";
import { u as At } from "./useHostRoute-CdzDcqsP.js";
import { u as xt } from "./useSessionsApi-BIuCYu5K.js";
import { s as Mt } from "./styles-Dhq3lUU_.js";
var Ee = {
  name: "BlankIcon",
  extends: fe
};
function Pt(t) {
  return Dt(t) || Kt(t) || Bt(t) || Et();
}
function Et() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Bt(t, e) {
  if (t) {
    if (typeof t == "string") return ge(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? ge(t, e) : void 0;
  }
}
function Kt(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function Dt(t) {
  if (Array.isArray(t)) return ge(t);
}
function ge(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, s = Array(e); n < e; n++) s[n] = t[n];
  return s;
}
function Ht(t, e, n, s, o, i) {
  return m(), y("svg", h({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, t.pti()), Pt(e[0] || (e[0] = [b("rect", {
    width: "1",
    height: "1",
    fill: "currentColor",
    "fill-opacity": "0"
  }, null, -1)])), 16);
}
Ee.render = Ht;
var Be = {
  name: "CheckIcon",
  extends: fe
};
function $t(t) {
  return Ut(t) || Gt(t) || jt(t) || Rt();
}
function Rt() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function jt(t, e) {
  if (t) {
    if (typeof t == "string") return be(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? be(t, e) : void 0;
  }
}
function Gt(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function Ut(t) {
  if (Array.isArray(t)) return be(t);
}
function be(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, s = Array(e); n < e; n++) s[n] = t[n];
  return s;
}
function Nt(t, e, n, s, o, i) {
  return m(), y("svg", h({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, t.pti()), $t(e[0] || (e[0] = [b("path", {
    d: "M4.86199 11.5948C4.78717 11.5923 4.71366 11.5745 4.64596 11.5426C4.57826 11.5107 4.51779 11.4652 4.46827 11.4091L0.753985 7.69483C0.683167 7.64891 0.623706 7.58751 0.580092 7.51525C0.536478 7.44299 0.509851 7.36177 0.502221 7.27771C0.49459 7.19366 0.506156 7.10897 0.536046 7.03004C0.565935 6.95111 0.613367 6.88 0.674759 6.82208C0.736151 6.76416 0.8099 6.72095 0.890436 6.69571C0.970973 6.67046 1.05619 6.66385 1.13966 6.67635C1.22313 6.68886 1.30266 6.72017 1.37226 6.76792C1.44186 6.81567 1.4997 6.8786 1.54141 6.95197L4.86199 10.2503L12.6397 2.49483C12.7444 2.42694 12.8689 2.39617 12.9932 2.40745C13.1174 2.41873 13.2343 2.47141 13.3251 2.55705C13.4159 2.64268 13.4753 2.75632 13.4938 2.87973C13.5123 3.00315 13.4888 3.1292 13.4271 3.23768L5.2557 11.4091C5.20618 11.4652 5.14571 11.5107 5.07801 11.5426C5.01031 11.5745 4.9368 11.5923 4.86199 11.5948Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
Be.render = Nt;
var Ke = {
  name: "ChevronDownIcon",
  extends: fe
};
function Wt(t) {
  return Jt(t) || Yt(t) || Zt(t) || qt();
}
function qt() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Zt(t, e) {
  if (t) {
    if (typeof t == "string") return Ie(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Ie(t, e) : void 0;
  }
}
function Yt(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function Jt(t) {
  if (Array.isArray(t)) return Ie(t);
}
function Ie(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, s = Array(e); n < e; n++) s[n] = t[n];
  return s;
}
function Qt(t, e, n, s, o, i) {
  return m(), y("svg", h({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, t.pti()), Wt(e[0] || (e[0] = [b("path", {
    d: "M7.01744 10.398C6.91269 10.3985 6.8089 10.378 6.71215 10.3379C6.61541 10.2977 6.52766 10.2386 6.45405 10.1641L1.13907 4.84913C1.03306 4.69404 0.985221 4.5065 1.00399 4.31958C1.02276 4.13266 1.10693 3.95838 1.24166 3.82747C1.37639 3.69655 1.55301 3.61742 1.74039 3.60402C1.92777 3.59062 2.11386 3.64382 2.26584 3.75424L7.01744 8.47394L11.769 3.75424C11.9189 3.65709 12.097 3.61306 12.2748 3.62921C12.4527 3.64535 12.6199 3.72073 12.7498 3.84328C12.8797 3.96582 12.9647 4.12842 12.9912 4.30502C13.0177 4.48162 12.9841 4.662 12.8958 4.81724L7.58083 10.1322C7.50996 10.2125 7.42344 10.2775 7.32656 10.3232C7.22968 10.3689 7.12449 10.3944 7.01744 10.398Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
Ke.render = Qt;
var De = {
  name: "SearchIcon",
  extends: fe
};
function Xt(t) {
  return nn(t) || tn(t) || en(t) || _t();
}
function _t() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function en(t, e) {
  if (t) {
    if (typeof t == "string") return Oe(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Oe(t, e) : void 0;
  }
}
function tn(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function nn(t) {
  if (Array.isArray(t)) return Oe(t);
}
function Oe(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, s = Array(e); n < e; n++) s[n] = t[n];
  return s;
}
function sn(t, e, n, s, o, i) {
  return m(), y("svg", h({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, t.pti()), Xt(e[0] || (e[0] = [b("path", {
    "fill-rule": "evenodd",
    "clip-rule": "evenodd",
    d: "M2.67602 11.0265C3.6661 11.688 4.83011 12.0411 6.02086 12.0411C6.81149 12.0411 7.59438 11.8854 8.32483 11.5828C8.87005 11.357 9.37808 11.0526 9.83317 10.6803L12.9769 13.8241C13.0323 13.8801 13.0983 13.9245 13.171 13.9548C13.2438 13.985 13.3219 14.0003 13.4007 14C13.4795 14.0003 13.5575 13.985 13.6303 13.9548C13.7031 13.9245 13.7691 13.8801 13.8244 13.8241C13.9367 13.7116 13.9998 13.5592 13.9998 13.4003C13.9998 13.2414 13.9367 13.089 13.8244 12.9765L10.6807 9.8328C11.053 9.37773 11.3573 8.86972 11.5831 8.32452C11.8857 7.59408 12.0414 6.81119 12.0414 6.02056C12.0414 4.8298 11.6883 3.66579 11.0268 2.67572C10.3652 1.68564 9.42494 0.913972 8.32483 0.45829C7.22472 0.00260857 6.01418 -0.116618 4.84631 0.115686C3.67844 0.34799 2.60568 0.921393 1.76369 1.76338C0.921698 2.60537 0.348296 3.67813 0.115991 4.84601C-0.116313 6.01388 0.00291375 7.22441 0.458595 8.32452C0.914277 9.42464 1.68595 10.3649 2.67602 11.0265ZM3.35565 2.0158C4.14456 1.48867 5.07206 1.20731 6.02086 1.20731C7.29317 1.20731 8.51338 1.71274 9.41304 2.6124C10.3127 3.51206 10.8181 4.73226 10.8181 6.00457C10.8181 6.95337 10.5368 7.88088 10.0096 8.66978C9.48251 9.45868 8.73328 10.0736 7.85669 10.4367C6.98011 10.7997 6.01554 10.8947 5.08496 10.7096C4.15439 10.5245 3.2996 10.0676 2.62869 9.39674C1.95778 8.72583 1.50089 7.87104 1.31579 6.94046C1.13068 6.00989 1.22568 5.04532 1.58878 4.16874C1.95187 3.29215 2.56675 2.54292 3.35565 2.0158Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
De.render = sn;
var on = `
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
`, ln = {
  root: "p-iconfield"
}, rn = me.extend({
  name: "iconfield",
  style: on,
  classes: ln
}), an = {
  name: "BaseIconField",
  extends: Se,
  style: rn,
  provide: function() {
    return {
      $pcIconField: this,
      $parentInstance: this
    };
  }
}, He = {
  name: "IconField",
  extends: an,
  inheritAttrs: !1
};
function un(t, e, n, s, o, i) {
  return m(), y("div", h({
    class: t.cx("root")
  }, t.ptmi("root")), [z(t.$slots, "default")], 16);
}
He.render = un;
var cn = {
  root: "p-inputicon"
}, dn = me.extend({
  name: "inputicon",
  classes: cn
}), pn = {
  name: "BaseInputIcon",
  extends: Se,
  style: dn,
  props: {
    class: null
  },
  provide: function() {
    return {
      $pcInputIcon: this,
      $parentInstance: this
    };
  }
}, $e = {
  name: "InputIcon",
  extends: pn,
  inheritAttrs: !1,
  computed: {
    containerClass: function() {
      return [this.cx("root"), this.class];
    }
  }
};
function hn(t, e, n, s, o, i) {
  return m(), y("span", h({
    class: i.containerClass
  }, t.ptmi("root"), {
    "aria-hidden": "true"
  }), [z(t.$slots, "default")], 16);
}
$e.render = hn;
var fn = `
    .p-virtualscroller-loader {
        background: dt('virtualscroller.loader.mask.background');
        color: dt('virtualscroller.loader.mask.color');
    }

    .p-virtualscroller-loading-icon {
        font-size: dt('virtualscroller.loader.icon.size');
        width: dt('virtualscroller.loader.icon.size');
        height: dt('virtualscroller.loader.icon.size');
    }
`, mn = `
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
`, Te = me.extend({
  name: "virtualscroller",
  css: mn,
  style: fn
}), vn = {
  name: "BaseVirtualScroller",
  extends: Se,
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
  style: Te,
  provide: function() {
    return {
      $pcVirtualScroller: this,
      $parentInstance: this
    };
  },
  beforeMount: function() {
    var e;
    Te.loadCSS({
      nonce: (e = this.$primevueConfig) === null || e === void 0 || (e = e.csp) === null || e === void 0 ? void 0 : e.nonce
    });
  }
};
function ae(t) {
  "@babel/helpers - typeof";
  return ae = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, ae(t);
}
function Fe(t, e) {
  var n = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var s = Object.getOwnPropertySymbols(t);
    e && (s = s.filter(function(o) {
      return Object.getOwnPropertyDescriptor(t, o).enumerable;
    })), n.push.apply(n, s);
  }
  return n;
}
function le(t) {
  for (var e = 1; e < arguments.length; e++) {
    var n = arguments[e] != null ? arguments[e] : {};
    e % 2 ? Fe(Object(n), !0).forEach(function(s) {
      Re(t, s, n[s]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(n)) : Fe(Object(n)).forEach(function(s) {
      Object.defineProperty(t, s, Object.getOwnPropertyDescriptor(n, s));
    });
  }
  return t;
}
function Re(t, e, n) {
  return (e = yn(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function yn(t) {
  var e = gn(t, "string");
  return ae(e) == "symbol" ? e : e + "";
}
function gn(t, e) {
  if (ae(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var s = n.call(t, e);
    if (ae(s) != "object") return s;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var je = {
  name: "VirtualScroller",
  extends: vn,
  inheritAttrs: !1,
  emits: ["update:numToleratedItems", "scroll", "scroll-index-change", "lazy-load"],
  data: function() {
    var e = this.isBoth();
    return {
      first: e ? {
        rows: 0,
        cols: 0
      } : 0,
      last: e ? {
        rows: 0,
        cols: 0
      } : 0,
      page: e ? {
        rows: 0,
        cols: 0
      } : 0,
      numItemsInViewport: e ? {
        rows: 0,
        cols: 0
      } : 0,
      lastScrollPos: e ? {
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
    numToleratedItems: function(e) {
      this.d_numToleratedItems = e;
    },
    loading: function(e, n) {
      this.lazy && e !== n && e !== this.d_loading && (this.d_loading = e);
    },
    items: {
      handler: function(e, n) {
        (!n || n.length !== (e || []).length) && (this.init(), this.calculateAutoSize());
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
      he(this.element) && (this.setContentEl(this.content), this.init(), this.calculateAutoSize(), this.defaultWidth = se(this.element), this.defaultHeight = oe(this.element), this.defaultContentWidth = se(this.content), this.defaultContentHeight = oe(this.content), this.initialized = !0), this.element && this.bindResizeListener();
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
    scrollTo: function(e) {
      this.element && this.element.scrollTo(e);
    },
    scrollToIndex: function(e) {
      var n = this, s = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "auto", o = this.isBoth(), i = this.isHorizontal(), a = o ? e.every(function(I) {
        return I > -1;
      }) : e > -1;
      if (a) {
        var u = this.first, d = this.element, c = d.scrollTop, l = c === void 0 ? 0 : c, p = d.scrollLeft, O = p === void 0 ? 0 : p, F = this.calculateNumItems(), w = F.numToleratedItems, C = this.getContentPosition(), g = this.itemSize, k = function() {
          var S = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0, R = arguments.length > 1 ? arguments[1] : void 0;
          return S <= R ? 0 : S;
        }, T = function(S, R, K) {
          return S * R + K;
        }, A = function() {
          var S = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0, R = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0;
          return n.scrollTo({
            left: S,
            top: R,
            behavior: s
          });
        }, v = o ? {
          rows: 0,
          cols: 0
        } : 0, $ = !1, x = !1;
        o ? (v = {
          rows: k(e[0], w[0]),
          cols: k(e[1], w[1])
        }, A(T(v.cols, g[1], C.left), T(v.rows, g[0], C.top)), x = this.lastScrollPos.top !== l || this.lastScrollPos.left !== O, $ = v.rows !== u.rows || v.cols !== u.cols) : (v = k(e, w), i ? A(T(v, g, C.left), l) : A(O, T(v, g, C.top)), x = this.lastScrollPos !== (i ? O : l), $ = v !== u), this.isRangeChanged = $, x && (this.first = v);
      }
    },
    scrollInView: function(e, n) {
      var s = this, o = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : "auto";
      if (n) {
        var i = this.isBoth(), a = this.isHorizontal(), u = i ? e.every(function(g) {
          return g > -1;
        }) : e > -1;
        if (u) {
          var d = this.getRenderedRange(), c = d.first, l = d.viewport, p = function() {
            var k = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0, T = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0;
            return s.scrollTo({
              left: k,
              top: T,
              behavior: o
            });
          }, O = n === "to-start", F = n === "to-end";
          if (O) {
            if (i)
              l.first.rows - c.rows > e[0] ? p(l.first.cols * this.itemSize[1], (l.first.rows - 1) * this.itemSize[0]) : l.first.cols - c.cols > e[1] && p((l.first.cols - 1) * this.itemSize[1], l.first.rows * this.itemSize[0]);
            else if (l.first - c > e) {
              var w = (l.first - 1) * this.itemSize;
              a ? p(w, 0) : p(0, w);
            }
          } else if (F) {
            if (i)
              l.last.rows - c.rows <= e[0] + 1 ? p(l.first.cols * this.itemSize[1], (l.first.rows + 1) * this.itemSize[0]) : l.last.cols - c.cols <= e[1] + 1 && p((l.first.cols + 1) * this.itemSize[1], l.first.rows * this.itemSize[0]);
            else if (l.last - c <= e + 1) {
              var C = (l.first + 1) * this.itemSize;
              a ? p(C, 0) : p(0, C);
            }
          }
        }
      } else
        this.scrollToIndex(e, o);
    },
    getRenderedRange: function() {
      var e = function(p, O) {
        return Math.floor(p / (O || p));
      }, n = this.first, s = 0;
      if (this.element) {
        var o = this.isBoth(), i = this.isHorizontal(), a = this.element, u = a.scrollTop, d = a.scrollLeft;
        if (o)
          n = {
            rows: e(u, this.itemSize[0]),
            cols: e(d, this.itemSize[1])
          }, s = {
            rows: n.rows + this.numItemsInViewport.rows,
            cols: n.cols + this.numItemsInViewport.cols
          };
        else {
          var c = i ? d : u;
          n = e(c, this.itemSize), s = n + this.numItemsInViewport;
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
      var e = this.isBoth(), n = this.isHorizontal(), s = this.itemSize, o = this.getContentPosition(), i = this.element ? this.element.offsetWidth - o.left : 0, a = this.element ? this.element.offsetHeight - o.top : 0, u = function(O, F) {
        return Math.ceil(O / (F || O));
      }, d = function(O) {
        return Math.ceil(O / 2);
      }, c = e ? {
        rows: u(a, s[0]),
        cols: u(i, s[1])
      } : u(n ? i : a, s), l = this.d_numToleratedItems || (e ? [d(c.rows), d(c.cols)] : d(c));
      return {
        numItemsInViewport: c,
        numToleratedItems: l
      };
    },
    calculateOptions: function() {
      var e = this, n = this.isBoth(), s = this.first, o = this.calculateNumItems(), i = o.numItemsInViewport, a = o.numToleratedItems, u = function(l, p, O) {
        var F = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : !1;
        return e.getLast(l + p + (l < O ? 2 : 3) * O, F);
      }, d = n ? {
        rows: u(s.rows, i.rows, a[0]),
        cols: u(s.cols, i.cols, a[1], !0)
      } : u(s, i, a);
      this.last = d, this.numItemsInViewport = i, this.d_numToleratedItems = a, this.$emit("update:numToleratedItems", this.d_numToleratedItems), this.showLoader && (this.loaderArr = n ? Array.from({
        length: i.rows
      }).map(function() {
        return Array.from({
          length: i.cols
        });
      }) : Array.from({
        length: i
      })), this.lazy && Promise.resolve().then(function() {
        var c;
        e.lazyLoadState = {
          first: e.step ? n ? {
            rows: 0,
            cols: s.cols
          } : 0 : s,
          last: Math.min(e.step ? e.step : d, ((c = e.items) === null || c === void 0 ? void 0 : c.length) || 0)
        }, e.$emit("lazy-load", e.lazyLoadState);
      });
    },
    calculateAutoSize: function() {
      var e = this;
      this.autoSize && !this.d_loading && Promise.resolve().then(function() {
        if (e.content) {
          var n = e.isBoth(), s = e.isHorizontal(), o = e.isVertical();
          e.content.style.minHeight = e.content.style.minWidth = "auto", e.content.style.position = "relative", e.element.style.contain = "none";
          var i = [se(e.element), oe(e.element)], a = i[0], u = i[1];
          (n || s) && (e.element.style.width = a < e.defaultWidth ? a + "px" : e.scrollWidth || e.defaultWidth + "px"), (n || o) && (e.element.style.height = u < e.defaultHeight ? u + "px" : e.scrollHeight || e.defaultHeight + "px"), e.content.style.minHeight = e.content.style.minWidth = "", e.content.style.position = "", e.element.style.contain = "";
        }
      });
    },
    getLast: function() {
      var e, n, s = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0, o = arguments.length > 1 ? arguments[1] : void 0;
      return this.items ? Math.min(o ? ((e = this.columns || this.items[0]) === null || e === void 0 ? void 0 : e.length) || 0 : ((n = this.items) === null || n === void 0 ? void 0 : n.length) || 0, s) : 0;
    },
    getContentPosition: function() {
      if (this.content) {
        var e = getComputedStyle(this.content), n = parseFloat(e.paddingLeft) + Math.max(parseFloat(e.left) || 0, 0), s = parseFloat(e.paddingRight) + Math.max(parseFloat(e.right) || 0, 0), o = parseFloat(e.paddingTop) + Math.max(parseFloat(e.top) || 0, 0), i = parseFloat(e.paddingBottom) + Math.max(parseFloat(e.bottom) || 0, 0);
        return {
          left: n,
          right: s,
          top: o,
          bottom: i,
          x: n + s,
          y: o + i
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
      var e = this;
      if (this.element) {
        var n = this.isBoth(), s = this.isHorizontal(), o = this.element.parentElement, i = this.scrollWidth || "".concat(this.element.offsetWidth || o.offsetWidth, "px"), a = this.scrollHeight || "".concat(this.element.offsetHeight || o.offsetHeight, "px"), u = function(c, l) {
          return e.element.style[c] = l;
        };
        n || s ? (u("height", a), u("width", i)) : u("height", a);
      }
    },
    setSpacerSize: function() {
      var e = this, n = this.items;
      if (n) {
        var s = this.isBoth(), o = this.isHorizontal(), i = this.getContentPosition(), a = function(d, c, l) {
          var p = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : 0;
          return e.spacerStyle = le(le({}, e.spacerStyle), Re({}, "".concat(d), (c || []).length * l + p + "px"));
        };
        s ? (a("height", n, this.itemSize[0], i.y), a("width", this.columns || n[1], this.itemSize[1], i.x)) : o ? a("width", this.columns || n, this.itemSize, i.x) : a("height", n, this.itemSize, i.y);
      }
    },
    setContentPosition: function(e) {
      var n = this;
      if (this.content && !this.appendOnly) {
        var s = this.isBoth(), o = this.isHorizontal(), i = e ? e.first : this.first, a = function(l, p) {
          return l * p;
        }, u = function() {
          var l = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0, p = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0;
          return n.contentStyle = le(le({}, n.contentStyle), {
            transform: "translate3d(".concat(l, "px, ").concat(p, "px, 0)")
          });
        };
        if (s)
          u(a(i.cols, this.itemSize[1]), a(i.rows, this.itemSize[0]));
        else {
          var d = a(i, this.itemSize);
          o ? u(d, 0) : u(0, d);
        }
      }
    },
    onScrollPositionChange: function(e) {
      var n = this, s = e.target, o = this.isBoth(), i = this.isHorizontal(), a = this.getContentPosition(), u = function(L, B) {
        return L ? L > B ? L - B : L : 0;
      }, d = function(L, B) {
        return Math.floor(L / (B || L));
      }, c = function(L, B, W, X, D, r) {
        return L <= D ? D : r ? W - X - D : B + D - 1;
      }, l = function(L, B, W, X, D, r, f, V) {
        if (L <= r) return 0;
        var M = Math.max(0, f ? L < B ? W : L - r : L > B ? W : L - 2 * r), P = n.getLast(M, V);
        return M > P ? P - D : M;
      }, p = function(L, B, W, X, D, r) {
        var f = B + X + 2 * D;
        return L >= D && (f += D + 1), n.getLast(f, r);
      }, O = u(s.scrollTop, a.top), F = u(s.scrollLeft, a.left), w = o ? {
        rows: 0,
        cols: 0
      } : 0, C = this.last, g = !1, k = this.lastScrollPos;
      if (o) {
        var T = this.lastScrollPos.top <= O, A = this.lastScrollPos.left <= F;
        if (!this.appendOnly || this.appendOnly && (T || A)) {
          var v = {
            rows: d(O, this.itemSize[0]),
            cols: d(F, this.itemSize[1])
          }, $ = {
            rows: c(v.rows, this.first.rows, this.last.rows, this.numItemsInViewport.rows, this.d_numToleratedItems[0], T),
            cols: c(v.cols, this.first.cols, this.last.cols, this.numItemsInViewport.cols, this.d_numToleratedItems[1], A)
          };
          w = {
            rows: l(v.rows, $.rows, this.first.rows, this.last.rows, this.numItemsInViewport.rows, this.d_numToleratedItems[0], T),
            cols: l(v.cols, $.cols, this.first.cols, this.last.cols, this.numItemsInViewport.cols, this.d_numToleratedItems[1], A, !0)
          }, C = {
            rows: p(v.rows, w.rows, this.last.rows, this.numItemsInViewport.rows, this.d_numToleratedItems[0]),
            cols: p(v.cols, w.cols, this.last.cols, this.numItemsInViewport.cols, this.d_numToleratedItems[1], !0)
          }, g = w.rows !== this.first.rows || C.rows !== this.last.rows || w.cols !== this.first.cols || C.cols !== this.last.cols || this.isRangeChanged, k = {
            top: O,
            left: F
          };
        }
      } else {
        var x = i ? F : O, I = this.lastScrollPos <= x;
        if (!this.appendOnly || this.appendOnly && I) {
          var S = d(x, this.itemSize), R = c(S, this.first, this.last, this.numItemsInViewport, this.d_numToleratedItems, I);
          w = l(S, R, this.first, this.last, this.numItemsInViewport, this.d_numToleratedItems, I), C = p(S, w, this.last, this.numItemsInViewport, this.d_numToleratedItems), g = w !== this.first || C !== this.last || this.isRangeChanged, k = x;
        }
      }
      return {
        first: w,
        last: C,
        isRangeChanged: g,
        scrollPos: k
      };
    },
    onScrollChange: function(e) {
      var n = this.onScrollPositionChange(e), s = n.first, o = n.last, i = n.isRangeChanged, a = n.scrollPos;
      if (i) {
        var u = {
          first: s,
          last: o
        };
        if (this.setContentPosition(u), this.first = s, this.last = o, this.lastScrollPos = a, this.$emit("scroll-index-change", u), this.lazy && this.isPageChanged(s)) {
          var d, c, l = {
            first: this.step ? Math.min(this.getPageByFirst(s) * this.step, (((d = this.items) === null || d === void 0 ? void 0 : d.length) || 0) - this.step) : s,
            last: Math.min(this.step ? (this.getPageByFirst(s) + 1) * this.step : o, ((c = this.items) === null || c === void 0 ? void 0 : c.length) || 0)
          }, p = this.lazyLoadState.first !== l.first || this.lazyLoadState.last !== l.last;
          p && this.$emit("lazy-load", l), this.lazyLoadState = l;
        }
      }
    },
    onScroll: function(e) {
      var n = this;
      if (this.$emit("scroll", e), this.delay) {
        if (this.scrollTimeout && clearTimeout(this.scrollTimeout), this.isPageChanged()) {
          if (!this.d_loading && this.showLoader) {
            var s = this.onScrollPositionChange(e), o = s.isRangeChanged, i = o || (this.step ? this.isPageChanged() : !1);
            i && (this.d_loading = !0);
          }
          this.scrollTimeout = setTimeout(function() {
            n.onScrollChange(e), n.d_loading && n.showLoader && (!n.lazy || n.loading === void 0) && (n.d_loading = !1, n.page = n.getPageByFirst());
          }, this.delay);
        }
      } else
        this.onScrollChange(e);
    },
    onResize: function() {
      var e = this;
      this.resizeTimeout && clearTimeout(this.resizeTimeout), this.resizeTimeout = setTimeout(function() {
        if (he(e.element)) {
          var n = e.isBoth(), s = e.isVertical(), o = e.isHorizontal(), i = [se(e.element), oe(e.element)], a = i[0], u = i[1], d = a !== e.defaultWidth, c = u !== e.defaultHeight, l = n ? d || c : o ? d : s ? c : !1;
          l && (e.d_numToleratedItems = e.numToleratedItems, e.defaultWidth = a, e.defaultHeight = u, e.defaultContentWidth = se(e.content), e.defaultContentHeight = oe(e.content), e.init());
        }
      }, this.resizeDelay);
    },
    bindResizeListener: function() {
      var e = this;
      this.resizeListener || (this.resizeListener = this.onResize.bind(this), window.addEventListener("resize", this.resizeListener), window.addEventListener("orientationchange", this.resizeListener), this.resizeObserver = new ResizeObserver(function() {
        e.onResize();
      }), this.resizeObserver.observe(this.element));
    },
    unbindResizeListener: function() {
      this.resizeListener && (window.removeEventListener("resize", this.resizeListener), window.removeEventListener("orientationchange", this.resizeListener), this.resizeListener = null), this.resizeObserver && (this.resizeObserver.disconnect(), this.resizeObserver = null);
    },
    getOptions: function(e) {
      var n = (this.items || []).length, s = this.isBoth() ? this.first.rows + e : this.first + e;
      return {
        index: s,
        count: n,
        first: s === 0,
        last: s === n - 1,
        even: s % 2 === 0,
        odd: s % 2 !== 0
      };
    },
    getLoaderOptions: function(e, n) {
      var s = this.loaderArr.length;
      return le({
        index: e,
        count: s,
        first: e === 0,
        last: e === s - 1,
        even: e % 2 === 0,
        odd: e % 2 !== 0
      }, n);
    },
    getPageByFirst: function(e) {
      return Math.floor(((e ?? this.first) + this.d_numToleratedItems * 4) / (this.step || 1));
    },
    isPageChanged: function(e) {
      return this.step && !this.lazy ? this.page !== this.getPageByFirst(e ?? this.first) : !0;
    },
    setContentEl: function(e) {
      this.content = e || this.content || xe(this.element, '[data-pc-section="content"]');
    },
    elementRef: function(e) {
      this.element = e;
    },
    contentRef: function(e) {
      this.content = e;
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
      var e = this;
      return this.items && !this.d_loading ? this.isBoth() ? this.items.slice(this.appendOnly ? 0 : this.first.rows, this.last.rows).map(function(n) {
        return e.columns ? n : n.slice(e.appendOnly ? 0 : e.first.cols, e.last.cols);
      }) : this.isHorizontal() && this.columns ? this.items : this.items.slice(this.appendOnly ? 0 : this.first, this.last) : [];
    },
    loadedRows: function() {
      return this.d_loading ? this.loaderDisabled ? this.loaderArr : [] : this.loadedItems;
    },
    loadedColumns: function() {
      if (this.columns) {
        var e = this.isBoth(), n = this.isHorizontal();
        if (e || n)
          return this.d_loading && this.loaderDisabled ? e ? this.loaderArr[0] : this.loaderArr : this.columns.slice(e ? this.first.cols : this.first, e ? this.last.cols : this.last);
      }
      return this.columns;
    }
  },
  components: {
    SpinnerIcon: Pe
  }
}, bn = ["tabindex"];
function In(t, e, n, s, o, i) {
  var a = G("SpinnerIcon");
  return t.disabled ? (m(), y(ie, {
    key: 1
  }, [z(t.$slots, "default"), z(t.$slots, "content", {
    items: t.items,
    rows: t.items,
    columns: i.loadedColumns
  })], 64)) : (m(), y("div", h({
    key: 0,
    ref: i.elementRef,
    class: i.containerClass,
    tabindex: t.tabindex,
    style: t.style,
    onScroll: e[0] || (e[0] = function() {
      return i.onScroll && i.onScroll.apply(i, arguments);
    })
  }, t.ptmi("root")), [z(t.$slots, "content", {
    styleClass: i.contentClass,
    items: i.loadedItems,
    getItemOptions: i.getOptions,
    loading: o.d_loading,
    getLoaderOptions: i.getLoaderOptions,
    itemSize: t.itemSize,
    rows: i.loadedRows,
    columns: i.loadedColumns,
    contentRef: i.contentRef,
    spacerStyle: o.spacerStyle,
    contentStyle: o.contentStyle,
    vertical: i.isVertical(),
    horizontal: i.isHorizontal(),
    both: i.isBoth()
  }, function() {
    return [b("div", h({
      ref: i.contentRef,
      class: i.contentClass,
      style: o.contentStyle
    }, t.ptm("content")), [(m(!0), y(ie, null, ye(i.loadedItems, function(u, d) {
      return z(t.$slots, "item", {
        key: d,
        item: u,
        options: i.getOptions(d)
      });
    }), 128))], 16)];
  }), t.showSpacer ? (m(), y("div", h({
    key: 0,
    class: "p-virtualscroller-spacer",
    style: o.spacerStyle
  }, t.ptm("spacer")), null, 16)) : j("", !0), !t.loaderDisabled && t.showLoader && o.d_loading ? (m(), y("div", h({
    key: 1,
    class: i.loaderClass
  }, t.ptm("loader")), [t.$slots && t.$slots.loader ? (m(!0), y(ie, {
    key: 0
  }, ye(o.loaderArr, function(u, d) {
    return z(t.$slots, "loader", {
      key: d,
      options: i.getLoaderOptions(d, i.isBoth() && {
        numCols: t.d_numItemsInViewport.cols
      })
    });
  }), 128)) : j("", !0), z(t.$slots, "loadingicon", {}, function() {
    return [H(a, h({
      spin: "",
      class: "p-virtualscroller-loading-icon"
    }, t.ptm("loadingIcon")), null, 16)];
  })], 16)) : j("", !0)], 16, bn));
}
je.render = In;
var On = `
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
`, wn = {
  root: function(e) {
    var n = e.instance, s = e.props, o = e.state;
    return ["p-select p-component p-inputwrapper", {
      "p-disabled": s.disabled,
      "p-invalid": n.$invalid,
      "p-variant-filled": n.$variant === "filled",
      "p-focus": o.focused,
      "p-inputwrapper-filled": n.$filled,
      "p-inputwrapper-focus": o.focused || o.overlayVisible,
      "p-select-open": o.overlayVisible,
      "p-select-fluid": n.$fluid,
      "p-select-sm p-inputfield-sm": s.size === "small",
      "p-select-lg p-inputfield-lg": s.size === "large"
    }];
  },
  label: function(e) {
    var n, s = e.instance, o = e.props;
    return ["p-select-label", {
      "p-placeholder": !o.editable && s.label === o.placeholder,
      "p-select-label-empty": !o.editable && !s.$slots.value && (s.label === "p-emptylabel" || ((n = s.label) === null || n === void 0 ? void 0 : n.length) === 0)
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
  option: function(e) {
    var n = e.instance, s = e.props, o = e.state, i = e.option, a = e.focusedOption;
    return ["p-select-option", {
      "p-select-option-selected": n.isSelected(i) && s.highlightOnSelect,
      "p-focus": o.focusedOptionIndex === a,
      "p-disabled": n.isOptionDisabled(i)
    }];
  },
  optionLabel: "p-select-option-label",
  optionCheckIcon: "p-select-option-check-icon",
  optionBlankIcon: "p-select-option-blank-icon",
  emptyMessage: "p-select-empty-message"
}, Sn = me.extend({
  name: "select",
  style: On,
  classes: wn
}), Cn = {
  name: "BaseSelect",
  extends: kt,
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
  style: Sn,
  provide: function() {
    return {
      $pcSelect: this,
      $parentInstance: this
    };
  }
};
function ue(t) {
  "@babel/helpers - typeof";
  return ue = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, ue(t);
}
function kn(t) {
  return Fn(t) || Tn(t) || zn(t) || Ln();
}
function Ln() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function zn(t, e) {
  if (t) {
    if (typeof t == "string") return we(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? we(t, e) : void 0;
  }
}
function Tn(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function Fn(t) {
  if (Array.isArray(t)) return we(t);
}
function we(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, s = Array(e); n < e; n++) s[n] = t[n];
  return s;
}
function Ve(t, e) {
  var n = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var s = Object.getOwnPropertySymbols(t);
    e && (s = s.filter(function(o) {
      return Object.getOwnPropertyDescriptor(t, o).enumerable;
    })), n.push.apply(n, s);
  }
  return n;
}
function Ae(t) {
  for (var e = 1; e < arguments.length; e++) {
    var n = arguments[e] != null ? arguments[e] : {};
    e % 2 ? Ve(Object(n), !0).forEach(function(s) {
      J(t, s, n[s]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(n)) : Ve(Object(n)).forEach(function(s) {
      Object.defineProperty(t, s, Object.getOwnPropertyDescriptor(n, s));
    });
  }
  return t;
}
function J(t, e, n) {
  return (e = Vn(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function Vn(t) {
  var e = An(t, "string");
  return ue(e) == "symbol" ? e : e + "";
}
function An(t, e) {
  if (ue(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var s = n.call(t, e);
    if (ue(s) != "object") return s;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var Ge = {
  name: "Select",
  extends: Cn,
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
    this.unbindOutsideClickListener(), this.unbindResizeListener(), this.unbindLabelClickListener(), this.unbindMatchMediaOrientationListener(), this.scrollHandler && (this.scrollHandler.destroy(), this.scrollHandler = null), this.overlay && (ve.clear(this.overlay), this.overlay = null);
  },
  methods: {
    getOptionIndex: function(e, n) {
      return this.virtualScrollerDisabled ? e : n && n(e).index;
    },
    getOptionLabel: function(e) {
      return this.optionLabel ? te(e, this.optionLabel) : e;
    },
    getOptionValue: function(e) {
      return this.optionValue ? te(e, this.optionValue) : e;
    },
    getOptionRenderKey: function(e, n) {
      return (this.dataKey ? te(e, this.dataKey) : this.getOptionLabel(e)) + "_" + n;
    },
    getPTItemOptions: function(e, n, s, o) {
      return this.ptm(o, {
        context: {
          option: e,
          index: s,
          selected: this.isSelected(e),
          focused: this.focusedOptionIndex === this.getOptionIndex(s, n),
          disabled: this.isOptionDisabled(e)
        }
      });
    },
    isOptionDisabled: function(e) {
      return this.optionDisabled ? te(e, this.optionDisabled) : !1;
    },
    isOptionGroup: function(e) {
      return this.optionGroupLabel && e.optionGroup && e.group;
    },
    getOptionGroupLabel: function(e) {
      return te(e, this.optionGroupLabel);
    },
    getOptionGroupChildren: function(e) {
      return te(e, this.optionGroupChildren);
    },
    getAriaPosInset: function(e) {
      var n = this;
      return (this.optionGroupLabel ? e - this.visibleOptions.slice(0, e).filter(function(s) {
        return n.isOptionGroup(s);
      }).length : e) + 1;
    },
    show: function(e) {
      this.$emit("before-show"), this.overlayVisible = !0, this.focusedOptionIndex = this.focusedOptionIndex !== -1 ? this.focusedOptionIndex : this.autoOptionFocus ? this.findFirstFocusedOptionIndex() : this.editable ? -1 : this.findSelectedOptionIndex(), e && U(this.$refs.focusInput);
    },
    hide: function(e) {
      var n = this, s = function() {
        n.$emit("before-hide"), n.overlayVisible = !1, n.clicked = !1, n.focusedOptionIndex = -1, n.searchValue = "", n.resetFilterOnHide && (n.filterValue = null), e && U(n.$refs.focusInput);
      };
      setTimeout(function() {
        s();
      }, 0);
    },
    onFocus: function(e) {
      this.disabled || (this.focused = !0, this.overlayVisible && (this.focusedOptionIndex = this.focusedOptionIndex !== -1 ? this.focusedOptionIndex : this.autoOptionFocus ? this.findFirstFocusedOptionIndex() : this.editable ? -1 : this.findSelectedOptionIndex(), this.scrollInView(this.focusedOptionIndex)), this.$emit("focus", e));
    },
    onBlur: function(e) {
      var n = this;
      setTimeout(function() {
        var s, o;
        n.focused = !1, n.focusedOptionIndex = -1, n.searchValue = "", n.$emit("blur", e), (s = (o = n.formField).onBlur) === null || s === void 0 || s.call(o, e);
      }, 100);
    },
    onKeyDown: function(e) {
      var n = this;
      if (this.disabled) {
        e.preventDefault();
        return;
      }
      if (ot())
        switch (e.code) {
          case "Backspace":
            this.onBackspaceKey(e, this.editable);
            break;
          case "Enter":
          case "NumpadDecimal":
            this.onEnterKey(e);
            break;
          default:
            e.preventDefault();
            return;
        }
      var s = e.metaKey || e.ctrlKey;
      switch (e.code) {
        case "ArrowDown":
          this.onArrowDownKey(e);
          break;
        case "ArrowUp":
          this.onArrowUpKey(e, this.editable);
          break;
        case "ArrowLeft":
        case "ArrowRight":
          this.onArrowLeftKey(e, this.editable);
          break;
        case "Home":
          this.onHomeKey(e, this.editable);
          break;
        case "End":
          this.onEndKey(e, this.editable);
          break;
        case "PageDown":
          this.onPageDownKey(e);
          break;
        case "PageUp":
          this.onPageUpKey(e);
          break;
        case "Space":
          this.onSpaceKey(e, this.editable);
          break;
        case "Enter":
        case "NumpadEnter":
          this.onEnterKey(e);
          break;
        case "Escape":
          this.onEscapeKey(e);
          break;
        case "Tab":
          this.onTabKey(e);
          break;
        case "Backspace":
          this.onBackspaceKey(e, this.editable);
          break;
        case "ShiftLeft":
        case "ShiftRight":
          break;
        default:
          !s && lt(e.key) && (!this.overlayVisible && this.show(), !this.editable && this.searchOptions(e, e.key), this.filter && this.$nextTick(function() {
            n.$refs.filterInput && U(n.$refs.filterInput.$el);
          }));
          break;
      }
      this.clicked = !1;
    },
    onEditableInput: function(e) {
      var n = e.target.value;
      this.searchValue = "";
      var s = this.searchOptions(e, n);
      !s && (this.focusedOptionIndex = -1), this.updateModel(e, n), !this.overlayVisible && de(n) && this.show();
    },
    onContainerClick: function(e) {
      this.disabled || this.loading || e.target.tagName === "INPUT" || e.target.getAttribute("data-pc-section") === "clearicon" || e.target.closest('[data-pc-section="clearicon"]') || ((!this.overlay || !this.overlay.contains(e.target)) && (this.overlayVisible ? this.hide(!0) : this.show(!0)), this.clicked = !0);
    },
    onClearClick: function(e) {
      this.updateModel(e, null), this.resetFilterOnClear && (this.filterValue = null);
    },
    onFirstHiddenFocus: function(e) {
      var n = e.relatedTarget === this.$refs.focusInput ? st(this.overlay, ':not([data-p-hidden-focusable="true"])') : this.$refs.focusInput;
      U(n);
    },
    onLastHiddenFocus: function(e) {
      var n = e.relatedTarget === this.$refs.focusInput ? it(this.overlay, ':not([data-p-hidden-focusable="true"])') : this.$refs.focusInput;
      U(n);
    },
    onOptionSelect: function(e, n) {
      var s = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : !0;
      if (this.overlayVisible) {
        var o = this.getOptionValue(n);
        this.updateModel(e, o), s && this.hide(!0);
      }
    },
    onOptionMouseMove: function(e, n) {
      this.focusOnHover && this.changeFocusedOptionIndex(e, n);
    },
    onFilterChange: function(e) {
      var n = e.target.value;
      this.filterValue = n, this.focusedOptionIndex = -1, this.$emit("filter", {
        originalEvent: e,
        value: n
      }), !this.virtualScrollerDisabled && this.virtualScroller.scrollToIndex(0);
    },
    onFilterKeyDown: function(e) {
      if (!e.isComposing)
        switch (e.code) {
          case "ArrowDown":
            this.onArrowDownKey(e);
            break;
          case "ArrowUp":
            this.onArrowUpKey(e, !0);
            break;
          case "ArrowLeft":
          case "ArrowRight":
            this.onArrowLeftKey(e, !0);
            break;
          case "Home":
            this.onHomeKey(e, !0);
            break;
          case "End":
            this.onEndKey(e, !0);
            break;
          case "Enter":
          case "NumpadEnter":
            this.onEnterKey(e);
            break;
          case "Escape":
            this.onEscapeKey(e);
            break;
          case "Tab":
            this.onTabKey(e);
            break;
        }
    },
    onFilterBlur: function() {
      this.focusedOptionIndex = -1;
    },
    onFilterUpdated: function() {
      this.overlayVisible && this.alignOverlay();
    },
    onOverlayClick: function(e) {
      nt.emit("overlay-click", {
        originalEvent: e,
        target: this.$el
      });
    },
    onOverlayKeyDown: function(e) {
      switch (e.code) {
        case "Escape":
          this.onEscapeKey(e);
          break;
      }
    },
    onArrowDownKey: function(e) {
      if (!this.overlayVisible)
        this.show(), this.editable && this.changeFocusedOptionIndex(e, this.findSelectedOptionIndex());
      else {
        var n = this.focusedOptionIndex !== -1 ? this.findNextOptionIndex(this.focusedOptionIndex) : this.clicked ? this.findFirstOptionIndex() : this.findFirstFocusedOptionIndex();
        this.changeFocusedOptionIndex(e, n);
      }
      e.preventDefault();
    },
    onArrowUpKey: function(e) {
      var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1;
      if (e.altKey && !n)
        this.focusedOptionIndex !== -1 && this.onOptionSelect(e, this.visibleOptions[this.focusedOptionIndex]), this.overlayVisible && this.hide(), e.preventDefault();
      else {
        var s = this.focusedOptionIndex !== -1 ? this.findPrevOptionIndex(this.focusedOptionIndex) : this.clicked ? this.findLastOptionIndex() : this.findLastFocusedOptionIndex();
        this.changeFocusedOptionIndex(e, s), !this.overlayVisible && this.show(), e.preventDefault();
      }
    },
    onArrowLeftKey: function(e) {
      var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1;
      n && (this.focusedOptionIndex = -1);
    },
    onHomeKey: function(e) {
      var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1;
      if (n) {
        var s = e.currentTarget;
        e.shiftKey ? s.setSelectionRange(0, e.target.selectionStart) : (s.setSelectionRange(0, 0), this.focusedOptionIndex = -1);
      } else
        this.changeFocusedOptionIndex(e, this.findFirstOptionIndex()), !this.overlayVisible && this.show();
      e.preventDefault();
    },
    onEndKey: function(e) {
      var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1;
      if (n) {
        var s = e.currentTarget;
        if (e.shiftKey)
          s.setSelectionRange(e.target.selectionStart, s.value.length);
        else {
          var o = s.value.length;
          s.setSelectionRange(o, o), this.focusedOptionIndex = -1;
        }
      } else
        this.changeFocusedOptionIndex(e, this.findLastOptionIndex()), !this.overlayVisible && this.show();
      e.preventDefault();
    },
    onPageUpKey: function(e) {
      this.scrollInView(0), e.preventDefault();
    },
    onPageDownKey: function(e) {
      this.scrollInView(this.visibleOptions.length - 1), e.preventDefault();
    },
    onEnterKey: function(e) {
      this.overlayVisible ? (this.focusedOptionIndex !== -1 && this.onOptionSelect(e, this.visibleOptions[this.focusedOptionIndex]), this.hide(!0)) : (this.focusedOptionIndex = -1, this.onArrowDownKey(e)), e.preventDefault();
    },
    onSpaceKey: function(e) {
      var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1;
      !n && this.onEnterKey(e);
    },
    onEscapeKey: function(e) {
      this.overlayVisible && this.hide(!0), e.preventDefault(), e.stopPropagation();
    },
    onTabKey: function(e) {
      var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1;
      n || (this.overlayVisible && this.hasFocusableElements() ? (U(this.$refs.firstHiddenFocusableElementOnOverlay), e.preventDefault()) : (this.focusedOptionIndex !== -1 && this.onOptionSelect(e, this.visibleOptions[this.focusedOptionIndex]), this.overlayVisible && this.hide(this.filter)));
    },
    onBackspaceKey: function(e) {
      var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1;
      n && !this.overlayVisible && this.show();
    },
    onOverlayEnter: function(e) {
      var n = this;
      ve.set("overlay", e, this.$primevue.config.zIndex.overlay), tt(e, {
        position: "absolute",
        top: "0"
      }), this.alignOverlay(), this.scrollInView(), this.$attrSelector && e.setAttribute(this.$attrSelector, ""), setTimeout(function() {
        n.autoFilterFocus && n.filter && U(n.$refs.filterInput.$el), n.autoUpdateModel();
      }, 1);
    },
    onOverlayAfterEnter: function() {
      this.bindOutsideClickListener(), this.bindScrollListener(), this.bindResizeListener(), this.$emit("show");
    },
    onOverlayLeave: function(e) {
      var n = this;
      e.style.pointerEvents = "none", this.unbindOutsideClickListener(), this.unbindScrollListener(), this.unbindResizeListener(), this.autoFilterFocus && this.filter && !this.editable && this.$nextTick(function() {
        n.$refs.filterInput && U(n.$refs.filterInput.$el);
      }), this.$emit("hide"), this.overlay = null;
    },
    onOverlayAfterLeave: function(e) {
      ve.clear(e);
    },
    alignOverlay: function() {
      this.appendTo === "self" ? Xe(this.overlay, this.$el) : this.overlay && (this.overlay.style.minWidth = _e(this.$el) + "px", et(this.overlay, this.$el));
    },
    bindOutsideClickListener: function() {
      var e = this;
      this.outsideClickListener || (this.outsideClickListener = function(n) {
        var s = n.composedPath();
        e.overlayVisible && e.overlay && !s.includes(e.$el) && !s.includes(e.overlay) && e.hide();
      }, document.addEventListener("click", this.outsideClickListener, !0));
    },
    unbindOutsideClickListener: function() {
      this.outsideClickListener && (document.removeEventListener("click", this.outsideClickListener, !0), this.outsideClickListener = null);
    },
    bindScrollListener: function() {
      var e = this;
      this.scrollHandler || (this.scrollHandler = new Qe(this.$refs.container, function() {
        e.overlayVisible && e.hide();
      })), this.scrollHandler.bindScrollListener();
    },
    unbindScrollListener: function() {
      this.scrollHandler && this.scrollHandler.unbindScrollListener();
    },
    bindResizeListener: function() {
      var e = this;
      this.resizeListener || (this.resizeListener = function() {
        e.overlayVisible && !Je() && e.hide();
      }, window.addEventListener("resize", this.resizeListener));
    },
    unbindResizeListener: function() {
      this.resizeListener && (window.removeEventListener("resize", this.resizeListener), this.resizeListener = null);
    },
    bindLabelClickListener: function() {
      var e = this;
      if (!this.editable && !this.labelClickListener) {
        var n = document.querySelector('label[for="'.concat(this.labelId, '"]'));
        n && he(n) && (this.labelClickListener = function() {
          U(e.$refs.focusInput);
        }, n.addEventListener("click", this.labelClickListener));
      }
    },
    unbindLabelClickListener: function() {
      if (this.labelClickListener) {
        var e = document.querySelector('label[for="'.concat(this.labelId, '"]'));
        e && he(e) && e.removeEventListener("click", this.labelClickListener);
      }
    },
    bindMatchMediaOrientationListener: function() {
      var e = this;
      if (!this.matchMediaOrientationListener) {
        var n = matchMedia("(orientation: portrait)");
        this.queryOrientation = n, this.matchMediaOrientationListener = function() {
          e.alignOverlay();
        }, this.queryOrientation.addEventListener("change", this.matchMediaOrientationListener);
      }
    },
    unbindMatchMediaOrientationListener: function() {
      this.matchMediaOrientationListener && (this.queryOrientation.removeEventListener("change", this.matchMediaOrientationListener), this.queryOrientation = null, this.matchMediaOrientationListener = null);
    },
    hasFocusableElements: function() {
      return Ye(this.overlay, ':not([data-p-hidden-focusable="true"])').length > 0;
    },
    isOptionExactMatched: function(e) {
      var n;
      return this.isValidOption(e) && typeof this.getOptionLabel(e) == "string" && ((n = this.getOptionLabel(e)) === null || n === void 0 ? void 0 : n.toLocaleLowerCase(this.filterLocale)) == this.searchValue.toLocaleLowerCase(this.filterLocale);
    },
    isOptionStartsWith: function(e) {
      var n;
      return this.isValidOption(e) && typeof this.getOptionLabel(e) == "string" && ((n = this.getOptionLabel(e)) === null || n === void 0 ? void 0 : n.toLocaleLowerCase(this.filterLocale).startsWith(this.searchValue.toLocaleLowerCase(this.filterLocale)));
    },
    isValidOption: function(e) {
      return de(e) && !(this.isOptionDisabled(e) || this.isOptionGroup(e));
    },
    isValidSelectedOption: function(e) {
      return this.isValidOption(e) && this.isSelected(e);
    },
    isSelected: function(e) {
      return Ze(this.d_value, this.getOptionValue(e), this.equalityKey);
    },
    findFirstOptionIndex: function() {
      var e = this;
      return this.visibleOptions.findIndex(function(n) {
        return e.isValidOption(n);
      });
    },
    findLastOptionIndex: function() {
      var e = this;
      return Ce(this.visibleOptions, function(n) {
        return e.isValidOption(n);
      });
    },
    findNextOptionIndex: function(e) {
      var n = this, s = e < this.visibleOptions.length - 1 ? this.visibleOptions.slice(e + 1).findIndex(function(o) {
        return n.isValidOption(o);
      }) : -1;
      return s > -1 ? s + e + 1 : e;
    },
    findPrevOptionIndex: function(e) {
      var n = this, s = e > 0 ? Ce(this.visibleOptions.slice(0, e), function(o) {
        return n.isValidOption(o);
      }) : -1;
      return s > -1 ? s : e;
    },
    findSelectedOptionIndex: function() {
      var e = this;
      return this.visibleOptions.findIndex(function(n) {
        return e.isValidSelectedOption(n);
      });
    },
    findFirstFocusedOptionIndex: function() {
      var e = this.findSelectedOptionIndex();
      return e < 0 ? this.findFirstOptionIndex() : e;
    },
    findLastFocusedOptionIndex: function() {
      var e = this.findSelectedOptionIndex();
      return e < 0 ? this.findLastOptionIndex() : e;
    },
    searchOptions: function(e, n) {
      var s = this;
      this.searchValue = (this.searchValue || "") + n;
      var o = -1, i = !1;
      return de(this.searchValue) && (o = this.visibleOptions.findIndex(function(a) {
        return s.isOptionExactMatched(a);
      }), o === -1 && (o = this.visibleOptions.findIndex(function(a) {
        return s.isOptionStartsWith(a);
      })), o !== -1 && (i = !0), o === -1 && this.focusedOptionIndex === -1 && (o = this.findFirstFocusedOptionIndex()), o !== -1 && this.changeFocusedOptionIndex(e, o)), this.searchTimeout && clearTimeout(this.searchTimeout), this.searchTimeout = setTimeout(function() {
        s.searchValue = "", s.searchTimeout = null;
      }, 500), i;
    },
    changeFocusedOptionIndex: function(e, n) {
      this.focusedOptionIndex !== n && (this.focusedOptionIndex = n, this.scrollInView(), this.selectOnFocus && this.onOptionSelect(e, this.visibleOptions[n], !1));
    },
    scrollInView: function() {
      var e = this, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : -1;
      this.$nextTick(function() {
        var s = n !== -1 ? "".concat(e.$id, "_").concat(n) : e.focusedOptionId, o = xe(e.list, 'li[id="'.concat(s, '"]'));
        o ? o.scrollIntoView && o.scrollIntoView({
          block: "nearest",
          inline: "nearest"
        }) : e.virtualScrollerDisabled || e.virtualScroller && e.virtualScroller.scrollToIndex(n !== -1 ? n : e.focusedOptionIndex);
      });
    },
    autoUpdateModel: function() {
      this.autoOptionFocus && (this.focusedOptionIndex = this.findFirstFocusedOptionIndex()), this.selectOnFocus && this.autoOptionFocus && !this.$filled && this.onOptionSelect(null, this.visibleOptions[this.focusedOptionIndex], !1);
    },
    updateModel: function(e, n) {
      this.writeValue(n, e), this.$emit("change", {
        originalEvent: e,
        value: n
      });
    },
    flatOptions: function(e) {
      var n = this;
      return (e || []).reduce(function(s, o, i) {
        s.push({
          optionGroup: o,
          group: !0,
          index: i
        });
        var a = n.getOptionGroupChildren(o);
        return a && a.forEach(function(u) {
          return s.push(u);
        }), s;
      }, []);
    },
    overlayRef: function(e) {
      this.overlay = e;
    },
    listRef: function(e, n) {
      this.list = e, n && n(e);
    },
    virtualScrollerRef: function(e) {
      this.virtualScroller = e;
    }
  },
  computed: {
    visibleOptions: function() {
      var e = this, n = this.optionGroupLabel ? this.flatOptions(this.options) : this.options || [];
      if (this.filterValue) {
        var s = qe.filter(n, this.searchFields, this.filterValue, this.filterMatchMode, this.filterLocale);
        if (this.optionGroupLabel) {
          var o = this.options || [], i = [];
          return o.forEach(function(a) {
            var u = e.getOptionGroupChildren(a), d = u.filter(function(c) {
              return s.includes(c);
            });
            d.length > 0 && i.push(Ae(Ae({}, a), {}, J({}, typeof e.optionGroupChildren == "string" ? e.optionGroupChildren : "items", kn(d))));
          }), this.flatOptions(i);
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
      var e = this.findSelectedOptionIndex();
      return e !== -1 ? this.getOptionLabel(this.visibleOptions[e]) : this.placeholder || "p-emptylabel";
    },
    editableInputValue: function() {
      var e = this.findSelectedOptionIndex();
      return e !== -1 ? this.getOptionLabel(this.visibleOptions[e]) : this.d_value || "";
    },
    equalityKey: function() {
      return this.optionValue ? null : this.dataKey;
    },
    searchFields: function() {
      return this.filterFields || [this.optionLabel];
    },
    filterResultMessageText: function() {
      return de(this.visibleOptions) ? this.filterMessageText.replaceAll("{0}", this.visibleOptions.length) : this.emptyFilterMessageText;
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
      var e = this;
      return this.visibleOptions.filter(function(n) {
        return !e.isOptionGroup(n);
      }).length;
    },
    isClearIconVisible: function() {
      return this.showClear && this.d_value != null && !this.disabled && !this.loading;
    },
    virtualScrollerDisabled: function() {
      return !this.virtualScrollerOptions;
    },
    containerDataP: function() {
      return ce(J({
        invalid: this.$invalid,
        disabled: this.disabled,
        focus: this.focused,
        fluid: this.$fluid,
        filled: this.$variant === "filled"
      }, this.size, this.size));
    },
    labelDataP: function() {
      return ce(J(J({
        placeholder: !this.editable && this.label === this.placeholder,
        clearable: this.showClear,
        disabled: this.disabled,
        editable: this.editable
      }, this.size, this.size), "empty", !this.editable && !this.$slots.value && (this.label === "p-emptylabel" || this.label.length === 0)));
    },
    dropdownIconDataP: function() {
      return ce(J({}, this.size, this.size));
    },
    overlayDataP: function() {
      return ce(J({}, "portal-" + this.appendTo, "portal-" + this.appendTo));
    }
  },
  directives: {
    ripple: We
  },
  components: {
    InputText: Ct,
    VirtualScroller: je,
    Portal: Ne,
    InputIcon: $e,
    IconField: He,
    TimesIcon: St,
    ChevronDownIcon: Ke,
    SpinnerIcon: Pe,
    SearchIcon: De,
    CheckIcon: Be,
    BlankIcon: Ee
  }
}, xn = ["id", "data-p"], Mn = ["name", "id", "value", "placeholder", "tabindex", "disabled", "aria-label", "aria-labelledby", "aria-expanded", "aria-controls", "aria-activedescendant", "aria-invalid", "data-p"], Pn = ["name", "id", "tabindex", "aria-label", "aria-labelledby", "aria-expanded", "aria-controls", "aria-activedescendant", "aria-invalid", "aria-disabled", "data-p"], En = ["data-p"], Bn = ["id"], Kn = ["id"], Dn = ["id", "aria-label", "aria-selected", "aria-disabled", "aria-setsize", "aria-posinset", "onMousedown", "onMousemove", "data-p-selected", "data-p-focused", "data-p-disabled"];
function Hn(t, e, n, s, o, i) {
  var a = G("SpinnerIcon"), u = G("InputText"), d = G("SearchIcon"), c = G("InputIcon"), l = G("IconField"), p = G("CheckIcon"), O = G("BlankIcon"), F = G("VirtualScroller"), w = G("Portal"), C = pt("ripple");
  return m(), y("div", h({
    ref: "container",
    id: t.$id,
    class: t.cx("root"),
    onClick: e[12] || (e[12] = function() {
      return i.onContainerClick && i.onContainerClick.apply(i, arguments);
    }),
    "data-p": i.containerDataP
  }, t.ptmi("root")), [t.editable ? (m(), y("input", h({
    key: 0,
    ref: "focusInput",
    name: t.name,
    id: t.labelId || t.inputId,
    type: "text",
    class: [t.cx("label"), t.inputClass, t.labelClass],
    style: [t.inputStyle, t.labelStyle],
    value: i.editableInputValue,
    placeholder: t.placeholder,
    tabindex: t.disabled ? -1 : t.tabindex,
    disabled: t.disabled,
    autocomplete: "off",
    role: "combobox",
    "aria-label": t.ariaLabel,
    "aria-labelledby": t.ariaLabelledby,
    "aria-haspopup": "listbox",
    "aria-expanded": o.overlayVisible,
    "aria-controls": o.overlayVisible ? t.$id + "_list" : void 0,
    "aria-activedescendant": o.focused ? i.focusedOptionId : void 0,
    "aria-invalid": t.invalid || void 0,
    onFocus: e[0] || (e[0] = function() {
      return i.onFocus && i.onFocus.apply(i, arguments);
    }),
    onBlur: e[1] || (e[1] = function() {
      return i.onBlur && i.onBlur.apply(i, arguments);
    }),
    onKeydown: e[2] || (e[2] = function() {
      return i.onKeyDown && i.onKeyDown.apply(i, arguments);
    }),
    onInput: e[3] || (e[3] = function() {
      return i.onEditableInput && i.onEditableInput.apply(i, arguments);
    }),
    "data-p": i.labelDataP
  }, t.ptm("label")), null, 16, Mn)) : (m(), y("span", h({
    key: 1,
    ref: "focusInput",
    name: t.name,
    id: t.labelId || t.inputId,
    class: [t.cx("label"), t.inputClass, t.labelClass],
    style: [t.inputStyle, t.labelStyle],
    tabindex: t.disabled ? -1 : t.tabindex,
    role: "combobox",
    "aria-label": t.ariaLabel || (i.label === "p-emptylabel" ? void 0 : i.label),
    "aria-labelledby": t.ariaLabelledby,
    "aria-haspopup": "listbox",
    "aria-expanded": o.overlayVisible,
    "aria-controls": t.$id + "_list",
    "aria-activedescendant": o.focused ? i.focusedOptionId : void 0,
    "aria-invalid": t.invalid || void 0,
    "aria-disabled": t.disabled,
    onFocus: e[4] || (e[4] = function() {
      return i.onFocus && i.onFocus.apply(i, arguments);
    }),
    onBlur: e[5] || (e[5] = function() {
      return i.onBlur && i.onBlur.apply(i, arguments);
    }),
    onKeydown: e[6] || (e[6] = function() {
      return i.onKeyDown && i.onKeyDown.apply(i, arguments);
    }),
    "data-p": i.labelDataP
  }, t.ptm("label")), [z(t.$slots, "value", {
    value: t.d_value,
    placeholder: t.placeholder
  }, function() {
    var g;
    return [re(E(i.label === "p-emptylabel" ? " " : (g = i.label) !== null && g !== void 0 ? g : "empty"), 1)];
  })], 16, Pn)), i.isClearIconVisible ? z(t.$slots, "clearicon", {
    key: 2,
    class: Q(t.cx("clearIcon")),
    clearCallback: i.onClearClick
  }, function() {
    return [(m(), ne(ke(t.clearIcon ? "i" : "TimesIcon"), h({
      ref: "clearIcon",
      class: [t.cx("clearIcon"), t.clearIcon],
      onClick: i.onClearClick
    }, t.ptm("clearIcon"), {
      "data-pc-section": "clearicon"
    }), null, 16, ["class", "onClick"]))];
  }) : j("", !0), b("div", h({
    class: t.cx("dropdown")
  }, t.ptm("dropdown")), [t.loading ? z(t.$slots, "loadingicon", {
    key: 0,
    class: Q(t.cx("loadingIcon"))
  }, function() {
    return [t.loadingIcon ? (m(), y("span", h({
      key: 0,
      class: [t.cx("loadingIcon"), "pi-spin", t.loadingIcon],
      "aria-hidden": "true"
    }, t.ptm("loadingIcon")), null, 16)) : (m(), ne(a, h({
      key: 1,
      class: t.cx("loadingIcon"),
      spin: "",
      "aria-hidden": "true"
    }, t.ptm("loadingIcon")), null, 16, ["class"]))];
  }) : z(t.$slots, "dropdownicon", {
    key: 1,
    class: Q(t.cx("dropdownIcon"))
  }, function() {
    return [(m(), ne(ke(t.dropdownIcon ? "span" : "ChevronDownIcon"), h({
      class: [t.cx("dropdownIcon"), t.dropdownIcon],
      "aria-hidden": "true",
      "data-p": i.dropdownIconDataP
    }, t.ptm("dropdownIcon")), null, 16, ["class", "data-p"]))];
  })], 16), H(w, {
    appendTo: t.appendTo
  }, {
    default: N(function() {
      return [H(ht, h({
        name: "p-anchored-overlay",
        onEnter: i.onOverlayEnter,
        onAfterEnter: i.onOverlayAfterEnter,
        onLeave: i.onOverlayLeave,
        onAfterLeave: i.onOverlayAfterLeave
      }, t.ptm("transition")), {
        default: N(function() {
          return [o.overlayVisible ? (m(), y("div", h({
            key: 0,
            ref: i.overlayRef,
            class: [t.cx("overlay"), t.panelClass, t.overlayClass],
            style: [t.panelStyle, t.overlayStyle],
            onClick: e[10] || (e[10] = function() {
              return i.onOverlayClick && i.onOverlayClick.apply(i, arguments);
            }),
            onKeydown: e[11] || (e[11] = function() {
              return i.onOverlayKeyDown && i.onOverlayKeyDown.apply(i, arguments);
            }),
            "data-p": i.overlayDataP
          }, t.ptm("overlay")), [b("span", h({
            ref: "firstHiddenFocusableElementOnOverlay",
            role: "presentation",
            "aria-hidden": "true",
            class: "p-hidden-accessible p-hidden-focusable",
            tabindex: 0,
            onFocus: e[7] || (e[7] = function() {
              return i.onFirstHiddenFocus && i.onFirstHiddenFocus.apply(i, arguments);
            })
          }, t.ptm("hiddenFirstFocusableEl"), {
            "data-p-hidden-accessible": !0,
            "data-p-hidden-focusable": !0
          }), null, 16), z(t.$slots, "header", {
            value: t.d_value,
            options: i.visibleOptions
          }), t.filter ? (m(), y("div", h({
            key: 0,
            class: t.cx("header")
          }, t.ptm("header")), [H(l, {
            unstyled: t.unstyled,
            pt: t.ptm("pcFilterContainer")
          }, {
            default: N(function() {
              return [H(u, {
                ref: "filterInput",
                type: "text",
                value: o.filterValue,
                onVnodeMounted: i.onFilterUpdated,
                onVnodeUpdated: i.onFilterUpdated,
                class: Q(t.cx("pcFilter")),
                placeholder: t.filterPlaceholder,
                variant: t.variant,
                unstyled: t.unstyled,
                role: "searchbox",
                autocomplete: "off",
                "aria-owns": t.$id + "_list",
                "aria-activedescendant": i.focusedOptionId,
                onKeydown: i.onFilterKeyDown,
                onBlur: i.onFilterBlur,
                onInput: i.onFilterChange,
                pt: t.ptm("pcFilter"),
                formControl: {
                  novalidate: !0
                }
              }, null, 8, ["value", "onVnodeMounted", "onVnodeUpdated", "class", "placeholder", "variant", "unstyled", "aria-owns", "aria-activedescendant", "onKeydown", "onBlur", "onInput", "pt"]), H(c, {
                unstyled: t.unstyled,
                pt: t.ptm("pcFilterIconContainer")
              }, {
                default: N(function() {
                  return [z(t.$slots, "filtericon", {}, function() {
                    return [t.filterIcon ? (m(), y("span", h({
                      key: 0,
                      class: t.filterIcon
                    }, t.ptm("filterIcon")), null, 16)) : (m(), ne(d, ft(h({
                      key: 1
                    }, t.ptm("filterIcon"))), null, 16))];
                  })];
                }),
                _: 3
              }, 8, ["unstyled", "pt"])];
            }),
            _: 3
          }, 8, ["unstyled", "pt"]), b("span", h({
            role: "status",
            "aria-live": "polite",
            class: "p-hidden-accessible"
          }, t.ptm("hiddenFilterResult"), {
            "data-p-hidden-accessible": !0
          }), E(i.filterResultMessageText), 17)], 16)) : j("", !0), b("div", h({
            class: t.cx("listContainer"),
            style: {
              "max-height": i.virtualScrollerDisabled ? t.scrollHeight : ""
            }
          }, t.ptm("listContainer")), [H(F, h({
            ref: i.virtualScrollerRef
          }, t.virtualScrollerOptions, {
            items: i.visibleOptions,
            style: {
              height: t.scrollHeight
            },
            tabindex: -1,
            disabled: i.virtualScrollerDisabled,
            pt: t.ptm("virtualScroller")
          }), mt({
            content: N(function(g) {
              var k = g.styleClass, T = g.contentRef, A = g.items, v = g.getItemOptions, $ = g.contentStyle, x = g.itemSize;
              return [b("ul", h({
                ref: function(S) {
                  return i.listRef(S, T);
                },
                id: t.$id + "_list",
                class: [t.cx("list"), k],
                style: $,
                role: "listbox"
              }, t.ptm("list")), [(m(!0), y(ie, null, ye(A, function(I, S) {
                return m(), y(ie, {
                  key: i.getOptionRenderKey(I, i.getOptionIndex(S, v))
                }, [i.isOptionGroup(I) ? (m(), y("li", h({
                  key: 0,
                  id: t.$id + "_" + i.getOptionIndex(S, v),
                  style: {
                    height: x ? x + "px" : void 0
                  },
                  class: t.cx("optionGroup"),
                  role: "option"
                }, {
                  ref_for: !0
                }, t.ptm("optionGroup")), [z(t.$slots, "optiongroup", {
                  option: I.optionGroup,
                  index: i.getOptionIndex(S, v)
                }, function() {
                  return [b("span", h({
                    class: t.cx("optionGroupLabel")
                  }, {
                    ref_for: !0
                  }, t.ptm("optionGroupLabel")), E(i.getOptionGroupLabel(I.optionGroup)), 17)];
                })], 16, Kn)) : Me((m(), y("li", h({
                  key: 1,
                  id: t.$id + "_" + i.getOptionIndex(S, v),
                  class: t.cx("option", {
                    option: I,
                    focusedOption: i.getOptionIndex(S, v)
                  }),
                  style: {
                    height: x ? x + "px" : void 0
                  },
                  role: "option",
                  "aria-label": i.getOptionLabel(I),
                  "aria-selected": i.isSelected(I),
                  "aria-disabled": i.isOptionDisabled(I),
                  "aria-setsize": i.ariaSetSize,
                  "aria-posinset": i.getAriaPosInset(i.getOptionIndex(S, v)),
                  onMousedown: function(K) {
                    return i.onOptionSelect(K, I);
                  },
                  onMousemove: function(K) {
                    return i.onOptionMouseMove(K, i.getOptionIndex(S, v));
                  },
                  onClick: e[8] || (e[8] = vt(function() {
                  }, ["stop"])),
                  "data-p-selected": !t.checkmark && i.isSelected(I),
                  "data-p-focused": o.focusedOptionIndex === i.getOptionIndex(S, v),
                  "data-p-disabled": i.isOptionDisabled(I)
                }, {
                  ref_for: !0
                }, i.getPTItemOptions(I, v, S, "option")), [t.checkmark ? (m(), y(ie, {
                  key: 0
                }, [i.isSelected(I) ? (m(), ne(p, h({
                  key: 0,
                  class: t.cx("optionCheckIcon")
                }, {
                  ref_for: !0
                }, t.ptm("optionCheckIcon")), null, 16, ["class"])) : (m(), ne(O, h({
                  key: 1,
                  class: t.cx("optionBlankIcon")
                }, {
                  ref_for: !0
                }, t.ptm("optionBlankIcon")), null, 16, ["class"]))], 64)) : j("", !0), z(t.$slots, "option", {
                  option: I,
                  selected: i.isSelected(I),
                  index: i.getOptionIndex(S, v)
                }, function() {
                  return [b("span", h({
                    class: t.cx("optionLabel")
                  }, {
                    ref_for: !0
                  }, t.ptm("optionLabel")), E(i.getOptionLabel(I)), 17)];
                })], 16, Dn)), [[C]])], 64);
              }), 128)), o.filterValue && (!A || A && A.length === 0) ? (m(), y("li", h({
                key: 0,
                class: t.cx("emptyMessage"),
                role: "option"
              }, t.ptm("emptyMessage"), {
                "data-p-hidden-accessible": !0
              }), [z(t.$slots, "emptyfilter", {}, function() {
                return [re(E(i.emptyFilterMessageText), 1)];
              })], 16)) : !t.options || t.options && t.options.length === 0 ? (m(), y("li", h({
                key: 1,
                class: t.cx("emptyMessage"),
                role: "option"
              }, t.ptm("emptyMessage"), {
                "data-p-hidden-accessible": !0
              }), [z(t.$slots, "empty", {}, function() {
                return [re(E(i.emptyMessageText), 1)];
              })], 16)) : j("", !0)], 16, Bn)];
            }),
            _: 2
          }, [t.$slots.loader ? {
            name: "loader",
            fn: N(function(g) {
              var k = g.options;
              return [z(t.$slots, "loader", {
                options: k
              })];
            }),
            key: "0"
          } : void 0]), 1040, ["items", "style", "disabled", "pt"])], 16), z(t.$slots, "footer", {
            value: t.d_value,
            options: i.visibleOptions
          }), !t.options || t.options && t.options.length === 0 ? (m(), y("span", h({
            key: 1,
            role: "status",
            "aria-live": "polite",
            class: "p-hidden-accessible"
          }, t.ptm("hiddenEmptyMessage"), {
            "data-p-hidden-accessible": !0
          }), E(i.emptyMessageText), 17)) : j("", !0), b("span", h({
            role: "status",
            "aria-live": "polite",
            class: "p-hidden-accessible"
          }, t.ptm("hiddenSelectedMessage"), {
            "data-p-hidden-accessible": !0
          }), E(i.selectedMessageText), 17), b("span", h({
            ref: "lastHiddenFocusableElementOnOverlay",
            role: "presentation",
            "aria-hidden": "true",
            class: "p-hidden-accessible p-hidden-focusable",
            tabindex: 0,
            onFocus: e[9] || (e[9] = function() {
              return i.onLastHiddenFocus && i.onLastHiddenFocus.apply(i, arguments);
            })
          }, t.ptm("hiddenLastFocusableEl"), {
            "data-p-hidden-accessible": !0,
            "data-p-hidden-focusable": !0
          }), null, 16)], 16, En)) : j("", !0)];
        }),
        _: 3
      }, 16, ["onEnter", "onAfterEnter", "onLeave", "onAfterLeave"])];
    }),
    _: 3
  }, 8, ["appendTo"])], 16, xn);
}
Ge.render = Hn;
const $n = {
  class: "kx-artifact-panel",
  "aria-label": "Artifact preview"
}, Rn = { class: "kx-artifact-panel-head" }, jn = { class: "kx-artifact-panel-title" }, Gn = { class: "kx-artifact-select-option" }, Un = { class: "kx-artifact-select-option-title" }, Nn = { class: "kx-artifact-select-option-sub" }, Wn = { class: "kx-artifact-panel-actions" }, qn = ["disabled"], Zn = ["disabled"], Yn = {
  key: 0,
  class: "kx-artifact-panel-error",
  role: "alert"
}, Jn = ["disabled"], Qn = {
  class: "sr-only",
  "aria-live": "polite"
}, Xn = {
  key: 1,
  class: "kx-artifact-panel-body"
}, _n = ["id"], ei = {
  key: 2,
  class: "kx-artifact-panel-empty"
}, ti = /* @__PURE__ */ yt({
  __name: "ArtifactPanel",
  setup(t) {
    const e = xt(), n = rt(), s = at(), o = q([]), i = q(""), a = At(s, ({ path: r }) => x(ze(r))), u = q(ze(a.initialPath)), d = q(!!u.value), c = q(""), l = q(""), p = q(!1), O = [], F = /* @__PURE__ */ new Set();
    let w = null, C = 0, g = 0, k = "";
    const T = gt(() => o.value.find((r) => Y(r) === i.value));
    async function A() {
      const r = u.value, f = ++C;
      if (!r) {
        o.value = [], i.value = "", d.value = !1, l.value = "";
        return;
      }
      d.value = !0, l.value = "";
      try {
        const V = await e.artifacts({ sessionId: r, limit: 100 });
        if (f !== C || r !== u.value) return;
        const M = T.value, P = V.artifacts.filter((ee) => !ee.session_id || ee.session_id === r), _ = M?.session_id === r && !P.some((ee) => Y(ee) === i.value) ? [M, ...P] : P;
        o.value = _, !_.some((ee) => Y(ee) === i.value) && !k && (i.value = _[0] ? Y(_[0]) : "");
      } catch (V) {
        if (f !== C || r !== u.value) return;
        i.value || (l.value = V.message || "Could not load artifacts");
      } finally {
        f === C && (d.value = !1);
      }
    }
    function v() {
      u.value && (w && clearTimeout(w), w = setTimeout(() => {
        A();
      }, 150));
    }
    async function $(r) {
      if (!r) return;
      const f = u.value;
      if (!f) return;
      if (p.value = !1, l.value = "", o.value.some((P) => Y(P) === r)) {
        g++, k = "", i.value = r;
        return;
      }
      if (F.has(r)) return;
      const V = ++g;
      k = r;
      const M = i.value;
      i.value = "", F.add(r);
      try {
        const P = await e.artifact(r);
        if (V !== g || f !== u.value) {
          i.value || (i.value = M);
          return;
        }
        if (P.session_id && P.session_id !== f) {
          i.value = M;
          return;
        }
        o.value = [P, ...o.value.filter((_) => Y(_) !== r)], i.value = r;
      } catch (P) {
        V === g && (i.value || (i.value = M), l.value = P.message || "Could not load artifact details");
      } finally {
        F.delete(r), k === r && (k = "");
      }
    }
    function x(r) {
      r !== u.value && (u.value = r, C++, g++, w && (clearTimeout(w), w = null), o.value = [], i.value = "", k = "", p.value = !1, l.value = "", d.value = !!r, r && v());
    }
    function I(r) {
      if (r.channel === "kickside:artifact-session") {
        if (!Lt(r.sourcePanelId, zt(s), a.hostPath())) return;
        x(Tt(r.payload));
        return;
      }
      if (r.channel !== "kickside:artifact-open") return;
      const f = Ft(r.payload);
      f && ($(f), v());
    }
    function S(r) {
      if (!r) return "Generation time unavailable";
      const f = new Date(r);
      return Number.isNaN(f.getTime()) ? "Generation time unavailable" : `Generated ${new Intl.DateTimeFormat(void 0, { dateStyle: "medium", timeStyle: "short" }).format(f)}`;
    }
    function R(r) {
      const f = String(r || "").toLowerCase();
      return f.includes("markdown") ? "md" : f.includes("html") ? "html" : f.includes("json") ? "json" : f.includes("javascript") ? "js" : f.includes("css") ? "css" : "txt";
    }
    function K(r) {
      return `${String(r || "artifact").trim().replace(/[<>:"/\\|?*\u0000-\u001f]+/g, "-").replace(/[. ]+$/g, "") || "artifact"}.${R(T.value?.content_type)}`;
    }
    async function L() {
      if (!i.value) throw new Error("Select an artifact first");
      return e.artifactContent(i.value);
    }
    async function B() {
      c.value = "copy", l.value = "";
      try {
        await navigator.clipboard.writeText(await L()), p.value = !0, window.setTimeout(() => {
          p.value = !1;
        }, 1600);
      } catch (r) {
        l.value = r.message || "Could not copy artifact";
      } finally {
        c.value = "";
      }
    }
    async function W() {
      c.value = "save", l.value = "";
      try {
        const r = await L(), f = new Blob([r], { type: T.value?.content_type || "text/plain;charset=utf-8" }), V = URL.createObjectURL(f), M = document.createElement("a");
        M.href = V, M.download = K(T.value?.title), M.click(), URL.revokeObjectURL(V);
      } catch (r) {
        l.value = r.message || "Could not save artifact";
      } finally {
        c.value = "";
      }
    }
    function X() {
      n?.broadcast("kickside:artifact-close", { panelId: Vt });
    }
    const D = ut(v);
    return bt(() => {
      const r = n?.subscribe(I);
      r && O.push(r), O.push(Le("artifact:*", v)), O.push(Le("session:*", v));
    }), It(() => {
      O.forEach((r) => r()), C++, g++, w && clearTimeout(w);
    }), (r, f) => Me((m(), y("section", $n, [
      b("header", Rn, [
        b("div", jn, [
          f[2] || (f[2] = b("label", {
            class: "sr-only",
            for: "artifact-panel-selector"
          }, "Artifact", -1)),
          H(Z(Ge), {
            "input-id": "artifact-panel-selector",
            modelValue: i.value,
            "onUpdate:modelValue": [
              f[0] || (f[0] = (V) => i.value = V),
              f[1] || (f[1] = (V) => $(V))
            ],
            class: "kx-artifact-panel-select",
            "overlay-class": "kx-artifact-panel-select-overlay",
            options: o.value,
            "option-label": "title",
            "option-value": Z(Y),
            placeholder: d.value ? "Loading artifacts…" : "Select an artifact",
            disabled: d.value
          }, {
            value: N(() => [
              b("span", {
                class: Q(["kx-artifact-select-value", { "is-placeholder": !T.value }])
              }, E(T.value?.title || (d.value ? "Loading artifacts…" : "Select an artifact")), 3)
            ]),
            option: N(({ option: V }) => [
              b("span", Gn, [
                b("span", Un, E(V.title || "Untitled artifact"), 1),
                b("span", Nn, E(S(V.created_at)), 1)
              ])
            ]),
            _: 1
          }, 8, ["modelValue", "options", "option-value", "placeholder", "disabled"])
        ]),
        b("div", Wn, [
          b("button", {
            type: "button",
            class: "kx-panel-action",
            disabled: !i.value || !!c.value,
            onClick: B
          }, [
            H(Z(pe), {
              icon: c.value === "copy" ? "tabler:loader-2" : p.value ? "tabler:check" : "tabler:copy",
              class: Q({ spin: c.value === "copy" }),
              "aria-hidden": "true"
            }, null, 8, ["icon", "class"]),
            re(" " + E(p.value ? "Copied" : "Copy"), 1)
          ], 8, qn),
          b("button", {
            type: "button",
            class: "kx-panel-action",
            disabled: !i.value || !!c.value,
            onClick: W
          }, [
            H(Z(pe), {
              icon: c.value === "save" ? "tabler:loader-2" : "tabler:download",
              class: Q({ spin: c.value === "save" }),
              "aria-hidden": "true"
            }, null, 8, ["icon", "class"]),
            f[3] || (f[3] = re(" Save ", -1))
          ], 8, Zn),
          b("button", {
            type: "button",
            class: "kx-panel-close",
            "aria-label": "Close artifact panel",
            onClick: X
          }, [
            H(Z(pe), {
              icon: "tabler:x",
              "aria-hidden": "true"
            })
          ])
        ])
      ]),
      l.value ? (m(), y("div", Yn, [
        b("span", null, E(l.value), 1),
        i.value ? j("", !0) : (m(), y("button", {
          key: 0,
          type: "button",
          class: "kx-artifact-panel-retry",
          disabled: d.value,
          onClick: A
        }, "Retry", 8, Jn))
      ])) : j("", !0),
      b("span", Qn, E(p.value ? "Artifact copied to clipboard" : ""), 1),
      i.value ? (m(), y("div", Xn, [
        b("w-artifact", { id: i.value }, null, 8, _n)
      ])) : (m(), y("div", ei, [
        H(Z(pe), {
          icon: "tabler:file-description",
          "aria-hidden": "true"
        }),
        f[4] || (f[4] = b("span", null, "Select an artifact to preview it.", -1))
      ]))
    ], 512)), [
      [Ot, Z(D) !== !1]
    ]);
  }
});
class Ue extends ct {
  static get wippyConfig() {
    return {
      propsSchema: { type: "object", properties: {} },
      hostCssKeys: ["themeConfigUrl", "primeVueCssUrl"],
      inlineCss: Mt
    };
  }
  static get vueConfig() {
    return { rootComponent: ti, plugins: [dt] };
  }
}
async function fi() {
  return Ue;
}
wt(import.meta.url, Ue);
export {
  fi as webComponent
};
//# sourceMappingURL=artifact_panel.js.map

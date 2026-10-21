import { s as le, B as ee, a as N, f as Fe, b as rt, c as Pt, d as nn, p as rn, M as lt, l as pt, e as We, g as at, R as pe, _ as an, L as on, h as ye, v as ge, i as sn, U as ln, I as ut, j as pn, r as Ct, k as un, m as cn, n as j, x as Ve, W as dn, u as fn, o as mn, P as gn } from "./index-CghzfYQS.js";
import { openBlock as l, createElementBlock as c, mergeProps as f, createElementVNode as b, createBlock as k, resolveDynamicComponent as _, createCommentVNode as C, renderSlot as D, toDisplayString as T, resolveComponent as F, createVNode as w, normalizeStyle as hn, normalizeClass as I, toHandlers as Oe, resolveDirective as re, withDirectives as te, createSlots as $t, withCtx as L, Fragment as J, renderList as ke, createTextVNode as Y, normalizeProps as bn, Transition as St, defineComponent as It, unref as s, vShow as vn, ref as R, computed as G, watch as _e, onMounted as yn, onBeforeUnmount as wn, withModifiers as ct, withKeys as dt, isRef as xn } from "vue";
import { Icon as E } from "@iconify/vue";
import { on as kn, api as xe, loadByTagName as Pn, host as Cn, define as $n } from "@wippy-fe/proxy";
var Lt = {
  name: "AngleRightIcon",
  extends: le
};
function Sn(e) {
  return Tn(e) || An(e) || Ln(e) || In();
}
function In() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Ln(e, t) {
  if (e) {
    if (typeof e == "string") return Ge(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Ge(e, t) : void 0;
  }
}
function An(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function Tn(e) {
  if (Array.isArray(e)) return Ge(e);
}
function Ge(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, a = Array(t); n < t; n++) a[n] = e[n];
  return a;
}
function Dn(e, t, n, a, o, r) {
  return l(), c("svg", f({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), Sn(t[0] || (t[0] = [b("path", {
    d: "M5.25 11.1728C5.14929 11.1694 5.05033 11.1455 4.9592 11.1025C4.86806 11.0595 4.78666 10.9984 4.72 10.9228C4.57955 10.7822 4.50066 10.5916 4.50066 10.3928C4.50066 10.1941 4.57955 10.0035 4.72 9.86283L7.72 6.86283L4.72 3.86283C4.66067 3.71882 4.64765 3.55991 4.68275 3.40816C4.71785 3.25642 4.79932 3.11936 4.91585 3.01602C5.03238 2.91268 5.17819 2.84819 5.33305 2.83149C5.4879 2.81479 5.64411 2.84671 5.78 2.92283L9.28 6.42283C9.42045 6.56346 9.49934 6.75408 9.49934 6.95283C9.49934 7.15158 9.42045 7.34221 9.28 7.48283L5.78 10.9228C5.71333 10.9984 5.63193 11.0595 5.5408 11.1025C5.44966 11.1455 5.35071 11.1694 5.25 11.1728Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
Lt.render = Dn;
var Bn = `
    .p-tag {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        background: dt('tag.primary.background');
        color: dt('tag.primary.color');
        font-size: dt('tag.font.size');
        font-weight: dt('tag.font.weight');
        padding: dt('tag.padding');
        border-radius: dt('tag.border.radius');
        gap: dt('tag.gap');
    }

    .p-tag-icon {
        font-size: dt('tag.icon.size');
        width: dt('tag.icon.size');
        height: dt('tag.icon.size');
    }

    .p-tag-rounded {
        border-radius: dt('tag.rounded.border.radius');
    }

    .p-tag-success {
        background: dt('tag.success.background');
        color: dt('tag.success.color');
    }

    .p-tag-info {
        background: dt('tag.info.background');
        color: dt('tag.info.color');
    }

    .p-tag-warn {
        background: dt('tag.warn.background');
        color: dt('tag.warn.color');
    }

    .p-tag-danger {
        background: dt('tag.danger.background');
        color: dt('tag.danger.color');
    }

    .p-tag-secondary {
        background: dt('tag.secondary.background');
        color: dt('tag.secondary.color');
    }

    .p-tag-contrast {
        background: dt('tag.contrast.background');
        color: dt('tag.contrast.color');
    }
`, En = {
  root: function(t) {
    var n = t.props;
    return ["p-tag p-component", {
      "p-tag-info": n.severity === "info",
      "p-tag-success": n.severity === "success",
      "p-tag-warn": n.severity === "warn",
      "p-tag-danger": n.severity === "danger",
      "p-tag-secondary": n.severity === "secondary",
      "p-tag-contrast": n.severity === "contrast",
      "p-tag-rounded": n.rounded
    }];
  },
  icon: "p-tag-icon",
  label: "p-tag-label"
}, zn = ee.extend({
  name: "tag",
  style: Bn,
  classes: En
}), On = {
  name: "BaseTag",
  extends: N,
  props: {
    value: null,
    severity: null,
    rounded: Boolean,
    icon: String
  },
  style: zn,
  provide: function() {
    return {
      $pcTag: this,
      $parentInstance: this
    };
  }
};
function Pe(e) {
  "@babel/helpers - typeof";
  return Pe = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, Pe(e);
}
function Rn(e, t, n) {
  return (t = Fn(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Fn(e) {
  var t = Mn(e, "string");
  return Pe(t) == "symbol" ? t : t + "";
}
function Mn(e, t) {
  if (Pe(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var a = n.call(e, t);
    if (Pe(a) != "object") return a;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var At = {
  name: "Tag",
  extends: On,
  inheritAttrs: !1,
  computed: {
    dataP: function() {
      return Fe(Rn({
        rounded: this.rounded
      }, this.severity, this.severity));
    }
  }
}, jn = ["data-p"];
function Nn(e, t, n, a, o, r) {
  return l(), c("span", f({
    class: e.cx("root"),
    "data-p": r.dataP
  }, e.ptmi("root")), [e.$slots.icon ? (l(), k(_(e.$slots.icon), f({
    key: 0,
    class: e.cx("icon")
  }, e.ptm("icon")), null, 16, ["class"])) : e.icon ? (l(), c("span", f({
    key: 1,
    class: [e.cx("icon"), e.icon]
  }, e.ptm("icon")), null, 16)) : C("", !0), e.value != null || e.$slots.default ? D(e.$slots, "default", {
    key: 2
  }, function() {
    return [b("span", f({
      class: e.cx("label")
    }, e.ptm("label")), T(e.value), 17)];
  }) : C("", !0)], 16, jn);
}
At.render = Nn;
var Un = `
    .p-inputgroup,
    .p-inputgroup .p-iconfield,
    .p-inputgroup .p-floatlabel,
    .p-inputgroup .p-iftalabel {
        display: flex;
        align-items: stretch;
        width: 100%;
    }

    .p-inputgroup .p-floatlabel .p-inputwrapper,
    .p-inputgroup .p-iftalabel .p-inputwrapper {
        display: inline-flex;
    }

    .p-inputgroup .p-inputtext,
    .p-inputgroup .p-inputwrapper {
        flex: 1 1 auto;
        width: 1%;
    }

    .p-inputgroupaddon {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: dt('inputgroup.addon.padding');
        background: dt('inputgroup.addon.background');
        color: dt('inputgroup.addon.color');
        border-block-start: 1px solid dt('inputgroup.addon.border.color');
        border-block-end: 1px solid dt('inputgroup.addon.border.color');
        min-width: dt('inputgroup.addon.min.width');
    }

    .p-inputgroupaddon:first-child,
    .p-inputgroupaddon + .p-inputgroupaddon {
        border-inline-start: 1px solid dt('inputgroup.addon.border.color');
    }

    .p-inputgroupaddon:last-child {
        border-inline-end: 1px solid dt('inputgroup.addon.border.color');
    }

    .p-inputgroupaddon:has(.p-button) {
        padding: 0;
        overflow: hidden;
    }

    .p-inputgroupaddon .p-button {
        border-radius: 0;
    }

    .p-inputgroup > .p-component,
    .p-inputgroup > .p-inputwrapper > .p-component,
    .p-inputgroup > .p-iconfield > .p-component,
    .p-inputgroup > .p-floatlabel > .p-component,
    .p-inputgroup > .p-floatlabel > .p-inputwrapper > .p-component,
    .p-inputgroup > .p-iftalabel > .p-component,
    .p-inputgroup > .p-iftalabel > .p-inputwrapper > .p-component {
        border-radius: 0;
        margin: 0;
    }

    .p-inputgroupaddon:first-child,
    .p-inputgroup > .p-component:first-child,
    .p-inputgroup > .p-inputwrapper:first-child > .p-component,
    .p-inputgroup > .p-iconfield:first-child > .p-component,
    .p-inputgroup > .p-floatlabel:first-child > .p-component,
    .p-inputgroup > .p-floatlabel:first-child > .p-inputwrapper > .p-component,
    .p-inputgroup > .p-iftalabel:first-child > .p-component,
    .p-inputgroup > .p-iftalabel:first-child > .p-inputwrapper > .p-component {
        border-start-start-radius: dt('inputgroup.addon.border.radius');
        border-end-start-radius: dt('inputgroup.addon.border.radius');
    }

    .p-inputgroupaddon:last-child,
    .p-inputgroup > .p-component:last-child,
    .p-inputgroup > .p-inputwrapper:last-child > .p-component,
    .p-inputgroup > .p-iconfield:last-child > .p-component,
    .p-inputgroup > .p-floatlabel:last-child > .p-component,
    .p-inputgroup > .p-floatlabel:last-child > .p-inputwrapper > .p-component,
    .p-inputgroup > .p-iftalabel:last-child > .p-component,
    .p-inputgroup > .p-iftalabel:last-child > .p-inputwrapper > .p-component {
        border-start-end-radius: dt('inputgroup.addon.border.radius');
        border-end-end-radius: dt('inputgroup.addon.border.radius');
    }

    .p-inputgroup .p-component:focus,
    .p-inputgroup .p-component.p-focus,
    .p-inputgroup .p-inputwrapper-focus,
    .p-inputgroup .p-component:focus ~ label,
    .p-inputgroup .p-component.p-focus ~ label,
    .p-inputgroup .p-inputwrapper-focus ~ label,
    .p-inputgroup .p-floatlabel .p-inputwrapper ~ label,
    .p-inputgroup .p-iftalabel .p-inputwrapper ~ label {
        z-index: 1;
    }

    .p-inputgroup > .p-button:not(.p-button-icon-only) {
        width: auto;
    }

    .p-inputgroup .p-iconfield + .p-iconfield .p-inputtext {
        border-inline-start: 0;
    }
`, Vn = {
  root: "p-inputgroup"
}, _n = ee.extend({
  name: "inputgroup",
  style: Un,
  classes: Vn
}), Kn = {
  name: "BaseInputGroup",
  extends: N,
  style: _n,
  provide: function() {
    return {
      $pcInputGroup: this,
      $parentInstance: this
    };
  }
}, Tt = {
  name: "InputGroup",
  extends: Kn,
  inheritAttrs: !1
};
function Wn(e, t, n, a, o, r) {
  return l(), c("div", f({
    class: e.cx("root")
  }, e.ptmi("root")), [D(e.$slots, "default")], 16);
}
Tt.render = Wn;
var Gn = {
  root: "p-inputgroupaddon"
}, Jn = ee.extend({
  name: "inputgroupaddon",
  classes: Gn
}), Hn = {
  name: "BaseInputGroupAddon",
  extends: N,
  style: Jn,
  provide: function() {
    return {
      $pcInputGroupAddon: this,
      $parentInstance: this
    };
  }
}, Je = {
  name: "InputGroupAddon",
  extends: Hn,
  inheritAttrs: !1
};
function Zn(e, t, n, a, o, r) {
  return l(), c("div", f({
    class: e.cx("root")
  }, e.ptmi("root")), [D(e.$slots, "default")], 16);
}
Je.render = Zn;
var qn = `
    .p-paginator {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-wrap: wrap;
        background: dt('paginator.background');
        color: dt('paginator.color');
        padding: dt('paginator.padding');
        border-radius: dt('paginator.border.radius');
        gap: dt('paginator.gap');
    }

    .p-paginator-content {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-wrap: wrap;
        gap: dt('paginator.gap');
    }

    .p-paginator-content-start {
        margin-inline-end: auto;
    }

    .p-paginator-content-end {
        margin-inline-start: auto;
    }

    .p-paginator-page,
    .p-paginator-next,
    .p-paginator-last,
    .p-paginator-first,
    .p-paginator-prev {
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        line-height: 1;
        user-select: none;
        overflow: hidden;
        position: relative;
        background: dt('paginator.nav.button.background');
        border: 0 none;
        color: dt('paginator.nav.button.color');
        min-width: dt('paginator.nav.button.width');
        height: dt('paginator.nav.button.height');
        transition:
            background dt('paginator.transition.duration'),
            color dt('paginator.transition.duration'),
            outline-color dt('paginator.transition.duration'),
            box-shadow dt('paginator.transition.duration');
        border-radius: dt('paginator.nav.button.border.radius');
        padding: 0;
        margin: 0;
    }

    .p-paginator-page:focus-visible,
    .p-paginator-next:focus-visible,
    .p-paginator-last:focus-visible,
    .p-paginator-first:focus-visible,
    .p-paginator-prev:focus-visible {
        box-shadow: dt('paginator.nav.button.focus.ring.shadow');
        outline: dt('paginator.nav.button.focus.ring.width') dt('paginator.nav.button.focus.ring.style') dt('paginator.nav.button.focus.ring.color');
        outline-offset: dt('paginator.nav.button.focus.ring.offset');
    }

    .p-paginator-page:not(.p-disabled):not(.p-paginator-page-selected):hover,
    .p-paginator-first:not(.p-disabled):hover,
    .p-paginator-prev:not(.p-disabled):hover,
    .p-paginator-next:not(.p-disabled):hover,
    .p-paginator-last:not(.p-disabled):hover {
        background: dt('paginator.nav.button.hover.background');
        color: dt('paginator.nav.button.hover.color');
    }

    .p-paginator-page.p-paginator-page-selected {
        background: dt('paginator.nav.button.selected.background');
        color: dt('paginator.nav.button.selected.color');
    }

    .p-paginator-current {
        color: dt('paginator.current.page.report.color');
    }

    .p-paginator-pages {
        display: flex;
        align-items: center;
        gap: dt('paginator.gap');
    }

    .p-paginator-jtp-input .p-inputtext {
        max-width: dt('paginator.jump.to.page.input.max.width');
    }

    .p-paginator-first:dir(rtl),
    .p-paginator-prev:dir(rtl),
    .p-paginator-next:dir(rtl),
    .p-paginator-last:dir(rtl) {
        transform: rotate(180deg);
    }
`;
function Ce(e) {
  "@babel/helpers - typeof";
  return Ce = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, Ce(e);
}
function Xn(e, t, n) {
  return (t = Qn(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Qn(e) {
  var t = Yn(e, "string");
  return Ce(t) == "symbol" ? t : t + "";
}
function Yn(e, t) {
  if (Ce(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var a = n.call(e, t);
    if (Ce(a) != "object") return a;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var er = {
  paginator: function(t) {
    var n = t.instance, a = t.key;
    return ["p-paginator p-component", Xn({
      "p-paginator-default": !n.hasBreakpoints()
    }, "p-paginator-".concat(a), n.hasBreakpoints())];
  },
  content: "p-paginator-content",
  contentStart: "p-paginator-content-start",
  contentEnd: "p-paginator-content-end",
  first: function(t) {
    var n = t.instance;
    return ["p-paginator-first", {
      "p-disabled": n.$attrs.disabled
    }];
  },
  firstIcon: "p-paginator-first-icon",
  prev: function(t) {
    var n = t.instance;
    return ["p-paginator-prev", {
      "p-disabled": n.$attrs.disabled
    }];
  },
  prevIcon: "p-paginator-prev-icon",
  next: function(t) {
    var n = t.instance;
    return ["p-paginator-next", {
      "p-disabled": n.$attrs.disabled
    }];
  },
  nextIcon: "p-paginator-next-icon",
  last: function(t) {
    var n = t.instance;
    return ["p-paginator-last", {
      "p-disabled": n.$attrs.disabled
    }];
  },
  lastIcon: "p-paginator-last-icon",
  pages: "p-paginator-pages",
  page: function(t) {
    var n = t.props, a = t.pageLink;
    return ["p-paginator-page", {
      "p-paginator-page-selected": a - 1 === n.page
    }];
  },
  current: "p-paginator-current",
  pcRowPerPageDropdown: "p-paginator-rpp-dropdown",
  pcJumpToPageDropdown: "p-paginator-jtp-dropdown",
  pcJumpToPageInputText: "p-paginator-jtp-input"
}, tr = ee.extend({
  name: "paginator",
  style: qn,
  classes: er
}), Dt = {
  name: "AngleDoubleLeftIcon",
  extends: le
};
function nr(e) {
  return ir(e) || or(e) || ar(e) || rr();
}
function rr() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function ar(e, t) {
  if (e) {
    if (typeof e == "string") return He(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? He(e, t) : void 0;
  }
}
function or(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function ir(e) {
  if (Array.isArray(e)) return He(e);
}
function He(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, a = Array(t); n < t; n++) a[n] = e[n];
  return a;
}
function sr(e, t, n, a, o, r) {
  return l(), c("svg", f({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), nr(t[0] || (t[0] = [b("path", {
    "fill-rule": "evenodd",
    "clip-rule": "evenodd",
    d: "M5.71602 11.164C5.80782 11.2021 5.9063 11.2215 6.00569 11.221C6.20216 11.2301 6.39427 11.1612 6.54025 11.0294C6.68191 10.8875 6.76148 10.6953 6.76148 10.4948C6.76148 10.2943 6.68191 10.1021 6.54025 9.96024L3.51441 6.9344L6.54025 3.90855C6.624 3.76126 6.65587 3.59011 6.63076 3.42254C6.60564 3.25498 6.525 3.10069 6.40175 2.98442C6.2785 2.86815 6.11978 2.79662 5.95104 2.7813C5.78229 2.76598 5.61329 2.80776 5.47112 2.89994L1.97123 6.39983C1.82957 6.54167 1.75 6.73393 1.75 6.9344C1.75 7.13486 1.82957 7.32712 1.97123 7.46896L5.47112 10.9991C5.54096 11.0698 5.62422 11.1259 5.71602 11.164ZM11.0488 10.9689C11.1775 11.1156 11.3585 11.2061 11.5531 11.221C11.7477 11.2061 11.9288 11.1156 12.0574 10.9689C12.1815 10.8302 12.25 10.6506 12.25 10.4645C12.25 10.2785 12.1815 10.0989 12.0574 9.96024L9.03158 6.93439L12.0574 3.90855C12.1248 3.76739 12.1468 3.60881 12.1204 3.45463C12.0939 3.30045 12.0203 3.15826 11.9097 3.04765C11.7991 2.93703 11.6569 2.86343 11.5027 2.83698C11.3486 2.81053 11.19 2.83252 11.0488 2.89994L7.51865 6.36957C7.37699 6.51141 7.29742 6.70367 7.29742 6.90414C7.29742 7.1046 7.37699 7.29686 7.51865 7.4387L11.0488 10.9689Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
Dt.render = sr;
var Bt = {
  name: "AngleDownIcon",
  extends: le
};
function lr(e) {
  return dr(e) || cr(e) || ur(e) || pr();
}
function pr() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function ur(e, t) {
  if (e) {
    if (typeof e == "string") return Ze(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Ze(e, t) : void 0;
  }
}
function cr(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function dr(e) {
  if (Array.isArray(e)) return Ze(e);
}
function Ze(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, a = Array(t); n < t; n++) a[n] = e[n];
  return a;
}
function fr(e, t, n, a, o, r) {
  return l(), c("svg", f({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), lr(t[0] || (t[0] = [b("path", {
    d: "M3.58659 4.5007C3.68513 4.50023 3.78277 4.51945 3.87379 4.55723C3.9648 4.59501 4.04735 4.65058 4.11659 4.7207L7.11659 7.7207L10.1166 4.7207C10.2619 4.65055 10.4259 4.62911 10.5843 4.65956C10.7427 4.69002 10.8871 4.77074 10.996 4.88976C11.1049 5.00877 11.1726 5.15973 11.1889 5.32022C11.2052 5.48072 11.1693 5.6422 11.0866 5.7807L7.58659 9.2807C7.44597 9.42115 7.25534 9.50004 7.05659 9.50004C6.85784 9.50004 6.66722 9.42115 6.52659 9.2807L3.02659 5.7807C2.88614 5.64007 2.80725 5.44945 2.80725 5.2507C2.80725 5.05195 2.88614 4.86132 3.02659 4.7207C3.09932 4.64685 3.18675 4.58911 3.28322 4.55121C3.37969 4.51331 3.48305 4.4961 3.58659 4.5007Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
Bt.render = fr;
var Et = {
  name: "AngleUpIcon",
  extends: le
};
function mr(e) {
  return vr(e) || br(e) || hr(e) || gr();
}
function gr() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function hr(e, t) {
  if (e) {
    if (typeof e == "string") return qe(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? qe(e, t) : void 0;
  }
}
function br(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function vr(e) {
  if (Array.isArray(e)) return qe(e);
}
function qe(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, a = Array(t); n < t; n++) a[n] = e[n];
  return a;
}
function yr(e, t, n, a, o, r) {
  return l(), c("svg", f({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), mr(t[0] || (t[0] = [b("path", {
    d: "M10.4134 9.49931C10.3148 9.49977 10.2172 9.48055 10.1262 9.44278C10.0352 9.405 9.95263 9.34942 9.88338 9.27931L6.88338 6.27931L3.88338 9.27931C3.73811 9.34946 3.57409 9.3709 3.41567 9.34044C3.25724 9.30999 3.11286 9.22926 3.00395 9.11025C2.89504 8.99124 2.82741 8.84028 2.8111 8.67978C2.79478 8.51928 2.83065 8.35781 2.91338 8.21931L6.41338 4.71931C6.55401 4.57886 6.74463 4.49997 6.94338 4.49997C7.14213 4.49997 7.33276 4.57886 7.47338 4.71931L10.9734 8.21931C11.1138 8.35994 11.1927 8.55056 11.1927 8.74931C11.1927 8.94806 11.1138 9.13868 10.9734 9.27931C10.9007 9.35315 10.8132 9.41089 10.7168 9.44879C10.6203 9.48669 10.5169 9.5039 10.4134 9.49931Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
Et.render = yr;
var wr = `
    .p-inputnumber {
        display: inline-flex;
        position: relative;
    }

    .p-inputnumber-button {
        display: flex;
        align-items: center;
        justify-content: center;
        flex: 0 0 auto;
        cursor: pointer;
        background: dt('inputnumber.button.background');
        color: dt('inputnumber.button.color');
        width: dt('inputnumber.button.width');
        transition:
            background dt('inputnumber.transition.duration'),
            color dt('inputnumber.transition.duration'),
            border-color dt('inputnumber.transition.duration'),
            outline-color dt('inputnumber.transition.duration');
    }

    .p-inputnumber-button:disabled {
        cursor: auto;
    }

    .p-inputnumber-button:not(:disabled):hover {
        background: dt('inputnumber.button.hover.background');
        color: dt('inputnumber.button.hover.color');
    }

    .p-inputnumber-button:not(:disabled):active {
        background: dt('inputnumber.button.active.background');
        color: dt('inputnumber.button.active.color');
    }

    .p-inputnumber-stacked .p-inputnumber-button {
        position: relative;
        flex: 1 1 auto;
        border: 0 none;
    }

    .p-inputnumber-stacked .p-inputnumber-button-group {
        display: flex;
        flex-direction: column;
        position: absolute;
        inset-block-start: 1px;
        inset-inline-end: 1px;
        height: calc(100% - 2px);
        z-index: 1;
    }

    .p-inputnumber-stacked .p-inputnumber-increment-button {
        padding: 0;
        border-start-end-radius: calc(dt('inputnumber.button.border.radius') - 1px);
    }

    .p-inputnumber-stacked .p-inputnumber-decrement-button {
        padding: 0;
        border-end-end-radius: calc(dt('inputnumber.button.border.radius') - 1px);
    }

    .p-inputnumber-stacked .p-inputnumber-input {
        padding-inline-end: calc(dt('inputnumber.button.width') + dt('form.field.padding.x'));
    }

    .p-inputnumber-horizontal .p-inputnumber-button {
        border: 1px solid dt('inputnumber.button.border.color');
    }

    .p-inputnumber-horizontal .p-inputnumber-button:hover {
        border-color: dt('inputnumber.button.hover.border.color');
    }

    .p-inputnumber-horizontal .p-inputnumber-button:active {
        border-color: dt('inputnumber.button.active.border.color');
    }

    .p-inputnumber-horizontal .p-inputnumber-increment-button {
        order: 3;
        border-start-end-radius: dt('inputnumber.button.border.radius');
        border-end-end-radius: dt('inputnumber.button.border.radius');
        border-inline-start: 0 none;
    }

    .p-inputnumber-horizontal .p-inputnumber-input {
        order: 2;
        border-radius: 0;
    }

    .p-inputnumber-horizontal .p-inputnumber-decrement-button {
        order: 1;
        border-start-start-radius: dt('inputnumber.button.border.radius');
        border-end-start-radius: dt('inputnumber.button.border.radius');
        border-inline-end: 0 none;
    }

    .p-floatlabel:has(.p-inputnumber-horizontal) label {
        margin-inline-start: dt('inputnumber.button.width');
    }

    .p-inputnumber-vertical {
        flex-direction: column;
    }

    .p-inputnumber-vertical .p-inputnumber-button {
        border: 1px solid dt('inputnumber.button.border.color');
        padding: dt('inputnumber.button.vertical.padding');
    }

    .p-inputnumber-vertical .p-inputnumber-button:hover {
        border-color: dt('inputnumber.button.hover.border.color');
    }

    .p-inputnumber-vertical .p-inputnumber-button:active {
        border-color: dt('inputnumber.button.active.border.color');
    }

    .p-inputnumber-vertical .p-inputnumber-increment-button {
        order: 1;
        border-start-start-radius: dt('inputnumber.button.border.radius');
        border-start-end-radius: dt('inputnumber.button.border.radius');
        width: 100%;
        border-block-end: 0 none;
    }

    .p-inputnumber-vertical .p-inputnumber-input {
        order: 2;
        border-radius: 0;
        text-align: center;
    }

    .p-inputnumber-vertical .p-inputnumber-decrement-button {
        order: 3;
        border-end-start-radius: dt('inputnumber.button.border.radius');
        border-end-end-radius: dt('inputnumber.button.border.radius');
        width: 100%;
        border-block-start: 0 none;
    }

    .p-inputnumber-input {
        flex: 1 1 auto;
    }

    .p-inputnumber-fluid {
        width: 100%;
    }

    .p-inputnumber-fluid .p-inputnumber-input {
        width: 1%;
    }

    .p-inputnumber-fluid.p-inputnumber-vertical .p-inputnumber-input {
        width: 100%;
    }

    .p-inputnumber:has(.p-inputtext-sm) .p-inputnumber-button .p-icon {
        font-size: dt('form.field.sm.font.size');
        width: dt('form.field.sm.font.size');
        height: dt('form.field.sm.font.size');
    }

    .p-inputnumber:has(.p-inputtext-lg) .p-inputnumber-button .p-icon {
        font-size: dt('form.field.lg.font.size');
        width: dt('form.field.lg.font.size');
        height: dt('form.field.lg.font.size');
    }

    .p-inputnumber-clear-icon {
        position: absolute;
        top: 50%;
        margin-top: -0.5rem;
        cursor: pointer;
        inset-inline-end: dt('form.field.padding.x');
        color: dt('form.field.icon.color');
    }

    .p-inputnumber:has(.p-inputnumber-clear-icon) .p-inputnumber-input {
        padding-inline-end: calc((dt('form.field.padding.x') * 2) + dt('icon.size'));
    }

    .p-inputnumber-stacked .p-inputnumber-clear-icon {
        inset-inline-end: calc(dt('inputnumber.button.width') + dt('form.field.padding.x'));
    }

    .p-inputnumber-stacked:has(.p-inputnumber-clear-icon) .p-inputnumber-input {
        padding-inline-end: calc(dt('inputnumber.button.width') + (dt('form.field.padding.x') * 2) + dt('icon.size'));
    }

    .p-inputnumber-horizontal .p-inputnumber-clear-icon {
        inset-inline-end: calc(dt('inputnumber.button.width') + dt('form.field.padding.x'));
    }
`, xr = {
  root: function(t) {
    var n = t.instance, a = t.props;
    return ["p-inputnumber p-component p-inputwrapper", {
      "p-invalid": n.$invalid,
      "p-inputwrapper-filled": n.$filled || a.allowEmpty === !1,
      "p-inputwrapper-focus": n.focused,
      "p-inputnumber-stacked": a.showButtons && a.buttonLayout === "stacked",
      "p-inputnumber-horizontal": a.showButtons && a.buttonLayout === "horizontal",
      "p-inputnumber-vertical": a.showButtons && a.buttonLayout === "vertical",
      "p-inputnumber-fluid": n.$fluid
    }];
  },
  pcInputText: "p-inputnumber-input",
  clearIcon: "p-inputnumber-clear-icon",
  buttonGroup: "p-inputnumber-button-group",
  incrementButton: function(t) {
    var n = t.instance, a = t.props;
    return ["p-inputnumber-button p-inputnumber-increment-button", {
      "p-disabled": a.showButtons && a.max !== null && n.maxBoundry()
    }];
  },
  decrementButton: function(t) {
    var n = t.instance, a = t.props;
    return ["p-inputnumber-button p-inputnumber-decrement-button", {
      "p-disabled": a.showButtons && a.min !== null && n.minBoundry()
    }];
  }
}, kr = ee.extend({
  name: "inputnumber",
  style: wr,
  classes: xr
}), Pr = {
  name: "BaseInputNumber",
  extends: nn,
  props: {
    format: {
      type: Boolean,
      default: !0
    },
    showButtons: {
      type: Boolean,
      default: !1
    },
    buttonLayout: {
      type: String,
      default: "stacked"
    },
    incrementButtonClass: {
      type: String,
      default: null
    },
    decrementButtonClass: {
      type: String,
      default: null
    },
    incrementButtonIcon: {
      type: String,
      default: void 0
    },
    incrementIcon: {
      type: String,
      default: void 0
    },
    decrementButtonIcon: {
      type: String,
      default: void 0
    },
    decrementIcon: {
      type: String,
      default: void 0
    },
    locale: {
      type: String,
      default: void 0
    },
    localeMatcher: {
      type: String,
      default: void 0
    },
    mode: {
      type: String,
      default: "decimal"
    },
    prefix: {
      type: String,
      default: null
    },
    suffix: {
      type: String,
      default: null
    },
    currency: {
      type: String,
      default: void 0
    },
    currencyDisplay: {
      type: String,
      default: void 0
    },
    useGrouping: {
      type: Boolean,
      default: !0
    },
    minFractionDigits: {
      type: Number,
      default: void 0
    },
    maxFractionDigits: {
      type: Number,
      default: void 0
    },
    roundingMode: {
      type: String,
      default: "halfExpand",
      validator: function(t) {
        return ["ceil", "floor", "expand", "trunc", "halfCeil", "halfFloor", "halfExpand", "halfTrunc", "halfEven"].includes(t);
      }
    },
    min: {
      type: Number,
      default: null
    },
    max: {
      type: Number,
      default: null
    },
    step: {
      type: Number,
      default: 1
    },
    allowEmpty: {
      type: Boolean,
      default: !0
    },
    highlightOnFocus: {
      type: Boolean,
      default: !1
    },
    showClear: {
      type: Boolean,
      default: !1
    },
    readonly: {
      type: Boolean,
      default: !1
    },
    placeholder: {
      type: String,
      default: null
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
    ariaLabelledby: {
      type: String,
      default: null
    },
    ariaLabel: {
      type: String,
      default: null
    },
    required: {
      type: Boolean,
      default: !1
    }
  },
  style: kr,
  provide: function() {
    return {
      $pcInputNumber: this,
      $parentInstance: this
    };
  }
};
function $e(e) {
  "@babel/helpers - typeof";
  return $e = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, $e(e);
}
function ft(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var a = Object.getOwnPropertySymbols(e);
    t && (a = a.filter(function(o) {
      return Object.getOwnPropertyDescriptor(e, o).enumerable;
    })), n.push.apply(n, a);
  }
  return n;
}
function mt(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? ft(Object(n), !0).forEach(function(a) {
      Xe(e, a, n[a]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : ft(Object(n)).forEach(function(a) {
      Object.defineProperty(e, a, Object.getOwnPropertyDescriptor(n, a));
    });
  }
  return e;
}
function Xe(e, t, n) {
  return (t = Cr(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Cr(e) {
  var t = $r(e, "string");
  return $e(t) == "symbol" ? t : t + "";
}
function $r(e, t) {
  if ($e(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var a = n.call(e, t);
    if ($e(a) != "object") return a;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
function Sr(e) {
  return Tr(e) || Ar(e) || Lr(e) || Ir();
}
function Ir() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Lr(e, t) {
  if (e) {
    if (typeof e == "string") return Qe(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Qe(e, t) : void 0;
  }
}
function Ar(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function Tr(e) {
  if (Array.isArray(e)) return Qe(e);
}
function Qe(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, a = Array(t); n < t; n++) a[n] = e[n];
  return a;
}
var zt = {
  name: "InputNumber",
  extends: Pr,
  inheritAttrs: !1,
  emits: ["input", "focus", "blur"],
  inject: {
    $pcFluid: {
      default: null
    }
  },
  numberFormat: null,
  _numeral: null,
  _decimal: null,
  _group: null,
  _minusSign: null,
  _currency: null,
  _suffix: null,
  _prefix: null,
  _index: null,
  groupChar: "",
  isSpecialChar: null,
  prefixChar: null,
  suffixChar: null,
  timer: null,
  data: function() {
    return {
      // @deprecated
      d_modelValue: this.d_value,
      focused: !1
    };
  },
  watch: {
    d_value: {
      immediate: !0,
      handler: function(t) {
        var n;
        this.d_modelValue = t, (n = this.$refs.clearIcon) !== null && n !== void 0 && (n = n.$el) !== null && n !== void 0 && n.style && (this.$refs.clearIcon.$el.style.display = pt(t) ? "none" : "block");
      }
    },
    locale: function(t, n) {
      this.updateConstructParser(t, n);
    },
    localeMatcher: function(t, n) {
      this.updateConstructParser(t, n);
    },
    mode: function(t, n) {
      this.updateConstructParser(t, n);
    },
    currency: function(t, n) {
      this.updateConstructParser(t, n);
    },
    currencyDisplay: function(t, n) {
      this.updateConstructParser(t, n);
    },
    useGrouping: function(t, n) {
      this.updateConstructParser(t, n);
    },
    minFractionDigits: function(t, n) {
      this.updateConstructParser(t, n);
    },
    maxFractionDigits: function(t, n) {
      this.updateConstructParser(t, n);
    },
    suffix: function(t, n) {
      this.updateConstructParser(t, n);
    },
    prefix: function(t, n) {
      this.updateConstructParser(t, n);
    }
  },
  created: function() {
    this.constructParser();
  },
  mounted: function() {
    var t;
    (t = this.$refs.clearIcon) !== null && t !== void 0 && (t = t.$el) !== null && t !== void 0 && t.style && (this.$refs.clearIcon.$el.style.display = this.$filled ? "block" : "none");
  },
  methods: {
    getOptions: function() {
      return {
        localeMatcher: this.localeMatcher,
        style: this.mode,
        currency: this.currency,
        currencyDisplay: this.currencyDisplay,
        useGrouping: this.useGrouping,
        minimumFractionDigits: this.minFractionDigits,
        maximumFractionDigits: this.maxFractionDigits,
        roundingMode: this.roundingMode
      };
    },
    constructParser: function() {
      this.numberFormat = new Intl.NumberFormat(this.locale, this.getOptions());
      var t = Sr(new Intl.NumberFormat(this.locale, {
        useGrouping: !1
      }).format(9876543210)).reverse(), n = new Map(t.map(function(a, o) {
        return [a, o];
      }));
      this._numeral = new RegExp("[".concat(t.join(""), "]"), "g"), this._group = this.getGroupingExpression(), this._minusSign = this.getMinusSignExpression(), this._currency = this.getCurrencyExpression(), this._decimal = this.getDecimalExpression(), this._suffix = this.getSuffixExpression(), this._prefix = this.getPrefixExpression(), this._index = function(a) {
        return n.get(a);
      };
    },
    updateConstructParser: function(t, n) {
      t !== n && this.constructParser();
    },
    escapeRegExp: function(t) {
      return t.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
    },
    getDecimalExpression: function() {
      var t = new Intl.NumberFormat(this.locale, mt(mt({}, this.getOptions()), {}, {
        useGrouping: !1
      })), n = t.format(1.1);
      return n === t.format(1) ? new RegExp("[]", "g") : new RegExp("[".concat(n.replace(this._currency, "").trim().replace(this._numeral, ""), "]"), "g");
    },
    getGroupingExpression: function() {
      var t = new Intl.NumberFormat(this.locale, {
        useGrouping: !0
      });
      return this.groupChar = t.format(1e6).trim().replace(this._numeral, "").charAt(0), new RegExp("[".concat(this.groupChar, "]"), "g");
    },
    getMinusSignExpression: function() {
      var t = new Intl.NumberFormat(this.locale, {
        useGrouping: !1
      });
      return new RegExp("[".concat(t.format(-1).trim().replace(this._numeral, ""), "]"), "g");
    },
    getCurrencyExpression: function() {
      if (this.currency) {
        var t = new Intl.NumberFormat(this.locale, {
          style: "currency",
          currency: this.currency,
          currencyDisplay: this.currencyDisplay,
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
          roundingMode: this.roundingMode
        });
        return new RegExp("[".concat(t.format(1).replace(/\s/g, "").replace(this._numeral, "").replace(this._group, ""), "]"), "g");
      }
      return new RegExp("[]", "g");
    },
    getPrefixExpression: function() {
      if (this.prefix)
        this.prefixChar = this.prefix;
      else {
        var t = new Intl.NumberFormat(this.locale, {
          style: this.mode,
          currency: this.currency,
          currencyDisplay: this.currencyDisplay
        });
        this.prefixChar = t.format(1).split("1")[0];
      }
      return new RegExp("".concat(this.escapeRegExp(this.prefixChar || "")), "g");
    },
    getSuffixExpression: function() {
      if (this.suffix)
        this.suffixChar = this.suffix;
      else {
        var t = new Intl.NumberFormat(this.locale, {
          style: this.mode,
          currency: this.currency,
          currencyDisplay: this.currencyDisplay,
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
          roundingMode: this.roundingMode
        });
        this.suffixChar = t.format(1).split("1")[1];
      }
      return new RegExp("".concat(this.escapeRegExp(this.suffixChar || "")), "g");
    },
    formatValue: function(t) {
      if (t != null) {
        if (t === "-")
          return t;
        if (this.format) {
          var n = new Intl.NumberFormat(this.locale, this.getOptions()), a = n.format(t);
          return this.prefix && (a = this.prefix + a), this.suffix && (a = a + this.suffix), a;
        }
        return t.toString();
      }
      return "";
    },
    parseValue: function(t) {
      var n = t.replace(this._suffix, "").replace(this._prefix, "").trim().replace(/\s/g, "").replace(this._currency, "").replace(this._group, "").replace(this._minusSign, "-").replace(this._decimal, ".").replace(this._numeral, this._index);
      if (n) {
        if (n === "-")
          return n;
        var a = +n;
        return isNaN(a) ? null : a;
      }
      return null;
    },
    repeat: function(t, n, a) {
      var o = this;
      if (!this.readonly) {
        var r = n || 500;
        this.clearTimer(), this.timer = setTimeout(function() {
          o.repeat(t, 40, a);
        }, r), this.spin(t, a);
      }
    },
    addWithPrecision: function(t, n) {
      var a = t.toString(), o = n.toString(), r = a.includes(".") ? a.split(".")[1].length : 0, i = o.includes(".") ? o.split(".")[1].length : 0, p = Math.max(r, i), g = Math.pow(10, p);
      return Math.round((t + n) * g) / g;
    },
    spin: function(t, n) {
      if (this.$refs.input) {
        var a = this.step * n, o = this.parseValue(this.$refs.input.$el.value) || 0, r = this.validateValue(this.addWithPrecision(o, a));
        this.updateInput(r, null, "spin"), this.updateModel(t, r), this.handleOnInput(t, o, r);
      }
    },
    onUpButtonMouseDown: function(t) {
      this.disabled || (this.$refs.input.$el.focus(), this.repeat(t, null, 1), t.preventDefault());
    },
    onUpButtonMouseUp: function() {
      this.disabled || this.clearTimer();
    },
    onUpButtonMouseLeave: function() {
      this.disabled || this.clearTimer();
    },
    onUpButtonKeyUp: function() {
      this.disabled || this.clearTimer();
    },
    onUpButtonKeyDown: function(t) {
      (t.code === "Space" || t.code === "Enter" || t.code === "NumpadEnter") && this.repeat(t, null, 1);
    },
    onDownButtonMouseDown: function(t) {
      this.disabled || (this.$refs.input.$el.focus(), this.repeat(t, null, -1), t.preventDefault());
    },
    onDownButtonMouseUp: function() {
      this.disabled || this.clearTimer();
    },
    onDownButtonMouseLeave: function() {
      this.disabled || this.clearTimer();
    },
    onDownButtonKeyUp: function() {
      this.disabled || this.clearTimer();
    },
    onDownButtonKeyDown: function(t) {
      (t.code === "Space" || t.code === "Enter" || t.code === "NumpadEnter") && this.repeat(t, null, -1);
    },
    onUserInput: function() {
      this.isSpecialChar && (this.$refs.input.$el.value = this.lastValue), this.isSpecialChar = !1;
    },
    onInputKeyDown: function(t) {
      if (!this.readonly && !t.isComposing) {
        if (t.altKey || t.ctrlKey || t.metaKey) {
          this.isSpecialChar = !0, this.lastValue = this.$refs.input.$el.value;
          return;
        }
        this.lastValue = t.target.value;
        var n = t.target.selectionStart, a = t.target.selectionEnd, o = a - n, r = t.target.value, i = null, p = t.code || t.key;
        switch (p) {
          case "ArrowUp":
            this.spin(t, 1), t.preventDefault();
            break;
          case "ArrowDown":
            this.spin(t, -1), t.preventDefault();
            break;
          case "ArrowLeft":
            if (o > 1) {
              var g = this.isNumeralChar(r.charAt(n)) ? n + 1 : n + 2;
              this.$refs.input.$el.setSelectionRange(g, g);
            } else this.isNumeralChar(r.charAt(n - 1)) || t.preventDefault();
            break;
          case "ArrowRight":
            if (o > 1) {
              var h = a - 1;
              this.$refs.input.$el.setSelectionRange(h, h);
            } else this.isNumeralChar(r.charAt(n)) || t.preventDefault();
            break;
          case "Tab":
          case "Enter":
          case "NumpadEnter":
            i = this.validateValue(this.parseValue(r)), this.$refs.input.$el.value = this.formatValue(i), this.$refs.input.$el.setAttribute("aria-valuenow", i), this.updateModel(t, i);
            break;
          case "Backspace": {
            if (t.preventDefault(), n === a) {
              n >= r.length && this.suffixChar !== null && (n = r.length - this.suffixChar.length, this.$refs.input.$el.setSelectionRange(n, n));
              var S = r.charAt(n - 1), x = this.getDecimalCharIndexes(r), v = x.decimalCharIndex, P = x.decimalCharIndexWithoutPrefix;
              if (this.isNumeralChar(S)) {
                var z = this.getDecimalLength(r);
                if (this._group.test(S))
                  this._group.lastIndex = 0, i = r.slice(0, n - 2) + r.slice(n - 1);
                else if (this._decimal.test(S))
                  this._decimal.lastIndex = 0, z ? this.$refs.input.$el.setSelectionRange(n - 1, n - 1) : i = r.slice(0, n - 1) + r.slice(n);
                else if (v > 0 && n > v) {
                  var O = this.isDecimalMode() && (this.minFractionDigits || 0) < z ? "" : "0";
                  i = r.slice(0, n - 1) + O + r.slice(n);
                } else P === 1 ? (i = r.slice(0, n - 1) + "0" + r.slice(n), i = this.parseValue(i) > 0 ? i : "") : i = r.slice(0, n - 1) + r.slice(n);
              }
              this.updateValue(t, i, null, "delete-single");
            } else
              i = this.deleteRange(r, n, a), this.updateValue(t, i, null, "delete-range");
            break;
          }
          case "Delete":
            if (t.preventDefault(), n === a) {
              var M = r.charAt(n), B = this.getDecimalCharIndexes(r), A = B.decimalCharIndex, V = B.decimalCharIndexWithoutPrefix;
              if (this.isNumeralChar(M)) {
                var K = this.getDecimalLength(r);
                if (this._group.test(M))
                  this._group.lastIndex = 0, i = r.slice(0, n) + r.slice(n + 2);
                else if (this._decimal.test(M))
                  this._decimal.lastIndex = 0, K ? this.$refs.input.$el.setSelectionRange(n + 1, n + 1) : i = r.slice(0, n) + r.slice(n + 1);
                else if (A > 0 && n > A) {
                  var X = this.isDecimalMode() && (this.minFractionDigits || 0) < K ? "" : "0";
                  i = r.slice(0, n) + X + r.slice(n + 1);
                } else V === 1 ? (i = r.slice(0, n) + "0" + r.slice(n + 1), i = this.parseValue(i) > 0 ? i : "") : i = r.slice(0, n) + r.slice(n + 1);
              }
              this.updateValue(t, i, null, "delete-back-single");
            } else
              i = this.deleteRange(r, n, a), this.updateValue(t, i, null, "delete-range");
            break;
          case "Home":
            t.preventDefault(), We(this.min) && this.updateModel(t, this.min);
            break;
          case "End":
            t.preventDefault(), We(this.max) && this.updateModel(t, this.max);
            break;
        }
      }
    },
    onInputKeyPress: function(t) {
      if (!this.readonly) {
        var n = t.key, a = this.isDecimalSign(n), o = this.isMinusSign(n);
        t.code !== "Enter" && t.preventDefault(), (Number(n) >= 0 && Number(n) <= 9 || o || a) && this.insert(t, n, {
          isDecimalSign: a,
          isMinusSign: o
        });
      }
    },
    onPaste: function(t) {
      if (!(this.readonly || this.disabled)) {
        t.preventDefault();
        var n = (t.clipboardData || window.clipboardData).getData("Text");
        if (!(this.inputId === "integeronly" && /[^\d-]/.test(n)) && n) {
          var a = this.parseValue(n);
          a != null && this.insert(t, a.toString());
        }
      }
    },
    onClearClick: function(t) {
      this.updateModel(t, null), this.$refs.input.$el.focus();
    },
    allowMinusSign: function() {
      return this.min === null || this.min < 0;
    },
    isMinusSign: function(t) {
      return this._minusSign.test(t) || t === "-" ? (this._minusSign.lastIndex = 0, !0) : !1;
    },
    isDecimalSign: function(t) {
      var n;
      return (n = this.locale) !== null && n !== void 0 && n.includes("fr") && [".", ","].includes(t) || this._decimal.test(t) ? (this._decimal.lastIndex = 0, !0) : !1;
    },
    isDecimalMode: function() {
      return this.mode === "decimal";
    },
    getDecimalCharIndexes: function(t) {
      var n = t.search(this._decimal);
      this._decimal.lastIndex = 0;
      var a = t.replace(this._prefix, "").trim().replace(/\s/g, "").replace(this._currency, ""), o = a.search(this._decimal);
      return this._decimal.lastIndex = 0, {
        decimalCharIndex: n,
        decimalCharIndexWithoutPrefix: o
      };
    },
    getCharIndexes: function(t) {
      var n = t.search(this._decimal);
      this._decimal.lastIndex = 0;
      var a = t.search(this._minusSign);
      this._minusSign.lastIndex = 0;
      var o = t.search(this._suffix);
      this._suffix.lastIndex = 0;
      var r = t.search(this._currency);
      return this._currency.lastIndex = 0, {
        decimalCharIndex: n,
        minusCharIndex: a,
        suffixCharIndex: o,
        currencyCharIndex: r
      };
    },
    insert: function(t, n) {
      var a = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {
        isDecimalSign: !1,
        isMinusSign: !1
      }, o = n.search(this._minusSign);
      if (this._minusSign.lastIndex = 0, !(!this.allowMinusSign() && o !== -1)) {
        var r = this.$refs.input.$el.selectionStart, i = this.$refs.input.$el.selectionEnd, p = this.$refs.input.$el.value.trim(), g = this.getCharIndexes(p), h = g.decimalCharIndex, S = g.minusCharIndex, x = g.suffixCharIndex, v = g.currencyCharIndex, P;
        if (a.isMinusSign) {
          var z = S === -1;
          (r === 0 || r === v + 1) && (P = p, (z || i !== 0) && (P = this.insertText(p, n, 0, i)), this.updateValue(t, P, n, "insert"));
        } else if (a.isDecimalSign)
          h > 0 && r === h ? this.updateValue(t, p, n, "insert") : h > r && h < i ? (P = this.insertText(p, n, r, i), this.updateValue(t, P, n, "insert")) : h === -1 && this.maxFractionDigits && (P = this.insertText(p, n, r, i), this.updateValue(t, P, n, "insert"));
        else {
          var O = this.numberFormat.resolvedOptions().maximumFractionDigits, M = r !== i ? "range-insert" : "insert";
          if (h > 0 && r > h) {
            if (r + n.length - (h + 1) <= O) {
              var B = v >= r ? v - 1 : x >= r ? x : p.length;
              P = p.slice(0, r) + n + p.slice(r + n.length, B) + p.slice(B), this.updateValue(t, P, n, M);
            }
          } else
            P = this.insertText(p, n, r, i), this.updateValue(t, P, n, M);
        }
      }
    },
    insertText: function(t, n, a, o) {
      var r = n === "." ? n : n.split(".");
      if (r.length === 2) {
        var i = t.slice(a, o).search(this._decimal);
        return this._decimal.lastIndex = 0, i > 0 ? t.slice(0, a) + this.formatValue(n) + t.slice(o) : this.formatValue(n) || t;
      } else return o - a === t.length ? this.formatValue(n) : a === 0 ? n + t.slice(o) : o === t.length ? t.slice(0, a) + n : t.slice(0, a) + n + t.slice(o);
    },
    deleteRange: function(t, n, a) {
      var o;
      return a - n === t.length ? o = "" : n === 0 ? o = t.slice(a) : a === t.length ? o = t.slice(0, n) : o = t.slice(0, n) + t.slice(a), o;
    },
    initCursor: function() {
      var t = this.$refs.input.$el.selectionStart, n = this.$refs.input.$el.value, a = n.length, o = null, r = (this.prefixChar || "").length;
      n = n.replace(this._prefix, ""), t = t - r;
      var i = n.charAt(t);
      if (this.isNumeralChar(i))
        return t + r;
      for (var p = t - 1; p >= 0; )
        if (i = n.charAt(p), this.isNumeralChar(i)) {
          o = p + r;
          break;
        } else
          p--;
      if (o !== null)
        this.$refs.input.$el.setSelectionRange(o + 1, o + 1);
      else {
        for (p = t; p < a; )
          if (i = n.charAt(p), this.isNumeralChar(i)) {
            o = p + r;
            break;
          } else
            p++;
        o !== null && this.$refs.input.$el.setSelectionRange(o, o);
      }
      return o || 0;
    },
    onInputClick: function() {
      var t = this.$refs.input.$el.value;
      !this.readonly && t !== lt() && this.initCursor();
    },
    isNumeralChar: function(t) {
      return t.length === 1 && (this._numeral.test(t) || this._decimal.test(t) || this._group.test(t) || this._minusSign.test(t)) ? (this.resetRegex(), !0) : !1;
    },
    resetRegex: function() {
      this._numeral.lastIndex = 0, this._decimal.lastIndex = 0, this._group.lastIndex = 0, this._minusSign.lastIndex = 0;
    },
    updateValue: function(t, n, a, o) {
      var r = this.$refs.input.$el.value, i = null;
      n != null && (i = this.parseValue(n), i = !i && !this.allowEmpty ? 0 : i, this.updateInput(i, a, o, n), this.handleOnInput(t, r, i));
    },
    handleOnInput: function(t, n, a) {
      if (this.isValueChanged(n, a)) {
        var o, r;
        this.$emit("input", {
          originalEvent: t,
          value: a,
          formattedValue: n
        }), (o = (r = this.formField).onInput) === null || o === void 0 || o.call(r, {
          originalEvent: t,
          value: a
        });
      }
    },
    isValueChanged: function(t, n) {
      if (n === null && t !== null)
        return !0;
      if (n != null) {
        var a = typeof t == "string" ? this.parseValue(t) : t;
        return n !== a;
      }
      return !1;
    },
    validateValue: function(t) {
      return t === "-" || t == null ? null : this.min != null && t < this.min ? this.min : this.max != null && t > this.max ? this.max : t;
    },
    updateInput: function(t, n, a, o) {
      var r;
      n = n || "";
      var i = this.$refs.input.$el.value, p = this.formatValue(t), g = i.length;
      if (p !== o && (p = this.concatValues(p, o)), g === 0) {
        this.$refs.input.$el.value = p, this.$refs.input.$el.setSelectionRange(0, 0);
        var h = this.initCursor(), S = h + n.length;
        this.$refs.input.$el.setSelectionRange(S, S);
      } else {
        var x = this.$refs.input.$el.selectionStart, v = this.$refs.input.$el.selectionEnd;
        this.$refs.input.$el.value = p;
        var P = p.length;
        if (a === "range-insert") {
          var z = this.parseValue((i || "").slice(0, x)), O = z !== null ? z.toString() : "", M = O.split("").join("(".concat(this.groupChar, ")?")), B = new RegExp(M, "g");
          B.test(p);
          var A = n.split("").join("(".concat(this.groupChar, ")?")), V = new RegExp(A, "g");
          V.test(p.slice(B.lastIndex)), v = B.lastIndex + V.lastIndex, this.$refs.input.$el.setSelectionRange(v, v);
        } else if (P === g)
          a === "insert" || a === "delete-back-single" ? this.$refs.input.$el.setSelectionRange(v + 1, v + 1) : a === "delete-single" ? this.$refs.input.$el.setSelectionRange(v - 1, v - 1) : (a === "delete-range" || a === "spin") && this.$refs.input.$el.setSelectionRange(v, v);
        else if (a === "delete-back-single") {
          var K = i.charAt(v - 1), X = i.charAt(v), ae = g - P, oe = this._group.test(X);
          oe && ae === 1 ? v += 1 : !oe && this.isNumeralChar(K) && (v += -1 * ae + 1), this._group.lastIndex = 0, this.$refs.input.$el.setSelectionRange(v, v);
        } else if (i === "-" && a === "insert") {
          this.$refs.input.$el.setSelectionRange(0, 0);
          var ce = this.initCursor(), ie = ce + n.length + 1;
          this.$refs.input.$el.setSelectionRange(ie, ie);
        } else
          v = v + (P - g), this.$refs.input.$el.setSelectionRange(v, v);
      }
      this.$refs.input.$el.setAttribute("aria-valuenow", t), (r = this.$refs.clearIcon) !== null && r !== void 0 && (r = r.$el) !== null && r !== void 0 && r.style && (this.$refs.clearIcon.$el.style.display = pt(p) ? "none" : "block");
    },
    concatValues: function(t, n) {
      if (t && n) {
        var a = n.search(this._decimal);
        return this._decimal.lastIndex = 0, this.suffixChar ? a !== -1 ? t.replace(this.suffixChar, "").split(this._decimal)[0] + n.replace(this.suffixChar, "").slice(a) + this.suffixChar : t : a !== -1 ? t.split(this._decimal)[0] + n.slice(a) : t;
      }
      return t;
    },
    getDecimalLength: function(t) {
      if (t) {
        var n = t.split(this._decimal);
        if (n.length === 2)
          return n[1].replace(this._suffix, "").trim().replace(/\s/g, "").replace(this._currency, "").length;
      }
      return 0;
    },
    updateModel: function(t, n) {
      this.writeValue(n, t);
    },
    onInputFocus: function(t) {
      this.focused = !0, !this.disabled && !this.readonly && this.$refs.input.$el.value !== lt() && this.highlightOnFocus && t.target.select(), this.$emit("focus", t);
    },
    onInputBlur: function(t) {
      var n, a;
      this.focused = !1;
      var o = t.target, r = this.validateValue(this.parseValue(o.value));
      this.$emit("blur", {
        originalEvent: t,
        value: o.value
      }), (n = (a = this.formField).onBlur) === null || n === void 0 || n.call(a, t), o.value = this.formatValue(r), o.setAttribute("aria-valuenow", r), this.updateModel(t, r), !this.disabled && !this.readonly && this.highlightOnFocus && rn();
    },
    clearTimer: function() {
      this.timer && clearTimeout(this.timer);
    },
    maxBoundry: function() {
      return this.d_value >= this.max;
    },
    minBoundry: function() {
      return this.d_value <= this.min;
    }
  },
  computed: {
    upButtonListeners: function() {
      var t = this;
      return {
        mousedown: function(a) {
          return t.onUpButtonMouseDown(a);
        },
        mouseup: function(a) {
          return t.onUpButtonMouseUp(a);
        },
        mouseleave: function(a) {
          return t.onUpButtonMouseLeave(a);
        },
        keydown: function(a) {
          return t.onUpButtonKeyDown(a);
        },
        keyup: function(a) {
          return t.onUpButtonKeyUp(a);
        }
      };
    },
    downButtonListeners: function() {
      var t = this;
      return {
        mousedown: function(a) {
          return t.onDownButtonMouseDown(a);
        },
        mouseup: function(a) {
          return t.onDownButtonMouseUp(a);
        },
        mouseleave: function(a) {
          return t.onDownButtonMouseLeave(a);
        },
        keydown: function(a) {
          return t.onDownButtonKeyDown(a);
        },
        keyup: function(a) {
          return t.onDownButtonKeyUp(a);
        }
      };
    },
    formattedValue: function() {
      var t = !this.d_value && !this.allowEmpty ? 0 : this.d_value;
      return this.formatValue(t);
    },
    getFormatter: function() {
      return this.numberFormat;
    },
    dataP: function() {
      return Fe(Xe(Xe({
        invalid: this.$invalid,
        fluid: this.$fluid,
        filled: this.$variant === "filled"
      }, this.size, this.size), this.buttonLayout, this.showButtons && this.buttonLayout));
    }
  },
  components: {
    InputText: Pt,
    AngleUpIcon: Et,
    AngleDownIcon: Bt,
    TimesIcon: rt
  }
}, Dr = ["data-p"], Br = ["data-p"], Er = ["disabled", "data-p"], zr = ["disabled", "data-p"], Or = ["disabled", "data-p"], Rr = ["disabled", "data-p"];
function Fr(e, t, n, a, o, r) {
  var i = F("InputText"), p = F("TimesIcon");
  return l(), c("span", f({
    class: e.cx("root")
  }, e.ptmi("root"), {
    "data-p": r.dataP
  }), [w(i, {
    ref: "input",
    id: e.inputId,
    name: e.$formName,
    role: "spinbutton",
    class: I([e.cx("pcInputText"), e.inputClass]),
    style: hn(e.inputStyle),
    defaultValue: r.formattedValue,
    "aria-valuemin": e.min,
    "aria-valuemax": e.max,
    "aria-valuenow": e.d_value,
    inputmode: e.mode === "decimal" && !e.minFractionDigits ? "numeric" : "decimal",
    disabled: e.disabled,
    readonly: e.readonly,
    placeholder: e.placeholder,
    "aria-labelledby": e.ariaLabelledby,
    "aria-label": e.ariaLabel,
    required: e.required,
    size: e.size,
    invalid: e.invalid,
    variant: e.variant,
    onInput: r.onUserInput,
    onKeydown: r.onInputKeyDown,
    onKeypress: r.onInputKeyPress,
    onPaste: r.onPaste,
    onClick: r.onInputClick,
    onFocus: r.onInputFocus,
    onBlur: r.onInputBlur,
    pt: e.ptm("pcInputText"),
    unstyled: e.unstyled,
    "data-p": r.dataP
  }, null, 8, ["id", "name", "class", "style", "defaultValue", "aria-valuemin", "aria-valuemax", "aria-valuenow", "inputmode", "disabled", "readonly", "placeholder", "aria-labelledby", "aria-label", "required", "size", "invalid", "variant", "onInput", "onKeydown", "onKeypress", "onPaste", "onClick", "onFocus", "onBlur", "pt", "unstyled", "data-p"]), e.showClear && e.buttonLayout !== "vertical" ? D(e.$slots, "clearicon", {
    key: 0,
    class: I(e.cx("clearIcon")),
    clearCallback: r.onClearClick
  }, function() {
    return [w(p, f({
      ref: "clearIcon",
      class: [e.cx("clearIcon")],
      onClick: r.onClearClick
    }, e.ptm("clearIcon")), null, 16, ["class", "onClick"])];
  }) : C("", !0), e.showButtons && e.buttonLayout === "stacked" ? (l(), c("span", f({
    key: 1,
    class: e.cx("buttonGroup")
  }, e.ptm("buttonGroup"), {
    "data-p": r.dataP
  }), [D(e.$slots, "incrementbutton", {
    listeners: r.upButtonListeners
  }, function() {
    return [b("button", f({
      class: [e.cx("incrementButton"), e.incrementButtonClass]
    }, Oe(r.upButtonListeners, !0), {
      disabled: e.disabled,
      tabindex: -1,
      "aria-hidden": "true",
      type: "button"
    }, e.ptm("incrementButton"), {
      "data-p": r.dataP
    }), [D(e.$slots, e.$slots.incrementicon ? "incrementicon" : "incrementbuttonicon", {}, function() {
      return [(l(), k(_(e.incrementIcon || e.incrementButtonIcon ? "span" : "AngleUpIcon"), f({
        class: [e.incrementIcon, e.incrementButtonIcon]
      }, e.ptm("incrementIcon"), {
        "data-pc-section": "incrementicon"
      }), null, 16, ["class"]))];
    })], 16, Er)];
  }), D(e.$slots, "decrementbutton", {
    listeners: r.downButtonListeners
  }, function() {
    return [b("button", f({
      class: [e.cx("decrementButton"), e.decrementButtonClass]
    }, Oe(r.downButtonListeners, !0), {
      disabled: e.disabled,
      tabindex: -1,
      "aria-hidden": "true",
      type: "button"
    }, e.ptm("decrementButton"), {
      "data-p": r.dataP
    }), [D(e.$slots, e.$slots.decrementicon ? "decrementicon" : "decrementbuttonicon", {}, function() {
      return [(l(), k(_(e.decrementIcon || e.decrementButtonIcon ? "span" : "AngleDownIcon"), f({
        class: [e.decrementIcon, e.decrementButtonIcon]
      }, e.ptm("decrementIcon"), {
        "data-pc-section": "decrementicon"
      }), null, 16, ["class"]))];
    })], 16, zr)];
  })], 16, Br)) : C("", !0), D(e.$slots, "incrementbutton", {
    listeners: r.upButtonListeners
  }, function() {
    return [e.showButtons && e.buttonLayout !== "stacked" ? (l(), c("button", f({
      key: 0,
      class: [e.cx("incrementButton"), e.incrementButtonClass]
    }, Oe(r.upButtonListeners, !0), {
      disabled: e.disabled,
      tabindex: -1,
      "aria-hidden": "true",
      type: "button"
    }, e.ptm("incrementButton"), {
      "data-p": r.dataP
    }), [D(e.$slots, e.$slots.incrementicon ? "incrementicon" : "incrementbuttonicon", {}, function() {
      return [(l(), k(_(e.incrementIcon || e.incrementButtonIcon ? "span" : "AngleUpIcon"), f({
        class: [e.incrementIcon, e.incrementButtonIcon]
      }, e.ptm("incrementIcon"), {
        "data-pc-section": "incrementicon"
      }), null, 16, ["class"]))];
    })], 16, Or)) : C("", !0)];
  }), D(e.$slots, "decrementbutton", {
    listeners: r.downButtonListeners
  }, function() {
    return [e.showButtons && e.buttonLayout !== "stacked" ? (l(), c("button", f({
      key: 0,
      class: [e.cx("decrementButton"), e.decrementButtonClass]
    }, Oe(r.downButtonListeners, !0), {
      disabled: e.disabled,
      tabindex: -1,
      "aria-hidden": "true",
      type: "button"
    }, e.ptm("decrementButton"), {
      "data-p": r.dataP
    }), [D(e.$slots, e.$slots.decrementicon ? "decrementicon" : "decrementbuttonicon", {}, function() {
      return [(l(), k(_(e.decrementIcon || e.decrementButtonIcon ? "span" : "AngleDownIcon"), f({
        class: [e.decrementIcon, e.decrementButtonIcon]
      }, e.ptm("decrementIcon"), {
        "data-pc-section": "decrementicon"
      }), null, 16, ["class"]))];
    })], 16, Rr)) : C("", !0)];
  })], 16, Dr);
}
zt.render = Fr;
var Ot = {
  name: "AngleDoubleRightIcon",
  extends: le
};
function Mr(e) {
  return Vr(e) || Ur(e) || Nr(e) || jr();
}
function jr() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Nr(e, t) {
  if (e) {
    if (typeof e == "string") return Ye(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Ye(e, t) : void 0;
  }
}
function Ur(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function Vr(e) {
  if (Array.isArray(e)) return Ye(e);
}
function Ye(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, a = Array(t); n < t; n++) a[n] = e[n];
  return a;
}
function _r(e, t, n, a, o, r) {
  return l(), c("svg", f({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), Mr(t[0] || (t[0] = [b("path", {
    "fill-rule": "evenodd",
    "clip-rule": "evenodd",
    d: "M7.68757 11.1451C7.7791 11.1831 7.8773 11.2024 7.9764 11.2019C8.07769 11.1985 8.17721 11.1745 8.26886 11.1312C8.36052 11.088 8.44238 11.0265 8.50943 10.9505L12.0294 7.49085C12.1707 7.34942 12.25 7.15771 12.25 6.95782C12.25 6.75794 12.1707 6.56622 12.0294 6.42479L8.50943 2.90479C8.37014 2.82159 8.20774 2.78551 8.04633 2.80192C7.88491 2.81833 7.73309 2.88635 7.6134 2.99588C7.4937 3.10541 7.41252 3.25061 7.38189 3.40994C7.35126 3.56927 7.37282 3.73423 7.44337 3.88033L10.4605 6.89748L7.44337 9.91463C7.30212 10.0561 7.22278 10.2478 7.22278 10.4477C7.22278 10.6475 7.30212 10.8393 7.44337 10.9807C7.51301 11.0512 7.59603 11.1071 7.68757 11.1451ZM1.94207 10.9505C2.07037 11.0968 2.25089 11.1871 2.44493 11.2019C2.63898 11.1871 2.81949 11.0968 2.94779 10.9505L6.46779 7.49085C6.60905 7.34942 6.68839 7.15771 6.68839 6.95782C6.68839 6.75793 6.60905 6.56622 6.46779 6.42479L2.94779 2.90479C2.80704 2.83757 2.6489 2.81563 2.49517 2.84201C2.34143 2.86839 2.19965 2.94178 2.08936 3.05207C1.97906 3.16237 1.90567 3.30415 1.8793 3.45788C1.85292 3.61162 1.87485 3.76975 1.94207 3.9105L4.95922 6.92765L1.94207 9.9448C1.81838 10.0831 1.75 10.2621 1.75 10.4477C1.75 10.6332 1.81838 10.8122 1.94207 10.9505Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
Ot.render = _r;
var Rt = {
  name: "AngleLeftIcon",
  extends: le
};
function Kr(e) {
  return Hr(e) || Jr(e) || Gr(e) || Wr();
}
function Wr() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Gr(e, t) {
  if (e) {
    if (typeof e == "string") return et(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? et(e, t) : void 0;
  }
}
function Jr(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function Hr(e) {
  if (Array.isArray(e)) return et(e);
}
function et(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, a = Array(t); n < t; n++) a[n] = e[n];
  return a;
}
function Zr(e, t, n, a, o, r) {
  return l(), c("svg", f({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), Kr(t[0] || (t[0] = [b("path", {
    d: "M8.75 11.185C8.65146 11.1854 8.55381 11.1662 8.4628 11.1284C8.37179 11.0906 8.28924 11.0351 8.22 10.965L4.72 7.46496C4.57955 7.32433 4.50066 7.13371 4.50066 6.93496C4.50066 6.73621 4.57955 6.54558 4.72 6.40496L8.22 2.93496C8.36095 2.84357 8.52851 2.80215 8.69582 2.81733C8.86312 2.83252 9.02048 2.90344 9.14268 3.01872C9.26487 3.134 9.34483 3.28696 9.36973 3.4531C9.39463 3.61924 9.36303 3.78892 9.28 3.93496L6.28 6.93496L9.28 9.93496C9.42045 10.0756 9.49934 10.2662 9.49934 10.465C9.49934 10.6637 9.42045 10.8543 9.28 10.995C9.13526 11.1257 8.9448 11.1939 8.75 11.185Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
Rt.render = Zr;
var qr = {
  name: "BasePaginator",
  extends: N,
  props: {
    totalRecords: {
      type: Number,
      default: 0
    },
    rows: {
      type: Number,
      default: 0
    },
    first: {
      type: Number,
      default: 0
    },
    pageLinkSize: {
      type: Number,
      default: 5
    },
    rowsPerPageOptions: {
      type: Array,
      default: null
    },
    template: {
      type: [Object, String],
      default: "FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
    },
    currentPageReportTemplate: {
      type: null,
      default: "({currentPage} of {totalPages})"
    },
    alwaysShow: {
      type: Boolean,
      default: !0
    }
  },
  style: tr,
  provide: function() {
    return {
      $pcPaginator: this,
      $parentInstance: this
    };
  }
}, Ft = {
  name: "CurrentPageReport",
  hostName: "Paginator",
  extends: N,
  props: {
    pageCount: {
      type: Number,
      default: 0
    },
    currentPage: {
      type: Number,
      default: 0
    },
    page: {
      type: Number,
      default: 0
    },
    first: {
      type: Number,
      default: 0
    },
    rows: {
      type: Number,
      default: 0
    },
    totalRecords: {
      type: Number,
      default: 0
    },
    template: {
      type: String,
      default: "({currentPage} of {totalPages})"
    }
  },
  computed: {
    text: function() {
      var t = this.template.replace("{currentPage}", this.currentPage).replace("{totalPages}", this.pageCount).replace("{first}", this.pageCount > 0 ? this.first + 1 : 0).replace("{last}", Math.min(this.first + this.rows, this.totalRecords)).replace("{rows}", this.rows).replace("{totalRecords}", this.totalRecords);
      return t;
    }
  }
};
function Xr(e, t, n, a, o, r) {
  return l(), c("span", f({
    class: e.cx("current")
  }, e.ptm("current")), T(r.text), 17);
}
Ft.render = Xr;
var Mt = {
  name: "FirstPageLink",
  hostName: "Paginator",
  extends: N,
  props: {
    template: {
      type: Function,
      default: null
    }
  },
  methods: {
    getPTOptions: function(t) {
      return this.ptm(t, {
        context: {
          disabled: this.$attrs.disabled
        }
      });
    }
  },
  components: {
    AngleDoubleLeftIcon: Dt
  },
  directives: {
    ripple: pe
  }
};
function Qr(e, t, n, a, o, r) {
  var i = re("ripple");
  return te((l(), c("button", f({
    class: e.cx("first"),
    type: "button"
  }, r.getPTOptions("first"), {
    "data-pc-group-section": "pagebutton"
  }), [(l(), k(_(n.template || "AngleDoubleLeftIcon"), f({
    class: e.cx("firstIcon")
  }, r.getPTOptions("firstIcon")), null, 16, ["class"]))], 16)), [[i]]);
}
Mt.render = Qr;
var jt = {
  name: "JumpToPageDropdown",
  hostName: "Paginator",
  extends: N,
  emits: ["page-change"],
  props: {
    page: Number,
    pageCount: Number,
    disabled: Boolean,
    templates: null
  },
  methods: {
    onChange: function(t) {
      this.$emit("page-change", t);
    }
  },
  computed: {
    pageOptions: function() {
      for (var t = [], n = 0; n < this.pageCount; n++)
        t.push({
          label: String(n + 1),
          value: n
        });
      return t;
    }
  },
  components: {
    JTPSelect: at
  }
};
function Yr(e, t, n, a, o, r) {
  var i = F("JTPSelect");
  return l(), k(i, {
    modelValue: n.page,
    options: r.pageOptions,
    optionLabel: "label",
    optionValue: "value",
    "onUpdate:modelValue": t[0] || (t[0] = function(p) {
      return r.onChange(p);
    }),
    class: I(e.cx("pcJumpToPageDropdown")),
    disabled: n.disabled,
    unstyled: e.unstyled,
    pt: e.ptm("pcJumpToPageDropdown"),
    "data-pc-group-section": "pagedropdown"
  }, $t({
    _: 2
  }, [n.templates.jumptopagedropdownicon ? {
    name: "dropdownicon",
    fn: L(function(p) {
      return [(l(), k(_(n.templates.jumptopagedropdownicon), {
        class: I(p.class)
      }, null, 8, ["class"]))];
    }),
    key: "0"
  } : void 0]), 1032, ["modelValue", "options", "class", "disabled", "unstyled", "pt"]);
}
jt.render = Yr;
var Nt = {
  name: "JumpToPageInput",
  hostName: "Paginator",
  extends: N,
  inheritAttrs: !1,
  emits: ["page-change"],
  props: {
    page: Number,
    pageCount: Number,
    disabled: Boolean
  },
  data: function() {
    return {
      d_page: this.page
    };
  },
  watch: {
    page: function(t) {
      this.d_page = t;
    }
  },
  methods: {
    onChange: function(t) {
      t !== this.page && (this.d_page = t, this.$emit("page-change", t - 1));
    }
  },
  computed: {
    inputArialabel: function() {
      return this.$primevue.config.locale.aria ? this.$primevue.config.locale.aria.jumpToPageInputLabel : void 0;
    }
  },
  components: {
    JTPInput: zt
  }
};
function ea(e, t, n, a, o, r) {
  var i = F("JTPInput");
  return l(), k(i, {
    ref: "jtpInput",
    modelValue: o.d_page,
    class: I(e.cx("pcJumpToPageInputText")),
    "aria-label": r.inputArialabel,
    disabled: n.disabled,
    "onUpdate:modelValue": r.onChange,
    unstyled: e.unstyled,
    pt: e.ptm("pcJumpToPageInputText")
  }, null, 8, ["modelValue", "class", "aria-label", "disabled", "onUpdate:modelValue", "unstyled", "pt"]);
}
Nt.render = ea;
var Ut = {
  name: "LastPageLink",
  hostName: "Paginator",
  extends: N,
  props: {
    template: {
      type: Function,
      default: null
    }
  },
  methods: {
    getPTOptions: function(t) {
      return this.ptm(t, {
        context: {
          disabled: this.$attrs.disabled
        }
      });
    }
  },
  components: {
    AngleDoubleRightIcon: Ot
  },
  directives: {
    ripple: pe
  }
};
function ta(e, t, n, a, o, r) {
  var i = re("ripple");
  return te((l(), c("button", f({
    class: e.cx("last"),
    type: "button"
  }, r.getPTOptions("last"), {
    "data-pc-group-section": "pagebutton"
  }), [(l(), k(_(n.template || "AngleDoubleRightIcon"), f({
    class: e.cx("lastIcon")
  }, r.getPTOptions("lastIcon")), null, 16, ["class"]))], 16)), [[i]]);
}
Ut.render = ta;
var Vt = {
  name: "NextPageLink",
  hostName: "Paginator",
  extends: N,
  props: {
    template: {
      type: Function,
      default: null
    }
  },
  methods: {
    getPTOptions: function(t) {
      return this.ptm(t, {
        context: {
          disabled: this.$attrs.disabled
        }
      });
    }
  },
  components: {
    AngleRightIcon: Lt
  },
  directives: {
    ripple: pe
  }
};
function na(e, t, n, a, o, r) {
  var i = re("ripple");
  return te((l(), c("button", f({
    class: e.cx("next"),
    type: "button"
  }, r.getPTOptions("next"), {
    "data-pc-group-section": "pagebutton"
  }), [(l(), k(_(n.template || "AngleRightIcon"), f({
    class: e.cx("nextIcon")
  }, r.getPTOptions("nextIcon")), null, 16, ["class"]))], 16)), [[i]]);
}
Vt.render = na;
var _t = {
  name: "PageLinks",
  hostName: "Paginator",
  extends: N,
  inheritAttrs: !1,
  emits: ["click"],
  props: {
    value: Array,
    page: Number
  },
  methods: {
    getPTOptions: function(t, n) {
      return this.ptm(n, {
        context: {
          active: t === this.page
        }
      });
    },
    onPageLinkClick: function(t, n) {
      this.$emit("click", {
        originalEvent: t,
        value: n
      });
    },
    ariaPageLabel: function(t) {
      return this.$primevue.config.locale.aria ? this.$primevue.config.locale.aria.pageLabel.replace(/{page}/g, t) : void 0;
    }
  },
  directives: {
    ripple: pe
  }
}, ra = ["aria-label", "aria-current", "onClick", "data-p-active"];
function aa(e, t, n, a, o, r) {
  var i = re("ripple");
  return l(), c("span", f({
    class: e.cx("pages")
  }, e.ptm("pages")), [(l(!0), c(J, null, ke(n.value, function(p) {
    return te((l(), c("button", f({
      key: p,
      class: e.cx("page", {
        pageLink: p
      }),
      type: "button",
      "aria-label": r.ariaPageLabel(p),
      "aria-current": p - 1 === n.page ? "page" : void 0,
      onClick: function(h) {
        return r.onPageLinkClick(h, p);
      }
    }, {
      ref_for: !0
    }, r.getPTOptions(p - 1, "page"), {
      "data-p-active": p - 1 === n.page
    }), [Y(T(p), 1)], 16, ra)), [[i]]);
  }), 128))], 16);
}
_t.render = aa;
var Kt = {
  name: "PrevPageLink",
  hostName: "Paginator",
  extends: N,
  props: {
    template: {
      type: Function,
      default: null
    }
  },
  methods: {
    getPTOptions: function(t) {
      return this.ptm(t, {
        context: {
          disabled: this.$attrs.disabled
        }
      });
    }
  },
  components: {
    AngleLeftIcon: Rt
  },
  directives: {
    ripple: pe
  }
};
function oa(e, t, n, a, o, r) {
  var i = re("ripple");
  return te((l(), c("button", f({
    class: e.cx("prev"),
    type: "button"
  }, r.getPTOptions("prev"), {
    "data-pc-group-section": "pagebutton"
  }), [(l(), k(_(n.template || "AngleLeftIcon"), f({
    class: e.cx("prevIcon")
  }, r.getPTOptions("prevIcon")), null, 16, ["class"]))], 16)), [[i]]);
}
Kt.render = oa;
var Wt = {
  name: "RowsPerPageDropdown",
  hostName: "Paginator",
  extends: N,
  emits: ["rows-change"],
  props: {
    options: Array,
    rows: Number,
    disabled: Boolean,
    templates: null
  },
  methods: {
    onChange: function(t) {
      this.$emit("rows-change", t);
    }
  },
  computed: {
    rowsOptions: function() {
      var t = [];
      if (this.options)
        for (var n = 0; n < this.options.length; n++)
          t.push({
            label: String(this.options[n]),
            value: this.options[n]
          });
      return t;
    }
  },
  components: {
    RPPSelect: at
  }
};
function ia(e, t, n, a, o, r) {
  var i = F("RPPSelect");
  return l(), k(i, {
    modelValue: n.rows,
    options: r.rowsOptions,
    optionLabel: "label",
    optionValue: "value",
    "onUpdate:modelValue": t[0] || (t[0] = function(p) {
      return r.onChange(p);
    }),
    class: I(e.cx("pcRowPerPageDropdown")),
    disabled: n.disabled,
    unstyled: e.unstyled,
    pt: e.ptm("pcRowPerPageDropdown"),
    "data-pc-group-section": "pagedropdown"
  }, $t({
    _: 2
  }, [n.templates.rowsperpagedropdownicon ? {
    name: "dropdownicon",
    fn: L(function(p) {
      return [(l(), k(_(n.templates.rowsperpagedropdownicon), {
        class: I(p.class)
      }, null, 8, ["class"]))];
    }),
    key: "0"
  } : void 0]), 1032, ["modelValue", "options", "class", "disabled", "unstyled", "pt"]);
}
Wt.render = ia;
function tt(e) {
  "@babel/helpers - typeof";
  return tt = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, tt(e);
}
function gt(e, t) {
  return ua(e) || pa(e, t) || la(e, t) || sa();
}
function sa() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function la(e, t) {
  if (e) {
    if (typeof e == "string") return ht(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? ht(e, t) : void 0;
  }
}
function ht(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, a = Array(t); n < t; n++) a[n] = e[n];
  return a;
}
function pa(e, t) {
  var n = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (n != null) {
    var a, o, r, i, p = [], g = !0, h = !1;
    try {
      if (r = (n = n.call(e)).next, t === 0) {
        if (Object(n) !== n) return;
        g = !1;
      } else for (; !(g = (a = r.call(n)).done) && (p.push(a.value), p.length !== t); g = !0) ;
    } catch (S) {
      h = !0, o = S;
    } finally {
      try {
        if (!g && n.return != null && (i = n.return(), Object(i) !== i)) return;
      } finally {
        if (h) throw o;
      }
    }
    return p;
  }
}
function ua(e) {
  if (Array.isArray(e)) return e;
}
var Gt = {
  name: "Paginator",
  extends: qr,
  inheritAttrs: !1,
  emits: ["update:first", "update:rows", "page"],
  data: function() {
    return {
      d_first: this.first,
      d_rows: this.rows
    };
  },
  watch: {
    first: function(t) {
      this.d_first = t;
    },
    rows: function(t) {
      this.d_rows = t;
    },
    totalRecords: function(t) {
      this.page > 0 && t && this.d_first >= t && this.changePage(this.pageCount - 1);
    }
  },
  mounted: function() {
    this.createStyle();
  },
  methods: {
    changePage: function(t) {
      var n = this.pageCount;
      if (t >= 0 && t < n) {
        this.d_first = this.d_rows * t;
        var a = {
          page: t,
          first: this.d_first,
          rows: this.d_rows,
          pageCount: n
        };
        this.$emit("update:first", this.d_first), this.$emit("update:rows", this.d_rows), this.$emit("page", a);
      }
    },
    changePageToFirst: function(t) {
      this.isFirstPage || this.changePage(0), t.preventDefault();
    },
    changePageToPrev: function(t) {
      this.changePage(this.page - 1), t.preventDefault();
    },
    changePageLink: function(t) {
      this.changePage(t.value - 1), t.originalEvent.preventDefault();
    },
    changePageToNext: function(t) {
      this.changePage(this.page + 1), t.preventDefault();
    },
    changePageToLast: function(t) {
      this.isLastPage || this.changePage(this.pageCount - 1), t.preventDefault();
    },
    onRowChange: function(t) {
      this.d_rows = t, this.changePage(this.page);
    },
    createStyle: function() {
      var t = this;
      if (this.hasBreakpoints() && !this.isUnstyled) {
        var n;
        this.styleElement = document.createElement("style"), this.styleElement.type = "text/css", an(this.styleElement, "nonce", (n = this.$primevue) === null || n === void 0 || (n = n.config) === null || n === void 0 || (n = n.csp) === null || n === void 0 ? void 0 : n.nonce), document.body.appendChild(this.styleElement);
        var a = "", o = Object.keys(this.template), r = {};
        o.sort(function(z, O) {
          return parseInt(z) - parseInt(O);
        }).forEach(function(z) {
          r[z] = t.template[z];
        });
        for (var i = 0, p = Object.entries(Object.entries(r)); i < p.length; i++) {
          var g = gt(p[i], 2), h = g[0], S = gt(g[1], 1), x = S[0], v = void 0, P = void 0;
          x !== "default" && typeof Object.keys(r)[h - 1] == "string" ? P = Number(Object.keys(r)[h - 1].slice(0, -2)) + 1 + "px" : P = Object.keys(r)[h - 1], v = Object.entries(r)[h - 1] ? "and (min-width:".concat(P, ")") : "", x === "default" ? a += `
                            @media screen `.concat(v, ` {
                                .p-paginator[`).concat(this.$attrSelector, `],
                                    display: flex;
                                }
                            }
                        `) : a += `
.p-paginator-`.concat(x, ` {
    display: none;
}
@media screen `).concat(v, " and (max-width: ").concat(x, `) {
    .p-paginator-`).concat(x, ` {
        display: flex;
    }

    .p-paginator-default{
        display: none;
    }
}
                    `);
        }
        this.styleElement.innerHTML = a;
      }
    },
    hasBreakpoints: function() {
      return tt(this.template) === "object";
    },
    getAriaLabel: function(t) {
      return this.$primevue.config.locale.aria ? this.$primevue.config.locale.aria[t] : void 0;
    }
  },
  computed: {
    templateItems: function() {
      var t = {};
      if (this.hasBreakpoints()) {
        t = this.template, t.default || (t.default = "FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown");
        for (var n in t)
          t[n] = this.template[n].split(" ").map(function(a) {
            return a.trim();
          });
        return t;
      }
      return t.default = this.template.split(" ").map(function(a) {
        return a.trim();
      }), t;
    },
    page: function() {
      return Math.floor(this.d_first / this.d_rows);
    },
    pageCount: function() {
      return Math.ceil(this.totalRecords / this.d_rows);
    },
    isFirstPage: function() {
      return this.page === 0;
    },
    isLastPage: function() {
      return this.page === this.pageCount - 1;
    },
    calculatePageLinkBoundaries: function() {
      var t = this.pageCount, n = Math.min(this.pageLinkSize, t), a = Math.max(0, Math.ceil(this.page - n / 2)), o = Math.min(t - 1, a + n - 1), r = this.pageLinkSize - (o - a + 1);
      return a = Math.max(0, a - r), [a, o];
    },
    pageLinks: function() {
      for (var t = [], n = this.calculatePageLinkBoundaries, a = n[0], o = n[1], r = a; r <= o; r++)
        t.push(r + 1);
      return t;
    },
    currentState: function() {
      return {
        page: this.page,
        first: this.d_first,
        rows: this.d_rows
      };
    },
    empty: function() {
      return this.pageCount === 0;
    },
    currentPage: function() {
      return this.pageCount > 0 ? this.page + 1 : 0;
    },
    last: function() {
      return Math.min(this.d_first + this.rows, this.totalRecords);
    }
  },
  components: {
    CurrentPageReport: Ft,
    FirstPageLink: Mt,
    LastPageLink: Ut,
    NextPageLink: Vt,
    PageLinks: _t,
    PrevPageLink: Kt,
    RowsPerPageDropdown: Wt,
    JumpToPageDropdown: jt,
    JumpToPageInput: Nt
  }
};
function ca(e, t, n, a, o, r) {
  var i = F("FirstPageLink"), p = F("PrevPageLink"), g = F("NextPageLink"), h = F("LastPageLink"), S = F("PageLinks"), x = F("CurrentPageReport"), v = F("RowsPerPageDropdown"), P = F("JumpToPageDropdown"), z = F("JumpToPageInput");
  return e.alwaysShow || r.pageLinks && r.pageLinks.length > 1 ? (l(), c("nav", bn(f({
    key: 0
  }, e.ptmi("paginatorContainer"))), [(l(!0), c(J, null, ke(r.templateItems, function(O, M) {
    return l(), c("div", f({
      key: M,
      ref_for: !0,
      ref: "paginator",
      class: e.cx("paginator", {
        key: M
      })
    }, {
      ref_for: !0
    }, e.ptm("root")), [e.$slots.container ? D(e.$slots, "container", {
      key: 0,
      first: o.d_first + 1,
      last: r.last,
      rows: o.d_rows,
      page: r.page,
      pageCount: r.pageCount,
      pageLinks: r.pageLinks,
      totalRecords: e.totalRecords,
      firstPageCallback: r.changePageToFirst,
      lastPageCallback: r.changePageToLast,
      prevPageCallback: r.changePageToPrev,
      nextPageCallback: r.changePageToNext,
      rowChangeCallback: r.onRowChange,
      changePageCallback: r.changePage
    }) : (l(), c(J, {
      key: 1
    }, [e.$slots.start ? (l(), c("div", f({
      key: 0,
      class: e.cx("contentStart")
    }, {
      ref_for: !0
    }, e.ptm("contentStart")), [D(e.$slots, "start", {
      state: r.currentState
    })], 16)) : C("", !0), b("div", f({
      class: e.cx("content")
    }, {
      ref_for: !0
    }, e.ptm("content")), [(l(!0), c(J, null, ke(O, function(B) {
      return l(), c(J, {
        key: B
      }, [B === "FirstPageLink" ? (l(), k(i, {
        key: 0,
        "aria-label": r.getAriaLabel("firstPageLabel"),
        template: e.$slots.firsticon || e.$slots.firstpagelinkicon,
        onClick: t[0] || (t[0] = function(A) {
          return r.changePageToFirst(A);
        }),
        disabled: r.isFirstPage || r.empty,
        unstyled: e.unstyled,
        pt: e.pt
      }, null, 8, ["aria-label", "template", "disabled", "unstyled", "pt"])) : B === "PrevPageLink" ? (l(), k(p, {
        key: 1,
        "aria-label": r.getAriaLabel("prevPageLabel"),
        template: e.$slots.previcon || e.$slots.prevpagelinkicon,
        onClick: t[1] || (t[1] = function(A) {
          return r.changePageToPrev(A);
        }),
        disabled: r.isFirstPage || r.empty,
        unstyled: e.unstyled,
        pt: e.pt
      }, null, 8, ["aria-label", "template", "disabled", "unstyled", "pt"])) : B === "NextPageLink" ? (l(), k(g, {
        key: 2,
        "aria-label": r.getAriaLabel("nextPageLabel"),
        template: e.$slots.nexticon || e.$slots.nextpagelinkicon,
        onClick: t[2] || (t[2] = function(A) {
          return r.changePageToNext(A);
        }),
        disabled: r.isLastPage || r.empty,
        unstyled: e.unstyled,
        pt: e.pt
      }, null, 8, ["aria-label", "template", "disabled", "unstyled", "pt"])) : B === "LastPageLink" ? (l(), k(h, {
        key: 3,
        "aria-label": r.getAriaLabel("lastPageLabel"),
        template: e.$slots.lasticon || e.$slots.lastpagelinkicon,
        onClick: t[3] || (t[3] = function(A) {
          return r.changePageToLast(A);
        }),
        disabled: r.isLastPage || r.empty,
        unstyled: e.unstyled,
        pt: e.pt
      }, null, 8, ["aria-label", "template", "disabled", "unstyled", "pt"])) : B === "PageLinks" ? (l(), k(S, {
        key: 4,
        "aria-label": r.getAriaLabel("pageLabel"),
        value: r.pageLinks,
        page: r.page,
        onClick: t[4] || (t[4] = function(A) {
          return r.changePageLink(A);
        }),
        unstyled: e.unstyled,
        pt: e.pt
      }, null, 8, ["aria-label", "value", "page", "unstyled", "pt"])) : B === "CurrentPageReport" ? (l(), k(x, {
        key: 5,
        "aria-live": "polite",
        template: e.currentPageReportTemplate,
        currentPage: r.currentPage,
        page: r.page,
        pageCount: r.pageCount,
        first: o.d_first,
        rows: o.d_rows,
        totalRecords: e.totalRecords,
        unstyled: e.unstyled,
        pt: e.pt
      }, null, 8, ["template", "currentPage", "page", "pageCount", "first", "rows", "totalRecords", "unstyled", "pt"])) : B === "RowsPerPageDropdown" && e.rowsPerPageOptions ? (l(), k(v, {
        key: 6,
        "aria-label": r.getAriaLabel("rowsPerPageLabel"),
        rows: o.d_rows,
        options: e.rowsPerPageOptions,
        onRowsChange: t[5] || (t[5] = function(A) {
          return r.onRowChange(A);
        }),
        disabled: r.empty,
        templates: e.$slots,
        unstyled: e.unstyled,
        pt: e.pt
      }, null, 8, ["aria-label", "rows", "options", "disabled", "templates", "unstyled", "pt"])) : B === "JumpToPageDropdown" ? (l(), k(P, {
        key: 7,
        "aria-label": r.getAriaLabel("jumpToPageDropdownLabel"),
        page: r.page,
        pageCount: r.pageCount,
        onPageChange: t[6] || (t[6] = function(A) {
          return r.changePage(A);
        }),
        disabled: r.empty,
        templates: e.$slots,
        unstyled: e.unstyled,
        pt: e.pt
      }, null, 8, ["aria-label", "page", "pageCount", "disabled", "templates", "unstyled", "pt"])) : B === "JumpToPageInput" ? (l(), k(z, {
        key: 8,
        page: r.currentPage,
        onPageChange: t[7] || (t[7] = function(A) {
          return r.changePage(A);
        }),
        disabled: r.empty,
        unstyled: e.unstyled,
        pt: e.pt
      }, null, 8, ["page", "disabled", "unstyled", "pt"])) : C("", !0)], 64);
    }), 128))], 16), e.$slots.end ? (l(), c("div", f({
      key: 1,
      class: e.cx("contentEnd")
    }, {
      ref_for: !0
    }, e.ptm("contentEnd")), [D(e.$slots, "end", {
      state: r.currentState
    })], 16)) : C("", !0)], 64))], 16);
  }), 128))], 16)) : C("", !0);
}
Gt.render = ca;
function he(e) {
  return !!e && typeof e == "object" && !Array.isArray(e);
}
function da(e, t) {
  return e;
}
function fa(e, t, n) {
  if (!t) return null;
  const a = he(e) ? e : {}, o = [
    a,
    he(a.data) ? a.data : null,
    he(a.payload) ? a.payload : null,
    he(a.detail) ? a.detail : null
  ].filter(Boolean);
  for (const r of o) {
    if (r.event !== "component.meta.changed") continue;
    const i = String(r.component_id || ""), p = String(a.topic || r.topic || "");
    if (!(i && i !== t) && !(!i && p !== `component.${t}`))
      return {
        event: "component.meta.changed",
        component_id: i || t,
        meta: da(he(r.meta) ? r.meta : {}),
        deleted: Array.isArray(r.deleted) ? r.deleted.map(String) : []
      };
  }
  return null;
}
function ma(e, t, n) {
  if (!e) return null;
  const a = kn(`component.${e}`, (o) => {
    const r = fa(o, e);
    r && t(r);
  });
  return typeof a == "function" ? a : null;
}
function ga(e) {
  if (!e) return null;
  let t;
  if (typeof e == "number")
    t = e;
  else {
    const n = e.trim();
    if (/^\d+$/.test(n))
      t = Number(n);
    else {
      const a = Date.parse(n);
      return Number.isNaN(a) ? null : a;
    }
  }
  return Number.isFinite(t) ? t < 1e12 ? t * 1e3 : t : null;
}
function ha(e) {
  const t = ga(e);
  return t === null ? "" : new Date(t).toLocaleString(void 0, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}
var ba = ee.extend({
  name: "focustrap-directive"
}), va = sn.extend({
  style: ba
});
function Se(e) {
  "@babel/helpers - typeof";
  return Se = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, Se(e);
}
function bt(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var a = Object.getOwnPropertySymbols(e);
    t && (a = a.filter(function(o) {
      return Object.getOwnPropertyDescriptor(e, o).enumerable;
    })), n.push.apply(n, a);
  }
  return n;
}
function vt(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? bt(Object(n), !0).forEach(function(a) {
      ya(e, a, n[a]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : bt(Object(n)).forEach(function(a) {
      Object.defineProperty(e, a, Object.getOwnPropertyDescriptor(n, a));
    });
  }
  return e;
}
function ya(e, t, n) {
  return (t = wa(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function wa(e) {
  var t = xa(e, "string");
  return Se(t) == "symbol" ? t : t + "";
}
function xa(e, t) {
  if (Se(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var a = n.call(e, t);
    if (Se(a) != "object") return a;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var ka = va.extend("focustrap", {
  mounted: function(t, n) {
    var a = n.value || {}, o = a.disabled;
    o || (this.createHiddenFocusableElements(t, n), this.bind(t, n), this.autoElementFocus(t, n)), t.setAttribute("data-pd-focustrap", !0), this.$el = t;
  },
  updated: function(t, n) {
    var a = n.value || {}, o = a.disabled;
    o && this.unbind(t);
  },
  unmounted: function(t) {
    this.unbind(t);
  },
  methods: {
    getComputedSelector: function(t) {
      return ':not(.p-hidden-focusable):not([data-p-hidden-focusable="true"])'.concat(t ?? "");
    },
    bind: function(t, n) {
      var a = this, o = n.value || {}, r = o.onFocusIn, i = o.onFocusOut;
      t.$_pfocustrap_mutationobserver = new MutationObserver(function(p) {
        p.forEach(function(g) {
          if (g.type === "childList" && !t.contains(document.activeElement)) {
            var h = function(x) {
              var v = ut(x) ? ut(x, a.getComputedSelector(t.$_pfocustrap_focusableselector)) ? x : ge(t, a.getComputedSelector(t.$_pfocustrap_focusableselector)) : ge(x);
              return We(v) ? v : x.nextSibling && h(x.nextSibling);
            };
            ye(h(g.nextSibling));
          }
        });
      }), t.$_pfocustrap_mutationobserver.disconnect(), t.$_pfocustrap_mutationobserver.observe(t, {
        childList: !0
      }), t.$_pfocustrap_focusinlistener = function(p) {
        return r && r(p);
      }, t.$_pfocustrap_focusoutlistener = function(p) {
        return i && i(p);
      }, t.addEventListener("focusin", t.$_pfocustrap_focusinlistener), t.addEventListener("focusout", t.$_pfocustrap_focusoutlistener);
    },
    unbind: function(t) {
      t.$_pfocustrap_mutationobserver && t.$_pfocustrap_mutationobserver.disconnect(), t.$_pfocustrap_focusinlistener && t.removeEventListener("focusin", t.$_pfocustrap_focusinlistener) && (t.$_pfocustrap_focusinlistener = null), t.$_pfocustrap_focusoutlistener && t.removeEventListener("focusout", t.$_pfocustrap_focusoutlistener) && (t.$_pfocustrap_focusoutlistener = null);
    },
    autoFocus: function(t) {
      this.autoElementFocus(this.$el, {
        value: vt(vt({}, t), {}, {
          autoFocus: !0
        })
      });
    },
    autoElementFocus: function(t, n) {
      var a = n.value || {}, o = a.autoFocusSelector, r = o === void 0 ? "" : o, i = a.firstFocusableSelector, p = i === void 0 ? "" : i, g = a.autoFocus, h = g === void 0 ? !1 : g, S = ge(t, "[autofocus]".concat(this.getComputedSelector(r)));
      h && !S && (S = ge(t, this.getComputedSelector(p))), ye(S);
    },
    onFirstHiddenElementFocus: function(t) {
      var n, a = t.currentTarget, o = t.relatedTarget, r = o === a.$_pfocustrap_lasthiddenfocusableelement || !((n = this.$el) !== null && n !== void 0 && n.contains(o)) ? ge(a.parentElement, this.getComputedSelector(a.$_pfocustrap_focusableselector)) : a.$_pfocustrap_lasthiddenfocusableelement;
      ye(r);
    },
    onLastHiddenElementFocus: function(t) {
      var n, a = t.currentTarget, o = t.relatedTarget, r = o === a.$_pfocustrap_firsthiddenfocusableelement || !((n = this.$el) !== null && n !== void 0 && n.contains(o)) ? on(a.parentElement, this.getComputedSelector(a.$_pfocustrap_focusableselector)) : a.$_pfocustrap_firsthiddenfocusableelement;
      ye(r);
    },
    createHiddenFocusableElements: function(t, n) {
      var a = this, o = n.value || {}, r = o.tabIndex, i = r === void 0 ? 0 : r, p = o.firstFocusableSelector, g = p === void 0 ? "" : p, h = o.lastFocusableSelector, S = h === void 0 ? "" : h, x = function(O) {
        return ln("span", {
          class: "p-hidden-accessible p-hidden-focusable",
          tabIndex: i,
          role: "presentation",
          "aria-hidden": !0,
          "data-p-hidden-accessible": !0,
          "data-p-hidden-focusable": !0,
          onFocus: O?.bind(a)
        });
      }, v = x(this.onFirstHiddenElementFocus), P = x(this.onLastHiddenElementFocus);
      v.$_pfocustrap_lasthiddenfocusableelement = P, v.$_pfocustrap_focusableselector = g, v.setAttribute("data-pc-section", "firstfocusableelement"), P.$_pfocustrap_firsthiddenfocusableelement = v, P.$_pfocustrap_focusableselector = S, P.setAttribute("data-pc-section", "lastfocusableelement"), t.prepend(v), t.append(P);
    }
  }
});
function Pa() {
  un({
    variableName: Ct("scrollbar.width").name
  });
}
function Ca() {
  pn({
    variableName: Ct("scrollbar.width").name
  });
}
var $a = `
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
`, Sa = {
  mask: function(t) {
    var n = t.position, a = t.modal;
    return {
      position: "fixed",
      height: "100%",
      width: "100%",
      left: 0,
      top: 0,
      display: "flex",
      justifyContent: n === "left" ? "flex-start" : n === "right" ? "flex-end" : "center",
      alignItems: n === "top" ? "flex-start" : n === "bottom" ? "flex-end" : "center",
      pointerEvents: a ? "auto" : "none"
    };
  },
  root: {
    pointerEvents: "auto"
  }
}, Ia = {
  mask: function(t) {
    var n = t.instance, a = t.props, o = ["left", "right", "top", "bottom"], r = o.find(function(i) {
      return i === a.position;
    });
    return ["p-drawer-mask", {
      "p-overlay-mask p-overlay-mask-enter-active": a.modal,
      "p-drawer-open": n.containerVisible,
      "p-drawer-full": n.fullScreen
    }, r ? "p-drawer-".concat(r) : ""];
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
}, La = ee.extend({
  name: "drawer",
  style: $a,
  classes: Ia,
  inlineStyles: Sa
}), Aa = {
  name: "BaseDrawer",
  extends: N,
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
  style: La,
  provide: function() {
    return {
      $pcDrawer: this,
      $parentInstance: this
    };
  }
};
function Ie(e) {
  "@babel/helpers - typeof";
  return Ie = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, Ie(e);
}
function Ke(e, t, n) {
  return (t = Ta(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Ta(e) {
  var t = Da(e, "string");
  return Ie(t) == "symbol" ? t : t + "";
}
function Da(e, t) {
  if (Ie(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var a = n.call(e, t);
    if (Ie(a) != "object") return a;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var Jt = {
  name: "Drawer",
  extends: Aa,
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
    this.disableDocumentSettings(), this.mask && this.autoZIndex && Ve.clear(this.mask), this.container = null, this.mask = null;
  },
  methods: {
    hide: function() {
      this.$emit("update:visible", !1);
    },
    onEnter: function() {
      this.$emit("show"), this.focus(), this.bindDocumentKeyDownListener(), this.autoZIndex && Ve.set("modal", this.mask, this.baseZIndex || this.$primevue.config.zIndex.modal);
    },
    onAfterEnter: function() {
      this.enableDocumentSettings(), this.$emit("after-show");
    },
    onBeforeLeave: function() {
      this.modal && !this.isUnstyled && dn(this.mask, "p-overlay-mask-leave-active"), this.$emit("before-hide");
    },
    onLeave: function() {
      this.$emit("hide");
    },
    onAfterLeave: function() {
      this.autoZIndex && Ve.clear(this.mask), this.unbindDocumentKeyDownListener(), this.containerVisible = !1, this.disableDocumentSettings(), this.$emit("after-hide");
    },
    onMaskClick: function(t) {
      this.dismissable && this.modal && this.mask === t.target && this.hide();
    },
    focus: function() {
      var t = function(o) {
        return o && o.querySelector("[autofocus]");
      }, n = this.$slots.header && t(this.headerContainer);
      n || (n = this.$slots.default && t(this.container), n || (n = this.$slots.footer && t(this.footerContainer), n || (n = this.closeButton))), n && ye(n);
    },
    enableDocumentSettings: function() {
      this.dismissable && !this.modal && this.bindOutsideClickListener(), this.blockScroll && Pa();
    },
    disableDocumentSettings: function() {
      this.unbindOutsideClickListener(), this.blockScroll && Ca();
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
      return Fe(Ke(Ke(Ke({
        "full-screen": this.position === "full"
      }, this.position, this.position), "open", this.containerVisible), "modal", this.modal));
    }
  },
  directives: {
    focustrap: ka
  },
  components: {
    Button: j,
    Portal: cn,
    TimesIcon: rt
  }
}, Ba = ["data-p"], Ea = ["role", "aria-modal", "data-p"];
function za(e, t, n, a, o, r) {
  var i = F("Button"), p = F("Portal"), g = re("focustrap");
  return l(), k(p, null, {
    default: L(function() {
      return [o.containerVisible ? (l(), c("div", f({
        key: 0,
        ref: r.maskRef,
        onMousedown: t[0] || (t[0] = function() {
          return r.onMaskClick && r.onMaskClick.apply(r, arguments);
        }),
        class: e.cx("mask"),
        style: e.sx("mask", !0, {
          position: e.position,
          modal: e.modal
        }),
        "data-p": r.dataP
      }, e.ptm("mask")), [w(St, f({
        name: "p-drawer",
        onEnter: r.onEnter,
        onAfterEnter: r.onAfterEnter,
        onBeforeLeave: r.onBeforeLeave,
        onLeave: r.onLeave,
        onAfterLeave: r.onAfterLeave,
        appear: ""
      }, e.ptm("transition")), {
        default: L(function() {
          return [e.visible ? te((l(), c("div", f({
            key: 0,
            ref: r.containerRef,
            class: e.cx("root"),
            style: e.sx("root"),
            role: e.modal ? "dialog" : "complementary",
            "aria-modal": e.modal ? !0 : void 0,
            "data-p": r.dataP
          }, e.ptmi("root")), [e.$slots.container ? D(e.$slots, "container", {
            key: 0,
            closeCallback: r.hide
          }) : (l(), c(J, {
            key: 1
          }, [b("div", f({
            ref: r.headerContainerRef,
            class: e.cx("header")
          }, e.ptm("header")), [D(e.$slots, "header", {
            class: I(e.cx("title"))
          }, function() {
            return [e.header ? (l(), c("div", f({
              key: 0,
              class: e.cx("title")
            }, e.ptm("title")), T(e.header), 17)) : C("", !0)];
          }), e.showCloseIcon ? D(e.$slots, "closebutton", {
            key: 0,
            closeCallback: r.hide
          }, function() {
            return [w(i, f({
              ref: r.closeButtonRef,
              type: "button",
              class: e.cx("pcCloseButton"),
              "aria-label": r.closeAriaLabel,
              unstyled: e.unstyled,
              onClick: r.hide
            }, e.closeButtonProps, {
              pt: e.ptm("pcCloseButton"),
              "data-pc-group-section": "iconcontainer"
            }), {
              icon: L(function(h) {
                return [D(e.$slots, "closeicon", {}, function() {
                  return [(l(), k(_(e.closeIcon ? "span" : "TimesIcon"), f({
                    class: [e.closeIcon, h.class]
                  }, e.ptm("pcCloseButton").icon), null, 16, ["class"]))];
                })];
              }),
              _: 3
            }, 16, ["class", "aria-label", "unstyled", "onClick", "pt"])];
          }) : C("", !0)], 16), b("div", f({
            ref: r.contentRef,
            class: e.cx("content")
          }, e.ptm("content")), [D(e.$slots, "default")], 16), e.$slots.footer ? (l(), c("div", f({
            key: 0,
            ref: r.footerContainerRef,
            class: e.cx("footer")
          }, e.ptm("footer")), [D(e.$slots, "footer")], 16)) : C("", !0)], 64))], 16, Ea)), [[g]]) : C("", !0)];
        }),
        _: 3
      }, 16, ["onEnter", "onAfterEnter", "onBeforeLeave", "onLeave", "onAfterLeave"])], 16, Ba)) : C("", !0)];
    }),
    _: 3
  });
}
Jt.render = za;
var Oa = `
    .p-message {
        display: grid;
        grid-template-rows: 1fr;
        border-radius: dt('message.border.radius');
        outline-width: dt('message.border.width');
        outline-style: solid;
    }

    .p-message-content-wrapper {
        min-height: 0;
    }

    .p-message-content {
        display: flex;
        align-items: center;
        padding: dt('message.content.padding');
        gap: dt('message.content.gap');
    }

    .p-message-icon {
        flex-shrink: 0;
    }

    .p-message-close-button {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        margin-inline-start: auto;
        overflow: hidden;
        position: relative;
        width: dt('message.close.button.width');
        height: dt('message.close.button.height');
        border-radius: dt('message.close.button.border.radius');
        background: transparent;
        transition:
            background dt('message.transition.duration'),
            color dt('message.transition.duration'),
            outline-color dt('message.transition.duration'),
            box-shadow dt('message.transition.duration'),
            opacity 0.3s;
        outline-color: transparent;
        color: inherit;
        padding: 0;
        border: none;
        cursor: pointer;
        user-select: none;
    }

    .p-message-close-icon {
        font-size: dt('message.close.icon.size');
        width: dt('message.close.icon.size');
        height: dt('message.close.icon.size');
    }

    .p-message-close-button:focus-visible {
        outline-width: dt('message.close.button.focus.ring.width');
        outline-style: dt('message.close.button.focus.ring.style');
        outline-offset: dt('message.close.button.focus.ring.offset');
    }

    .p-message-info {
        background: dt('message.info.background');
        outline-color: dt('message.info.border.color');
        color: dt('message.info.color');
        box-shadow: dt('message.info.shadow');
    }

    .p-message-info .p-message-close-button:focus-visible {
        outline-color: dt('message.info.close.button.focus.ring.color');
        box-shadow: dt('message.info.close.button.focus.ring.shadow');
    }

    .p-message-info .p-message-close-button:hover {
        background: dt('message.info.close.button.hover.background');
    }

    .p-message-info.p-message-outlined {
        color: dt('message.info.outlined.color');
        outline-color: dt('message.info.outlined.border.color');
    }

    .p-message-info.p-message-simple {
        color: dt('message.info.simple.color');
    }

    .p-message-success {
        background: dt('message.success.background');
        outline-color: dt('message.success.border.color');
        color: dt('message.success.color');
        box-shadow: dt('message.success.shadow');
    }

    .p-message-success .p-message-close-button:focus-visible {
        outline-color: dt('message.success.close.button.focus.ring.color');
        box-shadow: dt('message.success.close.button.focus.ring.shadow');
    }

    .p-message-success .p-message-close-button:hover {
        background: dt('message.success.close.button.hover.background');
    }

    .p-message-success.p-message-outlined {
        color: dt('message.success.outlined.color');
        outline-color: dt('message.success.outlined.border.color');
    }

    .p-message-success.p-message-simple {
        color: dt('message.success.simple.color');
    }

    .p-message-warn {
        background: dt('message.warn.background');
        outline-color: dt('message.warn.border.color');
        color: dt('message.warn.color');
        box-shadow: dt('message.warn.shadow');
    }

    .p-message-warn .p-message-close-button:focus-visible {
        outline-color: dt('message.warn.close.button.focus.ring.color');
        box-shadow: dt('message.warn.close.button.focus.ring.shadow');
    }

    .p-message-warn .p-message-close-button:hover {
        background: dt('message.warn.close.button.hover.background');
    }

    .p-message-warn.p-message-outlined {
        color: dt('message.warn.outlined.color');
        outline-color: dt('message.warn.outlined.border.color');
    }

    .p-message-warn.p-message-simple {
        color: dt('message.warn.simple.color');
    }

    .p-message-error {
        background: dt('message.error.background');
        outline-color: dt('message.error.border.color');
        color: dt('message.error.color');
        box-shadow: dt('message.error.shadow');
    }

    .p-message-error .p-message-close-button:focus-visible {
        outline-color: dt('message.error.close.button.focus.ring.color');
        box-shadow: dt('message.error.close.button.focus.ring.shadow');
    }

    .p-message-error .p-message-close-button:hover {
        background: dt('message.error.close.button.hover.background');
    }

    .p-message-error.p-message-outlined {
        color: dt('message.error.outlined.color');
        outline-color: dt('message.error.outlined.border.color');
    }

    .p-message-error.p-message-simple {
        color: dt('message.error.simple.color');
    }

    .p-message-secondary {
        background: dt('message.secondary.background');
        outline-color: dt('message.secondary.border.color');
        color: dt('message.secondary.color');
        box-shadow: dt('message.secondary.shadow');
    }

    .p-message-secondary .p-message-close-button:focus-visible {
        outline-color: dt('message.secondary.close.button.focus.ring.color');
        box-shadow: dt('message.secondary.close.button.focus.ring.shadow');
    }

    .p-message-secondary .p-message-close-button:hover {
        background: dt('message.secondary.close.button.hover.background');
    }

    .p-message-secondary.p-message-outlined {
        color: dt('message.secondary.outlined.color');
        outline-color: dt('message.secondary.outlined.border.color');
    }

    .p-message-secondary.p-message-simple {
        color: dt('message.secondary.simple.color');
    }

    .p-message-contrast {
        background: dt('message.contrast.background');
        outline-color: dt('message.contrast.border.color');
        color: dt('message.contrast.color');
        box-shadow: dt('message.contrast.shadow');
    }

    .p-message-contrast .p-message-close-button:focus-visible {
        outline-color: dt('message.contrast.close.button.focus.ring.color');
        box-shadow: dt('message.contrast.close.button.focus.ring.shadow');
    }

    .p-message-contrast .p-message-close-button:hover {
        background: dt('message.contrast.close.button.hover.background');
    }

    .p-message-contrast.p-message-outlined {
        color: dt('message.contrast.outlined.color');
        outline-color: dt('message.contrast.outlined.border.color');
    }

    .p-message-contrast.p-message-simple {
        color: dt('message.contrast.simple.color');
    }

    .p-message-text {
        font-size: dt('message.text.font.size');
        font-weight: dt('message.text.font.weight');
    }

    .p-message-icon {
        font-size: dt('message.icon.size');
        width: dt('message.icon.size');
        height: dt('message.icon.size');
    }

    .p-message-sm .p-message-content {
        padding: dt('message.content.sm.padding');
    }

    .p-message-sm .p-message-text {
        font-size: dt('message.text.sm.font.size');
    }

    .p-message-sm .p-message-icon {
        font-size: dt('message.icon.sm.size');
        width: dt('message.icon.sm.size');
        height: dt('message.icon.sm.size');
    }

    .p-message-sm .p-message-close-icon {
        font-size: dt('message.close.icon.sm.size');
        width: dt('message.close.icon.sm.size');
        height: dt('message.close.icon.sm.size');
    }

    .p-message-lg .p-message-content {
        padding: dt('message.content.lg.padding');
    }

    .p-message-lg .p-message-text {
        font-size: dt('message.text.lg.font.size');
    }

    .p-message-lg .p-message-icon {
        font-size: dt('message.icon.lg.size');
        width: dt('message.icon.lg.size');
        height: dt('message.icon.lg.size');
    }

    .p-message-lg .p-message-close-icon {
        font-size: dt('message.close.icon.lg.size');
        width: dt('message.close.icon.lg.size');
        height: dt('message.close.icon.lg.size');
    }

    .p-message-outlined {
        background: transparent;
        outline-width: dt('message.outlined.border.width');
    }

    .p-message-simple {
        background: transparent;
        outline-color: transparent;
        box-shadow: none;
    }

    .p-message-simple .p-message-content {
        padding: dt('message.simple.content.padding');
    }

    .p-message-outlined .p-message-close-button:hover,
    .p-message-simple .p-message-close-button:hover {
        background: transparent;
    }

    .p-message-enter-active {
        animation: p-animate-message-enter 0.3s ease-out forwards;
        overflow: hidden;
    }

    .p-message-leave-active {
        animation: p-animate-message-leave 0.15s ease-in forwards;
        overflow: hidden;
    }

    @keyframes p-animate-message-enter {
        from {
            opacity: 0;
            grid-template-rows: 0fr;
        }
        to {
            opacity: 1;
            grid-template-rows: 1fr;
        }
    }

    @keyframes p-animate-message-leave {
        from {
            opacity: 1;
            grid-template-rows: 1fr;
        }
        to {
            opacity: 0;
            margin: 0;
            grid-template-rows: 0fr;
        }
    }
`, Ra = {
  root: function(t) {
    var n = t.props;
    return ["p-message p-component p-message-" + n.severity, {
      "p-message-outlined": n.variant === "outlined",
      "p-message-simple": n.variant === "simple",
      "p-message-sm": n.size === "small",
      "p-message-lg": n.size === "large"
    }];
  },
  contentWrapper: "p-message-content-wrapper",
  content: "p-message-content",
  icon: "p-message-icon",
  text: "p-message-text",
  closeButton: "p-message-close-button",
  closeIcon: "p-message-close-icon"
}, Fa = ee.extend({
  name: "message",
  style: Oa,
  classes: Ra
}), Ma = {
  name: "BaseMessage",
  extends: N,
  props: {
    severity: {
      type: String,
      default: "info"
    },
    closable: {
      type: Boolean,
      default: !1
    },
    life: {
      type: Number,
      default: null
    },
    icon: {
      type: String,
      default: void 0
    },
    closeIcon: {
      type: String,
      default: void 0
    },
    closeButtonProps: {
      type: null,
      default: null
    },
    size: {
      type: String,
      default: null
    },
    variant: {
      type: String,
      default: null
    }
  },
  style: Fa,
  provide: function() {
    return {
      $pcMessage: this,
      $parentInstance: this
    };
  }
};
function Le(e) {
  "@babel/helpers - typeof";
  return Le = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, Le(e);
}
function yt(e, t, n) {
  return (t = ja(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function ja(e) {
  var t = Na(e, "string");
  return Le(t) == "symbol" ? t : t + "";
}
function Na(e, t) {
  if (Le(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var a = n.call(e, t);
    if (Le(a) != "object") return a;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var Ht = {
  name: "Message",
  extends: Ma,
  inheritAttrs: !1,
  emits: ["close", "life-end"],
  timeout: null,
  data: function() {
    return {
      visible: !0
    };
  },
  mounted: function() {
    var t = this;
    this.life && setTimeout(function() {
      t.visible = !1, t.$emit("life-end");
    }, this.life);
  },
  methods: {
    close: function(t) {
      this.visible = !1, this.$emit("close", t);
    }
  },
  computed: {
    closeAriaLabel: function() {
      return this.$primevue.config.locale.aria ? this.$primevue.config.locale.aria.close : void 0;
    },
    dataP: function() {
      return Fe(yt(yt({
        outlined: this.variant === "outlined",
        simple: this.variant === "simple"
      }, this.severity, this.severity), this.size, this.size));
    }
  },
  directives: {
    ripple: pe
  },
  components: {
    TimesIcon: rt
  }
};
function Ae(e) {
  "@babel/helpers - typeof";
  return Ae = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, Ae(e);
}
function wt(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var a = Object.getOwnPropertySymbols(e);
    t && (a = a.filter(function(o) {
      return Object.getOwnPropertyDescriptor(e, o).enumerable;
    })), n.push.apply(n, a);
  }
  return n;
}
function xt(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? wt(Object(n), !0).forEach(function(a) {
      Ua(e, a, n[a]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : wt(Object(n)).forEach(function(a) {
      Object.defineProperty(e, a, Object.getOwnPropertyDescriptor(n, a));
    });
  }
  return e;
}
function Ua(e, t, n) {
  return (t = Va(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Va(e) {
  var t = _a(e, "string");
  return Ae(t) == "symbol" ? t : t + "";
}
function _a(e, t) {
  if (Ae(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var a = n.call(e, t);
    if (Ae(a) != "object") return a;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var Ka = ["data-p"], Wa = ["data-p"], Ga = ["data-p"], Ja = ["aria-label", "data-p"], Ha = ["data-p"];
function Za(e, t, n, a, o, r) {
  var i = F("TimesIcon"), p = re("ripple");
  return l(), k(St, f({
    name: "p-message",
    appear: ""
  }, e.ptmi("transition")), {
    default: L(function() {
      return [o.visible ? (l(), c("div", f({
        key: 0,
        class: e.cx("root"),
        role: "alert",
        "aria-live": "assertive",
        "aria-atomic": "true",
        "data-p": r.dataP
      }, e.ptm("root")), [b("div", f({
        class: e.cx("contentWrapper")
      }, e.ptm("contentWrapper")), [e.$slots.container ? D(e.$slots, "container", {
        key: 0,
        closeCallback: r.close
      }) : (l(), c("div", f({
        key: 1,
        class: e.cx("content"),
        "data-p": r.dataP
      }, e.ptm("content")), [D(e.$slots, "icon", {
        class: I(e.cx("icon"))
      }, function() {
        return [(l(), k(_(e.icon ? "span" : null), f({
          class: [e.cx("icon"), e.icon],
          "data-p": r.dataP
        }, e.ptm("icon")), null, 16, ["class", "data-p"]))];
      }), e.$slots.default ? (l(), c("div", f({
        key: 0,
        class: e.cx("text"),
        "data-p": r.dataP
      }, e.ptm("text")), [D(e.$slots, "default")], 16, Ga)) : C("", !0), e.closable ? te((l(), c("button", f({
        key: 1,
        class: e.cx("closeButton"),
        "aria-label": r.closeAriaLabel,
        type: "button",
        onClick: t[0] || (t[0] = function(g) {
          return r.close(g);
        }),
        "data-p": r.dataP
      }, xt(xt({}, e.closeButtonProps), e.ptm("closeButton"))), [D(e.$slots, "closeicon", {}, function() {
        return [e.closeIcon ? (l(), c("i", f({
          key: 0,
          class: [e.cx("closeIcon"), e.closeIcon],
          "data-p": r.dataP
        }, e.ptm("closeIcon")), null, 16, Ha)) : (l(), k(i, f({
          key: 1,
          class: [e.cx("closeIcon"), e.closeIcon],
          "data-p": r.dataP
        }, e.ptm("closeIcon")), null, 16, ["class", "data-p"]))];
      })], 16, Ja)), [[p]]) : C("", !0)], 16, Wa))], 16)], 16, Ka)) : C("", !0)];
    }),
    _: 3
  }, 16);
}
Ht.render = Za;
function ue(e) {
  return e === "failed" ? "error" : e || "uploaded";
}
function qa(e) {
  return ue(e.status) === "error";
}
function Xa(e) {
  switch (ue(e)) {
    case "completed":
      return "success";
    case "error":
      return "danger";
    case "processing":
      return "info";
    default:
      return "warn";
  }
}
function Qa(e) {
  const t = ue(e);
  return t.charAt(0).toUpperCase() + t.slice(1);
}
function se(e) {
  return (e.filename || "").trim() || "Untitled upload";
}
function nt(e) {
  const t = e || "";
  return t.startsWith("image/") ? "tabler:photo" : t === "application/pdf" ? "tabler:file-type-pdf" : t.includes("word") || t.includes("opendocument.text") || t === "application/rtf" ? "tabler:file-type-doc" : t.includes("sheet") || t.includes("excel") || t.includes("spreadsheet") || t === "text/csv" ? "tabler:file-type-xls" : t.includes("presentation") || t.includes("powerpoint") ? "tabler:file-type-ppt" : t === "application/epub+zip" ? "tabler:book" : t.startsWith("text/") || t === "application/json" || t === "application/xml" ? "tabler:file-text" : "tabler:file";
}
function Zt(e) {
  const t = e.mime_type || "";
  if (t.startsWith("image/")) return t.slice(6).toUpperCase() + " image";
  if (t === "application/pdf") return "PDF";
  if (t.includes("word") || t.includes("opendocument.text")) return "Word";
  if (t.includes("sheet") || t.includes("excel") || t.includes("spreadsheet")) return "Spreadsheet";
  if (t.includes("presentation") || t.includes("powerpoint")) return "Presentation";
  if (t === "application/rtf") return "Rich text";
  if (t === "application/epub+zip") return "EPUB";
  if (t === "text/markdown") return "Markdown";
  if (t === "text/csv") return "CSV";
  if (t === "application/json") return "JSON";
  if (t.startsWith("text/")) return "Text";
  const n = (e.filename || "").split(".").pop();
  return n && n !== e.filename ? n.toUpperCase() : t || "File";
}
function Te(e) {
  if (!e) return "0 B";
  const t = ["B", "KB", "MB", "GB"], n = Math.min(Math.floor(Math.log(e) / Math.log(1024)), t.length - 1);
  return `${(e / Math.pow(1024, n)).toFixed(n ? 1 : 0)} ${t[n]}`;
}
function kt(e) {
  let t = e.trim().replace(/^[\w.]+:[\w.]+:\d+:\s*/, "");
  return t = t.replace(/(\d{4,})\s*bytes/g, (n, a) => Te(Number(a))), t = t.replace(/\(max\s+(\d{4,})\)/g, (n, a) => `(max ${Te(Number(a))})`), t && t.charAt(0).toUpperCase() + t.slice(1);
}
const Ya = ["image/", "audio/", "video/", "text/"], eo = /* @__PURE__ */ new Set([
  "application/pdf",
  "application/json",
  "application/xml",
  "application/javascript",
  "application/x-yaml",
  "application/sql",
  "application/xhtml+xml"
]);
function Re(e) {
  const t = (e || "").toLowerCase();
  return Ya.some((n) => t.startsWith(n)) || eo.has(t);
}
function qt(e) {
  return ue(e.status) === "completed";
}
const to = /* @__PURE__ */ new Set(["completed", "error"]);
function no(e) {
  return !to.has(ue(e.status));
}
function ne(e) {
  return e.role === "primary" && (e.kind === "markdown" || e.mime_type === "text/markdown");
}
function we(e) {
  return ne(e) ? "Markdown" : e.role === "extracted-image" ? e.label || "Image" : e.label || e.role || e.kind || e.artifact_id;
}
function ro(e) {
  const t = typeof e.metadata?.width == "number" && typeof e.metadata?.height == "number" ? `${e.metadata.width}×${e.metadata.height}` : null;
  return [
    ne(e) ? "Converted markdown" : e.role === "extracted-image" ? "Extracted image" : e.kind,
    e.mime_type,
    e.size ? Te(e.size) : null,
    t,
    e.occurrence_count && e.occurrence_count > 1 ? `${e.occurrence_count} occurrences` : null
  ].filter(Boolean).join(" · ");
}
function ao(e) {
  const t = (e || "").toLowerCase();
  return t.startsWith("text/") || t.includes("markdown");
}
const oo = {
  key: 0,
  class: "kx-side"
}, io = { class: "kx-pv-head" }, so = { class: "kx-ficon" }, lo = { class: "kx-pv-id" }, po = ["title"], uo = {
  key: 0,
  class: "kx-uuid"
}, co = { class: "kx-pv-sub" }, fo = { class: "kx-views" }, mo = ["content-type", "source-url", "filename", "alt"], go = { class: "kx-parts-head" }, ho = { class: "kx-parts-range" }, bo = { class: "kx-parts-pager" }, vo = { class: "kx-parts-pageno" }, yo = {
  id: "uploads-extracted-parts",
  class: "kx-parts-list",
  role: "region",
  "aria-label": "Extracted parts"
}, wo = {
  key: 0,
  class: "kx-part-loading"
}, xo = /* @__PURE__ */ It({
  __name: "UploadPreviewDrawer",
  props: {
    preview: {},
    artifactView: {},
    busyAction: { type: Boolean },
    partsExpanded: { type: Boolean },
    currentArtifacts: {},
    partsTotal: {},
    partsPage: {},
    partsPages: {},
    partsRangeStart: {},
    partsRangeEnd: {},
    hasPrimary: { type: Boolean },
    artifactsLoading: { type: Boolean },
    activePreviewSource: { type: Function },
    downloadActive: { type: Function },
    openActive: { type: Function },
    closePreview: { type: Function },
    viewOriginal: { type: Function },
    viewPrimary: { type: Function },
    viewArtifact: { type: Function },
    gotoPartsPage: { type: Function }
  },
  emits: ["update:partsExpanded"],
  setup(e, { emit: t }) {
    const n = t;
    return (a, o) => (l(), k(s(Jt), {
      visible: !!e.preview,
      position: "right",
      modal: !0,
      dismissable: !0,
      "close-on-escape": !0,
      "show-close-icon": !1,
      class: "kx-side-drawer",
      pt: { root: { style: "width: min(1400px, 82vw)" }, content: { class: "kx-side-drawer-content" } },
      "aria-label": "File preview",
      "onUpdate:visible": o[3] || (o[3] = (r) => {
        r || e.closePreview();
      })
    }, {
      default: L(() => [
        e.preview ? (l(), c("div", oo, [
          b("header", io, [
            b("span", so, [
              w(s(E), {
                icon: s(nt)(e.preview.mime_type),
                "aria-hidden": "true"
              }, null, 8, ["icon"])
            ]),
            b("div", lo, [
              b("div", {
                class: "kx-pv-name",
                title: s(se)(e.preview)
              }, [
                Y(T(s(se)(e.preview)), 1),
                e.preview.filename?.trim() ? C("", !0) : (l(), c("span", uo, T(e.preview.uuid), 1))
              ], 8, po),
              b("div", co, T(s(Zt)(e.preview)) + " · " + T(s(Te)(e.preview.size)), 1)
            ]),
            w(s(j), {
              type: "button",
              text: "",
              rounded: "",
              size: "small",
              "data-testid": "uploads-preview-download",
              disabled: e.busyAction,
              "aria-label": "Download",
              onClick: e.downloadActive
            }, {
              icon: L(({ class: r }) => [
                w(s(E), {
                  icon: e.busyAction ? "tabler:loader-2" : "tabler:download",
                  class: I([r, e.busyAction && "spin"]),
                  "aria-hidden": "true"
                }, null, 8, ["icon", "class"])
              ]),
              _: 1
            }, 8, ["disabled", "onClick"]),
            w(s(j), {
              type: "button",
              text: "",
              rounded: "",
              size: "small",
              "data-testid": "uploads-preview-open",
              disabled: e.busyAction,
              "aria-label": "Open in new tab",
              onClick: e.openActive
            }, {
              icon: L(({ class: r }) => [
                w(s(E), {
                  icon: "tabler:external-link",
                  class: I(r),
                  "aria-hidden": "true"
                }, null, 8, ["class"])
              ]),
              _: 1
            }, 8, ["disabled", "onClick"]),
            w(s(j), {
              type: "button",
              text: "",
              rounded: "",
              size: "small",
              "data-testid": "uploads-preview-close",
              "aria-label": "Close preview",
              onClick: e.closePreview
            }, {
              icon: L(({ class: r }) => [
                w(s(E), {
                  icon: "tabler:x",
                  class: I(r),
                  "aria-hidden": "true"
                }, null, 8, ["class"])
              ]),
              _: 1
            }, 8, ["onClick"])
          ]),
          typeof e.preview.meta?.ocr_error == "string" && e.preview.meta.ocr_error ? (l(), k(s(Ht), {
            key: 0,
            severity: "warn",
            closable: !1,
            role: "alert"
          }, {
            default: L(() => [
              Y(" Transcription: " + T(e.preview.meta.ocr_error), 1)
            ]),
            _: 1
          })) : C("", !0),
          b("div", fo, [
            w(s(j), {
              type: "button",
              class: "kx-part",
              size: "small",
              rounded: "",
              outlined: !!e.artifactView,
              label: "File",
              "data-testid": "uploads-view-file",
              "aria-pressed": !e.artifactView,
              pt: { label: { class: "kx-part-label" } },
              onClick: e.viewOriginal
            }, {
              icon: L(({ class: r }) => [
                w(s(E), {
                  icon: "tabler:file",
                  class: I(r),
                  "aria-hidden": "true"
                }, null, 8, ["class"])
              ]),
              _: 1
            }, 8, ["outlined", "aria-pressed", "onClick"]),
            e.hasPrimary ? (l(), k(s(j), {
              key: 0,
              type: "button",
              class: "kx-part",
              size: "small",
              rounded: "",
              outlined: !(e.artifactView && s(ne)(e.artifactView)),
              label: "Markdown",
              "data-testid": "uploads-view-markdown",
              "aria-pressed": !!e.artifactView && s(ne)(e.artifactView),
              pt: { label: { class: "kx-part-label" } },
              onClick: e.viewPrimary
            }, {
              icon: L(({ class: r }) => [
                w(s(E), {
                  icon: "tabler:markdown",
                  class: I(r),
                  "aria-hidden": "true"
                }, null, 8, ["class"])
              ]),
              _: 1
            }, 8, ["outlined", "aria-pressed", "onClick"])) : C("", !0)
          ]),
          b("div", {
            class: I(["kx-pv-view", { "kx-pv-padded": s(ao)(e.activePreviewSource(e.preview).contentType) }])
          }, [
            (l(), c("wc-resource-view", {
              key: e.artifactView ? `${e.preview.uuid}:${e.artifactView.artifact_id}` : e.preview.uuid,
              class: "kx-pv-rv",
              "content-type": e.activePreviewSource(e.preview).contentType,
              "source-url": e.activePreviewSource(e.preview).sourceUrl,
              filename: e.activePreviewSource(e.preview).filename,
              alt: e.activePreviewSource(e.preview).filename
            }, null, 8, mo))
          ], 2),
          e.partsTotal || e.artifactsLoading ? (l(), c("div", {
            key: 1,
            class: I(["kx-parts-panel", { open: e.partsExpanded }])
          }, [
            b("div", go, [
              w(s(j), {
                type: "button",
                text: "",
                size: "small",
                label: "Parts",
                badge: String(e.partsTotal),
                "badge-severity": "secondary",
                "data-testid": "uploads-parts-toggle",
                "aria-expanded": e.partsExpanded,
                "aria-controls": "uploads-extracted-parts",
                onClick: o[0] || (o[0] = (r) => n("update:partsExpanded", !e.partsExpanded))
              }, {
                icon: L(({ class: r }) => [
                  w(s(E), {
                    icon: e.partsExpanded ? "tabler:chevron-down" : "tabler:chevron-right",
                    class: I(r),
                    "aria-hidden": "true"
                  }, null, 8, ["icon", "class"])
                ]),
                _: 1
              }, 8, ["badge", "aria-expanded"]),
              e.partsExpanded && e.partsPages > 1 ? (l(), c(J, { key: 0 }, [
                b("span", ho, T(e.partsRangeStart) + "–" + T(e.partsRangeEnd), 1),
                b("div", bo, [
                  w(s(j), {
                    type: "button",
                    text: "",
                    rounded: "",
                    size: "small",
                    "data-testid": "uploads-parts-previous",
                    disabled: e.partsPage <= 1,
                    "aria-label": "Previous parts",
                    onClick: o[1] || (o[1] = (r) => e.gotoPartsPage(e.partsPage - 1))
                  }, {
                    icon: L(({ class: r }) => [
                      w(s(E), {
                        icon: "tabler:chevron-left",
                        class: I(r),
                        "aria-hidden": "true"
                      }, null, 8, ["class"])
                    ]),
                    _: 1
                  }, 8, ["disabled"]),
                  b("span", vo, T(e.partsPage) + " / " + T(e.partsPages), 1),
                  w(s(j), {
                    type: "button",
                    text: "",
                    rounded: "",
                    size: "small",
                    "data-testid": "uploads-parts-next",
                    disabled: e.partsPage >= e.partsPages,
                    "aria-label": "Next parts",
                    onClick: o[2] || (o[2] = (r) => e.gotoPartsPage(e.partsPage + 1))
                  }, {
                    icon: L(({ class: r }) => [
                      w(s(E), {
                        icon: "tabler:chevron-right",
                        class: I(r),
                        "aria-hidden": "true"
                      }, null, 8, ["class"])
                    ]),
                    _: 1
                  }, 8, ["disabled"])
                ])
              ], 64)) : C("", !0)
            ]),
            te(b("div", yo, [
              (l(!0), c(J, null, ke(e.currentArtifacts, (r) => (l(), k(s(j), {
                key: r.artifact_id,
                type: "button",
                class: "kx-part",
                size: "small",
                rounded: "",
                outlined: e.artifactView?.artifact_id !== r.artifact_id,
                label: s(we)(r),
                disabled: !r.raw_url,
                title: s(ro)(r),
                "data-testid": "uploads-view-artifact",
                "data-artifact-id": r.artifact_id,
                "aria-pressed": e.artifactView?.artifact_id === r.artifact_id,
                pt: { label: { class: "kx-part-label" } },
                onClick: (i) => e.viewArtifact(r)
              }, {
                icon: L(({ class: i }) => [
                  w(s(E), {
                    icon: s(nt)(r.mime_type),
                    class: I(i),
                    "aria-hidden": "true"
                  }, null, 8, ["icon", "class"])
                ]),
                _: 2
              }, 1032, ["outlined", "label", "disabled", "title", "data-artifact-id", "aria-pressed", "onClick"]))), 128)),
              e.artifactsLoading ? (l(), c("span", wo, [
                w(s(E), {
                  icon: "tabler:loader-2",
                  class: "spin",
                  "aria-hidden": "true"
                })
              ])) : C("", !0)
            ], 512), [
              [vn, e.partsExpanded]
            ])
          ], 2)) : C("", !0)
        ])) : C("", !0)
      ]),
      _: 1
    }, 8, ["visible"]));
  }
}), be = 30;
function ko(e) {
  const t = R(null), n = R(null), a = R({}), o = R(!1), r = R(!1);
  function i(u) {
    return a.value[u] || {
      loaded: !1,
      loading: !1,
      error: "",
      primary: null,
      parts: [],
      total: 0,
      page: 1
    };
  }
  function p(u, $) {
    a.value = { ...a.value, [u]: $ };
  }
  function g(u) {
    return u.role === "source" || u.locator?.type === "upload.original";
  }
  function h(u) {
    const $ = i(u).primary;
    return $ && ne($) && $.raw_url ? $ : null;
  }
  function S(u) {
    if (t.value?.uuid !== u.uuid || n.value || Re(u.mime_type)) return;
    const $ = h(u.uuid);
    $ && (n.value = $);
  }
  function x(u) {
    return { contentType: u.mime_type, sourceUrl: `/api/v1/uploads/${u.uuid}/raw`, filename: u.filename || u.uuid };
  }
  function v(u) {
    if (n.value?.raw_url)
      return {
        contentType: n.value.mime_type || "application/octet-stream",
        sourceUrl: n.value.raw_url,
        filename: we(n.value)
      };
    if (!Re(u.mime_type)) {
      const $ = h(u.uuid);
      if ($?.raw_url)
        return {
          contentType: $.mime_type || "text/markdown",
          sourceUrl: $.raw_url,
          filename: we($)
        };
    }
    return x(u);
  }
  function P(u) {
    qt(u) && (n.value && t.value?.uuid !== u.uuid && (n.value = null), t.value = u, Ee(u));
  }
  function z() {
    t.value = null, n.value = null;
  }
  function O() {
    n.value = null;
  }
  function M() {
    const u = t.value ? h(t.value.uuid) : null;
    u && (n.value = u);
  }
  function B(u) {
    u.raw_url && (n.value = u);
  }
  const A = G(() => t.value ? i(t.value.uuid).parts : []), V = G(() => t.value ? i(t.value.uuid).total : 0), K = G(() => t.value ? i(t.value.uuid).page : 1), X = G(() => Math.max(1, Math.ceil(V.value / be))), ae = G(() => V.value ? (K.value - 1) * be + 1 : 0), oe = G(() => Math.min(V.value, (K.value - 1) * be + A.value.length)), ce = G(() => !!(t.value && h(t.value.uuid))), ie = G(() => !!(t.value && i(t.value.uuid).loading));
  function Me(u) {
    if (!t.value) return;
    const $ = Math.min(Math.max(1, u), X.value);
    $ !== K.value && Ee(t.value, !0, $);
  }
  function De() {
    if (n.value?.raw_url) return n.value.raw_url;
    if (t.value && !Re(t.value.mime_type)) {
      const u = h(t.value.uuid);
      if (u?.raw_url) return u.raw_url;
    }
    return t.value ? `/api/v1/uploads/${t.value.uuid}/raw` : "";
  }
  function je() {
    if (n.value) return we(n.value);
    if (t.value && !Re(t.value.mime_type)) {
      const u = h(t.value.uuid);
      if (u) return we(u);
    }
    return t.value ? t.value.filename || t.value.uuid : "download";
  }
  async function Be(u) {
    if (!u) return null;
    try {
      const $ = await xe.get(u, { responseType: "blob" });
      return URL.createObjectURL($.data);
    } catch ($) {
      return e.value = $ instanceof Error ? $.message : "failed to fetch file", null;
    }
  }
  async function Ne() {
    if (!r.value) {
      r.value = !0;
      try {
        const u = await Be(De());
        if (!u) return;
        const $ = document.createElement("a");
        $.href = u, $.download = je(), $.click(), setTimeout(() => URL.revokeObjectURL(u), 1e4);
      } finally {
        r.value = !1;
      }
    }
  }
  async function Ue() {
    if (!r.value) {
      r.value = !0;
      try {
        const u = await Be(De());
        u && (window.open(u, "_blank", "noopener"), setTimeout(() => URL.revokeObjectURL(u), 6e4));
      } finally {
        r.value = !1;
      }
    }
  }
  async function Ee(u, $ = !1, H = 1) {
    const U = i(u.uuid);
    if (!((U.loaded || U.loading) && !$)) {
      p(u.uuid, { ...U, loading: !0, error: "" });
      try {
        const Z = (H - 1) * be, { data: Q } = await xe.get(`/api/v1/uploads/${u.uuid}/artifacts`, { params: { limit: be, offset: Z } });
        if (!Q.success) {
          p(u.uuid, { ...U, loaded: !0, loading: !1, error: Q.error || "failed to load artifacts", primary: null, parts: [], total: 0, page: H });
          return;
        }
        const de = Q.artifacts || [], q = Q.primary || de.find((W) => ne(W) && !!W.raw_url) || null, ze = de.filter((W) => !g(W) && !ne(W));
        p(u.uuid, {
          loaded: !0,
          loading: !1,
          error: "",
          primary: q,
          parts: ze,
          total: Number(Q.meta?.total ?? ze.length),
          page: H
        }), H === 1 && S(u);
      } catch (Z) {
        p(u.uuid, { ...U, loaded: !0, loading: !1, error: Z instanceof Error ? Z.message : "failed to load artifacts" });
      }
    }
  }
  return {
    preview: t,
    artifactView: n,
    artifactsByUpload: a,
    partsExpanded: o,
    busyAction: r,
    artifactStateFor: i,
    isSourceArtifact: g,
    primaryMarkdownFor: h,
    activePreviewSource: v,
    openPreview: P,
    closePreview: z,
    viewOriginal: O,
    viewPrimary: M,
    viewArtifact: B,
    currentArtifacts: A,
    partsTotal: V,
    partsPage: K,
    partsPages: X,
    partsRangeStart: ae,
    partsRangeEnd: oe,
    hasPrimary: ce,
    artifactsLoading: ie,
    gotoPartsPage: Me,
    downloadActive: Ne,
    openActive: Ue
  };
}
const Po = { class: "kx" }, Co = { class: "kx-head" }, $o = { class: "kx-head-icon" }, So = { class: "kx-head-actions" }, Io = { class: "kx-count" }, Lo = {
  key: 0,
  class: "kx-count kx-pending"
}, Ao = {
  key: 0,
  class: "kx-err"
}, To = { class: "kx-body" }, Do = { class: "kx-main" }, Bo = { class: "kx-drop-title" }, Eo = {
  key: 0,
  class: "kx-loading"
}, zo = {
  key: 1,
  class: "kx-empty"
}, Oo = { class: "kx-empty-ico" }, Ro = {
  key: 2,
  class: "kx-empty"
}, Fo = { class: "kx-list" }, Mo = { class: "kx-ficon" }, jo = { class: "kx-id" }, No = ["title"], Uo = {
  key: 0,
  class: "kx-uuid"
}, Vo = { class: "kx-sub" }, _o = { class: "kx-type" }, Ko = ["title"], Wo = { class: "kx-date" }, Go = { class: "kx-actions" }, Jo = {
  key: 0,
  class: "kx-progress",
  "aria-hidden": "true"
}, ve = 30, Ho = /* @__PURE__ */ It({
  __name: "uploads",
  setup(e) {
    const t = /* @__PURE__ */ new Set(["completed", "error"]), n = [
      { label: "All status", value: "all" },
      { label: "Uploaded", value: "uploaded" },
      { label: "Processing", value: "processing" },
      { label: "Completed", value: "completed" },
      { label: "Error", value: "error" }
    ], a = R([]), o = R(0), r = R(!1), i = R(""), p = R(!1), g = R(0), h = R(""), S = R("all"), x = R(1), v = R(!1), {
      preview: P,
      artifactView: z,
      partsExpanded: O,
      busyAction: M,
      activePreviewSource: B,
      openPreview: A,
      closePreview: V,
      viewOriginal: K,
      viewPrimary: X,
      viewArtifact: ae,
      currentArtifacts: oe,
      partsTotal: ce,
      partsPage: ie,
      partsPages: Me,
      partsRangeStart: De,
      partsRangeEnd: je,
      hasPrimary: Be,
      artifactsLoading: Ne,
      gotoPartsPage: Ue,
      downloadActive: Ee,
      openActive: u
    } = ko(i), $ = R(""), H = R({});
    let U = null, Z = "";
    const Q = G(() => typeof H.value.pending_count == "number" ? H.value.pending_count : a.value.filter((y) => !t.has(ue(y.status))).length), de = G(() => Math.max(1, Math.ceil(o.value / ve)));
    async function q() {
      r.value = !0, i.value = "";
      try {
        const y = { limit: ve, offset: (x.value - 1) * ve }, m = h.value.trim();
        m && (y.q = m), S.value !== "all" && (y.status = S.value);
        const { data: d } = await xe.get("/api/v1/uploads/list", { params: y });
        d.success ? (a.value = d.uploads || [], o.value = Number(d.meta?.total ?? a.value.length), typeof d.component_id == "string" && ($.value = d.component_id)) : (a.value = [], o.value = 0);
      } catch (y) {
        a.value = [], o.value = 0, i.value = y instanceof Error ? y.message : "failed to load uploads";
      } finally {
        r.value = !1;
      }
    }
    function ze(y) {
      const m = Math.max(1, Math.min(de.value, y));
      m !== x.value && (x.value = m, q());
    }
    let W = null;
    _e(h, () => {
      W && clearTimeout(W), W = setTimeout(() => {
        x.value = 1, q();
      }, 300);
    }), _e(S, () => {
      x.value = 1, q();
    });
    function ot() {
      const y = $.value;
      !y || Z === y || (U && U(), U = null, Z = "", U = ma(y, (m) => {
        H.value = { ...H.value, ...m.meta }, q();
      }), U && (Z = y));
    }
    _e($, () => {
      ot();
    });
    async function Xt(y) {
      const m = new FormData();
      m.append("file", y), m.append("metadata", JSON.stringify({ target_parent_id: "", filename: y.name }));
      try {
        const { data: d } = await xe.post("/api/v1/uploads", m, { headers: { "Content-Type": "multipart/form-data" } });
        d.success || (i.value = d.error || `failed to upload "${y.name}"`);
      } catch (d) {
        i.value = d instanceof Error ? d.message : `failed to upload "${y.name}"`;
      }
    }
    async function it(y) {
      const m = Array.from(y);
      if (m.length) {
        i.value = "", g.value += m.length;
        try {
          for (const d of m) await Xt(d);
        } finally {
          g.value = Math.max(0, g.value - m.length), x.value = 1, await q();
        }
      }
    }
    function fe() {
      const y = document.createElement("input");
      y.type = "file", y.multiple = !0, y.onchange = () => {
        y.files?.length && it(y.files);
      }, y.click();
    }
    function Qt(y) {
      y.preventDefault(), p.value = !1, y.dataTransfer?.files?.length && it(y.dataTransfer.files);
    }
    async function Yt(y) {
      await Cn.confirm({
        header: "Delete upload",
        message: "Deletes the file everywhere; workspace links are removed.",
        icon: "tabler:trash",
        acceptLabel: "Delete",
        rejectLabel: "Cancel",
        acceptClass: "p-button-danger"
      }) && await en(y);
    }
    async function en(y) {
      v.value = !0, i.value = "";
      try {
        const { data: m } = await xe.delete(`/api/v1/uploads/${y.uuid}`);
        m.success ? (P.value?.uuid === y.uuid && V(), a.value.length === 1 && x.value > 1 && (x.value -= 1), await q()) : i.value = m.error || "failed to delete upload";
      } catch (m) {
        i.value = m instanceof Error ? m.message : "failed to delete upload";
      } finally {
        v.value = !1;
      }
    }
    function st(y) {
      y.key === "Escape" && P.value && V();
    }
    async function tn() {
      try {
        await q(), ot();
      } catch (y) {
        i.value = y instanceof Error ? y.message : "host API unavailable";
      }
    }
    return fn(tn), yn(() => {
      window.addEventListener("keydown", st), Pn("wc-resource-view", { timeoutMs: 1e4 }).catch(() => {
      });
    }), wn(() => {
      window.removeEventListener("keydown", st), W && clearTimeout(W), U && U(), U = null, Z = "";
    }), (y, m) => (l(), c("div", Po, [
      b("header", Co, [
        b("div", $o, [
          w(s(E), {
            icon: "tabler:files",
            "aria-hidden": "true"
          })
        ]),
        m[10] || (m[10] = b("div", { class: "kx-head-text" }, [
          b("h1", { class: "kx-title" }, "Uploads"),
          b("p", { class: "kx-head-sub" }, "Files your agents can read and process.")
        ], -1)),
        b("div", So, [
          b("span", Io, T(o.value) + " file" + T(o.value !== 1 ? "s" : ""), 1),
          Q.value ? (l(), c("span", Lo, [
            w(s(E), {
              icon: "tabler:loader-2",
              class: "spin",
              "aria-hidden": "true"
            }),
            Y(" " + T(Q.value) + " processing", 1)
          ])) : C("", !0),
          w(s(Tt), { class: "kx-search" }, {
            default: L(() => [
              w(s(Je), null, {
                default: L(() => [
                  w(s(E), {
                    icon: "tabler:search",
                    "aria-hidden": "true"
                  })
                ]),
                _: 1
              }),
              w(s(Pt), {
                modelValue: h.value,
                "onUpdate:modelValue": m[0] || (m[0] = (d) => h.value = d),
                placeholder: "Search files…",
                "aria-label": "Search files",
                "data-testid": "uploads-search-input"
              }, null, 8, ["modelValue"]),
              h.value ? (l(), k(s(Je), { key: 0 }, {
                default: L(() => [
                  w(s(j), {
                    type: "button",
                    text: "",
                    severity: "secondary",
                    size: "small",
                    "aria-label": "Clear search",
                    "data-testid": "uploads-search-clear",
                    onClick: m[1] || (m[1] = (d) => h.value = "")
                  }, {
                    icon: L(({ class: d }) => [
                      w(s(E), {
                        icon: "tabler:x",
                        class: I(d),
                        "aria-hidden": "true"
                      }, null, 8, ["class"])
                    ]),
                    _: 1
                  })
                ]),
                _: 1
              })) : C("", !0)
            ]),
            _: 1
          }),
          w(s(at), {
            modelValue: S.value,
            "onUpdate:modelValue": m[2] || (m[2] = (d) => S.value = d),
            class: "kx-select",
            options: n,
            "option-label": "label",
            "option-value": "value",
            "aria-label": "Filter by status"
          }, null, 8, ["modelValue"]),
          w(s(j), {
            type: "button",
            "data-testid": "uploads-header-upload",
            label: g.value > 0 ? "Uploading…" : "Upload",
            loading: g.value > 0,
            disabled: g.value > 0,
            onClick: fe
          }, {
            icon: L(({ class: d }) => [
              w(s(E), {
                icon: "tabler:upload",
                class: I(d),
                "aria-hidden": "true"
              }, null, 8, ["class"])
            ]),
            _: 1
          }, 8, ["label", "loading", "disabled"])
        ])
      ]),
      i.value ? (l(), c("div", Ao, T(i.value), 1)) : C("", !0),
      b("div", To, [
        b("div", Do, [
          b("div", {
            class: I(["kx-drop", { dragover: p.value, busy: g.value > 0 }]),
            role: "button",
            tabindex: "0",
            "aria-label": "Upload files",
            onClick: m[3] || (m[3] = (d) => g.value === 0 && fe()),
            onKeydown: [
              m[4] || (m[4] = dt((d) => g.value === 0 && fe(), ["enter"])),
              m[5] || (m[5] = dt(ct((d) => g.value === 0 && fe(), ["prevent"]), ["space"]))
            ],
            onDragover: m[6] || (m[6] = ct((d) => p.value = !0, ["prevent"])),
            onDragleave: m[7] || (m[7] = (d) => p.value = !1),
            onDrop: Qt
          }, [
            w(s(E), {
              icon: g.value > 0 ? "tabler:loader-2" : "tabler:cloud-upload",
              class: I(["kx-drop-ico", g.value > 0 && "spin"]),
              "aria-hidden": "true"
            }, null, 8, ["icon", "class"]),
            b("p", Bo, T(g.value > 0 ? "Uploading…" : "Drop files or click to browse"), 1),
            m[11] || (m[11] = b("p", { class: "kx-drop-sub" }, "Documents convert to markdown; images and text are stored for agents.", -1))
          ], 34),
          r.value && !a.value.length ? (l(), c("div", Eo, [
            w(s(E), {
              icon: "tabler:loader-2",
              class: "spin",
              "aria-hidden": "true"
            }),
            m[12] || (m[12] = Y(" Loading…", -1))
          ])) : !o.value && !h.value && S.value === "all" ? (l(), c("div", zo, [
            b("div", Oo, [
              w(s(E), {
                icon: "tabler:cloud-upload",
                "aria-hidden": "true"
              })
            ]),
            m[13] || (m[13] = b("div", { class: "kx-empty-title" }, "No uploads yet", -1)),
            m[14] || (m[14] = b("div", { class: "kx-empty-sub" }, "Upload a document, image, or text file to make it available to your agents.", -1)),
            w(s(j), {
              type: "button",
              class: "kx-empty-cta",
              "data-testid": "uploads-empty-upload",
              label: "Upload files",
              onClick: fe
            }, {
              icon: L(({ class: d }) => [
                w(s(E), {
                  icon: "tabler:upload",
                  class: I(d),
                  "aria-hidden": "true"
                }, null, 8, ["class"])
              ]),
              _: 1
            })
          ])) : a.value.length ? (l(), c(J, { key: 3 }, [
            b("div", Fo, [
              (l(!0), c(J, null, ke(a.value, (d) => (l(), c("div", {
                key: d.uuid,
                class: "kx-row"
              }, [
                b("span", Mo, [
                  w(s(E), {
                    icon: s(nt)(d.mime_type),
                    "aria-hidden": "true"
                  }, null, 8, ["icon"])
                ]),
                b("div", jo, [
                  b("div", {
                    class: "kx-name",
                    title: s(se)(d)
                  }, [
                    Y(T(s(se)(d)), 1),
                    d.filename?.trim() ? C("", !0) : (l(), c("span", Uo, T(d.uuid), 1))
                  ], 8, No),
                  b("div", Vo, [
                    b("span", _o, T(s(Zt)(d)), 1),
                    Y(" · " + T(s(Te)(d.size)), 1)
                  ]),
                  s(qa)(d) && d.error ? (l(), c("div", {
                    key: 0,
                    class: "kx-err-reason",
                    title: s(kt)(d.error)
                  }, T(s(kt)(d.error)), 9, Ko)) : C("", !0)
                ]),
                w(s(At), {
                  severity: s(Xa)(d.status),
                  class: "kx-badge kx-tag-sm"
                }, {
                  default: L(() => [
                    s(t).has(d.status) ? C("", !0) : (l(), k(s(E), {
                      key: 0,
                      icon: "tabler:loader-2",
                      class: "spin",
                      "aria-hidden": "true"
                    })),
                    Y(" " + T(s(Qa)(d.status)), 1)
                  ]),
                  _: 2
                }, 1032, ["severity"]),
                b("span", Wo, T(s(ha)(d.created_at)), 1),
                b("div", Go, [
                  s(qt)(d) ? (l(), k(s(j), {
                    key: 0,
                    type: "button",
                    text: "",
                    rounded: "",
                    size: "small",
                    "data-testid": "uploads-row-preview",
                    "data-upload-id": d.uuid,
                    "aria-label": `Preview ${s(se)(d)}`,
                    onClick: (me) => s(A)(d)
                  }, {
                    icon: L(({ class: me }) => [
                      w(s(E), {
                        icon: "tabler:eye",
                        class: I(me),
                        "aria-hidden": "true"
                      }, null, 8, ["class"])
                    ]),
                    _: 1
                  }, 8, ["data-upload-id", "aria-label", "onClick"])) : C("", !0),
                  w(s(j), {
                    type: "button",
                    text: "",
                    rounded: "",
                    size: "small",
                    severity: "danger",
                    "data-testid": "uploads-row-delete",
                    "data-upload-id": d.uuid,
                    "aria-label": `Delete ${s(se)(d)}`,
                    onClick: (me) => Yt(d)
                  }, {
                    icon: L(({ class: me }) => [
                      w(s(E), {
                        icon: "tabler:trash",
                        class: I(me),
                        "aria-hidden": "true"
                      }, null, 8, ["class"])
                    ]),
                    _: 1
                  }, 8, ["data-upload-id", "aria-label", "onClick"])
                ]),
                s(no)(d) ? (l(), c("span", Jo)) : C("", !0)
              ]))), 128))
            ]),
            de.value > 1 ? (l(), k(s(Gt), {
              key: 0,
              first: (x.value - 1) * ve,
              rows: ve,
              "total-records": o.value,
              "page-link-size": 5,
              template: "CurrentPageReport PrevPageLink PageLinks NextPageLink",
              "current-page-report-template": "{first}–{last} of {totalRecords}",
              "data-testid": "uploads-pager",
              "aria-label": "Pagination",
              pt: {
                prev: { "data-testid": "uploads-pager-previous" },
                next: { "data-testid": "uploads-pager-next" }
              },
              onPage: m[8] || (m[8] = (d) => ze(d.page + 1))
            }, null, 8, ["first", "total-records"])) : C("", !0)
          ], 64)) : (l(), c("div", Ro, [...m[15] || (m[15] = [
            b("div", { class: "kx-empty-title" }, "No matches", -1),
            b("div", { class: "kx-empty-sub" }, "No files match the current search or filter.", -1)
          ])]))
        ])
      ]),
      w(xo, {
        "parts-expanded": s(O),
        "onUpdate:partsExpanded": m[9] || (m[9] = (d) => xn(O) ? O.value = d : null),
        preview: s(P),
        "artifact-view": s(z),
        "busy-action": s(M),
        "current-artifacts": s(oe),
        "parts-total": s(ce),
        "parts-page": s(ie),
        "parts-pages": s(Me),
        "parts-range-start": s(De),
        "parts-range-end": s(je),
        "has-primary": s(Be),
        "artifacts-loading": s(Ne),
        "active-preview-source": s(B),
        "download-active": s(Ee),
        "open-active": s(u),
        "close-preview": s(V),
        "view-original": s(K),
        "view-primary": s(X),
        "view-artifact": s(ae),
        "goto-parts-page": s(Ue)
      }, null, 8, ["parts-expanded", "preview", "artifact-view", "busy-action", "current-artifacts", "parts-total", "parts-page", "parts-pages", "parts-range-start", "parts-range-end", "has-primary", "artifacts-loading", "active-preview-source", "download-active", "open-active", "close-preview", "view-original", "view-primary", "view-artifact", "goto-parts-page"])
    ]));
  }
}), Zo = ':root{--p-form-field-padding-x: .75rem;--p-form-field-padding-y: .5rem;--p-form-field-sm-padding-x: .625rem;--p-form-field-sm-padding-y: .375rem;--p-form-field-lg-padding-x: .875rem;--p-form-field-lg-padding-y: .625rem;--p-form-field-border-radius: .375rem;--p-form-field-transition-duration: .2s;--p-form-field-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), 0 1px 2px 0 rgba(18, 18, 23, .05);--p-focus-ring-width: 1px;--p-focus-ring-style: solid;--p-focus-ring-color: color-mix(in srgb, var(--p-primary-color) 100%, transparent);--p-focus-ring-offset: 2px;--p-toggleswitch-width: 2.5rem;--p-toggleswitch-height: 1.5rem;--p-toggleswitch-border-radius: 30px;--p-toggleswitch-gap: .25rem;--p-toggleswitch-border-width: 1px;--p-toggleswitch-transition-duration: .2s;--p-toggleswitch-slide-duration: .2s;--p-toggleswitch-handle-size: 1rem;--p-toggleswitch-handle-border-radius: 9999px}:root{color-scheme:light dark;--p-primary: rgb(0, 95, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-secondary: #6f7385;--p-secondary-50: color-mix(in srgb, var(--p-secondary) 5%, white);--p-secondary-100: color-mix(in srgb, var(--p-secondary) 10%, white);--p-secondary-200: color-mix(in srgb, var(--p-secondary) 20%, white);--p-secondary-300: color-mix(in srgb, var(--p-secondary) 35%, white);--p-secondary-400: color-mix(in srgb, var(--p-secondary) 65%, white);--p-secondary-500: var(--p-secondary);--p-secondary-600: color-mix(in srgb, var(--p-secondary) 80%, black);--p-secondary-700: color-mix(in srgb, var(--p-secondary) 65%, black);--p-secondary-800: color-mix(in srgb, var(--p-secondary) 55%, black);--p-secondary-900: color-mix(in srgb, var(--p-secondary) 50%, black);--p-secondary-950: color-mix(in srgb, var(--p-secondary) 30%, black);--p-danger: rgb(239, 68, 68);--p-danger-50: color-mix(in srgb, var(--p-danger) 5%, white);--p-danger-100: color-mix(in srgb, var(--p-danger) 10%, white);--p-danger-200: color-mix(in srgb, var(--p-danger) 20%, white);--p-danger-300: color-mix(in srgb, var(--p-danger) 30%, white);--p-danger-400: color-mix(in srgb, var(--p-danger) 40%, white);--p-danger-500: var(--p-danger);--p-danger-600: color-mix(in srgb, var(--p-danger) 80%, black);--p-danger-700: color-mix(in srgb, var(--p-danger) 70%, black);--p-danger-800: color-mix(in srgb, var(--p-danger) 60%, black);--p-danger-900: color-mix(in srgb, var(--p-danger) 50%, black);--p-danger-950: color-mix(in srgb, var(--p-danger) 40%, black);--p-success: rgb(34, 197, 94);--p-success-50: color-mix(in srgb, var(--p-success) 5%, white);--p-success-100: color-mix(in srgb, var(--p-success) 10%, white);--p-success-200: color-mix(in srgb, var(--p-success) 20%, white);--p-success-300: color-mix(in srgb, var(--p-success) 30%, white);--p-success-400: color-mix(in srgb, var(--p-success) 40%, white);--p-success-500: var(--p-success);--p-success-600: color-mix(in srgb, var(--p-success) 80%, black);--p-success-700: color-mix(in srgb, var(--p-success) 70%, black);--p-success-800: color-mix(in srgb, var(--p-success) 60%, black);--p-success-900: color-mix(in srgb, var(--p-success) 50%, black);--p-success-950: color-mix(in srgb, var(--p-success) 40%, black);--p-warn: rgb(249, 115, 22);--p-warn-50: color-mix(in srgb, var(--p-warn) 5%, white);--p-warn-100: color-mix(in srgb, var(--p-warn) 10%, white);--p-warn-200: color-mix(in srgb, var(--p-warn) 20%, white);--p-warn-300: color-mix(in srgb, var(--p-warn) 30%, white);--p-warn-400: color-mix(in srgb, var(--p-warn) 40%, white);--p-warn-500: var(--p-warn);--p-warn-600: color-mix(in srgb, var(--p-warn) 80%, black);--p-warn-700: color-mix(in srgb, var(--p-warn) 70%, black);--p-warn-800: color-mix(in srgb, var(--p-warn) 60%, black);--p-warn-900: color-mix(in srgb, var(--p-warn) 50%, black);--p-warn-950: color-mix(in srgb, var(--p-warn) 40%, black);--p-info: rgb(14, 165, 233);--p-info-50: color-mix(in srgb, var(--p-info) 5%, white);--p-info-100: color-mix(in srgb, var(--p-info) 10%, white);--p-info-200: color-mix(in srgb, var(--p-info) 20%, white);--p-info-300: color-mix(in srgb, var(--p-info) 30%, white);--p-info-400: color-mix(in srgb, var(--p-info) 40%, white);--p-info-500: var(--p-info);--p-info-600: color-mix(in srgb, var(--p-info) 80%, black);--p-info-700: color-mix(in srgb, var(--p-info) 70%, black);--p-info-800: color-mix(in srgb, var(--p-info) 60%, black);--p-info-900: color-mix(in srgb, var(--p-info) 50%, black);--p-info-950: color-mix(in srgb, var(--p-info) 40%, black);--p-help: rgb(168, 85, 247);--p-help-50: color-mix(in srgb, var(--p-help) 5%, white);--p-help-100: color-mix(in srgb, var(--p-help) 10%, white);--p-help-200: color-mix(in srgb, var(--p-help) 20%, white);--p-help-300: color-mix(in srgb, var(--p-help) 30%, white);--p-help-400: color-mix(in srgb, var(--p-help) 40%, white);--p-help-500: var(--p-help);--p-help-600: color-mix(in srgb, var(--p-help) 80%, black);--p-help-700: color-mix(in srgb, var(--p-help) 70%, black);--p-help-800: color-mix(in srgb, var(--p-help) 60%, black);--p-help-900: color-mix(in srgb, var(--p-help) 50%, black);--p-help-950: color-mix(in srgb, var(--p-help) 40%, black);--p-accent: rgb(20, 184, 166);--p-accent-50: color-mix(in srgb, var(--p-accent) 5%, white);--p-accent-100: color-mix(in srgb, var(--p-accent) 10%, white);--p-accent-200: color-mix(in srgb, var(--p-accent) 20%, white);--p-accent-300: color-mix(in srgb, var(--p-accent) 30%, white);--p-accent-400: color-mix(in srgb, var(--p-accent) 40%, white);--p-accent-500: var(--p-accent);--p-accent-600: color-mix(in srgb, var(--p-accent) 80%, black);--p-accent-700: color-mix(in srgb, var(--p-accent) 70%, black);--p-accent-800: color-mix(in srgb, var(--p-accent) 60%, black);--p-accent-900: color-mix(in srgb, var(--p-accent) 50%, black);--p-accent-950: color-mix(in srgb, var(--p-accent) 40%, black);--p-surface-0: #ffffff;--p-surface-50: #fafafa;--p-surface-100: #f5f5f5;--p-surface-200: #e5e5e5;--p-surface-300: #d4d4d4;--p-surface-400: #a3a3a3;--p-surface-500: #737373;--p-surface-600: #525252;--p-surface-700: #404040;--p-surface-800: #262626;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #171717;--p-surface-950: #0a0a0a;--p-content-border-radius: 6px;--p-font-heading-family: var(--v-font-family-head, Arial);--p-font-heading-scale: 1;--p-font-heading-line-height: 1.5;--p-font-heading-letter-spacing: normal;--p-font-heading-stretch: normal;--p-font-heading-variation-settings: normal;--p-font-body-scale: 1;--p-font-body-line-height: 1.5;--p-font-body-letter-spacing: normal;--p-font-body-stretch: normal;--p-font-body-variation-settings: normal;--p-font-mono-family: ui-monospace}:root{--p-primary-color: var(--p-primary-500);--p-primary-contrast-color: var(--p-surface-0);--p-primary-hover-color: var(--p-primary-600);--p-primary-active-color: var(--p-primary-700);--p-secondary-color: var(--p-secondary-500);--p-secondary-contrast-color: var(--p-surface-0);--p-secondary-hover-color: var(--p-secondary-600);--p-secondary-active-color: var(--p-secondary-700);--p-danger-color: var(--p-danger-500);--p-danger-contrast-color: var(--p-surface-0);--p-danger-hover-color: var(--p-danger-600);--p-danger-active-color: var(--p-danger-700);--p-success-color: var(--p-success-500);--p-success-contrast-color: var(--p-surface-0);--p-success-hover-color: var(--p-success-600);--p-success-active-color: var(--p-success-700);--p-warn-color: var(--p-warn-500);--p-warn-contrast-color: var(--p-surface-0);--p-warn-hover-color: var(--p-warn-600);--p-warn-active-color: var(--p-warn-700);--p-info-color: var(--p-info-500);--p-info-contrast-color: var(--p-surface-0);--p-info-hover-color: var(--p-info-600);--p-info-active-color: var(--p-info-700);--p-help-color: var(--p-help-500);--p-help-contrast-color: var(--p-surface-0);--p-help-hover-color: var(--p-help-600);--p-help-active-color: var(--p-help-700);--p-accent-color: var(--p-accent-500);--p-accent-contrast-color: var(--p-surface-0);--p-accent-hover-color: var(--p-accent-600);--p-accent-active-color: var(--p-accent-700);--p-content-border-color: var(--p-surface-200);--p-content-hover-background: var(--p-surface-100);--p-content-hover-color: var(--p-surface-800);--p-highlight-background: var(--p-primary-50);--p-highlight-color: var(--p-primary-700);--p-highlight-focus-background: var(--p-primary-100);--p-highlight-focus-color: var(--p-primary-800);--p-content-background: var(--p-surface-0);--p-text-color: var(--p-surface-700);--p-text-hover-color: var(--p-surface-800);--p-text-muted-color: var(--p-surface-500);--p-text-hover-muted-color: var(--p-surface-600)}@media(prefers-color-scheme:dark){:root:not(.w-theme-light){--p-surface-D: #fff;--p-surface-0: #fff;--p-surface-50: #fafafa;--p-surface-100: #f4f4f5;--p-surface-200: #e4e4e7;--p-surface-300: #d4d4d8;--p-surface-400: #a1a1aa;--p-surface-500: #71717a;--p-surface-600: #545250;--p-surface-700: #403e3c;--p-surface-800: #2b2927;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #1c1a19;--p-surface-950: #0f0e0d;--p-primary: rgb(0, 125, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-primary-color: var(--p-primary-400);--p-primary-contrast-color: var(--p-surface-900);--p-primary-hover-color: var(--p-primary-300);--p-primary-active-color: var(--p-primary-200);--p-secondary-color: var(--p-secondary-400);--p-secondary-contrast-color: var(--p-surface-900);--p-secondary-hover-color: var(--p-secondary-300);--p-secondary-active-color: var(--p-secondary-200);--p-danger-color: var(--p-danger-400);--p-danger-contrast-color: var(--p-surface-900);--p-danger-hover-color: var(--p-danger-300);--p-danger-active-color: var(--p-danger-200);--p-success-color: var(--p-success-400);--p-success-contrast-color: var(--p-surface-900);--p-success-hover-color: var(--p-success-300);--p-success-active-color: var(--p-success-200);--p-warn-color: var(--p-warn-400);--p-warn-contrast-color: var(--p-surface-900);--p-warn-hover-color: var(--p-warn-300);--p-warn-active-color: var(--p-warn-200);--p-info-color: var(--p-info-400);--p-info-contrast-color: var(--p-surface-900);--p-info-hover-color: var(--p-info-300);--p-info-active-color: var(--p-info-200);--p-help-color: var(--p-help-400);--p-help-contrast-color: var(--p-surface-900);--p-help-hover-color: var(--p-help-300);--p-help-active-color: var(--p-help-200);--p-accent-color: var(--p-accent-400);--p-accent-contrast-color: var(--p-surface-900);--p-accent-hover-color: var(--p-accent-300);--p-accent-active-color: var(--p-accent-200);--p-content-border-color: var(--p-surface-700);--p-content-hover-background: var(--p-surface-800);--p-content-hover-color: var(--p-surface-0);--p-highlight-background: color-mix(in srgb, var(--p-primary-400), transparent 84%);--p-highlight-color: rgba(255, 255, 255, 87%);--p-highlight-focus-background: color-mix(in srgb, var(--p-primary-400), transparent 76%);--p-highlight-focus-color: rgba(255, 255, 255, 87%);--p-content-background: var(--p-surface-900);--p-text-color: var(--p-surface-0);--p-text-hover-color: var(--p-surface-0);--p-text-muted-color: var(--p-surface-400);--p-text-hover-muted-color: var(--p-surface-300)}}:root.w-theme-dark,.w-theme-dark{color-scheme:dark;--p-surface-D: #fff;--p-surface-0: #fff;--p-surface-50: #fafafa;--p-surface-100: #f4f4f5;--p-surface-200: #e4e4e7;--p-surface-300: #d4d4d8;--p-surface-400: #a1a1aa;--p-surface-500: #71717a;--p-surface-600: #545250;--p-surface-700: #403e3c;--p-surface-800: #2b2927;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #1c1a19;--p-surface-950: #0f0e0d;--p-primary: rgb(0, 125, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-primary-color: var(--p-primary-400);--p-primary-contrast-color: var(--p-surface-900);--p-primary-hover-color: var(--p-primary-300);--p-primary-active-color: var(--p-primary-200);--p-secondary-color: var(--p-secondary-400);--p-secondary-contrast-color: var(--p-surface-900);--p-secondary-hover-color: var(--p-secondary-300);--p-secondary-active-color: var(--p-secondary-200);--p-danger-color: var(--p-danger-400);--p-danger-contrast-color: var(--p-surface-900);--p-danger-hover-color: var(--p-danger-300);--p-danger-active-color: var(--p-danger-200);--p-success-color: var(--p-success-400);--p-success-contrast-color: var(--p-surface-900);--p-success-hover-color: var(--p-success-300);--p-success-active-color: var(--p-success-200);--p-warn-color: var(--p-warn-400);--p-warn-contrast-color: var(--p-surface-900);--p-warn-hover-color: var(--p-warn-300);--p-warn-active-color: var(--p-warn-200);--p-info-color: var(--p-info-400);--p-info-contrast-color: var(--p-surface-900);--p-info-hover-color: var(--p-info-300);--p-info-active-color: var(--p-info-200);--p-help-color: var(--p-help-400);--p-help-contrast-color: var(--p-surface-900);--p-help-hover-color: var(--p-help-300);--p-help-active-color: var(--p-help-200);--p-accent-color: var(--p-accent-400);--p-accent-contrast-color: var(--p-surface-900);--p-accent-hover-color: var(--p-accent-300);--p-accent-active-color: var(--p-accent-200);--p-content-border-color: var(--p-surface-700);--p-content-hover-background: var(--p-surface-800);--p-content-hover-color: var(--p-surface-0);--p-highlight-background: color-mix(in srgb, var(--p-primary-400), transparent 84%);--p-highlight-color: rgba(255, 255, 255, 87%);--p-highlight-focus-background: color-mix(in srgb, var(--p-primary-400), transparent 76%);--p-highlight-focus-color: rgba(255, 255, 255, 87%);--p-content-background: var(--p-surface-900);--p-text-color: var(--p-surface-0);--p-text-hover-color: var(--p-surface-0);--p-text-muted-color: var(--p-surface-400);--p-text-hover-muted-color: var(--p-surface-300)}:root.w-theme-light,.w-theme-light{color-scheme:light;--p-surface-0: #ffffff;--p-surface-50: #fafafa;--p-surface-100: #f5f5f5;--p-surface-200: #e5e5e5;--p-surface-300: #d4d4d4;--p-surface-400: #a3a3a3;--p-surface-500: #737373;--p-surface-600: #525252;--p-surface-700: #404040;--p-surface-800: #262626;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #171717;--p-surface-950: #0a0a0a;--p-primary: rgb(0, 95, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-primary-color: var(--p-primary-500);--p-primary-contrast-color: var(--p-surface-0);--p-primary-hover-color: var(--p-primary-600);--p-primary-active-color: var(--p-primary-700);--p-secondary-color: var(--p-secondary-500);--p-secondary-contrast-color: var(--p-surface-0);--p-secondary-hover-color: var(--p-secondary-600);--p-secondary-active-color: var(--p-secondary-700);--p-danger-color: var(--p-danger-500);--p-danger-contrast-color: var(--p-surface-0);--p-danger-hover-color: var(--p-danger-600);--p-danger-active-color: var(--p-danger-700);--p-success-color: var(--p-success-500);--p-success-contrast-color: var(--p-surface-0);--p-success-hover-color: var(--p-success-600);--p-success-active-color: var(--p-success-700);--p-warn-color: var(--p-warn-500);--p-warn-contrast-color: var(--p-surface-0);--p-warn-hover-color: var(--p-warn-600);--p-warn-active-color: var(--p-warn-700);--p-info-color: var(--p-info-500);--p-info-contrast-color: var(--p-surface-0);--p-info-hover-color: var(--p-info-600);--p-info-active-color: var(--p-info-700);--p-help-color: var(--p-help-500);--p-help-contrast-color: var(--p-surface-0);--p-help-hover-color: var(--p-help-600);--p-help-active-color: var(--p-help-700);--p-accent-color: var(--p-accent-500);--p-accent-contrast-color: var(--p-surface-0);--p-accent-hover-color: var(--p-accent-600);--p-accent-active-color: var(--p-accent-700);--p-content-border-color: var(--p-surface-200);--p-content-hover-background: var(--p-surface-100);--p-content-hover-color: var(--p-surface-800);--p-highlight-background: var(--p-primary-50);--p-highlight-color: var(--p-primary-700);--p-highlight-focus-background: var(--p-primary-100);--p-highlight-focus-color: var(--p-primary-800);--p-content-background: var(--p-surface-0);--p-text-color: var(--p-surface-700);--p-text-hover-color: var(--p-surface-800);--p-text-muted-color: var(--p-surface-500);--p-text-hover-muted-color: var(--p-surface-600)}.spin{animation:kx-spin 1s linear infinite}@keyframes kx-spin{to{transform:rotate(360deg)}}@media(prefers-reduced-motion:reduce){.spin{animation:none}}.kx-head{display:flex;align-items:center;gap:12px;padding:20px 24px 14px;flex-wrap:wrap}.kx-head-icon{width:40px;height:40px;border-radius:11px;flex:none;display:flex;align-items:center;justify-content:center;background:color-mix(in srgb,var(--p-primary-color) 14%,transparent);color:var(--p-primary-color)}.kx-head-icon svg{width:22px;height:22px}.kx-head-text{min-width:0}.kx-title{font-size:17px;font-weight:700;color:var(--p-text-color);margin:0}.kx-head-sub{font-size:13px;color:var(--p-text-muted-color);margin:2px 0 0}.kx-head-actions{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-left:auto}.kx-empty{text-align:center;padding:44px 24px;display:flex;flex-direction:column;align-items:center;gap:8px}.kx-empty-ico{width:56px;height:56px;border-radius:14px;display:flex;align-items:center;justify-content:center;background:color-mix(in srgb,var(--p-primary-color) 12%,transparent);color:var(--p-primary-color);margin-bottom:4px}.kx-empty-ico svg{width:28px;height:28px}.kx-empty-title{font-size:15px;font-weight:700;color:var(--p-text-color);margin:0}.kx-empty-sub{font-size:13px;color:var(--p-text-muted-color);max-width:380px;margin:0}.kx-empty>.p-button{margin-top:6px}.kx-empty-actions{display:flex;gap:8px;margin-top:6px}.kx-loading{display:flex;align-items:center;gap:8px;color:var(--p-text-muted-color);font-size:13px;padding:24px}.kx-err{margin:0 20px 8px;padding:9px 12px;border-radius:10px;font-size:13px;background:color-mix(in srgb,var(--p-danger-500) 12%,transparent);color:var(--p-danger-600, var(--p-danger-500))}.kx-err.inline{margin:12px 0 0}.kx-tag-sm,.kx-tag-sm.kx-tag-sm{display:inline-flex;align-items:center;gap:4px;padding:1px 7px;border-radius:var(--kx-radius-tag, 6px);font-size:10.5px;font-weight:600;line-height:1.5;white-space:nowrap}.kx-tag-sm svg,.kx-tag-sm.kx-tag-sm svg{width:12px;height:12px}.kx-tag-caps,.kx-tag-caps.kx-tag-caps{display:inline-flex;align-items:center;gap:3px;padding:2px 6px;border-radius:var(--kx-radius-tag, 6px);font-size:9px;font-weight:700;line-height:1.5;letter-spacing:.04em;text-transform:uppercase;white-space:nowrap}.kx-tag-caps svg,.kx-tag-caps.kx-tag-caps svg{width:11px;height:11px}*,:before,:after{--tw-border-spacing-x: 0;--tw-border-spacing-y: 0;--tw-translate-x: 0;--tw-translate-y: 0;--tw-rotate: 0;--tw-skew-x: 0;--tw-skew-y: 0;--tw-scale-x: 1;--tw-scale-y: 1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness: proximity;--tw-gradient-from-position: ;--tw-gradient-via-position: ;--tw-gradient-to-position: ;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width: 0px;--tw-ring-offset-color: #fff;--tw-ring-color: rgb(59 130 246 / .5);--tw-ring-offset-shadow: 0 0 #0000;--tw-ring-shadow: 0 0 #0000;--tw-shadow: 0 0 #0000;--tw-shadow-colored: 0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: ;--tw-contain-size: ;--tw-contain-layout: ;--tw-contain-paint: ;--tw-contain-style: }::backdrop{--tw-border-spacing-x: 0;--tw-border-spacing-y: 0;--tw-translate-x: 0;--tw-translate-y: 0;--tw-rotate: 0;--tw-skew-x: 0;--tw-skew-y: 0;--tw-scale-x: 1;--tw-scale-y: 1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness: proximity;--tw-gradient-from-position: ;--tw-gradient-via-position: ;--tw-gradient-to-position: ;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width: 0px;--tw-ring-offset-color: #fff;--tw-ring-color: rgb(59 130 246 / .5);--tw-ring-offset-shadow: 0 0 #0000;--tw-ring-shadow: 0 0 #0000;--tw-shadow: 0 0 #0000;--tw-shadow-colored: 0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: ;--tw-contain-size: ;--tw-contain-layout: ;--tw-contain-paint: ;--tw-contain-style: }*,:before,:after{box-sizing:border-box;border-width:0;border-style:solid;border-color:#e5e7eb}:before,:after{--tw-content: ""}html,:host{line-height:1.5;-webkit-text-size-adjust:100%;-moz-tab-size:4;tab-size:4;font-family:ui-sans-serif,system-ui,sans-serif,"Apple Color Emoji","Segoe UI Emoji",Segoe UI Symbol,"Noto Color Emoji";font-feature-settings:normal;font-variation-settings:normal;-webkit-tap-highlight-color:transparent}body{margin:0;line-height:inherit}hr{height:0;color:inherit;border-top-width:1px}abbr:where([title]){text-decoration:underline dotted}h1,h2,h3,h4,h5,h6{font-size:inherit;font-weight:inherit}a{color:inherit;text-decoration:inherit}b,strong{font-weight:bolder}code,kbd,samp,pre{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace;font-feature-settings:normal;font-variation-settings:normal;font-size:1em}small{font-size:80%}sub,sup{font-size:75%;line-height:0;position:relative;vertical-align:baseline}sub{bottom:-.25em}sup{top:-.5em}table{text-indent:0;border-color:inherit;border-collapse:collapse}button,input,optgroup,select,textarea{font-family:inherit;font-feature-settings:inherit;font-variation-settings:inherit;font-size:100%;font-weight:inherit;line-height:inherit;letter-spacing:inherit;color:inherit;margin:0;padding:0}button,select{text-transform:none}button,input:where([type=button]),input:where([type=reset]),input:where([type=submit]){-webkit-appearance:button;background-color:transparent;background-image:none}:-moz-focusring{outline:auto}:-moz-ui-invalid{box-shadow:none}progress{vertical-align:baseline}::-webkit-inner-spin-button,::-webkit-outer-spin-button{height:auto}[type=search]{-webkit-appearance:textfield;outline-offset:-2px}::-webkit-search-decoration{-webkit-appearance:none}::-webkit-file-upload-button{-webkit-appearance:button;font:inherit}summary{display:list-item}blockquote,dl,dd,h1,h2,h3,h4,h5,h6,hr,figure,p,pre{margin:0}fieldset{margin:0;padding:0}legend{padding:0}ol,ul,menu{list-style:none;margin:0;padding:0}dialog{padding:0}textarea{resize:vertical}input::placeholder,textarea::placeholder{opacity:1;color:#9ca3af}button,[role=button]{cursor:pointer}:disabled{cursor:default}img,svg,video,canvas,audio,iframe,embed,object{display:block;vertical-align:middle}img,video{max-width:100%;height:auto}[hidden]:where(:not([hidden=until-found])){display:none}@supports (-moz-appearance:none){*{scrollbar-color:initial;scrollbar-width:initial}}:host{display:block;height:100%;min-height:0}:host>div{height:100%;min-height:0}*,*:before,*:after{box-sizing:border-box}.kx{font-family:inherit;color:var(--p-text-color);background:var(--p-content-background);height:100%;display:flex;flex-direction:column;overflow:hidden}.kx-count{font-size:12.5px;color:var(--p-text-muted-color);display:inline-flex;align-items:center;gap:5px}.kx-pending{color:var(--p-primary-color)}.kx-head-actions>.kx-search{width:200px;max-width:40vw}.kx-select{font-size:13px}.kx-body{flex:1;min-height:0;display:flex}.kx-main{flex:1;min-width:0;min-height:0;height:100%;overflow-y:auto;padding:6px 20px 20px;display:flex;flex-direction:column;gap:14px}.kx-drop{border:2px dashed var(--p-content-border-color);border-radius:14px;padding:28px 20px;text-align:center;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:5px;transition:border-color .18s,background .18s,transform .18s,box-shadow .18s}.kx-drop:hover,.kx-drop.dragover{border-color:var(--p-primary-color);background:color-mix(in srgb,var(--p-primary-color) 7%,transparent);box-shadow:0 0 0 4px color-mix(in srgb,var(--p-primary-color) 8%,transparent)}.kx-drop.busy{cursor:progress;opacity:.7}.kx-drop-ico{width:30px;height:30px;color:var(--p-text-muted-color)}.kx-drop:hover .kx-drop-ico,.kx-drop.dragover .kx-drop-ico{color:var(--p-primary-color)}.kx-drop-title{font-size:14px;font-weight:600;color:var(--p-text-color);margin:4px 0 0}.kx-drop-sub{font-size:12px;color:var(--p-text-muted-color);margin:0}.kx-empty-cta{margin-top:12px}.kx-list{display:flex;flex-direction:column;border-top:1px solid var(--p-content-border-color)}.kx-row{position:relative;display:grid;grid-template-columns:38px minmax(0,2fr) auto auto auto;align-items:center;gap:14px;padding:11px 16px;border-bottom:1px solid var(--p-content-border-color)}.kx-row:last-child{border-bottom:none}.kx-row:hover{background:color-mix(in srgb,var(--p-text-color) 6%,transparent)}.kx-ficon{width:38px;height:38px;border-radius:10px;display:flex;align-items:center;justify-content:center;background:color-mix(in srgb,var(--p-primary-color) 12%,transparent);color:var(--p-primary-color)}.kx-ficon svg{width:20px;height:20px}.kx-id{min-width:0}.kx-progress{position:absolute;left:0;right:0;bottom:0;height:2px;overflow:hidden;background:color-mix(in srgb,var(--p-primary-color) 14%,transparent)}.kx-progress:after{content:"";position:absolute;inset:0;width:36%;background:var(--p-primary-color);border-radius:2px;animation:kx-indeterminate 1.15s ease-in-out infinite}@keyframes kx-indeterminate{0%{transform:translate(-120%)}to{transform:translate(380%)}}.kx-name{font-size:14px;font-weight:600;color:var(--p-text-color);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.kx-uuid{font-family:ui-monospace,Menlo,monospace;font-size:11px;font-weight:400;color:var(--p-text-muted-color)}.kx-sub{font-size:12px;color:var(--p-text-muted-color);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.kx-err-reason{font-size:12px;color:var(--p-danger-500);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.kx-type{color:var(--p-text-color);font-weight:600}.kx-badge{border:1px solid color-mix(in srgb,currentColor 28%,transparent)}.kx-badge:before{content:"";width:6px;height:6px;border-radius:50%;background:currentColor;flex:none}.kx-badge:has(svg):before{display:none}.kx-date{font-size:12px;color:var(--p-text-muted-color);white-space:nowrap}.kx-actions{display:flex;gap:6px;opacity:0;transition:opacity .15s}.kx-row:hover .kx-actions,.kx-row:focus-within .kx-actions{opacity:1}.kx-side-drawer>.kx-side-drawer-content{padding:0;display:flex;flex-direction:column;min-height:0}.kx-side{flex:1;min-height:0;display:flex;flex-direction:column;background:var(--p-content-background)}.kx-pv-head{display:flex;align-items:center;gap:12px;padding:14px 18px;flex:none;border-bottom:1px solid var(--p-content-border-color)}.kx-pv-id{min-width:0;flex:1}.kx-pv-name{font-size:14.5px;font-weight:650;color:var(--p-text-color);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.kx-pv-sub{font-size:12px;color:var(--p-text-muted-color)}.kx-views{display:flex;align-items:center;gap:6px;flex:none;padding:8px 12px;border-bottom:1px solid var(--p-content-border-color)}.kx-part{flex:none;max-width:220px}.kx-part-label{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.kx-part-loading{display:inline-flex;align-items:center;color:var(--p-text-muted-color);padding:0 4px}.kx-part-loading svg{width:15px;height:15px}.kx-pv-view{flex:1;min-height:0;overflow:auto;padding:0}.kx-pv-view.kx-pv-padded{padding:20px 24px}.kx-pv-rv{display:block;width:100%;height:100%}.kx-parts-panel{flex:none;display:flex;flex-direction:column;border-top:1px solid var(--p-content-border-color)}.kx-parts-head{display:flex;align-items:center;gap:8px;flex:none;padding:6px 12px}.kx-parts-panel.open .kx-parts-head{border-bottom:1px solid var(--p-content-border-color)}.kx-parts-range{font-size:11.5px;color:var(--p-text-muted-color);margin-left:auto}.kx-parts-pager{display:flex;align-items:center;gap:4px}.kx-parts-pageno{font-size:11.5px;color:var(--p-text-muted-color);min-width:46px;text-align:center}.kx-parts-list{display:flex;flex-wrap:wrap;align-content:flex-start;gap:6px;padding:10px 14px;overflow-y:auto;max-height:min(34vh,280px)}@media(max-width:640px){.kx-row{grid-template-columns:38px minmax(0,1fr) auto auto;gap:10px;padding:11px 14px}.kx-date{display:none}.kx-actions{opacity:1}}.kx-drop:focus-visible{border-color:var(--p-focus-ring-color);outline:none;box-shadow:var(--p-focus-ring-shadow)}', qo = { props: { type: "object", properties: {} } }, Xo = {
  wippy: qo
};
class Qo extends mn {
  static get wippyConfig() {
    return {
      propsSchema: Xo.wippy.props,
      hostCssKeys: ["themeConfigUrl", "primeVueCssUrl"],
      inlineCss: Zo
    };
  }
  static get vueConfig() {
    return { rootComponent: Ho, plugins: [gn] };
  }
}
$n(import.meta.url, Qo);
//# sourceMappingURL=index.js.map

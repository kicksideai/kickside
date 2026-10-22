import { s as pe, B as te, a as U, f as nt, b as yt, c as wt, d as Qt, p as er, M as lt, l as pt, e as Ke, g as at, R as Ae, _ as tr, L as rr, h as we, v as he, i as nr, U as ar, I as ut, j as ir, r as xt, k as or, m as sr, n as z, x as je, W as lr, u as pr, o as ur, P as cr } from "./index-CghzfYQS.js";
import { openBlock as p, createElementBlock as m, mergeProps as b, createElementVNode as h, createBlock as C, resolveDynamicComponent as _, createCommentVNode as P, renderSlot as R, toDisplayString as T, resolveComponent as N, createVNode as w, normalizeStyle as dr, normalizeClass as I, toHandlers as Re, resolveDirective as ue, withDirectives as re, createSlots as kt, withCtx as D, Fragment as Z, renderList as ke, createTextVNode as Q, normalizeProps as fr, Transition as mr, defineComponent as Ct, computed as G, unref as l, vShow as gr, ref as F, watch as Ue, onMounted as hr, onBeforeUnmount as br, withModifiers as ct, withKeys as dt, isRef as vr } from "vue";
import { Icon as L } from "@iconify/vue";
import { on as yr, api as se, loadByTagName as wr, host as xr, define as kr } from "@wippy-fe/proxy";
var Pt = {
  name: "AngleRightIcon",
  extends: pe
};
function Cr(e) {
  return Ir(e) || Sr(e) || $r(e) || Pr();
}
function Pr() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function $r(e, t) {
  if (e) {
    if (typeof e == "string") return We(e, t);
    var r = {}.toString.call(e).slice(8, -1);
    return r === "Object" && e.constructor && (r = e.constructor.name), r === "Map" || r === "Set" ? Array.from(e) : r === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r) ? We(e, t) : void 0;
  }
}
function Sr(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function Ir(e) {
  if (Array.isArray(e)) return We(e);
}
function We(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var r = 0, n = Array(t); r < t; r++) n[r] = e[r];
  return n;
}
function Lr(e, t, r, n, i, a) {
  return p(), m("svg", b({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), Cr(t[0] || (t[0] = [h("path", {
    d: "M5.25 11.1728C5.14929 11.1694 5.05033 11.1455 4.9592 11.1025C4.86806 11.0595 4.78666 10.9984 4.72 10.9228C4.57955 10.7822 4.50066 10.5916 4.50066 10.3928C4.50066 10.1941 4.57955 10.0035 4.72 9.86283L7.72 6.86283L4.72 3.86283C4.66067 3.71882 4.64765 3.55991 4.68275 3.40816C4.71785 3.25642 4.79932 3.11936 4.91585 3.01602C5.03238 2.91268 5.17819 2.84819 5.33305 2.83149C5.4879 2.81479 5.64411 2.84671 5.78 2.92283L9.28 6.42283C9.42045 6.56346 9.49934 6.75408 9.49934 6.95283C9.49934 7.15158 9.42045 7.34221 9.28 7.48283L5.78 10.9228C5.71333 10.9984 5.63193 11.0595 5.5408 11.1025C5.44966 11.1455 5.35071 11.1694 5.25 11.1728Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
Pt.render = Lr;
var Ar = `
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
`, Tr = {
  root: function(t) {
    var r = t.props;
    return ["p-tag p-component", {
      "p-tag-info": r.severity === "info",
      "p-tag-success": r.severity === "success",
      "p-tag-warn": r.severity === "warn",
      "p-tag-danger": r.severity === "danger",
      "p-tag-secondary": r.severity === "secondary",
      "p-tag-contrast": r.severity === "contrast",
      "p-tag-rounded": r.rounded
    }];
  },
  icon: "p-tag-icon",
  label: "p-tag-label"
}, Dr = te.extend({
  name: "tag",
  style: Ar,
  classes: Tr
}), Br = {
  name: "BaseTag",
  extends: U,
  props: {
    value: null,
    severity: null,
    rounded: Boolean,
    icon: String
  },
  style: Dr,
  provide: function() {
    return {
      $pcTag: this,
      $parentInstance: this
    };
  }
};
function Ce(e) {
  "@babel/helpers - typeof";
  return Ce = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, Ce(e);
}
function Er(e, t, r) {
  return (t = Rr(t)) in e ? Object.defineProperty(e, t, { value: r, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = r, e;
}
function Rr(e) {
  var t = Fr(e, "string");
  return Ce(t) == "symbol" ? t : t + "";
}
function Fr(e, t) {
  if (Ce(e) != "object" || !e) return e;
  var r = e[Symbol.toPrimitive];
  if (r !== void 0) {
    var n = r.call(e, t);
    if (Ce(n) != "object") return n;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var $t = {
  name: "Tag",
  extends: Br,
  inheritAttrs: !1,
  computed: {
    dataP: function() {
      return nt(Er({
        rounded: this.rounded
      }, this.severity, this.severity));
    }
  }
}, Or = ["data-p"];
function Mr(e, t, r, n, i, a) {
  return p(), m("span", b({
    class: e.cx("root"),
    "data-p": a.dataP
  }, e.ptmi("root")), [e.$slots.icon ? (p(), C(_(e.$slots.icon), b({
    key: 0,
    class: e.cx("icon")
  }, e.ptm("icon")), null, 16, ["class"])) : e.icon ? (p(), m("span", b({
    key: 1,
    class: [e.cx("icon"), e.icon]
  }, e.ptm("icon")), null, 16)) : P("", !0), e.value != null || e.$slots.default ? R(e.$slots, "default", {
    key: 2
  }, function() {
    return [h("span", b({
      class: e.cx("label")
    }, e.ptm("label")), T(e.value), 17)];
  }) : P("", !0)], 16, Or);
}
$t.render = Mr;
var zr = `
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
`, Nr = {
  root: "p-inputgroup"
}, jr = te.extend({
  name: "inputgroup",
  style: zr,
  classes: Nr
}), Ur = {
  name: "BaseInputGroup",
  extends: U,
  style: jr,
  provide: function() {
    return {
      $pcInputGroup: this,
      $parentInstance: this
    };
  }
}, St = {
  name: "InputGroup",
  extends: Ur,
  inheritAttrs: !1
};
function Vr(e, t, r, n, i, a) {
  return p(), m("div", b({
    class: e.cx("root")
  }, e.ptmi("root")), [R(e.$slots, "default")], 16);
}
St.render = Vr;
var _r = {
  root: "p-inputgroupaddon"
}, Kr = te.extend({
  name: "inputgroupaddon",
  classes: _r
}), Wr = {
  name: "BaseInputGroupAddon",
  extends: U,
  style: Kr,
  provide: function() {
    return {
      $pcInputGroupAddon: this,
      $parentInstance: this
    };
  }
}, Ge = {
  name: "InputGroupAddon",
  extends: Wr,
  inheritAttrs: !1
};
function Gr(e, t, r, n, i, a) {
  return p(), m("div", b({
    class: e.cx("root")
  }, e.ptmi("root")), [R(e.$slots, "default")], 16);
}
Ge.render = Gr;
var Jr = `
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
function Pe(e) {
  "@babel/helpers - typeof";
  return Pe = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, Pe(e);
}
function Hr(e, t, r) {
  return (t = Zr(t)) in e ? Object.defineProperty(e, t, { value: r, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = r, e;
}
function Zr(e) {
  var t = qr(e, "string");
  return Pe(t) == "symbol" ? t : t + "";
}
function qr(e, t) {
  if (Pe(e) != "object" || !e) return e;
  var r = e[Symbol.toPrimitive];
  if (r !== void 0) {
    var n = r.call(e, t);
    if (Pe(n) != "object") return n;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var Xr = {
  paginator: function(t) {
    var r = t.instance, n = t.key;
    return ["p-paginator p-component", Hr({
      "p-paginator-default": !r.hasBreakpoints()
    }, "p-paginator-".concat(n), r.hasBreakpoints())];
  },
  content: "p-paginator-content",
  contentStart: "p-paginator-content-start",
  contentEnd: "p-paginator-content-end",
  first: function(t) {
    var r = t.instance;
    return ["p-paginator-first", {
      "p-disabled": r.$attrs.disabled
    }];
  },
  firstIcon: "p-paginator-first-icon",
  prev: function(t) {
    var r = t.instance;
    return ["p-paginator-prev", {
      "p-disabled": r.$attrs.disabled
    }];
  },
  prevIcon: "p-paginator-prev-icon",
  next: function(t) {
    var r = t.instance;
    return ["p-paginator-next", {
      "p-disabled": r.$attrs.disabled
    }];
  },
  nextIcon: "p-paginator-next-icon",
  last: function(t) {
    var r = t.instance;
    return ["p-paginator-last", {
      "p-disabled": r.$attrs.disabled
    }];
  },
  lastIcon: "p-paginator-last-icon",
  pages: "p-paginator-pages",
  page: function(t) {
    var r = t.props, n = t.pageLink;
    return ["p-paginator-page", {
      "p-paginator-page-selected": n - 1 === r.page
    }];
  },
  current: "p-paginator-current",
  pcRowPerPageDropdown: "p-paginator-rpp-dropdown",
  pcJumpToPageDropdown: "p-paginator-jtp-dropdown",
  pcJumpToPageInputText: "p-paginator-jtp-input"
}, Yr = te.extend({
  name: "paginator",
  style: Jr,
  classes: Xr
}), It = {
  name: "AngleDoubleLeftIcon",
  extends: pe
};
function Qr(e) {
  return nn(e) || rn(e) || tn(e) || en();
}
function en() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function tn(e, t) {
  if (e) {
    if (typeof e == "string") return Je(e, t);
    var r = {}.toString.call(e).slice(8, -1);
    return r === "Object" && e.constructor && (r = e.constructor.name), r === "Map" || r === "Set" ? Array.from(e) : r === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r) ? Je(e, t) : void 0;
  }
}
function rn(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function nn(e) {
  if (Array.isArray(e)) return Je(e);
}
function Je(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var r = 0, n = Array(t); r < t; r++) n[r] = e[r];
  return n;
}
function an(e, t, r, n, i, a) {
  return p(), m("svg", b({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), Qr(t[0] || (t[0] = [h("path", {
    "fill-rule": "evenodd",
    "clip-rule": "evenodd",
    d: "M5.71602 11.164C5.80782 11.2021 5.9063 11.2215 6.00569 11.221C6.20216 11.2301 6.39427 11.1612 6.54025 11.0294C6.68191 10.8875 6.76148 10.6953 6.76148 10.4948C6.76148 10.2943 6.68191 10.1021 6.54025 9.96024L3.51441 6.9344L6.54025 3.90855C6.624 3.76126 6.65587 3.59011 6.63076 3.42254C6.60564 3.25498 6.525 3.10069 6.40175 2.98442C6.2785 2.86815 6.11978 2.79662 5.95104 2.7813C5.78229 2.76598 5.61329 2.80776 5.47112 2.89994L1.97123 6.39983C1.82957 6.54167 1.75 6.73393 1.75 6.9344C1.75 7.13486 1.82957 7.32712 1.97123 7.46896L5.47112 10.9991C5.54096 11.0698 5.62422 11.1259 5.71602 11.164ZM11.0488 10.9689C11.1775 11.1156 11.3585 11.2061 11.5531 11.221C11.7477 11.2061 11.9288 11.1156 12.0574 10.9689C12.1815 10.8302 12.25 10.6506 12.25 10.4645C12.25 10.2785 12.1815 10.0989 12.0574 9.96024L9.03158 6.93439L12.0574 3.90855C12.1248 3.76739 12.1468 3.60881 12.1204 3.45463C12.0939 3.30045 12.0203 3.15826 11.9097 3.04765C11.7991 2.93703 11.6569 2.86343 11.5027 2.83698C11.3486 2.81053 11.19 2.83252 11.0488 2.89994L7.51865 6.36957C7.37699 6.51141 7.29742 6.70367 7.29742 6.90414C7.29742 7.1046 7.37699 7.29686 7.51865 7.4387L11.0488 10.9689Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
It.render = an;
var Lt = {
  name: "AngleDownIcon",
  extends: pe
};
function on(e) {
  return un(e) || pn(e) || ln(e) || sn();
}
function sn() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function ln(e, t) {
  if (e) {
    if (typeof e == "string") return He(e, t);
    var r = {}.toString.call(e).slice(8, -1);
    return r === "Object" && e.constructor && (r = e.constructor.name), r === "Map" || r === "Set" ? Array.from(e) : r === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r) ? He(e, t) : void 0;
  }
}
function pn(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function un(e) {
  if (Array.isArray(e)) return He(e);
}
function He(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var r = 0, n = Array(t); r < t; r++) n[r] = e[r];
  return n;
}
function cn(e, t, r, n, i, a) {
  return p(), m("svg", b({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), on(t[0] || (t[0] = [h("path", {
    d: "M3.58659 4.5007C3.68513 4.50023 3.78277 4.51945 3.87379 4.55723C3.9648 4.59501 4.04735 4.65058 4.11659 4.7207L7.11659 7.7207L10.1166 4.7207C10.2619 4.65055 10.4259 4.62911 10.5843 4.65956C10.7427 4.69002 10.8871 4.77074 10.996 4.88976C11.1049 5.00877 11.1726 5.15973 11.1889 5.32022C11.2052 5.48072 11.1693 5.6422 11.0866 5.7807L7.58659 9.2807C7.44597 9.42115 7.25534 9.50004 7.05659 9.50004C6.85784 9.50004 6.66722 9.42115 6.52659 9.2807L3.02659 5.7807C2.88614 5.64007 2.80725 5.44945 2.80725 5.2507C2.80725 5.05195 2.88614 4.86132 3.02659 4.7207C3.09932 4.64685 3.18675 4.58911 3.28322 4.55121C3.37969 4.51331 3.48305 4.4961 3.58659 4.5007Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
Lt.render = cn;
var At = {
  name: "AngleUpIcon",
  extends: pe
};
function dn(e) {
  return hn(e) || gn(e) || mn(e) || fn();
}
function fn() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function mn(e, t) {
  if (e) {
    if (typeof e == "string") return Ze(e, t);
    var r = {}.toString.call(e).slice(8, -1);
    return r === "Object" && e.constructor && (r = e.constructor.name), r === "Map" || r === "Set" ? Array.from(e) : r === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r) ? Ze(e, t) : void 0;
  }
}
function gn(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function hn(e) {
  if (Array.isArray(e)) return Ze(e);
}
function Ze(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var r = 0, n = Array(t); r < t; r++) n[r] = e[r];
  return n;
}
function bn(e, t, r, n, i, a) {
  return p(), m("svg", b({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), dn(t[0] || (t[0] = [h("path", {
    d: "M10.4134 9.49931C10.3148 9.49977 10.2172 9.48055 10.1262 9.44278C10.0352 9.405 9.95263 9.34942 9.88338 9.27931L6.88338 6.27931L3.88338 9.27931C3.73811 9.34946 3.57409 9.3709 3.41567 9.34044C3.25724 9.30999 3.11286 9.22926 3.00395 9.11025C2.89504 8.99124 2.82741 8.84028 2.8111 8.67978C2.79478 8.51928 2.83065 8.35781 2.91338 8.21931L6.41338 4.71931C6.55401 4.57886 6.74463 4.49997 6.94338 4.49997C7.14213 4.49997 7.33276 4.57886 7.47338 4.71931L10.9734 8.21931C11.1138 8.35994 11.1927 8.55056 11.1927 8.74931C11.1927 8.94806 11.1138 9.13868 10.9734 9.27931C10.9007 9.35315 10.8132 9.41089 10.7168 9.44879C10.6203 9.48669 10.5169 9.5039 10.4134 9.49931Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
At.render = bn;
var vn = `
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
`, yn = {
  root: function(t) {
    var r = t.instance, n = t.props;
    return ["p-inputnumber p-component p-inputwrapper", {
      "p-invalid": r.$invalid,
      "p-inputwrapper-filled": r.$filled || n.allowEmpty === !1,
      "p-inputwrapper-focus": r.focused,
      "p-inputnumber-stacked": n.showButtons && n.buttonLayout === "stacked",
      "p-inputnumber-horizontal": n.showButtons && n.buttonLayout === "horizontal",
      "p-inputnumber-vertical": n.showButtons && n.buttonLayout === "vertical",
      "p-inputnumber-fluid": r.$fluid
    }];
  },
  pcInputText: "p-inputnumber-input",
  clearIcon: "p-inputnumber-clear-icon",
  buttonGroup: "p-inputnumber-button-group",
  incrementButton: function(t) {
    var r = t.instance, n = t.props;
    return ["p-inputnumber-button p-inputnumber-increment-button", {
      "p-disabled": n.showButtons && n.max !== null && r.maxBoundry()
    }];
  },
  decrementButton: function(t) {
    var r = t.instance, n = t.props;
    return ["p-inputnumber-button p-inputnumber-decrement-button", {
      "p-disabled": n.showButtons && n.min !== null && r.minBoundry()
    }];
  }
}, wn = te.extend({
  name: "inputnumber",
  style: vn,
  classes: yn
}), xn = {
  name: "BaseInputNumber",
  extends: Qt,
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
  style: wn,
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
  var r = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var n = Object.getOwnPropertySymbols(e);
    t && (n = n.filter(function(i) {
      return Object.getOwnPropertyDescriptor(e, i).enumerable;
    })), r.push.apply(r, n);
  }
  return r;
}
function mt(e) {
  for (var t = 1; t < arguments.length; t++) {
    var r = arguments[t] != null ? arguments[t] : {};
    t % 2 ? ft(Object(r), !0).forEach(function(n) {
      qe(e, n, r[n]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(r)) : ft(Object(r)).forEach(function(n) {
      Object.defineProperty(e, n, Object.getOwnPropertyDescriptor(r, n));
    });
  }
  return e;
}
function qe(e, t, r) {
  return (t = kn(t)) in e ? Object.defineProperty(e, t, { value: r, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = r, e;
}
function kn(e) {
  var t = Cn(e, "string");
  return $e(t) == "symbol" ? t : t + "";
}
function Cn(e, t) {
  if ($e(e) != "object" || !e) return e;
  var r = e[Symbol.toPrimitive];
  if (r !== void 0) {
    var n = r.call(e, t);
    if ($e(n) != "object") return n;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
function Pn(e) {
  return Ln(e) || In(e) || Sn(e) || $n();
}
function $n() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Sn(e, t) {
  if (e) {
    if (typeof e == "string") return Xe(e, t);
    var r = {}.toString.call(e).slice(8, -1);
    return r === "Object" && e.constructor && (r = e.constructor.name), r === "Map" || r === "Set" ? Array.from(e) : r === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r) ? Xe(e, t) : void 0;
  }
}
function In(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function Ln(e) {
  if (Array.isArray(e)) return Xe(e);
}
function Xe(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var r = 0, n = Array(t); r < t; r++) n[r] = e[r];
  return n;
}
var Tt = {
  name: "InputNumber",
  extends: xn,
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
        var r;
        this.d_modelValue = t, (r = this.$refs.clearIcon) !== null && r !== void 0 && (r = r.$el) !== null && r !== void 0 && r.style && (this.$refs.clearIcon.$el.style.display = pt(t) ? "none" : "block");
      }
    },
    locale: function(t, r) {
      this.updateConstructParser(t, r);
    },
    localeMatcher: function(t, r) {
      this.updateConstructParser(t, r);
    },
    mode: function(t, r) {
      this.updateConstructParser(t, r);
    },
    currency: function(t, r) {
      this.updateConstructParser(t, r);
    },
    currencyDisplay: function(t, r) {
      this.updateConstructParser(t, r);
    },
    useGrouping: function(t, r) {
      this.updateConstructParser(t, r);
    },
    minFractionDigits: function(t, r) {
      this.updateConstructParser(t, r);
    },
    maxFractionDigits: function(t, r) {
      this.updateConstructParser(t, r);
    },
    suffix: function(t, r) {
      this.updateConstructParser(t, r);
    },
    prefix: function(t, r) {
      this.updateConstructParser(t, r);
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
      var t = Pn(new Intl.NumberFormat(this.locale, {
        useGrouping: !1
      }).format(9876543210)).reverse(), r = new Map(t.map(function(n, i) {
        return [n, i];
      }));
      this._numeral = new RegExp("[".concat(t.join(""), "]"), "g"), this._group = this.getGroupingExpression(), this._minusSign = this.getMinusSignExpression(), this._currency = this.getCurrencyExpression(), this._decimal = this.getDecimalExpression(), this._suffix = this.getSuffixExpression(), this._prefix = this.getPrefixExpression(), this._index = function(n) {
        return r.get(n);
      };
    },
    updateConstructParser: function(t, r) {
      t !== r && this.constructParser();
    },
    escapeRegExp: function(t) {
      return t.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
    },
    getDecimalExpression: function() {
      var t = new Intl.NumberFormat(this.locale, mt(mt({}, this.getOptions()), {}, {
        useGrouping: !1
      })), r = t.format(1.1);
      return r === t.format(1) ? new RegExp("[]", "g") : new RegExp("[".concat(r.replace(this._currency, "").trim().replace(this._numeral, ""), "]"), "g");
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
          var r = new Intl.NumberFormat(this.locale, this.getOptions()), n = r.format(t);
          return this.prefix && (n = this.prefix + n), this.suffix && (n = n + this.suffix), n;
        }
        return t.toString();
      }
      return "";
    },
    parseValue: function(t) {
      var r = t.replace(this._suffix, "").replace(this._prefix, "").trim().replace(/\s/g, "").replace(this._currency, "").replace(this._group, "").replace(this._minusSign, "-").replace(this._decimal, ".").replace(this._numeral, this._index);
      if (r) {
        if (r === "-")
          return r;
        var n = +r;
        return isNaN(n) ? null : n;
      }
      return null;
    },
    repeat: function(t, r, n) {
      var i = this;
      if (!this.readonly) {
        var a = r || 500;
        this.clearTimer(), this.timer = setTimeout(function() {
          i.repeat(t, 40, n);
        }, a), this.spin(t, n);
      }
    },
    addWithPrecision: function(t, r) {
      var n = t.toString(), i = r.toString(), a = n.includes(".") ? n.split(".")[1].length : 0, o = i.includes(".") ? i.split(".")[1].length : 0, s = Math.max(a, o), f = Math.pow(10, s);
      return Math.round((t + r) * f) / f;
    },
    spin: function(t, r) {
      if (this.$refs.input) {
        var n = this.step * r, i = this.parseValue(this.$refs.input.$el.value) || 0, a = this.validateValue(this.addWithPrecision(i, n));
        this.updateInput(a, null, "spin"), this.updateModel(t, a), this.handleOnInput(t, i, a);
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
        var r = t.target.selectionStart, n = t.target.selectionEnd, i = n - r, a = t.target.value, o = null, s = t.code || t.key;
        switch (s) {
          case "ArrowUp":
            this.spin(t, 1), t.preventDefault();
            break;
          case "ArrowDown":
            this.spin(t, -1), t.preventDefault();
            break;
          case "ArrowLeft":
            if (i > 1) {
              var f = this.isNumeralChar(a.charAt(r)) ? r + 1 : r + 2;
              this.$refs.input.$el.setSelectionRange(f, f);
            } else this.isNumeralChar(a.charAt(r - 1)) || t.preventDefault();
            break;
          case "ArrowRight":
            if (i > 1) {
              var g = n - 1;
              this.$refs.input.$el.setSelectionRange(g, g);
            } else this.isNumeralChar(a.charAt(r)) || t.preventDefault();
            break;
          case "Tab":
          case "Enter":
          case "NumpadEnter":
            o = this.validateValue(this.parseValue(a)), this.$refs.input.$el.value = this.formatValue(o), this.$refs.input.$el.setAttribute("aria-valuenow", o), this.updateModel(t, o);
            break;
          case "Backspace": {
            if (t.preventDefault(), r === n) {
              r >= a.length && this.suffixChar !== null && (r = a.length - this.suffixChar.length, this.$refs.input.$el.setSelectionRange(r, r));
              var $ = a.charAt(r - 1), x = this.getDecimalCharIndexes(a), y = x.decimalCharIndex, k = x.decimalCharIndexWithoutPrefix;
              if (this.isNumeralChar($)) {
                var E = this.getDecimalLength(a);
                if (this._group.test($))
                  this._group.lastIndex = 0, o = a.slice(0, r - 2) + a.slice(r - 1);
                else if (this._decimal.test($))
                  this._decimal.lastIndex = 0, E ? this.$refs.input.$el.setSelectionRange(r - 1, r - 1) : o = a.slice(0, r - 1) + a.slice(r);
                else if (y > 0 && r > y) {
                  var O = this.isDecimalMode() && (this.minFractionDigits || 0) < E ? "" : "0";
                  o = a.slice(0, r - 1) + O + a.slice(r);
                } else k === 1 ? (o = a.slice(0, r - 1) + "0" + a.slice(r), o = this.parseValue(o) > 0 ? o : "") : o = a.slice(0, r - 1) + a.slice(r);
              }
              this.updateValue(t, o, null, "delete-single");
            } else
              o = this.deleteRange(a, r, n), this.updateValue(t, o, null, "delete-range");
            break;
          }
          case "Delete":
            if (t.preventDefault(), r === n) {
              var M = a.charAt(r), B = this.getDecimalCharIndexes(a), A = B.decimalCharIndex, K = B.decimalCharIndexWithoutPrefix;
              if (this.isNumeralChar(M)) {
                var j = this.getDecimalLength(a);
                if (this._group.test(M))
                  this._group.lastIndex = 0, o = a.slice(0, r) + a.slice(r + 2);
                else if (this._decimal.test(M))
                  this._decimal.lastIndex = 0, j ? this.$refs.input.$el.setSelectionRange(r + 1, r + 1) : o = a.slice(0, r) + a.slice(r + 1);
                else if (A > 0 && r > A) {
                  var q = this.isDecimalMode() && (this.minFractionDigits || 0) < j ? "" : "0";
                  o = a.slice(0, r) + q + a.slice(r + 1);
                } else K === 1 ? (o = a.slice(0, r) + "0" + a.slice(r + 1), o = this.parseValue(o) > 0 ? o : "") : o = a.slice(0, r) + a.slice(r + 1);
              }
              this.updateValue(t, o, null, "delete-back-single");
            } else
              o = this.deleteRange(a, r, n), this.updateValue(t, o, null, "delete-range");
            break;
          case "Home":
            t.preventDefault(), Ke(this.min) && this.updateModel(t, this.min);
            break;
          case "End":
            t.preventDefault(), Ke(this.max) && this.updateModel(t, this.max);
            break;
        }
      }
    },
    onInputKeyPress: function(t) {
      if (!this.readonly) {
        var r = t.key, n = this.isDecimalSign(r), i = this.isMinusSign(r);
        t.code !== "Enter" && t.preventDefault(), (Number(r) >= 0 && Number(r) <= 9 || i || n) && this.insert(t, r, {
          isDecimalSign: n,
          isMinusSign: i
        });
      }
    },
    onPaste: function(t) {
      if (!(this.readonly || this.disabled)) {
        t.preventDefault();
        var r = (t.clipboardData || window.clipboardData).getData("Text");
        if (!(this.inputId === "integeronly" && /[^\d-]/.test(r)) && r) {
          var n = this.parseValue(r);
          n != null && this.insert(t, n.toString());
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
      var r;
      return (r = this.locale) !== null && r !== void 0 && r.includes("fr") && [".", ","].includes(t) || this._decimal.test(t) ? (this._decimal.lastIndex = 0, !0) : !1;
    },
    isDecimalMode: function() {
      return this.mode === "decimal";
    },
    getDecimalCharIndexes: function(t) {
      var r = t.search(this._decimal);
      this._decimal.lastIndex = 0;
      var n = t.replace(this._prefix, "").trim().replace(/\s/g, "").replace(this._currency, ""), i = n.search(this._decimal);
      return this._decimal.lastIndex = 0, {
        decimalCharIndex: r,
        decimalCharIndexWithoutPrefix: i
      };
    },
    getCharIndexes: function(t) {
      var r = t.search(this._decimal);
      this._decimal.lastIndex = 0;
      var n = t.search(this._minusSign);
      this._minusSign.lastIndex = 0;
      var i = t.search(this._suffix);
      this._suffix.lastIndex = 0;
      var a = t.search(this._currency);
      return this._currency.lastIndex = 0, {
        decimalCharIndex: r,
        minusCharIndex: n,
        suffixCharIndex: i,
        currencyCharIndex: a
      };
    },
    insert: function(t, r) {
      var n = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {
        isDecimalSign: !1,
        isMinusSign: !1
      }, i = r.search(this._minusSign);
      if (this._minusSign.lastIndex = 0, !(!this.allowMinusSign() && i !== -1)) {
        var a = this.$refs.input.$el.selectionStart, o = this.$refs.input.$el.selectionEnd, s = this.$refs.input.$el.value.trim(), f = this.getCharIndexes(s), g = f.decimalCharIndex, $ = f.minusCharIndex, x = f.suffixCharIndex, y = f.currencyCharIndex, k;
        if (n.isMinusSign) {
          var E = $ === -1;
          (a === 0 || a === y + 1) && (k = s, (E || o !== 0) && (k = this.insertText(s, r, 0, o)), this.updateValue(t, k, r, "insert"));
        } else if (n.isDecimalSign)
          g > 0 && a === g ? this.updateValue(t, s, r, "insert") : g > a && g < o ? (k = this.insertText(s, r, a, o), this.updateValue(t, k, r, "insert")) : g === -1 && this.maxFractionDigits && (k = this.insertText(s, r, a, o), this.updateValue(t, k, r, "insert"));
        else {
          var O = this.numberFormat.resolvedOptions().maximumFractionDigits, M = a !== o ? "range-insert" : "insert";
          if (g > 0 && a > g) {
            if (a + r.length - (g + 1) <= O) {
              var B = y >= a ? y - 1 : x >= a ? x : s.length;
              k = s.slice(0, a) + r + s.slice(a + r.length, B) + s.slice(B), this.updateValue(t, k, r, M);
            }
          } else
            k = this.insertText(s, r, a, o), this.updateValue(t, k, r, M);
        }
      }
    },
    insertText: function(t, r, n, i) {
      var a = r === "." ? r : r.split(".");
      if (a.length === 2) {
        var o = t.slice(n, i).search(this._decimal);
        return this._decimal.lastIndex = 0, o > 0 ? t.slice(0, n) + this.formatValue(r) + t.slice(i) : this.formatValue(r) || t;
      } else return i - n === t.length ? this.formatValue(r) : n === 0 ? r + t.slice(i) : i === t.length ? t.slice(0, n) + r : t.slice(0, n) + r + t.slice(i);
    },
    deleteRange: function(t, r, n) {
      var i;
      return n - r === t.length ? i = "" : r === 0 ? i = t.slice(n) : n === t.length ? i = t.slice(0, r) : i = t.slice(0, r) + t.slice(n), i;
    },
    initCursor: function() {
      var t = this.$refs.input.$el.selectionStart, r = this.$refs.input.$el.value, n = r.length, i = null, a = (this.prefixChar || "").length;
      r = r.replace(this._prefix, ""), t = t - a;
      var o = r.charAt(t);
      if (this.isNumeralChar(o))
        return t + a;
      for (var s = t - 1; s >= 0; )
        if (o = r.charAt(s), this.isNumeralChar(o)) {
          i = s + a;
          break;
        } else
          s--;
      if (i !== null)
        this.$refs.input.$el.setSelectionRange(i + 1, i + 1);
      else {
        for (s = t; s < n; )
          if (o = r.charAt(s), this.isNumeralChar(o)) {
            i = s + a;
            break;
          } else
            s++;
        i !== null && this.$refs.input.$el.setSelectionRange(i, i);
      }
      return i || 0;
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
    updateValue: function(t, r, n, i) {
      var a = this.$refs.input.$el.value, o = null;
      r != null && (o = this.parseValue(r), o = !o && !this.allowEmpty ? 0 : o, this.updateInput(o, n, i, r), this.handleOnInput(t, a, o));
    },
    handleOnInput: function(t, r, n) {
      if (this.isValueChanged(r, n)) {
        var i, a;
        this.$emit("input", {
          originalEvent: t,
          value: n,
          formattedValue: r
        }), (i = (a = this.formField).onInput) === null || i === void 0 || i.call(a, {
          originalEvent: t,
          value: n
        });
      }
    },
    isValueChanged: function(t, r) {
      if (r === null && t !== null)
        return !0;
      if (r != null) {
        var n = typeof t == "string" ? this.parseValue(t) : t;
        return r !== n;
      }
      return !1;
    },
    validateValue: function(t) {
      return t === "-" || t == null ? null : this.min != null && t < this.min ? this.min : this.max != null && t > this.max ? this.max : t;
    },
    updateInput: function(t, r, n, i) {
      var a;
      r = r || "";
      var o = this.$refs.input.$el.value, s = this.formatValue(t), f = o.length;
      if (s !== i && (s = this.concatValues(s, i)), f === 0) {
        this.$refs.input.$el.value = s, this.$refs.input.$el.setSelectionRange(0, 0);
        var g = this.initCursor(), $ = g + r.length;
        this.$refs.input.$el.setSelectionRange($, $);
      } else {
        var x = this.$refs.input.$el.selectionStart, y = this.$refs.input.$el.selectionEnd;
        this.$refs.input.$el.value = s;
        var k = s.length;
        if (n === "range-insert") {
          var E = this.parseValue((o || "").slice(0, x)), O = E !== null ? E.toString() : "", M = O.split("").join("(".concat(this.groupChar, ")?")), B = new RegExp(M, "g");
          B.test(s);
          var A = r.split("").join("(".concat(this.groupChar, ")?")), K = new RegExp(A, "g");
          K.test(s.slice(B.lastIndex)), y = B.lastIndex + K.lastIndex, this.$refs.input.$el.setSelectionRange(y, y);
        } else if (k === f)
          n === "insert" || n === "delete-back-single" ? this.$refs.input.$el.setSelectionRange(y + 1, y + 1) : n === "delete-single" ? this.$refs.input.$el.setSelectionRange(y - 1, y - 1) : (n === "delete-range" || n === "spin") && this.$refs.input.$el.setSelectionRange(y, y);
        else if (n === "delete-back-single") {
          var j = o.charAt(y - 1), q = o.charAt(y), ae = f - k, ie = this._group.test(q);
          ie && ae === 1 ? y += 1 : !ie && this.isNumeralChar(j) && (y += -1 * ae + 1), this._group.lastIndex = 0, this.$refs.input.$el.setSelectionRange(y, y);
        } else if (o === "-" && n === "insert") {
          this.$refs.input.$el.setSelectionRange(0, 0);
          var ce = this.initCursor(), oe = ce + r.length + 1;
          this.$refs.input.$el.setSelectionRange(oe, oe);
        } else
          y = y + (k - f), this.$refs.input.$el.setSelectionRange(y, y);
      }
      this.$refs.input.$el.setAttribute("aria-valuenow", t), (a = this.$refs.clearIcon) !== null && a !== void 0 && (a = a.$el) !== null && a !== void 0 && a.style && (this.$refs.clearIcon.$el.style.display = pt(s) ? "none" : "block");
    },
    concatValues: function(t, r) {
      if (t && r) {
        var n = r.search(this._decimal);
        return this._decimal.lastIndex = 0, this.suffixChar ? n !== -1 ? t.replace(this.suffixChar, "").split(this._decimal)[0] + r.replace(this.suffixChar, "").slice(n) + this.suffixChar : t : n !== -1 ? t.split(this._decimal)[0] + r.slice(n) : t;
      }
      return t;
    },
    getDecimalLength: function(t) {
      if (t) {
        var r = t.split(this._decimal);
        if (r.length === 2)
          return r[1].replace(this._suffix, "").trim().replace(/\s/g, "").replace(this._currency, "").length;
      }
      return 0;
    },
    updateModel: function(t, r) {
      this.writeValue(r, t);
    },
    onInputFocus: function(t) {
      this.focused = !0, !this.disabled && !this.readonly && this.$refs.input.$el.value !== lt() && this.highlightOnFocus && t.target.select(), this.$emit("focus", t);
    },
    onInputBlur: function(t) {
      var r, n;
      this.focused = !1;
      var i = t.target, a = this.validateValue(this.parseValue(i.value));
      this.$emit("blur", {
        originalEvent: t,
        value: i.value
      }), (r = (n = this.formField).onBlur) === null || r === void 0 || r.call(n, t), i.value = this.formatValue(a), i.setAttribute("aria-valuenow", a), this.updateModel(t, a), !this.disabled && !this.readonly && this.highlightOnFocus && er();
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
        mousedown: function(n) {
          return t.onUpButtonMouseDown(n);
        },
        mouseup: function(n) {
          return t.onUpButtonMouseUp(n);
        },
        mouseleave: function(n) {
          return t.onUpButtonMouseLeave(n);
        },
        keydown: function(n) {
          return t.onUpButtonKeyDown(n);
        },
        keyup: function(n) {
          return t.onUpButtonKeyUp(n);
        }
      };
    },
    downButtonListeners: function() {
      var t = this;
      return {
        mousedown: function(n) {
          return t.onDownButtonMouseDown(n);
        },
        mouseup: function(n) {
          return t.onDownButtonMouseUp(n);
        },
        mouseleave: function(n) {
          return t.onDownButtonMouseLeave(n);
        },
        keydown: function(n) {
          return t.onDownButtonKeyDown(n);
        },
        keyup: function(n) {
          return t.onDownButtonKeyUp(n);
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
      return nt(qe(qe({
        invalid: this.$invalid,
        fluid: this.$fluid,
        filled: this.$variant === "filled"
      }, this.size, this.size), this.buttonLayout, this.showButtons && this.buttonLayout));
    }
  },
  components: {
    InputText: wt,
    AngleUpIcon: At,
    AngleDownIcon: Lt,
    TimesIcon: yt
  }
}, An = ["data-p"], Tn = ["data-p"], Dn = ["disabled", "data-p"], Bn = ["disabled", "data-p"], En = ["disabled", "data-p"], Rn = ["disabled", "data-p"];
function Fn(e, t, r, n, i, a) {
  var o = N("InputText"), s = N("TimesIcon");
  return p(), m("span", b({
    class: e.cx("root")
  }, e.ptmi("root"), {
    "data-p": a.dataP
  }), [w(o, {
    ref: "input",
    id: e.inputId,
    name: e.$formName,
    role: "spinbutton",
    class: I([e.cx("pcInputText"), e.inputClass]),
    style: dr(e.inputStyle),
    defaultValue: a.formattedValue,
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
    onInput: a.onUserInput,
    onKeydown: a.onInputKeyDown,
    onKeypress: a.onInputKeyPress,
    onPaste: a.onPaste,
    onClick: a.onInputClick,
    onFocus: a.onInputFocus,
    onBlur: a.onInputBlur,
    pt: e.ptm("pcInputText"),
    unstyled: e.unstyled,
    "data-p": a.dataP
  }, null, 8, ["id", "name", "class", "style", "defaultValue", "aria-valuemin", "aria-valuemax", "aria-valuenow", "inputmode", "disabled", "readonly", "placeholder", "aria-labelledby", "aria-label", "required", "size", "invalid", "variant", "onInput", "onKeydown", "onKeypress", "onPaste", "onClick", "onFocus", "onBlur", "pt", "unstyled", "data-p"]), e.showClear && e.buttonLayout !== "vertical" ? R(e.$slots, "clearicon", {
    key: 0,
    class: I(e.cx("clearIcon")),
    clearCallback: a.onClearClick
  }, function() {
    return [w(s, b({
      ref: "clearIcon",
      class: [e.cx("clearIcon")],
      onClick: a.onClearClick
    }, e.ptm("clearIcon")), null, 16, ["class", "onClick"])];
  }) : P("", !0), e.showButtons && e.buttonLayout === "stacked" ? (p(), m("span", b({
    key: 1,
    class: e.cx("buttonGroup")
  }, e.ptm("buttonGroup"), {
    "data-p": a.dataP
  }), [R(e.$slots, "incrementbutton", {
    listeners: a.upButtonListeners
  }, function() {
    return [h("button", b({
      class: [e.cx("incrementButton"), e.incrementButtonClass]
    }, Re(a.upButtonListeners, !0), {
      disabled: e.disabled,
      tabindex: -1,
      "aria-hidden": "true",
      type: "button"
    }, e.ptm("incrementButton"), {
      "data-p": a.dataP
    }), [R(e.$slots, e.$slots.incrementicon ? "incrementicon" : "incrementbuttonicon", {}, function() {
      return [(p(), C(_(e.incrementIcon || e.incrementButtonIcon ? "span" : "AngleUpIcon"), b({
        class: [e.incrementIcon, e.incrementButtonIcon]
      }, e.ptm("incrementIcon"), {
        "data-pc-section": "incrementicon"
      }), null, 16, ["class"]))];
    })], 16, Dn)];
  }), R(e.$slots, "decrementbutton", {
    listeners: a.downButtonListeners
  }, function() {
    return [h("button", b({
      class: [e.cx("decrementButton"), e.decrementButtonClass]
    }, Re(a.downButtonListeners, !0), {
      disabled: e.disabled,
      tabindex: -1,
      "aria-hidden": "true",
      type: "button"
    }, e.ptm("decrementButton"), {
      "data-p": a.dataP
    }), [R(e.$slots, e.$slots.decrementicon ? "decrementicon" : "decrementbuttonicon", {}, function() {
      return [(p(), C(_(e.decrementIcon || e.decrementButtonIcon ? "span" : "AngleDownIcon"), b({
        class: [e.decrementIcon, e.decrementButtonIcon]
      }, e.ptm("decrementIcon"), {
        "data-pc-section": "decrementicon"
      }), null, 16, ["class"]))];
    })], 16, Bn)];
  })], 16, Tn)) : P("", !0), R(e.$slots, "incrementbutton", {
    listeners: a.upButtonListeners
  }, function() {
    return [e.showButtons && e.buttonLayout !== "stacked" ? (p(), m("button", b({
      key: 0,
      class: [e.cx("incrementButton"), e.incrementButtonClass]
    }, Re(a.upButtonListeners, !0), {
      disabled: e.disabled,
      tabindex: -1,
      "aria-hidden": "true",
      type: "button"
    }, e.ptm("incrementButton"), {
      "data-p": a.dataP
    }), [R(e.$slots, e.$slots.incrementicon ? "incrementicon" : "incrementbuttonicon", {}, function() {
      return [(p(), C(_(e.incrementIcon || e.incrementButtonIcon ? "span" : "AngleUpIcon"), b({
        class: [e.incrementIcon, e.incrementButtonIcon]
      }, e.ptm("incrementIcon"), {
        "data-pc-section": "incrementicon"
      }), null, 16, ["class"]))];
    })], 16, En)) : P("", !0)];
  }), R(e.$slots, "decrementbutton", {
    listeners: a.downButtonListeners
  }, function() {
    return [e.showButtons && e.buttonLayout !== "stacked" ? (p(), m("button", b({
      key: 0,
      class: [e.cx("decrementButton"), e.decrementButtonClass]
    }, Re(a.downButtonListeners, !0), {
      disabled: e.disabled,
      tabindex: -1,
      "aria-hidden": "true",
      type: "button"
    }, e.ptm("decrementButton"), {
      "data-p": a.dataP
    }), [R(e.$slots, e.$slots.decrementicon ? "decrementicon" : "decrementbuttonicon", {}, function() {
      return [(p(), C(_(e.decrementIcon || e.decrementButtonIcon ? "span" : "AngleDownIcon"), b({
        class: [e.decrementIcon, e.decrementButtonIcon]
      }, e.ptm("decrementIcon"), {
        "data-pc-section": "decrementicon"
      }), null, 16, ["class"]))];
    })], 16, Rn)) : P("", !0)];
  })], 16, An);
}
Tt.render = Fn;
var Dt = {
  name: "AngleDoubleRightIcon",
  extends: pe
};
function On(e) {
  return jn(e) || Nn(e) || zn(e) || Mn();
}
function Mn() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function zn(e, t) {
  if (e) {
    if (typeof e == "string") return Ye(e, t);
    var r = {}.toString.call(e).slice(8, -1);
    return r === "Object" && e.constructor && (r = e.constructor.name), r === "Map" || r === "Set" ? Array.from(e) : r === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r) ? Ye(e, t) : void 0;
  }
}
function Nn(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function jn(e) {
  if (Array.isArray(e)) return Ye(e);
}
function Ye(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var r = 0, n = Array(t); r < t; r++) n[r] = e[r];
  return n;
}
function Un(e, t, r, n, i, a) {
  return p(), m("svg", b({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), On(t[0] || (t[0] = [h("path", {
    "fill-rule": "evenodd",
    "clip-rule": "evenodd",
    d: "M7.68757 11.1451C7.7791 11.1831 7.8773 11.2024 7.9764 11.2019C8.07769 11.1985 8.17721 11.1745 8.26886 11.1312C8.36052 11.088 8.44238 11.0265 8.50943 10.9505L12.0294 7.49085C12.1707 7.34942 12.25 7.15771 12.25 6.95782C12.25 6.75794 12.1707 6.56622 12.0294 6.42479L8.50943 2.90479C8.37014 2.82159 8.20774 2.78551 8.04633 2.80192C7.88491 2.81833 7.73309 2.88635 7.6134 2.99588C7.4937 3.10541 7.41252 3.25061 7.38189 3.40994C7.35126 3.56927 7.37282 3.73423 7.44337 3.88033L10.4605 6.89748L7.44337 9.91463C7.30212 10.0561 7.22278 10.2478 7.22278 10.4477C7.22278 10.6475 7.30212 10.8393 7.44337 10.9807C7.51301 11.0512 7.59603 11.1071 7.68757 11.1451ZM1.94207 10.9505C2.07037 11.0968 2.25089 11.1871 2.44493 11.2019C2.63898 11.1871 2.81949 11.0968 2.94779 10.9505L6.46779 7.49085C6.60905 7.34942 6.68839 7.15771 6.68839 6.95782C6.68839 6.75793 6.60905 6.56622 6.46779 6.42479L2.94779 2.90479C2.80704 2.83757 2.6489 2.81563 2.49517 2.84201C2.34143 2.86839 2.19965 2.94178 2.08936 3.05207C1.97906 3.16237 1.90567 3.30415 1.8793 3.45788C1.85292 3.61162 1.87485 3.76975 1.94207 3.9105L4.95922 6.92765L1.94207 9.9448C1.81838 10.0831 1.75 10.2621 1.75 10.4477C1.75 10.6332 1.81838 10.8122 1.94207 10.9505Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
Dt.render = Un;
var Bt = {
  name: "AngleLeftIcon",
  extends: pe
};
function Vn(e) {
  return Gn(e) || Wn(e) || Kn(e) || _n();
}
function _n() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Kn(e, t) {
  if (e) {
    if (typeof e == "string") return Qe(e, t);
    var r = {}.toString.call(e).slice(8, -1);
    return r === "Object" && e.constructor && (r = e.constructor.name), r === "Map" || r === "Set" ? Array.from(e) : r === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r) ? Qe(e, t) : void 0;
  }
}
function Wn(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function Gn(e) {
  if (Array.isArray(e)) return Qe(e);
}
function Qe(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var r = 0, n = Array(t); r < t; r++) n[r] = e[r];
  return n;
}
function Jn(e, t, r, n, i, a) {
  return p(), m("svg", b({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), Vn(t[0] || (t[0] = [h("path", {
    d: "M8.75 11.185C8.65146 11.1854 8.55381 11.1662 8.4628 11.1284C8.37179 11.0906 8.28924 11.0351 8.22 10.965L4.72 7.46496C4.57955 7.32433 4.50066 7.13371 4.50066 6.93496C4.50066 6.73621 4.57955 6.54558 4.72 6.40496L8.22 2.93496C8.36095 2.84357 8.52851 2.80215 8.69582 2.81733C8.86312 2.83252 9.02048 2.90344 9.14268 3.01872C9.26487 3.134 9.34483 3.28696 9.36973 3.4531C9.39463 3.61924 9.36303 3.78892 9.28 3.93496L6.28 6.93496L9.28 9.93496C9.42045 10.0756 9.49934 10.2662 9.49934 10.465C9.49934 10.6637 9.42045 10.8543 9.28 10.995C9.13526 11.1257 8.9448 11.1939 8.75 11.185Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
Bt.render = Jn;
var Hn = {
  name: "BasePaginator",
  extends: U,
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
  style: Yr,
  provide: function() {
    return {
      $pcPaginator: this,
      $parentInstance: this
    };
  }
}, Et = {
  name: "CurrentPageReport",
  hostName: "Paginator",
  extends: U,
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
function Zn(e, t, r, n, i, a) {
  return p(), m("span", b({
    class: e.cx("current")
  }, e.ptm("current")), T(a.text), 17);
}
Et.render = Zn;
var Rt = {
  name: "FirstPageLink",
  hostName: "Paginator",
  extends: U,
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
    AngleDoubleLeftIcon: It
  },
  directives: {
    ripple: Ae
  }
};
function qn(e, t, r, n, i, a) {
  var o = ue("ripple");
  return re((p(), m("button", b({
    class: e.cx("first"),
    type: "button"
  }, a.getPTOptions("first"), {
    "data-pc-group-section": "pagebutton"
  }), [(p(), C(_(r.template || "AngleDoubleLeftIcon"), b({
    class: e.cx("firstIcon")
  }, a.getPTOptions("firstIcon")), null, 16, ["class"]))], 16)), [[o]]);
}
Rt.render = qn;
var Ft = {
  name: "JumpToPageDropdown",
  hostName: "Paginator",
  extends: U,
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
      for (var t = [], r = 0; r < this.pageCount; r++)
        t.push({
          label: String(r + 1),
          value: r
        });
      return t;
    }
  },
  components: {
    JTPSelect: at
  }
};
function Xn(e, t, r, n, i, a) {
  var o = N("JTPSelect");
  return p(), C(o, {
    modelValue: r.page,
    options: a.pageOptions,
    optionLabel: "label",
    optionValue: "value",
    "onUpdate:modelValue": t[0] || (t[0] = function(s) {
      return a.onChange(s);
    }),
    class: I(e.cx("pcJumpToPageDropdown")),
    disabled: r.disabled,
    unstyled: e.unstyled,
    pt: e.ptm("pcJumpToPageDropdown"),
    "data-pc-group-section": "pagedropdown"
  }, kt({
    _: 2
  }, [r.templates.jumptopagedropdownicon ? {
    name: "dropdownicon",
    fn: D(function(s) {
      return [(p(), C(_(r.templates.jumptopagedropdownicon), {
        class: I(s.class)
      }, null, 8, ["class"]))];
    }),
    key: "0"
  } : void 0]), 1032, ["modelValue", "options", "class", "disabled", "unstyled", "pt"]);
}
Ft.render = Xn;
var Ot = {
  name: "JumpToPageInput",
  hostName: "Paginator",
  extends: U,
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
    JTPInput: Tt
  }
};
function Yn(e, t, r, n, i, a) {
  var o = N("JTPInput");
  return p(), C(o, {
    ref: "jtpInput",
    modelValue: i.d_page,
    class: I(e.cx("pcJumpToPageInputText")),
    "aria-label": a.inputArialabel,
    disabled: r.disabled,
    "onUpdate:modelValue": a.onChange,
    unstyled: e.unstyled,
    pt: e.ptm("pcJumpToPageInputText")
  }, null, 8, ["modelValue", "class", "aria-label", "disabled", "onUpdate:modelValue", "unstyled", "pt"]);
}
Ot.render = Yn;
var Mt = {
  name: "LastPageLink",
  hostName: "Paginator",
  extends: U,
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
    AngleDoubleRightIcon: Dt
  },
  directives: {
    ripple: Ae
  }
};
function Qn(e, t, r, n, i, a) {
  var o = ue("ripple");
  return re((p(), m("button", b({
    class: e.cx("last"),
    type: "button"
  }, a.getPTOptions("last"), {
    "data-pc-group-section": "pagebutton"
  }), [(p(), C(_(r.template || "AngleDoubleRightIcon"), b({
    class: e.cx("lastIcon")
  }, a.getPTOptions("lastIcon")), null, 16, ["class"]))], 16)), [[o]]);
}
Mt.render = Qn;
var zt = {
  name: "NextPageLink",
  hostName: "Paginator",
  extends: U,
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
    AngleRightIcon: Pt
  },
  directives: {
    ripple: Ae
  }
};
function ea(e, t, r, n, i, a) {
  var o = ue("ripple");
  return re((p(), m("button", b({
    class: e.cx("next"),
    type: "button"
  }, a.getPTOptions("next"), {
    "data-pc-group-section": "pagebutton"
  }), [(p(), C(_(r.template || "AngleRightIcon"), b({
    class: e.cx("nextIcon")
  }, a.getPTOptions("nextIcon")), null, 16, ["class"]))], 16)), [[o]]);
}
zt.render = ea;
var Nt = {
  name: "PageLinks",
  hostName: "Paginator",
  extends: U,
  inheritAttrs: !1,
  emits: ["click"],
  props: {
    value: Array,
    page: Number
  },
  methods: {
    getPTOptions: function(t, r) {
      return this.ptm(r, {
        context: {
          active: t === this.page
        }
      });
    },
    onPageLinkClick: function(t, r) {
      this.$emit("click", {
        originalEvent: t,
        value: r
      });
    },
    ariaPageLabel: function(t) {
      return this.$primevue.config.locale.aria ? this.$primevue.config.locale.aria.pageLabel.replace(/{page}/g, t) : void 0;
    }
  },
  directives: {
    ripple: Ae
  }
}, ta = ["aria-label", "aria-current", "onClick", "data-p-active"];
function ra(e, t, r, n, i, a) {
  var o = ue("ripple");
  return p(), m("span", b({
    class: e.cx("pages")
  }, e.ptm("pages")), [(p(!0), m(Z, null, ke(r.value, function(s) {
    return re((p(), m("button", b({
      key: s,
      class: e.cx("page", {
        pageLink: s
      }),
      type: "button",
      "aria-label": a.ariaPageLabel(s),
      "aria-current": s - 1 === r.page ? "page" : void 0,
      onClick: function(g) {
        return a.onPageLinkClick(g, s);
      }
    }, {
      ref_for: !0
    }, a.getPTOptions(s - 1, "page"), {
      "data-p-active": s - 1 === r.page
    }), [Q(T(s), 1)], 16, ta)), [[o]]);
  }), 128))], 16);
}
Nt.render = ra;
var jt = {
  name: "PrevPageLink",
  hostName: "Paginator",
  extends: U,
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
    AngleLeftIcon: Bt
  },
  directives: {
    ripple: Ae
  }
};
function na(e, t, r, n, i, a) {
  var o = ue("ripple");
  return re((p(), m("button", b({
    class: e.cx("prev"),
    type: "button"
  }, a.getPTOptions("prev"), {
    "data-pc-group-section": "pagebutton"
  }), [(p(), C(_(r.template || "AngleLeftIcon"), b({
    class: e.cx("prevIcon")
  }, a.getPTOptions("prevIcon")), null, 16, ["class"]))], 16)), [[o]]);
}
jt.render = na;
var Ut = {
  name: "RowsPerPageDropdown",
  hostName: "Paginator",
  extends: U,
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
        for (var r = 0; r < this.options.length; r++)
          t.push({
            label: String(this.options[r]),
            value: this.options[r]
          });
      return t;
    }
  },
  components: {
    RPPSelect: at
  }
};
function aa(e, t, r, n, i, a) {
  var o = N("RPPSelect");
  return p(), C(o, {
    modelValue: r.rows,
    options: a.rowsOptions,
    optionLabel: "label",
    optionValue: "value",
    "onUpdate:modelValue": t[0] || (t[0] = function(s) {
      return a.onChange(s);
    }),
    class: I(e.cx("pcRowPerPageDropdown")),
    disabled: r.disabled,
    unstyled: e.unstyled,
    pt: e.ptm("pcRowPerPageDropdown"),
    "data-pc-group-section": "pagedropdown"
  }, kt({
    _: 2
  }, [r.templates.rowsperpagedropdownicon ? {
    name: "dropdownicon",
    fn: D(function(s) {
      return [(p(), C(_(r.templates.rowsperpagedropdownicon), {
        class: I(s.class)
      }, null, 8, ["class"]))];
    }),
    key: "0"
  } : void 0]), 1032, ["modelValue", "options", "class", "disabled", "unstyled", "pt"]);
}
Ut.render = aa;
function et(e) {
  "@babel/helpers - typeof";
  return et = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, et(e);
}
function gt(e, t) {
  return la(e) || sa(e, t) || oa(e, t) || ia();
}
function ia() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function oa(e, t) {
  if (e) {
    if (typeof e == "string") return ht(e, t);
    var r = {}.toString.call(e).slice(8, -1);
    return r === "Object" && e.constructor && (r = e.constructor.name), r === "Map" || r === "Set" ? Array.from(e) : r === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r) ? ht(e, t) : void 0;
  }
}
function ht(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var r = 0, n = Array(t); r < t; r++) n[r] = e[r];
  return n;
}
function sa(e, t) {
  var r = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (r != null) {
    var n, i, a, o, s = [], f = !0, g = !1;
    try {
      if (a = (r = r.call(e)).next, t === 0) {
        if (Object(r) !== r) return;
        f = !1;
      } else for (; !(f = (n = a.call(r)).done) && (s.push(n.value), s.length !== t); f = !0) ;
    } catch ($) {
      g = !0, i = $;
    } finally {
      try {
        if (!f && r.return != null && (o = r.return(), Object(o) !== o)) return;
      } finally {
        if (g) throw i;
      }
    }
    return s;
  }
}
function la(e) {
  if (Array.isArray(e)) return e;
}
var Vt = {
  name: "Paginator",
  extends: Hn,
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
      var r = this.pageCount;
      if (t >= 0 && t < r) {
        this.d_first = this.d_rows * t;
        var n = {
          page: t,
          first: this.d_first,
          rows: this.d_rows,
          pageCount: r
        };
        this.$emit("update:first", this.d_first), this.$emit("update:rows", this.d_rows), this.$emit("page", n);
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
        var r;
        this.styleElement = document.createElement("style"), this.styleElement.type = "text/css", tr(this.styleElement, "nonce", (r = this.$primevue) === null || r === void 0 || (r = r.config) === null || r === void 0 || (r = r.csp) === null || r === void 0 ? void 0 : r.nonce), document.body.appendChild(this.styleElement);
        var n = "", i = Object.keys(this.template), a = {};
        i.sort(function(E, O) {
          return parseInt(E) - parseInt(O);
        }).forEach(function(E) {
          a[E] = t.template[E];
        });
        for (var o = 0, s = Object.entries(Object.entries(a)); o < s.length; o++) {
          var f = gt(s[o], 2), g = f[0], $ = gt(f[1], 1), x = $[0], y = void 0, k = void 0;
          x !== "default" && typeof Object.keys(a)[g - 1] == "string" ? k = Number(Object.keys(a)[g - 1].slice(0, -2)) + 1 + "px" : k = Object.keys(a)[g - 1], y = Object.entries(a)[g - 1] ? "and (min-width:".concat(k, ")") : "", x === "default" ? n += `
                            @media screen `.concat(y, ` {
                                .p-paginator[`).concat(this.$attrSelector, `],
                                    display: flex;
                                }
                            }
                        `) : n += `
.p-paginator-`.concat(x, ` {
    display: none;
}
@media screen `).concat(y, " and (max-width: ").concat(x, `) {
    .p-paginator-`).concat(x, ` {
        display: flex;
    }

    .p-paginator-default{
        display: none;
    }
}
                    `);
        }
        this.styleElement.innerHTML = n;
      }
    },
    hasBreakpoints: function() {
      return et(this.template) === "object";
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
        for (var r in t)
          t[r] = this.template[r].split(" ").map(function(n) {
            return n.trim();
          });
        return t;
      }
      return t.default = this.template.split(" ").map(function(n) {
        return n.trim();
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
      var t = this.pageCount, r = Math.min(this.pageLinkSize, t), n = Math.max(0, Math.ceil(this.page - r / 2)), i = Math.min(t - 1, n + r - 1), a = this.pageLinkSize - (i - n + 1);
      return n = Math.max(0, n - a), [n, i];
    },
    pageLinks: function() {
      for (var t = [], r = this.calculatePageLinkBoundaries, n = r[0], i = r[1], a = n; a <= i; a++)
        t.push(a + 1);
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
    CurrentPageReport: Et,
    FirstPageLink: Rt,
    LastPageLink: Mt,
    NextPageLink: zt,
    PageLinks: Nt,
    PrevPageLink: jt,
    RowsPerPageDropdown: Ut,
    JumpToPageDropdown: Ft,
    JumpToPageInput: Ot
  }
};
function pa(e, t, r, n, i, a) {
  var o = N("FirstPageLink"), s = N("PrevPageLink"), f = N("NextPageLink"), g = N("LastPageLink"), $ = N("PageLinks"), x = N("CurrentPageReport"), y = N("RowsPerPageDropdown"), k = N("JumpToPageDropdown"), E = N("JumpToPageInput");
  return e.alwaysShow || a.pageLinks && a.pageLinks.length > 1 ? (p(), m("nav", fr(b({
    key: 0
  }, e.ptmi("paginatorContainer"))), [(p(!0), m(Z, null, ke(a.templateItems, function(O, M) {
    return p(), m("div", b({
      key: M,
      ref_for: !0,
      ref: "paginator",
      class: e.cx("paginator", {
        key: M
      })
    }, {
      ref_for: !0
    }, e.ptm("root")), [e.$slots.container ? R(e.$slots, "container", {
      key: 0,
      first: i.d_first + 1,
      last: a.last,
      rows: i.d_rows,
      page: a.page,
      pageCount: a.pageCount,
      pageLinks: a.pageLinks,
      totalRecords: e.totalRecords,
      firstPageCallback: a.changePageToFirst,
      lastPageCallback: a.changePageToLast,
      prevPageCallback: a.changePageToPrev,
      nextPageCallback: a.changePageToNext,
      rowChangeCallback: a.onRowChange,
      changePageCallback: a.changePage
    }) : (p(), m(Z, {
      key: 1
    }, [e.$slots.start ? (p(), m("div", b({
      key: 0,
      class: e.cx("contentStart")
    }, {
      ref_for: !0
    }, e.ptm("contentStart")), [R(e.$slots, "start", {
      state: a.currentState
    })], 16)) : P("", !0), h("div", b({
      class: e.cx("content")
    }, {
      ref_for: !0
    }, e.ptm("content")), [(p(!0), m(Z, null, ke(O, function(B) {
      return p(), m(Z, {
        key: B
      }, [B === "FirstPageLink" ? (p(), C(o, {
        key: 0,
        "aria-label": a.getAriaLabel("firstPageLabel"),
        template: e.$slots.firsticon || e.$slots.firstpagelinkicon,
        onClick: t[0] || (t[0] = function(A) {
          return a.changePageToFirst(A);
        }),
        disabled: a.isFirstPage || a.empty,
        unstyled: e.unstyled,
        pt: e.pt
      }, null, 8, ["aria-label", "template", "disabled", "unstyled", "pt"])) : B === "PrevPageLink" ? (p(), C(s, {
        key: 1,
        "aria-label": a.getAriaLabel("prevPageLabel"),
        template: e.$slots.previcon || e.$slots.prevpagelinkicon,
        onClick: t[1] || (t[1] = function(A) {
          return a.changePageToPrev(A);
        }),
        disabled: a.isFirstPage || a.empty,
        unstyled: e.unstyled,
        pt: e.pt
      }, null, 8, ["aria-label", "template", "disabled", "unstyled", "pt"])) : B === "NextPageLink" ? (p(), C(f, {
        key: 2,
        "aria-label": a.getAriaLabel("nextPageLabel"),
        template: e.$slots.nexticon || e.$slots.nextpagelinkicon,
        onClick: t[2] || (t[2] = function(A) {
          return a.changePageToNext(A);
        }),
        disabled: a.isLastPage || a.empty,
        unstyled: e.unstyled,
        pt: e.pt
      }, null, 8, ["aria-label", "template", "disabled", "unstyled", "pt"])) : B === "LastPageLink" ? (p(), C(g, {
        key: 3,
        "aria-label": a.getAriaLabel("lastPageLabel"),
        template: e.$slots.lasticon || e.$slots.lastpagelinkicon,
        onClick: t[3] || (t[3] = function(A) {
          return a.changePageToLast(A);
        }),
        disabled: a.isLastPage || a.empty,
        unstyled: e.unstyled,
        pt: e.pt
      }, null, 8, ["aria-label", "template", "disabled", "unstyled", "pt"])) : B === "PageLinks" ? (p(), C($, {
        key: 4,
        "aria-label": a.getAriaLabel("pageLabel"),
        value: a.pageLinks,
        page: a.page,
        onClick: t[4] || (t[4] = function(A) {
          return a.changePageLink(A);
        }),
        unstyled: e.unstyled,
        pt: e.pt
      }, null, 8, ["aria-label", "value", "page", "unstyled", "pt"])) : B === "CurrentPageReport" ? (p(), C(x, {
        key: 5,
        "aria-live": "polite",
        template: e.currentPageReportTemplate,
        currentPage: a.currentPage,
        page: a.page,
        pageCount: a.pageCount,
        first: i.d_first,
        rows: i.d_rows,
        totalRecords: e.totalRecords,
        unstyled: e.unstyled,
        pt: e.pt
      }, null, 8, ["template", "currentPage", "page", "pageCount", "first", "rows", "totalRecords", "unstyled", "pt"])) : B === "RowsPerPageDropdown" && e.rowsPerPageOptions ? (p(), C(y, {
        key: 6,
        "aria-label": a.getAriaLabel("rowsPerPageLabel"),
        rows: i.d_rows,
        options: e.rowsPerPageOptions,
        onRowsChange: t[5] || (t[5] = function(A) {
          return a.onRowChange(A);
        }),
        disabled: a.empty,
        templates: e.$slots,
        unstyled: e.unstyled,
        pt: e.pt
      }, null, 8, ["aria-label", "rows", "options", "disabled", "templates", "unstyled", "pt"])) : B === "JumpToPageDropdown" ? (p(), C(k, {
        key: 7,
        "aria-label": a.getAriaLabel("jumpToPageDropdownLabel"),
        page: a.page,
        pageCount: a.pageCount,
        onPageChange: t[6] || (t[6] = function(A) {
          return a.changePage(A);
        }),
        disabled: a.empty,
        templates: e.$slots,
        unstyled: e.unstyled,
        pt: e.pt
      }, null, 8, ["aria-label", "page", "pageCount", "disabled", "templates", "unstyled", "pt"])) : B === "JumpToPageInput" ? (p(), C(E, {
        key: 8,
        page: a.currentPage,
        onPageChange: t[7] || (t[7] = function(A) {
          return a.changePage(A);
        }),
        disabled: a.empty,
        unstyled: e.unstyled,
        pt: e.pt
      }, null, 8, ["page", "disabled", "unstyled", "pt"])) : P("", !0)], 64);
    }), 128))], 16), e.$slots.end ? (p(), m("div", b({
      key: 1,
      class: e.cx("contentEnd")
    }, {
      ref_for: !0
    }, e.ptm("contentEnd")), [R(e.$slots, "end", {
      state: a.currentState
    })], 16)) : P("", !0)], 64))], 16);
  }), 128))], 16)) : P("", !0);
}
Vt.render = pa;
function be(e) {
  return !!e && typeof e == "object" && !Array.isArray(e);
}
function ua(e, t) {
  return e;
}
function ca(e, t, r) {
  if (!t) return null;
  const n = be(e) ? e : {}, i = [
    n,
    be(n.data) ? n.data : null,
    be(n.payload) ? n.payload : null,
    be(n.detail) ? n.detail : null
  ].filter(Boolean);
  for (const a of i) {
    if (a.event !== "component.meta.changed") continue;
    const o = String(a.component_id || ""), s = String(n.topic || a.topic || "");
    if (!(o && o !== t) && !(!o && s !== `component.${t}`))
      return {
        event: "component.meta.changed",
        component_id: o || t,
        meta: ua(be(a.meta) ? a.meta : {}),
        deleted: Array.isArray(a.deleted) ? a.deleted.map(String) : []
      };
  }
  return null;
}
function da(e, t, r) {
  if (!e) return null;
  const n = yr(`component.${e}`, (i) => {
    const a = ca(i, e);
    a && t(a);
  });
  return typeof n == "function" ? n : null;
}
function fa(e) {
  if (!e) return null;
  let t;
  if (typeof e == "number")
    t = e;
  else {
    const r = e.trim();
    if (/^\d+$/.test(r))
      t = Number(r);
    else {
      const n = Date.parse(r);
      return Number.isNaN(n) ? null : n;
    }
  }
  return Number.isFinite(t) ? t < 1e12 ? t * 1e3 : t : null;
}
function ma(e) {
  const t = fa(e);
  return t === null ? "" : new Date(t).toLocaleString(void 0, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}
var ga = te.extend({
  name: "focustrap-directive"
}), ha = nr.extend({
  style: ga
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
  var r = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var n = Object.getOwnPropertySymbols(e);
    t && (n = n.filter(function(i) {
      return Object.getOwnPropertyDescriptor(e, i).enumerable;
    })), r.push.apply(r, n);
  }
  return r;
}
function vt(e) {
  for (var t = 1; t < arguments.length; t++) {
    var r = arguments[t] != null ? arguments[t] : {};
    t % 2 ? bt(Object(r), !0).forEach(function(n) {
      ba(e, n, r[n]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(r)) : bt(Object(r)).forEach(function(n) {
      Object.defineProperty(e, n, Object.getOwnPropertyDescriptor(r, n));
    });
  }
  return e;
}
function ba(e, t, r) {
  return (t = va(t)) in e ? Object.defineProperty(e, t, { value: r, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = r, e;
}
function va(e) {
  var t = ya(e, "string");
  return Se(t) == "symbol" ? t : t + "";
}
function ya(e, t) {
  if (Se(e) != "object" || !e) return e;
  var r = e[Symbol.toPrimitive];
  if (r !== void 0) {
    var n = r.call(e, t);
    if (Se(n) != "object") return n;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var wa = ha.extend("focustrap", {
  mounted: function(t, r) {
    var n = r.value || {}, i = n.disabled;
    i || (this.createHiddenFocusableElements(t, r), this.bind(t, r), this.autoElementFocus(t, r)), t.setAttribute("data-pd-focustrap", !0), this.$el = t;
  },
  updated: function(t, r) {
    var n = r.value || {}, i = n.disabled;
    i && this.unbind(t);
  },
  unmounted: function(t) {
    this.unbind(t);
  },
  methods: {
    getComputedSelector: function(t) {
      return ':not(.p-hidden-focusable):not([data-p-hidden-focusable="true"])'.concat(t ?? "");
    },
    bind: function(t, r) {
      var n = this, i = r.value || {}, a = i.onFocusIn, o = i.onFocusOut;
      t.$_pfocustrap_mutationobserver = new MutationObserver(function(s) {
        s.forEach(function(f) {
          if (f.type === "childList" && !t.contains(document.activeElement)) {
            var g = function(x) {
              var y = ut(x) ? ut(x, n.getComputedSelector(t.$_pfocustrap_focusableselector)) ? x : he(t, n.getComputedSelector(t.$_pfocustrap_focusableselector)) : he(x);
              return Ke(y) ? y : x.nextSibling && g(x.nextSibling);
            };
            we(g(f.nextSibling));
          }
        });
      }), t.$_pfocustrap_mutationobserver.disconnect(), t.$_pfocustrap_mutationobserver.observe(t, {
        childList: !0
      }), t.$_pfocustrap_focusinlistener = function(s) {
        return a && a(s);
      }, t.$_pfocustrap_focusoutlistener = function(s) {
        return o && o(s);
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
    autoElementFocus: function(t, r) {
      var n = r.value || {}, i = n.autoFocusSelector, a = i === void 0 ? "" : i, o = n.firstFocusableSelector, s = o === void 0 ? "" : o, f = n.autoFocus, g = f === void 0 ? !1 : f, $ = he(t, "[autofocus]".concat(this.getComputedSelector(a)));
      g && !$ && ($ = he(t, this.getComputedSelector(s))), we($);
    },
    onFirstHiddenElementFocus: function(t) {
      var r, n = t.currentTarget, i = t.relatedTarget, a = i === n.$_pfocustrap_lasthiddenfocusableelement || !((r = this.$el) !== null && r !== void 0 && r.contains(i)) ? he(n.parentElement, this.getComputedSelector(n.$_pfocustrap_focusableselector)) : n.$_pfocustrap_lasthiddenfocusableelement;
      we(a);
    },
    onLastHiddenElementFocus: function(t) {
      var r, n = t.currentTarget, i = t.relatedTarget, a = i === n.$_pfocustrap_firsthiddenfocusableelement || !((r = this.$el) !== null && r !== void 0 && r.contains(i)) ? rr(n.parentElement, this.getComputedSelector(n.$_pfocustrap_focusableselector)) : n.$_pfocustrap_firsthiddenfocusableelement;
      we(a);
    },
    createHiddenFocusableElements: function(t, r) {
      var n = this, i = r.value || {}, a = i.tabIndex, o = a === void 0 ? 0 : a, s = i.firstFocusableSelector, f = s === void 0 ? "" : s, g = i.lastFocusableSelector, $ = g === void 0 ? "" : g, x = function(O) {
        return ar("span", {
          class: "p-hidden-accessible p-hidden-focusable",
          tabIndex: o,
          role: "presentation",
          "aria-hidden": !0,
          "data-p-hidden-accessible": !0,
          "data-p-hidden-focusable": !0,
          onFocus: O?.bind(n)
        });
      }, y = x(this.onFirstHiddenElementFocus), k = x(this.onLastHiddenElementFocus);
      y.$_pfocustrap_lasthiddenfocusableelement = k, y.$_pfocustrap_focusableselector = f, y.setAttribute("data-pc-section", "firstfocusableelement"), k.$_pfocustrap_firsthiddenfocusableelement = y, k.$_pfocustrap_focusableselector = $, k.setAttribute("data-pc-section", "lastfocusableelement"), t.prepend(y), t.append(k);
    }
  }
});
function xa() {
  or({
    variableName: xt("scrollbar.width").name
  });
}
function ka() {
  ir({
    variableName: xt("scrollbar.width").name
  });
}
var Ca = `
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
`, Pa = {
  mask: function(t) {
    var r = t.position, n = t.modal;
    return {
      position: "fixed",
      height: "100%",
      width: "100%",
      left: 0,
      top: 0,
      display: "flex",
      justifyContent: r === "left" ? "flex-start" : r === "right" ? "flex-end" : "center",
      alignItems: r === "top" ? "flex-start" : r === "bottom" ? "flex-end" : "center",
      pointerEvents: n ? "auto" : "none"
    };
  },
  root: {
    pointerEvents: "auto"
  }
}, $a = {
  mask: function(t) {
    var r = t.instance, n = t.props, i = ["left", "right", "top", "bottom"], a = i.find(function(o) {
      return o === n.position;
    });
    return ["p-drawer-mask", {
      "p-overlay-mask p-overlay-mask-enter-active": n.modal,
      "p-drawer-open": r.containerVisible,
      "p-drawer-full": r.fullScreen
    }, a ? "p-drawer-".concat(a) : ""];
  },
  root: function(t) {
    var r = t.instance;
    return ["p-drawer p-component", {
      "p-drawer-full": r.fullScreen
    }];
  },
  header: "p-drawer-header",
  title: "p-drawer-title",
  pcCloseButton: "p-drawer-close-button",
  content: "p-drawer-content",
  footer: "p-drawer-footer"
}, Sa = te.extend({
  name: "drawer",
  style: Ca,
  classes: $a,
  inlineStyles: Pa
}), Ia = {
  name: "BaseDrawer",
  extends: U,
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
  style: Sa,
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
function Ve(e, t, r) {
  return (t = La(t)) in e ? Object.defineProperty(e, t, { value: r, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = r, e;
}
function La(e) {
  var t = Aa(e, "string");
  return Ie(t) == "symbol" ? t : t + "";
}
function Aa(e, t) {
  if (Ie(e) != "object" || !e) return e;
  var r = e[Symbol.toPrimitive];
  if (r !== void 0) {
    var n = r.call(e, t);
    if (Ie(n) != "object") return n;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var _t = {
  name: "Drawer",
  extends: Ia,
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
    this.disableDocumentSettings(), this.mask && this.autoZIndex && je.clear(this.mask), this.container = null, this.mask = null;
  },
  methods: {
    hide: function() {
      this.$emit("update:visible", !1);
    },
    onEnter: function() {
      this.$emit("show"), this.focus(), this.bindDocumentKeyDownListener(), this.autoZIndex && je.set("modal", this.mask, this.baseZIndex || this.$primevue.config.zIndex.modal);
    },
    onAfterEnter: function() {
      this.enableDocumentSettings(), this.$emit("after-show");
    },
    onBeforeLeave: function() {
      this.modal && !this.isUnstyled && lr(this.mask, "p-overlay-mask-leave-active"), this.$emit("before-hide");
    },
    onLeave: function() {
      this.$emit("hide");
    },
    onAfterLeave: function() {
      this.autoZIndex && je.clear(this.mask), this.unbindDocumentKeyDownListener(), this.containerVisible = !1, this.disableDocumentSettings(), this.$emit("after-hide");
    },
    onMaskClick: function(t) {
      this.dismissable && this.modal && this.mask === t.target && this.hide();
    },
    focus: function() {
      var t = function(i) {
        return i && i.querySelector("[autofocus]");
      }, r = this.$slots.header && t(this.headerContainer);
      r || (r = this.$slots.default && t(this.container), r || (r = this.$slots.footer && t(this.footerContainer), r || (r = this.closeButton))), r && we(r);
    },
    enableDocumentSettings: function() {
      this.dismissable && !this.modal && this.bindOutsideClickListener(), this.blockScroll && xa();
    },
    disableDocumentSettings: function() {
      this.unbindOutsideClickListener(), this.blockScroll && ka();
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
      this.outsideClickListener || (this.outsideClickListener = function(r) {
        t.isOutsideClicked(r) && t.hide();
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
      return nt(Ve(Ve(Ve({
        "full-screen": this.position === "full"
      }, this.position, this.position), "open", this.containerVisible), "modal", this.modal));
    }
  },
  directives: {
    focustrap: wa
  },
  components: {
    Button: z,
    Portal: sr,
    TimesIcon: yt
  }
}, Ta = ["data-p"], Da = ["role", "aria-modal", "data-p"];
function Ba(e, t, r, n, i, a) {
  var o = N("Button"), s = N("Portal"), f = ue("focustrap");
  return p(), C(s, null, {
    default: D(function() {
      return [i.containerVisible ? (p(), m("div", b({
        key: 0,
        ref: a.maskRef,
        onMousedown: t[0] || (t[0] = function() {
          return a.onMaskClick && a.onMaskClick.apply(a, arguments);
        }),
        class: e.cx("mask"),
        style: e.sx("mask", !0, {
          position: e.position,
          modal: e.modal
        }),
        "data-p": a.dataP
      }, e.ptm("mask")), [w(mr, b({
        name: "p-drawer",
        onEnter: a.onEnter,
        onAfterEnter: a.onAfterEnter,
        onBeforeLeave: a.onBeforeLeave,
        onLeave: a.onLeave,
        onAfterLeave: a.onAfterLeave,
        appear: ""
      }, e.ptm("transition")), {
        default: D(function() {
          return [e.visible ? re((p(), m("div", b({
            key: 0,
            ref: a.containerRef,
            class: e.cx("root"),
            style: e.sx("root"),
            role: e.modal ? "dialog" : "complementary",
            "aria-modal": e.modal ? !0 : void 0,
            "data-p": a.dataP
          }, e.ptmi("root")), [e.$slots.container ? R(e.$slots, "container", {
            key: 0,
            closeCallback: a.hide
          }) : (p(), m(Z, {
            key: 1
          }, [h("div", b({
            ref: a.headerContainerRef,
            class: e.cx("header")
          }, e.ptm("header")), [R(e.$slots, "header", {
            class: I(e.cx("title"))
          }, function() {
            return [e.header ? (p(), m("div", b({
              key: 0,
              class: e.cx("title")
            }, e.ptm("title")), T(e.header), 17)) : P("", !0)];
          }), e.showCloseIcon ? R(e.$slots, "closebutton", {
            key: 0,
            closeCallback: a.hide
          }, function() {
            return [w(o, b({
              ref: a.closeButtonRef,
              type: "button",
              class: e.cx("pcCloseButton"),
              "aria-label": a.closeAriaLabel,
              unstyled: e.unstyled,
              onClick: a.hide
            }, e.closeButtonProps, {
              pt: e.ptm("pcCloseButton"),
              "data-pc-group-section": "iconcontainer"
            }), {
              icon: D(function(g) {
                return [R(e.$slots, "closeicon", {}, function() {
                  return [(p(), C(_(e.closeIcon ? "span" : "TimesIcon"), b({
                    class: [e.closeIcon, g.class]
                  }, e.ptm("pcCloseButton").icon), null, 16, ["class"]))];
                })];
              }),
              _: 3
            }, 16, ["class", "aria-label", "unstyled", "onClick", "pt"])];
          }) : P("", !0)], 16), h("div", b({
            ref: a.contentRef,
            class: e.cx("content")
          }, e.ptm("content")), [R(e.$slots, "default")], 16), e.$slots.footer ? (p(), m("div", b({
            key: 0,
            ref: a.footerContainerRef,
            class: e.cx("footer")
          }, e.ptm("footer")), [R(e.$slots, "footer")], 16)) : P("", !0)], 64))], 16, Da)), [[f]]) : P("", !0)];
        }),
        _: 3
      }, 16, ["onEnter", "onAfterEnter", "onBeforeLeave", "onLeave", "onAfterLeave"])], 16, Ta)) : P("", !0)];
    }),
    _: 3
  });
}
_t.render = Ba;
function ne(e) {
  return e === "failed" ? "error" : e || "uploaded";
}
function Kt(e) {
  return ne(e.status) === "error";
}
function Ea(e) {
  switch (ne(e)) {
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
function Ra(e) {
  const t = ne(e);
  return t.charAt(0).toUpperCase() + t.slice(1);
}
function le(e) {
  return (e.filename || "").trim() || "Untitled upload";
}
function tt(e) {
  const t = e || "";
  return t.startsWith("image/") ? "tabler:photo" : t === "application/pdf" ? "tabler:file-type-pdf" : t.includes("word") || t.includes("opendocument.text") || t === "application/rtf" ? "tabler:file-type-doc" : t.includes("sheet") || t.includes("excel") || t.includes("spreadsheet") || t === "text/csv" ? "tabler:file-type-xls" : t.includes("presentation") || t.includes("powerpoint") ? "tabler:file-type-ppt" : t === "application/epub+zip" ? "tabler:book" : t.startsWith("text/") || t === "application/json" || t === "application/xml" ? "tabler:file-text" : "tabler:file";
}
function Wt(e) {
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
  const r = (e.filename || "").split(".").pop();
  return r && r !== e.filename ? r.toUpperCase() : t || "File";
}
function Le(e) {
  if (!e) return "0 B";
  const t = ["B", "KB", "MB", "GB"], r = Math.min(Math.floor(Math.log(e) / Math.log(1024)), t.length - 1);
  return `${(e / Math.pow(1024, r)).toFixed(r ? 1 : 0)} ${t[r]}`;
}
function rt(e) {
  let t = e.trim().replace(/^[\w.]+:[\w.]+:\d+:\s*/, "");
  return t = t.replace(/(\d{4,})\s*bytes/g, (r, n) => Le(Number(n))), t = t.replace(/\(max\s+(\d{4,})\)/g, (r, n) => `(max ${Le(Number(n))})`), t && t.charAt(0).toUpperCase() + t.slice(1);
}
const Fa = ["image/", "audio/", "video/", "text/"], Oa = /* @__PURE__ */ new Set([
  "application/pdf",
  "application/json",
  "application/xml",
  "application/javascript",
  "application/x-yaml",
  "application/sql",
  "application/xhtml+xml"
]);
function Fe(e) {
  const t = (e || "").toLowerCase();
  return Fa.some((r) => t.startsWith(r)) || Oa.has(t);
}
const Ma = ["ocr_error", "asr_error", "conversion_error"], _e = {
  transcription_failed: "Text recognition failed.",
  persist_failed: "The recognized text could not be saved.",
  storage_unavailable: "The stored file could not be read.",
  storage_stat_failed: "The stored file could not be read.",
  storage_read_failed: "The stored file could not be read.",
  storage_pointer_missing: "The stored file is missing.",
  no_text_detected: "No text was found in this file.",
  too_large: "The file is too large for transcription.",
  transcript_too_large: "The transcript is too large to keep."
}, za = /* @__PURE__ */ new Set(["no_text_detected", "too_large", "transcript_too_large"]);
function Na(e) {
  for (const t of Ma) {
    const r = e.meta?.[t];
    if (typeof r == "string" && r) return r;
  }
  return "";
}
function ja(e) {
  const t = Na(e);
  return Kt(e) ? { tone: "error", text: _e[t] || (t ? "Text recognition failed." : e.error ? rt(e.error) : "Upload processing failed.") } : !t || ne(e.status) !== "completed" ? null : za.has(t) ? { tone: "info", text: _e[t] } : { tone: "info", text: `${_e[t] || "Text recognition did not complete."} The extracted text is shown.` };
}
function Gt(e) {
  const t = ne(e.status);
  return t === "completed" || t === "error";
}
const Ua = /* @__PURE__ */ new Set(["completed", "error"]);
function Va(e) {
  return !Ua.has(ne(e.status));
}
function ee(e) {
  return e.role === "primary" && (e.kind === "markdown" || e.mime_type === "text/markdown");
}
function xe(e) {
  return ee(e) ? "Markdown" : e.role === "extracted-image" ? e.label || "Image" : e.label || e.role || e.kind || e.artifact_id;
}
function _a(e) {
  const t = typeof e.metadata?.width == "number" && typeof e.metadata?.height == "number" ? `${e.metadata.width}×${e.metadata.height}` : null;
  return [
    ee(e) ? "Converted markdown" : e.role === "extracted-image" ? "Extracted image" : e.kind,
    e.mime_type,
    e.size ? Le(e.size) : null,
    t,
    e.occurrence_count && e.occurrence_count > 1 ? `${e.occurrence_count} occurrences` : null
  ].filter(Boolean).join(" · ");
}
function Ka(e) {
  const t = (e || "").toLowerCase();
  return t.startsWith("text/") || t.includes("markdown");
}
const Wa = {
  key: 0,
  class: "kx-side"
}, Ga = { class: "kx-pv-head" }, Ja = { class: "kx-ficon" }, Ha = { class: "kx-pv-id" }, Za = ["title"], qa = {
  key: 0,
  class: "kx-uuid"
}, Xa = { class: "kx-pv-sub" }, Ya = ["role"], Qa = { class: "kx-views" }, ei = ["content-type", "source-url", "filename", "alt"], ti = { class: "kx-parts-head" }, ri = { class: "kx-parts-range" }, ni = { class: "kx-parts-pager" }, ai = { class: "kx-parts-pageno" }, ii = {
  id: "uploads-extracted-parts",
  class: "kx-parts-list",
  role: "region",
  "aria-label": "Extracted parts"
}, oi = {
  key: 0,
  class: "kx-part-loading"
}, si = /* @__PURE__ */ Ct({
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
    gotoPartsPage: { type: Function },
    retrying: { type: Boolean },
    retryUpload: { type: Function }
  },
  emits: ["update:partsExpanded"],
  setup(e, { emit: t }) {
    const r = e, n = G(() => r.preview ? ja(r.preview) : null), i = t;
    return (a, o) => (p(), C(l(_t), {
      visible: !!e.preview,
      position: "right",
      modal: !0,
      dismissable: !0,
      "close-on-escape": !0,
      "show-close-icon": !1,
      class: "kx-side-drawer",
      pt: { root: { style: "width: min(1400px, 82vw)" }, content: { class: "kx-side-drawer-content" } },
      "aria-label": "File preview",
      "onUpdate:visible": o[4] || (o[4] = (s) => {
        s || e.closePreview();
      })
    }, {
      default: D(() => [
        e.preview ? (p(), m("div", Wa, [
          h("header", Ga, [
            h("span", Ja, [
              w(l(L), {
                icon: l(tt)(e.preview.mime_type),
                "aria-hidden": "true"
              }, null, 8, ["icon"])
            ]),
            h("div", Ha, [
              h("div", {
                class: "kx-pv-name",
                title: l(le)(e.preview)
              }, [
                Q(T(l(le)(e.preview)), 1),
                e.preview.filename?.trim() ? P("", !0) : (p(), m("span", qa, T(e.preview.uuid), 1))
              ], 8, Za),
              h("div", Xa, T(l(Wt)(e.preview)) + " · " + T(l(Le)(e.preview.size)), 1)
            ]),
            w(l(z), {
              type: "button",
              text: "",
              rounded: "",
              size: "small",
              "data-testid": "uploads-preview-download",
              disabled: e.busyAction,
              "aria-label": "Download",
              onClick: e.downloadActive
            }, {
              icon: D(({ class: s }) => [
                w(l(L), {
                  icon: e.busyAction ? "tabler:loader-2" : "tabler:download",
                  class: I([s, e.busyAction && "spin"]),
                  "aria-hidden": "true"
                }, null, 8, ["icon", "class"])
              ]),
              _: 1
            }, 8, ["disabled", "onClick"]),
            w(l(z), {
              type: "button",
              text: "",
              rounded: "",
              size: "small",
              "data-testid": "uploads-preview-open",
              disabled: e.busyAction,
              "aria-label": "Open in new tab",
              onClick: e.openActive
            }, {
              icon: D(({ class: s }) => [
                w(l(L), {
                  icon: "tabler:external-link",
                  class: I(s),
                  "aria-hidden": "true"
                }, null, 8, ["class"])
              ]),
              _: 1
            }, 8, ["disabled", "onClick"]),
            w(l(z), {
              type: "button",
              text: "",
              rounded: "",
              size: "small",
              "data-testid": "uploads-preview-close",
              "aria-label": "Close preview",
              onClick: e.closePreview
            }, {
              icon: D(({ class: s }) => [
                w(l(L), {
                  icon: "tabler:x",
                  class: I(s),
                  "aria-hidden": "true"
                }, null, 8, ["class"])
              ]),
              _: 1
            }, 8, ["onClick"])
          ]),
          n.value ? (p(), m("div", {
            key: 0,
            class: I(["kx-pv-fail", { "kx-pv-info": n.value.tone === "info" }]),
            role: n.value.tone === "error" ? "alert" : "status",
            "data-testid": "uploads-preview-error"
          }, [
            w(l(L), {
              icon: n.value.tone === "error" ? "tabler:alert-triangle" : "tabler:info-circle",
              "aria-hidden": "true"
            }, null, 8, ["icon"]),
            h("span", null, T(n.value.text), 1),
            n.value.tone === "error" ? (p(), C(l(z), {
              key: 0,
              type: "button",
              class: "kx-pv-retry",
              size: "small",
              severity: "danger",
              outlined: "",
              label: "Retry",
              "data-testid": "uploads-preview-retry",
              loading: e.retrying,
              disabled: e.retrying,
              onClick: o[0] || (o[0] = (s) => e.retryUpload(e.preview))
            }, {
              icon: D(({ class: s }) => [
                w(l(L), {
                  icon: "tabler:refresh",
                  class: I(s),
                  "aria-hidden": "true"
                }, null, 8, ["class"])
              ]),
              _: 1
            }, 8, ["loading", "disabled"])) : P("", !0)
          ], 10, Ya)) : P("", !0),
          h("div", Qa, [
            w(l(z), {
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
              icon: D(({ class: s }) => [
                w(l(L), {
                  icon: "tabler:file",
                  class: I(s),
                  "aria-hidden": "true"
                }, null, 8, ["class"])
              ]),
              _: 1
            }, 8, ["outlined", "aria-pressed", "onClick"]),
            e.hasPrimary ? (p(), C(l(z), {
              key: 0,
              type: "button",
              class: "kx-part",
              size: "small",
              rounded: "",
              outlined: !(e.artifactView && l(ee)(e.artifactView)),
              label: "Markdown",
              "data-testid": "uploads-view-markdown",
              "aria-pressed": !!e.artifactView && l(ee)(e.artifactView),
              pt: { label: { class: "kx-part-label" } },
              onClick: e.viewPrimary
            }, {
              icon: D(({ class: s }) => [
                w(l(L), {
                  icon: "tabler:markdown",
                  class: I(s),
                  "aria-hidden": "true"
                }, null, 8, ["class"])
              ]),
              _: 1
            }, 8, ["outlined", "aria-pressed", "onClick"])) : P("", !0)
          ]),
          h("div", {
            class: I(["kx-pv-view", { "kx-pv-padded": l(Ka)(e.activePreviewSource(e.preview).contentType) }])
          }, [
            (p(), m("wc-resource-view", {
              key: e.artifactView ? `${e.preview.uuid}:${e.artifactView.artifact_id}` : e.preview.uuid,
              class: "kx-pv-rv",
              "content-type": e.activePreviewSource(e.preview).contentType,
              "source-url": e.activePreviewSource(e.preview).sourceUrl,
              filename: e.activePreviewSource(e.preview).filename,
              alt: e.activePreviewSource(e.preview).filename
            }, null, 8, ei))
          ], 2),
          e.partsTotal || e.artifactsLoading ? (p(), m("div", {
            key: 1,
            class: I(["kx-parts-panel", { open: e.partsExpanded }])
          }, [
            h("div", ti, [
              w(l(z), {
                type: "button",
                text: "",
                size: "small",
                label: "Parts",
                badge: String(e.partsTotal),
                "badge-severity": "secondary",
                "data-testid": "uploads-parts-toggle",
                "aria-expanded": e.partsExpanded,
                "aria-controls": "uploads-extracted-parts",
                onClick: o[1] || (o[1] = (s) => i("update:partsExpanded", !e.partsExpanded))
              }, {
                icon: D(({ class: s }) => [
                  w(l(L), {
                    icon: e.partsExpanded ? "tabler:chevron-down" : "tabler:chevron-right",
                    class: I(s),
                    "aria-hidden": "true"
                  }, null, 8, ["icon", "class"])
                ]),
                _: 1
              }, 8, ["badge", "aria-expanded"]),
              e.partsExpanded && e.partsPages > 1 ? (p(), m(Z, { key: 0 }, [
                h("span", ri, T(e.partsRangeStart) + "–" + T(e.partsRangeEnd), 1),
                h("div", ni, [
                  w(l(z), {
                    type: "button",
                    text: "",
                    rounded: "",
                    size: "small",
                    "data-testid": "uploads-parts-previous",
                    disabled: e.partsPage <= 1,
                    "aria-label": "Previous parts",
                    onClick: o[2] || (o[2] = (s) => e.gotoPartsPage(e.partsPage - 1))
                  }, {
                    icon: D(({ class: s }) => [
                      w(l(L), {
                        icon: "tabler:chevron-left",
                        class: I(s),
                        "aria-hidden": "true"
                      }, null, 8, ["class"])
                    ]),
                    _: 1
                  }, 8, ["disabled"]),
                  h("span", ai, T(e.partsPage) + " / " + T(e.partsPages), 1),
                  w(l(z), {
                    type: "button",
                    text: "",
                    rounded: "",
                    size: "small",
                    "data-testid": "uploads-parts-next",
                    disabled: e.partsPage >= e.partsPages,
                    "aria-label": "Next parts",
                    onClick: o[3] || (o[3] = (s) => e.gotoPartsPage(e.partsPage + 1))
                  }, {
                    icon: D(({ class: s }) => [
                      w(l(L), {
                        icon: "tabler:chevron-right",
                        class: I(s),
                        "aria-hidden": "true"
                      }, null, 8, ["class"])
                    ]),
                    _: 1
                  }, 8, ["disabled"])
                ])
              ], 64)) : P("", !0)
            ]),
            re(h("div", ii, [
              (p(!0), m(Z, null, ke(e.currentArtifacts, (s) => (p(), C(l(z), {
                key: s.artifact_id,
                type: "button",
                class: "kx-part",
                size: "small",
                rounded: "",
                outlined: e.artifactView?.artifact_id !== s.artifact_id,
                label: l(xe)(s),
                disabled: !s.raw_url,
                title: l(_a)(s),
                "data-testid": "uploads-view-artifact",
                "data-artifact-id": s.artifact_id,
                "aria-pressed": e.artifactView?.artifact_id === s.artifact_id,
                pt: { label: { class: "kx-part-label" } },
                onClick: (f) => e.viewArtifact(s)
              }, {
                icon: D(({ class: f }) => [
                  w(l(L), {
                    icon: l(tt)(s.mime_type),
                    class: I(f),
                    "aria-hidden": "true"
                  }, null, 8, ["icon", "class"])
                ]),
                _: 2
              }, 1032, ["outlined", "label", "disabled", "title", "data-artifact-id", "aria-pressed", "onClick"]))), 128)),
              e.artifactsLoading ? (p(), m("span", oi, [
                w(l(L), {
                  icon: "tabler:loader-2",
                  class: "spin",
                  "aria-hidden": "true"
                })
              ])) : P("", !0)
            ], 512), [
              [gr, e.partsExpanded]
            ])
          ], 2)) : P("", !0)
        ])) : P("", !0)
      ]),
      _: 1
    }, 8, ["visible"]));
  }
}), ve = 30;
function li(e) {
  const t = F(null), r = F(null), n = F({}), i = F(!1), a = F(!1);
  function o(c) {
    return n.value[c] || {
      loaded: !1,
      loading: !1,
      error: "",
      primary: null,
      parts: [],
      total: 0,
      page: 1
    };
  }
  function s(c, S) {
    n.value = { ...n.value, [c]: S };
  }
  function f(c) {
    return c.role === "source" || c.locator?.type === "upload.original";
  }
  function g(c) {
    const S = o(c).primary;
    return S && ee(S) && S.raw_url ? S : null;
  }
  function $(c) {
    if (t.value?.uuid !== c.uuid || r.value || Fe(c.mime_type)) return;
    const S = g(c.uuid);
    S && (r.value = S);
  }
  function x(c) {
    return { contentType: c.mime_type, sourceUrl: `/api/v1/uploads/${c.uuid}/raw`, filename: c.filename || c.uuid };
  }
  function y(c) {
    if (r.value?.raw_url)
      return {
        contentType: r.value.mime_type || "application/octet-stream",
        sourceUrl: r.value.raw_url,
        filename: xe(r.value)
      };
    if (!Fe(c.mime_type)) {
      const S = g(c.uuid);
      if (S?.raw_url)
        return {
          contentType: S.mime_type || "text/markdown",
          sourceUrl: S.raw_url,
          filename: xe(S)
        };
    }
    return x(c);
  }
  function k(c) {
    Gt(c) && (r.value && t.value?.uuid !== c.uuid && (r.value = null), t.value = c, Be(c));
  }
  function E() {
    t.value = null, r.value = null;
  }
  function O() {
    r.value = null;
  }
  function M() {
    const c = t.value ? g(t.value.uuid) : null;
    c && (r.value = c);
  }
  function B(c) {
    c.raw_url && (r.value = c);
  }
  const A = G(() => t.value ? o(t.value.uuid).parts : []), K = G(() => t.value ? o(t.value.uuid).total : 0), j = G(() => t.value ? o(t.value.uuid).page : 1), q = G(() => Math.max(1, Math.ceil(K.value / ve))), ae = G(() => K.value ? (j.value - 1) * ve + 1 : 0), ie = G(() => Math.min(K.value, (j.value - 1) * ve + A.value.length)), ce = G(() => !!(t.value && g(t.value.uuid))), oe = G(() => !!(t.value && o(t.value.uuid).loading));
  function Oe(c) {
    if (!t.value) return;
    const S = Math.min(Math.max(1, c), q.value);
    S !== j.value && Be(t.value, !0, S);
  }
  function Te() {
    if (r.value?.raw_url) return r.value.raw_url;
    if (t.value && !Fe(t.value.mime_type)) {
      const c = g(t.value.uuid);
      if (c?.raw_url) return c.raw_url;
    }
    return t.value ? `/api/v1/uploads/${t.value.uuid}/raw` : "";
  }
  function Me() {
    if (r.value) return xe(r.value);
    if (t.value && !Fe(t.value.mime_type)) {
      const c = g(t.value.uuid);
      if (c) return xe(c);
    }
    return t.value ? t.value.filename || t.value.uuid : "download";
  }
  async function De(c) {
    if (!c) return null;
    try {
      const S = await se.get(c, { responseType: "blob" });
      return URL.createObjectURL(S.data);
    } catch (S) {
      return e.value = S instanceof Error ? S.message : "failed to fetch file", null;
    }
  }
  async function ze() {
    if (!a.value) {
      a.value = !0;
      try {
        const c = await De(Te());
        if (!c) return;
        const S = document.createElement("a");
        S.href = c, S.download = Me(), S.click(), setTimeout(() => URL.revokeObjectURL(c), 1e4);
      } finally {
        a.value = !1;
      }
    }
  }
  async function Ne() {
    if (!a.value) {
      a.value = !0;
      try {
        const c = await De(Te());
        c && (window.open(c, "_blank", "noopener"), setTimeout(() => URL.revokeObjectURL(c), 6e4));
      } finally {
        a.value = !1;
      }
    }
  }
  async function Be(c, S = !1, X = 1) {
    const J = o(c.uuid);
    if (!((J.loaded || J.loading) && !S)) {
      s(c.uuid, { ...J, loading: !0, error: "" });
      try {
        const V = (X - 1) * ve, { data: H } = await se.get(`/api/v1/uploads/${c.uuid}/artifacts`, { params: { limit: ve, offset: V } });
        if (!H.success) {
          s(c.uuid, { ...J, loaded: !0, loading: !1, error: H.error || "failed to load artifacts", primary: null, parts: [], total: 0, page: X });
          return;
        }
        const de = H.artifacts || [], Ee = H.primary || de.find((Y) => ee(Y) && !!Y.raw_url) || null, W = de.filter((Y) => !f(Y) && !ee(Y));
        s(c.uuid, {
          loaded: !0,
          loading: !1,
          error: "",
          primary: Ee,
          parts: W,
          total: Number(H.meta?.total ?? W.length),
          page: X
        }), X === 1 && $(c);
      } catch (V) {
        s(c.uuid, { ...J, loaded: !0, loading: !1, error: V instanceof Error ? V.message : "failed to load artifacts" });
      }
    }
  }
  return {
    preview: t,
    artifactView: r,
    artifactsByUpload: n,
    partsExpanded: i,
    busyAction: a,
    artifactStateFor: o,
    isSourceArtifact: f,
    primaryMarkdownFor: g,
    activePreviewSource: y,
    openPreview: k,
    closePreview: E,
    viewOriginal: O,
    viewPrimary: M,
    viewArtifact: B,
    currentArtifacts: A,
    partsTotal: K,
    partsPage: j,
    partsPages: q,
    partsRangeStart: ae,
    partsRangeEnd: ie,
    hasPrimary: ce,
    artifactsLoading: oe,
    gotoPartsPage: Oe,
    downloadActive: ze,
    openActive: Ne
  };
}
const pi = { class: "kx" }, ui = { class: "kx-head" }, ci = { class: "kx-head-icon" }, di = { class: "kx-head-actions" }, fi = { class: "kx-count" }, mi = {
  key: 0,
  class: "kx-count kx-pending"
}, gi = {
  key: 0,
  class: "kx-err"
}, hi = { class: "kx-body" }, bi = { class: "kx-main" }, vi = { class: "kx-drop-title" }, yi = {
  key: 0,
  class: "kx-loading"
}, wi = {
  key: 1,
  class: "kx-empty"
}, xi = { class: "kx-empty-ico" }, ki = {
  key: 2,
  class: "kx-empty"
}, Ci = { class: "kx-list" }, Pi = { class: "kx-ficon" }, $i = { class: "kx-id" }, Si = ["title"], Ii = {
  key: 0,
  class: "kx-uuid"
}, Li = { class: "kx-sub" }, Ai = { class: "kx-type" }, Ti = ["title"], Di = { class: "kx-date" }, Bi = { class: "kx-actions" }, Ei = {
  key: 0,
  class: "kx-progress",
  "aria-hidden": "true"
}, ye = 30, Ri = /* @__PURE__ */ Ct({
  __name: "uploads",
  setup(e) {
    const t = /* @__PURE__ */ new Set(["completed", "error"]), r = [
      { label: "All status", value: "all" },
      { label: "Uploaded", value: "uploaded" },
      { label: "Processing", value: "processing" },
      { label: "Completed", value: "completed" },
      { label: "Error", value: "error" }
    ], n = F([]), i = F(0), a = F(!1), o = F(""), s = F(!1), f = F(0), g = F(""), $ = F("all"), x = F(1), y = F(!1), k = F(!1), {
      preview: E,
      artifactView: O,
      partsExpanded: M,
      busyAction: B,
      activePreviewSource: A,
      openPreview: K,
      closePreview: j,
      viewOriginal: q,
      viewPrimary: ae,
      viewArtifact: ie,
      currentArtifacts: ce,
      partsTotal: oe,
      partsPage: Oe,
      partsPages: Te,
      partsRangeStart: Me,
      partsRangeEnd: De,
      hasPrimary: ze,
      artifactsLoading: Ne,
      gotoPartsPage: Be,
      downloadActive: c,
      openActive: S
    } = li(o), X = F(""), J = F({});
    let V = null, H = "";
    const de = G(() => typeof J.value.pending_count == "number" ? J.value.pending_count : n.value.filter((v) => !t.has(ne(v.status))).length), Ee = G(() => Math.max(1, Math.ceil(i.value / ye)));
    async function W() {
      a.value = !0, o.value = "";
      try {
        const v = { limit: ye, offset: (x.value - 1) * ye }, u = g.value.trim();
        u && (v.q = u), $.value !== "all" && (v.status = $.value);
        const { data: d } = await se.get("/api/v1/uploads/list", { params: v });
        d.success ? (n.value = d.uploads || [], i.value = Number(d.meta?.total ?? n.value.length), typeof d.component_id == "string" && (X.value = d.component_id)) : (n.value = [], i.value = 0);
      } catch (v) {
        n.value = [], i.value = 0, o.value = v instanceof Error ? v.message : "failed to load uploads";
      } finally {
        a.value = !1;
      }
    }
    function Y(v) {
      const u = Math.max(1, Math.min(Ee.value, v));
      u !== x.value && (x.value = u, W());
    }
    let fe = null;
    Ue(g, () => {
      fe && clearTimeout(fe), fe = setTimeout(() => {
        x.value = 1, W();
      }, 300);
    }), Ue($, () => {
      x.value = 1, W();
    });
    function it() {
      const v = X.value;
      !v || H === v || (V && V(), V = null, H = "", V = da(v, (u) => {
        J.value = { ...J.value, ...u.meta }, W();
      }), V && (H = v));
    }
    Ue(X, () => {
      it();
    });
    async function Jt(v) {
      const u = new FormData();
      u.append("file", v), u.append("metadata", JSON.stringify({ target_parent_id: "", filename: v.name }));
      try {
        const { data: d } = await se.post("/api/v1/uploads", u, { headers: { "Content-Type": "multipart/form-data" } });
        d.success || (o.value = d.error || `failed to upload "${v.name}"`);
      } catch (d) {
        o.value = d instanceof Error ? d.message : `failed to upload "${v.name}"`;
      }
    }
    async function ot(v) {
      const u = Array.from(v);
      if (u.length) {
        o.value = "", f.value += u.length;
        try {
          for (const d of u) await Jt(d);
        } finally {
          f.value = Math.max(0, f.value - u.length), x.value = 1, await W();
        }
      }
    }
    function me() {
      const v = document.createElement("input");
      v.type = "file", v.multiple = !0, v.onchange = () => {
        v.files?.length && ot(v.files);
      }, v.click();
    }
    function Ht(v) {
      v.preventDefault(), s.value = !1, v.dataTransfer?.files?.length && ot(v.dataTransfer.files);
    }
    async function Zt(v) {
      await xr.confirm({
        header: "Delete upload",
        message: "Deletes the file everywhere; workspace links are removed.",
        icon: "tabler:trash",
        acceptLabel: "Delete",
        rejectLabel: "Cancel",
        acceptClass: "p-button-danger"
      }) && await qt(v);
    }
    async function qt(v) {
      y.value = !0, o.value = "";
      try {
        const { data: u } = await se.delete(`/api/v1/uploads/${v.uuid}`);
        u.success ? (E.value?.uuid === v.uuid && j(), n.value.length === 1 && x.value > 1 && (x.value -= 1), await W()) : o.value = u.error || "failed to delete upload";
      } catch (u) {
        o.value = u instanceof Error ? u.message : "failed to delete upload";
      } finally {
        y.value = !1;
      }
    }
    async function Xt(v) {
      if (!k.value) {
        k.value = !0, o.value = "";
        try {
          const { data: u } = await se.post(`/api/v1/uploads/${v.uuid}/retry`);
          u.success ? (E.value?.uuid === v.uuid && j(), await W()) : o.value = u.error || "failed to retry upload";
        } catch (u) {
          o.value = u instanceof Error ? u.message : "failed to retry upload";
        } finally {
          k.value = !1;
        }
      }
    }
    function st(v) {
      v.key === "Escape" && E.value && j();
    }
    async function Yt() {
      try {
        await W(), it();
      } catch (v) {
        o.value = v instanceof Error ? v.message : "host API unavailable";
      }
    }
    return pr(Yt), hr(() => {
      window.addEventListener("keydown", st), wr("wc-resource-view", { timeoutMs: 1e4 }).catch(() => {
      });
    }), br(() => {
      window.removeEventListener("keydown", st), fe && clearTimeout(fe), V && V(), V = null, H = "";
    }), (v, u) => (p(), m("div", pi, [
      h("header", ui, [
        h("div", ci, [
          w(l(L), {
            icon: "tabler:files",
            "aria-hidden": "true"
          })
        ]),
        u[10] || (u[10] = h("div", { class: "kx-head-text" }, [
          h("h1", { class: "kx-title" }, "Uploads"),
          h("p", { class: "kx-head-sub" }, "Files your agents can read and process.")
        ], -1)),
        h("div", di, [
          h("span", fi, T(i.value) + " file" + T(i.value !== 1 ? "s" : ""), 1),
          de.value ? (p(), m("span", mi, [
            w(l(L), {
              icon: "tabler:loader-2",
              class: "spin",
              "aria-hidden": "true"
            }),
            Q(" " + T(de.value) + " processing", 1)
          ])) : P("", !0),
          w(l(St), { class: "kx-search" }, {
            default: D(() => [
              w(l(Ge), null, {
                default: D(() => [
                  w(l(L), {
                    icon: "tabler:search",
                    "aria-hidden": "true"
                  })
                ]),
                _: 1
              }),
              w(l(wt), {
                modelValue: g.value,
                "onUpdate:modelValue": u[0] || (u[0] = (d) => g.value = d),
                placeholder: "Search files…",
                "aria-label": "Search files",
                "data-testid": "uploads-search-input"
              }, null, 8, ["modelValue"]),
              g.value ? (p(), C(l(Ge), { key: 0 }, {
                default: D(() => [
                  w(l(z), {
                    type: "button",
                    text: "",
                    severity: "secondary",
                    size: "small",
                    "aria-label": "Clear search",
                    "data-testid": "uploads-search-clear",
                    onClick: u[1] || (u[1] = (d) => g.value = "")
                  }, {
                    icon: D(({ class: d }) => [
                      w(l(L), {
                        icon: "tabler:x",
                        class: I(d),
                        "aria-hidden": "true"
                      }, null, 8, ["class"])
                    ]),
                    _: 1
                  })
                ]),
                _: 1
              })) : P("", !0)
            ]),
            _: 1
          }),
          w(l(at), {
            modelValue: $.value,
            "onUpdate:modelValue": u[2] || (u[2] = (d) => $.value = d),
            class: "kx-select",
            options: r,
            "option-label": "label",
            "option-value": "value",
            "aria-label": "Filter by status"
          }, null, 8, ["modelValue"]),
          w(l(z), {
            type: "button",
            "data-testid": "uploads-header-upload",
            label: f.value > 0 ? "Uploading…" : "Upload",
            loading: f.value > 0,
            disabled: f.value > 0,
            onClick: me
          }, {
            icon: D(({ class: d }) => [
              w(l(L), {
                icon: "tabler:upload",
                class: I(d),
                "aria-hidden": "true"
              }, null, 8, ["class"])
            ]),
            _: 1
          }, 8, ["label", "loading", "disabled"])
        ])
      ]),
      o.value ? (p(), m("div", gi, T(o.value), 1)) : P("", !0),
      h("div", hi, [
        h("div", bi, [
          h("div", {
            class: I(["kx-drop", { dragover: s.value, busy: f.value > 0 }]),
            role: "button",
            tabindex: "0",
            "aria-label": "Upload files",
            onClick: u[3] || (u[3] = (d) => f.value === 0 && me()),
            onKeydown: [
              u[4] || (u[4] = dt((d) => f.value === 0 && me(), ["enter"])),
              u[5] || (u[5] = dt(ct((d) => f.value === 0 && me(), ["prevent"]), ["space"]))
            ],
            onDragover: u[6] || (u[6] = ct((d) => s.value = !0, ["prevent"])),
            onDragleave: u[7] || (u[7] = (d) => s.value = !1),
            onDrop: Ht
          }, [
            w(l(L), {
              icon: f.value > 0 ? "tabler:loader-2" : "tabler:cloud-upload",
              class: I(["kx-drop-ico", f.value > 0 && "spin"]),
              "aria-hidden": "true"
            }, null, 8, ["icon", "class"]),
            h("p", vi, T(f.value > 0 ? "Uploading…" : "Drop files or click to browse"), 1),
            u[11] || (u[11] = h("p", { class: "kx-drop-sub" }, "Documents convert to markdown; images and text are stored for agents.", -1))
          ], 34),
          a.value && !n.value.length ? (p(), m("div", yi, [
            w(l(L), {
              icon: "tabler:loader-2",
              class: "spin",
              "aria-hidden": "true"
            }),
            u[12] || (u[12] = Q(" Loading…", -1))
          ])) : !i.value && !g.value && $.value === "all" ? (p(), m("div", wi, [
            h("div", xi, [
              w(l(L), {
                icon: "tabler:cloud-upload",
                "aria-hidden": "true"
              })
            ]),
            u[13] || (u[13] = h("div", { class: "kx-empty-title" }, "No uploads yet", -1)),
            u[14] || (u[14] = h("div", { class: "kx-empty-sub" }, "Upload a document, image, or text file to make it available to your agents.", -1)),
            w(l(z), {
              type: "button",
              class: "kx-empty-cta",
              "data-testid": "uploads-empty-upload",
              label: "Upload files",
              onClick: me
            }, {
              icon: D(({ class: d }) => [
                w(l(L), {
                  icon: "tabler:upload",
                  class: I(d),
                  "aria-hidden": "true"
                }, null, 8, ["class"])
              ]),
              _: 1
            })
          ])) : n.value.length ? (p(), m(Z, { key: 3 }, [
            h("div", Ci, [
              (p(!0), m(Z, null, ke(n.value, (d) => (p(), m("div", {
                key: d.uuid,
                class: "kx-row"
              }, [
                h("span", Pi, [
                  w(l(L), {
                    icon: l(tt)(d.mime_type),
                    "aria-hidden": "true"
                  }, null, 8, ["icon"])
                ]),
                h("div", $i, [
                  h("div", {
                    class: "kx-name",
                    title: l(le)(d)
                  }, [
                    Q(T(l(le)(d)), 1),
                    d.filename?.trim() ? P("", !0) : (p(), m("span", Ii, T(d.uuid), 1))
                  ], 8, Si),
                  h("div", Li, [
                    h("span", Ai, T(l(Wt)(d)), 1),
                    Q(" · " + T(l(Le)(d.size)), 1)
                  ]),
                  l(Kt)(d) && d.error ? (p(), m("div", {
                    key: 0,
                    class: "kx-err-reason",
                    title: l(rt)(d.error)
                  }, T(l(rt)(d.error)), 9, Ti)) : P("", !0)
                ]),
                w(l($t), {
                  severity: l(Ea)(d.status),
                  class: "kx-badge kx-tag-sm"
                }, {
                  default: D(() => [
                    l(t).has(d.status) ? P("", !0) : (p(), C(l(L), {
                      key: 0,
                      icon: "tabler:loader-2",
                      class: "spin",
                      "aria-hidden": "true"
                    })),
                    Q(" " + T(l(Ra)(d.status)), 1)
                  ]),
                  _: 2
                }, 1032, ["severity"]),
                h("span", Di, T(l(ma)(d.created_at)), 1),
                h("div", Bi, [
                  l(Gt)(d) ? (p(), C(l(z), {
                    key: 0,
                    type: "button",
                    text: "",
                    rounded: "",
                    size: "small",
                    "data-testid": "uploads-row-preview",
                    "data-upload-id": d.uuid,
                    "aria-label": `Preview ${l(le)(d)}`,
                    onClick: (ge) => l(K)(d)
                  }, {
                    icon: D(({ class: ge }) => [
                      w(l(L), {
                        icon: "tabler:eye",
                        class: I(ge),
                        "aria-hidden": "true"
                      }, null, 8, ["class"])
                    ]),
                    _: 1
                  }, 8, ["data-upload-id", "aria-label", "onClick"])) : P("", !0),
                  w(l(z), {
                    type: "button",
                    text: "",
                    rounded: "",
                    size: "small",
                    severity: "danger",
                    "data-testid": "uploads-row-delete",
                    "data-upload-id": d.uuid,
                    "aria-label": `Delete ${l(le)(d)}`,
                    onClick: (ge) => Zt(d)
                  }, {
                    icon: D(({ class: ge }) => [
                      w(l(L), {
                        icon: "tabler:trash",
                        class: I(ge),
                        "aria-hidden": "true"
                      }, null, 8, ["class"])
                    ]),
                    _: 1
                  }, 8, ["data-upload-id", "aria-label", "onClick"])
                ]),
                l(Va)(d) ? (p(), m("span", Ei)) : P("", !0)
              ]))), 128))
            ]),
            Ee.value > 1 ? (p(), C(l(Vt), {
              key: 0,
              first: (x.value - 1) * ye,
              rows: ye,
              "total-records": i.value,
              "page-link-size": 5,
              template: "CurrentPageReport PrevPageLink PageLinks NextPageLink",
              "current-page-report-template": "{first}–{last} of {totalRecords}",
              "data-testid": "uploads-pager",
              "aria-label": "Pagination",
              pt: {
                prev: { "data-testid": "uploads-pager-previous" },
                next: { "data-testid": "uploads-pager-next" }
              },
              onPage: u[8] || (u[8] = (d) => Y(d.page + 1))
            }, null, 8, ["first", "total-records"])) : P("", !0)
          ], 64)) : (p(), m("div", ki, [...u[15] || (u[15] = [
            h("div", { class: "kx-empty-title" }, "No matches", -1),
            h("div", { class: "kx-empty-sub" }, "No files match the current search or filter.", -1)
          ])]))
        ])
      ]),
      w(si, {
        "parts-expanded": l(M),
        "onUpdate:partsExpanded": u[9] || (u[9] = (d) => vr(M) ? M.value = d : null),
        preview: l(E),
        "artifact-view": l(O),
        "busy-action": l(B),
        "current-artifacts": l(ce),
        "parts-total": l(oe),
        "parts-page": l(Oe),
        "parts-pages": l(Te),
        "parts-range-start": l(Me),
        "parts-range-end": l(De),
        "has-primary": l(ze),
        "artifacts-loading": l(Ne),
        "active-preview-source": l(A),
        "download-active": l(c),
        "open-active": l(S),
        "close-preview": l(j),
        "view-original": l(q),
        "view-primary": l(ae),
        "view-artifact": l(ie),
        "goto-parts-page": l(Be),
        retrying: k.value,
        "retry-upload": Xt
      }, null, 8, ["parts-expanded", "preview", "artifact-view", "busy-action", "current-artifacts", "parts-total", "parts-page", "parts-pages", "parts-range-start", "parts-range-end", "has-primary", "artifacts-loading", "active-preview-source", "download-active", "open-active", "close-preview", "view-original", "view-primary", "view-artifact", "goto-parts-page", "retrying"])
    ]));
  }
}), Fi = ':root{--p-form-field-padding-x: .75rem;--p-form-field-padding-y: .5rem;--p-form-field-sm-padding-x: .625rem;--p-form-field-sm-padding-y: .375rem;--p-form-field-lg-padding-x: .875rem;--p-form-field-lg-padding-y: .625rem;--p-form-field-border-radius: .375rem;--p-form-field-transition-duration: .2s;--p-form-field-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), 0 1px 2px 0 rgba(18, 18, 23, .05);--p-focus-ring-width: 1px;--p-focus-ring-style: solid;--p-focus-ring-color: color-mix(in srgb, var(--p-primary-color) 100%, transparent);--p-focus-ring-offset: 2px;--p-toggleswitch-width: 2.5rem;--p-toggleswitch-height: 1.5rem;--p-toggleswitch-border-radius: 30px;--p-toggleswitch-gap: .25rem;--p-toggleswitch-border-width: 1px;--p-toggleswitch-transition-duration: .2s;--p-toggleswitch-slide-duration: .2s;--p-toggleswitch-handle-size: 1rem;--p-toggleswitch-handle-border-radius: 9999px}:root{color-scheme:light dark;--p-primary: rgb(0, 95, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-secondary: #6f7385;--p-secondary-50: color-mix(in srgb, var(--p-secondary) 5%, white);--p-secondary-100: color-mix(in srgb, var(--p-secondary) 10%, white);--p-secondary-200: color-mix(in srgb, var(--p-secondary) 20%, white);--p-secondary-300: color-mix(in srgb, var(--p-secondary) 35%, white);--p-secondary-400: color-mix(in srgb, var(--p-secondary) 65%, white);--p-secondary-500: var(--p-secondary);--p-secondary-600: color-mix(in srgb, var(--p-secondary) 80%, black);--p-secondary-700: color-mix(in srgb, var(--p-secondary) 65%, black);--p-secondary-800: color-mix(in srgb, var(--p-secondary) 55%, black);--p-secondary-900: color-mix(in srgb, var(--p-secondary) 50%, black);--p-secondary-950: color-mix(in srgb, var(--p-secondary) 30%, black);--p-danger: rgb(239, 68, 68);--p-danger-50: color-mix(in srgb, var(--p-danger) 5%, white);--p-danger-100: color-mix(in srgb, var(--p-danger) 10%, white);--p-danger-200: color-mix(in srgb, var(--p-danger) 20%, white);--p-danger-300: color-mix(in srgb, var(--p-danger) 30%, white);--p-danger-400: color-mix(in srgb, var(--p-danger) 40%, white);--p-danger-500: var(--p-danger);--p-danger-600: color-mix(in srgb, var(--p-danger) 80%, black);--p-danger-700: color-mix(in srgb, var(--p-danger) 70%, black);--p-danger-800: color-mix(in srgb, var(--p-danger) 60%, black);--p-danger-900: color-mix(in srgb, var(--p-danger) 50%, black);--p-danger-950: color-mix(in srgb, var(--p-danger) 40%, black);--p-success: rgb(34, 197, 94);--p-success-50: color-mix(in srgb, var(--p-success) 5%, white);--p-success-100: color-mix(in srgb, var(--p-success) 10%, white);--p-success-200: color-mix(in srgb, var(--p-success) 20%, white);--p-success-300: color-mix(in srgb, var(--p-success) 30%, white);--p-success-400: color-mix(in srgb, var(--p-success) 40%, white);--p-success-500: var(--p-success);--p-success-600: color-mix(in srgb, var(--p-success) 80%, black);--p-success-700: color-mix(in srgb, var(--p-success) 70%, black);--p-success-800: color-mix(in srgb, var(--p-success) 60%, black);--p-success-900: color-mix(in srgb, var(--p-success) 50%, black);--p-success-950: color-mix(in srgb, var(--p-success) 40%, black);--p-warn: rgb(249, 115, 22);--p-warn-50: color-mix(in srgb, var(--p-warn) 5%, white);--p-warn-100: color-mix(in srgb, var(--p-warn) 10%, white);--p-warn-200: color-mix(in srgb, var(--p-warn) 20%, white);--p-warn-300: color-mix(in srgb, var(--p-warn) 30%, white);--p-warn-400: color-mix(in srgb, var(--p-warn) 40%, white);--p-warn-500: var(--p-warn);--p-warn-600: color-mix(in srgb, var(--p-warn) 80%, black);--p-warn-700: color-mix(in srgb, var(--p-warn) 70%, black);--p-warn-800: color-mix(in srgb, var(--p-warn) 60%, black);--p-warn-900: color-mix(in srgb, var(--p-warn) 50%, black);--p-warn-950: color-mix(in srgb, var(--p-warn) 40%, black);--p-info: rgb(14, 165, 233);--p-info-50: color-mix(in srgb, var(--p-info) 5%, white);--p-info-100: color-mix(in srgb, var(--p-info) 10%, white);--p-info-200: color-mix(in srgb, var(--p-info) 20%, white);--p-info-300: color-mix(in srgb, var(--p-info) 30%, white);--p-info-400: color-mix(in srgb, var(--p-info) 40%, white);--p-info-500: var(--p-info);--p-info-600: color-mix(in srgb, var(--p-info) 80%, black);--p-info-700: color-mix(in srgb, var(--p-info) 70%, black);--p-info-800: color-mix(in srgb, var(--p-info) 60%, black);--p-info-900: color-mix(in srgb, var(--p-info) 50%, black);--p-info-950: color-mix(in srgb, var(--p-info) 40%, black);--p-help: rgb(168, 85, 247);--p-help-50: color-mix(in srgb, var(--p-help) 5%, white);--p-help-100: color-mix(in srgb, var(--p-help) 10%, white);--p-help-200: color-mix(in srgb, var(--p-help) 20%, white);--p-help-300: color-mix(in srgb, var(--p-help) 30%, white);--p-help-400: color-mix(in srgb, var(--p-help) 40%, white);--p-help-500: var(--p-help);--p-help-600: color-mix(in srgb, var(--p-help) 80%, black);--p-help-700: color-mix(in srgb, var(--p-help) 70%, black);--p-help-800: color-mix(in srgb, var(--p-help) 60%, black);--p-help-900: color-mix(in srgb, var(--p-help) 50%, black);--p-help-950: color-mix(in srgb, var(--p-help) 40%, black);--p-accent: rgb(20, 184, 166);--p-accent-50: color-mix(in srgb, var(--p-accent) 5%, white);--p-accent-100: color-mix(in srgb, var(--p-accent) 10%, white);--p-accent-200: color-mix(in srgb, var(--p-accent) 20%, white);--p-accent-300: color-mix(in srgb, var(--p-accent) 30%, white);--p-accent-400: color-mix(in srgb, var(--p-accent) 40%, white);--p-accent-500: var(--p-accent);--p-accent-600: color-mix(in srgb, var(--p-accent) 80%, black);--p-accent-700: color-mix(in srgb, var(--p-accent) 70%, black);--p-accent-800: color-mix(in srgb, var(--p-accent) 60%, black);--p-accent-900: color-mix(in srgb, var(--p-accent) 50%, black);--p-accent-950: color-mix(in srgb, var(--p-accent) 40%, black);--p-surface-0: #ffffff;--p-surface-50: #fafafa;--p-surface-100: #f5f5f5;--p-surface-200: #e5e5e5;--p-surface-300: #d4d4d4;--p-surface-400: #a3a3a3;--p-surface-500: #737373;--p-surface-600: #525252;--p-surface-700: #404040;--p-surface-800: #262626;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #171717;--p-surface-950: #0a0a0a;--p-content-border-radius: 6px;--p-font-heading-family: var(--v-font-family-head, Arial);--p-font-heading-scale: 1;--p-font-heading-line-height: 1.5;--p-font-heading-letter-spacing: normal;--p-font-heading-stretch: normal;--p-font-heading-variation-settings: normal;--p-font-body-scale: 1;--p-font-body-line-height: 1.5;--p-font-body-letter-spacing: normal;--p-font-body-stretch: normal;--p-font-body-variation-settings: normal;--p-font-mono-family: ui-monospace}:root{--p-primary-color: var(--p-primary-500);--p-primary-contrast-color: var(--p-surface-0);--p-primary-hover-color: var(--p-primary-600);--p-primary-active-color: var(--p-primary-700);--p-secondary-color: var(--p-secondary-500);--p-secondary-contrast-color: var(--p-surface-0);--p-secondary-hover-color: var(--p-secondary-600);--p-secondary-active-color: var(--p-secondary-700);--p-danger-color: var(--p-danger-500);--p-danger-contrast-color: var(--p-surface-0);--p-danger-hover-color: var(--p-danger-600);--p-danger-active-color: var(--p-danger-700);--p-success-color: var(--p-success-500);--p-success-contrast-color: var(--p-surface-0);--p-success-hover-color: var(--p-success-600);--p-success-active-color: var(--p-success-700);--p-warn-color: var(--p-warn-500);--p-warn-contrast-color: var(--p-surface-0);--p-warn-hover-color: var(--p-warn-600);--p-warn-active-color: var(--p-warn-700);--p-info-color: var(--p-info-500);--p-info-contrast-color: var(--p-surface-0);--p-info-hover-color: var(--p-info-600);--p-info-active-color: var(--p-info-700);--p-help-color: var(--p-help-500);--p-help-contrast-color: var(--p-surface-0);--p-help-hover-color: var(--p-help-600);--p-help-active-color: var(--p-help-700);--p-accent-color: var(--p-accent-500);--p-accent-contrast-color: var(--p-surface-0);--p-accent-hover-color: var(--p-accent-600);--p-accent-active-color: var(--p-accent-700);--p-content-border-color: var(--p-surface-200);--p-content-hover-background: var(--p-surface-100);--p-content-hover-color: var(--p-surface-800);--p-highlight-background: var(--p-primary-50);--p-highlight-color: var(--p-primary-700);--p-highlight-focus-background: var(--p-primary-100);--p-highlight-focus-color: var(--p-primary-800);--p-content-background: var(--p-surface-0);--p-text-color: var(--p-surface-700);--p-text-hover-color: var(--p-surface-800);--p-text-muted-color: var(--p-surface-500);--p-text-hover-muted-color: var(--p-surface-600)}@media(prefers-color-scheme:dark){:root:not(.w-theme-light){--p-surface-D: #fff;--p-surface-0: #fff;--p-surface-50: #fafafa;--p-surface-100: #f4f4f5;--p-surface-200: #e4e4e7;--p-surface-300: #d4d4d8;--p-surface-400: #a1a1aa;--p-surface-500: #71717a;--p-surface-600: #545250;--p-surface-700: #403e3c;--p-surface-800: #2b2927;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #1c1a19;--p-surface-950: #0f0e0d;--p-primary: rgb(0, 125, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-primary-color: var(--p-primary-400);--p-primary-contrast-color: var(--p-surface-900);--p-primary-hover-color: var(--p-primary-300);--p-primary-active-color: var(--p-primary-200);--p-secondary-color: var(--p-secondary-400);--p-secondary-contrast-color: var(--p-surface-900);--p-secondary-hover-color: var(--p-secondary-300);--p-secondary-active-color: var(--p-secondary-200);--p-danger-color: var(--p-danger-400);--p-danger-contrast-color: var(--p-surface-900);--p-danger-hover-color: var(--p-danger-300);--p-danger-active-color: var(--p-danger-200);--p-success-color: var(--p-success-400);--p-success-contrast-color: var(--p-surface-900);--p-success-hover-color: var(--p-success-300);--p-success-active-color: var(--p-success-200);--p-warn-color: var(--p-warn-400);--p-warn-contrast-color: var(--p-surface-900);--p-warn-hover-color: var(--p-warn-300);--p-warn-active-color: var(--p-warn-200);--p-info-color: var(--p-info-400);--p-info-contrast-color: var(--p-surface-900);--p-info-hover-color: var(--p-info-300);--p-info-active-color: var(--p-info-200);--p-help-color: var(--p-help-400);--p-help-contrast-color: var(--p-surface-900);--p-help-hover-color: var(--p-help-300);--p-help-active-color: var(--p-help-200);--p-accent-color: var(--p-accent-400);--p-accent-contrast-color: var(--p-surface-900);--p-accent-hover-color: var(--p-accent-300);--p-accent-active-color: var(--p-accent-200);--p-content-border-color: var(--p-surface-700);--p-content-hover-background: var(--p-surface-800);--p-content-hover-color: var(--p-surface-0);--p-highlight-background: color-mix(in srgb, var(--p-primary-400), transparent 84%);--p-highlight-color: rgba(255, 255, 255, 87%);--p-highlight-focus-background: color-mix(in srgb, var(--p-primary-400), transparent 76%);--p-highlight-focus-color: rgba(255, 255, 255, 87%);--p-content-background: var(--p-surface-900);--p-text-color: var(--p-surface-0);--p-text-hover-color: var(--p-surface-0);--p-text-muted-color: var(--p-surface-400);--p-text-hover-muted-color: var(--p-surface-300)}}:root.w-theme-dark,.w-theme-dark{color-scheme:dark;--p-surface-D: #fff;--p-surface-0: #fff;--p-surface-50: #fafafa;--p-surface-100: #f4f4f5;--p-surface-200: #e4e4e7;--p-surface-300: #d4d4d8;--p-surface-400: #a1a1aa;--p-surface-500: #71717a;--p-surface-600: #545250;--p-surface-700: #403e3c;--p-surface-800: #2b2927;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #1c1a19;--p-surface-950: #0f0e0d;--p-primary: rgb(0, 125, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-primary-color: var(--p-primary-400);--p-primary-contrast-color: var(--p-surface-900);--p-primary-hover-color: var(--p-primary-300);--p-primary-active-color: var(--p-primary-200);--p-secondary-color: var(--p-secondary-400);--p-secondary-contrast-color: var(--p-surface-900);--p-secondary-hover-color: var(--p-secondary-300);--p-secondary-active-color: var(--p-secondary-200);--p-danger-color: var(--p-danger-400);--p-danger-contrast-color: var(--p-surface-900);--p-danger-hover-color: var(--p-danger-300);--p-danger-active-color: var(--p-danger-200);--p-success-color: var(--p-success-400);--p-success-contrast-color: var(--p-surface-900);--p-success-hover-color: var(--p-success-300);--p-success-active-color: var(--p-success-200);--p-warn-color: var(--p-warn-400);--p-warn-contrast-color: var(--p-surface-900);--p-warn-hover-color: var(--p-warn-300);--p-warn-active-color: var(--p-warn-200);--p-info-color: var(--p-info-400);--p-info-contrast-color: var(--p-surface-900);--p-info-hover-color: var(--p-info-300);--p-info-active-color: var(--p-info-200);--p-help-color: var(--p-help-400);--p-help-contrast-color: var(--p-surface-900);--p-help-hover-color: var(--p-help-300);--p-help-active-color: var(--p-help-200);--p-accent-color: var(--p-accent-400);--p-accent-contrast-color: var(--p-surface-900);--p-accent-hover-color: var(--p-accent-300);--p-accent-active-color: var(--p-accent-200);--p-content-border-color: var(--p-surface-700);--p-content-hover-background: var(--p-surface-800);--p-content-hover-color: var(--p-surface-0);--p-highlight-background: color-mix(in srgb, var(--p-primary-400), transparent 84%);--p-highlight-color: rgba(255, 255, 255, 87%);--p-highlight-focus-background: color-mix(in srgb, var(--p-primary-400), transparent 76%);--p-highlight-focus-color: rgba(255, 255, 255, 87%);--p-content-background: var(--p-surface-900);--p-text-color: var(--p-surface-0);--p-text-hover-color: var(--p-surface-0);--p-text-muted-color: var(--p-surface-400);--p-text-hover-muted-color: var(--p-surface-300)}:root.w-theme-light,.w-theme-light{color-scheme:light;--p-surface-0: #ffffff;--p-surface-50: #fafafa;--p-surface-100: #f5f5f5;--p-surface-200: #e5e5e5;--p-surface-300: #d4d4d4;--p-surface-400: #a3a3a3;--p-surface-500: #737373;--p-surface-600: #525252;--p-surface-700: #404040;--p-surface-800: #262626;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #171717;--p-surface-950: #0a0a0a;--p-primary: rgb(0, 95, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-primary-color: var(--p-primary-500);--p-primary-contrast-color: var(--p-surface-0);--p-primary-hover-color: var(--p-primary-600);--p-primary-active-color: var(--p-primary-700);--p-secondary-color: var(--p-secondary-500);--p-secondary-contrast-color: var(--p-surface-0);--p-secondary-hover-color: var(--p-secondary-600);--p-secondary-active-color: var(--p-secondary-700);--p-danger-color: var(--p-danger-500);--p-danger-contrast-color: var(--p-surface-0);--p-danger-hover-color: var(--p-danger-600);--p-danger-active-color: var(--p-danger-700);--p-success-color: var(--p-success-500);--p-success-contrast-color: var(--p-surface-0);--p-success-hover-color: var(--p-success-600);--p-success-active-color: var(--p-success-700);--p-warn-color: var(--p-warn-500);--p-warn-contrast-color: var(--p-surface-0);--p-warn-hover-color: var(--p-warn-600);--p-warn-active-color: var(--p-warn-700);--p-info-color: var(--p-info-500);--p-info-contrast-color: var(--p-surface-0);--p-info-hover-color: var(--p-info-600);--p-info-active-color: var(--p-info-700);--p-help-color: var(--p-help-500);--p-help-contrast-color: var(--p-surface-0);--p-help-hover-color: var(--p-help-600);--p-help-active-color: var(--p-help-700);--p-accent-color: var(--p-accent-500);--p-accent-contrast-color: var(--p-surface-0);--p-accent-hover-color: var(--p-accent-600);--p-accent-active-color: var(--p-accent-700);--p-content-border-color: var(--p-surface-200);--p-content-hover-background: var(--p-surface-100);--p-content-hover-color: var(--p-surface-800);--p-highlight-background: var(--p-primary-50);--p-highlight-color: var(--p-primary-700);--p-highlight-focus-background: var(--p-primary-100);--p-highlight-focus-color: var(--p-primary-800);--p-content-background: var(--p-surface-0);--p-text-color: var(--p-surface-700);--p-text-hover-color: var(--p-surface-800);--p-text-muted-color: var(--p-surface-500);--p-text-hover-muted-color: var(--p-surface-600)}.spin{animation:kx-spin 1s linear infinite}@keyframes kx-spin{to{transform:rotate(360deg)}}@media(prefers-reduced-motion:reduce){.spin{animation:none}}.kx-head{display:flex;align-items:center;gap:12px;padding:20px 24px 14px;flex-wrap:wrap}.kx-head-icon{width:40px;height:40px;border-radius:11px;flex:none;display:flex;align-items:center;justify-content:center;background:color-mix(in srgb,var(--p-primary-color) 14%,transparent);color:var(--p-primary-color)}.kx-head-icon svg{width:22px;height:22px}.kx-head-text{min-width:0}.kx-title{font-size:17px;font-weight:700;color:var(--p-text-color);margin:0}.kx-head-sub{font-size:13px;color:var(--p-text-muted-color);margin:2px 0 0}.kx-head-actions{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-left:auto}.kx-empty{text-align:center;padding:44px 24px;display:flex;flex-direction:column;align-items:center;gap:8px}.kx-empty-ico{width:56px;height:56px;border-radius:14px;display:flex;align-items:center;justify-content:center;background:color-mix(in srgb,var(--p-primary-color) 12%,transparent);color:var(--p-primary-color);margin-bottom:4px}.kx-empty-ico svg{width:28px;height:28px}.kx-empty-title{font-size:15px;font-weight:700;color:var(--p-text-color);margin:0}.kx-empty-sub{font-size:13px;color:var(--p-text-muted-color);max-width:380px;margin:0}.kx-empty>.p-button{margin-top:6px}.kx-empty-actions{display:flex;gap:8px;margin-top:6px}.kx-loading{display:flex;align-items:center;gap:8px;color:var(--p-text-muted-color);font-size:13px;padding:24px}.kx-err{margin:0 20px 8px;padding:9px 12px;border-radius:10px;font-size:13px;background:color-mix(in srgb,var(--p-danger-500) 12%,transparent);color:var(--p-danger-600, var(--p-danger-500))}.kx-err.inline{margin:12px 0 0}.kx-tag-sm,.kx-tag-sm.kx-tag-sm{display:inline-flex;align-items:center;gap:4px;padding:1px 7px;border-radius:var(--kx-radius-tag, 6px);font-size:10.5px;font-weight:600;line-height:1.5;white-space:nowrap}.kx-tag-sm svg,.kx-tag-sm.kx-tag-sm svg{width:12px;height:12px}.kx-tag-caps,.kx-tag-caps.kx-tag-caps{display:inline-flex;align-items:center;gap:3px;padding:2px 6px;border-radius:var(--kx-radius-tag, 6px);font-size:9px;font-weight:700;line-height:1.5;letter-spacing:.04em;text-transform:uppercase;white-space:nowrap}.kx-tag-caps svg,.kx-tag-caps.kx-tag-caps svg{width:11px;height:11px}*,:before,:after{--tw-border-spacing-x: 0;--tw-border-spacing-y: 0;--tw-translate-x: 0;--tw-translate-y: 0;--tw-rotate: 0;--tw-skew-x: 0;--tw-skew-y: 0;--tw-scale-x: 1;--tw-scale-y: 1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness: proximity;--tw-gradient-from-position: ;--tw-gradient-via-position: ;--tw-gradient-to-position: ;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width: 0px;--tw-ring-offset-color: #fff;--tw-ring-color: rgb(59 130 246 / .5);--tw-ring-offset-shadow: 0 0 #0000;--tw-ring-shadow: 0 0 #0000;--tw-shadow: 0 0 #0000;--tw-shadow-colored: 0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: ;--tw-contain-size: ;--tw-contain-layout: ;--tw-contain-paint: ;--tw-contain-style: }::backdrop{--tw-border-spacing-x: 0;--tw-border-spacing-y: 0;--tw-translate-x: 0;--tw-translate-y: 0;--tw-rotate: 0;--tw-skew-x: 0;--tw-skew-y: 0;--tw-scale-x: 1;--tw-scale-y: 1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness: proximity;--tw-gradient-from-position: ;--tw-gradient-via-position: ;--tw-gradient-to-position: ;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width: 0px;--tw-ring-offset-color: #fff;--tw-ring-color: rgb(59 130 246 / .5);--tw-ring-offset-shadow: 0 0 #0000;--tw-ring-shadow: 0 0 #0000;--tw-shadow: 0 0 #0000;--tw-shadow-colored: 0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: ;--tw-contain-size: ;--tw-contain-layout: ;--tw-contain-paint: ;--tw-contain-style: }*,:before,:after{box-sizing:border-box;border-width:0;border-style:solid;border-color:#e5e7eb}:before,:after{--tw-content: ""}html,:host{line-height:1.5;-webkit-text-size-adjust:100%;-moz-tab-size:4;tab-size:4;font-family:ui-sans-serif,system-ui,sans-serif,"Apple Color Emoji","Segoe UI Emoji",Segoe UI Symbol,"Noto Color Emoji";font-feature-settings:normal;font-variation-settings:normal;-webkit-tap-highlight-color:transparent}body{margin:0;line-height:inherit}hr{height:0;color:inherit;border-top-width:1px}abbr:where([title]){text-decoration:underline dotted}h1,h2,h3,h4,h5,h6{font-size:inherit;font-weight:inherit}a{color:inherit;text-decoration:inherit}b,strong{font-weight:bolder}code,kbd,samp,pre{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace;font-feature-settings:normal;font-variation-settings:normal;font-size:1em}small{font-size:80%}sub,sup{font-size:75%;line-height:0;position:relative;vertical-align:baseline}sub{bottom:-.25em}sup{top:-.5em}table{text-indent:0;border-color:inherit;border-collapse:collapse}button,input,optgroup,select,textarea{font-family:inherit;font-feature-settings:inherit;font-variation-settings:inherit;font-size:100%;font-weight:inherit;line-height:inherit;letter-spacing:inherit;color:inherit;margin:0;padding:0}button,select{text-transform:none}button,input:where([type=button]),input:where([type=reset]),input:where([type=submit]){-webkit-appearance:button;background-color:transparent;background-image:none}:-moz-focusring{outline:auto}:-moz-ui-invalid{box-shadow:none}progress{vertical-align:baseline}::-webkit-inner-spin-button,::-webkit-outer-spin-button{height:auto}[type=search]{-webkit-appearance:textfield;outline-offset:-2px}::-webkit-search-decoration{-webkit-appearance:none}::-webkit-file-upload-button{-webkit-appearance:button;font:inherit}summary{display:list-item}blockquote,dl,dd,h1,h2,h3,h4,h5,h6,hr,figure,p,pre{margin:0}fieldset{margin:0;padding:0}legend{padding:0}ol,ul,menu{list-style:none;margin:0;padding:0}dialog{padding:0}textarea{resize:vertical}input::placeholder,textarea::placeholder{opacity:1;color:#9ca3af}button,[role=button]{cursor:pointer}:disabled{cursor:default}img,svg,video,canvas,audio,iframe,embed,object{display:block;vertical-align:middle}img,video{max-width:100%;height:auto}[hidden]:where(:not([hidden=until-found])){display:none}@supports (-moz-appearance:none){*{scrollbar-color:initial;scrollbar-width:initial}}:host{display:block;height:100%;min-height:0}:host>div{height:100%;min-height:0}*,*:before,*:after{box-sizing:border-box}.kx{font-family:inherit;color:var(--p-text-color);background:var(--p-content-background);height:100%;display:flex;flex-direction:column;overflow:hidden}.kx-count{font-size:12.5px;color:var(--p-text-muted-color);display:inline-flex;align-items:center;gap:5px}.kx-pending{color:var(--p-primary-color)}.kx-head-actions>.kx-search{width:200px;max-width:40vw}.kx-select{font-size:13px}.kx-body{flex:1;min-height:0;display:flex}.kx-main{flex:1;min-width:0;min-height:0;height:100%;overflow-y:auto;padding:6px 20px 20px;display:flex;flex-direction:column;gap:14px}.kx-drop{border:2px dashed var(--p-content-border-color);border-radius:14px;padding:28px 20px;text-align:center;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:5px;transition:border-color .18s,background .18s,transform .18s,box-shadow .18s}.kx-drop:hover,.kx-drop.dragover{border-color:var(--p-primary-color);background:color-mix(in srgb,var(--p-primary-color) 7%,transparent);box-shadow:0 0 0 4px color-mix(in srgb,var(--p-primary-color) 8%,transparent)}.kx-drop.busy{cursor:progress;opacity:.7}.kx-drop-ico{width:30px;height:30px;color:var(--p-text-muted-color)}.kx-drop:hover .kx-drop-ico,.kx-drop.dragover .kx-drop-ico{color:var(--p-primary-color)}.kx-drop-title{font-size:14px;font-weight:600;color:var(--p-text-color);margin:4px 0 0}.kx-drop-sub{font-size:12px;color:var(--p-text-muted-color);margin:0}.kx-empty-cta{margin-top:12px}.kx-list{display:flex;flex-direction:column;border-top:1px solid var(--p-content-border-color)}.kx-row{position:relative;display:grid;grid-template-columns:38px minmax(0,2fr) auto auto auto;align-items:center;gap:14px;padding:11px 16px;border-bottom:1px solid var(--p-content-border-color)}.kx-row:last-child{border-bottom:none}.kx-row:hover{background:color-mix(in srgb,var(--p-text-color) 6%,transparent)}.kx-ficon{width:38px;height:38px;border-radius:10px;display:flex;align-items:center;justify-content:center;background:color-mix(in srgb,var(--p-primary-color) 12%,transparent);color:var(--p-primary-color)}.kx-ficon svg{width:20px;height:20px}.kx-id{min-width:0}.kx-progress{position:absolute;left:0;right:0;bottom:0;height:2px;overflow:hidden;background:color-mix(in srgb,var(--p-primary-color) 14%,transparent)}.kx-progress:after{content:"";position:absolute;inset:0;width:36%;background:var(--p-primary-color);border-radius:2px;animation:kx-indeterminate 1.15s ease-in-out infinite}@keyframes kx-indeterminate{0%{transform:translate(-120%)}to{transform:translate(380%)}}.kx-name{font-size:14px;font-weight:600;color:var(--p-text-color);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.kx-uuid{font-family:ui-monospace,Menlo,monospace;font-size:11px;font-weight:400;color:var(--p-text-muted-color)}.kx-sub{font-size:12px;color:var(--p-text-muted-color);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.kx-err-reason{font-size:12px;color:var(--p-danger-500);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.kx-type{color:var(--p-text-color);font-weight:600}.kx-badge{border:1px solid color-mix(in srgb,currentColor 28%,transparent)}.kx-badge:before{content:"";width:6px;height:6px;border-radius:50%;background:currentColor;flex:none}.kx-badge:has(svg):before{display:none}.kx-date{font-size:12px;color:var(--p-text-muted-color);white-space:nowrap}.kx-actions{display:flex;gap:6px;opacity:0;transition:opacity .15s}.kx-row:hover .kx-actions,.kx-row:focus-within .kx-actions{opacity:1}.kx-side-drawer>.kx-side-drawer-content{padding:0;display:flex;flex-direction:column;min-height:0}.kx-side{flex:1;min-height:0;display:flex;flex-direction:column;background:var(--p-content-background)}.kx-pv-head{display:flex;align-items:center;gap:12px;padding:14px 18px;flex:none;border-bottom:1px solid var(--p-content-border-color)}.kx-pv-id{min-width:0;flex:1}.kx-pv-name{font-size:14.5px;font-weight:650;color:var(--p-text-color);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.kx-pv-sub{font-size:12px;color:var(--p-text-muted-color)}.kx-pv-fail{display:flex;align-items:flex-start;gap:8px;flex:none;padding:9px 18px;font-size:12.5px;line-height:1.4;color:var(--p-danger-500);background:color-mix(in srgb,var(--p-danger-500) 10%,transparent);border-bottom:1px solid var(--p-content-border-color)}.kx-pv-fail svg{width:15px;height:15px;flex:none;margin-top:1px}.kx-pv-fail>span{flex:1}.kx-pv-retry{flex:none;margin:-4px 0}.kx-pv-info{color:var(--p-text-color);background:color-mix(in srgb,var(--p-primary-color) 8%,transparent)}.kx-views{display:flex;align-items:center;gap:6px;flex:none;padding:8px 12px;border-bottom:1px solid var(--p-content-border-color)}.kx-part{flex:none;max-width:220px}.kx-part-label{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.kx-part-loading{display:inline-flex;align-items:center;color:var(--p-text-muted-color);padding:0 4px}.kx-part-loading svg{width:15px;height:15px}.kx-pv-view{flex:1;min-height:0;overflow:auto;padding:0}.kx-pv-view.kx-pv-padded{padding:20px 24px}.kx-pv-rv{display:block;width:100%;height:100%}.kx-parts-panel{flex:none;display:flex;flex-direction:column;border-top:1px solid var(--p-content-border-color)}.kx-parts-head{display:flex;align-items:center;gap:8px;flex:none;padding:6px 12px}.kx-parts-panel.open .kx-parts-head{border-bottom:1px solid var(--p-content-border-color)}.kx-parts-range{font-size:11.5px;color:var(--p-text-muted-color);margin-left:auto}.kx-parts-pager{display:flex;align-items:center;gap:4px}.kx-parts-pageno{font-size:11.5px;color:var(--p-text-muted-color);min-width:46px;text-align:center}.kx-parts-list{display:flex;flex-wrap:wrap;align-content:flex-start;gap:6px;padding:10px 14px;overflow-y:auto;max-height:min(34vh,280px)}@media(max-width:640px){.kx-row{grid-template-columns:38px minmax(0,1fr) auto auto;gap:10px;padding:11px 14px}.kx-date{display:none}.kx-actions{opacity:1}}.kx-drop:focus-visible{border-color:var(--p-focus-ring-color);outline:none;box-shadow:var(--p-focus-ring-shadow)}', Oi = { props: { type: "object", properties: {} } }, Mi = {
  wippy: Oi
};
class zi extends ur {
  static get wippyConfig() {
    return {
      propsSchema: Mi.wippy.props,
      hostCssKeys: ["themeConfigUrl", "primeVueCssUrl"],
      inlineCss: Fi
    };
  }
  static get vueConfig() {
    return { rootComponent: Ri, plugins: [cr] };
  }
}
kr(import.meta.url, zi);
//# sourceMappingURL=index.js.map

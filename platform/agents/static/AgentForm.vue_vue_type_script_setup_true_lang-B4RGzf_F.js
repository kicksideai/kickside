import { openBlock as u, createElementBlock as g, mergeProps as S, renderSlot as B, createTextVNode as D, toDisplayString as L, resolveComponent as lt, resolveDirective as jt, withDirectives as V, createBlock as H, resolveDynamicComponent as mt, withCtx as M, createCommentVNode as z, normalizeClass as R, createElementVNode as l, computed as I, createVNode as $, Transition as ge, Fragment as K, defineComponent as J, renderList as vt, unref as b, ref as N, onMounted as Ft, watch as yt, onBeforeUnmount as fe, shallowRef as he, vModelText as Z, nextTick as me } from "vue";
import { Icon as T } from "@iconify/vue";
import { B as rt, l as Vt, b as Rt, L as ve, d as X, f as q, U as ye, i as It, j as ke, r as Ht, m as we, a as xe, v as Ce, C as _e, n as Se, S as $e, _ as ze, o as Ee } from "./primevue-plugin-BTxKP425.js";
import { b as _t, f as Y, R as Nt, d as Ie, c as Ut, B as Le, a as Pe, x as gt, s as Be } from "./index-GqAeG0Jm.js";
import { loadByTagName as kt, api as ft } from "@wippy-fe/proxy";
import { _ as De } from "./WcMount.vue_vue_type_script_setup_true_lang-CNWT59Oh.js";
import { _ as Ae } from "./toolCatalog-CE8HFruH.js";
var Oe = `
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
`, Te = {
  root: function(e) {
    var n = e.props, o = e.instance;
    return ["p-badge p-component", {
      "p-badge-circle": Rt(n.value) && String(n.value).length === 1,
      "p-badge-dot": Vt(n.value) && !o.$slots.default,
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
}, Me = rt.extend({
  name: "badge",
  style: Oe,
  classes: Te
}), je = {
  name: "BaseBadge",
  extends: _t,
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
  style: Me,
  provide: function() {
    return {
      $pcBadge: this,
      $parentInstance: this
    };
  }
};
function Q(t) {
  "@babel/helpers - typeof";
  return Q = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, Q(t);
}
function Lt(t, e, n) {
  return (e = Fe(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function Fe(t) {
  var e = Ve(t, "string");
  return Q(e) == "symbol" ? e : e + "";
}
function Ve(t, e) {
  if (Q(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(t, e);
    if (Q(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var Kt = {
  name: "Badge",
  extends: je,
  inheritAttrs: !1,
  computed: {
    dataP: function() {
      return Y(Lt(Lt({
        circle: this.value != null && String(this.value).length === 1,
        empty: this.value == null && !this.$slots.default
      }, this.severity, this.severity), this.size, this.size));
    }
  }
}, Re = ["data-p"];
function He(t, e, n, o, s, r) {
  return u(), g("span", S({
    class: t.cx("root"),
    "data-p": r.dataP
  }, t.ptmi("root")), [B(t.$slots, "default", {}, function() {
    return [D(L(t.value), 1)];
  })], 16, Re);
}
Kt.render = He;
var Ne = `
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
function tt(t) {
  "@babel/helpers - typeof";
  return tt = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, tt(t);
}
function A(t, e, n) {
  return (e = Ue(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function Ue(t) {
  var e = Ke(t, "string");
  return tt(e) == "symbol" ? e : e + "";
}
function Ke(t, e) {
  if (tt(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(t, e);
    if (tt(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var We = {
  root: function(e) {
    var n = e.instance, o = e.props;
    return ["p-button p-component", A(A(A(A(A(A(A(A(A({
      "p-button-icon-only": n.hasIcon && !o.label && !o.badge,
      "p-button-vertical": (o.iconPos === "top" || o.iconPos === "bottom") && o.label,
      "p-button-loading": o.loading,
      "p-button-link": o.link || o.variant === "link"
    }, "p-button-".concat(o.severity), o.severity), "p-button-raised", o.raised), "p-button-rounded", o.rounded), "p-button-text", o.text || o.variant === "text"), "p-button-outlined", o.outlined || o.variant === "outlined"), "p-button-sm", o.size === "small"), "p-button-lg", o.size === "large"), "p-button-plain", o.plain), "p-button-fluid", n.hasFluid)];
  },
  loadingIcon: "p-button-loading-icon",
  icon: function(e) {
    var n = e.props;
    return ["p-button-icon", A({}, "p-button-icon-".concat(n.iconPos), n.label)];
  },
  label: "p-button-label"
}, Ze = rt.extend({
  name: "button",
  style: Ne,
  classes: We
}), Xe = {
  name: "BaseButton",
  extends: _t,
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
  style: Ze,
  provide: function() {
    return {
      $pcButton: this,
      $parentInstance: this
    };
  }
};
function et(t) {
  "@babel/helpers - typeof";
  return et = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, et(t);
}
function P(t, e, n) {
  return (e = Ye(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function Ye(t) {
  var e = Ge(t, "string");
  return et(e) == "symbol" ? e : e + "";
}
function Ge(t, e) {
  if (et(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(t, e);
    if (et(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var st = {
  name: "Button",
  extends: Xe,
  inheritAttrs: !1,
  inject: {
    $pcFluid: {
      default: null
    }
  },
  methods: {
    getPTOptions: function(e) {
      var n = e === "root" ? this.ptmi : this.ptm;
      return n(e, {
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
      return S(this.asAttrs, this.a11yAttrs, this.getPTOptions("root"));
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
      return Vt(this.fluid) ? !!this.$pcFluid : this.fluid;
    },
    dataP: function() {
      return Y(P(P(P(P(P(P(P(P(P(P({}, this.size, this.size), "icon-only", this.hasIcon && !this.label && !this.badge), "loading", this.loading), "fluid", this.hasFluid), "rounded", this.rounded), "raised", this.raised), "outlined", this.outlined || this.variant === "outlined"), "text", this.text || this.variant === "text"), "link", this.link || this.variant === "link"), "vertical", (this.iconPos === "top" || this.iconPos === "bottom") && this.label));
    },
    dataIconP: function() {
      return Y(P(P({}, this.iconPos, this.iconPos), this.size, this.size));
    },
    dataLabelP: function() {
      return Y(P(P({}, this.size, this.size), "icon-only", this.hasIcon && !this.label && !this.badge));
    }
  },
  components: {
    SpinnerIcon: Ie,
    Badge: Kt
  },
  directives: {
    ripple: Nt
  }
}, qe = ["data-p"], Je = ["data-p"];
function Qe(t, e, n, o, s, r) {
  var v = lt("SpinnerIcon"), x = lt("Badge"), f = jt("ripple");
  return t.asChild ? B(t.$slots, "default", {
    key: 1,
    class: R(t.cx("root")),
    a11yAttrs: r.a11yAttrs
  }) : V((u(), H(mt(t.as), S({
    key: 0,
    class: t.cx("root"),
    "data-p": r.dataP
  }, r.attrs), {
    default: M(function() {
      return [B(t.$slots, "default", {}, function() {
        return [t.loading ? B(t.$slots, "loadingicon", S({
          key: 0,
          class: [t.cx("loadingIcon"), t.cx("icon")]
        }, t.ptm("loadingIcon")), function() {
          return [t.loadingIcon ? (u(), g("span", S({
            key: 0,
            class: [t.cx("loadingIcon"), t.cx("icon"), t.loadingIcon]
          }, t.ptm("loadingIcon")), null, 16)) : (u(), H(v, S({
            key: 1,
            class: [t.cx("loadingIcon"), t.cx("icon")],
            spin: ""
          }, t.ptm("loadingIcon")), null, 16, ["class"]))];
        }) : B(t.$slots, "icon", S({
          key: 1,
          class: [t.cx("icon")]
        }, t.ptm("icon")), function() {
          return [t.icon ? (u(), g("span", S({
            key: 0,
            class: [t.cx("icon"), t.icon, t.iconClass],
            "data-p": r.dataIconP
          }, t.ptm("icon")), null, 16, qe)) : z("", !0)];
        }), t.label ? (u(), g("span", S({
          key: 2,
          class: t.cx("label")
        }, t.ptm("label"), {
          "data-p": r.dataLabelP
        }), L(t.label), 17, Je)) : z("", !0), t.badge ? (u(), H(x, {
          key: 3,
          value: t.badge,
          class: R(t.badgeClass),
          severity: t.badgeSeverity,
          unstyled: t.unstyled,
          pt: t.ptm("pcBadge")
        }, null, 8, ["value", "class", "severity", "unstyled", "pt"])) : z("", !0)];
      })];
    }),
    _: 3
  }, 16, ["class", "data-p"])), [[f]]);
}
st.render = Qe;
var Wt = {
  name: "WindowMaximizeIcon",
  extends: Ut
};
function tn(t) {
  return rn(t) || on(t) || nn(t) || en();
}
function en() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function nn(t, e) {
  if (t) {
    if (typeof t == "string") return wt(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? wt(t, e) : void 0;
  }
}
function on(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function rn(t) {
  if (Array.isArray(t)) return wt(t);
}
function wt(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, o = Array(e); n < e; n++) o[n] = t[n];
  return o;
}
function an(t, e, n, o, s, r) {
  return u(), g("svg", S({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, t.pti()), tn(e[0] || (e[0] = [l("path", {
    "fill-rule": "evenodd",
    "clip-rule": "evenodd",
    d: "M7 14H11.8C12.3835 14 12.9431 13.7682 13.3556 13.3556C13.7682 12.9431 14 12.3835 14 11.8V2.2C14 1.61652 13.7682 1.05694 13.3556 0.644365C12.9431 0.231785 12.3835 0 11.8 0H2.2C1.61652 0 1.05694 0.231785 0.644365 0.644365C0.231785 1.05694 0 1.61652 0 2.2V7C0 7.15913 0.063214 7.31174 0.175736 7.42426C0.288258 7.53679 0.44087 7.6 0.6 7.6C0.75913 7.6 0.911742 7.53679 1.02426 7.42426C1.13679 7.31174 1.2 7.15913 1.2 7V2.2C1.2 1.93478 1.30536 1.68043 1.49289 1.49289C1.68043 1.30536 1.93478 1.2 2.2 1.2H11.8C12.0652 1.2 12.3196 1.30536 12.5071 1.49289C12.6946 1.68043 12.8 1.93478 12.8 2.2V11.8C12.8 12.0652 12.6946 12.3196 12.5071 12.5071C12.3196 12.6946 12.0652 12.8 11.8 12.8H7C6.84087 12.8 6.68826 12.8632 6.57574 12.9757C6.46321 13.0883 6.4 13.2409 6.4 13.4C6.4 13.5591 6.46321 13.7117 6.57574 13.8243C6.68826 13.9368 6.84087 14 7 14ZM9.77805 7.42192C9.89013 7.534 10.0415 7.59788 10.2 7.59995C10.3585 7.59788 10.5099 7.534 10.622 7.42192C10.7341 7.30985 10.798 7.15844 10.8 6.99995V3.94242C10.8066 3.90505 10.8096 3.86689 10.8089 3.82843C10.8079 3.77159 10.7988 3.7157 10.7824 3.6623C10.756 3.55552 10.701 3.45698 10.622 3.37798C10.5099 3.2659 10.3585 3.20202 10.2 3.19995H7.00002C6.84089 3.19995 6.68828 3.26317 6.57576 3.37569C6.46324 3.48821 6.40002 3.64082 6.40002 3.79995C6.40002 3.95908 6.46324 4.11169 6.57576 4.22422C6.68828 4.33674 6.84089 4.39995 7.00002 4.39995H8.80006L6.19997 7.00005C6.10158 7.11005 6.04718 7.25246 6.04718 7.40005C6.04718 7.54763 6.10158 7.69004 6.19997 7.80005C6.30202 7.91645 6.44561 7.98824 6.59997 8.00005C6.75432 7.98824 6.89791 7.91645 6.99997 7.80005L9.60002 5.26841V6.99995C9.6021 7.15844 9.66598 7.30985 9.77805 7.42192ZM1.4 14H3.8C4.17066 13.9979 4.52553 13.8498 4.78763 13.5877C5.04973 13.3256 5.1979 12.9707 5.2 12.6V10.2C5.1979 9.82939 5.04973 9.47452 4.78763 9.21242C4.52553 8.95032 4.17066 8.80215 3.8 8.80005H1.4C1.02934 8.80215 0.674468 8.95032 0.412371 9.21242C0.150274 9.47452 0.00210008 9.82939 0 10.2V12.6C0.00210008 12.9707 0.150274 13.3256 0.412371 13.5877C0.674468 13.8498 1.02934 13.9979 1.4 14ZM1.25858 10.0586C1.29609 10.0211 1.34696 10 1.4 10H3.8C3.85304 10 3.90391 10.0211 3.94142 10.0586C3.97893 10.0961 4 10.147 4 10.2V12.6C4 12.6531 3.97893 12.704 3.94142 12.7415C3.90391 12.779 3.85304 12.8 3.8 12.8H1.4C1.34696 12.8 1.29609 12.779 1.25858 12.7415C1.22107 12.704 1.2 12.6531 1.2 12.6V10.2C1.2 10.147 1.22107 10.0961 1.25858 10.0586Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
Wt.render = an;
var Zt = {
  name: "WindowMinimizeIcon",
  extends: Ut
};
function ln(t) {
  return cn(t) || un(t) || dn(t) || sn();
}
function sn() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function dn(t, e) {
  if (t) {
    if (typeof t == "string") return xt(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? xt(t, e) : void 0;
  }
}
function un(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function cn(t) {
  if (Array.isArray(t)) return xt(t);
}
function xt(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, o = Array(e); n < e; n++) o[n] = t[n];
  return o;
}
function bn(t, e, n, o, s, r) {
  return u(), g("svg", S({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, t.pti()), ln(e[0] || (e[0] = [l("path", {
    "fill-rule": "evenodd",
    "clip-rule": "evenodd",
    d: "M11.8 0H2.2C1.61652 0 1.05694 0.231785 0.644365 0.644365C0.231785 1.05694 0 1.61652 0 2.2V7C0 7.15913 0.063214 7.31174 0.175736 7.42426C0.288258 7.53679 0.44087 7.6 0.6 7.6C0.75913 7.6 0.911742 7.53679 1.02426 7.42426C1.13679 7.31174 1.2 7.15913 1.2 7V2.2C1.2 1.93478 1.30536 1.68043 1.49289 1.49289C1.68043 1.30536 1.93478 1.2 2.2 1.2H11.8C12.0652 1.2 12.3196 1.30536 12.5071 1.49289C12.6946 1.68043 12.8 1.93478 12.8 2.2V11.8C12.8 12.0652 12.6946 12.3196 12.5071 12.5071C12.3196 12.6946 12.0652 12.8 11.8 12.8H7C6.84087 12.8 6.68826 12.8632 6.57574 12.9757C6.46321 13.0883 6.4 13.2409 6.4 13.4C6.4 13.5591 6.46321 13.7117 6.57574 13.8243C6.68826 13.9368 6.84087 14 7 14H11.8C12.3835 14 12.9431 13.7682 13.3556 13.3556C13.7682 12.9431 14 12.3835 14 11.8V2.2C14 1.61652 13.7682 1.05694 13.3556 0.644365C12.9431 0.231785 12.3835 0 11.8 0ZM6.368 7.952C6.44137 7.98326 6.52025 7.99958 6.6 8H9.8C9.95913 8 10.1117 7.93678 10.2243 7.82426C10.3368 7.71174 10.4 7.55913 10.4 7.4C10.4 7.24087 10.3368 7.08826 10.2243 6.97574C10.1117 6.86321 9.95913 6.8 9.8 6.8H8.048L10.624 4.224C10.73 4.11026 10.7877 3.95982 10.7849 3.80438C10.7822 3.64894 10.7192 3.50063 10.6093 3.3907C10.4994 3.28077 10.3511 3.2178 10.1956 3.21506C10.0402 3.21232 9.88974 3.27002 9.776 3.376L7.2 5.952V4.2C7.2 4.04087 7.13679 3.88826 7.02426 3.77574C6.91174 3.66321 6.75913 3.6 6.6 3.6C6.44087 3.6 6.28826 3.66321 6.17574 3.77574C6.06321 3.88826 6 4.04087 6 4.2V7.4C6.00042 7.47975 6.01674 7.55862 6.048 7.632C6.07656 7.70442 6.11971 7.7702 6.17475 7.82524C6.2298 7.88029 6.29558 7.92344 6.368 7.952ZM1.4 8.80005H3.8C4.17066 8.80215 4.52553 8.95032 4.78763 9.21242C5.04973 9.47452 5.1979 9.82939 5.2 10.2V12.6C5.1979 12.9707 5.04973 13.3256 4.78763 13.5877C4.52553 13.8498 4.17066 13.9979 3.8 14H1.4C1.02934 13.9979 0.674468 13.8498 0.412371 13.5877C0.150274 13.3256 0.00210008 12.9707 0 12.6V10.2C0.00210008 9.82939 0.150274 9.47452 0.412371 9.21242C0.674468 8.95032 1.02934 8.80215 1.4 8.80005ZM3.94142 12.7415C3.97893 12.704 4 12.6531 4 12.6V10.2C4 10.147 3.97893 10.0961 3.94142 10.0586C3.90391 10.0211 3.85304 10 3.8 10H1.4C1.34696 10 1.29609 10.0211 1.25858 10.0586C1.22107 10.0961 1.2 10.147 1.2 10.2V12.6C1.2 12.6531 1.22107 12.704 1.25858 12.7415C1.29609 12.779 1.34696 12.8 1.4 12.8H3.8C3.85304 12.8 3.90391 12.779 3.94142 12.7415Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
Zt.render = bn;
var pn = rt.extend({
  name: "focustrap-directive"
}), gn = Le.extend({
  style: pn
});
function nt(t) {
  "@babel/helpers - typeof";
  return nt = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, nt(t);
}
function Pt(t, e) {
  var n = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(t);
    e && (o = o.filter(function(s) {
      return Object.getOwnPropertyDescriptor(t, s).enumerable;
    })), n.push.apply(n, o);
  }
  return n;
}
function Bt(t) {
  for (var e = 1; e < arguments.length; e++) {
    var n = arguments[e] != null ? arguments[e] : {};
    e % 2 ? Pt(Object(n), !0).forEach(function(o) {
      fn(t, o, n[o]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(n)) : Pt(Object(n)).forEach(function(o) {
      Object.defineProperty(t, o, Object.getOwnPropertyDescriptor(n, o));
    });
  }
  return t;
}
function fn(t, e, n) {
  return (e = hn(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function hn(t) {
  var e = mn(t, "string");
  return nt(e) == "symbol" ? e : e + "";
}
function mn(t, e) {
  if (nt(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(t, e);
    if (nt(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var vn = gn.extend("focustrap", {
  mounted: function(e, n) {
    var o = n.value || {}, s = o.disabled;
    s || (this.createHiddenFocusableElements(e, n), this.bind(e, n), this.autoElementFocus(e, n)), e.setAttribute("data-pd-focustrap", !0), this.$el = e;
  },
  updated: function(e, n) {
    var o = n.value || {}, s = o.disabled;
    s && this.unbind(e);
  },
  unmounted: function(e) {
    this.unbind(e);
  },
  methods: {
    getComputedSelector: function(e) {
      return ':not(.p-hidden-focusable):not([data-p-hidden-focusable="true"])'.concat(e ?? "");
    },
    bind: function(e, n) {
      var o = this, s = n.value || {}, r = s.onFocusIn, v = s.onFocusOut;
      e.$_pfocustrap_mutationobserver = new MutationObserver(function(x) {
        x.forEach(function(f) {
          if (f.type === "childList" && !e.contains(document.activeElement)) {
            var w = function(c) {
              var y = It(c) ? It(c, o.getComputedSelector(e.$_pfocustrap_focusableselector)) ? c : q(e, o.getComputedSelector(e.$_pfocustrap_focusableselector)) : q(c);
              return Rt(y) ? y : c.nextSibling && w(c.nextSibling);
            };
            X(w(f.nextSibling));
          }
        });
      }), e.$_pfocustrap_mutationobserver.disconnect(), e.$_pfocustrap_mutationobserver.observe(e, {
        childList: !0
      }), e.$_pfocustrap_focusinlistener = function(x) {
        return r && r(x);
      }, e.$_pfocustrap_focusoutlistener = function(x) {
        return v && v(x);
      }, e.addEventListener("focusin", e.$_pfocustrap_focusinlistener), e.addEventListener("focusout", e.$_pfocustrap_focusoutlistener);
    },
    unbind: function(e) {
      e.$_pfocustrap_mutationobserver && e.$_pfocustrap_mutationobserver.disconnect(), e.$_pfocustrap_focusinlistener && e.removeEventListener("focusin", e.$_pfocustrap_focusinlistener) && (e.$_pfocustrap_focusinlistener = null), e.$_pfocustrap_focusoutlistener && e.removeEventListener("focusout", e.$_pfocustrap_focusoutlistener) && (e.$_pfocustrap_focusoutlistener = null);
    },
    autoFocus: function(e) {
      this.autoElementFocus(this.$el, {
        value: Bt(Bt({}, e), {}, {
          autoFocus: !0
        })
      });
    },
    autoElementFocus: function(e, n) {
      var o = n.value || {}, s = o.autoFocusSelector, r = s === void 0 ? "" : s, v = o.firstFocusableSelector, x = v === void 0 ? "" : v, f = o.autoFocus, w = f === void 0 ? !1 : f, _ = q(e, "[autofocus]".concat(this.getComputedSelector(r)));
      w && !_ && (_ = q(e, this.getComputedSelector(x))), X(_);
    },
    onFirstHiddenElementFocus: function(e) {
      var n, o = e.currentTarget, s = e.relatedTarget, r = s === o.$_pfocustrap_lasthiddenfocusableelement || !((n = this.$el) !== null && n !== void 0 && n.contains(s)) ? q(o.parentElement, this.getComputedSelector(o.$_pfocustrap_focusableselector)) : o.$_pfocustrap_lasthiddenfocusableelement;
      X(r);
    },
    onLastHiddenElementFocus: function(e) {
      var n, o = e.currentTarget, s = e.relatedTarget, r = s === o.$_pfocustrap_firsthiddenfocusableelement || !((n = this.$el) !== null && n !== void 0 && n.contains(s)) ? ve(o.parentElement, this.getComputedSelector(o.$_pfocustrap_focusableselector)) : o.$_pfocustrap_firsthiddenfocusableelement;
      X(r);
    },
    createHiddenFocusableElements: function(e, n) {
      var o = this, s = n.value || {}, r = s.tabIndex, v = r === void 0 ? 0 : r, x = s.firstFocusableSelector, f = x === void 0 ? "" : x, w = s.lastFocusableSelector, _ = w === void 0 ? "" : w, c = function(m) {
        return ye("span", {
          class: "p-hidden-accessible p-hidden-focusable",
          tabIndex: v,
          role: "presentation",
          "aria-hidden": !0,
          "data-p-hidden-accessible": !0,
          "data-p-hidden-focusable": !0,
          onFocus: m?.bind(o)
        });
      }, y = c(this.onFirstHiddenElementFocus), i = c(this.onLastHiddenElementFocus);
      y.$_pfocustrap_lasthiddenfocusableelement = i, y.$_pfocustrap_focusableselector = f, y.setAttribute("data-pc-section", "firstfocusableelement"), i.$_pfocustrap_firsthiddenfocusableelement = y, i.$_pfocustrap_focusableselector = _, i.setAttribute("data-pc-section", "lastfocusableelement"), e.prepend(y), e.append(i);
    }
  }
});
function Dt() {
  we({
    variableName: Ht("scrollbar.width").name
  });
}
function At() {
  ke({
    variableName: Ht("scrollbar.width").name
  });
}
var yn = `
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
`, kn = {
  mask: function(e) {
    var n = e.position, o = e.modal;
    return {
      position: "fixed",
      height: "100%",
      width: "100%",
      left: 0,
      top: 0,
      display: "flex",
      justifyContent: n === "left" || n === "topleft" || n === "bottomleft" ? "flex-start" : n === "right" || n === "topright" || n === "bottomright" ? "flex-end" : "center",
      alignItems: n === "top" || n === "topleft" || n === "topright" ? "flex-start" : n === "bottom" || n === "bottomleft" || n === "bottomright" ? "flex-end" : "center",
      pointerEvents: o ? "auto" : "none"
    };
  },
  root: {
    display: "flex",
    flexDirection: "column",
    pointerEvents: "auto"
  }
}, wn = {
  mask: function(e) {
    var n = e.props, o = ["left", "right", "top", "topleft", "topright", "bottom", "bottomleft", "bottomright"], s = o.find(function(r) {
      return r === n.position;
    });
    return ["p-dialog-mask", {
      "p-overlay-mask p-overlay-mask-enter-active": n.modal
    }, s ? "p-dialog-".concat(s) : ""];
  },
  root: function(e) {
    var n = e.props, o = e.instance;
    return ["p-dialog p-component", {
      "p-dialog-maximized": n.maximizable && o.maximized
    }];
  },
  header: "p-dialog-header",
  title: "p-dialog-title",
  headerActions: "p-dialog-header-actions",
  pcMaximizeButton: "p-dialog-maximize-button",
  pcCloseButton: "p-dialog-close-button",
  content: "p-dialog-content",
  footer: "p-dialog-footer"
}, xn = rt.extend({
  name: "dialog",
  style: yn,
  classes: wn,
  inlineStyles: kn
}), Cn = {
  name: "BaseDialog",
  extends: _t,
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
  style: xn,
  provide: function() {
    return {
      $pcDialog: this,
      $parentInstance: this
    };
  }
}, Xt = {
  name: "Dialog",
  extends: Cn,
  inheritAttrs: !1,
  emits: ["update:visible", "show", "hide", "after-hide", "maximize", "unmaximize", "dragstart", "dragend"],
  provide: function() {
    var e = this;
    return {
      dialogRef: I(function() {
        return e._instance;
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
    this.unbindDocumentState(), this.unbindGlobalListeners(), this.destroyStyle(), this.mask && this.autoZIndex && gt.clear(this.mask), this.container = null, this.mask = null;
  },
  mounted: function() {
    this.breakpoints && this.createStyle();
  },
  methods: {
    close: function() {
      this.$emit("update:visible", !1);
    },
    onEnter: function() {
      this.$emit("show"), this.target = document.activeElement, this.enableDocumentSettings(), this.bindGlobalListeners(), this.autoZIndex && gt.set("modal", this.mask, this.baseZIndex || this.$primevue.config.zIndex.modal);
    },
    onAfterEnter: function() {
      this.focus();
    },
    onBeforeLeave: function() {
      this.modal && !this.isUnstyled && Ee(this.mask, "p-overlay-mask-leave-active"), this.dragging && this.documentDragEndListener && this.documentDragEndListener();
    },
    onLeave: function() {
      this.$emit("hide"), X(this.target), this.target = null, this.focusableClose = null, this.focusableMax = null;
    },
    onAfterLeave: function() {
      this.autoZIndex && gt.clear(this.mask), this.containerVisible = !1, this.unbindDocumentState(), this.unbindGlobalListeners(), this.$emit("after-hide");
    },
    onMaskMouseDown: function(e) {
      this.maskMouseDownTarget = e.target;
    },
    onMaskMouseUp: function() {
      this.dismissableMask && this.modal && this.mask === this.maskMouseDownTarget && this.close();
    },
    focus: function() {
      var e = function(s) {
        return s && s.querySelector("[autofocus]");
      }, n = this.$slots.footer && e(this.footerContainer);
      n || (n = this.$slots.header && e(this.headerContainer), n || (n = this.$slots.default && e(this.content), n || (this.maximizable ? (this.focusableMax = !0, n = this.maximizableButton) : (this.focusableClose = !0, n = this.closeButton)))), n && X(n, {
        focusVisible: !0
      });
    },
    maximize: function(e) {
      this.maximized ? (this.maximized = !1, this.$emit("unmaximize", e)) : (this.maximized = !0, this.$emit("maximize", e)), this.modal || (this.maximized ? Dt() : At());
    },
    enableDocumentSettings: function() {
      (this.modal || !this.modal && this.blockScroll || this.maximizable && this.maximized) && Dt();
    },
    unbindDocumentState: function() {
      (this.modal || !this.modal && this.blockScroll || this.maximizable && this.maximized) && At();
    },
    onKeyDown: function(e) {
      e.code === "Escape" && this.closeOnEscape && !e.isComposing && this.close();
    },
    bindDocumentKeyDownListener: function() {
      this.documentKeydownListener || (this.documentKeydownListener = this.onKeyDown.bind(this), window.document.addEventListener("keydown", this.documentKeydownListener));
    },
    unbindDocumentKeyDownListener: function() {
      this.documentKeydownListener && (window.document.removeEventListener("keydown", this.documentKeydownListener), this.documentKeydownListener = null);
    },
    containerRef: function(e) {
      this.container = e;
    },
    maskRef: function(e) {
      this.mask = e;
    },
    contentRef: function(e) {
      this.content = e;
    },
    headerContainerRef: function(e) {
      this.headerContainer = e;
    },
    footerContainerRef: function(e) {
      this.footerContainer = e;
    },
    maximizableRef: function(e) {
      this.maximizableButton = e ? e.$el : void 0;
    },
    closeButtonRef: function(e) {
      this.closeButton = e ? e.$el : void 0;
    },
    createStyle: function() {
      if (!this.styleElement && !this.isUnstyled) {
        var e;
        this.styleElement = document.createElement("style"), this.styleElement.type = "text/css", ze(this.styleElement, "nonce", (e = this.$primevue) === null || e === void 0 || (e = e.config) === null || e === void 0 || (e = e.csp) === null || e === void 0 ? void 0 : e.nonce), document.head.appendChild(this.styleElement);
        var n = "";
        for (var o in this.breakpoints)
          n += `
                        @media screen and (max-width: `.concat(o, `) {
                            .p-dialog[`).concat(this.$attrSelector, `] {
                                width: `).concat(this.breakpoints[o], ` !important;
                            }
                        }
                    `);
        this.styleElement.innerHTML = n;
      }
    },
    destroyStyle: function() {
      this.styleElement && (document.head.removeChild(this.styleElement), this.styleElement = null);
    },
    initDrag: function(e) {
      e.target.closest("div").getAttribute("data-pc-section") !== "headeractions" && this.draggable && (this.dragging = !0, this.lastPageX = e.pageX, this.lastPageY = e.pageY, this.container.style.margin = "0", document.body.setAttribute("data-p-unselectable-text", "true"), !this.isUnstyled && $e(document.body, {
        "user-select": "none"
      }), this.$emit("dragstart", e));
    },
    bindGlobalListeners: function() {
      this.draggable && (this.bindDocumentDragListener(), this.bindDocumentDragEndListener()), this.closeOnEscape && this.bindDocumentKeyDownListener();
    },
    unbindGlobalListeners: function() {
      this.unbindDocumentDragListener(), this.unbindDocumentDragEndListener(), this.unbindDocumentKeyDownListener();
    },
    bindDocumentDragListener: function() {
      var e = this;
      this.documentDragListener = function(n) {
        if (e.dragging) {
          var o = Ce(e.container), s = _e(e.container), r = n.pageX - e.lastPageX, v = n.pageY - e.lastPageY, x = e.container.getBoundingClientRect(), f = x.left + r, w = x.top + v, _ = Se(), c = getComputedStyle(e.container), y = parseFloat(c.marginLeft), i = parseFloat(c.marginTop);
          e.container.style.position = "fixed", e.keepInViewport ? (f >= e.minX && f + o < _.width && (e.lastPageX = n.pageX, e.container.style.left = f - y + "px"), w >= e.minY && w + s < _.height && (e.lastPageY = n.pageY, e.container.style.top = w - i + "px")) : (e.lastPageX = n.pageX, e.container.style.left = f - y + "px", e.lastPageY = n.pageY, e.container.style.top = w - i + "px");
        }
      }, window.document.addEventListener("mousemove", this.documentDragListener);
    },
    unbindDocumentDragListener: function() {
      this.documentDragListener && (window.document.removeEventListener("mousemove", this.documentDragListener), this.documentDragListener = null);
    },
    bindDocumentDragEndListener: function() {
      var e = this;
      this.documentDragEndListener = function(n) {
        e.dragging && (e.dragging = !1, document.body.removeAttribute("data-p-unselectable-text"), !e.isUnstyled && (document.body.style["user-select"] = ""), e.$emit("dragend", n));
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
      return Y({
        maximized: this.maximized,
        modal: this.modal
      });
    }
  },
  directives: {
    ripple: Nt,
    focustrap: vn
  },
  components: {
    Button: st,
    Portal: xe,
    WindowMinimizeIcon: Zt,
    WindowMaximizeIcon: Wt,
    TimesIcon: Pe
  }
};
function ot(t) {
  "@babel/helpers - typeof";
  return ot = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, ot(t);
}
function Ot(t, e) {
  var n = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(t);
    e && (o = o.filter(function(s) {
      return Object.getOwnPropertyDescriptor(t, s).enumerable;
    })), n.push.apply(n, o);
  }
  return n;
}
function Tt(t) {
  for (var e = 1; e < arguments.length; e++) {
    var n = arguments[e] != null ? arguments[e] : {};
    e % 2 ? Ot(Object(n), !0).forEach(function(o) {
      _n(t, o, n[o]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(n)) : Ot(Object(n)).forEach(function(o) {
      Object.defineProperty(t, o, Object.getOwnPropertyDescriptor(n, o));
    });
  }
  return t;
}
function _n(t, e, n) {
  return (e = Sn(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function Sn(t) {
  var e = $n(t, "string");
  return ot(e) == "symbol" ? e : e + "";
}
function $n(t, e) {
  if (ot(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(t, e);
    if (ot(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var zn = ["data-p"], En = ["aria-labelledby", "aria-modal", "data-p"], In = ["id"], Ln = ["data-p"];
function Pn(t, e, n, o, s, r) {
  var v = lt("Button"), x = lt("Portal"), f = jt("focustrap");
  return u(), H(x, {
    appendTo: t.appendTo
  }, {
    default: M(function() {
      return [s.containerVisible ? (u(), g("div", S({
        key: 0,
        ref: r.maskRef,
        class: t.cx("mask"),
        style: t.sx("mask", !0, {
          position: t.position,
          modal: t.modal
        }),
        onMousedown: e[1] || (e[1] = function() {
          return r.onMaskMouseDown && r.onMaskMouseDown.apply(r, arguments);
        }),
        onMouseup: e[2] || (e[2] = function() {
          return r.onMaskMouseUp && r.onMaskMouseUp.apply(r, arguments);
        }),
        "data-p": r.dataP
      }, t.ptm("mask")), [$(ge, S({
        name: "p-dialog",
        onEnter: r.onEnter,
        onAfterEnter: r.onAfterEnter,
        onBeforeLeave: r.onBeforeLeave,
        onLeave: r.onLeave,
        onAfterLeave: r.onAfterLeave,
        appear: ""
      }, t.ptm("transition")), {
        default: M(function() {
          return [t.visible ? V((u(), g("div", S({
            key: 0,
            ref: r.containerRef,
            class: t.cx("root"),
            style: t.sx("root"),
            role: "dialog",
            "aria-labelledby": r.ariaLabelledById,
            "aria-modal": t.modal,
            "data-p": r.dataP
          }, t.ptmi("root")), [t.$slots.container ? B(t.$slots, "container", {
            key: 0,
            closeCallback: r.close,
            maximizeCallback: function(_) {
              return r.maximize(_);
            },
            initDragCallback: r.initDrag
          }) : (u(), g(K, {
            key: 1
          }, [t.showHeader ? (u(), g("div", S({
            key: 0,
            ref: r.headerContainerRef,
            class: t.cx("header"),
            onMousedown: e[0] || (e[0] = function() {
              return r.initDrag && r.initDrag.apply(r, arguments);
            })
          }, t.ptm("header")), [B(t.$slots, "header", {
            class: R(t.cx("title"))
          }, function() {
            return [t.header ? (u(), g("span", S({
              key: 0,
              id: r.ariaLabelledById,
              class: t.cx("title")
            }, t.ptm("title")), L(t.header), 17, In)) : z("", !0)];
          }), l("div", S({
            class: t.cx("headerActions")
          }, t.ptm("headerActions")), [t.maximizable ? B(t.$slots, "maximizebutton", {
            key: 0,
            maximized: s.maximized,
            maximizeCallback: function(_) {
              return r.maximize(_);
            }
          }, function() {
            return [$(v, S({
              ref: r.maximizableRef,
              autofocus: s.focusableMax,
              class: t.cx("pcMaximizeButton"),
              onClick: r.maximize,
              tabindex: t.maximizable ? "0" : "-1",
              unstyled: t.unstyled
            }, t.maximizeButtonProps, {
              pt: t.ptm("pcMaximizeButton"),
              "data-pc-group-section": "headericon"
            }), {
              icon: M(function(w) {
                return [B(t.$slots, "maximizeicon", {
                  maximized: s.maximized
                }, function() {
                  return [(u(), H(mt(r.maximizeIconComponent), S({
                    class: [w.class, s.maximized ? t.minimizeIcon : t.maximizeIcon]
                  }, t.ptm("pcMaximizeButton").icon), null, 16, ["class"]))];
                })];
              }),
              _: 3
            }, 16, ["autofocus", "class", "onClick", "tabindex", "unstyled", "pt"])];
          }) : z("", !0), t.closable ? B(t.$slots, "closebutton", {
            key: 1,
            closeCallback: r.close
          }, function() {
            return [$(v, S({
              ref: r.closeButtonRef,
              autofocus: s.focusableClose,
              class: t.cx("pcCloseButton"),
              onClick: r.close,
              "aria-label": r.closeAriaLabel,
              unstyled: t.unstyled
            }, t.closeButtonProps, {
              pt: t.ptm("pcCloseButton"),
              "data-pc-group-section": "headericon"
            }), {
              icon: M(function(w) {
                return [B(t.$slots, "closeicon", {}, function() {
                  return [(u(), H(mt(t.closeIcon ? "span" : "TimesIcon"), S({
                    class: [t.closeIcon, w.class]
                  }, t.ptm("pcCloseButton").icon), null, 16, ["class"]))];
                })];
              }),
              _: 3
            }, 16, ["autofocus", "class", "onClick", "aria-label", "unstyled", "pt"])];
          }) : z("", !0)], 16)], 16)) : z("", !0), l("div", S({
            ref: r.contentRef,
            class: [t.cx("content"), t.contentClass],
            style: t.contentStyle,
            "data-p": r.dataP
          }, Tt(Tt({}, t.contentProps), t.ptm("content"))), [B(t.$slots, "default")], 16, Ln), t.footer || t.$slots.footer ? (u(), g("div", S({
            key: 1,
            ref: r.footerContainerRef,
            class: t.cx("footer")
          }, t.ptm("footer")), [B(t.$slots, "footer", {}, function() {
            return [D(L(t.footer), 1)];
          })], 16)) : z("", !0)], 64))], 16, En)), [[f, {
            disabled: !t.modal
          }]]) : z("", !0)];
        }),
        _: 3
      }, 16, ["onEnter", "onAfterEnter", "onBeforeLeave", "onLeave", "onAfterLeave"])], 16, zn)) : z("", !0)];
    }),
    _: 3
  }, 8, ["appendTo"]);
}
Xt.render = Pn;
var Bn = `
    .p-toggleswitch {
        display: inline-block;
        width: dt('toggleswitch.width');
        height: dt('toggleswitch.height');
    }

    .p-toggleswitch-input {
        cursor: pointer;
        appearance: none;
        position: absolute;
        top: 0;
        inset-inline-start: 0;
        width: 100%;
        height: 100%;
        padding: 0;
        margin: 0;
        opacity: 0;
        z-index: 1;
        outline: 0 none;
        border-radius: dt('toggleswitch.border.radius');
    }

    .p-toggleswitch-slider {
        cursor: pointer;
        width: 100%;
        height: 100%;
        border-width: dt('toggleswitch.border.width');
        border-style: solid;
        border-color: dt('toggleswitch.border.color');
        background: dt('toggleswitch.background');
        transition:
            background dt('toggleswitch.transition.duration'),
            color dt('toggleswitch.transition.duration'),
            border-color dt('toggleswitch.transition.duration'),
            outline-color dt('toggleswitch.transition.duration'),
            box-shadow dt('toggleswitch.transition.duration');
        border-radius: dt('toggleswitch.border.radius');
        outline-color: transparent;
        box-shadow: dt('toggleswitch.shadow');
    }

    .p-toggleswitch-handle {
        position: absolute;
        top: 50%;
        display: flex;
        justify-content: center;
        align-items: center;
        background: dt('toggleswitch.handle.background');
        color: dt('toggleswitch.handle.color');
        width: dt('toggleswitch.handle.size');
        height: dt('toggleswitch.handle.size');
        inset-inline-start: dt('toggleswitch.gap');
        margin-block-start: calc(-1 * calc(dt('toggleswitch.handle.size') / 2));
        border-radius: dt('toggleswitch.handle.border.radius');
        transition:
            background dt('toggleswitch.transition.duration'),
            color dt('toggleswitch.transition.duration'),
            inset-inline-start dt('toggleswitch.slide.duration'),
            box-shadow dt('toggleswitch.slide.duration');
    }

    .p-toggleswitch.p-toggleswitch-checked .p-toggleswitch-slider {
        background: dt('toggleswitch.checked.background');
        border-color: dt('toggleswitch.checked.border.color');
    }

    .p-toggleswitch.p-toggleswitch-checked .p-toggleswitch-handle {
        background: dt('toggleswitch.handle.checked.background');
        color: dt('toggleswitch.handle.checked.color');
        inset-inline-start: calc(dt('toggleswitch.width') - calc(dt('toggleswitch.handle.size') + dt('toggleswitch.gap')));
    }

    .p-toggleswitch:not(.p-disabled):has(.p-toggleswitch-input:hover) .p-toggleswitch-slider {
        background: dt('toggleswitch.hover.background');
        border-color: dt('toggleswitch.hover.border.color');
    }

    .p-toggleswitch:not(.p-disabled):has(.p-toggleswitch-input:hover) .p-toggleswitch-handle {
        background: dt('toggleswitch.handle.hover.background');
        color: dt('toggleswitch.handle.hover.color');
    }

    .p-toggleswitch:not(.p-disabled):has(.p-toggleswitch-input:hover).p-toggleswitch-checked .p-toggleswitch-slider {
        background: dt('toggleswitch.checked.hover.background');
        border-color: dt('toggleswitch.checked.hover.border.color');
    }

    .p-toggleswitch:not(.p-disabled):has(.p-toggleswitch-input:hover).p-toggleswitch-checked .p-toggleswitch-handle {
        background: dt('toggleswitch.handle.checked.hover.background');
        color: dt('toggleswitch.handle.checked.hover.color');
    }

    .p-toggleswitch:not(.p-disabled):has(.p-toggleswitch-input:focus-visible) .p-toggleswitch-slider {
        box-shadow: dt('toggleswitch.focus.ring.shadow');
        outline: dt('toggleswitch.focus.ring.width') dt('toggleswitch.focus.ring.style') dt('toggleswitch.focus.ring.color');
        outline-offset: dt('toggleswitch.focus.ring.offset');
    }

    .p-toggleswitch.p-invalid > .p-toggleswitch-slider {
        border-color: dt('toggleswitch.invalid.border.color');
    }

    .p-toggleswitch.p-disabled {
        opacity: 1;
    }

    .p-toggleswitch.p-disabled .p-toggleswitch-slider {
        background: dt('toggleswitch.disabled.background');
    }

    .p-toggleswitch.p-disabled .p-toggleswitch-handle {
        background: dt('toggleswitch.handle.disabled.background');
    }
`, Dn = {
  root: {
    position: "relative"
  }
}, An = {
  root: function(e) {
    var n = e.instance, o = e.props;
    return ["p-toggleswitch p-component", {
      "p-toggleswitch-checked": n.checked,
      "p-disabled": o.disabled,
      "p-invalid": n.$invalid
    }];
  },
  input: "p-toggleswitch-input",
  slider: "p-toggleswitch-slider",
  handle: "p-toggleswitch-handle"
}, On = rt.extend({
  name: "toggleswitch",
  style: Bn,
  classes: An,
  inlineStyles: Dn
}), Tn = {
  name: "BaseToggleSwitch",
  extends: Be,
  props: {
    trueValue: {
      type: null,
      default: !0
    },
    falseValue: {
      type: null,
      default: !1
    },
    readonly: {
      type: Boolean,
      default: !1
    },
    tabindex: {
      type: Number,
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
    }
  },
  style: On,
  provide: function() {
    return {
      $pcToggleSwitch: this,
      $parentInstance: this
    };
  }
}, Ct = {
  name: "ToggleSwitch",
  extends: Tn,
  inheritAttrs: !1,
  emits: ["change", "focus", "blur"],
  methods: {
    getPTOptions: function(e) {
      var n = e === "root" ? this.ptmi : this.ptm;
      return n(e, {
        context: {
          checked: this.checked,
          disabled: this.disabled
        }
      });
    },
    onChange: function(e) {
      if (!this.disabled && !this.readonly) {
        var n = this.checked ? this.falseValue : this.trueValue;
        this.writeValue(n, e), this.$emit("change", e);
      }
    },
    onFocus: function(e) {
      this.$emit("focus", e);
    },
    onBlur: function(e) {
      var n, o;
      this.$emit("blur", e), (n = (o = this.formField).onBlur) === null || n === void 0 || n.call(o, e);
    }
  },
  computed: {
    checked: function() {
      return this.d_value === this.trueValue;
    },
    dataP: function() {
      return Y({
        checked: this.checked,
        disabled: this.disabled,
        invalid: this.$invalid
      });
    }
  }
}, Mn = ["data-p-checked", "data-p-disabled", "data-p"], jn = ["id", "checked", "tabindex", "disabled", "readonly", "aria-checked", "aria-labelledby", "aria-label", "aria-invalid"], Fn = ["data-p"], Vn = ["data-p"];
function Rn(t, e, n, o, s, r) {
  return u(), g("div", S({
    class: t.cx("root"),
    style: t.sx("root")
  }, r.getPTOptions("root"), {
    "data-p-checked": r.checked,
    "data-p-disabled": t.disabled,
    "data-p": r.dataP
  }), [l("input", S({
    id: t.inputId,
    type: "checkbox",
    role: "switch",
    class: [t.cx("input"), t.inputClass],
    style: t.inputStyle,
    checked: r.checked,
    tabindex: t.tabindex,
    disabled: t.disabled,
    readonly: t.readonly,
    "aria-checked": r.checked,
    "aria-labelledby": t.ariaLabelledby,
    "aria-label": t.ariaLabel,
    "aria-invalid": t.invalid || void 0,
    onFocus: e[0] || (e[0] = function() {
      return r.onFocus && r.onFocus.apply(r, arguments);
    }),
    onBlur: e[1] || (e[1] = function() {
      return r.onBlur && r.onBlur.apply(r, arguments);
    }),
    onChange: e[2] || (e[2] = function() {
      return r.onChange && r.onChange.apply(r, arguments);
    })
  }, r.getPTOptions("input")), null, 16, jn), l("div", S({
    class: t.cx("slider")
  }, r.getPTOptions("slider"), {
    "data-p": r.dataP
  }), [l("div", S({
    class: t.cx("handle")
  }, r.getPTOptions("handle"), {
    "data-p": r.dataP
  }), [B(t.$slots, "handle", {
    checked: r.checked
  })], 16, Vn)], 16, Fn)], 16, Mn);
}
Ct.render = Rn;
const Hn = {
  class: "kx-nav",
  role: "tablist",
  "aria-label": "Agent sections"
}, Nn = ["aria-selected", "onClick"], Un = { class: "kx-nav-ico" }, Kn = { class: "kx-nav-lbl" }, Wn = {
  key: 0,
  class: "kx-nav-meta"
}, Zn = /* @__PURE__ */ J({
  __name: "AgentNav",
  props: {
    items: {},
    active: {}
  },
  emits: ["select"],
  setup(t, { emit: e }) {
    const n = e;
    return (o, s) => (u(), g("nav", Hn, [
      (u(!0), g(K, null, vt(t.items, (r) => (u(), g("button", {
        key: r.key,
        type: "button",
        role: "tab",
        class: R(["kx-nav-item", t.active === r.key && "kx-nav-item-on"]),
        "aria-selected": t.active === r.key,
        onClick: (v) => n("select", r.key)
      }, [
        l("span", Un, [
          $(b(T), {
            icon: r.icon,
            "aria-hidden": "true"
          }, null, 8, ["icon"])
        ]),
        l("span", Kn, L(r.label), 1),
        r.meta ? (u(), g("span", Wn, L(r.meta), 1)) : z("", !0)
      ], 10, Nn))), 128))
    ]));
  }
}), Xn = /* @__PURE__ */ J({
  __name: "IconField",
  props: {
    modelValue: {},
    fallback: {}
  },
  emits: ["update:modelValue"],
  setup(t, { emit: e }) {
    const n = t, o = e, s = N(null);
    let r = null;
    function v(f) {
      o("update:modelValue", f.detail || "");
    }
    async function x() {
      if (s.value) {
        r && r.removeEventListener("select", v), s.value.innerHTML = "";
        try {
          customElements.get("wc-icon-picker") || await kt("wc-icon-picker", { timeoutMs: 8e3 });
        } catch {
        }
        s.value && (r = document.createElement("wc-icon-picker"), r.setAttribute("value", n.modelValue || ""), n.fallback && r.setAttribute("fallback", n.fallback), r.addEventListener("select", v), s.value.appendChild(r));
      }
    }
    return Ft(x), yt(() => n.modelValue, (f) => {
      r && r.getAttribute("value") !== f && r.setAttribute("value", f || "");
    }), fe(() => {
      r && r.removeEventListener("select", v);
    }), (f, w) => (u(), g("div", {
      ref_key: "host",
      ref: s,
      class: "wc-iconfield"
    }, null, 512));
  }
});
function Yn({ form: t, traits: e, redirectTrait: n }) {
  const o = I(() => e().filter((c) => c.id !== n)), s = (c) => t.value.traits.includes(c.id), r = I(() => o.value.filter(s));
  function v(c) {
    return !!c && typeof c == "object" && !Array.isArray(c);
  }
  function x(c) {
    const y = v(t.value.trait_contexts[c]) ? t.value.trait_contexts[c] : {}, i = v(t.value.trait_agent_options[c]) ? t.value.trait_agent_options[c] : null;
    return i ? { ...y, agent_options: i } : y;
  }
  function f(c, y) {
    if (v(y) && (Object.prototype.hasOwnProperty.call(y, "context") || Object.prototype.hasOwnProperty.call(y, "agent_options"))) {
      t.value.trait_contexts = { ...t.value.trait_contexts, [c]: v(y.context) ? y.context : {} };
      const h = { ...t.value.trait_agent_options };
      v(y.agent_options) && Object.keys(y.agent_options).length ? h[c] = y.agent_options : delete h[c], t.value.trait_agent_options = h;
      return;
    }
    t.value.trait_contexts = { ...t.value.trait_contexts, [c]: y };
    const i = { ...t.value.trait_agent_options };
    delete i[c], t.value.trait_agent_options = i;
  }
  const w = I(() => t.value.traits.filter((c) => c !== n));
  function _(c) {
    t.value.traits = [...t.value.traits.filter((y) => y === n), ...c];
  }
  return {
    selectableTraits: o,
    selectedCapabilities: w,
    activeTraits: r,
    traitMountConfig: x,
    onTraitConfig: f,
    onCapabilitiesChange: _
  };
}
const ht = "kickside.agents.traits:redirect", Gn = "kickside.agents.traits:artifacts", qn = "kickside.uploads.traits:file_manager", it = "user_agent:";
function Jn({ form: t, agentId: e, agents: n, redirectTrait: o }) {
  const s = N("delegates");
  function r(h) {
    const m = h.detail;
    return m && Array.isArray(m.selected) ? m.selected.map(String) : [];
  }
  function v(h) {
    const m = new Set([e(), `${it}${e()}`].filter(Boolean));
    t.value.delegates = h.filter((C) => !m.has(C));
  }
  const x = (h) => h.startsWith(it) ? h.slice(it.length) : h, f = I(() => {
    const h = t.value.trait_contexts[o];
    return h && Array.isArray(h.targets) ? h.targets : [];
  }), w = I(() => f.value.map((h) => h.agent_id));
  function _(h) {
    t.value.trait_contexts = { ...t.value.trait_contexts, [o]: { targets: h } };
    const m = t.value.traits.indexOf(o);
    h.length && m < 0 ? t.value.traits.push(o) : !h.length && m >= 0 && t.value.traits.splice(m, 1);
  }
  function c(h) {
    const m = new Set([e(), `${it}${e()}`].filter(Boolean)), C = h.filter((E) => !m.has(E)), p = new Map(f.value.map((E) => [E.agent_id, E.comment]));
    _(C.map((E) => ({ agent_id: E, comment: p.get(E) || "" })));
  }
  function y(h) {
    const m = x(h);
    return n().find((C) => C.id === m)?.title || m;
  }
  function i(h, m) {
    _(f.value.map((C) => C.agent_id === h ? { ...C, comment: m } : C));
  }
  return { routeView: s, pickIds: r, onDelegatesChange: v, redirectTargets: f, redirectSelectedIds: w, setRedirects: _, onRedirectsChange: c, redirectLabel: y, setRedirectCommentById: i };
}
function Mt(t, e) {
  if (t && typeof t == "object") {
    const n = t, o = n.response?.data?.error;
    if (typeof o == "string") return o;
    if (o && typeof o == "object" && typeof o.message == "string")
      return o.message;
    if (typeof n.message == "string" && n.message) return n.message;
  }
  return e;
}
function Qn({ form: t, valid: e, tab: n, blank: o, agentId: s, parentId: r, models: v, redirectTrait: x, emitSaved: f }) {
  const w = N(!1), _ = N(!1), c = N("");
  async function y(m) {
    w.value = !0, t.value = o(!1);
    try {
      const { data: C } = await ft.get(`/api/v1/user-agents/${m}`);
      if (C?.success && C.agent) {
        const p = C.agent;
        t.value = {
          title: p.title || "",
          description: p.description || "",
          icon: p.icon || "tabler:robot",
          public: p.public === !0,
          prompt: p.prompt || "",
          model: p.model || v()[0]?.name || "",
          temperature: typeof p.temperature == "number" ? p.temperature : null,
          max_tokens: typeof p.max_tokens == "number" ? p.max_tokens : 8e3,
          thinking_effort: typeof p.thinking_effort == "number" ? p.thinking_effort : null,
          traits: Array.isArray(p.traits) ? [...p.traits] : [],
          trait_contexts: p.trait_contexts && typeof p.trait_contexts == "object" ? { ...p.trait_contexts } : {},
          trait_agent_options: p.trait_agent_options && typeof p.trait_agent_options == "object" ? { ...p.trait_agent_options } : {},
          tools: Array.isArray(p.tools) ? [...p.tools] : [],
          delegates: Array.isArray(p.delegates) ? [...p.delegates] : [],
          memory_target_id: p.memory_target_id || "",
          memory_provider_id: p.memory_provider_id || ""
        };
      }
    } catch (C) {
      c.value = Mt(C, "could not load agent");
    } finally {
      w.value = !1;
    }
  }
  function i(m) {
    const C = {};
    for (const p of t.value.traits)
      Object.prototype.hasOwnProperty.call(m, p) && (C[p] = m[p]);
    return C;
  }
  async function h() {
    if (!e.value) {
      c.value = t.value.title.trim() ? "Check the model and token limits." : "Name is required.", t.value.title.trim() && (n.value = "model");
      return;
    }
    _.value = !0, c.value = "";
    const m = {
      title: t.value.title.trim(),
      description: t.value.description,
      icon: t.value.icon,
      public: t.value.public,
      prompt: t.value.prompt,
      model: t.value.model,
      temperature: t.value.temperature ?? !1,
      max_tokens: t.value.max_tokens,
      thinking_effort: t.value.thinking_effort ?? !1,
      traits: t.value.traits,
      trait_contexts: i(t.value.trait_contexts),
      trait_agent_options: i(t.value.trait_agent_options),
      tools: t.value.tools,
      delegates: t.value.delegates,
      memory_target_id: t.value.memory_target_id,
      memory_provider_id: t.value.memory_provider_id
    }, C = s();
    if (C) {
      const p = /* @__PURE__ */ new Set([C, `user_agent:${C}`]);
      m.delegates = m.delegates.filter((j) => !p.has(j));
      const E = m.trait_contexts?.[x];
      if (E && Array.isArray(E.targets)) {
        const j = E.targets.filter((U) => !p.has(U.agent_id));
        m.trait_contexts = { ...m.trait_contexts, [x]: { ...E, targets: j } }, j.length || (m.traits = m.traits.filter((U) => U !== x));
      }
    }
    try {
      let p = C || "";
      if (C) {
        const { data: E } = await ft.put(`/api/v1/user-agents/${C}`, m);
        if (!E?.success) throw new Error(E?.error || "save failed");
      } else {
        const { data: E } = await ft.post("/api/v1/user-agents", { ...m, parent_id: r() || void 0 });
        if (!E?.success) throw new Error(E?.error || "create failed");
        p = E.component_id || "";
      }
      f(p);
    } catch (p) {
      c.value = Mt(p, "save failed");
    } finally {
      _.value = !1;
    }
  }
  return { loading: w, saving: _, error: c, loadAgent: y, save: h };
}
const to = { class: "kx-modal-head" }, eo = { class: "kx-modal-head-icon" }, no = { class: "kx-modal-head-text" }, oo = { class: "kx-modal-head-title" }, ro = { class: "kx-modal-head-sub" }, ao = {
  key: 0,
  class: "kx-2p"
}, io = { class: "kx-loading" }, lo = {
  key: 1,
  class: "kx-2p"
}, so = { class: "kx-2p-l" }, uo = { class: "kx-form" }, co = { class: "kx-field" }, bo = { class: "kx-name-row" }, po = { class: "kx-field" }, go = { class: "kx-2p-r" }, fo = { class: "kx-2p-r-head" }, ho = { class: "kx-2p-r-body" }, mo = {
  key: 0,
  class: "kx-form kx-form-grow"
}, vo = { class: "kx-field kx-field-grow" }, yo = {
  key: 1,
  class: "kx-form"
}, ko = { class: "kx-field" }, wo = ["value"], xo = { class: "kx-field" }, Co = ["max"], _o = {
  key: 0,
  class: "kx-field-err"
}, So = { class: "kx-field" }, $o = { class: "kx-toggle" }, zo = {
  key: 0,
  class: "kx-think"
}, Eo = { class: "kx-field-hint-inline" }, Io = { class: "kx-field" }, Lo = {
  key: 0,
  class: "kx-toggle"
}, Po = {
  key: 1,
  class: "kx-sec-foot"
}, Bo = {
  key: 2,
  class: "kx-think"
}, Do = { class: "kx-field-hint-inline" }, Ao = {
  key: 2,
  class: "kx-form"
}, Oo = {
  key: 0,
  class: "kx-group",
  "aria-label": "Existing direct tools"
}, To = { class: "kx-group-head" }, Mo = { class: "kx-group-meta" }, jo = { class: "kx-direct-tools" }, Fo = ["data-tool-id"], Vo = ["aria-label", "onClick"], Ro = {
  key: 3,
  class: "kx-form"
}, Ho = {
  class: "kx-seg",
  role: "tablist"
}, No = ["aria-selected"], Uo = {
  key: 0,
  class: "kx-seg-count"
}, Ko = ["aria-selected"], Wo = {
  key: 0,
  class: "kx-seg-count"
}, Zo = ["selected"], Xo = ["selected"], Yo = {
  key: 0,
  class: "kx-redirect-comments"
}, Go = { class: "kx-redirect-comment-name" }, qo = ["value", "onInput"], Jo = { class: "kx-modal-foot" }, Qo = {
  key: 0,
  class: "kx-err inline kx-foot-err"
}, tr = {
  key: 1,
  class: "kx-embed"
}, er = {
  class: "kx-modal kx-modal-agent kx-modal-embed",
  role: "dialog",
  "aria-modal": "true"
}, dr = /* @__PURE__ */ J({
  __name: "AgentForm",
  props: {
    open: { type: Boolean },
    embedded: { type: Boolean },
    agentId: {},
    traits: {},
    tools: {},
    models: {},
    agents: {},
    parentId: {}
  },
  emits: ["close", "saved"],
  setup(t, { emit: e }) {
    const n = he(), o = J({
      setup(k, { slots: a }) {
        return n.value = a.default, () => {
        };
      }
    }), s = J({
      render() {
        return n.value ? n.value() : null;
      }
    }), r = t, v = e, x = I(() => {
      switch (f.value) {
        case "model":
          return "Model";
        case "caps":
          return "Capabilities";
        case "routing":
          return "Routing";
        default:
          return "Prompt";
      }
    }), f = N("prompt"), w = ["fast", "nano", "balanced", "premium"], _ = I(() => {
      const k = /* @__PURE__ */ new Set();
      for (const a of r.models) for (const d of a.class || []) k.add(d);
      return [...k].sort((a, d) => {
        const O = w.indexOf(a), pt = w.indexOf(d);
        return (O < 0 ? 99 : O) - (pt < 0 ? 99 : pt) || a.localeCompare(d);
      });
    });
    function c() {
      return _.value.includes("fast") ? "class:fast" : _.value.length ? "class:" + _.value[0] : r.models[0]?.name || "";
    }
    function y(k = !0) {
      return {
        title: "",
        description: "",
        icon: "tabler:robot",
        prompt: "",
        public: !1,
        model: c(),
        temperature: null,
        max_tokens: 8e3,
        thinking_effort: null,
        traits: k ? [Gn, qn] : [],
        trait_contexts: {},
        trait_agent_options: {},
        tools: [],
        delegates: [],
        memory_target_id: "",
        memory_provider_id: ""
      };
    }
    const i = N(y()), h = I(() => !!r.agentId), m = I(() => i.value.tools.map((k) => ({
      id: k,
      title: r.tools.find((a) => a.id === k)?.title || k
    }))), C = I({
      get: () => r.open,
      set: (k) => {
        k || v("close");
      }
    }), p = N(null);
    function E() {
      me(() => p.value?.focus({ preventScroll: !0 }));
    }
    const j = I({
      get: () => Math.round((i.value.temperature ?? 0.5) * 50),
      set: (k) => {
        i.value.temperature = Math.max(0, Math.min(2, (Number(k) || 0) / 50));
      }
    }), U = I({
      get: () => i.value.temperature !== null,
      set: (k) => {
        i.value.temperature = k ? i.value.temperature ?? 0.5 : null;
      }
    }), dt = I(() => i.value.model.startsWith("class:") ? r.models.filter((k) => k.class?.includes(i.value.model.slice(6))) : r.models.filter((k) => k.name === i.value.model)), ut = I(() => {
      const k = dt.value.map((a) => a.output_tokens).filter((a) => typeof a == "number" && Number.isFinite(a) && a > 0);
      return k.length ? Math.min(...k) : 128e3;
    }), St = I(() => !G.value && (dt.value.length === 0 || dt.value.some((k) => !k.capabilities?.includes("reasoning")))), Yt = I(() => G.value ? "Extended thinking sets its own temperature." : "The selected models reason instead of sampling, so temperature is not applied."), ct = I(() => !Number.isInteger(i.value.max_tokens) || i.value.max_tokens < 1 || i.value.max_tokens > ut.value), $t = I(() => i.value.title.trim().length > 0 && !!i.value.model && !ct.value), Gt = Qn({
      form: i,
      valid: $t,
      tab: f,
      blank: y,
      agentId: () => r.agentId,
      parentId: () => r.parentId,
      models: () => r.models,
      redirectTrait: ht,
      emitSaved: (k) => v("saved", k)
    }), { loading: qt, saving: at, error: bt, loadAgent: Jt, save: Qt } = Gt;
    yt(() => r.models, () => {
      !h.value && !i.value.model && (i.value.model = c());
    }, { immediate: !0 }), Ft(() => {
      kt("wc-model-picker", { timeoutMs: 8e3 }).catch(() => {
      }), kt("wc-agent-picker", { timeoutMs: 8e3 }).catch(() => {
      });
    });
    function te(k) {
      i.value.model = k.detail;
    }
    const G = I({
      get: () => i.value.thinking_effort !== null,
      set: (k) => {
        i.value.thinking_effort = k ? i.value.thinking_effort ?? 50 : null;
      }
    }), { selectableTraits: ee, selectedCapabilities: ne, activeTraits: zt, traitMountConfig: oe, onTraitConfig: re, onCapabilitiesChange: ae } = Yn({ form: i, traits: () => r.traits, redirectTrait: ht }), ie = Jn({
      form: i,
      agentId: () => r.agentId,
      agents: () => r.agents,
      redirectTrait: ht
    }), {
      routeView: F,
      pickIds: Et,
      onDelegatesChange: le,
      redirectTargets: W,
      redirectSelectedIds: se,
      onRedirectsChange: de,
      redirectLabel: ue,
      setRedirectCommentById: ce
    } = ie;
    yt(() => [r.open, r.agentId], ([k]) => {
      k && (f.value = "prompt", F.value = "delegates", bt.value = "", r.agentId ? Jt(r.agentId) : i.value = y());
    }, { immediate: !0 });
    const be = I(() => [
      { key: "prompt", label: "Prompt", icon: "tabler:keyboard", meta: i.value.prompt.trim() ? "•" : "" },
      { key: "model", label: "Model", icon: "tabler:cpu", meta: "" },
      { key: "caps", label: "Capabilities", icon: "tabler:puzzle", meta: zt.value.length ? String(zt.value.length) : "" },
      { key: "routing", label: "Routing", icon: "tabler:arrows-split-2", meta: i.value.delegates.length + W.value.length ? String(i.value.delegates.length + W.value.length) : "" }
    ]);
    return (k, a) => (u(), g(K, null, [
      $(b(o), null, {
        default: M(() => [
          l("div", to, [
            l("span", eo, [
              $(b(T), {
                icon: i.value.icon || "tabler:robot",
                "aria-hidden": "true"
              }, null, 8, ["icon"])
            ]),
            l("span", no, [
              l("span", oo, L(h.value ? "Edit agent" : "New agent"), 1),
              l("span", ro, L(i.value.title.trim() || "Configure persona, model and capabilities."), 1)
            ]),
            l("button", {
              class: "kx-modal-x",
              "aria-label": "Close",
              onClick: a[0] || (a[0] = (d) => v("close"))
            }, [
              $(b(T), {
                icon: "tabler:x",
                "aria-hidden": "true"
              })
            ])
          ]),
          b(qt) ? (u(), g("div", ao, [
            l("div", io, [
              $(b(T), {
                icon: "tabler:loader-2",
                class: "spin",
                "aria-hidden": "true"
              }),
              a[17] || (a[17] = D(" Loading…", -1))
            ])
          ])) : (u(), g("div", lo, [
            l("div", so, [
              l("div", uo, [
                l("div", co, [
                  a[18] || (a[18] = l("span", { class: "kx-field-lbl" }, "Name", -1)),
                  l("div", bo, [
                    $(Xn, {
                      class: "kx-name-icon",
                      modelValue: i.value.icon,
                      "onUpdate:modelValue": a[1] || (a[1] = (d) => i.value.icon = d),
                      fallback: "tabler:robot"
                    }, null, 8, ["modelValue"]),
                    V(l("input", {
                      ref_key: "agentNameInput",
                      ref: p,
                      "onUpdate:modelValue": a[2] || (a[2] = (d) => i.value.title = d),
                      class: "kx-input",
                      "data-agent-name": "",
                      "aria-label": "Agent name",
                      placeholder: "e.g. Research assistant"
                    }, null, 512), [
                      [Z, i.value.title]
                    ])
                  ])
                ]),
                l("label", po, [
                  a[19] || (a[19] = l("span", { class: "kx-field-lbl" }, [
                    D("Description "),
                    l("span", { class: "kx-field-hint-inline" }, "— shown in pickers")
                  ], -1)),
                  V(l("textarea", {
                    "onUpdate:modelValue": a[3] || (a[3] = (d) => i.value.description = d),
                    class: "kx-input kx-textarea kx-textarea-sm",
                    rows: "2",
                    placeholder: "What this agent is for."
                  }, null, 512), [
                    [Z, i.value.description]
                  ])
                ])
              ]),
              $(Zn, {
                items: be.value,
                active: f.value,
                onSelect: a[4] || (a[4] = (d) => f.value = d)
              }, null, 8, ["items", "active"])
            ]),
            l("div", go, [
              l("div", fo, L(x.value), 1),
              l("div", ho, [
                f.value === "prompt" ? (u(), g("div", mo, [
                  l("label", vo, [
                    a[20] || (a[20] = l("span", { class: "kx-field-lbl" }, [
                      D("System prompt "),
                      l("span", { class: "kx-field-hint-inline" }, "— the agent's persona and instructions")
                    ], -1)),
                    V(l("textarea", {
                      "onUpdate:modelValue": a[5] || (a[5] = (d) => i.value.prompt = d),
                      class: "kx-input kx-textarea kx-textarea-lg",
                      placeholder: "You are a helpful assistant that…"
                    }, null, 512), [
                      [Z, i.value.prompt]
                    ])
                  ]),
                  a[21] || (a[21] = l("p", { class: "kx-sec-foot" }, "Keep the prompt clear and operational. Capabilities and routing are configured in their own sections.", -1))
                ])) : f.value === "model" ? (u(), g("div", yo, [
                  l("div", ko, [
                    a[22] || (a[22] = l("span", { class: "kx-field-lbl" }, "Model", -1)),
                    l("wc-model-picker", {
                      value: i.value.model || "",
                      onSelect: te
                    }, null, 40, wo)
                  ]),
                  l("label", xo, [
                    a[23] || (a[23] = l("span", { class: "kx-field-lbl" }, [
                      D("Max tokens "),
                      l("span", { class: "kx-field-hint-inline" }, "— response length cap")
                    ], -1)),
                    V(l("input", {
                      "onUpdate:modelValue": a[6] || (a[6] = (d) => i.value.max_tokens = d),
                      type: "number",
                      min: "1",
                      max: ut.value,
                      step: "1",
                      class: R(["kx-input", ct.value && "kx-input-err"])
                    }, null, 10, Co), [
                      [
                        Z,
                        i.value.max_tokens,
                        void 0,
                        { number: !0 }
                      ]
                    ]),
                    ct.value ? (u(), g("span", _o, "Must be between 1 and " + L(ut.value) + ".", 1)) : z("", !0)
                  ]),
                  l("div", So, [
                    l("div", $o, [
                      $(b(Ct), {
                        modelValue: G.value,
                        "onUpdate:modelValue": a[7] || (a[7] = (d) => G.value = d),
                        "input-id": "agent-thinking"
                      }, null, 8, ["modelValue"]),
                      a[24] || (a[24] = l("label", {
                        for: "agent-thinking",
                        class: "kx-toggle-copy"
                      }, [
                        l("span", { class: "kx-field-lbl" }, "Extended thinking")
                      ], -1))
                    ]),
                    G.value ? (u(), g("div", zo, [
                      l("span", Eo, "Effort: " + L(i.value.thinking_effort) + "%", 1),
                      V(l("input", {
                        "onUpdate:modelValue": a[8] || (a[8] = (d) => i.value.thinking_effort = d),
                        type: "range",
                        min: "0",
                        max: "100",
                        step: "5",
                        class: "kx-range"
                      }, null, 512), [
                        [
                          Z,
                          i.value.thinking_effort,
                          void 0,
                          { number: !0 }
                        ]
                      ])
                    ])) : z("", !0)
                  ]),
                  l("div", Io, [
                    St.value ? (u(), g("div", Lo, [
                      $(b(Ct), {
                        modelValue: U.value,
                        "onUpdate:modelValue": a[9] || (a[9] = (d) => U.value = d),
                        "input-id": "agent-temperature"
                      }, null, 8, ["modelValue"]),
                      a[25] || (a[25] = l("label", {
                        for: "agent-temperature",
                        class: "kx-toggle-copy"
                      }, [
                        l("span", { class: "kx-field-lbl" }, "Custom temperature")
                      ], -1))
                    ])) : (u(), g("p", Po, L(Yt.value), 1)),
                    St.value && U.value ? (u(), g("div", Bo, [
                      l("span", Do, L(j.value) + "% · higher is more creative · unsupported on most current models", 1),
                      V(l("input", {
                        "onUpdate:modelValue": a[10] || (a[10] = (d) => j.value = d),
                        type: "range",
                        min: "0",
                        max: "100",
                        step: "1",
                        class: "kx-range"
                      }, null, 512), [
                        [
                          Z,
                          j.value,
                          void 0,
                          { number: !0 }
                        ]
                      ])
                    ])) : z("", !0)
                  ])
                ])) : f.value === "caps" ? (u(), g("div", Ao, [
                  $(Ae, {
                    traits: b(ee),
                    tools: t.tools,
                    selected: b(ne),
                    onChange: b(ae)
                  }, {
                    config: M(({ trait: d }) => [
                      d.web_component ? (u(), H(De, {
                        key: 0,
                        tag: d.web_component,
                        config: b(oe)(d.id),
                        provider: d.provider,
                        onChange: (O) => b(re)(d.id, O)
                      }, null, 8, ["tag", "config", "provider", "onChange"])) : z("", !0)
                    ]),
                    _: 1
                  }, 8, ["traits", "tools", "selected", "onChange"]),
                  i.value.tools.length ? (u(), g("section", Oo, [
                    l("div", To, [
                      a[26] || (a[26] = l("span", { class: "kx-group-title" }, "Existing direct tools", -1)),
                      l("span", Mo, L(i.value.tools.length), 1)
                    ]),
                    l("ul", jo, [
                      (u(!0), g(K, null, vt(m.value, ({ id: d, title: O }) => (u(), g("li", {
                        key: d,
                        "data-tool-id": d
                      }, [
                        l("span", null, L(O), 1),
                        l("button", {
                          type: "button",
                          class: "kx-trait-x",
                          "aria-label": `Remove ${O} tool`,
                          onClick: (pt) => i.value.tools = i.value.tools.filter((pe) => pe !== d)
                        }, [
                          $(b(T), {
                            icon: "tabler:x",
                            "aria-hidden": "true"
                          })
                        ], 8, Vo)
                      ], 8, Fo))), 128))
                    ])
                  ])) : z("", !0)
                ])) : f.value === "routing" ? (u(), g("div", Ro, [
                  l("div", Ho, [
                    l("button", {
                      type: "button",
                      role: "tab",
                      class: R(["kx-seg-btn", b(F) === "delegates" && "kx-seg-btn-on"]),
                      "aria-selected": b(F) === "delegates",
                      onClick: a[11] || (a[11] = (d) => F.value = "delegates")
                    }, [
                      $(b(T), {
                        icon: "tabler:arrow-ramp-right-3",
                        "aria-hidden": "true"
                      }),
                      a[27] || (a[27] = D(" Delegates ", -1)),
                      i.value.delegates.length ? (u(), g("span", Uo, L(i.value.delegates.length), 1)) : z("", !0)
                    ], 10, No),
                    l("button", {
                      type: "button",
                      role: "tab",
                      class: R(["kx-seg-btn", b(F) === "redirects" && "kx-seg-btn-on"]),
                      "aria-selected": b(F) === "redirects",
                      onClick: a[12] || (a[12] = (d) => F.value = "redirects")
                    }, [
                      $(b(T), {
                        icon: "tabler:arrows-split-2",
                        "aria-hidden": "true"
                      }),
                      a[28] || (a[28] = D(" Redirects ", -1)),
                      b(W).length ? (u(), g("span", Wo, L(b(W).length), 1)) : z("", !0)
                    ], 10, Ko)
                  ]),
                  b(F) === "delegates" ? (u(), g(K, { key: 0 }, [
                    a[29] || (a[29] = l("p", { class: "kx-sec-foot" }, "When this agent decides a task belongs to another, it can hand off while keeping the chat. Pick the agents it may delegate to.", -1)),
                    l("wc-agent-picker", {
                      placeholder: "Search agents to delegate to…",
                      selected: JSON.stringify(i.value.delegates),
                      onChange: a[13] || (a[13] = (d) => b(le)(b(Et)(d)))
                    }, null, 40, Zo)
                  ], 64)) : (u(), g(K, { key: 1 }, [
                    a[30] || (a[30] = l("p", { class: "kx-sec-foot" }, [
                      D("A redirect is not a delegate: it "),
                      l("strong", null, "transfers the whole chat"),
                      D(" — the target agent takes over and this one stops. Pick the agents it may hand off to, and note when (injected into the prompt).")
                    ], -1)),
                    l("wc-agent-picker", {
                      placeholder: "Search agents to redirect to…",
                      selected: JSON.stringify(b(se)),
                      onChange: a[14] || (a[14] = (d) => b(de)(b(Et)(d)))
                    }, null, 40, Xo),
                    b(W).length ? (u(), g("div", Yo, [
                      (u(!0), g(K, null, vt(b(W), (d) => (u(), g("div", {
                        key: d.agent_id,
                        class: "kx-redirect-comment-row"
                      }, [
                        l("span", Go, [
                          $(b(T), {
                            icon: "tabler:arrows-split-2",
                            "aria-hidden": "true"
                          }),
                          D(" " + L(b(ue)(d.agent_id)), 1)
                        ]),
                        l("input", {
                          value: d.comment,
                          class: "kx-input kx-redirect-comment",
                          placeholder: "When to redirect here (injected into the prompt)…",
                          onInput: (O) => b(ce)(d.agent_id, O.target.value)
                        }, null, 40, qo)
                      ]))), 128))
                    ])) : z("", !0)
                  ], 64))
                ])) : z("", !0)
              ])
            ])
          ])),
          l("div", Jo, [
            b(bt) ? (u(), g("div", Qo, L(b(bt)), 1)) : z("", !0),
            $(b(st), {
              type: "button",
              label: "Cancel",
              severity: "secondary",
              outlined: "",
              disabled: b(at),
              onClick: a[15] || (a[15] = (d) => v("close"))
            }, null, 8, ["disabled"]),
            $(b(st), {
              type: "button",
              "data-testid": "agent-form-save",
              label: b(at) ? h.value ? "Saving…" : "Creating…" : h.value ? "Save changes" : "Create agent",
              loading: b(at),
              disabled: b(at) || !$t.value,
              onClick: b(Qt)
            }, {
              icon: M(({ class: d }) => [
                $(b(T), {
                  icon: h.value ? "tabler:device-floppy" : "tabler:plus",
                  class: R(d),
                  "aria-hidden": "true"
                }, null, 8, ["icon", "class"])
              ]),
              _: 1
            }, 8, ["label", "loading", "disabled", "onClick"])
          ])
        ]),
        _: 1
      }),
      t.embedded ? t.open ? (u(), g("div", tr, [
        l("div", er, [
          $(b(s))
        ])
      ])) : z("", !0) : (u(), H(b(Xt), {
        key: 0,
        visible: C.value,
        "onUpdate:visible": a[16] || (a[16] = (d) => C.value = d),
        modal: "",
        "block-scroll": "",
        "show-header": !1,
        "dismissable-mask": !0,
        draggable: !1,
        pt: { root: { class: "kx-modal kx-modal-agent", role: "dialog", "aria-modal": "true", "aria-label": h.value ? "Edit agent" : "New agent" }, content: { class: "kx-modal-content" } },
        onShow: E
      }, {
        default: M(() => [
          $(b(s))
        ]),
        _: 1
      }, 8, ["visible", "pt"]))
    ], 64));
  }
});
export {
  dr as _,
  Mt as e,
  st as s
};
//# sourceMappingURL=AgentForm.vue_vue_type_script_setup_true_lang-B4RGzf_F.js.map

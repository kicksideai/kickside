import { openBlock as d, createElementBlock as p, mergeProps as w, renderSlot as L, createTextVNode as B, toDisplayString as A, resolveComponent as q, resolveDirective as Nt, withDirectives as F, createBlock as O, resolveDynamicComponent as mt, withCtx as M, createCommentVNode as S, normalizeClass as V, createElementVNode as i, computed as P, createVNode as $, Transition as ye, Fragment as H, defineComponent as Y, renderList as St, unref as c, ref as T, vModelText as K, onMounted as Ht, watch as vt, onBeforeUnmount as ke, shallowRef as xe, nextTick as we } from "vue";
import { Icon as j } from "@iconify/vue";
import { B as J, l as Ut, b as Kt, L as Ce, d as X, f as et, U as _e, i as Bt, j as Se, r as Gt, m as $e, a as ze, v as Ie, C as Pe, n as Ae, S as Le, _ as Ee, o as Be, q as De, k as Oe } from "./primevue-plugin-Dn0ACs8V.js";
import { b as $t, f as G, R as Wt, d as Te, c as zt, B as je, a as Fe, x as gt, g as Me, e as Ve, s as Re } from "./index-CAXh6BYi.js";
import { loadByTagName as yt, api as ht } from "@wippy-fe/proxy";
import { _ as Ne } from "./WcMount.vue_vue_type_script_setup_true_lang-CNWT59Oh.js";
import { _ as He } from "./toolCatalog-zaiNPgZH.js";
var Ue = `
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
`, Ke = {
  root: function(e) {
    var n = e.props, r = e.instance;
    return ["p-badge p-component", {
      "p-badge-circle": Kt(n.value) && String(n.value).length === 1,
      "p-badge-dot": Ut(n.value) && !r.$slots.default,
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
}, Ge = J.extend({
  name: "badge",
  style: Ue,
  classes: Ke
}), We = {
  name: "BaseBadge",
  extends: $t,
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
  style: Ge,
  provide: function() {
    return {
      $pcBadge: this,
      $parentInstance: this
    };
  }
};
function nt(t) {
  "@babel/helpers - typeof";
  return nt = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, nt(t);
}
function Dt(t, e, n) {
  return (e = Ze(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function Ze(t) {
  var e = Xe(t, "string");
  return nt(e) == "symbol" ? e : e + "";
}
function Xe(t, e) {
  if (nt(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(t, e);
    if (nt(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var Zt = {
  name: "Badge",
  extends: We,
  inheritAttrs: !1,
  computed: {
    dataP: function() {
      return G(Dt(Dt({
        circle: this.value != null && String(this.value).length === 1,
        empty: this.value == null && !this.$slots.default
      }, this.severity, this.severity), this.size, this.size));
    }
  }
}, Ye = ["data-p"];
function qe(t, e, n, r, s, o) {
  return d(), p("span", w({
    class: t.cx("root"),
    "data-p": o.dataP
  }, t.ptmi("root")), [L(t.$slots, "default", {}, function() {
    return [B(A(t.value), 1)];
  })], 16, Ye);
}
Zt.render = qe;
var Je = `
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
function ot(t) {
  "@babel/helpers - typeof";
  return ot = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, ot(t);
}
function D(t, e, n) {
  return (e = Qe(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function Qe(t) {
  var e = tn(t, "string");
  return ot(e) == "symbol" ? e : e + "";
}
function tn(t, e) {
  if (ot(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(t, e);
    if (ot(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var en = {
  root: function(e) {
    var n = e.instance, r = e.props;
    return ["p-button p-component", D(D(D(D(D(D(D(D(D({
      "p-button-icon-only": n.hasIcon && !r.label && !r.badge,
      "p-button-vertical": (r.iconPos === "top" || r.iconPos === "bottom") && r.label,
      "p-button-loading": r.loading,
      "p-button-link": r.link || r.variant === "link"
    }, "p-button-".concat(r.severity), r.severity), "p-button-raised", r.raised), "p-button-rounded", r.rounded), "p-button-text", r.text || r.variant === "text"), "p-button-outlined", r.outlined || r.variant === "outlined"), "p-button-sm", r.size === "small"), "p-button-lg", r.size === "large"), "p-button-plain", r.plain), "p-button-fluid", n.hasFluid)];
  },
  loadingIcon: "p-button-loading-icon",
  icon: function(e) {
    var n = e.props;
    return ["p-button-icon", D({}, "p-button-icon-".concat(n.iconPos), n.label)];
  },
  label: "p-button-label"
}, nn = J.extend({
  name: "button",
  style: Je,
  classes: en
}), on = {
  name: "BaseButton",
  extends: $t,
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
  style: nn,
  provide: function() {
    return {
      $pcButton: this,
      $parentInstance: this
    };
  }
};
function rt(t) {
  "@babel/helpers - typeof";
  return rt = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, rt(t);
}
function E(t, e, n) {
  return (e = rn(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function rn(t) {
  var e = an(t, "string");
  return rt(e) == "symbol" ? e : e + "";
}
function an(t, e) {
  if (rt(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(t, e);
    if (rt(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var ct = {
  name: "Button",
  extends: on,
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
      return w(this.asAttrs, this.a11yAttrs, this.getPTOptions("root"));
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
      return Ut(this.fluid) ? !!this.$pcFluid : this.fluid;
    },
    dataP: function() {
      return G(E(E(E(E(E(E(E(E(E(E({}, this.size, this.size), "icon-only", this.hasIcon && !this.label && !this.badge), "loading", this.loading), "fluid", this.hasFluid), "rounded", this.rounded), "raised", this.raised), "outlined", this.outlined || this.variant === "outlined"), "text", this.text || this.variant === "text"), "link", this.link || this.variant === "link"), "vertical", (this.iconPos === "top" || this.iconPos === "bottom") && this.label));
    },
    dataIconP: function() {
      return G(E(E({}, this.iconPos, this.iconPos), this.size, this.size));
    },
    dataLabelP: function() {
      return G(E(E({}, this.size, this.size), "icon-only", this.hasIcon && !this.label && !this.badge));
    }
  },
  components: {
    SpinnerIcon: Te,
    Badge: Zt
  },
  directives: {
    ripple: Wt
  }
}, ln = ["data-p"], sn = ["data-p"];
function dn(t, e, n, r, s, o) {
  var x = q("SpinnerIcon"), k = q("Badge"), h = Nt("ripple");
  return t.asChild ? L(t.$slots, "default", {
    key: 1,
    class: V(t.cx("root")),
    a11yAttrs: o.a11yAttrs
  }) : F((d(), O(mt(t.as), w({
    key: 0,
    class: t.cx("root"),
    "data-p": o.dataP
  }, o.attrs), {
    default: M(function() {
      return [L(t.$slots, "default", {}, function() {
        return [t.loading ? L(t.$slots, "loadingicon", w({
          key: 0,
          class: [t.cx("loadingIcon"), t.cx("icon")]
        }, t.ptm("loadingIcon")), function() {
          return [t.loadingIcon ? (d(), p("span", w({
            key: 0,
            class: [t.cx("loadingIcon"), t.cx("icon"), t.loadingIcon]
          }, t.ptm("loadingIcon")), null, 16)) : (d(), O(x, w({
            key: 1,
            class: [t.cx("loadingIcon"), t.cx("icon")],
            spin: ""
          }, t.ptm("loadingIcon")), null, 16, ["class"]))];
        }) : L(t.$slots, "icon", w({
          key: 1,
          class: [t.cx("icon")]
        }, t.ptm("icon")), function() {
          return [t.icon ? (d(), p("span", w({
            key: 0,
            class: [t.cx("icon"), t.icon, t.iconClass],
            "data-p": o.dataIconP
          }, t.ptm("icon")), null, 16, ln)) : S("", !0)];
        }), t.label ? (d(), p("span", w({
          key: 2,
          class: t.cx("label")
        }, t.ptm("label"), {
          "data-p": o.dataLabelP
        }), A(t.label), 17, sn)) : S("", !0), t.badge ? (d(), O(k, {
          key: 3,
          value: t.badge,
          class: V(t.badgeClass),
          severity: t.badgeSeverity,
          unstyled: t.unstyled,
          pt: t.ptm("pcBadge")
        }, null, 8, ["value", "class", "severity", "unstyled", "pt"])) : S("", !0)];
      })];
    }),
    _: 3
  }, 16, ["class", "data-p"])), [[h]]);
}
ct.render = dn;
var Xt = {
  name: "WindowMaximizeIcon",
  extends: zt
};
function cn(t) {
  return gn(t) || pn(t) || bn(t) || un();
}
function un() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function bn(t, e) {
  if (t) {
    if (typeof t == "string") return kt(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? kt(t, e) : void 0;
  }
}
function pn(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function gn(t) {
  if (Array.isArray(t)) return kt(t);
}
function kt(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, r = Array(e); n < e; n++) r[n] = t[n];
  return r;
}
function hn(t, e, n, r, s, o) {
  return d(), p("svg", w({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, t.pti()), cn(e[0] || (e[0] = [i("path", {
    "fill-rule": "evenodd",
    "clip-rule": "evenodd",
    d: "M7 14H11.8C12.3835 14 12.9431 13.7682 13.3556 13.3556C13.7682 12.9431 14 12.3835 14 11.8V2.2C14 1.61652 13.7682 1.05694 13.3556 0.644365C12.9431 0.231785 12.3835 0 11.8 0H2.2C1.61652 0 1.05694 0.231785 0.644365 0.644365C0.231785 1.05694 0 1.61652 0 2.2V7C0 7.15913 0.063214 7.31174 0.175736 7.42426C0.288258 7.53679 0.44087 7.6 0.6 7.6C0.75913 7.6 0.911742 7.53679 1.02426 7.42426C1.13679 7.31174 1.2 7.15913 1.2 7V2.2C1.2 1.93478 1.30536 1.68043 1.49289 1.49289C1.68043 1.30536 1.93478 1.2 2.2 1.2H11.8C12.0652 1.2 12.3196 1.30536 12.5071 1.49289C12.6946 1.68043 12.8 1.93478 12.8 2.2V11.8C12.8 12.0652 12.6946 12.3196 12.5071 12.5071C12.3196 12.6946 12.0652 12.8 11.8 12.8H7C6.84087 12.8 6.68826 12.8632 6.57574 12.9757C6.46321 13.0883 6.4 13.2409 6.4 13.4C6.4 13.5591 6.46321 13.7117 6.57574 13.8243C6.68826 13.9368 6.84087 14 7 14ZM9.77805 7.42192C9.89013 7.534 10.0415 7.59788 10.2 7.59995C10.3585 7.59788 10.5099 7.534 10.622 7.42192C10.7341 7.30985 10.798 7.15844 10.8 6.99995V3.94242C10.8066 3.90505 10.8096 3.86689 10.8089 3.82843C10.8079 3.77159 10.7988 3.7157 10.7824 3.6623C10.756 3.55552 10.701 3.45698 10.622 3.37798C10.5099 3.2659 10.3585 3.20202 10.2 3.19995H7.00002C6.84089 3.19995 6.68828 3.26317 6.57576 3.37569C6.46324 3.48821 6.40002 3.64082 6.40002 3.79995C6.40002 3.95908 6.46324 4.11169 6.57576 4.22422C6.68828 4.33674 6.84089 4.39995 7.00002 4.39995H8.80006L6.19997 7.00005C6.10158 7.11005 6.04718 7.25246 6.04718 7.40005C6.04718 7.54763 6.10158 7.69004 6.19997 7.80005C6.30202 7.91645 6.44561 7.98824 6.59997 8.00005C6.75432 7.98824 6.89791 7.91645 6.99997 7.80005L9.60002 5.26841V6.99995C9.6021 7.15844 9.66598 7.30985 9.77805 7.42192ZM1.4 14H3.8C4.17066 13.9979 4.52553 13.8498 4.78763 13.5877C5.04973 13.3256 5.1979 12.9707 5.2 12.6V10.2C5.1979 9.82939 5.04973 9.47452 4.78763 9.21242C4.52553 8.95032 4.17066 8.80215 3.8 8.80005H1.4C1.02934 8.80215 0.674468 8.95032 0.412371 9.21242C0.150274 9.47452 0.00210008 9.82939 0 10.2V12.6C0.00210008 12.9707 0.150274 13.3256 0.412371 13.5877C0.674468 13.8498 1.02934 13.9979 1.4 14ZM1.25858 10.0586C1.29609 10.0211 1.34696 10 1.4 10H3.8C3.85304 10 3.90391 10.0211 3.94142 10.0586C3.97893 10.0961 4 10.147 4 10.2V12.6C4 12.6531 3.97893 12.704 3.94142 12.7415C3.90391 12.779 3.85304 12.8 3.8 12.8H1.4C1.34696 12.8 1.29609 12.779 1.25858 12.7415C1.22107 12.704 1.2 12.6531 1.2 12.6V10.2C1.2 10.147 1.22107 10.0961 1.25858 10.0586Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
Xt.render = hn;
var Yt = {
  name: "WindowMinimizeIcon",
  extends: zt
};
function fn(t) {
  return kn(t) || yn(t) || vn(t) || mn();
}
function mn() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function vn(t, e) {
  if (t) {
    if (typeof t == "string") return xt(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? xt(t, e) : void 0;
  }
}
function yn(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function kn(t) {
  if (Array.isArray(t)) return xt(t);
}
function xt(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, r = Array(e); n < e; n++) r[n] = t[n];
  return r;
}
function xn(t, e, n, r, s, o) {
  return d(), p("svg", w({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, t.pti()), fn(e[0] || (e[0] = [i("path", {
    "fill-rule": "evenodd",
    "clip-rule": "evenodd",
    d: "M11.8 0H2.2C1.61652 0 1.05694 0.231785 0.644365 0.644365C0.231785 1.05694 0 1.61652 0 2.2V7C0 7.15913 0.063214 7.31174 0.175736 7.42426C0.288258 7.53679 0.44087 7.6 0.6 7.6C0.75913 7.6 0.911742 7.53679 1.02426 7.42426C1.13679 7.31174 1.2 7.15913 1.2 7V2.2C1.2 1.93478 1.30536 1.68043 1.49289 1.49289C1.68043 1.30536 1.93478 1.2 2.2 1.2H11.8C12.0652 1.2 12.3196 1.30536 12.5071 1.49289C12.6946 1.68043 12.8 1.93478 12.8 2.2V11.8C12.8 12.0652 12.6946 12.3196 12.5071 12.5071C12.3196 12.6946 12.0652 12.8 11.8 12.8H7C6.84087 12.8 6.68826 12.8632 6.57574 12.9757C6.46321 13.0883 6.4 13.2409 6.4 13.4C6.4 13.5591 6.46321 13.7117 6.57574 13.8243C6.68826 13.9368 6.84087 14 7 14H11.8C12.3835 14 12.9431 13.7682 13.3556 13.3556C13.7682 12.9431 14 12.3835 14 11.8V2.2C14 1.61652 13.7682 1.05694 13.3556 0.644365C12.9431 0.231785 12.3835 0 11.8 0ZM6.368 7.952C6.44137 7.98326 6.52025 7.99958 6.6 8H9.8C9.95913 8 10.1117 7.93678 10.2243 7.82426C10.3368 7.71174 10.4 7.55913 10.4 7.4C10.4 7.24087 10.3368 7.08826 10.2243 6.97574C10.1117 6.86321 9.95913 6.8 9.8 6.8H8.048L10.624 4.224C10.73 4.11026 10.7877 3.95982 10.7849 3.80438C10.7822 3.64894 10.7192 3.50063 10.6093 3.3907C10.4994 3.28077 10.3511 3.2178 10.1956 3.21506C10.0402 3.21232 9.88974 3.27002 9.776 3.376L7.2 5.952V4.2C7.2 4.04087 7.13679 3.88826 7.02426 3.77574C6.91174 3.66321 6.75913 3.6 6.6 3.6C6.44087 3.6 6.28826 3.66321 6.17574 3.77574C6.06321 3.88826 6 4.04087 6 4.2V7.4C6.00042 7.47975 6.01674 7.55862 6.048 7.632C6.07656 7.70442 6.11971 7.7702 6.17475 7.82524C6.2298 7.88029 6.29558 7.92344 6.368 7.952ZM1.4 8.80005H3.8C4.17066 8.80215 4.52553 8.95032 4.78763 9.21242C5.04973 9.47452 5.1979 9.82939 5.2 10.2V12.6C5.1979 12.9707 5.04973 13.3256 4.78763 13.5877C4.52553 13.8498 4.17066 13.9979 3.8 14H1.4C1.02934 13.9979 0.674468 13.8498 0.412371 13.5877C0.150274 13.3256 0.00210008 12.9707 0 12.6V10.2C0.00210008 9.82939 0.150274 9.47452 0.412371 9.21242C0.674468 8.95032 1.02934 8.80215 1.4 8.80005ZM3.94142 12.7415C3.97893 12.704 4 12.6531 4 12.6V10.2C4 10.147 3.97893 10.0961 3.94142 10.0586C3.90391 10.0211 3.85304 10 3.8 10H1.4C1.34696 10 1.29609 10.0211 1.25858 10.0586C1.22107 10.0961 1.2 10.147 1.2 10.2V12.6C1.2 12.6531 1.22107 12.704 1.25858 12.7415C1.29609 12.779 1.34696 12.8 1.4 12.8H3.8C3.85304 12.8 3.90391 12.779 3.94142 12.7415Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
Yt.render = xn;
var wn = J.extend({
  name: "focustrap-directive"
}), Cn = je.extend({
  style: wn
});
function at(t) {
  "@babel/helpers - typeof";
  return at = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, at(t);
}
function Ot(t, e) {
  var n = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(t);
    e && (r = r.filter(function(s) {
      return Object.getOwnPropertyDescriptor(t, s).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function Tt(t) {
  for (var e = 1; e < arguments.length; e++) {
    var n = arguments[e] != null ? arguments[e] : {};
    e % 2 ? Ot(Object(n), !0).forEach(function(r) {
      _n(t, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(n)) : Ot(Object(n)).forEach(function(r) {
      Object.defineProperty(t, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return t;
}
function _n(t, e, n) {
  return (e = Sn(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function Sn(t) {
  var e = $n(t, "string");
  return at(e) == "symbol" ? e : e + "";
}
function $n(t, e) {
  if (at(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(t, e);
    if (at(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var zn = Cn.extend("focustrap", {
  mounted: function(e, n) {
    var r = n.value || {}, s = r.disabled;
    s || (this.createHiddenFocusableElements(e, n), this.bind(e, n), this.autoElementFocus(e, n)), e.setAttribute("data-pd-focustrap", !0), this.$el = e;
  },
  updated: function(e, n) {
    var r = n.value || {}, s = r.disabled;
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
      var r = this, s = n.value || {}, o = s.onFocusIn, x = s.onFocusOut;
      e.$_pfocustrap_mutationobserver = new MutationObserver(function(k) {
        k.forEach(function(h) {
          if (h.type === "childList" && !e.contains(document.activeElement)) {
            var y = function(f) {
              var z = Bt(f) ? Bt(f, r.getComputedSelector(e.$_pfocustrap_focusableselector)) ? f : et(e, r.getComputedSelector(e.$_pfocustrap_focusableselector)) : et(f);
              return Kt(z) ? z : f.nextSibling && y(f.nextSibling);
            };
            X(y(h.nextSibling));
          }
        });
      }), e.$_pfocustrap_mutationobserver.disconnect(), e.$_pfocustrap_mutationobserver.observe(e, {
        childList: !0
      }), e.$_pfocustrap_focusinlistener = function(k) {
        return o && o(k);
      }, e.$_pfocustrap_focusoutlistener = function(k) {
        return x && x(k);
      }, e.addEventListener("focusin", e.$_pfocustrap_focusinlistener), e.addEventListener("focusout", e.$_pfocustrap_focusoutlistener);
    },
    unbind: function(e) {
      e.$_pfocustrap_mutationobserver && e.$_pfocustrap_mutationobserver.disconnect(), e.$_pfocustrap_focusinlistener && e.removeEventListener("focusin", e.$_pfocustrap_focusinlistener) && (e.$_pfocustrap_focusinlistener = null), e.$_pfocustrap_focusoutlistener && e.removeEventListener("focusout", e.$_pfocustrap_focusoutlistener) && (e.$_pfocustrap_focusoutlistener = null);
    },
    autoFocus: function(e) {
      this.autoElementFocus(this.$el, {
        value: Tt(Tt({}, e), {}, {
          autoFocus: !0
        })
      });
    },
    autoElementFocus: function(e, n) {
      var r = n.value || {}, s = r.autoFocusSelector, o = s === void 0 ? "" : s, x = r.firstFocusableSelector, k = x === void 0 ? "" : x, h = r.autoFocus, y = h === void 0 ? !1 : h, v = et(e, "[autofocus]".concat(this.getComputedSelector(o)));
      y && !v && (v = et(e, this.getComputedSelector(k))), X(v);
    },
    onFirstHiddenElementFocus: function(e) {
      var n, r = e.currentTarget, s = e.relatedTarget, o = s === r.$_pfocustrap_lasthiddenfocusableelement || !((n = this.$el) !== null && n !== void 0 && n.contains(s)) ? et(r.parentElement, this.getComputedSelector(r.$_pfocustrap_focusableselector)) : r.$_pfocustrap_lasthiddenfocusableelement;
      X(o);
    },
    onLastHiddenElementFocus: function(e) {
      var n, r = e.currentTarget, s = e.relatedTarget, o = s === r.$_pfocustrap_firsthiddenfocusableelement || !((n = this.$el) !== null && n !== void 0 && n.contains(s)) ? Ce(r.parentElement, this.getComputedSelector(r.$_pfocustrap_focusableselector)) : r.$_pfocustrap_firsthiddenfocusableelement;
      X(o);
    },
    createHiddenFocusableElements: function(e, n) {
      var r = this, s = n.value || {}, o = s.tabIndex, x = o === void 0 ? 0 : o, k = s.firstFocusableSelector, h = k === void 0 ? "" : k, y = s.lastFocusableSelector, v = y === void 0 ? "" : y, f = function(g) {
        return _e("span", {
          class: "p-hidden-accessible p-hidden-focusable",
          tabIndex: x,
          role: "presentation",
          "aria-hidden": !0,
          "data-p-hidden-accessible": !0,
          "data-p-hidden-focusable": !0,
          onFocus: g?.bind(r)
        });
      }, z = f(this.onFirstHiddenElementFocus), a = f(this.onLastHiddenElementFocus);
      z.$_pfocustrap_lasthiddenfocusableelement = a, z.$_pfocustrap_focusableselector = h, z.setAttribute("data-pc-section", "firstfocusableelement"), a.$_pfocustrap_firsthiddenfocusableelement = z, a.$_pfocustrap_focusableselector = v, a.setAttribute("data-pc-section", "lastfocusableelement"), e.prepend(z), e.append(a);
    }
  }
});
function jt() {
  $e({
    variableName: Gt("scrollbar.width").name
  });
}
function Ft() {
  Se({
    variableName: Gt("scrollbar.width").name
  });
}
var In = `
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
`, Pn = {
  mask: function(e) {
    var n = e.position, r = e.modal;
    return {
      position: "fixed",
      height: "100%",
      width: "100%",
      left: 0,
      top: 0,
      display: "flex",
      justifyContent: n === "left" || n === "topleft" || n === "bottomleft" ? "flex-start" : n === "right" || n === "topright" || n === "bottomright" ? "flex-end" : "center",
      alignItems: n === "top" || n === "topleft" || n === "topright" ? "flex-start" : n === "bottom" || n === "bottomleft" || n === "bottomright" ? "flex-end" : "center",
      pointerEvents: r ? "auto" : "none"
    };
  },
  root: {
    display: "flex",
    flexDirection: "column",
    pointerEvents: "auto"
  }
}, An = {
  mask: function(e) {
    var n = e.props, r = ["left", "right", "top", "topleft", "topright", "bottom", "bottomleft", "bottomright"], s = r.find(function(o) {
      return o === n.position;
    });
    return ["p-dialog-mask", {
      "p-overlay-mask p-overlay-mask-enter-active": n.modal
    }, s ? "p-dialog-".concat(s) : ""];
  },
  root: function(e) {
    var n = e.props, r = e.instance;
    return ["p-dialog p-component", {
      "p-dialog-maximized": n.maximizable && r.maximized
    }];
  },
  header: "p-dialog-header",
  title: "p-dialog-title",
  headerActions: "p-dialog-header-actions",
  pcMaximizeButton: "p-dialog-maximize-button",
  pcCloseButton: "p-dialog-close-button",
  content: "p-dialog-content",
  footer: "p-dialog-footer"
}, Ln = J.extend({
  name: "dialog",
  style: In,
  classes: An,
  inlineStyles: Pn
}), En = {
  name: "BaseDialog",
  extends: $t,
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
  style: Ln,
  provide: function() {
    return {
      $pcDialog: this,
      $parentInstance: this
    };
  }
}, qt = {
  name: "Dialog",
  extends: En,
  inheritAttrs: !1,
  emits: ["update:visible", "show", "hide", "after-hide", "maximize", "unmaximize", "dragstart", "dragend"],
  provide: function() {
    var e = this;
    return {
      dialogRef: P(function() {
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
      this.modal && !this.isUnstyled && Be(this.mask, "p-overlay-mask-leave-active"), this.dragging && this.documentDragEndListener && this.documentDragEndListener();
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
      this.maximized ? (this.maximized = !1, this.$emit("unmaximize", e)) : (this.maximized = !0, this.$emit("maximize", e)), this.modal || (this.maximized ? jt() : Ft());
    },
    enableDocumentSettings: function() {
      (this.modal || !this.modal && this.blockScroll || this.maximizable && this.maximized) && jt();
    },
    unbindDocumentState: function() {
      (this.modal || !this.modal && this.blockScroll || this.maximizable && this.maximized) && Ft();
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
        this.styleElement = document.createElement("style"), this.styleElement.type = "text/css", Ee(this.styleElement, "nonce", (e = this.$primevue) === null || e === void 0 || (e = e.config) === null || e === void 0 || (e = e.csp) === null || e === void 0 ? void 0 : e.nonce), document.head.appendChild(this.styleElement);
        var n = "";
        for (var r in this.breakpoints)
          n += `
                        @media screen and (max-width: `.concat(r, `) {
                            .p-dialog[`).concat(this.$attrSelector, `] {
                                width: `).concat(this.breakpoints[r], ` !important;
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
      e.target.closest("div").getAttribute("data-pc-section") !== "headeractions" && this.draggable && (this.dragging = !0, this.lastPageX = e.pageX, this.lastPageY = e.pageY, this.container.style.margin = "0", document.body.setAttribute("data-p-unselectable-text", "true"), !this.isUnstyled && Le(document.body, {
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
          var r = Ie(e.container), s = Pe(e.container), o = n.pageX - e.lastPageX, x = n.pageY - e.lastPageY, k = e.container.getBoundingClientRect(), h = k.left + o, y = k.top + x, v = Ae(), f = getComputedStyle(e.container), z = parseFloat(f.marginLeft), a = parseFloat(f.marginTop);
          e.container.style.position = "fixed", e.keepInViewport ? (h >= e.minX && h + r < v.width && (e.lastPageX = n.pageX, e.container.style.left = h - z + "px"), y >= e.minY && y + s < v.height && (e.lastPageY = n.pageY, e.container.style.top = y - a + "px")) : (e.lastPageX = n.pageX, e.container.style.left = h - z + "px", e.lastPageY = n.pageY, e.container.style.top = y - a + "px");
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
      return G({
        maximized: this.maximized,
        modal: this.modal
      });
    }
  },
  directives: {
    ripple: Wt,
    focustrap: zn
  },
  components: {
    Button: ct,
    Portal: ze,
    WindowMinimizeIcon: Yt,
    WindowMaximizeIcon: Xt,
    TimesIcon: Fe
  }
};
function it(t) {
  "@babel/helpers - typeof";
  return it = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, it(t);
}
function Mt(t, e) {
  var n = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(t);
    e && (r = r.filter(function(s) {
      return Object.getOwnPropertyDescriptor(t, s).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function Vt(t) {
  for (var e = 1; e < arguments.length; e++) {
    var n = arguments[e] != null ? arguments[e] : {};
    e % 2 ? Mt(Object(n), !0).forEach(function(r) {
      Bn(t, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(n)) : Mt(Object(n)).forEach(function(r) {
      Object.defineProperty(t, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return t;
}
function Bn(t, e, n) {
  return (e = Dn(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function Dn(t) {
  var e = On(t, "string");
  return it(e) == "symbol" ? e : e + "";
}
function On(t, e) {
  if (it(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(t, e);
    if (it(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var Tn = ["data-p"], jn = ["aria-labelledby", "aria-modal", "data-p"], Fn = ["id"], Mn = ["data-p"];
function Vn(t, e, n, r, s, o) {
  var x = q("Button"), k = q("Portal"), h = Nt("focustrap");
  return d(), O(k, {
    appendTo: t.appendTo
  }, {
    default: M(function() {
      return [s.containerVisible ? (d(), p("div", w({
        key: 0,
        ref: o.maskRef,
        class: t.cx("mask"),
        style: t.sx("mask", !0, {
          position: t.position,
          modal: t.modal
        }),
        onMousedown: e[1] || (e[1] = function() {
          return o.onMaskMouseDown && o.onMaskMouseDown.apply(o, arguments);
        }),
        onMouseup: e[2] || (e[2] = function() {
          return o.onMaskMouseUp && o.onMaskMouseUp.apply(o, arguments);
        }),
        "data-p": o.dataP
      }, t.ptm("mask")), [$(ye, w({
        name: "p-dialog",
        onEnter: o.onEnter,
        onAfterEnter: o.onAfterEnter,
        onBeforeLeave: o.onBeforeLeave,
        onLeave: o.onLeave,
        onAfterLeave: o.onAfterLeave,
        appear: ""
      }, t.ptm("transition")), {
        default: M(function() {
          return [t.visible ? F((d(), p("div", w({
            key: 0,
            ref: o.containerRef,
            class: t.cx("root"),
            style: t.sx("root"),
            role: "dialog",
            "aria-labelledby": o.ariaLabelledById,
            "aria-modal": t.modal,
            "data-p": o.dataP
          }, t.ptmi("root")), [t.$slots.container ? L(t.$slots, "container", {
            key: 0,
            closeCallback: o.close,
            maximizeCallback: function(v) {
              return o.maximize(v);
            },
            initDragCallback: o.initDrag
          }) : (d(), p(H, {
            key: 1
          }, [t.showHeader ? (d(), p("div", w({
            key: 0,
            ref: o.headerContainerRef,
            class: t.cx("header"),
            onMousedown: e[0] || (e[0] = function() {
              return o.initDrag && o.initDrag.apply(o, arguments);
            })
          }, t.ptm("header")), [L(t.$slots, "header", {
            class: V(t.cx("title"))
          }, function() {
            return [t.header ? (d(), p("span", w({
              key: 0,
              id: o.ariaLabelledById,
              class: t.cx("title")
            }, t.ptm("title")), A(t.header), 17, Fn)) : S("", !0)];
          }), i("div", w({
            class: t.cx("headerActions")
          }, t.ptm("headerActions")), [t.maximizable ? L(t.$slots, "maximizebutton", {
            key: 0,
            maximized: s.maximized,
            maximizeCallback: function(v) {
              return o.maximize(v);
            }
          }, function() {
            return [$(x, w({
              ref: o.maximizableRef,
              autofocus: s.focusableMax,
              class: t.cx("pcMaximizeButton"),
              onClick: o.maximize,
              tabindex: t.maximizable ? "0" : "-1",
              unstyled: t.unstyled
            }, t.maximizeButtonProps, {
              pt: t.ptm("pcMaximizeButton"),
              "data-pc-group-section": "headericon"
            }), {
              icon: M(function(y) {
                return [L(t.$slots, "maximizeicon", {
                  maximized: s.maximized
                }, function() {
                  return [(d(), O(mt(o.maximizeIconComponent), w({
                    class: [y.class, s.maximized ? t.minimizeIcon : t.maximizeIcon]
                  }, t.ptm("pcMaximizeButton").icon), null, 16, ["class"]))];
                })];
              }),
              _: 3
            }, 16, ["autofocus", "class", "onClick", "tabindex", "unstyled", "pt"])];
          }) : S("", !0), t.closable ? L(t.$slots, "closebutton", {
            key: 1,
            closeCallback: o.close
          }, function() {
            return [$(x, w({
              ref: o.closeButtonRef,
              autofocus: s.focusableClose,
              class: t.cx("pcCloseButton"),
              onClick: o.close,
              "aria-label": o.closeAriaLabel,
              unstyled: t.unstyled
            }, t.closeButtonProps, {
              pt: t.ptm("pcCloseButton"),
              "data-pc-group-section": "headericon"
            }), {
              icon: M(function(y) {
                return [L(t.$slots, "closeicon", {}, function() {
                  return [(d(), O(mt(t.closeIcon ? "span" : "TimesIcon"), w({
                    class: [t.closeIcon, y.class]
                  }, t.ptm("pcCloseButton").icon), null, 16, ["class"]))];
                })];
              }),
              _: 3
            }, 16, ["autofocus", "class", "onClick", "aria-label", "unstyled", "pt"])];
          }) : S("", !0)], 16)], 16)) : S("", !0), i("div", w({
            ref: o.contentRef,
            class: [t.cx("content"), t.contentClass],
            style: t.contentStyle,
            "data-p": o.dataP
          }, Vt(Vt({}, t.contentProps), t.ptm("content"))), [L(t.$slots, "default")], 16, Mn), t.footer || t.$slots.footer ? (d(), p("div", w({
            key: 1,
            ref: o.footerContainerRef,
            class: t.cx("footer")
          }, t.ptm("footer")), [L(t.$slots, "footer", {}, function() {
            return [B(A(t.footer), 1)];
          })], 16)) : S("", !0)], 64))], 16, jn)), [[h, {
            disabled: !t.modal
          }]]) : S("", !0)];
        }),
        _: 3
      }, 16, ["onEnter", "onAfterEnter", "onBeforeLeave", "onLeave", "onAfterLeave"])], 16, Tn)) : S("", !0)];
    }),
    _: 3
  }, 8, ["appendTo"]);
}
qt.render = Vn;
var Rn = `
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
`, Nn = {
  root: {
    position: "relative"
  }
}, Hn = {
  root: function(e) {
    var n = e.instance, r = e.props;
    return ["p-toggleswitch p-component", {
      "p-toggleswitch-checked": n.checked,
      "p-disabled": r.disabled,
      "p-invalid": n.$invalid
    }];
  },
  input: "p-toggleswitch-input",
  slider: "p-toggleswitch-slider",
  handle: "p-toggleswitch-handle"
}, Un = J.extend({
  name: "toggleswitch",
  style: Rn,
  classes: Hn,
  inlineStyles: Nn
}), Kn = {
  name: "BaseToggleSwitch",
  extends: Me,
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
  style: Un,
  provide: function() {
    return {
      $pcToggleSwitch: this,
      $parentInstance: this
    };
  }
}, wt = {
  name: "ToggleSwitch",
  extends: Kn,
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
      var n, r;
      this.$emit("blur", e), (n = (r = this.formField).onBlur) === null || n === void 0 || n.call(r, e);
    }
  },
  computed: {
    checked: function() {
      return this.d_value === this.trueValue;
    },
    dataP: function() {
      return G({
        checked: this.checked,
        disabled: this.disabled,
        invalid: this.$invalid
      });
    }
  }
}, Gn = ["data-p-checked", "data-p-disabled", "data-p"], Wn = ["id", "checked", "tabindex", "disabled", "readonly", "aria-checked", "aria-labelledby", "aria-label", "aria-invalid"], Zn = ["data-p"], Xn = ["data-p"];
function Yn(t, e, n, r, s, o) {
  return d(), p("div", w({
    class: t.cx("root"),
    style: t.sx("root")
  }, o.getPTOptions("root"), {
    "data-p-checked": o.checked,
    "data-p-disabled": t.disabled,
    "data-p": o.dataP
  }), [i("input", w({
    id: t.inputId,
    type: "checkbox",
    role: "switch",
    class: [t.cx("input"), t.inputClass],
    style: t.inputStyle,
    checked: o.checked,
    tabindex: t.tabindex,
    disabled: t.disabled,
    readonly: t.readonly,
    "aria-checked": o.checked,
    "aria-labelledby": t.ariaLabelledby,
    "aria-label": t.ariaLabel,
    "aria-invalid": t.invalid || void 0,
    onFocus: e[0] || (e[0] = function() {
      return o.onFocus && o.onFocus.apply(o, arguments);
    }),
    onBlur: e[1] || (e[1] = function() {
      return o.onBlur && o.onBlur.apply(o, arguments);
    }),
    onChange: e[2] || (e[2] = function() {
      return o.onChange && o.onChange.apply(o, arguments);
    })
  }, o.getPTOptions("input")), null, 16, Wn), i("div", w({
    class: t.cx("slider")
  }, o.getPTOptions("slider"), {
    "data-p": o.dataP
  }), [i("div", w({
    class: t.cx("handle")
  }, o.getPTOptions("handle"), {
    "data-p": o.dataP
  }), [L(t.$slots, "handle", {
    checked: o.checked
  })], 16, Xn)], 16, Zn)], 16, Gn);
}
wt.render = Yn;
const qn = {
  class: "kx-nav",
  role: "tablist",
  "aria-label": "Agent sections"
}, Jn = ["aria-selected", "onClick"], Qn = { class: "kx-nav-ico" }, to = { class: "kx-nav-lbl" }, eo = {
  key: 0,
  class: "kx-nav-meta"
}, no = /* @__PURE__ */ Y({
  __name: "AgentNav",
  props: {
    items: {},
    active: {}
  },
  emits: ["select"],
  setup(t, { emit: e }) {
    const n = e;
    return (r, s) => (d(), p("nav", qn, [
      (d(!0), p(H, null, St(t.items, (o) => (d(), p("button", {
        key: o.key,
        type: "button",
        role: "tab",
        class: V(["kx-nav-item", t.active === o.key && "kx-nav-item-on"]),
        "aria-selected": t.active === o.key,
        onClick: (x) => n("select", o.key)
      }, [
        i("span", Qn, [
          $(c(j), {
            icon: o.icon,
            "aria-hidden": "true"
          }, null, 8, ["icon"])
        ]),
        i("span", to, A(o.label), 1),
        o.meta ? (d(), p("span", eo, A(o.meta), 1)) : S("", !0)
      ], 10, Jn))), 128))
    ]));
  }
});
var Jt = {
  name: "MinusIcon",
  extends: zt
};
function oo(t) {
  return lo(t) || io(t) || ao(t) || ro();
}
function ro() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function ao(t, e) {
  if (t) {
    if (typeof t == "string") return Ct(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Ct(t, e) : void 0;
  }
}
function io(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function lo(t) {
  if (Array.isArray(t)) return Ct(t);
}
function Ct(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, r = Array(e); n < e; n++) r[n] = t[n];
  return r;
}
function so(t, e, n, r, s, o) {
  return d(), p("svg", w({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, t.pti()), oo(e[0] || (e[0] = [i("path", {
    d: "M13.2222 7.77778H0.777778C0.571498 7.77778 0.373667 7.69584 0.227806 7.54998C0.0819442 7.40412 0 7.20629 0 7.00001C0 6.79373 0.0819442 6.5959 0.227806 6.45003C0.373667 6.30417 0.571498 6.22223 0.777778 6.22223H13.2222C13.4285 6.22223 13.6263 6.30417 13.7722 6.45003C13.9181 6.5959 14 6.79373 14 7.00001C14 7.20629 13.9181 7.40412 13.7722 7.54998C13.6263 7.69584 13.4285 7.77778 13.2222 7.77778Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
Jt.render = so;
var co = `
    .p-checkbox {
        position: relative;
        display: inline-flex;
        user-select: none;
        vertical-align: bottom;
        width: dt('checkbox.width');
        height: dt('checkbox.height');
    }

    .p-checkbox-input {
        cursor: pointer;
        appearance: none;
        position: absolute;
        inset-block-start: 0;
        inset-inline-start: 0;
        width: 100%;
        height: 100%;
        padding: 0;
        margin: 0;
        opacity: 0;
        z-index: 1;
        outline: 0 none;
        border: 1px solid transparent;
        border-radius: dt('checkbox.border.radius');
    }

    .p-checkbox-box {
        display: flex;
        justify-content: center;
        align-items: center;
        border-radius: dt('checkbox.border.radius');
        border: 1px solid dt('checkbox.border.color');
        background: dt('checkbox.background');
        width: dt('checkbox.width');
        height: dt('checkbox.height');
        transition:
            background dt('checkbox.transition.duration'),
            color dt('checkbox.transition.duration'),
            border-color dt('checkbox.transition.duration'),
            box-shadow dt('checkbox.transition.duration'),
            outline-color dt('checkbox.transition.duration');
        outline-color: transparent;
        box-shadow: dt('checkbox.shadow');
    }

    .p-checkbox-icon {
        transition-duration: dt('checkbox.transition.duration');
        color: dt('checkbox.icon.color');
        font-size: dt('checkbox.icon.size');
        width: dt('checkbox.icon.size');
        height: dt('checkbox.icon.size');
    }

    .p-checkbox:not(.p-disabled):has(.p-checkbox-input:hover) .p-checkbox-box {
        border-color: dt('checkbox.hover.border.color');
    }

    .p-checkbox-checked .p-checkbox-box {
        border-color: dt('checkbox.checked.border.color');
        background: dt('checkbox.checked.background');
    }

    .p-checkbox-checked .p-checkbox-icon {
        color: dt('checkbox.icon.checked.color');
    }

    .p-checkbox-checked:not(.p-disabled):has(.p-checkbox-input:hover) .p-checkbox-box {
        background: dt('checkbox.checked.hover.background');
        border-color: dt('checkbox.checked.hover.border.color');
    }

    .p-checkbox-checked:not(.p-disabled):has(.p-checkbox-input:hover) .p-checkbox-icon {
        color: dt('checkbox.icon.checked.hover.color');
    }

    .p-checkbox:not(.p-disabled):has(.p-checkbox-input:focus-visible) .p-checkbox-box {
        border-color: dt('checkbox.focus.border.color');
        box-shadow: dt('checkbox.focus.ring.shadow');
        outline: dt('checkbox.focus.ring.width') dt('checkbox.focus.ring.style') dt('checkbox.focus.ring.color');
        outline-offset: dt('checkbox.focus.ring.offset');
    }

    .p-checkbox-checked:not(.p-disabled):has(.p-checkbox-input:focus-visible) .p-checkbox-box {
        border-color: dt('checkbox.checked.focus.border.color');
    }

    .p-checkbox.p-invalid > .p-checkbox-box {
        border-color: dt('checkbox.invalid.border.color');
    }

    .p-checkbox.p-variant-filled .p-checkbox-box {
        background: dt('checkbox.filled.background');
    }

    .p-checkbox-checked.p-variant-filled .p-checkbox-box {
        background: dt('checkbox.checked.background');
    }

    .p-checkbox-checked.p-variant-filled:not(.p-disabled):has(.p-checkbox-input:hover) .p-checkbox-box {
        background: dt('checkbox.checked.hover.background');
    }

    .p-checkbox.p-disabled {
        opacity: 1;
    }

    .p-checkbox.p-disabled .p-checkbox-box {
        background: dt('checkbox.disabled.background');
        border-color: dt('checkbox.checked.disabled.border.color');
    }

    .p-checkbox.p-disabled .p-checkbox-box .p-checkbox-icon {
        color: dt('checkbox.icon.disabled.color');
    }

    .p-checkbox-sm,
    .p-checkbox-sm .p-checkbox-box {
        width: dt('checkbox.sm.width');
        height: dt('checkbox.sm.height');
    }

    .p-checkbox-sm .p-checkbox-icon {
        font-size: dt('checkbox.icon.sm.size');
        width: dt('checkbox.icon.sm.size');
        height: dt('checkbox.icon.sm.size');
    }

    .p-checkbox-lg,
    .p-checkbox-lg .p-checkbox-box {
        width: dt('checkbox.lg.width');
        height: dt('checkbox.lg.height');
    }

    .p-checkbox-lg .p-checkbox-icon {
        font-size: dt('checkbox.icon.lg.size');
        width: dt('checkbox.icon.lg.size');
        height: dt('checkbox.icon.lg.size');
    }
`, uo = {
  root: function(e) {
    var n = e.instance, r = e.props;
    return ["p-checkbox p-component", {
      "p-checkbox-checked": n.checked,
      "p-disabled": r.disabled,
      "p-invalid": n.$pcCheckboxGroup ? n.$pcCheckboxGroup.$invalid : n.$invalid,
      "p-variant-filled": n.$variant === "filled",
      "p-checkbox-sm p-inputfield-sm": r.size === "small",
      "p-checkbox-lg p-inputfield-lg": r.size === "large"
    }];
  },
  box: "p-checkbox-box",
  input: "p-checkbox-input",
  icon: "p-checkbox-icon"
}, bo = J.extend({
  name: "checkbox",
  style: co,
  classes: uo
}), po = {
  name: "BaseCheckbox",
  extends: Re,
  props: {
    value: null,
    binary: Boolean,
    indeterminate: {
      type: Boolean,
      default: !1
    },
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
    required: {
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
  style: bo,
  provide: function() {
    return {
      $pcCheckbox: this,
      $parentInstance: this
    };
  }
};
function lt(t) {
  "@babel/helpers - typeof";
  return lt = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, lt(t);
}
function go(t, e, n) {
  return (e = ho(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function ho(t) {
  var e = fo(t, "string");
  return lt(e) == "symbol" ? e : e + "";
}
function fo(t, e) {
  if (lt(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(t, e);
    if (lt(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
function mo(t) {
  return xo(t) || ko(t) || yo(t) || vo();
}
function vo() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function yo(t, e) {
  if (t) {
    if (typeof t == "string") return _t(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? _t(t, e) : void 0;
  }
}
function ko(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function xo(t) {
  if (Array.isArray(t)) return _t(t);
}
function _t(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, r = Array(e); n < e; n++) r[n] = t[n];
  return r;
}
var Qt = {
  name: "Checkbox",
  extends: po,
  inheritAttrs: !1,
  emits: ["change", "focus", "blur", "update:indeterminate"],
  inject: {
    $pcCheckboxGroup: {
      default: void 0
    }
  },
  data: function() {
    return {
      d_indeterminate: this.indeterminate
    };
  },
  watch: {
    indeterminate: function(e) {
      this.d_indeterminate = e, this.updateIndeterminate();
    }
  },
  mounted: function() {
    this.updateIndeterminate();
  },
  updated: function() {
    this.updateIndeterminate();
  },
  methods: {
    getPTOptions: function(e) {
      var n = e === "root" ? this.ptmi : this.ptm;
      return n(e, {
        context: {
          checked: this.checked,
          indeterminate: this.d_indeterminate,
          disabled: this.disabled
        }
      });
    },
    onChange: function(e) {
      var n = this;
      if (!this.disabled && !this.readonly) {
        var r = this.$pcCheckboxGroup ? this.$pcCheckboxGroup.d_value : this.d_value, s;
        this.binary ? s = this.d_indeterminate ? this.trueValue : this.checked ? this.falseValue : this.trueValue : this.checked || this.d_indeterminate ? s = r.filter(function(o) {
          return !Oe(o, n.value);
        }) : s = r ? [].concat(mo(r), [this.value]) : [this.value], this.d_indeterminate && (this.d_indeterminate = !1, this.$emit("update:indeterminate", this.d_indeterminate)), this.$pcCheckboxGroup ? this.$pcCheckboxGroup.writeValue(s, e) : this.writeValue(s, e), this.$emit("change", e);
      }
    },
    onFocus: function(e) {
      this.$emit("focus", e);
    },
    onBlur: function(e) {
      var n, r;
      this.$emit("blur", e), (n = (r = this.formField).onBlur) === null || n === void 0 || n.call(r, e);
    },
    updateIndeterminate: function() {
      this.$refs.input && (this.$refs.input.indeterminate = this.d_indeterminate);
    }
  },
  computed: {
    groupName: function() {
      return this.$pcCheckboxGroup ? this.$pcCheckboxGroup.groupName : this.$formName;
    },
    checked: function() {
      var e = this.$pcCheckboxGroup ? this.$pcCheckboxGroup.d_value : this.d_value;
      return this.d_indeterminate ? !1 : this.binary ? e === this.trueValue : De(this.value, e);
    },
    dataP: function() {
      return G(go({
        invalid: this.$invalid,
        checked: this.checked,
        disabled: this.disabled,
        filled: this.$variant === "filled"
      }, this.size, this.size));
    }
  },
  components: {
    CheckIcon: Ve,
    MinusIcon: Jt
  }
}, wo = ["data-p-checked", "data-p-indeterminate", "data-p-disabled", "data-p"], Co = ["id", "value", "name", "checked", "tabindex", "disabled", "readonly", "required", "aria-labelledby", "aria-label", "aria-invalid"], _o = ["data-p"];
function So(t, e, n, r, s, o) {
  var x = q("CheckIcon"), k = q("MinusIcon");
  return d(), p("div", w({
    class: t.cx("root")
  }, o.getPTOptions("root"), {
    "data-p-checked": o.checked,
    "data-p-indeterminate": s.d_indeterminate || void 0,
    "data-p-disabled": t.disabled,
    "data-p": o.dataP
  }), [i("input", w({
    ref: "input",
    id: t.inputId,
    type: "checkbox",
    class: [t.cx("input"), t.inputClass],
    style: t.inputStyle,
    value: t.value,
    name: o.groupName,
    checked: o.checked,
    tabindex: t.tabindex,
    disabled: t.disabled,
    readonly: t.readonly,
    required: t.required,
    "aria-labelledby": t.ariaLabelledby,
    "aria-label": t.ariaLabel,
    "aria-invalid": t.invalid || void 0,
    onFocus: e[0] || (e[0] = function() {
      return o.onFocus && o.onFocus.apply(o, arguments);
    }),
    onBlur: e[1] || (e[1] = function() {
      return o.onBlur && o.onBlur.apply(o, arguments);
    }),
    onChange: e[2] || (e[2] = function() {
      return o.onChange && o.onChange.apply(o, arguments);
    })
  }, o.getPTOptions("input")), null, 16, Co), i("div", w({
    class: t.cx("box")
  }, o.getPTOptions("box"), {
    "data-p": o.dataP
  }), [L(t.$slots, "icon", {
    checked: o.checked,
    indeterminate: s.d_indeterminate,
    class: V(t.cx("icon")),
    dataP: o.dataP
  }, function() {
    return [o.checked ? (d(), O(x, w({
      key: 0,
      class: t.cx("icon")
    }, o.getPTOptions("icon"), {
      "data-p": o.dataP
    }), null, 16, ["class", "data-p"])) : s.d_indeterminate ? (d(), O(k, w({
      key: 1,
      class: t.cx("icon")
    }, o.getPTOptions("icon"), {
      "data-p": o.dataP
    }), null, 16, ["class", "data-p"])) : S("", !0)];
  })], 16, _o)], 16, wo);
}
Qt.render = So;
const $o = {
  class: "tool-reference",
  "aria-label": "Tool reference"
}, zo = { class: "kx-field" }, Io = { class: "tool-reference__list" }, Po = ["data-tool-id"], Ao = { class: "tool-reference__title" }, Lo = { key: 0 }, Eo = { class: "tool-reference__description" }, Bo = { key: 0 }, Do = {
  key: 0,
  class: "kx-sec-foot"
}, Oo = /* @__PURE__ */ Y({
  __name: "ToolReference",
  props: {
    tools: {},
    selected: {}
  },
  emits: ["change"],
  setup(t, { emit: e }) {
    const n = t, r = e, s = T(""), o = P(() => s.value.trim().toLowerCase());
    function x(y) {
      return [y.id, y.title, y.llm_alias, y.llm_description].some((v) => v?.toLowerCase().includes(o.value));
    }
    const k = P(() => n.tools.filter(x));
    function h(y, v) {
      r("change", v ? [...n.selected, y] : n.selected.filter((f) => f !== y));
    }
    return (y, v) => (d(), p("section", $o, [
      i("label", zo, [
        v[1] || (v[1] = i("span", { class: "kx-field-lbl" }, "Search tools", -1)),
        F(i("input", {
          "onUpdate:modelValue": v[0] || (v[0] = (f) => s.value = f),
          class: "kx-input",
          type: "search",
          "aria-label": "Search tool reference",
          placeholder: "Search names, descriptions or aliases…"
        }, null, 512), [
          [K, s.value]
        ])
      ]),
      v[3] || (v[3] = i("p", { class: "kx-sec-foot" }, "Descriptions below come from the installed tools.", -1)),
      i("ul", Io, [
        (d(!0), p(H, null, St(k.value, (f) => (d(), p("li", {
          key: f.id,
          "data-tool-id": f.id,
          class: "tool-reference__item"
        }, [
          i("div", Ao, [
            $(c(Qt), {
              "model-value": t.selected.includes(f.id),
              binary: "",
              "aria-label": `Select ${f.title || f.id}`,
              "onUpdate:modelValue": (z) => h(f.id, z === !0)
            }, null, 8, ["model-value", "aria-label", "onUpdate:modelValue"]),
            i("strong", null, A(f.title || f.id), 1),
            f.llm_alias ? (d(), p("code", Lo, A(f.llm_alias), 1)) : S("", !0)
          ]),
          i("p", Eo, A(f.llm_description || "No description declared."), 1),
          f.input_schema ? (d(), p("details", Bo, [
            v[2] || (v[2] = i("summary", null, "Declared inputs", -1)),
            i("pre", null, A(JSON.stringify(f.input_schema, null, 2)), 1)
          ])) : S("", !0)
        ], 8, Po))), 128))
      ]),
      k.value.length ? S("", !0) : (d(), p("p", Do, "No matching tools."))
    ]));
  }
}), To = /* @__PURE__ */ Y({
  __name: "IconField",
  props: {
    modelValue: {},
    fallback: {}
  },
  emits: ["update:modelValue"],
  setup(t, { emit: e }) {
    const n = t, r = e, s = T(null);
    let o = null;
    function x(h) {
      r("update:modelValue", h.detail || "");
    }
    async function k() {
      if (s.value) {
        o && o.removeEventListener("select", x), s.value.innerHTML = "";
        try {
          customElements.get("wc-icon-picker") || await yt("wc-icon-picker", { timeoutMs: 8e3 });
        } catch {
        }
        s.value && (o = document.createElement("wc-icon-picker"), o.setAttribute("value", n.modelValue || ""), n.fallback && o.setAttribute("fallback", n.fallback), o.addEventListener("select", x), s.value.appendChild(o));
      }
    }
    return Ht(k), vt(() => n.modelValue, (h) => {
      o && o.getAttribute("value") !== h && o.setAttribute("value", h || "");
    }), ke(() => {
      o && o.removeEventListener("select", x);
    }), (h, y) => (d(), p("div", {
      ref_key: "host",
      ref: s,
      class: "wc-iconfield"
    }, null, 512));
  }
});
function jo({ form: t, traits: e, redirectTrait: n }) {
  const r = T(!0), s = P(() => e().filter((a) => a.id !== n)), o = (a) => t.value.traits.includes(a.id), x = P(() => s.value.filter(o));
  function k(a) {
    return !!a && typeof a == "object" && !Array.isArray(a);
  }
  function h(a) {
    const u = k(t.value.trait_contexts[a]) ? t.value.trait_contexts[a] : {}, g = k(t.value.trait_agent_options[a]) ? t.value.trait_agent_options[a] : null;
    return g ? { ...u, agent_options: g } : u;
  }
  function y(a, u) {
    if (k(u) && (Object.prototype.hasOwnProperty.call(u, "context") || Object.prototype.hasOwnProperty.call(u, "agent_options"))) {
      t.value.trait_contexts = { ...t.value.trait_contexts, [a]: k(u.context) ? u.context : {} };
      const C = { ...t.value.trait_agent_options };
      k(u.agent_options) && Object.keys(u.agent_options).length ? C[a] = u.agent_options : delete C[a], t.value.trait_agent_options = C;
      return;
    }
    t.value.trait_contexts = { ...t.value.trait_contexts, [a]: u };
    const g = { ...t.value.trait_agent_options };
    delete g[a], t.value.trait_agent_options = g;
  }
  const v = P(() => t.value.traits.filter((a) => a !== n));
  function f(a) {
    t.value.traits = [...t.value.traits.filter((u) => u === n), ...a];
  }
  function z(a) {
    t.value.tools = [...a];
  }
  return {
    showAdvancedTools: r,
    selectableTraits: s,
    selectedCapabilities: v,
    activeTraits: x,
    traitMountConfig: h,
    onTraitConfig: y,
    onCapabilitiesChange: f,
    onToolsChange: z
  };
}
const ft = "kickside.agents.traits:redirect", Fo = "kickside.agents.traits:artifacts", Mo = "kickside.uploads.traits:file_manager", dt = "user_agent:";
function Vo({ form: t, agentId: e, agents: n, redirectTrait: r }) {
  const s = T("delegates");
  function o(u) {
    const g = u.detail;
    return g && Array.isArray(g.selected) ? g.selected.map(String) : [];
  }
  function x(u) {
    const g = new Set([e(), `${dt}${e()}`].filter(Boolean));
    t.value.delegates = u.filter((C) => !g.has(C));
  }
  const k = (u) => u.startsWith(dt) ? u.slice(dt.length) : u, h = P(() => {
    const u = t.value.trait_contexts[r];
    return u && Array.isArray(u.targets) ? u.targets : [];
  }), y = P(() => h.value.map((u) => u.agent_id));
  function v(u) {
    t.value.trait_contexts = { ...t.value.trait_contexts, [r]: { targets: u } };
    const g = t.value.traits.indexOf(r);
    u.length && g < 0 ? t.value.traits.push(r) : !u.length && g >= 0 && t.value.traits.splice(g, 1);
  }
  function f(u) {
    const g = new Set([e(), `${dt}${e()}`].filter(Boolean)), C = u.filter((I) => !g.has(I)), m = new Map(h.value.map((I) => [I.agent_id, I.comment]));
    v(C.map((I) => ({ agent_id: I, comment: m.get(I) || "" })));
  }
  function z(u) {
    const g = k(u);
    return n().find((C) => C.id === g)?.title || g;
  }
  function a(u, g) {
    v(h.value.map((C) => C.agent_id === u ? { ...C, comment: g } : C));
  }
  return { routeView: s, pickIds: o, onDelegatesChange: x, redirectTargets: h, redirectSelectedIds: y, setRedirects: v, onRedirectsChange: f, redirectLabel: z, setRedirectCommentById: a };
}
function Rt(t, e) {
  if (t && typeof t == "object") {
    const n = t, r = n.response?.data?.error;
    if (typeof r == "string") return r;
    if (r && typeof r == "object" && typeof r.message == "string")
      return r.message;
    if (typeof n.message == "string" && n.message) return n.message;
  }
  return e;
}
function Ro({ form: t, valid: e, tab: n, blank: r, agentId: s, parentId: o, models: x, redirectTrait: k, emitSaved: h }) {
  const y = T(!1), v = T(!1), f = T("");
  async function z(g) {
    y.value = !0, t.value = r(!1);
    try {
      const { data: C } = await ht.get(`/api/v1/user-agents/${g}`);
      if (C?.success && C.agent) {
        const m = C.agent;
        t.value = {
          title: m.title || "",
          description: m.description || "",
          icon: m.icon || "tabler:robot",
          public: m.public === !0,
          prompt: m.prompt || "",
          model: m.model || x()[0]?.name || "",
          temperature: typeof m.temperature == "number" ? m.temperature : null,
          max_tokens: typeof m.max_tokens == "number" ? m.max_tokens : 8e3,
          thinking_effort: typeof m.thinking_effort == "number" ? m.thinking_effort : null,
          traits: Array.isArray(m.traits) ? [...m.traits] : [],
          trait_contexts: m.trait_contexts && typeof m.trait_contexts == "object" ? { ...m.trait_contexts } : {},
          trait_agent_options: m.trait_agent_options && typeof m.trait_agent_options == "object" ? { ...m.trait_agent_options } : {},
          tools: Array.isArray(m.tools) ? [...m.tools] : [],
          delegates: Array.isArray(m.delegates) ? [...m.delegates] : [],
          memory_target_id: m.memory_target_id || "",
          memory_provider_id: m.memory_provider_id || ""
        };
      }
    } catch (C) {
      f.value = Rt(C, "could not load agent");
    } finally {
      y.value = !1;
    }
  }
  function a(g) {
    const C = {};
    for (const m of t.value.traits)
      Object.prototype.hasOwnProperty.call(g, m) && (C[m] = g[m]);
    return C;
  }
  async function u() {
    if (!e.value) {
      f.value = t.value.title.trim() ? "Check the model and token limits." : "Name is required.", t.value.title.trim() && (n.value = "model");
      return;
    }
    v.value = !0, f.value = "";
    const g = {
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
      trait_contexts: a(t.value.trait_contexts),
      trait_agent_options: a(t.value.trait_agent_options),
      tools: t.value.tools,
      delegates: t.value.delegates,
      memory_target_id: t.value.memory_target_id,
      memory_provider_id: t.value.memory_provider_id
    }, C = s();
    if (C) {
      const m = /* @__PURE__ */ new Set([C, `user_agent:${C}`]);
      g.delegates = g.delegates.filter((R) => !m.has(R));
      const I = g.trait_contexts?.[k];
      if (I && Array.isArray(I.targets)) {
        const R = I.targets.filter((U) => !m.has(U.agent_id));
        g.trait_contexts = { ...g.trait_contexts, [k]: { ...I, targets: R } }, R.length || (g.traits = g.traits.filter((U) => U !== k));
      }
    }
    try {
      let m = C || "";
      if (C) {
        const { data: I } = await ht.put(`/api/v1/user-agents/${C}`, g);
        if (!I?.success) throw new Error(I?.error || "save failed");
      } else {
        const { data: I } = await ht.post("/api/v1/user-agents", { ...g, parent_id: o() || void 0 });
        if (!I?.success) throw new Error(I?.error || "create failed");
        m = I.component_id || "";
      }
      h(m);
    } catch (m) {
      f.value = Rt(m, "save failed");
    } finally {
      v.value = !1;
    }
  }
  return { loading: y, saving: v, error: f, loadAgent: z, save: u };
}
const No = { class: "kx-modal-head" }, Ho = { class: "kx-modal-head-icon" }, Uo = { class: "kx-modal-head-text" }, Ko = { class: "kx-modal-head-title" }, Go = { class: "kx-modal-head-sub" }, Wo = {
  key: 0,
  class: "kx-2p"
}, Zo = { class: "kx-loading" }, Xo = {
  key: 1,
  class: "kx-2p"
}, Yo = { class: "kx-2p-l" }, qo = { class: "kx-form" }, Jo = { class: "kx-field" }, Qo = { class: "kx-name-row" }, tr = { class: "kx-field" }, er = { class: "kx-2p-r" }, nr = { class: "kx-2p-r-head" }, or = { class: "kx-2p-r-body" }, rr = {
  key: 0,
  class: "kx-form kx-form-grow"
}, ar = { class: "kx-field kx-field-grow" }, ir = {
  key: 1,
  class: "kx-form"
}, lr = { class: "kx-field" }, sr = ["value"], dr = { class: "kx-field" }, cr = ["max"], ur = {
  key: 0,
  class: "kx-field-err"
}, br = { class: "kx-field" }, pr = { class: "kx-toggle" }, gr = {
  key: 0,
  class: "kx-think"
}, hr = { class: "kx-field-hint-inline" }, fr = { class: "kx-field" }, mr = {
  key: 0,
  class: "kx-toggle"
}, vr = {
  key: 1,
  class: "kx-sec-foot"
}, yr = {
  key: 2,
  class: "kx-think"
}, kr = { class: "kx-field-hint-inline" }, xr = {
  key: 2,
  class: "kx-form"
}, wr = { class: "kx-group" }, Cr = ["aria-expanded"], _r = { class: "kx-group-meta" }, Sr = {
  key: 3,
  class: "kx-form"
}, $r = {
  class: "kx-seg",
  role: "tablist"
}, zr = ["aria-selected"], Ir = {
  key: 0,
  class: "kx-seg-count"
}, Pr = ["aria-selected"], Ar = {
  key: 0,
  class: "kx-seg-count"
}, Lr = ["selected"], Er = ["selected"], Br = {
  key: 0,
  class: "kx-redirect-comments"
}, Dr = { class: "kx-redirect-comment-name" }, Or = ["value", "onInput"], Tr = { class: "kx-modal-foot" }, jr = {
  key: 0,
  class: "kx-err inline kx-foot-err"
}, Fr = {
  key: 1,
  class: "kx-embed"
}, Mr = {
  class: "kx-modal kx-modal-agent kx-modal-embed",
  role: "dialog",
  "aria-modal": "true"
}, Wr = /* @__PURE__ */ Y({
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
    const n = xe(), r = Y({
      setup(_, { slots: l }) {
        return n.value = l.default, () => {
        };
      }
    }), s = Y({
      render() {
        return n.value ? n.value() : null;
      }
    }), o = t, x = e, k = P(() => {
      switch (h.value) {
        case "model":
          return "Model";
        case "caps":
          return "Capabilities";
        case "routing":
          return "Routing";
        default:
          return "Prompt";
      }
    }), h = T("prompt"), y = ["fast", "nano", "balanced", "premium"], v = P(() => {
      const _ = /* @__PURE__ */ new Set();
      for (const l of o.models) for (const b of l.class || []) _.add(b);
      return [..._].sort((l, b) => {
        const Z = y.indexOf(l), Et = y.indexOf(b);
        return (Z < 0 ? 99 : Z) - (Et < 0 ? 99 : Et) || l.localeCompare(b);
      });
    });
    function f() {
      return v.value.includes("fast") ? "class:fast" : v.value.length ? "class:" + v.value[0] : o.models[0]?.name || "";
    }
    function z(_ = !0) {
      return {
        title: "",
        description: "",
        icon: "tabler:robot",
        prompt: "",
        public: !1,
        model: f(),
        temperature: null,
        max_tokens: 8e3,
        thinking_effort: null,
        traits: _ ? [Fo, Mo] : [],
        trait_contexts: {},
        trait_agent_options: {},
        tools: [],
        delegates: [],
        memory_target_id: "",
        memory_provider_id: ""
      };
    }
    const a = T(z()), u = P(() => !!o.agentId), g = P({
      get: () => o.open,
      set: (_) => {
        _ || x("close");
      }
    }), C = T(null);
    function m() {
      we(() => C.value?.focus({ preventScroll: !0 }));
    }
    const I = P({
      get: () => Math.round((a.value.temperature ?? 0.5) * 50),
      set: (_) => {
        a.value.temperature = Math.max(0, Math.min(2, (Number(_) || 0) / 50));
      }
    }), R = P({
      get: () => a.value.temperature !== null,
      set: (_) => {
        a.value.temperature = _ ? a.value.temperature ?? 0.5 : null;
      }
    }), U = P(() => a.value.model.startsWith("class:") ? o.models.filter((_) => _.class?.includes(a.value.model.slice(6))) : o.models.filter((_) => _.name === a.value.model)), ut = P(() => {
      const _ = U.value.map((l) => l.output_tokens).filter((l) => typeof l == "number" && Number.isFinite(l) && l > 0);
      return _.length ? Math.min(..._) : 128e3;
    }), It = P(() => !Q.value && (U.value.length === 0 || U.value.some((_) => !_.capabilities?.includes("reasoning")))), te = P(() => Q.value ? "Extended thinking sets its own temperature." : "The selected models reason instead of sampling, so temperature is not applied."), bt = P(() => !Number.isInteger(a.value.max_tokens) || a.value.max_tokens < 1 || a.value.max_tokens > ut.value), Pt = P(() => a.value.title.trim().length > 0 && !!a.value.model && !bt.value), ee = Ro({
      form: a,
      valid: Pt,
      tab: h,
      blank: z,
      agentId: () => o.agentId,
      parentId: () => o.parentId,
      models: () => o.models,
      redirectTrait: ft,
      emitSaved: (_) => x("saved", _)
    }), { loading: ne, saving: st, error: pt, loadAgent: oe, save: re } = ee;
    vt(() => o.models, () => {
      !u.value && !a.value.model && (a.value.model = f());
    }, { immediate: !0 }), Ht(() => {
      yt("wc-model-picker", { timeoutMs: 8e3 }).catch(() => {
      }), yt("wc-agent-picker", { timeoutMs: 8e3 }).catch(() => {
      });
    });
    function ae(_) {
      a.value.model = _.detail;
    }
    const Q = P({
      get: () => a.value.thinking_effort !== null,
      set: (_) => {
        a.value.thinking_effort = _ ? a.value.thinking_effort ?? 50 : null;
      }
    }), { showAdvancedTools: tt, selectableTraits: ie, selectedCapabilities: le, activeTraits: At, traitMountConfig: se, onTraitConfig: de, onCapabilitiesChange: ce, onToolsChange: ue } = jo({ form: a, traits: () => o.traits, redirectTrait: ft }), be = Vo({
      form: a,
      agentId: () => o.agentId,
      agents: () => o.agents,
      redirectTrait: ft
    }), {
      routeView: N,
      pickIds: Lt,
      onDelegatesChange: pe,
      redirectTargets: W,
      redirectSelectedIds: ge,
      onRedirectsChange: he,
      redirectLabel: fe,
      setRedirectCommentById: me
    } = be;
    vt(() => [o.open, o.agentId], ([_]) => {
      _ && (h.value = "prompt", N.value = "delegates", pt.value = "", o.agentId ? oe(o.agentId) : a.value = z());
    }, { immediate: !0 });
    const ve = P(() => [
      { key: "prompt", label: "Prompt", icon: "tabler:keyboard", meta: a.value.prompt.trim() ? "•" : "" },
      { key: "model", label: "Model", icon: "tabler:cpu", meta: "" },
      { key: "caps", label: "Capabilities", icon: "tabler:puzzle", meta: At.value.length ? String(At.value.length) : "" },
      { key: "routing", label: "Routing", icon: "tabler:arrows-split-2", meta: a.value.delegates.length + W.value.length ? String(a.value.delegates.length + W.value.length) : "" }
    ]);
    return (_, l) => (d(), p(H, null, [
      $(c(r), null, {
        default: M(() => [
          i("div", No, [
            i("span", Ho, [
              $(c(j), {
                icon: a.value.icon || "tabler:robot",
                "aria-hidden": "true"
              }, null, 8, ["icon"])
            ]),
            i("span", Uo, [
              i("span", Ko, A(u.value ? "Edit agent" : "New agent"), 1),
              i("span", Go, A(a.value.title.trim() || "Configure persona, model and capabilities."), 1)
            ]),
            i("button", {
              class: "kx-modal-x",
              "aria-label": "Close",
              onClick: l[0] || (l[0] = (b) => x("close"))
            }, [
              $(c(j), {
                icon: "tabler:x",
                "aria-hidden": "true"
              })
            ])
          ]),
          c(ne) ? (d(), p("div", Wo, [
            i("div", Zo, [
              $(c(j), {
                icon: "tabler:loader-2",
                class: "spin",
                "aria-hidden": "true"
              }),
              l[18] || (l[18] = B(" Loading…", -1))
            ])
          ])) : (d(), p("div", Xo, [
            i("div", Yo, [
              i("div", qo, [
                i("div", Jo, [
                  l[19] || (l[19] = i("span", { class: "kx-field-lbl" }, "Name", -1)),
                  i("div", Qo, [
                    $(To, {
                      class: "kx-name-icon",
                      modelValue: a.value.icon,
                      "onUpdate:modelValue": l[1] || (l[1] = (b) => a.value.icon = b),
                      fallback: "tabler:robot"
                    }, null, 8, ["modelValue"]),
                    F(i("input", {
                      ref_key: "agentNameInput",
                      ref: C,
                      "onUpdate:modelValue": l[2] || (l[2] = (b) => a.value.title = b),
                      class: "kx-input",
                      "data-agent-name": "",
                      "aria-label": "Agent name",
                      placeholder: "e.g. Research assistant"
                    }, null, 512), [
                      [K, a.value.title]
                    ])
                  ])
                ]),
                i("label", tr, [
                  l[20] || (l[20] = i("span", { class: "kx-field-lbl" }, [
                    B("Description "),
                    i("span", { class: "kx-field-hint-inline" }, "— shown in pickers")
                  ], -1)),
                  F(i("textarea", {
                    "onUpdate:modelValue": l[3] || (l[3] = (b) => a.value.description = b),
                    class: "kx-input kx-textarea kx-textarea-sm",
                    rows: "2",
                    placeholder: "What this agent is for."
                  }, null, 512), [
                    [K, a.value.description]
                  ])
                ])
              ]),
              $(no, {
                items: ve.value,
                active: h.value,
                onSelect: l[4] || (l[4] = (b) => h.value = b)
              }, null, 8, ["items", "active"])
            ]),
            i("div", er, [
              i("div", nr, A(k.value), 1),
              i("div", or, [
                h.value === "prompt" ? (d(), p("div", rr, [
                  i("label", ar, [
                    l[21] || (l[21] = i("span", { class: "kx-field-lbl" }, [
                      B("System prompt "),
                      i("span", { class: "kx-field-hint-inline" }, "— the agent's persona and instructions")
                    ], -1)),
                    F(i("textarea", {
                      "onUpdate:modelValue": l[5] || (l[5] = (b) => a.value.prompt = b),
                      class: "kx-input kx-textarea kx-textarea-lg",
                      placeholder: "You are a helpful assistant that…"
                    }, null, 512), [
                      [K, a.value.prompt]
                    ])
                  ]),
                  l[22] || (l[22] = i("p", { class: "kx-sec-foot" }, "Keep the prompt clear and operational. Capabilities and routing are configured in their own sections.", -1))
                ])) : h.value === "model" ? (d(), p("div", ir, [
                  i("div", lr, [
                    l[23] || (l[23] = i("span", { class: "kx-field-lbl" }, "Model", -1)),
                    i("wc-model-picker", {
                      value: a.value.model || "",
                      onSelect: ae
                    }, null, 40, sr)
                  ]),
                  i("label", dr, [
                    l[24] || (l[24] = i("span", { class: "kx-field-lbl" }, [
                      B("Max tokens "),
                      i("span", { class: "kx-field-hint-inline" }, "— response length cap")
                    ], -1)),
                    F(i("input", {
                      "onUpdate:modelValue": l[6] || (l[6] = (b) => a.value.max_tokens = b),
                      type: "number",
                      min: "1",
                      max: ut.value,
                      step: "1",
                      class: V(["kx-input", bt.value && "kx-input-err"])
                    }, null, 10, cr), [
                      [
                        K,
                        a.value.max_tokens,
                        void 0,
                        { number: !0 }
                      ]
                    ]),
                    bt.value ? (d(), p("span", ur, "Must be between 1 and " + A(ut.value) + ".", 1)) : S("", !0)
                  ]),
                  i("div", br, [
                    i("div", pr, [
                      $(c(wt), {
                        modelValue: Q.value,
                        "onUpdate:modelValue": l[7] || (l[7] = (b) => Q.value = b),
                        "input-id": "agent-thinking"
                      }, null, 8, ["modelValue"]),
                      l[25] || (l[25] = i("label", {
                        for: "agent-thinking",
                        class: "kx-toggle-copy"
                      }, [
                        i("span", { class: "kx-field-lbl" }, "Extended thinking")
                      ], -1))
                    ]),
                    Q.value ? (d(), p("div", gr, [
                      i("span", hr, "Effort: " + A(a.value.thinking_effort) + "%", 1),
                      F(i("input", {
                        "onUpdate:modelValue": l[8] || (l[8] = (b) => a.value.thinking_effort = b),
                        type: "range",
                        min: "0",
                        max: "100",
                        step: "5",
                        class: "kx-range"
                      }, null, 512), [
                        [
                          K,
                          a.value.thinking_effort,
                          void 0,
                          { number: !0 }
                        ]
                      ])
                    ])) : S("", !0)
                  ]),
                  i("div", fr, [
                    It.value ? (d(), p("div", mr, [
                      $(c(wt), {
                        modelValue: R.value,
                        "onUpdate:modelValue": l[9] || (l[9] = (b) => R.value = b),
                        "input-id": "agent-temperature"
                      }, null, 8, ["modelValue"]),
                      l[26] || (l[26] = i("label", {
                        for: "agent-temperature",
                        class: "kx-toggle-copy"
                      }, [
                        i("span", { class: "kx-field-lbl" }, "Custom temperature")
                      ], -1))
                    ])) : (d(), p("p", vr, A(te.value), 1)),
                    It.value && R.value ? (d(), p("div", yr, [
                      i("span", kr, A(I.value) + "% · higher is more creative · unsupported on most current models", 1),
                      F(i("input", {
                        "onUpdate:modelValue": l[10] || (l[10] = (b) => I.value = b),
                        type: "range",
                        min: "0",
                        max: "100",
                        step: "1",
                        class: "kx-range"
                      }, null, 512), [
                        [
                          K,
                          I.value,
                          void 0,
                          { number: !0 }
                        ]
                      ])
                    ])) : S("", !0)
                  ])
                ])) : h.value === "caps" ? (d(), p("div", xr, [
                  $(He, {
                    traits: c(ie),
                    tools: t.tools,
                    selected: c(le),
                    onChange: c(ce)
                  }, {
                    config: M(({ trait: b }) => [
                      b.web_component ? (d(), O(Ne, {
                        key: 0,
                        tag: b.web_component,
                        config: c(se)(b.id),
                        provider: b.provider,
                        onChange: (Z) => c(de)(b.id, Z)
                      }, null, 8, ["tag", "config", "provider", "onChange"])) : S("", !0)
                    ]),
                    _: 1
                  }, 8, ["traits", "tools", "selected", "onChange"]),
                  i("div", wr, [
                    i("button", {
                      type: "button",
                      class: "kx-group-toggle",
                      "aria-expanded": c(tt),
                      onClick: l[11] || (l[11] = (b) => tt.value = !c(tt))
                    }, [
                      $(c(j), {
                        icon: c(tt) ? "tabler:chevron-down" : "tabler:chevron-right",
                        class: "kx-adv-caret",
                        "aria-hidden": "true"
                      }, null, 8, ["icon"]),
                      l[27] || (l[27] = i("span", { class: "kx-group-title" }, "Tools", -1)),
                      i("span", _r, A(a.value.tools.length) + " selected", 1)
                    ], 8, Cr),
                    c(tt) ? (d(), p(H, { key: 0 }, [
                      l[28] || (l[28] = i("p", { class: "kx-sec-foot" }, "Capabilities add the tools they need automatically. Pick individual tools only for fine-grained control.", -1)),
                      $(Oo, {
                        tools: t.tools,
                        selected: a.value.tools,
                        onChange: c(ue)
                      }, null, 8, ["tools", "selected", "onChange"])
                    ], 64)) : S("", !0)
                  ])
                ])) : h.value === "routing" ? (d(), p("div", Sr, [
                  i("div", $r, [
                    i("button", {
                      type: "button",
                      role: "tab",
                      class: V(["kx-seg-btn", c(N) === "delegates" && "kx-seg-btn-on"]),
                      "aria-selected": c(N) === "delegates",
                      onClick: l[12] || (l[12] = (b) => N.value = "delegates")
                    }, [
                      $(c(j), {
                        icon: "tabler:arrow-ramp-right-3",
                        "aria-hidden": "true"
                      }),
                      l[29] || (l[29] = B(" Delegates ", -1)),
                      a.value.delegates.length ? (d(), p("span", Ir, A(a.value.delegates.length), 1)) : S("", !0)
                    ], 10, zr),
                    i("button", {
                      type: "button",
                      role: "tab",
                      class: V(["kx-seg-btn", c(N) === "redirects" && "kx-seg-btn-on"]),
                      "aria-selected": c(N) === "redirects",
                      onClick: l[13] || (l[13] = (b) => N.value = "redirects")
                    }, [
                      $(c(j), {
                        icon: "tabler:arrows-split-2",
                        "aria-hidden": "true"
                      }),
                      l[30] || (l[30] = B(" Redirects ", -1)),
                      c(W).length ? (d(), p("span", Ar, A(c(W).length), 1)) : S("", !0)
                    ], 10, Pr)
                  ]),
                  c(N) === "delegates" ? (d(), p(H, { key: 0 }, [
                    l[31] || (l[31] = i("p", { class: "kx-sec-foot" }, "When this agent decides a task belongs to another, it can hand off while keeping the chat. Pick the agents it may delegate to.", -1)),
                    i("wc-agent-picker", {
                      placeholder: "Search agents to delegate to…",
                      selected: JSON.stringify(a.value.delegates),
                      onChange: l[14] || (l[14] = (b) => c(pe)(c(Lt)(b)))
                    }, null, 40, Lr)
                  ], 64)) : (d(), p(H, { key: 1 }, [
                    l[32] || (l[32] = i("p", { class: "kx-sec-foot" }, [
                      B("A redirect is not a delegate: it "),
                      i("strong", null, "transfers the whole chat"),
                      B(" — the target agent takes over and this one stops. Pick the agents it may hand off to, and note when (injected into the prompt).")
                    ], -1)),
                    i("wc-agent-picker", {
                      placeholder: "Search agents to redirect to…",
                      selected: JSON.stringify(c(ge)),
                      onChange: l[15] || (l[15] = (b) => c(he)(c(Lt)(b)))
                    }, null, 40, Er),
                    c(W).length ? (d(), p("div", Br, [
                      (d(!0), p(H, null, St(c(W), (b) => (d(), p("div", {
                        key: b.agent_id,
                        class: "kx-redirect-comment-row"
                      }, [
                        i("span", Dr, [
                          $(c(j), {
                            icon: "tabler:arrows-split-2",
                            "aria-hidden": "true"
                          }),
                          B(" " + A(c(fe)(b.agent_id)), 1)
                        ]),
                        i("input", {
                          value: b.comment,
                          class: "kx-input kx-redirect-comment",
                          placeholder: "When to redirect here (injected into the prompt)…",
                          onInput: (Z) => c(me)(b.agent_id, Z.target.value)
                        }, null, 40, Or)
                      ]))), 128))
                    ])) : S("", !0)
                  ], 64))
                ])) : S("", !0)
              ])
            ])
          ])),
          i("div", Tr, [
            c(pt) ? (d(), p("div", jr, A(c(pt)), 1)) : S("", !0),
            $(c(ct), {
              type: "button",
              label: "Cancel",
              severity: "secondary",
              outlined: "",
              disabled: c(st),
              onClick: l[16] || (l[16] = (b) => x("close"))
            }, null, 8, ["disabled"]),
            $(c(ct), {
              type: "button",
              "data-testid": "agent-form-save",
              label: c(st) ? u.value ? "Saving…" : "Creating…" : u.value ? "Save changes" : "Create agent",
              loading: c(st),
              disabled: c(st) || !Pt.value,
              onClick: c(re)
            }, {
              icon: M(({ class: b }) => [
                $(c(j), {
                  icon: u.value ? "tabler:device-floppy" : "tabler:plus",
                  class: V(b),
                  "aria-hidden": "true"
                }, null, 8, ["icon", "class"])
              ]),
              _: 1
            }, 8, ["label", "loading", "disabled", "onClick"])
          ])
        ]),
        _: 1
      }),
      t.embedded ? t.open ? (d(), p("div", Fr, [
        i("div", Mr, [
          $(c(s))
        ])
      ])) : S("", !0) : (d(), O(c(qt), {
        key: 0,
        visible: g.value,
        "onUpdate:visible": l[17] || (l[17] = (b) => g.value = b),
        modal: "",
        "block-scroll": "",
        "show-header": !1,
        "dismissable-mask": !0,
        draggable: !1,
        pt: { root: { class: "kx-modal kx-modal-agent", role: "dialog", "aria-modal": "true", "aria-label": u.value ? "Edit agent" : "New agent" }, content: { class: "kx-modal-content" } },
        onShow: m
      }, {
        default: M(() => [
          $(c(s))
        ]),
        _: 1
      }, 8, ["visible", "pt"]))
    ], 64));
  }
});
export {
  Wr as _,
  Rt as e,
  ct as s
};
//# sourceMappingURL=AgentForm.vue_vue_type_script_setup_true_lang-CndyLk_q.js.map

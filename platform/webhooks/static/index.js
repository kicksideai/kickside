import { p as oe, a as De, w as ie, i as se, _ as ze, b as Ie, c as Me, e as K, r as Oe, d as Ae, g as Te, W as Be, s as Pe } from "./styles-BOPmWjId.js";
import { s as ee, B as ge, L as Fe, b as P, v as j, a as Re, U as je, I as re, c as Ve, d as He, r as ke, e as Ue, f as Ne, g as A, R as Ke, h as We, i as Ze, j as Ye, C as Xe, k as Ge, S as qe, l as Je, W as Qe, _ as et, p as tt, P as nt } from "./package-DOw-g2Y8.js";
import { openBlock as h, createElementBlock as v, mergeProps as S, createElementVNode as i, computed as W, resolveComponent as le, resolveDirective as at, createBlock as F, withCtx as L, createVNode as b, Transition as ot, withDirectives as Z, renderSlot as T, Fragment as V, normalizeClass as D, toDisplayString as C, createCommentVNode as x, resolveDynamicComponent as ue, createTextVNode as B, defineComponent as it, ref as M, unref as p, vModelText as Y, renderList as st, withKeys as de, withModifiers as ce, createSlots as rt } from "vue";
import { Icon as w } from "@iconify/vue";
import { host as O, define as lt } from "@wippy-fe/proxy";
function ut() {
  let e = [], t = (d, s, f = 999) => {
    let m = l(d, s, f), y = m.value + (m.key === d ? 0 : f) + 1;
    return e.push({ key: d, value: y }), y;
  }, n = (d) => {
    e = e.filter((s) => s.value !== d);
  }, a = (d, s) => l(d).value, l = (d, s, f = 0) => [...e].reverse().find((m) => !0) || { key: d, value: f }, o = (d) => d && parseInt(d.style.zIndex, 10) || 0;
  return { get: o, set: (d, s, f) => {
    s && (s.style.zIndex = String(t(d, !0, f)));
  }, clear: (d) => {
    d && (n(o(d)), d.style.zIndex = "");
  }, getCurrent: (d) => a(d) };
}
var X = ut(), Ce = {
  name: "TimesIcon",
  extends: ee
};
function dt(e) {
  return pt(e) || mt(e) || ft(e) || ct();
}
function ct() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function ft(e, t) {
  if (e) {
    if (typeof e == "string") return G(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? G(e, t) : void 0;
  }
}
function mt(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function pt(e) {
  if (Array.isArray(e)) return G(e);
}
function G(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, a = Array(t); n < t; n++) a[n] = e[n];
  return a;
}
function bt(e, t, n, a, l, o) {
  return h(), v("svg", S({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), dt(t[0] || (t[0] = [i("path", {
    d: "M8.01186 7.00933L12.27 2.75116C12.341 2.68501 12.398 2.60524 12.4375 2.51661C12.4769 2.42798 12.4982 2.3323 12.4999 2.23529C12.5016 2.13827 12.4838 2.0419 12.4474 1.95194C12.4111 1.86197 12.357 1.78024 12.2884 1.71163C12.2198 1.64302 12.138 1.58893 12.0481 1.55259C11.9581 1.51625 11.8617 1.4984 11.7647 1.50011C11.6677 1.50182 11.572 1.52306 11.4834 1.56255C11.3948 1.60204 11.315 1.65898 11.2488 1.72997L6.99067 5.98814L2.7325 1.72997C2.59553 1.60234 2.41437 1.53286 2.22718 1.53616C2.03999 1.53946 1.8614 1.61529 1.72901 1.74767C1.59663 1.88006 1.5208 2.05865 1.5175 2.24584C1.5142 2.43303 1.58368 2.61419 1.71131 2.75116L5.96948 7.00933L1.71131 11.2675C1.576 11.403 1.5 11.5866 1.5 11.7781C1.5 11.9696 1.576 12.1532 1.71131 12.2887C1.84679 12.424 2.03043 12.5 2.2219 12.5C2.41338 12.5 2.59702 12.424 2.7325 12.2887L6.99067 8.03052L11.2488 12.2887C11.3843 12.424 11.568 12.5 11.7594 12.5C11.9509 12.5 12.1346 12.424 12.27 12.2887C12.4053 12.1532 12.4813 11.9696 12.4813 11.7781C12.4813 11.5866 12.4053 11.403 12.27 11.2675L8.01186 7.00933Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
Ce.render = bt;
var xe = {
  name: "WindowMaximizeIcon",
  extends: ee
};
function ht(e) {
  return kt(e) || gt(e) || yt(e) || vt();
}
function vt() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function yt(e, t) {
  if (e) {
    if (typeof e == "string") return q(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? q(e, t) : void 0;
  }
}
function gt(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function kt(e) {
  if (Array.isArray(e)) return q(e);
}
function q(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, a = Array(t); n < t; n++) a[n] = e[n];
  return a;
}
function Ct(e, t, n, a, l, o) {
  return h(), v("svg", S({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), ht(t[0] || (t[0] = [i("path", {
    "fill-rule": "evenodd",
    "clip-rule": "evenodd",
    d: "M7 14H11.8C12.3835 14 12.9431 13.7682 13.3556 13.3556C13.7682 12.9431 14 12.3835 14 11.8V2.2C14 1.61652 13.7682 1.05694 13.3556 0.644365C12.9431 0.231785 12.3835 0 11.8 0H2.2C1.61652 0 1.05694 0.231785 0.644365 0.644365C0.231785 1.05694 0 1.61652 0 2.2V7C0 7.15913 0.063214 7.31174 0.175736 7.42426C0.288258 7.53679 0.44087 7.6 0.6 7.6C0.75913 7.6 0.911742 7.53679 1.02426 7.42426C1.13679 7.31174 1.2 7.15913 1.2 7V2.2C1.2 1.93478 1.30536 1.68043 1.49289 1.49289C1.68043 1.30536 1.93478 1.2 2.2 1.2H11.8C12.0652 1.2 12.3196 1.30536 12.5071 1.49289C12.6946 1.68043 12.8 1.93478 12.8 2.2V11.8C12.8 12.0652 12.6946 12.3196 12.5071 12.5071C12.3196 12.6946 12.0652 12.8 11.8 12.8H7C6.84087 12.8 6.68826 12.8632 6.57574 12.9757C6.46321 13.0883 6.4 13.2409 6.4 13.4C6.4 13.5591 6.46321 13.7117 6.57574 13.8243C6.68826 13.9368 6.84087 14 7 14ZM9.77805 7.42192C9.89013 7.534 10.0415 7.59788 10.2 7.59995C10.3585 7.59788 10.5099 7.534 10.622 7.42192C10.7341 7.30985 10.798 7.15844 10.8 6.99995V3.94242C10.8066 3.90505 10.8096 3.86689 10.8089 3.82843C10.8079 3.77159 10.7988 3.7157 10.7824 3.6623C10.756 3.55552 10.701 3.45698 10.622 3.37798C10.5099 3.2659 10.3585 3.20202 10.2 3.19995H7.00002C6.84089 3.19995 6.68828 3.26317 6.57576 3.37569C6.46324 3.48821 6.40002 3.64082 6.40002 3.79995C6.40002 3.95908 6.46324 4.11169 6.57576 4.22422C6.68828 4.33674 6.84089 4.39995 7.00002 4.39995H8.80006L6.19997 7.00005C6.10158 7.11005 6.04718 7.25246 6.04718 7.40005C6.04718 7.54763 6.10158 7.69004 6.19997 7.80005C6.30202 7.91645 6.44561 7.98824 6.59997 8.00005C6.75432 7.98824 6.89791 7.91645 6.99997 7.80005L9.60002 5.26841V6.99995C9.6021 7.15844 9.66598 7.30985 9.77805 7.42192ZM1.4 14H3.8C4.17066 13.9979 4.52553 13.8498 4.78763 13.5877C5.04973 13.3256 5.1979 12.9707 5.2 12.6V10.2C5.1979 9.82939 5.04973 9.47452 4.78763 9.21242C4.52553 8.95032 4.17066 8.80215 3.8 8.80005H1.4C1.02934 8.80215 0.674468 8.95032 0.412371 9.21242C0.150274 9.47452 0.00210008 9.82939 0 10.2V12.6C0.00210008 12.9707 0.150274 13.3256 0.412371 13.5877C0.674468 13.8498 1.02934 13.9979 1.4 14ZM1.25858 10.0586C1.29609 10.0211 1.34696 10 1.4 10H3.8C3.85304 10 3.90391 10.0211 3.94142 10.0586C3.97893 10.0961 4 10.147 4 10.2V12.6C4 12.6531 3.97893 12.704 3.94142 12.7415C3.90391 12.779 3.85304 12.8 3.8 12.8H1.4C1.34696 12.8 1.29609 12.779 1.25858 12.7415C1.22107 12.704 1.2 12.6531 1.2 12.6V10.2C1.2 10.147 1.22107 10.0961 1.25858 10.0586Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
xe.render = Ct;
var we = {
  name: "WindowMinimizeIcon",
  extends: ee
};
function xt(e) {
  return St(e) || Lt(e) || _t(e) || wt();
}
function wt() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function _t(e, t) {
  if (e) {
    if (typeof e == "string") return J(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? J(e, t) : void 0;
  }
}
function Lt(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function St(e) {
  if (Array.isArray(e)) return J(e);
}
function J(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, a = Array(t); n < t; n++) a[n] = e[n];
  return a;
}
function $t(e, t, n, a, l, o) {
  return h(), v("svg", S({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), xt(t[0] || (t[0] = [i("path", {
    "fill-rule": "evenodd",
    "clip-rule": "evenodd",
    d: "M11.8 0H2.2C1.61652 0 1.05694 0.231785 0.644365 0.644365C0.231785 1.05694 0 1.61652 0 2.2V7C0 7.15913 0.063214 7.31174 0.175736 7.42426C0.288258 7.53679 0.44087 7.6 0.6 7.6C0.75913 7.6 0.911742 7.53679 1.02426 7.42426C1.13679 7.31174 1.2 7.15913 1.2 7V2.2C1.2 1.93478 1.30536 1.68043 1.49289 1.49289C1.68043 1.30536 1.93478 1.2 2.2 1.2H11.8C12.0652 1.2 12.3196 1.30536 12.5071 1.49289C12.6946 1.68043 12.8 1.93478 12.8 2.2V11.8C12.8 12.0652 12.6946 12.3196 12.5071 12.5071C12.3196 12.6946 12.0652 12.8 11.8 12.8H7C6.84087 12.8 6.68826 12.8632 6.57574 12.9757C6.46321 13.0883 6.4 13.2409 6.4 13.4C6.4 13.5591 6.46321 13.7117 6.57574 13.8243C6.68826 13.9368 6.84087 14 7 14H11.8C12.3835 14 12.9431 13.7682 13.3556 13.3556C13.7682 12.9431 14 12.3835 14 11.8V2.2C14 1.61652 13.7682 1.05694 13.3556 0.644365C12.9431 0.231785 12.3835 0 11.8 0ZM6.368 7.952C6.44137 7.98326 6.52025 7.99958 6.6 8H9.8C9.95913 8 10.1117 7.93678 10.2243 7.82426C10.3368 7.71174 10.4 7.55913 10.4 7.4C10.4 7.24087 10.3368 7.08826 10.2243 6.97574C10.1117 6.86321 9.95913 6.8 9.8 6.8H8.048L10.624 4.224C10.73 4.11026 10.7877 3.95982 10.7849 3.80438C10.7822 3.64894 10.7192 3.50063 10.6093 3.3907C10.4994 3.28077 10.3511 3.2178 10.1956 3.21506C10.0402 3.21232 9.88974 3.27002 9.776 3.376L7.2 5.952V4.2C7.2 4.04087 7.13679 3.88826 7.02426 3.77574C6.91174 3.66321 6.75913 3.6 6.6 3.6C6.44087 3.6 6.28826 3.66321 6.17574 3.77574C6.06321 3.88826 6 4.04087 6 4.2V7.4C6.00042 7.47975 6.01674 7.55862 6.048 7.632C6.07656 7.70442 6.11971 7.7702 6.17475 7.82524C6.2298 7.88029 6.29558 7.92344 6.368 7.952ZM1.4 8.80005H3.8C4.17066 8.80215 4.52553 8.95032 4.78763 9.21242C5.04973 9.47452 5.1979 9.82939 5.2 10.2V12.6C5.1979 12.9707 5.04973 13.3256 4.78763 13.5877C4.52553 13.8498 4.17066 13.9979 3.8 14H1.4C1.02934 13.9979 0.674468 13.8498 0.412371 13.5877C0.150274 13.3256 0.00210008 12.9707 0 12.6V10.2C0.00210008 9.82939 0.150274 9.47452 0.412371 9.21242C0.674468 8.95032 1.02934 8.80215 1.4 8.80005ZM3.94142 12.7415C3.97893 12.704 4 12.6531 4 12.6V10.2C4 10.147 3.97893 10.0961 3.94142 10.0586C3.90391 10.0211 3.85304 10 3.8 10H1.4C1.34696 10 1.29609 10.0211 1.25858 10.0586C1.22107 10.0961 1.2 10.147 1.2 10.2V12.6C1.2 12.6531 1.22107 12.704 1.25858 12.7415C1.29609 12.779 1.34696 12.8 1.4 12.8H3.8C3.85304 12.8 3.90391 12.779 3.94142 12.7415Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
we.render = $t;
var Et = ge.extend({
  name: "focustrap-directive"
}), Dt = Re.extend({
  style: Et
});
function H(e) {
  "@babel/helpers - typeof";
  return H = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, H(e);
}
function fe(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var a = Object.getOwnPropertySymbols(e);
    t && (a = a.filter(function(l) {
      return Object.getOwnPropertyDescriptor(e, l).enumerable;
    })), n.push.apply(n, a);
  }
  return n;
}
function me(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? fe(Object(n), !0).forEach(function(a) {
      zt(e, a, n[a]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : fe(Object(n)).forEach(function(a) {
      Object.defineProperty(e, a, Object.getOwnPropertyDescriptor(n, a));
    });
  }
  return e;
}
function zt(e, t, n) {
  return (t = It(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function It(e) {
  var t = Mt(e, "string");
  return H(t) == "symbol" ? t : t + "";
}
function Mt(e, t) {
  if (H(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var a = n.call(e, t);
    if (H(a) != "object") return a;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var Ot = Dt.extend("focustrap", {
  mounted: function(t, n) {
    var a = n.value || {}, l = a.disabled;
    l || (this.createHiddenFocusableElements(t, n), this.bind(t, n), this.autoElementFocus(t, n)), t.setAttribute("data-pd-focustrap", !0), this.$el = t;
  },
  updated: function(t, n) {
    var a = n.value || {}, l = a.disabled;
    l && this.unbind(t);
  },
  unmounted: function(t) {
    this.unbind(t);
  },
  methods: {
    getComputedSelector: function(t) {
      return ':not(.p-hidden-focusable):not([data-p-hidden-focusable="true"])'.concat(t ?? "");
    },
    bind: function(t, n) {
      var a = this, l = n.value || {}, o = l.onFocusIn, d = l.onFocusOut;
      t.$_pfocustrap_mutationobserver = new MutationObserver(function(s) {
        s.forEach(function(f) {
          if (f.type === "childList" && !t.contains(document.activeElement)) {
            var m = function(k) {
              var _ = re(k) ? re(k, a.getComputedSelector(t.$_pfocustrap_focusableselector)) ? k : j(t, a.getComputedSelector(t.$_pfocustrap_focusableselector)) : j(k);
              return Ve(_) ? _ : k.nextSibling && m(k.nextSibling);
            };
            P(m(f.nextSibling));
          }
        });
      }), t.$_pfocustrap_mutationobserver.disconnect(), t.$_pfocustrap_mutationobserver.observe(t, {
        childList: !0
      }), t.$_pfocustrap_focusinlistener = function(s) {
        return o && o(s);
      }, t.$_pfocustrap_focusoutlistener = function(s) {
        return d && d(s);
      }, t.addEventListener("focusin", t.$_pfocustrap_focusinlistener), t.addEventListener("focusout", t.$_pfocustrap_focusoutlistener);
    },
    unbind: function(t) {
      t.$_pfocustrap_mutationobserver && t.$_pfocustrap_mutationobserver.disconnect(), t.$_pfocustrap_focusinlistener && t.removeEventListener("focusin", t.$_pfocustrap_focusinlistener) && (t.$_pfocustrap_focusinlistener = null), t.$_pfocustrap_focusoutlistener && t.removeEventListener("focusout", t.$_pfocustrap_focusoutlistener) && (t.$_pfocustrap_focusoutlistener = null);
    },
    autoFocus: function(t) {
      this.autoElementFocus(this.$el, {
        value: me(me({}, t), {}, {
          autoFocus: !0
        })
      });
    },
    autoElementFocus: function(t, n) {
      var a = n.value || {}, l = a.autoFocusSelector, o = l === void 0 ? "" : l, d = a.firstFocusableSelector, s = d === void 0 ? "" : d, f = a.autoFocus, m = f === void 0 ? !1 : f, y = j(t, "[autofocus]".concat(this.getComputedSelector(o)));
      m && !y && (y = j(t, this.getComputedSelector(s))), P(y);
    },
    onFirstHiddenElementFocus: function(t) {
      var n, a = t.currentTarget, l = t.relatedTarget, o = l === a.$_pfocustrap_lasthiddenfocusableelement || !((n = this.$el) !== null && n !== void 0 && n.contains(l)) ? j(a.parentElement, this.getComputedSelector(a.$_pfocustrap_focusableselector)) : a.$_pfocustrap_lasthiddenfocusableelement;
      P(o);
    },
    onLastHiddenElementFocus: function(t) {
      var n, a = t.currentTarget, l = t.relatedTarget, o = l === a.$_pfocustrap_firsthiddenfocusableelement || !((n = this.$el) !== null && n !== void 0 && n.contains(l)) ? Fe(a.parentElement, this.getComputedSelector(a.$_pfocustrap_focusableselector)) : a.$_pfocustrap_firsthiddenfocusableelement;
      P(o);
    },
    createHiddenFocusableElements: function(t, n) {
      var a = this, l = n.value || {}, o = l.tabIndex, d = o === void 0 ? 0 : o, s = l.firstFocusableSelector, f = s === void 0 ? "" : s, m = l.lastFocusableSelector, y = m === void 0 ? "" : m, k = function($) {
        return je("span", {
          class: "p-hidden-accessible p-hidden-focusable",
          tabIndex: d,
          role: "presentation",
          "aria-hidden": !0,
          "data-p-hidden-accessible": !0,
          "data-p-hidden-focusable": !0,
          onFocus: $?.bind(a)
        });
      }, _ = k(this.onFirstHiddenElementFocus), g = k(this.onLastHiddenElementFocus);
      _.$_pfocustrap_lasthiddenfocusableelement = g, _.$_pfocustrap_focusableselector = f, _.setAttribute("data-pc-section", "firstfocusableelement"), g.$_pfocustrap_firsthiddenfocusableelement = _, g.$_pfocustrap_focusableselector = y, g.setAttribute("data-pc-section", "lastfocusableelement"), t.prepend(_), t.append(g);
    }
  }
});
function pe() {
  Ue({
    variableName: ke("scrollbar.width").name
  });
}
function be() {
  He({
    variableName: ke("scrollbar.width").name
  });
}
var At = `
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
`, Tt = {
  mask: function(t) {
    var n = t.position, a = t.modal;
    return {
      position: "fixed",
      height: "100%",
      width: "100%",
      left: 0,
      top: 0,
      display: "flex",
      justifyContent: n === "left" || n === "topleft" || n === "bottomleft" ? "flex-start" : n === "right" || n === "topright" || n === "bottomright" ? "flex-end" : "center",
      alignItems: n === "top" || n === "topleft" || n === "topright" ? "flex-start" : n === "bottom" || n === "bottomleft" || n === "bottomright" ? "flex-end" : "center",
      pointerEvents: a ? "auto" : "none"
    };
  },
  root: {
    display: "flex",
    flexDirection: "column",
    pointerEvents: "auto"
  }
}, Bt = {
  mask: function(t) {
    var n = t.props, a = ["left", "right", "top", "topleft", "topright", "bottom", "bottomleft", "bottomright"], l = a.find(function(o) {
      return o === n.position;
    });
    return ["p-dialog-mask", {
      "p-overlay-mask p-overlay-mask-enter-active": n.modal
    }, l ? "p-dialog-".concat(l) : ""];
  },
  root: function(t) {
    var n = t.props, a = t.instance;
    return ["p-dialog p-component", {
      "p-dialog-maximized": n.maximizable && a.maximized
    }];
  },
  header: "p-dialog-header",
  title: "p-dialog-title",
  headerActions: "p-dialog-header-actions",
  pcMaximizeButton: "p-dialog-maximize-button",
  pcCloseButton: "p-dialog-close-button",
  content: "p-dialog-content",
  footer: "p-dialog-footer"
}, Pt = ge.extend({
  name: "dialog",
  style: At,
  classes: Bt,
  inlineStyles: Tt
}), Ft = {
  name: "BaseDialog",
  extends: We,
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
  style: Pt,
  provide: function() {
    return {
      $pcDialog: this,
      $parentInstance: this
    };
  }
}, Q = {
  name: "Dialog",
  extends: Ft,
  inheritAttrs: !1,
  emits: ["update:visible", "show", "hide", "after-hide", "maximize", "unmaximize", "dragstart", "dragend"],
  provide: function() {
    var t = this;
    return {
      dialogRef: W(function() {
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
    this.unbindDocumentState(), this.unbindGlobalListeners(), this.destroyStyle(), this.mask && this.autoZIndex && X.clear(this.mask), this.container = null, this.mask = null;
  },
  mounted: function() {
    this.breakpoints && this.createStyle();
  },
  methods: {
    close: function() {
      this.$emit("update:visible", !1);
    },
    onEnter: function() {
      this.$emit("show"), this.target = document.activeElement, this.enableDocumentSettings(), this.bindGlobalListeners(), this.autoZIndex && X.set("modal", this.mask, this.baseZIndex || this.$primevue.config.zIndex.modal);
    },
    onAfterEnter: function() {
      this.focus();
    },
    onBeforeLeave: function() {
      this.modal && !this.isUnstyled && Qe(this.mask, "p-overlay-mask-leave-active"), this.dragging && this.documentDragEndListener && this.documentDragEndListener();
    },
    onLeave: function() {
      this.$emit("hide"), P(this.target), this.target = null, this.focusableClose = null, this.focusableMax = null;
    },
    onAfterLeave: function() {
      this.autoZIndex && X.clear(this.mask), this.containerVisible = !1, this.unbindDocumentState(), this.unbindGlobalListeners(), this.$emit("after-hide");
    },
    onMaskMouseDown: function(t) {
      this.maskMouseDownTarget = t.target;
    },
    onMaskMouseUp: function() {
      this.dismissableMask && this.modal && this.mask === this.maskMouseDownTarget && this.close();
    },
    focus: function() {
      var t = function(l) {
        return l && l.querySelector("[autofocus]");
      }, n = this.$slots.footer && t(this.footerContainer);
      n || (n = this.$slots.header && t(this.headerContainer), n || (n = this.$slots.default && t(this.content), n || (this.maximizable ? (this.focusableMax = !0, n = this.maximizableButton) : (this.focusableClose = !0, n = this.closeButton)))), n && P(n, {
        focusVisible: !0
      });
    },
    maximize: function(t) {
      this.maximized ? (this.maximized = !1, this.$emit("unmaximize", t)) : (this.maximized = !0, this.$emit("maximize", t)), this.modal || (this.maximized ? pe() : be());
    },
    enableDocumentSettings: function() {
      (this.modal || !this.modal && this.blockScroll || this.maximizable && this.maximized) && pe();
    },
    unbindDocumentState: function() {
      (this.modal || !this.modal && this.blockScroll || this.maximizable && this.maximized) && be();
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
        this.styleElement = document.createElement("style"), this.styleElement.type = "text/css", Je(this.styleElement, "nonce", (t = this.$primevue) === null || t === void 0 || (t = t.config) === null || t === void 0 || (t = t.csp) === null || t === void 0 ? void 0 : t.nonce), document.head.appendChild(this.styleElement);
        var n = "";
        for (var a in this.breakpoints)
          n += `
                        @media screen and (max-width: `.concat(a, `) {
                            .p-dialog[`).concat(this.$attrSelector, `] {
                                width: `).concat(this.breakpoints[a], ` !important;
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
      t.target.closest("div").getAttribute("data-pc-section") !== "headeractions" && this.draggable && (this.dragging = !0, this.lastPageX = t.pageX, this.lastPageY = t.pageY, this.container.style.margin = "0", document.body.setAttribute("data-p-unselectable-text", "true"), !this.isUnstyled && qe(document.body, {
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
          var a = Ye(t.container), l = Xe(t.container), o = n.pageX - t.lastPageX, d = n.pageY - t.lastPageY, s = t.container.getBoundingClientRect(), f = s.left + o, m = s.top + d, y = Ge(), k = getComputedStyle(t.container), _ = parseFloat(k.marginLeft), g = parseFloat(k.marginTop);
          t.container.style.position = "fixed", t.keepInViewport ? (f >= t.minX && f + a < y.width && (t.lastPageX = n.pageX, t.container.style.left = f - _ + "px"), m >= t.minY && m + l < y.height && (t.lastPageY = n.pageY, t.container.style.top = m - g + "px")) : (t.lastPageX = n.pageX, t.container.style.left = f - _ + "px", t.lastPageY = n.pageY, t.container.style.top = m - g + "px");
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
      return Ze({
        maximized: this.maximized,
        modal: this.modal
      });
    }
  },
  directives: {
    ripple: Ke,
    focustrap: Ot
  },
  components: {
    Button: A,
    Portal: Ne,
    WindowMinimizeIcon: we,
    WindowMaximizeIcon: xe,
    TimesIcon: Ce
  }
};
function U(e) {
  "@babel/helpers - typeof";
  return U = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, U(e);
}
function he(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var a = Object.getOwnPropertySymbols(e);
    t && (a = a.filter(function(l) {
      return Object.getOwnPropertyDescriptor(e, l).enumerable;
    })), n.push.apply(n, a);
  }
  return n;
}
function ve(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? he(Object(n), !0).forEach(function(a) {
      Rt(e, a, n[a]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : he(Object(n)).forEach(function(a) {
      Object.defineProperty(e, a, Object.getOwnPropertyDescriptor(n, a));
    });
  }
  return e;
}
function Rt(e, t, n) {
  return (t = jt(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function jt(e) {
  var t = Vt(e, "string");
  return U(t) == "symbol" ? t : t + "";
}
function Vt(e, t) {
  if (U(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var a = n.call(e, t);
    if (U(a) != "object") return a;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var Ht = ["data-p"], Ut = ["aria-labelledby", "aria-modal", "data-p"], Nt = ["id"], Kt = ["data-p"];
function Wt(e, t, n, a, l, o) {
  var d = le("Button"), s = le("Portal"), f = at("focustrap");
  return h(), F(s, {
    appendTo: e.appendTo
  }, {
    default: L(function() {
      return [l.containerVisible ? (h(), v("div", S({
        key: 0,
        ref: o.maskRef,
        class: e.cx("mask"),
        style: e.sx("mask", !0, {
          position: e.position,
          modal: e.modal
        }),
        onMousedown: t[1] || (t[1] = function() {
          return o.onMaskMouseDown && o.onMaskMouseDown.apply(o, arguments);
        }),
        onMouseup: t[2] || (t[2] = function() {
          return o.onMaskMouseUp && o.onMaskMouseUp.apply(o, arguments);
        }),
        "data-p": o.dataP
      }, e.ptm("mask")), [b(ot, S({
        name: "p-dialog",
        onEnter: o.onEnter,
        onAfterEnter: o.onAfterEnter,
        onBeforeLeave: o.onBeforeLeave,
        onLeave: o.onLeave,
        onAfterLeave: o.onAfterLeave,
        appear: ""
      }, e.ptm("transition")), {
        default: L(function() {
          return [e.visible ? Z((h(), v("div", S({
            key: 0,
            ref: o.containerRef,
            class: e.cx("root"),
            style: e.sx("root"),
            role: "dialog",
            "aria-labelledby": o.ariaLabelledById,
            "aria-modal": e.modal,
            "data-p": o.dataP
          }, e.ptmi("root")), [e.$slots.container ? T(e.$slots, "container", {
            key: 0,
            closeCallback: o.close,
            maximizeCallback: function(y) {
              return o.maximize(y);
            },
            initDragCallback: o.initDrag
          }) : (h(), v(V, {
            key: 1
          }, [e.showHeader ? (h(), v("div", S({
            key: 0,
            ref: o.headerContainerRef,
            class: e.cx("header"),
            onMousedown: t[0] || (t[0] = function() {
              return o.initDrag && o.initDrag.apply(o, arguments);
            })
          }, e.ptm("header")), [T(e.$slots, "header", {
            class: D(e.cx("title"))
          }, function() {
            return [e.header ? (h(), v("span", S({
              key: 0,
              id: o.ariaLabelledById,
              class: e.cx("title")
            }, e.ptm("title")), C(e.header), 17, Nt)) : x("", !0)];
          }), i("div", S({
            class: e.cx("headerActions")
          }, e.ptm("headerActions")), [e.maximizable ? T(e.$slots, "maximizebutton", {
            key: 0,
            maximized: l.maximized,
            maximizeCallback: function(y) {
              return o.maximize(y);
            }
          }, function() {
            return [b(d, S({
              ref: o.maximizableRef,
              autofocus: l.focusableMax,
              class: e.cx("pcMaximizeButton"),
              onClick: o.maximize,
              tabindex: e.maximizable ? "0" : "-1",
              unstyled: e.unstyled
            }, e.maximizeButtonProps, {
              pt: e.ptm("pcMaximizeButton"),
              "data-pc-group-section": "headericon"
            }), {
              icon: L(function(m) {
                return [T(e.$slots, "maximizeicon", {
                  maximized: l.maximized
                }, function() {
                  return [(h(), F(ue(o.maximizeIconComponent), S({
                    class: [m.class, l.maximized ? e.minimizeIcon : e.maximizeIcon]
                  }, e.ptm("pcMaximizeButton").icon), null, 16, ["class"]))];
                })];
              }),
              _: 3
            }, 16, ["autofocus", "class", "onClick", "tabindex", "unstyled", "pt"])];
          }) : x("", !0), e.closable ? T(e.$slots, "closebutton", {
            key: 1,
            closeCallback: o.close
          }, function() {
            return [b(d, S({
              ref: o.closeButtonRef,
              autofocus: l.focusableClose,
              class: e.cx("pcCloseButton"),
              onClick: o.close,
              "aria-label": o.closeAriaLabel,
              unstyled: e.unstyled
            }, e.closeButtonProps, {
              pt: e.ptm("pcCloseButton"),
              "data-pc-group-section": "headericon"
            }), {
              icon: L(function(m) {
                return [T(e.$slots, "closeicon", {}, function() {
                  return [(h(), F(ue(e.closeIcon ? "span" : "TimesIcon"), S({
                    class: [e.closeIcon, m.class]
                  }, e.ptm("pcCloseButton").icon), null, 16, ["class"]))];
                })];
              }),
              _: 3
            }, 16, ["autofocus", "class", "onClick", "aria-label", "unstyled", "pt"])];
          }) : x("", !0)], 16)], 16)) : x("", !0), i("div", S({
            ref: o.contentRef,
            class: [e.cx("content"), e.contentClass],
            style: e.contentStyle,
            "data-p": o.dataP
          }, ve(ve({}, e.contentProps), e.ptm("content"))), [T(e.$slots, "default")], 16, Kt), e.footer || e.$slots.footer ? (h(), v("div", S({
            key: 1,
            ref: o.footerContainerRef,
            class: e.cx("footer")
          }, e.ptm("footer")), [T(e.$slots, "footer", {}, function() {
            return [B(C(e.footer), 1)];
          })], 16)) : x("", !0)], 64))], 16, Ut)), [[f, {
            disabled: !e.modal
          }]]) : x("", !0)];
        }),
        _: 3
      }, 16, ["onEnter", "onAfterEnter", "onBeforeLeave", "onLeave", "onAfterLeave"])], 16, Ht)) : x("", !0)];
    }),
    _: 3
  }, 8, ["appendTo"]);
}
Q.render = Wt;
function Zt(e) {
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
function ye(e, t) {
  const n = Zt(e);
  if (n === null) return "";
  const a = t?.now ?? Date.now(), l = t?.suffix ?? !0, o = t?.maxUnit ?? "day", d = t?.future ?? !1, s = 6e4, f = 60 * s, m = 24 * f, y = 30 * m, k = 365 * m, _ = a - n;
  if (d && _ < 0) {
    const $ = -_;
    return $ < s ? "in <1m" : $ < f ? `in ${Math.floor($ / s)}m` : $ < m ? `in ${Math.floor($ / f)}h` : `in ${Math.floor($ / m)}d`;
  }
  const g = Math.max(0, _);
  if (g < s) return "just now";
  const E = l ? " ago" : "";
  return g < f ? `${Math.floor(g / s)}m${E}` : g < m ? `${Math.floor(g / f)}h${E}` : o === "year" ? g < y ? `${Math.floor(g / m)}d${E}` : g < k ? `${Math.floor(g / y)}mo${E}` : `${Math.floor(g / k)}y${E}` : `${Math.floor(g / m)}d${E}`;
}
const Yt = { class: "kx" }, Xt = { class: "kx-bar" }, Gt = { class: "kx-count" }, qt = { class: "kx-bar-actions" }, Jt = {
  key: 0,
  class: "kx-search"
}, Qt = {
  key: 0,
  class: "kx-err"
}, en = { class: "kx-body" }, tn = {
  key: 0,
  class: "kx-loading"
}, nn = {
  key: 1,
  class: "kx-empty"
}, an = { class: "kx-empty-ico" }, on = { class: "kx-empty-actions" }, sn = {
  key: 2,
  class: "kx-empty"
}, rn = { class: "kx-empty-ico" }, ln = { class: "kx-empty-sub" }, un = { class: "kx-empty-actions" }, dn = {
  key: 3,
  class: "kx-grid"
}, cn = ["aria-label", "onClick", "onKeydown"], fn = { class: "kx-card-head" }, mn = { class: "kx-ficon" }, pn = { class: "kx-card-id" }, bn = ["title"], hn = { class: "kx-card-meta" }, vn = ["title"], yn = ["title"], gn = { class: "kx-modal-head-icon" }, kn = { class: "kx-modal-body" }, Cn = { class: "kx-modal-head-icon" }, xn = { class: "kx-modal-head-text" }, wn = { class: "kx-modal-head-title" }, _n = { class: "kx-modal-head-sub" }, Ln = {
  key: 0,
  class: "kx-modal-body"
}, Sn = { class: "kx-field" }, $n = { class: "wh-token" }, En = { class: "kx-field" }, Dn = { class: "wh-token" }, zn = { key: 0 }, In = { class: "wh-note" }, Mn = { class: "wh-facts" }, On = { class: "kx-field" }, An = ["disabled"], Tn = { class: "kx-field wh-schema" }, Bn = { class: "wh-schema-edit" }, Pn = ["disabled"], Fn = {
  key: 0,
  class: "kx-err inline"
}, Rn = /* @__PURE__ */ it({
  __name: "Webhooks",
  setup(e) {
    const t = {
      header: { class: "kx-dialog-header" },
      content: { class: "kx-dialog-content" },
      footer: { class: "kx-dialog-footer" }
    }, n = M([]), a = M(!0), l = M(""), o = M(""), d = M(!1), s = M(null), f = M({ label: "", schemaText: "" }), m = M(""), y = M(!1), k = M(!1), _ = W(() => {
      const c = o.value.trim().toLowerCase();
      return c ? n.value.filter((r) => (r.label || r.webhook_id).toLowerCase().includes(c)) : n.value;
    }), g = W(() => oe(f.value.schemaText).schema || (s.value?.schema ?? {}));
    async function E() {
      a.value = !0, l.value = "";
      try {
        n.value = await Te();
      } catch (c) {
        n.value = [], l.value = K(c, "could not load webhooks");
      } finally {
        a.value = !1;
      }
    }
    function $(c) {
      return "POST /api/public/hooks/" + c;
    }
    function z(c) {
      return c.subscriber_count || 0;
    }
    function te() {
      d.value = !0;
    }
    function _e() {
      d.value = !1;
    }
    async function Le() {
      d.value = !1, await E();
    }
    function N(c) {
      s.value = c, f.value = { label: c.label || "", schemaText: Ie(c.schema || {}) }, m.value = "", k.value = !1;
    }
    function R() {
      s.value = null;
    }
    const ne = W({
      get: () => s.value !== null,
      set: (c) => {
        c || R();
      }
    });
    async function Se(c, r) {
      try {
        await navigator.clipboard.writeText(c), O.toast({ severity: "success", summary: "Copied", detail: r });
      } catch {
        O.toast({ severity: "warn", summary: "Copy failed", detail: "Select and copy manually." });
      }
    }
    async function $e() {
      const c = s.value;
      if (!c) return;
      const r = oe(f.value.schemaText);
      if (r.error) {
        m.value = r.error;
        return;
      }
      y.value = !0, m.value = "";
      try {
        await Me(c.webhook_id, { label: f.value.label.trim(), schema: r.schema }), O.toast({ severity: "success", summary: "Saved", detail: f.value.label.trim() || c.webhook_id }), R(), await E();
      } catch (u) {
        m.value = K(u, "save failed");
      } finally {
        y.value = !1;
      }
    }
    async function ae(c) {
      if (await O.confirm({
        message: `Revoke “${c.label || c.webhook_id}”? The secret stops working and subscribed automations receive no further events. This can't be undone.`,
        header: "Revoke webhook",
        icon: "tabler:ban",
        acceptLabel: "Revoke",
        rejectLabel: "Cancel",
        acceptClass: "p-button-danger"
      }))
        try {
          await Oe(c.webhook_id), O.toast({ severity: "success", summary: "Revoked", detail: c.label || c.webhook_id }), s.value?.webhook_id === c.webhook_id && R(), await E();
        } catch (u) {
          l.value = K(u, "revoke failed"), O.toast({ severity: "error", summary: "Revoke failed", detail: l.value });
        }
    }
    async function Ee(c) {
      if (z(c) > 0) {
        O.toast({
          severity: "warn",
          summary: "In use",
          detail: `Used by ${z(c)} automation${z(c) === 1 ? "" : "s"}. Remove those first.`
        });
        return;
      }
      if (await O.confirm({
        message: `Remove “${c.label || c.webhook_id}”? This deletes the webhook and its endpoint. This can't be undone.`,
        header: "Remove webhook",
        icon: "tabler:trash",
        acceptLabel: "Remove",
        rejectLabel: "Cancel",
        acceptClass: "p-button-danger"
      }))
        try {
          await Ae(c.webhook_id), O.toast({ severity: "success", summary: "Removed", detail: c.label || c.webhook_id }), s.value?.webhook_id === c.webhook_id && R(), await E();
        } catch (u) {
          l.value = K(u, "delete failed"), O.toast({ severity: "error", summary: "Remove failed", detail: l.value });
        }
    }
    return De(E), (c, r) => (h(), v("div", Yt, [
      i("div", Xt, [
        i("span", Gt, C(n.value.length) + " webhook" + C(n.value.length !== 1 ? "s" : ""), 1),
        i("div", qt, [
          n.value.length ? (h(), v("div", Jt, [
            b(p(w), {
              icon: "tabler:search",
              class: "kx-search-ico",
              "aria-hidden": "true"
            }),
            Z(i("input", {
              "onUpdate:modelValue": r[0] || (r[0] = (u) => o.value = u),
              class: "kx-search-input",
              type: "text",
              placeholder: "Search webhooks…",
              "aria-label": "Search webhooks"
            }, null, 512), [
              [Y, o.value]
            ])
          ])) : x("", !0),
          b(p(A), {
            type: "button",
            label: "New webhook",
            onClick: te
          }, {
            icon: L(({ class: u }) => [
              b(p(w), {
                icon: "tabler:plus",
                class: D(u),
                "aria-hidden": "true"
              }, null, 8, ["class"])
            ]),
            _: 1
          })
        ])
      ]),
      l.value ? (h(), v("div", Qt, C(l.value), 1)) : x("", !0),
      i("div", en, [
        a.value && !n.value.length ? (h(), v("div", tn, [
          b(p(w), {
            icon: "tabler:loader-2",
            class: "spin",
            "aria-hidden": "true"
          }),
          r[10] || (r[10] = B(" Loading webhooks… ", -1))
        ])) : n.value.length ? _.value.length ? (h(), v("div", dn, [
          (h(!0), v(V, null, st(_.value, (u) => (h(), v("div", {
            key: u.webhook_id,
            class: D(["kx-card", u.status === "revoked" && "is-revoked"]),
            tabindex: "0",
            role: "button",
            "aria-label": `Open ${u.label || "webhook"}`,
            onClick: (I) => N(u),
            onKeydown: [
              de((I) => N(u), ["enter"]),
              de(ce((I) => N(u), ["prevent"]), ["space"])
            ]
          }, [
            i("div", fn, [
              i("span", mn, [
                b(p(w), {
                  icon: "tabler:webhook",
                  "aria-hidden": "true"
                })
              ]),
              i("div", pn, [
                i("div", {
                  class: "kx-card-name",
                  title: u.label || "Webhook"
                }, C(u.label || "Webhook"), 9, bn),
                i("div", hn, [
                  i("span", {
                    class: D(["kx-chip kx-tag-sm", u.status === "active" ? "is-active" : "is-revoked"])
                  }, C(p(ie)(u.status)), 3),
                  z(u) > 0 ? (h(), v("span", {
                    key: 0,
                    class: "kx-chip kx-tag-sm is-count",
                    title: `Used by ${z(u)} automation(s)`
                  }, [
                    b(p(w), {
                      icon: "tabler:plug-connected",
                      "aria-hidden": "true"
                    }),
                    B(" " + C(z(u)) + " automation" + C(z(u) === 1 ? "" : "s"), 1)
                  ], 8, vn)) : x("", !0)
                ])
              ]),
              i("div", {
                class: "kx-card-actions",
                onClick: r[2] || (r[2] = ce(() => {
                }, ["stop"]))
              }, [
                b(p(A), {
                  type: "button",
                  severity: "secondary",
                  outlined: "",
                  size: "small",
                  title: "Open",
                  "aria-label": `Open ${u.label || "webhook"}`,
                  onClick: (I) => N(u)
                }, {
                  icon: L(({ class: I }) => [
                    b(p(w), {
                      icon: "tabler:pencil",
                      class: D(I),
                      "aria-hidden": "true"
                    }, null, 8, ["class"])
                  ]),
                  _: 1
                }, 8, ["aria-label", "onClick"]),
                u.status === "active" ? (h(), F(p(A), {
                  key: 0,
                  type: "button",
                  severity: "danger",
                  outlined: "",
                  size: "small",
                  title: "Revoke",
                  "aria-label": `Revoke ${u.label || "webhook"}`,
                  onClick: (I) => ae(u)
                }, {
                  icon: L(({ class: I }) => [
                    b(p(w), {
                      icon: "tabler:ban",
                      class: D(I),
                      "aria-hidden": "true"
                    }, null, 8, ["class"])
                  ]),
                  _: 1
                }, 8, ["aria-label", "onClick"])) : x("", !0),
                b(p(A), {
                  type: "button",
                  severity: "danger",
                  outlined: "",
                  size: "small",
                  title: "Remove",
                  "aria-label": `Remove ${u.label || "webhook"}`,
                  disabled: z(u) > 0,
                  onClick: (I) => Ee(u)
                }, {
                  icon: L(({ class: I }) => [
                    b(p(w), {
                      icon: "tabler:trash",
                      class: D(I),
                      "aria-hidden": "true"
                    }, null, 8, ["class"])
                  ]),
                  _: 1
                }, 8, ["aria-label", "disabled", "onClick"])
              ])
            ]),
            i("div", {
              class: "kx-card-desc",
              title: $(u.webhook_id)
            }, C($(u.webhook_id)), 9, yn)
          ], 42, cn))), 128))
        ])) : (h(), v("div", sn, [
          i("div", rn, [
            b(p(w), {
              icon: "tabler:mood-empty",
              "aria-hidden": "true"
            })
          ]),
          r[13] || (r[13] = i("div", { class: "kx-empty-title" }, "No matches", -1)),
          i("div", ln, "Nothing matches “" + C(o.value) + "”. Try a different term or clear the search.", 1),
          i("div", un, [
            b(p(A), {
              type: "button",
              severity: "secondary",
              outlined: "",
              label: "Clear search",
              onClick: r[1] || (r[1] = (u) => o.value = "")
            }, {
              icon: L(({ class: u }) => [
                b(p(w), {
                  icon: "tabler:x",
                  class: D(u),
                  "aria-hidden": "true"
                }, null, 8, ["class"])
              ]),
              _: 1
            })
          ])
        ])) : (h(), v("div", nn, [
          i("div", an, [
            b(p(w), {
              icon: "tabler:webhook",
              "aria-hidden": "true"
            })
          ]),
          r[11] || (r[11] = i("div", { class: "kx-empty-title" }, "No webhooks yet", -1)),
          r[12] || (r[12] = i("div", { class: "kx-empty-sub" }, "A webhook gives an external service a secret URL to POST to. Each request becomes a trigger event your automations can act on.", -1)),
          i("div", on, [
            b(p(A), {
              type: "button",
              label: "New webhook",
              onClick: te
            }, {
              icon: L(({ class: u }) => [
                b(p(w), {
                  icon: "tabler:plus",
                  class: D(u),
                  "aria-hidden": "true"
                }, null, 8, ["class"])
              ]),
              _: 1
            })
          ])
        ]))
      ]),
      b(p(Q), {
        visible: d.value,
        "onUpdate:visible": r[3] || (r[3] = (u) => d.value = u),
        modal: "",
        "dismissable-mask": !0,
        class: "kx-dialog",
        pt: t,
        "aria-label": "New webhook"
      }, {
        header: L(() => [
          i("span", gn, [
            b(p(w), {
              icon: "tabler:webhook",
              "aria-hidden": "true"
            })
          ]),
          r[14] || (r[14] = i("span", { class: "kx-modal-head-text" }, [
            i("span", { class: "kx-modal-head-title" }, "New webhook"),
            i("span", { class: "kx-modal-head-sub" }, "Name it and set the payload it accepts — the secret is shown once.")
          ], -1))
        ]),
        default: L(() => [
          i("div", kn, [
            b(et, {
              onCreated: Le,
              onClose: _e
            })
          ])
        ]),
        _: 1
      }, 8, ["visible"]),
      b(p(Q), {
        visible: ne.value,
        "onUpdate:visible": r[9] || (r[9] = (u) => ne.value = u),
        modal: "",
        class: "kx-dialog",
        pt: t,
        "aria-label": "Webhook detail"
      }, rt({
        default: L(() => [
          s.value ? (h(), v("div", Ln, [
            i("div", Sn, [
              r[15] || (r[15] = i("span", { class: "kx-field-lbl" }, [
                B("Endpoint URL "),
                i("span", { class: "kx-field-hint-inline" }, "— hand this to the sender")
              ], -1)),
              i("div", $n, [
                i("code", null, C(p(se)(s.value.webhook_id)), 1),
                i("button", {
                  type: "button",
                  class: "wh-copy",
                  title: "Copy URL",
                  "aria-label": "Copy URL",
                  onClick: r[4] || (r[4] = (u) => Se(p(se)(s.value.webhook_id), "endpoint URL"))
                }, [
                  b(p(w), {
                    icon: "tabler:copy",
                    "aria-hidden": "true"
                  })
                ])
              ])
            ]),
            i("div", En, [
              r[17] || (r[17] = i("span", { class: "kx-field-lbl" }, "Secret", -1)),
              i("div", Dn, [
                i("code", null, [
                  B(C(s.value.secret_prefix || "Not available"), 1),
                  s.value.secret_prefix ? (h(), v("span", zn, "…")) : x("", !0)
                ])
              ]),
              i("p", In, [
                b(p(w), {
                  icon: "tabler:info-circle",
                  "aria-hidden": "true"
                }),
                r[16] || (r[16] = i("span", null, "The full secret is shown only when a webhook is created. To rotate it, revoke this webhook and create a new one.", -1))
              ])
            ]),
            i("dl", Mn, [
              s.value.created_at ? (h(), v(V, { key: 0 }, [
                r[18] || (r[18] = i("dt", null, "Created", -1)),
                i("dd", null, C(p(ye)(s.value.created_at)), 1)
              ], 64)) : x("", !0),
              s.value.last_used_at ? (h(), v(V, { key: 1 }, [
                r[19] || (r[19] = i("dt", null, "Last received", -1)),
                i("dd", null, C(p(ye)(s.value.last_used_at)), 1)
              ], 64)) : x("", !0),
              z(s.value) > 0 ? (h(), v(V, { key: 2 }, [
                r[20] || (r[20] = i("dt", null, "Used by", -1)),
                i("dd", null, C(z(s.value)) + " automation" + C(z(s.value) === 1 ? "" : "s"), 1)
              ], 64)) : x("", !0)
            ]),
            i("label", On, [
              r[21] || (r[21] = i("span", { class: "kx-field-lbl" }, [
                B("Name "),
                i("span", { class: "kx-field-hint-inline" }, "— shown in automation trigger pickers")
              ], -1)),
              Z(i("input", {
                "onUpdate:modelValue": r[5] || (r[5] = (u) => f.value.label = u),
                class: "kx-input",
                type: "text",
                placeholder: "Customer events",
                disabled: s.value.status === "revoked",
                "data-test": "wh-name"
              }, null, 8, An), [
                [Y, f.value.label]
              ])
            ]),
            i("div", Tn, [
              r[23] || (r[23] = i("span", { class: "kx-field-lbl" }, [
                B("Payload schema "),
                i("span", { class: "kx-field-hint-inline" }, "— the fields each inbound request must carry")
              ], -1)),
              b(ze, { schema: g.value }, null, 8, ["schema"]),
              i("div", Bn, [
                i("button", {
                  type: "button",
                  class: D(["wh-toggle", k.value && "is-open"]),
                  onClick: r[6] || (r[6] = (u) => k.value = !k.value)
                }, [
                  b(p(w), {
                    icon: "tabler:chevron-right",
                    "aria-hidden": "true"
                  }),
                  r[22] || (r[22] = B(" Edit as JSON Schema ", -1))
                ], 2),
                k.value ? Z((h(), v("textarea", {
                  key: 0,
                  "onUpdate:modelValue": r[7] || (r[7] = (u) => f.value.schemaText = u),
                  class: "kx-input kx-textarea",
                  spellcheck: "false",
                  disabled: s.value.status === "revoked",
                  "data-test": "wh-schema"
                }, null, 8, Pn)), [
                  [Y, f.value.schemaText]
                ]) : x("", !0)
              ])
            ]),
            m.value ? (h(), v("div", Fn, C(m.value), 1)) : x("", !0)
          ])) : x("", !0)
        ]),
        _: 2
      }, [
        s.value ? {
          name: "header",
          fn: L(() => [
            i("span", Cn, [
              b(p(w), {
                icon: "tabler:webhook",
                "aria-hidden": "true"
              })
            ]),
            i("span", xn, [
              i("span", wn, C(s.value.label || "Webhook"), 1),
              i("span", _n, C($(s.value.webhook_id)), 1)
            ]),
            i("span", {
              class: D(["kx-chip kx-tag-sm", s.value.status === "active" ? "is-active" : "is-revoked"])
            }, C(p(ie)(s.value.status)), 3)
          ]),
          key: "0"
        } : void 0,
        s.value ? {
          name: "footer",
          fn: L(() => [
            s.value.status === "active" ? (h(), F(p(A), {
              key: 0,
              type: "button",
              severity: "danger",
              size: "small",
              class: "kx-foot-spacer",
              label: "Revoke",
              onClick: r[8] || (r[8] = (u) => ae(s.value))
            }, {
              icon: L(({ class: u }) => [
                b(p(w), {
                  icon: "tabler:ban",
                  class: D(u),
                  "aria-hidden": "true"
                }, null, 8, ["class"])
              ]),
              _: 1
            })) : x("", !0),
            b(p(A), {
              type: "button",
              label: "Close",
              severity: "secondary",
              outlined: "",
              onClick: R
            }),
            s.value.status === "active" ? (h(), F(p(A), {
              key: 1,
              type: "button",
              label: "Save changes",
              loading: y.value,
              disabled: y.value,
              "data-test": "wh-save",
              onClick: $e
            }, {
              icon: L(({ class: u }) => [
                b(p(w), {
                  icon: "tabler:device-floppy",
                  class: D(u),
                  "aria-hidden": "true"
                }, null, 8, ["class"])
              ]),
              _: 1
            }, 8, ["loading", "disabled"])) : x("", !0)
          ]),
          key: "1"
        } : void 0
      ]), 1032, ["visible"])
    ]));
  }
});
class jn extends Be {
  static get wippyConfig() {
    return {
      propsSchema: tt.wippy.props,
      hostCssKeys: ["themeConfigUrl", "primeVueCssUrl"],
      inlineCss: Pe
    };
  }
  static get vueConfig() {
    return { rootComponent: Rn, plugins: [nt] };
  }
}
lt(import.meta.url, jn);
//# sourceMappingURL=index.js.map

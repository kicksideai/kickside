import { B as ft, s as Mt, l as Qn, A as si, a as ai, b as Pt, R as eo, c as li, L as Po, d as xe, v as Zt, U as ri, I as lo, e as ui, r as Mo, f as di, g as Eo, h as To, C as ci, i as pi, S as Fo, _ as mi, W as fi, z as Vo, j as Ln, k as nn, T as on, F as bi, M as ro, m as hi, n as vi, Y as gi, o as yi, D as ki, $ as wi, J as Si, p as Wt, q as un, t as mt, u as zn, w as Xt, x as An, K as Rt, y as uo, E as Oe, G as Rn, H as co, N as po, O as $i, P as Pn, Q as Ci, V as Ii, X as _i, Z as xi, a0 as Oi, a1 as Li, a2 as Do, a3 as Jt, a4 as dn, a5 as Bo, a6 as zi, a7 as In, a8 as le, a9 as Ai, aa as Pi, ab as Mi, ac as Ei, ad as Ti, ae as ln, af as cn, ag as Mn, ah as rn, ai as Fi, aj as Vi, ak as Di } from "./styles-Bg84RWD-.js";
import { openBlock as l, createElementBlock as u, mergeProps as Z, createElementVNode as a, renderSlot as ie, createTextVNode as P, toDisplayString as d, resolveComponent as Ce, resolveDirective as to, withDirectives as Be, createBlock as ye, resolveDynamicComponent as pn, withCtx as he, createCommentVNode as f, normalizeClass as ne, computed as q, createVNode as y, Transition as Ro, Fragment as Y, renderList as se, normalizeProps as Bi, createSlots as Ri, withModifiers as _n, defineComponent as Qt, ref as j, watch as Ne, nextTick as mn, onBeforeUnmount as jo, normalizeStyle as jt, onUnmounted as no, onMounted as oo, unref as o, useId as ji, vModelText as xn, vShow as sn, vModelCheckbox as Hi, isRef as At, withKeys as Ui } from "vue";
import { Icon as I } from "@iconify/vue";
import { api as io, loadByTagName as Ho, host as Uo, on as Ni, define as Ki } from "@wippy-fe/proxy";
function Je(...e) {
  if (e) {
    let t = [];
    for (let n = 0; n < e.length; n++) {
      let s = e[n];
      if (!s) continue;
      let i = typeof s;
      if (i === "string" || i === "number") t.push(s);
      else if (i === "object") {
        let r = Array.isArray(s) ? [Je(...s)] : Object.entries(s).map(([p, h]) => h ? p : void 0);
        t = r.length ? t.concat(r.filter((p) => !!p)) : t;
      }
    }
    return t.join(" ").trim();
  }
}
function qi() {
  let e = [], t = (p, h, g = 999) => {
    let k = i(p, h, g), w = k.value + (k.key === p ? 0 : g) + 1;
    return e.push({ key: p, value: w }), w;
  }, n = (p) => {
    e = e.filter((h) => h.value !== p);
  }, s = (p, h) => i(p).value, i = (p, h, g = 0) => [...e].reverse().find((k) => !0) || { key: p, value: g }, r = (p) => p && parseInt(p.style.zIndex, 10) || 0;
  return { get: r, set: (p, h, g) => {
    h && (h.style.zIndex = String(t(p, !0, g)));
  }, clear: (p) => {
    p && (n(r(p)), p.style.zIndex = "");
  }, getCurrent: (p) => s(p) };
}
var Yt = qi(), Gi = `
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
`, Wi = ft.extend({
  name: "baseicon",
  css: Gi
});
function fn(e) {
  "@babel/helpers - typeof";
  return fn = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, fn(e);
}
function mo(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var s = Object.getOwnPropertySymbols(e);
    t && (s = s.filter(function(i) {
      return Object.getOwnPropertyDescriptor(e, i).enumerable;
    })), n.push.apply(n, s);
  }
  return n;
}
function fo(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? mo(Object(n), !0).forEach(function(s) {
      Zi(e, s, n[s]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : mo(Object(n)).forEach(function(s) {
      Object.defineProperty(e, s, Object.getOwnPropertyDescriptor(n, s));
    });
  }
  return e;
}
function Zi(e, t, n) {
  return (t = Yi(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Yi(e) {
  var t = Xi(e, "string");
  return fn(t) == "symbol" ? t : t + "";
}
function Xi(e, t) {
  if (fn(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var s = n.call(e, t);
    if (fn(s) != "object") return s;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var Et = {
  name: "BaseIcon",
  extends: Mt,
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
  style: Wi,
  provide: function() {
    return {
      $pcIcon: this,
      $parentInstance: this
    };
  },
  methods: {
    pti: function() {
      var t = Qn(this.label);
      return fo(fo({}, !this.isUnstyled && {
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
function bn(e) {
  "@babel/helpers - typeof";
  return bn = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, bn(e);
}
function Ji(e, t) {
  if (!(e instanceof t)) throw new TypeError("Cannot call a class as a function");
}
function Qi(e, t) {
  for (var n = 0; n < t.length; n++) {
    var s = t[n];
    s.enumerable = s.enumerable || !1, s.configurable = !0, "value" in s && (s.writable = !0), Object.defineProperty(e, ts(s.key), s);
  }
}
function es(e, t, n) {
  return t && Qi(e.prototype, t), Object.defineProperty(e, "prototype", { writable: !1 }), e;
}
function ts(e) {
  var t = ns(e, "string");
  return bn(t) == "symbol" ? t : t + "";
}
function ns(e, t) {
  if (bn(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var s = n.call(e, t);
    if (bn(s) != "object") return s;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return String(e);
}
var os = /* @__PURE__ */ (function() {
  function e(t) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : function() {
    };
    Ji(this, e), this.element = t, this.listener = n;
  }
  return es(e, [{
    key: "bindScrollListener",
    value: function() {
      this.scrollableParents = si(this.element);
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
})(), is = ai(), so = {
  name: "TimesIcon",
  extends: Et
};
function ss(e) {
  return us(e) || rs(e) || ls(e) || as();
}
function as() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function ls(e, t) {
  if (e) {
    if (typeof e == "string") return jn(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? jn(e, t) : void 0;
  }
}
function rs(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function us(e) {
  if (Array.isArray(e)) return jn(e);
}
function jn(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, s = Array(t); n < t; n++) s[n] = e[n];
  return s;
}
function ds(e, t, n, s, i, r) {
  return l(), u("svg", Z({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), ss(t[0] || (t[0] = [a("path", {
    d: "M8.01186 7.00933L12.27 2.75116C12.341 2.68501 12.398 2.60524 12.4375 2.51661C12.4769 2.42798 12.4982 2.3323 12.4999 2.23529C12.5016 2.13827 12.4838 2.0419 12.4474 1.95194C12.4111 1.86197 12.357 1.78024 12.2884 1.71163C12.2198 1.64302 12.138 1.58893 12.0481 1.55259C11.9581 1.51625 11.8617 1.4984 11.7647 1.50011C11.6677 1.50182 11.572 1.52306 11.4834 1.56255C11.3948 1.60204 11.315 1.65898 11.2488 1.72997L6.99067 5.98814L2.7325 1.72997C2.59553 1.60234 2.41437 1.53286 2.22718 1.53616C2.03999 1.53946 1.8614 1.61529 1.72901 1.74767C1.59663 1.88006 1.5208 2.05865 1.5175 2.24584C1.5142 2.43303 1.58368 2.61419 1.71131 2.75116L5.96948 7.00933L1.71131 11.2675C1.576 11.403 1.5 11.5866 1.5 11.7781C1.5 11.9696 1.576 12.1532 1.71131 12.2887C1.84679 12.424 2.03043 12.5 2.2219 12.5C2.41338 12.5 2.59702 12.424 2.7325 12.2887L6.99067 8.03052L11.2488 12.2887C11.3843 12.424 11.568 12.5 11.7594 12.5C11.9509 12.5 12.1346 12.424 12.27 12.2887C12.4053 12.1532 12.4813 11.9696 12.4813 11.7781C12.4813 11.5866 12.4053 11.403 12.27 11.2675L8.01186 7.00933Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
so.render = ds;
var No = {
  name: "WindowMaximizeIcon",
  extends: Et
};
function cs(e) {
  return bs(e) || fs(e) || ms(e) || ps();
}
function ps() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function ms(e, t) {
  if (e) {
    if (typeof e == "string") return Hn(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Hn(e, t) : void 0;
  }
}
function fs(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function bs(e) {
  if (Array.isArray(e)) return Hn(e);
}
function Hn(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, s = Array(t); n < t; n++) s[n] = e[n];
  return s;
}
function hs(e, t, n, s, i, r) {
  return l(), u("svg", Z({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), cs(t[0] || (t[0] = [a("path", {
    "fill-rule": "evenodd",
    "clip-rule": "evenodd",
    d: "M7 14H11.8C12.3835 14 12.9431 13.7682 13.3556 13.3556C13.7682 12.9431 14 12.3835 14 11.8V2.2C14 1.61652 13.7682 1.05694 13.3556 0.644365C12.9431 0.231785 12.3835 0 11.8 0H2.2C1.61652 0 1.05694 0.231785 0.644365 0.644365C0.231785 1.05694 0 1.61652 0 2.2V7C0 7.15913 0.063214 7.31174 0.175736 7.42426C0.288258 7.53679 0.44087 7.6 0.6 7.6C0.75913 7.6 0.911742 7.53679 1.02426 7.42426C1.13679 7.31174 1.2 7.15913 1.2 7V2.2C1.2 1.93478 1.30536 1.68043 1.49289 1.49289C1.68043 1.30536 1.93478 1.2 2.2 1.2H11.8C12.0652 1.2 12.3196 1.30536 12.5071 1.49289C12.6946 1.68043 12.8 1.93478 12.8 2.2V11.8C12.8 12.0652 12.6946 12.3196 12.5071 12.5071C12.3196 12.6946 12.0652 12.8 11.8 12.8H7C6.84087 12.8 6.68826 12.8632 6.57574 12.9757C6.46321 13.0883 6.4 13.2409 6.4 13.4C6.4 13.5591 6.46321 13.7117 6.57574 13.8243C6.68826 13.9368 6.84087 14 7 14ZM9.77805 7.42192C9.89013 7.534 10.0415 7.59788 10.2 7.59995C10.3585 7.59788 10.5099 7.534 10.622 7.42192C10.7341 7.30985 10.798 7.15844 10.8 6.99995V3.94242C10.8066 3.90505 10.8096 3.86689 10.8089 3.82843C10.8079 3.77159 10.7988 3.7157 10.7824 3.6623C10.756 3.55552 10.701 3.45698 10.622 3.37798C10.5099 3.2659 10.3585 3.20202 10.2 3.19995H7.00002C6.84089 3.19995 6.68828 3.26317 6.57576 3.37569C6.46324 3.48821 6.40002 3.64082 6.40002 3.79995C6.40002 3.95908 6.46324 4.11169 6.57576 4.22422C6.68828 4.33674 6.84089 4.39995 7.00002 4.39995H8.80006L6.19997 7.00005C6.10158 7.11005 6.04718 7.25246 6.04718 7.40005C6.04718 7.54763 6.10158 7.69004 6.19997 7.80005C6.30202 7.91645 6.44561 7.98824 6.59997 8.00005C6.75432 7.98824 6.89791 7.91645 6.99997 7.80005L9.60002 5.26841V6.99995C9.6021 7.15844 9.66598 7.30985 9.77805 7.42192ZM1.4 14H3.8C4.17066 13.9979 4.52553 13.8498 4.78763 13.5877C5.04973 13.3256 5.1979 12.9707 5.2 12.6V10.2C5.1979 9.82939 5.04973 9.47452 4.78763 9.21242C4.52553 8.95032 4.17066 8.80215 3.8 8.80005H1.4C1.02934 8.80215 0.674468 8.95032 0.412371 9.21242C0.150274 9.47452 0.00210008 9.82939 0 10.2V12.6C0.00210008 12.9707 0.150274 13.3256 0.412371 13.5877C0.674468 13.8498 1.02934 13.9979 1.4 14ZM1.25858 10.0586C1.29609 10.0211 1.34696 10 1.4 10H3.8C3.85304 10 3.90391 10.0211 3.94142 10.0586C3.97893 10.0961 4 10.147 4 10.2V12.6C4 12.6531 3.97893 12.704 3.94142 12.7415C3.90391 12.779 3.85304 12.8 3.8 12.8H1.4C1.34696 12.8 1.29609 12.779 1.25858 12.7415C1.22107 12.704 1.2 12.6531 1.2 12.6V10.2C1.2 10.147 1.22107 10.0961 1.25858 10.0586Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
No.render = hs;
var Ko = {
  name: "WindowMinimizeIcon",
  extends: Et
};
function vs(e) {
  return ws(e) || ks(e) || ys(e) || gs();
}
function gs() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function ys(e, t) {
  if (e) {
    if (typeof e == "string") return Un(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Un(e, t) : void 0;
  }
}
function ks(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function ws(e) {
  if (Array.isArray(e)) return Un(e);
}
function Un(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, s = Array(t); n < t; n++) s[n] = e[n];
  return s;
}
function Ss(e, t, n, s, i, r) {
  return l(), u("svg", Z({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), vs(t[0] || (t[0] = [a("path", {
    "fill-rule": "evenodd",
    "clip-rule": "evenodd",
    d: "M11.8 0H2.2C1.61652 0 1.05694 0.231785 0.644365 0.644365C0.231785 1.05694 0 1.61652 0 2.2V7C0 7.15913 0.063214 7.31174 0.175736 7.42426C0.288258 7.53679 0.44087 7.6 0.6 7.6C0.75913 7.6 0.911742 7.53679 1.02426 7.42426C1.13679 7.31174 1.2 7.15913 1.2 7V2.2C1.2 1.93478 1.30536 1.68043 1.49289 1.49289C1.68043 1.30536 1.93478 1.2 2.2 1.2H11.8C12.0652 1.2 12.3196 1.30536 12.5071 1.49289C12.6946 1.68043 12.8 1.93478 12.8 2.2V11.8C12.8 12.0652 12.6946 12.3196 12.5071 12.5071C12.3196 12.6946 12.0652 12.8 11.8 12.8H7C6.84087 12.8 6.68826 12.8632 6.57574 12.9757C6.46321 13.0883 6.4 13.2409 6.4 13.4C6.4 13.5591 6.46321 13.7117 6.57574 13.8243C6.68826 13.9368 6.84087 14 7 14H11.8C12.3835 14 12.9431 13.7682 13.3556 13.3556C13.7682 12.9431 14 12.3835 14 11.8V2.2C14 1.61652 13.7682 1.05694 13.3556 0.644365C12.9431 0.231785 12.3835 0 11.8 0ZM6.368 7.952C6.44137 7.98326 6.52025 7.99958 6.6 8H9.8C9.95913 8 10.1117 7.93678 10.2243 7.82426C10.3368 7.71174 10.4 7.55913 10.4 7.4C10.4 7.24087 10.3368 7.08826 10.2243 6.97574C10.1117 6.86321 9.95913 6.8 9.8 6.8H8.048L10.624 4.224C10.73 4.11026 10.7877 3.95982 10.7849 3.80438C10.7822 3.64894 10.7192 3.50063 10.6093 3.3907C10.4994 3.28077 10.3511 3.2178 10.1956 3.21506C10.0402 3.21232 9.88974 3.27002 9.776 3.376L7.2 5.952V4.2C7.2 4.04087 7.13679 3.88826 7.02426 3.77574C6.91174 3.66321 6.75913 3.6 6.6 3.6C6.44087 3.6 6.28826 3.66321 6.17574 3.77574C6.06321 3.88826 6 4.04087 6 4.2V7.4C6.00042 7.47975 6.01674 7.55862 6.048 7.632C6.07656 7.70442 6.11971 7.7702 6.17475 7.82524C6.2298 7.88029 6.29558 7.92344 6.368 7.952ZM1.4 8.80005H3.8C4.17066 8.80215 4.52553 8.95032 4.78763 9.21242C5.04973 9.47452 5.1979 9.82939 5.2 10.2V12.6C5.1979 12.9707 5.04973 13.3256 4.78763 13.5877C4.52553 13.8498 4.17066 13.9979 3.8 14H1.4C1.02934 13.9979 0.674468 13.8498 0.412371 13.5877C0.150274 13.3256 0.00210008 12.9707 0 12.6V10.2C0.00210008 9.82939 0.150274 9.47452 0.412371 9.21242C0.674468 8.95032 1.02934 8.80215 1.4 8.80005ZM3.94142 12.7415C3.97893 12.704 4 12.6531 4 12.6V10.2C4 10.147 3.97893 10.0961 3.94142 10.0586C3.90391 10.0211 3.85304 10 3.8 10H1.4C1.34696 10 1.29609 10.0211 1.25858 10.0586C1.22107 10.0961 1.2 10.147 1.2 10.2V12.6C1.2 12.6531 1.22107 12.704 1.25858 12.7415C1.29609 12.779 1.34696 12.8 1.4 12.8H3.8C3.85304 12.8 3.90391 12.779 3.94142 12.7415Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
Ko.render = Ss;
var Tn = {
  name: "SpinnerIcon",
  extends: Et
};
function $s(e) {
  return xs(e) || _s(e) || Is(e) || Cs();
}
function Cs() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Is(e, t) {
  if (e) {
    if (typeof e == "string") return Nn(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Nn(e, t) : void 0;
  }
}
function _s(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function xs(e) {
  if (Array.isArray(e)) return Nn(e);
}
function Nn(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, s = Array(t); n < t; n++) s[n] = e[n];
  return s;
}
function Os(e, t, n, s, i, r) {
  return l(), u("svg", Z({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), $s(t[0] || (t[0] = [a("path", {
    d: "M6.99701 14C5.85441 13.999 4.72939 13.7186 3.72012 13.1832C2.71084 12.6478 1.84795 11.8737 1.20673 10.9284C0.565504 9.98305 0.165424 8.89526 0.041387 7.75989C-0.0826496 6.62453 0.073125 5.47607 0.495122 4.4147C0.917119 3.35333 1.59252 2.4113 2.46241 1.67077C3.33229 0.930247 4.37024 0.413729 5.4857 0.166275C6.60117 -0.0811796 7.76026 -0.0520535 8.86188 0.251112C9.9635 0.554278 10.9742 1.12227 11.8057 1.90555C11.915 2.01493 11.9764 2.16319 11.9764 2.31778C11.9764 2.47236 11.915 2.62062 11.8057 2.73C11.7521 2.78503 11.688 2.82877 11.6171 2.85864C11.5463 2.8885 11.4702 2.90389 11.3933 2.90389C11.3165 2.90389 11.2404 2.8885 11.1695 2.85864C11.0987 2.82877 11.0346 2.78503 10.9809 2.73C9.9998 1.81273 8.73246 1.26138 7.39226 1.16876C6.05206 1.07615 4.72086 1.44794 3.62279 2.22152C2.52471 2.99511 1.72683 4.12325 1.36345 5.41602C1.00008 6.70879 1.09342 8.08723 1.62775 9.31926C2.16209 10.5513 3.10478 11.5617 4.29713 12.1803C5.48947 12.7989 6.85865 12.988 8.17414 12.7157C9.48963 12.4435 10.6711 11.7264 11.5196 10.6854C12.3681 9.64432 12.8319 8.34282 12.8328 7C12.8328 6.84529 12.8943 6.69692 13.0038 6.58752C13.1132 6.47812 13.2616 6.41667 13.4164 6.41667C13.5712 6.41667 13.7196 6.47812 13.8291 6.58752C13.9385 6.69692 14 6.84529 14 7C14 8.85651 13.2622 10.637 11.9489 11.9497C10.6356 13.2625 8.85432 14 6.99701 14Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
Tn.render = Os;
var Ls = `
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
`, zs = {
  root: function(t) {
    var n = t.props, s = t.instance;
    return ["p-badge p-component", {
      "p-badge-circle": Pt(n.value) && String(n.value).length === 1,
      "p-badge-dot": Qn(n.value) && !s.$slots.default,
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
}, As = ft.extend({
  name: "badge",
  style: Ls,
  classes: zs
}), Ps = {
  name: "BaseBadge",
  extends: Mt,
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
  style: As,
  provide: function() {
    return {
      $pcBadge: this,
      $parentInstance: this
    };
  }
};
function hn(e) {
  "@babel/helpers - typeof";
  return hn = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, hn(e);
}
function bo(e, t, n) {
  return (t = Ms(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Ms(e) {
  var t = Es(e, "string");
  return hn(t) == "symbol" ? t : t + "";
}
function Es(e, t) {
  if (hn(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var s = n.call(e, t);
    if (hn(s) != "object") return s;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var qo = {
  name: "Badge",
  extends: Ps,
  inheritAttrs: !1,
  computed: {
    dataP: function() {
      return Je(bo(bo({
        circle: this.value != null && String(this.value).length === 1,
        empty: this.value == null && !this.$slots.default
      }, this.severity, this.severity), this.size, this.size));
    }
  }
}, Ts = ["data-p"];
function Fs(e, t, n, s, i, r) {
  return l(), u("span", Z({
    class: e.cx("root"),
    "data-p": r.dataP
  }, e.ptmi("root")), [ie(e.$slots, "default", {}, function() {
    return [P(d(e.value), 1)];
  })], 16, Ts);
}
qo.render = Fs;
var Vs = `
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
function vn(e) {
  "@babel/helpers - typeof";
  return vn = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, vn(e);
}
function pt(e, t, n) {
  return (t = Ds(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Ds(e) {
  var t = Bs(e, "string");
  return vn(t) == "symbol" ? t : t + "";
}
function Bs(e, t) {
  if (vn(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var s = n.call(e, t);
    if (vn(s) != "object") return s;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var Rs = {
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
}, js = ft.extend({
  name: "button",
  style: Vs,
  classes: Rs
}), Hs = {
  name: "BaseButton",
  extends: Mt,
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
  style: js,
  provide: function() {
    return {
      $pcButton: this,
      $parentInstance: this
    };
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
function Pe(e, t, n) {
  return (t = Us(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Us(e) {
  var t = Ns(e, "string");
  return gn(t) == "symbol" ? t : t + "";
}
function Ns(e, t) {
  if (gn(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var s = n.call(e, t);
    if (gn(s) != "object") return s;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var ao = {
  name: "Button",
  extends: Hs,
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
      return Z(this.asAttrs, this.a11yAttrs, this.getPTOptions("root"));
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
      return Qn(this.fluid) ? !!this.$pcFluid : this.fluid;
    },
    dataP: function() {
      return Je(Pe(Pe(Pe(Pe(Pe(Pe(Pe(Pe(Pe(Pe({}, this.size, this.size), "icon-only", this.hasIcon && !this.label && !this.badge), "loading", this.loading), "fluid", this.hasFluid), "rounded", this.rounded), "raised", this.raised), "outlined", this.outlined || this.variant === "outlined"), "text", this.text || this.variant === "text"), "link", this.link || this.variant === "link"), "vertical", (this.iconPos === "top" || this.iconPos === "bottom") && this.label));
    },
    dataIconP: function() {
      return Je(Pe(Pe({}, this.iconPos, this.iconPos), this.size, this.size));
    },
    dataLabelP: function() {
      return Je(Pe(Pe({}, this.size, this.size), "icon-only", this.hasIcon && !this.label && !this.badge));
    }
  },
  components: {
    SpinnerIcon: Tn,
    Badge: qo
  },
  directives: {
    ripple: eo
  }
}, Ks = ["data-p"], qs = ["data-p"];
function Gs(e, t, n, s, i, r) {
  var p = Ce("SpinnerIcon"), h = Ce("Badge"), g = to("ripple");
  return e.asChild ? ie(e.$slots, "default", {
    key: 1,
    class: ne(e.cx("root")),
    a11yAttrs: r.a11yAttrs
  }) : Be((l(), ye(pn(e.as), Z({
    key: 0,
    class: e.cx("root"),
    "data-p": r.dataP
  }, r.attrs), {
    default: he(function() {
      return [ie(e.$slots, "default", {}, function() {
        return [e.loading ? ie(e.$slots, "loadingicon", Z({
          key: 0,
          class: [e.cx("loadingIcon"), e.cx("icon")]
        }, e.ptm("loadingIcon")), function() {
          return [e.loadingIcon ? (l(), u("span", Z({
            key: 0,
            class: [e.cx("loadingIcon"), e.cx("icon"), e.loadingIcon]
          }, e.ptm("loadingIcon")), null, 16)) : (l(), ye(p, Z({
            key: 1,
            class: [e.cx("loadingIcon"), e.cx("icon")],
            spin: ""
          }, e.ptm("loadingIcon")), null, 16, ["class"]))];
        }) : ie(e.$slots, "icon", Z({
          key: 1,
          class: [e.cx("icon")]
        }, e.ptm("icon")), function() {
          return [e.icon ? (l(), u("span", Z({
            key: 0,
            class: [e.cx("icon"), e.icon, e.iconClass],
            "data-p": r.dataIconP
          }, e.ptm("icon")), null, 16, Ks)) : f("", !0)];
        }), e.label ? (l(), u("span", Z({
          key: 2,
          class: e.cx("label")
        }, e.ptm("label"), {
          "data-p": r.dataLabelP
        }), d(e.label), 17, qs)) : f("", !0), e.badge ? (l(), ye(h, {
          key: 3,
          value: e.badge,
          class: ne(e.badgeClass),
          severity: e.badgeSeverity,
          unstyled: e.unstyled,
          pt: e.ptm("pcBadge")
        }, null, 8, ["value", "class", "severity", "unstyled", "pt"])) : f("", !0)];
      })];
    }),
    _: 3
  }, 16, ["class", "data-p"])), [[g]]);
}
ao.render = Gs;
var Ws = ft.extend({
  name: "focustrap-directive"
}), Zs = li.extend({
  style: Ws
});
function yn(e) {
  "@babel/helpers - typeof";
  return yn = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, yn(e);
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
function vo(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? ho(Object(n), !0).forEach(function(s) {
      Ys(e, s, n[s]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : ho(Object(n)).forEach(function(s) {
      Object.defineProperty(e, s, Object.getOwnPropertyDescriptor(n, s));
    });
  }
  return e;
}
function Ys(e, t, n) {
  return (t = Xs(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Xs(e) {
  var t = Js(e, "string");
  return yn(t) == "symbol" ? t : t + "";
}
function Js(e, t) {
  if (yn(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var s = n.call(e, t);
    if (yn(s) != "object") return s;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var Qs = Zs.extend("focustrap", {
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
      var s = this, i = n.value || {}, r = i.onFocusIn, p = i.onFocusOut;
      t.$_pfocustrap_mutationobserver = new MutationObserver(function(h) {
        h.forEach(function(g) {
          if (g.type === "childList" && !t.contains(document.activeElement)) {
            var k = function(_) {
              var E = lo(_) ? lo(_, s.getComputedSelector(t.$_pfocustrap_focusableselector)) ? _ : Zt(t, s.getComputedSelector(t.$_pfocustrap_focusableselector)) : Zt(_);
              return Pt(E) ? E : _.nextSibling && k(_.nextSibling);
            };
            xe(k(g.nextSibling));
          }
        });
      }), t.$_pfocustrap_mutationobserver.disconnect(), t.$_pfocustrap_mutationobserver.observe(t, {
        childList: !0
      }), t.$_pfocustrap_focusinlistener = function(h) {
        return r && r(h);
      }, t.$_pfocustrap_focusoutlistener = function(h) {
        return p && p(h);
      }, t.addEventListener("focusin", t.$_pfocustrap_focusinlistener), t.addEventListener("focusout", t.$_pfocustrap_focusoutlistener);
    },
    unbind: function(t) {
      t.$_pfocustrap_mutationobserver && t.$_pfocustrap_mutationobserver.disconnect(), t.$_pfocustrap_focusinlistener && t.removeEventListener("focusin", t.$_pfocustrap_focusinlistener) && (t.$_pfocustrap_focusinlistener = null), t.$_pfocustrap_focusoutlistener && t.removeEventListener("focusout", t.$_pfocustrap_focusoutlistener) && (t.$_pfocustrap_focusoutlistener = null);
    },
    autoFocus: function(t) {
      this.autoElementFocus(this.$el, {
        value: vo(vo({}, t), {}, {
          autoFocus: !0
        })
      });
    },
    autoElementFocus: function(t, n) {
      var s = n.value || {}, i = s.autoFocusSelector, r = i === void 0 ? "" : i, p = s.firstFocusableSelector, h = p === void 0 ? "" : p, g = s.autoFocus, k = g === void 0 ? !1 : g, w = Zt(t, "[autofocus]".concat(this.getComputedSelector(r)));
      k && !w && (w = Zt(t, this.getComputedSelector(h))), xe(w);
    },
    onFirstHiddenElementFocus: function(t) {
      var n, s = t.currentTarget, i = t.relatedTarget, r = i === s.$_pfocustrap_lasthiddenfocusableelement || !((n = this.$el) !== null && n !== void 0 && n.contains(i)) ? Zt(s.parentElement, this.getComputedSelector(s.$_pfocustrap_focusableselector)) : s.$_pfocustrap_lasthiddenfocusableelement;
      xe(r);
    },
    onLastHiddenElementFocus: function(t) {
      var n, s = t.currentTarget, i = t.relatedTarget, r = i === s.$_pfocustrap_firsthiddenfocusableelement || !((n = this.$el) !== null && n !== void 0 && n.contains(i)) ? Po(s.parentElement, this.getComputedSelector(s.$_pfocustrap_focusableselector)) : s.$_pfocustrap_firsthiddenfocusableelement;
      xe(r);
    },
    createHiddenFocusableElements: function(t, n) {
      var s = this, i = n.value || {}, r = i.tabIndex, p = r === void 0 ? 0 : r, h = i.firstFocusableSelector, g = h === void 0 ? "" : h, k = i.lastFocusableSelector, w = k === void 0 ? "" : k, _ = function(H) {
        return ri("span", {
          class: "p-hidden-accessible p-hidden-focusable",
          tabIndex: p,
          role: "presentation",
          "aria-hidden": !0,
          "data-p-hidden-accessible": !0,
          "data-p-hidden-focusable": !0,
          onFocus: H?.bind(s)
        });
      }, E = _(this.onFirstHiddenElementFocus), R = _(this.onLastHiddenElementFocus);
      E.$_pfocustrap_lasthiddenfocusableelement = R, E.$_pfocustrap_focusableselector = g, E.setAttribute("data-pc-section", "firstfocusableelement"), R.$_pfocustrap_firsthiddenfocusableelement = E, R.$_pfocustrap_focusableselector = w, R.setAttribute("data-pc-section", "lastfocusableelement"), t.prepend(E), t.append(R);
    }
  }
});
function go() {
  di({
    variableName: Mo("scrollbar.width").name
  });
}
function yo() {
  ui({
    variableName: Mo("scrollbar.width").name
  });
}
var ea = `
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
`, ta = {
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
}, na = {
  mask: function(t) {
    var n = t.props, s = ["left", "right", "top", "topleft", "topright", "bottom", "bottomleft", "bottomright"], i = s.find(function(r) {
      return r === n.position;
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
}, oa = ft.extend({
  name: "dialog",
  style: ea,
  classes: na,
  inlineStyles: ta
}), ia = {
  name: "BaseDialog",
  extends: Mt,
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
  style: oa,
  provide: function() {
    return {
      $pcDialog: this,
      $parentInstance: this
    };
  }
}, Go = {
  name: "Dialog",
  extends: ia,
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
    this.unbindDocumentState(), this.unbindGlobalListeners(), this.destroyStyle(), this.mask && this.autoZIndex && Yt.clear(this.mask), this.container = null, this.mask = null;
  },
  mounted: function() {
    this.breakpoints && this.createStyle();
  },
  methods: {
    close: function() {
      this.$emit("update:visible", !1);
    },
    onEnter: function() {
      this.$emit("show"), this.target = document.activeElement, this.enableDocumentSettings(), this.bindGlobalListeners(), this.autoZIndex && Yt.set("modal", this.mask, this.baseZIndex || this.$primevue.config.zIndex.modal);
    },
    onAfterEnter: function() {
      this.focus();
    },
    onBeforeLeave: function() {
      this.modal && !this.isUnstyled && fi(this.mask, "p-overlay-mask-leave-active"), this.dragging && this.documentDragEndListener && this.documentDragEndListener();
    },
    onLeave: function() {
      this.$emit("hide"), xe(this.target), this.target = null, this.focusableClose = null, this.focusableMax = null;
    },
    onAfterLeave: function() {
      this.autoZIndex && Yt.clear(this.mask), this.containerVisible = !1, this.unbindDocumentState(), this.unbindGlobalListeners(), this.$emit("after-hide");
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
      n || (n = this.$slots.header && t(this.headerContainer), n || (n = this.$slots.default && t(this.content), n || (this.maximizable ? (this.focusableMax = !0, n = this.maximizableButton) : (this.focusableClose = !0, n = this.closeButton)))), n && xe(n, {
        focusVisible: !0
      });
    },
    maximize: function(t) {
      this.maximized ? (this.maximized = !1, this.$emit("unmaximize", t)) : (this.maximized = !0, this.$emit("maximize", t)), this.modal || (this.maximized ? go() : yo());
    },
    enableDocumentSettings: function() {
      (this.modal || !this.modal && this.blockScroll || this.maximizable && this.maximized) && go();
    },
    unbindDocumentState: function() {
      (this.modal || !this.modal && this.blockScroll || this.maximizable && this.maximized) && yo();
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
        this.styleElement = document.createElement("style"), this.styleElement.type = "text/css", mi(this.styleElement, "nonce", (t = this.$primevue) === null || t === void 0 || (t = t.config) === null || t === void 0 || (t = t.csp) === null || t === void 0 ? void 0 : t.nonce), document.head.appendChild(this.styleElement);
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
      t.target.closest("div").getAttribute("data-pc-section") !== "headeractions" && this.draggable && (this.dragging = !0, this.lastPageX = t.pageX, this.lastPageY = t.pageY, this.container.style.margin = "0", document.body.setAttribute("data-p-unselectable-text", "true"), !this.isUnstyled && Fo(document.body, {
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
          var s = To(t.container), i = ci(t.container), r = n.pageX - t.lastPageX, p = n.pageY - t.lastPageY, h = t.container.getBoundingClientRect(), g = h.left + r, k = h.top + p, w = pi(), _ = getComputedStyle(t.container), E = parseFloat(_.marginLeft), R = parseFloat(_.marginTop);
          t.container.style.position = "fixed", t.keepInViewport ? (g >= t.minX && g + s < w.width && (t.lastPageX = n.pageX, t.container.style.left = g - E + "px"), k >= t.minY && k + i < w.height && (t.lastPageY = n.pageY, t.container.style.top = k - R + "px")) : (t.lastPageX = n.pageX, t.container.style.left = g - E + "px", t.lastPageY = n.pageY, t.container.style.top = k - R + "px");
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
      return Je({
        maximized: this.maximized,
        modal: this.modal
      });
    }
  },
  directives: {
    ripple: eo,
    focustrap: Qs
  },
  components: {
    Button: ao,
    Portal: Eo,
    WindowMinimizeIcon: Ko,
    WindowMaximizeIcon: No,
    TimesIcon: so
  }
};
function kn(e) {
  "@babel/helpers - typeof";
  return kn = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, kn(e);
}
function ko(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var s = Object.getOwnPropertySymbols(e);
    t && (s = s.filter(function(i) {
      return Object.getOwnPropertyDescriptor(e, i).enumerable;
    })), n.push.apply(n, s);
  }
  return n;
}
function wo(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? ko(Object(n), !0).forEach(function(s) {
      sa(e, s, n[s]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : ko(Object(n)).forEach(function(s) {
      Object.defineProperty(e, s, Object.getOwnPropertyDescriptor(n, s));
    });
  }
  return e;
}
function sa(e, t, n) {
  return (t = aa(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function aa(e) {
  var t = la(e, "string");
  return kn(t) == "symbol" ? t : t + "";
}
function la(e, t) {
  if (kn(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var s = n.call(e, t);
    if (kn(s) != "object") return s;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var ra = ["data-p"], ua = ["aria-labelledby", "aria-modal", "data-p"], da = ["id"], ca = ["data-p"];
function pa(e, t, n, s, i, r) {
  var p = Ce("Button"), h = Ce("Portal"), g = to("focustrap");
  return l(), ye(h, {
    appendTo: e.appendTo
  }, {
    default: he(function() {
      return [i.containerVisible ? (l(), u("div", Z({
        key: 0,
        ref: r.maskRef,
        class: e.cx("mask"),
        style: e.sx("mask", !0, {
          position: e.position,
          modal: e.modal
        }),
        onMousedown: t[1] || (t[1] = function() {
          return r.onMaskMouseDown && r.onMaskMouseDown.apply(r, arguments);
        }),
        onMouseup: t[2] || (t[2] = function() {
          return r.onMaskMouseUp && r.onMaskMouseUp.apply(r, arguments);
        }),
        "data-p": r.dataP
      }, e.ptm("mask")), [y(Ro, Z({
        name: "p-dialog",
        onEnter: r.onEnter,
        onAfterEnter: r.onAfterEnter,
        onBeforeLeave: r.onBeforeLeave,
        onLeave: r.onLeave,
        onAfterLeave: r.onAfterLeave,
        appear: ""
      }, e.ptm("transition")), {
        default: he(function() {
          return [e.visible ? Be((l(), u("div", Z({
            key: 0,
            ref: r.containerRef,
            class: e.cx("root"),
            style: e.sx("root"),
            role: "dialog",
            "aria-labelledby": r.ariaLabelledById,
            "aria-modal": e.modal,
            "data-p": r.dataP
          }, e.ptmi("root")), [e.$slots.container ? ie(e.$slots, "container", {
            key: 0,
            closeCallback: r.close,
            maximizeCallback: function(w) {
              return r.maximize(w);
            },
            initDragCallback: r.initDrag
          }) : (l(), u(Y, {
            key: 1
          }, [e.showHeader ? (l(), u("div", Z({
            key: 0,
            ref: r.headerContainerRef,
            class: e.cx("header"),
            onMousedown: t[0] || (t[0] = function() {
              return r.initDrag && r.initDrag.apply(r, arguments);
            })
          }, e.ptm("header")), [ie(e.$slots, "header", {
            class: ne(e.cx("title"))
          }, function() {
            return [e.header ? (l(), u("span", Z({
              key: 0,
              id: r.ariaLabelledById,
              class: e.cx("title")
            }, e.ptm("title")), d(e.header), 17, da)) : f("", !0)];
          }), a("div", Z({
            class: e.cx("headerActions")
          }, e.ptm("headerActions")), [e.maximizable ? ie(e.$slots, "maximizebutton", {
            key: 0,
            maximized: i.maximized,
            maximizeCallback: function(w) {
              return r.maximize(w);
            }
          }, function() {
            return [y(p, Z({
              ref: r.maximizableRef,
              autofocus: i.focusableMax,
              class: e.cx("pcMaximizeButton"),
              onClick: r.maximize,
              tabindex: e.maximizable ? "0" : "-1",
              unstyled: e.unstyled
            }, e.maximizeButtonProps, {
              pt: e.ptm("pcMaximizeButton"),
              "data-pc-group-section": "headericon"
            }), {
              icon: he(function(k) {
                return [ie(e.$slots, "maximizeicon", {
                  maximized: i.maximized
                }, function() {
                  return [(l(), ye(pn(r.maximizeIconComponent), Z({
                    class: [k.class, i.maximized ? e.minimizeIcon : e.maximizeIcon]
                  }, e.ptm("pcMaximizeButton").icon), null, 16, ["class"]))];
                })];
              }),
              _: 3
            }, 16, ["autofocus", "class", "onClick", "tabindex", "unstyled", "pt"])];
          }) : f("", !0), e.closable ? ie(e.$slots, "closebutton", {
            key: 1,
            closeCallback: r.close
          }, function() {
            return [y(p, Z({
              ref: r.closeButtonRef,
              autofocus: i.focusableClose,
              class: e.cx("pcCloseButton"),
              onClick: r.close,
              "aria-label": r.closeAriaLabel,
              unstyled: e.unstyled
            }, e.closeButtonProps, {
              pt: e.ptm("pcCloseButton"),
              "data-pc-group-section": "headericon"
            }), {
              icon: he(function(k) {
                return [ie(e.$slots, "closeicon", {}, function() {
                  return [(l(), ye(pn(e.closeIcon ? "span" : "TimesIcon"), Z({
                    class: [e.closeIcon, k.class]
                  }, e.ptm("pcCloseButton").icon), null, 16, ["class"]))];
                })];
              }),
              _: 3
            }, 16, ["autofocus", "class", "onClick", "aria-label", "unstyled", "pt"])];
          }) : f("", !0)], 16)], 16)) : f("", !0), a("div", Z({
            ref: r.contentRef,
            class: [e.cx("content"), e.contentClass],
            style: e.contentStyle,
            "data-p": r.dataP
          }, wo(wo({}, e.contentProps), e.ptm("content"))), [ie(e.$slots, "default")], 16, ca), e.footer || e.$slots.footer ? (l(), u("div", Z({
            key: 1,
            ref: r.footerContainerRef,
            class: e.cx("footer")
          }, e.ptm("footer")), [ie(e.$slots, "footer", {}, function() {
            return [P(d(e.footer), 1)];
          })], 16)) : f("", !0)], 64))], 16, ua)), [[g, {
            disabled: !e.modal
          }]]) : f("", !0)];
        }),
        _: 3
      }, 16, ["onEnter", "onAfterEnter", "onBeforeLeave", "onLeave", "onAfterLeave"])], 16, ra)) : f("", !0)];
    }),
    _: 3
  }, 8, ["appendTo"]);
}
Go.render = pa;
var Wo = {
  name: "BlankIcon",
  extends: Et
};
function ma(e) {
  return va(e) || ha(e) || ba(e) || fa();
}
function fa() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function ba(e, t) {
  if (e) {
    if (typeof e == "string") return Kn(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Kn(e, t) : void 0;
  }
}
function ha(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function va(e) {
  if (Array.isArray(e)) return Kn(e);
}
function Kn(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, s = Array(t); n < t; n++) s[n] = e[n];
  return s;
}
function ga(e, t, n, s, i, r) {
  return l(), u("svg", Z({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), ma(t[0] || (t[0] = [a("rect", {
    width: "1",
    height: "1",
    fill: "currentColor",
    "fill-opacity": "0"
  }, null, -1)])), 16);
}
Wo.render = ga;
var Zo = {
  name: "CheckIcon",
  extends: Et
};
function ya(e) {
  return $a(e) || Sa(e) || wa(e) || ka();
}
function ka() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function wa(e, t) {
  if (e) {
    if (typeof e == "string") return qn(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? qn(e, t) : void 0;
  }
}
function Sa(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function $a(e) {
  if (Array.isArray(e)) return qn(e);
}
function qn(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, s = Array(t); n < t; n++) s[n] = e[n];
  return s;
}
function Ca(e, t, n, s, i, r) {
  return l(), u("svg", Z({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), ya(t[0] || (t[0] = [a("path", {
    d: "M4.86199 11.5948C4.78717 11.5923 4.71366 11.5745 4.64596 11.5426C4.57826 11.5107 4.51779 11.4652 4.46827 11.4091L0.753985 7.69483C0.683167 7.64891 0.623706 7.58751 0.580092 7.51525C0.536478 7.44299 0.509851 7.36177 0.502221 7.27771C0.49459 7.19366 0.506156 7.10897 0.536046 7.03004C0.565935 6.95111 0.613367 6.88 0.674759 6.82208C0.736151 6.76416 0.8099 6.72095 0.890436 6.69571C0.970973 6.67046 1.05619 6.66385 1.13966 6.67635C1.22313 6.68886 1.30266 6.72017 1.37226 6.76792C1.44186 6.81567 1.4997 6.8786 1.54141 6.95197L4.86199 10.2503L12.6397 2.49483C12.7444 2.42694 12.8689 2.39617 12.9932 2.40745C13.1174 2.41873 13.2343 2.47141 13.3251 2.55705C13.4159 2.64268 13.4753 2.75632 13.4938 2.87973C13.5123 3.00315 13.4888 3.1292 13.4271 3.23768L5.2557 11.4091C5.20618 11.4652 5.14571 11.5107 5.07801 11.5426C5.01031 11.5745 4.9368 11.5923 4.86199 11.5948Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
Zo.render = Ca;
var Yo = {
  name: "ChevronDownIcon",
  extends: Et
};
function Ia(e) {
  return La(e) || Oa(e) || xa(e) || _a();
}
function _a() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function xa(e, t) {
  if (e) {
    if (typeof e == "string") return Gn(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Gn(e, t) : void 0;
  }
}
function Oa(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function La(e) {
  if (Array.isArray(e)) return Gn(e);
}
function Gn(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, s = Array(t); n < t; n++) s[n] = e[n];
  return s;
}
function za(e, t, n, s, i, r) {
  return l(), u("svg", Z({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), Ia(t[0] || (t[0] = [a("path", {
    d: "M7.01744 10.398C6.91269 10.3985 6.8089 10.378 6.71215 10.3379C6.61541 10.2977 6.52766 10.2386 6.45405 10.1641L1.13907 4.84913C1.03306 4.69404 0.985221 4.5065 1.00399 4.31958C1.02276 4.13266 1.10693 3.95838 1.24166 3.82747C1.37639 3.69655 1.55301 3.61742 1.74039 3.60402C1.92777 3.59062 2.11386 3.64382 2.26584 3.75424L7.01744 8.47394L11.769 3.75424C11.9189 3.65709 12.097 3.61306 12.2748 3.62921C12.4527 3.64535 12.6199 3.72073 12.7498 3.84328C12.8797 3.96582 12.9647 4.12842 12.9912 4.30502C13.0177 4.48162 12.9841 4.662 12.8958 4.81724L7.58083 10.1322C7.50996 10.2125 7.42344 10.2775 7.32656 10.3232C7.22968 10.3689 7.12449 10.3944 7.01744 10.398Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
Yo.render = za;
var Xo = {
  name: "SearchIcon",
  extends: Et
};
function Aa(e) {
  return Ta(e) || Ea(e) || Ma(e) || Pa();
}
function Pa() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Ma(e, t) {
  if (e) {
    if (typeof e == "string") return Wn(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Wn(e, t) : void 0;
  }
}
function Ea(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function Ta(e) {
  if (Array.isArray(e)) return Wn(e);
}
function Wn(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, s = Array(t); n < t; n++) s[n] = e[n];
  return s;
}
function Fa(e, t, n, s, i, r) {
  return l(), u("svg", Z({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), Aa(t[0] || (t[0] = [a("path", {
    "fill-rule": "evenodd",
    "clip-rule": "evenodd",
    d: "M2.67602 11.0265C3.6661 11.688 4.83011 12.0411 6.02086 12.0411C6.81149 12.0411 7.59438 11.8854 8.32483 11.5828C8.87005 11.357 9.37808 11.0526 9.83317 10.6803L12.9769 13.8241C13.0323 13.8801 13.0983 13.9245 13.171 13.9548C13.2438 13.985 13.3219 14.0003 13.4007 14C13.4795 14.0003 13.5575 13.985 13.6303 13.9548C13.7031 13.9245 13.7691 13.8801 13.8244 13.8241C13.9367 13.7116 13.9998 13.5592 13.9998 13.4003C13.9998 13.2414 13.9367 13.089 13.8244 12.9765L10.6807 9.8328C11.053 9.37773 11.3573 8.86972 11.5831 8.32452C11.8857 7.59408 12.0414 6.81119 12.0414 6.02056C12.0414 4.8298 11.6883 3.66579 11.0268 2.67572C10.3652 1.68564 9.42494 0.913972 8.32483 0.45829C7.22472 0.00260857 6.01418 -0.116618 4.84631 0.115686C3.67844 0.34799 2.60568 0.921393 1.76369 1.76338C0.921698 2.60537 0.348296 3.67813 0.115991 4.84601C-0.116313 6.01388 0.00291375 7.22441 0.458595 8.32452C0.914277 9.42464 1.68595 10.3649 2.67602 11.0265ZM3.35565 2.0158C4.14456 1.48867 5.07206 1.20731 6.02086 1.20731C7.29317 1.20731 8.51338 1.71274 9.41304 2.6124C10.3127 3.51206 10.8181 4.73226 10.8181 6.00457C10.8181 6.95337 10.5368 7.88088 10.0096 8.66978C9.48251 9.45868 8.73328 10.0736 7.85669 10.4367C6.98011 10.7997 6.01554 10.8947 5.08496 10.7096C4.15439 10.5245 3.2996 10.0676 2.62869 9.39674C1.95778 8.72583 1.50089 7.87104 1.31579 6.94046C1.13068 6.00989 1.22568 5.04532 1.58878 4.16874C1.95187 3.29215 2.56675 2.54292 3.35565 2.0158Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
Xo.render = Fa;
var Va = `
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
`, Da = {
  root: "p-iconfield"
}, Ba = ft.extend({
  name: "iconfield",
  style: Va,
  classes: Da
}), Ra = {
  name: "BaseIconField",
  extends: Mt,
  style: Ba,
  provide: function() {
    return {
      $pcIconField: this,
      $parentInstance: this
    };
  }
}, Jo = {
  name: "IconField",
  extends: Ra,
  inheritAttrs: !1
};
function ja(e, t, n, s, i, r) {
  return l(), u("div", Z({
    class: e.cx("root")
  }, e.ptmi("root")), [ie(e.$slots, "default")], 16);
}
Jo.render = ja;
var Ha = {
  root: "p-inputicon"
}, Ua = ft.extend({
  name: "inputicon",
  classes: Ha
}), Na = {
  name: "BaseInputIcon",
  extends: Mt,
  style: Ua,
  props: {
    class: null
  },
  provide: function() {
    return {
      $pcInputIcon: this,
      $parentInstance: this
    };
  }
}, Qo = {
  name: "InputIcon",
  extends: Na,
  inheritAttrs: !1,
  computed: {
    containerClass: function() {
      return [this.cx("root"), this.class];
    }
  }
};
function Ka(e, t, n, s, i, r) {
  return l(), u("span", Z({
    class: r.containerClass
  }, e.ptmi("root"), {
    "aria-hidden": "true"
  }), [ie(e.$slots, "default")], 16);
}
Qo.render = Ka;
var qa = {
  name: "BaseEditableHolder",
  extends: Mt,
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
      return n.find(Pt);
    }
  },
  computed: {
    $filled: function() {
      return Pt(this.d_value);
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
}, ei = {
  name: "BaseInput",
  extends: qa,
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
}, Ga = `
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
`, Wa = {
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
}, Za = ft.extend({
  name: "inputtext",
  style: Ga,
  classes: Wa
}), Ya = {
  name: "BaseInputText",
  extends: ei,
  style: Za,
  provide: function() {
    return {
      $pcInputText: this,
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
function Xa(e, t, n) {
  return (t = Ja(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Ja(e) {
  var t = Qa(e, "string");
  return wn(t) == "symbol" ? t : t + "";
}
function Qa(e, t) {
  if (wn(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var s = n.call(e, t);
    if (wn(s) != "object") return s;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var ti = {
  name: "InputText",
  extends: Ya,
  inheritAttrs: !1,
  methods: {
    onInput: function(t) {
      this.writeValue(t.target.value, t);
    }
  },
  computed: {
    attrs: function() {
      return Z(this.ptmi("root", {
        context: {
          filled: this.$filled,
          disabled: this.disabled
        }
      }), this.formField);
    },
    dataP: function() {
      return Je(Xa({
        invalid: this.$invalid,
        fluid: this.$fluid,
        filled: this.$variant === "filled"
      }, this.size, this.size));
    }
  }
}, el = ["value", "name", "disabled", "aria-invalid", "data-p"];
function tl(e, t, n, s, i, r) {
  return l(), u("input", Z({
    type: "text",
    class: e.cx("root"),
    value: e.d_value,
    name: e.name,
    disabled: e.disabled,
    "aria-invalid": e.$invalid || void 0,
    "data-p": r.dataP,
    onInput: t[0] || (t[0] = function() {
      return r.onInput && r.onInput.apply(r, arguments);
    })
  }, r.attrs), null, 16, el);
}
ti.render = tl;
var nl = `
    .p-virtualscroller-loader {
        background: dt('virtualscroller.loader.mask.background');
        color: dt('virtualscroller.loader.mask.color');
    }

    .p-virtualscroller-loading-icon {
        font-size: dt('virtualscroller.loader.icon.size');
        width: dt('virtualscroller.loader.icon.size');
        height: dt('virtualscroller.loader.icon.size');
    }
`, ol = `
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
`, So = ft.extend({
  name: "virtualscroller",
  css: ol,
  style: nl
}), il = {
  name: "BaseVirtualScroller",
  extends: Mt,
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
  style: So,
  provide: function() {
    return {
      $pcVirtualScroller: this,
      $parentInstance: this
    };
  },
  beforeMount: function() {
    var t;
    So.loadCSS({
      nonce: (t = this.$primevueConfig) === null || t === void 0 || (t = t.csp) === null || t === void 0 ? void 0 : t.nonce
    });
  }
};
function Sn(e) {
  "@babel/helpers - typeof";
  return Sn = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, Sn(e);
}
function $o(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var s = Object.getOwnPropertySymbols(e);
    t && (s = s.filter(function(i) {
      return Object.getOwnPropertyDescriptor(e, i).enumerable;
    })), n.push.apply(n, s);
  }
  return n;
}
function an(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? $o(Object(n), !0).forEach(function(s) {
      ni(e, s, n[s]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : $o(Object(n)).forEach(function(s) {
      Object.defineProperty(e, s, Object.getOwnPropertyDescriptor(n, s));
    });
  }
  return e;
}
function ni(e, t, n) {
  return (t = sl(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function sl(e) {
  var t = al(e, "string");
  return Sn(t) == "symbol" ? t : t + "";
}
function al(e, t) {
  if (Sn(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var s = n.call(e, t);
    if (Sn(s) != "object") return s;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var oi = {
  name: "VirtualScroller",
  extends: il,
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
      Ln(this.element) && (this.setContentEl(this.content), this.init(), this.calculateAutoSize(), this.defaultWidth = nn(this.element), this.defaultHeight = on(this.element), this.defaultContentWidth = nn(this.content), this.defaultContentHeight = on(this.content), this.initialized = !0), this.element && this.bindResizeListener();
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
      var n = this, s = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "auto", i = this.isBoth(), r = this.isHorizontal(), p = i ? t.every(function(m) {
        return m > -1;
      }) : t > -1;
      if (p) {
        var h = this.first, g = this.element, k = g.scrollTop, w = k === void 0 ? 0 : k, _ = g.scrollLeft, E = _ === void 0 ? 0 : _, R = this.calculateNumItems(), F = R.numToleratedItems, H = this.getContentPosition(), x = this.itemSize, N = function() {
          var $ = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0, L = arguments.length > 1 ? arguments[1] : void 0;
          return $ <= L ? 0 : $;
        }, K = function($, L, ae) {
          return $ * L + ae;
        }, M = function() {
          var $ = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0, L = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0;
          return n.scrollTo({
            left: $,
            top: L,
            behavior: s
          });
        }, D = i ? {
          rows: 0,
          cols: 0
        } : 0, c = !1, Q = !1;
        i ? (D = {
          rows: N(t[0], F[0]),
          cols: N(t[1], F[1])
        }, M(K(D.cols, x[1], H.left), K(D.rows, x[0], H.top)), Q = this.lastScrollPos.top !== w || this.lastScrollPos.left !== E, c = D.rows !== h.rows || D.cols !== h.cols) : (D = N(t, F), r ? M(K(D, x, H.left), w) : M(E, K(D, x, H.top)), Q = this.lastScrollPos !== (r ? E : w), c = D !== h), this.isRangeChanged = c, Q && (this.first = D);
      }
    },
    scrollInView: function(t, n) {
      var s = this, i = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : "auto";
      if (n) {
        var r = this.isBoth(), p = this.isHorizontal(), h = r ? t.every(function(x) {
          return x > -1;
        }) : t > -1;
        if (h) {
          var g = this.getRenderedRange(), k = g.first, w = g.viewport, _ = function() {
            var N = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0, K = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0;
            return s.scrollTo({
              left: N,
              top: K,
              behavior: i
            });
          }, E = n === "to-start", R = n === "to-end";
          if (E) {
            if (r)
              w.first.rows - k.rows > t[0] ? _(w.first.cols * this.itemSize[1], (w.first.rows - 1) * this.itemSize[0]) : w.first.cols - k.cols > t[1] && _((w.first.cols - 1) * this.itemSize[1], w.first.rows * this.itemSize[0]);
            else if (w.first - k > t) {
              var F = (w.first - 1) * this.itemSize;
              p ? _(F, 0) : _(0, F);
            }
          } else if (R) {
            if (r)
              w.last.rows - k.rows <= t[0] + 1 ? _(w.first.cols * this.itemSize[1], (w.first.rows + 1) * this.itemSize[0]) : w.last.cols - k.cols <= t[1] + 1 && _((w.first.cols + 1) * this.itemSize[1], w.first.rows * this.itemSize[0]);
            else if (w.last - k <= t + 1) {
              var H = (w.first + 1) * this.itemSize;
              p ? _(H, 0) : _(0, H);
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
        var i = this.isBoth(), r = this.isHorizontal(), p = this.element, h = p.scrollTop, g = p.scrollLeft;
        if (i)
          n = {
            rows: t(h, this.itemSize[0]),
            cols: t(g, this.itemSize[1])
          }, s = {
            rows: n.rows + this.numItemsInViewport.rows,
            cols: n.cols + this.numItemsInViewport.cols
          };
        else {
          var k = r ? g : h;
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
      var t = this.isBoth(), n = this.isHorizontal(), s = this.itemSize, i = this.getContentPosition(), r = this.element ? this.element.offsetWidth - i.left : 0, p = this.element ? this.element.offsetHeight - i.top : 0, h = function(E, R) {
        return Math.ceil(E / (R || E));
      }, g = function(E) {
        return Math.ceil(E / 2);
      }, k = t ? {
        rows: h(p, s[0]),
        cols: h(r, s[1])
      } : h(n ? r : p, s), w = this.d_numToleratedItems || (t ? [g(k.rows), g(k.cols)] : g(k));
      return {
        numItemsInViewport: k,
        numToleratedItems: w
      };
    },
    calculateOptions: function() {
      var t = this, n = this.isBoth(), s = this.first, i = this.calculateNumItems(), r = i.numItemsInViewport, p = i.numToleratedItems, h = function(w, _, E) {
        var R = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : !1;
        return t.getLast(w + _ + (w < E ? 2 : 3) * E, R);
      }, g = n ? {
        rows: h(s.rows, r.rows, p[0]),
        cols: h(s.cols, r.cols, p[1], !0)
      } : h(s, r, p);
      this.last = g, this.numItemsInViewport = r, this.d_numToleratedItems = p, this.$emit("update:numToleratedItems", this.d_numToleratedItems), this.showLoader && (this.loaderArr = n ? Array.from({
        length: r.rows
      }).map(function() {
        return Array.from({
          length: r.cols
        });
      }) : Array.from({
        length: r
      })), this.lazy && Promise.resolve().then(function() {
        var k;
        t.lazyLoadState = {
          first: t.step ? n ? {
            rows: 0,
            cols: s.cols
          } : 0 : s,
          last: Math.min(t.step ? t.step : g, ((k = t.items) === null || k === void 0 ? void 0 : k.length) || 0)
        }, t.$emit("lazy-load", t.lazyLoadState);
      });
    },
    calculateAutoSize: function() {
      var t = this;
      this.autoSize && !this.d_loading && Promise.resolve().then(function() {
        if (t.content) {
          var n = t.isBoth(), s = t.isHorizontal(), i = t.isVertical();
          t.content.style.minHeight = t.content.style.minWidth = "auto", t.content.style.position = "relative", t.element.style.contain = "none";
          var r = [nn(t.element), on(t.element)], p = r[0], h = r[1];
          (n || s) && (t.element.style.width = p < t.defaultWidth ? p + "px" : t.scrollWidth || t.defaultWidth + "px"), (n || i) && (t.element.style.height = h < t.defaultHeight ? h + "px" : t.scrollHeight || t.defaultHeight + "px"), t.content.style.minHeight = t.content.style.minWidth = "", t.content.style.position = "", t.element.style.contain = "";
        }
      });
    },
    getLast: function() {
      var t, n, s = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0, i = arguments.length > 1 ? arguments[1] : void 0;
      return this.items ? Math.min(i ? ((t = this.columns || this.items[0]) === null || t === void 0 ? void 0 : t.length) || 0 : ((n = this.items) === null || n === void 0 ? void 0 : n.length) || 0, s) : 0;
    },
    getContentPosition: function() {
      if (this.content) {
        var t = getComputedStyle(this.content), n = parseFloat(t.paddingLeft) + Math.max(parseFloat(t.left) || 0, 0), s = parseFloat(t.paddingRight) + Math.max(parseFloat(t.right) || 0, 0), i = parseFloat(t.paddingTop) + Math.max(parseFloat(t.top) || 0, 0), r = parseFloat(t.paddingBottom) + Math.max(parseFloat(t.bottom) || 0, 0);
        return {
          left: n,
          right: s,
          top: i,
          bottom: r,
          x: n + s,
          y: i + r
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
        var n = this.isBoth(), s = this.isHorizontal(), i = this.element.parentElement, r = this.scrollWidth || "".concat(this.element.offsetWidth || i.offsetWidth, "px"), p = this.scrollHeight || "".concat(this.element.offsetHeight || i.offsetHeight, "px"), h = function(k, w) {
          return t.element.style[k] = w;
        };
        n || s ? (h("height", p), h("width", r)) : h("height", p);
      }
    },
    setSpacerSize: function() {
      var t = this, n = this.items;
      if (n) {
        var s = this.isBoth(), i = this.isHorizontal(), r = this.getContentPosition(), p = function(g, k, w) {
          var _ = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : 0;
          return t.spacerStyle = an(an({}, t.spacerStyle), ni({}, "".concat(g), (k || []).length * w + _ + "px"));
        };
        s ? (p("height", n, this.itemSize[0], r.y), p("width", this.columns || n[1], this.itemSize[1], r.x)) : i ? p("width", this.columns || n, this.itemSize, r.x) : p("height", n, this.itemSize, r.y);
      }
    },
    setContentPosition: function(t) {
      var n = this;
      if (this.content && !this.appendOnly) {
        var s = this.isBoth(), i = this.isHorizontal(), r = t ? t.first : this.first, p = function(w, _) {
          return w * _;
        }, h = function() {
          var w = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0, _ = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0;
          return n.contentStyle = an(an({}, n.contentStyle), {
            transform: "translate3d(".concat(w, "px, ").concat(_, "px, 0)")
          });
        };
        if (s)
          h(p(r.cols, this.itemSize[1]), p(r.rows, this.itemSize[0]));
        else {
          var g = p(r, this.itemSize);
          i ? h(g, 0) : h(0, g);
        }
      }
    },
    onScrollPositionChange: function(t) {
      var n = this, s = t.target, i = this.isBoth(), r = this.isHorizontal(), p = this.getContentPosition(), h = function(v, O) {
        return v ? v > O ? v - O : v : 0;
      }, g = function(v, O) {
        return Math.floor(v / (O || v));
      }, k = function(v, O, z, V, X, te) {
        return v <= X ? X : te ? z - V - X : O + X - 1;
      }, w = function(v, O, z, V, X, te, oe, ce) {
        if (v <= te) return 0;
        var pe = Math.max(0, oe ? v < O ? z : v - te : v > O ? z : v - 2 * te), Ke = n.getLast(pe, ce);
        return pe > Ke ? Ke - X : pe;
      }, _ = function(v, O, z, V, X, te) {
        var oe = O + V + 2 * X;
        return v >= X && (oe += X + 1), n.getLast(oe, te);
      }, E = h(s.scrollTop, p.top), R = h(s.scrollLeft, p.left), F = i ? {
        rows: 0,
        cols: 0
      } : 0, H = this.last, x = !1, N = this.lastScrollPos;
      if (i) {
        var K = this.lastScrollPos.top <= E, M = this.lastScrollPos.left <= R;
        if (!this.appendOnly || this.appendOnly && (K || M)) {
          var D = {
            rows: g(E, this.itemSize[0]),
            cols: g(R, this.itemSize[1])
          }, c = {
            rows: k(D.rows, this.first.rows, this.last.rows, this.numItemsInViewport.rows, this.d_numToleratedItems[0], K),
            cols: k(D.cols, this.first.cols, this.last.cols, this.numItemsInViewport.cols, this.d_numToleratedItems[1], M)
          };
          F = {
            rows: w(D.rows, c.rows, this.first.rows, this.last.rows, this.numItemsInViewport.rows, this.d_numToleratedItems[0], K),
            cols: w(D.cols, c.cols, this.first.cols, this.last.cols, this.numItemsInViewport.cols, this.d_numToleratedItems[1], M, !0)
          }, H = {
            rows: _(D.rows, F.rows, this.last.rows, this.numItemsInViewport.rows, this.d_numToleratedItems[0]),
            cols: _(D.cols, F.cols, this.last.cols, this.numItemsInViewport.cols, this.d_numToleratedItems[1], !0)
          }, x = F.rows !== this.first.rows || H.rows !== this.last.rows || F.cols !== this.first.cols || H.cols !== this.last.cols || this.isRangeChanged, N = {
            top: E,
            left: R
          };
        }
      } else {
        var Q = r ? R : E, m = this.lastScrollPos <= Q;
        if (!this.appendOnly || this.appendOnly && m) {
          var $ = g(Q, this.itemSize), L = k($, this.first, this.last, this.numItemsInViewport, this.d_numToleratedItems, m);
          F = w($, L, this.first, this.last, this.numItemsInViewport, this.d_numToleratedItems, m), H = _($, F, this.last, this.numItemsInViewport, this.d_numToleratedItems), x = F !== this.first || H !== this.last || this.isRangeChanged, N = Q;
        }
      }
      return {
        first: F,
        last: H,
        isRangeChanged: x,
        scrollPos: N
      };
    },
    onScrollChange: function(t) {
      var n = this.onScrollPositionChange(t), s = n.first, i = n.last, r = n.isRangeChanged, p = n.scrollPos;
      if (r) {
        var h = {
          first: s,
          last: i
        };
        if (this.setContentPosition(h), this.first = s, this.last = i, this.lastScrollPos = p, this.$emit("scroll-index-change", h), this.lazy && this.isPageChanged(s)) {
          var g, k, w = {
            first: this.step ? Math.min(this.getPageByFirst(s) * this.step, (((g = this.items) === null || g === void 0 ? void 0 : g.length) || 0) - this.step) : s,
            last: Math.min(this.step ? (this.getPageByFirst(s) + 1) * this.step : i, ((k = this.items) === null || k === void 0 ? void 0 : k.length) || 0)
          }, _ = this.lazyLoadState.first !== w.first || this.lazyLoadState.last !== w.last;
          _ && this.$emit("lazy-load", w), this.lazyLoadState = w;
        }
      }
    },
    onScroll: function(t) {
      var n = this;
      if (this.$emit("scroll", t), this.delay) {
        if (this.scrollTimeout && clearTimeout(this.scrollTimeout), this.isPageChanged()) {
          if (!this.d_loading && this.showLoader) {
            var s = this.onScrollPositionChange(t), i = s.isRangeChanged, r = i || (this.step ? this.isPageChanged() : !1);
            r && (this.d_loading = !0);
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
        if (Ln(t.element)) {
          var n = t.isBoth(), s = t.isVertical(), i = t.isHorizontal(), r = [nn(t.element), on(t.element)], p = r[0], h = r[1], g = p !== t.defaultWidth, k = h !== t.defaultHeight, w = n ? g || k : i ? g : s ? k : !1;
          w && (t.d_numToleratedItems = t.numToleratedItems, t.defaultWidth = p, t.defaultHeight = h, t.defaultContentWidth = nn(t.content), t.defaultContentHeight = on(t.content), t.init());
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
      return an({
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
      this.content = t || this.content || Vo(this.element, '[data-pc-section="content"]');
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
    SpinnerIcon: Tn
  }
}, ll = ["tabindex"];
function rl(e, t, n, s, i, r) {
  var p = Ce("SpinnerIcon");
  return e.disabled ? (l(), u(Y, {
    key: 1
  }, [ie(e.$slots, "default"), ie(e.$slots, "content", {
    items: e.items,
    rows: e.items,
    columns: r.loadedColumns
  })], 64)) : (l(), u("div", Z({
    key: 0,
    ref: r.elementRef,
    class: r.containerClass,
    tabindex: e.tabindex,
    style: e.style,
    onScroll: t[0] || (t[0] = function() {
      return r.onScroll && r.onScroll.apply(r, arguments);
    })
  }, e.ptmi("root")), [ie(e.$slots, "content", {
    styleClass: r.contentClass,
    items: r.loadedItems,
    getItemOptions: r.getOptions,
    loading: i.d_loading,
    getLoaderOptions: r.getLoaderOptions,
    itemSize: e.itemSize,
    rows: r.loadedRows,
    columns: r.loadedColumns,
    contentRef: r.contentRef,
    spacerStyle: i.spacerStyle,
    contentStyle: i.contentStyle,
    vertical: r.isVertical(),
    horizontal: r.isHorizontal(),
    both: r.isBoth()
  }, function() {
    return [a("div", Z({
      ref: r.contentRef,
      class: r.contentClass,
      style: i.contentStyle
    }, e.ptm("content")), [(l(!0), u(Y, null, se(r.loadedItems, function(h, g) {
      return ie(e.$slots, "item", {
        key: g,
        item: h,
        options: r.getOptions(g)
      });
    }), 128))], 16)];
  }), e.showSpacer ? (l(), u("div", Z({
    key: 0,
    class: "p-virtualscroller-spacer",
    style: i.spacerStyle
  }, e.ptm("spacer")), null, 16)) : f("", !0), !e.loaderDisabled && e.showLoader && i.d_loading ? (l(), u("div", Z({
    key: 1,
    class: r.loaderClass
  }, e.ptm("loader")), [e.$slots && e.$slots.loader ? (l(!0), u(Y, {
    key: 0
  }, se(i.loaderArr, function(h, g) {
    return ie(e.$slots, "loader", {
      key: g,
      options: r.getLoaderOptions(g, r.isBoth() && {
        numCols: e.d_numItemsInViewport.cols
      })
    });
  }), 128)) : f("", !0), ie(e.$slots, "loadingicon", {}, function() {
    return [y(p, Z({
      spin: "",
      class: "p-virtualscroller-loading-icon"
    }, e.ptm("loadingIcon")), null, 16)];
  })], 16)) : f("", !0)], 16, ll));
}
oi.render = rl;
var ul = `
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
`, dl = {
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
    var n = t.instance, s = t.props, i = t.state, r = t.option, p = t.focusedOption;
    return ["p-select-option", {
      "p-select-option-selected": n.isSelected(r) && s.highlightOnSelect,
      "p-focus": i.focusedOptionIndex === p,
      "p-disabled": n.isOptionDisabled(r)
    }];
  },
  optionLabel: "p-select-option-label",
  optionCheckIcon: "p-select-option-check-icon",
  optionBlankIcon: "p-select-option-blank-icon",
  emptyMessage: "p-select-empty-message"
}, cl = ft.extend({
  name: "select",
  style: ul,
  classes: dl
}), pl = {
  name: "BaseSelect",
  extends: ei,
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
  style: cl,
  provide: function() {
    return {
      $pcSelect: this,
      $parentInstance: this
    };
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
function ml(e) {
  return vl(e) || hl(e) || bl(e) || fl();
}
function fl() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function bl(e, t) {
  if (e) {
    if (typeof e == "string") return Zn(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Zn(e, t) : void 0;
  }
}
function hl(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function vl(e) {
  if (Array.isArray(e)) return Zn(e);
}
function Zn(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, s = Array(t); n < t; n++) s[n] = e[n];
  return s;
}
function Co(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var s = Object.getOwnPropertySymbols(e);
    t && (s = s.filter(function(i) {
      return Object.getOwnPropertyDescriptor(e, i).enumerable;
    })), n.push.apply(n, s);
  }
  return n;
}
function Io(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? Co(Object(n), !0).forEach(function(s) {
      Bt(e, s, n[s]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Co(Object(n)).forEach(function(s) {
      Object.defineProperty(e, s, Object.getOwnPropertyDescriptor(n, s));
    });
  }
  return e;
}
function Bt(e, t, n) {
  return (t = gl(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function gl(e) {
  var t = yl(e, "string");
  return $n(t) == "symbol" ? t : t + "";
}
function yl(e, t) {
  if ($n(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var s = n.call(e, t);
    if ($n(s) != "object") return s;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var On = {
  name: "Select",
  extends: pl,
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
    this.unbindOutsideClickListener(), this.unbindResizeListener(), this.unbindLabelClickListener(), this.unbindMatchMediaOrientationListener(), this.scrollHandler && (this.scrollHandler.destroy(), this.scrollHandler = null), this.overlay && (Yt.clear(this.overlay), this.overlay = null);
  },
  methods: {
    getOptionIndex: function(t, n) {
      return this.virtualScrollerDisabled ? t : n && n(t).index;
    },
    getOptionLabel: function(t) {
      return this.optionLabel ? Wt(t, this.optionLabel) : t;
    },
    getOptionValue: function(t) {
      return this.optionValue ? Wt(t, this.optionValue) : t;
    },
    getOptionRenderKey: function(t, n) {
      return (this.dataKey ? Wt(t, this.dataKey) : this.getOptionLabel(t)) + "_" + n;
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
      return this.optionDisabled ? Wt(t, this.optionDisabled) : !1;
    },
    isOptionGroup: function(t) {
      return this.optionGroupLabel && t.optionGroup && t.group;
    },
    getOptionGroupLabel: function(t) {
      return Wt(t, this.optionGroupLabel);
    },
    getOptionGroupChildren: function(t) {
      return Wt(t, this.optionGroupChildren);
    },
    getAriaPosInset: function(t) {
      var n = this;
      return (this.optionGroupLabel ? t - this.visibleOptions.slice(0, t).filter(function(s) {
        return n.isOptionGroup(s);
      }).length : t) + 1;
    },
    show: function(t) {
      this.$emit("before-show"), this.overlayVisible = !0, this.focusedOptionIndex = this.focusedOptionIndex !== -1 ? this.focusedOptionIndex : this.autoOptionFocus ? this.findFirstFocusedOptionIndex() : this.editable ? -1 : this.findSelectedOptionIndex(), t && xe(this.$refs.focusInput);
    },
    hide: function(t) {
      var n = this, s = function() {
        n.$emit("before-hide"), n.overlayVisible = !1, n.clicked = !1, n.focusedOptionIndex = -1, n.searchValue = "", n.resetFilterOnHide && (n.filterValue = null), t && xe(n.$refs.focusInput);
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
      if (wi())
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
          !s && Si(t.key) && (!this.overlayVisible && this.show(), !this.editable && this.searchOptions(t, t.key), this.filter && this.$nextTick(function() {
            n.$refs.filterInput && xe(n.$refs.filterInput.$el);
          }));
          break;
      }
      this.clicked = !1;
    },
    onEditableInput: function(t) {
      var n = t.target.value;
      this.searchValue = "";
      var s = this.searchOptions(t, n);
      !s && (this.focusedOptionIndex = -1), this.updateModel(t, n), !this.overlayVisible && Pt(n) && this.show();
    },
    onContainerClick: function(t) {
      this.disabled || this.loading || t.target.tagName === "INPUT" || t.target.getAttribute("data-pc-section") === "clearicon" || t.target.closest('[data-pc-section="clearicon"]') || ((!this.overlay || !this.overlay.contains(t.target)) && (this.overlayVisible ? this.hide(!0) : this.show(!0)), this.clicked = !0);
    },
    onClearClick: function(t) {
      this.updateModel(t, null), this.resetFilterOnClear && (this.filterValue = null);
    },
    onFirstHiddenFocus: function(t) {
      var n = t.relatedTarget === this.$refs.focusInput ? Zt(this.overlay, ':not([data-p-hidden-focusable="true"])') : this.$refs.focusInput;
      xe(n);
    },
    onLastHiddenFocus: function(t) {
      var n = t.relatedTarget === this.$refs.focusInput ? Po(this.overlay, ':not([data-p-hidden-focusable="true"])') : this.$refs.focusInput;
      xe(n);
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
      is.emit("overlay-click", {
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
      n || (this.overlayVisible && this.hasFocusableElements() ? (xe(this.$refs.firstHiddenFocusableElementOnOverlay), t.preventDefault()) : (this.focusedOptionIndex !== -1 && this.onOptionSelect(t, this.visibleOptions[this.focusedOptionIndex]), this.overlayVisible && this.hide(this.filter)));
    },
    onBackspaceKey: function(t) {
      var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1;
      n && !this.overlayVisible && this.show();
    },
    onOverlayEnter: function(t) {
      var n = this;
      Yt.set("overlay", t, this.$primevue.config.zIndex.overlay), Fo(t, {
        position: "absolute",
        top: "0"
      }), this.alignOverlay(), this.scrollInView(), this.$attrSelector && t.setAttribute(this.$attrSelector, ""), setTimeout(function() {
        n.autoFilterFocus && n.filter && xe(n.$refs.filterInput.$el), n.autoUpdateModel();
      }, 1);
    },
    onOverlayAfterEnter: function() {
      this.bindOutsideClickListener(), this.bindScrollListener(), this.bindResizeListener(), this.$emit("show");
    },
    onOverlayLeave: function(t) {
      var n = this;
      t.style.pointerEvents = "none", this.unbindOutsideClickListener(), this.unbindScrollListener(), this.unbindResizeListener(), this.autoFilterFocus && this.filter && !this.editable && this.$nextTick(function() {
        n.$refs.filterInput && xe(n.$refs.filterInput.$el);
      }), this.$emit("hide"), this.overlay = null;
    },
    onOverlayAfterLeave: function(t) {
      Yt.clear(t);
    },
    alignOverlay: function() {
      this.appendTo === "self" ? yi(this.overlay, this.$el) : this.overlay && (this.overlay.style.minWidth = To(this.$el) + "px", ki(this.overlay, this.$el));
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
      this.scrollHandler || (this.scrollHandler = new os(this.$refs.container, function() {
        t.overlayVisible && t.hide();
      })), this.scrollHandler.bindScrollListener();
    },
    unbindScrollListener: function() {
      this.scrollHandler && this.scrollHandler.unbindScrollListener();
    },
    bindResizeListener: function() {
      var t = this;
      this.resizeListener || (this.resizeListener = function() {
        t.overlayVisible && !gi() && t.hide();
      }, window.addEventListener("resize", this.resizeListener));
    },
    unbindResizeListener: function() {
      this.resizeListener && (window.removeEventListener("resize", this.resizeListener), this.resizeListener = null);
    },
    bindLabelClickListener: function() {
      var t = this;
      if (!this.editable && !this.labelClickListener) {
        var n = document.querySelector('label[for="'.concat(this.labelId, '"]'));
        n && Ln(n) && (this.labelClickListener = function() {
          xe(t.$refs.focusInput);
        }, n.addEventListener("click", this.labelClickListener));
      }
    },
    unbindLabelClickListener: function() {
      if (this.labelClickListener) {
        var t = document.querySelector('label[for="'.concat(this.labelId, '"]'));
        t && Ln(t) && t.removeEventListener("click", this.labelClickListener);
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
      return vi(this.overlay, ':not([data-p-hidden-focusable="true"])').length > 0;
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
      return Pt(t) && !(this.isOptionDisabled(t) || this.isOptionGroup(t));
    },
    isValidSelectedOption: function(t) {
      return this.isValidOption(t) && this.isSelected(t);
    },
    isSelected: function(t) {
      return hi(this.d_value, this.getOptionValue(t), this.equalityKey);
    },
    findFirstOptionIndex: function() {
      var t = this;
      return this.visibleOptions.findIndex(function(n) {
        return t.isValidOption(n);
      });
    },
    findLastOptionIndex: function() {
      var t = this;
      return ro(this.visibleOptions, function(n) {
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
      var n = this, s = t > 0 ? ro(this.visibleOptions.slice(0, t), function(i) {
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
      var i = -1, r = !1;
      return Pt(this.searchValue) && (i = this.visibleOptions.findIndex(function(p) {
        return s.isOptionExactMatched(p);
      }), i === -1 && (i = this.visibleOptions.findIndex(function(p) {
        return s.isOptionStartsWith(p);
      })), i !== -1 && (r = !0), i === -1 && this.focusedOptionIndex === -1 && (i = this.findFirstFocusedOptionIndex()), i !== -1 && this.changeFocusedOptionIndex(t, i)), this.searchTimeout && clearTimeout(this.searchTimeout), this.searchTimeout = setTimeout(function() {
        s.searchValue = "", s.searchTimeout = null;
      }, 500), r;
    },
    changeFocusedOptionIndex: function(t, n) {
      this.focusedOptionIndex !== n && (this.focusedOptionIndex = n, this.scrollInView(), this.selectOnFocus && this.onOptionSelect(t, this.visibleOptions[n], !1));
    },
    scrollInView: function() {
      var t = this, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : -1;
      this.$nextTick(function() {
        var s = n !== -1 ? "".concat(t.$id, "_").concat(n) : t.focusedOptionId, i = Vo(t.list, 'li[id="'.concat(s, '"]'));
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
      return (t || []).reduce(function(s, i, r) {
        s.push({
          optionGroup: i,
          group: !0,
          index: r
        });
        var p = n.getOptionGroupChildren(i);
        return p && p.forEach(function(h) {
          return s.push(h);
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
        var s = bi.filter(n, this.searchFields, this.filterValue, this.filterMatchMode, this.filterLocale);
        if (this.optionGroupLabel) {
          var i = this.options || [], r = [];
          return i.forEach(function(p) {
            var h = t.getOptionGroupChildren(p), g = h.filter(function(k) {
              return s.includes(k);
            });
            g.length > 0 && r.push(Io(Io({}, p), {}, Bt({}, typeof t.optionGroupChildren == "string" ? t.optionGroupChildren : "items", ml(g))));
          }), this.flatOptions(r);
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
      return Pt(this.visibleOptions) ? this.filterMessageText.replaceAll("{0}", this.visibleOptions.length) : this.emptyFilterMessageText;
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
      return Je(Bt({
        invalid: this.$invalid,
        disabled: this.disabled,
        focus: this.focused,
        fluid: this.$fluid,
        filled: this.$variant === "filled"
      }, this.size, this.size));
    },
    labelDataP: function() {
      return Je(Bt(Bt({
        placeholder: !this.editable && this.label === this.placeholder,
        clearable: this.showClear,
        disabled: this.disabled,
        editable: this.editable
      }, this.size, this.size), "empty", !this.editable && !this.$slots.value && (this.label === "p-emptylabel" || this.label.length === 0)));
    },
    dropdownIconDataP: function() {
      return Je(Bt({}, this.size, this.size));
    },
    overlayDataP: function() {
      return Je(Bt({}, "portal-" + this.appendTo, "portal-" + this.appendTo));
    }
  },
  directives: {
    ripple: eo
  },
  components: {
    InputText: ti,
    VirtualScroller: oi,
    Portal: Eo,
    InputIcon: Qo,
    IconField: Jo,
    TimesIcon: so,
    ChevronDownIcon: Yo,
    SpinnerIcon: Tn,
    SearchIcon: Xo,
    CheckIcon: Zo,
    BlankIcon: Wo
  }
}, kl = ["id", "data-p"], wl = ["name", "id", "value", "placeholder", "tabindex", "disabled", "aria-label", "aria-labelledby", "aria-expanded", "aria-controls", "aria-activedescendant", "aria-invalid", "data-p"], Sl = ["name", "id", "tabindex", "aria-label", "aria-labelledby", "aria-expanded", "aria-controls", "aria-activedescendant", "aria-invalid", "aria-disabled", "data-p"], $l = ["data-p"], Cl = ["id"], Il = ["id"], _l = ["id", "aria-label", "aria-selected", "aria-disabled", "aria-setsize", "aria-posinset", "onMousedown", "onMousemove", "data-p-selected", "data-p-focused", "data-p-disabled"];
function xl(e, t, n, s, i, r) {
  var p = Ce("SpinnerIcon"), h = Ce("InputText"), g = Ce("SearchIcon"), k = Ce("InputIcon"), w = Ce("IconField"), _ = Ce("CheckIcon"), E = Ce("BlankIcon"), R = Ce("VirtualScroller"), F = Ce("Portal"), H = to("ripple");
  return l(), u("div", Z({
    ref: "container",
    id: e.$id,
    class: e.cx("root"),
    onClick: t[12] || (t[12] = function() {
      return r.onContainerClick && r.onContainerClick.apply(r, arguments);
    }),
    "data-p": r.containerDataP
  }, e.ptmi("root")), [e.editable ? (l(), u("input", Z({
    key: 0,
    ref: "focusInput",
    name: e.name,
    id: e.labelId || e.inputId,
    type: "text",
    class: [e.cx("label"), e.inputClass, e.labelClass],
    style: [e.inputStyle, e.labelStyle],
    value: r.editableInputValue,
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
    "aria-activedescendant": i.focused ? r.focusedOptionId : void 0,
    "aria-invalid": e.invalid || void 0,
    onFocus: t[0] || (t[0] = function() {
      return r.onFocus && r.onFocus.apply(r, arguments);
    }),
    onBlur: t[1] || (t[1] = function() {
      return r.onBlur && r.onBlur.apply(r, arguments);
    }),
    onKeydown: t[2] || (t[2] = function() {
      return r.onKeyDown && r.onKeyDown.apply(r, arguments);
    }),
    onInput: t[3] || (t[3] = function() {
      return r.onEditableInput && r.onEditableInput.apply(r, arguments);
    }),
    "data-p": r.labelDataP
  }, e.ptm("label")), null, 16, wl)) : (l(), u("span", Z({
    key: 1,
    ref: "focusInput",
    name: e.name,
    id: e.labelId || e.inputId,
    class: [e.cx("label"), e.inputClass, e.labelClass],
    style: [e.inputStyle, e.labelStyle],
    tabindex: e.disabled ? -1 : e.tabindex,
    role: "combobox",
    "aria-label": e.ariaLabel || (r.label === "p-emptylabel" ? void 0 : r.label),
    "aria-labelledby": e.ariaLabelledby,
    "aria-haspopup": "listbox",
    "aria-expanded": i.overlayVisible,
    "aria-controls": e.$id + "_list",
    "aria-activedescendant": i.focused ? r.focusedOptionId : void 0,
    "aria-invalid": e.invalid || void 0,
    "aria-disabled": e.disabled,
    onFocus: t[4] || (t[4] = function() {
      return r.onFocus && r.onFocus.apply(r, arguments);
    }),
    onBlur: t[5] || (t[5] = function() {
      return r.onBlur && r.onBlur.apply(r, arguments);
    }),
    onKeydown: t[6] || (t[6] = function() {
      return r.onKeyDown && r.onKeyDown.apply(r, arguments);
    }),
    "data-p": r.labelDataP
  }, e.ptm("label")), [ie(e.$slots, "value", {
    value: e.d_value,
    placeholder: e.placeholder
  }, function() {
    var x;
    return [P(d(r.label === "p-emptylabel" ? " " : (x = r.label) !== null && x !== void 0 ? x : "empty"), 1)];
  })], 16, Sl)), r.isClearIconVisible ? ie(e.$slots, "clearicon", {
    key: 2,
    class: ne(e.cx("clearIcon")),
    clearCallback: r.onClearClick
  }, function() {
    return [(l(), ye(pn(e.clearIcon ? "i" : "TimesIcon"), Z({
      ref: "clearIcon",
      class: [e.cx("clearIcon"), e.clearIcon],
      onClick: r.onClearClick
    }, e.ptm("clearIcon"), {
      "data-pc-section": "clearicon"
    }), null, 16, ["class", "onClick"]))];
  }) : f("", !0), a("div", Z({
    class: e.cx("dropdown")
  }, e.ptm("dropdown")), [e.loading ? ie(e.$slots, "loadingicon", {
    key: 0,
    class: ne(e.cx("loadingIcon"))
  }, function() {
    return [e.loadingIcon ? (l(), u("span", Z({
      key: 0,
      class: [e.cx("loadingIcon"), "pi-spin", e.loadingIcon],
      "aria-hidden": "true"
    }, e.ptm("loadingIcon")), null, 16)) : (l(), ye(p, Z({
      key: 1,
      class: e.cx("loadingIcon"),
      spin: "",
      "aria-hidden": "true"
    }, e.ptm("loadingIcon")), null, 16, ["class"]))];
  }) : ie(e.$slots, "dropdownicon", {
    key: 1,
    class: ne(e.cx("dropdownIcon"))
  }, function() {
    return [(l(), ye(pn(e.dropdownIcon ? "span" : "ChevronDownIcon"), Z({
      class: [e.cx("dropdownIcon"), e.dropdownIcon],
      "aria-hidden": "true",
      "data-p": r.dropdownIconDataP
    }, e.ptm("dropdownIcon")), null, 16, ["class", "data-p"]))];
  })], 16), y(F, {
    appendTo: e.appendTo
  }, {
    default: he(function() {
      return [y(Ro, Z({
        name: "p-anchored-overlay",
        onEnter: r.onOverlayEnter,
        onAfterEnter: r.onOverlayAfterEnter,
        onLeave: r.onOverlayLeave,
        onAfterLeave: r.onOverlayAfterLeave
      }, e.ptm("transition")), {
        default: he(function() {
          return [i.overlayVisible ? (l(), u("div", Z({
            key: 0,
            ref: r.overlayRef,
            class: [e.cx("overlay"), e.panelClass, e.overlayClass],
            style: [e.panelStyle, e.overlayStyle],
            onClick: t[10] || (t[10] = function() {
              return r.onOverlayClick && r.onOverlayClick.apply(r, arguments);
            }),
            onKeydown: t[11] || (t[11] = function() {
              return r.onOverlayKeyDown && r.onOverlayKeyDown.apply(r, arguments);
            }),
            "data-p": r.overlayDataP
          }, e.ptm("overlay")), [a("span", Z({
            ref: "firstHiddenFocusableElementOnOverlay",
            role: "presentation",
            "aria-hidden": "true",
            class: "p-hidden-accessible p-hidden-focusable",
            tabindex: 0,
            onFocus: t[7] || (t[7] = function() {
              return r.onFirstHiddenFocus && r.onFirstHiddenFocus.apply(r, arguments);
            })
          }, e.ptm("hiddenFirstFocusableEl"), {
            "data-p-hidden-accessible": !0,
            "data-p-hidden-focusable": !0
          }), null, 16), ie(e.$slots, "header", {
            value: e.d_value,
            options: r.visibleOptions
          }), e.filter ? (l(), u("div", Z({
            key: 0,
            class: e.cx("header")
          }, e.ptm("header")), [y(w, {
            unstyled: e.unstyled,
            pt: e.ptm("pcFilterContainer")
          }, {
            default: he(function() {
              return [y(h, {
                ref: "filterInput",
                type: "text",
                value: i.filterValue,
                onVnodeMounted: r.onFilterUpdated,
                onVnodeUpdated: r.onFilterUpdated,
                class: ne(e.cx("pcFilter")),
                placeholder: e.filterPlaceholder,
                variant: e.variant,
                unstyled: e.unstyled,
                role: "searchbox",
                autocomplete: "off",
                "aria-owns": e.$id + "_list",
                "aria-activedescendant": r.focusedOptionId,
                onKeydown: r.onFilterKeyDown,
                onBlur: r.onFilterBlur,
                onInput: r.onFilterChange,
                pt: e.ptm("pcFilter"),
                formControl: {
                  novalidate: !0
                }
              }, null, 8, ["value", "onVnodeMounted", "onVnodeUpdated", "class", "placeholder", "variant", "unstyled", "aria-owns", "aria-activedescendant", "onKeydown", "onBlur", "onInput", "pt"]), y(k, {
                unstyled: e.unstyled,
                pt: e.ptm("pcFilterIconContainer")
              }, {
                default: he(function() {
                  return [ie(e.$slots, "filtericon", {}, function() {
                    return [e.filterIcon ? (l(), u("span", Z({
                      key: 0,
                      class: e.filterIcon
                    }, e.ptm("filterIcon")), null, 16)) : (l(), ye(g, Bi(Z({
                      key: 1
                    }, e.ptm("filterIcon"))), null, 16))];
                  })];
                }),
                _: 3
              }, 8, ["unstyled", "pt"])];
            }),
            _: 3
          }, 8, ["unstyled", "pt"]), a("span", Z({
            role: "status",
            "aria-live": "polite",
            class: "p-hidden-accessible"
          }, e.ptm("hiddenFilterResult"), {
            "data-p-hidden-accessible": !0
          }), d(r.filterResultMessageText), 17)], 16)) : f("", !0), a("div", Z({
            class: e.cx("listContainer"),
            style: {
              "max-height": r.virtualScrollerDisabled ? e.scrollHeight : ""
            }
          }, e.ptm("listContainer")), [y(R, Z({
            ref: r.virtualScrollerRef
          }, e.virtualScrollerOptions, {
            items: r.visibleOptions,
            style: {
              height: e.scrollHeight
            },
            tabindex: -1,
            disabled: r.virtualScrollerDisabled,
            pt: e.ptm("virtualScroller")
          }), Ri({
            content: he(function(x) {
              var N = x.styleClass, K = x.contentRef, M = x.items, D = x.getItemOptions, c = x.contentStyle, Q = x.itemSize;
              return [a("ul", Z({
                ref: function($) {
                  return r.listRef($, K);
                },
                id: e.$id + "_list",
                class: [e.cx("list"), N],
                style: c,
                role: "listbox"
              }, e.ptm("list")), [(l(!0), u(Y, null, se(M, function(m, $) {
                return l(), u(Y, {
                  key: r.getOptionRenderKey(m, r.getOptionIndex($, D))
                }, [r.isOptionGroup(m) ? (l(), u("li", Z({
                  key: 0,
                  id: e.$id + "_" + r.getOptionIndex($, D),
                  style: {
                    height: Q ? Q + "px" : void 0
                  },
                  class: e.cx("optionGroup"),
                  role: "option"
                }, {
                  ref_for: !0
                }, e.ptm("optionGroup")), [ie(e.$slots, "optiongroup", {
                  option: m.optionGroup,
                  index: r.getOptionIndex($, D)
                }, function() {
                  return [a("span", Z({
                    class: e.cx("optionGroupLabel")
                  }, {
                    ref_for: !0
                  }, e.ptm("optionGroupLabel")), d(r.getOptionGroupLabel(m.optionGroup)), 17)];
                })], 16, Il)) : Be((l(), u("li", Z({
                  key: 1,
                  id: e.$id + "_" + r.getOptionIndex($, D),
                  class: e.cx("option", {
                    option: m,
                    focusedOption: r.getOptionIndex($, D)
                  }),
                  style: {
                    height: Q ? Q + "px" : void 0
                  },
                  role: "option",
                  "aria-label": r.getOptionLabel(m),
                  "aria-selected": r.isSelected(m),
                  "aria-disabled": r.isOptionDisabled(m),
                  "aria-setsize": r.ariaSetSize,
                  "aria-posinset": r.getAriaPosInset(r.getOptionIndex($, D)),
                  onMousedown: function(ae) {
                    return r.onOptionSelect(ae, m);
                  },
                  onMousemove: function(ae) {
                    return r.onOptionMouseMove(ae, r.getOptionIndex($, D));
                  },
                  onClick: t[8] || (t[8] = _n(function() {
                  }, ["stop"])),
                  "data-p-selected": !e.checkmark && r.isSelected(m),
                  "data-p-focused": i.focusedOptionIndex === r.getOptionIndex($, D),
                  "data-p-disabled": r.isOptionDisabled(m)
                }, {
                  ref_for: !0
                }, r.getPTItemOptions(m, D, $, "option")), [e.checkmark ? (l(), u(Y, {
                  key: 0
                }, [r.isSelected(m) ? (l(), ye(_, Z({
                  key: 0,
                  class: e.cx("optionCheckIcon")
                }, {
                  ref_for: !0
                }, e.ptm("optionCheckIcon")), null, 16, ["class"])) : (l(), ye(E, Z({
                  key: 1,
                  class: e.cx("optionBlankIcon")
                }, {
                  ref_for: !0
                }, e.ptm("optionBlankIcon")), null, 16, ["class"]))], 64)) : f("", !0), ie(e.$slots, "option", {
                  option: m,
                  selected: r.isSelected(m),
                  index: r.getOptionIndex($, D)
                }, function() {
                  return [a("span", Z({
                    class: e.cx("optionLabel")
                  }, {
                    ref_for: !0
                  }, e.ptm("optionLabel")), d(r.getOptionLabel(m)), 17)];
                })], 16, _l)), [[H]])], 64);
              }), 128)), i.filterValue && (!M || M && M.length === 0) ? (l(), u("li", Z({
                key: 0,
                class: e.cx("emptyMessage"),
                role: "option"
              }, e.ptm("emptyMessage"), {
                "data-p-hidden-accessible": !0
              }), [ie(e.$slots, "emptyfilter", {}, function() {
                return [P(d(r.emptyFilterMessageText), 1)];
              })], 16)) : !e.options || e.options && e.options.length === 0 ? (l(), u("li", Z({
                key: 1,
                class: e.cx("emptyMessage"),
                role: "option"
              }, e.ptm("emptyMessage"), {
                "data-p-hidden-accessible": !0
              }), [ie(e.$slots, "empty", {}, function() {
                return [P(d(r.emptyMessageText), 1)];
              })], 16)) : f("", !0)], 16, Cl)];
            }),
            _: 2
          }, [e.$slots.loader ? {
            name: "loader",
            fn: he(function(x) {
              var N = x.options;
              return [ie(e.$slots, "loader", {
                options: N
              })];
            }),
            key: "0"
          } : void 0]), 1040, ["items", "style", "disabled", "pt"])], 16), ie(e.$slots, "footer", {
            value: e.d_value,
            options: r.visibleOptions
          }), !e.options || e.options && e.options.length === 0 ? (l(), u("span", Z({
            key: 1,
            role: "status",
            "aria-live": "polite",
            class: "p-hidden-accessible"
          }, e.ptm("hiddenEmptyMessage"), {
            "data-p-hidden-accessible": !0
          }), d(r.emptyMessageText), 17)) : f("", !0), a("span", Z({
            role: "status",
            "aria-live": "polite",
            class: "p-hidden-accessible"
          }, e.ptm("hiddenSelectedMessage"), {
            "data-p-hidden-accessible": !0
          }), d(r.selectedMessageText), 17), a("span", Z({
            ref: "lastHiddenFocusableElementOnOverlay",
            role: "presentation",
            "aria-hidden": "true",
            class: "p-hidden-accessible p-hidden-focusable",
            tabindex: 0,
            onFocus: t[9] || (t[9] = function() {
              return r.onLastHiddenFocus && r.onLastHiddenFocus.apply(r, arguments);
            })
          }, e.ptm("hiddenLastFocusableEl"), {
            "data-p-hidden-accessible": !0,
            "data-p-hidden-focusable": !0
          }), null, 16)], 16, $l)) : f("", !0)];
        }),
        _: 3
      }, 16, ["onEnter", "onAfterEnter", "onLeave", "onAfterLeave"])];
    }),
    _: 3
  }, 8, ["appendTo"])], 16, kl);
}
On.render = xl;
const Ol = 2e3;
function _o(e) {
  const t = e.margin ?? 8, n = e.gap ?? 4, s = Math.max(0, e.viewportWidth), i = Math.max(0, e.viewportHeight), r = Math.max(0, s - t * 2), p = Math.min(Math.max(0, e.requestedWidth), r), h = e.align === "right" ? e.anchor.right - p : e.anchor.left, g = Math.max(t, Math.min(h, s - t - p)), k = Math.max(0, i - e.anchor.bottom - n - t), w = Math.max(0, e.anchor.top - n - t), _ = k < e.requestedMaxHeight && w > k ? "above" : "below", E = _ === "above" ? w : k, R = Math.round(Math.min(Math.max(0, e.requestedMaxHeight), E)), F = Math.min(Math.max(0, e.panelHeight ?? R), R), H = _ === "above" ? e.anchor.top - n - F : e.anchor.bottom + n, x = e.containingBlockOrigin ?? { left: 0, top: 0 };
  return {
    left: Math.round(g - x.left),
    width: Math.round(p),
    maxHeight: R,
    side: _,
    top: Math.round(H - x.top)
  };
}
const ii = /* @__PURE__ */ Qt({
  __name: "AnchoredPanel",
  props: {
    open: { type: Boolean },
    anchor: {},
    align: { default: "left" },
    width: { default: "anchor" },
    minWidth: { default: 0 },
    maxHeight: { default: 340 },
    gap: { default: 4 },
    zIndex: { default: Ol }
  },
  emits: ["update:open"],
  setup(e, { emit: t }) {
    const n = e, s = t, i = j(null), r = j({ position: "fixed", visibility: "hidden" });
    function p() {
      const H = n.anchor, x = i.value;
      if (!H || !x) return;
      const N = H.getBoundingClientRect(), K = n.width === "anchor" ? Math.max(n.minWidth, N.width) : Math.max(n.minWidth, n.width), M = {
        anchor: N,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
        requestedWidth: K,
        requestedMaxHeight: n.maxHeight,
        align: n.align,
        gap: n.gap
      }, D = _o(M);
      Object.assign(x.style, {
        position: "fixed",
        left: "0px",
        top: "0px",
        right: "auto",
        bottom: "auto",
        width: `${D.width}px`,
        maxHeight: `${D.maxHeight}px`,
        visibility: "hidden"
      });
      const c = x.getBoundingClientRect(), Q = _o({
        ...M,
        containingBlockOrigin: { left: c.left, top: c.top },
        panelHeight: c.height
      }), m = {
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
      r.value = m;
    }
    let h = null, g = !1;
    function k() {
      g || !n.open || (g = !0, requestAnimationFrame(() => {
        g = !1, n.open && p();
      }));
    }
    function w() {
      typeof ResizeObserver > "u" || (h = new ResizeObserver(k), i.value && h.observe(i.value), n.anchor && h.observe(n.anchor));
    }
    function _() {
      h?.disconnect(), h = null, g = !1;
    }
    Ne(() => n.open, async (H) => {
      _(), H && (r.value = { position: "fixed", visibility: "hidden" }, await mn(), p(), w());
    }, { immediate: !0 });
    function E(H) {
      if (!n.open) return;
      const x = H.composedPath();
      i.value && x.includes(i.value) || n.anchor && x.includes(n.anchor) || s("update:open", !1);
    }
    function R(H) {
      n.open && H.key === "Escape" && s("update:open", !1);
    }
    function F() {
      n.open && p();
    }
    return document.addEventListener("click", E), document.addEventListener("keydown", R), window.addEventListener("resize", F), window.addEventListener("scroll", F, !0), jo(() => {
      _(), document.removeEventListener("click", E), document.removeEventListener("keydown", R), window.removeEventListener("resize", F), window.removeEventListener("scroll", F, !0);
    }), (H, x) => e.open ? (l(), u("div", {
      key: 0,
      ref_key: "panel",
      ref: i,
      class: "anchored-panel",
      style: jt(r.value)
    }, [
      ie(H.$slots, "default")
    ], 4)) : f("", !0);
  }
});
function Ll(e) {
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
function En(e, t) {
  const n = Ll(e);
  if (n === null) return "";
  const s = t?.now ?? Date.now(), i = t?.suffix ?? !0, r = t?.maxUnit ?? "day", p = t?.future ?? !1, h = 6e4, g = 60 * h, k = 24 * g, w = 30 * k, _ = 365 * k, E = s - n;
  if (p && E < 0) {
    const H = -E;
    return H < h ? "in <1m" : H < g ? `in ${Math.floor(H / h)}m` : H < k ? `in ${Math.floor(H / g)}h` : `in ${Math.floor(H / k)}d`;
  }
  const R = Math.max(0, E);
  if (R < h) return "just now";
  const F = i ? " ago" : "";
  return R < g ? `${Math.floor(R / h)}m${F}` : R < k ? `${Math.floor(R / g)}h${F}` : r === "year" ? R < w ? `${Math.floor(R / k)}d${F}` : R < _ ? `${Math.floor(R / w)}mo${F}` : `${Math.floor(R / _)}y${F}` : `${Math.floor(R / k)}d${F}`;
}
const Yn = {
  tool: { label: "Tools", icon: "tabler:tool" },
  "agent.trait": { label: "Agent capabilities", icon: "tabler:robot" },
  "contract.binding": { label: "Contract bindings", icon: "tabler:plug-connected" },
  "contract.definition": { label: "Contracts", icon: "tabler:file-description" },
  "view.page": { label: "Pages", icon: "tabler:browser" },
  "view.component": { label: "Components", icon: "tabler:components" }
};
function zl(e) {
  const t = e.meta?.type || "";
  return t && Yn[t] ? t : e.kind;
}
function Al(e) {
  return String(e.id).split(":").pop() || e.id;
}
function Pl(e) {
  const t = e.meta || {};
  return String(t.comment || t.title || "");
}
function Ml(e, t) {
  return String(e.meta?.icon || t);
}
function Qe(e, t) {
  const n = t instanceof Error ? t.message : String(t);
  console.error(`[${e}]`, n, t);
}
function Xn() {
  window.dispatchEvent(new CustomEvent("kickside:modules-changed")), window.dispatchEvent(new CustomEvent("kickside:nav-changed"));
}
function El(e) {
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
      const r = n.used_by || [], p = n.used_by_count || r.length || 0;
      if (n.is_root !== !0 && n.transitive === !0 && p === 0) continue;
      const h = s.split("/");
      t.set(s, {
        id: s,
        namespace: h.length > 1 ? h[0] : "",
        name: h[h.length - 1] || s,
        component: s,
        version: n.version || "",
        is_root: n.is_root ?? !n.transitive,
        used_by: r,
        used_by_count: p,
        source: n.source || "local"
      });
    }
  }
  return Array.from(t.values()).filter((n) => n.installed !== !1);
}
function xo(e) {
  const t = e.migrations || [];
  if (t.length === 0) return "";
  const n = t.filter((r) => r.status === "applied").length, s = t.filter((r) => r.status === "pending").length, i = [];
  return n > 0 && i.push(`${n} applied`), s > 0 && i.push(`${s} pending`), i.join(", ") || `${t.length} migrations`;
}
function Tl({ hub: e, installed: t, catalog: n, installedDepFor: s, installedCanUpdate: i, installedUpdateDisabledReason: r, installedCanUninstall: p, installedIsPrivate: h }) {
  const g = j(null), k = j(null), w = j(""), _ = j([]), E = j(!1), R = j("readme"), F = j([]), H = q(() => _.value.filter((z) => z.kind === "env.variable")), x = q(() => _.value.filter((z) => z.kind === "ns.requirement")), N = q(() => {
    const z = {};
    for (const V of _.value) {
      if (V.kind === "env.variable" || V.kind === "ns.requirement") continue;
      const X = zl(V);
      (z[X] ||= []).push(V);
    }
    return Object.entries(z).map(([V, X]) => ({
      key: V,
      label: Yn[V]?.label || V,
      icon: Yn[V]?.icon || "tabler:point",
      items: X
    })).sort((V, X) => X.items.length - V.items.length);
  }), K = q(() => F.value.find((z) => z.version === g.value?.version) || F.value[0]), M = q(() => g.value ? s(g.value.component) : void 0), D = q(() => !!(M.value && i(M.value))), c = q(() => M.value && !i(M.value) ? r(M.value) : ""), Q = q(() => !!(M.value && p(M.value))), m = q(() => un(k.value) || !!(M.value && h(M.value)));
  async function $(z) {
    try {
      const V = t.value.find((oe) => oe.component === z);
      return V?.entries ? V.entries : ((await e.listDependencies({ component: z, includeMigrations: !1 })).dependencies || []).find((oe) => oe.component === z)?.entries || [];
    } catch (V) {
      return Qe("modules:entries", V), [];
    }
  }
  async function L(z, V) {
    if (V && V.full_name) return V;
    const X = n.value.find((te) => An(te, z));
    if (X) return X;
    try {
      const te = z.split("/").pop() || z, ce = ((await e.browseModules({ query: te, pageSize: 50 })).items || []).find((pe) => An(pe, z));
      if (ce) return ce;
    } catch {
    }
    return { full_name: z, component: z, latest_version: "", type: "library" };
  }
  async function ae(z) {
    const V = "component" in z && typeof z.component == "string" && !("full_name" in z) ? z.component : zn(z), X = s(V), te = "full_name" in z ? z : void 0;
    g.value = {
      component: V,
      label: te ? Xt(te) : V,
      description: te?.description || "",
      version: X ? mt(X) : String(te?.latest_version || ""),
      installed: !!X,
      installedId: X?.id
    }, k.value = te || null, w.value = "", _.value = [], F.value = [], R.value = "readme", E.value = !0;
    try {
      const [oe, ce, pe, Ke] = await Promise.all([
        L(V, te),
        e.getReadme(V).then((qe) => qe.content || "").catch(() => ""),
        X ? $(V) : Promise.resolve([]),
        e.listVersions(V).then((qe) => qe.items || []).catch(() => [])
      ]);
      k.value = oe, w.value = ce, _.value = pe, F.value = Ke, g.value && (g.value = {
        ...g.value,
        label: Xt(oe),
        description: oe.description || g.value.description,
        version: X ? mt(X) : String(oe.latest_version || g.value.version)
      }), ce || (R.value = "overview");
    } finally {
      E.value = !1;
    }
  }
  function v() {
    g.value = null;
  }
  async function O() {
    if (!g.value) return;
    const z = g.value.component, V = s(z);
    g.value = {
      ...g.value,
      installed: !!V,
      installedId: V?.id,
      version: V ? mt(V) : g.value.version
    }, _.value = V ? await $(z) : [];
  }
  return {
    selected: g,
    selectedModule: k,
    detailReadme: w,
    detailEntries: _,
    detailLoading: E,
    detailTab: R,
    detailVersions: F,
    envVars: H,
    requirements: x,
    detailGroups: N,
    versionMeta: K,
    selectedInstalledDep: M,
    selectedCanUpdate: D,
    selectedUpdateDisabledReason: c,
    selectedCanUninstall: Q,
    selectedIsPrivate: m,
    loadEntriesFor: $,
    findModule: L,
    openDetail: ae,
    closeDetail: v,
    refreshSelectedDetail: O
  };
}
const Fl = [
  { until: 1e3, label: "Planning uninstall" },
  { until: 4e3, label: "Stopping services" },
  { until: 6e3, label: "Removing entries" },
  { until: 8e3, label: "Updating lock" },
  { until: 1 / 0, label: "Finalizing" }
];
function Vl(e, t) {
  const n = j(0);
  let s = 0, i = null;
  function r() {
    i && (clearInterval(i), i = null);
  }
  Ne(e, (g) => {
    r(), g ? (s = Date.now(), n.value = 0, i = setInterval(() => {
      n.value = Date.now() - s;
    }, 200)) : n.value = 0;
  }), no(r);
  const p = q(() => t.find((g) => n.value < g.until)?.label || t[t.length - 1].label), h = q(() => Math.floor(n.value / 1e3));
  return { phase: p, elapsedSec: h };
}
function Dl({ hub: e, selected: t, selectedInstalledDep: n, installedIsRoot: s, installedUninstallDisabledReason: i, installedCanUninstall: r, refreshAll: p, refreshSelectedDetail: h, showToast: g, notifyModulesChanged: k }) {
  const w = j(!1), _ = j(null), E = j("block"), R = j(!1), F = j(!1), H = j(null), x = j([]), N = j(null), K = j(null), M = j([]), { phase: D, elapsedSec: c } = Vl(R, Fl), Q = q(() => {
    const O = n.value;
    return !t.value?.installed || !O || s(O) ? "" : i(O);
  }), m = q(() => _.value ? R.value ? "Uninstall is running." : F.value ? "Waiting for uninstall preview to finish." : M.value.length > 0 ? `Still required by: ${M.value.join(", ")}. Uninstall those root modules first.` : N.value === "MIGRATIONS_APPLIED" ? 'Applied migrations exist. Choose "Leave applied migrations" or "Revert (down)", then preview again.' : K.value && !H.value ? K.value : H.value ? "" : "Run Preview first so Keeper can show what will be removed." : ""), $ = q(() => _.value ? R.value ? "Uninstall is running." : F.value ? "Waiting for uninstall preview to finish." : M.value.length > 0 ? `Still required by: ${M.value.join(", ")}. Uninstall those root modules first.` : N.value === "MIGRATIONS_APPLIED" ? 'Applied migrations exist. Choose "Leave applied migrations" or "Revert (down)", then preview again.' : "" : "No module selected.");
  async function L(O) {
    r(O) && (_.value = O, E.value = "block", N.value = null, K.value = null, M.value = [], H.value = null, x.value = [], w.value = !0, ae());
  }
  async function ae() {
    const O = _.value;
    if (O) {
      F.value = !0, N.value = null, K.value = null, M.value = [], H.value = null, x.value = [];
      try {
        const z = await e.uninstall({ id: O.id, component: O.component, dry_run: !0, migration_policy: E.value });
        H.value = z.preview || z.payload?.preview || null, H.value || (K.value = "Uninstall preview returned no preview data.");
      } catch (z) {
        if (Qe("modules:uninstall-preview", z), z instanceof Rt && (N.value = z.code, M.value = uo(z.details), z.code === "NOT_FOUND")) {
          w.value = !1, _.value = null, g("ok", "Module already removed; refreshed installed modules"), await p(), await h();
          return;
        }
        K.value = Oe(z, "uninstall preview failed");
      } finally {
        F.value = !1;
      }
    }
  }
  async function v() {
    const O = _.value;
    if (!(!O || $.value)) {
      R.value = !0, N.value = null, K.value = null, x.value = [];
      try {
        const z = await e.uninstall({ id: O.id, component: O.component, migration_policy: E.value });
        x.value = Rn(z), g("ok", `Module uninstalled: ${O.id}`), k(), await p(), await h();
      } catch (z) {
        if (Qe("modules:uninstall", z), z instanceof Rt && (N.value = z.code, M.value = uo(z.details), x.value = Rn(z.details), z.code === "NOT_FOUND")) {
          w.value = !1, _.value = null, g("ok", "Module already removed; refreshed installed modules"), await p(), await h();
          return;
        }
        K.value = Oe(z, "uninstall failed");
      } finally {
        R.value = !1;
      }
    }
  }
  return Ne(E, () => {
    w.value && _.value && !R.value && ae();
  }), {
    uninstallDialogOpen: w,
    uninstallDep: _,
    uninstallPolicy: E,
    uninstallRunning: R,
    uninstallPreviewLoading: F,
    uninstallPreview: H,
    uninstallExecution: x,
    uninstallCode: N,
    uninstallError: K,
    uninstallRequiredBy: M,
    uninstallPhase: D,
    uninstallElapsedSec: c,
    selectedUninstallBlockedReason: Q,
    uninstallBlockedReason: m,
    uninstallActionBlockedReason: $,
    openUninstallDialog: L,
    previewUninstall: ae,
    runUninstall: v
  };
}
function Bl({ hub: e, installed: t, installedError: n, installedCanUpdate: s, installedIsRoot: i, showToast: r, notifyModulesChanged: p, refreshAll: h, refreshSelectedDetail: g }) {
  const k = j({}), w = j(!1), _ = j(!1), E = q(() => t.value.filter((v) => {
    const O = K(v);
    return s(v) && i(v) && O && ["available", "failed", "blocked", "skipped"].includes(O.status) && x(O.latestVersion, mt(v));
  }));
  function R(v) {
    return (String(v || "").trim().replace(/^[^\d]*/, "").match(/\d+(?:\.\d+)*/)?.[0] || "").split(".").filter(Boolean).map(Number);
  }
  function F(v, O) {
    const z = R(v), V = R(O), X = Math.max(z.length, V.length);
    for (let te = 0; te < X; te++) {
      const oe = z[te] || 0, ce = V[te] || 0;
      if (oe !== ce) return oe > ce ? 1 : -1;
    }
    return String(v || "").localeCompare(String(O || ""));
  }
  function H(v = []) {
    const O = v.find((z) => z.is_latest) || v[0];
    return String(O?.version || "");
  }
  function x(v, O) {
    return !!(v && O && v !== O && F(v, O) > 0);
  }
  function N(v) {
    const O = String(v || "").trim().replace(/^[>=<~^]+v?/, "");
    return O ? `>=${O}` : ">=v0.0.0";
  }
  function K(v) {
    return v?.component && k.value[v.component] || null;
  }
  function M(v, O) {
    const z = k.value[v];
    k.value = {
      ...k.value,
      [v]: {
        component: v,
        currentVersion: O.currentVersion ?? z?.currentVersion ?? "",
        latestVersion: O.latestVersion ?? z?.latestVersion ?? "",
        status: O.status ?? z?.status ?? "current",
        message: O.message
      }
    };
  }
  function D(v) {
    const O = K(v);
    return O ? O.status === "available" ? `${O.currentVersion || "?"} → ${O.latestVersion || "?"}` : O.status === "queued" ? "queued" : O.status === "skipped" ? "skipped" : O.status === "planning" ? "planning" : O.status === "updating" ? "updating" : O.status === "updated" ? "updated" : O.status === "blocked" ? "blocked" : O.status === "failed" ? "failed" : "" : "";
  }
  function c(v) {
    const O = K(v)?.status;
    return O === "planning" || O === "updating" ? "tabler:loader-2" : O === "updated" ? "tabler:check" : O === "queued" ? "tabler:clock" : O === "skipped" ? "tabler:player-skip-forward" : O === "blocked" ? "tabler:lock" : O === "failed" ? "tabler:alert-triangle" : "tabler:arrow-up-circle";
  }
  function Q(v) {
    const O = K(v)?.status;
    return O === "planning" || O === "updating";
  }
  async function m() {
    if (!e || w.value) return;
    w.value = !0, n.value = null;
    const v = {};
    let O = 0, z = 0;
    try {
      for (const V of t.value) {
        if (!s(V) || !i(V)) continue;
        const X = mt(V);
        try {
          const te = await e.listVersions(V.component), oe = H(te.items), ce = x(oe, X) ? "available" : "current";
          ce === "available" && O++, v[V.component] = { component: V.component, currentVersion: X, latestVersion: oe, status: ce }, k.value = { ...v };
        } catch (te) {
          z++, v[V.component] = {
            component: V.component,
            currentVersion: X,
            latestVersion: "",
            status: "failed",
            message: Oe(te, "version scan failed")
          }, k.value = { ...v };
        }
      }
      r("ok", `Found ${O} update${O === 1 ? "" : "s"}${z ? `, ${z} failed` : ""}`);
    } finally {
      w.value = !1;
    }
  }
  async function $(v, O) {
    M(v, { status: "planning", message: void 0 });
    try {
      const z = await e.planInstall({ component: v, version: O, run_migrations: !0 }), V = z.missing_requirements || [];
      if (V.length) {
        const X = `Missing required settings: ${V.join(", ")}`;
        return M(v, { status: "blocked", message: X }), null;
      }
      return z;
    } catch (z) {
      const V = Oe(z, "update plan failed");
      return M(v, { status: "failed", message: V }), null;
    }
  }
  async function L(v) {
    if (!e || !v.component) return !1;
    let O = K(v);
    if (!O) {
      const z = mt(v);
      try {
        const V = await e.listVersions(v.component), X = H(V.items);
        O = {
          component: v.component,
          currentVersion: z,
          latestVersion: X,
          status: x(X, z) ? "available" : "current"
        }, M(v.component, O);
      } catch (V) {
        return M(v.component, { status: "failed", message: Oe(V, "version scan failed") }), !1;
      }
    }
    if (!O.latestVersion || !x(O.latestVersion, mt(v))) return !0;
    try {
      const z = N(O.latestVersion), V = await $(v.component, z);
      if (!V) return !1;
      const X = e.install({
        ...V.install_payload,
        component: v.component,
        version: z,
        run_migrations: !0,
        migration_policy: "up"
      });
      return M(v.component, { status: "updating" }), await X, M(v.component, {
        status: "updated",
        currentVersion: O.latestVersion,
        latestVersion: O.latestVersion,
        message: void 0
      }), p(), !0;
    } catch (z) {
      return M(v.component, { status: "failed", message: Oe(z, "update failed") }), !1;
    }
  }
  async function ae() {
    if (_.value || E.value.length === 0) return;
    _.value = !0;
    const v = [...E.value];
    try {
      for (const V of v) M(V.component, { status: "planning" });
      const O = await e.planBatchInstall({
        dependencies: v.map((V) => ({
          id: V.dependencyId,
          component: V.component,
          version: N(K(V).latestVersion)
        })),
        run_migrations: !0,
        migration_policy: "up"
      }), z = /* @__PURE__ */ new Map();
      for (const V of O.plans) {
        const X = V.missing_requirements || [], te = (V.requirements || []).filter((oe) => oe.invalid).map((oe) => `${oe.id || oe.parameter_name}: ${oe.invalid_reason || "invalid value"}`);
        if (V.applicable === !1 || X.length || te.length) {
          const oe = [
            X.length ? `Missing required settings: ${X.join(", ")}` : "",
            te.length ? `Invalid settings: ${te.join(", ")}` : ""
          ].filter(Boolean).join(". ") || "Update plan cannot be applied";
          z.set(V.dependency?.component || "Unknown module", oe);
        }
      }
      if (!O.applicable || z.size) {
        for (const V of v) M(V.component, {
          status: z.has(V.component) ? "blocked" : "skipped",
          message: z.get(V.component) || "Batch not applied because its plan is blocked"
        });
        r("error", z.size ? [...z].map(([V, X]) => `${V}: ${X}`).join("; ") : "Update plan cannot be applied. No modules were changed.");
        return;
      }
      if (!O.install_payload?.dependencies?.length) throw new Error("Update plan returned no install payload");
      for (const V of v) M(V.component, { status: "updating" });
      await e.install(O.install_payload);
      for (const V of v) M(V.component, { status: "updated" });
      p(), r("ok", `Updated ${v.length} module${v.length === 1 ? "" : "s"}`);
    } catch (O) {
      const z = Oe(O, "update failed");
      for (const V of v) M(V.component, { status: "failed", message: z });
      r("error", z);
    } finally {
      try {
        await h(), await g();
      } catch (O) {
        r("error", `Module status could not be refreshed: ${Oe(O, "refresh failed")}`);
      } finally {
        _.value = !1;
      }
    }
  }
  return {
    updateScan: k,
    updateScanLoading: w,
    updateAllRunning: _,
    availableUpdates: E,
    updateInfoForDep: K,
    updateStatusLabel: D,
    updateStatusIcon: c,
    updateStatusBusy: Q,
    scanInstalledUpdates: m,
    updateInstalledDependency: L,
    updateAllAvailable: ae
  };
}
function Rl({ hub: e, loadCatalog: t }) {
  const n = j(!1), s = j(!1), i = j(!1), r = j(!1), p = j(null), h = j(""), g = j(!1), k = j(!1), w = j(null), _ = q(() => p.value?.orgs || []), E = q(() => p.value?.username || p.value?.user_id || ""), R = q(() => !!p.value?.authenticated), F = q(() => !!(p.value?.authenticated && p.value?.expired)), H = q(() => i.value ? "tabler:key" : F.value ? "tabler:alert-triangle" : "tabler:key-off"), x = q(() => i.value ? "Hub token set" : F.value ? "Hub token expired" : "Set Hub token"), N = q(() => {
    const m = p.value?.expires_at;
    if (!m) return "";
    const $ = new Date(m);
    return isNaN($.getTime()) ? "" : $.toLocaleDateString();
  });
  function K(m) {
    p.value = m?.authenticated ? m : null;
    const $ = co(m);
    i.value = $, r.value = $;
  }
  async function M() {
    try {
      const { data: m } = await io.get("/api/v1/user/me");
      n.value = !!(m?.success && m?.security?.is_admin);
    } catch (m) {
      Qe("modules:auth", m), n.value = !1;
    } finally {
      s.value = !0;
    }
  }
  async function D() {
    try {
      const m = await e.authStatus();
      K(m);
    } catch (m) {
      Qe("modules:hub-auth", m);
    }
  }
  async function c() {
    const m = h.value.trim();
    if (!m) {
      w.value = "Paste a Hub token first.";
      return;
    }
    w.value = null, k.value = !0;
    try {
      const $ = await e.authenticate(m);
      K($), co($) ? (h.value = "", g.value = !1, await t()) : w.value = "That token is invalid or expired.";
    } catch ($) {
      w.value = Oe($, "failed to save Hub token");
    } finally {
      k.value = !1;
    }
  }
  async function Q() {
    w.value = null;
    try {
      await e.logout();
    } catch (m) {
      w.value = Oe(m, "failed to clear Hub token");
      return;
    }
    K(null), await t();
  }
  return {
    isAdmin: n,
    authLoaded: s,
    hubConnected: i,
    hubUsable: r,
    hubStatus: p,
    hubToken: h,
    showTokenPanel: g,
    hubConnecting: k,
    hubError: w,
    hubOrgs: _,
    hubIdentity: E,
    hubTokenStored: R,
    hubTokenExpired: F,
    hubTokenIcon: H,
    hubTokenButtonLabel: x,
    hubExpiry: N,
    applyHubAuthStatus: K,
    loadAuth: M,
    loadHubAuth: D,
    saveHubToken: c,
    clearHubToken: Q
  };
}
const jl = ["kickside", "kickside-plugin"], Oo = "kickside", Hl = "https://portal.wippy.ai/account/tokens", Ul = [
  { label: "Block if any applied", value: "block" },
  { label: "Leave applied migrations", value: "leave" },
  { label: "Revert (down) - may lose data", value: "down" }
];
function Nl() {
  const e = Bo(io), t = j(null), n = Rl({ hub: e, loadCatalog: Cn }), {
    isAdmin: s,
    authLoaded: i,
    hubConnected: r,
    hubUsable: p,
    hubStatus: h,
    hubToken: g,
    showTokenPanel: k,
    hubConnecting: w,
    hubError: _,
    hubOrgs: E,
    hubIdentity: R,
    hubTokenStored: F,
    hubTokenExpired: H,
    hubTokenIcon: x,
    hubTokenButtonLabel: N,
    hubExpiry: K,
    loadAuth: M,
    loadHubAuth: D,
    saveHubToken: c,
    clearHubToken: Q
  } = n, m = j([]), $ = j(""), L = j("all"), ae = j(!1), v = j(null), O = j(!0), z = j([]), V = j(!1), X = j(null), te = j(""), oe = j("downloads"), ce = Tl({
    hub: e,
    installed: m,
    catalog: z,
    installedDepFor: It,
    installedCanUpdate: ct,
    installedUpdateDisabledReason: qt,
    installedCanUninstall: Ct,
    installedIsPrivate: Lt
  }), {
    selected: pe,
    selectedModule: Ke,
    detailReadme: qe,
    detailEntries: Re,
    detailLoading: bt,
    detailTab: Le,
    detailVersions: Ht,
    envVars: Tt,
    requirements: Ft,
    detailGroups: ke,
    versionMeta: ht,
    selectedInstalledDep: et,
    selectedCanUpdate: Ge,
    selectedUpdateDisabledReason: tt,
    selectedCanUninstall: nt,
    selectedIsPrivate: Me,
    openDetail: je,
    closeDetail: He,
    refreshSelectedDetail: we
  } = ce, We = Dl({
    hub: e,
    selected: pe,
    selectedInstalledDep: et,
    installedIsRoot: De,
    installedUninstallDisabledReason: Kt,
    installedCanUninstall: Ct,
    refreshAll: Dt,
    refreshSelectedDetail: we,
    showToast: C,
    notifyModulesChanged: Xn
  }), {
    uninstallDialogOpen: Vt,
    uninstallDep: ot,
    uninstallPolicy: Ze,
    uninstallRunning: it,
    uninstallPreviewLoading: vt,
    uninstallPreview: st,
    uninstallExecution: S,
    uninstallCode: A,
    uninstallError: T,
    uninstallRequiredBy: U,
    uninstallPhase: W,
    uninstallElapsedSec: J,
    selectedUninstallBlockedReason: re,
    uninstallBlockedReason: ve,
    uninstallActionBlockedReason: at,
    openUninstallDialog: _t,
    previewUninstall: de,
    runUninstall: ze
  } = We, gt = Bl({
    hub: e,
    installed: m,
    installedError: v,
    installedCanUpdate: ct,
    installedIsRoot: De,
    showToast: C,
    notifyModulesChanged: Xn,
    refreshAll: Dt,
    refreshSelectedDetail: we
  }), {
    updateScanLoading: lt,
    updateAllRunning: xt,
    availableUpdates: fe,
    updateInfoForDep: Ee,
    updateStatusLabel: Se,
    updateStatusIcon: en,
    updateStatusBusy: Ut,
    scanInstalledUpdates: yt,
    updateInstalledDependency: Nt,
    updateAllAvailable: Te
  } = gt, Fe = q(() => {
    const B = /* @__PURE__ */ new Set();
    for (const ee of m.value)
      if (ee.installed !== !1)
        for (const Ae of po(ee)) B.add(Ae);
    return B;
  }), rt = q(() => $i(z.value, te.value)), ge = q(() => rt.value.filter((B) => !Gt(B))), kt = q(() => te.value.trim() || ge.value.length < 7 ? [] : [...ge.value].sort((B, ee) => (ee.total_downloads || 0) - (B.total_downloads || 0)).slice(0, 6)), wt = q(() => new Set(kt.value.map(Pn))), tn = q(() => Ci(ge.value.filter((B) => !wt.value.has(Pn(B))), oe.value)), Ye = q(() => m.value.filter((B) => B.installed !== !1).length), St = q(() => {
    const B = $.value.trim().toLowerCase(), ee = L.value, Ae = m.value.filter((_e) => _e.installed === !1 || ee === "root" && !De(_e) || ee === "transitive" && De(_e) || ee === "local" && _e.source !== "local" ? !1 : B ? [
      _e.component,
      _e.id,
      _e.name,
      _e.namespace,
      _e.version,
      _e.source,
      dt(_e),
      zt(_e),
      xo(_e),
      mt(_e)
    ].filter(Boolean).join(" ").toLowerCase().includes(B) : !0);
    return Ii(Ae, Ve);
  }), ut = q(() => m.value.filter((B) => B.installed !== !1 && !!Ve(B.component)).length), $e = q(() => St.value.filter((B) => !!Ve(B.component)).length), Ie = q(() => i.value && !s.value), be = j(null), Xe = q(() => be.value !== null);
  function Ve(B) {
    return z.value.find((ee) => An(ee, B));
  }
  function $t(B) {
    return dn({ full_name: B.component });
  }
  function Ot(B) {
    const ee = Ve(B.component);
    return ee ? Jt(ee) : "tabler:package";
  }
  function Lt(B) {
    return un(Ve(B.component)) || un(B);
  }
  function De(B) {
    return _i(B || {});
  }
  function dt(B) {
    return xi(B);
  }
  function zt(B) {
    return Oi(B);
  }
  function Kt(B) {
    if (De(B)) return "";
    const ee = zt(B);
    return ee ? `Installed as a dependency; ${ee}` : "Installed as a dependency of another module";
  }
  function ct(B) {
    return !!(B?.component && B.source !== "local");
  }
  function qt(B) {
    return B.source === "local" ? "Local replacement; update from source" : "No Hub dependency update action available";
  }
  function Ct(B) {
    return !!(B && De(B));
  }
  function Gt(B) {
    return po(B).some((ee) => Fe.value.has(ee));
  }
  function It(B) {
    return m.value.find((ee) => An(ee, B));
  }
  function C(B, ee) {
    const Ae = Uo?.toast;
    typeof Ae == "function" ? Ae({ severity: B === "ok" ? "success" : "error", summary: ee }) : (t.value = { kind: B, message: ee }, setTimeout(() => {
      t.value?.message === ee && (t.value = null);
    }, 5e3));
  }
  function b() {
    pe.value && Dn({
      full_name: pe.value.component,
      latest_version: pe.value.version,
      description: pe.value.description
    });
  }
  function Ue() {
    const B = pe.value && It(pe.value.component);
    B && ct(B) && G(B);
  }
  function Fn() {
    const B = pe.value && It(pe.value.component);
    B && Ct(B) && _t(B);
  }
  async function Vn() {
    ae.value = !0, v.value = null;
    try {
      m.value = El(await e.listDependencies());
    } catch (B) {
      m.value = [], Qe("modules:listDependencies", B), v.value = Oe(B, "dependency graph unavailable");
    }
    ae.value = !1;
  }
  async function Cn() {
    V.value = !0, X.value = null;
    try {
      z.value = (await e.fetchAllByKeyword(jl)).filter(zi);
    } catch (B) {
      Qe("modules:catalog", B), B instanceof Rt && (B.code === "UNAUTHORIZED" || B.code === "FORBIDDEN") ? p.value = !1 : X.value = Oe(B, `failed to load ${Oo} catalog`);
    } finally {
      V.value = !1;
    }
  }
  async function Dt() {
    await Promise.all([Vn(), Cn()]);
  }
  function Dn(B) {
    const ee = zn(B);
    be.value = {
      mode: "install",
      component: ee,
      version: B.latest_version ? String(B.latest_version) : "",
      currentId: null,
      catalogItem: Ve(ee) || B,
      installedDep: null
    };
  }
  function G(B) {
    ct(B) && (be.value = {
      mode: "update",
      component: B.component,
      // Let the dialog load and select the newest published release. Seeding
      // this with the resolved version re-submits the current package while
      // presenting the operation as an update.
      version: "",
      currentId: B.dependencyId || null,
      catalogItem: Ve(B.component) || null,
      installedDep: B
    });
  }
  function me() {
    be.value = null;
  }
  async function ue() {
    await Dt(), await we(), me();
  }
  return oo(() => {
    Ho("wc-render-markdown", { timeoutMs: 8e3 }).catch(() => {
    });
  }), Li(async () => {
    await M(), s.value && (await D(), await Dt());
  }), {
    LABEL: Oo,
    HUB_PORTAL: Hl,
    UNINSTALL_MIGRATION_OPTIONS: Ul,
    accessDenied: Ie,
    statusBanner: t,
    hubConnected: r,
    hubStatus: h,
    hubToken: g,
    showTokenPanel: k,
    hubConnecting: w,
    hubError: _,
    hubOrgs: E,
    hubIdentity: R,
    hubTokenStored: F,
    hubTokenExpired: H,
    hubTokenIcon: x,
    hubTokenButtonLabel: N,
    hubExpiry: K,
    selected: pe,
    selectedModule: Ke,
    detailReadme: qe,
    detailEntries: Re,
    detailLoading: bt,
    detailTab: Le,
    detailVersions: Ht,
    envVars: Tt,
    requirements: Ft,
    detailGroups: ke,
    versionMeta: ht,
    selectedCanUpdate: Ge,
    selectedUpdateDisabledReason: tt,
    selectedCanUninstall: nt,
    selectedIsPrivate: Me,
    selectedUninstallBlockedReason: re,
    entryName: Al,
    entryDesc: Pl,
    entryIcon: Ml,
    installed: m,
    installedFilter: $,
    installedKindFilter: L,
    installedTotal: Ye,
    updateScanLoading: lt,
    updateAllRunning: xt,
    availableUpdates: fe,
    installedLoading: ae,
    installedError: v,
    installedOpen: O,
    catalog: z,
    catalogLoading: V,
    catalogError: X,
    catalogInstalledTotal: ut,
    visibleCatalogInstalled: $e,
    browseFilter: te,
    sortBy: oe,
    availableItems: ge,
    featured: kt,
    sortedItems: tn,
    visibleInstalled: St,
    catalogItemFor: Ve,
    installedAccent: $t,
    installedIcon: Ot,
    installedIsPrivate: Lt,
    installedIsRoot: De,
    installedRole: dt,
    installedUsedBy: zt,
    installedCanUpdate: ct,
    installedUpdateDisabledReason: qt,
    installedCanUninstall: Ct,
    installedMigrationSummary: xo,
    updateInfoForDep: Ee,
    updateStatusLabel: Se,
    updateStatusIcon: en,
    updateStatusBusy: Ut,
    scanInstalledUpdates: yt,
    updateInstalledDependency: Nt,
    updateAllAvailable: Te,
    installDialogOpen: Xe,
    installTarget: be,
    closeInstallDialog: me,
    onInstallChanged: ue,
    uninstallDialogOpen: Vt,
    uninstallDep: ot,
    uninstallPolicy: Ze,
    uninstallRunning: it,
    uninstallPreviewLoading: vt,
    uninstallPreview: st,
    uninstallExecution: S,
    uninstallCode: A,
    uninstallError: T,
    uninstallRequiredBy: U,
    uninstallBlockedReason: ve,
    uninstallActionBlockedReason: at,
    uninstallPhase: W,
    uninstallElapsedSec: J,
    previewUninstall: de,
    executionStepLabel: Do,
    openDetail: je,
    closeDetail: He,
    detailInstall: b,
    detailUpdate: Ue,
    detailUninstall: Fn,
    refreshAll: Dt,
    saveHubToken: c,
    clearHubToken: Q,
    openUpdateDialog: G,
    openUninstallDialog: _t,
    installedUninstallDisabledReason: Kt,
    runUninstall: ze
  };
}
const Kl = ["aria-label", "aria-busy"], ql = /* @__PURE__ */ Qt({
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
    async function r() {
      await mn();
      const h = i.value;
      h && (n.visible && !h.open ? h.showModal() : !n.visible && h.open && h.close());
    }
    function p(h) {
      h.preventDefault(), n.busy || s("close");
    }
    return Ne(() => n.visible, r), oo(r), jo(() => {
      i.value?.open && i.value.close();
    }), (h, g) => (l(), u("dialog", {
      ref_key: "dialog",
      ref: i,
      class: "kx-native-dialog",
      "aria-label": e.label,
      "aria-modal": "true",
      "aria-busy": e.busy || void 0,
      onCancel: p,
      onClose: g[1] || (g[1] = () => {
        e.visible && !e.busy && s("close");
      })
    }, [
      a("header", {
        class: ne(e.headerClass)
      }, [
        ie(h.$slots, "header"),
        y(o(ao), {
          type: "button",
          text: "",
          severity: "secondary",
          "aria-label": "Close dialog",
          disabled: e.busy,
          onClick: g[0] || (g[0] = (k) => s("close"))
        }, {
          default: he(() => [...g[2] || (g[2] = [
            P("×", -1)
          ])]),
          _: 1
        }, 8, ["disabled"])
      ], 2),
      a("div", {
        class: ne(e.contentClass)
      }, [
        ie(h.$slots, "default")
      ], 2),
      h.$slots.footer ? (l(), u("footer", {
        key: 0,
        class: ne(e.footerClass)
      }, [
        ie(h.$slots, "footer")
      ], 2)) : f("", !0)
    ], 40, Kl));
  }
}), Gl = ["aria-expanded", "aria-controls", "aria-label", "disabled"], Wl = { class: "p-select-label" }, Zl = {
  key: 0,
  class: "kx-ps-val"
}, Yl = { class: "kx-ps-val-label" }, Xl = {
  key: 1,
  class: "kx-ps-ph"
}, Jl = { class: "p-select-dropdown" }, Ql = { class: "p-select-overlay kx-ps-panel" }, er = { class: "p-select-header" }, tr = ["aria-label", "aria-controls", "aria-activedescendant"], nr = ["id", "aria-label"], or = {
  class: "p-select-option-group",
  role: "presentation"
}, ir = ["id", "aria-selected", "onClick", "onMousemove"], sr = { class: "kx-ps-opt-body" }, ar = { class: "kx-ps-opt-title" }, lr = {
  key: 0,
  class: "kx-ps-opt-sub"
}, rr = {
  key: 0,
  class: "p-select-empty-message",
  role: "status"
}, ur = {
  key: 1,
  class: "p-select-empty-message",
  role: "presentation"
}, dr = {
  key: 0,
  class: "p-select-empty-message",
  role: "alert"
}, cr = ["disabled"], Lo = /* @__PURE__ */ Qt({
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
    const n = e, s = t, i = j(null), r = j(null), p = j(!1), h = j(""), g = j(0), k = ji(), w = q(() => {
      const x = h.value.trim().toLowerCase(), N = /* @__PURE__ */ new Map();
      for (const M of n.items) {
        if (!n.remote && x && ![M.title, M.subtitle, M.id, M.group].some((Q) => Q?.toLowerCase().includes(x))) continue;
        const D = M.group || "Other", c = N.get(D);
        c ? c.push(M) : N.set(D, [M]);
      }
      let K = 0;
      return [...N.entries()].sort((M, D) => M[0].localeCompare(D[0])).map(([M, D]) => ({ group: M, items: D.map((c) => ({ item: c, index: K++ })) }));
    }), _ = q(() => w.value.flatMap((x) => x.items)), E = q(() => n.items.find((x) => x.id === n.modelValue)), R = q(() => _.value[g.value] ? `${k}-${g.value}` : void 0);
    Ne(h, () => {
      g.value = 0;
    }), Ne([p, h], ([x, N]) => {
      x && n.remote && s("search", N);
    }), Ne(() => n.disabled, (x) => {
      x && (p.value = !1);
    }), Ne(p, async (x) => {
      if (!x) {
        i.value?.focus();
        return;
      }
      h.value = "", g.value = Math.max(0, _.value.findIndex(({ item: N }) => N.id === n.modelValue)), await mn(), r.value?.focus();
    });
    function F(x) {
      n.disabled || n.loading || (s("update:modelValue", x.id), p.value = !1);
    }
    async function H(x) {
      if (x.key === "Escape" && p.value) {
        x.preventDefault(), x.stopPropagation(), p.value = !1;
        return;
      }
      if (!["ArrowDown", "ArrowUp", "Home", "End", "Enter"].includes(x.key)) return;
      if (x.preventDefault(), !p.value) {
        p.value = !0;
        return;
      }
      if (x.key === "Enter") {
        const M = _.value[g.value];
        M && F(M.item);
        return;
      }
      const N = _.value.length - 1;
      g.value = x.key === "Home" ? 0 : x.key === "End" ? N : Math.max(0, Math.min(N, g.value + (x.key === "ArrowDown" ? 1 : -1))), await mn(), i.value?.getRootNode()?.querySelector(`[id="${R.value}"]`)?.scrollIntoView({ block: "nearest" });
    }
    return (x, N) => (l(), u(Y, null, [
      a("button", {
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
        onClick: N[0] || (N[0] = (K) => p.value = !p.value),
        onKeydown: H
      }, [
        a("span", Wl, [
          E.value ? (l(), u("span", Zl, [
            y(o(I), {
              icon: E.value.icon || "tabler:point",
              class: "kx-ps-val-ico",
              "aria-hidden": "true"
            }, null, 8, ["icon"]),
            a("span", Yl, d(E.value.title), 1)
          ])) : (l(), u("span", Xl, d(e.placeholder || "Select…"), 1))
        ]),
        a("span", Jl, [
          y(o(I), {
            icon: "tabler:chevron-down",
            "aria-hidden": "true"
          })
        ])
      ], 40, Gl),
      y(ii, {
        open: p.value,
        "onUpdate:open": N[3] || (N[3] = (K) => p.value = K),
        anchor: i.value
      }, {
        default: he(() => [
          a("div", Ql, [
            a("div", er, [
              Be(a("input", {
                ref_key: "search",
                ref: r,
                "onUpdate:modelValue": N[1] || (N[1] = (K) => h.value = K),
                type: "search",
                class: "p-inputtext p-select-filter",
                "aria-label": `Search ${e.ariaLabel || e.placeholder || "options"}`,
                "aria-controls": o(k),
                "aria-activedescendant": R.value,
                onKeydown: H
              }, null, 40, tr), [
                [xn, h.value]
              ])
            ]),
            a("ul", {
              id: o(k),
              class: "p-select-list kx-ps-options",
              role: "listbox",
              "aria-label": e.ariaLabel || e.placeholder || "Options"
            }, [
              (l(!0), u(Y, null, se(w.value, (K) => (l(), u(Y, {
                key: K.group
              }, [
                a("li", or, d(K.group), 1),
                (l(!0), u(Y, null, se(K.items, ({ item: M, index: D }) => (l(), u("li", {
                  id: `${o(k)}-${D}`,
                  key: M.id,
                  class: ne(["p-select-option kx-ps-option", { "p-select-option-selected": M.id === e.modelValue, "p-focus": D === g.value }]),
                  role: "option",
                  "aria-selected": M.id === e.modelValue,
                  onClick: (c) => F(M),
                  onMousemove: (c) => g.value = D
                }, [
                  y(o(I), {
                    icon: M.icon || "tabler:point",
                    class: "kx-ps-opt-ico",
                    "aria-hidden": "true"
                  }, null, 8, ["icon"]),
                  a("span", sr, [
                    a("span", ar, d(M.title), 1),
                    M.subtitle ? (l(), u("span", lr, d(M.subtitle), 1)) : f("", !0)
                  ])
                ], 42, ir))), 128))
              ], 64))), 128)),
              e.loading ? (l(), u("li", rr, "Loading…")) : !_.value.length && !e.error ? (l(), u("li", ur, "No matches")) : f("", !0)
            ], 8, nr),
            e.error ? (l(), u("div", dr, d(e.error), 1)) : f("", !0),
            e.more ? (l(), u("button", {
              key: 1,
              type: "button",
              class: "p-button p-button-secondary",
              "data-testid": "picker-more",
              disabled: e.loading || e.disabled,
              onClick: N[2] || (N[2] = (K) => s("more"))
            }, "Load more", 8, cr)) : f("", !0)
          ])
        ]),
        _: 1
      }, 8, ["open", "anchor"])
    ], 64));
  }
});
function Jn() {
  return { status: "idle", modules: [], findings: [], scanned: 0, total: 0 };
}
function pr(e) {
  return e.some((t) => t.severity === "critical") ? "critical" : e.length > 0 ? "warnings" : "clean";
}
const zo = {
  info: { label: "Info", icon: "tabler:info-circle", tone: "info" },
  warning: { label: "Warning", icon: "tabler:alert-triangle", tone: "warn" },
  critical: { label: "Critical", icon: "tabler:shield-x", tone: "danger" }
};
function mr(e) {
  return e.severity !== "critical";
}
const fr = ["clean", "warnings", "critical", "error", "unavailable", "skipped"];
function Ao(e) {
  return fr.includes(e) ? e : "clean";
}
function br(e) {
  return e === "critical" ? "critical" : e === "warning" ? "warning" : "info";
}
function hr(e) {
  const t = e && typeof e == "object" ? e : {}, n = [], s = [];
  for (const h of t.modules || []) {
    const g = String(h.module || ""), k = h.version ? String(h.version) : void 0, w = (h.findings || []).map((_, E) => ({
      id: `${g}#${E}`,
      module: g,
      version: k,
      severity: br(_.severity),
      title: String(_.title || "Issue"),
      detail: _.detail ? String(_.detail) : void 0,
      location: _.location ? String(_.location) : void 0
    }));
    for (const _ of w) s.push(_);
    n.push({
      module: g,
      version: k,
      status: Ao(h.status),
      summary: h.summary ? String(h.summary) : void 0,
      findings: w
    });
  }
  const i = typeof t.total == "number" ? t.total : n.length, r = typeof t.scanned == "number" ? t.scanned : n.length;
  return {
    status: t.overall_status ? Ao(t.overall_status) : pr(s),
    summary: t.overall_summary ? String(t.overall_summary) : void 0,
    modules: n,
    findings: s,
    scanned: r,
    total: i
  };
}
function vr({ props: e, hub: t, plan: n, activeSection: s, versionArg: i, requirementPayload: r, invalidatePlan: p, refreshPlan: h, planCurrent: g }) {
  const k = j([]), w = j({}), _ = j({}), E = q(() => {
    const S = /* @__PURE__ */ new Map();
    for (const A of k.value) {
      const T = String(A.module || "");
      S.has(T) || S.set(T, []), S.get(T).push(A);
    }
    return Array.from(S.entries()).map(([A, T]) => ({ module: A, items: T, direct: !T.every((U) => In(U, e.component)) })).sort((A, T) => A.direct === T.direct ? A.module.localeCompare(T.module) : A.direct ? -1 : 1);
  }), R = q(() => k.value.filter((S) => !In(S, e.component))), F = q(() => k.value.filter((S) => !Re(S))), H = q(() => k.value.length - R.value.length), x = q(() => {
    const S = [];
    for (const A of k.value) {
      const T = le(A);
      !T || !A.required && !A.missing || v(w.value[T]) && S.push(T);
    }
    return S;
  }), N = q(() => k.value.filter((S) => !v(w.value[le(S)])).length), K = q(() => et().length), M = j(!1), D = j(null);
  let c = null;
  const Q = j(0), m = j({}), $ = q(() => Object.keys(m.value).length);
  let L = 0;
  const ae = /* @__PURE__ */ new Set();
  function v(S) {
    return S == null || S === "" || typeof S == "string" && !S.trim() || Array.isArray(S) && S.length === 0 || typeof S == "object" && Object.keys(S).length === 0;
  }
  function O(S) {
    return S == null ? "" : typeof S == "object" ? JSON.stringify(S) : String(S);
  }
  function z(S) {
    if (S.expected_type) return S.expected_type;
    const A = [S.value, S.default, ...(S.suggestions || []).map((T) => T.value)];
    for (const T of A) {
      if (typeof T == "boolean" || typeof T == "number") return typeof T;
      if (Array.isArray(T)) return "array";
      if (T && typeof T == "object") return "object";
    }
    return "string";
  }
  function V(S, A) {
    if (typeof A != "string") return A;
    const T = A.trim(), U = z(S);
    if (U === "boolean") return /^(true|false)$/.test(T) ? T === "true" : A;
    if (U === "number" || U === "integer") return T && Number.isFinite(Number(T)) ? Number(T) : A;
    if (U === "array" || U === "object")
      try {
        return JSON.parse(T);
      } catch {
        return A;
      }
    return A;
  }
  function X(S, A) {
    const T = z(S);
    return T === "array" ? Array.isArray(A) : T === "object" ? A !== null && typeof A == "object" && !Array.isArray(A) : T === "integer" ? typeof A == "number" && Number.isInteger(A) : typeof A === T && (T !== "number" || Number.isFinite(A));
  }
  function te(S, A) {
    const T = le(S);
    if (!T || Re(S)) return;
    const U = V(S, A ?? "");
    JSON.stringify(w.value[T]) !== JSON.stringify(U) && (ae.add(T), w.value = { ...w.value, [T]: U }, p());
  }
  function oe(S) {
    const A = w.value[le(S)];
    return !Re(S) && !v(A) && !X(S, A);
  }
  function ce(S) {
    const A = z(S);
    return A === "boolean" ? "expects true or false" : `expects ${A === "integer" || A === "object" || A === "array" ? "an" : "a"} ${A}`;
  }
  const pe = q(() => k.value.filter(oe).map(le).filter(Boolean));
  function Ke(S) {
    return O(w.value[le(S)]);
  }
  function qe(S) {
    return (S.required || S.missing) === !0 && v(w.value[le(S)]);
  }
  function Re(S) {
    return In(S, e.component) && S.missing !== !0 && !ae.has(le(S));
  }
  function bt(S) {
    const A = /* @__PURE__ */ new Set(), T = [];
    for (const U of S.suggestions || []) {
      const W = O(U.value).trim();
      if (!W || A.has(W)) continue;
      A.add(W);
      const J = String(U.label || W).trim(), re = [U.kind, U.source, U.description].filter(Boolean).map(String).join(" | ");
      T.push({ label: J && J !== W ? `${J} (${W})` : W, value: W, title: re });
    }
    return T;
  }
  function Le() {
    const S = {}, A = (U, W) => {
      if (U = String(U || "").trim(), !U) return;
      S[U] = W;
      const J = U.includes(":") && U.split(":").pop() || "";
      J && S[J] === void 0 && (S[J] = S[U]);
    }, T = e.installedDep?.parameters;
    if (Array.isArray(T))
      for (const U of T)
        A(U.name, U.value);
    else if (T && typeof T == "object")
      for (const [U, W] of Object.entries(T)) A(U, W);
    return S;
  }
  async function Ht() {
    if (_.value = {}, !!t)
      try {
        const S = await t.listDependencies({ includeEntries: !1, includeMigrations: !1 }), A = {}, T = (U, W) => {
          U = String(U || "").trim();
          const J = String(W ?? "").trim();
          if (!U || !J || A[U] !== void 0) return;
          A[U] = W;
          const re = U.includes(":") && U.split(":").pop() || "";
          re && A[re] === void 0 && (A[re] = A[U]);
        };
        for (const U of S.dependencies || []) {
          const W = U.parameters;
          if (Array.isArray(W))
            for (const J of W) T(J.name, J.value);
          else if (W && typeof W == "object")
            for (const [J, re] of Object.entries(W)) T(J, re);
        }
        _.value = A;
      } catch (S) {
        Qe("install:dependency-parameters", S);
      }
  }
  function Tt(S) {
    for (const A of n.value?.recommended_parameters || [])
      if (A.name === S && O(A.value).trim() !== "") return O(A.value);
    return "";
  }
  function Ft(S) {
    const A = [
      le(S),
      String(S.parameter_name || ""),
      String(S.full_id || ""),
      String(S.name || ""),
      String(S.short_name || "")
    ].map((T) => T.trim()).filter(Boolean);
    for (const T of A) {
      const U = O(_.value[T]).trim();
      if (U) return U;
      const W = T.includes(":") && T.split(":").pop() || "";
      if (W) {
        const J = O(_.value[W]).trim();
        if (J) return J;
      }
    }
    return "";
  }
  function ke(S) {
    const A = le(S);
    if (!A || Re(S) || String(w.value[A] ?? "").trim()) return "";
    const U = Tt(A).trim();
    if (U) return U;
    const W = Ft(S);
    if (W) return W;
    const J = O(S.default).trim();
    if (J) return J;
    const re = bt(S).map((at) => at.value).filter(Boolean);
    if (re.length === 1) return re[0];
    const ve = ht(S);
    return ve.length && ve[0].score > 0 && (ve.length === 1 || ve[0].score > ve[1].score) ? ve[0].value : "";
  }
  function ht(S) {
    return String(S.expected_kind || "").trim() !== "security.scope" ? [] : (S.suggestions || []).map((A) => {
      const T = O(A.value).trim(), U = String(A.label || "").toLowerCase(), W = String(A.description || "").toLowerCase();
      let J = 0;
      return T || (J -= 1e3), (U.includes("system") || W.includes("system") || W.includes("internal")) && (J -= 50), (U.includes("admin") || W.includes("full access") || W.includes("assign sparingly")) && (J -= 50), (W.includes("signed-in") || W.includes("authenticated")) && (J += 30), (U === "user" || U === "member") && (J += 20), { value: T, score: J };
    }).filter((A) => A.value).sort((A, T) => T.score - A.score || A.value.localeCompare(T.value));
  }
  function et() {
    const S = [];
    for (const A of F.value) {
      if (!qe(A)) continue;
      const T = le(A), U = ke(A);
      T && U && S.push({ name: T, value: U });
    }
    return S;
  }
  function Ge(S) {
    return ke(S) !== "";
  }
  function tt(S) {
    const A = le(S), T = ke(S);
    if (!A || !T) {
      s.value = "requirements", Q.value++;
      return;
    }
    te(S, T);
  }
  function nt() {
    const S = et();
    if (!S.length) {
      s.value = "requirements", Q.value++;
      return;
    }
    for (const A of S) {
      const T = k.value.find((U) => le(U) === A.name);
      T && te(T, String(A.value));
    }
  }
  function Me() {
    return F.value.filter((S) => v(w.value[le(S)]) && (S.missing || S.value_source === "conflict" || S.expected_type || bt(S).length)).map((S) => ({ name: S.full_id || le(S) }));
  }
  const je = q(() => Me().length);
  function He(S, A) {
    return v(A) || !X(S, A) ? !1 : !S.expected_kind || !!S.suggestions?.some((T) => T.value === A);
  }
  function we(S) {
    const A = { ...m.value }, T = { ...w.value };
    for (const U of S) {
      const W = A[U];
      W?.value !== void 0 && (T[U] = W.value, ae.add(U), delete A[U]);
    }
    return w.value = T, p(), A;
  }
  async function We(S) {
    if (!g.value || M.value) return;
    const A = we(S), T = L;
    if (await h(), T !== L || !g.value) return;
    const U = {};
    for (const W of F.value) {
      const J = le(W), re = A[J];
      re && v(w.value[J]) && W.expected_type === re.expected_type && W.expected_kind === re.expected_kind && He(W, re.value) && (U[J] = re);
    }
    m.value = U;
  }
  function Vt(S) {
    const A = { ...m.value };
    for (const T of S) delete A[T];
    m.value = A;
  }
  function ot(S) {
    !g.value || M.value || we(S);
  }
  async function Ze(S) {
    const A = Me();
    if (!g.value || !A.length || M.value) return;
    vt();
    const T = L, U = new AbortController();
    c = U, M.value = !0, D.value = null, m.value = {}, await new Promise((W) => {
      let J = !1, re = !1;
      const ve = (de) => {
        if (J) return;
        if (J = !0, clearTimeout(at), U.signal.aborted || T !== L || c !== U) {
          W();
          return;
        }
        c = null;
        const ze = de && typeof de == "object" ? de : {};
        if (ze.success === !0) {
          const gt = new Set(A.map((fe) => fe.name)), lt = {}, xt = new Map((ze.requirements || []).map((fe) => [fe.full_id, fe]));
          k.value = k.value.map((fe) => ({
            ...fe,
            resolution_error: xt.get(fe.full_id)?.resolution_error
          }));
          for (const fe of ze.parameters || []) {
            const Ee = k.value.find((Se) => (Se.full_id || le(Se)) === fe.name || le(Se) === fe.name);
            if (!Ee || !gt.has(Ee.full_id || le(Ee)) || !He(Ee, fe.value) || typeof fe.reason != "string" || !fe.reason.trim()) {
              D.value = { tone: "warning", code: "INVALID_CHOICE", message: "AI returns an invalid planned value or omits its reason. Choose a value manually." };
              continue;
            }
            lt[le(Ee)] = { ...Ee, value: fe.value, choice_reason: fe.reason };
          }
          m.value = lt, Object.keys(lt).length ? D.value = { tone: "success", message: "Review AI suggestions before applying." } : D.value || (D.value = { tone: "warning", message: "No valid AI suggestion is available. Choose a value manually." });
        } else
          D.value = {
            tone: "warning",
            code: ze.code,
            kind: ze.kind,
            details: ze.details,
            message: ze.error || "AI could not resolve these settings. Choose a value manually."
          };
        M.value = !1, W();
      }, at = setTimeout(() => {
        ve({ success: !1, code: "TIMEOUT", error: "AI requirement resolution timed out." }), U.abort();
      }, 2e4);
      U.signal.addEventListener("abort", () => {
        J || (J = !0, clearTimeout(at), W());
      }, { once: !0 });
      const _t = {
        component: e.component,
        ...i() ? { version: i() } : {},
        ...e.mode === "update" && e.currentId ? { current_id: e.currentId } : {},
        ...r(),
        requirements: A,
        signal: U.signal,
        accept: () => {
          J || (re = !0);
        },
        respond: ve
      };
      S?.dispatchEvent(new CustomEvent("instrumentRequirementResolution", { detail: _t, bubbles: !0, composed: !0 })), re || ve({ success: !1, code: "MODEL_UNAVAILABLE", error: "Configure an AI model to suggest settings, or choose values manually." });
    });
  }
  function it(S, A) {
    n.value = S, k.value = (S.requirements || []).filter((W) => W.name !== "required_setup" && W.short_name !== "required_setup");
    const T = Le(), U = {};
    for (const W of k.value) {
      const J = le(W);
      if (!J) continue;
      const re = String(W.name || W.short_name || J.split(":").pop() || "");
      U[J] = (ae.has(J) ? A[J] : v(A[J]) ? void 0 : A[J]) ?? T[J] ?? T[re] ?? _.value[J] ?? _.value[re] ?? W.value ?? W.default ?? "";
    }
    w.value = U;
    for (const W of ae)
      W in U || ae.delete(W);
  }
  function vt() {
    c?.abort(), c = null, M.value = !1, L++, m.value = {}, D.value = null;
  }
  function st() {
    vt(), k.value = [], w.value = {}, ae.clear(), _.value = {}, M.value = !1, D.value = null;
  }
  return {
    pendingSuggestions: m,
    pendingCount: $,
    acceptSuggestions: We,
    rejectSuggestions: Vt,
    editSuggestions: ot,
    displayValue: O,
    requirements: k,
    parameterValues: w,
    installedParameterHints: _,
    requirementGroups: E,
    rootRequirements: R,
    editableRequirements: F,
    transitiveRequirementCount: H,
    missingRequirements: x,
    boundRequirementCount: N,
    autoFitCount: K,
    aiResolving: M,
    aiResolutionNotice: D,
    typeInvalidRequirements: pe,
    highlightTick: Q,
    aiResolvableCount: je,
    setParameter: te,
    requirementTypeInvalid: oe,
    requirementTypeHint: ce,
    requirementValue: Ke,
    requirementMissing: qe,
    requirementReadOnly: Re,
    requirementOptions: bt,
    loadInstalledParameterHints: Ht,
    applyPlan: it,
    recommendedValueFor: Tt,
    hintedValueFor: Ft,
    autoFitValue: ke,
    canAutoFitRequirement: Ge,
    autoFitRequirement: tt,
    autoFitRequirements: nt,
    resolveRequirementsWithAI: Ze,
    abortAI: vt,
    resetRequirements: st
  };
}
function gr({ props: e, hub: t, plan: n, versionArg: s }) {
  const i = j(Jn()), r = j(/* @__PURE__ */ new Set()), p = j(!1);
  let h = 0;
  const g = q(() => i.value.findings.filter(mr)), k = q(() => g.value.filter((x) => !r.value.has(x.id)));
  function w(x) {
    const N = new Set(r.value);
    N.add(x.id), r.value = N;
  }
  function _() {
    const x = new Set(r.value);
    for (const N of g.value) x.add(N.id);
    r.value = x;
  }
  function E(x = 0) {
    h++, i.value = { ...Jn(), total: x }, r.value = /* @__PURE__ */ new Set(), p.value = !1;
  }
  async function R() {
    if (!t || !e.component) return;
    const x = n.value?.graph || [], N = ++h;
    r.value = /* @__PURE__ */ new Set(), p.value = !1, i.value = { status: "scanning", modules: [], findings: [], scanned: 0, total: x.length };
    try {
      const K = await t.scan({ component: e.component, version: s() });
      N === h && (i.value = hr(K));
    } catch (K) {
      if (N === h) {
        const M = K instanceof Rt && (K.status === 404 || K.code === "UNKNOWN" || K.code === "NETWORK");
        i.value = M ? { status: "unavailable", modules: [], findings: [], scanned: 0, total: x.length, error: "Security scan unavailable" } : { status: "error", modules: [], findings: [], scanned: 0, total: x.length, error: Oe(K, "scan failed") };
      }
    }
  }
  function F() {
    const x = n.value?.graph || [];
    h++, i.value = {
      status: "skipped",
      modules: [],
      findings: [],
      scanned: 0,
      total: x.length,
      summary: "Security scan skipped by operator."
    }, r.value = /* @__PURE__ */ new Set(), p.value = !1;
  }
  function H() {
    h++;
  }
  return { scan: i, acknowledged: r, criticalConfirmed: p, softFindings: g, unacknowledgedSoft: k, acknowledge: w, acknowledgeAllSoft: _, resetScanForPlan: E, runScanNow: R, skipScan: F, cancelScan: H };
}
const yr = {
  "hub.install.started": "Publishing changeset",
  "hub.install.finished": "Finalizing",
  "hub.migrations.started": "Running migrations",
  "hub.migrations.finished": "Migrations applied",
  "hub.uninstall.started": "Removing entries"
}, Bn = [
  { label: "Run migrations (up)", value: "up" },
  { label: "Skip migrations (none)", value: "none" }
];
function kr(e) {
  if (!e || typeof e != "object") return "";
  const t = [e, e.data, e.payload, e.detail];
  for (const n of t)
    if (n && typeof n == "object" && typeof n.event == "string")
      return String(n.event);
  return "";
}
function wr(e, t) {
  const n = Bo(io), s = j("overview"), i = j(""), r = j("pin"), p = j([]), h = j(!1), g = q(() => [
    { label: "latest", value: "" },
    ...p.value.map((G) => String(G.version || "")).filter(Boolean).map((G) => ({ label: G, value: G }))
  ]), k = q(() => p.value.find((G) => G.version === i.value) || p.value[0]);
  function w() {
    const G = i.value.trim().replace(/^>=?/, "");
    if (G)
      return r.value === "track" ? `>=${G}` : G;
  }
  const _ = q(() => e.installedDep ? mt(e.installedDep) : ""), E = j(""), R = j(!1), F = j(null), H = j(!1), x = j(!1), N = j(null), K = j(null), M = j(null), D = q(() => (F.value?.graph || []).filter((G) => G.direct || G.module === e.component)), c = q(() => (F.value?.graph || []).filter((G) => !G.direct && G.module !== e.component)), Q = q(() => Ai(F.value?.graph || [])), m = q(() => {
    const G = [], me = (ue, B) => {
      for (const ee of ue)
        G.push({ ...ee, level: B }), me(ee.children, B + 1);
    };
    return me(Q.value, 0), G;
  }), $ = q(() => F.value?.module_count || F.value?.graph?.length || 0), L = q(() => (F.value?.graph || []).reduce((G, me) => G + (me.size_bytes || 0), 0));
  function ae(G) {
    return Ei(G, { currentVersion: _.value, targetModule: e.component });
  }
  const v = vr({ props: e, hub: n, plan: F, activeSection: s, versionArg: w, requirementPayload: Ot, invalidatePlan: b, refreshPlan: It, planCurrent: x }), {
    pendingSuggestions: O,
    pendingCount: z,
    acceptSuggestions: V,
    rejectSuggestions: X,
    editSuggestions: te,
    displayValue: oe,
    requirements: ce,
    requirementGroups: pe,
    rootRequirements: Ke,
    transitiveRequirementCount: qe,
    parameterValues: Re,
    editableRequirements: bt,
    missingRequirements: Le,
    boundRequirementCount: Ht,
    autoFitCount: Tt,
    aiResolvableCount: Ft,
    aiResolving: ke,
    aiResolutionNotice: ht,
    resolveRequirementsWithAI: et,
    highlightTick: Ge,
    setParameter: tt,
    requirementValue: nt,
    requirementMissing: Me,
    requirementReadOnly: je,
    requirementOptions: He,
    typeInvalidRequirements: we,
    requirementTypeInvalid: We,
    requirementTypeHint: Vt,
    canAutoFitRequirement: ot,
    autoFitRequirement: Ze,
    autoFitRequirements: it,
    loadInstalledParameterHints: vt,
    applyPlan: st,
    resetRequirements: S,
    abortAI: A
  } = v, T = j("up"), U = j([]), W = q(() => U.value.length > 0), J = q({
    get: () => W.value ? "up" : T.value,
    set: (G) => {
      T.value = G;
    }
  }), re = q(() => W.value ? [Bn[0]] : Bn), ve = q(() => F.value?.migrations || []), at = q(() => F.value?.dependency?.id || F.value?.install_payload?.id || ""), _t = gr({ props: e, hub: n, plan: F, versionArg: w }), {
    scan: de,
    acknowledged: ze,
    criticalConfirmed: gt,
    softFindings: lt,
    unacknowledgedSoft: xt,
    acknowledge: fe,
    acknowledgeAllSoft: Ee,
    resetScanForPlan: Se,
    runScanNow: en,
    skipScan: Ut,
    cancelScan: yt
  } = _t, Nt = q(() => {
    const G = H.value || ke.value ? { tone: "loading" } : z.value ? { tone: "warn", badge: String(z.value) } : Le.value.length || we.value.length ? { tone: "danger", badge: String(Le.value.length + we.value.length) } : ce.value.length ? { tone: "ok" } : { tone: "none" }, me = {
      scanning: "loading",
      clean: "ok",
      warnings: "warn",
      critical: "danger",
      error: "danger",
      unavailable: "none",
      idle: "none",
      skipped: "none"
    }[de.value.status] || "none";
    return {
      overview: { tone: "none" },
      modules: H.value ? { tone: "loading" } : F.value ? { tone: "none", badge: String($.value) } : { tone: "none" },
      requirements: G,
      scan: { tone: me, badge: de.value.findings.length ? String(de.value.findings.length) : void 0 },
      review: ve.value.length ? { tone: "none", badge: String(ve.value.length) } : { tone: "none" }
    };
  }), Te = j(!1), Fe = j(!1), rt = j(null), ge = j(null), kt = j(null), wt = j(null), tn = q(() => Rn(rt.value || wt.value)), Ye = j(""), St = j(0);
  let ut = null, $e = null, Ie = 0, be = 0, Xe = 0;
  function Ve() {
    Ye.value = "", St.value = 0;
    const G = Date.now();
    ut = setInterval(() => {
      St.value = Math.floor((Date.now() - G) / 1e3);
    }, 250);
    try {
      const me = Ni("keeper.hub", (ue) => {
        const B = yr[kr(ue)];
        B && (Ye.value = B);
      });
      $e = typeof me == "function" ? me : null;
    } catch {
      $e = null;
    }
  }
  function $t() {
    if (ut && (clearInterval(ut), ut = null), $e) {
      try {
        $e();
      } catch {
      }
      $e = null;
    }
  }
  function Ot() {
    const G = [], me = [];
    for (const ue of bt.value) {
      const B = le(ue);
      if (!B) continue;
      const ee = Re.value[B], Ae = typeof ee == "string" ? ee.trim() : ee;
      if (Ae == null || Ae === "") continue;
      (In(ue, e.component) ? me : G).push({ name: B, value: Ae });
    }
    return {
      parameters: G.length ? G : void 0,
      requirement_bindings: me.length ? me : void 0
    };
  }
  function Lt(G, me) {
    const ue = Uo?.toast;
    typeof ue == "function" && ue({ severity: G === "ok" ? "success" : "error", summary: me });
  }
  async function De(G) {
    if (!n || !e.component || !x.value || F.value?.applicable === !1 || z.value || ke.value) return;
    const me = ++Xe, ue = () => me === Xe && e.open;
    G ? Fe.value = !0 : Te.value = !0, rt.value = null, kt.value = null, ge.value = null, wt.value = null, G || Ve();
    let B = !1;
    try {
      const ee = await n.install({
        component: e.component,
        version: w(),
        id: e.mode === "update" && e.currentId ? e.currentId : void 0,
        dry_run: G || void 0,
        migration_policy: J.value,
        ...Ot()
      });
      if (!ue()) return;
      if (ee.success !== !0) throw new Rt("INSTALL_INCOMPLETE", "Keeper does not confirm a successful install.", void 0, ee);
      if (G || await Ti(n, U.value, {
        isCurrent: ue,
        onPhase: (Ae) => {
          Ye.value = Ae;
        }
      }), !ue()) return;
      if (rt.value = ee, !G) {
        const Ae = e.mode === "update" ? "updated" : "installed";
        Lt("ok", `Module ${Ae}: ${ee.dependency?.id || e.component}`), Xn(), B = !0;
      }
    } catch (ee) {
      if (!ue()) return;
      Qe("install:run", ee), ee instanceof Rt && (kt.value = ee.code, wt.value = ee.details), ge.value = Oe(ee, G ? "preview failed" : "install failed"), Lt("error", ge.value);
    } finally {
      me === Xe && (G ? Fe.value = !1 : (Te.value = !1, $t()));
    }
    B && t("changed");
  }
  const dt = q(() => !F.value || N.value ? "modules" : z.value || ke.value || Le.value.length || we.value.length || !x.value || F.value.applicable === !1 || ce.value.some((G) => G.invalid) ? "requirements" : de.value.status === "idle" || de.value.status === "scanning" || de.value.status === "critical" && !gt.value || xt.value.length ? "scan" : null), zt = q(() => Te.value || Fe.value || H.value || !F.value || !!N.value || !x.value || z.value > 0 || ke.value || de.value.status === "scanning" || s.value === "scan" && de.value.status === "idle"), Kt = q(() => {
    if (z.value) return `Review ${z.value} AI suggestion${z.value === 1 ? "" : "s"}`;
    if (ke.value) return "Resolving settings…";
    if (!x.value) return "Validating settings…";
    const G = Le.value.length;
    return G ? `${G} required setting${G === 1 ? "" : "s"} missing` : "Review requirement errors";
  }), ct = q(() => Te.value || Fe.value || H.value || !F.value || !!N.value || !x.value || z.value > 0 || ke.value), qt = q(() => Te.value ? e.mode === "update" ? "Updating…" : "Installing…" : dt.value === "scan" && de.value.status === "idle" ? s.value === "scan" ? "Choose scan option" : "Review scan choice" : dt.value === "scan" && s.value === "scan" && (de.value.status === "warnings" || de.value.status === "critical") ? "Install anyway" : e.mode === "update" ? "Update" : "Install");
  function Ct() {
    if (zt.value) return;
    const G = dt.value;
    if (G === "requirements") {
      s.value = "requirements", Ge.value++;
      return;
    }
    if (G === "scan") {
      if (s.value !== "scan") {
        s.value = "scan";
        return;
      }
      if (de.value.status === "idle" || de.value.status === "scanning" || de.value.status === "critical" && !gt.value || (Ee(), dt.value)) return;
    }
    if (G === "modules") {
      s.value = "modules";
      return;
    }
    De(!1);
  }
  function Gt() {
    if (!x.value || F.value?.applicable === !1 || z.value || ke.value || ce.value.some((G) => G.invalid) || Le.value.length || we.value.length) {
      s.value = "requirements", Ge.value++;
      return;
    }
    s.value = "review", De(!0);
  }
  async function It() {
    if (!n || !e.component) return;
    C && (clearTimeout(C), C = null);
    const G = ++Ie;
    x.value = !1, H.value = !0, N.value = null, K.value = null, M.value = null;
    const me = { ...Re.value };
    try {
      const ue = await n.planInstall({
        component: e.component,
        version: w(),
        id: e.mode === "update" && e.currentId ? e.currentId : void 0,
        run_migrations: J.value === "up",
        ...Ot()
      });
      if (G !== Ie || !e.open) return;
      const B = Mi(ue.requirements || []);
      U.value = B, st(ue, me), x.value = !0, Se((ue.graph || []).length);
    } catch (ue) {
      if (G !== Ie || !e.open) return;
      Qe("install:plan", ue), F.value = null, de.value = Jn(), N.value = Oe(ue, "failed to plan install"), ue instanceof Rt && (K.value = ue.code, M.value = ue.details);
    } finally {
      G === Ie && (H.value = !1);
    }
  }
  let C = null;
  function b() {
    Ie++, x.value = !1, A(), Ue();
  }
  function Ue() {
    C && clearTimeout(C), C = setTimeout(() => {
      It();
    }, 350);
  }
  async function Fn() {
    if (p.value = [], !(!n || !e.component)) {
      h.value = !0;
      try {
        const G = await n.listVersions(e.component);
        p.value = G.items || [];
      } catch (G) {
        Qe("install:versions", G);
      } finally {
        h.value = !1;
      }
    }
  }
  async function Vn() {
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
  function Cn() {
    Ie++, s.value = "overview", F.value = null, x.value = !1, U.value = [], Te.value = !1, Fe.value = !1, N.value = null, K.value = null, M.value = null, J.value = "up", rt.value = null, ge.value = null, kt.value = null, wt.value = null, S(), Se(), E.value = "", p.value = [];
  }
  async function Dt() {
    const G = ++be;
    Cn(), i.value = e.mode === "update" ? "" : e.version || "", r.value = "track", await Promise.all([Fn(), Vn(), vt()]), !(!e.open || G !== be) && (e.mode === "update" && !i.value && p.value.length && (i.value = String(p.value[0].version || "")), await It());
  }
  Ne(() => e.open, (G) => {
    if (G) {
      Dt();
      return;
    }
    A(), $t(), Xe++, Te.value = !1, Fe.value = !1, be++, Ie++, yt(), C && (clearTimeout(C), C = null);
  }, { immediate: !0 }), Ne([i, r], () => {
    e.open && n && b();
  }, { flush: "sync" }), Ne(J, () => {
    e.open && n && F.value && b();
  }, { flush: "sync" }), no(() => {
    Xe++, A(), $t(), be++, Ie++, yt(), C && clearTimeout(C);
  });
  function Dn() {
    A(), Xe++, Te.value = !1, Fe.value = !1, $t(), t("close");
  }
  return {
    // nav
    activeSection: s,
    sectionStatus: Nt,
    blockingSection: dt,
    // version
    version: i,
    versionMode: r,
    versionOptions: g,
    versionsLoading: h,
    versionMeta: k,
    currentVersion: _,
    // overview
    readme: E,
    readmeLoading: R,
    // plan
    plan: F,
    planCurrent: x,
    planLoading: H,
    planError: N,
    planCode: K,
    planErrorDetails: M,
    directModules: D,
    transitiveModules: c,
    planTree: Q,
    planRows: m,
    moduleCount: $,
    totalSize: L,
    badgesForNode: ae,
    // requirements
    requirements: ce,
    requirementGroups: pe,
    rootRequirements: Ke,
    editableRequirements: bt,
    transitiveRequirementCount: qe,
    parameterValues: Re,
    missingRequirements: Le,
    boundRequirementCount: Ht,
    autoFitCount: Tt,
    aiResolvableCount: Ft,
    aiResolving: ke,
    aiResolutionNotice: ht,
    resolveRequirementsWithAI: et,
    pendingSuggestions: O,
    pendingCount: z,
    acceptSuggestions: V,
    rejectSuggestions: X,
    editSuggestions: te,
    displayValue: oe,
    highlightTick: Ge,
    setParameter: tt,
    requirementValue: nt,
    requirementMissing: Me,
    requirementReadOnly: je,
    requirementOptions: He,
    requirementConfiguredBy: Pi,
    typeInvalidRequirements: we,
    requirementTypeInvalid: We,
    requirementTypeHint: Vt,
    canAutoFitRequirement: ot,
    autoFitRequirement: Ze,
    autoFitRequirements: it,
    // review / options
    requiredSetup: W,
    migrationPolicy: J,
    migrationOptions: re,
    migrations: ve,
    destinationId: at,
    INSTALL_MIGRATION_OPTIONS: Bn,
    // scan
    scan: de,
    acknowledged: ze,
    criticalConfirmed: gt,
    softFindings: lt,
    unacknowledgedSoft: xt,
    acknowledge: fe,
    acknowledgeAllSoft: Ee,
    runScanNow: en,
    skipScan: Ut,
    // execution
    running: Te,
    dryRunning: Fe,
    result: rt,
    resultError: ge,
    resultCode: kt,
    resultErrorDetails: wt,
    resultExecution: tn,
    executionStepLabel: Do,
    progressPhase: Ye,
    elapsedSec: St,
    requirementStatusMessage: Kt,
    primaryDisabled: zt,
    previewDisabled: ct,
    primaryLabel: qt,
    primaryAction: Ct,
    preview: Gt,
    refreshPlan: It,
    close: Dn
  };
}
const Sr = { class: "km-2p-head-icon" }, $r = { class: "km-2p-head-text" }, Cr = { class: "km-2p-head-title" }, Ir = { class: "km-2p-head-sub" }, _r = { class: "km-dim km-mono" }, xr = { class: "km-2p" }, Or = {
  class: "km-2p-nav",
  "aria-label": "Install steps"
}, Lr = ["onClick"], zr = { class: "km-2p-navlabel" }, Ar = { class: "km-2p-navstatus" }, Pr = {
  key: 2,
  class: "km-dot km-dot-danger",
  "aria-hidden": "true"
}, Mr = {
  key: 3,
  class: "km-dot km-dot-warn",
  "aria-hidden": "true"
}, Er = {
  key: 4,
  class: "km-navbadge"
}, Tr = { class: "km-sec" }, Fr = { class: "km-ov-hero" }, Vr = { class: "km-ov-icon" }, Dr = { class: "km-grow km-min0" }, Br = { class: "km-row-wrap" }, Rr = { class: "km-ov-name" }, jr = {
  key: 0,
  class: "badge-app kx-tag-caps"
}, Hr = {
  key: 1,
  class: "badge-warn kx-tag-caps"
}, Ur = { class: "km-ov-org km-mono" }, Nr = {
  key: 0,
  class: "km-ov-desc"
}, Kr = {
  key: 1,
  class: "km-hint"
}, qr = { class: "km-field" }, Gr = { class: "km-row-gap" }, Wr = {
  class: "km-seg",
  role: "group",
  "aria-label": "Version mode"
}, Zr = ["aria-pressed"], Yr = ["aria-pressed"], Xr = { class: "km-hint" }, Jr = { class: "km-ov-meta" }, Qr = { class: "km-meta-row" }, eu = {
  key: 0,
  class: "km-meta-row"
}, tu = {
  key: 1,
  class: "km-meta-row"
}, nu = ["title"], ou = {
  key: 2,
  class: "km-meta-row"
}, iu = {
  key: 3,
  class: "km-meta-row"
}, su = {
  key: 4,
  class: "km-meta-row"
}, au = {
  key: 5,
  class: "km-meta-row"
}, lu = {
  key: 2,
  class: "km-loading"
}, ru = {
  key: 3,
  class: "km-ov-readme"
}, uu = { class: "km-sec" }, du = {
  key: 1,
  class: "km-msg km-msg-err"
}, cu = {
  key: 0,
  class: "km-code"
}, pu = { class: "km-sec-title" }, mu = {
  key: 0,
  class: "km-dim"
}, fu = {
  key: 1,
  class: "km-tree-spacer",
  "aria-hidden": "true"
}, bu = { class: "km-mrow-badge kx-tag-caps" }, hu = { class: "km-mrow-name km-mono" }, vu = {
  key: 2,
  class: "km-mrow-ver km-mono"
}, gu = {
  key: 3,
  class: "km-dim km-mono"
}, yu = {
  key: 4,
  class: "km-dim"
}, ku = { class: "km-sec" }, wu = {
  key: 1,
  class: "km-empty-inline"
}, Su = { class: "km-sec-title" }, $u = { class: "km-dim" }, Cu = { class: "km-req-toolbar" }, Iu = ["disabled"], _u = ["disabled"], xu = {
  key: 0,
  class: "km-code"
}, Ou = {
  key: 1,
  class: "km-code"
}, Lu = {
  key: 2,
  class: "km-mono"
}, zu = {
  key: 1,
  class: "km-req-toolbar",
  role: "status"
}, Au = { class: "km-grow" }, Pu = ["disabled"], Mu = ["disabled"], Eu = { class: "km-req-group-head" }, Tu = { class: "km-mono" }, Fu = {
  key: 0,
  class: "km-dim"
}, Vu = { class: "km-req-meta" }, Du = { class: "km-mono km-req-name" }, Bu = {
  key: 0,
  class: "km-req-flag"
}, Ru = {
  key: 1,
  class: "km-chip km-mono"
}, ju = ["onClick"], Hu = ["aria-label", "disabled", "value", "list", "placeholder", "onInput"], Uu = ["id"], Nu = ["value", "title"], Ku = {
  key: 1,
  class: "km-readonly-field km-mono"
}, qu = { class: "km-req-foot" }, Gu = {
  key: 0,
  class: "km-req-src"
}, Wu = {
  key: 1,
  class: "km-req-invalid"
}, Zu = {
  key: 2,
  class: "km-req-invalid"
}, Yu = {
  key: 3,
  class: "km-req-info"
}, Xu = {
  key: 4,
  class: "km-req-info"
}, Ju = ["aria-label"], Qu = { class: "km-mono" }, ed = { class: "km-row-gap" }, td = ["disabled", "onClick"], nd = ["onClick"], od = ["onClick"], id = {
  key: 3,
  class: "km-msg km-msg-err",
  role: "alert"
}, sd = { class: "km-code" }, ad = { key: 0 }, ld = {
  key: 4,
  class: "km-req-desc"
}, rd = { class: "km-sec" }, ud = { class: "km-sec-title" }, dd = {
  key: 0,
  class: "km-scan-run"
}, cd = {
  key: 1,
  class: "km-msg km-msg-info"
}, pd = {
  key: 2,
  class: "km-scan-run"
}, md = { class: "km-grow" }, fd = {
  key: 3,
  class: "km-empty-inline"
}, bd = {
  key: 4,
  class: "km-msg km-msg-err"
}, hd = {
  key: 5,
  class: "km-msg km-msg-info"
}, vd = {
  key: 0,
  class: "km-scan-overall"
}, gd = {
  key: 1,
  class: "km-msg km-msg-err"
}, yd = { class: "km-scan-mod-head" }, kd = { class: "km-mono km-scan-mod-name" }, wd = { class: "km-chip" }, Sd = {
  key: 0,
  class: "km-scan-mod-sum"
}, $d = { class: "km-grow km-min0" }, Cd = { class: "km-finding-head" }, Id = { class: "km-finding-title" }, _d = {
  key: 0,
  class: "km-finding-detail"
}, xd = {
  key: 1,
  class: "km-finding-loc km-mono"
}, Od = ["onClick"], Ld = {
  key: 1,
  class: "km-dim km-scan-mod-clean"
}, zd = {
  key: 2,
  class: "km-check km-mt"
}, Ad = { class: "km-sec" }, Pd = { class: "km-sec-title" }, Md = { class: "km-review-grid" }, Ed = { class: "km-review-tile" }, Td = { class: "km-review-tile" }, Fd = { class: "km-review-tile" }, Vd = { class: "km-review-tile" }, Dd = { class: "km-field" }, Bd = {
  key: 0,
  class: "km-hint"
}, Rd = {
  key: 1,
  class: "km-mig-list"
}, jd = { class: "km-mono km-trunc" }, Hd = { class: "km-chip" }, Ud = { class: "km-hint" }, Nd = { class: "km-adv" }, Kd = { class: "km-adv-body" }, qd = { class: "km-meta-row" }, Gd = { class: "km-mono" }, Wd = { class: "km-meta-row" }, Zd = { class: "km-mono" }, Yd = {
  key: 0,
  class: "km-panel km-panel-ok"
}, Xd = { class: "km-panel-title" }, Jd = {
  key: 0,
  class: "km-dim"
}, Qd = {
  key: 1,
  class: "km-dim"
}, ec = {
  key: 0,
  class: "km-dim"
}, tc = { class: "km-mono" }, nc = {
  key: 1,
  class: "km-dim"
}, oc = {
  key: 2,
  class: "km-dim"
}, ic = {
  key: 1,
  class: "km-ledger"
}, sc = { class: "km-ledger-step" }, ac = { class: "km-grow" }, lc = { class: "km-chip" }, rc = {
  key: 0,
  class: "km-ledger-msg"
}, uc = {
  key: 2,
  class: "km-msg km-msg-err"
}, dc = {
  key: 0,
  class: "km-code"
}, cc = {
  key: 0,
  class: "km-running km-2p-progress"
}, pc = { class: "km-grow km-running-label" }, mc = { class: "km-dim" }, fc = {
  key: 0,
  class: "km-foot-note"
}, bc = ["disabled"], hc = ["disabled"], vc = ["disabled"], gc = /* @__PURE__ */ Qt({
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
    const n = e, i = wr(n, t), r = [
      { key: "overview", label: "Overview", icon: "tabler:info-circle" },
      { key: "modules", label: "Modules", icon: "tabler:hierarchy-2" },
      { key: "requirements", label: "Requirements", icon: "tabler:adjustments" },
      { key: "scan", label: "Security scan", icon: "tabler:shield-check" },
      { key: "review", label: "Review & install", icon: "tabler:checklist" }
    ], p = q(() => n.catalogItem || { full_name: n.component, component: n.component }), h = q(() => dn(p.value)), g = q(() => n.mode === "update" ? "Update module" : "Install module");
    function k(D) {
      const c = i.requirementOptions(D), Q = i.requirementValue(D);
      return Q && !c.some((m) => m.value === Q) ? [{ label: `${Q} (current)`, value: Q }, ...c] : c;
    }
    function w(D) {
      return `km-req-options-${le(D).replace(/[^a-zA-Z0-9_-]/g, "-")}`;
    }
    function _(D) {
      return {
        provided: "you set this",
        provided_bare: "you set this",
        existing: "auto-detected",
        existing_bare: "auto-detected",
        default: "package default",
        registry: "from registry",
        conflict: "multiple candidates — pick one"
      }[String(D.value_source || "")] || "";
    }
    const E = j(null), R = j(!1);
    let F;
    no(() => clearTimeout(F)), Ne(() => i.highlightTick.value, async (D, c, Q) => {
      let m = !0;
      if (Q(() => {
        m = !1;
      }), i.activeSection.value !== "requirements" || (await mn(), !m)) return;
      E.value?.querySelector(".km-req.is-missing, .km-req.is-invalid")?.scrollIntoView({ block: "center", behavior: "smooth" }), R.value = !0, clearTimeout(F), F = setTimeout(() => {
        R.value = !1;
      }, 1200);
    });
    function H(D) {
      return zo[D.severity].tone;
    }
    function x(D) {
      return D === "critical" || D === "error" ? "km-dot-danger" : D === "warnings" ? "km-dot-warn" : "km-dot-ok";
    }
    function N(D) {
      return `km-plan-badge kx-tag-caps km-plan-badge-${D}`;
    }
    function K(D) {
      return D === "failed" || D === "rollback_failed" ? "km-ledger-bad" : D === "rolled_back" ? "km-ledger-warn" : "km-ledger-ok";
    }
    const M = q(() => i.progressPhase.value || (n.mode === "update" ? "Updating…" : "Installing…"));
    return oo(() => {
      Ho("wc-render-markdown", { timeoutMs: 8e3 }).catch(() => {
      });
    }), (D, c) => {
      const Q = Ce("wc-render-markdown");
      return l(), ye(ql, {
        visible: e.open,
        busy: o(i).running.value || o(i).dryRunning.value,
        label: g.value,
        class: "km-dialog km-dialog-2p",
        "header-class": "km-modal-head km-2p-head",
        "content-class": "km-dialog-content km-dialog-content-2p",
        "footer-class": "km-modal-foot km-2p-foot",
        style: jt({ "--accent": h.value }),
        onClose: c[19] || (c[19] = (m) => o(i).close())
      }, {
        header: he(() => [
          a("span", Sr, [
            y(o(I), {
              icon: o(Jt)(p.value),
              "aria-hidden": "true"
            }, null, 8, ["icon"])
          ]),
          a("span", $r, [
            a("span", Cr, d(g.value), 1),
            a("span", Ir, [
              P(d(o(Xt)(p.value)) + " ", 1),
              a("span", _r, d(n.component), 1)
            ])
          ])
        ]),
        footer: he(() => [
          o(i).running.value ? (l(), u("div", cc, [
            y(o(I), {
              icon: "tabler:loader-2",
              class: "km-i spin km-accent",
              "aria-hidden": "true"
            }),
            a("span", pc, d(M.value), 1),
            a("span", mc, d(o(i).elapsedSec.value) + "s", 1)
          ])) : (l(), u(Y, { key: 1 }, [
            o(i).blockingSection.value === "requirements" ? (l(), u("span", fc, [
              y(o(I), {
                icon: "tabler:alert-triangle",
                class: "km-i-sm",
                "aria-hidden": "true"
              }),
              P(" " + d(o(i).requirementStatusMessage.value), 1)
            ])) : f("", !0),
            o(i).blockingSection.value === "requirements" ? (l(), u("button", {
              key: 1,
              class: "km-btn km-btn-secondary km-btn-outlined km-btn-sm",
              disabled: o(i).autoFitCount.value === 0,
              onClick: c[15] || (c[15] = (m) => o(i).autoFitRequirements())
            }, [
              y(o(I), {
                icon: "tabler:wand",
                class: "km-i",
                "aria-hidden": "true"
              }),
              c[69] || (c[69] = P(" Auto-fit ", -1))
            ], 8, bc)) : f("", !0),
            c[71] || (c[71] = a("span", { class: "km-grow" }, null, -1)),
            a("button", {
              class: "km-btn km-btn-text km-btn-secondary km-btn-sm",
              onClick: c[16] || (c[16] = (m) => o(i).close())
            }, "Cancel"),
            a("button", {
              class: "km-btn km-btn-secondary km-btn-outlined km-btn-sm",
              disabled: o(i).previewDisabled.value,
              onClick: c[17] || (c[17] = (m) => o(i).preview())
            }, [
              y(o(I), {
                icon: o(i).dryRunning.value ? "tabler:loader-2" : "tabler:eye",
                class: ne(["km-i", o(i).dryRunning.value && "spin"]),
                "aria-hidden": "true"
              }, null, 8, ["icon", "class"]),
              c[70] || (c[70] = P(" Preview changes ", -1))
            ], 8, hc),
            a("button", {
              class: "km-btn km-btn-sm",
              disabled: o(i).primaryDisabled.value,
              onClick: c[18] || (c[18] = (m) => o(i).primaryAction())
            }, [
              y(o(I), {
                icon: n.mode === "update" ? "tabler:refresh-dot" : "tabler:download",
                class: "km-i",
                "aria-hidden": "true"
              }, null, 8, ["icon"]),
              P(" " + d(o(i).primaryLabel.value), 1)
            ], 8, vc)
          ], 64))
        ]),
        default: he(() => [
          a("div", xr, [
            a("nav", Or, [
              (l(), u(Y, null, se(r, (m) => a("button", {
                key: m.key,
                class: ne(["km-2p-navitem", { active: o(i).activeSection.value === m.key }]),
                onClick: ($) => o(i).activeSection.value = m.key
              }, [
                y(o(I), {
                  icon: m.icon,
                  class: "km-i",
                  "aria-hidden": "true"
                }, null, 8, ["icon"]),
                a("span", zr, d(m.label), 1),
                a("span", Ar, [
                  o(i).sectionStatus.value[m.key].tone === "loading" ? (l(), ye(o(I), {
                    key: 0,
                    icon: "tabler:loader-2",
                    class: "km-i-sm spin km-dim",
                    "aria-hidden": "true"
                  })) : o(i).sectionStatus.value[m.key].tone === "ok" ? (l(), ye(o(I), {
                    key: 1,
                    icon: "tabler:circle-check-filled",
                    class: "km-i-sm km-sev-ok-fg",
                    "aria-hidden": "true"
                  })) : o(i).sectionStatus.value[m.key].tone === "danger" ? (l(), u("span", Pr)) : o(i).sectionStatus.value[m.key].tone === "warn" ? (l(), u("span", Mr)) : f("", !0),
                  o(i).sectionStatus.value[m.key].badge ? (l(), u("span", Er, d(o(i).sectionStatus.value[m.key].badge), 1)) : f("", !0)
                ])
              ], 10, Lr)), 64))
            ]),
            a("div", {
              ref_key: "mainRef",
              ref: E,
              class: "km-2p-main"
            }, [
              Be(a("section", Tr, [
                a("div", Fr, [
                  a("span", Vr, [
                    y(o(I), {
                      icon: o(Jt)(p.value),
                      class: "km-i-lg",
                      "aria-hidden": "true"
                    }, null, 8, ["icon"])
                  ]),
                  a("div", Dr, [
                    a("div", Br, [
                      a("span", Rr, d(o(Xt)(p.value)), 1),
                      o(ln)(p.value) ? (l(), u("span", jr, "app")) : f("", !0),
                      p.value.deprecated ? (l(), u("span", Hr, "deprecated")) : f("", !0)
                    ]),
                    a("div", Ur, d(n.component), 1)
                  ])
                ]),
                p.value.description ? (l(), u("p", Nr, d(p.value.description), 1)) : f("", !0),
                n.mode === "update" && !n.currentId ? (l(), u("p", Kr, " Updating this module creates an application root dependency for the selected version. This version also applies to modules that depend on it; the plan shows any conflicts. ")) : f("", !0),
                a("div", qr, [
                  c[21] || (c[21] = a("label", { class: "km-label" }, "Version", -1)),
                  a("div", Gr, [
                    y(Lo, {
                      modelValue: o(i).version.value,
                      "onUpdate:modelValue": c[0] || (c[0] = (m) => o(i).version.value = m),
                      class: "km-sort km-grow",
                      items: o(i).versionOptions.value.map((m) => ({ id: m.value, title: m.label })),
                      placeholder: "latest",
                      "aria-label": "Version"
                    }, null, 8, ["modelValue", "items"])
                  ]),
                  a("div", Wr, [
                    a("button", {
                      class: ne(["km-seg-btn", { active: o(i).versionMode.value === "pin" }]),
                      "aria-pressed": o(i).versionMode.value === "pin",
                      onClick: c[1] || (c[1] = (m) => o(i).versionMode.value = "pin")
                    }, [
                      y(o(I), {
                        icon: "tabler:pin",
                        class: "km-i-sm",
                        "aria-hidden": "true"
                      }),
                      P(" Pin " + d(o(i).version.value || "latest"), 1)
                    ], 10, Zr),
                    a("button", {
                      class: ne(["km-seg-btn", { active: o(i).versionMode.value === "track" }]),
                      "aria-pressed": o(i).versionMode.value === "track",
                      onClick: c[2] || (c[2] = (m) => o(i).versionMode.value = "track")
                    }, [
                      y(o(I), {
                        icon: "tabler:arrow-up-circle",
                        class: "km-i-sm",
                        "aria-hidden": "true"
                      }),
                      c[20] || (c[20] = P(" Track updates ", -1))
                    ], 10, Yr)
                  ]),
                  a("p", Xr, d(o(i).versionMode.value === "pin" ? "Locks to this exact version; future updates are manual." : `Tracks ${o(i).version.value ? "≥ " + o(i).version.value : "all"} releases on the next resolve.`), 1)
                ]),
                a("div", Jr, [
                  a("div", Qr, [
                    y(o(I), {
                      icon: "tabler:download",
                      class: "km-i-sm",
                      "aria-hidden": "true"
                    }),
                    c[22] || (c[22] = a("span", null, "Downloads", -1)),
                    a("b", null, d(o(cn)(p.value.total_downloads)), 1)
                  ]),
                  p.value.favorites_count ? (l(), u("div", eu, [
                    y(o(I), {
                      icon: "tabler:star",
                      class: "km-i-sm",
                      "aria-hidden": "true"
                    }),
                    c[23] || (c[23] = a("span", null, "Favorites", -1)),
                    a("b", null, d(p.value.favorites_count), 1)
                  ])) : f("", !0),
                  p.value.license ? (l(), u("div", tu, [
                    y(o(I), {
                      icon: "tabler:license",
                      class: "km-i-sm",
                      "aria-hidden": "true"
                    }),
                    c[24] || (c[24] = a("span", null, "License", -1)),
                    a("b", {
                      title: p.value.license
                    }, d(o(Mn)(p.value.license)), 9, nu)
                  ])) : f("", !0),
                  p.value.type ? (l(), u("div", ou, [
                    y(o(I), {
                      icon: "tabler:category",
                      class: "km-i-sm",
                      "aria-hidden": "true"
                    }),
                    c[25] || (c[25] = a("span", null, "Type", -1)),
                    a("b", null, d(p.value.type), 1)
                  ])) : f("", !0),
                  o(i).versionMeta.value?.entry_count ? (l(), u("div", iu, [
                    y(o(I), {
                      icon: "tabler:list-numbers",
                      class: "km-i-sm",
                      "aria-hidden": "true"
                    }),
                    c[26] || (c[26] = a("span", null, "Entries", -1)),
                    a("b", null, d(o(i).versionMeta.value.entry_count), 1)
                  ])) : f("", !0),
                  o(i).versionMeta.value?.size_bytes ? (l(), u("div", su, [
                    y(o(I), {
                      icon: "tabler:weight",
                      class: "km-i-sm",
                      "aria-hidden": "true"
                    }),
                    c[27] || (c[27] = a("span", null, "Size", -1)),
                    a("b", null, d(o(rn)(o(i).versionMeta.value.size_bytes)), 1)
                  ])) : f("", !0),
                  p.value.update_time ? (l(), u("div", au, [
                    y(o(I), {
                      icon: "tabler:clock",
                      class: "km-i-sm",
                      "aria-hidden": "true"
                    }),
                    c[28] || (c[28] = a("span", null, "Updated", -1)),
                    a("b", null, d(o(En)(p.value.update_time, { maxUnit: "year" })), 1)
                  ])) : f("", !0)
                ]),
                o(i).readmeLoading.value ? (l(), u("div", lu, [
                  y(o(I), {
                    icon: "tabler:loader-2",
                    class: "km-i spin",
                    "aria-hidden": "true"
                  }),
                  c[29] || (c[29] = P(" Loading README…", -1))
                ])) : o(i).readme.value ? (l(), u("article", ru, [
                  y(Q, {
                    source: o(i).readme.value
                  }, null, 8, ["source"])
                ])) : f("", !0)
              ], 512), [
                [sn, o(i).activeSection.value === "overview"]
              ]),
              Be(a("section", uu, [
                o(i).planLoading.value ? (l(), u(Y, { key: 0 }, [
                  c[30] || (c[30] = a("div", {
                    class: "km-skel km-skel-line",
                    style: { width: "40%" }
                  }, null, -1)),
                  (l(), u(Y, null, se(4, (m) => a("div", {
                    class: "km-skel km-skel-card",
                    key: m
                  })), 64))
                ], 64)) : o(i).planError.value ? (l(), u("div", du, [
                  o(i).planCode.value ? (l(), u("span", cu, d(o(i).planCode.value), 1)) : f("", !0),
                  P(d(o(i).planError.value), 1)
                ])) : o(i).plan.value ? (l(), u(Y, { key: 2 }, [
                  a("div", pu, [
                    y(o(I), {
                      icon: "tabler:hierarchy-2",
                      class: "km-i km-accent",
                      "aria-hidden": "true"
                    }),
                    P(" Installs " + d(o(i).moduleCount.value) + " module" + d(o(i).moduleCount.value === 1 ? "" : "s") + " ", 1),
                    o(i).totalSize.value ? (l(), u("span", mu, "· " + d(o(rn)(o(i).totalSize.value)), 1)) : f("", !0)
                  ]),
                  c[32] || (c[32] = a("p", { class: "km-hint" }, "The module plus its full dependency chain (ns.dependency), resolved to these versions.", -1)),
                  (l(!0), u(Y, null, se(o(i).planRows.value, (m) => (l(), u("div", {
                    key: m.path || m.module,
                    class: ne(["km-mrow", { "km-mrow-direct": m.direct || m.module === n.component, "km-mrow-transitive": !(m.direct || m.module === n.component) }]),
                    style: jt({ "--tree-level": m.level })
                  }, [
                    m.level > 0 ? (l(), ye(o(I), {
                      key: 0,
                      icon: "tabler:corner-down-right",
                      class: "km-i-sm km-dim",
                      "aria-hidden": "true"
                    })) : (l(), u("span", fu)),
                    a("span", bu, d(m.direct || m.module === n.component ? "direct" : "transitive"), 1),
                    a("span", hu, d(m.module), 1),
                    m.version ? (l(), u("span", vu, d(m.version), 1)) : f("", !0),
                    m.constraint ? (l(), u("span", gu, d(m.constraint), 1)) : f("", !0),
                    c[31] || (c[31] = a("span", { class: "km-grow" }, null, -1)),
                    (l(!0), u(Y, null, se(o(i).badgesForNode(m), ($) => (l(), u("span", {
                      key: $.label,
                      class: ne(N($.tone))
                    }, d($.label), 3))), 128)),
                    m.size_bytes ? (l(), u("span", yu, d(o(rn)(m.size_bytes)), 1)) : f("", !0)
                  ], 6))), 128))
                ], 64)) : f("", !0)
              ], 512), [
                [sn, o(i).activeSection.value === "modules"]
              ]),
              Be(a("section", ku, [
                o(i).planLoading.value ? (l(), u(Y, { key: 0 }, [
                  c[33] || (c[33] = a("div", {
                    class: "km-skel km-skel-line",
                    style: { width: "30%" }
                  }, null, -1)),
                  (l(), u(Y, null, se(3, (m) => a("div", {
                    class: "km-skel km-skel-field",
                    key: m
                  })), 64))
                ], 64)) : o(i).requirements.value.length ? (l(), u(Y, { key: 2 }, [
                  a("div", Su, [
                    y(o(I), {
                      icon: "tabler:adjustments",
                      class: "km-i km-accent",
                      "aria-hidden": "true"
                    }),
                    c[35] || (c[35] = P(" Configuration ", -1)),
                    a("span", $u, "(" + d(o(i).boundRequirementCount.value) + "/" + d(o(i).requirements.value.length) + " set)", 1)
                  ]),
                  a("div", Cu, [
                    c[37] || (c[37] = a("p", { class: "km-hint km-grow" }, "Bind root requirements to host resources. Transitive requirements are shown for review and are configured by their owning module.", -1)),
                    o(i).aiResolvableCount.value ? (l(), u("button", {
                      key: 0,
                      class: "km-btn km-btn-secondary km-btn-outlined km-btn-sm",
                      disabled: o(i).aiResolving.value || !o(i).planCurrent.value,
                      onClick: c[3] || (c[3] = (m) => o(i).resolveRequirementsWithAI(E.value))
                    }, [
                      y(o(I), {
                        icon: o(i).aiResolving.value ? "tabler:loader-2" : "tabler:sparkles",
                        class: ne(["km-i", o(i).aiResolving.value && "spin"]),
                        "aria-hidden": "true"
                      }, null, 8, ["icon", "class"]),
                      P(" " + d(o(i).aiResolving.value ? "Resolving…" : "Resolve with AI"), 1)
                    ], 8, Iu)) : f("", !0),
                    o(i).missingRequirements.value.length ? (l(), u("button", {
                      key: 1,
                      class: "km-btn km-btn-secondary km-btn-outlined km-btn-sm",
                      disabled: o(i).autoFitCount.value === 0,
                      onClick: c[4] || (c[4] = (m) => o(i).autoFitRequirements())
                    }, [
                      y(o(I), {
                        icon: "tabler:wand",
                        class: "km-i",
                        "aria-hidden": "true"
                      }),
                      c[36] || (c[36] = P(" Auto-fit ", -1))
                    ], 8, _u)) : f("", !0)
                  ]),
                  o(i).aiResolutionNotice.value ? (l(), u("div", {
                    key: 0,
                    class: ne(["km-msg", o(i).aiResolutionNotice.value.tone === "success" ? "km-msg-ok" : "km-msg-warn"]),
                    role: "status"
                  }, [
                    o(i).aiResolutionNotice.value.code ? (l(), u("span", xu, d(o(i).aiResolutionNotice.value.code), 1)) : f("", !0),
                    o(i).aiResolutionNotice.value.kind ? (l(), u("span", Ou, d(o(i).aiResolutionNotice.value.kind), 1)) : f("", !0),
                    P(" " + d(o(i).aiResolutionNotice.value.message) + " ", 1),
                    o(i).aiResolutionNotice.value.details ? (l(), u("pre", Lu, d(JSON.stringify(o(i).aiResolutionNotice.value.details, null, 2)), 1)) : f("", !0)
                  ], 2)) : f("", !0),
                  o(i).pendingCount.value ? (l(), u("div", zu, [
                    a("span", Au, "Review " + d(o(i).pendingCount.value) + " AI suggestion" + d(o(i).pendingCount.value === 1 ? "" : "s") + " before applying.", 1),
                    a("button", {
                      class: "km-btn km-btn-sm",
                      disabled: !o(i).planCurrent.value,
                      onClick: c[5] || (c[5] = (m) => o(i).acceptSuggestions(Object.keys(o(i).pendingSuggestions.value)))
                    }, "Accept all", 8, Pu),
                    a("button", {
                      class: "km-btn km-btn-secondary km-btn-sm",
                      onClick: c[6] || (c[6] = (m) => o(i).rejectSuggestions(Object.keys(o(i).pendingSuggestions.value)))
                    }, "Reject all"),
                    a("button", {
                      class: "km-btn km-btn-secondary km-btn-sm",
                      disabled: !o(i).planCurrent.value,
                      onClick: c[7] || (c[7] = (m) => o(i).editSuggestions(Object.keys(o(i).pendingSuggestions.value)))
                    }, "Edit all", 8, Mu)
                  ])) : f("", !0),
                  (l(!0), u(Y, null, se(o(i).requirementGroups.value, (m) => (l(), u("div", {
                    key: m.module,
                    class: "km-req-group"
                  }, [
                    a("div", Eu, [
                      y(o(I), {
                        icon: m.direct ? "tabler:package" : "tabler:corner-down-right",
                        class: "km-i-sm",
                        "aria-hidden": "true"
                      }, null, 8, ["icon"]),
                      a("span", Tu, d(m.module), 1),
                      m.direct ? f("", !0) : (l(), u("span", Fu, "dependency"))
                    ]),
                    (l(!0), u(Y, null, se(m.items, ($) => (l(), u("div", {
                      key: o(le)($),
                      class: ne(["km-req", { "is-missing": o(i).requirementMissing($), "is-invalid": o(i).requirementTypeInvalid($), "is-flash": R.value && (o(i).requirementMissing($) || o(i).requirementTypeInvalid($)) }])
                    }, [
                      a("div", Vu, [
                        a("span", Du, d($.name || o(le)($)), 1),
                        $.required || $.missing ? (l(), u("span", Bu, "required")) : f("", !0),
                        $.expected_kind ? (l(), u("span", Ru, d($.expected_kind), 1)) : f("", !0),
                        c[39] || (c[39] = a("span", { class: "km-grow" }, null, -1)),
                        o(i).requirementMissing($) && o(i).canAutoFitRequirement($) ? (l(), u("button", {
                          key: 2,
                          class: "km-btn km-btn-secondary km-btn-outlined km-btn-sm km-req-fit",
                          onClick: (L) => o(i).autoFitRequirement($)
                        }, [
                          y(o(I), {
                            icon: "tabler:wand",
                            class: "km-i-sm",
                            "aria-hidden": "true"
                          }),
                          c[38] || (c[38] = P(" Auto-fit ", -1))
                        ], 8, ju)) : f("", !0)
                      ]),
                      o(i).requirementReadOnly($) ? (l(), u("div", Ku, d(o(i).requirementValue($) || o(i).displayValue($.default) || "not set"), 1)) : (l(), u(Y, { key: 0 }, [
                        a("input", {
                          class: "km-input km-w-full",
                          "aria-label": $.name || o(le)($),
                          disabled: o(i).running.value || o(i).dryRunning.value,
                          value: o(i).requirementValue($),
                          list: k($).length ? w($) : void 0,
                          placeholder: o(i).displayValue($.default) || ($.expected_kind ? `Enter ${$.expected_kind} id` : "Enter registry id or value"),
                          onInput: (L) => o(i).setParameter($, L.target.value)
                        }, null, 40, Hu),
                        k($).length ? (l(), u("datalist", {
                          key: 0,
                          id: w($)
                        }, [
                          (l(!0), u(Y, null, se(k($), (L) => (l(), u("option", {
                            key: L.value,
                            value: L.value,
                            title: L.title
                          }, d(L.label), 9, Nu))), 128))
                        ], 8, Uu)) : f("", !0)
                      ], 64)),
                      a("div", qu, [
                        _($) ? (l(), u("span", Gu, [
                          y(o(I), {
                            icon: "tabler:wand",
                            class: "km-i-xs",
                            "aria-hidden": "true"
                          }),
                          P(" " + d(_($)), 1)
                        ])) : f("", !0),
                        o(i).requirementTypeInvalid($) ? (l(), u("span", Wu, [
                          y(o(I), {
                            icon: "tabler:alert-triangle",
                            class: "km-i-xs",
                            "aria-hidden": "true"
                          }),
                          P(" " + d(o(i).requirementTypeHint($)), 1)
                        ])) : $.invalid ? (l(), u("span", Zu, [
                          y(o(I), {
                            icon: "tabler:alert-triangle",
                            class: "km-i-xs",
                            "aria-hidden": "true"
                          }),
                          P(" " + d($.invalid_reason || "invalid value"), 1)
                        ])) : f("", !0),
                        o(i).requirementMissing($) && !o(i).canAutoFitRequirement($) ? (l(), u("span", Yu, [
                          y(o(I), {
                            icon: "tabler:hand-click",
                            class: "km-i-xs",
                            "aria-hidden": "true"
                          }),
                          c[40] || (c[40] = P(" choose a value to continue ", -1))
                        ])) : f("", !0),
                        o(i).requirementReadOnly($) ? (l(), u("span", Xu, [
                          y(o(I), {
                            icon: "tabler:lock",
                            class: "km-i-xs",
                            "aria-hidden": "true"
                          }),
                          P(" configured by " + d(o(i).requirementConfiguredBy($)) + "; install it directly to override ", 1)
                        ])) : f("", !0)
                      ]),
                      o(i).pendingSuggestions.value[o(le)($)] ? (l(), u("div", {
                        key: 2,
                        class: "km-ai-proposal",
                        role: "group",
                        "aria-label": `AI suggestion for ${$.name || o(le)($)}`
                      }, [
                        a("div", Qu, "Suggested value: " + d(o(i).displayValue(o(i).pendingSuggestions.value[o(le)($)].value)), 1),
                        a("p", null, d(o(i).pendingSuggestions.value[o(le)($)].choice_reason), 1),
                        a("div", ed, [
                          a("button", {
                            class: "km-btn km-btn-sm",
                            disabled: !o(i).planCurrent.value,
                            onClick: (L) => o(i).acceptSuggestions([o(le)($)])
                          }, "Accept", 8, td),
                          a("button", {
                            class: "km-btn km-btn-secondary km-btn-sm",
                            onClick: (L) => o(i).rejectSuggestions([o(le)($)])
                          }, "Reject", 8, nd),
                          a("button", {
                            class: "km-btn km-btn-secondary km-btn-sm",
                            onClick: (L) => o(i).editSuggestions([o(le)($)])
                          }, "Edit", 8, od)
                        ])
                      ], 8, Ju)) : f("", !0),
                      $.resolution_error ? (l(), u("div", id, [
                        a("span", sd, d($.resolution_error.kind || $.resolution_error.code), 1),
                        P(" " + d($.resolution_error.message) + " ", 1),
                        $.resolution_error.details ? (l(), u("pre", ad, d(JSON.stringify($.resolution_error.details, null, 2)), 1)) : f("", !0)
                      ])) : f("", !0),
                      $.description ? (l(), u("div", ld, d($.description), 1)) : f("", !0)
                    ], 2))), 128))
                  ]))), 128))
                ], 64)) : (l(), u("div", wu, [
                  y(o(I), {
                    icon: "tabler:circle-check",
                    class: "km-i-lg km-sev-ok-fg",
                    "aria-hidden": "true"
                  }),
                  c[34] || (c[34] = a("p", null, "Nothing to configure — this module binds no host resources.", -1))
                ]))
              ], 512), [
                [sn, o(i).activeSection.value === "requirements"]
              ]),
              Be(a("section", rd, [
                a("div", ud, [
                  y(o(I), {
                    icon: "tabler:shield-check",
                    class: "km-i km-accent",
                    "aria-hidden": "true"
                  }),
                  c[41] || (c[41] = P(" Security scan", -1))
                ]),
                c[54] || (c[54] = a("p", { class: "km-hint" }, "An agent reviews the code of every module being installed. Heuristic, not a guarantee — review flagged items before proceeding.", -1)),
                o(i).scan.value.status === "idle" ? (l(), u("div", dd, [
                  y(o(I), {
                    icon: "tabler:shield-question",
                    class: "km-i km-accent",
                    "aria-hidden": "true"
                  }),
                  c[44] || (c[44] = a("span", { class: "km-grow" }, "Security scan not run. Running the reviewer may spend LLM tokens.", -1)),
                  a("button", {
                    class: "km-btn km-btn-secondary km-btn-outlined km-btn-sm",
                    onClick: c[8] || (c[8] = (m) => o(i).skipScan())
                  }, [
                    y(o(I), {
                      icon: "tabler:player-skip-forward",
                      class: "km-i",
                      "aria-hidden": "true"
                    }),
                    c[42] || (c[42] = P(" Skip scan ", -1))
                  ]),
                  a("button", {
                    class: "km-btn km-btn-sm",
                    onClick: c[9] || (c[9] = (m) => o(i).runScanNow())
                  }, [
                    y(o(I), {
                      icon: "tabler:shield-check",
                      class: "km-i",
                      "aria-hidden": "true"
                    }),
                    c[43] || (c[43] = P(" Run scan ", -1))
                  ])
                ])) : o(i).scan.value.status === "skipped" ? (l(), u("div", cd, [
                  y(o(I), {
                    icon: "tabler:shield-off",
                    class: "km-i",
                    "aria-hidden": "true"
                  }),
                  c[46] || (c[46] = P(" Security scan skipped. Install can continue without spending reviewer tokens. ", -1)),
                  a("button", {
                    class: "km-btn km-btn-secondary km-btn-outlined km-btn-sm km-mt",
                    onClick: c[10] || (c[10] = (m) => o(i).runScanNow())
                  }, [
                    y(o(I), {
                      icon: "tabler:shield-check",
                      class: "km-i",
                      "aria-hidden": "true"
                    }),
                    c[45] || (c[45] = P(" Run scan", -1))
                  ])
                ])) : o(i).scan.value.status === "scanning" ? (l(), u("div", pd, [
                  y(o(I), {
                    icon: "tabler:loader-2",
                    class: "km-i spin km-accent",
                    "aria-hidden": "true"
                  }),
                  a("span", md, [
                    P("Scanning " + d(o(i).scan.value.total || "") + " module" + d(o(i).scan.value.total === 1 ? "" : "s") + "… ", 1),
                    c[47] || (c[47] = a("span", { class: "km-dim" }, "this can take a moment", -1))
                  ])
                ])) : o(i).scan.value.status === "clean" ? (l(), u("div", fd, [
                  y(o(I), {
                    icon: "tabler:shield-check-filled",
                    class: "km-i-lg km-sev-ok-fg",
                    "aria-hidden": "true"
                  }),
                  a("p", null, "No issues found across " + d(o(i).scan.value.scanned) + " module" + d(o(i).scan.value.scanned === 1 ? "" : "s") + ".", 1)
                ])) : o(i).scan.value.status === "error" ? (l(), u("div", bd, [
                  P(" Scan failed: " + d(o(i).scan.value.error) + " ", 1),
                  a("button", {
                    class: "km-btn km-btn-secondary km-btn-outlined km-btn-sm km-mt",
                    onClick: c[11] || (c[11] = (m) => o(i).runScanNow())
                  }, [
                    y(o(I), {
                      icon: "tabler:refresh",
                      class: "km-i",
                      "aria-hidden": "true"
                    }),
                    c[48] || (c[48] = P(" Retry", -1))
                  ])
                ])) : o(i).scan.value.status === "unavailable" ? (l(), u("div", hd, [
                  y(o(I), {
                    icon: "tabler:shield-off",
                    class: "km-i",
                    "aria-hidden": "true"
                  }),
                  c[50] || (c[50] = P(" Security scan unavailable ", -1)),
                  a("button", {
                    class: "km-btn km-btn-secondary km-btn-outlined km-btn-sm km-mt",
                    onClick: c[12] || (c[12] = (m) => o(i).runScanNow())
                  }, [
                    y(o(I), {
                      icon: "tabler:refresh",
                      class: "km-i",
                      "aria-hidden": "true"
                    }),
                    c[49] || (c[49] = P(" Retry", -1))
                  ])
                ])) : (l(), u(Y, { key: 6 }, [
                  o(i).scan.value.summary ? (l(), u("p", vd, d(o(i).scan.value.summary), 1)) : f("", !0),
                  o(i).scan.value.status === "critical" ? (l(), u("div", gd, [
                    y(o(I), {
                      icon: "tabler:shield-x",
                      class: "km-i",
                      "aria-hidden": "true"
                    }),
                    c[51] || (c[51] = P(" Critical findings must be reviewed and confirmed before install.", -1))
                  ])) : f("", !0),
                  (l(!0), u(Y, null, se(o(i).scan.value.modules, (m) => (l(), u("div", {
                    key: m.module,
                    class: "km-scan-mod"
                  }, [
                    a("div", yd, [
                      a("span", {
                        class: ne(["km-dot", x(m.status)]),
                        "aria-hidden": "true"
                      }, null, 2),
                      a("span", kd, [
                        P(d(m.module), 1),
                        m.version ? (l(), u(Y, { key: 0 }, [
                          P("@" + d(m.version), 1)
                        ], 64)) : f("", !0)
                      ]),
                      c[52] || (c[52] = a("span", { class: "km-grow" }, null, -1)),
                      a("span", wd, d(m.status), 1)
                    ]),
                    m.summary ? (l(), u("p", Sd, d(m.summary), 1)) : f("", !0),
                    (l(!0), u(Y, null, se(m.findings, ($) => (l(), u("div", {
                      key: $.id,
                      class: ne(["km-finding", `km-sev-${H($)}`])
                    }, [
                      y(o(I), {
                        icon: o(zo)[$.severity].icon,
                        class: "km-i km-finding-icon",
                        "aria-hidden": "true"
                      }, null, 8, ["icon"]),
                      a("div", $d, [
                        a("div", Cd, [
                          a("span", Id, d($.title), 1)
                        ]),
                        $.detail ? (l(), u("div", _d, d($.detail), 1)) : f("", !0),
                        $.location ? (l(), u("div", xd, d($.location), 1)) : f("", !0),
                        $.severity !== "critical" ? (l(), u("button", {
                          key: 2,
                          class: ne(["km-ack", { done: o(i).acknowledged.value.has($.id) }]),
                          onClick: (L) => o(i).acknowledge($)
                        }, [
                          y(o(I), {
                            icon: o(i).acknowledged.value.has($.id) ? "tabler:check" : "tabler:eye",
                            class: "km-i-xs",
                            "aria-hidden": "true"
                          }, null, 8, ["icon"]),
                          P(" " + d(o(i).acknowledged.value.has($.id) ? "Acknowledged" : "Acknowledge"), 1)
                        ], 10, Od)) : f("", !0)
                      ])
                    ], 2))), 128)),
                    m.findings.length ? f("", !0) : (l(), u("p", Ld, "No issues in this module."))
                  ]))), 128)),
                  o(i).scan.value.status === "critical" ? (l(), u("label", zd, [
                    Be(a("input", {
                      type: "checkbox",
                      "onUpdate:modelValue": c[13] || (c[13] = (m) => o(i).criticalConfirmed.value = m)
                    }, null, 512), [
                      [Hi, o(i).criticalConfirmed.value]
                    ]),
                    c[53] || (c[53] = a("span", null, "I understand the critical findings and want to install anyway.", -1))
                  ])) : f("", !0)
                ], 64))
              ], 512), [
                [sn, o(i).activeSection.value === "scan"]
              ]),
              Be(a("section", Ad, [
                a("div", Pd, [
                  y(o(I), {
                    icon: "tabler:checklist",
                    class: "km-i km-accent",
                    "aria-hidden": "true"
                  }),
                  c[55] || (c[55] = P(" Review & install", -1))
                ]),
                a("div", Md, [
                  a("div", Ed, [
                    y(o(I), {
                      icon: "tabler:package",
                      class: "km-i km-accent",
                      "aria-hidden": "true"
                    }),
                    a("b", null, d(o(i).moduleCount.value), 1),
                    c[56] || (c[56] = a("span", null, "modules", -1))
                  ]),
                  a("div", Td, [
                    y(o(I), {
                      icon: "tabler:adjustments",
                      class: "km-i km-accent",
                      "aria-hidden": "true"
                    }),
                    a("b", null, d(o(i).boundRequirementCount.value) + "/" + d(o(i).requirements.value.length), 1),
                    c[57] || (c[57] = a("span", null, "configured", -1))
                  ]),
                  a("div", Fd, [
                    y(o(I), {
                      icon: "tabler:database",
                      class: "km-i km-accent",
                      "aria-hidden": "true"
                    }),
                    a("b", null, d(o(i).migrations.value.length), 1),
                    c[58] || (c[58] = a("span", null, "migrations", -1))
                  ]),
                  a("div", Vd, [
                    y(o(I), {
                      icon: o(i).scan.value.status === "clean" ? "tabler:shield-check" : o(i).scan.value.status === "critical" ? "tabler:shield-x" : o(i).scan.value.status === "skipped" ? "tabler:shield-off" : "tabler:shield",
                      class: "km-i km-accent",
                      "aria-hidden": "true"
                    }, null, 8, ["icon"]),
                    a("b", null, d(o(i).scan.value.status === "scanning" ? "…" : o(i).scan.value.status === "skipped" || o(i).scan.value.status === "idle" ? "—" : o(i).scan.value.findings.length), 1),
                    c[59] || (c[59] = a("span", null, "scan findings", -1))
                  ])
                ]),
                a("div", Dd, [
                  c[62] || (c[62] = a("label", { class: "km-label" }, "Migration policy", -1)),
                  y(Lo, {
                    modelValue: o(i).migrationPolicy.value,
                    "onUpdate:modelValue": c[14] || (c[14] = (m) => o(i).migrationPolicy.value = m),
                    class: "km-sort km-w-full",
                    items: o(i).migrationOptions.value.map((m) => ({ id: m.value, title: m.label })),
                    "aria-label": "Migration policy"
                  }, null, 8, ["modelValue", "items"]),
                  o(i).requiredSetup.value ? (l(), u("p", Bd, "This module requires setup. Installation completes after migrations and setup pass verification.")) : f("", !0),
                  o(i).migrations.value.length ? (l(), u("div", Rd, [
                    (l(!0), u(Y, null, se(o(i).migrations.value, (m) => (l(), u("div", {
                      key: m.id,
                      class: "km-mig-row"
                    }, [
                      y(o(I), {
                        icon: "tabler:database-import",
                        class: "km-i-xs km-dim",
                        "aria-hidden": "true"
                      }),
                      a("span", jd, d(m.id), 1),
                      c[60] || (c[60] = a("span", { class: "km-grow" }, null, -1)),
                      a("span", Hd, d(m.status), 1)
                    ]))), 128))
                  ])) : f("", !0),
                  a("p", Ud, [
                    y(o(I), {
                      icon: "tabler:shield-lock",
                      class: "km-i-xs",
                      "aria-hidden": "true"
                    }),
                    c[61] || (c[61] = P(" Changes are transactional — if any step fails, the registry, lock and migrations are rolled back.", -1))
                  ])
                ]),
                a("details", Nd, [
                  c[65] || (c[65] = a("summary", null, "Advanced", -1)),
                  a("div", Kd, [
                    a("div", qd, [
                      c[63] || (c[63] = a("span", null, "Installs as", -1)),
                      a("b", Gd, d(o(i).destinationId.value || "—"), 1)
                    ]),
                    a("div", Wd, [
                      c[64] || (c[64] = a("span", null, "Version", -1)),
                      a("b", Zd, d(o(i).versionMode.value === "pin" ? o(i).version.value || "latest" : "≥ " + (o(i).version.value || "0.0.0")), 1)
                    ])
                  ])
                ]),
                o(i).result.value ? (l(), u("div", Yd, [
                  a("div", Xd, d(o(i).result.value.dry_run ? "Dry-run preview" : "Applied"), 1),
                  o(i).result.value.dry_run ? (l(), u(Y, { key: 0 }, [
                    c[66] || (c[66] = a("div", { class: "km-dim" }, "No changes were applied.", -1)),
                    o(i).resultExecution.value.length ? (l(), u("div", Jd, d(o(i).resultExecution.value.length) + " planned step" + d(o(i).resultExecution.value.length === 1 ? "" : "s") + " below.", 1)) : (l(), u("div", Qd, "Keeper accepted the dry-run but returned no execution details."))
                  ], 64)) : (l(), u(Y, { key: 1 }, [
                    o(i).result.value.apply?.stage || o(i).result.value.operation_id ? (l(), u("div", ec, [
                      o(i).result.value.apply?.stage ? (l(), u(Y, { key: 0 }, [
                        P("stage: " + d(o(i).result.value.apply.stage), 1)
                      ], 64)) : f("", !0),
                      o(i).result.value.apply?.stage && o(i).result.value.operation_id ? (l(), u(Y, { key: 1 }, [
                        P(" · ")
                      ], 64)) : f("", !0),
                      o(i).result.value.operation_id ? (l(), u(Y, { key: 2 }, [
                        c[67] || (c[67] = P("op: ", -1)),
                        a("code", tc, d(o(i).result.value.operation_id), 1)
                      ], 64)) : f("", !0)
                    ])) : (l(), u("div", nc, "Changes applied successfully.")),
                    o(i).result.value.apply?.message ? (l(), u("div", oc, d(o(i).result.value.apply.message), 1)) : f("", !0)
                  ], 64))
                ])) : f("", !0),
                o(i).resultExecution.value.length ? (l(), u("div", ic, [
                  c[68] || (c[68] = a("div", { class: "km-panel-title" }, "Execution ledger", -1)),
                  (l(!0), u(Y, null, se(o(i).resultExecution.value, (m, $) => (l(), u("div", {
                    key: `${m.step}-${$}`,
                    class: ne(["km-ledger-row", K(m.status)])
                  }, [
                    a("span", sc, d($ + 1), 1),
                    a("span", ac, d(o(i).executionStepLabel(m)), 1),
                    a("span", lc, d(m.status), 1),
                    m.message ? (l(), u("span", rc, d(m.message), 1)) : f("", !0)
                  ], 2))), 128))
                ])) : f("", !0),
                o(i).resultError.value ? (l(), u("div", uc, [
                  o(i).resultCode.value ? (l(), u("span", dc, d(o(i).resultCode.value), 1)) : f("", !0),
                  P(d(o(i).resultError.value), 1)
                ])) : f("", !0)
              ], 512), [
                [sn, o(i).activeSection.value === "review"]
              ])
            ], 512)
          ])
        ]),
        _: 1
      }, 8, ["visible", "busy", "label", "style"]);
    };
  }
}), yc = { class: "d-hero" }, kc = { class: "d-hero-icon" }, wc = { class: "km-grow km-min0" }, Sc = { class: "km-row-wrap" }, $c = { class: "d-hero-name" }, Cc = { class: "d-ver" }, Ic = {
  key: 0,
  class: "badge-app kx-tag-caps"
}, _c = {
  key: 1,
  class: "badge-installed kx-tag-caps"
}, xc = {
  key: 2,
  class: "badge-private kx-tag-caps",
  title: "Private Hub module"
}, Oc = {
  key: 3,
  class: "badge-warn kx-tag-caps"
}, Lc = { class: "d-hero-org" }, zc = {
  key: 0,
  class: "d-hero-desc"
}, Ac = { class: "d-hero-actions" }, Pc = ["title"], Mc = ["title"], Ec = ["href"], Tc = ["href"], Fc = { class: "d-grid" }, Vc = { class: "d-side" }, Dc = { class: "d-block" }, Bc = { class: "d-row" }, Rc = { class: "d-row-v" }, jc = {
  key: 0,
  class: "d-row"
}, Hc = { class: "d-row-v" }, Uc = {
  key: 1,
  class: "d-row"
}, Nc = ["title"], Kc = {
  key: 2,
  class: "d-row"
}, qc = { class: "d-row-v" }, Gc = {
  key: 3,
  class: "d-row"
}, Wc = {
  key: 4,
  class: "d-row"
}, Zc = { class: "d-row-v" }, Yc = {
  key: 5,
  class: "d-row"
}, Xc = { class: "d-row-v" }, Jc = {
  key: 6,
  class: "d-row"
}, Qc = { class: "d-row-v" }, ep = {
  key: 0,
  class: "d-block"
}, tp = { class: "km-pills" }, np = {
  key: 1,
  class: "d-block"
}, op = { class: "km-dep-list" }, ip = { class: "km-trunc" }, sp = { class: "km-dim" }, ap = {
  key: 2,
  class: "d-block"
}, lp = { class: "km-pills" }, rp = { class: "d-main" }, up = { class: "d-tabs" }, dp = ["disabled"], cp = {
  key: 0,
  class: "km-dim"
}, pp = { class: "d-tab-body" }, mp = {
  key: 0,
  class: "km-loading"
}, fp = {
  key: 0,
  class: "d-empty"
}, bp = {
  key: 1,
  class: "rm"
}, hp = {
  key: 2,
  class: "km-stack-lg"
}, vp = { key: 0 }, gp = { class: "d-block-title d-accent" }, yp = { class: "km-dim" }, kp = { class: "km-2col" }, wp = { class: "d-field-i" }, Sp = { class: "km-grow km-min0" }, $p = { class: "d-cfg-name" }, Cp = {
  key: 0,
  class: "d-cfg-desc"
}, Ip = { key: 1 }, _p = { class: "d-block-title" }, xp = { class: "km-2col" }, Op = { class: "d-field-i d-field-i-req" }, Lp = { class: "km-grow km-min0" }, zp = { class: "d-cfg-name" }, Ap = {
  key: 0,
  class: "d-cfg-desc"
}, Pp = { class: "d-field-i d-field-i-req" }, Mp = { class: "km-grow km-min0" }, Ep = { class: "d-cfg-name" }, Tp = {
  key: 0,
  class: "d-cfg-desc"
}, Fp = {
  key: 1,
  class: "d-cfg-desc km-mono"
}, Vp = { class: "d-block-title" }, Dp = { key: 0 }, Bp = { class: "d-sub" }, Rp = { class: "km-pills" }, jp = {
  key: 1,
  class: "km-muted"
}, Hp = {
  key: 1,
  class: "km-muted"
}, Up = {
  key: 2,
  class: "km-stack"
}, Np = { class: "km-group-head" }, Kp = { class: "km-dim" }, qp = { class: "km-2col" }, Gp = { class: "d-entry-name" }, Wp = { class: "d-entry-id" }, Zp = {
  key: 0,
  class: "km-muted"
}, Yp = {
  key: 1,
  class: "d-vers"
}, Xp = { class: "d-ver-tag" }, Jp = {
  key: 0,
  class: "km-dim"
}, Qp = {
  key: 1,
  class: "km-dim km-inline"
}, em = {
  key: 2,
  class: "km-dim"
}, tm = /* @__PURE__ */ Qt({
  __name: "ModuleDetailView",
  props: {
    page: {}
  },
  setup(e) {
    const t = e, {
      selectedModule: n,
      selectedIsPrivate: s,
      selectedCanUpdate: i,
      selectedUpdateDisabledReason: r,
      selectedCanUninstall: p,
      selectedUninstallBlockedReason: h,
      detailUpdate: g,
      detailUninstall: k,
      detailInstall: w,
      closeDetail: _,
      versionMeta: E,
      detailTab: R,
      detailReadme: F,
      detailLoading: H,
      detailVersions: x,
      envVars: N,
      requirements: K,
      entryIcon: M,
      entryName: D,
      entryDesc: c,
      detailGroups: Q
    } = t.page, m = q(() => t.page.selected.value);
    return ($, L) => {
      const ae = Ce("wc-render-markdown");
      return l(), u("div", {
        class: "d-page",
        style: jt({ "--accent": o(n) ? o(dn)(o(n)) : "var(--p-primary-color)" })
      }, [
        a("button", {
          class: "d-back",
          onClick: L[0] || (L[0] = //@ts-ignore
          (...v) => o(_) && o(_)(...v))
        }, [
          y(o(I), {
            icon: "tabler:arrow-left",
            class: "km-i-sm",
            "aria-hidden": "true"
          }),
          L[7] || (L[7] = P(" Back to modules ", -1))
        ]),
        a("header", yc, [
          a("div", kc, [
            y(o(I), {
              icon: o(n) ? o(Jt)(o(n)) : "tabler:package",
              class: "km-i-lg",
              "aria-hidden": "true"
            }, null, 8, ["icon"])
          ]),
          a("div", wc, [
            a("div", Sc, [
              a("h2", $c, d(m.value.label), 1),
              a("span", Cc, d(m.value.version || "—"), 1),
              o(ln)(o(n)) ? (l(), u("span", Ic, "app")) : f("", !0),
              m.value.installed ? (l(), u("span", _c, "installed")) : f("", !0),
              o(s) ? (l(), u("span", xc, [
                y(o(I), {
                  icon: "tabler:lock",
                  class: "km-i-xs",
                  "aria-hidden": "true"
                }),
                L[8] || (L[8] = P(" private", -1))
              ])) : f("", !0),
              o(n)?.deprecated ? (l(), u("span", Oc, "deprecated")) : f("", !0)
            ]),
            a("div", Lc, d(m.value.component), 1),
            m.value.description ? (l(), u("p", zc, d(m.value.description), 1)) : f("", !0),
            a("div", Ac, [
              m.value.installed ? (l(), u(Y, { key: 0 }, [
                o(i) ? (l(), u("button", {
                  key: 0,
                  class: "km-btn km-btn-secondary km-btn-outlined km-btn-sm",
                  onClick: L[1] || (L[1] = //@ts-ignore
                  (...v) => o(g) && o(g)(...v))
                }, [
                  y(o(I), {
                    icon: "tabler:refresh-dot",
                    class: "km-i",
                    "aria-hidden": "true"
                  }),
                  L[9] || (L[9] = P(" Update ", -1))
                ])) : (l(), u("button", {
                  key: 1,
                  class: "km-btn km-btn-secondary km-btn-outlined km-btn-sm",
                  disabled: "",
                  title: o(r) || void 0
                }, [
                  y(o(I), {
                    icon: "tabler:refresh-off",
                    class: "km-i",
                    "aria-hidden": "true"
                  }),
                  L[10] || (L[10] = P(" Update ", -1))
                ], 8, Pc)),
                o(p) ? (l(), u("button", {
                  key: 2,
                  class: "km-btn km-btn-text km-btn-danger km-btn-sm",
                  onClick: L[2] || (L[2] = //@ts-ignore
                  (...v) => o(k) && o(k)(...v))
                }, [
                  y(o(I), {
                    icon: "tabler:trash",
                    class: "km-i",
                    "aria-hidden": "true"
                  }),
                  L[11] || (L[11] = P(" Uninstall ", -1))
                ])) : o(h) ? (l(), u("button", {
                  key: 3,
                  class: "km-btn km-btn-text km-btn-danger km-btn-sm",
                  disabled: "",
                  title: o(h)
                }, [
                  y(o(I), {
                    icon: "tabler:trash-off",
                    class: "km-i",
                    "aria-hidden": "true"
                  }),
                  L[12] || (L[12] = P(" Uninstall ", -1))
                ], 8, Mc)) : f("", !0)
              ], 64)) : (l(), u("button", {
                key: 1,
                class: "km-btn km-btn-sm",
                onClick: L[3] || (L[3] = //@ts-ignore
                (...v) => o(w) && o(w)(...v))
              }, [
                y(o(I), {
                  icon: "tabler:download",
                  class: "km-i",
                  "aria-hidden": "true"
                }),
                L[13] || (L[13] = P(" Install ", -1))
              ])),
              o(n)?.repository ? (l(), u("a", {
                key: 2,
                href: String(o(n).repository),
                target: "_blank",
                rel: "noopener",
                class: "d-link"
              }, [
                y(o(I), {
                  icon: "tabler:brand-github",
                  class: "km-i-sm",
                  "aria-hidden": "true"
                }),
                L[14] || (L[14] = P(" Repository", -1))
              ], 8, Ec)) : f("", !0),
              o(n)?.homepage ? (l(), u("a", {
                key: 3,
                href: String(o(n).homepage),
                target: "_blank",
                rel: "noopener",
                class: "d-link"
              }, [
                y(o(I), {
                  icon: "tabler:home",
                  class: "km-i-sm",
                  "aria-hidden": "true"
                }),
                L[15] || (L[15] = P(" Homepage", -1))
              ], 8, Tc)) : f("", !0)
            ])
          ])
        ]),
        a("div", Fc, [
          a("aside", Vc, [
            a("section", Dc, [
              a("div", Bc, [
                y(o(I), {
                  icon: "tabler:download",
                  class: "d-row-i",
                  "aria-hidden": "true"
                }),
                L[16] || (L[16] = a("span", { class: "d-row-k" }, "Downloads", -1)),
                a("span", Rc, d(o(cn)(o(n)?.total_downloads)), 1)
              ]),
              o(n)?.favorites_count ? (l(), u("div", jc, [
                y(o(I), {
                  icon: "tabler:star",
                  class: "d-row-i",
                  "aria-hidden": "true"
                }),
                L[17] || (L[17] = a("span", { class: "d-row-k" }, "Favorites", -1)),
                a("span", Hc, d(o(n).favorites_count), 1)
              ])) : f("", !0),
              o(n)?.license ? (l(), u("div", Uc, [
                y(o(I), {
                  icon: "tabler:license",
                  class: "d-row-i",
                  "aria-hidden": "true"
                }),
                L[18] || (L[18] = a("span", { class: "d-row-k" }, "License", -1)),
                a("span", {
                  class: "d-row-v",
                  title: o(n).license
                }, d(o(Mn)(o(n).license)), 9, Nc)
              ])) : f("", !0),
              o(n)?.type ? (l(), u("div", Kc, [
                y(o(I), {
                  icon: "tabler:category",
                  class: "d-row-i",
                  "aria-hidden": "true"
                }),
                L[19] || (L[19] = a("span", { class: "d-row-k" }, "Type", -1)),
                a("span", qc, d(o(n).type), 1)
              ])) : f("", !0),
              o(s) ? (l(), u("div", Gc, [
                y(o(I), {
                  icon: "tabler:lock",
                  class: "d-row-i",
                  "aria-hidden": "true"
                }),
                L[20] || (L[20] = a("span", { class: "d-row-k" }, "Visibility", -1)),
                L[21] || (L[21] = a("span", { class: "d-row-v" }, "Private", -1))
              ])) : f("", !0),
              o(n)?.update_time ? (l(), u("div", Wc, [
                y(o(I), {
                  icon: "tabler:clock",
                  class: "d-row-i",
                  "aria-hidden": "true"
                }),
                L[22] || (L[22] = a("span", { class: "d-row-k" }, "Updated", -1)),
                a("span", Zc, d(o(En)(o(n).update_time, { maxUnit: "year" })), 1)
              ])) : f("", !0),
              o(E)?.entry_count ? (l(), u("div", Yc, [
                y(o(I), {
                  icon: "tabler:list-numbers",
                  class: "d-row-i",
                  "aria-hidden": "true"
                }),
                L[23] || (L[23] = a("span", { class: "d-row-k" }, "Entries", -1)),
                a("span", Xc, d(o(E).entry_count), 1)
              ])) : f("", !0),
              o(E)?.size_bytes ? (l(), u("div", Jc, [
                y(o(I), {
                  icon: "tabler:weight",
                  class: "d-row-i",
                  "aria-hidden": "true"
                }),
                L[24] || (L[24] = a("span", { class: "d-row-k" }, "Size", -1)),
                a("span", Qc, d(o(rn)(o(E).size_bytes)), 1)
              ])) : f("", !0)
            ]),
            (o(n)?.keywords || []).length ? (l(), u("section", ep, [
              L[25] || (L[25] = a("div", { class: "d-block-title" }, "Keywords", -1)),
              a("div", tp, [
                (l(!0), u(Y, null, se(o(n).keywords, (v) => (l(), u("span", {
                  key: v,
                  class: "provides-pill"
                }, d(v), 1))), 128))
              ])
            ])) : f("", !0),
            (o(E)?.dependencies || []).length ? (l(), u("section", np, [
              L[26] || (L[26] = a("div", { class: "d-block-title" }, "Dependencies", -1)),
              a("div", op, [
                (l(!0), u(Y, null, se(o(E).dependencies, (v, O) => (l(), u("div", {
                  key: O,
                  class: "km-dep"
                }, [
                  a("span", ip, d(v.org) + "/" + d(v.name), 1),
                  a("span", sp, d(v.version_constraint), 1)
                ]))), 128))
              ])
            ])) : f("", !0),
            (o(E)?.lua_modules || []).length ? (l(), u("section", ap, [
              L[27] || (L[27] = a("div", { class: "d-block-title" }, "Lua modules", -1)),
              a("div", lp, [
                (l(!0), u(Y, null, se(o(E).lua_modules, (v) => (l(), u("span", {
                  key: v,
                  class: "provides-pill"
                }, d(v), 1))), 128))
              ])
            ])) : f("", !0)
          ]),
          a("main", rp, [
            a("div", up, [
              a("button", {
                class: ne(["d-tab", { active: o(R) === "readme" }]),
                disabled: !o(F) && !o(H),
                onClick: L[4] || (L[4] = (v) => R.value = "readme")
              }, "Readme", 10, dp),
              a("button", {
                class: ne(["d-tab", { active: o(R) === "overview" }]),
                onClick: L[5] || (L[5] = (v) => R.value = "overview")
              }, "Overview", 2),
              a("button", {
                class: ne(["d-tab", { active: o(R) === "versions" }]),
                onClick: L[6] || (L[6] = (v) => R.value = "versions")
              }, [
                L[28] || (L[28] = P("Versions ", -1)),
                o(x).length ? (l(), u("span", cp, d(o(x).length), 1)) : f("", !0)
              ], 2)
            ]),
            a("div", pp, [
              o(H) ? (l(), u("div", mp, [
                y(o(I), {
                  icon: "tabler:loader-2",
                  class: "km-i spin",
                  "aria-hidden": "true"
                }),
                L[29] || (L[29] = P(" Loading… ", -1))
              ])) : o(R) === "readme" ? (l(), u(Y, { key: 1 }, [
                o(F) ? (l(), u("article", bp, [
                  y(ae, { source: o(F) }, null, 8, ["source"])
                ])) : (l(), u("div", fp, [
                  y(o(I), {
                    icon: "tabler:file-off",
                    class: "km-i-xl km-dim",
                    "aria-hidden": "true"
                  }),
                  L[30] || (L[30] = a("p", { class: "km-mt" }, "No README provided.", -1))
                ]))
              ], 64)) : o(R) === "overview" ? (l(), u("div", hp, [
                o(N).length ? (l(), u("section", vp, [
                  a("div", gp, [
                    y(o(I), {
                      icon: "tabler:settings-2",
                      class: "km-i-sm",
                      "aria-hidden": "true"
                    }),
                    L[31] || (L[31] = P(" Environment ", -1)),
                    a("span", yp, d(o(N).length), 1)
                  ]),
                  L[32] || (L[32] = a("p", { class: "d-sub" }, "Variables this module reads — set them in your environment.", -1)),
                  a("div", kp, [
                    (l(!0), u(Y, null, se(o(N), (v) => (l(), u("div", {
                      key: v.id,
                      class: "d-field d-field-env"
                    }, [
                      a("span", wp, [
                        y(o(I), {
                          icon: o(M)(v, "tabler:variable"),
                          class: "km-i",
                          "aria-hidden": "true"
                        }, null, 8, ["icon"])
                      ]),
                      a("span", Sp, [
                        a("span", $p, d(o(D)(v)), 1),
                        o(c)(v) ? (l(), u("span", Cp, d(o(c)(v)), 1)) : f("", !0)
                      ])
                    ]))), 128))
                  ])
                ])) : f("", !0),
                o(K).length || (o(E)?.requirements || []).length ? (l(), u("section", Ip, [
                  a("div", _p, [
                    y(o(I), {
                      icon: "tabler:plug-connected",
                      class: "km-i-sm",
                      "aria-hidden": "true"
                    }),
                    L[33] || (L[33] = P(" Requires", -1))
                  ]),
                  L[34] || (L[34] = a("p", { class: "d-sub" }, "Host resources this module is wired to at install.", -1)),
                  a("div", xp, [
                    o(K).length ? (l(!0), u(Y, { key: 0 }, se(o(K), (v) => (l(), u("div", {
                      key: v.id,
                      class: "d-field d-field-req"
                    }, [
                      a("span", Op, [
                        y(o(I), {
                          icon: "tabler:link",
                          class: "km-i",
                          "aria-hidden": "true"
                        })
                      ]),
                      a("span", Lp, [
                        a("span", zp, d(o(D)(v)), 1),
                        o(c)(v) ? (l(), u("span", Ap, d(o(c)(v)), 1)) : f("", !0)
                      ])
                    ]))), 128)) : (l(!0), u(Y, { key: 1 }, se(o(E).requirements, (v, O) => (l(), u("div", {
                      key: O,
                      class: "d-field d-field-req"
                    }, [
                      a("span", Pp, [
                        y(o(I), {
                          icon: "tabler:link",
                          class: "km-i",
                          "aria-hidden": "true"
                        })
                      ]),
                      a("span", Mp, [
                        a("span", Ep, d(v.name), 1),
                        v.description ? (l(), u("span", Tp, d(v.description), 1)) : f("", !0),
                        v.default ? (l(), u("span", Fp, "default: " + d(v.default), 1)) : f("", !0)
                      ])
                    ]))), 128))
                  ])
                ])) : f("", !0),
                a("section", null, [
                  a("div", Vp, [
                    y(o(I), {
                      icon: "tabler:package",
                      class: "km-i-sm d-accent-i",
                      "aria-hidden": "true"
                    }),
                    L[35] || (L[35] = P(" Provides", -1))
                  ]),
                  m.value.installed ? o(Q).length ? (l(), u("div", Up, [
                    (l(!0), u(Y, null, se(o(Q), (v) => (l(), u("div", {
                      key: v.key
                    }, [
                      a("div", Np, [
                        y(o(I), {
                          icon: v.icon,
                          class: "km-i-sm d-accent-i",
                          "aria-hidden": "true"
                        }, null, 8, ["icon"]),
                        P(" " + d(v.label) + " ", 1),
                        a("span", Kp, d(v.items.length), 1)
                      ]),
                      a("div", qp, [
                        (l(!0), u(Y, null, se(v.items, (O) => (l(), u("div", {
                          key: O.id,
                          class: "d-entry"
                        }, [
                          a("div", Gp, d(O.meta && O.meta.title || o(D)(O)), 1),
                          a("div", Wp, d(O.id), 1)
                        ]))), 128))
                      ])
                    ]))), 128))
                  ])) : (l(), u("p", Hp, "No registry entries.")) : (l(), u("div", Dp, [
                    (o(E)?.entry_kinds || []).length ? (l(), u(Y, { key: 0 }, [
                      a("p", Bp, "Publishes " + d(o(E).entry_count || o(E).entry_kinds.length) + " entries; per-entry detail resolves after install.", 1),
                      a("div", Rp, [
                        (l(!0), u(Y, null, se(o(E).entry_kinds, (v) => (l(), u("span", {
                          key: v,
                          class: "provides-pill"
                        }, d(v), 1))), 128))
                      ])
                    ], 64)) : (l(), u("p", jp, [...L[36] || (L[36] = [
                      P("See the ", -1),
                      a("strong", null, "Readme", -1),
                      P(" tab for details.", -1)
                    ])]))
                  ]))
                ])
              ])) : (l(), u(Y, { key: 3 }, [
                o(x).length ? (l(), u("div", Yp, [
                  (l(!0), u(Y, null, se(o(x), (v) => (l(), u("div", {
                    key: v.version,
                    class: "d-ver-row"
                  }, [
                    a("span", Xp, d(v.version), 1),
                    v.create_time ? (l(), u("span", Jp, d(o(En)(v.create_time, { maxUnit: "year" })), 1)) : f("", !0),
                    L[37] || (L[37] = a("span", { class: "km-grow" }, null, -1)),
                    v.download_count ? (l(), u("span", Qp, [
                      y(o(I), {
                        icon: "tabler:download",
                        class: "km-i-xs",
                        "aria-hidden": "true"
                      }),
                      P(" " + d(o(cn)(v.download_count)), 1)
                    ])) : f("", !0),
                    v.size_bytes ? (l(), u("span", em, d(o(rn)(v.size_bytes)), 1)) : f("", !0)
                  ]))), 128))
                ])) : (l(), u("p", Zp, "No published versions."))
              ], 64))
            ])
          ])
        ])
      ], 4);
    };
  }
}), nm = { class: "km" }, om = {
  key: 1,
  class: "km-denied"
}, im = { class: "km-denied-box" }, sm = {
  key: 2,
  class: "km-scroll"
}, am = {
  key: 1,
  class: "km-list"
}, lm = { class: "km-sec-bar km-sec-bar-toolbar" }, rm = { class: "km-controls" }, um = ["disabled"], dm = ["disabled"], cm = ["disabled"], pm = {
  key: 0,
  class: "km-btn-count"
}, mm = ["disabled"], fm = { class: "km-hub-auth-panel" }, bm = { class: "km-hub-auth-row" }, hm = {
  key: 0,
  class: "km-hub-auth-meta"
}, vm = { class: "km-hub-auth-meta" }, gm = {
  key: 1,
  class: "km-hub-auth-orgs"
}, ym = { class: "km-hub-auth-org-name" }, km = {
  key: 0,
  class: "km-hub-auth-org-role"
}, wm = { class: "km-hub-auth-hint" }, Sm = ["href"], $m = { class: "km-hub-auth-actions" }, Cm = ["disabled"], Im = {
  key: 0,
  class: "km-msg km-msg-err"
}, _m = {
  key: 1,
  class: "km-msg"
}, xm = {
  key: 2,
  class: "km-msg km-msg-err"
}, Om = {
  key: 3,
  class: "km-loading km-center"
}, Lm = { key: 0 }, zm = { class: "hub-section-head" }, Am = { class: "feat-grid" }, Pm = ["onClick"], Mm = { class: "feat-icon" }, Em = { class: "feat-body" }, Tm = { class: "km-row-wrap" }, Fm = { class: "feat-name" }, Vm = {
  key: 0,
  class: "badge-app kx-tag-caps"
}, Dm = {
  key: 1,
  class: "badge-private kx-tag-caps",
  title: "Private Hub module"
}, Bm = {
  key: 2,
  class: "badge-warn kx-tag-caps"
}, Rm = { class: "feat-org" }, jm = {
  key: 0,
  class: "feat-desc"
}, Hm = { class: "feat-meta" }, Um = { class: "meta-pill" }, Nm = { class: "meta-pill" }, Km = ["title"], qm = { class: "hub-section-head" }, Gm = { class: "hub-section-title" }, Wm = { class: "hub-section-sub" }, Zm = { class: "mod-grid" }, Ym = ["onClick"], Xm = { class: "mod-icon" }, Jm = { class: "mod-body" }, Qm = { class: "km-row-wrap" }, ef = { class: "mod-name" }, tf = { class: "mod-version" }, nf = {
  key: 0,
  class: "badge-app kx-tag-caps"
}, of = {
  key: 1,
  class: "badge-private kx-tag-caps",
  title: "Private Hub module"
}, sf = {
  key: 2,
  class: "badge-warn kx-tag-caps"
}, af = { class: "mod-org" }, lf = {
  key: 0,
  class: "mod-desc"
}, rf = { class: "mod-foot" }, uf = { class: "foot-stat" }, df = {
  key: 0,
  class: "foot-stat"
}, cf = ["title"], pf = {
  key: 2,
  class: "foot-stat km-dim km-ml-auto"
}, mf = {
  key: 5,
  class: "km-empty"
}, ff = { class: "km-muted" }, bf = { class: "km-mono" }, hf = {
  key: 6,
  class: "km-empty"
}, vf = {
  key: 7,
  class: "km-empty"
}, gf = { class: "km-muted" }, yf = { class: "km-mono" }, kf = {
  key: 0,
  class: "km-installed"
}, wf = ["aria-expanded"], Sf = { class: "km-sub" }, $f = {
  key: 0,
  class: "km-update-count"
}, Cf = {
  key: 1,
  class: "km-update-count"
}, If = {
  key: 0,
  class: "km-msg km-msg-err km-mb"
}, _f = {
  key: 1,
  class: "inst-toolbar"
}, xf = {
  key: 2,
  class: "inst-list"
}, Of = ["onClick"], Lf = { class: "inst-icon" }, zf = { class: "km-grow km-min0" }, Af = { class: "km-row-tight" }, Pf = { class: "inst-name" }, Mf = {
  key: 0,
  class: "badge-app kx-tag-caps"
}, Ef = {
  key: 1,
  class: "badge-private kx-tag-caps",
  title: "Private Hub module"
}, Tf = {
  key: 2,
  class: "km-chip"
}, Ff = ["title"], Vf = { class: "inst-id" }, Df = {
  key: 0,
  class: "km-dim"
}, Bf = {
  key: 0,
  class: "inst-update-msg"
}, Rf = { class: "inst-ver" }, jf = { class: "inst-migs" }, Hf = { class: "inst-actions" }, Uf = ["disabled", "aria-label", "onClick"], Nf = ["disabled", "aria-label", "onClick"], Kf = ["title", "aria-label"], qf = ["aria-label", "onClick"], Gf = ["title", "aria-label"], Wf = {
  key: 3,
  class: "km-empty inst-empty"
}, Zf = { class: "km-modal-body" }, Yf = { class: "km-uninstall-target" }, Xf = { class: "km-mono" }, Jf = { class: "km-dim" }, Qf = {
  key: 0,
  class: "km-msg km-msg-err"
}, eb = {
  key: 0,
  class: "km-code"
}, tb = {
  key: 1,
  class: "km-mt"
}, nb = {
  key: 1,
  class: "km-msg km-msg-info"
}, ob = {
  key: 2,
  class: "km-running"
}, ib = {
  key: 3,
  class: "km-uninstall-preview"
}, sb = {
  key: 0,
  class: "km-msg"
}, ab = {
  key: 1,
  class: "km-preview-block"
}, lb = { class: "km-mono" }, rb = { class: "km-dim" }, ub = {
  key: 2,
  class: "km-preview-block"
}, db = { class: "km-mono" }, cb = { class: "km-dim" }, pb = {
  key: 3,
  class: "km-preview-block"
}, mb = { class: "km-mono" }, fb = { class: "km-dim" }, bb = {
  key: 4,
  class: "km-ledger"
}, hb = { class: "km-ledger-step" }, vb = { class: "km-grow" }, gb = { class: "km-chip" }, yb = {
  key: 0,
  class: "km-ledger-msg"
}, kb = {
  key: 5,
  class: "km-running"
}, wb = { class: "km-grow km-running-label" }, Sb = { class: "km-dim" }, $b = ["disabled"], Cb = ["disabled"], Ib = ["disabled", "title"], _b = /* @__PURE__ */ Qt({
  __name: "modules",
  setup(e) {
    const t = Nl(), {
      LABEL: n,
      HUB_PORTAL: s,
      UNINSTALL_MIGRATION_OPTIONS: i,
      accessDenied: r,
      statusBanner: p,
      hubConnected: h,
      hubStatus: g,
      hubToken: k,
      showTokenPanel: w,
      hubConnecting: _,
      hubError: E,
      hubOrgs: R,
      hubIdentity: F,
      hubTokenStored: H,
      hubTokenExpired: x,
      hubTokenIcon: N,
      hubTokenButtonLabel: K,
      hubExpiry: M,
      saveHubToken: D,
      clearHubToken: c,
      selected: Q,
      selectedModule: m,
      detailReadme: $,
      detailLoading: L,
      detailTab: ae,
      detailVersions: v,
      envVars: O,
      requirements: z,
      detailGroups: V,
      versionMeta: X,
      selectedCanUpdate: te,
      selectedUpdateDisabledReason: oe,
      selectedCanUninstall: ce,
      selectedIsPrivate: pe,
      selectedUninstallBlockedReason: Ke,
      entryName: qe,
      entryDesc: Re,
      entryIcon: bt,
      openDetail: Le,
      closeDetail: Ht,
      detailInstall: Tt,
      detailUpdate: Ft,
      detailUninstall: ke,
      installed: ht,
      installedFilter: et,
      installedKindFilter: Ge,
      installedTotal: tt,
      updateScanLoading: nt,
      updateAllRunning: Me,
      availableUpdates: je,
      installedLoading: He,
      installedError: we,
      installedOpen: We,
      catalog: Vt,
      catalogLoading: ot,
      catalogError: Ze,
      catalogInstalledTotal: it,
      visibleCatalogInstalled: vt,
      browseFilter: st,
      sortBy: S,
      availableItems: A,
      featured: T,
      sortedItems: U,
      visibleInstalled: W,
      catalogItemFor: J,
      installedAccent: re,
      installedIcon: ve,
      installedIsRoot: at,
      installedIsPrivate: _t,
      installedRole: de,
      installedUsedBy: ze,
      installedCanUpdate: gt,
      installedUpdateDisabledReason: lt,
      installedCanUninstall: xt,
      installedUninstallDisabledReason: fe,
      installedMigrationSummary: Ee,
      updateInfoForDep: Se,
      updateStatusLabel: en,
      updateStatusIcon: Ut,
      updateStatusBusy: yt,
      scanInstalledUpdates: Nt,
      updateInstalledDependency: Te,
      updateAllAvailable: Fe,
      refreshAll: rt,
      installTarget: ge,
      closeInstallDialog: kt,
      onInstallChanged: wt,
      openUpdateDialog: tn,
      uninstallDialogOpen: Ye,
      uninstallDep: St,
      uninstallPolicy: ut,
      uninstallRunning: $e,
      uninstallPreviewLoading: Ie,
      uninstallPreview: be,
      uninstallExecution: Xe,
      uninstallCode: Ve,
      uninstallError: $t,
      uninstallRequiredBy: Ot,
      uninstallBlockedReason: Lt,
      uninstallActionBlockedReason: De,
      uninstallPhase: dt,
      uninstallElapsedSec: zt,
      openUninstallDialog: Kt,
      previewUninstall: ct,
      executionStepLabel: qt,
      runUninstall: Ct
    } = t, Gt = j(null);
    return (It, C) => (l(), u("div", nm, [
      o(p) ? (l(), u("div", {
        key: 0,
        class: ne(["km-banner", o(p).kind === "ok" ? "km-banner-ok" : "km-banner-err"])
      }, d(o(p).message), 3)) : f("", !0),
      o(r) ? (l(), u("div", om, [
        a("div", im, [
          y(o(I), {
            icon: "tabler:lock",
            class: "km-denied-icon",
            "aria-hidden": "true"
          }),
          C[19] || (C[19] = a("p", { class: "km-denied-title" }, "Admins only", -1)),
          C[20] || (C[20] = a("p", { class: "km-denied-sub" }, [
            P("You need the "),
            a("code", { class: "km-mono" }, "app.security:admin"),
            P(" scope to manage modules.")
          ], -1))
        ])
      ])) : (l(), u("div", sm, [
        o(Q) ? (l(), ye(tm, {
          key: 0,
          page: o(t)
        }, null, 8, ["page"])) : (l(), u("div", am, [
          a("section", null, [
            a("div", lm, [
              a("div", rm, [
                a("button", {
                  class: "km-btn km-btn-secondary km-btn-outlined km-btn-sm",
                  disabled: o(He) || o(ot),
                  onClick: C[0] || (C[0] = //@ts-ignore
                  (...b) => o(rt) && o(rt)(...b))
                }, [
                  y(o(I), {
                    icon: o(He) || o(ot) ? "tabler:loader-2" : "tabler:refresh",
                    class: ne(["km-i", (o(He) || o(ot)) && "spin"]),
                    "aria-hidden": "true"
                  }, null, 8, ["icon", "class"]),
                  C[21] || (C[21] = P(" Refresh ", -1))
                ], 8, um),
                a("button", {
                  class: "km-btn km-btn-secondary km-btn-outlined km-btn-sm",
                  disabled: o(nt) || o(Me) || o(He) || o(tt) === 0,
                  onClick: C[1] || (C[1] = //@ts-ignore
                  (...b) => o(Nt) && o(Nt)(...b))
                }, [
                  y(o(I), {
                    icon: o(nt) ? "tabler:loader-2" : "tabler:refresh-dot",
                    class: ne(["km-i", o(nt) && "spin"]),
                    "aria-hidden": "true"
                  }, null, 8, ["icon", "class"]),
                  C[22] || (C[22] = P(" Scan updates ", -1))
                ], 8, dm),
                a("button", {
                  class: "km-btn km-btn-sm",
                  disabled: o(Me) || o(nt) || o(je).length === 0,
                  onClick: C[2] || (C[2] = //@ts-ignore
                  (...b) => o(Fe) && o(Fe)(...b))
                }, [
                  y(o(I), {
                    icon: o(Me) ? "tabler:loader-2" : "tabler:download",
                    class: ne(["km-i", o(Me) && "spin"]),
                    "aria-hidden": "true"
                  }, null, 8, ["icon", "class"]),
                  C[23] || (C[23] = P(" Update all ", -1)),
                  o(je).length ? (l(), u("span", pm, d(o(je).length), 1)) : f("", !0)
                ], 8, cm),
                Be(a("input", {
                  "onUpdate:modelValue": C[3] || (C[3] = (b) => At(st) ? st.value = b : null),
                  class: "km-input km-filter",
                  placeholder: "Filter…"
                }, null, 512), [
                  [xn, o(st)]
                ]),
                y(o(On), {
                  modelValue: o(S),
                  "onUpdate:modelValue": C[4] || (C[4] = (b) => At(S) ? S.value = b : null),
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
                a("div", {
                  ref_key: "anchorEl",
                  ref: Gt,
                  class: "km-hub-auth"
                }, [
                  a("button", {
                    class: ne(["km-btn km-btn-sm", o(h) ? "km-btn-secondary km-btn-outlined" : o(x) ? "km-btn-warning km-btn-outlined" : ""]),
                    disabled: o(_),
                    onClick: C[5] || (C[5] = (b) => w.value = !o(w))
                  }, [
                    y(o(I), {
                      icon: o(N),
                      class: "km-i",
                      "aria-hidden": "true"
                    }, null, 8, ["icon"]),
                    P(" " + d(o(K)) + " ", 1),
                    y(o(I), {
                      icon: "tabler:chevron-down",
                      class: "km-i-sm",
                      "aria-hidden": "true"
                    })
                  ], 10, mm),
                  y(ii, {
                    open: o(w),
                    "onUpdate:open": C[10] || (C[10] = (b) => At(w) ? w.value = b : null),
                    anchor: Gt.value,
                    align: "right",
                    width: 300
                  }, {
                    default: he(() => [
                      a("div", fm, [
                        C[27] || (C[27] = a("div", { class: "km-hub-auth-title" }, "Wippy Hub token", -1)),
                        o(H) ? (l(), u("div", {
                          key: 0,
                          class: ne(["km-hub-auth-active", o(x) && "is-expired"])
                        }, [
                          a("div", bm, [
                            y(o(I), {
                              icon: o(x) ? "tabler:alert-triangle" : "tabler:circle-check-filled",
                              class: ne(["km-i-sm", o(x) ? "km-hub-warn" : "km-hub-ok"]),
                              "aria-hidden": "true"
                            }, null, 8, ["icon", "class"]),
                            a("span", null, [
                              P(d(o(x) ? "Token expired" : "Token active"), 1),
                              o(F) ? (l(), u(Y, { key: 0 }, [
                                C[24] || (C[24] = P(" — ", -1)),
                                a("strong", null, d(o(F)), 1)
                              ], 64)) : f("", !0)
                            ])
                          ]),
                          o(g)?.registry ? (l(), u("div", hm, d(o(g).registry), 1)) : f("", !0),
                          a("div", vm, [
                            o(g)?.scope ? (l(), u(Y, { key: 0 }, [
                              P("scope: " + d(o(g).scope), 1)
                            ], 64)) : f("", !0),
                            o(M) ? (l(), u(Y, { key: 1 }, [
                              P(" · expires " + d(o(M)), 1)
                            ], 64)) : f("", !0)
                          ]),
                          o(R).length ? (l(), u("div", gm, [
                            C[25] || (C[25] = a("div", { class: "km-hub-auth-orgs-label" }, "Organizations", -1)),
                            (l(!0), u(Y, null, se(o(R), (b) => (l(), u("div", {
                              key: b.id || b.name,
                              class: "km-hub-auth-org"
                            }, [
                              y(o(I), {
                                icon: "tabler:building",
                                class: "km-i-sm",
                                "aria-hidden": "true"
                              }),
                              a("span", ym, d(b.display_name || b.name), 1),
                              b.role ? (l(), u("span", km, d(b.role), 1)) : f("", !0)
                            ]))), 128))
                          ])) : f("", !0)
                        ], 2)) : f("", !0),
                        a("p", wm, [
                          P(d(o(H) ? "Replace the token, or" : "Paste a Hub registry token to browse and install private modules.") + " ", 1),
                          o(H) ? (l(), u(Y, { key: 0 }, [
                            P("create a new one")
                          ], 64)) : f("", !0),
                          a("a", {
                            href: o(s),
                            target: "_blank",
                            rel: "noopener"
                          }, d(o(H) ? "↗" : "Create one →"), 9, Sm)
                        ]),
                        Be(a("input", {
                          "onUpdate:modelValue": C[6] || (C[6] = (b) => At(k) ? k.value = b : null),
                          type: "password",
                          class: "km-input km-hub-auth-input",
                          placeholder: "wpy_…",
                          autocomplete: "off",
                          onKeyup: C[7] || (C[7] = Ui(
                            //@ts-ignore
                            (...b) => o(D) && o(D)(...b),
                            ["enter"]
                          ))
                        }, null, 544), [
                          [xn, o(k)]
                        ]),
                        a("div", $m, [
                          a("button", {
                            class: "km-btn km-btn-sm",
                            disabled: o(_),
                            onClick: C[8] || (C[8] = //@ts-ignore
                            (...b) => o(D) && o(D)(...b))
                          }, [
                            y(o(I), {
                              icon: o(_) ? "tabler:loader-2" : "tabler:device-floppy",
                              class: ne(["km-i", o(_) && "spin"]),
                              "aria-hidden": "true"
                            }, null, 8, ["icon", "class"]),
                            P(" " + d(o(_) ? "Saving…" : o(H) ? "Replace token" : "Save token"), 1)
                          ], 8, Cm),
                          o(H) ? (l(), u("button", {
                            key: 0,
                            class: "km-btn km-btn-secondary km-btn-outlined km-btn-sm",
                            onClick: C[9] || (C[9] = //@ts-ignore
                            (...b) => o(c) && o(c)(...b))
                          }, [
                            y(o(I), {
                              icon: "tabler:trash",
                              class: "km-i",
                              "aria-hidden": "true"
                            }),
                            C[26] || (C[26] = P(" Clear ", -1))
                          ])) : f("", !0)
                        ])
                      ])
                    ]),
                    _: 1
                  }, 8, ["open", "anchor"])
                ], 512)
              ])
            ]),
            o(E) ? (l(), u("div", Im, d(o(E)), 1)) : f("", !0),
            !o(h) && o(x) ? (l(), u("div", _m, "Your Wippy Hub token is expired.")) : f("", !0),
            o(Ze) ? (l(), u("div", xm, d(o(Ze)), 1)) : f("", !0),
            o(ot) || o(He) ? (l(), u("div", Om, [
              y(o(I), {
                icon: "tabler:loader-2",
                class: "km-i spin",
                "aria-hidden": "true"
              }),
              C[28] || (C[28] = P(" Loading modules… ", -1))
            ])) : o(A).length > 0 ? (l(), u(Y, { key: 4 }, [
              o(T).length ? (l(), u("div", Lm, [
                a("div", zm, [
                  y(o(I), {
                    icon: "tabler:flame",
                    class: "km-i km-flame",
                    "aria-hidden": "true"
                  }),
                  C[29] || (C[29] = a("span", { class: "hub-section-title" }, "Most popular", -1)),
                  C[30] || (C[30] = a("span", { class: "hub-section-sub" }, "by downloads", -1))
                ]),
                a("div", Am, [
                  (l(!0), u(Y, null, se(o(T), (b) => (l(), u("button", {
                    key: "f" + o(Pn)(b),
                    class: "feat-card",
                    style: jt({ "--accent": o(dn)(b) }),
                    onClick: (Ue) => o(Le)(b)
                  }, [
                    C[32] || (C[32] = a("span", { class: "feat-strip" }, null, -1)),
                    a("span", Mm, [
                      y(o(I), {
                        icon: o(Jt)(b),
                        class: "km-i-lg",
                        "aria-hidden": "true"
                      }, null, 8, ["icon"])
                    ]),
                    a("span", Em, [
                      a("span", Tm, [
                        a("span", Fm, d(o(Xt)(b)), 1),
                        o(ln)(b) ? (l(), u("span", Vm, "app")) : f("", !0),
                        o(un)(b) ? (l(), u("span", Dm, [
                          y(o(I), {
                            icon: "tabler:lock",
                            class: "km-i-xs",
                            "aria-hidden": "true"
                          }),
                          C[31] || (C[31] = P(" private", -1))
                        ])) : f("", !0),
                        b.deprecated ? (l(), u("span", Bm, "deprecated")) : f("", !0)
                      ]),
                      a("span", Rm, d(o(zn)(b)), 1),
                      b.description ? (l(), u("span", jm, d(b.description), 1)) : f("", !0),
                      a("span", Hm, [
                        a("span", Um, [
                          y(o(I), {
                            icon: "tabler:tag",
                            class: "km-i-xs",
                            "aria-hidden": "true"
                          }),
                          P(" " + d(b.latest_version || "?"), 1)
                        ]),
                        a("span", Nm, [
                          y(o(I), {
                            icon: "tabler:download",
                            class: "km-i-xs",
                            "aria-hidden": "true"
                          }),
                          P(" " + d(o(cn)(b.total_downloads)), 1)
                        ]),
                        b.license ? (l(), u("span", {
                          key: 0,
                          class: "meta-pill",
                          title: b.license
                        }, [
                          y(o(I), {
                            icon: "tabler:license",
                            class: "km-i-xs",
                            "aria-hidden": "true"
                          }),
                          P(" " + d(o(Mn)(b.license)), 1)
                        ], 8, Km)) : f("", !0)
                      ])
                    ])
                  ], 12, Pm))), 128))
                ])
              ])) : f("", !0),
              a("div", {
                class: ne(o(T).length ? "km-mt-sm" : "")
              }, [
                a("div", qm, [
                  y(o(I), {
                    icon: "tabler:apps",
                    class: "km-i km-accent",
                    "aria-hidden": "true"
                  }),
                  a("span", Gm, d(o(T).length ? "All modules" : "Available"), 1),
                  a("span", Wm, d(o(A).length) + " available", 1)
                ]),
                a("div", Zm, [
                  (l(!0), u(Y, null, se(o(U), (b) => (l(), u("button", {
                    key: o(Pn)(b),
                    class: "mod-card",
                    style: jt({ "--accent": o(dn)(b) }),
                    onClick: (Ue) => o(Le)(b)
                  }, [
                    a("span", Xm, [
                      y(o(I), {
                        icon: o(Jt)(b),
                        class: "km-i",
                        "aria-hidden": "true"
                      }, null, 8, ["icon"])
                    ]),
                    a("span", Jm, [
                      a("span", Qm, [
                        a("span", ef, d(o(Xt)(b)), 1),
                        a("span", tf, d(b.latest_version || "—"), 1),
                        o(ln)(b) ? (l(), u("span", nf, "app")) : f("", !0),
                        o(un)(b) ? (l(), u("span", of, [
                          y(o(I), {
                            icon: "tabler:lock",
                            class: "km-i-xs",
                            "aria-hidden": "true"
                          }),
                          C[33] || (C[33] = P(" private", -1))
                        ])) : f("", !0),
                        b.deprecated ? (l(), u("span", sf, "deprecated")) : f("", !0)
                      ]),
                      a("span", af, d(o(zn)(b)), 1),
                      b.description ? (l(), u("span", lf, d(b.description), 1)) : f("", !0),
                      a("span", rf, [
                        a("span", uf, [
                          y(o(I), {
                            icon: "tabler:download",
                            class: "km-i-xs",
                            "aria-hidden": "true"
                          }),
                          P(" " + d(o(cn)(b.total_downloads)), 1)
                        ]),
                        b.favorites_count ? (l(), u("span", df, [
                          y(o(I), {
                            icon: "tabler:star",
                            class: "km-i-xs",
                            "aria-hidden": "true"
                          }),
                          P(" " + d(b.favorites_count), 1)
                        ])) : f("", !0),
                        b.license ? (l(), u("span", {
                          key: 1,
                          class: "foot-stat km-dim",
                          title: b.license
                        }, d(o(Mn)(b.license)), 9, cf)) : f("", !0),
                        b.update_time ? (l(), u("span", pf, d(o(En)(b.update_time, { maxUnit: "year" })), 1)) : f("", !0)
                      ])
                    ])
                  ], 12, Ym))), 128))
                ])
              ], 2)
            ], 64)) : !o(Ze) && o(Vt).length === 0 ? (l(), u("div", mf, [
              y(o(I), {
                icon: "tabler:package-off",
                class: "km-i-xl km-dim km-block",
                "aria-hidden": "true"
              }),
              a("p", ff, [
                C[34] || (C[34] = P(" No modules tagged ", -1)),
                a("code", bf, d(o(n)), 1),
                C[35] || (C[35] = P(" are published yet. ", -1))
              ])
            ])) : !o(Ze) && o(st) ? (l(), u("div", hf, [...C[36] || (C[36] = [
              a("p", { class: "km-muted" }, "No available modules match this filter.", -1)
            ])])) : o(Ze) ? f("", !0) : (l(), u("div", vf, [
              y(o(I), {
                icon: "tabler:circle-check",
                class: "km-i-xl km-dim km-block",
                "aria-hidden": "true"
              }),
              a("p", gf, [
                C[37] || (C[37] = P(" All ", -1)),
                a("code", yf, d(o(n)), 1),
                C[38] || (C[38] = P(" modules are installed — manage them under Installed below. ", -1))
              ])
            ]))
          ]),
          o(ht).length > 0 || o(we) ? (l(), u("section", kf, [
            a("button", {
              class: "km-collapse-head",
              "aria-expanded": o(We),
              onClick: C[11] || (C[11] = (b) => We.value = !o(We))
            }, [
              y(o(I), {
                icon: o(We) ? "tabler:chevron-down" : "tabler:chevron-right",
                class: "km-i",
                "aria-hidden": "true"
              }, null, 8, ["icon"]),
              C[39] || (C[39] = a("span", { class: "km-h2" }, "Installed", -1)),
              a("span", Sf, [
                P(d(o(W).length), 1),
                o(W).length !== o(tt) ? (l(), u(Y, { key: 0 }, [
                  P(" of " + d(o(tt)), 1)
                ], 64)) : f("", !0),
                P(" module" + d(o(W).length === 1 ? "" : "s"), 1)
              ]),
              o(it) > 0 && o(it) !== o(tt) ? (l(), u("span", $f, d(o(vt)) + " of " + d(o(it)) + " hub module" + d(o(it) === 1 ? "" : "s"), 1)) : f("", !0),
              o(je).length ? (l(), u("span", Cf, d(o(je).length) + " update" + d(o(je).length === 1 ? "" : "s"), 1)) : f("", !0)
            ], 8, wf),
            o(We) ? (l(), u(Y, { key: 0 }, [
              o(we) ? (l(), u("div", If, d(o(we)), 1)) : f("", !0),
              o(ht).length > 0 ? (l(), u("div", _f, [
                Be(a("input", {
                  "onUpdate:modelValue": C[12] || (C[12] = (b) => At(et) ? et.value = b : null),
                  class: "km-input km-filter inst-filter",
                  placeholder: "Search installed…",
                  "aria-label": "Search installed modules"
                }, null, 512), [
                  [xn, o(et)]
                ]),
                y(o(On), {
                  modelValue: o(Ge),
                  "onUpdate:modelValue": C[13] || (C[13] = (b) => At(Ge) ? Ge.value = b : null),
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
              ])) : f("", !0),
              o(W).length > 0 ? (l(), u("div", xf, [
                (l(!0), u(Y, null, se(o(W), (b) => (l(), u("button", {
                  key: b.id,
                  class: "inst-row",
                  style: jt({ "--accent": o(re)(b) }),
                  onClick: (Ue) => o(Le)(b)
                }, [
                  C[41] || (C[41] = a("span", {
                    class: "inst-strip",
                    "aria-hidden": "true"
                  }, null, -1)),
                  a("div", Lf, [
                    y(o(I), {
                      icon: o(ve)(b),
                      class: "km-i",
                      "aria-hidden": "true"
                    }, null, 8, ["icon"])
                  ]),
                  a("div", zf, [
                    a("div", Af, [
                      a("span", Pf, d(b.component), 1),
                      o(ln)(o(J)(b.component)) ? (l(), u("span", Mf, "app")) : f("", !0),
                      a("span", {
                        class: ne(o(at)(b) ? "badge-installed kx-tag-caps" : "km-chip")
                      }, d(o(de)(b)), 3),
                      o(_t)(b) ? (l(), u("span", Ef, [
                        y(o(I), {
                          icon: "tabler:lock",
                          class: "km-i-xs",
                          "aria-hidden": "true"
                        }),
                        C[40] || (C[40] = P(" private", -1))
                      ])) : f("", !0),
                      b.source ? (l(), u("span", Tf, d(b.source), 1)) : f("", !0),
                      o(Se)(b) && o(Se)(b)?.status !== "current" ? (l(), u("span", {
                        key: 3,
                        class: ne(["inst-update", o(Se)(b)?.status]),
                        title: o(Se)(b)?.message || ""
                      }, [
                        y(o(I), {
                          icon: o(Ut)(b),
                          class: ne(["km-i-xs", o(yt)(b) && "spin"]),
                          "aria-hidden": "true"
                        }, null, 8, ["icon", "class"]),
                        P(" " + d(o(en)(b)), 1)
                      ], 10, Ff)) : f("", !0)
                    ]),
                    a("div", Vf, [
                      P(d(b.id) + " ", 1),
                      o(ze)(b) ? (l(), u("span", Df, " · " + d(o(ze)(b)), 1)) : f("", !0)
                    ]),
                    o(Se)(b)?.message ? (l(), u("div", Bf, d(o(Se)(b)?.message), 1)) : f("", !0)
                  ]),
                  a("span", Rf, d(o(mt)(b)), 1),
                  a("span", jf, d(o(Ee)(b)), 1),
                  a("div", Hf, [
                    o(Se)(b)?.status === "available" || o(yt)(b) ? (l(), u("button", {
                      key: 0,
                      class: "km-icon-btn",
                      disabled: o(yt)(b) || o(Me),
                      "aria-label": `Update ${b.component}`,
                      onClick: _n((Ue) => o(Te)(b), ["stop"])
                    }, [
                      y(o(I), {
                        icon: o(Ut)(b),
                        class: ne(["km-i", o(yt)(b) && "spin"]),
                        "aria-hidden": "true"
                      }, null, 8, ["icon", "class"])
                    ], 8, Uf)) : o(gt)(b) ? (l(), u("button", {
                      key: 1,
                      class: "km-icon-btn",
                      disabled: o(Me),
                      "aria-label": `Open update planner for ${b.component}`,
                      onClick: _n((Ue) => o(tn)(b), ["stop"])
                    }, [
                      y(o(I), {
                        icon: "tabler:refresh-dot",
                        class: "km-i",
                        "aria-hidden": "true"
                      })
                    ], 8, Nf)) : (l(), u("button", {
                      key: 2,
                      class: "km-icon-btn",
                      disabled: "",
                      title: o(lt)(b),
                      "aria-label": `Cannot update ${b.component}: ${o(lt)(b)}`
                    }, [
                      y(o(I), {
                        icon: "tabler:refresh-off",
                        class: "km-i",
                        "aria-hidden": "true"
                      })
                    ], 8, Kf)),
                    o(xt)(b) ? (l(), u("button", {
                      key: 3,
                      class: "km-icon-btn km-danger",
                      "aria-label": `Uninstall ${b.component}`,
                      onClick: _n((Ue) => o(Kt)(b), ["stop"])
                    }, [
                      y(o(I), {
                        icon: "tabler:trash",
                        class: "km-i",
                        "aria-hidden": "true"
                      })
                    ], 8, qf)) : (l(), u("button", {
                      key: 4,
                      class: "km-icon-btn",
                      disabled: "",
                      title: o(fe)(b),
                      "aria-label": `Cannot uninstall ${b.component}: ${o(fe)(b)}`
                    }, [
                      y(o(I), {
                        icon: "tabler:trash-off",
                        class: "km-i",
                        "aria-hidden": "true"
                      })
                    ], 8, Gf))
                  ]),
                  y(o(I), {
                    icon: "tabler:chevron-right",
                    class: "km-i km-chev",
                    "aria-hidden": "true"
                  })
                ], 12, Of))), 128))
              ])) : o(ht).length > 0 ? (l(), u("div", Wf, [
                y(o(I), {
                  icon: "tabler:filter-off",
                  class: "km-i-xl km-dim km-block",
                  "aria-hidden": "true"
                }),
                C[42] || (C[42] = a("p", { class: "km-muted" }, "No installed modules match this filter.", -1))
              ])) : f("", !0)
            ], 64)) : f("", !0)
          ])) : f("", !0)
        ]))
      ])),
      o(ge) ? (l(), ye(gc, {
        key: 3,
        open: !0,
        mode: o(ge).mode,
        component: o(ge).component,
        version: o(ge).version,
        "current-id": o(ge).currentId,
        "catalog-item": o(ge).catalogItem,
        "installed-dep": o(ge).installedDep,
        onClose: o(kt),
        onChanged: o(wt)
      }, null, 8, ["mode", "component", "version", "current-id", "catalog-item", "installed-dep", "onClose", "onChanged"])) : f("", !0),
      y(o(Go), {
        visible: o(Ye),
        "onUpdate:visible": C[18] || (C[18] = (b) => At(Ye) ? Ye.value = b : null),
        modal: "",
        closable: !o($e),
        "dismissable-mask": !o($e),
        "close-on-escape": !o($e),
        class: "km-dialog",
        pt: { header: { class: "km-modal-head" }, content: { class: "km-dialog-content" }, footer: { class: "km-modal-foot" } },
        style: { width: "min(560px, calc(100vw - 40px))" }
      }, {
        header: he(() => [...C[43] || (C[43] = [
          a("span", null, "Uninstall module", -1)
        ])]),
        footer: he(() => [
          a("button", {
            class: "km-btn km-btn-text km-btn-secondary km-btn-sm",
            disabled: o($e),
            onClick: C[15] || (C[15] = (b) => Ye.value = !1)
          }, "Cancel", 8, $b),
          a("button", {
            class: "km-btn km-btn-secondary km-btn-outlined km-btn-sm",
            disabled: o($e) || o(Ie),
            onClick: C[16] || (C[16] = //@ts-ignore
            (...b) => o(ct) && o(ct)(...b))
          }, [
            y(o(I), {
              icon: o(Ie) ? "tabler:loader-2" : "tabler:eye",
              class: ne(["km-i", o(Ie) && "spin"]),
              "aria-hidden": "true"
            }, null, 8, ["icon", "class"]),
            C[56] || (C[56] = P(" Preview ", -1))
          ], 8, Cb),
          a("button", {
            class: "km-btn km-btn-danger km-btn-sm",
            disabled: !!o(De),
            title: o(De) || void 0,
            onClick: C[17] || (C[17] = //@ts-ignore
            (...b) => o(Ct) && o(Ct)(...b))
          }, [
            y(o(I), {
              icon: o($e) ? "tabler:loader-2" : "tabler:trash",
              class: ne(["km-i", o($e) && "spin"]),
              "aria-hidden": "true"
            }, null, 8, ["icon", "class"]),
            C[57] || (C[57] = P(" Uninstall ", -1))
          ], 8, Ib)
        ]),
        default: he(() => [
          a("div", Zf, [
            a("p", Yf, [
              C[44] || (C[44] = P(" Uninstall ", -1)),
              a("code", Xf, d(o(St)?.component), 1),
              a("span", Jf, "(" + d(o(St)?.id) + ")", 1)
            ]),
            a("div", null, [
              C[45] || (C[45] = a("label", { class: "km-label" }, "Migration policy", -1)),
              y(o(On), {
                modelValue: o(ut),
                "onUpdate:modelValue": C[14] || (C[14] = (b) => At(ut) ? ut.value = b : null),
                class: "km-sort km-w-full",
                options: o(i),
                "option-label": "label",
                "option-value": "value",
                "aria-label": "Uninstall migration policy"
              }, null, 8, ["modelValue", "options"]),
              C[46] || (C[46] = a("p", { class: "km-req-desc" }, [
                P("Default "),
                a("code", { class: "km-mono" }, "block"),
                P(". Choose "),
                a("code", { class: "km-mono" }, "down"),
                P(" only if the module's down migrations are safe; data loss is possible.")
              ], -1))
            ]),
            o($t) ? (l(), u("div", Qf, [
              o(Ve) ? (l(), u("span", eb, d(o(Ve)), 1)) : f("", !0),
              P(d(o($t)) + " ", 1),
              o(Ot).length ? (l(), u("div", tb, "required by: " + d(o(Ot).join(", ")), 1)) : f("", !0)
            ])) : f("", !0),
            o(Lt) ? (l(), u("div", nb, [
              C[47] || (C[47] = a("strong", null, "Uninstall blocked:", -1)),
              P(" " + d(o(Lt)), 1)
            ])) : f("", !0),
            o(Ie) ? (l(), u("div", ob, [
              y(o(I), {
                icon: "tabler:loader-2",
                class: "km-i spin km-accent",
                "aria-hidden": "true"
              }),
              C[48] || (C[48] = a("span", { class: "km-grow km-running-label" }, "Previewing uninstall", -1))
            ])) : o(be) ? (l(), u("div", ib, [
              o(be).warnings?.length ? (l(), u("div", sb, [
                (l(!0), u(Y, null, se(o(be).warnings, (b) => (l(), u("div", { key: b }, d(b), 1))), 128))
              ])) : f("", !0),
              o(be).removed?.length ? (l(), u("div", ab, [
                C[50] || (C[50] = a("div", { class: "km-preview-title" }, "Removed", -1)),
                (l(!0), u(Y, null, se(o(be).removed, (b) => (l(), u("div", {
                  key: b.name || b.component,
                  class: "km-preview-row"
                }, [
                  y(o(I), {
                    icon: "tabler:minus",
                    class: "km-i-xs km-danger-fg",
                    "aria-hidden": "true"
                  }),
                  a("span", lb, d(b.name || b.component), 1),
                  C[49] || (C[49] = a("span", { class: "km-grow" }, null, -1)),
                  a("span", rb, d(b.version), 1)
                ]))), 128))
              ])) : f("", !0),
              o(be).kept?.length ? (l(), u("div", ub, [
                C[52] || (C[52] = a("div", { class: "km-preview-title" }, "Kept, still needed", -1)),
                (l(!0), u(Y, null, se(o(be).kept, (b) => (l(), u("div", {
                  key: b.name || b.component,
                  class: "km-preview-row"
                }, [
                  y(o(I), {
                    icon: "tabler:lock",
                    class: "km-i-xs km-dim",
                    "aria-hidden": "true"
                  }),
                  a("span", db, d(b.name || b.component), 1),
                  C[51] || (C[51] = a("span", { class: "km-grow" }, null, -1)),
                  a("span", cb, d(b.version), 1)
                ]))), 128))
              ])) : f("", !0),
              o(be).kept_under_uncertainty?.length ? (l(), u("div", pb, [
                C[54] || (C[54] = a("div", { class: "km-preview-title" }, "Kept under uncertainty", -1)),
                (l(!0), u(Y, null, se(o(be).kept_under_uncertainty, (b) => (l(), u("div", {
                  key: b.name || b.component,
                  class: "km-preview-row"
                }, [
                  y(o(I), {
                    icon: "tabler:help",
                    class: "km-i-xs km-dim",
                    "aria-hidden": "true"
                  }),
                  a("span", mb, d(b.name || b.component), 1),
                  C[53] || (C[53] = a("span", { class: "km-grow" }, null, -1)),
                  a("span", fb, d(b.reason || b.version), 1)
                ]))), 128))
              ])) : f("", !0)
            ])) : f("", !0),
            o(Xe).length ? (l(), u("div", bb, [
              C[55] || (C[55] = a("div", { class: "km-panel-title" }, "Execution ledger", -1)),
              (l(!0), u(Y, null, se(o(Xe), (b, Ue) => (l(), u("div", {
                key: `${b.step}-${Ue}`,
                class: ne(["km-ledger-row", b.status === "failed" || b.status === "rollback_failed" ? "km-ledger-bad" : b.status === "rolled_back" ? "km-ledger-warn" : "km-ledger-ok"])
              }, [
                a("span", hb, d(Ue + 1), 1),
                a("span", vb, d(o(qt)(b)), 1),
                a("span", gb, d(b.status), 1),
                b.message ? (l(), u("span", yb, d(b.message), 1)) : f("", !0)
              ], 2))), 128))
            ])) : f("", !0),
            o($e) ? (l(), u("div", kb, [
              y(o(I), {
                icon: "tabler:loader-2",
                class: "km-i spin km-accent",
                "aria-hidden": "true"
              }),
              a("span", wb, d(o(dt)), 1),
              a("span", Sb, d(o(zt)) + "s", 1)
            ])) : f("", !0)
          ])
        ]),
        _: 1
      }, 8, ["visible", "closable", "dismissable-mask", "close-on-escape"])
    ]));
  }
}), xb = { props: { type: "object", properties: {} } }, Ob = {
  wippy: xb
};
class Lb extends Fi {
  static get wippyConfig() {
    return {
      propsSchema: Ob.wippy.props,
      hostCssKeys: ["themeConfigUrl", "primeVueCssUrl"],
      inlineCss: Vi
    };
  }
  static get vueConfig() {
    return { rootComponent: _b, plugins: [Di] };
  }
}
Ki(import.meta.url, Lb);
//# sourceMappingURL=index.js.map

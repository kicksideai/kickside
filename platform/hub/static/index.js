import { B as ht, s as zt, l as to, A as li, a as ri, b as Lt, R as no, c as ui, L as Eo, d as Oe, v as Xt, U as di, I as uo, e as ci, r as To, f as pi, g as Fo, h as Vo, C as mi, i as fi, S as Do, _ as bi, W as hi, z as Bo, j as An, k as sn, T as an, F as vi, M as co, m as gi, n as yi, Y as ki, o as wi, D as Si, $ as $i, J as Ci, p as Yt, q as cn, t as bt, u as Pn, w as Qt, x as Mn, K as Nt, y as po, E as Le, G as Hn, H as mo, N as fo, O as Ii, P as En, Q as _i, V as xi, X as Oi, Z as Li, a0 as zi, a1 as Ai, a2 as Ro, a3 as en, a4 as pn, a5 as jo, a6 as Pi, a7 as xn, a8 as le, a9 as Mi, aa as Ei, ab as Ti, ac as Fi, ad as Vi, ae as un, af as mn, ag as Tn, ah as dn, ai as Di, aj as Bi, ak as Ri } from "./styles-DVUR8J1m.js";
import { openBlock as l, createElementBlock as u, mergeProps as W, createElementVNode as a, renderSlot as oe, createTextVNode as M, toDisplayString as d, resolveComponent as xe, resolveDirective as oo, withDirectives as Ve, createBlock as ye, resolveDynamicComponent as fn, withCtx as he, createCommentVNode as f, normalizeClass as te, computed as q, createVNode as y, Transition as Ho, Fragment as Y, renderList as ie, normalizeProps as ji, createSlots as Hi, withModifiers as On, defineComponent as tn, ref as j, watch as Ue, nextTick as bn, onBeforeUnmount as Uo, normalizeStyle as Kt, onUnmounted as io, onMounted as so, unref as o, useId as Ui, vModelText as Ln, vShow as ln, vModelCheckbox as Ni, isRef as Ot, withKeys as Ki } from "vue";
import { Icon as C } from "@iconify/vue";
import { api as ao, loadByTagName as No, host as Ko, on as qi, define as Gi } from "@wippy-fe/proxy";
function et(...e) {
  if (e) {
    let t = [];
    for (let n = 0; n < e.length; n++) {
      let s = e[n];
      if (!s) continue;
      let i = typeof s;
      if (i === "string" || i === "number") t.push(s);
      else if (i === "object") {
        let r = Array.isArray(s) ? [et(...s)] : Object.entries(s).map(([p, h]) => h ? p : void 0);
        t = r.length ? t.concat(r.filter((p) => !!p)) : t;
      }
    }
    return t.join(" ").trim();
  }
}
function Wi() {
  let e = [], t = (p, h, g = 999) => {
    let k = i(p, h, g), S = k.value + (k.key === p ? 0 : g) + 1;
    return e.push({ key: p, value: S }), S;
  }, n = (p) => {
    e = e.filter((h) => h.value !== p);
  }, s = (p, h) => i(p).value, i = (p, h, g = 0) => [...e].reverse().find((k) => !0) || { key: p, value: g }, r = (p) => p && parseInt(p.style.zIndex, 10) || 0;
  return { get: r, set: (p, h, g) => {
    h && (h.style.zIndex = String(t(p, !0, g)));
  }, clear: (p) => {
    p && (n(r(p)), p.style.zIndex = "");
  }, getCurrent: (p) => s(p) };
}
var Jt = Wi(), Zi = `
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
`, Yi = ht.extend({
  name: "baseicon",
  css: Zi
});
function hn(e) {
  "@babel/helpers - typeof";
  return hn = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, hn(e);
}
function bo(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var s = Object.getOwnPropertySymbols(e);
    t && (s = s.filter(function(i) {
      return Object.getOwnPropertyDescriptor(e, i).enumerable;
    })), n.push.apply(n, s);
  }
  return n;
}
function ho(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? bo(Object(n), !0).forEach(function(s) {
      Xi(e, s, n[s]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : bo(Object(n)).forEach(function(s) {
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
  return hn(t) == "symbol" ? t : t + "";
}
function Qi(e, t) {
  if (hn(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var s = n.call(e, t);
    if (hn(s) != "object") return s;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var At = {
  name: "BaseIcon",
  extends: zt,
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
      var t = to(this.label);
      return ho(ho({}, !this.isUnstyled && {
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
function vn(e) {
  "@babel/helpers - typeof";
  return vn = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, vn(e);
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
  return vn(t) == "symbol" ? t : t + "";
}
function is(e, t) {
  if (vn(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var s = n.call(e, t);
    if (vn(s) != "object") return s;
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
})(), as = ri(), lo = {
  name: "TimesIcon",
  extends: At
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
    if (typeof e == "string") return Un(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Un(e, t) : void 0;
  }
}
function ds(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function cs(e) {
  if (Array.isArray(e)) return Un(e);
}
function Un(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, s = Array(t); n < t; n++) s[n] = e[n];
  return s;
}
function ps(e, t, n, s, i, r) {
  return l(), u("svg", W({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), ls(t[0] || (t[0] = [a("path", {
    d: "M8.01186 7.00933L12.27 2.75116C12.341 2.68501 12.398 2.60524 12.4375 2.51661C12.4769 2.42798 12.4982 2.3323 12.4999 2.23529C12.5016 2.13827 12.4838 2.0419 12.4474 1.95194C12.4111 1.86197 12.357 1.78024 12.2884 1.71163C12.2198 1.64302 12.138 1.58893 12.0481 1.55259C11.9581 1.51625 11.8617 1.4984 11.7647 1.50011C11.6677 1.50182 11.572 1.52306 11.4834 1.56255C11.3948 1.60204 11.315 1.65898 11.2488 1.72997L6.99067 5.98814L2.7325 1.72997C2.59553 1.60234 2.41437 1.53286 2.22718 1.53616C2.03999 1.53946 1.8614 1.61529 1.72901 1.74767C1.59663 1.88006 1.5208 2.05865 1.5175 2.24584C1.5142 2.43303 1.58368 2.61419 1.71131 2.75116L5.96948 7.00933L1.71131 11.2675C1.576 11.403 1.5 11.5866 1.5 11.7781C1.5 11.9696 1.576 12.1532 1.71131 12.2887C1.84679 12.424 2.03043 12.5 2.2219 12.5C2.41338 12.5 2.59702 12.424 2.7325 12.2887L6.99067 8.03052L11.2488 12.2887C11.3843 12.424 11.568 12.5 11.7594 12.5C11.9509 12.5 12.1346 12.424 12.27 12.2887C12.4053 12.1532 12.4813 11.9696 12.4813 11.7781C12.4813 11.5866 12.4053 11.403 12.27 11.2675L8.01186 7.00933Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
lo.render = ps;
var qo = {
  name: "WindowMaximizeIcon",
  extends: At
};
function ms(e) {
  return vs(e) || hs(e) || bs(e) || fs();
}
function fs() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function bs(e, t) {
  if (e) {
    if (typeof e == "string") return Nn(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Nn(e, t) : void 0;
  }
}
function hs(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function vs(e) {
  if (Array.isArray(e)) return Nn(e);
}
function Nn(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, s = Array(t); n < t; n++) s[n] = e[n];
  return s;
}
function gs(e, t, n, s, i, r) {
  return l(), u("svg", W({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), ms(t[0] || (t[0] = [a("path", {
    "fill-rule": "evenodd",
    "clip-rule": "evenodd",
    d: "M7 14H11.8C12.3835 14 12.9431 13.7682 13.3556 13.3556C13.7682 12.9431 14 12.3835 14 11.8V2.2C14 1.61652 13.7682 1.05694 13.3556 0.644365C12.9431 0.231785 12.3835 0 11.8 0H2.2C1.61652 0 1.05694 0.231785 0.644365 0.644365C0.231785 1.05694 0 1.61652 0 2.2V7C0 7.15913 0.063214 7.31174 0.175736 7.42426C0.288258 7.53679 0.44087 7.6 0.6 7.6C0.75913 7.6 0.911742 7.53679 1.02426 7.42426C1.13679 7.31174 1.2 7.15913 1.2 7V2.2C1.2 1.93478 1.30536 1.68043 1.49289 1.49289C1.68043 1.30536 1.93478 1.2 2.2 1.2H11.8C12.0652 1.2 12.3196 1.30536 12.5071 1.49289C12.6946 1.68043 12.8 1.93478 12.8 2.2V11.8C12.8 12.0652 12.6946 12.3196 12.5071 12.5071C12.3196 12.6946 12.0652 12.8 11.8 12.8H7C6.84087 12.8 6.68826 12.8632 6.57574 12.9757C6.46321 13.0883 6.4 13.2409 6.4 13.4C6.4 13.5591 6.46321 13.7117 6.57574 13.8243C6.68826 13.9368 6.84087 14 7 14ZM9.77805 7.42192C9.89013 7.534 10.0415 7.59788 10.2 7.59995C10.3585 7.59788 10.5099 7.534 10.622 7.42192C10.7341 7.30985 10.798 7.15844 10.8 6.99995V3.94242C10.8066 3.90505 10.8096 3.86689 10.8089 3.82843C10.8079 3.77159 10.7988 3.7157 10.7824 3.6623C10.756 3.55552 10.701 3.45698 10.622 3.37798C10.5099 3.2659 10.3585 3.20202 10.2 3.19995H7.00002C6.84089 3.19995 6.68828 3.26317 6.57576 3.37569C6.46324 3.48821 6.40002 3.64082 6.40002 3.79995C6.40002 3.95908 6.46324 4.11169 6.57576 4.22422C6.68828 4.33674 6.84089 4.39995 7.00002 4.39995H8.80006L6.19997 7.00005C6.10158 7.11005 6.04718 7.25246 6.04718 7.40005C6.04718 7.54763 6.10158 7.69004 6.19997 7.80005C6.30202 7.91645 6.44561 7.98824 6.59997 8.00005C6.75432 7.98824 6.89791 7.91645 6.99997 7.80005L9.60002 5.26841V6.99995C9.6021 7.15844 9.66598 7.30985 9.77805 7.42192ZM1.4 14H3.8C4.17066 13.9979 4.52553 13.8498 4.78763 13.5877C5.04973 13.3256 5.1979 12.9707 5.2 12.6V10.2C5.1979 9.82939 5.04973 9.47452 4.78763 9.21242C4.52553 8.95032 4.17066 8.80215 3.8 8.80005H1.4C1.02934 8.80215 0.674468 8.95032 0.412371 9.21242C0.150274 9.47452 0.00210008 9.82939 0 10.2V12.6C0.00210008 12.9707 0.150274 13.3256 0.412371 13.5877C0.674468 13.8498 1.02934 13.9979 1.4 14ZM1.25858 10.0586C1.29609 10.0211 1.34696 10 1.4 10H3.8C3.85304 10 3.90391 10.0211 3.94142 10.0586C3.97893 10.0961 4 10.147 4 10.2V12.6C4 12.6531 3.97893 12.704 3.94142 12.7415C3.90391 12.779 3.85304 12.8 3.8 12.8H1.4C1.34696 12.8 1.29609 12.779 1.25858 12.7415C1.22107 12.704 1.2 12.6531 1.2 12.6V10.2C1.2 10.147 1.22107 10.0961 1.25858 10.0586Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
qo.render = gs;
var Go = {
  name: "WindowMinimizeIcon",
  extends: At
};
function ys(e) {
  return $s(e) || Ss(e) || ws(e) || ks();
}
function ks() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function ws(e, t) {
  if (e) {
    if (typeof e == "string") return Kn(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Kn(e, t) : void 0;
  }
}
function Ss(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function $s(e) {
  if (Array.isArray(e)) return Kn(e);
}
function Kn(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, s = Array(t); n < t; n++) s[n] = e[n];
  return s;
}
function Cs(e, t, n, s, i, r) {
  return l(), u("svg", W({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), ys(t[0] || (t[0] = [a("path", {
    "fill-rule": "evenodd",
    "clip-rule": "evenodd",
    d: "M11.8 0H2.2C1.61652 0 1.05694 0.231785 0.644365 0.644365C0.231785 1.05694 0 1.61652 0 2.2V7C0 7.15913 0.063214 7.31174 0.175736 7.42426C0.288258 7.53679 0.44087 7.6 0.6 7.6C0.75913 7.6 0.911742 7.53679 1.02426 7.42426C1.13679 7.31174 1.2 7.15913 1.2 7V2.2C1.2 1.93478 1.30536 1.68043 1.49289 1.49289C1.68043 1.30536 1.93478 1.2 2.2 1.2H11.8C12.0652 1.2 12.3196 1.30536 12.5071 1.49289C12.6946 1.68043 12.8 1.93478 12.8 2.2V11.8C12.8 12.0652 12.6946 12.3196 12.5071 12.5071C12.3196 12.6946 12.0652 12.8 11.8 12.8H7C6.84087 12.8 6.68826 12.8632 6.57574 12.9757C6.46321 13.0883 6.4 13.2409 6.4 13.4C6.4 13.5591 6.46321 13.7117 6.57574 13.8243C6.68826 13.9368 6.84087 14 7 14H11.8C12.3835 14 12.9431 13.7682 13.3556 13.3556C13.7682 12.9431 14 12.3835 14 11.8V2.2C14 1.61652 13.7682 1.05694 13.3556 0.644365C12.9431 0.231785 12.3835 0 11.8 0ZM6.368 7.952C6.44137 7.98326 6.52025 7.99958 6.6 8H9.8C9.95913 8 10.1117 7.93678 10.2243 7.82426C10.3368 7.71174 10.4 7.55913 10.4 7.4C10.4 7.24087 10.3368 7.08826 10.2243 6.97574C10.1117 6.86321 9.95913 6.8 9.8 6.8H8.048L10.624 4.224C10.73 4.11026 10.7877 3.95982 10.7849 3.80438C10.7822 3.64894 10.7192 3.50063 10.6093 3.3907C10.4994 3.28077 10.3511 3.2178 10.1956 3.21506C10.0402 3.21232 9.88974 3.27002 9.776 3.376L7.2 5.952V4.2C7.2 4.04087 7.13679 3.88826 7.02426 3.77574C6.91174 3.66321 6.75913 3.6 6.6 3.6C6.44087 3.6 6.28826 3.66321 6.17574 3.77574C6.06321 3.88826 6 4.04087 6 4.2V7.4C6.00042 7.47975 6.01674 7.55862 6.048 7.632C6.07656 7.70442 6.11971 7.7702 6.17475 7.82524C6.2298 7.88029 6.29558 7.92344 6.368 7.952ZM1.4 8.80005H3.8C4.17066 8.80215 4.52553 8.95032 4.78763 9.21242C5.04973 9.47452 5.1979 9.82939 5.2 10.2V12.6C5.1979 12.9707 5.04973 13.3256 4.78763 13.5877C4.52553 13.8498 4.17066 13.9979 3.8 14H1.4C1.02934 13.9979 0.674468 13.8498 0.412371 13.5877C0.150274 13.3256 0.00210008 12.9707 0 12.6V10.2C0.00210008 9.82939 0.150274 9.47452 0.412371 9.21242C0.674468 8.95032 1.02934 8.80215 1.4 8.80005ZM3.94142 12.7415C3.97893 12.704 4 12.6531 4 12.6V10.2C4 10.147 3.97893 10.0961 3.94142 10.0586C3.90391 10.0211 3.85304 10 3.8 10H1.4C1.34696 10 1.29609 10.0211 1.25858 10.0586C1.22107 10.0961 1.2 10.147 1.2 10.2V12.6C1.2 12.6531 1.22107 12.704 1.25858 12.7415C1.29609 12.779 1.34696 12.8 1.4 12.8H3.8C3.85304 12.8 3.90391 12.779 3.94142 12.7415Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
Go.render = Cs;
var Vn = {
  name: "SpinnerIcon",
  extends: At
};
function Is(e) {
  return Ls(e) || Os(e) || xs(e) || _s();
}
function _s() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function xs(e, t) {
  if (e) {
    if (typeof e == "string") return qn(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? qn(e, t) : void 0;
  }
}
function Os(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function Ls(e) {
  if (Array.isArray(e)) return qn(e);
}
function qn(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, s = Array(t); n < t; n++) s[n] = e[n];
  return s;
}
function zs(e, t, n, s, i, r) {
  return l(), u("svg", W({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), Is(t[0] || (t[0] = [a("path", {
    d: "M6.99701 14C5.85441 13.999 4.72939 13.7186 3.72012 13.1832C2.71084 12.6478 1.84795 11.8737 1.20673 10.9284C0.565504 9.98305 0.165424 8.89526 0.041387 7.75989C-0.0826496 6.62453 0.073125 5.47607 0.495122 4.4147C0.917119 3.35333 1.59252 2.4113 2.46241 1.67077C3.33229 0.930247 4.37024 0.413729 5.4857 0.166275C6.60117 -0.0811796 7.76026 -0.0520535 8.86188 0.251112C9.9635 0.554278 10.9742 1.12227 11.8057 1.90555C11.915 2.01493 11.9764 2.16319 11.9764 2.31778C11.9764 2.47236 11.915 2.62062 11.8057 2.73C11.7521 2.78503 11.688 2.82877 11.6171 2.85864C11.5463 2.8885 11.4702 2.90389 11.3933 2.90389C11.3165 2.90389 11.2404 2.8885 11.1695 2.85864C11.0987 2.82877 11.0346 2.78503 10.9809 2.73C9.9998 1.81273 8.73246 1.26138 7.39226 1.16876C6.05206 1.07615 4.72086 1.44794 3.62279 2.22152C2.52471 2.99511 1.72683 4.12325 1.36345 5.41602C1.00008 6.70879 1.09342 8.08723 1.62775 9.31926C2.16209 10.5513 3.10478 11.5617 4.29713 12.1803C5.48947 12.7989 6.85865 12.988 8.17414 12.7157C9.48963 12.4435 10.6711 11.7264 11.5196 10.6854C12.3681 9.64432 12.8319 8.34282 12.8328 7C12.8328 6.84529 12.8943 6.69692 13.0038 6.58752C13.1132 6.47812 13.2616 6.41667 13.4164 6.41667C13.5712 6.41667 13.7196 6.47812 13.8291 6.58752C13.9385 6.69692 14 6.84529 14 7C14 8.85651 13.2622 10.637 11.9489 11.9497C10.6356 13.2625 8.85432 14 6.99701 14Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
Vn.render = zs;
var As = `
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
`, Ps = {
  root: function(t) {
    var n = t.props, s = t.instance;
    return ["p-badge p-component", {
      "p-badge-circle": Lt(n.value) && String(n.value).length === 1,
      "p-badge-dot": to(n.value) && !s.$slots.default,
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
}, Ms = ht.extend({
  name: "badge",
  style: As,
  classes: Ps
}), Es = {
  name: "BaseBadge",
  extends: zt,
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
  style: Ms,
  provide: function() {
    return {
      $pcBadge: this,
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
function vo(e, t, n) {
  return (t = Ts(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Ts(e) {
  var t = Fs(e, "string");
  return gn(t) == "symbol" ? t : t + "";
}
function Fs(e, t) {
  if (gn(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var s = n.call(e, t);
    if (gn(s) != "object") return s;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var Wo = {
  name: "Badge",
  extends: Es,
  inheritAttrs: !1,
  computed: {
    dataP: function() {
      return et(vo(vo({
        circle: this.value != null && String(this.value).length === 1,
        empty: this.value == null && !this.$slots.default
      }, this.severity, this.severity), this.size, this.size));
    }
  }
}, Vs = ["data-p"];
function Ds(e, t, n, s, i, r) {
  return l(), u("span", W({
    class: e.cx("root"),
    "data-p": r.dataP
  }, e.ptmi("root")), [oe(e.$slots, "default", {}, function() {
    return [M(d(e.value), 1)];
  })], 16, Vs);
}
Wo.render = Ds;
var Bs = `
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
function yn(e) {
  "@babel/helpers - typeof";
  return yn = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, yn(e);
}
function ft(e, t, n) {
  return (t = Rs(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Rs(e) {
  var t = js(e, "string");
  return yn(t) == "symbol" ? t : t + "";
}
function js(e, t) {
  if (yn(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var s = n.call(e, t);
    if (yn(s) != "object") return s;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var Hs = {
  root: function(t) {
    var n = t.instance, s = t.props;
    return ["p-button p-component", ft(ft(ft(ft(ft(ft(ft(ft(ft({
      "p-button-icon-only": n.hasIcon && !s.label && !s.badge,
      "p-button-vertical": (s.iconPos === "top" || s.iconPos === "bottom") && s.label,
      "p-button-loading": s.loading,
      "p-button-link": s.link || s.variant === "link"
    }, "p-button-".concat(s.severity), s.severity), "p-button-raised", s.raised), "p-button-rounded", s.rounded), "p-button-text", s.text || s.variant === "text"), "p-button-outlined", s.outlined || s.variant === "outlined"), "p-button-sm", s.size === "small"), "p-button-lg", s.size === "large"), "p-button-plain", s.plain), "p-button-fluid", n.hasFluid)];
  },
  loadingIcon: "p-button-loading-icon",
  icon: function(t) {
    var n = t.props;
    return ["p-button-icon", ft({}, "p-button-icon-".concat(n.iconPos), n.label)];
  },
  label: "p-button-label"
}, Us = ht.extend({
  name: "button",
  style: Bs,
  classes: Hs
}), Ns = {
  name: "BaseButton",
  extends: zt,
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
  style: Us,
  provide: function() {
    return {
      $pcButton: this,
      $parentInstance: this
    };
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
function Ee(e, t, n) {
  return (t = Ks(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Ks(e) {
  var t = qs(e, "string");
  return kn(t) == "symbol" ? t : t + "";
}
function qs(e, t) {
  if (kn(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var s = n.call(e, t);
    if (kn(s) != "object") return s;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var ro = {
  name: "Button",
  extends: Ns,
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
      return to(this.fluid) ? !!this.$pcFluid : this.fluid;
    },
    dataP: function() {
      return et(Ee(Ee(Ee(Ee(Ee(Ee(Ee(Ee(Ee(Ee({}, this.size, this.size), "icon-only", this.hasIcon && !this.label && !this.badge), "loading", this.loading), "fluid", this.hasFluid), "rounded", this.rounded), "raised", this.raised), "outlined", this.outlined || this.variant === "outlined"), "text", this.text || this.variant === "text"), "link", this.link || this.variant === "link"), "vertical", (this.iconPos === "top" || this.iconPos === "bottom") && this.label));
    },
    dataIconP: function() {
      return et(Ee(Ee({}, this.iconPos, this.iconPos), this.size, this.size));
    },
    dataLabelP: function() {
      return et(Ee(Ee({}, this.size, this.size), "icon-only", this.hasIcon && !this.label && !this.badge));
    }
  },
  components: {
    SpinnerIcon: Vn,
    Badge: Wo
  },
  directives: {
    ripple: no
  }
}, Gs = ["data-p"], Ws = ["data-p"];
function Zs(e, t, n, s, i, r) {
  var p = xe("SpinnerIcon"), h = xe("Badge"), g = oo("ripple");
  return e.asChild ? oe(e.$slots, "default", {
    key: 1,
    class: te(e.cx("root")),
    a11yAttrs: r.a11yAttrs
  }) : Ve((l(), ye(fn(e.as), W({
    key: 0,
    class: e.cx("root"),
    "data-p": r.dataP
  }, r.attrs), {
    default: he(function() {
      return [oe(e.$slots, "default", {}, function() {
        return [e.loading ? oe(e.$slots, "loadingicon", W({
          key: 0,
          class: [e.cx("loadingIcon"), e.cx("icon")]
        }, e.ptm("loadingIcon")), function() {
          return [e.loadingIcon ? (l(), u("span", W({
            key: 0,
            class: [e.cx("loadingIcon"), e.cx("icon"), e.loadingIcon]
          }, e.ptm("loadingIcon")), null, 16)) : (l(), ye(p, W({
            key: 1,
            class: [e.cx("loadingIcon"), e.cx("icon")],
            spin: ""
          }, e.ptm("loadingIcon")), null, 16, ["class"]))];
        }) : oe(e.$slots, "icon", W({
          key: 1,
          class: [e.cx("icon")]
        }, e.ptm("icon")), function() {
          return [e.icon ? (l(), u("span", W({
            key: 0,
            class: [e.cx("icon"), e.icon, e.iconClass],
            "data-p": r.dataIconP
          }, e.ptm("icon")), null, 16, Gs)) : f("", !0)];
        }), e.label ? (l(), u("span", W({
          key: 2,
          class: e.cx("label")
        }, e.ptm("label"), {
          "data-p": r.dataLabelP
        }), d(e.label), 17, Ws)) : f("", !0), e.badge ? (l(), ye(h, {
          key: 3,
          value: e.badge,
          class: te(e.badgeClass),
          severity: e.badgeSeverity,
          unstyled: e.unstyled,
          pt: e.ptm("pcBadge")
        }, null, 8, ["value", "class", "severity", "unstyled", "pt"])) : f("", !0)];
      })];
    }),
    _: 3
  }, 16, ["class", "data-p"])), [[g]]);
}
ro.render = Zs;
var Ys = ht.extend({
  name: "focustrap-directive"
}), Xs = ui.extend({
  style: Ys
});
function wn(e) {
  "@babel/helpers - typeof";
  return wn = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, wn(e);
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
  return wn(t) == "symbol" ? t : t + "";
}
function ea(e, t) {
  if (wn(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var s = n.call(e, t);
    if (wn(s) != "object") return s;
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
      var s = this, i = n.value || {}, r = i.onFocusIn, p = i.onFocusOut;
      t.$_pfocustrap_mutationobserver = new MutationObserver(function(h) {
        h.forEach(function(g) {
          if (g.type === "childList" && !t.contains(document.activeElement)) {
            var k = function(x) {
              var E = uo(x) ? uo(x, s.getComputedSelector(t.$_pfocustrap_focusableselector)) ? x : Xt(t, s.getComputedSelector(t.$_pfocustrap_focusableselector)) : Xt(x);
              return Lt(E) ? E : x.nextSibling && k(x.nextSibling);
            };
            Oe(k(g.nextSibling));
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
        value: yo(yo({}, t), {}, {
          autoFocus: !0
        })
      });
    },
    autoElementFocus: function(t, n) {
      var s = n.value || {}, i = s.autoFocusSelector, r = i === void 0 ? "" : i, p = s.firstFocusableSelector, h = p === void 0 ? "" : p, g = s.autoFocus, k = g === void 0 ? !1 : g, S = Xt(t, "[autofocus]".concat(this.getComputedSelector(r)));
      k && !S && (S = Xt(t, this.getComputedSelector(h))), Oe(S);
    },
    onFirstHiddenElementFocus: function(t) {
      var n, s = t.currentTarget, i = t.relatedTarget, r = i === s.$_pfocustrap_lasthiddenfocusableelement || !((n = this.$el) !== null && n !== void 0 && n.contains(i)) ? Xt(s.parentElement, this.getComputedSelector(s.$_pfocustrap_focusableselector)) : s.$_pfocustrap_lasthiddenfocusableelement;
      Oe(r);
    },
    onLastHiddenElementFocus: function(t) {
      var n, s = t.currentTarget, i = t.relatedTarget, r = i === s.$_pfocustrap_firsthiddenfocusableelement || !((n = this.$el) !== null && n !== void 0 && n.contains(i)) ? Eo(s.parentElement, this.getComputedSelector(s.$_pfocustrap_focusableselector)) : s.$_pfocustrap_firsthiddenfocusableelement;
      Oe(r);
    },
    createHiddenFocusableElements: function(t, n) {
      var s = this, i = n.value || {}, r = i.tabIndex, p = r === void 0 ? 0 : r, h = i.firstFocusableSelector, g = h === void 0 ? "" : h, k = i.lastFocusableSelector, S = k === void 0 ? "" : k, x = function(N) {
        return di("span", {
          class: "p-hidden-accessible p-hidden-focusable",
          tabIndex: p,
          role: "presentation",
          "aria-hidden": !0,
          "data-p-hidden-accessible": !0,
          "data-p-hidden-focusable": !0,
          onFocus: N?.bind(s)
        });
      }, E = x(this.onFirstHiddenElementFocus), R = x(this.onLastHiddenElementFocus);
      E.$_pfocustrap_lasthiddenfocusableelement = R, E.$_pfocustrap_focusableselector = g, E.setAttribute("data-pc-section", "firstfocusableelement"), R.$_pfocustrap_firsthiddenfocusableelement = E, R.$_pfocustrap_focusableselector = S, R.setAttribute("data-pc-section", "lastfocusableelement"), t.prepend(E), t.append(R);
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
}, sa = ht.extend({
  name: "dialog",
  style: na,
  classes: ia,
  inlineStyles: oa
}), aa = {
  name: "BaseDialog",
  extends: zt,
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
    this.unbindDocumentState(), this.unbindGlobalListeners(), this.destroyStyle(), this.mask && this.autoZIndex && Jt.clear(this.mask), this.container = null, this.mask = null;
  },
  mounted: function() {
    this.breakpoints && this.createStyle();
  },
  methods: {
    close: function() {
      this.$emit("update:visible", !1);
    },
    onEnter: function() {
      this.$emit("show"), this.target = document.activeElement, this.enableDocumentSettings(), this.bindGlobalListeners(), this.autoZIndex && Jt.set("modal", this.mask, this.baseZIndex || this.$primevue.config.zIndex.modal);
    },
    onAfterEnter: function() {
      this.focus();
    },
    onBeforeLeave: function() {
      this.modal && !this.isUnstyled && hi(this.mask, "p-overlay-mask-leave-active"), this.dragging && this.documentDragEndListener && this.documentDragEndListener();
    },
    onLeave: function() {
      this.$emit("hide"), Oe(this.target), this.target = null, this.focusableClose = null, this.focusableMax = null;
    },
    onAfterLeave: function() {
      this.autoZIndex && Jt.clear(this.mask), this.containerVisible = !1, this.unbindDocumentState(), this.unbindGlobalListeners(), this.$emit("after-hide");
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
      n || (n = this.$slots.header && t(this.headerContainer), n || (n = this.$slots.default && t(this.content), n || (this.maximizable ? (this.focusableMax = !0, n = this.maximizableButton) : (this.focusableClose = !0, n = this.closeButton)))), n && Oe(n, {
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
        this.styleElement = document.createElement("style"), this.styleElement.type = "text/css", bi(this.styleElement, "nonce", (t = this.$primevue) === null || t === void 0 || (t = t.config) === null || t === void 0 || (t = t.csp) === null || t === void 0 ? void 0 : t.nonce), document.head.appendChild(this.styleElement);
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
          var s = Vo(t.container), i = mi(t.container), r = n.pageX - t.lastPageX, p = n.pageY - t.lastPageY, h = t.container.getBoundingClientRect(), g = h.left + r, k = h.top + p, S = fi(), x = getComputedStyle(t.container), E = parseFloat(x.marginLeft), R = parseFloat(x.marginTop);
          t.container.style.position = "fixed", t.keepInViewport ? (g >= t.minX && g + s < S.width && (t.lastPageX = n.pageX, t.container.style.left = g - E + "px"), k >= t.minY && k + i < S.height && (t.lastPageY = n.pageY, t.container.style.top = k - R + "px")) : (t.lastPageX = n.pageX, t.container.style.left = g - E + "px", t.lastPageY = n.pageY, t.container.style.top = k - R + "px");
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
      return et({
        maximized: this.maximized,
        modal: this.modal
      });
    }
  },
  directives: {
    ripple: no,
    focustrap: ta
  },
  components: {
    Button: ro,
    Portal: Fo,
    WindowMinimizeIcon: Go,
    WindowMaximizeIcon: qo,
    TimesIcon: lo
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
  return Sn(t) == "symbol" ? t : t + "";
}
function ua(e, t) {
  if (Sn(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var s = n.call(e, t);
    if (Sn(s) != "object") return s;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var da = ["data-p"], ca = ["aria-labelledby", "aria-modal", "data-p"], pa = ["id"], ma = ["data-p"];
function fa(e, t, n, s, i, r) {
  var p = xe("Button"), h = xe("Portal"), g = oo("focustrap");
  return l(), ye(h, {
    appendTo: e.appendTo
  }, {
    default: he(function() {
      return [i.containerVisible ? (l(), u("div", W({
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
      }, e.ptm("mask")), [y(Ho, W({
        name: "p-dialog",
        onEnter: r.onEnter,
        onAfterEnter: r.onAfterEnter,
        onBeforeLeave: r.onBeforeLeave,
        onLeave: r.onLeave,
        onAfterLeave: r.onAfterLeave,
        appear: ""
      }, e.ptm("transition")), {
        default: he(function() {
          return [e.visible ? Ve((l(), u("div", W({
            key: 0,
            ref: r.containerRef,
            class: e.cx("root"),
            style: e.sx("root"),
            role: "dialog",
            "aria-labelledby": r.ariaLabelledById,
            "aria-modal": e.modal,
            "data-p": r.dataP
          }, e.ptmi("root")), [e.$slots.container ? oe(e.$slots, "container", {
            key: 0,
            closeCallback: r.close,
            maximizeCallback: function(S) {
              return r.maximize(S);
            },
            initDragCallback: r.initDrag
          }) : (l(), u(Y, {
            key: 1
          }, [e.showHeader ? (l(), u("div", W({
            key: 0,
            ref: r.headerContainerRef,
            class: e.cx("header"),
            onMousedown: t[0] || (t[0] = function() {
              return r.initDrag && r.initDrag.apply(r, arguments);
            })
          }, e.ptm("header")), [oe(e.$slots, "header", {
            class: te(e.cx("title"))
          }, function() {
            return [e.header ? (l(), u("span", W({
              key: 0,
              id: r.ariaLabelledById,
              class: e.cx("title")
            }, e.ptm("title")), d(e.header), 17, pa)) : f("", !0)];
          }), a("div", W({
            class: e.cx("headerActions")
          }, e.ptm("headerActions")), [e.maximizable ? oe(e.$slots, "maximizebutton", {
            key: 0,
            maximized: i.maximized,
            maximizeCallback: function(S) {
              return r.maximize(S);
            }
          }, function() {
            return [y(p, W({
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
                return [oe(e.$slots, "maximizeicon", {
                  maximized: i.maximized
                }, function() {
                  return [(l(), ye(fn(r.maximizeIconComponent), W({
                    class: [k.class, i.maximized ? e.minimizeIcon : e.maximizeIcon]
                  }, e.ptm("pcMaximizeButton").icon), null, 16, ["class"]))];
                })];
              }),
              _: 3
            }, 16, ["autofocus", "class", "onClick", "tabindex", "unstyled", "pt"])];
          }) : f("", !0), e.closable ? oe(e.$slots, "closebutton", {
            key: 1,
            closeCallback: r.close
          }, function() {
            return [y(p, W({
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
                return [oe(e.$slots, "closeicon", {}, function() {
                  return [(l(), ye(fn(e.closeIcon ? "span" : "TimesIcon"), W({
                    class: [e.closeIcon, k.class]
                  }, e.ptm("pcCloseButton").icon), null, 16, ["class"]))];
                })];
              }),
              _: 3
            }, 16, ["autofocus", "class", "onClick", "aria-label", "unstyled", "pt"])];
          }) : f("", !0)], 16)], 16)) : f("", !0), a("div", W({
            ref: r.contentRef,
            class: [e.cx("content"), e.contentClass],
            style: e.contentStyle,
            "data-p": r.dataP
          }, $o($o({}, e.contentProps), e.ptm("content"))), [oe(e.$slots, "default")], 16, ma), e.footer || e.$slots.footer ? (l(), u("div", W({
            key: 1,
            ref: r.footerContainerRef,
            class: e.cx("footer")
          }, e.ptm("footer")), [oe(e.$slots, "footer", {}, function() {
            return [M(d(e.footer), 1)];
          })], 16)) : f("", !0)], 64))], 16, ca)), [[g, {
            disabled: !e.modal
          }]]) : f("", !0)];
        }),
        _: 3
      }, 16, ["onEnter", "onAfterEnter", "onBeforeLeave", "onLeave", "onAfterLeave"])], 16, da)) : f("", !0)];
    }),
    _: 3
  }, 8, ["appendTo"]);
}
Zo.render = fa;
var Yo = {
  name: "BlankIcon",
  extends: At
};
function ba(e) {
  return ya(e) || ga(e) || va(e) || ha();
}
function ha() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function va(e, t) {
  if (e) {
    if (typeof e == "string") return Gn(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Gn(e, t) : void 0;
  }
}
function ga(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function ya(e) {
  if (Array.isArray(e)) return Gn(e);
}
function Gn(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, s = Array(t); n < t; n++) s[n] = e[n];
  return s;
}
function ka(e, t, n, s, i, r) {
  return l(), u("svg", W({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), ba(t[0] || (t[0] = [a("rect", {
    width: "1",
    height: "1",
    fill: "currentColor",
    "fill-opacity": "0"
  }, null, -1)])), 16);
}
Yo.render = ka;
var Xo = {
  name: "CheckIcon",
  extends: At
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
    if (typeof e == "string") return Wn(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Wn(e, t) : void 0;
  }
}
function Ca(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function Ia(e) {
  if (Array.isArray(e)) return Wn(e);
}
function Wn(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, s = Array(t); n < t; n++) s[n] = e[n];
  return s;
}
function _a(e, t, n, s, i, r) {
  return l(), u("svg", W({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), wa(t[0] || (t[0] = [a("path", {
    d: "M4.86199 11.5948C4.78717 11.5923 4.71366 11.5745 4.64596 11.5426C4.57826 11.5107 4.51779 11.4652 4.46827 11.4091L0.753985 7.69483C0.683167 7.64891 0.623706 7.58751 0.580092 7.51525C0.536478 7.44299 0.509851 7.36177 0.502221 7.27771C0.49459 7.19366 0.506156 7.10897 0.536046 7.03004C0.565935 6.95111 0.613367 6.88 0.674759 6.82208C0.736151 6.76416 0.8099 6.72095 0.890436 6.69571C0.970973 6.67046 1.05619 6.66385 1.13966 6.67635C1.22313 6.68886 1.30266 6.72017 1.37226 6.76792C1.44186 6.81567 1.4997 6.8786 1.54141 6.95197L4.86199 10.2503L12.6397 2.49483C12.7444 2.42694 12.8689 2.39617 12.9932 2.40745C13.1174 2.41873 13.2343 2.47141 13.3251 2.55705C13.4159 2.64268 13.4753 2.75632 13.4938 2.87973C13.5123 3.00315 13.4888 3.1292 13.4271 3.23768L5.2557 11.4091C5.20618 11.4652 5.14571 11.5107 5.07801 11.5426C5.01031 11.5745 4.9368 11.5923 4.86199 11.5948Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
Xo.render = _a;
var Jo = {
  name: "ChevronDownIcon",
  extends: At
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
    if (typeof e == "string") return Zn(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Zn(e, t) : void 0;
  }
}
function za(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function Aa(e) {
  if (Array.isArray(e)) return Zn(e);
}
function Zn(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, s = Array(t); n < t; n++) s[n] = e[n];
  return s;
}
function Pa(e, t, n, s, i, r) {
  return l(), u("svg", W({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), xa(t[0] || (t[0] = [a("path", {
    d: "M7.01744 10.398C6.91269 10.3985 6.8089 10.378 6.71215 10.3379C6.61541 10.2977 6.52766 10.2386 6.45405 10.1641L1.13907 4.84913C1.03306 4.69404 0.985221 4.5065 1.00399 4.31958C1.02276 4.13266 1.10693 3.95838 1.24166 3.82747C1.37639 3.69655 1.55301 3.61742 1.74039 3.60402C1.92777 3.59062 2.11386 3.64382 2.26584 3.75424L7.01744 8.47394L11.769 3.75424C11.9189 3.65709 12.097 3.61306 12.2748 3.62921C12.4527 3.64535 12.6199 3.72073 12.7498 3.84328C12.8797 3.96582 12.9647 4.12842 12.9912 4.30502C13.0177 4.48162 12.9841 4.662 12.8958 4.81724L7.58083 10.1322C7.50996 10.2125 7.42344 10.2775 7.32656 10.3232C7.22968 10.3689 7.12449 10.3944 7.01744 10.398Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
Jo.render = Pa;
var Qo = {
  name: "SearchIcon",
  extends: At
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
    if (typeof e == "string") return Yn(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Yn(e, t) : void 0;
  }
}
function Fa(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function Va(e) {
  if (Array.isArray(e)) return Yn(e);
}
function Yn(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, s = Array(t); n < t; n++) s[n] = e[n];
  return s;
}
function Da(e, t, n, s, i, r) {
  return l(), u("svg", W({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), Ma(t[0] || (t[0] = [a("path", {
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
}, ja = ht.extend({
  name: "iconfield",
  style: Ba,
  classes: Ra
}), Ha = {
  name: "BaseIconField",
  extends: zt,
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
function Ua(e, t, n, s, i, r) {
  return l(), u("div", W({
    class: e.cx("root")
  }, e.ptmi("root")), [oe(e.$slots, "default")], 16);
}
ei.render = Ua;
var Na = {
  root: "p-inputicon"
}, Ka = ht.extend({
  name: "inputicon",
  classes: Na
}), qa = {
  name: "BaseInputIcon",
  extends: zt,
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
function Ga(e, t, n, s, i, r) {
  return l(), u("span", W({
    class: r.containerClass
  }, e.ptmi("root"), {
    "aria-hidden": "true"
  }), [oe(e.$slots, "default")], 16);
}
ti.render = Ga;
var Wa = {
  name: "BaseEditableHolder",
  extends: zt,
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
      return n.find(Lt);
    }
  },
  computed: {
    $filled: function() {
      return Lt(this.d_value);
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
}, Xa = ht.extend({
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
function $n(e) {
  "@babel/helpers - typeof";
  return $n = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, $n(e);
}
function Qa(e, t, n) {
  return (t = el(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function el(e) {
  var t = tl(e, "string");
  return $n(t) == "symbol" ? t : t + "";
}
function tl(e, t) {
  if ($n(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var s = n.call(e, t);
    if ($n(s) != "object") return s;
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
      return et(Qa({
        invalid: this.$invalid,
        fluid: this.$fluid,
        filled: this.$variant === "filled"
      }, this.size, this.size));
    }
  }
}, nl = ["value", "name", "disabled", "aria-invalid", "data-p"];
function ol(e, t, n, s, i, r) {
  return l(), u("input", W({
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
  }, r.attrs), null, 16, nl);
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
`, Co = ht.extend({
  name: "virtualscroller",
  css: sl,
  style: il
}), al = {
  name: "BaseVirtualScroller",
  extends: zt,
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
function Cn(e) {
  "@babel/helpers - typeof";
  return Cn = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, Cn(e);
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
function rn(e) {
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
  return Cn(t) == "symbol" ? t : t + "";
}
function rl(e, t) {
  if (Cn(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var s = n.call(e, t);
    if (Cn(s) != "object") return s;
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
      An(this.element) && (this.setContentEl(this.content), this.init(), this.calculateAutoSize(), this.defaultWidth = sn(this.element), this.defaultHeight = an(this.element), this.defaultContentWidth = sn(this.content), this.defaultContentHeight = an(this.content), this.initialized = !0), this.element && this.bindResizeListener();
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
        var h = this.first, g = this.element, k = g.scrollTop, S = k === void 0 ? 0 : k, x = g.scrollLeft, E = x === void 0 ? 0 : x, R = this.calculateNumItems(), T = R.numToleratedItems, N = this.getContentPosition(), A = this.itemSize, K = function() {
          var w = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0, O = arguments.length > 1 ? arguments[1] : void 0;
          return w <= O ? 0 : w;
        }, H = function(w, O, ae) {
          return w * O + ae;
        }, P = function() {
          var w = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0, O = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0;
          return n.scrollTo({
            left: w,
            top: O,
            behavior: s
          });
        }, B = i ? {
          rows: 0,
          cols: 0
        } : 0, c = !1, J = !1;
        i ? (B = {
          rows: K(t[0], T[0]),
          cols: K(t[1], T[1])
        }, P(H(B.cols, A[1], N.left), H(B.rows, A[0], N.top)), J = this.lastScrollPos.top !== S || this.lastScrollPos.left !== E, c = B.rows !== h.rows || B.cols !== h.cols) : (B = K(t, T), r ? P(H(B, A, N.left), S) : P(E, H(B, A, N.top)), J = this.lastScrollPos !== (r ? E : S), c = B !== h), this.isRangeChanged = c, J && (this.first = B);
      }
    },
    scrollInView: function(t, n) {
      var s = this, i = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : "auto";
      if (n) {
        var r = this.isBoth(), p = this.isHorizontal(), h = r ? t.every(function(A) {
          return A > -1;
        }) : t > -1;
        if (h) {
          var g = this.getRenderedRange(), k = g.first, S = g.viewport, x = function() {
            var K = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0, H = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0;
            return s.scrollTo({
              left: K,
              top: H,
              behavior: i
            });
          }, E = n === "to-start", R = n === "to-end";
          if (E) {
            if (r)
              S.first.rows - k.rows > t[0] ? x(S.first.cols * this.itemSize[1], (S.first.rows - 1) * this.itemSize[0]) : S.first.cols - k.cols > t[1] && x((S.first.cols - 1) * this.itemSize[1], S.first.rows * this.itemSize[0]);
            else if (S.first - k > t) {
              var T = (S.first - 1) * this.itemSize;
              p ? x(T, 0) : x(0, T);
            }
          } else if (R) {
            if (r)
              S.last.rows - k.rows <= t[0] + 1 ? x(S.first.cols * this.itemSize[1], (S.first.rows + 1) * this.itemSize[0]) : S.last.cols - k.cols <= t[1] + 1 && x((S.first.cols + 1) * this.itemSize[1], S.first.rows * this.itemSize[0]);
            else if (S.last - k <= t + 1) {
              var N = (S.first + 1) * this.itemSize;
              p ? x(N, 0) : x(0, N);
            }
          }
        }
      } else
        this.scrollToIndex(t, i);
    },
    getRenderedRange: function() {
      var t = function(x, E) {
        return Math.floor(x / (E || x));
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
      } : h(n ? r : p, s), S = this.d_numToleratedItems || (t ? [g(k.rows), g(k.cols)] : g(k));
      return {
        numItemsInViewport: k,
        numToleratedItems: S
      };
    },
    calculateOptions: function() {
      var t = this, n = this.isBoth(), s = this.first, i = this.calculateNumItems(), r = i.numItemsInViewport, p = i.numToleratedItems, h = function(S, x, E) {
        var R = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : !1;
        return t.getLast(S + x + (S < E ? 2 : 3) * E, R);
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
          var r = [sn(t.element), an(t.element)], p = r[0], h = r[1];
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
        var n = this.isBoth(), s = this.isHorizontal(), i = this.element.parentElement, r = this.scrollWidth || "".concat(this.element.offsetWidth || i.offsetWidth, "px"), p = this.scrollHeight || "".concat(this.element.offsetHeight || i.offsetHeight, "px"), h = function(k, S) {
          return t.element.style[k] = S;
        };
        n || s ? (h("height", p), h("width", r)) : h("height", p);
      }
    },
    setSpacerSize: function() {
      var t = this, n = this.items;
      if (n) {
        var s = this.isBoth(), i = this.isHorizontal(), r = this.getContentPosition(), p = function(g, k, S) {
          var x = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : 0;
          return t.spacerStyle = rn(rn({}, t.spacerStyle), ii({}, "".concat(g), (k || []).length * S + x + "px"));
        };
        s ? (p("height", n, this.itemSize[0], r.y), p("width", this.columns || n[1], this.itemSize[1], r.x)) : i ? p("width", this.columns || n, this.itemSize, r.x) : p("height", n, this.itemSize, r.y);
      }
    },
    setContentPosition: function(t) {
      var n = this;
      if (this.content && !this.appendOnly) {
        var s = this.isBoth(), i = this.isHorizontal(), r = t ? t.first : this.first, p = function(S, x) {
          return S * x;
        }, h = function() {
          var S = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0, x = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0;
          return n.contentStyle = rn(rn({}, n.contentStyle), {
            transform: "translate3d(".concat(S, "px, ").concat(x, "px, 0)")
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
      var n = this, s = t.target, i = this.isBoth(), r = this.isHorizontal(), p = this.getContentPosition(), h = function(v, I) {
        return v ? v > I ? v - I : v : 0;
      }, g = function(v, I) {
        return Math.floor(v / (I || v));
      }, k = function(v, I, z, F, Q, ee) {
        return v <= Q ? Q : ee ? z - F - Q : I + Q - 1;
      }, S = function(v, I, z, F, Q, ee, ne, ce) {
        if (v <= ee) return 0;
        var ze = Math.max(0, ne ? v < I ? z : v - ee : v > I ? z : v - 2 * ee), be = n.getLast(ze, ce);
        return ze > be ? be - Q : ze;
      }, x = function(v, I, z, F, Q, ee) {
        var ne = I + F + 2 * Q;
        return v >= Q && (ne += Q + 1), n.getLast(ne, ee);
      }, E = h(s.scrollTop, p.top), R = h(s.scrollLeft, p.left), T = i ? {
        rows: 0,
        cols: 0
      } : 0, N = this.last, A = !1, K = this.lastScrollPos;
      if (i) {
        var H = this.lastScrollPos.top <= E, P = this.lastScrollPos.left <= R;
        if (!this.appendOnly || this.appendOnly && (H || P)) {
          var B = {
            rows: g(E, this.itemSize[0]),
            cols: g(R, this.itemSize[1])
          }, c = {
            rows: k(B.rows, this.first.rows, this.last.rows, this.numItemsInViewport.rows, this.d_numToleratedItems[0], H),
            cols: k(B.cols, this.first.cols, this.last.cols, this.numItemsInViewport.cols, this.d_numToleratedItems[1], P)
          };
          T = {
            rows: S(B.rows, c.rows, this.first.rows, this.last.rows, this.numItemsInViewport.rows, this.d_numToleratedItems[0], H),
            cols: S(B.cols, c.cols, this.first.cols, this.last.cols, this.numItemsInViewport.cols, this.d_numToleratedItems[1], P, !0)
          }, N = {
            rows: x(B.rows, T.rows, this.last.rows, this.numItemsInViewport.rows, this.d_numToleratedItems[0]),
            cols: x(B.cols, T.cols, this.last.cols, this.numItemsInViewport.cols, this.d_numToleratedItems[1], !0)
          }, A = T.rows !== this.first.rows || N.rows !== this.last.rows || T.cols !== this.first.cols || N.cols !== this.last.cols || this.isRangeChanged, K = {
            top: E,
            left: R
          };
        }
      } else {
        var J = r ? R : E, m = this.lastScrollPos <= J;
        if (!this.appendOnly || this.appendOnly && m) {
          var w = g(J, this.itemSize), O = k(w, this.first, this.last, this.numItemsInViewport, this.d_numToleratedItems, m);
          T = S(w, O, this.first, this.last, this.numItemsInViewport, this.d_numToleratedItems, m), N = x(w, T, this.last, this.numItemsInViewport, this.d_numToleratedItems), A = T !== this.first || N !== this.last || this.isRangeChanged, K = J;
        }
      }
      return {
        first: T,
        last: N,
        isRangeChanged: A,
        scrollPos: K
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
          var g, k, S = {
            first: this.step ? Math.min(this.getPageByFirst(s) * this.step, (((g = this.items) === null || g === void 0 ? void 0 : g.length) || 0) - this.step) : s,
            last: Math.min(this.step ? (this.getPageByFirst(s) + 1) * this.step : i, ((k = this.items) === null || k === void 0 ? void 0 : k.length) || 0)
          }, x = this.lazyLoadState.first !== S.first || this.lazyLoadState.last !== S.last;
          x && this.$emit("lazy-load", S), this.lazyLoadState = S;
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
        if (An(t.element)) {
          var n = t.isBoth(), s = t.isVertical(), i = t.isHorizontal(), r = [sn(t.element), an(t.element)], p = r[0], h = r[1], g = p !== t.defaultWidth, k = h !== t.defaultHeight, S = n ? g || k : i ? g : s ? k : !1;
          S && (t.d_numToleratedItems = t.numToleratedItems, t.defaultWidth = p, t.defaultHeight = h, t.defaultContentWidth = sn(t.content), t.defaultContentHeight = an(t.content), t.init());
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
      return rn({
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
    SpinnerIcon: Vn
  }
}, ul = ["tabindex"];
function dl(e, t, n, s, i, r) {
  var p = xe("SpinnerIcon");
  return e.disabled ? (l(), u(Y, {
    key: 1
  }, [oe(e.$slots, "default"), oe(e.$slots, "content", {
    items: e.items,
    rows: e.items,
    columns: r.loadedColumns
  })], 64)) : (l(), u("div", W({
    key: 0,
    ref: r.elementRef,
    class: r.containerClass,
    tabindex: e.tabindex,
    style: e.style,
    onScroll: t[0] || (t[0] = function() {
      return r.onScroll && r.onScroll.apply(r, arguments);
    })
  }, e.ptmi("root")), [oe(e.$slots, "content", {
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
    return [a("div", W({
      ref: r.contentRef,
      class: r.contentClass,
      style: i.contentStyle
    }, e.ptm("content")), [(l(!0), u(Y, null, ie(r.loadedItems, function(h, g) {
      return oe(e.$slots, "item", {
        key: g,
        item: h,
        options: r.getOptions(g)
      });
    }), 128))], 16)];
  }), e.showSpacer ? (l(), u("div", W({
    key: 0,
    class: "p-virtualscroller-spacer",
    style: i.spacerStyle
  }, e.ptm("spacer")), null, 16)) : f("", !0), !e.loaderDisabled && e.showLoader && i.d_loading ? (l(), u("div", W({
    key: 1,
    class: r.loaderClass
  }, e.ptm("loader")), [e.$slots && e.$slots.loader ? (l(!0), u(Y, {
    key: 0
  }, ie(i.loaderArr, function(h, g) {
    return oe(e.$slots, "loader", {
      key: g,
      options: r.getLoaderOptions(g, r.isBoth() && {
        numCols: e.d_numItemsInViewport.cols
      })
    });
  }), 128)) : f("", !0), oe(e.$slots, "loadingicon", {}, function() {
    return [y(p, W({
      spin: "",
      class: "p-virtualscroller-loading-icon"
    }, e.ptm("loadingIcon")), null, 16)];
  })], 16)) : f("", !0)], 16, ul));
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
}, ml = ht.extend({
  name: "select",
  style: cl,
  classes: pl
}), fl = {
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
  style: ml,
  provide: function() {
    return {
      $pcSelect: this,
      $parentInstance: this
    };
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
function bl(e) {
  return yl(e) || gl(e) || vl(e) || hl();
}
function hl() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function vl(e, t) {
  if (e) {
    if (typeof e == "string") return Xn(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Xn(e, t) : void 0;
  }
}
function gl(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function yl(e) {
  if (Array.isArray(e)) return Xn(e);
}
function Xn(e, t) {
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
      Ut(e, s, n[s]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : _o(Object(n)).forEach(function(s) {
      Object.defineProperty(e, s, Object.getOwnPropertyDescriptor(n, s));
    });
  }
  return e;
}
function Ut(e, t, n) {
  return (t = kl(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function kl(e) {
  var t = wl(e, "string");
  return In(t) == "symbol" ? t : t + "";
}
function wl(e, t) {
  if (In(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var s = n.call(e, t);
    if (In(s) != "object") return s;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var zn = {
  name: "Select",
  extends: fl,
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
    this.unbindOutsideClickListener(), this.unbindResizeListener(), this.unbindLabelClickListener(), this.unbindMatchMediaOrientationListener(), this.scrollHandler && (this.scrollHandler.destroy(), this.scrollHandler = null), this.overlay && (Jt.clear(this.overlay), this.overlay = null);
  },
  methods: {
    getOptionIndex: function(t, n) {
      return this.virtualScrollerDisabled ? t : n && n(t).index;
    },
    getOptionLabel: function(t) {
      return this.optionLabel ? Yt(t, this.optionLabel) : t;
    },
    getOptionValue: function(t) {
      return this.optionValue ? Yt(t, this.optionValue) : t;
    },
    getOptionRenderKey: function(t, n) {
      return (this.dataKey ? Yt(t, this.dataKey) : this.getOptionLabel(t)) + "_" + n;
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
      return this.optionDisabled ? Yt(t, this.optionDisabled) : !1;
    },
    isOptionGroup: function(t) {
      return this.optionGroupLabel && t.optionGroup && t.group;
    },
    getOptionGroupLabel: function(t) {
      return Yt(t, this.optionGroupLabel);
    },
    getOptionGroupChildren: function(t) {
      return Yt(t, this.optionGroupChildren);
    },
    getAriaPosInset: function(t) {
      var n = this;
      return (this.optionGroupLabel ? t - this.visibleOptions.slice(0, t).filter(function(s) {
        return n.isOptionGroup(s);
      }).length : t) + 1;
    },
    show: function(t) {
      this.$emit("before-show"), this.overlayVisible = !0, this.focusedOptionIndex = this.focusedOptionIndex !== -1 ? this.focusedOptionIndex : this.autoOptionFocus ? this.findFirstFocusedOptionIndex() : this.editable ? -1 : this.findSelectedOptionIndex(), t && Oe(this.$refs.focusInput);
    },
    hide: function(t) {
      var n = this, s = function() {
        n.$emit("before-hide"), n.overlayVisible = !1, n.clicked = !1, n.focusedOptionIndex = -1, n.searchValue = "", n.resetFilterOnHide && (n.filterValue = null), t && Oe(n.$refs.focusInput);
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
            n.$refs.filterInput && Oe(n.$refs.filterInput.$el);
          }));
          break;
      }
      this.clicked = !1;
    },
    onEditableInput: function(t) {
      var n = t.target.value;
      this.searchValue = "";
      var s = this.searchOptions(t, n);
      !s && (this.focusedOptionIndex = -1), this.updateModel(t, n), !this.overlayVisible && Lt(n) && this.show();
    },
    onContainerClick: function(t) {
      this.disabled || this.loading || t.target.tagName === "INPUT" || t.target.getAttribute("data-pc-section") === "clearicon" || t.target.closest('[data-pc-section="clearicon"]') || ((!this.overlay || !this.overlay.contains(t.target)) && (this.overlayVisible ? this.hide(!0) : this.show(!0)), this.clicked = !0);
    },
    onClearClick: function(t) {
      this.updateModel(t, null), this.resetFilterOnClear && (this.filterValue = null);
    },
    onFirstHiddenFocus: function(t) {
      var n = t.relatedTarget === this.$refs.focusInput ? Xt(this.overlay, ':not([data-p-hidden-focusable="true"])') : this.$refs.focusInput;
      Oe(n);
    },
    onLastHiddenFocus: function(t) {
      var n = t.relatedTarget === this.$refs.focusInput ? Eo(this.overlay, ':not([data-p-hidden-focusable="true"])') : this.$refs.focusInput;
      Oe(n);
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
      n || (this.overlayVisible && this.hasFocusableElements() ? (Oe(this.$refs.firstHiddenFocusableElementOnOverlay), t.preventDefault()) : (this.focusedOptionIndex !== -1 && this.onOptionSelect(t, this.visibleOptions[this.focusedOptionIndex]), this.overlayVisible && this.hide(this.filter)));
    },
    onBackspaceKey: function(t) {
      var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1;
      n && !this.overlayVisible && this.show();
    },
    onOverlayEnter: function(t) {
      var n = this;
      Jt.set("overlay", t, this.$primevue.config.zIndex.overlay), Do(t, {
        position: "absolute",
        top: "0"
      }), this.alignOverlay(), this.scrollInView(), this.$attrSelector && t.setAttribute(this.$attrSelector, ""), setTimeout(function() {
        n.autoFilterFocus && n.filter && Oe(n.$refs.filterInput.$el), n.autoUpdateModel();
      }, 1);
    },
    onOverlayAfterEnter: function() {
      this.bindOutsideClickListener(), this.bindScrollListener(), this.bindResizeListener(), this.$emit("show");
    },
    onOverlayLeave: function(t) {
      var n = this;
      t.style.pointerEvents = "none", this.unbindOutsideClickListener(), this.unbindScrollListener(), this.unbindResizeListener(), this.autoFilterFocus && this.filter && !this.editable && this.$nextTick(function() {
        n.$refs.filterInput && Oe(n.$refs.filterInput.$el);
      }), this.$emit("hide"), this.overlay = null;
    },
    onOverlayAfterLeave: function(t) {
      Jt.clear(t);
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
        n && An(n) && (this.labelClickListener = function() {
          Oe(t.$refs.focusInput);
        }, n.addEventListener("click", this.labelClickListener));
      }
    },
    unbindLabelClickListener: function() {
      if (this.labelClickListener) {
        var t = document.querySelector('label[for="'.concat(this.labelId, '"]'));
        t && An(t) && t.removeEventListener("click", this.labelClickListener);
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
      return Lt(t) && !(this.isOptionDisabled(t) || this.isOptionGroup(t));
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
      var i = -1, r = !1;
      return Lt(this.searchValue) && (i = this.visibleOptions.findIndex(function(p) {
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
        var s = vi.filter(n, this.searchFields, this.filterValue, this.filterMatchMode, this.filterLocale);
        if (this.optionGroupLabel) {
          var i = this.options || [], r = [];
          return i.forEach(function(p) {
            var h = t.getOptionGroupChildren(p), g = h.filter(function(k) {
              return s.includes(k);
            });
            g.length > 0 && r.push(xo(xo({}, p), {}, Ut({}, typeof t.optionGroupChildren == "string" ? t.optionGroupChildren : "items", bl(g))));
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
      return Lt(this.visibleOptions) ? this.filterMessageText.replaceAll("{0}", this.visibleOptions.length) : this.emptyFilterMessageText;
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
      return et(Ut({
        invalid: this.$invalid,
        disabled: this.disabled,
        focus: this.focused,
        fluid: this.$fluid,
        filled: this.$variant === "filled"
      }, this.size, this.size));
    },
    labelDataP: function() {
      return et(Ut(Ut({
        placeholder: !this.editable && this.label === this.placeholder,
        clearable: this.showClear,
        disabled: this.disabled,
        editable: this.editable
      }, this.size, this.size), "empty", !this.editable && !this.$slots.value && (this.label === "p-emptylabel" || this.label.length === 0)));
    },
    dropdownIconDataP: function() {
      return et(Ut({}, this.size, this.size));
    },
    overlayDataP: function() {
      return et(Ut({}, "portal-" + this.appendTo, "portal-" + this.appendTo));
    }
  },
  directives: {
    ripple: no
  },
  components: {
    InputText: oi,
    VirtualScroller: si,
    Portal: Fo,
    InputIcon: ti,
    IconField: ei,
    TimesIcon: lo,
    ChevronDownIcon: Jo,
    SpinnerIcon: Vn,
    SearchIcon: Qo,
    CheckIcon: Xo,
    BlankIcon: Yo
  }
}, Sl = ["id", "data-p"], $l = ["name", "id", "value", "placeholder", "tabindex", "disabled", "aria-label", "aria-labelledby", "aria-expanded", "aria-controls", "aria-activedescendant", "aria-invalid", "data-p"], Cl = ["name", "id", "tabindex", "aria-label", "aria-labelledby", "aria-expanded", "aria-controls", "aria-activedescendant", "aria-invalid", "aria-disabled", "data-p"], Il = ["data-p"], _l = ["id"], xl = ["id"], Ol = ["id", "aria-label", "aria-selected", "aria-disabled", "aria-setsize", "aria-posinset", "onMousedown", "onMousemove", "data-p-selected", "data-p-focused", "data-p-disabled"];
function Ll(e, t, n, s, i, r) {
  var p = xe("SpinnerIcon"), h = xe("InputText"), g = xe("SearchIcon"), k = xe("InputIcon"), S = xe("IconField"), x = xe("CheckIcon"), E = xe("BlankIcon"), R = xe("VirtualScroller"), T = xe("Portal"), N = oo("ripple");
  return l(), u("div", W({
    ref: "container",
    id: e.$id,
    class: e.cx("root"),
    onClick: t[12] || (t[12] = function() {
      return r.onContainerClick && r.onContainerClick.apply(r, arguments);
    }),
    "data-p": r.containerDataP
  }, e.ptmi("root")), [e.editable ? (l(), u("input", W({
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
  }, e.ptm("label")), null, 16, $l)) : (l(), u("span", W({
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
  }, e.ptm("label")), [oe(e.$slots, "value", {
    value: e.d_value,
    placeholder: e.placeholder
  }, function() {
    var A;
    return [M(d(r.label === "p-emptylabel" ? " " : (A = r.label) !== null && A !== void 0 ? A : "empty"), 1)];
  })], 16, Cl)), r.isClearIconVisible ? oe(e.$slots, "clearicon", {
    key: 2,
    class: te(e.cx("clearIcon")),
    clearCallback: r.onClearClick
  }, function() {
    return [(l(), ye(fn(e.clearIcon ? "i" : "TimesIcon"), W({
      ref: "clearIcon",
      class: [e.cx("clearIcon"), e.clearIcon],
      onClick: r.onClearClick
    }, e.ptm("clearIcon"), {
      "data-pc-section": "clearicon"
    }), null, 16, ["class", "onClick"]))];
  }) : f("", !0), a("div", W({
    class: e.cx("dropdown")
  }, e.ptm("dropdown")), [e.loading ? oe(e.$slots, "loadingicon", {
    key: 0,
    class: te(e.cx("loadingIcon"))
  }, function() {
    return [e.loadingIcon ? (l(), u("span", W({
      key: 0,
      class: [e.cx("loadingIcon"), "pi-spin", e.loadingIcon],
      "aria-hidden": "true"
    }, e.ptm("loadingIcon")), null, 16)) : (l(), ye(p, W({
      key: 1,
      class: e.cx("loadingIcon"),
      spin: "",
      "aria-hidden": "true"
    }, e.ptm("loadingIcon")), null, 16, ["class"]))];
  }) : oe(e.$slots, "dropdownicon", {
    key: 1,
    class: te(e.cx("dropdownIcon"))
  }, function() {
    return [(l(), ye(fn(e.dropdownIcon ? "span" : "ChevronDownIcon"), W({
      class: [e.cx("dropdownIcon"), e.dropdownIcon],
      "aria-hidden": "true",
      "data-p": r.dropdownIconDataP
    }, e.ptm("dropdownIcon")), null, 16, ["class", "data-p"]))];
  })], 16), y(T, {
    appendTo: e.appendTo
  }, {
    default: he(function() {
      return [y(Ho, W({
        name: "p-anchored-overlay",
        onEnter: r.onOverlayEnter,
        onAfterEnter: r.onOverlayAfterEnter,
        onLeave: r.onOverlayLeave,
        onAfterLeave: r.onOverlayAfterLeave
      }, e.ptm("transition")), {
        default: he(function() {
          return [i.overlayVisible ? (l(), u("div", W({
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
          }, e.ptm("overlay")), [a("span", W({
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
          }), null, 16), oe(e.$slots, "header", {
            value: e.d_value,
            options: r.visibleOptions
          }), e.filter ? (l(), u("div", W({
            key: 0,
            class: e.cx("header")
          }, e.ptm("header")), [y(S, {
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
                class: te(e.cx("pcFilter")),
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
                  return [oe(e.$slots, "filtericon", {}, function() {
                    return [e.filterIcon ? (l(), u("span", W({
                      key: 0,
                      class: e.filterIcon
                    }, e.ptm("filterIcon")), null, 16)) : (l(), ye(g, ji(W({
                      key: 1
                    }, e.ptm("filterIcon"))), null, 16))];
                  })];
                }),
                _: 3
              }, 8, ["unstyled", "pt"])];
            }),
            _: 3
          }, 8, ["unstyled", "pt"]), a("span", W({
            role: "status",
            "aria-live": "polite",
            class: "p-hidden-accessible"
          }, e.ptm("hiddenFilterResult"), {
            "data-p-hidden-accessible": !0
          }), d(r.filterResultMessageText), 17)], 16)) : f("", !0), a("div", W({
            class: e.cx("listContainer"),
            style: {
              "max-height": r.virtualScrollerDisabled ? e.scrollHeight : ""
            }
          }, e.ptm("listContainer")), [y(R, W({
            ref: r.virtualScrollerRef
          }, e.virtualScrollerOptions, {
            items: r.visibleOptions,
            style: {
              height: e.scrollHeight
            },
            tabindex: -1,
            disabled: r.virtualScrollerDisabled,
            pt: e.ptm("virtualScroller")
          }), Hi({
            content: he(function(A) {
              var K = A.styleClass, H = A.contentRef, P = A.items, B = A.getItemOptions, c = A.contentStyle, J = A.itemSize;
              return [a("ul", W({
                ref: function(w) {
                  return r.listRef(w, H);
                },
                id: e.$id + "_list",
                class: [e.cx("list"), K],
                style: c,
                role: "listbox"
              }, e.ptm("list")), [(l(!0), u(Y, null, ie(P, function(m, w) {
                return l(), u(Y, {
                  key: r.getOptionRenderKey(m, r.getOptionIndex(w, B))
                }, [r.isOptionGroup(m) ? (l(), u("li", W({
                  key: 0,
                  id: e.$id + "_" + r.getOptionIndex(w, B),
                  style: {
                    height: J ? J + "px" : void 0
                  },
                  class: e.cx("optionGroup"),
                  role: "option"
                }, {
                  ref_for: !0
                }, e.ptm("optionGroup")), [oe(e.$slots, "optiongroup", {
                  option: m.optionGroup,
                  index: r.getOptionIndex(w, B)
                }, function() {
                  return [a("span", W({
                    class: e.cx("optionGroupLabel")
                  }, {
                    ref_for: !0
                  }, e.ptm("optionGroupLabel")), d(r.getOptionGroupLabel(m.optionGroup)), 17)];
                })], 16, xl)) : Ve((l(), u("li", W({
                  key: 1,
                  id: e.$id + "_" + r.getOptionIndex(w, B),
                  class: e.cx("option", {
                    option: m,
                    focusedOption: r.getOptionIndex(w, B)
                  }),
                  style: {
                    height: J ? J + "px" : void 0
                  },
                  role: "option",
                  "aria-label": r.getOptionLabel(m),
                  "aria-selected": r.isSelected(m),
                  "aria-disabled": r.isOptionDisabled(m),
                  "aria-setsize": r.ariaSetSize,
                  "aria-posinset": r.getAriaPosInset(r.getOptionIndex(w, B)),
                  onMousedown: function(ae) {
                    return r.onOptionSelect(ae, m);
                  },
                  onMousemove: function(ae) {
                    return r.onOptionMouseMove(ae, r.getOptionIndex(w, B));
                  },
                  onClick: t[8] || (t[8] = On(function() {
                  }, ["stop"])),
                  "data-p-selected": !e.checkmark && r.isSelected(m),
                  "data-p-focused": i.focusedOptionIndex === r.getOptionIndex(w, B),
                  "data-p-disabled": r.isOptionDisabled(m)
                }, {
                  ref_for: !0
                }, r.getPTItemOptions(m, B, w, "option")), [e.checkmark ? (l(), u(Y, {
                  key: 0
                }, [r.isSelected(m) ? (l(), ye(x, W({
                  key: 0,
                  class: e.cx("optionCheckIcon")
                }, {
                  ref_for: !0
                }, e.ptm("optionCheckIcon")), null, 16, ["class"])) : (l(), ye(E, W({
                  key: 1,
                  class: e.cx("optionBlankIcon")
                }, {
                  ref_for: !0
                }, e.ptm("optionBlankIcon")), null, 16, ["class"]))], 64)) : f("", !0), oe(e.$slots, "option", {
                  option: m,
                  selected: r.isSelected(m),
                  index: r.getOptionIndex(w, B)
                }, function() {
                  return [a("span", W({
                    class: e.cx("optionLabel")
                  }, {
                    ref_for: !0
                  }, e.ptm("optionLabel")), d(r.getOptionLabel(m)), 17)];
                })], 16, Ol)), [[N]])], 64);
              }), 128)), i.filterValue && (!P || P && P.length === 0) ? (l(), u("li", W({
                key: 0,
                class: e.cx("emptyMessage"),
                role: "option"
              }, e.ptm("emptyMessage"), {
                "data-p-hidden-accessible": !0
              }), [oe(e.$slots, "emptyfilter", {}, function() {
                return [M(d(r.emptyFilterMessageText), 1)];
              })], 16)) : !e.options || e.options && e.options.length === 0 ? (l(), u("li", W({
                key: 1,
                class: e.cx("emptyMessage"),
                role: "option"
              }, e.ptm("emptyMessage"), {
                "data-p-hidden-accessible": !0
              }), [oe(e.$slots, "empty", {}, function() {
                return [M(d(r.emptyMessageText), 1)];
              })], 16)) : f("", !0)], 16, _l)];
            }),
            _: 2
          }, [e.$slots.loader ? {
            name: "loader",
            fn: he(function(A) {
              var K = A.options;
              return [oe(e.$slots, "loader", {
                options: K
              })];
            }),
            key: "0"
          } : void 0]), 1040, ["items", "style", "disabled", "pt"])], 16), oe(e.$slots, "footer", {
            value: e.d_value,
            options: r.visibleOptions
          }), !e.options || e.options && e.options.length === 0 ? (l(), u("span", W({
            key: 1,
            role: "status",
            "aria-live": "polite",
            class: "p-hidden-accessible"
          }, e.ptm("hiddenEmptyMessage"), {
            "data-p-hidden-accessible": !0
          }), d(r.emptyMessageText), 17)) : f("", !0), a("span", W({
            role: "status",
            "aria-live": "polite",
            class: "p-hidden-accessible"
          }, e.ptm("hiddenSelectedMessage"), {
            "data-p-hidden-accessible": !0
          }), d(r.selectedMessageText), 17), a("span", W({
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
          }), null, 16)], 16, Il)) : f("", !0)];
        }),
        _: 3
      }, 16, ["onEnter", "onAfterEnter", "onLeave", "onAfterLeave"])];
    }),
    _: 3
  }, 8, ["appendTo"])], 16, Sl);
}
zn.render = Ll;
const zl = 2e3;
function Oo(e) {
  const t = e.margin ?? 8, n = e.gap ?? 4, s = Math.max(0, e.viewportWidth), i = Math.max(0, e.viewportHeight), r = Math.max(0, s - t * 2), p = Math.min(Math.max(0, e.requestedWidth), r), h = e.align === "right" ? e.anchor.right - p : e.anchor.left, g = Math.max(t, Math.min(h, s - t - p)), k = Math.max(0, i - e.anchor.bottom - n - t), S = Math.max(0, e.anchor.top - n - t), x = k < e.requestedMaxHeight && S > k ? "above" : "below", E = x === "above" ? S : k, R = Math.round(Math.min(Math.max(0, e.requestedMaxHeight), E)), T = Math.min(Math.max(0, e.panelHeight ?? R), R), N = x === "above" ? e.anchor.top - n - T : e.anchor.bottom + n, A = e.containingBlockOrigin ?? { left: 0, top: 0 };
  return {
    left: Math.round(g - A.left),
    width: Math.round(p),
    maxHeight: R,
    side: x,
    top: Math.round(N - A.top)
  };
}
const ai = /* @__PURE__ */ tn({
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
    const n = e, s = t, i = j(null), r = j({ position: "fixed", visibility: "hidden" });
    function p() {
      const N = n.anchor, A = i.value;
      if (!N || !A) return;
      const K = N.getBoundingClientRect(), H = n.width === "anchor" ? Math.max(n.minWidth, K.width) : Math.max(n.minWidth, n.width), P = {
        anchor: K,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
        requestedWidth: H,
        requestedMaxHeight: n.maxHeight,
        align: n.align,
        gap: n.gap
      }, B = Oo(P);
      Object.assign(A.style, {
        position: "fixed",
        left: "0px",
        top: "0px",
        right: "auto",
        bottom: "auto",
        width: `${B.width}px`,
        maxHeight: `${B.maxHeight}px`,
        visibility: "hidden"
      });
      const c = A.getBoundingClientRect(), J = Oo({
        ...P,
        containingBlockOrigin: { left: c.left, top: c.top },
        panelHeight: c.height
      }), m = {
        position: "fixed",
        left: `${J.left}px`,
        top: `${J.top}px`,
        width: `${J.width}px`,
        maxHeight: `${J.maxHeight}px`,
        "--anchored-panel-available-height": `${J.maxHeight}px`,
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
    function S() {
      typeof ResizeObserver > "u" || (h = new ResizeObserver(k), i.value && h.observe(i.value), n.anchor && h.observe(n.anchor));
    }
    function x() {
      h?.disconnect(), h = null, g = !1;
    }
    Ue(() => n.open, async (N) => {
      x(), N && (r.value = { position: "fixed", visibility: "hidden" }, await bn(), p(), S());
    }, { immediate: !0 });
    function E(N) {
      if (!n.open) return;
      const A = N.composedPath();
      i.value && A.includes(i.value) || n.anchor && A.includes(n.anchor) || s("update:open", !1);
    }
    function R(N) {
      n.open && N.key === "Escape" && s("update:open", !1);
    }
    function T() {
      n.open && p();
    }
    return document.addEventListener("click", E), document.addEventListener("keydown", R), window.addEventListener("resize", T), window.addEventListener("scroll", T, !0), Uo(() => {
      x(), document.removeEventListener("click", E), document.removeEventListener("keydown", R), window.removeEventListener("resize", T), window.removeEventListener("scroll", T, !0);
    }), (N, A) => e.open ? (l(), u("div", {
      key: 0,
      ref_key: "panel",
      ref: i,
      class: "anchored-panel",
      style: Kt(r.value)
    }, [
      oe(N.$slots, "default")
    ], 4)) : f("", !0);
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
function Fn(e, t) {
  const n = Al(e);
  if (n === null) return "";
  const s = t?.now ?? Date.now(), i = t?.suffix ?? !0, r = t?.maxUnit ?? "day", p = t?.future ?? !1, h = 6e4, g = 60 * h, k = 24 * g, S = 30 * k, x = 365 * k, E = s - n;
  if (p && E < 0) {
    const N = -E;
    return N < h ? "in <1m" : N < g ? `in ${Math.floor(N / h)}m` : N < k ? `in ${Math.floor(N / g)}h` : `in ${Math.floor(N / k)}d`;
  }
  const R = Math.max(0, E);
  if (R < h) return "just now";
  const T = i ? " ago" : "";
  return R < g ? `${Math.floor(R / h)}m${T}` : R < k ? `${Math.floor(R / g)}h${T}` : r === "year" ? R < S ? `${Math.floor(R / k)}d${T}` : R < x ? `${Math.floor(R / S)}mo${T}` : `${Math.floor(R / x)}y${T}` : `${Math.floor(R / k)}d${T}`;
}
const Jn = {
  tool: { label: "Tools", icon: "tabler:tool" },
  "agent.trait": { label: "Agent capabilities", icon: "tabler:robot" },
  "contract.binding": { label: "Contract bindings", icon: "tabler:plug-connected" },
  "contract.definition": { label: "Contracts", icon: "tabler:file-description" },
  "view.page": { label: "Pages", icon: "tabler:browser" },
  "view.component": { label: "Components", icon: "tabler:components" }
};
function Pl(e) {
  const t = e.meta?.type || "";
  return t && Jn[t] ? t : e.kind;
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
function tt(e, t) {
  const n = t instanceof Error ? t.message : String(t);
  console.error(`[${e}]`, n, t);
}
function Qn() {
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
function Lo(e) {
  const t = e.migrations || [];
  if (t.length === 0) return "";
  const n = t.filter((r) => r.status === "applied").length, s = t.filter((r) => r.status === "pending").length, i = [];
  return n > 0 && i.push(`${n} applied`), s > 0 && i.push(`${s} pending`), i.join(", ") || `${t.length} migrations`;
}
function Vl({ hub: e, installed: t, catalog: n, installedDepFor: s, installedCanUpdate: i, installedUpdateDisabledReason: r, installedCanUninstall: p, installedIsPrivate: h }) {
  const g = j(null), k = j(null), S = j(""), x = j([]), E = j(!1), R = j("readme"), T = j([]), N = q(() => x.value.filter((z) => z.kind === "env.variable")), A = q(() => x.value.filter((z) => z.kind === "ns.requirement")), K = q(() => {
    const z = {};
    for (const F of x.value) {
      if (F.kind === "env.variable" || F.kind === "ns.requirement") continue;
      const Q = Pl(F);
      (z[Q] ||= []).push(F);
    }
    return Object.entries(z).map(([F, Q]) => ({
      key: F,
      label: Jn[F]?.label || F,
      icon: Jn[F]?.icon || "tabler:point",
      items: Q
    })).sort((F, Q) => Q.items.length - F.items.length);
  }), H = q(() => T.value.find((z) => z.version === g.value?.version) || T.value[0]), P = q(() => g.value ? s(g.value.component) : void 0), B = q(() => !!(P.value && i(P.value))), c = q(() => P.value && !i(P.value) ? r(P.value) : ""), J = q(() => !!(P.value && p(P.value))), m = q(() => cn(k.value) || !!(P.value && h(P.value)));
  async function w(z) {
    try {
      const F = t.value.find((ne) => ne.component === z);
      return F?.entries ? F.entries : ((await e.listDependencies({ component: z, includeMigrations: !1 })).dependencies || []).find((ne) => ne.component === z)?.entries || [];
    } catch (F) {
      return tt("modules:entries", F), [];
    }
  }
  async function O(z, F) {
    if (F && F.full_name) return F;
    const Q = n.value.find((ee) => Mn(ee, z));
    if (Q) return Q;
    try {
      const ee = z.split("/").pop() || z, ce = ((await e.browseModules({ query: ee, pageSize: 50 })).items || []).find((ze) => Mn(ze, z));
      if (ce) return ce;
    } catch {
    }
    return { full_name: z, component: z, latest_version: "", type: "library" };
  }
  async function ae(z) {
    const F = "component" in z && typeof z.component == "string" && !("full_name" in z) ? z.component : Pn(z), Q = s(F), ee = "full_name" in z ? z : void 0;
    g.value = {
      component: F,
      label: ee ? Qt(ee) : F,
      description: ee?.description || "",
      version: Q ? bt(Q) : String(ee?.latest_version || ""),
      installed: !!Q,
      installedId: Q?.id
    }, k.value = ee || null, S.value = "", x.value = [], T.value = [], R.value = "readme", E.value = !0;
    try {
      const [ne, ce, ze, be] = await Promise.all([
        O(F, ee),
        e.getReadme(F).then((Ne) => Ne.content || "").catch(() => ""),
        Q ? w(F) : Promise.resolve([]),
        e.listVersions(F).then((Ne) => Ne.items || []).catch(() => [])
      ]);
      k.value = ne, S.value = ce, x.value = ze, T.value = be, g.value && (g.value = {
        ...g.value,
        label: Qt(ne),
        description: ne.description || g.value.description,
        version: Q ? bt(Q) : String(ne.latest_version || g.value.version)
      }), ce || (R.value = "overview");
    } finally {
      E.value = !1;
    }
  }
  function v() {
    g.value = null;
  }
  async function I() {
    if (!g.value) return;
    const z = g.value.component, F = s(z);
    g.value = {
      ...g.value,
      installed: !!F,
      installedId: F?.id,
      version: F ? bt(F) : g.value.version
    }, x.value = F ? await w(z) : [];
  }
  return {
    selected: g,
    selectedModule: k,
    detailReadme: S,
    detailEntries: x,
    detailLoading: E,
    detailTab: R,
    detailVersions: T,
    envVars: N,
    requirements: A,
    detailGroups: K,
    versionMeta: H,
    selectedInstalledDep: P,
    selectedCanUpdate: B,
    selectedUpdateDisabledReason: c,
    selectedCanUninstall: J,
    selectedIsPrivate: m,
    loadEntriesFor: w,
    findModule: O,
    openDetail: ae,
    closeDetail: v,
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
  function r() {
    i && (clearInterval(i), i = null);
  }
  Ue(e, (g) => {
    r(), g ? (s = Date.now(), n.value = 0, i = setInterval(() => {
      n.value = Date.now() - s;
    }, 200)) : n.value = 0;
  }), io(r);
  const p = q(() => t.find((g) => n.value < g.until)?.label || t[t.length - 1].label), h = q(() => Math.floor(n.value / 1e3));
  return { phase: p, elapsedSec: h };
}
function Rl({ hub: e, selected: t, selectedInstalledDep: n, installedIsRoot: s, installedUninstallDisabledReason: i, installedCanUninstall: r, refreshAll: p, refreshSelectedDetail: h, showToast: g, notifyModulesChanged: k }) {
  const S = j(!1), x = j(null), E = j("block"), R = j(!1), T = j(!1), N = j(null), A = j([]), K = j(null), H = j(null), P = j([]), { phase: B, elapsedSec: c } = Bl(R, Dl), J = q(() => {
    const I = n.value;
    return !t.value?.installed || !I || s(I) ? "" : i(I);
  }), m = q(() => x.value ? R.value ? "Uninstall is running." : T.value ? "Waiting for uninstall preview to finish." : P.value.length > 0 ? `Still required by: ${P.value.join(", ")}. Uninstall those root modules first.` : K.value === "MIGRATIONS_APPLIED" ? 'Applied migrations exist. Choose "Leave applied migrations" or "Revert (down)", then preview again.' : H.value && !N.value ? H.value : N.value ? "" : "Run Preview first so Keeper can show what will be removed." : ""), w = q(() => x.value ? R.value ? "Uninstall is running." : T.value ? "Waiting for uninstall preview to finish." : P.value.length > 0 ? `Still required by: ${P.value.join(", ")}. Uninstall those root modules first.` : K.value === "MIGRATIONS_APPLIED" ? 'Applied migrations exist. Choose "Leave applied migrations" or "Revert (down)", then preview again.' : "" : "No module selected.");
  async function O(I) {
    r(I) && (x.value = I, E.value = "block", K.value = null, H.value = null, P.value = [], N.value = null, A.value = [], S.value = !0, ae());
  }
  async function ae() {
    const I = x.value;
    if (I) {
      T.value = !0, K.value = null, H.value = null, P.value = [], N.value = null, A.value = [];
      try {
        const z = await e.uninstall({ id: I.id, component: I.component, dry_run: !0, migration_policy: E.value });
        N.value = z.preview || z.payload?.preview || null, N.value || (H.value = "Uninstall preview returned no preview data.");
      } catch (z) {
        if (tt("modules:uninstall-preview", z), z instanceof Nt && (K.value = z.code, P.value = po(z.details), z.code === "NOT_FOUND")) {
          S.value = !1, x.value = null, g("ok", "Module already removed; refreshed installed modules"), await p(), await h();
          return;
        }
        H.value = Le(z, "uninstall preview failed");
      } finally {
        T.value = !1;
      }
    }
  }
  async function v() {
    const I = x.value;
    if (!(!I || w.value)) {
      R.value = !0, K.value = null, H.value = null, A.value = [];
      try {
        const z = await e.uninstall({ id: I.id, component: I.component, migration_policy: E.value });
        A.value = Hn(z), g("ok", `Module uninstalled: ${I.id}`), k(), await p(), await h();
      } catch (z) {
        if (tt("modules:uninstall", z), z instanceof Nt && (K.value = z.code, P.value = po(z.details), A.value = Hn(z.details), z.code === "NOT_FOUND")) {
          S.value = !1, x.value = null, g("ok", "Module already removed; refreshed installed modules"), await p(), await h();
          return;
        }
        H.value = Le(z, "uninstall failed");
      } finally {
        R.value = !1;
      }
    }
  }
  return Ue(E, () => {
    S.value && x.value && !R.value && ae();
  }), {
    uninstallDialogOpen: S,
    uninstallDep: x,
    uninstallPolicy: E,
    uninstallRunning: R,
    uninstallPreviewLoading: T,
    uninstallPreview: N,
    uninstallExecution: A,
    uninstallCode: K,
    uninstallError: H,
    uninstallRequiredBy: P,
    uninstallPhase: B,
    uninstallElapsedSec: c,
    selectedUninstallBlockedReason: J,
    uninstallBlockedReason: m,
    uninstallActionBlockedReason: w,
    openUninstallDialog: O,
    previewUninstall: ae,
    runUninstall: v
  };
}
function jl({ hub: e, installed: t, installedError: n, installedCanUpdate: s, installedIsRoot: i, showToast: r, notifyModulesChanged: p, refreshAll: h, refreshSelectedDetail: g }) {
  const k = j({}), S = j(!1), x = j(!1), E = q(() => t.value.filter((v) => {
    const I = H(v);
    return s(v) && i(v) && I && ["available", "failed", "blocked", "skipped"].includes(I.status) && A(I.latestVersion, bt(v));
  }));
  function R(v) {
    return (String(v || "").trim().replace(/^[^\d]*/, "").match(/\d+(?:\.\d+)*/)?.[0] || "").split(".").filter(Boolean).map(Number);
  }
  function T(v, I) {
    const z = R(v), F = R(I), Q = Math.max(z.length, F.length);
    for (let ee = 0; ee < Q; ee++) {
      const ne = z[ee] || 0, ce = F[ee] || 0;
      if (ne !== ce) return ne > ce ? 1 : -1;
    }
    return String(v || "").localeCompare(String(I || ""));
  }
  function N(v = []) {
    const I = v.find((z) => z.is_latest) || v[0];
    return String(I?.version || "");
  }
  function A(v, I) {
    return !!(v && I && v !== I && T(v, I) > 0);
  }
  function K(v) {
    const I = String(v || "").trim().replace(/^[>=<~^]+v?/, "");
    return I ? `>=${I}` : ">=v0.0.0";
  }
  function H(v) {
    return v?.component && k.value[v.component] || null;
  }
  function P(v, I) {
    const z = k.value[v];
    k.value = {
      ...k.value,
      [v]: {
        component: v,
        currentVersion: I.currentVersion ?? z?.currentVersion ?? "",
        latestVersion: I.latestVersion ?? z?.latestVersion ?? "",
        status: I.status ?? z?.status ?? "current",
        message: I.message
      }
    };
  }
  function B(v) {
    const I = H(v);
    return I ? I.status === "available" ? `${I.currentVersion || "?"} → ${I.latestVersion || "?"}` : I.status === "queued" ? "queued" : I.status === "skipped" ? "skipped" : I.status === "planning" ? "planning" : I.status === "updating" ? "updating" : I.status === "updated" ? "updated" : I.status === "blocked" ? "blocked" : I.status === "failed" ? "failed" : "" : "";
  }
  function c(v) {
    const I = H(v)?.status;
    return I === "planning" || I === "updating" ? "tabler:loader-2" : I === "updated" ? "tabler:check" : I === "queued" ? "tabler:clock" : I === "skipped" ? "tabler:player-skip-forward" : I === "blocked" ? "tabler:lock" : I === "failed" ? "tabler:alert-triangle" : "tabler:arrow-up-circle";
  }
  function J(v) {
    const I = H(v)?.status;
    return I === "planning" || I === "updating";
  }
  async function m() {
    if (!e || S.value) return;
    S.value = !0, n.value = null;
    const v = {};
    let I = 0, z = 0;
    try {
      for (const F of t.value) {
        if (!s(F) || !i(F)) continue;
        const Q = bt(F);
        try {
          const ee = await e.listVersions(F.component), ne = N(ee.items), ce = A(ne, Q) ? "available" : "current";
          ce === "available" && I++, v[F.component] = { component: F.component, currentVersion: Q, latestVersion: ne, status: ce }, k.value = { ...v };
        } catch (ee) {
          z++, v[F.component] = {
            component: F.component,
            currentVersion: Q,
            latestVersion: "",
            status: "failed",
            message: Le(ee, "version scan failed")
          }, k.value = { ...v };
        }
      }
      r("ok", `Found ${I} update${I === 1 ? "" : "s"}${z ? `, ${z} failed` : ""}`);
    } finally {
      S.value = !1;
    }
  }
  async function w(v, I) {
    P(v, { status: "planning", message: void 0 });
    try {
      const z = await e.planInstall({ component: v, version: I, run_migrations: !0 }), F = z.missing_requirements || [];
      if (F.length) {
        const Q = `Missing required settings: ${F.join(", ")}`;
        return P(v, { status: "blocked", message: Q }), null;
      }
      return z;
    } catch (z) {
      const F = Le(z, "update plan failed");
      return P(v, { status: "failed", message: F }), null;
    }
  }
  async function O(v) {
    if (!e || !v.component) return !1;
    let I = H(v);
    if (!I) {
      const z = bt(v);
      try {
        const F = await e.listVersions(v.component), Q = N(F.items);
        I = {
          component: v.component,
          currentVersion: z,
          latestVersion: Q,
          status: A(Q, z) ? "available" : "current"
        }, P(v.component, I);
      } catch (F) {
        return P(v.component, { status: "failed", message: Le(F, "version scan failed") }), !1;
      }
    }
    if (!I.latestVersion || !A(I.latestVersion, bt(v))) return !0;
    try {
      const z = K(I.latestVersion), F = await w(v.component, z);
      if (!F) return !1;
      const Q = e.install({
        ...F.install_payload,
        component: v.component,
        version: z,
        run_migrations: !0,
        migration_policy: "up"
      });
      return P(v.component, { status: "updating" }), await Q, P(v.component, {
        status: "updated",
        currentVersion: I.latestVersion,
        latestVersion: I.latestVersion,
        message: void 0
      }), p(), !0;
    } catch (z) {
      return P(v.component, { status: "failed", message: Le(z, "update failed") }), !1;
    }
  }
  async function ae() {
    if (x.value || E.value.length === 0) return;
    x.value = !0;
    const v = [...E.value];
    try {
      for (const F of v) P(F.component, { status: "planning" });
      const I = await e.planBatchInstall({
        dependencies: v.map((F) => ({
          id: F.dependencyId,
          component: F.component,
          version: K(H(F).latestVersion)
        })),
        run_migrations: !0,
        migration_policy: "up"
      }), z = /* @__PURE__ */ new Map();
      for (const F of I.plans) {
        const Q = F.missing_requirements || [], ee = (F.requirements || []).filter((ne) => ne.invalid).map((ne) => `${ne.id || ne.parameter_name}: ${ne.invalid_reason || "invalid value"}`);
        if (F.applicable === !1 || Q.length || ee.length) {
          const ne = [
            Q.length ? `Missing required settings: ${Q.join(", ")}` : "",
            ee.length ? `Invalid settings: ${ee.join(", ")}` : ""
          ].filter(Boolean).join(". ") || "Update plan cannot be applied";
          z.set(F.dependency?.component || "Unknown module", ne);
        }
      }
      if (!I.applicable || z.size) {
        for (const F of v) P(F.component, {
          status: z.has(F.component) ? "blocked" : "skipped",
          message: z.get(F.component) || "Batch not applied because its plan is blocked"
        });
        r("error", z.size ? [...z].map(([F, Q]) => `${F}: ${Q}`).join("; ") : "Update plan cannot be applied. No modules were changed.");
        return;
      }
      if (!I.install_payload?.dependencies?.length) throw new Error("Update plan returned no install payload");
      for (const F of v) P(F.component, { status: "updating" });
      await e.install(I.install_payload);
      for (const F of v) P(F.component, { status: "updated" });
      p(), r("ok", `Updated ${v.length} module${v.length === 1 ? "" : "s"}`);
    } catch (I) {
      const z = Le(I, "update failed");
      for (const F of v) P(F.component, { status: "failed", message: z });
      r("error", z);
    } finally {
      try {
        await h(), await g();
      } catch (I) {
        r("error", `Module status could not be refreshed: ${Le(I, "refresh failed")}`);
      } finally {
        x.value = !1;
      }
    }
  }
  return {
    updateScan: k,
    updateScanLoading: S,
    updateAllRunning: x,
    availableUpdates: E,
    updateInfoForDep: H,
    updateStatusLabel: B,
    updateStatusIcon: c,
    updateStatusBusy: J,
    scanInstalledUpdates: m,
    updateInstalledDependency: O,
    updateAllAvailable: ae
  };
}
function Hl({ hub: e, loadCatalog: t }) {
  const n = j(!1), s = j(!1), i = j(!1), r = j(!1), p = j(null), h = j(""), g = j(!1), k = j(!1), S = j(null), x = q(() => p.value?.orgs || []), E = q(() => p.value?.username || p.value?.user_id || ""), R = q(() => !!p.value?.authenticated), T = q(() => !!(p.value?.authenticated && p.value?.expired)), N = q(() => i.value ? "tabler:key" : T.value ? "tabler:alert-triangle" : "tabler:key-off"), A = q(() => i.value ? "Hub token set" : T.value ? "Hub token expired" : "Set Hub token"), K = q(() => {
    const m = p.value?.expires_at;
    if (!m) return "";
    const w = new Date(m);
    return isNaN(w.getTime()) ? "" : w.toLocaleDateString();
  });
  function H(m) {
    p.value = m?.authenticated ? m : null;
    const w = mo(m);
    i.value = w, r.value = w;
  }
  async function P() {
    try {
      const { data: m } = await ao.get("/api/v1/user/me");
      n.value = !!(m?.success && m?.security?.is_admin);
    } catch (m) {
      tt("modules:auth", m), n.value = !1;
    } finally {
      s.value = !0;
    }
  }
  async function B() {
    try {
      const m = await e.authStatus();
      H(m);
    } catch (m) {
      tt("modules:hub-auth", m);
    }
  }
  async function c() {
    const m = h.value.trim();
    if (!m) {
      S.value = "Paste a Hub token first.";
      return;
    }
    S.value = null, k.value = !0;
    try {
      const w = await e.authenticate(m);
      H(w), mo(w) ? (h.value = "", g.value = !1, await t()) : S.value = "That token is invalid or expired.";
    } catch (w) {
      S.value = Le(w, "failed to save Hub token");
    } finally {
      k.value = !1;
    }
  }
  async function J() {
    S.value = null;
    try {
      await e.logout();
    } catch (m) {
      S.value = Le(m, "failed to clear Hub token");
      return;
    }
    H(null), await t();
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
    hubError: S,
    hubOrgs: x,
    hubIdentity: E,
    hubTokenStored: R,
    hubTokenExpired: T,
    hubTokenIcon: N,
    hubTokenButtonLabel: A,
    hubExpiry: K,
    applyHubAuthStatus: H,
    loadAuth: P,
    loadHubAuth: B,
    saveHubToken: c,
    clearHubToken: J
  };
}
const Ul = ["kickside", "kickside-plugin"], zo = "kickside", Nl = "https://portal.wippy.ai/account/tokens", Kl = [
  { label: "Block if any applied", value: "block" },
  { label: "Leave applied migrations", value: "leave" },
  { label: "Revert (down) - may lose data", value: "down" }
];
function ql() {
  const e = jo(ao), t = j(!0), n = j(null), s = Hl({ hub: e, loadCatalog: _n }), {
    isAdmin: i,
    authLoaded: r,
    hubConnected: p,
    hubUsable: h,
    hubStatus: g,
    hubToken: k,
    showTokenPanel: S,
    hubConnecting: x,
    hubError: E,
    hubOrgs: R,
    hubIdentity: T,
    hubTokenStored: N,
    hubTokenExpired: A,
    hubTokenIcon: K,
    hubTokenButtonLabel: H,
    hubExpiry: P,
    loadAuth: B,
    loadHubAuth: c,
    saveHubToken: J,
    clearHubToken: m
  } = s, w = j([]), O = j(""), ae = j("all"), v = j(!1), I = j(null), z = j(!0), F = j([]), Q = j(!1), ee = j(null), ne = j(""), ce = j("downloads"), ze = Vl({
    hub: e,
    installed: w,
    catalog: F,
    installedDepFor: Ie,
    installedCanUpdate: mt,
    installedUpdateDisabledReason: Zt,
    installedCanUninstall: St,
    installedIsPrivate: xt
  }), {
    selected: be,
    selectedModule: Ne,
    detailReadme: De,
    detailEntries: vt,
    detailLoading: Ke,
    detailTab: gt,
    detailVersions: Pt,
    envVars: Mt,
    requirements: we,
    detailGroups: qt,
    versionMeta: nt,
    selectedInstalledDep: qe,
    selectedCanUpdate: yt,
    selectedUpdateDisabledReason: ot,
    selectedCanUninstall: Ge,
    selectedIsPrivate: Be,
    openDetail: Te,
    closeDetail: Se,
    refreshSelectedDetail: We
  } = ze, Ze = Rl({
    hub: e,
    selected: be,
    selectedInstalledDep: qe,
    installedIsRoot: Ce,
    installedUninstallDisabledReason: Wt,
    installedCanUninstall: St,
    refreshAll: jt,
    refreshSelectedDetail: We,
    showToast: _,
    notifyModulesChanged: Qn
  }), {
    uninstallDialogOpen: Et,
    uninstallDep: it,
    uninstallPolicy: Ye,
    uninstallRunning: Re,
    uninstallPreviewLoading: Tt,
    uninstallPreview: $,
    uninstallExecution: L,
    uninstallCode: D,
    uninstallError: U,
    uninstallRequiredBy: Z,
    uninstallPhase: X,
    uninstallElapsedSec: re,
    selectedUninstallBlockedReason: ge,
    uninstallBlockedReason: st,
    uninstallActionBlockedReason: Ft,
    openUninstallDialog: de,
    previewUninstall: Fe,
    runUninstall: at
  } = Ze, kt = jl({
    hub: e,
    installed: w,
    installedError: I,
    installedCanUpdate: mt,
    installedIsRoot: Ce,
    showToast: _,
    notifyModulesChanged: Qn,
    refreshAll: jt,
    refreshSelectedDetail: We
  }), {
    updateScanLoading: wt,
    updateAllRunning: fe,
    availableUpdates: Ae,
    updateInfoForDep: lt,
    updateStatusLabel: Xe,
    updateStatusIcon: nn,
    updateStatusBusy: Vt,
    scanInstalledUpdates: Ct,
    updateInstalledDependency: Pe,
    updateAllAvailable: je
  } = kt, rt = q(() => {
    const V = /* @__PURE__ */ new Set();
    for (const se of w.value)
      if (se.installed !== !1)
        for (const Ht of fo(se)) V.add(Ht);
    return V;
  }), ut = q(() => Ii(F.value, ne.value)), ke = q(() => ut.value.filter((V) => !$t(V))), dt = q(() => ne.value.trim() || ke.value.length < 7 ? [] : [...ke.value].sort((V, se) => (se.total_downloads || 0) - (V.total_downloads || 0)).slice(0, 6)), on = q(() => new Set(dt.value.map(En))), It = q(() => _i(ke.value.filter((V) => !on.value.has(En(V))), ce.value)), ct = q(() => w.value.filter((V) => V.installed !== !1).length), pt = q(() => {
    const V = O.value.trim().toLowerCase(), se = ae.value, Ht = w.value.filter((Me) => Me.installed === !1 || se === "root" && !Ce(Me) || se === "transitive" && Ce(Me) || se === "local" && Me.source !== "local" ? !1 : V ? [
      Me.component,
      Me.id,
      Me.name,
      Me.namespace,
      Me.version,
      Me.source,
      Bt(Me),
      Rt(Me),
      Lo(Me),
      bt(Me)
    ].filter(Boolean).join(" ").toLowerCase().includes(V) : !0);
    return xi(Ht, $e);
  }), Je = q(() => w.value.filter((V) => V.installed !== !1 && !!$e(V.component)).length), ve = q(() => pt.value.filter((V) => !!$e(V.component)).length), Qe = q(() => r.value && !i.value), me = j(null), Gt = q(() => me.value !== null);
  function $e(V) {
    return F.value.find((se) => Mn(se, V));
  }
  function _t(V) {
    return pn({ full_name: V.component });
  }
  function Dt(V) {
    const se = $e(V.component);
    return se ? en(se) : "tabler:package";
  }
  function xt(V) {
    return cn($e(V.component)) || cn(V);
  }
  function Ce(V) {
    return Oi(V || {});
  }
  function Bt(V) {
    return Li(V);
  }
  function Rt(V) {
    return zi(V);
  }
  function Wt(V) {
    if (Ce(V)) return "";
    const se = Rt(V);
    return se ? `Installed as a dependency; ${se}` : "Installed as a dependency of another module";
  }
  function mt(V) {
    return !!(V?.component && V.source !== "local");
  }
  function Zt(V) {
    return V.source === "local" ? "Local replacement; update from source" : "No Hub dependency update action available";
  }
  function St(V) {
    return !!(V && Ce(V));
  }
  function $t(V) {
    return fo(V).some((se) => rt.value.has(se));
  }
  function Ie(V) {
    return w.value.find((se) => Mn(se, V));
  }
  function _(V, se) {
    const Ht = Ko?.toast;
    typeof Ht == "function" ? Ht({ severity: V === "ok" ? "success" : "error", summary: se }) : (n.value = { kind: V, message: se }, setTimeout(() => {
      n.value?.message === se && (n.value = null);
    }, 5e3));
  }
  function b() {
    be.value && G({
      full_name: be.value.component,
      latest_version: be.value.version,
      description: be.value.description
    });
  }
  function He() {
    const V = be.value && Ie(be.value.component);
    V && mt(V) && pe(V);
  }
  function Dn() {
    const V = be.value && Ie(be.value.component);
    V && St(V) && de(V);
  }
  async function Bn() {
    v.value = !0, I.value = null;
    try {
      w.value = Fl(await e.listDependencies());
    } catch (V) {
      w.value = [], tt("modules:listDependencies", V), I.value = Le(V, "dependency graph unavailable");
    }
    v.value = !1;
  }
  async function _n() {
    Q.value = !0, ee.value = null;
    try {
      F.value = (await e.fetchAllByKeyword(Ul)).filter(Pi);
    } catch (V) {
      tt("modules:catalog", V), V instanceof Nt && (V.code === "UNAUTHORIZED" || V.code === "FORBIDDEN") ? h.value = !1 : ee.value = Le(V, `failed to load ${zo} catalog`);
    } finally {
      Q.value = !1;
    }
  }
  async function jt() {
    await Promise.all([Bn(), _n()]);
  }
  function G(V) {
    const se = Pn(V);
    me.value = {
      mode: "install",
      component: se,
      version: V.latest_version ? String(V.latest_version) : "",
      currentId: null,
      catalogItem: $e(se) || V,
      installedDep: null
    };
  }
  function pe(V) {
    mt(V) && (me.value = {
      mode: "update",
      component: V.component,
      // Let the dialog load and select the newest published release. Seeding
      // this with the resolved version re-submits the current package while
      // presenting the operation as an update.
      version: "",
      currentId: V.dependencyId || null,
      catalogItem: $e(V.component) || null,
      installedDep: V
    });
  }
  function ue() {
    me.value = null;
  }
  async function _e() {
    await jt(), await We(), ue();
  }
  return so(() => {
    No("wc-render-markdown", { timeoutMs: 8e3 }).catch(() => {
    });
  }), Ai(async () => {
    try {
      if (await B(), !i.value) return;
      await c(), await jt();
    } finally {
      t.value = !1;
    }
  }), {
    LABEL: zo,
    HUB_PORTAL: Nl,
    UNINSTALL_MIGRATION_OPTIONS: Kl,
    initialLoading: t,
    accessDenied: Qe,
    statusBanner: n,
    hubConnected: p,
    hubStatus: g,
    hubToken: k,
    showTokenPanel: S,
    hubConnecting: x,
    hubError: E,
    hubOrgs: R,
    hubIdentity: T,
    hubTokenStored: N,
    hubTokenExpired: A,
    hubTokenIcon: K,
    hubTokenButtonLabel: H,
    hubExpiry: P,
    selected: be,
    selectedModule: Ne,
    detailReadme: De,
    detailEntries: vt,
    detailLoading: Ke,
    detailTab: gt,
    detailVersions: Pt,
    envVars: Mt,
    requirements: we,
    detailGroups: qt,
    versionMeta: nt,
    selectedCanUpdate: yt,
    selectedUpdateDisabledReason: ot,
    selectedCanUninstall: Ge,
    selectedIsPrivate: Be,
    selectedUninstallBlockedReason: ge,
    entryName: Ml,
    entryDesc: El,
    entryIcon: Tl,
    installed: w,
    installedFilter: O,
    installedKindFilter: ae,
    installedTotal: ct,
    updateScanLoading: wt,
    updateAllRunning: fe,
    availableUpdates: Ae,
    installedLoading: v,
    installedError: I,
    installedOpen: z,
    catalog: F,
    catalogLoading: Q,
    catalogError: ee,
    catalogInstalledTotal: Je,
    visibleCatalogInstalled: ve,
    browseFilter: ne,
    sortBy: ce,
    availableItems: ke,
    featured: dt,
    sortedItems: It,
    visibleInstalled: pt,
    catalogItemFor: $e,
    installedAccent: _t,
    installedIcon: Dt,
    installedIsPrivate: xt,
    installedIsRoot: Ce,
    installedRole: Bt,
    installedUsedBy: Rt,
    installedCanUpdate: mt,
    installedUpdateDisabledReason: Zt,
    installedCanUninstall: St,
    installedMigrationSummary: Lo,
    updateInfoForDep: lt,
    updateStatusLabel: Xe,
    updateStatusIcon: nn,
    updateStatusBusy: Vt,
    scanInstalledUpdates: Ct,
    updateInstalledDependency: Pe,
    updateAllAvailable: je,
    installDialogOpen: Gt,
    installTarget: me,
    closeInstallDialog: ue,
    onInstallChanged: _e,
    uninstallDialogOpen: Et,
    uninstallDep: it,
    uninstallPolicy: Ye,
    uninstallRunning: Re,
    uninstallPreviewLoading: Tt,
    uninstallPreview: $,
    uninstallExecution: L,
    uninstallCode: D,
    uninstallError: U,
    uninstallRequiredBy: Z,
    uninstallBlockedReason: st,
    uninstallActionBlockedReason: Ft,
    uninstallPhase: X,
    uninstallElapsedSec: re,
    previewUninstall: Fe,
    executionStepLabel: Ro,
    openDetail: Te,
    closeDetail: Se,
    detailInstall: b,
    detailUpdate: He,
    detailUninstall: Dn,
    refreshAll: jt,
    saveHubToken: J,
    clearHubToken: m,
    openUpdateDialog: pe,
    openUninstallDialog: de,
    installedUninstallDisabledReason: Wt,
    runUninstall: at
  };
}
const Gl = ["aria-label", "aria-busy"], Wl = /* @__PURE__ */ tn({
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
      await bn();
      const h = i.value;
      h && (n.visible && !h.open ? h.showModal() : !n.visible && h.open && h.close());
    }
    function p(h) {
      h.preventDefault(), n.busy || s("close");
    }
    return Ue(() => n.visible, r), so(r), Uo(() => {
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
        class: te(e.headerClass)
      }, [
        oe(h.$slots, "header"),
        y(o(ro), {
          type: "button",
          text: "",
          severity: "secondary",
          "aria-label": "Close dialog",
          disabled: e.busy,
          onClick: g[0] || (g[0] = (k) => s("close"))
        }, {
          default: he(() => [...g[2] || (g[2] = [
            M("×", -1)
          ])]),
          _: 1
        }, 8, ["disabled"])
      ], 2),
      a("div", {
        class: te(e.contentClass)
      }, [
        oe(h.$slots, "default")
      ], 2),
      h.$slots.footer ? (l(), u("footer", {
        key: 0,
        class: te(e.footerClass)
      }, [
        oe(h.$slots, "footer")
      ], 2)) : f("", !0)
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
}, mr = ["disabled"], Ao = /* @__PURE__ */ tn({
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
    const n = e, s = t, i = j(null), r = j(null), p = j(!1), h = j(""), g = j(0), k = Ui(), S = q(() => {
      const A = h.value.trim().toLowerCase(), K = /* @__PURE__ */ new Map();
      for (const P of n.items) {
        if (!n.remote && A && ![P.title, P.subtitle, P.id, P.group].some((J) => J?.toLowerCase().includes(A))) continue;
        const B = P.group || "Other", c = K.get(B);
        c ? c.push(P) : K.set(B, [P]);
      }
      let H = 0;
      return [...K.entries()].sort((P, B) => P[0].localeCompare(B[0])).map(([P, B]) => ({ group: P, items: B.map((c) => ({ item: c, index: H++ })) }));
    }), x = q(() => S.value.flatMap((A) => A.items)), E = q(() => n.items.find((A) => A.id === n.modelValue)), R = q(() => x.value[g.value] ? `${k}-${g.value}` : void 0);
    Ue(h, () => {
      g.value = 0;
    }), Ue([p, h], ([A, K]) => {
      A && n.remote && s("search", K);
    }), Ue(() => n.disabled, (A) => {
      A && (p.value = !1);
    }), Ue(p, async (A) => {
      if (!A) {
        i.value?.focus();
        return;
      }
      h.value = "", g.value = Math.max(0, x.value.findIndex(({ item: K }) => K.id === n.modelValue)), await bn(), r.value?.focus();
    });
    function T(A) {
      n.disabled || n.loading || (s("update:modelValue", A.id), p.value = !1);
    }
    async function N(A) {
      if (A.key === "Escape" && p.value) {
        A.preventDefault(), A.stopPropagation(), p.value = !1;
        return;
      }
      if (!["ArrowDown", "ArrowUp", "Home", "End", "Enter"].includes(A.key)) return;
      if (A.preventDefault(), !p.value) {
        p.value = !0;
        return;
      }
      if (A.key === "Enter") {
        const P = x.value[g.value];
        P && T(P.item);
        return;
      }
      const K = x.value.length - 1;
      g.value = A.key === "Home" ? 0 : A.key === "End" ? K : Math.max(0, Math.min(K, g.value + (A.key === "ArrowDown" ? 1 : -1))), await bn(), i.value?.getRootNode()?.querySelector(`[id="${R.value}"]`)?.scrollIntoView({ block: "nearest" });
    }
    return (A, K) => (l(), u(Y, null, [
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
        onClick: K[0] || (K[0] = (H) => p.value = !p.value),
        onKeydown: N
      }, [
        a("span", Yl, [
          E.value ? (l(), u("span", Xl, [
            y(o(C), {
              icon: E.value.icon || "tabler:point",
              class: "kx-ps-val-ico",
              "aria-hidden": "true"
            }, null, 8, ["icon"]),
            a("span", Jl, d(E.value.title), 1)
          ])) : (l(), u("span", Ql, d(e.placeholder || "Select…"), 1))
        ]),
        a("span", er, [
          y(o(C), {
            icon: "tabler:chevron-down",
            "aria-hidden": "true"
          })
        ])
      ], 40, Zl),
      y(ai, {
        open: p.value,
        "onUpdate:open": K[3] || (K[3] = (H) => p.value = H),
        anchor: i.value
      }, {
        default: he(() => [
          a("div", tr, [
            a("div", nr, [
              Ve(a("input", {
                ref_key: "search",
                ref: r,
                "onUpdate:modelValue": K[1] || (K[1] = (H) => h.value = H),
                type: "search",
                class: "p-inputtext p-select-filter",
                "aria-label": `Search ${e.ariaLabel || e.placeholder || "options"}`,
                "aria-controls": o(k),
                "aria-activedescendant": R.value,
                onKeydown: N
              }, null, 40, or), [
                [Ln, h.value]
              ])
            ]),
            a("ul", {
              id: o(k),
              class: "p-select-list kx-ps-options",
              role: "listbox",
              "aria-label": e.ariaLabel || e.placeholder || "Options"
            }, [
              (l(!0), u(Y, null, ie(S.value, (H) => (l(), u(Y, {
                key: H.group
              }, [
                a("li", sr, d(H.group), 1),
                (l(!0), u(Y, null, ie(H.items, ({ item: P, index: B }) => (l(), u("li", {
                  id: `${o(k)}-${B}`,
                  key: P.id,
                  class: te(["p-select-option kx-ps-option", { "p-select-option-selected": P.id === e.modelValue, "p-focus": B === g.value }]),
                  role: "option",
                  "aria-selected": P.id === e.modelValue,
                  onClick: (c) => T(P),
                  onMousemove: (c) => g.value = B
                }, [
                  y(o(C), {
                    icon: P.icon || "tabler:point",
                    class: "kx-ps-opt-ico",
                    "aria-hidden": "true"
                  }, null, 8, ["icon"]),
                  a("span", lr, [
                    a("span", rr, d(P.title), 1),
                    P.subtitle ? (l(), u("span", ur, d(P.subtitle), 1)) : f("", !0)
                  ])
                ], 42, ar))), 128))
              ], 64))), 128)),
              e.loading ? (l(), u("li", dr, "Loading…")) : !x.value.length && !e.error ? (l(), u("li", cr, "No matches")) : f("", !0)
            ], 8, ir),
            e.error ? (l(), u("div", pr, d(e.error), 1)) : f("", !0),
            e.more ? (l(), u("button", {
              key: 1,
              type: "button",
              class: "p-button p-button-secondary",
              "data-testid": "picker-more",
              disabled: e.loading || e.disabled,
              onClick: K[2] || (K[2] = (H) => s("more"))
            }, "Load more", 8, mr)) : f("", !0)
          ])
        ]),
        _: 1
      }, 8, ["open", "anchor"])
    ], 64));
  }
});
function eo() {
  return { status: "idle", modules: [], findings: [], scanned: 0, total: 0 };
}
function fr(e) {
  return e.some((t) => t.severity === "critical") ? "critical" : e.length > 0 ? "warnings" : "clean";
}
const Po = {
  info: { label: "Info", icon: "tabler:info-circle", tone: "info" },
  warning: { label: "Warning", icon: "tabler:alert-triangle", tone: "warn" },
  critical: { label: "Critical", icon: "tabler:shield-x", tone: "danger" }
};
function br(e) {
  return e.severity !== "critical";
}
const hr = ["clean", "warnings", "critical", "error", "unavailable", "skipped"];
function Mo(e) {
  return hr.includes(e) ? e : "clean";
}
function vr(e) {
  return e === "critical" ? "critical" : e === "warning" ? "warning" : "info";
}
function gr(e) {
  const t = e && typeof e == "object" ? e : {}, n = [], s = [];
  for (const h of t.modules || []) {
    const g = String(h.module || ""), k = h.version ? String(h.version) : void 0, S = (h.findings || []).map((x, E) => ({
      id: `${g}#${E}`,
      module: g,
      version: k,
      severity: vr(x.severity),
      title: String(x.title || "Issue"),
      detail: x.detail ? String(x.detail) : void 0,
      location: x.location ? String(x.location) : void 0
    }));
    for (const x of S) s.push(x);
    n.push({
      module: g,
      version: k,
      status: Mo(h.status),
      summary: h.summary ? String(h.summary) : void 0,
      findings: S
    });
  }
  const i = typeof t.total == "number" ? t.total : n.length, r = typeof t.scanned == "number" ? t.scanned : n.length;
  return {
    status: t.overall_status ? Mo(t.overall_status) : fr(s),
    summary: t.overall_summary ? String(t.overall_summary) : void 0,
    modules: n,
    findings: s,
    scanned: r,
    total: i
  };
}
function yr({ props: e, hub: t, plan: n, activeSection: s, versionArg: i, requirementPayload: r, invalidatePlan: p, refreshPlan: h, planCurrent: g }) {
  const k = j([]), S = j({}), x = j({}), E = q(() => {
    const $ = /* @__PURE__ */ new Map();
    for (const L of k.value) {
      const D = String(L.module || "");
      $.has(D) || $.set(D, []), $.get(D).push(L);
    }
    return Array.from($.entries()).map(([L, D]) => ({ module: L, items: D, direct: !D.every((U) => xn(U, e.component)) })).sort((L, D) => L.direct === D.direct ? L.module.localeCompare(D.module) : L.direct ? -1 : 1);
  }), R = q(() => k.value.filter(($) => !xn($, e.component))), T = q(() => k.value.filter(($) => !De($))), N = q(() => k.value.length - R.value.length), A = q(() => {
    const $ = [];
    for (const L of k.value) {
      const D = le(L);
      !D || !L.required && !L.missing || v(S.value[D]) && $.push(D);
    }
    return $;
  }), K = q(() => k.value.filter(($) => !v(S.value[le($)])).length), H = q(() => nt().length), P = j(!1), B = j(null);
  let c = null;
  const J = j(0), m = j({}), w = q(() => Object.keys(m.value).length);
  let O = 0;
  const ae = /* @__PURE__ */ new Set();
  function v($) {
    return $ == null || $ === "" || typeof $ == "string" && !$.trim() || Array.isArray($) && $.length === 0 || typeof $ == "object" && Object.keys($).length === 0;
  }
  function I($) {
    return $ == null ? "" : typeof $ == "object" ? JSON.stringify($) : String($);
  }
  function z($) {
    if ($.expected_type) return $.expected_type;
    const L = [$.value, $.default, ...($.suggestions || []).map((D) => D.value)];
    for (const D of L) {
      if (typeof D == "boolean" || typeof D == "number") return typeof D;
      if (Array.isArray(D)) return "array";
      if (D && typeof D == "object") return "object";
    }
    return "string";
  }
  function F($, L) {
    if (typeof L != "string") return L;
    const D = L.trim(), U = z($);
    if (U === "boolean") return /^(true|false)$/.test(D) ? D === "true" : L;
    if (U === "number" || U === "integer") return D && Number.isFinite(Number(D)) ? Number(D) : L;
    if (U === "array" || U === "object")
      try {
        return JSON.parse(D);
      } catch {
        return L;
      }
    return L;
  }
  function Q($, L) {
    const D = z($);
    return D === "array" ? Array.isArray(L) : D === "object" ? L !== null && typeof L == "object" && !Array.isArray(L) : D === "integer" ? typeof L == "number" && Number.isInteger(L) : typeof L === D && (D !== "number" || Number.isFinite(L));
  }
  function ee($, L) {
    const D = le($);
    if (!D || De($)) return;
    const U = F($, L ?? "");
    JSON.stringify(S.value[D]) !== JSON.stringify(U) && (ae.add(D), S.value = { ...S.value, [D]: U }, p());
  }
  function ne($) {
    const L = S.value[le($)];
    return !De($) && !v(L) && !Q($, L);
  }
  function ce($) {
    const L = z($);
    return L === "boolean" ? "expects true or false" : `expects ${L === "integer" || L === "object" || L === "array" ? "an" : "a"} ${L}`;
  }
  const ze = q(() => k.value.filter(ne).map(le).filter(Boolean));
  function be($) {
    return I(S.value[le($)]);
  }
  function Ne($) {
    return ($.required || $.missing) === !0 && v(S.value[le($)]);
  }
  function De($) {
    return xn($, e.component) && $.missing !== !0 && !ae.has(le($));
  }
  function vt($) {
    const L = /* @__PURE__ */ new Set(), D = [];
    for (const U of $.suggestions || []) {
      const Z = I(U.value).trim();
      if (!Z || L.has(Z)) continue;
      L.add(Z);
      const X = String(U.label || Z).trim(), re = [U.kind, U.source, U.description].filter(Boolean).map(String).join(" | ");
      D.push({ label: X && X !== Z ? `${X} (${Z})` : Z, value: Z, title: re });
    }
    return D;
  }
  function Ke() {
    const $ = {}, L = (U, Z) => {
      if (U = String(U || "").trim(), !U) return;
      $[U] = Z;
      const X = U.includes(":") && U.split(":").pop() || "";
      X && $[X] === void 0 && ($[X] = $[U]);
    }, D = e.installedDep?.parameters;
    if (Array.isArray(D))
      for (const U of D)
        L(U.name, U.value);
    else if (D && typeof D == "object")
      for (const [U, Z] of Object.entries(D)) L(U, Z);
    return $;
  }
  async function gt() {
    if (x.value = {}, !!t)
      try {
        const $ = await t.listDependencies({ includeEntries: !1, includeMigrations: !1 }), L = {}, D = (U, Z) => {
          U = String(U || "").trim();
          const X = String(Z ?? "").trim();
          if (!U || !X || L[U] !== void 0) return;
          L[U] = Z;
          const re = U.includes(":") && U.split(":").pop() || "";
          re && L[re] === void 0 && (L[re] = L[U]);
        };
        for (const U of $.dependencies || []) {
          const Z = U.parameters;
          if (Array.isArray(Z))
            for (const X of Z) D(X.name, X.value);
          else if (Z && typeof Z == "object")
            for (const [X, re] of Object.entries(Z)) D(X, re);
        }
        x.value = L;
      } catch ($) {
        tt("install:dependency-parameters", $);
      }
  }
  function Pt($) {
    for (const L of n.value?.recommended_parameters || [])
      if (L.name === $ && I(L.value).trim() !== "") return I(L.value);
    return "";
  }
  function Mt($) {
    const L = [
      le($),
      String($.parameter_name || ""),
      String($.full_id || ""),
      String($.name || ""),
      String($.short_name || "")
    ].map((D) => D.trim()).filter(Boolean);
    for (const D of L) {
      const U = I(x.value[D]).trim();
      if (U) return U;
      const Z = D.includes(":") && D.split(":").pop() || "";
      if (Z) {
        const X = I(x.value[Z]).trim();
        if (X) return X;
      }
    }
    return "";
  }
  function we($) {
    const L = le($);
    if (!L || De($) || String(S.value[L] ?? "").trim()) return "";
    const U = Pt(L).trim();
    if (U) return U;
    const Z = Mt($);
    if (Z) return Z;
    const X = I($.default).trim();
    if (X) return X;
    const re = vt($).map((st) => st.value).filter(Boolean);
    if (re.length === 1) return re[0];
    const ge = qt($);
    return ge.length && ge[0].score > 0 && (ge.length === 1 || ge[0].score > ge[1].score) ? ge[0].value : "";
  }
  function qt($) {
    return String($.expected_kind || "").trim() !== "security.scope" ? [] : ($.suggestions || []).map((L) => {
      const D = I(L.value).trim(), U = String(L.label || "").toLowerCase(), Z = String(L.description || "").toLowerCase();
      let X = 0;
      return D || (X -= 1e3), (U.includes("system") || Z.includes("system") || Z.includes("internal")) && (X -= 50), (U.includes("admin") || Z.includes("full access") || Z.includes("assign sparingly")) && (X -= 50), (Z.includes("signed-in") || Z.includes("authenticated")) && (X += 30), (U === "user" || U === "member") && (X += 20), { value: D, score: X };
    }).filter((L) => L.value).sort((L, D) => D.score - L.score || L.value.localeCompare(D.value));
  }
  function nt() {
    const $ = [];
    for (const L of T.value) {
      if (!Ne(L)) continue;
      const D = le(L), U = we(L);
      D && U && $.push({ name: D, value: U });
    }
    return $;
  }
  function qe($) {
    return we($) !== "";
  }
  function yt($) {
    const L = le($), D = we($);
    if (!L || !D) {
      s.value = "requirements", J.value++;
      return;
    }
    ee($, D);
  }
  function ot() {
    const $ = nt();
    if (!$.length) {
      s.value = "requirements", J.value++;
      return;
    }
    for (const L of $) {
      const D = k.value.find((U) => le(U) === L.name);
      D && ee(D, String(L.value));
    }
  }
  function Ge() {
    return T.value.filter(($) => v(S.value[le($)]) && ($.missing || $.value_source === "conflict" || $.expected_type || vt($).length)).map(($) => ({ name: $.full_id || le($) }));
  }
  const Be = q(() => Ge().length);
  function Te($, L) {
    return v(L) || !Q($, L) ? !1 : !$.expected_kind || !!$.suggestions?.some((D) => D.value === L);
  }
  function Se($) {
    const L = { ...m.value }, D = { ...S.value };
    for (const U of $) {
      const Z = L[U];
      Z?.value !== void 0 && (D[U] = Z.value, ae.add(U), delete L[U]);
    }
    return S.value = D, p(), L;
  }
  async function We($) {
    if (!g.value || P.value) return;
    const L = Se($), D = O;
    if (await h(), D !== O || !g.value) return;
    const U = {};
    for (const Z of T.value) {
      const X = le(Z), re = L[X];
      re && v(S.value[X]) && Z.expected_type === re.expected_type && Z.expected_kind === re.expected_kind && Te(Z, re.value) && (U[X] = re);
    }
    m.value = U;
  }
  function Ze($) {
    const L = { ...m.value };
    for (const D of $) delete L[D];
    m.value = L;
  }
  function Et($) {
    !g.value || P.value || Se($);
  }
  async function it($) {
    const L = Ge();
    if (!g.value || !L.length || P.value) return;
    Re();
    const D = O, U = new AbortController();
    c = U, P.value = !0, B.value = null, m.value = {}, await new Promise((Z) => {
      let X = !1, re = !1;
      const ge = (de) => {
        if (X) return;
        if (X = !0, clearTimeout(st), U.signal.aborted || D !== O || c !== U) {
          Z();
          return;
        }
        c = null;
        const Fe = de && typeof de == "object" ? de : {};
        if (Fe.success === !0) {
          const at = new Set(L.map((fe) => fe.name)), kt = {}, wt = new Map((Fe.requirements || []).map((fe) => [fe.full_id, fe]));
          k.value = k.value.map((fe) => ({
            ...fe,
            resolution_error: wt.get(fe.full_id)?.resolution_error
          }));
          for (const fe of Fe.parameters || []) {
            const Ae = k.value.find((lt) => (lt.full_id || le(lt)) === fe.name || le(lt) === fe.name);
            if (!Ae || !at.has(Ae.full_id || le(Ae)) || !Te(Ae, fe.value) || typeof fe.reason != "string" || !fe.reason.trim()) {
              B.value = { tone: "warning", code: "INVALID_CHOICE", message: "AI returns an invalid planned value or omits its reason. Choose a value manually." };
              continue;
            }
            kt[le(Ae)] = { ...Ae, value: fe.value, choice_reason: fe.reason };
          }
          m.value = kt, Object.keys(kt).length ? B.value = { tone: "success", message: "Review AI suggestions before applying." } : B.value || (B.value = { tone: "warning", message: "No valid AI suggestion is available. Choose a value manually." });
        } else
          B.value = {
            tone: "warning",
            code: Fe.code,
            kind: Fe.kind,
            details: Fe.details,
            message: Fe.error || "AI could not resolve these settings. Choose a value manually."
          };
        P.value = !1, Z();
      }, st = setTimeout(() => {
        ge({ success: !1, code: "TIMEOUT", error: "AI requirement resolution timed out." }), U.abort();
      }, 2e4);
      U.signal.addEventListener("abort", () => {
        X || (X = !0, clearTimeout(st), Z());
      }, { once: !0 });
      const Ft = {
        component: e.component,
        ...i() ? { version: i() } : {},
        ...e.mode === "update" && e.currentId ? { current_id: e.currentId } : {},
        ...r(),
        requirements: L,
        signal: U.signal,
        accept: () => {
          X || (re = !0);
        },
        respond: ge
      };
      $?.dispatchEvent(new CustomEvent("instrumentRequirementResolution", { detail: Ft, bubbles: !0, composed: !0 })), re || ge({ success: !1, code: "MODEL_UNAVAILABLE", error: "Configure an AI model to suggest settings, or choose values manually." });
    });
  }
  function Ye($, L) {
    n.value = $, k.value = ($.requirements || []).filter((Z) => Z.name !== "required_setup" && Z.short_name !== "required_setup");
    const D = Ke(), U = {};
    for (const Z of k.value) {
      const X = le(Z);
      if (!X) continue;
      const re = String(Z.name || Z.short_name || X.split(":").pop() || "");
      U[X] = (ae.has(X) ? L[X] : v(L[X]) ? void 0 : L[X]) ?? D[X] ?? D[re] ?? x.value[X] ?? x.value[re] ?? Z.value ?? Z.default ?? "";
    }
    S.value = U;
    for (const Z of ae)
      Z in U || ae.delete(Z);
  }
  function Re() {
    c?.abort(), c = null, P.value = !1, O++, m.value = {}, B.value = null;
  }
  function Tt() {
    Re(), k.value = [], S.value = {}, ae.clear(), x.value = {}, P.value = !1, B.value = null;
  }
  return {
    pendingSuggestions: m,
    pendingCount: w,
    acceptSuggestions: We,
    rejectSuggestions: Ze,
    editSuggestions: Et,
    displayValue: I,
    requirements: k,
    parameterValues: S,
    installedParameterHints: x,
    requirementGroups: E,
    rootRequirements: R,
    editableRequirements: T,
    transitiveRequirementCount: N,
    missingRequirements: A,
    boundRequirementCount: K,
    autoFitCount: H,
    aiResolving: P,
    aiResolutionNotice: B,
    typeInvalidRequirements: ze,
    highlightTick: J,
    aiResolvableCount: Be,
    setParameter: ee,
    requirementTypeInvalid: ne,
    requirementTypeHint: ce,
    requirementValue: be,
    requirementMissing: Ne,
    requirementReadOnly: De,
    requirementOptions: vt,
    loadInstalledParameterHints: gt,
    applyPlan: Ye,
    recommendedValueFor: Pt,
    hintedValueFor: Mt,
    autoFitValue: we,
    canAutoFitRequirement: qe,
    autoFitRequirement: yt,
    autoFitRequirements: ot,
    resolveRequirementsWithAI: it,
    abortAI: Re,
    resetRequirements: Tt
  };
}
function Rn(e) {
  return e.map((t) => [t.module, t.version || ""].join("\0")).sort().join("");
}
function kr({ props: e, hub: t, plan: n, planCurrent: s, versionArg: i }) {
  const r = j(eo()), p = j(/* @__PURE__ */ new Set()), h = j(!1);
  let g = 0, k = null;
  const S = q(() => r.value.findings.filter(br)), x = q(() => S.value.filter((H) => !p.value.has(H.id)));
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
    const P = H ? Rn(H) : null;
    P !== k && (g++, k = P, r.value = { ...eo(), total: H?.length || 0 }, p.value = /* @__PURE__ */ new Set(), h.value = !1);
  }
  async function N() {
    if (!t || !e.component || !s.value) return;
    const H = n.value?.graph || [], P = Rn(H), B = ++g;
    p.value = /* @__PURE__ */ new Set(), h.value = !1, r.value = { status: "scanning", modules: [], findings: [], scanned: 0, total: H.length };
    try {
      const c = await t.scan({ component: e.component, version: i() });
      if (B !== g) return;
      const J = gr(c);
      if (Rn(J.modules) !== P)
        throw new Error("Security scan resolved different module versions. Refresh the install plan and scan again.");
      r.value = J;
    } catch (c) {
      if (B === g) {
        const J = c instanceof Nt && (c.status === 404 || c.code === "UNKNOWN" || c.code === "NETWORK");
        r.value = J ? { status: "unavailable", modules: [], findings: [], scanned: 0, total: H.length, error: "Security scan unavailable" } : { status: "error", modules: [], findings: [], scanned: 0, total: H.length, error: Le(c, "scan failed") };
      }
    }
  }
  function A() {
    const H = n.value?.graph || [];
    g++, r.value = {
      status: "skipped",
      modules: [],
      findings: [],
      scanned: 0,
      total: H.length,
      summary: "Security scan skipped by operator."
    }, p.value = /* @__PURE__ */ new Set(), h.value = !1;
  }
  function K() {
    g++;
  }
  return { scan: r, acknowledged: p, criticalConfirmed: h, softFindings: S, unacknowledgedSoft: x, acknowledge: E, acknowledgeAllSoft: R, resetScanForPlan: T, runScanNow: N, skipScan: A, cancelScan: K };
}
const wr = {
  "hub.install.started": "Publishing changeset",
  "hub.install.finished": "Finalizing",
  "hub.migrations.started": "Running migrations",
  "hub.migrations.finished": "Migrations applied",
  "hub.uninstall.started": "Removing entries"
}, jn = [
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
  const n = jo(ao), s = j("overview"), i = j(""), r = j("pin"), p = j([]), h = j(!1), g = q(() => [
    { label: "latest", value: "" },
    ...p.value.map((G) => String(G.version || "")).filter(Boolean).map((G) => ({ label: G, value: G }))
  ]), k = q(() => p.value.find((G) => G.version === i.value) || p.value[0]);
  function S() {
    const G = i.value.trim().replace(/^>=?/, "");
    if (G)
      return r.value === "track" ? `>=${G}` : G;
  }
  const x = q(() => e.installedDep ? bt(e.installedDep) : ""), E = j(""), R = j(!1), T = j(null), N = j(!1), A = j(!1), K = j(null), H = j(null), P = j(null), B = q(() => (T.value?.graph || []).filter((G) => G.direct || G.module === e.component)), c = q(() => (T.value?.graph || []).filter((G) => !G.direct && G.module !== e.component)), J = q(() => Mi(T.value?.graph || [])), m = q(() => {
    const G = [], pe = (ue, _e) => {
      for (const V of ue)
        G.push({ ...V, level: _e }), pe(V.children, _e + 1);
    };
    return pe(J.value, 0), G;
  }), w = q(() => T.value?.module_count || T.value?.graph?.length || 0), O = q(() => (T.value?.graph || []).reduce((G, pe) => G + (pe.size_bytes || 0), 0));
  function ae(G) {
    return Fi(G, { currentVersion: x.value, targetModule: e.component });
  }
  const v = yr({ props: e, hub: n, plan: T, activeSection: s, versionArg: S, requirementPayload: _t, invalidatePlan: _, refreshPlan: $t, planCurrent: A }), {
    pendingSuggestions: I,
    pendingCount: z,
    acceptSuggestions: F,
    rejectSuggestions: Q,
    editSuggestions: ee,
    displayValue: ne,
    requirements: ce,
    requirementGroups: ze,
    rootRequirements: be,
    transitiveRequirementCount: Ne,
    parameterValues: De,
    editableRequirements: vt,
    missingRequirements: Ke,
    boundRequirementCount: gt,
    autoFitCount: Pt,
    aiResolvableCount: Mt,
    aiResolving: we,
    aiResolutionNotice: qt,
    resolveRequirementsWithAI: nt,
    highlightTick: qe,
    setParameter: yt,
    requirementValue: ot,
    requirementMissing: Ge,
    requirementReadOnly: Be,
    requirementOptions: Te,
    typeInvalidRequirements: Se,
    requirementTypeInvalid: We,
    requirementTypeHint: Ze,
    canAutoFitRequirement: Et,
    autoFitRequirement: it,
    autoFitRequirements: Ye,
    loadInstalledParameterHints: Re,
    applyPlan: Tt,
    resetRequirements: $,
    abortAI: L
  } = v, D = j("up"), U = j([]), Z = q(() => U.value.length > 0), X = q({
    get: () => Z.value ? "up" : D.value,
    set: (G) => {
      D.value = G;
    }
  }), re = q(() => Z.value ? [jn[0]] : jn), ge = q(() => T.value?.migrations || []), st = q(() => T.value?.dependency?.id || T.value?.install_payload?.id || ""), Ft = kr({ props: e, hub: n, plan: T, planCurrent: A, versionArg: S }), {
    scan: de,
    acknowledged: Fe,
    criticalConfirmed: at,
    softFindings: kt,
    unacknowledgedSoft: wt,
    acknowledge: fe,
    acknowledgeAllSoft: Ae,
    resetScanForPlan: lt,
    runScanNow: Xe,
    skipScan: nn,
    cancelScan: Vt
  } = Ft, Ct = q(() => {
    const G = N.value || we.value ? { tone: "loading" } : z.value ? { tone: "warn", badge: String(z.value) } : Ke.value.length || Se.value.length ? { tone: "danger", badge: String(Ke.value.length + Se.value.length) } : ce.value.length ? { tone: "ok" } : { tone: "none" }, pe = {
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
      modules: N.value ? { tone: "loading" } : T.value ? { tone: "none", badge: String(w.value) } : { tone: "none" },
      requirements: G,
      scan: { tone: pe, badge: de.value.findings.length ? String(de.value.findings.length) : void 0 },
      review: ge.value.length ? { tone: "none", badge: String(ge.value.length) } : { tone: "none" }
    };
  }), Pe = j(!1), je = j(!1), rt = j(null), ut = j(null), ke = j(null), dt = j(null), on = q(() => Hn(rt.value || dt.value)), It = j(""), ct = j(0);
  let pt = null, Je = null, ve = 0, Qe = 0, me = 0;
  function Gt() {
    It.value = "", ct.value = 0;
    const G = Date.now();
    pt = setInterval(() => {
      ct.value = Math.floor((Date.now() - G) / 1e3);
    }, 250);
    try {
      const pe = qi("keeper.hub", (ue) => {
        const _e = wr[Sr(ue)];
        _e && (It.value = _e);
      });
      Je = typeof pe == "function" ? pe : null;
    } catch {
      Je = null;
    }
  }
  function $e() {
    if (pt && (clearInterval(pt), pt = null), Je) {
      try {
        Je();
      } catch {
      }
      Je = null;
    }
  }
  function _t() {
    const G = [], pe = [];
    for (const ue of vt.value) {
      const _e = le(ue);
      if (!_e) continue;
      const V = De.value[_e], se = typeof V == "string" ? V.trim() : V;
      if (se == null || se === "") continue;
      (xn(ue, e.component) ? pe : G).push({ name: _e, value: se });
    }
    return {
      parameters: G.length ? G : void 0,
      requirement_bindings: pe.length ? pe : void 0
    };
  }
  function Dt(G, pe) {
    const ue = Ko?.toast;
    typeof ue == "function" && ue({ severity: G === "ok" ? "success" : "error", summary: pe });
  }
  async function xt(G) {
    if (!n || !e.component || !A.value || T.value?.applicable === !1 || z.value || we.value) return;
    const pe = ++me, ue = () => pe === me && e.open;
    G ? je.value = !0 : Pe.value = !0, rt.value = null, ke.value = null, ut.value = null, dt.value = null, G || Gt();
    let _e = !1;
    try {
      const V = await n.install({
        component: e.component,
        version: S(),
        id: e.mode === "update" && e.currentId ? e.currentId : void 0,
        dry_run: G || void 0,
        migration_policy: X.value,
        ..._t()
      });
      if (!ue()) return;
      if (V.success !== !0) throw new Nt("INSTALL_INCOMPLETE", "Keeper does not confirm a successful install.", void 0, V);
      if (G || await Vi(n, U.value, {
        isCurrent: ue,
        onPhase: (se) => {
          It.value = se;
        }
      }), !ue()) return;
      if (rt.value = V, !G) {
        const se = e.mode === "update" ? "updated" : "installed";
        Dt("ok", `Module ${se}: ${V.dependency?.id || e.component}`), Qn(), _e = !0;
      }
    } catch (V) {
      if (!ue()) return;
      tt("install:run", V), V instanceof Nt && (ke.value = V.code, dt.value = V.details), ut.value = Le(V, G ? "preview failed" : "install failed"), Dt("error", ut.value);
    } finally {
      pe === me && (G ? je.value = !1 : (Pe.value = !1, $e()));
    }
    _e && t("changed");
  }
  const Ce = q(() => !T.value || K.value ? "modules" : z.value || we.value || Ke.value.length || Se.value.length || !A.value || T.value.applicable === !1 || ce.value.some((G) => G.invalid) ? "requirements" : de.value.status === "idle" || de.value.status === "scanning" || de.value.status === "critical" && !at.value || wt.value.length ? "scan" : null), Bt = q(() => Pe.value || je.value || N.value || !T.value || !!K.value || !A.value || z.value > 0 || we.value || de.value.status === "scanning" || s.value === "scan" && de.value.status === "idle"), Rt = q(() => {
    if (z.value) return `Review ${z.value} AI suggestion${z.value === 1 ? "" : "s"}`;
    if (we.value) return "Resolving settings…";
    if (!A.value) return "Validating settings…";
    const G = Ke.value.length;
    return G ? `${G} required setting${G === 1 ? "" : "s"} missing` : "Review requirement errors";
  }), Wt = q(() => Pe.value || je.value || N.value || !T.value || !!K.value || !A.value || z.value > 0 || we.value), mt = q(() => Pe.value ? e.mode === "update" ? "Updating…" : "Installing…" : Ce.value === "scan" && de.value.status === "idle" ? s.value === "scan" ? "Choose scan option" : "Review scan choice" : Ce.value === "scan" && s.value === "scan" && (de.value.status === "warnings" || de.value.status === "critical") ? "Install anyway" : e.mode === "update" ? "Update" : "Install");
  function Zt() {
    if (Bt.value) return;
    const G = Ce.value;
    if (G === "requirements") {
      s.value = "requirements", qe.value++;
      return;
    }
    if (G === "scan") {
      if (s.value !== "scan") {
        s.value = "scan";
        return;
      }
      if (de.value.status === "idle" || de.value.status === "scanning" || de.value.status === "critical" && !at.value || (Ae(), Ce.value)) return;
    }
    if (G === "modules") {
      s.value = "modules";
      return;
    }
    xt(!1);
  }
  function St() {
    if (!A.value || T.value?.applicable === !1 || z.value || we.value || ce.value.some((G) => G.invalid) || Ke.value.length || Se.value.length) {
      s.value = "requirements", qe.value++;
      return;
    }
    s.value = "review", xt(!0);
  }
  async function $t() {
    if (!n || !e.component) return;
    Ie && (clearTimeout(Ie), Ie = null);
    const G = ++ve;
    A.value = !1, N.value = !0, K.value = null, H.value = null, P.value = null;
    const pe = { ...De.value };
    try {
      const ue = await n.planInstall({
        component: e.component,
        version: S(),
        id: e.mode === "update" && e.currentId ? e.currentId : void 0,
        run_migrations: X.value === "up",
        ..._t()
      });
      if (G !== ve || !e.open) return;
      const _e = Ti(ue.requirements || []);
      U.value = _e, Tt(ue, pe), A.value = !0, lt(ue.graph || []);
    } catch (ue) {
      if (G !== ve || !e.open) return;
      tt("install:plan", ue), T.value = null, de.value = eo(), K.value = Le(ue, "failed to plan install"), ue instanceof Nt && (H.value = ue.code, P.value = ue.details);
    } finally {
      G === ve && (N.value = !1);
    }
  }
  let Ie = null;
  function _() {
    ve++, A.value = !1, L(), b();
  }
  function b() {
    Ie && clearTimeout(Ie), Ie = setTimeout(() => {
      $t();
    }, 350);
  }
  async function He() {
    if (p.value = [], !(!n || !e.component)) {
      h.value = !0;
      try {
        const G = await n.listVersions(e.component);
        p.value = G.items || [];
      } catch (G) {
        tt("install:versions", G);
      } finally {
        h.value = !1;
      }
    }
  }
  async function Dn() {
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
  function Bn() {
    ve++, s.value = "overview", T.value = null, A.value = !1, U.value = [], Pe.value = !1, je.value = !1, K.value = null, H.value = null, P.value = null, X.value = "up", rt.value = null, ut.value = null, ke.value = null, dt.value = null, $(), lt(), E.value = "", p.value = [];
  }
  async function _n() {
    const G = ++Qe;
    Bn(), i.value = e.mode === "update" ? "" : e.version || "", r.value = "track", await Promise.all([He(), Dn(), Re()]), !(!e.open || G !== Qe) && (e.mode === "update" && !i.value && p.value.length && (i.value = String(p.value[0].version || "")), await $t());
  }
  Ue(() => e.open, (G) => {
    if (G) {
      _n();
      return;
    }
    L(), $e(), me++, Pe.value = !1, je.value = !1, Qe++, ve++, Vt(), Ie && (clearTimeout(Ie), Ie = null);
  }, { immediate: !0 }), Ue([i, r], () => {
    e.open && n && _();
  }, { flush: "sync" }), Ue(X, () => {
    e.open && n && T.value && _();
  }, { flush: "sync" }), io(() => {
    me++, L(), $e(), Qe++, ve++, Vt(), Ie && clearTimeout(Ie);
  });
  function jt() {
    L(), me++, Pe.value = !1, je.value = !1, $e(), t("close");
  }
  return {
    // nav
    activeSection: s,
    sectionStatus: Ct,
    blockingSection: Ce,
    // version
    version: i,
    versionMode: r,
    versionOptions: g,
    versionsLoading: h,
    versionMeta: k,
    currentVersion: x,
    // overview
    readme: E,
    readmeLoading: R,
    // plan
    plan: T,
    planCurrent: A,
    planLoading: N,
    planError: K,
    planCode: H,
    planErrorDetails: P,
    directModules: B,
    transitiveModules: c,
    planTree: J,
    planRows: m,
    moduleCount: w,
    totalSize: O,
    badgesForNode: ae,
    // requirements
    requirements: ce,
    requirementGroups: ze,
    rootRequirements: be,
    editableRequirements: vt,
    transitiveRequirementCount: Ne,
    parameterValues: De,
    missingRequirements: Ke,
    boundRequirementCount: gt,
    autoFitCount: Pt,
    aiResolvableCount: Mt,
    aiResolving: we,
    aiResolutionNotice: qt,
    resolveRequirementsWithAI: nt,
    pendingSuggestions: I,
    pendingCount: z,
    acceptSuggestions: F,
    rejectSuggestions: Q,
    editSuggestions: ee,
    displayValue: ne,
    highlightTick: qe,
    setParameter: yt,
    requirementValue: ot,
    requirementMissing: Ge,
    requirementReadOnly: Be,
    requirementOptions: Te,
    requirementConfiguredBy: Ei,
    typeInvalidRequirements: Se,
    requirementTypeInvalid: We,
    requirementTypeHint: Ze,
    canAutoFitRequirement: Et,
    autoFitRequirement: it,
    autoFitRequirements: Ye,
    // review / options
    requiredSetup: Z,
    migrationPolicy: X,
    migrationOptions: re,
    migrations: ge,
    destinationId: st,
    INSTALL_MIGRATION_OPTIONS: jn,
    // scan
    scan: de,
    acknowledged: Fe,
    criticalConfirmed: at,
    softFindings: kt,
    unacknowledgedSoft: wt,
    acknowledge: fe,
    acknowledgeAllSoft: Ae,
    runScanNow: Xe,
    skipScan: nn,
    // execution
    running: Pe,
    dryRunning: je,
    result: rt,
    resultError: ut,
    resultCode: ke,
    resultErrorDetails: dt,
    resultExecution: on,
    executionStepLabel: Ro,
    progressPhase: It,
    elapsedSec: ct,
    requirementStatusMessage: Rt,
    primaryDisabled: Bt,
    previewDisabled: Wt,
    primaryLabel: mt,
    primaryAction: Zt,
    preview: St,
    refreshPlan: $t,
    close: jt
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
}, mu = { class: "km-sec-title" }, fu = {
  key: 0,
  class: "km-dim"
}, bu = {
  key: 1,
  class: "km-tree-spacer",
  "aria-hidden": "true"
}, hu = { class: "km-mrow-badge kx-tag-caps" }, vu = { class: "km-mrow-name km-mono" }, gu = {
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
}, $u = { class: "km-sec-title" }, Cu = { class: "km-dim" }, Iu = { class: "km-req-toolbar" }, _u = ["disabled"], xu = ["disabled"], Ou = {
  key: 0,
  class: "km-code"
}, Lu = {
  key: 1,
  class: "km-code"
}, zu = {
  key: 2,
  class: "km-mono"
}, Au = {
  key: 1,
  class: "km-req-toolbar",
  role: "status"
}, Pu = { class: "km-grow" }, Mu = ["disabled"], Eu = ["disabled"], Tu = { class: "km-req-group-head" }, Fu = { class: "km-mono" }, Vu = {
  key: 0,
  class: "km-dim"
}, Du = { class: "km-req-meta" }, Bu = { class: "km-mono km-req-name" }, Ru = {
  key: 0,
  class: "km-req-flag"
}, ju = {
  key: 1,
  class: "km-chip km-mono"
}, Hu = ["onClick"], Uu = ["aria-label", "disabled", "value", "list", "placeholder", "onInput"], Nu = ["id"], Ku = ["value", "title"], qu = {
  key: 1,
  class: "km-readonly-field km-mono"
}, Gu = { class: "km-req-foot" }, Wu = {
  key: 0,
  class: "km-req-src"
}, Zu = {
  key: 1,
  class: "km-req-invalid"
}, Yu = {
  key: 2,
  class: "km-req-invalid"
}, Xu = {
  key: 3,
  class: "km-req-info"
}, Ju = {
  key: 4,
  class: "km-req-info"
}, Qu = ["aria-label"], ed = { class: "km-mono" }, td = { class: "km-row-gap" }, nd = ["disabled", "onClick"], od = ["onClick"], id = ["onClick"], sd = {
  key: 3,
  class: "km-msg km-msg-err",
  role: "alert"
}, ad = { class: "km-code" }, ld = { key: 0 }, rd = {
  key: 4,
  class: "km-req-desc"
}, ud = { class: "km-sec" }, dd = { class: "km-sec-title" }, cd = {
  key: 0,
  class: "km-scan-run"
}, pd = ["disabled"], md = {
  key: 1,
  class: "km-msg km-msg-info"
}, fd = ["disabled"], bd = {
  key: 2,
  class: "km-scan-run"
}, hd = { class: "km-grow" }, vd = {
  key: 3,
  class: "km-empty-inline"
}, gd = {
  key: 4,
  class: "km-msg km-msg-err"
}, yd = ["disabled"], kd = {
  key: 5,
  class: "km-msg km-msg-info"
}, wd = ["disabled"], Sd = {
  key: 0,
  class: "km-scan-overall"
}, $d = {
  key: 1,
  class: "km-msg km-msg-err"
}, Cd = { class: "km-scan-mod-head" }, Id = { class: "km-mono km-scan-mod-name" }, _d = { class: "km-chip" }, xd = {
  key: 0,
  class: "km-scan-mod-sum"
}, Od = { class: "km-grow km-min0" }, Ld = { class: "km-finding-head" }, zd = { class: "km-finding-title" }, Ad = {
  key: 0,
  class: "km-finding-detail"
}, Pd = {
  key: 1,
  class: "km-finding-loc km-mono"
}, Md = ["onClick"], Ed = {
  key: 1,
  class: "km-dim km-scan-mod-clean"
}, Td = {
  key: 2,
  class: "km-check km-mt"
}, Fd = { class: "km-sec" }, Vd = { class: "km-sec-title" }, Dd = { class: "km-review-grid" }, Bd = { class: "km-review-tile" }, Rd = { class: "km-review-tile" }, jd = { class: "km-review-tile" }, Hd = { class: "km-review-tile" }, Ud = { class: "km-field" }, Nd = {
  key: 0,
  class: "km-hint"
}, Kd = {
  key: 1,
  class: "km-mig-list"
}, qd = { class: "km-mono km-trunc" }, Gd = { class: "km-chip" }, Wd = { class: "km-hint" }, Zd = { class: "km-adv" }, Yd = { class: "km-adv-body" }, Xd = { class: "km-meta-row" }, Jd = { class: "km-mono" }, Qd = { class: "km-meta-row" }, ec = { class: "km-mono" }, tc = {
  key: 0,
  class: "km-panel km-panel-ok"
}, nc = { class: "km-panel-title" }, oc = {
  key: 0,
  class: "km-dim"
}, ic = {
  key: 1,
  class: "km-dim"
}, sc = {
  key: 0,
  class: "km-dim"
}, ac = { class: "km-mono" }, lc = {
  key: 1,
  class: "km-dim"
}, rc = {
  key: 2,
  class: "km-dim"
}, uc = {
  key: 1,
  class: "km-ledger"
}, dc = { class: "km-ledger-step" }, cc = { class: "km-grow" }, pc = { class: "km-chip" }, mc = {
  key: 0,
  class: "km-ledger-msg"
}, fc = {
  key: 2,
  class: "km-msg km-msg-err"
}, bc = {
  key: 0,
  class: "km-code"
}, hc = {
  key: 0,
  class: "km-running km-2p-progress"
}, vc = { class: "km-grow km-running-label" }, gc = { class: "km-dim" }, yc = {
  key: 0,
  class: "km-foot-note"
}, kc = ["disabled"], wc = ["disabled"], Sc = ["disabled"], $c = /* @__PURE__ */ tn({
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
    const n = e, i = $r(n, t), r = [
      { key: "overview", label: "Overview", icon: "tabler:info-circle" },
      { key: "modules", label: "Modules", icon: "tabler:hierarchy-2" },
      { key: "requirements", label: "Requirements", icon: "tabler:adjustments" },
      { key: "scan", label: "Security scan", icon: "tabler:shield-check" },
      { key: "review", label: "Review & install", icon: "tabler:checklist" }
    ], p = q(() => n.catalogItem || { full_name: n.component, component: n.component }), h = q(() => pn(p.value)), g = q(() => n.mode === "update" ? "Update module" : "Install module");
    function k(B) {
      const c = i.requirementOptions(B), J = i.requirementValue(B);
      return J && !c.some((m) => m.value === J) ? [{ label: `${J} (current)`, value: J }, ...c] : c;
    }
    function S(B) {
      return `km-req-options-${le(B).replace(/[^a-zA-Z0-9_-]/g, "-")}`;
    }
    function x(B) {
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
    io(() => clearTimeout(T)), Ue(() => i.highlightTick.value, async (B, c, J) => {
      let m = !0;
      if (J(() => {
        m = !1;
      }), i.activeSection.value !== "requirements" || (await bn(), !m)) return;
      E.value?.querySelector(".km-req.is-missing, .km-req.is-invalid")?.scrollIntoView({ block: "center", behavior: "smooth" }), R.value = !0, clearTimeout(T), T = setTimeout(() => {
        R.value = !1;
      }, 1200);
    });
    function N(B) {
      return Po[B.severity].tone;
    }
    function A(B) {
      return B === "critical" || B === "error" ? "km-dot-danger" : B === "warnings" ? "km-dot-warn" : "km-dot-ok";
    }
    function K(B) {
      return `km-plan-badge kx-tag-caps km-plan-badge-${B}`;
    }
    function H(B) {
      return B === "failed" || B === "rollback_failed" ? "km-ledger-bad" : B === "rolled_back" ? "km-ledger-warn" : "km-ledger-ok";
    }
    const P = q(() => i.progressPhase.value || (n.mode === "update" ? "Updating…" : "Installing…"));
    return so(() => {
      No("wc-render-markdown", { timeoutMs: 8e3 }).catch(() => {
      });
    }), (B, c) => {
      const J = xe("wc-render-markdown");
      return l(), ye(Wl, {
        visible: e.open,
        busy: o(i).running.value || o(i).dryRunning.value,
        label: g.value,
        class: "km-dialog km-dialog-2p",
        "header-class": "km-modal-head km-2p-head",
        "content-class": "km-dialog-content km-dialog-content-2p",
        "footer-class": "km-modal-foot km-2p-foot",
        style: Kt({ "--accent": h.value }),
        onClose: c[19] || (c[19] = (m) => o(i).close())
      }, {
        header: he(() => [
          a("span", Cr, [
            y(o(C), {
              icon: o(en)(p.value),
              "aria-hidden": "true"
            }, null, 8, ["icon"])
          ]),
          a("span", Ir, [
            a("span", _r, d(g.value), 1),
            a("span", xr, [
              M(d(o(Qt)(p.value)) + " ", 1),
              a("span", Or, d(n.component), 1)
            ])
          ])
        ]),
        footer: he(() => [
          o(i).running.value ? (l(), u("div", hc, [
            y(o(C), {
              icon: "tabler:loader-2",
              class: "km-i spin km-accent",
              "aria-hidden": "true"
            }),
            a("span", vc, d(P.value), 1),
            a("span", gc, d(o(i).elapsedSec.value) + "s", 1)
          ])) : (l(), u(Y, { key: 1 }, [
            o(i).blockingSection.value === "requirements" ? (l(), u("span", yc, [
              y(o(C), {
                icon: "tabler:alert-triangle",
                class: "km-i-sm",
                "aria-hidden": "true"
              }),
              M(" " + d(o(i).requirementStatusMessage.value), 1)
            ])) : f("", !0),
            o(i).blockingSection.value === "requirements" ? (l(), u("button", {
              key: 1,
              class: "km-btn km-btn-secondary km-btn-outlined km-btn-sm",
              disabled: o(i).autoFitCount.value === 0,
              onClick: c[15] || (c[15] = (m) => o(i).autoFitRequirements())
            }, [
              y(o(C), {
                icon: "tabler:wand",
                class: "km-i",
                "aria-hidden": "true"
              }),
              c[69] || (c[69] = M(" Auto-fit ", -1))
            ], 8, kc)) : f("", !0),
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
              y(o(C), {
                icon: o(i).dryRunning.value ? "tabler:loader-2" : "tabler:eye",
                class: te(["km-i", o(i).dryRunning.value && "spin"]),
                "aria-hidden": "true"
              }, null, 8, ["icon", "class"]),
              c[70] || (c[70] = M(" Preview changes ", -1))
            ], 8, wc),
            a("button", {
              class: "km-btn km-btn-sm",
              disabled: o(i).primaryDisabled.value,
              onClick: c[18] || (c[18] = (m) => o(i).primaryAction())
            }, [
              y(o(C), {
                icon: n.mode === "update" ? "tabler:refresh-dot" : "tabler:download",
                class: "km-i",
                "aria-hidden": "true"
              }, null, 8, ["icon"]),
              M(" " + d(o(i).primaryLabel.value), 1)
            ], 8, Sc)
          ], 64))
        ]),
        default: he(() => [
          a("div", Lr, [
            a("nav", zr, [
              (l(), u(Y, null, ie(r, (m) => a("button", {
                key: m.key,
                class: te(["km-2p-navitem", { active: o(i).activeSection.value === m.key }]),
                onClick: (w) => o(i).activeSection.value = m.key
              }, [
                y(o(C), {
                  icon: m.icon,
                  class: "km-i",
                  "aria-hidden": "true"
                }, null, 8, ["icon"]),
                a("span", Pr, d(m.label), 1),
                a("span", Mr, [
                  o(i).sectionStatus.value[m.key].tone === "loading" ? (l(), ye(o(C), {
                    key: 0,
                    icon: "tabler:loader-2",
                    class: "km-i-sm spin km-dim",
                    "aria-hidden": "true"
                  })) : o(i).sectionStatus.value[m.key].tone === "ok" ? (l(), ye(o(C), {
                    key: 1,
                    icon: "tabler:circle-check-filled",
                    class: "km-i-sm km-sev-ok-fg",
                    "aria-hidden": "true"
                  })) : o(i).sectionStatus.value[m.key].tone === "danger" ? (l(), u("span", Er)) : o(i).sectionStatus.value[m.key].tone === "warn" ? (l(), u("span", Tr)) : f("", !0),
                  o(i).sectionStatus.value[m.key].badge ? (l(), u("span", Fr, d(o(i).sectionStatus.value[m.key].badge), 1)) : f("", !0)
                ])
              ], 10, Ar)), 64))
            ]),
            a("div", {
              ref_key: "mainRef",
              ref: E,
              class: "km-2p-main"
            }, [
              Ve(a("section", Vr, [
                a("div", Dr, [
                  a("span", Br, [
                    y(o(C), {
                      icon: o(en)(p.value),
                      class: "km-i-lg",
                      "aria-hidden": "true"
                    }, null, 8, ["icon"])
                  ]),
                  a("div", Rr, [
                    a("div", jr, [
                      a("span", Hr, d(o(Qt)(p.value)), 1),
                      o(un)(p.value) ? (l(), u("span", Ur, "app")) : f("", !0),
                      p.value.deprecated ? (l(), u("span", Nr, "deprecated")) : f("", !0)
                    ]),
                    a("div", Kr, d(n.component), 1)
                  ])
                ]),
                p.value.description ? (l(), u("p", qr, d(p.value.description), 1)) : f("", !0),
                n.mode === "update" && !n.currentId ? (l(), u("p", Gr, " Updating this module creates an application root dependency for the selected version. This version also applies to modules that depend on it; the plan shows any conflicts. ")) : f("", !0),
                a("div", Wr, [
                  c[21] || (c[21] = a("label", { class: "km-label" }, "Version", -1)),
                  y(Ao, {
                    modelValue: o(i).version.value,
                    "onUpdate:modelValue": c[0] || (c[0] = (m) => o(i).version.value = m),
                    items: o(i).versionOptions.value.map((m) => ({ id: m.value, title: m.label })),
                    placeholder: "latest",
                    "aria-label": "Version"
                  }, null, 8, ["modelValue", "items"]),
                  a("div", Zr, [
                    a("button", {
                      class: te(["km-seg-btn", { active: o(i).versionMode.value === "pin" }]),
                      "aria-pressed": o(i).versionMode.value === "pin",
                      onClick: c[1] || (c[1] = (m) => o(i).versionMode.value = "pin")
                    }, [
                      y(o(C), {
                        icon: "tabler:pin",
                        class: "km-i-sm",
                        "aria-hidden": "true"
                      }),
                      M(" Pin " + d(o(i).version.value || "latest"), 1)
                    ], 10, Yr),
                    a("button", {
                      class: te(["km-seg-btn", { active: o(i).versionMode.value === "track" }]),
                      "aria-pressed": o(i).versionMode.value === "track",
                      onClick: c[2] || (c[2] = (m) => o(i).versionMode.value = "track")
                    }, [
                      y(o(C), {
                        icon: "tabler:arrow-up-circle",
                        class: "km-i-sm",
                        "aria-hidden": "true"
                      }),
                      c[20] || (c[20] = M(" Track updates ", -1))
                    ], 10, Xr)
                  ]),
                  a("p", Jr, d(o(i).versionMode.value === "pin" ? "Locks to this exact version; future updates are manual." : `Tracks ${o(i).version.value ? "≥ " + o(i).version.value : "all"} releases on the next resolve.`), 1)
                ]),
                a("div", Qr, [
                  a("div", eu, [
                    y(o(C), {
                      icon: "tabler:download",
                      class: "km-i-sm",
                      "aria-hidden": "true"
                    }),
                    c[22] || (c[22] = a("span", null, "Downloads", -1)),
                    a("b", null, d(o(mn)(p.value.total_downloads)), 1)
                  ]),
                  p.value.favorites_count ? (l(), u("div", tu, [
                    y(o(C), {
                      icon: "tabler:star",
                      class: "km-i-sm",
                      "aria-hidden": "true"
                    }),
                    c[23] || (c[23] = a("span", null, "Favorites", -1)),
                    a("b", null, d(p.value.favorites_count), 1)
                  ])) : f("", !0),
                  p.value.license ? (l(), u("div", nu, [
                    y(o(C), {
                      icon: "tabler:license",
                      class: "km-i-sm",
                      "aria-hidden": "true"
                    }),
                    c[24] || (c[24] = a("span", null, "License", -1)),
                    a("b", {
                      title: p.value.license
                    }, d(o(Tn)(p.value.license)), 9, ou)
                  ])) : f("", !0),
                  p.value.type ? (l(), u("div", iu, [
                    y(o(C), {
                      icon: "tabler:category",
                      class: "km-i-sm",
                      "aria-hidden": "true"
                    }),
                    c[25] || (c[25] = a("span", null, "Type", -1)),
                    a("b", null, d(p.value.type), 1)
                  ])) : f("", !0),
                  o(i).versionMeta.value?.entry_count ? (l(), u("div", su, [
                    y(o(C), {
                      icon: "tabler:list-numbers",
                      class: "km-i-sm",
                      "aria-hidden": "true"
                    }),
                    c[26] || (c[26] = a("span", null, "Entries", -1)),
                    a("b", null, d(o(i).versionMeta.value.entry_count), 1)
                  ])) : f("", !0),
                  o(i).versionMeta.value?.size_bytes ? (l(), u("div", au, [
                    y(o(C), {
                      icon: "tabler:weight",
                      class: "km-i-sm",
                      "aria-hidden": "true"
                    }),
                    c[27] || (c[27] = a("span", null, "Size", -1)),
                    a("b", null, d(o(dn)(o(i).versionMeta.value.size_bytes)), 1)
                  ])) : f("", !0),
                  p.value.update_time ? (l(), u("div", lu, [
                    y(o(C), {
                      icon: "tabler:clock",
                      class: "km-i-sm",
                      "aria-hidden": "true"
                    }),
                    c[28] || (c[28] = a("span", null, "Updated", -1)),
                    a("b", null, d(o(Fn)(p.value.update_time, { maxUnit: "year" })), 1)
                  ])) : f("", !0)
                ]),
                o(i).readmeLoading.value ? (l(), u("div", ru, [
                  y(o(C), {
                    icon: "tabler:loader-2",
                    class: "km-i spin",
                    "aria-hidden": "true"
                  }),
                  c[29] || (c[29] = M(" Loading README…", -1))
                ])) : o(i).readme.value ? (l(), u("article", uu, [
                  y(J, {
                    source: o(i).readme.value
                  }, null, 8, ["source"])
                ])) : f("", !0)
              ], 512), [
                [ln, o(i).activeSection.value === "overview"]
              ]),
              Ve(a("section", du, [
                o(i).planLoading.value ? (l(), u(Y, { key: 0 }, [
                  c[30] || (c[30] = a("div", {
                    class: "km-skel km-skel-line",
                    style: { width: "40%" }
                  }, null, -1)),
                  (l(), u(Y, null, ie(4, (m) => a("div", {
                    class: "km-skel km-skel-card",
                    key: m
                  })), 64))
                ], 64)) : o(i).planError.value ? (l(), u("div", cu, [
                  o(i).planCode.value ? (l(), u("span", pu, d(o(i).planCode.value), 1)) : f("", !0),
                  M(d(o(i).planError.value), 1)
                ])) : o(i).plan.value ? (l(), u(Y, { key: 2 }, [
                  a("div", mu, [
                    y(o(C), {
                      icon: "tabler:hierarchy-2",
                      class: "km-i km-accent",
                      "aria-hidden": "true"
                    }),
                    M(" Installs " + d(o(i).moduleCount.value) + " module" + d(o(i).moduleCount.value === 1 ? "" : "s") + " ", 1),
                    o(i).totalSize.value ? (l(), u("span", fu, "· " + d(o(dn)(o(i).totalSize.value)), 1)) : f("", !0)
                  ]),
                  c[32] || (c[32] = a("p", { class: "km-hint" }, "The module plus its full dependency chain (ns.dependency), resolved to these versions.", -1)),
                  (l(!0), u(Y, null, ie(o(i).planRows.value, (m) => (l(), u("div", {
                    key: m.path || m.module,
                    class: te(["km-mrow", { "km-mrow-direct": m.direct || m.module === n.component, "km-mrow-transitive": !(m.direct || m.module === n.component) }]),
                    style: Kt({ "--tree-level": m.level })
                  }, [
                    m.level > 0 ? (l(), ye(o(C), {
                      key: 0,
                      icon: "tabler:corner-down-right",
                      class: "km-i-sm km-dim",
                      "aria-hidden": "true"
                    })) : (l(), u("span", bu)),
                    a("span", hu, d(m.direct || m.module === n.component ? "direct" : "transitive"), 1),
                    a("span", vu, d(m.module), 1),
                    m.version ? (l(), u("span", gu, d(m.version), 1)) : f("", !0),
                    m.constraint ? (l(), u("span", yu, d(m.constraint), 1)) : f("", !0),
                    c[31] || (c[31] = a("span", { class: "km-grow" }, null, -1)),
                    (l(!0), u(Y, null, ie(o(i).badgesForNode(m), (w) => (l(), u("span", {
                      key: w.label,
                      class: te(K(w.tone))
                    }, d(w.label), 3))), 128)),
                    m.size_bytes ? (l(), u("span", ku, d(o(dn)(m.size_bytes)), 1)) : f("", !0)
                  ], 6))), 128))
                ], 64)) : f("", !0)
              ], 512), [
                [ln, o(i).activeSection.value === "modules"]
              ]),
              Ve(a("section", wu, [
                o(i).planLoading.value ? (l(), u(Y, { key: 0 }, [
                  c[33] || (c[33] = a("div", {
                    class: "km-skel km-skel-line",
                    style: { width: "30%" }
                  }, null, -1)),
                  (l(), u(Y, null, ie(3, (m) => a("div", {
                    class: "km-skel km-skel-field",
                    key: m
                  })), 64))
                ], 64)) : o(i).requirements.value.length ? (l(), u(Y, { key: 2 }, [
                  a("div", $u, [
                    y(o(C), {
                      icon: "tabler:adjustments",
                      class: "km-i km-accent",
                      "aria-hidden": "true"
                    }),
                    c[35] || (c[35] = M(" Configuration ", -1)),
                    a("span", Cu, "(" + d(o(i).boundRequirementCount.value) + "/" + d(o(i).requirements.value.length) + " set)", 1)
                  ]),
                  a("div", Iu, [
                    c[37] || (c[37] = a("p", { class: "km-hint km-grow" }, "Bind root requirements to host resources. Transitive requirements are shown for review and are configured by their owning module.", -1)),
                    o(i).aiResolvableCount.value ? (l(), u("button", {
                      key: 0,
                      class: "km-btn km-btn-secondary km-btn-outlined km-btn-sm",
                      disabled: o(i).aiResolving.value || !o(i).planCurrent.value,
                      onClick: c[3] || (c[3] = (m) => o(i).resolveRequirementsWithAI(E.value))
                    }, [
                      y(o(C), {
                        icon: o(i).aiResolving.value ? "tabler:loader-2" : "tabler:sparkles",
                        class: te(["km-i", o(i).aiResolving.value && "spin"]),
                        "aria-hidden": "true"
                      }, null, 8, ["icon", "class"]),
                      M(" " + d(o(i).aiResolving.value ? "Resolving…" : "Resolve with AI"), 1)
                    ], 8, _u)) : f("", !0),
                    o(i).missingRequirements.value.length ? (l(), u("button", {
                      key: 1,
                      class: "km-btn km-btn-secondary km-btn-outlined km-btn-sm",
                      disabled: o(i).autoFitCount.value === 0,
                      onClick: c[4] || (c[4] = (m) => o(i).autoFitRequirements())
                    }, [
                      y(o(C), {
                        icon: "tabler:wand",
                        class: "km-i",
                        "aria-hidden": "true"
                      }),
                      c[36] || (c[36] = M(" Auto-fit ", -1))
                    ], 8, xu)) : f("", !0)
                  ]),
                  o(i).aiResolutionNotice.value ? (l(), u("div", {
                    key: 0,
                    class: te(["km-msg", o(i).aiResolutionNotice.value.tone === "success" ? "km-msg-ok" : "km-msg-warn"]),
                    role: "status"
                  }, [
                    o(i).aiResolutionNotice.value.code ? (l(), u("span", Ou, d(o(i).aiResolutionNotice.value.code), 1)) : f("", !0),
                    o(i).aiResolutionNotice.value.kind ? (l(), u("span", Lu, d(o(i).aiResolutionNotice.value.kind), 1)) : f("", !0),
                    M(" " + d(o(i).aiResolutionNotice.value.message) + " ", 1),
                    o(i).aiResolutionNotice.value.details ? (l(), u("pre", zu, d(JSON.stringify(o(i).aiResolutionNotice.value.details, null, 2)), 1)) : f("", !0)
                  ], 2)) : f("", !0),
                  o(i).pendingCount.value ? (l(), u("div", Au, [
                    a("span", Pu, "Review " + d(o(i).pendingCount.value) + " AI suggestion" + d(o(i).pendingCount.value === 1 ? "" : "s") + " before applying.", 1),
                    a("button", {
                      class: "km-btn km-btn-sm",
                      disabled: !o(i).planCurrent.value,
                      onClick: c[5] || (c[5] = (m) => o(i).acceptSuggestions(Object.keys(o(i).pendingSuggestions.value)))
                    }, "Accept all", 8, Mu),
                    a("button", {
                      class: "km-btn km-btn-secondary km-btn-sm",
                      onClick: c[6] || (c[6] = (m) => o(i).rejectSuggestions(Object.keys(o(i).pendingSuggestions.value)))
                    }, "Reject all"),
                    a("button", {
                      class: "km-btn km-btn-secondary km-btn-sm",
                      disabled: !o(i).planCurrent.value,
                      onClick: c[7] || (c[7] = (m) => o(i).editSuggestions(Object.keys(o(i).pendingSuggestions.value)))
                    }, "Edit all", 8, Eu)
                  ])) : f("", !0),
                  (l(!0), u(Y, null, ie(o(i).requirementGroups.value, (m) => (l(), u("div", {
                    key: m.module,
                    class: "km-req-group"
                  }, [
                    a("div", Tu, [
                      y(o(C), {
                        icon: m.direct ? "tabler:package" : "tabler:corner-down-right",
                        class: "km-i-sm",
                        "aria-hidden": "true"
                      }, null, 8, ["icon"]),
                      a("span", Fu, d(m.module), 1),
                      m.direct ? f("", !0) : (l(), u("span", Vu, "dependency"))
                    ]),
                    (l(!0), u(Y, null, ie(m.items, (w) => (l(), u("div", {
                      key: o(le)(w),
                      class: te(["km-req", { "is-missing": o(i).requirementMissing(w), "is-invalid": o(i).requirementTypeInvalid(w), "is-flash": R.value && (o(i).requirementMissing(w) || o(i).requirementTypeInvalid(w)) }])
                    }, [
                      a("div", Du, [
                        a("span", Bu, d(w.name || o(le)(w)), 1),
                        w.required || w.missing ? (l(), u("span", Ru, "required")) : f("", !0),
                        w.expected_kind ? (l(), u("span", ju, d(w.expected_kind), 1)) : f("", !0),
                        c[39] || (c[39] = a("span", { class: "km-grow" }, null, -1)),
                        o(i).requirementMissing(w) && o(i).canAutoFitRequirement(w) ? (l(), u("button", {
                          key: 2,
                          class: "km-btn km-btn-secondary km-btn-outlined km-btn-sm km-req-fit",
                          onClick: (O) => o(i).autoFitRequirement(w)
                        }, [
                          y(o(C), {
                            icon: "tabler:wand",
                            class: "km-i-sm",
                            "aria-hidden": "true"
                          }),
                          c[38] || (c[38] = M(" Auto-fit ", -1))
                        ], 8, Hu)) : f("", !0)
                      ]),
                      o(i).requirementReadOnly(w) ? (l(), u("div", qu, d(o(i).requirementValue(w) || o(i).displayValue(w.default) || "not set"), 1)) : (l(), u(Y, { key: 0 }, [
                        a("input", {
                          class: "km-input km-w-full",
                          "aria-label": w.name || o(le)(w),
                          disabled: o(i).running.value || o(i).dryRunning.value,
                          value: o(i).requirementValue(w),
                          list: k(w).length ? S(w) : void 0,
                          placeholder: o(i).displayValue(w.default) || (w.expected_kind ? `Enter ${w.expected_kind} id` : "Enter registry id or value"),
                          onInput: (O) => o(i).setParameter(w, O.target.value)
                        }, null, 40, Uu),
                        k(w).length ? (l(), u("datalist", {
                          key: 0,
                          id: S(w)
                        }, [
                          (l(!0), u(Y, null, ie(k(w), (O) => (l(), u("option", {
                            key: O.value,
                            value: O.value,
                            title: O.title
                          }, d(O.label), 9, Ku))), 128))
                        ], 8, Nu)) : f("", !0)
                      ], 64)),
                      a("div", Gu, [
                        x(w) ? (l(), u("span", Wu, [
                          y(o(C), {
                            icon: "tabler:wand",
                            class: "km-i-xs",
                            "aria-hidden": "true"
                          }),
                          M(" " + d(x(w)), 1)
                        ])) : f("", !0),
                        o(i).requirementTypeInvalid(w) ? (l(), u("span", Zu, [
                          y(o(C), {
                            icon: "tabler:alert-triangle",
                            class: "km-i-xs",
                            "aria-hidden": "true"
                          }),
                          M(" " + d(o(i).requirementTypeHint(w)), 1)
                        ])) : w.invalid ? (l(), u("span", Yu, [
                          y(o(C), {
                            icon: "tabler:alert-triangle",
                            class: "km-i-xs",
                            "aria-hidden": "true"
                          }),
                          M(" " + d(w.invalid_reason || "invalid value"), 1)
                        ])) : f("", !0),
                        o(i).requirementMissing(w) && !o(i).canAutoFitRequirement(w) ? (l(), u("span", Xu, [
                          y(o(C), {
                            icon: "tabler:hand-click",
                            class: "km-i-xs",
                            "aria-hidden": "true"
                          }),
                          c[40] || (c[40] = M(" choose a value to continue ", -1))
                        ])) : f("", !0),
                        o(i).requirementReadOnly(w) ? (l(), u("span", Ju, [
                          y(o(C), {
                            icon: "tabler:lock",
                            class: "km-i-xs",
                            "aria-hidden": "true"
                          }),
                          M(" configured by " + d(o(i).requirementConfiguredBy(w)) + "; install it directly to override ", 1)
                        ])) : f("", !0)
                      ]),
                      o(i).pendingSuggestions.value[o(le)(w)] ? (l(), u("div", {
                        key: 2,
                        class: "km-ai-proposal",
                        role: "group",
                        "aria-label": `AI suggestion for ${w.name || o(le)(w)}`
                      }, [
                        a("div", ed, "Suggested value: " + d(o(i).displayValue(o(i).pendingSuggestions.value[o(le)(w)].value)), 1),
                        a("p", null, d(o(i).pendingSuggestions.value[o(le)(w)].choice_reason), 1),
                        a("div", td, [
                          a("button", {
                            class: "km-btn km-btn-sm",
                            disabled: !o(i).planCurrent.value,
                            onClick: (O) => o(i).acceptSuggestions([o(le)(w)])
                          }, "Accept", 8, nd),
                          a("button", {
                            class: "km-btn km-btn-secondary km-btn-sm",
                            onClick: (O) => o(i).rejectSuggestions([o(le)(w)])
                          }, "Reject", 8, od),
                          a("button", {
                            class: "km-btn km-btn-secondary km-btn-sm",
                            onClick: (O) => o(i).editSuggestions([o(le)(w)])
                          }, "Edit", 8, id)
                        ])
                      ], 8, Qu)) : f("", !0),
                      w.resolution_error ? (l(), u("div", sd, [
                        a("span", ad, d(w.resolution_error.kind || w.resolution_error.code), 1),
                        M(" " + d(w.resolution_error.message) + " ", 1),
                        w.resolution_error.details ? (l(), u("pre", ld, d(JSON.stringify(w.resolution_error.details, null, 2)), 1)) : f("", !0)
                      ])) : f("", !0),
                      w.description ? (l(), u("div", rd, d(w.description), 1)) : f("", !0)
                    ], 2))), 128))
                  ]))), 128))
                ], 64)) : (l(), u("div", Su, [
                  y(o(C), {
                    icon: "tabler:circle-check",
                    class: "km-i-lg km-sev-ok-fg",
                    "aria-hidden": "true"
                  }),
                  c[34] || (c[34] = a("p", null, "Nothing to configure — this module binds no host resources.", -1))
                ]))
              ], 512), [
                [ln, o(i).activeSection.value === "requirements"]
              ]),
              Ve(a("section", ud, [
                a("div", dd, [
                  y(o(C), {
                    icon: "tabler:shield-check",
                    class: "km-i km-accent",
                    "aria-hidden": "true"
                  }),
                  c[41] || (c[41] = M(" Security scan", -1))
                ]),
                c[54] || (c[54] = a("p", { class: "km-hint" }, "An agent reviews the code of every module being installed. Heuristic, not a guarantee — review flagged items before proceeding.", -1)),
                o(i).scan.value.status === "idle" ? (l(), u("div", cd, [
                  y(o(C), {
                    icon: "tabler:shield-question",
                    class: "km-i km-accent",
                    "aria-hidden": "true"
                  }),
                  c[44] || (c[44] = a("span", { class: "km-grow" }, "Security scan not run. Running the reviewer may spend LLM tokens.", -1)),
                  a("button", {
                    class: "km-btn km-btn-secondary km-btn-outlined km-btn-sm",
                    onClick: c[8] || (c[8] = (m) => o(i).skipScan())
                  }, [
                    y(o(C), {
                      icon: "tabler:player-skip-forward",
                      class: "km-i",
                      "aria-hidden": "true"
                    }),
                    c[42] || (c[42] = M(" Skip scan ", -1))
                  ]),
                  a("button", {
                    class: "km-btn km-btn-sm",
                    disabled: !o(i).planCurrent.value,
                    onClick: c[9] || (c[9] = (m) => o(i).runScanNow())
                  }, [
                    y(o(C), {
                      icon: "tabler:shield-check",
                      class: "km-i",
                      "aria-hidden": "true"
                    }),
                    c[43] || (c[43] = M(" Run scan ", -1))
                  ], 8, pd)
                ])) : o(i).scan.value.status === "skipped" ? (l(), u("div", md, [
                  y(o(C), {
                    icon: "tabler:shield-off",
                    class: "km-i",
                    "aria-hidden": "true"
                  }),
                  c[46] || (c[46] = M(" Security scan skipped. Install can continue without spending reviewer tokens. ", -1)),
                  a("button", {
                    class: "km-btn km-btn-secondary km-btn-outlined km-btn-sm km-mt",
                    disabled: !o(i).planCurrent.value,
                    onClick: c[10] || (c[10] = (m) => o(i).runScanNow())
                  }, [
                    y(o(C), {
                      icon: "tabler:shield-check",
                      class: "km-i",
                      "aria-hidden": "true"
                    }),
                    c[45] || (c[45] = M(" Run scan", -1))
                  ], 8, fd)
                ])) : o(i).scan.value.status === "scanning" ? (l(), u("div", bd, [
                  y(o(C), {
                    icon: "tabler:loader-2",
                    class: "km-i spin km-accent",
                    "aria-hidden": "true"
                  }),
                  a("span", hd, [
                    M("Scanning " + d(o(i).scan.value.total || "") + " module" + d(o(i).scan.value.total === 1 ? "" : "s") + "… ", 1),
                    c[47] || (c[47] = a("span", { class: "km-dim" }, "this can take a moment", -1))
                  ])
                ])) : o(i).scan.value.status === "clean" ? (l(), u("div", vd, [
                  y(o(C), {
                    icon: "tabler:shield-check-filled",
                    class: "km-i-lg km-sev-ok-fg",
                    "aria-hidden": "true"
                  }),
                  a("p", null, "No issues found across " + d(o(i).scan.value.scanned) + " module" + d(o(i).scan.value.scanned === 1 ? "" : "s") + ".", 1)
                ])) : o(i).scan.value.status === "error" ? (l(), u("div", gd, [
                  M(" Scan failed: " + d(o(i).scan.value.error) + " ", 1),
                  a("button", {
                    class: "km-btn km-btn-secondary km-btn-outlined km-btn-sm km-mt",
                    disabled: !o(i).planCurrent.value,
                    onClick: c[11] || (c[11] = (m) => o(i).runScanNow())
                  }, [
                    y(o(C), {
                      icon: "tabler:refresh",
                      class: "km-i",
                      "aria-hidden": "true"
                    }),
                    c[48] || (c[48] = M(" Retry", -1))
                  ], 8, yd)
                ])) : o(i).scan.value.status === "unavailable" ? (l(), u("div", kd, [
                  y(o(C), {
                    icon: "tabler:shield-off",
                    class: "km-i",
                    "aria-hidden": "true"
                  }),
                  c[50] || (c[50] = M(" Security scan unavailable ", -1)),
                  a("button", {
                    class: "km-btn km-btn-secondary km-btn-outlined km-btn-sm km-mt",
                    disabled: !o(i).planCurrent.value,
                    onClick: c[12] || (c[12] = (m) => o(i).runScanNow())
                  }, [
                    y(o(C), {
                      icon: "tabler:refresh",
                      class: "km-i",
                      "aria-hidden": "true"
                    }),
                    c[49] || (c[49] = M(" Retry", -1))
                  ], 8, wd)
                ])) : (l(), u(Y, { key: 6 }, [
                  o(i).scan.value.summary ? (l(), u("p", Sd, d(o(i).scan.value.summary), 1)) : f("", !0),
                  o(i).scan.value.status === "critical" ? (l(), u("div", $d, [
                    y(o(C), {
                      icon: "tabler:shield-x",
                      class: "km-i",
                      "aria-hidden": "true"
                    }),
                    c[51] || (c[51] = M(" Critical findings must be reviewed and confirmed before install.", -1))
                  ])) : f("", !0),
                  (l(!0), u(Y, null, ie(o(i).scan.value.modules, (m) => (l(), u("div", {
                    key: m.module,
                    class: "km-scan-mod"
                  }, [
                    a("div", Cd, [
                      a("span", {
                        class: te(["km-dot", A(m.status)]),
                        "aria-hidden": "true"
                      }, null, 2),
                      a("span", Id, [
                        M(d(m.module), 1),
                        m.version ? (l(), u(Y, { key: 0 }, [
                          M("@" + d(m.version), 1)
                        ], 64)) : f("", !0)
                      ]),
                      c[52] || (c[52] = a("span", { class: "km-grow" }, null, -1)),
                      a("span", _d, d(m.status), 1)
                    ]),
                    m.summary ? (l(), u("p", xd, d(m.summary), 1)) : f("", !0),
                    (l(!0), u(Y, null, ie(m.findings, (w) => (l(), u("div", {
                      key: w.id,
                      class: te(["km-finding", `km-sev-${N(w)}`])
                    }, [
                      y(o(C), {
                        icon: o(Po)[w.severity].icon,
                        class: "km-i km-finding-icon",
                        "aria-hidden": "true"
                      }, null, 8, ["icon"]),
                      a("div", Od, [
                        a("div", Ld, [
                          a("span", zd, d(w.title), 1)
                        ]),
                        w.detail ? (l(), u("div", Ad, d(w.detail), 1)) : f("", !0),
                        w.location ? (l(), u("div", Pd, d(w.location), 1)) : f("", !0),
                        w.severity !== "critical" ? (l(), u("button", {
                          key: 2,
                          class: te(["km-ack", { done: o(i).acknowledged.value.has(w.id) }]),
                          onClick: (O) => o(i).acknowledge(w)
                        }, [
                          y(o(C), {
                            icon: o(i).acknowledged.value.has(w.id) ? "tabler:check" : "tabler:eye",
                            class: "km-i-xs",
                            "aria-hidden": "true"
                          }, null, 8, ["icon"]),
                          M(" " + d(o(i).acknowledged.value.has(w.id) ? "Acknowledged" : "Acknowledge"), 1)
                        ], 10, Md)) : f("", !0)
                      ])
                    ], 2))), 128)),
                    m.findings.length ? f("", !0) : (l(), u("p", Ed, "No issues in this module."))
                  ]))), 128)),
                  o(i).scan.value.status === "critical" ? (l(), u("label", Td, [
                    Ve(a("input", {
                      type: "checkbox",
                      "onUpdate:modelValue": c[13] || (c[13] = (m) => o(i).criticalConfirmed.value = m)
                    }, null, 512), [
                      [Ni, o(i).criticalConfirmed.value]
                    ]),
                    c[53] || (c[53] = a("span", null, "I understand the critical findings and want to install anyway.", -1))
                  ])) : f("", !0)
                ], 64))
              ], 512), [
                [ln, o(i).activeSection.value === "scan"]
              ]),
              Ve(a("section", Fd, [
                a("div", Vd, [
                  y(o(C), {
                    icon: "tabler:checklist",
                    class: "km-i km-accent",
                    "aria-hidden": "true"
                  }),
                  c[55] || (c[55] = M(" Review & install", -1))
                ]),
                a("div", Dd, [
                  a("div", Bd, [
                    y(o(C), {
                      icon: "tabler:package",
                      class: "km-i km-accent",
                      "aria-hidden": "true"
                    }),
                    a("b", null, d(o(i).moduleCount.value), 1),
                    c[56] || (c[56] = a("span", null, "modules", -1))
                  ]),
                  a("div", Rd, [
                    y(o(C), {
                      icon: "tabler:adjustments",
                      class: "km-i km-accent",
                      "aria-hidden": "true"
                    }),
                    a("b", null, d(o(i).boundRequirementCount.value) + "/" + d(o(i).requirements.value.length), 1),
                    c[57] || (c[57] = a("span", null, "configured", -1))
                  ]),
                  a("div", jd, [
                    y(o(C), {
                      icon: "tabler:database",
                      class: "km-i km-accent",
                      "aria-hidden": "true"
                    }),
                    a("b", null, d(o(i).migrations.value.length), 1),
                    c[58] || (c[58] = a("span", null, "migrations", -1))
                  ]),
                  a("div", Hd, [
                    y(o(C), {
                      icon: o(i).scan.value.status === "clean" ? "tabler:shield-check" : o(i).scan.value.status === "critical" ? "tabler:shield-x" : o(i).scan.value.status === "skipped" ? "tabler:shield-off" : "tabler:shield",
                      class: "km-i km-accent",
                      "aria-hidden": "true"
                    }, null, 8, ["icon"]),
                    a("b", null, d(o(i).scan.value.status === "scanning" ? "…" : o(i).scan.value.status === "skipped" || o(i).scan.value.status === "idle" ? "—" : o(i).scan.value.findings.length), 1),
                    c[59] || (c[59] = a("span", null, "scan findings", -1))
                  ])
                ]),
                a("div", Ud, [
                  c[62] || (c[62] = a("label", { class: "km-label" }, "Migration policy", -1)),
                  y(Ao, {
                    modelValue: o(i).migrationPolicy.value,
                    "onUpdate:modelValue": c[14] || (c[14] = (m) => o(i).migrationPolicy.value = m),
                    items: o(i).migrationOptions.value.map((m) => ({ id: m.value, title: m.label })),
                    "aria-label": "Migration policy"
                  }, null, 8, ["modelValue", "items"]),
                  o(i).requiredSetup.value ? (l(), u("p", Nd, "This module requires setup. Installation completes after migrations and setup pass verification.")) : f("", !0),
                  o(i).migrations.value.length ? (l(), u("div", Kd, [
                    (l(!0), u(Y, null, ie(o(i).migrations.value, (m) => (l(), u("div", {
                      key: m.id,
                      class: "km-mig-row"
                    }, [
                      y(o(C), {
                        icon: "tabler:database-import",
                        class: "km-i-xs km-dim",
                        "aria-hidden": "true"
                      }),
                      a("span", qd, d(m.id), 1),
                      c[60] || (c[60] = a("span", { class: "km-grow" }, null, -1)),
                      a("span", Gd, d(m.status), 1)
                    ]))), 128))
                  ])) : f("", !0),
                  a("p", Wd, [
                    y(o(C), {
                      icon: "tabler:shield-lock",
                      class: "km-i-xs",
                      "aria-hidden": "true"
                    }),
                    c[61] || (c[61] = M(" Changes are transactional — if any step fails, the registry, lock and migrations are rolled back.", -1))
                  ])
                ]),
                a("details", Zd, [
                  c[65] || (c[65] = a("summary", null, "Advanced", -1)),
                  a("div", Yd, [
                    a("div", Xd, [
                      c[63] || (c[63] = a("span", null, "Installs as", -1)),
                      a("b", Jd, d(o(i).destinationId.value || "—"), 1)
                    ]),
                    a("div", Qd, [
                      c[64] || (c[64] = a("span", null, "Version", -1)),
                      a("b", ec, d(o(i).versionMode.value === "pin" ? o(i).version.value || "latest" : "≥ " + (o(i).version.value || "0.0.0")), 1)
                    ])
                  ])
                ]),
                o(i).result.value ? (l(), u("div", tc, [
                  a("div", nc, d(o(i).result.value.dry_run ? "Dry-run preview" : "Applied"), 1),
                  o(i).result.value.dry_run ? (l(), u(Y, { key: 0 }, [
                    c[66] || (c[66] = a("div", { class: "km-dim" }, "No changes were applied.", -1)),
                    o(i).resultExecution.value.length ? (l(), u("div", oc, d(o(i).resultExecution.value.length) + " planned step" + d(o(i).resultExecution.value.length === 1 ? "" : "s") + " below.", 1)) : (l(), u("div", ic, "Keeper accepted the dry-run but returned no execution details."))
                  ], 64)) : (l(), u(Y, { key: 1 }, [
                    o(i).result.value.apply?.stage || o(i).result.value.operation_id ? (l(), u("div", sc, [
                      o(i).result.value.apply?.stage ? (l(), u(Y, { key: 0 }, [
                        M("stage: " + d(o(i).result.value.apply.stage), 1)
                      ], 64)) : f("", !0),
                      o(i).result.value.apply?.stage && o(i).result.value.operation_id ? (l(), u(Y, { key: 1 }, [
                        M(" · ")
                      ], 64)) : f("", !0),
                      o(i).result.value.operation_id ? (l(), u(Y, { key: 2 }, [
                        c[67] || (c[67] = M("op: ", -1)),
                        a("code", ac, d(o(i).result.value.operation_id), 1)
                      ], 64)) : f("", !0)
                    ])) : (l(), u("div", lc, "Changes applied successfully.")),
                    o(i).result.value.apply?.message ? (l(), u("div", rc, d(o(i).result.value.apply.message), 1)) : f("", !0)
                  ], 64))
                ])) : f("", !0),
                o(i).resultExecution.value.length ? (l(), u("div", uc, [
                  c[68] || (c[68] = a("div", { class: "km-panel-title" }, "Execution ledger", -1)),
                  (l(!0), u(Y, null, ie(o(i).resultExecution.value, (m, w) => (l(), u("div", {
                    key: `${m.step}-${w}`,
                    class: te(["km-ledger-row", H(m.status)])
                  }, [
                    a("span", dc, d(w + 1), 1),
                    a("span", cc, d(o(i).executionStepLabel(m)), 1),
                    a("span", pc, d(m.status), 1),
                    m.message ? (l(), u("span", mc, d(m.message), 1)) : f("", !0)
                  ], 2))), 128))
                ])) : f("", !0),
                o(i).resultError.value ? (l(), u("div", fc, [
                  o(i).resultCode.value ? (l(), u("span", bc, d(o(i).resultCode.value), 1)) : f("", !0),
                  M(d(o(i).resultError.value), 1)
                ])) : f("", !0)
              ], 512), [
                [ln, o(i).activeSection.value === "review"]
              ])
            ], 512)
          ])
        ]),
        _: 1
      }, 8, ["visible", "busy", "label", "style"]);
    };
  }
}), Cc = { class: "d-hero" }, Ic = { class: "d-hero-icon" }, _c = { class: "km-grow km-min0" }, xc = { class: "km-row-wrap" }, Oc = { class: "d-hero-name" }, Lc = { class: "d-ver" }, zc = {
  key: 0,
  class: "badge-app kx-tag-caps"
}, Ac = {
  key: 1,
  class: "badge-installed kx-tag-caps"
}, Pc = {
  key: 2,
  class: "badge-private kx-tag-caps",
  title: "Private Hub module"
}, Mc = {
  key: 3,
  class: "badge-warn kx-tag-caps"
}, Ec = { class: "d-hero-org" }, Tc = {
  key: 0,
  class: "d-hero-desc"
}, Fc = { class: "d-hero-actions" }, Vc = ["title"], Dc = ["title"], Bc = ["href"], Rc = ["href"], jc = { class: "d-grid" }, Hc = { class: "d-side" }, Uc = { class: "d-block" }, Nc = { class: "d-row" }, Kc = { class: "d-row-v" }, qc = {
  key: 0,
  class: "d-row"
}, Gc = { class: "d-row-v" }, Wc = {
  key: 1,
  class: "d-row"
}, Zc = ["title"], Yc = {
  key: 2,
  class: "d-row"
}, Xc = { class: "d-row-v" }, Jc = {
  key: 3,
  class: "d-row"
}, Qc = {
  key: 4,
  class: "d-row"
}, ep = { class: "d-row-v" }, tp = {
  key: 5,
  class: "d-row"
}, np = { class: "d-row-v" }, op = {
  key: 6,
  class: "d-row"
}, ip = { class: "d-row-v" }, sp = {
  key: 0,
  class: "d-block"
}, ap = { class: "km-pills" }, lp = {
  key: 1,
  class: "d-block"
}, rp = { class: "km-dep-list" }, up = { class: "km-trunc" }, dp = { class: "km-dim" }, cp = {
  key: 2,
  class: "d-block"
}, pp = { class: "km-pills" }, mp = { class: "d-main" }, fp = { class: "d-tabs" }, bp = ["disabled"], hp = {
  key: 0,
  class: "km-dim"
}, vp = { class: "d-tab-body" }, gp = {
  key: 0,
  class: "km-loading"
}, yp = {
  key: 0,
  class: "d-empty"
}, kp = {
  key: 1,
  class: "rm"
}, wp = {
  key: 2,
  class: "km-stack-lg"
}, Sp = { key: 0 }, $p = { class: "d-block-title d-accent" }, Cp = { class: "km-dim" }, Ip = { class: "km-2col" }, _p = { class: "d-field-i" }, xp = { class: "km-grow km-min0" }, Op = { class: "d-cfg-name" }, Lp = {
  key: 0,
  class: "d-cfg-desc"
}, zp = { key: 1 }, Ap = { class: "d-block-title" }, Pp = { class: "km-2col" }, Mp = { class: "d-field-i d-field-i-req" }, Ep = { class: "km-grow km-min0" }, Tp = { class: "d-cfg-name" }, Fp = {
  key: 0,
  class: "d-cfg-desc"
}, Vp = { class: "d-field-i d-field-i-req" }, Dp = { class: "km-grow km-min0" }, Bp = { class: "d-cfg-name" }, Rp = {
  key: 0,
  class: "d-cfg-desc"
}, jp = {
  key: 1,
  class: "d-cfg-desc km-mono"
}, Hp = { class: "d-block-title" }, Up = { key: 0 }, Np = { class: "d-sub" }, Kp = { class: "km-pills" }, qp = {
  key: 1,
  class: "km-muted"
}, Gp = {
  key: 1,
  class: "km-muted"
}, Wp = {
  key: 2,
  class: "km-stack"
}, Zp = { class: "km-group-head" }, Yp = { class: "km-dim" }, Xp = { class: "km-2col" }, Jp = { class: "d-entry-name" }, Qp = { class: "d-entry-id" }, em = {
  key: 0,
  class: "km-muted"
}, tm = {
  key: 1,
  class: "d-vers"
}, nm = { class: "d-ver-tag" }, om = {
  key: 0,
  class: "km-dim"
}, im = {
  key: 1,
  class: "km-dim km-inline"
}, sm = {
  key: 2,
  class: "km-dim"
}, am = /* @__PURE__ */ tn({
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
      detailInstall: S,
      closeDetail: x,
      versionMeta: E,
      detailTab: R,
      detailReadme: T,
      detailLoading: N,
      detailVersions: A,
      envVars: K,
      requirements: H,
      entryIcon: P,
      entryName: B,
      entryDesc: c,
      detailGroups: J
    } = t.page, m = q(() => t.page.selected.value);
    return (w, O) => {
      const ae = xe("wc-render-markdown");
      return l(), u("div", {
        class: "d-page",
        style: Kt({ "--accent": o(n) ? o(pn)(o(n)) : "var(--p-primary-color)" })
      }, [
        a("button", {
          class: "d-back",
          onClick: O[0] || (O[0] = //@ts-ignore
          (...v) => o(x) && o(x)(...v))
        }, [
          y(o(C), {
            icon: "tabler:arrow-left",
            class: "km-i-sm",
            "aria-hidden": "true"
          }),
          O[7] || (O[7] = M(" Back to modules ", -1))
        ]),
        a("header", Cc, [
          a("div", Ic, [
            y(o(C), {
              icon: o(n) ? o(en)(o(n)) : "tabler:package",
              class: "km-i-lg",
              "aria-hidden": "true"
            }, null, 8, ["icon"])
          ]),
          a("div", _c, [
            a("div", xc, [
              a("h2", Oc, d(m.value.label), 1),
              a("span", Lc, d(m.value.version || "—"), 1),
              o(un)(o(n)) ? (l(), u("span", zc, "app")) : f("", !0),
              m.value.installed ? (l(), u("span", Ac, "installed")) : f("", !0),
              o(s) ? (l(), u("span", Pc, [
                y(o(C), {
                  icon: "tabler:lock",
                  class: "km-i-xs",
                  "aria-hidden": "true"
                }),
                O[8] || (O[8] = M(" private", -1))
              ])) : f("", !0),
              o(n)?.deprecated ? (l(), u("span", Mc, "deprecated")) : f("", !0)
            ]),
            a("div", Ec, d(m.value.component), 1),
            m.value.description ? (l(), u("p", Tc, d(m.value.description), 1)) : f("", !0),
            a("div", Fc, [
              m.value.installed ? (l(), u(Y, { key: 0 }, [
                o(i) ? (l(), u("button", {
                  key: 0,
                  class: "km-btn km-btn-secondary km-btn-outlined km-btn-sm",
                  onClick: O[1] || (O[1] = //@ts-ignore
                  (...v) => o(g) && o(g)(...v))
                }, [
                  y(o(C), {
                    icon: "tabler:refresh-dot",
                    class: "km-i",
                    "aria-hidden": "true"
                  }),
                  O[9] || (O[9] = M(" Update ", -1))
                ])) : (l(), u("button", {
                  key: 1,
                  class: "km-btn km-btn-secondary km-btn-outlined km-btn-sm",
                  disabled: "",
                  title: o(r) || void 0
                }, [
                  y(o(C), {
                    icon: "tabler:refresh-off",
                    class: "km-i",
                    "aria-hidden": "true"
                  }),
                  O[10] || (O[10] = M(" Update ", -1))
                ], 8, Vc)),
                o(p) ? (l(), u("button", {
                  key: 2,
                  class: "km-btn km-btn-text km-btn-danger km-btn-sm",
                  onClick: O[2] || (O[2] = //@ts-ignore
                  (...v) => o(k) && o(k)(...v))
                }, [
                  y(o(C), {
                    icon: "tabler:trash",
                    class: "km-i",
                    "aria-hidden": "true"
                  }),
                  O[11] || (O[11] = M(" Uninstall ", -1))
                ])) : o(h) ? (l(), u("button", {
                  key: 3,
                  class: "km-btn km-btn-text km-btn-danger km-btn-sm",
                  disabled: "",
                  title: o(h)
                }, [
                  y(o(C), {
                    icon: "tabler:trash-off",
                    class: "km-i",
                    "aria-hidden": "true"
                  }),
                  O[12] || (O[12] = M(" Uninstall ", -1))
                ], 8, Dc)) : f("", !0)
              ], 64)) : (l(), u("button", {
                key: 1,
                class: "km-btn km-btn-sm",
                onClick: O[3] || (O[3] = //@ts-ignore
                (...v) => o(S) && o(S)(...v))
              }, [
                y(o(C), {
                  icon: "tabler:download",
                  class: "km-i",
                  "aria-hidden": "true"
                }),
                O[13] || (O[13] = M(" Install ", -1))
              ])),
              o(n)?.repository ? (l(), u("a", {
                key: 2,
                href: String(o(n).repository),
                target: "_blank",
                rel: "noopener",
                class: "d-link"
              }, [
                y(o(C), {
                  icon: "tabler:brand-github",
                  class: "km-i-sm",
                  "aria-hidden": "true"
                }),
                O[14] || (O[14] = M(" Repository", -1))
              ], 8, Bc)) : f("", !0),
              o(n)?.homepage ? (l(), u("a", {
                key: 3,
                href: String(o(n).homepage),
                target: "_blank",
                rel: "noopener",
                class: "d-link"
              }, [
                y(o(C), {
                  icon: "tabler:home",
                  class: "km-i-sm",
                  "aria-hidden": "true"
                }),
                O[15] || (O[15] = M(" Homepage", -1))
              ], 8, Rc)) : f("", !0)
            ])
          ])
        ]),
        a("div", jc, [
          a("aside", Hc, [
            a("section", Uc, [
              a("div", Nc, [
                y(o(C), {
                  icon: "tabler:download",
                  class: "d-row-i",
                  "aria-hidden": "true"
                }),
                O[16] || (O[16] = a("span", { class: "d-row-k" }, "Downloads", -1)),
                a("span", Kc, d(o(mn)(o(n)?.total_downloads)), 1)
              ]),
              o(n)?.favorites_count ? (l(), u("div", qc, [
                y(o(C), {
                  icon: "tabler:star",
                  class: "d-row-i",
                  "aria-hidden": "true"
                }),
                O[17] || (O[17] = a("span", { class: "d-row-k" }, "Favorites", -1)),
                a("span", Gc, d(o(n).favorites_count), 1)
              ])) : f("", !0),
              o(n)?.license ? (l(), u("div", Wc, [
                y(o(C), {
                  icon: "tabler:license",
                  class: "d-row-i",
                  "aria-hidden": "true"
                }),
                O[18] || (O[18] = a("span", { class: "d-row-k" }, "License", -1)),
                a("span", {
                  class: "d-row-v",
                  title: o(n).license
                }, d(o(Tn)(o(n).license)), 9, Zc)
              ])) : f("", !0),
              o(n)?.type ? (l(), u("div", Yc, [
                y(o(C), {
                  icon: "tabler:category",
                  class: "d-row-i",
                  "aria-hidden": "true"
                }),
                O[19] || (O[19] = a("span", { class: "d-row-k" }, "Type", -1)),
                a("span", Xc, d(o(n).type), 1)
              ])) : f("", !0),
              o(s) ? (l(), u("div", Jc, [
                y(o(C), {
                  icon: "tabler:lock",
                  class: "d-row-i",
                  "aria-hidden": "true"
                }),
                O[20] || (O[20] = a("span", { class: "d-row-k" }, "Visibility", -1)),
                O[21] || (O[21] = a("span", { class: "d-row-v" }, "Private", -1))
              ])) : f("", !0),
              o(n)?.update_time ? (l(), u("div", Qc, [
                y(o(C), {
                  icon: "tabler:clock",
                  class: "d-row-i",
                  "aria-hidden": "true"
                }),
                O[22] || (O[22] = a("span", { class: "d-row-k" }, "Updated", -1)),
                a("span", ep, d(o(Fn)(o(n).update_time, { maxUnit: "year" })), 1)
              ])) : f("", !0),
              o(E)?.entry_count ? (l(), u("div", tp, [
                y(o(C), {
                  icon: "tabler:list-numbers",
                  class: "d-row-i",
                  "aria-hidden": "true"
                }),
                O[23] || (O[23] = a("span", { class: "d-row-k" }, "Entries", -1)),
                a("span", np, d(o(E).entry_count), 1)
              ])) : f("", !0),
              o(E)?.size_bytes ? (l(), u("div", op, [
                y(o(C), {
                  icon: "tabler:weight",
                  class: "d-row-i",
                  "aria-hidden": "true"
                }),
                O[24] || (O[24] = a("span", { class: "d-row-k" }, "Size", -1)),
                a("span", ip, d(o(dn)(o(E).size_bytes)), 1)
              ])) : f("", !0)
            ]),
            (o(n)?.keywords || []).length ? (l(), u("section", sp, [
              O[25] || (O[25] = a("div", { class: "d-block-title" }, "Keywords", -1)),
              a("div", ap, [
                (l(!0), u(Y, null, ie(o(n).keywords, (v) => (l(), u("span", {
                  key: v,
                  class: "provides-pill"
                }, d(v), 1))), 128))
              ])
            ])) : f("", !0),
            (o(E)?.dependencies || []).length ? (l(), u("section", lp, [
              O[26] || (O[26] = a("div", { class: "d-block-title" }, "Dependencies", -1)),
              a("div", rp, [
                (l(!0), u(Y, null, ie(o(E).dependencies, (v, I) => (l(), u("div", {
                  key: I,
                  class: "km-dep"
                }, [
                  a("span", up, d(v.org) + "/" + d(v.name), 1),
                  a("span", dp, d(v.version_constraint), 1)
                ]))), 128))
              ])
            ])) : f("", !0),
            (o(E)?.lua_modules || []).length ? (l(), u("section", cp, [
              O[27] || (O[27] = a("div", { class: "d-block-title" }, "Lua modules", -1)),
              a("div", pp, [
                (l(!0), u(Y, null, ie(o(E).lua_modules, (v) => (l(), u("span", {
                  key: v,
                  class: "provides-pill"
                }, d(v), 1))), 128))
              ])
            ])) : f("", !0)
          ]),
          a("main", mp, [
            a("div", fp, [
              a("button", {
                class: te(["d-tab", { active: o(R) === "readme" }]),
                disabled: !o(T) && !o(N),
                onClick: O[4] || (O[4] = (v) => R.value = "readme")
              }, "Readme", 10, bp),
              a("button", {
                class: te(["d-tab", { active: o(R) === "overview" }]),
                onClick: O[5] || (O[5] = (v) => R.value = "overview")
              }, "Overview", 2),
              a("button", {
                class: te(["d-tab", { active: o(R) === "versions" }]),
                onClick: O[6] || (O[6] = (v) => R.value = "versions")
              }, [
                O[28] || (O[28] = M("Versions ", -1)),
                o(A).length ? (l(), u("span", hp, d(o(A).length), 1)) : f("", !0)
              ], 2)
            ]),
            a("div", vp, [
              o(N) ? (l(), u("div", gp, [
                y(o(C), {
                  icon: "tabler:loader-2",
                  class: "km-i spin",
                  "aria-hidden": "true"
                }),
                O[29] || (O[29] = M(" Loading… ", -1))
              ])) : o(R) === "readme" ? (l(), u(Y, { key: 1 }, [
                o(T) ? (l(), u("article", kp, [
                  y(ae, { source: o(T) }, null, 8, ["source"])
                ])) : (l(), u("div", yp, [
                  y(o(C), {
                    icon: "tabler:file-off",
                    class: "km-i-xl km-dim",
                    "aria-hidden": "true"
                  }),
                  O[30] || (O[30] = a("p", { class: "km-mt" }, "No README provided.", -1))
                ]))
              ], 64)) : o(R) === "overview" ? (l(), u("div", wp, [
                o(K).length ? (l(), u("section", Sp, [
                  a("div", $p, [
                    y(o(C), {
                      icon: "tabler:settings-2",
                      class: "km-i-sm",
                      "aria-hidden": "true"
                    }),
                    O[31] || (O[31] = M(" Environment ", -1)),
                    a("span", Cp, d(o(K).length), 1)
                  ]),
                  O[32] || (O[32] = a("p", { class: "d-sub" }, "Variables this module reads — set them in your environment.", -1)),
                  a("div", Ip, [
                    (l(!0), u(Y, null, ie(o(K), (v) => (l(), u("div", {
                      key: v.id,
                      class: "d-field d-field-env"
                    }, [
                      a("span", _p, [
                        y(o(C), {
                          icon: o(P)(v, "tabler:variable"),
                          class: "km-i",
                          "aria-hidden": "true"
                        }, null, 8, ["icon"])
                      ]),
                      a("span", xp, [
                        a("span", Op, d(o(B)(v)), 1),
                        o(c)(v) ? (l(), u("span", Lp, d(o(c)(v)), 1)) : f("", !0)
                      ])
                    ]))), 128))
                  ])
                ])) : f("", !0),
                o(H).length || (o(E)?.requirements || []).length ? (l(), u("section", zp, [
                  a("div", Ap, [
                    y(o(C), {
                      icon: "tabler:plug-connected",
                      class: "km-i-sm",
                      "aria-hidden": "true"
                    }),
                    O[33] || (O[33] = M(" Requires", -1))
                  ]),
                  O[34] || (O[34] = a("p", { class: "d-sub" }, "Host resources this module is wired to at install.", -1)),
                  a("div", Pp, [
                    o(H).length ? (l(!0), u(Y, { key: 0 }, ie(o(H), (v) => (l(), u("div", {
                      key: v.id,
                      class: "d-field d-field-req"
                    }, [
                      a("span", Mp, [
                        y(o(C), {
                          icon: "tabler:link",
                          class: "km-i",
                          "aria-hidden": "true"
                        })
                      ]),
                      a("span", Ep, [
                        a("span", Tp, d(o(B)(v)), 1),
                        o(c)(v) ? (l(), u("span", Fp, d(o(c)(v)), 1)) : f("", !0)
                      ])
                    ]))), 128)) : (l(!0), u(Y, { key: 1 }, ie(o(E).requirements, (v, I) => (l(), u("div", {
                      key: I,
                      class: "d-field d-field-req"
                    }, [
                      a("span", Vp, [
                        y(o(C), {
                          icon: "tabler:link",
                          class: "km-i",
                          "aria-hidden": "true"
                        })
                      ]),
                      a("span", Dp, [
                        a("span", Bp, d(v.name), 1),
                        v.description ? (l(), u("span", Rp, d(v.description), 1)) : f("", !0),
                        v.default ? (l(), u("span", jp, "default: " + d(v.default), 1)) : f("", !0)
                      ])
                    ]))), 128))
                  ])
                ])) : f("", !0),
                a("section", null, [
                  a("div", Hp, [
                    y(o(C), {
                      icon: "tabler:package",
                      class: "km-i-sm d-accent-i",
                      "aria-hidden": "true"
                    }),
                    O[35] || (O[35] = M(" Provides", -1))
                  ]),
                  m.value.installed ? o(J).length ? (l(), u("div", Wp, [
                    (l(!0), u(Y, null, ie(o(J), (v) => (l(), u("div", {
                      key: v.key
                    }, [
                      a("div", Zp, [
                        y(o(C), {
                          icon: v.icon,
                          class: "km-i-sm d-accent-i",
                          "aria-hidden": "true"
                        }, null, 8, ["icon"]),
                        M(" " + d(v.label) + " ", 1),
                        a("span", Yp, d(v.items.length), 1)
                      ]),
                      a("div", Xp, [
                        (l(!0), u(Y, null, ie(v.items, (I) => (l(), u("div", {
                          key: I.id,
                          class: "d-entry"
                        }, [
                          a("div", Jp, d(I.meta && I.meta.title || o(B)(I)), 1),
                          a("div", Qp, d(I.id), 1)
                        ]))), 128))
                      ])
                    ]))), 128))
                  ])) : (l(), u("p", Gp, "No registry entries.")) : (l(), u("div", Up, [
                    (o(E)?.entry_kinds || []).length ? (l(), u(Y, { key: 0 }, [
                      a("p", Np, "Publishes " + d(o(E).entry_count || o(E).entry_kinds.length) + " entries; per-entry detail resolves after install.", 1),
                      a("div", Kp, [
                        (l(!0), u(Y, null, ie(o(E).entry_kinds, (v) => (l(), u("span", {
                          key: v,
                          class: "provides-pill"
                        }, d(v), 1))), 128))
                      ])
                    ], 64)) : (l(), u("p", qp, [...O[36] || (O[36] = [
                      M("See the ", -1),
                      a("strong", null, "Readme", -1),
                      M(" tab for details.", -1)
                    ])]))
                  ]))
                ])
              ])) : (l(), u(Y, { key: 3 }, [
                o(A).length ? (l(), u("div", tm, [
                  (l(!0), u(Y, null, ie(o(A), (v) => (l(), u("div", {
                    key: v.version,
                    class: "d-ver-row"
                  }, [
                    a("span", nm, d(v.version), 1),
                    v.create_time ? (l(), u("span", om, d(o(Fn)(v.create_time, { maxUnit: "year" })), 1)) : f("", !0),
                    O[37] || (O[37] = a("span", { class: "km-grow" }, null, -1)),
                    v.download_count ? (l(), u("span", im, [
                      y(o(C), {
                        icon: "tabler:download",
                        class: "km-i-xs",
                        "aria-hidden": "true"
                      }),
                      M(" " + d(o(mn)(v.download_count)), 1)
                    ])) : f("", !0),
                    v.size_bytes ? (l(), u("span", sm, d(o(dn)(v.size_bytes)), 1)) : f("", !0)
                  ]))), 128))
                ])) : (l(), u("p", em, "No published versions."))
              ], 64))
            ])
          ])
        ])
      ], 4);
    };
  }
}), lm = { class: "km" }, rm = {
  key: 1,
  class: "km-loading km-center km-initial-loading",
  role: "status",
  "aria-live": "polite"
}, um = {
  key: 2,
  class: "km-denied"
}, dm = { class: "km-denied-box" }, cm = {
  key: 3,
  class: "km-scroll"
}, pm = {
  key: 1,
  class: "km-list"
}, mm = { class: "km-sec-bar km-sec-bar-toolbar" }, fm = { class: "km-controls" }, bm = ["disabled"], hm = ["disabled"], vm = ["disabled"], gm = {
  key: 0,
  class: "km-btn-count"
}, ym = ["disabled"], km = { class: "km-hub-auth-panel" }, wm = { class: "km-hub-auth-row" }, Sm = {
  key: 0,
  class: "km-hub-auth-meta"
}, $m = { class: "km-hub-auth-meta" }, Cm = {
  key: 1,
  class: "km-hub-auth-orgs"
}, Im = { class: "km-hub-auth-org-name" }, _m = {
  key: 0,
  class: "km-hub-auth-org-role"
}, xm = { class: "km-hub-auth-hint" }, Om = ["href"], Lm = { class: "km-hub-auth-actions" }, zm = ["disabled"], Am = {
  key: 0,
  class: "km-msg km-msg-err"
}, Pm = {
  key: 1,
  class: "km-msg"
}, Mm = {
  key: 2,
  class: "km-msg km-msg-err"
}, Em = {
  key: 3,
  class: "km-loading km-center"
}, Tm = { key: 0 }, Fm = { class: "hub-section-head" }, Vm = { class: "feat-grid" }, Dm = ["onClick"], Bm = { class: "feat-icon" }, Rm = { class: "feat-body" }, jm = { class: "km-row-wrap" }, Hm = { class: "feat-name" }, Um = {
  key: 0,
  class: "badge-app kx-tag-caps"
}, Nm = {
  key: 1,
  class: "badge-private kx-tag-caps",
  title: "Private Hub module"
}, Km = {
  key: 2,
  class: "badge-warn kx-tag-caps"
}, qm = { class: "feat-org" }, Gm = {
  key: 0,
  class: "feat-desc"
}, Wm = { class: "feat-meta" }, Zm = { class: "meta-pill" }, Ym = { class: "meta-pill" }, Xm = ["title"], Jm = { class: "hub-section-head" }, Qm = { class: "hub-section-title" }, ef = { class: "hub-section-sub" }, tf = { class: "mod-grid" }, nf = ["onClick"], of = { class: "mod-icon" }, sf = { class: "mod-body" }, af = { class: "km-row-wrap" }, lf = { class: "mod-name" }, rf = { class: "mod-version" }, uf = {
  key: 0,
  class: "badge-app kx-tag-caps"
}, df = {
  key: 1,
  class: "badge-private kx-tag-caps",
  title: "Private Hub module"
}, cf = {
  key: 2,
  class: "badge-warn kx-tag-caps"
}, pf = { class: "mod-org" }, mf = {
  key: 0,
  class: "mod-desc"
}, ff = { class: "mod-foot" }, bf = { class: "foot-stat" }, hf = {
  key: 0,
  class: "foot-stat"
}, vf = ["title"], gf = {
  key: 2,
  class: "foot-stat km-dim km-ml-auto"
}, yf = {
  key: 5,
  class: "km-empty"
}, kf = { class: "km-muted" }, wf = { class: "km-mono" }, Sf = {
  key: 6,
  class: "km-empty"
}, $f = {
  key: 7,
  class: "km-empty"
}, Cf = { class: "km-muted" }, If = { class: "km-mono" }, _f = {
  key: 0,
  class: "km-installed"
}, xf = ["aria-expanded"], Of = { class: "km-sub" }, Lf = {
  key: 0,
  class: "km-update-count"
}, zf = {
  key: 1,
  class: "km-update-count"
}, Af = {
  key: 0,
  class: "km-msg km-msg-err km-mb"
}, Pf = {
  key: 1,
  class: "inst-toolbar"
}, Mf = {
  key: 2,
  class: "inst-list"
}, Ef = ["onClick"], Tf = { class: "inst-icon" }, Ff = { class: "km-grow km-min0" }, Vf = { class: "km-row-tight" }, Df = { class: "inst-name" }, Bf = {
  key: 0,
  class: "badge-app kx-tag-caps"
}, Rf = {
  key: 1,
  class: "badge-private kx-tag-caps",
  title: "Private Hub module"
}, jf = {
  key: 2,
  class: "km-chip"
}, Hf = ["title"], Uf = { class: "inst-id" }, Nf = {
  key: 0,
  class: "km-dim"
}, Kf = {
  key: 0,
  class: "inst-update-msg"
}, qf = { class: "inst-ver" }, Gf = { class: "inst-migs" }, Wf = { class: "inst-actions" }, Zf = ["disabled", "aria-label", "onClick"], Yf = ["disabled", "aria-label", "onClick"], Xf = ["title", "aria-label"], Jf = ["aria-label", "onClick"], Qf = ["title", "aria-label"], eb = {
  key: 3,
  class: "km-empty inst-empty"
}, tb = { class: "km-modal-body" }, nb = { class: "km-uninstall-target" }, ob = { class: "km-mono" }, ib = { class: "km-dim" }, sb = {
  key: 0,
  class: "km-msg km-msg-err"
}, ab = {
  key: 0,
  class: "km-code"
}, lb = {
  key: 1,
  class: "km-mt"
}, rb = {
  key: 1,
  class: "km-msg km-msg-info"
}, ub = {
  key: 2,
  class: "km-running"
}, db = {
  key: 3,
  class: "km-uninstall-preview"
}, cb = {
  key: 0,
  class: "km-msg"
}, pb = {
  key: 1,
  class: "km-preview-block"
}, mb = { class: "km-mono" }, fb = { class: "km-dim" }, bb = {
  key: 2,
  class: "km-preview-block"
}, hb = { class: "km-mono" }, vb = { class: "km-dim" }, gb = {
  key: 3,
  class: "km-preview-block"
}, yb = { class: "km-mono" }, kb = { class: "km-dim" }, wb = {
  key: 4,
  class: "km-ledger"
}, Sb = { class: "km-ledger-step" }, $b = { class: "km-grow" }, Cb = { class: "km-chip" }, Ib = {
  key: 0,
  class: "km-ledger-msg"
}, _b = {
  key: 5,
  class: "km-running"
}, xb = { class: "km-grow km-running-label" }, Ob = { class: "km-dim" }, Lb = ["disabled"], zb = ["disabled"], Ab = ["disabled", "title"], Pb = /* @__PURE__ */ tn({
  __name: "modules",
  setup(e) {
    const t = ql(), {
      LABEL: n,
      HUB_PORTAL: s,
      UNINSTALL_MIGRATION_OPTIONS: i,
      initialLoading: r,
      accessDenied: p,
      statusBanner: h,
      hubConnected: g,
      hubStatus: k,
      hubToken: S,
      showTokenPanel: x,
      hubConnecting: E,
      hubError: R,
      hubOrgs: T,
      hubIdentity: N,
      hubTokenStored: A,
      hubTokenExpired: K,
      hubTokenIcon: H,
      hubTokenButtonLabel: P,
      hubExpiry: B,
      saveHubToken: c,
      clearHubToken: J,
      selected: m,
      selectedModule: w,
      detailReadme: O,
      detailLoading: ae,
      detailTab: v,
      detailVersions: I,
      envVars: z,
      requirements: F,
      detailGroups: Q,
      versionMeta: ee,
      selectedCanUpdate: ne,
      selectedUpdateDisabledReason: ce,
      selectedCanUninstall: ze,
      selectedIsPrivate: be,
      selectedUninstallBlockedReason: Ne,
      entryName: De,
      entryDesc: vt,
      entryIcon: Ke,
      openDetail: gt,
      closeDetail: Pt,
      detailInstall: Mt,
      detailUpdate: we,
      detailUninstall: qt,
      installed: nt,
      installedFilter: qe,
      installedKindFilter: yt,
      installedTotal: ot,
      updateScanLoading: Ge,
      updateAllRunning: Be,
      availableUpdates: Te,
      installedLoading: Se,
      installedError: We,
      installedOpen: Ze,
      catalog: Et,
      catalogLoading: it,
      catalogError: Ye,
      catalogInstalledTotal: Re,
      visibleCatalogInstalled: Tt,
      browseFilter: $,
      sortBy: L,
      availableItems: D,
      featured: U,
      sortedItems: Z,
      visibleInstalled: X,
      catalogItemFor: re,
      installedAccent: ge,
      installedIcon: st,
      installedIsRoot: Ft,
      installedIsPrivate: de,
      installedRole: Fe,
      installedUsedBy: at,
      installedCanUpdate: kt,
      installedUpdateDisabledReason: wt,
      installedCanUninstall: fe,
      installedUninstallDisabledReason: Ae,
      installedMigrationSummary: lt,
      updateInfoForDep: Xe,
      updateStatusLabel: nn,
      updateStatusIcon: Vt,
      updateStatusBusy: Ct,
      scanInstalledUpdates: Pe,
      updateInstalledDependency: je,
      updateAllAvailable: rt,
      refreshAll: ut,
      installTarget: ke,
      closeInstallDialog: dt,
      onInstallChanged: on,
      openUpdateDialog: It,
      uninstallDialogOpen: ct,
      uninstallDep: pt,
      uninstallPolicy: Je,
      uninstallRunning: ve,
      uninstallPreviewLoading: Qe,
      uninstallPreview: me,
      uninstallExecution: Gt,
      uninstallCode: $e,
      uninstallError: _t,
      uninstallRequiredBy: Dt,
      uninstallBlockedReason: xt,
      uninstallActionBlockedReason: Ce,
      uninstallPhase: Bt,
      uninstallElapsedSec: Rt,
      openUninstallDialog: Wt,
      previewUninstall: mt,
      executionStepLabel: Zt,
      runUninstall: St
    } = t, $t = j(null);
    return (Ie, _) => (l(), u("div", lm, [
      o(h) ? (l(), u("div", {
        key: 0,
        class: te(["km-banner", o(h).kind === "ok" ? "km-banner-ok" : "km-banner-err"])
      }, d(o(h).message), 3)) : f("", !0),
      o(r) ? (l(), u("div", rm, [
        y(o(C), {
          icon: "tabler:loader-2",
          class: "km-i spin",
          "aria-hidden": "true"
        }),
        _[19] || (_[19] = M(" Loading modules… ", -1))
      ])) : o(p) ? (l(), u("div", um, [
        a("div", dm, [
          y(o(C), {
            icon: "tabler:lock",
            class: "km-denied-icon",
            "aria-hidden": "true"
          }),
          _[20] || (_[20] = a("p", { class: "km-denied-title" }, "Admins only", -1)),
          _[21] || (_[21] = a("p", { class: "km-denied-sub" }, [
            M("You need the "),
            a("code", { class: "km-mono" }, "app.security:admin"),
            M(" scope to manage modules.")
          ], -1))
        ])
      ])) : (l(), u("div", cm, [
        o(m) ? (l(), ye(am, {
          key: 0,
          page: o(t)
        }, null, 8, ["page"])) : (l(), u("div", pm, [
          a("section", null, [
            a("div", mm, [
              a("div", fm, [
                a("button", {
                  class: "km-btn km-btn-secondary km-btn-outlined km-btn-sm",
                  disabled: o(Se) || o(it),
                  onClick: _[0] || (_[0] = //@ts-ignore
                  (...b) => o(ut) && o(ut)(...b))
                }, [
                  y(o(C), {
                    icon: o(Se) || o(it) ? "tabler:loader-2" : "tabler:refresh",
                    class: te(["km-i", (o(Se) || o(it)) && "spin"]),
                    "aria-hidden": "true"
                  }, null, 8, ["icon", "class"]),
                  _[22] || (_[22] = M(" Refresh ", -1))
                ], 8, bm),
                a("button", {
                  class: "km-btn km-btn-secondary km-btn-outlined km-btn-sm",
                  disabled: o(Ge) || o(Be) || o(Se) || o(ot) === 0,
                  onClick: _[1] || (_[1] = //@ts-ignore
                  (...b) => o(Pe) && o(Pe)(...b))
                }, [
                  y(o(C), {
                    icon: o(Ge) ? "tabler:loader-2" : "tabler:refresh-dot",
                    class: te(["km-i", o(Ge) && "spin"]),
                    "aria-hidden": "true"
                  }, null, 8, ["icon", "class"]),
                  _[23] || (_[23] = M(" Scan updates ", -1))
                ], 8, hm),
                a("button", {
                  class: "km-btn km-btn-sm",
                  disabled: o(Be) || o(Ge) || o(Te).length === 0,
                  onClick: _[2] || (_[2] = //@ts-ignore
                  (...b) => o(rt) && o(rt)(...b))
                }, [
                  y(o(C), {
                    icon: o(Be) ? "tabler:loader-2" : "tabler:download",
                    class: te(["km-i", o(Be) && "spin"]),
                    "aria-hidden": "true"
                  }, null, 8, ["icon", "class"]),
                  _[24] || (_[24] = M(" Update all ", -1)),
                  o(Te).length ? (l(), u("span", gm, d(o(Te).length), 1)) : f("", !0)
                ], 8, vm),
                Ve(a("input", {
                  "onUpdate:modelValue": _[3] || (_[3] = (b) => Ot($) ? $.value = b : null),
                  class: "km-input km-filter",
                  placeholder: "Filter…"
                }, null, 512), [
                  [Ln, o($)]
                ]),
                y(o(zn), {
                  modelValue: o(L),
                  "onUpdate:modelValue": _[4] || (_[4] = (b) => Ot(L) ? L.value = b : null),
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
                  ref: $t,
                  class: "km-hub-auth"
                }, [
                  a("button", {
                    class: te(["km-btn km-btn-sm", o(g) ? "km-btn-secondary km-btn-outlined" : o(K) ? "km-btn-warning km-btn-outlined" : ""]),
                    disabled: o(E),
                    onClick: _[5] || (_[5] = (b) => x.value = !o(x))
                  }, [
                    y(o(C), {
                      icon: o(H),
                      class: "km-i",
                      "aria-hidden": "true"
                    }, null, 8, ["icon"]),
                    M(" " + d(o(P)) + " ", 1),
                    y(o(C), {
                      icon: "tabler:chevron-down",
                      class: "km-i-sm",
                      "aria-hidden": "true"
                    })
                  ], 10, ym),
                  y(ai, {
                    open: o(x),
                    "onUpdate:open": _[10] || (_[10] = (b) => Ot(x) ? x.value = b : null),
                    anchor: $t.value,
                    align: "right",
                    width: 300
                  }, {
                    default: he(() => [
                      a("div", km, [
                        _[28] || (_[28] = a("div", { class: "km-hub-auth-title" }, "Wippy Hub token", -1)),
                        o(A) ? (l(), u("div", {
                          key: 0,
                          class: te(["km-hub-auth-active", o(K) && "is-expired"])
                        }, [
                          a("div", wm, [
                            y(o(C), {
                              icon: o(K) ? "tabler:alert-triangle" : "tabler:circle-check-filled",
                              class: te(["km-i-sm", o(K) ? "km-hub-warn" : "km-hub-ok"]),
                              "aria-hidden": "true"
                            }, null, 8, ["icon", "class"]),
                            a("span", null, [
                              M(d(o(K) ? "Token expired" : "Token active"), 1),
                              o(N) ? (l(), u(Y, { key: 0 }, [
                                _[25] || (_[25] = M(" — ", -1)),
                                a("strong", null, d(o(N)), 1)
                              ], 64)) : f("", !0)
                            ])
                          ]),
                          o(k)?.registry ? (l(), u("div", Sm, d(o(k).registry), 1)) : f("", !0),
                          a("div", $m, [
                            o(k)?.scope ? (l(), u(Y, { key: 0 }, [
                              M("scope: " + d(o(k).scope), 1)
                            ], 64)) : f("", !0),
                            o(B) ? (l(), u(Y, { key: 1 }, [
                              M(" · expires " + d(o(B)), 1)
                            ], 64)) : f("", !0)
                          ]),
                          o(T).length ? (l(), u("div", Cm, [
                            _[26] || (_[26] = a("div", { class: "km-hub-auth-orgs-label" }, "Organizations", -1)),
                            (l(!0), u(Y, null, ie(o(T), (b) => (l(), u("div", {
                              key: b.id || b.name,
                              class: "km-hub-auth-org"
                            }, [
                              y(o(C), {
                                icon: "tabler:building",
                                class: "km-i-sm",
                                "aria-hidden": "true"
                              }),
                              a("span", Im, d(b.display_name || b.name), 1),
                              b.role ? (l(), u("span", _m, d(b.role), 1)) : f("", !0)
                            ]))), 128))
                          ])) : f("", !0)
                        ], 2)) : f("", !0),
                        a("p", xm, [
                          M(d(o(A) ? "Replace the token, or" : "Paste a Hub registry token to browse and install private modules.") + " ", 1),
                          o(A) ? (l(), u(Y, { key: 0 }, [
                            M("create a new one")
                          ], 64)) : f("", !0),
                          a("a", {
                            href: o(s),
                            target: "_blank",
                            rel: "noopener"
                          }, d(o(A) ? "↗" : "Create one →"), 9, Om)
                        ]),
                        Ve(a("input", {
                          "onUpdate:modelValue": _[6] || (_[6] = (b) => Ot(S) ? S.value = b : null),
                          type: "password",
                          class: "km-input km-hub-auth-input",
                          placeholder: "wpy_…",
                          autocomplete: "off",
                          onKeyup: _[7] || (_[7] = Ki(
                            //@ts-ignore
                            (...b) => o(c) && o(c)(...b),
                            ["enter"]
                          ))
                        }, null, 544), [
                          [Ln, o(S)]
                        ]),
                        a("div", Lm, [
                          a("button", {
                            class: "km-btn km-btn-sm",
                            disabled: o(E),
                            onClick: _[8] || (_[8] = //@ts-ignore
                            (...b) => o(c) && o(c)(...b))
                          }, [
                            y(o(C), {
                              icon: o(E) ? "tabler:loader-2" : "tabler:device-floppy",
                              class: te(["km-i", o(E) && "spin"]),
                              "aria-hidden": "true"
                            }, null, 8, ["icon", "class"]),
                            M(" " + d(o(E) ? "Saving…" : o(A) ? "Replace token" : "Save token"), 1)
                          ], 8, zm),
                          o(A) ? (l(), u("button", {
                            key: 0,
                            class: "km-btn km-btn-secondary km-btn-outlined km-btn-sm",
                            onClick: _[9] || (_[9] = //@ts-ignore
                            (...b) => o(J) && o(J)(...b))
                          }, [
                            y(o(C), {
                              icon: "tabler:trash",
                              class: "km-i",
                              "aria-hidden": "true"
                            }),
                            _[27] || (_[27] = M(" Clear ", -1))
                          ])) : f("", !0)
                        ])
                      ])
                    ]),
                    _: 1
                  }, 8, ["open", "anchor"])
                ], 512)
              ])
            ]),
            o(R) ? (l(), u("div", Am, d(o(R)), 1)) : f("", !0),
            !o(g) && o(K) ? (l(), u("div", Pm, "Your Wippy Hub token is expired.")) : f("", !0),
            o(Ye) ? (l(), u("div", Mm, d(o(Ye)), 1)) : f("", !0),
            o(it) || o(Se) ? (l(), u("div", Em, [
              y(o(C), {
                icon: "tabler:loader-2",
                class: "km-i spin",
                "aria-hidden": "true"
              }),
              _[29] || (_[29] = M(" Loading modules… ", -1))
            ])) : o(D).length > 0 ? (l(), u(Y, { key: 4 }, [
              o(U).length ? (l(), u("div", Tm, [
                a("div", Fm, [
                  y(o(C), {
                    icon: "tabler:flame",
                    class: "km-i km-flame",
                    "aria-hidden": "true"
                  }),
                  _[30] || (_[30] = a("span", { class: "hub-section-title" }, "Most popular", -1)),
                  _[31] || (_[31] = a("span", { class: "hub-section-sub" }, "by downloads", -1))
                ]),
                a("div", Vm, [
                  (l(!0), u(Y, null, ie(o(U), (b) => (l(), u("button", {
                    key: "f" + o(En)(b),
                    class: "feat-card",
                    style: Kt({ "--accent": o(pn)(b) }),
                    onClick: (He) => o(gt)(b)
                  }, [
                    _[33] || (_[33] = a("span", { class: "feat-strip" }, null, -1)),
                    a("span", Bm, [
                      y(o(C), {
                        icon: o(en)(b),
                        class: "km-i-lg",
                        "aria-hidden": "true"
                      }, null, 8, ["icon"])
                    ]),
                    a("span", Rm, [
                      a("span", jm, [
                        a("span", Hm, d(o(Qt)(b)), 1),
                        o(un)(b) ? (l(), u("span", Um, "app")) : f("", !0),
                        o(cn)(b) ? (l(), u("span", Nm, [
                          y(o(C), {
                            icon: "tabler:lock",
                            class: "km-i-xs",
                            "aria-hidden": "true"
                          }),
                          _[32] || (_[32] = M(" private", -1))
                        ])) : f("", !0),
                        b.deprecated ? (l(), u("span", Km, "deprecated")) : f("", !0)
                      ]),
                      a("span", qm, d(o(Pn)(b)), 1),
                      b.description ? (l(), u("span", Gm, d(b.description), 1)) : f("", !0),
                      a("span", Wm, [
                        a("span", Zm, [
                          y(o(C), {
                            icon: "tabler:tag",
                            class: "km-i-xs",
                            "aria-hidden": "true"
                          }),
                          M(" " + d(b.latest_version || "?"), 1)
                        ]),
                        a("span", Ym, [
                          y(o(C), {
                            icon: "tabler:download",
                            class: "km-i-xs",
                            "aria-hidden": "true"
                          }),
                          M(" " + d(o(mn)(b.total_downloads)), 1)
                        ]),
                        b.license ? (l(), u("span", {
                          key: 0,
                          class: "meta-pill",
                          title: b.license
                        }, [
                          y(o(C), {
                            icon: "tabler:license",
                            class: "km-i-xs",
                            "aria-hidden": "true"
                          }),
                          M(" " + d(o(Tn)(b.license)), 1)
                        ], 8, Xm)) : f("", !0)
                      ])
                    ])
                  ], 12, Dm))), 128))
                ])
              ])) : f("", !0),
              a("div", {
                class: te(o(U).length ? "km-mt-sm" : "")
              }, [
                a("div", Jm, [
                  y(o(C), {
                    icon: "tabler:apps",
                    class: "km-i km-accent",
                    "aria-hidden": "true"
                  }),
                  a("span", Qm, d(o(U).length ? "All modules" : "Available"), 1),
                  a("span", ef, d(o(D).length) + " available", 1)
                ]),
                a("div", tf, [
                  (l(!0), u(Y, null, ie(o(Z), (b) => (l(), u("button", {
                    key: o(En)(b),
                    class: "mod-card",
                    style: Kt({ "--accent": o(pn)(b) }),
                    onClick: (He) => o(gt)(b)
                  }, [
                    a("span", of, [
                      y(o(C), {
                        icon: o(en)(b),
                        class: "km-i",
                        "aria-hidden": "true"
                      }, null, 8, ["icon"])
                    ]),
                    a("span", sf, [
                      a("span", af, [
                        a("span", lf, d(o(Qt)(b)), 1),
                        a("span", rf, d(b.latest_version || "—"), 1),
                        o(un)(b) ? (l(), u("span", uf, "app")) : f("", !0),
                        o(cn)(b) ? (l(), u("span", df, [
                          y(o(C), {
                            icon: "tabler:lock",
                            class: "km-i-xs",
                            "aria-hidden": "true"
                          }),
                          _[34] || (_[34] = M(" private", -1))
                        ])) : f("", !0),
                        b.deprecated ? (l(), u("span", cf, "deprecated")) : f("", !0)
                      ]),
                      a("span", pf, d(o(Pn)(b)), 1),
                      b.description ? (l(), u("span", mf, d(b.description), 1)) : f("", !0),
                      a("span", ff, [
                        a("span", bf, [
                          y(o(C), {
                            icon: "tabler:download",
                            class: "km-i-xs",
                            "aria-hidden": "true"
                          }),
                          M(" " + d(o(mn)(b.total_downloads)), 1)
                        ]),
                        b.favorites_count ? (l(), u("span", hf, [
                          y(o(C), {
                            icon: "tabler:star",
                            class: "km-i-xs",
                            "aria-hidden": "true"
                          }),
                          M(" " + d(b.favorites_count), 1)
                        ])) : f("", !0),
                        b.license ? (l(), u("span", {
                          key: 1,
                          class: "foot-stat km-dim",
                          title: b.license
                        }, d(o(Tn)(b.license)), 9, vf)) : f("", !0),
                        b.update_time ? (l(), u("span", gf, d(o(Fn)(b.update_time, { maxUnit: "year" })), 1)) : f("", !0)
                      ])
                    ])
                  ], 12, nf))), 128))
                ])
              ], 2)
            ], 64)) : !o(Ye) && o(Et).length === 0 ? (l(), u("div", yf, [
              y(o(C), {
                icon: "tabler:package-off",
                class: "km-i-xl km-dim km-block",
                "aria-hidden": "true"
              }),
              a("p", kf, [
                _[35] || (_[35] = M(" No modules tagged ", -1)),
                a("code", wf, d(o(n)), 1),
                _[36] || (_[36] = M(" are published yet. ", -1))
              ])
            ])) : !o(Ye) && o($) ? (l(), u("div", Sf, [..._[37] || (_[37] = [
              a("p", { class: "km-muted" }, "No available modules match this filter.", -1)
            ])])) : o(Ye) ? f("", !0) : (l(), u("div", $f, [
              y(o(C), {
                icon: "tabler:circle-check",
                class: "km-i-xl km-dim km-block",
                "aria-hidden": "true"
              }),
              a("p", Cf, [
                _[38] || (_[38] = M(" All ", -1)),
                a("code", If, d(o(n)), 1),
                _[39] || (_[39] = M(" modules are installed — manage them under Installed below. ", -1))
              ])
            ]))
          ]),
          o(nt).length > 0 || o(We) ? (l(), u("section", _f, [
            a("button", {
              class: "km-collapse-head",
              "aria-expanded": o(Ze),
              onClick: _[11] || (_[11] = (b) => Ze.value = !o(Ze))
            }, [
              y(o(C), {
                icon: o(Ze) ? "tabler:chevron-down" : "tabler:chevron-right",
                class: "km-i",
                "aria-hidden": "true"
              }, null, 8, ["icon"]),
              _[40] || (_[40] = a("span", { class: "km-h2" }, "Installed", -1)),
              a("span", Of, [
                M(d(o(X).length), 1),
                o(X).length !== o(ot) ? (l(), u(Y, { key: 0 }, [
                  M(" of " + d(o(ot)), 1)
                ], 64)) : f("", !0),
                M(" module" + d(o(X).length === 1 ? "" : "s"), 1)
              ]),
              o(Re) > 0 && o(Re) !== o(ot) ? (l(), u("span", Lf, d(o(Tt)) + " of " + d(o(Re)) + " hub module" + d(o(Re) === 1 ? "" : "s"), 1)) : f("", !0),
              o(Te).length ? (l(), u("span", zf, d(o(Te).length) + " update" + d(o(Te).length === 1 ? "" : "s"), 1)) : f("", !0)
            ], 8, xf),
            o(Ze) ? (l(), u(Y, { key: 0 }, [
              o(We) ? (l(), u("div", Af, d(o(We)), 1)) : f("", !0),
              o(nt).length > 0 ? (l(), u("div", Pf, [
                Ve(a("input", {
                  "onUpdate:modelValue": _[12] || (_[12] = (b) => Ot(qe) ? qe.value = b : null),
                  class: "km-input km-filter inst-filter",
                  placeholder: "Search installed…",
                  "aria-label": "Search installed modules"
                }, null, 512), [
                  [Ln, o(qe)]
                ]),
                y(o(zn), {
                  modelValue: o(yt),
                  "onUpdate:modelValue": _[13] || (_[13] = (b) => Ot(yt) ? yt.value = b : null),
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
              o(X).length > 0 ? (l(), u("div", Mf, [
                (l(!0), u(Y, null, ie(o(X), (b) => (l(), u("button", {
                  key: b.id,
                  class: "inst-row",
                  style: Kt({ "--accent": o(ge)(b) }),
                  onClick: (He) => o(gt)(b)
                }, [
                  _[42] || (_[42] = a("span", {
                    class: "inst-strip",
                    "aria-hidden": "true"
                  }, null, -1)),
                  a("div", Tf, [
                    y(o(C), {
                      icon: o(st)(b),
                      class: "km-i",
                      "aria-hidden": "true"
                    }, null, 8, ["icon"])
                  ]),
                  a("div", Ff, [
                    a("div", Vf, [
                      a("span", Df, d(b.component), 1),
                      o(un)(o(re)(b.component)) ? (l(), u("span", Bf, "app")) : f("", !0),
                      a("span", {
                        class: te(o(Ft)(b) ? "badge-installed kx-tag-caps" : "km-chip")
                      }, d(o(Fe)(b)), 3),
                      o(de)(b) ? (l(), u("span", Rf, [
                        y(o(C), {
                          icon: "tabler:lock",
                          class: "km-i-xs",
                          "aria-hidden": "true"
                        }),
                        _[41] || (_[41] = M(" private", -1))
                      ])) : f("", !0),
                      b.source ? (l(), u("span", jf, d(b.source), 1)) : f("", !0),
                      o(Xe)(b) && o(Xe)(b)?.status !== "current" ? (l(), u("span", {
                        key: 3,
                        class: te(["inst-update", o(Xe)(b)?.status]),
                        title: o(Xe)(b)?.message || ""
                      }, [
                        y(o(C), {
                          icon: o(Vt)(b),
                          class: te(["km-i-xs", o(Ct)(b) && "spin"]),
                          "aria-hidden": "true"
                        }, null, 8, ["icon", "class"]),
                        M(" " + d(o(nn)(b)), 1)
                      ], 10, Hf)) : f("", !0)
                    ]),
                    a("div", Uf, [
                      M(d(b.id) + " ", 1),
                      o(at)(b) ? (l(), u("span", Nf, " · " + d(o(at)(b)), 1)) : f("", !0)
                    ]),
                    o(Xe)(b)?.message ? (l(), u("div", Kf, d(o(Xe)(b)?.message), 1)) : f("", !0)
                  ]),
                  a("span", qf, d(o(bt)(b)), 1),
                  a("span", Gf, d(o(lt)(b)), 1),
                  a("div", Wf, [
                    o(Xe)(b)?.status === "available" || o(Ct)(b) ? (l(), u("button", {
                      key: 0,
                      class: "km-icon-btn",
                      disabled: o(Ct)(b) || o(Be),
                      "aria-label": `Update ${b.component}`,
                      onClick: On((He) => o(je)(b), ["stop"])
                    }, [
                      y(o(C), {
                        icon: o(Vt)(b),
                        class: te(["km-i", o(Ct)(b) && "spin"]),
                        "aria-hidden": "true"
                      }, null, 8, ["icon", "class"])
                    ], 8, Zf)) : o(kt)(b) ? (l(), u("button", {
                      key: 1,
                      class: "km-icon-btn",
                      disabled: o(Be),
                      "aria-label": `Open update planner for ${b.component}`,
                      onClick: On((He) => o(It)(b), ["stop"])
                    }, [
                      y(o(C), {
                        icon: "tabler:refresh-dot",
                        class: "km-i",
                        "aria-hidden": "true"
                      })
                    ], 8, Yf)) : (l(), u("button", {
                      key: 2,
                      class: "km-icon-btn",
                      disabled: "",
                      title: o(wt)(b),
                      "aria-label": `Cannot update ${b.component}: ${o(wt)(b)}`
                    }, [
                      y(o(C), {
                        icon: "tabler:refresh-off",
                        class: "km-i",
                        "aria-hidden": "true"
                      })
                    ], 8, Xf)),
                    o(fe)(b) ? (l(), u("button", {
                      key: 3,
                      class: "km-icon-btn km-danger",
                      "aria-label": `Uninstall ${b.component}`,
                      onClick: On((He) => o(Wt)(b), ["stop"])
                    }, [
                      y(o(C), {
                        icon: "tabler:trash",
                        class: "km-i",
                        "aria-hidden": "true"
                      })
                    ], 8, Jf)) : (l(), u("button", {
                      key: 4,
                      class: "km-icon-btn",
                      disabled: "",
                      title: o(Ae)(b),
                      "aria-label": `Cannot uninstall ${b.component}: ${o(Ae)(b)}`
                    }, [
                      y(o(C), {
                        icon: "tabler:trash-off",
                        class: "km-i",
                        "aria-hidden": "true"
                      })
                    ], 8, Qf))
                  ]),
                  y(o(C), {
                    icon: "tabler:chevron-right",
                    class: "km-i km-chev",
                    "aria-hidden": "true"
                  })
                ], 12, Ef))), 128))
              ])) : o(nt).length > 0 ? (l(), u("div", eb, [
                y(o(C), {
                  icon: "tabler:filter-off",
                  class: "km-i-xl km-dim km-block",
                  "aria-hidden": "true"
                }),
                _[43] || (_[43] = a("p", { class: "km-muted" }, "No installed modules match this filter.", -1))
              ])) : f("", !0)
            ], 64)) : f("", !0)
          ])) : f("", !0)
        ]))
      ])),
      o(ke) ? (l(), ye($c, {
        key: 4,
        open: !0,
        mode: o(ke).mode,
        component: o(ke).component,
        version: o(ke).version,
        "current-id": o(ke).currentId,
        "catalog-item": o(ke).catalogItem,
        "installed-dep": o(ke).installedDep,
        onClose: o(dt),
        onChanged: o(on)
      }, null, 8, ["mode", "component", "version", "current-id", "catalog-item", "installed-dep", "onClose", "onChanged"])) : f("", !0),
      y(o(Zo), {
        visible: o(ct),
        "onUpdate:visible": _[18] || (_[18] = (b) => Ot(ct) ? ct.value = b : null),
        modal: "",
        closable: !o(ve),
        "dismissable-mask": !o(ve),
        "close-on-escape": !o(ve),
        class: "km-dialog",
        pt: { header: { class: "km-modal-head" }, content: { class: "km-dialog-content" }, footer: { class: "km-modal-foot" } },
        style: { width: "min(560px, calc(100vw - 40px))" }
      }, {
        header: he(() => [..._[44] || (_[44] = [
          a("span", null, "Uninstall module", -1)
        ])]),
        footer: he(() => [
          a("button", {
            class: "km-btn km-btn-text km-btn-secondary km-btn-sm",
            disabled: o(ve),
            onClick: _[15] || (_[15] = (b) => ct.value = !1)
          }, "Cancel", 8, Lb),
          a("button", {
            class: "km-btn km-btn-secondary km-btn-outlined km-btn-sm",
            disabled: o(ve) || o(Qe),
            onClick: _[16] || (_[16] = //@ts-ignore
            (...b) => o(mt) && o(mt)(...b))
          }, [
            y(o(C), {
              icon: o(Qe) ? "tabler:loader-2" : "tabler:eye",
              class: te(["km-i", o(Qe) && "spin"]),
              "aria-hidden": "true"
            }, null, 8, ["icon", "class"]),
            _[57] || (_[57] = M(" Preview ", -1))
          ], 8, zb),
          a("button", {
            class: "km-btn km-btn-danger km-btn-sm",
            disabled: !!o(Ce),
            title: o(Ce) || void 0,
            onClick: _[17] || (_[17] = //@ts-ignore
            (...b) => o(St) && o(St)(...b))
          }, [
            y(o(C), {
              icon: o(ve) ? "tabler:loader-2" : "tabler:trash",
              class: te(["km-i", o(ve) && "spin"]),
              "aria-hidden": "true"
            }, null, 8, ["icon", "class"]),
            _[58] || (_[58] = M(" Uninstall ", -1))
          ], 8, Ab)
        ]),
        default: he(() => [
          a("div", tb, [
            a("p", nb, [
              _[45] || (_[45] = M(" Uninstall ", -1)),
              a("code", ob, d(o(pt)?.component), 1),
              a("span", ib, "(" + d(o(pt)?.id) + ")", 1)
            ]),
            a("div", null, [
              _[46] || (_[46] = a("label", { class: "km-label" }, "Migration policy", -1)),
              y(o(zn), {
                modelValue: o(Je),
                "onUpdate:modelValue": _[14] || (_[14] = (b) => Ot(Je) ? Je.value = b : null),
                class: "km-sort km-w-full",
                options: o(i),
                "option-label": "label",
                "option-value": "value",
                "aria-label": "Uninstall migration policy"
              }, null, 8, ["modelValue", "options"]),
              _[47] || (_[47] = a("p", { class: "km-req-desc" }, [
                M("Default "),
                a("code", { class: "km-mono" }, "block"),
                M(". Choose "),
                a("code", { class: "km-mono" }, "down"),
                M(" only if the module's down migrations are safe; data loss is possible.")
              ], -1))
            ]),
            o(_t) ? (l(), u("div", sb, [
              o($e) ? (l(), u("span", ab, d(o($e)), 1)) : f("", !0),
              M(d(o(_t)) + " ", 1),
              o(Dt).length ? (l(), u("div", lb, "required by: " + d(o(Dt).join(", ")), 1)) : f("", !0)
            ])) : f("", !0),
            o(xt) ? (l(), u("div", rb, [
              _[48] || (_[48] = a("strong", null, "Uninstall blocked:", -1)),
              M(" " + d(o(xt)), 1)
            ])) : f("", !0),
            o(Qe) ? (l(), u("div", ub, [
              y(o(C), {
                icon: "tabler:loader-2",
                class: "km-i spin km-accent",
                "aria-hidden": "true"
              }),
              _[49] || (_[49] = a("span", { class: "km-grow km-running-label" }, "Previewing uninstall", -1))
            ])) : o(me) ? (l(), u("div", db, [
              o(me).warnings?.length ? (l(), u("div", cb, [
                (l(!0), u(Y, null, ie(o(me).warnings, (b) => (l(), u("div", { key: b }, d(b), 1))), 128))
              ])) : f("", !0),
              o(me).removed?.length ? (l(), u("div", pb, [
                _[51] || (_[51] = a("div", { class: "km-preview-title" }, "Removed", -1)),
                (l(!0), u(Y, null, ie(o(me).removed, (b) => (l(), u("div", {
                  key: b.name || b.component,
                  class: "km-preview-row"
                }, [
                  y(o(C), {
                    icon: "tabler:minus",
                    class: "km-i-xs km-danger-fg",
                    "aria-hidden": "true"
                  }),
                  a("span", mb, d(b.name || b.component), 1),
                  _[50] || (_[50] = a("span", { class: "km-grow" }, null, -1)),
                  a("span", fb, d(b.version), 1)
                ]))), 128))
              ])) : f("", !0),
              o(me).kept?.length ? (l(), u("div", bb, [
                _[53] || (_[53] = a("div", { class: "km-preview-title" }, "Kept, still needed", -1)),
                (l(!0), u(Y, null, ie(o(me).kept, (b) => (l(), u("div", {
                  key: b.name || b.component,
                  class: "km-preview-row"
                }, [
                  y(o(C), {
                    icon: "tabler:lock",
                    class: "km-i-xs km-dim",
                    "aria-hidden": "true"
                  }),
                  a("span", hb, d(b.name || b.component), 1),
                  _[52] || (_[52] = a("span", { class: "km-grow" }, null, -1)),
                  a("span", vb, d(b.version), 1)
                ]))), 128))
              ])) : f("", !0),
              o(me).kept_under_uncertainty?.length ? (l(), u("div", gb, [
                _[55] || (_[55] = a("div", { class: "km-preview-title" }, "Kept under uncertainty", -1)),
                (l(!0), u(Y, null, ie(o(me).kept_under_uncertainty, (b) => (l(), u("div", {
                  key: b.name || b.component,
                  class: "km-preview-row"
                }, [
                  y(o(C), {
                    icon: "tabler:help",
                    class: "km-i-xs km-dim",
                    "aria-hidden": "true"
                  }),
                  a("span", yb, d(b.name || b.component), 1),
                  _[54] || (_[54] = a("span", { class: "km-grow" }, null, -1)),
                  a("span", kb, d(b.reason || b.version), 1)
                ]))), 128))
              ])) : f("", !0)
            ])) : f("", !0),
            o(Gt).length ? (l(), u("div", wb, [
              _[56] || (_[56] = a("div", { class: "km-panel-title" }, "Execution ledger", -1)),
              (l(!0), u(Y, null, ie(o(Gt), (b, He) => (l(), u("div", {
                key: `${b.step}-${He}`,
                class: te(["km-ledger-row", b.status === "failed" || b.status === "rollback_failed" ? "km-ledger-bad" : b.status === "rolled_back" ? "km-ledger-warn" : "km-ledger-ok"])
              }, [
                a("span", Sb, d(He + 1), 1),
                a("span", $b, d(o(Zt)(b)), 1),
                a("span", Cb, d(b.status), 1),
                b.message ? (l(), u("span", Ib, d(b.message), 1)) : f("", !0)
              ], 2))), 128))
            ])) : f("", !0),
            o(ve) ? (l(), u("div", _b, [
              y(o(C), {
                icon: "tabler:loader-2",
                class: "km-i spin km-accent",
                "aria-hidden": "true"
              }),
              a("span", xb, d(o(Bt)), 1),
              a("span", Ob, d(o(Rt)) + "s", 1)
            ])) : f("", !0)
          ])
        ]),
        _: 1
      }, 8, ["visible", "closable", "dismissable-mask", "close-on-escape"])
    ]));
  }
}), Mb = { props: { type: "object", properties: {} } }, Eb = {
  wippy: Mb
};
class Tb extends Di {
  static get wippyConfig() {
    return {
      propsSchema: Eb.wippy.props,
      hostCssKeys: ["themeConfigUrl", "primeVueCssUrl"],
      inlineCss: Bi
    };
  }
  static get vueConfig() {
    return { rootComponent: Pb, plugins: [Ri] };
  }
}
Gi(import.meta.url, Tb);
//# sourceMappingURL=index.js.map

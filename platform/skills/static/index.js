import { u as gr, W as vr } from "./index-D52CRMw6.js";
import { ref as K, readonly as yr, getCurrentInstance as kn, onMounted as mo, nextTick as wr, watch as Me, reactive as xr, renderSlot as j, openBlock as b, createBlock as fe, Teleport as bo, createCommentVNode as P, useId as kr, mergeProps as S, h as Sr, createElementBlock as w, createElementVNode as k, createTextVNode as ce, toDisplayString as z, resolveComponent as pe, resolveDirective as cn, withDirectives as Ve, resolveDynamicComponent as ot, withCtx as G, normalizeClass as J, computed as Ht, createVNode as _, Transition as go, Fragment as $e, defineComponent as pn, onBeforeUnmount as $r, renderList as Ze, normalizeProps as Cr, createSlots as Or, withModifiers as Kt, unref as E, vModelText as $t, withKeys as Sn } from "vue";
import { Icon as Y } from "@iconify/vue";
import { api as Ne, host as We, loadByTagName as vo, define as Ir } from "@wippy-fe/proxy";
var _r = Object.defineProperty, $n = Object.getOwnPropertySymbols, Lr = Object.prototype.hasOwnProperty, Tr = Object.prototype.propertyIsEnumerable, Cn = (t, e, n) => e in t ? _r(t, e, { enumerable: !0, configurable: !0, writable: !0, value: n }) : t[e] = n, Pr = (t, e) => {
  for (var n in e || (e = {})) Lr.call(e, n) && Cn(t, n, e[n]);
  if ($n) for (var n of $n(e)) Tr.call(e, n) && Cn(t, n, e[n]);
  return t;
};
function He(t) {
  return t == null || t === "" || Array.isArray(t) && t.length === 0 || !(t instanceof Date) && typeof t == "object" && Object.keys(t).length === 0;
}
function Ut(t, e, n = /* @__PURE__ */ new WeakSet()) {
  if (t === e) return !0;
  if (!t || !e || typeof t != "object" || typeof e != "object" || n.has(t) || n.has(e)) return !1;
  n.add(t).add(e);
  let o = Array.isArray(t), r = Array.isArray(e), i, l, s;
  if (o && r) {
    if (l = t.length, l != e.length) return !1;
    for (i = l; i-- !== 0; ) if (!Ut(t[i], e[i], n)) return !1;
    return !0;
  }
  if (o != r) return !1;
  let a = t instanceof Date, u = e instanceof Date;
  if (a != u) return !1;
  if (a && u) return t.getTime() == e.getTime();
  let d = t instanceof RegExp, c = e instanceof RegExp;
  if (d != c) return !1;
  if (d && c) return t.toString() == e.toString();
  let p = Object.keys(t);
  if (l = p.length, l !== Object.keys(e).length) return !1;
  for (i = l; i-- !== 0; ) if (!Object.prototype.hasOwnProperty.call(e, p[i])) return !1;
  for (i = l; i-- !== 0; ) if (s = p[i], !Ut(t[s], e[s], n)) return !1;
  return !0;
}
function Ar(t, e) {
  return Ut(t, e);
}
function jt(t) {
  return typeof t == "function" && "call" in t && "apply" in t;
}
function V(t) {
  return !He(t);
}
function _e(t, e) {
  if (!t || !e) return null;
  try {
    let n = t[e];
    if (V(n)) return n;
  } catch {
  }
  if (Object.keys(t).length) {
    if (jt(e)) return e(t);
    if (e.indexOf(".") === -1) return t[e];
    {
      let n = e.split("."), o = t;
      for (let r = 0, i = n.length; r < i; ++r) {
        if (o == null) return null;
        o = o[n[r]];
      }
      return o;
    }
  }
  return null;
}
function yo(t, e, n) {
  return n ? _e(t, n) === _e(e, n) : Ar(t, e);
}
function Ce(t, e = !0) {
  return t instanceof Object && t.constructor === Object && (e || Object.keys(t).length !== 0);
}
function wo(t = {}, e = {}) {
  let n = Pr({}, t);
  return Object.keys(e).forEach((o) => {
    let r = o;
    Ce(e[r]) && r in t && Ce(t[r]) ? n[r] = wo(t[r], e[r]) : n[r] = e[r];
  }), n;
}
function Er(...t) {
  return t.reduce((e, n, o) => o === 0 ? n : wo(e, n), {});
}
function On(t, e) {
  let n = -1;
  if (V(t)) try {
    n = t.findLastIndex(e);
  } catch {
    n = t.lastIndexOf([...t].reverse().find(e));
  }
  return n;
}
function me(t, ...e) {
  return jt(t) ? t(...e) : t;
}
function he(t, e = !0) {
  return typeof t == "string" && (e || t !== "");
}
function Se(t) {
  return he(t) ? t.replace(/(-|_)/g, "").toLowerCase() : t;
}
function fn(t, e = "", n = {}) {
  let o = Se(e).split("."), r = o.shift();
  if (r) {
    if (Ce(t)) {
      let i = Object.keys(t).find((l) => Se(l) === r) || "";
      return fn(me(t[i], n), o.join("."), n);
    }
    return;
  }
  return me(t, n);
}
function xo(t, e = !0) {
  return Array.isArray(t) && (e || t.length !== 0);
}
function zr(t) {
  return V(t) && !isNaN(t);
}
function jr(t = "") {
  return V(t) && t.length === 1 && !!t.match(/\S| /);
}
function Be(t, e) {
  if (e) {
    let n = e.test(t);
    return e.lastIndex = 0, n;
  }
  return !1;
}
function Dr(...t) {
  return Er(...t);
}
function tt(t) {
  return t && t.replace(/\/\*(?:(?!\*\/)[\s\S])*\*\/|[\r\n\t]+/g, "").replace(/ {2,}/g, " ").replace(/ ([{:}]) /g, "$1").replace(/([;,]) /g, "$1").replace(/ !/g, "!").replace(/: /g, ":").trim();
}
function be(t) {
  if (t && /[\xC0-\xFF\u0100-\u017E]/.test(t)) {
    let e = { A: /[\xC0-\xC5\u0100\u0102\u0104]/g, AE: /[\xC6]/g, C: /[\xC7\u0106\u0108\u010A\u010C]/g, D: /[\xD0\u010E\u0110]/g, E: /[\xC8-\xCB\u0112\u0114\u0116\u0118\u011A]/g, G: /[\u011C\u011E\u0120\u0122]/g, H: /[\u0124\u0126]/g, I: /[\xCC-\xCF\u0128\u012A\u012C\u012E\u0130]/g, IJ: /[\u0132]/g, J: /[\u0134]/g, K: /[\u0136]/g, L: /[\u0139\u013B\u013D\u013F\u0141]/g, N: /[\xD1\u0143\u0145\u0147\u014A]/g, O: /[\xD2-\xD6\xD8\u014C\u014E\u0150]/g, OE: /[\u0152]/g, R: /[\u0154\u0156\u0158]/g, S: /[\u015A\u015C\u015E\u0160]/g, T: /[\u0162\u0164\u0166]/g, U: /[\xD9-\xDC\u0168\u016A\u016C\u016E\u0170\u0172]/g, W: /[\u0174]/g, Y: /[\xDD\u0176\u0178]/g, Z: /[\u0179\u017B\u017D]/g, a: /[\xE0-\xE5\u0101\u0103\u0105]/g, ae: /[\xE6]/g, c: /[\xE7\u0107\u0109\u010B\u010D]/g, d: /[\u010F\u0111]/g, e: /[\xE8-\xEB\u0113\u0115\u0117\u0119\u011B]/g, g: /[\u011D\u011F\u0121\u0123]/g, i: /[\xEC-\xEF\u0129\u012B\u012D\u012F\u0131]/g, ij: /[\u0133]/g, j: /[\u0135]/g, k: /[\u0137,\u0138]/g, l: /[\u013A\u013C\u013E\u0140\u0142]/g, n: /[\xF1\u0144\u0146\u0148\u014B]/g, p: /[\xFE]/g, o: /[\xF2-\xF6\xF8\u014D\u014F\u0151]/g, oe: /[\u0153]/g, r: /[\u0155\u0157\u0159]/g, s: /[\u015B\u015D\u015F\u0161]/g, t: /[\u0163\u0165\u0167]/g, u: /[\xF9-\xFC\u0169\u016B\u016D\u016F\u0171\u0173]/g, w: /[\u0175]/g, y: /[\xFD\xFF\u0177]/g, z: /[\u017A\u017C\u017E]/g };
    for (let n in e) t = t.replace(e[n], n);
  }
  return t;
}
function Fr(t) {
  return he(t, !1) ? t[0].toUpperCase() + t.slice(1) : t;
}
function ko(t) {
  return he(t) ? t.replace(/(_)/g, "-").replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase() : t;
}
function hn() {
  let t = /* @__PURE__ */ new Map();
  return { on(e, n) {
    let o = t.get(e);
    return o ? o.push(n) : o = [n], t.set(e, o), this;
  }, off(e, n) {
    let o = t.get(e);
    return o && o.splice(o.indexOf(n) >>> 0, 1), this;
  }, emit(e, n) {
    let o = t.get(e);
    o && o.forEach((r) => {
      r(n);
    });
  }, clear() {
    t.clear();
  } };
}
function we(...t) {
  if (t) {
    let e = [];
    for (let n = 0; n < t.length; n++) {
      let o = t[n];
      if (!o) continue;
      let r = typeof o;
      if (r === "string" || r === "number") e.push(o);
      else if (r === "object") {
        let i = Array.isArray(o) ? [we(...o)] : Object.entries(o).map(([l, s]) => s ? l : void 0);
        e = i.length ? e.concat(i.filter((l) => !!l)) : e;
      }
    }
    return e.join(" ").trim();
  }
}
function Mr(t, e) {
  return t ? t.classList ? t.classList.contains(e) : new RegExp("(^| )" + e + "( |$)", "gi").test(t.className) : !1;
}
function Lt(t, e) {
  if (t && e) {
    let n = (o) => {
      Mr(t, o) || (t.classList ? t.classList.add(o) : t.className += " " + o);
    };
    [e].flat().filter(Boolean).forEach((o) => o.split(" ").forEach(n));
  }
}
function Vr() {
  return window.innerWidth - document.documentElement.offsetWidth;
}
function Nr(t) {
  typeof t == "string" ? Lt(document.body, t || "p-overflow-hidden") : (t != null && t.variableName && document.body.style.setProperty(t.variableName, Vr() + "px"), Lt(document.body, t?.className || "p-overflow-hidden"));
}
function nt(t, e) {
  if (t && e) {
    let n = (o) => {
      t.classList ? t.classList.remove(o) : t.className = t.className.replace(new RegExp("(^|\\b)" + o.split(" ").join("|") + "(\\b|$)", "gi"), " ");
    };
    [e].flat().filter(Boolean).forEach((o) => o.split(" ").forEach(n));
  }
}
function Br(t) {
  typeof t == "string" ? nt(document.body, t || "p-overflow-hidden") : (t != null && t.variableName && document.body.style.removeProperty(t.variableName), nt(document.body, t?.className || "p-overflow-hidden"));
}
function Wt(t) {
  for (let e of document?.styleSheets) try {
    for (let n of e?.cssRules) for (let o of n?.style) if (t.test(o)) return { name: o, value: n.style.getPropertyValue(o).trim() };
  } catch {
  }
  return null;
}
function So(t) {
  let e = { width: 0, height: 0 };
  if (t) {
    let [n, o] = [t.style.visibility, t.style.display], r = t.getBoundingClientRect();
    t.style.visibility = "hidden", t.style.display = "block", e.width = r.width || t.offsetWidth, e.height = r.height || t.offsetHeight, t.style.display = o, t.style.visibility = n;
  }
  return e;
}
function mn() {
  let t = window, e = document, n = e.documentElement, o = e.getElementsByTagName("body")[0], r = t.innerWidth || n.clientWidth || o.clientWidth, i = t.innerHeight || n.clientHeight || o.clientHeight;
  return { width: r, height: i };
}
function Gt(t) {
  return t ? Math.abs(t.scrollLeft) : 0;
}
function Rr() {
  let t = document.documentElement;
  return (window.pageXOffset || Gt(t)) - (t.clientLeft || 0);
}
function Hr() {
  let t = document.documentElement;
  return (window.pageYOffset || t.scrollTop) - (t.clientTop || 0);
}
function Kr(t) {
  return t ? getComputedStyle(t).direction === "rtl" : !1;
}
function Ur(t, e, n = !0) {
  var o, r, i, l;
  if (t) {
    let s = t.offsetParent ? { width: t.offsetWidth, height: t.offsetHeight } : So(t), a = s.height, u = s.width, d = e.offsetHeight, c = e.offsetWidth, p = e.getBoundingClientRect(), f = Hr(), m = Rr(), y = mn(), g, $, C = "top";
    p.top + d + a > y.height ? (g = p.top + f - a, C = "bottom", g < 0 && (g = f)) : g = d + p.top + f, p.left + u > y.width ? $ = Math.max(0, p.left + m + c - u) : $ = p.left + m, Kr(t) ? t.style.insetInlineEnd = $ + "px" : t.style.insetInlineStart = $ + "px", t.style.top = g + "px", t.style.transformOrigin = C, n && (t.style.marginTop = C === "bottom" ? `calc(${(r = (o = Wt(/-anchor-gutter$/)) == null ? void 0 : o.value) != null ? r : "2px"} * -1)` : (l = (i = Wt(/-anchor-gutter$/)) == null ? void 0 : i.value) != null ? l : "");
  }
}
function $o(t, e) {
  t && (typeof e == "string" ? t.style.cssText = e : Object.entries(e || {}).forEach(([n, o]) => t.style[n] = o));
}
function bn(t, e) {
  return t instanceof HTMLElement ? t.offsetWidth : 0;
}
function Wr(t, e, n = !0, o = void 0) {
  var r;
  if (t) {
    let i = t.offsetParent ? { width: t.offsetWidth, height: t.offsetHeight } : So(t), l = e.offsetHeight, s = e.getBoundingClientRect(), a = mn(), u, d, c = o ?? "top";
    if (!o && s.top + l + i.height > a.height ? (u = -1 * i.height, c = "bottom", s.top + u < 0 && (u = -1 * s.top)) : u = l, i.width > a.width ? d = s.left * -1 : s.left + i.width > a.width ? d = (s.left + i.width - a.width) * -1 : d = 0, t.style.top = u + "px", t.style.insetInlineStart = d + "px", t.style.transformOrigin = c, n) {
      let p = (r = Wt(/-anchor-gutter$/)) == null ? void 0 : r.value;
      t.style.marginTop = c === "bottom" ? `calc(${p ?? "2px"} * -1)` : p ?? "";
    }
  }
}
function Co(t) {
  if (t) {
    let e = t.parentNode;
    return e && e instanceof ShadowRoot && e.host && (e = e.host), e;
  }
  return null;
}
function Gr(t) {
  return !!(t !== null && typeof t < "u" && t.nodeName && Co(t));
}
function Ke(t) {
  return typeof Element < "u" ? t instanceof Element : t !== null && typeof t == "object" && t.nodeType === 1 && typeof t.nodeName == "string";
}
function Tt(t, e = {}) {
  if (Ke(t)) {
    let n = (o, r) => {
      var i, l;
      let s = (i = t?.$attrs) != null && i[o] ? [(l = t?.$attrs) == null ? void 0 : l[o]] : [];
      return [r].flat().reduce((a, u) => {
        if (u != null) {
          let d = typeof u;
          if (d === "string" || d === "number") a.push(u);
          else if (d === "object") {
            let c = Array.isArray(u) ? n(o, u) : Object.entries(u).map(([p, f]) => o === "style" && (f || f === 0) ? `${p.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase()}:${f}` : f ? p : void 0);
            a = c.length ? a.concat(c.filter((p) => !!p)) : a;
          }
        }
        return a;
      }, s);
    };
    Object.entries(e).forEach(([o, r]) => {
      if (r != null) {
        let i = o.match(/^on(.+)/);
        i ? t.addEventListener(i[1].toLowerCase(), r) : o === "p-bind" || o === "pBind" ? Tt(t, r) : (r = o === "class" ? [...new Set(n("class", r))].join(" ").trim() : o === "style" ? n("style", r).join(";").trim() : r, (t.$attrs = t.$attrs || {}) && (t.$attrs[o] = r), t.setAttribute(o, r));
      }
    });
  }
}
function Oo(t, e = {}, ...n) {
  {
    let o = document.createElement(t);
    return Tt(o, e), o.append(...n), o;
  }
}
function qr(t, e) {
  return Ke(t) ? Array.from(t.querySelectorAll(e)) : [];
}
function Dt(t, e) {
  return Ke(t) ? t.matches(e) ? t : t.querySelector(e) : null;
}
function se(t, e) {
  t && document.activeElement !== t && t.focus(e);
}
function Yr(t, e) {
  if (Ke(t)) {
    let n = t.getAttribute(e);
    return isNaN(n) ? n === "true" || n === "false" ? n === "true" : n : +n;
  }
}
function gn(t, e = "") {
  let n = qr(t, `button:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${e},
            [href]:not([tabindex = "-1"]):not([style*="display:none"]):not([hidden])${e},
            input:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${e},
            select:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${e},
            textarea:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${e},
            [tabIndex]:not([tabIndex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${e},
            [contenteditable]:not([tabIndex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${e}`), o = [];
  for (let r of n) getComputedStyle(r).display != "none" && getComputedStyle(r).visibility != "hidden" && o.push(r);
  return o;
}
function Ge(t, e) {
  let n = gn(t, e);
  return n.length > 0 ? n[0] : null;
}
function De(t) {
  if (t) {
    let e = t.offsetHeight, n = getComputedStyle(t);
    return e -= parseFloat(n.paddingTop) + parseFloat(n.paddingBottom) + parseFloat(n.borderTopWidth) + parseFloat(n.borderBottomWidth), e;
  }
  return 0;
}
function Io(t, e) {
  let n = gn(t, e);
  return n.length > 0 ? n[n.length - 1] : null;
}
function Zr(t) {
  if (t) {
    let e = t.getBoundingClientRect();
    return { top: e.top + (window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0), left: e.left + (window.pageXOffset || Gt(document.documentElement) || Gt(document.body) || 0) };
  }
  return { top: "auto", left: "auto" };
}
function _o(t, e) {
  return t ? t.offsetHeight : 0;
}
function Lo(t, e = []) {
  let n = Co(t);
  return n === null ? e : Lo(n, e.concat([n]));
}
function Xr(t) {
  let e = [];
  if (t) {
    let n = Lo(t), o = /(auto|scroll)/, r = (i) => {
      try {
        let l = window.getComputedStyle(i, null);
        return o.test(l.getPropertyValue("overflow")) || o.test(l.getPropertyValue("overflowX")) || o.test(l.getPropertyValue("overflowY"));
      } catch {
        return !1;
      }
    };
    for (let i of n) {
      let l = i.nodeType === 1 && i.dataset.scrollselectors;
      if (l) {
        let s = l.split(",");
        for (let a of s) {
          let u = Dt(i, a);
          u && r(u) && e.push(u);
        }
      }
      i.nodeType !== 9 && r(i) && e.push(i);
    }
  }
  return e;
}
function Fe(t) {
  if (t) {
    let e = t.offsetWidth, n = getComputedStyle(t);
    return e -= parseFloat(n.paddingLeft) + parseFloat(n.paddingRight) + parseFloat(n.borderLeftWidth) + parseFloat(n.borderRightWidth), e;
  }
  return 0;
}
function Jr() {
  return /(android)/i.test(navigator.userAgent);
}
function To() {
  return !!(typeof window < "u" && window.document && window.document.createElement);
}
function In(t, e = "") {
  return Ke(t) ? t.matches(`button:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${e},
            [href][clientHeight][clientWidth]:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${e},
            input:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${e},
            select:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${e},
            textarea:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${e},
            [tabIndex]:not([tabIndex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${e},
            [contenteditable]:not([tabIndex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${e}`) : !1;
}
function Pt(t) {
  return !!(t && t.offsetParent != null);
}
function Qr() {
  return "ontouchstart" in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;
}
function Po(t, e = "", n) {
  Ke(t) && n !== null && n !== void 0 && t.setAttribute(e, n);
}
var Ct = {};
function ei(t = "pui_id_") {
  return Object.hasOwn(Ct, t) || (Ct[t] = 0), Ct[t]++, `${t}${Ct[t]}`;
}
function ti() {
  let t = [], e = (l, s, a = 999) => {
    let u = r(l, s, a), d = u.value + (u.key === l ? 0 : a) + 1;
    return t.push({ key: l, value: d }), d;
  }, n = (l) => {
    t = t.filter((s) => s.value !== l);
  }, o = (l, s) => r(l).value, r = (l, s, a = 0) => [...t].reverse().find((u) => !0) || { key: l, value: a }, i = (l) => l && parseInt(l.style.zIndex, 10) || 0;
  return { get: i, set: (l, s, a) => {
    s && (s.style.zIndex = String(e(l, !0, a)));
  }, clear: (l) => {
    l && (n(i(l)), l.style.zIndex = "");
  }, getCurrent: (l) => o(l) };
}
var Xe = ti(), ni = Object.defineProperty, oi = Object.defineProperties, ri = Object.getOwnPropertyDescriptors, At = Object.getOwnPropertySymbols, Ao = Object.prototype.hasOwnProperty, Eo = Object.prototype.propertyIsEnumerable, _n = (t, e, n) => e in t ? ni(t, e, { enumerable: !0, configurable: !0, writable: !0, value: n }) : t[e] = n, ye = (t, e) => {
  for (var n in e || (e = {})) Ao.call(e, n) && _n(t, n, e[n]);
  if (At) for (var n of At(e)) Eo.call(e, n) && _n(t, n, e[n]);
  return t;
}, Nt = (t, e) => oi(t, ri(e)), Ie = (t, e) => {
  var n = {};
  for (var o in t) Ao.call(t, o) && e.indexOf(o) < 0 && (n[o] = t[o]);
  if (t != null && At) for (var o of At(t)) e.indexOf(o) < 0 && Eo.call(t, o) && (n[o] = t[o]);
  return n;
}, ii = hn(), te = ii, rt = /{([^}]*)}/g, zo = /(\d+\s+[\+\-\*\/]\s+\d+)/g, jo = /var\([^)]+\)/g;
function Ln(t) {
  return he(t) ? t.replace(/[A-Z]/g, (e, n) => n === 0 ? e : "." + e.toLowerCase()).toLowerCase() : t;
}
function ai(t) {
  return Ce(t) && t.hasOwnProperty("$value") && t.hasOwnProperty("$type") ? t.$value : t;
}
function li(t) {
  return t.replaceAll(/ /g, "").replace(/[^\w]/g, "-");
}
function qt(t = "", e = "") {
  return li(`${he(t, !1) && he(e, !1) ? `${t}-` : t}${e}`);
}
function Do(t = "", e = "") {
  return `--${qt(t, e)}`;
}
function si(t = "") {
  let e = (t.match(/{/g) || []).length, n = (t.match(/}/g) || []).length;
  return (e + n) % 2 !== 0;
}
function Fo(t, e = "", n = "", o = [], r) {
  if (he(t)) {
    let i = t.trim();
    if (si(i)) return;
    if (Be(i, rt)) {
      let l = i.replaceAll(rt, (s) => {
        let a = s.replace(/{|}/g, "").split(".").filter((u) => !o.some((d) => Be(u, d)));
        return `var(${Do(n, ko(a.join("-")))}${V(r) ? `, ${r}` : ""})`;
      });
      return Be(l.replace(jo, "0"), zo) ? `calc(${l})` : l;
    }
    return i;
  } else if (zr(t)) return t;
}
function ui(t, e, n) {
  he(e, !1) && t.push(`${e}:${n};`);
}
function qe(t, e) {
  return t ? `${t}{${e}}` : "";
}
function Mo(t, e) {
  if (t.indexOf("dt(") === -1) return t;
  function n(l, s) {
    let a = [], u = 0, d = "", c = null, p = 0;
    for (; u <= l.length; ) {
      let f = l[u];
      if ((f === '"' || f === "'" || f === "`") && l[u - 1] !== "\\" && (c = c === f ? null : f), !c && (f === "(" && p++, f === ")" && p--, (f === "," || u === l.length) && p === 0)) {
        let m = d.trim();
        m.startsWith("dt(") ? a.push(Mo(m, s)) : a.push(o(m)), d = "", u++;
        continue;
      }
      f !== void 0 && (d += f), u++;
    }
    return a;
  }
  function o(l) {
    let s = l[0];
    if ((s === '"' || s === "'" || s === "`") && l[l.length - 1] === s) return l.slice(1, -1);
    let a = Number(l);
    return isNaN(a) ? l : a;
  }
  let r = [], i = [];
  for (let l = 0; l < t.length; l++) if (t[l] === "d" && t.slice(l, l + 3) === "dt(") i.push(l), l += 2;
  else if (t[l] === ")" && i.length > 0) {
    let s = i.pop();
    i.length === 0 && r.push([s, l]);
  }
  if (!r.length) return t;
  for (let l = r.length - 1; l >= 0; l--) {
    let [s, a] = r[l], u = t.slice(s + 3, a), d = n(u, e), c = e(...d);
    t = t.slice(0, s) + c + t.slice(a + 1);
  }
  return t;
}
var Vo = (t) => {
  var e;
  let n = H.getTheme(), o = Yt(n, t, void 0, "variable"), r = (e = o?.match(/--[\w-]+/g)) == null ? void 0 : e[0], i = Yt(n, t, void 0, "value");
  return { name: r, variable: o, value: i };
}, Re = (...t) => Yt(H.getTheme(), ...t), Yt = (t = {}, e, n, o) => {
  if (e) {
    let { variable: r, options: i } = H.defaults || {}, { prefix: l, transform: s } = t?.options || i || {}, a = Be(e, rt) ? e : `{${e}}`;
    return o === "value" || He(o) && s === "strict" ? H.getTokenValue(e) : Fo(a, void 0, l, [r.excludedKeyRegex], n);
  }
  return "";
};
function Ot(t, ...e) {
  if (t instanceof Array) {
    let n = t.reduce((o, r, i) => {
      var l;
      return o + r + ((l = me(e[i], { dt: Re })) != null ? l : "");
    }, "");
    return Mo(n, Re);
  }
  return me(t, { dt: Re });
}
function di(t, e = {}) {
  let n = H.defaults.variable, { prefix: o = n.prefix, selector: r = n.selector, excludedKeyRegex: i = n.excludedKeyRegex } = e, l = [], s = [], a = [{ node: t, path: o }];
  for (; a.length; ) {
    let { node: d, path: c } = a.pop();
    for (let p in d) {
      let f = d[p], m = ai(f), y = Be(p, i) ? qt(c) : qt(c, ko(p));
      if (Ce(m)) a.push({ node: m, path: y });
      else {
        let g = Do(y), $ = Fo(m, y, o, [i]);
        ui(s, g, $);
        let C = y;
        o && C.startsWith(o + "-") && (C = C.slice(o.length + 1)), l.push(C.replace(/-/g, "."));
      }
    }
  }
  let u = s.join("");
  return { value: s, tokens: l, declarations: u, css: qe(r, u) };
}
var ve = { regex: { rules: { class: { pattern: /^\.([a-zA-Z][\w-]*)$/, resolve(t) {
  return { type: "class", selector: t, matched: this.pattern.test(t.trim()) };
} }, attr: { pattern: /^\[(.*)\]$/, resolve(t) {
  return { type: "attr", selector: `:root${t},:host${t}`, matched: this.pattern.test(t.trim()) };
} }, media: { pattern: /^@media (.*)$/, resolve(t) {
  return { type: "media", selector: t, matched: this.pattern.test(t.trim()) };
} }, system: { pattern: /^system$/, resolve(t) {
  return { type: "system", selector: "@media (prefers-color-scheme: dark)", matched: this.pattern.test(t.trim()) };
} }, custom: { resolve(t) {
  return { type: "custom", selector: t, matched: !0 };
} } }, resolve(t) {
  let e = Object.keys(this.rules).filter((n) => n !== "custom").map((n) => this.rules[n]);
  return [t].flat().map((n) => {
    var o;
    return (o = e.map((r) => r.resolve(n)).find((r) => r.matched)) != null ? o : this.rules.custom.resolve(n);
  });
} }, _toVariables(t, e) {
  return di(t, { prefix: e?.prefix });
}, getCommon({ name: t = "", theme: e = {}, params: n, set: o, defaults: r }) {
  var i, l, s, a, u, d, c;
  let { preset: p, options: f } = e, m, y, g, $, C, T, h;
  if (V(p) && f.transform !== "strict") {
    let { primitive: O, semantic: D, extend: L } = p, M = D || {}, { colorScheme: q } = M, Z = Ie(M, ["colorScheme"]), B = L || {}, { colorScheme: U } = B, ie = Ie(B, ["colorScheme"]), ae = q || {}, { dark: X } = ae, ne = Ie(ae, ["dark"]), le = U || {}, { dark: xe } = le, Q = Ie(le, ["dark"]), oe = V(O) ? this._toVariables({ primitive: O }, f) : {}, ee = V(Z) ? this._toVariables({ semantic: Z }, f) : {}, ge = V(ne) ? this._toVariables({ light: ne }, f) : {}, Ue = V(X) ? this._toVariables({ dark: X }, f) : {}, Te = V(ie) ? this._toVariables({ semantic: ie }, f) : {}, xt = V(Q) ? this._toVariables({ light: Q }, f) : {}, kt = V(xe) ? this._toVariables({ dark: xe }, f) : {}, [Vt, I] = [(i = oe.declarations) != null ? i : "", oe.tokens], [x, v] = [(l = ee.declarations) != null ? l : "", ee.tokens || []], [W, Oe] = [(s = ge.declarations) != null ? s : "", ge.tokens || []], [St, ar] = [(a = Ue.declarations) != null ? a : "", Ue.tokens || []], [lr, sr] = [(u = Te.declarations) != null ? u : "", Te.tokens || []], [ur, dr] = [(d = xt.declarations) != null ? d : "", xt.tokens || []], [cr, pr] = [(c = kt.declarations) != null ? c : "", kt.tokens || []];
    m = this.transformCSS(t, Vt, "light", "variable", f, o, r), y = I;
    let fr = this.transformCSS(t, `${x}${W}`, "light", "variable", f, o, r), hr = this.transformCSS(t, `${St}`, "dark", "variable", f, o, r);
    g = `${fr}${hr}`, $ = [.../* @__PURE__ */ new Set([...v, ...Oe, ...ar])];
    let mr = this.transformCSS(t, `${lr}${ur}color-scheme:light`, "light", "variable", f, o, r), br = this.transformCSS(t, `${cr}color-scheme:dark`, "dark", "variable", f, o, r);
    C = `${mr}${br}`, T = [.../* @__PURE__ */ new Set([...sr, ...dr, ...pr])], h = me(p.css, { dt: Re });
  }
  return { primitive: { css: m, tokens: y }, semantic: { css: g, tokens: $ }, global: { css: C, tokens: T }, style: h };
}, getPreset({ name: t = "", preset: e = {}, options: n, params: o, set: r, defaults: i, selector: l }) {
  var s, a, u;
  let d, c, p;
  if (V(e) && n.transform !== "strict") {
    let f = t.replace("-directive", ""), m = e, { colorScheme: y, extend: g, css: $ } = m, C = Ie(m, ["colorScheme", "extend", "css"]), T = g || {}, { colorScheme: h } = T, O = Ie(T, ["colorScheme"]), D = y || {}, { dark: L } = D, M = Ie(D, ["dark"]), q = h || {}, { dark: Z } = q, B = Ie(q, ["dark"]), U = V(C) ? this._toVariables({ [f]: ye(ye({}, C), O) }, n) : {}, ie = V(M) ? this._toVariables({ [f]: ye(ye({}, M), B) }, n) : {}, ae = V(L) ? this._toVariables({ [f]: ye(ye({}, L), Z) }, n) : {}, [X, ne] = [(s = U.declarations) != null ? s : "", U.tokens || []], [le, xe] = [(a = ie.declarations) != null ? a : "", ie.tokens || []], [Q, oe] = [(u = ae.declarations) != null ? u : "", ae.tokens || []], ee = this.transformCSS(f, `${X}${le}`, "light", "variable", n, r, i, l), ge = this.transformCSS(f, Q, "dark", "variable", n, r, i, l);
    d = `${ee}${ge}`, c = [.../* @__PURE__ */ new Set([...ne, ...xe, ...oe])], p = me($, { dt: Re });
  }
  return { css: d, tokens: c, style: p };
}, getPresetC({ name: t = "", theme: e = {}, params: n, set: o, defaults: r }) {
  var i;
  let { preset: l, options: s } = e, a = (i = l?.components) == null ? void 0 : i[t];
  return this.getPreset({ name: t, preset: a, options: s, params: n, set: o, defaults: r });
}, getPresetD({ name: t = "", theme: e = {}, params: n, set: o, defaults: r }) {
  var i, l;
  let s = t.replace("-directive", ""), { preset: a, options: u } = e, d = ((i = a?.components) == null ? void 0 : i[s]) || ((l = a?.directives) == null ? void 0 : l[s]);
  return this.getPreset({ name: s, preset: d, options: u, params: n, set: o, defaults: r });
}, applyDarkColorScheme(t) {
  return !(t.darkModeSelector === "none" || t.darkModeSelector === !1);
}, getColorSchemeOption(t, e) {
  var n;
  return this.applyDarkColorScheme(t) ? this.regex.resolve(t.darkModeSelector === !0 ? e.options.darkModeSelector : (n = t.darkModeSelector) != null ? n : e.options.darkModeSelector) : [];
}, getLayerOrder(t, e = {}, n, o) {
  let { cssLayer: r } = e;
  return r ? `@layer ${me(r.order || r.name || "primeui", n)}` : "";
}, getCommonStyleSheet({ name: t = "", theme: e = {}, params: n, props: o = {}, set: r, defaults: i }) {
  let l = this.getCommon({ name: t, theme: e, params: n, set: r, defaults: i }), s = Object.entries(o).reduce((a, [u, d]) => a.push(`${u}="${d}"`) && a, []).join(" ");
  return Object.entries(l || {}).reduce((a, [u, d]) => {
    if (Ce(d) && Object.hasOwn(d, "css")) {
      let c = tt(d.css), p = `${u}-variables`;
      a.push(`<style type="text/css" data-primevue-style-id="${p}" ${s}>${c}</style>`);
    }
    return a;
  }, []).join("");
}, getStyleSheet({ name: t = "", theme: e = {}, params: n, props: o = {}, set: r, defaults: i }) {
  var l;
  let s = { name: t, theme: e, params: n, set: r, defaults: i }, a = (l = t.includes("-directive") ? this.getPresetD(s) : this.getPresetC(s)) == null ? void 0 : l.css, u = Object.entries(o).reduce((d, [c, p]) => d.push(`${c}="${p}"`) && d, []).join(" ");
  return a ? `<style type="text/css" data-primevue-style-id="${t}-variables" ${u}>${tt(a)}</style>` : "";
}, createTokens(t = {}, e, n = "", o = "", r = {}) {
  let i = function(s, a = {}, u = []) {
    if (u.includes(this.path)) return console.warn(`Circular reference detected at ${this.path}`), { colorScheme: s, path: this.path, paths: a, value: void 0 };
    u.push(this.path), a.name = this.path, a.binding || (a.binding = {});
    let d = this.value;
    if (typeof this.value == "string" && rt.test(this.value)) {
      let c = this.value.trim().replace(rt, (p) => {
        var f;
        let m = p.slice(1, -1), y = this.tokens[m];
        if (!y) return console.warn(`Token not found for path: ${m}`), "__UNRESOLVED__";
        let g = y.computed(s, a, u);
        return Array.isArray(g) && g.length === 2 ? `light-dark(${g[0].value},${g[1].value})` : (f = g?.value) != null ? f : "__UNRESOLVED__";
      });
      d = zo.test(c.replace(jo, "0")) ? `calc(${c})` : c;
    }
    return He(a.binding) && delete a.binding, u.pop(), { colorScheme: s, path: this.path, paths: a, value: d.includes("__UNRESOLVED__") ? void 0 : d };
  }, l = (s, a, u) => {
    Object.entries(s).forEach(([d, c]) => {
      let p = Be(d, e.variable.excludedKeyRegex) ? a : a ? `${a}.${Ln(d)}` : Ln(d), f = u ? `${u}.${d}` : d;
      Ce(c) ? l(c, p, f) : (r[p] || (r[p] = { paths: [], computed: (m, y = {}, g = []) => {
        if (r[p].paths.length === 1) return r[p].paths[0].computed(r[p].paths[0].scheme, y.binding, g);
        if (m && m !== "none") for (let $ = 0; $ < r[p].paths.length; $++) {
          let C = r[p].paths[$];
          if (C.scheme === m) return C.computed(m, y.binding, g);
        }
        return r[p].paths.map(($) => $.computed($.scheme, y[$.scheme], g));
      } }), r[p].paths.push({ path: f, value: c, scheme: f.includes("colorScheme.light") ? "light" : f.includes("colorScheme.dark") ? "dark" : "none", computed: i, tokens: r }));
    });
  };
  return l(t, n, o), r;
}, getTokenValue(t, e, n) {
  var o;
  let r = ((s) => s.split(".").filter((a) => !Be(a.toLowerCase(), n.variable.excludedKeyRegex)).join("."))(e), i = e.includes("colorScheme.light") ? "light" : e.includes("colorScheme.dark") ? "dark" : void 0, l = [(o = t[r]) == null ? void 0 : o.computed(i)].flat().filter((s) => s);
  return l.length === 1 ? l[0].value : l.reduce((s = {}, a) => {
    let u = a, { colorScheme: d } = u, c = Ie(u, ["colorScheme"]);
    return s[d] = c, s;
  }, void 0);
}, getSelectorRule(t, e, n, o) {
  return n === "class" || n === "attr" ? qe(V(e) ? `${t}${e},${t} ${e}` : t, o) : qe(t, qe(e ?? ":root,:host", o));
}, transformCSS(t, e, n, o, r = {}, i, l, s) {
  if (V(e)) {
    let { cssLayer: a } = r;
    if (o !== "style") {
      let u = this.getColorSchemeOption(r, l);
      e = n === "dark" ? u.reduce((d, { type: c, selector: p }) => (V(p) && (d += p.includes("[CSS]") ? p.replace("[CSS]", e) : this.getSelectorRule(p, s, c, e)), d), "") : qe(s ?? ":root,:host", e);
    }
    if (a) {
      let u = { name: "primeui" };
      Ce(a) && (u.name = me(a.name, { name: t, type: o })), V(u.name) && (e = qe(`@layer ${u.name}`, e), i?.layerNames(u.name));
    }
    return e;
  }
  return "";
} }, H = { defaults: { variable: { prefix: "p", selector: ":root,:host", excludedKeyRegex: /^(primitive|semantic|components|directives|variables|colorscheme|light|dark|common|root|states|extend|css)$/gi }, options: { prefix: "p", darkModeSelector: "system", cssLayer: !1 } }, _theme: void 0, _layerNames: /* @__PURE__ */ new Set(), _loadedStyleNames: /* @__PURE__ */ new Set(), _loadingStyles: /* @__PURE__ */ new Set(), _tokens: {}, update(t = {}) {
  let { theme: e } = t;
  e && (this._theme = Nt(ye({}, e), { options: ye(ye({}, this.defaults.options), e.options) }), this._tokens = ve.createTokens(this.preset, this.defaults), this.clearLoadedStyleNames());
}, get theme() {
  return this._theme;
}, get preset() {
  var t;
  return ((t = this.theme) == null ? void 0 : t.preset) || {};
}, get options() {
  var t;
  return ((t = this.theme) == null ? void 0 : t.options) || {};
}, get tokens() {
  return this._tokens;
}, getTheme() {
  return this.theme;
}, setTheme(t) {
  this.update({ theme: t }), te.emit("theme:change", t);
}, getPreset() {
  return this.preset;
}, setPreset(t) {
  this._theme = Nt(ye({}, this.theme), { preset: t }), this._tokens = ve.createTokens(t, this.defaults), this.clearLoadedStyleNames(), te.emit("preset:change", t), te.emit("theme:change", this.theme);
}, getOptions() {
  return this.options;
}, setOptions(t) {
  this._theme = Nt(ye({}, this.theme), { options: t }), this.clearLoadedStyleNames(), te.emit("options:change", t), te.emit("theme:change", this.theme);
}, getLayerNames() {
  return [...this._layerNames];
}, setLayerNames(t) {
  this._layerNames.add(t);
}, getLoadedStyleNames() {
  return this._loadedStyleNames;
}, isStyleNameLoaded(t) {
  return this._loadedStyleNames.has(t);
}, setLoadedStyleName(t) {
  this._loadedStyleNames.add(t);
}, deleteLoadedStyleName(t) {
  this._loadedStyleNames.delete(t);
}, clearLoadedStyleNames() {
  this._loadedStyleNames.clear();
}, getTokenValue(t) {
  return ve.getTokenValue(this.tokens, t, this.defaults);
}, getCommon(t = "", e) {
  return ve.getCommon({ name: t, theme: this.theme, params: e, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } });
}, getComponent(t = "", e) {
  let n = { name: t, theme: this.theme, params: e, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } };
  return ve.getPresetC(n);
}, getDirective(t = "", e) {
  let n = { name: t, theme: this.theme, params: e, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } };
  return ve.getPresetD(n);
}, getCustomPreset(t = "", e, n, o) {
  let r = { name: t, preset: e, options: this.options, selector: n, params: o, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } };
  return ve.getPreset(r);
}, getLayerOrderCSS(t = "") {
  return ve.getLayerOrder(t, this.options, { names: this.getLayerNames() }, this.defaults);
}, transformCSS(t = "", e, n = "style", o) {
  return ve.transformCSS(t, e, o, n, this.options, { layerNames: this.setLayerNames.bind(this) }, this.defaults);
}, getCommonStyleSheet(t = "", e, n = {}) {
  return ve.getCommonStyleSheet({ name: t, theme: this.theme, params: e, props: n, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } });
}, getStyleSheet(t, e, n = {}) {
  return ve.getStyleSheet({ name: t, theme: this.theme, params: e, props: n, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } });
}, onStyleMounted(t) {
  this._loadingStyles.add(t);
}, onStyleUpdated(t) {
  this._loadingStyles.add(t);
}, onStyleLoaded(t, { name: e }) {
  this._loadingStyles.size && (this._loadingStyles.delete(e), te.emit(`theme:${e}:load`, t), !this._loadingStyles.size && te.emit("theme:load"));
} }, re = {
  STARTS_WITH: "startsWith",
  CONTAINS: "contains",
  NOT_CONTAINS: "notContains",
  ENDS_WITH: "endsWith",
  EQUALS: "equals",
  NOT_EQUALS: "notEquals",
  LESS_THAN: "lt",
  LESS_THAN_OR_EQUAL_TO: "lte",
  GREATER_THAN: "gt",
  GREATER_THAN_OR_EQUAL_TO: "gte",
  DATE_IS: "dateIs",
  DATE_IS_NOT: "dateIsNot",
  DATE_BEFORE: "dateBefore",
  DATE_AFTER: "dateAfter"
};
function Tn(t, e) {
  var n = typeof Symbol < "u" && t[Symbol.iterator] || t["@@iterator"];
  if (!n) {
    if (Array.isArray(t) || (n = ci(t)) || e) {
      n && (t = n);
      var o = 0, r = function() {
      };
      return { s: r, n: function() {
        return o >= t.length ? { done: !0 } : { done: !1, value: t[o++] };
      }, e: function(u) {
        throw u;
      }, f: r };
    }
    throw new TypeError(`Invalid attempt to iterate non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
  }
  var i, l = !0, s = !1;
  return { s: function() {
    n = n.call(t);
  }, n: function() {
    var u = n.next();
    return l = u.done, u;
  }, e: function(u) {
    s = !0, i = u;
  }, f: function() {
    try {
      l || n.return == null || n.return();
    } finally {
      if (s) throw i;
    }
  } };
}
function ci(t, e) {
  if (t) {
    if (typeof t == "string") return Pn(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Pn(t, e) : void 0;
  }
}
function Pn(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, o = Array(e); n < e; n++) o[n] = t[n];
  return o;
}
var pi = {
  filter: function(e, n, o, r, i) {
    var l = [];
    if (!e)
      return l;
    var s = Tn(e), a;
    try {
      for (s.s(); !(a = s.n()).done; ) {
        var u = a.value;
        if (typeof u == "string") {
          if (this.filters[r](u, o, i)) {
            l.push(u);
            continue;
          }
        } else {
          var d = Tn(n), c;
          try {
            for (d.s(); !(c = d.n()).done; ) {
              var p = c.value, f = _e(u, p);
              if (this.filters[r](f, o, i)) {
                l.push(u);
                break;
              }
            }
          } catch (m) {
            d.e(m);
          } finally {
            d.f();
          }
        }
      }
    } catch (m) {
      s.e(m);
    } finally {
      s.f();
    }
    return l;
  },
  filters: {
    startsWith: function(e, n, o) {
      if (n == null || n === "")
        return !0;
      if (e == null)
        return !1;
      var r = be(n.toString()).toLocaleLowerCase(o), i = be(e.toString()).toLocaleLowerCase(o);
      return i.slice(0, r.length) === r;
    },
    contains: function(e, n, o) {
      if (n == null || n === "")
        return !0;
      if (e == null)
        return !1;
      var r = be(n.toString()).toLocaleLowerCase(o), i = be(e.toString()).toLocaleLowerCase(o);
      return i.indexOf(r) !== -1;
    },
    notContains: function(e, n, o) {
      if (n == null || n === "")
        return !0;
      if (e == null)
        return !1;
      var r = be(n.toString()).toLocaleLowerCase(o), i = be(e.toString()).toLocaleLowerCase(o);
      return i.indexOf(r) === -1;
    },
    endsWith: function(e, n, o) {
      if (n == null || n === "")
        return !0;
      if (e == null)
        return !1;
      var r = be(n.toString()).toLocaleLowerCase(o), i = be(e.toString()).toLocaleLowerCase(o);
      return i.indexOf(r, i.length - r.length) !== -1;
    },
    equals: function(e, n, o) {
      return n == null || n === "" ? !0 : e == null ? !1 : e.getTime && n.getTime ? e.getTime() === n.getTime() : be(e.toString()).toLocaleLowerCase(o) == be(n.toString()).toLocaleLowerCase(o);
    },
    notEquals: function(e, n, o) {
      return n == null || n === "" ? !1 : e == null ? !0 : e.getTime && n.getTime ? e.getTime() !== n.getTime() : be(e.toString()).toLocaleLowerCase(o) != be(n.toString()).toLocaleLowerCase(o);
    },
    in: function(e, n) {
      if (n == null || n.length === 0)
        return !0;
      for (var o = 0; o < n.length; o++)
        if (yo(e, n[o]))
          return !0;
      return !1;
    },
    between: function(e, n) {
      return n == null || n[0] == null || n[1] == null ? !0 : e == null ? !1 : e.getTime ? n[0].getTime() <= e.getTime() && e.getTime() <= n[1].getTime() : n[0] <= e && e <= n[1];
    },
    lt: function(e, n) {
      return n == null ? !0 : e == null ? !1 : e.getTime && n.getTime ? e.getTime() < n.getTime() : e < n;
    },
    lte: function(e, n) {
      return n == null ? !0 : e == null ? !1 : e.getTime && n.getTime ? e.getTime() <= n.getTime() : e <= n;
    },
    gt: function(e, n) {
      return n == null ? !0 : e == null ? !1 : e.getTime && n.getTime ? e.getTime() > n.getTime() : e > n;
    },
    gte: function(e, n) {
      return n == null ? !0 : e == null ? !1 : e.getTime && n.getTime ? e.getTime() >= n.getTime() : e >= n;
    },
    dateIs: function(e, n) {
      return n == null ? !0 : e == null ? !1 : (typeof e == "string" && (e = new Date(e)), typeof n == "string" && (n = new Date(n)), e.toDateString() === n.toDateString());
    },
    dateIsNot: function(e, n) {
      return n == null ? !0 : e == null ? !1 : (typeof e == "string" && (e = new Date(e)), typeof n == "string" && (n = new Date(n)), e.toDateString() !== n.toDateString());
    },
    dateBefore: function(e, n) {
      return n == null ? !0 : e == null ? !1 : (typeof e == "string" && (e = new Date(e)), typeof n == "string" && (n = new Date(n)), e.getTime() < n.getTime());
    },
    dateAfter: function(e, n) {
      return n == null ? !0 : e == null ? !1 : (typeof e == "string" && (e = new Date(e)), typeof n == "string" && (n = new Date(n)), e.getTime() > n.getTime());
    }
  },
  register: function(e, n) {
    this.filters[e] = n;
  }
}, fi = `
    *,
    ::before,
    ::after {
        box-sizing: border-box;
    }

    .p-collapsible-enter-active {
        animation: p-animate-collapsible-expand 0.2s ease-out;
        overflow: hidden;
    }

    .p-collapsible-leave-active {
        animation: p-animate-collapsible-collapse 0.2s ease-out;
        overflow: hidden;
    }

    @keyframes p-animate-collapsible-expand {
        from {
            grid-template-rows: 0fr;
        }
        to {
            grid-template-rows: 1fr;
        }
    }

    @keyframes p-animate-collapsible-collapse {
        from {
            grid-template-rows: 1fr;
        }
        to {
            grid-template-rows: 0fr;
        }
    }

    .p-disabled,
    .p-disabled * {
        cursor: default;
        pointer-events: none;
        user-select: none;
    }

    .p-disabled,
    .p-component:disabled {
        opacity: dt('disabled.opacity');
    }

    .pi {
        font-size: dt('icon.size');
    }

    .p-icon {
        width: dt('icon.size');
        height: dt('icon.size');
    }

    .p-overlay-mask {
        background: var(--px-mask-background, dt('mask.background'));
        color: dt('mask.color');
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
    }

    .p-overlay-mask-enter-active {
        animation: p-animate-overlay-mask-enter dt('mask.transition.duration') forwards;
    }

    .p-overlay-mask-leave-active {
        animation: p-animate-overlay-mask-leave dt('mask.transition.duration') forwards;
    }

    @keyframes p-animate-overlay-mask-enter {
        from {
            background: transparent;
        }
        to {
            background: var(--px-mask-background, dt('mask.background'));
        }
    }
    @keyframes p-animate-overlay-mask-leave {
        from {
            background: var(--px-mask-background, dt('mask.background'));
        }
        to {
            background: transparent;
        }
    }

    .p-anchored-overlay-enter-active {
        animation: p-animate-anchored-overlay-enter 300ms cubic-bezier(.19,1,.22,1);
    }

    .p-anchored-overlay-leave-active {
        animation: p-animate-anchored-overlay-leave 300ms cubic-bezier(.19,1,.22,1);
    }

    @keyframes p-animate-anchored-overlay-enter {
        from {
            opacity: 0;
            transform: scale(0.93);
        }
    }

    @keyframes p-animate-anchored-overlay-leave {
        to {
            opacity: 0;
            transform: scale(0.93);
        }
    }
`;
function it(t) {
  "@babel/helpers - typeof";
  return it = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, it(t);
}
function An(t, e) {
  var n = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(t);
    e && (o = o.filter(function(r) {
      return Object.getOwnPropertyDescriptor(t, r).enumerable;
    })), n.push.apply(n, o);
  }
  return n;
}
function En(t) {
  for (var e = 1; e < arguments.length; e++) {
    var n = arguments[e] != null ? arguments[e] : {};
    e % 2 ? An(Object(n), !0).forEach(function(o) {
      hi(t, o, n[o]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(n)) : An(Object(n)).forEach(function(o) {
      Object.defineProperty(t, o, Object.getOwnPropertyDescriptor(n, o));
    });
  }
  return t;
}
function hi(t, e, n) {
  return (e = mi(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function mi(t) {
  var e = bi(t, "string");
  return it(e) == "symbol" ? e : e + "";
}
function bi(t, e) {
  if (it(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(t, e);
    if (it(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
function gi(t) {
  var e = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0;
  kn() && kn().components ? mo(t) : e ? t() : wr(t);
}
var vi = 0;
function yi(t) {
  var e = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, n = K(!1), o = K(t), r = K(null), i = To() ? window.document : void 0, l = e.document, s = l === void 0 ? i : l, a = e.immediate, u = a === void 0 ? !0 : a, d = e.manual, c = d === void 0 ? !1 : d, p = e.name, f = p === void 0 ? "style_".concat(++vi) : p, m = e.id, y = m === void 0 ? void 0 : m, g = e.media, $ = g === void 0 ? void 0 : g, C = e.nonce, T = C === void 0 ? void 0 : C, h = e.first, O = h === void 0 ? !1 : h, D = e.onMounted, L = D === void 0 ? void 0 : D, M = e.onUpdated, q = M === void 0 ? void 0 : M, Z = e.onLoad, B = Z === void 0 ? void 0 : Z, U = e.props, ie = U === void 0 ? {} : U, ae = function() {
  }, X = function(xe) {
    var Q = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    if (s) {
      var oe = En(En({}, ie), Q), ee = oe.name || f, ge = oe.id || y, Ue = oe.nonce || T;
      r.value = s.querySelector('style[data-primevue-style-id="'.concat(ee, '"]')) || s.getElementById(ge) || s.createElement("style"), r.value.isConnected || (o.value = xe || t, Tt(r.value, {
        type: "text/css",
        id: ge,
        media: $,
        nonce: Ue
      }), O ? s.head.prepend(r.value) : s.head.appendChild(r.value), Po(r.value, "data-primevue-style-id", ee), Tt(r.value, oe), r.value.onload = function(Te) {
        return B?.(Te, {
          name: ee
        });
      }, L?.(ee)), !n.value && (ae = Me(o, function(Te) {
        r.value.textContent = Te, q?.(ee);
      }, {
        immediate: !0
      }), n.value = !0);
    }
  }, ne = function() {
    !s || !n.value || (ae(), Gr(r.value) && s.head.removeChild(r.value), n.value = !1, r.value = null);
  };
  return u && !c && gi(X), {
    id: y,
    name: f,
    el: r,
    css: o,
    unload: ne,
    load: X,
    isLoaded: yr(n)
  };
}
function at(t) {
  "@babel/helpers - typeof";
  return at = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, at(t);
}
var zn, jn, Dn, Fn;
function Mn(t, e) {
  return Si(t) || ki(t, e) || xi(t, e) || wi();
}
function wi() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function xi(t, e) {
  if (t) {
    if (typeof t == "string") return Vn(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Vn(t, e) : void 0;
  }
}
function Vn(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, o = Array(e); n < e; n++) o[n] = t[n];
  return o;
}
function ki(t, e) {
  var n = t == null ? null : typeof Symbol < "u" && t[Symbol.iterator] || t["@@iterator"];
  if (n != null) {
    var o, r, i, l, s = [], a = !0, u = !1;
    try {
      if (i = (n = n.call(t)).next, e !== 0) for (; !(a = (o = i.call(n)).done) && (s.push(o.value), s.length !== e); a = !0) ;
    } catch (d) {
      u = !0, r = d;
    } finally {
      try {
        if (!a && n.return != null && (l = n.return(), Object(l) !== l)) return;
      } finally {
        if (u) throw r;
      }
    }
    return s;
  }
}
function Si(t) {
  if (Array.isArray(t)) return t;
}
function Nn(t, e) {
  var n = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(t);
    e && (o = o.filter(function(r) {
      return Object.getOwnPropertyDescriptor(t, r).enumerable;
    })), n.push.apply(n, o);
  }
  return n;
}
function Bt(t) {
  for (var e = 1; e < arguments.length; e++) {
    var n = arguments[e] != null ? arguments[e] : {};
    e % 2 ? Nn(Object(n), !0).forEach(function(o) {
      $i(t, o, n[o]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(n)) : Nn(Object(n)).forEach(function(o) {
      Object.defineProperty(t, o, Object.getOwnPropertyDescriptor(n, o));
    });
  }
  return t;
}
function $i(t, e, n) {
  return (e = Ci(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function Ci(t) {
  var e = Oi(t, "string");
  return at(e) == "symbol" ? e : e + "";
}
function Oi(t, e) {
  if (at(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(t, e);
    if (at(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
function It(t, e) {
  return e || (e = t.slice(0)), Object.freeze(Object.defineProperties(t, { raw: { value: Object.freeze(e) } }));
}
var Ii = function(e) {
  var n = e.dt;
  return `
.p-hidden-accessible {
    border: 0;
    clip: rect(0 0 0 0);
    height: 1px;
    margin: -1px;
    opacity: 0;
    overflow: hidden;
    padding: 0;
    pointer-events: none;
    position: absolute;
    white-space: nowrap;
    width: 1px;
}

.p-overflow-hidden {
    overflow: hidden;
    padding-right: `.concat(n("scrollbar.width"), `;
}
`);
}, _i = {}, Li = {}, R = {
  name: "base",
  css: Ii,
  style: fi,
  classes: _i,
  inlineStyles: Li,
  load: function(e) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, o = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : function(i) {
      return i;
    }, r = o(Ot(zn || (zn = It(["", ""])), e));
    return V(r) ? yi(tt(r), Bt({
      name: this.name
    }, n)) : {};
  },
  loadCSS: function() {
    var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    return this.load(this.css, e);
  },
  loadStyle: function() {
    var e = this, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, o = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "";
    return this.load(this.style, n, function() {
      var r = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "";
      return H.transformCSS(n.name || e.name, "".concat(r).concat(Ot(jn || (jn = It(["", ""])), o)));
    });
  },
  getCommonTheme: function(e) {
    return H.getCommon(this.name, e);
  },
  getComponentTheme: function(e) {
    return H.getComponent(this.name, e);
  },
  getDirectiveTheme: function(e) {
    return H.getDirective(this.name, e);
  },
  getPresetTheme: function(e, n, o) {
    return H.getCustomPreset(this.name, e, n, o);
  },
  getLayerOrderThemeCSS: function() {
    return H.getLayerOrderCSS(this.name);
  },
  getStyleSheet: function() {
    var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    if (this.css) {
      var o = me(this.css, {
        dt: Re
      }) || "", r = tt(Ot(Dn || (Dn = It(["", "", ""])), o, e)), i = Object.entries(n).reduce(function(l, s) {
        var a = Mn(s, 2), u = a[0], d = a[1];
        return l.push("".concat(u, '="').concat(d, '"')) && l;
      }, []).join(" ");
      return V(r) ? '<style type="text/css" data-primevue-style-id="'.concat(this.name, '" ').concat(i, ">").concat(r, "</style>") : "";
    }
    return "";
  },
  getCommonThemeStyleSheet: function(e) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    return H.getCommonStyleSheet(this.name, e, n);
  },
  getThemeStyleSheet: function(e) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, o = [H.getStyleSheet(this.name, e, n)];
    if (this.style) {
      var r = this.name === "base" ? "global-style" : "".concat(this.name, "-style"), i = Ot(Fn || (Fn = It(["", ""])), me(this.style, {
        dt: Re
      })), l = tt(H.transformCSS(r, i)), s = Object.entries(n).reduce(function(a, u) {
        var d = Mn(u, 2), c = d[0], p = d[1];
        return a.push("".concat(c, '="').concat(p, '"')) && a;
      }, []).join(" ");
      V(l) && o.push('<style type="text/css" data-primevue-style-id="'.concat(r, '" ').concat(s, ">").concat(l, "</style>"));
    }
    return o.join("");
  },
  extend: function(e) {
    return Bt(Bt({}, this), {}, {
      css: void 0,
      style: void 0
    }, e);
  }
}, Ae = hn();
function lt(t) {
  "@babel/helpers - typeof";
  return lt = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, lt(t);
}
function Bn(t, e) {
  var n = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(t);
    e && (o = o.filter(function(r) {
      return Object.getOwnPropertyDescriptor(t, r).enumerable;
    })), n.push.apply(n, o);
  }
  return n;
}
function _t(t) {
  for (var e = 1; e < arguments.length; e++) {
    var n = arguments[e] != null ? arguments[e] : {};
    e % 2 ? Bn(Object(n), !0).forEach(function(o) {
      Ti(t, o, n[o]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(n)) : Bn(Object(n)).forEach(function(o) {
      Object.defineProperty(t, o, Object.getOwnPropertyDescriptor(n, o));
    });
  }
  return t;
}
function Ti(t, e, n) {
  return (e = Pi(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function Pi(t) {
  var e = Ai(t, "string");
  return lt(e) == "symbol" ? e : e + "";
}
function Ai(t, e) {
  if (lt(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(t, e);
    if (lt(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var Ei = {
  ripple: !1,
  inputStyle: null,
  inputVariant: null,
  locale: {
    startsWith: "Starts with",
    contains: "Contains",
    notContains: "Not contains",
    endsWith: "Ends with",
    equals: "Equals",
    notEquals: "Not equals",
    noFilter: "No Filter",
    lt: "Less than",
    lte: "Less than or equal to",
    gt: "Greater than",
    gte: "Greater than or equal to",
    dateIs: "Date is",
    dateIsNot: "Date is not",
    dateBefore: "Date is before",
    dateAfter: "Date is after",
    clear: "Clear",
    apply: "Apply",
    matchAll: "Match All",
    matchAny: "Match Any",
    addRule: "Add Rule",
    removeRule: "Remove Rule",
    accept: "Yes",
    reject: "No",
    choose: "Choose",
    upload: "Upload",
    cancel: "Cancel",
    completed: "Completed",
    pending: "Pending",
    fileSizeTypes: ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"],
    dayNames: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    dayNamesShort: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    dayNamesMin: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
    monthNames: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    monthNamesShort: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    chooseYear: "Choose Year",
    chooseMonth: "Choose Month",
    chooseDate: "Choose Date",
    prevDecade: "Previous Decade",
    nextDecade: "Next Decade",
    prevYear: "Previous Year",
    nextYear: "Next Year",
    prevMonth: "Previous Month",
    nextMonth: "Next Month",
    prevHour: "Previous Hour",
    nextHour: "Next Hour",
    prevMinute: "Previous Minute",
    nextMinute: "Next Minute",
    prevSecond: "Previous Second",
    nextSecond: "Next Second",
    am: "am",
    pm: "pm",
    today: "Today",
    weekHeader: "Wk",
    firstDayOfWeek: 0,
    showMonthAfterYear: !1,
    dateFormat: "mm/dd/yy",
    weak: "Weak",
    medium: "Medium",
    strong: "Strong",
    passwordPrompt: "Enter a password",
    emptyFilterMessage: "No results found",
    searchMessage: "{0} results are available",
    selectionMessage: "{0} items selected",
    emptySelectionMessage: "No selected item",
    emptySearchMessage: "No results found",
    fileChosenMessage: "{0} files",
    noFileChosenMessage: "No file chosen",
    emptyMessage: "No available options",
    aria: {
      trueLabel: "True",
      falseLabel: "False",
      nullLabel: "Not Selected",
      star: "1 star",
      stars: "{star} stars",
      selectAll: "All items selected",
      unselectAll: "All items unselected",
      close: "Close",
      previous: "Previous",
      next: "Next",
      navigation: "Navigation",
      scrollTop: "Scroll Top",
      moveTop: "Move Top",
      moveUp: "Move Up",
      moveDown: "Move Down",
      moveBottom: "Move Bottom",
      moveToTarget: "Move to Target",
      moveToSource: "Move to Source",
      moveAllToTarget: "Move All to Target",
      moveAllToSource: "Move All to Source",
      pageLabel: "Page {page}",
      firstPageLabel: "First Page",
      lastPageLabel: "Last Page",
      nextPageLabel: "Next Page",
      prevPageLabel: "Previous Page",
      rowsPerPageLabel: "Rows per page",
      jumpToPageDropdownLabel: "Jump to Page Dropdown",
      jumpToPageInputLabel: "Jump to Page Input",
      selectRow: "Row Selected",
      unselectRow: "Row Unselected",
      expandRow: "Row Expanded",
      collapseRow: "Row Collapsed",
      showFilterMenu: "Show Filter Menu",
      hideFilterMenu: "Hide Filter Menu",
      filterOperator: "Filter Operator",
      filterConstraint: "Filter Constraint",
      editRow: "Row Edit",
      saveEdit: "Save Edit",
      cancelEdit: "Cancel Edit",
      listView: "List View",
      gridView: "Grid View",
      slide: "Slide",
      slideNumber: "{slideNumber}",
      zoomImage: "Zoom Image",
      zoomIn: "Zoom In",
      zoomOut: "Zoom Out",
      rotateRight: "Rotate Right",
      rotateLeft: "Rotate Left",
      listLabel: "Option List"
    }
  },
  filterMatchModeOptions: {
    text: [re.STARTS_WITH, re.CONTAINS, re.NOT_CONTAINS, re.ENDS_WITH, re.EQUALS, re.NOT_EQUALS],
    numeric: [re.EQUALS, re.NOT_EQUALS, re.LESS_THAN, re.LESS_THAN_OR_EQUAL_TO, re.GREATER_THAN, re.GREATER_THAN_OR_EQUAL_TO],
    date: [re.DATE_IS, re.DATE_IS_NOT, re.DATE_BEFORE, re.DATE_AFTER]
  },
  zIndex: {
    modal: 1100,
    overlay: 1e3,
    menu: 1e3,
    tooltip: 1100
  },
  theme: void 0,
  unstyled: !1,
  pt: void 0,
  ptOptions: {
    mergeSections: !0,
    mergeProps: !1
  },
  csp: {
    nonce: void 0
  }
}, zi = Symbol();
function ji(t, e) {
  var n = {
    config: xr(e)
  };
  return t.config.globalProperties.$primevue = n, t.provide(zi, n), Di(), Fi(t, n), n;
}
var Ye = [];
function Di() {
  te.clear(), Ye.forEach(function(t) {
    return t?.();
  }), Ye = [];
}
function Fi(t, e) {
  var n = K(!1), o = function() {
    var u;
    if (((u = e.config) === null || u === void 0 ? void 0 : u.theme) !== "none" && !H.isStyleNameLoaded("common")) {
      var d, c, p = ((d = R.getCommonTheme) === null || d === void 0 ? void 0 : d.call(R)) || {}, f = p.primitive, m = p.semantic, y = p.global, g = p.style, $ = {
        nonce: (c = e.config) === null || c === void 0 || (c = c.csp) === null || c === void 0 ? void 0 : c.nonce
      };
      R.load(f?.css, _t({
        name: "primitive-variables"
      }, $)), R.load(m?.css, _t({
        name: "semantic-variables"
      }, $)), R.load(y?.css, _t({
        name: "global-variables"
      }, $)), R.loadStyle(_t({
        name: "global-style"
      }, $), g), H.setLoadedStyleName("common");
    }
  };
  te.on("theme:change", function(a) {
    n.value || (t.config.globalProperties.$primevue.config.theme = a, n.value = !0);
  });
  var r = Me(e.config, function(a, u) {
    Ae.emit("config:change", {
      newValue: a,
      oldValue: u
    });
  }, {
    immediate: !0,
    deep: !0
  }), i = Me(function() {
    return e.config.ripple;
  }, function(a, u) {
    Ae.emit("config:ripple:change", {
      newValue: a,
      oldValue: u
    });
  }, {
    immediate: !0,
    deep: !0
  }), l = Me(function() {
    return e.config.theme;
  }, function(a, u) {
    n.value || H.setTheme(a), e.config.unstyled || o(), n.value = !1, Ae.emit("config:theme:change", {
      newValue: a,
      oldValue: u
    });
  }, {
    immediate: !0,
    deep: !1
  }), s = Me(function() {
    return e.config.unstyled;
  }, function(a, u) {
    !a && e.config.theme && o(), Ae.emit("config:unstyled:change", {
      newValue: a,
      oldValue: u
    });
  }, {
    immediate: !0,
    deep: !0
  });
  Ye.push(r), Ye.push(i), Ye.push(l), Ye.push(s);
}
var Mi = {
  install: function(e, n) {
    var o = Dr(Ei, n);
    ji(e, o);
  }
}, Ft = {
  name: "Portal",
  props: {
    appendTo: {
      type: [String, Object],
      default: "body"
    },
    disabled: {
      type: Boolean,
      default: !1
    }
  },
  data: function() {
    return {
      mounted: !1
    };
  },
  mounted: function() {
    this.mounted = To();
  },
  computed: {
    inline: function() {
      return this.disabled || this.appendTo === "self";
    }
  }
};
function Vi(t, e, n, o, r, i) {
  return i.inline ? j(t.$slots, "default", {
    key: 0
  }) : r.mounted ? (b(), fe(bo, {
    key: 1,
    to: n.appendTo
  }, [j(t.$slots, "default")], 8, ["to"])) : P("", !0);
}
Ft.render = Vi;
var Pe = {
  _loadedStyleNames: /* @__PURE__ */ new Set(),
  getLoadedStyleNames: function() {
    return this._loadedStyleNames;
  },
  isStyleNameLoaded: function(e) {
    return this._loadedStyleNames.has(e);
  },
  setLoadedStyleName: function(e) {
    this._loadedStyleNames.add(e);
  },
  deleteLoadedStyleName: function(e) {
    this._loadedStyleNames.delete(e);
  },
  clearLoadedStyleNames: function() {
    this._loadedStyleNames.clear();
  }
};
function Ni() {
  var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "pc", e = kr();
  return "".concat(t).concat(e.replace("v-", "").replaceAll("-", "_"));
}
var Rn = R.extend({
  name: "common"
});
function st(t) {
  "@babel/helpers - typeof";
  return st = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, st(t);
}
function Bi(t) {
  return Ro(t) || Ri(t) || Bo(t) || No();
}
function Ri(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function Je(t, e) {
  return Ro(t) || Hi(t, e) || Bo(t, e) || No();
}
function No() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Bo(t, e) {
  if (t) {
    if (typeof t == "string") return Zt(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Zt(t, e) : void 0;
  }
}
function Zt(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, o = Array(e); n < e; n++) o[n] = t[n];
  return o;
}
function Hi(t, e) {
  var n = t == null ? null : typeof Symbol < "u" && t[Symbol.iterator] || t["@@iterator"];
  if (n != null) {
    var o, r, i, l, s = [], a = !0, u = !1;
    try {
      if (i = (n = n.call(t)).next, e === 0) {
        if (Object(n) !== n) return;
        a = !1;
      } else for (; !(a = (o = i.call(n)).done) && (s.push(o.value), s.length !== e); a = !0) ;
    } catch (d) {
      u = !0, r = d;
    } finally {
      try {
        if (!a && n.return != null && (l = n.return(), Object(l) !== l)) return;
      } finally {
        if (u) throw r;
      }
    }
    return s;
  }
}
function Ro(t) {
  if (Array.isArray(t)) return t;
}
function Hn(t, e) {
  var n = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(t);
    e && (o = o.filter(function(r) {
      return Object.getOwnPropertyDescriptor(t, r).enumerable;
    })), n.push.apply(n, o);
  }
  return n;
}
function F(t) {
  for (var e = 1; e < arguments.length; e++) {
    var n = arguments[e] != null ? arguments[e] : {};
    e % 2 ? Hn(Object(n), !0).forEach(function(o) {
      et(t, o, n[o]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(n)) : Hn(Object(n)).forEach(function(o) {
      Object.defineProperty(t, o, Object.getOwnPropertyDescriptor(n, o));
    });
  }
  return t;
}
function et(t, e, n) {
  return (e = Ki(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function Ki(t) {
  var e = Ui(t, "string");
  return st(e) == "symbol" ? e : e + "";
}
function Ui(t, e) {
  if (st(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(t, e);
    if (st(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var Ee = {
  name: "BaseComponent",
  props: {
    pt: {
      type: Object,
      default: void 0
    },
    ptOptions: {
      type: Object,
      default: void 0
    },
    unstyled: {
      type: Boolean,
      default: void 0
    },
    dt: {
      type: Object,
      default: void 0
    }
  },
  inject: {
    $parentInstance: {
      default: void 0
    }
  },
  watch: {
    isUnstyled: {
      immediate: !0,
      handler: function(e) {
        te.off("theme:change", this._loadCoreStyles), e || (this._loadCoreStyles(), this._themeChangeListener(this._loadCoreStyles));
      }
    },
    dt: {
      immediate: !0,
      handler: function(e, n) {
        var o = this;
        te.off("theme:change", this._themeScopedListener), e ? (this._loadScopedThemeStyles(e), this._themeScopedListener = function() {
          return o._loadScopedThemeStyles(e);
        }, this._themeChangeListener(this._themeScopedListener)) : this._unloadScopedThemeStyles();
      }
    }
  },
  scopedStyleEl: void 0,
  rootEl: void 0,
  uid: void 0,
  $attrSelector: void 0,
  beforeCreate: function() {
    var e, n, o, r, i, l, s, a, u, d, c, p = (e = this.pt) === null || e === void 0 ? void 0 : e._usept, f = p ? (n = this.pt) === null || n === void 0 || (n = n.originalValue) === null || n === void 0 ? void 0 : n[this.$.type.name] : void 0, m = p ? (o = this.pt) === null || o === void 0 || (o = o.value) === null || o === void 0 ? void 0 : o[this.$.type.name] : this.pt;
    (r = m || f) === null || r === void 0 || (r = r.hooks) === null || r === void 0 || (i = r.onBeforeCreate) === null || i === void 0 || i.call(r);
    var y = (l = this.$primevueConfig) === null || l === void 0 || (l = l.pt) === null || l === void 0 ? void 0 : l._usept, g = y ? (s = this.$primevue) === null || s === void 0 || (s = s.config) === null || s === void 0 || (s = s.pt) === null || s === void 0 ? void 0 : s.originalValue : void 0, $ = y ? (a = this.$primevue) === null || a === void 0 || (a = a.config) === null || a === void 0 || (a = a.pt) === null || a === void 0 ? void 0 : a.value : (u = this.$primevue) === null || u === void 0 || (u = u.config) === null || u === void 0 ? void 0 : u.pt;
    (d = $ || g) === null || d === void 0 || (d = d[this.$.type.name]) === null || d === void 0 || (d = d.hooks) === null || d === void 0 || (c = d.onBeforeCreate) === null || c === void 0 || c.call(d), this.$attrSelector = Ni(), this.uid = this.$attrs.id || this.$attrSelector.replace("pc", "pv_id_");
  },
  created: function() {
    this._hook("onCreated");
  },
  beforeMount: function() {
    var e;
    this.rootEl = Dt(Ke(this.$el) ? this.$el : (e = this.$el) === null || e === void 0 ? void 0 : e.parentElement, "[".concat(this.$attrSelector, "]")), this.rootEl && (this.rootEl.$pc = F({
      name: this.$.type.name,
      attrSelector: this.$attrSelector
    }, this.$params)), this._loadStyles(), this._hook("onBeforeMount");
  },
  mounted: function() {
    this._hook("onMounted");
  },
  beforeUpdate: function() {
    this._hook("onBeforeUpdate");
  },
  updated: function() {
    this._hook("onUpdated");
  },
  beforeUnmount: function() {
    this._hook("onBeforeUnmount");
  },
  unmounted: function() {
    this._removeThemeListeners(), this._unloadScopedThemeStyles(), this._hook("onUnmounted");
  },
  methods: {
    _hook: function(e) {
      if (!this.$options.hostName) {
        var n = this._usePT(this._getPT(this.pt, this.$.type.name), this._getOptionValue, "hooks.".concat(e)), o = this._useDefaultPT(this._getOptionValue, "hooks.".concat(e));
        n?.(), o?.();
      }
    },
    _mergeProps: function(e) {
      for (var n = arguments.length, o = new Array(n > 1 ? n - 1 : 0), r = 1; r < n; r++)
        o[r - 1] = arguments[r];
      return jt(e) ? e.apply(void 0, o) : S.apply(void 0, o);
    },
    _load: function() {
      Pe.isStyleNameLoaded("base") || (R.loadCSS(this.$styleOptions), this._loadGlobalStyles(), Pe.setLoadedStyleName("base")), this._loadThemeStyles();
    },
    _loadStyles: function() {
      this._load(), this._themeChangeListener(this._load);
    },
    _loadCoreStyles: function() {
      var e, n;
      !Pe.isStyleNameLoaded((e = this.$style) === null || e === void 0 ? void 0 : e.name) && (n = this.$style) !== null && n !== void 0 && n.name && (Rn.loadCSS(this.$styleOptions), this.$options.style && this.$style.loadCSS(this.$styleOptions), Pe.setLoadedStyleName(this.$style.name));
    },
    _loadGlobalStyles: function() {
      var e = this._useGlobalPT(this._getOptionValue, "global.css", this.$params);
      V(e) && R.load(e, F({
        name: "global"
      }, this.$styleOptions));
    },
    _loadThemeStyles: function() {
      var e, n;
      if (!(this.isUnstyled || this.$theme === "none")) {
        if (!H.isStyleNameLoaded("common")) {
          var o, r, i = ((o = this.$style) === null || o === void 0 || (r = o.getCommonTheme) === null || r === void 0 ? void 0 : r.call(o)) || {}, l = i.primitive, s = i.semantic, a = i.global, u = i.style;
          R.load(l?.css, F({
            name: "primitive-variables"
          }, this.$styleOptions)), R.load(s?.css, F({
            name: "semantic-variables"
          }, this.$styleOptions)), R.load(a?.css, F({
            name: "global-variables"
          }, this.$styleOptions)), R.loadStyle(F({
            name: "global-style"
          }, this.$styleOptions), u), H.setLoadedStyleName("common");
        }
        if (!H.isStyleNameLoaded((e = this.$style) === null || e === void 0 ? void 0 : e.name) && (n = this.$style) !== null && n !== void 0 && n.name) {
          var d, c, p, f, m = ((d = this.$style) === null || d === void 0 || (c = d.getComponentTheme) === null || c === void 0 ? void 0 : c.call(d)) || {}, y = m.css, g = m.style;
          (p = this.$style) === null || p === void 0 || p.load(y, F({
            name: "".concat(this.$style.name, "-variables")
          }, this.$styleOptions)), (f = this.$style) === null || f === void 0 || f.loadStyle(F({
            name: "".concat(this.$style.name, "-style")
          }, this.$styleOptions), g), H.setLoadedStyleName(this.$style.name);
        }
        if (!H.isStyleNameLoaded("layer-order")) {
          var $, C, T = ($ = this.$style) === null || $ === void 0 || (C = $.getLayerOrderThemeCSS) === null || C === void 0 ? void 0 : C.call($);
          R.load(T, F({
            name: "layer-order",
            first: !0
          }, this.$styleOptions)), H.setLoadedStyleName("layer-order");
        }
      }
    },
    _loadScopedThemeStyles: function(e) {
      var n, o, r, i = ((n = this.$style) === null || n === void 0 || (o = n.getPresetTheme) === null || o === void 0 ? void 0 : o.call(n, e, "[".concat(this.$attrSelector, "]"))) || {}, l = i.css, s = (r = this.$style) === null || r === void 0 ? void 0 : r.load(l, F({
        name: "".concat(this.$attrSelector, "-").concat(this.$style.name)
      }, this.$styleOptions));
      this.scopedStyleEl = s.el;
    },
    _unloadScopedThemeStyles: function() {
      var e;
      (e = this.scopedStyleEl) === null || e === void 0 || (e = e.value) === null || e === void 0 || e.remove();
    },
    _themeChangeListener: function() {
      var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : function() {
      };
      Pe.clearLoadedStyleNames(), te.on("theme:change", e);
    },
    _removeThemeListeners: function() {
      te.off("theme:change", this._loadCoreStyles), te.off("theme:change", this._load), te.off("theme:change", this._themeScopedListener);
    },
    _getHostInstance: function(e) {
      return e ? this.$options.hostName ? e.$.type.name === this.$options.hostName ? e : this._getHostInstance(e.$parentInstance) : e.$parentInstance : void 0;
    },
    _getPropValue: function(e) {
      var n;
      return this[e] || ((n = this._getHostInstance(this)) === null || n === void 0 ? void 0 : n[e]);
    },
    _getOptionValue: function(e) {
      var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", o = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
      return fn(e, n, o);
    },
    _getPTValue: function() {
      var e, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, o = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", r = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {}, i = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : !0, l = /./g.test(o) && !!r[o.split(".")[0]], s = this._getPropValue("ptOptions") || ((e = this.$primevueConfig) === null || e === void 0 ? void 0 : e.ptOptions) || {}, a = s.mergeSections, u = a === void 0 ? !0 : a, d = s.mergeProps, c = d === void 0 ? !1 : d, p = i ? l ? this._useGlobalPT(this._getPTClassValue, o, r) : this._useDefaultPT(this._getPTClassValue, o, r) : void 0, f = l ? void 0 : this._getPTSelf(n, this._getPTClassValue, o, F(F({}, r), {}, {
        global: p || {}
      })), m = this._getPTDatasets(o);
      return u || !u && f ? c ? this._mergeProps(c, p, f, m) : F(F(F({}, p), f), m) : F(F({}, f), m);
    },
    _getPTSelf: function() {
      for (var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length, o = new Array(n > 1 ? n - 1 : 0), r = 1; r < n; r++)
        o[r - 1] = arguments[r];
      return S(
        this._usePT.apply(this, [this._getPT(e, this.$name)].concat(o)),
        // Exp; <component :pt="{}"
        this._usePT.apply(this, [this.$_attrsPT].concat(o))
        // Exp; <component :pt:[passthrough_key]:[attribute]="{value}" or <component :pt:[passthrough_key]="() =>{value}"
      );
    },
    _getPTDatasets: function() {
      var e, n, o = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", r = "data-pc-", i = o === "root" && V((e = this.pt) === null || e === void 0 ? void 0 : e["data-pc-section"]);
      return o !== "transition" && F(F({}, o === "root" && F(F(et({}, "".concat(r, "name"), Se(i ? (n = this.pt) === null || n === void 0 ? void 0 : n["data-pc-section"] : this.$.type.name)), i && et({}, "".concat(r, "extend"), Se(this.$.type.name))), {}, et({}, "".concat(this.$attrSelector), ""))), {}, et({}, "".concat(r, "section"), Se(o)));
    },
    _getPTClassValue: function() {
      var e = this._getOptionValue.apply(this, arguments);
      return he(e) || xo(e) ? {
        class: e
      } : e;
    },
    _getPT: function(e) {
      var n = this, o = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", r = arguments.length > 2 ? arguments[2] : void 0, i = function(s) {
        var a, u = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1, d = r ? r(s) : s, c = Se(o), p = Se(n.$name);
        return (a = u ? c !== p ? d?.[c] : void 0 : d?.[c]) !== null && a !== void 0 ? a : d;
      };
      return e != null && e.hasOwnProperty("_usept") ? {
        _usept: e._usept,
        originalValue: i(e.originalValue),
        value: i(e.value)
      } : i(e, !0);
    },
    _usePT: function(e, n, o, r) {
      var i = function(y) {
        return n(y, o, r);
      };
      if (e != null && e.hasOwnProperty("_usept")) {
        var l, s = e._usept || ((l = this.$primevueConfig) === null || l === void 0 ? void 0 : l.ptOptions) || {}, a = s.mergeSections, u = a === void 0 ? !0 : a, d = s.mergeProps, c = d === void 0 ? !1 : d, p = i(e.originalValue), f = i(e.value);
        return p === void 0 && f === void 0 ? void 0 : he(f) ? f : he(p) ? p : u || !u && f ? c ? this._mergeProps(c, p, f) : F(F({}, p), f) : f;
      }
      return i(e);
    },
    _useGlobalPT: function(e, n, o) {
      return this._usePT(this.globalPT, e, n, o);
    },
    _useDefaultPT: function(e, n, o) {
      return this._usePT(this.defaultPT, e, n, o);
    },
    ptm: function() {
      var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
      return this._getPTValue(this.pt, e, F(F({}, this.$params), n));
    },
    ptmi: function() {
      var e, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", o = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, r = S(this.$_attrsWithoutPT, this.ptm(n, o));
      return r?.hasOwnProperty("id") && ((e = r.id) !== null && e !== void 0 || (r.id = this.$id)), r;
    },
    ptmo: function() {
      var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", o = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
      return this._getPTValue(e, n, F({
        instance: this
      }, o), !1);
    },
    cx: function() {
      var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
      return this.isUnstyled ? void 0 : this._getOptionValue(this.$style.classes, e, F(F({}, this.$params), n));
    },
    sx: function() {
      var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0, o = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
      if (n) {
        var r = this._getOptionValue(this.$style.inlineStyles, e, F(F({}, this.$params), o)), i = this._getOptionValue(Rn.inlineStyles, e, F(F({}, this.$params), o));
        return [i, r];
      }
    }
  },
  computed: {
    globalPT: function() {
      var e, n = this;
      return this._getPT((e = this.$primevueConfig) === null || e === void 0 ? void 0 : e.pt, void 0, function(o) {
        return me(o, {
          instance: n
        });
      });
    },
    defaultPT: function() {
      var e, n = this;
      return this._getPT((e = this.$primevueConfig) === null || e === void 0 ? void 0 : e.pt, void 0, function(o) {
        return n._getOptionValue(o, n.$name, F({}, n.$params)) || me(o, F({}, n.$params));
      });
    },
    isUnstyled: function() {
      var e;
      return this.unstyled !== void 0 ? this.unstyled : (e = this.$primevueConfig) === null || e === void 0 ? void 0 : e.unstyled;
    },
    $id: function() {
      return this.$attrs.id || this.uid;
    },
    $inProps: function() {
      var e, n = Object.keys(((e = this.$.vnode) === null || e === void 0 ? void 0 : e.props) || {});
      return Object.fromEntries(Object.entries(this.$props).filter(function(o) {
        var r = Je(o, 1), i = r[0];
        return n?.includes(i);
      }));
    },
    $theme: function() {
      var e;
      return (e = this.$primevueConfig) === null || e === void 0 ? void 0 : e.theme;
    },
    $style: function() {
      return F(F({
        classes: void 0,
        inlineStyles: void 0,
        load: function() {
        },
        loadCSS: function() {
        },
        loadStyle: function() {
        }
      }, (this._getHostInstance(this) || {}).$style), this.$options.style);
    },
    $styleOptions: function() {
      var e;
      return {
        nonce: (e = this.$primevueConfig) === null || e === void 0 || (e = e.csp) === null || e === void 0 ? void 0 : e.nonce
      };
    },
    $primevueConfig: function() {
      var e;
      return (e = this.$primevue) === null || e === void 0 ? void 0 : e.config;
    },
    $name: function() {
      return this.$options.hostName || this.$.type.name;
    },
    $params: function() {
      var e = this._getHostInstance(this) || this.$parent;
      return {
        instance: this,
        props: this.$props,
        state: this.$data,
        attrs: this.$attrs,
        parent: {
          instance: e,
          props: e?.$props,
          state: e?.$data,
          attrs: e?.$attrs
        }
      };
    },
    $_attrsPT: function() {
      return Object.entries(this.$attrs || {}).filter(function(e) {
        var n = Je(e, 1), o = n[0];
        return o?.startsWith("pt:");
      }).reduce(function(e, n) {
        var o = Je(n, 2), r = o[0], i = o[1], l = r.split(":"), s = Bi(l), a = Zt(s).slice(1);
        return a?.reduce(function(u, d, c, p) {
          return !u[d] && (u[d] = c === p.length - 1 ? i : {}), u[d];
        }, e), e;
      }, {});
    },
    $_attrsWithoutPT: function() {
      return Object.entries(this.$attrs || {}).filter(function(e) {
        var n = Je(e, 1), o = n[0];
        return !(o != null && o.startsWith("pt:"));
      }).reduce(function(e, n) {
        var o = Je(n, 2), r = o[0], i = o[1];
        return e[r] = i, e;
      }, {});
    }
  }
}, Wi = `
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
`, Gi = R.extend({
  name: "baseicon",
  css: Wi
});
function ut(t) {
  "@babel/helpers - typeof";
  return ut = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, ut(t);
}
function Kn(t, e) {
  var n = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(t);
    e && (o = o.filter(function(r) {
      return Object.getOwnPropertyDescriptor(t, r).enumerable;
    })), n.push.apply(n, o);
  }
  return n;
}
function Un(t) {
  for (var e = 1; e < arguments.length; e++) {
    var n = arguments[e] != null ? arguments[e] : {};
    e % 2 ? Kn(Object(n), !0).forEach(function(o) {
      qi(t, o, n[o]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(n)) : Kn(Object(n)).forEach(function(o) {
      Object.defineProperty(t, o, Object.getOwnPropertyDescriptor(n, o));
    });
  }
  return t;
}
function qi(t, e, n) {
  return (e = Yi(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function Yi(t) {
  var e = Zi(t, "string");
  return ut(e) == "symbol" ? e : e + "";
}
function Zi(t, e) {
  if (ut(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(t, e);
    if (ut(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var ze = {
  name: "BaseIcon",
  extends: Ee,
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
  style: Gi,
  provide: function() {
    return {
      $pcIcon: this,
      $parentInstance: this
    };
  },
  methods: {
    pti: function() {
      var e = He(this.label);
      return Un(Un({}, !this.isUnstyled && {
        class: ["p-icon", {
          "p-icon-spin": this.spin
        }]
      }), {}, {
        role: e ? void 0 : "img",
        "aria-label": e ? void 0 : this.label,
        "aria-hidden": e
      });
    }
  }
};
function dt(t) {
  "@babel/helpers - typeof";
  return dt = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, dt(t);
}
function Wn(t, e) {
  return ea(t) || Qi(t, e) || Ji(t, e) || Xi();
}
function Xi() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Ji(t, e) {
  if (t) {
    if (typeof t == "string") return Gn(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Gn(t, e) : void 0;
  }
}
function Gn(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, o = Array(e); n < e; n++) o[n] = t[n];
  return o;
}
function Qi(t, e) {
  var n = t == null ? null : typeof Symbol < "u" && t[Symbol.iterator] || t["@@iterator"];
  if (n != null) {
    var o, r, i, l, s = [], a = !0, u = !1;
    try {
      if (i = (n = n.call(t)).next, e !== 0) for (; !(a = (o = i.call(n)).done) && (s.push(o.value), s.length !== e); a = !0) ;
    } catch (d) {
      u = !0, r = d;
    } finally {
      try {
        if (!a && n.return != null && (l = n.return(), Object(l) !== l)) return;
      } finally {
        if (u) throw r;
      }
    }
    return s;
  }
}
function ea(t) {
  if (Array.isArray(t)) return t;
}
function qn(t, e) {
  var n = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(t);
    e && (o = o.filter(function(r) {
      return Object.getOwnPropertyDescriptor(t, r).enumerable;
    })), n.push.apply(n, o);
  }
  return n;
}
function N(t) {
  for (var e = 1; e < arguments.length; e++) {
    var n = arguments[e] != null ? arguments[e] : {};
    e % 2 ? qn(Object(n), !0).forEach(function(o) {
      Xt(t, o, n[o]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(n)) : qn(Object(n)).forEach(function(o) {
      Object.defineProperty(t, o, Object.getOwnPropertyDescriptor(n, o));
    });
  }
  return t;
}
function Xt(t, e, n) {
  return (e = ta(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function ta(t) {
  var e = na(t, "string");
  return dt(e) == "symbol" ? e : e + "";
}
function na(t, e) {
  if (dt(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(t, e);
    if (dt(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var A = {
  _getMeta: function() {
    return [Ce(arguments.length <= 0 ? void 0 : arguments[0]) || arguments.length <= 0 ? void 0 : arguments[0], me(Ce(arguments.length <= 0 ? void 0 : arguments[0]) ? arguments.length <= 0 ? void 0 : arguments[0] : arguments.length <= 1 ? void 0 : arguments[1])];
  },
  _getConfig: function(e, n) {
    var o, r, i;
    return (o = (e == null || (r = e.instance) === null || r === void 0 ? void 0 : r.$primevue) || (n == null || (i = n.ctx) === null || i === void 0 || (i = i.appContext) === null || i === void 0 || (i = i.config) === null || i === void 0 || (i = i.globalProperties) === null || i === void 0 ? void 0 : i.$primevue)) === null || o === void 0 ? void 0 : o.config;
  },
  _getOptionValue: fn,
  _getPTValue: function() {
    var e, n, o = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, i = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : "", l = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : {}, s = arguments.length > 4 && arguments[4] !== void 0 ? arguments[4] : !0, a = function() {
      var C = A._getOptionValue.apply(A, arguments);
      return he(C) || xo(C) ? {
        class: C
      } : C;
    }, u = ((e = o.binding) === null || e === void 0 || (e = e.value) === null || e === void 0 ? void 0 : e.ptOptions) || ((n = o.$primevueConfig) === null || n === void 0 ? void 0 : n.ptOptions) || {}, d = u.mergeSections, c = d === void 0 ? !0 : d, p = u.mergeProps, f = p === void 0 ? !1 : p, m = s ? A._useDefaultPT(o, o.defaultPT(), a, i, l) : void 0, y = A._usePT(o, A._getPT(r, o.$name), a, i, N(N({}, l), {}, {
      global: m || {}
    })), g = A._getPTDatasets(o, i);
    return c || !c && y ? f ? A._mergeProps(o, f, m, y, g) : N(N(N({}, m), y), g) : N(N({}, y), g);
  },
  _getPTDatasets: function() {
    var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", o = "data-pc-";
    return N(N({}, n === "root" && Xt({}, "".concat(o, "name"), Se(e.$name))), {}, Xt({}, "".concat(o, "section"), Se(n)));
  },
  _getPT: function(e) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", o = arguments.length > 2 ? arguments[2] : void 0, r = function(l) {
      var s, a = o ? o(l) : l, u = Se(n);
      return (s = a?.[u]) !== null && s !== void 0 ? s : a;
    };
    return e && Object.hasOwn(e, "_usept") ? {
      _usept: e._usept,
      originalValue: r(e.originalValue),
      value: r(e.value)
    } : r(e);
  },
  _usePT: function() {
    var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 ? arguments[1] : void 0, o = arguments.length > 2 ? arguments[2] : void 0, r = arguments.length > 3 ? arguments[3] : void 0, i = arguments.length > 4 ? arguments[4] : void 0, l = function(g) {
      return o(g, r, i);
    };
    if (n && Object.hasOwn(n, "_usept")) {
      var s, a = n._usept || ((s = e.$primevueConfig) === null || s === void 0 ? void 0 : s.ptOptions) || {}, u = a.mergeSections, d = u === void 0 ? !0 : u, c = a.mergeProps, p = c === void 0 ? !1 : c, f = l(n.originalValue), m = l(n.value);
      return f === void 0 && m === void 0 ? void 0 : he(m) ? m : he(f) ? f : d || !d && m ? p ? A._mergeProps(e, p, f, m) : N(N({}, f), m) : m;
    }
    return l(n);
  },
  _useDefaultPT: function() {
    var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, o = arguments.length > 2 ? arguments[2] : void 0, r = arguments.length > 3 ? arguments[3] : void 0, i = arguments.length > 4 ? arguments[4] : void 0;
    return A._usePT(e, n, o, r, i);
  },
  _loadStyles: function() {
    var e, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, o = arguments.length > 1 ? arguments[1] : void 0, r = arguments.length > 2 ? arguments[2] : void 0, i = A._getConfig(o, r), l = {
      nonce: i == null || (e = i.csp) === null || e === void 0 ? void 0 : e.nonce
    };
    A._loadCoreStyles(n, l), A._loadThemeStyles(n, l), A._loadScopedThemeStyles(n, l), A._removeThemeListeners(n), n.$loadStyles = function() {
      return A._loadThemeStyles(n, l);
    }, A._themeChangeListener(n.$loadStyles);
  },
  _loadCoreStyles: function() {
    var e, n, o = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, r = arguments.length > 1 ? arguments[1] : void 0;
    if (!Pe.isStyleNameLoaded((e = o.$style) === null || e === void 0 ? void 0 : e.name) && (n = o.$style) !== null && n !== void 0 && n.name) {
      var i;
      R.loadCSS(r), (i = o.$style) === null || i === void 0 || i.loadCSS(r), Pe.setLoadedStyleName(o.$style.name);
    }
  },
  _loadThemeStyles: function() {
    var e, n, o, r = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, i = arguments.length > 1 ? arguments[1] : void 0;
    if (!(r != null && r.isUnstyled() || (r == null || (e = r.theme) === null || e === void 0 ? void 0 : e.call(r)) === "none")) {
      if (!H.isStyleNameLoaded("common")) {
        var l, s, a = ((l = r.$style) === null || l === void 0 || (s = l.getCommonTheme) === null || s === void 0 ? void 0 : s.call(l)) || {}, u = a.primitive, d = a.semantic, c = a.global, p = a.style;
        R.load(u?.css, N({
          name: "primitive-variables"
        }, i)), R.load(d?.css, N({
          name: "semantic-variables"
        }, i)), R.load(c?.css, N({
          name: "global-variables"
        }, i)), R.loadStyle(N({
          name: "global-style"
        }, i), p), H.setLoadedStyleName("common");
      }
      if (!H.isStyleNameLoaded((n = r.$style) === null || n === void 0 ? void 0 : n.name) && (o = r.$style) !== null && o !== void 0 && o.name) {
        var f, m, y, g, $ = ((f = r.$style) === null || f === void 0 || (m = f.getDirectiveTheme) === null || m === void 0 ? void 0 : m.call(f)) || {}, C = $.css, T = $.style;
        (y = r.$style) === null || y === void 0 || y.load(C, N({
          name: "".concat(r.$style.name, "-variables")
        }, i)), (g = r.$style) === null || g === void 0 || g.loadStyle(N({
          name: "".concat(r.$style.name, "-style")
        }, i), T), H.setLoadedStyleName(r.$style.name);
      }
      if (!H.isStyleNameLoaded("layer-order")) {
        var h, O, D = (h = r.$style) === null || h === void 0 || (O = h.getLayerOrderThemeCSS) === null || O === void 0 ? void 0 : O.call(h);
        R.load(D, N({
          name: "layer-order",
          first: !0
        }, i)), H.setLoadedStyleName("layer-order");
      }
    }
  },
  _loadScopedThemeStyles: function() {
    var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 ? arguments[1] : void 0, o = e.preset();
    if (o && e.$attrSelector) {
      var r, i, l, s = ((r = e.$style) === null || r === void 0 || (i = r.getPresetTheme) === null || i === void 0 ? void 0 : i.call(r, o, "[".concat(e.$attrSelector, "]"))) || {}, a = s.css, u = (l = e.$style) === null || l === void 0 ? void 0 : l.load(a, N({
        name: "".concat(e.$attrSelector, "-").concat(e.$style.name)
      }, n));
      e.scopedStyleEl = u.el;
    }
  },
  _themeChangeListener: function() {
    var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : function() {
    };
    Pe.clearLoadedStyleNames(), te.on("theme:change", e);
  },
  _removeThemeListeners: function() {
    var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    te.off("theme:change", e.$loadStyles), e.$loadStyles = void 0;
  },
  _hook: function(e, n, o, r, i, l) {
    var s, a, u = "on".concat(Fr(n)), d = A._getConfig(r, i), c = o?.$instance, p = A._usePT(c, A._getPT(r == null || (s = r.value) === null || s === void 0 ? void 0 : s.pt, e), A._getOptionValue, "hooks.".concat(u)), f = A._useDefaultPT(c, d == null || (a = d.pt) === null || a === void 0 || (a = a.directives) === null || a === void 0 ? void 0 : a[e], A._getOptionValue, "hooks.".concat(u)), m = {
      el: o,
      binding: r,
      vnode: i,
      prevVnode: l
    };
    p?.(c, m), f?.(c, m);
  },
  /* eslint-disable-next-line no-unused-vars */
  _mergeProps: function() {
    for (var e = arguments.length > 1 ? arguments[1] : void 0, n = arguments.length, o = new Array(n > 2 ? n - 2 : 0), r = 2; r < n; r++)
      o[r - 2] = arguments[r];
    return jt(e) ? e.apply(void 0, o) : S.apply(void 0, o);
  },
  _extend: function(e) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, o = function(s, a, u, d, c) {
      var p, f, m, y;
      a._$instances = a._$instances || {};
      var g = A._getConfig(u, d), $ = a._$instances[e] || {}, C = He($) ? N(N({}, n), n?.methods) : {};
      a._$instances[e] = N(N({}, $), {}, {
        /* new instance variables to pass in directive methods */
        $name: e,
        $host: a,
        $binding: u,
        $modifiers: u?.modifiers,
        $value: u?.value,
        $el: $.$el || a || void 0,
        $style: N({
          classes: void 0,
          inlineStyles: void 0,
          load: function() {
          },
          loadCSS: function() {
          },
          loadStyle: function() {
          }
        }, n?.style),
        $primevueConfig: g,
        $attrSelector: (p = a.$pd) === null || p === void 0 || (p = p[e]) === null || p === void 0 ? void 0 : p.attrSelector,
        /* computed instance variables */
        defaultPT: function() {
          return A._getPT(g?.pt, void 0, function(h) {
            var O;
            return h == null || (O = h.directives) === null || O === void 0 ? void 0 : O[e];
          });
        },
        isUnstyled: function() {
          var h, O;
          return ((h = a._$instances[e]) === null || h === void 0 || (h = h.$binding) === null || h === void 0 || (h = h.value) === null || h === void 0 ? void 0 : h.unstyled) !== void 0 ? (O = a._$instances[e]) === null || O === void 0 || (O = O.$binding) === null || O === void 0 || (O = O.value) === null || O === void 0 ? void 0 : O.unstyled : g?.unstyled;
        },
        theme: function() {
          var h;
          return (h = a._$instances[e]) === null || h === void 0 || (h = h.$primevueConfig) === null || h === void 0 ? void 0 : h.theme;
        },
        preset: function() {
          var h;
          return (h = a._$instances[e]) === null || h === void 0 || (h = h.$binding) === null || h === void 0 || (h = h.value) === null || h === void 0 ? void 0 : h.dt;
        },
        /* instance's methods */
        ptm: function() {
          var h, O = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", D = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
          return A._getPTValue(a._$instances[e], (h = a._$instances[e]) === null || h === void 0 || (h = h.$binding) === null || h === void 0 || (h = h.value) === null || h === void 0 ? void 0 : h.pt, O, N({}, D));
        },
        ptmo: function() {
          var h = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, O = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", D = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
          return A._getPTValue(a._$instances[e], h, O, D, !1);
        },
        cx: function() {
          var h, O, D = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", L = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
          return (h = a._$instances[e]) !== null && h !== void 0 && h.isUnstyled() ? void 0 : A._getOptionValue((O = a._$instances[e]) === null || O === void 0 || (O = O.$style) === null || O === void 0 ? void 0 : O.classes, D, N({}, L));
        },
        sx: function() {
          var h, O = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", D = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0, L = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
          return D ? A._getOptionValue((h = a._$instances[e]) === null || h === void 0 || (h = h.$style) === null || h === void 0 ? void 0 : h.inlineStyles, O, N({}, L)) : void 0;
        }
      }, C), a.$instance = a._$instances[e], (f = (m = a.$instance)[s]) === null || f === void 0 || f.call(m, a, u, d, c), a["$".concat(e)] = a.$instance, A._hook(e, s, a, u, d, c), a.$pd || (a.$pd = {}), a.$pd[e] = N(N({}, (y = a.$pd) === null || y === void 0 ? void 0 : y[e]), {}, {
        name: e,
        instance: a._$instances[e]
      });
    }, r = function(s) {
      var a, u, d, c = s._$instances[e], p = c?.watch, f = function(g) {
        var $, C = g.newValue, T = g.oldValue;
        return p == null || ($ = p.config) === null || $ === void 0 ? void 0 : $.call(c, C, T);
      }, m = function(g) {
        var $, C = g.newValue, T = g.oldValue;
        return p == null || ($ = p["config.ripple"]) === null || $ === void 0 ? void 0 : $.call(c, C, T);
      };
      c.$watchersCallback = {
        config: f,
        "config.ripple": m
      }, p == null || (a = p.config) === null || a === void 0 || a.call(c, c?.$primevueConfig), Ae.on("config:change", f), p == null || (u = p["config.ripple"]) === null || u === void 0 || u.call(c, c == null || (d = c.$primevueConfig) === null || d === void 0 ? void 0 : d.ripple), Ae.on("config:ripple:change", m);
    }, i = function(s) {
      var a = s._$instances[e].$watchersCallback;
      a && (Ae.off("config:change", a.config), Ae.off("config:ripple:change", a["config.ripple"]), s._$instances[e].$watchersCallback = void 0);
    };
    return {
      created: function(s, a, u, d) {
        s.$pd || (s.$pd = {}), s.$pd[e] = {
          name: e,
          attrSelector: ei("pd")
        }, o("created", s, a, u, d);
      },
      beforeMount: function(s, a, u, d) {
        var c;
        A._loadStyles((c = s.$pd[e]) === null || c === void 0 ? void 0 : c.instance, a, u), o("beforeMount", s, a, u, d), r(s);
      },
      mounted: function(s, a, u, d) {
        var c;
        A._loadStyles((c = s.$pd[e]) === null || c === void 0 ? void 0 : c.instance, a, u), o("mounted", s, a, u, d);
      },
      beforeUpdate: function(s, a, u, d) {
        o("beforeUpdate", s, a, u, d);
      },
      updated: function(s, a, u, d) {
        var c;
        A._loadStyles((c = s.$pd[e]) === null || c === void 0 ? void 0 : c.instance, a, u), o("updated", s, a, u, d);
      },
      beforeUnmount: function(s, a, u, d) {
        var c;
        i(s), A._removeThemeListeners((c = s.$pd[e]) === null || c === void 0 ? void 0 : c.instance), o("beforeUnmount", s, a, u, d);
      },
      unmounted: function(s, a, u, d) {
        var c;
        (c = s.$pd[e]) === null || c === void 0 || (c = c.instance) === null || c === void 0 || (c = c.scopedStyleEl) === null || c === void 0 || (c = c.value) === null || c === void 0 || c.remove(), o("unmounted", s, a, u, d);
      }
    };
  },
  extend: function() {
    var e = A._getMeta.apply(A, arguments), n = Wn(e, 2), o = n[0], r = n[1];
    return N({
      extend: function() {
        var l = A._getMeta.apply(A, arguments), s = Wn(l, 2), a = s[0], u = s[1];
        return A.extend(a, N(N(N({}, r), r?.methods), u));
      }
    }, A._extend(o, r));
  }
}, oa = `
    .p-ink {
        display: block;
        position: absolute;
        background: dt('ripple.background');
        border-radius: 100%;
        transform: scale(0);
        pointer-events: none;
    }

    .p-ink-active {
        animation: ripple 0.4s linear;
    }

    @keyframes ripple {
        100% {
            opacity: 0;
            transform: scale(2.5);
        }
    }
`, ra = {
  root: "p-ink"
}, ia = R.extend({
  name: "ripple-directive",
  style: oa,
  classes: ra
}), aa = A.extend({
  style: ia
});
function ct(t) {
  "@babel/helpers - typeof";
  return ct = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, ct(t);
}
function la(t) {
  return ca(t) || da(t) || ua(t) || sa();
}
function sa() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function ua(t, e) {
  if (t) {
    if (typeof t == "string") return Jt(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Jt(t, e) : void 0;
  }
}
function da(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function ca(t) {
  if (Array.isArray(t)) return Jt(t);
}
function Jt(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, o = Array(e); n < e; n++) o[n] = t[n];
  return o;
}
function Yn(t, e, n) {
  return (e = pa(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function pa(t) {
  var e = fa(t, "string");
  return ct(e) == "symbol" ? e : e + "";
}
function fa(t, e) {
  if (ct(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(t, e);
    if (ct(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var vn = aa.extend("ripple", {
  watch: {
    "config.ripple": function(e) {
      e ? (this.createRipple(this.$host), this.bindEvents(this.$host), this.$host.setAttribute("data-pd-ripple", !0), this.$host.style.overflow = "hidden", this.$host.style.position = "relative") : (this.remove(this.$host), this.$host.removeAttribute("data-pd-ripple"));
    }
  },
  unmounted: function(e) {
    this.remove(e);
  },
  timeout: void 0,
  methods: {
    bindEvents: function(e) {
      e.addEventListener("mousedown", this.onMouseDown.bind(this));
    },
    unbindEvents: function(e) {
      e.removeEventListener("mousedown", this.onMouseDown.bind(this));
    },
    createRipple: function(e) {
      var n = this.getInk(e);
      n || (n = Oo("span", Yn(Yn({
        role: "presentation",
        "aria-hidden": !0,
        "data-p-ink": !0,
        "data-p-ink-active": !1,
        class: !this.isUnstyled() && this.cx("root"),
        onAnimationEnd: this.onAnimationEnd.bind(this)
      }, this.$attrSelector, ""), "p-bind", this.ptm("root"))), e.appendChild(n), this.$el = n);
    },
    remove: function(e) {
      var n = this.getInk(e);
      n && (this.$host.style.overflow = "", this.$host.style.position = "", this.unbindEvents(e), n.removeEventListener("animationend", this.onAnimationEnd), n.remove());
    },
    onMouseDown: function(e) {
      var n = this, o = e.currentTarget, r = this.getInk(o);
      if (!(!r || getComputedStyle(r, null).display === "none")) {
        if (!this.isUnstyled() && nt(r, "p-ink-active"), r.setAttribute("data-p-ink-active", "false"), !De(r) && !Fe(r)) {
          var i = Math.max(bn(o), _o(o));
          r.style.height = i + "px", r.style.width = i + "px";
        }
        var l = Zr(o), s = e.pageX - l.left + document.body.scrollTop - Fe(r) / 2, a = e.pageY - l.top + document.body.scrollLeft - De(r) / 2;
        r.style.top = a + "px", r.style.left = s + "px", !this.isUnstyled() && Lt(r, "p-ink-active"), r.setAttribute("data-p-ink-active", "true"), this.timeout = setTimeout(function() {
          r && (!n.isUnstyled() && nt(r, "p-ink-active"), r.setAttribute("data-p-ink-active", "false"));
        }, 401);
      }
    },
    onAnimationEnd: function(e) {
      this.timeout && clearTimeout(this.timeout), !this.isUnstyled() && nt(e.currentTarget, "p-ink-active"), e.currentTarget.setAttribute("data-p-ink-active", "false");
    },
    getInk: function(e) {
      return e && e.children ? la(e.children).find(function(n) {
        return Yr(n, "data-pc-name") === "ripple";
      }) : void 0;
    }
  }
});
function pt(t) {
  "@babel/helpers - typeof";
  return pt = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, pt(t);
}
function ha(t, e) {
  if (!(t instanceof e)) throw new TypeError("Cannot call a class as a function");
}
function ma(t, e) {
  for (var n = 0; n < e.length; n++) {
    var o = e[n];
    o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(t, ga(o.key), o);
  }
}
function ba(t, e, n) {
  return e && ma(t.prototype, e), Object.defineProperty(t, "prototype", { writable: !1 }), t;
}
function ga(t) {
  var e = va(t, "string");
  return pt(e) == "symbol" ? e : e + "";
}
function va(t, e) {
  if (pt(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(t, e);
    if (pt(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return String(t);
}
var ya = /* @__PURE__ */ (function() {
  function t(e) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : function() {
    };
    ha(this, t), this.element = e, this.listener = n;
  }
  return ba(t, [{
    key: "bindScrollListener",
    value: function() {
      this.scrollableParents = Xr(this.element);
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
})(), wa = hn();
const xa = "data-wippy-overlay-layer";
function Ho() {
  return typeof window < "u" && typeof window.document < "u";
}
function Ko() {
  return Ho() && typeof HTMLElement < "u" && Object.hasOwn(HTMLElement.prototype, "popover");
}
function ka() {
  return Ko() && typeof CSS < "u" && typeof CSS.supports == "function" && CSS.supports("anchor-name: --a") && CSS.supports("position-area", "bottom span-right") && CSS.supports("position-try-fallbacks", "flip-block") && CSS.supports("min-width", "min(anchor-size(width), 100vw)") && CSS.supports("max-width", "stretch");
}
const Sa = /\bp-(?:select|multiselect|treeselect|cascadeselect)-overlay\b/;
let $a = 0;
const Et = /* @__PURE__ */ new WeakMap();
function Zn(t, e) {
  const n = t.style;
  n.setProperty("position", "fixed", "important"), n.setProperty("inset", "auto", "important"), n.setProperty("margin", "0", "important"), n.setProperty("position-anchor", e), n.setProperty("position-area", "bottom span-right"), n.setProperty("position-try-fallbacks", "flip-block, flip-inline, flip-block flip-inline"), n.setProperty("min-width", "min(anchor-size(width), 100vw)", "important"), n.setProperty("max-width", "stretch", "important");
}
function Ca(t, e) {
  if (!Sa.test(t.className))
    return;
  const n = t.style.cssText;
  Zn(t, e), t.getAttribute("popover") !== "manual" && t.setAttribute("popover", "manual");
  try {
    t.matches(":popover-open") || t.showPopover();
  } catch {
  }
  if (!t.matches(":popover-open")) {
    t.removeAttribute("popover"), t.style.cssText = n;
    return;
  }
  if (!Et.has(t)) {
    const o = new MutationObserver(() => {
      const r = t.style;
      (r.top !== "auto" || r.left !== "auto" || r.margin !== "0px" || r.getPropertyPriority("top") !== "important" || r.getPropertyPriority("left") !== "important" || r.getPropertyPriority("margin") !== "important" || r.getPropertyPriority("min-width") !== "important" || r.maxWidth !== "stretch" || r.getPropertyPriority("max-width") !== "important") && Zn(t, e);
    });
    o.observe(t, { attributes: !0, attributeFilter: ["style"] }), Et.set(t, o);
  }
}
function yn(t) {
  const e = Et.get(t);
  e && (e.disconnect(), Et.delete(t));
}
function Oa(t) {
  const e = t && typeof t.getRootNode == "function" ? t.getRootNode() : null;
  return e instanceof ShadowRoot ? e : null;
}
function Qt(t) {
  t.style.top = "0px", t.style.left = "0px";
  const e = t.getBoundingClientRect();
  t.style.top = `${-window.scrollY - e.top}px`, t.style.left = `${-window.scrollX - e.left}px`;
}
const zt = /* @__PURE__ */ new Set(), wn = /* @__PURE__ */ new WeakMap();
let Xn = !1, en = !1;
function Ia() {
  en = !1;
  for (const t of zt) {
    if (!t.isConnected) {
      for (const e of Array.from(t.children))
        e instanceof HTMLElement && yn(e);
      zt.delete(t), wn.get(t)?.disconnect();
      continue;
    }
    t.childElementCount > 0 && Qt(t);
  }
}
function Jn() {
  en || (en = !0, requestAnimationFrame(Ia));
}
function _a(t) {
  const e = document.createElement("div");
  e.setAttribute(xa, "");
  const n = Ko();
  if (e.style.cssText = n ? "position:fixed;width:0 !important;height:0 !important;margin:0 !important;border:0 !important;padding:0 !important;background:transparent !important;color:inherit !important;overflow:visible !important;" : "position:fixed;top:0;left:0;width:0;height:0;", n && e.setAttribute("popover", "manual"), t.appendChild(e), n) {
    try {
      e.showPopover();
    } catch {
    }
    e.matches(":popover-open") || (e.removeAttribute("popover"), e.style.cssText = "position:fixed;top:0;left:0;width:0;height:0;");
  }
  Qt(e);
  const o = new MutationObserver((r) => {
    const i = e.__wippyAnchorName;
    for (const l of r) {
      if (i)
        for (const s of Array.from(l.addedNodes))
          s instanceof HTMLElement && Ca(s, i);
      for (const s of Array.from(l.removedNodes))
        s instanceof HTMLElement && yn(s);
    }
    e.isConnected && e.childElementCount > 0 && Qt(e);
  });
  return o.observe(e, { childList: !0 }), wn.set(e, o), zt.add(e), Xn || (Xn = !0, window.addEventListener("scroll", Jn, { capture: !0, passive: !0 }), window.addEventListener("resize", Jn, { passive: !0 })), e;
}
function Qn(t) {
  if (!(!t.hostRoot || t.layer) && (t.layer = _a(t.hostRoot), ka())) {
    const e = t.$el ? t.$el.parentElement : null;
    e && (t.anchorName = `--wippy-a-${++$a}`, t.anchorTrigger = e, e.style.setProperty("anchor-name", t.anchorName), t.layer.__wippyAnchorName = t.anchorName);
  }
}
function eo(t) {
  if (t.anchorTrigger && (t.anchorTrigger.style.removeProperty("anchor-name"), t.anchorTrigger = null), t.anchorName = null, t.layer) {
    for (const e of Array.from(t.layer.children))
      e instanceof HTMLElement && yn(e);
    zt.delete(t.layer), wn.get(t.layer)?.disconnect(), t.layer.remove(), t.layer = null;
  }
}
let to = !1;
function La() {
  if (to)
    return;
  to = !0;
  const t = Ft;
  t.computed = t.computed || {}, t.computed.inline = function() {
    return !!this.disabled || this.appendTo === "self";
  }, t.computed.resolvedTarget = function() {
    return this.appendTo == null || this.appendTo === "body" ? this.hostRoot ? this.layer : document.body : this.appendTo;
  }, t.data = function() {
    return { mounted: !1, hostRoot: null, layer: null, anchorName: null, anchorTrigger: null };
  }, t.mounted = function() {
    Ho() && (this.hostRoot = Oa(this.$el), this.mounted = !0, this.hostRoot && (this.inline || Qn(this), this.$watch("inline", (e) => {
      e ? eo(this) : Qn(this);
    })));
  }, t.render = function() {
    return this.inline ? j(this.$slots, "default", { key: 0 }) : this.mounted ? Sr(bo, { key: 1, to: this.resolvedTarget || document.body }, [
      j(this.$slots, "default")
    ]) : P("", !0);
  }, t.unmounted = function() {
    eo(this);
  };
}
const Ta = {
  install: (t) => {
    La(), t.use(Mi, { theme: "none" });
  }
};
var Mt = {
  name: "SpinnerIcon",
  extends: ze
};
function Pa(t) {
  return ja(t) || za(t) || Ea(t) || Aa();
}
function Aa() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Ea(t, e) {
  if (t) {
    if (typeof t == "string") return tn(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? tn(t, e) : void 0;
  }
}
function za(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function ja(t) {
  if (Array.isArray(t)) return tn(t);
}
function tn(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, o = Array(e); n < e; n++) o[n] = t[n];
  return o;
}
function Da(t, e, n, o, r, i) {
  return b(), w("svg", S({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, t.pti()), Pa(e[0] || (e[0] = [k("path", {
    d: "M6.99701 14C5.85441 13.999 4.72939 13.7186 3.72012 13.1832C2.71084 12.6478 1.84795 11.8737 1.20673 10.9284C0.565504 9.98305 0.165424 8.89526 0.041387 7.75989C-0.0826496 6.62453 0.073125 5.47607 0.495122 4.4147C0.917119 3.35333 1.59252 2.4113 2.46241 1.67077C3.33229 0.930247 4.37024 0.413729 5.4857 0.166275C6.60117 -0.0811796 7.76026 -0.0520535 8.86188 0.251112C9.9635 0.554278 10.9742 1.12227 11.8057 1.90555C11.915 2.01493 11.9764 2.16319 11.9764 2.31778C11.9764 2.47236 11.915 2.62062 11.8057 2.73C11.7521 2.78503 11.688 2.82877 11.6171 2.85864C11.5463 2.8885 11.4702 2.90389 11.3933 2.90389C11.3165 2.90389 11.2404 2.8885 11.1695 2.85864C11.0987 2.82877 11.0346 2.78503 10.9809 2.73C9.9998 1.81273 8.73246 1.26138 7.39226 1.16876C6.05206 1.07615 4.72086 1.44794 3.62279 2.22152C2.52471 2.99511 1.72683 4.12325 1.36345 5.41602C1.00008 6.70879 1.09342 8.08723 1.62775 9.31926C2.16209 10.5513 3.10478 11.5617 4.29713 12.1803C5.48947 12.7989 6.85865 12.988 8.17414 12.7157C9.48963 12.4435 10.6711 11.7264 11.5196 10.6854C12.3681 9.64432 12.8319 8.34282 12.8328 7C12.8328 6.84529 12.8943 6.69692 13.0038 6.58752C13.1132 6.47812 13.2616 6.41667 13.4164 6.41667C13.5712 6.41667 13.7196 6.47812 13.8291 6.58752C13.9385 6.69692 14 6.84529 14 7C14 8.85651 13.2622 10.637 11.9489 11.9497C10.6356 13.2625 8.85432 14 6.99701 14Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
Mt.render = Da;
var Fa = `
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
`, Ma = {
  root: function(e) {
    var n = e.props, o = e.instance;
    return ["p-badge p-component", {
      "p-badge-circle": V(n.value) && String(n.value).length === 1,
      "p-badge-dot": He(n.value) && !o.$slots.default,
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
}, Va = R.extend({
  name: "badge",
  style: Fa,
  classes: Ma
}), Na = {
  name: "BaseBadge",
  extends: Ee,
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
  style: Va,
  provide: function() {
    return {
      $pcBadge: this,
      $parentInstance: this
    };
  }
};
function ft(t) {
  "@babel/helpers - typeof";
  return ft = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, ft(t);
}
function no(t, e, n) {
  return (e = Ba(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function Ba(t) {
  var e = Ra(t, "string");
  return ft(e) == "symbol" ? e : e + "";
}
function Ra(t, e) {
  if (ft(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(t, e);
    if (ft(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var Uo = {
  name: "Badge",
  extends: Na,
  inheritAttrs: !1,
  computed: {
    dataP: function() {
      return we(no(no({
        circle: this.value != null && String(this.value).length === 1,
        empty: this.value == null && !this.$slots.default
      }, this.severity, this.severity), this.size, this.size));
    }
  }
}, Ha = ["data-p"];
function Ka(t, e, n, o, r, i) {
  return b(), w("span", S({
    class: t.cx("root"),
    "data-p": i.dataP
  }, t.ptmi("root")), [j(t.$slots, "default", {}, function() {
    return [ce(z(t.value), 1)];
  })], 16, Ha);
}
Uo.render = Ka;
var Ua = `
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
function ht(t) {
  "@babel/helpers - typeof";
  return ht = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, ht(t);
}
function ke(t, e, n) {
  return (e = Wa(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function Wa(t) {
  var e = Ga(t, "string");
  return ht(e) == "symbol" ? e : e + "";
}
function Ga(t, e) {
  if (ht(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(t, e);
    if (ht(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var qa = {
  root: function(e) {
    var n = e.instance, o = e.props;
    return ["p-button p-component", ke(ke(ke(ke(ke(ke(ke(ke(ke({
      "p-button-icon-only": n.hasIcon && !o.label && !o.badge,
      "p-button-vertical": (o.iconPos === "top" || o.iconPos === "bottom") && o.label,
      "p-button-loading": o.loading,
      "p-button-link": o.link || o.variant === "link"
    }, "p-button-".concat(o.severity), o.severity), "p-button-raised", o.raised), "p-button-rounded", o.rounded), "p-button-text", o.text || o.variant === "text"), "p-button-outlined", o.outlined || o.variant === "outlined"), "p-button-sm", o.size === "small"), "p-button-lg", o.size === "large"), "p-button-plain", o.plain), "p-button-fluid", n.hasFluid)];
  },
  loadingIcon: "p-button-loading-icon",
  icon: function(e) {
    var n = e.props;
    return ["p-button-icon", ke({}, "p-button-icon-".concat(n.iconPos), n.label)];
  },
  label: "p-button-label"
}, Ya = R.extend({
  name: "button",
  style: Ua,
  classes: qa
}), Za = {
  name: "BaseButton",
  extends: Ee,
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
  style: Ya,
  provide: function() {
    return {
      $pcButton: this,
      $parentInstance: this
    };
  }
};
function mt(t) {
  "@babel/helpers - typeof";
  return mt = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, mt(t);
}
function ue(t, e, n) {
  return (e = Xa(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function Xa(t) {
  var e = Ja(t, "string");
  return mt(e) == "symbol" ? e : e + "";
}
function Ja(t, e) {
  if (mt(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(t, e);
    if (mt(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var de = {
  name: "Button",
  extends: Za,
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
      return He(this.fluid) ? !!this.$pcFluid : this.fluid;
    },
    dataP: function() {
      return we(ue(ue(ue(ue(ue(ue(ue(ue(ue(ue({}, this.size, this.size), "icon-only", this.hasIcon && !this.label && !this.badge), "loading", this.loading), "fluid", this.hasFluid), "rounded", this.rounded), "raised", this.raised), "outlined", this.outlined || this.variant === "outlined"), "text", this.text || this.variant === "text"), "link", this.link || this.variant === "link"), "vertical", (this.iconPos === "top" || this.iconPos === "bottom") && this.label));
    },
    dataIconP: function() {
      return we(ue(ue({}, this.iconPos, this.iconPos), this.size, this.size));
    },
    dataLabelP: function() {
      return we(ue(ue({}, this.size, this.size), "icon-only", this.hasIcon && !this.label && !this.badge));
    }
  },
  components: {
    SpinnerIcon: Mt,
    Badge: Uo
  },
  directives: {
    ripple: vn
  }
}, Qa = ["data-p"], el = ["data-p"];
function tl(t, e, n, o, r, i) {
  var l = pe("SpinnerIcon"), s = pe("Badge"), a = cn("ripple");
  return t.asChild ? j(t.$slots, "default", {
    key: 1,
    class: J(t.cx("root")),
    a11yAttrs: i.a11yAttrs
  }) : Ve((b(), fe(ot(t.as), S({
    key: 0,
    class: t.cx("root"),
    "data-p": i.dataP
  }, i.attrs), {
    default: G(function() {
      return [j(t.$slots, "default", {}, function() {
        return [t.loading ? j(t.$slots, "loadingicon", S({
          key: 0,
          class: [t.cx("loadingIcon"), t.cx("icon")]
        }, t.ptm("loadingIcon")), function() {
          return [t.loadingIcon ? (b(), w("span", S({
            key: 0,
            class: [t.cx("loadingIcon"), t.cx("icon"), t.loadingIcon]
          }, t.ptm("loadingIcon")), null, 16)) : (b(), fe(l, S({
            key: 1,
            class: [t.cx("loadingIcon"), t.cx("icon")],
            spin: ""
          }, t.ptm("loadingIcon")), null, 16, ["class"]))];
        }) : j(t.$slots, "icon", S({
          key: 1,
          class: [t.cx("icon")]
        }, t.ptm("icon")), function() {
          return [t.icon ? (b(), w("span", S({
            key: 0,
            class: [t.cx("icon"), t.icon, t.iconClass],
            "data-p": i.dataIconP
          }, t.ptm("icon")), null, 16, Qa)) : P("", !0)];
        }), t.label ? (b(), w("span", S({
          key: 2,
          class: t.cx("label")
        }, t.ptm("label"), {
          "data-p": i.dataLabelP
        }), z(t.label), 17, el)) : P("", !0), t.badge ? (b(), fe(s, {
          key: 3,
          value: t.badge,
          class: J(t.badgeClass),
          severity: t.badgeSeverity,
          unstyled: t.unstyled,
          pt: t.ptm("pcBadge")
        }, null, 8, ["value", "class", "severity", "unstyled", "pt"])) : P("", !0)];
      })];
    }),
    _: 3
  }, 16, ["class", "data-p"])), [[a]]);
}
de.render = tl;
var xn = {
  name: "TimesIcon",
  extends: ze
};
function nl(t) {
  return al(t) || il(t) || rl(t) || ol();
}
function ol() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function rl(t, e) {
  if (t) {
    if (typeof t == "string") return nn(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? nn(t, e) : void 0;
  }
}
function il(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function al(t) {
  if (Array.isArray(t)) return nn(t);
}
function nn(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, o = Array(e); n < e; n++) o[n] = t[n];
  return o;
}
function ll(t, e, n, o, r, i) {
  return b(), w("svg", S({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, t.pti()), nl(e[0] || (e[0] = [k("path", {
    d: "M8.01186 7.00933L12.27 2.75116C12.341 2.68501 12.398 2.60524 12.4375 2.51661C12.4769 2.42798 12.4982 2.3323 12.4999 2.23529C12.5016 2.13827 12.4838 2.0419 12.4474 1.95194C12.4111 1.86197 12.357 1.78024 12.2884 1.71163C12.2198 1.64302 12.138 1.58893 12.0481 1.55259C11.9581 1.51625 11.8617 1.4984 11.7647 1.50011C11.6677 1.50182 11.572 1.52306 11.4834 1.56255C11.3948 1.60204 11.315 1.65898 11.2488 1.72997L6.99067 5.98814L2.7325 1.72997C2.59553 1.60234 2.41437 1.53286 2.22718 1.53616C2.03999 1.53946 1.8614 1.61529 1.72901 1.74767C1.59663 1.88006 1.5208 2.05865 1.5175 2.24584C1.5142 2.43303 1.58368 2.61419 1.71131 2.75116L5.96948 7.00933L1.71131 11.2675C1.576 11.403 1.5 11.5866 1.5 11.7781C1.5 11.9696 1.576 12.1532 1.71131 12.2887C1.84679 12.424 2.03043 12.5 2.2219 12.5C2.41338 12.5 2.59702 12.424 2.7325 12.2887L6.99067 8.03052L11.2488 12.2887C11.3843 12.424 11.568 12.5 11.7594 12.5C11.9509 12.5 12.1346 12.424 12.27 12.2887C12.4053 12.1532 12.4813 11.9696 12.4813 11.7781C12.4813 11.5866 12.4053 11.403 12.27 11.2675L8.01186 7.00933Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
xn.render = ll;
var Wo = {
  name: "WindowMaximizeIcon",
  extends: ze
};
function sl(t) {
  return pl(t) || cl(t) || dl(t) || ul();
}
function ul() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function dl(t, e) {
  if (t) {
    if (typeof t == "string") return on(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? on(t, e) : void 0;
  }
}
function cl(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function pl(t) {
  if (Array.isArray(t)) return on(t);
}
function on(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, o = Array(e); n < e; n++) o[n] = t[n];
  return o;
}
function fl(t, e, n, o, r, i) {
  return b(), w("svg", S({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, t.pti()), sl(e[0] || (e[0] = [k("path", {
    "fill-rule": "evenodd",
    "clip-rule": "evenodd",
    d: "M7 14H11.8C12.3835 14 12.9431 13.7682 13.3556 13.3556C13.7682 12.9431 14 12.3835 14 11.8V2.2C14 1.61652 13.7682 1.05694 13.3556 0.644365C12.9431 0.231785 12.3835 0 11.8 0H2.2C1.61652 0 1.05694 0.231785 0.644365 0.644365C0.231785 1.05694 0 1.61652 0 2.2V7C0 7.15913 0.063214 7.31174 0.175736 7.42426C0.288258 7.53679 0.44087 7.6 0.6 7.6C0.75913 7.6 0.911742 7.53679 1.02426 7.42426C1.13679 7.31174 1.2 7.15913 1.2 7V2.2C1.2 1.93478 1.30536 1.68043 1.49289 1.49289C1.68043 1.30536 1.93478 1.2 2.2 1.2H11.8C12.0652 1.2 12.3196 1.30536 12.5071 1.49289C12.6946 1.68043 12.8 1.93478 12.8 2.2V11.8C12.8 12.0652 12.6946 12.3196 12.5071 12.5071C12.3196 12.6946 12.0652 12.8 11.8 12.8H7C6.84087 12.8 6.68826 12.8632 6.57574 12.9757C6.46321 13.0883 6.4 13.2409 6.4 13.4C6.4 13.5591 6.46321 13.7117 6.57574 13.8243C6.68826 13.9368 6.84087 14 7 14ZM9.77805 7.42192C9.89013 7.534 10.0415 7.59788 10.2 7.59995C10.3585 7.59788 10.5099 7.534 10.622 7.42192C10.7341 7.30985 10.798 7.15844 10.8 6.99995V3.94242C10.8066 3.90505 10.8096 3.86689 10.8089 3.82843C10.8079 3.77159 10.7988 3.7157 10.7824 3.6623C10.756 3.55552 10.701 3.45698 10.622 3.37798C10.5099 3.2659 10.3585 3.20202 10.2 3.19995H7.00002C6.84089 3.19995 6.68828 3.26317 6.57576 3.37569C6.46324 3.48821 6.40002 3.64082 6.40002 3.79995C6.40002 3.95908 6.46324 4.11169 6.57576 4.22422C6.68828 4.33674 6.84089 4.39995 7.00002 4.39995H8.80006L6.19997 7.00005C6.10158 7.11005 6.04718 7.25246 6.04718 7.40005C6.04718 7.54763 6.10158 7.69004 6.19997 7.80005C6.30202 7.91645 6.44561 7.98824 6.59997 8.00005C6.75432 7.98824 6.89791 7.91645 6.99997 7.80005L9.60002 5.26841V6.99995C9.6021 7.15844 9.66598 7.30985 9.77805 7.42192ZM1.4 14H3.8C4.17066 13.9979 4.52553 13.8498 4.78763 13.5877C5.04973 13.3256 5.1979 12.9707 5.2 12.6V10.2C5.1979 9.82939 5.04973 9.47452 4.78763 9.21242C4.52553 8.95032 4.17066 8.80215 3.8 8.80005H1.4C1.02934 8.80215 0.674468 8.95032 0.412371 9.21242C0.150274 9.47452 0.00210008 9.82939 0 10.2V12.6C0.00210008 12.9707 0.150274 13.3256 0.412371 13.5877C0.674468 13.8498 1.02934 13.9979 1.4 14ZM1.25858 10.0586C1.29609 10.0211 1.34696 10 1.4 10H3.8C3.85304 10 3.90391 10.0211 3.94142 10.0586C3.97893 10.0961 4 10.147 4 10.2V12.6C4 12.6531 3.97893 12.704 3.94142 12.7415C3.90391 12.779 3.85304 12.8 3.8 12.8H1.4C1.34696 12.8 1.29609 12.779 1.25858 12.7415C1.22107 12.704 1.2 12.6531 1.2 12.6V10.2C1.2 10.147 1.22107 10.0961 1.25858 10.0586Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
Wo.render = fl;
var Go = {
  name: "WindowMinimizeIcon",
  extends: ze
};
function hl(t) {
  return vl(t) || gl(t) || bl(t) || ml();
}
function ml() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function bl(t, e) {
  if (t) {
    if (typeof t == "string") return rn(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? rn(t, e) : void 0;
  }
}
function gl(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function vl(t) {
  if (Array.isArray(t)) return rn(t);
}
function rn(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, o = Array(e); n < e; n++) o[n] = t[n];
  return o;
}
function yl(t, e, n, o, r, i) {
  return b(), w("svg", S({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, t.pti()), hl(e[0] || (e[0] = [k("path", {
    "fill-rule": "evenodd",
    "clip-rule": "evenodd",
    d: "M11.8 0H2.2C1.61652 0 1.05694 0.231785 0.644365 0.644365C0.231785 1.05694 0 1.61652 0 2.2V7C0 7.15913 0.063214 7.31174 0.175736 7.42426C0.288258 7.53679 0.44087 7.6 0.6 7.6C0.75913 7.6 0.911742 7.53679 1.02426 7.42426C1.13679 7.31174 1.2 7.15913 1.2 7V2.2C1.2 1.93478 1.30536 1.68043 1.49289 1.49289C1.68043 1.30536 1.93478 1.2 2.2 1.2H11.8C12.0652 1.2 12.3196 1.30536 12.5071 1.49289C12.6946 1.68043 12.8 1.93478 12.8 2.2V11.8C12.8 12.0652 12.6946 12.3196 12.5071 12.5071C12.3196 12.6946 12.0652 12.8 11.8 12.8H7C6.84087 12.8 6.68826 12.8632 6.57574 12.9757C6.46321 13.0883 6.4 13.2409 6.4 13.4C6.4 13.5591 6.46321 13.7117 6.57574 13.8243C6.68826 13.9368 6.84087 14 7 14H11.8C12.3835 14 12.9431 13.7682 13.3556 13.3556C13.7682 12.9431 14 12.3835 14 11.8V2.2C14 1.61652 13.7682 1.05694 13.3556 0.644365C12.9431 0.231785 12.3835 0 11.8 0ZM6.368 7.952C6.44137 7.98326 6.52025 7.99958 6.6 8H9.8C9.95913 8 10.1117 7.93678 10.2243 7.82426C10.3368 7.71174 10.4 7.55913 10.4 7.4C10.4 7.24087 10.3368 7.08826 10.2243 6.97574C10.1117 6.86321 9.95913 6.8 9.8 6.8H8.048L10.624 4.224C10.73 4.11026 10.7877 3.95982 10.7849 3.80438C10.7822 3.64894 10.7192 3.50063 10.6093 3.3907C10.4994 3.28077 10.3511 3.2178 10.1956 3.21506C10.0402 3.21232 9.88974 3.27002 9.776 3.376L7.2 5.952V4.2C7.2 4.04087 7.13679 3.88826 7.02426 3.77574C6.91174 3.66321 6.75913 3.6 6.6 3.6C6.44087 3.6 6.28826 3.66321 6.17574 3.77574C6.06321 3.88826 6 4.04087 6 4.2V7.4C6.00042 7.47975 6.01674 7.55862 6.048 7.632C6.07656 7.70442 6.11971 7.7702 6.17475 7.82524C6.2298 7.88029 6.29558 7.92344 6.368 7.952ZM1.4 8.80005H3.8C4.17066 8.80215 4.52553 8.95032 4.78763 9.21242C5.04973 9.47452 5.1979 9.82939 5.2 10.2V12.6C5.1979 12.9707 5.04973 13.3256 4.78763 13.5877C4.52553 13.8498 4.17066 13.9979 3.8 14H1.4C1.02934 13.9979 0.674468 13.8498 0.412371 13.5877C0.150274 13.3256 0.00210008 12.9707 0 12.6V10.2C0.00210008 9.82939 0.150274 9.47452 0.412371 9.21242C0.674468 8.95032 1.02934 8.80215 1.4 8.80005ZM3.94142 12.7415C3.97893 12.704 4 12.6531 4 12.6V10.2C4 10.147 3.97893 10.0961 3.94142 10.0586C3.90391 10.0211 3.85304 10 3.8 10H1.4C1.34696 10 1.29609 10.0211 1.25858 10.0586C1.22107 10.0961 1.2 10.147 1.2 10.2V12.6C1.2 12.6531 1.22107 12.704 1.25858 12.7415C1.29609 12.779 1.34696 12.8 1.4 12.8H3.8C3.85304 12.8 3.90391 12.779 3.94142 12.7415Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
Go.render = yl;
var wl = R.extend({
  name: "focustrap-directive"
}), xl = A.extend({
  style: wl
});
function bt(t) {
  "@babel/helpers - typeof";
  return bt = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, bt(t);
}
function oo(t, e) {
  var n = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(t);
    e && (o = o.filter(function(r) {
      return Object.getOwnPropertyDescriptor(t, r).enumerable;
    })), n.push.apply(n, o);
  }
  return n;
}
function ro(t) {
  for (var e = 1; e < arguments.length; e++) {
    var n = arguments[e] != null ? arguments[e] : {};
    e % 2 ? oo(Object(n), !0).forEach(function(o) {
      kl(t, o, n[o]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(n)) : oo(Object(n)).forEach(function(o) {
      Object.defineProperty(t, o, Object.getOwnPropertyDescriptor(n, o));
    });
  }
  return t;
}
function kl(t, e, n) {
  return (e = Sl(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function Sl(t) {
  var e = $l(t, "string");
  return bt(e) == "symbol" ? e : e + "";
}
function $l(t, e) {
  if (bt(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(t, e);
    if (bt(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var Cl = xl.extend("focustrap", {
  mounted: function(e, n) {
    var o = n.value || {}, r = o.disabled;
    r || (this.createHiddenFocusableElements(e, n), this.bind(e, n), this.autoElementFocus(e, n)), e.setAttribute("data-pd-focustrap", !0), this.$el = e;
  },
  updated: function(e, n) {
    var o = n.value || {}, r = o.disabled;
    r && this.unbind(e);
  },
  unmounted: function(e) {
    this.unbind(e);
  },
  methods: {
    getComputedSelector: function(e) {
      return ':not(.p-hidden-focusable):not([data-p-hidden-focusable="true"])'.concat(e ?? "");
    },
    bind: function(e, n) {
      var o = this, r = n.value || {}, i = r.onFocusIn, l = r.onFocusOut;
      e.$_pfocustrap_mutationobserver = new MutationObserver(function(s) {
        s.forEach(function(a) {
          if (a.type === "childList" && !e.contains(document.activeElement)) {
            var u = function(c) {
              var p = In(c) ? In(c, o.getComputedSelector(e.$_pfocustrap_focusableselector)) ? c : Ge(e, o.getComputedSelector(e.$_pfocustrap_focusableselector)) : Ge(c);
              return V(p) ? p : c.nextSibling && u(c.nextSibling);
            };
            se(u(a.nextSibling));
          }
        });
      }), e.$_pfocustrap_mutationobserver.disconnect(), e.$_pfocustrap_mutationobserver.observe(e, {
        childList: !0
      }), e.$_pfocustrap_focusinlistener = function(s) {
        return i && i(s);
      }, e.$_pfocustrap_focusoutlistener = function(s) {
        return l && l(s);
      }, e.addEventListener("focusin", e.$_pfocustrap_focusinlistener), e.addEventListener("focusout", e.$_pfocustrap_focusoutlistener);
    },
    unbind: function(e) {
      e.$_pfocustrap_mutationobserver && e.$_pfocustrap_mutationobserver.disconnect(), e.$_pfocustrap_focusinlistener && e.removeEventListener("focusin", e.$_pfocustrap_focusinlistener) && (e.$_pfocustrap_focusinlistener = null), e.$_pfocustrap_focusoutlistener && e.removeEventListener("focusout", e.$_pfocustrap_focusoutlistener) && (e.$_pfocustrap_focusoutlistener = null);
    },
    autoFocus: function(e) {
      this.autoElementFocus(this.$el, {
        value: ro(ro({}, e), {}, {
          autoFocus: !0
        })
      });
    },
    autoElementFocus: function(e, n) {
      var o = n.value || {}, r = o.autoFocusSelector, i = r === void 0 ? "" : r, l = o.firstFocusableSelector, s = l === void 0 ? "" : l, a = o.autoFocus, u = a === void 0 ? !1 : a, d = Ge(e, "[autofocus]".concat(this.getComputedSelector(i)));
      u && !d && (d = Ge(e, this.getComputedSelector(s))), se(d);
    },
    onFirstHiddenElementFocus: function(e) {
      var n, o = e.currentTarget, r = e.relatedTarget, i = r === o.$_pfocustrap_lasthiddenfocusableelement || !((n = this.$el) !== null && n !== void 0 && n.contains(r)) ? Ge(o.parentElement, this.getComputedSelector(o.$_pfocustrap_focusableselector)) : o.$_pfocustrap_lasthiddenfocusableelement;
      se(i);
    },
    onLastHiddenElementFocus: function(e) {
      var n, o = e.currentTarget, r = e.relatedTarget, i = r === o.$_pfocustrap_firsthiddenfocusableelement || !((n = this.$el) !== null && n !== void 0 && n.contains(r)) ? Io(o.parentElement, this.getComputedSelector(o.$_pfocustrap_focusableselector)) : o.$_pfocustrap_firsthiddenfocusableelement;
      se(i);
    },
    createHiddenFocusableElements: function(e, n) {
      var o = this, r = n.value || {}, i = r.tabIndex, l = i === void 0 ? 0 : i, s = r.firstFocusableSelector, a = s === void 0 ? "" : s, u = r.lastFocusableSelector, d = u === void 0 ? "" : u, c = function(y) {
        return Oo("span", {
          class: "p-hidden-accessible p-hidden-focusable",
          tabIndex: l,
          role: "presentation",
          "aria-hidden": !0,
          "data-p-hidden-accessible": !0,
          "data-p-hidden-focusable": !0,
          onFocus: y?.bind(o)
        });
      }, p = c(this.onFirstHiddenElementFocus), f = c(this.onLastHiddenElementFocus);
      p.$_pfocustrap_lasthiddenfocusableelement = f, p.$_pfocustrap_focusableselector = a, p.setAttribute("data-pc-section", "firstfocusableelement"), f.$_pfocustrap_firsthiddenfocusableelement = p, f.$_pfocustrap_focusableselector = d, f.setAttribute("data-pc-section", "lastfocusableelement"), e.prepend(p), e.append(f);
    }
  }
});
function io() {
  Nr({
    variableName: Vo("scrollbar.width").name
  });
}
function ao() {
  Br({
    variableName: Vo("scrollbar.width").name
  });
}
var Ol = `
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
`, Il = {
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
}, _l = {
  mask: function(e) {
    var n = e.props, o = ["left", "right", "top", "topleft", "topright", "bottom", "bottomleft", "bottomright"], r = o.find(function(i) {
      return i === n.position;
    });
    return ["p-dialog-mask", {
      "p-overlay-mask p-overlay-mask-enter-active": n.modal
    }, r ? "p-dialog-".concat(r) : ""];
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
}, Ll = R.extend({
  name: "dialog",
  style: Ol,
  classes: _l,
  inlineStyles: Il
}), Tl = {
  name: "BaseDialog",
  extends: Ee,
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
  style: Ll,
  provide: function() {
    return {
      $pcDialog: this,
      $parentInstance: this
    };
  }
}, qo = {
  name: "Dialog",
  extends: Tl,
  inheritAttrs: !1,
  emits: ["update:visible", "show", "hide", "after-hide", "maximize", "unmaximize", "dragstart", "dragend"],
  provide: function() {
    var e = this;
    return {
      dialogRef: Ht(function() {
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
    this.unbindDocumentState(), this.unbindGlobalListeners(), this.destroyStyle(), this.mask && this.autoZIndex && Xe.clear(this.mask), this.container = null, this.mask = null;
  },
  mounted: function() {
    this.breakpoints && this.createStyle();
  },
  methods: {
    close: function() {
      this.$emit("update:visible", !1);
    },
    onEnter: function() {
      this.$emit("show"), this.target = document.activeElement, this.enableDocumentSettings(), this.bindGlobalListeners(), this.autoZIndex && Xe.set("modal", this.mask, this.baseZIndex || this.$primevue.config.zIndex.modal);
    },
    onAfterEnter: function() {
      this.focus();
    },
    onBeforeLeave: function() {
      this.modal && !this.isUnstyled && Lt(this.mask, "p-overlay-mask-leave-active"), this.dragging && this.documentDragEndListener && this.documentDragEndListener();
    },
    onLeave: function() {
      this.$emit("hide"), se(this.target), this.target = null, this.focusableClose = null, this.focusableMax = null;
    },
    onAfterLeave: function() {
      this.autoZIndex && Xe.clear(this.mask), this.containerVisible = !1, this.unbindDocumentState(), this.unbindGlobalListeners(), this.$emit("after-hide");
    },
    onMaskMouseDown: function(e) {
      this.maskMouseDownTarget = e.target;
    },
    onMaskMouseUp: function() {
      this.dismissableMask && this.modal && this.mask === this.maskMouseDownTarget && this.close();
    },
    focus: function() {
      var e = function(r) {
        return r && r.querySelector("[autofocus]");
      }, n = this.$slots.footer && e(this.footerContainer);
      n || (n = this.$slots.header && e(this.headerContainer), n || (n = this.$slots.default && e(this.content), n || (this.maximizable ? (this.focusableMax = !0, n = this.maximizableButton) : (this.focusableClose = !0, n = this.closeButton)))), n && se(n, {
        focusVisible: !0
      });
    },
    maximize: function(e) {
      this.maximized ? (this.maximized = !1, this.$emit("unmaximize", e)) : (this.maximized = !0, this.$emit("maximize", e)), this.modal || (this.maximized ? io() : ao());
    },
    enableDocumentSettings: function() {
      (this.modal || !this.modal && this.blockScroll || this.maximizable && this.maximized) && io();
    },
    unbindDocumentState: function() {
      (this.modal || !this.modal && this.blockScroll || this.maximizable && this.maximized) && ao();
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
        this.styleElement = document.createElement("style"), this.styleElement.type = "text/css", Po(this.styleElement, "nonce", (e = this.$primevue) === null || e === void 0 || (e = e.config) === null || e === void 0 || (e = e.csp) === null || e === void 0 ? void 0 : e.nonce), document.head.appendChild(this.styleElement);
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
      e.target.closest("div").getAttribute("data-pc-section") !== "headeractions" && this.draggable && (this.dragging = !0, this.lastPageX = e.pageX, this.lastPageY = e.pageY, this.container.style.margin = "0", document.body.setAttribute("data-p-unselectable-text", "true"), !this.isUnstyled && $o(document.body, {
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
          var o = bn(e.container), r = _o(e.container), i = n.pageX - e.lastPageX, l = n.pageY - e.lastPageY, s = e.container.getBoundingClientRect(), a = s.left + i, u = s.top + l, d = mn(), c = getComputedStyle(e.container), p = parseFloat(c.marginLeft), f = parseFloat(c.marginTop);
          e.container.style.position = "fixed", e.keepInViewport ? (a >= e.minX && a + o < d.width && (e.lastPageX = n.pageX, e.container.style.left = a - p + "px"), u >= e.minY && u + r < d.height && (e.lastPageY = n.pageY, e.container.style.top = u - f + "px")) : (e.lastPageX = n.pageX, e.container.style.left = a - p + "px", e.lastPageY = n.pageY, e.container.style.top = u - f + "px");
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
      return we({
        maximized: this.maximized,
        modal: this.modal
      });
    }
  },
  directives: {
    ripple: vn,
    focustrap: Cl
  },
  components: {
    Button: de,
    Portal: Ft,
    WindowMinimizeIcon: Go,
    WindowMaximizeIcon: Wo,
    TimesIcon: xn
  }
};
function gt(t) {
  "@babel/helpers - typeof";
  return gt = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, gt(t);
}
function lo(t, e) {
  var n = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(t);
    e && (o = o.filter(function(r) {
      return Object.getOwnPropertyDescriptor(t, r).enumerable;
    })), n.push.apply(n, o);
  }
  return n;
}
function so(t) {
  for (var e = 1; e < arguments.length; e++) {
    var n = arguments[e] != null ? arguments[e] : {};
    e % 2 ? lo(Object(n), !0).forEach(function(o) {
      Pl(t, o, n[o]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(n)) : lo(Object(n)).forEach(function(o) {
      Object.defineProperty(t, o, Object.getOwnPropertyDescriptor(n, o));
    });
  }
  return t;
}
function Pl(t, e, n) {
  return (e = Al(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function Al(t) {
  var e = El(t, "string");
  return gt(e) == "symbol" ? e : e + "";
}
function El(t, e) {
  if (gt(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(t, e);
    if (gt(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var zl = ["data-p"], jl = ["aria-labelledby", "aria-modal", "data-p"], Dl = ["id"], Fl = ["data-p"];
function Ml(t, e, n, o, r, i) {
  var l = pe("Button"), s = pe("Portal"), a = cn("focustrap");
  return b(), fe(s, {
    appendTo: t.appendTo
  }, {
    default: G(function() {
      return [r.containerVisible ? (b(), w("div", S({
        key: 0,
        ref: i.maskRef,
        class: t.cx("mask"),
        style: t.sx("mask", !0, {
          position: t.position,
          modal: t.modal
        }),
        onMousedown: e[1] || (e[1] = function() {
          return i.onMaskMouseDown && i.onMaskMouseDown.apply(i, arguments);
        }),
        onMouseup: e[2] || (e[2] = function() {
          return i.onMaskMouseUp && i.onMaskMouseUp.apply(i, arguments);
        }),
        "data-p": i.dataP
      }, t.ptm("mask")), [_(go, S({
        name: "p-dialog",
        onEnter: i.onEnter,
        onAfterEnter: i.onAfterEnter,
        onBeforeLeave: i.onBeforeLeave,
        onLeave: i.onLeave,
        onAfterLeave: i.onAfterLeave,
        appear: ""
      }, t.ptm("transition")), {
        default: G(function() {
          return [t.visible ? Ve((b(), w("div", S({
            key: 0,
            ref: i.containerRef,
            class: t.cx("root"),
            style: t.sx("root"),
            role: "dialog",
            "aria-labelledby": i.ariaLabelledById,
            "aria-modal": t.modal,
            "data-p": i.dataP
          }, t.ptmi("root")), [t.$slots.container ? j(t.$slots, "container", {
            key: 0,
            closeCallback: i.close,
            maximizeCallback: function(d) {
              return i.maximize(d);
            },
            initDragCallback: i.initDrag
          }) : (b(), w($e, {
            key: 1
          }, [t.showHeader ? (b(), w("div", S({
            key: 0,
            ref: i.headerContainerRef,
            class: t.cx("header"),
            onMousedown: e[0] || (e[0] = function() {
              return i.initDrag && i.initDrag.apply(i, arguments);
            })
          }, t.ptm("header")), [j(t.$slots, "header", {
            class: J(t.cx("title"))
          }, function() {
            return [t.header ? (b(), w("span", S({
              key: 0,
              id: i.ariaLabelledById,
              class: t.cx("title")
            }, t.ptm("title")), z(t.header), 17, Dl)) : P("", !0)];
          }), k("div", S({
            class: t.cx("headerActions")
          }, t.ptm("headerActions")), [t.maximizable ? j(t.$slots, "maximizebutton", {
            key: 0,
            maximized: r.maximized,
            maximizeCallback: function(d) {
              return i.maximize(d);
            }
          }, function() {
            return [_(l, S({
              ref: i.maximizableRef,
              autofocus: r.focusableMax,
              class: t.cx("pcMaximizeButton"),
              onClick: i.maximize,
              tabindex: t.maximizable ? "0" : "-1",
              unstyled: t.unstyled
            }, t.maximizeButtonProps, {
              pt: t.ptm("pcMaximizeButton"),
              "data-pc-group-section": "headericon"
            }), {
              icon: G(function(u) {
                return [j(t.$slots, "maximizeicon", {
                  maximized: r.maximized
                }, function() {
                  return [(b(), fe(ot(i.maximizeIconComponent), S({
                    class: [u.class, r.maximized ? t.minimizeIcon : t.maximizeIcon]
                  }, t.ptm("pcMaximizeButton").icon), null, 16, ["class"]))];
                })];
              }),
              _: 3
            }, 16, ["autofocus", "class", "onClick", "tabindex", "unstyled", "pt"])];
          }) : P("", !0), t.closable ? j(t.$slots, "closebutton", {
            key: 1,
            closeCallback: i.close
          }, function() {
            return [_(l, S({
              ref: i.closeButtonRef,
              autofocus: r.focusableClose,
              class: t.cx("pcCloseButton"),
              onClick: i.close,
              "aria-label": i.closeAriaLabel,
              unstyled: t.unstyled
            }, t.closeButtonProps, {
              pt: t.ptm("pcCloseButton"),
              "data-pc-group-section": "headericon"
            }), {
              icon: G(function(u) {
                return [j(t.$slots, "closeicon", {}, function() {
                  return [(b(), fe(ot(t.closeIcon ? "span" : "TimesIcon"), S({
                    class: [t.closeIcon, u.class]
                  }, t.ptm("pcCloseButton").icon), null, 16, ["class"]))];
                })];
              }),
              _: 3
            }, 16, ["autofocus", "class", "onClick", "aria-label", "unstyled", "pt"])];
          }) : P("", !0)], 16)], 16)) : P("", !0), k("div", S({
            ref: i.contentRef,
            class: [t.cx("content"), t.contentClass],
            style: t.contentStyle,
            "data-p": i.dataP
          }, so(so({}, t.contentProps), t.ptm("content"))), [j(t.$slots, "default")], 16, Fl), t.footer || t.$slots.footer ? (b(), w("div", S({
            key: 1,
            ref: i.footerContainerRef,
            class: t.cx("footer")
          }, t.ptm("footer")), [j(t.$slots, "footer", {}, function() {
            return [ce(z(t.footer), 1)];
          })], 16)) : P("", !0)], 64))], 16, jl)), [[a, {
            disabled: !t.modal
          }]]) : P("", !0)];
        }),
        _: 3
      }, 16, ["onEnter", "onAfterEnter", "onBeforeLeave", "onLeave", "onAfterLeave"])], 16, zl)) : P("", !0)];
    }),
    _: 3
  }, 8, ["appendTo"]);
}
qo.render = Ml;
function Vl(t, e) {
  if (t && typeof t == "object") {
    const n = t, o = n.response?.data?.error;
    if (typeof o == "string") return o;
    if (o && typeof o == "object" && typeof o.message == "string")
      return o.message;
    if (typeof n.message == "string" && n.message) return n.message;
  }
  return e;
}
function Le(t, e) {
  if (t && typeof t == "object") {
    const n = t;
    n.response?.status === 401 && We.handleError("auth-expired", n);
  }
  return Vl(t, e);
}
async function Nl() {
  try {
    const { data: t } = await Ne.get("/api/v1/skills?limit=100");
    if (!t?.success) throw new Error(t?.error || "failed to load skills");
    return t.skills || [];
  } catch (t) {
    throw new Error(Le(t, "could not load skills"));
  }
}
async function uo(t, e) {
  try {
    const n = e != null ? `/api/v1/skills/${t}?version=${e}` : `/api/v1/skills/${t}`, { data: o } = await Ne.get(n);
    if (!o?.success || !o.skill) throw new Error(o?.error || "failed to load skill");
    return o.skill;
  } catch (n) {
    throw new Error(Le(n, "could not load skill"));
  }
}
async function Bl(t) {
  try {
    const { data: e } = await Ne.get(`/api/v1/skills/${t}/versions`);
    if (!e?.success) throw new Error(e?.error || "failed to load versions");
    return e.versions || [];
  } catch (e) {
    throw new Error(Le(e, "could not load versions"));
  }
}
async function Rl(t, e, n) {
  const { data: o } = await Ne.get(`/api/v1/skills/${encodeURIComponent(t)}/file?path=${encodeURIComponent(e)}&version=${n}&format=base64`);
  if (!o?.success || !o.file) throw new Error(o?.error || "could not read skill file");
  const r = o.file, i = Uint8Array.from(atob(r.content), (l) => l.charCodeAt(0));
  return new Blob([i], { type: r.mime_type || "application/octet-stream" });
}
const Hl = {
  active: "Active",
  archived: "Archived"
};
function Kl(t) {
  return t ? Hl[t] ?? t : "";
}
const Ul = {
  reference: "Reference",
  asset: "Asset",
  script: "Script"
};
function Wl(t) {
  return t ? Ul[t] ?? t : "";
}
const Gl = /* @__PURE__ */ pn({
  __name: "IconField",
  props: {
    modelValue: {},
    fallback: {}
  },
  emits: ["update:modelValue"],
  setup(t, { emit: e }) {
    const n = t, o = e, r = K(null);
    let i = null;
    function l(a) {
      o("update:modelValue", a.detail || "");
    }
    async function s() {
      if (r.value) {
        i && i.removeEventListener("select", l), r.value.innerHTML = "";
        try {
          customElements.get("wc-icon-picker") || await vo("wc-icon-picker", { timeoutMs: 8e3 });
        } catch {
        }
        r.value && (i = document.createElement("wc-icon-picker"), i.setAttribute("value", n.modelValue || ""), n.fallback && i.setAttribute("fallback", n.fallback), i.addEventListener("select", l), r.value.appendChild(i));
      }
    }
    return mo(s), Me(() => n.modelValue, (a) => {
      i && i.getAttribute("value") !== a && i.setAttribute("value", a || "");
    }), $r(() => {
      i && i.removeEventListener("select", l);
    }), (a, u) => (b(), w("div", {
      ref_key: "host",
      ref: r,
      class: "wc-iconfield"
    }, null, 512));
  }
});
var Yo = {
  name: "BlankIcon",
  extends: ze
};
function ql(t) {
  return Jl(t) || Xl(t) || Zl(t) || Yl();
}
function Yl() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Zl(t, e) {
  if (t) {
    if (typeof t == "string") return an(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? an(t, e) : void 0;
  }
}
function Xl(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function Jl(t) {
  if (Array.isArray(t)) return an(t);
}
function an(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, o = Array(e); n < e; n++) o[n] = t[n];
  return o;
}
function Ql(t, e, n, o, r, i) {
  return b(), w("svg", S({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, t.pti()), ql(e[0] || (e[0] = [k("rect", {
    width: "1",
    height: "1",
    fill: "currentColor",
    "fill-opacity": "0"
  }, null, -1)])), 16);
}
Yo.render = Ql;
var Zo = {
  name: "CheckIcon",
  extends: ze
};
function es(t) {
  return rs(t) || os(t) || ns(t) || ts();
}
function ts() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function ns(t, e) {
  if (t) {
    if (typeof t == "string") return ln(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? ln(t, e) : void 0;
  }
}
function os(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function rs(t) {
  if (Array.isArray(t)) return ln(t);
}
function ln(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, o = Array(e); n < e; n++) o[n] = t[n];
  return o;
}
function is(t, e, n, o, r, i) {
  return b(), w("svg", S({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, t.pti()), es(e[0] || (e[0] = [k("path", {
    d: "M4.86199 11.5948C4.78717 11.5923 4.71366 11.5745 4.64596 11.5426C4.57826 11.5107 4.51779 11.4652 4.46827 11.4091L0.753985 7.69483C0.683167 7.64891 0.623706 7.58751 0.580092 7.51525C0.536478 7.44299 0.509851 7.36177 0.502221 7.27771C0.49459 7.19366 0.506156 7.10897 0.536046 7.03004C0.565935 6.95111 0.613367 6.88 0.674759 6.82208C0.736151 6.76416 0.8099 6.72095 0.890436 6.69571C0.970973 6.67046 1.05619 6.66385 1.13966 6.67635C1.22313 6.68886 1.30266 6.72017 1.37226 6.76792C1.44186 6.81567 1.4997 6.8786 1.54141 6.95197L4.86199 10.2503L12.6397 2.49483C12.7444 2.42694 12.8689 2.39617 12.9932 2.40745C13.1174 2.41873 13.2343 2.47141 13.3251 2.55705C13.4159 2.64268 13.4753 2.75632 13.4938 2.87973C13.5123 3.00315 13.4888 3.1292 13.4271 3.23768L5.2557 11.4091C5.20618 11.4652 5.14571 11.5107 5.07801 11.5426C5.01031 11.5745 4.9368 11.5923 4.86199 11.5948Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
Zo.render = is;
var Xo = {
  name: "ChevronDownIcon",
  extends: ze
};
function as(t) {
  return ds(t) || us(t) || ss(t) || ls();
}
function ls() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function ss(t, e) {
  if (t) {
    if (typeof t == "string") return sn(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? sn(t, e) : void 0;
  }
}
function us(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function ds(t) {
  if (Array.isArray(t)) return sn(t);
}
function sn(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, o = Array(e); n < e; n++) o[n] = t[n];
  return o;
}
function cs(t, e, n, o, r, i) {
  return b(), w("svg", S({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, t.pti()), as(e[0] || (e[0] = [k("path", {
    d: "M7.01744 10.398C6.91269 10.3985 6.8089 10.378 6.71215 10.3379C6.61541 10.2977 6.52766 10.2386 6.45405 10.1641L1.13907 4.84913C1.03306 4.69404 0.985221 4.5065 1.00399 4.31958C1.02276 4.13266 1.10693 3.95838 1.24166 3.82747C1.37639 3.69655 1.55301 3.61742 1.74039 3.60402C1.92777 3.59062 2.11386 3.64382 2.26584 3.75424L7.01744 8.47394L11.769 3.75424C11.9189 3.65709 12.097 3.61306 12.2748 3.62921C12.4527 3.64535 12.6199 3.72073 12.7498 3.84328C12.8797 3.96582 12.9647 4.12842 12.9912 4.30502C13.0177 4.48162 12.9841 4.662 12.8958 4.81724L7.58083 10.1322C7.50996 10.2125 7.42344 10.2775 7.32656 10.3232C7.22968 10.3689 7.12449 10.3944 7.01744 10.398Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
Xo.render = cs;
var Jo = {
  name: "SearchIcon",
  extends: ze
};
function ps(t) {
  return bs(t) || ms(t) || hs(t) || fs();
}
function fs() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function hs(t, e) {
  if (t) {
    if (typeof t == "string") return un(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? un(t, e) : void 0;
  }
}
function ms(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function bs(t) {
  if (Array.isArray(t)) return un(t);
}
function un(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, o = Array(e); n < e; n++) o[n] = t[n];
  return o;
}
function gs(t, e, n, o, r, i) {
  return b(), w("svg", S({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, t.pti()), ps(e[0] || (e[0] = [k("path", {
    "fill-rule": "evenodd",
    "clip-rule": "evenodd",
    d: "M2.67602 11.0265C3.6661 11.688 4.83011 12.0411 6.02086 12.0411C6.81149 12.0411 7.59438 11.8854 8.32483 11.5828C8.87005 11.357 9.37808 11.0526 9.83317 10.6803L12.9769 13.8241C13.0323 13.8801 13.0983 13.9245 13.171 13.9548C13.2438 13.985 13.3219 14.0003 13.4007 14C13.4795 14.0003 13.5575 13.985 13.6303 13.9548C13.7031 13.9245 13.7691 13.8801 13.8244 13.8241C13.9367 13.7116 13.9998 13.5592 13.9998 13.4003C13.9998 13.2414 13.9367 13.089 13.8244 12.9765L10.6807 9.8328C11.053 9.37773 11.3573 8.86972 11.5831 8.32452C11.8857 7.59408 12.0414 6.81119 12.0414 6.02056C12.0414 4.8298 11.6883 3.66579 11.0268 2.67572C10.3652 1.68564 9.42494 0.913972 8.32483 0.45829C7.22472 0.00260857 6.01418 -0.116618 4.84631 0.115686C3.67844 0.34799 2.60568 0.921393 1.76369 1.76338C0.921698 2.60537 0.348296 3.67813 0.115991 4.84601C-0.116313 6.01388 0.00291375 7.22441 0.458595 8.32452C0.914277 9.42464 1.68595 10.3649 2.67602 11.0265ZM3.35565 2.0158C4.14456 1.48867 5.07206 1.20731 6.02086 1.20731C7.29317 1.20731 8.51338 1.71274 9.41304 2.6124C10.3127 3.51206 10.8181 4.73226 10.8181 6.00457C10.8181 6.95337 10.5368 7.88088 10.0096 8.66978C9.48251 9.45868 8.73328 10.0736 7.85669 10.4367C6.98011 10.7997 6.01554 10.8947 5.08496 10.7096C4.15439 10.5245 3.2996 10.0676 2.62869 9.39674C1.95778 8.72583 1.50089 7.87104 1.31579 6.94046C1.13068 6.00989 1.22568 5.04532 1.58878 4.16874C1.95187 3.29215 2.56675 2.54292 3.35565 2.0158Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
Jo.render = gs;
var vs = `
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
`, ys = {
  root: "p-iconfield"
}, ws = R.extend({
  name: "iconfield",
  style: vs,
  classes: ys
}), xs = {
  name: "BaseIconField",
  extends: Ee,
  style: ws,
  provide: function() {
    return {
      $pcIconField: this,
      $parentInstance: this
    };
  }
}, Qo = {
  name: "IconField",
  extends: xs,
  inheritAttrs: !1
};
function ks(t, e, n, o, r, i) {
  return b(), w("div", S({
    class: t.cx("root")
  }, t.ptmi("root")), [j(t.$slots, "default")], 16);
}
Qo.render = ks;
var Ss = {
  root: "p-inputicon"
}, $s = R.extend({
  name: "inputicon",
  classes: Ss
}), Cs = {
  name: "BaseInputIcon",
  extends: Ee,
  style: $s,
  props: {
    class: null
  },
  provide: function() {
    return {
      $pcInputIcon: this,
      $parentInstance: this
    };
  }
}, er = {
  name: "InputIcon",
  extends: Cs,
  inheritAttrs: !1,
  computed: {
    containerClass: function() {
      return [this.cx("root"), this.class];
    }
  }
};
function Os(t, e, n, o, r, i) {
  return b(), w("span", S({
    class: i.containerClass
  }, t.ptmi("root"), {
    "aria-hidden": "true"
  }), [j(t.$slots, "default")], 16);
}
er.render = Os;
var Is = {
  name: "BaseEditableHolder",
  extends: Ee,
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
      handler: function(e) {
        this.d_value = e;
      }
    },
    defaultValue: function(e) {
      this.d_value = e;
    },
    $formName: {
      immediate: !0,
      handler: function(e) {
        var n, o;
        this.formField = ((n = this.$pcForm) === null || n === void 0 || (o = n.register) === null || o === void 0 ? void 0 : o.call(n, e, this.$formControl)) || {};
      }
    },
    $formControl: {
      immediate: !0,
      handler: function(e) {
        var n, o;
        this.formField = ((n = this.$pcForm) === null || n === void 0 || (o = n.register) === null || o === void 0 ? void 0 : o.call(n, this.$formName, e)) || {};
      }
    },
    $formDefaultValue: {
      immediate: !0,
      handler: function(e) {
        this.d_value !== e && (this.d_value = e);
      }
    },
    $formValue: {
      immediate: !1,
      handler: function(e) {
        var n;
        (n = this.$pcForm) !== null && n !== void 0 && n.getFieldState(this.$formName) && e !== this.d_value && (this.d_value = e);
      }
    }
  },
  formField: {},
  methods: {
    writeValue: function(e, n) {
      var o, r;
      this.controlled && (this.d_value = e, this.$emit("update:modelValue", e)), this.$emit("value-change", e), (o = (r = this.formField).onChange) === null || o === void 0 || o.call(r, {
        originalEvent: n,
        value: e
      });
    },
    // @todo move to @primeuix/utils
    findNonEmpty: function() {
      for (var e = arguments.length, n = new Array(e), o = 0; o < e; o++)
        n[o] = arguments[o];
      return n.find(V);
    }
  },
  computed: {
    $filled: function() {
      return V(this.d_value);
    },
    $invalid: function() {
      var e, n;
      return !this.$formNovalidate && this.findNonEmpty(this.invalid, (e = this.$pcFormField) === null || e === void 0 || (e = e.$field) === null || e === void 0 ? void 0 : e.invalid, (n = this.$pcForm) === null || n === void 0 || (n = n.getFieldState(this.$formName)) === null || n === void 0 ? void 0 : n.invalid);
    },
    $formName: function() {
      var e;
      return this.$formNovalidate ? void 0 : this.name || ((e = this.$formControl) === null || e === void 0 ? void 0 : e.name);
    },
    $formControl: function() {
      var e;
      return this.formControl || ((e = this.$pcFormField) === null || e === void 0 ? void 0 : e.formControl);
    },
    $formNovalidate: function() {
      var e;
      return (e = this.$formControl) === null || e === void 0 ? void 0 : e.novalidate;
    },
    $formDefaultValue: function() {
      var e, n;
      return this.findNonEmpty(this.d_value, (e = this.$pcFormField) === null || e === void 0 ? void 0 : e.initialValue, (n = this.$pcForm) === null || n === void 0 || (n = n.initialValues) === null || n === void 0 ? void 0 : n[this.$formName]);
    },
    $formValue: function() {
      var e, n;
      return this.findNonEmpty((e = this.$pcFormField) === null || e === void 0 || (e = e.$field) === null || e === void 0 ? void 0 : e.value, (n = this.$pcForm) === null || n === void 0 || (n = n.getFieldState(this.$formName)) === null || n === void 0 ? void 0 : n.value);
    },
    controlled: function() {
      return this.$inProps.hasOwnProperty("modelValue") || !this.$inProps.hasOwnProperty("modelValue") && !this.$inProps.hasOwnProperty("defaultValue");
    },
    // @deprecated use $filled instead
    filled: function() {
      return this.$filled;
    }
  }
}, tr = {
  name: "BaseInput",
  extends: Is,
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
      var e;
      return (e = this.variant) !== null && e !== void 0 ? e : this.$primevue.config.inputStyle || this.$primevue.config.inputVariant;
    },
    $fluid: function() {
      var e;
      return (e = this.fluid) !== null && e !== void 0 ? e : !!this.$pcFluid;
    },
    // @deprecated use $fluid instead
    hasFluid: function() {
      return this.$fluid;
    }
  }
}, _s = `
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
`, Ls = {
  root: function(e) {
    var n = e.instance, o = e.props;
    return ["p-inputtext p-component", {
      "p-filled": n.$filled,
      "p-inputtext-sm p-inputfield-sm": o.size === "small",
      "p-inputtext-lg p-inputfield-lg": o.size === "large",
      "p-invalid": n.$invalid,
      "p-variant-filled": n.$variant === "filled",
      "p-inputtext-fluid": n.$fluid
    }];
  }
}, Ts = R.extend({
  name: "inputtext",
  style: _s,
  classes: Ls
}), Ps = {
  name: "BaseInputText",
  extends: tr,
  style: Ts,
  provide: function() {
    return {
      $pcInputText: this,
      $parentInstance: this
    };
  }
};
function vt(t) {
  "@babel/helpers - typeof";
  return vt = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, vt(t);
}
function As(t, e, n) {
  return (e = Es(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function Es(t) {
  var e = zs(t, "string");
  return vt(e) == "symbol" ? e : e + "";
}
function zs(t, e) {
  if (vt(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(t, e);
    if (vt(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var nr = {
  name: "InputText",
  extends: Ps,
  inheritAttrs: !1,
  methods: {
    onInput: function(e) {
      this.writeValue(e.target.value, e);
    }
  },
  computed: {
    attrs: function() {
      return S(this.ptmi("root", {
        context: {
          filled: this.$filled,
          disabled: this.disabled
        }
      }), this.formField);
    },
    dataP: function() {
      return we(As({
        invalid: this.$invalid,
        fluid: this.$fluid,
        filled: this.$variant === "filled"
      }, this.size, this.size));
    }
  }
}, js = ["value", "name", "disabled", "aria-invalid", "data-p"];
function Ds(t, e, n, o, r, i) {
  return b(), w("input", S({
    type: "text",
    class: t.cx("root"),
    value: t.d_value,
    name: t.name,
    disabled: t.disabled,
    "aria-invalid": t.$invalid || void 0,
    "data-p": i.dataP,
    onInput: e[0] || (e[0] = function() {
      return i.onInput && i.onInput.apply(i, arguments);
    })
  }, i.attrs), null, 16, js);
}
nr.render = Ds;
var Fs = `
    .p-virtualscroller-loader {
        background: dt('virtualscroller.loader.mask.background');
        color: dt('virtualscroller.loader.mask.color');
    }

    .p-virtualscroller-loading-icon {
        font-size: dt('virtualscroller.loader.icon.size');
        width: dt('virtualscroller.loader.icon.size');
        height: dt('virtualscroller.loader.icon.size');
    }
`, Ms = `
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
`, co = R.extend({
  name: "virtualscroller",
  css: Ms,
  style: Fs
}), Vs = {
  name: "BaseVirtualScroller",
  extends: Ee,
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
  style: co,
  provide: function() {
    return {
      $pcVirtualScroller: this,
      $parentInstance: this
    };
  },
  beforeMount: function() {
    var e;
    co.loadCSS({
      nonce: (e = this.$primevueConfig) === null || e === void 0 || (e = e.csp) === null || e === void 0 ? void 0 : e.nonce
    });
  }
};
function yt(t) {
  "@babel/helpers - typeof";
  return yt = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, yt(t);
}
function po(t, e) {
  var n = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(t);
    e && (o = o.filter(function(r) {
      return Object.getOwnPropertyDescriptor(t, r).enumerable;
    })), n.push.apply(n, o);
  }
  return n;
}
function Qe(t) {
  for (var e = 1; e < arguments.length; e++) {
    var n = arguments[e] != null ? arguments[e] : {};
    e % 2 ? po(Object(n), !0).forEach(function(o) {
      or(t, o, n[o]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(n)) : po(Object(n)).forEach(function(o) {
      Object.defineProperty(t, o, Object.getOwnPropertyDescriptor(n, o));
    });
  }
  return t;
}
function or(t, e, n) {
  return (e = Ns(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function Ns(t) {
  var e = Bs(t, "string");
  return yt(e) == "symbol" ? e : e + "";
}
function Bs(t, e) {
  if (yt(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(t, e);
    if (yt(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var rr = {
  name: "VirtualScroller",
  extends: Vs,
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
      Pt(this.element) && (this.setContentEl(this.content), this.init(), this.calculateAutoSize(), this.defaultWidth = Fe(this.element), this.defaultHeight = De(this.element), this.defaultContentWidth = Fe(this.content), this.defaultContentHeight = De(this.content), this.initialized = !0), this.element && this.bindResizeListener();
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
      var n = this, o = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "auto", r = this.isBoth(), i = this.isHorizontal(), l = r ? e.every(function(L) {
        return L > -1;
      }) : e > -1;
      if (l) {
        var s = this.first, a = this.element, u = a.scrollTop, d = u === void 0 ? 0 : u, c = a.scrollLeft, p = c === void 0 ? 0 : c, f = this.calculateNumItems(), m = f.numToleratedItems, y = this.getContentPosition(), g = this.itemSize, $ = function() {
          var M = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0, q = arguments.length > 1 ? arguments[1] : void 0;
          return M <= q ? 0 : M;
        }, C = function(M, q, Z) {
          return M * q + Z;
        }, T = function() {
          var M = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0, q = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0;
          return n.scrollTo({
            left: M,
            top: q,
            behavior: o
          });
        }, h = r ? {
          rows: 0,
          cols: 0
        } : 0, O = !1, D = !1;
        r ? (h = {
          rows: $(e[0], m[0]),
          cols: $(e[1], m[1])
        }, T(C(h.cols, g[1], y.left), C(h.rows, g[0], y.top)), D = this.lastScrollPos.top !== d || this.lastScrollPos.left !== p, O = h.rows !== s.rows || h.cols !== s.cols) : (h = $(e, m), i ? T(C(h, g, y.left), d) : T(p, C(h, g, y.top)), D = this.lastScrollPos !== (i ? p : d), O = h !== s), this.isRangeChanged = O, D && (this.first = h);
      }
    },
    scrollInView: function(e, n) {
      var o = this, r = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : "auto";
      if (n) {
        var i = this.isBoth(), l = this.isHorizontal(), s = i ? e.every(function(g) {
          return g > -1;
        }) : e > -1;
        if (s) {
          var a = this.getRenderedRange(), u = a.first, d = a.viewport, c = function() {
            var $ = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0, C = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0;
            return o.scrollTo({
              left: $,
              top: C,
              behavior: r
            });
          }, p = n === "to-start", f = n === "to-end";
          if (p) {
            if (i)
              d.first.rows - u.rows > e[0] ? c(d.first.cols * this.itemSize[1], (d.first.rows - 1) * this.itemSize[0]) : d.first.cols - u.cols > e[1] && c((d.first.cols - 1) * this.itemSize[1], d.first.rows * this.itemSize[0]);
            else if (d.first - u > e) {
              var m = (d.first - 1) * this.itemSize;
              l ? c(m, 0) : c(0, m);
            }
          } else if (f) {
            if (i)
              d.last.rows - u.rows <= e[0] + 1 ? c(d.first.cols * this.itemSize[1], (d.first.rows + 1) * this.itemSize[0]) : d.last.cols - u.cols <= e[1] + 1 && c((d.first.cols + 1) * this.itemSize[1], d.first.rows * this.itemSize[0]);
            else if (d.last - u <= e + 1) {
              var y = (d.first + 1) * this.itemSize;
              l ? c(y, 0) : c(0, y);
            }
          }
        }
      } else
        this.scrollToIndex(e, r);
    },
    getRenderedRange: function() {
      var e = function(c, p) {
        return Math.floor(c / (p || c));
      }, n = this.first, o = 0;
      if (this.element) {
        var r = this.isBoth(), i = this.isHorizontal(), l = this.element, s = l.scrollTop, a = l.scrollLeft;
        if (r)
          n = {
            rows: e(s, this.itemSize[0]),
            cols: e(a, this.itemSize[1])
          }, o = {
            rows: n.rows + this.numItemsInViewport.rows,
            cols: n.cols + this.numItemsInViewport.cols
          };
        else {
          var u = i ? a : s;
          n = e(u, this.itemSize), o = n + this.numItemsInViewport;
        }
      }
      return {
        first: this.first,
        last: this.last,
        viewport: {
          first: n,
          last: o
        }
      };
    },
    calculateNumItems: function() {
      var e = this.isBoth(), n = this.isHorizontal(), o = this.itemSize, r = this.getContentPosition(), i = this.element ? this.element.offsetWidth - r.left : 0, l = this.element ? this.element.offsetHeight - r.top : 0, s = function(p, f) {
        return Math.ceil(p / (f || p));
      }, a = function(p) {
        return Math.ceil(p / 2);
      }, u = e ? {
        rows: s(l, o[0]),
        cols: s(i, o[1])
      } : s(n ? i : l, o), d = this.d_numToleratedItems || (e ? [a(u.rows), a(u.cols)] : a(u));
      return {
        numItemsInViewport: u,
        numToleratedItems: d
      };
    },
    calculateOptions: function() {
      var e = this, n = this.isBoth(), o = this.first, r = this.calculateNumItems(), i = r.numItemsInViewport, l = r.numToleratedItems, s = function(d, c, p) {
        var f = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : !1;
        return e.getLast(d + c + (d < p ? 2 : 3) * p, f);
      }, a = n ? {
        rows: s(o.rows, i.rows, l[0]),
        cols: s(o.cols, i.cols, l[1], !0)
      } : s(o, i, l);
      this.last = a, this.numItemsInViewport = i, this.d_numToleratedItems = l, this.$emit("update:numToleratedItems", this.d_numToleratedItems), this.showLoader && (this.loaderArr = n ? Array.from({
        length: i.rows
      }).map(function() {
        return Array.from({
          length: i.cols
        });
      }) : Array.from({
        length: i
      })), this.lazy && Promise.resolve().then(function() {
        var u;
        e.lazyLoadState = {
          first: e.step ? n ? {
            rows: 0,
            cols: o.cols
          } : 0 : o,
          last: Math.min(e.step ? e.step : a, ((u = e.items) === null || u === void 0 ? void 0 : u.length) || 0)
        }, e.$emit("lazy-load", e.lazyLoadState);
      });
    },
    calculateAutoSize: function() {
      var e = this;
      this.autoSize && !this.d_loading && Promise.resolve().then(function() {
        if (e.content) {
          var n = e.isBoth(), o = e.isHorizontal(), r = e.isVertical();
          e.content.style.minHeight = e.content.style.minWidth = "auto", e.content.style.position = "relative", e.element.style.contain = "none";
          var i = [Fe(e.element), De(e.element)], l = i[0], s = i[1];
          (n || o) && (e.element.style.width = l < e.defaultWidth ? l + "px" : e.scrollWidth || e.defaultWidth + "px"), (n || r) && (e.element.style.height = s < e.defaultHeight ? s + "px" : e.scrollHeight || e.defaultHeight + "px"), e.content.style.minHeight = e.content.style.minWidth = "", e.content.style.position = "", e.element.style.contain = "";
        }
      });
    },
    getLast: function() {
      var e, n, o = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0, r = arguments.length > 1 ? arguments[1] : void 0;
      return this.items ? Math.min(r ? ((e = this.columns || this.items[0]) === null || e === void 0 ? void 0 : e.length) || 0 : ((n = this.items) === null || n === void 0 ? void 0 : n.length) || 0, o) : 0;
    },
    getContentPosition: function() {
      if (this.content) {
        var e = getComputedStyle(this.content), n = parseFloat(e.paddingLeft) + Math.max(parseFloat(e.left) || 0, 0), o = parseFloat(e.paddingRight) + Math.max(parseFloat(e.right) || 0, 0), r = parseFloat(e.paddingTop) + Math.max(parseFloat(e.top) || 0, 0), i = parseFloat(e.paddingBottom) + Math.max(parseFloat(e.bottom) || 0, 0);
        return {
          left: n,
          right: o,
          top: r,
          bottom: i,
          x: n + o,
          y: r + i
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
        var n = this.isBoth(), o = this.isHorizontal(), r = this.element.parentElement, i = this.scrollWidth || "".concat(this.element.offsetWidth || r.offsetWidth, "px"), l = this.scrollHeight || "".concat(this.element.offsetHeight || r.offsetHeight, "px"), s = function(u, d) {
          return e.element.style[u] = d;
        };
        n || o ? (s("height", l), s("width", i)) : s("height", l);
      }
    },
    setSpacerSize: function() {
      var e = this, n = this.items;
      if (n) {
        var o = this.isBoth(), r = this.isHorizontal(), i = this.getContentPosition(), l = function(a, u, d) {
          var c = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : 0;
          return e.spacerStyle = Qe(Qe({}, e.spacerStyle), or({}, "".concat(a), (u || []).length * d + c + "px"));
        };
        o ? (l("height", n, this.itemSize[0], i.y), l("width", this.columns || n[1], this.itemSize[1], i.x)) : r ? l("width", this.columns || n, this.itemSize, i.x) : l("height", n, this.itemSize, i.y);
      }
    },
    setContentPosition: function(e) {
      var n = this;
      if (this.content && !this.appendOnly) {
        var o = this.isBoth(), r = this.isHorizontal(), i = e ? e.first : this.first, l = function(d, c) {
          return d * c;
        }, s = function() {
          var d = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0, c = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0;
          return n.contentStyle = Qe(Qe({}, n.contentStyle), {
            transform: "translate3d(".concat(d, "px, ").concat(c, "px, 0)")
          });
        };
        if (o)
          s(l(i.cols, this.itemSize[1]), l(i.rows, this.itemSize[0]));
        else {
          var a = l(i, this.itemSize);
          r ? s(a, 0) : s(0, a);
        }
      }
    },
    onScrollPositionChange: function(e) {
      var n = this, o = e.target, r = this.isBoth(), i = this.isHorizontal(), l = this.getContentPosition(), s = function(B, U) {
        return B ? B > U ? B - U : B : 0;
      }, a = function(B, U) {
        return Math.floor(B / (U || B));
      }, u = function(B, U, ie, ae, X, ne) {
        return B <= X ? X : ne ? ie - ae - X : U + X - 1;
      }, d = function(B, U, ie, ae, X, ne, le, xe) {
        if (B <= ne) return 0;
        var Q = Math.max(0, le ? B < U ? ie : B - ne : B > U ? ie : B - 2 * ne), oe = n.getLast(Q, xe);
        return Q > oe ? oe - X : Q;
      }, c = function(B, U, ie, ae, X, ne) {
        var le = U + ae + 2 * X;
        return B >= X && (le += X + 1), n.getLast(le, ne);
      }, p = s(o.scrollTop, l.top), f = s(o.scrollLeft, l.left), m = r ? {
        rows: 0,
        cols: 0
      } : 0, y = this.last, g = !1, $ = this.lastScrollPos;
      if (r) {
        var C = this.lastScrollPos.top <= p, T = this.lastScrollPos.left <= f;
        if (!this.appendOnly || this.appendOnly && (C || T)) {
          var h = {
            rows: a(p, this.itemSize[0]),
            cols: a(f, this.itemSize[1])
          }, O = {
            rows: u(h.rows, this.first.rows, this.last.rows, this.numItemsInViewport.rows, this.d_numToleratedItems[0], C),
            cols: u(h.cols, this.first.cols, this.last.cols, this.numItemsInViewport.cols, this.d_numToleratedItems[1], T)
          };
          m = {
            rows: d(h.rows, O.rows, this.first.rows, this.last.rows, this.numItemsInViewport.rows, this.d_numToleratedItems[0], C),
            cols: d(h.cols, O.cols, this.first.cols, this.last.cols, this.numItemsInViewport.cols, this.d_numToleratedItems[1], T, !0)
          }, y = {
            rows: c(h.rows, m.rows, this.last.rows, this.numItemsInViewport.rows, this.d_numToleratedItems[0]),
            cols: c(h.cols, m.cols, this.last.cols, this.numItemsInViewport.cols, this.d_numToleratedItems[1], !0)
          }, g = m.rows !== this.first.rows || y.rows !== this.last.rows || m.cols !== this.first.cols || y.cols !== this.last.cols || this.isRangeChanged, $ = {
            top: p,
            left: f
          };
        }
      } else {
        var D = i ? f : p, L = this.lastScrollPos <= D;
        if (!this.appendOnly || this.appendOnly && L) {
          var M = a(D, this.itemSize), q = u(M, this.first, this.last, this.numItemsInViewport, this.d_numToleratedItems, L);
          m = d(M, q, this.first, this.last, this.numItemsInViewport, this.d_numToleratedItems, L), y = c(M, m, this.last, this.numItemsInViewport, this.d_numToleratedItems), g = m !== this.first || y !== this.last || this.isRangeChanged, $ = D;
        }
      }
      return {
        first: m,
        last: y,
        isRangeChanged: g,
        scrollPos: $
      };
    },
    onScrollChange: function(e) {
      var n = this.onScrollPositionChange(e), o = n.first, r = n.last, i = n.isRangeChanged, l = n.scrollPos;
      if (i) {
        var s = {
          first: o,
          last: r
        };
        if (this.setContentPosition(s), this.first = o, this.last = r, this.lastScrollPos = l, this.$emit("scroll-index-change", s), this.lazy && this.isPageChanged(o)) {
          var a, u, d = {
            first: this.step ? Math.min(this.getPageByFirst(o) * this.step, (((a = this.items) === null || a === void 0 ? void 0 : a.length) || 0) - this.step) : o,
            last: Math.min(this.step ? (this.getPageByFirst(o) + 1) * this.step : r, ((u = this.items) === null || u === void 0 ? void 0 : u.length) || 0)
          }, c = this.lazyLoadState.first !== d.first || this.lazyLoadState.last !== d.last;
          c && this.$emit("lazy-load", d), this.lazyLoadState = d;
        }
      }
    },
    onScroll: function(e) {
      var n = this;
      if (this.$emit("scroll", e), this.delay) {
        if (this.scrollTimeout && clearTimeout(this.scrollTimeout), this.isPageChanged()) {
          if (!this.d_loading && this.showLoader) {
            var o = this.onScrollPositionChange(e), r = o.isRangeChanged, i = r || (this.step ? this.isPageChanged() : !1);
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
        if (Pt(e.element)) {
          var n = e.isBoth(), o = e.isVertical(), r = e.isHorizontal(), i = [Fe(e.element), De(e.element)], l = i[0], s = i[1], a = l !== e.defaultWidth, u = s !== e.defaultHeight, d = n ? a || u : r ? a : o ? u : !1;
          d && (e.d_numToleratedItems = e.numToleratedItems, e.defaultWidth = l, e.defaultHeight = s, e.defaultContentWidth = Fe(e.content), e.defaultContentHeight = De(e.content), e.init());
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
      var n = (this.items || []).length, o = this.isBoth() ? this.first.rows + e : this.first + e;
      return {
        index: o,
        count: n,
        first: o === 0,
        last: o === n - 1,
        even: o % 2 === 0,
        odd: o % 2 !== 0
      };
    },
    getLoaderOptions: function(e, n) {
      var o = this.loaderArr.length;
      return Qe({
        index: e,
        count: o,
        first: e === 0,
        last: e === o - 1,
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
      this.content = e || this.content || Dt(this.element, '[data-pc-section="content"]');
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
    SpinnerIcon: Mt
  }
}, Rs = ["tabindex"];
function Hs(t, e, n, o, r, i) {
  var l = pe("SpinnerIcon");
  return t.disabled ? (b(), w($e, {
    key: 1
  }, [j(t.$slots, "default"), j(t.$slots, "content", {
    items: t.items,
    rows: t.items,
    columns: i.loadedColumns
  })], 64)) : (b(), w("div", S({
    key: 0,
    ref: i.elementRef,
    class: i.containerClass,
    tabindex: t.tabindex,
    style: t.style,
    onScroll: e[0] || (e[0] = function() {
      return i.onScroll && i.onScroll.apply(i, arguments);
    })
  }, t.ptmi("root")), [j(t.$slots, "content", {
    styleClass: i.contentClass,
    items: i.loadedItems,
    getItemOptions: i.getOptions,
    loading: r.d_loading,
    getLoaderOptions: i.getLoaderOptions,
    itemSize: t.itemSize,
    rows: i.loadedRows,
    columns: i.loadedColumns,
    contentRef: i.contentRef,
    spacerStyle: r.spacerStyle,
    contentStyle: r.contentStyle,
    vertical: i.isVertical(),
    horizontal: i.isHorizontal(),
    both: i.isBoth()
  }, function() {
    return [k("div", S({
      ref: i.contentRef,
      class: i.contentClass,
      style: r.contentStyle
    }, t.ptm("content")), [(b(!0), w($e, null, Ze(i.loadedItems, function(s, a) {
      return j(t.$slots, "item", {
        key: a,
        item: s,
        options: i.getOptions(a)
      });
    }), 128))], 16)];
  }), t.showSpacer ? (b(), w("div", S({
    key: 0,
    class: "p-virtualscroller-spacer",
    style: r.spacerStyle
  }, t.ptm("spacer")), null, 16)) : P("", !0), !t.loaderDisabled && t.showLoader && r.d_loading ? (b(), w("div", S({
    key: 1,
    class: i.loaderClass
  }, t.ptm("loader")), [t.$slots && t.$slots.loader ? (b(!0), w($e, {
    key: 0
  }, Ze(r.loaderArr, function(s, a) {
    return j(t.$slots, "loader", {
      key: a,
      options: i.getLoaderOptions(a, i.isBoth() && {
        numCols: t.d_numItemsInViewport.cols
      })
    });
  }), 128)) : P("", !0), j(t.$slots, "loadingicon", {}, function() {
    return [_(l, S({
      spin: "",
      class: "p-virtualscroller-loading-icon"
    }, t.ptm("loadingIcon")), null, 16)];
  })], 16)) : P("", !0)], 16, Rs));
}
rr.render = Hs;
var Ks = `
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
`, Us = {
  root: function(e) {
    var n = e.instance, o = e.props, r = e.state;
    return ["p-select p-component p-inputwrapper", {
      "p-disabled": o.disabled,
      "p-invalid": n.$invalid,
      "p-variant-filled": n.$variant === "filled",
      "p-focus": r.focused,
      "p-inputwrapper-filled": n.$filled,
      "p-inputwrapper-focus": r.focused || r.overlayVisible,
      "p-select-open": r.overlayVisible,
      "p-select-fluid": n.$fluid,
      "p-select-sm p-inputfield-sm": o.size === "small",
      "p-select-lg p-inputfield-lg": o.size === "large"
    }];
  },
  label: function(e) {
    var n, o = e.instance, r = e.props;
    return ["p-select-label", {
      "p-placeholder": !r.editable && o.label === r.placeholder,
      "p-select-label-empty": !r.editable && !o.$slots.value && (o.label === "p-emptylabel" || ((n = o.label) === null || n === void 0 ? void 0 : n.length) === 0)
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
    var n = e.instance, o = e.props, r = e.state, i = e.option, l = e.focusedOption;
    return ["p-select-option", {
      "p-select-option-selected": n.isSelected(i) && o.highlightOnSelect,
      "p-focus": r.focusedOptionIndex === l,
      "p-disabled": n.isOptionDisabled(i)
    }];
  },
  optionLabel: "p-select-option-label",
  optionCheckIcon: "p-select-option-check-icon",
  optionBlankIcon: "p-select-option-blank-icon",
  emptyMessage: "p-select-empty-message"
}, Ws = R.extend({
  name: "select",
  style: Ks,
  classes: Us
}), Gs = {
  name: "BaseSelect",
  extends: tr,
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
  style: Ws,
  provide: function() {
    return {
      $pcSelect: this,
      $parentInstance: this
    };
  }
};
function wt(t) {
  "@babel/helpers - typeof";
  return wt = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, wt(t);
}
function qs(t) {
  return Js(t) || Xs(t) || Zs(t) || Ys();
}
function Ys() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Zs(t, e) {
  if (t) {
    if (typeof t == "string") return dn(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? dn(t, e) : void 0;
  }
}
function Xs(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function Js(t) {
  if (Array.isArray(t)) return dn(t);
}
function dn(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, o = Array(e); n < e; n++) o[n] = t[n];
  return o;
}
function fo(t, e) {
  var n = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(t);
    e && (o = o.filter(function(r) {
      return Object.getOwnPropertyDescriptor(t, r).enumerable;
    })), n.push.apply(n, o);
  }
  return n;
}
function ho(t) {
  for (var e = 1; e < arguments.length; e++) {
    var n = arguments[e] != null ? arguments[e] : {};
    e % 2 ? fo(Object(n), !0).forEach(function(o) {
      je(t, o, n[o]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(n)) : fo(Object(n)).forEach(function(o) {
      Object.defineProperty(t, o, Object.getOwnPropertyDescriptor(n, o));
    });
  }
  return t;
}
function je(t, e, n) {
  return (e = Qs(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function Qs(t) {
  var e = eu(t, "string");
  return wt(e) == "symbol" ? e : e + "";
}
function eu(t, e) {
  if (wt(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(t, e);
    if (wt(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var ir = {
  name: "Select",
  extends: Gs,
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
    this.unbindOutsideClickListener(), this.unbindResizeListener(), this.unbindLabelClickListener(), this.unbindMatchMediaOrientationListener(), this.scrollHandler && (this.scrollHandler.destroy(), this.scrollHandler = null), this.overlay && (Xe.clear(this.overlay), this.overlay = null);
  },
  methods: {
    getOptionIndex: function(e, n) {
      return this.virtualScrollerDisabled ? e : n && n(e).index;
    },
    getOptionLabel: function(e) {
      return this.optionLabel ? _e(e, this.optionLabel) : e;
    },
    getOptionValue: function(e) {
      return this.optionValue ? _e(e, this.optionValue) : e;
    },
    getOptionRenderKey: function(e, n) {
      return (this.dataKey ? _e(e, this.dataKey) : this.getOptionLabel(e)) + "_" + n;
    },
    getPTItemOptions: function(e, n, o, r) {
      return this.ptm(r, {
        context: {
          option: e,
          index: o,
          selected: this.isSelected(e),
          focused: this.focusedOptionIndex === this.getOptionIndex(o, n),
          disabled: this.isOptionDisabled(e)
        }
      });
    },
    isOptionDisabled: function(e) {
      return this.optionDisabled ? _e(e, this.optionDisabled) : !1;
    },
    isOptionGroup: function(e) {
      return this.optionGroupLabel && e.optionGroup && e.group;
    },
    getOptionGroupLabel: function(e) {
      return _e(e, this.optionGroupLabel);
    },
    getOptionGroupChildren: function(e) {
      return _e(e, this.optionGroupChildren);
    },
    getAriaPosInset: function(e) {
      var n = this;
      return (this.optionGroupLabel ? e - this.visibleOptions.slice(0, e).filter(function(o) {
        return n.isOptionGroup(o);
      }).length : e) + 1;
    },
    show: function(e) {
      this.$emit("before-show"), this.overlayVisible = !0, this.focusedOptionIndex = this.focusedOptionIndex !== -1 ? this.focusedOptionIndex : this.autoOptionFocus ? this.findFirstFocusedOptionIndex() : this.editable ? -1 : this.findSelectedOptionIndex(), e && se(this.$refs.focusInput);
    },
    hide: function(e) {
      var n = this, o = function() {
        n.$emit("before-hide"), n.overlayVisible = !1, n.clicked = !1, n.focusedOptionIndex = -1, n.searchValue = "", n.resetFilterOnHide && (n.filterValue = null), e && se(n.$refs.focusInput);
      };
      setTimeout(function() {
        o();
      }, 0);
    },
    onFocus: function(e) {
      this.disabled || (this.focused = !0, this.overlayVisible && (this.focusedOptionIndex = this.focusedOptionIndex !== -1 ? this.focusedOptionIndex : this.autoOptionFocus ? this.findFirstFocusedOptionIndex() : this.editable ? -1 : this.findSelectedOptionIndex(), this.scrollInView(this.focusedOptionIndex)), this.$emit("focus", e));
    },
    onBlur: function(e) {
      var n = this;
      setTimeout(function() {
        var o, r;
        n.focused = !1, n.focusedOptionIndex = -1, n.searchValue = "", n.$emit("blur", e), (o = (r = n.formField).onBlur) === null || o === void 0 || o.call(r, e);
      }, 100);
    },
    onKeyDown: function(e) {
      var n = this;
      if (this.disabled) {
        e.preventDefault();
        return;
      }
      if (Jr())
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
      var o = e.metaKey || e.ctrlKey;
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
          !o && jr(e.key) && (!this.overlayVisible && this.show(), !this.editable && this.searchOptions(e, e.key), this.filter && this.$nextTick(function() {
            n.$refs.filterInput && se(n.$refs.filterInput.$el);
          }));
          break;
      }
      this.clicked = !1;
    },
    onEditableInput: function(e) {
      var n = e.target.value;
      this.searchValue = "";
      var o = this.searchOptions(e, n);
      !o && (this.focusedOptionIndex = -1), this.updateModel(e, n), !this.overlayVisible && V(n) && this.show();
    },
    onContainerClick: function(e) {
      this.disabled || this.loading || e.target.tagName === "INPUT" || e.target.getAttribute("data-pc-section") === "clearicon" || e.target.closest('[data-pc-section="clearicon"]') || ((!this.overlay || !this.overlay.contains(e.target)) && (this.overlayVisible ? this.hide(!0) : this.show(!0)), this.clicked = !0);
    },
    onClearClick: function(e) {
      this.updateModel(e, null), this.resetFilterOnClear && (this.filterValue = null);
    },
    onFirstHiddenFocus: function(e) {
      var n = e.relatedTarget === this.$refs.focusInput ? Ge(this.overlay, ':not([data-p-hidden-focusable="true"])') : this.$refs.focusInput;
      se(n);
    },
    onLastHiddenFocus: function(e) {
      var n = e.relatedTarget === this.$refs.focusInput ? Io(this.overlay, ':not([data-p-hidden-focusable="true"])') : this.$refs.focusInput;
      se(n);
    },
    onOptionSelect: function(e, n) {
      var o = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : !0;
      if (this.overlayVisible) {
        var r = this.getOptionValue(n);
        this.updateModel(e, r), o && this.hide(!0);
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
      wa.emit("overlay-click", {
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
        var o = this.focusedOptionIndex !== -1 ? this.findPrevOptionIndex(this.focusedOptionIndex) : this.clicked ? this.findLastOptionIndex() : this.findLastFocusedOptionIndex();
        this.changeFocusedOptionIndex(e, o), !this.overlayVisible && this.show(), e.preventDefault();
      }
    },
    onArrowLeftKey: function(e) {
      var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1;
      n && (this.focusedOptionIndex = -1);
    },
    onHomeKey: function(e) {
      var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1;
      if (n) {
        var o = e.currentTarget;
        e.shiftKey ? o.setSelectionRange(0, e.target.selectionStart) : (o.setSelectionRange(0, 0), this.focusedOptionIndex = -1);
      } else
        this.changeFocusedOptionIndex(e, this.findFirstOptionIndex()), !this.overlayVisible && this.show();
      e.preventDefault();
    },
    onEndKey: function(e) {
      var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1;
      if (n) {
        var o = e.currentTarget;
        if (e.shiftKey)
          o.setSelectionRange(e.target.selectionStart, o.value.length);
        else {
          var r = o.value.length;
          o.setSelectionRange(r, r), this.focusedOptionIndex = -1;
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
      n || (this.overlayVisible && this.hasFocusableElements() ? (se(this.$refs.firstHiddenFocusableElementOnOverlay), e.preventDefault()) : (this.focusedOptionIndex !== -1 && this.onOptionSelect(e, this.visibleOptions[this.focusedOptionIndex]), this.overlayVisible && this.hide(this.filter)));
    },
    onBackspaceKey: function(e) {
      var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1;
      n && !this.overlayVisible && this.show();
    },
    onOverlayEnter: function(e) {
      var n = this;
      Xe.set("overlay", e, this.$primevue.config.zIndex.overlay), $o(e, {
        position: "absolute",
        top: "0"
      }), this.alignOverlay(), this.scrollInView(), this.$attrSelector && e.setAttribute(this.$attrSelector, ""), setTimeout(function() {
        n.autoFilterFocus && n.filter && se(n.$refs.filterInput.$el), n.autoUpdateModel();
      }, 1);
    },
    onOverlayAfterEnter: function() {
      this.bindOutsideClickListener(), this.bindScrollListener(), this.bindResizeListener(), this.$emit("show");
    },
    onOverlayLeave: function(e) {
      var n = this;
      e.style.pointerEvents = "none", this.unbindOutsideClickListener(), this.unbindScrollListener(), this.unbindResizeListener(), this.autoFilterFocus && this.filter && !this.editable && this.$nextTick(function() {
        n.$refs.filterInput && se(n.$refs.filterInput.$el);
      }), this.$emit("hide"), this.overlay = null;
    },
    onOverlayAfterLeave: function(e) {
      Xe.clear(e);
    },
    alignOverlay: function() {
      this.appendTo === "self" ? Wr(this.overlay, this.$el) : this.overlay && (this.overlay.style.minWidth = bn(this.$el) + "px", Ur(this.overlay, this.$el));
    },
    bindOutsideClickListener: function() {
      var e = this;
      this.outsideClickListener || (this.outsideClickListener = function(n) {
        var o = n.composedPath();
        e.overlayVisible && e.overlay && !o.includes(e.$el) && !o.includes(e.overlay) && e.hide();
      }, document.addEventListener("click", this.outsideClickListener, !0));
    },
    unbindOutsideClickListener: function() {
      this.outsideClickListener && (document.removeEventListener("click", this.outsideClickListener, !0), this.outsideClickListener = null);
    },
    bindScrollListener: function() {
      var e = this;
      this.scrollHandler || (this.scrollHandler = new ya(this.$refs.container, function() {
        e.overlayVisible && e.hide();
      })), this.scrollHandler.bindScrollListener();
    },
    unbindScrollListener: function() {
      this.scrollHandler && this.scrollHandler.unbindScrollListener();
    },
    bindResizeListener: function() {
      var e = this;
      this.resizeListener || (this.resizeListener = function() {
        e.overlayVisible && !Qr() && e.hide();
      }, window.addEventListener("resize", this.resizeListener));
    },
    unbindResizeListener: function() {
      this.resizeListener && (window.removeEventListener("resize", this.resizeListener), this.resizeListener = null);
    },
    bindLabelClickListener: function() {
      var e = this;
      if (!this.editable && !this.labelClickListener) {
        var n = document.querySelector('label[for="'.concat(this.labelId, '"]'));
        n && Pt(n) && (this.labelClickListener = function() {
          se(e.$refs.focusInput);
        }, n.addEventListener("click", this.labelClickListener));
      }
    },
    unbindLabelClickListener: function() {
      if (this.labelClickListener) {
        var e = document.querySelector('label[for="'.concat(this.labelId, '"]'));
        e && Pt(e) && e.removeEventListener("click", this.labelClickListener);
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
      return gn(this.overlay, ':not([data-p-hidden-focusable="true"])').length > 0;
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
      return V(e) && !(this.isOptionDisabled(e) || this.isOptionGroup(e));
    },
    isValidSelectedOption: function(e) {
      return this.isValidOption(e) && this.isSelected(e);
    },
    isSelected: function(e) {
      return yo(this.d_value, this.getOptionValue(e), this.equalityKey);
    },
    findFirstOptionIndex: function() {
      var e = this;
      return this.visibleOptions.findIndex(function(n) {
        return e.isValidOption(n);
      });
    },
    findLastOptionIndex: function() {
      var e = this;
      return On(this.visibleOptions, function(n) {
        return e.isValidOption(n);
      });
    },
    findNextOptionIndex: function(e) {
      var n = this, o = e < this.visibleOptions.length - 1 ? this.visibleOptions.slice(e + 1).findIndex(function(r) {
        return n.isValidOption(r);
      }) : -1;
      return o > -1 ? o + e + 1 : e;
    },
    findPrevOptionIndex: function(e) {
      var n = this, o = e > 0 ? On(this.visibleOptions.slice(0, e), function(r) {
        return n.isValidOption(r);
      }) : -1;
      return o > -1 ? o : e;
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
      var o = this;
      this.searchValue = (this.searchValue || "") + n;
      var r = -1, i = !1;
      return V(this.searchValue) && (r = this.visibleOptions.findIndex(function(l) {
        return o.isOptionExactMatched(l);
      }), r === -1 && (r = this.visibleOptions.findIndex(function(l) {
        return o.isOptionStartsWith(l);
      })), r !== -1 && (i = !0), r === -1 && this.focusedOptionIndex === -1 && (r = this.findFirstFocusedOptionIndex()), r !== -1 && this.changeFocusedOptionIndex(e, r)), this.searchTimeout && clearTimeout(this.searchTimeout), this.searchTimeout = setTimeout(function() {
        o.searchValue = "", o.searchTimeout = null;
      }, 500), i;
    },
    changeFocusedOptionIndex: function(e, n) {
      this.focusedOptionIndex !== n && (this.focusedOptionIndex = n, this.scrollInView(), this.selectOnFocus && this.onOptionSelect(e, this.visibleOptions[n], !1));
    },
    scrollInView: function() {
      var e = this, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : -1;
      this.$nextTick(function() {
        var o = n !== -1 ? "".concat(e.$id, "_").concat(n) : e.focusedOptionId, r = Dt(e.list, 'li[id="'.concat(o, '"]'));
        r ? r.scrollIntoView && r.scrollIntoView({
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
      return (e || []).reduce(function(o, r, i) {
        o.push({
          optionGroup: r,
          group: !0,
          index: i
        });
        var l = n.getOptionGroupChildren(r);
        return l && l.forEach(function(s) {
          return o.push(s);
        }), o;
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
        var o = pi.filter(n, this.searchFields, this.filterValue, this.filterMatchMode, this.filterLocale);
        if (this.optionGroupLabel) {
          var r = this.options || [], i = [];
          return r.forEach(function(l) {
            var s = e.getOptionGroupChildren(l), a = s.filter(function(u) {
              return o.includes(u);
            });
            a.length > 0 && i.push(ho(ho({}, l), {}, je({}, typeof e.optionGroupChildren == "string" ? e.optionGroupChildren : "items", qs(a))));
          }), this.flatOptions(i);
        }
        return o;
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
      return V(this.visibleOptions) ? this.filterMessageText.replaceAll("{0}", this.visibleOptions.length) : this.emptyFilterMessageText;
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
      return we(je({
        invalid: this.$invalid,
        disabled: this.disabled,
        focus: this.focused,
        fluid: this.$fluid,
        filled: this.$variant === "filled"
      }, this.size, this.size));
    },
    labelDataP: function() {
      return we(je(je({
        placeholder: !this.editable && this.label === this.placeholder,
        clearable: this.showClear,
        disabled: this.disabled,
        editable: this.editable
      }, this.size, this.size), "empty", !this.editable && !this.$slots.value && (this.label === "p-emptylabel" || this.label.length === 0)));
    },
    dropdownIconDataP: function() {
      return we(je({}, this.size, this.size));
    },
    overlayDataP: function() {
      return we(je({}, "portal-" + this.appendTo, "portal-" + this.appendTo));
    }
  },
  directives: {
    ripple: vn
  },
  components: {
    InputText: nr,
    VirtualScroller: rr,
    Portal: Ft,
    InputIcon: er,
    IconField: Qo,
    TimesIcon: xn,
    ChevronDownIcon: Xo,
    SpinnerIcon: Mt,
    SearchIcon: Jo,
    CheckIcon: Zo,
    BlankIcon: Yo
  }
}, tu = ["id", "data-p"], nu = ["name", "id", "value", "placeholder", "tabindex", "disabled", "aria-label", "aria-labelledby", "aria-expanded", "aria-controls", "aria-activedescendant", "aria-invalid", "data-p"], ou = ["name", "id", "tabindex", "aria-label", "aria-labelledby", "aria-expanded", "aria-controls", "aria-activedescendant", "aria-invalid", "aria-disabled", "data-p"], ru = ["data-p"], iu = ["id"], au = ["id"], lu = ["id", "aria-label", "aria-selected", "aria-disabled", "aria-setsize", "aria-posinset", "onMousedown", "onMousemove", "data-p-selected", "data-p-focused", "data-p-disabled"];
function su(t, e, n, o, r, i) {
  var l = pe("SpinnerIcon"), s = pe("InputText"), a = pe("SearchIcon"), u = pe("InputIcon"), d = pe("IconField"), c = pe("CheckIcon"), p = pe("BlankIcon"), f = pe("VirtualScroller"), m = pe("Portal"), y = cn("ripple");
  return b(), w("div", S({
    ref: "container",
    id: t.$id,
    class: t.cx("root"),
    onClick: e[12] || (e[12] = function() {
      return i.onContainerClick && i.onContainerClick.apply(i, arguments);
    }),
    "data-p": i.containerDataP
  }, t.ptmi("root")), [t.editable ? (b(), w("input", S({
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
    "aria-expanded": r.overlayVisible,
    "aria-controls": r.overlayVisible ? t.$id + "_list" : void 0,
    "aria-activedescendant": r.focused ? i.focusedOptionId : void 0,
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
  }, t.ptm("label")), null, 16, nu)) : (b(), w("span", S({
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
    "aria-expanded": r.overlayVisible,
    "aria-controls": t.$id + "_list",
    "aria-activedescendant": r.focused ? i.focusedOptionId : void 0,
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
  }, t.ptm("label")), [j(t.$slots, "value", {
    value: t.d_value,
    placeholder: t.placeholder
  }, function() {
    var g;
    return [ce(z(i.label === "p-emptylabel" ? " " : (g = i.label) !== null && g !== void 0 ? g : "empty"), 1)];
  })], 16, ou)), i.isClearIconVisible ? j(t.$slots, "clearicon", {
    key: 2,
    class: J(t.cx("clearIcon")),
    clearCallback: i.onClearClick
  }, function() {
    return [(b(), fe(ot(t.clearIcon ? "i" : "TimesIcon"), S({
      ref: "clearIcon",
      class: [t.cx("clearIcon"), t.clearIcon],
      onClick: i.onClearClick
    }, t.ptm("clearIcon"), {
      "data-pc-section": "clearicon"
    }), null, 16, ["class", "onClick"]))];
  }) : P("", !0), k("div", S({
    class: t.cx("dropdown")
  }, t.ptm("dropdown")), [t.loading ? j(t.$slots, "loadingicon", {
    key: 0,
    class: J(t.cx("loadingIcon"))
  }, function() {
    return [t.loadingIcon ? (b(), w("span", S({
      key: 0,
      class: [t.cx("loadingIcon"), "pi-spin", t.loadingIcon],
      "aria-hidden": "true"
    }, t.ptm("loadingIcon")), null, 16)) : (b(), fe(l, S({
      key: 1,
      class: t.cx("loadingIcon"),
      spin: "",
      "aria-hidden": "true"
    }, t.ptm("loadingIcon")), null, 16, ["class"]))];
  }) : j(t.$slots, "dropdownicon", {
    key: 1,
    class: J(t.cx("dropdownIcon"))
  }, function() {
    return [(b(), fe(ot(t.dropdownIcon ? "span" : "ChevronDownIcon"), S({
      class: [t.cx("dropdownIcon"), t.dropdownIcon],
      "aria-hidden": "true",
      "data-p": i.dropdownIconDataP
    }, t.ptm("dropdownIcon")), null, 16, ["class", "data-p"]))];
  })], 16), _(m, {
    appendTo: t.appendTo
  }, {
    default: G(function() {
      return [_(go, S({
        name: "p-anchored-overlay",
        onEnter: i.onOverlayEnter,
        onAfterEnter: i.onOverlayAfterEnter,
        onLeave: i.onOverlayLeave,
        onAfterLeave: i.onOverlayAfterLeave
      }, t.ptm("transition")), {
        default: G(function() {
          return [r.overlayVisible ? (b(), w("div", S({
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
          }, t.ptm("overlay")), [k("span", S({
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
          }), null, 16), j(t.$slots, "header", {
            value: t.d_value,
            options: i.visibleOptions
          }), t.filter ? (b(), w("div", S({
            key: 0,
            class: t.cx("header")
          }, t.ptm("header")), [_(d, {
            unstyled: t.unstyled,
            pt: t.ptm("pcFilterContainer")
          }, {
            default: G(function() {
              return [_(s, {
                ref: "filterInput",
                type: "text",
                value: r.filterValue,
                onVnodeMounted: i.onFilterUpdated,
                onVnodeUpdated: i.onFilterUpdated,
                class: J(t.cx("pcFilter")),
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
              }, null, 8, ["value", "onVnodeMounted", "onVnodeUpdated", "class", "placeholder", "variant", "unstyled", "aria-owns", "aria-activedescendant", "onKeydown", "onBlur", "onInput", "pt"]), _(u, {
                unstyled: t.unstyled,
                pt: t.ptm("pcFilterIconContainer")
              }, {
                default: G(function() {
                  return [j(t.$slots, "filtericon", {}, function() {
                    return [t.filterIcon ? (b(), w("span", S({
                      key: 0,
                      class: t.filterIcon
                    }, t.ptm("filterIcon")), null, 16)) : (b(), fe(a, Cr(S({
                      key: 1
                    }, t.ptm("filterIcon"))), null, 16))];
                  })];
                }),
                _: 3
              }, 8, ["unstyled", "pt"])];
            }),
            _: 3
          }, 8, ["unstyled", "pt"]), k("span", S({
            role: "status",
            "aria-live": "polite",
            class: "p-hidden-accessible"
          }, t.ptm("hiddenFilterResult"), {
            "data-p-hidden-accessible": !0
          }), z(i.filterResultMessageText), 17)], 16)) : P("", !0), k("div", S({
            class: t.cx("listContainer"),
            style: {
              "max-height": i.virtualScrollerDisabled ? t.scrollHeight : ""
            }
          }, t.ptm("listContainer")), [_(f, S({
            ref: i.virtualScrollerRef
          }, t.virtualScrollerOptions, {
            items: i.visibleOptions,
            style: {
              height: t.scrollHeight
            },
            tabindex: -1,
            disabled: i.virtualScrollerDisabled,
            pt: t.ptm("virtualScroller")
          }), Or({
            content: G(function(g) {
              var $ = g.styleClass, C = g.contentRef, T = g.items, h = g.getItemOptions, O = g.contentStyle, D = g.itemSize;
              return [k("ul", S({
                ref: function(M) {
                  return i.listRef(M, C);
                },
                id: t.$id + "_list",
                class: [t.cx("list"), $],
                style: O,
                role: "listbox"
              }, t.ptm("list")), [(b(!0), w($e, null, Ze(T, function(L, M) {
                return b(), w($e, {
                  key: i.getOptionRenderKey(L, i.getOptionIndex(M, h))
                }, [i.isOptionGroup(L) ? (b(), w("li", S({
                  key: 0,
                  id: t.$id + "_" + i.getOptionIndex(M, h),
                  style: {
                    height: D ? D + "px" : void 0
                  },
                  class: t.cx("optionGroup"),
                  role: "option"
                }, {
                  ref_for: !0
                }, t.ptm("optionGroup")), [j(t.$slots, "optiongroup", {
                  option: L.optionGroup,
                  index: i.getOptionIndex(M, h)
                }, function() {
                  return [k("span", S({
                    class: t.cx("optionGroupLabel")
                  }, {
                    ref_for: !0
                  }, t.ptm("optionGroupLabel")), z(i.getOptionGroupLabel(L.optionGroup)), 17)];
                })], 16, au)) : Ve((b(), w("li", S({
                  key: 1,
                  id: t.$id + "_" + i.getOptionIndex(M, h),
                  class: t.cx("option", {
                    option: L,
                    focusedOption: i.getOptionIndex(M, h)
                  }),
                  style: {
                    height: D ? D + "px" : void 0
                  },
                  role: "option",
                  "aria-label": i.getOptionLabel(L),
                  "aria-selected": i.isSelected(L),
                  "aria-disabled": i.isOptionDisabled(L),
                  "aria-setsize": i.ariaSetSize,
                  "aria-posinset": i.getAriaPosInset(i.getOptionIndex(M, h)),
                  onMousedown: function(Z) {
                    return i.onOptionSelect(Z, L);
                  },
                  onMousemove: function(Z) {
                    return i.onOptionMouseMove(Z, i.getOptionIndex(M, h));
                  },
                  onClick: e[8] || (e[8] = Kt(function() {
                  }, ["stop"])),
                  "data-p-selected": !t.checkmark && i.isSelected(L),
                  "data-p-focused": r.focusedOptionIndex === i.getOptionIndex(M, h),
                  "data-p-disabled": i.isOptionDisabled(L)
                }, {
                  ref_for: !0
                }, i.getPTItemOptions(L, h, M, "option")), [t.checkmark ? (b(), w($e, {
                  key: 0
                }, [i.isSelected(L) ? (b(), fe(c, S({
                  key: 0,
                  class: t.cx("optionCheckIcon")
                }, {
                  ref_for: !0
                }, t.ptm("optionCheckIcon")), null, 16, ["class"])) : (b(), fe(p, S({
                  key: 1,
                  class: t.cx("optionBlankIcon")
                }, {
                  ref_for: !0
                }, t.ptm("optionBlankIcon")), null, 16, ["class"]))], 64)) : P("", !0), j(t.$slots, "option", {
                  option: L,
                  selected: i.isSelected(L),
                  index: i.getOptionIndex(M, h)
                }, function() {
                  return [k("span", S({
                    class: t.cx("optionLabel")
                  }, {
                    ref_for: !0
                  }, t.ptm("optionLabel")), z(i.getOptionLabel(L)), 17)];
                })], 16, lu)), [[y]])], 64);
              }), 128)), r.filterValue && (!T || T && T.length === 0) ? (b(), w("li", S({
                key: 0,
                class: t.cx("emptyMessage"),
                role: "option"
              }, t.ptm("emptyMessage"), {
                "data-p-hidden-accessible": !0
              }), [j(t.$slots, "emptyfilter", {}, function() {
                return [ce(z(i.emptyFilterMessageText), 1)];
              })], 16)) : !t.options || t.options && t.options.length === 0 ? (b(), w("li", S({
                key: 1,
                class: t.cx("emptyMessage"),
                role: "option"
              }, t.ptm("emptyMessage"), {
                "data-p-hidden-accessible": !0
              }), [j(t.$slots, "empty", {}, function() {
                return [ce(z(i.emptyMessageText), 1)];
              })], 16)) : P("", !0)], 16, iu)];
            }),
            _: 2
          }, [t.$slots.loader ? {
            name: "loader",
            fn: G(function(g) {
              var $ = g.options;
              return [j(t.$slots, "loader", {
                options: $
              })];
            }),
            key: "0"
          } : void 0]), 1040, ["items", "style", "disabled", "pt"])], 16), j(t.$slots, "footer", {
            value: t.d_value,
            options: i.visibleOptions
          }), !t.options || t.options && t.options.length === 0 ? (b(), w("span", S({
            key: 1,
            role: "status",
            "aria-live": "polite",
            class: "p-hidden-accessible"
          }, t.ptm("hiddenEmptyMessage"), {
            "data-p-hidden-accessible": !0
          }), z(i.emptyMessageText), 17)) : P("", !0), k("span", S({
            role: "status",
            "aria-live": "polite",
            class: "p-hidden-accessible"
          }, t.ptm("hiddenSelectedMessage"), {
            "data-p-hidden-accessible": !0
          }), z(i.selectedMessageText), 17), k("span", S({
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
          }), null, 16)], 16, ru)) : P("", !0)];
        }),
        _: 3
      }, 16, ["onEnter", "onAfterEnter", "onLeave", "onAfterLeave"])];
    }),
    _: 3
  }, 8, ["appendTo"])], 16, tu);
}
ir.render = su;
const uu = /* @__PURE__ */ pn({
  __name: "SelectField",
  props: {
    modelValue: {},
    options: {},
    ariaLabel: {},
    placeholder: {}
  },
  emits: ["update:modelValue"],
  setup(t, { emit: e }) {
    const n = e;
    return (o, r) => (b(), fe(E(ir), {
      class: "kx-select",
      "model-value": t.modelValue,
      options: t.options,
      "option-label": "label",
      "option-value": "value",
      "aria-label": t.ariaLabel,
      placeholder: t.placeholder,
      "onUpdate:modelValue": r[0] || (r[0] = (i) => n("update:modelValue", i))
    }, null, 8, ["model-value", "options", "aria-label", "placeholder"]));
  }
}), du = { class: "kx" }, cu = { class: "kx-head" }, pu = { class: "kx-head-icon" }, fu = { class: "kx-head-actions" }, hu = { class: "kx-search" }, mu = {
  key: 0,
  class: "kx-err"
}, bu = { class: "kx-body" }, gu = {
  key: 0,
  class: "kx-loading"
}, vu = {
  key: 1,
  class: "kx-empty"
}, yu = { class: "kx-empty-ico" }, wu = { class: "kx-empty-actions" }, xu = {
  key: 2,
  class: "kx-empty"
}, ku = { class: "kx-empty-ico" }, Su = { class: "kx-empty-sub" }, $u = { class: "kx-empty-actions" }, Cu = {
  key: 3,
  class: "kx-grid"
}, Ou = ["aria-label", "onClick", "onKeydown"], Iu = { class: "kx-card-head" }, _u = { class: "kx-ficon" }, Lu = { class: "kx-card-id" }, Tu = ["title"], Pu = { class: "kx-card-meta" }, Au = {
  key: 0,
  class: "kx-chip kx-tag-sm kx-ver"
}, Eu = ["title"], zu = {
  key: 2,
  class: "kx-chip kx-tag-sm kx-scope"
}, ju = {
  key: 3,
  class: "kx-chip kx-tag-sm kx-status"
}, Du = { class: "kx-card-desc" }, Fu = { class: "kx-modal-head-icon" }, Mu = { class: "kx-modal-head-text" }, Vu = { class: "kx-modal-head-title" }, Nu = { class: "kx-modal-head-sub" }, Bu = {
  key: 0,
  class: "kx-chip kx-tag-sm kx-ver"
}, Ru = { class: "kx-edit-cols" }, Hu = { class: "kx-edit-left" }, Ku = { class: "kx-field" }, Uu = { class: "kx-name-row" }, Wu = ["disabled"], Gu = { class: "kx-field" }, qu = { class: "kx-field" }, Yu = {
  key: 0,
  class: "kx-meta-line"
}, Zu = { key: 0 }, Xu = { key: 1 }, Ju = { key: 2 }, Qu = {
  key: 1,
  class: "kx-field"
}, ed = { class: "kx-files" }, td = {
  key: 0,
  class: "kx-file-kind"
}, nd = ["aria-label", "aria-busy"], od = {
  key: 0,
  role: "status"
}, rd = {
  key: 1,
  role: "alert"
}, id = {
  key: 2,
  class: "kx-file-content"
}, ad = {
  key: 2,
  class: "kx-field"
}, ld = { class: "kx-field-lbl" }, sd = { class: "kx-field-hint-inline" }, ud = { class: "kx-vers" }, dd = ["onClick"], cd = { class: "kx-chip kx-tag-sm kx-ver" }, pd = { class: "kx-ver-when" }, fd = {
  key: 0,
  class: "kx-ver-files"
}, hd = { class: "kx-edit-right" }, md = { class: "kx-edit-right-head" }, bd = { class: "kx-field-lbl" }, gd = { class: "kx-field-hint-inline" }, vd = {
  key: 0,
  class: "kx-preview-bar"
}, yd = { class: "kx-preview-tag" }, wd = ["value"], xd = {
  key: 0,
  class: "kx-err inline kx-edit-err"
}, Rt = "tabler:bulb", kd = /* @__PURE__ */ pn({
  __name: "skills",
  setup(t) {
    const e = {
      header: { class: "kx-dialog-header" },
      content: { class: "kx-dialog-content" },
      footer: { class: "kx-dialog-footer" }
    }, n = [
      { label: "Active", value: "active" },
      { label: "Archived", value: "archived" }
    ], o = K(!1), r = K(""), i = K([]), l = K(""), s = Ht(() => {
      const I = l.value.trim().toLowerCase();
      return I ? i.value.filter((x) => (x.name || "").toLowerCase().includes(I) || (x.description || "").toLowerCase().includes(I)) : i.value;
    });
    async function a() {
      o.value = !0, r.value = "";
      try {
        i.value = await Nl();
      } catch (I) {
        i.value = [], r.value = Le(I, "could not load skills");
      } finally {
        o.value = !1;
      }
    }
    const u = K(!1), d = K(!1), c = K(""), p = K(null), f = K([]), m = K(null), y = K(!1), g = K(""), $ = K(""), C = K("");
    async function T(I, x = !1) {
      if (!(!p.value || !m.value?.version)) {
        y.value = !0, g.value = I.path, $.value = "", C.value = "";
        try {
          const v = await Rl(p.value.skill_id, I.path, m.value.version);
          if (x) {
            const W = URL.createObjectURL(v);
            try {
              const Oe = document.createElement("a");
              Oe.href = W, Oe.download = I.path.split("/").pop() || I.path, Oe.click();
            } finally {
              URL.revokeObjectURL(W);
            }
          } else v.type.startsWith("text/") || /(?:json|xml|javascript|yaml)$/.test(v.type) ? $.value = await v.text() : $.value = "Binary file. Download to view its content.";
        } catch (v) {
          C.value = Le(v, "could not read skill file");
        } finally {
          y.value = !1;
        }
      }
    }
    const h = K({ name: "", description: "", body: "", status: "active", icon: Rt }), O = K([]), D = K(null), L = K(""), M = K(null), q = Ht(() => D.value !== null);
    function Z() {
      p.value = null, m.value = null, f.value = [], O.value = [], U(), h.value = { name: "", description: "", body: "", status: "active", icon: Rt }, c.value = "", u.value = !0;
    }
    async function B(I) {
      p.value = I, m.value = null, f.value = [], O.value = [], U(), c.value = "", h.value = {
        name: I.name || "",
        description: I.description || "",
        body: "",
        status: I.status || "active",
        icon: I.icon || Rt
      }, u.value = !0;
      try {
        const x = await uo(I.skill_id);
        m.value = x, h.value.body = x.body || "", h.value.description = x.description || h.value.description, h.value.status = x.status || h.value.status, h.value.icon = x.icon || h.value.icon, f.value = Array.isArray(x.files) ? x.files : [];
      } catch (x) {
        c.value = Le(x, "could not load skill body");
      }
      try {
        O.value = await Bl(I.skill_id);
      } catch {
        O.value = [];
      }
    }
    function U() {
      g.value = "", $.value = "", C.value = "", D.value = null, L.value = "", M.value = null;
    }
    async function ie(I) {
      if (p.value) {
        c.value = "";
        try {
          const x = await uo(p.value.skill_id, I);
          M.value = x, L.value = x.body || "", D.value = I;
        } catch (x) {
          c.value = Le(x, "could not load version");
        }
      }
    }
    function ae() {
      U();
    }
    function X() {
      h.value.body = L.value, U();
    }
    function ne(I) {
      if (!I) return "";
      const x = Date.parse(I);
      if (Number.isNaN(x)) return "";
      const v = Math.max(0, Math.round((Date.now() - x) / 1e3));
      if (v < 60) return "just now";
      const W = Math.round(v / 60);
      if (W < 60) return `${W}m ago`;
      const Oe = Math.round(W / 60);
      if (Oe < 24) return `${Oe}h ago`;
      const St = Math.round(Oe / 24);
      return St < 30 ? `${St}d ago` : new Date(x).toLocaleDateString();
    }
    function le() {
      u.value = !1, p.value = null, m.value = null, O.value = [], U(), c.value = "";
    }
    async function xe() {
      if (!h.value.name.trim()) {
        c.value = "Name is required.";
        return;
      }
      if (!h.value.description.trim()) {
        c.value = "A description is required — it is what agents use to find the skill.";
        return;
      }
      d.value = !0, c.value = "";
      try {
        if (p.value) {
          const { data: I } = await Ne.patch(`/api/v1/skills/${p.value.skill_id}`, {
            body: h.value.body,
            description: h.value.description,
            status: h.value.status,
            icon: h.value.icon
          });
          if (!I?.success) throw new Error(I?.error || "save failed");
          We.toast({ severity: "success", summary: "Saved", detail: `New version of ${h.value.name}` });
        } else {
          const { data: I } = await Ne.post("/api/v1/skills", {
            name: h.value.name,
            description: h.value.description,
            body: h.value.body,
            status: h.value.status,
            icon: h.value.icon
          });
          if (!I?.success) throw new Error(I?.error || "create failed");
          We.toast({ severity: "success", summary: "Created", detail: h.value.name });
        }
        le(), await a();
      } catch (I) {
        c.value = Le(I, "save failed");
      } finally {
        d.value = !1;
      }
    }
    const Q = K(!1), oe = K(null), ee = K(null);
    let ge = null;
    function Ue(I) {
      oe.value = I, Q.value = !0;
    }
    function Te() {
      Q.value = !1, oe.value = null;
    }
    async function xt() {
      const I = oe.value;
      if (!ee.value || !I) return;
      if (ee.value.innerHTML = "", !customElements.get("kickside-share"))
        try {
          await vo("kickside-share", { timeoutMs: 8e3 });
        } catch {
        }
      const x = document.createElement("kickside-share");
      x.setAttribute("config", JSON.stringify({
        resource_id: I.skill_id,
        access_url: `/api/v1/component-access/grants/${encodeURIComponent(I.skill_id)}`,
        share_url: `/api/v1/component-access/share/${encodeURIComponent(I.skill_id)}`,
        title: I.name || ""
      })), x.addEventListener("close", Te), ee.value.appendChild(x), ge = x;
    }
    Me([Q, ee], async () => {
      Q.value && ee.value ? await xt() : !Q.value && ge && (ge = null);
    });
    async function kt(I) {
      if (await We.confirm({
        message: `Delete “${I.name || "this skill"}”? This removes it and its version history. This can't be undone.`,
        header: "Delete skill",
        icon: "tabler:trash",
        acceptLabel: "Delete",
        rejectLabel: "Cancel",
        acceptClass: "p-button-danger"
      }))
        try {
          const { data: v } = await Ne.delete(`/api/v1/skills/${I.skill_id}`);
          if (!v?.success) throw new Error(v?.error || "delete failed");
          We.toast({ severity: "success", summary: "Deleted", detail: I.name || "skill" }), await a();
        } catch (v) {
          r.value = Le(v, "delete failed"), We.toast({ severity: "error", summary: "Delete failed", detail: r.value });
        }
    }
    function Vt(I) {
      return I === "script" ? "tabler:file-code" : I === "asset" ? "tabler:file-download" : "tabler:file-text";
    }
    return gr(a), (I, x) => (b(), w("div", du, [
      k("header", cu, [
        k("div", pu, [
          _(E(Y), {
            icon: "tabler:bulb",
            "aria-hidden": "true"
          })
        ]),
        x[9] || (x[9] = k("div", { class: "kx-head-text" }, [
          k("h1", { class: "kx-title" }, "Skills"),
          k("p", { class: "kx-head-sub" }, "Reusable procedures your agents discover, follow, and refine.")
        ], -1)),
        k("div", fu, [
          k("div", hu, [
            _(E(Y), {
              icon: "tabler:search",
              class: "kx-search-ico",
              "aria-hidden": "true"
            }),
            Ve(k("input", {
              "onUpdate:modelValue": x[0] || (x[0] = (v) => l.value = v),
              class: "kx-search-input",
              type: "text",
              placeholder: "Search skills…",
              "aria-label": "Search skills"
            }, null, 512), [
              [$t, l.value]
            ])
          ]),
          _(E(de), {
            type: "button",
            "data-testid": "skills-create",
            label: "New skill",
            onClick: Z
          }, {
            icon: G(({ class: v }) => [
              _(E(Y), {
                icon: "tabler:plus",
                class: J(v),
                "aria-hidden": "true"
              }, null, 8, ["class"])
            ]),
            _: 1
          })
        ])
      ]),
      r.value ? (b(), w("div", mu, z(r.value), 1)) : P("", !0),
      k("div", bu, [
        o.value && !i.value.length ? (b(), w("div", gu, [
          _(E(Y), {
            icon: "tabler:loader-2",
            class: "spin",
            "aria-hidden": "true"
          }),
          x[10] || (x[10] = ce(" Loading… ", -1))
        ])) : i.value.length ? s.value.length ? (b(), w("div", Cu, [
          (b(!0), w($e, null, Ze(s.value, (v) => (b(), w("div", {
            key: v.skill_id,
            class: "kx-card",
            tabindex: "0",
            role: "button",
            "aria-label": `Open ${v.name || "skill"}`,
            onClick: (W) => B(v),
            onKeydown: [
              Sn((W) => B(v), ["enter"]),
              Sn(Kt((W) => B(v), ["prevent"]), ["space"])
            ]
          }, [
            k("div", Iu, [
              k("span", _u, [
                _(E(Y), {
                  icon: v.icon || "tabler:bulb",
                  "aria-hidden": "true"
                }, null, 8, ["icon"])
              ]),
              k("div", Lu, [
                k("div", {
                  class: "kx-card-name",
                  title: v.name || "(untitled)"
                }, z(v.name || "(untitled)"), 9, Tu),
                k("div", Pu, [
                  v.version ? (b(), w("span", Au, "v" + z(v.version), 1)) : P("", !0),
                  v.file_count ? (b(), w("span", {
                    key: 1,
                    class: "kx-chip kx-tag-sm kx-files-badge",
                    title: `${v.file_count} bundled file${v.file_count === 1 ? "" : "s"}`
                  }, [
                    _(E(Y), {
                      icon: "tabler:paperclip",
                      "aria-hidden": "true"
                    }),
                    ce(" " + z(v.file_count), 1)
                  ], 8, Eu)) : P("", !0),
                  v.agent_id ? (b(), w("span", zu, [
                    _(E(Y), {
                      icon: "tabler:robot",
                      "aria-hidden": "true"
                    }),
                    x[14] || (x[14] = ce(" agent", -1))
                  ])) : P("", !0),
                  v.status && v.status !== "active" ? (b(), w("span", ju, z(E(Kl)(v.status)), 1)) : P("", !0)
                ])
              ]),
              k("div", {
                class: "kx-card-actions",
                onClick: x[2] || (x[2] = Kt(() => {
                }, ["stop"]))
              }, [
                _(E(de), {
                  type: "button",
                  severity: "secondary",
                  outlined: "",
                  size: "small",
                  title: "Edit / refine",
                  "aria-label": `Edit ${v.name}`,
                  onClick: (W) => B(v)
                }, {
                  icon: G(({ class: W }) => [
                    _(E(Y), {
                      icon: "tabler:pencil",
                      class: J(W),
                      "aria-hidden": "true"
                    }, null, 8, ["class"])
                  ]),
                  _: 1
                }, 8, ["aria-label", "onClick"]),
                _(E(de), {
                  type: "button",
                  severity: "secondary",
                  outlined: "",
                  size: "small",
                  title: "Share",
                  "aria-label": `Share ${v.name}`,
                  onClick: (W) => Ue(v)
                }, {
                  icon: G(({ class: W }) => [
                    _(E(Y), {
                      icon: "tabler:share",
                      class: J(W),
                      "aria-hidden": "true"
                    }, null, 8, ["class"])
                  ]),
                  _: 1
                }, 8, ["aria-label", "onClick"]),
                _(E(de), {
                  type: "button",
                  severity: "danger",
                  outlined: "",
                  size: "small",
                  title: "Delete",
                  "aria-label": `Delete ${v.name}`,
                  onClick: (W) => kt(v)
                }, {
                  icon: G(({ class: W }) => [
                    _(E(Y), {
                      icon: "tabler:trash",
                      class: J(W),
                      "aria-hidden": "true"
                    }, null, 8, ["class"])
                  ]),
                  _: 1
                }, 8, ["aria-label", "onClick"])
              ])
            ]),
            k("div", Du, z(v.description || "No description"), 1)
          ], 40, Ou))), 128))
        ])) : (b(), w("div", xu, [
          k("div", ku, [
            _(E(Y), {
              icon: "tabler:mood-empty",
              "aria-hidden": "true"
            })
          ]),
          x[13] || (x[13] = k("div", { class: "kx-empty-title" }, "No matches", -1)),
          k("div", Su, "Nothing matches “" + z(l.value) + "”. Try a different term or clear the search.", 1),
          k("div", $u, [
            _(E(de), {
              type: "button",
              severity: "secondary",
              outlined: "",
              label: "Clear search",
              onClick: x[1] || (x[1] = (v) => l.value = "")
            }, {
              icon: G(({ class: v }) => [
                _(E(Y), {
                  icon: "tabler:x",
                  class: J(v),
                  "aria-hidden": "true"
                }, null, 8, ["class"])
              ]),
              _: 1
            })
          ])
        ])) : (b(), w("div", vu, [
          k("div", yu, [
            _(E(Y), {
              icon: "tabler:bulb",
              "aria-hidden": "true"
            })
          ]),
          x[11] || (x[11] = k("div", { class: "kx-empty-title" }, "No skills yet", -1)),
          x[12] || (x[12] = k("div", { class: "kx-empty-sub" }, "Skills are reusable procedures your agents discover, follow, and refine over time. Write one, or let an agent author it from a task it just did.", -1)),
          k("div", wu, [
            _(E(de), {
              type: "button",
              "data-testid": "skills-create",
              label: "New skill",
              onClick: Z
            }, {
              icon: G(({ class: v }) => [
                _(E(Y), {
                  icon: "tabler:plus",
                  class: J(v),
                  "aria-hidden": "true"
                }, null, 8, ["class"])
              ]),
              _: 1
            })
          ])
        ]))
      ]),
      _(E(qo), {
        visible: u.value,
        "onUpdate:visible": x[8] || (x[8] = (v) => u.value = v),
        modal: "",
        class: "kx-dialog kx-modal-xl",
        pt: e,
        "aria-label": "Edit skill"
      }, {
        header: G(() => [
          k("span", Fu, [
            _(E(Y), {
              icon: h.value.icon || "tabler:bulb",
              "aria-hidden": "true"
            }, null, 8, ["icon"])
          ]),
          k("span", Mu, [
            k("span", Vu, z(p.value ? "Refine skill" : "New skill"), 1),
            k("span", Nu, z(h.value.description.trim() || "A reusable procedure your agents discover and follow."), 1)
          ]),
          p.value?.version ? (b(), w("span", Bu, "v" + z(p.value.version), 1)) : P("", !0)
        ]),
        footer: G(() => [
          _(E(de), {
            type: "button",
            label: "Cancel",
            severity: "secondary",
            outlined: "",
            disabled: d.value,
            onClick: le
          }, null, 8, ["disabled"]),
          _(E(de), {
            type: "button",
            label: p.value ? "Save new version" : "Create skill",
            loading: d.value,
            disabled: d.value || q.value,
            onClick: xe
          }, {
            icon: G(({ class: v }) => [
              _(E(Y), {
                icon: p.value ? "tabler:device-floppy" : "tabler:check",
                class: J(v),
                "aria-hidden": "true"
              }, null, 8, ["icon", "class"])
            ]),
            _: 1
          }, 8, ["label", "loading", "disabled"])
        ]),
        default: G(() => [
          k("div", Ru, [
            k("div", Hu, [
              k("div", Ku, [
                x[15] || (x[15] = k("span", { class: "kx-field-lbl" }, "Name", -1)),
                k("div", Uu, [
                  _(Gl, {
                    class: "kx-name-icon",
                    modelValue: h.value.icon,
                    "onUpdate:modelValue": x[3] || (x[3] = (v) => h.value.icon = v),
                    fallback: "tabler:bulb"
                  }, null, 8, ["modelValue"]),
                  Ve(k("input", {
                    "onUpdate:modelValue": x[4] || (x[4] = (v) => h.value.name = v),
                    class: "kx-input",
                    type: "text",
                    disabled: !!p.value,
                    placeholder: "e.g. Triage a bug report"
                  }, null, 8, Wu), [
                    [$t, h.value.name]
                  ])
                ])
              ]),
              k("label", Gu, [
                x[16] || (x[16] = k("span", { class: "kx-field-lbl" }, [
                  ce("Description "),
                  k("span", { class: "kx-field-hint-inline" }, "— what it does + when to use it (drives discovery)")
                ], -1)),
                Ve(k("textarea", {
                  "onUpdate:modelValue": x[5] || (x[5] = (v) => h.value.description = v),
                  class: "kx-input kx-textarea kx-textarea-sm",
                  rows: "3",
                  placeholder: "Summarize a long chat into action items."
                }, null, 512), [
                  [$t, h.value.description]
                ])
              ]),
              k("div", qu, [
                x[17] || (x[17] = k("span", { class: "kx-field-lbl" }, "Status", -1)),
                _(uu, {
                  modelValue: h.value.status,
                  "onUpdate:modelValue": x[6] || (x[6] = (v) => h.value.status = v),
                  options: n,
                  "aria-label": "Status"
                }, null, 8, ["modelValue"])
              ]),
              m.value ? (b(), w("div", Yu, [
                m.value.version ? (b(), w("span", Zu, "v" + z(m.value.version), 1)) : P("", !0),
                m.value.license ? (b(), w("span", Xu, "· " + z(m.value.license), 1)) : P("", !0),
                m.value.file_count ? (b(), w("span", Ju, "· " + z(m.value.file_count) + " file" + z(m.value.file_count === 1 ? "" : "s"), 1)) : P("", !0)
              ])) : P("", !0),
              f.value.length ? (b(), w("div", Qu, [
                x[18] || (x[18] = k("span", { class: "kx-field-lbl" }, [
                  ce("Bundled files "),
                  k("span", { class: "kx-field-hint-inline" }, "— loaded on demand")
                ], -1)),
                k("div", ed, [
                  (b(!0), w($e, null, Ze(f.value, (v) => (b(), w("div", {
                    key: v.path,
                    class: "kx-file"
                  }, [
                    _(E(Y), {
                      icon: Vt(v.kind),
                      "aria-hidden": "true"
                    }, null, 8, ["icon"]),
                    _(E(de), {
                      type: "button",
                      text: "",
                      class: "kx-file-path",
                      label: v.path,
                      disabled: y.value,
                      onClick: (W) => T(v)
                    }, null, 8, ["label", "disabled", "onClick"]),
                    _(E(de), {
                      type: "button",
                      text: "",
                      "aria-label": `Download ${v.path}`,
                      disabled: y.value,
                      onClick: (W) => T(v, !0)
                    }, {
                      icon: G(({ class: W }) => [
                        _(E(Y), {
                          icon: "tabler:download",
                          class: J(W),
                          "aria-hidden": "true"
                        }, null, 8, ["class"])
                      ]),
                      _: 1
                    }, 8, ["aria-label", "disabled", "onClick"]),
                    v.kind ? (b(), w("span", td, z(E(Wl)(v.kind)), 1)) : P("", !0)
                  ]))), 128))
                ]),
                g.value ? (b(), w("div", {
                  key: 0,
                  role: "region",
                  "aria-label": g.value,
                  "aria-busy": y.value
                }, [
                  y.value ? (b(), w("p", od, "Reading " + z(g.value) + "…", 1)) : P("", !0),
                  C.value ? (b(), w("p", rd, z(C.value), 1)) : P("", !0),
                  $.value ? (b(), w("pre", id, z($.value), 1)) : P("", !0)
                ], 8, nd)) : P("", !0)
              ])) : P("", !0),
              p.value && O.value.length ? (b(), w("div", ad, [
                k("span", ld, [
                  x[19] || (x[19] = ce("Version history ", -1)),
                  k("span", sd, "— " + z(O.value.length) + " version" + z(O.value.length === 1 ? "" : "s"), 1)
                ]),
                k("div", ud, [
                  (b(!0), w($e, null, Ze(O.value, (v) => (b(), w("button", {
                    key: v.version,
                    type: "button",
                    class: J(["kx-ver-row", D.value === v.version && "kx-ver-row-on"]),
                    onClick: (W) => ie(v.version)
                  }, [
                    k("span", cd, "v" + z(v.version), 1),
                    k("span", pd, z(ne(v.created_at)), 1),
                    v.file_count ? (b(), w("span", fd, [
                      _(E(Y), {
                        icon: "tabler:paperclip",
                        "aria-hidden": "true"
                      }),
                      ce(" " + z(v.file_count), 1)
                    ])) : P("", !0)
                  ], 10, dd))), 128))
                ])
              ])) : P("", !0)
            ]),
            k("div", hd, [
              k("div", md, [
                k("span", bd, [
                  x[20] || (x[20] = ce("Skill instructions ", -1)),
                  k("span", gd, "— the procedure the agent follows" + z(p.value && !q.value ? "; saving creates a new version" : ""), 1)
                ]),
                q.value ? (b(), w("div", vd, [
                  k("span", yd, [
                    _(E(Y), {
                      icon: "tabler:eye",
                      "aria-hidden": "true"
                    }),
                    ce(" Previewing v" + z(D.value) + " (read-only)", 1)
                  ]),
                  _(E(de), {
                    type: "button",
                    severity: "secondary",
                    outlined: "",
                    size: "small",
                    label: "Back to current",
                    onClick: ae
                  }, {
                    icon: G(({ class: v }) => [
                      _(E(Y), {
                        icon: "tabler:arrow-back-up",
                        class: J(v),
                        "aria-hidden": "true"
                      }, null, 8, ["class"])
                    ]),
                    _: 1
                  }),
                  _(E(de), {
                    type: "button",
                    severity: "secondary",
                    outlined: "",
                    size: "small",
                    label: "Restore this version",
                    onClick: X
                  }, {
                    icon: G(({ class: v }) => [
                      _(E(Y), {
                        icon: "tabler:history",
                        class: J(v),
                        "aria-hidden": "true"
                      }, null, 8, ["class"])
                    ]),
                    _: 1
                  })
                ])) : P("", !0)
              ]),
              q.value ? (b(), w("textarea", {
                key: 0,
                value: L.value,
                class: "kx-input kx-body-editor kx-body-preview",
                readonly: "",
                "aria-label": "Previewed skill version (read-only)"
              }, null, 8, wd)) : Ve((b(), w("textarea", {
                key: 1,
                "onUpdate:modelValue": x[7] || (x[7] = (v) => h.value.body = v),
                class: "kx-input kx-body-editor",
                "aria-label": "Skill instructions",
                placeholder: `1. …
2. …`
              }, null, 512)), [
                [$t, h.value.body]
              ])
            ])
          ]),
          c.value ? (b(), w("div", xd, z(c.value), 1)) : P("", !0)
        ]),
        _: 1
      }, 8, ["visible"]),
      Q.value ? (b(), w("div", {
        key: 1,
        ref_key: "shareHost",
        ref: ee
      }, null, 512)) : P("", !0)
    ]));
  }
}), Sd = ':root{--p-form-field-padding-x: .75rem;--p-form-field-padding-y: .5rem;--p-form-field-sm-padding-x: .625rem;--p-form-field-sm-padding-y: .375rem;--p-form-field-lg-padding-x: .875rem;--p-form-field-lg-padding-y: .625rem;--p-form-field-border-radius: .375rem;--p-form-field-transition-duration: .2s;--p-form-field-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), 0 1px 2px 0 rgba(18, 18, 23, .05);--p-focus-ring-width: 1px;--p-focus-ring-style: solid;--p-focus-ring-color: color-mix(in srgb, var(--p-primary-color) 100%, transparent);--p-focus-ring-offset: 2px;--p-toggleswitch-width: 2.5rem;--p-toggleswitch-height: 1.5rem;--p-toggleswitch-border-radius: 30px;--p-toggleswitch-gap: .25rem;--p-toggleswitch-border-width: 1px;--p-toggleswitch-transition-duration: .2s;--p-toggleswitch-slide-duration: .2s;--p-toggleswitch-handle-size: 1rem;--p-toggleswitch-handle-border-radius: 9999px}:root{color-scheme:light dark;--p-primary: rgb(0, 95, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-secondary: #6f7385;--p-secondary-50: color-mix(in srgb, var(--p-secondary) 5%, white);--p-secondary-100: color-mix(in srgb, var(--p-secondary) 10%, white);--p-secondary-200: color-mix(in srgb, var(--p-secondary) 20%, white);--p-secondary-300: color-mix(in srgb, var(--p-secondary) 35%, white);--p-secondary-400: color-mix(in srgb, var(--p-secondary) 65%, white);--p-secondary-500: var(--p-secondary);--p-secondary-600: color-mix(in srgb, var(--p-secondary) 80%, black);--p-secondary-700: color-mix(in srgb, var(--p-secondary) 65%, black);--p-secondary-800: color-mix(in srgb, var(--p-secondary) 55%, black);--p-secondary-900: color-mix(in srgb, var(--p-secondary) 50%, black);--p-secondary-950: color-mix(in srgb, var(--p-secondary) 30%, black);--p-danger: rgb(239, 68, 68);--p-danger-50: color-mix(in srgb, var(--p-danger) 5%, white);--p-danger-100: color-mix(in srgb, var(--p-danger) 10%, white);--p-danger-200: color-mix(in srgb, var(--p-danger) 20%, white);--p-danger-300: color-mix(in srgb, var(--p-danger) 30%, white);--p-danger-400: color-mix(in srgb, var(--p-danger) 40%, white);--p-danger-500: var(--p-danger);--p-danger-600: color-mix(in srgb, var(--p-danger) 80%, black);--p-danger-700: color-mix(in srgb, var(--p-danger) 70%, black);--p-danger-800: color-mix(in srgb, var(--p-danger) 60%, black);--p-danger-900: color-mix(in srgb, var(--p-danger) 50%, black);--p-danger-950: color-mix(in srgb, var(--p-danger) 40%, black);--p-success: rgb(34, 197, 94);--p-success-50: color-mix(in srgb, var(--p-success) 5%, white);--p-success-100: color-mix(in srgb, var(--p-success) 10%, white);--p-success-200: color-mix(in srgb, var(--p-success) 20%, white);--p-success-300: color-mix(in srgb, var(--p-success) 30%, white);--p-success-400: color-mix(in srgb, var(--p-success) 40%, white);--p-success-500: var(--p-success);--p-success-600: color-mix(in srgb, var(--p-success) 80%, black);--p-success-700: color-mix(in srgb, var(--p-success) 70%, black);--p-success-800: color-mix(in srgb, var(--p-success) 60%, black);--p-success-900: color-mix(in srgb, var(--p-success) 50%, black);--p-success-950: color-mix(in srgb, var(--p-success) 40%, black);--p-warn: rgb(249, 115, 22);--p-warn-50: color-mix(in srgb, var(--p-warn) 5%, white);--p-warn-100: color-mix(in srgb, var(--p-warn) 10%, white);--p-warn-200: color-mix(in srgb, var(--p-warn) 20%, white);--p-warn-300: color-mix(in srgb, var(--p-warn) 30%, white);--p-warn-400: color-mix(in srgb, var(--p-warn) 40%, white);--p-warn-500: var(--p-warn);--p-warn-600: color-mix(in srgb, var(--p-warn) 80%, black);--p-warn-700: color-mix(in srgb, var(--p-warn) 70%, black);--p-warn-800: color-mix(in srgb, var(--p-warn) 60%, black);--p-warn-900: color-mix(in srgb, var(--p-warn) 50%, black);--p-warn-950: color-mix(in srgb, var(--p-warn) 40%, black);--p-info: rgb(14, 165, 233);--p-info-50: color-mix(in srgb, var(--p-info) 5%, white);--p-info-100: color-mix(in srgb, var(--p-info) 10%, white);--p-info-200: color-mix(in srgb, var(--p-info) 20%, white);--p-info-300: color-mix(in srgb, var(--p-info) 30%, white);--p-info-400: color-mix(in srgb, var(--p-info) 40%, white);--p-info-500: var(--p-info);--p-info-600: color-mix(in srgb, var(--p-info) 80%, black);--p-info-700: color-mix(in srgb, var(--p-info) 70%, black);--p-info-800: color-mix(in srgb, var(--p-info) 60%, black);--p-info-900: color-mix(in srgb, var(--p-info) 50%, black);--p-info-950: color-mix(in srgb, var(--p-info) 40%, black);--p-help: rgb(168, 85, 247);--p-help-50: color-mix(in srgb, var(--p-help) 5%, white);--p-help-100: color-mix(in srgb, var(--p-help) 10%, white);--p-help-200: color-mix(in srgb, var(--p-help) 20%, white);--p-help-300: color-mix(in srgb, var(--p-help) 30%, white);--p-help-400: color-mix(in srgb, var(--p-help) 40%, white);--p-help-500: var(--p-help);--p-help-600: color-mix(in srgb, var(--p-help) 80%, black);--p-help-700: color-mix(in srgb, var(--p-help) 70%, black);--p-help-800: color-mix(in srgb, var(--p-help) 60%, black);--p-help-900: color-mix(in srgb, var(--p-help) 50%, black);--p-help-950: color-mix(in srgb, var(--p-help) 40%, black);--p-accent: rgb(20, 184, 166);--p-accent-50: color-mix(in srgb, var(--p-accent) 5%, white);--p-accent-100: color-mix(in srgb, var(--p-accent) 10%, white);--p-accent-200: color-mix(in srgb, var(--p-accent) 20%, white);--p-accent-300: color-mix(in srgb, var(--p-accent) 30%, white);--p-accent-400: color-mix(in srgb, var(--p-accent) 40%, white);--p-accent-500: var(--p-accent);--p-accent-600: color-mix(in srgb, var(--p-accent) 80%, black);--p-accent-700: color-mix(in srgb, var(--p-accent) 70%, black);--p-accent-800: color-mix(in srgb, var(--p-accent) 60%, black);--p-accent-900: color-mix(in srgb, var(--p-accent) 50%, black);--p-accent-950: color-mix(in srgb, var(--p-accent) 40%, black);--p-surface-0: #ffffff;--p-surface-50: #fafafa;--p-surface-100: #f5f5f5;--p-surface-200: #e5e5e5;--p-surface-300: #d4d4d4;--p-surface-400: #a3a3a3;--p-surface-500: #737373;--p-surface-600: #525252;--p-surface-700: #404040;--p-surface-800: #262626;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #171717;--p-surface-950: #0a0a0a;--p-content-border-radius: 6px;--p-font-heading-family: var(--v-font-family-head, Arial);--p-font-heading-scale: 1;--p-font-heading-line-height: 1.5;--p-font-heading-letter-spacing: normal;--p-font-heading-stretch: normal;--p-font-heading-variation-settings: normal;--p-font-body-scale: 1;--p-font-body-line-height: 1.5;--p-font-body-letter-spacing: normal;--p-font-body-stretch: normal;--p-font-body-variation-settings: normal;--p-font-mono-family: ui-monospace}:root{--p-primary-color: var(--p-primary-500);--p-primary-contrast-color: var(--p-surface-0);--p-primary-hover-color: var(--p-primary-600);--p-primary-active-color: var(--p-primary-700);--p-secondary-color: var(--p-secondary-500);--p-secondary-contrast-color: var(--p-surface-0);--p-secondary-hover-color: var(--p-secondary-600);--p-secondary-active-color: var(--p-secondary-700);--p-danger-color: var(--p-danger-500);--p-danger-contrast-color: var(--p-surface-0);--p-danger-hover-color: var(--p-danger-600);--p-danger-active-color: var(--p-danger-700);--p-success-color: var(--p-success-500);--p-success-contrast-color: var(--p-surface-0);--p-success-hover-color: var(--p-success-600);--p-success-active-color: var(--p-success-700);--p-warn-color: var(--p-warn-500);--p-warn-contrast-color: var(--p-surface-0);--p-warn-hover-color: var(--p-warn-600);--p-warn-active-color: var(--p-warn-700);--p-info-color: var(--p-info-500);--p-info-contrast-color: var(--p-surface-0);--p-info-hover-color: var(--p-info-600);--p-info-active-color: var(--p-info-700);--p-help-color: var(--p-help-500);--p-help-contrast-color: var(--p-surface-0);--p-help-hover-color: var(--p-help-600);--p-help-active-color: var(--p-help-700);--p-accent-color: var(--p-accent-500);--p-accent-contrast-color: var(--p-surface-0);--p-accent-hover-color: var(--p-accent-600);--p-accent-active-color: var(--p-accent-700);--p-content-border-color: var(--p-surface-200);--p-content-hover-background: var(--p-surface-100);--p-content-hover-color: var(--p-surface-800);--p-highlight-background: var(--p-primary-50);--p-highlight-color: var(--p-primary-700);--p-highlight-focus-background: var(--p-primary-100);--p-highlight-focus-color: var(--p-primary-800);--p-content-background: var(--p-surface-0);--p-text-color: var(--p-surface-700);--p-text-hover-color: var(--p-surface-800);--p-text-muted-color: var(--p-surface-500);--p-text-hover-muted-color: var(--p-surface-600)}@media(prefers-color-scheme:dark){:root:not(.w-theme-light){--p-surface-D: #fff;--p-surface-0: #fff;--p-surface-50: #fafafa;--p-surface-100: #f4f4f5;--p-surface-200: #e4e4e7;--p-surface-300: #d4d4d8;--p-surface-400: #a1a1aa;--p-surface-500: #71717a;--p-surface-600: #545250;--p-surface-700: #403e3c;--p-surface-800: #2b2927;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #1c1a19;--p-surface-950: #0f0e0d;--p-primary: rgb(0, 125, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-primary-color: var(--p-primary-400);--p-primary-contrast-color: var(--p-surface-900);--p-primary-hover-color: var(--p-primary-300);--p-primary-active-color: var(--p-primary-200);--p-secondary-color: var(--p-secondary-400);--p-secondary-contrast-color: var(--p-surface-900);--p-secondary-hover-color: var(--p-secondary-300);--p-secondary-active-color: var(--p-secondary-200);--p-danger-color: var(--p-danger-400);--p-danger-contrast-color: var(--p-surface-900);--p-danger-hover-color: var(--p-danger-300);--p-danger-active-color: var(--p-danger-200);--p-success-color: var(--p-success-400);--p-success-contrast-color: var(--p-surface-900);--p-success-hover-color: var(--p-success-300);--p-success-active-color: var(--p-success-200);--p-warn-color: var(--p-warn-400);--p-warn-contrast-color: var(--p-surface-900);--p-warn-hover-color: var(--p-warn-300);--p-warn-active-color: var(--p-warn-200);--p-info-color: var(--p-info-400);--p-info-contrast-color: var(--p-surface-900);--p-info-hover-color: var(--p-info-300);--p-info-active-color: var(--p-info-200);--p-help-color: var(--p-help-400);--p-help-contrast-color: var(--p-surface-900);--p-help-hover-color: var(--p-help-300);--p-help-active-color: var(--p-help-200);--p-accent-color: var(--p-accent-400);--p-accent-contrast-color: var(--p-surface-900);--p-accent-hover-color: var(--p-accent-300);--p-accent-active-color: var(--p-accent-200);--p-content-border-color: var(--p-surface-700);--p-content-hover-background: var(--p-surface-800);--p-content-hover-color: var(--p-surface-0);--p-highlight-background: color-mix(in srgb, var(--p-primary-400), transparent 84%);--p-highlight-color: rgba(255, 255, 255, 87%);--p-highlight-focus-background: color-mix(in srgb, var(--p-primary-400), transparent 76%);--p-highlight-focus-color: rgba(255, 255, 255, 87%);--p-content-background: var(--p-surface-900);--p-text-color: var(--p-surface-0);--p-text-hover-color: var(--p-surface-0);--p-text-muted-color: var(--p-surface-400);--p-text-hover-muted-color: var(--p-surface-300)}}:root.w-theme-dark,.w-theme-dark{color-scheme:dark;--p-surface-D: #fff;--p-surface-0: #fff;--p-surface-50: #fafafa;--p-surface-100: #f4f4f5;--p-surface-200: #e4e4e7;--p-surface-300: #d4d4d8;--p-surface-400: #a1a1aa;--p-surface-500: #71717a;--p-surface-600: #545250;--p-surface-700: #403e3c;--p-surface-800: #2b2927;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #1c1a19;--p-surface-950: #0f0e0d;--p-primary: rgb(0, 125, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-primary-color: var(--p-primary-400);--p-primary-contrast-color: var(--p-surface-900);--p-primary-hover-color: var(--p-primary-300);--p-primary-active-color: var(--p-primary-200);--p-secondary-color: var(--p-secondary-400);--p-secondary-contrast-color: var(--p-surface-900);--p-secondary-hover-color: var(--p-secondary-300);--p-secondary-active-color: var(--p-secondary-200);--p-danger-color: var(--p-danger-400);--p-danger-contrast-color: var(--p-surface-900);--p-danger-hover-color: var(--p-danger-300);--p-danger-active-color: var(--p-danger-200);--p-success-color: var(--p-success-400);--p-success-contrast-color: var(--p-surface-900);--p-success-hover-color: var(--p-success-300);--p-success-active-color: var(--p-success-200);--p-warn-color: var(--p-warn-400);--p-warn-contrast-color: var(--p-surface-900);--p-warn-hover-color: var(--p-warn-300);--p-warn-active-color: var(--p-warn-200);--p-info-color: var(--p-info-400);--p-info-contrast-color: var(--p-surface-900);--p-info-hover-color: var(--p-info-300);--p-info-active-color: var(--p-info-200);--p-help-color: var(--p-help-400);--p-help-contrast-color: var(--p-surface-900);--p-help-hover-color: var(--p-help-300);--p-help-active-color: var(--p-help-200);--p-accent-color: var(--p-accent-400);--p-accent-contrast-color: var(--p-surface-900);--p-accent-hover-color: var(--p-accent-300);--p-accent-active-color: var(--p-accent-200);--p-content-border-color: var(--p-surface-700);--p-content-hover-background: var(--p-surface-800);--p-content-hover-color: var(--p-surface-0);--p-highlight-background: color-mix(in srgb, var(--p-primary-400), transparent 84%);--p-highlight-color: rgba(255, 255, 255, 87%);--p-highlight-focus-background: color-mix(in srgb, var(--p-primary-400), transparent 76%);--p-highlight-focus-color: rgba(255, 255, 255, 87%);--p-content-background: var(--p-surface-900);--p-text-color: var(--p-surface-0);--p-text-hover-color: var(--p-surface-0);--p-text-muted-color: var(--p-surface-400);--p-text-hover-muted-color: var(--p-surface-300)}:root.w-theme-light,.w-theme-light{color-scheme:light;--p-surface-0: #ffffff;--p-surface-50: #fafafa;--p-surface-100: #f5f5f5;--p-surface-200: #e5e5e5;--p-surface-300: #d4d4d4;--p-surface-400: #a3a3a3;--p-surface-500: #737373;--p-surface-600: #525252;--p-surface-700: #404040;--p-surface-800: #262626;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #171717;--p-surface-950: #0a0a0a;--p-primary: rgb(0, 95, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-primary-color: var(--p-primary-500);--p-primary-contrast-color: var(--p-surface-0);--p-primary-hover-color: var(--p-primary-600);--p-primary-active-color: var(--p-primary-700);--p-secondary-color: var(--p-secondary-500);--p-secondary-contrast-color: var(--p-surface-0);--p-secondary-hover-color: var(--p-secondary-600);--p-secondary-active-color: var(--p-secondary-700);--p-danger-color: var(--p-danger-500);--p-danger-contrast-color: var(--p-surface-0);--p-danger-hover-color: var(--p-danger-600);--p-danger-active-color: var(--p-danger-700);--p-success-color: var(--p-success-500);--p-success-contrast-color: var(--p-surface-0);--p-success-hover-color: var(--p-success-600);--p-success-active-color: var(--p-success-700);--p-warn-color: var(--p-warn-500);--p-warn-contrast-color: var(--p-surface-0);--p-warn-hover-color: var(--p-warn-600);--p-warn-active-color: var(--p-warn-700);--p-info-color: var(--p-info-500);--p-info-contrast-color: var(--p-surface-0);--p-info-hover-color: var(--p-info-600);--p-info-active-color: var(--p-info-700);--p-help-color: var(--p-help-500);--p-help-contrast-color: var(--p-surface-0);--p-help-hover-color: var(--p-help-600);--p-help-active-color: var(--p-help-700);--p-accent-color: var(--p-accent-500);--p-accent-contrast-color: var(--p-surface-0);--p-accent-hover-color: var(--p-accent-600);--p-accent-active-color: var(--p-accent-700);--p-content-border-color: var(--p-surface-200);--p-content-hover-background: var(--p-surface-100);--p-content-hover-color: var(--p-surface-800);--p-highlight-background: var(--p-primary-50);--p-highlight-color: var(--p-primary-700);--p-highlight-focus-background: var(--p-primary-100);--p-highlight-focus-color: var(--p-primary-800);--p-content-background: var(--p-surface-0);--p-text-color: var(--p-surface-700);--p-text-hover-color: var(--p-surface-800);--p-text-muted-color: var(--p-surface-500);--p-text-hover-muted-color: var(--p-surface-600)}.spin{animation:kx-spin 1s linear infinite}@keyframes kx-spin{to{transform:rotate(360deg)}}@media(prefers-reduced-motion:reduce){.spin{animation:none}}.kx-card{position:relative;display:flex;flex-direction:column;gap:9px;padding:13px;cursor:pointer;border:1px solid var(--p-content-border-color);border-radius:14px;background:var(--p-content-background);transition:border-color .15s,box-shadow .15s,transform .15s}.kx-card:hover{border-color:color-mix(in srgb,var(--p-primary-color) 40%,var(--p-content-border-color));box-shadow:0 6px 20px color-mix(in srgb,var(--p-text-color) 8%,transparent);transform:translateY(-1px)}.kx-card-head{display:flex;align-items:center;gap:10px;min-width:0}.kx-card-id{display:flex;flex-direction:column;gap:3px;min-width:0;flex:1}.kx-card-name{font-size:14px;font-weight:700;letter-spacing:-.01em;color:var(--p-text-color);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.kx-card-meta{display:flex;gap:6px}.kx-card-desc{font-size:12px;color:var(--p-text-muted-color);line-height:1.4;display:-webkit-box;-webkit-line-clamp:2;line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;min-height:17px}.kx-card-actions{position:absolute;top:9px;right:9px;display:flex;gap:3px;opacity:0;transition:opacity .12s;background:var(--p-content-background);border-radius:8px}.kx-card:hover .kx-card-actions,.kx-card:focus-within .kx-card-actions{opacity:1}.kx-card .p-button:not(:disabled):hover{transform:none}.kx-card:focus-visible{border-color:var(--p-focus-ring-color);outline:none;box-shadow:var(--p-focus-ring-shadow)}.kx-head{display:flex;align-items:center;gap:12px;padding:20px 24px 14px;flex-wrap:wrap}.kx-head-icon{width:40px;height:40px;border-radius:11px;flex:none;display:flex;align-items:center;justify-content:center;background:color-mix(in srgb,var(--p-primary-color) 14%,transparent);color:var(--p-primary-color)}.kx-head-icon svg{width:22px;height:22px}.kx-head-text{min-width:0}.kx-title{font-size:17px;font-weight:700;color:var(--p-text-color);margin:0}.kx-head-sub{font-size:13px;color:var(--p-text-muted-color);margin:2px 0 0}.kx-head-actions{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-left:auto}.kx-modal-head-icon{width:38px;height:38px;border-radius:11px;flex:none;display:flex;align-items:center;justify-content:center;background:color-mix(in srgb,var(--p-primary-color) 14%,transparent);color:var(--p-primary-color)}.kx-modal-head-icon svg{width:20px;height:20px}.kx-modal-head-text{display:flex;flex-direction:column;gap:2px;min-width:0;flex:1}.kx-modal-head-title{font-size:15.5px;font-weight:700;color:var(--p-text-color);line-height:1.2}.kx-modal-head-sub{font-size:12.5px;font-weight:400;color:var(--p-text-muted-color);line-height:1.3;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.kx-empty{text-align:center;padding:44px 24px;display:flex;flex-direction:column;align-items:center;gap:8px}.kx-empty-ico{width:56px;height:56px;border-radius:14px;display:flex;align-items:center;justify-content:center;background:color-mix(in srgb,var(--p-primary-color) 12%,transparent);color:var(--p-primary-color);margin-bottom:4px}.kx-empty-ico svg{width:28px;height:28px}.kx-empty-title{font-size:15px;font-weight:700;color:var(--p-text-color);margin:0}.kx-empty-sub{font-size:13px;color:var(--p-text-muted-color);max-width:380px;margin:0}.kx-empty>.p-button{margin-top:6px}.kx-empty-actions{display:flex;gap:8px;margin-top:6px}.kx-loading{display:flex;align-items:center;gap:8px;color:var(--p-text-muted-color);font-size:13px;padding:24px}.kx-err{margin:0 20px 8px;padding:9px 12px;border-radius:10px;font-size:13px;background:color-mix(in srgb,var(--p-danger-500) 12%,transparent);color:var(--p-danger-600, var(--p-danger-500))}.kx-err.inline{margin:12px 0 0}.kx-tag-sm,.kx-tag-sm.kx-tag-sm{display:inline-flex;align-items:center;gap:4px;padding:1px 7px;border-radius:var(--kx-radius-tag, 6px);font-size:10.5px;font-weight:600;line-height:1.5;white-space:nowrap}.kx-tag-sm svg,.kx-tag-sm.kx-tag-sm svg{width:12px;height:12px}.kx-tag-caps,.kx-tag-caps.kx-tag-caps{display:inline-flex;align-items:center;gap:3px;padding:2px 6px;border-radius:var(--kx-radius-tag, 6px);font-size:9px;font-weight:700;line-height:1.5;letter-spacing:.04em;text-transform:uppercase;white-space:nowrap}.kx-tag-caps svg,.kx-tag-caps.kx-tag-caps svg{width:11px;height:11px}*,:before,:after{--tw-border-spacing-x: 0;--tw-border-spacing-y: 0;--tw-translate-x: 0;--tw-translate-y: 0;--tw-rotate: 0;--tw-skew-x: 0;--tw-skew-y: 0;--tw-scale-x: 1;--tw-scale-y: 1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness: proximity;--tw-gradient-from-position: ;--tw-gradient-via-position: ;--tw-gradient-to-position: ;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width: 0px;--tw-ring-offset-color: #fff;--tw-ring-color: rgb(59 130 246 / .5);--tw-ring-offset-shadow: 0 0 #0000;--tw-ring-shadow: 0 0 #0000;--tw-shadow: 0 0 #0000;--tw-shadow-colored: 0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: ;--tw-contain-size: ;--tw-contain-layout: ;--tw-contain-paint: ;--tw-contain-style: }::backdrop{--tw-border-spacing-x: 0;--tw-border-spacing-y: 0;--tw-translate-x: 0;--tw-translate-y: 0;--tw-rotate: 0;--tw-skew-x: 0;--tw-skew-y: 0;--tw-scale-x: 1;--tw-scale-y: 1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness: proximity;--tw-gradient-from-position: ;--tw-gradient-via-position: ;--tw-gradient-to-position: ;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width: 0px;--tw-ring-offset-color: #fff;--tw-ring-color: rgb(59 130 246 / .5);--tw-ring-offset-shadow: 0 0 #0000;--tw-ring-shadow: 0 0 #0000;--tw-shadow: 0 0 #0000;--tw-shadow-colored: 0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: ;--tw-contain-size: ;--tw-contain-layout: ;--tw-contain-paint: ;--tw-contain-style: }*,:before,:after{box-sizing:border-box;border-width:0;border-style:solid;border-color:#e5e7eb}:before,:after{--tw-content: ""}html,:host{line-height:1.5;-webkit-text-size-adjust:100%;-moz-tab-size:4;tab-size:4;font-family:ui-sans-serif,system-ui,sans-serif,"Apple Color Emoji","Segoe UI Emoji",Segoe UI Symbol,"Noto Color Emoji";font-feature-settings:normal;font-variation-settings:normal;-webkit-tap-highlight-color:transparent}body{margin:0;line-height:inherit}hr{height:0;color:inherit;border-top-width:1px}abbr:where([title]){text-decoration:underline dotted}h1,h2,h3,h4,h5,h6{font-size:inherit;font-weight:inherit}a{color:inherit;text-decoration:inherit}b,strong{font-weight:bolder}code,kbd,samp,pre{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace;font-feature-settings:normal;font-variation-settings:normal;font-size:1em}small{font-size:80%}sub,sup{font-size:75%;line-height:0;position:relative;vertical-align:baseline}sub{bottom:-.25em}sup{top:-.5em}table{text-indent:0;border-color:inherit;border-collapse:collapse}button,input,optgroup,select,textarea{font-family:inherit;font-feature-settings:inherit;font-variation-settings:inherit;font-size:100%;font-weight:inherit;line-height:inherit;letter-spacing:inherit;color:inherit;margin:0;padding:0}button,select{text-transform:none}button,input:where([type=button]),input:where([type=reset]),input:where([type=submit]){-webkit-appearance:button;background-color:transparent;background-image:none}:-moz-focusring{outline:auto}:-moz-ui-invalid{box-shadow:none}progress{vertical-align:baseline}::-webkit-inner-spin-button,::-webkit-outer-spin-button{height:auto}[type=search]{-webkit-appearance:textfield;outline-offset:-2px}::-webkit-search-decoration{-webkit-appearance:none}::-webkit-file-upload-button{-webkit-appearance:button;font:inherit}summary{display:list-item}blockquote,dl,dd,h1,h2,h3,h4,h5,h6,hr,figure,p,pre{margin:0}fieldset{margin:0;padding:0}legend{padding:0}ol,ul,menu{list-style:none;margin:0;padding:0}dialog{padding:0}textarea{resize:vertical}input::placeholder,textarea::placeholder{opacity:1;color:#9ca3af}button,[role=button]{cursor:pointer}:disabled{cursor:default}img,svg,video,canvas,audio,iframe,embed,object{display:block;vertical-align:middle}img,video{max-width:100%;height:auto}[hidden]:where(:not([hidden=until-found])){display:none}@supports (-moz-appearance:none){*{scrollbar-color:initial;scrollbar-width:initial}}:host{display:block;height:100%;min-height:0}:host>div{height:100%;min-height:0}*,*:before,*:after{box-sizing:border-box}.kx{font-family:inherit;color:var(--p-text-color);background:var(--p-content-background);height:100%;display:flex;flex-direction:column;overflow-y:auto;overflow-x:hidden}.kx-search{position:relative;display:flex;align-items:center}.kx-search-ico{position:absolute;left:10px;width:15px;height:15px;color:var(--p-text-muted-color);pointer-events:none}.kx-search-input{height:34px;width:220px;max-width:40vw;padding:0 10px 0 30px;font:inherit;font-size:13px;color:var(--p-text-color);background:var(--p-content-background);border:1px solid var(--p-content-border-color);border-radius:8px;transition:border-color .15s}.kx-search-input::placeholder{color:var(--p-text-muted-color)}.kx-body{flex:1;min-height:0;padding:6px 20px 20px;display:flex;flex-direction:column;gap:14px}.kx-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,264px),1fr));gap:12px;max-width:1180px}.kx-ficon{width:38px;height:38px;border-radius:11px;flex:none;display:flex;align-items:center;justify-content:center;background:color-mix(in srgb,var(--p-primary-color) 14%,transparent);color:var(--p-primary-color)}.kx-ficon svg{width:20px;height:20px}.kx-card-name{padding-right:64px}.kx-chip{flex:none}.kx-ver{color:var(--p-text-muted-color);background:color-mix(in srgb,var(--p-text-color) 8%,transparent)}.kx-files-badge{color:var(--p-text-muted-color);background:color-mix(in srgb,var(--p-text-color) 7%,transparent)}.kx-scope{text-transform:uppercase;color:var(--p-primary-color);background:color-mix(in srgb,var(--p-primary-color) 12%,transparent)}.kx-status{text-transform:uppercase;color:var(--p-warn-600, var(--p-warn-500));background:color-mix(in srgb,var(--p-warn-500) 14%,transparent)}.kx-dialog{--p-dialog-content-padding: 0;width:min(460px,calc(100vw - 32px))}.kx-dialog.kx-modal-xl{width:min(1040px,94vw);height:min(720px,90vh)}.kx-dialog>.kx-dialog-header{display:flex;align-items:center;gap:12px;padding:16px 20px}.kx-dialog>.kx-dialog-content{padding:0;overflow:hidden;display:flex;flex-direction:column;min-height:0;flex:1}.kx-dialog>.kx-dialog-footer{display:flex;justify-content:flex-end;gap:8px;padding:14px 18px;border-top:1px solid var(--p-content-border-color)}.kx-modal-head-sub{white-space:normal;overflow-wrap:anywhere;display:-webkit-box;-webkit-line-clamp:2;line-clamp:2;-webkit-box-orient:vertical}.kx-form{display:flex;flex-direction:column;gap:14px}.kx-field{display:flex;flex-direction:column;gap:5px}.kx-name-row{display:flex;align-items:center;gap:8px}.kx-name-row .kx-input{flex:1;min-width:0}.kx-name-icon{flex:none}.kx-field-lbl{font-size:12.5px;font-weight:600;color:var(--p-text-color)}.kx-field-hint-inline{font-weight:400;color:var(--p-text-muted-color)}.kx-input{height:36px;padding:0 10px;font:inherit;font-size:13px;color:var(--p-text-color);background:var(--p-content-background);border:1px solid var(--p-content-border-color);border-radius:8px;transition:border-color .15s;width:100%}.kx-input::placeholder{color:var(--p-text-muted-color)}.kx-input:disabled{opacity:.6;cursor:default}.kx-select{width:100%;min-width:0}.kx-textarea{height:auto;min-height:160px;padding:10px;resize:vertical;line-height:1.55;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:12.5px;tab-size:2}.kx-textarea-sm{min-height:64px;font-family:inherit;font-size:13px}.kx-edit-cols{flex:1;min-height:0;display:flex}.kx-edit-left{width:312px;flex:none;padding:18px;overflow-y:auto;border-right:1px solid var(--p-content-border-color);display:flex;flex-direction:column;gap:14px}.kx-edit-right{flex:1;min-width:0;padding:18px;display:flex;flex-direction:column;gap:8px}.kx-edit-right-head{display:flex;flex-direction:column;gap:8px}.kx-body-editor{flex:1;min-height:0;height:auto;padding:12px;resize:none;line-height:1.6;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:13px;tab-size:2}.kx-body-preview{background:color-mix(in srgb,var(--p-text-color) 4%,var(--p-content-background));cursor:default}.kx-edit-err{margin:0 18px}.kx-meta-line{display:flex;flex-wrap:wrap;gap:5px;font-size:12px;color:var(--p-text-muted-color)}.kx-preview-bar{display:flex;align-items:center;gap:8px;flex-wrap:wrap}.kx-preview-tag{display:inline-flex;align-items:center;gap:5px;font-size:12px;font-weight:600;color:var(--p-primary-color);background:color-mix(in srgb,var(--p-primary-color) 12%,transparent);padding:3px 9px;border-radius:6px}.kx-preview-tag svg{width:14px;height:14px}.kx-vers{display:flex;flex-direction:column;border:1px solid var(--p-content-border-color);border-radius:10px;overflow:hidden}.kx-ver-row{display:flex;align-items:center;gap:8px;padding:8px 10px;width:100%;text-align:left;border:none;border-bottom:1px solid var(--p-content-border-color);background:transparent;font:inherit;cursor:pointer;color:var(--p-text-color);transition:background .12s}.kx-ver-row:last-child{border-bottom:none}.kx-ver-row:hover{background:color-mix(in srgb,var(--p-text-color) 7%,transparent)}.kx-ver-row-on{background:color-mix(in srgb,var(--p-primary-color) 12%,transparent)}.kx-ver-when{font-size:12px;color:var(--p-text-muted-color)}.kx-ver-files{margin-left:auto;display:inline-flex;align-items:center;gap:3px;font-size:11.5px;color:var(--p-text-muted-color)}.kx-ver-files svg{width:12px;height:12px}@media(max-width:720px){.kx-edit-cols{flex-direction:column}.kx-edit-left{width:100%;border-right:none;border-bottom:1px solid var(--p-content-border-color)}}@media(max-width:640px){.kx-head{padding:16px 16px 12px}.kx-body{padding:6px 16px 16px}.kx-head-actions{margin-left:0;width:100%}.kx-search{flex:1}.kx-card-name{padding-right:32px}}@media(max-width:560px){.kx-search-input{width:100%;max-width:none}}.kx-files{display:flex;flex-direction:column;border:1px solid var(--p-content-border-color);border-radius:10px;overflow:hidden}.kx-file{display:flex;align-items:center;gap:9px;padding:9px 12px;border-bottom:1px solid var(--p-content-border-color);font-size:12.5px;color:var(--p-text-color)}.kx-file:last-child{border-bottom:none}.kx-file svg{width:16px;height:16px;color:var(--p-primary-color);flex-shrink:0}.kx-file-path{font-family:ui-monospace,Menlo,monospace;font-size:12px;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.kx-file-kind{margin-left:auto;font-size:9px;font-weight:600;color:var(--p-text-muted-color);background:color-mix(in srgb,var(--p-text-color) 8%,transparent);padding:2px 6px;border-radius:6px;flex-shrink:0}.wc-iconfield{display:inline-block}@media(prefers-reduced-motion:reduce){.kx-dialog{transition:none}}', $d = { props: { type: "object", properties: {} } }, Cd = {
  wippy: $d
};
class Od extends vr {
  static get wippyConfig() {
    return {
      propsSchema: Cd.wippy.props,
      hostCssKeys: ["themeConfigUrl", "primeVueCssUrl"],
      inlineCss: Sd
    };
  }
  static get vueConfig() {
    return { rootComponent: kd, plugins: [Ta] };
  }
}
Ir(import.meta.url, Od);
//# sourceMappingURL=index.js.map

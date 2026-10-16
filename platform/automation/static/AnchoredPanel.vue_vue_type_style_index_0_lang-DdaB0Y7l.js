import { ref as ke, readonly as Ci, getCurrentInstance as Dt, onMounted as Ii, nextTick as In, watch as Ce, reactive as Ti, renderSlot as M, openBlock as I, createBlock as pe, Teleport as Tn, createCommentVNode as Q, useId as ki, mergeProps as w, h as Li, createElementBlock as P, createElementVNode as B, resolveComponent as ne, Fragment as Le, renderList as ft, createVNode as he, resolveDirective as _i, createTextVNode as lt, toDisplayString as ue, normalizeClass as Ze, resolveDynamicComponent as Rt, withCtx as Oe, Transition as xi, normalizeProps as Pi, createSlots as Ai, withDirectives as Ei, withModifiers as ji, defineComponent as Mi, onBeforeUnmount as Vi, normalizeStyle as Fi } from "vue";
var zi = Object.defineProperty, Bt = Object.getOwnPropertySymbols, Ni = Object.prototype.hasOwnProperty, Di = Object.prototype.propertyIsEnumerable, Ht = (t, e, n) => e in t ? zi(t, e, { enumerable: !0, configurable: !0, writable: !0, value: n }) : t[e] = n, Ri = (t, e) => {
  for (var n in e || (e = {})) Ni.call(e, n) && Ht(t, n, e[n]);
  if (Bt) for (var n of Bt(e)) Di.call(e, n) && Ht(t, n, e[n]);
  return t;
};
function Ge(t) {
  return t == null || t === "" || Array.isArray(t) && t.length === 0 || !(t instanceof Date) && typeof t == "object" && Object.keys(t).length === 0;
}
function pt(t, e, n = /* @__PURE__ */ new WeakSet()) {
  if (t === e) return !0;
  if (!t || !e || typeof t != "object" || typeof e != "object" || n.has(t) || n.has(e)) return !1;
  n.add(t).add(e);
  let i = Array.isArray(t), r = Array.isArray(e), o, s, l;
  if (i && r) {
    if (s = t.length, s != e.length) return !1;
    for (o = s; o-- !== 0; ) if (!pt(t[o], e[o], n)) return !1;
    return !0;
  }
  if (i != r) return !1;
  let a = t instanceof Date, u = e instanceof Date;
  if (a != u) return !1;
  if (a && u) return t.getTime() == e.getTime();
  let d = t instanceof RegExp, c = e instanceof RegExp;
  if (d != c) return !1;
  if (d && c) return t.toString() == e.toString();
  let f = Object.keys(t);
  if (s = f.length, s !== Object.keys(e).length) return !1;
  for (o = s; o-- !== 0; ) if (!Object.prototype.hasOwnProperty.call(e, f[o])) return !1;
  for (o = s; o-- !== 0; ) if (l = f[o], !pt(t[l], e[l], n)) return !1;
  return !0;
}
function Bi(t, e) {
  return pt(t, e);
}
function at(t) {
  return typeof t == "function" && "call" in t && "apply" in t;
}
function x(t) {
  return !Ge(t);
}
function se(t, e) {
  if (!t || !e) return null;
  try {
    let n = t[e];
    if (x(n)) return n;
  } catch {
  }
  if (Object.keys(t).length) {
    if (at(e)) return e(t);
    if (e.indexOf(".") === -1) return t[e];
    {
      let n = e.split("."), i = t;
      for (let r = 0, o = n.length; r < o; ++r) {
        if (i == null) return null;
        i = i[n[r]];
      }
      return i;
    }
  }
  return null;
}
function kn(t, e, n) {
  return n ? se(t, n) === se(e, n) : Bi(t, e);
}
function re(t, e = !0) {
  return t instanceof Object && t.constructor === Object && (e || Object.keys(t).length !== 0);
}
function Ln(t = {}, e = {}) {
  let n = Ri({}, t);
  return Object.keys(e).forEach((i) => {
    let r = i;
    re(e[r]) && r in t && re(t[r]) ? n[r] = Ln(t[r], e[r]) : n[r] = e[r];
  }), n;
}
function Hi(...t) {
  return t.reduce((e, n, i) => i === 0 ? n : Ln(e, n), {});
}
function Kt(t, e) {
  let n = -1;
  if (x(t)) try {
    n = t.findLastIndex(e);
  } catch {
    n = t.lastIndexOf([...t].reverse().find(e));
  }
  return n;
}
function G(t, ...e) {
  return at(t) ? t(...e) : t;
}
function K(t, e = !0) {
  return typeof t == "string" && (e || t !== "");
}
function ie(t) {
  return K(t) ? t.replace(/(-|_)/g, "").toLowerCase() : t;
}
function Pt(t, e = "", n = {}) {
  let i = ie(e).split("."), r = i.shift();
  if (r) {
    if (re(t)) {
      let o = Object.keys(t).find((s) => ie(s) === r) || "";
      return Pt(G(t[o], n), i.join("."), n);
    }
    return;
  }
  return G(t, n);
}
function _n(t, e = !0) {
  return Array.isArray(t) && (e || t.length !== 0);
}
function Ki(t) {
  return x(t) && !isNaN(t);
}
function Wi(t = "") {
  return x(t) && t.length === 1 && !!t.match(/\S| /);
}
function ye(t, e) {
  if (e) {
    let n = e.test(t);
    return e.lastIndex = 0, n;
  }
  return !1;
}
function Ui(...t) {
  return Hi(...t);
}
function Ee(t) {
  return t && t.replace(/\/\*(?:(?!\*\/)[\s\S])*\*\/|[\r\n\t]+/g, "").replace(/ {2,}/g, " ").replace(/ ([{:}]) /g, "$1").replace(/([;,]) /g, "$1").replace(/ !/g, "!").replace(/: /g, ":").trim();
}
function Z(t) {
  if (t && /[\xC0-\xFF\u0100-\u017E]/.test(t)) {
    let e = { A: /[\xC0-\xC5\u0100\u0102\u0104]/g, AE: /[\xC6]/g, C: /[\xC7\u0106\u0108\u010A\u010C]/g, D: /[\xD0\u010E\u0110]/g, E: /[\xC8-\xCB\u0112\u0114\u0116\u0118\u011A]/g, G: /[\u011C\u011E\u0120\u0122]/g, H: /[\u0124\u0126]/g, I: /[\xCC-\xCF\u0128\u012A\u012C\u012E\u0130]/g, IJ: /[\u0132]/g, J: /[\u0134]/g, K: /[\u0136]/g, L: /[\u0139\u013B\u013D\u013F\u0141]/g, N: /[\xD1\u0143\u0145\u0147\u014A]/g, O: /[\xD2-\xD6\xD8\u014C\u014E\u0150]/g, OE: /[\u0152]/g, R: /[\u0154\u0156\u0158]/g, S: /[\u015A\u015C\u015E\u0160]/g, T: /[\u0162\u0164\u0166]/g, U: /[\xD9-\xDC\u0168\u016A\u016C\u016E\u0170\u0172]/g, W: /[\u0174]/g, Y: /[\xDD\u0176\u0178]/g, Z: /[\u0179\u017B\u017D]/g, a: /[\xE0-\xE5\u0101\u0103\u0105]/g, ae: /[\xE6]/g, c: /[\xE7\u0107\u0109\u010B\u010D]/g, d: /[\u010F\u0111]/g, e: /[\xE8-\xEB\u0113\u0115\u0117\u0119\u011B]/g, g: /[\u011D\u011F\u0121\u0123]/g, i: /[\xEC-\xEF\u0129\u012B\u012D\u012F\u0131]/g, ij: /[\u0133]/g, j: /[\u0135]/g, k: /[\u0137,\u0138]/g, l: /[\u013A\u013C\u013E\u0140\u0142]/g, n: /[\xF1\u0144\u0146\u0148\u014B]/g, p: /[\xFE]/g, o: /[\xF2-\xF6\xF8\u014D\u014F\u0151]/g, oe: /[\u0153]/g, r: /[\u0155\u0157\u0159]/g, s: /[\u015B\u015D\u015F\u0161]/g, t: /[\u0163\u0165\u0167]/g, u: /[\xF9-\xFC\u0169\u016B\u016D\u016F\u0171\u0173]/g, w: /[\u0175]/g, y: /[\xFD\xFF\u0177]/g, z: /[\u017A\u017C\u017E]/g };
    for (let n in e) t = t.replace(e[n], n);
  }
  return t;
}
function Gi(t) {
  return K(t, !1) ? t[0].toUpperCase() + t.slice(1) : t;
}
function xn(t) {
  return K(t) ? t.replace(/(_)/g, "-").replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase() : t;
}
function At() {
  let t = /* @__PURE__ */ new Map();
  return { on(e, n) {
    let i = t.get(e);
    return i ? i.push(n) : i = [n], t.set(e, i), this;
  }, off(e, n) {
    let i = t.get(e);
    return i && i.splice(i.indexOf(n) >>> 0, 1), this;
  }, emit(e, n) {
    let i = t.get(e);
    i && i.forEach((r) => {
      r(n);
    });
  }, clear() {
    t.clear();
  } };
}
function Ie(...t) {
  if (t) {
    let e = [];
    for (let n = 0; n < t.length; n++) {
      let i = t[n];
      if (!i) continue;
      let r = typeof i;
      if (r === "string" || r === "number") e.push(i);
      else if (r === "object") {
        let o = Array.isArray(i) ? [Ie(...i)] : Object.entries(i).map(([s, l]) => l ? s : void 0);
        e = o.length ? e.concat(o.filter((s) => !!s)) : e;
      }
    }
    return e.join(" ").trim();
  }
}
function qi(t, e) {
  return t ? t.classList ? t.classList.contains(e) : new RegExp("(^| )" + e + "( |$)", "gi").test(t.className) : !1;
}
function ht(t, e) {
  if (t && e) {
    let n = (i) => {
      qi(t, i) || (t.classList ? t.classList.add(i) : t.className += " " + i);
    };
    [e].flat().filter(Boolean).forEach((i) => i.split(" ").forEach(n));
  }
}
function Yi() {
  return window.innerWidth - document.documentElement.offsetWidth;
}
function Os(t) {
  typeof t == "string" ? ht(document.body, t || "p-overflow-hidden") : (t != null && t.variableName && document.body.style.setProperty(t.variableName, Yi() + "px"), ht(document.body, t?.className || "p-overflow-hidden"));
}
function je(t, e) {
  if (t && e) {
    let n = (i) => {
      t.classList ? t.classList.remove(i) : t.className = t.className.replace(new RegExp("(^|\\b)" + i.split(" ").join("|") + "(\\b|$)", "gi"), " ");
    };
    [e].flat().filter(Boolean).forEach((i) => i.split(" ").forEach(n));
  }
}
function $s(t) {
  typeof t == "string" ? je(document.body, t || "p-overflow-hidden") : (t != null && t.variableName && document.body.style.removeProperty(t.variableName), je(document.body, t?.className || "p-overflow-hidden"));
}
function mt(t) {
  for (let e of document?.styleSheets) try {
    for (let n of e?.cssRules) for (let i of n?.style) if (t.test(i)) return { name: i, value: n.style.getPropertyValue(i).trim() };
  } catch {
  }
  return null;
}
function Pn(t) {
  let e = { width: 0, height: 0 };
  if (t) {
    let [n, i] = [t.style.visibility, t.style.display], r = t.getBoundingClientRect();
    t.style.visibility = "hidden", t.style.display = "block", e.width = r.width || t.offsetWidth, e.height = r.height || t.offsetHeight, t.style.display = i, t.style.visibility = n;
  }
  return e;
}
function An() {
  let t = window, e = document, n = e.documentElement, i = e.getElementsByTagName("body")[0], r = t.innerWidth || n.clientWidth || i.clientWidth, o = t.innerHeight || n.clientHeight || i.clientHeight;
  return { width: r, height: o };
}
function gt(t) {
  return t ? Math.abs(t.scrollLeft) : 0;
}
function Zi() {
  let t = document.documentElement;
  return (window.pageXOffset || gt(t)) - (t.clientLeft || 0);
}
function Qi() {
  let t = document.documentElement;
  return (window.pageYOffset || t.scrollTop) - (t.clientTop || 0);
}
function Ji(t) {
  return t ? getComputedStyle(t).direction === "rtl" : !1;
}
function Xi(t, e, n = !0) {
  var i, r, o, s;
  if (t) {
    let l = t.offsetParent ? { width: t.offsetWidth, height: t.offsetHeight } : Pn(t), a = l.height, u = l.width, d = e.offsetHeight, c = e.offsetWidth, f = e.getBoundingClientRect(), p = Qi(), m = Zi(), v = An(), g, y, b = "top";
    f.top + d + a > v.height ? (g = f.top + p - a, b = "bottom", g < 0 && (g = p)) : g = d + f.top + p, f.left + u > v.width ? y = Math.max(0, f.left + m + c - u) : y = f.left + m, Ji(t) ? t.style.insetInlineEnd = y + "px" : t.style.insetInlineStart = y + "px", t.style.top = g + "px", t.style.transformOrigin = b, n && (t.style.marginTop = b === "bottom" ? `calc(${(r = (i = mt(/-anchor-gutter$/)) == null ? void 0 : i.value) != null ? r : "2px"} * -1)` : (s = (o = mt(/-anchor-gutter$/)) == null ? void 0 : o.value) != null ? s : "");
  }
}
function er(t, e) {
  t && (typeof e == "string" ? t.style.cssText = e : Object.entries(e || {}).forEach(([n, i]) => t.style[n] = i));
}
function En(t, e) {
  return t instanceof HTMLElement ? t.offsetWidth : 0;
}
function tr(t, e, n = !0, i = void 0) {
  var r;
  if (t) {
    let o = t.offsetParent ? { width: t.offsetWidth, height: t.offsetHeight } : Pn(t), s = e.offsetHeight, l = e.getBoundingClientRect(), a = An(), u, d, c = i ?? "top";
    if (!i && l.top + s + o.height > a.height ? (u = -1 * o.height, c = "bottom", l.top + u < 0 && (u = -1 * l.top)) : u = s, o.width > a.width ? d = l.left * -1 : l.left + o.width > a.width ? d = (l.left + o.width - a.width) * -1 : d = 0, t.style.top = u + "px", t.style.insetInlineStart = d + "px", t.style.transformOrigin = c, n) {
      let f = (r = mt(/-anchor-gutter$/)) == null ? void 0 : r.value;
      t.style.marginTop = c === "bottom" ? `calc(${f ?? "2px"} * -1)` : f ?? "";
    }
  }
}
function jn(t) {
  if (t) {
    let e = t.parentNode;
    return e && e instanceof ShadowRoot && e.host && (e = e.host), e;
  }
  return null;
}
function nr(t) {
  return !!(t !== null && typeof t < "u" && t.nodeName && jn(t));
}
function Se(t) {
  return typeof Element < "u" ? t instanceof Element : t !== null && typeof t == "object" && t.nodeType === 1 && typeof t.nodeName == "string";
}
function tt(t, e = {}) {
  if (Se(t)) {
    let n = (i, r) => {
      var o, s;
      let l = (o = t?.$attrs) != null && o[i] ? [(s = t?.$attrs) == null ? void 0 : s[i]] : [];
      return [r].flat().reduce((a, u) => {
        if (u != null) {
          let d = typeof u;
          if (d === "string" || d === "number") a.push(u);
          else if (d === "object") {
            let c = Array.isArray(u) ? n(i, u) : Object.entries(u).map(([f, p]) => i === "style" && (p || p === 0) ? `${f.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase()}:${p}` : p ? f : void 0);
            a = c.length ? a.concat(c.filter((f) => !!f)) : a;
          }
        }
        return a;
      }, l);
    };
    Object.entries(e).forEach(([i, r]) => {
      if (r != null) {
        let o = i.match(/^on(.+)/);
        o ? t.addEventListener(o[1].toLowerCase(), r) : i === "p-bind" || i === "pBind" ? tt(t, r) : (r = i === "class" ? [...new Set(n("class", r))].join(" ").trim() : i === "style" ? n("style", r).join(";").trim() : r, (t.$attrs = t.$attrs || {}) && (t.$attrs[i] = r), t.setAttribute(i, r));
      }
    });
  }
}
function ir(t, e = {}, ...n) {
  {
    let i = document.createElement(t);
    return tt(i, e), i.append(...n), i;
  }
}
function rr(t, e) {
  return Se(t) ? Array.from(t.querySelectorAll(e)) : [];
}
function st(t, e) {
  return Se(t) ? t.matches(e) ? t : t.querySelector(e) : null;
}
function oe(t, e) {
  t && document.activeElement !== t && t.focus(e);
}
function or(t, e) {
  if (Se(t)) {
    let n = t.getAttribute(e);
    return isNaN(n) ? n === "true" || n === "false" ? n === "true" : n : +n;
  }
}
function Et(t, e = "") {
  let n = rr(t, `button:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${e},
            [href]:not([tabindex = "-1"]):not([style*="display:none"]):not([hidden])${e},
            input:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${e},
            select:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${e},
            textarea:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${e},
            [tabIndex]:not([tabIndex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${e},
            [contenteditable]:not([tabIndex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${e}`), i = [];
  for (let r of n) getComputedStyle(r).display != "none" && getComputedStyle(r).visibility != "hidden" && i.push(r);
  return i;
}
function ar(t, e) {
  let n = Et(t, e);
  return n.length > 0 ? n[0] : null;
}
function ge(t) {
  if (t) {
    let e = t.offsetHeight, n = getComputedStyle(t);
    return e -= parseFloat(n.paddingTop) + parseFloat(n.paddingBottom) + parseFloat(n.borderTopWidth) + parseFloat(n.borderBottomWidth), e;
  }
  return 0;
}
function sr(t, e) {
  let n = Et(t, e);
  return n.length > 0 ? n[n.length - 1] : null;
}
function lr(t) {
  if (t) {
    let e = t.getBoundingClientRect();
    return { top: e.top + (window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0), left: e.left + (window.pageXOffset || gt(document.documentElement) || gt(document.body) || 0) };
  }
  return { top: "auto", left: "auto" };
}
function ur(t, e) {
  return t ? t.offsetHeight : 0;
}
function Mn(t, e = []) {
  let n = jn(t);
  return n === null ? e : Mn(n, e.concat([n]));
}
function dr(t) {
  let e = [];
  if (t) {
    let n = Mn(t), i = /(auto|scroll)/, r = (o) => {
      try {
        let s = window.getComputedStyle(o, null);
        return i.test(s.getPropertyValue("overflow")) || i.test(s.getPropertyValue("overflowX")) || i.test(s.getPropertyValue("overflowY"));
      } catch {
        return !1;
      }
    };
    for (let o of n) {
      let s = o.nodeType === 1 && o.dataset.scrollselectors;
      if (s) {
        let l = s.split(",");
        for (let a of l) {
          let u = st(o, a);
          u && r(u) && e.push(u);
        }
      }
      o.nodeType !== 9 && r(o) && e.push(o);
    }
  }
  return e;
}
function ve(t) {
  if (t) {
    let e = t.offsetWidth, n = getComputedStyle(t);
    return e -= parseFloat(n.paddingLeft) + parseFloat(n.paddingRight) + parseFloat(n.borderLeftWidth) + parseFloat(n.borderRightWidth), e;
  }
  return 0;
}
function cr() {
  return /(android)/i.test(navigator.userAgent);
}
function Vn() {
  return !!(typeof window < "u" && window.document && window.document.createElement);
}
function Cs(t, e = "") {
  return Se(t) ? t.matches(`button:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${e},
            [href][clientHeight][clientWidth]:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${e},
            input:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${e},
            select:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${e},
            textarea:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${e},
            [tabIndex]:not([tabIndex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${e},
            [contenteditable]:not([tabIndex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${e}`) : !1;
}
function nt(t) {
  return !!(t && t.offsetParent != null);
}
function fr() {
  return "ontouchstart" in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;
}
function pr(t, e = "", n) {
  Se(t) && n !== null && n !== void 0 && t.setAttribute(e, n);
}
var Qe = {};
function hr(t = "pui_id_") {
  return Object.hasOwn(Qe, t) || (Qe[t] = 0), Qe[t]++, `${t}${Qe[t]}`;
}
function mr() {
  let t = [], e = (s, l, a = 999) => {
    let u = r(s, l, a), d = u.value + (u.key === s ? 0 : a) + 1;
    return t.push({ key: s, value: d }), d;
  }, n = (s) => {
    t = t.filter((l) => l.value !== s);
  }, i = (s, l) => r(s).value, r = (s, l, a = 0) => [...t].reverse().find((u) => !0) || { key: s, value: a }, o = (s) => s && parseInt(s.style.zIndex, 10) || 0;
  return { get: o, set: (s, l, a) => {
    l && (l.style.zIndex = String(e(s, !0, a)));
  }, clear: (s) => {
    s && (n(o(s)), s.style.zIndex = "");
  }, getCurrent: (s) => i(s) };
}
var ut = mr(), gr = Object.defineProperty, vr = Object.defineProperties, yr = Object.getOwnPropertyDescriptors, it = Object.getOwnPropertySymbols, Fn = Object.prototype.hasOwnProperty, zn = Object.prototype.propertyIsEnumerable, Wt = (t, e, n) => e in t ? gr(t, e, { enumerable: !0, configurable: !0, writable: !0, value: n }) : t[e] = n, X = (t, e) => {
  for (var n in e || (e = {})) Fn.call(e, n) && Wt(t, n, e[n]);
  if (it) for (var n of it(e)) zn.call(e, n) && Wt(t, n, e[n]);
  return t;
}, dt = (t, e) => vr(t, yr(e)), ae = (t, e) => {
  var n = {};
  for (var i in t) Fn.call(t, i) && e.indexOf(i) < 0 && (n[i] = t[i]);
  if (t != null && it) for (var i of it(t)) e.indexOf(i) < 0 && zn.call(t, i) && (n[i] = t[i]);
  return n;
}, br = At(), D = br, Me = /{([^}]*)}/g, Nn = /(\d+\s+[\+\-\*\/]\s+\d+)/g, Dn = /var\([^)]+\)/g;
function Ut(t) {
  return K(t) ? t.replace(/[A-Z]/g, (e, n) => n === 0 ? e : "." + e.toLowerCase()).toLowerCase() : t;
}
function Sr(t) {
  return re(t) && t.hasOwnProperty("$value") && t.hasOwnProperty("$type") ? t.$value : t;
}
function wr(t) {
  return t.replaceAll(/ /g, "").replace(/[^\w]/g, "-");
}
function vt(t = "", e = "") {
  return wr(`${K(t, !1) && K(e, !1) ? `${t}-` : t}${e}`);
}
function Rn(t = "", e = "") {
  return `--${vt(t, e)}`;
}
function Or(t = "") {
  let e = (t.match(/{/g) || []).length, n = (t.match(/}/g) || []).length;
  return (e + n) % 2 !== 0;
}
function Bn(t, e = "", n = "", i = [], r) {
  if (K(t)) {
    let o = t.trim();
    if (Or(o)) return;
    if (ye(o, Me)) {
      let s = o.replaceAll(Me, (l) => {
        let a = l.replace(/{|}/g, "").split(".").filter((u) => !i.some((d) => ye(u, d)));
        return `var(${Rn(n, xn(a.join("-")))}${x(r) ? `, ${r}` : ""})`;
      });
      return ye(s.replace(Dn, "0"), Nn) ? `calc(${s})` : s;
    }
    return o;
  } else if (Ki(t)) return t;
}
function $r(t, e, n) {
  K(e, !1) && t.push(`${e}:${n};`);
}
function $e(t, e) {
  return t ? `${t}{${e}}` : "";
}
function Hn(t, e) {
  if (t.indexOf("dt(") === -1) return t;
  function n(s, l) {
    let a = [], u = 0, d = "", c = null, f = 0;
    for (; u <= s.length; ) {
      let p = s[u];
      if ((p === '"' || p === "'" || p === "`") && s[u - 1] !== "\\" && (c = c === p ? null : p), !c && (p === "(" && f++, p === ")" && f--, (p === "," || u === s.length) && f === 0)) {
        let m = d.trim();
        m.startsWith("dt(") ? a.push(Hn(m, l)) : a.push(i(m)), d = "", u++;
        continue;
      }
      p !== void 0 && (d += p), u++;
    }
    return a;
  }
  function i(s) {
    let l = s[0];
    if ((l === '"' || l === "'" || l === "`") && s[s.length - 1] === l) return s.slice(1, -1);
    let a = Number(s);
    return isNaN(a) ? s : a;
  }
  let r = [], o = [];
  for (let s = 0; s < t.length; s++) if (t[s] === "d" && t.slice(s, s + 3) === "dt(") o.push(s), s += 2;
  else if (t[s] === ")" && o.length > 0) {
    let l = o.pop();
    o.length === 0 && r.push([l, s]);
  }
  if (!r.length) return t;
  for (let s = r.length - 1; s >= 0; s--) {
    let [l, a] = r[s], u = t.slice(l + 3, a), d = n(u, e), c = e(...d);
    t = t.slice(0, l) + c + t.slice(a + 1);
  }
  return t;
}
var Is = (t) => {
  var e;
  let n = A.getTheme(), i = yt(n, t, void 0, "variable"), r = (e = i?.match(/--[\w-]+/g)) == null ? void 0 : e[0], o = yt(n, t, void 0, "value");
  return { name: r, variable: i, value: o };
}, be = (...t) => yt(A.getTheme(), ...t), yt = (t = {}, e, n, i) => {
  if (e) {
    let { variable: r, options: o } = A.defaults || {}, { prefix: s, transform: l } = t?.options || o || {}, a = ye(e, Me) ? e : `{${e}}`;
    return i === "value" || Ge(i) && l === "strict" ? A.getTokenValue(e) : Bn(a, void 0, s, [r.excludedKeyRegex], n);
  }
  return "";
};
function Je(t, ...e) {
  if (t instanceof Array) {
    let n = t.reduce((i, r, o) => {
      var s;
      return i + r + ((s = G(e[o], { dt: be })) != null ? s : "");
    }, "");
    return Hn(n, be);
  }
  return G(t, { dt: be });
}
function Cr(t, e = {}) {
  let n = A.defaults.variable, { prefix: i = n.prefix, selector: r = n.selector, excludedKeyRegex: o = n.excludedKeyRegex } = e, s = [], l = [], a = [{ node: t, path: i }];
  for (; a.length; ) {
    let { node: d, path: c } = a.pop();
    for (let f in d) {
      let p = d[f], m = Sr(p), v = ye(f, o) ? vt(c) : vt(c, xn(f));
      if (re(m)) a.push({ node: m, path: v });
      else {
        let g = Rn(v), y = Bn(m, v, i, [o]);
        $r(l, g, y);
        let b = v;
        i && b.startsWith(i + "-") && (b = b.slice(i.length + 1)), s.push(b.replace(/-/g, "."));
      }
    }
  }
  let u = l.join("");
  return { value: l, tokens: s, declarations: u, css: $e(r, u) };
}
var J = { regex: { rules: { class: { pattern: /^\.([a-zA-Z][\w-]*)$/, resolve(t) {
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
    var i;
    return (i = e.map((r) => r.resolve(n)).find((r) => r.matched)) != null ? i : this.rules.custom.resolve(n);
  });
} }, _toVariables(t, e) {
  return Cr(t, { prefix: e?.prefix });
}, getCommon({ name: t = "", theme: e = {}, params: n, set: i, defaults: r }) {
  var o, s, l, a, u, d, c;
  let { preset: f, options: p } = e, m, v, g, y, b, O, h;
  if (x(f) && p.transform !== "strict") {
    let { primitive: S, semantic: T, extend: $ } = f, _ = T || {}, { colorScheme: F } = _, z = ae(_, ["colorScheme"]), j = $ || {}, { colorScheme: V } = j, W = ae(j, ["colorScheme"]), U = F || {}, { dark: N } = U, H = ae(U, ["dark"]), q = V || {}, { dark: le } = q, ee = ae(q, ["dark"]), Y = x(S) ? this._toVariables({ primitive: S }, p) : {}, te = x(z) ? this._toVariables({ semantic: z }, p) : {}, fe = x(H) ? this._toVariables({ light: H }, p) : {}, Ye = x(N) ? this._toVariables({ dark: N }, p) : {}, we = x(W) ? this._toVariables({ semantic: W }, p) : {}, zt = x(ee) ? this._toVariables({ light: ee }, p) : {}, Nt = x(le) ? this._toVariables({ dark: le }, p) : {}, [ai, si] = [(o = Y.declarations) != null ? o : "", Y.tokens], [li, ui] = [(s = te.declarations) != null ? s : "", te.tokens || []], [di, ci] = [(l = fe.declarations) != null ? l : "", fe.tokens || []], [fi, pi] = [(a = Ye.declarations) != null ? a : "", Ye.tokens || []], [hi, mi] = [(u = we.declarations) != null ? u : "", we.tokens || []], [gi, vi] = [(d = zt.declarations) != null ? d : "", zt.tokens || []], [yi, bi] = [(c = Nt.declarations) != null ? c : "", Nt.tokens || []];
    m = this.transformCSS(t, ai, "light", "variable", p, i, r), v = si;
    let Si = this.transformCSS(t, `${li}${di}`, "light", "variable", p, i, r), wi = this.transformCSS(t, `${fi}`, "dark", "variable", p, i, r);
    g = `${Si}${wi}`, y = [.../* @__PURE__ */ new Set([...ui, ...ci, ...pi])];
    let Oi = this.transformCSS(t, `${hi}${gi}color-scheme:light`, "light", "variable", p, i, r), $i = this.transformCSS(t, `${yi}color-scheme:dark`, "dark", "variable", p, i, r);
    b = `${Oi}${$i}`, O = [.../* @__PURE__ */ new Set([...mi, ...vi, ...bi])], h = G(f.css, { dt: be });
  }
  return { primitive: { css: m, tokens: v }, semantic: { css: g, tokens: y }, global: { css: b, tokens: O }, style: h };
}, getPreset({ name: t = "", preset: e = {}, options: n, params: i, set: r, defaults: o, selector: s }) {
  var l, a, u;
  let d, c, f;
  if (x(e) && n.transform !== "strict") {
    let p = t.replace("-directive", ""), m = e, { colorScheme: v, extend: g, css: y } = m, b = ae(m, ["colorScheme", "extend", "css"]), O = g || {}, { colorScheme: h } = O, S = ae(O, ["colorScheme"]), T = v || {}, { dark: $ } = T, _ = ae(T, ["dark"]), F = h || {}, { dark: z } = F, j = ae(F, ["dark"]), V = x(b) ? this._toVariables({ [p]: X(X({}, b), S) }, n) : {}, W = x(_) ? this._toVariables({ [p]: X(X({}, _), j) }, n) : {}, U = x($) ? this._toVariables({ [p]: X(X({}, $), z) }, n) : {}, [N, H] = [(l = V.declarations) != null ? l : "", V.tokens || []], [q, le] = [(a = W.declarations) != null ? a : "", W.tokens || []], [ee, Y] = [(u = U.declarations) != null ? u : "", U.tokens || []], te = this.transformCSS(p, `${N}${q}`, "light", "variable", n, r, o, s), fe = this.transformCSS(p, ee, "dark", "variable", n, r, o, s);
    d = `${te}${fe}`, c = [.../* @__PURE__ */ new Set([...H, ...le, ...Y])], f = G(y, { dt: be });
  }
  return { css: d, tokens: c, style: f };
}, getPresetC({ name: t = "", theme: e = {}, params: n, set: i, defaults: r }) {
  var o;
  let { preset: s, options: l } = e, a = (o = s?.components) == null ? void 0 : o[t];
  return this.getPreset({ name: t, preset: a, options: l, params: n, set: i, defaults: r });
}, getPresetD({ name: t = "", theme: e = {}, params: n, set: i, defaults: r }) {
  var o, s;
  let l = t.replace("-directive", ""), { preset: a, options: u } = e, d = ((o = a?.components) == null ? void 0 : o[l]) || ((s = a?.directives) == null ? void 0 : s[l]);
  return this.getPreset({ name: l, preset: d, options: u, params: n, set: i, defaults: r });
}, applyDarkColorScheme(t) {
  return !(t.darkModeSelector === "none" || t.darkModeSelector === !1);
}, getColorSchemeOption(t, e) {
  var n;
  return this.applyDarkColorScheme(t) ? this.regex.resolve(t.darkModeSelector === !0 ? e.options.darkModeSelector : (n = t.darkModeSelector) != null ? n : e.options.darkModeSelector) : [];
}, getLayerOrder(t, e = {}, n, i) {
  let { cssLayer: r } = e;
  return r ? `@layer ${G(r.order || r.name || "primeui", n)}` : "";
}, getCommonStyleSheet({ name: t = "", theme: e = {}, params: n, props: i = {}, set: r, defaults: o }) {
  let s = this.getCommon({ name: t, theme: e, params: n, set: r, defaults: o }), l = Object.entries(i).reduce((a, [u, d]) => a.push(`${u}="${d}"`) && a, []).join(" ");
  return Object.entries(s || {}).reduce((a, [u, d]) => {
    if (re(d) && Object.hasOwn(d, "css")) {
      let c = Ee(d.css), f = `${u}-variables`;
      a.push(`<style type="text/css" data-primevue-style-id="${f}" ${l}>${c}</style>`);
    }
    return a;
  }, []).join("");
}, getStyleSheet({ name: t = "", theme: e = {}, params: n, props: i = {}, set: r, defaults: o }) {
  var s;
  let l = { name: t, theme: e, params: n, set: r, defaults: o }, a = (s = t.includes("-directive") ? this.getPresetD(l) : this.getPresetC(l)) == null ? void 0 : s.css, u = Object.entries(i).reduce((d, [c, f]) => d.push(`${c}="${f}"`) && d, []).join(" ");
  return a ? `<style type="text/css" data-primevue-style-id="${t}-variables" ${u}>${Ee(a)}</style>` : "";
}, createTokens(t = {}, e, n = "", i = "", r = {}) {
  let o = function(l, a = {}, u = []) {
    if (u.includes(this.path)) return console.warn(`Circular reference detected at ${this.path}`), { colorScheme: l, path: this.path, paths: a, value: void 0 };
    u.push(this.path), a.name = this.path, a.binding || (a.binding = {});
    let d = this.value;
    if (typeof this.value == "string" && Me.test(this.value)) {
      let c = this.value.trim().replace(Me, (f) => {
        var p;
        let m = f.slice(1, -1), v = this.tokens[m];
        if (!v) return console.warn(`Token not found for path: ${m}`), "__UNRESOLVED__";
        let g = v.computed(l, a, u);
        return Array.isArray(g) && g.length === 2 ? `light-dark(${g[0].value},${g[1].value})` : (p = g?.value) != null ? p : "__UNRESOLVED__";
      });
      d = Nn.test(c.replace(Dn, "0")) ? `calc(${c})` : c;
    }
    return Ge(a.binding) && delete a.binding, u.pop(), { colorScheme: l, path: this.path, paths: a, value: d.includes("__UNRESOLVED__") ? void 0 : d };
  }, s = (l, a, u) => {
    Object.entries(l).forEach(([d, c]) => {
      let f = ye(d, e.variable.excludedKeyRegex) ? a : a ? `${a}.${Ut(d)}` : Ut(d), p = u ? `${u}.${d}` : d;
      re(c) ? s(c, f, p) : (r[f] || (r[f] = { paths: [], computed: (m, v = {}, g = []) => {
        if (r[f].paths.length === 1) return r[f].paths[0].computed(r[f].paths[0].scheme, v.binding, g);
        if (m && m !== "none") for (let y = 0; y < r[f].paths.length; y++) {
          let b = r[f].paths[y];
          if (b.scheme === m) return b.computed(m, v.binding, g);
        }
        return r[f].paths.map((y) => y.computed(y.scheme, v[y.scheme], g));
      } }), r[f].paths.push({ path: p, value: c, scheme: p.includes("colorScheme.light") ? "light" : p.includes("colorScheme.dark") ? "dark" : "none", computed: o, tokens: r }));
    });
  };
  return s(t, n, i), r;
}, getTokenValue(t, e, n) {
  var i;
  let r = ((l) => l.split(".").filter((a) => !ye(a.toLowerCase(), n.variable.excludedKeyRegex)).join("."))(e), o = e.includes("colorScheme.light") ? "light" : e.includes("colorScheme.dark") ? "dark" : void 0, s = [(i = t[r]) == null ? void 0 : i.computed(o)].flat().filter((l) => l);
  return s.length === 1 ? s[0].value : s.reduce((l = {}, a) => {
    let u = a, { colorScheme: d } = u, c = ae(u, ["colorScheme"]);
    return l[d] = c, l;
  }, void 0);
}, getSelectorRule(t, e, n, i) {
  return n === "class" || n === "attr" ? $e(x(e) ? `${t}${e},${t} ${e}` : t, i) : $e(t, $e(e ?? ":root,:host", i));
}, transformCSS(t, e, n, i, r = {}, o, s, l) {
  if (x(e)) {
    let { cssLayer: a } = r;
    if (i !== "style") {
      let u = this.getColorSchemeOption(r, s);
      e = n === "dark" ? u.reduce((d, { type: c, selector: f }) => (x(f) && (d += f.includes("[CSS]") ? f.replace("[CSS]", e) : this.getSelectorRule(f, l, c, e)), d), "") : $e(l ?? ":root,:host", e);
    }
    if (a) {
      let u = { name: "primeui" };
      re(a) && (u.name = G(a.name, { name: t, type: i })), x(u.name) && (e = $e(`@layer ${u.name}`, e), o?.layerNames(u.name));
    }
    return e;
  }
  return "";
} }, A = { defaults: { variable: { prefix: "p", selector: ":root,:host", excludedKeyRegex: /^(primitive|semantic|components|directives|variables|colorscheme|light|dark|common|root|states|extend|css)$/gi }, options: { prefix: "p", darkModeSelector: "system", cssLayer: !1 } }, _theme: void 0, _layerNames: /* @__PURE__ */ new Set(), _loadedStyleNames: /* @__PURE__ */ new Set(), _loadingStyles: /* @__PURE__ */ new Set(), _tokens: {}, update(t = {}) {
  let { theme: e } = t;
  e && (this._theme = dt(X({}, e), { options: X(X({}, this.defaults.options), e.options) }), this._tokens = J.createTokens(this.preset, this.defaults), this.clearLoadedStyleNames());
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
  this.update({ theme: t }), D.emit("theme:change", t);
}, getPreset() {
  return this.preset;
}, setPreset(t) {
  this._theme = dt(X({}, this.theme), { preset: t }), this._tokens = J.createTokens(t, this.defaults), this.clearLoadedStyleNames(), D.emit("preset:change", t), D.emit("theme:change", this.theme);
}, getOptions() {
  return this.options;
}, setOptions(t) {
  this._theme = dt(X({}, this.theme), { options: t }), this.clearLoadedStyleNames(), D.emit("options:change", t), D.emit("theme:change", this.theme);
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
  return J.getTokenValue(this.tokens, t, this.defaults);
}, getCommon(t = "", e) {
  return J.getCommon({ name: t, theme: this.theme, params: e, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } });
}, getComponent(t = "", e) {
  let n = { name: t, theme: this.theme, params: e, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } };
  return J.getPresetC(n);
}, getDirective(t = "", e) {
  let n = { name: t, theme: this.theme, params: e, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } };
  return J.getPresetD(n);
}, getCustomPreset(t = "", e, n, i) {
  let r = { name: t, preset: e, options: this.options, selector: n, params: i, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } };
  return J.getPreset(r);
}, getLayerOrderCSS(t = "") {
  return J.getLayerOrder(t, this.options, { names: this.getLayerNames() }, this.defaults);
}, transformCSS(t = "", e, n = "style", i) {
  return J.transformCSS(t, e, i, n, this.options, { layerNames: this.setLayerNames.bind(this) }, this.defaults);
}, getCommonStyleSheet(t = "", e, n = {}) {
  return J.getCommonStyleSheet({ name: t, theme: this.theme, params: e, props: n, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } });
}, getStyleSheet(t, e, n = {}) {
  return J.getStyleSheet({ name: t, theme: this.theme, params: e, props: n, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } });
}, onStyleMounted(t) {
  this._loadingStyles.add(t);
}, onStyleUpdated(t) {
  this._loadingStyles.add(t);
}, onStyleLoaded(t, { name: e }) {
  this._loadingStyles.size && (this._loadingStyles.delete(e), D.emit(`theme:${e}:load`, t), !this._loadingStyles.size && D.emit("theme:load"));
} }, R = {
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
function Gt(t, e) {
  var n = typeof Symbol < "u" && t[Symbol.iterator] || t["@@iterator"];
  if (!n) {
    if (Array.isArray(t) || (n = Ir(t)) || e) {
      n && (t = n);
      var i = 0, r = function() {
      };
      return { s: r, n: function() {
        return i >= t.length ? { done: !0 } : { done: !1, value: t[i++] };
      }, e: function(u) {
        throw u;
      }, f: r };
    }
    throw new TypeError(`Invalid attempt to iterate non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
  }
  var o, s = !0, l = !1;
  return { s: function() {
    n = n.call(t);
  }, n: function() {
    var u = n.next();
    return s = u.done, u;
  }, e: function(u) {
    l = !0, o = u;
  }, f: function() {
    try {
      s || n.return == null || n.return();
    } finally {
      if (l) throw o;
    }
  } };
}
function Ir(t, e) {
  if (t) {
    if (typeof t == "string") return qt(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? qt(t, e) : void 0;
  }
}
function qt(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, i = Array(e); n < e; n++) i[n] = t[n];
  return i;
}
var Tr = {
  filter: function(e, n, i, r, o) {
    var s = [];
    if (!e)
      return s;
    var l = Gt(e), a;
    try {
      for (l.s(); !(a = l.n()).done; ) {
        var u = a.value;
        if (typeof u == "string") {
          if (this.filters[r](u, i, o)) {
            s.push(u);
            continue;
          }
        } else {
          var d = Gt(n), c;
          try {
            for (d.s(); !(c = d.n()).done; ) {
              var f = c.value, p = se(u, f);
              if (this.filters[r](p, i, o)) {
                s.push(u);
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
      l.e(m);
    } finally {
      l.f();
    }
    return s;
  },
  filters: {
    startsWith: function(e, n, i) {
      if (n == null || n === "")
        return !0;
      if (e == null)
        return !1;
      var r = Z(n.toString()).toLocaleLowerCase(i), o = Z(e.toString()).toLocaleLowerCase(i);
      return o.slice(0, r.length) === r;
    },
    contains: function(e, n, i) {
      if (n == null || n === "")
        return !0;
      if (e == null)
        return !1;
      var r = Z(n.toString()).toLocaleLowerCase(i), o = Z(e.toString()).toLocaleLowerCase(i);
      return o.indexOf(r) !== -1;
    },
    notContains: function(e, n, i) {
      if (n == null || n === "")
        return !0;
      if (e == null)
        return !1;
      var r = Z(n.toString()).toLocaleLowerCase(i), o = Z(e.toString()).toLocaleLowerCase(i);
      return o.indexOf(r) === -1;
    },
    endsWith: function(e, n, i) {
      if (n == null || n === "")
        return !0;
      if (e == null)
        return !1;
      var r = Z(n.toString()).toLocaleLowerCase(i), o = Z(e.toString()).toLocaleLowerCase(i);
      return o.indexOf(r, o.length - r.length) !== -1;
    },
    equals: function(e, n, i) {
      return n == null || n === "" ? !0 : e == null ? !1 : e.getTime && n.getTime ? e.getTime() === n.getTime() : Z(e.toString()).toLocaleLowerCase(i) == Z(n.toString()).toLocaleLowerCase(i);
    },
    notEquals: function(e, n, i) {
      return n == null || n === "" ? !1 : e == null ? !0 : e.getTime && n.getTime ? e.getTime() !== n.getTime() : Z(e.toString()).toLocaleLowerCase(i) != Z(n.toString()).toLocaleLowerCase(i);
    },
    in: function(e, n) {
      if (n == null || n.length === 0)
        return !0;
      for (var i = 0; i < n.length; i++)
        if (kn(e, n[i]))
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
}, kr = `
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
function Ve(t) {
  "@babel/helpers - typeof";
  return Ve = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, Ve(t);
}
function Yt(t, e) {
  var n = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var i = Object.getOwnPropertySymbols(t);
    e && (i = i.filter(function(r) {
      return Object.getOwnPropertyDescriptor(t, r).enumerable;
    })), n.push.apply(n, i);
  }
  return n;
}
function Zt(t) {
  for (var e = 1; e < arguments.length; e++) {
    var n = arguments[e] != null ? arguments[e] : {};
    e % 2 ? Yt(Object(n), !0).forEach(function(i) {
      Lr(t, i, n[i]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(n)) : Yt(Object(n)).forEach(function(i) {
      Object.defineProperty(t, i, Object.getOwnPropertyDescriptor(n, i));
    });
  }
  return t;
}
function Lr(t, e, n) {
  return (e = _r(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function _r(t) {
  var e = xr(t, "string");
  return Ve(e) == "symbol" ? e : e + "";
}
function xr(t, e) {
  if (Ve(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var i = n.call(t, e);
    if (Ve(i) != "object") return i;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
function Pr(t) {
  var e = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0;
  Dt() && Dt().components ? Ii(t) : e ? t() : In(t);
}
var Ar = 0;
function Er(t) {
  var e = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, n = ke(!1), i = ke(t), r = ke(null), o = Vn() ? window.document : void 0, s = e.document, l = s === void 0 ? o : s, a = e.immediate, u = a === void 0 ? !0 : a, d = e.manual, c = d === void 0 ? !1 : d, f = e.name, p = f === void 0 ? "style_".concat(++Ar) : f, m = e.id, v = m === void 0 ? void 0 : m, g = e.media, y = g === void 0 ? void 0 : g, b = e.nonce, O = b === void 0 ? void 0 : b, h = e.first, S = h === void 0 ? !1 : h, T = e.onMounted, $ = T === void 0 ? void 0 : T, _ = e.onUpdated, F = _ === void 0 ? void 0 : _, z = e.onLoad, j = z === void 0 ? void 0 : z, V = e.props, W = V === void 0 ? {} : V, U = function() {
  }, N = function(le) {
    var ee = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    if (l) {
      var Y = Zt(Zt({}, W), ee), te = Y.name || p, fe = Y.id || v, Ye = Y.nonce || O;
      r.value = l.querySelector('style[data-primevue-style-id="'.concat(te, '"]')) || l.getElementById(fe) || l.createElement("style"), r.value.isConnected || (i.value = le || t, tt(r.value, {
        type: "text/css",
        id: fe,
        media: y,
        nonce: Ye
      }), S ? l.head.prepend(r.value) : l.head.appendChild(r.value), pr(r.value, "data-primevue-style-id", te), tt(r.value, Y), r.value.onload = function(we) {
        return j?.(we, {
          name: te
        });
      }, $?.(te)), !n.value && (U = Ce(i, function(we) {
        r.value.textContent = we, F?.(te);
      }, {
        immediate: !0
      }), n.value = !0);
    }
  }, H = function() {
    !l || !n.value || (U(), nr(r.value) && l.head.removeChild(r.value), n.value = !1, r.value = null);
  };
  return u && !c && Pr(N), {
    id: v,
    name: p,
    el: r,
    css: i,
    unload: H,
    load: N,
    isLoaded: Ci(n)
  };
}
function Fe(t) {
  "@babel/helpers - typeof";
  return Fe = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, Fe(t);
}
var Qt, Jt, Xt, en;
function tn(t, e) {
  return Fr(t) || Vr(t, e) || Mr(t, e) || jr();
}
function jr() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Mr(t, e) {
  if (t) {
    if (typeof t == "string") return nn(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? nn(t, e) : void 0;
  }
}
function nn(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, i = Array(e); n < e; n++) i[n] = t[n];
  return i;
}
function Vr(t, e) {
  var n = t == null ? null : typeof Symbol < "u" && t[Symbol.iterator] || t["@@iterator"];
  if (n != null) {
    var i, r, o, s, l = [], a = !0, u = !1;
    try {
      if (o = (n = n.call(t)).next, e !== 0) for (; !(a = (i = o.call(n)).done) && (l.push(i.value), l.length !== e); a = !0) ;
    } catch (d) {
      u = !0, r = d;
    } finally {
      try {
        if (!a && n.return != null && (s = n.return(), Object(s) !== s)) return;
      } finally {
        if (u) throw r;
      }
    }
    return l;
  }
}
function Fr(t) {
  if (Array.isArray(t)) return t;
}
function rn(t, e) {
  var n = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var i = Object.getOwnPropertySymbols(t);
    e && (i = i.filter(function(r) {
      return Object.getOwnPropertyDescriptor(t, r).enumerable;
    })), n.push.apply(n, i);
  }
  return n;
}
function ct(t) {
  for (var e = 1; e < arguments.length; e++) {
    var n = arguments[e] != null ? arguments[e] : {};
    e % 2 ? rn(Object(n), !0).forEach(function(i) {
      zr(t, i, n[i]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(n)) : rn(Object(n)).forEach(function(i) {
      Object.defineProperty(t, i, Object.getOwnPropertyDescriptor(n, i));
    });
  }
  return t;
}
function zr(t, e, n) {
  return (e = Nr(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function Nr(t) {
  var e = Dr(t, "string");
  return Fe(e) == "symbol" ? e : e + "";
}
function Dr(t, e) {
  if (Fe(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var i = n.call(t, e);
    if (Fe(i) != "object") return i;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
function Xe(t, e) {
  return e || (e = t.slice(0)), Object.freeze(Object.defineProperties(t, { raw: { value: Object.freeze(e) } }));
}
var Rr = function(e) {
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
}, Br = {}, Hr = {}, E = {
  name: "base",
  css: Rr,
  style: kr,
  classes: Br,
  inlineStyles: Hr,
  load: function(e) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, i = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : function(o) {
      return o;
    }, r = i(Je(Qt || (Qt = Xe(["", ""])), e));
    return x(r) ? Er(Ee(r), ct({
      name: this.name
    }, n)) : {};
  },
  loadCSS: function() {
    var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    return this.load(this.css, e);
  },
  loadStyle: function() {
    var e = this, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, i = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "";
    return this.load(this.style, n, function() {
      var r = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "";
      return A.transformCSS(n.name || e.name, "".concat(r).concat(Je(Jt || (Jt = Xe(["", ""])), i)));
    });
  },
  getCommonTheme: function(e) {
    return A.getCommon(this.name, e);
  },
  getComponentTheme: function(e) {
    return A.getComponent(this.name, e);
  },
  getDirectiveTheme: function(e) {
    return A.getDirective(this.name, e);
  },
  getPresetTheme: function(e, n, i) {
    return A.getCustomPreset(this.name, e, n, i);
  },
  getLayerOrderThemeCSS: function() {
    return A.getLayerOrderCSS(this.name);
  },
  getStyleSheet: function() {
    var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    if (this.css) {
      var i = G(this.css, {
        dt: be
      }) || "", r = Ee(Je(Xt || (Xt = Xe(["", "", ""])), i, e)), o = Object.entries(n).reduce(function(s, l) {
        var a = tn(l, 2), u = a[0], d = a[1];
        return s.push("".concat(u, '="').concat(d, '"')) && s;
      }, []).join(" ");
      return x(r) ? '<style type="text/css" data-primevue-style-id="'.concat(this.name, '" ').concat(o, ">").concat(r, "</style>") : "";
    }
    return "";
  },
  getCommonThemeStyleSheet: function(e) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    return A.getCommonStyleSheet(this.name, e, n);
  },
  getThemeStyleSheet: function(e) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, i = [A.getStyleSheet(this.name, e, n)];
    if (this.style) {
      var r = this.name === "base" ? "global-style" : "".concat(this.name, "-style"), o = Je(en || (en = Xe(["", ""])), G(this.style, {
        dt: be
      })), s = Ee(A.transformCSS(r, o)), l = Object.entries(n).reduce(function(a, u) {
        var d = tn(u, 2), c = d[0], f = d[1];
        return a.push("".concat(c, '="').concat(f, '"')) && a;
      }, []).join(" ");
      x(s) && i.push('<style type="text/css" data-primevue-style-id="'.concat(r, '" ').concat(l, ">").concat(s, "</style>"));
    }
    return i.join("");
  },
  extend: function(e) {
    return ct(ct({}, this), {}, {
      css: void 0,
      style: void 0
    }, e);
  }
}, ce = At();
function ze(t) {
  "@babel/helpers - typeof";
  return ze = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, ze(t);
}
function on(t, e) {
  var n = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var i = Object.getOwnPropertySymbols(t);
    e && (i = i.filter(function(r) {
      return Object.getOwnPropertyDescriptor(t, r).enumerable;
    })), n.push.apply(n, i);
  }
  return n;
}
function et(t) {
  for (var e = 1; e < arguments.length; e++) {
    var n = arguments[e] != null ? arguments[e] : {};
    e % 2 ? on(Object(n), !0).forEach(function(i) {
      Kr(t, i, n[i]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(n)) : on(Object(n)).forEach(function(i) {
      Object.defineProperty(t, i, Object.getOwnPropertyDescriptor(n, i));
    });
  }
  return t;
}
function Kr(t, e, n) {
  return (e = Wr(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function Wr(t) {
  var e = Ur(t, "string");
  return ze(e) == "symbol" ? e : e + "";
}
function Ur(t, e) {
  if (ze(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var i = n.call(t, e);
    if (ze(i) != "object") return i;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var Gr = {
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
    text: [R.STARTS_WITH, R.CONTAINS, R.NOT_CONTAINS, R.ENDS_WITH, R.EQUALS, R.NOT_EQUALS],
    numeric: [R.EQUALS, R.NOT_EQUALS, R.LESS_THAN, R.LESS_THAN_OR_EQUAL_TO, R.GREATER_THAN, R.GREATER_THAN_OR_EQUAL_TO],
    date: [R.DATE_IS, R.DATE_IS_NOT, R.DATE_BEFORE, R.DATE_AFTER]
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
}, qr = Symbol();
function Yr(t, e) {
  var n = {
    config: Ti(e)
  };
  return t.config.globalProperties.$primevue = n, t.provide(qr, n), Zr(), Qr(t, n), n;
}
var Te = [];
function Zr() {
  D.clear(), Te.forEach(function(t) {
    return t?.();
  }), Te = [];
}
function Qr(t, e) {
  var n = ke(!1), i = function() {
    var u;
    if (((u = e.config) === null || u === void 0 ? void 0 : u.theme) !== "none" && !A.isStyleNameLoaded("common")) {
      var d, c, f = ((d = E.getCommonTheme) === null || d === void 0 ? void 0 : d.call(E)) || {}, p = f.primitive, m = f.semantic, v = f.global, g = f.style, y = {
        nonce: (c = e.config) === null || c === void 0 || (c = c.csp) === null || c === void 0 ? void 0 : c.nonce
      };
      E.load(p?.css, et({
        name: "primitive-variables"
      }, y)), E.load(m?.css, et({
        name: "semantic-variables"
      }, y)), E.load(v?.css, et({
        name: "global-variables"
      }, y)), E.loadStyle(et({
        name: "global-style"
      }, y), g), A.setLoadedStyleName("common");
    }
  };
  D.on("theme:change", function(a) {
    n.value || (t.config.globalProperties.$primevue.config.theme = a, n.value = !0);
  });
  var r = Ce(e.config, function(a, u) {
    ce.emit("config:change", {
      newValue: a,
      oldValue: u
    });
  }, {
    immediate: !0,
    deep: !0
  }), o = Ce(function() {
    return e.config.ripple;
  }, function(a, u) {
    ce.emit("config:ripple:change", {
      newValue: a,
      oldValue: u
    });
  }, {
    immediate: !0,
    deep: !0
  }), s = Ce(function() {
    return e.config.theme;
  }, function(a, u) {
    n.value || A.setTheme(a), e.config.unstyled || i(), n.value = !1, ce.emit("config:theme:change", {
      newValue: a,
      oldValue: u
    });
  }, {
    immediate: !0,
    deep: !1
  }), l = Ce(function() {
    return e.config.unstyled;
  }, function(a, u) {
    !a && e.config.theme && i(), ce.emit("config:unstyled:change", {
      newValue: a,
      oldValue: u
    });
  }, {
    immediate: !0,
    deep: !0
  });
  Te.push(r), Te.push(o), Te.push(s), Te.push(l);
}
var Jr = {
  install: function(e, n) {
    var i = Ui(Gr, n);
    Yr(e, i);
  }
}, jt = {
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
    this.mounted = Vn();
  },
  computed: {
    inline: function() {
      return this.disabled || this.appendTo === "self";
    }
  }
};
function Xr(t, e, n, i, r, o) {
  return o.inline ? M(t.$slots, "default", {
    key: 0
  }) : r.mounted ? (I(), pe(Tn, {
    key: 1,
    to: n.appendTo
  }, [M(t.$slots, "default")], 8, ["to"])) : Q("", !0);
}
jt.render = Xr;
var de = {
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
function eo() {
  var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "pc", e = ki();
  return "".concat(t).concat(e.replace("v-", "").replaceAll("-", "_"));
}
var an = E.extend({
  name: "common"
});
function Ne(t) {
  "@babel/helpers - typeof";
  return Ne = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, Ne(t);
}
function to(t) {
  return Un(t) || no(t) || Wn(t) || Kn();
}
function no(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function xe(t, e) {
  return Un(t) || io(t, e) || Wn(t, e) || Kn();
}
function Kn() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Wn(t, e) {
  if (t) {
    if (typeof t == "string") return bt(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? bt(t, e) : void 0;
  }
}
function bt(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, i = Array(e); n < e; n++) i[n] = t[n];
  return i;
}
function io(t, e) {
  var n = t == null ? null : typeof Symbol < "u" && t[Symbol.iterator] || t["@@iterator"];
  if (n != null) {
    var i, r, o, s, l = [], a = !0, u = !1;
    try {
      if (o = (n = n.call(t)).next, e === 0) {
        if (Object(n) !== n) return;
        a = !1;
      } else for (; !(a = (i = o.call(n)).done) && (l.push(i.value), l.length !== e); a = !0) ;
    } catch (d) {
      u = !0, r = d;
    } finally {
      try {
        if (!a && n.return != null && (s = n.return(), Object(s) !== s)) return;
      } finally {
        if (u) throw r;
      }
    }
    return l;
  }
}
function Un(t) {
  if (Array.isArray(t)) return t;
}
function sn(t, e) {
  var n = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var i = Object.getOwnPropertySymbols(t);
    e && (i = i.filter(function(r) {
      return Object.getOwnPropertyDescriptor(t, r).enumerable;
    })), n.push.apply(n, i);
  }
  return n;
}
function k(t) {
  for (var e = 1; e < arguments.length; e++) {
    var n = arguments[e] != null ? arguments[e] : {};
    e % 2 ? sn(Object(n), !0).forEach(function(i) {
      Ae(t, i, n[i]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(n)) : sn(Object(n)).forEach(function(i) {
      Object.defineProperty(t, i, Object.getOwnPropertyDescriptor(n, i));
    });
  }
  return t;
}
function Ae(t, e, n) {
  return (e = ro(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function ro(t) {
  var e = oo(t, "string");
  return Ne(e) == "symbol" ? e : e + "";
}
function oo(t, e) {
  if (Ne(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var i = n.call(t, e);
    if (Ne(i) != "object") return i;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var qe = {
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
        D.off("theme:change", this._loadCoreStyles), e || (this._loadCoreStyles(), this._themeChangeListener(this._loadCoreStyles));
      }
    },
    dt: {
      immediate: !0,
      handler: function(e, n) {
        var i = this;
        D.off("theme:change", this._themeScopedListener), e ? (this._loadScopedThemeStyles(e), this._themeScopedListener = function() {
          return i._loadScopedThemeStyles(e);
        }, this._themeChangeListener(this._themeScopedListener)) : this._unloadScopedThemeStyles();
      }
    }
  },
  scopedStyleEl: void 0,
  rootEl: void 0,
  uid: void 0,
  $attrSelector: void 0,
  beforeCreate: function() {
    var e, n, i, r, o, s, l, a, u, d, c, f = (e = this.pt) === null || e === void 0 ? void 0 : e._usept, p = f ? (n = this.pt) === null || n === void 0 || (n = n.originalValue) === null || n === void 0 ? void 0 : n[this.$.type.name] : void 0, m = f ? (i = this.pt) === null || i === void 0 || (i = i.value) === null || i === void 0 ? void 0 : i[this.$.type.name] : this.pt;
    (r = m || p) === null || r === void 0 || (r = r.hooks) === null || r === void 0 || (o = r.onBeforeCreate) === null || o === void 0 || o.call(r);
    var v = (s = this.$primevueConfig) === null || s === void 0 || (s = s.pt) === null || s === void 0 ? void 0 : s._usept, g = v ? (l = this.$primevue) === null || l === void 0 || (l = l.config) === null || l === void 0 || (l = l.pt) === null || l === void 0 ? void 0 : l.originalValue : void 0, y = v ? (a = this.$primevue) === null || a === void 0 || (a = a.config) === null || a === void 0 || (a = a.pt) === null || a === void 0 ? void 0 : a.value : (u = this.$primevue) === null || u === void 0 || (u = u.config) === null || u === void 0 ? void 0 : u.pt;
    (d = y || g) === null || d === void 0 || (d = d[this.$.type.name]) === null || d === void 0 || (d = d.hooks) === null || d === void 0 || (c = d.onBeforeCreate) === null || c === void 0 || c.call(d), this.$attrSelector = eo(), this.uid = this.$attrs.id || this.$attrSelector.replace("pc", "pv_id_");
  },
  created: function() {
    this._hook("onCreated");
  },
  beforeMount: function() {
    var e;
    this.rootEl = st(Se(this.$el) ? this.$el : (e = this.$el) === null || e === void 0 ? void 0 : e.parentElement, "[".concat(this.$attrSelector, "]")), this.rootEl && (this.rootEl.$pc = k({
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
        var n = this._usePT(this._getPT(this.pt, this.$.type.name), this._getOptionValue, "hooks.".concat(e)), i = this._useDefaultPT(this._getOptionValue, "hooks.".concat(e));
        n?.(), i?.();
      }
    },
    _mergeProps: function(e) {
      for (var n = arguments.length, i = new Array(n > 1 ? n - 1 : 0), r = 1; r < n; r++)
        i[r - 1] = arguments[r];
      return at(e) ? e.apply(void 0, i) : w.apply(void 0, i);
    },
    _load: function() {
      de.isStyleNameLoaded("base") || (E.loadCSS(this.$styleOptions), this._loadGlobalStyles(), de.setLoadedStyleName("base")), this._loadThemeStyles();
    },
    _loadStyles: function() {
      this._load(), this._themeChangeListener(this._load);
    },
    _loadCoreStyles: function() {
      var e, n;
      !de.isStyleNameLoaded((e = this.$style) === null || e === void 0 ? void 0 : e.name) && (n = this.$style) !== null && n !== void 0 && n.name && (an.loadCSS(this.$styleOptions), this.$options.style && this.$style.loadCSS(this.$styleOptions), de.setLoadedStyleName(this.$style.name));
    },
    _loadGlobalStyles: function() {
      var e = this._useGlobalPT(this._getOptionValue, "global.css", this.$params);
      x(e) && E.load(e, k({
        name: "global"
      }, this.$styleOptions));
    },
    _loadThemeStyles: function() {
      var e, n;
      if (!(this.isUnstyled || this.$theme === "none")) {
        if (!A.isStyleNameLoaded("common")) {
          var i, r, o = ((i = this.$style) === null || i === void 0 || (r = i.getCommonTheme) === null || r === void 0 ? void 0 : r.call(i)) || {}, s = o.primitive, l = o.semantic, a = o.global, u = o.style;
          E.load(s?.css, k({
            name: "primitive-variables"
          }, this.$styleOptions)), E.load(l?.css, k({
            name: "semantic-variables"
          }, this.$styleOptions)), E.load(a?.css, k({
            name: "global-variables"
          }, this.$styleOptions)), E.loadStyle(k({
            name: "global-style"
          }, this.$styleOptions), u), A.setLoadedStyleName("common");
        }
        if (!A.isStyleNameLoaded((e = this.$style) === null || e === void 0 ? void 0 : e.name) && (n = this.$style) !== null && n !== void 0 && n.name) {
          var d, c, f, p, m = ((d = this.$style) === null || d === void 0 || (c = d.getComponentTheme) === null || c === void 0 ? void 0 : c.call(d)) || {}, v = m.css, g = m.style;
          (f = this.$style) === null || f === void 0 || f.load(v, k({
            name: "".concat(this.$style.name, "-variables")
          }, this.$styleOptions)), (p = this.$style) === null || p === void 0 || p.loadStyle(k({
            name: "".concat(this.$style.name, "-style")
          }, this.$styleOptions), g), A.setLoadedStyleName(this.$style.name);
        }
        if (!A.isStyleNameLoaded("layer-order")) {
          var y, b, O = (y = this.$style) === null || y === void 0 || (b = y.getLayerOrderThemeCSS) === null || b === void 0 ? void 0 : b.call(y);
          E.load(O, k({
            name: "layer-order",
            first: !0
          }, this.$styleOptions)), A.setLoadedStyleName("layer-order");
        }
      }
    },
    _loadScopedThemeStyles: function(e) {
      var n, i, r, o = ((n = this.$style) === null || n === void 0 || (i = n.getPresetTheme) === null || i === void 0 ? void 0 : i.call(n, e, "[".concat(this.$attrSelector, "]"))) || {}, s = o.css, l = (r = this.$style) === null || r === void 0 ? void 0 : r.load(s, k({
        name: "".concat(this.$attrSelector, "-").concat(this.$style.name)
      }, this.$styleOptions));
      this.scopedStyleEl = l.el;
    },
    _unloadScopedThemeStyles: function() {
      var e;
      (e = this.scopedStyleEl) === null || e === void 0 || (e = e.value) === null || e === void 0 || e.remove();
    },
    _themeChangeListener: function() {
      var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : function() {
      };
      de.clearLoadedStyleNames(), D.on("theme:change", e);
    },
    _removeThemeListeners: function() {
      D.off("theme:change", this._loadCoreStyles), D.off("theme:change", this._load), D.off("theme:change", this._themeScopedListener);
    },
    _getHostInstance: function(e) {
      return e ? this.$options.hostName ? e.$.type.name === this.$options.hostName ? e : this._getHostInstance(e.$parentInstance) : e.$parentInstance : void 0;
    },
    _getPropValue: function(e) {
      var n;
      return this[e] || ((n = this._getHostInstance(this)) === null || n === void 0 ? void 0 : n[e]);
    },
    _getOptionValue: function(e) {
      var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", i = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
      return Pt(e, n, i);
    },
    _getPTValue: function() {
      var e, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, i = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", r = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {}, o = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : !0, s = /./g.test(i) && !!r[i.split(".")[0]], l = this._getPropValue("ptOptions") || ((e = this.$primevueConfig) === null || e === void 0 ? void 0 : e.ptOptions) || {}, a = l.mergeSections, u = a === void 0 ? !0 : a, d = l.mergeProps, c = d === void 0 ? !1 : d, f = o ? s ? this._useGlobalPT(this._getPTClassValue, i, r) : this._useDefaultPT(this._getPTClassValue, i, r) : void 0, p = s ? void 0 : this._getPTSelf(n, this._getPTClassValue, i, k(k({}, r), {}, {
        global: f || {}
      })), m = this._getPTDatasets(i);
      return u || !u && p ? c ? this._mergeProps(c, f, p, m) : k(k(k({}, f), p), m) : k(k({}, p), m);
    },
    _getPTSelf: function() {
      for (var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length, i = new Array(n > 1 ? n - 1 : 0), r = 1; r < n; r++)
        i[r - 1] = arguments[r];
      return w(
        this._usePT.apply(this, [this._getPT(e, this.$name)].concat(i)),
        // Exp; <component :pt="{}"
        this._usePT.apply(this, [this.$_attrsPT].concat(i))
        // Exp; <component :pt:[passthrough_key]:[attribute]="{value}" or <component :pt:[passthrough_key]="() =>{value}"
      );
    },
    _getPTDatasets: function() {
      var e, n, i = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", r = "data-pc-", o = i === "root" && x((e = this.pt) === null || e === void 0 ? void 0 : e["data-pc-section"]);
      return i !== "transition" && k(k({}, i === "root" && k(k(Ae({}, "".concat(r, "name"), ie(o ? (n = this.pt) === null || n === void 0 ? void 0 : n["data-pc-section"] : this.$.type.name)), o && Ae({}, "".concat(r, "extend"), ie(this.$.type.name))), {}, Ae({}, "".concat(this.$attrSelector), ""))), {}, Ae({}, "".concat(r, "section"), ie(i)));
    },
    _getPTClassValue: function() {
      var e = this._getOptionValue.apply(this, arguments);
      return K(e) || _n(e) ? {
        class: e
      } : e;
    },
    _getPT: function(e) {
      var n = this, i = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", r = arguments.length > 2 ? arguments[2] : void 0, o = function(l) {
        var a, u = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1, d = r ? r(l) : l, c = ie(i), f = ie(n.$name);
        return (a = u ? c !== f ? d?.[c] : void 0 : d?.[c]) !== null && a !== void 0 ? a : d;
      };
      return e != null && e.hasOwnProperty("_usept") ? {
        _usept: e._usept,
        originalValue: o(e.originalValue),
        value: o(e.value)
      } : o(e, !0);
    },
    _usePT: function(e, n, i, r) {
      var o = function(v) {
        return n(v, i, r);
      };
      if (e != null && e.hasOwnProperty("_usept")) {
        var s, l = e._usept || ((s = this.$primevueConfig) === null || s === void 0 ? void 0 : s.ptOptions) || {}, a = l.mergeSections, u = a === void 0 ? !0 : a, d = l.mergeProps, c = d === void 0 ? !1 : d, f = o(e.originalValue), p = o(e.value);
        return f === void 0 && p === void 0 ? void 0 : K(p) ? p : K(f) ? f : u || !u && p ? c ? this._mergeProps(c, f, p) : k(k({}, f), p) : p;
      }
      return o(e);
    },
    _useGlobalPT: function(e, n, i) {
      return this._usePT(this.globalPT, e, n, i);
    },
    _useDefaultPT: function(e, n, i) {
      return this._usePT(this.defaultPT, e, n, i);
    },
    ptm: function() {
      var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
      return this._getPTValue(this.pt, e, k(k({}, this.$params), n));
    },
    ptmi: function() {
      var e, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", i = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, r = w(this.$_attrsWithoutPT, this.ptm(n, i));
      return r?.hasOwnProperty("id") && ((e = r.id) !== null && e !== void 0 || (r.id = this.$id)), r;
    },
    ptmo: function() {
      var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", i = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
      return this._getPTValue(e, n, k({
        instance: this
      }, i), !1);
    },
    cx: function() {
      var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
      return this.isUnstyled ? void 0 : this._getOptionValue(this.$style.classes, e, k(k({}, this.$params), n));
    },
    sx: function() {
      var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0, i = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
      if (n) {
        var r = this._getOptionValue(this.$style.inlineStyles, e, k(k({}, this.$params), i)), o = this._getOptionValue(an.inlineStyles, e, k(k({}, this.$params), i));
        return [o, r];
      }
    }
  },
  computed: {
    globalPT: function() {
      var e, n = this;
      return this._getPT((e = this.$primevueConfig) === null || e === void 0 ? void 0 : e.pt, void 0, function(i) {
        return G(i, {
          instance: n
        });
      });
    },
    defaultPT: function() {
      var e, n = this;
      return this._getPT((e = this.$primevueConfig) === null || e === void 0 ? void 0 : e.pt, void 0, function(i) {
        return n._getOptionValue(i, n.$name, k({}, n.$params)) || G(i, k({}, n.$params));
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
      return Object.fromEntries(Object.entries(this.$props).filter(function(i) {
        var r = xe(i, 1), o = r[0];
        return n?.includes(o);
      }));
    },
    $theme: function() {
      var e;
      return (e = this.$primevueConfig) === null || e === void 0 ? void 0 : e.theme;
    },
    $style: function() {
      return k(k({
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
        var n = xe(e, 1), i = n[0];
        return i?.startsWith("pt:");
      }).reduce(function(e, n) {
        var i = xe(n, 2), r = i[0], o = i[1], s = r.split(":"), l = to(s), a = bt(l).slice(1);
        return a?.reduce(function(u, d, c, f) {
          return !u[d] && (u[d] = c === f.length - 1 ? o : {}), u[d];
        }, e), e;
      }, {});
    },
    $_attrsWithoutPT: function() {
      return Object.entries(this.$attrs || {}).filter(function(e) {
        var n = xe(e, 1), i = n[0];
        return !(i != null && i.startsWith("pt:"));
      }).reduce(function(e, n) {
        var i = xe(n, 2), r = i[0], o = i[1];
        return e[r] = o, e;
      }, {});
    }
  }
}, ao = `
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
`, so = E.extend({
  name: "baseicon",
  css: ao
});
function De(t) {
  "@babel/helpers - typeof";
  return De = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, De(t);
}
function ln(t, e) {
  var n = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var i = Object.getOwnPropertySymbols(t);
    e && (i = i.filter(function(r) {
      return Object.getOwnPropertyDescriptor(t, r).enumerable;
    })), n.push.apply(n, i);
  }
  return n;
}
function un(t) {
  for (var e = 1; e < arguments.length; e++) {
    var n = arguments[e] != null ? arguments[e] : {};
    e % 2 ? ln(Object(n), !0).forEach(function(i) {
      lo(t, i, n[i]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(n)) : ln(Object(n)).forEach(function(i) {
      Object.defineProperty(t, i, Object.getOwnPropertyDescriptor(n, i));
    });
  }
  return t;
}
function lo(t, e, n) {
  return (e = uo(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function uo(t) {
  var e = co(t, "string");
  return De(e) == "symbol" ? e : e + "";
}
function co(t, e) {
  if (De(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var i = n.call(t, e);
    if (De(i) != "object") return i;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var _e = {
  name: "BaseIcon",
  extends: qe,
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
  style: so,
  provide: function() {
    return {
      $pcIcon: this,
      $parentInstance: this
    };
  },
  methods: {
    pti: function() {
      var e = Ge(this.label);
      return un(un({}, !this.isUnstyled && {
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
function Re(t) {
  "@babel/helpers - typeof";
  return Re = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, Re(t);
}
function dn(t, e) {
  return mo(t) || ho(t, e) || po(t, e) || fo();
}
function fo() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function po(t, e) {
  if (t) {
    if (typeof t == "string") return cn(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? cn(t, e) : void 0;
  }
}
function cn(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, i = Array(e); n < e; n++) i[n] = t[n];
  return i;
}
function ho(t, e) {
  var n = t == null ? null : typeof Symbol < "u" && t[Symbol.iterator] || t["@@iterator"];
  if (n != null) {
    var i, r, o, s, l = [], a = !0, u = !1;
    try {
      if (o = (n = n.call(t)).next, e !== 0) for (; !(a = (i = o.call(n)).done) && (l.push(i.value), l.length !== e); a = !0) ;
    } catch (d) {
      u = !0, r = d;
    } finally {
      try {
        if (!a && n.return != null && (s = n.return(), Object(s) !== s)) return;
      } finally {
        if (u) throw r;
      }
    }
    return l;
  }
}
function mo(t) {
  if (Array.isArray(t)) return t;
}
function fn(t, e) {
  var n = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var i = Object.getOwnPropertySymbols(t);
    e && (i = i.filter(function(r) {
      return Object.getOwnPropertyDescriptor(t, r).enumerable;
    })), n.push.apply(n, i);
  }
  return n;
}
function L(t) {
  for (var e = 1; e < arguments.length; e++) {
    var n = arguments[e] != null ? arguments[e] : {};
    e % 2 ? fn(Object(n), !0).forEach(function(i) {
      St(t, i, n[i]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(n)) : fn(Object(n)).forEach(function(i) {
      Object.defineProperty(t, i, Object.getOwnPropertyDescriptor(n, i));
    });
  }
  return t;
}
function St(t, e, n) {
  return (e = go(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function go(t) {
  var e = vo(t, "string");
  return Re(e) == "symbol" ? e : e + "";
}
function vo(t, e) {
  if (Re(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var i = n.call(t, e);
    if (Re(i) != "object") return i;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var C = {
  _getMeta: function() {
    return [re(arguments.length <= 0 ? void 0 : arguments[0]) || arguments.length <= 0 ? void 0 : arguments[0], G(re(arguments.length <= 0 ? void 0 : arguments[0]) ? arguments.length <= 0 ? void 0 : arguments[0] : arguments.length <= 1 ? void 0 : arguments[1])];
  },
  _getConfig: function(e, n) {
    var i, r, o;
    return (i = (e == null || (r = e.instance) === null || r === void 0 ? void 0 : r.$primevue) || (n == null || (o = n.ctx) === null || o === void 0 || (o = o.appContext) === null || o === void 0 || (o = o.config) === null || o === void 0 || (o = o.globalProperties) === null || o === void 0 ? void 0 : o.$primevue)) === null || i === void 0 ? void 0 : i.config;
  },
  _getOptionValue: Pt,
  _getPTValue: function() {
    var e, n, i = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, o = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : "", s = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : {}, l = arguments.length > 4 && arguments[4] !== void 0 ? arguments[4] : !0, a = function() {
      var b = C._getOptionValue.apply(C, arguments);
      return K(b) || _n(b) ? {
        class: b
      } : b;
    }, u = ((e = i.binding) === null || e === void 0 || (e = e.value) === null || e === void 0 ? void 0 : e.ptOptions) || ((n = i.$primevueConfig) === null || n === void 0 ? void 0 : n.ptOptions) || {}, d = u.mergeSections, c = d === void 0 ? !0 : d, f = u.mergeProps, p = f === void 0 ? !1 : f, m = l ? C._useDefaultPT(i, i.defaultPT(), a, o, s) : void 0, v = C._usePT(i, C._getPT(r, i.$name), a, o, L(L({}, s), {}, {
      global: m || {}
    })), g = C._getPTDatasets(i, o);
    return c || !c && v ? p ? C._mergeProps(i, p, m, v, g) : L(L(L({}, m), v), g) : L(L({}, v), g);
  },
  _getPTDatasets: function() {
    var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", i = "data-pc-";
    return L(L({}, n === "root" && St({}, "".concat(i, "name"), ie(e.$name))), {}, St({}, "".concat(i, "section"), ie(n)));
  },
  _getPT: function(e) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", i = arguments.length > 2 ? arguments[2] : void 0, r = function(s) {
      var l, a = i ? i(s) : s, u = ie(n);
      return (l = a?.[u]) !== null && l !== void 0 ? l : a;
    };
    return e && Object.hasOwn(e, "_usept") ? {
      _usept: e._usept,
      originalValue: r(e.originalValue),
      value: r(e.value)
    } : r(e);
  },
  _usePT: function() {
    var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 ? arguments[1] : void 0, i = arguments.length > 2 ? arguments[2] : void 0, r = arguments.length > 3 ? arguments[3] : void 0, o = arguments.length > 4 ? arguments[4] : void 0, s = function(g) {
      return i(g, r, o);
    };
    if (n && Object.hasOwn(n, "_usept")) {
      var l, a = n._usept || ((l = e.$primevueConfig) === null || l === void 0 ? void 0 : l.ptOptions) || {}, u = a.mergeSections, d = u === void 0 ? !0 : u, c = a.mergeProps, f = c === void 0 ? !1 : c, p = s(n.originalValue), m = s(n.value);
      return p === void 0 && m === void 0 ? void 0 : K(m) ? m : K(p) ? p : d || !d && m ? f ? C._mergeProps(e, f, p, m) : L(L({}, p), m) : m;
    }
    return s(n);
  },
  _useDefaultPT: function() {
    var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, i = arguments.length > 2 ? arguments[2] : void 0, r = arguments.length > 3 ? arguments[3] : void 0, o = arguments.length > 4 ? arguments[4] : void 0;
    return C._usePT(e, n, i, r, o);
  },
  _loadStyles: function() {
    var e, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, i = arguments.length > 1 ? arguments[1] : void 0, r = arguments.length > 2 ? arguments[2] : void 0, o = C._getConfig(i, r), s = {
      nonce: o == null || (e = o.csp) === null || e === void 0 ? void 0 : e.nonce
    };
    C._loadCoreStyles(n, s), C._loadThemeStyles(n, s), C._loadScopedThemeStyles(n, s), C._removeThemeListeners(n), n.$loadStyles = function() {
      return C._loadThemeStyles(n, s);
    }, C._themeChangeListener(n.$loadStyles);
  },
  _loadCoreStyles: function() {
    var e, n, i = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, r = arguments.length > 1 ? arguments[1] : void 0;
    if (!de.isStyleNameLoaded((e = i.$style) === null || e === void 0 ? void 0 : e.name) && (n = i.$style) !== null && n !== void 0 && n.name) {
      var o;
      E.loadCSS(r), (o = i.$style) === null || o === void 0 || o.loadCSS(r), de.setLoadedStyleName(i.$style.name);
    }
  },
  _loadThemeStyles: function() {
    var e, n, i, r = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, o = arguments.length > 1 ? arguments[1] : void 0;
    if (!(r != null && r.isUnstyled() || (r == null || (e = r.theme) === null || e === void 0 ? void 0 : e.call(r)) === "none")) {
      if (!A.isStyleNameLoaded("common")) {
        var s, l, a = ((s = r.$style) === null || s === void 0 || (l = s.getCommonTheme) === null || l === void 0 ? void 0 : l.call(s)) || {}, u = a.primitive, d = a.semantic, c = a.global, f = a.style;
        E.load(u?.css, L({
          name: "primitive-variables"
        }, o)), E.load(d?.css, L({
          name: "semantic-variables"
        }, o)), E.load(c?.css, L({
          name: "global-variables"
        }, o)), E.loadStyle(L({
          name: "global-style"
        }, o), f), A.setLoadedStyleName("common");
      }
      if (!A.isStyleNameLoaded((n = r.$style) === null || n === void 0 ? void 0 : n.name) && (i = r.$style) !== null && i !== void 0 && i.name) {
        var p, m, v, g, y = ((p = r.$style) === null || p === void 0 || (m = p.getDirectiveTheme) === null || m === void 0 ? void 0 : m.call(p)) || {}, b = y.css, O = y.style;
        (v = r.$style) === null || v === void 0 || v.load(b, L({
          name: "".concat(r.$style.name, "-variables")
        }, o)), (g = r.$style) === null || g === void 0 || g.loadStyle(L({
          name: "".concat(r.$style.name, "-style")
        }, o), O), A.setLoadedStyleName(r.$style.name);
      }
      if (!A.isStyleNameLoaded("layer-order")) {
        var h, S, T = (h = r.$style) === null || h === void 0 || (S = h.getLayerOrderThemeCSS) === null || S === void 0 ? void 0 : S.call(h);
        E.load(T, L({
          name: "layer-order",
          first: !0
        }, o)), A.setLoadedStyleName("layer-order");
      }
    }
  },
  _loadScopedThemeStyles: function() {
    var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 ? arguments[1] : void 0, i = e.preset();
    if (i && e.$attrSelector) {
      var r, o, s, l = ((r = e.$style) === null || r === void 0 || (o = r.getPresetTheme) === null || o === void 0 ? void 0 : o.call(r, i, "[".concat(e.$attrSelector, "]"))) || {}, a = l.css, u = (s = e.$style) === null || s === void 0 ? void 0 : s.load(a, L({
        name: "".concat(e.$attrSelector, "-").concat(e.$style.name)
      }, n));
      e.scopedStyleEl = u.el;
    }
  },
  _themeChangeListener: function() {
    var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : function() {
    };
    de.clearLoadedStyleNames(), D.on("theme:change", e);
  },
  _removeThemeListeners: function() {
    var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    D.off("theme:change", e.$loadStyles), e.$loadStyles = void 0;
  },
  _hook: function(e, n, i, r, o, s) {
    var l, a, u = "on".concat(Gi(n)), d = C._getConfig(r, o), c = i?.$instance, f = C._usePT(c, C._getPT(r == null || (l = r.value) === null || l === void 0 ? void 0 : l.pt, e), C._getOptionValue, "hooks.".concat(u)), p = C._useDefaultPT(c, d == null || (a = d.pt) === null || a === void 0 || (a = a.directives) === null || a === void 0 ? void 0 : a[e], C._getOptionValue, "hooks.".concat(u)), m = {
      el: i,
      binding: r,
      vnode: o,
      prevVnode: s
    };
    f?.(c, m), p?.(c, m);
  },
  /* eslint-disable-next-line no-unused-vars */
  _mergeProps: function() {
    for (var e = arguments.length > 1 ? arguments[1] : void 0, n = arguments.length, i = new Array(n > 2 ? n - 2 : 0), r = 2; r < n; r++)
      i[r - 2] = arguments[r];
    return at(e) ? e.apply(void 0, i) : w.apply(void 0, i);
  },
  _extend: function(e) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, i = function(l, a, u, d, c) {
      var f, p, m, v;
      a._$instances = a._$instances || {};
      var g = C._getConfig(u, d), y = a._$instances[e] || {}, b = Ge(y) ? L(L({}, n), n?.methods) : {};
      a._$instances[e] = L(L({}, y), {}, {
        /* new instance variables to pass in directive methods */
        $name: e,
        $host: a,
        $binding: u,
        $modifiers: u?.modifiers,
        $value: u?.value,
        $el: y.$el || a || void 0,
        $style: L({
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
        $attrSelector: (f = a.$pd) === null || f === void 0 || (f = f[e]) === null || f === void 0 ? void 0 : f.attrSelector,
        /* computed instance variables */
        defaultPT: function() {
          return C._getPT(g?.pt, void 0, function(h) {
            var S;
            return h == null || (S = h.directives) === null || S === void 0 ? void 0 : S[e];
          });
        },
        isUnstyled: function() {
          var h, S;
          return ((h = a._$instances[e]) === null || h === void 0 || (h = h.$binding) === null || h === void 0 || (h = h.value) === null || h === void 0 ? void 0 : h.unstyled) !== void 0 ? (S = a._$instances[e]) === null || S === void 0 || (S = S.$binding) === null || S === void 0 || (S = S.value) === null || S === void 0 ? void 0 : S.unstyled : g?.unstyled;
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
          var h, S = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", T = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
          return C._getPTValue(a._$instances[e], (h = a._$instances[e]) === null || h === void 0 || (h = h.$binding) === null || h === void 0 || (h = h.value) === null || h === void 0 ? void 0 : h.pt, S, L({}, T));
        },
        ptmo: function() {
          var h = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, S = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", T = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
          return C._getPTValue(a._$instances[e], h, S, T, !1);
        },
        cx: function() {
          var h, S, T = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", $ = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
          return (h = a._$instances[e]) !== null && h !== void 0 && h.isUnstyled() ? void 0 : C._getOptionValue((S = a._$instances[e]) === null || S === void 0 || (S = S.$style) === null || S === void 0 ? void 0 : S.classes, T, L({}, $));
        },
        sx: function() {
          var h, S = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", T = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0, $ = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
          return T ? C._getOptionValue((h = a._$instances[e]) === null || h === void 0 || (h = h.$style) === null || h === void 0 ? void 0 : h.inlineStyles, S, L({}, $)) : void 0;
        }
      }, b), a.$instance = a._$instances[e], (p = (m = a.$instance)[l]) === null || p === void 0 || p.call(m, a, u, d, c), a["$".concat(e)] = a.$instance, C._hook(e, l, a, u, d, c), a.$pd || (a.$pd = {}), a.$pd[e] = L(L({}, (v = a.$pd) === null || v === void 0 ? void 0 : v[e]), {}, {
        name: e,
        instance: a._$instances[e]
      });
    }, r = function(l) {
      var a, u, d, c = l._$instances[e], f = c?.watch, p = function(g) {
        var y, b = g.newValue, O = g.oldValue;
        return f == null || (y = f.config) === null || y === void 0 ? void 0 : y.call(c, b, O);
      }, m = function(g) {
        var y, b = g.newValue, O = g.oldValue;
        return f == null || (y = f["config.ripple"]) === null || y === void 0 ? void 0 : y.call(c, b, O);
      };
      c.$watchersCallback = {
        config: p,
        "config.ripple": m
      }, f == null || (a = f.config) === null || a === void 0 || a.call(c, c?.$primevueConfig), ce.on("config:change", p), f == null || (u = f["config.ripple"]) === null || u === void 0 || u.call(c, c == null || (d = c.$primevueConfig) === null || d === void 0 ? void 0 : d.ripple), ce.on("config:ripple:change", m);
    }, o = function(l) {
      var a = l._$instances[e].$watchersCallback;
      a && (ce.off("config:change", a.config), ce.off("config:ripple:change", a["config.ripple"]), l._$instances[e].$watchersCallback = void 0);
    };
    return {
      created: function(l, a, u, d) {
        l.$pd || (l.$pd = {}), l.$pd[e] = {
          name: e,
          attrSelector: hr("pd")
        }, i("created", l, a, u, d);
      },
      beforeMount: function(l, a, u, d) {
        var c;
        C._loadStyles((c = l.$pd[e]) === null || c === void 0 ? void 0 : c.instance, a, u), i("beforeMount", l, a, u, d), r(l);
      },
      mounted: function(l, a, u, d) {
        var c;
        C._loadStyles((c = l.$pd[e]) === null || c === void 0 ? void 0 : c.instance, a, u), i("mounted", l, a, u, d);
      },
      beforeUpdate: function(l, a, u, d) {
        i("beforeUpdate", l, a, u, d);
      },
      updated: function(l, a, u, d) {
        var c;
        C._loadStyles((c = l.$pd[e]) === null || c === void 0 ? void 0 : c.instance, a, u), i("updated", l, a, u, d);
      },
      beforeUnmount: function(l, a, u, d) {
        var c;
        o(l), C._removeThemeListeners((c = l.$pd[e]) === null || c === void 0 ? void 0 : c.instance), i("beforeUnmount", l, a, u, d);
      },
      unmounted: function(l, a, u, d) {
        var c;
        (c = l.$pd[e]) === null || c === void 0 || (c = c.instance) === null || c === void 0 || (c = c.scopedStyleEl) === null || c === void 0 || (c = c.value) === null || c === void 0 || c.remove(), i("unmounted", l, a, u, d);
      }
    };
  },
  extend: function() {
    var e = C._getMeta.apply(C, arguments), n = dn(e, 2), i = n[0], r = n[1];
    return L({
      extend: function() {
        var s = C._getMeta.apply(C, arguments), l = dn(s, 2), a = l[0], u = l[1];
        return C.extend(a, L(L(L({}, r), r?.methods), u));
      }
    }, C._extend(i, r));
  }
}, yo = `
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
`, bo = {
  root: "p-ink"
}, So = E.extend({
  name: "ripple-directive",
  style: yo,
  classes: bo
}), wo = C.extend({
  style: So
});
function Be(t) {
  "@babel/helpers - typeof";
  return Be = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, Be(t);
}
function Oo(t) {
  return To(t) || Io(t) || Co(t) || $o();
}
function $o() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Co(t, e) {
  if (t) {
    if (typeof t == "string") return wt(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? wt(t, e) : void 0;
  }
}
function Io(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function To(t) {
  if (Array.isArray(t)) return wt(t);
}
function wt(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, i = Array(e); n < e; n++) i[n] = t[n];
  return i;
}
function pn(t, e, n) {
  return (e = ko(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function ko(t) {
  var e = Lo(t, "string");
  return Be(e) == "symbol" ? e : e + "";
}
function Lo(t, e) {
  if (Be(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var i = n.call(t, e);
    if (Be(i) != "object") return i;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var _o = wo.extend("ripple", {
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
      n || (n = ir("span", pn(pn({
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
      var n = this, i = e.currentTarget, r = this.getInk(i);
      if (!(!r || getComputedStyle(r, null).display === "none")) {
        if (!this.isUnstyled() && je(r, "p-ink-active"), r.setAttribute("data-p-ink-active", "false"), !ge(r) && !ve(r)) {
          var o = Math.max(En(i), ur(i));
          r.style.height = o + "px", r.style.width = o + "px";
        }
        var s = lr(i), l = e.pageX - s.left + document.body.scrollTop - ve(r) / 2, a = e.pageY - s.top + document.body.scrollLeft - ge(r) / 2;
        r.style.top = a + "px", r.style.left = l + "px", !this.isUnstyled() && ht(r, "p-ink-active"), r.setAttribute("data-p-ink-active", "true"), this.timeout = setTimeout(function() {
          r && (!n.isUnstyled() && je(r, "p-ink-active"), r.setAttribute("data-p-ink-active", "false"));
        }, 401);
      }
    },
    onAnimationEnd: function(e) {
      this.timeout && clearTimeout(this.timeout), !this.isUnstyled() && je(e.currentTarget, "p-ink-active"), e.currentTarget.setAttribute("data-p-ink-active", "false");
    },
    getInk: function(e) {
      return e && e.children ? Oo(e.children).find(function(n) {
        return or(n, "data-pc-name") === "ripple";
      }) : void 0;
    }
  }
});
function He(t) {
  "@babel/helpers - typeof";
  return He = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, He(t);
}
function xo(t, e) {
  if (!(t instanceof e)) throw new TypeError("Cannot call a class as a function");
}
function Po(t, e) {
  for (var n = 0; n < e.length; n++) {
    var i = e[n];
    i.enumerable = i.enumerable || !1, i.configurable = !0, "value" in i && (i.writable = !0), Object.defineProperty(t, Eo(i.key), i);
  }
}
function Ao(t, e, n) {
  return e && Po(t.prototype, e), Object.defineProperty(t, "prototype", { writable: !1 }), t;
}
function Eo(t) {
  var e = jo(t, "string");
  return He(e) == "symbol" ? e : e + "";
}
function jo(t, e) {
  if (He(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var i = n.call(t, e);
    if (He(i) != "object") return i;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return String(t);
}
var Mo = /* @__PURE__ */ (function() {
  function t(e) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : function() {
    };
    xo(this, t), this.element = e, this.listener = n;
  }
  return Ao(t, [{
    key: "bindScrollListener",
    value: function() {
      this.scrollableParents = dr(this.element);
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
})(), Vo = At();
const Fo = "data-wippy-overlay-layer";
function Gn() {
  return typeof window < "u" && typeof window.document < "u";
}
function qn() {
  return Gn() && typeof HTMLElement < "u" && Object.hasOwn(HTMLElement.prototype, "popover");
}
function zo() {
  return qn() && typeof CSS < "u" && typeof CSS.supports == "function" && CSS.supports("anchor-name: --a") && CSS.supports("position-area", "bottom span-right") && CSS.supports("position-try-fallbacks", "flip-block") && CSS.supports("min-width", "min(anchor-size(width), 100vw)") && CSS.supports("max-width", "stretch");
}
const No = /\bp-(?:select|multiselect|treeselect|cascadeselect)-overlay\b/;
let Do = 0;
const rt = /* @__PURE__ */ new WeakMap();
function hn(t, e) {
  const n = t.style;
  n.setProperty("position", "fixed", "important"), n.setProperty("inset", "auto", "important"), n.setProperty("margin", "0", "important"), n.setProperty("position-anchor", e), n.setProperty("position-area", "bottom span-right"), n.setProperty("position-try-fallbacks", "flip-block, flip-inline, flip-block flip-inline"), n.setProperty("min-width", "min(anchor-size(width), 100vw)", "important"), n.setProperty("max-width", "stretch", "important");
}
function Ro(t, e) {
  if (!No.test(t.className))
    return;
  const n = t.style.cssText;
  hn(t, e), t.getAttribute("popover") !== "manual" && t.setAttribute("popover", "manual");
  try {
    t.matches(":popover-open") || t.showPopover();
  } catch {
  }
  if (!t.matches(":popover-open")) {
    t.removeAttribute("popover"), t.style.cssText = n;
    return;
  }
  if (!rt.has(t)) {
    const i = new MutationObserver(() => {
      const r = t.style;
      (r.top !== "auto" || r.left !== "auto" || r.margin !== "0px" || r.getPropertyPriority("top") !== "important" || r.getPropertyPriority("left") !== "important" || r.getPropertyPriority("margin") !== "important" || r.getPropertyPriority("min-width") !== "important" || r.maxWidth !== "stretch" || r.getPropertyPriority("max-width") !== "important") && hn(t, e);
    });
    i.observe(t, { attributes: !0, attributeFilter: ["style"] }), rt.set(t, i);
  }
}
function Mt(t) {
  const e = rt.get(t);
  e && (e.disconnect(), rt.delete(t));
}
function Bo(t) {
  const e = t && typeof t.getRootNode == "function" ? t.getRootNode() : null;
  return e instanceof ShadowRoot ? e : null;
}
function Ot(t) {
  t.style.top = "0px", t.style.left = "0px";
  const e = t.getBoundingClientRect();
  t.style.top = `${-window.scrollY - e.top}px`, t.style.left = `${-window.scrollX - e.left}px`;
}
const ot = /* @__PURE__ */ new Set(), Vt = /* @__PURE__ */ new WeakMap();
let mn = !1, $t = !1;
function Ho() {
  $t = !1;
  for (const t of ot) {
    if (!t.isConnected) {
      for (const e of Array.from(t.children))
        e instanceof HTMLElement && Mt(e);
      ot.delete(t), Vt.get(t)?.disconnect();
      continue;
    }
    t.childElementCount > 0 && Ot(t);
  }
}
function gn() {
  $t || ($t = !0, requestAnimationFrame(Ho));
}
function Ko(t) {
  const e = document.createElement("div");
  e.setAttribute(Fo, "");
  const n = qn();
  if (e.style.cssText = n ? "position:fixed;width:0 !important;height:0 !important;margin:0 !important;border:0 !important;padding:0 !important;background:transparent !important;color:inherit !important;overflow:visible !important;" : "position:fixed;top:0;left:0;width:0;height:0;", n && e.setAttribute("popover", "manual"), t.appendChild(e), n) {
    try {
      e.showPopover();
    } catch {
    }
    e.matches(":popover-open") || (e.removeAttribute("popover"), e.style.cssText = "position:fixed;top:0;left:0;width:0;height:0;");
  }
  Ot(e);
  const i = new MutationObserver((r) => {
    const o = e.__wippyAnchorName;
    for (const s of r) {
      if (o)
        for (const l of Array.from(s.addedNodes))
          l instanceof HTMLElement && Ro(l, o);
      for (const l of Array.from(s.removedNodes))
        l instanceof HTMLElement && Mt(l);
    }
    e.isConnected && e.childElementCount > 0 && Ot(e);
  });
  return i.observe(e, { childList: !0 }), Vt.set(e, i), ot.add(e), mn || (mn = !0, window.addEventListener("scroll", gn, { capture: !0, passive: !0 }), window.addEventListener("resize", gn, { passive: !0 })), e;
}
function vn(t) {
  if (!(!t.hostRoot || t.layer) && (t.layer = Ko(t.hostRoot), zo())) {
    const e = t.$el ? t.$el.parentElement : null;
    e && (t.anchorName = `--wippy-a-${++Do}`, t.anchorTrigger = e, e.style.setProperty("anchor-name", t.anchorName), t.layer.__wippyAnchorName = t.anchorName);
  }
}
function yn(t) {
  if (t.anchorTrigger && (t.anchorTrigger.style.removeProperty("anchor-name"), t.anchorTrigger = null), t.anchorName = null, t.layer) {
    for (const e of Array.from(t.layer.children))
      e instanceof HTMLElement && Mt(e);
    ot.delete(t.layer), Vt.get(t.layer)?.disconnect(), t.layer.remove(), t.layer = null;
  }
}
let bn = !1;
function Wo() {
  if (bn)
    return;
  bn = !0;
  const t = jt;
  t.computed = t.computed || {}, t.computed.inline = function() {
    return !!this.disabled || this.appendTo === "self";
  }, t.computed.resolvedTarget = function() {
    return this.appendTo == null || this.appendTo === "body" ? this.hostRoot ? this.layer : document.body : this.appendTo;
  }, t.data = function() {
    return { mounted: !1, hostRoot: null, layer: null, anchorName: null, anchorTrigger: null };
  }, t.mounted = function() {
    Gn() && (this.hostRoot = Bo(this.$el), this.mounted = !0, this.hostRoot && (this.inline || vn(this), this.$watch("inline", (e) => {
      e ? yn(this) : vn(this);
    })));
  }, t.render = function() {
    return this.inline ? M(this.$slots, "default", { key: 0 }) : this.mounted ? Li(Tn, { key: 1, to: this.resolvedTarget || document.body }, [
      M(this.$slots, "default")
    ]) : Q("", !0);
  }, t.unmounted = function() {
    yn(this);
  };
}
const Ts = {
  install: (t) => {
    Wo(), t.use(Jr, { theme: "none" });
  }
};
var Ft = {
  name: "SpinnerIcon",
  extends: _e
};
function Uo(t) {
  return Zo(t) || Yo(t) || qo(t) || Go();
}
function Go() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function qo(t, e) {
  if (t) {
    if (typeof t == "string") return Ct(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Ct(t, e) : void 0;
  }
}
function Yo(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function Zo(t) {
  if (Array.isArray(t)) return Ct(t);
}
function Ct(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, i = Array(e); n < e; n++) i[n] = t[n];
  return i;
}
function Qo(t, e, n, i, r, o) {
  return I(), P("svg", w({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, t.pti()), Uo(e[0] || (e[0] = [B("path", {
    d: "M6.99701 14C5.85441 13.999 4.72939 13.7186 3.72012 13.1832C2.71084 12.6478 1.84795 11.8737 1.20673 10.9284C0.565504 9.98305 0.165424 8.89526 0.041387 7.75989C-0.0826496 6.62453 0.073125 5.47607 0.495122 4.4147C0.917119 3.35333 1.59252 2.4113 2.46241 1.67077C3.33229 0.930247 4.37024 0.413729 5.4857 0.166275C6.60117 -0.0811796 7.76026 -0.0520535 8.86188 0.251112C9.9635 0.554278 10.9742 1.12227 11.8057 1.90555C11.915 2.01493 11.9764 2.16319 11.9764 2.31778C11.9764 2.47236 11.915 2.62062 11.8057 2.73C11.7521 2.78503 11.688 2.82877 11.6171 2.85864C11.5463 2.8885 11.4702 2.90389 11.3933 2.90389C11.3165 2.90389 11.2404 2.8885 11.1695 2.85864C11.0987 2.82877 11.0346 2.78503 10.9809 2.73C9.9998 1.81273 8.73246 1.26138 7.39226 1.16876C6.05206 1.07615 4.72086 1.44794 3.62279 2.22152C2.52471 2.99511 1.72683 4.12325 1.36345 5.41602C1.00008 6.70879 1.09342 8.08723 1.62775 9.31926C2.16209 10.5513 3.10478 11.5617 4.29713 12.1803C5.48947 12.7989 6.85865 12.988 8.17414 12.7157C9.48963 12.4435 10.6711 11.7264 11.5196 10.6854C12.3681 9.64432 12.8319 8.34282 12.8328 7C12.8328 6.84529 12.8943 6.69692 13.0038 6.58752C13.1132 6.47812 13.2616 6.41667 13.4164 6.41667C13.5712 6.41667 13.7196 6.47812 13.8291 6.58752C13.9385 6.69692 14 6.84529 14 7C14 8.85651 13.2622 10.637 11.9489 11.9497C10.6356 13.2625 8.85432 14 6.99701 14Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
Ft.render = Qo;
var Yn = {
  name: "TimesIcon",
  extends: _e
};
function Jo(t) {
  return na(t) || ta(t) || ea(t) || Xo();
}
function Xo() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function ea(t, e) {
  if (t) {
    if (typeof t == "string") return It(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? It(t, e) : void 0;
  }
}
function ta(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function na(t) {
  if (Array.isArray(t)) return It(t);
}
function It(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, i = Array(e); n < e; n++) i[n] = t[n];
  return i;
}
function ia(t, e, n, i, r, o) {
  return I(), P("svg", w({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, t.pti()), Jo(e[0] || (e[0] = [B("path", {
    d: "M8.01186 7.00933L12.27 2.75116C12.341 2.68501 12.398 2.60524 12.4375 2.51661C12.4769 2.42798 12.4982 2.3323 12.4999 2.23529C12.5016 2.13827 12.4838 2.0419 12.4474 1.95194C12.4111 1.86197 12.357 1.78024 12.2884 1.71163C12.2198 1.64302 12.138 1.58893 12.0481 1.55259C11.9581 1.51625 11.8617 1.4984 11.7647 1.50011C11.6677 1.50182 11.572 1.52306 11.4834 1.56255C11.3948 1.60204 11.315 1.65898 11.2488 1.72997L6.99067 5.98814L2.7325 1.72997C2.59553 1.60234 2.41437 1.53286 2.22718 1.53616C2.03999 1.53946 1.8614 1.61529 1.72901 1.74767C1.59663 1.88006 1.5208 2.05865 1.5175 2.24584C1.5142 2.43303 1.58368 2.61419 1.71131 2.75116L5.96948 7.00933L1.71131 11.2675C1.576 11.403 1.5 11.5866 1.5 11.7781C1.5 11.9696 1.576 12.1532 1.71131 12.2887C1.84679 12.424 2.03043 12.5 2.2219 12.5C2.41338 12.5 2.59702 12.424 2.7325 12.2887L6.99067 8.03052L11.2488 12.2887C11.3843 12.424 11.568 12.5 11.7594 12.5C11.9509 12.5 12.1346 12.424 12.27 12.2887C12.4053 12.1532 12.4813 11.9696 12.4813 11.7781C12.4813 11.5866 12.4053 11.403 12.27 11.2675L8.01186 7.00933Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
Yn.render = ia;
var Zn = {
  name: "BlankIcon",
  extends: _e
};
function ra(t) {
  return la(t) || sa(t) || aa(t) || oa();
}
function oa() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function aa(t, e) {
  if (t) {
    if (typeof t == "string") return Tt(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Tt(t, e) : void 0;
  }
}
function sa(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function la(t) {
  if (Array.isArray(t)) return Tt(t);
}
function Tt(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, i = Array(e); n < e; n++) i[n] = t[n];
  return i;
}
function ua(t, e, n, i, r, o) {
  return I(), P("svg", w({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, t.pti()), ra(e[0] || (e[0] = [B("rect", {
    width: "1",
    height: "1",
    fill: "currentColor",
    "fill-opacity": "0"
  }, null, -1)])), 16);
}
Zn.render = ua;
var Qn = {
  name: "CheckIcon",
  extends: _e
};
function da(t) {
  return ha(t) || pa(t) || fa(t) || ca();
}
function ca() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function fa(t, e) {
  if (t) {
    if (typeof t == "string") return kt(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? kt(t, e) : void 0;
  }
}
function pa(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function ha(t) {
  if (Array.isArray(t)) return kt(t);
}
function kt(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, i = Array(e); n < e; n++) i[n] = t[n];
  return i;
}
function ma(t, e, n, i, r, o) {
  return I(), P("svg", w({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, t.pti()), da(e[0] || (e[0] = [B("path", {
    d: "M4.86199 11.5948C4.78717 11.5923 4.71366 11.5745 4.64596 11.5426C4.57826 11.5107 4.51779 11.4652 4.46827 11.4091L0.753985 7.69483C0.683167 7.64891 0.623706 7.58751 0.580092 7.51525C0.536478 7.44299 0.509851 7.36177 0.502221 7.27771C0.49459 7.19366 0.506156 7.10897 0.536046 7.03004C0.565935 6.95111 0.613367 6.88 0.674759 6.82208C0.736151 6.76416 0.8099 6.72095 0.890436 6.69571C0.970973 6.67046 1.05619 6.66385 1.13966 6.67635C1.22313 6.68886 1.30266 6.72017 1.37226 6.76792C1.44186 6.81567 1.4997 6.8786 1.54141 6.95197L4.86199 10.2503L12.6397 2.49483C12.7444 2.42694 12.8689 2.39617 12.9932 2.40745C13.1174 2.41873 13.2343 2.47141 13.3251 2.55705C13.4159 2.64268 13.4753 2.75632 13.4938 2.87973C13.5123 3.00315 13.4888 3.1292 13.4271 3.23768L5.2557 11.4091C5.20618 11.4652 5.14571 11.5107 5.07801 11.5426C5.01031 11.5745 4.9368 11.5923 4.86199 11.5948Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
Qn.render = ma;
var Jn = {
  name: "ChevronDownIcon",
  extends: _e
};
function ga(t) {
  return Sa(t) || ba(t) || ya(t) || va();
}
function va() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function ya(t, e) {
  if (t) {
    if (typeof t == "string") return Lt(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Lt(t, e) : void 0;
  }
}
function ba(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function Sa(t) {
  if (Array.isArray(t)) return Lt(t);
}
function Lt(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, i = Array(e); n < e; n++) i[n] = t[n];
  return i;
}
function wa(t, e, n, i, r, o) {
  return I(), P("svg", w({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, t.pti()), ga(e[0] || (e[0] = [B("path", {
    d: "M7.01744 10.398C6.91269 10.3985 6.8089 10.378 6.71215 10.3379C6.61541 10.2977 6.52766 10.2386 6.45405 10.1641L1.13907 4.84913C1.03306 4.69404 0.985221 4.5065 1.00399 4.31958C1.02276 4.13266 1.10693 3.95838 1.24166 3.82747C1.37639 3.69655 1.55301 3.61742 1.74039 3.60402C1.92777 3.59062 2.11386 3.64382 2.26584 3.75424L7.01744 8.47394L11.769 3.75424C11.9189 3.65709 12.097 3.61306 12.2748 3.62921C12.4527 3.64535 12.6199 3.72073 12.7498 3.84328C12.8797 3.96582 12.9647 4.12842 12.9912 4.30502C13.0177 4.48162 12.9841 4.662 12.8958 4.81724L7.58083 10.1322C7.50996 10.2125 7.42344 10.2775 7.32656 10.3232C7.22968 10.3689 7.12449 10.3944 7.01744 10.398Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
Jn.render = wa;
var Xn = {
  name: "SearchIcon",
  extends: _e
};
function Oa(t) {
  return Ta(t) || Ia(t) || Ca(t) || $a();
}
function $a() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Ca(t, e) {
  if (t) {
    if (typeof t == "string") return _t(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? _t(t, e) : void 0;
  }
}
function Ia(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function Ta(t) {
  if (Array.isArray(t)) return _t(t);
}
function _t(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, i = Array(e); n < e; n++) i[n] = t[n];
  return i;
}
function ka(t, e, n, i, r, o) {
  return I(), P("svg", w({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, t.pti()), Oa(e[0] || (e[0] = [B("path", {
    "fill-rule": "evenodd",
    "clip-rule": "evenodd",
    d: "M2.67602 11.0265C3.6661 11.688 4.83011 12.0411 6.02086 12.0411C6.81149 12.0411 7.59438 11.8854 8.32483 11.5828C8.87005 11.357 9.37808 11.0526 9.83317 10.6803L12.9769 13.8241C13.0323 13.8801 13.0983 13.9245 13.171 13.9548C13.2438 13.985 13.3219 14.0003 13.4007 14C13.4795 14.0003 13.5575 13.985 13.6303 13.9548C13.7031 13.9245 13.7691 13.8801 13.8244 13.8241C13.9367 13.7116 13.9998 13.5592 13.9998 13.4003C13.9998 13.2414 13.9367 13.089 13.8244 12.9765L10.6807 9.8328C11.053 9.37773 11.3573 8.86972 11.5831 8.32452C11.8857 7.59408 12.0414 6.81119 12.0414 6.02056C12.0414 4.8298 11.6883 3.66579 11.0268 2.67572C10.3652 1.68564 9.42494 0.913972 8.32483 0.45829C7.22472 0.00260857 6.01418 -0.116618 4.84631 0.115686C3.67844 0.34799 2.60568 0.921393 1.76369 1.76338C0.921698 2.60537 0.348296 3.67813 0.115991 4.84601C-0.116313 6.01388 0.00291375 7.22441 0.458595 8.32452C0.914277 9.42464 1.68595 10.3649 2.67602 11.0265ZM3.35565 2.0158C4.14456 1.48867 5.07206 1.20731 6.02086 1.20731C7.29317 1.20731 8.51338 1.71274 9.41304 2.6124C10.3127 3.51206 10.8181 4.73226 10.8181 6.00457C10.8181 6.95337 10.5368 7.88088 10.0096 8.66978C9.48251 9.45868 8.73328 10.0736 7.85669 10.4367C6.98011 10.7997 6.01554 10.8947 5.08496 10.7096C4.15439 10.5245 3.2996 10.0676 2.62869 9.39674C1.95778 8.72583 1.50089 7.87104 1.31579 6.94046C1.13068 6.00989 1.22568 5.04532 1.58878 4.16874C1.95187 3.29215 2.56675 2.54292 3.35565 2.0158Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
Xn.render = ka;
var La = `
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
`, _a = {
  root: "p-iconfield"
}, xa = E.extend({
  name: "iconfield",
  style: La,
  classes: _a
}), Pa = {
  name: "BaseIconField",
  extends: qe,
  style: xa,
  provide: function() {
    return {
      $pcIconField: this,
      $parentInstance: this
    };
  }
}, ei = {
  name: "IconField",
  extends: Pa,
  inheritAttrs: !1
};
function Aa(t, e, n, i, r, o) {
  return I(), P("div", w({
    class: t.cx("root")
  }, t.ptmi("root")), [M(t.$slots, "default")], 16);
}
ei.render = Aa;
var Ea = {
  root: "p-inputicon"
}, ja = E.extend({
  name: "inputicon",
  classes: Ea
}), Ma = {
  name: "BaseInputIcon",
  extends: qe,
  style: ja,
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
  extends: Ma,
  inheritAttrs: !1,
  computed: {
    containerClass: function() {
      return [this.cx("root"), this.class];
    }
  }
};
function Va(t, e, n, i, r, o) {
  return I(), P("span", w({
    class: o.containerClass
  }, t.ptmi("root"), {
    "aria-hidden": "true"
  }), [M(t.$slots, "default")], 16);
}
ti.render = Va;
var Fa = {
  name: "BaseEditableHolder",
  extends: qe,
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
        var n, i;
        this.formField = ((n = this.$pcForm) === null || n === void 0 || (i = n.register) === null || i === void 0 ? void 0 : i.call(n, e, this.$formControl)) || {};
      }
    },
    $formControl: {
      immediate: !0,
      handler: function(e) {
        var n, i;
        this.formField = ((n = this.$pcForm) === null || n === void 0 || (i = n.register) === null || i === void 0 ? void 0 : i.call(n, this.$formName, e)) || {};
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
      var i, r;
      this.controlled && (this.d_value = e, this.$emit("update:modelValue", e)), this.$emit("value-change", e), (i = (r = this.formField).onChange) === null || i === void 0 || i.call(r, {
        originalEvent: n,
        value: e
      });
    },
    // @todo move to @primeuix/utils
    findNonEmpty: function() {
      for (var e = arguments.length, n = new Array(e), i = 0; i < e; i++)
        n[i] = arguments[i];
      return n.find(x);
    }
  },
  computed: {
    $filled: function() {
      return x(this.d_value);
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
}, ni = {
  name: "BaseInput",
  extends: Fa,
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
}, za = `
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
`, Na = {
  root: function(e) {
    var n = e.instance, i = e.props;
    return ["p-inputtext p-component", {
      "p-filled": n.$filled,
      "p-inputtext-sm p-inputfield-sm": i.size === "small",
      "p-inputtext-lg p-inputfield-lg": i.size === "large",
      "p-invalid": n.$invalid,
      "p-variant-filled": n.$variant === "filled",
      "p-inputtext-fluid": n.$fluid
    }];
  }
}, Da = E.extend({
  name: "inputtext",
  style: za,
  classes: Na
}), Ra = {
  name: "BaseInputText",
  extends: ni,
  style: Da,
  provide: function() {
    return {
      $pcInputText: this,
      $parentInstance: this
    };
  }
};
function Ke(t) {
  "@babel/helpers - typeof";
  return Ke = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, Ke(t);
}
function Ba(t, e, n) {
  return (e = Ha(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function Ha(t) {
  var e = Ka(t, "string");
  return Ke(e) == "symbol" ? e : e + "";
}
function Ka(t, e) {
  if (Ke(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var i = n.call(t, e);
    if (Ke(i) != "object") return i;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var ii = {
  name: "InputText",
  extends: Ra,
  inheritAttrs: !1,
  methods: {
    onInput: function(e) {
      this.writeValue(e.target.value, e);
    }
  },
  computed: {
    attrs: function() {
      return w(this.ptmi("root", {
        context: {
          filled: this.$filled,
          disabled: this.disabled
        }
      }), this.formField);
    },
    dataP: function() {
      return Ie(Ba({
        invalid: this.$invalid,
        fluid: this.$fluid,
        filled: this.$variant === "filled"
      }, this.size, this.size));
    }
  }
}, Wa = ["value", "name", "disabled", "aria-invalid", "data-p"];
function Ua(t, e, n, i, r, o) {
  return I(), P("input", w({
    type: "text",
    class: t.cx("root"),
    value: t.d_value,
    name: t.name,
    disabled: t.disabled,
    "aria-invalid": t.$invalid || void 0,
    "data-p": o.dataP,
    onInput: e[0] || (e[0] = function() {
      return o.onInput && o.onInput.apply(o, arguments);
    })
  }, o.attrs), null, 16, Wa);
}
ii.render = Ua;
var Ga = `
    .p-virtualscroller-loader {
        background: dt('virtualscroller.loader.mask.background');
        color: dt('virtualscroller.loader.mask.color');
    }

    .p-virtualscroller-loading-icon {
        font-size: dt('virtualscroller.loader.icon.size');
        width: dt('virtualscroller.loader.icon.size');
        height: dt('virtualscroller.loader.icon.size');
    }
`, qa = `
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
`, Sn = E.extend({
  name: "virtualscroller",
  css: qa,
  style: Ga
}), Ya = {
  name: "BaseVirtualScroller",
  extends: qe,
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
  style: Sn,
  provide: function() {
    return {
      $pcVirtualScroller: this,
      $parentInstance: this
    };
  },
  beforeMount: function() {
    var e;
    Sn.loadCSS({
      nonce: (e = this.$primevueConfig) === null || e === void 0 || (e = e.csp) === null || e === void 0 ? void 0 : e.nonce
    });
  }
};
function We(t) {
  "@babel/helpers - typeof";
  return We = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, We(t);
}
function wn(t, e) {
  var n = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var i = Object.getOwnPropertySymbols(t);
    e && (i = i.filter(function(r) {
      return Object.getOwnPropertyDescriptor(t, r).enumerable;
    })), n.push.apply(n, i);
  }
  return n;
}
function Pe(t) {
  for (var e = 1; e < arguments.length; e++) {
    var n = arguments[e] != null ? arguments[e] : {};
    e % 2 ? wn(Object(n), !0).forEach(function(i) {
      ri(t, i, n[i]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(n)) : wn(Object(n)).forEach(function(i) {
      Object.defineProperty(t, i, Object.getOwnPropertyDescriptor(n, i));
    });
  }
  return t;
}
function ri(t, e, n) {
  return (e = Za(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function Za(t) {
  var e = Qa(t, "string");
  return We(e) == "symbol" ? e : e + "";
}
function Qa(t, e) {
  if (We(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var i = n.call(t, e);
    if (We(i) != "object") return i;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var oi = {
  name: "VirtualScroller",
  extends: Ya,
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
      nt(this.element) && (this.setContentEl(this.content), this.init(), this.calculateAutoSize(), this.defaultWidth = ve(this.element), this.defaultHeight = ge(this.element), this.defaultContentWidth = ve(this.content), this.defaultContentHeight = ge(this.content), this.initialized = !0), this.element && this.bindResizeListener();
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
      var n = this, i = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "auto", r = this.isBoth(), o = this.isHorizontal(), s = r ? e.every(function($) {
        return $ > -1;
      }) : e > -1;
      if (s) {
        var l = this.first, a = this.element, u = a.scrollTop, d = u === void 0 ? 0 : u, c = a.scrollLeft, f = c === void 0 ? 0 : c, p = this.calculateNumItems(), m = p.numToleratedItems, v = this.getContentPosition(), g = this.itemSize, y = function() {
          var _ = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0, F = arguments.length > 1 ? arguments[1] : void 0;
          return _ <= F ? 0 : _;
        }, b = function(_, F, z) {
          return _ * F + z;
        }, O = function() {
          var _ = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0, F = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0;
          return n.scrollTo({
            left: _,
            top: F,
            behavior: i
          });
        }, h = r ? {
          rows: 0,
          cols: 0
        } : 0, S = !1, T = !1;
        r ? (h = {
          rows: y(e[0], m[0]),
          cols: y(e[1], m[1])
        }, O(b(h.cols, g[1], v.left), b(h.rows, g[0], v.top)), T = this.lastScrollPos.top !== d || this.lastScrollPos.left !== f, S = h.rows !== l.rows || h.cols !== l.cols) : (h = y(e, m), o ? O(b(h, g, v.left), d) : O(f, b(h, g, v.top)), T = this.lastScrollPos !== (o ? f : d), S = h !== l), this.isRangeChanged = S, T && (this.first = h);
      }
    },
    scrollInView: function(e, n) {
      var i = this, r = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : "auto";
      if (n) {
        var o = this.isBoth(), s = this.isHorizontal(), l = o ? e.every(function(g) {
          return g > -1;
        }) : e > -1;
        if (l) {
          var a = this.getRenderedRange(), u = a.first, d = a.viewport, c = function() {
            var y = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0, b = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0;
            return i.scrollTo({
              left: y,
              top: b,
              behavior: r
            });
          }, f = n === "to-start", p = n === "to-end";
          if (f) {
            if (o)
              d.first.rows - u.rows > e[0] ? c(d.first.cols * this.itemSize[1], (d.first.rows - 1) * this.itemSize[0]) : d.first.cols - u.cols > e[1] && c((d.first.cols - 1) * this.itemSize[1], d.first.rows * this.itemSize[0]);
            else if (d.first - u > e) {
              var m = (d.first - 1) * this.itemSize;
              s ? c(m, 0) : c(0, m);
            }
          } else if (p) {
            if (o)
              d.last.rows - u.rows <= e[0] + 1 ? c(d.first.cols * this.itemSize[1], (d.first.rows + 1) * this.itemSize[0]) : d.last.cols - u.cols <= e[1] + 1 && c((d.first.cols + 1) * this.itemSize[1], d.first.rows * this.itemSize[0]);
            else if (d.last - u <= e + 1) {
              var v = (d.first + 1) * this.itemSize;
              s ? c(v, 0) : c(0, v);
            }
          }
        }
      } else
        this.scrollToIndex(e, r);
    },
    getRenderedRange: function() {
      var e = function(c, f) {
        return Math.floor(c / (f || c));
      }, n = this.first, i = 0;
      if (this.element) {
        var r = this.isBoth(), o = this.isHorizontal(), s = this.element, l = s.scrollTop, a = s.scrollLeft;
        if (r)
          n = {
            rows: e(l, this.itemSize[0]),
            cols: e(a, this.itemSize[1])
          }, i = {
            rows: n.rows + this.numItemsInViewport.rows,
            cols: n.cols + this.numItemsInViewport.cols
          };
        else {
          var u = o ? a : l;
          n = e(u, this.itemSize), i = n + this.numItemsInViewport;
        }
      }
      return {
        first: this.first,
        last: this.last,
        viewport: {
          first: n,
          last: i
        }
      };
    },
    calculateNumItems: function() {
      var e = this.isBoth(), n = this.isHorizontal(), i = this.itemSize, r = this.getContentPosition(), o = this.element ? this.element.offsetWidth - r.left : 0, s = this.element ? this.element.offsetHeight - r.top : 0, l = function(f, p) {
        return Math.ceil(f / (p || f));
      }, a = function(f) {
        return Math.ceil(f / 2);
      }, u = e ? {
        rows: l(s, i[0]),
        cols: l(o, i[1])
      } : l(n ? o : s, i), d = this.d_numToleratedItems || (e ? [a(u.rows), a(u.cols)] : a(u));
      return {
        numItemsInViewport: u,
        numToleratedItems: d
      };
    },
    calculateOptions: function() {
      var e = this, n = this.isBoth(), i = this.first, r = this.calculateNumItems(), o = r.numItemsInViewport, s = r.numToleratedItems, l = function(d, c, f) {
        var p = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : !1;
        return e.getLast(d + c + (d < f ? 2 : 3) * f, p);
      }, a = n ? {
        rows: l(i.rows, o.rows, s[0]),
        cols: l(i.cols, o.cols, s[1], !0)
      } : l(i, o, s);
      this.last = a, this.numItemsInViewport = o, this.d_numToleratedItems = s, this.$emit("update:numToleratedItems", this.d_numToleratedItems), this.showLoader && (this.loaderArr = n ? Array.from({
        length: o.rows
      }).map(function() {
        return Array.from({
          length: o.cols
        });
      }) : Array.from({
        length: o
      })), this.lazy && Promise.resolve().then(function() {
        var u;
        e.lazyLoadState = {
          first: e.step ? n ? {
            rows: 0,
            cols: i.cols
          } : 0 : i,
          last: Math.min(e.step ? e.step : a, ((u = e.items) === null || u === void 0 ? void 0 : u.length) || 0)
        }, e.$emit("lazy-load", e.lazyLoadState);
      });
    },
    calculateAutoSize: function() {
      var e = this;
      this.autoSize && !this.d_loading && Promise.resolve().then(function() {
        if (e.content) {
          var n = e.isBoth(), i = e.isHorizontal(), r = e.isVertical();
          e.content.style.minHeight = e.content.style.minWidth = "auto", e.content.style.position = "relative", e.element.style.contain = "none";
          var o = [ve(e.element), ge(e.element)], s = o[0], l = o[1];
          (n || i) && (e.element.style.width = s < e.defaultWidth ? s + "px" : e.scrollWidth || e.defaultWidth + "px"), (n || r) && (e.element.style.height = l < e.defaultHeight ? l + "px" : e.scrollHeight || e.defaultHeight + "px"), e.content.style.minHeight = e.content.style.minWidth = "", e.content.style.position = "", e.element.style.contain = "";
        }
      });
    },
    getLast: function() {
      var e, n, i = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0, r = arguments.length > 1 ? arguments[1] : void 0;
      return this.items ? Math.min(r ? ((e = this.columns || this.items[0]) === null || e === void 0 ? void 0 : e.length) || 0 : ((n = this.items) === null || n === void 0 ? void 0 : n.length) || 0, i) : 0;
    },
    getContentPosition: function() {
      if (this.content) {
        var e = getComputedStyle(this.content), n = parseFloat(e.paddingLeft) + Math.max(parseFloat(e.left) || 0, 0), i = parseFloat(e.paddingRight) + Math.max(parseFloat(e.right) || 0, 0), r = parseFloat(e.paddingTop) + Math.max(parseFloat(e.top) || 0, 0), o = parseFloat(e.paddingBottom) + Math.max(parseFloat(e.bottom) || 0, 0);
        return {
          left: n,
          right: i,
          top: r,
          bottom: o,
          x: n + i,
          y: r + o
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
        var n = this.isBoth(), i = this.isHorizontal(), r = this.element.parentElement, o = this.scrollWidth || "".concat(this.element.offsetWidth || r.offsetWidth, "px"), s = this.scrollHeight || "".concat(this.element.offsetHeight || r.offsetHeight, "px"), l = function(u, d) {
          return e.element.style[u] = d;
        };
        n || i ? (l("height", s), l("width", o)) : l("height", s);
      }
    },
    setSpacerSize: function() {
      var e = this, n = this.items;
      if (n) {
        var i = this.isBoth(), r = this.isHorizontal(), o = this.getContentPosition(), s = function(a, u, d) {
          var c = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : 0;
          return e.spacerStyle = Pe(Pe({}, e.spacerStyle), ri({}, "".concat(a), (u || []).length * d + c + "px"));
        };
        i ? (s("height", n, this.itemSize[0], o.y), s("width", this.columns || n[1], this.itemSize[1], o.x)) : r ? s("width", this.columns || n, this.itemSize, o.x) : s("height", n, this.itemSize, o.y);
      }
    },
    setContentPosition: function(e) {
      var n = this;
      if (this.content && !this.appendOnly) {
        var i = this.isBoth(), r = this.isHorizontal(), o = e ? e.first : this.first, s = function(d, c) {
          return d * c;
        }, l = function() {
          var d = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0, c = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0;
          return n.contentStyle = Pe(Pe({}, n.contentStyle), {
            transform: "translate3d(".concat(d, "px, ").concat(c, "px, 0)")
          });
        };
        if (i)
          l(s(o.cols, this.itemSize[1]), s(o.rows, this.itemSize[0]));
        else {
          var a = s(o, this.itemSize);
          r ? l(a, 0) : l(0, a);
        }
      }
    },
    onScrollPositionChange: function(e) {
      var n = this, i = e.target, r = this.isBoth(), o = this.isHorizontal(), s = this.getContentPosition(), l = function(j, V) {
        return j ? j > V ? j - V : j : 0;
      }, a = function(j, V) {
        return Math.floor(j / (V || j));
      }, u = function(j, V, W, U, N, H) {
        return j <= N ? N : H ? W - U - N : V + N - 1;
      }, d = function(j, V, W, U, N, H, q, le) {
        if (j <= H) return 0;
        var ee = Math.max(0, q ? j < V ? W : j - H : j > V ? W : j - 2 * H), Y = n.getLast(ee, le);
        return ee > Y ? Y - N : ee;
      }, c = function(j, V, W, U, N, H) {
        var q = V + U + 2 * N;
        return j >= N && (q += N + 1), n.getLast(q, H);
      }, f = l(i.scrollTop, s.top), p = l(i.scrollLeft, s.left), m = r ? {
        rows: 0,
        cols: 0
      } : 0, v = this.last, g = !1, y = this.lastScrollPos;
      if (r) {
        var b = this.lastScrollPos.top <= f, O = this.lastScrollPos.left <= p;
        if (!this.appendOnly || this.appendOnly && (b || O)) {
          var h = {
            rows: a(f, this.itemSize[0]),
            cols: a(p, this.itemSize[1])
          }, S = {
            rows: u(h.rows, this.first.rows, this.last.rows, this.numItemsInViewport.rows, this.d_numToleratedItems[0], b),
            cols: u(h.cols, this.first.cols, this.last.cols, this.numItemsInViewport.cols, this.d_numToleratedItems[1], O)
          };
          m = {
            rows: d(h.rows, S.rows, this.first.rows, this.last.rows, this.numItemsInViewport.rows, this.d_numToleratedItems[0], b),
            cols: d(h.cols, S.cols, this.first.cols, this.last.cols, this.numItemsInViewport.cols, this.d_numToleratedItems[1], O, !0)
          }, v = {
            rows: c(h.rows, m.rows, this.last.rows, this.numItemsInViewport.rows, this.d_numToleratedItems[0]),
            cols: c(h.cols, m.cols, this.last.cols, this.numItemsInViewport.cols, this.d_numToleratedItems[1], !0)
          }, g = m.rows !== this.first.rows || v.rows !== this.last.rows || m.cols !== this.first.cols || v.cols !== this.last.cols || this.isRangeChanged, y = {
            top: f,
            left: p
          };
        }
      } else {
        var T = o ? p : f, $ = this.lastScrollPos <= T;
        if (!this.appendOnly || this.appendOnly && $) {
          var _ = a(T, this.itemSize), F = u(_, this.first, this.last, this.numItemsInViewport, this.d_numToleratedItems, $);
          m = d(_, F, this.first, this.last, this.numItemsInViewport, this.d_numToleratedItems, $), v = c(_, m, this.last, this.numItemsInViewport, this.d_numToleratedItems), g = m !== this.first || v !== this.last || this.isRangeChanged, y = T;
        }
      }
      return {
        first: m,
        last: v,
        isRangeChanged: g,
        scrollPos: y
      };
    },
    onScrollChange: function(e) {
      var n = this.onScrollPositionChange(e), i = n.first, r = n.last, o = n.isRangeChanged, s = n.scrollPos;
      if (o) {
        var l = {
          first: i,
          last: r
        };
        if (this.setContentPosition(l), this.first = i, this.last = r, this.lastScrollPos = s, this.$emit("scroll-index-change", l), this.lazy && this.isPageChanged(i)) {
          var a, u, d = {
            first: this.step ? Math.min(this.getPageByFirst(i) * this.step, (((a = this.items) === null || a === void 0 ? void 0 : a.length) || 0) - this.step) : i,
            last: Math.min(this.step ? (this.getPageByFirst(i) + 1) * this.step : r, ((u = this.items) === null || u === void 0 ? void 0 : u.length) || 0)
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
            var i = this.onScrollPositionChange(e), r = i.isRangeChanged, o = r || (this.step ? this.isPageChanged() : !1);
            o && (this.d_loading = !0);
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
        if (nt(e.element)) {
          var n = e.isBoth(), i = e.isVertical(), r = e.isHorizontal(), o = [ve(e.element), ge(e.element)], s = o[0], l = o[1], a = s !== e.defaultWidth, u = l !== e.defaultHeight, d = n ? a || u : r ? a : i ? u : !1;
          d && (e.d_numToleratedItems = e.numToleratedItems, e.defaultWidth = s, e.defaultHeight = l, e.defaultContentWidth = ve(e.content), e.defaultContentHeight = ge(e.content), e.init());
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
      var n = (this.items || []).length, i = this.isBoth() ? this.first.rows + e : this.first + e;
      return {
        index: i,
        count: n,
        first: i === 0,
        last: i === n - 1,
        even: i % 2 === 0,
        odd: i % 2 !== 0
      };
    },
    getLoaderOptions: function(e, n) {
      var i = this.loaderArr.length;
      return Pe({
        index: e,
        count: i,
        first: e === 0,
        last: e === i - 1,
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
      this.content = e || this.content || st(this.element, '[data-pc-section="content"]');
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
    SpinnerIcon: Ft
  }
}, Ja = ["tabindex"];
function Xa(t, e, n, i, r, o) {
  var s = ne("SpinnerIcon");
  return t.disabled ? (I(), P(Le, {
    key: 1
  }, [M(t.$slots, "default"), M(t.$slots, "content", {
    items: t.items,
    rows: t.items,
    columns: o.loadedColumns
  })], 64)) : (I(), P("div", w({
    key: 0,
    ref: o.elementRef,
    class: o.containerClass,
    tabindex: t.tabindex,
    style: t.style,
    onScroll: e[0] || (e[0] = function() {
      return o.onScroll && o.onScroll.apply(o, arguments);
    })
  }, t.ptmi("root")), [M(t.$slots, "content", {
    styleClass: o.contentClass,
    items: o.loadedItems,
    getItemOptions: o.getOptions,
    loading: r.d_loading,
    getLoaderOptions: o.getLoaderOptions,
    itemSize: t.itemSize,
    rows: o.loadedRows,
    columns: o.loadedColumns,
    contentRef: o.contentRef,
    spacerStyle: r.spacerStyle,
    contentStyle: r.contentStyle,
    vertical: o.isVertical(),
    horizontal: o.isHorizontal(),
    both: o.isBoth()
  }, function() {
    return [B("div", w({
      ref: o.contentRef,
      class: o.contentClass,
      style: r.contentStyle
    }, t.ptm("content")), [(I(!0), P(Le, null, ft(o.loadedItems, function(l, a) {
      return M(t.$slots, "item", {
        key: a,
        item: l,
        options: o.getOptions(a)
      });
    }), 128))], 16)];
  }), t.showSpacer ? (I(), P("div", w({
    key: 0,
    class: "p-virtualscroller-spacer",
    style: r.spacerStyle
  }, t.ptm("spacer")), null, 16)) : Q("", !0), !t.loaderDisabled && t.showLoader && r.d_loading ? (I(), P("div", w({
    key: 1,
    class: o.loaderClass
  }, t.ptm("loader")), [t.$slots && t.$slots.loader ? (I(!0), P(Le, {
    key: 0
  }, ft(r.loaderArr, function(l, a) {
    return M(t.$slots, "loader", {
      key: a,
      options: o.getLoaderOptions(a, o.isBoth() && {
        numCols: t.d_numItemsInViewport.cols
      })
    });
  }), 128)) : Q("", !0), M(t.$slots, "loadingicon", {}, function() {
    return [he(s, w({
      spin: "",
      class: "p-virtualscroller-loading-icon"
    }, t.ptm("loadingIcon")), null, 16)];
  })], 16)) : Q("", !0)], 16, Ja));
}
oi.render = Xa;
var es = `
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
`, ts = {
  root: function(e) {
    var n = e.instance, i = e.props, r = e.state;
    return ["p-select p-component p-inputwrapper", {
      "p-disabled": i.disabled,
      "p-invalid": n.$invalid,
      "p-variant-filled": n.$variant === "filled",
      "p-focus": r.focused,
      "p-inputwrapper-filled": n.$filled,
      "p-inputwrapper-focus": r.focused || r.overlayVisible,
      "p-select-open": r.overlayVisible,
      "p-select-fluid": n.$fluid,
      "p-select-sm p-inputfield-sm": i.size === "small",
      "p-select-lg p-inputfield-lg": i.size === "large"
    }];
  },
  label: function(e) {
    var n, i = e.instance, r = e.props;
    return ["p-select-label", {
      "p-placeholder": !r.editable && i.label === r.placeholder,
      "p-select-label-empty": !r.editable && !i.$slots.value && (i.label === "p-emptylabel" || ((n = i.label) === null || n === void 0 ? void 0 : n.length) === 0)
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
    var n = e.instance, i = e.props, r = e.state, o = e.option, s = e.focusedOption;
    return ["p-select-option", {
      "p-select-option-selected": n.isSelected(o) && i.highlightOnSelect,
      "p-focus": r.focusedOptionIndex === s,
      "p-disabled": n.isOptionDisabled(o)
    }];
  },
  optionLabel: "p-select-option-label",
  optionCheckIcon: "p-select-option-check-icon",
  optionBlankIcon: "p-select-option-blank-icon",
  emptyMessage: "p-select-empty-message"
}, ns = E.extend({
  name: "select",
  style: es,
  classes: ts
}), is = {
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
  style: ns,
  provide: function() {
    return {
      $pcSelect: this,
      $parentInstance: this
    };
  }
};
function Ue(t) {
  "@babel/helpers - typeof";
  return Ue = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, Ue(t);
}
function rs(t) {
  return ls(t) || ss(t) || as(t) || os();
}
function os() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function as(t, e) {
  if (t) {
    if (typeof t == "string") return xt(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? xt(t, e) : void 0;
  }
}
function ss(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function ls(t) {
  if (Array.isArray(t)) return xt(t);
}
function xt(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, i = Array(e); n < e; n++) i[n] = t[n];
  return i;
}
function On(t, e) {
  var n = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var i = Object.getOwnPropertySymbols(t);
    e && (i = i.filter(function(r) {
      return Object.getOwnPropertyDescriptor(t, r).enumerable;
    })), n.push.apply(n, i);
  }
  return n;
}
function $n(t) {
  for (var e = 1; e < arguments.length; e++) {
    var n = arguments[e] != null ? arguments[e] : {};
    e % 2 ? On(Object(n), !0).forEach(function(i) {
      me(t, i, n[i]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(n)) : On(Object(n)).forEach(function(i) {
      Object.defineProperty(t, i, Object.getOwnPropertyDescriptor(n, i));
    });
  }
  return t;
}
function me(t, e, n) {
  return (e = us(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function us(t) {
  var e = ds(t, "string");
  return Ue(e) == "symbol" ? e : e + "";
}
function ds(t, e) {
  if (Ue(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var i = n.call(t, e);
    if (Ue(i) != "object") return i;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var cs = {
  name: "Select",
  extends: is,
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
    this.unbindOutsideClickListener(), this.unbindResizeListener(), this.unbindLabelClickListener(), this.unbindMatchMediaOrientationListener(), this.scrollHandler && (this.scrollHandler.destroy(), this.scrollHandler = null), this.overlay && (ut.clear(this.overlay), this.overlay = null);
  },
  methods: {
    getOptionIndex: function(e, n) {
      return this.virtualScrollerDisabled ? e : n && n(e).index;
    },
    getOptionLabel: function(e) {
      return this.optionLabel ? se(e, this.optionLabel) : e;
    },
    getOptionValue: function(e) {
      return this.optionValue ? se(e, this.optionValue) : e;
    },
    getOptionRenderKey: function(e, n) {
      return (this.dataKey ? se(e, this.dataKey) : this.getOptionLabel(e)) + "_" + n;
    },
    getPTItemOptions: function(e, n, i, r) {
      return this.ptm(r, {
        context: {
          option: e,
          index: i,
          selected: this.isSelected(e),
          focused: this.focusedOptionIndex === this.getOptionIndex(i, n),
          disabled: this.isOptionDisabled(e)
        }
      });
    },
    isOptionDisabled: function(e) {
      return this.optionDisabled ? se(e, this.optionDisabled) : !1;
    },
    isOptionGroup: function(e) {
      return this.optionGroupLabel && e.optionGroup && e.group;
    },
    getOptionGroupLabel: function(e) {
      return se(e, this.optionGroupLabel);
    },
    getOptionGroupChildren: function(e) {
      return se(e, this.optionGroupChildren);
    },
    getAriaPosInset: function(e) {
      var n = this;
      return (this.optionGroupLabel ? e - this.visibleOptions.slice(0, e).filter(function(i) {
        return n.isOptionGroup(i);
      }).length : e) + 1;
    },
    show: function(e) {
      this.$emit("before-show"), this.overlayVisible = !0, this.focusedOptionIndex = this.focusedOptionIndex !== -1 ? this.focusedOptionIndex : this.autoOptionFocus ? this.findFirstFocusedOptionIndex() : this.editable ? -1 : this.findSelectedOptionIndex(), e && oe(this.$refs.focusInput);
    },
    hide: function(e) {
      var n = this, i = function() {
        n.$emit("before-hide"), n.overlayVisible = !1, n.clicked = !1, n.focusedOptionIndex = -1, n.searchValue = "", n.resetFilterOnHide && (n.filterValue = null), e && oe(n.$refs.focusInput);
      };
      setTimeout(function() {
        i();
      }, 0);
    },
    onFocus: function(e) {
      this.disabled || (this.focused = !0, this.overlayVisible && (this.focusedOptionIndex = this.focusedOptionIndex !== -1 ? this.focusedOptionIndex : this.autoOptionFocus ? this.findFirstFocusedOptionIndex() : this.editable ? -1 : this.findSelectedOptionIndex(), this.scrollInView(this.focusedOptionIndex)), this.$emit("focus", e));
    },
    onBlur: function(e) {
      var n = this;
      setTimeout(function() {
        var i, r;
        n.focused = !1, n.focusedOptionIndex = -1, n.searchValue = "", n.$emit("blur", e), (i = (r = n.formField).onBlur) === null || i === void 0 || i.call(r, e);
      }, 100);
    },
    onKeyDown: function(e) {
      var n = this;
      if (this.disabled) {
        e.preventDefault();
        return;
      }
      if (cr())
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
      var i = e.metaKey || e.ctrlKey;
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
          !i && Wi(e.key) && (!this.overlayVisible && this.show(), !this.editable && this.searchOptions(e, e.key), this.filter && this.$nextTick(function() {
            n.$refs.filterInput && oe(n.$refs.filterInput.$el);
          }));
          break;
      }
      this.clicked = !1;
    },
    onEditableInput: function(e) {
      var n = e.target.value;
      this.searchValue = "";
      var i = this.searchOptions(e, n);
      !i && (this.focusedOptionIndex = -1), this.updateModel(e, n), !this.overlayVisible && x(n) && this.show();
    },
    onContainerClick: function(e) {
      this.disabled || this.loading || e.target.tagName === "INPUT" || e.target.getAttribute("data-pc-section") === "clearicon" || e.target.closest('[data-pc-section="clearicon"]') || ((!this.overlay || !this.overlay.contains(e.target)) && (this.overlayVisible ? this.hide(!0) : this.show(!0)), this.clicked = !0);
    },
    onClearClick: function(e) {
      this.updateModel(e, null), this.resetFilterOnClear && (this.filterValue = null);
    },
    onFirstHiddenFocus: function(e) {
      var n = e.relatedTarget === this.$refs.focusInput ? ar(this.overlay, ':not([data-p-hidden-focusable="true"])') : this.$refs.focusInput;
      oe(n);
    },
    onLastHiddenFocus: function(e) {
      var n = e.relatedTarget === this.$refs.focusInput ? sr(this.overlay, ':not([data-p-hidden-focusable="true"])') : this.$refs.focusInput;
      oe(n);
    },
    onOptionSelect: function(e, n) {
      var i = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : !0;
      if (this.overlayVisible) {
        var r = this.getOptionValue(n);
        this.updateModel(e, r), i && this.hide(!0);
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
      Vo.emit("overlay-click", {
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
        var i = this.focusedOptionIndex !== -1 ? this.findPrevOptionIndex(this.focusedOptionIndex) : this.clicked ? this.findLastOptionIndex() : this.findLastFocusedOptionIndex();
        this.changeFocusedOptionIndex(e, i), !this.overlayVisible && this.show(), e.preventDefault();
      }
    },
    onArrowLeftKey: function(e) {
      var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1;
      n && (this.focusedOptionIndex = -1);
    },
    onHomeKey: function(e) {
      var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1;
      if (n) {
        var i = e.currentTarget;
        e.shiftKey ? i.setSelectionRange(0, e.target.selectionStart) : (i.setSelectionRange(0, 0), this.focusedOptionIndex = -1);
      } else
        this.changeFocusedOptionIndex(e, this.findFirstOptionIndex()), !this.overlayVisible && this.show();
      e.preventDefault();
    },
    onEndKey: function(e) {
      var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1;
      if (n) {
        var i = e.currentTarget;
        if (e.shiftKey)
          i.setSelectionRange(e.target.selectionStart, i.value.length);
        else {
          var r = i.value.length;
          i.setSelectionRange(r, r), this.focusedOptionIndex = -1;
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
      n || (this.overlayVisible && this.hasFocusableElements() ? (oe(this.$refs.firstHiddenFocusableElementOnOverlay), e.preventDefault()) : (this.focusedOptionIndex !== -1 && this.onOptionSelect(e, this.visibleOptions[this.focusedOptionIndex]), this.overlayVisible && this.hide(this.filter)));
    },
    onBackspaceKey: function(e) {
      var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1;
      n && !this.overlayVisible && this.show();
    },
    onOverlayEnter: function(e) {
      var n = this;
      ut.set("overlay", e, this.$primevue.config.zIndex.overlay), er(e, {
        position: "absolute",
        top: "0"
      }), this.alignOverlay(), this.scrollInView(), this.$attrSelector && e.setAttribute(this.$attrSelector, ""), setTimeout(function() {
        n.autoFilterFocus && n.filter && oe(n.$refs.filterInput.$el), n.autoUpdateModel();
      }, 1);
    },
    onOverlayAfterEnter: function() {
      this.bindOutsideClickListener(), this.bindScrollListener(), this.bindResizeListener(), this.$emit("show");
    },
    onOverlayLeave: function(e) {
      var n = this;
      e.style.pointerEvents = "none", this.unbindOutsideClickListener(), this.unbindScrollListener(), this.unbindResizeListener(), this.autoFilterFocus && this.filter && !this.editable && this.$nextTick(function() {
        n.$refs.filterInput && oe(n.$refs.filterInput.$el);
      }), this.$emit("hide"), this.overlay = null;
    },
    onOverlayAfterLeave: function(e) {
      ut.clear(e);
    },
    alignOverlay: function() {
      this.appendTo === "self" ? tr(this.overlay, this.$el) : this.overlay && (this.overlay.style.minWidth = En(this.$el) + "px", Xi(this.overlay, this.$el));
    },
    bindOutsideClickListener: function() {
      var e = this;
      this.outsideClickListener || (this.outsideClickListener = function(n) {
        var i = n.composedPath();
        e.overlayVisible && e.overlay && !i.includes(e.$el) && !i.includes(e.overlay) && e.hide();
      }, document.addEventListener("click", this.outsideClickListener, !0));
    },
    unbindOutsideClickListener: function() {
      this.outsideClickListener && (document.removeEventListener("click", this.outsideClickListener, !0), this.outsideClickListener = null);
    },
    bindScrollListener: function() {
      var e = this;
      this.scrollHandler || (this.scrollHandler = new Mo(this.$refs.container, function() {
        e.overlayVisible && e.hide();
      })), this.scrollHandler.bindScrollListener();
    },
    unbindScrollListener: function() {
      this.scrollHandler && this.scrollHandler.unbindScrollListener();
    },
    bindResizeListener: function() {
      var e = this;
      this.resizeListener || (this.resizeListener = function() {
        e.overlayVisible && !fr() && e.hide();
      }, window.addEventListener("resize", this.resizeListener));
    },
    unbindResizeListener: function() {
      this.resizeListener && (window.removeEventListener("resize", this.resizeListener), this.resizeListener = null);
    },
    bindLabelClickListener: function() {
      var e = this;
      if (!this.editable && !this.labelClickListener) {
        var n = document.querySelector('label[for="'.concat(this.labelId, '"]'));
        n && nt(n) && (this.labelClickListener = function() {
          oe(e.$refs.focusInput);
        }, n.addEventListener("click", this.labelClickListener));
      }
    },
    unbindLabelClickListener: function() {
      if (this.labelClickListener) {
        var e = document.querySelector('label[for="'.concat(this.labelId, '"]'));
        e && nt(e) && e.removeEventListener("click", this.labelClickListener);
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
      return Et(this.overlay, ':not([data-p-hidden-focusable="true"])').length > 0;
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
      return x(e) && !(this.isOptionDisabled(e) || this.isOptionGroup(e));
    },
    isValidSelectedOption: function(e) {
      return this.isValidOption(e) && this.isSelected(e);
    },
    isSelected: function(e) {
      return kn(this.d_value, this.getOptionValue(e), this.equalityKey);
    },
    findFirstOptionIndex: function() {
      var e = this;
      return this.visibleOptions.findIndex(function(n) {
        return e.isValidOption(n);
      });
    },
    findLastOptionIndex: function() {
      var e = this;
      return Kt(this.visibleOptions, function(n) {
        return e.isValidOption(n);
      });
    },
    findNextOptionIndex: function(e) {
      var n = this, i = e < this.visibleOptions.length - 1 ? this.visibleOptions.slice(e + 1).findIndex(function(r) {
        return n.isValidOption(r);
      }) : -1;
      return i > -1 ? i + e + 1 : e;
    },
    findPrevOptionIndex: function(e) {
      var n = this, i = e > 0 ? Kt(this.visibleOptions.slice(0, e), function(r) {
        return n.isValidOption(r);
      }) : -1;
      return i > -1 ? i : e;
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
      var i = this;
      this.searchValue = (this.searchValue || "") + n;
      var r = -1, o = !1;
      return x(this.searchValue) && (r = this.visibleOptions.findIndex(function(s) {
        return i.isOptionExactMatched(s);
      }), r === -1 && (r = this.visibleOptions.findIndex(function(s) {
        return i.isOptionStartsWith(s);
      })), r !== -1 && (o = !0), r === -1 && this.focusedOptionIndex === -1 && (r = this.findFirstFocusedOptionIndex()), r !== -1 && this.changeFocusedOptionIndex(e, r)), this.searchTimeout && clearTimeout(this.searchTimeout), this.searchTimeout = setTimeout(function() {
        i.searchValue = "", i.searchTimeout = null;
      }, 500), o;
    },
    changeFocusedOptionIndex: function(e, n) {
      this.focusedOptionIndex !== n && (this.focusedOptionIndex = n, this.scrollInView(), this.selectOnFocus && this.onOptionSelect(e, this.visibleOptions[n], !1));
    },
    scrollInView: function() {
      var e = this, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : -1;
      this.$nextTick(function() {
        var i = n !== -1 ? "".concat(e.$id, "_").concat(n) : e.focusedOptionId, r = st(e.list, 'li[id="'.concat(i, '"]'));
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
      return (e || []).reduce(function(i, r, o) {
        i.push({
          optionGroup: r,
          group: !0,
          index: o
        });
        var s = n.getOptionGroupChildren(r);
        return s && s.forEach(function(l) {
          return i.push(l);
        }), i;
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
        var i = Tr.filter(n, this.searchFields, this.filterValue, this.filterMatchMode, this.filterLocale);
        if (this.optionGroupLabel) {
          var r = this.options || [], o = [];
          return r.forEach(function(s) {
            var l = e.getOptionGroupChildren(s), a = l.filter(function(u) {
              return i.includes(u);
            });
            a.length > 0 && o.push($n($n({}, s), {}, me({}, typeof e.optionGroupChildren == "string" ? e.optionGroupChildren : "items", rs(a))));
          }), this.flatOptions(o);
        }
        return i;
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
      return x(this.visibleOptions) ? this.filterMessageText.replaceAll("{0}", this.visibleOptions.length) : this.emptyFilterMessageText;
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
      return Ie(me({
        invalid: this.$invalid,
        disabled: this.disabled,
        focus: this.focused,
        fluid: this.$fluid,
        filled: this.$variant === "filled"
      }, this.size, this.size));
    },
    labelDataP: function() {
      return Ie(me(me({
        placeholder: !this.editable && this.label === this.placeholder,
        clearable: this.showClear,
        disabled: this.disabled,
        editable: this.editable
      }, this.size, this.size), "empty", !this.editable && !this.$slots.value && (this.label === "p-emptylabel" || this.label.length === 0)));
    },
    dropdownIconDataP: function() {
      return Ie(me({}, this.size, this.size));
    },
    overlayDataP: function() {
      return Ie(me({}, "portal-" + this.appendTo, "portal-" + this.appendTo));
    }
  },
  directives: {
    ripple: _o
  },
  components: {
    InputText: ii,
    VirtualScroller: oi,
    Portal: jt,
    InputIcon: ti,
    IconField: ei,
    TimesIcon: Yn,
    ChevronDownIcon: Jn,
    SpinnerIcon: Ft,
    SearchIcon: Xn,
    CheckIcon: Qn,
    BlankIcon: Zn
  }
}, fs = ["id", "data-p"], ps = ["name", "id", "value", "placeholder", "tabindex", "disabled", "aria-label", "aria-labelledby", "aria-expanded", "aria-controls", "aria-activedescendant", "aria-invalid", "data-p"], hs = ["name", "id", "tabindex", "aria-label", "aria-labelledby", "aria-expanded", "aria-controls", "aria-activedescendant", "aria-invalid", "aria-disabled", "data-p"], ms = ["data-p"], gs = ["id"], vs = ["id"], ys = ["id", "aria-label", "aria-selected", "aria-disabled", "aria-setsize", "aria-posinset", "onMousedown", "onMousemove", "data-p-selected", "data-p-focused", "data-p-disabled"];
function bs(t, e, n, i, r, o) {
  var s = ne("SpinnerIcon"), l = ne("InputText"), a = ne("SearchIcon"), u = ne("InputIcon"), d = ne("IconField"), c = ne("CheckIcon"), f = ne("BlankIcon"), p = ne("VirtualScroller"), m = ne("Portal"), v = _i("ripple");
  return I(), P("div", w({
    ref: "container",
    id: t.$id,
    class: t.cx("root"),
    onClick: e[12] || (e[12] = function() {
      return o.onContainerClick && o.onContainerClick.apply(o, arguments);
    }),
    "data-p": o.containerDataP
  }, t.ptmi("root")), [t.editable ? (I(), P("input", w({
    key: 0,
    ref: "focusInput",
    name: t.name,
    id: t.labelId || t.inputId,
    type: "text",
    class: [t.cx("label"), t.inputClass, t.labelClass],
    style: [t.inputStyle, t.labelStyle],
    value: o.editableInputValue,
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
    "aria-activedescendant": r.focused ? o.focusedOptionId : void 0,
    "aria-invalid": t.invalid || void 0,
    onFocus: e[0] || (e[0] = function() {
      return o.onFocus && o.onFocus.apply(o, arguments);
    }),
    onBlur: e[1] || (e[1] = function() {
      return o.onBlur && o.onBlur.apply(o, arguments);
    }),
    onKeydown: e[2] || (e[2] = function() {
      return o.onKeyDown && o.onKeyDown.apply(o, arguments);
    }),
    onInput: e[3] || (e[3] = function() {
      return o.onEditableInput && o.onEditableInput.apply(o, arguments);
    }),
    "data-p": o.labelDataP
  }, t.ptm("label")), null, 16, ps)) : (I(), P("span", w({
    key: 1,
    ref: "focusInput",
    name: t.name,
    id: t.labelId || t.inputId,
    class: [t.cx("label"), t.inputClass, t.labelClass],
    style: [t.inputStyle, t.labelStyle],
    tabindex: t.disabled ? -1 : t.tabindex,
    role: "combobox",
    "aria-label": t.ariaLabel || (o.label === "p-emptylabel" ? void 0 : o.label),
    "aria-labelledby": t.ariaLabelledby,
    "aria-haspopup": "listbox",
    "aria-expanded": r.overlayVisible,
    "aria-controls": t.$id + "_list",
    "aria-activedescendant": r.focused ? o.focusedOptionId : void 0,
    "aria-invalid": t.invalid || void 0,
    "aria-disabled": t.disabled,
    onFocus: e[4] || (e[4] = function() {
      return o.onFocus && o.onFocus.apply(o, arguments);
    }),
    onBlur: e[5] || (e[5] = function() {
      return o.onBlur && o.onBlur.apply(o, arguments);
    }),
    onKeydown: e[6] || (e[6] = function() {
      return o.onKeyDown && o.onKeyDown.apply(o, arguments);
    }),
    "data-p": o.labelDataP
  }, t.ptm("label")), [M(t.$slots, "value", {
    value: t.d_value,
    placeholder: t.placeholder
  }, function() {
    var g;
    return [lt(ue(o.label === "p-emptylabel" ? " " : (g = o.label) !== null && g !== void 0 ? g : "empty"), 1)];
  })], 16, hs)), o.isClearIconVisible ? M(t.$slots, "clearicon", {
    key: 2,
    class: Ze(t.cx("clearIcon")),
    clearCallback: o.onClearClick
  }, function() {
    return [(I(), pe(Rt(t.clearIcon ? "i" : "TimesIcon"), w({
      ref: "clearIcon",
      class: [t.cx("clearIcon"), t.clearIcon],
      onClick: o.onClearClick
    }, t.ptm("clearIcon"), {
      "data-pc-section": "clearicon"
    }), null, 16, ["class", "onClick"]))];
  }) : Q("", !0), B("div", w({
    class: t.cx("dropdown")
  }, t.ptm("dropdown")), [t.loading ? M(t.$slots, "loadingicon", {
    key: 0,
    class: Ze(t.cx("loadingIcon"))
  }, function() {
    return [t.loadingIcon ? (I(), P("span", w({
      key: 0,
      class: [t.cx("loadingIcon"), "pi-spin", t.loadingIcon],
      "aria-hidden": "true"
    }, t.ptm("loadingIcon")), null, 16)) : (I(), pe(s, w({
      key: 1,
      class: t.cx("loadingIcon"),
      spin: "",
      "aria-hidden": "true"
    }, t.ptm("loadingIcon")), null, 16, ["class"]))];
  }) : M(t.$slots, "dropdownicon", {
    key: 1,
    class: Ze(t.cx("dropdownIcon"))
  }, function() {
    return [(I(), pe(Rt(t.dropdownIcon ? "span" : "ChevronDownIcon"), w({
      class: [t.cx("dropdownIcon"), t.dropdownIcon],
      "aria-hidden": "true",
      "data-p": o.dropdownIconDataP
    }, t.ptm("dropdownIcon")), null, 16, ["class", "data-p"]))];
  })], 16), he(m, {
    appendTo: t.appendTo
  }, {
    default: Oe(function() {
      return [he(xi, w({
        name: "p-anchored-overlay",
        onEnter: o.onOverlayEnter,
        onAfterEnter: o.onOverlayAfterEnter,
        onLeave: o.onOverlayLeave,
        onAfterLeave: o.onOverlayAfterLeave
      }, t.ptm("transition")), {
        default: Oe(function() {
          return [r.overlayVisible ? (I(), P("div", w({
            key: 0,
            ref: o.overlayRef,
            class: [t.cx("overlay"), t.panelClass, t.overlayClass],
            style: [t.panelStyle, t.overlayStyle],
            onClick: e[10] || (e[10] = function() {
              return o.onOverlayClick && o.onOverlayClick.apply(o, arguments);
            }),
            onKeydown: e[11] || (e[11] = function() {
              return o.onOverlayKeyDown && o.onOverlayKeyDown.apply(o, arguments);
            }),
            "data-p": o.overlayDataP
          }, t.ptm("overlay")), [B("span", w({
            ref: "firstHiddenFocusableElementOnOverlay",
            role: "presentation",
            "aria-hidden": "true",
            class: "p-hidden-accessible p-hidden-focusable",
            tabindex: 0,
            onFocus: e[7] || (e[7] = function() {
              return o.onFirstHiddenFocus && o.onFirstHiddenFocus.apply(o, arguments);
            })
          }, t.ptm("hiddenFirstFocusableEl"), {
            "data-p-hidden-accessible": !0,
            "data-p-hidden-focusable": !0
          }), null, 16), M(t.$slots, "header", {
            value: t.d_value,
            options: o.visibleOptions
          }), t.filter ? (I(), P("div", w({
            key: 0,
            class: t.cx("header")
          }, t.ptm("header")), [he(d, {
            unstyled: t.unstyled,
            pt: t.ptm("pcFilterContainer")
          }, {
            default: Oe(function() {
              return [he(l, {
                ref: "filterInput",
                type: "text",
                value: r.filterValue,
                onVnodeMounted: o.onFilterUpdated,
                onVnodeUpdated: o.onFilterUpdated,
                class: Ze(t.cx("pcFilter")),
                placeholder: t.filterPlaceholder,
                variant: t.variant,
                unstyled: t.unstyled,
                role: "searchbox",
                autocomplete: "off",
                "aria-owns": t.$id + "_list",
                "aria-activedescendant": o.focusedOptionId,
                onKeydown: o.onFilterKeyDown,
                onBlur: o.onFilterBlur,
                onInput: o.onFilterChange,
                pt: t.ptm("pcFilter"),
                formControl: {
                  novalidate: !0
                }
              }, null, 8, ["value", "onVnodeMounted", "onVnodeUpdated", "class", "placeholder", "variant", "unstyled", "aria-owns", "aria-activedescendant", "onKeydown", "onBlur", "onInput", "pt"]), he(u, {
                unstyled: t.unstyled,
                pt: t.ptm("pcFilterIconContainer")
              }, {
                default: Oe(function() {
                  return [M(t.$slots, "filtericon", {}, function() {
                    return [t.filterIcon ? (I(), P("span", w({
                      key: 0,
                      class: t.filterIcon
                    }, t.ptm("filterIcon")), null, 16)) : (I(), pe(a, Pi(w({
                      key: 1
                    }, t.ptm("filterIcon"))), null, 16))];
                  })];
                }),
                _: 3
              }, 8, ["unstyled", "pt"])];
            }),
            _: 3
          }, 8, ["unstyled", "pt"]), B("span", w({
            role: "status",
            "aria-live": "polite",
            class: "p-hidden-accessible"
          }, t.ptm("hiddenFilterResult"), {
            "data-p-hidden-accessible": !0
          }), ue(o.filterResultMessageText), 17)], 16)) : Q("", !0), B("div", w({
            class: t.cx("listContainer"),
            style: {
              "max-height": o.virtualScrollerDisabled ? t.scrollHeight : ""
            }
          }, t.ptm("listContainer")), [he(p, w({
            ref: o.virtualScrollerRef
          }, t.virtualScrollerOptions, {
            items: o.visibleOptions,
            style: {
              height: t.scrollHeight
            },
            tabindex: -1,
            disabled: o.virtualScrollerDisabled,
            pt: t.ptm("virtualScroller")
          }), Ai({
            content: Oe(function(g) {
              var y = g.styleClass, b = g.contentRef, O = g.items, h = g.getItemOptions, S = g.contentStyle, T = g.itemSize;
              return [B("ul", w({
                ref: function(_) {
                  return o.listRef(_, b);
                },
                id: t.$id + "_list",
                class: [t.cx("list"), y],
                style: S,
                role: "listbox"
              }, t.ptm("list")), [(I(!0), P(Le, null, ft(O, function($, _) {
                return I(), P(Le, {
                  key: o.getOptionRenderKey($, o.getOptionIndex(_, h))
                }, [o.isOptionGroup($) ? (I(), P("li", w({
                  key: 0,
                  id: t.$id + "_" + o.getOptionIndex(_, h),
                  style: {
                    height: T ? T + "px" : void 0
                  },
                  class: t.cx("optionGroup"),
                  role: "option"
                }, {
                  ref_for: !0
                }, t.ptm("optionGroup")), [M(t.$slots, "optiongroup", {
                  option: $.optionGroup,
                  index: o.getOptionIndex(_, h)
                }, function() {
                  return [B("span", w({
                    class: t.cx("optionGroupLabel")
                  }, {
                    ref_for: !0
                  }, t.ptm("optionGroupLabel")), ue(o.getOptionGroupLabel($.optionGroup)), 17)];
                })], 16, vs)) : Ei((I(), P("li", w({
                  key: 1,
                  id: t.$id + "_" + o.getOptionIndex(_, h),
                  class: t.cx("option", {
                    option: $,
                    focusedOption: o.getOptionIndex(_, h)
                  }),
                  style: {
                    height: T ? T + "px" : void 0
                  },
                  role: "option",
                  "aria-label": o.getOptionLabel($),
                  "aria-selected": o.isSelected($),
                  "aria-disabled": o.isOptionDisabled($),
                  "aria-setsize": o.ariaSetSize,
                  "aria-posinset": o.getAriaPosInset(o.getOptionIndex(_, h)),
                  onMousedown: function(z) {
                    return o.onOptionSelect(z, $);
                  },
                  onMousemove: function(z) {
                    return o.onOptionMouseMove(z, o.getOptionIndex(_, h));
                  },
                  onClick: e[8] || (e[8] = ji(function() {
                  }, ["stop"])),
                  "data-p-selected": !t.checkmark && o.isSelected($),
                  "data-p-focused": r.focusedOptionIndex === o.getOptionIndex(_, h),
                  "data-p-disabled": o.isOptionDisabled($)
                }, {
                  ref_for: !0
                }, o.getPTItemOptions($, h, _, "option")), [t.checkmark ? (I(), P(Le, {
                  key: 0
                }, [o.isSelected($) ? (I(), pe(c, w({
                  key: 0,
                  class: t.cx("optionCheckIcon")
                }, {
                  ref_for: !0
                }, t.ptm("optionCheckIcon")), null, 16, ["class"])) : (I(), pe(f, w({
                  key: 1,
                  class: t.cx("optionBlankIcon")
                }, {
                  ref_for: !0
                }, t.ptm("optionBlankIcon")), null, 16, ["class"]))], 64)) : Q("", !0), M(t.$slots, "option", {
                  option: $,
                  selected: o.isSelected($),
                  index: o.getOptionIndex(_, h)
                }, function() {
                  return [B("span", w({
                    class: t.cx("optionLabel")
                  }, {
                    ref_for: !0
                  }, t.ptm("optionLabel")), ue(o.getOptionLabel($)), 17)];
                })], 16, ys)), [[v]])], 64);
              }), 128)), r.filterValue && (!O || O && O.length === 0) ? (I(), P("li", w({
                key: 0,
                class: t.cx("emptyMessage"),
                role: "option"
              }, t.ptm("emptyMessage"), {
                "data-p-hidden-accessible": !0
              }), [M(t.$slots, "emptyfilter", {}, function() {
                return [lt(ue(o.emptyFilterMessageText), 1)];
              })], 16)) : !t.options || t.options && t.options.length === 0 ? (I(), P("li", w({
                key: 1,
                class: t.cx("emptyMessage"),
                role: "option"
              }, t.ptm("emptyMessage"), {
                "data-p-hidden-accessible": !0
              }), [M(t.$slots, "empty", {}, function() {
                return [lt(ue(o.emptyMessageText), 1)];
              })], 16)) : Q("", !0)], 16, gs)];
            }),
            _: 2
          }, [t.$slots.loader ? {
            name: "loader",
            fn: Oe(function(g) {
              var y = g.options;
              return [M(t.$slots, "loader", {
                options: y
              })];
            }),
            key: "0"
          } : void 0]), 1040, ["items", "style", "disabled", "pt"])], 16), M(t.$slots, "footer", {
            value: t.d_value,
            options: o.visibleOptions
          }), !t.options || t.options && t.options.length === 0 ? (I(), P("span", w({
            key: 1,
            role: "status",
            "aria-live": "polite",
            class: "p-hidden-accessible"
          }, t.ptm("hiddenEmptyMessage"), {
            "data-p-hidden-accessible": !0
          }), ue(o.emptyMessageText), 17)) : Q("", !0), B("span", w({
            role: "status",
            "aria-live": "polite",
            class: "p-hidden-accessible"
          }, t.ptm("hiddenSelectedMessage"), {
            "data-p-hidden-accessible": !0
          }), ue(o.selectedMessageText), 17), B("span", w({
            ref: "lastHiddenFocusableElementOnOverlay",
            role: "presentation",
            "aria-hidden": "true",
            class: "p-hidden-accessible p-hidden-focusable",
            tabindex: 0,
            onFocus: e[9] || (e[9] = function() {
              return o.onLastHiddenFocus && o.onLastHiddenFocus.apply(o, arguments);
            })
          }, t.ptm("hiddenLastFocusableEl"), {
            "data-p-hidden-accessible": !0,
            "data-p-hidden-focusable": !0
          }), null, 16)], 16, ms)) : Q("", !0)];
        }),
        _: 3
      }, 16, ["onEnter", "onAfterEnter", "onLeave", "onAfterLeave"])];
    }),
    _: 3
  }, 8, ["appendTo"])], 16, fs);
}
cs.render = bs;
const Ss = 2e3;
function Cn(t) {
  const e = t.margin ?? 8, n = t.gap ?? 4, i = Math.max(0, t.viewportWidth), r = Math.max(0, t.viewportHeight), o = Math.max(0, i - e * 2), s = Math.min(Math.max(0, t.requestedWidth), o), l = t.align === "right" ? t.anchor.right - s : t.anchor.left, a = Math.max(e, Math.min(l, i - e - s)), u = Math.max(0, r - t.anchor.bottom - n - e), d = Math.max(0, t.anchor.top - n - e), c = u < t.requestedMaxHeight && d > u ? "above" : "below", f = c === "above" ? d : u, p = Math.round(Math.min(Math.max(0, t.requestedMaxHeight), f)), m = Math.min(Math.max(0, t.panelHeight ?? p), p), v = c === "above" ? t.anchor.top - n - m : t.anchor.bottom + n, g = t.containingBlockOrigin ?? { left: 0, top: 0 };
  return {
    left: Math.round(a - g.left),
    width: Math.round(s),
    maxHeight: p,
    side: c,
    top: Math.round(v - g.top)
  };
}
const ks = /* @__PURE__ */ Mi({
  __name: "AnchoredPanel",
  props: {
    open: { type: Boolean },
    anchor: {},
    align: { default: "left" },
    width: { default: "anchor" },
    minWidth: { default: 0 },
    maxHeight: { default: 340 },
    gap: { default: 4 },
    zIndex: { default: Ss }
  },
  emits: ["update:open"],
  setup(t, { emit: e }) {
    const n = t, i = e, r = ke(null), o = ke({ position: "fixed", visibility: "hidden" });
    function s() {
      const v = n.anchor, g = r.value;
      if (!v || !g) return;
      const y = v.getBoundingClientRect(), b = n.width === "anchor" ? Math.max(n.minWidth, y.width) : Math.max(n.minWidth, n.width), O = {
        anchor: y,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
        requestedWidth: b,
        requestedMaxHeight: n.maxHeight,
        align: n.align,
        gap: n.gap
      }, h = Cn(O);
      Object.assign(g.style, {
        position: "fixed",
        left: "0px",
        top: "0px",
        right: "auto",
        bottom: "auto",
        width: `${h.width}px`,
        maxHeight: `${h.maxHeight}px`,
        visibility: "hidden"
      });
      const S = g.getBoundingClientRect(), T = Cn({
        ...O,
        containingBlockOrigin: { left: S.left, top: S.top },
        panelHeight: S.height
      }), $ = {
        position: "fixed",
        left: `${T.left}px`,
        top: `${T.top}px`,
        width: `${T.width}px`,
        maxHeight: `${T.maxHeight}px`,
        "--anchored-panel-available-height": `${T.maxHeight}px`,
        margin: "0",
        zIndex: String(n.zIndex),
        visibility: "visible"
      };
      o.value = $;
    }
    let l = null, a = !1;
    function u() {
      a || !n.open || (a = !0, requestAnimationFrame(() => {
        a = !1, n.open && s();
      }));
    }
    function d() {
      typeof ResizeObserver > "u" || (l = new ResizeObserver(u), r.value && l.observe(r.value), n.anchor && l.observe(n.anchor));
    }
    function c() {
      l?.disconnect(), l = null, a = !1;
    }
    Ce(() => n.open, async (v) => {
      c(), v && (o.value = { position: "fixed", visibility: "hidden" }, await In(), s(), d());
    }, { immediate: !0 });
    function f(v) {
      if (!n.open) return;
      const g = v.composedPath();
      r.value && g.includes(r.value) || n.anchor && g.includes(n.anchor) || i("update:open", !1);
    }
    function p(v) {
      n.open && v.key === "Escape" && i("update:open", !1);
    }
    function m() {
      n.open && s();
    }
    return document.addEventListener("click", f), document.addEventListener("keydown", p), window.addEventListener("resize", m), window.addEventListener("scroll", m, !0), Vi(() => {
      c(), document.removeEventListener("click", f), document.removeEventListener("keydown", p), window.removeEventListener("resize", m), window.removeEventListener("scroll", m, !0);
    }), (v, g) => t.open ? (I(), P("div", {
      key: 0,
      ref_key: "panel",
      ref: r,
      class: "anchored-panel",
      style: Fi(o.value)
    }, [
      M(v.$slots, "default")
    ], 4)) : Q("", !0);
  }
});
export {
  E as B,
  ur as C,
  Cs as I,
  sr as L,
  Ts as P,
  _o as R,
  er as S,
  ir as U,
  ht as W,
  pr as _,
  qe as a,
  Ft as b,
  _e as c,
  oe as d,
  C as e,
  Ie as f,
  $s as g,
  Os as h,
  Yn as i,
  jt as j,
  En as k,
  Ge as l,
  An as m,
  cs as n,
  ks as o,
  Is as r,
  x as s,
  ar as v,
  ut as x
};
//# sourceMappingURL=AnchoredPanel.vue_vue_type_style_index_0_lang-DdaB0Y7l.js.map

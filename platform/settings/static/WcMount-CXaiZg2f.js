import { ref as _e, readonly as jo, getCurrentInstance as Kt, onMounted as xn, nextTick as Pn, watch as $e, reactive as zo, renderSlot as A, openBlock as k, createBlock as le, Teleport as Ln, createCommentVNode as W, useId as Fo, mergeProps as S, h as Vo, createElementBlock as x, createElementVNode as V, createTextVNode as it, toDisplayString as ae, resolveComponent as X, resolveDirective as _n, withDirectives as An, resolveDynamicComponent as vt, withCtx as be, normalizeClass as Pe, Fragment as Ae, renderList as yt, createVNode as ve, Transition as Mo, normalizeProps as No, createSlots as Do, withModifiers as Bo, defineComponent as Ro, onBeforeUnmount as Ho } from "vue";
import { loadByTagName as Ko } from "@wippy-fe/proxy";
var Wo = Object.defineProperty, Wt = Object.getOwnPropertySymbols, Uo = Object.prototype.hasOwnProperty, Go = Object.prototype.propertyIsEnumerable, Ut = (t, e, n) => e in t ? Wo(t, e, { enumerable: !0, configurable: !0, writable: !0, value: n }) : t[e] = n, qo = (t, e) => {
  for (var n in e || (e = {})) Uo.call(e, n) && Ut(t, n, e[n]);
  if (Wt) for (var n of Wt(e)) Go.call(e, n) && Ut(t, n, e[n]);
  return t;
};
function Ce(t) {
  return t == null || t === "" || Array.isArray(t) && t.length === 0 || !(t instanceof Date) && typeof t == "object" && Object.keys(t).length === 0;
}
function St(t, e, n = /* @__PURE__ */ new WeakSet()) {
  if (t === e) return !0;
  if (!t || !e || typeof t != "object" || typeof e != "object" || n.has(t) || n.has(e)) return !1;
  n.add(t).add(e);
  let o = Array.isArray(t), r = Array.isArray(e), i, l, s;
  if (o && r) {
    if (l = t.length, l != e.length) return !1;
    for (i = l; i-- !== 0; ) if (!St(t[i], e[i], n)) return !1;
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
  for (i = l; i-- !== 0; ) if (s = p[i], !St(t[s], e[s], n)) return !1;
  return !0;
}
function Yo(t, e) {
  return St(t, e);
}
function ct(t) {
  return typeof t == "function" && "call" in t && "apply" in t;
}
function _(t) {
  return !Ce(t);
}
function pe(t, e) {
  if (!t || !e) return null;
  try {
    let n = t[e];
    if (_(n)) return n;
  } catch {
  }
  if (Object.keys(t).length) {
    if (ct(e)) return e(t);
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
function En(t, e, n) {
  return n ? pe(t, n) === pe(e, n) : Yo(t, e);
}
function ue(t, e = !0) {
  return t instanceof Object && t.constructor === Object && (e || Object.keys(t).length !== 0);
}
function jn(t = {}, e = {}) {
  let n = qo({}, t);
  return Object.keys(e).forEach((o) => {
    let r = o;
    ue(e[r]) && r in t && ue(t[r]) ? n[r] = jn(t[r], e[r]) : n[r] = e[r];
  }), n;
}
function Zo(...t) {
  return t.reduce((e, n, o) => o === 0 ? n : jn(e, n), {});
}
function Gt(t, e) {
  let n = -1;
  if (_(t)) try {
    n = t.findLastIndex(e);
  } catch {
    n = t.lastIndexOf([...t].reverse().find(e));
  }
  return n;
}
function Y(t, ...e) {
  return ct(t) ? t(...e) : t;
}
function U(t, e = !0) {
  return typeof t == "string" && (e || t !== "");
}
function se(t) {
  return U(t) ? t.replace(/(-|_)/g, "").toLowerCase() : t;
}
function Ft(t, e = "", n = {}) {
  let o = se(e).split("."), r = o.shift();
  if (r) {
    if (ue(t)) {
      let i = Object.keys(t).find((l) => se(l) === r) || "";
      return Ft(Y(t[i], n), o.join("."), n);
    }
    return;
  }
  return Y(t, n);
}
function zn(t, e = !0) {
  return Array.isArray(t) && (e || t.length !== 0);
}
function Jo(t) {
  return _(t) && !isNaN(t);
}
function Qo(t = "") {
  return _(t) && t.length === 1 && !!t.match(/\S| /);
}
function Oe(t, e) {
  if (e) {
    let n = e.test(t);
    return e.lastIndex = 0, n;
  }
  return !1;
}
function Xo(...t) {
  return Zo(...t);
}
function Me(t) {
  return t && t.replace(/\/\*(?:(?!\*\/)[\s\S])*\*\/|[\r\n\t]+/g, "").replace(/ {2,}/g, " ").replace(/ ([{:}]) /g, "$1").replace(/([;,]) /g, "$1").replace(/ !/g, "!").replace(/: /g, ":").trim();
}
function Q(t) {
  if (t && /[\xC0-\xFF\u0100-\u017E]/.test(t)) {
    let e = { A: /[\xC0-\xC5\u0100\u0102\u0104]/g, AE: /[\xC6]/g, C: /[\xC7\u0106\u0108\u010A\u010C]/g, D: /[\xD0\u010E\u0110]/g, E: /[\xC8-\xCB\u0112\u0114\u0116\u0118\u011A]/g, G: /[\u011C\u011E\u0120\u0122]/g, H: /[\u0124\u0126]/g, I: /[\xCC-\xCF\u0128\u012A\u012C\u012E\u0130]/g, IJ: /[\u0132]/g, J: /[\u0134]/g, K: /[\u0136]/g, L: /[\u0139\u013B\u013D\u013F\u0141]/g, N: /[\xD1\u0143\u0145\u0147\u014A]/g, O: /[\xD2-\xD6\xD8\u014C\u014E\u0150]/g, OE: /[\u0152]/g, R: /[\u0154\u0156\u0158]/g, S: /[\u015A\u015C\u015E\u0160]/g, T: /[\u0162\u0164\u0166]/g, U: /[\xD9-\xDC\u0168\u016A\u016C\u016E\u0170\u0172]/g, W: /[\u0174]/g, Y: /[\xDD\u0176\u0178]/g, Z: /[\u0179\u017B\u017D]/g, a: /[\xE0-\xE5\u0101\u0103\u0105]/g, ae: /[\xE6]/g, c: /[\xE7\u0107\u0109\u010B\u010D]/g, d: /[\u010F\u0111]/g, e: /[\xE8-\xEB\u0113\u0115\u0117\u0119\u011B]/g, g: /[\u011D\u011F\u0121\u0123]/g, i: /[\xEC-\xEF\u0129\u012B\u012D\u012F\u0131]/g, ij: /[\u0133]/g, j: /[\u0135]/g, k: /[\u0137,\u0138]/g, l: /[\u013A\u013C\u013E\u0140\u0142]/g, n: /[\xF1\u0144\u0146\u0148\u014B]/g, p: /[\xFE]/g, o: /[\xF2-\xF6\xF8\u014D\u014F\u0151]/g, oe: /[\u0153]/g, r: /[\u0155\u0157\u0159]/g, s: /[\u015B\u015D\u015F\u0161]/g, t: /[\u0163\u0165\u0167]/g, u: /[\xF9-\xFC\u0169\u016B\u016D\u016F\u0171\u0173]/g, w: /[\u0175]/g, y: /[\xFD\xFF\u0177]/g, z: /[\u017A\u017C\u017E]/g };
    for (let n in e) t = t.replace(e[n], n);
  }
  return t;
}
function er(t) {
  return U(t, !1) ? t[0].toUpperCase() + t.slice(1) : t;
}
function Fn(t) {
  return U(t) ? t.replace(/(_)/g, "-").replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase() : t;
}
function Vt() {
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
function ne(...t) {
  if (t) {
    let e = [];
    for (let n = 0; n < t.length; n++) {
      let o = t[n];
      if (!o) continue;
      let r = typeof o;
      if (r === "string" || r === "number") e.push(o);
      else if (r === "object") {
        let i = Array.isArray(o) ? [ne(...o)] : Object.entries(o).map(([l, s]) => s ? l : void 0);
        e = i.length ? e.concat(i.filter((l) => !!l)) : e;
      }
    }
    return e.join(" ").trim();
  }
}
function tr(t, e) {
  return t ? t.classList ? t.classList.contains(e) : new RegExp("(^| )" + e + "( |$)", "gi").test(t.className) : !1;
}
function nr(t, e) {
  if (t && e) {
    let n = (o) => {
      tr(t, o) || (t.classList ? t.classList.add(o) : t.className += " " + o);
    };
    [e].flat().filter(Boolean).forEach((o) => o.split(" ").forEach(n));
  }
}
function ht(t, e) {
  if (t && e) {
    let n = (o) => {
      t.classList ? t.classList.remove(o) : t.className = t.className.replace(new RegExp("(^|\\b)" + o.split(" ").join("|") + "(\\b|$)", "gi"), " ");
    };
    [e].flat().filter(Boolean).forEach((o) => o.split(" ").forEach(n));
  }
}
function wt(t) {
  for (let e of document?.styleSheets) try {
    for (let n of e?.cssRules) for (let o of n?.style) if (t.test(o)) return { name: o, value: n.style.getPropertyValue(o).trim() };
  } catch {
  }
  return null;
}
function Vn(t) {
  let e = { width: 0, height: 0 };
  if (t) {
    let [n, o] = [t.style.visibility, t.style.display], r = t.getBoundingClientRect();
    t.style.visibility = "hidden", t.style.display = "block", e.width = r.width || t.offsetWidth, e.height = r.height || t.offsetHeight, t.style.display = o, t.style.visibility = n;
  }
  return e;
}
function Mn() {
  let t = window, e = document, n = e.documentElement, o = e.getElementsByTagName("body")[0], r = t.innerWidth || n.clientWidth || o.clientWidth, i = t.innerHeight || n.clientHeight || o.clientHeight;
  return { width: r, height: i };
}
function $t(t) {
  return t ? Math.abs(t.scrollLeft) : 0;
}
function or() {
  let t = document.documentElement;
  return (window.pageXOffset || $t(t)) - (t.clientLeft || 0);
}
function rr() {
  let t = document.documentElement;
  return (window.pageYOffset || t.scrollTop) - (t.clientTop || 0);
}
function ir(t) {
  return t ? getComputedStyle(t).direction === "rtl" : !1;
}
function ar(t, e, n = !0) {
  var o, r, i, l;
  if (t) {
    let s = t.offsetParent ? { width: t.offsetWidth, height: t.offsetHeight } : Vn(t), a = s.height, u = s.width, d = e.offsetHeight, c = e.offsetWidth, p = e.getBoundingClientRect(), f = rr(), m = or(), v = Mn(), b, y, $ = "top";
    p.top + d + a > v.height ? (b = p.top + f - a, $ = "bottom", b < 0 && (b = f)) : b = d + p.top + f, p.left + u > v.width ? y = Math.max(0, p.left + m + c - u) : y = p.left + m, ir(t) ? t.style.insetInlineEnd = y + "px" : t.style.insetInlineStart = y + "px", t.style.top = b + "px", t.style.transformOrigin = $, n && (t.style.marginTop = $ === "bottom" ? `calc(${(r = (o = wt(/-anchor-gutter$/)) == null ? void 0 : o.value) != null ? r : "2px"} * -1)` : (l = (i = wt(/-anchor-gutter$/)) == null ? void 0 : i.value) != null ? l : "");
  }
}
function lr(t, e) {
  t && (typeof e == "string" ? t.style.cssText = e : Object.entries(e || {}).forEach(([n, o]) => t.style[n] = o));
}
function Nn(t, e) {
  return t instanceof HTMLElement ? t.offsetWidth : 0;
}
function sr(t, e, n = !0, o = void 0) {
  var r;
  if (t) {
    let i = t.offsetParent ? { width: t.offsetWidth, height: t.offsetHeight } : Vn(t), l = e.offsetHeight, s = e.getBoundingClientRect(), a = Mn(), u, d, c = o ?? "top";
    if (!o && s.top + l + i.height > a.height ? (u = -1 * i.height, c = "bottom", s.top + u < 0 && (u = -1 * s.top)) : u = l, i.width > a.width ? d = s.left * -1 : s.left + i.width > a.width ? d = (s.left + i.width - a.width) * -1 : d = 0, t.style.top = u + "px", t.style.insetInlineStart = d + "px", t.style.transformOrigin = c, n) {
      let p = (r = wt(/-anchor-gutter$/)) == null ? void 0 : r.value;
      t.style.marginTop = c === "bottom" ? `calc(${p ?? "2px"} * -1)` : p ?? "";
    }
  }
}
function Dn(t) {
  if (t) {
    let e = t.parentNode;
    return e && e instanceof ShadowRoot && e.host && (e = e.host), e;
  }
  return null;
}
function ur(t) {
  return !!(t !== null && typeof t < "u" && t.nodeName && Dn(t));
}
function Ee(t) {
  return typeof Element < "u" ? t instanceof Element : t !== null && typeof t == "object" && t.nodeType === 1 && typeof t.nodeName == "string";
}
function at(t, e = {}) {
  if (Ee(t)) {
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
        i ? t.addEventListener(i[1].toLowerCase(), r) : o === "p-bind" || o === "pBind" ? at(t, r) : (r = o === "class" ? [...new Set(n("class", r))].join(" ").trim() : o === "style" ? n("style", r).join(";").trim() : r, (t.$attrs = t.$attrs || {}) && (t.$attrs[o] = r), t.setAttribute(o, r));
      }
    });
  }
}
function dr(t, e = {}, ...n) {
  {
    let o = document.createElement(t);
    return at(o, e), o.append(...n), o;
  }
}
function cr(t, e) {
  return Ee(t) ? Array.from(t.querySelectorAll(e)) : [];
}
function pt(t, e) {
  return Ee(t) ? t.matches(e) ? t : t.querySelector(e) : null;
}
function de(t, e) {
  t && document.activeElement !== t && t.focus(e);
}
function pr(t, e) {
  if (Ee(t)) {
    let n = t.getAttribute(e);
    return isNaN(n) ? n === "true" || n === "false" ? n === "true" : n : +n;
  }
}
function Mt(t, e = "") {
  let n = cr(t, `button:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${e},
            [href]:not([tabindex = "-1"]):not([style*="display:none"]):not([hidden])${e},
            input:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${e},
            select:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${e},
            textarea:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${e},
            [tabIndex]:not([tabIndex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${e},
            [contenteditable]:not([tabIndex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${e}`), o = [];
  for (let r of n) getComputedStyle(r).display != "none" && getComputedStyle(r).visibility != "hidden" && o.push(r);
  return o;
}
function fr(t, e) {
  let n = Mt(t, e);
  return n.length > 0 ? n[0] : null;
}
function Se(t) {
  if (t) {
    let e = t.offsetHeight, n = getComputedStyle(t);
    return e -= parseFloat(n.paddingTop) + parseFloat(n.paddingBottom) + parseFloat(n.borderTopWidth) + parseFloat(n.borderBottomWidth), e;
  }
  return 0;
}
function hr(t, e) {
  let n = Mt(t, e);
  return n.length > 0 ? n[n.length - 1] : null;
}
function mr(t) {
  if (t) {
    let e = t.getBoundingClientRect();
    return { top: e.top + (window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0), left: e.left + (window.pageXOffset || $t(document.documentElement) || $t(document.body) || 0) };
  }
  return { top: "auto", left: "auto" };
}
function gr(t, e) {
  return t ? t.offsetHeight : 0;
}
function Bn(t, e = []) {
  let n = Dn(t);
  return n === null ? e : Bn(n, e.concat([n]));
}
function br(t) {
  let e = [];
  if (t) {
    let n = Bn(t), o = /(auto|scroll)/, r = (i) => {
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
          let u = pt(i, a);
          u && r(u) && e.push(u);
        }
      }
      i.nodeType !== 9 && r(i) && e.push(i);
    }
  }
  return e;
}
function we(t) {
  if (t) {
    let e = t.offsetWidth, n = getComputedStyle(t);
    return e -= parseFloat(n.paddingLeft) + parseFloat(n.paddingRight) + parseFloat(n.borderLeftWidth) + parseFloat(n.borderRightWidth), e;
  }
  return 0;
}
function vr() {
  return /(android)/i.test(navigator.userAgent);
}
function Rn() {
  return !!(typeof window < "u" && window.document && window.document.createElement);
}
function lt(t) {
  return !!(t && t.offsetParent != null);
}
function yr() {
  return "ontouchstart" in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;
}
function Sr(t, e = "", n) {
  Ee(t) && n !== null && n !== void 0 && t.setAttribute(e, n);
}
var tt = {};
function wr(t = "pui_id_") {
  return Object.hasOwn(tt, t) || (tt[t] = 0), tt[t]++, `${t}${tt[t]}`;
}
function $r() {
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
var mt = $r(), Or = Object.defineProperty, kr = Object.defineProperties, Cr = Object.getOwnPropertyDescriptors, st = Object.getOwnPropertySymbols, Hn = Object.prototype.hasOwnProperty, Kn = Object.prototype.propertyIsEnumerable, qt = (t, e, n) => e in t ? Or(t, e, { enumerable: !0, configurable: !0, writable: !0, value: n }) : t[e] = n, te = (t, e) => {
  for (var n in e || (e = {})) Hn.call(e, n) && qt(t, n, e[n]);
  if (st) for (var n of st(e)) Kn.call(e, n) && qt(t, n, e[n]);
  return t;
}, gt = (t, e) => kr(t, Cr(e)), ce = (t, e) => {
  var n = {};
  for (var o in t) Hn.call(t, o) && e.indexOf(o) < 0 && (n[o] = t[o]);
  if (t != null && st) for (var o of st(t)) e.indexOf(o) < 0 && Kn.call(t, o) && (n[o] = t[o]);
  return n;
}, Ir = Vt(), B = Ir, Ne = /{([^}]*)}/g, Wn = /(\d+\s+[\+\-\*\/]\s+\d+)/g, Un = /var\([^)]+\)/g;
function Yt(t) {
  return U(t) ? t.replace(/[A-Z]/g, (e, n) => n === 0 ? e : "." + e.toLowerCase()).toLowerCase() : t;
}
function Tr(t) {
  return ue(t) && t.hasOwnProperty("$value") && t.hasOwnProperty("$type") ? t.$value : t;
}
function xr(t) {
  return t.replaceAll(/ /g, "").replace(/[^\w]/g, "-");
}
function Ot(t = "", e = "") {
  return xr(`${U(t, !1) && U(e, !1) ? `${t}-` : t}${e}`);
}
function Gn(t = "", e = "") {
  return `--${Ot(t, e)}`;
}
function Pr(t = "") {
  let e = (t.match(/{/g) || []).length, n = (t.match(/}/g) || []).length;
  return (e + n) % 2 !== 0;
}
function qn(t, e = "", n = "", o = [], r) {
  if (U(t)) {
    let i = t.trim();
    if (Pr(i)) return;
    if (Oe(i, Ne)) {
      let l = i.replaceAll(Ne, (s) => {
        let a = s.replace(/{|}/g, "").split(".").filter((u) => !o.some((d) => Oe(u, d)));
        return `var(${Gn(n, Fn(a.join("-")))}${_(r) ? `, ${r}` : ""})`;
      });
      return Oe(l.replace(Un, "0"), Wn) ? `calc(${l})` : l;
    }
    return i;
  } else if (Jo(t)) return t;
}
function Lr(t, e, n) {
  U(e, !1) && t.push(`${e}:${n};`);
}
function xe(t, e) {
  return t ? `${t}{${e}}` : "";
}
function Yn(t, e) {
  if (t.indexOf("dt(") === -1) return t;
  function n(l, s) {
    let a = [], u = 0, d = "", c = null, p = 0;
    for (; u <= l.length; ) {
      let f = l[u];
      if ((f === '"' || f === "'" || f === "`") && l[u - 1] !== "\\" && (c = c === f ? null : f), !c && (f === "(" && p++, f === ")" && p--, (f === "," || u === l.length) && p === 0)) {
        let m = d.trim();
        m.startsWith("dt(") ? a.push(Yn(m, s)) : a.push(o(m)), d = "", u++;
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
var ke = (...t) => _r(j.getTheme(), ...t), _r = (t = {}, e, n, o) => {
  if (e) {
    let { variable: r, options: i } = j.defaults || {}, { prefix: l, transform: s } = t?.options || i || {}, a = Oe(e, Ne) ? e : `{${e}}`;
    return o === "value" || Ce(o) && s === "strict" ? j.getTokenValue(e) : qn(a, void 0, l, [r.excludedKeyRegex], n);
  }
  return "";
};
function nt(t, ...e) {
  if (t instanceof Array) {
    let n = t.reduce((o, r, i) => {
      var l;
      return o + r + ((l = Y(e[i], { dt: ke })) != null ? l : "");
    }, "");
    return Yn(n, ke);
  }
  return Y(t, { dt: ke });
}
function Ar(t, e = {}) {
  let n = j.defaults.variable, { prefix: o = n.prefix, selector: r = n.selector, excludedKeyRegex: i = n.excludedKeyRegex } = e, l = [], s = [], a = [{ node: t, path: o }];
  for (; a.length; ) {
    let { node: d, path: c } = a.pop();
    for (let p in d) {
      let f = d[p], m = Tr(f), v = Oe(p, i) ? Ot(c) : Ot(c, Fn(p));
      if (ue(m)) a.push({ node: m, path: v });
      else {
        let b = Gn(v), y = qn(m, v, o, [i]);
        Lr(s, b, y);
        let $ = v;
        o && $.startsWith(o + "-") && ($ = $.slice(o.length + 1)), l.push($.replace(/-/g, "."));
      }
    }
  }
  let u = s.join("");
  return { value: s, tokens: l, declarations: u, css: xe(r, u) };
}
var ee = { regex: { rules: { class: { pattern: /^\.([a-zA-Z][\w-]*)$/, resolve(t) {
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
  return Ar(t, { prefix: e?.prefix });
}, getCommon({ name: t = "", theme: e = {}, params: n, set: o, defaults: r }) {
  var i, l, s, a, u, d, c;
  let { preset: p, options: f } = e, m, v, b, y, $, C, h;
  if (_(p) && f.transform !== "strict") {
    let { primitive: g, semantic: I, extend: w } = p, O = I || {}, { colorScheme: F } = O, N = ce(O, ["colorScheme"]), z = w || {}, { colorScheme: M } = z, G = ce(z, ["colorScheme"]), q = F || {}, { dark: D } = q, H = ce(q, ["dark"]), Z = M || {}, { dark: fe } = Z, oe = ce(Z, ["dark"]), J = _(g) ? this._toVariables({ primitive: g }, f) : {}, re = _(N) ? this._toVariables({ semantic: N }, f) : {}, ge = _(H) ? this._toVariables({ light: H }, f) : {}, et = _(D) ? this._toVariables({ dark: D }, f) : {}, Te = _(G) ? this._toVariables({ semantic: G }, f) : {}, Rt = _(oe) ? this._toVariables({ light: oe }, f) : {}, Ht = _(fe) ? this._toVariables({ dark: fe }, f) : {}, [go, bo] = [(i = J.declarations) != null ? i : "", J.tokens], [vo, yo] = [(l = re.declarations) != null ? l : "", re.tokens || []], [So, wo] = [(s = ge.declarations) != null ? s : "", ge.tokens || []], [$o, Oo] = [(a = et.declarations) != null ? a : "", et.tokens || []], [ko, Co] = [(u = Te.declarations) != null ? u : "", Te.tokens || []], [Io, To] = [(d = Rt.declarations) != null ? d : "", Rt.tokens || []], [xo, Po] = [(c = Ht.declarations) != null ? c : "", Ht.tokens || []];
    m = this.transformCSS(t, go, "light", "variable", f, o, r), v = bo;
    let Lo = this.transformCSS(t, `${vo}${So}`, "light", "variable", f, o, r), _o = this.transformCSS(t, `${$o}`, "dark", "variable", f, o, r);
    b = `${Lo}${_o}`, y = [.../* @__PURE__ */ new Set([...yo, ...wo, ...Oo])];
    let Ao = this.transformCSS(t, `${ko}${Io}color-scheme:light`, "light", "variable", f, o, r), Eo = this.transformCSS(t, `${xo}color-scheme:dark`, "dark", "variable", f, o, r);
    $ = `${Ao}${Eo}`, C = [.../* @__PURE__ */ new Set([...Co, ...To, ...Po])], h = Y(p.css, { dt: ke });
  }
  return { primitive: { css: m, tokens: v }, semantic: { css: b, tokens: y }, global: { css: $, tokens: C }, style: h };
}, getPreset({ name: t = "", preset: e = {}, options: n, params: o, set: r, defaults: i, selector: l }) {
  var s, a, u;
  let d, c, p;
  if (_(e) && n.transform !== "strict") {
    let f = t.replace("-directive", ""), m = e, { colorScheme: v, extend: b, css: y } = m, $ = ce(m, ["colorScheme", "extend", "css"]), C = b || {}, { colorScheme: h } = C, g = ce(C, ["colorScheme"]), I = v || {}, { dark: w } = I, O = ce(I, ["dark"]), F = h || {}, { dark: N } = F, z = ce(F, ["dark"]), M = _($) ? this._toVariables({ [f]: te(te({}, $), g) }, n) : {}, G = _(O) ? this._toVariables({ [f]: te(te({}, O), z) }, n) : {}, q = _(w) ? this._toVariables({ [f]: te(te({}, w), N) }, n) : {}, [D, H] = [(s = M.declarations) != null ? s : "", M.tokens || []], [Z, fe] = [(a = G.declarations) != null ? a : "", G.tokens || []], [oe, J] = [(u = q.declarations) != null ? u : "", q.tokens || []], re = this.transformCSS(f, `${D}${Z}`, "light", "variable", n, r, i, l), ge = this.transformCSS(f, oe, "dark", "variable", n, r, i, l);
    d = `${re}${ge}`, c = [.../* @__PURE__ */ new Set([...H, ...fe, ...J])], p = Y(y, { dt: ke });
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
  return r ? `@layer ${Y(r.order || r.name || "primeui", n)}` : "";
}, getCommonStyleSheet({ name: t = "", theme: e = {}, params: n, props: o = {}, set: r, defaults: i }) {
  let l = this.getCommon({ name: t, theme: e, params: n, set: r, defaults: i }), s = Object.entries(o).reduce((a, [u, d]) => a.push(`${u}="${d}"`) && a, []).join(" ");
  return Object.entries(l || {}).reduce((a, [u, d]) => {
    if (ue(d) && Object.hasOwn(d, "css")) {
      let c = Me(d.css), p = `${u}-variables`;
      a.push(`<style type="text/css" data-primevue-style-id="${p}" ${s}>${c}</style>`);
    }
    return a;
  }, []).join("");
}, getStyleSheet({ name: t = "", theme: e = {}, params: n, props: o = {}, set: r, defaults: i }) {
  var l;
  let s = { name: t, theme: e, params: n, set: r, defaults: i }, a = (l = t.includes("-directive") ? this.getPresetD(s) : this.getPresetC(s)) == null ? void 0 : l.css, u = Object.entries(o).reduce((d, [c, p]) => d.push(`${c}="${p}"`) && d, []).join(" ");
  return a ? `<style type="text/css" data-primevue-style-id="${t}-variables" ${u}>${Me(a)}</style>` : "";
}, createTokens(t = {}, e, n = "", o = "", r = {}) {
  let i = function(s, a = {}, u = []) {
    if (u.includes(this.path)) return console.warn(`Circular reference detected at ${this.path}`), { colorScheme: s, path: this.path, paths: a, value: void 0 };
    u.push(this.path), a.name = this.path, a.binding || (a.binding = {});
    let d = this.value;
    if (typeof this.value == "string" && Ne.test(this.value)) {
      let c = this.value.trim().replace(Ne, (p) => {
        var f;
        let m = p.slice(1, -1), v = this.tokens[m];
        if (!v) return console.warn(`Token not found for path: ${m}`), "__UNRESOLVED__";
        let b = v.computed(s, a, u);
        return Array.isArray(b) && b.length === 2 ? `light-dark(${b[0].value},${b[1].value})` : (f = b?.value) != null ? f : "__UNRESOLVED__";
      });
      d = Wn.test(c.replace(Un, "0")) ? `calc(${c})` : c;
    }
    return Ce(a.binding) && delete a.binding, u.pop(), { colorScheme: s, path: this.path, paths: a, value: d.includes("__UNRESOLVED__") ? void 0 : d };
  }, l = (s, a, u) => {
    Object.entries(s).forEach(([d, c]) => {
      let p = Oe(d, e.variable.excludedKeyRegex) ? a : a ? `${a}.${Yt(d)}` : Yt(d), f = u ? `${u}.${d}` : d;
      ue(c) ? l(c, p, f) : (r[p] || (r[p] = { paths: [], computed: (m, v = {}, b = []) => {
        if (r[p].paths.length === 1) return r[p].paths[0].computed(r[p].paths[0].scheme, v.binding, b);
        if (m && m !== "none") for (let y = 0; y < r[p].paths.length; y++) {
          let $ = r[p].paths[y];
          if ($.scheme === m) return $.computed(m, v.binding, b);
        }
        return r[p].paths.map((y) => y.computed(y.scheme, v[y.scheme], b));
      } }), r[p].paths.push({ path: f, value: c, scheme: f.includes("colorScheme.light") ? "light" : f.includes("colorScheme.dark") ? "dark" : "none", computed: i, tokens: r }));
    });
  };
  return l(t, n, o), r;
}, getTokenValue(t, e, n) {
  var o;
  let r = ((s) => s.split(".").filter((a) => !Oe(a.toLowerCase(), n.variable.excludedKeyRegex)).join("."))(e), i = e.includes("colorScheme.light") ? "light" : e.includes("colorScheme.dark") ? "dark" : void 0, l = [(o = t[r]) == null ? void 0 : o.computed(i)].flat().filter((s) => s);
  return l.length === 1 ? l[0].value : l.reduce((s = {}, a) => {
    let u = a, { colorScheme: d } = u, c = ce(u, ["colorScheme"]);
    return s[d] = c, s;
  }, void 0);
}, getSelectorRule(t, e, n, o) {
  return n === "class" || n === "attr" ? xe(_(e) ? `${t}${e},${t} ${e}` : t, o) : xe(t, xe(e ?? ":root,:host", o));
}, transformCSS(t, e, n, o, r = {}, i, l, s) {
  if (_(e)) {
    let { cssLayer: a } = r;
    if (o !== "style") {
      let u = this.getColorSchemeOption(r, l);
      e = n === "dark" ? u.reduce((d, { type: c, selector: p }) => (_(p) && (d += p.includes("[CSS]") ? p.replace("[CSS]", e) : this.getSelectorRule(p, s, c, e)), d), "") : xe(s ?? ":root,:host", e);
    }
    if (a) {
      let u = { name: "primeui" };
      ue(a) && (u.name = Y(a.name, { name: t, type: o })), _(u.name) && (e = xe(`@layer ${u.name}`, e), i?.layerNames(u.name));
    }
    return e;
  }
  return "";
} }, j = { defaults: { variable: { prefix: "p", selector: ":root,:host", excludedKeyRegex: /^(primitive|semantic|components|directives|variables|colorscheme|light|dark|common|root|states|extend|css)$/gi }, options: { prefix: "p", darkModeSelector: "system", cssLayer: !1 } }, _theme: void 0, _layerNames: /* @__PURE__ */ new Set(), _loadedStyleNames: /* @__PURE__ */ new Set(), _loadingStyles: /* @__PURE__ */ new Set(), _tokens: {}, update(t = {}) {
  let { theme: e } = t;
  e && (this._theme = gt(te({}, e), { options: te(te({}, this.defaults.options), e.options) }), this._tokens = ee.createTokens(this.preset, this.defaults), this.clearLoadedStyleNames());
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
  this.update({ theme: t }), B.emit("theme:change", t);
}, getPreset() {
  return this.preset;
}, setPreset(t) {
  this._theme = gt(te({}, this.theme), { preset: t }), this._tokens = ee.createTokens(t, this.defaults), this.clearLoadedStyleNames(), B.emit("preset:change", t), B.emit("theme:change", this.theme);
}, getOptions() {
  return this.options;
}, setOptions(t) {
  this._theme = gt(te({}, this.theme), { options: t }), this.clearLoadedStyleNames(), B.emit("options:change", t), B.emit("theme:change", this.theme);
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
  return ee.getTokenValue(this.tokens, t, this.defaults);
}, getCommon(t = "", e) {
  return ee.getCommon({ name: t, theme: this.theme, params: e, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } });
}, getComponent(t = "", e) {
  let n = { name: t, theme: this.theme, params: e, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } };
  return ee.getPresetC(n);
}, getDirective(t = "", e) {
  let n = { name: t, theme: this.theme, params: e, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } };
  return ee.getPresetD(n);
}, getCustomPreset(t = "", e, n, o) {
  let r = { name: t, preset: e, options: this.options, selector: n, params: o, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } };
  return ee.getPreset(r);
}, getLayerOrderCSS(t = "") {
  return ee.getLayerOrder(t, this.options, { names: this.getLayerNames() }, this.defaults);
}, transformCSS(t = "", e, n = "style", o) {
  return ee.transformCSS(t, e, o, n, this.options, { layerNames: this.setLayerNames.bind(this) }, this.defaults);
}, getCommonStyleSheet(t = "", e, n = {}) {
  return ee.getCommonStyleSheet({ name: t, theme: this.theme, params: e, props: n, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } });
}, getStyleSheet(t, e, n = {}) {
  return ee.getStyleSheet({ name: t, theme: this.theme, params: e, props: n, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } });
}, onStyleMounted(t) {
  this._loadingStyles.add(t);
}, onStyleUpdated(t) {
  this._loadingStyles.add(t);
}, onStyleLoaded(t, { name: e }) {
  this._loadingStyles.size && (this._loadingStyles.delete(e), B.emit(`theme:${e}:load`, t), !this._loadingStyles.size && B.emit("theme:load"));
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
function Zt(t, e) {
  var n = typeof Symbol < "u" && t[Symbol.iterator] || t["@@iterator"];
  if (!n) {
    if (Array.isArray(t) || (n = Er(t)) || e) {
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
function Er(t, e) {
  if (t) {
    if (typeof t == "string") return Jt(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Jt(t, e) : void 0;
  }
}
function Jt(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, o = Array(e); n < e; n++) o[n] = t[n];
  return o;
}
var jr = {
  filter: function(e, n, o, r, i) {
    var l = [];
    if (!e)
      return l;
    var s = Zt(e), a;
    try {
      for (s.s(); !(a = s.n()).done; ) {
        var u = a.value;
        if (typeof u == "string") {
          if (this.filters[r](u, o, i)) {
            l.push(u);
            continue;
          }
        } else {
          var d = Zt(n), c;
          try {
            for (d.s(); !(c = d.n()).done; ) {
              var p = c.value, f = pe(u, p);
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
      var r = Q(n.toString()).toLocaleLowerCase(o), i = Q(e.toString()).toLocaleLowerCase(o);
      return i.slice(0, r.length) === r;
    },
    contains: function(e, n, o) {
      if (n == null || n === "")
        return !0;
      if (e == null)
        return !1;
      var r = Q(n.toString()).toLocaleLowerCase(o), i = Q(e.toString()).toLocaleLowerCase(o);
      return i.indexOf(r) !== -1;
    },
    notContains: function(e, n, o) {
      if (n == null || n === "")
        return !0;
      if (e == null)
        return !1;
      var r = Q(n.toString()).toLocaleLowerCase(o), i = Q(e.toString()).toLocaleLowerCase(o);
      return i.indexOf(r) === -1;
    },
    endsWith: function(e, n, o) {
      if (n == null || n === "")
        return !0;
      if (e == null)
        return !1;
      var r = Q(n.toString()).toLocaleLowerCase(o), i = Q(e.toString()).toLocaleLowerCase(o);
      return i.indexOf(r, i.length - r.length) !== -1;
    },
    equals: function(e, n, o) {
      return n == null || n === "" ? !0 : e == null ? !1 : e.getTime && n.getTime ? e.getTime() === n.getTime() : Q(e.toString()).toLocaleLowerCase(o) == Q(n.toString()).toLocaleLowerCase(o);
    },
    notEquals: function(e, n, o) {
      return n == null || n === "" ? !1 : e == null ? !0 : e.getTime && n.getTime ? e.getTime() !== n.getTime() : Q(e.toString()).toLocaleLowerCase(o) != Q(n.toString()).toLocaleLowerCase(o);
    },
    in: function(e, n) {
      if (n == null || n.length === 0)
        return !0;
      for (var o = 0; o < n.length; o++)
        if (En(e, n[o]))
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
}, zr = `
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
function De(t) {
  "@babel/helpers - typeof";
  return De = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, De(t);
}
function Qt(t, e) {
  var n = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(t);
    e && (o = o.filter(function(r) {
      return Object.getOwnPropertyDescriptor(t, r).enumerable;
    })), n.push.apply(n, o);
  }
  return n;
}
function Xt(t) {
  for (var e = 1; e < arguments.length; e++) {
    var n = arguments[e] != null ? arguments[e] : {};
    e % 2 ? Qt(Object(n), !0).forEach(function(o) {
      Fr(t, o, n[o]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(n)) : Qt(Object(n)).forEach(function(o) {
      Object.defineProperty(t, o, Object.getOwnPropertyDescriptor(n, o));
    });
  }
  return t;
}
function Fr(t, e, n) {
  return (e = Vr(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function Vr(t) {
  var e = Mr(t, "string");
  return De(e) == "symbol" ? e : e + "";
}
function Mr(t, e) {
  if (De(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(t, e);
    if (De(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
function Nr(t) {
  var e = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0;
  Kt() && Kt().components ? xn(t) : e ? t() : Pn(t);
}
var Dr = 0;
function Br(t) {
  var e = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, n = _e(!1), o = _e(t), r = _e(null), i = Rn() ? window.document : void 0, l = e.document, s = l === void 0 ? i : l, a = e.immediate, u = a === void 0 ? !0 : a, d = e.manual, c = d === void 0 ? !1 : d, p = e.name, f = p === void 0 ? "style_".concat(++Dr) : p, m = e.id, v = m === void 0 ? void 0 : m, b = e.media, y = b === void 0 ? void 0 : b, $ = e.nonce, C = $ === void 0 ? void 0 : $, h = e.first, g = h === void 0 ? !1 : h, I = e.onMounted, w = I === void 0 ? void 0 : I, O = e.onUpdated, F = O === void 0 ? void 0 : O, N = e.onLoad, z = N === void 0 ? void 0 : N, M = e.props, G = M === void 0 ? {} : M, q = function() {
  }, D = function(fe) {
    var oe = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    if (s) {
      var J = Xt(Xt({}, G), oe), re = J.name || f, ge = J.id || v, et = J.nonce || C;
      r.value = s.querySelector('style[data-primevue-style-id="'.concat(re, '"]')) || s.getElementById(ge) || s.createElement("style"), r.value.isConnected || (o.value = fe || t, at(r.value, {
        type: "text/css",
        id: ge,
        media: y,
        nonce: et
      }), g ? s.head.prepend(r.value) : s.head.appendChild(r.value), Sr(r.value, "data-primevue-style-id", re), at(r.value, J), r.value.onload = function(Te) {
        return z?.(Te, {
          name: re
        });
      }, w?.(re)), !n.value && (q = $e(o, function(Te) {
        r.value.textContent = Te, F?.(re);
      }, {
        immediate: !0
      }), n.value = !0);
    }
  }, H = function() {
    !s || !n.value || (q(), ur(r.value) && s.head.removeChild(r.value), n.value = !1, r.value = null);
  };
  return u && !c && Nr(D), {
    id: v,
    name: f,
    el: r,
    css: o,
    unload: H,
    load: D,
    isLoaded: jo(n)
  };
}
function Be(t) {
  "@babel/helpers - typeof";
  return Be = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, Be(t);
}
var en, tn, nn, on;
function rn(t, e) {
  return Wr(t) || Kr(t, e) || Hr(t, e) || Rr();
}
function Rr() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Hr(t, e) {
  if (t) {
    if (typeof t == "string") return an(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? an(t, e) : void 0;
  }
}
function an(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, o = Array(e); n < e; n++) o[n] = t[n];
  return o;
}
function Kr(t, e) {
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
function Wr(t) {
  if (Array.isArray(t)) return t;
}
function ln(t, e) {
  var n = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(t);
    e && (o = o.filter(function(r) {
      return Object.getOwnPropertyDescriptor(t, r).enumerable;
    })), n.push.apply(n, o);
  }
  return n;
}
function bt(t) {
  for (var e = 1; e < arguments.length; e++) {
    var n = arguments[e] != null ? arguments[e] : {};
    e % 2 ? ln(Object(n), !0).forEach(function(o) {
      Ur(t, o, n[o]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(n)) : ln(Object(n)).forEach(function(o) {
      Object.defineProperty(t, o, Object.getOwnPropertyDescriptor(n, o));
    });
  }
  return t;
}
function Ur(t, e, n) {
  return (e = Gr(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function Gr(t) {
  var e = qr(t, "string");
  return Be(e) == "symbol" ? e : e + "";
}
function qr(t, e) {
  if (Be(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(t, e);
    if (Be(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
function ot(t, e) {
  return e || (e = t.slice(0)), Object.freeze(Object.defineProperties(t, { raw: { value: Object.freeze(e) } }));
}
var Yr = function(e) {
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
}, Zr = {}, Jr = {}, E = {
  name: "base",
  css: Yr,
  style: zr,
  classes: Zr,
  inlineStyles: Jr,
  load: function(e) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, o = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : function(i) {
      return i;
    }, r = o(nt(en || (en = ot(["", ""])), e));
    return _(r) ? Br(Me(r), bt({
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
      return j.transformCSS(n.name || e.name, "".concat(r).concat(nt(tn || (tn = ot(["", ""])), o)));
    });
  },
  getCommonTheme: function(e) {
    return j.getCommon(this.name, e);
  },
  getComponentTheme: function(e) {
    return j.getComponent(this.name, e);
  },
  getDirectiveTheme: function(e) {
    return j.getDirective(this.name, e);
  },
  getPresetTheme: function(e, n, o) {
    return j.getCustomPreset(this.name, e, n, o);
  },
  getLayerOrderThemeCSS: function() {
    return j.getLayerOrderCSS(this.name);
  },
  getStyleSheet: function() {
    var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    if (this.css) {
      var o = Y(this.css, {
        dt: ke
      }) || "", r = Me(nt(nn || (nn = ot(["", "", ""])), o, e)), i = Object.entries(n).reduce(function(l, s) {
        var a = rn(s, 2), u = a[0], d = a[1];
        return l.push("".concat(u, '="').concat(d, '"')) && l;
      }, []).join(" ");
      return _(r) ? '<style type="text/css" data-primevue-style-id="'.concat(this.name, '" ').concat(i, ">").concat(r, "</style>") : "";
    }
    return "";
  },
  getCommonThemeStyleSheet: function(e) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    return j.getCommonStyleSheet(this.name, e, n);
  },
  getThemeStyleSheet: function(e) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, o = [j.getStyleSheet(this.name, e, n)];
    if (this.style) {
      var r = this.name === "base" ? "global-style" : "".concat(this.name, "-style"), i = nt(on || (on = ot(["", ""])), Y(this.style, {
        dt: ke
      })), l = Me(j.transformCSS(r, i)), s = Object.entries(n).reduce(function(a, u) {
        var d = rn(u, 2), c = d[0], p = d[1];
        return a.push("".concat(c, '="').concat(p, '"')) && a;
      }, []).join(" ");
      _(l) && o.push('<style type="text/css" data-primevue-style-id="'.concat(r, '" ').concat(s, ">").concat(l, "</style>"));
    }
    return o.join("");
  },
  extend: function(e) {
    return bt(bt({}, this), {}, {
      css: void 0,
      style: void 0
    }, e);
  }
}, me = Vt();
function Re(t) {
  "@babel/helpers - typeof";
  return Re = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, Re(t);
}
function sn(t, e) {
  var n = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(t);
    e && (o = o.filter(function(r) {
      return Object.getOwnPropertyDescriptor(t, r).enumerable;
    })), n.push.apply(n, o);
  }
  return n;
}
function rt(t) {
  for (var e = 1; e < arguments.length; e++) {
    var n = arguments[e] != null ? arguments[e] : {};
    e % 2 ? sn(Object(n), !0).forEach(function(o) {
      Qr(t, o, n[o]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(n)) : sn(Object(n)).forEach(function(o) {
      Object.defineProperty(t, o, Object.getOwnPropertyDescriptor(n, o));
    });
  }
  return t;
}
function Qr(t, e, n) {
  return (e = Xr(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function Xr(t) {
  var e = ei(t, "string");
  return Re(e) == "symbol" ? e : e + "";
}
function ei(t, e) {
  if (Re(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(t, e);
    if (Re(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var ti = {
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
}, ni = Symbol();
function oi(t, e) {
  var n = {
    config: zo(e)
  };
  return t.config.globalProperties.$primevue = n, t.provide(ni, n), ri(), ii(t, n), n;
}
var Le = [];
function ri() {
  B.clear(), Le.forEach(function(t) {
    return t?.();
  }), Le = [];
}
function ii(t, e) {
  var n = _e(!1), o = function() {
    var u;
    if (((u = e.config) === null || u === void 0 ? void 0 : u.theme) !== "none" && !j.isStyleNameLoaded("common")) {
      var d, c, p = ((d = E.getCommonTheme) === null || d === void 0 ? void 0 : d.call(E)) || {}, f = p.primitive, m = p.semantic, v = p.global, b = p.style, y = {
        nonce: (c = e.config) === null || c === void 0 || (c = c.csp) === null || c === void 0 ? void 0 : c.nonce
      };
      E.load(f?.css, rt({
        name: "primitive-variables"
      }, y)), E.load(m?.css, rt({
        name: "semantic-variables"
      }, y)), E.load(v?.css, rt({
        name: "global-variables"
      }, y)), E.loadStyle(rt({
        name: "global-style"
      }, y), b), j.setLoadedStyleName("common");
    }
  };
  B.on("theme:change", function(a) {
    n.value || (t.config.globalProperties.$primevue.config.theme = a, n.value = !0);
  });
  var r = $e(e.config, function(a, u) {
    me.emit("config:change", {
      newValue: a,
      oldValue: u
    });
  }, {
    immediate: !0,
    deep: !0
  }), i = $e(function() {
    return e.config.ripple;
  }, function(a, u) {
    me.emit("config:ripple:change", {
      newValue: a,
      oldValue: u
    });
  }, {
    immediate: !0,
    deep: !0
  }), l = $e(function() {
    return e.config.theme;
  }, function(a, u) {
    n.value || j.setTheme(a), e.config.unstyled || o(), n.value = !1, me.emit("config:theme:change", {
      newValue: a,
      oldValue: u
    });
  }, {
    immediate: !0,
    deep: !1
  }), s = $e(function() {
    return e.config.unstyled;
  }, function(a, u) {
    !a && e.config.theme && o(), me.emit("config:unstyled:change", {
      newValue: a,
      oldValue: u
    });
  }, {
    immediate: !0,
    deep: !0
  });
  Le.push(r), Le.push(i), Le.push(l), Le.push(s);
}
var ai = {
  install: function(e, n) {
    var o = Xo(ti, n);
    oi(e, o);
  }
}, Nt = {
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
    this.mounted = Rn();
  },
  computed: {
    inline: function() {
      return this.disabled || this.appendTo === "self";
    }
  }
};
function li(t, e, n, o, r, i) {
  return i.inline ? A(t.$slots, "default", {
    key: 0
  }) : r.mounted ? (k(), le(Ln, {
    key: 1,
    to: n.appendTo
  }, [A(t.$slots, "default")], 8, ["to"])) : W("", !0);
}
Nt.render = li;
var he = {
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
function si() {
  var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "pc", e = Fo();
  return "".concat(t).concat(e.replace("v-", "").replaceAll("-", "_"));
}
var un = E.extend({
  name: "common"
});
function He(t) {
  "@babel/helpers - typeof";
  return He = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, He(t);
}
function ui(t) {
  return Qn(t) || di(t) || Jn(t) || Zn();
}
function di(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function ze(t, e) {
  return Qn(t) || ci(t, e) || Jn(t, e) || Zn();
}
function Zn() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Jn(t, e) {
  if (t) {
    if (typeof t == "string") return kt(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? kt(t, e) : void 0;
  }
}
function kt(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, o = Array(e); n < e; n++) o[n] = t[n];
  return o;
}
function ci(t, e) {
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
function Qn(t) {
  if (Array.isArray(t)) return t;
}
function dn(t, e) {
  var n = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(t);
    e && (o = o.filter(function(r) {
      return Object.getOwnPropertyDescriptor(t, r).enumerable;
    })), n.push.apply(n, o);
  }
  return n;
}
function P(t) {
  for (var e = 1; e < arguments.length; e++) {
    var n = arguments[e] != null ? arguments[e] : {};
    e % 2 ? dn(Object(n), !0).forEach(function(o) {
      Ve(t, o, n[o]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(n)) : dn(Object(n)).forEach(function(o) {
      Object.defineProperty(t, o, Object.getOwnPropertyDescriptor(n, o));
    });
  }
  return t;
}
function Ve(t, e, n) {
  return (e = pi(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function pi(t) {
  var e = fi(t, "string");
  return He(e) == "symbol" ? e : e + "";
}
function fi(t, e) {
  if (He(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(t, e);
    if (He(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var Ie = {
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
        B.off("theme:change", this._loadCoreStyles), e || (this._loadCoreStyles(), this._themeChangeListener(this._loadCoreStyles));
      }
    },
    dt: {
      immediate: !0,
      handler: function(e, n) {
        var o = this;
        B.off("theme:change", this._themeScopedListener), e ? (this._loadScopedThemeStyles(e), this._themeScopedListener = function() {
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
    var v = (l = this.$primevueConfig) === null || l === void 0 || (l = l.pt) === null || l === void 0 ? void 0 : l._usept, b = v ? (s = this.$primevue) === null || s === void 0 || (s = s.config) === null || s === void 0 || (s = s.pt) === null || s === void 0 ? void 0 : s.originalValue : void 0, y = v ? (a = this.$primevue) === null || a === void 0 || (a = a.config) === null || a === void 0 || (a = a.pt) === null || a === void 0 ? void 0 : a.value : (u = this.$primevue) === null || u === void 0 || (u = u.config) === null || u === void 0 ? void 0 : u.pt;
    (d = y || b) === null || d === void 0 || (d = d[this.$.type.name]) === null || d === void 0 || (d = d.hooks) === null || d === void 0 || (c = d.onBeforeCreate) === null || c === void 0 || c.call(d), this.$attrSelector = si(), this.uid = this.$attrs.id || this.$attrSelector.replace("pc", "pv_id_");
  },
  created: function() {
    this._hook("onCreated");
  },
  beforeMount: function() {
    var e;
    this.rootEl = pt(Ee(this.$el) ? this.$el : (e = this.$el) === null || e === void 0 ? void 0 : e.parentElement, "[".concat(this.$attrSelector, "]")), this.rootEl && (this.rootEl.$pc = P({
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
      return ct(e) ? e.apply(void 0, o) : S.apply(void 0, o);
    },
    _load: function() {
      he.isStyleNameLoaded("base") || (E.loadCSS(this.$styleOptions), this._loadGlobalStyles(), he.setLoadedStyleName("base")), this._loadThemeStyles();
    },
    _loadStyles: function() {
      this._load(), this._themeChangeListener(this._load);
    },
    _loadCoreStyles: function() {
      var e, n;
      !he.isStyleNameLoaded((e = this.$style) === null || e === void 0 ? void 0 : e.name) && (n = this.$style) !== null && n !== void 0 && n.name && (un.loadCSS(this.$styleOptions), this.$options.style && this.$style.loadCSS(this.$styleOptions), he.setLoadedStyleName(this.$style.name));
    },
    _loadGlobalStyles: function() {
      var e = this._useGlobalPT(this._getOptionValue, "global.css", this.$params);
      _(e) && E.load(e, P({
        name: "global"
      }, this.$styleOptions));
    },
    _loadThemeStyles: function() {
      var e, n;
      if (!(this.isUnstyled || this.$theme === "none")) {
        if (!j.isStyleNameLoaded("common")) {
          var o, r, i = ((o = this.$style) === null || o === void 0 || (r = o.getCommonTheme) === null || r === void 0 ? void 0 : r.call(o)) || {}, l = i.primitive, s = i.semantic, a = i.global, u = i.style;
          E.load(l?.css, P({
            name: "primitive-variables"
          }, this.$styleOptions)), E.load(s?.css, P({
            name: "semantic-variables"
          }, this.$styleOptions)), E.load(a?.css, P({
            name: "global-variables"
          }, this.$styleOptions)), E.loadStyle(P({
            name: "global-style"
          }, this.$styleOptions), u), j.setLoadedStyleName("common");
        }
        if (!j.isStyleNameLoaded((e = this.$style) === null || e === void 0 ? void 0 : e.name) && (n = this.$style) !== null && n !== void 0 && n.name) {
          var d, c, p, f, m = ((d = this.$style) === null || d === void 0 || (c = d.getComponentTheme) === null || c === void 0 ? void 0 : c.call(d)) || {}, v = m.css, b = m.style;
          (p = this.$style) === null || p === void 0 || p.load(v, P({
            name: "".concat(this.$style.name, "-variables")
          }, this.$styleOptions)), (f = this.$style) === null || f === void 0 || f.loadStyle(P({
            name: "".concat(this.$style.name, "-style")
          }, this.$styleOptions), b), j.setLoadedStyleName(this.$style.name);
        }
        if (!j.isStyleNameLoaded("layer-order")) {
          var y, $, C = (y = this.$style) === null || y === void 0 || ($ = y.getLayerOrderThemeCSS) === null || $ === void 0 ? void 0 : $.call(y);
          E.load(C, P({
            name: "layer-order",
            first: !0
          }, this.$styleOptions)), j.setLoadedStyleName("layer-order");
        }
      }
    },
    _loadScopedThemeStyles: function(e) {
      var n, o, r, i = ((n = this.$style) === null || n === void 0 || (o = n.getPresetTheme) === null || o === void 0 ? void 0 : o.call(n, e, "[".concat(this.$attrSelector, "]"))) || {}, l = i.css, s = (r = this.$style) === null || r === void 0 ? void 0 : r.load(l, P({
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
      he.clearLoadedStyleNames(), B.on("theme:change", e);
    },
    _removeThemeListeners: function() {
      B.off("theme:change", this._loadCoreStyles), B.off("theme:change", this._load), B.off("theme:change", this._themeScopedListener);
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
      return Ft(e, n, o);
    },
    _getPTValue: function() {
      var e, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, o = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", r = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {}, i = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : !0, l = /./g.test(o) && !!r[o.split(".")[0]], s = this._getPropValue("ptOptions") || ((e = this.$primevueConfig) === null || e === void 0 ? void 0 : e.ptOptions) || {}, a = s.mergeSections, u = a === void 0 ? !0 : a, d = s.mergeProps, c = d === void 0 ? !1 : d, p = i ? l ? this._useGlobalPT(this._getPTClassValue, o, r) : this._useDefaultPT(this._getPTClassValue, o, r) : void 0, f = l ? void 0 : this._getPTSelf(n, this._getPTClassValue, o, P(P({}, r), {}, {
        global: p || {}
      })), m = this._getPTDatasets(o);
      return u || !u && f ? c ? this._mergeProps(c, p, f, m) : P(P(P({}, p), f), m) : P(P({}, f), m);
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
      var e, n, o = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", r = "data-pc-", i = o === "root" && _((e = this.pt) === null || e === void 0 ? void 0 : e["data-pc-section"]);
      return o !== "transition" && P(P({}, o === "root" && P(P(Ve({}, "".concat(r, "name"), se(i ? (n = this.pt) === null || n === void 0 ? void 0 : n["data-pc-section"] : this.$.type.name)), i && Ve({}, "".concat(r, "extend"), se(this.$.type.name))), {}, Ve({}, "".concat(this.$attrSelector), ""))), {}, Ve({}, "".concat(r, "section"), se(o)));
    },
    _getPTClassValue: function() {
      var e = this._getOptionValue.apply(this, arguments);
      return U(e) || zn(e) ? {
        class: e
      } : e;
    },
    _getPT: function(e) {
      var n = this, o = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", r = arguments.length > 2 ? arguments[2] : void 0, i = function(s) {
        var a, u = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1, d = r ? r(s) : s, c = se(o), p = se(n.$name);
        return (a = u ? c !== p ? d?.[c] : void 0 : d?.[c]) !== null && a !== void 0 ? a : d;
      };
      return e != null && e.hasOwnProperty("_usept") ? {
        _usept: e._usept,
        originalValue: i(e.originalValue),
        value: i(e.value)
      } : i(e, !0);
    },
    _usePT: function(e, n, o, r) {
      var i = function(v) {
        return n(v, o, r);
      };
      if (e != null && e.hasOwnProperty("_usept")) {
        var l, s = e._usept || ((l = this.$primevueConfig) === null || l === void 0 ? void 0 : l.ptOptions) || {}, a = s.mergeSections, u = a === void 0 ? !0 : a, d = s.mergeProps, c = d === void 0 ? !1 : d, p = i(e.originalValue), f = i(e.value);
        return p === void 0 && f === void 0 ? void 0 : U(f) ? f : U(p) ? p : u || !u && f ? c ? this._mergeProps(c, p, f) : P(P({}, p), f) : f;
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
      return this._getPTValue(this.pt, e, P(P({}, this.$params), n));
    },
    ptmi: function() {
      var e, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", o = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, r = S(this.$_attrsWithoutPT, this.ptm(n, o));
      return r?.hasOwnProperty("id") && ((e = r.id) !== null && e !== void 0 || (r.id = this.$id)), r;
    },
    ptmo: function() {
      var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", o = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
      return this._getPTValue(e, n, P({
        instance: this
      }, o), !1);
    },
    cx: function() {
      var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
      return this.isUnstyled ? void 0 : this._getOptionValue(this.$style.classes, e, P(P({}, this.$params), n));
    },
    sx: function() {
      var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0, o = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
      if (n) {
        var r = this._getOptionValue(this.$style.inlineStyles, e, P(P({}, this.$params), o)), i = this._getOptionValue(un.inlineStyles, e, P(P({}, this.$params), o));
        return [i, r];
      }
    }
  },
  computed: {
    globalPT: function() {
      var e, n = this;
      return this._getPT((e = this.$primevueConfig) === null || e === void 0 ? void 0 : e.pt, void 0, function(o) {
        return Y(o, {
          instance: n
        });
      });
    },
    defaultPT: function() {
      var e, n = this;
      return this._getPT((e = this.$primevueConfig) === null || e === void 0 ? void 0 : e.pt, void 0, function(o) {
        return n._getOptionValue(o, n.$name, P({}, n.$params)) || Y(o, P({}, n.$params));
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
        var r = ze(o, 1), i = r[0];
        return n?.includes(i);
      }));
    },
    $theme: function() {
      var e;
      return (e = this.$primevueConfig) === null || e === void 0 ? void 0 : e.theme;
    },
    $style: function() {
      return P(P({
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
        var n = ze(e, 1), o = n[0];
        return o?.startsWith("pt:");
      }).reduce(function(e, n) {
        var o = ze(n, 2), r = o[0], i = o[1], l = r.split(":"), s = ui(l), a = kt(s).slice(1);
        return a?.reduce(function(u, d, c, p) {
          return !u[d] && (u[d] = c === p.length - 1 ? i : {}), u[d];
        }, e), e;
      }, {});
    },
    $_attrsWithoutPT: function() {
      return Object.entries(this.$attrs || {}).filter(function(e) {
        var n = ze(e, 1), o = n[0];
        return !(o != null && o.startsWith("pt:"));
      }).reduce(function(e, n) {
        var o = ze(n, 2), r = o[0], i = o[1];
        return e[r] = i, e;
      }, {});
    }
  }
}, hi = `
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
`, mi = E.extend({
  name: "baseicon",
  css: hi
});
function Ke(t) {
  "@babel/helpers - typeof";
  return Ke = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, Ke(t);
}
function cn(t, e) {
  var n = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(t);
    e && (o = o.filter(function(r) {
      return Object.getOwnPropertyDescriptor(t, r).enumerable;
    })), n.push.apply(n, o);
  }
  return n;
}
function pn(t) {
  for (var e = 1; e < arguments.length; e++) {
    var n = arguments[e] != null ? arguments[e] : {};
    e % 2 ? cn(Object(n), !0).forEach(function(o) {
      gi(t, o, n[o]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(n)) : cn(Object(n)).forEach(function(o) {
      Object.defineProperty(t, o, Object.getOwnPropertyDescriptor(n, o));
    });
  }
  return t;
}
function gi(t, e, n) {
  return (e = bi(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function bi(t) {
  var e = vi(t, "string");
  return Ke(e) == "symbol" ? e : e + "";
}
function vi(t, e) {
  if (Ke(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(t, e);
    if (Ke(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var je = {
  name: "BaseIcon",
  extends: Ie,
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
  style: mi,
  provide: function() {
    return {
      $pcIcon: this,
      $parentInstance: this
    };
  },
  methods: {
    pti: function() {
      var e = Ce(this.label);
      return pn(pn({}, !this.isUnstyled && {
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
function We(t) {
  "@babel/helpers - typeof";
  return We = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, We(t);
}
function fn(t, e) {
  return $i(t) || wi(t, e) || Si(t, e) || yi();
}
function yi() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Si(t, e) {
  if (t) {
    if (typeof t == "string") return hn(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? hn(t, e) : void 0;
  }
}
function hn(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, o = Array(e); n < e; n++) o[n] = t[n];
  return o;
}
function wi(t, e) {
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
function $i(t) {
  if (Array.isArray(t)) return t;
}
function mn(t, e) {
  var n = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(t);
    e && (o = o.filter(function(r) {
      return Object.getOwnPropertyDescriptor(t, r).enumerable;
    })), n.push.apply(n, o);
  }
  return n;
}
function L(t) {
  for (var e = 1; e < arguments.length; e++) {
    var n = arguments[e] != null ? arguments[e] : {};
    e % 2 ? mn(Object(n), !0).forEach(function(o) {
      Ct(t, o, n[o]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(n)) : mn(Object(n)).forEach(function(o) {
      Object.defineProperty(t, o, Object.getOwnPropertyDescriptor(n, o));
    });
  }
  return t;
}
function Ct(t, e, n) {
  return (e = Oi(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function Oi(t) {
  var e = ki(t, "string");
  return We(e) == "symbol" ? e : e + "";
}
function ki(t, e) {
  if (We(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(t, e);
    if (We(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var T = {
  _getMeta: function() {
    return [ue(arguments.length <= 0 ? void 0 : arguments[0]) || arguments.length <= 0 ? void 0 : arguments[0], Y(ue(arguments.length <= 0 ? void 0 : arguments[0]) ? arguments.length <= 0 ? void 0 : arguments[0] : arguments.length <= 1 ? void 0 : arguments[1])];
  },
  _getConfig: function(e, n) {
    var o, r, i;
    return (o = (e == null || (r = e.instance) === null || r === void 0 ? void 0 : r.$primevue) || (n == null || (i = n.ctx) === null || i === void 0 || (i = i.appContext) === null || i === void 0 || (i = i.config) === null || i === void 0 || (i = i.globalProperties) === null || i === void 0 ? void 0 : i.$primevue)) === null || o === void 0 ? void 0 : o.config;
  },
  _getOptionValue: Ft,
  _getPTValue: function() {
    var e, n, o = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, i = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : "", l = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : {}, s = arguments.length > 4 && arguments[4] !== void 0 ? arguments[4] : !0, a = function() {
      var $ = T._getOptionValue.apply(T, arguments);
      return U($) || zn($) ? {
        class: $
      } : $;
    }, u = ((e = o.binding) === null || e === void 0 || (e = e.value) === null || e === void 0 ? void 0 : e.ptOptions) || ((n = o.$primevueConfig) === null || n === void 0 ? void 0 : n.ptOptions) || {}, d = u.mergeSections, c = d === void 0 ? !0 : d, p = u.mergeProps, f = p === void 0 ? !1 : p, m = s ? T._useDefaultPT(o, o.defaultPT(), a, i, l) : void 0, v = T._usePT(o, T._getPT(r, o.$name), a, i, L(L({}, l), {}, {
      global: m || {}
    })), b = T._getPTDatasets(o, i);
    return c || !c && v ? f ? T._mergeProps(o, f, m, v, b) : L(L(L({}, m), v), b) : L(L({}, v), b);
  },
  _getPTDatasets: function() {
    var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", o = "data-pc-";
    return L(L({}, n === "root" && Ct({}, "".concat(o, "name"), se(e.$name))), {}, Ct({}, "".concat(o, "section"), se(n)));
  },
  _getPT: function(e) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", o = arguments.length > 2 ? arguments[2] : void 0, r = function(l) {
      var s, a = o ? o(l) : l, u = se(n);
      return (s = a?.[u]) !== null && s !== void 0 ? s : a;
    };
    return e && Object.hasOwn(e, "_usept") ? {
      _usept: e._usept,
      originalValue: r(e.originalValue),
      value: r(e.value)
    } : r(e);
  },
  _usePT: function() {
    var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 ? arguments[1] : void 0, o = arguments.length > 2 ? arguments[2] : void 0, r = arguments.length > 3 ? arguments[3] : void 0, i = arguments.length > 4 ? arguments[4] : void 0, l = function(b) {
      return o(b, r, i);
    };
    if (n && Object.hasOwn(n, "_usept")) {
      var s, a = n._usept || ((s = e.$primevueConfig) === null || s === void 0 ? void 0 : s.ptOptions) || {}, u = a.mergeSections, d = u === void 0 ? !0 : u, c = a.mergeProps, p = c === void 0 ? !1 : c, f = l(n.originalValue), m = l(n.value);
      return f === void 0 && m === void 0 ? void 0 : U(m) ? m : U(f) ? f : d || !d && m ? p ? T._mergeProps(e, p, f, m) : L(L({}, f), m) : m;
    }
    return l(n);
  },
  _useDefaultPT: function() {
    var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, o = arguments.length > 2 ? arguments[2] : void 0, r = arguments.length > 3 ? arguments[3] : void 0, i = arguments.length > 4 ? arguments[4] : void 0;
    return T._usePT(e, n, o, r, i);
  },
  _loadStyles: function() {
    var e, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, o = arguments.length > 1 ? arguments[1] : void 0, r = arguments.length > 2 ? arguments[2] : void 0, i = T._getConfig(o, r), l = {
      nonce: i == null || (e = i.csp) === null || e === void 0 ? void 0 : e.nonce
    };
    T._loadCoreStyles(n, l), T._loadThemeStyles(n, l), T._loadScopedThemeStyles(n, l), T._removeThemeListeners(n), n.$loadStyles = function() {
      return T._loadThemeStyles(n, l);
    }, T._themeChangeListener(n.$loadStyles);
  },
  _loadCoreStyles: function() {
    var e, n, o = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, r = arguments.length > 1 ? arguments[1] : void 0;
    if (!he.isStyleNameLoaded((e = o.$style) === null || e === void 0 ? void 0 : e.name) && (n = o.$style) !== null && n !== void 0 && n.name) {
      var i;
      E.loadCSS(r), (i = o.$style) === null || i === void 0 || i.loadCSS(r), he.setLoadedStyleName(o.$style.name);
    }
  },
  _loadThemeStyles: function() {
    var e, n, o, r = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, i = arguments.length > 1 ? arguments[1] : void 0;
    if (!(r != null && r.isUnstyled() || (r == null || (e = r.theme) === null || e === void 0 ? void 0 : e.call(r)) === "none")) {
      if (!j.isStyleNameLoaded("common")) {
        var l, s, a = ((l = r.$style) === null || l === void 0 || (s = l.getCommonTheme) === null || s === void 0 ? void 0 : s.call(l)) || {}, u = a.primitive, d = a.semantic, c = a.global, p = a.style;
        E.load(u?.css, L({
          name: "primitive-variables"
        }, i)), E.load(d?.css, L({
          name: "semantic-variables"
        }, i)), E.load(c?.css, L({
          name: "global-variables"
        }, i)), E.loadStyle(L({
          name: "global-style"
        }, i), p), j.setLoadedStyleName("common");
      }
      if (!j.isStyleNameLoaded((n = r.$style) === null || n === void 0 ? void 0 : n.name) && (o = r.$style) !== null && o !== void 0 && o.name) {
        var f, m, v, b, y = ((f = r.$style) === null || f === void 0 || (m = f.getDirectiveTheme) === null || m === void 0 ? void 0 : m.call(f)) || {}, $ = y.css, C = y.style;
        (v = r.$style) === null || v === void 0 || v.load($, L({
          name: "".concat(r.$style.name, "-variables")
        }, i)), (b = r.$style) === null || b === void 0 || b.loadStyle(L({
          name: "".concat(r.$style.name, "-style")
        }, i), C), j.setLoadedStyleName(r.$style.name);
      }
      if (!j.isStyleNameLoaded("layer-order")) {
        var h, g, I = (h = r.$style) === null || h === void 0 || (g = h.getLayerOrderThemeCSS) === null || g === void 0 ? void 0 : g.call(h);
        E.load(I, L({
          name: "layer-order",
          first: !0
        }, i)), j.setLoadedStyleName("layer-order");
      }
    }
  },
  _loadScopedThemeStyles: function() {
    var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 ? arguments[1] : void 0, o = e.preset();
    if (o && e.$attrSelector) {
      var r, i, l, s = ((r = e.$style) === null || r === void 0 || (i = r.getPresetTheme) === null || i === void 0 ? void 0 : i.call(r, o, "[".concat(e.$attrSelector, "]"))) || {}, a = s.css, u = (l = e.$style) === null || l === void 0 ? void 0 : l.load(a, L({
        name: "".concat(e.$attrSelector, "-").concat(e.$style.name)
      }, n));
      e.scopedStyleEl = u.el;
    }
  },
  _themeChangeListener: function() {
    var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : function() {
    };
    he.clearLoadedStyleNames(), B.on("theme:change", e);
  },
  _removeThemeListeners: function() {
    var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    B.off("theme:change", e.$loadStyles), e.$loadStyles = void 0;
  },
  _hook: function(e, n, o, r, i, l) {
    var s, a, u = "on".concat(er(n)), d = T._getConfig(r, i), c = o?.$instance, p = T._usePT(c, T._getPT(r == null || (s = r.value) === null || s === void 0 ? void 0 : s.pt, e), T._getOptionValue, "hooks.".concat(u)), f = T._useDefaultPT(c, d == null || (a = d.pt) === null || a === void 0 || (a = a.directives) === null || a === void 0 ? void 0 : a[e], T._getOptionValue, "hooks.".concat(u)), m = {
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
    return ct(e) ? e.apply(void 0, o) : S.apply(void 0, o);
  },
  _extend: function(e) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, o = function(s, a, u, d, c) {
      var p, f, m, v;
      a._$instances = a._$instances || {};
      var b = T._getConfig(u, d), y = a._$instances[e] || {}, $ = Ce(y) ? L(L({}, n), n?.methods) : {};
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
        $primevueConfig: b,
        $attrSelector: (p = a.$pd) === null || p === void 0 || (p = p[e]) === null || p === void 0 ? void 0 : p.attrSelector,
        /* computed instance variables */
        defaultPT: function() {
          return T._getPT(b?.pt, void 0, function(h) {
            var g;
            return h == null || (g = h.directives) === null || g === void 0 ? void 0 : g[e];
          });
        },
        isUnstyled: function() {
          var h, g;
          return ((h = a._$instances[e]) === null || h === void 0 || (h = h.$binding) === null || h === void 0 || (h = h.value) === null || h === void 0 ? void 0 : h.unstyled) !== void 0 ? (g = a._$instances[e]) === null || g === void 0 || (g = g.$binding) === null || g === void 0 || (g = g.value) === null || g === void 0 ? void 0 : g.unstyled : b?.unstyled;
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
          var h, g = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", I = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
          return T._getPTValue(a._$instances[e], (h = a._$instances[e]) === null || h === void 0 || (h = h.$binding) === null || h === void 0 || (h = h.value) === null || h === void 0 ? void 0 : h.pt, g, L({}, I));
        },
        ptmo: function() {
          var h = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, g = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", I = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
          return T._getPTValue(a._$instances[e], h, g, I, !1);
        },
        cx: function() {
          var h, g, I = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", w = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
          return (h = a._$instances[e]) !== null && h !== void 0 && h.isUnstyled() ? void 0 : T._getOptionValue((g = a._$instances[e]) === null || g === void 0 || (g = g.$style) === null || g === void 0 ? void 0 : g.classes, I, L({}, w));
        },
        sx: function() {
          var h, g = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", I = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0, w = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
          return I ? T._getOptionValue((h = a._$instances[e]) === null || h === void 0 || (h = h.$style) === null || h === void 0 ? void 0 : h.inlineStyles, g, L({}, w)) : void 0;
        }
      }, $), a.$instance = a._$instances[e], (f = (m = a.$instance)[s]) === null || f === void 0 || f.call(m, a, u, d, c), a["$".concat(e)] = a.$instance, T._hook(e, s, a, u, d, c), a.$pd || (a.$pd = {}), a.$pd[e] = L(L({}, (v = a.$pd) === null || v === void 0 ? void 0 : v[e]), {}, {
        name: e,
        instance: a._$instances[e]
      });
    }, r = function(s) {
      var a, u, d, c = s._$instances[e], p = c?.watch, f = function(b) {
        var y, $ = b.newValue, C = b.oldValue;
        return p == null || (y = p.config) === null || y === void 0 ? void 0 : y.call(c, $, C);
      }, m = function(b) {
        var y, $ = b.newValue, C = b.oldValue;
        return p == null || (y = p["config.ripple"]) === null || y === void 0 ? void 0 : y.call(c, $, C);
      };
      c.$watchersCallback = {
        config: f,
        "config.ripple": m
      }, p == null || (a = p.config) === null || a === void 0 || a.call(c, c?.$primevueConfig), me.on("config:change", f), p == null || (u = p["config.ripple"]) === null || u === void 0 || u.call(c, c == null || (d = c.$primevueConfig) === null || d === void 0 ? void 0 : d.ripple), me.on("config:ripple:change", m);
    }, i = function(s) {
      var a = s._$instances[e].$watchersCallback;
      a && (me.off("config:change", a.config), me.off("config:ripple:change", a["config.ripple"]), s._$instances[e].$watchersCallback = void 0);
    };
    return {
      created: function(s, a, u, d) {
        s.$pd || (s.$pd = {}), s.$pd[e] = {
          name: e,
          attrSelector: wr("pd")
        }, o("created", s, a, u, d);
      },
      beforeMount: function(s, a, u, d) {
        var c;
        T._loadStyles((c = s.$pd[e]) === null || c === void 0 ? void 0 : c.instance, a, u), o("beforeMount", s, a, u, d), r(s);
      },
      mounted: function(s, a, u, d) {
        var c;
        T._loadStyles((c = s.$pd[e]) === null || c === void 0 ? void 0 : c.instance, a, u), o("mounted", s, a, u, d);
      },
      beforeUpdate: function(s, a, u, d) {
        o("beforeUpdate", s, a, u, d);
      },
      updated: function(s, a, u, d) {
        var c;
        T._loadStyles((c = s.$pd[e]) === null || c === void 0 ? void 0 : c.instance, a, u), o("updated", s, a, u, d);
      },
      beforeUnmount: function(s, a, u, d) {
        var c;
        i(s), T._removeThemeListeners((c = s.$pd[e]) === null || c === void 0 ? void 0 : c.instance), o("beforeUnmount", s, a, u, d);
      },
      unmounted: function(s, a, u, d) {
        var c;
        (c = s.$pd[e]) === null || c === void 0 || (c = c.instance) === null || c === void 0 || (c = c.scopedStyleEl) === null || c === void 0 || (c = c.value) === null || c === void 0 || c.remove(), o("unmounted", s, a, u, d);
      }
    };
  },
  extend: function() {
    var e = T._getMeta.apply(T, arguments), n = fn(e, 2), o = n[0], r = n[1];
    return L({
      extend: function() {
        var l = T._getMeta.apply(T, arguments), s = fn(l, 2), a = s[0], u = s[1];
        return T.extend(a, L(L(L({}, r), r?.methods), u));
      }
    }, T._extend(o, r));
  }
}, Ci = `
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
`, Ii = {
  root: "p-ink"
}, Ti = E.extend({
  name: "ripple-directive",
  style: Ci,
  classes: Ii
}), xi = T.extend({
  style: Ti
});
function Ue(t) {
  "@babel/helpers - typeof";
  return Ue = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, Ue(t);
}
function Pi(t) {
  return Ei(t) || Ai(t) || _i(t) || Li();
}
function Li() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function _i(t, e) {
  if (t) {
    if (typeof t == "string") return It(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? It(t, e) : void 0;
  }
}
function Ai(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function Ei(t) {
  if (Array.isArray(t)) return It(t);
}
function It(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, o = Array(e); n < e; n++) o[n] = t[n];
  return o;
}
function gn(t, e, n) {
  return (e = ji(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function ji(t) {
  var e = zi(t, "string");
  return Ue(e) == "symbol" ? e : e + "";
}
function zi(t, e) {
  if (Ue(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(t, e);
    if (Ue(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var Xn = xi.extend("ripple", {
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
      n || (n = dr("span", gn(gn({
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
        if (!this.isUnstyled() && ht(r, "p-ink-active"), r.setAttribute("data-p-ink-active", "false"), !Se(r) && !we(r)) {
          var i = Math.max(Nn(o), gr(o));
          r.style.height = i + "px", r.style.width = i + "px";
        }
        var l = mr(o), s = e.pageX - l.left + document.body.scrollTop - we(r) / 2, a = e.pageY - l.top + document.body.scrollLeft - Se(r) / 2;
        r.style.top = a + "px", r.style.left = s + "px", !this.isUnstyled() && nr(r, "p-ink-active"), r.setAttribute("data-p-ink-active", "true"), this.timeout = setTimeout(function() {
          r && (!n.isUnstyled() && ht(r, "p-ink-active"), r.setAttribute("data-p-ink-active", "false"));
        }, 401);
      }
    },
    onAnimationEnd: function(e) {
      this.timeout && clearTimeout(this.timeout), !this.isUnstyled() && ht(e.currentTarget, "p-ink-active"), e.currentTarget.setAttribute("data-p-ink-active", "false");
    },
    getInk: function(e) {
      return e && e.children ? Pi(e.children).find(function(n) {
        return pr(n, "data-pc-name") === "ripple";
      }) : void 0;
    }
  }
});
function Ge(t) {
  "@babel/helpers - typeof";
  return Ge = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, Ge(t);
}
function Fi(t, e) {
  if (!(t instanceof e)) throw new TypeError("Cannot call a class as a function");
}
function Vi(t, e) {
  for (var n = 0; n < e.length; n++) {
    var o = e[n];
    o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(t, Ni(o.key), o);
  }
}
function Mi(t, e, n) {
  return e && Vi(t.prototype, e), Object.defineProperty(t, "prototype", { writable: !1 }), t;
}
function Ni(t) {
  var e = Di(t, "string");
  return Ge(e) == "symbol" ? e : e + "";
}
function Di(t, e) {
  if (Ge(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(t, e);
    if (Ge(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return String(t);
}
var Bi = /* @__PURE__ */ (function() {
  function t(e) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : function() {
    };
    Fi(this, t), this.element = e, this.listener = n;
  }
  return Mi(t, [{
    key: "bindScrollListener",
    value: function() {
      this.scrollableParents = br(this.element);
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
})(), Ri = Vt();
const Hi = "data-wippy-overlay-layer";
function eo() {
  return typeof window < "u" && typeof window.document < "u";
}
function to() {
  return eo() && typeof HTMLElement < "u" && Object.hasOwn(HTMLElement.prototype, "popover");
}
function Ki() {
  return to() && typeof CSS < "u" && typeof CSS.supports == "function" && CSS.supports("anchor-name: --a") && CSS.supports("position-area", "bottom span-right") && CSS.supports("position-try-fallbacks", "flip-block") && CSS.supports("min-width", "min(anchor-size(width), 100vw)") && CSS.supports("max-width", "stretch");
}
const Wi = /\bp-(?:select|multiselect|treeselect|cascadeselect)-overlay\b/;
let Ui = 0;
const ut = /* @__PURE__ */ new WeakMap();
function bn(t, e) {
  const n = t.style;
  n.setProperty("position", "fixed", "important"), n.setProperty("inset", "auto", "important"), n.setProperty("margin", "0", "important"), n.setProperty("position-anchor", e), n.setProperty("position-area", "bottom span-right"), n.setProperty("position-try-fallbacks", "flip-block, flip-inline, flip-block flip-inline"), n.setProperty("min-width", "min(anchor-size(width), 100vw)", "important"), n.setProperty("max-width", "stretch", "important");
}
function Gi(t, e) {
  if (!Wi.test(t.className))
    return;
  const n = t.style.cssText;
  bn(t, e), t.getAttribute("popover") !== "manual" && t.setAttribute("popover", "manual");
  try {
    t.matches(":popover-open") || t.showPopover();
  } catch {
  }
  if (!t.matches(":popover-open")) {
    t.removeAttribute("popover"), t.style.cssText = n;
    return;
  }
  if (!ut.has(t)) {
    const o = new MutationObserver(() => {
      const r = t.style;
      (r.top !== "auto" || r.left !== "auto" || r.margin !== "0px" || r.getPropertyPriority("top") !== "important" || r.getPropertyPriority("left") !== "important" || r.getPropertyPriority("margin") !== "important" || r.getPropertyPriority("min-width") !== "important" || r.maxWidth !== "stretch" || r.getPropertyPriority("max-width") !== "important") && bn(t, e);
    });
    o.observe(t, { attributes: !0, attributeFilter: ["style"] }), ut.set(t, o);
  }
}
function Dt(t) {
  const e = ut.get(t);
  e && (e.disconnect(), ut.delete(t));
}
function qi(t) {
  const e = t && typeof t.getRootNode == "function" ? t.getRootNode() : null;
  return e instanceof ShadowRoot ? e : null;
}
function Tt(t) {
  t.style.top = "0px", t.style.left = "0px";
  const e = t.getBoundingClientRect();
  t.style.top = `${-window.scrollY - e.top}px`, t.style.left = `${-window.scrollX - e.left}px`;
}
const dt = /* @__PURE__ */ new Set(), Bt = /* @__PURE__ */ new WeakMap();
let vn = !1, xt = !1;
function Yi() {
  xt = !1;
  for (const t of dt) {
    if (!t.isConnected) {
      for (const e of Array.from(t.children))
        e instanceof HTMLElement && Dt(e);
      dt.delete(t), Bt.get(t)?.disconnect();
      continue;
    }
    t.childElementCount > 0 && Tt(t);
  }
}
function yn() {
  xt || (xt = !0, requestAnimationFrame(Yi));
}
function Zi(t) {
  const e = document.createElement("div");
  e.setAttribute(Hi, "");
  const n = to();
  if (e.style.cssText = n ? "position:fixed;width:0 !important;height:0 !important;margin:0 !important;border:0 !important;padding:0 !important;background:transparent !important;color:inherit !important;overflow:visible !important;" : "position:fixed;top:0;left:0;width:0;height:0;", n && e.setAttribute("popover", "manual"), t.appendChild(e), n) {
    try {
      e.showPopover();
    } catch {
    }
    e.matches(":popover-open") || (e.removeAttribute("popover"), e.style.cssText = "position:fixed;top:0;left:0;width:0;height:0;");
  }
  Tt(e);
  const o = new MutationObserver((r) => {
    const i = e.__wippyAnchorName;
    for (const l of r) {
      if (i)
        for (const s of Array.from(l.addedNodes))
          s instanceof HTMLElement && Gi(s, i);
      for (const s of Array.from(l.removedNodes))
        s instanceof HTMLElement && Dt(s);
    }
    e.isConnected && e.childElementCount > 0 && Tt(e);
  });
  return o.observe(e, { childList: !0 }), Bt.set(e, o), dt.add(e), vn || (vn = !0, window.addEventListener("scroll", yn, { capture: !0, passive: !0 }), window.addEventListener("resize", yn, { passive: !0 })), e;
}
function Sn(t) {
  if (!(!t.hostRoot || t.layer) && (t.layer = Zi(t.hostRoot), Ki())) {
    const e = t.$el ? t.$el.parentElement : null;
    e && (t.anchorName = `--wippy-a-${++Ui}`, t.anchorTrigger = e, e.style.setProperty("anchor-name", t.anchorName), t.layer.__wippyAnchorName = t.anchorName);
  }
}
function wn(t) {
  if (t.anchorTrigger && (t.anchorTrigger.style.removeProperty("anchor-name"), t.anchorTrigger = null), t.anchorName = null, t.layer) {
    for (const e of Array.from(t.layer.children))
      e instanceof HTMLElement && Dt(e);
    dt.delete(t.layer), Bt.get(t.layer)?.disconnect(), t.layer.remove(), t.layer = null;
  }
}
let $n = !1;
function Ji() {
  if ($n)
    return;
  $n = !0;
  const t = Nt;
  t.computed = t.computed || {}, t.computed.inline = function() {
    return !!this.disabled || this.appendTo === "self";
  }, t.computed.resolvedTarget = function() {
    return this.appendTo == null || this.appendTo === "body" ? this.hostRoot ? this.layer : document.body : this.appendTo;
  }, t.data = function() {
    return { mounted: !1, hostRoot: null, layer: null, anchorName: null, anchorTrigger: null };
  }, t.mounted = function() {
    eo() && (this.hostRoot = qi(this.$el), this.mounted = !0, this.hostRoot && (this.inline || Sn(this), this.$watch("inline", (e) => {
      e ? wn(this) : Sn(this);
    })));
  }, t.render = function() {
    return this.inline ? A(this.$slots, "default", { key: 0 }) : this.mounted ? Vo(Ln, { key: 1, to: this.resolvedTarget || document.body }, [
      A(this.$slots, "default")
    ]) : W("", !0);
  }, t.unmounted = function() {
    wn(this);
  };
}
const ss = {
  install: (t) => {
    Ji(), t.use(ai, { theme: "none" });
  }
};
var ft = {
  name: "SpinnerIcon",
  extends: je
};
function Qi(t) {
  return na(t) || ta(t) || ea(t) || Xi();
}
function Xi() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function ea(t, e) {
  if (t) {
    if (typeof t == "string") return Pt(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Pt(t, e) : void 0;
  }
}
function ta(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function na(t) {
  if (Array.isArray(t)) return Pt(t);
}
function Pt(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, o = Array(e); n < e; n++) o[n] = t[n];
  return o;
}
function oa(t, e, n, o, r, i) {
  return k(), x("svg", S({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, t.pti()), Qi(e[0] || (e[0] = [V("path", {
    d: "M6.99701 14C5.85441 13.999 4.72939 13.7186 3.72012 13.1832C2.71084 12.6478 1.84795 11.8737 1.20673 10.9284C0.565504 9.98305 0.165424 8.89526 0.041387 7.75989C-0.0826496 6.62453 0.073125 5.47607 0.495122 4.4147C0.917119 3.35333 1.59252 2.4113 2.46241 1.67077C3.33229 0.930247 4.37024 0.413729 5.4857 0.166275C6.60117 -0.0811796 7.76026 -0.0520535 8.86188 0.251112C9.9635 0.554278 10.9742 1.12227 11.8057 1.90555C11.915 2.01493 11.9764 2.16319 11.9764 2.31778C11.9764 2.47236 11.915 2.62062 11.8057 2.73C11.7521 2.78503 11.688 2.82877 11.6171 2.85864C11.5463 2.8885 11.4702 2.90389 11.3933 2.90389C11.3165 2.90389 11.2404 2.8885 11.1695 2.85864C11.0987 2.82877 11.0346 2.78503 10.9809 2.73C9.9998 1.81273 8.73246 1.26138 7.39226 1.16876C6.05206 1.07615 4.72086 1.44794 3.62279 2.22152C2.52471 2.99511 1.72683 4.12325 1.36345 5.41602C1.00008 6.70879 1.09342 8.08723 1.62775 9.31926C2.16209 10.5513 3.10478 11.5617 4.29713 12.1803C5.48947 12.7989 6.85865 12.988 8.17414 12.7157C9.48963 12.4435 10.6711 11.7264 11.5196 10.6854C12.3681 9.64432 12.8319 8.34282 12.8328 7C12.8328 6.84529 12.8943 6.69692 13.0038 6.58752C13.1132 6.47812 13.2616 6.41667 13.4164 6.41667C13.5712 6.41667 13.7196 6.47812 13.8291 6.58752C13.9385 6.69692 14 6.84529 14 7C14 8.85651 13.2622 10.637 11.9489 11.9497C10.6356 13.2625 8.85432 14 6.99701 14Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
ft.render = oa;
var ra = `
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
`, ia = {
  root: function(e) {
    var n = e.props, o = e.instance;
    return ["p-badge p-component", {
      "p-badge-circle": _(n.value) && String(n.value).length === 1,
      "p-badge-dot": Ce(n.value) && !o.$slots.default,
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
}, aa = E.extend({
  name: "badge",
  style: ra,
  classes: ia
}), la = {
  name: "BaseBadge",
  extends: Ie,
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
  style: aa,
  provide: function() {
    return {
      $pcBadge: this,
      $parentInstance: this
    };
  }
};
function qe(t) {
  "@babel/helpers - typeof";
  return qe = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, qe(t);
}
function On(t, e, n) {
  return (e = sa(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function sa(t) {
  var e = ua(t, "string");
  return qe(e) == "symbol" ? e : e + "";
}
function ua(t, e) {
  if (qe(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(t, e);
    if (qe(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var no = {
  name: "Badge",
  extends: la,
  inheritAttrs: !1,
  computed: {
    dataP: function() {
      return ne(On(On({
        circle: this.value != null && String(this.value).length === 1,
        empty: this.value == null && !this.$slots.default
      }, this.severity, this.severity), this.size, this.size));
    }
  }
}, da = ["data-p"];
function ca(t, e, n, o, r, i) {
  return k(), x("span", S({
    class: t.cx("root"),
    "data-p": i.dataP
  }, t.ptmi("root")), [A(t.$slots, "default", {}, function() {
    return [it(ae(t.value), 1)];
  })], 16, da);
}
no.render = ca;
var pa = `
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
function Ye(t) {
  "@babel/helpers - typeof";
  return Ye = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, Ye(t);
}
function ie(t, e, n) {
  return (e = fa(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function fa(t) {
  var e = ha(t, "string");
  return Ye(e) == "symbol" ? e : e + "";
}
function ha(t, e) {
  if (Ye(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(t, e);
    if (Ye(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var ma = {
  root: function(e) {
    var n = e.instance, o = e.props;
    return ["p-button p-component", ie(ie(ie(ie(ie(ie(ie(ie(ie({
      "p-button-icon-only": n.hasIcon && !o.label && !o.badge,
      "p-button-vertical": (o.iconPos === "top" || o.iconPos === "bottom") && o.label,
      "p-button-loading": o.loading,
      "p-button-link": o.link || o.variant === "link"
    }, "p-button-".concat(o.severity), o.severity), "p-button-raised", o.raised), "p-button-rounded", o.rounded), "p-button-text", o.text || o.variant === "text"), "p-button-outlined", o.outlined || o.variant === "outlined"), "p-button-sm", o.size === "small"), "p-button-lg", o.size === "large"), "p-button-plain", o.plain), "p-button-fluid", n.hasFluid)];
  },
  loadingIcon: "p-button-loading-icon",
  icon: function(e) {
    var n = e.props;
    return ["p-button-icon", ie({}, "p-button-icon-".concat(n.iconPos), n.label)];
  },
  label: "p-button-label"
}, ga = E.extend({
  name: "button",
  style: pa,
  classes: ma
}), ba = {
  name: "BaseButton",
  extends: Ie,
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
  style: ga,
  provide: function() {
    return {
      $pcButton: this,
      $parentInstance: this
    };
  }
};
function Ze(t) {
  "@babel/helpers - typeof";
  return Ze = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, Ze(t);
}
function K(t, e, n) {
  return (e = va(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function va(t) {
  var e = ya(t, "string");
  return Ze(e) == "symbol" ? e : e + "";
}
function ya(t, e) {
  if (Ze(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(t, e);
    if (Ze(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var Sa = {
  name: "Button",
  extends: ba,
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
      return Ce(this.fluid) ? !!this.$pcFluid : this.fluid;
    },
    dataP: function() {
      return ne(K(K(K(K(K(K(K(K(K(K({}, this.size, this.size), "icon-only", this.hasIcon && !this.label && !this.badge), "loading", this.loading), "fluid", this.hasFluid), "rounded", this.rounded), "raised", this.raised), "outlined", this.outlined || this.variant === "outlined"), "text", this.text || this.variant === "text"), "link", this.link || this.variant === "link"), "vertical", (this.iconPos === "top" || this.iconPos === "bottom") && this.label));
    },
    dataIconP: function() {
      return ne(K(K({}, this.iconPos, this.iconPos), this.size, this.size));
    },
    dataLabelP: function() {
      return ne(K(K({}, this.size, this.size), "icon-only", this.hasIcon && !this.label && !this.badge));
    }
  },
  components: {
    SpinnerIcon: ft,
    Badge: no
  },
  directives: {
    ripple: Xn
  }
}, wa = ["data-p"], $a = ["data-p"];
function Oa(t, e, n, o, r, i) {
  var l = X("SpinnerIcon"), s = X("Badge"), a = _n("ripple");
  return t.asChild ? A(t.$slots, "default", {
    key: 1,
    class: Pe(t.cx("root")),
    a11yAttrs: i.a11yAttrs
  }) : An((k(), le(vt(t.as), S({
    key: 0,
    class: t.cx("root"),
    "data-p": i.dataP
  }, i.attrs), {
    default: be(function() {
      return [A(t.$slots, "default", {}, function() {
        return [t.loading ? A(t.$slots, "loadingicon", S({
          key: 0,
          class: [t.cx("loadingIcon"), t.cx("icon")]
        }, t.ptm("loadingIcon")), function() {
          return [t.loadingIcon ? (k(), x("span", S({
            key: 0,
            class: [t.cx("loadingIcon"), t.cx("icon"), t.loadingIcon]
          }, t.ptm("loadingIcon")), null, 16)) : (k(), le(l, S({
            key: 1,
            class: [t.cx("loadingIcon"), t.cx("icon")],
            spin: ""
          }, t.ptm("loadingIcon")), null, 16, ["class"]))];
        }) : A(t.$slots, "icon", S({
          key: 1,
          class: [t.cx("icon")]
        }, t.ptm("icon")), function() {
          return [t.icon ? (k(), x("span", S({
            key: 0,
            class: [t.cx("icon"), t.icon, t.iconClass],
            "data-p": i.dataIconP
          }, t.ptm("icon")), null, 16, wa)) : W("", !0)];
        }), t.label ? (k(), x("span", S({
          key: 2,
          class: t.cx("label")
        }, t.ptm("label"), {
          "data-p": i.dataLabelP
        }), ae(t.label), 17, $a)) : W("", !0), t.badge ? (k(), le(s, {
          key: 3,
          value: t.badge,
          class: Pe(t.badgeClass),
          severity: t.badgeSeverity,
          unstyled: t.unstyled,
          pt: t.ptm("pcBadge")
        }, null, 8, ["value", "class", "severity", "unstyled", "pt"])) : W("", !0)];
      })];
    }),
    _: 3
  }, 16, ["class", "data-p"])), [[a]]);
}
Sa.render = Oa;
var oo = {
  name: "BlankIcon",
  extends: je
};
function ka(t) {
  return xa(t) || Ta(t) || Ia(t) || Ca();
}
function Ca() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Ia(t, e) {
  if (t) {
    if (typeof t == "string") return Lt(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Lt(t, e) : void 0;
  }
}
function Ta(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function xa(t) {
  if (Array.isArray(t)) return Lt(t);
}
function Lt(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, o = Array(e); n < e; n++) o[n] = t[n];
  return o;
}
function Pa(t, e, n, o, r, i) {
  return k(), x("svg", S({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, t.pti()), ka(e[0] || (e[0] = [V("rect", {
    width: "1",
    height: "1",
    fill: "currentColor",
    "fill-opacity": "0"
  }, null, -1)])), 16);
}
oo.render = Pa;
var ro = {
  name: "CheckIcon",
  extends: je
};
function La(t) {
  return ja(t) || Ea(t) || Aa(t) || _a();
}
function _a() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Aa(t, e) {
  if (t) {
    if (typeof t == "string") return _t(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? _t(t, e) : void 0;
  }
}
function Ea(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function ja(t) {
  if (Array.isArray(t)) return _t(t);
}
function _t(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, o = Array(e); n < e; n++) o[n] = t[n];
  return o;
}
function za(t, e, n, o, r, i) {
  return k(), x("svg", S({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, t.pti()), La(e[0] || (e[0] = [V("path", {
    d: "M4.86199 11.5948C4.78717 11.5923 4.71366 11.5745 4.64596 11.5426C4.57826 11.5107 4.51779 11.4652 4.46827 11.4091L0.753985 7.69483C0.683167 7.64891 0.623706 7.58751 0.580092 7.51525C0.536478 7.44299 0.509851 7.36177 0.502221 7.27771C0.49459 7.19366 0.506156 7.10897 0.536046 7.03004C0.565935 6.95111 0.613367 6.88 0.674759 6.82208C0.736151 6.76416 0.8099 6.72095 0.890436 6.69571C0.970973 6.67046 1.05619 6.66385 1.13966 6.67635C1.22313 6.68886 1.30266 6.72017 1.37226 6.76792C1.44186 6.81567 1.4997 6.8786 1.54141 6.95197L4.86199 10.2503L12.6397 2.49483C12.7444 2.42694 12.8689 2.39617 12.9932 2.40745C13.1174 2.41873 13.2343 2.47141 13.3251 2.55705C13.4159 2.64268 13.4753 2.75632 13.4938 2.87973C13.5123 3.00315 13.4888 3.1292 13.4271 3.23768L5.2557 11.4091C5.20618 11.4652 5.14571 11.5107 5.07801 11.5426C5.01031 11.5745 4.9368 11.5923 4.86199 11.5948Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
ro.render = za;
var io = {
  name: "ChevronDownIcon",
  extends: je
};
function Fa(t) {
  return Da(t) || Na(t) || Ma(t) || Va();
}
function Va() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Ma(t, e) {
  if (t) {
    if (typeof t == "string") return At(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? At(t, e) : void 0;
  }
}
function Na(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function Da(t) {
  if (Array.isArray(t)) return At(t);
}
function At(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, o = Array(e); n < e; n++) o[n] = t[n];
  return o;
}
function Ba(t, e, n, o, r, i) {
  return k(), x("svg", S({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, t.pti()), Fa(e[0] || (e[0] = [V("path", {
    d: "M7.01744 10.398C6.91269 10.3985 6.8089 10.378 6.71215 10.3379C6.61541 10.2977 6.52766 10.2386 6.45405 10.1641L1.13907 4.84913C1.03306 4.69404 0.985221 4.5065 1.00399 4.31958C1.02276 4.13266 1.10693 3.95838 1.24166 3.82747C1.37639 3.69655 1.55301 3.61742 1.74039 3.60402C1.92777 3.59062 2.11386 3.64382 2.26584 3.75424L7.01744 8.47394L11.769 3.75424C11.9189 3.65709 12.097 3.61306 12.2748 3.62921C12.4527 3.64535 12.6199 3.72073 12.7498 3.84328C12.8797 3.96582 12.9647 4.12842 12.9912 4.30502C13.0177 4.48162 12.9841 4.662 12.8958 4.81724L7.58083 10.1322C7.50996 10.2125 7.42344 10.2775 7.32656 10.3232C7.22968 10.3689 7.12449 10.3944 7.01744 10.398Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
io.render = Ba;
var ao = {
  name: "SearchIcon",
  extends: je
};
function Ra(t) {
  return Ua(t) || Wa(t) || Ka(t) || Ha();
}
function Ha() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Ka(t, e) {
  if (t) {
    if (typeof t == "string") return Et(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Et(t, e) : void 0;
  }
}
function Wa(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function Ua(t) {
  if (Array.isArray(t)) return Et(t);
}
function Et(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, o = Array(e); n < e; n++) o[n] = t[n];
  return o;
}
function Ga(t, e, n, o, r, i) {
  return k(), x("svg", S({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, t.pti()), Ra(e[0] || (e[0] = [V("path", {
    "fill-rule": "evenodd",
    "clip-rule": "evenodd",
    d: "M2.67602 11.0265C3.6661 11.688 4.83011 12.0411 6.02086 12.0411C6.81149 12.0411 7.59438 11.8854 8.32483 11.5828C8.87005 11.357 9.37808 11.0526 9.83317 10.6803L12.9769 13.8241C13.0323 13.8801 13.0983 13.9245 13.171 13.9548C13.2438 13.985 13.3219 14.0003 13.4007 14C13.4795 14.0003 13.5575 13.985 13.6303 13.9548C13.7031 13.9245 13.7691 13.8801 13.8244 13.8241C13.9367 13.7116 13.9998 13.5592 13.9998 13.4003C13.9998 13.2414 13.9367 13.089 13.8244 12.9765L10.6807 9.8328C11.053 9.37773 11.3573 8.86972 11.5831 8.32452C11.8857 7.59408 12.0414 6.81119 12.0414 6.02056C12.0414 4.8298 11.6883 3.66579 11.0268 2.67572C10.3652 1.68564 9.42494 0.913972 8.32483 0.45829C7.22472 0.00260857 6.01418 -0.116618 4.84631 0.115686C3.67844 0.34799 2.60568 0.921393 1.76369 1.76338C0.921698 2.60537 0.348296 3.67813 0.115991 4.84601C-0.116313 6.01388 0.00291375 7.22441 0.458595 8.32452C0.914277 9.42464 1.68595 10.3649 2.67602 11.0265ZM3.35565 2.0158C4.14456 1.48867 5.07206 1.20731 6.02086 1.20731C7.29317 1.20731 8.51338 1.71274 9.41304 2.6124C10.3127 3.51206 10.8181 4.73226 10.8181 6.00457C10.8181 6.95337 10.5368 7.88088 10.0096 8.66978C9.48251 9.45868 8.73328 10.0736 7.85669 10.4367C6.98011 10.7997 6.01554 10.8947 5.08496 10.7096C4.15439 10.5245 3.2996 10.0676 2.62869 9.39674C1.95778 8.72583 1.50089 7.87104 1.31579 6.94046C1.13068 6.00989 1.22568 5.04532 1.58878 4.16874C1.95187 3.29215 2.56675 2.54292 3.35565 2.0158Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
ao.render = Ga;
var lo = {
  name: "TimesIcon",
  extends: je
};
function qa(t) {
  return Qa(t) || Ja(t) || Za(t) || Ya();
}
function Ya() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Za(t, e) {
  if (t) {
    if (typeof t == "string") return jt(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? jt(t, e) : void 0;
  }
}
function Ja(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function Qa(t) {
  if (Array.isArray(t)) return jt(t);
}
function jt(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, o = Array(e); n < e; n++) o[n] = t[n];
  return o;
}
function Xa(t, e, n, o, r, i) {
  return k(), x("svg", S({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, t.pti()), qa(e[0] || (e[0] = [V("path", {
    d: "M8.01186 7.00933L12.27 2.75116C12.341 2.68501 12.398 2.60524 12.4375 2.51661C12.4769 2.42798 12.4982 2.3323 12.4999 2.23529C12.5016 2.13827 12.4838 2.0419 12.4474 1.95194C12.4111 1.86197 12.357 1.78024 12.2884 1.71163C12.2198 1.64302 12.138 1.58893 12.0481 1.55259C11.9581 1.51625 11.8617 1.4984 11.7647 1.50011C11.6677 1.50182 11.572 1.52306 11.4834 1.56255C11.3948 1.60204 11.315 1.65898 11.2488 1.72997L6.99067 5.98814L2.7325 1.72997C2.59553 1.60234 2.41437 1.53286 2.22718 1.53616C2.03999 1.53946 1.8614 1.61529 1.72901 1.74767C1.59663 1.88006 1.5208 2.05865 1.5175 2.24584C1.5142 2.43303 1.58368 2.61419 1.71131 2.75116L5.96948 7.00933L1.71131 11.2675C1.576 11.403 1.5 11.5866 1.5 11.7781C1.5 11.9696 1.576 12.1532 1.71131 12.2887C1.84679 12.424 2.03043 12.5 2.2219 12.5C2.41338 12.5 2.59702 12.424 2.7325 12.2887L6.99067 8.03052L11.2488 12.2887C11.3843 12.424 11.568 12.5 11.7594 12.5C11.9509 12.5 12.1346 12.424 12.27 12.2887C12.4053 12.1532 12.4813 11.9696 12.4813 11.7781C12.4813 11.5866 12.4053 11.403 12.27 11.2675L8.01186 7.00933Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
lo.render = Xa;
var el = `
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
`, tl = {
  root: "p-iconfield"
}, nl = E.extend({
  name: "iconfield",
  style: el,
  classes: tl
}), ol = {
  name: "BaseIconField",
  extends: Ie,
  style: nl,
  provide: function() {
    return {
      $pcIconField: this,
      $parentInstance: this
    };
  }
}, so = {
  name: "IconField",
  extends: ol,
  inheritAttrs: !1
};
function rl(t, e, n, o, r, i) {
  return k(), x("div", S({
    class: t.cx("root")
  }, t.ptmi("root")), [A(t.$slots, "default")], 16);
}
so.render = rl;
var il = {
  root: "p-inputicon"
}, al = E.extend({
  name: "inputicon",
  classes: il
}), ll = {
  name: "BaseInputIcon",
  extends: Ie,
  style: al,
  props: {
    class: null
  },
  provide: function() {
    return {
      $pcInputIcon: this,
      $parentInstance: this
    };
  }
}, uo = {
  name: "InputIcon",
  extends: ll,
  inheritAttrs: !1,
  computed: {
    containerClass: function() {
      return [this.cx("root"), this.class];
    }
  }
};
function sl(t, e, n, o, r, i) {
  return k(), x("span", S({
    class: i.containerClass
  }, t.ptmi("root"), {
    "aria-hidden": "true"
  }), [A(t.$slots, "default")], 16);
}
uo.render = sl;
var co = {
  name: "BaseEditableHolder",
  extends: Ie,
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
      return n.find(_);
    }
  },
  computed: {
    $filled: function() {
      return _(this.d_value);
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
}, po = {
  name: "BaseInput",
  extends: co,
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
}, ul = `
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
`, dl = {
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
}, cl = E.extend({
  name: "inputtext",
  style: ul,
  classes: dl
}), pl = {
  name: "BaseInputText",
  extends: po,
  style: cl,
  provide: function() {
    return {
      $pcInputText: this,
      $parentInstance: this
    };
  }
};
function Je(t) {
  "@babel/helpers - typeof";
  return Je = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, Je(t);
}
function fl(t, e, n) {
  return (e = hl(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function hl(t) {
  var e = ml(t, "string");
  return Je(e) == "symbol" ? e : e + "";
}
function ml(t, e) {
  if (Je(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(t, e);
    if (Je(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var fo = {
  name: "InputText",
  extends: pl,
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
      return ne(fl({
        invalid: this.$invalid,
        fluid: this.$fluid,
        filled: this.$variant === "filled"
      }, this.size, this.size));
    }
  }
}, gl = ["value", "name", "disabled", "aria-invalid", "data-p"];
function bl(t, e, n, o, r, i) {
  return k(), x("input", S({
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
  }, i.attrs), null, 16, gl);
}
fo.render = bl;
var vl = `
    .p-virtualscroller-loader {
        background: dt('virtualscroller.loader.mask.background');
        color: dt('virtualscroller.loader.mask.color');
    }

    .p-virtualscroller-loading-icon {
        font-size: dt('virtualscroller.loader.icon.size');
        width: dt('virtualscroller.loader.icon.size');
        height: dt('virtualscroller.loader.icon.size');
    }
`, yl = `
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
`, kn = E.extend({
  name: "virtualscroller",
  css: yl,
  style: vl
}), Sl = {
  name: "BaseVirtualScroller",
  extends: Ie,
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
  style: kn,
  provide: function() {
    return {
      $pcVirtualScroller: this,
      $parentInstance: this
    };
  },
  beforeMount: function() {
    var e;
    kn.loadCSS({
      nonce: (e = this.$primevueConfig) === null || e === void 0 || (e = e.csp) === null || e === void 0 ? void 0 : e.nonce
    });
  }
};
function Qe(t) {
  "@babel/helpers - typeof";
  return Qe = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, Qe(t);
}
function Cn(t, e) {
  var n = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(t);
    e && (o = o.filter(function(r) {
      return Object.getOwnPropertyDescriptor(t, r).enumerable;
    })), n.push.apply(n, o);
  }
  return n;
}
function Fe(t) {
  for (var e = 1; e < arguments.length; e++) {
    var n = arguments[e] != null ? arguments[e] : {};
    e % 2 ? Cn(Object(n), !0).forEach(function(o) {
      ho(t, o, n[o]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(n)) : Cn(Object(n)).forEach(function(o) {
      Object.defineProperty(t, o, Object.getOwnPropertyDescriptor(n, o));
    });
  }
  return t;
}
function ho(t, e, n) {
  return (e = wl(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function wl(t) {
  var e = $l(t, "string");
  return Qe(e) == "symbol" ? e : e + "";
}
function $l(t, e) {
  if (Qe(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(t, e);
    if (Qe(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var mo = {
  name: "VirtualScroller",
  extends: Sl,
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
      lt(this.element) && (this.setContentEl(this.content), this.init(), this.calculateAutoSize(), this.defaultWidth = we(this.element), this.defaultHeight = Se(this.element), this.defaultContentWidth = we(this.content), this.defaultContentHeight = Se(this.content), this.initialized = !0), this.element && this.bindResizeListener();
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
      var n = this, o = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "auto", r = this.isBoth(), i = this.isHorizontal(), l = r ? e.every(function(w) {
        return w > -1;
      }) : e > -1;
      if (l) {
        var s = this.first, a = this.element, u = a.scrollTop, d = u === void 0 ? 0 : u, c = a.scrollLeft, p = c === void 0 ? 0 : c, f = this.calculateNumItems(), m = f.numToleratedItems, v = this.getContentPosition(), b = this.itemSize, y = function() {
          var O = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0, F = arguments.length > 1 ? arguments[1] : void 0;
          return O <= F ? 0 : O;
        }, $ = function(O, F, N) {
          return O * F + N;
        }, C = function() {
          var O = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0, F = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0;
          return n.scrollTo({
            left: O,
            top: F,
            behavior: o
          });
        }, h = r ? {
          rows: 0,
          cols: 0
        } : 0, g = !1, I = !1;
        r ? (h = {
          rows: y(e[0], m[0]),
          cols: y(e[1], m[1])
        }, C($(h.cols, b[1], v.left), $(h.rows, b[0], v.top)), I = this.lastScrollPos.top !== d || this.lastScrollPos.left !== p, g = h.rows !== s.rows || h.cols !== s.cols) : (h = y(e, m), i ? C($(h, b, v.left), d) : C(p, $(h, b, v.top)), I = this.lastScrollPos !== (i ? p : d), g = h !== s), this.isRangeChanged = g, I && (this.first = h);
      }
    },
    scrollInView: function(e, n) {
      var o = this, r = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : "auto";
      if (n) {
        var i = this.isBoth(), l = this.isHorizontal(), s = i ? e.every(function(b) {
          return b > -1;
        }) : e > -1;
        if (s) {
          var a = this.getRenderedRange(), u = a.first, d = a.viewport, c = function() {
            var y = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0, $ = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0;
            return o.scrollTo({
              left: y,
              top: $,
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
              var v = (d.first + 1) * this.itemSize;
              l ? c(v, 0) : c(0, v);
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
          var i = [we(e.element), Se(e.element)], l = i[0], s = i[1];
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
          return e.spacerStyle = Fe(Fe({}, e.spacerStyle), ho({}, "".concat(a), (u || []).length * d + c + "px"));
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
          return n.contentStyle = Fe(Fe({}, n.contentStyle), {
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
      var n = this, o = e.target, r = this.isBoth(), i = this.isHorizontal(), l = this.getContentPosition(), s = function(z, M) {
        return z ? z > M ? z - M : z : 0;
      }, a = function(z, M) {
        return Math.floor(z / (M || z));
      }, u = function(z, M, G, q, D, H) {
        return z <= D ? D : H ? G - q - D : M + D - 1;
      }, d = function(z, M, G, q, D, H, Z, fe) {
        if (z <= H) return 0;
        var oe = Math.max(0, Z ? z < M ? G : z - H : z > M ? G : z - 2 * H), J = n.getLast(oe, fe);
        return oe > J ? J - D : oe;
      }, c = function(z, M, G, q, D, H) {
        var Z = M + q + 2 * D;
        return z >= D && (Z += D + 1), n.getLast(Z, H);
      }, p = s(o.scrollTop, l.top), f = s(o.scrollLeft, l.left), m = r ? {
        rows: 0,
        cols: 0
      } : 0, v = this.last, b = !1, y = this.lastScrollPos;
      if (r) {
        var $ = this.lastScrollPos.top <= p, C = this.lastScrollPos.left <= f;
        if (!this.appendOnly || this.appendOnly && ($ || C)) {
          var h = {
            rows: a(p, this.itemSize[0]),
            cols: a(f, this.itemSize[1])
          }, g = {
            rows: u(h.rows, this.first.rows, this.last.rows, this.numItemsInViewport.rows, this.d_numToleratedItems[0], $),
            cols: u(h.cols, this.first.cols, this.last.cols, this.numItemsInViewport.cols, this.d_numToleratedItems[1], C)
          };
          m = {
            rows: d(h.rows, g.rows, this.first.rows, this.last.rows, this.numItemsInViewport.rows, this.d_numToleratedItems[0], $),
            cols: d(h.cols, g.cols, this.first.cols, this.last.cols, this.numItemsInViewport.cols, this.d_numToleratedItems[1], C, !0)
          }, v = {
            rows: c(h.rows, m.rows, this.last.rows, this.numItemsInViewport.rows, this.d_numToleratedItems[0]),
            cols: c(h.cols, m.cols, this.last.cols, this.numItemsInViewport.cols, this.d_numToleratedItems[1], !0)
          }, b = m.rows !== this.first.rows || v.rows !== this.last.rows || m.cols !== this.first.cols || v.cols !== this.last.cols || this.isRangeChanged, y = {
            top: p,
            left: f
          };
        }
      } else {
        var I = i ? f : p, w = this.lastScrollPos <= I;
        if (!this.appendOnly || this.appendOnly && w) {
          var O = a(I, this.itemSize), F = u(O, this.first, this.last, this.numItemsInViewport, this.d_numToleratedItems, w);
          m = d(O, F, this.first, this.last, this.numItemsInViewport, this.d_numToleratedItems, w), v = c(O, m, this.last, this.numItemsInViewport, this.d_numToleratedItems), b = m !== this.first || v !== this.last || this.isRangeChanged, y = I;
        }
      }
      return {
        first: m,
        last: v,
        isRangeChanged: b,
        scrollPos: y
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
        if (lt(e.element)) {
          var n = e.isBoth(), o = e.isVertical(), r = e.isHorizontal(), i = [we(e.element), Se(e.element)], l = i[0], s = i[1], a = l !== e.defaultWidth, u = s !== e.defaultHeight, d = n ? a || u : r ? a : o ? u : !1;
          d && (e.d_numToleratedItems = e.numToleratedItems, e.defaultWidth = l, e.defaultHeight = s, e.defaultContentWidth = we(e.content), e.defaultContentHeight = Se(e.content), e.init());
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
      return Fe({
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
      this.content = e || this.content || pt(this.element, '[data-pc-section="content"]');
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
    SpinnerIcon: ft
  }
}, Ol = ["tabindex"];
function kl(t, e, n, o, r, i) {
  var l = X("SpinnerIcon");
  return t.disabled ? (k(), x(Ae, {
    key: 1
  }, [A(t.$slots, "default"), A(t.$slots, "content", {
    items: t.items,
    rows: t.items,
    columns: i.loadedColumns
  })], 64)) : (k(), x("div", S({
    key: 0,
    ref: i.elementRef,
    class: i.containerClass,
    tabindex: t.tabindex,
    style: t.style,
    onScroll: e[0] || (e[0] = function() {
      return i.onScroll && i.onScroll.apply(i, arguments);
    })
  }, t.ptmi("root")), [A(t.$slots, "content", {
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
    return [V("div", S({
      ref: i.contentRef,
      class: i.contentClass,
      style: r.contentStyle
    }, t.ptm("content")), [(k(!0), x(Ae, null, yt(i.loadedItems, function(s, a) {
      return A(t.$slots, "item", {
        key: a,
        item: s,
        options: i.getOptions(a)
      });
    }), 128))], 16)];
  }), t.showSpacer ? (k(), x("div", S({
    key: 0,
    class: "p-virtualscroller-spacer",
    style: r.spacerStyle
  }, t.ptm("spacer")), null, 16)) : W("", !0), !t.loaderDisabled && t.showLoader && r.d_loading ? (k(), x("div", S({
    key: 1,
    class: i.loaderClass
  }, t.ptm("loader")), [t.$slots && t.$slots.loader ? (k(!0), x(Ae, {
    key: 0
  }, yt(r.loaderArr, function(s, a) {
    return A(t.$slots, "loader", {
      key: a,
      options: i.getLoaderOptions(a, i.isBoth() && {
        numCols: t.d_numItemsInViewport.cols
      })
    });
  }), 128)) : W("", !0), A(t.$slots, "loadingicon", {}, function() {
    return [ve(l, S({
      spin: "",
      class: "p-virtualscroller-loading-icon"
    }, t.ptm("loadingIcon")), null, 16)];
  })], 16)) : W("", !0)], 16, Ol));
}
mo.render = kl;
var Cl = `
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
`, Il = {
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
}, Tl = E.extend({
  name: "select",
  style: Cl,
  classes: Il
}), xl = {
  name: "BaseSelect",
  extends: po,
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
  style: Tl,
  provide: function() {
    return {
      $pcSelect: this,
      $parentInstance: this
    };
  }
};
function Xe(t) {
  "@babel/helpers - typeof";
  return Xe = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, Xe(t);
}
function Pl(t) {
  return El(t) || Al(t) || _l(t) || Ll();
}
function Ll() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function _l(t, e) {
  if (t) {
    if (typeof t == "string") return zt(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? zt(t, e) : void 0;
  }
}
function Al(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function El(t) {
  if (Array.isArray(t)) return zt(t);
}
function zt(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, o = Array(e); n < e; n++) o[n] = t[n];
  return o;
}
function In(t, e) {
  var n = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(t);
    e && (o = o.filter(function(r) {
      return Object.getOwnPropertyDescriptor(t, r).enumerable;
    })), n.push.apply(n, o);
  }
  return n;
}
function Tn(t) {
  for (var e = 1; e < arguments.length; e++) {
    var n = arguments[e] != null ? arguments[e] : {};
    e % 2 ? In(Object(n), !0).forEach(function(o) {
      ye(t, o, n[o]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(n)) : In(Object(n)).forEach(function(o) {
      Object.defineProperty(t, o, Object.getOwnPropertyDescriptor(n, o));
    });
  }
  return t;
}
function ye(t, e, n) {
  return (e = jl(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function jl(t) {
  var e = zl(t, "string");
  return Xe(e) == "symbol" ? e : e + "";
}
function zl(t, e) {
  if (Xe(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(t, e);
    if (Xe(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var Fl = {
  name: "Select",
  extends: xl,
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
    this.unbindOutsideClickListener(), this.unbindResizeListener(), this.unbindLabelClickListener(), this.unbindMatchMediaOrientationListener(), this.scrollHandler && (this.scrollHandler.destroy(), this.scrollHandler = null), this.overlay && (mt.clear(this.overlay), this.overlay = null);
  },
  methods: {
    getOptionIndex: function(e, n) {
      return this.virtualScrollerDisabled ? e : n && n(e).index;
    },
    getOptionLabel: function(e) {
      return this.optionLabel ? pe(e, this.optionLabel) : e;
    },
    getOptionValue: function(e) {
      return this.optionValue ? pe(e, this.optionValue) : e;
    },
    getOptionRenderKey: function(e, n) {
      return (this.dataKey ? pe(e, this.dataKey) : this.getOptionLabel(e)) + "_" + n;
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
      return this.optionDisabled ? pe(e, this.optionDisabled) : !1;
    },
    isOptionGroup: function(e) {
      return this.optionGroupLabel && e.optionGroup && e.group;
    },
    getOptionGroupLabel: function(e) {
      return pe(e, this.optionGroupLabel);
    },
    getOptionGroupChildren: function(e) {
      return pe(e, this.optionGroupChildren);
    },
    getAriaPosInset: function(e) {
      var n = this;
      return (this.optionGroupLabel ? e - this.visibleOptions.slice(0, e).filter(function(o) {
        return n.isOptionGroup(o);
      }).length : e) + 1;
    },
    show: function(e) {
      this.$emit("before-show"), this.overlayVisible = !0, this.focusedOptionIndex = this.focusedOptionIndex !== -1 ? this.focusedOptionIndex : this.autoOptionFocus ? this.findFirstFocusedOptionIndex() : this.editable ? -1 : this.findSelectedOptionIndex(), e && de(this.$refs.focusInput);
    },
    hide: function(e) {
      var n = this, o = function() {
        n.$emit("before-hide"), n.overlayVisible = !1, n.clicked = !1, n.focusedOptionIndex = -1, n.searchValue = "", n.resetFilterOnHide && (n.filterValue = null), e && de(n.$refs.focusInput);
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
      if (vr())
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
          !o && Qo(e.key) && (!this.overlayVisible && this.show(), !this.editable && this.searchOptions(e, e.key), this.filter && this.$nextTick(function() {
            n.$refs.filterInput && de(n.$refs.filterInput.$el);
          }));
          break;
      }
      this.clicked = !1;
    },
    onEditableInput: function(e) {
      var n = e.target.value;
      this.searchValue = "";
      var o = this.searchOptions(e, n);
      !o && (this.focusedOptionIndex = -1), this.updateModel(e, n), !this.overlayVisible && _(n) && this.show();
    },
    onContainerClick: function(e) {
      this.disabled || this.loading || e.target.tagName === "INPUT" || e.target.getAttribute("data-pc-section") === "clearicon" || e.target.closest('[data-pc-section="clearicon"]') || ((!this.overlay || !this.overlay.contains(e.target)) && (this.overlayVisible ? this.hide(!0) : this.show(!0)), this.clicked = !0);
    },
    onClearClick: function(e) {
      this.updateModel(e, null), this.resetFilterOnClear && (this.filterValue = null);
    },
    onFirstHiddenFocus: function(e) {
      var n = e.relatedTarget === this.$refs.focusInput ? fr(this.overlay, ':not([data-p-hidden-focusable="true"])') : this.$refs.focusInput;
      de(n);
    },
    onLastHiddenFocus: function(e) {
      var n = e.relatedTarget === this.$refs.focusInput ? hr(this.overlay, ':not([data-p-hidden-focusable="true"])') : this.$refs.focusInput;
      de(n);
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
      Ri.emit("overlay-click", {
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
      n || (this.overlayVisible && this.hasFocusableElements() ? (de(this.$refs.firstHiddenFocusableElementOnOverlay), e.preventDefault()) : (this.focusedOptionIndex !== -1 && this.onOptionSelect(e, this.visibleOptions[this.focusedOptionIndex]), this.overlayVisible && this.hide(this.filter)));
    },
    onBackspaceKey: function(e) {
      var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1;
      n && !this.overlayVisible && this.show();
    },
    onOverlayEnter: function(e) {
      var n = this;
      mt.set("overlay", e, this.$primevue.config.zIndex.overlay), lr(e, {
        position: "absolute",
        top: "0"
      }), this.alignOverlay(), this.scrollInView(), this.$attrSelector && e.setAttribute(this.$attrSelector, ""), setTimeout(function() {
        n.autoFilterFocus && n.filter && de(n.$refs.filterInput.$el), n.autoUpdateModel();
      }, 1);
    },
    onOverlayAfterEnter: function() {
      this.bindOutsideClickListener(), this.bindScrollListener(), this.bindResizeListener(), this.$emit("show");
    },
    onOverlayLeave: function(e) {
      var n = this;
      e.style.pointerEvents = "none", this.unbindOutsideClickListener(), this.unbindScrollListener(), this.unbindResizeListener(), this.autoFilterFocus && this.filter && !this.editable && this.$nextTick(function() {
        n.$refs.filterInput && de(n.$refs.filterInput.$el);
      }), this.$emit("hide"), this.overlay = null;
    },
    onOverlayAfterLeave: function(e) {
      mt.clear(e);
    },
    alignOverlay: function() {
      this.appendTo === "self" ? sr(this.overlay, this.$el) : this.overlay && (this.overlay.style.minWidth = Nn(this.$el) + "px", ar(this.overlay, this.$el));
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
      this.scrollHandler || (this.scrollHandler = new Bi(this.$refs.container, function() {
        e.overlayVisible && e.hide();
      })), this.scrollHandler.bindScrollListener();
    },
    unbindScrollListener: function() {
      this.scrollHandler && this.scrollHandler.unbindScrollListener();
    },
    bindResizeListener: function() {
      var e = this;
      this.resizeListener || (this.resizeListener = function() {
        e.overlayVisible && !yr() && e.hide();
      }, window.addEventListener("resize", this.resizeListener));
    },
    unbindResizeListener: function() {
      this.resizeListener && (window.removeEventListener("resize", this.resizeListener), this.resizeListener = null);
    },
    bindLabelClickListener: function() {
      var e = this;
      if (!this.editable && !this.labelClickListener) {
        var n = document.querySelector('label[for="'.concat(this.labelId, '"]'));
        n && lt(n) && (this.labelClickListener = function() {
          de(e.$refs.focusInput);
        }, n.addEventListener("click", this.labelClickListener));
      }
    },
    unbindLabelClickListener: function() {
      if (this.labelClickListener) {
        var e = document.querySelector('label[for="'.concat(this.labelId, '"]'));
        e && lt(e) && e.removeEventListener("click", this.labelClickListener);
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
      return Mt(this.overlay, ':not([data-p-hidden-focusable="true"])').length > 0;
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
      return _(e) && !(this.isOptionDisabled(e) || this.isOptionGroup(e));
    },
    isValidSelectedOption: function(e) {
      return this.isValidOption(e) && this.isSelected(e);
    },
    isSelected: function(e) {
      return En(this.d_value, this.getOptionValue(e), this.equalityKey);
    },
    findFirstOptionIndex: function() {
      var e = this;
      return this.visibleOptions.findIndex(function(n) {
        return e.isValidOption(n);
      });
    },
    findLastOptionIndex: function() {
      var e = this;
      return Gt(this.visibleOptions, function(n) {
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
      var n = this, o = e > 0 ? Gt(this.visibleOptions.slice(0, e), function(r) {
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
      return _(this.searchValue) && (r = this.visibleOptions.findIndex(function(l) {
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
        var o = n !== -1 ? "".concat(e.$id, "_").concat(n) : e.focusedOptionId, r = pt(e.list, 'li[id="'.concat(o, '"]'));
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
        var o = jr.filter(n, this.searchFields, this.filterValue, this.filterMatchMode, this.filterLocale);
        if (this.optionGroupLabel) {
          var r = this.options || [], i = [];
          return r.forEach(function(l) {
            var s = e.getOptionGroupChildren(l), a = s.filter(function(u) {
              return o.includes(u);
            });
            a.length > 0 && i.push(Tn(Tn({}, l), {}, ye({}, typeof e.optionGroupChildren == "string" ? e.optionGroupChildren : "items", Pl(a))));
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
      return _(this.visibleOptions) ? this.filterMessageText.replaceAll("{0}", this.visibleOptions.length) : this.emptyFilterMessageText;
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
      return ne(ye({
        invalid: this.$invalid,
        disabled: this.disabled,
        focus: this.focused,
        fluid: this.$fluid,
        filled: this.$variant === "filled"
      }, this.size, this.size));
    },
    labelDataP: function() {
      return ne(ye(ye({
        placeholder: !this.editable && this.label === this.placeholder,
        clearable: this.showClear,
        disabled: this.disabled,
        editable: this.editable
      }, this.size, this.size), "empty", !this.editable && !this.$slots.value && (this.label === "p-emptylabel" || this.label.length === 0)));
    },
    dropdownIconDataP: function() {
      return ne(ye({}, this.size, this.size));
    },
    overlayDataP: function() {
      return ne(ye({}, "portal-" + this.appendTo, "portal-" + this.appendTo));
    }
  },
  directives: {
    ripple: Xn
  },
  components: {
    InputText: fo,
    VirtualScroller: mo,
    Portal: Nt,
    InputIcon: uo,
    IconField: so,
    TimesIcon: lo,
    ChevronDownIcon: io,
    SpinnerIcon: ft,
    SearchIcon: ao,
    CheckIcon: ro,
    BlankIcon: oo
  }
}, Vl = ["id", "data-p"], Ml = ["name", "id", "value", "placeholder", "tabindex", "disabled", "aria-label", "aria-labelledby", "aria-expanded", "aria-controls", "aria-activedescendant", "aria-invalid", "data-p"], Nl = ["name", "id", "tabindex", "aria-label", "aria-labelledby", "aria-expanded", "aria-controls", "aria-activedescendant", "aria-invalid", "aria-disabled", "data-p"], Dl = ["data-p"], Bl = ["id"], Rl = ["id"], Hl = ["id", "aria-label", "aria-selected", "aria-disabled", "aria-setsize", "aria-posinset", "onMousedown", "onMousemove", "data-p-selected", "data-p-focused", "data-p-disabled"];
function Kl(t, e, n, o, r, i) {
  var l = X("SpinnerIcon"), s = X("InputText"), a = X("SearchIcon"), u = X("InputIcon"), d = X("IconField"), c = X("CheckIcon"), p = X("BlankIcon"), f = X("VirtualScroller"), m = X("Portal"), v = _n("ripple");
  return k(), x("div", S({
    ref: "container",
    id: t.$id,
    class: t.cx("root"),
    onClick: e[12] || (e[12] = function() {
      return i.onContainerClick && i.onContainerClick.apply(i, arguments);
    }),
    "data-p": i.containerDataP
  }, t.ptmi("root")), [t.editable ? (k(), x("input", S({
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
  }, t.ptm("label")), null, 16, Ml)) : (k(), x("span", S({
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
  }, t.ptm("label")), [A(t.$slots, "value", {
    value: t.d_value,
    placeholder: t.placeholder
  }, function() {
    var b;
    return [it(ae(i.label === "p-emptylabel" ? " " : (b = i.label) !== null && b !== void 0 ? b : "empty"), 1)];
  })], 16, Nl)), i.isClearIconVisible ? A(t.$slots, "clearicon", {
    key: 2,
    class: Pe(t.cx("clearIcon")),
    clearCallback: i.onClearClick
  }, function() {
    return [(k(), le(vt(t.clearIcon ? "i" : "TimesIcon"), S({
      ref: "clearIcon",
      class: [t.cx("clearIcon"), t.clearIcon],
      onClick: i.onClearClick
    }, t.ptm("clearIcon"), {
      "data-pc-section": "clearicon"
    }), null, 16, ["class", "onClick"]))];
  }) : W("", !0), V("div", S({
    class: t.cx("dropdown")
  }, t.ptm("dropdown")), [t.loading ? A(t.$slots, "loadingicon", {
    key: 0,
    class: Pe(t.cx("loadingIcon"))
  }, function() {
    return [t.loadingIcon ? (k(), x("span", S({
      key: 0,
      class: [t.cx("loadingIcon"), "pi-spin", t.loadingIcon],
      "aria-hidden": "true"
    }, t.ptm("loadingIcon")), null, 16)) : (k(), le(l, S({
      key: 1,
      class: t.cx("loadingIcon"),
      spin: "",
      "aria-hidden": "true"
    }, t.ptm("loadingIcon")), null, 16, ["class"]))];
  }) : A(t.$slots, "dropdownicon", {
    key: 1,
    class: Pe(t.cx("dropdownIcon"))
  }, function() {
    return [(k(), le(vt(t.dropdownIcon ? "span" : "ChevronDownIcon"), S({
      class: [t.cx("dropdownIcon"), t.dropdownIcon],
      "aria-hidden": "true",
      "data-p": i.dropdownIconDataP
    }, t.ptm("dropdownIcon")), null, 16, ["class", "data-p"]))];
  })], 16), ve(m, {
    appendTo: t.appendTo
  }, {
    default: be(function() {
      return [ve(Mo, S({
        name: "p-anchored-overlay",
        onEnter: i.onOverlayEnter,
        onAfterEnter: i.onOverlayAfterEnter,
        onLeave: i.onOverlayLeave,
        onAfterLeave: i.onOverlayAfterLeave
      }, t.ptm("transition")), {
        default: be(function() {
          return [r.overlayVisible ? (k(), x("div", S({
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
          }, t.ptm("overlay")), [V("span", S({
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
          }), null, 16), A(t.$slots, "header", {
            value: t.d_value,
            options: i.visibleOptions
          }), t.filter ? (k(), x("div", S({
            key: 0,
            class: t.cx("header")
          }, t.ptm("header")), [ve(d, {
            unstyled: t.unstyled,
            pt: t.ptm("pcFilterContainer")
          }, {
            default: be(function() {
              return [ve(s, {
                ref: "filterInput",
                type: "text",
                value: r.filterValue,
                onVnodeMounted: i.onFilterUpdated,
                onVnodeUpdated: i.onFilterUpdated,
                class: Pe(t.cx("pcFilter")),
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
              }, null, 8, ["value", "onVnodeMounted", "onVnodeUpdated", "class", "placeholder", "variant", "unstyled", "aria-owns", "aria-activedescendant", "onKeydown", "onBlur", "onInput", "pt"]), ve(u, {
                unstyled: t.unstyled,
                pt: t.ptm("pcFilterIconContainer")
              }, {
                default: be(function() {
                  return [A(t.$slots, "filtericon", {}, function() {
                    return [t.filterIcon ? (k(), x("span", S({
                      key: 0,
                      class: t.filterIcon
                    }, t.ptm("filterIcon")), null, 16)) : (k(), le(a, No(S({
                      key: 1
                    }, t.ptm("filterIcon"))), null, 16))];
                  })];
                }),
                _: 3
              }, 8, ["unstyled", "pt"])];
            }),
            _: 3
          }, 8, ["unstyled", "pt"]), V("span", S({
            role: "status",
            "aria-live": "polite",
            class: "p-hidden-accessible"
          }, t.ptm("hiddenFilterResult"), {
            "data-p-hidden-accessible": !0
          }), ae(i.filterResultMessageText), 17)], 16)) : W("", !0), V("div", S({
            class: t.cx("listContainer"),
            style: {
              "max-height": i.virtualScrollerDisabled ? t.scrollHeight : ""
            }
          }, t.ptm("listContainer")), [ve(f, S({
            ref: i.virtualScrollerRef
          }, t.virtualScrollerOptions, {
            items: i.visibleOptions,
            style: {
              height: t.scrollHeight
            },
            tabindex: -1,
            disabled: i.virtualScrollerDisabled,
            pt: t.ptm("virtualScroller")
          }), Do({
            content: be(function(b) {
              var y = b.styleClass, $ = b.contentRef, C = b.items, h = b.getItemOptions, g = b.contentStyle, I = b.itemSize;
              return [V("ul", S({
                ref: function(O) {
                  return i.listRef(O, $);
                },
                id: t.$id + "_list",
                class: [t.cx("list"), y],
                style: g,
                role: "listbox"
              }, t.ptm("list")), [(k(!0), x(Ae, null, yt(C, function(w, O) {
                return k(), x(Ae, {
                  key: i.getOptionRenderKey(w, i.getOptionIndex(O, h))
                }, [i.isOptionGroup(w) ? (k(), x("li", S({
                  key: 0,
                  id: t.$id + "_" + i.getOptionIndex(O, h),
                  style: {
                    height: I ? I + "px" : void 0
                  },
                  class: t.cx("optionGroup"),
                  role: "option"
                }, {
                  ref_for: !0
                }, t.ptm("optionGroup")), [A(t.$slots, "optiongroup", {
                  option: w.optionGroup,
                  index: i.getOptionIndex(O, h)
                }, function() {
                  return [V("span", S({
                    class: t.cx("optionGroupLabel")
                  }, {
                    ref_for: !0
                  }, t.ptm("optionGroupLabel")), ae(i.getOptionGroupLabel(w.optionGroup)), 17)];
                })], 16, Rl)) : An((k(), x("li", S({
                  key: 1,
                  id: t.$id + "_" + i.getOptionIndex(O, h),
                  class: t.cx("option", {
                    option: w,
                    focusedOption: i.getOptionIndex(O, h)
                  }),
                  style: {
                    height: I ? I + "px" : void 0
                  },
                  role: "option",
                  "aria-label": i.getOptionLabel(w),
                  "aria-selected": i.isSelected(w),
                  "aria-disabled": i.isOptionDisabled(w),
                  "aria-setsize": i.ariaSetSize,
                  "aria-posinset": i.getAriaPosInset(i.getOptionIndex(O, h)),
                  onMousedown: function(N) {
                    return i.onOptionSelect(N, w);
                  },
                  onMousemove: function(N) {
                    return i.onOptionMouseMove(N, i.getOptionIndex(O, h));
                  },
                  onClick: e[8] || (e[8] = Bo(function() {
                  }, ["stop"])),
                  "data-p-selected": !t.checkmark && i.isSelected(w),
                  "data-p-focused": r.focusedOptionIndex === i.getOptionIndex(O, h),
                  "data-p-disabled": i.isOptionDisabled(w)
                }, {
                  ref_for: !0
                }, i.getPTItemOptions(w, h, O, "option")), [t.checkmark ? (k(), x(Ae, {
                  key: 0
                }, [i.isSelected(w) ? (k(), le(c, S({
                  key: 0,
                  class: t.cx("optionCheckIcon")
                }, {
                  ref_for: !0
                }, t.ptm("optionCheckIcon")), null, 16, ["class"])) : (k(), le(p, S({
                  key: 1,
                  class: t.cx("optionBlankIcon")
                }, {
                  ref_for: !0
                }, t.ptm("optionBlankIcon")), null, 16, ["class"]))], 64)) : W("", !0), A(t.$slots, "option", {
                  option: w,
                  selected: i.isSelected(w),
                  index: i.getOptionIndex(O, h)
                }, function() {
                  return [V("span", S({
                    class: t.cx("optionLabel")
                  }, {
                    ref_for: !0
                  }, t.ptm("optionLabel")), ae(i.getOptionLabel(w)), 17)];
                })], 16, Hl)), [[v]])], 64);
              }), 128)), r.filterValue && (!C || C && C.length === 0) ? (k(), x("li", S({
                key: 0,
                class: t.cx("emptyMessage"),
                role: "option"
              }, t.ptm("emptyMessage"), {
                "data-p-hidden-accessible": !0
              }), [A(t.$slots, "emptyfilter", {}, function() {
                return [it(ae(i.emptyFilterMessageText), 1)];
              })], 16)) : !t.options || t.options && t.options.length === 0 ? (k(), x("li", S({
                key: 1,
                class: t.cx("emptyMessage"),
                role: "option"
              }, t.ptm("emptyMessage"), {
                "data-p-hidden-accessible": !0
              }), [A(t.$slots, "empty", {}, function() {
                return [it(ae(i.emptyMessageText), 1)];
              })], 16)) : W("", !0)], 16, Bl)];
            }),
            _: 2
          }, [t.$slots.loader ? {
            name: "loader",
            fn: be(function(b) {
              var y = b.options;
              return [A(t.$slots, "loader", {
                options: y
              })];
            }),
            key: "0"
          } : void 0]), 1040, ["items", "style", "disabled", "pt"])], 16), A(t.$slots, "footer", {
            value: t.d_value,
            options: i.visibleOptions
          }), !t.options || t.options && t.options.length === 0 ? (k(), x("span", S({
            key: 1,
            role: "status",
            "aria-live": "polite",
            class: "p-hidden-accessible"
          }, t.ptm("hiddenEmptyMessage"), {
            "data-p-hidden-accessible": !0
          }), ae(i.emptyMessageText), 17)) : W("", !0), V("span", S({
            role: "status",
            "aria-live": "polite",
            class: "p-hidden-accessible"
          }, t.ptm("hiddenSelectedMessage"), {
            "data-p-hidden-accessible": !0
          }), ae(i.selectedMessageText), 17), V("span", S({
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
          }), null, 16)], 16, Dl)) : W("", !0)];
        }),
        _: 3
      }, 16, ["onEnter", "onAfterEnter", "onLeave", "onAfterLeave"])];
    }),
    _: 3
  }, 8, ["appendTo"])], 16, Vl);
}
Fl.render = Kl;
var Wl = `
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
`, Ul = {
  root: {
    position: "relative"
  }
}, Gl = {
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
}, ql = E.extend({
  name: "toggleswitch",
  style: Wl,
  classes: Gl,
  inlineStyles: Ul
}), Yl = {
  name: "BaseToggleSwitch",
  extends: co,
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
  style: ql,
  provide: function() {
    return {
      $pcToggleSwitch: this,
      $parentInstance: this
    };
  }
}, Zl = {
  name: "ToggleSwitch",
  extends: Yl,
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
      return ne({
        checked: this.checked,
        disabled: this.disabled,
        invalid: this.$invalid
      });
    }
  }
}, Jl = ["data-p-checked", "data-p-disabled", "data-p"], Ql = ["id", "checked", "tabindex", "disabled", "readonly", "aria-checked", "aria-labelledby", "aria-label", "aria-invalid"], Xl = ["data-p"], es = ["data-p"];
function ts(t, e, n, o, r, i) {
  return k(), x("div", S({
    class: t.cx("root"),
    style: t.sx("root")
  }, i.getPTOptions("root"), {
    "data-p-checked": i.checked,
    "data-p-disabled": t.disabled,
    "data-p": i.dataP
  }), [V("input", S({
    id: t.inputId,
    type: "checkbox",
    role: "switch",
    class: [t.cx("input"), t.inputClass],
    style: t.inputStyle,
    checked: i.checked,
    tabindex: t.tabindex,
    disabled: t.disabled,
    readonly: t.readonly,
    "aria-checked": i.checked,
    "aria-labelledby": t.ariaLabelledby,
    "aria-label": t.ariaLabel,
    "aria-invalid": t.invalid || void 0,
    onFocus: e[0] || (e[0] = function() {
      return i.onFocus && i.onFocus.apply(i, arguments);
    }),
    onBlur: e[1] || (e[1] = function() {
      return i.onBlur && i.onBlur.apply(i, arguments);
    }),
    onChange: e[2] || (e[2] = function() {
      return i.onChange && i.onChange.apply(i, arguments);
    })
  }, i.getPTOptions("input")), null, 16, Ql), V("div", S({
    class: t.cx("slider")
  }, i.getPTOptions("slider"), {
    "data-p": i.dataP
  }), [V("div", S({
    class: t.cx("handle")
  }, i.getPTOptions("handle"), {
    "data-p": i.dataP
  }), [A(t.$slots, "handle", {
    checked: i.checked
  })], 16, es)], 16, Xl)], 16, Jl);
}
Zl.render = ts;
const ns = { class: "kx-wcmount" }, os = {
  key: 0,
  class: "kx-wcmount-fail",
  role: "alert"
}, rs = /* @__PURE__ */ Ro({
  __name: "WcMount",
  props: {
    tag: {},
    config: {},
    schema: {},
    meta: {},
    provider: {},
    label: {},
    attrs: {}
  },
  emits: ["change", "select", "created", "close", "error"],
  setup(t, { emit: e }) {
    const n = t, o = e, r = _e(null), i = _e(!1);
    let l = null, s = 0;
    const a = /* @__PURE__ */ new Set();
    function u(g) {
      g.composedPath()[0] === l && (g.stopPropagation(), o("change", g.detail));
    }
    function d(g) {
      return g.composedPath()[0] !== l ? !1 : (g.stopPropagation(), !0);
    }
    function c(g) {
      d(g) && o("select", g.detail);
    }
    function p(g) {
      d(g) && o("created", g.detail);
    }
    function f(g) {
      d(g) && o("close", g.detail);
    }
    function m(g) {
      d(g) && o("error", g.detail);
    }
    function v(g) {
      if (typeof g == "string") return g;
      try {
        return JSON.stringify(g ?? {});
      } catch {
        return null;
      }
    }
    function b() {
      if (!l) return;
      const g = v(n.config);
      if (g !== null && l.setAttribute("config", g), n.schema !== void 0 && n.schema !== null) {
        const w = v(n.schema);
        w !== null && l.setAttribute("schema", w);
      }
      if (n.meta !== void 0 && n.meta !== null) {
        const w = v(n.meta);
        w !== null && l.setAttribute("meta", w);
      }
      n.provider && l.setAttribute("provider", n.provider), n.label && l.setAttribute("label", n.label);
      const I = n.attrs || {};
      for (const w of [...a])
        (!(w in I) || I[w] == null) && (l.removeAttribute(w), a.delete(w));
      for (const [w, O] of Object.entries(I)) {
        if (O == null) continue;
        const F = typeof O == "object" ? v(O) : String(O);
        F !== null && (l.setAttribute(w, F), a.add(w));
      }
    }
    function y(g = l) {
      g && (g.removeEventListener("config-changed", u), g.removeEventListener("change", u), g.removeEventListener("select", c), g.removeEventListener("created", p), g.removeEventListener("close", f), g.removeEventListener("error", m), g === l && (l = null), a.clear());
    }
    async function $(g) {
      if (!customElements.get(g))
        try {
          await Ko(g, { timeoutMs: 8e3 });
        } catch {
        }
    }
    async function C() {
      const g = ++s, I = r.value, w = n.tag;
      if (i.value = !1, !!I && (y(), I.innerHTML = "", !!w))
        try {
          if (await $(w), g !== s || r.value !== I || n.tag !== w) return;
          const O = document.createElement(w);
          O.classList.add("kx-wcmount-surface"), l = O, b(), O.addEventListener("config-changed", u), O.addEventListener("change", u), O.addEventListener("select", c), O.addEventListener("created", p), O.addEventListener("close", f), O.addEventListener("error", m), O.style.display = "block", I.appendChild(O), i.value = !customElements.get(w);
        } catch {
          g === s && (i.value = !0);
        }
    }
    async function h() {
      i.value = !1, await Pn(), await C();
    }
    return xn(C), $e(() => n.tag, C), $e(() => [n.config, n.schema, n.meta, n.provider, n.label, n.attrs], b, { deep: !0 }), Ho(() => {
      s += 1, y();
    }), (g, I) => (k(), x("div", ns, [
      i.value ? (k(), x("div", os, [
        I[0] || (I[0] = V("span", null, "This setup panel couldn’t load.", -1)),
        V("button", {
          type: "button",
          onClick: h
        }, "Try again")
      ])) : (k(), x("div", {
        key: 1,
        ref_key: "host",
        ref: r
      }, null, 512))
    ]));
  }
}), is = (t, e) => {
  const n = t.__vccOpts || t;
  for (const [o, r] of e)
    n[o] = r;
  return n;
}, us = /* @__PURE__ */ is(rs, [["__scopeId", "data-v-3d6a00f1"]]);
export {
  ss as P,
  us as W,
  Fl as a,
  Sa as b,
  Zl as s
};
//# sourceMappingURL=WcMount-CXaiZg2f.js.map

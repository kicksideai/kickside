import { ref as re, readonly as Gt, getCurrentInstance as Re, onMounted as Zt, nextTick as ut, watch as te, reactive as Jt, renderSlot as ae, openBlock as dt, createBlock as Xt, Teleport as ct, createCommentVNode as Ae, h as en, defineComponent as tn, onBeforeUnmount as nn, createElementBlock as rn, normalizeStyle as on } from "vue";
var an = Object.defineProperty, De = Object.getOwnPropertySymbols, sn = Object.prototype.hasOwnProperty, ln = Object.prototype.propertyIsEnumerable, Ie = (e, t, n) => t in e ? an(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n, un = (e, t) => {
  for (var n in t || (t = {})) sn.call(t, n) && Ie(e, n, t[n]);
  if (De) for (var n of De(t)) ln.call(t, n) && Ie(e, n, t[n]);
  return e;
};
function _e(e) {
  return e == null || e === "" || Array.isArray(e) && e.length === 0 || !(e instanceof Date) && typeof e == "object" && Object.keys(e).length === 0;
}
function xe(e, t, n = /* @__PURE__ */ new WeakSet()) {
  if (e === t) return !0;
  if (!e || !t || typeof e != "object" || typeof t != "object" || n.has(e) || n.has(t)) return !1;
  n.add(e).add(t);
  let r = Array.isArray(e), o = Array.isArray(t), s, i, l;
  if (r && o) {
    if (i = e.length, i != t.length) return !1;
    for (s = i; s-- !== 0; ) if (!xe(e[s], t[s], n)) return !1;
    return !0;
  }
  if (r != o) return !1;
  let a = e instanceof Date, u = t instanceof Date;
  if (a != u) return !1;
  if (a && u) return e.getTime() == t.getTime();
  let d = e instanceof RegExp, p = t instanceof RegExp;
  if (d != p) return !1;
  if (d && p) return e.toString() == t.toString();
  let c = Object.keys(e);
  if (i = c.length, i !== Object.keys(t).length) return !1;
  for (s = i; s-- !== 0; ) if (!Object.prototype.hasOwnProperty.call(t, c[s])) return !1;
  for (s = i; s-- !== 0; ) if (l = c[s], !xe(e[l], t[l], n)) return !1;
  return !0;
}
function dn(e, t) {
  return xe(e, t);
}
function ft(e) {
  return typeof e == "function" && "call" in e && "apply" in e;
}
function v(e) {
  return !_e(e);
}
function Te(e, t) {
  if (!e || !t) return null;
  try {
    let n = e[t];
    if (v(n)) return n;
  } catch {
  }
  if (Object.keys(e).length) {
    if (ft(t)) return t(e);
    if (t.indexOf(".") === -1) return e[t];
    {
      let n = t.split("."), r = e;
      for (let o = 0, s = n.length; o < s; ++o) {
        if (r == null) return null;
        r = r[n[o]];
      }
      return r;
    }
  }
  return null;
}
function cn(e, t, n) {
  return n ? Te(e, n) === Te(t, n) : dn(e, t);
}
function H(e, t = !0) {
  return e instanceof Object && e.constructor === Object && (t || Object.keys(e).length !== 0);
}
function pt(e = {}, t = {}) {
  let n = un({}, e);
  return Object.keys(t).forEach((r) => {
    let o = r;
    H(t[o]) && o in e && H(e[o]) ? n[o] = pt(e[o], t[o]) : n[o] = t[o];
  }), n;
}
function fn(...e) {
  return e.reduce((t, n, r) => r === 0 ? n : pt(t, n), {});
}
function br(e, t) {
  let n = -1;
  if (v(e)) try {
    n = e.findLastIndex(t);
  } catch {
    n = e.lastIndexOf([...e].reverse().find(t));
  }
  return n;
}
function _(e, ...t) {
  return ft(e) ? e(...t) : e;
}
function F(e, t = !0) {
  return typeof e == "string" && (t || e !== "");
}
function He(e) {
  return F(e) ? e.replace(/(-|_)/g, "").toLowerCase() : e;
}
function pn(e, t = "", n = {}) {
  let r = He(t).split("."), o = r.shift();
  if (o) {
    if (H(e)) {
      let s = Object.keys(e).find((i) => He(i) === o) || "";
      return pn(_(e[s], n), r.join("."), n);
    }
    return;
  }
  return _(e, n);
}
function Sr(e, t = !0) {
  return Array.isArray(e) && (t || e.length !== 0);
}
function mn(e) {
  return v(e) && !isNaN(e);
}
function wr(e = "") {
  return v(e) && e.length === 1 && !!e.match(/\S| /);
}
function Y(e, t) {
  if (t) {
    let n = t.test(e);
    return t.lastIndex = 0, n;
  }
  return !1;
}
function hn(...e) {
  return fn(...e);
}
function ie(e) {
  return e && e.replace(/\/\*(?:(?!\*\/)[\s\S])*\*\/|[\r\n\t]+/g, "").replace(/ {2,}/g, " ").replace(/ ([{:}]) /g, "$1").replace(/([;,]) /g, "$1").replace(/ !/g, "!").replace(/: /g, ":").trim();
}
function T(e) {
  if (e && /[\xC0-\xFF\u0100-\u017E]/.test(e)) {
    let t = { A: /[\xC0-\xC5\u0100\u0102\u0104]/g, AE: /[\xC6]/g, C: /[\xC7\u0106\u0108\u010A\u010C]/g, D: /[\xD0\u010E\u0110]/g, E: /[\xC8-\xCB\u0112\u0114\u0116\u0118\u011A]/g, G: /[\u011C\u011E\u0120\u0122]/g, H: /[\u0124\u0126]/g, I: /[\xCC-\xCF\u0128\u012A\u012C\u012E\u0130]/g, IJ: /[\u0132]/g, J: /[\u0134]/g, K: /[\u0136]/g, L: /[\u0139\u013B\u013D\u013F\u0141]/g, N: /[\xD1\u0143\u0145\u0147\u014A]/g, O: /[\xD2-\xD6\xD8\u014C\u014E\u0150]/g, OE: /[\u0152]/g, R: /[\u0154\u0156\u0158]/g, S: /[\u015A\u015C\u015E\u0160]/g, T: /[\u0162\u0164\u0166]/g, U: /[\xD9-\xDC\u0168\u016A\u016C\u016E\u0170\u0172]/g, W: /[\u0174]/g, Y: /[\xDD\u0176\u0178]/g, Z: /[\u0179\u017B\u017D]/g, a: /[\xE0-\xE5\u0101\u0103\u0105]/g, ae: /[\xE6]/g, c: /[\xE7\u0107\u0109\u010B\u010D]/g, d: /[\u010F\u0111]/g, e: /[\xE8-\xEB\u0113\u0115\u0117\u0119\u011B]/g, g: /[\u011D\u011F\u0121\u0123]/g, i: /[\xEC-\xEF\u0129\u012B\u012D\u012F\u0131]/g, ij: /[\u0133]/g, j: /[\u0135]/g, k: /[\u0137,\u0138]/g, l: /[\u013A\u013C\u013E\u0140\u0142]/g, n: /[\xF1\u0144\u0146\u0148\u014B]/g, p: /[\xFE]/g, o: /[\xF2-\xF6\xF8\u014D\u014F\u0151]/g, oe: /[\u0153]/g, r: /[\u0155\u0157\u0159]/g, s: /[\u015B\u015D\u015F\u0161]/g, t: /[\u0163\u0165\u0167]/g, u: /[\xF9-\xFC\u0169\u016B\u016D\u016F\u0171\u0173]/g, w: /[\u0175]/g, y: /[\xFD\xFF\u0177]/g, z: /[\u017A\u017C\u017E]/g };
    for (let n in t) e = e.replace(t[n], n);
  }
  return e;
}
function xr(e) {
  return F(e, !1) ? e[0].toUpperCase() + e.slice(1) : e;
}
function mt(e) {
  return F(e) ? e.replace(/(_)/g, "-").replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase() : e;
}
function ht() {
  let e = /* @__PURE__ */ new Map();
  return { on(t, n) {
    let r = e.get(t);
    return r ? r.push(n) : r = [n], e.set(t, r), this;
  }, off(t, n) {
    let r = e.get(t);
    return r && r.splice(r.indexOf(n) >>> 0, 1), this;
  }, emit(t, n) {
    let r = e.get(t);
    r && r.forEach((o) => {
      o(n);
    });
  }, clear() {
    e.clear();
  } };
}
function gn(e, t) {
  return e ? e.classList ? e.classList.contains(t) : new RegExp("(^| )" + t + "( |$)", "gi").test(e.className) : !1;
}
function Fe(e, t) {
  if (e && t) {
    let n = (r) => {
      gn(e, r) || (e.classList ? e.classList.add(r) : e.className += " " + r);
    };
    [t].flat().filter(Boolean).forEach((r) => r.split(" ").forEach(n));
  }
}
function yn() {
  return window.innerWidth - document.documentElement.offsetWidth;
}
function Tr(e) {
  typeof e == "string" ? Fe(document.body, e || "p-overflow-hidden") : (e != null && e.variableName && document.body.style.setProperty(e.variableName, yn() + "px"), Fe(document.body, e?.className || "p-overflow-hidden"));
}
function We(e, t) {
  if (e && t) {
    let n = (r) => {
      e.classList ? e.classList.remove(r) : e.className = e.className.replace(new RegExp("(^|\\b)" + r.split(" ").join("|") + "(\\b|$)", "gi"), " ");
    };
    [t].flat().filter(Boolean).forEach((r) => r.split(" ").forEach(n));
  }
}
function Or(e) {
  typeof e == "string" ? We(document.body, e || "p-overflow-hidden") : (e != null && e.variableName && document.body.style.removeProperty(e.variableName), We(document.body, e?.className || "p-overflow-hidden"));
}
function Oe(e) {
  for (let t of document?.styleSheets) try {
    for (let n of t?.cssRules) for (let r of n?.style) if (e.test(r)) return { name: r, value: n.style.getPropertyValue(r).trim() };
  } catch {
  }
  return null;
}
function gt(e) {
  let t = { width: 0, height: 0 };
  if (e) {
    let [n, r] = [e.style.visibility, e.style.display], o = e.getBoundingClientRect();
    e.style.visibility = "hidden", e.style.display = "block", t.width = o.width || e.offsetWidth, t.height = o.height || e.offsetHeight, e.style.display = r, e.style.visibility = n;
  }
  return t;
}
function yt() {
  let e = window, t = document, n = t.documentElement, r = t.getElementsByTagName("body")[0], o = e.innerWidth || n.clientWidth || r.clientWidth, s = e.innerHeight || n.clientHeight || r.clientHeight;
  return { width: o, height: s };
}
function $e(e) {
  return e ? Math.abs(e.scrollLeft) : 0;
}
function vn() {
  let e = document.documentElement;
  return (window.pageXOffset || $e(e)) - (e.clientLeft || 0);
}
function bn() {
  let e = document.documentElement;
  return (window.pageYOffset || e.scrollTop) - (e.clientTop || 0);
}
function Sn(e) {
  return e ? getComputedStyle(e).direction === "rtl" : !1;
}
function $r(e, t, n = !0) {
  var r, o, s, i;
  if (e) {
    let l = e.offsetParent ? { width: e.offsetWidth, height: e.offsetHeight } : gt(e), a = l.height, u = l.width, d = t.offsetHeight, p = t.offsetWidth, c = t.getBoundingClientRect(), f = bn(), m = vn(), h = yt(), g, y, b = "top";
    c.top + d + a > h.height ? (g = c.top + f - a, b = "bottom", g < 0 && (g = f)) : g = d + c.top + f, c.left + u > h.width ? y = Math.max(0, c.left + m + p - u) : y = c.left + m, Sn(e) ? e.style.insetInlineEnd = y + "px" : e.style.insetInlineStart = y + "px", e.style.top = g + "px", e.style.transformOrigin = b, n && (e.style.marginTop = b === "bottom" ? `calc(${(o = (r = Oe(/-anchor-gutter$/)) == null ? void 0 : r.value) != null ? o : "2px"} * -1)` : (i = (s = Oe(/-anchor-gutter$/)) == null ? void 0 : s.value) != null ? i : "");
  }
}
function Cr(e, t) {
  e && (typeof t == "string" ? e.style.cssText = t : Object.entries(t || {}).forEach(([n, r]) => e.style[n] = r));
}
function Er(e, t) {
  return e instanceof HTMLElement ? e.offsetWidth : 0;
}
function Lr(e, t, n = !0, r = void 0) {
  var o;
  if (e) {
    let s = e.offsetParent ? { width: e.offsetWidth, height: e.offsetHeight } : gt(e), i = t.offsetHeight, l = t.getBoundingClientRect(), a = yt(), u, d, p = r ?? "top";
    if (!r && l.top + i + s.height > a.height ? (u = -1 * s.height, p = "bottom", l.top + u < 0 && (u = -1 * l.top)) : u = i, s.width > a.width ? d = l.left * -1 : l.left + s.width > a.width ? d = (l.left + s.width - a.width) * -1 : d = 0, e.style.top = u + "px", e.style.insetInlineStart = d + "px", e.style.transformOrigin = p, n) {
      let c = (o = Oe(/-anchor-gutter$/)) == null ? void 0 : o.value;
      e.style.marginTop = p === "bottom" ? `calc(${c ?? "2px"} * -1)` : c ?? "";
    }
  }
}
function vt(e) {
  if (e) {
    let t = e.parentNode;
    return t && t instanceof ShadowRoot && t.host && (t = t.host), t;
  }
  return null;
}
function wn(e) {
  return !!(e !== null && typeof e < "u" && e.nodeName && vt(e));
}
function oe(e) {
  return typeof Element < "u" ? e instanceof Element : e !== null && typeof e == "object" && e.nodeType === 1 && typeof e.nodeName == "string";
}
function ge(e, t = {}) {
  if (oe(e)) {
    let n = (r, o) => {
      var s, i;
      let l = (s = e?.$attrs) != null && s[r] ? [(i = e?.$attrs) == null ? void 0 : i[r]] : [];
      return [o].flat().reduce((a, u) => {
        if (u != null) {
          let d = typeof u;
          if (d === "string" || d === "number") a.push(u);
          else if (d === "object") {
            let p = Array.isArray(u) ? n(r, u) : Object.entries(u).map(([c, f]) => r === "style" && (f || f === 0) ? `${c.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase()}:${f}` : f ? c : void 0);
            a = p.length ? a.concat(p.filter((c) => !!c)) : a;
          }
        }
        return a;
      }, l);
    };
    Object.entries(t).forEach(([r, o]) => {
      if (o != null) {
        let s = r.match(/^on(.+)/);
        s ? e.addEventListener(s[1].toLowerCase(), o) : r === "p-bind" || r === "pBind" ? ge(e, o) : (o = r === "class" ? [...new Set(n("class", o))].join(" ").trim() : r === "style" ? n("style", o).join(";").trim() : o, (e.$attrs = e.$attrs || {}) && (e.$attrs[r] = o), e.setAttribute(r, o));
      }
    });
  }
}
function kr(e, t = {}, ...n) {
  {
    let r = document.createElement(e);
    return ge(r, t), r.append(...n), r;
  }
}
function xn(e, t) {
  return oe(e) ? Array.from(e.querySelectorAll(t)) : [];
}
function Tn(e, t) {
  return oe(e) ? e.matches(t) ? e : e.querySelector(t) : null;
}
function Ar(e, t) {
  e && document.activeElement !== e && e.focus(t);
}
function _r(e, t) {
  if (oe(e)) {
    let n = e.getAttribute(t);
    return isNaN(n) ? n === "true" || n === "false" ? n === "true" : n : +n;
  }
}
function bt(e, t = "") {
  let n = xn(e, `button:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t},
            [href]:not([tabindex = "-1"]):not([style*="display:none"]):not([hidden])${t},
            input:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t},
            select:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t},
            textarea:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t},
            [tabIndex]:not([tabIndex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t},
            [contenteditable]:not([tabIndex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t}`), r = [];
  for (let o of n) getComputedStyle(o).display != "none" && getComputedStyle(o).visibility != "hidden" && r.push(o);
  return r;
}
function Nr(e, t) {
  let n = bt(e, t);
  return n.length > 0 ? n[0] : null;
}
function Pr(e) {
  if (e) {
    let t = e.offsetHeight, n = getComputedStyle(e);
    return t -= parseFloat(n.paddingTop) + parseFloat(n.paddingBottom) + parseFloat(n.borderTopWidth) + parseFloat(n.borderBottomWidth), t;
  }
  return 0;
}
function jr(e, t) {
  let n = bt(e, t);
  return n.length > 0 ? n[n.length - 1] : null;
}
function Mr(e) {
  if (e) {
    let t = e.getBoundingClientRect();
    return { top: t.top + (window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0), left: t.left + (window.pageXOffset || $e(document.documentElement) || $e(document.body) || 0) };
  }
  return { top: "auto", left: "auto" };
}
function Rr(e, t) {
  return e ? e.offsetHeight : 0;
}
function St(e, t = []) {
  let n = vt(e);
  return n === null ? t : St(n, t.concat([n]));
}
function Dr(e) {
  let t = [];
  if (e) {
    let n = St(e), r = /(auto|scroll)/, o = (s) => {
      try {
        let i = window.getComputedStyle(s, null);
        return r.test(i.getPropertyValue("overflow")) || r.test(i.getPropertyValue("overflowX")) || r.test(i.getPropertyValue("overflowY"));
      } catch {
        return !1;
      }
    };
    for (let s of n) {
      let i = s.nodeType === 1 && s.dataset.scrollselectors;
      if (i) {
        let l = i.split(",");
        for (let a of l) {
          let u = Tn(s, a);
          u && o(u) && t.push(u);
        }
      }
      s.nodeType !== 9 && o(s) && t.push(s);
    }
  }
  return t;
}
function Ir(e) {
  if (e) {
    let t = e.offsetWidth, n = getComputedStyle(e);
    return t -= parseFloat(n.paddingLeft) + parseFloat(n.paddingRight) + parseFloat(n.borderLeftWidth) + parseFloat(n.borderRightWidth), t;
  }
  return 0;
}
function Hr() {
  return /(android)/i.test(navigator.userAgent);
}
function wt() {
  return !!(typeof window < "u" && window.document && window.document.createElement);
}
function Fr(e, t = "") {
  return oe(e) ? e.matches(`button:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t},
            [href][clientHeight][clientWidth]:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t},
            input:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t},
            select:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t},
            textarea:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t},
            [tabIndex]:not([tabIndex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t},
            [contenteditable]:not([tabIndex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t}`) : !1;
}
function Wr(e) {
  return !!(e && e.offsetParent != null);
}
function Br() {
  return "ontouchstart" in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;
}
function On(e, t = "", n) {
  oe(e) && n !== null && n !== void 0 && e.setAttribute(t, n);
}
var $n = Object.defineProperty, Cn = Object.defineProperties, En = Object.getOwnPropertyDescriptors, ye = Object.getOwnPropertySymbols, xt = Object.prototype.hasOwnProperty, Tt = Object.prototype.propertyIsEnumerable, Be = (e, t, n) => t in e ? $n(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n, $ = (e, t) => {
  for (var n in t || (t = {})) xt.call(t, n) && Be(e, n, t[n]);
  if (ye) for (var n of ye(t)) Tt.call(t, n) && Be(e, n, t[n]);
  return e;
}, Se = (e, t) => Cn(e, En(t)), P = (e, t) => {
  var n = {};
  for (var r in e) xt.call(e, r) && t.indexOf(r) < 0 && (n[r] = e[r]);
  if (e != null && ye) for (var r of ye(e)) t.indexOf(r) < 0 && Tt.call(e, r) && (n[r] = e[r]);
  return n;
}, Ln = ht(), j = Ln, se = /{([^}]*)}/g, Ot = /(\d+\s+[\+\-\*\/]\s+\d+)/g, $t = /var\([^)]+\)/g;
function Ve(e) {
  return F(e) ? e.replace(/[A-Z]/g, (t, n) => n === 0 ? t : "." + t.toLowerCase()).toLowerCase() : e;
}
function kn(e) {
  return H(e) && e.hasOwnProperty("$value") && e.hasOwnProperty("$type") ? e.$value : e;
}
function An(e) {
  return e.replaceAll(/ /g, "").replace(/[^\w]/g, "-");
}
function Ce(e = "", t = "") {
  return An(`${F(e, !1) && F(t, !1) ? `${e}-` : e}${t}`);
}
function Ct(e = "", t = "") {
  return `--${Ce(e, t)}`;
}
function _n(e = "") {
  let t = (e.match(/{/g) || []).length, n = (e.match(/}/g) || []).length;
  return (t + n) % 2 !== 0;
}
function Et(e, t = "", n = "", r = [], o) {
  if (F(e)) {
    let s = e.trim();
    if (_n(s)) return;
    if (Y(s, se)) {
      let i = s.replaceAll(se, (l) => {
        let a = l.replace(/{|}/g, "").split(".").filter((u) => !r.some((d) => Y(u, d)));
        return `var(${Ct(n, mt(a.join("-")))}${v(o) ? `, ${o}` : ""})`;
      });
      return Y(i.replace($t, "0"), Ot) ? `calc(${i})` : i;
    }
    return s;
  } else if (mn(e)) return e;
}
function Nn(e, t, n) {
  F(t, !1) && e.push(`${t}:${n};`);
}
function ee(e, t) {
  return e ? `${e}{${t}}` : "";
}
function Lt(e, t) {
  if (e.indexOf("dt(") === -1) return e;
  function n(i, l) {
    let a = [], u = 0, d = "", p = null, c = 0;
    for (; u <= i.length; ) {
      let f = i[u];
      if ((f === '"' || f === "'" || f === "`") && i[u - 1] !== "\\" && (p = p === f ? null : f), !p && (f === "(" && c++, f === ")" && c--, (f === "," || u === i.length) && c === 0)) {
        let m = d.trim();
        m.startsWith("dt(") ? a.push(Lt(m, l)) : a.push(r(m)), d = "", u++;
        continue;
      }
      f !== void 0 && (d += f), u++;
    }
    return a;
  }
  function r(i) {
    let l = i[0];
    if ((l === '"' || l === "'" || l === "`") && i[i.length - 1] === l) return i.slice(1, -1);
    let a = Number(i);
    return isNaN(a) ? i : a;
  }
  let o = [], s = [];
  for (let i = 0; i < e.length; i++) if (e[i] === "d" && e.slice(i, i + 3) === "dt(") s.push(i), i += 2;
  else if (e[i] === ")" && s.length > 0) {
    let l = s.pop();
    s.length === 0 && o.push([l, i]);
  }
  if (!o.length) return e;
  for (let i = o.length - 1; i >= 0; i--) {
    let [l, a] = o[i], u = e.slice(l + 3, a), d = n(u, t), p = t(...d);
    e = e.slice(0, l) + p + e.slice(a + 1);
  }
  return e;
}
var Vr = (e) => {
  var t;
  let n = S.getTheme(), r = Ee(n, e, void 0, "variable"), o = (t = r?.match(/--[\w-]+/g)) == null ? void 0 : t[0], s = Ee(n, e, void 0, "value");
  return { name: o, variable: r, value: s };
}, K = (...e) => Ee(S.getTheme(), ...e), Ee = (e = {}, t, n, r) => {
  if (t) {
    let { variable: o, options: s } = S.defaults || {}, { prefix: i, transform: l } = e?.options || s || {}, a = Y(t, se) ? t : `{${t}}`;
    return r === "value" || _e(r) && l === "strict" ? S.getTokenValue(t) : Et(a, void 0, i, [o.excludedKeyRegex], n);
  }
  return "";
};
function fe(e, ...t) {
  if (e instanceof Array) {
    let n = e.reduce((r, o, s) => {
      var i;
      return r + o + ((i = _(t[s], { dt: K })) != null ? i : "");
    }, "");
    return Lt(n, K);
  }
  return _(e, { dt: K });
}
function Pn(e, t = {}) {
  let n = S.defaults.variable, { prefix: r = n.prefix, selector: o = n.selector, excludedKeyRegex: s = n.excludedKeyRegex } = t, i = [], l = [], a = [{ node: e, path: r }];
  for (; a.length; ) {
    let { node: d, path: p } = a.pop();
    for (let c in d) {
      let f = d[c], m = kn(f), h = Y(c, s) ? Ce(p) : Ce(p, mt(c));
      if (H(m)) a.push({ node: m, path: h });
      else {
        let g = Ct(h), y = Et(m, h, r, [s]);
        Nn(l, g, y);
        let b = h;
        r && b.startsWith(r + "-") && (b = b.slice(r.length + 1)), i.push(b.replace(/-/g, "."));
      }
    }
  }
  let u = l.join("");
  return { value: l, tokens: i, declarations: u, css: ee(o, u) };
}
var O = { regex: { rules: { class: { pattern: /^\.([a-zA-Z][\w-]*)$/, resolve(e) {
  return { type: "class", selector: e, matched: this.pattern.test(e.trim()) };
} }, attr: { pattern: /^\[(.*)\]$/, resolve(e) {
  return { type: "attr", selector: `:root${e},:host${e}`, matched: this.pattern.test(e.trim()) };
} }, media: { pattern: /^@media (.*)$/, resolve(e) {
  return { type: "media", selector: e, matched: this.pattern.test(e.trim()) };
} }, system: { pattern: /^system$/, resolve(e) {
  return { type: "system", selector: "@media (prefers-color-scheme: dark)", matched: this.pattern.test(e.trim()) };
} }, custom: { resolve(e) {
  return { type: "custom", selector: e, matched: !0 };
} } }, resolve(e) {
  let t = Object.keys(this.rules).filter((n) => n !== "custom").map((n) => this.rules[n]);
  return [e].flat().map((n) => {
    var r;
    return (r = t.map((o) => o.resolve(n)).find((o) => o.matched)) != null ? r : this.rules.custom.resolve(n);
  });
} }, _toVariables(e, t) {
  return Pn(e, { prefix: t?.prefix });
}, getCommon({ name: e = "", theme: t = {}, params: n, set: r, defaults: o }) {
  var s, i, l, a, u, d, p;
  let { preset: c, options: f } = t, m, h, g, y, b, C, E;
  if (v(c) && f.transform !== "strict") {
    let { primitive: L, semantic: x, extend: k } = c, M = x || {}, { colorScheme: R } = M, W = P(M, ["colorScheme"]), D = k || {}, { colorScheme: B } = D, V = P(D, ["colorScheme"]), I = R || {}, { dark: z } = I, Q = P(I, ["dark"]), U = B || {}, { dark: G } = U, Z = P(U, ["dark"]), N = v(L) ? this._toVariables({ primitive: L }, f) : {}, A = v(W) ? this._toVariables({ semantic: W }, f) : {}, q = v(Q) ? this._toVariables({ light: Q }, f) : {}, ce = v(z) ? this._toVariables({ dark: z }, f) : {}, J = v(V) ? this._toVariables({ semantic: V }, f) : {}, je = v(Z) ? this._toVariables({ light: Z }, f) : {}, Me = v(G) ? this._toVariables({ dark: G }, f) : {}, [Nt, Pt] = [(s = N.declarations) != null ? s : "", N.tokens], [jt, Mt] = [(i = A.declarations) != null ? i : "", A.tokens || []], [Rt, Dt] = [(l = q.declarations) != null ? l : "", q.tokens || []], [It, Ht] = [(a = ce.declarations) != null ? a : "", ce.tokens || []], [Ft, Wt] = [(u = J.declarations) != null ? u : "", J.tokens || []], [Bt, Vt] = [(d = je.declarations) != null ? d : "", je.tokens || []], [zt, Ut] = [(p = Me.declarations) != null ? p : "", Me.tokens || []];
    m = this.transformCSS(e, Nt, "light", "variable", f, r, o), h = Pt;
    let qt = this.transformCSS(e, `${jt}${Rt}`, "light", "variable", f, r, o), Yt = this.transformCSS(e, `${It}`, "dark", "variable", f, r, o);
    g = `${qt}${Yt}`, y = [.../* @__PURE__ */ new Set([...Mt, ...Dt, ...Ht])];
    let Kt = this.transformCSS(e, `${Ft}${Bt}color-scheme:light`, "light", "variable", f, r, o), Qt = this.transformCSS(e, `${zt}color-scheme:dark`, "dark", "variable", f, r, o);
    b = `${Kt}${Qt}`, C = [.../* @__PURE__ */ new Set([...Wt, ...Vt, ...Ut])], E = _(c.css, { dt: K });
  }
  return { primitive: { css: m, tokens: h }, semantic: { css: g, tokens: y }, global: { css: b, tokens: C }, style: E };
}, getPreset({ name: e = "", preset: t = {}, options: n, params: r, set: o, defaults: s, selector: i }) {
  var l, a, u;
  let d, p, c;
  if (v(t) && n.transform !== "strict") {
    let f = e.replace("-directive", ""), m = t, { colorScheme: h, extend: g, css: y } = m, b = P(m, ["colorScheme", "extend", "css"]), C = g || {}, { colorScheme: E } = C, L = P(C, ["colorScheme"]), x = h || {}, { dark: k } = x, M = P(x, ["dark"]), R = E || {}, { dark: W } = R, D = P(R, ["dark"]), B = v(b) ? this._toVariables({ [f]: $($({}, b), L) }, n) : {}, V = v(M) ? this._toVariables({ [f]: $($({}, M), D) }, n) : {}, I = v(k) ? this._toVariables({ [f]: $($({}, k), W) }, n) : {}, [z, Q] = [(l = B.declarations) != null ? l : "", B.tokens || []], [U, G] = [(a = V.declarations) != null ? a : "", V.tokens || []], [Z, N] = [(u = I.declarations) != null ? u : "", I.tokens || []], A = this.transformCSS(f, `${z}${U}`, "light", "variable", n, o, s, i), q = this.transformCSS(f, Z, "dark", "variable", n, o, s, i);
    d = `${A}${q}`, p = [.../* @__PURE__ */ new Set([...Q, ...G, ...N])], c = _(y, { dt: K });
  }
  return { css: d, tokens: p, style: c };
}, getPresetC({ name: e = "", theme: t = {}, params: n, set: r, defaults: o }) {
  var s;
  let { preset: i, options: l } = t, a = (s = i?.components) == null ? void 0 : s[e];
  return this.getPreset({ name: e, preset: a, options: l, params: n, set: r, defaults: o });
}, getPresetD({ name: e = "", theme: t = {}, params: n, set: r, defaults: o }) {
  var s, i;
  let l = e.replace("-directive", ""), { preset: a, options: u } = t, d = ((s = a?.components) == null ? void 0 : s[l]) || ((i = a?.directives) == null ? void 0 : i[l]);
  return this.getPreset({ name: l, preset: d, options: u, params: n, set: r, defaults: o });
}, applyDarkColorScheme(e) {
  return !(e.darkModeSelector === "none" || e.darkModeSelector === !1);
}, getColorSchemeOption(e, t) {
  var n;
  return this.applyDarkColorScheme(e) ? this.regex.resolve(e.darkModeSelector === !0 ? t.options.darkModeSelector : (n = e.darkModeSelector) != null ? n : t.options.darkModeSelector) : [];
}, getLayerOrder(e, t = {}, n, r) {
  let { cssLayer: o } = t;
  return o ? `@layer ${_(o.order || o.name || "primeui", n)}` : "";
}, getCommonStyleSheet({ name: e = "", theme: t = {}, params: n, props: r = {}, set: o, defaults: s }) {
  let i = this.getCommon({ name: e, theme: t, params: n, set: o, defaults: s }), l = Object.entries(r).reduce((a, [u, d]) => a.push(`${u}="${d}"`) && a, []).join(" ");
  return Object.entries(i || {}).reduce((a, [u, d]) => {
    if (H(d) && Object.hasOwn(d, "css")) {
      let p = ie(d.css), c = `${u}-variables`;
      a.push(`<style type="text/css" data-primevue-style-id="${c}" ${l}>${p}</style>`);
    }
    return a;
  }, []).join("");
}, getStyleSheet({ name: e = "", theme: t = {}, params: n, props: r = {}, set: o, defaults: s }) {
  var i;
  let l = { name: e, theme: t, params: n, set: o, defaults: s }, a = (i = e.includes("-directive") ? this.getPresetD(l) : this.getPresetC(l)) == null ? void 0 : i.css, u = Object.entries(r).reduce((d, [p, c]) => d.push(`${p}="${c}"`) && d, []).join(" ");
  return a ? `<style type="text/css" data-primevue-style-id="${e}-variables" ${u}>${ie(a)}</style>` : "";
}, createTokens(e = {}, t, n = "", r = "", o = {}) {
  let s = function(l, a = {}, u = []) {
    if (u.includes(this.path)) return console.warn(`Circular reference detected at ${this.path}`), { colorScheme: l, path: this.path, paths: a, value: void 0 };
    u.push(this.path), a.name = this.path, a.binding || (a.binding = {});
    let d = this.value;
    if (typeof this.value == "string" && se.test(this.value)) {
      let p = this.value.trim().replace(se, (c) => {
        var f;
        let m = c.slice(1, -1), h = this.tokens[m];
        if (!h) return console.warn(`Token not found for path: ${m}`), "__UNRESOLVED__";
        let g = h.computed(l, a, u);
        return Array.isArray(g) && g.length === 2 ? `light-dark(${g[0].value},${g[1].value})` : (f = g?.value) != null ? f : "__UNRESOLVED__";
      });
      d = Ot.test(p.replace($t, "0")) ? `calc(${p})` : p;
    }
    return _e(a.binding) && delete a.binding, u.pop(), { colorScheme: l, path: this.path, paths: a, value: d.includes("__UNRESOLVED__") ? void 0 : d };
  }, i = (l, a, u) => {
    Object.entries(l).forEach(([d, p]) => {
      let c = Y(d, t.variable.excludedKeyRegex) ? a : a ? `${a}.${Ve(d)}` : Ve(d), f = u ? `${u}.${d}` : d;
      H(p) ? i(p, c, f) : (o[c] || (o[c] = { paths: [], computed: (m, h = {}, g = []) => {
        if (o[c].paths.length === 1) return o[c].paths[0].computed(o[c].paths[0].scheme, h.binding, g);
        if (m && m !== "none") for (let y = 0; y < o[c].paths.length; y++) {
          let b = o[c].paths[y];
          if (b.scheme === m) return b.computed(m, h.binding, g);
        }
        return o[c].paths.map((y) => y.computed(y.scheme, h[y.scheme], g));
      } }), o[c].paths.push({ path: f, value: p, scheme: f.includes("colorScheme.light") ? "light" : f.includes("colorScheme.dark") ? "dark" : "none", computed: s, tokens: o }));
    });
  };
  return i(e, n, r), o;
}, getTokenValue(e, t, n) {
  var r;
  let o = ((l) => l.split(".").filter((a) => !Y(a.toLowerCase(), n.variable.excludedKeyRegex)).join("."))(t), s = t.includes("colorScheme.light") ? "light" : t.includes("colorScheme.dark") ? "dark" : void 0, i = [(r = e[o]) == null ? void 0 : r.computed(s)].flat().filter((l) => l);
  return i.length === 1 ? i[0].value : i.reduce((l = {}, a) => {
    let u = a, { colorScheme: d } = u, p = P(u, ["colorScheme"]);
    return l[d] = p, l;
  }, void 0);
}, getSelectorRule(e, t, n, r) {
  return n === "class" || n === "attr" ? ee(v(t) ? `${e}${t},${e} ${t}` : e, r) : ee(e, ee(t ?? ":root,:host", r));
}, transformCSS(e, t, n, r, o = {}, s, i, l) {
  if (v(t)) {
    let { cssLayer: a } = o;
    if (r !== "style") {
      let u = this.getColorSchemeOption(o, i);
      t = n === "dark" ? u.reduce((d, { type: p, selector: c }) => (v(c) && (d += c.includes("[CSS]") ? c.replace("[CSS]", t) : this.getSelectorRule(c, l, p, t)), d), "") : ee(l ?? ":root,:host", t);
    }
    if (a) {
      let u = { name: "primeui" };
      H(a) && (u.name = _(a.name, { name: e, type: r })), v(u.name) && (t = ee(`@layer ${u.name}`, t), s?.layerNames(u.name));
    }
    return t;
  }
  return "";
} }, S = { defaults: { variable: { prefix: "p", selector: ":root,:host", excludedKeyRegex: /^(primitive|semantic|components|directives|variables|colorscheme|light|dark|common|root|states|extend|css)$/gi }, options: { prefix: "p", darkModeSelector: "system", cssLayer: !1 } }, _theme: void 0, _layerNames: /* @__PURE__ */ new Set(), _loadedStyleNames: /* @__PURE__ */ new Set(), _loadingStyles: /* @__PURE__ */ new Set(), _tokens: {}, update(e = {}) {
  let { theme: t } = e;
  t && (this._theme = Se($({}, t), { options: $($({}, this.defaults.options), t.options) }), this._tokens = O.createTokens(this.preset, this.defaults), this.clearLoadedStyleNames());
}, get theme() {
  return this._theme;
}, get preset() {
  var e;
  return ((e = this.theme) == null ? void 0 : e.preset) || {};
}, get options() {
  var e;
  return ((e = this.theme) == null ? void 0 : e.options) || {};
}, get tokens() {
  return this._tokens;
}, getTheme() {
  return this.theme;
}, setTheme(e) {
  this.update({ theme: e }), j.emit("theme:change", e);
}, getPreset() {
  return this.preset;
}, setPreset(e) {
  this._theme = Se($({}, this.theme), { preset: e }), this._tokens = O.createTokens(e, this.defaults), this.clearLoadedStyleNames(), j.emit("preset:change", e), j.emit("theme:change", this.theme);
}, getOptions() {
  return this.options;
}, setOptions(e) {
  this._theme = Se($({}, this.theme), { options: e }), this.clearLoadedStyleNames(), j.emit("options:change", e), j.emit("theme:change", this.theme);
}, getLayerNames() {
  return [...this._layerNames];
}, setLayerNames(e) {
  this._layerNames.add(e);
}, getLoadedStyleNames() {
  return this._loadedStyleNames;
}, isStyleNameLoaded(e) {
  return this._loadedStyleNames.has(e);
}, setLoadedStyleName(e) {
  this._loadedStyleNames.add(e);
}, deleteLoadedStyleName(e) {
  this._loadedStyleNames.delete(e);
}, clearLoadedStyleNames() {
  this._loadedStyleNames.clear();
}, getTokenValue(e) {
  return O.getTokenValue(this.tokens, e, this.defaults);
}, getCommon(e = "", t) {
  return O.getCommon({ name: e, theme: this.theme, params: t, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } });
}, getComponent(e = "", t) {
  let n = { name: e, theme: this.theme, params: t, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } };
  return O.getPresetC(n);
}, getDirective(e = "", t) {
  let n = { name: e, theme: this.theme, params: t, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } };
  return O.getPresetD(n);
}, getCustomPreset(e = "", t, n, r) {
  let o = { name: e, preset: t, options: this.options, selector: n, params: r, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } };
  return O.getPreset(o);
}, getLayerOrderCSS(e = "") {
  return O.getLayerOrder(e, this.options, { names: this.getLayerNames() }, this.defaults);
}, transformCSS(e = "", t, n = "style", r) {
  return O.transformCSS(e, t, r, n, this.options, { layerNames: this.setLayerNames.bind(this) }, this.defaults);
}, getCommonStyleSheet(e = "", t, n = {}) {
  return O.getCommonStyleSheet({ name: e, theme: this.theme, params: t, props: n, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } });
}, getStyleSheet(e, t, n = {}) {
  return O.getStyleSheet({ name: e, theme: this.theme, params: t, props: n, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } });
}, onStyleMounted(e) {
  this._loadingStyles.add(e);
}, onStyleUpdated(e) {
  this._loadingStyles.add(e);
}, onStyleLoaded(e, { name: t }) {
  this._loadingStyles.size && (this._loadingStyles.delete(t), j.emit(`theme:${t}:load`, e), !this._loadingStyles.size && j.emit("theme:load"));
} }, w = {
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
function ze(e, t) {
  var n = typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (!n) {
    if (Array.isArray(e) || (n = jn(e)) || t) {
      n && (e = n);
      var r = 0, o = function() {
      };
      return { s: o, n: function() {
        return r >= e.length ? { done: !0 } : { done: !1, value: e[r++] };
      }, e: function(u) {
        throw u;
      }, f: o };
    }
    throw new TypeError(`Invalid attempt to iterate non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
  }
  var s, i = !0, l = !1;
  return { s: function() {
    n = n.call(e);
  }, n: function() {
    var u = n.next();
    return i = u.done, u;
  }, e: function(u) {
    l = !0, s = u;
  }, f: function() {
    try {
      i || n.return == null || n.return();
    } finally {
      if (l) throw s;
    }
  } };
}
function jn(e, t) {
  if (e) {
    if (typeof e == "string") return Ue(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Ue(e, t) : void 0;
  }
}
function Ue(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
var zr = {
  filter: function(t, n, r, o, s) {
    var i = [];
    if (!t)
      return i;
    var l = ze(t), a;
    try {
      for (l.s(); !(a = l.n()).done; ) {
        var u = a.value;
        if (typeof u == "string") {
          if (this.filters[o](u, r, s)) {
            i.push(u);
            continue;
          }
        } else {
          var d = ze(n), p;
          try {
            for (d.s(); !(p = d.n()).done; ) {
              var c = p.value, f = Te(u, c);
              if (this.filters[o](f, r, s)) {
                i.push(u);
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
    return i;
  },
  filters: {
    startsWith: function(t, n, r) {
      if (n == null || n === "")
        return !0;
      if (t == null)
        return !1;
      var o = T(n.toString()).toLocaleLowerCase(r), s = T(t.toString()).toLocaleLowerCase(r);
      return s.slice(0, o.length) === o;
    },
    contains: function(t, n, r) {
      if (n == null || n === "")
        return !0;
      if (t == null)
        return !1;
      var o = T(n.toString()).toLocaleLowerCase(r), s = T(t.toString()).toLocaleLowerCase(r);
      return s.indexOf(o) !== -1;
    },
    notContains: function(t, n, r) {
      if (n == null || n === "")
        return !0;
      if (t == null)
        return !1;
      var o = T(n.toString()).toLocaleLowerCase(r), s = T(t.toString()).toLocaleLowerCase(r);
      return s.indexOf(o) === -1;
    },
    endsWith: function(t, n, r) {
      if (n == null || n === "")
        return !0;
      if (t == null)
        return !1;
      var o = T(n.toString()).toLocaleLowerCase(r), s = T(t.toString()).toLocaleLowerCase(r);
      return s.indexOf(o, s.length - o.length) !== -1;
    },
    equals: function(t, n, r) {
      return n == null || n === "" ? !0 : t == null ? !1 : t.getTime && n.getTime ? t.getTime() === n.getTime() : T(t.toString()).toLocaleLowerCase(r) == T(n.toString()).toLocaleLowerCase(r);
    },
    notEquals: function(t, n, r) {
      return n == null || n === "" ? !1 : t == null ? !0 : t.getTime && n.getTime ? t.getTime() !== n.getTime() : T(t.toString()).toLocaleLowerCase(r) != T(n.toString()).toLocaleLowerCase(r);
    },
    in: function(t, n) {
      if (n == null || n.length === 0)
        return !0;
      for (var r = 0; r < n.length; r++)
        if (cn(t, n[r]))
          return !0;
      return !1;
    },
    between: function(t, n) {
      return n == null || n[0] == null || n[1] == null ? !0 : t == null ? !1 : t.getTime ? n[0].getTime() <= t.getTime() && t.getTime() <= n[1].getTime() : n[0] <= t && t <= n[1];
    },
    lt: function(t, n) {
      return n == null ? !0 : t == null ? !1 : t.getTime && n.getTime ? t.getTime() < n.getTime() : t < n;
    },
    lte: function(t, n) {
      return n == null ? !0 : t == null ? !1 : t.getTime && n.getTime ? t.getTime() <= n.getTime() : t <= n;
    },
    gt: function(t, n) {
      return n == null ? !0 : t == null ? !1 : t.getTime && n.getTime ? t.getTime() > n.getTime() : t > n;
    },
    gte: function(t, n) {
      return n == null ? !0 : t == null ? !1 : t.getTime && n.getTime ? t.getTime() >= n.getTime() : t >= n;
    },
    dateIs: function(t, n) {
      return n == null ? !0 : t == null ? !1 : (typeof t == "string" && (t = new Date(t)), typeof n == "string" && (n = new Date(n)), t.toDateString() === n.toDateString());
    },
    dateIsNot: function(t, n) {
      return n == null ? !0 : t == null ? !1 : (typeof t == "string" && (t = new Date(t)), typeof n == "string" && (n = new Date(n)), t.toDateString() !== n.toDateString());
    },
    dateBefore: function(t, n) {
      return n == null ? !0 : t == null ? !1 : (typeof t == "string" && (t = new Date(t)), typeof n == "string" && (n = new Date(n)), t.getTime() < n.getTime());
    },
    dateAfter: function(t, n) {
      return n == null ? !0 : t == null ? !1 : (typeof t == "string" && (t = new Date(t)), typeof n == "string" && (n = new Date(n)), t.getTime() > n.getTime());
    }
  },
  register: function(t, n) {
    this.filters[t] = n;
  }
}, Mn = `
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
function le(e) {
  "@babel/helpers - typeof";
  return le = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, le(e);
}
function qe(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(e);
    t && (r = r.filter(function(o) {
      return Object.getOwnPropertyDescriptor(e, o).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function Ye(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? qe(Object(n), !0).forEach(function(r) {
      Rn(e, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : qe(Object(n)).forEach(function(r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return e;
}
function Rn(e, t, n) {
  return (t = Dn(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Dn(e) {
  var t = In(e, "string");
  return le(t) == "symbol" ? t : t + "";
}
function In(e, t) {
  if (le(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (le(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
function Hn(e) {
  var t = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0;
  Re() && Re().components ? Zt(e) : t ? e() : ut(e);
}
var Fn = 0;
function Wn(e) {
  var t = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, n = re(!1), r = re(e), o = re(null), s = wt() ? window.document : void 0, i = t.document, l = i === void 0 ? s : i, a = t.immediate, u = a === void 0 ? !0 : a, d = t.manual, p = d === void 0 ? !1 : d, c = t.name, f = c === void 0 ? "style_".concat(++Fn) : c, m = t.id, h = m === void 0 ? void 0 : m, g = t.media, y = g === void 0 ? void 0 : g, b = t.nonce, C = b === void 0 ? void 0 : b, E = t.first, L = E === void 0 ? !1 : E, x = t.onMounted, k = x === void 0 ? void 0 : x, M = t.onUpdated, R = M === void 0 ? void 0 : M, W = t.onLoad, D = W === void 0 ? void 0 : W, B = t.props, V = B === void 0 ? {} : B, I = function() {
  }, z = function(G) {
    var Z = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    if (l) {
      var N = Ye(Ye({}, V), Z), A = N.name || f, q = N.id || h, ce = N.nonce || C;
      o.value = l.querySelector('style[data-primevue-style-id="'.concat(A, '"]')) || l.getElementById(q) || l.createElement("style"), o.value.isConnected || (r.value = G || e, ge(o.value, {
        type: "text/css",
        id: q,
        media: y,
        nonce: ce
      }), L ? l.head.prepend(o.value) : l.head.appendChild(o.value), On(o.value, "data-primevue-style-id", A), ge(o.value, N), o.value.onload = function(J) {
        return D?.(J, {
          name: A
        });
      }, k?.(A)), !n.value && (I = te(r, function(J) {
        o.value.textContent = J, R?.(A);
      }, {
        immediate: !0
      }), n.value = !0);
    }
  }, Q = function() {
    !l || !n.value || (I(), wn(o.value) && l.head.removeChild(o.value), n.value = !1, o.value = null);
  };
  return u && !p && Hn(z), {
    id: h,
    name: f,
    el: o,
    css: r,
    unload: Q,
    load: z,
    isLoaded: Gt(n)
  };
}
function ue(e) {
  "@babel/helpers - typeof";
  return ue = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, ue(e);
}
var Ke, Qe, Ge, Ze;
function Je(e, t) {
  return Un(e) || zn(e, t) || Vn(e, t) || Bn();
}
function Bn() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Vn(e, t) {
  if (e) {
    if (typeof e == "string") return Xe(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Xe(e, t) : void 0;
  }
}
function Xe(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function zn(e, t) {
  var n = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (n != null) {
    var r, o, s, i, l = [], a = !0, u = !1;
    try {
      if (s = (n = n.call(e)).next, t !== 0) for (; !(a = (r = s.call(n)).done) && (l.push(r.value), l.length !== t); a = !0) ;
    } catch (d) {
      u = !0, o = d;
    } finally {
      try {
        if (!a && n.return != null && (i = n.return(), Object(i) !== i)) return;
      } finally {
        if (u) throw o;
      }
    }
    return l;
  }
}
function Un(e) {
  if (Array.isArray(e)) return e;
}
function et(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(e);
    t && (r = r.filter(function(o) {
      return Object.getOwnPropertyDescriptor(e, o).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function we(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? et(Object(n), !0).forEach(function(r) {
      qn(e, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : et(Object(n)).forEach(function(r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return e;
}
function qn(e, t, n) {
  return (t = Yn(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Yn(e) {
  var t = Kn(e, "string");
  return ue(t) == "symbol" ? t : t + "";
}
function Kn(e, t) {
  if (ue(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (ue(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
function pe(e, t) {
  return t || (t = e.slice(0)), Object.freeze(Object.defineProperties(e, { raw: { value: Object.freeze(t) } }));
}
var Qn = function(t) {
  var n = t.dt;
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
}, Gn = {}, Zn = {}, X = {
  name: "base",
  css: Qn,
  style: Mn,
  classes: Gn,
  inlineStyles: Zn,
  load: function(t) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, r = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : function(s) {
      return s;
    }, o = r(fe(Ke || (Ke = pe(["", ""])), t));
    return v(o) ? Wn(ie(o), we({
      name: this.name
    }, n)) : {};
  },
  loadCSS: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    return this.load(this.css, t);
  },
  loadStyle: function() {
    var t = this, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "";
    return this.load(this.style, n, function() {
      var o = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "";
      return S.transformCSS(n.name || t.name, "".concat(o).concat(fe(Qe || (Qe = pe(["", ""])), r)));
    });
  },
  getCommonTheme: function(t) {
    return S.getCommon(this.name, t);
  },
  getComponentTheme: function(t) {
    return S.getComponent(this.name, t);
  },
  getDirectiveTheme: function(t) {
    return S.getDirective(this.name, t);
  },
  getPresetTheme: function(t, n, r) {
    return S.getCustomPreset(this.name, t, n, r);
  },
  getLayerOrderThemeCSS: function() {
    return S.getLayerOrderCSS(this.name);
  },
  getStyleSheet: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    if (this.css) {
      var r = _(this.css, {
        dt: K
      }) || "", o = ie(fe(Ge || (Ge = pe(["", "", ""])), r, t)), s = Object.entries(n).reduce(function(i, l) {
        var a = Je(l, 2), u = a[0], d = a[1];
        return i.push("".concat(u, '="').concat(d, '"')) && i;
      }, []).join(" ");
      return v(o) ? '<style type="text/css" data-primevue-style-id="'.concat(this.name, '" ').concat(s, ">").concat(o, "</style>") : "";
    }
    return "";
  },
  getCommonThemeStyleSheet: function(t) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    return S.getCommonStyleSheet(this.name, t, n);
  },
  getThemeStyleSheet: function(t) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, r = [S.getStyleSheet(this.name, t, n)];
    if (this.style) {
      var o = this.name === "base" ? "global-style" : "".concat(this.name, "-style"), s = fe(Ze || (Ze = pe(["", ""])), _(this.style, {
        dt: K
      })), i = ie(S.transformCSS(o, s)), l = Object.entries(n).reduce(function(a, u) {
        var d = Je(u, 2), p = d[0], c = d[1];
        return a.push("".concat(p, '="').concat(c, '"')) && a;
      }, []).join(" ");
      v(i) && r.push('<style type="text/css" data-primevue-style-id="'.concat(o, '" ').concat(l, ">").concat(i, "</style>"));
    }
    return r.join("");
  },
  extend: function(t) {
    return we(we({}, this), {}, {
      css: void 0,
      style: void 0
    }, t);
  }
}, me = ht();
function de(e) {
  "@babel/helpers - typeof";
  return de = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, de(e);
}
function tt(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(e);
    t && (r = r.filter(function(o) {
      return Object.getOwnPropertyDescriptor(e, o).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function he(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? tt(Object(n), !0).forEach(function(r) {
      Jn(e, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : tt(Object(n)).forEach(function(r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return e;
}
function Jn(e, t, n) {
  return (t = Xn(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Xn(e) {
  var t = er(e, "string");
  return de(t) == "symbol" ? t : t + "";
}
function er(e, t) {
  if (de(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (de(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var tr = {
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
    text: [w.STARTS_WITH, w.CONTAINS, w.NOT_CONTAINS, w.ENDS_WITH, w.EQUALS, w.NOT_EQUALS],
    numeric: [w.EQUALS, w.NOT_EQUALS, w.LESS_THAN, w.LESS_THAN_OR_EQUAL_TO, w.GREATER_THAN, w.GREATER_THAN_OR_EQUAL_TO],
    date: [w.DATE_IS, w.DATE_IS_NOT, w.DATE_BEFORE, w.DATE_AFTER]
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
}, nr = Symbol();
function rr(e, t) {
  var n = {
    config: Jt(t)
  };
  return e.config.globalProperties.$primevue = n, e.provide(nr, n), or(), ir(e, n), n;
}
var ne = [];
function or() {
  j.clear(), ne.forEach(function(e) {
    return e?.();
  }), ne = [];
}
function ir(e, t) {
  var n = re(!1), r = function() {
    var u;
    if (((u = t.config) === null || u === void 0 ? void 0 : u.theme) !== "none" && !S.isStyleNameLoaded("common")) {
      var d, p, c = ((d = X.getCommonTheme) === null || d === void 0 ? void 0 : d.call(X)) || {}, f = c.primitive, m = c.semantic, h = c.global, g = c.style, y = {
        nonce: (p = t.config) === null || p === void 0 || (p = p.csp) === null || p === void 0 ? void 0 : p.nonce
      };
      X.load(f?.css, he({
        name: "primitive-variables"
      }, y)), X.load(m?.css, he({
        name: "semantic-variables"
      }, y)), X.load(h?.css, he({
        name: "global-variables"
      }, y)), X.loadStyle(he({
        name: "global-style"
      }, y), g), S.setLoadedStyleName("common");
    }
  };
  j.on("theme:change", function(a) {
    n.value || (e.config.globalProperties.$primevue.config.theme = a, n.value = !0);
  });
  var o = te(t.config, function(a, u) {
    me.emit("config:change", {
      newValue: a,
      oldValue: u
    });
  }, {
    immediate: !0,
    deep: !0
  }), s = te(function() {
    return t.config.ripple;
  }, function(a, u) {
    me.emit("config:ripple:change", {
      newValue: a,
      oldValue: u
    });
  }, {
    immediate: !0,
    deep: !0
  }), i = te(function() {
    return t.config.theme;
  }, function(a, u) {
    n.value || S.setTheme(a), t.config.unstyled || r(), n.value = !1, me.emit("config:theme:change", {
      newValue: a,
      oldValue: u
    });
  }, {
    immediate: !0,
    deep: !1
  }), l = te(function() {
    return t.config.unstyled;
  }, function(a, u) {
    !a && t.config.theme && r(), me.emit("config:unstyled:change", {
      newValue: a,
      oldValue: u
    });
  }, {
    immediate: !0,
    deep: !0
  });
  ne.push(o), ne.push(s), ne.push(i), ne.push(l);
}
var ar = {
  install: function(t, n) {
    var r = hn(tr, n);
    rr(t, r);
  }
}, kt = {
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
    this.mounted = wt();
  },
  computed: {
    inline: function() {
      return this.disabled || this.appendTo === "self";
    }
  }
};
function sr(e, t, n, r, o, s) {
  return s.inline ? ae(e.$slots, "default", {
    key: 0
  }) : o.mounted ? (dt(), Xt(ct, {
    key: 1,
    to: n.appendTo
  }, [ae(e.$slots, "default")], 8, ["to"])) : Ae("", !0);
}
kt.render = sr;
const lr = "data-wippy-overlay-layer";
function At() {
  return typeof window < "u" && typeof window.document < "u";
}
function _t() {
  return At() && typeof HTMLElement < "u" && Object.hasOwn(HTMLElement.prototype, "popover");
}
function ur() {
  return _t() && typeof CSS < "u" && typeof CSS.supports == "function" && CSS.supports("anchor-name: --a") && CSS.supports("position-area", "bottom span-right") && CSS.supports("position-try-fallbacks", "flip-block") && CSS.supports("min-width", "min(anchor-size(width), 100vw)") && CSS.supports("max-width", "stretch");
}
const dr = /\bp-(?:select|multiselect|treeselect|cascadeselect)-overlay\b/;
let cr = 0;
const ve = /* @__PURE__ */ new WeakMap();
function nt(e, t) {
  const n = e.style;
  n.setProperty("position", "fixed", "important"), n.setProperty("inset", "auto", "important"), n.setProperty("margin", "0", "important"), n.setProperty("position-anchor", t), n.setProperty("position-area", "bottom span-right"), n.setProperty("position-try-fallbacks", "flip-block, flip-inline, flip-block flip-inline"), n.setProperty("min-width", "min(anchor-size(width), 100vw)", "important"), n.setProperty("max-width", "stretch", "important");
}
function fr(e, t) {
  if (!dr.test(e.className))
    return;
  const n = e.style.cssText;
  nt(e, t), e.getAttribute("popover") !== "manual" && e.setAttribute("popover", "manual");
  try {
    e.matches(":popover-open") || e.showPopover();
  } catch {
  }
  if (!e.matches(":popover-open")) {
    e.removeAttribute("popover"), e.style.cssText = n;
    return;
  }
  if (!ve.has(e)) {
    const r = new MutationObserver(() => {
      const o = e.style;
      (o.top !== "auto" || o.left !== "auto" || o.margin !== "0px" || o.getPropertyPriority("top") !== "important" || o.getPropertyPriority("left") !== "important" || o.getPropertyPriority("margin") !== "important" || o.getPropertyPriority("min-width") !== "important" || o.maxWidth !== "stretch" || o.getPropertyPriority("max-width") !== "important") && nt(e, t);
    });
    r.observe(e, { attributes: !0, attributeFilter: ["style"] }), ve.set(e, r);
  }
}
function Ne(e) {
  const t = ve.get(e);
  t && (t.disconnect(), ve.delete(e));
}
function pr(e) {
  const t = e && typeof e.getRootNode == "function" ? e.getRootNode() : null;
  return t instanceof ShadowRoot ? t : null;
}
function Le(e) {
  e.style.top = "0px", e.style.left = "0px";
  const t = e.getBoundingClientRect();
  e.style.top = `${-window.scrollY - t.top}px`, e.style.left = `${-window.scrollX - t.left}px`;
}
const be = /* @__PURE__ */ new Set(), Pe = /* @__PURE__ */ new WeakMap();
let rt = !1, ke = !1;
function mr() {
  ke = !1;
  for (const e of be) {
    if (!e.isConnected) {
      for (const t of Array.from(e.children))
        t instanceof HTMLElement && Ne(t);
      be.delete(e), Pe.get(e)?.disconnect();
      continue;
    }
    e.childElementCount > 0 && Le(e);
  }
}
function ot() {
  ke || (ke = !0, requestAnimationFrame(mr));
}
function hr(e) {
  const t = document.createElement("div");
  t.setAttribute(lr, "");
  const n = _t();
  if (t.style.cssText = n ? "position:fixed;width:0 !important;height:0 !important;margin:0 !important;border:0 !important;padding:0 !important;background:transparent !important;color:inherit !important;overflow:visible !important;" : "position:fixed;top:0;left:0;width:0;height:0;", n && t.setAttribute("popover", "manual"), e.appendChild(t), n) {
    try {
      t.showPopover();
    } catch {
    }
    t.matches(":popover-open") || (t.removeAttribute("popover"), t.style.cssText = "position:fixed;top:0;left:0;width:0;height:0;");
  }
  Le(t);
  const r = new MutationObserver((o) => {
    const s = t.__wippyAnchorName;
    for (const i of o) {
      if (s)
        for (const l of Array.from(i.addedNodes))
          l instanceof HTMLElement && fr(l, s);
      for (const l of Array.from(i.removedNodes))
        l instanceof HTMLElement && Ne(l);
    }
    t.isConnected && t.childElementCount > 0 && Le(t);
  });
  return r.observe(t, { childList: !0 }), Pe.set(t, r), be.add(t), rt || (rt = !0, window.addEventListener("scroll", ot, { capture: !0, passive: !0 }), window.addEventListener("resize", ot, { passive: !0 })), t;
}
function it(e) {
  if (!(!e.hostRoot || e.layer) && (e.layer = hr(e.hostRoot), ur())) {
    const t = e.$el ? e.$el.parentElement : null;
    t && (e.anchorName = `--wippy-a-${++cr}`, e.anchorTrigger = t, t.style.setProperty("anchor-name", e.anchorName), e.layer.__wippyAnchorName = e.anchorName);
  }
}
function at(e) {
  if (e.anchorTrigger && (e.anchorTrigger.style.removeProperty("anchor-name"), e.anchorTrigger = null), e.anchorName = null, e.layer) {
    for (const t of Array.from(e.layer.children))
      t instanceof HTMLElement && Ne(t);
    be.delete(e.layer), Pe.get(e.layer)?.disconnect(), e.layer.remove(), e.layer = null;
  }
}
let st = !1;
function gr() {
  if (st)
    return;
  st = !0;
  const e = kt;
  e.computed = e.computed || {}, e.computed.inline = function() {
    return !!this.disabled || this.appendTo === "self";
  }, e.computed.resolvedTarget = function() {
    return this.appendTo == null || this.appendTo === "body" ? this.hostRoot ? this.layer : document.body : this.appendTo;
  }, e.data = function() {
    return { mounted: !1, hostRoot: null, layer: null, anchorName: null, anchorTrigger: null };
  }, e.mounted = function() {
    At() && (this.hostRoot = pr(this.$el), this.mounted = !0, this.hostRoot && (this.inline || it(this), this.$watch("inline", (t) => {
      t ? at(this) : it(this);
    })));
  }, e.render = function() {
    return this.inline ? ae(this.$slots, "default", { key: 0 }) : this.mounted ? en(ct, { key: 1, to: this.resolvedTarget || document.body }, [
      ae(this.$slots, "default")
    ]) : Ae("", !0);
  }, e.unmounted = function() {
    at(this);
  };
}
const Ur = {
  install: (e) => {
    gr(), e.use(ar, { theme: "none" });
  }
}, yr = 2e3;
function lt(e) {
  const t = e.margin ?? 8, n = e.gap ?? 4, r = Math.max(0, e.viewportWidth), o = Math.max(0, e.viewportHeight), s = Math.max(0, r - t * 2), i = Math.min(Math.max(0, e.requestedWidth), s), l = e.align === "right" ? e.anchor.right - i : e.anchor.left, a = Math.max(t, Math.min(l, r - t - i)), u = Math.max(0, o - e.anchor.bottom - n - t), d = Math.max(0, e.anchor.top - n - t), p = u < e.requestedMaxHeight && d > u ? "above" : "below", c = p === "above" ? d : u, f = Math.round(Math.min(Math.max(0, e.requestedMaxHeight), c)), m = Math.min(Math.max(0, e.panelHeight ?? f), f), h = p === "above" ? e.anchor.top - n - m : e.anchor.bottom + n, g = e.containingBlockOrigin ?? { left: 0, top: 0 };
  return {
    left: Math.round(a - g.left),
    width: Math.round(i),
    maxHeight: f,
    side: p,
    top: Math.round(h - g.top)
  };
}
const qr = /* @__PURE__ */ tn({
  __name: "AnchoredPanel",
  props: {
    open: { type: Boolean },
    anchor: {},
    align: { default: "left" },
    width: { default: "anchor" },
    minWidth: { default: 0 },
    maxHeight: { default: 340 },
    gap: { default: 4 },
    zIndex: { default: yr }
  },
  emits: ["update:open"],
  setup(e, { emit: t }) {
    const n = e, r = t, o = re(null), s = re({ position: "fixed", visibility: "hidden" });
    function i() {
      const h = n.anchor, g = o.value;
      if (!h || !g) return;
      const y = h.getBoundingClientRect(), b = n.width === "anchor" ? Math.max(n.minWidth, y.width) : Math.max(n.minWidth, n.width), C = {
        anchor: y,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
        requestedWidth: b,
        requestedMaxHeight: n.maxHeight,
        align: n.align,
        gap: n.gap
      }, E = lt(C);
      Object.assign(g.style, {
        position: "fixed",
        left: "0px",
        top: "0px",
        right: "auto",
        bottom: "auto",
        width: `${E.width}px`,
        maxHeight: `${E.maxHeight}px`,
        visibility: "hidden"
      });
      const L = g.getBoundingClientRect(), x = lt({
        ...C,
        containingBlockOrigin: { left: L.left, top: L.top },
        panelHeight: L.height
      }), k = {
        position: "fixed",
        left: `${x.left}px`,
        top: `${x.top}px`,
        width: `${x.width}px`,
        maxHeight: `${x.maxHeight}px`,
        "--anchored-panel-available-height": `${x.maxHeight}px`,
        margin: "0",
        zIndex: String(n.zIndex),
        visibility: "visible"
      };
      s.value = k;
    }
    let l = null, a = !1;
    function u() {
      a || !n.open || (a = !0, requestAnimationFrame(() => {
        a = !1, n.open && i();
      }));
    }
    function d() {
      typeof ResizeObserver > "u" || (l = new ResizeObserver(u), o.value && l.observe(o.value), n.anchor && l.observe(n.anchor));
    }
    function p() {
      l?.disconnect(), l = null, a = !1;
    }
    te(() => n.open, async (h) => {
      p(), h && (s.value = { position: "fixed", visibility: "hidden" }, await ut(), i(), d());
    }, { immediate: !0 });
    function c(h) {
      if (!n.open) return;
      const g = h.composedPath();
      o.value && g.includes(o.value) || n.anchor && g.includes(n.anchor) || r("update:open", !1);
    }
    function f(h) {
      n.open && h.key === "Escape" && r("update:open", !1);
    }
    function m() {
      n.open && i();
    }
    return document.addEventListener("click", c), document.addEventListener("keydown", f), window.addEventListener("resize", m), window.addEventListener("scroll", m, !0), nn(() => {
      p(), document.removeEventListener("click", c), document.removeEventListener("keydown", f), window.removeEventListener("resize", m), window.removeEventListener("scroll", m, !0);
    }), (h, g) => e.open ? (dt(), rn("div", {
      key: 0,
      ref_key: "panel",
      ref: o,
      class: "anchored-panel",
      style: on(s.value)
    }, [
      ae(h.$slots, "default")
    ], 4)) : Ae("", !0);
  }
});
export {
  Hr as $,
  Dr as A,
  X as B,
  Rr as C,
  cn as D,
  bt as E,
  pn as F,
  Lr as G,
  $r as H,
  Fr as I,
  wr as J,
  Mr as K,
  jr as L,
  br as M,
  j as N,
  Te as O,
  Ur as P,
  _r as Q,
  Ir as R,
  Cr as S,
  Pr as T,
  kr as U,
  Fe as W,
  Br as Y,
  On as _,
  Tr as a,
  Ar as b,
  kt as c,
  Or as d,
  Er as e,
  qr as f,
  F as g,
  yt as h,
  Sr as i,
  He as j,
  S as k,
  _e as l,
  _ as m,
  ft as n,
  oe as o,
  xr as p,
  H as q,
  Vr as r,
  v as s,
  me as t,
  We as u,
  Nr as v,
  ht as w,
  Wr as x,
  zr as y,
  Tn as z
};
//# sourceMappingURL=AnchoredPanel.vue_vue_type_style_index_0_lang-DNnuyvEa.js.map

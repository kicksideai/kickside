import { ref as Ce, readonly as Tr, getCurrentInstance as rt, onMounted as Or, nextTick as Pr, watch as pe, reactive as Cr, renderSlot as je, openBlock as Dt, createBlock as jr, Teleport as It, createCommentVNode as Mt, useId as Ar, mergeProps as de, h as Lr, createElementBlock as Er, createElementVNode as Nr } from "vue";
var Dr = Object.defineProperty, nt = Object.getOwnPropertySymbols, Ir = Object.prototype.hasOwnProperty, Mr = Object.prototype.propertyIsEnumerable, ot = (t, e, r) => e in t ? Dr(t, e, { enumerable: !0, configurable: !0, writable: !0, value: r }) : t[e] = r, Rr = (t, e) => {
  for (var r in e || (e = {})) Ir.call(e, r) && ot(t, r, e[r]);
  if (nt) for (var r of nt(e)) Mr.call(e, r) && ot(t, r, e[r]);
  return t;
};
function Se(t) {
  return t == null || t === "" || Array.isArray(t) && t.length === 0 || !(t instanceof Date) && typeof t == "object" && Object.keys(t).length === 0;
}
function Re(t, e, r = /* @__PURE__ */ new WeakSet()) {
  if (t === e) return !0;
  if (!t || !e || typeof t != "object" || typeof e != "object" || r.has(t) || r.has(e)) return !1;
  r.add(t).add(e);
  let n = Array.isArray(t), o = Array.isArray(e), i, l, s;
  if (n && o) {
    if (l = t.length, l != e.length) return !1;
    for (i = l; i-- !== 0; ) if (!Re(t[i], e[i], r)) return !1;
    return !0;
  }
  if (n != o) return !1;
  let a = t instanceof Date, c = e instanceof Date;
  if (a != c) return !1;
  if (a && c) return t.getTime() == e.getTime();
  let p = t instanceof RegExp, u = e instanceof RegExp;
  if (p != u) return !1;
  if (p && u) return t.toString() == e.toString();
  let d = Object.keys(t);
  if (l = d.length, l !== Object.keys(e).length) return !1;
  for (i = l; i-- !== 0; ) if (!Object.prototype.hasOwnProperty.call(e, d[i])) return !1;
  for (i = l; i-- !== 0; ) if (s = d[i], !Re(t[s], e[s], r)) return !1;
  return !0;
}
function zr(t, e) {
  return Re(t, e);
}
function De(t) {
  return typeof t == "function" && "call" in t && "apply" in t;
}
function T(t) {
  return !Se(t);
}
function ze(t, e) {
  if (!t || !e) return null;
  try {
    let r = t[e];
    if (T(r)) return r;
  } catch {
  }
  if (Object.keys(t).length) {
    if (De(e)) return e(t);
    if (e.indexOf(".") === -1) return t[e];
    {
      let r = e.split("."), n = t;
      for (let o = 0, i = r.length; o < i; ++o) {
        if (n == null) return null;
        n = n[r[o]];
      }
      return n;
    }
  }
  return null;
}
function Vr(t, e, r) {
  return r ? ze(t, r) === ze(e, r) : zr(t, e);
}
function z(t, e = !0) {
  return t instanceof Object && t.constructor === Object && (e || Object.keys(t).length !== 0);
}
function Rt(t = {}, e = {}) {
  let r = Rr({}, t);
  return Object.keys(e).forEach((n) => {
    let o = n;
    z(e[o]) && o in t && z(t[o]) ? r[o] = Rt(t[o], e[o]) : r[o] = e[o];
  }), r;
}
function Br(...t) {
  return t.reduce((e, r, n) => n === 0 ? r : Rt(e, r), {});
}
function Ro(t, e) {
  let r = -1;
  if (T(t)) try {
    r = t.findLastIndex(e);
  } catch {
    r = t.lastIndexOf([...t].reverse().find(e));
  }
  return r;
}
function L(t, ...e) {
  return De(t) ? t(...e) : t;
}
function A(t, e = !0) {
  return typeof t == "string" && (e || t !== "");
}
function R(t) {
  return A(t) ? t.replace(/(-|_)/g, "").toLowerCase() : t;
}
function Ze(t, e = "", r = {}) {
  let n = R(e).split("."), o = n.shift();
  if (o) {
    if (z(t)) {
      let i = Object.keys(t).find((l) => R(l) === o) || "";
      return Ze(L(t[i], r), n.join("."), r);
    }
    return;
  }
  return L(t, r);
}
function zt(t, e = !0) {
  return Array.isArray(t) && (e || t.length !== 0);
}
function Wr(t) {
  return T(t) && !isNaN(t);
}
function zo(t = "") {
  return T(t) && t.length === 1 && !!t.match(/\S| /);
}
function ee(t, e) {
  if (e) {
    let r = e.test(t);
    return e.lastIndex = 0, r;
  }
  return !1;
}
function Ur(...t) {
  return Br(...t);
}
function fe(t) {
  return t && t.replace(/\/\*(?:(?!\*\/)[\s\S])*\*\/|[\r\n\t]+/g, "").replace(/ {2,}/g, " ").replace(/ ([{:}]) /g, "$1").replace(/([;,]) /g, "$1").replace(/ !/g, "!").replace(/: /g, ":").trim();
}
function N(t) {
  if (t && /[\xC0-\xFF\u0100-\u017E]/.test(t)) {
    let e = { A: /[\xC0-\xC5\u0100\u0102\u0104]/g, AE: /[\xC6]/g, C: /[\xC7\u0106\u0108\u010A\u010C]/g, D: /[\xD0\u010E\u0110]/g, E: /[\xC8-\xCB\u0112\u0114\u0116\u0118\u011A]/g, G: /[\u011C\u011E\u0120\u0122]/g, H: /[\u0124\u0126]/g, I: /[\xCC-\xCF\u0128\u012A\u012C\u012E\u0130]/g, IJ: /[\u0132]/g, J: /[\u0134]/g, K: /[\u0136]/g, L: /[\u0139\u013B\u013D\u013F\u0141]/g, N: /[\xD1\u0143\u0145\u0147\u014A]/g, O: /[\xD2-\xD6\xD8\u014C\u014E\u0150]/g, OE: /[\u0152]/g, R: /[\u0154\u0156\u0158]/g, S: /[\u015A\u015C\u015E\u0160]/g, T: /[\u0162\u0164\u0166]/g, U: /[\xD9-\xDC\u0168\u016A\u016C\u016E\u0170\u0172]/g, W: /[\u0174]/g, Y: /[\xDD\u0176\u0178]/g, Z: /[\u0179\u017B\u017D]/g, a: /[\xE0-\xE5\u0101\u0103\u0105]/g, ae: /[\xE6]/g, c: /[\xE7\u0107\u0109\u010B\u010D]/g, d: /[\u010F\u0111]/g, e: /[\xE8-\xEB\u0113\u0115\u0117\u0119\u011B]/g, g: /[\u011D\u011F\u0121\u0123]/g, i: /[\xEC-\xEF\u0129\u012B\u012D\u012F\u0131]/g, ij: /[\u0133]/g, j: /[\u0135]/g, k: /[\u0137,\u0138]/g, l: /[\u013A\u013C\u013E\u0140\u0142]/g, n: /[\xF1\u0144\u0146\u0148\u014B]/g, p: /[\xFE]/g, o: /[\xF2-\xF6\xF8\u014D\u014F\u0151]/g, oe: /[\u0153]/g, r: /[\u0155\u0157\u0159]/g, s: /[\u015B\u015D\u015F\u0161]/g, t: /[\u0163\u0165\u0167]/g, u: /[\xF9-\xFC\u0169\u016B\u016D\u016F\u0171\u0173]/g, w: /[\u0175]/g, y: /[\xFD\xFF\u0177]/g, z: /[\u017A\u017C\u017E]/g };
    for (let r in e) t = t.replace(e[r], r);
  }
  return t;
}
function Fr(t) {
  return A(t, !1) ? t[0].toUpperCase() + t.slice(1) : t;
}
function Vt(t) {
  return A(t) ? t.replace(/(_)/g, "-").replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase() : t;
}
function Bt() {
  let t = /* @__PURE__ */ new Map();
  return { on(e, r) {
    let n = t.get(e);
    return n ? n.push(r) : n = [r], t.set(e, n), this;
  }, off(e, r) {
    let n = t.get(e);
    return n && n.splice(n.indexOf(r) >>> 0, 1), this;
  }, emit(e, r) {
    let n = t.get(e);
    n && n.forEach((o) => {
      o(r);
    });
  }, clear() {
    t.clear();
  } };
}
function Hr(...t) {
  if (t) {
    let e = [];
    for (let r = 0; r < t.length; r++) {
      let n = t[r];
      if (!n) continue;
      let o = typeof n;
      if (o === "string" || o === "number") e.push(n);
      else if (o === "object") {
        let i = Array.isArray(n) ? [Hr(...n)] : Object.entries(n).map(([l, s]) => s ? l : void 0);
        e = i.length ? e.concat(i.filter((l) => !!l)) : e;
      }
    }
    return e.join(" ").trim();
  }
}
function Kr(t, e) {
  return t ? t.classList ? t.classList.contains(e) : new RegExp("(^| )" + e + "( |$)", "gi").test(t.className) : !1;
}
function Ve(t, e) {
  if (t && e) {
    let r = (n) => {
      Kr(t, n) || (t.classList ? t.classList.add(n) : t.className += " " + n);
    };
    [e].flat().filter(Boolean).forEach((n) => n.split(" ").forEach(r));
  }
}
function Yr() {
  return window.innerWidth - document.documentElement.offsetWidth;
}
function Vo(t) {
  typeof t == "string" ? Ve(document.body, t || "p-overflow-hidden") : (t != null && t.variableName && document.body.style.setProperty(t.variableName, Yr() + "px"), Ve(document.body, t?.className || "p-overflow-hidden"));
}
function me(t, e) {
  if (t && e) {
    let r = (n) => {
      t.classList ? t.classList.remove(n) : t.className = t.className.replace(new RegExp("(^|\\b)" + n.split(" ").join("|") + "(\\b|$)", "gi"), " ");
    };
    [e].flat().filter(Boolean).forEach((n) => n.split(" ").forEach(r));
  }
}
function Bo(t) {
  typeof t == "string" ? me(document.body, t || "p-overflow-hidden") : (t != null && t.variableName && document.body.style.removeProperty(t.variableName), me(document.body, t?.className || "p-overflow-hidden"));
}
function Be(t) {
  for (let e of document?.styleSheets) try {
    for (let r of e?.cssRules) for (let n of r?.style) if (t.test(n)) return { name: n, value: r.style.getPropertyValue(n).trim() };
  } catch {
  }
  return null;
}
function Wt(t) {
  let e = { width: 0, height: 0 };
  if (t) {
    let [r, n] = [t.style.visibility, t.style.display], o = t.getBoundingClientRect();
    t.style.visibility = "hidden", t.style.display = "block", e.width = o.width || t.offsetWidth, e.height = o.height || t.offsetHeight, t.style.display = n, t.style.visibility = r;
  }
  return e;
}
function Ut() {
  let t = window, e = document, r = e.documentElement, n = e.getElementsByTagName("body")[0], o = t.innerWidth || r.clientWidth || n.clientWidth, i = t.innerHeight || r.clientHeight || n.clientHeight;
  return { width: o, height: i };
}
function We(t) {
  return t ? Math.abs(t.scrollLeft) : 0;
}
function qr() {
  let t = document.documentElement;
  return (window.pageXOffset || We(t)) - (t.clientLeft || 0);
}
function Gr() {
  let t = document.documentElement;
  return (window.pageYOffset || t.scrollTop) - (t.clientTop || 0);
}
function Qr(t) {
  return t ? getComputedStyle(t).direction === "rtl" : !1;
}
function Wo(t, e, r = !0) {
  var n, o, i, l;
  if (t) {
    let s = t.offsetParent ? { width: t.offsetWidth, height: t.offsetHeight } : Wt(t), a = s.height, c = s.width, p = e.offsetHeight, u = e.offsetWidth, d = e.getBoundingClientRect(), f = Gr(), m = qr(), v = Ut(), h, y, x = "top";
    d.top + p + a > v.height ? (h = d.top + f - a, x = "bottom", h < 0 && (h = f)) : h = p + d.top + f, d.left + c > v.width ? y = Math.max(0, d.left + m + u - c) : y = d.left + m, Qr(t) ? t.style.insetInlineEnd = y + "px" : t.style.insetInlineStart = y + "px", t.style.top = h + "px", t.style.transformOrigin = x, r && (t.style.marginTop = x === "bottom" ? `calc(${(o = (n = Be(/-anchor-gutter$/)) == null ? void 0 : n.value) != null ? o : "2px"} * -1)` : (l = (i = Be(/-anchor-gutter$/)) == null ? void 0 : i.value) != null ? l : "");
  }
}
function Uo(t, e) {
  t && (typeof e == "string" ? t.style.cssText = e : Object.entries(e || {}).forEach(([r, n]) => t.style[r] = n));
}
function Zr(t, e) {
  return t instanceof HTMLElement ? t.offsetWidth : 0;
}
function Fo(t, e, r = !0, n = void 0) {
  var o;
  if (t) {
    let i = t.offsetParent ? { width: t.offsetWidth, height: t.offsetHeight } : Wt(t), l = e.offsetHeight, s = e.getBoundingClientRect(), a = Ut(), c, p, u = n ?? "top";
    if (!n && s.top + l + i.height > a.height ? (c = -1 * i.height, u = "bottom", s.top + c < 0 && (c = -1 * s.top)) : c = l, i.width > a.width ? p = s.left * -1 : s.left + i.width > a.width ? p = (s.left + i.width - a.width) * -1 : p = 0, t.style.top = c + "px", t.style.insetInlineStart = p + "px", t.style.transformOrigin = u, r) {
      let d = (o = Be(/-anchor-gutter$/)) == null ? void 0 : o.value;
      t.style.marginTop = u === "bottom" ? `calc(${d ?? "2px"} * -1)` : d ?? "";
    }
  }
}
function Ft(t) {
  if (t) {
    let e = t.parentNode;
    return e && e instanceof ShadowRoot && e.host && (e = e.host), e;
  }
  return null;
}
function Jr(t) {
  return !!(t !== null && typeof t < "u" && t.nodeName && Ft(t));
}
function re(t) {
  return typeof Element < "u" ? t instanceof Element : t !== null && typeof t == "object" && t.nodeType === 1 && typeof t.nodeName == "string";
}
function Ae(t, e = {}) {
  if (re(t)) {
    let r = (n, o) => {
      var i, l;
      let s = (i = t?.$attrs) != null && i[n] ? [(l = t?.$attrs) == null ? void 0 : l[n]] : [];
      return [o].flat().reduce((a, c) => {
        if (c != null) {
          let p = typeof c;
          if (p === "string" || p === "number") a.push(c);
          else if (p === "object") {
            let u = Array.isArray(c) ? r(n, c) : Object.entries(c).map(([d, f]) => n === "style" && (f || f === 0) ? `${d.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase()}:${f}` : f ? d : void 0);
            a = u.length ? a.concat(u.filter((d) => !!d)) : a;
          }
        }
        return a;
      }, s);
    };
    Object.entries(e).forEach(([n, o]) => {
      if (o != null) {
        let i = n.match(/^on(.+)/);
        i ? t.addEventListener(i[1].toLowerCase(), o) : n === "p-bind" || n === "pBind" ? Ae(t, o) : (o = n === "class" ? [...new Set(r("class", o))].join(" ").trim() : n === "style" ? r("style", o).join(";").trim() : o, (t.$attrs = t.$attrs || {}) && (t.$attrs[n] = o), t.setAttribute(n, o));
      }
    });
  }
}
function Xr(t, e = {}, ...r) {
  {
    let n = document.createElement(t);
    return Ae(n, e), n.append(...r), n;
  }
}
function en(t, e) {
  return re(t) ? Array.from(t.querySelectorAll(e)) : [];
}
function Ht(t, e) {
  return re(t) ? t.matches(e) ? t : t.querySelector(e) : null;
}
function Ho(t, e) {
  t && document.activeElement !== t && t.focus(e);
}
function tn(t, e) {
  if (re(t)) {
    let r = t.getAttribute(e);
    return isNaN(r) ? r === "true" || r === "false" ? r === "true" : r : +r;
  }
}
function Kt(t, e = "") {
  let r = en(t, `button:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${e},
            [href]:not([tabindex = "-1"]):not([style*="display:none"]):not([hidden])${e},
            input:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${e},
            select:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${e},
            textarea:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${e},
            [tabIndex]:not([tabIndex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${e},
            [contenteditable]:not([tabIndex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${e}`), n = [];
  for (let o of r) getComputedStyle(o).display != "none" && getComputedStyle(o).visibility != "hidden" && n.push(o);
  return n;
}
function Ko(t, e) {
  let r = Kt(t, e);
  return r.length > 0 ? r[0] : null;
}
function at(t) {
  if (t) {
    let e = t.offsetHeight, r = getComputedStyle(t);
    return e -= parseFloat(r.paddingTop) + parseFloat(r.paddingBottom) + parseFloat(r.borderTopWidth) + parseFloat(r.borderBottomWidth), e;
  }
  return 0;
}
function Yo(t, e) {
  let r = Kt(t, e);
  return r.length > 0 ? r[r.length - 1] : null;
}
function rn(t) {
  if (t) {
    let e = t.getBoundingClientRect();
    return { top: e.top + (window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0), left: e.left + (window.pageXOffset || We(document.documentElement) || We(document.body) || 0) };
  }
  return { top: "auto", left: "auto" };
}
function nn(t, e) {
  return t ? t.offsetHeight : 0;
}
function Yt(t, e = []) {
  let r = Ft(t);
  return r === null ? e : Yt(r, e.concat([r]));
}
function qo(t) {
  let e = [];
  if (t) {
    let r = Yt(t), n = /(auto|scroll)/, o = (i) => {
      try {
        let l = window.getComputedStyle(i, null);
        return n.test(l.getPropertyValue("overflow")) || n.test(l.getPropertyValue("overflowX")) || n.test(l.getPropertyValue("overflowY"));
      } catch {
        return !1;
      }
    };
    for (let i of r) {
      let l = i.nodeType === 1 && i.dataset.scrollselectors;
      if (l) {
        let s = l.split(",");
        for (let a of s) {
          let c = Ht(i, a);
          c && o(c) && e.push(c);
        }
      }
      i.nodeType !== 9 && o(i) && e.push(i);
    }
  }
  return e;
}
function it(t) {
  if (t) {
    let e = t.offsetWidth, r = getComputedStyle(t);
    return e -= parseFloat(r.paddingLeft) + parseFloat(r.paddingRight) + parseFloat(r.borderLeftWidth) + parseFloat(r.borderRightWidth), e;
  }
  return 0;
}
function Go() {
  return /(android)/i.test(navigator.userAgent);
}
function qt() {
  return !!(typeof window < "u" && window.document && window.document.createElement);
}
function Qo(t, e = "") {
  return re(t) ? t.matches(`button:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${e},
            [href][clientHeight][clientWidth]:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${e},
            input:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${e},
            select:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${e},
            textarea:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${e},
            [tabIndex]:not([tabIndex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${e},
            [contenteditable]:not([tabIndex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${e}`) : !1;
}
function Zo(t) {
  return !!(t && t.offsetParent != null);
}
function Jo() {
  return "ontouchstart" in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;
}
function on(t, e = "", r) {
  re(t) && r !== null && r !== void 0 && t.setAttribute(e, r);
}
var _e = {};
function an(t = "pui_id_") {
  return Object.hasOwn(_e, t) || (_e[t] = 0), _e[t]++, `${t}${_e[t]}`;
}
var sn = Object.defineProperty, ln = Object.defineProperties, cn = Object.getOwnPropertyDescriptors, Le = Object.getOwnPropertySymbols, Gt = Object.prototype.hasOwnProperty, Qt = Object.prototype.propertyIsEnumerable, st = (t, e, r) => e in t ? sn(t, e, { enumerable: !0, configurable: !0, writable: !0, value: r }) : t[e] = r, I = (t, e) => {
  for (var r in e || (e = {})) Gt.call(e, r) && st(t, r, e[r]);
  if (Le) for (var r of Le(e)) Qt.call(e, r) && st(t, r, e[r]);
  return t;
}, Ie = (t, e) => ln(t, cn(e)), B = (t, e) => {
  var r = {};
  for (var n in t) Gt.call(t, n) && e.indexOf(n) < 0 && (r[n] = t[n]);
  if (t != null && Le) for (var n of Le(t)) e.indexOf(n) < 0 && Qt.call(t, n) && (r[n] = t[n]);
  return r;
}, pn = Bt(), C = pn, ge = /{([^}]*)}/g, Zt = /(\d+\s+[\+\-\*\/]\s+\d+)/g, Jt = /var\([^)]+\)/g;
function lt(t) {
  return A(t) ? t.replace(/[A-Z]/g, (e, r) => r === 0 ? e : "." + e.toLowerCase()).toLowerCase() : t;
}
function un(t) {
  return z(t) && t.hasOwnProperty("$value") && t.hasOwnProperty("$type") ? t.$value : t;
}
function dn(t) {
  return t.replaceAll(/ /g, "").replace(/[^\w]/g, "-");
}
function Ue(t = "", e = "") {
  return dn(`${A(t, !1) && A(e, !1) ? `${t}-` : t}${e}`);
}
function Xt(t = "", e = "") {
  return `--${Ue(t, e)}`;
}
function fn(t = "") {
  let e = (t.match(/{/g) || []).length, r = (t.match(/}/g) || []).length;
  return (e + r) % 2 !== 0;
}
function er(t, e = "", r = "", n = [], o) {
  if (A(t)) {
    let i = t.trim();
    if (fn(i)) return;
    if (ee(i, ge)) {
      let l = i.replaceAll(ge, (s) => {
        let a = s.replace(/{|}/g, "").split(".").filter((c) => !n.some((p) => ee(c, p)));
        return `var(${Xt(r, Vt(a.join("-")))}${T(o) ? `, ${o}` : ""})`;
      });
      return ee(l.replace(Jt, "0"), Zt) ? `calc(${l})` : l;
    }
    return i;
  } else if (Wr(t)) return t;
}
function mn(t, e, r) {
  A(e, !1) && t.push(`${e}:${r};`);
}
function se(t, e) {
  return t ? `${t}{${e}}` : "";
}
function tr(t, e) {
  if (t.indexOf("dt(") === -1) return t;
  function r(l, s) {
    let a = [], c = 0, p = "", u = null, d = 0;
    for (; c <= l.length; ) {
      let f = l[c];
      if ((f === '"' || f === "'" || f === "`") && l[c - 1] !== "\\" && (u = u === f ? null : f), !u && (f === "(" && d++, f === ")" && d--, (f === "," || c === l.length) && d === 0)) {
        let m = p.trim();
        m.startsWith("dt(") ? a.push(tr(m, s)) : a.push(n(m)), p = "", c++;
        continue;
      }
      f !== void 0 && (p += f), c++;
    }
    return a;
  }
  function n(l) {
    let s = l[0];
    if ((s === '"' || s === "'" || s === "`") && l[l.length - 1] === s) return l.slice(1, -1);
    let a = Number(l);
    return isNaN(a) ? l : a;
  }
  let o = [], i = [];
  for (let l = 0; l < t.length; l++) if (t[l] === "d" && t.slice(l, l + 3) === "dt(") i.push(l), l += 2;
  else if (t[l] === ")" && i.length > 0) {
    let s = i.pop();
    i.length === 0 && o.push([s, l]);
  }
  if (!o.length) return t;
  for (let l = o.length - 1; l >= 0; l--) {
    let [s, a] = o[l], c = t.slice(s + 3, a), p = r(c, e), u = e(...p);
    t = t.slice(0, s) + u + t.slice(a + 1);
  }
  return t;
}
var Xo = (t) => {
  var e;
  let r = $.getTheme(), n = Fe(r, t, void 0, "variable"), o = (e = n?.match(/--[\w-]+/g)) == null ? void 0 : e[0], i = Fe(r, t, void 0, "value");
  return { name: o, variable: n, value: i };
}, te = (...t) => Fe($.getTheme(), ...t), Fe = (t = {}, e, r, n) => {
  if (e) {
    let { variable: o, options: i } = $.defaults || {}, { prefix: l, transform: s } = t?.options || i || {}, a = ee(e, ge) ? e : `{${e}}`;
    return n === "value" || Se(n) && s === "strict" ? $.getTokenValue(e) : er(a, void 0, l, [o.excludedKeyRegex], r);
  }
  return "";
};
function Te(t, ...e) {
  if (t instanceof Array) {
    let r = t.reduce((n, o, i) => {
      var l;
      return n + o + ((l = L(e[i], { dt: te })) != null ? l : "");
    }, "");
    return tr(r, te);
  }
  return L(t, { dt: te });
}
function gn(t, e = {}) {
  let r = $.defaults.variable, { prefix: n = r.prefix, selector: o = r.selector, excludedKeyRegex: i = r.excludedKeyRegex } = e, l = [], s = [], a = [{ node: t, path: n }];
  for (; a.length; ) {
    let { node: p, path: u } = a.pop();
    for (let d in p) {
      let f = p[d], m = un(f), v = ee(d, i) ? Ue(u) : Ue(u, Vt(d));
      if (z(m)) a.push({ node: m, path: v });
      else {
        let h = Xt(v), y = er(m, v, n, [i]);
        mn(s, h, y);
        let x = v;
        n && x.startsWith(n + "-") && (x = x.slice(n.length + 1)), l.push(x.replace(/-/g, "."));
      }
    }
  }
  let c = s.join("");
  return { value: s, tokens: l, declarations: c, css: se(o, c) };
}
var D = { regex: { rules: { class: { pattern: /^\.([a-zA-Z][\w-]*)$/, resolve(t) {
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
  let e = Object.keys(this.rules).filter((r) => r !== "custom").map((r) => this.rules[r]);
  return [t].flat().map((r) => {
    var n;
    return (n = e.map((o) => o.resolve(r)).find((o) => o.matched)) != null ? n : this.rules.custom.resolve(r);
  });
} }, _toVariables(t, e) {
  return gn(t, { prefix: e?.prefix });
}, getCommon({ name: t = "", theme: e = {}, params: r, set: n, defaults: o }) {
  var i, l, s, a, c, p, u;
  let { preset: d, options: f } = e, m, v, h, y, x, _, g;
  if (T(d) && f.transform !== "strict") {
    let { primitive: w, semantic: P, extend: E } = d, W = P || {}, { colorScheme: U } = W, q = B(W, ["colorScheme"]), F = E || {}, { colorScheme: G } = F, Q = B(F, ["colorScheme"]), H = U || {}, { dark: Z } = H, ne = B(H, ["dark"]), J = G || {}, { dark: oe } = J, ae = B(J, ["dark"]), V = T(w) ? this._toVariables({ primitive: w }, f) : {}, M = T(q) ? this._toVariables({ semantic: q }, f) : {}, X = T(ne) ? this._toVariables({ light: ne }, f) : {}, $e = T(Z) ? this._toVariables({ dark: Z }, f) : {}, ie = T(Q) ? this._toVariables({ semantic: Q }, f) : {}, et = T(ae) ? this._toVariables({ light: ae }, f) : {}, tt = T(oe) ? this._toVariables({ dark: oe }, f) : {}, [lr, cr] = [(i = V.declarations) != null ? i : "", V.tokens], [pr, ur] = [(l = M.declarations) != null ? l : "", M.tokens || []], [dr, fr] = [(s = X.declarations) != null ? s : "", X.tokens || []], [mr, gr] = [(a = $e.declarations) != null ? a : "", $e.tokens || []], [hr, vr] = [(c = ie.declarations) != null ? c : "", ie.tokens || []], [yr, br] = [(p = et.declarations) != null ? p : "", et.tokens || []], [xr, wr] = [(u = tt.declarations) != null ? u : "", tt.tokens || []];
    m = this.transformCSS(t, lr, "light", "variable", f, n, o), v = cr;
    let kr = this.transformCSS(t, `${pr}${dr}`, "light", "variable", f, n, o), Sr = this.transformCSS(t, `${mr}`, "dark", "variable", f, n, o);
    h = `${kr}${Sr}`, y = [.../* @__PURE__ */ new Set([...ur, ...fr, ...gr])];
    let $r = this.transformCSS(t, `${hr}${yr}color-scheme:light`, "light", "variable", f, n, o), _r = this.transformCSS(t, `${xr}color-scheme:dark`, "dark", "variable", f, n, o);
    x = `${$r}${_r}`, _ = [.../* @__PURE__ */ new Set([...vr, ...br, ...wr])], g = L(d.css, { dt: te });
  }
  return { primitive: { css: m, tokens: v }, semantic: { css: h, tokens: y }, global: { css: x, tokens: _ }, style: g };
}, getPreset({ name: t = "", preset: e = {}, options: r, params: n, set: o, defaults: i, selector: l }) {
  var s, a, c;
  let p, u, d;
  if (T(e) && r.transform !== "strict") {
    let f = t.replace("-directive", ""), m = e, { colorScheme: v, extend: h, css: y } = m, x = B(m, ["colorScheme", "extend", "css"]), _ = h || {}, { colorScheme: g } = _, w = B(_, ["colorScheme"]), P = v || {}, { dark: E } = P, W = B(P, ["dark"]), U = g || {}, { dark: q } = U, F = B(U, ["dark"]), G = T(x) ? this._toVariables({ [f]: I(I({}, x), w) }, r) : {}, Q = T(W) ? this._toVariables({ [f]: I(I({}, W), F) }, r) : {}, H = T(E) ? this._toVariables({ [f]: I(I({}, E), q) }, r) : {}, [Z, ne] = [(s = G.declarations) != null ? s : "", G.tokens || []], [J, oe] = [(a = Q.declarations) != null ? a : "", Q.tokens || []], [ae, V] = [(c = H.declarations) != null ? c : "", H.tokens || []], M = this.transformCSS(f, `${Z}${J}`, "light", "variable", r, o, i, l), X = this.transformCSS(f, ae, "dark", "variable", r, o, i, l);
    p = `${M}${X}`, u = [.../* @__PURE__ */ new Set([...ne, ...oe, ...V])], d = L(y, { dt: te });
  }
  return { css: p, tokens: u, style: d };
}, getPresetC({ name: t = "", theme: e = {}, params: r, set: n, defaults: o }) {
  var i;
  let { preset: l, options: s } = e, a = (i = l?.components) == null ? void 0 : i[t];
  return this.getPreset({ name: t, preset: a, options: s, params: r, set: n, defaults: o });
}, getPresetD({ name: t = "", theme: e = {}, params: r, set: n, defaults: o }) {
  var i, l;
  let s = t.replace("-directive", ""), { preset: a, options: c } = e, p = ((i = a?.components) == null ? void 0 : i[s]) || ((l = a?.directives) == null ? void 0 : l[s]);
  return this.getPreset({ name: s, preset: p, options: c, params: r, set: n, defaults: o });
}, applyDarkColorScheme(t) {
  return !(t.darkModeSelector === "none" || t.darkModeSelector === !1);
}, getColorSchemeOption(t, e) {
  var r;
  return this.applyDarkColorScheme(t) ? this.regex.resolve(t.darkModeSelector === !0 ? e.options.darkModeSelector : (r = t.darkModeSelector) != null ? r : e.options.darkModeSelector) : [];
}, getLayerOrder(t, e = {}, r, n) {
  let { cssLayer: o } = e;
  return o ? `@layer ${L(o.order || o.name || "primeui", r)}` : "";
}, getCommonStyleSheet({ name: t = "", theme: e = {}, params: r, props: n = {}, set: o, defaults: i }) {
  let l = this.getCommon({ name: t, theme: e, params: r, set: o, defaults: i }), s = Object.entries(n).reduce((a, [c, p]) => a.push(`${c}="${p}"`) && a, []).join(" ");
  return Object.entries(l || {}).reduce((a, [c, p]) => {
    if (z(p) && Object.hasOwn(p, "css")) {
      let u = fe(p.css), d = `${c}-variables`;
      a.push(`<style type="text/css" data-primevue-style-id="${d}" ${s}>${u}</style>`);
    }
    return a;
  }, []).join("");
}, getStyleSheet({ name: t = "", theme: e = {}, params: r, props: n = {}, set: o, defaults: i }) {
  var l;
  let s = { name: t, theme: e, params: r, set: o, defaults: i }, a = (l = t.includes("-directive") ? this.getPresetD(s) : this.getPresetC(s)) == null ? void 0 : l.css, c = Object.entries(n).reduce((p, [u, d]) => p.push(`${u}="${d}"`) && p, []).join(" ");
  return a ? `<style type="text/css" data-primevue-style-id="${t}-variables" ${c}>${fe(a)}</style>` : "";
}, createTokens(t = {}, e, r = "", n = "", o = {}) {
  let i = function(s, a = {}, c = []) {
    if (c.includes(this.path)) return console.warn(`Circular reference detected at ${this.path}`), { colorScheme: s, path: this.path, paths: a, value: void 0 };
    c.push(this.path), a.name = this.path, a.binding || (a.binding = {});
    let p = this.value;
    if (typeof this.value == "string" && ge.test(this.value)) {
      let u = this.value.trim().replace(ge, (d) => {
        var f;
        let m = d.slice(1, -1), v = this.tokens[m];
        if (!v) return console.warn(`Token not found for path: ${m}`), "__UNRESOLVED__";
        let h = v.computed(s, a, c);
        return Array.isArray(h) && h.length === 2 ? `light-dark(${h[0].value},${h[1].value})` : (f = h?.value) != null ? f : "__UNRESOLVED__";
      });
      p = Zt.test(u.replace(Jt, "0")) ? `calc(${u})` : u;
    }
    return Se(a.binding) && delete a.binding, c.pop(), { colorScheme: s, path: this.path, paths: a, value: p.includes("__UNRESOLVED__") ? void 0 : p };
  }, l = (s, a, c) => {
    Object.entries(s).forEach(([p, u]) => {
      let d = ee(p, e.variable.excludedKeyRegex) ? a : a ? `${a}.${lt(p)}` : lt(p), f = c ? `${c}.${p}` : p;
      z(u) ? l(u, d, f) : (o[d] || (o[d] = { paths: [], computed: (m, v = {}, h = []) => {
        if (o[d].paths.length === 1) return o[d].paths[0].computed(o[d].paths[0].scheme, v.binding, h);
        if (m && m !== "none") for (let y = 0; y < o[d].paths.length; y++) {
          let x = o[d].paths[y];
          if (x.scheme === m) return x.computed(m, v.binding, h);
        }
        return o[d].paths.map((y) => y.computed(y.scheme, v[y.scheme], h));
      } }), o[d].paths.push({ path: f, value: u, scheme: f.includes("colorScheme.light") ? "light" : f.includes("colorScheme.dark") ? "dark" : "none", computed: i, tokens: o }));
    });
  };
  return l(t, r, n), o;
}, getTokenValue(t, e, r) {
  var n;
  let o = ((s) => s.split(".").filter((a) => !ee(a.toLowerCase(), r.variable.excludedKeyRegex)).join("."))(e), i = e.includes("colorScheme.light") ? "light" : e.includes("colorScheme.dark") ? "dark" : void 0, l = [(n = t[o]) == null ? void 0 : n.computed(i)].flat().filter((s) => s);
  return l.length === 1 ? l[0].value : l.reduce((s = {}, a) => {
    let c = a, { colorScheme: p } = c, u = B(c, ["colorScheme"]);
    return s[p] = u, s;
  }, void 0);
}, getSelectorRule(t, e, r, n) {
  return r === "class" || r === "attr" ? se(T(e) ? `${t}${e},${t} ${e}` : t, n) : se(t, se(e ?? ":root,:host", n));
}, transformCSS(t, e, r, n, o = {}, i, l, s) {
  if (T(e)) {
    let { cssLayer: a } = o;
    if (n !== "style") {
      let c = this.getColorSchemeOption(o, l);
      e = r === "dark" ? c.reduce((p, { type: u, selector: d }) => (T(d) && (p += d.includes("[CSS]") ? d.replace("[CSS]", e) : this.getSelectorRule(d, s, u, e)), p), "") : se(s ?? ":root,:host", e);
    }
    if (a) {
      let c = { name: "primeui" };
      z(a) && (c.name = L(a.name, { name: t, type: n })), T(c.name) && (e = se(`@layer ${c.name}`, e), i?.layerNames(c.name));
    }
    return e;
  }
  return "";
} }, $ = { defaults: { variable: { prefix: "p", selector: ":root,:host", excludedKeyRegex: /^(primitive|semantic|components|directives|variables|colorscheme|light|dark|common|root|states|extend|css)$/gi }, options: { prefix: "p", darkModeSelector: "system", cssLayer: !1 } }, _theme: void 0, _layerNames: /* @__PURE__ */ new Set(), _loadedStyleNames: /* @__PURE__ */ new Set(), _loadingStyles: /* @__PURE__ */ new Set(), _tokens: {}, update(t = {}) {
  let { theme: e } = t;
  e && (this._theme = Ie(I({}, e), { options: I(I({}, this.defaults.options), e.options) }), this._tokens = D.createTokens(this.preset, this.defaults), this.clearLoadedStyleNames());
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
  this.update({ theme: t }), C.emit("theme:change", t);
}, getPreset() {
  return this.preset;
}, setPreset(t) {
  this._theme = Ie(I({}, this.theme), { preset: t }), this._tokens = D.createTokens(t, this.defaults), this.clearLoadedStyleNames(), C.emit("preset:change", t), C.emit("theme:change", this.theme);
}, getOptions() {
  return this.options;
}, setOptions(t) {
  this._theme = Ie(I({}, this.theme), { options: t }), this.clearLoadedStyleNames(), C.emit("options:change", t), C.emit("theme:change", this.theme);
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
  return D.getTokenValue(this.tokens, t, this.defaults);
}, getCommon(t = "", e) {
  return D.getCommon({ name: t, theme: this.theme, params: e, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } });
}, getComponent(t = "", e) {
  let r = { name: t, theme: this.theme, params: e, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } };
  return D.getPresetC(r);
}, getDirective(t = "", e) {
  let r = { name: t, theme: this.theme, params: e, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } };
  return D.getPresetD(r);
}, getCustomPreset(t = "", e, r, n) {
  let o = { name: t, preset: e, options: this.options, selector: r, params: n, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } };
  return D.getPreset(o);
}, getLayerOrderCSS(t = "") {
  return D.getLayerOrder(t, this.options, { names: this.getLayerNames() }, this.defaults);
}, transformCSS(t = "", e, r = "style", n) {
  return D.transformCSS(t, e, n, r, this.options, { layerNames: this.setLayerNames.bind(this) }, this.defaults);
}, getCommonStyleSheet(t = "", e, r = {}) {
  return D.getCommonStyleSheet({ name: t, theme: this.theme, params: e, props: r, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } });
}, getStyleSheet(t, e, r = {}) {
  return D.getStyleSheet({ name: t, theme: this.theme, params: e, props: r, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } });
}, onStyleMounted(t) {
  this._loadingStyles.add(t);
}, onStyleUpdated(t) {
  this._loadingStyles.add(t);
}, onStyleLoaded(t, { name: e }) {
  this._loadingStyles.size && (this._loadingStyles.delete(e), C.emit(`theme:${e}:load`, t), !this._loadingStyles.size && C.emit("theme:load"));
} }, j = {
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
function ct(t, e) {
  var r = typeof Symbol < "u" && t[Symbol.iterator] || t["@@iterator"];
  if (!r) {
    if (Array.isArray(t) || (r = hn(t)) || e) {
      r && (t = r);
      var n = 0, o = function() {
      };
      return { s: o, n: function() {
        return n >= t.length ? { done: !0 } : { done: !1, value: t[n++] };
      }, e: function(c) {
        throw c;
      }, f: o };
    }
    throw new TypeError(`Invalid attempt to iterate non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
  }
  var i, l = !0, s = !1;
  return { s: function() {
    r = r.call(t);
  }, n: function() {
    var c = r.next();
    return l = c.done, c;
  }, e: function(c) {
    s = !0, i = c;
  }, f: function() {
    try {
      l || r.return == null || r.return();
    } finally {
      if (s) throw i;
    }
  } };
}
function hn(t, e) {
  if (t) {
    if (typeof t == "string") return pt(t, e);
    var r = {}.toString.call(t).slice(8, -1);
    return r === "Object" && t.constructor && (r = t.constructor.name), r === "Map" || r === "Set" ? Array.from(t) : r === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r) ? pt(t, e) : void 0;
  }
}
function pt(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var r = 0, n = Array(e); r < e; r++) n[r] = t[r];
  return n;
}
var ea = {
  filter: function(e, r, n, o, i) {
    var l = [];
    if (!e)
      return l;
    var s = ct(e), a;
    try {
      for (s.s(); !(a = s.n()).done; ) {
        var c = a.value;
        if (typeof c == "string") {
          if (this.filters[o](c, n, i)) {
            l.push(c);
            continue;
          }
        } else {
          var p = ct(r), u;
          try {
            for (p.s(); !(u = p.n()).done; ) {
              var d = u.value, f = ze(c, d);
              if (this.filters[o](f, n, i)) {
                l.push(c);
                break;
              }
            }
          } catch (m) {
            p.e(m);
          } finally {
            p.f();
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
    startsWith: function(e, r, n) {
      if (r == null || r === "")
        return !0;
      if (e == null)
        return !1;
      var o = N(r.toString()).toLocaleLowerCase(n), i = N(e.toString()).toLocaleLowerCase(n);
      return i.slice(0, o.length) === o;
    },
    contains: function(e, r, n) {
      if (r == null || r === "")
        return !0;
      if (e == null)
        return !1;
      var o = N(r.toString()).toLocaleLowerCase(n), i = N(e.toString()).toLocaleLowerCase(n);
      return i.indexOf(o) !== -1;
    },
    notContains: function(e, r, n) {
      if (r == null || r === "")
        return !0;
      if (e == null)
        return !1;
      var o = N(r.toString()).toLocaleLowerCase(n), i = N(e.toString()).toLocaleLowerCase(n);
      return i.indexOf(o) === -1;
    },
    endsWith: function(e, r, n) {
      if (r == null || r === "")
        return !0;
      if (e == null)
        return !1;
      var o = N(r.toString()).toLocaleLowerCase(n), i = N(e.toString()).toLocaleLowerCase(n);
      return i.indexOf(o, i.length - o.length) !== -1;
    },
    equals: function(e, r, n) {
      return r == null || r === "" ? !0 : e == null ? !1 : e.getTime && r.getTime ? e.getTime() === r.getTime() : N(e.toString()).toLocaleLowerCase(n) == N(r.toString()).toLocaleLowerCase(n);
    },
    notEquals: function(e, r, n) {
      return r == null || r === "" ? !1 : e == null ? !0 : e.getTime && r.getTime ? e.getTime() !== r.getTime() : N(e.toString()).toLocaleLowerCase(n) != N(r.toString()).toLocaleLowerCase(n);
    },
    in: function(e, r) {
      if (r == null || r.length === 0)
        return !0;
      for (var n = 0; n < r.length; n++)
        if (Vr(e, r[n]))
          return !0;
      return !1;
    },
    between: function(e, r) {
      return r == null || r[0] == null || r[1] == null ? !0 : e == null ? !1 : e.getTime ? r[0].getTime() <= e.getTime() && e.getTime() <= r[1].getTime() : r[0] <= e && e <= r[1];
    },
    lt: function(e, r) {
      return r == null ? !0 : e == null ? !1 : e.getTime && r.getTime ? e.getTime() < r.getTime() : e < r;
    },
    lte: function(e, r) {
      return r == null ? !0 : e == null ? !1 : e.getTime && r.getTime ? e.getTime() <= r.getTime() : e <= r;
    },
    gt: function(e, r) {
      return r == null ? !0 : e == null ? !1 : e.getTime && r.getTime ? e.getTime() > r.getTime() : e > r;
    },
    gte: function(e, r) {
      return r == null ? !0 : e == null ? !1 : e.getTime && r.getTime ? e.getTime() >= r.getTime() : e >= r;
    },
    dateIs: function(e, r) {
      return r == null ? !0 : e == null ? !1 : (typeof e == "string" && (e = new Date(e)), typeof r == "string" && (r = new Date(r)), e.toDateString() === r.toDateString());
    },
    dateIsNot: function(e, r) {
      return r == null ? !0 : e == null ? !1 : (typeof e == "string" && (e = new Date(e)), typeof r == "string" && (r = new Date(r)), e.toDateString() !== r.toDateString());
    },
    dateBefore: function(e, r) {
      return r == null ? !0 : e == null ? !1 : (typeof e == "string" && (e = new Date(e)), typeof r == "string" && (r = new Date(r)), e.getTime() < r.getTime());
    },
    dateAfter: function(e, r) {
      return r == null ? !0 : e == null ? !1 : (typeof e == "string" && (e = new Date(e)), typeof r == "string" && (r = new Date(r)), e.getTime() > r.getTime());
    }
  },
  register: function(e, r) {
    this.filters[e] = r;
  }
}, vn = `
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
function he(t) {
  "@babel/helpers - typeof";
  return he = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, he(t);
}
function ut(t, e) {
  var r = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var n = Object.getOwnPropertySymbols(t);
    e && (n = n.filter(function(o) {
      return Object.getOwnPropertyDescriptor(t, o).enumerable;
    })), r.push.apply(r, n);
  }
  return r;
}
function dt(t) {
  for (var e = 1; e < arguments.length; e++) {
    var r = arguments[e] != null ? arguments[e] : {};
    e % 2 ? ut(Object(r), !0).forEach(function(n) {
      yn(t, n, r[n]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(r)) : ut(Object(r)).forEach(function(n) {
      Object.defineProperty(t, n, Object.getOwnPropertyDescriptor(r, n));
    });
  }
  return t;
}
function yn(t, e, r) {
  return (e = bn(e)) in t ? Object.defineProperty(t, e, { value: r, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = r, t;
}
function bn(t) {
  var e = xn(t, "string");
  return he(e) == "symbol" ? e : e + "";
}
function xn(t, e) {
  if (he(t) != "object" || !t) return t;
  var r = t[Symbol.toPrimitive];
  if (r !== void 0) {
    var n = r.call(t, e);
    if (he(n) != "object") return n;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
function wn(t) {
  var e = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0;
  rt() && rt().components ? Or(t) : e ? t() : Pr(t);
}
var kn = 0;
function Sn(t) {
  var e = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, r = Ce(!1), n = Ce(t), o = Ce(null), i = qt() ? window.document : void 0, l = e.document, s = l === void 0 ? i : l, a = e.immediate, c = a === void 0 ? !0 : a, p = e.manual, u = p === void 0 ? !1 : p, d = e.name, f = d === void 0 ? "style_".concat(++kn) : d, m = e.id, v = m === void 0 ? void 0 : m, h = e.media, y = h === void 0 ? void 0 : h, x = e.nonce, _ = x === void 0 ? void 0 : x, g = e.first, w = g === void 0 ? !1 : g, P = e.onMounted, E = P === void 0 ? void 0 : P, W = e.onUpdated, U = W === void 0 ? void 0 : W, q = e.onLoad, F = q === void 0 ? void 0 : q, G = e.props, Q = G === void 0 ? {} : G, H = function() {
  }, Z = function(oe) {
    var ae = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    if (s) {
      var V = dt(dt({}, Q), ae), M = V.name || f, X = V.id || v, $e = V.nonce || _;
      o.value = s.querySelector('style[data-primevue-style-id="'.concat(M, '"]')) || s.getElementById(X) || s.createElement("style"), o.value.isConnected || (n.value = oe || t, Ae(o.value, {
        type: "text/css",
        id: X,
        media: y,
        nonce: $e
      }), w ? s.head.prepend(o.value) : s.head.appendChild(o.value), on(o.value, "data-primevue-style-id", M), Ae(o.value, V), o.value.onload = function(ie) {
        return F?.(ie, {
          name: M
        });
      }, E?.(M)), !r.value && (H = pe(n, function(ie) {
        o.value.textContent = ie, U?.(M);
      }, {
        immediate: !0
      }), r.value = !0);
    }
  }, ne = function() {
    !s || !r.value || (H(), Jr(o.value) && s.head.removeChild(o.value), r.value = !1, o.value = null);
  };
  return c && !u && wn(Z), {
    id: v,
    name: f,
    el: o,
    css: n,
    unload: ne,
    load: Z,
    isLoaded: Tr(r)
  };
}
function ve(t) {
  "@babel/helpers - typeof";
  return ve = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, ve(t);
}
var ft, mt, gt, ht;
function vt(t, e) {
  return On(t) || Tn(t, e) || _n(t, e) || $n();
}
function $n() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function _n(t, e) {
  if (t) {
    if (typeof t == "string") return yt(t, e);
    var r = {}.toString.call(t).slice(8, -1);
    return r === "Object" && t.constructor && (r = t.constructor.name), r === "Map" || r === "Set" ? Array.from(t) : r === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r) ? yt(t, e) : void 0;
  }
}
function yt(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var r = 0, n = Array(e); r < e; r++) n[r] = t[r];
  return n;
}
function Tn(t, e) {
  var r = t == null ? null : typeof Symbol < "u" && t[Symbol.iterator] || t["@@iterator"];
  if (r != null) {
    var n, o, i, l, s = [], a = !0, c = !1;
    try {
      if (i = (r = r.call(t)).next, e !== 0) for (; !(a = (n = i.call(r)).done) && (s.push(n.value), s.length !== e); a = !0) ;
    } catch (p) {
      c = !0, o = p;
    } finally {
      try {
        if (!a && r.return != null && (l = r.return(), Object(l) !== l)) return;
      } finally {
        if (c) throw o;
      }
    }
    return s;
  }
}
function On(t) {
  if (Array.isArray(t)) return t;
}
function bt(t, e) {
  var r = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var n = Object.getOwnPropertySymbols(t);
    e && (n = n.filter(function(o) {
      return Object.getOwnPropertyDescriptor(t, o).enumerable;
    })), r.push.apply(r, n);
  }
  return r;
}
function Me(t) {
  for (var e = 1; e < arguments.length; e++) {
    var r = arguments[e] != null ? arguments[e] : {};
    e % 2 ? bt(Object(r), !0).forEach(function(n) {
      Pn(t, n, r[n]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(r)) : bt(Object(r)).forEach(function(n) {
      Object.defineProperty(t, n, Object.getOwnPropertyDescriptor(r, n));
    });
  }
  return t;
}
function Pn(t, e, r) {
  return (e = Cn(e)) in t ? Object.defineProperty(t, e, { value: r, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = r, t;
}
function Cn(t) {
  var e = jn(t, "string");
  return ve(e) == "symbol" ? e : e + "";
}
function jn(t, e) {
  if (ve(t) != "object" || !t) return t;
  var r = t[Symbol.toPrimitive];
  if (r !== void 0) {
    var n = r.call(t, e);
    if (ve(n) != "object") return n;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
function Oe(t, e) {
  return e || (e = t.slice(0)), Object.freeze(Object.defineProperties(t, { raw: { value: Object.freeze(e) } }));
}
var An = function(e) {
  var r = e.dt;
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
    padding-right: `.concat(r("scrollbar.width"), `;
}
`);
}, Ln = {}, En = {}, O = {
  name: "base",
  css: An,
  style: vn,
  classes: Ln,
  inlineStyles: En,
  load: function(e) {
    var r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, n = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : function(i) {
      return i;
    }, o = n(Te(ft || (ft = Oe(["", ""])), e));
    return T(o) ? Sn(fe(o), Me({
      name: this.name
    }, r)) : {};
  },
  loadCSS: function() {
    var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    return this.load(this.css, e);
  },
  loadStyle: function() {
    var e = this, r = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "";
    return this.load(this.style, r, function() {
      var o = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "";
      return $.transformCSS(r.name || e.name, "".concat(o).concat(Te(mt || (mt = Oe(["", ""])), n)));
    });
  },
  getCommonTheme: function(e) {
    return $.getCommon(this.name, e);
  },
  getComponentTheme: function(e) {
    return $.getComponent(this.name, e);
  },
  getDirectiveTheme: function(e) {
    return $.getDirective(this.name, e);
  },
  getPresetTheme: function(e, r, n) {
    return $.getCustomPreset(this.name, e, r, n);
  },
  getLayerOrderThemeCSS: function() {
    return $.getLayerOrderCSS(this.name);
  },
  getStyleSheet: function() {
    var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    if (this.css) {
      var n = L(this.css, {
        dt: te
      }) || "", o = fe(Te(gt || (gt = Oe(["", "", ""])), n, e)), i = Object.entries(r).reduce(function(l, s) {
        var a = vt(s, 2), c = a[0], p = a[1];
        return l.push("".concat(c, '="').concat(p, '"')) && l;
      }, []).join(" ");
      return T(o) ? '<style type="text/css" data-primevue-style-id="'.concat(this.name, '" ').concat(i, ">").concat(o, "</style>") : "";
    }
    return "";
  },
  getCommonThemeStyleSheet: function(e) {
    var r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    return $.getCommonStyleSheet(this.name, e, r);
  },
  getThemeStyleSheet: function(e) {
    var r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, n = [$.getStyleSheet(this.name, e, r)];
    if (this.style) {
      var o = this.name === "base" ? "global-style" : "".concat(this.name, "-style"), i = Te(ht || (ht = Oe(["", ""])), L(this.style, {
        dt: te
      })), l = fe($.transformCSS(o, i)), s = Object.entries(r).reduce(function(a, c) {
        var p = vt(c, 2), u = p[0], d = p[1];
        return a.push("".concat(u, '="').concat(d, '"')) && a;
      }, []).join(" ");
      T(l) && n.push('<style type="text/css" data-primevue-style-id="'.concat(o, '" ').concat(s, ">").concat(l, "</style>"));
    }
    return n.join("");
  },
  extend: function(e) {
    return Me(Me({}, this), {}, {
      css: void 0,
      style: void 0
    }, e);
  }
}, Y = Bt();
function ye(t) {
  "@babel/helpers - typeof";
  return ye = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, ye(t);
}
function xt(t, e) {
  var r = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var n = Object.getOwnPropertySymbols(t);
    e && (n = n.filter(function(o) {
      return Object.getOwnPropertyDescriptor(t, o).enumerable;
    })), r.push.apply(r, n);
  }
  return r;
}
function Pe(t) {
  for (var e = 1; e < arguments.length; e++) {
    var r = arguments[e] != null ? arguments[e] : {};
    e % 2 ? xt(Object(r), !0).forEach(function(n) {
      Nn(t, n, r[n]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(r)) : xt(Object(r)).forEach(function(n) {
      Object.defineProperty(t, n, Object.getOwnPropertyDescriptor(r, n));
    });
  }
  return t;
}
function Nn(t, e, r) {
  return (e = Dn(e)) in t ? Object.defineProperty(t, e, { value: r, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = r, t;
}
function Dn(t) {
  var e = In(t, "string");
  return ye(e) == "symbol" ? e : e + "";
}
function In(t, e) {
  if (ye(t) != "object" || !t) return t;
  var r = t[Symbol.toPrimitive];
  if (r !== void 0) {
    var n = r.call(t, e);
    if (ye(n) != "object") return n;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var Mn = {
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
    text: [j.STARTS_WITH, j.CONTAINS, j.NOT_CONTAINS, j.ENDS_WITH, j.EQUALS, j.NOT_EQUALS],
    numeric: [j.EQUALS, j.NOT_EQUALS, j.LESS_THAN, j.LESS_THAN_OR_EQUAL_TO, j.GREATER_THAN, j.GREATER_THAN_OR_EQUAL_TO],
    date: [j.DATE_IS, j.DATE_IS_NOT, j.DATE_BEFORE, j.DATE_AFTER]
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
}, Rn = Symbol();
function zn(t, e) {
  var r = {
    config: Cr(e)
  };
  return t.config.globalProperties.$primevue = r, t.provide(Rn, r), Vn(), Bn(t, r), r;
}
var le = [];
function Vn() {
  C.clear(), le.forEach(function(t) {
    return t?.();
  }), le = [];
}
function Bn(t, e) {
  var r = Ce(!1), n = function() {
    var c;
    if (((c = e.config) === null || c === void 0 ? void 0 : c.theme) !== "none" && !$.isStyleNameLoaded("common")) {
      var p, u, d = ((p = O.getCommonTheme) === null || p === void 0 ? void 0 : p.call(O)) || {}, f = d.primitive, m = d.semantic, v = d.global, h = d.style, y = {
        nonce: (u = e.config) === null || u === void 0 || (u = u.csp) === null || u === void 0 ? void 0 : u.nonce
      };
      O.load(f?.css, Pe({
        name: "primitive-variables"
      }, y)), O.load(m?.css, Pe({
        name: "semantic-variables"
      }, y)), O.load(v?.css, Pe({
        name: "global-variables"
      }, y)), O.loadStyle(Pe({
        name: "global-style"
      }, y), h), $.setLoadedStyleName("common");
    }
  };
  C.on("theme:change", function(a) {
    r.value || (t.config.globalProperties.$primevue.config.theme = a, r.value = !0);
  });
  var o = pe(e.config, function(a, c) {
    Y.emit("config:change", {
      newValue: a,
      oldValue: c
    });
  }, {
    immediate: !0,
    deep: !0
  }), i = pe(function() {
    return e.config.ripple;
  }, function(a, c) {
    Y.emit("config:ripple:change", {
      newValue: a,
      oldValue: c
    });
  }, {
    immediate: !0,
    deep: !0
  }), l = pe(function() {
    return e.config.theme;
  }, function(a, c) {
    r.value || $.setTheme(a), e.config.unstyled || n(), r.value = !1, Y.emit("config:theme:change", {
      newValue: a,
      oldValue: c
    });
  }, {
    immediate: !0,
    deep: !1
  }), s = pe(function() {
    return e.config.unstyled;
  }, function(a, c) {
    !a && e.config.theme && n(), Y.emit("config:unstyled:change", {
      newValue: a,
      oldValue: c
    });
  }, {
    immediate: !0,
    deep: !0
  });
  le.push(o), le.push(i), le.push(l), le.push(s);
}
var Wn = {
  install: function(e, r) {
    var n = Ur(Mn, r);
    zn(e, n);
  }
}, rr = {
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
    this.mounted = qt();
  },
  computed: {
    inline: function() {
      return this.disabled || this.appendTo === "self";
    }
  }
};
function Un(t, e, r, n, o, i) {
  return i.inline ? je(t.$slots, "default", {
    key: 0
  }) : o.mounted ? (Dt(), jr(It, {
    key: 1,
    to: r.appendTo
  }, [je(t.$slots, "default")], 8, ["to"])) : Mt("", !0);
}
rr.render = Un;
var K = {
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
function Fn() {
  var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "pc", e = Ar();
  return "".concat(t).concat(e.replace("v-", "").replaceAll("-", "_"));
}
var wt = O.extend({
  name: "common"
});
function be(t) {
  "@babel/helpers - typeof";
  return be = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, be(t);
}
function Hn(t) {
  return ar(t) || Kn(t) || or(t) || nr();
}
function Kn(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function ce(t, e) {
  return ar(t) || Yn(t, e) || or(t, e) || nr();
}
function nr() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function or(t, e) {
  if (t) {
    if (typeof t == "string") return He(t, e);
    var r = {}.toString.call(t).slice(8, -1);
    return r === "Object" && t.constructor && (r = t.constructor.name), r === "Map" || r === "Set" ? Array.from(t) : r === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r) ? He(t, e) : void 0;
  }
}
function He(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var r = 0, n = Array(e); r < e; r++) n[r] = t[r];
  return n;
}
function Yn(t, e) {
  var r = t == null ? null : typeof Symbol < "u" && t[Symbol.iterator] || t["@@iterator"];
  if (r != null) {
    var n, o, i, l, s = [], a = !0, c = !1;
    try {
      if (i = (r = r.call(t)).next, e === 0) {
        if (Object(r) !== r) return;
        a = !1;
      } else for (; !(a = (n = i.call(r)).done) && (s.push(n.value), s.length !== e); a = !0) ;
    } catch (p) {
      c = !0, o = p;
    } finally {
      try {
        if (!a && r.return != null && (l = r.return(), Object(l) !== l)) return;
      } finally {
        if (c) throw o;
      }
    }
    return s;
  }
}
function ar(t) {
  if (Array.isArray(t)) return t;
}
function kt(t, e) {
  var r = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var n = Object.getOwnPropertySymbols(t);
    e && (n = n.filter(function(o) {
      return Object.getOwnPropertyDescriptor(t, o).enumerable;
    })), r.push.apply(r, n);
  }
  return r;
}
function k(t) {
  for (var e = 1; e < arguments.length; e++) {
    var r = arguments[e] != null ? arguments[e] : {};
    e % 2 ? kt(Object(r), !0).forEach(function(n) {
      ue(t, n, r[n]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(r)) : kt(Object(r)).forEach(function(n) {
      Object.defineProperty(t, n, Object.getOwnPropertyDescriptor(r, n));
    });
  }
  return t;
}
function ue(t, e, r) {
  return (e = qn(e)) in t ? Object.defineProperty(t, e, { value: r, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = r, t;
}
function qn(t) {
  var e = Gn(t, "string");
  return be(e) == "symbol" ? e : e + "";
}
function Gn(t, e) {
  if (be(t) != "object" || !t) return t;
  var r = t[Symbol.toPrimitive];
  if (r !== void 0) {
    var n = r.call(t, e);
    if (be(n) != "object") return n;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var Qn = {
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
        C.off("theme:change", this._loadCoreStyles), e || (this._loadCoreStyles(), this._themeChangeListener(this._loadCoreStyles));
      }
    },
    dt: {
      immediate: !0,
      handler: function(e, r) {
        var n = this;
        C.off("theme:change", this._themeScopedListener), e ? (this._loadScopedThemeStyles(e), this._themeScopedListener = function() {
          return n._loadScopedThemeStyles(e);
        }, this._themeChangeListener(this._themeScopedListener)) : this._unloadScopedThemeStyles();
      }
    }
  },
  scopedStyleEl: void 0,
  rootEl: void 0,
  uid: void 0,
  $attrSelector: void 0,
  beforeCreate: function() {
    var e, r, n, o, i, l, s, a, c, p, u, d = (e = this.pt) === null || e === void 0 ? void 0 : e._usept, f = d ? (r = this.pt) === null || r === void 0 || (r = r.originalValue) === null || r === void 0 ? void 0 : r[this.$.type.name] : void 0, m = d ? (n = this.pt) === null || n === void 0 || (n = n.value) === null || n === void 0 ? void 0 : n[this.$.type.name] : this.pt;
    (o = m || f) === null || o === void 0 || (o = o.hooks) === null || o === void 0 || (i = o.onBeforeCreate) === null || i === void 0 || i.call(o);
    var v = (l = this.$primevueConfig) === null || l === void 0 || (l = l.pt) === null || l === void 0 ? void 0 : l._usept, h = v ? (s = this.$primevue) === null || s === void 0 || (s = s.config) === null || s === void 0 || (s = s.pt) === null || s === void 0 ? void 0 : s.originalValue : void 0, y = v ? (a = this.$primevue) === null || a === void 0 || (a = a.config) === null || a === void 0 || (a = a.pt) === null || a === void 0 ? void 0 : a.value : (c = this.$primevue) === null || c === void 0 || (c = c.config) === null || c === void 0 ? void 0 : c.pt;
    (p = y || h) === null || p === void 0 || (p = p[this.$.type.name]) === null || p === void 0 || (p = p.hooks) === null || p === void 0 || (u = p.onBeforeCreate) === null || u === void 0 || u.call(p), this.$attrSelector = Fn(), this.uid = this.$attrs.id || this.$attrSelector.replace("pc", "pv_id_");
  },
  created: function() {
    this._hook("onCreated");
  },
  beforeMount: function() {
    var e;
    this.rootEl = Ht(re(this.$el) ? this.$el : (e = this.$el) === null || e === void 0 ? void 0 : e.parentElement, "[".concat(this.$attrSelector, "]")), this.rootEl && (this.rootEl.$pc = k({
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
        var r = this._usePT(this._getPT(this.pt, this.$.type.name), this._getOptionValue, "hooks.".concat(e)), n = this._useDefaultPT(this._getOptionValue, "hooks.".concat(e));
        r?.(), n?.();
      }
    },
    _mergeProps: function(e) {
      for (var r = arguments.length, n = new Array(r > 1 ? r - 1 : 0), o = 1; o < r; o++)
        n[o - 1] = arguments[o];
      return De(e) ? e.apply(void 0, n) : de.apply(void 0, n);
    },
    _load: function() {
      K.isStyleNameLoaded("base") || (O.loadCSS(this.$styleOptions), this._loadGlobalStyles(), K.setLoadedStyleName("base")), this._loadThemeStyles();
    },
    _loadStyles: function() {
      this._load(), this._themeChangeListener(this._load);
    },
    _loadCoreStyles: function() {
      var e, r;
      !K.isStyleNameLoaded((e = this.$style) === null || e === void 0 ? void 0 : e.name) && (r = this.$style) !== null && r !== void 0 && r.name && (wt.loadCSS(this.$styleOptions), this.$options.style && this.$style.loadCSS(this.$styleOptions), K.setLoadedStyleName(this.$style.name));
    },
    _loadGlobalStyles: function() {
      var e = this._useGlobalPT(this._getOptionValue, "global.css", this.$params);
      T(e) && O.load(e, k({
        name: "global"
      }, this.$styleOptions));
    },
    _loadThemeStyles: function() {
      var e, r;
      if (!(this.isUnstyled || this.$theme === "none")) {
        if (!$.isStyleNameLoaded("common")) {
          var n, o, i = ((n = this.$style) === null || n === void 0 || (o = n.getCommonTheme) === null || o === void 0 ? void 0 : o.call(n)) || {}, l = i.primitive, s = i.semantic, a = i.global, c = i.style;
          O.load(l?.css, k({
            name: "primitive-variables"
          }, this.$styleOptions)), O.load(s?.css, k({
            name: "semantic-variables"
          }, this.$styleOptions)), O.load(a?.css, k({
            name: "global-variables"
          }, this.$styleOptions)), O.loadStyle(k({
            name: "global-style"
          }, this.$styleOptions), c), $.setLoadedStyleName("common");
        }
        if (!$.isStyleNameLoaded((e = this.$style) === null || e === void 0 ? void 0 : e.name) && (r = this.$style) !== null && r !== void 0 && r.name) {
          var p, u, d, f, m = ((p = this.$style) === null || p === void 0 || (u = p.getComponentTheme) === null || u === void 0 ? void 0 : u.call(p)) || {}, v = m.css, h = m.style;
          (d = this.$style) === null || d === void 0 || d.load(v, k({
            name: "".concat(this.$style.name, "-variables")
          }, this.$styleOptions)), (f = this.$style) === null || f === void 0 || f.loadStyle(k({
            name: "".concat(this.$style.name, "-style")
          }, this.$styleOptions), h), $.setLoadedStyleName(this.$style.name);
        }
        if (!$.isStyleNameLoaded("layer-order")) {
          var y, x, _ = (y = this.$style) === null || y === void 0 || (x = y.getLayerOrderThemeCSS) === null || x === void 0 ? void 0 : x.call(y);
          O.load(_, k({
            name: "layer-order",
            first: !0
          }, this.$styleOptions)), $.setLoadedStyleName("layer-order");
        }
      }
    },
    _loadScopedThemeStyles: function(e) {
      var r, n, o, i = ((r = this.$style) === null || r === void 0 || (n = r.getPresetTheme) === null || n === void 0 ? void 0 : n.call(r, e, "[".concat(this.$attrSelector, "]"))) || {}, l = i.css, s = (o = this.$style) === null || o === void 0 ? void 0 : o.load(l, k({
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
      K.clearLoadedStyleNames(), C.on("theme:change", e);
    },
    _removeThemeListeners: function() {
      C.off("theme:change", this._loadCoreStyles), C.off("theme:change", this._load), C.off("theme:change", this._themeScopedListener);
    },
    _getHostInstance: function(e) {
      return e ? this.$options.hostName ? e.$.type.name === this.$options.hostName ? e : this._getHostInstance(e.$parentInstance) : e.$parentInstance : void 0;
    },
    _getPropValue: function(e) {
      var r;
      return this[e] || ((r = this._getHostInstance(this)) === null || r === void 0 ? void 0 : r[e]);
    },
    _getOptionValue: function(e) {
      var r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", n = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
      return Ze(e, r, n);
    },
    _getPTValue: function() {
      var e, r = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", o = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {}, i = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : !0, l = /./g.test(n) && !!o[n.split(".")[0]], s = this._getPropValue("ptOptions") || ((e = this.$primevueConfig) === null || e === void 0 ? void 0 : e.ptOptions) || {}, a = s.mergeSections, c = a === void 0 ? !0 : a, p = s.mergeProps, u = p === void 0 ? !1 : p, d = i ? l ? this._useGlobalPT(this._getPTClassValue, n, o) : this._useDefaultPT(this._getPTClassValue, n, o) : void 0, f = l ? void 0 : this._getPTSelf(r, this._getPTClassValue, n, k(k({}, o), {}, {
        global: d || {}
      })), m = this._getPTDatasets(n);
      return c || !c && f ? u ? this._mergeProps(u, d, f, m) : k(k(k({}, d), f), m) : k(k({}, f), m);
    },
    _getPTSelf: function() {
      for (var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, r = arguments.length, n = new Array(r > 1 ? r - 1 : 0), o = 1; o < r; o++)
        n[o - 1] = arguments[o];
      return de(
        this._usePT.apply(this, [this._getPT(e, this.$name)].concat(n)),
        // Exp; <component :pt="{}"
        this._usePT.apply(this, [this.$_attrsPT].concat(n))
        // Exp; <component :pt:[passthrough_key]:[attribute]="{value}" or <component :pt:[passthrough_key]="() =>{value}"
      );
    },
    _getPTDatasets: function() {
      var e, r, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", o = "data-pc-", i = n === "root" && T((e = this.pt) === null || e === void 0 ? void 0 : e["data-pc-section"]);
      return n !== "transition" && k(k({}, n === "root" && k(k(ue({}, "".concat(o, "name"), R(i ? (r = this.pt) === null || r === void 0 ? void 0 : r["data-pc-section"] : this.$.type.name)), i && ue({}, "".concat(o, "extend"), R(this.$.type.name))), {}, ue({}, "".concat(this.$attrSelector), ""))), {}, ue({}, "".concat(o, "section"), R(n)));
    },
    _getPTClassValue: function() {
      var e = this._getOptionValue.apply(this, arguments);
      return A(e) || zt(e) ? {
        class: e
      } : e;
    },
    _getPT: function(e) {
      var r = this, n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", o = arguments.length > 2 ? arguments[2] : void 0, i = function(s) {
        var a, c = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1, p = o ? o(s) : s, u = R(n), d = R(r.$name);
        return (a = c ? u !== d ? p?.[u] : void 0 : p?.[u]) !== null && a !== void 0 ? a : p;
      };
      return e != null && e.hasOwnProperty("_usept") ? {
        _usept: e._usept,
        originalValue: i(e.originalValue),
        value: i(e.value)
      } : i(e, !0);
    },
    _usePT: function(e, r, n, o) {
      var i = function(v) {
        return r(v, n, o);
      };
      if (e != null && e.hasOwnProperty("_usept")) {
        var l, s = e._usept || ((l = this.$primevueConfig) === null || l === void 0 ? void 0 : l.ptOptions) || {}, a = s.mergeSections, c = a === void 0 ? !0 : a, p = s.mergeProps, u = p === void 0 ? !1 : p, d = i(e.originalValue), f = i(e.value);
        return d === void 0 && f === void 0 ? void 0 : A(f) ? f : A(d) ? d : c || !c && f ? u ? this._mergeProps(u, d, f) : k(k({}, d), f) : f;
      }
      return i(e);
    },
    _useGlobalPT: function(e, r, n) {
      return this._usePT(this.globalPT, e, r, n);
    },
    _useDefaultPT: function(e, r, n) {
      return this._usePT(this.defaultPT, e, r, n);
    },
    ptm: function() {
      var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
      return this._getPTValue(this.pt, e, k(k({}, this.$params), r));
    },
    ptmi: function() {
      var e, r = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, o = de(this.$_attrsWithoutPT, this.ptm(r, n));
      return o?.hasOwnProperty("id") && ((e = o.id) !== null && e !== void 0 || (o.id = this.$id)), o;
    },
    ptmo: function() {
      var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", n = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
      return this._getPTValue(e, r, k({
        instance: this
      }, n), !1);
    },
    cx: function() {
      var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
      return this.isUnstyled ? void 0 : this._getOptionValue(this.$style.classes, e, k(k({}, this.$params), r));
    },
    sx: function() {
      var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0, n = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
      if (r) {
        var o = this._getOptionValue(this.$style.inlineStyles, e, k(k({}, this.$params), n)), i = this._getOptionValue(wt.inlineStyles, e, k(k({}, this.$params), n));
        return [i, o];
      }
    }
  },
  computed: {
    globalPT: function() {
      var e, r = this;
      return this._getPT((e = this.$primevueConfig) === null || e === void 0 ? void 0 : e.pt, void 0, function(n) {
        return L(n, {
          instance: r
        });
      });
    },
    defaultPT: function() {
      var e, r = this;
      return this._getPT((e = this.$primevueConfig) === null || e === void 0 ? void 0 : e.pt, void 0, function(n) {
        return r._getOptionValue(n, r.$name, k({}, r.$params)) || L(n, k({}, r.$params));
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
      var e, r = Object.keys(((e = this.$.vnode) === null || e === void 0 ? void 0 : e.props) || {});
      return Object.fromEntries(Object.entries(this.$props).filter(function(n) {
        var o = ce(n, 1), i = o[0];
        return r?.includes(i);
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
        var r = ce(e, 1), n = r[0];
        return n?.startsWith("pt:");
      }).reduce(function(e, r) {
        var n = ce(r, 2), o = n[0], i = n[1], l = o.split(":"), s = Hn(l), a = He(s).slice(1);
        return a?.reduce(function(c, p, u, d) {
          return !c[p] && (c[p] = u === d.length - 1 ? i : {}), c[p];
        }, e), e;
      }, {});
    },
    $_attrsWithoutPT: function() {
      return Object.entries(this.$attrs || {}).filter(function(e) {
        var r = ce(e, 1), n = r[0];
        return !(n != null && n.startsWith("pt:"));
      }).reduce(function(e, r) {
        var n = ce(r, 2), o = n[0], i = n[1];
        return e[o] = i, e;
      }, {});
    }
  }
}, Zn = `
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
`, Jn = O.extend({
  name: "baseicon",
  css: Zn
});
function xe(t) {
  "@babel/helpers - typeof";
  return xe = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, xe(t);
}
function St(t, e) {
  var r = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var n = Object.getOwnPropertySymbols(t);
    e && (n = n.filter(function(o) {
      return Object.getOwnPropertyDescriptor(t, o).enumerable;
    })), r.push.apply(r, n);
  }
  return r;
}
function $t(t) {
  for (var e = 1; e < arguments.length; e++) {
    var r = arguments[e] != null ? arguments[e] : {};
    e % 2 ? St(Object(r), !0).forEach(function(n) {
      Xn(t, n, r[n]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(r)) : St(Object(r)).forEach(function(n) {
      Object.defineProperty(t, n, Object.getOwnPropertyDescriptor(r, n));
    });
  }
  return t;
}
function Xn(t, e, r) {
  return (e = eo(e)) in t ? Object.defineProperty(t, e, { value: r, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = r, t;
}
function eo(t) {
  var e = to(t, "string");
  return xe(e) == "symbol" ? e : e + "";
}
function to(t, e) {
  if (xe(t) != "object" || !t) return t;
  var r = t[Symbol.toPrimitive];
  if (r !== void 0) {
    var n = r.call(t, e);
    if (xe(n) != "object") return n;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var ro = {
  name: "BaseIcon",
  extends: Qn,
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
  style: Jn,
  provide: function() {
    return {
      $pcIcon: this,
      $parentInstance: this
    };
  },
  methods: {
    pti: function() {
      var e = Se(this.label);
      return $t($t({}, !this.isUnstyled && {
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
function we(t) {
  "@babel/helpers - typeof";
  return we = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, we(t);
}
function _t(t, e) {
  return io(t) || ao(t, e) || oo(t, e) || no();
}
function no() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function oo(t, e) {
  if (t) {
    if (typeof t == "string") return Tt(t, e);
    var r = {}.toString.call(t).slice(8, -1);
    return r === "Object" && t.constructor && (r = t.constructor.name), r === "Map" || r === "Set" ? Array.from(t) : r === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r) ? Tt(t, e) : void 0;
  }
}
function Tt(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var r = 0, n = Array(e); r < e; r++) n[r] = t[r];
  return n;
}
function ao(t, e) {
  var r = t == null ? null : typeof Symbol < "u" && t[Symbol.iterator] || t["@@iterator"];
  if (r != null) {
    var n, o, i, l, s = [], a = !0, c = !1;
    try {
      if (i = (r = r.call(t)).next, e !== 0) for (; !(a = (n = i.call(r)).done) && (s.push(n.value), s.length !== e); a = !0) ;
    } catch (p) {
      c = !0, o = p;
    } finally {
      try {
        if (!a && r.return != null && (l = r.return(), Object(l) !== l)) return;
      } finally {
        if (c) throw o;
      }
    }
    return s;
  }
}
function io(t) {
  if (Array.isArray(t)) return t;
}
function Ot(t, e) {
  var r = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var n = Object.getOwnPropertySymbols(t);
    e && (n = n.filter(function(o) {
      return Object.getOwnPropertyDescriptor(t, o).enumerable;
    })), r.push.apply(r, n);
  }
  return r;
}
function S(t) {
  for (var e = 1; e < arguments.length; e++) {
    var r = arguments[e] != null ? arguments[e] : {};
    e % 2 ? Ot(Object(r), !0).forEach(function(n) {
      Ke(t, n, r[n]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(r)) : Ot(Object(r)).forEach(function(n) {
      Object.defineProperty(t, n, Object.getOwnPropertyDescriptor(r, n));
    });
  }
  return t;
}
function Ke(t, e, r) {
  return (e = so(e)) in t ? Object.defineProperty(t, e, { value: r, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = r, t;
}
function so(t) {
  var e = lo(t, "string");
  return we(e) == "symbol" ? e : e + "";
}
function lo(t, e) {
  if (we(t) != "object" || !t) return t;
  var r = t[Symbol.toPrimitive];
  if (r !== void 0) {
    var n = r.call(t, e);
    if (we(n) != "object") return n;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var b = {
  _getMeta: function() {
    return [z(arguments.length <= 0 ? void 0 : arguments[0]) || arguments.length <= 0 ? void 0 : arguments[0], L(z(arguments.length <= 0 ? void 0 : arguments[0]) ? arguments.length <= 0 ? void 0 : arguments[0] : arguments.length <= 1 ? void 0 : arguments[1])];
  },
  _getConfig: function(e, r) {
    var n, o, i;
    return (n = (e == null || (o = e.instance) === null || o === void 0 ? void 0 : o.$primevue) || (r == null || (i = r.ctx) === null || i === void 0 || (i = i.appContext) === null || i === void 0 || (i = i.config) === null || i === void 0 || (i = i.globalProperties) === null || i === void 0 ? void 0 : i.$primevue)) === null || n === void 0 ? void 0 : n.config;
  },
  _getOptionValue: Ze,
  _getPTValue: function() {
    var e, r, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, o = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, i = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : "", l = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : {}, s = arguments.length > 4 && arguments[4] !== void 0 ? arguments[4] : !0, a = function() {
      var x = b._getOptionValue.apply(b, arguments);
      return A(x) || zt(x) ? {
        class: x
      } : x;
    }, c = ((e = n.binding) === null || e === void 0 || (e = e.value) === null || e === void 0 ? void 0 : e.ptOptions) || ((r = n.$primevueConfig) === null || r === void 0 ? void 0 : r.ptOptions) || {}, p = c.mergeSections, u = p === void 0 ? !0 : p, d = c.mergeProps, f = d === void 0 ? !1 : d, m = s ? b._useDefaultPT(n, n.defaultPT(), a, i, l) : void 0, v = b._usePT(n, b._getPT(o, n.$name), a, i, S(S({}, l), {}, {
      global: m || {}
    })), h = b._getPTDatasets(n, i);
    return u || !u && v ? f ? b._mergeProps(n, f, m, v, h) : S(S(S({}, m), v), h) : S(S({}, v), h);
  },
  _getPTDatasets: function() {
    var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", n = "data-pc-";
    return S(S({}, r === "root" && Ke({}, "".concat(n, "name"), R(e.$name))), {}, Ke({}, "".concat(n, "section"), R(r)));
  },
  _getPT: function(e) {
    var r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", n = arguments.length > 2 ? arguments[2] : void 0, o = function(l) {
      var s, a = n ? n(l) : l, c = R(r);
      return (s = a?.[c]) !== null && s !== void 0 ? s : a;
    };
    return e && Object.hasOwn(e, "_usept") ? {
      _usept: e._usept,
      originalValue: o(e.originalValue),
      value: o(e.value)
    } : o(e);
  },
  _usePT: function() {
    var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, r = arguments.length > 1 ? arguments[1] : void 0, n = arguments.length > 2 ? arguments[2] : void 0, o = arguments.length > 3 ? arguments[3] : void 0, i = arguments.length > 4 ? arguments[4] : void 0, l = function(h) {
      return n(h, o, i);
    };
    if (r && Object.hasOwn(r, "_usept")) {
      var s, a = r._usept || ((s = e.$primevueConfig) === null || s === void 0 ? void 0 : s.ptOptions) || {}, c = a.mergeSections, p = c === void 0 ? !0 : c, u = a.mergeProps, d = u === void 0 ? !1 : u, f = l(r.originalValue), m = l(r.value);
      return f === void 0 && m === void 0 ? void 0 : A(m) ? m : A(f) ? f : p || !p && m ? d ? b._mergeProps(e, d, f, m) : S(S({}, f), m) : m;
    }
    return l(r);
  },
  _useDefaultPT: function() {
    var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, n = arguments.length > 2 ? arguments[2] : void 0, o = arguments.length > 3 ? arguments[3] : void 0, i = arguments.length > 4 ? arguments[4] : void 0;
    return b._usePT(e, r, n, o, i);
  },
  _loadStyles: function() {
    var e, r = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 ? arguments[1] : void 0, o = arguments.length > 2 ? arguments[2] : void 0, i = b._getConfig(n, o), l = {
      nonce: i == null || (e = i.csp) === null || e === void 0 ? void 0 : e.nonce
    };
    b._loadCoreStyles(r, l), b._loadThemeStyles(r, l), b._loadScopedThemeStyles(r, l), b._removeThemeListeners(r), r.$loadStyles = function() {
      return b._loadThemeStyles(r, l);
    }, b._themeChangeListener(r.$loadStyles);
  },
  _loadCoreStyles: function() {
    var e, r, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, o = arguments.length > 1 ? arguments[1] : void 0;
    if (!K.isStyleNameLoaded((e = n.$style) === null || e === void 0 ? void 0 : e.name) && (r = n.$style) !== null && r !== void 0 && r.name) {
      var i;
      O.loadCSS(o), (i = n.$style) === null || i === void 0 || i.loadCSS(o), K.setLoadedStyleName(n.$style.name);
    }
  },
  _loadThemeStyles: function() {
    var e, r, n, o = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, i = arguments.length > 1 ? arguments[1] : void 0;
    if (!(o != null && o.isUnstyled() || (o == null || (e = o.theme) === null || e === void 0 ? void 0 : e.call(o)) === "none")) {
      if (!$.isStyleNameLoaded("common")) {
        var l, s, a = ((l = o.$style) === null || l === void 0 || (s = l.getCommonTheme) === null || s === void 0 ? void 0 : s.call(l)) || {}, c = a.primitive, p = a.semantic, u = a.global, d = a.style;
        O.load(c?.css, S({
          name: "primitive-variables"
        }, i)), O.load(p?.css, S({
          name: "semantic-variables"
        }, i)), O.load(u?.css, S({
          name: "global-variables"
        }, i)), O.loadStyle(S({
          name: "global-style"
        }, i), d), $.setLoadedStyleName("common");
      }
      if (!$.isStyleNameLoaded((r = o.$style) === null || r === void 0 ? void 0 : r.name) && (n = o.$style) !== null && n !== void 0 && n.name) {
        var f, m, v, h, y = ((f = o.$style) === null || f === void 0 || (m = f.getDirectiveTheme) === null || m === void 0 ? void 0 : m.call(f)) || {}, x = y.css, _ = y.style;
        (v = o.$style) === null || v === void 0 || v.load(x, S({
          name: "".concat(o.$style.name, "-variables")
        }, i)), (h = o.$style) === null || h === void 0 || h.loadStyle(S({
          name: "".concat(o.$style.name, "-style")
        }, i), _), $.setLoadedStyleName(o.$style.name);
      }
      if (!$.isStyleNameLoaded("layer-order")) {
        var g, w, P = (g = o.$style) === null || g === void 0 || (w = g.getLayerOrderThemeCSS) === null || w === void 0 ? void 0 : w.call(g);
        O.load(P, S({
          name: "layer-order",
          first: !0
        }, i)), $.setLoadedStyleName("layer-order");
      }
    }
  },
  _loadScopedThemeStyles: function() {
    var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, r = arguments.length > 1 ? arguments[1] : void 0, n = e.preset();
    if (n && e.$attrSelector) {
      var o, i, l, s = ((o = e.$style) === null || o === void 0 || (i = o.getPresetTheme) === null || i === void 0 ? void 0 : i.call(o, n, "[".concat(e.$attrSelector, "]"))) || {}, a = s.css, c = (l = e.$style) === null || l === void 0 ? void 0 : l.load(a, S({
        name: "".concat(e.$attrSelector, "-").concat(e.$style.name)
      }, r));
      e.scopedStyleEl = c.el;
    }
  },
  _themeChangeListener: function() {
    var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : function() {
    };
    K.clearLoadedStyleNames(), C.on("theme:change", e);
  },
  _removeThemeListeners: function() {
    var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    C.off("theme:change", e.$loadStyles), e.$loadStyles = void 0;
  },
  _hook: function(e, r, n, o, i, l) {
    var s, a, c = "on".concat(Fr(r)), p = b._getConfig(o, i), u = n?.$instance, d = b._usePT(u, b._getPT(o == null || (s = o.value) === null || s === void 0 ? void 0 : s.pt, e), b._getOptionValue, "hooks.".concat(c)), f = b._useDefaultPT(u, p == null || (a = p.pt) === null || a === void 0 || (a = a.directives) === null || a === void 0 ? void 0 : a[e], b._getOptionValue, "hooks.".concat(c)), m = {
      el: n,
      binding: o,
      vnode: i,
      prevVnode: l
    };
    d?.(u, m), f?.(u, m);
  },
  /* eslint-disable-next-line no-unused-vars */
  _mergeProps: function() {
    for (var e = arguments.length > 1 ? arguments[1] : void 0, r = arguments.length, n = new Array(r > 2 ? r - 2 : 0), o = 2; o < r; o++)
      n[o - 2] = arguments[o];
    return De(e) ? e.apply(void 0, n) : de.apply(void 0, n);
  },
  _extend: function(e) {
    var r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, n = function(s, a, c, p, u) {
      var d, f, m, v;
      a._$instances = a._$instances || {};
      var h = b._getConfig(c, p), y = a._$instances[e] || {}, x = Se(y) ? S(S({}, r), r?.methods) : {};
      a._$instances[e] = S(S({}, y), {}, {
        /* new instance variables to pass in directive methods */
        $name: e,
        $host: a,
        $binding: c,
        $modifiers: c?.modifiers,
        $value: c?.value,
        $el: y.$el || a || void 0,
        $style: S({
          classes: void 0,
          inlineStyles: void 0,
          load: function() {
          },
          loadCSS: function() {
          },
          loadStyle: function() {
          }
        }, r?.style),
        $primevueConfig: h,
        $attrSelector: (d = a.$pd) === null || d === void 0 || (d = d[e]) === null || d === void 0 ? void 0 : d.attrSelector,
        /* computed instance variables */
        defaultPT: function() {
          return b._getPT(h?.pt, void 0, function(g) {
            var w;
            return g == null || (w = g.directives) === null || w === void 0 ? void 0 : w[e];
          });
        },
        isUnstyled: function() {
          var g, w;
          return ((g = a._$instances[e]) === null || g === void 0 || (g = g.$binding) === null || g === void 0 || (g = g.value) === null || g === void 0 ? void 0 : g.unstyled) !== void 0 ? (w = a._$instances[e]) === null || w === void 0 || (w = w.$binding) === null || w === void 0 || (w = w.value) === null || w === void 0 ? void 0 : w.unstyled : h?.unstyled;
        },
        theme: function() {
          var g;
          return (g = a._$instances[e]) === null || g === void 0 || (g = g.$primevueConfig) === null || g === void 0 ? void 0 : g.theme;
        },
        preset: function() {
          var g;
          return (g = a._$instances[e]) === null || g === void 0 || (g = g.$binding) === null || g === void 0 || (g = g.value) === null || g === void 0 ? void 0 : g.dt;
        },
        /* instance's methods */
        ptm: function() {
          var g, w = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", P = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
          return b._getPTValue(a._$instances[e], (g = a._$instances[e]) === null || g === void 0 || (g = g.$binding) === null || g === void 0 || (g = g.value) === null || g === void 0 ? void 0 : g.pt, w, S({}, P));
        },
        ptmo: function() {
          var g = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, w = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", P = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
          return b._getPTValue(a._$instances[e], g, w, P, !1);
        },
        cx: function() {
          var g, w, P = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", E = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
          return (g = a._$instances[e]) !== null && g !== void 0 && g.isUnstyled() ? void 0 : b._getOptionValue((w = a._$instances[e]) === null || w === void 0 || (w = w.$style) === null || w === void 0 ? void 0 : w.classes, P, S({}, E));
        },
        sx: function() {
          var g, w = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", P = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0, E = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
          return P ? b._getOptionValue((g = a._$instances[e]) === null || g === void 0 || (g = g.$style) === null || g === void 0 ? void 0 : g.inlineStyles, w, S({}, E)) : void 0;
        }
      }, x), a.$instance = a._$instances[e], (f = (m = a.$instance)[s]) === null || f === void 0 || f.call(m, a, c, p, u), a["$".concat(e)] = a.$instance, b._hook(e, s, a, c, p, u), a.$pd || (a.$pd = {}), a.$pd[e] = S(S({}, (v = a.$pd) === null || v === void 0 ? void 0 : v[e]), {}, {
        name: e,
        instance: a._$instances[e]
      });
    }, o = function(s) {
      var a, c, p, u = s._$instances[e], d = u?.watch, f = function(h) {
        var y, x = h.newValue, _ = h.oldValue;
        return d == null || (y = d.config) === null || y === void 0 ? void 0 : y.call(u, x, _);
      }, m = function(h) {
        var y, x = h.newValue, _ = h.oldValue;
        return d == null || (y = d["config.ripple"]) === null || y === void 0 ? void 0 : y.call(u, x, _);
      };
      u.$watchersCallback = {
        config: f,
        "config.ripple": m
      }, d == null || (a = d.config) === null || a === void 0 || a.call(u, u?.$primevueConfig), Y.on("config:change", f), d == null || (c = d["config.ripple"]) === null || c === void 0 || c.call(u, u == null || (p = u.$primevueConfig) === null || p === void 0 ? void 0 : p.ripple), Y.on("config:ripple:change", m);
    }, i = function(s) {
      var a = s._$instances[e].$watchersCallback;
      a && (Y.off("config:change", a.config), Y.off("config:ripple:change", a["config.ripple"]), s._$instances[e].$watchersCallback = void 0);
    };
    return {
      created: function(s, a, c, p) {
        s.$pd || (s.$pd = {}), s.$pd[e] = {
          name: e,
          attrSelector: an("pd")
        }, n("created", s, a, c, p);
      },
      beforeMount: function(s, a, c, p) {
        var u;
        b._loadStyles((u = s.$pd[e]) === null || u === void 0 ? void 0 : u.instance, a, c), n("beforeMount", s, a, c, p), o(s);
      },
      mounted: function(s, a, c, p) {
        var u;
        b._loadStyles((u = s.$pd[e]) === null || u === void 0 ? void 0 : u.instance, a, c), n("mounted", s, a, c, p);
      },
      beforeUpdate: function(s, a, c, p) {
        n("beforeUpdate", s, a, c, p);
      },
      updated: function(s, a, c, p) {
        var u;
        b._loadStyles((u = s.$pd[e]) === null || u === void 0 ? void 0 : u.instance, a, c), n("updated", s, a, c, p);
      },
      beforeUnmount: function(s, a, c, p) {
        var u;
        i(s), b._removeThemeListeners((u = s.$pd[e]) === null || u === void 0 ? void 0 : u.instance), n("beforeUnmount", s, a, c, p);
      },
      unmounted: function(s, a, c, p) {
        var u;
        (u = s.$pd[e]) === null || u === void 0 || (u = u.instance) === null || u === void 0 || (u = u.scopedStyleEl) === null || u === void 0 || (u = u.value) === null || u === void 0 || u.remove(), n("unmounted", s, a, c, p);
      }
    };
  },
  extend: function() {
    var e = b._getMeta.apply(b, arguments), r = _t(e, 2), n = r[0], o = r[1];
    return S({
      extend: function() {
        var l = b._getMeta.apply(b, arguments), s = _t(l, 2), a = s[0], c = s[1];
        return b.extend(a, S(S(S({}, o), o?.methods), c));
      }
    }, b._extend(n, o));
  }
}, co = `
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
`, po = {
  root: "p-ink"
}, uo = O.extend({
  name: "ripple-directive",
  style: co,
  classes: po
}), fo = b.extend({
  style: uo
});
function ke(t) {
  "@babel/helpers - typeof";
  return ke = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, ke(t);
}
function mo(t) {
  return yo(t) || vo(t) || ho(t) || go();
}
function go() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function ho(t, e) {
  if (t) {
    if (typeof t == "string") return Ye(t, e);
    var r = {}.toString.call(t).slice(8, -1);
    return r === "Object" && t.constructor && (r = t.constructor.name), r === "Map" || r === "Set" ? Array.from(t) : r === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r) ? Ye(t, e) : void 0;
  }
}
function vo(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function yo(t) {
  if (Array.isArray(t)) return Ye(t);
}
function Ye(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var r = 0, n = Array(e); r < e; r++) n[r] = t[r];
  return n;
}
function Pt(t, e, r) {
  return (e = bo(e)) in t ? Object.defineProperty(t, e, { value: r, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = r, t;
}
function bo(t) {
  var e = xo(t, "string");
  return ke(e) == "symbol" ? e : e + "";
}
function xo(t, e) {
  if (ke(t) != "object" || !t) return t;
  var r = t[Symbol.toPrimitive];
  if (r !== void 0) {
    var n = r.call(t, e);
    if (ke(n) != "object") return n;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var ta = fo.extend("ripple", {
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
      var r = this.getInk(e);
      r || (r = Xr("span", Pt(Pt({
        role: "presentation",
        "aria-hidden": !0,
        "data-p-ink": !0,
        "data-p-ink-active": !1,
        class: !this.isUnstyled() && this.cx("root"),
        onAnimationEnd: this.onAnimationEnd.bind(this)
      }, this.$attrSelector, ""), "p-bind", this.ptm("root"))), e.appendChild(r), this.$el = r);
    },
    remove: function(e) {
      var r = this.getInk(e);
      r && (this.$host.style.overflow = "", this.$host.style.position = "", this.unbindEvents(e), r.removeEventListener("animationend", this.onAnimationEnd), r.remove());
    },
    onMouseDown: function(e) {
      var r = this, n = e.currentTarget, o = this.getInk(n);
      if (!(!o || getComputedStyle(o, null).display === "none")) {
        if (!this.isUnstyled() && me(o, "p-ink-active"), o.setAttribute("data-p-ink-active", "false"), !at(o) && !it(o)) {
          var i = Math.max(Zr(n), nn(n));
          o.style.height = i + "px", o.style.width = i + "px";
        }
        var l = rn(n), s = e.pageX - l.left + document.body.scrollTop - it(o) / 2, a = e.pageY - l.top + document.body.scrollLeft - at(o) / 2;
        o.style.top = a + "px", o.style.left = s + "px", !this.isUnstyled() && Ve(o, "p-ink-active"), o.setAttribute("data-p-ink-active", "true"), this.timeout = setTimeout(function() {
          o && (!r.isUnstyled() && me(o, "p-ink-active"), o.setAttribute("data-p-ink-active", "false"));
        }, 401);
      }
    },
    onAnimationEnd: function(e) {
      this.timeout && clearTimeout(this.timeout), !this.isUnstyled() && me(e.currentTarget, "p-ink-active"), e.currentTarget.setAttribute("data-p-ink-active", "false");
    },
    getInk: function(e) {
      return e && e.children ? mo(e.children).find(function(r) {
        return tn(r, "data-pc-name") === "ripple";
      }) : void 0;
    }
  }
});
const wo = "data-wippy-overlay-layer";
function ir() {
  return typeof window < "u" && typeof window.document < "u";
}
function sr() {
  return ir() && typeof HTMLElement < "u" && Object.hasOwn(HTMLElement.prototype, "popover");
}
function ko() {
  return sr() && typeof CSS < "u" && typeof CSS.supports == "function" && CSS.supports("anchor-name: --a") && CSS.supports("position-area", "bottom span-right") && CSS.supports("position-try-fallbacks", "flip-block") && CSS.supports("min-width", "min(anchor-size(width), 100vw)") && CSS.supports("max-width", "stretch");
}
const So = /\bp-(?:select|multiselect|treeselect|cascadeselect)-overlay\b/;
let $o = 0;
const Ee = /* @__PURE__ */ new WeakMap();
function Ct(t, e) {
  const r = t.style;
  r.setProperty("position", "fixed", "important"), r.setProperty("inset", "auto", "important"), r.setProperty("margin", "0", "important"), r.setProperty("position-anchor", e), r.setProperty("position-area", "bottom span-right"), r.setProperty("position-try-fallbacks", "flip-block, flip-inline, flip-block flip-inline"), r.setProperty("min-width", "min(anchor-size(width), 100vw)", "important"), r.setProperty("max-width", "stretch", "important");
}
function _o(t, e) {
  if (!So.test(t.className))
    return;
  const r = t.style.cssText;
  Ct(t, e), t.getAttribute("popover") !== "manual" && t.setAttribute("popover", "manual");
  try {
    t.matches(":popover-open") || t.showPopover();
  } catch {
  }
  if (!t.matches(":popover-open")) {
    t.removeAttribute("popover"), t.style.cssText = r;
    return;
  }
  if (!Ee.has(t)) {
    const n = new MutationObserver(() => {
      const o = t.style;
      (o.top !== "auto" || o.left !== "auto" || o.margin !== "0px" || o.getPropertyPriority("top") !== "important" || o.getPropertyPriority("left") !== "important" || o.getPropertyPriority("margin") !== "important" || o.getPropertyPriority("min-width") !== "important" || o.maxWidth !== "stretch" || o.getPropertyPriority("max-width") !== "important") && Ct(t, e);
    });
    n.observe(t, { attributes: !0, attributeFilter: ["style"] }), Ee.set(t, n);
  }
}
function Je(t) {
  const e = Ee.get(t);
  e && (e.disconnect(), Ee.delete(t));
}
function To(t) {
  const e = t && typeof t.getRootNode == "function" ? t.getRootNode() : null;
  return e instanceof ShadowRoot ? e : null;
}
function qe(t) {
  t.style.top = "0px", t.style.left = "0px";
  const e = t.getBoundingClientRect();
  t.style.top = `${-window.scrollY - e.top}px`, t.style.left = `${-window.scrollX - e.left}px`;
}
const Ne = /* @__PURE__ */ new Set(), Xe = /* @__PURE__ */ new WeakMap();
let jt = !1, Ge = !1;
function Oo() {
  Ge = !1;
  for (const t of Ne) {
    if (!t.isConnected) {
      for (const e of Array.from(t.children))
        e instanceof HTMLElement && Je(e);
      Ne.delete(t), Xe.get(t)?.disconnect();
      continue;
    }
    t.childElementCount > 0 && qe(t);
  }
}
function At() {
  Ge || (Ge = !0, requestAnimationFrame(Oo));
}
function Po(t) {
  const e = document.createElement("div");
  e.setAttribute(wo, "");
  const r = sr();
  if (e.style.cssText = r ? "position:fixed;width:0 !important;height:0 !important;margin:0 !important;border:0 !important;padding:0 !important;background:transparent !important;color:inherit !important;overflow:visible !important;" : "position:fixed;top:0;left:0;width:0;height:0;", r && e.setAttribute("popover", "manual"), t.appendChild(e), r) {
    try {
      e.showPopover();
    } catch {
    }
    e.matches(":popover-open") || (e.removeAttribute("popover"), e.style.cssText = "position:fixed;top:0;left:0;width:0;height:0;");
  }
  qe(e);
  const n = new MutationObserver((o) => {
    const i = e.__wippyAnchorName;
    for (const l of o) {
      if (i)
        for (const s of Array.from(l.addedNodes))
          s instanceof HTMLElement && _o(s, i);
      for (const s of Array.from(l.removedNodes))
        s instanceof HTMLElement && Je(s);
    }
    e.isConnected && e.childElementCount > 0 && qe(e);
  });
  return n.observe(e, { childList: !0 }), Xe.set(e, n), Ne.add(e), jt || (jt = !0, window.addEventListener("scroll", At, { capture: !0, passive: !0 }), window.addEventListener("resize", At, { passive: !0 })), e;
}
function Lt(t) {
  if (!(!t.hostRoot || t.layer) && (t.layer = Po(t.hostRoot), ko())) {
    const e = t.$el ? t.$el.parentElement : null;
    e && (t.anchorName = `--wippy-a-${++$o}`, t.anchorTrigger = e, e.style.setProperty("anchor-name", t.anchorName), t.layer.__wippyAnchorName = t.anchorName);
  }
}
function Et(t) {
  if (t.anchorTrigger && (t.anchorTrigger.style.removeProperty("anchor-name"), t.anchorTrigger = null), t.anchorName = null, t.layer) {
    for (const e of Array.from(t.layer.children))
      e instanceof HTMLElement && Je(e);
    Ne.delete(t.layer), Xe.get(t.layer)?.disconnect(), t.layer.remove(), t.layer = null;
  }
}
let Nt = !1;
function Co() {
  if (Nt)
    return;
  Nt = !0;
  const t = rr;
  t.computed = t.computed || {}, t.computed.inline = function() {
    return !!this.disabled || this.appendTo === "self";
  }, t.computed.resolvedTarget = function() {
    return this.appendTo == null || this.appendTo === "body" ? this.hostRoot ? this.layer : document.body : this.appendTo;
  }, t.data = function() {
    return { mounted: !1, hostRoot: null, layer: null, anchorName: null, anchorTrigger: null };
  }, t.mounted = function() {
    ir() && (this.hostRoot = To(this.$el), this.mounted = !0, this.hostRoot && (this.inline || Lt(this), this.$watch("inline", (e) => {
      e ? Et(this) : Lt(this);
    })));
  }, t.render = function() {
    return this.inline ? je(this.$slots, "default", { key: 0 }) : this.mounted ? Lr(It, { key: 1, to: this.resolvedTarget || document.body }, [
      je(this.$slots, "default")
    ]) : Mt("", !0);
  }, t.unmounted = function() {
    Et(this);
  };
}
const ra = {
  install: (t) => {
    Co(), t.use(Wn, { theme: "none" });
  }
};
var jo = {
  name: "SpinnerIcon",
  extends: ro
};
function Ao(t) {
  return Do(t) || No(t) || Eo(t) || Lo();
}
function Lo() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Eo(t, e) {
  if (t) {
    if (typeof t == "string") return Qe(t, e);
    var r = {}.toString.call(t).slice(8, -1);
    return r === "Object" && t.constructor && (r = t.constructor.name), r === "Map" || r === "Set" ? Array.from(t) : r === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r) ? Qe(t, e) : void 0;
  }
}
function No(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function Do(t) {
  if (Array.isArray(t)) return Qe(t);
}
function Qe(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var r = 0, n = Array(e); r < e; r++) n[r] = t[r];
  return n;
}
function Io(t, e, r, n, o, i) {
  return Dt(), Er("svg", de({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, t.pti()), Ao(e[0] || (e[0] = [Nr("path", {
    d: "M6.99701 14C5.85441 13.999 4.72939 13.7186 3.72012 13.1832C2.71084 12.6478 1.84795 11.8737 1.20673 10.9284C0.565504 9.98305 0.165424 8.89526 0.041387 7.75989C-0.0826496 6.62453 0.073125 5.47607 0.495122 4.4147C0.917119 3.35333 1.59252 2.4113 2.46241 1.67077C3.33229 0.930247 4.37024 0.413729 5.4857 0.166275C6.60117 -0.0811796 7.76026 -0.0520535 8.86188 0.251112C9.9635 0.554278 10.9742 1.12227 11.8057 1.90555C11.915 2.01493 11.9764 2.16319 11.9764 2.31778C11.9764 2.47236 11.915 2.62062 11.8057 2.73C11.7521 2.78503 11.688 2.82877 11.6171 2.85864C11.5463 2.8885 11.4702 2.90389 11.3933 2.90389C11.3165 2.90389 11.2404 2.8885 11.1695 2.85864C11.0987 2.82877 11.0346 2.78503 10.9809 2.73C9.9998 1.81273 8.73246 1.26138 7.39226 1.16876C6.05206 1.07615 4.72086 1.44794 3.62279 2.22152C2.52471 2.99511 1.72683 4.12325 1.36345 5.41602C1.00008 6.70879 1.09342 8.08723 1.62775 9.31926C2.16209 10.5513 3.10478 11.5617 4.29713 12.1803C5.48947 12.7989 6.85865 12.988 8.17414 12.7157C9.48963 12.4435 10.6711 11.7264 11.5196 10.6854C12.3681 9.64432 12.8319 8.34282 12.8328 7C12.8328 6.84529 12.8943 6.69692 13.0038 6.58752C13.1132 6.47812 13.2616 6.41667 13.4164 6.41667C13.5712 6.41667 13.7196 6.47812 13.8291 6.58752C13.9385 6.69692 14 6.84529 14 7C14 8.85651 13.2622 10.637 11.9489 11.9497C10.6356 13.2625 8.85432 14 6.99701 14Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
jo.render = Io;
const na = ':root{--p-form-field-padding-x: .75rem;--p-form-field-padding-y: .5rem;--p-form-field-sm-padding-x: .625rem;--p-form-field-sm-padding-y: .375rem;--p-form-field-lg-padding-x: .875rem;--p-form-field-lg-padding-y: .625rem;--p-form-field-border-radius: .375rem;--p-form-field-transition-duration: .2s;--p-form-field-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), 0 1px 2px 0 rgba(18, 18, 23, .05);--p-focus-ring-width: 1px;--p-focus-ring-style: solid;--p-focus-ring-color: color-mix(in srgb, var(--p-primary-color) 100%, transparent);--p-focus-ring-offset: 2px;--p-toggleswitch-width: 2.5rem;--p-toggleswitch-height: 1.5rem;--p-toggleswitch-border-radius: 30px;--p-toggleswitch-gap: .25rem;--p-toggleswitch-border-width: 1px;--p-toggleswitch-transition-duration: .2s;--p-toggleswitch-slide-duration: .2s;--p-toggleswitch-handle-size: 1rem;--p-toggleswitch-handle-border-radius: 9999px}:root{color-scheme:light dark;--p-primary: rgb(0, 95, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-secondary: #6f7385;--p-secondary-50: color-mix(in srgb, var(--p-secondary) 5%, white);--p-secondary-100: color-mix(in srgb, var(--p-secondary) 10%, white);--p-secondary-200: color-mix(in srgb, var(--p-secondary) 20%, white);--p-secondary-300: color-mix(in srgb, var(--p-secondary) 35%, white);--p-secondary-400: color-mix(in srgb, var(--p-secondary) 65%, white);--p-secondary-500: var(--p-secondary);--p-secondary-600: color-mix(in srgb, var(--p-secondary) 80%, black);--p-secondary-700: color-mix(in srgb, var(--p-secondary) 65%, black);--p-secondary-800: color-mix(in srgb, var(--p-secondary) 55%, black);--p-secondary-900: color-mix(in srgb, var(--p-secondary) 50%, black);--p-secondary-950: color-mix(in srgb, var(--p-secondary) 30%, black);--p-danger: rgb(239, 68, 68);--p-danger-50: color-mix(in srgb, var(--p-danger) 5%, white);--p-danger-100: color-mix(in srgb, var(--p-danger) 10%, white);--p-danger-200: color-mix(in srgb, var(--p-danger) 20%, white);--p-danger-300: color-mix(in srgb, var(--p-danger) 30%, white);--p-danger-400: color-mix(in srgb, var(--p-danger) 40%, white);--p-danger-500: var(--p-danger);--p-danger-600: color-mix(in srgb, var(--p-danger) 80%, black);--p-danger-700: color-mix(in srgb, var(--p-danger) 70%, black);--p-danger-800: color-mix(in srgb, var(--p-danger) 60%, black);--p-danger-900: color-mix(in srgb, var(--p-danger) 50%, black);--p-danger-950: color-mix(in srgb, var(--p-danger) 40%, black);--p-success: rgb(34, 197, 94);--p-success-50: color-mix(in srgb, var(--p-success) 5%, white);--p-success-100: color-mix(in srgb, var(--p-success) 10%, white);--p-success-200: color-mix(in srgb, var(--p-success) 20%, white);--p-success-300: color-mix(in srgb, var(--p-success) 30%, white);--p-success-400: color-mix(in srgb, var(--p-success) 40%, white);--p-success-500: var(--p-success);--p-success-600: color-mix(in srgb, var(--p-success) 80%, black);--p-success-700: color-mix(in srgb, var(--p-success) 70%, black);--p-success-800: color-mix(in srgb, var(--p-success) 60%, black);--p-success-900: color-mix(in srgb, var(--p-success) 50%, black);--p-success-950: color-mix(in srgb, var(--p-success) 40%, black);--p-warn: rgb(249, 115, 22);--p-warn-50: color-mix(in srgb, var(--p-warn) 5%, white);--p-warn-100: color-mix(in srgb, var(--p-warn) 10%, white);--p-warn-200: color-mix(in srgb, var(--p-warn) 20%, white);--p-warn-300: color-mix(in srgb, var(--p-warn) 30%, white);--p-warn-400: color-mix(in srgb, var(--p-warn) 40%, white);--p-warn-500: var(--p-warn);--p-warn-600: color-mix(in srgb, var(--p-warn) 80%, black);--p-warn-700: color-mix(in srgb, var(--p-warn) 70%, black);--p-warn-800: color-mix(in srgb, var(--p-warn) 60%, black);--p-warn-900: color-mix(in srgb, var(--p-warn) 50%, black);--p-warn-950: color-mix(in srgb, var(--p-warn) 40%, black);--p-info: rgb(14, 165, 233);--p-info-50: color-mix(in srgb, var(--p-info) 5%, white);--p-info-100: color-mix(in srgb, var(--p-info) 10%, white);--p-info-200: color-mix(in srgb, var(--p-info) 20%, white);--p-info-300: color-mix(in srgb, var(--p-info) 30%, white);--p-info-400: color-mix(in srgb, var(--p-info) 40%, white);--p-info-500: var(--p-info);--p-info-600: color-mix(in srgb, var(--p-info) 80%, black);--p-info-700: color-mix(in srgb, var(--p-info) 70%, black);--p-info-800: color-mix(in srgb, var(--p-info) 60%, black);--p-info-900: color-mix(in srgb, var(--p-info) 50%, black);--p-info-950: color-mix(in srgb, var(--p-info) 40%, black);--p-help: rgb(168, 85, 247);--p-help-50: color-mix(in srgb, var(--p-help) 5%, white);--p-help-100: color-mix(in srgb, var(--p-help) 10%, white);--p-help-200: color-mix(in srgb, var(--p-help) 20%, white);--p-help-300: color-mix(in srgb, var(--p-help) 30%, white);--p-help-400: color-mix(in srgb, var(--p-help) 40%, white);--p-help-500: var(--p-help);--p-help-600: color-mix(in srgb, var(--p-help) 80%, black);--p-help-700: color-mix(in srgb, var(--p-help) 70%, black);--p-help-800: color-mix(in srgb, var(--p-help) 60%, black);--p-help-900: color-mix(in srgb, var(--p-help) 50%, black);--p-help-950: color-mix(in srgb, var(--p-help) 40%, black);--p-accent: rgb(20, 184, 166);--p-accent-50: color-mix(in srgb, var(--p-accent) 5%, white);--p-accent-100: color-mix(in srgb, var(--p-accent) 10%, white);--p-accent-200: color-mix(in srgb, var(--p-accent) 20%, white);--p-accent-300: color-mix(in srgb, var(--p-accent) 30%, white);--p-accent-400: color-mix(in srgb, var(--p-accent) 40%, white);--p-accent-500: var(--p-accent);--p-accent-600: color-mix(in srgb, var(--p-accent) 80%, black);--p-accent-700: color-mix(in srgb, var(--p-accent) 70%, black);--p-accent-800: color-mix(in srgb, var(--p-accent) 60%, black);--p-accent-900: color-mix(in srgb, var(--p-accent) 50%, black);--p-accent-950: color-mix(in srgb, var(--p-accent) 40%, black);--p-surface-0: #ffffff;--p-surface-50: #fafafa;--p-surface-100: #f5f5f5;--p-surface-200: #e5e5e5;--p-surface-300: #d4d4d4;--p-surface-400: #a3a3a3;--p-surface-500: #737373;--p-surface-600: #525252;--p-surface-700: #404040;--p-surface-800: #262626;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #171717;--p-surface-950: #0a0a0a;--p-content-border-radius: 6px;--p-font-heading-family: var(--v-font-family-head, Arial);--p-font-heading-scale: 1;--p-font-heading-line-height: 1.5;--p-font-heading-letter-spacing: normal;--p-font-heading-stretch: normal;--p-font-heading-variation-settings: normal;--p-font-body-scale: 1;--p-font-body-line-height: 1.5;--p-font-body-letter-spacing: normal;--p-font-body-stretch: normal;--p-font-body-variation-settings: normal;--p-font-mono-family: ui-monospace}:root{--p-primary-color: var(--p-primary-500);--p-primary-contrast-color: var(--p-surface-0);--p-primary-hover-color: var(--p-primary-600);--p-primary-active-color: var(--p-primary-700);--p-secondary-color: var(--p-secondary-500);--p-secondary-contrast-color: var(--p-surface-0);--p-secondary-hover-color: var(--p-secondary-600);--p-secondary-active-color: var(--p-secondary-700);--p-danger-color: var(--p-danger-500);--p-danger-contrast-color: var(--p-surface-0);--p-danger-hover-color: var(--p-danger-600);--p-danger-active-color: var(--p-danger-700);--p-success-color: var(--p-success-500);--p-success-contrast-color: var(--p-surface-0);--p-success-hover-color: var(--p-success-600);--p-success-active-color: var(--p-success-700);--p-warn-color: var(--p-warn-500);--p-warn-contrast-color: var(--p-surface-0);--p-warn-hover-color: var(--p-warn-600);--p-warn-active-color: var(--p-warn-700);--p-info-color: var(--p-info-500);--p-info-contrast-color: var(--p-surface-0);--p-info-hover-color: var(--p-info-600);--p-info-active-color: var(--p-info-700);--p-help-color: var(--p-help-500);--p-help-contrast-color: var(--p-surface-0);--p-help-hover-color: var(--p-help-600);--p-help-active-color: var(--p-help-700);--p-accent-color: var(--p-accent-500);--p-accent-contrast-color: var(--p-surface-0);--p-accent-hover-color: var(--p-accent-600);--p-accent-active-color: var(--p-accent-700);--p-content-border-color: var(--p-surface-200);--p-content-hover-background: var(--p-surface-100);--p-content-hover-color: var(--p-surface-800);--p-highlight-background: var(--p-primary-50);--p-highlight-color: var(--p-primary-700);--p-highlight-focus-background: var(--p-primary-100);--p-highlight-focus-color: var(--p-primary-800);--p-content-background: var(--p-surface-0);--p-text-color: var(--p-surface-700);--p-text-hover-color: var(--p-surface-800);--p-text-muted-color: var(--p-surface-500);--p-text-hover-muted-color: var(--p-surface-600)}@media(prefers-color-scheme:dark){:root:not(.w-theme-light){--p-surface-D: #fff;--p-surface-0: #fff;--p-surface-50: #fafafa;--p-surface-100: #f4f4f5;--p-surface-200: #e4e4e7;--p-surface-300: #d4d4d8;--p-surface-400: #a1a1aa;--p-surface-500: #71717a;--p-surface-600: #545250;--p-surface-700: #403e3c;--p-surface-800: #2b2927;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #1c1a19;--p-surface-950: #0f0e0d;--p-primary: rgb(0, 125, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-primary-color: var(--p-primary-400);--p-primary-contrast-color: var(--p-surface-900);--p-primary-hover-color: var(--p-primary-300);--p-primary-active-color: var(--p-primary-200);--p-secondary-color: var(--p-secondary-400);--p-secondary-contrast-color: var(--p-surface-900);--p-secondary-hover-color: var(--p-secondary-300);--p-secondary-active-color: var(--p-secondary-200);--p-danger-color: var(--p-danger-400);--p-danger-contrast-color: var(--p-surface-900);--p-danger-hover-color: var(--p-danger-300);--p-danger-active-color: var(--p-danger-200);--p-success-color: var(--p-success-400);--p-success-contrast-color: var(--p-surface-900);--p-success-hover-color: var(--p-success-300);--p-success-active-color: var(--p-success-200);--p-warn-color: var(--p-warn-400);--p-warn-contrast-color: var(--p-surface-900);--p-warn-hover-color: var(--p-warn-300);--p-warn-active-color: var(--p-warn-200);--p-info-color: var(--p-info-400);--p-info-contrast-color: var(--p-surface-900);--p-info-hover-color: var(--p-info-300);--p-info-active-color: var(--p-info-200);--p-help-color: var(--p-help-400);--p-help-contrast-color: var(--p-surface-900);--p-help-hover-color: var(--p-help-300);--p-help-active-color: var(--p-help-200);--p-accent-color: var(--p-accent-400);--p-accent-contrast-color: var(--p-surface-900);--p-accent-hover-color: var(--p-accent-300);--p-accent-active-color: var(--p-accent-200);--p-content-border-color: var(--p-surface-700);--p-content-hover-background: var(--p-surface-800);--p-content-hover-color: var(--p-surface-0);--p-highlight-background: color-mix(in srgb, var(--p-primary-400), transparent 84%);--p-highlight-color: rgba(255, 255, 255, 87%);--p-highlight-focus-background: color-mix(in srgb, var(--p-primary-400), transparent 76%);--p-highlight-focus-color: rgba(255, 255, 255, 87%);--p-content-background: var(--p-surface-900);--p-text-color: var(--p-surface-0);--p-text-hover-color: var(--p-surface-0);--p-text-muted-color: var(--p-surface-400);--p-text-hover-muted-color: var(--p-surface-300)}}:root.w-theme-dark,.w-theme-dark{color-scheme:dark;--p-surface-D: #fff;--p-surface-0: #fff;--p-surface-50: #fafafa;--p-surface-100: #f4f4f5;--p-surface-200: #e4e4e7;--p-surface-300: #d4d4d8;--p-surface-400: #a1a1aa;--p-surface-500: #71717a;--p-surface-600: #545250;--p-surface-700: #403e3c;--p-surface-800: #2b2927;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #1c1a19;--p-surface-950: #0f0e0d;--p-primary: rgb(0, 125, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-primary-color: var(--p-primary-400);--p-primary-contrast-color: var(--p-surface-900);--p-primary-hover-color: var(--p-primary-300);--p-primary-active-color: var(--p-primary-200);--p-secondary-color: var(--p-secondary-400);--p-secondary-contrast-color: var(--p-surface-900);--p-secondary-hover-color: var(--p-secondary-300);--p-secondary-active-color: var(--p-secondary-200);--p-danger-color: var(--p-danger-400);--p-danger-contrast-color: var(--p-surface-900);--p-danger-hover-color: var(--p-danger-300);--p-danger-active-color: var(--p-danger-200);--p-success-color: var(--p-success-400);--p-success-contrast-color: var(--p-surface-900);--p-success-hover-color: var(--p-success-300);--p-success-active-color: var(--p-success-200);--p-warn-color: var(--p-warn-400);--p-warn-contrast-color: var(--p-surface-900);--p-warn-hover-color: var(--p-warn-300);--p-warn-active-color: var(--p-warn-200);--p-info-color: var(--p-info-400);--p-info-contrast-color: var(--p-surface-900);--p-info-hover-color: var(--p-info-300);--p-info-active-color: var(--p-info-200);--p-help-color: var(--p-help-400);--p-help-contrast-color: var(--p-surface-900);--p-help-hover-color: var(--p-help-300);--p-help-active-color: var(--p-help-200);--p-accent-color: var(--p-accent-400);--p-accent-contrast-color: var(--p-surface-900);--p-accent-hover-color: var(--p-accent-300);--p-accent-active-color: var(--p-accent-200);--p-content-border-color: var(--p-surface-700);--p-content-hover-background: var(--p-surface-800);--p-content-hover-color: var(--p-surface-0);--p-highlight-background: color-mix(in srgb, var(--p-primary-400), transparent 84%);--p-highlight-color: rgba(255, 255, 255, 87%);--p-highlight-focus-background: color-mix(in srgb, var(--p-primary-400), transparent 76%);--p-highlight-focus-color: rgba(255, 255, 255, 87%);--p-content-background: var(--p-surface-900);--p-text-color: var(--p-surface-0);--p-text-hover-color: var(--p-surface-0);--p-text-muted-color: var(--p-surface-400);--p-text-hover-muted-color: var(--p-surface-300)}:root.w-theme-light,.w-theme-light{color-scheme:light;--p-surface-0: #ffffff;--p-surface-50: #fafafa;--p-surface-100: #f5f5f5;--p-surface-200: #e5e5e5;--p-surface-300: #d4d4d4;--p-surface-400: #a3a3a3;--p-surface-500: #737373;--p-surface-600: #525252;--p-surface-700: #404040;--p-surface-800: #262626;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #171717;--p-surface-950: #0a0a0a;--p-primary: rgb(0, 95, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-primary-color: var(--p-primary-500);--p-primary-contrast-color: var(--p-surface-0);--p-primary-hover-color: var(--p-primary-600);--p-primary-active-color: var(--p-primary-700);--p-secondary-color: var(--p-secondary-500);--p-secondary-contrast-color: var(--p-surface-0);--p-secondary-hover-color: var(--p-secondary-600);--p-secondary-active-color: var(--p-secondary-700);--p-danger-color: var(--p-danger-500);--p-danger-contrast-color: var(--p-surface-0);--p-danger-hover-color: var(--p-danger-600);--p-danger-active-color: var(--p-danger-700);--p-success-color: var(--p-success-500);--p-success-contrast-color: var(--p-surface-0);--p-success-hover-color: var(--p-success-600);--p-success-active-color: var(--p-success-700);--p-warn-color: var(--p-warn-500);--p-warn-contrast-color: var(--p-surface-0);--p-warn-hover-color: var(--p-warn-600);--p-warn-active-color: var(--p-warn-700);--p-info-color: var(--p-info-500);--p-info-contrast-color: var(--p-surface-0);--p-info-hover-color: var(--p-info-600);--p-info-active-color: var(--p-info-700);--p-help-color: var(--p-help-500);--p-help-contrast-color: var(--p-surface-0);--p-help-hover-color: var(--p-help-600);--p-help-active-color: var(--p-help-700);--p-accent-color: var(--p-accent-500);--p-accent-contrast-color: var(--p-surface-0);--p-accent-hover-color: var(--p-accent-600);--p-accent-active-color: var(--p-accent-700);--p-content-border-color: var(--p-surface-200);--p-content-hover-background: var(--p-surface-100);--p-content-hover-color: var(--p-surface-800);--p-highlight-background: var(--p-primary-50);--p-highlight-color: var(--p-primary-700);--p-highlight-focus-background: var(--p-primary-100);--p-highlight-focus-color: var(--p-primary-800);--p-content-background: var(--p-surface-0);--p-text-color: var(--p-surface-700);--p-text-hover-color: var(--p-surface-800);--p-text-muted-color: var(--p-surface-500);--p-text-hover-muted-color: var(--p-surface-600)}.spin{animation:kx-spin 1s linear infinite}@keyframes kx-spin{to{transform:rotate(360deg)}}@media(prefers-reduced-motion:reduce){.spin{animation:none}}.kx-head{display:flex;align-items:center;gap:12px;padding:20px 24px 14px;flex-wrap:wrap}.kx-head-icon{width:40px;height:40px;border-radius:11px;flex:none;display:flex;align-items:center;justify-content:center;background:color-mix(in srgb,var(--p-primary-color) 14%,transparent);color:var(--p-primary-color)}.kx-head-icon svg{width:22px;height:22px}.kx-head-text{min-width:0}.kx-title{font-size:17px;font-weight:700;color:var(--p-text-color);margin:0}.kx-head-sub{font-size:13px;color:var(--p-text-muted-color);margin:2px 0 0}.kx-head-actions{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-left:auto}.kx-empty{text-align:center;padding:44px 24px;display:flex;flex-direction:column;align-items:center;gap:8px}.kx-empty-ico{width:56px;height:56px;border-radius:14px;display:flex;align-items:center;justify-content:center;background:color-mix(in srgb,var(--p-primary-color) 12%,transparent);color:var(--p-primary-color);margin-bottom:4px}.kx-empty-ico svg{width:28px;height:28px}.kx-empty-title{font-size:15px;font-weight:700;color:var(--p-text-color);margin:0}.kx-empty-sub{font-size:13px;color:var(--p-text-muted-color);max-width:380px;margin:0}.kx-empty>.p-button{margin-top:6px}.kx-empty-actions{display:flex;gap:8px;margin-top:6px}.kx-loading{display:flex;align-items:center;gap:8px;color:var(--p-text-muted-color);font-size:13px;padding:24px}.kx-err{margin:0 20px 8px;padding:9px 12px;border-radius:10px;font-size:13px;background:color-mix(in srgb,var(--p-danger-500) 12%,transparent);color:var(--p-danger-600, var(--p-danger-500))}.kx-err.inline{margin:12px 0 0}*,:before,:after{--tw-border-spacing-x: 0;--tw-border-spacing-y: 0;--tw-translate-x: 0;--tw-translate-y: 0;--tw-rotate: 0;--tw-skew-x: 0;--tw-skew-y: 0;--tw-scale-x: 1;--tw-scale-y: 1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness: proximity;--tw-gradient-from-position: ;--tw-gradient-via-position: ;--tw-gradient-to-position: ;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width: 0px;--tw-ring-offset-color: #fff;--tw-ring-color: rgb(59 130 246 / .5);--tw-ring-offset-shadow: 0 0 #0000;--tw-ring-shadow: 0 0 #0000;--tw-shadow: 0 0 #0000;--tw-shadow-colored: 0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: ;--tw-contain-size: ;--tw-contain-layout: ;--tw-contain-paint: ;--tw-contain-style: }::backdrop{--tw-border-spacing-x: 0;--tw-border-spacing-y: 0;--tw-translate-x: 0;--tw-translate-y: 0;--tw-rotate: 0;--tw-skew-x: 0;--tw-skew-y: 0;--tw-scale-x: 1;--tw-scale-y: 1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness: proximity;--tw-gradient-from-position: ;--tw-gradient-via-position: ;--tw-gradient-to-position: ;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width: 0px;--tw-ring-offset-color: #fff;--tw-ring-color: rgb(59 130 246 / .5);--tw-ring-offset-shadow: 0 0 #0000;--tw-ring-shadow: 0 0 #0000;--tw-shadow: 0 0 #0000;--tw-shadow-colored: 0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: ;--tw-contain-size: ;--tw-contain-layout: ;--tw-contain-paint: ;--tw-contain-style: }*,:before,:after{box-sizing:border-box;border-width:0;border-style:solid;border-color:#e5e7eb}:before,:after{--tw-content: ""}html,:host{line-height:1.5;-webkit-text-size-adjust:100%;-moz-tab-size:4;tab-size:4;font-family:ui-sans-serif,system-ui,sans-serif,"Apple Color Emoji","Segoe UI Emoji",Segoe UI Symbol,"Noto Color Emoji";font-feature-settings:normal;font-variation-settings:normal;-webkit-tap-highlight-color:transparent}body{margin:0;line-height:inherit}hr{height:0;color:inherit;border-top-width:1px}abbr:where([title]){text-decoration:underline dotted}h1,h2,h3,h4,h5,h6{font-size:inherit;font-weight:inherit}a{color:inherit;text-decoration:inherit}b,strong{font-weight:bolder}code,kbd,samp,pre{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace;font-feature-settings:normal;font-variation-settings:normal;font-size:1em}small{font-size:80%}sub,sup{font-size:75%;line-height:0;position:relative;vertical-align:baseline}sub{bottom:-.25em}sup{top:-.5em}table{text-indent:0;border-color:inherit;border-collapse:collapse}button,input,optgroup,select,textarea{font-family:inherit;font-feature-settings:inherit;font-variation-settings:inherit;font-size:100%;font-weight:inherit;line-height:inherit;letter-spacing:inherit;color:inherit;margin:0;padding:0}button,select{text-transform:none}button,input:where([type=button]),input:where([type=reset]),input:where([type=submit]){-webkit-appearance:button;background-color:transparent;background-image:none}:-moz-focusring{outline:auto}:-moz-ui-invalid{box-shadow:none}progress{vertical-align:baseline}::-webkit-inner-spin-button,::-webkit-outer-spin-button{height:auto}[type=search]{-webkit-appearance:textfield;outline-offset:-2px}::-webkit-search-decoration{-webkit-appearance:none}::-webkit-file-upload-button{-webkit-appearance:button;font:inherit}summary{display:list-item}blockquote,dl,dd,h1,h2,h3,h4,h5,h6,hr,figure,p,pre{margin:0}fieldset{margin:0;padding:0}legend{padding:0}ol,ul,menu{list-style:none;margin:0;padding:0}dialog{padding:0}textarea{resize:vertical}input::placeholder,textarea::placeholder{opacity:1;color:#9ca3af}button,[role=button]{cursor:pointer}:disabled{cursor:default}img,svg,video,canvas,audio,iframe,embed,object{display:block;vertical-align:middle}img,video{max-width:100%;height:auto}[hidden]:where(:not([hidden=until-found])){display:none}@supports (-moz-appearance:none){*{scrollbar-color:initial;scrollbar-width:initial}}:host{display:block;height:100%;min-height:0}:host>div{height:100%;min-height:0}*,*:before,*:after{box-sizing:border-box}.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}:host{--kx-favorite-color: #b45309}@media(prefers-color-scheme:dark){:host{--kx-favorite-color: #fbbf24}}.kx{font-family:inherit;color:var(--p-text-color);background:var(--p-content-background);height:100%;min-height:0;display:flex;flex-direction:column;overflow-y:auto;overflow-x:hidden}.kx-head{flex:none}.kx-side-head{flex:none;display:flex;align-items:center;gap:8px;padding:12px}.kx-side-title{margin:0;min-width:0;font-size:14px;font-weight:700}.kx-side-new{margin-left:auto}.kx-side-artifacts{flex:none;min-height:38px;margin:0 8px;padding:0 10px;display:flex;align-items:center;gap:8px;border:0;border-radius:8px;background:transparent;color:var(--p-text-color);font:inherit;font-size:13px;font-weight:600;text-align:left;cursor:pointer}.kx-side-artifacts:hover{background:color-mix(in srgb,var(--p-text-color) 7%,transparent)}.kx-side-artifacts.is-active{background:color-mix(in srgb,var(--p-primary-color) 12%,transparent);color:var(--p-primary-color)}.kx-side-artifacts svg{width:16px;height:16px;flex:none}.kx-side-artifacts-caret{margin-left:auto;color:var(--p-text-muted-color)}.kx-sidebar{overflow:hidden}.kx-sidebar .kx-body{flex:1 1 60%;min-height:0;padding:8px;gap:8px;overflow-y:auto}.kx-side-section-title{padding:3px 6px 5px;color:var(--p-text-muted-color);font-size:11px;font-weight:650}.kx-sidebar .kx-list{border-top:0}.kx-sidebar .kx-row{grid-template-columns:auto minmax(0,1fr) auto;gap:4px;padding:2px 4px;border-radius:8px;border-bottom:0}.kx-sidebar .kx-row:hover,.kx-sidebar .kx-row-active{background:color-mix(in srgb,var(--p-primary-color) 11%,transparent)}.kx-sidebar .kx-name{font-size:13px}.kx-sidebar .kx-row-main{min-height:34px;padding:0 4px}.kx-sidebar .kx-row-agent,.kx-sidebar .kx-tok{display:none}.kx-sidebar .kx-row-meta{font-size:11px}.kx-sidebar .kx-row-end{gap:2px}.kx-sidebar .kx-src{width:20px;font-size:15px}.kx-search{position:relative;display:flex;align-items:center}.kx-search-ico{position:absolute;left:10px;width:15px;height:15px;color:var(--p-text-muted-color);pointer-events:none}.kx-search-input{height:34px;width:220px;max-width:40vw;padding:0 30px;font:inherit;font-size:13px;color:var(--p-text-color);background:var(--p-content-background);border:1px solid var(--p-content-border-color);border-radius:8px;transition:border-color .15s}.kx-search-input::-webkit-search-cancel-button{display:none}.kx-select{height:34px;padding:0 30px 0 10px;font:inherit;font-size:13px;color:var(--p-text-color);background:var(--p-content-background);border:1px solid var(--p-content-border-color);border-radius:8px}.kx-search-clear{position:absolute;right:6px;width:22px;height:22px;display:inline-flex;align-items:center;justify-content:center;border:0;border-radius:6px;background:transparent;color:var(--p-text-muted-color);cursor:pointer}.kx-search-clear:hover{background:color-mix(in srgb,var(--p-text-color) 10%,transparent);color:var(--p-text-color)}.kx-search-clear svg{width:13px;height:13px}.kx-toggle{display:inline-flex;align-items:center;gap:6px;height:34px;padding:0 12px;font:inherit;font-size:12.5px;font-weight:600;cursor:pointer;border-radius:8px;border:1px solid var(--p-content-border-color);background:transparent;color:var(--p-text-muted-color);transition:background .15s,color .15s,border-color .15s}.kx-toggle svg{width:16px;height:16px}.kx-toggle:hover:not(:disabled){color:var(--p-text-color);background:color-mix(in srgb,var(--p-text-color) 6%,transparent)}.kx-toggle:disabled{opacity:.5;cursor:default}.kx-toggle-on{color:var(--p-primary-color);border-color:color-mix(in srgb,var(--p-primary-color) 55%,var(--p-content-border-color));background:color-mix(in srgb,var(--p-primary-color) 12%,transparent)}.kx-body{flex:1 1 auto;min-height:0;padding:6px 20px 20px;display:flex;flex-direction:column;gap:14px}.kx-err{display:flex;align-items:center;gap:8px;margin:0 4px}.kx-err svg{width:16px;height:16px;flex:none}.kx-err-x{margin-left:auto;display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;border:0;border-radius:6px;background:transparent;color:inherit;cursor:pointer}.kx-err-x:hover{background:color-mix(in srgb,var(--p-danger-500) 18%,transparent)}.kx-err-x svg{width:14px;height:14px}.kx-list{display:flex;flex-direction:column;border-top:1px solid var(--p-content-border-color)}.kx-row{position:relative;display:grid;grid-template-columns:auto minmax(0,1fr) auto;align-items:center;gap:8px;padding:4px 10px;border-bottom:1px solid var(--p-content-border-color)}.kx-row:last-child{border-bottom:none}.kx-row:hover{background:color-mix(in srgb,var(--p-text-color) 6%,transparent)}.kx-src{width:30px;display:inline-flex;align-items:center;justify-content:center;color:var(--p-text-muted-color);font-size:18px}.kx-row-main{min-width:0;min-height:38px;padding:0 6px;display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:center;gap:16px;border:0;background:transparent;color:inherit;font:inherit;text-align:left;cursor:pointer}.kx-row-main-edit{display:flex;cursor:default}.kx-name{font-size:14px;font-weight:600;color:var(--p-text-color);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.kx-row-meta{min-width:0;display:flex;align-items:center;justify-content:flex-end;gap:10px;color:var(--p-text-muted-color);font-size:12px;white-space:nowrap}.kx-row-agent{max-width:160px;overflow:hidden;text-overflow:ellipsis}.kx-tok svg{width:12px;height:12px;opacity:.8}.kx-tok{display:inline-flex;align-items:center;gap:3px}.kx-sub-bad{color:var(--p-danger-600, var(--p-danger-500));font-weight:600}.kx-edit{width:100%;font:inherit;font-size:14px;font-weight:600;padding:3px 8px;border:1px solid var(--p-primary-color);border-radius:8px;background:var(--p-content-background);color:var(--p-text-color);outline:none}.kx-row-end{display:flex;align-items:center;gap:6px}.kx-menu-trigger{flex:none}.kx-row-menu{position:absolute;z-index:20;top:calc(50% + 18px);right:10px;width:196px;padding:5px;border:1px solid var(--p-content-border-color);border-radius:10px;background:var(--p-content-background);box-shadow:var(--p-popover-shadow)}.kx-menu-item{width:100%;min-height:34px;padding:0 9px;display:flex;align-items:center;gap:9px;border:0;border-radius:7px;background:transparent;color:var(--p-text-color);font:inherit;font-size:12px;text-align:left;cursor:pointer}.kx-menu-item:hover:not(:disabled),.kx-menu-item:focus-visible{background:color-mix(in srgb,var(--p-text-color) 9%,transparent)}.kx-menu-item:disabled{opacity:.55;cursor:default}.kx-menu-item svg{width:15px;height:15px;flex:none;color:var(--p-text-muted-color)}.kx-menu-item-danger,.kx-menu-item-danger svg{color:var(--p-danger-600, var(--p-danger-500))}.kx-fav{color:var(--p-text-muted-color)}.kx-fav:hover:not(:disabled){color:var(--kx-favorite-color)}.kx-fav-on,.kx-fav-on:hover{color:var(--kx-favorite-color)}.kx-more{display:flex;justify-content:center;padding:4px 0 2px}.kx-artifacts-page .kx-head,.kx-artifacts-page .kx-artifacts-body{width:min(100%,1180px);margin-inline:auto}.kx-artifacts-page .kx-head{padding-top:44px;padding-bottom:28px}.kx-artifacts-page .kx-title{font-family:inherit;font-size:32px;line-height:1.1}.kx-artifacts-body{overflow-y:auto;padding-inline:24px}.kx-artifact-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:24px}.kx-artifact-card{min-width:0;overflow:hidden;border:1px solid var(--p-content-border-color);border-radius:14px;background:var(--p-content-background);transition:border-color .15s,transform .15s,box-shadow .15s}.kx-artifact-card:hover{transform:translateY(-1px);border-color:color-mix(in srgb,var(--p-primary-color) 45%,var(--p-content-border-color));box-shadow:0 8px 22px color-mix(in srgb,var(--p-text-color) 10%,transparent)}.kx-artifact-open{width:100%;min-height:328px;padding:0;display:grid;grid-template-rows:230px auto;border:0;background:transparent;color:inherit;font:inherit;text-align:left;cursor:pointer;position:relative}.kx-artifact-open:disabled{cursor:wait}.kx-artifact-preview{min-width:0;display:block;background:var(--p-content-background);border-bottom:1px solid var(--p-content-border-color);overflow:hidden;pointer-events:none}.kx-artifact-preview w-artifact{display:block;width:143%;min-height:329px;transform:scale(.7);transform-origin:left top}.kx-artifact-copy{min-width:0;padding:14px 42px 14px 16px;display:flex;flex-direction:column;gap:7px}.kx-artifact-copy strong{display:-webkit-box;overflow:hidden;-webkit-box-orient:vertical;-webkit-line-clamp:2;font-size:16px;line-height:1.35}.kx-artifact-meta{display:flex;gap:8px;color:var(--p-text-muted-color);font-size:11.5px;text-transform:capitalize}.kx-artifact-meta span+span:before{content:"·";margin-right:8px}.kx-artifact-open-icon{position:absolute;right:14px;bottom:16px;width:17px;height:17px;color:var(--p-text-muted-color)}.kx-session-artifacts{flex:0 0 40%;min-height:72px;max-height:40%;display:flex;flex-direction:column;overflow:hidden;background:color-mix(in srgb,var(--p-text-color) 2%,var(--p-content-background))}.kx-session-artifacts.is-collapsed{flex-basis:36px;min-height:36px;max-height:36px}.kx-session-artifacts-head{width:100%;height:36px;padding:0 10px;display:flex;align-items:center;gap:7px;border:0;background:transparent;color:var(--p-text-muted-color);font:inherit;font-size:12px;font-weight:700;cursor:pointer}.kx-session-artifacts-head:hover{color:var(--p-text-color);background:color-mix(in srgb,var(--p-text-color) 6%,transparent)}.kx-session-artifacts-head svg{width:14px;height:14px}.kx-session-artifact-count{min-width:20px;padding:1px 5px;border-radius:6px;background:color-mix(in srgb,var(--p-primary-color) 12%,transparent);color:var(--p-primary-color);text-align:center}.kx-session-artifact-spin{margin-left:auto}.kx-session-artifact-list{flex:1 1 auto;min-height:0;max-height:none;overflow-y:auto;padding:2px 6px 8px}.kx-session-artifact{width:100%;min-height:32px;padding:0 7px;display:grid;grid-template-columns:16px minmax(0,1fr) 14px;align-items:center;gap:7px;border:0;border-radius:7px;background:transparent;color:var(--p-text-color);font:inherit;font-size:12px;text-align:left;cursor:pointer}.kx-session-artifact:hover{background:color-mix(in srgb,var(--p-primary-color) 10%,transparent)}.kx-session-artifact svg{width:14px;height:14px;color:var(--p-text-muted-color)}.kx-session-artifact span{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.kx-session-artifact-state{margin:0;padding:8px;color:var(--p-text-muted-color);font-size:11.5px}.kx-session-artifact-error{display:flex;align-items:center;gap:6px;color:var(--p-danger-600, var(--p-danger-500))}.kx-session-artifact-error button{margin-left:auto;border:0;background:transparent;color:inherit;font:inherit;font-weight:600;cursor:pointer}.kx-session-artifact-more{width:100%;min-height:30px;display:inline-flex;align-items:center;justify-content:center;gap:6px;border:0;border-radius:7px;background:transparent;color:var(--p-text-muted-color);font:inherit;font-size:11.5px;cursor:pointer}.kx-session-artifact-more:hover:not(:disabled){color:var(--p-text-color);background:color-mix(in srgb,var(--p-text-color) 6%,transparent)}.kx-session-artifact-more:disabled{cursor:wait;opacity:.65}.kx-session-artifact-more svg{width:14px;height:14px}.kx-artifact-panel{width:100%;height:100%;min-width:0;min-height:0;box-sizing:border-box;overflow:hidden;padding:12px;display:flex;flex-direction:column;gap:12px;border-left:0;background:var(--p-surface-50);color:var(--p-text-color)}@media(prefers-color-scheme:dark){:host(:not(.w-theme-light)) .kx-artifact-panel{background:var(--p-content-background)}}:host(.w-theme-dark) .kx-artifact-panel{background:var(--p-content-background)}.kx-artifact-panel-head{position:relative;z-index:2;flex:none;min-height:36px;padding:0;display:flex;align-items:center;gap:12px;border:0;background:transparent}.kx-artifact-panel-title{min-width:0;flex:1}.kx-artifact-panel-select{width:100%;min-width:0;height:36px;border-color:var(--p-content-border-color);border-radius:10px;background:var(--p-content-background);color:var(--p-text-color);box-shadow:none!important;font:inherit;font-size:13px;font-weight:650}.kx-artifact-panel-select:hover,.kx-artifact-panel-select.p-focus{border-color:var(--p-content-border-color);background:var(--p-content-background);box-shadow:none!important}.kx-artifact-panel-select .p-select-label{min-width:0;padding:0 8px;display:flex;align-items:center}.kx-artifact-panel-select .p-select-dropdown{width:28px}.kx-artifact-select-value{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.kx-artifact-select-value.is-placeholder{color:var(--p-text-muted-color);font-weight:500}.kx-artifact-select-option{min-width:0;width:100%;padding:2px 0;display:flex;flex-direction:column;gap:2px}.kx-artifact-select-option-title{overflow:hidden;color:var(--p-text-color);font-size:12.5px;font-weight:650;line-height:1.25;text-overflow:ellipsis;white-space:nowrap}.kx-artifact-select-option-sub{overflow:hidden;color:var(--p-text-muted-color);font-size:11px;line-height:1.25;text-overflow:ellipsis;white-space:nowrap}.kx-artifact-panel-select-overlay .p-select-option{align-items:flex-start}.kx-artifact-panel-actions{flex:none;display:flex;align-items:center;gap:5px}.kx-panel-action,.kx-panel-close{height:36px;display:inline-flex;align-items:center;justify-content:center;gap:5px;border:1px solid var(--p-content-border-color);border-radius:10px;background:var(--p-content-background);color:var(--p-text-color);box-shadow:none;font:inherit;font-size:12px;font-weight:600;cursor:pointer}.kx-panel-action{padding:0 9px}.kx-panel-close{width:36px;padding:0;border-color:transparent;box-shadow:none}.kx-panel-action:hover:not(:disabled),.kx-panel-close:hover{background:color-mix(in srgb,var(--p-text-color) 8%,transparent)}.kx-panel-action:disabled{opacity:.45;cursor:default}.kx-panel-action svg,.kx-panel-close svg{width:15px;height:15px}.kx-artifact-panel-error{flex:none;margin:0;padding:8px 10px;display:flex;align-items:center;justify-content:space-between;gap:10px;border-radius:8px;background:color-mix(in srgb,var(--p-danger-500) 11%,transparent);color:var(--p-danger-600, var(--p-danger-500));font-size:12px}.kx-artifact-panel-retry{flex:none;border:0;border-radius:6px;padding:4px 7px;background:transparent;color:inherit;font:inherit;font-weight:700;text-decoration:underline;cursor:pointer}.kx-artifact-panel-retry:hover:not(:disabled),.kx-artifact-panel-retry:focus-visible{background:color-mix(in srgb,currentColor 9%,transparent)}.kx-artifact-panel-retry:disabled{opacity:.5;cursor:default}.kx-artifact-panel-body{flex:1 1 auto;min-height:0;overflow:hidden;border-radius:18px;background:var(--p-content-background);box-shadow:0 0 0 1px var(--p-content-border-color),0 8px 24px color-mix(in srgb,var(--p-text-color) 7%,transparent)}.kx-artifact-panel-body w-artifact{display:block;width:100%;height:100%;border-radius:inherit;overflow:hidden}.kx-artifact-panel-empty{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:9px;border-radius:18px;background:var(--p-content-background);box-shadow:0 0 0 1px var(--p-content-border-color);color:var(--p-text-muted-color);font-size:13px}.kx-artifact-panel-empty svg{width:30px;height:30px}.kx-pager{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;padding:2px 2px 4px}.kx-pager-info{font-size:12.5px;color:var(--p-text-muted-color)}.kx-pager-ctrls{display:flex;align-items:center;gap:4px;margin-left:auto}.kx-pager-btn,.kx-pager-num{min-width:30px;height:30px;padding:0 8px;display:inline-flex;align-items:center;justify-content:center;border:1px solid var(--p-content-border-color);background:transparent;border-radius:8px;font:inherit;font-size:12.5px;font-weight:600;cursor:pointer;transition:background .15s,color .15s,border-color .15s}.kx-pager-num{color:var(--p-text-muted-color)}.kx-pager-btn{color:var(--p-text-color)}.kx-pager-btn:hover:not(:disabled),.kx-pager-num:hover{background:color-mix(in srgb,var(--p-text-color) 8%,transparent);color:var(--p-text-color)}.kx-pager-btn:disabled{opacity:.45;cursor:default}.kx-pager-btn svg{width:15px;height:15px}.kx-pager-cur,.kx-pager-cur:hover{background:var(--p-primary-color);color:var(--p-button-primary-color);border-color:var(--p-primary-color)}.kx-pager-gap{padding:0 2px;color:var(--p-text-muted-color);font-size:12.5px;user-select:none}.kx-drawer-title{display:inline-flex;align-items:center;gap:8px;font-size:15px;font-weight:700;min-width:0}.kx-drawer-title svg{width:18px;height:18px;color:var(--p-primary-color);flex:none}.kx-drawer-b{min-height:0}.kx-drawer-state{display:flex;align-items:center;justify-content:center;gap:8px;padding:40px 10px;color:var(--p-text-muted-color);font-size:13px}.kx-drawer-state.err{color:var(--p-danger-600, var(--p-danger-500))}.kx-msgs{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:10px}.kx-msg{padding:10px 12px;border:1px solid var(--p-content-border-color);border-radius:10px;background:color-mix(in srgb,var(--p-text-color) 3%,transparent)}.kx-msg-user{background:color-mix(in srgb,var(--p-primary-color) 8%,transparent);border-color:color-mix(in srgb,var(--p-primary-color) 25%,var(--p-content-border-color))}.kx-msg-role{font-size:10.5px;font-weight:700;letter-spacing:.03em;text-transform:uppercase;color:var(--p-text-muted-color)}.kx-msg-body{margin:6px 0 0;font:inherit;font-size:13px;line-height:1.5;white-space:pre-wrap;word-break:break-word}@media(max-width:640px){.kx-head{padding:16px 16px 12px}.kx-head-actions{margin-left:0;width:100%}.kx-search{flex:1}.kx-search-input{width:100%;max-width:none}.kx-body{padding:6px 14px 16px}.kx-row{gap:12px;padding:11px 12px}.kx-row-meta{display:none}.kx-artifact-grid{grid-template-columns:1fr}}@media(min-width:641px)and (max-width:960px){.kx-artifact-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}';
export {
  Go as $,
  qo as A,
  O as B,
  Wo as D,
  ea as F,
  Fo as I,
  zo as J,
  Yo as L,
  Ro as M,
  ra as P,
  it as R,
  Uo as S,
  at as T,
  Xr as U,
  Ve as W,
  Jo as Y,
  ro as a,
  Qn as b,
  T as c,
  jo as d,
  Zo as e,
  Hr as f,
  rr as g,
  ta as h,
  Kt as i,
  Ho as j,
  Vr as k,
  Ko as l,
  na as m,
  b as n,
  Qo as o,
  ze as p,
  Bo as q,
  Xo as r,
  Bt as s,
  Vo as t,
  Se as u,
  Zr as v,
  Ht as z
};
//# sourceMappingURL=styles-DUbfgJ3E.js.map

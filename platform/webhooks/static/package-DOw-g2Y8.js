import { ref as W, readonly as Wn, getCurrentInstance as gt, onMounted as Hn, nextTick as Fn, watch as _e, reactive as Kn, renderSlot as Q, openBlock as E, createBlock as Ke, Teleport as nn, createCommentVNode as ue, useId as Gn, mergeProps as N, h as Yn, createElementBlock as H, createElementVNode as P, createTextVNode as ke, toDisplayString as Pe, resolveComponent as yt, resolveDirective as qn, withDirectives as et, resolveDynamicComponent as Qn, withCtx as tt, normalizeClass as Te, defineComponent as Zn, computed as St, withModifiers as Jn, Fragment as Xn, vModelText as $t, createVNode as U, unref as Y } from "vue";
import { Icon as ge } from "@iconify/vue";
import { host as _t } from "@wippy-fe/proxy";
import { h as eo, b as to, i as no, p as kt, _ as oo, j as ro, e as ao, D as io } from "./styles-BOPmWjId.js";
var lo = Object.defineProperty, wt = Object.getOwnPropertySymbols, so = Object.prototype.hasOwnProperty, uo = Object.prototype.propertyIsEnumerable, Pt = (e, t, n) => t in e ? lo(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n, co = (e, t) => {
  for (var n in t || (t = {})) so.call(t, n) && Pt(e, n, t[n]);
  if (wt) for (var n of wt(t)) uo.call(t, n) && Pt(e, n, t[n]);
  return e;
};
function pe(e) {
  return e == null || e === "" || Array.isArray(e) && e.length === 0 || !(e instanceof Date) && typeof e == "object" && Object.keys(e).length === 0;
}
function ct(e) {
  return typeof e == "function" && "call" in e && "apply" in e;
}
function O(e) {
  return !pe(e);
}
function K(e, t = !0) {
  return e instanceof Object && e.constructor === Object && (t || Object.keys(e).length !== 0);
}
function on(e = {}, t = {}) {
  let n = co({}, e);
  return Object.keys(t).forEach((o) => {
    let r = o;
    K(t[r]) && r in e && K(e[r]) ? n[r] = on(e[r], t[r]) : n[r] = t[r];
  }), n;
}
function po(...e) {
  return e.reduce((t, n, o) => o === 0 ? n : on(t, n), {});
}
function M(e, ...t) {
  return ct(e) ? e(...t) : e;
}
function I(e, t = !0) {
  return typeof e == "string" && (t || e !== "");
}
function F(e) {
  return I(e) ? e.replace(/(-|_)/g, "").toLowerCase() : e;
}
function pt(e, t = "", n = {}) {
  let o = F(t).split("."), r = o.shift();
  if (r) {
    if (K(e)) {
      let l = Object.keys(e).find((s) => F(s) === r) || "";
      return pt(M(e[l], n), o.join("."), n);
    }
    return;
  }
  return M(e, n);
}
function rn(e, t = !0) {
  return Array.isArray(e) && (t || e.length !== 0);
}
function bo(e) {
  return O(e) && !isNaN(e);
}
function de(e, t) {
  if (t) {
    let n = t.test(e);
    return t.lastIndex = 0, n;
  }
  return !1;
}
function fo(...e) {
  return po(...e);
}
function Oe(e) {
  return e && e.replace(/\/\*(?:(?!\*\/)[\s\S])*\*\/|[\r\n\t]+/g, "").replace(/ {2,}/g, " ").replace(/ ([{:}]) /g, "$1").replace(/([;,]) /g, "$1").replace(/ !/g, "!").replace(/: /g, ":").trim();
}
function mo(e) {
  return I(e, !1) ? e[0].toUpperCase() + e.slice(1) : e;
}
function an(e) {
  return I(e) ? e.replace(/(_)/g, "-").replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase() : e;
}
function ln() {
  let e = /* @__PURE__ */ new Map();
  return { on(t, n) {
    let o = e.get(t);
    return o ? o.push(n) : o = [n], e.set(t, o), this;
  }, off(t, n) {
    let o = e.get(t);
    return o && o.splice(o.indexOf(n) >>> 0, 1), this;
  }, emit(t, n) {
    let o = e.get(t);
    o && o.forEach((r) => {
      r(n);
    });
  }, clear() {
    e.clear();
  } };
}
function xe(...e) {
  if (e) {
    let t = [];
    for (let n = 0; n < e.length; n++) {
      let o = e[n];
      if (!o) continue;
      let r = typeof o;
      if (r === "string" || r === "number") t.push(o);
      else if (r === "object") {
        let l = Array.isArray(o) ? [xe(...o)] : Object.entries(o).map(([s, i]) => i ? s : void 0);
        t = l.length ? t.concat(l.filter((s) => !!s)) : t;
      }
    }
    return t.join(" ").trim();
  }
}
function ho(e, t) {
  return e ? e.classList ? e.classList.contains(t) : new RegExp("(^| )" + t + "( |$)", "gi").test(e.className) : !1;
}
function nt(e, t) {
  if (e && t) {
    let n = (o) => {
      ho(e, o) || (e.classList ? e.classList.add(o) : e.className += " " + o);
    };
    [t].flat().filter(Boolean).forEach((o) => o.split(" ").forEach(n));
  }
}
function vo() {
  return window.innerWidth - document.documentElement.offsetWidth;
}
function Va(e) {
  typeof e == "string" ? nt(document.body, e || "p-overflow-hidden") : (e != null && e.variableName && document.body.style.setProperty(e.variableName, vo() + "px"), nt(document.body, e?.className || "p-overflow-hidden"));
}
function Ce(e, t) {
  if (e && t) {
    let n = (o) => {
      e.classList ? e.classList.remove(o) : e.className = e.className.replace(new RegExp("(^|\\b)" + o.split(" ").join("|") + "(\\b|$)", "gi"), " ");
    };
    [t].flat().filter(Boolean).forEach((o) => o.split(" ").forEach(n));
  }
}
function Ba(e) {
  typeof e == "string" ? Ce(document.body, e || "p-overflow-hidden") : (e != null && e.variableName && document.body.style.removeProperty(e.variableName), Ce(document.body, e?.className || "p-overflow-hidden"));
}
function Ua() {
  let e = window, t = document, n = t.documentElement, o = t.getElementsByTagName("body")[0], r = e.innerWidth || n.clientWidth || o.clientWidth, l = e.innerHeight || n.clientHeight || o.clientHeight;
  return { width: r, height: l };
}
function Tt(e) {
  return e ? Math.abs(e.scrollLeft) : 0;
}
function za(e, t) {
  e && (typeof t == "string" ? e.style.cssText = t : Object.entries(t || {}).forEach(([n, o]) => e.style[n] = o));
}
function go(e, t) {
  return e instanceof HTMLElement ? e.offsetWidth : 0;
}
function yo(e) {
  if (e) {
    let t = e.parentNode;
    return t && t instanceof ShadowRoot && t.host && (t = t.host), t;
  }
  return null;
}
function So(e) {
  return !!(e !== null && typeof e < "u" && e.nodeName && yo(e));
}
function be(e) {
  return typeof Element < "u" ? e instanceof Element : e !== null && typeof e == "object" && e.nodeType === 1 && typeof e.nodeName == "string";
}
function Ye(e, t = {}) {
  if (be(e)) {
    let n = (o, r) => {
      var l, s;
      let i = (l = e?.$attrs) != null && l[o] ? [(s = e?.$attrs) == null ? void 0 : s[o]] : [];
      return [r].flat().reduce((a, u) => {
        if (u != null) {
          let d = typeof u;
          if (d === "string" || d === "number") a.push(u);
          else if (d === "object") {
            let c = Array.isArray(u) ? n(o, u) : Object.entries(u).map(([p, b]) => o === "style" && (b || b === 0) ? `${p.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase()}:${b}` : b ? p : void 0);
            a = c.length ? a.concat(c.filter((p) => !!p)) : a;
          }
        }
        return a;
      }, i);
    };
    Object.entries(t).forEach(([o, r]) => {
      if (r != null) {
        let l = o.match(/^on(.+)/);
        l ? e.addEventListener(l[1].toLowerCase(), r) : o === "p-bind" || o === "pBind" ? Ye(e, r) : (r = o === "class" ? [...new Set(n("class", r))].join(" ").trim() : o === "style" ? n("style", r).join(";").trim() : r, (e.$attrs = e.$attrs || {}) && (e.$attrs[o] = r), e.setAttribute(o, r));
      }
    });
  }
}
function $o(e, t = {}, ...n) {
  {
    let o = document.createElement(e);
    return Ye(o, t), o.append(...n), o;
  }
}
function _o(e, t) {
  return be(e) ? Array.from(e.querySelectorAll(t)) : [];
}
function ko(e, t) {
  return be(e) ? e.matches(t) ? e : e.querySelector(t) : null;
}
function Wa(e, t) {
  e && document.activeElement !== e && e.focus(t);
}
function wo(e, t) {
  if (be(e)) {
    let n = e.getAttribute(t);
    return isNaN(n) ? n === "true" || n === "false" ? n === "true" : n : +n;
  }
}
function sn(e, t = "") {
  let n = _o(e, `button:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t},
            [href]:not([tabindex = "-1"]):not([style*="display:none"]):not([hidden])${t},
            input:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t},
            select:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t},
            textarea:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t},
            [tabIndex]:not([tabIndex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t},
            [contenteditable]:not([tabIndex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t}`), o = [];
  for (let r of n) getComputedStyle(r).display != "none" && getComputedStyle(r).visibility != "hidden" && o.push(r);
  return o;
}
function Ha(e, t) {
  let n = sn(e, t);
  return n.length > 0 ? n[0] : null;
}
function Ot(e) {
  if (e) {
    let t = e.offsetHeight, n = getComputedStyle(e);
    return t -= parseFloat(n.paddingTop) + parseFloat(n.paddingBottom) + parseFloat(n.borderTopWidth) + parseFloat(n.borderBottomWidth), t;
  }
  return 0;
}
function Fa(e, t) {
  let n = sn(e, t);
  return n.length > 0 ? n[n.length - 1] : null;
}
function Po(e) {
  if (e) {
    let t = e.getBoundingClientRect();
    return { top: t.top + (window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0), left: t.left + (window.pageXOffset || Tt(document.documentElement) || Tt(document.body) || 0) };
  }
  return { top: "auto", left: "auto" };
}
function To(e, t) {
  return e ? e.offsetHeight : 0;
}
function xt(e) {
  if (e) {
    let t = e.offsetWidth, n = getComputedStyle(e);
    return t -= parseFloat(n.paddingLeft) + parseFloat(n.paddingRight) + parseFloat(n.borderLeftWidth) + parseFloat(n.borderRightWidth), t;
  }
  return 0;
}
function un() {
  return !!(typeof window < "u" && window.document && window.document.createElement);
}
function Ka(e, t = "") {
  return be(e) ? e.matches(`button:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t},
            [href][clientHeight][clientWidth]:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t},
            input:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t},
            select:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t},
            textarea:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t},
            [tabIndex]:not([tabIndex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t},
            [contenteditable]:not([tabIndex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t}`) : !1;
}
function Oo(e, t = "", n) {
  be(e) && n !== null && n !== void 0 && e.setAttribute(t, n);
}
var ze = {};
function xo(e = "pui_id_") {
  return Object.hasOwn(ze, e) || (ze[e] = 0), ze[e]++, `${e}${ze[e]}`;
}
var Co = Object.defineProperty, jo = Object.defineProperties, Ao = Object.getOwnPropertyDescriptors, qe = Object.getOwnPropertySymbols, dn = Object.prototype.hasOwnProperty, cn = Object.prototype.propertyIsEnumerable, Ct = (e, t, n) => t in e ? Co(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n, V = (e, t) => {
  for (var n in t || (t = {})) dn.call(t, n) && Ct(e, n, t[n]);
  if (qe) for (var n of qe(t)) cn.call(t, n) && Ct(e, n, t[n]);
  return e;
}, Je = (e, t) => jo(e, Ao(t)), q = (e, t) => {
  var n = {};
  for (var o in e) dn.call(e, o) && t.indexOf(o) < 0 && (n[o] = e[o]);
  if (e != null && qe) for (var o of qe(e)) t.indexOf(o) < 0 && cn.call(e, o) && (n[o] = e[o]);
  return n;
}, Lo = ln(), j = Lo, je = /{([^}]*)}/g, pn = /(\d+\s+[\+\-\*\/]\s+\d+)/g, bn = /var\([^)]+\)/g;
function jt(e) {
  return I(e) ? e.replace(/[A-Z]/g, (t, n) => n === 0 ? t : "." + t.toLowerCase()).toLowerCase() : e;
}
function No(e) {
  return K(e) && e.hasOwnProperty("$value") && e.hasOwnProperty("$type") ? e.$value : e;
}
function Eo(e) {
  return e.replaceAll(/ /g, "").replace(/[^\w]/g, "-");
}
function ot(e = "", t = "") {
  return Eo(`${I(e, !1) && I(t, !1) ? `${e}-` : e}${t}`);
}
function fn(e = "", t = "") {
  return `--${ot(e, t)}`;
}
function Io(e = "") {
  let t = (e.match(/{/g) || []).length, n = (e.match(/}/g) || []).length;
  return (t + n) % 2 !== 0;
}
function mn(e, t = "", n = "", o = [], r) {
  if (I(e)) {
    let l = e.trim();
    if (Io(l)) return;
    if (de(l, je)) {
      let s = l.replaceAll(je, (i) => {
        let a = i.replace(/{|}/g, "").split(".").filter((u) => !o.some((d) => de(u, d)));
        return `var(${fn(n, an(a.join("-")))}${O(r) ? `, ${r}` : ""})`;
      });
      return de(s.replace(bn, "0"), pn) ? `calc(${s})` : s;
    }
    return l;
  } else if (bo(e)) return e;
}
function Mo(e, t, n) {
  I(t, !1) && e.push(`${t}:${n};`);
}
function ye(e, t) {
  return e ? `${e}{${t}}` : "";
}
function hn(e, t) {
  if (e.indexOf("dt(") === -1) return e;
  function n(s, i) {
    let a = [], u = 0, d = "", c = null, p = 0;
    for (; u <= s.length; ) {
      let b = s[u];
      if ((b === '"' || b === "'" || b === "`") && s[u - 1] !== "\\" && (c = c === b ? null : b), !c && (b === "(" && p++, b === ")" && p--, (b === "," || u === s.length) && p === 0)) {
        let h = d.trim();
        h.startsWith("dt(") ? a.push(hn(h, i)) : a.push(o(h)), d = "", u++;
        continue;
      }
      b !== void 0 && (d += b), u++;
    }
    return a;
  }
  function o(s) {
    let i = s[0];
    if ((i === '"' || i === "'" || i === "`") && s[s.length - 1] === i) return s.slice(1, -1);
    let a = Number(s);
    return isNaN(a) ? s : a;
  }
  let r = [], l = [];
  for (let s = 0; s < e.length; s++) if (e[s] === "d" && e.slice(s, s + 3) === "dt(") l.push(s), s += 2;
  else if (e[s] === ")" && l.length > 0) {
    let i = l.pop();
    l.length === 0 && r.push([i, s]);
  }
  if (!r.length) return e;
  for (let s = r.length - 1; s >= 0; s--) {
    let [i, a] = r[s], u = e.slice(i + 3, a), d = n(u, t), c = t(...d);
    e = e.slice(0, i) + c + e.slice(a + 1);
  }
  return e;
}
var Ga = (e) => {
  var t;
  let n = w.getTheme(), o = rt(n, e, void 0, "variable"), r = (t = o?.match(/--[\w-]+/g)) == null ? void 0 : t[0], l = rt(n, e, void 0, "value");
  return { name: r, variable: o, value: l };
}, ce = (...e) => rt(w.getTheme(), ...e), rt = (e = {}, t, n, o) => {
  if (t) {
    let { variable: r, options: l } = w.defaults || {}, { prefix: s, transform: i } = e?.options || l || {}, a = de(t, je) ? t : `{${t}}`;
    return o === "value" || pe(o) && i === "strict" ? w.getTokenValue(t) : mn(a, void 0, s, [r.excludedKeyRegex], n);
  }
  return "";
};
function We(e, ...t) {
  if (e instanceof Array) {
    let n = e.reduce((o, r, l) => {
      var s;
      return o + r + ((s = M(t[l], { dt: ce })) != null ? s : "");
    }, "");
    return hn(n, ce);
  }
  return M(e, { dt: ce });
}
function Do(e, t = {}) {
  let n = w.defaults.variable, { prefix: o = n.prefix, selector: r = n.selector, excludedKeyRegex: l = n.excludedKeyRegex } = t, s = [], i = [], a = [{ node: e, path: o }];
  for (; a.length; ) {
    let { node: d, path: c } = a.pop();
    for (let p in d) {
      let b = d[p], h = No(b), g = de(p, l) ? ot(c) : ot(c, an(p));
      if (K(h)) a.push({ node: h, path: g });
      else {
        let v = fn(g), f = mn(h, g, o, [l]);
        Mo(i, v, f);
        let y = g;
        o && y.startsWith(o + "-") && (y = y.slice(o.length + 1)), s.push(y.replace(/-/g, "."));
      }
    }
  }
  let u = i.join("");
  return { value: i, tokens: s, declarations: u, css: ye(r, u) };
}
var R = { regex: { rules: { class: { pattern: /^\.([a-zA-Z][\w-]*)$/, resolve(e) {
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
    var o;
    return (o = t.map((r) => r.resolve(n)).find((r) => r.matched)) != null ? o : this.rules.custom.resolve(n);
  });
} }, _toVariables(e, t) {
  return Do(e, { prefix: t?.prefix });
}, getCommon({ name: e = "", theme: t = {}, params: n, set: o, defaults: r }) {
  var l, s, i, a, u, d, c;
  let { preset: p, options: b } = t, h, g, v, f, y, T, m;
  if (O(p) && b.transform !== "strict") {
    let { primitive: $, semantic: C, extend: D } = p, Z = C || {}, { colorScheme: J } = Z, oe = q(Z, ["colorScheme"]), X = D || {}, { colorScheme: re } = X, ae = q(X, ["colorScheme"]), ee = J || {}, { dark: ie } = ee, fe = q(ee, ["dark"]), le = re || {}, { dark: me } = le, he = q(le, ["dark"]), G = O($) ? this._toVariables({ primitive: $ }, b) : {}, B = O(oe) ? this._toVariables({ semantic: oe }, b) : {}, se = O(fe) ? this._toVariables({ light: fe }, b) : {}, Ue = O(ie) ? this._toVariables({ dark: ie }, b) : {}, ve = O(ae) ? this._toVariables({ semantic: ae }, b) : {}, ht = O(he) ? this._toVariables({ light: he }, b) : {}, vt = O(me) ? this._toVariables({ dark: me }, b) : {}, [Pn, Tn] = [(l = G.declarations) != null ? l : "", G.tokens], [On, xn] = [(s = B.declarations) != null ? s : "", B.tokens || []], [Cn, jn] = [(i = se.declarations) != null ? i : "", se.tokens || []], [An, Ln] = [(a = Ue.declarations) != null ? a : "", Ue.tokens || []], [Nn, En] = [(u = ve.declarations) != null ? u : "", ve.tokens || []], [In, Mn] = [(d = ht.declarations) != null ? d : "", ht.tokens || []], [Dn, Rn] = [(c = vt.declarations) != null ? c : "", vt.tokens || []];
    h = this.transformCSS(e, Pn, "light", "variable", b, o, r), g = Tn;
    let Vn = this.transformCSS(e, `${On}${Cn}`, "light", "variable", b, o, r), Bn = this.transformCSS(e, `${An}`, "dark", "variable", b, o, r);
    v = `${Vn}${Bn}`, f = [.../* @__PURE__ */ new Set([...xn, ...jn, ...Ln])];
    let Un = this.transformCSS(e, `${Nn}${In}color-scheme:light`, "light", "variable", b, o, r), zn = this.transformCSS(e, `${Dn}color-scheme:dark`, "dark", "variable", b, o, r);
    y = `${Un}${zn}`, T = [.../* @__PURE__ */ new Set([...En, ...Mn, ...Rn])], m = M(p.css, { dt: ce });
  }
  return { primitive: { css: h, tokens: g }, semantic: { css: v, tokens: f }, global: { css: y, tokens: T }, style: m };
}, getPreset({ name: e = "", preset: t = {}, options: n, params: o, set: r, defaults: l, selector: s }) {
  var i, a, u;
  let d, c, p;
  if (O(t) && n.transform !== "strict") {
    let b = e.replace("-directive", ""), h = t, { colorScheme: g, extend: v, css: f } = h, y = q(h, ["colorScheme", "extend", "css"]), T = v || {}, { colorScheme: m } = T, $ = q(T, ["colorScheme"]), C = g || {}, { dark: D } = C, Z = q(C, ["dark"]), J = m || {}, { dark: oe } = J, X = q(J, ["dark"]), re = O(y) ? this._toVariables({ [b]: V(V({}, y), $) }, n) : {}, ae = O(Z) ? this._toVariables({ [b]: V(V({}, Z), X) }, n) : {}, ee = O(D) ? this._toVariables({ [b]: V(V({}, D), oe) }, n) : {}, [ie, fe] = [(i = re.declarations) != null ? i : "", re.tokens || []], [le, me] = [(a = ae.declarations) != null ? a : "", ae.tokens || []], [he, G] = [(u = ee.declarations) != null ? u : "", ee.tokens || []], B = this.transformCSS(b, `${ie}${le}`, "light", "variable", n, r, l, s), se = this.transformCSS(b, he, "dark", "variable", n, r, l, s);
    d = `${B}${se}`, c = [.../* @__PURE__ */ new Set([...fe, ...me, ...G])], p = M(f, { dt: ce });
  }
  return { css: d, tokens: c, style: p };
}, getPresetC({ name: e = "", theme: t = {}, params: n, set: o, defaults: r }) {
  var l;
  let { preset: s, options: i } = t, a = (l = s?.components) == null ? void 0 : l[e];
  return this.getPreset({ name: e, preset: a, options: i, params: n, set: o, defaults: r });
}, getPresetD({ name: e = "", theme: t = {}, params: n, set: o, defaults: r }) {
  var l, s;
  let i = e.replace("-directive", ""), { preset: a, options: u } = t, d = ((l = a?.components) == null ? void 0 : l[i]) || ((s = a?.directives) == null ? void 0 : s[i]);
  return this.getPreset({ name: i, preset: d, options: u, params: n, set: o, defaults: r });
}, applyDarkColorScheme(e) {
  return !(e.darkModeSelector === "none" || e.darkModeSelector === !1);
}, getColorSchemeOption(e, t) {
  var n;
  return this.applyDarkColorScheme(e) ? this.regex.resolve(e.darkModeSelector === !0 ? t.options.darkModeSelector : (n = e.darkModeSelector) != null ? n : t.options.darkModeSelector) : [];
}, getLayerOrder(e, t = {}, n, o) {
  let { cssLayer: r } = t;
  return r ? `@layer ${M(r.order || r.name || "primeui", n)}` : "";
}, getCommonStyleSheet({ name: e = "", theme: t = {}, params: n, props: o = {}, set: r, defaults: l }) {
  let s = this.getCommon({ name: e, theme: t, params: n, set: r, defaults: l }), i = Object.entries(o).reduce((a, [u, d]) => a.push(`${u}="${d}"`) && a, []).join(" ");
  return Object.entries(s || {}).reduce((a, [u, d]) => {
    if (K(d) && Object.hasOwn(d, "css")) {
      let c = Oe(d.css), p = `${u}-variables`;
      a.push(`<style type="text/css" data-primevue-style-id="${p}" ${i}>${c}</style>`);
    }
    return a;
  }, []).join("");
}, getStyleSheet({ name: e = "", theme: t = {}, params: n, props: o = {}, set: r, defaults: l }) {
  var s;
  let i = { name: e, theme: t, params: n, set: r, defaults: l }, a = (s = e.includes("-directive") ? this.getPresetD(i) : this.getPresetC(i)) == null ? void 0 : s.css, u = Object.entries(o).reduce((d, [c, p]) => d.push(`${c}="${p}"`) && d, []).join(" ");
  return a ? `<style type="text/css" data-primevue-style-id="${e}-variables" ${u}>${Oe(a)}</style>` : "";
}, createTokens(e = {}, t, n = "", o = "", r = {}) {
  let l = function(i, a = {}, u = []) {
    if (u.includes(this.path)) return console.warn(`Circular reference detected at ${this.path}`), { colorScheme: i, path: this.path, paths: a, value: void 0 };
    u.push(this.path), a.name = this.path, a.binding || (a.binding = {});
    let d = this.value;
    if (typeof this.value == "string" && je.test(this.value)) {
      let c = this.value.trim().replace(je, (p) => {
        var b;
        let h = p.slice(1, -1), g = this.tokens[h];
        if (!g) return console.warn(`Token not found for path: ${h}`), "__UNRESOLVED__";
        let v = g.computed(i, a, u);
        return Array.isArray(v) && v.length === 2 ? `light-dark(${v[0].value},${v[1].value})` : (b = v?.value) != null ? b : "__UNRESOLVED__";
      });
      d = pn.test(c.replace(bn, "0")) ? `calc(${c})` : c;
    }
    return pe(a.binding) && delete a.binding, u.pop(), { colorScheme: i, path: this.path, paths: a, value: d.includes("__UNRESOLVED__") ? void 0 : d };
  }, s = (i, a, u) => {
    Object.entries(i).forEach(([d, c]) => {
      let p = de(d, t.variable.excludedKeyRegex) ? a : a ? `${a}.${jt(d)}` : jt(d), b = u ? `${u}.${d}` : d;
      K(c) ? s(c, p, b) : (r[p] || (r[p] = { paths: [], computed: (h, g = {}, v = []) => {
        if (r[p].paths.length === 1) return r[p].paths[0].computed(r[p].paths[0].scheme, g.binding, v);
        if (h && h !== "none") for (let f = 0; f < r[p].paths.length; f++) {
          let y = r[p].paths[f];
          if (y.scheme === h) return y.computed(h, g.binding, v);
        }
        return r[p].paths.map((f) => f.computed(f.scheme, g[f.scheme], v));
      } }), r[p].paths.push({ path: b, value: c, scheme: b.includes("colorScheme.light") ? "light" : b.includes("colorScheme.dark") ? "dark" : "none", computed: l, tokens: r }));
    });
  };
  return s(e, n, o), r;
}, getTokenValue(e, t, n) {
  var o;
  let r = ((i) => i.split(".").filter((a) => !de(a.toLowerCase(), n.variable.excludedKeyRegex)).join("."))(t), l = t.includes("colorScheme.light") ? "light" : t.includes("colorScheme.dark") ? "dark" : void 0, s = [(o = e[r]) == null ? void 0 : o.computed(l)].flat().filter((i) => i);
  return s.length === 1 ? s[0].value : s.reduce((i = {}, a) => {
    let u = a, { colorScheme: d } = u, c = q(u, ["colorScheme"]);
    return i[d] = c, i;
  }, void 0);
}, getSelectorRule(e, t, n, o) {
  return n === "class" || n === "attr" ? ye(O(t) ? `${e}${t},${e} ${t}` : e, o) : ye(e, ye(t ?? ":root,:host", o));
}, transformCSS(e, t, n, o, r = {}, l, s, i) {
  if (O(t)) {
    let { cssLayer: a } = r;
    if (o !== "style") {
      let u = this.getColorSchemeOption(r, s);
      t = n === "dark" ? u.reduce((d, { type: c, selector: p }) => (O(p) && (d += p.includes("[CSS]") ? p.replace("[CSS]", t) : this.getSelectorRule(p, i, c, t)), d), "") : ye(i ?? ":root,:host", t);
    }
    if (a) {
      let u = { name: "primeui" };
      K(a) && (u.name = M(a.name, { name: e, type: o })), O(u.name) && (t = ye(`@layer ${u.name}`, t), l?.layerNames(u.name));
    }
    return t;
  }
  return "";
} }, w = { defaults: { variable: { prefix: "p", selector: ":root,:host", excludedKeyRegex: /^(primitive|semantic|components|directives|variables|colorscheme|light|dark|common|root|states|extend|css)$/gi }, options: { prefix: "p", darkModeSelector: "system", cssLayer: !1 } }, _theme: void 0, _layerNames: /* @__PURE__ */ new Set(), _loadedStyleNames: /* @__PURE__ */ new Set(), _loadingStyles: /* @__PURE__ */ new Set(), _tokens: {}, update(e = {}) {
  let { theme: t } = e;
  t && (this._theme = Je(V({}, t), { options: V(V({}, this.defaults.options), t.options) }), this._tokens = R.createTokens(this.preset, this.defaults), this.clearLoadedStyleNames());
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
  this._theme = Je(V({}, this.theme), { preset: e }), this._tokens = R.createTokens(e, this.defaults), this.clearLoadedStyleNames(), j.emit("preset:change", e), j.emit("theme:change", this.theme);
}, getOptions() {
  return this.options;
}, setOptions(e) {
  this._theme = Je(V({}, this.theme), { options: e }), this.clearLoadedStyleNames(), j.emit("options:change", e), j.emit("theme:change", this.theme);
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
  return R.getTokenValue(this.tokens, e, this.defaults);
}, getCommon(e = "", t) {
  return R.getCommon({ name: e, theme: this.theme, params: t, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } });
}, getComponent(e = "", t) {
  let n = { name: e, theme: this.theme, params: t, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } };
  return R.getPresetC(n);
}, getDirective(e = "", t) {
  let n = { name: e, theme: this.theme, params: t, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } };
  return R.getPresetD(n);
}, getCustomPreset(e = "", t, n, o) {
  let r = { name: e, preset: t, options: this.options, selector: n, params: o, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } };
  return R.getPreset(r);
}, getLayerOrderCSS(e = "") {
  return R.getLayerOrder(e, this.options, { names: this.getLayerNames() }, this.defaults);
}, transformCSS(e = "", t, n = "style", o) {
  return R.transformCSS(e, t, o, n, this.options, { layerNames: this.setLayerNames.bind(this) }, this.defaults);
}, getCommonStyleSheet(e = "", t, n = {}) {
  return R.getCommonStyleSheet({ name: e, theme: this.theme, params: t, props: n, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } });
}, getStyleSheet(e, t, n = {}) {
  return R.getStyleSheet({ name: e, theme: this.theme, params: t, props: n, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } });
}, onStyleMounted(e) {
  this._loadingStyles.add(e);
}, onStyleUpdated(e) {
  this._loadingStyles.add(e);
}, onStyleLoaded(e, { name: t }) {
  this._loadingStyles.size && (this._loadingStyles.delete(t), j.emit(`theme:${t}:load`, e), !this._loadingStyles.size && j.emit("theme:load"));
} }, A = {
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
}, Ro = `
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
function Ae(e) {
  "@babel/helpers - typeof";
  return Ae = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, Ae(e);
}
function At(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(e);
    t && (o = o.filter(function(r) {
      return Object.getOwnPropertyDescriptor(e, r).enumerable;
    })), n.push.apply(n, o);
  }
  return n;
}
function Lt(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? At(Object(n), !0).forEach(function(o) {
      Vo(e, o, n[o]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : At(Object(n)).forEach(function(o) {
      Object.defineProperty(e, o, Object.getOwnPropertyDescriptor(n, o));
    });
  }
  return e;
}
function Vo(e, t, n) {
  return (t = Bo(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Bo(e) {
  var t = Uo(e, "string");
  return Ae(t) == "symbol" ? t : t + "";
}
function Uo(e, t) {
  if (Ae(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(e, t);
    if (Ae(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
function zo(e) {
  var t = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0;
  gt() && gt().components ? Hn(e) : t ? e() : Fn(e);
}
var Wo = 0;
function Ho(e) {
  var t = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, n = W(!1), o = W(e), r = W(null), l = un() ? window.document : void 0, s = t.document, i = s === void 0 ? l : s, a = t.immediate, u = a === void 0 ? !0 : a, d = t.manual, c = d === void 0 ? !1 : d, p = t.name, b = p === void 0 ? "style_".concat(++Wo) : p, h = t.id, g = h === void 0 ? void 0 : h, v = t.media, f = v === void 0 ? void 0 : v, y = t.nonce, T = y === void 0 ? void 0 : y, m = t.first, $ = m === void 0 ? !1 : m, C = t.onMounted, D = C === void 0 ? void 0 : C, Z = t.onUpdated, J = Z === void 0 ? void 0 : Z, oe = t.onLoad, X = oe === void 0 ? void 0 : oe, re = t.props, ae = re === void 0 ? {} : re, ee = function() {
  }, ie = function(me) {
    var he = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    if (i) {
      var G = Lt(Lt({}, ae), he), B = G.name || b, se = G.id || g, Ue = G.nonce || T;
      r.value = i.querySelector('style[data-primevue-style-id="'.concat(B, '"]')) || i.getElementById(se) || i.createElement("style"), r.value.isConnected || (o.value = me || e, Ye(r.value, {
        type: "text/css",
        id: se,
        media: f,
        nonce: Ue
      }), $ ? i.head.prepend(r.value) : i.head.appendChild(r.value), Oo(r.value, "data-primevue-style-id", B), Ye(r.value, G), r.value.onload = function(ve) {
        return X?.(ve, {
          name: B
        });
      }, D?.(B)), !n.value && (ee = _e(o, function(ve) {
        r.value.textContent = ve, J?.(B);
      }, {
        immediate: !0
      }), n.value = !0);
    }
  }, fe = function() {
    !i || !n.value || (ee(), So(r.value) && i.head.removeChild(r.value), n.value = !1, r.value = null);
  };
  return u && !c && zo(ie), {
    id: g,
    name: b,
    el: r,
    css: o,
    unload: fe,
    load: ie,
    isLoaded: Wn(n)
  };
}
function Le(e) {
  "@babel/helpers - typeof";
  return Le = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, Le(e);
}
var Nt, Et, It, Mt;
function Dt(e, t) {
  return Yo(e) || Go(e, t) || Ko(e, t) || Fo();
}
function Fo() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Ko(e, t) {
  if (e) {
    if (typeof e == "string") return Rt(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Rt(e, t) : void 0;
  }
}
function Rt(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, o = Array(t); n < t; n++) o[n] = e[n];
  return o;
}
function Go(e, t) {
  var n = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (n != null) {
    var o, r, l, s, i = [], a = !0, u = !1;
    try {
      if (l = (n = n.call(e)).next, t !== 0) for (; !(a = (o = l.call(n)).done) && (i.push(o.value), i.length !== t); a = !0) ;
    } catch (d) {
      u = !0, r = d;
    } finally {
      try {
        if (!a && n.return != null && (s = n.return(), Object(s) !== s)) return;
      } finally {
        if (u) throw r;
      }
    }
    return i;
  }
}
function Yo(e) {
  if (Array.isArray(e)) return e;
}
function Vt(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(e);
    t && (o = o.filter(function(r) {
      return Object.getOwnPropertyDescriptor(e, r).enumerable;
    })), n.push.apply(n, o);
  }
  return n;
}
function Xe(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? Vt(Object(n), !0).forEach(function(o) {
      qo(e, o, n[o]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Vt(Object(n)).forEach(function(o) {
      Object.defineProperty(e, o, Object.getOwnPropertyDescriptor(n, o));
    });
  }
  return e;
}
function qo(e, t, n) {
  return (t = Qo(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Qo(e) {
  var t = Zo(e, "string");
  return Le(t) == "symbol" ? t : t + "";
}
function Zo(e, t) {
  if (Le(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(e, t);
    if (Le(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
function He(e, t) {
  return t || (t = e.slice(0)), Object.freeze(Object.defineProperties(e, { raw: { value: Object.freeze(t) } }));
}
var Jo = function(t) {
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
}, Xo = {}, er = {}, x = {
  name: "base",
  css: Jo,
  style: Ro,
  classes: Xo,
  inlineStyles: er,
  load: function(t) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, o = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : function(l) {
      return l;
    }, r = o(We(Nt || (Nt = He(["", ""])), t));
    return O(r) ? Ho(Oe(r), Xe({
      name: this.name
    }, n)) : {};
  },
  loadCSS: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    return this.load(this.css, t);
  },
  loadStyle: function() {
    var t = this, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, o = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "";
    return this.load(this.style, n, function() {
      var r = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "";
      return w.transformCSS(n.name || t.name, "".concat(r).concat(We(Et || (Et = He(["", ""])), o)));
    });
  },
  getCommonTheme: function(t) {
    return w.getCommon(this.name, t);
  },
  getComponentTheme: function(t) {
    return w.getComponent(this.name, t);
  },
  getDirectiveTheme: function(t) {
    return w.getDirective(this.name, t);
  },
  getPresetTheme: function(t, n, o) {
    return w.getCustomPreset(this.name, t, n, o);
  },
  getLayerOrderThemeCSS: function() {
    return w.getLayerOrderCSS(this.name);
  },
  getStyleSheet: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    if (this.css) {
      var o = M(this.css, {
        dt: ce
      }) || "", r = Oe(We(It || (It = He(["", "", ""])), o, t)), l = Object.entries(n).reduce(function(s, i) {
        var a = Dt(i, 2), u = a[0], d = a[1];
        return s.push("".concat(u, '="').concat(d, '"')) && s;
      }, []).join(" ");
      return O(r) ? '<style type="text/css" data-primevue-style-id="'.concat(this.name, '" ').concat(l, ">").concat(r, "</style>") : "";
    }
    return "";
  },
  getCommonThemeStyleSheet: function(t) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    return w.getCommonStyleSheet(this.name, t, n);
  },
  getThemeStyleSheet: function(t) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, o = [w.getStyleSheet(this.name, t, n)];
    if (this.style) {
      var r = this.name === "base" ? "global-style" : "".concat(this.name, "-style"), l = We(Mt || (Mt = He(["", ""])), M(this.style, {
        dt: ce
      })), s = Oe(w.transformCSS(r, l)), i = Object.entries(n).reduce(function(a, u) {
        var d = Dt(u, 2), c = d[0], p = d[1];
        return a.push("".concat(c, '="').concat(p, '"')) && a;
      }, []).join(" ");
      O(s) && o.push('<style type="text/css" data-primevue-style-id="'.concat(r, '" ').concat(i, ">").concat(s, "</style>"));
    }
    return o.join("");
  },
  extend: function(t) {
    return Xe(Xe({}, this), {}, {
      css: void 0,
      style: void 0
    }, t);
  }
}, ne = ln();
function Ne(e) {
  "@babel/helpers - typeof";
  return Ne = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, Ne(e);
}
function Bt(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(e);
    t && (o = o.filter(function(r) {
      return Object.getOwnPropertyDescriptor(e, r).enumerable;
    })), n.push.apply(n, o);
  }
  return n;
}
function Fe(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? Bt(Object(n), !0).forEach(function(o) {
      tr(e, o, n[o]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Bt(Object(n)).forEach(function(o) {
      Object.defineProperty(e, o, Object.getOwnPropertyDescriptor(n, o));
    });
  }
  return e;
}
function tr(e, t, n) {
  return (t = nr(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function nr(e) {
  var t = or(e, "string");
  return Ne(t) == "symbol" ? t : t + "";
}
function or(e, t) {
  if (Ne(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(e, t);
    if (Ne(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var rr = {
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
    text: [A.STARTS_WITH, A.CONTAINS, A.NOT_CONTAINS, A.ENDS_WITH, A.EQUALS, A.NOT_EQUALS],
    numeric: [A.EQUALS, A.NOT_EQUALS, A.LESS_THAN, A.LESS_THAN_OR_EQUAL_TO, A.GREATER_THAN, A.GREATER_THAN_OR_EQUAL_TO],
    date: [A.DATE_IS, A.DATE_IS_NOT, A.DATE_BEFORE, A.DATE_AFTER]
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
}, ar = Symbol();
function ir(e, t) {
  var n = {
    config: Kn(t)
  };
  return e.config.globalProperties.$primevue = n, e.provide(ar, n), lr(), sr(e, n), n;
}
var Se = [];
function lr() {
  j.clear(), Se.forEach(function(e) {
    return e?.();
  }), Se = [];
}
function sr(e, t) {
  var n = W(!1), o = function() {
    var u;
    if (((u = t.config) === null || u === void 0 ? void 0 : u.theme) !== "none" && !w.isStyleNameLoaded("common")) {
      var d, c, p = ((d = x.getCommonTheme) === null || d === void 0 ? void 0 : d.call(x)) || {}, b = p.primitive, h = p.semantic, g = p.global, v = p.style, f = {
        nonce: (c = t.config) === null || c === void 0 || (c = c.csp) === null || c === void 0 ? void 0 : c.nonce
      };
      x.load(b?.css, Fe({
        name: "primitive-variables"
      }, f)), x.load(h?.css, Fe({
        name: "semantic-variables"
      }, f)), x.load(g?.css, Fe({
        name: "global-variables"
      }, f)), x.loadStyle(Fe({
        name: "global-style"
      }, f), v), w.setLoadedStyleName("common");
    }
  };
  j.on("theme:change", function(a) {
    n.value || (e.config.globalProperties.$primevue.config.theme = a, n.value = !0);
  });
  var r = _e(t.config, function(a, u) {
    ne.emit("config:change", {
      newValue: a,
      oldValue: u
    });
  }, {
    immediate: !0,
    deep: !0
  }), l = _e(function() {
    return t.config.ripple;
  }, function(a, u) {
    ne.emit("config:ripple:change", {
      newValue: a,
      oldValue: u
    });
  }, {
    immediate: !0,
    deep: !0
  }), s = _e(function() {
    return t.config.theme;
  }, function(a, u) {
    n.value || w.setTheme(a), t.config.unstyled || o(), n.value = !1, ne.emit("config:theme:change", {
      newValue: a,
      oldValue: u
    });
  }, {
    immediate: !0,
    deep: !1
  }), i = _e(function() {
    return t.config.unstyled;
  }, function(a, u) {
    !a && t.config.theme && o(), ne.emit("config:unstyled:change", {
      newValue: a,
      oldValue: u
    });
  }, {
    immediate: !0,
    deep: !0
  });
  Se.push(r), Se.push(l), Se.push(s), Se.push(i);
}
var ur = {
  install: function(t, n) {
    var o = fo(rr, n);
    ir(t, o);
  }
}, vn = {
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
    this.mounted = un();
  },
  computed: {
    inline: function() {
      return this.disabled || this.appendTo === "self";
    }
  }
};
function dr(e, t, n, o, r, l) {
  return l.inline ? Q(e.$slots, "default", {
    key: 0
  }) : r.mounted ? (E(), Ke(nn, {
    key: 1,
    to: n.appendTo
  }, [Q(e.$slots, "default")], 8, ["to"])) : ue("", !0);
}
vn.render = dr;
var te = {
  _loadedStyleNames: /* @__PURE__ */ new Set(),
  getLoadedStyleNames: function() {
    return this._loadedStyleNames;
  },
  isStyleNameLoaded: function(t) {
    return this._loadedStyleNames.has(t);
  },
  setLoadedStyleName: function(t) {
    this._loadedStyleNames.add(t);
  },
  deleteLoadedStyleName: function(t) {
    this._loadedStyleNames.delete(t);
  },
  clearLoadedStyleNames: function() {
    this._loadedStyleNames.clear();
  }
};
function cr() {
  var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "pc", t = Gn();
  return "".concat(e).concat(t.replace("v-", "").replaceAll("-", "_"));
}
var Ut = x.extend({
  name: "common"
});
function Ee(e) {
  "@babel/helpers - typeof";
  return Ee = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, Ee(e);
}
function pr(e) {
  return Sn(e) || br(e) || yn(e) || gn();
}
function br(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function $e(e, t) {
  return Sn(e) || fr(e, t) || yn(e, t) || gn();
}
function gn() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function yn(e, t) {
  if (e) {
    if (typeof e == "string") return at(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? at(e, t) : void 0;
  }
}
function at(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, o = Array(t); n < t; n++) o[n] = e[n];
  return o;
}
function fr(e, t) {
  var n = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (n != null) {
    var o, r, l, s, i = [], a = !0, u = !1;
    try {
      if (l = (n = n.call(e)).next, t === 0) {
        if (Object(n) !== n) return;
        a = !1;
      } else for (; !(a = (o = l.call(n)).done) && (i.push(o.value), i.length !== t); a = !0) ;
    } catch (d) {
      u = !0, r = d;
    } finally {
      try {
        if (!a && n.return != null && (s = n.return(), Object(s) !== s)) return;
      } finally {
        if (u) throw r;
      }
    }
    return i;
  }
}
function Sn(e) {
  if (Array.isArray(e)) return e;
}
function zt(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(e);
    t && (o = o.filter(function(r) {
      return Object.getOwnPropertyDescriptor(e, r).enumerable;
    })), n.push.apply(n, o);
  }
  return n;
}
function _(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? zt(Object(n), !0).forEach(function(o) {
      we(e, o, n[o]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : zt(Object(n)).forEach(function(o) {
      Object.defineProperty(e, o, Object.getOwnPropertyDescriptor(n, o));
    });
  }
  return e;
}
function we(e, t, n) {
  return (t = mr(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function mr(e) {
  var t = hr(e, "string");
  return Ee(t) == "symbol" ? t : t + "";
}
function hr(e, t) {
  if (Ee(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(e, t);
    if (Ee(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var bt = {
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
      handler: function(t) {
        j.off("theme:change", this._loadCoreStyles), t || (this._loadCoreStyles(), this._themeChangeListener(this._loadCoreStyles));
      }
    },
    dt: {
      immediate: !0,
      handler: function(t, n) {
        var o = this;
        j.off("theme:change", this._themeScopedListener), t ? (this._loadScopedThemeStyles(t), this._themeScopedListener = function() {
          return o._loadScopedThemeStyles(t);
        }, this._themeChangeListener(this._themeScopedListener)) : this._unloadScopedThemeStyles();
      }
    }
  },
  scopedStyleEl: void 0,
  rootEl: void 0,
  uid: void 0,
  $attrSelector: void 0,
  beforeCreate: function() {
    var t, n, o, r, l, s, i, a, u, d, c, p = (t = this.pt) === null || t === void 0 ? void 0 : t._usept, b = p ? (n = this.pt) === null || n === void 0 || (n = n.originalValue) === null || n === void 0 ? void 0 : n[this.$.type.name] : void 0, h = p ? (o = this.pt) === null || o === void 0 || (o = o.value) === null || o === void 0 ? void 0 : o[this.$.type.name] : this.pt;
    (r = h || b) === null || r === void 0 || (r = r.hooks) === null || r === void 0 || (l = r.onBeforeCreate) === null || l === void 0 || l.call(r);
    var g = (s = this.$primevueConfig) === null || s === void 0 || (s = s.pt) === null || s === void 0 ? void 0 : s._usept, v = g ? (i = this.$primevue) === null || i === void 0 || (i = i.config) === null || i === void 0 || (i = i.pt) === null || i === void 0 ? void 0 : i.originalValue : void 0, f = g ? (a = this.$primevue) === null || a === void 0 || (a = a.config) === null || a === void 0 || (a = a.pt) === null || a === void 0 ? void 0 : a.value : (u = this.$primevue) === null || u === void 0 || (u = u.config) === null || u === void 0 ? void 0 : u.pt;
    (d = f || v) === null || d === void 0 || (d = d[this.$.type.name]) === null || d === void 0 || (d = d.hooks) === null || d === void 0 || (c = d.onBeforeCreate) === null || c === void 0 || c.call(d), this.$attrSelector = cr(), this.uid = this.$attrs.id || this.$attrSelector.replace("pc", "pv_id_");
  },
  created: function() {
    this._hook("onCreated");
  },
  beforeMount: function() {
    var t;
    this.rootEl = ko(be(this.$el) ? this.$el : (t = this.$el) === null || t === void 0 ? void 0 : t.parentElement, "[".concat(this.$attrSelector, "]")), this.rootEl && (this.rootEl.$pc = _({
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
    _hook: function(t) {
      if (!this.$options.hostName) {
        var n = this._usePT(this._getPT(this.pt, this.$.type.name), this._getOptionValue, "hooks.".concat(t)), o = this._useDefaultPT(this._getOptionValue, "hooks.".concat(t));
        n?.(), o?.();
      }
    },
    _mergeProps: function(t) {
      for (var n = arguments.length, o = new Array(n > 1 ? n - 1 : 0), r = 1; r < n; r++)
        o[r - 1] = arguments[r];
      return ct(t) ? t.apply(void 0, o) : N.apply(void 0, o);
    },
    _load: function() {
      te.isStyleNameLoaded("base") || (x.loadCSS(this.$styleOptions), this._loadGlobalStyles(), te.setLoadedStyleName("base")), this._loadThemeStyles();
    },
    _loadStyles: function() {
      this._load(), this._themeChangeListener(this._load);
    },
    _loadCoreStyles: function() {
      var t, n;
      !te.isStyleNameLoaded((t = this.$style) === null || t === void 0 ? void 0 : t.name) && (n = this.$style) !== null && n !== void 0 && n.name && (Ut.loadCSS(this.$styleOptions), this.$options.style && this.$style.loadCSS(this.$styleOptions), te.setLoadedStyleName(this.$style.name));
    },
    _loadGlobalStyles: function() {
      var t = this._useGlobalPT(this._getOptionValue, "global.css", this.$params);
      O(t) && x.load(t, _({
        name: "global"
      }, this.$styleOptions));
    },
    _loadThemeStyles: function() {
      var t, n;
      if (!(this.isUnstyled || this.$theme === "none")) {
        if (!w.isStyleNameLoaded("common")) {
          var o, r, l = ((o = this.$style) === null || o === void 0 || (r = o.getCommonTheme) === null || r === void 0 ? void 0 : r.call(o)) || {}, s = l.primitive, i = l.semantic, a = l.global, u = l.style;
          x.load(s?.css, _({
            name: "primitive-variables"
          }, this.$styleOptions)), x.load(i?.css, _({
            name: "semantic-variables"
          }, this.$styleOptions)), x.load(a?.css, _({
            name: "global-variables"
          }, this.$styleOptions)), x.loadStyle(_({
            name: "global-style"
          }, this.$styleOptions), u), w.setLoadedStyleName("common");
        }
        if (!w.isStyleNameLoaded((t = this.$style) === null || t === void 0 ? void 0 : t.name) && (n = this.$style) !== null && n !== void 0 && n.name) {
          var d, c, p, b, h = ((d = this.$style) === null || d === void 0 || (c = d.getComponentTheme) === null || c === void 0 ? void 0 : c.call(d)) || {}, g = h.css, v = h.style;
          (p = this.$style) === null || p === void 0 || p.load(g, _({
            name: "".concat(this.$style.name, "-variables")
          }, this.$styleOptions)), (b = this.$style) === null || b === void 0 || b.loadStyle(_({
            name: "".concat(this.$style.name, "-style")
          }, this.$styleOptions), v), w.setLoadedStyleName(this.$style.name);
        }
        if (!w.isStyleNameLoaded("layer-order")) {
          var f, y, T = (f = this.$style) === null || f === void 0 || (y = f.getLayerOrderThemeCSS) === null || y === void 0 ? void 0 : y.call(f);
          x.load(T, _({
            name: "layer-order",
            first: !0
          }, this.$styleOptions)), w.setLoadedStyleName("layer-order");
        }
      }
    },
    _loadScopedThemeStyles: function(t) {
      var n, o, r, l = ((n = this.$style) === null || n === void 0 || (o = n.getPresetTheme) === null || o === void 0 ? void 0 : o.call(n, t, "[".concat(this.$attrSelector, "]"))) || {}, s = l.css, i = (r = this.$style) === null || r === void 0 ? void 0 : r.load(s, _({
        name: "".concat(this.$attrSelector, "-").concat(this.$style.name)
      }, this.$styleOptions));
      this.scopedStyleEl = i.el;
    },
    _unloadScopedThemeStyles: function() {
      var t;
      (t = this.scopedStyleEl) === null || t === void 0 || (t = t.value) === null || t === void 0 || t.remove();
    },
    _themeChangeListener: function() {
      var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : function() {
      };
      te.clearLoadedStyleNames(), j.on("theme:change", t);
    },
    _removeThemeListeners: function() {
      j.off("theme:change", this._loadCoreStyles), j.off("theme:change", this._load), j.off("theme:change", this._themeScopedListener);
    },
    _getHostInstance: function(t) {
      return t ? this.$options.hostName ? t.$.type.name === this.$options.hostName ? t : this._getHostInstance(t.$parentInstance) : t.$parentInstance : void 0;
    },
    _getPropValue: function(t) {
      var n;
      return this[t] || ((n = this._getHostInstance(this)) === null || n === void 0 ? void 0 : n[t]);
    },
    _getOptionValue: function(t) {
      var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", o = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
      return pt(t, n, o);
    },
    _getPTValue: function() {
      var t, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, o = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", r = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {}, l = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : !0, s = /./g.test(o) && !!r[o.split(".")[0]], i = this._getPropValue("ptOptions") || ((t = this.$primevueConfig) === null || t === void 0 ? void 0 : t.ptOptions) || {}, a = i.mergeSections, u = a === void 0 ? !0 : a, d = i.mergeProps, c = d === void 0 ? !1 : d, p = l ? s ? this._useGlobalPT(this._getPTClassValue, o, r) : this._useDefaultPT(this._getPTClassValue, o, r) : void 0, b = s ? void 0 : this._getPTSelf(n, this._getPTClassValue, o, _(_({}, r), {}, {
        global: p || {}
      })), h = this._getPTDatasets(o);
      return u || !u && b ? c ? this._mergeProps(c, p, b, h) : _(_(_({}, p), b), h) : _(_({}, b), h);
    },
    _getPTSelf: function() {
      for (var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length, o = new Array(n > 1 ? n - 1 : 0), r = 1; r < n; r++)
        o[r - 1] = arguments[r];
      return N(
        this._usePT.apply(this, [this._getPT(t, this.$name)].concat(o)),
        // Exp; <component :pt="{}"
        this._usePT.apply(this, [this.$_attrsPT].concat(o))
        // Exp; <component :pt:[passthrough_key]:[attribute]="{value}" or <component :pt:[passthrough_key]="() =>{value}"
      );
    },
    _getPTDatasets: function() {
      var t, n, o = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", r = "data-pc-", l = o === "root" && O((t = this.pt) === null || t === void 0 ? void 0 : t["data-pc-section"]);
      return o !== "transition" && _(_({}, o === "root" && _(_(we({}, "".concat(r, "name"), F(l ? (n = this.pt) === null || n === void 0 ? void 0 : n["data-pc-section"] : this.$.type.name)), l && we({}, "".concat(r, "extend"), F(this.$.type.name))), {}, we({}, "".concat(this.$attrSelector), ""))), {}, we({}, "".concat(r, "section"), F(o)));
    },
    _getPTClassValue: function() {
      var t = this._getOptionValue.apply(this, arguments);
      return I(t) || rn(t) ? {
        class: t
      } : t;
    },
    _getPT: function(t) {
      var n = this, o = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", r = arguments.length > 2 ? arguments[2] : void 0, l = function(i) {
        var a, u = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1, d = r ? r(i) : i, c = F(o), p = F(n.$name);
        return (a = u ? c !== p ? d?.[c] : void 0 : d?.[c]) !== null && a !== void 0 ? a : d;
      };
      return t != null && t.hasOwnProperty("_usept") ? {
        _usept: t._usept,
        originalValue: l(t.originalValue),
        value: l(t.value)
      } : l(t, !0);
    },
    _usePT: function(t, n, o, r) {
      var l = function(g) {
        return n(g, o, r);
      };
      if (t != null && t.hasOwnProperty("_usept")) {
        var s, i = t._usept || ((s = this.$primevueConfig) === null || s === void 0 ? void 0 : s.ptOptions) || {}, a = i.mergeSections, u = a === void 0 ? !0 : a, d = i.mergeProps, c = d === void 0 ? !1 : d, p = l(t.originalValue), b = l(t.value);
        return p === void 0 && b === void 0 ? void 0 : I(b) ? b : I(p) ? p : u || !u && b ? c ? this._mergeProps(c, p, b) : _(_({}, p), b) : b;
      }
      return l(t);
    },
    _useGlobalPT: function(t, n, o) {
      return this._usePT(this.globalPT, t, n, o);
    },
    _useDefaultPT: function(t, n, o) {
      return this._usePT(this.defaultPT, t, n, o);
    },
    ptm: function() {
      var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
      return this._getPTValue(this.pt, t, _(_({}, this.$params), n));
    },
    ptmi: function() {
      var t, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", o = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, r = N(this.$_attrsWithoutPT, this.ptm(n, o));
      return r?.hasOwnProperty("id") && ((t = r.id) !== null && t !== void 0 || (r.id = this.$id)), r;
    },
    ptmo: function() {
      var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", o = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
      return this._getPTValue(t, n, _({
        instance: this
      }, o), !1);
    },
    cx: function() {
      var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
      return this.isUnstyled ? void 0 : this._getOptionValue(this.$style.classes, t, _(_({}, this.$params), n));
    },
    sx: function() {
      var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0, o = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
      if (n) {
        var r = this._getOptionValue(this.$style.inlineStyles, t, _(_({}, this.$params), o)), l = this._getOptionValue(Ut.inlineStyles, t, _(_({}, this.$params), o));
        return [l, r];
      }
    }
  },
  computed: {
    globalPT: function() {
      var t, n = this;
      return this._getPT((t = this.$primevueConfig) === null || t === void 0 ? void 0 : t.pt, void 0, function(o) {
        return M(o, {
          instance: n
        });
      });
    },
    defaultPT: function() {
      var t, n = this;
      return this._getPT((t = this.$primevueConfig) === null || t === void 0 ? void 0 : t.pt, void 0, function(o) {
        return n._getOptionValue(o, n.$name, _({}, n.$params)) || M(o, _({}, n.$params));
      });
    },
    isUnstyled: function() {
      var t;
      return this.unstyled !== void 0 ? this.unstyled : (t = this.$primevueConfig) === null || t === void 0 ? void 0 : t.unstyled;
    },
    $id: function() {
      return this.$attrs.id || this.uid;
    },
    $inProps: function() {
      var t, n = Object.keys(((t = this.$.vnode) === null || t === void 0 ? void 0 : t.props) || {});
      return Object.fromEntries(Object.entries(this.$props).filter(function(o) {
        var r = $e(o, 1), l = r[0];
        return n?.includes(l);
      }));
    },
    $theme: function() {
      var t;
      return (t = this.$primevueConfig) === null || t === void 0 ? void 0 : t.theme;
    },
    $style: function() {
      return _(_({
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
      var t;
      return {
        nonce: (t = this.$primevueConfig) === null || t === void 0 || (t = t.csp) === null || t === void 0 ? void 0 : t.nonce
      };
    },
    $primevueConfig: function() {
      var t;
      return (t = this.$primevue) === null || t === void 0 ? void 0 : t.config;
    },
    $name: function() {
      return this.$options.hostName || this.$.type.name;
    },
    $params: function() {
      var t = this._getHostInstance(this) || this.$parent;
      return {
        instance: this,
        props: this.$props,
        state: this.$data,
        attrs: this.$attrs,
        parent: {
          instance: t,
          props: t?.$props,
          state: t?.$data,
          attrs: t?.$attrs
        }
      };
    },
    $_attrsPT: function() {
      return Object.entries(this.$attrs || {}).filter(function(t) {
        var n = $e(t, 1), o = n[0];
        return o?.startsWith("pt:");
      }).reduce(function(t, n) {
        var o = $e(n, 2), r = o[0], l = o[1], s = r.split(":"), i = pr(s), a = at(i).slice(1);
        return a?.reduce(function(u, d, c, p) {
          return !u[d] && (u[d] = c === p.length - 1 ? l : {}), u[d];
        }, t), t;
      }, {});
    },
    $_attrsWithoutPT: function() {
      return Object.entries(this.$attrs || {}).filter(function(t) {
        var n = $e(t, 1), o = n[0];
        return !(o != null && o.startsWith("pt:"));
      }).reduce(function(t, n) {
        var o = $e(n, 2), r = o[0], l = o[1];
        return t[r] = l, t;
      }, {});
    }
  }
}, vr = `
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
`, gr = x.extend({
  name: "baseicon",
  css: vr
});
function Ie(e) {
  "@babel/helpers - typeof";
  return Ie = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, Ie(e);
}
function Wt(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(e);
    t && (o = o.filter(function(r) {
      return Object.getOwnPropertyDescriptor(e, r).enumerable;
    })), n.push.apply(n, o);
  }
  return n;
}
function Ht(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? Wt(Object(n), !0).forEach(function(o) {
      yr(e, o, n[o]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Wt(Object(n)).forEach(function(o) {
      Object.defineProperty(e, o, Object.getOwnPropertyDescriptor(n, o));
    });
  }
  return e;
}
function yr(e, t, n) {
  return (t = Sr(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Sr(e) {
  var t = $r(e, "string");
  return Ie(t) == "symbol" ? t : t + "";
}
function $r(e, t) {
  if (Ie(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(e, t);
    if (Ie(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var _r = {
  name: "BaseIcon",
  extends: bt,
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
  style: gr,
  provide: function() {
    return {
      $pcIcon: this,
      $parentInstance: this
    };
  },
  methods: {
    pti: function() {
      var t = pe(this.label);
      return Ht(Ht({}, !this.isUnstyled && {
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
function Me(e) {
  "@babel/helpers - typeof";
  return Me = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, Me(e);
}
function Ft(e, t) {
  return Tr(e) || Pr(e, t) || wr(e, t) || kr();
}
function kr() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function wr(e, t) {
  if (e) {
    if (typeof e == "string") return Kt(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Kt(e, t) : void 0;
  }
}
function Kt(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, o = Array(t); n < t; n++) o[n] = e[n];
  return o;
}
function Pr(e, t) {
  var n = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (n != null) {
    var o, r, l, s, i = [], a = !0, u = !1;
    try {
      if (l = (n = n.call(e)).next, t !== 0) for (; !(a = (o = l.call(n)).done) && (i.push(o.value), i.length !== t); a = !0) ;
    } catch (d) {
      u = !0, r = d;
    } finally {
      try {
        if (!a && n.return != null && (s = n.return(), Object(s) !== s)) return;
      } finally {
        if (u) throw r;
      }
    }
    return i;
  }
}
function Tr(e) {
  if (Array.isArray(e)) return e;
}
function Gt(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(e);
    t && (o = o.filter(function(r) {
      return Object.getOwnPropertyDescriptor(e, r).enumerable;
    })), n.push.apply(n, o);
  }
  return n;
}
function k(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? Gt(Object(n), !0).forEach(function(o) {
      it(e, o, n[o]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Gt(Object(n)).forEach(function(o) {
      Object.defineProperty(e, o, Object.getOwnPropertyDescriptor(n, o));
    });
  }
  return e;
}
function it(e, t, n) {
  return (t = Or(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Or(e) {
  var t = xr(e, "string");
  return Me(t) == "symbol" ? t : t + "";
}
function xr(e, t) {
  if (Me(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(e, t);
    if (Me(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var S = {
  _getMeta: function() {
    return [K(arguments.length <= 0 ? void 0 : arguments[0]) || arguments.length <= 0 ? void 0 : arguments[0], M(K(arguments.length <= 0 ? void 0 : arguments[0]) ? arguments.length <= 0 ? void 0 : arguments[0] : arguments.length <= 1 ? void 0 : arguments[1])];
  },
  _getConfig: function(t, n) {
    var o, r, l;
    return (o = (t == null || (r = t.instance) === null || r === void 0 ? void 0 : r.$primevue) || (n == null || (l = n.ctx) === null || l === void 0 || (l = l.appContext) === null || l === void 0 || (l = l.config) === null || l === void 0 || (l = l.globalProperties) === null || l === void 0 ? void 0 : l.$primevue)) === null || o === void 0 ? void 0 : o.config;
  },
  _getOptionValue: pt,
  _getPTValue: function() {
    var t, n, o = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, l = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : "", s = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : {}, i = arguments.length > 4 && arguments[4] !== void 0 ? arguments[4] : !0, a = function() {
      var y = S._getOptionValue.apply(S, arguments);
      return I(y) || rn(y) ? {
        class: y
      } : y;
    }, u = ((t = o.binding) === null || t === void 0 || (t = t.value) === null || t === void 0 ? void 0 : t.ptOptions) || ((n = o.$primevueConfig) === null || n === void 0 ? void 0 : n.ptOptions) || {}, d = u.mergeSections, c = d === void 0 ? !0 : d, p = u.mergeProps, b = p === void 0 ? !1 : p, h = i ? S._useDefaultPT(o, o.defaultPT(), a, l, s) : void 0, g = S._usePT(o, S._getPT(r, o.$name), a, l, k(k({}, s), {}, {
      global: h || {}
    })), v = S._getPTDatasets(o, l);
    return c || !c && g ? b ? S._mergeProps(o, b, h, g, v) : k(k(k({}, h), g), v) : k(k({}, g), v);
  },
  _getPTDatasets: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", o = "data-pc-";
    return k(k({}, n === "root" && it({}, "".concat(o, "name"), F(t.$name))), {}, it({}, "".concat(o, "section"), F(n)));
  },
  _getPT: function(t) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", o = arguments.length > 2 ? arguments[2] : void 0, r = function(s) {
      var i, a = o ? o(s) : s, u = F(n);
      return (i = a?.[u]) !== null && i !== void 0 ? i : a;
    };
    return t && Object.hasOwn(t, "_usept") ? {
      _usept: t._usept,
      originalValue: r(t.originalValue),
      value: r(t.value)
    } : r(t);
  },
  _usePT: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 ? arguments[1] : void 0, o = arguments.length > 2 ? arguments[2] : void 0, r = arguments.length > 3 ? arguments[3] : void 0, l = arguments.length > 4 ? arguments[4] : void 0, s = function(v) {
      return o(v, r, l);
    };
    if (n && Object.hasOwn(n, "_usept")) {
      var i, a = n._usept || ((i = t.$primevueConfig) === null || i === void 0 ? void 0 : i.ptOptions) || {}, u = a.mergeSections, d = u === void 0 ? !0 : u, c = a.mergeProps, p = c === void 0 ? !1 : c, b = s(n.originalValue), h = s(n.value);
      return b === void 0 && h === void 0 ? void 0 : I(h) ? h : I(b) ? b : d || !d && h ? p ? S._mergeProps(t, p, b, h) : k(k({}, b), h) : h;
    }
    return s(n);
  },
  _useDefaultPT: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, o = arguments.length > 2 ? arguments[2] : void 0, r = arguments.length > 3 ? arguments[3] : void 0, l = arguments.length > 4 ? arguments[4] : void 0;
    return S._usePT(t, n, o, r, l);
  },
  _loadStyles: function() {
    var t, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, o = arguments.length > 1 ? arguments[1] : void 0, r = arguments.length > 2 ? arguments[2] : void 0, l = S._getConfig(o, r), s = {
      nonce: l == null || (t = l.csp) === null || t === void 0 ? void 0 : t.nonce
    };
    S._loadCoreStyles(n, s), S._loadThemeStyles(n, s), S._loadScopedThemeStyles(n, s), S._removeThemeListeners(n), n.$loadStyles = function() {
      return S._loadThemeStyles(n, s);
    }, S._themeChangeListener(n.$loadStyles);
  },
  _loadCoreStyles: function() {
    var t, n, o = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, r = arguments.length > 1 ? arguments[1] : void 0;
    if (!te.isStyleNameLoaded((t = o.$style) === null || t === void 0 ? void 0 : t.name) && (n = o.$style) !== null && n !== void 0 && n.name) {
      var l;
      x.loadCSS(r), (l = o.$style) === null || l === void 0 || l.loadCSS(r), te.setLoadedStyleName(o.$style.name);
    }
  },
  _loadThemeStyles: function() {
    var t, n, o, r = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, l = arguments.length > 1 ? arguments[1] : void 0;
    if (!(r != null && r.isUnstyled() || (r == null || (t = r.theme) === null || t === void 0 ? void 0 : t.call(r)) === "none")) {
      if (!w.isStyleNameLoaded("common")) {
        var s, i, a = ((s = r.$style) === null || s === void 0 || (i = s.getCommonTheme) === null || i === void 0 ? void 0 : i.call(s)) || {}, u = a.primitive, d = a.semantic, c = a.global, p = a.style;
        x.load(u?.css, k({
          name: "primitive-variables"
        }, l)), x.load(d?.css, k({
          name: "semantic-variables"
        }, l)), x.load(c?.css, k({
          name: "global-variables"
        }, l)), x.loadStyle(k({
          name: "global-style"
        }, l), p), w.setLoadedStyleName("common");
      }
      if (!w.isStyleNameLoaded((n = r.$style) === null || n === void 0 ? void 0 : n.name) && (o = r.$style) !== null && o !== void 0 && o.name) {
        var b, h, g, v, f = ((b = r.$style) === null || b === void 0 || (h = b.getDirectiveTheme) === null || h === void 0 ? void 0 : h.call(b)) || {}, y = f.css, T = f.style;
        (g = r.$style) === null || g === void 0 || g.load(y, k({
          name: "".concat(r.$style.name, "-variables")
        }, l)), (v = r.$style) === null || v === void 0 || v.loadStyle(k({
          name: "".concat(r.$style.name, "-style")
        }, l), T), w.setLoadedStyleName(r.$style.name);
      }
      if (!w.isStyleNameLoaded("layer-order")) {
        var m, $, C = (m = r.$style) === null || m === void 0 || ($ = m.getLayerOrderThemeCSS) === null || $ === void 0 ? void 0 : $.call(m);
        x.load(C, k({
          name: "layer-order",
          first: !0
        }, l)), w.setLoadedStyleName("layer-order");
      }
    }
  },
  _loadScopedThemeStyles: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 ? arguments[1] : void 0, o = t.preset();
    if (o && t.$attrSelector) {
      var r, l, s, i = ((r = t.$style) === null || r === void 0 || (l = r.getPresetTheme) === null || l === void 0 ? void 0 : l.call(r, o, "[".concat(t.$attrSelector, "]"))) || {}, a = i.css, u = (s = t.$style) === null || s === void 0 ? void 0 : s.load(a, k({
        name: "".concat(t.$attrSelector, "-").concat(t.$style.name)
      }, n));
      t.scopedStyleEl = u.el;
    }
  },
  _themeChangeListener: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : function() {
    };
    te.clearLoadedStyleNames(), j.on("theme:change", t);
  },
  _removeThemeListeners: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    j.off("theme:change", t.$loadStyles), t.$loadStyles = void 0;
  },
  _hook: function(t, n, o, r, l, s) {
    var i, a, u = "on".concat(mo(n)), d = S._getConfig(r, l), c = o?.$instance, p = S._usePT(c, S._getPT(r == null || (i = r.value) === null || i === void 0 ? void 0 : i.pt, t), S._getOptionValue, "hooks.".concat(u)), b = S._useDefaultPT(c, d == null || (a = d.pt) === null || a === void 0 || (a = a.directives) === null || a === void 0 ? void 0 : a[t], S._getOptionValue, "hooks.".concat(u)), h = {
      el: o,
      binding: r,
      vnode: l,
      prevVnode: s
    };
    p?.(c, h), b?.(c, h);
  },
  /* eslint-disable-next-line no-unused-vars */
  _mergeProps: function() {
    for (var t = arguments.length > 1 ? arguments[1] : void 0, n = arguments.length, o = new Array(n > 2 ? n - 2 : 0), r = 2; r < n; r++)
      o[r - 2] = arguments[r];
    return ct(t) ? t.apply(void 0, o) : N.apply(void 0, o);
  },
  _extend: function(t) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, o = function(i, a, u, d, c) {
      var p, b, h, g;
      a._$instances = a._$instances || {};
      var v = S._getConfig(u, d), f = a._$instances[t] || {}, y = pe(f) ? k(k({}, n), n?.methods) : {};
      a._$instances[t] = k(k({}, f), {}, {
        /* new instance variables to pass in directive methods */
        $name: t,
        $host: a,
        $binding: u,
        $modifiers: u?.modifiers,
        $value: u?.value,
        $el: f.$el || a || void 0,
        $style: k({
          classes: void 0,
          inlineStyles: void 0,
          load: function() {
          },
          loadCSS: function() {
          },
          loadStyle: function() {
          }
        }, n?.style),
        $primevueConfig: v,
        $attrSelector: (p = a.$pd) === null || p === void 0 || (p = p[t]) === null || p === void 0 ? void 0 : p.attrSelector,
        /* computed instance variables */
        defaultPT: function() {
          return S._getPT(v?.pt, void 0, function(m) {
            var $;
            return m == null || ($ = m.directives) === null || $ === void 0 ? void 0 : $[t];
          });
        },
        isUnstyled: function() {
          var m, $;
          return ((m = a._$instances[t]) === null || m === void 0 || (m = m.$binding) === null || m === void 0 || (m = m.value) === null || m === void 0 ? void 0 : m.unstyled) !== void 0 ? ($ = a._$instances[t]) === null || $ === void 0 || ($ = $.$binding) === null || $ === void 0 || ($ = $.value) === null || $ === void 0 ? void 0 : $.unstyled : v?.unstyled;
        },
        theme: function() {
          var m;
          return (m = a._$instances[t]) === null || m === void 0 || (m = m.$primevueConfig) === null || m === void 0 ? void 0 : m.theme;
        },
        preset: function() {
          var m;
          return (m = a._$instances[t]) === null || m === void 0 || (m = m.$binding) === null || m === void 0 || (m = m.value) === null || m === void 0 ? void 0 : m.dt;
        },
        /* instance's methods */
        ptm: function() {
          var m, $ = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", C = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
          return S._getPTValue(a._$instances[t], (m = a._$instances[t]) === null || m === void 0 || (m = m.$binding) === null || m === void 0 || (m = m.value) === null || m === void 0 ? void 0 : m.pt, $, k({}, C));
        },
        ptmo: function() {
          var m = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, $ = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", C = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
          return S._getPTValue(a._$instances[t], m, $, C, !1);
        },
        cx: function() {
          var m, $, C = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", D = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
          return (m = a._$instances[t]) !== null && m !== void 0 && m.isUnstyled() ? void 0 : S._getOptionValue(($ = a._$instances[t]) === null || $ === void 0 || ($ = $.$style) === null || $ === void 0 ? void 0 : $.classes, C, k({}, D));
        },
        sx: function() {
          var m, $ = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", C = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0, D = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
          return C ? S._getOptionValue((m = a._$instances[t]) === null || m === void 0 || (m = m.$style) === null || m === void 0 ? void 0 : m.inlineStyles, $, k({}, D)) : void 0;
        }
      }, y), a.$instance = a._$instances[t], (b = (h = a.$instance)[i]) === null || b === void 0 || b.call(h, a, u, d, c), a["$".concat(t)] = a.$instance, S._hook(t, i, a, u, d, c), a.$pd || (a.$pd = {}), a.$pd[t] = k(k({}, (g = a.$pd) === null || g === void 0 ? void 0 : g[t]), {}, {
        name: t,
        instance: a._$instances[t]
      });
    }, r = function(i) {
      var a, u, d, c = i._$instances[t], p = c?.watch, b = function(v) {
        var f, y = v.newValue, T = v.oldValue;
        return p == null || (f = p.config) === null || f === void 0 ? void 0 : f.call(c, y, T);
      }, h = function(v) {
        var f, y = v.newValue, T = v.oldValue;
        return p == null || (f = p["config.ripple"]) === null || f === void 0 ? void 0 : f.call(c, y, T);
      };
      c.$watchersCallback = {
        config: b,
        "config.ripple": h
      }, p == null || (a = p.config) === null || a === void 0 || a.call(c, c?.$primevueConfig), ne.on("config:change", b), p == null || (u = p["config.ripple"]) === null || u === void 0 || u.call(c, c == null || (d = c.$primevueConfig) === null || d === void 0 ? void 0 : d.ripple), ne.on("config:ripple:change", h);
    }, l = function(i) {
      var a = i._$instances[t].$watchersCallback;
      a && (ne.off("config:change", a.config), ne.off("config:ripple:change", a["config.ripple"]), i._$instances[t].$watchersCallback = void 0);
    };
    return {
      created: function(i, a, u, d) {
        i.$pd || (i.$pd = {}), i.$pd[t] = {
          name: t,
          attrSelector: xo("pd")
        }, o("created", i, a, u, d);
      },
      beforeMount: function(i, a, u, d) {
        var c;
        S._loadStyles((c = i.$pd[t]) === null || c === void 0 ? void 0 : c.instance, a, u), o("beforeMount", i, a, u, d), r(i);
      },
      mounted: function(i, a, u, d) {
        var c;
        S._loadStyles((c = i.$pd[t]) === null || c === void 0 ? void 0 : c.instance, a, u), o("mounted", i, a, u, d);
      },
      beforeUpdate: function(i, a, u, d) {
        o("beforeUpdate", i, a, u, d);
      },
      updated: function(i, a, u, d) {
        var c;
        S._loadStyles((c = i.$pd[t]) === null || c === void 0 ? void 0 : c.instance, a, u), o("updated", i, a, u, d);
      },
      beforeUnmount: function(i, a, u, d) {
        var c;
        l(i), S._removeThemeListeners((c = i.$pd[t]) === null || c === void 0 ? void 0 : c.instance), o("beforeUnmount", i, a, u, d);
      },
      unmounted: function(i, a, u, d) {
        var c;
        (c = i.$pd[t]) === null || c === void 0 || (c = c.instance) === null || c === void 0 || (c = c.scopedStyleEl) === null || c === void 0 || (c = c.value) === null || c === void 0 || c.remove(), o("unmounted", i, a, u, d);
      }
    };
  },
  extend: function() {
    var t = S._getMeta.apply(S, arguments), n = Ft(t, 2), o = n[0], r = n[1];
    return k({
      extend: function() {
        var s = S._getMeta.apply(S, arguments), i = Ft(s, 2), a = i[0], u = i[1];
        return S.extend(a, k(k(k({}, r), r?.methods), u));
      }
    }, S._extend(o, r));
  }
}, Cr = `
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
`, jr = {
  root: "p-ink"
}, Ar = x.extend({
  name: "ripple-directive",
  style: Cr,
  classes: jr
}), Lr = S.extend({
  style: Ar
});
function De(e) {
  "@babel/helpers - typeof";
  return De = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, De(e);
}
function Nr(e) {
  return Dr(e) || Mr(e) || Ir(e) || Er();
}
function Er() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Ir(e, t) {
  if (e) {
    if (typeof e == "string") return lt(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? lt(e, t) : void 0;
  }
}
function Mr(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function Dr(e) {
  if (Array.isArray(e)) return lt(e);
}
function lt(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, o = Array(t); n < t; n++) o[n] = e[n];
  return o;
}
function Yt(e, t, n) {
  return (t = Rr(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Rr(e) {
  var t = Vr(e, "string");
  return De(t) == "symbol" ? t : t + "";
}
function Vr(e, t) {
  if (De(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(e, t);
    if (De(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var Br = Lr.extend("ripple", {
  watch: {
    "config.ripple": function(t) {
      t ? (this.createRipple(this.$host), this.bindEvents(this.$host), this.$host.setAttribute("data-pd-ripple", !0), this.$host.style.overflow = "hidden", this.$host.style.position = "relative") : (this.remove(this.$host), this.$host.removeAttribute("data-pd-ripple"));
    }
  },
  unmounted: function(t) {
    this.remove(t);
  },
  timeout: void 0,
  methods: {
    bindEvents: function(t) {
      t.addEventListener("mousedown", this.onMouseDown.bind(this));
    },
    unbindEvents: function(t) {
      t.removeEventListener("mousedown", this.onMouseDown.bind(this));
    },
    createRipple: function(t) {
      var n = this.getInk(t);
      n || (n = $o("span", Yt(Yt({
        role: "presentation",
        "aria-hidden": !0,
        "data-p-ink": !0,
        "data-p-ink-active": !1,
        class: !this.isUnstyled() && this.cx("root"),
        onAnimationEnd: this.onAnimationEnd.bind(this)
      }, this.$attrSelector, ""), "p-bind", this.ptm("root"))), t.appendChild(n), this.$el = n);
    },
    remove: function(t) {
      var n = this.getInk(t);
      n && (this.$host.style.overflow = "", this.$host.style.position = "", this.unbindEvents(t), n.removeEventListener("animationend", this.onAnimationEnd), n.remove());
    },
    onMouseDown: function(t) {
      var n = this, o = t.currentTarget, r = this.getInk(o);
      if (!(!r || getComputedStyle(r, null).display === "none")) {
        if (!this.isUnstyled() && Ce(r, "p-ink-active"), r.setAttribute("data-p-ink-active", "false"), !Ot(r) && !xt(r)) {
          var l = Math.max(go(o), To(o));
          r.style.height = l + "px", r.style.width = l + "px";
        }
        var s = Po(o), i = t.pageX - s.left + document.body.scrollTop - xt(r) / 2, a = t.pageY - s.top + document.body.scrollLeft - Ot(r) / 2;
        r.style.top = a + "px", r.style.left = i + "px", !this.isUnstyled() && nt(r, "p-ink-active"), r.setAttribute("data-p-ink-active", "true"), this.timeout = setTimeout(function() {
          r && (!n.isUnstyled() && Ce(r, "p-ink-active"), r.setAttribute("data-p-ink-active", "false"));
        }, 401);
      }
    },
    onAnimationEnd: function(t) {
      this.timeout && clearTimeout(this.timeout), !this.isUnstyled() && Ce(t.currentTarget, "p-ink-active"), t.currentTarget.setAttribute("data-p-ink-active", "false");
    },
    getInk: function(t) {
      return t && t.children ? Nr(t.children).find(function(n) {
        return wo(n, "data-pc-name") === "ripple";
      }) : void 0;
    }
  }
});
const Ur = "data-wippy-overlay-layer";
function $n() {
  return typeof window < "u" && typeof window.document < "u";
}
function _n() {
  return $n() && typeof HTMLElement < "u" && Object.hasOwn(HTMLElement.prototype, "popover");
}
function zr() {
  return _n() && typeof CSS < "u" && typeof CSS.supports == "function" && CSS.supports("anchor-name: --a") && CSS.supports("position-area", "bottom span-right") && CSS.supports("position-try-fallbacks", "flip-block") && CSS.supports("min-width", "min(anchor-size(width), 100vw)") && CSS.supports("max-width", "stretch");
}
const Wr = /\bp-(?:select|multiselect|treeselect|cascadeselect)-overlay\b/;
let Hr = 0;
const Qe = /* @__PURE__ */ new WeakMap();
function qt(e, t) {
  const n = e.style;
  n.setProperty("position", "fixed", "important"), n.setProperty("inset", "auto", "important"), n.setProperty("margin", "0", "important"), n.setProperty("position-anchor", t), n.setProperty("position-area", "bottom span-right"), n.setProperty("position-try-fallbacks", "flip-block, flip-inline, flip-block flip-inline"), n.setProperty("min-width", "min(anchor-size(width), 100vw)", "important"), n.setProperty("max-width", "stretch", "important");
}
function Fr(e, t) {
  if (!Wr.test(e.className))
    return;
  const n = e.style.cssText;
  qt(e, t), e.getAttribute("popover") !== "manual" && e.setAttribute("popover", "manual");
  try {
    e.matches(":popover-open") || e.showPopover();
  } catch {
  }
  if (!e.matches(":popover-open")) {
    e.removeAttribute("popover"), e.style.cssText = n;
    return;
  }
  if (!Qe.has(e)) {
    const o = new MutationObserver(() => {
      const r = e.style;
      (r.top !== "auto" || r.left !== "auto" || r.margin !== "0px" || r.getPropertyPriority("top") !== "important" || r.getPropertyPriority("left") !== "important" || r.getPropertyPriority("margin") !== "important" || r.getPropertyPriority("min-width") !== "important" || r.maxWidth !== "stretch" || r.getPropertyPriority("max-width") !== "important") && qt(e, t);
    });
    o.observe(e, { attributes: !0, attributeFilter: ["style"] }), Qe.set(e, o);
  }
}
function ft(e) {
  const t = Qe.get(e);
  t && (t.disconnect(), Qe.delete(e));
}
function Kr(e) {
  const t = e && typeof e.getRootNode == "function" ? e.getRootNode() : null;
  return t instanceof ShadowRoot ? t : null;
}
function st(e) {
  e.style.top = "0px", e.style.left = "0px";
  const t = e.getBoundingClientRect();
  e.style.top = `${-window.scrollY - t.top}px`, e.style.left = `${-window.scrollX - t.left}px`;
}
const Ze = /* @__PURE__ */ new Set(), mt = /* @__PURE__ */ new WeakMap();
let Qt = !1, ut = !1;
function Gr() {
  ut = !1;
  for (const e of Ze) {
    if (!e.isConnected) {
      for (const t of Array.from(e.children))
        t instanceof HTMLElement && ft(t);
      Ze.delete(e), mt.get(e)?.disconnect();
      continue;
    }
    e.childElementCount > 0 && st(e);
  }
}
function Zt() {
  ut || (ut = !0, requestAnimationFrame(Gr));
}
function Yr(e) {
  const t = document.createElement("div");
  t.setAttribute(Ur, "");
  const n = _n();
  if (t.style.cssText = n ? "position:fixed;width:0 !important;height:0 !important;margin:0 !important;border:0 !important;padding:0 !important;background:transparent !important;color:inherit !important;overflow:visible !important;" : "position:fixed;top:0;left:0;width:0;height:0;", n && t.setAttribute("popover", "manual"), e.appendChild(t), n) {
    try {
      t.showPopover();
    } catch {
    }
    t.matches(":popover-open") || (t.removeAttribute("popover"), t.style.cssText = "position:fixed;top:0;left:0;width:0;height:0;");
  }
  st(t);
  const o = new MutationObserver((r) => {
    const l = t.__wippyAnchorName;
    for (const s of r) {
      if (l)
        for (const i of Array.from(s.addedNodes))
          i instanceof HTMLElement && Fr(i, l);
      for (const i of Array.from(s.removedNodes))
        i instanceof HTMLElement && ft(i);
    }
    t.isConnected && t.childElementCount > 0 && st(t);
  });
  return o.observe(t, { childList: !0 }), mt.set(t, o), Ze.add(t), Qt || (Qt = !0, window.addEventListener("scroll", Zt, { capture: !0, passive: !0 }), window.addEventListener("resize", Zt, { passive: !0 })), t;
}
function Jt(e) {
  if (!(!e.hostRoot || e.layer) && (e.layer = Yr(e.hostRoot), zr())) {
    const t = e.$el ? e.$el.parentElement : null;
    t && (e.anchorName = `--wippy-a-${++Hr}`, e.anchorTrigger = t, t.style.setProperty("anchor-name", e.anchorName), e.layer.__wippyAnchorName = e.anchorName);
  }
}
function Xt(e) {
  if (e.anchorTrigger && (e.anchorTrigger.style.removeProperty("anchor-name"), e.anchorTrigger = null), e.anchorName = null, e.layer) {
    for (const t of Array.from(e.layer.children))
      t instanceof HTMLElement && ft(t);
    Ze.delete(e.layer), mt.get(e.layer)?.disconnect(), e.layer.remove(), e.layer = null;
  }
}
let en = !1;
function qr() {
  if (en)
    return;
  en = !0;
  const e = vn;
  e.computed = e.computed || {}, e.computed.inline = function() {
    return !!this.disabled || this.appendTo === "self";
  }, e.computed.resolvedTarget = function() {
    return this.appendTo == null || this.appendTo === "body" ? this.hostRoot ? this.layer : document.body : this.appendTo;
  }, e.data = function() {
    return { mounted: !1, hostRoot: null, layer: null, anchorName: null, anchorTrigger: null };
  }, e.mounted = function() {
    $n() && (this.hostRoot = Kr(this.$el), this.mounted = !0, this.hostRoot && (this.inline || Jt(this), this.$watch("inline", (t) => {
      t ? Xt(this) : Jt(this);
    })));
  }, e.render = function() {
    return this.inline ? Q(this.$slots, "default", { key: 0 }) : this.mounted ? Yn(nn, { key: 1, to: this.resolvedTarget || document.body }, [
      Q(this.$slots, "default")
    ]) : ue("", !0);
  }, e.unmounted = function() {
    Xt(this);
  };
}
const Ya = {
  install: (e) => {
    qr(), e.use(ur, { theme: "none" });
  }
};
var kn = {
  name: "SpinnerIcon",
  extends: _r
};
function Qr(e) {
  return ea(e) || Xr(e) || Jr(e) || Zr();
}
function Zr() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Jr(e, t) {
  if (e) {
    if (typeof e == "string") return dt(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? dt(e, t) : void 0;
  }
}
function Xr(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function ea(e) {
  if (Array.isArray(e)) return dt(e);
}
function dt(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, o = Array(t); n < t; n++) o[n] = e[n];
  return o;
}
function ta(e, t, n, o, r, l) {
  return E(), H("svg", N({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), Qr(t[0] || (t[0] = [P("path", {
    d: "M6.99701 14C5.85441 13.999 4.72939 13.7186 3.72012 13.1832C2.71084 12.6478 1.84795 11.8737 1.20673 10.9284C0.565504 9.98305 0.165424 8.89526 0.041387 7.75989C-0.0826496 6.62453 0.073125 5.47607 0.495122 4.4147C0.917119 3.35333 1.59252 2.4113 2.46241 1.67077C3.33229 0.930247 4.37024 0.413729 5.4857 0.166275C6.60117 -0.0811796 7.76026 -0.0520535 8.86188 0.251112C9.9635 0.554278 10.9742 1.12227 11.8057 1.90555C11.915 2.01493 11.9764 2.16319 11.9764 2.31778C11.9764 2.47236 11.915 2.62062 11.8057 2.73C11.7521 2.78503 11.688 2.82877 11.6171 2.85864C11.5463 2.8885 11.4702 2.90389 11.3933 2.90389C11.3165 2.90389 11.2404 2.8885 11.1695 2.85864C11.0987 2.82877 11.0346 2.78503 10.9809 2.73C9.9998 1.81273 8.73246 1.26138 7.39226 1.16876C6.05206 1.07615 4.72086 1.44794 3.62279 2.22152C2.52471 2.99511 1.72683 4.12325 1.36345 5.41602C1.00008 6.70879 1.09342 8.08723 1.62775 9.31926C2.16209 10.5513 3.10478 11.5617 4.29713 12.1803C5.48947 12.7989 6.85865 12.988 8.17414 12.7157C9.48963 12.4435 10.6711 11.7264 11.5196 10.6854C12.3681 9.64432 12.8319 8.34282 12.8328 7C12.8328 6.84529 12.8943 6.69692 13.0038 6.58752C13.1132 6.47812 13.2616 6.41667 13.4164 6.41667C13.5712 6.41667 13.7196 6.47812 13.8291 6.58752C13.9385 6.69692 14 6.84529 14 7C14 8.85651 13.2622 10.637 11.9489 11.9497C10.6356 13.2625 8.85432 14 6.99701 14Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
kn.render = ta;
var na = `
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
`, oa = {
  root: function(t) {
    var n = t.props, o = t.instance;
    return ["p-badge p-component", {
      "p-badge-circle": O(n.value) && String(n.value).length === 1,
      "p-badge-dot": pe(n.value) && !o.$slots.default,
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
}, ra = x.extend({
  name: "badge",
  style: na,
  classes: oa
}), aa = {
  name: "BaseBadge",
  extends: bt,
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
  style: ra,
  provide: function() {
    return {
      $pcBadge: this,
      $parentInstance: this
    };
  }
};
function Re(e) {
  "@babel/helpers - typeof";
  return Re = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, Re(e);
}
function tn(e, t, n) {
  return (t = ia(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function ia(e) {
  var t = la(e, "string");
  return Re(t) == "symbol" ? t : t + "";
}
function la(e, t) {
  if (Re(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(e, t);
    if (Re(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var wn = {
  name: "Badge",
  extends: aa,
  inheritAttrs: !1,
  computed: {
    dataP: function() {
      return xe(tn(tn({
        circle: this.value != null && String(this.value).length === 1,
        empty: this.value == null && !this.$slots.default
      }, this.severity, this.severity), this.size, this.size));
    }
  }
}, sa = ["data-p"];
function ua(e, t, n, o, r, l) {
  return E(), H("span", N({
    class: e.cx("root"),
    "data-p": l.dataP
  }, e.ptmi("root")), [Q(e.$slots, "default", {}, function() {
    return [ke(Pe(e.value), 1)];
  })], 16, sa);
}
wn.render = ua;
var da = `
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
function Ve(e) {
  "@babel/helpers - typeof";
  return Ve = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, Ve(e);
}
function z(e, t, n) {
  return (t = ca(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function ca(e) {
  var t = pa(e, "string");
  return Ve(t) == "symbol" ? t : t + "";
}
function pa(e, t) {
  if (Ve(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(e, t);
    if (Ve(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var ba = {
  root: function(t) {
    var n = t.instance, o = t.props;
    return ["p-button p-component", z(z(z(z(z(z(z(z(z({
      "p-button-icon-only": n.hasIcon && !o.label && !o.badge,
      "p-button-vertical": (o.iconPos === "top" || o.iconPos === "bottom") && o.label,
      "p-button-loading": o.loading,
      "p-button-link": o.link || o.variant === "link"
    }, "p-button-".concat(o.severity), o.severity), "p-button-raised", o.raised), "p-button-rounded", o.rounded), "p-button-text", o.text || o.variant === "text"), "p-button-outlined", o.outlined || o.variant === "outlined"), "p-button-sm", o.size === "small"), "p-button-lg", o.size === "large"), "p-button-plain", o.plain), "p-button-fluid", n.hasFluid)];
  },
  loadingIcon: "p-button-loading-icon",
  icon: function(t) {
    var n = t.props;
    return ["p-button-icon", z({}, "p-button-icon-".concat(n.iconPos), n.label)];
  },
  label: "p-button-label"
}, fa = x.extend({
  name: "button",
  style: da,
  classes: ba
}), ma = {
  name: "BaseButton",
  extends: bt,
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
  style: fa,
  provide: function() {
    return {
      $pcButton: this,
      $parentInstance: this
    };
  }
};
function Be(e) {
  "@babel/helpers - typeof";
  return Be = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, Be(e);
}
function L(e, t, n) {
  return (t = ha(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function ha(e) {
  var t = va(e, "string");
  return Be(t) == "symbol" ? t : t + "";
}
function va(e, t) {
  if (Be(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(e, t);
    if (Be(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var Ge = {
  name: "Button",
  extends: ma,
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
      return N(this.asAttrs, this.a11yAttrs, this.getPTOptions("root"));
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
      return pe(this.fluid) ? !!this.$pcFluid : this.fluid;
    },
    dataP: function() {
      return xe(L(L(L(L(L(L(L(L(L(L({}, this.size, this.size), "icon-only", this.hasIcon && !this.label && !this.badge), "loading", this.loading), "fluid", this.hasFluid), "rounded", this.rounded), "raised", this.raised), "outlined", this.outlined || this.variant === "outlined"), "text", this.text || this.variant === "text"), "link", this.link || this.variant === "link"), "vertical", (this.iconPos === "top" || this.iconPos === "bottom") && this.label));
    },
    dataIconP: function() {
      return xe(L(L({}, this.iconPos, this.iconPos), this.size, this.size));
    },
    dataLabelP: function() {
      return xe(L(L({}, this.size, this.size), "icon-only", this.hasIcon && !this.label && !this.badge));
    }
  },
  components: {
    SpinnerIcon: kn,
    Badge: wn
  },
  directives: {
    ripple: Br
  }
}, ga = ["data-p"], ya = ["data-p"];
function Sa(e, t, n, o, r, l) {
  var s = yt("SpinnerIcon"), i = yt("Badge"), a = qn("ripple");
  return e.asChild ? Q(e.$slots, "default", {
    key: 1,
    class: Te(e.cx("root")),
    a11yAttrs: l.a11yAttrs
  }) : et((E(), Ke(Qn(e.as), N({
    key: 0,
    class: e.cx("root"),
    "data-p": l.dataP
  }, l.attrs), {
    default: tt(function() {
      return [Q(e.$slots, "default", {}, function() {
        return [e.loading ? Q(e.$slots, "loadingicon", N({
          key: 0,
          class: [e.cx("loadingIcon"), e.cx("icon")]
        }, e.ptm("loadingIcon")), function() {
          return [e.loadingIcon ? (E(), H("span", N({
            key: 0,
            class: [e.cx("loadingIcon"), e.cx("icon"), e.loadingIcon]
          }, e.ptm("loadingIcon")), null, 16)) : (E(), Ke(s, N({
            key: 1,
            class: [e.cx("loadingIcon"), e.cx("icon")],
            spin: ""
          }, e.ptm("loadingIcon")), null, 16, ["class"]))];
        }) : Q(e.$slots, "icon", N({
          key: 1,
          class: [e.cx("icon")]
        }, e.ptm("icon")), function() {
          return [e.icon ? (E(), H("span", N({
            key: 0,
            class: [e.cx("icon"), e.icon, e.iconClass],
            "data-p": l.dataIconP
          }, e.ptm("icon")), null, 16, ga)) : ue("", !0)];
        }), e.label ? (E(), H("span", N({
          key: 2,
          class: e.cx("label")
        }, e.ptm("label"), {
          "data-p": l.dataLabelP
        }), Pe(e.label), 17, ya)) : ue("", !0), e.badge ? (E(), Ke(i, {
          key: 3,
          value: e.badge,
          class: Te(e.badgeClass),
          severity: e.badgeSeverity,
          unstyled: e.unstyled,
          pt: e.ptm("pcBadge")
        }, null, 8, ["value", "class", "severity", "unstyled", "pt"])) : ue("", !0)];
      })];
    }),
    _: 3
  }, 16, ["class", "data-p"])), [[a]]);
}
Ge.render = Sa;
const $a = () => eo(), _a = { class: "kx-field" }, ka = { class: "kx-field wh-schema" }, wa = { class: "wh-schema-edit" }, Pa = {
  key: 0,
  class: "kx-err inline"
}, Ta = {
  class: "kx-form-foot",
  style: { border: "0", padding: "4px 0 0" }
}, Oa = {
  key: 1,
  class: "wh-secret",
  "aria-live": "polite"
}, xa = { class: "wh-secret-head" }, Ca = { class: "kx-field" }, ja = { class: "wh-token" }, Aa = { class: "kx-field" }, La = { class: "wh-token" }, Na = {
  class: "kx-form-foot",
  style: { border: "0", padding: "4px 0 0" }
}, qa = /* @__PURE__ */ Zn({
  __name: "WebhookCreate",
  emits: ["created", "close"],
  setup(e, { emit: t }) {
    const n = $a(), o = t, r = W(""), l = W(to(io)), s = W(!1), i = W(""), a = W(null), u = St(() => a.value ? a.value.url || no(a.value.webhook_id) : ""), d = St(() => kt(l.value).schema || {}), c = W(!1);
    async function p() {
      const v = kt(l.value);
      if (v.error) {
        i.value = v.error;
        return;
      }
      s.value = !0, i.value = "";
      try {
        const f = await ro({ label: r.value.trim(), schema: v.schema });
        a.value = f;
      } catch (f) {
        i.value = ao(f, "create failed"), n("error", { message: i.value, error: f });
      } finally {
        s.value = !1;
      }
    }
    async function b(v, f) {
      try {
        await navigator.clipboard.writeText(v), _t.toast({ severity: "success", summary: "Copied", detail: f });
      } catch {
        _t.toast({ severity: "warn", summary: "Copy failed", detail: "Select and copy manually." });
      }
    }
    function h() {
      if (a.value) {
        const v = String(a.value.webhook_id || a.value.thread_id || ""), f = { id: v, thread_id: v, webhook_id: v, title: a.value.label || r.value.trim() || "Webhook" };
        n("created", f), o("created", f);
      }
      n("close", {}), o("close");
    }
    function g() {
      n("close", {}), o("close");
    }
    return (v, f) => (E(), H("form", {
      class: "kx-form",
      onSubmit: Jn(p, ["prevent"])
    }, [
      a.value ? (E(), H("section", Oa, [
        P("div", xa, [
          U(Y(ge), {
            icon: "tabler:shield-check",
            "aria-hidden": "true"
          }),
          f[8] || (f[8] = P("div", null, [
            P("h3", null, "Webhook created"),
            P("p", null, "Copy the secret now — it is shown once and won't be shown again.")
          ], -1))
        ]),
        P("label", Ca, [
          f[9] || (f[9] = P("span", { class: "kx-field-lbl" }, "Endpoint URL", -1)),
          P("div", ja, [
            P("code", null, Pe(u.value), 1),
            P("button", {
              type: "button",
              class: "wh-copy",
              title: "Copy URL",
              "aria-label": "Copy URL",
              onClick: f[3] || (f[3] = (y) => b(u.value, "endpoint URL"))
            }, [
              U(Y(ge), {
                icon: "tabler:copy",
                "aria-hidden": "true"
              })
            ])
          ])
        ]),
        P("label", Aa, [
          f[10] || (f[10] = P("span", { class: "kx-field-lbl" }, [
            ke("Secret "),
            P("span", { class: "kx-field-hint-inline" }, "— shown once")
          ], -1)),
          P("div", La, [
            P("code", null, Pe(a.value.secret), 1),
            P("button", {
              type: "button",
              class: "wh-copy",
              title: "Copy secret",
              "aria-label": "Copy secret",
              onClick: f[4] || (f[4] = (y) => b(a.value.secret, "secret"))
            }, [
              U(Y(ge), {
                icon: "tabler:copy",
                "aria-hidden": "true"
              })
            ])
          ])
        ]),
        P("div", Na, [
          U(Y(Ge), {
            type: "button",
            label: "Done",
            onClick: h
          }, {
            icon: tt(({ class: y }) => [
              U(Y(ge), {
                icon: "tabler:check",
                class: Te(y),
                "aria-hidden": "true"
              }, null, 8, ["class"])
            ]),
            _: 1
          })
        ])
      ])) : (E(), H(Xn, { key: 0 }, [
        P("label", _a, [
          f[5] || (f[5] = P("span", { class: "kx-field-lbl" }, [
            ke("Name "),
            P("span", { class: "kx-field-hint-inline" }, "— shown in automation trigger pickers")
          ], -1)),
          et(P("input", {
            "onUpdate:modelValue": f[0] || (f[0] = (y) => r.value = y),
            class: "kx-input",
            type: "text",
            placeholder: "Customer events"
          }, null, 512), [
            [$t, r.value]
          ])
        ]),
        P("div", ka, [
          f[7] || (f[7] = P("span", { class: "kx-field-lbl" }, [
            ke("Payload schema "),
            P("span", { class: "kx-field-hint-inline" }, "— the fields each inbound request must carry")
          ], -1)),
          U(oo, { schema: d.value }, null, 8, ["schema"]),
          P("div", wa, [
            P("button", {
              type: "button",
              class: Te(["wh-toggle", c.value && "is-open"]),
              onClick: f[1] || (f[1] = (y) => c.value = !c.value)
            }, [
              U(Y(ge), {
                icon: "tabler:chevron-right",
                "aria-hidden": "true"
              }),
              f[6] || (f[6] = ke(" Edit as JSON Schema ", -1))
            ], 2),
            c.value ? et((E(), H("textarea", {
              key: 0,
              "onUpdate:modelValue": f[2] || (f[2] = (y) => l.value = y),
              class: "kx-input kx-textarea",
              spellcheck: "false",
              "data-test": "wh-schema"
            }, null, 512)), [
              [$t, l.value]
            ]) : ue("", !0)
          ])
        ]),
        i.value ? (E(), H("div", Pa, Pe(i.value), 1)) : ue("", !0),
        P("div", Ta, [
          U(Y(Ge), {
            type: "button",
            label: "Cancel",
            severity: "secondary",
            outlined: "",
            onClick: g
          }),
          U(Y(Ge), {
            type: "submit",
            label: "Create webhook",
            loading: s.value,
            disabled: s.value,
            "data-test": "wh-create"
          }, {
            icon: tt(({ class: y }) => [
              U(Y(ge), {
                icon: "tabler:plus",
                class: Te(y),
                "aria-hidden": "true"
              }, null, 8, ["class"])
            ]),
            _: 1
          }, 8, ["loading", "disabled"])
        ])
      ], 64))
    ], 32));
  }
}), Ea = { props: { type: "object", properties: {} } }, Qa = {
  wippy: Ea
};
export {
  x as B,
  To as C,
  Ka as I,
  Fa as L,
  Ya as P,
  Br as R,
  za as S,
  $o as U,
  nt as W,
  qa as _,
  S as a,
  Wa as b,
  O as c,
  Ba as d,
  Va as e,
  vn as f,
  Ge as g,
  bt as h,
  xe as i,
  go as j,
  Ua as k,
  Oo as l,
  Qa as p,
  Ga as r,
  _r as s,
  Ha as v
};
//# sourceMappingURL=package-DOw-g2Y8.js.map

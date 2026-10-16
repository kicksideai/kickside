import { ref as be, readonly as Qt, getCurrentInstance as Ie, onMounted as Zt, nextTick as Jt, watch as ie, reactive as Xt, renderSlot as Se, openBlock as en, createBlock as tn, Teleport as dt, createCommentVNode as ct, useId as nn, mergeProps as Pe, h as rn } from "vue";
var on = Object.defineProperty, Ve = Object.getOwnPropertySymbols, an = Object.prototype.hasOwnProperty, sn = Object.prototype.propertyIsEnumerable, We = (e, t, n) => t in e ? on(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n, ln = (e, t) => {
  for (var n in t || (t = {})) an.call(t, n) && We(e, n, t[n]);
  if (Ve) for (var n of Ve(t)) sn.call(t, n) && We(e, n, t[n]);
  return e;
};
function Ee(e) {
  return e == null || e === "" || Array.isArray(e) && e.length === 0 || !(e instanceof Date) && typeof e == "object" && Object.keys(e).length === 0;
}
function mt(e) {
  return typeof e == "function" && "call" in e && "apply" in e;
}
function b(e) {
  return !Ee(e);
}
function I(e, t = !0) {
  return e instanceof Object && e.constructor === Object && (t || Object.keys(e).length !== 0);
}
function pt(e = {}, t = {}) {
  let n = ln({}, e);
  return Object.keys(t).forEach((r) => {
    let o = r;
    I(t[o]) && o in e && I(e[o]) ? n[o] = pt(e[o], t[o]) : n[o] = t[o];
  }), n;
}
function un(...e) {
  return e.reduce((t, n, r) => r === 0 ? n : pt(t, n), {});
}
function P(e, ...t) {
  return mt(e) ? e(...t) : e;
}
function C(e, t = !0) {
  return typeof e == "string" && (t || e !== "");
}
function G(e) {
  return C(e) ? e.replace(/(-|_)/g, "").toLowerCase() : e;
}
function ht(e, t = "", n = {}) {
  let r = G(t).split("."), o = r.shift();
  if (o) {
    if (I(e)) {
      let l = Object.keys(e).find((i) => G(i) === o) || "";
      return ht(P(e[l], n), r.join("."), n);
    }
    return;
  }
  return P(e, n);
}
function dn(e, t = !0) {
  return Array.isArray(e) && (t || e.length !== 0);
}
function cn(e) {
  return b(e) && !isNaN(e);
}
function q(e, t) {
  if (t) {
    let n = t.test(e);
    return t.lastIndex = 0, n;
  }
  return !1;
}
function mn(...e) {
  return un(...e);
}
function le(e) {
  return e && e.replace(/\/\*(?:(?!\*\/)[\s\S])*\*\/|[\r\n\t]+/g, "").replace(/ {2,}/g, " ").replace(/ ([{:}]) /g, "$1").replace(/([;,]) /g, "$1").replace(/ !/g, "!").replace(/: /g, ":").trim();
}
function br(e) {
  return C(e, !1) ? e[0].toUpperCase() + e.slice(1) : e;
}
function ft(e) {
  return C(e) ? e.replace(/(_)/g, "-").replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase() : e;
}
function yt() {
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
function pn(...e) {
  if (e) {
    let t = [];
    for (let n = 0; n < e.length; n++) {
      let r = e[n];
      if (!r) continue;
      let o = typeof r;
      if (o === "string" || o === "number") t.push(r);
      else if (o === "object") {
        let l = Array.isArray(r) ? [pn(...r)] : Object.entries(r).map(([i, s]) => s ? i : void 0);
        t = l.length ? t.concat(l.filter((i) => !!i)) : t;
      }
    }
    return t.join(" ").trim();
  }
}
function hn(e, t) {
  return e ? e.classList ? e.classList.contains(t) : new RegExp("(^| )" + t + "( |$)", "gi").test(e.className) : !1;
}
function Be(e, t) {
  if (e && t) {
    let n = (r) => {
      hn(e, r) || (e.classList ? e.classList.add(r) : e.className += " " + r);
    };
    [t].flat().filter(Boolean).forEach((r) => r.split(" ").forEach(n));
  }
}
function fn() {
  return window.innerWidth - document.documentElement.offsetWidth;
}
function Sr(e) {
  typeof e == "string" ? Be(document.body, e || "p-overflow-hidden") : (e != null && e.variableName && document.body.style.setProperty(e.variableName, fn() + "px"), Be(document.body, e?.className || "p-overflow-hidden"));
}
function Ue(e, t) {
  if (e && t) {
    let n = (r) => {
      e.classList ? e.classList.remove(r) : e.className = e.className.replace(new RegExp("(^|\\b)" + r.split(" ").join("|") + "(\\b|$)", "gi"), " ");
    };
    [t].flat().filter(Boolean).forEach((r) => r.split(" ").forEach(n));
  }
}
function _r(e) {
  typeof e == "string" ? Ue(document.body, e || "p-overflow-hidden") : (e != null && e.variableName && document.body.style.removeProperty(e.variableName), Ue(document.body, e?.className || "p-overflow-hidden"));
}
function $r() {
  let e = window, t = document, n = t.documentElement, r = t.getElementsByTagName("body")[0], o = e.innerWidth || n.clientWidth || r.clientWidth, l = e.innerHeight || n.clientHeight || r.clientHeight;
  return { width: o, height: l };
}
function He(e) {
  return e ? Math.abs(e.scrollLeft) : 0;
}
function Tr(e, t) {
  e && (typeof t == "string" ? e.style.cssText = t : Object.entries(t || {}).forEach(([n, r]) => e.style[n] = r));
}
function Or(e, t) {
  return e instanceof HTMLElement ? e.offsetWidth : 0;
}
function yn(e) {
  if (e) {
    let t = e.parentNode;
    return t && t instanceof ShadowRoot && t.host && (t = t.host), t;
  }
  return null;
}
function vn(e) {
  return !!(e !== null && typeof e < "u" && e.nodeName && yn(e));
}
function Q(e) {
  return typeof Element < "u" ? e instanceof Element : e !== null && typeof e == "object" && e.nodeType === 1 && typeof e.nodeName == "string";
}
function _e(e, t = {}) {
  if (Q(e)) {
    let n = (r, o) => {
      var l, i;
      let s = (l = e?.$attrs) != null && l[r] ? [(i = e?.$attrs) == null ? void 0 : i[r]] : [];
      return [o].flat().reduce((a, u) => {
        if (u != null) {
          let d = typeof u;
          if (d === "string" || d === "number") a.push(u);
          else if (d === "object") {
            let p = Array.isArray(u) ? n(r, u) : Object.entries(u).map(([c, m]) => r === "style" && (m || m === 0) ? `${c.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase()}:${m}` : m ? c : void 0);
            a = p.length ? a.concat(p.filter((c) => !!c)) : a;
          }
        }
        return a;
      }, s);
    };
    Object.entries(t).forEach(([r, o]) => {
      if (o != null) {
        let l = r.match(/^on(.+)/);
        l ? e.addEventListener(l[1].toLowerCase(), o) : r === "p-bind" || r === "pBind" ? _e(e, o) : (o = r === "class" ? [...new Set(n("class", o))].join(" ").trim() : r === "style" ? n("style", o).join(";").trim() : o, (e.$attrs = e.$attrs || {}) && (e.$attrs[r] = o), e.setAttribute(r, o));
      }
    });
  }
}
function Pr(e, t = {}, ...n) {
  {
    let r = document.createElement(e);
    return _e(r, t), r.append(...n), r;
  }
}
function gn(e, t) {
  return Q(e) ? Array.from(e.querySelectorAll(t)) : [];
}
function bn(e, t) {
  return Q(e) ? e.matches(t) ? e : e.querySelector(t) : null;
}
function wr(e, t) {
  e && document.activeElement !== e && e.focus(t);
}
function Nr(e, t) {
  if (Q(e)) {
    let n = e.getAttribute(t);
    return isNaN(n) ? n === "true" || n === "false" ? n === "true" : n : +n;
  }
}
function vt(e, t = "") {
  let n = gn(e, `button:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t},
            [href]:not([tabindex = "-1"]):not([style*="display:none"]):not([hidden])${t},
            input:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t},
            select:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t},
            textarea:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t},
            [tabIndex]:not([tabIndex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t},
            [contenteditable]:not([tabIndex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t}`), r = [];
  for (let o of n) getComputedStyle(o).display != "none" && getComputedStyle(o).visibility != "hidden" && r.push(o);
  return r;
}
function Cr(e, t) {
  let n = vt(e, t);
  return n.length > 0 ? n[0] : null;
}
function kr(e) {
  if (e) {
    let t = e.offsetHeight, n = getComputedStyle(e);
    return t -= parseFloat(n.paddingTop) + parseFloat(n.paddingBottom) + parseFloat(n.borderTopWidth) + parseFloat(n.borderBottomWidth), t;
  }
  return 0;
}
function Lr(e, t) {
  let n = vt(e, t);
  return n.length > 0 ? n[n.length - 1] : null;
}
function jr(e) {
  if (e) {
    let t = e.getBoundingClientRect();
    return { top: t.top + (window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0), left: t.left + (window.pageXOffset || He(document.documentElement) || He(document.body) || 0) };
  }
  return { top: "auto", left: "auto" };
}
function Ar(e, t) {
  return e ? e.offsetHeight : 0;
}
function Er(e) {
  if (e) {
    let t = e.offsetWidth, n = getComputedStyle(e);
    return t -= parseFloat(n.paddingLeft) + parseFloat(n.paddingRight) + parseFloat(n.borderLeftWidth) + parseFloat(n.borderRightWidth), t;
  }
  return 0;
}
function gt() {
  return !!(typeof window < "u" && window.document && window.document.createElement);
}
function xr(e, t = "") {
  return Q(e) ? e.matches(`button:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t},
            [href][clientHeight][clientWidth]:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t},
            input:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t},
            select:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t},
            textarea:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t},
            [tabIndex]:not([tabIndex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t},
            [contenteditable]:not([tabIndex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t}`) : !1;
}
function Sn(e, t = "", n) {
  Q(e) && n !== null && n !== void 0 && e.setAttribute(t, n);
}
var _n = Object.defineProperty, $n = Object.defineProperties, Tn = Object.getOwnPropertyDescriptors, $e = Object.getOwnPropertySymbols, bt = Object.prototype.hasOwnProperty, St = Object.prototype.propertyIsEnumerable, Fe = (e, t, n) => t in e ? _n(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n, N = (e, t) => {
  for (var n in t || (t = {})) bt.call(t, n) && Fe(e, n, t[n]);
  if ($e) for (var n of $e(t)) St.call(t, n) && Fe(e, n, t[n]);
  return e;
}, we = (e, t) => $n(e, Tn(t)), A = (e, t) => {
  var n = {};
  for (var r in e) bt.call(e, r) && t.indexOf(r) < 0 && (n[r] = e[r]);
  if (e != null && $e) for (var r of $e(e)) t.indexOf(r) < 0 && St.call(e, r) && (n[r] = e[r]);
  return n;
}, On = yt(), T = On, ue = /{([^}]*)}/g, _t = /(\d+\s+[\+\-\*\/]\s+\d+)/g, $t = /var\([^)]+\)/g;
function ze(e) {
  return C(e) ? e.replace(/[A-Z]/g, (t, n) => n === 0 ? t : "." + t.toLowerCase()).toLowerCase() : e;
}
function Pn(e) {
  return I(e) && e.hasOwnProperty("$value") && e.hasOwnProperty("$type") ? e.$value : e;
}
function wn(e) {
  return e.replaceAll(/ /g, "").replace(/[^\w]/g, "-");
}
function Ce(e = "", t = "") {
  return wn(`${C(e, !1) && C(t, !1) ? `${e}-` : e}${t}`);
}
function Tt(e = "", t = "") {
  return `--${Ce(e, t)}`;
}
function Nn(e = "") {
  let t = (e.match(/{/g) || []).length, n = (e.match(/}/g) || []).length;
  return (t + n) % 2 !== 0;
}
function Ot(e, t = "", n = "", r = [], o) {
  if (C(e)) {
    let l = e.trim();
    if (Nn(l)) return;
    if (q(l, ue)) {
      let i = l.replaceAll(ue, (s) => {
        let a = s.replace(/{|}/g, "").split(".").filter((u) => !r.some((d) => q(u, d)));
        return `var(${Tt(n, ft(a.join("-")))}${b(o) ? `, ${o}` : ""})`;
      });
      return q(i.replace($t, "0"), _t) ? `calc(${i})` : i;
    }
    return l;
  } else if (cn(e)) return e;
}
function Cn(e, t, n) {
  C(t, !1) && e.push(`${t}:${n};`);
}
function ne(e, t) {
  return e ? `${e}{${t}}` : "";
}
function Pt(e, t) {
  if (e.indexOf("dt(") === -1) return e;
  function n(i, s) {
    let a = [], u = 0, d = "", p = null, c = 0;
    for (; u <= i.length; ) {
      let m = i[u];
      if ((m === '"' || m === "'" || m === "`") && i[u - 1] !== "\\" && (p = p === m ? null : m), !p && (m === "(" && c++, m === ")" && c--, (m === "," || u === i.length) && c === 0)) {
        let h = d.trim();
        h.startsWith("dt(") ? a.push(Pt(h, s)) : a.push(r(h)), d = "", u++;
        continue;
      }
      m !== void 0 && (d += m), u++;
    }
    return a;
  }
  function r(i) {
    let s = i[0];
    if ((s === '"' || s === "'" || s === "`") && i[i.length - 1] === s) return i.slice(1, -1);
    let a = Number(i);
    return isNaN(a) ? i : a;
  }
  let o = [], l = [];
  for (let i = 0; i < e.length; i++) if (e[i] === "d" && e.slice(i, i + 3) === "dt(") l.push(i), i += 2;
  else if (e[i] === ")" && l.length > 0) {
    let s = l.pop();
    l.length === 0 && o.push([s, i]);
  }
  if (!o.length) return e;
  for (let i = o.length - 1; i >= 0; i--) {
    let [s, a] = o[i], u = e.slice(s + 3, a), d = n(u, t), p = t(...d);
    e = e.slice(0, s) + p + e.slice(a + 1);
  }
  return e;
}
var Rr = (e) => {
  var t;
  let n = S.getTheme(), r = ke(n, e, void 0, "variable"), o = (t = r?.match(/--[\w-]+/g)) == null ? void 0 : t[0], l = ke(n, e, void 0, "value");
  return { name: o, variable: r, value: l };
}, Y = (...e) => ke(S.getTheme(), ...e), ke = (e = {}, t, n, r) => {
  if (t) {
    let { variable: o, options: l } = S.defaults || {}, { prefix: i, transform: s } = e?.options || l || {}, a = q(t, ue) ? t : `{${t}}`;
    return r === "value" || Ee(r) && s === "strict" ? S.getTokenValue(t) : Ot(a, void 0, i, [o.excludedKeyRegex], n);
  }
  return "";
};
function fe(e, ...t) {
  if (e instanceof Array) {
    let n = e.reduce((r, o, l) => {
      var i;
      return r + o + ((i = P(t[l], { dt: Y })) != null ? i : "");
    }, "");
    return Pt(n, Y);
  }
  return P(e, { dt: Y });
}
function kn(e, t = {}) {
  let n = S.defaults.variable, { prefix: r = n.prefix, selector: o = n.selector, excludedKeyRegex: l = n.excludedKeyRegex } = t, i = [], s = [], a = [{ node: e, path: r }];
  for (; a.length; ) {
    let { node: d, path: p } = a.pop();
    for (let c in d) {
      let m = d[c], h = Pn(m), y = q(c, l) ? Ce(p) : Ce(p, ft(c));
      if (I(h)) a.push({ node: h, path: y });
      else {
        let g = Tt(y), v = Ot(h, y, r, [l]);
        Cn(s, g, v);
        let _ = y;
        r && _.startsWith(r + "-") && (_ = _.slice(r.length + 1)), i.push(_.replace(/-/g, "."));
      }
    }
  }
  let u = s.join("");
  return { value: s, tokens: i, declarations: u, css: ne(o, u) };
}
var w = { regex: { rules: { class: { pattern: /^\.([a-zA-Z][\w-]*)$/, resolve(e) {
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
  return kn(e, { prefix: t?.prefix });
}, getCommon({ name: e = "", theme: t = {}, params: n, set: r, defaults: o }) {
  var l, i, s, a, u, d, p;
  let { preset: c, options: m } = t, h, y, g, v, _, L, V;
  if (b(c) && m.transform !== "strict") {
    let { primitive: Z, semantic: W, extend: E } = c, x = W || {}, { colorScheme: R } = x, B = A(x, ["colorScheme"]), M = E || {}, { colorScheme: U } = M, H = A(M, ["colorScheme"]), D = R || {}, { dark: F } = D, J = A(D, ["dark"]), z = U || {}, { dark: X } = z, ee = A(z, ["dark"]), j = b(Z) ? this._toVariables({ primitive: Z }, m) : {}, k = b(B) ? this._toVariables({ semantic: B }, m) : {}, K = b(J) ? this._toVariables({ light: J }, m) : {}, he = b(F) ? this._toVariables({ dark: F }, m) : {}, te = b(H) ? this._toVariables({ semantic: H }, m) : {}, Me = b(ee) ? this._toVariables({ light: ee }, m) : {}, De = b(X) ? this._toVariables({ dark: X }, m) : {}, [At, Et] = [(l = j.declarations) != null ? l : "", j.tokens], [xt, Rt] = [(i = k.declarations) != null ? i : "", k.tokens || []], [Mt, Dt] = [(s = K.declarations) != null ? s : "", K.tokens || []], [It, Vt] = [(a = he.declarations) != null ? a : "", he.tokens || []], [Wt, Bt] = [(u = te.declarations) != null ? u : "", te.tokens || []], [Ut, Ht] = [(d = Me.declarations) != null ? d : "", Me.tokens || []], [Ft, zt] = [(p = De.declarations) != null ? p : "", De.tokens || []];
    h = this.transformCSS(e, At, "light", "variable", m, r, o), y = Et;
    let Kt = this.transformCSS(e, `${xt}${Mt}`, "light", "variable", m, r, o), Gt = this.transformCSS(e, `${It}`, "dark", "variable", m, r, o);
    g = `${Kt}${Gt}`, v = [.../* @__PURE__ */ new Set([...Rt, ...Dt, ...Vt])];
    let qt = this.transformCSS(e, `${Wt}${Ut}color-scheme:light`, "light", "variable", m, r, o), Yt = this.transformCSS(e, `${Ft}color-scheme:dark`, "dark", "variable", m, r, o);
    _ = `${qt}${Yt}`, L = [.../* @__PURE__ */ new Set([...Bt, ...Ht, ...zt])], V = P(c.css, { dt: Y });
  }
  return { primitive: { css: h, tokens: y }, semantic: { css: g, tokens: v }, global: { css: _, tokens: L }, style: V };
}, getPreset({ name: e = "", preset: t = {}, options: n, params: r, set: o, defaults: l, selector: i }) {
  var s, a, u;
  let d, p, c;
  if (b(t) && n.transform !== "strict") {
    let m = e.replace("-directive", ""), h = t, { colorScheme: y, extend: g, css: v } = h, _ = A(h, ["colorScheme", "extend", "css"]), L = g || {}, { colorScheme: V } = L, Z = A(L, ["colorScheme"]), W = y || {}, { dark: E } = W, x = A(W, ["dark"]), R = V || {}, { dark: B } = R, M = A(R, ["dark"]), U = b(_) ? this._toVariables({ [m]: N(N({}, _), Z) }, n) : {}, H = b(x) ? this._toVariables({ [m]: N(N({}, x), M) }, n) : {}, D = b(E) ? this._toVariables({ [m]: N(N({}, E), B) }, n) : {}, [F, J] = [(s = U.declarations) != null ? s : "", U.tokens || []], [z, X] = [(a = H.declarations) != null ? a : "", H.tokens || []], [ee, j] = [(u = D.declarations) != null ? u : "", D.tokens || []], k = this.transformCSS(m, `${F}${z}`, "light", "variable", n, o, l, i), K = this.transformCSS(m, ee, "dark", "variable", n, o, l, i);
    d = `${k}${K}`, p = [.../* @__PURE__ */ new Set([...J, ...X, ...j])], c = P(v, { dt: Y });
  }
  return { css: d, tokens: p, style: c };
}, getPresetC({ name: e = "", theme: t = {}, params: n, set: r, defaults: o }) {
  var l;
  let { preset: i, options: s } = t, a = (l = i?.components) == null ? void 0 : l[e];
  return this.getPreset({ name: e, preset: a, options: s, params: n, set: r, defaults: o });
}, getPresetD({ name: e = "", theme: t = {}, params: n, set: r, defaults: o }) {
  var l, i;
  let s = e.replace("-directive", ""), { preset: a, options: u } = t, d = ((l = a?.components) == null ? void 0 : l[s]) || ((i = a?.directives) == null ? void 0 : i[s]);
  return this.getPreset({ name: s, preset: d, options: u, params: n, set: r, defaults: o });
}, applyDarkColorScheme(e) {
  return !(e.darkModeSelector === "none" || e.darkModeSelector === !1);
}, getColorSchemeOption(e, t) {
  var n;
  return this.applyDarkColorScheme(e) ? this.regex.resolve(e.darkModeSelector === !0 ? t.options.darkModeSelector : (n = e.darkModeSelector) != null ? n : t.options.darkModeSelector) : [];
}, getLayerOrder(e, t = {}, n, r) {
  let { cssLayer: o } = t;
  return o ? `@layer ${P(o.order || o.name || "primeui", n)}` : "";
}, getCommonStyleSheet({ name: e = "", theme: t = {}, params: n, props: r = {}, set: o, defaults: l }) {
  let i = this.getCommon({ name: e, theme: t, params: n, set: o, defaults: l }), s = Object.entries(r).reduce((a, [u, d]) => a.push(`${u}="${d}"`) && a, []).join(" ");
  return Object.entries(i || {}).reduce((a, [u, d]) => {
    if (I(d) && Object.hasOwn(d, "css")) {
      let p = le(d.css), c = `${u}-variables`;
      a.push(`<style type="text/css" data-primevue-style-id="${c}" ${s}>${p}</style>`);
    }
    return a;
  }, []).join("");
}, getStyleSheet({ name: e = "", theme: t = {}, params: n, props: r = {}, set: o, defaults: l }) {
  var i;
  let s = { name: e, theme: t, params: n, set: o, defaults: l }, a = (i = e.includes("-directive") ? this.getPresetD(s) : this.getPresetC(s)) == null ? void 0 : i.css, u = Object.entries(r).reduce((d, [p, c]) => d.push(`${p}="${c}"`) && d, []).join(" ");
  return a ? `<style type="text/css" data-primevue-style-id="${e}-variables" ${u}>${le(a)}</style>` : "";
}, createTokens(e = {}, t, n = "", r = "", o = {}) {
  let l = function(s, a = {}, u = []) {
    if (u.includes(this.path)) return console.warn(`Circular reference detected at ${this.path}`), { colorScheme: s, path: this.path, paths: a, value: void 0 };
    u.push(this.path), a.name = this.path, a.binding || (a.binding = {});
    let d = this.value;
    if (typeof this.value == "string" && ue.test(this.value)) {
      let p = this.value.trim().replace(ue, (c) => {
        var m;
        let h = c.slice(1, -1), y = this.tokens[h];
        if (!y) return console.warn(`Token not found for path: ${h}`), "__UNRESOLVED__";
        let g = y.computed(s, a, u);
        return Array.isArray(g) && g.length === 2 ? `light-dark(${g[0].value},${g[1].value})` : (m = g?.value) != null ? m : "__UNRESOLVED__";
      });
      d = _t.test(p.replace($t, "0")) ? `calc(${p})` : p;
    }
    return Ee(a.binding) && delete a.binding, u.pop(), { colorScheme: s, path: this.path, paths: a, value: d.includes("__UNRESOLVED__") ? void 0 : d };
  }, i = (s, a, u) => {
    Object.entries(s).forEach(([d, p]) => {
      let c = q(d, t.variable.excludedKeyRegex) ? a : a ? `${a}.${ze(d)}` : ze(d), m = u ? `${u}.${d}` : d;
      I(p) ? i(p, c, m) : (o[c] || (o[c] = { paths: [], computed: (h, y = {}, g = []) => {
        if (o[c].paths.length === 1) return o[c].paths[0].computed(o[c].paths[0].scheme, y.binding, g);
        if (h && h !== "none") for (let v = 0; v < o[c].paths.length; v++) {
          let _ = o[c].paths[v];
          if (_.scheme === h) return _.computed(h, y.binding, g);
        }
        return o[c].paths.map((v) => v.computed(v.scheme, y[v.scheme], g));
      } }), o[c].paths.push({ path: m, value: p, scheme: m.includes("colorScheme.light") ? "light" : m.includes("colorScheme.dark") ? "dark" : "none", computed: l, tokens: o }));
    });
  };
  return i(e, n, r), o;
}, getTokenValue(e, t, n) {
  var r;
  let o = ((s) => s.split(".").filter((a) => !q(a.toLowerCase(), n.variable.excludedKeyRegex)).join("."))(t), l = t.includes("colorScheme.light") ? "light" : t.includes("colorScheme.dark") ? "dark" : void 0, i = [(r = e[o]) == null ? void 0 : r.computed(l)].flat().filter((s) => s);
  return i.length === 1 ? i[0].value : i.reduce((s = {}, a) => {
    let u = a, { colorScheme: d } = u, p = A(u, ["colorScheme"]);
    return s[d] = p, s;
  }, void 0);
}, getSelectorRule(e, t, n, r) {
  return n === "class" || n === "attr" ? ne(b(t) ? `${e}${t},${e} ${t}` : e, r) : ne(e, ne(t ?? ":root,:host", r));
}, transformCSS(e, t, n, r, o = {}, l, i, s) {
  if (b(t)) {
    let { cssLayer: a } = o;
    if (r !== "style") {
      let u = this.getColorSchemeOption(o, i);
      t = n === "dark" ? u.reduce((d, { type: p, selector: c }) => (b(c) && (d += c.includes("[CSS]") ? c.replace("[CSS]", t) : this.getSelectorRule(c, s, p, t)), d), "") : ne(s ?? ":root,:host", t);
    }
    if (a) {
      let u = { name: "primeui" };
      I(a) && (u.name = P(a.name, { name: e, type: r })), b(u.name) && (t = ne(`@layer ${u.name}`, t), l?.layerNames(u.name));
    }
    return t;
  }
  return "";
} }, S = { defaults: { variable: { prefix: "p", selector: ":root,:host", excludedKeyRegex: /^(primitive|semantic|components|directives|variables|colorscheme|light|dark|common|root|states|extend|css)$/gi }, options: { prefix: "p", darkModeSelector: "system", cssLayer: !1 } }, _theme: void 0, _layerNames: /* @__PURE__ */ new Set(), _loadedStyleNames: /* @__PURE__ */ new Set(), _loadingStyles: /* @__PURE__ */ new Set(), _tokens: {}, update(e = {}) {
  let { theme: t } = e;
  t && (this._theme = we(N({}, t), { options: N(N({}, this.defaults.options), t.options) }), this._tokens = w.createTokens(this.preset, this.defaults), this.clearLoadedStyleNames());
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
  this.update({ theme: e }), T.emit("theme:change", e);
}, getPreset() {
  return this.preset;
}, setPreset(e) {
  this._theme = we(N({}, this.theme), { preset: e }), this._tokens = w.createTokens(e, this.defaults), this.clearLoadedStyleNames(), T.emit("preset:change", e), T.emit("theme:change", this.theme);
}, getOptions() {
  return this.options;
}, setOptions(e) {
  this._theme = we(N({}, this.theme), { options: e }), this.clearLoadedStyleNames(), T.emit("options:change", e), T.emit("theme:change", this.theme);
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
  return w.getTokenValue(this.tokens, e, this.defaults);
}, getCommon(e = "", t) {
  return w.getCommon({ name: e, theme: this.theme, params: t, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } });
}, getComponent(e = "", t) {
  let n = { name: e, theme: this.theme, params: t, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } };
  return w.getPresetC(n);
}, getDirective(e = "", t) {
  let n = { name: e, theme: this.theme, params: t, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } };
  return w.getPresetD(n);
}, getCustomPreset(e = "", t, n, r) {
  let o = { name: e, preset: t, options: this.options, selector: n, params: r, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } };
  return w.getPreset(o);
}, getLayerOrderCSS(e = "") {
  return w.getLayerOrder(e, this.options, { names: this.getLayerNames() }, this.defaults);
}, transformCSS(e = "", t, n = "style", r) {
  return w.transformCSS(e, t, r, n, this.options, { layerNames: this.setLayerNames.bind(this) }, this.defaults);
}, getCommonStyleSheet(e = "", t, n = {}) {
  return w.getCommonStyleSheet({ name: e, theme: this.theme, params: t, props: n, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } });
}, getStyleSheet(e, t, n = {}) {
  return w.getStyleSheet({ name: e, theme: this.theme, params: t, props: n, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } });
}, onStyleMounted(e) {
  this._loadingStyles.add(e);
}, onStyleUpdated(e) {
  this._loadingStyles.add(e);
}, onStyleLoaded(e, { name: t }) {
  this._loadingStyles.size && (this._loadingStyles.delete(t), T.emit(`theme:${t}:load`, e), !this._loadingStyles.size && T.emit("theme:load"));
} }, $ = {
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
}, Ln = `
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
function de(e) {
  "@babel/helpers - typeof";
  return de = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, de(e);
}
function Ke(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(e);
    t && (r = r.filter(function(o) {
      return Object.getOwnPropertyDescriptor(e, o).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function Ge(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? Ke(Object(n), !0).forEach(function(r) {
      jn(e, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Ke(Object(n)).forEach(function(r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return e;
}
function jn(e, t, n) {
  return (t = An(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function An(e) {
  var t = En(e, "string");
  return de(t) == "symbol" ? t : t + "";
}
function En(e, t) {
  if (de(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (de(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
function xn(e) {
  var t = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0;
  Ie() && Ie().components ? Zt(e) : t ? e() : Jt(e);
}
var Rn = 0;
function Mn(e) {
  var t = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, n = be(!1), r = be(e), o = be(null), l = gt() ? window.document : void 0, i = t.document, s = i === void 0 ? l : i, a = t.immediate, u = a === void 0 ? !0 : a, d = t.manual, p = d === void 0 ? !1 : d, c = t.name, m = c === void 0 ? "style_".concat(++Rn) : c, h = t.id, y = h === void 0 ? void 0 : h, g = t.media, v = g === void 0 ? void 0 : g, _ = t.nonce, L = _ === void 0 ? void 0 : _, V = t.first, Z = V === void 0 ? !1 : V, W = t.onMounted, E = W === void 0 ? void 0 : W, x = t.onUpdated, R = x === void 0 ? void 0 : x, B = t.onLoad, M = B === void 0 ? void 0 : B, U = t.props, H = U === void 0 ? {} : U, D = function() {
  }, F = function(X) {
    var ee = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    if (s) {
      var j = Ge(Ge({}, H), ee), k = j.name || m, K = j.id || y, he = j.nonce || L;
      o.value = s.querySelector('style[data-primevue-style-id="'.concat(k, '"]')) || s.getElementById(K) || s.createElement("style"), o.value.isConnected || (r.value = X || e, _e(o.value, {
        type: "text/css",
        id: K,
        media: v,
        nonce: he
      }), Z ? s.head.prepend(o.value) : s.head.appendChild(o.value), Sn(o.value, "data-primevue-style-id", k), _e(o.value, j), o.value.onload = function(te) {
        return M?.(te, {
          name: k
        });
      }, E?.(k)), !n.value && (D = ie(r, function(te) {
        o.value.textContent = te, R?.(k);
      }, {
        immediate: !0
      }), n.value = !0);
    }
  }, J = function() {
    !s || !n.value || (D(), vn(o.value) && s.head.removeChild(o.value), n.value = !1, o.value = null);
  };
  return u && !p && xn(F), {
    id: y,
    name: m,
    el: o,
    css: r,
    unload: J,
    load: F,
    isLoaded: Qt(n)
  };
}
function ce(e) {
  "@babel/helpers - typeof";
  return ce = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, ce(e);
}
var qe, Ye, Qe, Ze;
function Je(e, t) {
  return Wn(e) || Vn(e, t) || In(e, t) || Dn();
}
function Dn() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function In(e, t) {
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
function Vn(e, t) {
  var n = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (n != null) {
    var r, o, l, i, s = [], a = !0, u = !1;
    try {
      if (l = (n = n.call(e)).next, t !== 0) for (; !(a = (r = l.call(n)).done) && (s.push(r.value), s.length !== t); a = !0) ;
    } catch (d) {
      u = !0, o = d;
    } finally {
      try {
        if (!a && n.return != null && (i = n.return(), Object(i) !== i)) return;
      } finally {
        if (u) throw o;
      }
    }
    return s;
  }
}
function Wn(e) {
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
function Ne(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? et(Object(n), !0).forEach(function(r) {
      Bn(e, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : et(Object(n)).forEach(function(r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return e;
}
function Bn(e, t, n) {
  return (t = Un(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Un(e) {
  var t = Hn(e, "string");
  return ce(t) == "symbol" ? t : t + "";
}
function Hn(e, t) {
  if (ce(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (ce(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
function ye(e, t) {
  return t || (t = e.slice(0)), Object.freeze(Object.defineProperties(e, { raw: { value: Object.freeze(t) } }));
}
var Fn = function(t) {
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
}, zn = {}, Kn = {}, O = {
  name: "base",
  css: Fn,
  style: Ln,
  classes: zn,
  inlineStyles: Kn,
  load: function(t) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, r = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : function(l) {
      return l;
    }, o = r(fe(qe || (qe = ye(["", ""])), t));
    return b(o) ? Mn(le(o), Ne({
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
      return S.transformCSS(n.name || t.name, "".concat(o).concat(fe(Ye || (Ye = ye(["", ""])), r)));
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
      var r = P(this.css, {
        dt: Y
      }) || "", o = le(fe(Qe || (Qe = ye(["", "", ""])), r, t)), l = Object.entries(n).reduce(function(i, s) {
        var a = Je(s, 2), u = a[0], d = a[1];
        return i.push("".concat(u, '="').concat(d, '"')) && i;
      }, []).join(" ");
      return b(o) ? '<style type="text/css" data-primevue-style-id="'.concat(this.name, '" ').concat(l, ">").concat(o, "</style>") : "";
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
      var o = this.name === "base" ? "global-style" : "".concat(this.name, "-style"), l = fe(Ze || (Ze = ye(["", ""])), P(this.style, {
        dt: Y
      })), i = le(S.transformCSS(o, l)), s = Object.entries(n).reduce(function(a, u) {
        var d = Je(u, 2), p = d[0], c = d[1];
        return a.push("".concat(p, '="').concat(c, '"')) && a;
      }, []).join(" ");
      b(i) && r.push('<style type="text/css" data-primevue-style-id="'.concat(o, '" ').concat(s, ">").concat(i, "</style>"));
    }
    return r.join("");
  },
  extend: function(t) {
    return Ne(Ne({}, this), {}, {
      css: void 0,
      style: void 0
    }, t);
  }
}, ve = yt();
function me(e) {
  "@babel/helpers - typeof";
  return me = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, me(e);
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
function ge(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? tt(Object(n), !0).forEach(function(r) {
      Gn(e, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : tt(Object(n)).forEach(function(r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return e;
}
function Gn(e, t, n) {
  return (t = qn(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function qn(e) {
  var t = Yn(e, "string");
  return me(t) == "symbol" ? t : t + "";
}
function Yn(e, t) {
  if (me(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (me(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var Qn = {
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
    text: [$.STARTS_WITH, $.CONTAINS, $.NOT_CONTAINS, $.ENDS_WITH, $.EQUALS, $.NOT_EQUALS],
    numeric: [$.EQUALS, $.NOT_EQUALS, $.LESS_THAN, $.LESS_THAN_OR_EQUAL_TO, $.GREATER_THAN, $.GREATER_THAN_OR_EQUAL_TO],
    date: [$.DATE_IS, $.DATE_IS_NOT, $.DATE_BEFORE, $.DATE_AFTER]
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
}, Zn = Symbol();
function Jn(e, t) {
  var n = {
    config: Xt(t)
  };
  return e.config.globalProperties.$primevue = n, e.provide(Zn, n), Xn(), er(e, n), n;
}
var re = [];
function Xn() {
  T.clear(), re.forEach(function(e) {
    return e?.();
  }), re = [];
}
function er(e, t) {
  var n = be(!1), r = function() {
    var u;
    if (((u = t.config) === null || u === void 0 ? void 0 : u.theme) !== "none" && !S.isStyleNameLoaded("common")) {
      var d, p, c = ((d = O.getCommonTheme) === null || d === void 0 ? void 0 : d.call(O)) || {}, m = c.primitive, h = c.semantic, y = c.global, g = c.style, v = {
        nonce: (p = t.config) === null || p === void 0 || (p = p.csp) === null || p === void 0 ? void 0 : p.nonce
      };
      O.load(m?.css, ge({
        name: "primitive-variables"
      }, v)), O.load(h?.css, ge({
        name: "semantic-variables"
      }, v)), O.load(y?.css, ge({
        name: "global-variables"
      }, v)), O.loadStyle(ge({
        name: "global-style"
      }, v), g), S.setLoadedStyleName("common");
    }
  };
  T.on("theme:change", function(a) {
    n.value || (e.config.globalProperties.$primevue.config.theme = a, n.value = !0);
  });
  var o = ie(t.config, function(a, u) {
    ve.emit("config:change", {
      newValue: a,
      oldValue: u
    });
  }, {
    immediate: !0,
    deep: !0
  }), l = ie(function() {
    return t.config.ripple;
  }, function(a, u) {
    ve.emit("config:ripple:change", {
      newValue: a,
      oldValue: u
    });
  }, {
    immediate: !0,
    deep: !0
  }), i = ie(function() {
    return t.config.theme;
  }, function(a, u) {
    n.value || S.setTheme(a), t.config.unstyled || r(), n.value = !1, ve.emit("config:theme:change", {
      newValue: a,
      oldValue: u
    });
  }, {
    immediate: !0,
    deep: !1
  }), s = ie(function() {
    return t.config.unstyled;
  }, function(a, u) {
    !a && t.config.theme && r(), ve.emit("config:unstyled:change", {
      newValue: a,
      oldValue: u
    });
  }, {
    immediate: !0,
    deep: !0
  });
  re.push(o), re.push(l), re.push(i), re.push(s);
}
var tr = {
  install: function(t, n) {
    var r = mn(Qn, n);
    Jn(t, r);
  }
}, wt = {
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
    this.mounted = gt();
  },
  computed: {
    inline: function() {
      return this.disabled || this.appendTo === "self";
    }
  }
};
function nr(e, t, n, r, o, l) {
  return l.inline ? Se(e.$slots, "default", {
    key: 0
  }) : o.mounted ? (en(), tn(dt, {
    key: 1,
    to: n.appendTo
  }, [Se(e.$slots, "default")], 8, ["to"])) : ct("", !0);
}
wt.render = nr;
var oe = {
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
function rr() {
  var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "pc", t = nn();
  return "".concat(e).concat(t.replace("v-", "").replaceAll("-", "_"));
}
var nt = O.extend({
  name: "common"
});
function pe(e) {
  "@babel/helpers - typeof";
  return pe = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, pe(e);
}
function or(e) {
  return kt(e) || ar(e) || Ct(e) || Nt();
}
function ar(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function ae(e, t) {
  return kt(e) || ir(e, t) || Ct(e, t) || Nt();
}
function Nt() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Ct(e, t) {
  if (e) {
    if (typeof e == "string") return Le(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Le(e, t) : void 0;
  }
}
function Le(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function ir(e, t) {
  var n = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (n != null) {
    var r, o, l, i, s = [], a = !0, u = !1;
    try {
      if (l = (n = n.call(e)).next, t === 0) {
        if (Object(n) !== n) return;
        a = !1;
      } else for (; !(a = (r = l.call(n)).done) && (s.push(r.value), s.length !== t); a = !0) ;
    } catch (d) {
      u = !0, o = d;
    } finally {
      try {
        if (!a && n.return != null && (i = n.return(), Object(i) !== i)) return;
      } finally {
        if (u) throw o;
      }
    }
    return s;
  }
}
function kt(e) {
  if (Array.isArray(e)) return e;
}
function rt(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(e);
    t && (r = r.filter(function(o) {
      return Object.getOwnPropertyDescriptor(e, o).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function f(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? rt(Object(n), !0).forEach(function(r) {
      se(e, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : rt(Object(n)).forEach(function(r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return e;
}
function se(e, t, n) {
  return (t = sr(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function sr(e) {
  var t = lr(e, "string");
  return pe(t) == "symbol" ? t : t + "";
}
function lr(e, t) {
  if (pe(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (pe(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var Mr = {
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
        T.off("theme:change", this._loadCoreStyles), t || (this._loadCoreStyles(), this._themeChangeListener(this._loadCoreStyles));
      }
    },
    dt: {
      immediate: !0,
      handler: function(t, n) {
        var r = this;
        T.off("theme:change", this._themeScopedListener), t ? (this._loadScopedThemeStyles(t), this._themeScopedListener = function() {
          return r._loadScopedThemeStyles(t);
        }, this._themeChangeListener(this._themeScopedListener)) : this._unloadScopedThemeStyles();
      }
    }
  },
  scopedStyleEl: void 0,
  rootEl: void 0,
  uid: void 0,
  $attrSelector: void 0,
  beforeCreate: function() {
    var t, n, r, o, l, i, s, a, u, d, p, c = (t = this.pt) === null || t === void 0 ? void 0 : t._usept, m = c ? (n = this.pt) === null || n === void 0 || (n = n.originalValue) === null || n === void 0 ? void 0 : n[this.$.type.name] : void 0, h = c ? (r = this.pt) === null || r === void 0 || (r = r.value) === null || r === void 0 ? void 0 : r[this.$.type.name] : this.pt;
    (o = h || m) === null || o === void 0 || (o = o.hooks) === null || o === void 0 || (l = o.onBeforeCreate) === null || l === void 0 || l.call(o);
    var y = (i = this.$primevueConfig) === null || i === void 0 || (i = i.pt) === null || i === void 0 ? void 0 : i._usept, g = y ? (s = this.$primevue) === null || s === void 0 || (s = s.config) === null || s === void 0 || (s = s.pt) === null || s === void 0 ? void 0 : s.originalValue : void 0, v = y ? (a = this.$primevue) === null || a === void 0 || (a = a.config) === null || a === void 0 || (a = a.pt) === null || a === void 0 ? void 0 : a.value : (u = this.$primevue) === null || u === void 0 || (u = u.config) === null || u === void 0 ? void 0 : u.pt;
    (d = v || g) === null || d === void 0 || (d = d[this.$.type.name]) === null || d === void 0 || (d = d.hooks) === null || d === void 0 || (p = d.onBeforeCreate) === null || p === void 0 || p.call(d), this.$attrSelector = rr(), this.uid = this.$attrs.id || this.$attrSelector.replace("pc", "pv_id_");
  },
  created: function() {
    this._hook("onCreated");
  },
  beforeMount: function() {
    var t;
    this.rootEl = bn(Q(this.$el) ? this.$el : (t = this.$el) === null || t === void 0 ? void 0 : t.parentElement, "[".concat(this.$attrSelector, "]")), this.rootEl && (this.rootEl.$pc = f({
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
        var n = this._usePT(this._getPT(this.pt, this.$.type.name), this._getOptionValue, "hooks.".concat(t)), r = this._useDefaultPT(this._getOptionValue, "hooks.".concat(t));
        n?.(), r?.();
      }
    },
    _mergeProps: function(t) {
      for (var n = arguments.length, r = new Array(n > 1 ? n - 1 : 0), o = 1; o < n; o++)
        r[o - 1] = arguments[o];
      return mt(t) ? t.apply(void 0, r) : Pe.apply(void 0, r);
    },
    _load: function() {
      oe.isStyleNameLoaded("base") || (O.loadCSS(this.$styleOptions), this._loadGlobalStyles(), oe.setLoadedStyleName("base")), this._loadThemeStyles();
    },
    _loadStyles: function() {
      this._load(), this._themeChangeListener(this._load);
    },
    _loadCoreStyles: function() {
      var t, n;
      !oe.isStyleNameLoaded((t = this.$style) === null || t === void 0 ? void 0 : t.name) && (n = this.$style) !== null && n !== void 0 && n.name && (nt.loadCSS(this.$styleOptions), this.$options.style && this.$style.loadCSS(this.$styleOptions), oe.setLoadedStyleName(this.$style.name));
    },
    _loadGlobalStyles: function() {
      var t = this._useGlobalPT(this._getOptionValue, "global.css", this.$params);
      b(t) && O.load(t, f({
        name: "global"
      }, this.$styleOptions));
    },
    _loadThemeStyles: function() {
      var t, n;
      if (!(this.isUnstyled || this.$theme === "none")) {
        if (!S.isStyleNameLoaded("common")) {
          var r, o, l = ((r = this.$style) === null || r === void 0 || (o = r.getCommonTheme) === null || o === void 0 ? void 0 : o.call(r)) || {}, i = l.primitive, s = l.semantic, a = l.global, u = l.style;
          O.load(i?.css, f({
            name: "primitive-variables"
          }, this.$styleOptions)), O.load(s?.css, f({
            name: "semantic-variables"
          }, this.$styleOptions)), O.load(a?.css, f({
            name: "global-variables"
          }, this.$styleOptions)), O.loadStyle(f({
            name: "global-style"
          }, this.$styleOptions), u), S.setLoadedStyleName("common");
        }
        if (!S.isStyleNameLoaded((t = this.$style) === null || t === void 0 ? void 0 : t.name) && (n = this.$style) !== null && n !== void 0 && n.name) {
          var d, p, c, m, h = ((d = this.$style) === null || d === void 0 || (p = d.getComponentTheme) === null || p === void 0 ? void 0 : p.call(d)) || {}, y = h.css, g = h.style;
          (c = this.$style) === null || c === void 0 || c.load(y, f({
            name: "".concat(this.$style.name, "-variables")
          }, this.$styleOptions)), (m = this.$style) === null || m === void 0 || m.loadStyle(f({
            name: "".concat(this.$style.name, "-style")
          }, this.$styleOptions), g), S.setLoadedStyleName(this.$style.name);
        }
        if (!S.isStyleNameLoaded("layer-order")) {
          var v, _, L = (v = this.$style) === null || v === void 0 || (_ = v.getLayerOrderThemeCSS) === null || _ === void 0 ? void 0 : _.call(v);
          O.load(L, f({
            name: "layer-order",
            first: !0
          }, this.$styleOptions)), S.setLoadedStyleName("layer-order");
        }
      }
    },
    _loadScopedThemeStyles: function(t) {
      var n, r, o, l = ((n = this.$style) === null || n === void 0 || (r = n.getPresetTheme) === null || r === void 0 ? void 0 : r.call(n, t, "[".concat(this.$attrSelector, "]"))) || {}, i = l.css, s = (o = this.$style) === null || o === void 0 ? void 0 : o.load(i, f({
        name: "".concat(this.$attrSelector, "-").concat(this.$style.name)
      }, this.$styleOptions));
      this.scopedStyleEl = s.el;
    },
    _unloadScopedThemeStyles: function() {
      var t;
      (t = this.scopedStyleEl) === null || t === void 0 || (t = t.value) === null || t === void 0 || t.remove();
    },
    _themeChangeListener: function() {
      var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : function() {
      };
      oe.clearLoadedStyleNames(), T.on("theme:change", t);
    },
    _removeThemeListeners: function() {
      T.off("theme:change", this._loadCoreStyles), T.off("theme:change", this._load), T.off("theme:change", this._themeScopedListener);
    },
    _getHostInstance: function(t) {
      return t ? this.$options.hostName ? t.$.type.name === this.$options.hostName ? t : this._getHostInstance(t.$parentInstance) : t.$parentInstance : void 0;
    },
    _getPropValue: function(t) {
      var n;
      return this[t] || ((n = this._getHostInstance(this)) === null || n === void 0 ? void 0 : n[t]);
    },
    _getOptionValue: function(t) {
      var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", r = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
      return ht(t, n, r);
    },
    _getPTValue: function() {
      var t, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", o = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {}, l = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : !0, i = /./g.test(r) && !!o[r.split(".")[0]], s = this._getPropValue("ptOptions") || ((t = this.$primevueConfig) === null || t === void 0 ? void 0 : t.ptOptions) || {}, a = s.mergeSections, u = a === void 0 ? !0 : a, d = s.mergeProps, p = d === void 0 ? !1 : d, c = l ? i ? this._useGlobalPT(this._getPTClassValue, r, o) : this._useDefaultPT(this._getPTClassValue, r, o) : void 0, m = i ? void 0 : this._getPTSelf(n, this._getPTClassValue, r, f(f({}, o), {}, {
        global: c || {}
      })), h = this._getPTDatasets(r);
      return u || !u && m ? p ? this._mergeProps(p, c, m, h) : f(f(f({}, c), m), h) : f(f({}, m), h);
    },
    _getPTSelf: function() {
      for (var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length, r = new Array(n > 1 ? n - 1 : 0), o = 1; o < n; o++)
        r[o - 1] = arguments[o];
      return Pe(
        this._usePT.apply(this, [this._getPT(t, this.$name)].concat(r)),
        // Exp; <component :pt="{}"
        this._usePT.apply(this, [this.$_attrsPT].concat(r))
        // Exp; <component :pt:[passthrough_key]:[attribute]="{value}" or <component :pt:[passthrough_key]="() =>{value}"
      );
    },
    _getPTDatasets: function() {
      var t, n, r = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", o = "data-pc-", l = r === "root" && b((t = this.pt) === null || t === void 0 ? void 0 : t["data-pc-section"]);
      return r !== "transition" && f(f({}, r === "root" && f(f(se({}, "".concat(o, "name"), G(l ? (n = this.pt) === null || n === void 0 ? void 0 : n["data-pc-section"] : this.$.type.name)), l && se({}, "".concat(o, "extend"), G(this.$.type.name))), {}, se({}, "".concat(this.$attrSelector), ""))), {}, se({}, "".concat(o, "section"), G(r)));
    },
    _getPTClassValue: function() {
      var t = this._getOptionValue.apply(this, arguments);
      return C(t) || dn(t) ? {
        class: t
      } : t;
    },
    _getPT: function(t) {
      var n = this, r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", o = arguments.length > 2 ? arguments[2] : void 0, l = function(s) {
        var a, u = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1, d = o ? o(s) : s, p = G(r), c = G(n.$name);
        return (a = u ? p !== c ? d?.[p] : void 0 : d?.[p]) !== null && a !== void 0 ? a : d;
      };
      return t != null && t.hasOwnProperty("_usept") ? {
        _usept: t._usept,
        originalValue: l(t.originalValue),
        value: l(t.value)
      } : l(t, !0);
    },
    _usePT: function(t, n, r, o) {
      var l = function(y) {
        return n(y, r, o);
      };
      if (t != null && t.hasOwnProperty("_usept")) {
        var i, s = t._usept || ((i = this.$primevueConfig) === null || i === void 0 ? void 0 : i.ptOptions) || {}, a = s.mergeSections, u = a === void 0 ? !0 : a, d = s.mergeProps, p = d === void 0 ? !1 : d, c = l(t.originalValue), m = l(t.value);
        return c === void 0 && m === void 0 ? void 0 : C(m) ? m : C(c) ? c : u || !u && m ? p ? this._mergeProps(p, c, m) : f(f({}, c), m) : m;
      }
      return l(t);
    },
    _useGlobalPT: function(t, n, r) {
      return this._usePT(this.globalPT, t, n, r);
    },
    _useDefaultPT: function(t, n, r) {
      return this._usePT(this.defaultPT, t, n, r);
    },
    ptm: function() {
      var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
      return this._getPTValue(this.pt, t, f(f({}, this.$params), n));
    },
    ptmi: function() {
      var t, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, o = Pe(this.$_attrsWithoutPT, this.ptm(n, r));
      return o?.hasOwnProperty("id") && ((t = o.id) !== null && t !== void 0 || (o.id = this.$id)), o;
    },
    ptmo: function() {
      var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", r = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
      return this._getPTValue(t, n, f({
        instance: this
      }, r), !1);
    },
    cx: function() {
      var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
      return this.isUnstyled ? void 0 : this._getOptionValue(this.$style.classes, t, f(f({}, this.$params), n));
    },
    sx: function() {
      var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0, r = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
      if (n) {
        var o = this._getOptionValue(this.$style.inlineStyles, t, f(f({}, this.$params), r)), l = this._getOptionValue(nt.inlineStyles, t, f(f({}, this.$params), r));
        return [l, o];
      }
    }
  },
  computed: {
    globalPT: function() {
      var t, n = this;
      return this._getPT((t = this.$primevueConfig) === null || t === void 0 ? void 0 : t.pt, void 0, function(r) {
        return P(r, {
          instance: n
        });
      });
    },
    defaultPT: function() {
      var t, n = this;
      return this._getPT((t = this.$primevueConfig) === null || t === void 0 ? void 0 : t.pt, void 0, function(r) {
        return n._getOptionValue(r, n.$name, f({}, n.$params)) || P(r, f({}, n.$params));
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
      return Object.fromEntries(Object.entries(this.$props).filter(function(r) {
        var o = ae(r, 1), l = o[0];
        return n?.includes(l);
      }));
    },
    $theme: function() {
      var t;
      return (t = this.$primevueConfig) === null || t === void 0 ? void 0 : t.theme;
    },
    $style: function() {
      return f(f({
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
        var n = ae(t, 1), r = n[0];
        return r?.startsWith("pt:");
      }).reduce(function(t, n) {
        var r = ae(n, 2), o = r[0], l = r[1], i = o.split(":"), s = or(i), a = Le(s).slice(1);
        return a?.reduce(function(u, d, p, c) {
          return !u[d] && (u[d] = p === c.length - 1 ? l : {}), u[d];
        }, t), t;
      }, {});
    },
    $_attrsWithoutPT: function() {
      return Object.entries(this.$attrs || {}).filter(function(t) {
        var n = ae(t, 1), r = n[0];
        return !(r != null && r.startsWith("pt:"));
      }).reduce(function(t, n) {
        var r = ae(n, 2), o = r[0], l = r[1];
        return t[o] = l, t;
      }, {});
    }
  }
};
const ur = "data-wippy-overlay-layer";
function Lt() {
  return typeof window < "u" && typeof window.document < "u";
}
function jt() {
  return Lt() && typeof HTMLElement < "u" && Object.hasOwn(HTMLElement.prototype, "popover");
}
function dr() {
  return jt() && typeof CSS < "u" && typeof CSS.supports == "function" && CSS.supports("anchor-name: --a") && CSS.supports("position-area", "bottom span-right") && CSS.supports("position-try-fallbacks", "flip-block") && CSS.supports("min-width", "min(anchor-size(width), 100vw)") && CSS.supports("max-width", "stretch");
}
const cr = /\bp-(?:select|multiselect|treeselect|cascadeselect)-overlay\b/;
let mr = 0;
const Te = /* @__PURE__ */ new WeakMap();
function ot(e, t) {
  const n = e.style;
  n.setProperty("position", "fixed", "important"), n.setProperty("inset", "auto", "important"), n.setProperty("margin", "0", "important"), n.setProperty("position-anchor", t), n.setProperty("position-area", "bottom span-right"), n.setProperty("position-try-fallbacks", "flip-block, flip-inline, flip-block flip-inline"), n.setProperty("min-width", "min(anchor-size(width), 100vw)", "important"), n.setProperty("max-width", "stretch", "important");
}
function pr(e, t) {
  if (!cr.test(e.className))
    return;
  const n = e.style.cssText;
  ot(e, t), e.getAttribute("popover") !== "manual" && e.setAttribute("popover", "manual");
  try {
    e.matches(":popover-open") || e.showPopover();
  } catch {
  }
  if (!e.matches(":popover-open")) {
    e.removeAttribute("popover"), e.style.cssText = n;
    return;
  }
  if (!Te.has(e)) {
    const r = new MutationObserver(() => {
      const o = e.style;
      (o.top !== "auto" || o.left !== "auto" || o.margin !== "0px" || o.getPropertyPriority("top") !== "important" || o.getPropertyPriority("left") !== "important" || o.getPropertyPriority("margin") !== "important" || o.getPropertyPriority("min-width") !== "important" || o.maxWidth !== "stretch" || o.getPropertyPriority("max-width") !== "important") && ot(e, t);
    });
    r.observe(e, { attributes: !0, attributeFilter: ["style"] }), Te.set(e, r);
  }
}
function xe(e) {
  const t = Te.get(e);
  t && (t.disconnect(), Te.delete(e));
}
function hr(e) {
  const t = e && typeof e.getRootNode == "function" ? e.getRootNode() : null;
  return t instanceof ShadowRoot ? t : null;
}
function je(e) {
  e.style.top = "0px", e.style.left = "0px";
  const t = e.getBoundingClientRect();
  e.style.top = `${-window.scrollY - t.top}px`, e.style.left = `${-window.scrollX - t.left}px`;
}
const Oe = /* @__PURE__ */ new Set(), Re = /* @__PURE__ */ new WeakMap();
let at = !1, Ae = !1;
function fr() {
  Ae = !1;
  for (const e of Oe) {
    if (!e.isConnected) {
      for (const t of Array.from(e.children))
        t instanceof HTMLElement && xe(t);
      Oe.delete(e), Re.get(e)?.disconnect();
      continue;
    }
    e.childElementCount > 0 && je(e);
  }
}
function it() {
  Ae || (Ae = !0, requestAnimationFrame(fr));
}
function yr(e) {
  const t = document.createElement("div");
  t.setAttribute(ur, "");
  const n = jt();
  if (t.style.cssText = n ? "position:fixed;width:0 !important;height:0 !important;margin:0 !important;border:0 !important;padding:0 !important;background:transparent !important;color:inherit !important;overflow:visible !important;" : "position:fixed;top:0;left:0;width:0;height:0;", n && t.setAttribute("popover", "manual"), e.appendChild(t), n) {
    try {
      t.showPopover();
    } catch {
    }
    t.matches(":popover-open") || (t.removeAttribute("popover"), t.style.cssText = "position:fixed;top:0;left:0;width:0;height:0;");
  }
  je(t);
  const r = new MutationObserver((o) => {
    const l = t.__wippyAnchorName;
    for (const i of o) {
      if (l)
        for (const s of Array.from(i.addedNodes))
          s instanceof HTMLElement && pr(s, l);
      for (const s of Array.from(i.removedNodes))
        s instanceof HTMLElement && xe(s);
    }
    t.isConnected && t.childElementCount > 0 && je(t);
  });
  return r.observe(t, { childList: !0 }), Re.set(t, r), Oe.add(t), at || (at = !0, window.addEventListener("scroll", it, { capture: !0, passive: !0 }), window.addEventListener("resize", it, { passive: !0 })), t;
}
function st(e) {
  if (!(!e.hostRoot || e.layer) && (e.layer = yr(e.hostRoot), dr())) {
    const t = e.$el ? e.$el.parentElement : null;
    t && (e.anchorName = `--wippy-a-${++mr}`, e.anchorTrigger = t, t.style.setProperty("anchor-name", e.anchorName), e.layer.__wippyAnchorName = e.anchorName);
  }
}
function lt(e) {
  if (e.anchorTrigger && (e.anchorTrigger.style.removeProperty("anchor-name"), e.anchorTrigger = null), e.anchorName = null, e.layer) {
    for (const t of Array.from(e.layer.children))
      t instanceof HTMLElement && xe(t);
    Oe.delete(e.layer), Re.get(e.layer)?.disconnect(), e.layer.remove(), e.layer = null;
  }
}
let ut = !1;
function vr() {
  if (ut)
    return;
  ut = !0;
  const e = wt;
  e.computed = e.computed || {}, e.computed.inline = function() {
    return !!this.disabled || this.appendTo === "self";
  }, e.computed.resolvedTarget = function() {
    return this.appendTo == null || this.appendTo === "body" ? this.hostRoot ? this.layer : document.body : this.appendTo;
  }, e.data = function() {
    return { mounted: !1, hostRoot: null, layer: null, anchorName: null, anchorTrigger: null };
  }, e.mounted = function() {
    Lt() && (this.hostRoot = hr(this.$el), this.mounted = !0, this.hostRoot && (this.inline || st(this), this.$watch("inline", (t) => {
      t ? lt(this) : st(this);
    })));
  }, e.render = function() {
    return this.inline ? Se(this.$slots, "default", { key: 0 }) : this.mounted ? rn(dt, { key: 1, to: this.resolvedTarget || document.body }, [
      Se(this.$slots, "default")
    ]) : ct("", !0);
  }, e.unmounted = function() {
    lt(this);
  };
}
const Dr = {
  install: (e) => {
    vr(), e.use(tr, { theme: "none" });
  }
};
export {
  O as B,
  dn as C,
  ht as F,
  xr as I,
  jr as K,
  Lr as L,
  T as N,
  Dr as P,
  Nr as Q,
  Er as R,
  S,
  kr as T,
  Pr as U,
  Be as W,
  Sn as _,
  oe as a,
  C as b,
  mt as c,
  ve as d,
  Ue as e,
  pn as f,
  G as g,
  Ar as h,
  I as i,
  b as j,
  wr as k,
  Ee as l,
  P as m,
  br as n,
  Cr as o,
  _r as p,
  Sr as q,
  Rr as r,
  Mr as s,
  wt as t,
  $r as u,
  Or as v,
  Tr as w
};
//# sourceMappingURL=primevue-plugin-DzKV8Brb.js.map

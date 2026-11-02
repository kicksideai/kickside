import { hasInjectionContext as Ko, inject as Ir, effectScope as Uo, ref as W, markRaw as Ho, onMounted as $n, onUnmounted as Nt, watch as Pe, createApp as Wo, readonly as Go, getCurrentInstance as Bn, nextTick as qo, reactive as Yo, renderSlot as A, openBlock as h, createBlock as K, Teleport as _r, createCommentVNode as L, useId as Zo, mergeProps as v, h as Jo, createElementBlock as b, createElementVNode as C, createTextVNode as Ce, toDisplayString as D, resolveComponent as re, resolveDirective as Ct, withDirectives as Ge, resolveDynamicComponent as me, withCtx as ue, normalizeClass as ne, Transition as Tr, createVNode as J, normalizeStyle as Qo, toHandlers as Tt, Fragment as oe, renderList as ye, normalizeProps as Xo, createSlots as ei, withModifiers as ti, defineComponent as Cn, unref as H, computed as he } from "vue";
import { W as ni, g as ri, a as oi, b as ii } from "./index-DoQuo6nY.js";
import { Icon as qe } from "@iconify/vue";
import { api as Ke, loadByTagName as Yt, on as ai, define as si } from "@wippy-fe/proxy";
/*!
 * pinia v4.0.3
 * (c) 2026 Eduardo San Martin Morote
 * @license MIT
 */
let Pr;
const Lr = (t) => Pr = t, li = () => Ko() && Ir(Ar) || Pr, Ar = (
  /* istanbul ignore next */
  Symbol()
);
function ui() {
  const t = Uo(!0), e = t.run(() => W({}));
  let n = [], r = [];
  const i = Ho({
    install(o) {
      Lr(i), i._a = o, o.provide(Ar, i), o.config.globalProperties.$pinia = i, r.forEach((a) => n.push(a)), r = [];
    },
    use(o) {
      return this._a ? n.push(o) : r.push(o), this;
    },
    _p: n,
    _a: null,
    _e: t,
    _s: /* @__PURE__ */ new Map(),
    state: e
  });
  return i;
}
var di = Object.defineProperty, ci = (t, e, n) => e in t ? di(t, e, { enumerable: !0, configurable: !0, writable: !0, value: n }) : t[e] = n, Re = (t, e, n) => ci(t, typeof e != "symbol" ? e + "" : e, n), pi = /* @__PURE__ */ Symbol("wippy:emit"), fi = /* @__PURE__ */ Symbol("wippy:props"), hi = /* @__PURE__ */ Symbol("wippy:props_error"), mi = /* @__PURE__ */ Symbol("wippy:content"), bi = /* @__PURE__ */ Symbol("wippy:panel-id"), gi = /* @__PURE__ */ Symbol("wippy:layout-bus"), vi = /* @__PURE__ */ Symbol("wippy:host"), zr = /* @__PURE__ */ Symbol("wippy:host-visibility");
function yi() {
  const t = Ir(zr);
  if (!t)
    throw new Error("useHostVisibility() must be called inside a WippyVueElement");
  return t;
}
function xi(t) {
  const e = yi();
  let n = !1, r = null, i = !1;
  function o() {
    if (r)
      return i = !0, r;
    let a;
    try {
      a = Promise.resolve(t());
    } catch (l) {
      a = Promise.reject(l);
    }
    const s = a.finally(() => {
      if (r === s && (r = null, n && i))
        return i = !1, o();
    });
    return r = s, s;
  }
  return $n(() => (n = !0, o())), Nt(() => {
    n = !1, i = !1;
  }), Pe(e, (a, s) => {
    if (n && s === !1 && a === !0)
      return o();
  }), e;
}
var wi = class extends ni {
  constructor() {
    super(...arguments), Re(this, "_vueApp", null), Re(this, "_propsRef", W({})), Re(this, "_errorsRef", W([])), Re(this, "_contentRef", W(null)), Re(this, "_hostVisibilityRef", W(null)), Re(this, "_bridgeAbort", null);
  }
  /**
   * Override to provide Vue-specific configuration.
   */
  static get vueConfig() {
    throw new Error("WippyVueElement subclass must override static get vueConfig()");
  }
  onMount(t, e, n, r, i, o) {
    const a = this.constructor.vueConfig;
    this._propsRef.value = n, this._errorsRef.value = r, this._contentRef.value = i ?? null, this._hostVisibilityRef.value = this.hostVisible;
    for (const u of r)
      this.emitEvent("invalid", { message: u });
    const s = new AbortController();
    this._bridgeAbort = s, this.reactive.props.subscribe((u, d) => {
      this._propsRef.value = u, this._errorsRef.value = [...d];
      for (const c of d)
        this.emitEvent("invalid", { message: c });
    }, { signal: s.signal }), this.reactive.content && this.reactive.content.subscribe((u) => {
      this._contentRef.value = u;
    }, { signal: s.signal }), this.reactive.hostVisibility.subscribe((u) => {
      this._hostVisibilityRef.value = u;
    }, { signal: s.signal });
    const l = (u) => {
      if (s.signal.aborted)
        return;
      const d = li(), c = Wo(u.rootComponent);
      this._vueApp = c;
      const p = ui();
      if (u.piniaPlugins)
        for (const f of u.piniaPlugins)
          p.use(f);
      if (c.use(p), u.plugins)
        for (const f of u.plugins)
          c.use(f);
      c.provide(fi, this._propsRef), c.provide(hi, this._errorsRef), c.provide(pi, this.emitEvent.bind(this)), c.provide(mi, this._contentRef), c.provide(zr, this._hostVisibilityRef), c.provide(bi, ri(this)), c.provide(gi, oi(this)), c.provide(vi, ii(this)), u.providers && u.providers(c, this), c.mount(e), d && Lr(d);
    };
    if (a.rootComponent)
      l(a);
    else if (a.lazyConfig) {
      const u = document.createElement("wippy-loading");
      u.setAttribute("no-bg", ""), e.appendChild(u), a.lazyConfig().then((d) => {
        s.signal.aborted || (u.remove(), l(d));
      }).catch((d) => {
        if (s.signal.aborted)
          return;
        const c = d instanceof Error ? d.message : String(d), p = document.createElement("wippy-error");
        p.setAttribute("title", "Failed to load"), p.setAttribute("message", c), u.replaceWith(p), this.emitEvent("error", { message: c });
      });
    } else
      throw new Error("WippyVueElement vueConfig must provide rootComponent or lazyConfig");
  }
  onUnmount() {
    this._bridgeAbort?.abort(), this._bridgeAbort = null, this._vueApp && (this._vueApp.unmount(), this._vueApp = null);
  }
}, ki = Object.defineProperty, jn = Object.getOwnPropertySymbols, Si = Object.prototype.hasOwnProperty, $i = Object.prototype.propertyIsEnumerable, Vn = (t, e, n) => e in t ? ki(t, e, { enumerable: !0, configurable: !0, writable: !0, value: n }) : t[e] = n, Ci = (t, e) => {
  for (var n in e || (e = {})) Si.call(e, n) && Vn(t, n, e[n]);
  if (jn) for (var n of jn(e)) $i.call(e, n) && Vn(t, n, e[n]);
  return t;
};
function Le(t) {
  return t == null || t === "" || Array.isArray(t) && t.length === 0 || !(t instanceof Date) && typeof t == "object" && Object.keys(t).length === 0;
}
function Zt(t, e, n = /* @__PURE__ */ new WeakSet()) {
  if (t === e) return !0;
  if (!t || !e || typeof t != "object" || typeof e != "object" || n.has(t) || n.has(e)) return !1;
  n.add(t).add(e);
  let r = Array.isArray(t), i = Array.isArray(e), o, a, s;
  if (r && i) {
    if (a = t.length, a != e.length) return !1;
    for (o = a; o-- !== 0; ) if (!Zt(t[o], e[o], n)) return !1;
    return !0;
  }
  if (r != i) return !1;
  let l = t instanceof Date, u = e instanceof Date;
  if (l != u) return !1;
  if (l && u) return t.getTime() == e.getTime();
  let d = t instanceof RegExp, c = e instanceof RegExp;
  if (d != c) return !1;
  if (d && c) return t.toString() == e.toString();
  let p = Object.keys(t);
  if (a = p.length, a !== Object.keys(e).length) return !1;
  for (o = a; o-- !== 0; ) if (!Object.prototype.hasOwnProperty.call(e, p[o])) return !1;
  for (o = a; o-- !== 0; ) if (s = p[o], !Zt(t[s], e[s], n)) return !1;
  return !0;
}
function Oi(t, e) {
  return Zt(t, e);
}
function Ft(t) {
  return typeof t == "function" && "call" in t && "apply" in t;
}
function F(t) {
  return !Le(t);
}
function Te(t, e) {
  if (!t || !e) return null;
  try {
    let n = t[e];
    if (F(n)) return n;
  } catch {
  }
  if (Object.keys(t).length) {
    if (Ft(e)) return e(t);
    if (e.indexOf(".") === -1) return t[e];
    {
      let n = e.split("."), r = t;
      for (let i = 0, o = n.length; i < o; ++i) {
        if (r == null) return null;
        r = r[n[i]];
      }
      return r;
    }
  }
  return null;
}
function Ot(t, e, n) {
  return n ? Te(t, n) === Te(e, n) : Oi(t, e);
}
function Ii(t, e) {
  if (t != null && e && e.length) {
    for (let n of e) if (Ot(t, n)) return !0;
  }
  return !1;
}
function Oe(t, e = !0) {
  return t instanceof Object && t.constructor === Object && (e || Object.keys(t).length !== 0);
}
function Er(t = {}, e = {}) {
  let n = Ci({}, t);
  return Object.keys(e).forEach((r) => {
    let i = r;
    Oe(e[i]) && i in t && Oe(t[i]) ? n[i] = Er(t[i], e[i]) : n[i] = e[i];
  }), n;
}
function _i(...t) {
  return t.reduce((e, n, r) => r === 0 ? n : Er(e, n), {});
}
function Dn(t, e) {
  let n = -1;
  if (F(t)) try {
    n = t.findLastIndex(e);
  } catch {
    n = t.lastIndexOf([...t].reverse().find(e));
  }
  return n;
}
function ce(t, ...e) {
  return Ft(t) ? t(...e) : t;
}
function de(t, e = !0) {
  return typeof t == "string" && (e || t !== "");
}
function Se(t) {
  return de(t) ? t.replace(/(-|_)/g, "").toLowerCase() : t;
}
function On(t, e = "", n = {}) {
  let r = Se(e).split("."), i = r.shift();
  if (i) {
    if (Oe(t)) {
      let o = Object.keys(t).find((a) => Se(a) === i) || "";
      return On(ce(t[o], n), r.join("."), n);
    }
    return;
  }
  return ce(t, n);
}
function Br(t, e = !0) {
  return Array.isArray(t) && (e || t.length !== 0);
}
function Ti(t) {
  return F(t) && !isNaN(t);
}
function Pi(t = "") {
  return F(t) && t.length === 1 && !!t.match(/\S| /);
}
function Ne(t, e) {
  if (e) {
    let n = e.test(t);
    return e.lastIndex = 0, n;
  }
  return !1;
}
function Li(...t) {
  return _i(...t);
}
function rt(t) {
  return t && t.replace(/\/\*(?:(?!\*\/)[\s\S])*\*\/|[\r\n\t]+/g, "").replace(/ {2,}/g, " ").replace(/ ([{:}]) /g, "$1").replace(/([;,]) /g, "$1").replace(/ !/g, "!").replace(/: /g, ":").trim();
}
function fe(t) {
  if (t && /[\xC0-\xFF\u0100-\u017E]/.test(t)) {
    let e = { A: /[\xC0-\xC5\u0100\u0102\u0104]/g, AE: /[\xC6]/g, C: /[\xC7\u0106\u0108\u010A\u010C]/g, D: /[\xD0\u010E\u0110]/g, E: /[\xC8-\xCB\u0112\u0114\u0116\u0118\u011A]/g, G: /[\u011C\u011E\u0120\u0122]/g, H: /[\u0124\u0126]/g, I: /[\xCC-\xCF\u0128\u012A\u012C\u012E\u0130]/g, IJ: /[\u0132]/g, J: /[\u0134]/g, K: /[\u0136]/g, L: /[\u0139\u013B\u013D\u013F\u0141]/g, N: /[\xD1\u0143\u0145\u0147\u014A]/g, O: /[\xD2-\xD6\xD8\u014C\u014E\u0150]/g, OE: /[\u0152]/g, R: /[\u0154\u0156\u0158]/g, S: /[\u015A\u015C\u015E\u0160]/g, T: /[\u0162\u0164\u0166]/g, U: /[\xD9-\xDC\u0168\u016A\u016C\u016E\u0170\u0172]/g, W: /[\u0174]/g, Y: /[\xDD\u0176\u0178]/g, Z: /[\u0179\u017B\u017D]/g, a: /[\xE0-\xE5\u0101\u0103\u0105]/g, ae: /[\xE6]/g, c: /[\xE7\u0107\u0109\u010B\u010D]/g, d: /[\u010F\u0111]/g, e: /[\xE8-\xEB\u0113\u0115\u0117\u0119\u011B]/g, g: /[\u011D\u011F\u0121\u0123]/g, i: /[\xEC-\xEF\u0129\u012B\u012D\u012F\u0131]/g, ij: /[\u0133]/g, j: /[\u0135]/g, k: /[\u0137,\u0138]/g, l: /[\u013A\u013C\u013E\u0140\u0142]/g, n: /[\xF1\u0144\u0146\u0148\u014B]/g, p: /[\xFE]/g, o: /[\xF2-\xF6\xF8\u014D\u014F\u0151]/g, oe: /[\u0153]/g, r: /[\u0155\u0157\u0159]/g, s: /[\u015B\u015D\u015F\u0161]/g, t: /[\u0163\u0165\u0167]/g, u: /[\xF9-\xFC\u0169\u016B\u016D\u016F\u0171\u0173]/g, w: /[\u0175]/g, y: /[\xFD\xFF\u0177]/g, z: /[\u017A\u017C\u017E]/g };
    for (let n in e) t = t.replace(e[n], n);
  }
  return t;
}
function Ai(t) {
  return de(t, !1) ? t[0].toUpperCase() + t.slice(1) : t;
}
function jr(t) {
  return de(t) ? t.replace(/(_)/g, "-").replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase() : t;
}
function In() {
  let t = /* @__PURE__ */ new Map();
  return { on(e, n) {
    let r = t.get(e);
    return r ? r.push(n) : r = [n], t.set(e, r), this;
  }, off(e, n) {
    let r = t.get(e);
    return r && r.splice(r.indexOf(n) >>> 0, 1), this;
  }, emit(e, n) {
    let r = t.get(e);
    r && r.forEach((i) => {
      i(n);
    });
  }, clear() {
    t.clear();
  } };
}
function ae(...t) {
  if (t) {
    let e = [];
    for (let n = 0; n < t.length; n++) {
      let r = t[n];
      if (!r) continue;
      let i = typeof r;
      if (i === "string" || i === "number") e.push(r);
      else if (i === "object") {
        let o = Array.isArray(r) ? [ae(...r)] : Object.entries(r).map(([a, s]) => s ? a : void 0);
        e = o.length ? e.concat(o.filter((a) => !!a)) : e;
      }
    }
    return e.join(" ").trim();
  }
}
function zi(t, e) {
  return t ? t.classList ? t.classList.contains(e) : new RegExp("(^| )" + e + "( |$)", "gi").test(t.className) : !1;
}
function Ei(t, e) {
  if (t && e) {
    let n = (r) => {
      zi(t, r) || (t.classList ? t.classList.add(r) : t.className += " " + r);
    };
    [e].flat().filter(Boolean).forEach((r) => r.split(" ").forEach(n));
  }
}
function Ht(t, e) {
  if (t && e) {
    let n = (r) => {
      t.classList ? t.classList.remove(r) : t.className = t.className.replace(new RegExp("(^|\\b)" + r.split(" ").join("|") + "(\\b|$)", "gi"), " ");
    };
    [e].flat().filter(Boolean).forEach((r) => r.split(" ").forEach(n));
  }
}
function Jt(t) {
  for (let e of document?.styleSheets) try {
    for (let n of e?.cssRules) for (let r of n?.style) if (t.test(r)) return { name: r, value: n.style.getPropertyValue(r).trim() };
  } catch {
  }
  return null;
}
function Vr(t) {
  let e = { width: 0, height: 0 };
  if (t) {
    let [n, r] = [t.style.visibility, t.style.display], i = t.getBoundingClientRect();
    t.style.visibility = "hidden", t.style.display = "block", e.width = i.width || t.offsetWidth, e.height = i.height || t.offsetHeight, t.style.display = r, t.style.visibility = n;
  }
  return e;
}
function Dr() {
  let t = window, e = document, n = e.documentElement, r = e.getElementsByTagName("body")[0], i = t.innerWidth || n.clientWidth || r.clientWidth, o = t.innerHeight || n.clientHeight || r.clientHeight;
  return { width: i, height: o };
}
function Qt(t) {
  return t ? Math.abs(t.scrollLeft) : 0;
}
function Bi() {
  let t = document.documentElement;
  return (window.pageXOffset || Qt(t)) - (t.clientLeft || 0);
}
function ji() {
  let t = document.documentElement;
  return (window.pageYOffset || t.scrollTop) - (t.clientTop || 0);
}
function Xt(t) {
  return t ? getComputedStyle(t).direction === "rtl" : !1;
}
function Vi(t, e, n = !0) {
  var r, i, o, a;
  if (t) {
    let s = t.offsetParent ? { width: t.offsetWidth, height: t.offsetHeight } : Vr(t), l = s.height, u = s.width, d = e.offsetHeight, c = e.offsetWidth, p = e.getBoundingClientRect(), f = ji(), m = Bi(), x = Dr(), y, w, O = "top";
    p.top + d + l > x.height ? (y = p.top + f - l, O = "bottom", y < 0 && (y = f)) : y = d + p.top + f, p.left + u > x.width ? w = Math.max(0, p.left + m + c - u) : w = p.left + m, Xt(t) ? t.style.insetInlineEnd = w + "px" : t.style.insetInlineStart = w + "px", t.style.top = y + "px", t.style.transformOrigin = O, n && (t.style.marginTop = O === "bottom" ? `calc(${(i = (r = Jt(/-anchor-gutter$/)) == null ? void 0 : r.value) != null ? i : "2px"} * -1)` : (a = (o = Jt(/-anchor-gutter$/)) == null ? void 0 : o.value) != null ? a : "");
  }
}
function Di(t, e) {
  t && (typeof e == "string" ? t.style.cssText = e : Object.entries(e || {}).forEach(([n, r]) => t.style[n] = r));
}
function _n(t, e) {
  return t instanceof HTMLElement ? t.offsetWidth : 0;
}
function Mi(t, e, n = !0, r = void 0) {
  var i;
  if (t) {
    let o = t.offsetParent ? { width: t.offsetWidth, height: t.offsetHeight } : Vr(t), a = e.offsetHeight, s = e.getBoundingClientRect(), l = Dr(), u, d, c = r ?? "top";
    if (!r && s.top + a + o.height > l.height ? (u = -1 * o.height, c = "bottom", s.top + u < 0 && (u = -1 * s.top)) : u = a, o.width > l.width ? d = s.left * -1 : s.left + o.width > l.width ? d = (s.left + o.width - l.width) * -1 : d = 0, t.style.top = u + "px", t.style.insetInlineStart = d + "px", t.style.transformOrigin = c, n) {
      let p = (i = Jt(/-anchor-gutter$/)) == null ? void 0 : i.value;
      t.style.marginTop = c === "bottom" ? `calc(${p ?? "2px"} * -1)` : p ?? "";
    }
  }
}
function Mr(t) {
  if (t) {
    let e = t.parentNode;
    return e && e instanceof ShadowRoot && e.host && (e = e.host), e;
  }
  return null;
}
function Ni(t) {
  return !!(t !== null && typeof t < "u" && t.nodeName && Mr(t));
}
function Ze(t) {
  return typeof Element < "u" ? t instanceof Element : t !== null && typeof t == "object" && t.nodeType === 1 && typeof t.nodeName == "string";
}
function Fi() {
  if (window.getSelection) {
    let t = window.getSelection() || {};
    t.empty ? t.empty() : t.removeAllRanges && t.rangeCount > 0 && t.getRangeAt(0).getClientRects().length > 0 && t.removeAllRanges();
  }
}
function Et(t, e = {}) {
  if (Ze(t)) {
    let n = (r, i) => {
      var o, a;
      let s = (o = t?.$attrs) != null && o[r] ? [(a = t?.$attrs) == null ? void 0 : a[r]] : [];
      return [i].flat().reduce((l, u) => {
        if (u != null) {
          let d = typeof u;
          if (d === "string" || d === "number") l.push(u);
          else if (d === "object") {
            let c = Array.isArray(u) ? n(r, u) : Object.entries(u).map(([p, f]) => r === "style" && (f || f === 0) ? `${p.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase()}:${f}` : f ? p : void 0);
            l = c.length ? l.concat(c.filter((p) => !!p)) : l;
          }
        }
        return l;
      }, s);
    };
    Object.entries(e).forEach(([r, i]) => {
      if (i != null) {
        let o = r.match(/^on(.+)/);
        o ? t.addEventListener(o[1].toLowerCase(), i) : r === "p-bind" || r === "pBind" ? Et(t, i) : (i = r === "class" ? [...new Set(n("class", i))].join(" ").trim() : r === "style" ? n("style", i).join(";").trim() : i, (t.$attrs = t.$attrs || {}) && (t.$attrs[r] = i), t.setAttribute(r, i));
      }
    });
  }
}
function Ri(t, e = {}, ...n) {
  {
    let r = document.createElement(t);
    return Et(r, e), r.append(...n), r;
  }
}
function Ki(t, e) {
  return Ze(t) ? Array.from(t.querySelectorAll(e)) : [];
}
function Be(t, e) {
  return Ze(t) ? t.matches(e) ? t : t.querySelector(e) : null;
}
function ke(t, e) {
  t && document.activeElement !== t && t.focus(e);
}
function et(t, e) {
  if (Ze(t)) {
    let n = t.getAttribute(e);
    return isNaN(n) ? n === "true" || n === "false" ? n === "true" : n : +n;
  }
}
function Tn(t, e = "") {
  let n = Ki(t, `button:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${e},
            [href]:not([tabindex = "-1"]):not([style*="display:none"]):not([hidden])${e},
            input:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${e},
            select:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${e},
            textarea:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${e},
            [tabIndex]:not([tabIndex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${e},
            [contenteditable]:not([tabIndex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${e}`), r = [];
  for (let i of n) getComputedStyle(i).display != "none" && getComputedStyle(i).visibility != "hidden" && r.push(i);
  return r;
}
function Ui(t, e) {
  let n = Tn(t, e);
  return n.length > 0 ? n[0] : null;
}
function Ae(t) {
  if (t) {
    let e = t.offsetHeight, n = getComputedStyle(t);
    return e -= parseFloat(n.paddingTop) + parseFloat(n.paddingBottom) + parseFloat(n.borderTopWidth) + parseFloat(n.borderBottomWidth), e;
  }
  return 0;
}
function Hi(t, e) {
  let n = Tn(t, e);
  return n.length > 0 ? n[n.length - 1] : null;
}
function tt(t) {
  if (t) {
    let e = t.getBoundingClientRect();
    return { top: e.top + (window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0), left: e.left + (window.pageXOffset || Qt(document.documentElement) || Qt(document.body) || 0) };
  }
  return { top: "auto", left: "auto" };
}
function Nr(t, e) {
  return t ? t.offsetHeight : 0;
}
function Fr(t, e = []) {
  let n = Mr(t);
  return n === null ? e : Fr(n, e.concat([n]));
}
function Wi(t) {
  let e = [];
  if (t) {
    let n = Fr(t), r = /(auto|scroll)/, i = (o) => {
      try {
        let a = window.getComputedStyle(o, null);
        return r.test(a.getPropertyValue("overflow")) || r.test(a.getPropertyValue("overflowX")) || r.test(a.getPropertyValue("overflowY"));
      } catch {
        return !1;
      }
    };
    for (let o of n) {
      let a = o.nodeType === 1 && o.dataset.scrollselectors;
      if (a) {
        let s = a.split(",");
        for (let l of s) {
          let u = Be(o, l);
          u && i(u) && e.push(u);
        }
      }
      o.nodeType !== 9 && i(o) && e.push(o);
    }
  }
  return e;
}
function Mn() {
  if (window.getSelection) return window.getSelection().toString();
  if (document.getSelection) return document.getSelection().toString();
}
function $e(t) {
  if (t) {
    let e = t.offsetWidth, n = getComputedStyle(t);
    return e -= parseFloat(n.paddingLeft) + parseFloat(n.paddingRight) + parseFloat(n.borderLeftWidth) + parseFloat(n.borderRightWidth), e;
  }
  return 0;
}
function Gi() {
  return /(android)/i.test(navigator.userAgent);
}
function Rr() {
  return !!(typeof window < "u" && window.document && window.document.createElement);
}
function Bt(t) {
  return !!(t && t.offsetParent != null);
}
function qi() {
  return "ontouchstart" in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;
}
function Yi(t, e = "", n) {
  Ze(t) && n !== null && n !== void 0 && t.setAttribute(e, n);
}
var Pt = {};
function Zi(t = "pui_id_") {
  return Object.hasOwn(Pt, t) || (Pt[t] = 0), Pt[t]++, `${t}${Pt[t]}`;
}
function Ji() {
  let t = [], e = (a, s, l = 999) => {
    let u = i(a, s, l), d = u.value + (u.key === a ? 0 : l) + 1;
    return t.push({ key: a, value: d }), d;
  }, n = (a) => {
    t = t.filter((s) => s.value !== a);
  }, r = (a, s) => i(a).value, i = (a, s, l = 0) => [...t].reverse().find((u) => !0) || { key: a, value: l }, o = (a) => a && parseInt(a.style.zIndex, 10) || 0;
  return { get: o, set: (a, s, l) => {
    s && (s.style.zIndex = String(e(a, !0, l)));
  }, clear: (a) => {
    a && (n(o(a)), a.style.zIndex = "");
  }, getCurrent: (a) => r(a) };
}
var Wt = Ji(), Qi = Object.defineProperty, Xi = Object.defineProperties, ea = Object.getOwnPropertyDescriptors, jt = Object.getOwnPropertySymbols, Kr = Object.prototype.hasOwnProperty, Ur = Object.prototype.propertyIsEnumerable, Nn = (t, e, n) => e in t ? Qi(t, e, { enumerable: !0, configurable: !0, writable: !0, value: n }) : t[e] = n, ve = (t, e) => {
  for (var n in e || (e = {})) Kr.call(e, n) && Nn(t, n, e[n]);
  if (jt) for (var n of jt(e)) Ur.call(e, n) && Nn(t, n, e[n]);
  return t;
}, Gt = (t, e) => Xi(t, ea(e)), _e = (t, e) => {
  var n = {};
  for (var r in t) Kr.call(t, r) && e.indexOf(r) < 0 && (n[r] = t[r]);
  if (t != null && jt) for (var r of jt(t)) e.indexOf(r) < 0 && Ur.call(t, r) && (n[r] = t[r]);
  return n;
}, ta = In(), ie = ta, ot = /{([^}]*)}/g, Hr = /(\d+\s+[\+\-\*\/]\s+\d+)/g, Wr = /var\([^)]+\)/g;
function Fn(t) {
  return de(t) ? t.replace(/[A-Z]/g, (e, n) => n === 0 ? e : "." + e.toLowerCase()).toLowerCase() : t;
}
function na(t) {
  return Oe(t) && t.hasOwnProperty("$value") && t.hasOwnProperty("$type") ? t.$value : t;
}
function ra(t) {
  return t.replaceAll(/ /g, "").replace(/[^\w]/g, "-");
}
function en(t = "", e = "") {
  return ra(`${de(t, !1) && de(e, !1) ? `${t}-` : t}${e}`);
}
function Gr(t = "", e = "") {
  return `--${en(t, e)}`;
}
function oa(t = "") {
  let e = (t.match(/{/g) || []).length, n = (t.match(/}/g) || []).length;
  return (e + n) % 2 !== 0;
}
function qr(t, e = "", n = "", r = [], i) {
  if (de(t)) {
    let o = t.trim();
    if (oa(o)) return;
    if (Ne(o, ot)) {
      let a = o.replaceAll(ot, (s) => {
        let l = s.replace(/{|}/g, "").split(".").filter((u) => !r.some((d) => Ne(u, d)));
        return `var(${Gr(n, jr(l.join("-")))}${F(i) ? `, ${i}` : ""})`;
      });
      return Ne(a.replace(Wr, "0"), Hr) ? `calc(${a})` : a;
    }
    return o;
  } else if (Ti(t)) return t;
}
function ia(t, e, n) {
  de(e, !1) && t.push(`${e}:${n};`);
}
function Ue(t, e) {
  return t ? `${t}{${e}}` : "";
}
function Yr(t, e) {
  if (t.indexOf("dt(") === -1) return t;
  function n(a, s) {
    let l = [], u = 0, d = "", c = null, p = 0;
    for (; u <= a.length; ) {
      let f = a[u];
      if ((f === '"' || f === "'" || f === "`") && a[u - 1] !== "\\" && (c = c === f ? null : f), !c && (f === "(" && p++, f === ")" && p--, (f === "," || u === a.length) && p === 0)) {
        let m = d.trim();
        m.startsWith("dt(") ? l.push(Yr(m, s)) : l.push(r(m)), d = "", u++;
        continue;
      }
      f !== void 0 && (d += f), u++;
    }
    return l;
  }
  function r(a) {
    let s = a[0];
    if ((s === '"' || s === "'" || s === "`") && a[a.length - 1] === s) return a.slice(1, -1);
    let l = Number(a);
    return isNaN(l) ? a : l;
  }
  let i = [], o = [];
  for (let a = 0; a < t.length; a++) if (t[a] === "d" && t.slice(a, a + 3) === "dt(") o.push(a), a += 2;
  else if (t[a] === ")" && o.length > 0) {
    let s = o.pop();
    o.length === 0 && i.push([s, a]);
  }
  if (!i.length) return t;
  for (let a = i.length - 1; a >= 0; a--) {
    let [s, l] = i[a], u = t.slice(s + 3, l), d = n(u, e), c = e(...d);
    t = t.slice(0, s) + c + t.slice(l + 1);
  }
  return t;
}
var Fe = (...t) => aa(G.getTheme(), ...t), aa = (t = {}, e, n, r) => {
  if (e) {
    let { variable: i, options: o } = G.defaults || {}, { prefix: a, transform: s } = t?.options || o || {}, l = Ne(e, ot) ? e : `{${e}}`;
    return r === "value" || Le(r) && s === "strict" ? G.getTokenValue(e) : qr(l, void 0, a, [i.excludedKeyRegex], n);
  }
  return "";
};
function Lt(t, ...e) {
  if (t instanceof Array) {
    let n = t.reduce((r, i, o) => {
      var a;
      return r + i + ((a = ce(e[o], { dt: Fe })) != null ? a : "");
    }, "");
    return Yr(n, Fe);
  }
  return ce(t, { dt: Fe });
}
function sa(t, e = {}) {
  let n = G.defaults.variable, { prefix: r = n.prefix, selector: i = n.selector, excludedKeyRegex: o = n.excludedKeyRegex } = e, a = [], s = [], l = [{ node: t, path: r }];
  for (; l.length; ) {
    let { node: d, path: c } = l.pop();
    for (let p in d) {
      let f = d[p], m = na(f), x = Ne(p, o) ? en(c) : en(c, jr(p));
      if (Oe(m)) l.push({ node: m, path: x });
      else {
        let y = Gr(x), w = qr(m, x, r, [o]);
        ia(s, y, w);
        let O = x;
        r && O.startsWith(r + "-") && (O = O.slice(r.length + 1)), a.push(O.replace(/-/g, "."));
      }
    }
  }
  let u = s.join("");
  return { value: s, tokens: a, declarations: u, css: Ue(i, u) };
}
var ge = { regex: { rules: { class: { pattern: /^\.([a-zA-Z][\w-]*)$/, resolve(t) {
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
    var r;
    return (r = e.map((i) => i.resolve(n)).find((i) => i.matched)) != null ? r : this.rules.custom.resolve(n);
  });
} }, _toVariables(t, e) {
  return sa(t, { prefix: e?.prefix });
}, getCommon({ name: t = "", theme: e = {}, params: n, set: r, defaults: i }) {
  var o, a, s, l, u, d, c;
  let { preset: p, options: f } = e, m, x, y, w, O, T, g;
  if (F(p) && f.transform !== "strict") {
    let { primitive: _, semantic: V, extend: z } = p, j = V || {}, { colorScheme: Y } = j, X = _e(j, ["colorScheme"]), U = z || {}, { colorScheme: Z } = U, Q = _e(U, ["colorScheme"]), te = Y || {}, { dark: S } = te, E = _e(te, ["dark"]), $ = Z || {}, { dark: k } = $, P = _e($, ["dark"]), I = F(_) ? this._toVariables({ primitive: _ }, f) : {}, q = F(X) ? this._toVariables({ semantic: X }, f) : {}, pe = F(E) ? this._toVariables({ light: E }, f) : {}, je = F(S) ? this._toVariables({ dark: S }, f) : {}, Ie = F(Q) ? this._toVariables({ semantic: Q }, f) : {}, ee = F(P) ? this._toVariables({ light: P }, f) : {}, Ve = F(k) ? this._toVariables({ dark: k }, f) : {}, [Co, Oo] = [(o = I.declarations) != null ? o : "", I.tokens], [Io, _o] = [(a = q.declarations) != null ? a : "", q.tokens || []], [To, Po] = [(s = pe.declarations) != null ? s : "", pe.tokens || []], [Lo, Ao] = [(l = je.declarations) != null ? l : "", je.tokens || []], [zo, Eo] = [(u = Ie.declarations) != null ? u : "", Ie.tokens || []], [Bo, jo] = [(d = ee.declarations) != null ? d : "", ee.tokens || []], [Vo, Do] = [(c = Ve.declarations) != null ? c : "", Ve.tokens || []];
    m = this.transformCSS(t, Co, "light", "variable", f, r, i), x = Oo;
    let Mo = this.transformCSS(t, `${Io}${To}`, "light", "variable", f, r, i), No = this.transformCSS(t, `${Lo}`, "dark", "variable", f, r, i);
    y = `${Mo}${No}`, w = [.../* @__PURE__ */ new Set([..._o, ...Po, ...Ao])];
    let Fo = this.transformCSS(t, `${zo}${Bo}color-scheme:light`, "light", "variable", f, r, i), Ro = this.transformCSS(t, `${Vo}color-scheme:dark`, "dark", "variable", f, r, i);
    O = `${Fo}${Ro}`, T = [.../* @__PURE__ */ new Set([...Eo, ...jo, ...Do])], g = ce(p.css, { dt: Fe });
  }
  return { primitive: { css: m, tokens: x }, semantic: { css: y, tokens: w }, global: { css: O, tokens: T }, style: g };
}, getPreset({ name: t = "", preset: e = {}, options: n, params: r, set: i, defaults: o, selector: a }) {
  var s, l, u;
  let d, c, p;
  if (F(e) && n.transform !== "strict") {
    let f = t.replace("-directive", ""), m = e, { colorScheme: x, extend: y, css: w } = m, O = _e(m, ["colorScheme", "extend", "css"]), T = y || {}, { colorScheme: g } = T, _ = _e(T, ["colorScheme"]), V = x || {}, { dark: z } = V, j = _e(V, ["dark"]), Y = g || {}, { dark: X } = Y, U = _e(Y, ["dark"]), Z = F(O) ? this._toVariables({ [f]: ve(ve({}, O), _) }, n) : {}, Q = F(j) ? this._toVariables({ [f]: ve(ve({}, j), U) }, n) : {}, te = F(z) ? this._toVariables({ [f]: ve(ve({}, z), X) }, n) : {}, [S, E] = [(s = Z.declarations) != null ? s : "", Z.tokens || []], [$, k] = [(l = Q.declarations) != null ? l : "", Q.tokens || []], [P, I] = [(u = te.declarations) != null ? u : "", te.tokens || []], q = this.transformCSS(f, `${S}${$}`, "light", "variable", n, i, o, a), pe = this.transformCSS(f, P, "dark", "variable", n, i, o, a);
    d = `${q}${pe}`, c = [.../* @__PURE__ */ new Set([...E, ...k, ...I])], p = ce(w, { dt: Fe });
  }
  return { css: d, tokens: c, style: p };
}, getPresetC({ name: t = "", theme: e = {}, params: n, set: r, defaults: i }) {
  var o;
  let { preset: a, options: s } = e, l = (o = a?.components) == null ? void 0 : o[t];
  return this.getPreset({ name: t, preset: l, options: s, params: n, set: r, defaults: i });
}, getPresetD({ name: t = "", theme: e = {}, params: n, set: r, defaults: i }) {
  var o, a;
  let s = t.replace("-directive", ""), { preset: l, options: u } = e, d = ((o = l?.components) == null ? void 0 : o[s]) || ((a = l?.directives) == null ? void 0 : a[s]);
  return this.getPreset({ name: s, preset: d, options: u, params: n, set: r, defaults: i });
}, applyDarkColorScheme(t) {
  return !(t.darkModeSelector === "none" || t.darkModeSelector === !1);
}, getColorSchemeOption(t, e) {
  var n;
  return this.applyDarkColorScheme(t) ? this.regex.resolve(t.darkModeSelector === !0 ? e.options.darkModeSelector : (n = t.darkModeSelector) != null ? n : e.options.darkModeSelector) : [];
}, getLayerOrder(t, e = {}, n, r) {
  let { cssLayer: i } = e;
  return i ? `@layer ${ce(i.order || i.name || "primeui", n)}` : "";
}, getCommonStyleSheet({ name: t = "", theme: e = {}, params: n, props: r = {}, set: i, defaults: o }) {
  let a = this.getCommon({ name: t, theme: e, params: n, set: i, defaults: o }), s = Object.entries(r).reduce((l, [u, d]) => l.push(`${u}="${d}"`) && l, []).join(" ");
  return Object.entries(a || {}).reduce((l, [u, d]) => {
    if (Oe(d) && Object.hasOwn(d, "css")) {
      let c = rt(d.css), p = `${u}-variables`;
      l.push(`<style type="text/css" data-primevue-style-id="${p}" ${s}>${c}</style>`);
    }
    return l;
  }, []).join("");
}, getStyleSheet({ name: t = "", theme: e = {}, params: n, props: r = {}, set: i, defaults: o }) {
  var a;
  let s = { name: t, theme: e, params: n, set: i, defaults: o }, l = (a = t.includes("-directive") ? this.getPresetD(s) : this.getPresetC(s)) == null ? void 0 : a.css, u = Object.entries(r).reduce((d, [c, p]) => d.push(`${c}="${p}"`) && d, []).join(" ");
  return l ? `<style type="text/css" data-primevue-style-id="${t}-variables" ${u}>${rt(l)}</style>` : "";
}, createTokens(t = {}, e, n = "", r = "", i = {}) {
  let o = function(s, l = {}, u = []) {
    if (u.includes(this.path)) return console.warn(`Circular reference detected at ${this.path}`), { colorScheme: s, path: this.path, paths: l, value: void 0 };
    u.push(this.path), l.name = this.path, l.binding || (l.binding = {});
    let d = this.value;
    if (typeof this.value == "string" && ot.test(this.value)) {
      let c = this.value.trim().replace(ot, (p) => {
        var f;
        let m = p.slice(1, -1), x = this.tokens[m];
        if (!x) return console.warn(`Token not found for path: ${m}`), "__UNRESOLVED__";
        let y = x.computed(s, l, u);
        return Array.isArray(y) && y.length === 2 ? `light-dark(${y[0].value},${y[1].value})` : (f = y?.value) != null ? f : "__UNRESOLVED__";
      });
      d = Hr.test(c.replace(Wr, "0")) ? `calc(${c})` : c;
    }
    return Le(l.binding) && delete l.binding, u.pop(), { colorScheme: s, path: this.path, paths: l, value: d.includes("__UNRESOLVED__") ? void 0 : d };
  }, a = (s, l, u) => {
    Object.entries(s).forEach(([d, c]) => {
      let p = Ne(d, e.variable.excludedKeyRegex) ? l : l ? `${l}.${Fn(d)}` : Fn(d), f = u ? `${u}.${d}` : d;
      Oe(c) ? a(c, p, f) : (i[p] || (i[p] = { paths: [], computed: (m, x = {}, y = []) => {
        if (i[p].paths.length === 1) return i[p].paths[0].computed(i[p].paths[0].scheme, x.binding, y);
        if (m && m !== "none") for (let w = 0; w < i[p].paths.length; w++) {
          let O = i[p].paths[w];
          if (O.scheme === m) return O.computed(m, x.binding, y);
        }
        return i[p].paths.map((w) => w.computed(w.scheme, x[w.scheme], y));
      } }), i[p].paths.push({ path: f, value: c, scheme: f.includes("colorScheme.light") ? "light" : f.includes("colorScheme.dark") ? "dark" : "none", computed: o, tokens: i }));
    });
  };
  return a(t, n, r), i;
}, getTokenValue(t, e, n) {
  var r;
  let i = ((s) => s.split(".").filter((l) => !Ne(l.toLowerCase(), n.variable.excludedKeyRegex)).join("."))(e), o = e.includes("colorScheme.light") ? "light" : e.includes("colorScheme.dark") ? "dark" : void 0, a = [(r = t[i]) == null ? void 0 : r.computed(o)].flat().filter((s) => s);
  return a.length === 1 ? a[0].value : a.reduce((s = {}, l) => {
    let u = l, { colorScheme: d } = u, c = _e(u, ["colorScheme"]);
    return s[d] = c, s;
  }, void 0);
}, getSelectorRule(t, e, n, r) {
  return n === "class" || n === "attr" ? Ue(F(e) ? `${t}${e},${t} ${e}` : t, r) : Ue(t, Ue(e ?? ":root,:host", r));
}, transformCSS(t, e, n, r, i = {}, o, a, s) {
  if (F(e)) {
    let { cssLayer: l } = i;
    if (r !== "style") {
      let u = this.getColorSchemeOption(i, a);
      e = n === "dark" ? u.reduce((d, { type: c, selector: p }) => (F(p) && (d += p.includes("[CSS]") ? p.replace("[CSS]", e) : this.getSelectorRule(p, s, c, e)), d), "") : Ue(s ?? ":root,:host", e);
    }
    if (l) {
      let u = { name: "primeui" };
      Oe(l) && (u.name = ce(l.name, { name: t, type: r })), F(u.name) && (e = Ue(`@layer ${u.name}`, e), o?.layerNames(u.name));
    }
    return e;
  }
  return "";
} }, G = { defaults: { variable: { prefix: "p", selector: ":root,:host", excludedKeyRegex: /^(primitive|semantic|components|directives|variables|colorscheme|light|dark|common|root|states|extend|css)$/gi }, options: { prefix: "p", darkModeSelector: "system", cssLayer: !1 } }, _theme: void 0, _layerNames: /* @__PURE__ */ new Set(), _loadedStyleNames: /* @__PURE__ */ new Set(), _loadingStyles: /* @__PURE__ */ new Set(), _tokens: {}, update(t = {}) {
  let { theme: e } = t;
  e && (this._theme = Gt(ve({}, e), { options: ve(ve({}, this.defaults.options), e.options) }), this._tokens = ge.createTokens(this.preset, this.defaults), this.clearLoadedStyleNames());
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
  this.update({ theme: t }), ie.emit("theme:change", t);
}, getPreset() {
  return this.preset;
}, setPreset(t) {
  this._theme = Gt(ve({}, this.theme), { preset: t }), this._tokens = ge.createTokens(t, this.defaults), this.clearLoadedStyleNames(), ie.emit("preset:change", t), ie.emit("theme:change", this.theme);
}, getOptions() {
  return this.options;
}, setOptions(t) {
  this._theme = Gt(ve({}, this.theme), { options: t }), this.clearLoadedStyleNames(), ie.emit("options:change", t), ie.emit("theme:change", this.theme);
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
  return ge.getTokenValue(this.tokens, t, this.defaults);
}, getCommon(t = "", e) {
  return ge.getCommon({ name: t, theme: this.theme, params: e, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } });
}, getComponent(t = "", e) {
  let n = { name: t, theme: this.theme, params: e, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } };
  return ge.getPresetC(n);
}, getDirective(t = "", e) {
  let n = { name: t, theme: this.theme, params: e, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } };
  return ge.getPresetD(n);
}, getCustomPreset(t = "", e, n, r) {
  let i = { name: t, preset: e, options: this.options, selector: n, params: r, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } };
  return ge.getPreset(i);
}, getLayerOrderCSS(t = "") {
  return ge.getLayerOrder(t, this.options, { names: this.getLayerNames() }, this.defaults);
}, transformCSS(t = "", e, n = "style", r) {
  return ge.transformCSS(t, e, r, n, this.options, { layerNames: this.setLayerNames.bind(this) }, this.defaults);
}, getCommonStyleSheet(t = "", e, n = {}) {
  return ge.getCommonStyleSheet({ name: t, theme: this.theme, params: e, props: n, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } });
}, getStyleSheet(t, e, n = {}) {
  return ge.getStyleSheet({ name: t, theme: this.theme, params: e, props: n, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } });
}, onStyleMounted(t) {
  this._loadingStyles.add(t);
}, onStyleUpdated(t) {
  this._loadingStyles.add(t);
}, onStyleLoaded(t, { name: e }) {
  this._loadingStyles.size && (this._loadingStyles.delete(e), ie.emit(`theme:${e}:load`, t), !this._loadingStyles.size && ie.emit("theme:load"));
} }, se = {
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
function Rn(t, e) {
  var n = typeof Symbol < "u" && t[Symbol.iterator] || t["@@iterator"];
  if (!n) {
    if (Array.isArray(t) || (n = la(t)) || e) {
      n && (t = n);
      var r = 0, i = function() {
      };
      return { s: i, n: function() {
        return r >= t.length ? { done: !0 } : { done: !1, value: t[r++] };
      }, e: function(u) {
        throw u;
      }, f: i };
    }
    throw new TypeError(`Invalid attempt to iterate non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
  }
  var o, a = !0, s = !1;
  return { s: function() {
    n = n.call(t);
  }, n: function() {
    var u = n.next();
    return a = u.done, u;
  }, e: function(u) {
    s = !0, o = u;
  }, f: function() {
    try {
      a || n.return == null || n.return();
    } finally {
      if (s) throw o;
    }
  } };
}
function la(t, e) {
  if (t) {
    if (typeof t == "string") return Kn(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Kn(t, e) : void 0;
  }
}
function Kn(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, r = Array(e); n < e; n++) r[n] = t[n];
  return r;
}
var ua = {
  filter: function(e, n, r, i, o) {
    var a = [];
    if (!e)
      return a;
    var s = Rn(e), l;
    try {
      for (s.s(); !(l = s.n()).done; ) {
        var u = l.value;
        if (typeof u == "string") {
          if (this.filters[i](u, r, o)) {
            a.push(u);
            continue;
          }
        } else {
          var d = Rn(n), c;
          try {
            for (d.s(); !(c = d.n()).done; ) {
              var p = c.value, f = Te(u, p);
              if (this.filters[i](f, r, o)) {
                a.push(u);
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
    return a;
  },
  filters: {
    startsWith: function(e, n, r) {
      if (n == null || n === "")
        return !0;
      if (e == null)
        return !1;
      var i = fe(n.toString()).toLocaleLowerCase(r), o = fe(e.toString()).toLocaleLowerCase(r);
      return o.slice(0, i.length) === i;
    },
    contains: function(e, n, r) {
      if (n == null || n === "")
        return !0;
      if (e == null)
        return !1;
      var i = fe(n.toString()).toLocaleLowerCase(r), o = fe(e.toString()).toLocaleLowerCase(r);
      return o.indexOf(i) !== -1;
    },
    notContains: function(e, n, r) {
      if (n == null || n === "")
        return !0;
      if (e == null)
        return !1;
      var i = fe(n.toString()).toLocaleLowerCase(r), o = fe(e.toString()).toLocaleLowerCase(r);
      return o.indexOf(i) === -1;
    },
    endsWith: function(e, n, r) {
      if (n == null || n === "")
        return !0;
      if (e == null)
        return !1;
      var i = fe(n.toString()).toLocaleLowerCase(r), o = fe(e.toString()).toLocaleLowerCase(r);
      return o.indexOf(i, o.length - i.length) !== -1;
    },
    equals: function(e, n, r) {
      return n == null || n === "" ? !0 : e == null ? !1 : e.getTime && n.getTime ? e.getTime() === n.getTime() : fe(e.toString()).toLocaleLowerCase(r) == fe(n.toString()).toLocaleLowerCase(r);
    },
    notEquals: function(e, n, r) {
      return n == null || n === "" ? !1 : e == null ? !0 : e.getTime && n.getTime ? e.getTime() !== n.getTime() : fe(e.toString()).toLocaleLowerCase(r) != fe(n.toString()).toLocaleLowerCase(r);
    },
    in: function(e, n) {
      if (n == null || n.length === 0)
        return !0;
      for (var r = 0; r < n.length; r++)
        if (Ot(e, n[r]))
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
}, da = `
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
function Un(t, e) {
  var n = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(t);
    e && (r = r.filter(function(i) {
      return Object.getOwnPropertyDescriptor(t, i).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function Hn(t) {
  for (var e = 1; e < arguments.length; e++) {
    var n = arguments[e] != null ? arguments[e] : {};
    e % 2 ? Un(Object(n), !0).forEach(function(r) {
      ca(t, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(n)) : Un(Object(n)).forEach(function(r) {
      Object.defineProperty(t, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return t;
}
function ca(t, e, n) {
  return (e = pa(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function pa(t) {
  var e = fa(t, "string");
  return it(e) == "symbol" ? e : e + "";
}
function fa(t, e) {
  if (it(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(t, e);
    if (it(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
function ha(t) {
  var e = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0;
  Bn() && Bn().components ? $n(t) : e ? t() : qo(t);
}
var ma = 0;
function ba(t) {
  var e = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, n = W(!1), r = W(t), i = W(null), o = Rr() ? window.document : void 0, a = e.document, s = a === void 0 ? o : a, l = e.immediate, u = l === void 0 ? !0 : l, d = e.manual, c = d === void 0 ? !1 : d, p = e.name, f = p === void 0 ? "style_".concat(++ma) : p, m = e.id, x = m === void 0 ? void 0 : m, y = e.media, w = y === void 0 ? void 0 : y, O = e.nonce, T = O === void 0 ? void 0 : O, g = e.first, _ = g === void 0 ? !1 : g, V = e.onMounted, z = V === void 0 ? void 0 : V, j = e.onUpdated, Y = j === void 0 ? void 0 : j, X = e.onLoad, U = X === void 0 ? void 0 : X, Z = e.props, Q = Z === void 0 ? {} : Z, te = function() {
  }, S = function(k) {
    var P = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    if (s) {
      var I = Hn(Hn({}, Q), P), q = I.name || f, pe = I.id || x, je = I.nonce || T;
      i.value = s.querySelector('style[data-primevue-style-id="'.concat(q, '"]')) || s.getElementById(pe) || s.createElement("style"), i.value.isConnected || (r.value = k || t, Et(i.value, {
        type: "text/css",
        id: pe,
        media: w,
        nonce: je
      }), _ ? s.head.prepend(i.value) : s.head.appendChild(i.value), Yi(i.value, "data-primevue-style-id", q), Et(i.value, I), i.value.onload = function(Ie) {
        return U?.(Ie, {
          name: q
        });
      }, z?.(q)), !n.value && (te = Pe(r, function(Ie) {
        i.value.textContent = Ie, Y?.(q);
      }, {
        immediate: !0
      }), n.value = !0);
    }
  }, E = function() {
    !s || !n.value || (te(), Ni(i.value) && s.head.removeChild(i.value), n.value = !1, i.value = null);
  };
  return u && !c && ha(S), {
    id: x,
    name: f,
    el: i,
    css: r,
    unload: E,
    load: S,
    isLoaded: Go(n)
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
var Wn, Gn, qn, Yn;
function Zn(t, e) {
  return xa(t) || ya(t, e) || va(t, e) || ga();
}
function ga() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function va(t, e) {
  if (t) {
    if (typeof t == "string") return Jn(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Jn(t, e) : void 0;
  }
}
function Jn(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, r = Array(e); n < e; n++) r[n] = t[n];
  return r;
}
function ya(t, e) {
  var n = t == null ? null : typeof Symbol < "u" && t[Symbol.iterator] || t["@@iterator"];
  if (n != null) {
    var r, i, o, a, s = [], l = !0, u = !1;
    try {
      if (o = (n = n.call(t)).next, e !== 0) for (; !(l = (r = o.call(n)).done) && (s.push(r.value), s.length !== e); l = !0) ;
    } catch (d) {
      u = !0, i = d;
    } finally {
      try {
        if (!l && n.return != null && (a = n.return(), Object(a) !== a)) return;
      } finally {
        if (u) throw i;
      }
    }
    return s;
  }
}
function xa(t) {
  if (Array.isArray(t)) return t;
}
function Qn(t, e) {
  var n = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(t);
    e && (r = r.filter(function(i) {
      return Object.getOwnPropertyDescriptor(t, i).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function qt(t) {
  for (var e = 1; e < arguments.length; e++) {
    var n = arguments[e] != null ? arguments[e] : {};
    e % 2 ? Qn(Object(n), !0).forEach(function(r) {
      wa(t, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(n)) : Qn(Object(n)).forEach(function(r) {
      Object.defineProperty(t, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return t;
}
function wa(t, e, n) {
  return (e = ka(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function ka(t) {
  var e = Sa(t, "string");
  return at(e) == "symbol" ? e : e + "";
}
function Sa(t, e) {
  if (at(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(t, e);
    if (at(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
function At(t, e) {
  return e || (e = t.slice(0)), Object.freeze(Object.defineProperties(t, { raw: { value: Object.freeze(e) } }));
}
var $a = function(e) {
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
}, Ca = {}, Oa = {}, M = {
  name: "base",
  css: $a,
  style: da,
  classes: Ca,
  inlineStyles: Oa,
  load: function(e) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, r = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : function(o) {
      return o;
    }, i = r(Lt(Wn || (Wn = At(["", ""])), e));
    return F(i) ? ba(rt(i), qt({
      name: this.name
    }, n)) : {};
  },
  loadCSS: function() {
    var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    return this.load(this.css, e);
  },
  loadStyle: function() {
    var e = this, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "";
    return this.load(this.style, n, function() {
      var i = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "";
      return G.transformCSS(n.name || e.name, "".concat(i).concat(Lt(Gn || (Gn = At(["", ""])), r)));
    });
  },
  getCommonTheme: function(e) {
    return G.getCommon(this.name, e);
  },
  getComponentTheme: function(e) {
    return G.getComponent(this.name, e);
  },
  getDirectiveTheme: function(e) {
    return G.getDirective(this.name, e);
  },
  getPresetTheme: function(e, n, r) {
    return G.getCustomPreset(this.name, e, n, r);
  },
  getLayerOrderThemeCSS: function() {
    return G.getLayerOrderCSS(this.name);
  },
  getStyleSheet: function() {
    var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    if (this.css) {
      var r = ce(this.css, {
        dt: Fe
      }) || "", i = rt(Lt(qn || (qn = At(["", "", ""])), r, e)), o = Object.entries(n).reduce(function(a, s) {
        var l = Zn(s, 2), u = l[0], d = l[1];
        return a.push("".concat(u, '="').concat(d, '"')) && a;
      }, []).join(" ");
      return F(i) ? '<style type="text/css" data-primevue-style-id="'.concat(this.name, '" ').concat(o, ">").concat(i, "</style>") : "";
    }
    return "";
  },
  getCommonThemeStyleSheet: function(e) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    return G.getCommonStyleSheet(this.name, e, n);
  },
  getThemeStyleSheet: function(e) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, r = [G.getStyleSheet(this.name, e, n)];
    if (this.style) {
      var i = this.name === "base" ? "global-style" : "".concat(this.name, "-style"), o = Lt(Yn || (Yn = At(["", ""])), ce(this.style, {
        dt: Fe
      })), a = rt(G.transformCSS(i, o)), s = Object.entries(n).reduce(function(l, u) {
        var d = Zn(u, 2), c = d[0], p = d[1];
        return l.push("".concat(c, '="').concat(p, '"')) && l;
      }, []).join(" ");
      F(a) && r.push('<style type="text/css" data-primevue-style-id="'.concat(i, '" ').concat(s, ">").concat(a, "</style>"));
    }
    return r.join("");
  },
  extend: function(e) {
    return qt(qt({}, this), {}, {
      css: void 0,
      style: void 0
    }, e);
  }
}, Ee = In();
function st(t) {
  "@babel/helpers - typeof";
  return st = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, st(t);
}
function Xn(t, e) {
  var n = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(t);
    e && (r = r.filter(function(i) {
      return Object.getOwnPropertyDescriptor(t, i).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function zt(t) {
  for (var e = 1; e < arguments.length; e++) {
    var n = arguments[e] != null ? arguments[e] : {};
    e % 2 ? Xn(Object(n), !0).forEach(function(r) {
      Ia(t, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(n)) : Xn(Object(n)).forEach(function(r) {
      Object.defineProperty(t, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return t;
}
function Ia(t, e, n) {
  return (e = _a(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function _a(t) {
  var e = Ta(t, "string");
  return st(e) == "symbol" ? e : e + "";
}
function Ta(t, e) {
  if (st(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(t, e);
    if (st(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var Pa = {
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
    text: [se.STARTS_WITH, se.CONTAINS, se.NOT_CONTAINS, se.ENDS_WITH, se.EQUALS, se.NOT_EQUALS],
    numeric: [se.EQUALS, se.NOT_EQUALS, se.LESS_THAN, se.LESS_THAN_OR_EQUAL_TO, se.GREATER_THAN, se.GREATER_THAN_OR_EQUAL_TO],
    date: [se.DATE_IS, se.DATE_IS_NOT, se.DATE_BEFORE, se.DATE_AFTER]
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
}, La = Symbol();
function Aa(t, e) {
  var n = {
    config: Yo(e)
  };
  return t.config.globalProperties.$primevue = n, t.provide(La, n), za(), Ea(t, n), n;
}
var We = [];
function za() {
  ie.clear(), We.forEach(function(t) {
    return t?.();
  }), We = [];
}
function Ea(t, e) {
  var n = W(!1), r = function() {
    var u;
    if (((u = e.config) === null || u === void 0 ? void 0 : u.theme) !== "none" && !G.isStyleNameLoaded("common")) {
      var d, c, p = ((d = M.getCommonTheme) === null || d === void 0 ? void 0 : d.call(M)) || {}, f = p.primitive, m = p.semantic, x = p.global, y = p.style, w = {
        nonce: (c = e.config) === null || c === void 0 || (c = c.csp) === null || c === void 0 ? void 0 : c.nonce
      };
      M.load(f?.css, zt({
        name: "primitive-variables"
      }, w)), M.load(m?.css, zt({
        name: "semantic-variables"
      }, w)), M.load(x?.css, zt({
        name: "global-variables"
      }, w)), M.loadStyle(zt({
        name: "global-style"
      }, w), y), G.setLoadedStyleName("common");
    }
  };
  ie.on("theme:change", function(l) {
    n.value || (t.config.globalProperties.$primevue.config.theme = l, n.value = !0);
  });
  var i = Pe(e.config, function(l, u) {
    Ee.emit("config:change", {
      newValue: l,
      oldValue: u
    });
  }, {
    immediate: !0,
    deep: !0
  }), o = Pe(function() {
    return e.config.ripple;
  }, function(l, u) {
    Ee.emit("config:ripple:change", {
      newValue: l,
      oldValue: u
    });
  }, {
    immediate: !0,
    deep: !0
  }), a = Pe(function() {
    return e.config.theme;
  }, function(l, u) {
    n.value || G.setTheme(l), e.config.unstyled || r(), n.value = !1, Ee.emit("config:theme:change", {
      newValue: l,
      oldValue: u
    });
  }, {
    immediate: !0,
    deep: !1
  }), s = Pe(function() {
    return e.config.unstyled;
  }, function(l, u) {
    !l && e.config.theme && r(), Ee.emit("config:unstyled:change", {
      newValue: l,
      oldValue: u
    });
  }, {
    immediate: !0,
    deep: !0
  });
  We.push(i), We.push(o), We.push(a), We.push(s);
}
var Ba = {
  install: function(e, n) {
    var r = Li(Pa, n);
    Aa(e, r);
  }
}, Pn = {
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
    this.mounted = Rr();
  },
  computed: {
    inline: function() {
      return this.disabled || this.appendTo === "self";
    }
  }
};
function ja(t, e, n, r, i, o) {
  return o.inline ? A(t.$slots, "default", {
    key: 0
  }) : i.mounted ? (h(), K(_r, {
    key: 1,
    to: n.appendTo
  }, [A(t.$slots, "default")], 8, ["to"])) : L("", !0);
}
Pn.render = ja;
var ze = {
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
function Va() {
  var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "pc", e = Zo();
  return "".concat(t).concat(e.replace("v-", "").replaceAll("-", "_"));
}
var er = M.extend({
  name: "common"
});
function lt(t) {
  "@babel/helpers - typeof";
  return lt = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, lt(t);
}
function Da(t) {
  return Qr(t) || Ma(t) || Jr(t) || Zr();
}
function Ma(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function Je(t, e) {
  return Qr(t) || Na(t, e) || Jr(t, e) || Zr();
}
function Zr() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Jr(t, e) {
  if (t) {
    if (typeof t == "string") return tn(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? tn(t, e) : void 0;
  }
}
function tn(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, r = Array(e); n < e; n++) r[n] = t[n];
  return r;
}
function Na(t, e) {
  var n = t == null ? null : typeof Symbol < "u" && t[Symbol.iterator] || t["@@iterator"];
  if (n != null) {
    var r, i, o, a, s = [], l = !0, u = !1;
    try {
      if (o = (n = n.call(t)).next, e === 0) {
        if (Object(n) !== n) return;
        l = !1;
      } else for (; !(l = (r = o.call(n)).done) && (s.push(r.value), s.length !== e); l = !0) ;
    } catch (d) {
      u = !0, i = d;
    } finally {
      try {
        if (!l && n.return != null && (a = n.return(), Object(a) !== a)) return;
      } finally {
        if (u) throw i;
      }
    }
    return s;
  }
}
function Qr(t) {
  if (Array.isArray(t)) return t;
}
function tr(t, e) {
  var n = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(t);
    e && (r = r.filter(function(i) {
      return Object.getOwnPropertyDescriptor(t, i).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function N(t) {
  for (var e = 1; e < arguments.length; e++) {
    var n = arguments[e] != null ? arguments[e] : {};
    e % 2 ? tr(Object(n), !0).forEach(function(r) {
      nt(t, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(n)) : tr(Object(n)).forEach(function(r) {
      Object.defineProperty(t, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return t;
}
function nt(t, e, n) {
  return (e = Fa(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function Fa(t) {
  var e = Ra(t, "string");
  return lt(e) == "symbol" ? e : e + "";
}
function Ra(t, e) {
  if (lt(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(t, e);
    if (lt(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var be = {
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
        ie.off("theme:change", this._loadCoreStyles), e || (this._loadCoreStyles(), this._themeChangeListener(this._loadCoreStyles));
      }
    },
    dt: {
      immediate: !0,
      handler: function(e, n) {
        var r = this;
        ie.off("theme:change", this._themeScopedListener), e ? (this._loadScopedThemeStyles(e), this._themeScopedListener = function() {
          return r._loadScopedThemeStyles(e);
        }, this._themeChangeListener(this._themeScopedListener)) : this._unloadScopedThemeStyles();
      }
    }
  },
  scopedStyleEl: void 0,
  rootEl: void 0,
  uid: void 0,
  $attrSelector: void 0,
  beforeCreate: function() {
    var e, n, r, i, o, a, s, l, u, d, c, p = (e = this.pt) === null || e === void 0 ? void 0 : e._usept, f = p ? (n = this.pt) === null || n === void 0 || (n = n.originalValue) === null || n === void 0 ? void 0 : n[this.$.type.name] : void 0, m = p ? (r = this.pt) === null || r === void 0 || (r = r.value) === null || r === void 0 ? void 0 : r[this.$.type.name] : this.pt;
    (i = m || f) === null || i === void 0 || (i = i.hooks) === null || i === void 0 || (o = i.onBeforeCreate) === null || o === void 0 || o.call(i);
    var x = (a = this.$primevueConfig) === null || a === void 0 || (a = a.pt) === null || a === void 0 ? void 0 : a._usept, y = x ? (s = this.$primevue) === null || s === void 0 || (s = s.config) === null || s === void 0 || (s = s.pt) === null || s === void 0 ? void 0 : s.originalValue : void 0, w = x ? (l = this.$primevue) === null || l === void 0 || (l = l.config) === null || l === void 0 || (l = l.pt) === null || l === void 0 ? void 0 : l.value : (u = this.$primevue) === null || u === void 0 || (u = u.config) === null || u === void 0 ? void 0 : u.pt;
    (d = w || y) === null || d === void 0 || (d = d[this.$.type.name]) === null || d === void 0 || (d = d.hooks) === null || d === void 0 || (c = d.onBeforeCreate) === null || c === void 0 || c.call(d), this.$attrSelector = Va(), this.uid = this.$attrs.id || this.$attrSelector.replace("pc", "pv_id_");
  },
  created: function() {
    this._hook("onCreated");
  },
  beforeMount: function() {
    var e;
    this.rootEl = Be(Ze(this.$el) ? this.$el : (e = this.$el) === null || e === void 0 ? void 0 : e.parentElement, "[".concat(this.$attrSelector, "]")), this.rootEl && (this.rootEl.$pc = N({
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
        var n = this._usePT(this._getPT(this.pt, this.$.type.name), this._getOptionValue, "hooks.".concat(e)), r = this._useDefaultPT(this._getOptionValue, "hooks.".concat(e));
        n?.(), r?.();
      }
    },
    _mergeProps: function(e) {
      for (var n = arguments.length, r = new Array(n > 1 ? n - 1 : 0), i = 1; i < n; i++)
        r[i - 1] = arguments[i];
      return Ft(e) ? e.apply(void 0, r) : v.apply(void 0, r);
    },
    _load: function() {
      ze.isStyleNameLoaded("base") || (M.loadCSS(this.$styleOptions), this._loadGlobalStyles(), ze.setLoadedStyleName("base")), this._loadThemeStyles();
    },
    _loadStyles: function() {
      this._load(), this._themeChangeListener(this._load);
    },
    _loadCoreStyles: function() {
      var e, n;
      !ze.isStyleNameLoaded((e = this.$style) === null || e === void 0 ? void 0 : e.name) && (n = this.$style) !== null && n !== void 0 && n.name && (er.loadCSS(this.$styleOptions), this.$options.style && this.$style.loadCSS(this.$styleOptions), ze.setLoadedStyleName(this.$style.name));
    },
    _loadGlobalStyles: function() {
      var e = this._useGlobalPT(this._getOptionValue, "global.css", this.$params);
      F(e) && M.load(e, N({
        name: "global"
      }, this.$styleOptions));
    },
    _loadThemeStyles: function() {
      var e, n;
      if (!(this.isUnstyled || this.$theme === "none")) {
        if (!G.isStyleNameLoaded("common")) {
          var r, i, o = ((r = this.$style) === null || r === void 0 || (i = r.getCommonTheme) === null || i === void 0 ? void 0 : i.call(r)) || {}, a = o.primitive, s = o.semantic, l = o.global, u = o.style;
          M.load(a?.css, N({
            name: "primitive-variables"
          }, this.$styleOptions)), M.load(s?.css, N({
            name: "semantic-variables"
          }, this.$styleOptions)), M.load(l?.css, N({
            name: "global-variables"
          }, this.$styleOptions)), M.loadStyle(N({
            name: "global-style"
          }, this.$styleOptions), u), G.setLoadedStyleName("common");
        }
        if (!G.isStyleNameLoaded((e = this.$style) === null || e === void 0 ? void 0 : e.name) && (n = this.$style) !== null && n !== void 0 && n.name) {
          var d, c, p, f, m = ((d = this.$style) === null || d === void 0 || (c = d.getComponentTheme) === null || c === void 0 ? void 0 : c.call(d)) || {}, x = m.css, y = m.style;
          (p = this.$style) === null || p === void 0 || p.load(x, N({
            name: "".concat(this.$style.name, "-variables")
          }, this.$styleOptions)), (f = this.$style) === null || f === void 0 || f.loadStyle(N({
            name: "".concat(this.$style.name, "-style")
          }, this.$styleOptions), y), G.setLoadedStyleName(this.$style.name);
        }
        if (!G.isStyleNameLoaded("layer-order")) {
          var w, O, T = (w = this.$style) === null || w === void 0 || (O = w.getLayerOrderThemeCSS) === null || O === void 0 ? void 0 : O.call(w);
          M.load(T, N({
            name: "layer-order",
            first: !0
          }, this.$styleOptions)), G.setLoadedStyleName("layer-order");
        }
      }
    },
    _loadScopedThemeStyles: function(e) {
      var n, r, i, o = ((n = this.$style) === null || n === void 0 || (r = n.getPresetTheme) === null || r === void 0 ? void 0 : r.call(n, e, "[".concat(this.$attrSelector, "]"))) || {}, a = o.css, s = (i = this.$style) === null || i === void 0 ? void 0 : i.load(a, N({
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
      ze.clearLoadedStyleNames(), ie.on("theme:change", e);
    },
    _removeThemeListeners: function() {
      ie.off("theme:change", this._loadCoreStyles), ie.off("theme:change", this._load), ie.off("theme:change", this._themeScopedListener);
    },
    _getHostInstance: function(e) {
      return e ? this.$options.hostName ? e.$.type.name === this.$options.hostName ? e : this._getHostInstance(e.$parentInstance) : e.$parentInstance : void 0;
    },
    _getPropValue: function(e) {
      var n;
      return this[e] || ((n = this._getHostInstance(this)) === null || n === void 0 ? void 0 : n[e]);
    },
    _getOptionValue: function(e) {
      var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", r = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
      return On(e, n, r);
    },
    _getPTValue: function() {
      var e, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", i = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {}, o = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : !0, a = /./g.test(r) && !!i[r.split(".")[0]], s = this._getPropValue("ptOptions") || ((e = this.$primevueConfig) === null || e === void 0 ? void 0 : e.ptOptions) || {}, l = s.mergeSections, u = l === void 0 ? !0 : l, d = s.mergeProps, c = d === void 0 ? !1 : d, p = o ? a ? this._useGlobalPT(this._getPTClassValue, r, i) : this._useDefaultPT(this._getPTClassValue, r, i) : void 0, f = a ? void 0 : this._getPTSelf(n, this._getPTClassValue, r, N(N({}, i), {}, {
        global: p || {}
      })), m = this._getPTDatasets(r);
      return u || !u && f ? c ? this._mergeProps(c, p, f, m) : N(N(N({}, p), f), m) : N(N({}, f), m);
    },
    _getPTSelf: function() {
      for (var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length, r = new Array(n > 1 ? n - 1 : 0), i = 1; i < n; i++)
        r[i - 1] = arguments[i];
      return v(
        this._usePT.apply(this, [this._getPT(e, this.$name)].concat(r)),
        // Exp; <component :pt="{}"
        this._usePT.apply(this, [this.$_attrsPT].concat(r))
        // Exp; <component :pt:[passthrough_key]:[attribute]="{value}" or <component :pt:[passthrough_key]="() =>{value}"
      );
    },
    _getPTDatasets: function() {
      var e, n, r = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", i = "data-pc-", o = r === "root" && F((e = this.pt) === null || e === void 0 ? void 0 : e["data-pc-section"]);
      return r !== "transition" && N(N({}, r === "root" && N(N(nt({}, "".concat(i, "name"), Se(o ? (n = this.pt) === null || n === void 0 ? void 0 : n["data-pc-section"] : this.$.type.name)), o && nt({}, "".concat(i, "extend"), Se(this.$.type.name))), {}, nt({}, "".concat(this.$attrSelector), ""))), {}, nt({}, "".concat(i, "section"), Se(r)));
    },
    _getPTClassValue: function() {
      var e = this._getOptionValue.apply(this, arguments);
      return de(e) || Br(e) ? {
        class: e
      } : e;
    },
    _getPT: function(e) {
      var n = this, r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", i = arguments.length > 2 ? arguments[2] : void 0, o = function(s) {
        var l, u = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1, d = i ? i(s) : s, c = Se(r), p = Se(n.$name);
        return (l = u ? c !== p ? d?.[c] : void 0 : d?.[c]) !== null && l !== void 0 ? l : d;
      };
      return e != null && e.hasOwnProperty("_usept") ? {
        _usept: e._usept,
        originalValue: o(e.originalValue),
        value: o(e.value)
      } : o(e, !0);
    },
    _usePT: function(e, n, r, i) {
      var o = function(x) {
        return n(x, r, i);
      };
      if (e != null && e.hasOwnProperty("_usept")) {
        var a, s = e._usept || ((a = this.$primevueConfig) === null || a === void 0 ? void 0 : a.ptOptions) || {}, l = s.mergeSections, u = l === void 0 ? !0 : l, d = s.mergeProps, c = d === void 0 ? !1 : d, p = o(e.originalValue), f = o(e.value);
        return p === void 0 && f === void 0 ? void 0 : de(f) ? f : de(p) ? p : u || !u && f ? c ? this._mergeProps(c, p, f) : N(N({}, p), f) : f;
      }
      return o(e);
    },
    _useGlobalPT: function(e, n, r) {
      return this._usePT(this.globalPT, e, n, r);
    },
    _useDefaultPT: function(e, n, r) {
      return this._usePT(this.defaultPT, e, n, r);
    },
    ptm: function() {
      var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
      return this._getPTValue(this.pt, e, N(N({}, this.$params), n));
    },
    ptmi: function() {
      var e, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, i = v(this.$_attrsWithoutPT, this.ptm(n, r));
      return i?.hasOwnProperty("id") && ((e = i.id) !== null && e !== void 0 || (i.id = this.$id)), i;
    },
    ptmo: function() {
      var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", r = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
      return this._getPTValue(e, n, N({
        instance: this
      }, r), !1);
    },
    cx: function() {
      var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
      return this.isUnstyled ? void 0 : this._getOptionValue(this.$style.classes, e, N(N({}, this.$params), n));
    },
    sx: function() {
      var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0, r = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
      if (n) {
        var i = this._getOptionValue(this.$style.inlineStyles, e, N(N({}, this.$params), r)), o = this._getOptionValue(er.inlineStyles, e, N(N({}, this.$params), r));
        return [o, i];
      }
    }
  },
  computed: {
    globalPT: function() {
      var e, n = this;
      return this._getPT((e = this.$primevueConfig) === null || e === void 0 ? void 0 : e.pt, void 0, function(r) {
        return ce(r, {
          instance: n
        });
      });
    },
    defaultPT: function() {
      var e, n = this;
      return this._getPT((e = this.$primevueConfig) === null || e === void 0 ? void 0 : e.pt, void 0, function(r) {
        return n._getOptionValue(r, n.$name, N({}, n.$params)) || ce(r, N({}, n.$params));
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
      return Object.fromEntries(Object.entries(this.$props).filter(function(r) {
        var i = Je(r, 1), o = i[0];
        return n?.includes(o);
      }));
    },
    $theme: function() {
      var e;
      return (e = this.$primevueConfig) === null || e === void 0 ? void 0 : e.theme;
    },
    $style: function() {
      return N(N({
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
        var n = Je(e, 1), r = n[0];
        return r?.startsWith("pt:");
      }).reduce(function(e, n) {
        var r = Je(n, 2), i = r[0], o = r[1], a = i.split(":"), s = Da(a), l = tn(s).slice(1);
        return l?.reduce(function(u, d, c, p) {
          return !u[d] && (u[d] = c === p.length - 1 ? o : {}), u[d];
        }, e), e;
      }, {});
    },
    $_attrsWithoutPT: function() {
      return Object.entries(this.$attrs || {}).filter(function(e) {
        var n = Je(e, 1), r = n[0];
        return !(r != null && r.startsWith("pt:"));
      }).reduce(function(e, n) {
        var r = Je(n, 2), i = r[0], o = r[1];
        return e[i] = o, e;
      }, {});
    }
  }
}, Ka = `
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
`, Ua = M.extend({
  name: "baseicon",
  css: Ka
});
function ut(t) {
  "@babel/helpers - typeof";
  return ut = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, ut(t);
}
function nr(t, e) {
  var n = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(t);
    e && (r = r.filter(function(i) {
      return Object.getOwnPropertyDescriptor(t, i).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function rr(t) {
  for (var e = 1; e < arguments.length; e++) {
    var n = arguments[e] != null ? arguments[e] : {};
    e % 2 ? nr(Object(n), !0).forEach(function(r) {
      Ha(t, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(n)) : nr(Object(n)).forEach(function(r) {
      Object.defineProperty(t, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return t;
}
function Ha(t, e, n) {
  return (e = Wa(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function Wa(t) {
  var e = Ga(t, "string");
  return ut(e) == "symbol" ? e : e + "";
}
function Ga(t, e) {
  if (ut(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(t, e);
    if (ut(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var xe = {
  name: "BaseIcon",
  extends: be,
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
  style: Ua,
  provide: function() {
    return {
      $pcIcon: this,
      $parentInstance: this
    };
  },
  methods: {
    pti: function() {
      var e = Le(this.label);
      return rr(rr({}, !this.isUnstyled && {
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
function or(t, e) {
  return Ja(t) || Za(t, e) || Ya(t, e) || qa();
}
function qa() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Ya(t, e) {
  if (t) {
    if (typeof t == "string") return ir(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? ir(t, e) : void 0;
  }
}
function ir(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, r = Array(e); n < e; n++) r[n] = t[n];
  return r;
}
function Za(t, e) {
  var n = t == null ? null : typeof Symbol < "u" && t[Symbol.iterator] || t["@@iterator"];
  if (n != null) {
    var r, i, o, a, s = [], l = !0, u = !1;
    try {
      if (o = (n = n.call(t)).next, e !== 0) for (; !(l = (r = o.call(n)).done) && (s.push(r.value), s.length !== e); l = !0) ;
    } catch (d) {
      u = !0, i = d;
    } finally {
      try {
        if (!l && n.return != null && (a = n.return(), Object(a) !== a)) return;
      } finally {
        if (u) throw i;
      }
    }
    return s;
  }
}
function Ja(t) {
  if (Array.isArray(t)) return t;
}
function ar(t, e) {
  var n = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(t);
    e && (r = r.filter(function(i) {
      return Object.getOwnPropertyDescriptor(t, i).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function R(t) {
  for (var e = 1; e < arguments.length; e++) {
    var n = arguments[e] != null ? arguments[e] : {};
    e % 2 ? ar(Object(n), !0).forEach(function(r) {
      nn(t, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(n)) : ar(Object(n)).forEach(function(r) {
      Object.defineProperty(t, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return t;
}
function nn(t, e, n) {
  return (e = Qa(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function Qa(t) {
  var e = Xa(t, "string");
  return dt(e) == "symbol" ? e : e + "";
}
function Xa(t, e) {
  if (dt(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(t, e);
    if (dt(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var B = {
  _getMeta: function() {
    return [Oe(arguments.length <= 0 ? void 0 : arguments[0]) || arguments.length <= 0 ? void 0 : arguments[0], ce(Oe(arguments.length <= 0 ? void 0 : arguments[0]) ? arguments.length <= 0 ? void 0 : arguments[0] : arguments.length <= 1 ? void 0 : arguments[1])];
  },
  _getConfig: function(e, n) {
    var r, i, o;
    return (r = (e == null || (i = e.instance) === null || i === void 0 ? void 0 : i.$primevue) || (n == null || (o = n.ctx) === null || o === void 0 || (o = o.appContext) === null || o === void 0 || (o = o.config) === null || o === void 0 || (o = o.globalProperties) === null || o === void 0 ? void 0 : o.$primevue)) === null || r === void 0 ? void 0 : r.config;
  },
  _getOptionValue: On,
  _getPTValue: function() {
    var e, n, r = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, i = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, o = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : "", a = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : {}, s = arguments.length > 4 && arguments[4] !== void 0 ? arguments[4] : !0, l = function() {
      var O = B._getOptionValue.apply(B, arguments);
      return de(O) || Br(O) ? {
        class: O
      } : O;
    }, u = ((e = r.binding) === null || e === void 0 || (e = e.value) === null || e === void 0 ? void 0 : e.ptOptions) || ((n = r.$primevueConfig) === null || n === void 0 ? void 0 : n.ptOptions) || {}, d = u.mergeSections, c = d === void 0 ? !0 : d, p = u.mergeProps, f = p === void 0 ? !1 : p, m = s ? B._useDefaultPT(r, r.defaultPT(), l, o, a) : void 0, x = B._usePT(r, B._getPT(i, r.$name), l, o, R(R({}, a), {}, {
      global: m || {}
    })), y = B._getPTDatasets(r, o);
    return c || !c && x ? f ? B._mergeProps(r, f, m, x, y) : R(R(R({}, m), x), y) : R(R({}, x), y);
  },
  _getPTDatasets: function() {
    var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", r = "data-pc-";
    return R(R({}, n === "root" && nn({}, "".concat(r, "name"), Se(e.$name))), {}, nn({}, "".concat(r, "section"), Se(n)));
  },
  _getPT: function(e) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", r = arguments.length > 2 ? arguments[2] : void 0, i = function(a) {
      var s, l = r ? r(a) : a, u = Se(n);
      return (s = l?.[u]) !== null && s !== void 0 ? s : l;
    };
    return e && Object.hasOwn(e, "_usept") ? {
      _usept: e._usept,
      originalValue: i(e.originalValue),
      value: i(e.value)
    } : i(e);
  },
  _usePT: function() {
    var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 ? arguments[1] : void 0, r = arguments.length > 2 ? arguments[2] : void 0, i = arguments.length > 3 ? arguments[3] : void 0, o = arguments.length > 4 ? arguments[4] : void 0, a = function(y) {
      return r(y, i, o);
    };
    if (n && Object.hasOwn(n, "_usept")) {
      var s, l = n._usept || ((s = e.$primevueConfig) === null || s === void 0 ? void 0 : s.ptOptions) || {}, u = l.mergeSections, d = u === void 0 ? !0 : u, c = l.mergeProps, p = c === void 0 ? !1 : c, f = a(n.originalValue), m = a(n.value);
      return f === void 0 && m === void 0 ? void 0 : de(m) ? m : de(f) ? f : d || !d && m ? p ? B._mergeProps(e, p, f, m) : R(R({}, f), m) : m;
    }
    return a(n);
  },
  _useDefaultPT: function() {
    var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, r = arguments.length > 2 ? arguments[2] : void 0, i = arguments.length > 3 ? arguments[3] : void 0, o = arguments.length > 4 ? arguments[4] : void 0;
    return B._usePT(e, n, r, i, o);
  },
  _loadStyles: function() {
    var e, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, r = arguments.length > 1 ? arguments[1] : void 0, i = arguments.length > 2 ? arguments[2] : void 0, o = B._getConfig(r, i), a = {
      nonce: o == null || (e = o.csp) === null || e === void 0 ? void 0 : e.nonce
    };
    B._loadCoreStyles(n, a), B._loadThemeStyles(n, a), B._loadScopedThemeStyles(n, a), B._removeThemeListeners(n), n.$loadStyles = function() {
      return B._loadThemeStyles(n, a);
    }, B._themeChangeListener(n.$loadStyles);
  },
  _loadCoreStyles: function() {
    var e, n, r = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, i = arguments.length > 1 ? arguments[1] : void 0;
    if (!ze.isStyleNameLoaded((e = r.$style) === null || e === void 0 ? void 0 : e.name) && (n = r.$style) !== null && n !== void 0 && n.name) {
      var o;
      M.loadCSS(i), (o = r.$style) === null || o === void 0 || o.loadCSS(i), ze.setLoadedStyleName(r.$style.name);
    }
  },
  _loadThemeStyles: function() {
    var e, n, r, i = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, o = arguments.length > 1 ? arguments[1] : void 0;
    if (!(i != null && i.isUnstyled() || (i == null || (e = i.theme) === null || e === void 0 ? void 0 : e.call(i)) === "none")) {
      if (!G.isStyleNameLoaded("common")) {
        var a, s, l = ((a = i.$style) === null || a === void 0 || (s = a.getCommonTheme) === null || s === void 0 ? void 0 : s.call(a)) || {}, u = l.primitive, d = l.semantic, c = l.global, p = l.style;
        M.load(u?.css, R({
          name: "primitive-variables"
        }, o)), M.load(d?.css, R({
          name: "semantic-variables"
        }, o)), M.load(c?.css, R({
          name: "global-variables"
        }, o)), M.loadStyle(R({
          name: "global-style"
        }, o), p), G.setLoadedStyleName("common");
      }
      if (!G.isStyleNameLoaded((n = i.$style) === null || n === void 0 ? void 0 : n.name) && (r = i.$style) !== null && r !== void 0 && r.name) {
        var f, m, x, y, w = ((f = i.$style) === null || f === void 0 || (m = f.getDirectiveTheme) === null || m === void 0 ? void 0 : m.call(f)) || {}, O = w.css, T = w.style;
        (x = i.$style) === null || x === void 0 || x.load(O, R({
          name: "".concat(i.$style.name, "-variables")
        }, o)), (y = i.$style) === null || y === void 0 || y.loadStyle(R({
          name: "".concat(i.$style.name, "-style")
        }, o), T), G.setLoadedStyleName(i.$style.name);
      }
      if (!G.isStyleNameLoaded("layer-order")) {
        var g, _, V = (g = i.$style) === null || g === void 0 || (_ = g.getLayerOrderThemeCSS) === null || _ === void 0 ? void 0 : _.call(g);
        M.load(V, R({
          name: "layer-order",
          first: !0
        }, o)), G.setLoadedStyleName("layer-order");
      }
    }
  },
  _loadScopedThemeStyles: function() {
    var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 ? arguments[1] : void 0, r = e.preset();
    if (r && e.$attrSelector) {
      var i, o, a, s = ((i = e.$style) === null || i === void 0 || (o = i.getPresetTheme) === null || o === void 0 ? void 0 : o.call(i, r, "[".concat(e.$attrSelector, "]"))) || {}, l = s.css, u = (a = e.$style) === null || a === void 0 ? void 0 : a.load(l, R({
        name: "".concat(e.$attrSelector, "-").concat(e.$style.name)
      }, n));
      e.scopedStyleEl = u.el;
    }
  },
  _themeChangeListener: function() {
    var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : function() {
    };
    ze.clearLoadedStyleNames(), ie.on("theme:change", e);
  },
  _removeThemeListeners: function() {
    var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    ie.off("theme:change", e.$loadStyles), e.$loadStyles = void 0;
  },
  _hook: function(e, n, r, i, o, a) {
    var s, l, u = "on".concat(Ai(n)), d = B._getConfig(i, o), c = r?.$instance, p = B._usePT(c, B._getPT(i == null || (s = i.value) === null || s === void 0 ? void 0 : s.pt, e), B._getOptionValue, "hooks.".concat(u)), f = B._useDefaultPT(c, d == null || (l = d.pt) === null || l === void 0 || (l = l.directives) === null || l === void 0 ? void 0 : l[e], B._getOptionValue, "hooks.".concat(u)), m = {
      el: r,
      binding: i,
      vnode: o,
      prevVnode: a
    };
    p?.(c, m), f?.(c, m);
  },
  /* eslint-disable-next-line no-unused-vars */
  _mergeProps: function() {
    for (var e = arguments.length > 1 ? arguments[1] : void 0, n = arguments.length, r = new Array(n > 2 ? n - 2 : 0), i = 2; i < n; i++)
      r[i - 2] = arguments[i];
    return Ft(e) ? e.apply(void 0, r) : v.apply(void 0, r);
  },
  _extend: function(e) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, r = function(s, l, u, d, c) {
      var p, f, m, x;
      l._$instances = l._$instances || {};
      var y = B._getConfig(u, d), w = l._$instances[e] || {}, O = Le(w) ? R(R({}, n), n?.methods) : {};
      l._$instances[e] = R(R({}, w), {}, {
        /* new instance variables to pass in directive methods */
        $name: e,
        $host: l,
        $binding: u,
        $modifiers: u?.modifiers,
        $value: u?.value,
        $el: w.$el || l || void 0,
        $style: R({
          classes: void 0,
          inlineStyles: void 0,
          load: function() {
          },
          loadCSS: function() {
          },
          loadStyle: function() {
          }
        }, n?.style),
        $primevueConfig: y,
        $attrSelector: (p = l.$pd) === null || p === void 0 || (p = p[e]) === null || p === void 0 ? void 0 : p.attrSelector,
        /* computed instance variables */
        defaultPT: function() {
          return B._getPT(y?.pt, void 0, function(g) {
            var _;
            return g == null || (_ = g.directives) === null || _ === void 0 ? void 0 : _[e];
          });
        },
        isUnstyled: function() {
          var g, _;
          return ((g = l._$instances[e]) === null || g === void 0 || (g = g.$binding) === null || g === void 0 || (g = g.value) === null || g === void 0 ? void 0 : g.unstyled) !== void 0 ? (_ = l._$instances[e]) === null || _ === void 0 || (_ = _.$binding) === null || _ === void 0 || (_ = _.value) === null || _ === void 0 ? void 0 : _.unstyled : y?.unstyled;
        },
        theme: function() {
          var g;
          return (g = l._$instances[e]) === null || g === void 0 || (g = g.$primevueConfig) === null || g === void 0 ? void 0 : g.theme;
        },
        preset: function() {
          var g;
          return (g = l._$instances[e]) === null || g === void 0 || (g = g.$binding) === null || g === void 0 || (g = g.value) === null || g === void 0 ? void 0 : g.dt;
        },
        /* instance's methods */
        ptm: function() {
          var g, _ = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", V = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
          return B._getPTValue(l._$instances[e], (g = l._$instances[e]) === null || g === void 0 || (g = g.$binding) === null || g === void 0 || (g = g.value) === null || g === void 0 ? void 0 : g.pt, _, R({}, V));
        },
        ptmo: function() {
          var g = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, _ = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", V = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
          return B._getPTValue(l._$instances[e], g, _, V, !1);
        },
        cx: function() {
          var g, _, V = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", z = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
          return (g = l._$instances[e]) !== null && g !== void 0 && g.isUnstyled() ? void 0 : B._getOptionValue((_ = l._$instances[e]) === null || _ === void 0 || (_ = _.$style) === null || _ === void 0 ? void 0 : _.classes, V, R({}, z));
        },
        sx: function() {
          var g, _ = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", V = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0, z = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
          return V ? B._getOptionValue((g = l._$instances[e]) === null || g === void 0 || (g = g.$style) === null || g === void 0 ? void 0 : g.inlineStyles, _, R({}, z)) : void 0;
        }
      }, O), l.$instance = l._$instances[e], (f = (m = l.$instance)[s]) === null || f === void 0 || f.call(m, l, u, d, c), l["$".concat(e)] = l.$instance, B._hook(e, s, l, u, d, c), l.$pd || (l.$pd = {}), l.$pd[e] = R(R({}, (x = l.$pd) === null || x === void 0 ? void 0 : x[e]), {}, {
        name: e,
        instance: l._$instances[e]
      });
    }, i = function(s) {
      var l, u, d, c = s._$instances[e], p = c?.watch, f = function(y) {
        var w, O = y.newValue, T = y.oldValue;
        return p == null || (w = p.config) === null || w === void 0 ? void 0 : w.call(c, O, T);
      }, m = function(y) {
        var w, O = y.newValue, T = y.oldValue;
        return p == null || (w = p["config.ripple"]) === null || w === void 0 ? void 0 : w.call(c, O, T);
      };
      c.$watchersCallback = {
        config: f,
        "config.ripple": m
      }, p == null || (l = p.config) === null || l === void 0 || l.call(c, c?.$primevueConfig), Ee.on("config:change", f), p == null || (u = p["config.ripple"]) === null || u === void 0 || u.call(c, c == null || (d = c.$primevueConfig) === null || d === void 0 ? void 0 : d.ripple), Ee.on("config:ripple:change", m);
    }, o = function(s) {
      var l = s._$instances[e].$watchersCallback;
      l && (Ee.off("config:change", l.config), Ee.off("config:ripple:change", l["config.ripple"]), s._$instances[e].$watchersCallback = void 0);
    };
    return {
      created: function(s, l, u, d) {
        s.$pd || (s.$pd = {}), s.$pd[e] = {
          name: e,
          attrSelector: Zi("pd")
        }, r("created", s, l, u, d);
      },
      beforeMount: function(s, l, u, d) {
        var c;
        B._loadStyles((c = s.$pd[e]) === null || c === void 0 ? void 0 : c.instance, l, u), r("beforeMount", s, l, u, d), i(s);
      },
      mounted: function(s, l, u, d) {
        var c;
        B._loadStyles((c = s.$pd[e]) === null || c === void 0 ? void 0 : c.instance, l, u), r("mounted", s, l, u, d);
      },
      beforeUpdate: function(s, l, u, d) {
        r("beforeUpdate", s, l, u, d);
      },
      updated: function(s, l, u, d) {
        var c;
        B._loadStyles((c = s.$pd[e]) === null || c === void 0 ? void 0 : c.instance, l, u), r("updated", s, l, u, d);
      },
      beforeUnmount: function(s, l, u, d) {
        var c;
        o(s), B._removeThemeListeners((c = s.$pd[e]) === null || c === void 0 ? void 0 : c.instance), r("beforeUnmount", s, l, u, d);
      },
      unmounted: function(s, l, u, d) {
        var c;
        (c = s.$pd[e]) === null || c === void 0 || (c = c.instance) === null || c === void 0 || (c = c.scopedStyleEl) === null || c === void 0 || (c = c.value) === null || c === void 0 || c.remove(), r("unmounted", s, l, u, d);
      }
    };
  },
  extend: function() {
    var e = B._getMeta.apply(B, arguments), n = or(e, 2), r = n[0], i = n[1];
    return R({
      extend: function() {
        var a = B._getMeta.apply(B, arguments), s = or(a, 2), l = s[0], u = s[1];
        return B.extend(l, R(R(R({}, i), i?.methods), u));
      }
    }, B._extend(r, i));
  }
}, es = `
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
`, ts = {
  root: "p-ink"
}, ns = M.extend({
  name: "ripple-directive",
  style: es,
  classes: ts
}), rs = B.extend({
  style: ns
});
function ct(t) {
  "@babel/helpers - typeof";
  return ct = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, ct(t);
}
function os(t) {
  return ls(t) || ss(t) || as(t) || is();
}
function is() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function as(t, e) {
  if (t) {
    if (typeof t == "string") return rn(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? rn(t, e) : void 0;
  }
}
function ss(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function ls(t) {
  if (Array.isArray(t)) return rn(t);
}
function rn(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, r = Array(e); n < e; n++) r[n] = t[n];
  return r;
}
function sr(t, e, n) {
  return (e = us(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function us(t) {
  var e = ds(t, "string");
  return ct(e) == "symbol" ? e : e + "";
}
function ds(t, e) {
  if (ct(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(t, e);
    if (ct(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var It = rs.extend("ripple", {
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
      n || (n = Ri("span", sr(sr({
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
      var n = this, r = e.currentTarget, i = this.getInk(r);
      if (!(!i || getComputedStyle(i, null).display === "none")) {
        if (!this.isUnstyled() && Ht(i, "p-ink-active"), i.setAttribute("data-p-ink-active", "false"), !Ae(i) && !$e(i)) {
          var o = Math.max(_n(r), Nr(r));
          i.style.height = o + "px", i.style.width = o + "px";
        }
        var a = tt(r), s = e.pageX - a.left + document.body.scrollTop - $e(i) / 2, l = e.pageY - a.top + document.body.scrollLeft - Ae(i) / 2;
        i.style.top = l + "px", i.style.left = s + "px", !this.isUnstyled() && Ei(i, "p-ink-active"), i.setAttribute("data-p-ink-active", "true"), this.timeout = setTimeout(function() {
          i && (!n.isUnstyled() && Ht(i, "p-ink-active"), i.setAttribute("data-p-ink-active", "false"));
        }, 401);
      }
    },
    onAnimationEnd: function(e) {
      this.timeout && clearTimeout(this.timeout), !this.isUnstyled() && Ht(e.currentTarget, "p-ink-active"), e.currentTarget.setAttribute("data-p-ink-active", "false");
    },
    getInk: function(e) {
      return e && e.children ? os(e.children).find(function(n) {
        return et(n, "data-pc-name") === "ripple";
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
function cs(t, e) {
  if (!(t instanceof e)) throw new TypeError("Cannot call a class as a function");
}
function ps(t, e) {
  for (var n = 0; n < e.length; n++) {
    var r = e[n];
    r.enumerable = r.enumerable || !1, r.configurable = !0, "value" in r && (r.writable = !0), Object.defineProperty(t, hs(r.key), r);
  }
}
function fs(t, e, n) {
  return e && ps(t.prototype, e), Object.defineProperty(t, "prototype", { writable: !1 }), t;
}
function hs(t) {
  var e = ms(t, "string");
  return pt(e) == "symbol" ? e : e + "";
}
function ms(t, e) {
  if (pt(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(t, e);
    if (pt(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return String(t);
}
var bs = /* @__PURE__ */ (function() {
  function t(e) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : function() {
    };
    cs(this, t), this.element = e, this.listener = n;
  }
  return fs(t, [{
    key: "bindScrollListener",
    value: function() {
      this.scrollableParents = Wi(this.element);
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
})(), gs = In();
const vs = "data-wippy-overlay-layer";
function Xr() {
  return typeof window < "u" && typeof window.document < "u";
}
function eo() {
  return Xr() && typeof HTMLElement < "u" && Object.hasOwn(HTMLElement.prototype, "popover");
}
function ys() {
  return eo() && typeof CSS < "u" && typeof CSS.supports == "function" && CSS.supports("anchor-name: --a") && CSS.supports("position-area", "bottom span-right") && CSS.supports("position-try-fallbacks", "flip-block") && CSS.supports("min-width", "min(anchor-size(width), 100vw)") && CSS.supports("max-width", "stretch");
}
const xs = /\bp-(?:select|multiselect|treeselect|cascadeselect)-overlay\b/;
let ws = 0;
const Vt = /* @__PURE__ */ new WeakMap();
function lr(t, e) {
  const n = t.style;
  n.setProperty("position", "fixed", "important"), n.setProperty("inset", "auto", "important"), n.setProperty("margin", "0", "important"), n.setProperty("position-anchor", e), n.setProperty("position-area", "bottom span-right"), n.setProperty("position-try-fallbacks", "flip-block, flip-inline, flip-block flip-inline"), n.setProperty("min-width", "min(anchor-size(width), 100vw)", "important"), n.setProperty("max-width", "stretch", "important");
}
function ks(t, e) {
  if (!xs.test(t.className))
    return;
  const n = t.style.cssText;
  lr(t, e), t.getAttribute("popover") !== "manual" && t.setAttribute("popover", "manual");
  try {
    t.matches(":popover-open") || t.showPopover();
  } catch {
  }
  if (!t.matches(":popover-open")) {
    t.removeAttribute("popover"), t.style.cssText = n;
    return;
  }
  if (!Vt.has(t)) {
    const r = new MutationObserver(() => {
      const i = t.style;
      (i.top !== "auto" || i.left !== "auto" || i.margin !== "0px" || i.getPropertyPriority("top") !== "important" || i.getPropertyPriority("left") !== "important" || i.getPropertyPriority("margin") !== "important" || i.getPropertyPriority("min-width") !== "important" || i.maxWidth !== "stretch" || i.getPropertyPriority("max-width") !== "important") && lr(t, e);
    });
    r.observe(t, { attributes: !0, attributeFilter: ["style"] }), Vt.set(t, r);
  }
}
function Ln(t) {
  const e = Vt.get(t);
  e && (e.disconnect(), Vt.delete(t));
}
function Ss(t) {
  const e = t && typeof t.getRootNode == "function" ? t.getRootNode() : null;
  return e instanceof ShadowRoot ? e : null;
}
function on(t) {
  t.style.top = "0px", t.style.left = "0px";
  const e = t.getBoundingClientRect();
  t.style.top = `${-window.scrollY - e.top}px`, t.style.left = `${-window.scrollX - e.left}px`;
}
const Dt = /* @__PURE__ */ new Set(), An = /* @__PURE__ */ new WeakMap();
let ur = !1, an = !1;
function $s() {
  an = !1;
  for (const t of Dt) {
    if (!t.isConnected) {
      for (const e of Array.from(t.children))
        e instanceof HTMLElement && Ln(e);
      Dt.delete(t), An.get(t)?.disconnect();
      continue;
    }
    t.childElementCount > 0 && on(t);
  }
}
function dr() {
  an || (an = !0, requestAnimationFrame($s));
}
function Cs(t) {
  const e = document.createElement("div");
  e.setAttribute(vs, "");
  const n = eo();
  if (e.style.cssText = n ? "position:fixed;width:0 !important;height:0 !important;margin:0 !important;border:0 !important;padding:0 !important;background:transparent !important;color:inherit !important;overflow:visible !important;" : "position:fixed;top:0;left:0;width:0;height:0;", n && e.setAttribute("popover", "manual"), t.appendChild(e), n) {
    try {
      e.showPopover();
    } catch {
    }
    e.matches(":popover-open") || (e.removeAttribute("popover"), e.style.cssText = "position:fixed;top:0;left:0;width:0;height:0;");
  }
  on(e);
  const r = new MutationObserver((i) => {
    const o = e.__wippyAnchorName;
    for (const a of i) {
      if (o)
        for (const s of Array.from(a.addedNodes))
          s instanceof HTMLElement && ks(s, o);
      for (const s of Array.from(a.removedNodes))
        s instanceof HTMLElement && Ln(s);
    }
    e.isConnected && e.childElementCount > 0 && on(e);
  });
  return r.observe(e, { childList: !0 }), An.set(e, r), Dt.add(e), ur || (ur = !0, window.addEventListener("scroll", dr, { capture: !0, passive: !0 }), window.addEventListener("resize", dr, { passive: !0 })), e;
}
function cr(t) {
  if (!(!t.hostRoot || t.layer) && (t.layer = Cs(t.hostRoot), ys())) {
    const e = t.$el ? t.$el.parentElement : null;
    e && (t.anchorName = `--wippy-a-${++ws}`, t.anchorTrigger = e, e.style.setProperty("anchor-name", t.anchorName), t.layer.__wippyAnchorName = t.anchorName);
  }
}
function pr(t) {
  if (t.anchorTrigger && (t.anchorTrigger.style.removeProperty("anchor-name"), t.anchorTrigger = null), t.anchorName = null, t.layer) {
    for (const e of Array.from(t.layer.children))
      e instanceof HTMLElement && Ln(e);
    Dt.delete(t.layer), An.get(t.layer)?.disconnect(), t.layer.remove(), t.layer = null;
  }
}
let fr = !1;
function Os() {
  if (fr)
    return;
  fr = !0;
  const t = Pn;
  t.computed = t.computed || {}, t.computed.inline = function() {
    return !!this.disabled || this.appendTo === "self";
  }, t.computed.resolvedTarget = function() {
    return this.appendTo == null || this.appendTo === "body" ? this.hostRoot ? this.layer : document.body : this.appendTo;
  }, t.data = function() {
    return { mounted: !1, hostRoot: null, layer: null, anchorName: null, anchorTrigger: null };
  }, t.mounted = function() {
    Xr() && (this.hostRoot = Ss(this.$el), this.mounted = !0, this.hostRoot && (this.inline || cr(this), this.$watch("inline", (e) => {
      e ? pr(this) : cr(this);
    })));
  }, t.render = function() {
    return this.inline ? A(this.$slots, "default", { key: 0 }) : this.mounted ? Jo(_r, { key: 1, to: this.resolvedTarget || document.body }, [
      A(this.$slots, "default")
    ]) : L("", !0);
  }, t.unmounted = function() {
    pr(this);
  };
}
const Is = {
  install: (t) => {
    Os(), t.use(Ba, { theme: "none" });
  }
};
var Rt = {
  name: "SpinnerIcon",
  extends: xe
};
function _s(t) {
  return As(t) || Ls(t) || Ps(t) || Ts();
}
function Ts() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Ps(t, e) {
  if (t) {
    if (typeof t == "string") return sn(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? sn(t, e) : void 0;
  }
}
function Ls(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function As(t) {
  if (Array.isArray(t)) return sn(t);
}
function sn(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, r = Array(e); n < e; n++) r[n] = t[n];
  return r;
}
function zs(t, e, n, r, i, o) {
  return h(), b("svg", v({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, t.pti()), _s(e[0] || (e[0] = [C("path", {
    d: "M6.99701 14C5.85441 13.999 4.72939 13.7186 3.72012 13.1832C2.71084 12.6478 1.84795 11.8737 1.20673 10.9284C0.565504 9.98305 0.165424 8.89526 0.041387 7.75989C-0.0826496 6.62453 0.073125 5.47607 0.495122 4.4147C0.917119 3.35333 1.59252 2.4113 2.46241 1.67077C3.33229 0.930247 4.37024 0.413729 5.4857 0.166275C6.60117 -0.0811796 7.76026 -0.0520535 8.86188 0.251112C9.9635 0.554278 10.9742 1.12227 11.8057 1.90555C11.915 2.01493 11.9764 2.16319 11.9764 2.31778C11.9764 2.47236 11.915 2.62062 11.8057 2.73C11.7521 2.78503 11.688 2.82877 11.6171 2.85864C11.5463 2.8885 11.4702 2.90389 11.3933 2.90389C11.3165 2.90389 11.2404 2.8885 11.1695 2.85864C11.0987 2.82877 11.0346 2.78503 10.9809 2.73C9.9998 1.81273 8.73246 1.26138 7.39226 1.16876C6.05206 1.07615 4.72086 1.44794 3.62279 2.22152C2.52471 2.99511 1.72683 4.12325 1.36345 5.41602C1.00008 6.70879 1.09342 8.08723 1.62775 9.31926C2.16209 10.5513 3.10478 11.5617 4.29713 12.1803C5.48947 12.7989 6.85865 12.988 8.17414 12.7157C9.48963 12.4435 10.6711 11.7264 11.5196 10.6854C12.3681 9.64432 12.8319 8.34282 12.8328 7C12.8328 6.84529 12.8943 6.69692 13.0038 6.58752C13.1132 6.47812 13.2616 6.41667 13.4164 6.41667C13.5712 6.41667 13.7196 6.47812 13.8291 6.58752C13.9385 6.69692 14 6.84529 14 7C14 8.85651 13.2622 10.637 11.9489 11.9497C10.6356 13.2625 8.85432 14 6.99701 14Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
Rt.render = zs;
var Es = `
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
`, Bs = {
  root: function(e) {
    var n = e.props, r = e.instance;
    return ["p-badge p-component", {
      "p-badge-circle": F(n.value) && String(n.value).length === 1,
      "p-badge-dot": Le(n.value) && !r.$slots.default,
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
}, js = M.extend({
  name: "badge",
  style: Es,
  classes: Bs
}), Vs = {
  name: "BaseBadge",
  extends: be,
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
  style: js,
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
function hr(t, e, n) {
  return (e = Ds(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function Ds(t) {
  var e = Ms(t, "string");
  return ft(e) == "symbol" ? e : e + "";
}
function Ms(t, e) {
  if (ft(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(t, e);
    if (ft(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var to = {
  name: "Badge",
  extends: Vs,
  inheritAttrs: !1,
  computed: {
    dataP: function() {
      return ae(hr(hr({
        circle: this.value != null && String(this.value).length === 1,
        empty: this.value == null && !this.$slots.default
      }, this.severity, this.severity), this.size, this.size));
    }
  }
}, Ns = ["data-p"];
function Fs(t, e, n, r, i, o) {
  return h(), b("span", v({
    class: t.cx("root"),
    "data-p": o.dataP
  }, t.ptmi("root")), [A(t.$slots, "default", {}, function() {
    return [Ce(D(t.value), 1)];
  })], 16, Ns);
}
to.render = Fs;
var Rs = `
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
function we(t, e, n) {
  return (e = Ks(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function Ks(t) {
  var e = Us(t, "string");
  return ht(e) == "symbol" ? e : e + "";
}
function Us(t, e) {
  if (ht(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(t, e);
    if (ht(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var Hs = {
  root: function(e) {
    var n = e.instance, r = e.props;
    return ["p-button p-component", we(we(we(we(we(we(we(we(we({
      "p-button-icon-only": n.hasIcon && !r.label && !r.badge,
      "p-button-vertical": (r.iconPos === "top" || r.iconPos === "bottom") && r.label,
      "p-button-loading": r.loading,
      "p-button-link": r.link || r.variant === "link"
    }, "p-button-".concat(r.severity), r.severity), "p-button-raised", r.raised), "p-button-rounded", r.rounded), "p-button-text", r.text || r.variant === "text"), "p-button-outlined", r.outlined || r.variant === "outlined"), "p-button-sm", r.size === "small"), "p-button-lg", r.size === "large"), "p-button-plain", r.plain), "p-button-fluid", n.hasFluid)];
  },
  loadingIcon: "p-button-loading-icon",
  icon: function(e) {
    var n = e.props;
    return ["p-button-icon", we({}, "p-button-icon-".concat(n.iconPos), n.label)];
  },
  label: "p-button-label"
}, Ws = M.extend({
  name: "button",
  style: Rs,
  classes: Hs
}), Gs = {
  name: "BaseButton",
  extends: be,
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
  style: Ws,
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
function le(t, e, n) {
  return (e = qs(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function qs(t) {
  var e = Ys(t, "string");
  return mt(e) == "symbol" ? e : e + "";
}
function Ys(t, e) {
  if (mt(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(t, e);
    if (mt(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var Ye = {
  name: "Button",
  extends: Gs,
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
      return v(this.asAttrs, this.a11yAttrs, this.getPTOptions("root"));
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
      return Le(this.fluid) ? !!this.$pcFluid : this.fluid;
    },
    dataP: function() {
      return ae(le(le(le(le(le(le(le(le(le(le({}, this.size, this.size), "icon-only", this.hasIcon && !this.label && !this.badge), "loading", this.loading), "fluid", this.hasFluid), "rounded", this.rounded), "raised", this.raised), "outlined", this.outlined || this.variant === "outlined"), "text", this.text || this.variant === "text"), "link", this.link || this.variant === "link"), "vertical", (this.iconPos === "top" || this.iconPos === "bottom") && this.label));
    },
    dataIconP: function() {
      return ae(le(le({}, this.iconPos, this.iconPos), this.size, this.size));
    },
    dataLabelP: function() {
      return ae(le(le({}, this.size, this.size), "icon-only", this.hasIcon && !this.label && !this.badge));
    }
  },
  components: {
    SpinnerIcon: Rt,
    Badge: to
  },
  directives: {
    ripple: It
  }
}, Zs = ["data-p"], Js = ["data-p"];
function Qs(t, e, n, r, i, o) {
  var a = re("SpinnerIcon"), s = re("Badge"), l = Ct("ripple");
  return t.asChild ? A(t.$slots, "default", {
    key: 1,
    class: ne(t.cx("root")),
    a11yAttrs: o.a11yAttrs
  }) : Ge((h(), K(me(t.as), v({
    key: 0,
    class: t.cx("root"),
    "data-p": o.dataP
  }, o.attrs), {
    default: ue(function() {
      return [A(t.$slots, "default", {}, function() {
        return [t.loading ? A(t.$slots, "loadingicon", v({
          key: 0,
          class: [t.cx("loadingIcon"), t.cx("icon")]
        }, t.ptm("loadingIcon")), function() {
          return [t.loadingIcon ? (h(), b("span", v({
            key: 0,
            class: [t.cx("loadingIcon"), t.cx("icon"), t.loadingIcon]
          }, t.ptm("loadingIcon")), null, 16)) : (h(), K(a, v({
            key: 1,
            class: [t.cx("loadingIcon"), t.cx("icon")],
            spin: ""
          }, t.ptm("loadingIcon")), null, 16, ["class"]))];
        }) : A(t.$slots, "icon", v({
          key: 1,
          class: [t.cx("icon")]
        }, t.ptm("icon")), function() {
          return [t.icon ? (h(), b("span", v({
            key: 0,
            class: [t.cx("icon"), t.icon, t.iconClass],
            "data-p": o.dataIconP
          }, t.ptm("icon")), null, 16, Zs)) : L("", !0)];
        }), t.label ? (h(), b("span", v({
          key: 2,
          class: t.cx("label")
        }, t.ptm("label"), {
          "data-p": o.dataLabelP
        }), D(t.label), 17, Js)) : L("", !0), t.badge ? (h(), K(s, {
          key: 3,
          value: t.badge,
          class: ne(t.badgeClass),
          severity: t.badgeSeverity,
          unstyled: t.unstyled,
          pt: t.ptm("pcBadge")
        }, null, 8, ["value", "class", "severity", "unstyled", "pt"])) : L("", !0)];
      })];
    }),
    _: 3
  }, 16, ["class", "data-p"])), [[l]]);
}
Ye.render = Qs;
var Xs = {
  root: function(e) {
    var n = e.instance, r = e.props;
    return ["p-tab", {
      "p-tab-active": n.active,
      "p-disabled": r.disabled
    }];
  }
}, el = M.extend({
  name: "tab",
  classes: Xs
}), tl = {
  name: "BaseTab",
  extends: be,
  props: {
    value: {
      type: [String, Number],
      default: void 0
    },
    disabled: {
      type: Boolean,
      default: !1
    },
    as: {
      type: [String, Object],
      default: "BUTTON"
    },
    asChild: {
      type: Boolean,
      default: !1
    }
  },
  style: el,
  provide: function() {
    return {
      $pcTab: this,
      $parentInstance: this
    };
  }
}, no = {
  name: "Tab",
  extends: tl,
  inheritAttrs: !1,
  inject: ["$pcTabs", "$pcTabList"],
  methods: {
    onFocus: function() {
      this.$pcTabs.selectOnFocus && this.changeActiveValue();
    },
    onClick: function() {
      this.changeActiveValue();
    },
    onKeydown: function(e) {
      switch (e.code) {
        case "ArrowRight":
          this.onArrowRightKey(e);
          break;
        case "ArrowLeft":
          this.onArrowLeftKey(e);
          break;
        case "Home":
          this.onHomeKey(e);
          break;
        case "End":
          this.onEndKey(e);
          break;
        case "PageDown":
          this.onPageDownKey(e);
          break;
        case "PageUp":
          this.onPageUpKey(e);
          break;
        case "Enter":
        case "NumpadEnter":
        case "Space":
          this.onEnterKey(e);
          break;
      }
    },
    onArrowRightKey: function(e) {
      var n = this.findNextTab(e.currentTarget);
      n ? this.changeFocusedTab(e, n) : this.onHomeKey(e), e.preventDefault();
    },
    onArrowLeftKey: function(e) {
      var n = this.findPrevTab(e.currentTarget);
      n ? this.changeFocusedTab(e, n) : this.onEndKey(e), e.preventDefault();
    },
    onHomeKey: function(e) {
      var n = this.findFirstTab();
      this.changeFocusedTab(e, n), e.preventDefault();
    },
    onEndKey: function(e) {
      var n = this.findLastTab();
      this.changeFocusedTab(e, n), e.preventDefault();
    },
    onPageDownKey: function(e) {
      this.scrollInView(this.findLastTab()), e.preventDefault();
    },
    onPageUpKey: function(e) {
      this.scrollInView(this.findFirstTab()), e.preventDefault();
    },
    onEnterKey: function(e) {
      this.changeActiveValue();
    },
    findNextTab: function(e) {
      var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1, r = n ? e : e.nextElementSibling;
      return r ? et(r, "data-p-disabled") || et(r, "data-pc-section") === "activebar" ? this.findNextTab(r) : Be(r, '[data-pc-name="tab"]') : null;
    },
    findPrevTab: function(e) {
      var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1, r = n ? e : e.previousElementSibling;
      return r ? et(r, "data-p-disabled") || et(r, "data-pc-section") === "activebar" ? this.findPrevTab(r) : Be(r, '[data-pc-name="tab"]') : null;
    },
    findFirstTab: function() {
      return this.findNextTab(this.$pcTabList.$refs.tabs.firstElementChild, !0);
    },
    findLastTab: function() {
      return this.findPrevTab(this.$pcTabList.$refs.tabs.lastElementChild, !0);
    },
    changeActiveValue: function() {
      this.$pcTabs.updateValue(this.value);
    },
    changeFocusedTab: function(e, n) {
      ke(n), this.scrollInView(n);
    },
    scrollInView: function(e) {
      var n;
      e == null || (n = e.scrollIntoView) === null || n === void 0 || n.call(e, {
        block: "nearest"
      });
    }
  },
  computed: {
    active: function() {
      var e;
      return Ot((e = this.$pcTabs) === null || e === void 0 ? void 0 : e.d_value, this.value);
    },
    id: function() {
      var e;
      return "".concat((e = this.$pcTabs) === null || e === void 0 ? void 0 : e.$id, "_tab_").concat(this.value);
    },
    ariaControls: function() {
      var e;
      return "".concat((e = this.$pcTabs) === null || e === void 0 ? void 0 : e.$id, "_tabpanel_").concat(this.value);
    },
    attrs: function() {
      return v(this.asAttrs, this.a11yAttrs, this.ptmi("root", this.ptParams));
    },
    asAttrs: function() {
      return this.as === "BUTTON" ? {
        type: "button",
        disabled: this.disabled
      } : void 0;
    },
    a11yAttrs: function() {
      return {
        id: this.id,
        tabindex: this.active ? this.$pcTabs.tabindex : -1,
        role: "tab",
        "aria-selected": this.active,
        "aria-controls": this.ariaControls,
        "data-pc-name": "tab",
        "data-p-disabled": this.disabled,
        "data-p-active": this.active,
        onFocus: this.onFocus,
        onKeydown: this.onKeydown
      };
    },
    ptParams: function() {
      return {
        context: {
          active: this.active
        }
      };
    },
    dataP: function() {
      return ae({
        active: this.active
      });
    }
  },
  directives: {
    ripple: It
  }
};
function nl(t, e, n, r, i, o) {
  var a = Ct("ripple");
  return t.asChild ? A(t.$slots, "default", {
    key: 1,
    dataP: o.dataP,
    class: ne(t.cx("root")),
    active: o.active,
    a11yAttrs: o.a11yAttrs,
    onClick: o.onClick
  }) : Ge((h(), K(me(t.as), v({
    key: 0,
    class: t.cx("root"),
    "data-p": o.dataP,
    onClick: o.onClick
  }, o.attrs), {
    default: ue(function() {
      return [A(t.$slots, "default")];
    }),
    _: 3
  }, 16, ["class", "data-p", "onClick"])), [[a]]);
}
no.render = nl;
var ro = {
  name: "ChevronLeftIcon",
  extends: xe
};
function rl(t) {
  return sl(t) || al(t) || il(t) || ol();
}
function ol() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function il(t, e) {
  if (t) {
    if (typeof t == "string") return ln(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? ln(t, e) : void 0;
  }
}
function al(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function sl(t) {
  if (Array.isArray(t)) return ln(t);
}
function ln(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, r = Array(e); n < e; n++) r[n] = t[n];
  return r;
}
function ll(t, e, n, r, i, o) {
  return h(), b("svg", v({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, t.pti()), rl(e[0] || (e[0] = [C("path", {
    d: "M9.61296 13C9.50997 13.0005 9.40792 12.9804 9.3128 12.9409C9.21767 12.9014 9.13139 12.8433 9.05902 12.7701L3.83313 7.54416C3.68634 7.39718 3.60388 7.19795 3.60388 6.99022C3.60388 6.78249 3.68634 6.58325 3.83313 6.43628L9.05902 1.21039C9.20762 1.07192 9.40416 0.996539 9.60724 1.00012C9.81032 1.00371 10.0041 1.08597 10.1477 1.22959C10.2913 1.37322 10.3736 1.56698 10.3772 1.77005C10.3808 1.97313 10.3054 2.16968 10.1669 2.31827L5.49496 6.99022L10.1669 11.6622C10.3137 11.8091 10.3962 12.0084 10.3962 12.2161C10.3962 12.4238 10.3137 12.6231 10.1669 12.7701C10.0945 12.8433 10.0083 12.9014 9.91313 12.9409C9.81801 12.9804 9.71596 13.0005 9.61296 13Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
ro.render = ll;
var oo = {
  name: "ChevronRightIcon",
  extends: xe
};
function ul(t) {
  return fl(t) || pl(t) || cl(t) || dl();
}
function dl() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function cl(t, e) {
  if (t) {
    if (typeof t == "string") return un(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? un(t, e) : void 0;
  }
}
function pl(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function fl(t) {
  if (Array.isArray(t)) return un(t);
}
function un(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, r = Array(e); n < e; n++) r[n] = t[n];
  return r;
}
function hl(t, e, n, r, i, o) {
  return h(), b("svg", v({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, t.pti()), ul(e[0] || (e[0] = [C("path", {
    d: "M4.38708 13C4.28408 13.0005 4.18203 12.9804 4.08691 12.9409C3.99178 12.9014 3.9055 12.8433 3.83313 12.7701C3.68634 12.6231 3.60388 12.4238 3.60388 12.2161C3.60388 12.0084 3.68634 11.8091 3.83313 11.6622L8.50507 6.99022L3.83313 2.31827C3.69467 2.16968 3.61928 1.97313 3.62287 1.77005C3.62645 1.56698 3.70872 1.37322 3.85234 1.22959C3.99596 1.08597 4.18972 1.00371 4.3928 1.00012C4.59588 0.996539 4.79242 1.07192 4.94102 1.21039L10.1669 6.43628C10.3137 6.58325 10.3962 6.78249 10.3962 6.99022C10.3962 7.19795 10.3137 7.39718 10.1669 7.54416L4.94102 12.7701C4.86865 12.8433 4.78237 12.9014 4.68724 12.9409C4.59212 12.9804 4.49007 13.0005 4.38708 13Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
oo.render = hl;
var ml = {
  root: "p-tablist",
  content: "p-tablist-content p-tablist-viewport",
  tabList: "p-tablist-tab-list",
  activeBar: "p-tablist-active-bar",
  prevButton: "p-tablist-prev-button p-tablist-nav-button",
  nextButton: "p-tablist-next-button p-tablist-nav-button"
}, bl = M.extend({
  name: "tablist",
  classes: ml
}), gl = {
  name: "BaseTabList",
  extends: be,
  props: {},
  style: bl,
  provide: function() {
    return {
      $pcTabList: this,
      $parentInstance: this
    };
  }
}, io = {
  name: "TabList",
  extends: gl,
  inheritAttrs: !1,
  inject: ["$pcTabs"],
  data: function() {
    return {
      isPrevButtonEnabled: !1,
      isNextButtonEnabled: !0
    };
  },
  resizeObserver: void 0,
  inkBarObserver: void 0,
  watch: {
    showNavigators: function(e) {
      e ? this.bindResizeObserver() : this.unbindResizeObserver();
    },
    activeValue: {
      flush: "post",
      handler: function() {
        this.updateInkBar(), this.bindInkBarObserver();
      }
    }
  },
  mounted: function() {
    var e = this;
    setTimeout(function() {
      e.updateInkBar(), e.bindInkBarObserver();
    }, 150), this.showNavigators && (this.updateButtonState(), this.bindResizeObserver());
  },
  updated: function() {
    this.showNavigators && this.updateButtonState();
  },
  beforeUnmount: function() {
    this.unbindResizeObserver(), this.unbindInkBarObserver();
  },
  methods: {
    onScroll: function(e) {
      this.showNavigators && this.updateButtonState(), e.preventDefault();
    },
    onPrevButtonClick: function() {
      var e = this.$refs.content, n = this.getVisibleButtonWidths(), r = $e(e) - n, i = Math.abs(e.scrollLeft), o = r * 0.8, a = i - o, s = Math.max(a, 0);
      e.scrollLeft = Xt(e) ? -1 * s : s;
    },
    onNextButtonClick: function() {
      var e = this.$refs.content, n = this.getVisibleButtonWidths(), r = $e(e) - n, i = Math.abs(e.scrollLeft), o = r * 0.8, a = i + o, s = e.scrollWidth - r, l = Math.min(a, s);
      e.scrollLeft = Xt(e) ? -1 * l : l;
    },
    bindResizeObserver: function() {
      var e = this;
      this.resizeObserver = new ResizeObserver(function() {
        return e.updateButtonState();
      }), this.resizeObserver.observe(this.$refs.list);
    },
    unbindResizeObserver: function() {
      var e;
      (e = this.resizeObserver) === null || e === void 0 || e.unobserve(this.$refs.list), this.resizeObserver = void 0;
    },
    bindInkBarObserver: function() {
      var e = this;
      this.unbindInkBarObserver();
      var n = this.$refs.content, r = Be(n, '[data-pc-name="tab"][data-p-active="true"]');
      r && (this.inkBarObserver = new ResizeObserver(function() {
        return e.updateInkBar();
      }), this.inkBarObserver.observe(r));
    },
    unbindInkBarObserver: function() {
      var e;
      (e = this.inkBarObserver) === null || e === void 0 || e.disconnect(), this.inkBarObserver = void 0;
    },
    updateInkBar: function() {
      var e = this.$refs, n = e.content, r = e.inkbar, i = e.tabs;
      if (r) {
        var o = Be(n, '[data-pc-name="tab"][data-p-active="true"]');
        this.$pcTabs.isVertical() ? (r.style.height = Nr(o) + "px", r.style.top = tt(o).top - tt(i).top + "px") : (r.style.width = _n(o) + "px", r.style.left = tt(o).left - tt(i).left + "px");
      }
    },
    updateButtonState: function() {
      var e = this.$refs, n = e.list, r = e.content, i = r.scrollTop, o = r.scrollWidth, a = r.scrollHeight, s = r.offsetWidth, l = r.offsetHeight, u = Math.abs(r.scrollLeft), d = [$e(r), Ae(r)], c = d[0], p = d[1];
      this.$pcTabs.isVertical() ? (this.isPrevButtonEnabled = i !== 0, this.isNextButtonEnabled = n.offsetHeight >= l && parseInt(i) !== a - p) : (this.isPrevButtonEnabled = u !== 0, this.isNextButtonEnabled = n.offsetWidth >= s && parseInt(u) !== o - c);
    },
    getVisibleButtonWidths: function() {
      var e = this.$refs, n = e.prevButton, r = e.nextButton, i = 0;
      return this.showNavigators && (i = (n?.offsetWidth || 0) + (r?.offsetWidth || 0)), i;
    }
  },
  computed: {
    templates: function() {
      return this.$pcTabs.$slots;
    },
    activeValue: function() {
      return this.$pcTabs.d_value;
    },
    showNavigators: function() {
      return this.$pcTabs.showNavigators;
    },
    prevButtonAriaLabel: function() {
      return this.$primevue.config.locale.aria ? this.$primevue.config.locale.aria.previous : void 0;
    },
    nextButtonAriaLabel: function() {
      return this.$primevue.config.locale.aria ? this.$primevue.config.locale.aria.next : void 0;
    },
    dataP: function() {
      return ae({
        scrollable: this.$pcTabs.scrollable
      });
    }
  },
  components: {
    ChevronLeftIcon: ro,
    ChevronRightIcon: oo
  },
  directives: {
    ripple: It
  }
}, vl = ["data-p"], yl = ["aria-label", "tabindex"], xl = ["data-p"], wl = ["aria-orientation"], kl = ["aria-label", "tabindex"];
function Sl(t, e, n, r, i, o) {
  var a = Ct("ripple");
  return h(), b("div", v({
    ref: "list",
    class: t.cx("root"),
    "data-p": o.dataP
  }, t.ptmi("root")), [o.showNavigators && i.isPrevButtonEnabled ? Ge((h(), b("button", v({
    key: 0,
    ref: "prevButton",
    type: "button",
    class: t.cx("prevButton"),
    "aria-label": o.prevButtonAriaLabel,
    tabindex: o.$pcTabs.tabindex,
    onClick: e[0] || (e[0] = function() {
      return o.onPrevButtonClick && o.onPrevButtonClick.apply(o, arguments);
    })
  }, t.ptm("prevButton"), {
    "data-pc-group-section": "navigator"
  }), [(h(), K(me(o.templates.previcon || "ChevronLeftIcon"), v({
    "aria-hidden": "true"
  }, t.ptm("prevIcon")), null, 16))], 16, yl)), [[a]]) : L("", !0), C("div", v({
    ref: "content",
    class: t.cx("content"),
    onScroll: e[1] || (e[1] = function() {
      return o.onScroll && o.onScroll.apply(o, arguments);
    }),
    "data-p": o.dataP
  }, t.ptm("content")), [C("div", v({
    ref: "tabs",
    class: t.cx("tabList"),
    role: "tablist",
    "aria-orientation": o.$pcTabs.orientation || "horizontal"
  }, t.ptm("tabList")), [A(t.$slots, "default"), C("span", v({
    ref: "inkbar",
    class: t.cx("activeBar"),
    role: "presentation",
    "aria-hidden": "true"
  }, t.ptm("activeBar")), null, 16)], 16, wl)], 16, xl), o.showNavigators && i.isNextButtonEnabled ? Ge((h(), b("button", v({
    key: 1,
    ref: "nextButton",
    type: "button",
    class: t.cx("nextButton"),
    "aria-label": o.nextButtonAriaLabel,
    tabindex: o.$pcTabs.tabindex,
    onClick: e[2] || (e[2] = function() {
      return o.onNextButtonClick && o.onNextButtonClick.apply(o, arguments);
    })
  }, t.ptm("nextButton"), {
    "data-pc-group-section": "navigator"
  }), [(h(), K(me(o.templates.nexticon || "ChevronRightIcon"), v({
    "aria-hidden": "true"
  }, t.ptm("nextIcon")), null, 16))], 16, kl)), [[a]]) : L("", !0)], 16, vl);
}
io.render = Sl;
var $l = `
    .p-tabs {
        display: flex;
        flex-direction: column;
    }

    .p-tablist {
        display: flex;
        position: relative;
        overflow: hidden;
        background: dt('tabs.tablist.background');
    }

    .p-tablist-viewport {
        overflow-x: auto;
        overflow-y: hidden;
        scroll-behavior: smooth;
        scrollbar-width: none;
        overscroll-behavior: contain auto;
    }

    .p-tablist-viewport::-webkit-scrollbar {
        display: none;
    }

    .p-tablist-tab-list {
        position: relative;
        display: flex;
        border-style: solid;
        border-color: dt('tabs.tablist.border.color');
        border-width: dt('tabs.tablist.border.width');
    }

    .p-tablist-content {
        flex-grow: 1;
    }

    .p-tablist-nav-button {
        all: unset;
        position: absolute !important;
        flex-shrink: 0;
        inset-block-start: 0;
        z-index: 2;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        background: dt('tabs.nav.button.background');
        color: dt('tabs.nav.button.color');
        width: dt('tabs.nav.button.width');
        transition:
            color dt('tabs.transition.duration'),
            outline-color dt('tabs.transition.duration'),
            box-shadow dt('tabs.transition.duration');
        box-shadow: dt('tabs.nav.button.shadow');
        outline-color: transparent;
        cursor: pointer;
    }

    .p-tablist-nav-button:focus-visible {
        z-index: 1;
        box-shadow: dt('tabs.nav.button.focus.ring.shadow');
        outline: dt('tabs.nav.button.focus.ring.width') dt('tabs.nav.button.focus.ring.style') dt('tabs.nav.button.focus.ring.color');
        outline-offset: dt('tabs.nav.button.focus.ring.offset');
    }

    .p-tablist-nav-button:hover {
        color: dt('tabs.nav.button.hover.color');
    }

    .p-tablist-prev-button {
        inset-inline-start: 0;
    }

    .p-tablist-next-button {
        inset-inline-end: 0;
    }

    .p-tablist-prev-button:dir(rtl),
    .p-tablist-next-button:dir(rtl) {
        transform: rotate(180deg);
    }

    .p-tab {
        flex-shrink: 0;
        cursor: pointer;
        user-select: none;
        position: relative;
        border-style: solid;
        white-space: nowrap;
        gap: dt('tabs.tab.gap');
        background: dt('tabs.tab.background');
        border-width: dt('tabs.tab.border.width');
        border-color: dt('tabs.tab.border.color');
        color: dt('tabs.tab.color');
        padding: dt('tabs.tab.padding');
        font-weight: dt('tabs.tab.font.weight');
        transition:
            background dt('tabs.transition.duration'),
            border-color dt('tabs.transition.duration'),
            color dt('tabs.transition.duration'),
            outline-color dt('tabs.transition.duration'),
            box-shadow dt('tabs.transition.duration');
        margin: dt('tabs.tab.margin');
        outline-color: transparent;
    }

    .p-tab:not(.p-disabled):focus-visible {
        z-index: 1;
        box-shadow: dt('tabs.tab.focus.ring.shadow');
        outline: dt('tabs.tab.focus.ring.width') dt('tabs.tab.focus.ring.style') dt('tabs.tab.focus.ring.color');
        outline-offset: dt('tabs.tab.focus.ring.offset');
    }

    .p-tab:not(.p-tab-active):not(.p-disabled):hover {
        background: dt('tabs.tab.hover.background');
        border-color: dt('tabs.tab.hover.border.color');
        color: dt('tabs.tab.hover.color');
    }

    .p-tab-active {
        background: dt('tabs.tab.active.background');
        border-color: dt('tabs.tab.active.border.color');
        color: dt('tabs.tab.active.color');
    }

    .p-tabpanels {
        background: dt('tabs.tabpanel.background');
        color: dt('tabs.tabpanel.color');
        padding: dt('tabs.tabpanel.padding');
        outline: 0 none;
    }

    .p-tabpanel:focus-visible {
        box-shadow: dt('tabs.tabpanel.focus.ring.shadow');
        outline: dt('tabs.tabpanel.focus.ring.width') dt('tabs.tabpanel.focus.ring.style') dt('tabs.tabpanel.focus.ring.color');
        outline-offset: dt('tabs.tabpanel.focus.ring.offset');
    }

    .p-tablist-active-bar {
        z-index: 1;
        display: block;
        position: absolute;
        inset-block-end: dt('tabs.active.bar.bottom');
        height: dt('tabs.active.bar.height');
        background: dt('tabs.active.bar.background');
        transition: 250ms cubic-bezier(0.35, 0, 0.25, 1);
    }
`, Cl = {
  root: function(e) {
    var n = e.props;
    return ["p-tabs p-component", {
      "p-tabs-scrollable": n.scrollable
    }];
  }
}, Ol = M.extend({
  name: "tabs",
  style: $l,
  classes: Cl
}), Il = {
  name: "BaseTabs",
  extends: be,
  props: {
    value: {
      type: [String, Number],
      default: void 0
    },
    lazy: {
      type: Boolean,
      default: !1
    },
    scrollable: {
      type: Boolean,
      default: !1
    },
    showNavigators: {
      type: Boolean,
      default: !0
    },
    tabindex: {
      type: Number,
      default: 0
    },
    selectOnFocus: {
      type: Boolean,
      default: !1
    }
  },
  style: Ol,
  provide: function() {
    return {
      $pcTabs: this,
      $parentInstance: this
    };
  }
}, ao = {
  name: "Tabs",
  extends: Il,
  inheritAttrs: !1,
  emits: ["update:value"],
  data: function() {
    return {
      d_value: this.value
    };
  },
  watch: {
    value: function(e) {
      this.d_value = e;
    }
  },
  methods: {
    updateValue: function(e) {
      this.d_value !== e && (this.d_value = e, this.$emit("update:value", e));
    },
    isVertical: function() {
      return this.orientation === "vertical";
    }
  }
};
function _l(t, e, n, r, i, o) {
  return h(), b("div", v({
    class: t.cx("root")
  }, t.ptmi("root")), [A(t.$slots, "default")], 16);
}
ao.render = _l;
var Kt = {
  name: "TimesIcon",
  extends: xe
};
function Tl(t) {
  return zl(t) || Al(t) || Ll(t) || Pl();
}
function Pl() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Ll(t, e) {
  if (t) {
    if (typeof t == "string") return dn(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? dn(t, e) : void 0;
  }
}
function Al(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function zl(t) {
  if (Array.isArray(t)) return dn(t);
}
function dn(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, r = Array(e); n < e; n++) r[n] = t[n];
  return r;
}
function El(t, e, n, r, i, o) {
  return h(), b("svg", v({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, t.pti()), Tl(e[0] || (e[0] = [C("path", {
    d: "M8.01186 7.00933L12.27 2.75116C12.341 2.68501 12.398 2.60524 12.4375 2.51661C12.4769 2.42798 12.4982 2.3323 12.4999 2.23529C12.5016 2.13827 12.4838 2.0419 12.4474 1.95194C12.4111 1.86197 12.357 1.78024 12.2884 1.71163C12.2198 1.64302 12.138 1.58893 12.0481 1.55259C11.9581 1.51625 11.8617 1.4984 11.7647 1.50011C11.6677 1.50182 11.572 1.52306 11.4834 1.56255C11.3948 1.60204 11.315 1.65898 11.2488 1.72997L6.99067 5.98814L2.7325 1.72997C2.59553 1.60234 2.41437 1.53286 2.22718 1.53616C2.03999 1.53946 1.8614 1.61529 1.72901 1.74767C1.59663 1.88006 1.5208 2.05865 1.5175 2.24584C1.5142 2.43303 1.58368 2.61419 1.71131 2.75116L5.96948 7.00933L1.71131 11.2675C1.576 11.403 1.5 11.5866 1.5 11.7781C1.5 11.9696 1.576 12.1532 1.71131 12.2887C1.84679 12.424 2.03043 12.5 2.2219 12.5C2.41338 12.5 2.59702 12.424 2.7325 12.2887L6.99067 8.03052L11.2488 12.2887C11.3843 12.424 11.568 12.5 11.7594 12.5C11.9509 12.5 12.1346 12.424 12.27 12.2887C12.4053 12.1532 12.4813 11.9696 12.4813 11.7781C12.4813 11.5866 12.4053 11.403 12.27 11.2675L8.01186 7.00933Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
Kt.render = El;
var Bl = `
    .p-message {
        display: grid;
        grid-template-rows: 1fr;
        border-radius: dt('message.border.radius');
        outline-width: dt('message.border.width');
        outline-style: solid;
    }

    .p-message-content-wrapper {
        min-height: 0;
    }

    .p-message-content {
        display: flex;
        align-items: center;
        padding: dt('message.content.padding');
        gap: dt('message.content.gap');
    }

    .p-message-icon {
        flex-shrink: 0;
    }

    .p-message-close-button {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        margin-inline-start: auto;
        overflow: hidden;
        position: relative;
        width: dt('message.close.button.width');
        height: dt('message.close.button.height');
        border-radius: dt('message.close.button.border.radius');
        background: transparent;
        transition:
            background dt('message.transition.duration'),
            color dt('message.transition.duration'),
            outline-color dt('message.transition.duration'),
            box-shadow dt('message.transition.duration'),
            opacity 0.3s;
        outline-color: transparent;
        color: inherit;
        padding: 0;
        border: none;
        cursor: pointer;
        user-select: none;
    }

    .p-message-close-icon {
        font-size: dt('message.close.icon.size');
        width: dt('message.close.icon.size');
        height: dt('message.close.icon.size');
    }

    .p-message-close-button:focus-visible {
        outline-width: dt('message.close.button.focus.ring.width');
        outline-style: dt('message.close.button.focus.ring.style');
        outline-offset: dt('message.close.button.focus.ring.offset');
    }

    .p-message-info {
        background: dt('message.info.background');
        outline-color: dt('message.info.border.color');
        color: dt('message.info.color');
        box-shadow: dt('message.info.shadow');
    }

    .p-message-info .p-message-close-button:focus-visible {
        outline-color: dt('message.info.close.button.focus.ring.color');
        box-shadow: dt('message.info.close.button.focus.ring.shadow');
    }

    .p-message-info .p-message-close-button:hover {
        background: dt('message.info.close.button.hover.background');
    }

    .p-message-info.p-message-outlined {
        color: dt('message.info.outlined.color');
        outline-color: dt('message.info.outlined.border.color');
    }

    .p-message-info.p-message-simple {
        color: dt('message.info.simple.color');
    }

    .p-message-success {
        background: dt('message.success.background');
        outline-color: dt('message.success.border.color');
        color: dt('message.success.color');
        box-shadow: dt('message.success.shadow');
    }

    .p-message-success .p-message-close-button:focus-visible {
        outline-color: dt('message.success.close.button.focus.ring.color');
        box-shadow: dt('message.success.close.button.focus.ring.shadow');
    }

    .p-message-success .p-message-close-button:hover {
        background: dt('message.success.close.button.hover.background');
    }

    .p-message-success.p-message-outlined {
        color: dt('message.success.outlined.color');
        outline-color: dt('message.success.outlined.border.color');
    }

    .p-message-success.p-message-simple {
        color: dt('message.success.simple.color');
    }

    .p-message-warn {
        background: dt('message.warn.background');
        outline-color: dt('message.warn.border.color');
        color: dt('message.warn.color');
        box-shadow: dt('message.warn.shadow');
    }

    .p-message-warn .p-message-close-button:focus-visible {
        outline-color: dt('message.warn.close.button.focus.ring.color');
        box-shadow: dt('message.warn.close.button.focus.ring.shadow');
    }

    .p-message-warn .p-message-close-button:hover {
        background: dt('message.warn.close.button.hover.background');
    }

    .p-message-warn.p-message-outlined {
        color: dt('message.warn.outlined.color');
        outline-color: dt('message.warn.outlined.border.color');
    }

    .p-message-warn.p-message-simple {
        color: dt('message.warn.simple.color');
    }

    .p-message-error {
        background: dt('message.error.background');
        outline-color: dt('message.error.border.color');
        color: dt('message.error.color');
        box-shadow: dt('message.error.shadow');
    }

    .p-message-error .p-message-close-button:focus-visible {
        outline-color: dt('message.error.close.button.focus.ring.color');
        box-shadow: dt('message.error.close.button.focus.ring.shadow');
    }

    .p-message-error .p-message-close-button:hover {
        background: dt('message.error.close.button.hover.background');
    }

    .p-message-error.p-message-outlined {
        color: dt('message.error.outlined.color');
        outline-color: dt('message.error.outlined.border.color');
    }

    .p-message-error.p-message-simple {
        color: dt('message.error.simple.color');
    }

    .p-message-secondary {
        background: dt('message.secondary.background');
        outline-color: dt('message.secondary.border.color');
        color: dt('message.secondary.color');
        box-shadow: dt('message.secondary.shadow');
    }

    .p-message-secondary .p-message-close-button:focus-visible {
        outline-color: dt('message.secondary.close.button.focus.ring.color');
        box-shadow: dt('message.secondary.close.button.focus.ring.shadow');
    }

    .p-message-secondary .p-message-close-button:hover {
        background: dt('message.secondary.close.button.hover.background');
    }

    .p-message-secondary.p-message-outlined {
        color: dt('message.secondary.outlined.color');
        outline-color: dt('message.secondary.outlined.border.color');
    }

    .p-message-secondary.p-message-simple {
        color: dt('message.secondary.simple.color');
    }

    .p-message-contrast {
        background: dt('message.contrast.background');
        outline-color: dt('message.contrast.border.color');
        color: dt('message.contrast.color');
        box-shadow: dt('message.contrast.shadow');
    }

    .p-message-contrast .p-message-close-button:focus-visible {
        outline-color: dt('message.contrast.close.button.focus.ring.color');
        box-shadow: dt('message.contrast.close.button.focus.ring.shadow');
    }

    .p-message-contrast .p-message-close-button:hover {
        background: dt('message.contrast.close.button.hover.background');
    }

    .p-message-contrast.p-message-outlined {
        color: dt('message.contrast.outlined.color');
        outline-color: dt('message.contrast.outlined.border.color');
    }

    .p-message-contrast.p-message-simple {
        color: dt('message.contrast.simple.color');
    }

    .p-message-text {
        font-size: dt('message.text.font.size');
        font-weight: dt('message.text.font.weight');
    }

    .p-message-icon {
        font-size: dt('message.icon.size');
        width: dt('message.icon.size');
        height: dt('message.icon.size');
    }

    .p-message-sm .p-message-content {
        padding: dt('message.content.sm.padding');
    }

    .p-message-sm .p-message-text {
        font-size: dt('message.text.sm.font.size');
    }

    .p-message-sm .p-message-icon {
        font-size: dt('message.icon.sm.size');
        width: dt('message.icon.sm.size');
        height: dt('message.icon.sm.size');
    }

    .p-message-sm .p-message-close-icon {
        font-size: dt('message.close.icon.sm.size');
        width: dt('message.close.icon.sm.size');
        height: dt('message.close.icon.sm.size');
    }

    .p-message-lg .p-message-content {
        padding: dt('message.content.lg.padding');
    }

    .p-message-lg .p-message-text {
        font-size: dt('message.text.lg.font.size');
    }

    .p-message-lg .p-message-icon {
        font-size: dt('message.icon.lg.size');
        width: dt('message.icon.lg.size');
        height: dt('message.icon.lg.size');
    }

    .p-message-lg .p-message-close-icon {
        font-size: dt('message.close.icon.lg.size');
        width: dt('message.close.icon.lg.size');
        height: dt('message.close.icon.lg.size');
    }

    .p-message-outlined {
        background: transparent;
        outline-width: dt('message.outlined.border.width');
    }

    .p-message-simple {
        background: transparent;
        outline-color: transparent;
        box-shadow: none;
    }

    .p-message-simple .p-message-content {
        padding: dt('message.simple.content.padding');
    }

    .p-message-outlined .p-message-close-button:hover,
    .p-message-simple .p-message-close-button:hover {
        background: transparent;
    }

    .p-message-enter-active {
        animation: p-animate-message-enter 0.3s ease-out forwards;
        overflow: hidden;
    }

    .p-message-leave-active {
        animation: p-animate-message-leave 0.15s ease-in forwards;
        overflow: hidden;
    }

    @keyframes p-animate-message-enter {
        from {
            opacity: 0;
            grid-template-rows: 0fr;
        }
        to {
            opacity: 1;
            grid-template-rows: 1fr;
        }
    }

    @keyframes p-animate-message-leave {
        from {
            opacity: 1;
            grid-template-rows: 1fr;
        }
        to {
            opacity: 0;
            margin: 0;
            grid-template-rows: 0fr;
        }
    }
`, jl = {
  root: function(e) {
    var n = e.props;
    return ["p-message p-component p-message-" + n.severity, {
      "p-message-outlined": n.variant === "outlined",
      "p-message-simple": n.variant === "simple",
      "p-message-sm": n.size === "small",
      "p-message-lg": n.size === "large"
    }];
  },
  contentWrapper: "p-message-content-wrapper",
  content: "p-message-content",
  icon: "p-message-icon",
  text: "p-message-text",
  closeButton: "p-message-close-button",
  closeIcon: "p-message-close-icon"
}, Vl = M.extend({
  name: "message",
  style: Bl,
  classes: jl
}), Dl = {
  name: "BaseMessage",
  extends: be,
  props: {
    severity: {
      type: String,
      default: "info"
    },
    closable: {
      type: Boolean,
      default: !1
    },
    life: {
      type: Number,
      default: null
    },
    icon: {
      type: String,
      default: void 0
    },
    closeIcon: {
      type: String,
      default: void 0
    },
    closeButtonProps: {
      type: null,
      default: null
    },
    size: {
      type: String,
      default: null
    },
    variant: {
      type: String,
      default: null
    }
  },
  style: Vl,
  provide: function() {
    return {
      $pcMessage: this,
      $parentInstance: this
    };
  }
};
function bt(t) {
  "@babel/helpers - typeof";
  return bt = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, bt(t);
}
function mr(t, e, n) {
  return (e = Ml(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function Ml(t) {
  var e = Nl(t, "string");
  return bt(e) == "symbol" ? e : e + "";
}
function Nl(t, e) {
  if (bt(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(t, e);
    if (bt(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var so = {
  name: "Message",
  extends: Dl,
  inheritAttrs: !1,
  emits: ["close", "life-end"],
  timeout: null,
  data: function() {
    return {
      visible: !0
    };
  },
  mounted: function() {
    var e = this;
    this.life && setTimeout(function() {
      e.visible = !1, e.$emit("life-end");
    }, this.life);
  },
  methods: {
    close: function(e) {
      this.visible = !1, this.$emit("close", e);
    }
  },
  computed: {
    closeAriaLabel: function() {
      return this.$primevue.config.locale.aria ? this.$primevue.config.locale.aria.close : void 0;
    },
    dataP: function() {
      return ae(mr(mr({
        outlined: this.variant === "outlined",
        simple: this.variant === "simple"
      }, this.severity, this.severity), this.size, this.size));
    }
  },
  directives: {
    ripple: It
  },
  components: {
    TimesIcon: Kt
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
function br(t, e) {
  var n = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(t);
    e && (r = r.filter(function(i) {
      return Object.getOwnPropertyDescriptor(t, i).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function gr(t) {
  for (var e = 1; e < arguments.length; e++) {
    var n = arguments[e] != null ? arguments[e] : {};
    e % 2 ? br(Object(n), !0).forEach(function(r) {
      Fl(t, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(n)) : br(Object(n)).forEach(function(r) {
      Object.defineProperty(t, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return t;
}
function Fl(t, e, n) {
  return (e = Rl(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function Rl(t) {
  var e = Kl(t, "string");
  return gt(e) == "symbol" ? e : e + "";
}
function Kl(t, e) {
  if (gt(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(t, e);
    if (gt(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var Ul = ["data-p"], Hl = ["data-p"], Wl = ["data-p"], Gl = ["aria-label", "data-p"], ql = ["data-p"];
function Yl(t, e, n, r, i, o) {
  var a = re("TimesIcon"), s = Ct("ripple");
  return h(), K(Tr, v({
    name: "p-message",
    appear: ""
  }, t.ptmi("transition")), {
    default: ue(function() {
      return [i.visible ? (h(), b("div", v({
        key: 0,
        class: t.cx("root"),
        role: "alert",
        "aria-live": "assertive",
        "aria-atomic": "true",
        "data-p": o.dataP
      }, t.ptm("root")), [C("div", v({
        class: t.cx("contentWrapper")
      }, t.ptm("contentWrapper")), [t.$slots.container ? A(t.$slots, "container", {
        key: 0,
        closeCallback: o.close
      }) : (h(), b("div", v({
        key: 1,
        class: t.cx("content"),
        "data-p": o.dataP
      }, t.ptm("content")), [A(t.$slots, "icon", {
        class: ne(t.cx("icon"))
      }, function() {
        return [(h(), K(me(t.icon ? "span" : null), v({
          class: [t.cx("icon"), t.icon],
          "data-p": o.dataP
        }, t.ptm("icon")), null, 16, ["class", "data-p"]))];
      }), t.$slots.default ? (h(), b("div", v({
        key: 0,
        class: t.cx("text"),
        "data-p": o.dataP
      }, t.ptm("text")), [A(t.$slots, "default")], 16, Wl)) : L("", !0), t.closable ? Ge((h(), b("button", v({
        key: 1,
        class: t.cx("closeButton"),
        "aria-label": o.closeAriaLabel,
        type: "button",
        onClick: e[0] || (e[0] = function(l) {
          return o.close(l);
        }),
        "data-p": o.dataP
      }, gr(gr({}, t.closeButtonProps), t.ptm("closeButton"))), [A(t.$slots, "closeicon", {}, function() {
        return [t.closeIcon ? (h(), b("i", v({
          key: 0,
          class: [t.cx("closeIcon"), t.closeIcon],
          "data-p": o.dataP
        }, t.ptm("closeIcon")), null, 16, ql)) : (h(), K(a, v({
          key: 1,
          class: [t.cx("closeIcon"), t.closeIcon],
          "data-p": o.dataP
        }, t.ptm("closeIcon")), null, 16, ["class", "data-p"]))];
      })], 16, Gl)), [[s]]) : L("", !0)], 16, Hl))], 16)], 16, Ul)) : L("", !0)];
    }),
    _: 3
  }, 16);
}
so.render = Yl;
var Zl = `
    .p-tag {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        background: dt('tag.primary.background');
        color: dt('tag.primary.color');
        font-size: dt('tag.font.size');
        font-weight: dt('tag.font.weight');
        padding: dt('tag.padding');
        border-radius: dt('tag.border.radius');
        gap: dt('tag.gap');
    }

    .p-tag-icon {
        font-size: dt('tag.icon.size');
        width: dt('tag.icon.size');
        height: dt('tag.icon.size');
    }

    .p-tag-rounded {
        border-radius: dt('tag.rounded.border.radius');
    }

    .p-tag-success {
        background: dt('tag.success.background');
        color: dt('tag.success.color');
    }

    .p-tag-info {
        background: dt('tag.info.background');
        color: dt('tag.info.color');
    }

    .p-tag-warn {
        background: dt('tag.warn.background');
        color: dt('tag.warn.color');
    }

    .p-tag-danger {
        background: dt('tag.danger.background');
        color: dt('tag.danger.color');
    }

    .p-tag-secondary {
        background: dt('tag.secondary.background');
        color: dt('tag.secondary.color');
    }

    .p-tag-contrast {
        background: dt('tag.contrast.background');
        color: dt('tag.contrast.color');
    }
`, Jl = {
  root: function(e) {
    var n = e.props;
    return ["p-tag p-component", {
      "p-tag-info": n.severity === "info",
      "p-tag-success": n.severity === "success",
      "p-tag-warn": n.severity === "warn",
      "p-tag-danger": n.severity === "danger",
      "p-tag-secondary": n.severity === "secondary",
      "p-tag-contrast": n.severity === "contrast",
      "p-tag-rounded": n.rounded
    }];
  },
  icon: "p-tag-icon",
  label: "p-tag-label"
}, Ql = M.extend({
  name: "tag",
  style: Zl,
  classes: Jl
}), Xl = {
  name: "BaseTag",
  extends: be,
  props: {
    value: null,
    severity: null,
    rounded: Boolean,
    icon: String
  },
  style: Ql,
  provide: function() {
    return {
      $pcTag: this,
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
function eu(t, e, n) {
  return (e = tu(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function tu(t) {
  var e = nu(t, "string");
  return vt(e) == "symbol" ? e : e + "";
}
function nu(t, e) {
  if (vt(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(t, e);
    if (vt(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var Mt = {
  name: "Tag",
  extends: Xl,
  inheritAttrs: !1,
  computed: {
    dataP: function() {
      return ae(eu({
        rounded: this.rounded
      }, this.severity, this.severity));
    }
  }
}, ru = ["data-p"];
function ou(t, e, n, r, i, o) {
  return h(), b("span", v({
    class: t.cx("root"),
    "data-p": o.dataP
  }, t.ptmi("root")), [t.$slots.icon ? (h(), K(me(t.$slots.icon), v({
    key: 0,
    class: t.cx("icon")
  }, t.ptm("icon")), null, 16, ["class"])) : t.icon ? (h(), b("span", v({
    key: 1,
    class: [t.cx("icon"), t.icon]
  }, t.ptm("icon")), null, 16)) : L("", !0), t.value != null || t.$slots.default ? A(t.$slots, "default", {
    key: 2
  }, function() {
    return [C("span", v({
      class: t.cx("label")
    }, t.ptm("label")), D(t.value), 17)];
  }) : L("", !0)], 16, ru);
}
Mt.render = ou;
var zn = {
  name: "CheckIcon",
  extends: xe
};
function iu(t) {
  return uu(t) || lu(t) || su(t) || au();
}
function au() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function su(t, e) {
  if (t) {
    if (typeof t == "string") return cn(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? cn(t, e) : void 0;
  }
}
function lu(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function uu(t) {
  if (Array.isArray(t)) return cn(t);
}
function cn(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, r = Array(e); n < e; n++) r[n] = t[n];
  return r;
}
function du(t, e, n, r, i, o) {
  return h(), b("svg", v({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, t.pti()), iu(e[0] || (e[0] = [C("path", {
    d: "M4.86199 11.5948C4.78717 11.5923 4.71366 11.5745 4.64596 11.5426C4.57826 11.5107 4.51779 11.4652 4.46827 11.4091L0.753985 7.69483C0.683167 7.64891 0.623706 7.58751 0.580092 7.51525C0.536478 7.44299 0.509851 7.36177 0.502221 7.27771C0.49459 7.19366 0.506156 7.10897 0.536046 7.03004C0.565935 6.95111 0.613367 6.88 0.674759 6.82208C0.736151 6.76416 0.8099 6.72095 0.890436 6.69571C0.970973 6.67046 1.05619 6.66385 1.13966 6.67635C1.22313 6.68886 1.30266 6.72017 1.37226 6.76792C1.44186 6.81567 1.4997 6.8786 1.54141 6.95197L4.86199 10.2503L12.6397 2.49483C12.7444 2.42694 12.8689 2.39617 12.9932 2.40745C13.1174 2.41873 13.2343 2.47141 13.3251 2.55705C13.4159 2.64268 13.4753 2.75632 13.4938 2.87973C13.5123 3.00315 13.4888 3.1292 13.4271 3.23768L5.2557 11.4091C5.20618 11.4652 5.14571 11.5107 5.07801 11.5426C5.01031 11.5745 4.9368 11.5923 4.86199 11.5948Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
zn.render = du;
var lo = {
  name: "MinusIcon",
  extends: xe
};
function cu(t) {
  return mu(t) || hu(t) || fu(t) || pu();
}
function pu() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function fu(t, e) {
  if (t) {
    if (typeof t == "string") return pn(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? pn(t, e) : void 0;
  }
}
function hu(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function mu(t) {
  if (Array.isArray(t)) return pn(t);
}
function pn(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, r = Array(e); n < e; n++) r[n] = t[n];
  return r;
}
function bu(t, e, n, r, i, o) {
  return h(), b("svg", v({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, t.pti()), cu(e[0] || (e[0] = [C("path", {
    d: "M13.2222 7.77778H0.777778C0.571498 7.77778 0.373667 7.69584 0.227806 7.54998C0.0819442 7.40412 0 7.20629 0 7.00001C0 6.79373 0.0819442 6.5959 0.227806 6.45003C0.373667 6.30417 0.571498 6.22223 0.777778 6.22223H13.2222C13.4285 6.22223 13.6263 6.30417 13.7722 6.45003C13.9181 6.5959 14 6.79373 14 7.00001C14 7.20629 13.9181 7.40412 13.7722 7.54998C13.6263 7.69584 13.4285 7.77778 13.2222 7.77778Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
lo.render = bu;
var gu = {
  name: "BaseEditableHolder",
  extends: be,
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
        var n, r;
        this.formField = ((n = this.$pcForm) === null || n === void 0 || (r = n.register) === null || r === void 0 ? void 0 : r.call(n, e, this.$formControl)) || {};
      }
    },
    $formControl: {
      immediate: !0,
      handler: function(e) {
        var n, r;
        this.formField = ((n = this.$pcForm) === null || n === void 0 || (r = n.register) === null || r === void 0 ? void 0 : r.call(n, this.$formName, e)) || {};
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
      var r, i;
      this.controlled && (this.d_value = e, this.$emit("update:modelValue", e)), this.$emit("value-change", e), (r = (i = this.formField).onChange) === null || r === void 0 || r.call(i, {
        originalEvent: n,
        value: e
      });
    },
    // @todo move to @primeuix/utils
    findNonEmpty: function() {
      for (var e = arguments.length, n = new Array(e), r = 0; r < e; r++)
        n[r] = arguments[r];
      return n.find(F);
    }
  },
  computed: {
    $filled: function() {
      return F(this.d_value);
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
}, _t = {
  name: "BaseInput",
  extends: gu,
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
}, vu = `
    .p-checkbox {
        position: relative;
        display: inline-flex;
        user-select: none;
        vertical-align: bottom;
        width: dt('checkbox.width');
        height: dt('checkbox.height');
    }

    .p-checkbox-input {
        cursor: pointer;
        appearance: none;
        position: absolute;
        inset-block-start: 0;
        inset-inline-start: 0;
        width: 100%;
        height: 100%;
        padding: 0;
        margin: 0;
        opacity: 0;
        z-index: 1;
        outline: 0 none;
        border: 1px solid transparent;
        border-radius: dt('checkbox.border.radius');
    }

    .p-checkbox-box {
        display: flex;
        justify-content: center;
        align-items: center;
        border-radius: dt('checkbox.border.radius');
        border: 1px solid dt('checkbox.border.color');
        background: dt('checkbox.background');
        width: dt('checkbox.width');
        height: dt('checkbox.height');
        transition:
            background dt('checkbox.transition.duration'),
            color dt('checkbox.transition.duration'),
            border-color dt('checkbox.transition.duration'),
            box-shadow dt('checkbox.transition.duration'),
            outline-color dt('checkbox.transition.duration');
        outline-color: transparent;
        box-shadow: dt('checkbox.shadow');
    }

    .p-checkbox-icon {
        transition-duration: dt('checkbox.transition.duration');
        color: dt('checkbox.icon.color');
        font-size: dt('checkbox.icon.size');
        width: dt('checkbox.icon.size');
        height: dt('checkbox.icon.size');
    }

    .p-checkbox:not(.p-disabled):has(.p-checkbox-input:hover) .p-checkbox-box {
        border-color: dt('checkbox.hover.border.color');
    }

    .p-checkbox-checked .p-checkbox-box {
        border-color: dt('checkbox.checked.border.color');
        background: dt('checkbox.checked.background');
    }

    .p-checkbox-checked .p-checkbox-icon {
        color: dt('checkbox.icon.checked.color');
    }

    .p-checkbox-checked:not(.p-disabled):has(.p-checkbox-input:hover) .p-checkbox-box {
        background: dt('checkbox.checked.hover.background');
        border-color: dt('checkbox.checked.hover.border.color');
    }

    .p-checkbox-checked:not(.p-disabled):has(.p-checkbox-input:hover) .p-checkbox-icon {
        color: dt('checkbox.icon.checked.hover.color');
    }

    .p-checkbox:not(.p-disabled):has(.p-checkbox-input:focus-visible) .p-checkbox-box {
        border-color: dt('checkbox.focus.border.color');
        box-shadow: dt('checkbox.focus.ring.shadow');
        outline: dt('checkbox.focus.ring.width') dt('checkbox.focus.ring.style') dt('checkbox.focus.ring.color');
        outline-offset: dt('checkbox.focus.ring.offset');
    }

    .p-checkbox-checked:not(.p-disabled):has(.p-checkbox-input:focus-visible) .p-checkbox-box {
        border-color: dt('checkbox.checked.focus.border.color');
    }

    .p-checkbox.p-invalid > .p-checkbox-box {
        border-color: dt('checkbox.invalid.border.color');
    }

    .p-checkbox.p-variant-filled .p-checkbox-box {
        background: dt('checkbox.filled.background');
    }

    .p-checkbox-checked.p-variant-filled .p-checkbox-box {
        background: dt('checkbox.checked.background');
    }

    .p-checkbox-checked.p-variant-filled:not(.p-disabled):has(.p-checkbox-input:hover) .p-checkbox-box {
        background: dt('checkbox.checked.hover.background');
    }

    .p-checkbox.p-disabled {
        opacity: 1;
    }

    .p-checkbox.p-disabled .p-checkbox-box {
        background: dt('checkbox.disabled.background');
        border-color: dt('checkbox.checked.disabled.border.color');
    }

    .p-checkbox.p-disabled .p-checkbox-box .p-checkbox-icon {
        color: dt('checkbox.icon.disabled.color');
    }

    .p-checkbox-sm,
    .p-checkbox-sm .p-checkbox-box {
        width: dt('checkbox.sm.width');
        height: dt('checkbox.sm.height');
    }

    .p-checkbox-sm .p-checkbox-icon {
        font-size: dt('checkbox.icon.sm.size');
        width: dt('checkbox.icon.sm.size');
        height: dt('checkbox.icon.sm.size');
    }

    .p-checkbox-lg,
    .p-checkbox-lg .p-checkbox-box {
        width: dt('checkbox.lg.width');
        height: dt('checkbox.lg.height');
    }

    .p-checkbox-lg .p-checkbox-icon {
        font-size: dt('checkbox.icon.lg.size');
        width: dt('checkbox.icon.lg.size');
        height: dt('checkbox.icon.lg.size');
    }
`, yu = {
  root: function(e) {
    var n = e.instance, r = e.props;
    return ["p-checkbox p-component", {
      "p-checkbox-checked": n.checked,
      "p-disabled": r.disabled,
      "p-invalid": n.$pcCheckboxGroup ? n.$pcCheckboxGroup.$invalid : n.$invalid,
      "p-variant-filled": n.$variant === "filled",
      "p-checkbox-sm p-inputfield-sm": r.size === "small",
      "p-checkbox-lg p-inputfield-lg": r.size === "large"
    }];
  },
  box: "p-checkbox-box",
  input: "p-checkbox-input",
  icon: "p-checkbox-icon"
}, xu = M.extend({
  name: "checkbox",
  style: vu,
  classes: yu
}), wu = {
  name: "BaseCheckbox",
  extends: _t,
  props: {
    value: null,
    binary: Boolean,
    indeterminate: {
      type: Boolean,
      default: !1
    },
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
    required: {
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
  style: xu,
  provide: function() {
    return {
      $pcCheckbox: this,
      $parentInstance: this
    };
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
function ku(t, e, n) {
  return (e = Su(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function Su(t) {
  var e = $u(t, "string");
  return yt(e) == "symbol" ? e : e + "";
}
function $u(t, e) {
  if (yt(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(t, e);
    if (yt(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
function Cu(t) {
  return Tu(t) || _u(t) || Iu(t) || Ou();
}
function Ou() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Iu(t, e) {
  if (t) {
    if (typeof t == "string") return fn(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? fn(t, e) : void 0;
  }
}
function _u(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function Tu(t) {
  if (Array.isArray(t)) return fn(t);
}
function fn(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, r = Array(e); n < e; n++) r[n] = t[n];
  return r;
}
var uo = {
  name: "Checkbox",
  extends: wu,
  inheritAttrs: !1,
  emits: ["change", "focus", "blur", "update:indeterminate"],
  inject: {
    $pcCheckboxGroup: {
      default: void 0
    }
  },
  data: function() {
    return {
      d_indeterminate: this.indeterminate
    };
  },
  watch: {
    indeterminate: function(e) {
      this.d_indeterminate = e, this.updateIndeterminate();
    }
  },
  mounted: function() {
    this.updateIndeterminate();
  },
  updated: function() {
    this.updateIndeterminate();
  },
  methods: {
    getPTOptions: function(e) {
      var n = e === "root" ? this.ptmi : this.ptm;
      return n(e, {
        context: {
          checked: this.checked,
          indeterminate: this.d_indeterminate,
          disabled: this.disabled
        }
      });
    },
    onChange: function(e) {
      var n = this;
      if (!this.disabled && !this.readonly) {
        var r = this.$pcCheckboxGroup ? this.$pcCheckboxGroup.d_value : this.d_value, i;
        this.binary ? i = this.d_indeterminate ? this.trueValue : this.checked ? this.falseValue : this.trueValue : this.checked || this.d_indeterminate ? i = r.filter(function(o) {
          return !Ot(o, n.value);
        }) : i = r ? [].concat(Cu(r), [this.value]) : [this.value], this.d_indeterminate && (this.d_indeterminate = !1, this.$emit("update:indeterminate", this.d_indeterminate)), this.$pcCheckboxGroup ? this.$pcCheckboxGroup.writeValue(i, e) : this.writeValue(i, e), this.$emit("change", e);
      }
    },
    onFocus: function(e) {
      this.$emit("focus", e);
    },
    onBlur: function(e) {
      var n, r;
      this.$emit("blur", e), (n = (r = this.formField).onBlur) === null || n === void 0 || n.call(r, e);
    },
    updateIndeterminate: function() {
      this.$refs.input && (this.$refs.input.indeterminate = this.d_indeterminate);
    }
  },
  computed: {
    groupName: function() {
      return this.$pcCheckboxGroup ? this.$pcCheckboxGroup.groupName : this.$formName;
    },
    checked: function() {
      var e = this.$pcCheckboxGroup ? this.$pcCheckboxGroup.d_value : this.d_value;
      return this.d_indeterminate ? !1 : this.binary ? e === this.trueValue : Ii(this.value, e);
    },
    dataP: function() {
      return ae(ku({
        invalid: this.$invalid,
        checked: this.checked,
        disabled: this.disabled,
        filled: this.$variant === "filled"
      }, this.size, this.size));
    }
  },
  components: {
    CheckIcon: zn,
    MinusIcon: lo
  }
}, Pu = ["data-p-checked", "data-p-indeterminate", "data-p-disabled", "data-p"], Lu = ["id", "value", "name", "checked", "tabindex", "disabled", "readonly", "required", "aria-labelledby", "aria-label", "aria-invalid"], Au = ["data-p"];
function zu(t, e, n, r, i, o) {
  var a = re("CheckIcon"), s = re("MinusIcon");
  return h(), b("div", v({
    class: t.cx("root")
  }, o.getPTOptions("root"), {
    "data-p-checked": o.checked,
    "data-p-indeterminate": i.d_indeterminate || void 0,
    "data-p-disabled": t.disabled,
    "data-p": o.dataP
  }), [C("input", v({
    ref: "input",
    id: t.inputId,
    type: "checkbox",
    class: [t.cx("input"), t.inputClass],
    style: t.inputStyle,
    value: t.value,
    name: o.groupName,
    checked: o.checked,
    tabindex: t.tabindex,
    disabled: t.disabled,
    readonly: t.readonly,
    required: t.required,
    "aria-labelledby": t.ariaLabelledby,
    "aria-label": t.ariaLabel,
    "aria-invalid": t.invalid || void 0,
    onFocus: e[0] || (e[0] = function() {
      return o.onFocus && o.onFocus.apply(o, arguments);
    }),
    onBlur: e[1] || (e[1] = function() {
      return o.onBlur && o.onBlur.apply(o, arguments);
    }),
    onChange: e[2] || (e[2] = function() {
      return o.onChange && o.onChange.apply(o, arguments);
    })
  }, o.getPTOptions("input")), null, 16, Lu), C("div", v({
    class: t.cx("box")
  }, o.getPTOptions("box"), {
    "data-p": o.dataP
  }), [A(t.$slots, "icon", {
    checked: o.checked,
    indeterminate: i.d_indeterminate,
    class: ne(t.cx("icon")),
    dataP: o.dataP
  }, function() {
    return [o.checked ? (h(), K(a, v({
      key: 0,
      class: t.cx("icon")
    }, o.getPTOptions("icon"), {
      "data-p": o.dataP
    }), null, 16, ["class", "data-p"])) : i.d_indeterminate ? (h(), K(s, v({
      key: 1,
      class: t.cx("icon")
    }, o.getPTOptions("icon"), {
      "data-p": o.dataP
    }), null, 16, ["class", "data-p"])) : L("", !0)];
  })], 16, Au)], 16, Pu);
}
uo.render = zu;
var co = {
  name: "AngleDownIcon",
  extends: xe
};
function Eu(t) {
  return Du(t) || Vu(t) || ju(t) || Bu();
}
function Bu() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function ju(t, e) {
  if (t) {
    if (typeof t == "string") return hn(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? hn(t, e) : void 0;
  }
}
function Vu(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function Du(t) {
  if (Array.isArray(t)) return hn(t);
}
function hn(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, r = Array(e); n < e; n++) r[n] = t[n];
  return r;
}
function Mu(t, e, n, r, i, o) {
  return h(), b("svg", v({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, t.pti()), Eu(e[0] || (e[0] = [C("path", {
    d: "M3.58659 4.5007C3.68513 4.50023 3.78277 4.51945 3.87379 4.55723C3.9648 4.59501 4.04735 4.65058 4.11659 4.7207L7.11659 7.7207L10.1166 4.7207C10.2619 4.65055 10.4259 4.62911 10.5843 4.65956C10.7427 4.69002 10.8871 4.77074 10.996 4.88976C11.1049 5.00877 11.1726 5.15973 11.1889 5.32022C11.2052 5.48072 11.1693 5.6422 11.0866 5.7807L7.58659 9.2807C7.44597 9.42115 7.25534 9.50004 7.05659 9.50004C6.85784 9.50004 6.66722 9.42115 6.52659 9.2807L3.02659 5.7807C2.88614 5.64007 2.80725 5.44945 2.80725 5.2507C2.80725 5.05195 2.88614 4.86132 3.02659 4.7207C3.09932 4.64685 3.18675 4.58911 3.28322 4.55121C3.37969 4.51331 3.48305 4.4961 3.58659 4.5007Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
co.render = Mu;
var po = {
  name: "AngleUpIcon",
  extends: xe
};
function Nu(t) {
  return Uu(t) || Ku(t) || Ru(t) || Fu();
}
function Fu() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Ru(t, e) {
  if (t) {
    if (typeof t == "string") return mn(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? mn(t, e) : void 0;
  }
}
function Ku(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function Uu(t) {
  if (Array.isArray(t)) return mn(t);
}
function mn(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, r = Array(e); n < e; n++) r[n] = t[n];
  return r;
}
function Hu(t, e, n, r, i, o) {
  return h(), b("svg", v({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, t.pti()), Nu(e[0] || (e[0] = [C("path", {
    d: "M10.4134 9.49931C10.3148 9.49977 10.2172 9.48055 10.1262 9.44278C10.0352 9.405 9.95263 9.34942 9.88338 9.27931L6.88338 6.27931L3.88338 9.27931C3.73811 9.34946 3.57409 9.3709 3.41567 9.34044C3.25724 9.30999 3.11286 9.22926 3.00395 9.11025C2.89504 8.99124 2.82741 8.84028 2.8111 8.67978C2.79478 8.51928 2.83065 8.35781 2.91338 8.21931L6.41338 4.71931C6.55401 4.57886 6.74463 4.49997 6.94338 4.49997C7.14213 4.49997 7.33276 4.57886 7.47338 4.71931L10.9734 8.21931C11.1138 8.35994 11.1927 8.55056 11.1927 8.74931C11.1927 8.94806 11.1138 9.13868 10.9734 9.27931C10.9007 9.35315 10.8132 9.41089 10.7168 9.44879C10.6203 9.48669 10.5169 9.5039 10.4134 9.49931Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
po.render = Hu;
var Wu = `
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
`, Gu = {
  root: function(e) {
    var n = e.instance, r = e.props;
    return ["p-inputtext p-component", {
      "p-filled": n.$filled,
      "p-inputtext-sm p-inputfield-sm": r.size === "small",
      "p-inputtext-lg p-inputfield-lg": r.size === "large",
      "p-invalid": n.$invalid,
      "p-variant-filled": n.$variant === "filled",
      "p-inputtext-fluid": n.$fluid
    }];
  }
}, qu = M.extend({
  name: "inputtext",
  style: Wu,
  classes: Gu
}), Yu = {
  name: "BaseInputText",
  extends: _t,
  style: qu,
  provide: function() {
    return {
      $pcInputText: this,
      $parentInstance: this
    };
  }
};
function xt(t) {
  "@babel/helpers - typeof";
  return xt = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, xt(t);
}
function Zu(t, e, n) {
  return (e = Ju(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function Ju(t) {
  var e = Qu(t, "string");
  return xt(e) == "symbol" ? e : e + "";
}
function Qu(t, e) {
  if (xt(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(t, e);
    if (xt(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var Ut = {
  name: "InputText",
  extends: Yu,
  inheritAttrs: !1,
  methods: {
    onInput: function(e) {
      this.writeValue(e.target.value, e);
    }
  },
  computed: {
    attrs: function() {
      return v(this.ptmi("root", {
        context: {
          filled: this.$filled,
          disabled: this.disabled
        }
      }), this.formField);
    },
    dataP: function() {
      return ae(Zu({
        invalid: this.$invalid,
        fluid: this.$fluid,
        filled: this.$variant === "filled"
      }, this.size, this.size));
    }
  }
}, Xu = ["value", "name", "disabled", "aria-invalid", "data-p"];
function ed(t, e, n, r, i, o) {
  return h(), b("input", v({
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
  }, o.attrs), null, 16, Xu);
}
Ut.render = ed;
var td = `
    .p-inputnumber {
        display: inline-flex;
        position: relative;
    }

    .p-inputnumber-button {
        display: flex;
        align-items: center;
        justify-content: center;
        flex: 0 0 auto;
        cursor: pointer;
        background: dt('inputnumber.button.background');
        color: dt('inputnumber.button.color');
        width: dt('inputnumber.button.width');
        transition:
            background dt('inputnumber.transition.duration'),
            color dt('inputnumber.transition.duration'),
            border-color dt('inputnumber.transition.duration'),
            outline-color dt('inputnumber.transition.duration');
    }

    .p-inputnumber-button:disabled {
        cursor: auto;
    }

    .p-inputnumber-button:not(:disabled):hover {
        background: dt('inputnumber.button.hover.background');
        color: dt('inputnumber.button.hover.color');
    }

    .p-inputnumber-button:not(:disabled):active {
        background: dt('inputnumber.button.active.background');
        color: dt('inputnumber.button.active.color');
    }

    .p-inputnumber-stacked .p-inputnumber-button {
        position: relative;
        flex: 1 1 auto;
        border: 0 none;
    }

    .p-inputnumber-stacked .p-inputnumber-button-group {
        display: flex;
        flex-direction: column;
        position: absolute;
        inset-block-start: 1px;
        inset-inline-end: 1px;
        height: calc(100% - 2px);
        z-index: 1;
    }

    .p-inputnumber-stacked .p-inputnumber-increment-button {
        padding: 0;
        border-start-end-radius: calc(dt('inputnumber.button.border.radius') - 1px);
    }

    .p-inputnumber-stacked .p-inputnumber-decrement-button {
        padding: 0;
        border-end-end-radius: calc(dt('inputnumber.button.border.radius') - 1px);
    }

    .p-inputnumber-stacked .p-inputnumber-input {
        padding-inline-end: calc(dt('inputnumber.button.width') + dt('form.field.padding.x'));
    }

    .p-inputnumber-horizontal .p-inputnumber-button {
        border: 1px solid dt('inputnumber.button.border.color');
    }

    .p-inputnumber-horizontal .p-inputnumber-button:hover {
        border-color: dt('inputnumber.button.hover.border.color');
    }

    .p-inputnumber-horizontal .p-inputnumber-button:active {
        border-color: dt('inputnumber.button.active.border.color');
    }

    .p-inputnumber-horizontal .p-inputnumber-increment-button {
        order: 3;
        border-start-end-radius: dt('inputnumber.button.border.radius');
        border-end-end-radius: dt('inputnumber.button.border.radius');
        border-inline-start: 0 none;
    }

    .p-inputnumber-horizontal .p-inputnumber-input {
        order: 2;
        border-radius: 0;
    }

    .p-inputnumber-horizontal .p-inputnumber-decrement-button {
        order: 1;
        border-start-start-radius: dt('inputnumber.button.border.radius');
        border-end-start-radius: dt('inputnumber.button.border.radius');
        border-inline-end: 0 none;
    }

    .p-floatlabel:has(.p-inputnumber-horizontal) label {
        margin-inline-start: dt('inputnumber.button.width');
    }

    .p-inputnumber-vertical {
        flex-direction: column;
    }

    .p-inputnumber-vertical .p-inputnumber-button {
        border: 1px solid dt('inputnumber.button.border.color');
        padding: dt('inputnumber.button.vertical.padding');
    }

    .p-inputnumber-vertical .p-inputnumber-button:hover {
        border-color: dt('inputnumber.button.hover.border.color');
    }

    .p-inputnumber-vertical .p-inputnumber-button:active {
        border-color: dt('inputnumber.button.active.border.color');
    }

    .p-inputnumber-vertical .p-inputnumber-increment-button {
        order: 1;
        border-start-start-radius: dt('inputnumber.button.border.radius');
        border-start-end-radius: dt('inputnumber.button.border.radius');
        width: 100%;
        border-block-end: 0 none;
    }

    .p-inputnumber-vertical .p-inputnumber-input {
        order: 2;
        border-radius: 0;
        text-align: center;
    }

    .p-inputnumber-vertical .p-inputnumber-decrement-button {
        order: 3;
        border-end-start-radius: dt('inputnumber.button.border.radius');
        border-end-end-radius: dt('inputnumber.button.border.radius');
        width: 100%;
        border-block-start: 0 none;
    }

    .p-inputnumber-input {
        flex: 1 1 auto;
    }

    .p-inputnumber-fluid {
        width: 100%;
    }

    .p-inputnumber-fluid .p-inputnumber-input {
        width: 1%;
    }

    .p-inputnumber-fluid.p-inputnumber-vertical .p-inputnumber-input {
        width: 100%;
    }

    .p-inputnumber:has(.p-inputtext-sm) .p-inputnumber-button .p-icon {
        font-size: dt('form.field.sm.font.size');
        width: dt('form.field.sm.font.size');
        height: dt('form.field.sm.font.size');
    }

    .p-inputnumber:has(.p-inputtext-lg) .p-inputnumber-button .p-icon {
        font-size: dt('form.field.lg.font.size');
        width: dt('form.field.lg.font.size');
        height: dt('form.field.lg.font.size');
    }

    .p-inputnumber-clear-icon {
        position: absolute;
        top: 50%;
        margin-top: -0.5rem;
        cursor: pointer;
        inset-inline-end: dt('form.field.padding.x');
        color: dt('form.field.icon.color');
    }

    .p-inputnumber:has(.p-inputnumber-clear-icon) .p-inputnumber-input {
        padding-inline-end: calc((dt('form.field.padding.x') * 2) + dt('icon.size'));
    }

    .p-inputnumber-stacked .p-inputnumber-clear-icon {
        inset-inline-end: calc(dt('inputnumber.button.width') + dt('form.field.padding.x'));
    }

    .p-inputnumber-stacked:has(.p-inputnumber-clear-icon) .p-inputnumber-input {
        padding-inline-end: calc(dt('inputnumber.button.width') + (dt('form.field.padding.x') * 2) + dt('icon.size'));
    }

    .p-inputnumber-horizontal .p-inputnumber-clear-icon {
        inset-inline-end: calc(dt('inputnumber.button.width') + dt('form.field.padding.x'));
    }
`, nd = {
  root: function(e) {
    var n = e.instance, r = e.props;
    return ["p-inputnumber p-component p-inputwrapper", {
      "p-invalid": n.$invalid,
      "p-inputwrapper-filled": n.$filled || r.allowEmpty === !1,
      "p-inputwrapper-focus": n.focused,
      "p-inputnumber-stacked": r.showButtons && r.buttonLayout === "stacked",
      "p-inputnumber-horizontal": r.showButtons && r.buttonLayout === "horizontal",
      "p-inputnumber-vertical": r.showButtons && r.buttonLayout === "vertical",
      "p-inputnumber-fluid": n.$fluid
    }];
  },
  pcInputText: "p-inputnumber-input",
  clearIcon: "p-inputnumber-clear-icon",
  buttonGroup: "p-inputnumber-button-group",
  incrementButton: function(e) {
    var n = e.instance, r = e.props;
    return ["p-inputnumber-button p-inputnumber-increment-button", {
      "p-disabled": r.showButtons && r.max !== null && n.maxBoundry()
    }];
  },
  decrementButton: function(e) {
    var n = e.instance, r = e.props;
    return ["p-inputnumber-button p-inputnumber-decrement-button", {
      "p-disabled": r.showButtons && r.min !== null && n.minBoundry()
    }];
  }
}, rd = M.extend({
  name: "inputnumber",
  style: td,
  classes: nd
}), od = {
  name: "BaseInputNumber",
  extends: _t,
  props: {
    format: {
      type: Boolean,
      default: !0
    },
    showButtons: {
      type: Boolean,
      default: !1
    },
    buttonLayout: {
      type: String,
      default: "stacked"
    },
    incrementButtonClass: {
      type: String,
      default: null
    },
    decrementButtonClass: {
      type: String,
      default: null
    },
    incrementButtonIcon: {
      type: String,
      default: void 0
    },
    incrementIcon: {
      type: String,
      default: void 0
    },
    decrementButtonIcon: {
      type: String,
      default: void 0
    },
    decrementIcon: {
      type: String,
      default: void 0
    },
    locale: {
      type: String,
      default: void 0
    },
    localeMatcher: {
      type: String,
      default: void 0
    },
    mode: {
      type: String,
      default: "decimal"
    },
    prefix: {
      type: String,
      default: null
    },
    suffix: {
      type: String,
      default: null
    },
    currency: {
      type: String,
      default: void 0
    },
    currencyDisplay: {
      type: String,
      default: void 0
    },
    useGrouping: {
      type: Boolean,
      default: !0
    },
    minFractionDigits: {
      type: Number,
      default: void 0
    },
    maxFractionDigits: {
      type: Number,
      default: void 0
    },
    roundingMode: {
      type: String,
      default: "halfExpand",
      validator: function(e) {
        return ["ceil", "floor", "expand", "trunc", "halfCeil", "halfFloor", "halfExpand", "halfTrunc", "halfEven"].includes(e);
      }
    },
    min: {
      type: Number,
      default: null
    },
    max: {
      type: Number,
      default: null
    },
    step: {
      type: Number,
      default: 1
    },
    allowEmpty: {
      type: Boolean,
      default: !0
    },
    highlightOnFocus: {
      type: Boolean,
      default: !1
    },
    showClear: {
      type: Boolean,
      default: !1
    },
    readonly: {
      type: Boolean,
      default: !1
    },
    placeholder: {
      type: String,
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
    },
    required: {
      type: Boolean,
      default: !1
    }
  },
  style: rd,
  provide: function() {
    return {
      $pcInputNumber: this,
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
function vr(t, e) {
  var n = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(t);
    e && (r = r.filter(function(i) {
      return Object.getOwnPropertyDescriptor(t, i).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function yr(t) {
  for (var e = 1; e < arguments.length; e++) {
    var n = arguments[e] != null ? arguments[e] : {};
    e % 2 ? vr(Object(n), !0).forEach(function(r) {
      bn(t, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(n)) : vr(Object(n)).forEach(function(r) {
      Object.defineProperty(t, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return t;
}
function bn(t, e, n) {
  return (e = id(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function id(t) {
  var e = ad(t, "string");
  return wt(e) == "symbol" ? e : e + "";
}
function ad(t, e) {
  if (wt(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(t, e);
    if (wt(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
function sd(t) {
  return cd(t) || dd(t) || ud(t) || ld();
}
function ld() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function ud(t, e) {
  if (t) {
    if (typeof t == "string") return gn(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? gn(t, e) : void 0;
  }
}
function dd(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function cd(t) {
  if (Array.isArray(t)) return gn(t);
}
function gn(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, r = Array(e); n < e; n++) r[n] = t[n];
  return r;
}
var fo = {
  name: "InputNumber",
  extends: od,
  inheritAttrs: !1,
  emits: ["input", "focus", "blur"],
  inject: {
    $pcFluid: {
      default: null
    }
  },
  numberFormat: null,
  _numeral: null,
  _decimal: null,
  _group: null,
  _minusSign: null,
  _currency: null,
  _suffix: null,
  _prefix: null,
  _index: null,
  groupChar: "",
  isSpecialChar: null,
  prefixChar: null,
  suffixChar: null,
  timer: null,
  data: function() {
    return {
      // @deprecated
      d_modelValue: this.d_value,
      focused: !1
    };
  },
  watch: {
    d_value: {
      immediate: !0,
      handler: function(e) {
        var n;
        this.d_modelValue = e, (n = this.$refs.clearIcon) !== null && n !== void 0 && (n = n.$el) !== null && n !== void 0 && n.style && (this.$refs.clearIcon.$el.style.display = Le(e) ? "none" : "block");
      }
    },
    locale: function(e, n) {
      this.updateConstructParser(e, n);
    },
    localeMatcher: function(e, n) {
      this.updateConstructParser(e, n);
    },
    mode: function(e, n) {
      this.updateConstructParser(e, n);
    },
    currency: function(e, n) {
      this.updateConstructParser(e, n);
    },
    currencyDisplay: function(e, n) {
      this.updateConstructParser(e, n);
    },
    useGrouping: function(e, n) {
      this.updateConstructParser(e, n);
    },
    minFractionDigits: function(e, n) {
      this.updateConstructParser(e, n);
    },
    maxFractionDigits: function(e, n) {
      this.updateConstructParser(e, n);
    },
    suffix: function(e, n) {
      this.updateConstructParser(e, n);
    },
    prefix: function(e, n) {
      this.updateConstructParser(e, n);
    }
  },
  created: function() {
    this.constructParser();
  },
  mounted: function() {
    var e;
    (e = this.$refs.clearIcon) !== null && e !== void 0 && (e = e.$el) !== null && e !== void 0 && e.style && (this.$refs.clearIcon.$el.style.display = this.$filled ? "block" : "none");
  },
  methods: {
    getOptions: function() {
      return {
        localeMatcher: this.localeMatcher,
        style: this.mode,
        currency: this.currency,
        currencyDisplay: this.currencyDisplay,
        useGrouping: this.useGrouping,
        minimumFractionDigits: this.minFractionDigits,
        maximumFractionDigits: this.maxFractionDigits,
        roundingMode: this.roundingMode
      };
    },
    constructParser: function() {
      this.numberFormat = new Intl.NumberFormat(this.locale, this.getOptions());
      var e = sd(new Intl.NumberFormat(this.locale, {
        useGrouping: !1
      }).format(9876543210)).reverse(), n = new Map(e.map(function(r, i) {
        return [r, i];
      }));
      this._numeral = new RegExp("[".concat(e.join(""), "]"), "g"), this._group = this.getGroupingExpression(), this._minusSign = this.getMinusSignExpression(), this._currency = this.getCurrencyExpression(), this._decimal = this.getDecimalExpression(), this._suffix = this.getSuffixExpression(), this._prefix = this.getPrefixExpression(), this._index = function(r) {
        return n.get(r);
      };
    },
    updateConstructParser: function(e, n) {
      e !== n && this.constructParser();
    },
    escapeRegExp: function(e) {
      return e.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
    },
    getDecimalExpression: function() {
      var e = new Intl.NumberFormat(this.locale, yr(yr({}, this.getOptions()), {}, {
        useGrouping: !1
      })), n = e.format(1.1);
      return n === e.format(1) ? new RegExp("[]", "g") : new RegExp("[".concat(n.replace(this._currency, "").trim().replace(this._numeral, ""), "]"), "g");
    },
    getGroupingExpression: function() {
      var e = new Intl.NumberFormat(this.locale, {
        useGrouping: !0
      });
      return this.groupChar = e.format(1e6).trim().replace(this._numeral, "").charAt(0), new RegExp("[".concat(this.groupChar, "]"), "g");
    },
    getMinusSignExpression: function() {
      var e = new Intl.NumberFormat(this.locale, {
        useGrouping: !1
      });
      return new RegExp("[".concat(e.format(-1).trim().replace(this._numeral, ""), "]"), "g");
    },
    getCurrencyExpression: function() {
      if (this.currency) {
        var e = new Intl.NumberFormat(this.locale, {
          style: "currency",
          currency: this.currency,
          currencyDisplay: this.currencyDisplay,
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
          roundingMode: this.roundingMode
        });
        return new RegExp("[".concat(e.format(1).replace(/\s/g, "").replace(this._numeral, "").replace(this._group, ""), "]"), "g");
      }
      return new RegExp("[]", "g");
    },
    getPrefixExpression: function() {
      if (this.prefix)
        this.prefixChar = this.prefix;
      else {
        var e = new Intl.NumberFormat(this.locale, {
          style: this.mode,
          currency: this.currency,
          currencyDisplay: this.currencyDisplay
        });
        this.prefixChar = e.format(1).split("1")[0];
      }
      return new RegExp("".concat(this.escapeRegExp(this.prefixChar || "")), "g");
    },
    getSuffixExpression: function() {
      if (this.suffix)
        this.suffixChar = this.suffix;
      else {
        var e = new Intl.NumberFormat(this.locale, {
          style: this.mode,
          currency: this.currency,
          currencyDisplay: this.currencyDisplay,
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
          roundingMode: this.roundingMode
        });
        this.suffixChar = e.format(1).split("1")[1];
      }
      return new RegExp("".concat(this.escapeRegExp(this.suffixChar || "")), "g");
    },
    formatValue: function(e) {
      if (e != null) {
        if (e === "-")
          return e;
        if (this.format) {
          var n = new Intl.NumberFormat(this.locale, this.getOptions()), r = n.format(e);
          return this.prefix && (r = this.prefix + r), this.suffix && (r = r + this.suffix), r;
        }
        return e.toString();
      }
      return "";
    },
    parseValue: function(e) {
      var n = e.replace(this._suffix, "").replace(this._prefix, "").trim().replace(/\s/g, "").replace(this._currency, "").replace(this._group, "").replace(this._minusSign, "-").replace(this._decimal, ".").replace(this._numeral, this._index);
      if (n) {
        if (n === "-")
          return n;
        var r = +n;
        return isNaN(r) ? null : r;
      }
      return null;
    },
    repeat: function(e, n, r) {
      var i = this;
      if (!this.readonly) {
        var o = n || 500;
        this.clearTimer(), this.timer = setTimeout(function() {
          i.repeat(e, 40, r);
        }, o), this.spin(e, r);
      }
    },
    addWithPrecision: function(e, n) {
      var r = e.toString(), i = n.toString(), o = r.includes(".") ? r.split(".")[1].length : 0, a = i.includes(".") ? i.split(".")[1].length : 0, s = Math.max(o, a), l = Math.pow(10, s);
      return Math.round((e + n) * l) / l;
    },
    spin: function(e, n) {
      if (this.$refs.input) {
        var r = this.step * n, i = this.parseValue(this.$refs.input.$el.value) || 0, o = this.validateValue(this.addWithPrecision(i, r));
        this.updateInput(o, null, "spin"), this.updateModel(e, o), this.handleOnInput(e, i, o);
      }
    },
    onUpButtonMouseDown: function(e) {
      this.disabled || (this.$refs.input.$el.focus(), this.repeat(e, null, 1), e.preventDefault());
    },
    onUpButtonMouseUp: function() {
      this.disabled || this.clearTimer();
    },
    onUpButtonMouseLeave: function() {
      this.disabled || this.clearTimer();
    },
    onUpButtonKeyUp: function() {
      this.disabled || this.clearTimer();
    },
    onUpButtonKeyDown: function(e) {
      (e.code === "Space" || e.code === "Enter" || e.code === "NumpadEnter") && this.repeat(e, null, 1);
    },
    onDownButtonMouseDown: function(e) {
      this.disabled || (this.$refs.input.$el.focus(), this.repeat(e, null, -1), e.preventDefault());
    },
    onDownButtonMouseUp: function() {
      this.disabled || this.clearTimer();
    },
    onDownButtonMouseLeave: function() {
      this.disabled || this.clearTimer();
    },
    onDownButtonKeyUp: function() {
      this.disabled || this.clearTimer();
    },
    onDownButtonKeyDown: function(e) {
      (e.code === "Space" || e.code === "Enter" || e.code === "NumpadEnter") && this.repeat(e, null, -1);
    },
    onUserInput: function() {
      this.isSpecialChar && (this.$refs.input.$el.value = this.lastValue), this.isSpecialChar = !1;
    },
    onInputKeyDown: function(e) {
      if (!this.readonly && !e.isComposing) {
        if (e.altKey || e.ctrlKey || e.metaKey) {
          this.isSpecialChar = !0, this.lastValue = this.$refs.input.$el.value;
          return;
        }
        this.lastValue = e.target.value;
        var n = e.target.selectionStart, r = e.target.selectionEnd, i = r - n, o = e.target.value, a = null, s = e.code || e.key;
        switch (s) {
          case "ArrowUp":
            this.spin(e, 1), e.preventDefault();
            break;
          case "ArrowDown":
            this.spin(e, -1), e.preventDefault();
            break;
          case "ArrowLeft":
            if (i > 1) {
              var l = this.isNumeralChar(o.charAt(n)) ? n + 1 : n + 2;
              this.$refs.input.$el.setSelectionRange(l, l);
            } else this.isNumeralChar(o.charAt(n - 1)) || e.preventDefault();
            break;
          case "ArrowRight":
            if (i > 1) {
              var u = r - 1;
              this.$refs.input.$el.setSelectionRange(u, u);
            } else this.isNumeralChar(o.charAt(n)) || e.preventDefault();
            break;
          case "Tab":
          case "Enter":
          case "NumpadEnter":
            a = this.validateValue(this.parseValue(o)), this.$refs.input.$el.value = this.formatValue(a), this.$refs.input.$el.setAttribute("aria-valuenow", a), this.updateModel(e, a);
            break;
          case "Backspace": {
            if (e.preventDefault(), n === r) {
              n >= o.length && this.suffixChar !== null && (n = o.length - this.suffixChar.length, this.$refs.input.$el.setSelectionRange(n, n));
              var d = o.charAt(n - 1), c = this.getDecimalCharIndexes(o), p = c.decimalCharIndex, f = c.decimalCharIndexWithoutPrefix;
              if (this.isNumeralChar(d)) {
                var m = this.getDecimalLength(o);
                if (this._group.test(d))
                  this._group.lastIndex = 0, a = o.slice(0, n - 2) + o.slice(n - 1);
                else if (this._decimal.test(d))
                  this._decimal.lastIndex = 0, m ? this.$refs.input.$el.setSelectionRange(n - 1, n - 1) : a = o.slice(0, n - 1) + o.slice(n);
                else if (p > 0 && n > p) {
                  var x = this.isDecimalMode() && (this.minFractionDigits || 0) < m ? "" : "0";
                  a = o.slice(0, n - 1) + x + o.slice(n);
                } else f === 1 ? (a = o.slice(0, n - 1) + "0" + o.slice(n), a = this.parseValue(a) > 0 ? a : "") : a = o.slice(0, n - 1) + o.slice(n);
              }
              this.updateValue(e, a, null, "delete-single");
            } else
              a = this.deleteRange(o, n, r), this.updateValue(e, a, null, "delete-range");
            break;
          }
          case "Delete":
            if (e.preventDefault(), n === r) {
              var y = o.charAt(n), w = this.getDecimalCharIndexes(o), O = w.decimalCharIndex, T = w.decimalCharIndexWithoutPrefix;
              if (this.isNumeralChar(y)) {
                var g = this.getDecimalLength(o);
                if (this._group.test(y))
                  this._group.lastIndex = 0, a = o.slice(0, n) + o.slice(n + 2);
                else if (this._decimal.test(y))
                  this._decimal.lastIndex = 0, g ? this.$refs.input.$el.setSelectionRange(n + 1, n + 1) : a = o.slice(0, n) + o.slice(n + 1);
                else if (O > 0 && n > O) {
                  var _ = this.isDecimalMode() && (this.minFractionDigits || 0) < g ? "" : "0";
                  a = o.slice(0, n) + _ + o.slice(n + 1);
                } else T === 1 ? (a = o.slice(0, n) + "0" + o.slice(n + 1), a = this.parseValue(a) > 0 ? a : "") : a = o.slice(0, n) + o.slice(n + 1);
              }
              this.updateValue(e, a, null, "delete-back-single");
            } else
              a = this.deleteRange(o, n, r), this.updateValue(e, a, null, "delete-range");
            break;
          case "Home":
            e.preventDefault(), F(this.min) && this.updateModel(e, this.min);
            break;
          case "End":
            e.preventDefault(), F(this.max) && this.updateModel(e, this.max);
            break;
        }
      }
    },
    onInputKeyPress: function(e) {
      if (!this.readonly) {
        var n = e.key, r = this.isDecimalSign(n), i = this.isMinusSign(n);
        e.code !== "Enter" && e.preventDefault(), (Number(n) >= 0 && Number(n) <= 9 || i || r) && this.insert(e, n, {
          isDecimalSign: r,
          isMinusSign: i
        });
      }
    },
    onPaste: function(e) {
      if (!(this.readonly || this.disabled)) {
        e.preventDefault();
        var n = (e.clipboardData || window.clipboardData).getData("Text");
        if (!(this.inputId === "integeronly" && /[^\d-]/.test(n)) && n) {
          var r = this.parseValue(n);
          r != null && this.insert(e, r.toString());
        }
      }
    },
    onClearClick: function(e) {
      this.updateModel(e, null), this.$refs.input.$el.focus();
    },
    allowMinusSign: function() {
      return this.min === null || this.min < 0;
    },
    isMinusSign: function(e) {
      return this._minusSign.test(e) || e === "-" ? (this._minusSign.lastIndex = 0, !0) : !1;
    },
    isDecimalSign: function(e) {
      var n;
      return (n = this.locale) !== null && n !== void 0 && n.includes("fr") && [".", ","].includes(e) || this._decimal.test(e) ? (this._decimal.lastIndex = 0, !0) : !1;
    },
    isDecimalMode: function() {
      return this.mode === "decimal";
    },
    getDecimalCharIndexes: function(e) {
      var n = e.search(this._decimal);
      this._decimal.lastIndex = 0;
      var r = e.replace(this._prefix, "").trim().replace(/\s/g, "").replace(this._currency, ""), i = r.search(this._decimal);
      return this._decimal.lastIndex = 0, {
        decimalCharIndex: n,
        decimalCharIndexWithoutPrefix: i
      };
    },
    getCharIndexes: function(e) {
      var n = e.search(this._decimal);
      this._decimal.lastIndex = 0;
      var r = e.search(this._minusSign);
      this._minusSign.lastIndex = 0;
      var i = e.search(this._suffix);
      this._suffix.lastIndex = 0;
      var o = e.search(this._currency);
      return this._currency.lastIndex = 0, {
        decimalCharIndex: n,
        minusCharIndex: r,
        suffixCharIndex: i,
        currencyCharIndex: o
      };
    },
    insert: function(e, n) {
      var r = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {
        isDecimalSign: !1,
        isMinusSign: !1
      }, i = n.search(this._minusSign);
      if (this._minusSign.lastIndex = 0, !(!this.allowMinusSign() && i !== -1)) {
        var o = this.$refs.input.$el.selectionStart, a = this.$refs.input.$el.selectionEnd, s = this.$refs.input.$el.value.trim(), l = this.getCharIndexes(s), u = l.decimalCharIndex, d = l.minusCharIndex, c = l.suffixCharIndex, p = l.currencyCharIndex, f;
        if (r.isMinusSign) {
          var m = d === -1;
          (o === 0 || o === p + 1) && (f = s, (m || a !== 0) && (f = this.insertText(s, n, 0, a)), this.updateValue(e, f, n, "insert"));
        } else if (r.isDecimalSign)
          u > 0 && o === u ? this.updateValue(e, s, n, "insert") : u > o && u < a ? (f = this.insertText(s, n, o, a), this.updateValue(e, f, n, "insert")) : u === -1 && this.maxFractionDigits && (f = this.insertText(s, n, o, a), this.updateValue(e, f, n, "insert"));
        else {
          var x = this.numberFormat.resolvedOptions().maximumFractionDigits, y = o !== a ? "range-insert" : "insert";
          if (u > 0 && o > u) {
            if (o + n.length - (u + 1) <= x) {
              var w = p >= o ? p - 1 : c >= o ? c : s.length;
              f = s.slice(0, o) + n + s.slice(o + n.length, w) + s.slice(w), this.updateValue(e, f, n, y);
            }
          } else
            f = this.insertText(s, n, o, a), this.updateValue(e, f, n, y);
        }
      }
    },
    insertText: function(e, n, r, i) {
      var o = n === "." ? n : n.split(".");
      if (o.length === 2) {
        var a = e.slice(r, i).search(this._decimal);
        return this._decimal.lastIndex = 0, a > 0 ? e.slice(0, r) + this.formatValue(n) + e.slice(i) : this.formatValue(n) || e;
      } else return i - r === e.length ? this.formatValue(n) : r === 0 ? n + e.slice(i) : i === e.length ? e.slice(0, r) + n : e.slice(0, r) + n + e.slice(i);
    },
    deleteRange: function(e, n, r) {
      var i;
      return r - n === e.length ? i = "" : n === 0 ? i = e.slice(r) : r === e.length ? i = e.slice(0, n) : i = e.slice(0, n) + e.slice(r), i;
    },
    initCursor: function() {
      var e = this.$refs.input.$el.selectionStart, n = this.$refs.input.$el.value, r = n.length, i = null, o = (this.prefixChar || "").length;
      n = n.replace(this._prefix, ""), e = e - o;
      var a = n.charAt(e);
      if (this.isNumeralChar(a))
        return e + o;
      for (var s = e - 1; s >= 0; )
        if (a = n.charAt(s), this.isNumeralChar(a)) {
          i = s + o;
          break;
        } else
          s--;
      if (i !== null)
        this.$refs.input.$el.setSelectionRange(i + 1, i + 1);
      else {
        for (s = e; s < r; )
          if (a = n.charAt(s), this.isNumeralChar(a)) {
            i = s + o;
            break;
          } else
            s++;
        i !== null && this.$refs.input.$el.setSelectionRange(i, i);
      }
      return i || 0;
    },
    onInputClick: function() {
      var e = this.$refs.input.$el.value;
      !this.readonly && e !== Mn() && this.initCursor();
    },
    isNumeralChar: function(e) {
      return e.length === 1 && (this._numeral.test(e) || this._decimal.test(e) || this._group.test(e) || this._minusSign.test(e)) ? (this.resetRegex(), !0) : !1;
    },
    resetRegex: function() {
      this._numeral.lastIndex = 0, this._decimal.lastIndex = 0, this._group.lastIndex = 0, this._minusSign.lastIndex = 0;
    },
    updateValue: function(e, n, r, i) {
      var o = this.$refs.input.$el.value, a = null;
      n != null && (a = this.parseValue(n), a = !a && !this.allowEmpty ? 0 : a, this.updateInput(a, r, i, n), this.handleOnInput(e, o, a));
    },
    handleOnInput: function(e, n, r) {
      if (this.isValueChanged(n, r)) {
        var i, o;
        this.$emit("input", {
          originalEvent: e,
          value: r,
          formattedValue: n
        }), (i = (o = this.formField).onInput) === null || i === void 0 || i.call(o, {
          originalEvent: e,
          value: r
        });
      }
    },
    isValueChanged: function(e, n) {
      if (n === null && e !== null)
        return !0;
      if (n != null) {
        var r = typeof e == "string" ? this.parseValue(e) : e;
        return n !== r;
      }
      return !1;
    },
    validateValue: function(e) {
      return e === "-" || e == null ? null : this.min != null && e < this.min ? this.min : this.max != null && e > this.max ? this.max : e;
    },
    updateInput: function(e, n, r, i) {
      var o;
      n = n || "";
      var a = this.$refs.input.$el.value, s = this.formatValue(e), l = a.length;
      if (s !== i && (s = this.concatValues(s, i)), l === 0) {
        this.$refs.input.$el.value = s, this.$refs.input.$el.setSelectionRange(0, 0);
        var u = this.initCursor(), d = u + n.length;
        this.$refs.input.$el.setSelectionRange(d, d);
      } else {
        var c = this.$refs.input.$el.selectionStart, p = this.$refs.input.$el.selectionEnd;
        this.$refs.input.$el.value = s;
        var f = s.length;
        if (r === "range-insert") {
          var m = this.parseValue((a || "").slice(0, c)), x = m !== null ? m.toString() : "", y = x.split("").join("(".concat(this.groupChar, ")?")), w = new RegExp(y, "g");
          w.test(s);
          var O = n.split("").join("(".concat(this.groupChar, ")?")), T = new RegExp(O, "g");
          T.test(s.slice(w.lastIndex)), p = w.lastIndex + T.lastIndex, this.$refs.input.$el.setSelectionRange(p, p);
        } else if (f === l)
          r === "insert" || r === "delete-back-single" ? this.$refs.input.$el.setSelectionRange(p + 1, p + 1) : r === "delete-single" ? this.$refs.input.$el.setSelectionRange(p - 1, p - 1) : (r === "delete-range" || r === "spin") && this.$refs.input.$el.setSelectionRange(p, p);
        else if (r === "delete-back-single") {
          var g = a.charAt(p - 1), _ = a.charAt(p), V = l - f, z = this._group.test(_);
          z && V === 1 ? p += 1 : !z && this.isNumeralChar(g) && (p += -1 * V + 1), this._group.lastIndex = 0, this.$refs.input.$el.setSelectionRange(p, p);
        } else if (a === "-" && r === "insert") {
          this.$refs.input.$el.setSelectionRange(0, 0);
          var j = this.initCursor(), Y = j + n.length + 1;
          this.$refs.input.$el.setSelectionRange(Y, Y);
        } else
          p = p + (f - l), this.$refs.input.$el.setSelectionRange(p, p);
      }
      this.$refs.input.$el.setAttribute("aria-valuenow", e), (o = this.$refs.clearIcon) !== null && o !== void 0 && (o = o.$el) !== null && o !== void 0 && o.style && (this.$refs.clearIcon.$el.style.display = Le(s) ? "none" : "block");
    },
    concatValues: function(e, n) {
      if (e && n) {
        var r = n.search(this._decimal);
        return this._decimal.lastIndex = 0, this.suffixChar ? r !== -1 ? e.replace(this.suffixChar, "").split(this._decimal)[0] + n.replace(this.suffixChar, "").slice(r) + this.suffixChar : e : r !== -1 ? e.split(this._decimal)[0] + n.slice(r) : e;
      }
      return e;
    },
    getDecimalLength: function(e) {
      if (e) {
        var n = e.split(this._decimal);
        if (n.length === 2)
          return n[1].replace(this._suffix, "").trim().replace(/\s/g, "").replace(this._currency, "").length;
      }
      return 0;
    },
    updateModel: function(e, n) {
      this.writeValue(n, e);
    },
    onInputFocus: function(e) {
      this.focused = !0, !this.disabled && !this.readonly && this.$refs.input.$el.value !== Mn() && this.highlightOnFocus && e.target.select(), this.$emit("focus", e);
    },
    onInputBlur: function(e) {
      var n, r;
      this.focused = !1;
      var i = e.target, o = this.validateValue(this.parseValue(i.value));
      this.$emit("blur", {
        originalEvent: e,
        value: i.value
      }), (n = (r = this.formField).onBlur) === null || n === void 0 || n.call(r, e), i.value = this.formatValue(o), i.setAttribute("aria-valuenow", o), this.updateModel(e, o), !this.disabled && !this.readonly && this.highlightOnFocus && Fi();
    },
    clearTimer: function() {
      this.timer && clearTimeout(this.timer);
    },
    maxBoundry: function() {
      return this.d_value >= this.max;
    },
    minBoundry: function() {
      return this.d_value <= this.min;
    }
  },
  computed: {
    upButtonListeners: function() {
      var e = this;
      return {
        mousedown: function(r) {
          return e.onUpButtonMouseDown(r);
        },
        mouseup: function(r) {
          return e.onUpButtonMouseUp(r);
        },
        mouseleave: function(r) {
          return e.onUpButtonMouseLeave(r);
        },
        keydown: function(r) {
          return e.onUpButtonKeyDown(r);
        },
        keyup: function(r) {
          return e.onUpButtonKeyUp(r);
        }
      };
    },
    downButtonListeners: function() {
      var e = this;
      return {
        mousedown: function(r) {
          return e.onDownButtonMouseDown(r);
        },
        mouseup: function(r) {
          return e.onDownButtonMouseUp(r);
        },
        mouseleave: function(r) {
          return e.onDownButtonMouseLeave(r);
        },
        keydown: function(r) {
          return e.onDownButtonKeyDown(r);
        },
        keyup: function(r) {
          return e.onDownButtonKeyUp(r);
        }
      };
    },
    formattedValue: function() {
      var e = !this.d_value && !this.allowEmpty ? 0 : this.d_value;
      return this.formatValue(e);
    },
    getFormatter: function() {
      return this.numberFormat;
    },
    dataP: function() {
      return ae(bn(bn({
        invalid: this.$invalid,
        fluid: this.$fluid,
        filled: this.$variant === "filled"
      }, this.size, this.size), this.buttonLayout, this.showButtons && this.buttonLayout));
    }
  },
  components: {
    InputText: Ut,
    AngleUpIcon: po,
    AngleDownIcon: co,
    TimesIcon: Kt
  }
}, pd = ["data-p"], fd = ["data-p"], hd = ["disabled", "data-p"], md = ["disabled", "data-p"], bd = ["disabled", "data-p"], gd = ["disabled", "data-p"];
function vd(t, e, n, r, i, o) {
  var a = re("InputText"), s = re("TimesIcon");
  return h(), b("span", v({
    class: t.cx("root")
  }, t.ptmi("root"), {
    "data-p": o.dataP
  }), [J(a, {
    ref: "input",
    id: t.inputId,
    name: t.$formName,
    role: "spinbutton",
    class: ne([t.cx("pcInputText"), t.inputClass]),
    style: Qo(t.inputStyle),
    defaultValue: o.formattedValue,
    "aria-valuemin": t.min,
    "aria-valuemax": t.max,
    "aria-valuenow": t.d_value,
    inputmode: t.mode === "decimal" && !t.minFractionDigits ? "numeric" : "decimal",
    disabled: t.disabled,
    readonly: t.readonly,
    placeholder: t.placeholder,
    "aria-labelledby": t.ariaLabelledby,
    "aria-label": t.ariaLabel,
    required: t.required,
    size: t.size,
    invalid: t.invalid,
    variant: t.variant,
    onInput: o.onUserInput,
    onKeydown: o.onInputKeyDown,
    onKeypress: o.onInputKeyPress,
    onPaste: o.onPaste,
    onClick: o.onInputClick,
    onFocus: o.onInputFocus,
    onBlur: o.onInputBlur,
    pt: t.ptm("pcInputText"),
    unstyled: t.unstyled,
    "data-p": o.dataP
  }, null, 8, ["id", "name", "class", "style", "defaultValue", "aria-valuemin", "aria-valuemax", "aria-valuenow", "inputmode", "disabled", "readonly", "placeholder", "aria-labelledby", "aria-label", "required", "size", "invalid", "variant", "onInput", "onKeydown", "onKeypress", "onPaste", "onClick", "onFocus", "onBlur", "pt", "unstyled", "data-p"]), t.showClear && t.buttonLayout !== "vertical" ? A(t.$slots, "clearicon", {
    key: 0,
    class: ne(t.cx("clearIcon")),
    clearCallback: o.onClearClick
  }, function() {
    return [J(s, v({
      ref: "clearIcon",
      class: [t.cx("clearIcon")],
      onClick: o.onClearClick
    }, t.ptm("clearIcon")), null, 16, ["class", "onClick"])];
  }) : L("", !0), t.showButtons && t.buttonLayout === "stacked" ? (h(), b("span", v({
    key: 1,
    class: t.cx("buttonGroup")
  }, t.ptm("buttonGroup"), {
    "data-p": o.dataP
  }), [A(t.$slots, "incrementbutton", {
    listeners: o.upButtonListeners
  }, function() {
    return [C("button", v({
      class: [t.cx("incrementButton"), t.incrementButtonClass]
    }, Tt(o.upButtonListeners, !0), {
      disabled: t.disabled,
      tabindex: -1,
      "aria-hidden": "true",
      type: "button"
    }, t.ptm("incrementButton"), {
      "data-p": o.dataP
    }), [A(t.$slots, t.$slots.incrementicon ? "incrementicon" : "incrementbuttonicon", {}, function() {
      return [(h(), K(me(t.incrementIcon || t.incrementButtonIcon ? "span" : "AngleUpIcon"), v({
        class: [t.incrementIcon, t.incrementButtonIcon]
      }, t.ptm("incrementIcon"), {
        "data-pc-section": "incrementicon"
      }), null, 16, ["class"]))];
    })], 16, hd)];
  }), A(t.$slots, "decrementbutton", {
    listeners: o.downButtonListeners
  }, function() {
    return [C("button", v({
      class: [t.cx("decrementButton"), t.decrementButtonClass]
    }, Tt(o.downButtonListeners, !0), {
      disabled: t.disabled,
      tabindex: -1,
      "aria-hidden": "true",
      type: "button"
    }, t.ptm("decrementButton"), {
      "data-p": o.dataP
    }), [A(t.$slots, t.$slots.decrementicon ? "decrementicon" : "decrementbuttonicon", {}, function() {
      return [(h(), K(me(t.decrementIcon || t.decrementButtonIcon ? "span" : "AngleDownIcon"), v({
        class: [t.decrementIcon, t.decrementButtonIcon]
      }, t.ptm("decrementIcon"), {
        "data-pc-section": "decrementicon"
      }), null, 16, ["class"]))];
    })], 16, md)];
  })], 16, fd)) : L("", !0), A(t.$slots, "incrementbutton", {
    listeners: o.upButtonListeners
  }, function() {
    return [t.showButtons && t.buttonLayout !== "stacked" ? (h(), b("button", v({
      key: 0,
      class: [t.cx("incrementButton"), t.incrementButtonClass]
    }, Tt(o.upButtonListeners, !0), {
      disabled: t.disabled,
      tabindex: -1,
      "aria-hidden": "true",
      type: "button"
    }, t.ptm("incrementButton"), {
      "data-p": o.dataP
    }), [A(t.$slots, t.$slots.incrementicon ? "incrementicon" : "incrementbuttonicon", {}, function() {
      return [(h(), K(me(t.incrementIcon || t.incrementButtonIcon ? "span" : "AngleUpIcon"), v({
        class: [t.incrementIcon, t.incrementButtonIcon]
      }, t.ptm("incrementIcon"), {
        "data-pc-section": "incrementicon"
      }), null, 16, ["class"]))];
    })], 16, bd)) : L("", !0)];
  }), A(t.$slots, "decrementbutton", {
    listeners: o.downButtonListeners
  }, function() {
    return [t.showButtons && t.buttonLayout !== "stacked" ? (h(), b("button", v({
      key: 0,
      class: [t.cx("decrementButton"), t.decrementButtonClass]
    }, Tt(o.downButtonListeners, !0), {
      disabled: t.disabled,
      tabindex: -1,
      "aria-hidden": "true",
      type: "button"
    }, t.ptm("decrementButton"), {
      "data-p": o.dataP
    }), [A(t.$slots, t.$slots.decrementicon ? "decrementicon" : "decrementbuttonicon", {}, function() {
      return [(h(), K(me(t.decrementIcon || t.decrementButtonIcon ? "span" : "AngleDownIcon"), v({
        class: [t.decrementIcon, t.decrementButtonIcon]
      }, t.ptm("decrementIcon"), {
        "data-pc-section": "decrementicon"
      }), null, 16, ["class"]))];
    })], 16, gd)) : L("", !0)];
  })], 16, pd);
}
fo.render = vd;
var yd = `
    .p-textarea {
        font-family: inherit;
        font-feature-settings: inherit;
        font-size: 1rem;
        color: dt('textarea.color');
        background: dt('textarea.background');
        padding-block: dt('textarea.padding.y');
        padding-inline: dt('textarea.padding.x');
        border: 1px solid dt('textarea.border.color');
        transition:
            background dt('textarea.transition.duration'),
            color dt('textarea.transition.duration'),
            border-color dt('textarea.transition.duration'),
            outline-color dt('textarea.transition.duration'),
            box-shadow dt('textarea.transition.duration');
        appearance: none;
        border-radius: dt('textarea.border.radius');
        outline-color: transparent;
        box-shadow: dt('textarea.shadow');
    }

    .p-textarea:enabled:hover {
        border-color: dt('textarea.hover.border.color');
    }

    .p-textarea:enabled:focus {
        border-color: dt('textarea.focus.border.color');
        box-shadow: dt('textarea.focus.ring.shadow');
        outline: dt('textarea.focus.ring.width') dt('textarea.focus.ring.style') dt('textarea.focus.ring.color');
        outline-offset: dt('textarea.focus.ring.offset');
    }

    .p-textarea.p-invalid {
        border-color: dt('textarea.invalid.border.color');
    }

    .p-textarea.p-variant-filled {
        background: dt('textarea.filled.background');
    }

    .p-textarea.p-variant-filled:enabled:hover {
        background: dt('textarea.filled.hover.background');
    }

    .p-textarea.p-variant-filled:enabled:focus {
        background: dt('textarea.filled.focus.background');
    }

    .p-textarea:disabled {
        opacity: 1;
        background: dt('textarea.disabled.background');
        color: dt('textarea.disabled.color');
    }

    .p-textarea::placeholder {
        color: dt('textarea.placeholder.color');
    }

    .p-textarea.p-invalid::placeholder {
        color: dt('textarea.invalid.placeholder.color');
    }

    .p-textarea-fluid {
        width: 100%;
    }

    .p-textarea-resizable {
        overflow: hidden;
        resize: none;
    }

    .p-textarea-sm {
        font-size: dt('textarea.sm.font.size');
        padding-block: dt('textarea.sm.padding.y');
        padding-inline: dt('textarea.sm.padding.x');
    }

    .p-textarea-lg {
        font-size: dt('textarea.lg.font.size');
        padding-block: dt('textarea.lg.padding.y');
        padding-inline: dt('textarea.lg.padding.x');
    }
`, xd = {
  root: function(e) {
    var n = e.instance, r = e.props;
    return ["p-textarea p-component", {
      "p-filled": n.$filled,
      "p-textarea-resizable ": r.autoResize,
      "p-textarea-sm p-inputfield-sm": r.size === "small",
      "p-textarea-lg p-inputfield-lg": r.size === "large",
      "p-invalid": n.$invalid,
      "p-variant-filled": n.$variant === "filled",
      "p-textarea-fluid": n.$fluid
    }];
  }
}, wd = M.extend({
  name: "textarea",
  style: yd,
  classes: xd
}), kd = {
  name: "BaseTextarea",
  extends: _t,
  props: {
    autoResize: Boolean
  },
  style: wd,
  provide: function() {
    return {
      $pcTextarea: this,
      $parentInstance: this
    };
  }
};
function kt(t) {
  "@babel/helpers - typeof";
  return kt = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, kt(t);
}
function Sd(t, e, n) {
  return (e = $d(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function $d(t) {
  var e = Cd(t, "string");
  return kt(e) == "symbol" ? e : e + "";
}
function Cd(t, e) {
  if (kt(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(t, e);
    if (kt(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var ho = {
  name: "Textarea",
  extends: kd,
  inheritAttrs: !1,
  observer: null,
  mounted: function() {
    var e = this;
    this.autoResize && (this.observer = new ResizeObserver(function() {
      requestAnimationFrame(function() {
        e.resize();
      });
    }), this.observer.observe(this.$el));
  },
  updated: function() {
    this.autoResize && this.resize();
  },
  beforeUnmount: function() {
    this.observer && this.observer.disconnect();
  },
  methods: {
    resize: function() {
      if (this.$el.offsetParent) {
        var e = this.$el.style.height, n = parseInt(e) || 0, r = this.$el.scrollHeight, i = !n || r > n, o = n && r < n;
        o ? (this.$el.style.height = "auto", this.$el.style.height = "".concat(this.$el.scrollHeight, "px")) : i && (this.$el.style.height = "".concat(r, "px"));
      }
    },
    onInput: function(e) {
      this.autoResize && this.resize(), this.writeValue(e.target.value, e);
    }
  },
  computed: {
    attrs: function() {
      return v(this.ptmi("root", {
        context: {
          filled: this.$filled,
          disabled: this.disabled
        }
      }), this.formField);
    },
    dataP: function() {
      return ae(Sd({
        invalid: this.$invalid,
        fluid: this.$fluid,
        filled: this.$variant === "filled"
      }, this.size, this.size));
    }
  }
}, Od = ["value", "name", "disabled", "aria-invalid", "data-p"];
function Id(t, e, n, r, i, o) {
  return h(), b("textarea", v({
    class: t.cx("root"),
    value: t.d_value,
    name: t.name,
    disabled: t.disabled,
    "aria-invalid": t.invalid || void 0,
    "data-p": o.dataP,
    onInput: e[0] || (e[0] = function() {
      return o.onInput && o.onInput.apply(o, arguments);
    })
  }, o.attrs), null, 16, Od);
}
ho.render = Id;
var mo = {
  name: "BlankIcon",
  extends: xe
};
function _d(t) {
  return Ad(t) || Ld(t) || Pd(t) || Td();
}
function Td() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Pd(t, e) {
  if (t) {
    if (typeof t == "string") return vn(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? vn(t, e) : void 0;
  }
}
function Ld(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function Ad(t) {
  if (Array.isArray(t)) return vn(t);
}
function vn(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, r = Array(e); n < e; n++) r[n] = t[n];
  return r;
}
function zd(t, e, n, r, i, o) {
  return h(), b("svg", v({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, t.pti()), _d(e[0] || (e[0] = [C("rect", {
    width: "1",
    height: "1",
    fill: "currentColor",
    "fill-opacity": "0"
  }, null, -1)])), 16);
}
mo.render = zd;
var bo = {
  name: "ChevronDownIcon",
  extends: xe
};
function Ed(t) {
  return Dd(t) || Vd(t) || jd(t) || Bd();
}
function Bd() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function jd(t, e) {
  if (t) {
    if (typeof t == "string") return yn(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? yn(t, e) : void 0;
  }
}
function Vd(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function Dd(t) {
  if (Array.isArray(t)) return yn(t);
}
function yn(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, r = Array(e); n < e; n++) r[n] = t[n];
  return r;
}
function Md(t, e, n, r, i, o) {
  return h(), b("svg", v({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, t.pti()), Ed(e[0] || (e[0] = [C("path", {
    d: "M7.01744 10.398C6.91269 10.3985 6.8089 10.378 6.71215 10.3379C6.61541 10.2977 6.52766 10.2386 6.45405 10.1641L1.13907 4.84913C1.03306 4.69404 0.985221 4.5065 1.00399 4.31958C1.02276 4.13266 1.10693 3.95838 1.24166 3.82747C1.37639 3.69655 1.55301 3.61742 1.74039 3.60402C1.92777 3.59062 2.11386 3.64382 2.26584 3.75424L7.01744 8.47394L11.769 3.75424C11.9189 3.65709 12.097 3.61306 12.2748 3.62921C12.4527 3.64535 12.6199 3.72073 12.7498 3.84328C12.8797 3.96582 12.9647 4.12842 12.9912 4.30502C13.0177 4.48162 12.9841 4.662 12.8958 4.81724L7.58083 10.1322C7.50996 10.2125 7.42344 10.2775 7.32656 10.3232C7.22968 10.3689 7.12449 10.3944 7.01744 10.398Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
bo.render = Md;
var go = {
  name: "SearchIcon",
  extends: xe
};
function Nd(t) {
  return Ud(t) || Kd(t) || Rd(t) || Fd();
}
function Fd() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Rd(t, e) {
  if (t) {
    if (typeof t == "string") return xn(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? xn(t, e) : void 0;
  }
}
function Kd(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function Ud(t) {
  if (Array.isArray(t)) return xn(t);
}
function xn(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, r = Array(e); n < e; n++) r[n] = t[n];
  return r;
}
function Hd(t, e, n, r, i, o) {
  return h(), b("svg", v({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, t.pti()), Nd(e[0] || (e[0] = [C("path", {
    "fill-rule": "evenodd",
    "clip-rule": "evenodd",
    d: "M2.67602 11.0265C3.6661 11.688 4.83011 12.0411 6.02086 12.0411C6.81149 12.0411 7.59438 11.8854 8.32483 11.5828C8.87005 11.357 9.37808 11.0526 9.83317 10.6803L12.9769 13.8241C13.0323 13.8801 13.0983 13.9245 13.171 13.9548C13.2438 13.985 13.3219 14.0003 13.4007 14C13.4795 14.0003 13.5575 13.985 13.6303 13.9548C13.7031 13.9245 13.7691 13.8801 13.8244 13.8241C13.9367 13.7116 13.9998 13.5592 13.9998 13.4003C13.9998 13.2414 13.9367 13.089 13.8244 12.9765L10.6807 9.8328C11.053 9.37773 11.3573 8.86972 11.5831 8.32452C11.8857 7.59408 12.0414 6.81119 12.0414 6.02056C12.0414 4.8298 11.6883 3.66579 11.0268 2.67572C10.3652 1.68564 9.42494 0.913972 8.32483 0.45829C7.22472 0.00260857 6.01418 -0.116618 4.84631 0.115686C3.67844 0.34799 2.60568 0.921393 1.76369 1.76338C0.921698 2.60537 0.348296 3.67813 0.115991 4.84601C-0.116313 6.01388 0.00291375 7.22441 0.458595 8.32452C0.914277 9.42464 1.68595 10.3649 2.67602 11.0265ZM3.35565 2.0158C4.14456 1.48867 5.07206 1.20731 6.02086 1.20731C7.29317 1.20731 8.51338 1.71274 9.41304 2.6124C10.3127 3.51206 10.8181 4.73226 10.8181 6.00457C10.8181 6.95337 10.5368 7.88088 10.0096 8.66978C9.48251 9.45868 8.73328 10.0736 7.85669 10.4367C6.98011 10.7997 6.01554 10.8947 5.08496 10.7096C4.15439 10.5245 3.2996 10.0676 2.62869 9.39674C1.95778 8.72583 1.50089 7.87104 1.31579 6.94046C1.13068 6.00989 1.22568 5.04532 1.58878 4.16874C1.95187 3.29215 2.56675 2.54292 3.35565 2.0158Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
go.render = Hd;
var Wd = `
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
`, Gd = {
  root: "p-iconfield"
}, qd = M.extend({
  name: "iconfield",
  style: Wd,
  classes: Gd
}), Yd = {
  name: "BaseIconField",
  extends: be,
  style: qd,
  provide: function() {
    return {
      $pcIconField: this,
      $parentInstance: this
    };
  }
}, vo = {
  name: "IconField",
  extends: Yd,
  inheritAttrs: !1
};
function Zd(t, e, n, r, i, o) {
  return h(), b("div", v({
    class: t.cx("root")
  }, t.ptmi("root")), [A(t.$slots, "default")], 16);
}
vo.render = Zd;
var Jd = {
  root: "p-inputicon"
}, Qd = M.extend({
  name: "inputicon",
  classes: Jd
}), Xd = {
  name: "BaseInputIcon",
  extends: be,
  style: Qd,
  props: {
    class: null
  },
  provide: function() {
    return {
      $pcInputIcon: this,
      $parentInstance: this
    };
  }
}, yo = {
  name: "InputIcon",
  extends: Xd,
  inheritAttrs: !1,
  computed: {
    containerClass: function() {
      return [this.cx("root"), this.class];
    }
  }
};
function ec(t, e, n, r, i, o) {
  return h(), b("span", v({
    class: o.containerClass
  }, t.ptmi("root"), {
    "aria-hidden": "true"
  }), [A(t.$slots, "default")], 16);
}
yo.render = ec;
var tc = `
    .p-virtualscroller-loader {
        background: dt('virtualscroller.loader.mask.background');
        color: dt('virtualscroller.loader.mask.color');
    }

    .p-virtualscroller-loading-icon {
        font-size: dt('virtualscroller.loader.icon.size');
        width: dt('virtualscroller.loader.icon.size');
        height: dt('virtualscroller.loader.icon.size');
    }
`, nc = `
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
`, xr = M.extend({
  name: "virtualscroller",
  css: nc,
  style: tc
}), rc = {
  name: "BaseVirtualScroller",
  extends: be,
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
  style: xr,
  provide: function() {
    return {
      $pcVirtualScroller: this,
      $parentInstance: this
    };
  },
  beforeMount: function() {
    var e;
    xr.loadCSS({
      nonce: (e = this.$primevueConfig) === null || e === void 0 || (e = e.csp) === null || e === void 0 ? void 0 : e.nonce
    });
  }
};
function St(t) {
  "@babel/helpers - typeof";
  return St = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, St(t);
}
function wr(t, e) {
  var n = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(t);
    e && (r = r.filter(function(i) {
      return Object.getOwnPropertyDescriptor(t, i).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function Qe(t) {
  for (var e = 1; e < arguments.length; e++) {
    var n = arguments[e] != null ? arguments[e] : {};
    e % 2 ? wr(Object(n), !0).forEach(function(r) {
      xo(t, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(n)) : wr(Object(n)).forEach(function(r) {
      Object.defineProperty(t, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return t;
}
function xo(t, e, n) {
  return (e = oc(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function oc(t) {
  var e = ic(t, "string");
  return St(e) == "symbol" ? e : e + "";
}
function ic(t, e) {
  if (St(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(t, e);
    if (St(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var wo = {
  name: "VirtualScroller",
  extends: rc,
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
      Bt(this.element) && (this.setContentEl(this.content), this.init(), this.calculateAutoSize(), this.defaultWidth = $e(this.element), this.defaultHeight = Ae(this.element), this.defaultContentWidth = $e(this.content), this.defaultContentHeight = Ae(this.content), this.initialized = !0), this.element && this.bindResizeListener();
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
      var n = this, r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "auto", i = this.isBoth(), o = this.isHorizontal(), a = i ? e.every(function(z) {
        return z > -1;
      }) : e > -1;
      if (a) {
        var s = this.first, l = this.element, u = l.scrollTop, d = u === void 0 ? 0 : u, c = l.scrollLeft, p = c === void 0 ? 0 : c, f = this.calculateNumItems(), m = f.numToleratedItems, x = this.getContentPosition(), y = this.itemSize, w = function() {
          var j = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0, Y = arguments.length > 1 ? arguments[1] : void 0;
          return j <= Y ? 0 : j;
        }, O = function(j, Y, X) {
          return j * Y + X;
        }, T = function() {
          var j = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0, Y = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0;
          return n.scrollTo({
            left: j,
            top: Y,
            behavior: r
          });
        }, g = i ? {
          rows: 0,
          cols: 0
        } : 0, _ = !1, V = !1;
        i ? (g = {
          rows: w(e[0], m[0]),
          cols: w(e[1], m[1])
        }, T(O(g.cols, y[1], x.left), O(g.rows, y[0], x.top)), V = this.lastScrollPos.top !== d || this.lastScrollPos.left !== p, _ = g.rows !== s.rows || g.cols !== s.cols) : (g = w(e, m), o ? T(O(g, y, x.left), d) : T(p, O(g, y, x.top)), V = this.lastScrollPos !== (o ? p : d), _ = g !== s), this.isRangeChanged = _, V && (this.first = g);
      }
    },
    scrollInView: function(e, n) {
      var r = this, i = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : "auto";
      if (n) {
        var o = this.isBoth(), a = this.isHorizontal(), s = o ? e.every(function(y) {
          return y > -1;
        }) : e > -1;
        if (s) {
          var l = this.getRenderedRange(), u = l.first, d = l.viewport, c = function() {
            var w = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0, O = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0;
            return r.scrollTo({
              left: w,
              top: O,
              behavior: i
            });
          }, p = n === "to-start", f = n === "to-end";
          if (p) {
            if (o)
              d.first.rows - u.rows > e[0] ? c(d.first.cols * this.itemSize[1], (d.first.rows - 1) * this.itemSize[0]) : d.first.cols - u.cols > e[1] && c((d.first.cols - 1) * this.itemSize[1], d.first.rows * this.itemSize[0]);
            else if (d.first - u > e) {
              var m = (d.first - 1) * this.itemSize;
              a ? c(m, 0) : c(0, m);
            }
          } else if (f) {
            if (o)
              d.last.rows - u.rows <= e[0] + 1 ? c(d.first.cols * this.itemSize[1], (d.first.rows + 1) * this.itemSize[0]) : d.last.cols - u.cols <= e[1] + 1 && c((d.first.cols + 1) * this.itemSize[1], d.first.rows * this.itemSize[0]);
            else if (d.last - u <= e + 1) {
              var x = (d.first + 1) * this.itemSize;
              a ? c(x, 0) : c(0, x);
            }
          }
        }
      } else
        this.scrollToIndex(e, i);
    },
    getRenderedRange: function() {
      var e = function(c, p) {
        return Math.floor(c / (p || c));
      }, n = this.first, r = 0;
      if (this.element) {
        var i = this.isBoth(), o = this.isHorizontal(), a = this.element, s = a.scrollTop, l = a.scrollLeft;
        if (i)
          n = {
            rows: e(s, this.itemSize[0]),
            cols: e(l, this.itemSize[1])
          }, r = {
            rows: n.rows + this.numItemsInViewport.rows,
            cols: n.cols + this.numItemsInViewport.cols
          };
        else {
          var u = o ? l : s;
          n = e(u, this.itemSize), r = n + this.numItemsInViewport;
        }
      }
      return {
        first: this.first,
        last: this.last,
        viewport: {
          first: n,
          last: r
        }
      };
    },
    calculateNumItems: function() {
      var e = this.isBoth(), n = this.isHorizontal(), r = this.itemSize, i = this.getContentPosition(), o = this.element ? this.element.offsetWidth - i.left : 0, a = this.element ? this.element.offsetHeight - i.top : 0, s = function(p, f) {
        return Math.ceil(p / (f || p));
      }, l = function(p) {
        return Math.ceil(p / 2);
      }, u = e ? {
        rows: s(a, r[0]),
        cols: s(o, r[1])
      } : s(n ? o : a, r), d = this.d_numToleratedItems || (e ? [l(u.rows), l(u.cols)] : l(u));
      return {
        numItemsInViewport: u,
        numToleratedItems: d
      };
    },
    calculateOptions: function() {
      var e = this, n = this.isBoth(), r = this.first, i = this.calculateNumItems(), o = i.numItemsInViewport, a = i.numToleratedItems, s = function(d, c, p) {
        var f = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : !1;
        return e.getLast(d + c + (d < p ? 2 : 3) * p, f);
      }, l = n ? {
        rows: s(r.rows, o.rows, a[0]),
        cols: s(r.cols, o.cols, a[1], !0)
      } : s(r, o, a);
      this.last = l, this.numItemsInViewport = o, this.d_numToleratedItems = a, this.$emit("update:numToleratedItems", this.d_numToleratedItems), this.showLoader && (this.loaderArr = n ? Array.from({
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
            cols: r.cols
          } : 0 : r,
          last: Math.min(e.step ? e.step : l, ((u = e.items) === null || u === void 0 ? void 0 : u.length) || 0)
        }, e.$emit("lazy-load", e.lazyLoadState);
      });
    },
    calculateAutoSize: function() {
      var e = this;
      this.autoSize && !this.d_loading && Promise.resolve().then(function() {
        if (e.content) {
          var n = e.isBoth(), r = e.isHorizontal(), i = e.isVertical();
          e.content.style.minHeight = e.content.style.minWidth = "auto", e.content.style.position = "relative", e.element.style.contain = "none";
          var o = [$e(e.element), Ae(e.element)], a = o[0], s = o[1];
          (n || r) && (e.element.style.width = a < e.defaultWidth ? a + "px" : e.scrollWidth || e.defaultWidth + "px"), (n || i) && (e.element.style.height = s < e.defaultHeight ? s + "px" : e.scrollHeight || e.defaultHeight + "px"), e.content.style.minHeight = e.content.style.minWidth = "", e.content.style.position = "", e.element.style.contain = "";
        }
      });
    },
    getLast: function() {
      var e, n, r = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0, i = arguments.length > 1 ? arguments[1] : void 0;
      return this.items ? Math.min(i ? ((e = this.columns || this.items[0]) === null || e === void 0 ? void 0 : e.length) || 0 : ((n = this.items) === null || n === void 0 ? void 0 : n.length) || 0, r) : 0;
    },
    getContentPosition: function() {
      if (this.content) {
        var e = getComputedStyle(this.content), n = parseFloat(e.paddingLeft) + Math.max(parseFloat(e.left) || 0, 0), r = parseFloat(e.paddingRight) + Math.max(parseFloat(e.right) || 0, 0), i = parseFloat(e.paddingTop) + Math.max(parseFloat(e.top) || 0, 0), o = parseFloat(e.paddingBottom) + Math.max(parseFloat(e.bottom) || 0, 0);
        return {
          left: n,
          right: r,
          top: i,
          bottom: o,
          x: n + r,
          y: i + o
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
        var n = this.isBoth(), r = this.isHorizontal(), i = this.element.parentElement, o = this.scrollWidth || "".concat(this.element.offsetWidth || i.offsetWidth, "px"), a = this.scrollHeight || "".concat(this.element.offsetHeight || i.offsetHeight, "px"), s = function(u, d) {
          return e.element.style[u] = d;
        };
        n || r ? (s("height", a), s("width", o)) : s("height", a);
      }
    },
    setSpacerSize: function() {
      var e = this, n = this.items;
      if (n) {
        var r = this.isBoth(), i = this.isHorizontal(), o = this.getContentPosition(), a = function(l, u, d) {
          var c = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : 0;
          return e.spacerStyle = Qe(Qe({}, e.spacerStyle), xo({}, "".concat(l), (u || []).length * d + c + "px"));
        };
        r ? (a("height", n, this.itemSize[0], o.y), a("width", this.columns || n[1], this.itemSize[1], o.x)) : i ? a("width", this.columns || n, this.itemSize, o.x) : a("height", n, this.itemSize, o.y);
      }
    },
    setContentPosition: function(e) {
      var n = this;
      if (this.content && !this.appendOnly) {
        var r = this.isBoth(), i = this.isHorizontal(), o = e ? e.first : this.first, a = function(d, c) {
          return d * c;
        }, s = function() {
          var d = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0, c = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0;
          return n.contentStyle = Qe(Qe({}, n.contentStyle), {
            transform: "translate3d(".concat(d, "px, ").concat(c, "px, 0)")
          });
        };
        if (r)
          s(a(o.cols, this.itemSize[1]), a(o.rows, this.itemSize[0]));
        else {
          var l = a(o, this.itemSize);
          i ? s(l, 0) : s(0, l);
        }
      }
    },
    onScrollPositionChange: function(e) {
      var n = this, r = e.target, i = this.isBoth(), o = this.isHorizontal(), a = this.getContentPosition(), s = function(U, Z) {
        return U ? U > Z ? U - Z : U : 0;
      }, l = function(U, Z) {
        return Math.floor(U / (Z || U));
      }, u = function(U, Z, Q, te, S, E) {
        return U <= S ? S : E ? Q - te - S : Z + S - 1;
      }, d = function(U, Z, Q, te, S, E, $, k) {
        if (U <= E) return 0;
        var P = Math.max(0, $ ? U < Z ? Q : U - E : U > Z ? Q : U - 2 * E), I = n.getLast(P, k);
        return P > I ? I - S : P;
      }, c = function(U, Z, Q, te, S, E) {
        var $ = Z + te + 2 * S;
        return U >= S && ($ += S + 1), n.getLast($, E);
      }, p = s(r.scrollTop, a.top), f = s(r.scrollLeft, a.left), m = i ? {
        rows: 0,
        cols: 0
      } : 0, x = this.last, y = !1, w = this.lastScrollPos;
      if (i) {
        var O = this.lastScrollPos.top <= p, T = this.lastScrollPos.left <= f;
        if (!this.appendOnly || this.appendOnly && (O || T)) {
          var g = {
            rows: l(p, this.itemSize[0]),
            cols: l(f, this.itemSize[1])
          }, _ = {
            rows: u(g.rows, this.first.rows, this.last.rows, this.numItemsInViewport.rows, this.d_numToleratedItems[0], O),
            cols: u(g.cols, this.first.cols, this.last.cols, this.numItemsInViewport.cols, this.d_numToleratedItems[1], T)
          };
          m = {
            rows: d(g.rows, _.rows, this.first.rows, this.last.rows, this.numItemsInViewport.rows, this.d_numToleratedItems[0], O),
            cols: d(g.cols, _.cols, this.first.cols, this.last.cols, this.numItemsInViewport.cols, this.d_numToleratedItems[1], T, !0)
          }, x = {
            rows: c(g.rows, m.rows, this.last.rows, this.numItemsInViewport.rows, this.d_numToleratedItems[0]),
            cols: c(g.cols, m.cols, this.last.cols, this.numItemsInViewport.cols, this.d_numToleratedItems[1], !0)
          }, y = m.rows !== this.first.rows || x.rows !== this.last.rows || m.cols !== this.first.cols || x.cols !== this.last.cols || this.isRangeChanged, w = {
            top: p,
            left: f
          };
        }
      } else {
        var V = o ? f : p, z = this.lastScrollPos <= V;
        if (!this.appendOnly || this.appendOnly && z) {
          var j = l(V, this.itemSize), Y = u(j, this.first, this.last, this.numItemsInViewport, this.d_numToleratedItems, z);
          m = d(j, Y, this.first, this.last, this.numItemsInViewport, this.d_numToleratedItems, z), x = c(j, m, this.last, this.numItemsInViewport, this.d_numToleratedItems), y = m !== this.first || x !== this.last || this.isRangeChanged, w = V;
        }
      }
      return {
        first: m,
        last: x,
        isRangeChanged: y,
        scrollPos: w
      };
    },
    onScrollChange: function(e) {
      var n = this.onScrollPositionChange(e), r = n.first, i = n.last, o = n.isRangeChanged, a = n.scrollPos;
      if (o) {
        var s = {
          first: r,
          last: i
        };
        if (this.setContentPosition(s), this.first = r, this.last = i, this.lastScrollPos = a, this.$emit("scroll-index-change", s), this.lazy && this.isPageChanged(r)) {
          var l, u, d = {
            first: this.step ? Math.min(this.getPageByFirst(r) * this.step, (((l = this.items) === null || l === void 0 ? void 0 : l.length) || 0) - this.step) : r,
            last: Math.min(this.step ? (this.getPageByFirst(r) + 1) * this.step : i, ((u = this.items) === null || u === void 0 ? void 0 : u.length) || 0)
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
            var r = this.onScrollPositionChange(e), i = r.isRangeChanged, o = i || (this.step ? this.isPageChanged() : !1);
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
        if (Bt(e.element)) {
          var n = e.isBoth(), r = e.isVertical(), i = e.isHorizontal(), o = [$e(e.element), Ae(e.element)], a = o[0], s = o[1], l = a !== e.defaultWidth, u = s !== e.defaultHeight, d = n ? l || u : i ? l : r ? u : !1;
          d && (e.d_numToleratedItems = e.numToleratedItems, e.defaultWidth = a, e.defaultHeight = s, e.defaultContentWidth = $e(e.content), e.defaultContentHeight = Ae(e.content), e.init());
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
      var n = (this.items || []).length, r = this.isBoth() ? this.first.rows + e : this.first + e;
      return {
        index: r,
        count: n,
        first: r === 0,
        last: r === n - 1,
        even: r % 2 === 0,
        odd: r % 2 !== 0
      };
    },
    getLoaderOptions: function(e, n) {
      var r = this.loaderArr.length;
      return Qe({
        index: e,
        count: r,
        first: e === 0,
        last: e === r - 1,
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
      this.content = e || this.content || Be(this.element, '[data-pc-section="content"]');
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
    SpinnerIcon: Rt
  }
}, ac = ["tabindex"];
function sc(t, e, n, r, i, o) {
  var a = re("SpinnerIcon");
  return t.disabled ? (h(), b(oe, {
    key: 1
  }, [A(t.$slots, "default"), A(t.$slots, "content", {
    items: t.items,
    rows: t.items,
    columns: o.loadedColumns
  })], 64)) : (h(), b("div", v({
    key: 0,
    ref: o.elementRef,
    class: o.containerClass,
    tabindex: t.tabindex,
    style: t.style,
    onScroll: e[0] || (e[0] = function() {
      return o.onScroll && o.onScroll.apply(o, arguments);
    })
  }, t.ptmi("root")), [A(t.$slots, "content", {
    styleClass: o.contentClass,
    items: o.loadedItems,
    getItemOptions: o.getOptions,
    loading: i.d_loading,
    getLoaderOptions: o.getLoaderOptions,
    itemSize: t.itemSize,
    rows: o.loadedRows,
    columns: o.loadedColumns,
    contentRef: o.contentRef,
    spacerStyle: i.spacerStyle,
    contentStyle: i.contentStyle,
    vertical: o.isVertical(),
    horizontal: o.isHorizontal(),
    both: o.isBoth()
  }, function() {
    return [C("div", v({
      ref: o.contentRef,
      class: o.contentClass,
      style: i.contentStyle
    }, t.ptm("content")), [(h(!0), b(oe, null, ye(o.loadedItems, function(s, l) {
      return A(t.$slots, "item", {
        key: l,
        item: s,
        options: o.getOptions(l)
      });
    }), 128))], 16)];
  }), t.showSpacer ? (h(), b("div", v({
    key: 0,
    class: "p-virtualscroller-spacer",
    style: i.spacerStyle
  }, t.ptm("spacer")), null, 16)) : L("", !0), !t.loaderDisabled && t.showLoader && i.d_loading ? (h(), b("div", v({
    key: 1,
    class: o.loaderClass
  }, t.ptm("loader")), [t.$slots && t.$slots.loader ? (h(!0), b(oe, {
    key: 0
  }, ye(i.loaderArr, function(s, l) {
    return A(t.$slots, "loader", {
      key: l,
      options: o.getLoaderOptions(l, o.isBoth() && {
        numCols: t.d_numItemsInViewport.cols
      })
    });
  }), 128)) : L("", !0), A(t.$slots, "loadingicon", {}, function() {
    return [J(a, v({
      spin: "",
      class: "p-virtualscroller-loading-icon"
    }, t.ptm("loadingIcon")), null, 16)];
  })], 16)) : L("", !0)], 16, ac));
}
wo.render = sc;
var lc = `
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
`, uc = {
  root: function(e) {
    var n = e.instance, r = e.props, i = e.state;
    return ["p-select p-component p-inputwrapper", {
      "p-disabled": r.disabled,
      "p-invalid": n.$invalid,
      "p-variant-filled": n.$variant === "filled",
      "p-focus": i.focused,
      "p-inputwrapper-filled": n.$filled,
      "p-inputwrapper-focus": i.focused || i.overlayVisible,
      "p-select-open": i.overlayVisible,
      "p-select-fluid": n.$fluid,
      "p-select-sm p-inputfield-sm": r.size === "small",
      "p-select-lg p-inputfield-lg": r.size === "large"
    }];
  },
  label: function(e) {
    var n, r = e.instance, i = e.props;
    return ["p-select-label", {
      "p-placeholder": !i.editable && r.label === i.placeholder,
      "p-select-label-empty": !i.editable && !r.$slots.value && (r.label === "p-emptylabel" || ((n = r.label) === null || n === void 0 ? void 0 : n.length) === 0)
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
    var n = e.instance, r = e.props, i = e.state, o = e.option, a = e.focusedOption;
    return ["p-select-option", {
      "p-select-option-selected": n.isSelected(o) && r.highlightOnSelect,
      "p-focus": i.focusedOptionIndex === a,
      "p-disabled": n.isOptionDisabled(o)
    }];
  },
  optionLabel: "p-select-option-label",
  optionCheckIcon: "p-select-option-check-icon",
  optionBlankIcon: "p-select-option-blank-icon",
  emptyMessage: "p-select-empty-message"
}, dc = M.extend({
  name: "select",
  style: lc,
  classes: uc
}), cc = {
  name: "BaseSelect",
  extends: _t,
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
  style: dc,
  provide: function() {
    return {
      $pcSelect: this,
      $parentInstance: this
    };
  }
};
function $t(t) {
  "@babel/helpers - typeof";
  return $t = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, $t(t);
}
function pc(t) {
  return bc(t) || mc(t) || hc(t) || fc();
}
function fc() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function hc(t, e) {
  if (t) {
    if (typeof t == "string") return wn(t, e);
    var n = {}.toString.call(t).slice(8, -1);
    return n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set" ? Array.from(t) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? wn(t, e) : void 0;
  }
}
function mc(t) {
  if (typeof Symbol < "u" && t[Symbol.iterator] != null || t["@@iterator"] != null) return Array.from(t);
}
function bc(t) {
  if (Array.isArray(t)) return wn(t);
}
function wn(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var n = 0, r = Array(e); n < e; n++) r[n] = t[n];
  return r;
}
function kr(t, e) {
  var n = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(t);
    e && (r = r.filter(function(i) {
      return Object.getOwnPropertyDescriptor(t, i).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function Sr(t) {
  for (var e = 1; e < arguments.length; e++) {
    var n = arguments[e] != null ? arguments[e] : {};
    e % 2 ? kr(Object(n), !0).forEach(function(r) {
      De(t, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(n)) : kr(Object(n)).forEach(function(r) {
      Object.defineProperty(t, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return t;
}
function De(t, e, n) {
  return (e = gc(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function gc(t) {
  var e = vc(t, "string");
  return $t(e) == "symbol" ? e : e + "";
}
function vc(t, e) {
  if ($t(t) != "object" || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(t, e);
    if ($t(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (e === "string" ? String : Number)(t);
}
var ko = {
  name: "Select",
  extends: cc,
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
    this.unbindOutsideClickListener(), this.unbindResizeListener(), this.unbindLabelClickListener(), this.unbindMatchMediaOrientationListener(), this.scrollHandler && (this.scrollHandler.destroy(), this.scrollHandler = null), this.overlay && (Wt.clear(this.overlay), this.overlay = null);
  },
  methods: {
    getOptionIndex: function(e, n) {
      return this.virtualScrollerDisabled ? e : n && n(e).index;
    },
    getOptionLabel: function(e) {
      return this.optionLabel ? Te(e, this.optionLabel) : e;
    },
    getOptionValue: function(e) {
      return this.optionValue ? Te(e, this.optionValue) : e;
    },
    getOptionRenderKey: function(e, n) {
      return (this.dataKey ? Te(e, this.dataKey) : this.getOptionLabel(e)) + "_" + n;
    },
    getPTItemOptions: function(e, n, r, i) {
      return this.ptm(i, {
        context: {
          option: e,
          index: r,
          selected: this.isSelected(e),
          focused: this.focusedOptionIndex === this.getOptionIndex(r, n),
          disabled: this.isOptionDisabled(e)
        }
      });
    },
    isOptionDisabled: function(e) {
      return this.optionDisabled ? Te(e, this.optionDisabled) : !1;
    },
    isOptionGroup: function(e) {
      return this.optionGroupLabel && e.optionGroup && e.group;
    },
    getOptionGroupLabel: function(e) {
      return Te(e, this.optionGroupLabel);
    },
    getOptionGroupChildren: function(e) {
      return Te(e, this.optionGroupChildren);
    },
    getAriaPosInset: function(e) {
      var n = this;
      return (this.optionGroupLabel ? e - this.visibleOptions.slice(0, e).filter(function(r) {
        return n.isOptionGroup(r);
      }).length : e) + 1;
    },
    show: function(e) {
      this.$emit("before-show"), this.overlayVisible = !0, this.focusedOptionIndex = this.focusedOptionIndex !== -1 ? this.focusedOptionIndex : this.autoOptionFocus ? this.findFirstFocusedOptionIndex() : this.editable ? -1 : this.findSelectedOptionIndex(), e && ke(this.$refs.focusInput);
    },
    hide: function(e) {
      var n = this, r = function() {
        n.$emit("before-hide"), n.overlayVisible = !1, n.clicked = !1, n.focusedOptionIndex = -1, n.searchValue = "", n.resetFilterOnHide && (n.filterValue = null), e && ke(n.$refs.focusInput);
      };
      setTimeout(function() {
        r();
      }, 0);
    },
    onFocus: function(e) {
      this.disabled || (this.focused = !0, this.overlayVisible && (this.focusedOptionIndex = this.focusedOptionIndex !== -1 ? this.focusedOptionIndex : this.autoOptionFocus ? this.findFirstFocusedOptionIndex() : this.editable ? -1 : this.findSelectedOptionIndex(), this.scrollInView(this.focusedOptionIndex)), this.$emit("focus", e));
    },
    onBlur: function(e) {
      var n = this;
      setTimeout(function() {
        var r, i;
        n.focused = !1, n.focusedOptionIndex = -1, n.searchValue = "", n.$emit("blur", e), (r = (i = n.formField).onBlur) === null || r === void 0 || r.call(i, e);
      }, 100);
    },
    onKeyDown: function(e) {
      var n = this;
      if (this.disabled) {
        e.preventDefault();
        return;
      }
      if (Gi())
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
      var r = e.metaKey || e.ctrlKey;
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
          !r && Pi(e.key) && (!this.overlayVisible && this.show(), !this.editable && this.searchOptions(e, e.key), this.filter && this.$nextTick(function() {
            n.$refs.filterInput && ke(n.$refs.filterInput.$el);
          }));
          break;
      }
      this.clicked = !1;
    },
    onEditableInput: function(e) {
      var n = e.target.value;
      this.searchValue = "";
      var r = this.searchOptions(e, n);
      !r && (this.focusedOptionIndex = -1), this.updateModel(e, n), !this.overlayVisible && F(n) && this.show();
    },
    onContainerClick: function(e) {
      this.disabled || this.loading || e.target.tagName === "INPUT" || e.target.getAttribute("data-pc-section") === "clearicon" || e.target.closest('[data-pc-section="clearicon"]') || ((!this.overlay || !this.overlay.contains(e.target)) && (this.overlayVisible ? this.hide(!0) : this.show(!0)), this.clicked = !0);
    },
    onClearClick: function(e) {
      this.updateModel(e, null), this.resetFilterOnClear && (this.filterValue = null);
    },
    onFirstHiddenFocus: function(e) {
      var n = e.relatedTarget === this.$refs.focusInput ? Ui(this.overlay, ':not([data-p-hidden-focusable="true"])') : this.$refs.focusInput;
      ke(n);
    },
    onLastHiddenFocus: function(e) {
      var n = e.relatedTarget === this.$refs.focusInput ? Hi(this.overlay, ':not([data-p-hidden-focusable="true"])') : this.$refs.focusInput;
      ke(n);
    },
    onOptionSelect: function(e, n) {
      var r = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : !0;
      if (this.overlayVisible) {
        var i = this.getOptionValue(n);
        this.updateModel(e, i), r && this.hide(!0);
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
      gs.emit("overlay-click", {
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
        var r = this.focusedOptionIndex !== -1 ? this.findPrevOptionIndex(this.focusedOptionIndex) : this.clicked ? this.findLastOptionIndex() : this.findLastFocusedOptionIndex();
        this.changeFocusedOptionIndex(e, r), !this.overlayVisible && this.show(), e.preventDefault();
      }
    },
    onArrowLeftKey: function(e) {
      var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1;
      n && (this.focusedOptionIndex = -1);
    },
    onHomeKey: function(e) {
      var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1;
      if (n) {
        var r = e.currentTarget;
        e.shiftKey ? r.setSelectionRange(0, e.target.selectionStart) : (r.setSelectionRange(0, 0), this.focusedOptionIndex = -1);
      } else
        this.changeFocusedOptionIndex(e, this.findFirstOptionIndex()), !this.overlayVisible && this.show();
      e.preventDefault();
    },
    onEndKey: function(e) {
      var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1;
      if (n) {
        var r = e.currentTarget;
        if (e.shiftKey)
          r.setSelectionRange(e.target.selectionStart, r.value.length);
        else {
          var i = r.value.length;
          r.setSelectionRange(i, i), this.focusedOptionIndex = -1;
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
      n || (this.overlayVisible && this.hasFocusableElements() ? (ke(this.$refs.firstHiddenFocusableElementOnOverlay), e.preventDefault()) : (this.focusedOptionIndex !== -1 && this.onOptionSelect(e, this.visibleOptions[this.focusedOptionIndex]), this.overlayVisible && this.hide(this.filter)));
    },
    onBackspaceKey: function(e) {
      var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1;
      n && !this.overlayVisible && this.show();
    },
    onOverlayEnter: function(e) {
      var n = this;
      Wt.set("overlay", e, this.$primevue.config.zIndex.overlay), Di(e, {
        position: "absolute",
        top: "0"
      }), this.alignOverlay(), this.scrollInView(), this.$attrSelector && e.setAttribute(this.$attrSelector, ""), setTimeout(function() {
        n.autoFilterFocus && n.filter && ke(n.$refs.filterInput.$el), n.autoUpdateModel();
      }, 1);
    },
    onOverlayAfterEnter: function() {
      this.bindOutsideClickListener(), this.bindScrollListener(), this.bindResizeListener(), this.$emit("show");
    },
    onOverlayLeave: function(e) {
      var n = this;
      e.style.pointerEvents = "none", this.unbindOutsideClickListener(), this.unbindScrollListener(), this.unbindResizeListener(), this.autoFilterFocus && this.filter && !this.editable && this.$nextTick(function() {
        n.$refs.filterInput && ke(n.$refs.filterInput.$el);
      }), this.$emit("hide"), this.overlay = null;
    },
    onOverlayAfterLeave: function(e) {
      Wt.clear(e);
    },
    alignOverlay: function() {
      this.appendTo === "self" ? Mi(this.overlay, this.$el) : this.overlay && (this.overlay.style.minWidth = _n(this.$el) + "px", Vi(this.overlay, this.$el));
    },
    bindOutsideClickListener: function() {
      var e = this;
      this.outsideClickListener || (this.outsideClickListener = function(n) {
        var r = n.composedPath();
        e.overlayVisible && e.overlay && !r.includes(e.$el) && !r.includes(e.overlay) && e.hide();
      }, document.addEventListener("click", this.outsideClickListener, !0));
    },
    unbindOutsideClickListener: function() {
      this.outsideClickListener && (document.removeEventListener("click", this.outsideClickListener, !0), this.outsideClickListener = null);
    },
    bindScrollListener: function() {
      var e = this;
      this.scrollHandler || (this.scrollHandler = new bs(this.$refs.container, function() {
        e.overlayVisible && e.hide();
      })), this.scrollHandler.bindScrollListener();
    },
    unbindScrollListener: function() {
      this.scrollHandler && this.scrollHandler.unbindScrollListener();
    },
    bindResizeListener: function() {
      var e = this;
      this.resizeListener || (this.resizeListener = function() {
        e.overlayVisible && !qi() && e.hide();
      }, window.addEventListener("resize", this.resizeListener));
    },
    unbindResizeListener: function() {
      this.resizeListener && (window.removeEventListener("resize", this.resizeListener), this.resizeListener = null);
    },
    bindLabelClickListener: function() {
      var e = this;
      if (!this.editable && !this.labelClickListener) {
        var n = document.querySelector('label[for="'.concat(this.labelId, '"]'));
        n && Bt(n) && (this.labelClickListener = function() {
          ke(e.$refs.focusInput);
        }, n.addEventListener("click", this.labelClickListener));
      }
    },
    unbindLabelClickListener: function() {
      if (this.labelClickListener) {
        var e = document.querySelector('label[for="'.concat(this.labelId, '"]'));
        e && Bt(e) && e.removeEventListener("click", this.labelClickListener);
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
      return Tn(this.overlay, ':not([data-p-hidden-focusable="true"])').length > 0;
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
      return F(e) && !(this.isOptionDisabled(e) || this.isOptionGroup(e));
    },
    isValidSelectedOption: function(e) {
      return this.isValidOption(e) && this.isSelected(e);
    },
    isSelected: function(e) {
      return Ot(this.d_value, this.getOptionValue(e), this.equalityKey);
    },
    findFirstOptionIndex: function() {
      var e = this;
      return this.visibleOptions.findIndex(function(n) {
        return e.isValidOption(n);
      });
    },
    findLastOptionIndex: function() {
      var e = this;
      return Dn(this.visibleOptions, function(n) {
        return e.isValidOption(n);
      });
    },
    findNextOptionIndex: function(e) {
      var n = this, r = e < this.visibleOptions.length - 1 ? this.visibleOptions.slice(e + 1).findIndex(function(i) {
        return n.isValidOption(i);
      }) : -1;
      return r > -1 ? r + e + 1 : e;
    },
    findPrevOptionIndex: function(e) {
      var n = this, r = e > 0 ? Dn(this.visibleOptions.slice(0, e), function(i) {
        return n.isValidOption(i);
      }) : -1;
      return r > -1 ? r : e;
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
      var r = this;
      this.searchValue = (this.searchValue || "") + n;
      var i = -1, o = !1;
      return F(this.searchValue) && (i = this.visibleOptions.findIndex(function(a) {
        return r.isOptionExactMatched(a);
      }), i === -1 && (i = this.visibleOptions.findIndex(function(a) {
        return r.isOptionStartsWith(a);
      })), i !== -1 && (o = !0), i === -1 && this.focusedOptionIndex === -1 && (i = this.findFirstFocusedOptionIndex()), i !== -1 && this.changeFocusedOptionIndex(e, i)), this.searchTimeout && clearTimeout(this.searchTimeout), this.searchTimeout = setTimeout(function() {
        r.searchValue = "", r.searchTimeout = null;
      }, 500), o;
    },
    changeFocusedOptionIndex: function(e, n) {
      this.focusedOptionIndex !== n && (this.focusedOptionIndex = n, this.scrollInView(), this.selectOnFocus && this.onOptionSelect(e, this.visibleOptions[n], !1));
    },
    scrollInView: function() {
      var e = this, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : -1;
      this.$nextTick(function() {
        var r = n !== -1 ? "".concat(e.$id, "_").concat(n) : e.focusedOptionId, i = Be(e.list, 'li[id="'.concat(r, '"]'));
        i ? i.scrollIntoView && i.scrollIntoView({
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
      return (e || []).reduce(function(r, i, o) {
        r.push({
          optionGroup: i,
          group: !0,
          index: o
        });
        var a = n.getOptionGroupChildren(i);
        return a && a.forEach(function(s) {
          return r.push(s);
        }), r;
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
        var r = ua.filter(n, this.searchFields, this.filterValue, this.filterMatchMode, this.filterLocale);
        if (this.optionGroupLabel) {
          var i = this.options || [], o = [];
          return i.forEach(function(a) {
            var s = e.getOptionGroupChildren(a), l = s.filter(function(u) {
              return r.includes(u);
            });
            l.length > 0 && o.push(Sr(Sr({}, a), {}, De({}, typeof e.optionGroupChildren == "string" ? e.optionGroupChildren : "items", pc(l))));
          }), this.flatOptions(o);
        }
        return r;
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
      return F(this.visibleOptions) ? this.filterMessageText.replaceAll("{0}", this.visibleOptions.length) : this.emptyFilterMessageText;
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
      return ae(De({
        invalid: this.$invalid,
        disabled: this.disabled,
        focus: this.focused,
        fluid: this.$fluid,
        filled: this.$variant === "filled"
      }, this.size, this.size));
    },
    labelDataP: function() {
      return ae(De(De({
        placeholder: !this.editable && this.label === this.placeholder,
        clearable: this.showClear,
        disabled: this.disabled,
        editable: this.editable
      }, this.size, this.size), "empty", !this.editable && !this.$slots.value && (this.label === "p-emptylabel" || this.label.length === 0)));
    },
    dropdownIconDataP: function() {
      return ae(De({}, this.size, this.size));
    },
    overlayDataP: function() {
      return ae(De({}, "portal-" + this.appendTo, "portal-" + this.appendTo));
    }
  },
  directives: {
    ripple: It
  },
  components: {
    InputText: Ut,
    VirtualScroller: wo,
    Portal: Pn,
    InputIcon: yo,
    IconField: vo,
    TimesIcon: Kt,
    ChevronDownIcon: bo,
    SpinnerIcon: Rt,
    SearchIcon: go,
    CheckIcon: zn,
    BlankIcon: mo
  }
}, yc = ["id", "data-p"], xc = ["name", "id", "value", "placeholder", "tabindex", "disabled", "aria-label", "aria-labelledby", "aria-expanded", "aria-controls", "aria-activedescendant", "aria-invalid", "data-p"], wc = ["name", "id", "tabindex", "aria-label", "aria-labelledby", "aria-expanded", "aria-controls", "aria-activedescendant", "aria-invalid", "aria-disabled", "data-p"], kc = ["data-p"], Sc = ["id"], $c = ["id"], Cc = ["id", "aria-label", "aria-selected", "aria-disabled", "aria-setsize", "aria-posinset", "onMousedown", "onMousemove", "data-p-selected", "data-p-focused", "data-p-disabled"];
function Oc(t, e, n, r, i, o) {
  var a = re("SpinnerIcon"), s = re("InputText"), l = re("SearchIcon"), u = re("InputIcon"), d = re("IconField"), c = re("CheckIcon"), p = re("BlankIcon"), f = re("VirtualScroller"), m = re("Portal"), x = Ct("ripple");
  return h(), b("div", v({
    ref: "container",
    id: t.$id,
    class: t.cx("root"),
    onClick: e[12] || (e[12] = function() {
      return o.onContainerClick && o.onContainerClick.apply(o, arguments);
    }),
    "data-p": o.containerDataP
  }, t.ptmi("root")), [t.editable ? (h(), b("input", v({
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
    "aria-expanded": i.overlayVisible,
    "aria-controls": i.overlayVisible ? t.$id + "_list" : void 0,
    "aria-activedescendant": i.focused ? o.focusedOptionId : void 0,
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
  }, t.ptm("label")), null, 16, xc)) : (h(), b("span", v({
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
    "aria-expanded": i.overlayVisible,
    "aria-controls": t.$id + "_list",
    "aria-activedescendant": i.focused ? o.focusedOptionId : void 0,
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
  }, t.ptm("label")), [A(t.$slots, "value", {
    value: t.d_value,
    placeholder: t.placeholder
  }, function() {
    var y;
    return [Ce(D(o.label === "p-emptylabel" ? " " : (y = o.label) !== null && y !== void 0 ? y : "empty"), 1)];
  })], 16, wc)), o.isClearIconVisible ? A(t.$slots, "clearicon", {
    key: 2,
    class: ne(t.cx("clearIcon")),
    clearCallback: o.onClearClick
  }, function() {
    return [(h(), K(me(t.clearIcon ? "i" : "TimesIcon"), v({
      ref: "clearIcon",
      class: [t.cx("clearIcon"), t.clearIcon],
      onClick: o.onClearClick
    }, t.ptm("clearIcon"), {
      "data-pc-section": "clearicon"
    }), null, 16, ["class", "onClick"]))];
  }) : L("", !0), C("div", v({
    class: t.cx("dropdown")
  }, t.ptm("dropdown")), [t.loading ? A(t.$slots, "loadingicon", {
    key: 0,
    class: ne(t.cx("loadingIcon"))
  }, function() {
    return [t.loadingIcon ? (h(), b("span", v({
      key: 0,
      class: [t.cx("loadingIcon"), "pi-spin", t.loadingIcon],
      "aria-hidden": "true"
    }, t.ptm("loadingIcon")), null, 16)) : (h(), K(a, v({
      key: 1,
      class: t.cx("loadingIcon"),
      spin: "",
      "aria-hidden": "true"
    }, t.ptm("loadingIcon")), null, 16, ["class"]))];
  }) : A(t.$slots, "dropdownicon", {
    key: 1,
    class: ne(t.cx("dropdownIcon"))
  }, function() {
    return [(h(), K(me(t.dropdownIcon ? "span" : "ChevronDownIcon"), v({
      class: [t.cx("dropdownIcon"), t.dropdownIcon],
      "aria-hidden": "true",
      "data-p": o.dropdownIconDataP
    }, t.ptm("dropdownIcon")), null, 16, ["class", "data-p"]))];
  })], 16), J(m, {
    appendTo: t.appendTo
  }, {
    default: ue(function() {
      return [J(Tr, v({
        name: "p-anchored-overlay",
        onEnter: o.onOverlayEnter,
        onAfterEnter: o.onOverlayAfterEnter,
        onLeave: o.onOverlayLeave,
        onAfterLeave: o.onOverlayAfterLeave
      }, t.ptm("transition")), {
        default: ue(function() {
          return [i.overlayVisible ? (h(), b("div", v({
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
          }, t.ptm("overlay")), [C("span", v({
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
          }), null, 16), A(t.$slots, "header", {
            value: t.d_value,
            options: o.visibleOptions
          }), t.filter ? (h(), b("div", v({
            key: 0,
            class: t.cx("header")
          }, t.ptm("header")), [J(d, {
            unstyled: t.unstyled,
            pt: t.ptm("pcFilterContainer")
          }, {
            default: ue(function() {
              return [J(s, {
                ref: "filterInput",
                type: "text",
                value: i.filterValue,
                onVnodeMounted: o.onFilterUpdated,
                onVnodeUpdated: o.onFilterUpdated,
                class: ne(t.cx("pcFilter")),
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
              }, null, 8, ["value", "onVnodeMounted", "onVnodeUpdated", "class", "placeholder", "variant", "unstyled", "aria-owns", "aria-activedescendant", "onKeydown", "onBlur", "onInput", "pt"]), J(u, {
                unstyled: t.unstyled,
                pt: t.ptm("pcFilterIconContainer")
              }, {
                default: ue(function() {
                  return [A(t.$slots, "filtericon", {}, function() {
                    return [t.filterIcon ? (h(), b("span", v({
                      key: 0,
                      class: t.filterIcon
                    }, t.ptm("filterIcon")), null, 16)) : (h(), K(l, Xo(v({
                      key: 1
                    }, t.ptm("filterIcon"))), null, 16))];
                  })];
                }),
                _: 3
              }, 8, ["unstyled", "pt"])];
            }),
            _: 3
          }, 8, ["unstyled", "pt"]), C("span", v({
            role: "status",
            "aria-live": "polite",
            class: "p-hidden-accessible"
          }, t.ptm("hiddenFilterResult"), {
            "data-p-hidden-accessible": !0
          }), D(o.filterResultMessageText), 17)], 16)) : L("", !0), C("div", v({
            class: t.cx("listContainer"),
            style: {
              "max-height": o.virtualScrollerDisabled ? t.scrollHeight : ""
            }
          }, t.ptm("listContainer")), [J(f, v({
            ref: o.virtualScrollerRef
          }, t.virtualScrollerOptions, {
            items: o.visibleOptions,
            style: {
              height: t.scrollHeight
            },
            tabindex: -1,
            disabled: o.virtualScrollerDisabled,
            pt: t.ptm("virtualScroller")
          }), ei({
            content: ue(function(y) {
              var w = y.styleClass, O = y.contentRef, T = y.items, g = y.getItemOptions, _ = y.contentStyle, V = y.itemSize;
              return [C("ul", v({
                ref: function(j) {
                  return o.listRef(j, O);
                },
                id: t.$id + "_list",
                class: [t.cx("list"), w],
                style: _,
                role: "listbox"
              }, t.ptm("list")), [(h(!0), b(oe, null, ye(T, function(z, j) {
                return h(), b(oe, {
                  key: o.getOptionRenderKey(z, o.getOptionIndex(j, g))
                }, [o.isOptionGroup(z) ? (h(), b("li", v({
                  key: 0,
                  id: t.$id + "_" + o.getOptionIndex(j, g),
                  style: {
                    height: V ? V + "px" : void 0
                  },
                  class: t.cx("optionGroup"),
                  role: "option"
                }, {
                  ref_for: !0
                }, t.ptm("optionGroup")), [A(t.$slots, "optiongroup", {
                  option: z.optionGroup,
                  index: o.getOptionIndex(j, g)
                }, function() {
                  return [C("span", v({
                    class: t.cx("optionGroupLabel")
                  }, {
                    ref_for: !0
                  }, t.ptm("optionGroupLabel")), D(o.getOptionGroupLabel(z.optionGroup)), 17)];
                })], 16, $c)) : Ge((h(), b("li", v({
                  key: 1,
                  id: t.$id + "_" + o.getOptionIndex(j, g),
                  class: t.cx("option", {
                    option: z,
                    focusedOption: o.getOptionIndex(j, g)
                  }),
                  style: {
                    height: V ? V + "px" : void 0
                  },
                  role: "option",
                  "aria-label": o.getOptionLabel(z),
                  "aria-selected": o.isSelected(z),
                  "aria-disabled": o.isOptionDisabled(z),
                  "aria-setsize": o.ariaSetSize,
                  "aria-posinset": o.getAriaPosInset(o.getOptionIndex(j, g)),
                  onMousedown: function(X) {
                    return o.onOptionSelect(X, z);
                  },
                  onMousemove: function(X) {
                    return o.onOptionMouseMove(X, o.getOptionIndex(j, g));
                  },
                  onClick: e[8] || (e[8] = ti(function() {
                  }, ["stop"])),
                  "data-p-selected": !t.checkmark && o.isSelected(z),
                  "data-p-focused": i.focusedOptionIndex === o.getOptionIndex(j, g),
                  "data-p-disabled": o.isOptionDisabled(z)
                }, {
                  ref_for: !0
                }, o.getPTItemOptions(z, g, j, "option")), [t.checkmark ? (h(), b(oe, {
                  key: 0
                }, [o.isSelected(z) ? (h(), K(c, v({
                  key: 0,
                  class: t.cx("optionCheckIcon")
                }, {
                  ref_for: !0
                }, t.ptm("optionCheckIcon")), null, 16, ["class"])) : (h(), K(p, v({
                  key: 1,
                  class: t.cx("optionBlankIcon")
                }, {
                  ref_for: !0
                }, t.ptm("optionBlankIcon")), null, 16, ["class"]))], 64)) : L("", !0), A(t.$slots, "option", {
                  option: z,
                  selected: o.isSelected(z),
                  index: o.getOptionIndex(j, g)
                }, function() {
                  return [C("span", v({
                    class: t.cx("optionLabel")
                  }, {
                    ref_for: !0
                  }, t.ptm("optionLabel")), D(o.getOptionLabel(z)), 17)];
                })], 16, Cc)), [[x]])], 64);
              }), 128)), i.filterValue && (!T || T && T.length === 0) ? (h(), b("li", v({
                key: 0,
                class: t.cx("emptyMessage"),
                role: "option"
              }, t.ptm("emptyMessage"), {
                "data-p-hidden-accessible": !0
              }), [A(t.$slots, "emptyfilter", {}, function() {
                return [Ce(D(o.emptyFilterMessageText), 1)];
              })], 16)) : !t.options || t.options && t.options.length === 0 ? (h(), b("li", v({
                key: 1,
                class: t.cx("emptyMessage"),
                role: "option"
              }, t.ptm("emptyMessage"), {
                "data-p-hidden-accessible": !0
              }), [A(t.$slots, "empty", {}, function() {
                return [Ce(D(o.emptyMessageText), 1)];
              })], 16)) : L("", !0)], 16, Sc)];
            }),
            _: 2
          }, [t.$slots.loader ? {
            name: "loader",
            fn: ue(function(y) {
              var w = y.options;
              return [A(t.$slots, "loader", {
                options: w
              })];
            }),
            key: "0"
          } : void 0]), 1040, ["items", "style", "disabled", "pt"])], 16), A(t.$slots, "footer", {
            value: t.d_value,
            options: o.visibleOptions
          }), !t.options || t.options && t.options.length === 0 ? (h(), b("span", v({
            key: 1,
            role: "status",
            "aria-live": "polite",
            class: "p-hidden-accessible"
          }, t.ptm("hiddenEmptyMessage"), {
            "data-p-hidden-accessible": !0
          }), D(o.emptyMessageText), 17)) : L("", !0), C("span", v({
            role: "status",
            "aria-live": "polite",
            class: "p-hidden-accessible"
          }, t.ptm("hiddenSelectedMessage"), {
            "data-p-hidden-accessible": !0
          }), D(o.selectedMessageText), 17), C("span", v({
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
          }), null, 16)], 16, kc)) : L("", !0)];
        }),
        _: 3
      }, 16, ["onEnter", "onAfterEnter", "onLeave", "onAfterLeave"])];
    }),
    _: 3
  }, 8, ["appendTo"])], 16, yc);
}
ko.render = Oc;
function Ic(t) {
  if (!t) return null;
  let e;
  if (typeof t == "number")
    e = t;
  else {
    const n = t.trim();
    if (/^\d+$/.test(n))
      e = Number(n);
    else {
      const r = Date.parse(n);
      return Number.isNaN(r) ? null : r;
    }
  }
  return Number.isFinite(e) ? e < 1e12 ? e * 1e3 : e : null;
}
function So(t, e) {
  const n = Ic(t);
  if (n === null) return "";
  const r = e?.now ?? Date.now(), i = e?.suffix ?? !0, o = e?.maxUnit ?? "day", a = e?.future ?? !1, s = 6e4, l = 60 * s, u = 24 * l, d = 30 * u, c = 365 * u, p = r - n;
  if (a && p < 0) {
    const x = -p;
    return x < s ? "in <1m" : x < l ? `in ${Math.floor(x / s)}m` : x < u ? `in ${Math.floor(x / l)}h` : `in ${Math.floor(x / u)}d`;
  }
  const f = Math.max(0, p);
  if (f < s) return "just now";
  const m = i ? " ago" : "";
  return f < l ? `${Math.floor(f / s)}m${m}` : f < u ? `${Math.floor(f / l)}h${m}` : o === "year" ? f < d ? `${Math.floor(f / u)}d${m}` : f < c ? `${Math.floor(f / d)}mo${m}` : `${Math.floor(f / c)}y${m}` : `${Math.floor(f / u)}d${m}`;
}
function _c(t) {
  const e = t || "";
  return e.startsWith("image/") ? "tabler:photo" : e === "application/pdf" ? "tabler:file-type-pdf" : e.includes("word") || e.includes("opendocument.text") || e === "application/rtf" ? "tabler:file-type-doc" : e.includes("sheet") || e.includes("excel") || e.includes("spreadsheet") || e === "text/csv" ? "tabler:file-type-xls" : e.includes("presentation") || e.includes("powerpoint") ? "tabler:file-type-ppt" : e === "application/epub+zip" ? "tabler:book" : e.startsWith("text/") || e === "application/json" || e === "application/xml" ? "tabler:file-text" : "tabler:file";
}
function Tc(t) {
  if (!t) return "0 B";
  const e = ["B", "KB", "MB", "GB"], n = Math.min(Math.floor(Math.log(t) / Math.log(1024)), e.length - 1);
  return `${(t / Math.pow(1024, n)).toFixed(n ? 1 : 0)} ${e[n]}`;
}
function He(t, e) {
  if (t && typeof t == "object") {
    const n = t, r = n.response?.data?.error;
    if (typeof r == "string") return r;
    if (r && typeof r == "object" && typeof r.message == "string")
      return r.message;
    if (typeof n.message == "string" && n.message) return n.message;
  }
  return e;
}
function Me(t) {
  return t !== null && typeof t == "object" && !Array.isArray(t);
}
function kn(t) {
  return Me(t) ? ["id", "item_type", "title", "priority", "status"].every((e) => typeof t[e] == "string") && ["content", "action", "file_version"].every((e) => t[e] === void 0 || typeof t[e] == "string") && ["created_at", "resolved_at"].every((e) => t[e] === void 0 || typeof t[e] == "number") && (t.file_count === void 0 || Number.isInteger(t.file_count) && Number(t.file_count) >= 0) && (t.files === void 0 || Array.isArray(t.files) && t.files.every((e) => Me(e) && typeof e.locked == "boolean" && ["filename", "content_type", "view_url"].every((n) => e[n] === void 0 || typeof e[n] == "string") && (e.size === void 0 || typeof e.size == "number" && Number.isFinite(e.size) && e.size >= 0))) && ["metadata", "form"].every((e) => t[e] === void 0 || Me(t[e])) : !1;
}
const Pc = {
  class: "kx-files",
  "aria-label": "Attached files"
}, Lc = {
  key: 0,
  role: "status"
}, Ac = { key: 1 }, zc = { role: "alert" }, Ec = { class: "kx-file-list" }, Bc = {
  key: 0,
  class: "kx-file-row kx-file-locked",
  "data-testid": "inbox-file-locked"
}, jc = { class: "kx-file-row" }, Vc = { class: "kx-file-label" }, Dc = { class: "kx-file-name" }, Mc = {
  key: 0,
  class: "kx-file-size"
}, Nc = ["href"], Fc = { class: "kx-sr-only" }, Rc = {
  key: 0,
  class: "kx-file-preview"
}, Kc = {
  key: 0,
  role: "status"
}, Uc = {
  key: 1,
  role: "alert"
}, Hc = ["content-type", "filename", "source-url"], Wc = /* @__PURE__ */ Cn({
  __name: "ItemFiles",
  props: {
    itemId: {},
    files: {},
    count: {},
    version: {}
  },
  setup(t) {
    const e = t, n = W([]), r = W(!1), i = W("");
    let o = 0;
    const a = W(null), s = W(!1), l = W("");
    async function u() {
      const p = ++o;
      if (a.value = null, n.value = e.files || [], i.value = "", r.value = !1, e.files === void 0) {
        r.value = !0;
        try {
          const { data: f } = await Ke.get(
            `/api/v1/inbox?id=${encodeURIComponent(e.itemId)}&status=all&limit=1`
          );
          if (p !== o) return;
          const m = f?.items?.[0];
          if (!f?.success || !kn(m) || m.id !== e.itemId) throw new Error("Attached files are unavailable");
          n.value = m.files || [];
        } catch (f) {
          p === o && (i.value = He(f, "Attached files are unavailable"));
        } finally {
          p === o && (r.value = !1);
        }
      }
    }
    Pe(() => [e.itemId, e.files, e.count, e.version], () => {
      u();
    }, { immediate: !0 }), Nt(() => {
      o += 1;
    });
    function d(p) {
      if (p)
        return /^(https?:\/\/|\/(?!\/))/i.test(p) ? p : void 0;
    }
    async function c(p) {
      if (a.value === p) {
        a.value = null;
        return;
      }
      a.value = p, s.value = !0, l.value = "";
      try {
        await Yt("wc-resource-view", { timeoutMs: 8e3 });
      } catch (f) {
        l.value = f instanceof Error ? f.message : String(f);
      } finally {
        s.value = !1;
      }
    }
    return (p, f) => (h(), b("section", Pc, [
      f[2] || (f[2] = C("h3", null, "Files", -1)),
      r.value ? (h(), b("p", Lc, "Loading attached files…")) : i.value ? (h(), b("div", Ac, [
        C("p", zc, D(i.value), 1),
        J(H(Ye), {
          type: "button",
          size: "small",
          text: "",
          severity: "secondary",
          label: "Retry files",
          onClick: u
        })
      ])) : L("", !0),
      C("ul", Ec, [
        (h(!0), b(oe, null, ye(n.value, (m, x) => (h(), b("li", { key: x }, [
          m.locked ? (h(), b("div", Bc, [
            J(H(qe), {
              icon: "tabler:lock",
              "aria-hidden": "true"
            }),
            f[0] || (f[0] = C("span", null, "Locked file", -1))
          ])) : (h(), b(oe, { key: 1 }, [
            C("div", jc, [
              J(H(qe), {
                icon: H(_c)(m.content_type || ""),
                "aria-hidden": "true"
              }, null, 8, ["icon"]),
              C("div", Vc, [
                C("span", Dc, D(m.filename || "File"), 1),
                m.size !== void 0 ? (h(), b("span", Mc, D(H(Tc)(m.size)), 1)) : L("", !0)
              ]),
              J(H(Ye), {
                type: "button",
                size: "small",
                text: "",
                severity: "secondary",
                "data-testid": "inbox-file-preview",
                label: a.value === x ? "Close preview" : "Preview",
                "aria-expanded": a.value === x,
                onClick: (y) => c(x)
              }, null, 8, ["label", "aria-expanded", "onClick"]),
              d(m.view_url) ? (h(), b("a", {
                key: 0,
                href: d(m.view_url),
                target: "_blank",
                rel: "noopener noreferrer",
                "data-testid": "inbox-file-open"
              }, [
                f[1] || (f[1] = Ce("Open", -1)),
                C("span", Fc, D(m.filename || "file"), 1)
              ], 8, Nc)) : L("", !0)
            ]),
            a.value === x ? (h(), b("div", Rc, [
              s.value ? (h(), b("p", Kc, "Loading preview…")) : l.value ? (h(), b("p", Uc, D(l.value), 1)) : (h(), b("wc-resource-view", {
                key: 2,
                "content-type": m.content_type || "",
                filename: m.filename || "",
                "source-url": `/api/v1/inbox/${encodeURIComponent(e.itemId)}/files/${x + 1}`
              }, null, 8, Hc))
            ])) : L("", !0)
          ], 64))
        ]))), 128))
      ])
    ]));
  }
}), $r = {
  item_count: "integer",
  pending_count: "integer",
  resolved_count: "integer",
  urgent_count: "integer",
  high_count: "integer"
}, Gc = {
  pending: "Pending",
  resolved: "Resolved",
  approved: "Approved",
  rejected: "Rejected",
  dismissed: "Dismissed"
};
function Sn(t) {
  const e = t || "";
  return Gc[e] || e;
}
function qc(t) {
  const e = (t || "").trim();
  return e ? e.replace(/[._-]+/g, " ").replace(/\b\w/g, (n) => n.toUpperCase()) : "";
}
const Yc = 80;
function En(t) {
  const e = t.replace(/[_-]+/g, " ").trim();
  return e ? e.split(" ").map((n) => n && n[0].toUpperCase() + n.slice(1)).join(" ") : t;
}
function Cr(t) {
  return t == null ? "" : typeof t == "string" ? t : typeof t == "number" || typeof t == "boolean" ? String(t) : JSON.stringify(t, null, 2);
}
function Or(t) {
  if (t == null || t === "") return { kind: "empty" };
  if (typeof t == "string") return { kind: "text", text: t };
  if (typeof t == "object" && !Array.isArray(t)) {
    const e = Object.entries(t).map(([n, r]) => {
      const i = Cr(r);
      return { key: n, label: En(n), value: i, long: i.length > Yc || i.includes(`
`) };
    });
    return e.length ? { kind: "rows", rows: e } : { kind: "empty" };
  }
  return { kind: "text", text: Cr(t) };
}
function $o(t) {
  return typeof t == "string" || typeof t == "number" || typeof t == "boolean";
}
function Zc(t, e, n) {
  const r = e.default;
  return t === "checkbox" ? typeof r == "boolean" ? r : void 0 : t === "number" ? typeof r != "number" || !Number.isFinite(r) || e.type === "integer" && !Number.isInteger(r) ? void 0 : r : t === "select" ? $o(r) && n.includes(r) ? r : void 0 : typeof r == "string" ? r : void 0;
}
function Jc(t) {
  return Array.isArray(t.enum) ? "select" : t.type === "number" || t.type === "integer" ? "number" : t.type === "boolean" ? "checkbox" : t.type === "string" ? t.format === "textarea" ? "textarea" : "text" : null;
}
function Qc(t) {
  if (t && typeof t == "object" && !Array.isArray(t)) {
    const e = t, n = e.properties;
    if (!n || typeof n != "object" || Array.isArray(n)) return [];
    const r = new Set(Array.isArray(e.required) ? e.required.filter((i) => typeof i == "string") : []);
    return Object.entries(n).flatMap(([i, o]) => {
      if (!o || typeof o != "object" || Array.isArray(o)) return [];
      const a = o, s = Jc(a);
      if (!s) return [];
      const l = s === "select" && Array.isArray(a.enum) ? a.enum.filter($o) : [], u = Zc(s, a, l);
      return [{
        key: i,
        label: typeof a.title == "string" && a.title ? a.title : En(i),
        type: s,
        required: r.has(i),
        options: l,
        ...u === void 0 ? {} : { default: u }
      }];
    });
  }
  return [];
}
function Xc(t) {
  const e = {};
  for (const n of t) e[n.key] = n.default ?? (n.type === "checkbox" ? !1 : "");
  return e;
}
function ep(t, e) {
  return t.some((n) => {
    if (!n.required) return !1;
    const r = e[n.key];
    return n.type === "checkbox" ? r !== !0 : r == null || String(r).trim() === "";
  });
}
const tp = { class: "kx-detail" }, np = { class: "kx-detail-head" }, rp = { class: "kx-detail-title-block" }, op = { class: "kx-detail-title" }, ip = { class: "kx-detail-meta" }, ap = ["title"], sp = { class: "kx-detail-body" }, lp = {
  key: 1,
  class: "kx-native-body"
}, up = ["source"], dp = ["source"], cp = {
  key: 2,
  class: "kx-fields"
}, pp = ["source"], fp = { key: 4 }, hp = {
  key: 0,
  "data-testid": "decision-outcome"
}, mp = {
  key: 1,
  "data-testid": "decision-submitted-form",
  class: "kx-fields"
}, bp = {
  key: 5,
  class: "kx-decision-form"
}, gp = {
  key: 0,
  class: "kx-checkbox-row"
}, vp = ["for"], yp = {
  key: 0,
  class: "kx-required"
}, xp = ["for"], wp = {
  key: 0,
  class: "kx-required"
}, kp = {
  key: 0,
  class: "kx-form-hint"
}, Sp = {
  key: 2,
  class: "kx-native-body"
}, $p = ["source"], Cp = {
  key: 1,
  class: "kx-fields"
}, Op = { class: "kx-detail-foot" }, Ip = { class: "kx-resolved" }, _p = { key: 0 }, Tp = /* @__PURE__ */ Cn({
  __name: "InboxItem",
  props: {
    item: {},
    tag: {},
    icon: {},
    typeLabel: {},
    actions: {},
    actionOwner: {},
    resolving: { type: Boolean },
    resolvingAction: {}
  },
  emits: ["resolve", "delete"],
  setup(t, { emit: e }) {
    const n = t, r = e, i = W(null), o = W(!1);
    let a = null;
    const s = he(() => n.item.status === "pending"), l = { approve: "Approve", reject: "Reject", dismiss: "Dismiss" }, u = he(() => (Array.isArray(n.actions) ? n.actions : []).filter((E) => typeof E == "string" && E.length > 0));
    function d(S) {
      const E = n.item.metadata;
      return S === "approve" && typeof E?.approve_label == "string" && E.approve_label ? E.approve_label : S === "reject" && typeof E?.reject_label == "string" && E.reject_label ? E.reject_label : l[S] || En(S);
    }
    const c = he(() => {
      const S = n.item.metadata?.fields;
      return Array.isArray(S) ? S.map((E) => ({ label: String(E.label ?? E.key ?? ""), value: E.value })) : [];
    }), p = he(() => n.item.item_type === "flow_decision"), f = he(() => {
      const S = n.item.metadata?.prompt;
      return typeof S == "string" && S !== n.item.title ? S : "";
    }), m = he(() => p.value ? Or(n.item.metadata?.context) : { kind: "empty" }), x = he(() => p.value ? Qc(n.item.metadata?.form) : []), y = he(() => {
      const S = Or(n.item.form);
      return S.kind !== "rows" ? [] : S.rows.map((E) => ({ ...E, label: x.value.find(($) => $.key === E.key)?.label || E.label }));
    }), w = W(Xc(x.value)), O = he(() => !ep(x.value, w.value));
    function T(S) {
      return s.value && (S !== "approve" || O.value);
    }
    function g(S) {
      return typeof S == "string" ? S : void 0;
    }
    function _(S) {
      return typeof S == "number" ? S : void 0;
    }
    function V(S) {
      if (n.resolving || !T(S)) return;
      const E = { id: n.item.id, action: S };
      x.value.length && (E.form = { ...w.value }), r("resolve", E);
    }
    const z = he(() => n.typeLabel || qc(n.item.item_type));
    function j(S) {
      return S ? new Date(S * 1e3).toLocaleString() : "";
    }
    function Y(S) {
      return So(S, { maxUnit: "year" });
    }
    function X(S) {
      return `kx-priority-${S === "urgent" || S === "high" || S === "low" ? S : "normal"}`;
    }
    function U(S) {
      return S === "urgent" ? "danger" : S === "high" ? "warn" : S === "low" ? "secondary" : "info";
    }
    function Z(S) {
      const E = S.detail;
      E?.id && E?.action && r("resolve", E);
    }
    function Q() {
      a && (a.removeEventListener("inbox-resolve", Z), a = null);
    }
    async function te() {
      if (!(!n.tag || !i.value)) {
        Q();
        try {
          await Yt(n.tag, { timeoutMs: 8e3 });
          const S = document.createElement(n.tag);
          S.style.display = "block", S.style.height = "100%", S.setAttribute("item-id", n.item.id), S.setAttribute("content", n.item.content || ""), n.item.metadata && S.setAttribute("data-meta", JSON.stringify(n.item.metadata)), S.addEventListener("inbox-resolve", Z), i.value.innerHTML = "", i.value.appendChild(S), a = S;
        } catch {
          o.value = !0;
        }
      }
    }
    return $n(() => {
      Yt("wc-render-markdown", { timeoutMs: 8e3 }).catch(() => {
      }), te();
    }), Nt(Q), Pe(() => [n.tag, n.item.id], () => {
      o.value = !1, te();
    }), (S, E) => (h(), b("div", tp, [
      C("header", np, [
        C("div", {
          class: ne(["kx-detail-icon", X(t.item.priority)])
        }, [
          J(H(qe), {
            icon: t.icon || "tabler:inbox",
            "aria-hidden": "true"
          }, null, 8, ["icon"])
        ], 2),
        C("div", rp, [
          C("h2", op, D(t.item.title), 1),
          C("div", ip, [
            J(H(Mt), {
              severity: U(t.item.priority),
              value: t.item.priority,
              class: "kx-pill kx-tag-sm"
            }, null, 8, ["severity", "value"]),
            C("span", null, D(z.value), 1),
            C("span", {
              title: j(t.item.created_at)
            }, D(Y(t.item.created_at)), 9, ap),
            s.value ? L("", !0) : (h(), K(H(Mt), {
              key: 0,
              severity: "secondary",
              value: H(Sn)(t.item.status),
              class: "kx-pill kx-tag-sm"
            }, null, 8, ["value"]))
          ])
        ])
      ]),
      C("div", sp, [
        t.tag && !o.value ? (h(), b("div", {
          key: 0,
          ref_key: "host",
          ref: i,
          class: "kx-wc-host"
        }, null, 512)) : p.value ? (h(), b("div", lp, [
          f.value ? (h(), b("wc-render-markdown", {
            key: 0,
            class: "kx-md",
            source: f.value
          }, null, 8, up)) : L("", !0),
          m.value.kind === "text" ? (h(), b("wc-render-markdown", {
            key: 1,
            class: "kx-md",
            source: m.value.text
          }, null, 8, dp)) : m.value.kind === "rows" ? (h(), b("dl", cp, [
            (h(!0), b(oe, null, ye(m.value.rows, ($) => (h(), b("div", {
              key: $.key,
              class: "kx-field-row"
            }, [
              C("dt", null, D($.label), 1),
              C("dd", {
                class: ne({ "kx-field-long": $.long })
              }, D($.value), 3)
            ]))), 128))
          ])) : t.item.content ? (h(), b("wc-render-markdown", {
            key: 3,
            class: "kx-md",
            source: t.item.content
          }, null, 8, pp)) : L("", !0),
          s.value ? x.value.length ? (h(), b("div", bp, [
            (h(!0), b(oe, null, ye(x.value, ($) => (h(), b("div", {
              key: $.key,
              class: "kx-form-field"
            }, [
              $.type === "checkbox" ? (h(), b("div", gp, [
                J(H(uo), {
                  modelValue: w.value[$.key],
                  "onUpdate:modelValue": (k) => w.value[$.key] = k,
                  binary: "",
                  "input-id": `kx-df-${$.key}`,
                  "data-testid": `decision-${$.key}`
                }, null, 8, ["modelValue", "onUpdate:modelValue", "input-id", "data-testid"]),
                C("label", {
                  for: `kx-df-${$.key}`
                }, [
                  Ce(D($.label), 1),
                  $.required ? (h(), b("span", yp, "*")) : L("", !0)
                ], 8, vp)
              ])) : (h(), b(oe, { key: 1 }, [
                C("label", {
                  class: "kx-form-label",
                  for: `kx-df-${$.key}`
                }, [
                  Ce(D($.label), 1),
                  $.required ? (h(), b("span", wp, "*")) : L("", !0)
                ], 8, xp),
                $.type === "text" ? (h(), K(H(Ut), {
                  key: 0,
                  id: `kx-df-${$.key}`,
                  "model-value": g(w.value[$.key]),
                  "data-testid": `decision-${$.key}`,
                  "onUpdate:modelValue": (k) => w.value[$.key] = k
                }, null, 8, ["id", "model-value", "data-testid", "onUpdate:modelValue"])) : $.type === "textarea" ? (h(), K(H(ho), {
                  key: 1,
                  id: `kx-df-${$.key}`,
                  "model-value": g(w.value[$.key]),
                  "data-testid": `decision-${$.key}`,
                  rows: "8",
                  "auto-resize": "",
                  "onUpdate:modelValue": (k) => w.value[$.key] = k
                }, null, 8, ["id", "model-value", "data-testid", "onUpdate:modelValue"])) : $.type === "number" ? (h(), K(H(fo), {
                  key: 2,
                  "model-value": _(w.value[$.key]),
                  "input-id": `kx-df-${$.key}`,
                  "data-testid": `decision-${$.key}`,
                  "onUpdate:modelValue": (k) => w.value[$.key] = k
                }, null, 8, ["model-value", "input-id", "data-testid", "onUpdate:modelValue"])) : (h(), K(H(ko), {
                  key: 3,
                  modelValue: w.value[$.key],
                  "onUpdate:modelValue": (k) => w.value[$.key] = k,
                  options: $.options,
                  "input-id": `kx-df-${$.key}`,
                  "data-testid": `decision-${$.key}`,
                  placeholder: "Choose…"
                }, null, 8, ["modelValue", "onUpdate:modelValue", "options", "input-id", "data-testid"]))
              ], 64))
            ]))), 128)),
            O.value ? L("", !0) : (h(), b("p", kp, "Fill in the required fields to approve."))
          ])) : L("", !0) : (h(), b("div", fp, [
            t.item.action ? (h(), b("p", hp, "Outcome: " + D(d(t.item.action)), 1)) : L("", !0),
            y.value.length ? (h(), b("dl", mp, [
              (h(!0), b(oe, null, ye(y.value, ($) => (h(), b("div", {
                key: $.key,
                class: "kx-field-row"
              }, [
                C("dt", null, D($.label), 1),
                C("dd", {
                  class: ne({ "kx-field-long": $.long })
                }, D($.value), 3)
              ]))), 128))
            ])) : L("", !0)
          ]))
        ])) : (h(), b("div", Sp, [
          t.item.content ? (h(), b("wc-render-markdown", {
            key: 0,
            class: "kx-md",
            source: t.item.content
          }, null, 8, $p)) : L("", !0),
          c.value.length ? (h(), b("dl", Cp, [
            (h(!0), b(oe, null, ye(c.value, ($, k) => (h(), b("div", {
              key: k,
              class: "kx-field-row"
            }, [
              C("dt", null, D($.label), 1),
              C("dd", null, D($.value), 1)
            ]))), 128))
          ])) : L("", !0)
        ])),
        t.item.file_count || t.item.files?.length ? (h(), K(Wc, {
          key: t.item.id,
          "item-id": t.item.id,
          files: t.item.files,
          count: t.item.file_count,
          version: t.item.file_version
        }, null, 8, ["item-id", "files", "count", "version"])) : L("", !0)
      ]),
      C("footer", Op, [
        s.value && t.actionOwner !== "component" ? (h(!0), b(oe, { key: 0 }, ye(u.value, ($, k) => (h(), K(H(Ye), {
          key: $,
          type: "button",
          class: "kx-detail-action",
          "data-testid": "inbox-action",
          severity: k === 0 ? void 0 : "secondary",
          outlined: k !== 0,
          label: t.resolving && t.resolvingAction === $ ? "Resolving…" : d($),
          loading: t.resolving && t.resolvingAction === $,
          disabled: t.resolving || !T($),
          onClick: (P) => V($)
        }, null, 8, ["severity", "outlined", "label", "loading", "disabled", "onClick"]))), 128)) : s.value ? L("", !0) : (h(), b(oe, { key: 1 }, [
          C("span", Ip, [
            Ce(D(H(Sn)(t.item.status)), 1),
            t.item.resolved_at ? (h(), b("span", _p, " · " + D(j(t.item.resolved_at)), 1)) : L("", !0)
          ]),
          J(H(Ye), {
            class: "kx-detail-action",
            type: "button",
            "data-testid": "inbox-delete",
            label: "Delete",
            severity: "secondary",
            outlined: "",
            onClick: E[0] || (E[0] = ($) => r("delete", t.item.id))
          }, {
            icon: ue(({ class: $ }) => [
              J(H(qe), {
                icon: "tabler:trash",
                class: ne($)
              }, null, 8, ["class"])
            ]),
            _: 1
          })
        ], 64))
      ])
    ]));
  }
});
function Xe(t) {
  return !!t && typeof t == "object" && !Array.isArray(t);
}
function Pp(t, e) {
  if (e == null) return e;
  switch (t) {
    case "boolean":
    case "checkbox":
      return typeof e == "boolean" ? e : e === "true" ? !0 : e === "false" ? !1 : e;
    case "number":
    case "integer": {
      if (typeof e == "number") return e;
      if (typeof e == "string" && e.trim() !== "") {
        const n = Number(e);
        if (!Number.isNaN(n)) return n;
      }
      return e;
    }
    case "object":
    case "array":
      if (typeof e == "string")
        try {
          const n = JSON.parse(e);
          if (n && typeof n == "object") return n;
        } catch {
        }
      return e;
    default:
      return e;
  }
}
function Lp(t, e) {
  if (!e) return t;
  const n = {};
  for (const [r, i] of Object.entries(t))
    n[r] = Pp(e[r], i);
  return n;
}
function Ap(t, e, n) {
  if (e !== void 0 && !e) return null;
  const r = Xe(t) ? t : {}, i = [
    r,
    Xe(r.data) ? r.data : null,
    Xe(r.payload) ? r.payload : null,
    Xe(r.detail) ? r.detail : null
  ].filter(Boolean);
  for (const o of i) {
    if (o.event !== "component.meta.changed") continue;
    const a = String(o.component_id || ""), s = String(r.topic || o.topic || "");
    if (e === void 0) {
      if (!a && (!s.startsWith("component.") || s === "component.")) continue;
    } else if (a && a !== e || !a && s !== `component.${e}`) continue;
    return {
      event: "component.meta.changed",
      component_id: a || e || s.slice(10),
      meta: Lp(Xe(o.meta) ? o.meta : {}, n),
      deleted: Array.isArray(o.deleted) ? o.deleted.map(String) : []
    };
  }
  return null;
}
function zp(t, e, n) {
  if (!t) return null;
  const r = ai(`component.${t}`, (i) => {
    const o = Ap(i, t, n);
    o && e(o);
  });
  return typeof r == "function" ? r : null;
}
const Ep = { class: "kx-inbox" }, Bp = { class: "kx-head-bar" }, jp = { class: "kx-head-row" }, Vp = { class: "kx-head-icon" }, Dp = { class: "kx-head-text" }, Mp = { class: "kx-sub" }, Np = { class: "kx-head-actions" }, Fp = { class: "kx-shell" }, Rp = { class: "kx-list-pane" }, Kp = {
  key: 0,
  class: "kx-loading"
}, Up = {
  key: 1,
  class: "kx-list-empty"
}, Hp = ["onClick"], Wp = { class: "kx-item-main" }, Gp = { class: "kx-item-line" }, qp = ["title"], Yp = ["source"], Zp = { class: "kx-detail-pane" }, Jp = {
  key: 0,
  class: "kx-detail-empty"
}, Qp = {
  key: 1,
  class: "kx-detail-card"
}, Xp = /* @__PURE__ */ Cn({
  __name: "inbox",
  setup(t) {
    const e = [
      { key: "pending", label: "Pending", icon: "tabler:clock" },
      { key: "resolved", label: "Resolved", icon: "tabler:checks" },
      { key: "all", label: "All", icon: "tabler:inbox" }
    ], n = W([]), r = W({}), i = W(0), o = W({}), a = W(!0), s = W(""), l = W("pending"), u = W(""), d = W(""), c = W("");
    let p = null, f = "", m = 0, x = !1;
    const y = /* @__PURE__ */ new Map();
    let w = 0;
    const O = he(() => n.value.find((k) => k.id === u.value) || null), T = (k) => o.value[k], g = (k, P) => Object.prototype.hasOwnProperty.call(k, P), _ = he(() => l.value === "pending" ? Number(r.value.pending_count ?? i.value ?? n.value.length) : l.value === "resolved" ? Number(r.value.resolved_count ?? i.value ?? n.value.length) : l.value === "all" ? Number(r.value.item_count ?? i.value ?? n.value.length) : Number(i.value || n.value.length));
    function V(k) {
      return `kx-priority-${k === "urgent" || k === "high" || k === "low" ? k : "normal"}`;
    }
    function z(k) {
      const P = {};
      for (const I of Object.keys($r)) {
        const q = k[I];
        g(k, I) && typeof q == "number" && (P[I] = q);
      }
      Object.keys(P).length && (r.value = { ...r.value, ...P });
    }
    function j(k) {
      return So(k, { suffix: !1 });
    }
    function Y(k) {
      return k ? new Date(k * 1e3).toLocaleString() : "";
    }
    async function X() {
      try {
        const { data: k } = await Ke.get("/api/v1/inbox/item-types"), P = {};
        if (Me(k) && Array.isArray(k.item_types))
          for (const I of k.item_types)
            Me(I) && typeof I.value == "string" && typeof I.name == "string" && (I.icon === void 0 || typeof I.icon == "string") && (I.component_tag === void 0 || typeof I.component_tag == "string") && (I.actions === void 0 || Array.isArray(I.actions) && I.actions.every((q) => typeof q == "string")) && (I.action_owner === void 0 || I.action_owner === "component") && (P[I.value] = { value: I.value, name: I.name, icon: I.icon, component_tag: I.component_tag, actions: I.actions, action_owner: I.action_owner });
        o.value = P;
      } catch (k) {
        s.value = He(k, "Could not load inbox item types.");
      }
    }
    function U(k) {
      return l.value === "all" || (l.value === "resolved" ? k.status !== "pending" : k.status === l.value);
    }
    function Z(k, P, I, q = !0) {
      if (q)
        for (const ee of k)
          ee.status !== "pending" && y.delete(ee.id);
      y.size || (w = 0);
      const pe = new Map(k.map((ee) => [ee.id, ee]));
      for (const ee of y.values()) {
        const Ve = pe.has(ee.id);
        U(ee) ? (pe.set(ee.id, ee), Ve || (I += 1)) : pe.delete(ee.id) && (I -= 1);
      }
      const je = { urgent: 4, high: 3, normal: 2, low: 1 };
      n.value = [...pe.values()].sort((ee, Ve) => (je[Ve.priority] || 0) - (je[ee.priority] || 0) || (Ve.created_at || 0) - (ee.created_at || 0));
      const Ie = Math.min(P.item_count || 0, Math.max(P.resolved_count || 0, w));
      r.value = { ...P, resolved_count: Ie, pending_count: (P.item_count || 0) - Ie }, i.value = I, n.value.some((ee) => ee.id === u.value) || (u.value = n.value[0]?.id || "");
    }
    async function Q() {
      if (x) return;
      const k = ++m;
      s.value = "";
      try {
        const { data: P } = await Ke.get("/api/v1/inbox?status=" + encodeURIComponent(l.value));
        if (k !== m || x) return;
        if (!Me(P) || !Array.isArray(P.items) || !P.items.every(kn))
          throw new Error("Invalid inbox list response.");
        if (typeof P.component_id == "string" && $(P.component_id)) {
          await Q();
          return;
        }
        Z(P.items, {
          item_count: Number(P.item_count ?? 0),
          pending_count: Number(P.pending_count ?? 0),
          resolved_count: Number(P.resolved_count ?? 0),
          urgent_count: Number(P.urgent_count ?? 0),
          high_count: Number(P.high_count ?? 0)
        }, Number(P.total_count ?? P.items.length));
      } catch (P) {
        k === m && !x && (s.value = He(P, "Could not load the inbox."));
      } finally {
        k === m && !x && (a.value = !1);
      }
    }
    Pe(l, () => {
      u.value = "", Q();
    });
    async function te(k) {
      s.value = "", d.value = k.id, c.value = k.action;
      const P = r.value.resolved_count || 0;
      try {
        const I = k.form ? { form: k.form } : void 0, { data: q } = await Ke.post(`/api/v1/inbox/${encodeURIComponent(k.id)}/${encodeURIComponent(k.action)}`, I);
        if (x) return;
        if (!Me(q) || q.success !== !0 || !kn(q.item) || q.item.id !== k.id || q.item.status === "pending" || q.item.action !== k.action)
          throw new Error("Invalid inbox resolution response.");
        ++m, y.set(k.id, q.item), w = Math.max(w + 1, P + 1), Z(n.value, r.value, i.value, !1), await Q();
      } catch (I) {
        s.value = He(I, "Could not resolve this item.");
      } finally {
        d.value = "", c.value = "";
      }
    }
    async function S(k) {
      s.value = "";
      try {
        await Ke.delete(`/api/v1/inbox/${encodeURIComponent(k)}`), y.delete(k), y.size || (w = 0), u.value === k && (u.value = ""), await Q();
      } catch (P) {
        s.value = He(P, "Could not delete this item.");
      }
    }
    async function E() {
      try {
        await Ke.post("/api/v1/inbox", {
          item_type: "notice",
          title: "Test notice " + (/* @__PURE__ */ new Date()).toLocaleTimeString(),
          content: "Created to exercise the realtime round-trip.",
          priority: "high"
        });
      } catch (k) {
        s.value = He(k, "Could not create the test notice.");
      }
    }
    function $(k) {
      if (!k || f === k) return !1;
      if (p && p(), p = null, f = "", p = zp(k, (P) => {
        z(P.meta), Q();
      }, $r), !p) throw new Error("Could not subscribe to the inbox.");
      return f = k, !0;
    }
    return xi(async () => {
      await Promise.all([X(), Q()]);
    }), Nt(() => {
      x = !0, ++m, y.clear(), p && p(), p = null, f = "";
    }), (k, P) => (h(), b("div", Ep, [
      C("header", Bp, [
        C("div", jp, [
          C("div", Vp, [
            J(H(qe), {
              icon: "tabler:inbox",
              "aria-hidden": "true"
            })
          ]),
          C("div", Dp, [
            P[1] || (P[1] = C("h1", { class: "kx-title" }, "Inbox", -1)),
            C("p", Mp, D(_.value) + " " + D(l.value) + " · live", 1)
          ]),
          C("div", Np, [
            J(H(Ye), {
              type: "button",
              label: "New notice",
              severity: "secondary",
              outlined: "",
              onClick: E
            })
          ])
        ]),
        J(H(ao), {
          value: l.value,
          "data-kx-separator": "surface",
          "onUpdate:value": P[0] || (P[0] = (I) => l.value = String(I))
        }, {
          default: ue(() => [
            J(H(io), {
              "aria-label": "Inbox folders",
              pt: { tabList: { class: "kx-tabs-list" } }
            }, {
              default: ue(() => [
                (h(), b(oe, null, ye(e, (I) => J(H(no), {
                  class: "kx-tab",
                  key: I.key,
                  value: I.key,
                  "data-testid": `inbox-tab-${I.key}`
                }, {
                  default: ue(() => [
                    J(H(qe), {
                      icon: I.icon,
                      "aria-hidden": "true"
                    }, null, 8, ["icon"]),
                    Ce(" " + D(I.label), 1)
                  ]),
                  _: 2
                }, 1032, ["value", "data-testid"])), 64))
              ]),
              _: 1
            })
          ]),
          _: 1
        }, 8, ["value"])
      ]),
      s.value ? (h(), K(H(so), {
        key: 0,
        severity: "error",
        class: "kx-alert"
      }, {
        default: ue(() => [
          Ce(D(s.value), 1)
        ]),
        _: 1
      })) : L("", !0),
      C("main", Fp, [
        C("aside", Rp, [
          a.value ? (h(), b("div", Kp, "Loading...")) : n.value.length ? L("", !0) : (h(), b("div", Up, D(l.value === "pending" ? "Inbox zero — nothing to review." : "Nothing here."), 1)),
          (h(!0), b(oe, null, ye(n.value, (I) => (h(), b("button", {
            key: I.id,
            class: ne(["kx-item", { active: u.value === I.id }]),
            onClick: (q) => u.value = I.id
          }, [
            C("span", {
              class: ne(["kx-priority-dot", V(I.priority)])
            }, null, 2),
            C("div", Wp, [
              C("div", Gp, [
                C("span", {
                  class: ne(["kx-item-title", { pending: I.status === "pending" }])
                }, D(I.title), 3),
                C("span", {
                  class: "kx-time",
                  title: Y(I.created_at)
                }, D(j(I.created_at)), 9, qp)
              ]),
              I.content ? (h(), b("wc-render-markdown", {
                key: 0,
                class: "kx-preview",
                source: I.content,
                inert: ""
              }, null, 8, Yp)) : L("", !0),
              I.status !== "pending" ? (h(), K(H(Mt), {
                key: 1,
                severity: "secondary",
                value: H(Sn)(I.status),
                class: "kx-status kx-tag-sm"
              }, null, 8, ["value"])) : L("", !0)
            ])
          ], 10, Hp))), 128))
        ]),
        C("section", Zp, [
          O.value ? (h(), b("div", Qp, [
            (h(), K(Tp, {
              key: O.value.id,
              item: O.value,
              tag: T(O.value.item_type)?.component_tag,
              icon: T(O.value.item_type)?.icon,
              "type-label": T(O.value.item_type)?.name,
              actions: T(O.value.item_type)?.actions,
              "action-owner": T(O.value.item_type)?.action_owner,
              resolving: d.value === O.value.id,
              "resolving-action": c.value,
              onResolve: te,
              onDelete: S
            }, null, 8, ["item", "tag", "icon", "type-label", "actions", "action-owner", "resolving", "resolving-action"]))
          ])) : (h(), b("div", Jp, " Select an item to view it. "))
        ])
      ])
    ]));
  }
}), ef = ':root{--p-form-field-padding-x: .75rem;--p-form-field-padding-y: .5rem;--p-form-field-sm-padding-x: .625rem;--p-form-field-sm-padding-y: .375rem;--p-form-field-lg-padding-x: .875rem;--p-form-field-lg-padding-y: .625rem;--p-form-field-border-radius: .375rem;--p-form-field-transition-duration: .2s;--p-form-field-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), 0 1px 2px 0 rgba(18, 18, 23, .05);--p-focus-ring-width: 1px;--p-focus-ring-style: solid;--p-focus-ring-color: color-mix(in srgb, var(--p-primary-color) 100%, transparent);--p-focus-ring-offset: 2px;--p-toggleswitch-width: 2.5rem;--p-toggleswitch-height: 1.5rem;--p-toggleswitch-border-radius: 30px;--p-toggleswitch-gap: .25rem;--p-toggleswitch-border-width: 1px;--p-toggleswitch-transition-duration: .2s;--p-toggleswitch-slide-duration: .2s;--p-toggleswitch-handle-size: 1rem;--p-toggleswitch-handle-border-radius: 9999px}:root{color-scheme:light dark;--p-primary: rgb(0, 95, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-secondary: #6f7385;--p-secondary-50: color-mix(in srgb, var(--p-secondary) 5%, white);--p-secondary-100: color-mix(in srgb, var(--p-secondary) 10%, white);--p-secondary-200: color-mix(in srgb, var(--p-secondary) 20%, white);--p-secondary-300: color-mix(in srgb, var(--p-secondary) 35%, white);--p-secondary-400: color-mix(in srgb, var(--p-secondary) 65%, white);--p-secondary-500: var(--p-secondary);--p-secondary-600: color-mix(in srgb, var(--p-secondary) 80%, black);--p-secondary-700: color-mix(in srgb, var(--p-secondary) 65%, black);--p-secondary-800: color-mix(in srgb, var(--p-secondary) 55%, black);--p-secondary-900: color-mix(in srgb, var(--p-secondary) 50%, black);--p-secondary-950: color-mix(in srgb, var(--p-secondary) 30%, black);--p-danger: rgb(239, 68, 68);--p-danger-50: color-mix(in srgb, var(--p-danger) 5%, white);--p-danger-100: color-mix(in srgb, var(--p-danger) 10%, white);--p-danger-200: color-mix(in srgb, var(--p-danger) 20%, white);--p-danger-300: color-mix(in srgb, var(--p-danger) 30%, white);--p-danger-400: color-mix(in srgb, var(--p-danger) 40%, white);--p-danger-500: var(--p-danger);--p-danger-600: color-mix(in srgb, var(--p-danger) 80%, black);--p-danger-700: color-mix(in srgb, var(--p-danger) 70%, black);--p-danger-800: color-mix(in srgb, var(--p-danger) 60%, black);--p-danger-900: color-mix(in srgb, var(--p-danger) 50%, black);--p-danger-950: color-mix(in srgb, var(--p-danger) 40%, black);--p-success: rgb(34, 197, 94);--p-success-50: color-mix(in srgb, var(--p-success) 5%, white);--p-success-100: color-mix(in srgb, var(--p-success) 10%, white);--p-success-200: color-mix(in srgb, var(--p-success) 20%, white);--p-success-300: color-mix(in srgb, var(--p-success) 30%, white);--p-success-400: color-mix(in srgb, var(--p-success) 40%, white);--p-success-500: var(--p-success);--p-success-600: color-mix(in srgb, var(--p-success) 80%, black);--p-success-700: color-mix(in srgb, var(--p-success) 70%, black);--p-success-800: color-mix(in srgb, var(--p-success) 60%, black);--p-success-900: color-mix(in srgb, var(--p-success) 50%, black);--p-success-950: color-mix(in srgb, var(--p-success) 40%, black);--p-warn: rgb(249, 115, 22);--p-warn-50: color-mix(in srgb, var(--p-warn) 5%, white);--p-warn-100: color-mix(in srgb, var(--p-warn) 10%, white);--p-warn-200: color-mix(in srgb, var(--p-warn) 20%, white);--p-warn-300: color-mix(in srgb, var(--p-warn) 30%, white);--p-warn-400: color-mix(in srgb, var(--p-warn) 40%, white);--p-warn-500: var(--p-warn);--p-warn-600: color-mix(in srgb, var(--p-warn) 80%, black);--p-warn-700: color-mix(in srgb, var(--p-warn) 70%, black);--p-warn-800: color-mix(in srgb, var(--p-warn) 60%, black);--p-warn-900: color-mix(in srgb, var(--p-warn) 50%, black);--p-warn-950: color-mix(in srgb, var(--p-warn) 40%, black);--p-info: rgb(14, 165, 233);--p-info-50: color-mix(in srgb, var(--p-info) 5%, white);--p-info-100: color-mix(in srgb, var(--p-info) 10%, white);--p-info-200: color-mix(in srgb, var(--p-info) 20%, white);--p-info-300: color-mix(in srgb, var(--p-info) 30%, white);--p-info-400: color-mix(in srgb, var(--p-info) 40%, white);--p-info-500: var(--p-info);--p-info-600: color-mix(in srgb, var(--p-info) 80%, black);--p-info-700: color-mix(in srgb, var(--p-info) 70%, black);--p-info-800: color-mix(in srgb, var(--p-info) 60%, black);--p-info-900: color-mix(in srgb, var(--p-info) 50%, black);--p-info-950: color-mix(in srgb, var(--p-info) 40%, black);--p-help: rgb(168, 85, 247);--p-help-50: color-mix(in srgb, var(--p-help) 5%, white);--p-help-100: color-mix(in srgb, var(--p-help) 10%, white);--p-help-200: color-mix(in srgb, var(--p-help) 20%, white);--p-help-300: color-mix(in srgb, var(--p-help) 30%, white);--p-help-400: color-mix(in srgb, var(--p-help) 40%, white);--p-help-500: var(--p-help);--p-help-600: color-mix(in srgb, var(--p-help) 80%, black);--p-help-700: color-mix(in srgb, var(--p-help) 70%, black);--p-help-800: color-mix(in srgb, var(--p-help) 60%, black);--p-help-900: color-mix(in srgb, var(--p-help) 50%, black);--p-help-950: color-mix(in srgb, var(--p-help) 40%, black);--p-accent: rgb(20, 184, 166);--p-accent-50: color-mix(in srgb, var(--p-accent) 5%, white);--p-accent-100: color-mix(in srgb, var(--p-accent) 10%, white);--p-accent-200: color-mix(in srgb, var(--p-accent) 20%, white);--p-accent-300: color-mix(in srgb, var(--p-accent) 30%, white);--p-accent-400: color-mix(in srgb, var(--p-accent) 40%, white);--p-accent-500: var(--p-accent);--p-accent-600: color-mix(in srgb, var(--p-accent) 80%, black);--p-accent-700: color-mix(in srgb, var(--p-accent) 70%, black);--p-accent-800: color-mix(in srgb, var(--p-accent) 60%, black);--p-accent-900: color-mix(in srgb, var(--p-accent) 50%, black);--p-accent-950: color-mix(in srgb, var(--p-accent) 40%, black);--p-surface-0: #ffffff;--p-surface-50: #fafafa;--p-surface-100: #f5f5f5;--p-surface-200: #e5e5e5;--p-surface-300: #d4d4d4;--p-surface-400: #a3a3a3;--p-surface-500: #737373;--p-surface-600: #525252;--p-surface-700: #404040;--p-surface-800: #262626;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #171717;--p-surface-950: #0a0a0a;--p-content-border-radius: 6px;--p-font-heading-family: var(--v-font-family-head, Arial);--p-font-heading-scale: 1;--p-font-heading-line-height: 1.5;--p-font-heading-letter-spacing: normal;--p-font-heading-stretch: normal;--p-font-heading-variation-settings: normal;--p-font-body-scale: 1;--p-font-body-line-height: 1.5;--p-font-body-letter-spacing: normal;--p-font-body-stretch: normal;--p-font-body-variation-settings: normal;--p-font-mono-family: ui-monospace}:root{--p-primary-color: var(--p-primary-500);--p-primary-contrast-color: var(--p-surface-0);--p-primary-hover-color: var(--p-primary-600);--p-primary-active-color: var(--p-primary-700);--p-secondary-color: var(--p-secondary-500);--p-secondary-contrast-color: var(--p-surface-0);--p-secondary-hover-color: var(--p-secondary-600);--p-secondary-active-color: var(--p-secondary-700);--p-danger-color: var(--p-danger-500);--p-danger-contrast-color: var(--p-surface-0);--p-danger-hover-color: var(--p-danger-600);--p-danger-active-color: var(--p-danger-700);--p-success-color: var(--p-success-500);--p-success-contrast-color: var(--p-surface-0);--p-success-hover-color: var(--p-success-600);--p-success-active-color: var(--p-success-700);--p-warn-color: var(--p-warn-500);--p-warn-contrast-color: var(--p-surface-0);--p-warn-hover-color: var(--p-warn-600);--p-warn-active-color: var(--p-warn-700);--p-info-color: var(--p-info-500);--p-info-contrast-color: var(--p-surface-0);--p-info-hover-color: var(--p-info-600);--p-info-active-color: var(--p-info-700);--p-help-color: var(--p-help-500);--p-help-contrast-color: var(--p-surface-0);--p-help-hover-color: var(--p-help-600);--p-help-active-color: var(--p-help-700);--p-accent-color: var(--p-accent-500);--p-accent-contrast-color: var(--p-surface-0);--p-accent-hover-color: var(--p-accent-600);--p-accent-active-color: var(--p-accent-700);--p-content-border-color: var(--p-surface-200);--p-content-hover-background: var(--p-surface-100);--p-content-hover-color: var(--p-surface-800);--p-highlight-background: var(--p-primary-50);--p-highlight-color: var(--p-primary-700);--p-highlight-focus-background: var(--p-primary-100);--p-highlight-focus-color: var(--p-primary-800);--p-content-background: var(--p-surface-0);--p-text-color: var(--p-surface-700);--p-text-hover-color: var(--p-surface-800);--p-text-muted-color: var(--p-surface-500);--p-text-hover-muted-color: var(--p-surface-600)}@media(prefers-color-scheme:dark){:root:not(.w-theme-light){--p-surface-D: #fff;--p-surface-0: #fff;--p-surface-50: #fafafa;--p-surface-100: #f4f4f5;--p-surface-200: #e4e4e7;--p-surface-300: #d4d4d8;--p-surface-400: #a1a1aa;--p-surface-500: #71717a;--p-surface-600: #545250;--p-surface-700: #403e3c;--p-surface-800: #2b2927;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #1c1a19;--p-surface-950: #0f0e0d;--p-primary: rgb(0, 125, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-primary-color: var(--p-primary-400);--p-primary-contrast-color: var(--p-surface-900);--p-primary-hover-color: var(--p-primary-300);--p-primary-active-color: var(--p-primary-200);--p-secondary-color: var(--p-secondary-400);--p-secondary-contrast-color: var(--p-surface-900);--p-secondary-hover-color: var(--p-secondary-300);--p-secondary-active-color: var(--p-secondary-200);--p-danger-color: var(--p-danger-400);--p-danger-contrast-color: var(--p-surface-900);--p-danger-hover-color: var(--p-danger-300);--p-danger-active-color: var(--p-danger-200);--p-success-color: var(--p-success-400);--p-success-contrast-color: var(--p-surface-900);--p-success-hover-color: var(--p-success-300);--p-success-active-color: var(--p-success-200);--p-warn-color: var(--p-warn-400);--p-warn-contrast-color: var(--p-surface-900);--p-warn-hover-color: var(--p-warn-300);--p-warn-active-color: var(--p-warn-200);--p-info-color: var(--p-info-400);--p-info-contrast-color: var(--p-surface-900);--p-info-hover-color: var(--p-info-300);--p-info-active-color: var(--p-info-200);--p-help-color: var(--p-help-400);--p-help-contrast-color: var(--p-surface-900);--p-help-hover-color: var(--p-help-300);--p-help-active-color: var(--p-help-200);--p-accent-color: var(--p-accent-400);--p-accent-contrast-color: var(--p-surface-900);--p-accent-hover-color: var(--p-accent-300);--p-accent-active-color: var(--p-accent-200);--p-content-border-color: var(--p-surface-700);--p-content-hover-background: var(--p-surface-800);--p-content-hover-color: var(--p-surface-0);--p-highlight-background: color-mix(in srgb, var(--p-primary-400), transparent 84%);--p-highlight-color: rgba(255, 255, 255, 87%);--p-highlight-focus-background: color-mix(in srgb, var(--p-primary-400), transparent 76%);--p-highlight-focus-color: rgba(255, 255, 255, 87%);--p-content-background: var(--p-surface-900);--p-text-color: var(--p-surface-0);--p-text-hover-color: var(--p-surface-0);--p-text-muted-color: var(--p-surface-400);--p-text-hover-muted-color: var(--p-surface-300)}}:root.w-theme-dark,.w-theme-dark{color-scheme:dark;--p-surface-D: #fff;--p-surface-0: #fff;--p-surface-50: #fafafa;--p-surface-100: #f4f4f5;--p-surface-200: #e4e4e7;--p-surface-300: #d4d4d8;--p-surface-400: #a1a1aa;--p-surface-500: #71717a;--p-surface-600: #545250;--p-surface-700: #403e3c;--p-surface-800: #2b2927;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #1c1a19;--p-surface-950: #0f0e0d;--p-primary: rgb(0, 125, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-primary-color: var(--p-primary-400);--p-primary-contrast-color: var(--p-surface-900);--p-primary-hover-color: var(--p-primary-300);--p-primary-active-color: var(--p-primary-200);--p-secondary-color: var(--p-secondary-400);--p-secondary-contrast-color: var(--p-surface-900);--p-secondary-hover-color: var(--p-secondary-300);--p-secondary-active-color: var(--p-secondary-200);--p-danger-color: var(--p-danger-400);--p-danger-contrast-color: var(--p-surface-900);--p-danger-hover-color: var(--p-danger-300);--p-danger-active-color: var(--p-danger-200);--p-success-color: var(--p-success-400);--p-success-contrast-color: var(--p-surface-900);--p-success-hover-color: var(--p-success-300);--p-success-active-color: var(--p-success-200);--p-warn-color: var(--p-warn-400);--p-warn-contrast-color: var(--p-surface-900);--p-warn-hover-color: var(--p-warn-300);--p-warn-active-color: var(--p-warn-200);--p-info-color: var(--p-info-400);--p-info-contrast-color: var(--p-surface-900);--p-info-hover-color: var(--p-info-300);--p-info-active-color: var(--p-info-200);--p-help-color: var(--p-help-400);--p-help-contrast-color: var(--p-surface-900);--p-help-hover-color: var(--p-help-300);--p-help-active-color: var(--p-help-200);--p-accent-color: var(--p-accent-400);--p-accent-contrast-color: var(--p-surface-900);--p-accent-hover-color: var(--p-accent-300);--p-accent-active-color: var(--p-accent-200);--p-content-border-color: var(--p-surface-700);--p-content-hover-background: var(--p-surface-800);--p-content-hover-color: var(--p-surface-0);--p-highlight-background: color-mix(in srgb, var(--p-primary-400), transparent 84%);--p-highlight-color: rgba(255, 255, 255, 87%);--p-highlight-focus-background: color-mix(in srgb, var(--p-primary-400), transparent 76%);--p-highlight-focus-color: rgba(255, 255, 255, 87%);--p-content-background: var(--p-surface-900);--p-text-color: var(--p-surface-0);--p-text-hover-color: var(--p-surface-0);--p-text-muted-color: var(--p-surface-400);--p-text-hover-muted-color: var(--p-surface-300)}:root.w-theme-light,.w-theme-light{color-scheme:light;--p-surface-0: #ffffff;--p-surface-50: #fafafa;--p-surface-100: #f5f5f5;--p-surface-200: #e5e5e5;--p-surface-300: #d4d4d4;--p-surface-400: #a3a3a3;--p-surface-500: #737373;--p-surface-600: #525252;--p-surface-700: #404040;--p-surface-800: #262626;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #171717;--p-surface-950: #0a0a0a;--p-primary: rgb(0, 95, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-primary-color: var(--p-primary-500);--p-primary-contrast-color: var(--p-surface-0);--p-primary-hover-color: var(--p-primary-600);--p-primary-active-color: var(--p-primary-700);--p-secondary-color: var(--p-secondary-500);--p-secondary-contrast-color: var(--p-surface-0);--p-secondary-hover-color: var(--p-secondary-600);--p-secondary-active-color: var(--p-secondary-700);--p-danger-color: var(--p-danger-500);--p-danger-contrast-color: var(--p-surface-0);--p-danger-hover-color: var(--p-danger-600);--p-danger-active-color: var(--p-danger-700);--p-success-color: var(--p-success-500);--p-success-contrast-color: var(--p-surface-0);--p-success-hover-color: var(--p-success-600);--p-success-active-color: var(--p-success-700);--p-warn-color: var(--p-warn-500);--p-warn-contrast-color: var(--p-surface-0);--p-warn-hover-color: var(--p-warn-600);--p-warn-active-color: var(--p-warn-700);--p-info-color: var(--p-info-500);--p-info-contrast-color: var(--p-surface-0);--p-info-hover-color: var(--p-info-600);--p-info-active-color: var(--p-info-700);--p-help-color: var(--p-help-500);--p-help-contrast-color: var(--p-surface-0);--p-help-hover-color: var(--p-help-600);--p-help-active-color: var(--p-help-700);--p-accent-color: var(--p-accent-500);--p-accent-contrast-color: var(--p-surface-0);--p-accent-hover-color: var(--p-accent-600);--p-accent-active-color: var(--p-accent-700);--p-content-border-color: var(--p-surface-200);--p-content-hover-background: var(--p-surface-100);--p-content-hover-color: var(--p-surface-800);--p-highlight-background: var(--p-primary-50);--p-highlight-color: var(--p-primary-700);--p-highlight-focus-background: var(--p-primary-100);--p-highlight-focus-color: var(--p-primary-800);--p-content-background: var(--p-surface-0);--p-text-color: var(--p-surface-700);--p-text-hover-color: var(--p-surface-800);--p-text-muted-color: var(--p-surface-500);--p-text-hover-muted-color: var(--p-surface-600)}.spin{animation:kx-spin 1s linear infinite}@keyframes kx-spin{to{transform:rotate(360deg)}}@media(prefers-reduced-motion:reduce){.spin{animation:none}}.kx-head{display:flex;align-items:center;gap:12px;padding:20px 24px 14px;flex-wrap:wrap}.kx-head-icon{width:40px;height:40px;border-radius:11px;flex:none;display:flex;align-items:center;justify-content:center;background:color-mix(in srgb,var(--p-primary-color) 14%,transparent);color:var(--p-primary-color)}.kx-head-icon svg{width:22px;height:22px}.kx-head-text{min-width:0}.kx-title{font-size:17px;font-weight:700;color:var(--p-text-color);margin:0}.kx-head-sub{font-size:13px;color:var(--p-text-muted-color);margin:2px 0 0}.kx-head-actions{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-left:auto}.kx-empty{text-align:center;padding:44px 24px;display:flex;flex-direction:column;align-items:center;gap:8px}.kx-empty-ico{width:56px;height:56px;border-radius:14px;display:flex;align-items:center;justify-content:center;background:color-mix(in srgb,var(--p-primary-color) 12%,transparent);color:var(--p-primary-color);margin-bottom:4px}.kx-empty-ico svg{width:28px;height:28px}.kx-empty-title{font-size:15px;font-weight:700;color:var(--p-text-color);margin:0}.kx-empty-sub{font-size:13px;color:var(--p-text-muted-color);max-width:380px;margin:0}.kx-empty>.p-button{margin-top:6px}.kx-empty-actions{display:flex;gap:8px;margin-top:6px}.kx-loading{display:flex;align-items:center;gap:8px;color:var(--p-text-muted-color);font-size:13px;padding:24px}.kx-err{margin:0 20px 8px;padding:9px 12px;border-radius:10px;font-size:13px;background:color-mix(in srgb,var(--p-danger-500) 12%,transparent);color:var(--p-danger-600, var(--p-danger-500))}.kx-err.inline{margin:12px 0 0}.kx-empty.kx-empty-spacious{padding:60px 24px;gap:9px}.kx-empty-spacious .kx-empty-ico{width:58px;height:58px;margin-bottom:5px}.kx-empty-spacious .kx-empty-ico svg{width:27px;height:27px}.kx-empty-spacious .kx-empty-title{font-size:14.5px}.kx-empty-spacious .kx-empty-sub{font-size:12.5px;max-width:360px;line-height:1.55}.kx-empty-ico.primary{background:color-mix(in srgb,var(--p-primary-color) 14%,transparent);border:1px solid color-mix(in srgb,var(--p-primary-color) 28%,transparent)}.kx-empty-ico.muted{background:var(--kx-surface-2);color:color-mix(in srgb,var(--p-text-color) 45%,transparent);border:1px solid var(--p-content-border-color)}.kx-empty>.kx-empty-cta{margin-top:8px;padding-inline:16px}.kx-loading.kx-loading-centered{flex:1;display:grid;place-items:center;padding:64px 20px}.kx-loading-inner{display:flex;flex-direction:column;align-items:center;gap:12px;font-size:13px}.kx-loading-inner svg{width:24px;height:24px}.kx-tag-sm,.kx-tag-sm.kx-tag-sm{display:inline-flex;align-items:center;gap:4px;padding:1px 7px;border-radius:var(--kx-radius-tag, 6px);font-size:10.5px;font-weight:600;line-height:1.5;white-space:nowrap}.kx-tag-sm svg,.kx-tag-sm.kx-tag-sm svg{width:12px;height:12px}.kx-tag-caps,.kx-tag-caps.kx-tag-caps{display:inline-flex;align-items:center;gap:3px;padding:2px 6px;border-radius:var(--kx-radius-tag, 6px);font-size:9px;font-weight:700;line-height:1.5;letter-spacing:.04em;text-transform:uppercase;white-space:nowrap}.kx-tag-caps svg,.kx-tag-caps.kx-tag-caps svg{width:11px;height:11px}*,:before,:after{--tw-border-spacing-x: 0;--tw-border-spacing-y: 0;--tw-translate-x: 0;--tw-translate-y: 0;--tw-rotate: 0;--tw-skew-x: 0;--tw-skew-y: 0;--tw-scale-x: 1;--tw-scale-y: 1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness: proximity;--tw-gradient-from-position: ;--tw-gradient-via-position: ;--tw-gradient-to-position: ;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width: 0px;--tw-ring-offset-color: #fff;--tw-ring-color: rgb(59 130 246 / .5);--tw-ring-offset-shadow: 0 0 #0000;--tw-ring-shadow: 0 0 #0000;--tw-shadow: 0 0 #0000;--tw-shadow-colored: 0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: ;--tw-contain-size: ;--tw-contain-layout: ;--tw-contain-paint: ;--tw-contain-style: }::backdrop{--tw-border-spacing-x: 0;--tw-border-spacing-y: 0;--tw-translate-x: 0;--tw-translate-y: 0;--tw-rotate: 0;--tw-skew-x: 0;--tw-skew-y: 0;--tw-scale-x: 1;--tw-scale-y: 1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness: proximity;--tw-gradient-from-position: ;--tw-gradient-via-position: ;--tw-gradient-to-position: ;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width: 0px;--tw-ring-offset-color: #fff;--tw-ring-color: rgb(59 130 246 / .5);--tw-ring-offset-shadow: 0 0 #0000;--tw-ring-shadow: 0 0 #0000;--tw-shadow: 0 0 #0000;--tw-shadow-colored: 0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: ;--tw-contain-size: ;--tw-contain-layout: ;--tw-contain-paint: ;--tw-contain-style: }*,:before,:after{box-sizing:border-box;border-width:0;border-style:solid;border-color:#e5e7eb}:before,:after{--tw-content: ""}html,:host{line-height:1.5;-webkit-text-size-adjust:100%;-moz-tab-size:4;tab-size:4;font-family:ui-sans-serif,system-ui,sans-serif,"Apple Color Emoji","Segoe UI Emoji",Segoe UI Symbol,"Noto Color Emoji";font-feature-settings:normal;font-variation-settings:normal;-webkit-tap-highlight-color:transparent}body{margin:0;line-height:inherit}hr{height:0;color:inherit;border-top-width:1px}abbr:where([title]){text-decoration:underline dotted}h1,h2,h3,h4,h5,h6{font-size:inherit;font-weight:inherit}a{color:inherit;text-decoration:inherit}b,strong{font-weight:bolder}code,kbd,samp,pre{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace;font-feature-settings:normal;font-variation-settings:normal;font-size:1em}small{font-size:80%}sub,sup{font-size:75%;line-height:0;position:relative;vertical-align:baseline}sub{bottom:-.25em}sup{top:-.5em}table{text-indent:0;border-color:inherit;border-collapse:collapse}button,input,optgroup,select,textarea{font-family:inherit;font-feature-settings:inherit;font-variation-settings:inherit;font-size:100%;font-weight:inherit;line-height:inherit;letter-spacing:inherit;color:inherit;margin:0;padding:0}button,select{text-transform:none}button,input:where([type=button]),input:where([type=reset]),input:where([type=submit]){-webkit-appearance:button;background-color:transparent;background-image:none}:-moz-focusring{outline:auto}:-moz-ui-invalid{box-shadow:none}progress{vertical-align:baseline}::-webkit-inner-spin-button,::-webkit-outer-spin-button{height:auto}[type=search]{-webkit-appearance:textfield;outline-offset:-2px}::-webkit-search-decoration{-webkit-appearance:none}::-webkit-file-upload-button{-webkit-appearance:button;font:inherit}summary{display:list-item}blockquote,dl,dd,h1,h2,h3,h4,h5,h6,hr,figure,p,pre{margin:0}fieldset{margin:0;padding:0}legend{padding:0}ol,ul,menu{list-style:none;margin:0;padding:0}dialog{padding:0}textarea{resize:vertical}input::placeholder,textarea::placeholder{opacity:1;color:#9ca3af}button,[role=button]{cursor:pointer}:disabled{cursor:default}img,svg,video,canvas,audio,iframe,embed,object{display:block;vertical-align:middle}img,video{max-width:100%;height:auto}[hidden]:where(:not([hidden=until-found])){display:none}@supports (-moz-appearance:none){*{scrollbar-color:initial;scrollbar-width:initial}}:host{display:block;height:100%;min-height:0}:host>div{height:100%;min-height:0}*,*:before,*:after{box-sizing:border-box}.kx-inbox{height:100%;min-height:0;display:flex;flex-direction:column;color:var(--p-text-color);background:var(--p-content-background);font-family:inherit}.kx-head-bar{flex:none;border-bottom:1px solid var(--p-content-border-color);padding:20px 24px 0}.kx-head-row{display:flex;align-items:center;gap:12px;padding-bottom:12px}.kx-title{line-height:1.2}.kx-sub{margin:2px 0 0;font-size:13px;color:var(--p-text-muted-color)}.kx-alert{margin:12px 20px 0}.kx-shell{flex:1;min-height:0;display:flex}.kx-list-pane{width:340px;flex:none;overflow-y:auto;border-right:1px solid var(--p-content-border-color)}.kx-list-empty,.kx-detail-empty{color:var(--p-text-muted-color);font-size:13px}.kx-list-empty{padding:24px;text-align:center}.kx-item{width:100%;min-height:72px;display:flex;gap:12px;padding:12px 16px;text-align:left;border:0;border-bottom:1px solid var(--p-content-border-color);background:transparent;color:inherit;font:inherit;cursor:pointer}.kx-item:hover{background:color-mix(in srgb,var(--p-text-color) 5%,transparent)}.kx-item.active{background:color-mix(in srgb,var(--p-primary-color) 8%,transparent)}.kx-priority-dot{width:8px;height:8px;border-radius:999px;flex:none;margin-top:8px;background:var(--p-primary-color)}.kx-priority-urgent{color:var(--p-danger-600, var(--p-danger-500))}.kx-priority-high{color:var(--p-warn-600, var(--p-warn-500))}.kx-priority-normal{color:var(--p-primary-color)}.kx-priority-low{color:var(--p-text-muted-color)}.kx-priority-dot.kx-priority-urgent{background-color:var(--p-danger-500)}.kx-priority-dot.kx-priority-high{background-color:var(--p-warn-500)}.kx-priority-dot.kx-priority-normal{background-color:var(--p-primary-color)}.kx-priority-dot.kx-priority-low{background-color:var(--p-content-border-color)}.kx-item-main{min-width:0;flex:1}.kx-item-line{display:flex;align-items:center;gap:8px;min-width:0}.kx-item-title{flex:1;min-width:0;font-size:13.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:var(--p-text-muted-color)}.kx-item-title.pending{font-weight:700;color:var(--p-text-color)}.kx-time{flex:none;font-size:10.5px;color:var(--p-text-muted-color)}.kx-preview{display:block;height:20px;margin:3px 0 0;font-size:12px;color:var(--p-text-muted-color);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.kx-status{margin-top:6px;text-transform:capitalize}.kx-detail-pane{flex:1;min-width:0;overflow-y:auto;padding:20px}.kx-detail-empty{height:100%;display:flex;align-items:center;justify-content:center}.kx-detail-card{max-width:760px;min-height:100%}.kx-detail{min-height:100%;display:flex;flex-direction:column}.kx-detail-head{display:flex;align-items:flex-start;gap:12px;padding-bottom:16px;margin-bottom:16px;border-bottom:1px solid var(--p-content-border-color)}.kx-detail-icon{width:38px;height:38px;border-radius:10px;flex:none;display:flex;align-items:center;justify-content:center;background-color:color-mix(in srgb,currentColor 12%,transparent)}.kx-detail-icon svg{width:20px;height:20px}.kx-detail-title-block{min-width:0;flex:1}.kx-detail-title{margin:0;font-size:16px;line-height:1.35;font-weight:700;color:var(--p-text-color)}.kx-detail-meta{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin-top:5px;color:var(--p-text-muted-color);font-size:11.5px}.kx-pill{text-transform:capitalize}.kx-detail-body{flex:1;min-height:0;overflow-y:auto}.kx-native-body{display:flex;flex-direction:column;gap:16px}.kx-content{margin:0;font-size:13.5px;line-height:1.6;color:var(--p-text-color)}.kx-md{display:block;font-size:13.5px;color:var(--p-text-color)}.kx-fields{margin:0;border:1px solid var(--p-content-border-color);border-radius:10px;overflow:hidden}.kx-field-row{display:flex;justify-content:space-between;gap:18px;padding:10px 12px;border-bottom:1px solid var(--p-content-border-color);font-size:13px}.kx-field-row:last-child{border-bottom:0}.kx-field-row dt{flex:none;color:var(--p-text-muted-color)}.kx-field-row dd{margin:0;min-width:0;color:var(--p-text-color);font-weight:600;text-align:right}.kx-field-row dd.kx-field-long{text-align:left;font-weight:500;white-space:pre-wrap;word-break:break-word;max-height:180px;overflow-y:auto}.kx-decision-form{display:flex;flex-direction:column;gap:14px}.kx-form-field{display:flex;flex-direction:column;gap:6px}.kx-form-label{font-size:12px;font-weight:600;color:var(--p-text-color)}.kx-required{margin-left:2px;color:var(--p-danger-600, var(--p-danger-500))}.kx-checkbox-row{display:flex;align-items:center;gap:8px;font-size:13px;color:var(--p-text-color)}.kx-checkbox-row label{cursor:pointer}.kx-form-hint{margin:0;font-size:12px;color:var(--p-text-muted-color)}.kx-detail-foot{display:flex;align-items:center;gap:8px;padding-top:16px;margin-top:16px;border-top:1px solid var(--p-content-border-color)}.kx-resolved{flex:1;color:var(--p-text-muted-color);font-size:12px;text-transform:capitalize}@media(max-width:760px){.kx-shell{flex-direction:column}.kx-list-pane{width:100%;max-height:45vh;border-right:0;border-bottom:1px solid var(--p-content-border-color)}.kx-detail-pane{padding:16px}.kx-head{padding:16px 16px 0}}@media(max-width:640px){.kx-head-actions{margin-left:0}.kx-tabs-list{overflow-x:auto}.kx-tab{flex:none}.kx-field-row{flex-direction:column;gap:4px}.kx-field-row dd{text-align:left}.kx-detail-foot{flex-wrap:wrap}.kx-detail-action{flex:1;min-width:0}.kx-resolved{flex-basis:100%}}.kx-files{margin-top:16px}.kx-files h3{margin:0 0 8px;font-size:12px;color:var(--p-text-muted-color)}.kx-file-list{list-style:none;margin:0;padding:0;border:1px solid var(--p-content-border-color);border-radius:8px}.kx-file-list>li+li{border-top:1px solid var(--p-content-border-color)}.kx-file-row{display:flex;align-items:center;gap:8px;padding:8px 10px;font-size:12px}.kx-file-row>svg{flex:none;font-size:20px;color:var(--p-text-muted-color)}.kx-file-row .p-button{flex:none;white-space:nowrap;word-spacing:.125em}.kx-file-label{display:flex;flex:1;min-width:0;flex-direction:column;gap:3px}.kx-file-name{overflow-wrap:anywhere;color:var(--p-text-color)}.kx-file-size,.kx-file-locked{color:var(--p-text-muted-color)}.kx-file-row a{flex:none;color:var(--p-text-color);text-decoration:underline;text-underline-offset:2px}.kx-file-preview{padding:12px;border-top:1px solid var(--p-content-border-color)}.kx-file-preview wc-resource-view{display:block;min-height:180px}.kx-sr-only{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}@media(max-width:420px){.kx-file-row{flex-wrap:wrap}.kx-file-label{flex-basis:calc(100% - 40px)}}', tf = { props: { type: "object", properties: {} } }, nf = {
  wippy: tf
};
class rf extends wi {
  static get wippyConfig() {
    return {
      propsSchema: nf.wippy.props,
      hostCssKeys: ["themeConfigUrl", "primeVueCssUrl"],
      inlineCss: ef
    };
  }
  static get vueConfig() {
    return { rootComponent: Xp, plugins: [Is] };
  }
}
si(import.meta.url, rf);
//# sourceMappingURL=index.js.map

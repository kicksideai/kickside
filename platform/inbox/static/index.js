import { hasInjectionContext as Ko, inject as Ir, effectScope as Uo, ref as Z, markRaw as Ho, onMounted as kn, onUnmounted as Sn, watch as ze, createApp as Wo, readonly as Go, getCurrentInstance as En, nextTick as qo, reactive as Yo, renderSlot as L, openBlock as h, createBlock as K, Teleport as Tr, createCommentVNode as A, useId as Zo, mergeProps as v, h as Jo, createElementBlock as b, createElementVNode as C, createTextVNode as Ce, toDisplayString as N, resolveComponent as re, resolveDirective as Ct, withDirectives as He, resolveDynamicComponent as me, withCtx as ue, normalizeClass as ne, Transition as _r, createVNode as Q, normalizeStyle as Qo, toHandlers as _t, Fragment as oe, renderList as ye, normalizeProps as Xo, createSlots as ei, withModifiers as ti, defineComponent as $n, unref as W, computed as he } from "vue";
import { W as ni, g as ri, a as oi, b as ii } from "./index-DoQuo6nY.js";
import { Icon as We } from "@iconify/vue";
import { loadByTagName as qt, on as ai, api as qe, define as si } from "@wippy-fe/proxy";
/*!
 * pinia v4.0.3
 * (c) 2026 Eduardo San Martin Morote
 * @license MIT
 */
let Pr;
const Lr = (e) => Pr = e, li = () => Ko() && Ir(Ar) || Pr, Ar = (
  /* istanbul ignore next */
  Symbol()
);
function ui() {
  const e = Uo(!0), t = e.run(() => Z({}));
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
    _e: e,
    _s: /* @__PURE__ */ new Map(),
    state: t
  });
  return i;
}
var di = Object.defineProperty, ci = (e, t, n) => t in e ? di(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n, Re = (e, t, n) => ci(e, typeof t != "symbol" ? t + "" : t, n), pi = /* @__PURE__ */ Symbol("wippy:emit"), fi = /* @__PURE__ */ Symbol("wippy:props"), hi = /* @__PURE__ */ Symbol("wippy:props_error"), mi = /* @__PURE__ */ Symbol("wippy:content"), bi = /* @__PURE__ */ Symbol("wippy:panel-id"), gi = /* @__PURE__ */ Symbol("wippy:layout-bus"), vi = /* @__PURE__ */ Symbol("wippy:host"), zr = /* @__PURE__ */ Symbol("wippy:host-visibility");
function yi() {
  const e = Ir(zr);
  if (!e)
    throw new Error("useHostVisibility() must be called inside a WippyVueElement");
  return e;
}
function xi(e) {
  const t = yi();
  let n = !1, r = null, i = !1;
  function o() {
    if (r)
      return i = !0, r;
    let a;
    try {
      a = Promise.resolve(e());
    } catch (l) {
      a = Promise.reject(l);
    }
    const s = a.finally(() => {
      if (r === s && (r = null, n && i))
        return i = !1, o();
    });
    return r = s, s;
  }
  return kn(() => (n = !0, o())), Sn(() => {
    n = !1, i = !1;
  }), ze(t, (a, s) => {
    if (n && s === !1 && a === !0)
      return o();
  }), t;
}
var wi = class extends ni {
  constructor() {
    super(...arguments), Re(this, "_vueApp", null), Re(this, "_propsRef", Z({})), Re(this, "_errorsRef", Z([])), Re(this, "_contentRef", Z(null)), Re(this, "_hostVisibilityRef", Z(null)), Re(this, "_bridgeAbort", null);
  }
  /**
   * Override to provide Vue-specific configuration.
   */
  static get vueConfig() {
    throw new Error("WippyVueElement subclass must override static get vueConfig()");
  }
  onMount(e, t, n, r, i, o) {
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
      c.provide(fi, this._propsRef), c.provide(hi, this._errorsRef), c.provide(pi, this.emitEvent.bind(this)), c.provide(mi, this._contentRef), c.provide(zr, this._hostVisibilityRef), c.provide(bi, ri(this)), c.provide(gi, oi(this)), c.provide(vi, ii(this)), u.providers && u.providers(c, this), c.mount(t), d && Lr(d);
    };
    if (a.rootComponent)
      l(a);
    else if (a.lazyConfig) {
      const u = document.createElement("wippy-loading");
      u.setAttribute("no-bg", ""), t.appendChild(u), a.lazyConfig().then((d) => {
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
}, ki = Object.defineProperty, Bn = Object.getOwnPropertySymbols, Si = Object.prototype.hasOwnProperty, $i = Object.prototype.propertyIsEnumerable, jn = (e, t, n) => t in e ? ki(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n, Ci = (e, t) => {
  for (var n in t || (t = {})) Si.call(t, n) && jn(e, n, t[n]);
  if (Bn) for (var n of Bn(t)) $i.call(t, n) && jn(e, n, t[n]);
  return e;
};
function Pe(e) {
  return e == null || e === "" || Array.isArray(e) && e.length === 0 || !(e instanceof Date) && typeof e == "object" && Object.keys(e).length === 0;
}
function Yt(e, t, n = /* @__PURE__ */ new WeakSet()) {
  if (e === t) return !0;
  if (!e || !t || typeof e != "object" || typeof t != "object" || n.has(e) || n.has(t)) return !1;
  n.add(e).add(t);
  let r = Array.isArray(e), i = Array.isArray(t), o, a, s;
  if (r && i) {
    if (a = e.length, a != t.length) return !1;
    for (o = a; o-- !== 0; ) if (!Yt(e[o], t[o], n)) return !1;
    return !0;
  }
  if (r != i) return !1;
  let l = e instanceof Date, u = t instanceof Date;
  if (l != u) return !1;
  if (l && u) return e.getTime() == t.getTime();
  let d = e instanceof RegExp, c = t instanceof RegExp;
  if (d != c) return !1;
  if (d && c) return e.toString() == t.toString();
  let p = Object.keys(e);
  if (a = p.length, a !== Object.keys(t).length) return !1;
  for (o = a; o-- !== 0; ) if (!Object.prototype.hasOwnProperty.call(t, p[o])) return !1;
  for (o = a; o-- !== 0; ) if (s = p[o], !Yt(e[s], t[s], n)) return !1;
  return !0;
}
function Oi(e, t) {
  return Yt(e, t);
}
function Nt(e) {
  return typeof e == "function" && "call" in e && "apply" in e;
}
function F(e) {
  return !Pe(e);
}
function _e(e, t) {
  if (!e || !t) return null;
  try {
    let n = e[t];
    if (F(n)) return n;
  } catch {
  }
  if (Object.keys(e).length) {
    if (Nt(t)) return t(e);
    if (t.indexOf(".") === -1) return e[t];
    {
      let n = t.split("."), r = e;
      for (let i = 0, o = n.length; i < o; ++i) {
        if (r == null) return null;
        r = r[n[i]];
      }
      return r;
    }
  }
  return null;
}
function Ot(e, t, n) {
  return n ? _e(e, n) === _e(t, n) : Oi(e, t);
}
function Ii(e, t) {
  if (e != null && t && t.length) {
    for (let n of t) if (Ot(e, n)) return !0;
  }
  return !1;
}
function Oe(e, t = !0) {
  return e instanceof Object && e.constructor === Object && (t || Object.keys(e).length !== 0);
}
function Er(e = {}, t = {}) {
  let n = Ci({}, e);
  return Object.keys(t).forEach((r) => {
    let i = r;
    Oe(t[i]) && i in e && Oe(e[i]) ? n[i] = Er(e[i], t[i]) : n[i] = t[i];
  }), n;
}
function Ti(...e) {
  return e.reduce((t, n, r) => r === 0 ? n : Er(t, n), {});
}
function Vn(e, t) {
  let n = -1;
  if (F(e)) try {
    n = e.findLastIndex(t);
  } catch {
    n = e.lastIndexOf([...e].reverse().find(t));
  }
  return n;
}
function ce(e, ...t) {
  return Nt(e) ? e(...t) : e;
}
function de(e, t = !0) {
  return typeof e == "string" && (t || e !== "");
}
function Se(e) {
  return de(e) ? e.replace(/(-|_)/g, "").toLowerCase() : e;
}
function Cn(e, t = "", n = {}) {
  let r = Se(t).split("."), i = r.shift();
  if (i) {
    if (Oe(e)) {
      let o = Object.keys(e).find((a) => Se(a) === i) || "";
      return Cn(ce(e[o], n), r.join("."), n);
    }
    return;
  }
  return ce(e, n);
}
function Br(e, t = !0) {
  return Array.isArray(e) && (t || e.length !== 0);
}
function _i(e) {
  return F(e) && !isNaN(e);
}
function Pi(e = "") {
  return F(e) && e.length === 1 && !!e.match(/\S| /);
}
function Ne(e, t) {
  if (t) {
    let n = t.test(e);
    return t.lastIndex = 0, n;
  }
  return !1;
}
function Li(...e) {
  return Ti(...e);
}
function nt(e) {
  return e && e.replace(/\/\*(?:(?!\*\/)[\s\S])*\*\/|[\r\n\t]+/g, "").replace(/ {2,}/g, " ").replace(/ ([{:}]) /g, "$1").replace(/([;,]) /g, "$1").replace(/ !/g, "!").replace(/: /g, ":").trim();
}
function fe(e) {
  if (e && /[\xC0-\xFF\u0100-\u017E]/.test(e)) {
    let t = { A: /[\xC0-\xC5\u0100\u0102\u0104]/g, AE: /[\xC6]/g, C: /[\xC7\u0106\u0108\u010A\u010C]/g, D: /[\xD0\u010E\u0110]/g, E: /[\xC8-\xCB\u0112\u0114\u0116\u0118\u011A]/g, G: /[\u011C\u011E\u0120\u0122]/g, H: /[\u0124\u0126]/g, I: /[\xCC-\xCF\u0128\u012A\u012C\u012E\u0130]/g, IJ: /[\u0132]/g, J: /[\u0134]/g, K: /[\u0136]/g, L: /[\u0139\u013B\u013D\u013F\u0141]/g, N: /[\xD1\u0143\u0145\u0147\u014A]/g, O: /[\xD2-\xD6\xD8\u014C\u014E\u0150]/g, OE: /[\u0152]/g, R: /[\u0154\u0156\u0158]/g, S: /[\u015A\u015C\u015E\u0160]/g, T: /[\u0162\u0164\u0166]/g, U: /[\xD9-\xDC\u0168\u016A\u016C\u016E\u0170\u0172]/g, W: /[\u0174]/g, Y: /[\xDD\u0176\u0178]/g, Z: /[\u0179\u017B\u017D]/g, a: /[\xE0-\xE5\u0101\u0103\u0105]/g, ae: /[\xE6]/g, c: /[\xE7\u0107\u0109\u010B\u010D]/g, d: /[\u010F\u0111]/g, e: /[\xE8-\xEB\u0113\u0115\u0117\u0119\u011B]/g, g: /[\u011D\u011F\u0121\u0123]/g, i: /[\xEC-\xEF\u0129\u012B\u012D\u012F\u0131]/g, ij: /[\u0133]/g, j: /[\u0135]/g, k: /[\u0137,\u0138]/g, l: /[\u013A\u013C\u013E\u0140\u0142]/g, n: /[\xF1\u0144\u0146\u0148\u014B]/g, p: /[\xFE]/g, o: /[\xF2-\xF6\xF8\u014D\u014F\u0151]/g, oe: /[\u0153]/g, r: /[\u0155\u0157\u0159]/g, s: /[\u015B\u015D\u015F\u0161]/g, t: /[\u0163\u0165\u0167]/g, u: /[\xF9-\xFC\u0169\u016B\u016D\u016F\u0171\u0173]/g, w: /[\u0175]/g, y: /[\xFD\xFF\u0177]/g, z: /[\u017A\u017C\u017E]/g };
    for (let n in t) e = e.replace(t[n], n);
  }
  return e;
}
function Ai(e) {
  return de(e, !1) ? e[0].toUpperCase() + e.slice(1) : e;
}
function jr(e) {
  return de(e) ? e.replace(/(_)/g, "-").replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase() : e;
}
function On() {
  let e = /* @__PURE__ */ new Map();
  return { on(t, n) {
    let r = e.get(t);
    return r ? r.push(n) : r = [n], e.set(t, r), this;
  }, off(t, n) {
    let r = e.get(t);
    return r && r.splice(r.indexOf(n) >>> 0, 1), this;
  }, emit(t, n) {
    let r = e.get(t);
    r && r.forEach((i) => {
      i(n);
    });
  }, clear() {
    e.clear();
  } };
}
function ae(...e) {
  if (e) {
    let t = [];
    for (let n = 0; n < e.length; n++) {
      let r = e[n];
      if (!r) continue;
      let i = typeof r;
      if (i === "string" || i === "number") t.push(r);
      else if (i === "object") {
        let o = Array.isArray(r) ? [ae(...r)] : Object.entries(r).map(([a, s]) => s ? a : void 0);
        t = o.length ? t.concat(o.filter((a) => !!a)) : t;
      }
    }
    return t.join(" ").trim();
  }
}
function zi(e, t) {
  return e ? e.classList ? e.classList.contains(t) : new RegExp("(^| )" + t + "( |$)", "gi").test(e.className) : !1;
}
function Ei(e, t) {
  if (e && t) {
    let n = (r) => {
      zi(e, r) || (e.classList ? e.classList.add(r) : e.className += " " + r);
    };
    [t].flat().filter(Boolean).forEach((r) => r.split(" ").forEach(n));
  }
}
function Ut(e, t) {
  if (e && t) {
    let n = (r) => {
      e.classList ? e.classList.remove(r) : e.className = e.className.replace(new RegExp("(^|\\b)" + r.split(" ").join("|") + "(\\b|$)", "gi"), " ");
    };
    [t].flat().filter(Boolean).forEach((r) => r.split(" ").forEach(n));
  }
}
function Zt(e) {
  for (let t of document?.styleSheets) try {
    for (let n of t?.cssRules) for (let r of n?.style) if (e.test(r)) return { name: r, value: n.style.getPropertyValue(r).trim() };
  } catch {
  }
  return null;
}
function Vr(e) {
  let t = { width: 0, height: 0 };
  if (e) {
    let [n, r] = [e.style.visibility, e.style.display], i = e.getBoundingClientRect();
    e.style.visibility = "hidden", e.style.display = "block", t.width = i.width || e.offsetWidth, t.height = i.height || e.offsetHeight, e.style.display = r, e.style.visibility = n;
  }
  return t;
}
function Dr() {
  let e = window, t = document, n = t.documentElement, r = t.getElementsByTagName("body")[0], i = e.innerWidth || n.clientWidth || r.clientWidth, o = e.innerHeight || n.clientHeight || r.clientHeight;
  return { width: i, height: o };
}
function Jt(e) {
  return e ? Math.abs(e.scrollLeft) : 0;
}
function Bi() {
  let e = document.documentElement;
  return (window.pageXOffset || Jt(e)) - (e.clientLeft || 0);
}
function ji() {
  let e = document.documentElement;
  return (window.pageYOffset || e.scrollTop) - (e.clientTop || 0);
}
function Qt(e) {
  return e ? getComputedStyle(e).direction === "rtl" : !1;
}
function Vi(e, t, n = !0) {
  var r, i, o, a;
  if (e) {
    let s = e.offsetParent ? { width: e.offsetWidth, height: e.offsetHeight } : Vr(e), l = s.height, u = s.width, d = t.offsetHeight, c = t.offsetWidth, p = t.getBoundingClientRect(), f = ji(), m = Bi(), x = Dr(), y, w, O = "top";
    p.top + d + l > x.height ? (y = p.top + f - l, O = "bottom", y < 0 && (y = f)) : y = d + p.top + f, p.left + u > x.width ? w = Math.max(0, p.left + m + c - u) : w = p.left + m, Qt(e) ? e.style.insetInlineEnd = w + "px" : e.style.insetInlineStart = w + "px", e.style.top = y + "px", e.style.transformOrigin = O, n && (e.style.marginTop = O === "bottom" ? `calc(${(i = (r = Zt(/-anchor-gutter$/)) == null ? void 0 : r.value) != null ? i : "2px"} * -1)` : (a = (o = Zt(/-anchor-gutter$/)) == null ? void 0 : o.value) != null ? a : "");
  }
}
function Di(e, t) {
  e && (typeof t == "string" ? e.style.cssText = t : Object.entries(t || {}).forEach(([n, r]) => e.style[n] = r));
}
function In(e, t) {
  return e instanceof HTMLElement ? e.offsetWidth : 0;
}
function Mi(e, t, n = !0, r = void 0) {
  var i;
  if (e) {
    let o = e.offsetParent ? { width: e.offsetWidth, height: e.offsetHeight } : Vr(e), a = t.offsetHeight, s = t.getBoundingClientRect(), l = Dr(), u, d, c = r ?? "top";
    if (!r && s.top + a + o.height > l.height ? (u = -1 * o.height, c = "bottom", s.top + u < 0 && (u = -1 * s.top)) : u = a, o.width > l.width ? d = s.left * -1 : s.left + o.width > l.width ? d = (s.left + o.width - l.width) * -1 : d = 0, e.style.top = u + "px", e.style.insetInlineStart = d + "px", e.style.transformOrigin = c, n) {
      let p = (i = Zt(/-anchor-gutter$/)) == null ? void 0 : i.value;
      e.style.marginTop = c === "bottom" ? `calc(${p ?? "2px"} * -1)` : p ?? "";
    }
  }
}
function Mr(e) {
  if (e) {
    let t = e.parentNode;
    return t && t instanceof ShadowRoot && t.host && (t = t.host), t;
  }
  return null;
}
function Ni(e) {
  return !!(e !== null && typeof e < "u" && e.nodeName && Mr(e));
}
function Ge(e) {
  return typeof Element < "u" ? e instanceof Element : e !== null && typeof e == "object" && e.nodeType === 1 && typeof e.nodeName == "string";
}
function Fi() {
  if (window.getSelection) {
    let e = window.getSelection() || {};
    e.empty ? e.empty() : e.removeAllRanges && e.rangeCount > 0 && e.getRangeAt(0).getClientRects().length > 0 && e.removeAllRanges();
  }
}
function Et(e, t = {}) {
  if (Ge(e)) {
    let n = (r, i) => {
      var o, a;
      let s = (o = e?.$attrs) != null && o[r] ? [(a = e?.$attrs) == null ? void 0 : a[r]] : [];
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
    Object.entries(t).forEach(([r, i]) => {
      if (i != null) {
        let o = r.match(/^on(.+)/);
        o ? e.addEventListener(o[1].toLowerCase(), i) : r === "p-bind" || r === "pBind" ? Et(e, i) : (i = r === "class" ? [...new Set(n("class", i))].join(" ").trim() : r === "style" ? n("style", i).join(";").trim() : i, (e.$attrs = e.$attrs || {}) && (e.$attrs[r] = i), e.setAttribute(r, i));
      }
    });
  }
}
function Ri(e, t = {}, ...n) {
  {
    let r = document.createElement(e);
    return Et(r, t), r.append(...n), r;
  }
}
function Ki(e, t) {
  return Ge(e) ? Array.from(e.querySelectorAll(t)) : [];
}
function Be(e, t) {
  return Ge(e) ? e.matches(t) ? e : e.querySelector(t) : null;
}
function ke(e, t) {
  e && document.activeElement !== e && e.focus(t);
}
function Xe(e, t) {
  if (Ge(e)) {
    let n = e.getAttribute(t);
    return isNaN(n) ? n === "true" || n === "false" ? n === "true" : n : +n;
  }
}
function Tn(e, t = "") {
  let n = Ki(e, `button:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t},
            [href]:not([tabindex = "-1"]):not([style*="display:none"]):not([hidden])${t},
            input:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t},
            select:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t},
            textarea:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t},
            [tabIndex]:not([tabIndex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t},
            [contenteditable]:not([tabIndex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t}`), r = [];
  for (let i of n) getComputedStyle(i).display != "none" && getComputedStyle(i).visibility != "hidden" && r.push(i);
  return r;
}
function Ui(e, t) {
  let n = Tn(e, t);
  return n.length > 0 ? n[0] : null;
}
function Le(e) {
  if (e) {
    let t = e.offsetHeight, n = getComputedStyle(e);
    return t -= parseFloat(n.paddingTop) + parseFloat(n.paddingBottom) + parseFloat(n.borderTopWidth) + parseFloat(n.borderBottomWidth), t;
  }
  return 0;
}
function Hi(e, t) {
  let n = Tn(e, t);
  return n.length > 0 ? n[n.length - 1] : null;
}
function et(e) {
  if (e) {
    let t = e.getBoundingClientRect();
    return { top: t.top + (window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0), left: t.left + (window.pageXOffset || Jt(document.documentElement) || Jt(document.body) || 0) };
  }
  return { top: "auto", left: "auto" };
}
function Nr(e, t) {
  return e ? e.offsetHeight : 0;
}
function Fr(e, t = []) {
  let n = Mr(e);
  return n === null ? t : Fr(n, t.concat([n]));
}
function Wi(e) {
  let t = [];
  if (e) {
    let n = Fr(e), r = /(auto|scroll)/, i = (o) => {
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
          u && i(u) && t.push(u);
        }
      }
      o.nodeType !== 9 && i(o) && t.push(o);
    }
  }
  return t;
}
function Dn() {
  if (window.getSelection) return window.getSelection().toString();
  if (document.getSelection) return document.getSelection().toString();
}
function $e(e) {
  if (e) {
    let t = e.offsetWidth, n = getComputedStyle(e);
    return t -= parseFloat(n.paddingLeft) + parseFloat(n.paddingRight) + parseFloat(n.borderLeftWidth) + parseFloat(n.borderRightWidth), t;
  }
  return 0;
}
function Gi() {
  return /(android)/i.test(navigator.userAgent);
}
function Rr() {
  return !!(typeof window < "u" && window.document && window.document.createElement);
}
function Bt(e) {
  return !!(e && e.offsetParent != null);
}
function qi() {
  return "ontouchstart" in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;
}
function Yi(e, t = "", n) {
  Ge(e) && n !== null && n !== void 0 && e.setAttribute(t, n);
}
var Pt = {};
function Zi(e = "pui_id_") {
  return Object.hasOwn(Pt, e) || (Pt[e] = 0), Pt[e]++, `${e}${Pt[e]}`;
}
function Ji() {
  let e = [], t = (a, s, l = 999) => {
    let u = i(a, s, l), d = u.value + (u.key === a ? 0 : l) + 1;
    return e.push({ key: a, value: d }), d;
  }, n = (a) => {
    e = e.filter((s) => s.value !== a);
  }, r = (a, s) => i(a).value, i = (a, s, l = 0) => [...e].reverse().find((u) => !0) || { key: a, value: l }, o = (a) => a && parseInt(a.style.zIndex, 10) || 0;
  return { get: o, set: (a, s, l) => {
    s && (s.style.zIndex = String(t(a, !0, l)));
  }, clear: (a) => {
    a && (n(o(a)), a.style.zIndex = "");
  }, getCurrent: (a) => r(a) };
}
var Ht = Ji(), Qi = Object.defineProperty, Xi = Object.defineProperties, ea = Object.getOwnPropertyDescriptors, jt = Object.getOwnPropertySymbols, Kr = Object.prototype.hasOwnProperty, Ur = Object.prototype.propertyIsEnumerable, Mn = (e, t, n) => t in e ? Qi(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n, ve = (e, t) => {
  for (var n in t || (t = {})) Kr.call(t, n) && Mn(e, n, t[n]);
  if (jt) for (var n of jt(t)) Ur.call(t, n) && Mn(e, n, t[n]);
  return e;
}, Wt = (e, t) => Xi(e, ea(t)), Te = (e, t) => {
  var n = {};
  for (var r in e) Kr.call(e, r) && t.indexOf(r) < 0 && (n[r] = e[r]);
  if (e != null && jt) for (var r of jt(e)) t.indexOf(r) < 0 && Ur.call(e, r) && (n[r] = e[r]);
  return n;
}, ta = On(), ie = ta, rt = /{([^}]*)}/g, Hr = /(\d+\s+[\+\-\*\/]\s+\d+)/g, Wr = /var\([^)]+\)/g;
function Nn(e) {
  return de(e) ? e.replace(/[A-Z]/g, (t, n) => n === 0 ? t : "." + t.toLowerCase()).toLowerCase() : e;
}
function na(e) {
  return Oe(e) && e.hasOwnProperty("$value") && e.hasOwnProperty("$type") ? e.$value : e;
}
function ra(e) {
  return e.replaceAll(/ /g, "").replace(/[^\w]/g, "-");
}
function Xt(e = "", t = "") {
  return ra(`${de(e, !1) && de(t, !1) ? `${e}-` : e}${t}`);
}
function Gr(e = "", t = "") {
  return `--${Xt(e, t)}`;
}
function oa(e = "") {
  let t = (e.match(/{/g) || []).length, n = (e.match(/}/g) || []).length;
  return (t + n) % 2 !== 0;
}
function qr(e, t = "", n = "", r = [], i) {
  if (de(e)) {
    let o = e.trim();
    if (oa(o)) return;
    if (Ne(o, rt)) {
      let a = o.replaceAll(rt, (s) => {
        let l = s.replace(/{|}/g, "").split(".").filter((u) => !r.some((d) => Ne(u, d)));
        return `var(${Gr(n, jr(l.join("-")))}${F(i) ? `, ${i}` : ""})`;
      });
      return Ne(a.replace(Wr, "0"), Hr) ? `calc(${a})` : a;
    }
    return o;
  } else if (_i(e)) return e;
}
function ia(e, t, n) {
  de(t, !1) && e.push(`${t}:${n};`);
}
function Ke(e, t) {
  return e ? `${e}{${t}}` : "";
}
function Yr(e, t) {
  if (e.indexOf("dt(") === -1) return e;
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
  for (let a = 0; a < e.length; a++) if (e[a] === "d" && e.slice(a, a + 3) === "dt(") o.push(a), a += 2;
  else if (e[a] === ")" && o.length > 0) {
    let s = o.pop();
    o.length === 0 && i.push([s, a]);
  }
  if (!i.length) return e;
  for (let a = i.length - 1; a >= 0; a--) {
    let [s, l] = i[a], u = e.slice(s + 3, l), d = n(u, t), c = t(...d);
    e = e.slice(0, s) + c + e.slice(l + 1);
  }
  return e;
}
var Fe = (...e) => aa(H.getTheme(), ...e), aa = (e = {}, t, n, r) => {
  if (t) {
    let { variable: i, options: o } = H.defaults || {}, { prefix: a, transform: s } = e?.options || o || {}, l = Ne(t, rt) ? t : `{${t}}`;
    return r === "value" || Pe(r) && s === "strict" ? H.getTokenValue(t) : qr(l, void 0, a, [i.excludedKeyRegex], n);
  }
  return "";
};
function Lt(e, ...t) {
  if (e instanceof Array) {
    let n = e.reduce((r, i, o) => {
      var a;
      return r + i + ((a = ce(t[o], { dt: Fe })) != null ? a : "");
    }, "");
    return Yr(n, Fe);
  }
  return ce(e, { dt: Fe });
}
function sa(e, t = {}) {
  let n = H.defaults.variable, { prefix: r = n.prefix, selector: i = n.selector, excludedKeyRegex: o = n.excludedKeyRegex } = t, a = [], s = [], l = [{ node: e, path: r }];
  for (; l.length; ) {
    let { node: d, path: c } = l.pop();
    for (let p in d) {
      let f = d[p], m = na(f), x = Ne(p, o) ? Xt(c) : Xt(c, jr(p));
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
  return { value: s, tokens: a, declarations: u, css: Ke(i, u) };
}
var ge = { regex: { rules: { class: { pattern: /^\.([a-zA-Z][\w-]*)$/, resolve(e) {
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
    return (r = t.map((i) => i.resolve(n)).find((i) => i.matched)) != null ? r : this.rules.custom.resolve(n);
  });
} }, _toVariables(e, t) {
  return sa(e, { prefix: t?.prefix });
}, getCommon({ name: e = "", theme: t = {}, params: n, set: r, defaults: i }) {
  var o, a, s, l, u, d, c;
  let { preset: p, options: f } = t, m, x, y, w, O, _, g;
  if (F(p) && f.transform !== "strict") {
    let { primitive: T, semantic: V, extend: z } = p, j = V || {}, { colorScheme: q } = j, X = Te(j, ["colorScheme"]), U = z || {}, { colorScheme: Y } = U, J = Te(U, ["colorScheme"]), te = q || {}, { dark: S } = te, E = Te(te, ["dark"]), $ = Y || {}, { dark: k } = $, P = Te($, ["dark"]), I = F(T) ? this._toVariables({ primitive: T }, f) : {}, G = F(X) ? this._toVariables({ semantic: X }, f) : {}, pe = F(E) ? this._toVariables({ light: E }, f) : {}, je = F(S) ? this._toVariables({ dark: S }, f) : {}, Ie = F(J) ? this._toVariables({ semantic: J }, f) : {}, ee = F(P) ? this._toVariables({ light: P }, f) : {}, Ve = F(k) ? this._toVariables({ dark: k }, f) : {}, [Co, Oo] = [(o = I.declarations) != null ? o : "", I.tokens], [Io, To] = [(a = G.declarations) != null ? a : "", G.tokens || []], [_o, Po] = [(s = pe.declarations) != null ? s : "", pe.tokens || []], [Lo, Ao] = [(l = je.declarations) != null ? l : "", je.tokens || []], [zo, Eo] = [(u = Ie.declarations) != null ? u : "", Ie.tokens || []], [Bo, jo] = [(d = ee.declarations) != null ? d : "", ee.tokens || []], [Vo, Do] = [(c = Ve.declarations) != null ? c : "", Ve.tokens || []];
    m = this.transformCSS(e, Co, "light", "variable", f, r, i), x = Oo;
    let Mo = this.transformCSS(e, `${Io}${_o}`, "light", "variable", f, r, i), No = this.transformCSS(e, `${Lo}`, "dark", "variable", f, r, i);
    y = `${Mo}${No}`, w = [.../* @__PURE__ */ new Set([...To, ...Po, ...Ao])];
    let Fo = this.transformCSS(e, `${zo}${Bo}color-scheme:light`, "light", "variable", f, r, i), Ro = this.transformCSS(e, `${Vo}color-scheme:dark`, "dark", "variable", f, r, i);
    O = `${Fo}${Ro}`, _ = [.../* @__PURE__ */ new Set([...Eo, ...jo, ...Do])], g = ce(p.css, { dt: Fe });
  }
  return { primitive: { css: m, tokens: x }, semantic: { css: y, tokens: w }, global: { css: O, tokens: _ }, style: g };
}, getPreset({ name: e = "", preset: t = {}, options: n, params: r, set: i, defaults: o, selector: a }) {
  var s, l, u;
  let d, c, p;
  if (F(t) && n.transform !== "strict") {
    let f = e.replace("-directive", ""), m = t, { colorScheme: x, extend: y, css: w } = m, O = Te(m, ["colorScheme", "extend", "css"]), _ = y || {}, { colorScheme: g } = _, T = Te(_, ["colorScheme"]), V = x || {}, { dark: z } = V, j = Te(V, ["dark"]), q = g || {}, { dark: X } = q, U = Te(q, ["dark"]), Y = F(O) ? this._toVariables({ [f]: ve(ve({}, O), T) }, n) : {}, J = F(j) ? this._toVariables({ [f]: ve(ve({}, j), U) }, n) : {}, te = F(z) ? this._toVariables({ [f]: ve(ve({}, z), X) }, n) : {}, [S, E] = [(s = Y.declarations) != null ? s : "", Y.tokens || []], [$, k] = [(l = J.declarations) != null ? l : "", J.tokens || []], [P, I] = [(u = te.declarations) != null ? u : "", te.tokens || []], G = this.transformCSS(f, `${S}${$}`, "light", "variable", n, i, o, a), pe = this.transformCSS(f, P, "dark", "variable", n, i, o, a);
    d = `${G}${pe}`, c = [.../* @__PURE__ */ new Set([...E, ...k, ...I])], p = ce(w, { dt: Fe });
  }
  return { css: d, tokens: c, style: p };
}, getPresetC({ name: e = "", theme: t = {}, params: n, set: r, defaults: i }) {
  var o;
  let { preset: a, options: s } = t, l = (o = a?.components) == null ? void 0 : o[e];
  return this.getPreset({ name: e, preset: l, options: s, params: n, set: r, defaults: i });
}, getPresetD({ name: e = "", theme: t = {}, params: n, set: r, defaults: i }) {
  var o, a;
  let s = e.replace("-directive", ""), { preset: l, options: u } = t, d = ((o = l?.components) == null ? void 0 : o[s]) || ((a = l?.directives) == null ? void 0 : a[s]);
  return this.getPreset({ name: s, preset: d, options: u, params: n, set: r, defaults: i });
}, applyDarkColorScheme(e) {
  return !(e.darkModeSelector === "none" || e.darkModeSelector === !1);
}, getColorSchemeOption(e, t) {
  var n;
  return this.applyDarkColorScheme(e) ? this.regex.resolve(e.darkModeSelector === !0 ? t.options.darkModeSelector : (n = e.darkModeSelector) != null ? n : t.options.darkModeSelector) : [];
}, getLayerOrder(e, t = {}, n, r) {
  let { cssLayer: i } = t;
  return i ? `@layer ${ce(i.order || i.name || "primeui", n)}` : "";
}, getCommonStyleSheet({ name: e = "", theme: t = {}, params: n, props: r = {}, set: i, defaults: o }) {
  let a = this.getCommon({ name: e, theme: t, params: n, set: i, defaults: o }), s = Object.entries(r).reduce((l, [u, d]) => l.push(`${u}="${d}"`) && l, []).join(" ");
  return Object.entries(a || {}).reduce((l, [u, d]) => {
    if (Oe(d) && Object.hasOwn(d, "css")) {
      let c = nt(d.css), p = `${u}-variables`;
      l.push(`<style type="text/css" data-primevue-style-id="${p}" ${s}>${c}</style>`);
    }
    return l;
  }, []).join("");
}, getStyleSheet({ name: e = "", theme: t = {}, params: n, props: r = {}, set: i, defaults: o }) {
  var a;
  let s = { name: e, theme: t, params: n, set: i, defaults: o }, l = (a = e.includes("-directive") ? this.getPresetD(s) : this.getPresetC(s)) == null ? void 0 : a.css, u = Object.entries(r).reduce((d, [c, p]) => d.push(`${c}="${p}"`) && d, []).join(" ");
  return l ? `<style type="text/css" data-primevue-style-id="${e}-variables" ${u}>${nt(l)}</style>` : "";
}, createTokens(e = {}, t, n = "", r = "", i = {}) {
  let o = function(s, l = {}, u = []) {
    if (u.includes(this.path)) return console.warn(`Circular reference detected at ${this.path}`), { colorScheme: s, path: this.path, paths: l, value: void 0 };
    u.push(this.path), l.name = this.path, l.binding || (l.binding = {});
    let d = this.value;
    if (typeof this.value == "string" && rt.test(this.value)) {
      let c = this.value.trim().replace(rt, (p) => {
        var f;
        let m = p.slice(1, -1), x = this.tokens[m];
        if (!x) return console.warn(`Token not found for path: ${m}`), "__UNRESOLVED__";
        let y = x.computed(s, l, u);
        return Array.isArray(y) && y.length === 2 ? `light-dark(${y[0].value},${y[1].value})` : (f = y?.value) != null ? f : "__UNRESOLVED__";
      });
      d = Hr.test(c.replace(Wr, "0")) ? `calc(${c})` : c;
    }
    return Pe(l.binding) && delete l.binding, u.pop(), { colorScheme: s, path: this.path, paths: l, value: d.includes("__UNRESOLVED__") ? void 0 : d };
  }, a = (s, l, u) => {
    Object.entries(s).forEach(([d, c]) => {
      let p = Ne(d, t.variable.excludedKeyRegex) ? l : l ? `${l}.${Nn(d)}` : Nn(d), f = u ? `${u}.${d}` : d;
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
  return a(e, n, r), i;
}, getTokenValue(e, t, n) {
  var r;
  let i = ((s) => s.split(".").filter((l) => !Ne(l.toLowerCase(), n.variable.excludedKeyRegex)).join("."))(t), o = t.includes("colorScheme.light") ? "light" : t.includes("colorScheme.dark") ? "dark" : void 0, a = [(r = e[i]) == null ? void 0 : r.computed(o)].flat().filter((s) => s);
  return a.length === 1 ? a[0].value : a.reduce((s = {}, l) => {
    let u = l, { colorScheme: d } = u, c = Te(u, ["colorScheme"]);
    return s[d] = c, s;
  }, void 0);
}, getSelectorRule(e, t, n, r) {
  return n === "class" || n === "attr" ? Ke(F(t) ? `${e}${t},${e} ${t}` : e, r) : Ke(e, Ke(t ?? ":root,:host", r));
}, transformCSS(e, t, n, r, i = {}, o, a, s) {
  if (F(t)) {
    let { cssLayer: l } = i;
    if (r !== "style") {
      let u = this.getColorSchemeOption(i, a);
      t = n === "dark" ? u.reduce((d, { type: c, selector: p }) => (F(p) && (d += p.includes("[CSS]") ? p.replace("[CSS]", t) : this.getSelectorRule(p, s, c, t)), d), "") : Ke(s ?? ":root,:host", t);
    }
    if (l) {
      let u = { name: "primeui" };
      Oe(l) && (u.name = ce(l.name, { name: e, type: r })), F(u.name) && (t = Ke(`@layer ${u.name}`, t), o?.layerNames(u.name));
    }
    return t;
  }
  return "";
} }, H = { defaults: { variable: { prefix: "p", selector: ":root,:host", excludedKeyRegex: /^(primitive|semantic|components|directives|variables|colorscheme|light|dark|common|root|states|extend|css)$/gi }, options: { prefix: "p", darkModeSelector: "system", cssLayer: !1 } }, _theme: void 0, _layerNames: /* @__PURE__ */ new Set(), _loadedStyleNames: /* @__PURE__ */ new Set(), _loadingStyles: /* @__PURE__ */ new Set(), _tokens: {}, update(e = {}) {
  let { theme: t } = e;
  t && (this._theme = Wt(ve({}, t), { options: ve(ve({}, this.defaults.options), t.options) }), this._tokens = ge.createTokens(this.preset, this.defaults), this.clearLoadedStyleNames());
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
  this.update({ theme: e }), ie.emit("theme:change", e);
}, getPreset() {
  return this.preset;
}, setPreset(e) {
  this._theme = Wt(ve({}, this.theme), { preset: e }), this._tokens = ge.createTokens(e, this.defaults), this.clearLoadedStyleNames(), ie.emit("preset:change", e), ie.emit("theme:change", this.theme);
}, getOptions() {
  return this.options;
}, setOptions(e) {
  this._theme = Wt(ve({}, this.theme), { options: e }), this.clearLoadedStyleNames(), ie.emit("options:change", e), ie.emit("theme:change", this.theme);
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
  return ge.getTokenValue(this.tokens, e, this.defaults);
}, getCommon(e = "", t) {
  return ge.getCommon({ name: e, theme: this.theme, params: t, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } });
}, getComponent(e = "", t) {
  let n = { name: e, theme: this.theme, params: t, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } };
  return ge.getPresetC(n);
}, getDirective(e = "", t) {
  let n = { name: e, theme: this.theme, params: t, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } };
  return ge.getPresetD(n);
}, getCustomPreset(e = "", t, n, r) {
  let i = { name: e, preset: t, options: this.options, selector: n, params: r, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } };
  return ge.getPreset(i);
}, getLayerOrderCSS(e = "") {
  return ge.getLayerOrder(e, this.options, { names: this.getLayerNames() }, this.defaults);
}, transformCSS(e = "", t, n = "style", r) {
  return ge.transformCSS(e, t, r, n, this.options, { layerNames: this.setLayerNames.bind(this) }, this.defaults);
}, getCommonStyleSheet(e = "", t, n = {}) {
  return ge.getCommonStyleSheet({ name: e, theme: this.theme, params: t, props: n, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } });
}, getStyleSheet(e, t, n = {}) {
  return ge.getStyleSheet({ name: e, theme: this.theme, params: t, props: n, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } });
}, onStyleMounted(e) {
  this._loadingStyles.add(e);
}, onStyleUpdated(e) {
  this._loadingStyles.add(e);
}, onStyleLoaded(e, { name: t }) {
  this._loadingStyles.size && (this._loadingStyles.delete(t), ie.emit(`theme:${t}:load`, e), !this._loadingStyles.size && ie.emit("theme:load"));
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
function Fn(e, t) {
  var n = typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (!n) {
    if (Array.isArray(e) || (n = la(e)) || t) {
      n && (e = n);
      var r = 0, i = function() {
      };
      return { s: i, n: function() {
        return r >= e.length ? { done: !0 } : { done: !1, value: e[r++] };
      }, e: function(u) {
        throw u;
      }, f: i };
    }
    throw new TypeError(`Invalid attempt to iterate non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
  }
  var o, a = !0, s = !1;
  return { s: function() {
    n = n.call(e);
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
function la(e, t) {
  if (e) {
    if (typeof e == "string") return Rn(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Rn(e, t) : void 0;
  }
}
function Rn(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
var ua = {
  filter: function(t, n, r, i, o) {
    var a = [];
    if (!t)
      return a;
    var s = Fn(t), l;
    try {
      for (s.s(); !(l = s.n()).done; ) {
        var u = l.value;
        if (typeof u == "string") {
          if (this.filters[i](u, r, o)) {
            a.push(u);
            continue;
          }
        } else {
          var d = Fn(n), c;
          try {
            for (d.s(); !(c = d.n()).done; ) {
              var p = c.value, f = _e(u, p);
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
    startsWith: function(t, n, r) {
      if (n == null || n === "")
        return !0;
      if (t == null)
        return !1;
      var i = fe(n.toString()).toLocaleLowerCase(r), o = fe(t.toString()).toLocaleLowerCase(r);
      return o.slice(0, i.length) === i;
    },
    contains: function(t, n, r) {
      if (n == null || n === "")
        return !0;
      if (t == null)
        return !1;
      var i = fe(n.toString()).toLocaleLowerCase(r), o = fe(t.toString()).toLocaleLowerCase(r);
      return o.indexOf(i) !== -1;
    },
    notContains: function(t, n, r) {
      if (n == null || n === "")
        return !0;
      if (t == null)
        return !1;
      var i = fe(n.toString()).toLocaleLowerCase(r), o = fe(t.toString()).toLocaleLowerCase(r);
      return o.indexOf(i) === -1;
    },
    endsWith: function(t, n, r) {
      if (n == null || n === "")
        return !0;
      if (t == null)
        return !1;
      var i = fe(n.toString()).toLocaleLowerCase(r), o = fe(t.toString()).toLocaleLowerCase(r);
      return o.indexOf(i, o.length - i.length) !== -1;
    },
    equals: function(t, n, r) {
      return n == null || n === "" ? !0 : t == null ? !1 : t.getTime && n.getTime ? t.getTime() === n.getTime() : fe(t.toString()).toLocaleLowerCase(r) == fe(n.toString()).toLocaleLowerCase(r);
    },
    notEquals: function(t, n, r) {
      return n == null || n === "" ? !1 : t == null ? !0 : t.getTime && n.getTime ? t.getTime() !== n.getTime() : fe(t.toString()).toLocaleLowerCase(r) != fe(n.toString()).toLocaleLowerCase(r);
    },
    in: function(t, n) {
      if (n == null || n.length === 0)
        return !0;
      for (var r = 0; r < n.length; r++)
        if (Ot(t, n[r]))
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
function ot(e) {
  "@babel/helpers - typeof";
  return ot = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, ot(e);
}
function Kn(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(e);
    t && (r = r.filter(function(i) {
      return Object.getOwnPropertyDescriptor(e, i).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function Un(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? Kn(Object(n), !0).forEach(function(r) {
      ca(e, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Kn(Object(n)).forEach(function(r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return e;
}
function ca(e, t, n) {
  return (t = pa(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function pa(e) {
  var t = fa(e, "string");
  return ot(t) == "symbol" ? t : t + "";
}
function fa(e, t) {
  if (ot(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (ot(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
function ha(e) {
  var t = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0;
  En() && En().components ? kn(e) : t ? e() : qo(e);
}
var ma = 0;
function ba(e) {
  var t = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, n = Z(!1), r = Z(e), i = Z(null), o = Rr() ? window.document : void 0, a = t.document, s = a === void 0 ? o : a, l = t.immediate, u = l === void 0 ? !0 : l, d = t.manual, c = d === void 0 ? !1 : d, p = t.name, f = p === void 0 ? "style_".concat(++ma) : p, m = t.id, x = m === void 0 ? void 0 : m, y = t.media, w = y === void 0 ? void 0 : y, O = t.nonce, _ = O === void 0 ? void 0 : O, g = t.first, T = g === void 0 ? !1 : g, V = t.onMounted, z = V === void 0 ? void 0 : V, j = t.onUpdated, q = j === void 0 ? void 0 : j, X = t.onLoad, U = X === void 0 ? void 0 : X, Y = t.props, J = Y === void 0 ? {} : Y, te = function() {
  }, S = function(k) {
    var P = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    if (s) {
      var I = Un(Un({}, J), P), G = I.name || f, pe = I.id || x, je = I.nonce || _;
      i.value = s.querySelector('style[data-primevue-style-id="'.concat(G, '"]')) || s.getElementById(pe) || s.createElement("style"), i.value.isConnected || (r.value = k || e, Et(i.value, {
        type: "text/css",
        id: pe,
        media: w,
        nonce: je
      }), T ? s.head.prepend(i.value) : s.head.appendChild(i.value), Yi(i.value, "data-primevue-style-id", G), Et(i.value, I), i.value.onload = function(Ie) {
        return U?.(Ie, {
          name: G
        });
      }, z?.(G)), !n.value && (te = ze(r, function(Ie) {
        i.value.textContent = Ie, q?.(G);
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
function it(e) {
  "@babel/helpers - typeof";
  return it = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, it(e);
}
var Hn, Wn, Gn, qn;
function Yn(e, t) {
  return xa(e) || ya(e, t) || va(e, t) || ga();
}
function ga() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function va(e, t) {
  if (e) {
    if (typeof e == "string") return Zn(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Zn(e, t) : void 0;
  }
}
function Zn(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function ya(e, t) {
  var n = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (n != null) {
    var r, i, o, a, s = [], l = !0, u = !1;
    try {
      if (o = (n = n.call(e)).next, t !== 0) for (; !(l = (r = o.call(n)).done) && (s.push(r.value), s.length !== t); l = !0) ;
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
function xa(e) {
  if (Array.isArray(e)) return e;
}
function Jn(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(e);
    t && (r = r.filter(function(i) {
      return Object.getOwnPropertyDescriptor(e, i).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function Gt(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? Jn(Object(n), !0).forEach(function(r) {
      wa(e, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Jn(Object(n)).forEach(function(r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return e;
}
function wa(e, t, n) {
  return (t = ka(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function ka(e) {
  var t = Sa(e, "string");
  return it(t) == "symbol" ? t : t + "";
}
function Sa(e, t) {
  if (it(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (it(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
function At(e, t) {
  return t || (t = e.slice(0)), Object.freeze(Object.defineProperties(e, { raw: { value: Object.freeze(t) } }));
}
var $a = function(t) {
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
}, Ca = {}, Oa = {}, D = {
  name: "base",
  css: $a,
  style: da,
  classes: Ca,
  inlineStyles: Oa,
  load: function(t) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, r = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : function(o) {
      return o;
    }, i = r(Lt(Hn || (Hn = At(["", ""])), t));
    return F(i) ? ba(nt(i), Gt({
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
      var i = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "";
      return H.transformCSS(n.name || t.name, "".concat(i).concat(Lt(Wn || (Wn = At(["", ""])), r)));
    });
  },
  getCommonTheme: function(t) {
    return H.getCommon(this.name, t);
  },
  getComponentTheme: function(t) {
    return H.getComponent(this.name, t);
  },
  getDirectiveTheme: function(t) {
    return H.getDirective(this.name, t);
  },
  getPresetTheme: function(t, n, r) {
    return H.getCustomPreset(this.name, t, n, r);
  },
  getLayerOrderThemeCSS: function() {
    return H.getLayerOrderCSS(this.name);
  },
  getStyleSheet: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    if (this.css) {
      var r = ce(this.css, {
        dt: Fe
      }) || "", i = nt(Lt(Gn || (Gn = At(["", "", ""])), r, t)), o = Object.entries(n).reduce(function(a, s) {
        var l = Yn(s, 2), u = l[0], d = l[1];
        return a.push("".concat(u, '="').concat(d, '"')) && a;
      }, []).join(" ");
      return F(i) ? '<style type="text/css" data-primevue-style-id="'.concat(this.name, '" ').concat(o, ">").concat(i, "</style>") : "";
    }
    return "";
  },
  getCommonThemeStyleSheet: function(t) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    return H.getCommonStyleSheet(this.name, t, n);
  },
  getThemeStyleSheet: function(t) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, r = [H.getStyleSheet(this.name, t, n)];
    if (this.style) {
      var i = this.name === "base" ? "global-style" : "".concat(this.name, "-style"), o = Lt(qn || (qn = At(["", ""])), ce(this.style, {
        dt: Fe
      })), a = nt(H.transformCSS(i, o)), s = Object.entries(n).reduce(function(l, u) {
        var d = Yn(u, 2), c = d[0], p = d[1];
        return l.push("".concat(c, '="').concat(p, '"')) && l;
      }, []).join(" ");
      F(a) && r.push('<style type="text/css" data-primevue-style-id="'.concat(i, '" ').concat(s, ">").concat(a, "</style>"));
    }
    return r.join("");
  },
  extend: function(t) {
    return Gt(Gt({}, this), {}, {
      css: void 0,
      style: void 0
    }, t);
  }
}, Ee = On();
function at(e) {
  "@babel/helpers - typeof";
  return at = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, at(e);
}
function Qn(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(e);
    t && (r = r.filter(function(i) {
      return Object.getOwnPropertyDescriptor(e, i).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function zt(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? Qn(Object(n), !0).forEach(function(r) {
      Ia(e, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Qn(Object(n)).forEach(function(r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return e;
}
function Ia(e, t, n) {
  return (t = Ta(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Ta(e) {
  var t = _a(e, "string");
  return at(t) == "symbol" ? t : t + "";
}
function _a(e, t) {
  if (at(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (at(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
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
function Aa(e, t) {
  var n = {
    config: Yo(t)
  };
  return e.config.globalProperties.$primevue = n, e.provide(La, n), za(), Ea(e, n), n;
}
var Ue = [];
function za() {
  ie.clear(), Ue.forEach(function(e) {
    return e?.();
  }), Ue = [];
}
function Ea(e, t) {
  var n = Z(!1), r = function() {
    var u;
    if (((u = t.config) === null || u === void 0 ? void 0 : u.theme) !== "none" && !H.isStyleNameLoaded("common")) {
      var d, c, p = ((d = D.getCommonTheme) === null || d === void 0 ? void 0 : d.call(D)) || {}, f = p.primitive, m = p.semantic, x = p.global, y = p.style, w = {
        nonce: (c = t.config) === null || c === void 0 || (c = c.csp) === null || c === void 0 ? void 0 : c.nonce
      };
      D.load(f?.css, zt({
        name: "primitive-variables"
      }, w)), D.load(m?.css, zt({
        name: "semantic-variables"
      }, w)), D.load(x?.css, zt({
        name: "global-variables"
      }, w)), D.loadStyle(zt({
        name: "global-style"
      }, w), y), H.setLoadedStyleName("common");
    }
  };
  ie.on("theme:change", function(l) {
    n.value || (e.config.globalProperties.$primevue.config.theme = l, n.value = !0);
  });
  var i = ze(t.config, function(l, u) {
    Ee.emit("config:change", {
      newValue: l,
      oldValue: u
    });
  }, {
    immediate: !0,
    deep: !0
  }), o = ze(function() {
    return t.config.ripple;
  }, function(l, u) {
    Ee.emit("config:ripple:change", {
      newValue: l,
      oldValue: u
    });
  }, {
    immediate: !0,
    deep: !0
  }), a = ze(function() {
    return t.config.theme;
  }, function(l, u) {
    n.value || H.setTheme(l), t.config.unstyled || r(), n.value = !1, Ee.emit("config:theme:change", {
      newValue: l,
      oldValue: u
    });
  }, {
    immediate: !0,
    deep: !1
  }), s = ze(function() {
    return t.config.unstyled;
  }, function(l, u) {
    !l && t.config.theme && r(), Ee.emit("config:unstyled:change", {
      newValue: l,
      oldValue: u
    });
  }, {
    immediate: !0,
    deep: !0
  });
  Ue.push(i), Ue.push(o), Ue.push(a), Ue.push(s);
}
var Ba = {
  install: function(t, n) {
    var r = Li(Pa, n);
    Aa(t, r);
  }
}, _n = {
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
function ja(e, t, n, r, i, o) {
  return o.inline ? L(e.$slots, "default", {
    key: 0
  }) : i.mounted ? (h(), K(Tr, {
    key: 1,
    to: n.appendTo
  }, [L(e.$slots, "default")], 8, ["to"])) : A("", !0);
}
_n.render = ja;
var Ae = {
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
function Va() {
  var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "pc", t = Zo();
  return "".concat(e).concat(t.replace("v-", "").replaceAll("-", "_"));
}
var Xn = D.extend({
  name: "common"
});
function st(e) {
  "@babel/helpers - typeof";
  return st = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, st(e);
}
function Da(e) {
  return Qr(e) || Ma(e) || Jr(e) || Zr();
}
function Ma(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function Ye(e, t) {
  return Qr(e) || Na(e, t) || Jr(e, t) || Zr();
}
function Zr() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Jr(e, t) {
  if (e) {
    if (typeof e == "string") return en(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? en(e, t) : void 0;
  }
}
function en(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function Na(e, t) {
  var n = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (n != null) {
    var r, i, o, a, s = [], l = !0, u = !1;
    try {
      if (o = (n = n.call(e)).next, t === 0) {
        if (Object(n) !== n) return;
        l = !1;
      } else for (; !(l = (r = o.call(n)).done) && (s.push(r.value), s.length !== t); l = !0) ;
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
function Qr(e) {
  if (Array.isArray(e)) return e;
}
function er(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(e);
    t && (r = r.filter(function(i) {
      return Object.getOwnPropertyDescriptor(e, i).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function M(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? er(Object(n), !0).forEach(function(r) {
      tt(e, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : er(Object(n)).forEach(function(r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return e;
}
function tt(e, t, n) {
  return (t = Fa(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Fa(e) {
  var t = Ra(e, "string");
  return st(t) == "symbol" ? t : t + "";
}
function Ra(e, t) {
  if (st(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (st(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
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
      handler: function(t) {
        ie.off("theme:change", this._loadCoreStyles), t || (this._loadCoreStyles(), this._themeChangeListener(this._loadCoreStyles));
      }
    },
    dt: {
      immediate: !0,
      handler: function(t, n) {
        var r = this;
        ie.off("theme:change", this._themeScopedListener), t ? (this._loadScopedThemeStyles(t), this._themeScopedListener = function() {
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
    var t, n, r, i, o, a, s, l, u, d, c, p = (t = this.pt) === null || t === void 0 ? void 0 : t._usept, f = p ? (n = this.pt) === null || n === void 0 || (n = n.originalValue) === null || n === void 0 ? void 0 : n[this.$.type.name] : void 0, m = p ? (r = this.pt) === null || r === void 0 || (r = r.value) === null || r === void 0 ? void 0 : r[this.$.type.name] : this.pt;
    (i = m || f) === null || i === void 0 || (i = i.hooks) === null || i === void 0 || (o = i.onBeforeCreate) === null || o === void 0 || o.call(i);
    var x = (a = this.$primevueConfig) === null || a === void 0 || (a = a.pt) === null || a === void 0 ? void 0 : a._usept, y = x ? (s = this.$primevue) === null || s === void 0 || (s = s.config) === null || s === void 0 || (s = s.pt) === null || s === void 0 ? void 0 : s.originalValue : void 0, w = x ? (l = this.$primevue) === null || l === void 0 || (l = l.config) === null || l === void 0 || (l = l.pt) === null || l === void 0 ? void 0 : l.value : (u = this.$primevue) === null || u === void 0 || (u = u.config) === null || u === void 0 ? void 0 : u.pt;
    (d = w || y) === null || d === void 0 || (d = d[this.$.type.name]) === null || d === void 0 || (d = d.hooks) === null || d === void 0 || (c = d.onBeforeCreate) === null || c === void 0 || c.call(d), this.$attrSelector = Va(), this.uid = this.$attrs.id || this.$attrSelector.replace("pc", "pv_id_");
  },
  created: function() {
    this._hook("onCreated");
  },
  beforeMount: function() {
    var t;
    this.rootEl = Be(Ge(this.$el) ? this.$el : (t = this.$el) === null || t === void 0 ? void 0 : t.parentElement, "[".concat(this.$attrSelector, "]")), this.rootEl && (this.rootEl.$pc = M({
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
      for (var n = arguments.length, r = new Array(n > 1 ? n - 1 : 0), i = 1; i < n; i++)
        r[i - 1] = arguments[i];
      return Nt(t) ? t.apply(void 0, r) : v.apply(void 0, r);
    },
    _load: function() {
      Ae.isStyleNameLoaded("base") || (D.loadCSS(this.$styleOptions), this._loadGlobalStyles(), Ae.setLoadedStyleName("base")), this._loadThemeStyles();
    },
    _loadStyles: function() {
      this._load(), this._themeChangeListener(this._load);
    },
    _loadCoreStyles: function() {
      var t, n;
      !Ae.isStyleNameLoaded((t = this.$style) === null || t === void 0 ? void 0 : t.name) && (n = this.$style) !== null && n !== void 0 && n.name && (Xn.loadCSS(this.$styleOptions), this.$options.style && this.$style.loadCSS(this.$styleOptions), Ae.setLoadedStyleName(this.$style.name));
    },
    _loadGlobalStyles: function() {
      var t = this._useGlobalPT(this._getOptionValue, "global.css", this.$params);
      F(t) && D.load(t, M({
        name: "global"
      }, this.$styleOptions));
    },
    _loadThemeStyles: function() {
      var t, n;
      if (!(this.isUnstyled || this.$theme === "none")) {
        if (!H.isStyleNameLoaded("common")) {
          var r, i, o = ((r = this.$style) === null || r === void 0 || (i = r.getCommonTheme) === null || i === void 0 ? void 0 : i.call(r)) || {}, a = o.primitive, s = o.semantic, l = o.global, u = o.style;
          D.load(a?.css, M({
            name: "primitive-variables"
          }, this.$styleOptions)), D.load(s?.css, M({
            name: "semantic-variables"
          }, this.$styleOptions)), D.load(l?.css, M({
            name: "global-variables"
          }, this.$styleOptions)), D.loadStyle(M({
            name: "global-style"
          }, this.$styleOptions), u), H.setLoadedStyleName("common");
        }
        if (!H.isStyleNameLoaded((t = this.$style) === null || t === void 0 ? void 0 : t.name) && (n = this.$style) !== null && n !== void 0 && n.name) {
          var d, c, p, f, m = ((d = this.$style) === null || d === void 0 || (c = d.getComponentTheme) === null || c === void 0 ? void 0 : c.call(d)) || {}, x = m.css, y = m.style;
          (p = this.$style) === null || p === void 0 || p.load(x, M({
            name: "".concat(this.$style.name, "-variables")
          }, this.$styleOptions)), (f = this.$style) === null || f === void 0 || f.loadStyle(M({
            name: "".concat(this.$style.name, "-style")
          }, this.$styleOptions), y), H.setLoadedStyleName(this.$style.name);
        }
        if (!H.isStyleNameLoaded("layer-order")) {
          var w, O, _ = (w = this.$style) === null || w === void 0 || (O = w.getLayerOrderThemeCSS) === null || O === void 0 ? void 0 : O.call(w);
          D.load(_, M({
            name: "layer-order",
            first: !0
          }, this.$styleOptions)), H.setLoadedStyleName("layer-order");
        }
      }
    },
    _loadScopedThemeStyles: function(t) {
      var n, r, i, o = ((n = this.$style) === null || n === void 0 || (r = n.getPresetTheme) === null || r === void 0 ? void 0 : r.call(n, t, "[".concat(this.$attrSelector, "]"))) || {}, a = o.css, s = (i = this.$style) === null || i === void 0 ? void 0 : i.load(a, M({
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
      Ae.clearLoadedStyleNames(), ie.on("theme:change", t);
    },
    _removeThemeListeners: function() {
      ie.off("theme:change", this._loadCoreStyles), ie.off("theme:change", this._load), ie.off("theme:change", this._themeScopedListener);
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
      return Cn(t, n, r);
    },
    _getPTValue: function() {
      var t, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", i = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {}, o = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : !0, a = /./g.test(r) && !!i[r.split(".")[0]], s = this._getPropValue("ptOptions") || ((t = this.$primevueConfig) === null || t === void 0 ? void 0 : t.ptOptions) || {}, l = s.mergeSections, u = l === void 0 ? !0 : l, d = s.mergeProps, c = d === void 0 ? !1 : d, p = o ? a ? this._useGlobalPT(this._getPTClassValue, r, i) : this._useDefaultPT(this._getPTClassValue, r, i) : void 0, f = a ? void 0 : this._getPTSelf(n, this._getPTClassValue, r, M(M({}, i), {}, {
        global: p || {}
      })), m = this._getPTDatasets(r);
      return u || !u && f ? c ? this._mergeProps(c, p, f, m) : M(M(M({}, p), f), m) : M(M({}, f), m);
    },
    _getPTSelf: function() {
      for (var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length, r = new Array(n > 1 ? n - 1 : 0), i = 1; i < n; i++)
        r[i - 1] = arguments[i];
      return v(
        this._usePT.apply(this, [this._getPT(t, this.$name)].concat(r)),
        // Exp; <component :pt="{}"
        this._usePT.apply(this, [this.$_attrsPT].concat(r))
        // Exp; <component :pt:[passthrough_key]:[attribute]="{value}" or <component :pt:[passthrough_key]="() =>{value}"
      );
    },
    _getPTDatasets: function() {
      var t, n, r = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", i = "data-pc-", o = r === "root" && F((t = this.pt) === null || t === void 0 ? void 0 : t["data-pc-section"]);
      return r !== "transition" && M(M({}, r === "root" && M(M(tt({}, "".concat(i, "name"), Se(o ? (n = this.pt) === null || n === void 0 ? void 0 : n["data-pc-section"] : this.$.type.name)), o && tt({}, "".concat(i, "extend"), Se(this.$.type.name))), {}, tt({}, "".concat(this.$attrSelector), ""))), {}, tt({}, "".concat(i, "section"), Se(r)));
    },
    _getPTClassValue: function() {
      var t = this._getOptionValue.apply(this, arguments);
      return de(t) || Br(t) ? {
        class: t
      } : t;
    },
    _getPT: function(t) {
      var n = this, r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", i = arguments.length > 2 ? arguments[2] : void 0, o = function(s) {
        var l, u = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1, d = i ? i(s) : s, c = Se(r), p = Se(n.$name);
        return (l = u ? c !== p ? d?.[c] : void 0 : d?.[c]) !== null && l !== void 0 ? l : d;
      };
      return t != null && t.hasOwnProperty("_usept") ? {
        _usept: t._usept,
        originalValue: o(t.originalValue),
        value: o(t.value)
      } : o(t, !0);
    },
    _usePT: function(t, n, r, i) {
      var o = function(x) {
        return n(x, r, i);
      };
      if (t != null && t.hasOwnProperty("_usept")) {
        var a, s = t._usept || ((a = this.$primevueConfig) === null || a === void 0 ? void 0 : a.ptOptions) || {}, l = s.mergeSections, u = l === void 0 ? !0 : l, d = s.mergeProps, c = d === void 0 ? !1 : d, p = o(t.originalValue), f = o(t.value);
        return p === void 0 && f === void 0 ? void 0 : de(f) ? f : de(p) ? p : u || !u && f ? c ? this._mergeProps(c, p, f) : M(M({}, p), f) : f;
      }
      return o(t);
    },
    _useGlobalPT: function(t, n, r) {
      return this._usePT(this.globalPT, t, n, r);
    },
    _useDefaultPT: function(t, n, r) {
      return this._usePT(this.defaultPT, t, n, r);
    },
    ptm: function() {
      var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
      return this._getPTValue(this.pt, t, M(M({}, this.$params), n));
    },
    ptmi: function() {
      var t, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, i = v(this.$_attrsWithoutPT, this.ptm(n, r));
      return i?.hasOwnProperty("id") && ((t = i.id) !== null && t !== void 0 || (i.id = this.$id)), i;
    },
    ptmo: function() {
      var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", r = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
      return this._getPTValue(t, n, M({
        instance: this
      }, r), !1);
    },
    cx: function() {
      var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
      return this.isUnstyled ? void 0 : this._getOptionValue(this.$style.classes, t, M(M({}, this.$params), n));
    },
    sx: function() {
      var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0, r = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
      if (n) {
        var i = this._getOptionValue(this.$style.inlineStyles, t, M(M({}, this.$params), r)), o = this._getOptionValue(Xn.inlineStyles, t, M(M({}, this.$params), r));
        return [o, i];
      }
    }
  },
  computed: {
    globalPT: function() {
      var t, n = this;
      return this._getPT((t = this.$primevueConfig) === null || t === void 0 ? void 0 : t.pt, void 0, function(r) {
        return ce(r, {
          instance: n
        });
      });
    },
    defaultPT: function() {
      var t, n = this;
      return this._getPT((t = this.$primevueConfig) === null || t === void 0 ? void 0 : t.pt, void 0, function(r) {
        return n._getOptionValue(r, n.$name, M({}, n.$params)) || ce(r, M({}, n.$params));
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
        var i = Ye(r, 1), o = i[0];
        return n?.includes(o);
      }));
    },
    $theme: function() {
      var t;
      return (t = this.$primevueConfig) === null || t === void 0 ? void 0 : t.theme;
    },
    $style: function() {
      return M(M({
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
        var n = Ye(t, 1), r = n[0];
        return r?.startsWith("pt:");
      }).reduce(function(t, n) {
        var r = Ye(n, 2), i = r[0], o = r[1], a = i.split(":"), s = Da(a), l = en(s).slice(1);
        return l?.reduce(function(u, d, c, p) {
          return !u[d] && (u[d] = c === p.length - 1 ? o : {}), u[d];
        }, t), t;
      }, {});
    },
    $_attrsWithoutPT: function() {
      return Object.entries(this.$attrs || {}).filter(function(t) {
        var n = Ye(t, 1), r = n[0];
        return !(r != null && r.startsWith("pt:"));
      }).reduce(function(t, n) {
        var r = Ye(n, 2), i = r[0], o = r[1];
        return t[i] = o, t;
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
`, Ua = D.extend({
  name: "baseicon",
  css: Ka
});
function lt(e) {
  "@babel/helpers - typeof";
  return lt = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, lt(e);
}
function tr(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(e);
    t && (r = r.filter(function(i) {
      return Object.getOwnPropertyDescriptor(e, i).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function nr(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? tr(Object(n), !0).forEach(function(r) {
      Ha(e, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : tr(Object(n)).forEach(function(r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return e;
}
function Ha(e, t, n) {
  return (t = Wa(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Wa(e) {
  var t = Ga(e, "string");
  return lt(t) == "symbol" ? t : t + "";
}
function Ga(e, t) {
  if (lt(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (lt(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
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
      var t = Pe(this.label);
      return nr(nr({}, !this.isUnstyled && {
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
function ut(e) {
  "@babel/helpers - typeof";
  return ut = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, ut(e);
}
function rr(e, t) {
  return Ja(e) || Za(e, t) || Ya(e, t) || qa();
}
function qa() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Ya(e, t) {
  if (e) {
    if (typeof e == "string") return or(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? or(e, t) : void 0;
  }
}
function or(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function Za(e, t) {
  var n = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (n != null) {
    var r, i, o, a, s = [], l = !0, u = !1;
    try {
      if (o = (n = n.call(e)).next, t !== 0) for (; !(l = (r = o.call(n)).done) && (s.push(r.value), s.length !== t); l = !0) ;
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
function Ja(e) {
  if (Array.isArray(e)) return e;
}
function ir(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(e);
    t && (r = r.filter(function(i) {
      return Object.getOwnPropertyDescriptor(e, i).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function R(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? ir(Object(n), !0).forEach(function(r) {
      tn(e, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : ir(Object(n)).forEach(function(r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return e;
}
function tn(e, t, n) {
  return (t = Qa(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Qa(e) {
  var t = Xa(e, "string");
  return ut(t) == "symbol" ? t : t + "";
}
function Xa(e, t) {
  if (ut(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (ut(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var B = {
  _getMeta: function() {
    return [Oe(arguments.length <= 0 ? void 0 : arguments[0]) || arguments.length <= 0 ? void 0 : arguments[0], ce(Oe(arguments.length <= 0 ? void 0 : arguments[0]) ? arguments.length <= 0 ? void 0 : arguments[0] : arguments.length <= 1 ? void 0 : arguments[1])];
  },
  _getConfig: function(t, n) {
    var r, i, o;
    return (r = (t == null || (i = t.instance) === null || i === void 0 ? void 0 : i.$primevue) || (n == null || (o = n.ctx) === null || o === void 0 || (o = o.appContext) === null || o === void 0 || (o = o.config) === null || o === void 0 || (o = o.globalProperties) === null || o === void 0 ? void 0 : o.$primevue)) === null || r === void 0 ? void 0 : r.config;
  },
  _getOptionValue: Cn,
  _getPTValue: function() {
    var t, n, r = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, i = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, o = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : "", a = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : {}, s = arguments.length > 4 && arguments[4] !== void 0 ? arguments[4] : !0, l = function() {
      var O = B._getOptionValue.apply(B, arguments);
      return de(O) || Br(O) ? {
        class: O
      } : O;
    }, u = ((t = r.binding) === null || t === void 0 || (t = t.value) === null || t === void 0 ? void 0 : t.ptOptions) || ((n = r.$primevueConfig) === null || n === void 0 ? void 0 : n.ptOptions) || {}, d = u.mergeSections, c = d === void 0 ? !0 : d, p = u.mergeProps, f = p === void 0 ? !1 : p, m = s ? B._useDefaultPT(r, r.defaultPT(), l, o, a) : void 0, x = B._usePT(r, B._getPT(i, r.$name), l, o, R(R({}, a), {}, {
      global: m || {}
    })), y = B._getPTDatasets(r, o);
    return c || !c && x ? f ? B._mergeProps(r, f, m, x, y) : R(R(R({}, m), x), y) : R(R({}, x), y);
  },
  _getPTDatasets: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", r = "data-pc-";
    return R(R({}, n === "root" && tn({}, "".concat(r, "name"), Se(t.$name))), {}, tn({}, "".concat(r, "section"), Se(n)));
  },
  _getPT: function(t) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", r = arguments.length > 2 ? arguments[2] : void 0, i = function(a) {
      var s, l = r ? r(a) : a, u = Se(n);
      return (s = l?.[u]) !== null && s !== void 0 ? s : l;
    };
    return t && Object.hasOwn(t, "_usept") ? {
      _usept: t._usept,
      originalValue: i(t.originalValue),
      value: i(t.value)
    } : i(t);
  },
  _usePT: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 ? arguments[1] : void 0, r = arguments.length > 2 ? arguments[2] : void 0, i = arguments.length > 3 ? arguments[3] : void 0, o = arguments.length > 4 ? arguments[4] : void 0, a = function(y) {
      return r(y, i, o);
    };
    if (n && Object.hasOwn(n, "_usept")) {
      var s, l = n._usept || ((s = t.$primevueConfig) === null || s === void 0 ? void 0 : s.ptOptions) || {}, u = l.mergeSections, d = u === void 0 ? !0 : u, c = l.mergeProps, p = c === void 0 ? !1 : c, f = a(n.originalValue), m = a(n.value);
      return f === void 0 && m === void 0 ? void 0 : de(m) ? m : de(f) ? f : d || !d && m ? p ? B._mergeProps(t, p, f, m) : R(R({}, f), m) : m;
    }
    return a(n);
  },
  _useDefaultPT: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, r = arguments.length > 2 ? arguments[2] : void 0, i = arguments.length > 3 ? arguments[3] : void 0, o = arguments.length > 4 ? arguments[4] : void 0;
    return B._usePT(t, n, r, i, o);
  },
  _loadStyles: function() {
    var t, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, r = arguments.length > 1 ? arguments[1] : void 0, i = arguments.length > 2 ? arguments[2] : void 0, o = B._getConfig(r, i), a = {
      nonce: o == null || (t = o.csp) === null || t === void 0 ? void 0 : t.nonce
    };
    B._loadCoreStyles(n, a), B._loadThemeStyles(n, a), B._loadScopedThemeStyles(n, a), B._removeThemeListeners(n), n.$loadStyles = function() {
      return B._loadThemeStyles(n, a);
    }, B._themeChangeListener(n.$loadStyles);
  },
  _loadCoreStyles: function() {
    var t, n, r = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, i = arguments.length > 1 ? arguments[1] : void 0;
    if (!Ae.isStyleNameLoaded((t = r.$style) === null || t === void 0 ? void 0 : t.name) && (n = r.$style) !== null && n !== void 0 && n.name) {
      var o;
      D.loadCSS(i), (o = r.$style) === null || o === void 0 || o.loadCSS(i), Ae.setLoadedStyleName(r.$style.name);
    }
  },
  _loadThemeStyles: function() {
    var t, n, r, i = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, o = arguments.length > 1 ? arguments[1] : void 0;
    if (!(i != null && i.isUnstyled() || (i == null || (t = i.theme) === null || t === void 0 ? void 0 : t.call(i)) === "none")) {
      if (!H.isStyleNameLoaded("common")) {
        var a, s, l = ((a = i.$style) === null || a === void 0 || (s = a.getCommonTheme) === null || s === void 0 ? void 0 : s.call(a)) || {}, u = l.primitive, d = l.semantic, c = l.global, p = l.style;
        D.load(u?.css, R({
          name: "primitive-variables"
        }, o)), D.load(d?.css, R({
          name: "semantic-variables"
        }, o)), D.load(c?.css, R({
          name: "global-variables"
        }, o)), D.loadStyle(R({
          name: "global-style"
        }, o), p), H.setLoadedStyleName("common");
      }
      if (!H.isStyleNameLoaded((n = i.$style) === null || n === void 0 ? void 0 : n.name) && (r = i.$style) !== null && r !== void 0 && r.name) {
        var f, m, x, y, w = ((f = i.$style) === null || f === void 0 || (m = f.getDirectiveTheme) === null || m === void 0 ? void 0 : m.call(f)) || {}, O = w.css, _ = w.style;
        (x = i.$style) === null || x === void 0 || x.load(O, R({
          name: "".concat(i.$style.name, "-variables")
        }, o)), (y = i.$style) === null || y === void 0 || y.loadStyle(R({
          name: "".concat(i.$style.name, "-style")
        }, o), _), H.setLoadedStyleName(i.$style.name);
      }
      if (!H.isStyleNameLoaded("layer-order")) {
        var g, T, V = (g = i.$style) === null || g === void 0 || (T = g.getLayerOrderThemeCSS) === null || T === void 0 ? void 0 : T.call(g);
        D.load(V, R({
          name: "layer-order",
          first: !0
        }, o)), H.setLoadedStyleName("layer-order");
      }
    }
  },
  _loadScopedThemeStyles: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 ? arguments[1] : void 0, r = t.preset();
    if (r && t.$attrSelector) {
      var i, o, a, s = ((i = t.$style) === null || i === void 0 || (o = i.getPresetTheme) === null || o === void 0 ? void 0 : o.call(i, r, "[".concat(t.$attrSelector, "]"))) || {}, l = s.css, u = (a = t.$style) === null || a === void 0 ? void 0 : a.load(l, R({
        name: "".concat(t.$attrSelector, "-").concat(t.$style.name)
      }, n));
      t.scopedStyleEl = u.el;
    }
  },
  _themeChangeListener: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : function() {
    };
    Ae.clearLoadedStyleNames(), ie.on("theme:change", t);
  },
  _removeThemeListeners: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    ie.off("theme:change", t.$loadStyles), t.$loadStyles = void 0;
  },
  _hook: function(t, n, r, i, o, a) {
    var s, l, u = "on".concat(Ai(n)), d = B._getConfig(i, o), c = r?.$instance, p = B._usePT(c, B._getPT(i == null || (s = i.value) === null || s === void 0 ? void 0 : s.pt, t), B._getOptionValue, "hooks.".concat(u)), f = B._useDefaultPT(c, d == null || (l = d.pt) === null || l === void 0 || (l = l.directives) === null || l === void 0 ? void 0 : l[t], B._getOptionValue, "hooks.".concat(u)), m = {
      el: r,
      binding: i,
      vnode: o,
      prevVnode: a
    };
    p?.(c, m), f?.(c, m);
  },
  /* eslint-disable-next-line no-unused-vars */
  _mergeProps: function() {
    for (var t = arguments.length > 1 ? arguments[1] : void 0, n = arguments.length, r = new Array(n > 2 ? n - 2 : 0), i = 2; i < n; i++)
      r[i - 2] = arguments[i];
    return Nt(t) ? t.apply(void 0, r) : v.apply(void 0, r);
  },
  _extend: function(t) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, r = function(s, l, u, d, c) {
      var p, f, m, x;
      l._$instances = l._$instances || {};
      var y = B._getConfig(u, d), w = l._$instances[t] || {}, O = Pe(w) ? R(R({}, n), n?.methods) : {};
      l._$instances[t] = R(R({}, w), {}, {
        /* new instance variables to pass in directive methods */
        $name: t,
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
        $attrSelector: (p = l.$pd) === null || p === void 0 || (p = p[t]) === null || p === void 0 ? void 0 : p.attrSelector,
        /* computed instance variables */
        defaultPT: function() {
          return B._getPT(y?.pt, void 0, function(g) {
            var T;
            return g == null || (T = g.directives) === null || T === void 0 ? void 0 : T[t];
          });
        },
        isUnstyled: function() {
          var g, T;
          return ((g = l._$instances[t]) === null || g === void 0 || (g = g.$binding) === null || g === void 0 || (g = g.value) === null || g === void 0 ? void 0 : g.unstyled) !== void 0 ? (T = l._$instances[t]) === null || T === void 0 || (T = T.$binding) === null || T === void 0 || (T = T.value) === null || T === void 0 ? void 0 : T.unstyled : y?.unstyled;
        },
        theme: function() {
          var g;
          return (g = l._$instances[t]) === null || g === void 0 || (g = g.$primevueConfig) === null || g === void 0 ? void 0 : g.theme;
        },
        preset: function() {
          var g;
          return (g = l._$instances[t]) === null || g === void 0 || (g = g.$binding) === null || g === void 0 || (g = g.value) === null || g === void 0 ? void 0 : g.dt;
        },
        /* instance's methods */
        ptm: function() {
          var g, T = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", V = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
          return B._getPTValue(l._$instances[t], (g = l._$instances[t]) === null || g === void 0 || (g = g.$binding) === null || g === void 0 || (g = g.value) === null || g === void 0 ? void 0 : g.pt, T, R({}, V));
        },
        ptmo: function() {
          var g = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, T = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", V = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
          return B._getPTValue(l._$instances[t], g, T, V, !1);
        },
        cx: function() {
          var g, T, V = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", z = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
          return (g = l._$instances[t]) !== null && g !== void 0 && g.isUnstyled() ? void 0 : B._getOptionValue((T = l._$instances[t]) === null || T === void 0 || (T = T.$style) === null || T === void 0 ? void 0 : T.classes, V, R({}, z));
        },
        sx: function() {
          var g, T = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", V = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0, z = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
          return V ? B._getOptionValue((g = l._$instances[t]) === null || g === void 0 || (g = g.$style) === null || g === void 0 ? void 0 : g.inlineStyles, T, R({}, z)) : void 0;
        }
      }, O), l.$instance = l._$instances[t], (f = (m = l.$instance)[s]) === null || f === void 0 || f.call(m, l, u, d, c), l["$".concat(t)] = l.$instance, B._hook(t, s, l, u, d, c), l.$pd || (l.$pd = {}), l.$pd[t] = R(R({}, (x = l.$pd) === null || x === void 0 ? void 0 : x[t]), {}, {
        name: t,
        instance: l._$instances[t]
      });
    }, i = function(s) {
      var l, u, d, c = s._$instances[t], p = c?.watch, f = function(y) {
        var w, O = y.newValue, _ = y.oldValue;
        return p == null || (w = p.config) === null || w === void 0 ? void 0 : w.call(c, O, _);
      }, m = function(y) {
        var w, O = y.newValue, _ = y.oldValue;
        return p == null || (w = p["config.ripple"]) === null || w === void 0 ? void 0 : w.call(c, O, _);
      };
      c.$watchersCallback = {
        config: f,
        "config.ripple": m
      }, p == null || (l = p.config) === null || l === void 0 || l.call(c, c?.$primevueConfig), Ee.on("config:change", f), p == null || (u = p["config.ripple"]) === null || u === void 0 || u.call(c, c == null || (d = c.$primevueConfig) === null || d === void 0 ? void 0 : d.ripple), Ee.on("config:ripple:change", m);
    }, o = function(s) {
      var l = s._$instances[t].$watchersCallback;
      l && (Ee.off("config:change", l.config), Ee.off("config:ripple:change", l["config.ripple"]), s._$instances[t].$watchersCallback = void 0);
    };
    return {
      created: function(s, l, u, d) {
        s.$pd || (s.$pd = {}), s.$pd[t] = {
          name: t,
          attrSelector: Zi("pd")
        }, r("created", s, l, u, d);
      },
      beforeMount: function(s, l, u, d) {
        var c;
        B._loadStyles((c = s.$pd[t]) === null || c === void 0 ? void 0 : c.instance, l, u), r("beforeMount", s, l, u, d), i(s);
      },
      mounted: function(s, l, u, d) {
        var c;
        B._loadStyles((c = s.$pd[t]) === null || c === void 0 ? void 0 : c.instance, l, u), r("mounted", s, l, u, d);
      },
      beforeUpdate: function(s, l, u, d) {
        r("beforeUpdate", s, l, u, d);
      },
      updated: function(s, l, u, d) {
        var c;
        B._loadStyles((c = s.$pd[t]) === null || c === void 0 ? void 0 : c.instance, l, u), r("updated", s, l, u, d);
      },
      beforeUnmount: function(s, l, u, d) {
        var c;
        o(s), B._removeThemeListeners((c = s.$pd[t]) === null || c === void 0 ? void 0 : c.instance), r("beforeUnmount", s, l, u, d);
      },
      unmounted: function(s, l, u, d) {
        var c;
        (c = s.$pd[t]) === null || c === void 0 || (c = c.instance) === null || c === void 0 || (c = c.scopedStyleEl) === null || c === void 0 || (c = c.value) === null || c === void 0 || c.remove(), r("unmounted", s, l, u, d);
      }
    };
  },
  extend: function() {
    var t = B._getMeta.apply(B, arguments), n = rr(t, 2), r = n[0], i = n[1];
    return R({
      extend: function() {
        var a = B._getMeta.apply(B, arguments), s = rr(a, 2), l = s[0], u = s[1];
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
}, ns = D.extend({
  name: "ripple-directive",
  style: es,
  classes: ts
}), rs = B.extend({
  style: ns
});
function dt(e) {
  "@babel/helpers - typeof";
  return dt = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, dt(e);
}
function os(e) {
  return ls(e) || ss(e) || as(e) || is();
}
function is() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function as(e, t) {
  if (e) {
    if (typeof e == "string") return nn(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? nn(e, t) : void 0;
  }
}
function ss(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function ls(e) {
  if (Array.isArray(e)) return nn(e);
}
function nn(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function ar(e, t, n) {
  return (t = us(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function us(e) {
  var t = ds(e, "string");
  return dt(t) == "symbol" ? t : t + "";
}
function ds(e, t) {
  if (dt(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (dt(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var It = rs.extend("ripple", {
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
      n || (n = Ri("span", ar(ar({
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
      var n = this, r = t.currentTarget, i = this.getInk(r);
      if (!(!i || getComputedStyle(i, null).display === "none")) {
        if (!this.isUnstyled() && Ut(i, "p-ink-active"), i.setAttribute("data-p-ink-active", "false"), !Le(i) && !$e(i)) {
          var o = Math.max(In(r), Nr(r));
          i.style.height = o + "px", i.style.width = o + "px";
        }
        var a = et(r), s = t.pageX - a.left + document.body.scrollTop - $e(i) / 2, l = t.pageY - a.top + document.body.scrollLeft - Le(i) / 2;
        i.style.top = l + "px", i.style.left = s + "px", !this.isUnstyled() && Ei(i, "p-ink-active"), i.setAttribute("data-p-ink-active", "true"), this.timeout = setTimeout(function() {
          i && (!n.isUnstyled() && Ut(i, "p-ink-active"), i.setAttribute("data-p-ink-active", "false"));
        }, 401);
      }
    },
    onAnimationEnd: function(t) {
      this.timeout && clearTimeout(this.timeout), !this.isUnstyled() && Ut(t.currentTarget, "p-ink-active"), t.currentTarget.setAttribute("data-p-ink-active", "false");
    },
    getInk: function(t) {
      return t && t.children ? os(t.children).find(function(n) {
        return Xe(n, "data-pc-name") === "ripple";
      }) : void 0;
    }
  }
});
function ct(e) {
  "@babel/helpers - typeof";
  return ct = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, ct(e);
}
function cs(e, t) {
  if (!(e instanceof t)) throw new TypeError("Cannot call a class as a function");
}
function ps(e, t) {
  for (var n = 0; n < t.length; n++) {
    var r = t[n];
    r.enumerable = r.enumerable || !1, r.configurable = !0, "value" in r && (r.writable = !0), Object.defineProperty(e, hs(r.key), r);
  }
}
function fs(e, t, n) {
  return t && ps(e.prototype, t), Object.defineProperty(e, "prototype", { writable: !1 }), e;
}
function hs(e) {
  var t = ms(e, "string");
  return ct(t) == "symbol" ? t : t + "";
}
function ms(e, t) {
  if (ct(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (ct(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return String(e);
}
var bs = /* @__PURE__ */ (function() {
  function e(t) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : function() {
    };
    cs(this, e), this.element = t, this.listener = n;
  }
  return fs(e, [{
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
})(), gs = On();
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
function sr(e, t) {
  const n = e.style;
  n.setProperty("position", "fixed", "important"), n.setProperty("inset", "auto", "important"), n.setProperty("margin", "0", "important"), n.setProperty("position-anchor", t), n.setProperty("position-area", "bottom span-right"), n.setProperty("position-try-fallbacks", "flip-block, flip-inline, flip-block flip-inline"), n.setProperty("min-width", "min(anchor-size(width), 100vw)", "important"), n.setProperty("max-width", "stretch", "important");
}
function ks(e, t) {
  if (!xs.test(e.className))
    return;
  const n = e.style.cssText;
  sr(e, t), e.getAttribute("popover") !== "manual" && e.setAttribute("popover", "manual");
  try {
    e.matches(":popover-open") || e.showPopover();
  } catch {
  }
  if (!e.matches(":popover-open")) {
    e.removeAttribute("popover"), e.style.cssText = n;
    return;
  }
  if (!Vt.has(e)) {
    const r = new MutationObserver(() => {
      const i = e.style;
      (i.top !== "auto" || i.left !== "auto" || i.margin !== "0px" || i.getPropertyPriority("top") !== "important" || i.getPropertyPriority("left") !== "important" || i.getPropertyPriority("margin") !== "important" || i.getPropertyPriority("min-width") !== "important" || i.maxWidth !== "stretch" || i.getPropertyPriority("max-width") !== "important") && sr(e, t);
    });
    r.observe(e, { attributes: !0, attributeFilter: ["style"] }), Vt.set(e, r);
  }
}
function Pn(e) {
  const t = Vt.get(e);
  t && (t.disconnect(), Vt.delete(e));
}
function Ss(e) {
  const t = e && typeof e.getRootNode == "function" ? e.getRootNode() : null;
  return t instanceof ShadowRoot ? t : null;
}
function rn(e) {
  e.style.top = "0px", e.style.left = "0px";
  const t = e.getBoundingClientRect();
  e.style.top = `${-window.scrollY - t.top}px`, e.style.left = `${-window.scrollX - t.left}px`;
}
const Dt = /* @__PURE__ */ new Set(), Ln = /* @__PURE__ */ new WeakMap();
let lr = !1, on = !1;
function $s() {
  on = !1;
  for (const e of Dt) {
    if (!e.isConnected) {
      for (const t of Array.from(e.children))
        t instanceof HTMLElement && Pn(t);
      Dt.delete(e), Ln.get(e)?.disconnect();
      continue;
    }
    e.childElementCount > 0 && rn(e);
  }
}
function ur() {
  on || (on = !0, requestAnimationFrame($s));
}
function Cs(e) {
  const t = document.createElement("div");
  t.setAttribute(vs, "");
  const n = eo();
  if (t.style.cssText = n ? "position:fixed;width:0 !important;height:0 !important;margin:0 !important;border:0 !important;padding:0 !important;background:transparent !important;color:inherit !important;overflow:visible !important;" : "position:fixed;top:0;left:0;width:0;height:0;", n && t.setAttribute("popover", "manual"), e.appendChild(t), n) {
    try {
      t.showPopover();
    } catch {
    }
    t.matches(":popover-open") || (t.removeAttribute("popover"), t.style.cssText = "position:fixed;top:0;left:0;width:0;height:0;");
  }
  rn(t);
  const r = new MutationObserver((i) => {
    const o = t.__wippyAnchorName;
    for (const a of i) {
      if (o)
        for (const s of Array.from(a.addedNodes))
          s instanceof HTMLElement && ks(s, o);
      for (const s of Array.from(a.removedNodes))
        s instanceof HTMLElement && Pn(s);
    }
    t.isConnected && t.childElementCount > 0 && rn(t);
  });
  return r.observe(t, { childList: !0 }), Ln.set(t, r), Dt.add(t), lr || (lr = !0, window.addEventListener("scroll", ur, { capture: !0, passive: !0 }), window.addEventListener("resize", ur, { passive: !0 })), t;
}
function dr(e) {
  if (!(!e.hostRoot || e.layer) && (e.layer = Cs(e.hostRoot), ys())) {
    const t = e.$el ? e.$el.parentElement : null;
    t && (e.anchorName = `--wippy-a-${++ws}`, e.anchorTrigger = t, t.style.setProperty("anchor-name", e.anchorName), e.layer.__wippyAnchorName = e.anchorName);
  }
}
function cr(e) {
  if (e.anchorTrigger && (e.anchorTrigger.style.removeProperty("anchor-name"), e.anchorTrigger = null), e.anchorName = null, e.layer) {
    for (const t of Array.from(e.layer.children))
      t instanceof HTMLElement && Pn(t);
    Dt.delete(e.layer), Ln.get(e.layer)?.disconnect(), e.layer.remove(), e.layer = null;
  }
}
let pr = !1;
function Os() {
  if (pr)
    return;
  pr = !0;
  const e = _n;
  e.computed = e.computed || {}, e.computed.inline = function() {
    return !!this.disabled || this.appendTo === "self";
  }, e.computed.resolvedTarget = function() {
    return this.appendTo == null || this.appendTo === "body" ? this.hostRoot ? this.layer : document.body : this.appendTo;
  }, e.data = function() {
    return { mounted: !1, hostRoot: null, layer: null, anchorName: null, anchorTrigger: null };
  }, e.mounted = function() {
    Xr() && (this.hostRoot = Ss(this.$el), this.mounted = !0, this.hostRoot && (this.inline || dr(this), this.$watch("inline", (t) => {
      t ? cr(this) : dr(this);
    })));
  }, e.render = function() {
    return this.inline ? L(this.$slots, "default", { key: 0 }) : this.mounted ? Jo(Tr, { key: 1, to: this.resolvedTarget || document.body }, [
      L(this.$slots, "default")
    ]) : A("", !0);
  }, e.unmounted = function() {
    cr(this);
  };
}
const Is = {
  install: (e) => {
    Os(), e.use(Ba, { theme: "none" });
  }
};
var Ft = {
  name: "SpinnerIcon",
  extends: xe
};
function Ts(e) {
  return As(e) || Ls(e) || Ps(e) || _s();
}
function _s() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Ps(e, t) {
  if (e) {
    if (typeof e == "string") return an(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? an(e, t) : void 0;
  }
}
function Ls(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function As(e) {
  if (Array.isArray(e)) return an(e);
}
function an(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function zs(e, t, n, r, i, o) {
  return h(), b("svg", v({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), Ts(t[0] || (t[0] = [C("path", {
    d: "M6.99701 14C5.85441 13.999 4.72939 13.7186 3.72012 13.1832C2.71084 12.6478 1.84795 11.8737 1.20673 10.9284C0.565504 9.98305 0.165424 8.89526 0.041387 7.75989C-0.0826496 6.62453 0.073125 5.47607 0.495122 4.4147C0.917119 3.35333 1.59252 2.4113 2.46241 1.67077C3.33229 0.930247 4.37024 0.413729 5.4857 0.166275C6.60117 -0.0811796 7.76026 -0.0520535 8.86188 0.251112C9.9635 0.554278 10.9742 1.12227 11.8057 1.90555C11.915 2.01493 11.9764 2.16319 11.9764 2.31778C11.9764 2.47236 11.915 2.62062 11.8057 2.73C11.7521 2.78503 11.688 2.82877 11.6171 2.85864C11.5463 2.8885 11.4702 2.90389 11.3933 2.90389C11.3165 2.90389 11.2404 2.8885 11.1695 2.85864C11.0987 2.82877 11.0346 2.78503 10.9809 2.73C9.9998 1.81273 8.73246 1.26138 7.39226 1.16876C6.05206 1.07615 4.72086 1.44794 3.62279 2.22152C2.52471 2.99511 1.72683 4.12325 1.36345 5.41602C1.00008 6.70879 1.09342 8.08723 1.62775 9.31926C2.16209 10.5513 3.10478 11.5617 4.29713 12.1803C5.48947 12.7989 6.85865 12.988 8.17414 12.7157C9.48963 12.4435 10.6711 11.7264 11.5196 10.6854C12.3681 9.64432 12.8319 8.34282 12.8328 7C12.8328 6.84529 12.8943 6.69692 13.0038 6.58752C13.1132 6.47812 13.2616 6.41667 13.4164 6.41667C13.5712 6.41667 13.7196 6.47812 13.8291 6.58752C13.9385 6.69692 14 6.84529 14 7C14 8.85651 13.2622 10.637 11.9489 11.9497C10.6356 13.2625 8.85432 14 6.99701 14Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
Ft.render = zs;
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
  root: function(t) {
    var n = t.props, r = t.instance;
    return ["p-badge p-component", {
      "p-badge-circle": F(n.value) && String(n.value).length === 1,
      "p-badge-dot": Pe(n.value) && !r.$slots.default,
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
}, js = D.extend({
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
function pt(e) {
  "@babel/helpers - typeof";
  return pt = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, pt(e);
}
function fr(e, t, n) {
  return (t = Ds(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Ds(e) {
  var t = Ms(e, "string");
  return pt(t) == "symbol" ? t : t + "";
}
function Ms(e, t) {
  if (pt(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (pt(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var to = {
  name: "Badge",
  extends: Vs,
  inheritAttrs: !1,
  computed: {
    dataP: function() {
      return ae(fr(fr({
        circle: this.value != null && String(this.value).length === 1,
        empty: this.value == null && !this.$slots.default
      }, this.severity, this.severity), this.size, this.size));
    }
  }
}, Ns = ["data-p"];
function Fs(e, t, n, r, i, o) {
  return h(), b("span", v({
    class: e.cx("root"),
    "data-p": o.dataP
  }, e.ptmi("root")), [L(e.$slots, "default", {}, function() {
    return [Ce(N(e.value), 1)];
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
function ft(e) {
  "@babel/helpers - typeof";
  return ft = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, ft(e);
}
function we(e, t, n) {
  return (t = Ks(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Ks(e) {
  var t = Us(e, "string");
  return ft(t) == "symbol" ? t : t + "";
}
function Us(e, t) {
  if (ft(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (ft(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var Hs = {
  root: function(t) {
    var n = t.instance, r = t.props;
    return ["p-button p-component", we(we(we(we(we(we(we(we(we({
      "p-button-icon-only": n.hasIcon && !r.label && !r.badge,
      "p-button-vertical": (r.iconPos === "top" || r.iconPos === "bottom") && r.label,
      "p-button-loading": r.loading,
      "p-button-link": r.link || r.variant === "link"
    }, "p-button-".concat(r.severity), r.severity), "p-button-raised", r.raised), "p-button-rounded", r.rounded), "p-button-text", r.text || r.variant === "text"), "p-button-outlined", r.outlined || r.variant === "outlined"), "p-button-sm", r.size === "small"), "p-button-lg", r.size === "large"), "p-button-plain", r.plain), "p-button-fluid", n.hasFluid)];
  },
  loadingIcon: "p-button-loading-icon",
  icon: function(t) {
    var n = t.props;
    return ["p-button-icon", we({}, "p-button-icon-".concat(n.iconPos), n.label)];
  },
  label: "p-button-label"
}, Ws = D.extend({
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
function ht(e) {
  "@babel/helpers - typeof";
  return ht = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, ht(e);
}
function le(e, t, n) {
  return (t = qs(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function qs(e) {
  var t = Ys(e, "string");
  return ht(t) == "symbol" ? t : t + "";
}
function Ys(e, t) {
  if (ht(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (ht(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var mt = {
  name: "Button",
  extends: Gs,
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
      return Pe(this.fluid) ? !!this.$pcFluid : this.fluid;
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
    SpinnerIcon: Ft,
    Badge: to
  },
  directives: {
    ripple: It
  }
}, Zs = ["data-p"], Js = ["data-p"];
function Qs(e, t, n, r, i, o) {
  var a = re("SpinnerIcon"), s = re("Badge"), l = Ct("ripple");
  return e.asChild ? L(e.$slots, "default", {
    key: 1,
    class: ne(e.cx("root")),
    a11yAttrs: o.a11yAttrs
  }) : He((h(), K(me(e.as), v({
    key: 0,
    class: e.cx("root"),
    "data-p": o.dataP
  }, o.attrs), {
    default: ue(function() {
      return [L(e.$slots, "default", {}, function() {
        return [e.loading ? L(e.$slots, "loadingicon", v({
          key: 0,
          class: [e.cx("loadingIcon"), e.cx("icon")]
        }, e.ptm("loadingIcon")), function() {
          return [e.loadingIcon ? (h(), b("span", v({
            key: 0,
            class: [e.cx("loadingIcon"), e.cx("icon"), e.loadingIcon]
          }, e.ptm("loadingIcon")), null, 16)) : (h(), K(a, v({
            key: 1,
            class: [e.cx("loadingIcon"), e.cx("icon")],
            spin: ""
          }, e.ptm("loadingIcon")), null, 16, ["class"]))];
        }) : L(e.$slots, "icon", v({
          key: 1,
          class: [e.cx("icon")]
        }, e.ptm("icon")), function() {
          return [e.icon ? (h(), b("span", v({
            key: 0,
            class: [e.cx("icon"), e.icon, e.iconClass],
            "data-p": o.dataIconP
          }, e.ptm("icon")), null, 16, Zs)) : A("", !0)];
        }), e.label ? (h(), b("span", v({
          key: 2,
          class: e.cx("label")
        }, e.ptm("label"), {
          "data-p": o.dataLabelP
        }), N(e.label), 17, Js)) : A("", !0), e.badge ? (h(), K(s, {
          key: 3,
          value: e.badge,
          class: ne(e.badgeClass),
          severity: e.badgeSeverity,
          unstyled: e.unstyled,
          pt: e.ptm("pcBadge")
        }, null, 8, ["value", "class", "severity", "unstyled", "pt"])) : A("", !0)];
      })];
    }),
    _: 3
  }, 16, ["class", "data-p"])), [[l]]);
}
mt.render = Qs;
var Xs = {
  root: function(t) {
    var n = t.instance, r = t.props;
    return ["p-tab", {
      "p-tab-active": n.active,
      "p-disabled": r.disabled
    }];
  }
}, el = D.extend({
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
    onKeydown: function(t) {
      switch (t.code) {
        case "ArrowRight":
          this.onArrowRightKey(t);
          break;
        case "ArrowLeft":
          this.onArrowLeftKey(t);
          break;
        case "Home":
          this.onHomeKey(t);
          break;
        case "End":
          this.onEndKey(t);
          break;
        case "PageDown":
          this.onPageDownKey(t);
          break;
        case "PageUp":
          this.onPageUpKey(t);
          break;
        case "Enter":
        case "NumpadEnter":
        case "Space":
          this.onEnterKey(t);
          break;
      }
    },
    onArrowRightKey: function(t) {
      var n = this.findNextTab(t.currentTarget);
      n ? this.changeFocusedTab(t, n) : this.onHomeKey(t), t.preventDefault();
    },
    onArrowLeftKey: function(t) {
      var n = this.findPrevTab(t.currentTarget);
      n ? this.changeFocusedTab(t, n) : this.onEndKey(t), t.preventDefault();
    },
    onHomeKey: function(t) {
      var n = this.findFirstTab();
      this.changeFocusedTab(t, n), t.preventDefault();
    },
    onEndKey: function(t) {
      var n = this.findLastTab();
      this.changeFocusedTab(t, n), t.preventDefault();
    },
    onPageDownKey: function(t) {
      this.scrollInView(this.findLastTab()), t.preventDefault();
    },
    onPageUpKey: function(t) {
      this.scrollInView(this.findFirstTab()), t.preventDefault();
    },
    onEnterKey: function(t) {
      this.changeActiveValue();
    },
    findNextTab: function(t) {
      var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1, r = n ? t : t.nextElementSibling;
      return r ? Xe(r, "data-p-disabled") || Xe(r, "data-pc-section") === "activebar" ? this.findNextTab(r) : Be(r, '[data-pc-name="tab"]') : null;
    },
    findPrevTab: function(t) {
      var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1, r = n ? t : t.previousElementSibling;
      return r ? Xe(r, "data-p-disabled") || Xe(r, "data-pc-section") === "activebar" ? this.findPrevTab(r) : Be(r, '[data-pc-name="tab"]') : null;
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
    changeFocusedTab: function(t, n) {
      ke(n), this.scrollInView(n);
    },
    scrollInView: function(t) {
      var n;
      t == null || (n = t.scrollIntoView) === null || n === void 0 || n.call(t, {
        block: "nearest"
      });
    }
  },
  computed: {
    active: function() {
      var t;
      return Ot((t = this.$pcTabs) === null || t === void 0 ? void 0 : t.d_value, this.value);
    },
    id: function() {
      var t;
      return "".concat((t = this.$pcTabs) === null || t === void 0 ? void 0 : t.$id, "_tab_").concat(this.value);
    },
    ariaControls: function() {
      var t;
      return "".concat((t = this.$pcTabs) === null || t === void 0 ? void 0 : t.$id, "_tabpanel_").concat(this.value);
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
function nl(e, t, n, r, i, o) {
  var a = Ct("ripple");
  return e.asChild ? L(e.$slots, "default", {
    key: 1,
    dataP: o.dataP,
    class: ne(e.cx("root")),
    active: o.active,
    a11yAttrs: o.a11yAttrs,
    onClick: o.onClick
  }) : He((h(), K(me(e.as), v({
    key: 0,
    class: e.cx("root"),
    "data-p": o.dataP,
    onClick: o.onClick
  }, o.attrs), {
    default: ue(function() {
      return [L(e.$slots, "default")];
    }),
    _: 3
  }, 16, ["class", "data-p", "onClick"])), [[a]]);
}
no.render = nl;
var ro = {
  name: "ChevronLeftIcon",
  extends: xe
};
function rl(e) {
  return sl(e) || al(e) || il(e) || ol();
}
function ol() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function il(e, t) {
  if (e) {
    if (typeof e == "string") return sn(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? sn(e, t) : void 0;
  }
}
function al(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function sl(e) {
  if (Array.isArray(e)) return sn(e);
}
function sn(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function ll(e, t, n, r, i, o) {
  return h(), b("svg", v({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), rl(t[0] || (t[0] = [C("path", {
    d: "M9.61296 13C9.50997 13.0005 9.40792 12.9804 9.3128 12.9409C9.21767 12.9014 9.13139 12.8433 9.05902 12.7701L3.83313 7.54416C3.68634 7.39718 3.60388 7.19795 3.60388 6.99022C3.60388 6.78249 3.68634 6.58325 3.83313 6.43628L9.05902 1.21039C9.20762 1.07192 9.40416 0.996539 9.60724 1.00012C9.81032 1.00371 10.0041 1.08597 10.1477 1.22959C10.2913 1.37322 10.3736 1.56698 10.3772 1.77005C10.3808 1.97313 10.3054 2.16968 10.1669 2.31827L5.49496 6.99022L10.1669 11.6622C10.3137 11.8091 10.3962 12.0084 10.3962 12.2161C10.3962 12.4238 10.3137 12.6231 10.1669 12.7701C10.0945 12.8433 10.0083 12.9014 9.91313 12.9409C9.81801 12.9804 9.71596 13.0005 9.61296 13Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
ro.render = ll;
var oo = {
  name: "ChevronRightIcon",
  extends: xe
};
function ul(e) {
  return fl(e) || pl(e) || cl(e) || dl();
}
function dl() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function cl(e, t) {
  if (e) {
    if (typeof e == "string") return ln(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? ln(e, t) : void 0;
  }
}
function pl(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function fl(e) {
  if (Array.isArray(e)) return ln(e);
}
function ln(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function hl(e, t, n, r, i, o) {
  return h(), b("svg", v({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), ul(t[0] || (t[0] = [C("path", {
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
}, bl = D.extend({
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
    showNavigators: function(t) {
      t ? this.bindResizeObserver() : this.unbindResizeObserver();
    },
    activeValue: {
      flush: "post",
      handler: function() {
        this.updateInkBar(), this.bindInkBarObserver();
      }
    }
  },
  mounted: function() {
    var t = this;
    setTimeout(function() {
      t.updateInkBar(), t.bindInkBarObserver();
    }, 150), this.showNavigators && (this.updateButtonState(), this.bindResizeObserver());
  },
  updated: function() {
    this.showNavigators && this.updateButtonState();
  },
  beforeUnmount: function() {
    this.unbindResizeObserver(), this.unbindInkBarObserver();
  },
  methods: {
    onScroll: function(t) {
      this.showNavigators && this.updateButtonState(), t.preventDefault();
    },
    onPrevButtonClick: function() {
      var t = this.$refs.content, n = this.getVisibleButtonWidths(), r = $e(t) - n, i = Math.abs(t.scrollLeft), o = r * 0.8, a = i - o, s = Math.max(a, 0);
      t.scrollLeft = Qt(t) ? -1 * s : s;
    },
    onNextButtonClick: function() {
      var t = this.$refs.content, n = this.getVisibleButtonWidths(), r = $e(t) - n, i = Math.abs(t.scrollLeft), o = r * 0.8, a = i + o, s = t.scrollWidth - r, l = Math.min(a, s);
      t.scrollLeft = Qt(t) ? -1 * l : l;
    },
    bindResizeObserver: function() {
      var t = this;
      this.resizeObserver = new ResizeObserver(function() {
        return t.updateButtonState();
      }), this.resizeObserver.observe(this.$refs.list);
    },
    unbindResizeObserver: function() {
      var t;
      (t = this.resizeObserver) === null || t === void 0 || t.unobserve(this.$refs.list), this.resizeObserver = void 0;
    },
    bindInkBarObserver: function() {
      var t = this;
      this.unbindInkBarObserver();
      var n = this.$refs.content, r = Be(n, '[data-pc-name="tab"][data-p-active="true"]');
      r && (this.inkBarObserver = new ResizeObserver(function() {
        return t.updateInkBar();
      }), this.inkBarObserver.observe(r));
    },
    unbindInkBarObserver: function() {
      var t;
      (t = this.inkBarObserver) === null || t === void 0 || t.disconnect(), this.inkBarObserver = void 0;
    },
    updateInkBar: function() {
      var t = this.$refs, n = t.content, r = t.inkbar, i = t.tabs;
      if (r) {
        var o = Be(n, '[data-pc-name="tab"][data-p-active="true"]');
        this.$pcTabs.isVertical() ? (r.style.height = Nr(o) + "px", r.style.top = et(o).top - et(i).top + "px") : (r.style.width = In(o) + "px", r.style.left = et(o).left - et(i).left + "px");
      }
    },
    updateButtonState: function() {
      var t = this.$refs, n = t.list, r = t.content, i = r.scrollTop, o = r.scrollWidth, a = r.scrollHeight, s = r.offsetWidth, l = r.offsetHeight, u = Math.abs(r.scrollLeft), d = [$e(r), Le(r)], c = d[0], p = d[1];
      this.$pcTabs.isVertical() ? (this.isPrevButtonEnabled = i !== 0, this.isNextButtonEnabled = n.offsetHeight >= l && parseInt(i) !== a - p) : (this.isPrevButtonEnabled = u !== 0, this.isNextButtonEnabled = n.offsetWidth >= s && parseInt(u) !== o - c);
    },
    getVisibleButtonWidths: function() {
      var t = this.$refs, n = t.prevButton, r = t.nextButton, i = 0;
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
function Sl(e, t, n, r, i, o) {
  var a = Ct("ripple");
  return h(), b("div", v({
    ref: "list",
    class: e.cx("root"),
    "data-p": o.dataP
  }, e.ptmi("root")), [o.showNavigators && i.isPrevButtonEnabled ? He((h(), b("button", v({
    key: 0,
    ref: "prevButton",
    type: "button",
    class: e.cx("prevButton"),
    "aria-label": o.prevButtonAriaLabel,
    tabindex: o.$pcTabs.tabindex,
    onClick: t[0] || (t[0] = function() {
      return o.onPrevButtonClick && o.onPrevButtonClick.apply(o, arguments);
    })
  }, e.ptm("prevButton"), {
    "data-pc-group-section": "navigator"
  }), [(h(), K(me(o.templates.previcon || "ChevronLeftIcon"), v({
    "aria-hidden": "true"
  }, e.ptm("prevIcon")), null, 16))], 16, yl)), [[a]]) : A("", !0), C("div", v({
    ref: "content",
    class: e.cx("content"),
    onScroll: t[1] || (t[1] = function() {
      return o.onScroll && o.onScroll.apply(o, arguments);
    }),
    "data-p": o.dataP
  }, e.ptm("content")), [C("div", v({
    ref: "tabs",
    class: e.cx("tabList"),
    role: "tablist",
    "aria-orientation": o.$pcTabs.orientation || "horizontal"
  }, e.ptm("tabList")), [L(e.$slots, "default"), C("span", v({
    ref: "inkbar",
    class: e.cx("activeBar"),
    role: "presentation",
    "aria-hidden": "true"
  }, e.ptm("activeBar")), null, 16)], 16, wl)], 16, xl), o.showNavigators && i.isNextButtonEnabled ? He((h(), b("button", v({
    key: 1,
    ref: "nextButton",
    type: "button",
    class: e.cx("nextButton"),
    "aria-label": o.nextButtonAriaLabel,
    tabindex: o.$pcTabs.tabindex,
    onClick: t[2] || (t[2] = function() {
      return o.onNextButtonClick && o.onNextButtonClick.apply(o, arguments);
    })
  }, e.ptm("nextButton"), {
    "data-pc-group-section": "navigator"
  }), [(h(), K(me(o.templates.nexticon || "ChevronRightIcon"), v({
    "aria-hidden": "true"
  }, e.ptm("nextIcon")), null, 16))], 16, kl)), [[a]]) : A("", !0)], 16, vl);
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
  root: function(t) {
    var n = t.props;
    return ["p-tabs p-component", {
      "p-tabs-scrollable": n.scrollable
    }];
  }
}, Ol = D.extend({
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
    value: function(t) {
      this.d_value = t;
    }
  },
  methods: {
    updateValue: function(t) {
      this.d_value !== t && (this.d_value = t, this.$emit("update:value", t));
    },
    isVertical: function() {
      return this.orientation === "vertical";
    }
  }
};
function Tl(e, t, n, r, i, o) {
  return h(), b("div", v({
    class: e.cx("root")
  }, e.ptmi("root")), [L(e.$slots, "default")], 16);
}
ao.render = Tl;
var Rt = {
  name: "TimesIcon",
  extends: xe
};
function _l(e) {
  return zl(e) || Al(e) || Ll(e) || Pl();
}
function Pl() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Ll(e, t) {
  if (e) {
    if (typeof e == "string") return un(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? un(e, t) : void 0;
  }
}
function Al(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function zl(e) {
  if (Array.isArray(e)) return un(e);
}
function un(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function El(e, t, n, r, i, o) {
  return h(), b("svg", v({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), _l(t[0] || (t[0] = [C("path", {
    d: "M8.01186 7.00933L12.27 2.75116C12.341 2.68501 12.398 2.60524 12.4375 2.51661C12.4769 2.42798 12.4982 2.3323 12.4999 2.23529C12.5016 2.13827 12.4838 2.0419 12.4474 1.95194C12.4111 1.86197 12.357 1.78024 12.2884 1.71163C12.2198 1.64302 12.138 1.58893 12.0481 1.55259C11.9581 1.51625 11.8617 1.4984 11.7647 1.50011C11.6677 1.50182 11.572 1.52306 11.4834 1.56255C11.3948 1.60204 11.315 1.65898 11.2488 1.72997L6.99067 5.98814L2.7325 1.72997C2.59553 1.60234 2.41437 1.53286 2.22718 1.53616C2.03999 1.53946 1.8614 1.61529 1.72901 1.74767C1.59663 1.88006 1.5208 2.05865 1.5175 2.24584C1.5142 2.43303 1.58368 2.61419 1.71131 2.75116L5.96948 7.00933L1.71131 11.2675C1.576 11.403 1.5 11.5866 1.5 11.7781C1.5 11.9696 1.576 12.1532 1.71131 12.2887C1.84679 12.424 2.03043 12.5 2.2219 12.5C2.41338 12.5 2.59702 12.424 2.7325 12.2887L6.99067 8.03052L11.2488 12.2887C11.3843 12.424 11.568 12.5 11.7594 12.5C11.9509 12.5 12.1346 12.424 12.27 12.2887C12.4053 12.1532 12.4813 11.9696 12.4813 11.7781C12.4813 11.5866 12.4053 11.403 12.27 11.2675L8.01186 7.00933Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
Rt.render = El;
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
  root: function(t) {
    var n = t.props;
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
}, Vl = D.extend({
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
function bt(e) {
  "@babel/helpers - typeof";
  return bt = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, bt(e);
}
function hr(e, t, n) {
  return (t = Ml(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Ml(e) {
  var t = Nl(e, "string");
  return bt(t) == "symbol" ? t : t + "";
}
function Nl(e, t) {
  if (bt(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (bt(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
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
    var t = this;
    this.life && setTimeout(function() {
      t.visible = !1, t.$emit("life-end");
    }, this.life);
  },
  methods: {
    close: function(t) {
      this.visible = !1, this.$emit("close", t);
    }
  },
  computed: {
    closeAriaLabel: function() {
      return this.$primevue.config.locale.aria ? this.$primevue.config.locale.aria.close : void 0;
    },
    dataP: function() {
      return ae(hr(hr({
        outlined: this.variant === "outlined",
        simple: this.variant === "simple"
      }, this.severity, this.severity), this.size, this.size));
    }
  },
  directives: {
    ripple: It
  },
  components: {
    TimesIcon: Rt
  }
};
function gt(e) {
  "@babel/helpers - typeof";
  return gt = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, gt(e);
}
function mr(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(e);
    t && (r = r.filter(function(i) {
      return Object.getOwnPropertyDescriptor(e, i).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function br(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? mr(Object(n), !0).forEach(function(r) {
      Fl(e, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : mr(Object(n)).forEach(function(r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return e;
}
function Fl(e, t, n) {
  return (t = Rl(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Rl(e) {
  var t = Kl(e, "string");
  return gt(t) == "symbol" ? t : t + "";
}
function Kl(e, t) {
  if (gt(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (gt(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var Ul = ["data-p"], Hl = ["data-p"], Wl = ["data-p"], Gl = ["aria-label", "data-p"], ql = ["data-p"];
function Yl(e, t, n, r, i, o) {
  var a = re("TimesIcon"), s = Ct("ripple");
  return h(), K(_r, v({
    name: "p-message",
    appear: ""
  }, e.ptmi("transition")), {
    default: ue(function() {
      return [i.visible ? (h(), b("div", v({
        key: 0,
        class: e.cx("root"),
        role: "alert",
        "aria-live": "assertive",
        "aria-atomic": "true",
        "data-p": o.dataP
      }, e.ptm("root")), [C("div", v({
        class: e.cx("contentWrapper")
      }, e.ptm("contentWrapper")), [e.$slots.container ? L(e.$slots, "container", {
        key: 0,
        closeCallback: o.close
      }) : (h(), b("div", v({
        key: 1,
        class: e.cx("content"),
        "data-p": o.dataP
      }, e.ptm("content")), [L(e.$slots, "icon", {
        class: ne(e.cx("icon"))
      }, function() {
        return [(h(), K(me(e.icon ? "span" : null), v({
          class: [e.cx("icon"), e.icon],
          "data-p": o.dataP
        }, e.ptm("icon")), null, 16, ["class", "data-p"]))];
      }), e.$slots.default ? (h(), b("div", v({
        key: 0,
        class: e.cx("text"),
        "data-p": o.dataP
      }, e.ptm("text")), [L(e.$slots, "default")], 16, Wl)) : A("", !0), e.closable ? He((h(), b("button", v({
        key: 1,
        class: e.cx("closeButton"),
        "aria-label": o.closeAriaLabel,
        type: "button",
        onClick: t[0] || (t[0] = function(l) {
          return o.close(l);
        }),
        "data-p": o.dataP
      }, br(br({}, e.closeButtonProps), e.ptm("closeButton"))), [L(e.$slots, "closeicon", {}, function() {
        return [e.closeIcon ? (h(), b("i", v({
          key: 0,
          class: [e.cx("closeIcon"), e.closeIcon],
          "data-p": o.dataP
        }, e.ptm("closeIcon")), null, 16, ql)) : (h(), K(a, v({
          key: 1,
          class: [e.cx("closeIcon"), e.closeIcon],
          "data-p": o.dataP
        }, e.ptm("closeIcon")), null, 16, ["class", "data-p"]))];
      })], 16, Gl)), [[s]]) : A("", !0)], 16, Hl))], 16)], 16, Ul)) : A("", !0)];
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
  root: function(t) {
    var n = t.props;
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
}, Ql = D.extend({
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
function vt(e) {
  "@babel/helpers - typeof";
  return vt = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, vt(e);
}
function eu(e, t, n) {
  return (t = tu(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function tu(e) {
  var t = nu(e, "string");
  return vt(t) == "symbol" ? t : t + "";
}
function nu(e, t) {
  if (vt(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (vt(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
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
function ou(e, t, n, r, i, o) {
  return h(), b("span", v({
    class: e.cx("root"),
    "data-p": o.dataP
  }, e.ptmi("root")), [e.$slots.icon ? (h(), K(me(e.$slots.icon), v({
    key: 0,
    class: e.cx("icon")
  }, e.ptm("icon")), null, 16, ["class"])) : e.icon ? (h(), b("span", v({
    key: 1,
    class: [e.cx("icon"), e.icon]
  }, e.ptm("icon")), null, 16)) : A("", !0), e.value != null || e.$slots.default ? L(e.$slots, "default", {
    key: 2
  }, function() {
    return [C("span", v({
      class: e.cx("label")
    }, e.ptm("label")), N(e.value), 17)];
  }) : A("", !0)], 16, ru);
}
Mt.render = ou;
var An = {
  name: "CheckIcon",
  extends: xe
};
function iu(e) {
  return uu(e) || lu(e) || su(e) || au();
}
function au() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function su(e, t) {
  if (e) {
    if (typeof e == "string") return dn(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? dn(e, t) : void 0;
  }
}
function lu(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function uu(e) {
  if (Array.isArray(e)) return dn(e);
}
function dn(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function du(e, t, n, r, i, o) {
  return h(), b("svg", v({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), iu(t[0] || (t[0] = [C("path", {
    d: "M4.86199 11.5948C4.78717 11.5923 4.71366 11.5745 4.64596 11.5426C4.57826 11.5107 4.51779 11.4652 4.46827 11.4091L0.753985 7.69483C0.683167 7.64891 0.623706 7.58751 0.580092 7.51525C0.536478 7.44299 0.509851 7.36177 0.502221 7.27771C0.49459 7.19366 0.506156 7.10897 0.536046 7.03004C0.565935 6.95111 0.613367 6.88 0.674759 6.82208C0.736151 6.76416 0.8099 6.72095 0.890436 6.69571C0.970973 6.67046 1.05619 6.66385 1.13966 6.67635C1.22313 6.68886 1.30266 6.72017 1.37226 6.76792C1.44186 6.81567 1.4997 6.8786 1.54141 6.95197L4.86199 10.2503L12.6397 2.49483C12.7444 2.42694 12.8689 2.39617 12.9932 2.40745C13.1174 2.41873 13.2343 2.47141 13.3251 2.55705C13.4159 2.64268 13.4753 2.75632 13.4938 2.87973C13.5123 3.00315 13.4888 3.1292 13.4271 3.23768L5.2557 11.4091C5.20618 11.4652 5.14571 11.5107 5.07801 11.5426C5.01031 11.5745 4.9368 11.5923 4.86199 11.5948Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
An.render = du;
var lo = {
  name: "MinusIcon",
  extends: xe
};
function cu(e) {
  return mu(e) || hu(e) || fu(e) || pu();
}
function pu() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function fu(e, t) {
  if (e) {
    if (typeof e == "string") return cn(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? cn(e, t) : void 0;
  }
}
function hu(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function mu(e) {
  if (Array.isArray(e)) return cn(e);
}
function cn(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function bu(e, t, n, r, i, o) {
  return h(), b("svg", v({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), cu(t[0] || (t[0] = [C("path", {
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
        var n, r;
        this.formField = ((n = this.$pcForm) === null || n === void 0 || (r = n.register) === null || r === void 0 ? void 0 : r.call(n, t, this.$formControl)) || {};
      }
    },
    $formControl: {
      immediate: !0,
      handler: function(t) {
        var n, r;
        this.formField = ((n = this.$pcForm) === null || n === void 0 || (r = n.register) === null || r === void 0 ? void 0 : r.call(n, this.$formName, t)) || {};
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
      var r, i;
      this.controlled && (this.d_value = t, this.$emit("update:modelValue", t)), this.$emit("value-change", t), (r = (i = this.formField).onChange) === null || r === void 0 || r.call(i, {
        originalEvent: n,
        value: t
      });
    },
    // @todo move to @primeuix/utils
    findNonEmpty: function() {
      for (var t = arguments.length, n = new Array(t), r = 0; r < t; r++)
        n[r] = arguments[r];
      return n.find(F);
    }
  },
  computed: {
    $filled: function() {
      return F(this.d_value);
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
}, Tt = {
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
  root: function(t) {
    var n = t.instance, r = t.props;
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
}, xu = D.extend({
  name: "checkbox",
  style: vu,
  classes: yu
}), wu = {
  name: "BaseCheckbox",
  extends: Tt,
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
function yt(e) {
  "@babel/helpers - typeof";
  return yt = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, yt(e);
}
function ku(e, t, n) {
  return (t = Su(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Su(e) {
  var t = $u(e, "string");
  return yt(t) == "symbol" ? t : t + "";
}
function $u(e, t) {
  if (yt(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (yt(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
function Cu(e) {
  return _u(e) || Tu(e) || Iu(e) || Ou();
}
function Ou() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Iu(e, t) {
  if (e) {
    if (typeof e == "string") return pn(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? pn(e, t) : void 0;
  }
}
function Tu(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function _u(e) {
  if (Array.isArray(e)) return pn(e);
}
function pn(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
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
    indeterminate: function(t) {
      this.d_indeterminate = t, this.updateIndeterminate();
    }
  },
  mounted: function() {
    this.updateIndeterminate();
  },
  updated: function() {
    this.updateIndeterminate();
  },
  methods: {
    getPTOptions: function(t) {
      var n = t === "root" ? this.ptmi : this.ptm;
      return n(t, {
        context: {
          checked: this.checked,
          indeterminate: this.d_indeterminate,
          disabled: this.disabled
        }
      });
    },
    onChange: function(t) {
      var n = this;
      if (!this.disabled && !this.readonly) {
        var r = this.$pcCheckboxGroup ? this.$pcCheckboxGroup.d_value : this.d_value, i;
        this.binary ? i = this.d_indeterminate ? this.trueValue : this.checked ? this.falseValue : this.trueValue : this.checked || this.d_indeterminate ? i = r.filter(function(o) {
          return !Ot(o, n.value);
        }) : i = r ? [].concat(Cu(r), [this.value]) : [this.value], this.d_indeterminate && (this.d_indeterminate = !1, this.$emit("update:indeterminate", this.d_indeterminate)), this.$pcCheckboxGroup ? this.$pcCheckboxGroup.writeValue(i, t) : this.writeValue(i, t), this.$emit("change", t);
      }
    },
    onFocus: function(t) {
      this.$emit("focus", t);
    },
    onBlur: function(t) {
      var n, r;
      this.$emit("blur", t), (n = (r = this.formField).onBlur) === null || n === void 0 || n.call(r, t);
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
      var t = this.$pcCheckboxGroup ? this.$pcCheckboxGroup.d_value : this.d_value;
      return this.d_indeterminate ? !1 : this.binary ? t === this.trueValue : Ii(this.value, t);
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
    CheckIcon: An,
    MinusIcon: lo
  }
}, Pu = ["data-p-checked", "data-p-indeterminate", "data-p-disabled", "data-p"], Lu = ["id", "value", "name", "checked", "tabindex", "disabled", "readonly", "required", "aria-labelledby", "aria-label", "aria-invalid"], Au = ["data-p"];
function zu(e, t, n, r, i, o) {
  var a = re("CheckIcon"), s = re("MinusIcon");
  return h(), b("div", v({
    class: e.cx("root")
  }, o.getPTOptions("root"), {
    "data-p-checked": o.checked,
    "data-p-indeterminate": i.d_indeterminate || void 0,
    "data-p-disabled": e.disabled,
    "data-p": o.dataP
  }), [C("input", v({
    ref: "input",
    id: e.inputId,
    type: "checkbox",
    class: [e.cx("input"), e.inputClass],
    style: e.inputStyle,
    value: e.value,
    name: o.groupName,
    checked: o.checked,
    tabindex: e.tabindex,
    disabled: e.disabled,
    readonly: e.readonly,
    required: e.required,
    "aria-labelledby": e.ariaLabelledby,
    "aria-label": e.ariaLabel,
    "aria-invalid": e.invalid || void 0,
    onFocus: t[0] || (t[0] = function() {
      return o.onFocus && o.onFocus.apply(o, arguments);
    }),
    onBlur: t[1] || (t[1] = function() {
      return o.onBlur && o.onBlur.apply(o, arguments);
    }),
    onChange: t[2] || (t[2] = function() {
      return o.onChange && o.onChange.apply(o, arguments);
    })
  }, o.getPTOptions("input")), null, 16, Lu), C("div", v({
    class: e.cx("box")
  }, o.getPTOptions("box"), {
    "data-p": o.dataP
  }), [L(e.$slots, "icon", {
    checked: o.checked,
    indeterminate: i.d_indeterminate,
    class: ne(e.cx("icon")),
    dataP: o.dataP
  }, function() {
    return [o.checked ? (h(), K(a, v({
      key: 0,
      class: e.cx("icon")
    }, o.getPTOptions("icon"), {
      "data-p": o.dataP
    }), null, 16, ["class", "data-p"])) : i.d_indeterminate ? (h(), K(s, v({
      key: 1,
      class: e.cx("icon")
    }, o.getPTOptions("icon"), {
      "data-p": o.dataP
    }), null, 16, ["class", "data-p"])) : A("", !0)];
  })], 16, Au)], 16, Pu);
}
uo.render = zu;
var co = {
  name: "AngleDownIcon",
  extends: xe
};
function Eu(e) {
  return Du(e) || Vu(e) || ju(e) || Bu();
}
function Bu() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function ju(e, t) {
  if (e) {
    if (typeof e == "string") return fn(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? fn(e, t) : void 0;
  }
}
function Vu(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function Du(e) {
  if (Array.isArray(e)) return fn(e);
}
function fn(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function Mu(e, t, n, r, i, o) {
  return h(), b("svg", v({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), Eu(t[0] || (t[0] = [C("path", {
    d: "M3.58659 4.5007C3.68513 4.50023 3.78277 4.51945 3.87379 4.55723C3.9648 4.59501 4.04735 4.65058 4.11659 4.7207L7.11659 7.7207L10.1166 4.7207C10.2619 4.65055 10.4259 4.62911 10.5843 4.65956C10.7427 4.69002 10.8871 4.77074 10.996 4.88976C11.1049 5.00877 11.1726 5.15973 11.1889 5.32022C11.2052 5.48072 11.1693 5.6422 11.0866 5.7807L7.58659 9.2807C7.44597 9.42115 7.25534 9.50004 7.05659 9.50004C6.85784 9.50004 6.66722 9.42115 6.52659 9.2807L3.02659 5.7807C2.88614 5.64007 2.80725 5.44945 2.80725 5.2507C2.80725 5.05195 2.88614 4.86132 3.02659 4.7207C3.09932 4.64685 3.18675 4.58911 3.28322 4.55121C3.37969 4.51331 3.48305 4.4961 3.58659 4.5007Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
co.render = Mu;
var po = {
  name: "AngleUpIcon",
  extends: xe
};
function Nu(e) {
  return Uu(e) || Ku(e) || Ru(e) || Fu();
}
function Fu() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Ru(e, t) {
  if (e) {
    if (typeof e == "string") return hn(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? hn(e, t) : void 0;
  }
}
function Ku(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function Uu(e) {
  if (Array.isArray(e)) return hn(e);
}
function hn(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function Hu(e, t, n, r, i, o) {
  return h(), b("svg", v({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), Nu(t[0] || (t[0] = [C("path", {
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
  root: function(t) {
    var n = t.instance, r = t.props;
    return ["p-inputtext p-component", {
      "p-filled": n.$filled,
      "p-inputtext-sm p-inputfield-sm": r.size === "small",
      "p-inputtext-lg p-inputfield-lg": r.size === "large",
      "p-invalid": n.$invalid,
      "p-variant-filled": n.$variant === "filled",
      "p-inputtext-fluid": n.$fluid
    }];
  }
}, qu = D.extend({
  name: "inputtext",
  style: Wu,
  classes: Gu
}), Yu = {
  name: "BaseInputText",
  extends: Tt,
  style: qu,
  provide: function() {
    return {
      $pcInputText: this,
      $parentInstance: this
    };
  }
};
function xt(e) {
  "@babel/helpers - typeof";
  return xt = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, xt(e);
}
function Zu(e, t, n) {
  return (t = Ju(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Ju(e) {
  var t = Qu(e, "string");
  return xt(t) == "symbol" ? t : t + "";
}
function Qu(e, t) {
  if (xt(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (xt(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var Kt = {
  name: "InputText",
  extends: Yu,
  inheritAttrs: !1,
  methods: {
    onInput: function(t) {
      this.writeValue(t.target.value, t);
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
function ed(e, t, n, r, i, o) {
  return h(), b("input", v({
    type: "text",
    class: e.cx("root"),
    value: e.d_value,
    name: e.name,
    disabled: e.disabled,
    "aria-invalid": e.$invalid || void 0,
    "data-p": o.dataP,
    onInput: t[0] || (t[0] = function() {
      return o.onInput && o.onInput.apply(o, arguments);
    })
  }, o.attrs), null, 16, Xu);
}
Kt.render = ed;
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
  root: function(t) {
    var n = t.instance, r = t.props;
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
  incrementButton: function(t) {
    var n = t.instance, r = t.props;
    return ["p-inputnumber-button p-inputnumber-increment-button", {
      "p-disabled": r.showButtons && r.max !== null && n.maxBoundry()
    }];
  },
  decrementButton: function(t) {
    var n = t.instance, r = t.props;
    return ["p-inputnumber-button p-inputnumber-decrement-button", {
      "p-disabled": r.showButtons && r.min !== null && n.minBoundry()
    }];
  }
}, rd = D.extend({
  name: "inputnumber",
  style: td,
  classes: nd
}), od = {
  name: "BaseInputNumber",
  extends: Tt,
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
      validator: function(t) {
        return ["ceil", "floor", "expand", "trunc", "halfCeil", "halfFloor", "halfExpand", "halfTrunc", "halfEven"].includes(t);
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
function wt(e) {
  "@babel/helpers - typeof";
  return wt = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, wt(e);
}
function gr(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(e);
    t && (r = r.filter(function(i) {
      return Object.getOwnPropertyDescriptor(e, i).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function vr(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? gr(Object(n), !0).forEach(function(r) {
      mn(e, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : gr(Object(n)).forEach(function(r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return e;
}
function mn(e, t, n) {
  return (t = id(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function id(e) {
  var t = ad(e, "string");
  return wt(t) == "symbol" ? t : t + "";
}
function ad(e, t) {
  if (wt(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (wt(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
function sd(e) {
  return cd(e) || dd(e) || ud(e) || ld();
}
function ld() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function ud(e, t) {
  if (e) {
    if (typeof e == "string") return bn(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? bn(e, t) : void 0;
  }
}
function dd(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function cd(e) {
  if (Array.isArray(e)) return bn(e);
}
function bn(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
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
      handler: function(t) {
        var n;
        this.d_modelValue = t, (n = this.$refs.clearIcon) !== null && n !== void 0 && (n = n.$el) !== null && n !== void 0 && n.style && (this.$refs.clearIcon.$el.style.display = Pe(t) ? "none" : "block");
      }
    },
    locale: function(t, n) {
      this.updateConstructParser(t, n);
    },
    localeMatcher: function(t, n) {
      this.updateConstructParser(t, n);
    },
    mode: function(t, n) {
      this.updateConstructParser(t, n);
    },
    currency: function(t, n) {
      this.updateConstructParser(t, n);
    },
    currencyDisplay: function(t, n) {
      this.updateConstructParser(t, n);
    },
    useGrouping: function(t, n) {
      this.updateConstructParser(t, n);
    },
    minFractionDigits: function(t, n) {
      this.updateConstructParser(t, n);
    },
    maxFractionDigits: function(t, n) {
      this.updateConstructParser(t, n);
    },
    suffix: function(t, n) {
      this.updateConstructParser(t, n);
    },
    prefix: function(t, n) {
      this.updateConstructParser(t, n);
    }
  },
  created: function() {
    this.constructParser();
  },
  mounted: function() {
    var t;
    (t = this.$refs.clearIcon) !== null && t !== void 0 && (t = t.$el) !== null && t !== void 0 && t.style && (this.$refs.clearIcon.$el.style.display = this.$filled ? "block" : "none");
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
      var t = sd(new Intl.NumberFormat(this.locale, {
        useGrouping: !1
      }).format(9876543210)).reverse(), n = new Map(t.map(function(r, i) {
        return [r, i];
      }));
      this._numeral = new RegExp("[".concat(t.join(""), "]"), "g"), this._group = this.getGroupingExpression(), this._minusSign = this.getMinusSignExpression(), this._currency = this.getCurrencyExpression(), this._decimal = this.getDecimalExpression(), this._suffix = this.getSuffixExpression(), this._prefix = this.getPrefixExpression(), this._index = function(r) {
        return n.get(r);
      };
    },
    updateConstructParser: function(t, n) {
      t !== n && this.constructParser();
    },
    escapeRegExp: function(t) {
      return t.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
    },
    getDecimalExpression: function() {
      var t = new Intl.NumberFormat(this.locale, vr(vr({}, this.getOptions()), {}, {
        useGrouping: !1
      })), n = t.format(1.1);
      return n === t.format(1) ? new RegExp("[]", "g") : new RegExp("[".concat(n.replace(this._currency, "").trim().replace(this._numeral, ""), "]"), "g");
    },
    getGroupingExpression: function() {
      var t = new Intl.NumberFormat(this.locale, {
        useGrouping: !0
      });
      return this.groupChar = t.format(1e6).trim().replace(this._numeral, "").charAt(0), new RegExp("[".concat(this.groupChar, "]"), "g");
    },
    getMinusSignExpression: function() {
      var t = new Intl.NumberFormat(this.locale, {
        useGrouping: !1
      });
      return new RegExp("[".concat(t.format(-1).trim().replace(this._numeral, ""), "]"), "g");
    },
    getCurrencyExpression: function() {
      if (this.currency) {
        var t = new Intl.NumberFormat(this.locale, {
          style: "currency",
          currency: this.currency,
          currencyDisplay: this.currencyDisplay,
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
          roundingMode: this.roundingMode
        });
        return new RegExp("[".concat(t.format(1).replace(/\s/g, "").replace(this._numeral, "").replace(this._group, ""), "]"), "g");
      }
      return new RegExp("[]", "g");
    },
    getPrefixExpression: function() {
      if (this.prefix)
        this.prefixChar = this.prefix;
      else {
        var t = new Intl.NumberFormat(this.locale, {
          style: this.mode,
          currency: this.currency,
          currencyDisplay: this.currencyDisplay
        });
        this.prefixChar = t.format(1).split("1")[0];
      }
      return new RegExp("".concat(this.escapeRegExp(this.prefixChar || "")), "g");
    },
    getSuffixExpression: function() {
      if (this.suffix)
        this.suffixChar = this.suffix;
      else {
        var t = new Intl.NumberFormat(this.locale, {
          style: this.mode,
          currency: this.currency,
          currencyDisplay: this.currencyDisplay,
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
          roundingMode: this.roundingMode
        });
        this.suffixChar = t.format(1).split("1")[1];
      }
      return new RegExp("".concat(this.escapeRegExp(this.suffixChar || "")), "g");
    },
    formatValue: function(t) {
      if (t != null) {
        if (t === "-")
          return t;
        if (this.format) {
          var n = new Intl.NumberFormat(this.locale, this.getOptions()), r = n.format(t);
          return this.prefix && (r = this.prefix + r), this.suffix && (r = r + this.suffix), r;
        }
        return t.toString();
      }
      return "";
    },
    parseValue: function(t) {
      var n = t.replace(this._suffix, "").replace(this._prefix, "").trim().replace(/\s/g, "").replace(this._currency, "").replace(this._group, "").replace(this._minusSign, "-").replace(this._decimal, ".").replace(this._numeral, this._index);
      if (n) {
        if (n === "-")
          return n;
        var r = +n;
        return isNaN(r) ? null : r;
      }
      return null;
    },
    repeat: function(t, n, r) {
      var i = this;
      if (!this.readonly) {
        var o = n || 500;
        this.clearTimer(), this.timer = setTimeout(function() {
          i.repeat(t, 40, r);
        }, o), this.spin(t, r);
      }
    },
    addWithPrecision: function(t, n) {
      var r = t.toString(), i = n.toString(), o = r.includes(".") ? r.split(".")[1].length : 0, a = i.includes(".") ? i.split(".")[1].length : 0, s = Math.max(o, a), l = Math.pow(10, s);
      return Math.round((t + n) * l) / l;
    },
    spin: function(t, n) {
      if (this.$refs.input) {
        var r = this.step * n, i = this.parseValue(this.$refs.input.$el.value) || 0, o = this.validateValue(this.addWithPrecision(i, r));
        this.updateInput(o, null, "spin"), this.updateModel(t, o), this.handleOnInput(t, i, o);
      }
    },
    onUpButtonMouseDown: function(t) {
      this.disabled || (this.$refs.input.$el.focus(), this.repeat(t, null, 1), t.preventDefault());
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
    onUpButtonKeyDown: function(t) {
      (t.code === "Space" || t.code === "Enter" || t.code === "NumpadEnter") && this.repeat(t, null, 1);
    },
    onDownButtonMouseDown: function(t) {
      this.disabled || (this.$refs.input.$el.focus(), this.repeat(t, null, -1), t.preventDefault());
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
    onDownButtonKeyDown: function(t) {
      (t.code === "Space" || t.code === "Enter" || t.code === "NumpadEnter") && this.repeat(t, null, -1);
    },
    onUserInput: function() {
      this.isSpecialChar && (this.$refs.input.$el.value = this.lastValue), this.isSpecialChar = !1;
    },
    onInputKeyDown: function(t) {
      if (!this.readonly && !t.isComposing) {
        if (t.altKey || t.ctrlKey || t.metaKey) {
          this.isSpecialChar = !0, this.lastValue = this.$refs.input.$el.value;
          return;
        }
        this.lastValue = t.target.value;
        var n = t.target.selectionStart, r = t.target.selectionEnd, i = r - n, o = t.target.value, a = null, s = t.code || t.key;
        switch (s) {
          case "ArrowUp":
            this.spin(t, 1), t.preventDefault();
            break;
          case "ArrowDown":
            this.spin(t, -1), t.preventDefault();
            break;
          case "ArrowLeft":
            if (i > 1) {
              var l = this.isNumeralChar(o.charAt(n)) ? n + 1 : n + 2;
              this.$refs.input.$el.setSelectionRange(l, l);
            } else this.isNumeralChar(o.charAt(n - 1)) || t.preventDefault();
            break;
          case "ArrowRight":
            if (i > 1) {
              var u = r - 1;
              this.$refs.input.$el.setSelectionRange(u, u);
            } else this.isNumeralChar(o.charAt(n)) || t.preventDefault();
            break;
          case "Tab":
          case "Enter":
          case "NumpadEnter":
            a = this.validateValue(this.parseValue(o)), this.$refs.input.$el.value = this.formatValue(a), this.$refs.input.$el.setAttribute("aria-valuenow", a), this.updateModel(t, a);
            break;
          case "Backspace": {
            if (t.preventDefault(), n === r) {
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
              this.updateValue(t, a, null, "delete-single");
            } else
              a = this.deleteRange(o, n, r), this.updateValue(t, a, null, "delete-range");
            break;
          }
          case "Delete":
            if (t.preventDefault(), n === r) {
              var y = o.charAt(n), w = this.getDecimalCharIndexes(o), O = w.decimalCharIndex, _ = w.decimalCharIndexWithoutPrefix;
              if (this.isNumeralChar(y)) {
                var g = this.getDecimalLength(o);
                if (this._group.test(y))
                  this._group.lastIndex = 0, a = o.slice(0, n) + o.slice(n + 2);
                else if (this._decimal.test(y))
                  this._decimal.lastIndex = 0, g ? this.$refs.input.$el.setSelectionRange(n + 1, n + 1) : a = o.slice(0, n) + o.slice(n + 1);
                else if (O > 0 && n > O) {
                  var T = this.isDecimalMode() && (this.minFractionDigits || 0) < g ? "" : "0";
                  a = o.slice(0, n) + T + o.slice(n + 1);
                } else _ === 1 ? (a = o.slice(0, n) + "0" + o.slice(n + 1), a = this.parseValue(a) > 0 ? a : "") : a = o.slice(0, n) + o.slice(n + 1);
              }
              this.updateValue(t, a, null, "delete-back-single");
            } else
              a = this.deleteRange(o, n, r), this.updateValue(t, a, null, "delete-range");
            break;
          case "Home":
            t.preventDefault(), F(this.min) && this.updateModel(t, this.min);
            break;
          case "End":
            t.preventDefault(), F(this.max) && this.updateModel(t, this.max);
            break;
        }
      }
    },
    onInputKeyPress: function(t) {
      if (!this.readonly) {
        var n = t.key, r = this.isDecimalSign(n), i = this.isMinusSign(n);
        t.code !== "Enter" && t.preventDefault(), (Number(n) >= 0 && Number(n) <= 9 || i || r) && this.insert(t, n, {
          isDecimalSign: r,
          isMinusSign: i
        });
      }
    },
    onPaste: function(t) {
      if (!(this.readonly || this.disabled)) {
        t.preventDefault();
        var n = (t.clipboardData || window.clipboardData).getData("Text");
        if (!(this.inputId === "integeronly" && /[^\d-]/.test(n)) && n) {
          var r = this.parseValue(n);
          r != null && this.insert(t, r.toString());
        }
      }
    },
    onClearClick: function(t) {
      this.updateModel(t, null), this.$refs.input.$el.focus();
    },
    allowMinusSign: function() {
      return this.min === null || this.min < 0;
    },
    isMinusSign: function(t) {
      return this._minusSign.test(t) || t === "-" ? (this._minusSign.lastIndex = 0, !0) : !1;
    },
    isDecimalSign: function(t) {
      var n;
      return (n = this.locale) !== null && n !== void 0 && n.includes("fr") && [".", ","].includes(t) || this._decimal.test(t) ? (this._decimal.lastIndex = 0, !0) : !1;
    },
    isDecimalMode: function() {
      return this.mode === "decimal";
    },
    getDecimalCharIndexes: function(t) {
      var n = t.search(this._decimal);
      this._decimal.lastIndex = 0;
      var r = t.replace(this._prefix, "").trim().replace(/\s/g, "").replace(this._currency, ""), i = r.search(this._decimal);
      return this._decimal.lastIndex = 0, {
        decimalCharIndex: n,
        decimalCharIndexWithoutPrefix: i
      };
    },
    getCharIndexes: function(t) {
      var n = t.search(this._decimal);
      this._decimal.lastIndex = 0;
      var r = t.search(this._minusSign);
      this._minusSign.lastIndex = 0;
      var i = t.search(this._suffix);
      this._suffix.lastIndex = 0;
      var o = t.search(this._currency);
      return this._currency.lastIndex = 0, {
        decimalCharIndex: n,
        minusCharIndex: r,
        suffixCharIndex: i,
        currencyCharIndex: o
      };
    },
    insert: function(t, n) {
      var r = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {
        isDecimalSign: !1,
        isMinusSign: !1
      }, i = n.search(this._minusSign);
      if (this._minusSign.lastIndex = 0, !(!this.allowMinusSign() && i !== -1)) {
        var o = this.$refs.input.$el.selectionStart, a = this.$refs.input.$el.selectionEnd, s = this.$refs.input.$el.value.trim(), l = this.getCharIndexes(s), u = l.decimalCharIndex, d = l.minusCharIndex, c = l.suffixCharIndex, p = l.currencyCharIndex, f;
        if (r.isMinusSign) {
          var m = d === -1;
          (o === 0 || o === p + 1) && (f = s, (m || a !== 0) && (f = this.insertText(s, n, 0, a)), this.updateValue(t, f, n, "insert"));
        } else if (r.isDecimalSign)
          u > 0 && o === u ? this.updateValue(t, s, n, "insert") : u > o && u < a ? (f = this.insertText(s, n, o, a), this.updateValue(t, f, n, "insert")) : u === -1 && this.maxFractionDigits && (f = this.insertText(s, n, o, a), this.updateValue(t, f, n, "insert"));
        else {
          var x = this.numberFormat.resolvedOptions().maximumFractionDigits, y = o !== a ? "range-insert" : "insert";
          if (u > 0 && o > u) {
            if (o + n.length - (u + 1) <= x) {
              var w = p >= o ? p - 1 : c >= o ? c : s.length;
              f = s.slice(0, o) + n + s.slice(o + n.length, w) + s.slice(w), this.updateValue(t, f, n, y);
            }
          } else
            f = this.insertText(s, n, o, a), this.updateValue(t, f, n, y);
        }
      }
    },
    insertText: function(t, n, r, i) {
      var o = n === "." ? n : n.split(".");
      if (o.length === 2) {
        var a = t.slice(r, i).search(this._decimal);
        return this._decimal.lastIndex = 0, a > 0 ? t.slice(0, r) + this.formatValue(n) + t.slice(i) : this.formatValue(n) || t;
      } else return i - r === t.length ? this.formatValue(n) : r === 0 ? n + t.slice(i) : i === t.length ? t.slice(0, r) + n : t.slice(0, r) + n + t.slice(i);
    },
    deleteRange: function(t, n, r) {
      var i;
      return r - n === t.length ? i = "" : n === 0 ? i = t.slice(r) : r === t.length ? i = t.slice(0, n) : i = t.slice(0, n) + t.slice(r), i;
    },
    initCursor: function() {
      var t = this.$refs.input.$el.selectionStart, n = this.$refs.input.$el.value, r = n.length, i = null, o = (this.prefixChar || "").length;
      n = n.replace(this._prefix, ""), t = t - o;
      var a = n.charAt(t);
      if (this.isNumeralChar(a))
        return t + o;
      for (var s = t - 1; s >= 0; )
        if (a = n.charAt(s), this.isNumeralChar(a)) {
          i = s + o;
          break;
        } else
          s--;
      if (i !== null)
        this.$refs.input.$el.setSelectionRange(i + 1, i + 1);
      else {
        for (s = t; s < r; )
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
      var t = this.$refs.input.$el.value;
      !this.readonly && t !== Dn() && this.initCursor();
    },
    isNumeralChar: function(t) {
      return t.length === 1 && (this._numeral.test(t) || this._decimal.test(t) || this._group.test(t) || this._minusSign.test(t)) ? (this.resetRegex(), !0) : !1;
    },
    resetRegex: function() {
      this._numeral.lastIndex = 0, this._decimal.lastIndex = 0, this._group.lastIndex = 0, this._minusSign.lastIndex = 0;
    },
    updateValue: function(t, n, r, i) {
      var o = this.$refs.input.$el.value, a = null;
      n != null && (a = this.parseValue(n), a = !a && !this.allowEmpty ? 0 : a, this.updateInput(a, r, i, n), this.handleOnInput(t, o, a));
    },
    handleOnInput: function(t, n, r) {
      if (this.isValueChanged(n, r)) {
        var i, o;
        this.$emit("input", {
          originalEvent: t,
          value: r,
          formattedValue: n
        }), (i = (o = this.formField).onInput) === null || i === void 0 || i.call(o, {
          originalEvent: t,
          value: r
        });
      }
    },
    isValueChanged: function(t, n) {
      if (n === null && t !== null)
        return !0;
      if (n != null) {
        var r = typeof t == "string" ? this.parseValue(t) : t;
        return n !== r;
      }
      return !1;
    },
    validateValue: function(t) {
      return t === "-" || t == null ? null : this.min != null && t < this.min ? this.min : this.max != null && t > this.max ? this.max : t;
    },
    updateInput: function(t, n, r, i) {
      var o;
      n = n || "";
      var a = this.$refs.input.$el.value, s = this.formatValue(t), l = a.length;
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
          var O = n.split("").join("(".concat(this.groupChar, ")?")), _ = new RegExp(O, "g");
          _.test(s.slice(w.lastIndex)), p = w.lastIndex + _.lastIndex, this.$refs.input.$el.setSelectionRange(p, p);
        } else if (f === l)
          r === "insert" || r === "delete-back-single" ? this.$refs.input.$el.setSelectionRange(p + 1, p + 1) : r === "delete-single" ? this.$refs.input.$el.setSelectionRange(p - 1, p - 1) : (r === "delete-range" || r === "spin") && this.$refs.input.$el.setSelectionRange(p, p);
        else if (r === "delete-back-single") {
          var g = a.charAt(p - 1), T = a.charAt(p), V = l - f, z = this._group.test(T);
          z && V === 1 ? p += 1 : !z && this.isNumeralChar(g) && (p += -1 * V + 1), this._group.lastIndex = 0, this.$refs.input.$el.setSelectionRange(p, p);
        } else if (a === "-" && r === "insert") {
          this.$refs.input.$el.setSelectionRange(0, 0);
          var j = this.initCursor(), q = j + n.length + 1;
          this.$refs.input.$el.setSelectionRange(q, q);
        } else
          p = p + (f - l), this.$refs.input.$el.setSelectionRange(p, p);
      }
      this.$refs.input.$el.setAttribute("aria-valuenow", t), (o = this.$refs.clearIcon) !== null && o !== void 0 && (o = o.$el) !== null && o !== void 0 && o.style && (this.$refs.clearIcon.$el.style.display = Pe(s) ? "none" : "block");
    },
    concatValues: function(t, n) {
      if (t && n) {
        var r = n.search(this._decimal);
        return this._decimal.lastIndex = 0, this.suffixChar ? r !== -1 ? t.replace(this.suffixChar, "").split(this._decimal)[0] + n.replace(this.suffixChar, "").slice(r) + this.suffixChar : t : r !== -1 ? t.split(this._decimal)[0] + n.slice(r) : t;
      }
      return t;
    },
    getDecimalLength: function(t) {
      if (t) {
        var n = t.split(this._decimal);
        if (n.length === 2)
          return n[1].replace(this._suffix, "").trim().replace(/\s/g, "").replace(this._currency, "").length;
      }
      return 0;
    },
    updateModel: function(t, n) {
      this.writeValue(n, t);
    },
    onInputFocus: function(t) {
      this.focused = !0, !this.disabled && !this.readonly && this.$refs.input.$el.value !== Dn() && this.highlightOnFocus && t.target.select(), this.$emit("focus", t);
    },
    onInputBlur: function(t) {
      var n, r;
      this.focused = !1;
      var i = t.target, o = this.validateValue(this.parseValue(i.value));
      this.$emit("blur", {
        originalEvent: t,
        value: i.value
      }), (n = (r = this.formField).onBlur) === null || n === void 0 || n.call(r, t), i.value = this.formatValue(o), i.setAttribute("aria-valuenow", o), this.updateModel(t, o), !this.disabled && !this.readonly && this.highlightOnFocus && Fi();
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
      var t = this;
      return {
        mousedown: function(r) {
          return t.onUpButtonMouseDown(r);
        },
        mouseup: function(r) {
          return t.onUpButtonMouseUp(r);
        },
        mouseleave: function(r) {
          return t.onUpButtonMouseLeave(r);
        },
        keydown: function(r) {
          return t.onUpButtonKeyDown(r);
        },
        keyup: function(r) {
          return t.onUpButtonKeyUp(r);
        }
      };
    },
    downButtonListeners: function() {
      var t = this;
      return {
        mousedown: function(r) {
          return t.onDownButtonMouseDown(r);
        },
        mouseup: function(r) {
          return t.onDownButtonMouseUp(r);
        },
        mouseleave: function(r) {
          return t.onDownButtonMouseLeave(r);
        },
        keydown: function(r) {
          return t.onDownButtonKeyDown(r);
        },
        keyup: function(r) {
          return t.onDownButtonKeyUp(r);
        }
      };
    },
    formattedValue: function() {
      var t = !this.d_value && !this.allowEmpty ? 0 : this.d_value;
      return this.formatValue(t);
    },
    getFormatter: function() {
      return this.numberFormat;
    },
    dataP: function() {
      return ae(mn(mn({
        invalid: this.$invalid,
        fluid: this.$fluid,
        filled: this.$variant === "filled"
      }, this.size, this.size), this.buttonLayout, this.showButtons && this.buttonLayout));
    }
  },
  components: {
    InputText: Kt,
    AngleUpIcon: po,
    AngleDownIcon: co,
    TimesIcon: Rt
  }
}, pd = ["data-p"], fd = ["data-p"], hd = ["disabled", "data-p"], md = ["disabled", "data-p"], bd = ["disabled", "data-p"], gd = ["disabled", "data-p"];
function vd(e, t, n, r, i, o) {
  var a = re("InputText"), s = re("TimesIcon");
  return h(), b("span", v({
    class: e.cx("root")
  }, e.ptmi("root"), {
    "data-p": o.dataP
  }), [Q(a, {
    ref: "input",
    id: e.inputId,
    name: e.$formName,
    role: "spinbutton",
    class: ne([e.cx("pcInputText"), e.inputClass]),
    style: Qo(e.inputStyle),
    defaultValue: o.formattedValue,
    "aria-valuemin": e.min,
    "aria-valuemax": e.max,
    "aria-valuenow": e.d_value,
    inputmode: e.mode === "decimal" && !e.minFractionDigits ? "numeric" : "decimal",
    disabled: e.disabled,
    readonly: e.readonly,
    placeholder: e.placeholder,
    "aria-labelledby": e.ariaLabelledby,
    "aria-label": e.ariaLabel,
    required: e.required,
    size: e.size,
    invalid: e.invalid,
    variant: e.variant,
    onInput: o.onUserInput,
    onKeydown: o.onInputKeyDown,
    onKeypress: o.onInputKeyPress,
    onPaste: o.onPaste,
    onClick: o.onInputClick,
    onFocus: o.onInputFocus,
    onBlur: o.onInputBlur,
    pt: e.ptm("pcInputText"),
    unstyled: e.unstyled,
    "data-p": o.dataP
  }, null, 8, ["id", "name", "class", "style", "defaultValue", "aria-valuemin", "aria-valuemax", "aria-valuenow", "inputmode", "disabled", "readonly", "placeholder", "aria-labelledby", "aria-label", "required", "size", "invalid", "variant", "onInput", "onKeydown", "onKeypress", "onPaste", "onClick", "onFocus", "onBlur", "pt", "unstyled", "data-p"]), e.showClear && e.buttonLayout !== "vertical" ? L(e.$slots, "clearicon", {
    key: 0,
    class: ne(e.cx("clearIcon")),
    clearCallback: o.onClearClick
  }, function() {
    return [Q(s, v({
      ref: "clearIcon",
      class: [e.cx("clearIcon")],
      onClick: o.onClearClick
    }, e.ptm("clearIcon")), null, 16, ["class", "onClick"])];
  }) : A("", !0), e.showButtons && e.buttonLayout === "stacked" ? (h(), b("span", v({
    key: 1,
    class: e.cx("buttonGroup")
  }, e.ptm("buttonGroup"), {
    "data-p": o.dataP
  }), [L(e.$slots, "incrementbutton", {
    listeners: o.upButtonListeners
  }, function() {
    return [C("button", v({
      class: [e.cx("incrementButton"), e.incrementButtonClass]
    }, _t(o.upButtonListeners, !0), {
      disabled: e.disabled,
      tabindex: -1,
      "aria-hidden": "true",
      type: "button"
    }, e.ptm("incrementButton"), {
      "data-p": o.dataP
    }), [L(e.$slots, e.$slots.incrementicon ? "incrementicon" : "incrementbuttonicon", {}, function() {
      return [(h(), K(me(e.incrementIcon || e.incrementButtonIcon ? "span" : "AngleUpIcon"), v({
        class: [e.incrementIcon, e.incrementButtonIcon]
      }, e.ptm("incrementIcon"), {
        "data-pc-section": "incrementicon"
      }), null, 16, ["class"]))];
    })], 16, hd)];
  }), L(e.$slots, "decrementbutton", {
    listeners: o.downButtonListeners
  }, function() {
    return [C("button", v({
      class: [e.cx("decrementButton"), e.decrementButtonClass]
    }, _t(o.downButtonListeners, !0), {
      disabled: e.disabled,
      tabindex: -1,
      "aria-hidden": "true",
      type: "button"
    }, e.ptm("decrementButton"), {
      "data-p": o.dataP
    }), [L(e.$slots, e.$slots.decrementicon ? "decrementicon" : "decrementbuttonicon", {}, function() {
      return [(h(), K(me(e.decrementIcon || e.decrementButtonIcon ? "span" : "AngleDownIcon"), v({
        class: [e.decrementIcon, e.decrementButtonIcon]
      }, e.ptm("decrementIcon"), {
        "data-pc-section": "decrementicon"
      }), null, 16, ["class"]))];
    })], 16, md)];
  })], 16, fd)) : A("", !0), L(e.$slots, "incrementbutton", {
    listeners: o.upButtonListeners
  }, function() {
    return [e.showButtons && e.buttonLayout !== "stacked" ? (h(), b("button", v({
      key: 0,
      class: [e.cx("incrementButton"), e.incrementButtonClass]
    }, _t(o.upButtonListeners, !0), {
      disabled: e.disabled,
      tabindex: -1,
      "aria-hidden": "true",
      type: "button"
    }, e.ptm("incrementButton"), {
      "data-p": o.dataP
    }), [L(e.$slots, e.$slots.incrementicon ? "incrementicon" : "incrementbuttonicon", {}, function() {
      return [(h(), K(me(e.incrementIcon || e.incrementButtonIcon ? "span" : "AngleUpIcon"), v({
        class: [e.incrementIcon, e.incrementButtonIcon]
      }, e.ptm("incrementIcon"), {
        "data-pc-section": "incrementicon"
      }), null, 16, ["class"]))];
    })], 16, bd)) : A("", !0)];
  }), L(e.$slots, "decrementbutton", {
    listeners: o.downButtonListeners
  }, function() {
    return [e.showButtons && e.buttonLayout !== "stacked" ? (h(), b("button", v({
      key: 0,
      class: [e.cx("decrementButton"), e.decrementButtonClass]
    }, _t(o.downButtonListeners, !0), {
      disabled: e.disabled,
      tabindex: -1,
      "aria-hidden": "true",
      type: "button"
    }, e.ptm("decrementButton"), {
      "data-p": o.dataP
    }), [L(e.$slots, e.$slots.decrementicon ? "decrementicon" : "decrementbuttonicon", {}, function() {
      return [(h(), K(me(e.decrementIcon || e.decrementButtonIcon ? "span" : "AngleDownIcon"), v({
        class: [e.decrementIcon, e.decrementButtonIcon]
      }, e.ptm("decrementIcon"), {
        "data-pc-section": "decrementicon"
      }), null, 16, ["class"]))];
    })], 16, gd)) : A("", !0)];
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
  root: function(t) {
    var n = t.instance, r = t.props;
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
}, wd = D.extend({
  name: "textarea",
  style: yd,
  classes: xd
}), kd = {
  name: "BaseTextarea",
  extends: Tt,
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
function kt(e) {
  "@babel/helpers - typeof";
  return kt = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, kt(e);
}
function Sd(e, t, n) {
  return (t = $d(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function $d(e) {
  var t = Cd(e, "string");
  return kt(t) == "symbol" ? t : t + "";
}
function Cd(e, t) {
  if (kt(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (kt(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var ho = {
  name: "Textarea",
  extends: kd,
  inheritAttrs: !1,
  observer: null,
  mounted: function() {
    var t = this;
    this.autoResize && (this.observer = new ResizeObserver(function() {
      requestAnimationFrame(function() {
        t.resize();
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
        var t = this.$el.style.height, n = parseInt(t) || 0, r = this.$el.scrollHeight, i = !n || r > n, o = n && r < n;
        o ? (this.$el.style.height = "auto", this.$el.style.height = "".concat(this.$el.scrollHeight, "px")) : i && (this.$el.style.height = "".concat(r, "px"));
      }
    },
    onInput: function(t) {
      this.autoResize && this.resize(), this.writeValue(t.target.value, t);
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
function Id(e, t, n, r, i, o) {
  return h(), b("textarea", v({
    class: e.cx("root"),
    value: e.d_value,
    name: e.name,
    disabled: e.disabled,
    "aria-invalid": e.invalid || void 0,
    "data-p": o.dataP,
    onInput: t[0] || (t[0] = function() {
      return o.onInput && o.onInput.apply(o, arguments);
    })
  }, o.attrs), null, 16, Od);
}
ho.render = Id;
var mo = {
  name: "BlankIcon",
  extends: xe
};
function Td(e) {
  return Ad(e) || Ld(e) || Pd(e) || _d();
}
function _d() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Pd(e, t) {
  if (e) {
    if (typeof e == "string") return gn(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? gn(e, t) : void 0;
  }
}
function Ld(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function Ad(e) {
  if (Array.isArray(e)) return gn(e);
}
function gn(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function zd(e, t, n, r, i, o) {
  return h(), b("svg", v({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), Td(t[0] || (t[0] = [C("rect", {
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
function Ed(e) {
  return Dd(e) || Vd(e) || jd(e) || Bd();
}
function Bd() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function jd(e, t) {
  if (e) {
    if (typeof e == "string") return vn(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? vn(e, t) : void 0;
  }
}
function Vd(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function Dd(e) {
  if (Array.isArray(e)) return vn(e);
}
function vn(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function Md(e, t, n, r, i, o) {
  return h(), b("svg", v({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), Ed(t[0] || (t[0] = [C("path", {
    d: "M7.01744 10.398C6.91269 10.3985 6.8089 10.378 6.71215 10.3379C6.61541 10.2977 6.52766 10.2386 6.45405 10.1641L1.13907 4.84913C1.03306 4.69404 0.985221 4.5065 1.00399 4.31958C1.02276 4.13266 1.10693 3.95838 1.24166 3.82747C1.37639 3.69655 1.55301 3.61742 1.74039 3.60402C1.92777 3.59062 2.11386 3.64382 2.26584 3.75424L7.01744 8.47394L11.769 3.75424C11.9189 3.65709 12.097 3.61306 12.2748 3.62921C12.4527 3.64535 12.6199 3.72073 12.7498 3.84328C12.8797 3.96582 12.9647 4.12842 12.9912 4.30502C13.0177 4.48162 12.9841 4.662 12.8958 4.81724L7.58083 10.1322C7.50996 10.2125 7.42344 10.2775 7.32656 10.3232C7.22968 10.3689 7.12449 10.3944 7.01744 10.398Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
bo.render = Md;
var go = {
  name: "SearchIcon",
  extends: xe
};
function Nd(e) {
  return Ud(e) || Kd(e) || Rd(e) || Fd();
}
function Fd() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Rd(e, t) {
  if (e) {
    if (typeof e == "string") return yn(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? yn(e, t) : void 0;
  }
}
function Kd(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function Ud(e) {
  if (Array.isArray(e)) return yn(e);
}
function yn(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function Hd(e, t, n, r, i, o) {
  return h(), b("svg", v({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), Nd(t[0] || (t[0] = [C("path", {
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
}, qd = D.extend({
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
function Zd(e, t, n, r, i, o) {
  return h(), b("div", v({
    class: e.cx("root")
  }, e.ptmi("root")), [L(e.$slots, "default")], 16);
}
vo.render = Zd;
var Jd = {
  root: "p-inputicon"
}, Qd = D.extend({
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
function ec(e, t, n, r, i, o) {
  return h(), b("span", v({
    class: o.containerClass
  }, e.ptmi("root"), {
    "aria-hidden": "true"
  }), [L(e.$slots, "default")], 16);
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
`, yr = D.extend({
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
  style: yr,
  provide: function() {
    return {
      $pcVirtualScroller: this,
      $parentInstance: this
    };
  },
  beforeMount: function() {
    var t;
    yr.loadCSS({
      nonce: (t = this.$primevueConfig) === null || t === void 0 || (t = t.csp) === null || t === void 0 ? void 0 : t.nonce
    });
  }
};
function St(e) {
  "@babel/helpers - typeof";
  return St = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, St(e);
}
function xr(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(e);
    t && (r = r.filter(function(i) {
      return Object.getOwnPropertyDescriptor(e, i).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function Ze(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? xr(Object(n), !0).forEach(function(r) {
      xo(e, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : xr(Object(n)).forEach(function(r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return e;
}
function xo(e, t, n) {
  return (t = oc(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function oc(e) {
  var t = ic(e, "string");
  return St(t) == "symbol" ? t : t + "";
}
function ic(e, t) {
  if (St(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (St(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var wo = {
  name: "VirtualScroller",
  extends: rc,
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
      Bt(this.element) && (this.setContentEl(this.content), this.init(), this.calculateAutoSize(), this.defaultWidth = $e(this.element), this.defaultHeight = Le(this.element), this.defaultContentWidth = $e(this.content), this.defaultContentHeight = Le(this.content), this.initialized = !0), this.element && this.bindResizeListener();
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
      var n = this, r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "auto", i = this.isBoth(), o = this.isHorizontal(), a = i ? t.every(function(z) {
        return z > -1;
      }) : t > -1;
      if (a) {
        var s = this.first, l = this.element, u = l.scrollTop, d = u === void 0 ? 0 : u, c = l.scrollLeft, p = c === void 0 ? 0 : c, f = this.calculateNumItems(), m = f.numToleratedItems, x = this.getContentPosition(), y = this.itemSize, w = function() {
          var j = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0, q = arguments.length > 1 ? arguments[1] : void 0;
          return j <= q ? 0 : j;
        }, O = function(j, q, X) {
          return j * q + X;
        }, _ = function() {
          var j = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0, q = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0;
          return n.scrollTo({
            left: j,
            top: q,
            behavior: r
          });
        }, g = i ? {
          rows: 0,
          cols: 0
        } : 0, T = !1, V = !1;
        i ? (g = {
          rows: w(t[0], m[0]),
          cols: w(t[1], m[1])
        }, _(O(g.cols, y[1], x.left), O(g.rows, y[0], x.top)), V = this.lastScrollPos.top !== d || this.lastScrollPos.left !== p, T = g.rows !== s.rows || g.cols !== s.cols) : (g = w(t, m), o ? _(O(g, y, x.left), d) : _(p, O(g, y, x.top)), V = this.lastScrollPos !== (o ? p : d), T = g !== s), this.isRangeChanged = T, V && (this.first = g);
      }
    },
    scrollInView: function(t, n) {
      var r = this, i = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : "auto";
      if (n) {
        var o = this.isBoth(), a = this.isHorizontal(), s = o ? t.every(function(y) {
          return y > -1;
        }) : t > -1;
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
              d.first.rows - u.rows > t[0] ? c(d.first.cols * this.itemSize[1], (d.first.rows - 1) * this.itemSize[0]) : d.first.cols - u.cols > t[1] && c((d.first.cols - 1) * this.itemSize[1], d.first.rows * this.itemSize[0]);
            else if (d.first - u > t) {
              var m = (d.first - 1) * this.itemSize;
              a ? c(m, 0) : c(0, m);
            }
          } else if (f) {
            if (o)
              d.last.rows - u.rows <= t[0] + 1 ? c(d.first.cols * this.itemSize[1], (d.first.rows + 1) * this.itemSize[0]) : d.last.cols - u.cols <= t[1] + 1 && c((d.first.cols + 1) * this.itemSize[1], d.first.rows * this.itemSize[0]);
            else if (d.last - u <= t + 1) {
              var x = (d.first + 1) * this.itemSize;
              a ? c(x, 0) : c(0, x);
            }
          }
        }
      } else
        this.scrollToIndex(t, i);
    },
    getRenderedRange: function() {
      var t = function(c, p) {
        return Math.floor(c / (p || c));
      }, n = this.first, r = 0;
      if (this.element) {
        var i = this.isBoth(), o = this.isHorizontal(), a = this.element, s = a.scrollTop, l = a.scrollLeft;
        if (i)
          n = {
            rows: t(s, this.itemSize[0]),
            cols: t(l, this.itemSize[1])
          }, r = {
            rows: n.rows + this.numItemsInViewport.rows,
            cols: n.cols + this.numItemsInViewport.cols
          };
        else {
          var u = o ? l : s;
          n = t(u, this.itemSize), r = n + this.numItemsInViewport;
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
      var t = this.isBoth(), n = this.isHorizontal(), r = this.itemSize, i = this.getContentPosition(), o = this.element ? this.element.offsetWidth - i.left : 0, a = this.element ? this.element.offsetHeight - i.top : 0, s = function(p, f) {
        return Math.ceil(p / (f || p));
      }, l = function(p) {
        return Math.ceil(p / 2);
      }, u = t ? {
        rows: s(a, r[0]),
        cols: s(o, r[1])
      } : s(n ? o : a, r), d = this.d_numToleratedItems || (t ? [l(u.rows), l(u.cols)] : l(u));
      return {
        numItemsInViewport: u,
        numToleratedItems: d
      };
    },
    calculateOptions: function() {
      var t = this, n = this.isBoth(), r = this.first, i = this.calculateNumItems(), o = i.numItemsInViewport, a = i.numToleratedItems, s = function(d, c, p) {
        var f = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : !1;
        return t.getLast(d + c + (d < p ? 2 : 3) * p, f);
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
        t.lazyLoadState = {
          first: t.step ? n ? {
            rows: 0,
            cols: r.cols
          } : 0 : r,
          last: Math.min(t.step ? t.step : l, ((u = t.items) === null || u === void 0 ? void 0 : u.length) || 0)
        }, t.$emit("lazy-load", t.lazyLoadState);
      });
    },
    calculateAutoSize: function() {
      var t = this;
      this.autoSize && !this.d_loading && Promise.resolve().then(function() {
        if (t.content) {
          var n = t.isBoth(), r = t.isHorizontal(), i = t.isVertical();
          t.content.style.minHeight = t.content.style.minWidth = "auto", t.content.style.position = "relative", t.element.style.contain = "none";
          var o = [$e(t.element), Le(t.element)], a = o[0], s = o[1];
          (n || r) && (t.element.style.width = a < t.defaultWidth ? a + "px" : t.scrollWidth || t.defaultWidth + "px"), (n || i) && (t.element.style.height = s < t.defaultHeight ? s + "px" : t.scrollHeight || t.defaultHeight + "px"), t.content.style.minHeight = t.content.style.minWidth = "", t.content.style.position = "", t.element.style.contain = "";
        }
      });
    },
    getLast: function() {
      var t, n, r = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0, i = arguments.length > 1 ? arguments[1] : void 0;
      return this.items ? Math.min(i ? ((t = this.columns || this.items[0]) === null || t === void 0 ? void 0 : t.length) || 0 : ((n = this.items) === null || n === void 0 ? void 0 : n.length) || 0, r) : 0;
    },
    getContentPosition: function() {
      if (this.content) {
        var t = getComputedStyle(this.content), n = parseFloat(t.paddingLeft) + Math.max(parseFloat(t.left) || 0, 0), r = parseFloat(t.paddingRight) + Math.max(parseFloat(t.right) || 0, 0), i = parseFloat(t.paddingTop) + Math.max(parseFloat(t.top) || 0, 0), o = parseFloat(t.paddingBottom) + Math.max(parseFloat(t.bottom) || 0, 0);
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
      var t = this;
      if (this.element) {
        var n = this.isBoth(), r = this.isHorizontal(), i = this.element.parentElement, o = this.scrollWidth || "".concat(this.element.offsetWidth || i.offsetWidth, "px"), a = this.scrollHeight || "".concat(this.element.offsetHeight || i.offsetHeight, "px"), s = function(u, d) {
          return t.element.style[u] = d;
        };
        n || r ? (s("height", a), s("width", o)) : s("height", a);
      }
    },
    setSpacerSize: function() {
      var t = this, n = this.items;
      if (n) {
        var r = this.isBoth(), i = this.isHorizontal(), o = this.getContentPosition(), a = function(l, u, d) {
          var c = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : 0;
          return t.spacerStyle = Ze(Ze({}, t.spacerStyle), xo({}, "".concat(l), (u || []).length * d + c + "px"));
        };
        r ? (a("height", n, this.itemSize[0], o.y), a("width", this.columns || n[1], this.itemSize[1], o.x)) : i ? a("width", this.columns || n, this.itemSize, o.x) : a("height", n, this.itemSize, o.y);
      }
    },
    setContentPosition: function(t) {
      var n = this;
      if (this.content && !this.appendOnly) {
        var r = this.isBoth(), i = this.isHorizontal(), o = t ? t.first : this.first, a = function(d, c) {
          return d * c;
        }, s = function() {
          var d = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0, c = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0;
          return n.contentStyle = Ze(Ze({}, n.contentStyle), {
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
    onScrollPositionChange: function(t) {
      var n = this, r = t.target, i = this.isBoth(), o = this.isHorizontal(), a = this.getContentPosition(), s = function(U, Y) {
        return U ? U > Y ? U - Y : U : 0;
      }, l = function(U, Y) {
        return Math.floor(U / (Y || U));
      }, u = function(U, Y, J, te, S, E) {
        return U <= S ? S : E ? J - te - S : Y + S - 1;
      }, d = function(U, Y, J, te, S, E, $, k) {
        if (U <= E) return 0;
        var P = Math.max(0, $ ? U < Y ? J : U - E : U > Y ? J : U - 2 * E), I = n.getLast(P, k);
        return P > I ? I - S : P;
      }, c = function(U, Y, J, te, S, E) {
        var $ = Y + te + 2 * S;
        return U >= S && ($ += S + 1), n.getLast($, E);
      }, p = s(r.scrollTop, a.top), f = s(r.scrollLeft, a.left), m = i ? {
        rows: 0,
        cols: 0
      } : 0, x = this.last, y = !1, w = this.lastScrollPos;
      if (i) {
        var O = this.lastScrollPos.top <= p, _ = this.lastScrollPos.left <= f;
        if (!this.appendOnly || this.appendOnly && (O || _)) {
          var g = {
            rows: l(p, this.itemSize[0]),
            cols: l(f, this.itemSize[1])
          }, T = {
            rows: u(g.rows, this.first.rows, this.last.rows, this.numItemsInViewport.rows, this.d_numToleratedItems[0], O),
            cols: u(g.cols, this.first.cols, this.last.cols, this.numItemsInViewport.cols, this.d_numToleratedItems[1], _)
          };
          m = {
            rows: d(g.rows, T.rows, this.first.rows, this.last.rows, this.numItemsInViewport.rows, this.d_numToleratedItems[0], O),
            cols: d(g.cols, T.cols, this.first.cols, this.last.cols, this.numItemsInViewport.cols, this.d_numToleratedItems[1], _, !0)
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
          var j = l(V, this.itemSize), q = u(j, this.first, this.last, this.numItemsInViewport, this.d_numToleratedItems, z);
          m = d(j, q, this.first, this.last, this.numItemsInViewport, this.d_numToleratedItems, z), x = c(j, m, this.last, this.numItemsInViewport, this.d_numToleratedItems), y = m !== this.first || x !== this.last || this.isRangeChanged, w = V;
        }
      }
      return {
        first: m,
        last: x,
        isRangeChanged: y,
        scrollPos: w
      };
    },
    onScrollChange: function(t) {
      var n = this.onScrollPositionChange(t), r = n.first, i = n.last, o = n.isRangeChanged, a = n.scrollPos;
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
    onScroll: function(t) {
      var n = this;
      if (this.$emit("scroll", t), this.delay) {
        if (this.scrollTimeout && clearTimeout(this.scrollTimeout), this.isPageChanged()) {
          if (!this.d_loading && this.showLoader) {
            var r = this.onScrollPositionChange(t), i = r.isRangeChanged, o = i || (this.step ? this.isPageChanged() : !1);
            o && (this.d_loading = !0);
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
        if (Bt(t.element)) {
          var n = t.isBoth(), r = t.isVertical(), i = t.isHorizontal(), o = [$e(t.element), Le(t.element)], a = o[0], s = o[1], l = a !== t.defaultWidth, u = s !== t.defaultHeight, d = n ? l || u : i ? l : r ? u : !1;
          d && (t.d_numToleratedItems = t.numToleratedItems, t.defaultWidth = a, t.defaultHeight = s, t.defaultContentWidth = $e(t.content), t.defaultContentHeight = Le(t.content), t.init());
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
      var n = (this.items || []).length, r = this.isBoth() ? this.first.rows + t : this.first + t;
      return {
        index: r,
        count: n,
        first: r === 0,
        last: r === n - 1,
        even: r % 2 === 0,
        odd: r % 2 !== 0
      };
    },
    getLoaderOptions: function(t, n) {
      var r = this.loaderArr.length;
      return Ze({
        index: t,
        count: r,
        first: t === 0,
        last: t === r - 1,
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
      this.content = t || this.content || Be(this.element, '[data-pc-section="content"]');
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
    SpinnerIcon: Ft
  }
}, ac = ["tabindex"];
function sc(e, t, n, r, i, o) {
  var a = re("SpinnerIcon");
  return e.disabled ? (h(), b(oe, {
    key: 1
  }, [L(e.$slots, "default"), L(e.$slots, "content", {
    items: e.items,
    rows: e.items,
    columns: o.loadedColumns
  })], 64)) : (h(), b("div", v({
    key: 0,
    ref: o.elementRef,
    class: o.containerClass,
    tabindex: e.tabindex,
    style: e.style,
    onScroll: t[0] || (t[0] = function() {
      return o.onScroll && o.onScroll.apply(o, arguments);
    })
  }, e.ptmi("root")), [L(e.$slots, "content", {
    styleClass: o.contentClass,
    items: o.loadedItems,
    getItemOptions: o.getOptions,
    loading: i.d_loading,
    getLoaderOptions: o.getLoaderOptions,
    itemSize: e.itemSize,
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
    }, e.ptm("content")), [(h(!0), b(oe, null, ye(o.loadedItems, function(s, l) {
      return L(e.$slots, "item", {
        key: l,
        item: s,
        options: o.getOptions(l)
      });
    }), 128))], 16)];
  }), e.showSpacer ? (h(), b("div", v({
    key: 0,
    class: "p-virtualscroller-spacer",
    style: i.spacerStyle
  }, e.ptm("spacer")), null, 16)) : A("", !0), !e.loaderDisabled && e.showLoader && i.d_loading ? (h(), b("div", v({
    key: 1,
    class: o.loaderClass
  }, e.ptm("loader")), [e.$slots && e.$slots.loader ? (h(!0), b(oe, {
    key: 0
  }, ye(i.loaderArr, function(s, l) {
    return L(e.$slots, "loader", {
      key: l,
      options: o.getLoaderOptions(l, o.isBoth() && {
        numCols: e.d_numItemsInViewport.cols
      })
    });
  }), 128)) : A("", !0), L(e.$slots, "loadingicon", {}, function() {
    return [Q(a, v({
      spin: "",
      class: "p-virtualscroller-loading-icon"
    }, e.ptm("loadingIcon")), null, 16)];
  })], 16)) : A("", !0)], 16, ac));
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
  root: function(t) {
    var n = t.instance, r = t.props, i = t.state;
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
  label: function(t) {
    var n, r = t.instance, i = t.props;
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
  option: function(t) {
    var n = t.instance, r = t.props, i = t.state, o = t.option, a = t.focusedOption;
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
}, dc = D.extend({
  name: "select",
  style: lc,
  classes: uc
}), cc = {
  name: "BaseSelect",
  extends: Tt,
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
function $t(e) {
  "@babel/helpers - typeof";
  return $t = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, $t(e);
}
function pc(e) {
  return bc(e) || mc(e) || hc(e) || fc();
}
function fc() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function hc(e, t) {
  if (e) {
    if (typeof e == "string") return xn(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? xn(e, t) : void 0;
  }
}
function mc(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function bc(e) {
  if (Array.isArray(e)) return xn(e);
}
function xn(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function wr(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(e);
    t && (r = r.filter(function(i) {
      return Object.getOwnPropertyDescriptor(e, i).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function kr(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? wr(Object(n), !0).forEach(function(r) {
      De(e, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : wr(Object(n)).forEach(function(r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return e;
}
function De(e, t, n) {
  return (t = gc(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function gc(e) {
  var t = vc(e, "string");
  return $t(t) == "symbol" ? t : t + "";
}
function vc(e, t) {
  if ($t(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if ($t(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
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
    this.unbindOutsideClickListener(), this.unbindResizeListener(), this.unbindLabelClickListener(), this.unbindMatchMediaOrientationListener(), this.scrollHandler && (this.scrollHandler.destroy(), this.scrollHandler = null), this.overlay && (Ht.clear(this.overlay), this.overlay = null);
  },
  methods: {
    getOptionIndex: function(t, n) {
      return this.virtualScrollerDisabled ? t : n && n(t).index;
    },
    getOptionLabel: function(t) {
      return this.optionLabel ? _e(t, this.optionLabel) : t;
    },
    getOptionValue: function(t) {
      return this.optionValue ? _e(t, this.optionValue) : t;
    },
    getOptionRenderKey: function(t, n) {
      return (this.dataKey ? _e(t, this.dataKey) : this.getOptionLabel(t)) + "_" + n;
    },
    getPTItemOptions: function(t, n, r, i) {
      return this.ptm(i, {
        context: {
          option: t,
          index: r,
          selected: this.isSelected(t),
          focused: this.focusedOptionIndex === this.getOptionIndex(r, n),
          disabled: this.isOptionDisabled(t)
        }
      });
    },
    isOptionDisabled: function(t) {
      return this.optionDisabled ? _e(t, this.optionDisabled) : !1;
    },
    isOptionGroup: function(t) {
      return this.optionGroupLabel && t.optionGroup && t.group;
    },
    getOptionGroupLabel: function(t) {
      return _e(t, this.optionGroupLabel);
    },
    getOptionGroupChildren: function(t) {
      return _e(t, this.optionGroupChildren);
    },
    getAriaPosInset: function(t) {
      var n = this;
      return (this.optionGroupLabel ? t - this.visibleOptions.slice(0, t).filter(function(r) {
        return n.isOptionGroup(r);
      }).length : t) + 1;
    },
    show: function(t) {
      this.$emit("before-show"), this.overlayVisible = !0, this.focusedOptionIndex = this.focusedOptionIndex !== -1 ? this.focusedOptionIndex : this.autoOptionFocus ? this.findFirstFocusedOptionIndex() : this.editable ? -1 : this.findSelectedOptionIndex(), t && ke(this.$refs.focusInput);
    },
    hide: function(t) {
      var n = this, r = function() {
        n.$emit("before-hide"), n.overlayVisible = !1, n.clicked = !1, n.focusedOptionIndex = -1, n.searchValue = "", n.resetFilterOnHide && (n.filterValue = null), t && ke(n.$refs.focusInput);
      };
      setTimeout(function() {
        r();
      }, 0);
    },
    onFocus: function(t) {
      this.disabled || (this.focused = !0, this.overlayVisible && (this.focusedOptionIndex = this.focusedOptionIndex !== -1 ? this.focusedOptionIndex : this.autoOptionFocus ? this.findFirstFocusedOptionIndex() : this.editable ? -1 : this.findSelectedOptionIndex(), this.scrollInView(this.focusedOptionIndex)), this.$emit("focus", t));
    },
    onBlur: function(t) {
      var n = this;
      setTimeout(function() {
        var r, i;
        n.focused = !1, n.focusedOptionIndex = -1, n.searchValue = "", n.$emit("blur", t), (r = (i = n.formField).onBlur) === null || r === void 0 || r.call(i, t);
      }, 100);
    },
    onKeyDown: function(t) {
      var n = this;
      if (this.disabled) {
        t.preventDefault();
        return;
      }
      if (Gi())
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
      var r = t.metaKey || t.ctrlKey;
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
          !r && Pi(t.key) && (!this.overlayVisible && this.show(), !this.editable && this.searchOptions(t, t.key), this.filter && this.$nextTick(function() {
            n.$refs.filterInput && ke(n.$refs.filterInput.$el);
          }));
          break;
      }
      this.clicked = !1;
    },
    onEditableInput: function(t) {
      var n = t.target.value;
      this.searchValue = "";
      var r = this.searchOptions(t, n);
      !r && (this.focusedOptionIndex = -1), this.updateModel(t, n), !this.overlayVisible && F(n) && this.show();
    },
    onContainerClick: function(t) {
      this.disabled || this.loading || t.target.tagName === "INPUT" || t.target.getAttribute("data-pc-section") === "clearicon" || t.target.closest('[data-pc-section="clearicon"]') || ((!this.overlay || !this.overlay.contains(t.target)) && (this.overlayVisible ? this.hide(!0) : this.show(!0)), this.clicked = !0);
    },
    onClearClick: function(t) {
      this.updateModel(t, null), this.resetFilterOnClear && (this.filterValue = null);
    },
    onFirstHiddenFocus: function(t) {
      var n = t.relatedTarget === this.$refs.focusInput ? Ui(this.overlay, ':not([data-p-hidden-focusable="true"])') : this.$refs.focusInput;
      ke(n);
    },
    onLastHiddenFocus: function(t) {
      var n = t.relatedTarget === this.$refs.focusInput ? Hi(this.overlay, ':not([data-p-hidden-focusable="true"])') : this.$refs.focusInput;
      ke(n);
    },
    onOptionSelect: function(t, n) {
      var r = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : !0;
      if (this.overlayVisible) {
        var i = this.getOptionValue(n);
        this.updateModel(t, i), r && this.hide(!0);
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
      gs.emit("overlay-click", {
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
        var r = this.focusedOptionIndex !== -1 ? this.findPrevOptionIndex(this.focusedOptionIndex) : this.clicked ? this.findLastOptionIndex() : this.findLastFocusedOptionIndex();
        this.changeFocusedOptionIndex(t, r), !this.overlayVisible && this.show(), t.preventDefault();
      }
    },
    onArrowLeftKey: function(t) {
      var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1;
      n && (this.focusedOptionIndex = -1);
    },
    onHomeKey: function(t) {
      var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1;
      if (n) {
        var r = t.currentTarget;
        t.shiftKey ? r.setSelectionRange(0, t.target.selectionStart) : (r.setSelectionRange(0, 0), this.focusedOptionIndex = -1);
      } else
        this.changeFocusedOptionIndex(t, this.findFirstOptionIndex()), !this.overlayVisible && this.show();
      t.preventDefault();
    },
    onEndKey: function(t) {
      var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1;
      if (n) {
        var r = t.currentTarget;
        if (t.shiftKey)
          r.setSelectionRange(t.target.selectionStart, r.value.length);
        else {
          var i = r.value.length;
          r.setSelectionRange(i, i), this.focusedOptionIndex = -1;
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
      n || (this.overlayVisible && this.hasFocusableElements() ? (ke(this.$refs.firstHiddenFocusableElementOnOverlay), t.preventDefault()) : (this.focusedOptionIndex !== -1 && this.onOptionSelect(t, this.visibleOptions[this.focusedOptionIndex]), this.overlayVisible && this.hide(this.filter)));
    },
    onBackspaceKey: function(t) {
      var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1;
      n && !this.overlayVisible && this.show();
    },
    onOverlayEnter: function(t) {
      var n = this;
      Ht.set("overlay", t, this.$primevue.config.zIndex.overlay), Di(t, {
        position: "absolute",
        top: "0"
      }), this.alignOverlay(), this.scrollInView(), this.$attrSelector && t.setAttribute(this.$attrSelector, ""), setTimeout(function() {
        n.autoFilterFocus && n.filter && ke(n.$refs.filterInput.$el), n.autoUpdateModel();
      }, 1);
    },
    onOverlayAfterEnter: function() {
      this.bindOutsideClickListener(), this.bindScrollListener(), this.bindResizeListener(), this.$emit("show");
    },
    onOverlayLeave: function(t) {
      var n = this;
      t.style.pointerEvents = "none", this.unbindOutsideClickListener(), this.unbindScrollListener(), this.unbindResizeListener(), this.autoFilterFocus && this.filter && !this.editable && this.$nextTick(function() {
        n.$refs.filterInput && ke(n.$refs.filterInput.$el);
      }), this.$emit("hide"), this.overlay = null;
    },
    onOverlayAfterLeave: function(t) {
      Ht.clear(t);
    },
    alignOverlay: function() {
      this.appendTo === "self" ? Mi(this.overlay, this.$el) : this.overlay && (this.overlay.style.minWidth = In(this.$el) + "px", Vi(this.overlay, this.$el));
    },
    bindOutsideClickListener: function() {
      var t = this;
      this.outsideClickListener || (this.outsideClickListener = function(n) {
        var r = n.composedPath();
        t.overlayVisible && t.overlay && !r.includes(t.$el) && !r.includes(t.overlay) && t.hide();
      }, document.addEventListener("click", this.outsideClickListener, !0));
    },
    unbindOutsideClickListener: function() {
      this.outsideClickListener && (document.removeEventListener("click", this.outsideClickListener, !0), this.outsideClickListener = null);
    },
    bindScrollListener: function() {
      var t = this;
      this.scrollHandler || (this.scrollHandler = new bs(this.$refs.container, function() {
        t.overlayVisible && t.hide();
      })), this.scrollHandler.bindScrollListener();
    },
    unbindScrollListener: function() {
      this.scrollHandler && this.scrollHandler.unbindScrollListener();
    },
    bindResizeListener: function() {
      var t = this;
      this.resizeListener || (this.resizeListener = function() {
        t.overlayVisible && !qi() && t.hide();
      }, window.addEventListener("resize", this.resizeListener));
    },
    unbindResizeListener: function() {
      this.resizeListener && (window.removeEventListener("resize", this.resizeListener), this.resizeListener = null);
    },
    bindLabelClickListener: function() {
      var t = this;
      if (!this.editable && !this.labelClickListener) {
        var n = document.querySelector('label[for="'.concat(this.labelId, '"]'));
        n && Bt(n) && (this.labelClickListener = function() {
          ke(t.$refs.focusInput);
        }, n.addEventListener("click", this.labelClickListener));
      }
    },
    unbindLabelClickListener: function() {
      if (this.labelClickListener) {
        var t = document.querySelector('label[for="'.concat(this.labelId, '"]'));
        t && Bt(t) && t.removeEventListener("click", this.labelClickListener);
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
      return Tn(this.overlay, ':not([data-p-hidden-focusable="true"])').length > 0;
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
      return F(t) && !(this.isOptionDisabled(t) || this.isOptionGroup(t));
    },
    isValidSelectedOption: function(t) {
      return this.isValidOption(t) && this.isSelected(t);
    },
    isSelected: function(t) {
      return Ot(this.d_value, this.getOptionValue(t), this.equalityKey);
    },
    findFirstOptionIndex: function() {
      var t = this;
      return this.visibleOptions.findIndex(function(n) {
        return t.isValidOption(n);
      });
    },
    findLastOptionIndex: function() {
      var t = this;
      return Vn(this.visibleOptions, function(n) {
        return t.isValidOption(n);
      });
    },
    findNextOptionIndex: function(t) {
      var n = this, r = t < this.visibleOptions.length - 1 ? this.visibleOptions.slice(t + 1).findIndex(function(i) {
        return n.isValidOption(i);
      }) : -1;
      return r > -1 ? r + t + 1 : t;
    },
    findPrevOptionIndex: function(t) {
      var n = this, r = t > 0 ? Vn(this.visibleOptions.slice(0, t), function(i) {
        return n.isValidOption(i);
      }) : -1;
      return r > -1 ? r : t;
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
      var r = this;
      this.searchValue = (this.searchValue || "") + n;
      var i = -1, o = !1;
      return F(this.searchValue) && (i = this.visibleOptions.findIndex(function(a) {
        return r.isOptionExactMatched(a);
      }), i === -1 && (i = this.visibleOptions.findIndex(function(a) {
        return r.isOptionStartsWith(a);
      })), i !== -1 && (o = !0), i === -1 && this.focusedOptionIndex === -1 && (i = this.findFirstFocusedOptionIndex()), i !== -1 && this.changeFocusedOptionIndex(t, i)), this.searchTimeout && clearTimeout(this.searchTimeout), this.searchTimeout = setTimeout(function() {
        r.searchValue = "", r.searchTimeout = null;
      }, 500), o;
    },
    changeFocusedOptionIndex: function(t, n) {
      this.focusedOptionIndex !== n && (this.focusedOptionIndex = n, this.scrollInView(), this.selectOnFocus && this.onOptionSelect(t, this.visibleOptions[n], !1));
    },
    scrollInView: function() {
      var t = this, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : -1;
      this.$nextTick(function() {
        var r = n !== -1 ? "".concat(t.$id, "_").concat(n) : t.focusedOptionId, i = Be(t.list, 'li[id="'.concat(r, '"]'));
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
      return (t || []).reduce(function(r, i, o) {
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
        var r = ua.filter(n, this.searchFields, this.filterValue, this.filterMatchMode, this.filterLocale);
        if (this.optionGroupLabel) {
          var i = this.options || [], o = [];
          return i.forEach(function(a) {
            var s = t.getOptionGroupChildren(a), l = s.filter(function(u) {
              return r.includes(u);
            });
            l.length > 0 && o.push(kr(kr({}, a), {}, De({}, typeof t.optionGroupChildren == "string" ? t.optionGroupChildren : "items", pc(l))));
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
    InputText: Kt,
    VirtualScroller: wo,
    Portal: _n,
    InputIcon: yo,
    IconField: vo,
    TimesIcon: Rt,
    ChevronDownIcon: bo,
    SpinnerIcon: Ft,
    SearchIcon: go,
    CheckIcon: An,
    BlankIcon: mo
  }
}, yc = ["id", "data-p"], xc = ["name", "id", "value", "placeholder", "tabindex", "disabled", "aria-label", "aria-labelledby", "aria-expanded", "aria-controls", "aria-activedescendant", "aria-invalid", "data-p"], wc = ["name", "id", "tabindex", "aria-label", "aria-labelledby", "aria-expanded", "aria-controls", "aria-activedescendant", "aria-invalid", "aria-disabled", "data-p"], kc = ["data-p"], Sc = ["id"], $c = ["id"], Cc = ["id", "aria-label", "aria-selected", "aria-disabled", "aria-setsize", "aria-posinset", "onMousedown", "onMousemove", "data-p-selected", "data-p-focused", "data-p-disabled"];
function Oc(e, t, n, r, i, o) {
  var a = re("SpinnerIcon"), s = re("InputText"), l = re("SearchIcon"), u = re("InputIcon"), d = re("IconField"), c = re("CheckIcon"), p = re("BlankIcon"), f = re("VirtualScroller"), m = re("Portal"), x = Ct("ripple");
  return h(), b("div", v({
    ref: "container",
    id: e.$id,
    class: e.cx("root"),
    onClick: t[12] || (t[12] = function() {
      return o.onContainerClick && o.onContainerClick.apply(o, arguments);
    }),
    "data-p": o.containerDataP
  }, e.ptmi("root")), [e.editable ? (h(), b("input", v({
    key: 0,
    ref: "focusInput",
    name: e.name,
    id: e.labelId || e.inputId,
    type: "text",
    class: [e.cx("label"), e.inputClass, e.labelClass],
    style: [e.inputStyle, e.labelStyle],
    value: o.editableInputValue,
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
    "aria-activedescendant": i.focused ? o.focusedOptionId : void 0,
    "aria-invalid": e.invalid || void 0,
    onFocus: t[0] || (t[0] = function() {
      return o.onFocus && o.onFocus.apply(o, arguments);
    }),
    onBlur: t[1] || (t[1] = function() {
      return o.onBlur && o.onBlur.apply(o, arguments);
    }),
    onKeydown: t[2] || (t[2] = function() {
      return o.onKeyDown && o.onKeyDown.apply(o, arguments);
    }),
    onInput: t[3] || (t[3] = function() {
      return o.onEditableInput && o.onEditableInput.apply(o, arguments);
    }),
    "data-p": o.labelDataP
  }, e.ptm("label")), null, 16, xc)) : (h(), b("span", v({
    key: 1,
    ref: "focusInput",
    name: e.name,
    id: e.labelId || e.inputId,
    class: [e.cx("label"), e.inputClass, e.labelClass],
    style: [e.inputStyle, e.labelStyle],
    tabindex: e.disabled ? -1 : e.tabindex,
    role: "combobox",
    "aria-label": e.ariaLabel || (o.label === "p-emptylabel" ? void 0 : o.label),
    "aria-labelledby": e.ariaLabelledby,
    "aria-haspopup": "listbox",
    "aria-expanded": i.overlayVisible,
    "aria-controls": e.$id + "_list",
    "aria-activedescendant": i.focused ? o.focusedOptionId : void 0,
    "aria-invalid": e.invalid || void 0,
    "aria-disabled": e.disabled,
    onFocus: t[4] || (t[4] = function() {
      return o.onFocus && o.onFocus.apply(o, arguments);
    }),
    onBlur: t[5] || (t[5] = function() {
      return o.onBlur && o.onBlur.apply(o, arguments);
    }),
    onKeydown: t[6] || (t[6] = function() {
      return o.onKeyDown && o.onKeyDown.apply(o, arguments);
    }),
    "data-p": o.labelDataP
  }, e.ptm("label")), [L(e.$slots, "value", {
    value: e.d_value,
    placeholder: e.placeholder
  }, function() {
    var y;
    return [Ce(N(o.label === "p-emptylabel" ? " " : (y = o.label) !== null && y !== void 0 ? y : "empty"), 1)];
  })], 16, wc)), o.isClearIconVisible ? L(e.$slots, "clearicon", {
    key: 2,
    class: ne(e.cx("clearIcon")),
    clearCallback: o.onClearClick
  }, function() {
    return [(h(), K(me(e.clearIcon ? "i" : "TimesIcon"), v({
      ref: "clearIcon",
      class: [e.cx("clearIcon"), e.clearIcon],
      onClick: o.onClearClick
    }, e.ptm("clearIcon"), {
      "data-pc-section": "clearicon"
    }), null, 16, ["class", "onClick"]))];
  }) : A("", !0), C("div", v({
    class: e.cx("dropdown")
  }, e.ptm("dropdown")), [e.loading ? L(e.$slots, "loadingicon", {
    key: 0,
    class: ne(e.cx("loadingIcon"))
  }, function() {
    return [e.loadingIcon ? (h(), b("span", v({
      key: 0,
      class: [e.cx("loadingIcon"), "pi-spin", e.loadingIcon],
      "aria-hidden": "true"
    }, e.ptm("loadingIcon")), null, 16)) : (h(), K(a, v({
      key: 1,
      class: e.cx("loadingIcon"),
      spin: "",
      "aria-hidden": "true"
    }, e.ptm("loadingIcon")), null, 16, ["class"]))];
  }) : L(e.$slots, "dropdownicon", {
    key: 1,
    class: ne(e.cx("dropdownIcon"))
  }, function() {
    return [(h(), K(me(e.dropdownIcon ? "span" : "ChevronDownIcon"), v({
      class: [e.cx("dropdownIcon"), e.dropdownIcon],
      "aria-hidden": "true",
      "data-p": o.dropdownIconDataP
    }, e.ptm("dropdownIcon")), null, 16, ["class", "data-p"]))];
  })], 16), Q(m, {
    appendTo: e.appendTo
  }, {
    default: ue(function() {
      return [Q(_r, v({
        name: "p-anchored-overlay",
        onEnter: o.onOverlayEnter,
        onAfterEnter: o.onOverlayAfterEnter,
        onLeave: o.onOverlayLeave,
        onAfterLeave: o.onOverlayAfterLeave
      }, e.ptm("transition")), {
        default: ue(function() {
          return [i.overlayVisible ? (h(), b("div", v({
            key: 0,
            ref: o.overlayRef,
            class: [e.cx("overlay"), e.panelClass, e.overlayClass],
            style: [e.panelStyle, e.overlayStyle],
            onClick: t[10] || (t[10] = function() {
              return o.onOverlayClick && o.onOverlayClick.apply(o, arguments);
            }),
            onKeydown: t[11] || (t[11] = function() {
              return o.onOverlayKeyDown && o.onOverlayKeyDown.apply(o, arguments);
            }),
            "data-p": o.overlayDataP
          }, e.ptm("overlay")), [C("span", v({
            ref: "firstHiddenFocusableElementOnOverlay",
            role: "presentation",
            "aria-hidden": "true",
            class: "p-hidden-accessible p-hidden-focusable",
            tabindex: 0,
            onFocus: t[7] || (t[7] = function() {
              return o.onFirstHiddenFocus && o.onFirstHiddenFocus.apply(o, arguments);
            })
          }, e.ptm("hiddenFirstFocusableEl"), {
            "data-p-hidden-accessible": !0,
            "data-p-hidden-focusable": !0
          }), null, 16), L(e.$slots, "header", {
            value: e.d_value,
            options: o.visibleOptions
          }), e.filter ? (h(), b("div", v({
            key: 0,
            class: e.cx("header")
          }, e.ptm("header")), [Q(d, {
            unstyled: e.unstyled,
            pt: e.ptm("pcFilterContainer")
          }, {
            default: ue(function() {
              return [Q(s, {
                ref: "filterInput",
                type: "text",
                value: i.filterValue,
                onVnodeMounted: o.onFilterUpdated,
                onVnodeUpdated: o.onFilterUpdated,
                class: ne(e.cx("pcFilter")),
                placeholder: e.filterPlaceholder,
                variant: e.variant,
                unstyled: e.unstyled,
                role: "searchbox",
                autocomplete: "off",
                "aria-owns": e.$id + "_list",
                "aria-activedescendant": o.focusedOptionId,
                onKeydown: o.onFilterKeyDown,
                onBlur: o.onFilterBlur,
                onInput: o.onFilterChange,
                pt: e.ptm("pcFilter"),
                formControl: {
                  novalidate: !0
                }
              }, null, 8, ["value", "onVnodeMounted", "onVnodeUpdated", "class", "placeholder", "variant", "unstyled", "aria-owns", "aria-activedescendant", "onKeydown", "onBlur", "onInput", "pt"]), Q(u, {
                unstyled: e.unstyled,
                pt: e.ptm("pcFilterIconContainer")
              }, {
                default: ue(function() {
                  return [L(e.$slots, "filtericon", {}, function() {
                    return [e.filterIcon ? (h(), b("span", v({
                      key: 0,
                      class: e.filterIcon
                    }, e.ptm("filterIcon")), null, 16)) : (h(), K(l, Xo(v({
                      key: 1
                    }, e.ptm("filterIcon"))), null, 16))];
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
          }, e.ptm("hiddenFilterResult"), {
            "data-p-hidden-accessible": !0
          }), N(o.filterResultMessageText), 17)], 16)) : A("", !0), C("div", v({
            class: e.cx("listContainer"),
            style: {
              "max-height": o.virtualScrollerDisabled ? e.scrollHeight : ""
            }
          }, e.ptm("listContainer")), [Q(f, v({
            ref: o.virtualScrollerRef
          }, e.virtualScrollerOptions, {
            items: o.visibleOptions,
            style: {
              height: e.scrollHeight
            },
            tabindex: -1,
            disabled: o.virtualScrollerDisabled,
            pt: e.ptm("virtualScroller")
          }), ei({
            content: ue(function(y) {
              var w = y.styleClass, O = y.contentRef, _ = y.items, g = y.getItemOptions, T = y.contentStyle, V = y.itemSize;
              return [C("ul", v({
                ref: function(j) {
                  return o.listRef(j, O);
                },
                id: e.$id + "_list",
                class: [e.cx("list"), w],
                style: T,
                role: "listbox"
              }, e.ptm("list")), [(h(!0), b(oe, null, ye(_, function(z, j) {
                return h(), b(oe, {
                  key: o.getOptionRenderKey(z, o.getOptionIndex(j, g))
                }, [o.isOptionGroup(z) ? (h(), b("li", v({
                  key: 0,
                  id: e.$id + "_" + o.getOptionIndex(j, g),
                  style: {
                    height: V ? V + "px" : void 0
                  },
                  class: e.cx("optionGroup"),
                  role: "option"
                }, {
                  ref_for: !0
                }, e.ptm("optionGroup")), [L(e.$slots, "optiongroup", {
                  option: z.optionGroup,
                  index: o.getOptionIndex(j, g)
                }, function() {
                  return [C("span", v({
                    class: e.cx("optionGroupLabel")
                  }, {
                    ref_for: !0
                  }, e.ptm("optionGroupLabel")), N(o.getOptionGroupLabel(z.optionGroup)), 17)];
                })], 16, $c)) : He((h(), b("li", v({
                  key: 1,
                  id: e.$id + "_" + o.getOptionIndex(j, g),
                  class: e.cx("option", {
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
                  onClick: t[8] || (t[8] = ti(function() {
                  }, ["stop"])),
                  "data-p-selected": !e.checkmark && o.isSelected(z),
                  "data-p-focused": i.focusedOptionIndex === o.getOptionIndex(j, g),
                  "data-p-disabled": o.isOptionDisabled(z)
                }, {
                  ref_for: !0
                }, o.getPTItemOptions(z, g, j, "option")), [e.checkmark ? (h(), b(oe, {
                  key: 0
                }, [o.isSelected(z) ? (h(), K(c, v({
                  key: 0,
                  class: e.cx("optionCheckIcon")
                }, {
                  ref_for: !0
                }, e.ptm("optionCheckIcon")), null, 16, ["class"])) : (h(), K(p, v({
                  key: 1,
                  class: e.cx("optionBlankIcon")
                }, {
                  ref_for: !0
                }, e.ptm("optionBlankIcon")), null, 16, ["class"]))], 64)) : A("", !0), L(e.$slots, "option", {
                  option: z,
                  selected: o.isSelected(z),
                  index: o.getOptionIndex(j, g)
                }, function() {
                  return [C("span", v({
                    class: e.cx("optionLabel")
                  }, {
                    ref_for: !0
                  }, e.ptm("optionLabel")), N(o.getOptionLabel(z)), 17)];
                })], 16, Cc)), [[x]])], 64);
              }), 128)), i.filterValue && (!_ || _ && _.length === 0) ? (h(), b("li", v({
                key: 0,
                class: e.cx("emptyMessage"),
                role: "option"
              }, e.ptm("emptyMessage"), {
                "data-p-hidden-accessible": !0
              }), [L(e.$slots, "emptyfilter", {}, function() {
                return [Ce(N(o.emptyFilterMessageText), 1)];
              })], 16)) : !e.options || e.options && e.options.length === 0 ? (h(), b("li", v({
                key: 1,
                class: e.cx("emptyMessage"),
                role: "option"
              }, e.ptm("emptyMessage"), {
                "data-p-hidden-accessible": !0
              }), [L(e.$slots, "empty", {}, function() {
                return [Ce(N(o.emptyMessageText), 1)];
              })], 16)) : A("", !0)], 16, Sc)];
            }),
            _: 2
          }, [e.$slots.loader ? {
            name: "loader",
            fn: ue(function(y) {
              var w = y.options;
              return [L(e.$slots, "loader", {
                options: w
              })];
            }),
            key: "0"
          } : void 0]), 1040, ["items", "style", "disabled", "pt"])], 16), L(e.$slots, "footer", {
            value: e.d_value,
            options: o.visibleOptions
          }), !e.options || e.options && e.options.length === 0 ? (h(), b("span", v({
            key: 1,
            role: "status",
            "aria-live": "polite",
            class: "p-hidden-accessible"
          }, e.ptm("hiddenEmptyMessage"), {
            "data-p-hidden-accessible": !0
          }), N(o.emptyMessageText), 17)) : A("", !0), C("span", v({
            role: "status",
            "aria-live": "polite",
            class: "p-hidden-accessible"
          }, e.ptm("hiddenSelectedMessage"), {
            "data-p-hidden-accessible": !0
          }), N(o.selectedMessageText), 17), C("span", v({
            ref: "lastHiddenFocusableElementOnOverlay",
            role: "presentation",
            "aria-hidden": "true",
            class: "p-hidden-accessible p-hidden-focusable",
            tabindex: 0,
            onFocus: t[9] || (t[9] = function() {
              return o.onLastHiddenFocus && o.onLastHiddenFocus.apply(o, arguments);
            })
          }, e.ptm("hiddenLastFocusableEl"), {
            "data-p-hidden-accessible": !0,
            "data-p-hidden-focusable": !0
          }), null, 16)], 16, kc)) : A("", !0)];
        }),
        _: 3
      }, 16, ["onEnter", "onAfterEnter", "onLeave", "onAfterLeave"])];
    }),
    _: 3
  }, 8, ["appendTo"])], 16, yc);
}
ko.render = Oc;
function Ic(e) {
  if (!e) return null;
  let t;
  if (typeof e == "number")
    t = e;
  else {
    const n = e.trim();
    if (/^\d+$/.test(n))
      t = Number(n);
    else {
      const r = Date.parse(n);
      return Number.isNaN(r) ? null : r;
    }
  }
  return Number.isFinite(t) ? t < 1e12 ? t * 1e3 : t : null;
}
function So(e, t) {
  const n = Ic(e);
  if (n === null) return "";
  const r = t?.now ?? Date.now(), i = t?.suffix ?? !0, o = t?.maxUnit ?? "day", a = t?.future ?? !1, s = 6e4, l = 60 * s, u = 24 * l, d = 30 * u, c = 365 * u, p = r - n;
  if (a && p < 0) {
    const x = -p;
    return x < s ? "in <1m" : x < l ? `in ${Math.floor(x / s)}m` : x < u ? `in ${Math.floor(x / l)}h` : `in ${Math.floor(x / u)}d`;
  }
  const f = Math.max(0, p);
  if (f < s) return "just now";
  const m = i ? " ago" : "";
  return f < l ? `${Math.floor(f / s)}m${m}` : f < u ? `${Math.floor(f / l)}h${m}` : o === "year" ? f < d ? `${Math.floor(f / u)}d${m}` : f < c ? `${Math.floor(f / d)}mo${m}` : `${Math.floor(f / c)}y${m}` : `${Math.floor(f / u)}d${m}`;
}
function Tc(e) {
  const t = e || "";
  return t.startsWith("image/") ? "tabler:photo" : t === "application/pdf" ? "tabler:file-type-pdf" : t.includes("word") || t.includes("opendocument.text") || t === "application/rtf" ? "tabler:file-type-doc" : t.includes("sheet") || t.includes("excel") || t.includes("spreadsheet") || t === "text/csv" ? "tabler:file-type-xls" : t.includes("presentation") || t.includes("powerpoint") ? "tabler:file-type-ppt" : t === "application/epub+zip" ? "tabler:book" : t.startsWith("text/") || t === "application/json" || t === "application/xml" ? "tabler:file-text" : "tabler:file";
}
function _c(e) {
  if (!e) return "0 B";
  const t = ["B", "KB", "MB", "GB"], n = Math.min(Math.floor(Math.log(e) / Math.log(1024)), t.length - 1);
  return `${(e / Math.pow(1024, n)).toFixed(n ? 1 : 0)} ${t[n]}`;
}
const Pc = {
  class: "kx-files",
  "aria-label": "Attached files"
}, Lc = { class: "kx-file-list" }, Ac = {
  key: 0,
  class: "kx-file-row kx-file-locked",
  "data-testid": "inbox-file-locked"
}, zc = { class: "kx-file-row" }, Ec = { class: "kx-file-label" }, Bc = { class: "kx-file-name" }, jc = {
  key: 0,
  class: "kx-file-size"
}, Vc = ["href"], Dc = { class: "kx-sr-only" }, Mc = {
  key: 0,
  class: "kx-file-preview"
}, Nc = {
  key: 0,
  role: "status"
}, Fc = {
  key: 1,
  role: "alert"
}, Rc = ["content-type", "filename", "source-url"], Kc = /* @__PURE__ */ $n({
  __name: "ItemFiles",
  props: {
    itemId: {},
    files: {}
  },
  setup(e) {
    const t = e, n = Z(null), r = Z(!1), i = Z("");
    function o(s) {
      if (s)
        return /^(https?:\/\/|\/(?!\/))/i.test(s) ? s : void 0;
    }
    async function a(s) {
      if (n.value === s) {
        n.value = null;
        return;
      }
      n.value = s, r.value = !0, i.value = "";
      try {
        await qt("wc-resource-view", { timeoutMs: 8e3 });
      } catch (l) {
        i.value = l instanceof Error ? l.message : String(l);
      } finally {
        r.value = !1;
      }
    }
    return (s, l) => (h(), b("section", Pc, [
      l[2] || (l[2] = C("h3", null, "Files", -1)),
      C("ul", Lc, [
        (h(!0), b(oe, null, ye(e.files, (u, d) => (h(), b("li", { key: d }, [
          u.locked ? (h(), b("div", Ac, [
            Q(W(We), {
              icon: "tabler:lock",
              "aria-hidden": "true"
            }),
            l[0] || (l[0] = C("span", null, "Locked file", -1))
          ])) : (h(), b(oe, { key: 1 }, [
            C("div", zc, [
              Q(W(We), {
                icon: W(Tc)(u.content_type || ""),
                "aria-hidden": "true"
              }, null, 8, ["icon"]),
              C("div", Ec, [
                C("span", Bc, N(u.filename || "File"), 1),
                u.size !== void 0 ? (h(), b("span", jc, N(W(_c)(u.size)), 1)) : A("", !0)
              ]),
              Q(W(mt), {
                type: "button",
                size: "small",
                text: "",
                severity: "secondary",
                "data-testid": "inbox-file-preview",
                label: n.value === d ? "Close preview" : "Preview",
                "aria-expanded": n.value === d,
                onClick: (c) => a(d)
              }, null, 8, ["label", "aria-expanded", "onClick"]),
              o(u.view_url) ? (h(), b("a", {
                key: 0,
                href: o(u.view_url),
                target: "_blank",
                rel: "noopener noreferrer",
                "data-testid": "inbox-file-open"
              }, [
                l[1] || (l[1] = Ce("Open", -1)),
                C("span", Dc, N(u.filename || "file"), 1)
              ], 8, Vc)) : A("", !0)
            ]),
            n.value === d ? (h(), b("div", Mc, [
              r.value ? (h(), b("p", Nc, "Loading preview…")) : i.value ? (h(), b("p", Fc, N(i.value), 1)) : (h(), b("wc-resource-view", {
                key: 2,
                "content-type": u.content_type || "",
                filename: u.filename || "",
                "source-url": `/api/v1/inbox/${encodeURIComponent(t.itemId)}/files/${d + 1}`
              }, null, 8, Rc))
            ])) : A("", !0)
          ], 64))
        ]))), 128))
      ])
    ]));
  }
}), Sr = {
  item_count: "integer",
  pending_count: "integer",
  resolved_count: "integer",
  urgent_count: "integer",
  high_count: "integer"
}, Uc = {
  pending: "Pending",
  resolved: "Resolved",
  approved: "Approved",
  rejected: "Rejected",
  dismissed: "Dismissed"
};
function wn(e) {
  const t = e || "";
  return Uc[t] || t;
}
function Hc(e) {
  const t = (e || "").trim();
  return t ? t.replace(/[._-]+/g, " ").replace(/\b\w/g, (n) => n.toUpperCase()) : "";
}
const Wc = 80;
function zn(e) {
  const t = e.replace(/[_-]+/g, " ").trim();
  return t ? t.split(" ").map((n) => n && n[0].toUpperCase() + n.slice(1)).join(" ") : e;
}
function $r(e) {
  return e == null ? "" : typeof e == "string" ? e : typeof e == "number" || typeof e == "boolean" ? String(e) : JSON.stringify(e, null, 2);
}
function Cr(e) {
  if (e == null || e === "") return { kind: "empty" };
  if (typeof e == "string") return { kind: "text", text: e };
  if (typeof e == "object" && !Array.isArray(e)) {
    const t = Object.entries(e).map(([n, r]) => {
      const i = $r(r);
      return { key: n, label: zn(n), value: i, long: i.length > Wc || i.includes(`
`) };
    });
    return t.length ? { kind: "rows", rows: t } : { kind: "empty" };
  }
  return { kind: "text", text: $r(e) };
}
function $o(e) {
  return typeof e == "string" || typeof e == "number" || typeof e == "boolean";
}
function Gc(e, t, n) {
  const r = t.default;
  return e === "checkbox" ? typeof r == "boolean" ? r : void 0 : e === "number" ? typeof r != "number" || !Number.isFinite(r) || t.type === "integer" && !Number.isInteger(r) ? void 0 : r : e === "select" ? $o(r) && n.includes(r) ? r : void 0 : typeof r == "string" ? r : void 0;
}
function qc(e) {
  return Array.isArray(e.enum) ? "select" : e.type === "number" || e.type === "integer" ? "number" : e.type === "boolean" ? "checkbox" : e.type === "string" ? e.format === "textarea" ? "textarea" : "text" : null;
}
function Yc(e) {
  if (e && typeof e == "object" && !Array.isArray(e)) {
    const t = e, n = t.properties;
    if (!n || typeof n != "object" || Array.isArray(n)) return [];
    const r = new Set(Array.isArray(t.required) ? t.required.filter((i) => typeof i == "string") : []);
    return Object.entries(n).flatMap(([i, o]) => {
      if (!o || typeof o != "object" || Array.isArray(o)) return [];
      const a = o, s = qc(a);
      if (!s) return [];
      const l = s === "select" && Array.isArray(a.enum) ? a.enum.filter($o) : [], u = Gc(s, a, l);
      return [{
        key: i,
        label: typeof a.title == "string" && a.title ? a.title : zn(i),
        type: s,
        required: r.has(i),
        options: l,
        ...u === void 0 ? {} : { default: u }
      }];
    });
  }
  return [];
}
function Zc(e) {
  const t = {};
  for (const n of e) t[n.key] = n.default ?? (n.type === "checkbox" ? !1 : "");
  return t;
}
function Jc(e, t) {
  return e.some((n) => {
    if (!n.required) return !1;
    const r = t[n.key];
    return n.type === "checkbox" ? r !== !0 : r == null || String(r).trim() === "";
  });
}
const Qc = { class: "kx-detail" }, Xc = { class: "kx-detail-head" }, ep = { class: "kx-detail-title-block" }, tp = { class: "kx-detail-title" }, np = { class: "kx-detail-meta" }, rp = ["title"], op = { class: "kx-detail-body" }, ip = {
  key: 1,
  class: "kx-native-body"
}, ap = ["source"], sp = ["source"], lp = {
  key: 2,
  class: "kx-fields"
}, up = ["source"], dp = { key: 4 }, cp = {
  key: 0,
  "data-testid": "decision-outcome"
}, pp = {
  key: 1,
  "data-testid": "decision-submitted-form",
  class: "kx-fields"
}, fp = {
  key: 5,
  class: "kx-decision-form"
}, hp = {
  key: 0,
  class: "kx-checkbox-row"
}, mp = ["for"], bp = {
  key: 0,
  class: "kx-required"
}, gp = ["for"], vp = {
  key: 0,
  class: "kx-required"
}, yp = {
  key: 0,
  class: "kx-form-hint"
}, xp = {
  key: 2,
  class: "kx-native-body"
}, wp = ["source"], kp = {
  key: 1,
  class: "kx-fields"
}, Sp = { class: "kx-detail-foot" }, $p = { class: "kx-resolved" }, Cp = { key: 0 }, Op = /* @__PURE__ */ $n({
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
  setup(e, { emit: t }) {
    const n = e, r = t, i = Z(null), o = Z(!1);
    let a = null;
    const s = he(() => n.item.status === "pending"), l = { approve: "Approve", reject: "Reject", dismiss: "Dismiss" }, u = he(() => (Array.isArray(n.actions) ? n.actions : []).filter((E) => typeof E == "string" && E.length > 0));
    function d(S) {
      const E = n.item.metadata;
      return S === "approve" && typeof E?.approve_label == "string" && E.approve_label ? E.approve_label : S === "reject" && typeof E?.reject_label == "string" && E.reject_label ? E.reject_label : l[S] || zn(S);
    }
    const c = he(() => {
      const S = n.item.metadata?.fields;
      return Array.isArray(S) ? S.map((E) => ({ label: String(E.label ?? E.key ?? ""), value: E.value })) : [];
    }), p = he(() => n.item.item_type === "flow_decision"), f = he(() => {
      const S = n.item.metadata?.prompt;
      return typeof S == "string" && S !== n.item.title ? S : "";
    }), m = he(() => p.value ? Cr(n.item.metadata?.context) : { kind: "empty" }), x = he(() => p.value ? Yc(n.item.metadata?.form) : []), y = he(() => {
      const S = Cr(n.item.form);
      return S.kind !== "rows" ? [] : S.rows.map((E) => ({ ...E, label: x.value.find(($) => $.key === E.key)?.label || E.label }));
    }), w = Z(Zc(x.value)), O = he(() => !Jc(x.value, w.value));
    function _(S) {
      return s.value && (S !== "approve" || O.value);
    }
    function g(S) {
      return typeof S == "string" ? S : void 0;
    }
    function T(S) {
      return typeof S == "number" ? S : void 0;
    }
    function V(S) {
      if (n.resolving || !_(S)) return;
      const E = { id: n.item.id, action: S };
      x.value.length && (E.form = { ...w.value }), r("resolve", E);
    }
    const z = he(() => n.typeLabel || Hc(n.item.item_type));
    function j(S) {
      return S ? new Date(S * 1e3).toLocaleString() : "";
    }
    function q(S) {
      return So(S, { maxUnit: "year" });
    }
    function X(S) {
      return `kx-priority-${S === "urgent" || S === "high" || S === "low" ? S : "normal"}`;
    }
    function U(S) {
      return S === "urgent" ? "danger" : S === "high" ? "warn" : S === "low" ? "secondary" : "info";
    }
    function Y(S) {
      const E = S.detail;
      E?.id && E?.action && r("resolve", E);
    }
    function J() {
      a && (a.removeEventListener("inbox-resolve", Y), a = null);
    }
    async function te() {
      if (!(!n.tag || !i.value)) {
        J();
        try {
          await qt(n.tag, { timeoutMs: 8e3 });
          const S = document.createElement(n.tag);
          S.style.display = "block", S.style.height = "100%", S.setAttribute("item-id", n.item.id), S.setAttribute("content", n.item.content || ""), n.item.metadata && S.setAttribute("data-meta", JSON.stringify(n.item.metadata)), S.addEventListener("inbox-resolve", Y), i.value.innerHTML = "", i.value.appendChild(S), a = S;
        } catch {
          o.value = !0;
        }
      }
    }
    return kn(() => {
      qt("wc-render-markdown", { timeoutMs: 8e3 }).catch(() => {
      }), te();
    }), Sn(J), ze(() => [n.tag, n.item.id], () => {
      o.value = !1, te();
    }), (S, E) => (h(), b("div", Qc, [
      C("header", Xc, [
        C("div", {
          class: ne(["kx-detail-icon", X(e.item.priority)])
        }, [
          Q(W(We), {
            icon: e.icon || "tabler:inbox",
            "aria-hidden": "true"
          }, null, 8, ["icon"])
        ], 2),
        C("div", ep, [
          C("h2", tp, N(e.item.title), 1),
          C("div", np, [
            Q(W(Mt), {
              severity: U(e.item.priority),
              value: e.item.priority,
              class: "kx-pill kx-tag-sm"
            }, null, 8, ["severity", "value"]),
            C("span", null, N(z.value), 1),
            C("span", {
              title: j(e.item.created_at)
            }, N(q(e.item.created_at)), 9, rp),
            s.value ? A("", !0) : (h(), K(W(Mt), {
              key: 0,
              severity: "secondary",
              value: W(wn)(e.item.status),
              class: "kx-pill kx-tag-sm"
            }, null, 8, ["value"]))
          ])
        ])
      ]),
      C("div", op, [
        e.tag && !o.value ? (h(), b("div", {
          key: 0,
          ref_key: "host",
          ref: i,
          class: "kx-wc-host"
        }, null, 512)) : p.value ? (h(), b("div", ip, [
          f.value ? (h(), b("wc-render-markdown", {
            key: 0,
            class: "kx-md",
            source: f.value
          }, null, 8, ap)) : A("", !0),
          m.value.kind === "text" ? (h(), b("wc-render-markdown", {
            key: 1,
            class: "kx-md",
            source: m.value.text
          }, null, 8, sp)) : m.value.kind === "rows" ? (h(), b("dl", lp, [
            (h(!0), b(oe, null, ye(m.value.rows, ($) => (h(), b("div", {
              key: $.key,
              class: "kx-field-row"
            }, [
              C("dt", null, N($.label), 1),
              C("dd", {
                class: ne({ "kx-field-long": $.long })
              }, N($.value), 3)
            ]))), 128))
          ])) : e.item.content ? (h(), b("wc-render-markdown", {
            key: 3,
            class: "kx-md",
            source: e.item.content
          }, null, 8, up)) : A("", !0),
          s.value ? x.value.length ? (h(), b("div", fp, [
            (h(!0), b(oe, null, ye(x.value, ($) => (h(), b("div", {
              key: $.key,
              class: "kx-form-field"
            }, [
              $.type === "checkbox" ? (h(), b("div", hp, [
                Q(W(uo), {
                  modelValue: w.value[$.key],
                  "onUpdate:modelValue": (k) => w.value[$.key] = k,
                  binary: "",
                  "input-id": `kx-df-${$.key}`,
                  "data-testid": `decision-${$.key}`
                }, null, 8, ["modelValue", "onUpdate:modelValue", "input-id", "data-testid"]),
                C("label", {
                  for: `kx-df-${$.key}`
                }, [
                  Ce(N($.label), 1),
                  $.required ? (h(), b("span", bp, "*")) : A("", !0)
                ], 8, mp)
              ])) : (h(), b(oe, { key: 1 }, [
                C("label", {
                  class: "kx-form-label",
                  for: `kx-df-${$.key}`
                }, [
                  Ce(N($.label), 1),
                  $.required ? (h(), b("span", vp, "*")) : A("", !0)
                ], 8, gp),
                $.type === "text" ? (h(), K(W(Kt), {
                  key: 0,
                  id: `kx-df-${$.key}`,
                  "model-value": g(w.value[$.key]),
                  "data-testid": `decision-${$.key}`,
                  "onUpdate:modelValue": (k) => w.value[$.key] = k
                }, null, 8, ["id", "model-value", "data-testid", "onUpdate:modelValue"])) : $.type === "textarea" ? (h(), K(W(ho), {
                  key: 1,
                  id: `kx-df-${$.key}`,
                  "model-value": g(w.value[$.key]),
                  "data-testid": `decision-${$.key}`,
                  rows: "8",
                  "auto-resize": "",
                  "onUpdate:modelValue": (k) => w.value[$.key] = k
                }, null, 8, ["id", "model-value", "data-testid", "onUpdate:modelValue"])) : $.type === "number" ? (h(), K(W(fo), {
                  key: 2,
                  "model-value": T(w.value[$.key]),
                  "input-id": `kx-df-${$.key}`,
                  "data-testid": `decision-${$.key}`,
                  "onUpdate:modelValue": (k) => w.value[$.key] = k
                }, null, 8, ["model-value", "input-id", "data-testid", "onUpdate:modelValue"])) : (h(), K(W(ko), {
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
            O.value ? A("", !0) : (h(), b("p", yp, "Fill in the required fields to approve."))
          ])) : A("", !0) : (h(), b("div", dp, [
            e.item.action ? (h(), b("p", cp, "Outcome: " + N(d(e.item.action)), 1)) : A("", !0),
            y.value.length ? (h(), b("dl", pp, [
              (h(!0), b(oe, null, ye(y.value, ($) => (h(), b("div", {
                key: $.key,
                class: "kx-field-row"
              }, [
                C("dt", null, N($.label), 1),
                C("dd", {
                  class: ne({ "kx-field-long": $.long })
                }, N($.value), 3)
              ]))), 128))
            ])) : A("", !0)
          ]))
        ])) : (h(), b("div", xp, [
          e.item.content ? (h(), b("wc-render-markdown", {
            key: 0,
            class: "kx-md",
            source: e.item.content
          }, null, 8, wp)) : A("", !0),
          c.value.length ? (h(), b("dl", kp, [
            (h(!0), b(oe, null, ye(c.value, ($, k) => (h(), b("div", {
              key: k,
              class: "kx-field-row"
            }, [
              C("dt", null, N($.label), 1),
              C("dd", null, N($.value), 1)
            ]))), 128))
          ])) : A("", !0)
        ])),
        e.item.files?.length ? (h(), K(Kc, {
          key: e.item.id,
          "item-id": e.item.id,
          files: e.item.files
        }, null, 8, ["item-id", "files"])) : A("", !0)
      ]),
      C("footer", Sp, [
        s.value && e.actionOwner !== "component" ? (h(!0), b(oe, { key: 0 }, ye(u.value, ($, k) => (h(), K(W(mt), {
          key: $,
          type: "button",
          class: "kx-detail-action",
          "data-testid": "inbox-action",
          severity: k === 0 ? void 0 : "secondary",
          outlined: k !== 0,
          label: e.resolving && e.resolvingAction === $ ? "Resolving…" : d($),
          loading: e.resolving && e.resolvingAction === $,
          disabled: e.resolving || !_($),
          onClick: (P) => V($)
        }, null, 8, ["severity", "outlined", "label", "loading", "disabled", "onClick"]))), 128)) : s.value ? A("", !0) : (h(), b(oe, { key: 1 }, [
          C("span", $p, [
            Ce(N(W(wn)(e.item.status)), 1),
            e.item.resolved_at ? (h(), b("span", Cp, " · " + N(j(e.item.resolved_at)), 1)) : A("", !0)
          ]),
          Q(W(mt), {
            class: "kx-detail-action",
            type: "button",
            "data-testid": "inbox-delete",
            label: "Delete",
            severity: "secondary",
            outlined: "",
            onClick: E[0] || (E[0] = ($) => r("delete", e.item.id))
          }, {
            icon: ue(({ class: $ }) => [
              Q(W(We), {
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
function Me(e) {
  return e !== null && typeof e == "object" && !Array.isArray(e);
}
function Or(e) {
  return Me(e) ? ["id", "item_type", "title", "priority", "status"].every((t) => typeof e[t] == "string") && ["content", "action"].every((t) => e[t] === void 0 || typeof e[t] == "string") && ["created_at", "resolved_at"].every((t) => e[t] === void 0 || typeof e[t] == "number") && (e.files === void 0 || Array.isArray(e.files) && e.files.every((t) => Me(t) && typeof t.locked == "boolean" && ["filename", "content_type", "view_url"].every((n) => t[n] === void 0 || typeof t[n] == "string") && (t.size === void 0 || typeof t.size == "number" && Number.isFinite(t.size) && t.size >= 0))) && ["metadata", "form"].every((t) => e[t] === void 0 || Me(e[t])) : !1;
}
function Je(e) {
  return !!e && typeof e == "object" && !Array.isArray(e);
}
function Ip(e, t) {
  if (t == null) return t;
  switch (e) {
    case "boolean":
    case "checkbox":
      return typeof t == "boolean" ? t : t === "true" ? !0 : t === "false" ? !1 : t;
    case "number":
    case "integer": {
      if (typeof t == "number") return t;
      if (typeof t == "string" && t.trim() !== "") {
        const n = Number(t);
        if (!Number.isNaN(n)) return n;
      }
      return t;
    }
    case "object":
    case "array":
      if (typeof t == "string")
        try {
          const n = JSON.parse(t);
          if (n && typeof n == "object") return n;
        } catch {
        }
      return t;
    default:
      return t;
  }
}
function Tp(e, t) {
  if (!t) return e;
  const n = {};
  for (const [r, i] of Object.entries(e))
    n[r] = Ip(t[r], i);
  return n;
}
function _p(e, t, n) {
  if (!t) return null;
  const r = Je(e) ? e : {}, i = [
    r,
    Je(r.data) ? r.data : null,
    Je(r.payload) ? r.payload : null,
    Je(r.detail) ? r.detail : null
  ].filter(Boolean);
  for (const o of i) {
    if (o.event !== "component.meta.changed") continue;
    const a = String(o.component_id || ""), s = String(r.topic || o.topic || "");
    if (!(a && a !== t) && !(!a && s !== `component.${t}`))
      return {
        event: "component.meta.changed",
        component_id: a || t,
        meta: Tp(Je(o.meta) ? o.meta : {}, n),
        deleted: Array.isArray(o.deleted) ? o.deleted.map(String) : []
      };
  }
  return null;
}
function Pp(e, t, n) {
  if (!e) return null;
  const r = ai(`component.${e}`, (i) => {
    const o = _p(i, e, n);
    o && t(o);
  });
  return typeof r == "function" ? r : null;
}
function Qe(e, t) {
  if (e && typeof e == "object") {
    const n = e, r = n.response?.data?.error;
    if (typeof r == "string") return r;
    if (r && typeof r == "object" && typeof r.message == "string")
      return r.message;
    if (typeof n.message == "string" && n.message) return n.message;
  }
  return t;
}
const Lp = { class: "kx-inbox" }, Ap = { class: "kx-head-bar" }, zp = { class: "kx-head-row" }, Ep = { class: "kx-head-icon" }, Bp = { class: "kx-head-text" }, jp = { class: "kx-sub" }, Vp = { class: "kx-head-actions" }, Dp = { class: "kx-shell" }, Mp = { class: "kx-list-pane" }, Np = {
  key: 0,
  class: "kx-loading"
}, Fp = {
  key: 1,
  class: "kx-list-empty"
}, Rp = ["onClick"], Kp = { class: "kx-item-main" }, Up = { class: "kx-item-line" }, Hp = ["title"], Wp = ["source"], Gp = { class: "kx-detail-pane" }, qp = {
  key: 0,
  class: "kx-detail-empty"
}, Yp = {
  key: 1,
  class: "kx-detail-card"
}, Zp = /* @__PURE__ */ $n({
  __name: "inbox",
  setup(e) {
    const t = [
      { key: "pending", label: "Pending", icon: "tabler:clock" },
      { key: "resolved", label: "Resolved", icon: "tabler:checks" },
      { key: "all", label: "All", icon: "tabler:inbox" }
    ], n = Z([]), r = Z({}), i = Z(0), o = Z({}), a = Z(!0), s = Z(""), l = Z("pending"), u = Z(""), d = Z(""), c = Z("");
    let p = null, f = "", m = 0, x = !1;
    const y = /* @__PURE__ */ new Map();
    let w = 0;
    const O = he(() => n.value.find((k) => k.id === u.value) || null), _ = (k) => o.value[k], g = (k, P) => Object.prototype.hasOwnProperty.call(k, P), T = he(() => l.value === "pending" ? Number(r.value.pending_count ?? i.value ?? n.value.length) : l.value === "resolved" ? Number(r.value.resolved_count ?? i.value ?? n.value.length) : l.value === "all" ? Number(r.value.item_count ?? i.value ?? n.value.length) : Number(i.value || n.value.length));
    function V(k) {
      return `kx-priority-${k === "urgent" || k === "high" || k === "low" ? k : "normal"}`;
    }
    function z(k) {
      const P = {};
      for (const I of Object.keys(Sr)) {
        const G = k[I];
        g(k, I) && typeof G == "number" && (P[I] = G);
      }
      Object.keys(P).length && (r.value = { ...r.value, ...P });
    }
    function j(k) {
      return So(k, { suffix: !1 });
    }
    function q(k) {
      return k ? new Date(k * 1e3).toLocaleString() : "";
    }
    async function X() {
      try {
        const { data: k } = await qe.get("/api/v1/inbox/item-types"), P = {};
        if (Me(k) && Array.isArray(k.item_types))
          for (const I of k.item_types)
            Me(I) && typeof I.value == "string" && typeof I.name == "string" && (I.icon === void 0 || typeof I.icon == "string") && (I.component_tag === void 0 || typeof I.component_tag == "string") && (I.actions === void 0 || Array.isArray(I.actions) && I.actions.every((G) => typeof G == "string")) && (I.action_owner === void 0 || I.action_owner === "component") && (P[I.value] = { value: I.value, name: I.name, icon: I.icon, component_tag: I.component_tag, actions: I.actions, action_owner: I.action_owner });
        o.value = P;
      } catch (k) {
        s.value = Qe(k, "Could not load inbox item types.");
      }
    }
    function U(k) {
      return l.value === "all" || (l.value === "resolved" ? k.status !== "pending" : k.status === l.value);
    }
    function Y(k, P, I, G = !0) {
      if (G)
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
    async function J() {
      if (x) return;
      const k = ++m;
      s.value = "";
      try {
        const { data: P } = await qe.get("/api/v1/inbox?status=" + encodeURIComponent(l.value));
        if (k !== m || x) return;
        if (!Me(P) || !Array.isArray(P.items) || !P.items.every(Or))
          throw new Error("Invalid inbox list response.");
        if (typeof P.component_id == "string" && $(P.component_id)) {
          await J();
          return;
        }
        Y(P.items, {
          item_count: Number(P.item_count ?? 0),
          pending_count: Number(P.pending_count ?? 0),
          resolved_count: Number(P.resolved_count ?? 0),
          urgent_count: Number(P.urgent_count ?? 0),
          high_count: Number(P.high_count ?? 0)
        }, Number(P.total_count ?? P.items.length));
      } catch (P) {
        k === m && !x && (s.value = Qe(P, "Could not load the inbox."));
      } finally {
        k === m && !x && (a.value = !1);
      }
    }
    ze(l, () => {
      u.value = "", J();
    });
    async function te(k) {
      s.value = "", d.value = k.id, c.value = k.action;
      const P = r.value.resolved_count || 0;
      try {
        const I = k.form ? { form: k.form } : void 0, { data: G } = await qe.post(`/api/v1/inbox/${encodeURIComponent(k.id)}/${encodeURIComponent(k.action)}`, I);
        if (x) return;
        if (!Me(G) || G.success !== !0 || !Or(G.item) || G.item.id !== k.id || G.item.status === "pending" || G.item.action !== k.action)
          throw new Error("Invalid inbox resolution response.");
        ++m, y.set(k.id, G.item), w = Math.max(w + 1, P + 1), Y(n.value, r.value, i.value, !1), await J();
      } catch (I) {
        s.value = Qe(I, "Could not resolve this item.");
      } finally {
        d.value = "", c.value = "";
      }
    }
    async function S(k) {
      s.value = "";
      try {
        await qe.delete(`/api/v1/inbox/${encodeURIComponent(k)}`), y.delete(k), y.size || (w = 0), u.value === k && (u.value = ""), await J();
      } catch (P) {
        s.value = Qe(P, "Could not delete this item.");
      }
    }
    async function E() {
      try {
        await qe.post("/api/v1/inbox", {
          item_type: "notice",
          title: "Test notice " + (/* @__PURE__ */ new Date()).toLocaleTimeString(),
          content: "Created to exercise the realtime round-trip.",
          priority: "high"
        });
      } catch (k) {
        s.value = Qe(k, "Could not create the test notice.");
      }
    }
    function $(k) {
      if (!k || f === k) return !1;
      if (p && p(), p = null, f = "", p = Pp(k, (P) => {
        z(P.meta), J();
      }, Sr), !p) throw new Error("Could not subscribe to the inbox.");
      return f = k, !0;
    }
    return xi(async () => {
      await Promise.all([X(), J()]);
    }), Sn(() => {
      x = !0, ++m, y.clear(), p && p(), p = null, f = "";
    }), (k, P) => (h(), b("div", Lp, [
      C("header", Ap, [
        C("div", zp, [
          C("div", Ep, [
            Q(W(We), {
              icon: "tabler:inbox",
              "aria-hidden": "true"
            })
          ]),
          C("div", Bp, [
            P[1] || (P[1] = C("h1", { class: "kx-title" }, "Inbox", -1)),
            C("p", jp, N(T.value) + " " + N(l.value) + " · live", 1)
          ]),
          C("div", Vp, [
            Q(W(mt), {
              type: "button",
              label: "New notice",
              severity: "secondary",
              outlined: "",
              onClick: E
            })
          ])
        ]),
        Q(W(ao), {
          value: l.value,
          "data-kx-separator": "surface",
          "onUpdate:value": P[0] || (P[0] = (I) => l.value = String(I))
        }, {
          default: ue(() => [
            Q(W(io), {
              "aria-label": "Inbox folders",
              pt: { tabList: { class: "kx-tabs-list" } }
            }, {
              default: ue(() => [
                (h(), b(oe, null, ye(t, (I) => Q(W(no), {
                  class: "kx-tab",
                  key: I.key,
                  value: I.key,
                  "data-testid": `inbox-tab-${I.key}`
                }, {
                  default: ue(() => [
                    Q(W(We), {
                      icon: I.icon,
                      "aria-hidden": "true"
                    }, null, 8, ["icon"]),
                    Ce(" " + N(I.label), 1)
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
      s.value ? (h(), K(W(so), {
        key: 0,
        severity: "error",
        class: "kx-alert"
      }, {
        default: ue(() => [
          Ce(N(s.value), 1)
        ]),
        _: 1
      })) : A("", !0),
      C("main", Dp, [
        C("aside", Mp, [
          a.value ? (h(), b("div", Np, "Loading...")) : n.value.length ? A("", !0) : (h(), b("div", Fp, N(l.value === "pending" ? "Inbox zero — nothing to review." : "Nothing here."), 1)),
          (h(!0), b(oe, null, ye(n.value, (I) => (h(), b("button", {
            key: I.id,
            class: ne(["kx-item", { active: u.value === I.id }]),
            onClick: (G) => u.value = I.id
          }, [
            C("span", {
              class: ne(["kx-priority-dot", V(I.priority)])
            }, null, 2),
            C("div", Kp, [
              C("div", Up, [
                C("span", {
                  class: ne(["kx-item-title", { pending: I.status === "pending" }])
                }, N(I.title), 3),
                C("span", {
                  class: "kx-time",
                  title: q(I.created_at)
                }, N(j(I.created_at)), 9, Hp)
              ]),
              I.content ? (h(), b("wc-render-markdown", {
                key: 0,
                class: "kx-preview",
                source: I.content,
                inert: ""
              }, null, 8, Wp)) : A("", !0),
              I.status !== "pending" ? (h(), K(W(Mt), {
                key: 1,
                severity: "secondary",
                value: W(wn)(I.status),
                class: "kx-status kx-tag-sm"
              }, null, 8, ["value"])) : A("", !0)
            ])
          ], 10, Rp))), 128))
        ]),
        C("section", Gp, [
          O.value ? (h(), b("div", Yp, [
            (h(), K(Op, {
              key: O.value.id,
              item: O.value,
              tag: _(O.value.item_type)?.component_tag,
              icon: _(O.value.item_type)?.icon,
              "type-label": _(O.value.item_type)?.name,
              actions: _(O.value.item_type)?.actions,
              "action-owner": _(O.value.item_type)?.action_owner,
              resolving: d.value === O.value.id,
              "resolving-action": c.value,
              onResolve: te,
              onDelete: S
            }, null, 8, ["item", "tag", "icon", "type-label", "actions", "action-owner", "resolving", "resolving-action"]))
          ])) : (h(), b("div", qp, " Select an item to view it. "))
        ])
      ])
    ]));
  }
}), Jp = ':root{--p-form-field-padding-x: .75rem;--p-form-field-padding-y: .5rem;--p-form-field-sm-padding-x: .625rem;--p-form-field-sm-padding-y: .375rem;--p-form-field-lg-padding-x: .875rem;--p-form-field-lg-padding-y: .625rem;--p-form-field-border-radius: .375rem;--p-form-field-transition-duration: .2s;--p-form-field-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), 0 1px 2px 0 rgba(18, 18, 23, .05);--p-focus-ring-width: 1px;--p-focus-ring-style: solid;--p-focus-ring-color: color-mix(in srgb, var(--p-primary-color) 100%, transparent);--p-focus-ring-offset: 2px;--p-toggleswitch-width: 2.5rem;--p-toggleswitch-height: 1.5rem;--p-toggleswitch-border-radius: 30px;--p-toggleswitch-gap: .25rem;--p-toggleswitch-border-width: 1px;--p-toggleswitch-transition-duration: .2s;--p-toggleswitch-slide-duration: .2s;--p-toggleswitch-handle-size: 1rem;--p-toggleswitch-handle-border-radius: 9999px}:root{color-scheme:light dark;--p-primary: rgb(0, 95, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-secondary: #6f7385;--p-secondary-50: color-mix(in srgb, var(--p-secondary) 5%, white);--p-secondary-100: color-mix(in srgb, var(--p-secondary) 10%, white);--p-secondary-200: color-mix(in srgb, var(--p-secondary) 20%, white);--p-secondary-300: color-mix(in srgb, var(--p-secondary) 35%, white);--p-secondary-400: color-mix(in srgb, var(--p-secondary) 65%, white);--p-secondary-500: var(--p-secondary);--p-secondary-600: color-mix(in srgb, var(--p-secondary) 80%, black);--p-secondary-700: color-mix(in srgb, var(--p-secondary) 65%, black);--p-secondary-800: color-mix(in srgb, var(--p-secondary) 55%, black);--p-secondary-900: color-mix(in srgb, var(--p-secondary) 50%, black);--p-secondary-950: color-mix(in srgb, var(--p-secondary) 30%, black);--p-danger: rgb(239, 68, 68);--p-danger-50: color-mix(in srgb, var(--p-danger) 5%, white);--p-danger-100: color-mix(in srgb, var(--p-danger) 10%, white);--p-danger-200: color-mix(in srgb, var(--p-danger) 20%, white);--p-danger-300: color-mix(in srgb, var(--p-danger) 30%, white);--p-danger-400: color-mix(in srgb, var(--p-danger) 40%, white);--p-danger-500: var(--p-danger);--p-danger-600: color-mix(in srgb, var(--p-danger) 80%, black);--p-danger-700: color-mix(in srgb, var(--p-danger) 70%, black);--p-danger-800: color-mix(in srgb, var(--p-danger) 60%, black);--p-danger-900: color-mix(in srgb, var(--p-danger) 50%, black);--p-danger-950: color-mix(in srgb, var(--p-danger) 40%, black);--p-success: rgb(34, 197, 94);--p-success-50: color-mix(in srgb, var(--p-success) 5%, white);--p-success-100: color-mix(in srgb, var(--p-success) 10%, white);--p-success-200: color-mix(in srgb, var(--p-success) 20%, white);--p-success-300: color-mix(in srgb, var(--p-success) 30%, white);--p-success-400: color-mix(in srgb, var(--p-success) 40%, white);--p-success-500: var(--p-success);--p-success-600: color-mix(in srgb, var(--p-success) 80%, black);--p-success-700: color-mix(in srgb, var(--p-success) 70%, black);--p-success-800: color-mix(in srgb, var(--p-success) 60%, black);--p-success-900: color-mix(in srgb, var(--p-success) 50%, black);--p-success-950: color-mix(in srgb, var(--p-success) 40%, black);--p-warn: rgb(249, 115, 22);--p-warn-50: color-mix(in srgb, var(--p-warn) 5%, white);--p-warn-100: color-mix(in srgb, var(--p-warn) 10%, white);--p-warn-200: color-mix(in srgb, var(--p-warn) 20%, white);--p-warn-300: color-mix(in srgb, var(--p-warn) 30%, white);--p-warn-400: color-mix(in srgb, var(--p-warn) 40%, white);--p-warn-500: var(--p-warn);--p-warn-600: color-mix(in srgb, var(--p-warn) 80%, black);--p-warn-700: color-mix(in srgb, var(--p-warn) 70%, black);--p-warn-800: color-mix(in srgb, var(--p-warn) 60%, black);--p-warn-900: color-mix(in srgb, var(--p-warn) 50%, black);--p-warn-950: color-mix(in srgb, var(--p-warn) 40%, black);--p-info: rgb(14, 165, 233);--p-info-50: color-mix(in srgb, var(--p-info) 5%, white);--p-info-100: color-mix(in srgb, var(--p-info) 10%, white);--p-info-200: color-mix(in srgb, var(--p-info) 20%, white);--p-info-300: color-mix(in srgb, var(--p-info) 30%, white);--p-info-400: color-mix(in srgb, var(--p-info) 40%, white);--p-info-500: var(--p-info);--p-info-600: color-mix(in srgb, var(--p-info) 80%, black);--p-info-700: color-mix(in srgb, var(--p-info) 70%, black);--p-info-800: color-mix(in srgb, var(--p-info) 60%, black);--p-info-900: color-mix(in srgb, var(--p-info) 50%, black);--p-info-950: color-mix(in srgb, var(--p-info) 40%, black);--p-help: rgb(168, 85, 247);--p-help-50: color-mix(in srgb, var(--p-help) 5%, white);--p-help-100: color-mix(in srgb, var(--p-help) 10%, white);--p-help-200: color-mix(in srgb, var(--p-help) 20%, white);--p-help-300: color-mix(in srgb, var(--p-help) 30%, white);--p-help-400: color-mix(in srgb, var(--p-help) 40%, white);--p-help-500: var(--p-help);--p-help-600: color-mix(in srgb, var(--p-help) 80%, black);--p-help-700: color-mix(in srgb, var(--p-help) 70%, black);--p-help-800: color-mix(in srgb, var(--p-help) 60%, black);--p-help-900: color-mix(in srgb, var(--p-help) 50%, black);--p-help-950: color-mix(in srgb, var(--p-help) 40%, black);--p-accent: rgb(20, 184, 166);--p-accent-50: color-mix(in srgb, var(--p-accent) 5%, white);--p-accent-100: color-mix(in srgb, var(--p-accent) 10%, white);--p-accent-200: color-mix(in srgb, var(--p-accent) 20%, white);--p-accent-300: color-mix(in srgb, var(--p-accent) 30%, white);--p-accent-400: color-mix(in srgb, var(--p-accent) 40%, white);--p-accent-500: var(--p-accent);--p-accent-600: color-mix(in srgb, var(--p-accent) 80%, black);--p-accent-700: color-mix(in srgb, var(--p-accent) 70%, black);--p-accent-800: color-mix(in srgb, var(--p-accent) 60%, black);--p-accent-900: color-mix(in srgb, var(--p-accent) 50%, black);--p-accent-950: color-mix(in srgb, var(--p-accent) 40%, black);--p-surface-0: #ffffff;--p-surface-50: #fafafa;--p-surface-100: #f5f5f5;--p-surface-200: #e5e5e5;--p-surface-300: #d4d4d4;--p-surface-400: #a3a3a3;--p-surface-500: #737373;--p-surface-600: #525252;--p-surface-700: #404040;--p-surface-800: #262626;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #171717;--p-surface-950: #0a0a0a;--p-content-border-radius: 6px;--p-font-heading-family: var(--v-font-family-head, Arial);--p-font-heading-scale: 1;--p-font-heading-line-height: 1.5;--p-font-heading-letter-spacing: normal;--p-font-heading-stretch: normal;--p-font-heading-variation-settings: normal;--p-font-body-scale: 1;--p-font-body-line-height: 1.5;--p-font-body-letter-spacing: normal;--p-font-body-stretch: normal;--p-font-body-variation-settings: normal;--p-font-mono-family: ui-monospace}:root{--p-primary-color: var(--p-primary-500);--p-primary-contrast-color: var(--p-surface-0);--p-primary-hover-color: var(--p-primary-600);--p-primary-active-color: var(--p-primary-700);--p-secondary-color: var(--p-secondary-500);--p-secondary-contrast-color: var(--p-surface-0);--p-secondary-hover-color: var(--p-secondary-600);--p-secondary-active-color: var(--p-secondary-700);--p-danger-color: var(--p-danger-500);--p-danger-contrast-color: var(--p-surface-0);--p-danger-hover-color: var(--p-danger-600);--p-danger-active-color: var(--p-danger-700);--p-success-color: var(--p-success-500);--p-success-contrast-color: var(--p-surface-0);--p-success-hover-color: var(--p-success-600);--p-success-active-color: var(--p-success-700);--p-warn-color: var(--p-warn-500);--p-warn-contrast-color: var(--p-surface-0);--p-warn-hover-color: var(--p-warn-600);--p-warn-active-color: var(--p-warn-700);--p-info-color: var(--p-info-500);--p-info-contrast-color: var(--p-surface-0);--p-info-hover-color: var(--p-info-600);--p-info-active-color: var(--p-info-700);--p-help-color: var(--p-help-500);--p-help-contrast-color: var(--p-surface-0);--p-help-hover-color: var(--p-help-600);--p-help-active-color: var(--p-help-700);--p-accent-color: var(--p-accent-500);--p-accent-contrast-color: var(--p-surface-0);--p-accent-hover-color: var(--p-accent-600);--p-accent-active-color: var(--p-accent-700);--p-content-border-color: var(--p-surface-200);--p-content-hover-background: var(--p-surface-100);--p-content-hover-color: var(--p-surface-800);--p-highlight-background: var(--p-primary-50);--p-highlight-color: var(--p-primary-700);--p-highlight-focus-background: var(--p-primary-100);--p-highlight-focus-color: var(--p-primary-800);--p-content-background: var(--p-surface-0);--p-text-color: var(--p-surface-700);--p-text-hover-color: var(--p-surface-800);--p-text-muted-color: var(--p-surface-500);--p-text-hover-muted-color: var(--p-surface-600)}@media(prefers-color-scheme:dark){:root:not(.w-theme-light){--p-surface-D: #fff;--p-surface-0: #fff;--p-surface-50: #fafafa;--p-surface-100: #f4f4f5;--p-surface-200: #e4e4e7;--p-surface-300: #d4d4d8;--p-surface-400: #a1a1aa;--p-surface-500: #71717a;--p-surface-600: #545250;--p-surface-700: #403e3c;--p-surface-800: #2b2927;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #1c1a19;--p-surface-950: #0f0e0d;--p-primary: rgb(0, 125, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-primary-color: var(--p-primary-400);--p-primary-contrast-color: var(--p-surface-900);--p-primary-hover-color: var(--p-primary-300);--p-primary-active-color: var(--p-primary-200);--p-secondary-color: var(--p-secondary-400);--p-secondary-contrast-color: var(--p-surface-900);--p-secondary-hover-color: var(--p-secondary-300);--p-secondary-active-color: var(--p-secondary-200);--p-danger-color: var(--p-danger-400);--p-danger-contrast-color: var(--p-surface-900);--p-danger-hover-color: var(--p-danger-300);--p-danger-active-color: var(--p-danger-200);--p-success-color: var(--p-success-400);--p-success-contrast-color: var(--p-surface-900);--p-success-hover-color: var(--p-success-300);--p-success-active-color: var(--p-success-200);--p-warn-color: var(--p-warn-400);--p-warn-contrast-color: var(--p-surface-900);--p-warn-hover-color: var(--p-warn-300);--p-warn-active-color: var(--p-warn-200);--p-info-color: var(--p-info-400);--p-info-contrast-color: var(--p-surface-900);--p-info-hover-color: var(--p-info-300);--p-info-active-color: var(--p-info-200);--p-help-color: var(--p-help-400);--p-help-contrast-color: var(--p-surface-900);--p-help-hover-color: var(--p-help-300);--p-help-active-color: var(--p-help-200);--p-accent-color: var(--p-accent-400);--p-accent-contrast-color: var(--p-surface-900);--p-accent-hover-color: var(--p-accent-300);--p-accent-active-color: var(--p-accent-200);--p-content-border-color: var(--p-surface-700);--p-content-hover-background: var(--p-surface-800);--p-content-hover-color: var(--p-surface-0);--p-highlight-background: color-mix(in srgb, var(--p-primary-400), transparent 84%);--p-highlight-color: rgba(255, 255, 255, 87%);--p-highlight-focus-background: color-mix(in srgb, var(--p-primary-400), transparent 76%);--p-highlight-focus-color: rgba(255, 255, 255, 87%);--p-content-background: var(--p-surface-900);--p-text-color: var(--p-surface-0);--p-text-hover-color: var(--p-surface-0);--p-text-muted-color: var(--p-surface-400);--p-text-hover-muted-color: var(--p-surface-300)}}:root.w-theme-dark,.w-theme-dark{color-scheme:dark;--p-surface-D: #fff;--p-surface-0: #fff;--p-surface-50: #fafafa;--p-surface-100: #f4f4f5;--p-surface-200: #e4e4e7;--p-surface-300: #d4d4d8;--p-surface-400: #a1a1aa;--p-surface-500: #71717a;--p-surface-600: #545250;--p-surface-700: #403e3c;--p-surface-800: #2b2927;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #1c1a19;--p-surface-950: #0f0e0d;--p-primary: rgb(0, 125, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-primary-color: var(--p-primary-400);--p-primary-contrast-color: var(--p-surface-900);--p-primary-hover-color: var(--p-primary-300);--p-primary-active-color: var(--p-primary-200);--p-secondary-color: var(--p-secondary-400);--p-secondary-contrast-color: var(--p-surface-900);--p-secondary-hover-color: var(--p-secondary-300);--p-secondary-active-color: var(--p-secondary-200);--p-danger-color: var(--p-danger-400);--p-danger-contrast-color: var(--p-surface-900);--p-danger-hover-color: var(--p-danger-300);--p-danger-active-color: var(--p-danger-200);--p-success-color: var(--p-success-400);--p-success-contrast-color: var(--p-surface-900);--p-success-hover-color: var(--p-success-300);--p-success-active-color: var(--p-success-200);--p-warn-color: var(--p-warn-400);--p-warn-contrast-color: var(--p-surface-900);--p-warn-hover-color: var(--p-warn-300);--p-warn-active-color: var(--p-warn-200);--p-info-color: var(--p-info-400);--p-info-contrast-color: var(--p-surface-900);--p-info-hover-color: var(--p-info-300);--p-info-active-color: var(--p-info-200);--p-help-color: var(--p-help-400);--p-help-contrast-color: var(--p-surface-900);--p-help-hover-color: var(--p-help-300);--p-help-active-color: var(--p-help-200);--p-accent-color: var(--p-accent-400);--p-accent-contrast-color: var(--p-surface-900);--p-accent-hover-color: var(--p-accent-300);--p-accent-active-color: var(--p-accent-200);--p-content-border-color: var(--p-surface-700);--p-content-hover-background: var(--p-surface-800);--p-content-hover-color: var(--p-surface-0);--p-highlight-background: color-mix(in srgb, var(--p-primary-400), transparent 84%);--p-highlight-color: rgba(255, 255, 255, 87%);--p-highlight-focus-background: color-mix(in srgb, var(--p-primary-400), transparent 76%);--p-highlight-focus-color: rgba(255, 255, 255, 87%);--p-content-background: var(--p-surface-900);--p-text-color: var(--p-surface-0);--p-text-hover-color: var(--p-surface-0);--p-text-muted-color: var(--p-surface-400);--p-text-hover-muted-color: var(--p-surface-300)}:root.w-theme-light,.w-theme-light{color-scheme:light;--p-surface-0: #ffffff;--p-surface-50: #fafafa;--p-surface-100: #f5f5f5;--p-surface-200: #e5e5e5;--p-surface-300: #d4d4d4;--p-surface-400: #a3a3a3;--p-surface-500: #737373;--p-surface-600: #525252;--p-surface-700: #404040;--p-surface-800: #262626;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #171717;--p-surface-950: #0a0a0a;--p-primary: rgb(0, 95, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-primary-color: var(--p-primary-500);--p-primary-contrast-color: var(--p-surface-0);--p-primary-hover-color: var(--p-primary-600);--p-primary-active-color: var(--p-primary-700);--p-secondary-color: var(--p-secondary-500);--p-secondary-contrast-color: var(--p-surface-0);--p-secondary-hover-color: var(--p-secondary-600);--p-secondary-active-color: var(--p-secondary-700);--p-danger-color: var(--p-danger-500);--p-danger-contrast-color: var(--p-surface-0);--p-danger-hover-color: var(--p-danger-600);--p-danger-active-color: var(--p-danger-700);--p-success-color: var(--p-success-500);--p-success-contrast-color: var(--p-surface-0);--p-success-hover-color: var(--p-success-600);--p-success-active-color: var(--p-success-700);--p-warn-color: var(--p-warn-500);--p-warn-contrast-color: var(--p-surface-0);--p-warn-hover-color: var(--p-warn-600);--p-warn-active-color: var(--p-warn-700);--p-info-color: var(--p-info-500);--p-info-contrast-color: var(--p-surface-0);--p-info-hover-color: var(--p-info-600);--p-info-active-color: var(--p-info-700);--p-help-color: var(--p-help-500);--p-help-contrast-color: var(--p-surface-0);--p-help-hover-color: var(--p-help-600);--p-help-active-color: var(--p-help-700);--p-accent-color: var(--p-accent-500);--p-accent-contrast-color: var(--p-surface-0);--p-accent-hover-color: var(--p-accent-600);--p-accent-active-color: var(--p-accent-700);--p-content-border-color: var(--p-surface-200);--p-content-hover-background: var(--p-surface-100);--p-content-hover-color: var(--p-surface-800);--p-highlight-background: var(--p-primary-50);--p-highlight-color: var(--p-primary-700);--p-highlight-focus-background: var(--p-primary-100);--p-highlight-focus-color: var(--p-primary-800);--p-content-background: var(--p-surface-0);--p-text-color: var(--p-surface-700);--p-text-hover-color: var(--p-surface-800);--p-text-muted-color: var(--p-surface-500);--p-text-hover-muted-color: var(--p-surface-600)}.spin{animation:kx-spin 1s linear infinite}@keyframes kx-spin{to{transform:rotate(360deg)}}@media(prefers-reduced-motion:reduce){.spin{animation:none}}.kx-head{display:flex;align-items:center;gap:12px;padding:20px 24px 14px;flex-wrap:wrap}.kx-head-icon{width:40px;height:40px;border-radius:11px;flex:none;display:flex;align-items:center;justify-content:center;background:color-mix(in srgb,var(--p-primary-color) 14%,transparent);color:var(--p-primary-color)}.kx-head-icon svg{width:22px;height:22px}.kx-head-text{min-width:0}.kx-title{font-size:17px;font-weight:700;color:var(--p-text-color);margin:0}.kx-head-sub{font-size:13px;color:var(--p-text-muted-color);margin:2px 0 0}.kx-head-actions{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-left:auto}.kx-empty{text-align:center;padding:44px 24px;display:flex;flex-direction:column;align-items:center;gap:8px}.kx-empty-ico{width:56px;height:56px;border-radius:14px;display:flex;align-items:center;justify-content:center;background:color-mix(in srgb,var(--p-primary-color) 12%,transparent);color:var(--p-primary-color);margin-bottom:4px}.kx-empty-ico svg{width:28px;height:28px}.kx-empty-title{font-size:15px;font-weight:700;color:var(--p-text-color);margin:0}.kx-empty-sub{font-size:13px;color:var(--p-text-muted-color);max-width:380px;margin:0}.kx-empty>.p-button{margin-top:6px}.kx-empty-actions{display:flex;gap:8px;margin-top:6px}.kx-loading{display:flex;align-items:center;gap:8px;color:var(--p-text-muted-color);font-size:13px;padding:24px}.kx-err{margin:0 20px 8px;padding:9px 12px;border-radius:10px;font-size:13px;background:color-mix(in srgb,var(--p-danger-500) 12%,transparent);color:var(--p-danger-600, var(--p-danger-500))}.kx-err.inline{margin:12px 0 0}.kx-empty.kx-empty-spacious{padding:60px 24px;gap:9px}.kx-empty-spacious .kx-empty-ico{width:58px;height:58px;margin-bottom:5px}.kx-empty-spacious .kx-empty-ico svg{width:27px;height:27px}.kx-empty-spacious .kx-empty-title{font-size:14.5px}.kx-empty-spacious .kx-empty-sub{font-size:12.5px;max-width:360px;line-height:1.55}.kx-empty-ico.primary{background:color-mix(in srgb,var(--p-primary-color) 14%,transparent);border:1px solid color-mix(in srgb,var(--p-primary-color) 28%,transparent)}.kx-empty-ico.muted{background:var(--kx-surface-2);color:color-mix(in srgb,var(--p-text-color) 45%,transparent);border:1px solid var(--p-content-border-color)}.kx-empty>.kx-empty-cta{margin-top:8px;padding-inline:16px}.kx-loading.kx-loading-centered{flex:1;display:grid;place-items:center;padding:64px 20px}.kx-loading-inner{display:flex;flex-direction:column;align-items:center;gap:12px;font-size:13px}.kx-loading-inner svg{width:24px;height:24px}.kx-tag-sm,.kx-tag-sm.kx-tag-sm{display:inline-flex;align-items:center;gap:4px;padding:1px 7px;border-radius:var(--kx-radius-tag, 6px);font-size:10.5px;font-weight:600;line-height:1.5;white-space:nowrap}.kx-tag-sm svg,.kx-tag-sm.kx-tag-sm svg{width:12px;height:12px}.kx-tag-caps,.kx-tag-caps.kx-tag-caps{display:inline-flex;align-items:center;gap:3px;padding:2px 6px;border-radius:var(--kx-radius-tag, 6px);font-size:9px;font-weight:700;line-height:1.5;letter-spacing:.04em;text-transform:uppercase;white-space:nowrap}.kx-tag-caps svg,.kx-tag-caps.kx-tag-caps svg{width:11px;height:11px}*,:before,:after{--tw-border-spacing-x: 0;--tw-border-spacing-y: 0;--tw-translate-x: 0;--tw-translate-y: 0;--tw-rotate: 0;--tw-skew-x: 0;--tw-skew-y: 0;--tw-scale-x: 1;--tw-scale-y: 1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness: proximity;--tw-gradient-from-position: ;--tw-gradient-via-position: ;--tw-gradient-to-position: ;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width: 0px;--tw-ring-offset-color: #fff;--tw-ring-color: rgb(59 130 246 / .5);--tw-ring-offset-shadow: 0 0 #0000;--tw-ring-shadow: 0 0 #0000;--tw-shadow: 0 0 #0000;--tw-shadow-colored: 0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: ;--tw-contain-size: ;--tw-contain-layout: ;--tw-contain-paint: ;--tw-contain-style: }::backdrop{--tw-border-spacing-x: 0;--tw-border-spacing-y: 0;--tw-translate-x: 0;--tw-translate-y: 0;--tw-rotate: 0;--tw-skew-x: 0;--tw-skew-y: 0;--tw-scale-x: 1;--tw-scale-y: 1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness: proximity;--tw-gradient-from-position: ;--tw-gradient-via-position: ;--tw-gradient-to-position: ;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width: 0px;--tw-ring-offset-color: #fff;--tw-ring-color: rgb(59 130 246 / .5);--tw-ring-offset-shadow: 0 0 #0000;--tw-ring-shadow: 0 0 #0000;--tw-shadow: 0 0 #0000;--tw-shadow-colored: 0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: ;--tw-contain-size: ;--tw-contain-layout: ;--tw-contain-paint: ;--tw-contain-style: }*,:before,:after{box-sizing:border-box;border-width:0;border-style:solid;border-color:#e5e7eb}:before,:after{--tw-content: ""}html,:host{line-height:1.5;-webkit-text-size-adjust:100%;-moz-tab-size:4;tab-size:4;font-family:ui-sans-serif,system-ui,sans-serif,"Apple Color Emoji","Segoe UI Emoji",Segoe UI Symbol,"Noto Color Emoji";font-feature-settings:normal;font-variation-settings:normal;-webkit-tap-highlight-color:transparent}body{margin:0;line-height:inherit}hr{height:0;color:inherit;border-top-width:1px}abbr:where([title]){text-decoration:underline dotted}h1,h2,h3,h4,h5,h6{font-size:inherit;font-weight:inherit}a{color:inherit;text-decoration:inherit}b,strong{font-weight:bolder}code,kbd,samp,pre{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace;font-feature-settings:normal;font-variation-settings:normal;font-size:1em}small{font-size:80%}sub,sup{font-size:75%;line-height:0;position:relative;vertical-align:baseline}sub{bottom:-.25em}sup{top:-.5em}table{text-indent:0;border-color:inherit;border-collapse:collapse}button,input,optgroup,select,textarea{font-family:inherit;font-feature-settings:inherit;font-variation-settings:inherit;font-size:100%;font-weight:inherit;line-height:inherit;letter-spacing:inherit;color:inherit;margin:0;padding:0}button,select{text-transform:none}button,input:where([type=button]),input:where([type=reset]),input:where([type=submit]){-webkit-appearance:button;background-color:transparent;background-image:none}:-moz-focusring{outline:auto}:-moz-ui-invalid{box-shadow:none}progress{vertical-align:baseline}::-webkit-inner-spin-button,::-webkit-outer-spin-button{height:auto}[type=search]{-webkit-appearance:textfield;outline-offset:-2px}::-webkit-search-decoration{-webkit-appearance:none}::-webkit-file-upload-button{-webkit-appearance:button;font:inherit}summary{display:list-item}blockquote,dl,dd,h1,h2,h3,h4,h5,h6,hr,figure,p,pre{margin:0}fieldset{margin:0;padding:0}legend{padding:0}ol,ul,menu{list-style:none;margin:0;padding:0}dialog{padding:0}textarea{resize:vertical}input::placeholder,textarea::placeholder{opacity:1;color:#9ca3af}button,[role=button]{cursor:pointer}:disabled{cursor:default}img,svg,video,canvas,audio,iframe,embed,object{display:block;vertical-align:middle}img,video{max-width:100%;height:auto}[hidden]:where(:not([hidden=until-found])){display:none}@supports (-moz-appearance:none){*{scrollbar-color:initial;scrollbar-width:initial}}:host{display:block;height:100%;min-height:0}:host>div{height:100%;min-height:0}*,*:before,*:after{box-sizing:border-box}.kx-inbox{height:100%;min-height:0;display:flex;flex-direction:column;color:var(--p-text-color);background:var(--p-content-background);font-family:inherit}.kx-head-bar{flex:none;border-bottom:1px solid var(--p-content-border-color);padding:20px 24px 0}.kx-head-row{display:flex;align-items:center;gap:12px;padding-bottom:12px}.kx-title{line-height:1.2}.kx-sub{margin:2px 0 0;font-size:13px;color:var(--p-text-muted-color)}.kx-alert{margin:12px 20px 0}.kx-shell{flex:1;min-height:0;display:flex}.kx-list-pane{width:340px;flex:none;overflow-y:auto;border-right:1px solid var(--p-content-border-color)}.kx-list-empty,.kx-detail-empty{color:var(--p-text-muted-color);font-size:13px}.kx-list-empty{padding:24px;text-align:center}.kx-item{width:100%;min-height:72px;display:flex;gap:12px;padding:12px 16px;text-align:left;border:0;border-bottom:1px solid var(--p-content-border-color);background:transparent;color:inherit;font:inherit;cursor:pointer}.kx-item:hover{background:color-mix(in srgb,var(--p-text-color) 5%,transparent)}.kx-item.active{background:color-mix(in srgb,var(--p-primary-color) 8%,transparent)}.kx-priority-dot{width:8px;height:8px;border-radius:999px;flex:none;margin-top:8px;background:var(--p-primary-color)}.kx-priority-urgent{color:var(--p-danger-600, var(--p-danger-500))}.kx-priority-high{color:var(--p-warn-600, var(--p-warn-500))}.kx-priority-normal{color:var(--p-primary-color)}.kx-priority-low{color:var(--p-text-muted-color)}.kx-priority-dot.kx-priority-urgent{background-color:var(--p-danger-500)}.kx-priority-dot.kx-priority-high{background-color:var(--p-warn-500)}.kx-priority-dot.kx-priority-normal{background-color:var(--p-primary-color)}.kx-priority-dot.kx-priority-low{background-color:var(--p-content-border-color)}.kx-item-main{min-width:0;flex:1}.kx-item-line{display:flex;align-items:center;gap:8px;min-width:0}.kx-item-title{flex:1;min-width:0;font-size:13.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:var(--p-text-muted-color)}.kx-item-title.pending{font-weight:700;color:var(--p-text-color)}.kx-time{flex:none;font-size:10.5px;color:var(--p-text-muted-color)}.kx-preview{display:block;height:20px;margin:3px 0 0;font-size:12px;color:var(--p-text-muted-color);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.kx-status{margin-top:6px;text-transform:capitalize}.kx-detail-pane{flex:1;min-width:0;overflow-y:auto;padding:20px}.kx-detail-empty{height:100%;display:flex;align-items:center;justify-content:center}.kx-detail-card{max-width:760px;min-height:100%}.kx-detail{min-height:100%;display:flex;flex-direction:column}.kx-detail-head{display:flex;align-items:flex-start;gap:12px;padding-bottom:16px;margin-bottom:16px;border-bottom:1px solid var(--p-content-border-color)}.kx-detail-icon{width:38px;height:38px;border-radius:10px;flex:none;display:flex;align-items:center;justify-content:center;background-color:color-mix(in srgb,currentColor 12%,transparent)}.kx-detail-icon svg{width:20px;height:20px}.kx-detail-title-block{min-width:0;flex:1}.kx-detail-title{margin:0;font-size:16px;line-height:1.35;font-weight:700;color:var(--p-text-color)}.kx-detail-meta{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin-top:5px;color:var(--p-text-muted-color);font-size:11.5px}.kx-pill{text-transform:capitalize}.kx-detail-body{flex:1;min-height:0;overflow-y:auto}.kx-native-body{display:flex;flex-direction:column;gap:16px}.kx-content{margin:0;font-size:13.5px;line-height:1.6;color:var(--p-text-color)}.kx-md{display:block;font-size:13.5px;color:var(--p-text-color)}.kx-fields{margin:0;border:1px solid var(--p-content-border-color);border-radius:10px;overflow:hidden}.kx-field-row{display:flex;justify-content:space-between;gap:18px;padding:10px 12px;border-bottom:1px solid var(--p-content-border-color);font-size:13px}.kx-field-row:last-child{border-bottom:0}.kx-field-row dt{flex:none;color:var(--p-text-muted-color)}.kx-field-row dd{margin:0;min-width:0;color:var(--p-text-color);font-weight:600;text-align:right}.kx-field-row dd.kx-field-long{text-align:left;font-weight:500;white-space:pre-wrap;word-break:break-word;max-height:180px;overflow-y:auto}.kx-decision-form{display:flex;flex-direction:column;gap:14px}.kx-form-field{display:flex;flex-direction:column;gap:6px}.kx-form-label{font-size:12px;font-weight:600;color:var(--p-text-color)}.kx-required{margin-left:2px;color:var(--p-danger-600, var(--p-danger-500))}.kx-checkbox-row{display:flex;align-items:center;gap:8px;font-size:13px;color:var(--p-text-color)}.kx-checkbox-row label{cursor:pointer}.kx-form-hint{margin:0;font-size:12px;color:var(--p-text-muted-color)}.kx-detail-foot{display:flex;align-items:center;gap:8px;padding-top:16px;margin-top:16px;border-top:1px solid var(--p-content-border-color)}.kx-resolved{flex:1;color:var(--p-text-muted-color);font-size:12px;text-transform:capitalize}@media(max-width:760px){.kx-shell{flex-direction:column}.kx-list-pane{width:100%;max-height:45vh;border-right:0;border-bottom:1px solid var(--p-content-border-color)}.kx-detail-pane{padding:16px}.kx-head{padding:16px 16px 0}}@media(max-width:640px){.kx-head-actions{margin-left:0}.kx-tabs-list{overflow-x:auto}.kx-tab{flex:none}.kx-field-row{flex-direction:column;gap:4px}.kx-field-row dd{text-align:left}.kx-detail-foot{flex-wrap:wrap}.kx-detail-action{flex:1;min-width:0}.kx-resolved{flex-basis:100%}}.kx-files{margin-top:16px}.kx-files h3{margin:0 0 8px;font-size:12px;color:var(--p-text-muted-color)}.kx-file-list{list-style:none;margin:0;padding:0;border:1px solid var(--p-content-border-color);border-radius:8px}.kx-file-list>li+li{border-top:1px solid var(--p-content-border-color)}.kx-file-row{display:flex;align-items:center;gap:8px;padding:8px 10px;font-size:12px}.kx-file-row>svg{flex:none;font-size:20px;color:var(--p-text-muted-color)}.kx-file-row .p-button{flex:none;white-space:nowrap;word-spacing:.125em}.kx-file-label{display:flex;flex:1;min-width:0;flex-direction:column;gap:3px}.kx-file-name{overflow-wrap:anywhere;color:var(--p-text-color)}.kx-file-size,.kx-file-locked{color:var(--p-text-muted-color)}.kx-file-row a{flex:none;color:var(--p-text-color);text-decoration:underline;text-underline-offset:2px}.kx-file-preview{padding:12px;border-top:1px solid var(--p-content-border-color)}.kx-file-preview wc-resource-view{display:block;min-height:180px}.kx-sr-only{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}@media(max-width:420px){.kx-file-row{flex-wrap:wrap}.kx-file-label{flex-basis:calc(100% - 40px)}}', Qp = { props: { type: "object", properties: {} } }, Xp = {
  wippy: Qp
};
class ef extends wi {
  static get wippyConfig() {
    return {
      propsSchema: Xp.wippy.props,
      hostCssKeys: ["themeConfigUrl", "primeVueCssUrl"],
      inlineCss: Jp
    };
  }
  static get vueConfig() {
    return { rootComponent: Zp, plugins: [Is] };
  }
}
si(import.meta.url, ef);
//# sourceMappingURL=index.js.map

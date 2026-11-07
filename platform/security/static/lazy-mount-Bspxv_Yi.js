import _n from "primevue/config";
import wn from "primevue/contextmenu";
import Cn from "primevue/menu";
import On from "primevue/portal";
import { renderSlot as he, createCommentVNode as x, h as Pn, Teleport as Tn, defineComponent as X, openBlock as f, createElementBlock as $, createElementVNode as m, createTextVNode as R, toDisplayString as L, getCurrentInstance as tt, computed as K, createBlock as D, unref as p, withCtx as E, createVNode as w, ref as I, readonly as Ln, onMounted as Mt, nextTick as lt, watch as He, useId as Ut, mergeProps as ze, normalizeClass as ve, onBeforeUnmount as xn, withModifiers as we, Fragment as le, renderList as ue, onUnmounted as jn, withDirectives as ct, vShow as pt } from "vue";
import { Icon as q } from "@iconify/vue";
import { loadByTagName as Nn, api as ge, host as Bt } from "@wippy-fe/proxy";
import { a as An } from "./wc-runtime-BMe_f3Uc.js";
import mt from "primevue/tab";
import En from "primevue/tablist";
import Vn from "primevue/tabs";
import zt from "primevue/button";
import Rn from "primevue/tag";
import Dn from "primevue/progressspinner";
import In from "primevue/chip";
import ft from "primevue/radiobutton";
const Mn = "data-wippy-overlay-layer";
function Ht() {
  return typeof window < "u" && typeof window.document < "u";
}
function Wt() {
  return Ht() && typeof HTMLElement < "u" && Object.hasOwn(HTMLElement.prototype, "popover");
}
function Un() {
  return Wt() && typeof CSS < "u" && typeof CSS.supports == "function" && CSS.supports("anchor-name: --a") && CSS.supports("position-area", "bottom span-right") && CSS.supports("position-try-fallbacks", "flip-block") && CSS.supports("min-width", "min(anchor-size(width), 100vw)") && CSS.supports("max-width", "stretch");
}
const Bn = /\bp-(?:select|multiselect|treeselect|cascadeselect)-overlay\b/;
let zn = 0;
const We = /* @__PURE__ */ new WeakMap();
function vt(e, t) {
  const n = e.style;
  n.setProperty("position", "fixed", "important"), n.setProperty("inset", "auto", "important"), n.setProperty("margin", "0", "important"), n.setProperty("position-anchor", t), n.setProperty("position-area", "bottom span-right"), n.setProperty("position-try-fallbacks", "flip-block, flip-inline, flip-block flip-inline"), n.setProperty("min-width", "min(anchor-size(width), 100vw)", "important"), n.setProperty("max-width", "stretch", "important");
}
function Hn(e, t) {
  if (!Bn.test(e.className))
    return;
  const n = e.style.cssText;
  vt(e, t), e.getAttribute("popover") !== "manual" && e.setAttribute("popover", "manual");
  try {
    e.matches(":popover-open") || e.showPopover();
  } catch {
  }
  if (!e.matches(":popover-open")) {
    e.removeAttribute("popover"), e.style.cssText = n;
    return;
  }
  if (!We.has(e)) {
    const i = new MutationObserver(() => {
      const s = e.style;
      (s.top !== "auto" || s.left !== "auto" || s.margin !== "0px" || s.getPropertyPriority("top") !== "important" || s.getPropertyPriority("left") !== "important" || s.getPropertyPriority("margin") !== "important" || s.getPropertyPriority("min-width") !== "important" || s.maxWidth !== "stretch" || s.getPropertyPriority("max-width") !== "important") && vt(e, t);
    });
    i.observe(e, { attributes: !0, attributeFilter: ["style"] }), We.set(e, i);
  }
}
function ut(e) {
  const t = We.get(e);
  t && (t.disconnect(), We.delete(e));
}
function Wn(e) {
  const t = e && typeof e.getRootNode == "function" ? e.getRootNode() : null;
  return t instanceof ShadowRoot ? t : null;
}
function nt(e) {
  e.style.top = "0px", e.style.left = "0px";
  const t = e.getBoundingClientRect();
  e.style.top = `${-window.scrollY - t.top}px`, e.style.left = `${-window.scrollX - t.left}px`;
}
const Ke = /* @__PURE__ */ new Set(), dt = /* @__PURE__ */ new WeakMap();
let ht = !1, it = !1;
function Kn() {
  it = !1;
  for (const e of Ke) {
    if (!e.isConnected) {
      for (const t of Array.from(e.children))
        t instanceof HTMLElement && ut(t);
      Ke.delete(e), dt.get(e)?.disconnect();
      continue;
    }
    e.childElementCount > 0 && nt(e);
  }
}
function yt() {
  it || (it = !0, requestAnimationFrame(Kn));
}
function qn(e) {
  const t = document.createElement("div");
  t.setAttribute(Mn, "");
  const n = Wt();
  if (t.style.cssText = n ? "position:fixed;width:0 !important;height:0 !important;margin:0 !important;border:0 !important;padding:0 !important;background:transparent !important;color:inherit !important;overflow:visible !important;" : "position:fixed;top:0;left:0;width:0;height:0;", n && t.setAttribute("popover", "manual"), e.appendChild(t), n) {
    try {
      t.showPopover();
    } catch {
    }
    t.matches(":popover-open") || (t.removeAttribute("popover"), t.style.cssText = "position:fixed;top:0;left:0;width:0;height:0;");
  }
  nt(t);
  const i = new MutationObserver((s) => {
    const r = t.__wippyAnchorName;
    for (const a of s) {
      if (r)
        for (const l of Array.from(a.addedNodes))
          l instanceof HTMLElement && Hn(l, r);
      for (const l of Array.from(a.removedNodes))
        l instanceof HTMLElement && ut(l);
    }
    t.isConnected && t.childElementCount > 0 && nt(t);
  });
  return i.observe(t, { childList: !0 }), dt.set(t, i), Ke.add(t), ht || (ht = !0, window.addEventListener("scroll", yt, { capture: !0, passive: !0 }), window.addEventListener("resize", yt, { passive: !0 })), t;
}
function gt(e) {
  if (!(!e.hostRoot || e.layer) && (e.layer = qn(e.hostRoot), Un())) {
    const t = e.$el ? e.$el.parentElement : null;
    t && (e.anchorName = `--wippy-a-${++zn}`, e.anchorTrigger = t, t.style.setProperty("anchor-name", e.anchorName), e.layer.__wippyAnchorName = e.anchorName);
  }
}
function bt(e) {
  if (e.anchorTrigger && (e.anchorTrigger.style.removeProperty("anchor-name"), e.anchorTrigger = null), e.anchorName = null, e.layer) {
    for (const t of Array.from(e.layer.children))
      t instanceof HTMLElement && ut(t);
    Ke.delete(e.layer), dt.get(e.layer)?.disconnect(), e.layer.remove(), e.layer = null;
  }
}
let kt = !1;
function Fn() {
  if (kt)
    return;
  const e = Cn;
  !e.methods || typeof e.methods.bindOutsideClickListener != "function" || (e.methods.bindOutsideClickListener = function() {
    this.outsideClickListener || (this.outsideClickListener = (t) => {
      const n = t.composedPath(), i = this.container && !n.includes(this.container), s = !(this.target && n.includes(this.target));
      this.overlayVisible && i && s ? this.hide() : !this.popup && i && s && (this.focusedOptionIndex = -1);
    }, document.addEventListener("click", this.outsideClickListener, !0));
  }, kt = !0);
}
let St = !1;
function Gn() {
  if (St)
    return;
  const e = wn;
  !e.methods || typeof e.methods.bindOutsideClickListener != "function" || (e.methods.bindOutsideClickListener = function() {
    this.outsideClickListener || (this.outsideClickListener = (t) => {
      const n = t.composedPath(), i = this.container && !n.includes(this.container), s = this.visible ? !(this.target && n.includes(this.target)) : !0;
      i && s && this.hide();
    }, document.addEventListener("click", this.outsideClickListener, !0));
  }, St = !0);
}
let $t = !1;
function Zn() {
  if ($t)
    return;
  $t = !0;
  const e = On;
  e.computed = e.computed || {}, e.computed.inline = function() {
    return !!this.disabled || this.appendTo === "self";
  }, e.computed.resolvedTarget = function() {
    return this.appendTo == null || this.appendTo === "body" ? this.hostRoot ? this.layer : document.body : this.appendTo;
  }, e.data = function() {
    return { mounted: !1, hostRoot: null, layer: null, anchorName: null, anchorTrigger: null };
  }, e.mounted = function() {
    Ht() && (this.hostRoot = Wn(this.$el), this.mounted = !0, this.hostRoot && (this.inline || gt(this), this.$watch("inline", (t) => {
      t ? bt(this) : gt(this);
    })));
  }, e.render = function() {
    return this.inline ? he(this.$slots, "default", { key: 0 }) : this.mounted ? Pn(Tn, { key: 1, to: this.resolvedTarget || document.body }, [
      he(this.$slots, "default")
    ]) : x("", !0);
  }, e.unmounted = function() {
    bt(this);
  };
}
const Yn = {
  install: (e) => {
    Fn(), Gn(), Zn(), e.use(_n, { theme: "none" });
  }
}, Xn = { class: "km-shell" }, Jn = { class: "km-rail" }, Qn = { class: "km-main" }, ei = /* @__PURE__ */ X({
  __name: "Shell",
  setup(e) {
    return (t, n) => (f(), $("div", Xn, [
      m("aside", Jn, [
        he(t.$slots, "rail")
      ]),
      m("main", Qn, [
        he(t.$slots, "default")
      ])
    ]));
  }
}), ti = { class: "km-railhead" }, ni = { class: "km-railhead-title" }, ii = { key: 0 }, si = { class: "km-railhead-acts" }, oi = /* @__PURE__ */ X({
  __name: "RailHeader",
  props: {
    title: {},
    count: {}
  },
  setup(e) {
    return (t, n) => (f(), $("div", ti, [
      m("span", ni, [
        R(L(e.title), 1),
        e.count !== void 0 ? (f(), $("b", ii, L(e.count), 1)) : x("", !0)
      ]),
      m("div", si, [
        he(t.$slots, "actions")
      ])
    ]));
  }
}), qe = /* @__PURE__ */ X({
  __name: "IconButton",
  props: {
    icon: {},
    label: {},
    active: { type: Boolean },
    disabled: { type: Boolean },
    variant: { default: "plain" },
    size: { default: "md" },
    spin: { type: Boolean }
  },
  emits: ["click"],
  setup(e, { emit: t }) {
    const n = e, i = t, s = tt(), r = K(
      () => Object.prototype.hasOwnProperty.call(s?.vnode.props ?? {}, "active")
    ), a = K(
      () => n.variant === "danger" ? "danger" : n.variant === "bordered" ? "secondary" : void 0
    ), l = K(
      () => n.size === "sm" ? "small" : n.size === "lg" ? "large" : void 0
    );
    return (u, d) => (f(), D(p(zt), {
      type: "button",
      severity: a.value,
      text: e.variant !== "bordered" && !e.active,
      outlined: e.variant === "bordered",
      size: l.value,
      loading: e.spin,
      disabled: e.disabled || e.spin,
      pt: {
        root: {
          "aria-label": e.label,
          "aria-pressed": r.value ? String(e.active) : void 0,
          title: e.label
        }
      },
      onClick: d[0] || (d[0] = (o) => i("click"))
    }, {
      icon: E(() => [
        w(p(q), {
          icon: e.icon,
          "aria-hidden": "true"
        }, null, 8, ["icon"])
      ]),
      _: 1
    }, 8, ["severity", "text", "outlined", "size", "loading", "disabled", "pt"]));
  }
});
function Ye(e) {
  return e == null || e === "" || Array.isArray(e) && e.length === 0 || !(e instanceof Date) && typeof e == "object" && Object.keys(e).length === 0;
}
function Kt(e) {
  return typeof e == "function" && "call" in e && "apply" in e;
}
function H(e) {
  return !Ye(e);
}
function Ce(e, t = !0) {
  return e instanceof Object && e.constructor === Object && (t || Object.keys(e).length !== 0);
}
function oe(e, ...t) {
  return Kt(e) ? e(...t) : e;
}
function pe(e, t = !0) {
  return typeof e == "string" && (t || e !== "");
}
function be(e) {
  return pe(e) ? e.replace(/(-|_)/g, "").toLowerCase() : e;
}
function qt(e, t = "", n = {}) {
  let i = be(t).split("."), s = i.shift();
  if (s) {
    if (Ce(e)) {
      let r = Object.keys(e).find((a) => be(a) === s) || "";
      return qt(oe(e[r], n), i.join("."), n);
    }
    return;
  }
  return oe(e, n);
}
function ai(e, t = !0) {
  return Array.isArray(e) && (t || e.length !== 0);
}
function ri(e) {
  return H(e) && !isNaN(e);
}
function ke(e, t) {
  if (t) {
    let n = t.test(e);
    return t.lastIndex = 0, n;
  }
  return !1;
}
function xe(e) {
  return e && e.replace(/\/\*(?:(?!\*\/)[\s\S])*\*\/|[\r\n\t]+/g, "").replace(/ {2,}/g, " ").replace(/ ([{:}]) /g, "$1").replace(/([;,]) /g, "$1").replace(/ !/g, "!").replace(/: /g, ":").trim();
}
function Ft(e) {
  return pe(e) ? e.replace(/(_)/g, "-").replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase() : e;
}
function li() {
  let e = /* @__PURE__ */ new Map();
  return { on(t, n) {
    let i = e.get(t);
    return i ? i.push(n) : i = [n], e.set(t, i), this;
  }, off(t, n) {
    let i = e.get(t);
    return i && i.splice(i.indexOf(n) >>> 0, 1), this;
  }, emit(t, n) {
    let i = e.get(t);
    i && i.forEach((s) => {
      s(n);
    });
  }, clear() {
    e.clear();
  } };
}
function ui(e) {
  if (e) {
    let t = e.parentNode;
    return t && t instanceof ShadowRoot && t.host && (t = t.host), t;
  }
  return null;
}
function di(e) {
  return !!(e !== null && typeof e < "u" && e.nodeName && ui(e));
}
function Xe(e) {
  return typeof Element < "u" ? e instanceof Element : e !== null && typeof e == "object" && e.nodeType === 1 && typeof e.nodeName == "string";
}
function st(e, t = {}) {
  if (Xe(e)) {
    let n = (i, s) => {
      var r, a;
      let l = (r = e?.$attrs) != null && r[i] ? [(a = e?.$attrs) == null ? void 0 : a[i]] : [];
      return [s].flat().reduce((u, d) => {
        if (d != null) {
          let o = typeof d;
          if (o === "string" || o === "number") u.push(d);
          else if (o === "object") {
            let c = Array.isArray(d) ? n(i, d) : Object.entries(d).map(([v, y]) => i === "style" && (y || y === 0) ? `${v.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase()}:${y}` : y ? v : void 0);
            u = c.length ? u.concat(c.filter((v) => !!v)) : u;
          }
        }
        return u;
      }, l);
    };
    Object.entries(t).forEach(([i, s]) => {
      if (s != null) {
        let r = i.match(/^on(.+)/);
        r ? e.addEventListener(r[1].toLowerCase(), s) : i === "p-bind" || i === "pBind" ? st(e, s) : (s = i === "class" ? [...new Set(n("class", s))].join(" ").trim() : i === "style" ? n("style", s).join(";").trim() : s, (e.$attrs = e.$attrs || {}) && (e.$attrs[i] = s), e.setAttribute(i, s));
      }
    });
  }
}
function ci(e, t) {
  return Xe(e) ? e.matches(t) ? e : e.querySelector(t) : null;
}
function pi() {
  return !!(typeof window < "u" && window.document && window.document.createElement);
}
function mi(e, t = "", n) {
  Xe(e) && n !== null && n !== void 0 && e.setAttribute(t, n);
}
var fi = Object.defineProperty, vi = Object.defineProperties, hi = Object.getOwnPropertyDescriptors, Fe = Object.getOwnPropertySymbols, Gt = Object.prototype.hasOwnProperty, Zt = Object.prototype.propertyIsEnumerable, _t = (e, t, n) => t in e ? fi(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n, de = (e, t) => {
  for (var n in t || (t = {})) Gt.call(t, n) && _t(e, n, t[n]);
  if (Fe) for (var n of Fe(t)) Zt.call(t, n) && _t(e, n, t[n]);
  return e;
}, Je = (e, t) => vi(e, hi(t)), me = (e, t) => {
  var n = {};
  for (var i in e) Gt.call(e, i) && t.indexOf(i) < 0 && (n[i] = e[i]);
  if (e != null && Fe) for (var i of Fe(e)) t.indexOf(i) < 0 && Zt.call(e, i) && (n[i] = e[i]);
  return n;
}, yi = li(), ne = yi, Ne = /{([^}]*)}/g, Yt = /(\d+\s+[\+\-\*\/]\s+\d+)/g, Xt = /var\([^)]+\)/g;
function wt(e) {
  return pe(e) ? e.replace(/[A-Z]/g, (t, n) => n === 0 ? t : "." + t.toLowerCase()).toLowerCase() : e;
}
function gi(e) {
  return Ce(e) && e.hasOwnProperty("$value") && e.hasOwnProperty("$type") ? e.$value : e;
}
function bi(e) {
  return e.replaceAll(/ /g, "").replace(/[^\w]/g, "-");
}
function ot(e = "", t = "") {
  return bi(`${pe(e, !1) && pe(t, !1) ? `${e}-` : e}${t}`);
}
function Jt(e = "", t = "") {
  return `--${ot(e, t)}`;
}
function ki(e = "") {
  let t = (e.match(/{/g) || []).length, n = (e.match(/}/g) || []).length;
  return (t + n) % 2 !== 0;
}
function Qt(e, t = "", n = "", i = [], s) {
  if (pe(e)) {
    let r = e.trim();
    if (ki(r)) return;
    if (ke(r, Ne)) {
      let a = r.replaceAll(Ne, (l) => {
        let u = l.replace(/{|}/g, "").split(".").filter((d) => !i.some((o) => ke(d, o)));
        return `var(${Jt(n, Ft(u.join("-")))}${H(s) ? `, ${s}` : ""})`;
      });
      return ke(a.replace(Xt, "0"), Yt) ? `calc(${a})` : a;
    }
    return r;
  } else if (ri(e)) return e;
}
function Si(e, t, n) {
  pe(t, !1) && e.push(`${t}:${n};`);
}
function $e(e, t) {
  return e ? `${e}{${t}}` : "";
}
function en(e, t) {
  if (e.indexOf("dt(") === -1) return e;
  function n(a, l) {
    let u = [], d = 0, o = "", c = null, v = 0;
    for (; d <= a.length; ) {
      let y = a[d];
      if ((y === '"' || y === "'" || y === "`") && a[d - 1] !== "\\" && (c = c === y ? null : y), !c && (y === "(" && v++, y === ")" && v--, (y === "," || d === a.length) && v === 0)) {
        let C = o.trim();
        C.startsWith("dt(") ? u.push(en(C, l)) : u.push(i(C)), o = "", d++;
        continue;
      }
      y !== void 0 && (o += y), d++;
    }
    return u;
  }
  function i(a) {
    let l = a[0];
    if ((l === '"' || l === "'" || l === "`") && a[a.length - 1] === l) return a.slice(1, -1);
    let u = Number(a);
    return isNaN(u) ? a : u;
  }
  let s = [], r = [];
  for (let a = 0; a < e.length; a++) if (e[a] === "d" && e.slice(a, a + 3) === "dt(") r.push(a), a += 2;
  else if (e[a] === ")" && r.length > 0) {
    let l = r.pop();
    r.length === 0 && s.push([l, a]);
  }
  if (!s.length) return e;
  for (let a = s.length - 1; a >= 0; a--) {
    let [l, u] = s[a], d = e.slice(l + 3, u), o = n(d, t), c = t(...o);
    e = e.slice(0, l) + c + e.slice(u + 1);
  }
  return e;
}
var Se = (...e) => $i(G.getTheme(), ...e), $i = (e = {}, t, n, i) => {
  if (t) {
    let { variable: s, options: r } = G.defaults || {}, { prefix: a, transform: l } = e?.options || r || {}, u = ke(t, Ne) ? t : `{${t}}`;
    return i === "value" || Ye(i) && l === "strict" ? G.getTokenValue(t) : Qt(u, void 0, a, [s.excludedKeyRegex], n);
  }
  return "";
};
function Me(e, ...t) {
  if (e instanceof Array) {
    let n = e.reduce((i, s, r) => {
      var a;
      return i + s + ((a = oe(t[r], { dt: Se })) != null ? a : "");
    }, "");
    return en(n, Se);
  }
  return oe(e, { dt: Se });
}
function _i(e, t = {}) {
  let n = G.defaults.variable, { prefix: i = n.prefix, selector: s = n.selector, excludedKeyRegex: r = n.excludedKeyRegex } = t, a = [], l = [], u = [{ node: e, path: i }];
  for (; u.length; ) {
    let { node: o, path: c } = u.pop();
    for (let v in o) {
      let y = o[v], C = gi(y), P = ke(v, r) ? ot(c) : ot(c, Ft(v));
      if (Ce(C)) u.push({ node: C, path: P });
      else {
        let O = Jt(P), N = Qt(C, P, i, [r]);
        Si(l, O, N);
        let j = P;
        i && j.startsWith(i + "-") && (j = j.slice(i.length + 1)), a.push(j.replace(/-/g, "."));
      }
    }
  }
  let d = l.join("");
  return { value: l, tokens: a, declarations: d, css: $e(s, d) };
}
var re = { regex: { rules: { class: { pattern: /^\.([a-zA-Z][\w-]*)$/, resolve(e) {
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
    var i;
    return (i = t.map((s) => s.resolve(n)).find((s) => s.matched)) != null ? i : this.rules.custom.resolve(n);
  });
} }, _toVariables(e, t) {
  return _i(e, { prefix: t?.prefix });
}, getCommon({ name: e = "", theme: t = {}, params: n, set: i, defaults: s }) {
  var r, a, l, u, d, o, c;
  let { preset: v, options: y } = t, C, P, O, N, j, B, J;
  if (H(v) && y.transform !== "strict") {
    let { primitive: _, semantic: U, extend: V } = v, M = U || {}, { colorScheme: Z } = M, z = me(M, ["colorScheme"]), ee = V || {}, { colorScheme: T } = ee, b = me(ee, ["colorScheme"]), S = Z || {}, { dark: W } = S, F = me(S, ["dark"]), te = T || {}, { dark: ie } = te, ye = me(te, ["dark"]), ae = H(_) ? this._toVariables({ primitive: _ }, y) : {}, se = H(z) ? this._toVariables({ semantic: z }, y) : {}, Q = H(F) ? this._toVariables({ light: F }, y) : {}, g = H(W) ? this._toVariables({ dark: W }, y) : {}, h = H(b) ? this._toVariables({ semantic: b }, y) : {}, k = H(ye) ? this._toVariables({ light: ye }, y) : {}, Y = H(ie) ? this._toVariables({ dark: ie }, y) : {}, [De, Ie] = [(r = ae.declarations) != null ? r : "", ae.tokens], [rn, ln] = [(a = se.declarations) != null ? a : "", se.tokens || []], [un, dn] = [(l = Q.declarations) != null ? l : "", Q.tokens || []], [cn, pn] = [(u = g.declarations) != null ? u : "", g.tokens || []], [mn, fn] = [(d = h.declarations) != null ? d : "", h.tokens || []], [vn, hn] = [(o = k.declarations) != null ? o : "", k.tokens || []], [yn, gn] = [(c = Y.declarations) != null ? c : "", Y.tokens || []];
    C = this.transformCSS(e, De, "light", "variable", y, i, s), P = Ie;
    let bn = this.transformCSS(e, `${rn}${un}`, "light", "variable", y, i, s), kn = this.transformCSS(e, `${cn}`, "dark", "variable", y, i, s);
    O = `${bn}${kn}`, N = [.../* @__PURE__ */ new Set([...ln, ...dn, ...pn])];
    let Sn = this.transformCSS(e, `${mn}${vn}color-scheme:light`, "light", "variable", y, i, s), $n = this.transformCSS(e, `${yn}color-scheme:dark`, "dark", "variable", y, i, s);
    j = `${Sn}${$n}`, B = [.../* @__PURE__ */ new Set([...fn, ...hn, ...gn])], J = oe(v.css, { dt: Se });
  }
  return { primitive: { css: C, tokens: P }, semantic: { css: O, tokens: N }, global: { css: j, tokens: B }, style: J };
}, getPreset({ name: e = "", preset: t = {}, options: n, params: i, set: s, defaults: r, selector: a }) {
  var l, u, d;
  let o, c, v;
  if (H(t) && n.transform !== "strict") {
    let y = e.replace("-directive", ""), C = t, { colorScheme: P, extend: O, css: N } = C, j = me(C, ["colorScheme", "extend", "css"]), B = O || {}, { colorScheme: J } = B, _ = me(B, ["colorScheme"]), U = P || {}, { dark: V } = U, M = me(U, ["dark"]), Z = J || {}, { dark: z } = Z, ee = me(Z, ["dark"]), T = H(j) ? this._toVariables({ [y]: de(de({}, j), _) }, n) : {}, b = H(M) ? this._toVariables({ [y]: de(de({}, M), ee) }, n) : {}, S = H(V) ? this._toVariables({ [y]: de(de({}, V), z) }, n) : {}, [W, F] = [(l = T.declarations) != null ? l : "", T.tokens || []], [te, ie] = [(u = b.declarations) != null ? u : "", b.tokens || []], [ye, ae] = [(d = S.declarations) != null ? d : "", S.tokens || []], se = this.transformCSS(y, `${W}${te}`, "light", "variable", n, s, r, a), Q = this.transformCSS(y, ye, "dark", "variable", n, s, r, a);
    o = `${se}${Q}`, c = [.../* @__PURE__ */ new Set([...F, ...ie, ...ae])], v = oe(N, { dt: Se });
  }
  return { css: o, tokens: c, style: v };
}, getPresetC({ name: e = "", theme: t = {}, params: n, set: i, defaults: s }) {
  var r;
  let { preset: a, options: l } = t, u = (r = a?.components) == null ? void 0 : r[e];
  return this.getPreset({ name: e, preset: u, options: l, params: n, set: i, defaults: s });
}, getPresetD({ name: e = "", theme: t = {}, params: n, set: i, defaults: s }) {
  var r, a;
  let l = e.replace("-directive", ""), { preset: u, options: d } = t, o = ((r = u?.components) == null ? void 0 : r[l]) || ((a = u?.directives) == null ? void 0 : a[l]);
  return this.getPreset({ name: l, preset: o, options: d, params: n, set: i, defaults: s });
}, applyDarkColorScheme(e) {
  return !(e.darkModeSelector === "none" || e.darkModeSelector === !1);
}, getColorSchemeOption(e, t) {
  var n;
  return this.applyDarkColorScheme(e) ? this.regex.resolve(e.darkModeSelector === !0 ? t.options.darkModeSelector : (n = e.darkModeSelector) != null ? n : t.options.darkModeSelector) : [];
}, getLayerOrder(e, t = {}, n, i) {
  let { cssLayer: s } = t;
  return s ? `@layer ${oe(s.order || s.name || "primeui", n)}` : "";
}, getCommonStyleSheet({ name: e = "", theme: t = {}, params: n, props: i = {}, set: s, defaults: r }) {
  let a = this.getCommon({ name: e, theme: t, params: n, set: s, defaults: r }), l = Object.entries(i).reduce((u, [d, o]) => u.push(`${d}="${o}"`) && u, []).join(" ");
  return Object.entries(a || {}).reduce((u, [d, o]) => {
    if (Ce(o) && Object.hasOwn(o, "css")) {
      let c = xe(o.css), v = `${d}-variables`;
      u.push(`<style type="text/css" data-primevue-style-id="${v}" ${l}>${c}</style>`);
    }
    return u;
  }, []).join("");
}, getStyleSheet({ name: e = "", theme: t = {}, params: n, props: i = {}, set: s, defaults: r }) {
  var a;
  let l = { name: e, theme: t, params: n, set: s, defaults: r }, u = (a = e.includes("-directive") ? this.getPresetD(l) : this.getPresetC(l)) == null ? void 0 : a.css, d = Object.entries(i).reduce((o, [c, v]) => o.push(`${c}="${v}"`) && o, []).join(" ");
  return u ? `<style type="text/css" data-primevue-style-id="${e}-variables" ${d}>${xe(u)}</style>` : "";
}, createTokens(e = {}, t, n = "", i = "", s = {}) {
  let r = function(l, u = {}, d = []) {
    if (d.includes(this.path)) return console.warn(`Circular reference detected at ${this.path}`), { colorScheme: l, path: this.path, paths: u, value: void 0 };
    d.push(this.path), u.name = this.path, u.binding || (u.binding = {});
    let o = this.value;
    if (typeof this.value == "string" && Ne.test(this.value)) {
      let c = this.value.trim().replace(Ne, (v) => {
        var y;
        let C = v.slice(1, -1), P = this.tokens[C];
        if (!P) return console.warn(`Token not found for path: ${C}`), "__UNRESOLVED__";
        let O = P.computed(l, u, d);
        return Array.isArray(O) && O.length === 2 ? `light-dark(${O[0].value},${O[1].value})` : (y = O?.value) != null ? y : "__UNRESOLVED__";
      });
      o = Yt.test(c.replace(Xt, "0")) ? `calc(${c})` : c;
    }
    return Ye(u.binding) && delete u.binding, d.pop(), { colorScheme: l, path: this.path, paths: u, value: o.includes("__UNRESOLVED__") ? void 0 : o };
  }, a = (l, u, d) => {
    Object.entries(l).forEach(([o, c]) => {
      let v = ke(o, t.variable.excludedKeyRegex) ? u : u ? `${u}.${wt(o)}` : wt(o), y = d ? `${d}.${o}` : o;
      Ce(c) ? a(c, v, y) : (s[v] || (s[v] = { paths: [], computed: (C, P = {}, O = []) => {
        if (s[v].paths.length === 1) return s[v].paths[0].computed(s[v].paths[0].scheme, P.binding, O);
        if (C && C !== "none") for (let N = 0; N < s[v].paths.length; N++) {
          let j = s[v].paths[N];
          if (j.scheme === C) return j.computed(C, P.binding, O);
        }
        return s[v].paths.map((N) => N.computed(N.scheme, P[N.scheme], O));
      } }), s[v].paths.push({ path: y, value: c, scheme: y.includes("colorScheme.light") ? "light" : y.includes("colorScheme.dark") ? "dark" : "none", computed: r, tokens: s }));
    });
  };
  return a(e, n, i), s;
}, getTokenValue(e, t, n) {
  var i;
  let s = ((l) => l.split(".").filter((u) => !ke(u.toLowerCase(), n.variable.excludedKeyRegex)).join("."))(t), r = t.includes("colorScheme.light") ? "light" : t.includes("colorScheme.dark") ? "dark" : void 0, a = [(i = e[s]) == null ? void 0 : i.computed(r)].flat().filter((l) => l);
  return a.length === 1 ? a[0].value : a.reduce((l = {}, u) => {
    let d = u, { colorScheme: o } = d, c = me(d, ["colorScheme"]);
    return l[o] = c, l;
  }, void 0);
}, getSelectorRule(e, t, n, i) {
  return n === "class" || n === "attr" ? $e(H(t) ? `${e}${t},${e} ${t}` : e, i) : $e(e, $e(t ?? ":root,:host", i));
}, transformCSS(e, t, n, i, s = {}, r, a, l) {
  if (H(t)) {
    let { cssLayer: u } = s;
    if (i !== "style") {
      let d = this.getColorSchemeOption(s, a);
      t = n === "dark" ? d.reduce((o, { type: c, selector: v }) => (H(v) && (o += v.includes("[CSS]") ? v.replace("[CSS]", t) : this.getSelectorRule(v, l, c, t)), o), "") : $e(l ?? ":root,:host", t);
    }
    if (u) {
      let d = { name: "primeui" };
      Ce(u) && (d.name = oe(u.name, { name: e, type: i })), H(d.name) && (t = $e(`@layer ${d.name}`, t), r?.layerNames(d.name));
    }
    return t;
  }
  return "";
} }, G = { defaults: { variable: { prefix: "p", selector: ":root,:host", excludedKeyRegex: /^(primitive|semantic|components|directives|variables|colorscheme|light|dark|common|root|states|extend|css)$/gi }, options: { prefix: "p", darkModeSelector: "system", cssLayer: !1 } }, _theme: void 0, _layerNames: /* @__PURE__ */ new Set(), _loadedStyleNames: /* @__PURE__ */ new Set(), _loadingStyles: /* @__PURE__ */ new Set(), _tokens: {}, update(e = {}) {
  let { theme: t } = e;
  t && (this._theme = Je(de({}, t), { options: de(de({}, this.defaults.options), t.options) }), this._tokens = re.createTokens(this.preset, this.defaults), this.clearLoadedStyleNames());
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
  this.update({ theme: e }), ne.emit("theme:change", e);
}, getPreset() {
  return this.preset;
}, setPreset(e) {
  this._theme = Je(de({}, this.theme), { preset: e }), this._tokens = re.createTokens(e, this.defaults), this.clearLoadedStyleNames(), ne.emit("preset:change", e), ne.emit("theme:change", this.theme);
}, getOptions() {
  return this.options;
}, setOptions(e) {
  this._theme = Je(de({}, this.theme), { options: e }), this.clearLoadedStyleNames(), ne.emit("options:change", e), ne.emit("theme:change", this.theme);
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
  return re.getTokenValue(this.tokens, e, this.defaults);
}, getCommon(e = "", t) {
  return re.getCommon({ name: e, theme: this.theme, params: t, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } });
}, getComponent(e = "", t) {
  let n = { name: e, theme: this.theme, params: t, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } };
  return re.getPresetC(n);
}, getDirective(e = "", t) {
  let n = { name: e, theme: this.theme, params: t, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } };
  return re.getPresetD(n);
}, getCustomPreset(e = "", t, n, i) {
  let s = { name: e, preset: t, options: this.options, selector: n, params: i, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } };
  return re.getPreset(s);
}, getLayerOrderCSS(e = "") {
  return re.getLayerOrder(e, this.options, { names: this.getLayerNames() }, this.defaults);
}, transformCSS(e = "", t, n = "style", i) {
  return re.transformCSS(e, t, i, n, this.options, { layerNames: this.setLayerNames.bind(this) }, this.defaults);
}, getCommonStyleSheet(e = "", t, n = {}) {
  return re.getCommonStyleSheet({ name: e, theme: this.theme, params: t, props: n, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } });
}, getStyleSheet(e, t, n = {}) {
  return re.getStyleSheet({ name: e, theme: this.theme, params: t, props: n, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } });
}, onStyleMounted(e) {
  this._loadingStyles.add(e);
}, onStyleUpdated(e) {
  this._loadingStyles.add(e);
}, onStyleLoaded(e, { name: t }) {
  this._loadingStyles.size && (this._loadingStyles.delete(t), ne.emit(`theme:${t}:load`, e), !this._loadingStyles.size && ne.emit("theme:load"));
} }, Oe = {
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
}, wi = `
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
function Ct(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var i = Object.getOwnPropertySymbols(e);
    t && (i = i.filter(function(s) {
      return Object.getOwnPropertyDescriptor(e, s).enumerable;
    })), n.push.apply(n, i);
  }
  return n;
}
function Ot(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? Ct(Object(n), !0).forEach(function(i) {
      Ci(e, i, n[i]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Ct(Object(n)).forEach(function(i) {
      Object.defineProperty(e, i, Object.getOwnPropertyDescriptor(n, i));
    });
  }
  return e;
}
function Ci(e, t, n) {
  return (t = Oi(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Oi(e) {
  var t = Pi(e, "string");
  return Ae(t) == "symbol" ? t : t + "";
}
function Pi(e, t) {
  if (Ae(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var i = n.call(e, t);
    if (Ae(i) != "object") return i;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
function Ti(e) {
  var t = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0;
  tt() && tt().components ? Mt(e) : t ? e() : lt(e);
}
var Li = 0;
function xi(e) {
  var t = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, n = I(!1), i = I(e), s = I(null), r = pi() ? window.document : void 0, a = t.document, l = a === void 0 ? r : a, u = t.immediate, d = u === void 0 ? !0 : u, o = t.manual, c = o === void 0 ? !1 : o, v = t.name, y = v === void 0 ? "style_".concat(++Li) : v, C = t.id, P = C === void 0 ? void 0 : C, O = t.media, N = O === void 0 ? void 0 : O, j = t.nonce, B = j === void 0 ? void 0 : j, J = t.first, _ = J === void 0 ? !1 : J, U = t.onMounted, V = U === void 0 ? void 0 : U, M = t.onUpdated, Z = M === void 0 ? void 0 : M, z = t.onLoad, ee = z === void 0 ? void 0 : z, T = t.props, b = T === void 0 ? {} : T, S = function() {
  }, W = function(ie) {
    var ye = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    if (l) {
      var ae = Ot(Ot({}, b), ye), se = ae.name || y, Q = ae.id || P, g = ae.nonce || B;
      s.value = l.querySelector('style[data-primevue-style-id="'.concat(se, '"]')) || l.getElementById(Q) || l.createElement("style"), s.value.isConnected || (i.value = ie || e, st(s.value, {
        type: "text/css",
        id: Q,
        media: N,
        nonce: g
      }), _ ? l.head.prepend(s.value) : l.head.appendChild(s.value), mi(s.value, "data-primevue-style-id", se), st(s.value, ae), s.value.onload = function(h) {
        return ee?.(h, {
          name: se
        });
      }, V?.(se)), !n.value && (S = He(i, function(h) {
        s.value.textContent = h, Z?.(se);
      }, {
        immediate: !0
      }), n.value = !0);
    }
  }, F = function() {
    !l || !n.value || (S(), di(s.value) && l.head.removeChild(s.value), n.value = !1, s.value = null);
  };
  return d && !c && Ti(W), {
    id: P,
    name: y,
    el: s,
    css: i,
    unload: F,
    load: W,
    isLoaded: Ln(n)
  };
}
function Ee(e) {
  "@babel/helpers - typeof";
  return Ee = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, Ee(e);
}
var Pt, Tt, Lt, xt;
function jt(e, t) {
  return Ei(e) || Ai(e, t) || Ni(e, t) || ji();
}
function ji() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Ni(e, t) {
  if (e) {
    if (typeof e == "string") return Nt(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Nt(e, t) : void 0;
  }
}
function Nt(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, i = Array(t); n < t; n++) i[n] = e[n];
  return i;
}
function Ai(e, t) {
  var n = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (n != null) {
    var i, s, r, a, l = [], u = !0, d = !1;
    try {
      if (r = (n = n.call(e)).next, t !== 0) for (; !(u = (i = r.call(n)).done) && (l.push(i.value), l.length !== t); u = !0) ;
    } catch (o) {
      d = !0, s = o;
    } finally {
      try {
        if (!u && n.return != null && (a = n.return(), Object(a) !== a)) return;
      } finally {
        if (d) throw s;
      }
    }
    return l;
  }
}
function Ei(e) {
  if (Array.isArray(e)) return e;
}
function At(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var i = Object.getOwnPropertySymbols(e);
    t && (i = i.filter(function(s) {
      return Object.getOwnPropertyDescriptor(e, s).enumerable;
    })), n.push.apply(n, i);
  }
  return n;
}
function Qe(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? At(Object(n), !0).forEach(function(i) {
      Vi(e, i, n[i]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : At(Object(n)).forEach(function(i) {
      Object.defineProperty(e, i, Object.getOwnPropertyDescriptor(n, i));
    });
  }
  return e;
}
function Vi(e, t, n) {
  return (t = Ri(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Ri(e) {
  var t = Di(e, "string");
  return Ee(t) == "symbol" ? t : t + "";
}
function Di(e, t) {
  if (Ee(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var i = n.call(e, t);
    if (Ee(i) != "object") return i;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
function Ue(e, t) {
  return t || (t = e.slice(0)), Object.freeze(Object.defineProperties(e, { raw: { value: Object.freeze(t) } }));
}
var Ii = function(t) {
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
}, Mi = {}, Ui = {}, fe = {
  name: "base",
  css: Ii,
  style: wi,
  classes: Mi,
  inlineStyles: Ui,
  load: function(t) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, i = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : function(r) {
      return r;
    }, s = i(Me(Pt || (Pt = Ue(["", ""])), t));
    return H(s) ? xi(xe(s), Qe({
      name: this.name
    }, n)) : {};
  },
  loadCSS: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    return this.load(this.css, t);
  },
  loadStyle: function() {
    var t = this, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, i = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "";
    return this.load(this.style, n, function() {
      var s = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "";
      return G.transformCSS(n.name || t.name, "".concat(s).concat(Me(Tt || (Tt = Ue(["", ""])), i)));
    });
  },
  getCommonTheme: function(t) {
    return G.getCommon(this.name, t);
  },
  getComponentTheme: function(t) {
    return G.getComponent(this.name, t);
  },
  getDirectiveTheme: function(t) {
    return G.getDirective(this.name, t);
  },
  getPresetTheme: function(t, n, i) {
    return G.getCustomPreset(this.name, t, n, i);
  },
  getLayerOrderThemeCSS: function() {
    return G.getLayerOrderCSS(this.name);
  },
  getStyleSheet: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    if (this.css) {
      var i = oe(this.css, {
        dt: Se
      }) || "", s = xe(Me(Lt || (Lt = Ue(["", "", ""])), i, t)), r = Object.entries(n).reduce(function(a, l) {
        var u = jt(l, 2), d = u[0], o = u[1];
        return a.push("".concat(d, '="').concat(o, '"')) && a;
      }, []).join(" ");
      return H(s) ? '<style type="text/css" data-primevue-style-id="'.concat(this.name, '" ').concat(r, ">").concat(s, "</style>") : "";
    }
    return "";
  },
  getCommonThemeStyleSheet: function(t) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    return G.getCommonStyleSheet(this.name, t, n);
  },
  getThemeStyleSheet: function(t) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, i = [G.getStyleSheet(this.name, t, n)];
    if (this.style) {
      var s = this.name === "base" ? "global-style" : "".concat(this.name, "-style"), r = Me(xt || (xt = Ue(["", ""])), oe(this.style, {
        dt: Se
      })), a = xe(G.transformCSS(s, r)), l = Object.entries(n).reduce(function(u, d) {
        var o = jt(d, 2), c = o[0], v = o[1];
        return u.push("".concat(c, '="').concat(v, '"')) && u;
      }, []).join(" ");
      H(a) && i.push('<style type="text/css" data-primevue-style-id="'.concat(s, '" ').concat(l, ">").concat(a, "</style>"));
    }
    return i.join("");
  },
  extend: function(t) {
    return Qe(Qe({}, this), {}, {
      css: void 0,
      style: void 0
    }, t);
  }
};
function Bi() {
  var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "pc", t = Ut();
  return "".concat(e).concat(t.replace("v-", "").replaceAll("-", "_"));
}
var Et = fe.extend({
  name: "common"
});
function Ve(e) {
  "@babel/helpers - typeof";
  return Ve = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, Ve(e);
}
function zi(e) {
  return sn(e) || Hi(e) || nn(e) || tn();
}
function Hi(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function Pe(e, t) {
  return sn(e) || Wi(e, t) || nn(e, t) || tn();
}
function tn() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function nn(e, t) {
  if (e) {
    if (typeof e == "string") return at(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? at(e, t) : void 0;
  }
}
function at(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, i = Array(t); n < t; n++) i[n] = e[n];
  return i;
}
function Wi(e, t) {
  var n = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (n != null) {
    var i, s, r, a, l = [], u = !0, d = !1;
    try {
      if (r = (n = n.call(e)).next, t === 0) {
        if (Object(n) !== n) return;
        u = !1;
      } else for (; !(u = (i = r.call(n)).done) && (l.push(i.value), l.length !== t); u = !0) ;
    } catch (o) {
      d = !0, s = o;
    } finally {
      try {
        if (!u && n.return != null && (a = n.return(), Object(a) !== a)) return;
      } finally {
        if (d) throw s;
      }
    }
    return l;
  }
}
function sn(e) {
  if (Array.isArray(e)) return e;
}
function Vt(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var i = Object.getOwnPropertySymbols(e);
    t && (i = i.filter(function(s) {
      return Object.getOwnPropertyDescriptor(e, s).enumerable;
    })), n.push.apply(n, i);
  }
  return n;
}
function A(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? Vt(Object(n), !0).forEach(function(i) {
      Le(e, i, n[i]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Vt(Object(n)).forEach(function(i) {
      Object.defineProperty(e, i, Object.getOwnPropertyDescriptor(n, i));
    });
  }
  return e;
}
function Le(e, t, n) {
  return (t = Ki(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Ki(e) {
  var t = qi(e, "string");
  return Ve(t) == "symbol" ? t : t + "";
}
function qi(e, t) {
  if (Ve(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var i = n.call(e, t);
    if (Ve(i) != "object") return i;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var Fi = {
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
        ne.off("theme:change", this._loadCoreStyles), t || (this._loadCoreStyles(), this._themeChangeListener(this._loadCoreStyles));
      }
    },
    dt: {
      immediate: !0,
      handler: function(t, n) {
        var i = this;
        ne.off("theme:change", this._themeScopedListener), t ? (this._loadScopedThemeStyles(t), this._themeScopedListener = function() {
          return i._loadScopedThemeStyles(t);
        }, this._themeChangeListener(this._themeScopedListener)) : this._unloadScopedThemeStyles();
      }
    }
  },
  scopedStyleEl: void 0,
  rootEl: void 0,
  uid: void 0,
  $attrSelector: void 0,
  beforeCreate: function() {
    var t, n, i, s, r, a, l, u, d, o, c, v = (t = this.pt) === null || t === void 0 ? void 0 : t._usept, y = v ? (n = this.pt) === null || n === void 0 || (n = n.originalValue) === null || n === void 0 ? void 0 : n[this.$.type.name] : void 0, C = v ? (i = this.pt) === null || i === void 0 || (i = i.value) === null || i === void 0 ? void 0 : i[this.$.type.name] : this.pt;
    (s = C || y) === null || s === void 0 || (s = s.hooks) === null || s === void 0 || (r = s.onBeforeCreate) === null || r === void 0 || r.call(s);
    var P = (a = this.$primevueConfig) === null || a === void 0 || (a = a.pt) === null || a === void 0 ? void 0 : a._usept, O = P ? (l = this.$primevue) === null || l === void 0 || (l = l.config) === null || l === void 0 || (l = l.pt) === null || l === void 0 ? void 0 : l.originalValue : void 0, N = P ? (u = this.$primevue) === null || u === void 0 || (u = u.config) === null || u === void 0 || (u = u.pt) === null || u === void 0 ? void 0 : u.value : (d = this.$primevue) === null || d === void 0 || (d = d.config) === null || d === void 0 ? void 0 : d.pt;
    (o = N || O) === null || o === void 0 || (o = o[this.$.type.name]) === null || o === void 0 || (o = o.hooks) === null || o === void 0 || (c = o.onBeforeCreate) === null || c === void 0 || c.call(o), this.$attrSelector = Bi(), this.uid = this.$attrs.id || this.$attrSelector.replace("pc", "pv_id_");
  },
  created: function() {
    this._hook("onCreated");
  },
  beforeMount: function() {
    var t;
    this.rootEl = ci(Xe(this.$el) ? this.$el : (t = this.$el) === null || t === void 0 ? void 0 : t.parentElement, "[".concat(this.$attrSelector, "]")), this.rootEl && (this.rootEl.$pc = A({
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
        var n = this._usePT(this._getPT(this.pt, this.$.type.name), this._getOptionValue, "hooks.".concat(t)), i = this._useDefaultPT(this._getOptionValue, "hooks.".concat(t));
        n?.(), i?.();
      }
    },
    _mergeProps: function(t) {
      for (var n = arguments.length, i = new Array(n > 1 ? n - 1 : 0), s = 1; s < n; s++)
        i[s - 1] = arguments[s];
      return Kt(t) ? t.apply(void 0, i) : ze.apply(void 0, i);
    },
    _load: function() {
      Oe.isStyleNameLoaded("base") || (fe.loadCSS(this.$styleOptions), this._loadGlobalStyles(), Oe.setLoadedStyleName("base")), this._loadThemeStyles();
    },
    _loadStyles: function() {
      this._load(), this._themeChangeListener(this._load);
    },
    _loadCoreStyles: function() {
      var t, n;
      !Oe.isStyleNameLoaded((t = this.$style) === null || t === void 0 ? void 0 : t.name) && (n = this.$style) !== null && n !== void 0 && n.name && (Et.loadCSS(this.$styleOptions), this.$options.style && this.$style.loadCSS(this.$styleOptions), Oe.setLoadedStyleName(this.$style.name));
    },
    _loadGlobalStyles: function() {
      var t = this._useGlobalPT(this._getOptionValue, "global.css", this.$params);
      H(t) && fe.load(t, A({
        name: "global"
      }, this.$styleOptions));
    },
    _loadThemeStyles: function() {
      var t, n;
      if (!(this.isUnstyled || this.$theme === "none")) {
        if (!G.isStyleNameLoaded("common")) {
          var i, s, r = ((i = this.$style) === null || i === void 0 || (s = i.getCommonTheme) === null || s === void 0 ? void 0 : s.call(i)) || {}, a = r.primitive, l = r.semantic, u = r.global, d = r.style;
          fe.load(a?.css, A({
            name: "primitive-variables"
          }, this.$styleOptions)), fe.load(l?.css, A({
            name: "semantic-variables"
          }, this.$styleOptions)), fe.load(u?.css, A({
            name: "global-variables"
          }, this.$styleOptions)), fe.loadStyle(A({
            name: "global-style"
          }, this.$styleOptions), d), G.setLoadedStyleName("common");
        }
        if (!G.isStyleNameLoaded((t = this.$style) === null || t === void 0 ? void 0 : t.name) && (n = this.$style) !== null && n !== void 0 && n.name) {
          var o, c, v, y, C = ((o = this.$style) === null || o === void 0 || (c = o.getComponentTheme) === null || c === void 0 ? void 0 : c.call(o)) || {}, P = C.css, O = C.style;
          (v = this.$style) === null || v === void 0 || v.load(P, A({
            name: "".concat(this.$style.name, "-variables")
          }, this.$styleOptions)), (y = this.$style) === null || y === void 0 || y.loadStyle(A({
            name: "".concat(this.$style.name, "-style")
          }, this.$styleOptions), O), G.setLoadedStyleName(this.$style.name);
        }
        if (!G.isStyleNameLoaded("layer-order")) {
          var N, j, B = (N = this.$style) === null || N === void 0 || (j = N.getLayerOrderThemeCSS) === null || j === void 0 ? void 0 : j.call(N);
          fe.load(B, A({
            name: "layer-order",
            first: !0
          }, this.$styleOptions)), G.setLoadedStyleName("layer-order");
        }
      }
    },
    _loadScopedThemeStyles: function(t) {
      var n, i, s, r = ((n = this.$style) === null || n === void 0 || (i = n.getPresetTheme) === null || i === void 0 ? void 0 : i.call(n, t, "[".concat(this.$attrSelector, "]"))) || {}, a = r.css, l = (s = this.$style) === null || s === void 0 ? void 0 : s.load(a, A({
        name: "".concat(this.$attrSelector, "-").concat(this.$style.name)
      }, this.$styleOptions));
      this.scopedStyleEl = l.el;
    },
    _unloadScopedThemeStyles: function() {
      var t;
      (t = this.scopedStyleEl) === null || t === void 0 || (t = t.value) === null || t === void 0 || t.remove();
    },
    _themeChangeListener: function() {
      var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : function() {
      };
      Oe.clearLoadedStyleNames(), ne.on("theme:change", t);
    },
    _removeThemeListeners: function() {
      ne.off("theme:change", this._loadCoreStyles), ne.off("theme:change", this._load), ne.off("theme:change", this._themeScopedListener);
    },
    _getHostInstance: function(t) {
      return t ? this.$options.hostName ? t.$.type.name === this.$options.hostName ? t : this._getHostInstance(t.$parentInstance) : t.$parentInstance : void 0;
    },
    _getPropValue: function(t) {
      var n;
      return this[t] || ((n = this._getHostInstance(this)) === null || n === void 0 ? void 0 : n[t]);
    },
    _getOptionValue: function(t) {
      var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", i = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
      return qt(t, n, i);
    },
    _getPTValue: function() {
      var t, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, i = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", s = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {}, r = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : !0, a = /./g.test(i) && !!s[i.split(".")[0]], l = this._getPropValue("ptOptions") || ((t = this.$primevueConfig) === null || t === void 0 ? void 0 : t.ptOptions) || {}, u = l.mergeSections, d = u === void 0 ? !0 : u, o = l.mergeProps, c = o === void 0 ? !1 : o, v = r ? a ? this._useGlobalPT(this._getPTClassValue, i, s) : this._useDefaultPT(this._getPTClassValue, i, s) : void 0, y = a ? void 0 : this._getPTSelf(n, this._getPTClassValue, i, A(A({}, s), {}, {
        global: v || {}
      })), C = this._getPTDatasets(i);
      return d || !d && y ? c ? this._mergeProps(c, v, y, C) : A(A(A({}, v), y), C) : A(A({}, y), C);
    },
    _getPTSelf: function() {
      for (var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length, i = new Array(n > 1 ? n - 1 : 0), s = 1; s < n; s++)
        i[s - 1] = arguments[s];
      return ze(
        this._usePT.apply(this, [this._getPT(t, this.$name)].concat(i)),
        // Exp; <component :pt="{}"
        this._usePT.apply(this, [this.$_attrsPT].concat(i))
        // Exp; <component :pt:[passthrough_key]:[attribute]="{value}" or <component :pt:[passthrough_key]="() =>{value}"
      );
    },
    _getPTDatasets: function() {
      var t, n, i = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", s = "data-pc-", r = i === "root" && H((t = this.pt) === null || t === void 0 ? void 0 : t["data-pc-section"]);
      return i !== "transition" && A(A({}, i === "root" && A(A(Le({}, "".concat(s, "name"), be(r ? (n = this.pt) === null || n === void 0 ? void 0 : n["data-pc-section"] : this.$.type.name)), r && Le({}, "".concat(s, "extend"), be(this.$.type.name))), {}, Le({}, "".concat(this.$attrSelector), ""))), {}, Le({}, "".concat(s, "section"), be(i)));
    },
    _getPTClassValue: function() {
      var t = this._getOptionValue.apply(this, arguments);
      return pe(t) || ai(t) ? {
        class: t
      } : t;
    },
    _getPT: function(t) {
      var n = this, i = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", s = arguments.length > 2 ? arguments[2] : void 0, r = function(l) {
        var u, d = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1, o = s ? s(l) : l, c = be(i), v = be(n.$name);
        return (u = d ? c !== v ? o?.[c] : void 0 : o?.[c]) !== null && u !== void 0 ? u : o;
      };
      return t != null && t.hasOwnProperty("_usept") ? {
        _usept: t._usept,
        originalValue: r(t.originalValue),
        value: r(t.value)
      } : r(t, !0);
    },
    _usePT: function(t, n, i, s) {
      var r = function(P) {
        return n(P, i, s);
      };
      if (t != null && t.hasOwnProperty("_usept")) {
        var a, l = t._usept || ((a = this.$primevueConfig) === null || a === void 0 ? void 0 : a.ptOptions) || {}, u = l.mergeSections, d = u === void 0 ? !0 : u, o = l.mergeProps, c = o === void 0 ? !1 : o, v = r(t.originalValue), y = r(t.value);
        return v === void 0 && y === void 0 ? void 0 : pe(y) ? y : pe(v) ? v : d || !d && y ? c ? this._mergeProps(c, v, y) : A(A({}, v), y) : y;
      }
      return r(t);
    },
    _useGlobalPT: function(t, n, i) {
      return this._usePT(this.globalPT, t, n, i);
    },
    _useDefaultPT: function(t, n, i) {
      return this._usePT(this.defaultPT, t, n, i);
    },
    ptm: function() {
      var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
      return this._getPTValue(this.pt, t, A(A({}, this.$params), n));
    },
    ptmi: function() {
      var t, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", i = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, s = ze(this.$_attrsWithoutPT, this.ptm(n, i));
      return s?.hasOwnProperty("id") && ((t = s.id) !== null && t !== void 0 || (s.id = this.$id)), s;
    },
    ptmo: function() {
      var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", i = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
      return this._getPTValue(t, n, A({
        instance: this
      }, i), !1);
    },
    cx: function() {
      var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
      return this.isUnstyled ? void 0 : this._getOptionValue(this.$style.classes, t, A(A({}, this.$params), n));
    },
    sx: function() {
      var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0, i = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
      if (n) {
        var s = this._getOptionValue(this.$style.inlineStyles, t, A(A({}, this.$params), i)), r = this._getOptionValue(Et.inlineStyles, t, A(A({}, this.$params), i));
        return [r, s];
      }
    }
  },
  computed: {
    globalPT: function() {
      var t, n = this;
      return this._getPT((t = this.$primevueConfig) === null || t === void 0 ? void 0 : t.pt, void 0, function(i) {
        return oe(i, {
          instance: n
        });
      });
    },
    defaultPT: function() {
      var t, n = this;
      return this._getPT((t = this.$primevueConfig) === null || t === void 0 ? void 0 : t.pt, void 0, function(i) {
        return n._getOptionValue(i, n.$name, A({}, n.$params)) || oe(i, A({}, n.$params));
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
      return Object.fromEntries(Object.entries(this.$props).filter(function(i) {
        var s = Pe(i, 1), r = s[0];
        return n?.includes(r);
      }));
    },
    $theme: function() {
      var t;
      return (t = this.$primevueConfig) === null || t === void 0 ? void 0 : t.theme;
    },
    $style: function() {
      return A(A({
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
        var n = Pe(t, 1), i = n[0];
        return i?.startsWith("pt:");
      }).reduce(function(t, n) {
        var i = Pe(n, 2), s = i[0], r = i[1], a = s.split(":"), l = zi(a), u = at(l).slice(1);
        return u?.reduce(function(d, o, c, v) {
          return !d[o] && (d[o] = c === v.length - 1 ? r : {}), d[o];
        }, t), t;
      }, {});
    },
    $_attrsWithoutPT: function() {
      return Object.entries(this.$attrs || {}).filter(function(t) {
        var n = Pe(t, 1), i = n[0];
        return !(i != null && i.startsWith("pt:"));
      }).reduce(function(t, n) {
        var i = Pe(n, 2), s = i[0], r = i[1];
        return t[s] = r, t;
      }, {});
    }
  }
}, Gi = `
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
`, Zi = fe.extend({
  name: "baseicon",
  css: Gi
});
function Re(e) {
  "@babel/helpers - typeof";
  return Re = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, Re(e);
}
function Rt(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var i = Object.getOwnPropertySymbols(e);
    t && (i = i.filter(function(s) {
      return Object.getOwnPropertyDescriptor(e, s).enumerable;
    })), n.push.apply(n, i);
  }
  return n;
}
function Dt(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? Rt(Object(n), !0).forEach(function(i) {
      Yi(e, i, n[i]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Rt(Object(n)).forEach(function(i) {
      Object.defineProperty(e, i, Object.getOwnPropertyDescriptor(n, i));
    });
  }
  return e;
}
function Yi(e, t, n) {
  return (t = Xi(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Xi(e) {
  var t = Ji(e, "string");
  return Re(t) == "symbol" ? t : t + "";
}
function Ji(e, t) {
  if (Re(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var i = n.call(e, t);
    if (Re(i) != "object") return i;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var Qi = {
  name: "BaseIcon",
  extends: Fi,
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
  style: Zi,
  provide: function() {
    return {
      $pcIcon: this,
      $parentInstance: this
    };
  },
  methods: {
    pti: function() {
      var t = Ye(this.label);
      return Dt(Dt({}, !this.isUnstyled && {
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
}, on = {
  name: "SpinnerIcon",
  extends: Qi
};
function es(e) {
  return ss(e) || is(e) || ns(e) || ts();
}
function ts() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function ns(e, t) {
  if (e) {
    if (typeof e == "string") return rt(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? rt(e, t) : void 0;
  }
}
function is(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function ss(e) {
  if (Array.isArray(e)) return rt(e);
}
function rt(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, i = Array(t); n < t; n++) i[n] = e[n];
  return i;
}
function os(e, t, n, i, s, r) {
  return f(), $("svg", ze({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), es(t[0] || (t[0] = [m("path", {
    d: "M6.99701 14C5.85441 13.999 4.72939 13.7186 3.72012 13.1832C2.71084 12.6478 1.84795 11.8737 1.20673 10.9284C0.565504 9.98305 0.165424 8.89526 0.041387 7.75989C-0.0826496 6.62453 0.073125 5.47607 0.495122 4.4147C0.917119 3.35333 1.59252 2.4113 2.46241 1.67077C3.33229 0.930247 4.37024 0.413729 5.4857 0.166275C6.60117 -0.0811796 7.76026 -0.0520535 8.86188 0.251112C9.9635 0.554278 10.9742 1.12227 11.8057 1.90555C11.915 2.01493 11.9764 2.16319 11.9764 2.31778C11.9764 2.47236 11.915 2.62062 11.8057 2.73C11.7521 2.78503 11.688 2.82877 11.6171 2.85864C11.5463 2.8885 11.4702 2.90389 11.3933 2.90389C11.3165 2.90389 11.2404 2.8885 11.1695 2.85864C11.0987 2.82877 11.0346 2.78503 10.9809 2.73C9.9998 1.81273 8.73246 1.26138 7.39226 1.16876C6.05206 1.07615 4.72086 1.44794 3.62279 2.22152C2.52471 2.99511 1.72683 4.12325 1.36345 5.41602C1.00008 6.70879 1.09342 8.08723 1.62775 9.31926C2.16209 10.5513 3.10478 11.5617 4.29713 12.1803C5.48947 12.7989 6.85865 12.988 8.17414 12.7157C9.48963 12.4435 10.6711 11.7264 11.5196 10.6854C12.3681 9.64432 12.8319 8.34282 12.8328 7C12.8328 6.84529 12.8943 6.69692 13.0038 6.58752C13.1132 6.47812 13.2616 6.41667 13.4164 6.41667C13.5712 6.41667 13.7196 6.47812 13.8291 6.58752C13.9385 6.69692 14 6.84529 14 7C14 8.85651 13.2622 10.637 11.9489 11.9497C10.6356 13.2625 8.85432 14 6.99701 14Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
on.render = os;
const ce = /* @__PURE__ */ X({
  __name: "Button",
  props: {
    icon: {},
    variant: { default: "primary" },
    type: { default: "button" },
    loading: { type: Boolean },
    disabled: { type: Boolean },
    small: { type: Boolean }
  },
  emits: ["click"],
  setup(e, { emit: t }) {
    const n = e, i = t, s = K(
      () => n.variant === "danger" ? "danger" : n.variant === "primary" ? void 0 : "secondary"
    );
    return (r, a) => (f(), D(p(zt), {
      type: e.type,
      severity: s.value,
      outlined: e.variant === "ghost",
      loading: e.loading,
      disabled: e.disabled || e.loading,
      size: e.small ? "small" : void 0,
      onClick: a[0] || (a[0] = (l) => i("click"))
    }, {
      default: E(() => [
        e.loading ? (f(), D(p(on), {
          key: 0,
          class: "p-button-loading-icon p-button-icon",
          spin: ""
        })) : x("", !0),
        e.icon && !e.loading ? (f(), D(p(q), {
          key: 1,
          icon: e.icon,
          "aria-hidden": "true"
        }, null, 8, ["icon"])) : x("", !0),
        he(r.$slots, "default")
      ]),
      _: 3
    }, 8, ["type", "severity", "outlined", "loading", "disabled", "size"]));
  }
}), as = { class: "km-search" }, rs = ["value", "placeholder"], It = /* @__PURE__ */ X({
  __name: "SearchField",
  props: {
    modelValue: {},
    placeholder: {}
  },
  emits: ["update:modelValue"],
  setup(e, { emit: t }) {
    const n = t;
    return (i, s) => (f(), $("div", as, [
      w(p(q), {
        icon: "tabler:search",
        class: "km-search-ico",
        "aria-hidden": "true"
      }),
      m("input", {
        class: "km-search-input",
        value: e.modelValue,
        placeholder: e.placeholder || "Search",
        onInput: s[0] || (s[0] = (r) => n("update:modelValue", r.target.value))
      }, null, 40, rs),
      e.modelValue ? (f(), $("button", {
        key: 0,
        class: "km-search-clear",
        "aria-label": "Clear search",
        onClick: s[1] || (s[1] = (r) => n("update:modelValue", ""))
      }, [
        w(p(q), {
          icon: "tabler:x",
          "aria-hidden": "true"
        })
      ])) : x("", !0)
    ]));
  }
}), ls = { class: "km-field" }, us = { class: "km-field-label" }, ds = {
  key: 0,
  class: "km-field-help"
}, _e = /* @__PURE__ */ X({
  __name: "FormField",
  props: {
    label: {},
    help: {}
  },
  setup(e) {
    return (t, n) => (f(), $("label", ls, [
      m("span", us, L(e.label), 1),
      he(t.$slots, "default"),
      e.help ? (f(), $("small", ds, L(e.help), 1)) : x("", !0)
    ]));
  }
}), cs = ["type", "value", "placeholder", "readonly", "disabled", "autocomplete", "min", "max", "step"], Be = /* @__PURE__ */ X({
  __name: "TextInput",
  props: {
    modelValue: {},
    type: { default: "text" },
    placeholder: {},
    readonly: { type: Boolean },
    disabled: { type: Boolean },
    autocomplete: {},
    min: {},
    max: {},
    step: {},
    mono: { type: Boolean }
  },
  emits: ["update:modelValue"],
  setup(e, { emit: t }) {
    const n = t;
    function i(s) {
      const r = s.target;
      n("update:modelValue", r.value);
    }
    return (s, r) => (f(), $("input", {
      class: ve(["km-input", e.mono && "mono"]),
      type: e.type,
      value: e.modelValue,
      placeholder: e.placeholder,
      readonly: e.readonly,
      disabled: e.disabled,
      autocomplete: e.autocomplete,
      min: e.min,
      max: e.max,
      step: e.step,
      onInput: i
    }, null, 42, cs));
  }
}), ps = {
  key: 0,
  class: "km-pill-dot",
  "aria-hidden": "true"
}, Ge = /* @__PURE__ */ X({
  __name: "Pill",
  props: {
    severity: { default: "secondary" },
    dot: { type: Boolean },
    icon: {}
  },
  setup(e) {
    return (t, n) => (f(), D(p(Rn), {
      severity: e.severity || void 0,
      class: "km-pill kx-tag-sm"
    }, {
      default: E(() => [
        e.dot ? (f(), $("span", ps)) : e.icon ? (f(), D(p(q), {
          key: 1,
          icon: e.icon,
          "aria-hidden": "true"
        }, null, 8, ["icon"])) : x("", !0),
        he(t.$slots, "default")
      ]),
      _: 3
    }, 8, ["severity"]));
  }
}), ms = { class: "km-notice-text" }, Ze = /* @__PURE__ */ X({
  __name: "Notice",
  props: {
    severity: { default: "info" }
  },
  emits: ["dismiss"],
  setup(e, { emit: t }) {
    const n = t, i = (s) => s === "danger" ? "tabler:alert-triangle" : s === "success" ? "tabler:circle-check" : "tabler:info-circle";
    return (s, r) => (f(), $("div", {
      class: ve(["km-notice", `is-${e.severity}`]),
      role: "status"
    }, [
      w(p(q), {
        icon: i(e.severity),
        "aria-hidden": "true"
      }, null, 8, ["icon"]),
      m("span", ms, [
        he(s.$slots, "default")
      ]),
      m("button", {
        class: "km-notice-x",
        "aria-label": "Dismiss",
        onClick: r[0] || (r[0] = (a) => n("dismiss"))
      }, [
        w(p(q), {
          icon: "tabler:x",
          "aria-hidden": "true"
        })
      ])
    ], 2));
  }
}), fs = { class: "km-loading" }, vs = { key: 0 }, an = /* @__PURE__ */ X({
  __name: "Spinner",
  props: {
    label: {}
  },
  setup(e) {
    return (t, n) => (f(), $("div", fs, [
      w(p(Dn), {
        style: { width: "22px", height: "22px", margin: "0" },
        "aria-label": e.label || "Loading"
      }, null, 8, ["aria-label"]),
      e.label ? (f(), $("span", vs, L(e.label), 1)) : x("", !0)
    ]));
  }
}), hs = { class: "km-empty" }, ys = { class: "km-empty-title" }, gs = {
  key: 0,
  class: "km-empty-hint"
}, bs = /* @__PURE__ */ X({
  __name: "EmptyState",
  props: {
    icon: {},
    title: {},
    hint: {},
    cta: {},
    ctaIcon: {}
  },
  emits: ["cta"],
  setup(e, { emit: t }) {
    const n = t;
    return (i, s) => (f(), $("div", hs, [
      w(p(q), {
        icon: e.icon,
        class: "km-empty-ico",
        "aria-hidden": "true"
      }, null, 8, ["icon"]),
      m("div", ys, L(e.title), 1),
      e.hint ? (f(), $("p", gs, L(e.hint), 1)) : x("", !0),
      e.cta ? (f(), D(ce, {
        key: 1,
        icon: e.ctaIcon,
        onClick: s[0] || (s[0] = (r) => n("cta"))
      }, {
        default: E(() => [
          R(L(e.cta), 1)
        ]),
        _: 1
      }, 8, ["icon"])) : x("", !0)
    ]));
  }
}), ks = { class: "kx-wcmount" }, Ss = {
  key: 0,
  class: "kx-wcmount-fail",
  role: "alert"
}, $s = /* @__PURE__ */ X({
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
  setup(e, { emit: t }) {
    const n = e, i = t, s = I(null), r = I(!1);
    let a = null, l = 0;
    const u = /* @__PURE__ */ new Set();
    function d(_) {
      _.composedPath()[0] === a && (_.stopPropagation(), i("change", _.detail));
    }
    function o(_) {
      return _.composedPath()[0] !== a ? !1 : (_.stopPropagation(), !0);
    }
    function c(_) {
      o(_) && i("select", _.detail);
    }
    function v(_) {
      o(_) && i("created", _.detail);
    }
    function y(_) {
      o(_) && i("close", _.detail);
    }
    function C(_) {
      o(_) && i("error", _.detail);
    }
    function P(_) {
      if (typeof _ == "string") return _;
      try {
        return JSON.stringify(_ ?? {});
      } catch {
        return null;
      }
    }
    function O() {
      if (!a) return;
      const _ = P(n.config);
      if (_ !== null && a.setAttribute("config", _), n.schema !== void 0 && n.schema !== null) {
        const V = P(n.schema);
        V !== null && a.setAttribute("schema", V);
      }
      if (n.meta !== void 0 && n.meta !== null) {
        const V = P(n.meta);
        V !== null && a.setAttribute("meta", V);
      }
      n.provider && a.setAttribute("provider", n.provider), n.label && a.setAttribute("label", n.label);
      const U = n.attrs || {};
      for (const V of [...u])
        (!(V in U) || U[V] == null) && (a.removeAttribute(V), u.delete(V));
      for (const [V, M] of Object.entries(U)) {
        if (M == null) continue;
        const Z = typeof M == "object" ? P(M) : String(M);
        Z !== null && (a.setAttribute(V, Z), u.add(V));
      }
    }
    function N(_ = a) {
      _ && (_.removeEventListener("config-changed", d), _.removeEventListener("change", d), _.removeEventListener("select", c), _.removeEventListener("created", v), _.removeEventListener("close", y), _.removeEventListener("error", C), _ === a && (a = null), u.clear());
    }
    async function j(_) {
      if (!customElements.get(_))
        try {
          await Nn(_, { timeoutMs: 8e3 });
        } catch {
        }
    }
    async function B() {
      const _ = ++l, U = s.value, V = n.tag;
      if (r.value = !1, !!U && (N(), U.innerHTML = "", !!V))
        try {
          if (await j(V), _ !== l || s.value !== U || n.tag !== V) return;
          const M = document.createElement(V);
          M.classList.add("kx-wcmount-surface"), a = M, O(), M.addEventListener("config-changed", d), M.addEventListener("change", d), M.addEventListener("select", c), M.addEventListener("created", v), M.addEventListener("close", y), M.addEventListener("error", C), M.style.display = "block", U.appendChild(M), r.value = !customElements.get(V);
        } catch {
          _ === l && (r.value = !0);
        }
    }
    async function J() {
      r.value = !1, await lt(), await B();
    }
    return Mt(B), He(() => n.tag, B), He(() => [n.config, n.schema, n.meta, n.provider, n.label, n.attrs], O, { deep: !0 }), xn(() => {
      l += 1, N();
    }), (_, U) => (f(), $("div", ks, [
      r.value ? (f(), $("div", Ss, [
        U[0] || (U[0] = m("span", null, "This setup panel couldn’t load.", -1)),
        m("button", {
          type: "button",
          onClick: J
        }, "Try again")
      ])) : (f(), $("div", {
        key: 1,
        ref_key: "host",
        ref: s
      }, null, 512))
    ]));
  }
}), _s = (e, t) => {
  const n = e.__vccOpts || e;
  for (const [i, s] of t)
    n[i] = s;
  return n;
}, et = /* @__PURE__ */ _s($s, [["__scopeId", "data-v-3d6a00f1"]]);
function je(e, t) {
  const n = e?.response?.data ?? e?.data;
  return typeof n?.error == "string" && n.error ? n.error : typeof n?.message == "string" && n.message ? n.message : e instanceof Error ? e.message : t;
}
function ws() {
  const e = I([]), t = I([]), n = I(!0), i = I(!1), s = I("");
  let r = 0;
  async function a() {
    const d = ++r;
    n.value = !0, s.value = "";
    try {
      const [o, c] = await Promise.all([
        ge.get("/api/v1/security/scopes"),
        ge.get("/api/v1/security/policies")
      ]);
      if (d !== r) return;
      e.value = o.data?.scopes ?? [], t.value = c.data?.policies ?? [];
    } catch (o) {
      d === r && (s.value = je(o, "failed to load security"));
    } finally {
      d === r && (n.value = !1);
    }
  }
  async function l(d) {
    i.value = !0, s.value = "";
    try {
      return await ge.post("/api/v1/security/scopes", d), await a(), !0;
    } catch (o) {
      return s.value = je(o, "failed to save scope"), !1;
    } finally {
      i.value = !1;
    }
  }
  async function u(d) {
    i.value = !0, s.value = "";
    try {
      return await ge.delete(`/api/v1/security/scopes?slug=${encodeURIComponent(d)}`), await a(), !0;
    } catch (o) {
      return s.value = je(o, "failed to delete scope"), !1;
    } finally {
      i.value = !1;
    }
  }
  return { scopes: e, policies: t, loading: n, saving: i, error: s, load: a, saveScope: l, deleteScope: u };
}
function Cs() {
  const e = I([]), t = I(!1), n = I(!1), i = I(""), s = I(""), r = I(null);
  let a = 0;
  async function l() {
    const o = ++a;
    t.value = !0, i.value = "";
    try {
      const { data: c } = await ge.get("/api/v1/security/delegations");
      if (c?.success !== !0 || !Array.isArray(c.delegations))
        throw new Error(c?.error || "Delegation inventory is unconfirmed");
      o === a && (e.value = c.delegations);
    } catch (c) {
      o === a && (i.value = je(c, "Could not load run-as permissions"));
    } finally {
      o === a && (t.value = !1);
    }
  }
  async function u() {
    if (!r.value || n.value) return;
    const o = r.value;
    n.value = !0, i.value = "", s.value = "";
    try {
      const { data: c } = o.method === "save" ? await ge.post("/api/v1/security/delegations", o.request) : await ge.delete("/api/v1/security/delegations", { data: o.request });
      if (c?.success !== !0) throw new Error(c?.error || "Run-as request is unconfirmed");
      r.value = null, s.value = o.method === "save" ? "Run-as permission saved" : "Run-as permission revoked", await l();
    } catch (c) {
      i.value = je(c, "Could not confirm run-as request");
      const v = c?.response?.status;
      v && v >= 400 && v < 500 && (r.value = null);
    } finally {
      n.value = !1;
    }
  }
  async function d(o, c) {
    r.value || n.value || (r.value = { method: o, request: {
      ...c,
      principal: { ...c.principal },
      ...c.groups ? { groups: [...c.groups].sort() } : {}
    } }, await u());
  }
  return { delegations: e, loading: t, saving: n, error: i, confirmation: s, pending: r, load: l, mutate: d, submit: u };
}
const Os = {
  class: "ks-runas",
  "aria-label": "Run-as permissions"
}, Ps = { class: "ks-runas-head" }, Ts = { class: "ks-runas-acts" }, Ls = {
  key: 0,
  role: "alert"
}, xs = { class: "ks-runas-form-head" }, js = ["disabled", "inert"], Ns = { class: "ks-runas-steps" }, As = {
  key: 0,
  class: "ks-runas-chips",
  "aria-label": "Selected groups"
}, Es = { class: "ks-runas-component-options" }, Vs = ["for"], Rs = ["for"], Ds = { class: "ks-runas-form-foot" }, Is = {
  key: 3,
  class: "ks-runas-pending"
}, Ms = {
  key: 5,
  class: "ks-runas-list"
}, Us = { class: "ks-runas-grant-body" }, Bs = { class: "ks-runas-grant-line" }, zs = {
  key: 0,
  class: "ks-runas-who"
}, Hs = { class: "ks-runas-verb" }, Ws = { class: "ks-runas-who" }, Ks = { class: "ks-runas-grant-meta" }, qs = { key: 0 }, Fs = { key: 1 }, Gs = { key: 2 }, Zs = {
  key: 6,
  class: "ks-runas-empty"
}, Ys = /* @__PURE__ */ X({
  __name: "Delegations",
  props: {
    scopes: {}
  },
  setup(e, { expose: t }) {
    const n = e, i = Cs(), { delegations: s, loading: r, saving: a, error: l, confirmation: u, pending: d } = i, o = I(!1), c = I(""), v = I(""), y = I(!0), C = Ut(), P = I([]), O = K(() => a.value || !!d.value), N = K(() => !!c.value && P.value.length > 0 && (y.value || !!v.value)), j = K(() => {
      const T = {};
      for (const b of n.scopes) T[b.id] = b.label || b.id;
      return T;
    }), B = I({});
    He(s, async (T) => {
      const b = [...new Set(T.map((S) => S.principal.id))].filter((S) => !B.value[S]);
      if (b.length)
        try {
          const { data: S } = await ge.post("/api/v1/principals/resolve", { refs: b.map((F) => ({ type: "user", id: F })) }), W = { ...B.value };
          for (const F of Array.isArray(S?.principals) ? S.principals : [])
            F && typeof F.id == "string" && typeof F.label == "string" && (W[F.id] = F.label);
          B.value = W;
        } catch (S) {
          l.value = S && typeof S == "object" && "message" in S ? String(S.message) : "Could not resolve account names";
        }
    });
    const J = K(() => s.value.filter((T) => T.active)), _ = K(() => s.value.filter((T) => !T.active));
    function U(T, b) {
      if (!T || typeof T != "object") return;
      const S = T;
      O.value || S.type !== b || typeof S.id != "string" || (b === "user" ? c.value = S.id : S.id && !P.value.some((W) => W.id === S.id) && P.value.push({ id: S.id, label: typeof S.label == "string" ? S.label : S.id }));
    }
    function V(T) {
      const b = T && typeof T == "object" ? T.thread_id : void 0;
      !O.value && typeof b == "string" && (v.value = b);
    }
    function M(T) {
      l.value = T && typeof T == "object" && "message" in T ? String(T.message) : "Could not load the picker";
    }
    function Z() {
      c.value = "", v.value = "", y.value = !0, P.value = [], o.value = !0;
    }
    async function z() {
      N.value && (await i.mutate("save", {
        principal: { kind: "user", id: c.value },
        root: y.value ? "*" : v.value,
        groups: P.value.map((T) => T.id)
      }), !l.value && !d.value && (o.value = !1));
    }
    async function ee(T) {
      await Bt.confirm({
        header: "Revoke run-as permission?",
        message: `Members of ${T.groups.map((S) => j.value[S] || S).join(", ")} can no longer choose ${B.value[T.principal.id] || T.principal.id} in the Run as setting.`,
        icon: "tabler:user-off",
        acceptLabel: "Revoke",
        rejectLabel: "Cancel",
        acceptClass: "p-button-danger"
      }) && await i.mutate("revoke", { principal: T.principal, root: T.root });
    }
    return t({ load: i.load }), (T, b) => (f(), $("section", Os, [
      m("header", Ps, [
        b[9] || (b[9] = m("div", null, [
          m("h2", { class: "ks-runas-title" }, "Run-as permissions"),
          m("p", { class: "ks-runas-lede" }, [
            R(" Agents, automations and workflows run with the access of the account set in their "),
            m("b", null, "Run as"),
            R(" setting. A permission lets members of a group choose a specific account there, typically a bot account, so the component works with that account's access instead of their own. ")
          ])
        ], -1)),
        m("div", Ts, [
          w(p(qe), {
            icon: "tabler:refresh",
            label: "Refresh",
            disabled: p(r) || O.value,
            spin: p(r),
            onClick: p(i).load
          }, null, 8, ["disabled", "spin", "onClick"]),
          o.value ? x("", !0) : (f(), D(p(ce), {
            key: 0,
            variant: "primary",
            small: "",
            icon: "tabler:plus",
            disabled: O.value,
            onClick: Z
          }, {
            default: E(() => [...b[8] || (b[8] = [
              R("New permission", -1)
            ])]),
            _: 1
          }, 8, ["disabled"]))
        ])
      ]),
      p(l) ? (f(), $("div", Ls, [
        w(p(Ze), {
          severity: "danger",
          onDismiss: b[0] || (b[0] = (S) => l.value = "")
        }, {
          default: E(() => [
            R(L(p(l)), 1)
          ]),
          _: 1
        })
      ])) : x("", !0),
      p(u) ? (f(), D(p(Ze), {
        key: 1,
        "data-test": "delegation-confirmation",
        severity: "success",
        onDismiss: b[1] || (b[1] = (S) => u.value = "")
      }, {
        default: E(() => [
          R(L(p(u)), 1)
        ]),
        _: 1
      })) : x("", !0),
      o.value ? (f(), $("form", {
        key: 2,
        class: "ks-runas-form",
        onSubmit: we(z, ["prevent"])
      }, [
        m("div", xs, [
          b[10] || (b[10] = m("span", null, "New run-as permission", -1)),
          w(p(qe), {
            icon: "tabler:x",
            label: "Cancel",
            disabled: O.value,
            onClick: b[2] || (b[2] = (S) => o.value = !1)
          }, null, 8, ["disabled"])
        ]),
        m("fieldset", {
          disabled: O.value,
          inert: O.value
        }, [
          m("ol", Ns, [
            m("li", null, [
              w(p(_e), {
                label: "Account to run as",
                help: "The account whose access the component uses. Its group memberships decide what the component can do."
              }, {
                default: E(() => [
                  w(et, {
                    tag: "wc-principal-picker",
                    attrs: { kinds: "user", placeholder: "Choose an account…" },
                    config: { principal_id: c.value },
                    onChange: b[3] || (b[3] = (S) => U(S, "user")),
                    onError: M
                  }, null, 8, ["config"])
                ]),
                _: 1
              })
            ]),
            m("li", null, [
              w(p(_e), {
                label: "Who may choose it",
                help: "Members of these groups see this account in the Run as setting. Nobody's group membership changes."
              }, {
                default: E(() => [
                  w(et, {
                    tag: "wc-principal-picker",
                    attrs: { kinds: "group", placeholder: "Add a group…" },
                    config: {},
                    onChange: b[4] || (b[4] = (S) => U(S, "group")),
                    onError: M
                  })
                ]),
                _: 1
              }),
              P.value.length ? (f(), $("div", As, [
                (f(!0), $(le, null, ue(P.value, (S) => (f(), D(p(In), {
                  key: S.id,
                  label: S.label,
                  removable: !O.value,
                  pt: { removeIcon: { "aria-label": `Remove group ${S.label}` } },
                  onRemove: (W) => P.value = P.value.filter((F) => F.id !== S.id)
                }, null, 8, ["label", "removable", "pt", "onRemove"]))), 128))
              ])) : x("", !0)
            ]),
            m("li", null, [
              m("fieldset", null, [
                b[13] || (b[13] = m("legend", { class: "km-field-label" }, "On which components", -1)),
                m("div", Es, [
                  m("label", {
                    class: "ks-runas-component-option",
                    for: `${p(C)}-any`
                  }, [
                    w(p(ft), {
                      modelValue: y.value,
                      "onUpdate:modelValue": b[5] || (b[5] = (S) => y.value = S),
                      "input-id": `${p(C)}-any`,
                      name: p(C),
                      value: !0,
                      disabled: O.value
                    }, null, 8, ["modelValue", "input-id", "name", "disabled"]),
                    b[11] || (b[11] = R(" Any component ", -1))
                  ], 8, Vs),
                  m("label", {
                    class: "ks-runas-component-option",
                    for: `${p(C)}-one`
                  }, [
                    w(p(ft), {
                      modelValue: y.value,
                      "onUpdate:modelValue": b[6] || (b[6] = (S) => y.value = S),
                      "input-id": `${p(C)}-one`,
                      name: p(C),
                      value: !1,
                      disabled: O.value
                    }, null, 8, ["modelValue", "input-id", "name", "disabled"]),
                    b[12] || (b[12] = R(" One component ", -1))
                  ], 8, Rs)
                ]),
                b[14] || (b[14] = m("small", { class: "km-field-help" }, "The person choosing the account must also be able to manage the component.", -1))
              ]),
              y.value ? x("", !0) : (f(), D(et, {
                key: 0,
                class: "ks-runas-component",
                tag: "wc-component-picker",
                attrs: { source: "/api/v1/security/delegations/roots", title: "Component", placeholder: "Choose a component you manage…" },
                config: v.value ? { thread_id: v.value } : {},
                onChange: V,
                onError: M
              }, null, 8, ["config"]))
            ])
          ])
        ], 8, js),
        m("div", Ds, [
          w(p(ce), {
            variant: "ghost",
            small: "",
            disabled: O.value,
            onClick: b[7] || (b[7] = (S) => o.value = !1)
          }, {
            default: E(() => [...b[15] || (b[15] = [
              R("Cancel", -1)
            ])]),
            _: 1
          }, 8, ["disabled"]),
          w(p(ce), {
            variant: "primary",
            small: "",
            icon: "tabler:device-floppy",
            disabled: !N.value || O.value,
            loading: p(a),
            onClick: z
          }, {
            default: E(() => [...b[16] || (b[16] = [
              R("Save permission", -1)
            ])]),
            _: 1
          }, 8, ["disabled", "loading"])
        ])
      ], 32)) : x("", !0),
      p(d) && !p(a) ? (f(), $("div", Is, [
        b[18] || (b[18] = m("span", null, "The result is unconfirmed. Retry the same request before editing this permission.", -1)),
        w(p(ce), {
          small: "",
          onClick: p(i).submit
        }, {
          default: E(() => [...b[17] || (b[17] = [
            R("Retry", -1)
          ])]),
          _: 1
        }, 8, ["onClick"])
      ])) : x("", !0),
      p(r) && !p(s).length ? (f(), D(p(an), {
        key: 4,
        label: "Loading run-as permissions…"
      })) : J.value.length || _.value.length ? (f(), $("div", Ms, [
        (f(!0), $(le, null, ue([...J.value, ..._.value], (S) => (f(), $("article", {
          key: S.policy_id,
          class: ve(["ks-runas-grant", { revoked: !S.active }])
        }, [
          w(p(q), {
            class: "ks-runas-grant-icon",
            icon: "tabler:user-shield",
            "aria-hidden": "true"
          }),
          m("div", Us, [
            m("div", Bs, [
              S.active ? (f(), $("span", zs, L(S.groups.map((W) => j.value[W] || W).join(", ")), 1)) : x("", !0),
              m("span", Hs, L(S.active ? "can run as" : "Permission to run as"), 1),
              m("span", Ws, L(B.value[S.principal.id] || S.principal.id), 1)
            ]),
            m("div", Ks, [
              S.root === "*" ? (f(), $("span", qs, "on any component they manage")) : S.root_label ? (f(), $("span", Fs, [
                b[19] || (b[19] = R("on ", -1)),
                m("b", null, L(S.root_label), 1)
              ])) : (f(), $("span", Gs, [
                b[20] || (b[20] = R("on component ", -1)),
                m("code", null, L(S.root), 1)
              ]))
            ])
          ]),
          S.active ? (f(), D(p(ce), {
            key: 1,
            variant: "ghost",
            small: "",
            icon: "tabler:user-off",
            disabled: O.value,
            "aria-label": `Revoke run-as permission for ${B.value[S.principal.id] || S.principal.id}`,
            onClick: (W) => ee(S)
          }, {
            default: E(() => [...b[22] || (b[22] = [
              R("Revoke", -1)
            ])]),
            _: 1
          }, 8, ["disabled", "aria-label", "onClick"])) : (f(), D(p(Ge), {
            key: 0,
            severity: "secondary"
          }, {
            default: E(() => [...b[21] || (b[21] = [
              R("revoked", -1)
            ])]),
            _: 1
          }))
        ], 2))), 128))
      ])) : !p(l) && !o.value ? (f(), $("div", Zs, [
        w(p(q), {
          icon: "tabler:user-shield",
          "aria-hidden": "true"
        }),
        b[23] || (b[23] = m("b", null, "No run-as permissions yet", -1)),
        b[24] || (b[24] = m("span", null, [
          R("Until a group gets a permission, the Run as setting offers only "),
          m("b", null, "Me"),
          R(".")
        ], -1))
      ])) : x("", !0)
    ]));
  }
}), Xs = ["draggable"], Js = { class: "ks-pcard-row" }, Qs = { class: "ks-pcard-body" }, eo = { class: "ks-pcard-head" }, to = ["title"], no = {
  key: 0,
  class: "ks-pcard-comment"
}, io = ["aria-label", "aria-expanded"], so = ["aria-label"], oo = ["aria-label"], ao = {
  key: 0,
  class: "ks-pcard-detail"
}, ro = { class: "ks-pcard-kv" }, lo = {
  key: 0,
  class: "ks-pcard-kv"
}, uo = { class: "ks-pcard-kv" }, co = { class: "ks-pcard-kv" }, po = { class: "ks-pcard-tags" }, mo = {
  key: 0,
  class: "ks-pcard-none"
}, fo = { class: "ks-pcard-kv" }, vo = { class: "ks-pcard-tags" }, ho = {
  key: 0,
  class: "ks-pcard-none"
}, Te = /* @__PURE__ */ X({
  __name: "PolicyCard",
  props: {
    policy: {},
    mode: {}
  },
  emits: ["add", "remove"],
  setup(e, { emit: t }) {
    const n = e, i = t, s = I(!1);
    function r(o) {
      n.mode === "locked" || !o.dataTransfer || (o.dataTransfer.setData("text/plain", n.policy.id), o.dataTransfer.effectAllowed = n.mode === "palette" ? "copy" : "move");
    }
    function a(o) {
      return o.includes(":") ? o.split(":").slice(-1)[0] : o;
    }
    function l(o) {
      return Array.isArray(o) ? o.map(String) : typeof o == "string" && o ? [o] : [];
    }
    const u = K(() => l(n.policy.actions)), d = K(() => l(n.policy.resources));
    return (o, c) => (f(), $("div", {
      class: ve(["ks-pcard", [e.mode, { expanded: s.value }]]),
      draggable: e.mode !== "locked",
      onDragstart: r,
      onDblclick: c[3] || (c[3] = (v) => e.mode === "palette" && i("add"))
    }, [
      m("div", Js, [
        e.mode === "locked" ? (f(), D(p(q), {
          key: 0,
          icon: "tabler:lock",
          class: "ks-pcard-grip locked",
          "aria-hidden": "true"
        })) : (f(), D(p(q), {
          key: 1,
          icon: "tabler:grip-vertical",
          class: "ks-pcard-grip",
          "aria-hidden": "true"
        })),
        m("div", Qs, [
          m("div", eo, [
            m("span", {
              class: "ks-pcard-title",
              title: e.policy.title || a(e.policy.id)
            }, L(e.policy.title || a(e.policy.id)), 9, to),
            e.policy.effect ? (f(), D(Ge, {
              key: 0,
              severity: e.policy.effect === "allow" ? "success" : e.policy.effect === "deny" ? "danger" : "secondary"
            }, {
              default: E(() => [
                R(L(e.policy.effect), 1)
              ]),
              _: 1
            }, 8, ["severity"])) : x("", !0)
          ]),
          e.policy.comment ? (f(), $("div", no, L(e.policy.comment), 1)) : x("", !0)
        ]),
        m("button", {
          class: ve(["ks-pcard-act detail", { open: s.value }]),
          "aria-label": `${s.value ? "Hide" : "Show"} details for ${e.policy.title || a(e.policy.id)}`,
          "aria-expanded": s.value,
          onClick: c[0] || (c[0] = we((v) => s.value = !s.value, ["stop"]))
        }, [
          w(p(q), {
            icon: "tabler:chevron-right",
            "aria-hidden": "true"
          })
        ], 10, io),
        e.mode === "palette" ? (f(), $("button", {
          key: 2,
          class: "ks-pcard-act add",
          "aria-label": `Add permission ${e.policy.title || a(e.policy.id)}`,
          onClick: c[1] || (c[1] = we((v) => i("add"), ["stop"]))
        }, [
          w(p(q), {
            icon: "tabler:plus",
            "aria-hidden": "true"
          })
        ], 8, so)) : e.mode === "selected" ? (f(), $("button", {
          key: 3,
          class: "ks-pcard-act remove",
          "aria-label": `Remove permission ${e.policy.title || a(e.policy.id)}`,
          onClick: c[2] || (c[2] = we((v) => i("remove"), ["stop"]))
        }, [
          w(p(q), {
            icon: "tabler:x",
            "aria-hidden": "true"
          })
        ], 8, oo)) : x("", !0)
      ]),
      s.value ? (f(), $("div", ao, [
        m("div", ro, [
          c[4] || (c[4] = m("span", null, "Policy ID", -1)),
          m("code", null, L(e.policy.id), 1)
        ]),
        e.policy.surface || e.policy.intent ? (f(), $("div", lo, [
          c[5] || (c[5] = m("span", null, "Surface", -1)),
          m("code", null, L(e.policy.surface || e.policy.intent), 1)
        ])) : x("", !0),
        m("div", uo, [
          c[6] || (c[6] = m("span", null, "Effect", -1)),
          m("code", {
            class: ve(["ks-eff-code", e.policy.effect])
          }, L(e.policy.effect || "—"), 3)
        ]),
        m("div", co, [
          c[7] || (c[7] = m("span", null, "Actions", -1)),
          m("div", po, [
            (f(!0), $(le, null, ue(u.value, (v) => (f(), $("code", { key: v }, L(v), 1))), 128)),
            u.value.length ? x("", !0) : (f(), $("span", mo, "—"))
          ])
        ]),
        m("div", fo, [
          c[8] || (c[8] = m("span", null, "Resources", -1)),
          m("div", vo, [
            (f(!0), $(le, null, ue(d.value, (v) => (f(), $("code", { key: v }, L(v), 1))), 128)),
            d.value.length ? x("", !0) : (f(), $("span", ho, "—"))
          ])
        ])
      ])) : x("", !0)
    ], 42, Xs));
  }
}), yo = { class: "ks" }, go = { class: "ks-rail-search" }, bo = { class: "ks-rail-list" }, ko = {
  key: 0,
  class: "ks-rail-group"
}, So = ["onClick"], $o = { class: "ks-scope-name" }, _o = ["onClick"], wo = { class: "ks-scope-name" }, Co = {
  key: 0,
  class: "ks-builder"
}, Oo = { class: "ks-builder-head" }, Po = { class: "ks-builder-title" }, To = { class: "ks-builder-acts" }, Lo = {
  key: 0,
  class: "ks-overlay-warn"
}, xo = {
  key: 1,
  class: "ks-view-note"
}, jo = { class: "ks-fields" }, No = {
  key: 0,
  class: "ks-field-err"
}, Ao = {
  key: 0,
  class: "ks-pane locked-pane"
}, Eo = { class: "ks-pane-head" }, Vo = { class: "ks-pane-sub" }, Ro = { class: "ks-pane-body" }, Do = {
  key: 0,
  class: "ks-pane-empty"
}, Io = { class: "ks-pane" }, Mo = { class: "ks-pane-search" }, Uo = { class: "ks-pane-body" }, Bo = {
  key: 0,
  class: "ks-pane-empty"
}, zo = { class: "ks-pane-head" }, Ho = { class: "ks-pane-sub" }, Wo = { class: "ks-pane-body" }, Ko = ["onDrop"], qo = {
  key: 0,
  class: "ks-drop-hint"
}, Fo = {
  key: 1,
  class: "ks-view"
}, Go = { class: "ks-builder-head" }, Zo = { class: "ks-builder-title" }, Yo = { class: "ks-builder-acts" }, Xo = { class: "ks-pane-body ks-view-list" }, Jo = {
  key: 0,
  class: "ks-pane-empty"
}, Qo = {
  key: 0,
  class: "ks-ext-block"
}, ea = { class: "ks-ext-head" }, ta = { class: "ks-pane-body ks-view-list" }, na = /* @__PURE__ */ X({
  __name: "Security",
  setup(e) {
    const t = ws(), { scopes: n, policies: i, loading: s, saving: r, error: a } = t, l = I(""), u = I(""), d = I(null), o = I(null), c = I("scopes"), v = I(null), y = I(!1);
    async function C(g) {
      c.value = String(g), g === "delegations" && (y.value = !0, await lt(), await v.value?.load());
    }
    An(async () => {
      await t.load(), c.value === "delegations" && await v.value?.load();
    });
    const P = K(() => {
      const g = {};
      for (const h of i.value) g[h.id] = h;
      return g;
    }), O = K(() => {
      const g = l.value.trim().toLowerCase(), h = (k) => !g || k.label.toLowerCase().includes(g) || k.id.toLowerCase().includes(g);
      return {
        custom: n.value.filter((k) => k.source === "custom" && h(k)),
        builtin: n.value.filter((k) => k.source !== "custom" && h(k))
      };
    }), N = K(() => n.value.find((g) => g.id === d.value) || null), j = K(() => N.value && N.value.source !== "custom" ? N.value : null), B = K(() => {
      if (!o.value) return [];
      const g = /* @__PURE__ */ new Set([...o.value.policies, ...o.value.base.map((k) => k.id)]), h = u.value.trim().toLowerCase();
      return i.value.filter((k) => !g.has(k.id) && (!h || (k.title || "").toLowerCase().includes(h) || k.id.toLowerCase().includes(h) || (k.comment || "").toLowerCase().includes(h)));
    }), J = K(
      () => o.value ? o.value.policies.map((g) => P.value[g] || { id: g }) : []
    );
    function _(g) {
      d.value = g.id, o.value = g.source === "custom" ? { slug: g.slug || "", label: g.label, description: g.description, policies: g.policies.map((h) => h.id), enabled: g.enabled, isNew: !1, target: "", base: [] } : null;
    }
    function U() {
      d.value = null, o.value = { slug: "", label: "", description: "", policies: [], enabled: !0, isNew: !0, target: "", base: [] };
    }
    function V(g) {
      d.value = null, o.value = {
        slug: "",
        label: g.label ? `Copy of ${g.label}` : "",
        description: g.description,
        policies: [...g.policies.map((h) => h.id), ...(g.overlay_policies ?? []).map((h) => h.id)],
        enabled: !0,
        isNew: !0,
        target: "",
        base: []
      };
    }
    function M(g) {
      return g.replace(/[^a-z0-9]+/gi, "_").replace(/^_+|_+$/g, "");
    }
    function Z(g) {
      d.value = g.id, o.value = {
        slug: g.overlay_slug || M(g.id),
        label: g.label || Q(g.id),
        description: g.description,
        policies: (g.overlay_policies ?? []).map((h) => h.id),
        enabled: !0,
        isNew: !g.overlay_slug,
        target: g.id,
        base: g.policies
      };
    }
    const z = K(() => !!o.value && o.value.target !== "");
    function ee(g) {
      o.value && !o.value.policies.includes(g) && o.value.policies.push(g);
    }
    function T(g) {
      o.value && (o.value.policies = o.value.policies.filter((h) => h !== g));
    }
    function b(g) {
      const h = g.dataTransfer?.getData("text/plain");
      h && ee(h);
    }
    function S(g, h) {
      g.stopPropagation();
      const k = g.dataTransfer?.getData("text/plain");
      if (!k || !o.value || k === h) return;
      const Y = o.value.policies, De = Y.indexOf(k);
      De !== -1 && Y.splice(De, 1);
      const Ie = Y.indexOf(h);
      Y.splice(Ie === -1 ? Y.length : Ie, 0, k);
    }
    const W = K(() => {
      if (!o.value || !o.value.isNew || o.value.target !== "") return "";
      const g = o.value.slug.trim();
      return g && !/^[a-z0-9][\w.-]*$/i.test(g) ? "Slug must be alphanumeric (with _.-)" : "";
    }), F = K(() => !!o.value && o.value.slug.trim() !== "" && !W.value && o.value.policies.length > 0), te = I("");
    let ie = null;
    jn(() => {
      ie && clearTimeout(ie);
    });
    function ye(g) {
      te.value = g, ie && clearTimeout(ie), ie = setTimeout(() => {
        te.value = "";
      }, 3e3);
    }
    async function ae() {
      if (!o.value || !F.value) return;
      const g = o.value.slug.trim(), h = o.value.target, k = o.value.label.trim() || g;
      await t.saveScope({
        slug: g,
        target: h,
        label: o.value.label.trim(),
        description: o.value.description.trim(),
        policies: o.value.policies,
        enabled: o.value.enabled
      }) && (d.value = h || `kickside.security.scopes:${g}`, ye(`Saved “${k}”. The role will be available when assigning users.`));
    }
    async function se() {
      if (!o.value || o.value.isNew) return;
      const g = z.value;
      if (!await Bt.confirm({
        header: g ? "Remove extension?" : "Delete role?",
        message: g ? "This removes the added permissions. Users keep the role’s original permissions." : "This removes the custom role and its permissions.",
        icon: "tabler:trash",
        acceptLabel: g ? "Remove extension" : "Delete",
        rejectLabel: "Cancel",
        acceptClass: "p-button-danger"
      })) return;
      await t.deleteScope(o.value.slug) && (o.value = null, d.value = null);
    }
    function Q(g) {
      return g.includes(":") ? g.split(":").slice(-1)[0] : g;
    }
    return (g, h) => (f(), $("div", yo, [
      w(p(Vn), {
        class: "ks-tabs",
        value: c.value,
        "onUpdate:value": C
      }, {
        default: E(() => [
          w(p(En), { pt: { tabList: { "aria-label": "Security administration" } } }, {
            default: E(() => [
              w(p(mt), { value: "scopes" }, {
                default: E(() => [...h[12] || (h[12] = [
                  R("Roles", -1)
                ])]),
                _: 1
              }),
              w(p(mt), {
                value: "delegations",
                "data-tab": "delegations"
              }, {
                default: E(() => [...h[13] || (h[13] = [
                  R("Run as", -1)
                ])]),
                _: 1
              })
            ]),
            _: 1
          })
        ]),
        _: 1
      }, 8, ["value"]),
      y.value ? ct((f(), D(Ys, {
        key: 0,
        ref_key: "delegationPanel",
        ref: v,
        scopes: p(n)
      }, null, 8, ["scopes"])), [
        [pt, c.value === "delegations"]
      ]) : x("", !0),
      p(a) ? (f(), D(p(Ze), {
        key: 1,
        severity: "danger",
        class: "ks-top-notice",
        onDismiss: h[0] || (h[0] = (k) => a.value = "")
      }, {
        default: E(() => [
          R(L(p(a)), 1)
        ]),
        _: 1
      })) : te.value ? (f(), D(p(Ze), {
        key: 2,
        severity: "success",
        class: "ks-top-notice",
        onDismiss: h[1] || (h[1] = (k) => te.value = "")
      }, {
        default: E(() => [
          R(L(te.value), 1)
        ]),
        _: 1
      })) : x("", !0),
      c.value === "scopes" && p(s) && !p(n).length ? (f(), D(p(an), {
        key: 3,
        label: "Loading security…"
      })) : ct((f(), D(p(ei), { key: 4 }, {
        rail: E(() => [
          w(p(oi), {
            title: "Roles",
            count: p(n).length
          }, {
            actions: E(() => [
              w(p(qe), {
                icon: "tabler:plus",
                label: "New role",
                disabled: p(r),
                onClick: U
              }, null, 8, ["disabled"]),
              w(p(qe), {
                icon: "tabler:refresh",
                label: "Refresh",
                disabled: p(s),
                spin: p(s),
                onClick: p(t).load
              }, null, 8, ["disabled", "spin", "onClick"])
            ]),
            _: 1
          }, 8, ["count"]),
          m("div", go, [
            w(p(It), {
              modelValue: l.value,
              "onUpdate:modelValue": h[2] || (h[2] = (k) => l.value = k),
              placeholder: "Find a role…"
            }, null, 8, ["modelValue"])
          ]),
          m("div", bo, [
            O.value.custom.length ? (f(), $("div", ko, "Custom")) : x("", !0),
            (f(!0), $(le, null, ue(O.value.custom, (k) => (f(), $("button", {
              key: k.id,
              class: ve(["ks-scope-row", { active: k.id === d.value }]),
              onClick: (Y) => _(k)
            }, [
              m("span", $o, L(k.label || Q(k.id)), 1)
            ], 10, So))), 128)),
            h[14] || (h[14] = m("div", { class: "ks-rail-group" }, "Default", -1)),
            (f(!0), $(le, null, ue(O.value.builtin, (k) => (f(), $("button", {
              key: k.id,
              class: ve(["ks-scope-row", { active: k.id === d.value }]),
              onClick: (Y) => _(k)
            }, [
              m("span", wo, L(k.label || Q(k.id)), 1)
            ], 10, _o))), 128))
          ])
        ]),
        default: E(() => [
          o.value ? (f(), $("div", Co, [
            m("div", Oo, [
              m("div", Po, [
                w(p(q), {
                  icon: z.value ? "tabler:stack-2" : "tabler:shield-lock",
                  "aria-hidden": "true"
                }, null, 8, ["icon"]),
                m("span", null, L(z.value ? `Extend ${o.value.label || Q(o.value.target)}` : o.value.isNew ? "New role" : o.value.label || o.value.slug), 1),
                z.value ? (f(), D(p(Ge), {
                  key: 0,
                  severity: "warn"
                }, {
                  default: E(() => [...h[15] || (h[15] = [
                    R("Additional permissions", -1)
                  ])]),
                  _: 1
                })) : x("", !0)
              ]),
              m("div", To, [
                !o.value.isNew && !z.value && N.value ? (f(), D(p(ce), {
                  key: 0,
                  variant: "soft",
                  small: "",
                  icon: "tabler:copy",
                  disabled: p(r),
                  onClick: h[3] || (h[3] = (k) => V(N.value))
                }, {
                  default: E(() => [...h[16] || (h[16] = [
                    R("Duplicate", -1)
                  ])]),
                  _: 1
                }, 8, ["disabled"])) : x("", !0),
                o.value.isNew ? x("", !0) : (f(), D(p(ce), {
                  key: 1,
                  variant: "danger",
                  small: "",
                  icon: "tabler:trash",
                  disabled: p(r),
                  onClick: se
                }, {
                  default: E(() => [
                    R(L(z.value ? "Remove extension" : "Delete"), 1)
                  ]),
                  _: 1
                }, 8, ["disabled"])),
                w(p(ce), {
                  variant: "primary",
                  small: "",
                  icon: "tabler:device-floppy",
                  loading: p(r),
                  disabled: !F.value,
                  onClick: ae
                }, {
                  default: E(() => [
                    R(L(z.value ? "Save extension" : "Save role"), 1)
                  ]),
                  _: 1
                }, 8, ["loading", "disabled"])
              ])
            ]),
            z.value ? (f(), $("div", Lo, [
              w(p(q), {
                icon: "tabler:alert-triangle",
                "aria-hidden": "true"
              }),
              m("span", null, [
                h[17] || (h[17] = R("Adding permissions grants them to ", -1)),
                m("b", null, "everyone assigned " + L(N.value?.label || Q(o.value.target)), 1),
                h[18] || (h[18] = R(". Original permissions cannot be removed here. To restrict access, create a new role with only the permissions needed.", -1))
              ])
            ])) : (f(), $("p", xo, "Choose the permissions this role grants, then assign it in System → Users. To restrict a Member, assign this role instead of Member; other assigned roles may still grant access.")),
            m("div", jo, [
              z.value ? (f(), D(p(_e), {
                key: 1,
                label: "Role"
              }, {
                default: E(() => [
                  w(p(Be), {
                    "model-value": N.value?.label || o.value.target,
                    disabled: ""
                  }, null, 8, ["model-value"])
                ]),
                _: 1
              })) : (f(), D(p(_e), {
                key: 0,
                label: "Role ID",
                help: o.value.isNew ? "Unique identifier; cannot change later." : void 0
              }, {
                default: E(() => [
                  w(p(Be), {
                    modelValue: o.value.slug,
                    "onUpdate:modelValue": h[4] || (h[4] = (k) => o.value.slug = k),
                    disabled: !o.value.isNew,
                    placeholder: "reviewer"
                  }, null, 8, ["modelValue", "disabled"]),
                  W.value ? (f(), $("span", No, L(W.value), 1)) : x("", !0)
                ]),
                _: 1
              }, 8, ["help"])),
              w(p(_e), { label: "Name" }, {
                default: E(() => [
                  w(p(Be), {
                    modelValue: o.value.label,
                    "onUpdate:modelValue": h[5] || (h[5] = (k) => o.value.label = k),
                    placeholder: "Reviewer"
                  }, null, 8, ["modelValue"])
                ]),
                _: 1
              }),
              w(p(_e), { label: "Description" }, {
                default: E(() => [
                  w(p(Be), {
                    modelValue: o.value.description,
                    "onUpdate:modelValue": h[6] || (h[6] = (k) => o.value.description = k),
                    placeholder: "Read-only reviewer role"
                  }, null, 8, ["modelValue"])
                ]),
                _: 1
              })
            ]),
            m("div", {
              class: ve(["ks-panes", { three: z.value }])
            }, [
              z.value ? (f(), $("section", Ao, [
                m("header", Eo, [
                  h[19] || (h[19] = m("span", null, "Original permissions", -1)),
                  m("span", Vo, L(o.value.base.length) + " · locked", 1)
                ]),
                m("div", Ro, [
                  (f(!0), $(le, null, ue(o.value.base, (k) => (f(), D(Te, {
                    key: k.id,
                    policy: k,
                    mode: "locked"
                  }, null, 8, ["policy"]))), 128)),
                  o.value.base.length ? x("", !0) : (f(), $("div", Do, "No original permissions."))
                ])
              ])) : x("", !0),
              m("section", Io, [
                h[20] || (h[20] = m("header", { class: "ks-pane-head" }, [
                  m("span", null, "Available permissions"),
                  m("span", { class: "ks-pane-sub" }, "Click + to add")
                ], -1)),
                m("div", Mo, [
                  w(p(It), {
                    modelValue: u.value,
                    "onUpdate:modelValue": h[7] || (h[7] = (k) => u.value = k),
                    placeholder: "Search permissions…"
                  }, null, 8, ["modelValue"])
                ]),
                m("div", Uo, [
                  (f(!0), $(le, null, ue(B.value, (k) => (f(), D(Te, {
                    key: k.id,
                    policy: k,
                    mode: "palette",
                    onAdd: (Y) => ee(k.id)
                  }, null, 8, ["policy", "onAdd"]))), 128)),
                  B.value.length ? x("", !0) : (f(), $("div", Bo, "No matching permissions."))
                ])
              ]),
              m("section", {
                class: "ks-pane drop",
                onDragover: h[9] || (h[9] = we(() => {
                }, ["prevent"])),
                onDrop: b
              }, [
                m("header", zo, [
                  m("span", null, L(z.value ? "Added by you" : "In this role"), 1),
                  m("span", Ho, L(o.value.policies.length) + " " + L(o.value.policies.length === 1 ? "permission" : "permissions"), 1)
                ]),
                m("div", Wo, [
                  (f(!0), $(le, null, ue(J.value, (k) => (f(), $("div", {
                    key: k.id,
                    onDragover: h[8] || (h[8] = we(() => {
                    }, ["prevent"])),
                    onDrop: (Y) => S(Y, k.id)
                  }, [
                    w(Te, {
                      policy: k,
                      mode: "selected",
                      onRemove: (Y) => T(k.id)
                    }, null, 8, ["policy", "onRemove"])
                  ], 40, Ko))), 128)),
                  o.value.policies.length ? x("", !0) : (f(), $("div", qo, [
                    w(p(q), {
                      icon: "tabler:drag-drop",
                      "aria-hidden": "true"
                    }),
                    h[21] || (h[21] = m("span", null, "Use + on an available permission, or drag it here.", -1))
                  ]))
                ])
              ], 32)
            ], 2)
          ])) : j.value ? (f(), $("div", Fo, [
            m("div", Go, [
              m("div", Zo, [
                w(p(q), {
                  icon: "tabler:shield",
                  "aria-hidden": "true"
                }),
                m("span", null, L(j.value.label || Q(j.value.id)), 1)
              ]),
              m("div", Yo, [
                w(p(ce), {
                  variant: "primary",
                  small: "",
                  icon: "tabler:stack-2",
                  onClick: h[10] || (h[10] = (k) => Z(j.value))
                }, {
                  default: E(() => [
                    R(L(j.value.overlay_slug ? "Edit extension" : "Add permissions"), 1)
                  ]),
                  _: 1
                }),
                w(p(ce), {
                  variant: "soft",
                  small: "",
                  icon: "tabler:copy",
                  onClick: h[11] || (h[11] = (k) => V(j.value))
                }, {
                  default: E(() => [...h[22] || (h[22] = [
                    R("Copy role", -1)
                  ])]),
                  _: 1
                })
              ])
            ]),
            h[24] || (h[24] = m("p", { class: "ks-view-note" }, " Included with the application. Adding permissions affects everyone with this role. For restricted access, create a new role with only the permissions needed and assign it in System → Users instead of this role. Other assigned roles may still grant access. ", -1)),
            m("div", Xo, [
              (f(!0), $(le, null, ue(j.value.policies, (k) => (f(), D(Te, {
                key: k.id,
                policy: k,
                mode: "locked"
              }, null, 8, ["policy"]))), 128)),
              j.value.policies.length ? x("", !0) : (f(), $("div", Jo, "No permissions in this role."))
            ]),
            j.value.overlay_policies && j.value.overlay_policies.length ? (f(), $("div", Qo, [
              m("div", ea, [
                w(p(q), {
                  icon: "tabler:stack-2",
                  "aria-hidden": "true"
                }),
                h[23] || (h[23] = m("span", null, "Additional permissions", -1)),
                w(p(Ge), { severity: "warn" }, {
                  default: E(() => [
                    R(L(j.value.overlay_policies.length), 1)
                  ]),
                  _: 1
                })
              ]),
              m("div", ta, [
                (f(!0), $(le, null, ue(j.value.overlay_policies, (k) => (f(), D(Te, {
                  key: k.id,
                  policy: k,
                  mode: "locked"
                }, null, 8, ["policy"]))), 128))
              ])
            ])) : x("", !0)
          ])) : (f(), D(p(bs), {
            key: 2,
            icon: "tabler:shield-lock",
            title: "Roles",
            hint: "Choose a role to view its permissions, or create one with the permissions your team needs. Assign roles in System → Users.",
            cta: "New role",
            "cta-icon": "tabler:plus",
            onCta: U
          }))
        ]),
        _: 1
      }, 512)), [
        [pt, c.value === "scopes"]
      ])
    ]));
  }
}), ba = {
  rootComponent: na,
  plugins: [Yn]
};
export {
  ba as mountConfig
};
//# sourceMappingURL=lazy-mount-Bspxv_Yi.js.map

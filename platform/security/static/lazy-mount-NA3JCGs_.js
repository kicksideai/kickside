import _n from "primevue/config";
import wn from "primevue/contextmenu";
import Cn from "primevue/menu";
import On from "primevue/portal";
import { renderSlot as ve, createCommentVNode as N, h as Pn, Teleport as Tn, defineComponent as J, openBlock as p, createElementBlock as $, createElementVNode as h, createTextVNode as R, toDisplayString as V, getCurrentInstance as et, computed as K, createBlock as D, unref as c, withCtx as E, createVNode as O, ref as I, readonly as Ln, onMounted as Mt, nextTick as rt, watch as Ue, useId as Bt, mergeProps as Be, normalizeClass as be, onBeforeUnmount as xn, withModifiers as je, Fragment as me, renderList as pe, onUnmounted as jn, withDirectives as dt, vShow as ct } from "vue";
import { Icon as F } from "@iconify/vue";
import { loadByTagName as Nn, api as ye, host as Ut } from "@wippy-fe/proxy";
import { a as An } from "./wc-runtime-BMe_f3Uc.js";
import mt from "primevue/tab";
import En from "primevue/tablist";
import Vn from "primevue/tabs";
import zt from "primevue/button";
import Rn from "primevue/tag";
import Dn from "primevue/progressspinner";
import In from "primevue/chip";
import pt from "primevue/radiobutton";
const Mn = "data-wippy-overlay-layer";
function Ht() {
  return typeof window < "u" && typeof window.document < "u";
}
function Wt() {
  return Ht() && typeof HTMLElement < "u" && Object.hasOwn(HTMLElement.prototype, "popover");
}
function Bn() {
  return Wt() && typeof CSS < "u" && typeof CSS.supports == "function" && CSS.supports("anchor-name: --a") && CSS.supports("position-area", "bottom span-right") && CSS.supports("position-try-fallbacks", "flip-block") && CSS.supports("min-width", "min(anchor-size(width), 100vw)") && CSS.supports("max-width", "stretch");
}
const Un = /\bp-(?:select|multiselect|treeselect|cascadeselect)-overlay\b/;
let zn = 0;
const ze = /* @__PURE__ */ new WeakMap();
function ft(e, t) {
  const n = e.style;
  n.setProperty("position", "fixed", "important"), n.setProperty("inset", "auto", "important"), n.setProperty("margin", "0", "important"), n.setProperty("position-anchor", t), n.setProperty("position-area", "bottom span-right"), n.setProperty("position-try-fallbacks", "flip-block, flip-inline, flip-block flip-inline"), n.setProperty("min-width", "min(anchor-size(width), 100vw)", "important"), n.setProperty("max-width", "stretch", "important");
}
function Hn(e, t) {
  if (!Un.test(e.className))
    return;
  const n = e.style.cssText;
  ft(e, t), e.getAttribute("popover") !== "manual" && e.setAttribute("popover", "manual");
  try {
    e.matches(":popover-open") || e.showPopover();
  } catch {
  }
  if (!e.matches(":popover-open")) {
    e.removeAttribute("popover"), e.style.cssText = n;
    return;
  }
  if (!ze.has(e)) {
    const o = new MutationObserver(() => {
      const a = e.style;
      (a.top !== "auto" || a.left !== "auto" || a.margin !== "0px" || a.getPropertyPriority("top") !== "important" || a.getPropertyPriority("left") !== "important" || a.getPropertyPriority("margin") !== "important" || a.getPropertyPriority("min-width") !== "important" || a.maxWidth !== "stretch" || a.getPropertyPriority("max-width") !== "important") && ft(e, t);
    });
    o.observe(e, { attributes: !0, attributeFilter: ["style"] }), ze.set(e, o);
  }
}
function lt(e) {
  const t = ze.get(e);
  t && (t.disconnect(), ze.delete(e));
}
function Wn(e) {
  const t = e && typeof e.getRootNode == "function" ? e.getRootNode() : null;
  return t instanceof ShadowRoot ? t : null;
}
function tt(e) {
  e.style.top = "0px", e.style.left = "0px";
  const t = e.getBoundingClientRect();
  e.style.top = `${-window.scrollY - t.top}px`, e.style.left = `${-window.scrollX - t.left}px`;
}
const He = /* @__PURE__ */ new Set(), ut = /* @__PURE__ */ new WeakMap();
let vt = !1, nt = !1;
function Kn() {
  nt = !1;
  for (const e of He) {
    if (!e.isConnected) {
      for (const t of Array.from(e.children))
        t instanceof HTMLElement && lt(t);
      He.delete(e), ut.get(e)?.disconnect();
      continue;
    }
    e.childElementCount > 0 && tt(e);
  }
}
function ht() {
  nt || (nt = !0, requestAnimationFrame(Kn));
}
function Gn(e) {
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
  tt(t);
  const o = new MutationObserver((a) => {
    const r = t.__wippyAnchorName;
    for (const s of a) {
      if (r)
        for (const l of Array.from(s.addedNodes))
          l instanceof HTMLElement && Hn(l, r);
      for (const l of Array.from(s.removedNodes))
        l instanceof HTMLElement && lt(l);
    }
    t.isConnected && t.childElementCount > 0 && tt(t);
  });
  return o.observe(t, { childList: !0 }), ut.set(t, o), He.add(t), vt || (vt = !0, window.addEventListener("scroll", ht, { capture: !0, passive: !0 }), window.addEventListener("resize", ht, { passive: !0 })), t;
}
function yt(e) {
  if (!(!e.hostRoot || e.layer) && (e.layer = Gn(e.hostRoot), Bn())) {
    const t = e.$el ? e.$el.parentElement : null;
    t && (e.anchorName = `--wippy-a-${++zn}`, e.anchorTrigger = t, t.style.setProperty("anchor-name", e.anchorName), e.layer.__wippyAnchorName = e.anchorName);
  }
}
function gt(e) {
  if (e.anchorTrigger && (e.anchorTrigger.style.removeProperty("anchor-name"), e.anchorTrigger = null), e.anchorName = null, e.layer) {
    for (const t of Array.from(e.layer.children))
      t instanceof HTMLElement && lt(t);
    He.delete(e.layer), ut.get(e.layer)?.disconnect(), e.layer.remove(), e.layer = null;
  }
}
let bt = !1;
function qn() {
  if (bt)
    return;
  const e = Cn;
  !e.methods || typeof e.methods.bindOutsideClickListener != "function" || (e.methods.bindOutsideClickListener = function() {
    this.outsideClickListener || (this.outsideClickListener = (t) => {
      const n = t.composedPath(), o = this.container && !n.includes(this.container), a = !(this.target && n.includes(this.target));
      this.overlayVisible && o && a ? this.hide() : !this.popup && o && a && (this.focusedOptionIndex = -1);
    }, document.addEventListener("click", this.outsideClickListener, !0));
  }, bt = !0);
}
let kt = !1;
function Fn() {
  if (kt)
    return;
  const e = wn;
  !e.methods || typeof e.methods.bindOutsideClickListener != "function" || (e.methods.bindOutsideClickListener = function() {
    this.outsideClickListener || (this.outsideClickListener = (t) => {
      const n = t.composedPath(), o = this.container && !n.includes(this.container), a = this.visible ? !(this.target && n.includes(this.target)) : !0;
      o && a && this.hide();
    }, document.addEventListener("click", this.outsideClickListener, !0));
  }, kt = !0);
}
let St = !1;
function Zn() {
  if (St)
    return;
  St = !0;
  const e = On;
  e.computed = e.computed || {}, e.computed.inline = function() {
    return !!this.disabled || this.appendTo === "self";
  }, e.computed.resolvedTarget = function() {
    return this.appendTo == null || this.appendTo === "body" ? this.hostRoot ? this.layer : document.body : this.appendTo;
  }, e.data = function() {
    return { mounted: !1, hostRoot: null, layer: null, anchorName: null, anchorTrigger: null };
  }, e.mounted = function() {
    Ht() && (this.hostRoot = Wn(this.$el), this.mounted = !0, this.hostRoot && (this.inline || yt(this), this.$watch("inline", (t) => {
      t ? gt(this) : yt(this);
    })));
  }, e.render = function() {
    return this.inline ? ve(this.$slots, "default", { key: 0 }) : this.mounted ? Pn(Tn, { key: 1, to: this.resolvedTarget || document.body }, [
      ve(this.$slots, "default")
    ]) : N("", !0);
  }, e.unmounted = function() {
    gt(this);
  };
}
const Yn = {
  install: (e) => {
    qn(), Fn(), Zn(), e.use(_n, { theme: "none" });
  }
}, Xn = { class: "km-shell" }, Jn = { class: "km-rail" }, Qn = { class: "km-main" }, eo = /* @__PURE__ */ J({
  __name: "Shell",
  setup(e) {
    return (t, n) => (p(), $("div", Xn, [
      h("aside", Jn, [
        ve(t.$slots, "rail")
      ]),
      h("main", Qn, [
        ve(t.$slots, "default")
      ])
    ]));
  }
}), to = { class: "km-railhead" }, no = { class: "km-railhead-title" }, oo = { key: 0 }, ao = { class: "km-railhead-acts" }, io = /* @__PURE__ */ J({
  __name: "RailHeader",
  props: {
    title: {},
    count: {}
  },
  setup(e) {
    return (t, n) => (p(), $("div", to, [
      h("span", no, [
        R(V(e.title), 1),
        e.count !== void 0 ? (p(), $("b", oo, V(e.count), 1)) : N("", !0)
      ]),
      h("div", ao, [
        ve(t.$slots, "actions")
      ])
    ]));
  }
}), We = /* @__PURE__ */ J({
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
    const n = e, o = t, a = et(), r = K(
      () => Object.prototype.hasOwnProperty.call(a?.vnode.props ?? {}, "active")
    ), s = K(
      () => n.variant === "danger" ? "danger" : n.variant === "bordered" ? "secondary" : void 0
    ), l = K(
      () => n.size === "sm" ? "small" : n.size === "lg" ? "large" : void 0
    );
    return (u, d) => (p(), D(c(zt), {
      type: "button",
      severity: s.value,
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
      onClick: d[0] || (d[0] = (i) => o("click"))
    }, {
      icon: E(() => [
        O(c(F), {
          icon: e.icon,
          "aria-hidden": "true"
        }, null, 8, ["icon"])
      ]),
      _: 1
    }, 8, ["severity", "text", "outlined", "size", "loading", "disabled", "pt"]));
  }
});
function Ze(e) {
  return e == null || e === "" || Array.isArray(e) && e.length === 0 || !(e instanceof Date) && typeof e == "object" && Object.keys(e).length === 0;
}
function Kt(e) {
  return typeof e == "function" && "call" in e && "apply" in e;
}
function z(e) {
  return !Ze(e);
}
function _e(e, t = !0) {
  return e instanceof Object && e.constructor === Object && (t || Object.keys(e).length !== 0);
}
function ie(e, ...t) {
  return Kt(e) ? e(...t) : e;
}
function de(e, t = !0) {
  return typeof e == "string" && (t || e !== "");
}
function ge(e) {
  return de(e) ? e.replace(/(-|_)/g, "").toLowerCase() : e;
}
function Gt(e, t = "", n = {}) {
  let o = ge(t).split("."), a = o.shift();
  if (a) {
    if (_e(e)) {
      let r = Object.keys(e).find((s) => ge(s) === a) || "";
      return Gt(ie(e[r], n), o.join("."), n);
    }
    return;
  }
  return ie(e, n);
}
function so(e, t = !0) {
  return Array.isArray(e) && (t || e.length !== 0);
}
function ro(e) {
  return z(e) && !isNaN(e);
}
function ke(e, t) {
  if (t) {
    let n = t.test(e);
    return t.lastIndex = 0, n;
  }
  return !1;
}
function Le(e) {
  return e && e.replace(/\/\*(?:(?!\*\/)[\s\S])*\*\/|[\r\n\t]+/g, "").replace(/ {2,}/g, " ").replace(/ ([{:}]) /g, "$1").replace(/([;,]) /g, "$1").replace(/ !/g, "!").replace(/: /g, ":").trim();
}
function qt(e) {
  return de(e) ? e.replace(/(_)/g, "-").replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase() : e;
}
function lo() {
  let e = /* @__PURE__ */ new Map();
  return { on(t, n) {
    let o = e.get(t);
    return o ? o.push(n) : o = [n], e.set(t, o), this;
  }, off(t, n) {
    let o = e.get(t);
    return o && o.splice(o.indexOf(n) >>> 0, 1), this;
  }, emit(t, n) {
    let o = e.get(t);
    o && o.forEach((a) => {
      a(n);
    });
  }, clear() {
    e.clear();
  } };
}
function uo(e) {
  if (e) {
    let t = e.parentNode;
    return t && t instanceof ShadowRoot && t.host && (t = t.host), t;
  }
  return null;
}
function co(e) {
  return !!(e !== null && typeof e < "u" && e.nodeName && uo(e));
}
function Ye(e) {
  return typeof Element < "u" ? e instanceof Element : e !== null && typeof e == "object" && e.nodeType === 1 && typeof e.nodeName == "string";
}
function ot(e, t = {}) {
  if (Ye(e)) {
    let n = (o, a) => {
      var r, s;
      let l = (r = e?.$attrs) != null && r[o] ? [(s = e?.$attrs) == null ? void 0 : s[o]] : [];
      return [a].flat().reduce((u, d) => {
        if (d != null) {
          let i = typeof d;
          if (i === "string" || i === "number") u.push(d);
          else if (i === "object") {
            let m = Array.isArray(d) ? n(o, d) : Object.entries(d).map(([v, y]) => o === "style" && (y || y === 0) ? `${v.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase()}:${y}` : y ? v : void 0);
            u = m.length ? u.concat(m.filter((v) => !!v)) : u;
          }
        }
        return u;
      }, l);
    };
    Object.entries(t).forEach(([o, a]) => {
      if (a != null) {
        let r = o.match(/^on(.+)/);
        r ? e.addEventListener(r[1].toLowerCase(), a) : o === "p-bind" || o === "pBind" ? ot(e, a) : (a = o === "class" ? [...new Set(n("class", a))].join(" ").trim() : o === "style" ? n("style", a).join(";").trim() : a, (e.$attrs = e.$attrs || {}) && (e.$attrs[o] = a), e.setAttribute(o, a));
      }
    });
  }
}
function mo(e, t) {
  return Ye(e) ? e.matches(t) ? e : e.querySelector(t) : null;
}
function po() {
  return !!(typeof window < "u" && window.document && window.document.createElement);
}
function fo(e, t = "", n) {
  Ye(e) && n !== null && n !== void 0 && e.setAttribute(t, n);
}
var vo = Object.defineProperty, ho = Object.defineProperties, yo = Object.getOwnPropertyDescriptors, Ke = Object.getOwnPropertySymbols, Ft = Object.prototype.hasOwnProperty, Zt = Object.prototype.propertyIsEnumerable, $t = (e, t, n) => t in e ? vo(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n, ue = (e, t) => {
  for (var n in t || (t = {})) Ft.call(t, n) && $t(e, n, t[n]);
  if (Ke) for (var n of Ke(t)) Zt.call(t, n) && $t(e, n, t[n]);
  return e;
}, Xe = (e, t) => ho(e, yo(t)), ce = (e, t) => {
  var n = {};
  for (var o in e) Ft.call(e, o) && t.indexOf(o) < 0 && (n[o] = e[o]);
  if (e != null && Ke) for (var o of Ke(e)) t.indexOf(o) < 0 && Zt.call(e, o) && (n[o] = e[o]);
  return n;
}, go = lo(), te = go, Ne = /{([^}]*)}/g, Yt = /(\d+\s+[\+\-\*\/]\s+\d+)/g, Xt = /var\([^)]+\)/g;
function _t(e) {
  return de(e) ? e.replace(/[A-Z]/g, (t, n) => n === 0 ? t : "." + t.toLowerCase()).toLowerCase() : e;
}
function bo(e) {
  return _e(e) && e.hasOwnProperty("$value") && e.hasOwnProperty("$type") ? e.$value : e;
}
function ko(e) {
  return e.replaceAll(/ /g, "").replace(/[^\w]/g, "-");
}
function at(e = "", t = "") {
  return ko(`${de(e, !1) && de(t, !1) ? `${e}-` : e}${t}`);
}
function Jt(e = "", t = "") {
  return `--${at(e, t)}`;
}
function So(e = "") {
  let t = (e.match(/{/g) || []).length, n = (e.match(/}/g) || []).length;
  return (t + n) % 2 !== 0;
}
function Qt(e, t = "", n = "", o = [], a) {
  if (de(e)) {
    let r = e.trim();
    if (So(r)) return;
    if (ke(r, Ne)) {
      let s = r.replaceAll(Ne, (l) => {
        let u = l.replace(/{|}/g, "").split(".").filter((d) => !o.some((i) => ke(d, i)));
        return `var(${Jt(n, qt(u.join("-")))}${z(a) ? `, ${a}` : ""})`;
      });
      return ke(s.replace(Xt, "0"), Yt) ? `calc(${s})` : s;
    }
    return r;
  } else if (ro(e)) return e;
}
function $o(e, t, n) {
  de(t, !1) && e.push(`${t}:${n};`);
}
function $e(e, t) {
  return e ? `${e}{${t}}` : "";
}
function en(e, t) {
  if (e.indexOf("dt(") === -1) return e;
  function n(s, l) {
    let u = [], d = 0, i = "", m = null, v = 0;
    for (; d <= s.length; ) {
      let y = s[d];
      if ((y === '"' || y === "'" || y === "`") && s[d - 1] !== "\\" && (m = m === y ? null : y), !m && (y === "(" && v++, y === ")" && v--, (y === "," || d === s.length) && v === 0)) {
        let w = i.trim();
        w.startsWith("dt(") ? u.push(en(w, l)) : u.push(o(w)), i = "", d++;
        continue;
      }
      y !== void 0 && (i += y), d++;
    }
    return u;
  }
  function o(s) {
    let l = s[0];
    if ((l === '"' || l === "'" || l === "`") && s[s.length - 1] === l) return s.slice(1, -1);
    let u = Number(s);
    return isNaN(u) ? s : u;
  }
  let a = [], r = [];
  for (let s = 0; s < e.length; s++) if (e[s] === "d" && e.slice(s, s + 3) === "dt(") r.push(s), s += 2;
  else if (e[s] === ")" && r.length > 0) {
    let l = r.pop();
    r.length === 0 && a.push([l, s]);
  }
  if (!a.length) return e;
  for (let s = a.length - 1; s >= 0; s--) {
    let [l, u] = a[s], d = e.slice(l + 3, u), i = n(d, t), m = t(...i);
    e = e.slice(0, l) + m + e.slice(u + 1);
  }
  return e;
}
var Se = (...e) => _o(q.getTheme(), ...e), _o = (e = {}, t, n, o) => {
  if (t) {
    let { variable: a, options: r } = q.defaults || {}, { prefix: s, transform: l } = e?.options || r || {}, u = ke(t, Ne) ? t : `{${t}}`;
    return o === "value" || Ze(o) && l === "strict" ? q.getTokenValue(t) : Qt(u, void 0, s, [a.excludedKeyRegex], n);
  }
  return "";
};
function Ie(e, ...t) {
  if (e instanceof Array) {
    let n = e.reduce((o, a, r) => {
      var s;
      return o + a + ((s = ie(t[r], { dt: Se })) != null ? s : "");
    }, "");
    return en(n, Se);
  }
  return ie(e, { dt: Se });
}
function wo(e, t = {}) {
  let n = q.defaults.variable, { prefix: o = n.prefix, selector: a = n.selector, excludedKeyRegex: r = n.excludedKeyRegex } = t, s = [], l = [], u = [{ node: e, path: o }];
  for (; u.length; ) {
    let { node: i, path: m } = u.pop();
    for (let v in i) {
      let y = i[v], w = bo(y), T = ke(v, r) ? at(m) : at(m, qt(v));
      if (_e(w)) u.push({ node: w, path: T });
      else {
        let P = Jt(T), C = Qt(w, T, o, [r]);
        $o(l, P, C);
        let x = T;
        o && x.startsWith(o + "-") && (x = x.slice(o.length + 1)), s.push(x.replace(/-/g, "."));
      }
    }
  }
  let d = l.join("");
  return { value: l, tokens: s, declarations: d, css: $e(a, d) };
}
var le = { regex: { rules: { class: { pattern: /^\.([a-zA-Z][\w-]*)$/, resolve(e) {
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
    return (o = t.map((a) => a.resolve(n)).find((a) => a.matched)) != null ? o : this.rules.custom.resolve(n);
  });
} }, _toVariables(e, t) {
  return wo(e, { prefix: t?.prefix });
}, getCommon({ name: e = "", theme: t = {}, params: n, set: o, defaults: a }) {
  var r, s, l, u, d, i, m;
  let { preset: v, options: y } = t, w, T, P, C, x, G, Z;
  if (z(v) && y.transform !== "strict") {
    let { primitive: _, semantic: B, extend: A } = v, M = B || {}, { colorScheme: X } = M, U = ce(M, ["colorScheme"]), ee = A || {}, { colorScheme: ne } = ee, se = ce(ee, ["colorScheme"]), L = X || {}, { dark: b } = L, S = ce(L, ["dark"]), H = ne || {}, { dark: W } = H, he = ce(H, ["dark"]), re = z(_) ? this._toVariables({ primitive: _ }, y) : {}, oe = z(U) ? this._toVariables({ semantic: U }, y) : {}, Q = z(S) ? this._toVariables({ light: S }, y) : {}, g = z(b) ? this._toVariables({ dark: b }, y) : {}, f = z(se) ? this._toVariables({ semantic: se }, y) : {}, k = z(he) ? this._toVariables({ light: he }, y) : {}, Y = z(W) ? this._toVariables({ dark: W }, y) : {}, [we, De] = [(r = re.declarations) != null ? r : "", re.tokens], [rn, ln] = [(s = oe.declarations) != null ? s : "", oe.tokens || []], [un, dn] = [(l = Q.declarations) != null ? l : "", Q.tokens || []], [cn, mn] = [(u = g.declarations) != null ? u : "", g.tokens || []], [pn, fn] = [(d = f.declarations) != null ? d : "", f.tokens || []], [vn, hn] = [(i = k.declarations) != null ? i : "", k.tokens || []], [yn, gn] = [(m = Y.declarations) != null ? m : "", Y.tokens || []];
    w = this.transformCSS(e, we, "light", "variable", y, o, a), T = De;
    let bn = this.transformCSS(e, `${rn}${un}`, "light", "variable", y, o, a), kn = this.transformCSS(e, `${cn}`, "dark", "variable", y, o, a);
    P = `${bn}${kn}`, C = [.../* @__PURE__ */ new Set([...ln, ...dn, ...mn])];
    let Sn = this.transformCSS(e, `${pn}${vn}color-scheme:light`, "light", "variable", y, o, a), $n = this.transformCSS(e, `${yn}color-scheme:dark`, "dark", "variable", y, o, a);
    x = `${Sn}${$n}`, G = [.../* @__PURE__ */ new Set([...fn, ...hn, ...gn])], Z = ie(v.css, { dt: Se });
  }
  return { primitive: { css: w, tokens: T }, semantic: { css: P, tokens: C }, global: { css: x, tokens: G }, style: Z };
}, getPreset({ name: e = "", preset: t = {}, options: n, params: o, set: a, defaults: r, selector: s }) {
  var l, u, d;
  let i, m, v;
  if (z(t) && n.transform !== "strict") {
    let y = e.replace("-directive", ""), w = t, { colorScheme: T, extend: P, css: C } = w, x = ce(w, ["colorScheme", "extend", "css"]), G = P || {}, { colorScheme: Z } = G, _ = ce(G, ["colorScheme"]), B = T || {}, { dark: A } = B, M = ce(B, ["dark"]), X = Z || {}, { dark: U } = X, ee = ce(X, ["dark"]), ne = z(x) ? this._toVariables({ [y]: ue(ue({}, x), _) }, n) : {}, se = z(M) ? this._toVariables({ [y]: ue(ue({}, M), ee) }, n) : {}, L = z(A) ? this._toVariables({ [y]: ue(ue({}, A), U) }, n) : {}, [b, S] = [(l = ne.declarations) != null ? l : "", ne.tokens || []], [H, W] = [(u = se.declarations) != null ? u : "", se.tokens || []], [he, re] = [(d = L.declarations) != null ? d : "", L.tokens || []], oe = this.transformCSS(y, `${b}${H}`, "light", "variable", n, a, r, s), Q = this.transformCSS(y, he, "dark", "variable", n, a, r, s);
    i = `${oe}${Q}`, m = [.../* @__PURE__ */ new Set([...S, ...W, ...re])], v = ie(C, { dt: Se });
  }
  return { css: i, tokens: m, style: v };
}, getPresetC({ name: e = "", theme: t = {}, params: n, set: o, defaults: a }) {
  var r;
  let { preset: s, options: l } = t, u = (r = s?.components) == null ? void 0 : r[e];
  return this.getPreset({ name: e, preset: u, options: l, params: n, set: o, defaults: a });
}, getPresetD({ name: e = "", theme: t = {}, params: n, set: o, defaults: a }) {
  var r, s;
  let l = e.replace("-directive", ""), { preset: u, options: d } = t, i = ((r = u?.components) == null ? void 0 : r[l]) || ((s = u?.directives) == null ? void 0 : s[l]);
  return this.getPreset({ name: l, preset: i, options: d, params: n, set: o, defaults: a });
}, applyDarkColorScheme(e) {
  return !(e.darkModeSelector === "none" || e.darkModeSelector === !1);
}, getColorSchemeOption(e, t) {
  var n;
  return this.applyDarkColorScheme(e) ? this.regex.resolve(e.darkModeSelector === !0 ? t.options.darkModeSelector : (n = e.darkModeSelector) != null ? n : t.options.darkModeSelector) : [];
}, getLayerOrder(e, t = {}, n, o) {
  let { cssLayer: a } = t;
  return a ? `@layer ${ie(a.order || a.name || "primeui", n)}` : "";
}, getCommonStyleSheet({ name: e = "", theme: t = {}, params: n, props: o = {}, set: a, defaults: r }) {
  let s = this.getCommon({ name: e, theme: t, params: n, set: a, defaults: r }), l = Object.entries(o).reduce((u, [d, i]) => u.push(`${d}="${i}"`) && u, []).join(" ");
  return Object.entries(s || {}).reduce((u, [d, i]) => {
    if (_e(i) && Object.hasOwn(i, "css")) {
      let m = Le(i.css), v = `${d}-variables`;
      u.push(`<style type="text/css" data-primevue-style-id="${v}" ${l}>${m}</style>`);
    }
    return u;
  }, []).join("");
}, getStyleSheet({ name: e = "", theme: t = {}, params: n, props: o = {}, set: a, defaults: r }) {
  var s;
  let l = { name: e, theme: t, params: n, set: a, defaults: r }, u = (s = e.includes("-directive") ? this.getPresetD(l) : this.getPresetC(l)) == null ? void 0 : s.css, d = Object.entries(o).reduce((i, [m, v]) => i.push(`${m}="${v}"`) && i, []).join(" ");
  return u ? `<style type="text/css" data-primevue-style-id="${e}-variables" ${d}>${Le(u)}</style>` : "";
}, createTokens(e = {}, t, n = "", o = "", a = {}) {
  let r = function(l, u = {}, d = []) {
    if (d.includes(this.path)) return console.warn(`Circular reference detected at ${this.path}`), { colorScheme: l, path: this.path, paths: u, value: void 0 };
    d.push(this.path), u.name = this.path, u.binding || (u.binding = {});
    let i = this.value;
    if (typeof this.value == "string" && Ne.test(this.value)) {
      let m = this.value.trim().replace(Ne, (v) => {
        var y;
        let w = v.slice(1, -1), T = this.tokens[w];
        if (!T) return console.warn(`Token not found for path: ${w}`), "__UNRESOLVED__";
        let P = T.computed(l, u, d);
        return Array.isArray(P) && P.length === 2 ? `light-dark(${P[0].value},${P[1].value})` : (y = P?.value) != null ? y : "__UNRESOLVED__";
      });
      i = Yt.test(m.replace(Xt, "0")) ? `calc(${m})` : m;
    }
    return Ze(u.binding) && delete u.binding, d.pop(), { colorScheme: l, path: this.path, paths: u, value: i.includes("__UNRESOLVED__") ? void 0 : i };
  }, s = (l, u, d) => {
    Object.entries(l).forEach(([i, m]) => {
      let v = ke(i, t.variable.excludedKeyRegex) ? u : u ? `${u}.${_t(i)}` : _t(i), y = d ? `${d}.${i}` : i;
      _e(m) ? s(m, v, y) : (a[v] || (a[v] = { paths: [], computed: (w, T = {}, P = []) => {
        if (a[v].paths.length === 1) return a[v].paths[0].computed(a[v].paths[0].scheme, T.binding, P);
        if (w && w !== "none") for (let C = 0; C < a[v].paths.length; C++) {
          let x = a[v].paths[C];
          if (x.scheme === w) return x.computed(w, T.binding, P);
        }
        return a[v].paths.map((C) => C.computed(C.scheme, T[C.scheme], P));
      } }), a[v].paths.push({ path: y, value: m, scheme: y.includes("colorScheme.light") ? "light" : y.includes("colorScheme.dark") ? "dark" : "none", computed: r, tokens: a }));
    });
  };
  return s(e, n, o), a;
}, getTokenValue(e, t, n) {
  var o;
  let a = ((l) => l.split(".").filter((u) => !ke(u.toLowerCase(), n.variable.excludedKeyRegex)).join("."))(t), r = t.includes("colorScheme.light") ? "light" : t.includes("colorScheme.dark") ? "dark" : void 0, s = [(o = e[a]) == null ? void 0 : o.computed(r)].flat().filter((l) => l);
  return s.length === 1 ? s[0].value : s.reduce((l = {}, u) => {
    let d = u, { colorScheme: i } = d, m = ce(d, ["colorScheme"]);
    return l[i] = m, l;
  }, void 0);
}, getSelectorRule(e, t, n, o) {
  return n === "class" || n === "attr" ? $e(z(t) ? `${e}${t},${e} ${t}` : e, o) : $e(e, $e(t ?? ":root,:host", o));
}, transformCSS(e, t, n, o, a = {}, r, s, l) {
  if (z(t)) {
    let { cssLayer: u } = a;
    if (o !== "style") {
      let d = this.getColorSchemeOption(a, s);
      t = n === "dark" ? d.reduce((i, { type: m, selector: v }) => (z(v) && (i += v.includes("[CSS]") ? v.replace("[CSS]", t) : this.getSelectorRule(v, l, m, t)), i), "") : $e(l ?? ":root,:host", t);
    }
    if (u) {
      let d = { name: "primeui" };
      _e(u) && (d.name = ie(u.name, { name: e, type: o })), z(d.name) && (t = $e(`@layer ${d.name}`, t), r?.layerNames(d.name));
    }
    return t;
  }
  return "";
} }, q = { defaults: { variable: { prefix: "p", selector: ":root,:host", excludedKeyRegex: /^(primitive|semantic|components|directives|variables|colorscheme|light|dark|common|root|states|extend|css)$/gi }, options: { prefix: "p", darkModeSelector: "system", cssLayer: !1 } }, _theme: void 0, _layerNames: /* @__PURE__ */ new Set(), _loadedStyleNames: /* @__PURE__ */ new Set(), _loadingStyles: /* @__PURE__ */ new Set(), _tokens: {}, update(e = {}) {
  let { theme: t } = e;
  t && (this._theme = Xe(ue({}, t), { options: ue(ue({}, this.defaults.options), t.options) }), this._tokens = le.createTokens(this.preset, this.defaults), this.clearLoadedStyleNames());
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
  this.update({ theme: e }), te.emit("theme:change", e);
}, getPreset() {
  return this.preset;
}, setPreset(e) {
  this._theme = Xe(ue({}, this.theme), { preset: e }), this._tokens = le.createTokens(e, this.defaults), this.clearLoadedStyleNames(), te.emit("preset:change", e), te.emit("theme:change", this.theme);
}, getOptions() {
  return this.options;
}, setOptions(e) {
  this._theme = Xe(ue({}, this.theme), { options: e }), this.clearLoadedStyleNames(), te.emit("options:change", e), te.emit("theme:change", this.theme);
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
  return le.getTokenValue(this.tokens, e, this.defaults);
}, getCommon(e = "", t) {
  return le.getCommon({ name: e, theme: this.theme, params: t, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } });
}, getComponent(e = "", t) {
  let n = { name: e, theme: this.theme, params: t, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } };
  return le.getPresetC(n);
}, getDirective(e = "", t) {
  let n = { name: e, theme: this.theme, params: t, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } };
  return le.getPresetD(n);
}, getCustomPreset(e = "", t, n, o) {
  let a = { name: e, preset: t, options: this.options, selector: n, params: o, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } };
  return le.getPreset(a);
}, getLayerOrderCSS(e = "") {
  return le.getLayerOrder(e, this.options, { names: this.getLayerNames() }, this.defaults);
}, transformCSS(e = "", t, n = "style", o) {
  return le.transformCSS(e, t, o, n, this.options, { layerNames: this.setLayerNames.bind(this) }, this.defaults);
}, getCommonStyleSheet(e = "", t, n = {}) {
  return le.getCommonStyleSheet({ name: e, theme: this.theme, params: t, props: n, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } });
}, getStyleSheet(e, t, n = {}) {
  return le.getStyleSheet({ name: e, theme: this.theme, params: t, props: n, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } });
}, onStyleMounted(e) {
  this._loadingStyles.add(e);
}, onStyleUpdated(e) {
  this._loadingStyles.add(e);
}, onStyleLoaded(e, { name: t }) {
  this._loadingStyles.size && (this._loadingStyles.delete(t), te.emit(`theme:${t}:load`, e), !this._loadingStyles.size && te.emit("theme:load"));
} }, Ce = {
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
}, Co = `
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
function wt(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(e);
    t && (o = o.filter(function(a) {
      return Object.getOwnPropertyDescriptor(e, a).enumerable;
    })), n.push.apply(n, o);
  }
  return n;
}
function Ct(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? wt(Object(n), !0).forEach(function(o) {
      Oo(e, o, n[o]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : wt(Object(n)).forEach(function(o) {
      Object.defineProperty(e, o, Object.getOwnPropertyDescriptor(n, o));
    });
  }
  return e;
}
function Oo(e, t, n) {
  return (t = Po(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Po(e) {
  var t = To(e, "string");
  return Ae(t) == "symbol" ? t : t + "";
}
function To(e, t) {
  if (Ae(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(e, t);
    if (Ae(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
function Lo(e) {
  var t = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0;
  et() && et().components ? Mt(e) : t ? e() : rt(e);
}
var xo = 0;
function jo(e) {
  var t = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, n = I(!1), o = I(e), a = I(null), r = po() ? window.document : void 0, s = t.document, l = s === void 0 ? r : s, u = t.immediate, d = u === void 0 ? !0 : u, i = t.manual, m = i === void 0 ? !1 : i, v = t.name, y = v === void 0 ? "style_".concat(++xo) : v, w = t.id, T = w === void 0 ? void 0 : w, P = t.media, C = P === void 0 ? void 0 : P, x = t.nonce, G = x === void 0 ? void 0 : x, Z = t.first, _ = Z === void 0 ? !1 : Z, B = t.onMounted, A = B === void 0 ? void 0 : B, M = t.onUpdated, X = M === void 0 ? void 0 : M, U = t.onLoad, ee = U === void 0 ? void 0 : U, ne = t.props, se = ne === void 0 ? {} : ne, L = function() {
  }, b = function(W) {
    var he = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    if (l) {
      var re = Ct(Ct({}, se), he), oe = re.name || y, Q = re.id || T, g = re.nonce || G;
      a.value = l.querySelector('style[data-primevue-style-id="'.concat(oe, '"]')) || l.getElementById(Q) || l.createElement("style"), a.value.isConnected || (o.value = W || e, ot(a.value, {
        type: "text/css",
        id: Q,
        media: C,
        nonce: g
      }), _ ? l.head.prepend(a.value) : l.head.appendChild(a.value), fo(a.value, "data-primevue-style-id", oe), ot(a.value, re), a.value.onload = function(f) {
        return ee?.(f, {
          name: oe
        });
      }, A?.(oe)), !n.value && (L = Ue(o, function(f) {
        a.value.textContent = f, X?.(oe);
      }, {
        immediate: !0
      }), n.value = !0);
    }
  }, S = function() {
    !l || !n.value || (L(), co(a.value) && l.head.removeChild(a.value), n.value = !1, a.value = null);
  };
  return d && !m && Lo(b), {
    id: T,
    name: y,
    el: a,
    css: o,
    unload: S,
    load: b,
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
var Ot, Pt, Tt, Lt;
function xt(e, t) {
  return Vo(e) || Eo(e, t) || Ao(e, t) || No();
}
function No() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Ao(e, t) {
  if (e) {
    if (typeof e == "string") return jt(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? jt(e, t) : void 0;
  }
}
function jt(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, o = Array(t); n < t; n++) o[n] = e[n];
  return o;
}
function Eo(e, t) {
  var n = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (n != null) {
    var o, a, r, s, l = [], u = !0, d = !1;
    try {
      if (r = (n = n.call(e)).next, t !== 0) for (; !(u = (o = r.call(n)).done) && (l.push(o.value), l.length !== t); u = !0) ;
    } catch (i) {
      d = !0, a = i;
    } finally {
      try {
        if (!u && n.return != null && (s = n.return(), Object(s) !== s)) return;
      } finally {
        if (d) throw a;
      }
    }
    return l;
  }
}
function Vo(e) {
  if (Array.isArray(e)) return e;
}
function Nt(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(e);
    t && (o = o.filter(function(a) {
      return Object.getOwnPropertyDescriptor(e, a).enumerable;
    })), n.push.apply(n, o);
  }
  return n;
}
function Je(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? Nt(Object(n), !0).forEach(function(o) {
      Ro(e, o, n[o]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Nt(Object(n)).forEach(function(o) {
      Object.defineProperty(e, o, Object.getOwnPropertyDescriptor(n, o));
    });
  }
  return e;
}
function Ro(e, t, n) {
  return (t = Do(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Do(e) {
  var t = Io(e, "string");
  return Ee(t) == "symbol" ? t : t + "";
}
function Io(e, t) {
  if (Ee(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(e, t);
    if (Ee(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
function Me(e, t) {
  return t || (t = e.slice(0)), Object.freeze(Object.defineProperties(e, { raw: { value: Object.freeze(t) } }));
}
var Mo = function(t) {
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
}, Bo = {}, Uo = {}, fe = {
  name: "base",
  css: Mo,
  style: Co,
  classes: Bo,
  inlineStyles: Uo,
  load: function(t) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, o = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : function(r) {
      return r;
    }, a = o(Ie(Ot || (Ot = Me(["", ""])), t));
    return z(a) ? jo(Le(a), Je({
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
      var a = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "";
      return q.transformCSS(n.name || t.name, "".concat(a).concat(Ie(Pt || (Pt = Me(["", ""])), o)));
    });
  },
  getCommonTheme: function(t) {
    return q.getCommon(this.name, t);
  },
  getComponentTheme: function(t) {
    return q.getComponent(this.name, t);
  },
  getDirectiveTheme: function(t) {
    return q.getDirective(this.name, t);
  },
  getPresetTheme: function(t, n, o) {
    return q.getCustomPreset(this.name, t, n, o);
  },
  getLayerOrderThemeCSS: function() {
    return q.getLayerOrderCSS(this.name);
  },
  getStyleSheet: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    if (this.css) {
      var o = ie(this.css, {
        dt: Se
      }) || "", a = Le(Ie(Tt || (Tt = Me(["", "", ""])), o, t)), r = Object.entries(n).reduce(function(s, l) {
        var u = xt(l, 2), d = u[0], i = u[1];
        return s.push("".concat(d, '="').concat(i, '"')) && s;
      }, []).join(" ");
      return z(a) ? '<style type="text/css" data-primevue-style-id="'.concat(this.name, '" ').concat(r, ">").concat(a, "</style>") : "";
    }
    return "";
  },
  getCommonThemeStyleSheet: function(t) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    return q.getCommonStyleSheet(this.name, t, n);
  },
  getThemeStyleSheet: function(t) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, o = [q.getStyleSheet(this.name, t, n)];
    if (this.style) {
      var a = this.name === "base" ? "global-style" : "".concat(this.name, "-style"), r = Ie(Lt || (Lt = Me(["", ""])), ie(this.style, {
        dt: Se
      })), s = Le(q.transformCSS(a, r)), l = Object.entries(n).reduce(function(u, d) {
        var i = xt(d, 2), m = i[0], v = i[1];
        return u.push("".concat(m, '="').concat(v, '"')) && u;
      }, []).join(" ");
      z(s) && o.push('<style type="text/css" data-primevue-style-id="'.concat(a, '" ').concat(l, ">").concat(s, "</style>"));
    }
    return o.join("");
  },
  extend: function(t) {
    return Je(Je({}, this), {}, {
      css: void 0,
      style: void 0
    }, t);
  }
};
function zo() {
  var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "pc", t = Bt();
  return "".concat(e).concat(t.replace("v-", "").replaceAll("-", "_"));
}
var At = fe.extend({
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
function Ho(e) {
  return on(e) || Wo(e) || nn(e) || tn();
}
function Wo(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function Oe(e, t) {
  return on(e) || Ko(e, t) || nn(e, t) || tn();
}
function tn() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function nn(e, t) {
  if (e) {
    if (typeof e == "string") return it(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? it(e, t) : void 0;
  }
}
function it(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, o = Array(t); n < t; n++) o[n] = e[n];
  return o;
}
function Ko(e, t) {
  var n = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (n != null) {
    var o, a, r, s, l = [], u = !0, d = !1;
    try {
      if (r = (n = n.call(e)).next, t === 0) {
        if (Object(n) !== n) return;
        u = !1;
      } else for (; !(u = (o = r.call(n)).done) && (l.push(o.value), l.length !== t); u = !0) ;
    } catch (i) {
      d = !0, a = i;
    } finally {
      try {
        if (!u && n.return != null && (s = n.return(), Object(s) !== s)) return;
      } finally {
        if (d) throw a;
      }
    }
    return l;
  }
}
function on(e) {
  if (Array.isArray(e)) return e;
}
function Et(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(e);
    t && (o = o.filter(function(a) {
      return Object.getOwnPropertyDescriptor(e, a).enumerable;
    })), n.push.apply(n, o);
  }
  return n;
}
function j(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? Et(Object(n), !0).forEach(function(o) {
      Te(e, o, n[o]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Et(Object(n)).forEach(function(o) {
      Object.defineProperty(e, o, Object.getOwnPropertyDescriptor(n, o));
    });
  }
  return e;
}
function Te(e, t, n) {
  return (t = Go(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Go(e) {
  var t = qo(e, "string");
  return Ve(t) == "symbol" ? t : t + "";
}
function qo(e, t) {
  if (Ve(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(e, t);
    if (Ve(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var Fo = {
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
        te.off("theme:change", this._loadCoreStyles), t || (this._loadCoreStyles(), this._themeChangeListener(this._loadCoreStyles));
      }
    },
    dt: {
      immediate: !0,
      handler: function(t, n) {
        var o = this;
        te.off("theme:change", this._themeScopedListener), t ? (this._loadScopedThemeStyles(t), this._themeScopedListener = function() {
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
    var t, n, o, a, r, s, l, u, d, i, m, v = (t = this.pt) === null || t === void 0 ? void 0 : t._usept, y = v ? (n = this.pt) === null || n === void 0 || (n = n.originalValue) === null || n === void 0 ? void 0 : n[this.$.type.name] : void 0, w = v ? (o = this.pt) === null || o === void 0 || (o = o.value) === null || o === void 0 ? void 0 : o[this.$.type.name] : this.pt;
    (a = w || y) === null || a === void 0 || (a = a.hooks) === null || a === void 0 || (r = a.onBeforeCreate) === null || r === void 0 || r.call(a);
    var T = (s = this.$primevueConfig) === null || s === void 0 || (s = s.pt) === null || s === void 0 ? void 0 : s._usept, P = T ? (l = this.$primevue) === null || l === void 0 || (l = l.config) === null || l === void 0 || (l = l.pt) === null || l === void 0 ? void 0 : l.originalValue : void 0, C = T ? (u = this.$primevue) === null || u === void 0 || (u = u.config) === null || u === void 0 || (u = u.pt) === null || u === void 0 ? void 0 : u.value : (d = this.$primevue) === null || d === void 0 || (d = d.config) === null || d === void 0 ? void 0 : d.pt;
    (i = C || P) === null || i === void 0 || (i = i[this.$.type.name]) === null || i === void 0 || (i = i.hooks) === null || i === void 0 || (m = i.onBeforeCreate) === null || m === void 0 || m.call(i), this.$attrSelector = zo(), this.uid = this.$attrs.id || this.$attrSelector.replace("pc", "pv_id_");
  },
  created: function() {
    this._hook("onCreated");
  },
  beforeMount: function() {
    var t;
    this.rootEl = mo(Ye(this.$el) ? this.$el : (t = this.$el) === null || t === void 0 ? void 0 : t.parentElement, "[".concat(this.$attrSelector, "]")), this.rootEl && (this.rootEl.$pc = j({
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
      for (var n = arguments.length, o = new Array(n > 1 ? n - 1 : 0), a = 1; a < n; a++)
        o[a - 1] = arguments[a];
      return Kt(t) ? t.apply(void 0, o) : Be.apply(void 0, o);
    },
    _load: function() {
      Ce.isStyleNameLoaded("base") || (fe.loadCSS(this.$styleOptions), this._loadGlobalStyles(), Ce.setLoadedStyleName("base")), this._loadThemeStyles();
    },
    _loadStyles: function() {
      this._load(), this._themeChangeListener(this._load);
    },
    _loadCoreStyles: function() {
      var t, n;
      !Ce.isStyleNameLoaded((t = this.$style) === null || t === void 0 ? void 0 : t.name) && (n = this.$style) !== null && n !== void 0 && n.name && (At.loadCSS(this.$styleOptions), this.$options.style && this.$style.loadCSS(this.$styleOptions), Ce.setLoadedStyleName(this.$style.name));
    },
    _loadGlobalStyles: function() {
      var t = this._useGlobalPT(this._getOptionValue, "global.css", this.$params);
      z(t) && fe.load(t, j({
        name: "global"
      }, this.$styleOptions));
    },
    _loadThemeStyles: function() {
      var t, n;
      if (!(this.isUnstyled || this.$theme === "none")) {
        if (!q.isStyleNameLoaded("common")) {
          var o, a, r = ((o = this.$style) === null || o === void 0 || (a = o.getCommonTheme) === null || a === void 0 ? void 0 : a.call(o)) || {}, s = r.primitive, l = r.semantic, u = r.global, d = r.style;
          fe.load(s?.css, j({
            name: "primitive-variables"
          }, this.$styleOptions)), fe.load(l?.css, j({
            name: "semantic-variables"
          }, this.$styleOptions)), fe.load(u?.css, j({
            name: "global-variables"
          }, this.$styleOptions)), fe.loadStyle(j({
            name: "global-style"
          }, this.$styleOptions), d), q.setLoadedStyleName("common");
        }
        if (!q.isStyleNameLoaded((t = this.$style) === null || t === void 0 ? void 0 : t.name) && (n = this.$style) !== null && n !== void 0 && n.name) {
          var i, m, v, y, w = ((i = this.$style) === null || i === void 0 || (m = i.getComponentTheme) === null || m === void 0 ? void 0 : m.call(i)) || {}, T = w.css, P = w.style;
          (v = this.$style) === null || v === void 0 || v.load(T, j({
            name: "".concat(this.$style.name, "-variables")
          }, this.$styleOptions)), (y = this.$style) === null || y === void 0 || y.loadStyle(j({
            name: "".concat(this.$style.name, "-style")
          }, this.$styleOptions), P), q.setLoadedStyleName(this.$style.name);
        }
        if (!q.isStyleNameLoaded("layer-order")) {
          var C, x, G = (C = this.$style) === null || C === void 0 || (x = C.getLayerOrderThemeCSS) === null || x === void 0 ? void 0 : x.call(C);
          fe.load(G, j({
            name: "layer-order",
            first: !0
          }, this.$styleOptions)), q.setLoadedStyleName("layer-order");
        }
      }
    },
    _loadScopedThemeStyles: function(t) {
      var n, o, a, r = ((n = this.$style) === null || n === void 0 || (o = n.getPresetTheme) === null || o === void 0 ? void 0 : o.call(n, t, "[".concat(this.$attrSelector, "]"))) || {}, s = r.css, l = (a = this.$style) === null || a === void 0 ? void 0 : a.load(s, j({
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
      Ce.clearLoadedStyleNames(), te.on("theme:change", t);
    },
    _removeThemeListeners: function() {
      te.off("theme:change", this._loadCoreStyles), te.off("theme:change", this._load), te.off("theme:change", this._themeScopedListener);
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
      return Gt(t, n, o);
    },
    _getPTValue: function() {
      var t, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, o = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", a = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {}, r = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : !0, s = /./g.test(o) && !!a[o.split(".")[0]], l = this._getPropValue("ptOptions") || ((t = this.$primevueConfig) === null || t === void 0 ? void 0 : t.ptOptions) || {}, u = l.mergeSections, d = u === void 0 ? !0 : u, i = l.mergeProps, m = i === void 0 ? !1 : i, v = r ? s ? this._useGlobalPT(this._getPTClassValue, o, a) : this._useDefaultPT(this._getPTClassValue, o, a) : void 0, y = s ? void 0 : this._getPTSelf(n, this._getPTClassValue, o, j(j({}, a), {}, {
        global: v || {}
      })), w = this._getPTDatasets(o);
      return d || !d && y ? m ? this._mergeProps(m, v, y, w) : j(j(j({}, v), y), w) : j(j({}, y), w);
    },
    _getPTSelf: function() {
      for (var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length, o = new Array(n > 1 ? n - 1 : 0), a = 1; a < n; a++)
        o[a - 1] = arguments[a];
      return Be(
        this._usePT.apply(this, [this._getPT(t, this.$name)].concat(o)),
        // Exp; <component :pt="{}"
        this._usePT.apply(this, [this.$_attrsPT].concat(o))
        // Exp; <component :pt:[passthrough_key]:[attribute]="{value}" or <component :pt:[passthrough_key]="() =>{value}"
      );
    },
    _getPTDatasets: function() {
      var t, n, o = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", a = "data-pc-", r = o === "root" && z((t = this.pt) === null || t === void 0 ? void 0 : t["data-pc-section"]);
      return o !== "transition" && j(j({}, o === "root" && j(j(Te({}, "".concat(a, "name"), ge(r ? (n = this.pt) === null || n === void 0 ? void 0 : n["data-pc-section"] : this.$.type.name)), r && Te({}, "".concat(a, "extend"), ge(this.$.type.name))), {}, Te({}, "".concat(this.$attrSelector), ""))), {}, Te({}, "".concat(a, "section"), ge(o)));
    },
    _getPTClassValue: function() {
      var t = this._getOptionValue.apply(this, arguments);
      return de(t) || so(t) ? {
        class: t
      } : t;
    },
    _getPT: function(t) {
      var n = this, o = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", a = arguments.length > 2 ? arguments[2] : void 0, r = function(l) {
        var u, d = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1, i = a ? a(l) : l, m = ge(o), v = ge(n.$name);
        return (u = d ? m !== v ? i?.[m] : void 0 : i?.[m]) !== null && u !== void 0 ? u : i;
      };
      return t != null && t.hasOwnProperty("_usept") ? {
        _usept: t._usept,
        originalValue: r(t.originalValue),
        value: r(t.value)
      } : r(t, !0);
    },
    _usePT: function(t, n, o, a) {
      var r = function(T) {
        return n(T, o, a);
      };
      if (t != null && t.hasOwnProperty("_usept")) {
        var s, l = t._usept || ((s = this.$primevueConfig) === null || s === void 0 ? void 0 : s.ptOptions) || {}, u = l.mergeSections, d = u === void 0 ? !0 : u, i = l.mergeProps, m = i === void 0 ? !1 : i, v = r(t.originalValue), y = r(t.value);
        return v === void 0 && y === void 0 ? void 0 : de(y) ? y : de(v) ? v : d || !d && y ? m ? this._mergeProps(m, v, y) : j(j({}, v), y) : y;
      }
      return r(t);
    },
    _useGlobalPT: function(t, n, o) {
      return this._usePT(this.globalPT, t, n, o);
    },
    _useDefaultPT: function(t, n, o) {
      return this._usePT(this.defaultPT, t, n, o);
    },
    ptm: function() {
      var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
      return this._getPTValue(this.pt, t, j(j({}, this.$params), n));
    },
    ptmi: function() {
      var t, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", o = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, a = Be(this.$_attrsWithoutPT, this.ptm(n, o));
      return a?.hasOwnProperty("id") && ((t = a.id) !== null && t !== void 0 || (a.id = this.$id)), a;
    },
    ptmo: function() {
      var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", o = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
      return this._getPTValue(t, n, j({
        instance: this
      }, o), !1);
    },
    cx: function() {
      var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
      return this.isUnstyled ? void 0 : this._getOptionValue(this.$style.classes, t, j(j({}, this.$params), n));
    },
    sx: function() {
      var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0, o = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
      if (n) {
        var a = this._getOptionValue(this.$style.inlineStyles, t, j(j({}, this.$params), o)), r = this._getOptionValue(At.inlineStyles, t, j(j({}, this.$params), o));
        return [r, a];
      }
    }
  },
  computed: {
    globalPT: function() {
      var t, n = this;
      return this._getPT((t = this.$primevueConfig) === null || t === void 0 ? void 0 : t.pt, void 0, function(o) {
        return ie(o, {
          instance: n
        });
      });
    },
    defaultPT: function() {
      var t, n = this;
      return this._getPT((t = this.$primevueConfig) === null || t === void 0 ? void 0 : t.pt, void 0, function(o) {
        return n._getOptionValue(o, n.$name, j({}, n.$params)) || ie(o, j({}, n.$params));
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
        var a = Oe(o, 1), r = a[0];
        return n?.includes(r);
      }));
    },
    $theme: function() {
      var t;
      return (t = this.$primevueConfig) === null || t === void 0 ? void 0 : t.theme;
    },
    $style: function() {
      return j(j({
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
        var n = Oe(t, 1), o = n[0];
        return o?.startsWith("pt:");
      }).reduce(function(t, n) {
        var o = Oe(n, 2), a = o[0], r = o[1], s = a.split(":"), l = Ho(s), u = it(l).slice(1);
        return u?.reduce(function(d, i, m, v) {
          return !d[i] && (d[i] = m === v.length - 1 ? r : {}), d[i];
        }, t), t;
      }, {});
    },
    $_attrsWithoutPT: function() {
      return Object.entries(this.$attrs || {}).filter(function(t) {
        var n = Oe(t, 1), o = n[0];
        return !(o != null && o.startsWith("pt:"));
      }).reduce(function(t, n) {
        var o = Oe(n, 2), a = o[0], r = o[1];
        return t[a] = r, t;
      }, {});
    }
  }
}, Zo = `
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
`, Yo = fe.extend({
  name: "baseicon",
  css: Zo
});
function Re(e) {
  "@babel/helpers - typeof";
  return Re = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, Re(e);
}
function Vt(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(e);
    t && (o = o.filter(function(a) {
      return Object.getOwnPropertyDescriptor(e, a).enumerable;
    })), n.push.apply(n, o);
  }
  return n;
}
function Rt(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? Vt(Object(n), !0).forEach(function(o) {
      Xo(e, o, n[o]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Vt(Object(n)).forEach(function(o) {
      Object.defineProperty(e, o, Object.getOwnPropertyDescriptor(n, o));
    });
  }
  return e;
}
function Xo(e, t, n) {
  return (t = Jo(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Jo(e) {
  var t = Qo(e, "string");
  return Re(t) == "symbol" ? t : t + "";
}
function Qo(e, t) {
  if (Re(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var o = n.call(e, t);
    if (Re(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var ea = {
  name: "BaseIcon",
  extends: Fo,
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
  style: Yo,
  provide: function() {
    return {
      $pcIcon: this,
      $parentInstance: this
    };
  },
  methods: {
    pti: function() {
      var t = Ze(this.label);
      return Rt(Rt({}, !this.isUnstyled && {
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
}, an = {
  name: "SpinnerIcon",
  extends: ea
};
function ta(e) {
  return ia(e) || aa(e) || oa(e) || na();
}
function na() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function oa(e, t) {
  if (e) {
    if (typeof e == "string") return st(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? st(e, t) : void 0;
  }
}
function aa(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function ia(e) {
  if (Array.isArray(e)) return st(e);
}
function st(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, o = Array(t); n < t; n++) o[n] = e[n];
  return o;
}
function sa(e, t, n, o, a, r) {
  return p(), $("svg", Be({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), ta(t[0] || (t[0] = [h("path", {
    d: "M6.99701 14C5.85441 13.999 4.72939 13.7186 3.72012 13.1832C2.71084 12.6478 1.84795 11.8737 1.20673 10.9284C0.565504 9.98305 0.165424 8.89526 0.041387 7.75989C-0.0826496 6.62453 0.073125 5.47607 0.495122 4.4147C0.917119 3.35333 1.59252 2.4113 2.46241 1.67077C3.33229 0.930247 4.37024 0.413729 5.4857 0.166275C6.60117 -0.0811796 7.76026 -0.0520535 8.86188 0.251112C9.9635 0.554278 10.9742 1.12227 11.8057 1.90555C11.915 2.01493 11.9764 2.16319 11.9764 2.31778C11.9764 2.47236 11.915 2.62062 11.8057 2.73C11.7521 2.78503 11.688 2.82877 11.6171 2.85864C11.5463 2.8885 11.4702 2.90389 11.3933 2.90389C11.3165 2.90389 11.2404 2.8885 11.1695 2.85864C11.0987 2.82877 11.0346 2.78503 10.9809 2.73C9.9998 1.81273 8.73246 1.26138 7.39226 1.16876C6.05206 1.07615 4.72086 1.44794 3.62279 2.22152C2.52471 2.99511 1.72683 4.12325 1.36345 5.41602C1.00008 6.70879 1.09342 8.08723 1.62775 9.31926C2.16209 10.5513 3.10478 11.5617 4.29713 12.1803C5.48947 12.7989 6.85865 12.988 8.17414 12.7157C9.48963 12.4435 10.6711 11.7264 11.5196 10.6854C12.3681 9.64432 12.8319 8.34282 12.8328 7C12.8328 6.84529 12.8943 6.69692 13.0038 6.58752C13.1132 6.47812 13.2616 6.41667 13.4164 6.41667C13.5712 6.41667 13.7196 6.47812 13.8291 6.58752C13.9385 6.69692 14 6.84529 14 7C14 8.85651 13.2622 10.637 11.9489 11.9497C10.6356 13.2625 8.85432 14 6.99701 14Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
an.render = sa;
const ae = /* @__PURE__ */ J({
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
    const n = e, o = t, a = K(
      () => n.variant === "danger" ? "danger" : n.variant === "primary" ? void 0 : "secondary"
    );
    return (r, s) => (p(), D(c(zt), {
      type: e.type,
      severity: a.value,
      outlined: e.variant === "ghost",
      loading: e.loading,
      disabled: e.disabled || e.loading,
      size: e.small ? "small" : void 0,
      onClick: s[0] || (s[0] = (l) => o("click"))
    }, {
      default: E(() => [
        e.loading ? (p(), D(c(an), {
          key: 0,
          class: "p-button-loading-icon p-button-icon",
          spin: ""
        })) : N("", !0),
        e.icon && !e.loading ? (p(), D(c(F), {
          key: 1,
          icon: e.icon,
          "aria-hidden": "true"
        }, null, 8, ["icon"])) : N("", !0),
        ve(r.$slots, "default")
      ]),
      _: 3
    }, 8, ["type", "severity", "outlined", "loading", "disabled", "size"]));
  }
}), ra = { class: "km-search" }, la = ["value", "placeholder"], Dt = /* @__PURE__ */ J({
  __name: "SearchField",
  props: {
    modelValue: {},
    placeholder: {}
  },
  emits: ["update:modelValue"],
  setup(e, { emit: t }) {
    const n = t;
    return (o, a) => (p(), $("div", ra, [
      O(c(F), {
        icon: "tabler:search",
        class: "km-search-ico",
        "aria-hidden": "true"
      }),
      h("input", {
        class: "km-search-input",
        value: e.modelValue,
        placeholder: e.placeholder || "Search",
        onInput: a[0] || (a[0] = (r) => n("update:modelValue", r.target.value))
      }, null, 40, la),
      e.modelValue ? (p(), $("button", {
        key: 0,
        class: "km-search-clear",
        "aria-label": "Clear search",
        onClick: a[1] || (a[1] = (r) => n("update:modelValue", ""))
      }, [
        O(c(F), {
          icon: "tabler:x",
          "aria-hidden": "true"
        })
      ])) : N("", !0)
    ]));
  }
}), ua = { class: "km-field" }, da = { class: "km-field-label" }, ca = {
  key: 0,
  class: "km-field-help"
}, Ge = /* @__PURE__ */ J({
  __name: "FormField",
  props: {
    label: {},
    help: {}
  },
  setup(e) {
    return (t, n) => (p(), $("label", ua, [
      h("span", da, V(e.label), 1),
      ve(t.$slots, "default"),
      e.help ? (p(), $("small", ca, V(e.help), 1)) : N("", !0)
    ]));
  }
}), ma = ["type", "value", "placeholder", "readonly", "disabled", "autocomplete", "min", "max", "step"], It = /* @__PURE__ */ J({
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
    function o(a) {
      const r = a.target;
      n("update:modelValue", r.value);
    }
    return (a, r) => (p(), $("input", {
      class: be(["km-input", e.mono && "mono"]),
      type: e.type,
      value: e.modelValue,
      placeholder: e.placeholder,
      readonly: e.readonly,
      disabled: e.disabled,
      autocomplete: e.autocomplete,
      min: e.min,
      max: e.max,
      step: e.step,
      onInput: o
    }, null, 42, ma));
  }
}), pa = {
  key: 0,
  class: "km-pill-dot",
  "aria-hidden": "true"
}, qe = /* @__PURE__ */ J({
  __name: "Pill",
  props: {
    severity: { default: "secondary" },
    dot: { type: Boolean },
    icon: {}
  },
  setup(e) {
    return (t, n) => (p(), D(c(Rn), {
      severity: e.severity || void 0,
      class: "km-pill kx-tag-sm"
    }, {
      default: E(() => [
        e.dot ? (p(), $("span", pa)) : e.icon ? (p(), D(c(F), {
          key: 1,
          icon: e.icon,
          "aria-hidden": "true"
        }, null, 8, ["icon"])) : N("", !0),
        ve(t.$slots, "default")
      ]),
      _: 3
    }, 8, ["severity"]));
  }
}), fa = { class: "km-notice-text" }, Fe = /* @__PURE__ */ J({
  __name: "Notice",
  props: {
    severity: { default: "info" }
  },
  emits: ["dismiss"],
  setup(e, { emit: t }) {
    const n = t, o = (a) => a === "danger" ? "tabler:alert-triangle" : a === "success" ? "tabler:circle-check" : "tabler:info-circle";
    return (a, r) => (p(), $("div", {
      class: be(["km-notice", `is-${e.severity}`]),
      role: "status"
    }, [
      O(c(F), {
        icon: o(e.severity),
        "aria-hidden": "true"
      }, null, 8, ["icon"]),
      h("span", fa, [
        ve(a.$slots, "default")
      ]),
      h("button", {
        class: "km-notice-x",
        "aria-label": "Dismiss",
        onClick: r[0] || (r[0] = (s) => n("dismiss"))
      }, [
        O(c(F), {
          icon: "tabler:x",
          "aria-hidden": "true"
        })
      ])
    ], 2));
  }
}), va = { class: "km-loading" }, ha = { key: 0 }, sn = /* @__PURE__ */ J({
  __name: "Spinner",
  props: {
    label: {}
  },
  setup(e) {
    return (t, n) => (p(), $("div", va, [
      O(c(Dn), {
        style: { width: "22px", height: "22px", margin: "0" },
        "aria-label": e.label || "Loading"
      }, null, 8, ["aria-label"]),
      e.label ? (p(), $("span", ha, V(e.label), 1)) : N("", !0)
    ]));
  }
}), ya = { class: "km-empty" }, ga = { class: "km-empty-title" }, ba = {
  key: 0,
  class: "km-empty-hint"
}, ka = /* @__PURE__ */ J({
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
    return (o, a) => (p(), $("div", ya, [
      O(c(F), {
        icon: e.icon,
        class: "km-empty-ico",
        "aria-hidden": "true"
      }, null, 8, ["icon"]),
      h("div", ga, V(e.title), 1),
      e.hint ? (p(), $("p", ba, V(e.hint), 1)) : N("", !0),
      e.cta ? (p(), D(ae, {
        key: 1,
        icon: e.ctaIcon,
        onClick: a[0] || (a[0] = (r) => n("cta"))
      }, {
        default: E(() => [
          R(V(e.cta), 1)
        ]),
        _: 1
      }, 8, ["icon"])) : N("", !0)
    ]));
  }
}), Sa = { class: "kx-wcmount" }, $a = {
  key: 0,
  class: "kx-wcmount-fail",
  role: "alert"
}, Qe = /* @__PURE__ */ J({
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
    const n = e, o = t, a = I(null), r = I(!1);
    let s = null, l = 0;
    const u = /* @__PURE__ */ new Set();
    function d(_) {
      _.composedPath()[0] === s && (_.stopPropagation(), o("change", _.detail));
    }
    function i(_) {
      return _.composedPath()[0] !== s ? !1 : (_.stopPropagation(), !0);
    }
    function m(_) {
      i(_) && o("select", _.detail);
    }
    function v(_) {
      i(_) && o("created", _.detail);
    }
    function y(_) {
      i(_) && o("close", _.detail);
    }
    function w(_) {
      i(_) && o("error", _.detail);
    }
    function T(_) {
      if (typeof _ == "string") return _;
      try {
        return JSON.stringify(_ ?? {});
      } catch {
        return null;
      }
    }
    function P() {
      if (!s) return;
      const _ = T(n.config);
      if (_ !== null && s.setAttribute("config", _), n.schema !== void 0 && n.schema !== null) {
        const A = T(n.schema);
        A !== null && s.setAttribute("schema", A);
      }
      if (n.meta !== void 0 && n.meta !== null) {
        const A = T(n.meta);
        A !== null && s.setAttribute("meta", A);
      }
      n.provider && s.setAttribute("provider", n.provider), n.label && s.setAttribute("label", n.label);
      const B = n.attrs || {};
      for (const A of [...u])
        (!(A in B) || B[A] == null) && (s.removeAttribute(A), u.delete(A));
      for (const [A, M] of Object.entries(B)) {
        if (M == null) continue;
        const X = typeof M == "object" ? T(M) : String(M);
        X !== null && (s.setAttribute(A, X), u.add(A));
      }
    }
    function C(_ = s) {
      _ && (_.removeEventListener("config-changed", d), _.removeEventListener("change", d), _.removeEventListener("select", m), _.removeEventListener("created", v), _.removeEventListener("close", y), _.removeEventListener("error", w), _ === s && (s = null), u.clear());
    }
    async function x(_) {
      if (!customElements.get(_))
        try {
          await Nn(_, { timeoutMs: 8e3 });
        } catch {
        }
    }
    async function G() {
      const _ = ++l, B = a.value, A = n.tag;
      if (r.value = !1, !!B && (C(), B.innerHTML = "", !!A))
        try {
          if (await x(A), _ !== l || a.value !== B || n.tag !== A) return;
          const M = document.createElement(A);
          M.classList.add("kx-wcmount-surface"), s = M, P(), M.addEventListener("config-changed", d), M.addEventListener("change", d), M.addEventListener("select", m), M.addEventListener("created", v), M.addEventListener("close", y), M.addEventListener("error", w), M.style.display = "block", B.appendChild(M), r.value = !customElements.get(A);
        } catch {
          _ === l && (r.value = !0);
        }
    }
    async function Z() {
      r.value = !1, await rt(), await G();
    }
    return Mt(G), Ue(() => n.tag, G), Ue(() => [n.config, n.schema, n.meta, n.provider, n.label, n.attrs], P, { deep: !0 }), xn(() => {
      l += 1, C();
    }), (_, B) => (p(), $("div", Sa, [
      r.value ? (p(), $("div", $a, [
        B[0] || (B[0] = h("span", null, "This setup panel couldn’t load.", -1)),
        h("button", {
          type: "button",
          onClick: Z
        }, "Try again")
      ])) : (p(), $("div", {
        key: 1,
        ref_key: "host",
        ref: a
      }, null, 512))
    ]));
  }
});
function xe(e, t) {
  const n = e?.response?.data ?? e?.data;
  return typeof n?.error == "string" && n.error ? n.error : typeof n?.message == "string" && n.message ? n.message : e instanceof Error ? e.message : t;
}
function _a() {
  const e = I([]), t = I([]), n = I(!0), o = I(!1), a = I("");
  let r = 0;
  async function s() {
    const d = ++r;
    n.value = !0, a.value = "";
    try {
      const [i, m] = await Promise.all([
        ye.get("/api/v1/security/scopes"),
        ye.get("/api/v1/security/policies")
      ]);
      if (d !== r) return;
      e.value = i.data?.scopes ?? [], t.value = m.data?.policies ?? [];
    } catch (i) {
      d === r && (a.value = xe(i, "failed to load security"));
    } finally {
      d === r && (n.value = !1);
    }
  }
  async function l(d) {
    o.value = !0, a.value = "";
    try {
      return await ye.post("/api/v1/security/scopes", d), await s(), !0;
    } catch (i) {
      return a.value = xe(i, "failed to save scope"), !1;
    } finally {
      o.value = !1;
    }
  }
  async function u(d) {
    o.value = !0, a.value = "";
    try {
      return await ye.delete(`/api/v1/security/scopes?slug=${encodeURIComponent(d)}`), await s(), !0;
    } catch (i) {
      return a.value = xe(i, "failed to delete scope"), !1;
    } finally {
      o.value = !1;
    }
  }
  return { scopes: e, policies: t, loading: n, saving: o, error: a, load: s, saveScope: l, deleteScope: u };
}
function wa() {
  const e = I([]), t = I(!1), n = I(!1), o = I(""), a = I(""), r = I(null);
  let s = 0;
  async function l() {
    const i = ++s;
    t.value = !0, o.value = "";
    try {
      const { data: m } = await ye.get("/api/v1/security/delegations");
      if (m?.success !== !0 || !Array.isArray(m.delegations))
        throw new Error(m?.error || "Delegation inventory is unconfirmed");
      i === s && (e.value = m.delegations);
    } catch (m) {
      i === s && (o.value = xe(m, "Could not load run-as permissions"));
    } finally {
      i === s && (t.value = !1);
    }
  }
  async function u() {
    if (!r.value || n.value) return;
    const i = r.value;
    n.value = !0, o.value = "", a.value = "";
    try {
      const { data: m } = i.method === "save" ? await ye.post("/api/v1/security/delegations", i.request) : await ye.delete("/api/v1/security/delegations", { data: i.request });
      if (m?.success !== !0) throw new Error(m?.error || "Run-as request is unconfirmed");
      r.value = null, a.value = i.method === "save" ? "Run-as permission saved" : "Run-as permission revoked", await l();
    } catch (m) {
      o.value = xe(m, "Could not confirm run-as request");
      const v = m?.response?.status;
      v && v >= 400 && v < 500 && (r.value = null);
    } finally {
      n.value = !1;
    }
  }
  async function d(i, m) {
    r.value || n.value || (r.value = { method: i, request: {
      ...m,
      principal: { ...m.principal },
      ...m.groups ? { groups: [...m.groups].sort() } : {}
    } }, await u());
  }
  return { delegations: e, loading: t, saving: n, error: o, confirmation: a, pending: r, load: l, mutate: d, submit: u };
}
const Ca = {
  class: "ks-runas",
  "aria-label": "Run-as permissions"
}, Oa = { class: "ks-runas-head" }, Pa = { class: "ks-runas-acts" }, Ta = {
  key: 0,
  role: "alert"
}, La = { class: "ks-runas-form-head" }, xa = ["disabled", "inert"], ja = { class: "ks-runas-steps" }, Na = {
  key: 0,
  class: "ks-runas-chips",
  "aria-label": "Selected groups"
}, Aa = { class: "ks-runas-component-options" }, Ea = ["for"], Va = ["for"], Ra = { class: "ks-runas-form-foot" }, Da = {
  key: 3,
  class: "ks-runas-pending"
}, Ia = {
  key: 6,
  class: "ks-runas-list"
}, Ma = { class: "ks-runas-grant-body" }, Ba = { class: "ks-runas-grant-line" }, Ua = {
  key: 0,
  class: "ks-runas-who"
}, za = { class: "ks-runas-verb" }, Ha = { class: "ks-runas-who" }, Wa = { class: "ks-runas-grant-meta" }, Ka = { key: 0 }, Ga = { key: 1 }, qa = { key: 2 }, Fa = {
  key: 7,
  class: "ks-runas-empty"
}, Za = /* @__PURE__ */ J({
  __name: "Delegations",
  props: {
    scopes: {}
  },
  setup(e, { expose: t }) {
    const n = e, o = wa(), { delegations: a, loading: r, saving: s, error: l, confirmation: u, pending: d } = o, i = I(!1), m = I(!1), v = I(""), y = I(""), w = I(!0), T = Bt(), P = I([]), C = K(() => s.value || !!d.value), x = K(() => !!v.value && P.value.length > 0 && (w.value || !!y.value)), G = K(() => {
      const L = {};
      for (const b of n.scopes) L[b.id] = b.label || "Group unavailable";
      return L;
    }), Z = I({});
    Ue(a, async (L) => {
      const b = [...new Set(L.map((S) => S.principal.id))].filter((S) => !Z.value[S]);
      if (b.length)
        try {
          const { data: S } = await ye.post("/api/v1/principals/resolve", { refs: b.map((W) => ({ type: "user", id: W })) }), H = { ...Z.value };
          for (const W of Array.isArray(S?.principals) ? S.principals : [])
            W && typeof W.id == "string" && typeof W.label == "string" && (H[W.id] = W.label);
          Z.value = H;
        } catch (S) {
          l.value = S && typeof S == "object" && "message" in S ? String(S.message) : "Could not resolve account names";
        }
    });
    const _ = K(() => a.value.filter((L) => L.active)), B = K(() => a.value.filter((L) => !L.active)), A = K(() => m.value ? [..._.value, ...B.value] : _.value);
    function M(L, b) {
      if (!L || typeof L != "object") return;
      const S = L;
      C.value || S.type !== b || typeof S.id != "string" || (b === "user" ? v.value = S.id : S.id && !P.value.some((H) => H.id === S.id) && P.value.push({ id: S.id, label: typeof S.label == "string" ? S.label : S.id }));
    }
    function X(L) {
      const b = L && typeof L == "object" ? L.thread_id : void 0;
      !C.value && typeof b == "string" && (y.value = b);
    }
    function U(L) {
      l.value = L && typeof L == "object" && "message" in L ? String(L.message) : "Could not load the picker";
    }
    function ee() {
      v.value = "", y.value = "", w.value = !0, P.value = [], i.value = !0;
    }
    async function ne() {
      x.value && (await o.mutate("save", {
        principal: { kind: "user", id: v.value },
        root: w.value ? "*" : y.value,
        groups: P.value.map((L) => L.id)
      }), !l.value && !d.value && (i.value = !1));
    }
    async function se(L) {
      await Ut.confirm({
        header: "Revoke run-as permission?",
        message: `Members of ${L.groups.map((S) => G.value[S] || "Group unavailable").join(", ")} can no longer choose ${Z.value[L.principal.id] || "Account unavailable"} in the Run as setting.`,
        icon: "tabler:user-off",
        acceptLabel: "Revoke",
        rejectLabel: "Cancel",
        acceptClass: "p-button-danger"
      }) && await o.mutate("revoke", { principal: L.principal, root: L.root });
    }
    return t({ load: o.load }), (L, b) => (p(), $("section", Ca, [
      h("header", Oa, [
        b[10] || (b[10] = h("div", null, [
          h("h2", { class: "ks-runas-title" }, "Run-as permissions"),
          h("p", { class: "ks-runas-lede" }, [
            R(" Agents, automations and workflows run with the access of the account set in their "),
            h("b", null, "Run as"),
            R(" setting. A permission lets members of a group choose a specific account there, typically a bot account, so the component works with that account's access instead of their own. ")
          ])
        ], -1)),
        h("div", Pa, [
          O(c(We), {
            icon: "tabler:refresh",
            label: "Refresh",
            disabled: c(r) || C.value,
            spin: c(r),
            onClick: c(o).load
          }, null, 8, ["disabled", "spin", "onClick"]),
          i.value ? N("", !0) : (p(), D(c(ae), {
            key: 0,
            variant: "primary",
            small: "",
            icon: "tabler:plus",
            disabled: C.value,
            onClick: ee
          }, {
            default: E(() => [...b[9] || (b[9] = [
              R("New permission", -1)
            ])]),
            _: 1
          }, 8, ["disabled"]))
        ])
      ]),
      c(l) ? (p(), $("div", Ta, [
        O(c(Fe), {
          severity: "danger",
          onDismiss: b[0] || (b[0] = (S) => l.value = "")
        }, {
          default: E(() => [
            R(V(c(l)), 1)
          ]),
          _: 1
        })
      ])) : N("", !0),
      c(u) ? (p(), D(c(Fe), {
        key: 1,
        "data-test": "delegation-confirmation",
        severity: "success",
        onDismiss: b[1] || (b[1] = (S) => u.value = "")
      }, {
        default: E(() => [
          R(V(c(u)), 1)
        ]),
        _: 1
      })) : N("", !0),
      i.value ? (p(), $("form", {
        key: 2,
        class: "ks-runas-form",
        onSubmit: je(ne, ["prevent"])
      }, [
        h("div", La, [
          b[11] || (b[11] = h("span", null, "New run-as permission", -1)),
          O(c(We), {
            icon: "tabler:x",
            label: "Cancel",
            disabled: C.value,
            onClick: b[2] || (b[2] = (S) => i.value = !1)
          }, null, 8, ["disabled"])
        ]),
        h("fieldset", {
          disabled: C.value,
          inert: C.value
        }, [
          h("ol", ja, [
            h("li", null, [
              O(c(Ge), {
                label: "Account to run as",
                help: "The account whose access the component uses. Its group memberships decide what the component can do."
              }, {
                default: E(() => [
                  O(Qe, {
                    tag: "wc-principal-picker",
                    attrs: { kinds: "user", placeholder: "Choose an account…" },
                    config: { principal_id: v.value },
                    onChange: b[3] || (b[3] = (S) => M(S, "user")),
                    onError: U
                  }, null, 8, ["config"])
                ]),
                _: 1
              })
            ]),
            h("li", null, [
              O(c(Ge), {
                label: "Who may choose it",
                help: "Members of these groups see this account in the Run as setting. Nobody's group membership changes."
              }, {
                default: E(() => [
                  O(Qe, {
                    tag: "wc-principal-picker",
                    attrs: { kinds: "group", placeholder: "Add a group…" },
                    config: {},
                    onChange: b[4] || (b[4] = (S) => M(S, "group")),
                    onError: U
                  })
                ]),
                _: 1
              }),
              P.value.length ? (p(), $("div", Na, [
                (p(!0), $(me, null, pe(P.value, (S) => (p(), D(c(In), {
                  key: S.id,
                  label: S.label,
                  removable: !C.value,
                  pt: { removeIcon: { "aria-label": `Remove group ${S.label}` } },
                  onRemove: (H) => P.value = P.value.filter((W) => W.id !== S.id)
                }, null, 8, ["label", "removable", "pt", "onRemove"]))), 128))
              ])) : N("", !0)
            ]),
            h("li", null, [
              h("fieldset", null, [
                b[14] || (b[14] = h("legend", { class: "km-field-label" }, "On which components", -1)),
                h("div", Aa, [
                  h("label", {
                    class: "ks-runas-component-option",
                    for: `${c(T)}-any`
                  }, [
                    O(c(pt), {
                      modelValue: w.value,
                      "onUpdate:modelValue": b[5] || (b[5] = (S) => w.value = S),
                      "input-id": `${c(T)}-any`,
                      name: c(T),
                      value: !0,
                      disabled: C.value
                    }, null, 8, ["modelValue", "input-id", "name", "disabled"]),
                    b[12] || (b[12] = R(" Any component ", -1))
                  ], 8, Ea),
                  h("label", {
                    class: "ks-runas-component-option",
                    for: `${c(T)}-one`
                  }, [
                    O(c(pt), {
                      modelValue: w.value,
                      "onUpdate:modelValue": b[6] || (b[6] = (S) => w.value = S),
                      "input-id": `${c(T)}-one`,
                      name: c(T),
                      value: !1,
                      disabled: C.value
                    }, null, 8, ["modelValue", "input-id", "name", "disabled"]),
                    b[13] || (b[13] = R(" One component ", -1))
                  ], 8, Va)
                ]),
                b[15] || (b[15] = h("small", { class: "km-field-help" }, "The person choosing the account must also be able to manage the component.", -1))
              ]),
              w.value ? N("", !0) : (p(), D(Qe, {
                key: 0,
                class: "ks-runas-component",
                tag: "wc-component-picker",
                attrs: { source: "/api/v1/security/delegations/roots", title: "Component", placeholder: "Choose a component you manage…" },
                config: y.value ? { thread_id: y.value } : {},
                onChange: X,
                onError: U
              }, null, 8, ["config"]))
            ])
          ])
        ], 8, xa),
        h("div", Ra, [
          O(c(ae), {
            variant: "ghost",
            small: "",
            disabled: C.value,
            onClick: b[7] || (b[7] = (S) => i.value = !1)
          }, {
            default: E(() => [...b[16] || (b[16] = [
              R("Cancel", -1)
            ])]),
            _: 1
          }, 8, ["disabled"]),
          O(c(ae), {
            variant: "primary",
            small: "",
            icon: "tabler:device-floppy",
            disabled: !x.value || C.value,
            loading: c(s),
            onClick: ne
          }, {
            default: E(() => [...b[17] || (b[17] = [
              R("Save permission", -1)
            ])]),
            _: 1
          }, 8, ["disabled", "loading"])
        ])
      ], 32)) : N("", !0),
      c(d) && !c(s) ? (p(), $("div", Da, [
        b[19] || (b[19] = h("span", null, "We could not confirm whether the permission changed. Select Retry to check before making another change.", -1)),
        O(c(ae), {
          small: "",
          onClick: c(o).submit
        }, {
          default: E(() => [...b[18] || (b[18] = [
            R("Retry", -1)
          ])]),
          _: 1
        }, 8, ["onClick"])
      ])) : N("", !0),
      B.value.length ? (p(), D(c(ae), {
        key: 4,
        class: "ks-runas-history",
        variant: "ghost",
        small: "",
        "aria-expanded": m.value,
        onClick: b[8] || (b[8] = (S) => m.value = !m.value)
      }, {
        default: E(() => [
          R(V(m.value ? "Hide revoked permissions" : "Show revoked permissions"), 1)
        ]),
        _: 1
      }, 8, ["aria-expanded"])) : N("", !0),
      c(r) && !c(a).length ? (p(), D(c(sn), {
        key: 5,
        label: "Loading run-as permissions…"
      })) : A.value.length ? (p(), $("div", Ia, [
        (p(!0), $(me, null, pe(A.value, (S) => (p(), $("article", {
          key: S.policy_id,
          class: be(["ks-runas-grant", { revoked: !S.active }])
        }, [
          O(c(F), {
            class: "ks-runas-grant-icon",
            icon: "tabler:user-shield",
            "aria-hidden": "true"
          }),
          h("div", Ma, [
            h("div", Ba, [
              S.active ? (p(), $("span", Ua, V(S.groups.map((H) => G.value[H] || "Group unavailable").join(", ")), 1)) : N("", !0),
              h("span", za, V(S.active ? "can run as" : "Permission to run as"), 1),
              h("span", Ha, V(Z.value[S.principal.id] || "Account unavailable"), 1)
            ]),
            h("div", Wa, [
              S.root === "*" ? (p(), $("span", Ka, "on any component they manage")) : S.root_label ? (p(), $("span", Ga, [
                b[20] || (b[20] = R("on ", -1)),
                h("b", null, V(S.root_label), 1)
              ])) : (p(), $("span", qa, "on an unavailable component"))
            ])
          ]),
          S.active ? (p(), D(c(ae), {
            key: 1,
            variant: "ghost",
            small: "",
            icon: "tabler:user-off",
            disabled: C.value,
            "aria-label": `Revoke run-as permission for ${Z.value[S.principal.id] || "Account unavailable"}`,
            onClick: (H) => se(S)
          }, {
            default: E(() => [...b[22] || (b[22] = [
              R("Revoke", -1)
            ])]),
            _: 1
          }, 8, ["disabled", "aria-label", "onClick"])) : (p(), D(c(qe), {
            key: 0,
            severity: "secondary"
          }, {
            default: E(() => [...b[21] || (b[21] = [
              R("revoked", -1)
            ])]),
            _: 1
          }))
        ], 2))), 128))
      ])) : !c(l) && !i.value ? (p(), $("div", Fa, [
        O(c(F), {
          icon: "tabler:user-shield",
          "aria-hidden": "true"
        }),
        b[23] || (b[23] = h("b", null, "No active run-as permissions", -1)),
        b[24] || (b[24] = h("span", null, [
          R("Without an active permission, the Run as setting offers only "),
          h("b", null, "Me"),
          R(".")
        ], -1))
      ])) : N("", !0)
    ]));
  }
}), Ya = ["draggable"], Xa = { class: "ks-pcard-row" }, Ja = { class: "ks-pcard-body" }, Qa = { class: "ks-pcard-head" }, ei = ["title"], ti = {
  key: 0,
  class: "ks-pcard-comment"
}, ni = ["aria-label"], oi = ["aria-label"], Pe = /* @__PURE__ */ J({
  __name: "PolicyCard",
  props: {
    policy: {},
    mode: {}
  },
  emits: ["add", "remove"],
  setup(e, { emit: t }) {
    const n = e, o = t, a = K(() => n.policy.title && n.policy.title !== n.policy.id ? n.policy.title : "Unnamed permission");
    function r(s) {
      n.mode === "locked" || !s.dataTransfer || (s.dataTransfer.setData("text/plain", n.policy.id), s.dataTransfer.effectAllowed = n.mode === "palette" ? "copy" : "move");
    }
    return (s, l) => (p(), $("div", {
      class: be(["ks-pcard", e.mode]),
      draggable: e.mode !== "locked",
      onDragstart: r,
      onDblclick: l[2] || (l[2] = (u) => e.mode === "palette" && o("add"))
    }, [
      h("div", Xa, [
        e.mode === "locked" ? (p(), D(c(F), {
          key: 0,
          icon: "tabler:lock",
          class: "ks-pcard-grip locked",
          "aria-hidden": "true"
        })) : (p(), D(c(F), {
          key: 1,
          icon: "tabler:grip-vertical",
          class: "ks-pcard-grip",
          "aria-hidden": "true"
        })),
        h("div", Ja, [
          h("div", Qa, [
            e.policy.effect === "allow" || e.policy.effect === "deny" ? (p(), D(qe, {
              key: 0,
              severity: e.policy.effect === "allow" ? "success" : "danger"
            }, {
              default: E(() => [
                R(V(e.policy.effect === "deny" ? "Blocks" : "Allows"), 1)
              ]),
              _: 1
            }, 8, ["severity"])) : N("", !0),
            h("span", {
              class: "ks-pcard-title",
              title: a.value
            }, V(a.value), 9, ei)
          ]),
          e.policy.comment ? (p(), $("div", ti, V(e.policy.comment), 1)) : N("", !0)
        ]),
        e.mode === "palette" ? (p(), $("button", {
          key: 2,
          class: "ks-pcard-act add",
          "aria-label": `Add permission ${a.value}`,
          onClick: l[0] || (l[0] = je((u) => o("add"), ["stop"]))
        }, [
          O(c(F), {
            icon: "tabler:plus",
            "aria-hidden": "true"
          })
        ], 8, ni)) : e.mode === "selected" ? (p(), $("button", {
          key: 3,
          class: "ks-pcard-act remove",
          "aria-label": `Remove permission ${a.value}`,
          onClick: l[1] || (l[1] = je((u) => o("remove"), ["stop"]))
        }, [
          O(c(F), {
            icon: "tabler:x",
            "aria-hidden": "true"
          })
        ], 8, oi)) : N("", !0)
      ])
    ], 42, Ya));
  }
}), ai = { class: "ks" }, ii = { class: "ks-rail-search" }, si = { class: "ks-rail-list" }, ri = {
  key: 0,
  class: "ks-rail-group"
}, li = ["onClick"], ui = { class: "ks-scope-name" }, di = ["onClick"], ci = { class: "ks-scope-name" }, mi = {
  key: 0,
  class: "ks-builder"
}, pi = { class: "ks-builder-head" }, fi = { class: "ks-builder-title" }, vi = { class: "ks-builder-acts" }, hi = {
  key: 0,
  class: "ks-overlay-warn"
}, yi = {
  key: 1,
  class: "ks-view-note"
}, gi = { class: "ks-fields" }, bi = {
  key: 0,
  class: "ks-pane locked-pane"
}, ki = { class: "ks-pane-head" }, Si = { class: "ks-pane-sub" }, $i = { class: "ks-pane-body" }, _i = {
  key: 0,
  class: "ks-pane-empty"
}, wi = { class: "ks-pane" }, Ci = { class: "ks-pane-search" }, Oi = { class: "ks-pane-body" }, Pi = {
  key: 0,
  class: "ks-pane-empty"
}, Ti = { class: "ks-pane-head" }, Li = { class: "ks-pane-sub" }, xi = { class: "ks-pane-body" }, ji = ["onDrop"], Ni = {
  key: 0,
  class: "ks-drop-hint"
}, Ai = {
  key: 1,
  class: "ks-view"
}, Ei = { class: "ks-builder-head" }, Vi = { class: "ks-builder-title" }, Ri = { class: "ks-builder-acts" }, Di = { class: "ks-pane-body ks-view-list" }, Ii = {
  key: 0,
  class: "ks-pane-empty"
}, Mi = {
  key: 0,
  class: "ks-ext-block"
}, Bi = { class: "ks-ext-head" }, Ui = { class: "ks-pane-body ks-view-list" }, zi = /* @__PURE__ */ J({
  __name: "Security",
  setup(e) {
    const t = _a(), { scopes: n, policies: o, loading: a, saving: r, error: s } = t, l = I(""), u = I(""), d = I(null), i = I(null), m = I("scopes"), v = I(null), y = I(!1);
    async function w(g) {
      m.value = String(g), g === "delegations" && (y.value = !0, await rt(), await v.value?.load());
    }
    An(async () => {
      await t.load(), m.value === "delegations" && await v.value?.load();
    });
    const T = K(() => {
      const g = {};
      for (const f of o.value) g[f.id] = f;
      return g;
    }), P = K(() => {
      const g = l.value.trim().toLowerCase(), f = (k) => !g || k.label.toLowerCase().includes(g) || k.id.toLowerCase().includes(g);
      return {
        custom: n.value.filter((k) => k.source === "custom" && f(k)),
        builtin: n.value.filter((k) => k.source !== "custom" && f(k))
      };
    }), C = K(() => n.value.find((g) => g.id === d.value) || null), x = K(() => C.value && C.value.source !== "custom" ? C.value : null), G = K(() => {
      if (!i.value) return [];
      const g = /* @__PURE__ */ new Set([...i.value.policies, ...i.value.base.map((k) => k.id)]), f = u.value.trim().toLowerCase();
      return o.value.filter((k) => !g.has(k.id) && (!f || (k.title || "").toLowerCase().includes(f) || k.id.toLowerCase().includes(f) || (k.comment || "").toLowerCase().includes(f)));
    }), Z = K(
      () => i.value ? i.value.policies.map((g) => T.value[g] || { id: g }) : []
    );
    function _(g) {
      d.value = g.id, i.value = g.source === "custom" ? { slug: g.slug || "", label: g.label, description: g.description, policies: g.policies.map((f) => f.id), enabled: g.enabled, isNew: !1, target: "", base: [] } : null;
    }
    function B() {
      d.value = null, i.value = { slug: Array.from(crypto.getRandomValues(new Uint8Array(16)), (g) => g.toString(16).padStart(2, "0")).join(""), label: "", description: "", policies: [], enabled: !0, isNew: !0, target: "", base: [] };
    }
    function A(g) {
      B(), Object.assign(i.value, {
        label: g.label ? `Copy of ${g.label}` : "",
        description: g.description,
        policies: [...g.policies.map((f) => f.id), ...(g.overlay_policies ?? []).map((f) => f.id)]
      });
    }
    function M(g) {
      return g.replace(/[^a-z0-9]+/gi, "_").replace(/^_+|_+$/g, "");
    }
    function X(g) {
      d.value = g.id, i.value = {
        slug: g.overlay_slug || M(g.id),
        label: g.label || Q(g.id),
        description: g.description,
        policies: (g.overlay_policies ?? []).map((f) => f.id),
        enabled: !0,
        isNew: !g.overlay_slug,
        target: g.id,
        base: g.policies
      };
    }
    const U = K(() => !!i.value && i.value.target !== "");
    function ee(g) {
      i.value && !i.value.policies.includes(g) && i.value.policies.push(g);
    }
    function ne(g) {
      i.value && (i.value.policies = i.value.policies.filter((f) => f !== g));
    }
    function se(g) {
      const f = g.dataTransfer?.getData("text/plain");
      f && ee(f);
    }
    function L(g, f) {
      g.stopPropagation();
      const k = g.dataTransfer?.getData("text/plain");
      if (!k || !i.value || k === f) return;
      const Y = i.value.policies, we = Y.indexOf(k);
      we !== -1 && Y.splice(we, 1);
      const De = Y.indexOf(f);
      Y.splice(De === -1 ? Y.length : De, 0, k);
    }
    const b = K(() => i.value ? !i.value.isNew || i.value.target ? i.value.slug : `${M(i.value.label.normalize("NFKD").replace(/\p{M}/gu, "")).toLowerCase() || "role"}_${i.value.slug}` : ""), S = K(() => !!i.value && i.value.label.trim() !== "" && i.value.policies.length > 0), H = I("");
    let W = null;
    jn(() => {
      W && clearTimeout(W);
    });
    function he(g) {
      H.value = g, W && clearTimeout(W), W = setTimeout(() => {
        H.value = "";
      }, 3e3);
    }
    async function re() {
      if (!i.value || !S.value) return;
      const g = i.value, f = b.value, k = i.value.target, Y = i.value.label.trim() || f;
      await t.saveScope({
        slug: f,
        target: k,
        label: i.value.label.trim(),
        description: i.value.description.trim(),
        policies: i.value.policies,
        enabled: i.value.enabled
      }) && (g.slug = f, g.isNew = !1, i.value === g && (d.value = k || `kickside.security.scopes:${f}`), he(`Saved “${Y}”. The role will be available when assigning users.`));
    }
    async function oe() {
      if (!i.value || i.value.isNew) return;
      const g = U.value;
      if (!await Ut.confirm({
        header: g ? "Remove extension?" : "Delete role?",
        message: g ? "This removes the added permissions. Users keep the role’s original permissions." : "This removes the custom role and its permissions.",
        icon: "tabler:trash",
        acceptLabel: g ? "Remove extension" : "Delete",
        rejectLabel: "Cancel",
        acceptClass: "p-button-danger"
      })) return;
      await t.deleteScope(i.value.slug) && (i.value = null, d.value = null);
    }
    function Q(g) {
      return g.includes(":") ? g.split(":").slice(-1)[0] : g;
    }
    return (g, f) => (p(), $("div", ai, [
      O(c(Vn), {
        class: "ks-tabs",
        value: m.value,
        "onUpdate:value": w
      }, {
        default: E(() => [
          O(c(En), { pt: { tabList: { "aria-label": "Security administration" } } }, {
            default: E(() => [
              O(c(mt), { value: "scopes" }, {
                default: E(() => [...f[11] || (f[11] = [
                  R("Roles", -1)
                ])]),
                _: 1
              }),
              O(c(mt), {
                value: "delegations",
                "data-tab": "delegations"
              }, {
                default: E(() => [...f[12] || (f[12] = [
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
      y.value ? dt((p(), D(Za, {
        key: 0,
        ref_key: "delegationPanel",
        ref: v,
        scopes: c(n)
      }, null, 8, ["scopes"])), [
        [ct, m.value === "delegations"]
      ]) : N("", !0),
      c(s) ? (p(), D(c(Fe), {
        key: 1,
        severity: "danger",
        class: "ks-top-notice",
        onDismiss: f[0] || (f[0] = (k) => s.value = "")
      }, {
        default: E(() => [
          R(V(c(s)), 1)
        ]),
        _: 1
      })) : H.value ? (p(), D(c(Fe), {
        key: 2,
        severity: "success",
        class: "ks-top-notice",
        onDismiss: f[1] || (f[1] = (k) => H.value = "")
      }, {
        default: E(() => [
          R(V(H.value), 1)
        ]),
        _: 1
      })) : N("", !0),
      m.value === "scopes" && c(a) && !c(n).length ? (p(), D(c(sn), {
        key: 3,
        label: "Loading security…"
      })) : dt((p(), D(c(eo), { key: 4 }, {
        rail: E(() => [
          O(c(io), {
            title: "Roles",
            count: c(n).length
          }, {
            actions: E(() => [
              O(c(We), {
                icon: "tabler:plus",
                label: "New role",
                disabled: c(r),
                onClick: B
              }, null, 8, ["disabled"]),
              O(c(We), {
                icon: "tabler:refresh",
                label: "Refresh",
                disabled: c(a),
                spin: c(a),
                onClick: c(t).load
              }, null, 8, ["disabled", "spin", "onClick"])
            ]),
            _: 1
          }, 8, ["count"]),
          h("div", ii, [
            O(c(Dt), {
              modelValue: l.value,
              "onUpdate:modelValue": f[2] || (f[2] = (k) => l.value = k),
              placeholder: "Find a role…"
            }, null, 8, ["modelValue"])
          ]),
          h("div", si, [
            P.value.custom.length ? (p(), $("div", ri, "Custom")) : N("", !0),
            (p(!0), $(me, null, pe(P.value.custom, (k) => (p(), $("button", {
              key: k.id,
              class: be(["ks-scope-row", { active: k.id === d.value }]),
              onClick: (Y) => _(k)
            }, [
              h("span", ui, V(k.label || Q(k.id)), 1)
            ], 10, li))), 128)),
            f[13] || (f[13] = h("div", { class: "ks-rail-group" }, "Default", -1)),
            (p(!0), $(me, null, pe(P.value.builtin, (k) => (p(), $("button", {
              key: k.id,
              class: be(["ks-scope-row", { active: k.id === d.value }]),
              onClick: (Y) => _(k)
            }, [
              h("span", ci, V(k.label || Q(k.id)), 1)
            ], 10, di))), 128))
          ])
        ]),
        default: E(() => [
          i.value ? (p(), $("div", mi, [
            h("div", pi, [
              h("div", fi, [
                O(c(F), {
                  icon: U.value ? "tabler:stack-2" : "tabler:shield-lock",
                  "aria-hidden": "true"
                }, null, 8, ["icon"]),
                h("span", null, V(U.value ? `Extend ${i.value.label || Q(i.value.target)}` : i.value.isNew ? "New role" : i.value.label || i.value.slug), 1),
                U.value ? (p(), D(c(qe), {
                  key: 0,
                  severity: "warn"
                }, {
                  default: E(() => [...f[14] || (f[14] = [
                    R("Additional permissions", -1)
                  ])]),
                  _: 1
                })) : N("", !0)
              ]),
              h("div", vi, [
                !i.value.isNew && !U.value && C.value ? (p(), D(c(ae), {
                  key: 0,
                  variant: "soft",
                  small: "",
                  icon: "tabler:copy",
                  disabled: c(r),
                  onClick: f[3] || (f[3] = (k) => A(C.value))
                }, {
                  default: E(() => [...f[15] || (f[15] = [
                    R("Duplicate", -1)
                  ])]),
                  _: 1
                }, 8, ["disabled"])) : N("", !0),
                i.value.isNew ? N("", !0) : (p(), D(c(ae), {
                  key: 1,
                  variant: "danger",
                  small: "",
                  icon: "tabler:trash",
                  disabled: c(r),
                  onClick: oe
                }, {
                  default: E(() => [
                    R(V(U.value ? "Remove extension" : "Delete"), 1)
                  ]),
                  _: 1
                }, 8, ["disabled"])),
                O(c(ae), {
                  variant: "primary",
                  small: "",
                  icon: "tabler:device-floppy",
                  loading: c(r),
                  disabled: !S.value,
                  onClick: re
                }, {
                  default: E(() => [
                    R(V(U.value ? "Save extension" : "Save role"), 1)
                  ]),
                  _: 1
                }, 8, ["loading", "disabled"])
              ])
            ]),
            U.value ? (p(), $("div", hi, [
              O(c(F), {
                icon: "tabler:alert-triangle",
                "aria-hidden": "true"
              }),
              h("span", null, [
                f[16] || (f[16] = R("Adding permissions grants them to ", -1)),
                h("b", null, "everyone assigned " + V(C.value?.label || Q(i.value.target)), 1),
                f[17] || (f[17] = R(". Original permissions cannot be removed here. To restrict access, create a new role with only the permissions needed.", -1))
              ])
            ])) : (p(), $("p", yi, "Choose the permissions this role grants, then assign it in System → Users. To restrict a Member, assign this role instead of Member; other assigned roles may still grant access.")),
            h("div", gi, [
              O(c(Ge), { label: "Name" }, {
                default: E(() => [
                  O(c(It), {
                    modelValue: i.value.label,
                    "onUpdate:modelValue": f[4] || (f[4] = (k) => i.value.label = k),
                    placeholder: "Reviewer"
                  }, null, 8, ["modelValue"])
                ]),
                _: 1
              }),
              O(c(Ge), { label: "Description" }, {
                default: E(() => [
                  O(c(It), {
                    modelValue: i.value.description,
                    "onUpdate:modelValue": f[5] || (f[5] = (k) => i.value.description = k),
                    placeholder: "Read-only reviewer role"
                  }, null, 8, ["modelValue"])
                ]),
                _: 1
              })
            ]),
            h("div", {
              class: be(["ks-panes", { three: U.value }])
            }, [
              U.value ? (p(), $("section", bi, [
                h("header", ki, [
                  f[18] || (f[18] = h("span", null, "Original permissions", -1)),
                  h("span", Si, V(i.value.base.length) + " · locked", 1)
                ]),
                h("div", $i, [
                  (p(!0), $(me, null, pe(i.value.base, (k) => (p(), D(Pe, {
                    key: k.id,
                    policy: k,
                    mode: "locked"
                  }, null, 8, ["policy"]))), 128)),
                  i.value.base.length ? N("", !0) : (p(), $("div", _i, "No original permissions."))
                ])
              ])) : N("", !0),
              h("section", wi, [
                f[19] || (f[19] = h("header", { class: "ks-pane-head" }, [
                  h("span", null, "Available permissions"),
                  h("span", { class: "ks-pane-sub" }, "Click + to add")
                ], -1)),
                h("div", Ci, [
                  O(c(Dt), {
                    modelValue: u.value,
                    "onUpdate:modelValue": f[6] || (f[6] = (k) => u.value = k),
                    placeholder: "Search permissions…"
                  }, null, 8, ["modelValue"])
                ]),
                h("div", Oi, [
                  (p(!0), $(me, null, pe(G.value, (k) => (p(), D(Pe, {
                    key: k.id,
                    policy: k,
                    mode: "palette",
                    onAdd: (Y) => ee(k.id)
                  }, null, 8, ["policy", "onAdd"]))), 128)),
                  G.value.length ? N("", !0) : (p(), $("div", Pi, "No matching permissions."))
                ])
              ]),
              h("section", {
                class: "ks-pane drop",
                onDragover: f[8] || (f[8] = je(() => {
                }, ["prevent"])),
                onDrop: se
              }, [
                h("header", Ti, [
                  h("span", null, V(U.value ? "Added by you" : "In this role"), 1),
                  h("span", Li, V(i.value.policies.length) + " " + V(i.value.policies.length === 1 ? "permission" : "permissions"), 1)
                ]),
                h("div", xi, [
                  (p(!0), $(me, null, pe(Z.value, (k) => (p(), $("div", {
                    key: k.id,
                    onDragover: f[7] || (f[7] = je(() => {
                    }, ["prevent"])),
                    onDrop: (Y) => L(Y, k.id)
                  }, [
                    O(Pe, {
                      policy: k,
                      mode: "selected",
                      onRemove: (Y) => ne(k.id)
                    }, null, 8, ["policy", "onRemove"])
                  ], 40, ji))), 128)),
                  i.value.policies.length ? N("", !0) : (p(), $("div", Ni, [
                    O(c(F), {
                      icon: "tabler:drag-drop",
                      "aria-hidden": "true"
                    }),
                    f[20] || (f[20] = h("span", null, "Use + on an available permission, or drag it here.", -1))
                  ]))
                ])
              ], 32)
            ], 2)
          ])) : x.value ? (p(), $("div", Ai, [
            h("div", Ei, [
              h("div", Vi, [
                O(c(F), {
                  icon: "tabler:shield",
                  "aria-hidden": "true"
                }),
                h("span", null, V(x.value.label || Q(x.value.id)), 1)
              ]),
              h("div", Ri, [
                O(c(ae), {
                  variant: "primary",
                  small: "",
                  icon: "tabler:stack-2",
                  onClick: f[9] || (f[9] = (k) => X(x.value))
                }, {
                  default: E(() => [
                    R(V(x.value.overlay_slug ? "Edit extension" : "Add permissions"), 1)
                  ]),
                  _: 1
                }),
                O(c(ae), {
                  variant: "soft",
                  small: "",
                  icon: "tabler:copy",
                  onClick: f[10] || (f[10] = (k) => A(x.value))
                }, {
                  default: E(() => [...f[21] || (f[21] = [
                    R("Copy role", -1)
                  ])]),
                  _: 1
                })
              ])
            ]),
            f[23] || (f[23] = h("p", { class: "ks-view-note" }, " Included with the application. Adding permissions affects everyone with this role. For restricted access, create a new role with only the permissions needed and assign it in System → Users instead of this role. Other assigned roles may still grant access. ", -1)),
            h("div", Di, [
              (p(!0), $(me, null, pe(x.value.policies, (k) => (p(), D(Pe, {
                key: k.id,
                policy: k,
                mode: "locked"
              }, null, 8, ["policy"]))), 128)),
              x.value.policies.length ? N("", !0) : (p(), $("div", Ii, "No permissions in this role."))
            ]),
            x.value.overlay_policies && x.value.overlay_policies.length ? (p(), $("div", Mi, [
              h("div", Bi, [
                O(c(F), {
                  icon: "tabler:stack-2",
                  "aria-hidden": "true"
                }),
                f[22] || (f[22] = h("span", null, "Additional permissions", -1)),
                O(c(qe), { severity: "warn" }, {
                  default: E(() => [
                    R(V(x.value.overlay_policies.length), 1)
                  ]),
                  _: 1
                })
              ]),
              h("div", Ui, [
                (p(!0), $(me, null, pe(x.value.overlay_policies, (k) => (p(), D(Pe, {
                  key: k.id,
                  policy: k,
                  mode: "locked"
                }, null, 8, ["policy"]))), 128))
              ])
            ])) : N("", !0)
          ])) : (p(), D(c(ka), {
            key: 2,
            icon: "tabler:shield-lock",
            title: "Roles",
            hint: "Choose a role to view its permissions, or create one with the permissions your team needs. Assign roles in System → Users.",
            cta: "New role",
            "cta-icon": "tabler:plus",
            onCta: B
          }))
        ]),
        _: 1
      }, 512)), [
        [ct, m.value === "scopes"]
      ])
    ]));
  }
}), is = {
  rootComponent: zi,
  plugins: [Yn]
};
export {
  is as mountConfig
};
//# sourceMappingURL=lazy-mount-NA3JCGs_.js.map

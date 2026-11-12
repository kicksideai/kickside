import ht from "primevue/config";
import vt from "primevue/contextmenu";
import yt from "primevue/menu";
import gt from "primevue/portal";
import { renderSlot as Ve, createCommentVNode as x, h as bt, Teleport as kt, defineComponent as Ze, ref as C, onMounted as et, watch as we, onBeforeUnmount as tt, openBlock as h, createElementBlock as g, computed as P, createElementVNode as n, toDisplayString as M, createVNode as y, unref as a, normalizeClass as B, createTextVNode as _, withDirectives as He, vModelText as Ne, createBlock as de, Fragment as q, renderList as pe, withModifiers as Y } from "vue";
import { Icon as v } from "@iconify/vue";
import { loadByTagName as wt, api as Ce, host as ke, on as Ct } from "@wippy-fe/proxy";
import { a as _t } from "./wc-runtime-BMe_f3Uc.js";
import Tt from "primevue/colorpicker";
const Lt = "data-wippy-overlay-layer";
function ot() {
  return typeof window < "u" && typeof window.document < "u";
}
function at() {
  return ot() && typeof HTMLElement < "u" && Object.hasOwn(HTMLElement.prototype, "popover");
}
function xt() {
  return at() && typeof CSS < "u" && typeof CSS.supports == "function" && CSS.supports("anchor-name: --a") && CSS.supports("position-area", "bottom span-right") && CSS.supports("position-try-fallbacks", "flip-block") && CSS.supports("min-width", "min(anchor-size(width), 100vw)") && CSS.supports("max-width", "stretch");
}
const At = /\bp-(?:select|multiselect|treeselect|cascadeselect)-overlay\b/;
let Dt = 0;
const fe = /* @__PURE__ */ new WeakMap();
function Be(t, o) {
  const r = t.style;
  r.setProperty("position", "fixed", "important"), r.setProperty("inset", "auto", "important"), r.setProperty("margin", "0", "important"), r.setProperty("position-anchor", o), r.setProperty("position-area", "bottom span-right"), r.setProperty("position-try-fallbacks", "flip-block, flip-inline, flip-block flip-inline"), r.setProperty("min-width", "min(anchor-size(width), 100vw)", "important"), r.setProperty("max-width", "stretch", "important");
}
function St(t, o) {
  if (!At.test(t.className))
    return;
  const r = t.style.cssText;
  Be(t, o), t.getAttribute("popover") !== "manual" && t.setAttribute("popover", "manual");
  try {
    t.matches(":popover-open") || t.showPopover();
  } catch {
  }
  if (!t.matches(":popover-open")) {
    t.removeAttribute("popover"), t.style.cssText = r;
    return;
  }
  if (!fe.has(t)) {
    const u = new MutationObserver(() => {
      const d = t.style;
      (d.top !== "auto" || d.left !== "auto" || d.margin !== "0px" || d.getPropertyPriority("top") !== "important" || d.getPropertyPriority("left") !== "important" || d.getPropertyPriority("margin") !== "important" || d.getPropertyPriority("min-width") !== "important" || d.maxWidth !== "stretch" || d.getPropertyPriority("max-width") !== "important") && Be(t, o);
    });
    u.observe(t, { attributes: !0, attributeFilter: ["style"] }), fe.set(t, u);
  }
}
function xe(t) {
  const o = fe.get(t);
  o && (o.disconnect(), fe.delete(t));
}
function Et(t) {
  const o = t && typeof t.getRootNode == "function" ? t.getRootNode() : null;
  return o instanceof ShadowRoot ? o : null;
}
function _e(t) {
  t.style.top = "0px", t.style.left = "0px";
  const o = t.getBoundingClientRect();
  t.style.top = `${-window.scrollY - o.top}px`, t.style.left = `${-window.scrollX - o.left}px`;
}
const me = /* @__PURE__ */ new Set(), Ae = /* @__PURE__ */ new WeakMap();
let Ue = !1, Te = !1;
function $t() {
  Te = !1;
  for (const t of me) {
    if (!t.isConnected) {
      for (const o of Array.from(t.children))
        o instanceof HTMLElement && xe(o);
      me.delete(t), Ae.get(t)?.disconnect();
      continue;
    }
    t.childElementCount > 0 && _e(t);
  }
}
function ze() {
  Te || (Te = !0, requestAnimationFrame($t));
}
function Mt(t) {
  const o = document.createElement("div");
  o.setAttribute(Lt, "");
  const r = at();
  if (o.style.cssText = r ? "position:fixed;width:0 !important;height:0 !important;margin:0 !important;border:0 !important;padding:0 !important;background:transparent !important;color:inherit !important;overflow:visible !important;" : "position:fixed;top:0;left:0;width:0;height:0;", r && o.setAttribute("popover", "manual"), t.appendChild(o), r) {
    try {
      o.showPopover();
    } catch {
    }
    o.matches(":popover-open") || (o.removeAttribute("popover"), o.style.cssText = "position:fixed;top:0;left:0;width:0;height:0;");
  }
  _e(o);
  const u = new MutationObserver((d) => {
    const f = o.__wippyAnchorName;
    for (const k of d) {
      if (f)
        for (const b of Array.from(k.addedNodes))
          b instanceof HTMLElement && St(b, f);
      for (const b of Array.from(k.removedNodes))
        b instanceof HTMLElement && xe(b);
    }
    o.isConnected && o.childElementCount > 0 && _e(o);
  });
  return u.observe(o, { childList: !0 }), Ae.set(o, u), me.add(o), Ue || (Ue = !0, window.addEventListener("scroll", ze, { capture: !0, passive: !0 }), window.addEventListener("resize", ze, { passive: !0 })), o;
}
function Fe(t) {
  if (!(!t.hostRoot || t.layer) && (t.layer = Mt(t.hostRoot), xt())) {
    const o = t.$el ? t.$el.parentElement : null;
    o && (t.anchorName = `--wippy-a-${++Dt}`, t.anchorTrigger = o, o.style.setProperty("anchor-name", t.anchorName), t.layer.__wippyAnchorName = t.anchorName);
  }
}
function je(t) {
  if (t.anchorTrigger && (t.anchorTrigger.style.removeProperty("anchor-name"), t.anchorTrigger = null), t.anchorName = null, t.layer) {
    for (const o of Array.from(t.layer.children))
      o instanceof HTMLElement && xe(o);
    me.delete(t.layer), Ae.get(t.layer)?.disconnect(), t.layer.remove(), t.layer = null;
  }
}
let Ge = !1;
function It() {
  if (Ge)
    return;
  const t = yt;
  !t.methods || typeof t.methods.bindOutsideClickListener != "function" || (t.methods.bindOutsideClickListener = function() {
    this.outsideClickListener || (this.outsideClickListener = (o) => {
      const r = o.composedPath(), u = this.container && !r.includes(this.container), d = !(this.target && r.includes(this.target));
      this.overlayVisible && u && d ? this.hide() : !this.popup && u && d && (this.focusedOptionIndex = -1);
    }, document.addEventListener("click", this.outsideClickListener, !0));
  }, Ge = !0);
}
let Ke = !1;
function Ot() {
  if (Ke)
    return;
  const t = vt;
  !t.methods || typeof t.methods.bindOutsideClickListener != "function" || (t.methods.bindOutsideClickListener = function() {
    this.outsideClickListener || (this.outsideClickListener = (o) => {
      const r = o.composedPath(), u = this.container && !r.includes(this.container), d = this.visible ? !(this.target && r.includes(this.target)) : !0;
      u && d && this.hide();
    }, document.addEventListener("click", this.outsideClickListener, !0));
  }, Ke = !0);
}
let We = !1;
function Pt() {
  if (We)
    return;
  We = !0;
  const t = gt;
  t.computed = t.computed || {}, t.computed.inline = function() {
    return !!this.disabled || this.appendTo === "self";
  }, t.computed.resolvedTarget = function() {
    return this.appendTo == null || this.appendTo === "body" ? this.hostRoot ? this.layer : document.body : this.appendTo;
  }, t.data = function() {
    return { mounted: !1, hostRoot: null, layer: null, anchorName: null, anchorTrigger: null };
  }, t.mounted = function() {
    ot() && (this.hostRoot = Et(this.$el), this.mounted = !0, this.hostRoot && (this.inline || Fe(this), this.$watch("inline", (o) => {
      o ? je(this) : Fe(this);
    })));
  }, t.render = function() {
    return this.inline ? Ve(this.$slots, "default", { key: 0 }) : this.mounted ? bt(kt, { key: 1, to: this.resolvedTarget || document.body }, [
      Ve(this.$slots, "default")
    ]) : x("", !0);
  }, t.unmounted = function() {
    je(this);
  };
}
const Rt = {
  install: (t) => {
    It(), Ot(), Pt(), t.use(ht, { theme: "none" });
  }
}, qe = /* @__PURE__ */ Ze({
  __name: "IconField",
  props: {
    modelValue: {},
    fallback: {}
  },
  emits: ["update:modelValue"],
  setup(t, { emit: o }) {
    const r = t, u = o, d = C(null);
    let f = null;
    function k(T) {
      u("update:modelValue", T.detail || "");
    }
    async function b() {
      if (d.value) {
        f && f.removeEventListener("select", k), d.value.innerHTML = "";
        try {
          customElements.get("wc-icon-picker") || await wt("wc-icon-picker", { timeoutMs: 8e3 });
        } catch {
        }
        d.value && (f = document.createElement("wc-icon-picker"), f.setAttribute("value", r.modelValue || ""), r.fallback && f.setAttribute("fallback", r.fallback), f.addEventListener("select", k), d.value.appendChild(f));
      }
    }
    return et(b), we(() => r.modelValue, (T) => {
      f && f.getAttribute("value") !== T && f.setAttribute("value", T || "");
    }), tt(() => {
      f && f.removeEventListener("select", k);
    }), (T, E) => (h(), g("div", {
      ref_key: "host",
      ref: d,
      class: "wc-iconfield"
    }, null, 512));
  }
}), Ye = "#d63a22", De = "--p-primary";
function Vt(t) {
  const o = /^rgba?\(([^)]+)\)/i.exec((t || "").trim());
  if (!o) return null;
  const r = o[1].split(",").map((d) => parseFloat(d.trim()));
  if (r.length < 3 || r.slice(0, 3).some((d) => Number.isNaN(d))) return null;
  const u = (d) => Math.max(0, Math.min(255, Math.round(d))).toString(16).padStart(2, "0");
  return `#${u(r[0])}${u(r[1])}${u(r[2])}`;
}
function Se(t) {
  let o = (t || "").trim().replace(/^#/, "");
  return o.length === 3 && (o = o[0] + o[0] + o[1] + o[1] + o[2] + o[2]), /^[0-9a-fA-F]{6}$/.test(o) ? `#${o.toLowerCase()}` : null;
}
function Je(t) {
  const o = Se(t);
  if (!o) return null;
  const r = o.slice(1);
  return {
    r: parseInt(r.slice(0, 2), 16),
    g: parseInt(r.slice(2, 4), 16),
    b: parseInt(r.slice(4, 6), 16)
  };
}
function Le(t, o) {
  const r = Se(t);
  if (!r) return "";
  const u = `${De}: ${r};`;
  return o === ":host" ? `:host { ${u} }` : [
    `:root { ${u} }`,
    `@media (prefers-color-scheme: dark) { :root:not(.w-theme-light) { ${u} } }`,
    `:root.w-theme-dark, .w-theme-dark { ${u} }`,
    `@media (prefers-color-scheme: light) { :root:not(.w-theme-dark) { ${u} } }`,
    `:root.w-theme-light, .w-theme-light { ${u} }`
  ].join(`
`);
}
function Ht(t, o) {
  if (!t || typeof t != "object") return "";
  const r = t[De];
  return typeof r == "string" ? Le(r, o) : "";
}
const Nt = { r: 255, g: 255, b: 255 }, Bt = { r: 12, g: 14, b: 18 }, Ut = 2, zt = 2;
function Xe(t) {
  const o = (r) => {
    const u = r / 255;
    return u <= 0.03928 ? u / 12.92 : Math.pow((u + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * o(t.r) + 0.7152 * o(t.g) + 0.0722 * o(t.b);
}
function Qe(t, o) {
  const r = Xe(t), u = Xe(o);
  return (Math.max(r, u) + 0.05) / (Math.min(r, u) + 0.05);
}
function Ft(t, o = typeof document < "u" ? document : void 0) {
  const r = Se(t);
  if (!r) return null;
  if (!o || !o.body || !o.defaultView) return Je(r);
  const u = o.createElement("span");
  u.style.setProperty(De, r), u.style.color = "var(--p-primary-color)", u.style.display = "none", o.body.appendChild(u);
  const d = o.defaultView.getComputedStyle(u).color;
  return u.remove(), Je(Vt(d) || r);
}
function jt(t) {
  const o = Ft(t);
  if (!o) return null;
  const r = Qe(o, Nt), u = Qe(o, Bt), d = r >= Ut, f = u >= zt;
  let k = "";
  return !d && !f ? k = "This tone is too low-contrast - buttons and accents would be unreadable in both light and dark mode." : d ? f || (k = "This tone is too dark - accents would be invisible against the dark background.") : k = "This tone is too light - white button text and accents would be unreadable in light mode.", { ok: d && f, onLight: r, onDark: u, reason: k };
}
function Gt({ items: t, categories: o, overrides: r, home: u }) {
  const d = (l) => l.route_name || l.id;
  function f(l, i) {
    const p = d(l), L = { ...r.value[p] || {} };
    for (const [$, S] of Object.entries(i))
      S === void 0 || S === "" ? delete L[$] : L[$] = S;
    r.value = { ...r.value, [p]: L };
  }
  function k(l, i) {
    f(l, { hidden: i || void 0 }), l.hidden = i;
  }
  function b(l, i) {
    f(l, { category: i }), l.category = i;
  }
  function T(l, i) {
    f(l, { order: i }), l.order = i;
  }
  function E(l, i) {
    const p = i.replace(/^\s+/, "");
    l.label = p, f(l, { label: p || void 0 });
  }
  function I(l, i) {
    const p = (i || "").trim();
    l.icon = p, f(l, { icon: p || void 0 });
  }
  function F(l) {
    const i = r.value[d(l)];
    return !!i && (i.label !== void 0 || i.icon !== void 0);
  }
  const A = P(() => [...o.value].sort((l, i) => l.order - i.order));
  function R(l) {
    return t.value.filter((i) => !i.hidden && (i.category || "") === l).sort((i, p) => i.order - p.order || i.label.localeCompare(p.label));
  }
  const he = P(() => {
    const l = [];
    l.push({ key: "", label: "Ungrouped", real: !1 });
    for (const p of A.value) l.push({ key: p.key, label: p.label || p.key, real: !0 });
    const i = /* @__PURE__ */ new Set(["", ...o.value.map((p) => p.key)]);
    for (const p of t.value)
      p.category && !i.has(p.category) && (i.add(p.category), l.push({ key: p.category, label: p.category, real: !1 }));
    return l;
  }), ve = P(() => t.value.filter((l) => l.hidden)), J = (l) => o.value.find((i) => i.key === l), D = C(null), j = C(null), X = C(null), w = (l) => t.value.find((i) => i.id === l);
  function Q(l, i) {
    D.value = l.id, i.dataTransfer && (i.dataTransfer.effectAllowed = "move", i.dataTransfer.setData("text/plain", l.id));
  }
  function O() {
    D.value = null, j.value = null, X.value = null;
  }
  function ye(l) {
    const i = D.value ? w(D.value) : null;
    if (!i || i.id === l.id) return O();
    const p = l.category || "", L = R(p).filter((S) => S.id !== i.id), $ = L.indexOf(l);
    L.splice($ < 0 ? L.length : $, 0, i), b(i, p), L.forEach((S, H) => T(S, H * 10)), O();
  }
  function ge(l) {
    const i = D.value ? w(D.value) : null;
    if (!i) return O();
    const p = R(l).filter((L) => L.id !== i.id);
    p.push(i), b(i, l), p.forEach((L, $) => T(L, $ * 10)), O();
  }
  function U(l, i) {
    j.value = l, i.dataTransfer && (i.dataTransfer.effectAllowed = "move", i.dataTransfer.setData("text/plain", "cat:" + l));
  }
  function Z(l) {
    const i = j.value;
    if (!i || i === l) return O();
    const p = [...A.value], L = p.findIndex((H) => H.key === i), $ = p.findIndex((H) => H.key === l);
    if (L < 0 || $ < 0) return O();
    const [S] = p.splice(L, 1);
    p.splice($, 0, S), p.forEach((H, oe) => {
      const ae = o.value.find((be) => be.key === H.key);
      ae && (ae.order = oe * 10);
    }), O();
  }
  let G = 0;
  function le() {
    G += 1;
    const l = A.value[A.value.length - 1];
    o.value.push({ key: "cat_" + Date.now().toString(36) + "_" + G, label: "New category", icon: "tabler:folder", order: (l?.order ?? 0) + 10 });
  }
  function K(l) {
    for (const i of t.value) i.category === l && b(i, "");
    o.value = o.value.filter((i) => i.key !== l);
  }
  function ee(l, i) {
    const p = J(l);
    p && (p.label = i);
  }
  function te(l, i) {
    const p = J(l);
    p && (p.icon = (i || "").trim() || void 0);
  }
  function z(l) {
    return !!u.value && u.value === l.path;
  }
  function ie(l) {
    u.value = z(l) ? "" : l.path;
  }
  return {
    itemKey: d,
    patchOverride: f,
    setHidden: k,
    setCategory: b,
    setOrder: T,
    setLabel: E,
    setIcon: I,
    hasOverride: F,
    orderedCats: A,
    itemsOf: R,
    editorGroups: he,
    hiddenItems: ve,
    catByKey: J,
    dragItemId: D,
    dragCatKey: j,
    overGroup: X,
    onItemDragStart: Q,
    endDrag: O,
    onItemDrop: ye,
    onGroupDrop: ge,
    onCatDragStart: U,
    onCatDrop: Z,
    addCategory: le,
    removeCategory: K,
    renameCategory: ee,
    setCatIcon: te,
    isHome: z,
    setHome: ie
  };
}
function Kt({ logoUrl: t, error: o, apiError: r }) {
  const u = C(!1);
  async function d(k) {
    const b = k.target, T = b.files && b.files[0];
    if (T) {
      if (!T.type.startsWith("image/")) {
        o.value = "Logo must be an image", b.value = "";
        return;
      }
      if (T.size > 2 * 1024 * 1024) {
        o.value = "Logo too large (max 2 MB)", b.value = "";
        return;
      }
      u.value = !0, o.value = "";
      try {
        const E = new FormData();
        E.append("logo", T);
        const { data: I } = await Ce.post("/api/v1/nav/logo", E, { headers: { "Content-Type": "multipart/form-data" } });
        if (!I.success || !I.url) throw new Error(I.error || "upload failed");
        t.value = I.url;
      } catch (E) {
        o.value = r(E, "upload failed");
      } finally {
        u.value = !1, b.value = "";
      }
    }
  }
  function f() {
    t.value = "";
  }
  return { uploadingLogo: u, uploadLogo: d, removeLogo: f };
}
const Wt = { class: "ap" }, qt = { class: "ap-body" }, Yt = { class: "ap-bar" }, Jt = {
  key: 0,
  class: "ap-dirty ap-dirty-warn"
}, Xt = {
  key: 1,
  class: "ap-dirty"
}, Qt = ["disabled"], Zt = ["disabled"], eo = {
  key: 0,
  class: "ap-msg ap-err"
}, to = {
  key: 1,
  class: "ap-loading"
}, oo = {
  key: 2,
  class: "ap-grid"
}, ao = { class: "ap-side" }, no = { class: "ap-card" }, ro = { class: "ap-h" }, lo = { class: "ap-logo" }, io = { class: "ap-logo-prev" }, so = ["src"], uo = { class: "ap-logo-actions" }, co = ["accept", "disabled"], po = { class: "ap-hint" }, fo = { class: "ap-tone" }, mo = ["placeholder"], ho = {
  key: 0,
  class: "ap-tone-warn",
  role: "alert"
}, vo = {
  class: "ap-theme-modes",
  role: "group",
  "aria-label": "Color scheme"
}, yo = ["aria-pressed", "onClick"], go = { class: "ap-card" }, bo = { class: "ap-h" }, ko = { class: "ap-layouts" }, wo = { class: "ap-lo-name" }, Co = { class: "ap-lo-name" }, _o = { class: "ap-card ap-legend" }, To = { class: "ap-h" }, Lo = { class: "ap-tips" }, xo = { class: "ap-card ap-structure" }, Ao = { class: "ap-h" }, Do = ["onDragover", "onDragleave", "onDrop"], So = ["onDrop"], Eo = ["onDragstart"], $o = {
  key: 1,
  class: "ap-grip ap-grip-ghost",
  "aria-hidden": "true"
}, Mo = ["value", "onInput"], Io = { class: "ap-tile ap-tile-muted" }, Oo = { class: "ap-field ap-field-strong ap-field-static" }, Po = { class: "ap-count" }, Ro = ["onClick"], Vo = {
  key: 0,
  class: "ap-drop-hint"
}, Ho = ["onDrop"], No = ["onDragstart"], Bo = ["value", "onInput"], Uo = { class: "ap-path" }, zo = {
  key: 0,
  class: "ap-pill kx-tag-sm"
}, Fo = {
  key: 1,
  class: "ap-pill kx-tag-sm ap-pill-home"
}, jo = ["aria-label", "title", "onClick"], Go = ["onClick"], Ko = {
  key: 0,
  class: "ap-hidden"
}, Wo = {
  key: 0,
  class: "ap-hidden-list"
}, qo = { class: "ap-tile" }, Yo = { class: "ap-field ap-field-strong ap-field-static" }, Jo = ["onClick"], Xo = /* @__PURE__ */ Ze({
  __name: "appearance",
  setup(t) {
    const o = C(!0), r = C(!1), u = C("");
    function d(c, e) {
      return c?.response?.data?.error || c?.message || e;
    }
    const f = C("vertical"), k = C(ke.getThemeMode?.() ?? "auto"), b = C([]), T = C([]), E = C({}), I = C(!1), F = C(""), A = C(""), R = C(), he = P(() => R.value?.formats.flatMap((c) => [c.mime, ...c.extensions.map((e) => `.${e}`)]).join(",")), ve = P(() => R.value ? `${R.value.formats.map((c) => c.label).join(", ")} · up to ${R.value.max_bytes / 1048576} MB.` : ""), J = Kt({ logoUrl: A, error: u, apiError: d }), { uploadingLogo: D, uploadLogo: j, removeLogo: X } = J, w = C(""), Q = C(Ye), O = P({
      // PrimeVue's <ColorPicker format="hex"> exchanges a BARE rrggbb string, while the stored
      // setting and the hex text field both keep the #-prefixed form — so strip on the way in
      // and re-add on the way out. Falling back to defaultTone keeps the swatch showing the live
      // theme tone while the setting is unset.
      get: () => (w.value || Q.value).trim().replace(/^#/, ""),
      set: (c) => {
        const e = String(c ?? "").replace(/^#/, "");
        w.value = e ? `#${e}` : "";
      }
    });
    function ye() {
      w.value = "";
    }
    function ge(c) {
      k.value = c, ke.setThemeMode(c);
    }
    const U = P(() => w.value.trim() ? jt(w.value) : null), Z = P(() => !!w.value.trim() && U.value === null), G = P(() => Z.value || !!U.value && !U.value.ok), le = P(() => Z.value ? "Enter a valid hex color, e.g. #2563eb." : U.value && !U.value.ok ? U.value.reason : ""), K = C(""), ee = C(""), te = () => JSON.stringify({
      layout: f.value,
      cats: T.value,
      overrides: E.value,
      title: F.value,
      logo: A.value,
      home: K.value,
      tone: w.value,
      pos: b.value.map((c) => [c.id, c.category, c.order, !!c.hidden])
    }), z = P(() => te() !== ee.value);
    async function ie() {
      o.value = !0, u.value = "";
      try {
        const { data: c } = await Ce.get("/api/v1/nav/list?manage=1");
        if (!c.success) throw new Error(c.error || "failed to load nav");
        R.value = c.logo_upload, b.value = (c.items ?? []).map((s) => ({ ...s })), f.value = c.layout === "horizontal" ? "horizontal" : "vertical";
        const e = c.config ?? {};
        return T.value = Array.isArray(e.categories) ? e.categories.map((s) => ({ ...s })) : [], E.value = e.overrides && typeof e.overrides == "object" ? structuredClone(e.overrides) : {}, F.value = typeof e.title == "string" ? e.title : "", A.value = typeof e.logo_url == "string" ? e.logo_url : "", w.value = typeof e.primary_color == "string" ? e.primary_color : "", re = w.value, K.value = typeof c.home == "string" ? c.home : typeof e.home == "string" ? e.home : "", ee.value = te(), !0;
      } catch (c) {
        return u.value = d(c, "failed to load"), !1;
      } finally {
        o.value = !1;
      }
    }
    const l = Gt({ items: b, categories: T, overrides: E, home: K }), {
      setHidden: i,
      setLabel: p,
      setIcon: L,
      hasOverride: $,
      itemsOf: S,
      editorGroups: H,
      hiddenItems: oe,
      catByKey: ae,
      dragItemId: be,
      overGroup: se,
      onItemDragStart: nt,
      endDrag: ue,
      onItemDrop: rt,
      onGroupDrop: Ee,
      onCatDragStart: lt,
      onCatDrop: it,
      addCategory: $e,
      removeCategory: st,
      renameCategory: ut,
      setCatIcon: ct,
      isHome: ne,
      setHome: dt
    } = l;
    let N = null, Me = !1, re = "", Ie = null;
    async function pt() {
      try {
        const c = await fetch("/app/css-variables.facade.json", { cache: "no-store" });
        if (!c.ok) return;
        const e = await c.json();
        if (e && typeof e == "object") {
          Ie = e;
          const s = e["--p-primary"];
          typeof s == "string" && (Q.value = s), !w.value.trim() && ce.value !== !1 && W("");
        }
      } catch {
      }
    }
    function Oe(c, e) {
      return Le(c, e) || Ht(Ie, e) || Le(Ye, e);
    }
    function W(c) {
      window.dispatchEvent(new CustomEvent("kickside:tone-apply", {
        detail: { hostCss: Oe(c, ":root"), shadowCss: Oe(c, ":host") }
      }));
    }
    tt(() => {
      Me = !0, N && clearTimeout(N), W(re), Pe?.();
    });
    async function ft() {
      if (G.value) return;
      const c = te(), e = w.value;
      r.value = !0, u.value = "";
      try {
        const { data: s } = await Ce.put("/api/v1/nav/config", {
          layout: f.value,
          overrides: E.value,
          categories: T.value,
          title: F.value,
          logo_url: A.value,
          home: K.value,
          primary_color: w.value
        });
        if (!s.success) throw new Error(s.error || "save failed");
        ee.value = c, re = e, W(Me || ce.value === !1 ? re : w.value);
      } catch (s) {
        u.value = d(s, "save failed");
      } finally {
        r.value = !1;
      }
    }
    let Pe = null;
    et(() => {
      k.value = ke.getThemeMode?.() ?? "auto", Pe = Ct("@theme", (c) => {
        k.value = c;
      }), pt();
    });
    let Re = !1;
    async function mt() {
      Re && z.value || await ie() && (Re = !0);
    }
    const ce = _t(mt);
    return we(w, (c) => {
      N && clearTimeout(N), N = null, ce.value !== !1 && (N = setTimeout(() => W(c), 90));
    }), we(ce, (c, e) => {
      e === !0 && c === !1 ? (N && clearTimeout(N), N = null, W(re)) : e === !1 && c === !0 && z.value && W(w.value);
    }), (c, e) => (h(), g("div", Wt, [
      n("div", qt, [
        n("header", Yt, [
          G.value ? (h(), g("span", Jt, M(Z.value ? "Invalid color" : "Tone unreadable"), 1)) : z.value ? (h(), g("span", Xt, "Unsaved changes")) : x("", !0),
          n("button", {
            class: "ap-btn ap-btn-ghost",
            disabled: !z.value || r.value,
            onClick: ie
          }, "Discard", 8, Qt),
          n("button", {
            class: "ap-btn ap-btn-primary",
            disabled: !z.value || r.value || G.value,
            onClick: ft
          }, [
            y(a(v), {
              icon: r.value ? "tabler:loader-2" : "tabler:device-floppy",
              class: B(r.value && "spin"),
              "aria-hidden": "true"
            }, null, 8, ["icon", "class"]),
            _(" " + M(r.value ? "Saving…" : "Save"), 1)
          ], 8, Zt)
        ]),
        u.value ? (h(), g("div", eo, M(u.value), 1)) : x("", !0),
        o.value ? (h(), g("div", to, [
          y(a(v), {
            icon: "tabler:loader-2",
            class: "spin"
          }),
          e[13] || (e[13] = _(" Loading…", -1))
        ])) : (h(), g("div", oo, [
          n("aside", ao, [
            n("section", no, [
              n("header", ro, [
                y(a(v), {
                  icon: "tabler:photo",
                  "aria-hidden": "true"
                }),
                e[14] || (e[14] = _(" Branding", -1))
              ]),
              e[17] || (e[17] = n("p", { class: "ap-sub" }, "Title and logo apply to everyone on this installation — header, login page, and browser tab.", -1)),
              e[18] || (e[18] = n("label", { class: "ap-blabel" }, "Title", -1)),
              He(n("input", {
                "onUpdate:modelValue": e[0] || (e[0] = (s) => F.value = s),
                class: "ap-binput",
                type: "text",
                maxlength: "60",
                placeholder: "KickSide"
              }, null, 512), [
                [Ne, F.value]
              ]),
              e[19] || (e[19] = n("label", { class: "ap-blabel" }, "Logo", -1)),
              n("div", lo, [
                n("span", io, [
                  A.value ? (h(), g("img", {
                    key: 0,
                    src: A.value,
                    alt: "Logo preview"
                  }, null, 8, so)) : (h(), de(a(v), {
                    key: 1,
                    icon: "tabler:photo",
                    "aria-hidden": "true"
                  }))
                ]),
                n("div", uo, [
                  n("label", {
                    class: B(["ap-btn ap-btn-ghost", a(D) && "ap-btn-busy"])
                  }, [
                    y(a(v), {
                      icon: a(D) ? "tabler:loader-2" : "tabler:upload",
                      class: B(a(D) && "spin"),
                      "aria-hidden": "true"
                    }, null, 8, ["icon", "class"]),
                    _(" " + M(a(D) ? "Uploading…" : "Upload") + " ", 1),
                    n("input", {
                      type: "file",
                      accept: he.value,
                      class: "ap-file",
                      disabled: a(D) || !R.value,
                      onChange: e[1] || (e[1] = //@ts-ignore
                      (...s) => a(j) && a(j)(...s))
                    }, null, 40, co)
                  ], 2),
                  A.value ? (h(), g("button", {
                    key: 0,
                    class: "ap-btn ap-btn-ghost ap-danger",
                    onClick: e[2] || (e[2] = //@ts-ignore
                    (...s) => a(X) && a(X)(...s))
                  }, [
                    y(a(v), {
                      icon: "tabler:trash",
                      "aria-hidden": "true"
                    }),
                    e[15] || (e[15] = _(" Remove ", -1))
                  ])) : x("", !0)
                ])
              ]),
              n("p", po, M(ve.value), 1),
              e[20] || (e[20] = n("label", { class: "ap-blabel" }, "Base tone", -1)),
              n("div", fo, [
                y(a(Tt), {
                  modelValue: O.value,
                  "onUpdate:modelValue": e[3] || (e[3] = (s) => O.value = s),
                  format: "hex",
                  class: "ap-tone-swatch",
                  pt: { preview: { class: "ap-tone-preview", "aria-label": "Base tone color", "data-testid": "appearance-base-tone-picker" } }
                }, null, 8, ["modelValue"]),
                He(n("input", {
                  "onUpdate:modelValue": e[4] || (e[4] = (s) => w.value = s),
                  class: "ap-binput ap-tone-hex",
                  type: "text",
                  maxlength: "7",
                  placeholder: Q.value,
                  "aria-label": "Base tone hex"
                }, null, 8, mo), [
                  [Ne, w.value]
                ]),
                w.value ? (h(), g("button", {
                  key: 0,
                  class: "ap-btn ap-btn-ghost",
                  onClick: ye
                }, [
                  y(a(v), {
                    icon: "tabler:rotate",
                    "aria-hidden": "true"
                  }),
                  e[16] || (e[16] = _(" Reset", -1))
                ])) : x("", !0)
              ]),
              le.value ? (h(), g("p", ho, [
                y(a(v), {
                  icon: "tabler:alert-triangle",
                  "aria-hidden": "true"
                }),
                _(" " + M(le.value), 1)
              ])) : x("", !0),
              e[21] || (e[21] = n("p", { class: "ap-hint" }, "Primary color for buttons, links and accents. Applies across the app instantly.", -1)),
              e[22] || (e[22] = n("label", { class: "ap-blabel" }, "Color scheme", -1)),
              n("div", vo, [
                (h(), g(q, null, pe([
                  { mode: "auto", label: "Auto", icon: "tabler:device-desktop" },
                  { mode: "light", label: "Light", icon: "tabler:sun" },
                  { mode: "dark", label: "Dark", icon: "tabler:moon" }
                ], (s) => n("button", {
                  key: s.mode,
                  type: "button",
                  class: B(["ap-theme-mode", k.value === s.mode && "ap-theme-mode-on"]),
                  "aria-pressed": k.value === s.mode,
                  onClick: (m) => ge(s.mode)
                }, [
                  y(a(v), {
                    icon: s.icon,
                    "aria-hidden": "true"
                  }, null, 8, ["icon"]),
                  _(" " + M(s.label), 1)
                ], 10, yo)), 64))
              ]),
              e[23] || (e[23] = n("p", { class: "ap-hint" }, "Auto follows your browser or operating system setting. Changes apply immediately.", -1))
            ]),
            n("section", go, [
              n("header", bo, [
                y(a(v), {
                  icon: "tabler:layout-2",
                  "aria-hidden": "true"
                }),
                e[24] || (e[24] = _(" Layout", -1))
              ]),
              e[31] || (e[31] = n("p", { class: "ap-sub" }, "Where navigation sits.", -1)),
              n("div", ko, [
                n("button", {
                  class: B(["ap-lo", f.value === "vertical" && "ap-lo-on"]),
                  onClick: e[5] || (e[5] = (s) => f.value = "vertical")
                }, [
                  e[26] || (e[26] = n("span", { class: "mock mock-v" }, [
                    n("span", { class: "mock-rail" }, [
                      n("i"),
                      n("i"),
                      n("i")
                    ]),
                    n("span", { class: "mock-fill" })
                  ], -1)),
                  n("span", wo, [
                    e[25] || (e[25] = _("Vertical ", -1)),
                    f.value === "vertical" ? (h(), de(a(v), {
                      key: 0,
                      icon: "tabler:circle-check-filled",
                      "aria-hidden": "true"
                    })) : x("", !0)
                  ]),
                  e[27] || (e[27] = n("span", { class: "ap-lo-desc" }, "Sidebar rail", -1))
                ], 2),
                n("button", {
                  class: B(["ap-lo", f.value === "horizontal" && "ap-lo-on"]),
                  onClick: e[6] || (e[6] = (s) => f.value = "horizontal")
                }, [
                  e[29] || (e[29] = n("span", { class: "mock mock-h" }, [
                    n("span", { class: "mock-top" }, [
                      n("i"),
                      n("i"),
                      n("i")
                    ]),
                    n("span", { class: "mock-fill" })
                  ], -1)),
                  n("span", Co, [
                    e[28] || (e[28] = _("Horizontal ", -1)),
                    f.value === "horizontal" ? (h(), de(a(v), {
                      key: 0,
                      icon: "tabler:circle-check-filled",
                      "aria-hidden": "true"
                    })) : x("", !0)
                  ]),
                  e[30] || (e[30] = n("span", { class: "ap-lo-desc" }, "Top bar", -1))
                ], 2)
              ])
            ]),
            n("section", _o, [
              n("header", To, [
                y(a(v), {
                  icon: "tabler:info-circle",
                  "aria-hidden": "true"
                }),
                e[32] || (e[32] = _(" How it works", -1))
              ]),
              n("ul", Lo, [
                n("li", null, [
                  y(a(v), {
                    icon: "tabler:grip-vertical",
                    "aria-hidden": "true"
                  }),
                  e[33] || (e[33] = _(" Drag to reorder or move between categories.", -1))
                ]),
                n("li", null, [
                  y(a(v), {
                    icon: "tabler:cursor-text",
                    "aria-hidden": "true"
                  }),
                  e[34] || (e[34] = _(" Click a label to rename it.", -1))
                ]),
                n("li", null, [
                  y(a(v), {
                    icon: "tabler:mood-smile",
                    "aria-hidden": "true"
                  }),
                  e[35] || (e[35] = _(" Click an icon to pick a new Tabler glyph.", -1))
                ]),
                n("li", null, [
                  y(a(v), {
                    icon: "tabler:eye-off",
                    "aria-hidden": "true"
                  }),
                  e[36] || (e[36] = _(" Hide a surface without removing its module.", -1))
                ])
              ])
            ])
          ]),
          n("section", xo, [
            n("header", Ao, [
              y(a(v), {
                icon: "tabler:sitemap",
                "aria-hidden": "true"
              }),
              e[38] || (e[38] = _(" Structure ", -1)),
              n("button", {
                class: "ap-btn ap-btn-ghost ap-add",
                onClick: e[7] || (e[7] = //@ts-ignore
                (...s) => a($e) && a($e)(...s))
              }, [
                y(a(v), {
                  icon: "tabler:folder-plus",
                  "aria-hidden": "true"
                }),
                e[37] || (e[37] = _(" Add category", -1))
              ])
            ]),
            (h(!0), g(q, null, pe(a(H), (s) => (h(), g("div", {
              key: s.key || "_root",
              class: B(["ap-group", a(se) === s.key && "ap-group-over"]),
              onDragover: Y((m) => se.value = s.key, ["prevent"]),
              onDragleave: (m) => a(se) === s.key && (se.value = null),
              onDrop: Y((m) => a(Ee)(s.key), ["prevent"])
            }, [
              n("div", {
                class: "ap-group-head",
                onDragover: e[9] || (e[9] = Y(() => {
                }, ["prevent"])),
                onDrop: Y((m) => s.real ? a(it)(s.key) : a(Ee)(s.key), ["prevent", "stop"])
              }, [
                s.real ? (h(), g("span", {
                  key: 0,
                  class: "ap-grip ap-grip-cat",
                  draggable: "true",
                  title: "Drag to reorder category",
                  onDragstart: (m) => a(lt)(s.key, m),
                  onDragend: e[8] || (e[8] = //@ts-ignore
                  (...m) => a(ue) && a(ue)(...m))
                }, [
                  y(a(v), {
                    icon: "tabler:grip-vertical",
                    "aria-hidden": "true"
                  })
                ], 40, Eo)) : (h(), g("span", $o)),
                s.real ? (h(), g(q, { key: 2 }, [
                  y(qe, {
                    "model-value": a(ae)(s.key)?.icon || "",
                    fallback: "tabler:folder",
                    "onUpdate:modelValue": (m) => a(ct)(s.key, m)
                  }, null, 8, ["model-value", "onUpdate:modelValue"]),
                  n("input", {
                    value: a(ae)(s.key)?.label,
                    class: "ap-field ap-field-strong",
                    "aria-label": "Category name",
                    placeholder: "Category name",
                    onInput: (m) => a(ut)(s.key, m.target.value)
                  }, null, 40, Mo)
                ], 64)) : (h(), g(q, { key: 3 }, [
                  n("span", Io, [
                    y(a(v), {
                      icon: "tabler:layout-list",
                      "aria-hidden": "true"
                    })
                  ]),
                  n("span", Oo, M(s.label), 1)
                ], 64)),
                n("span", Po, M(a(S)(s.key).length), 1),
                s.real ? (h(), g("button", {
                  key: 4,
                  class: "ap-icon-btn ap-danger",
                  "aria-label": "Remove category",
                  title: "Remove category",
                  onClick: (m) => a(st)(s.key)
                }, [
                  y(a(v), {
                    icon: "tabler:trash",
                    "aria-hidden": "true"
                  })
                ], 8, Ro)) : x("", !0)
              ], 40, So),
              a(S)(s.key).length === 0 ? (h(), g("div", Vo, "Drag a surface here")) : x("", !0),
              (h(!0), g(q, null, pe(a(S)(s.key), (m) => (h(), g("div", {
                key: m.id,
                class: B(["ap-row", a(be) === m.id && "ap-row-dragging"]),
                onDragover: e[11] || (e[11] = Y(() => {
                }, ["prevent", "stop"])),
                onDrop: Y((V) => a(rt)(m), ["prevent", "stop"])
              }, [
                n("span", {
                  class: "ap-grip",
                  draggable: "true",
                  title: "Drag to reorder or move",
                  onDragstart: (V) => a(nt)(m, V),
                  onDragend: e[10] || (e[10] = //@ts-ignore
                  (...V) => a(ue) && a(ue)(...V))
                }, [
                  y(a(v), {
                    icon: "tabler:grip-vertical",
                    "aria-hidden": "true"
                  })
                ], 40, No),
                y(qe, {
                  "model-value": m.icon || "",
                  fallback: "tabler:square",
                  "onUpdate:modelValue": (V) => a(L)(m, V)
                }, null, 8, ["model-value", "onUpdate:modelValue"]),
                n("input", {
                  value: m.label,
                  class: "ap-field ap-field-strong",
                  "aria-label": "Surface label",
                  placeholder: "Label",
                  onInput: (V) => a(p)(m, V.target.value)
                }, null, 40, Bo),
                n("span", Uo, M(m.path), 1),
                m.source === "custom" ? (h(), g("span", zo, "custom")) : x("", !0),
                a(ne)(m) ? (h(), g("span", Fo, [
                  y(a(v), {
                    icon: "tabler:home",
                    "aria-hidden": "true"
                  }),
                  e[39] || (e[39] = _(" home", -1))
                ])) : x("", !0),
                a($)(m) ? (h(), de(a(v), {
                  key: 2,
                  icon: "tabler:pencil",
                  class: "ap-edited",
                  title: "Customized — reset the field to revert",
                  "aria-hidden": "true"
                })) : x("", !0),
                n("button", {
                  class: B(["ap-icon-btn", a(ne)(m) && "ap-home-on"]),
                  "aria-label": a(ne)(m) ? "Home page (click to unset)" : "Set as home page",
                  title: a(ne)(m) ? "Home page — click to unset" : "Set as home page",
                  onClick: (V) => a(dt)(m)
                }, [
                  y(a(v), {
                    icon: a(ne)(m) ? "tabler:home-filled" : "tabler:home",
                    "aria-hidden": "true"
                  }, null, 8, ["icon"])
                ], 10, jo),
                n("button", {
                  class: "ap-icon-btn",
                  "aria-label": "Hide",
                  title: "Hide",
                  onClick: (V) => a(i)(m, !0)
                }, [
                  y(a(v), {
                    icon: "tabler:eye",
                    "aria-hidden": "true"
                  })
                ], 8, Go)
              ], 42, Ho))), 128))
            ], 42, Do))), 128)),
            a(oe).length ? (h(), g("div", Ko, [
              n("button", {
                class: "ap-hidden-h",
                onClick: e[12] || (e[12] = (s) => I.value = !I.value)
              }, [
                y(a(v), {
                  icon: I.value ? "tabler:chevron-down" : "tabler:chevron-right",
                  "aria-hidden": "true"
                }, null, 8, ["icon"]),
                y(a(v), {
                  icon: "tabler:eye-off",
                  "aria-hidden": "true"
                }),
                _(" Hidden (" + M(a(oe).length) + ") ", 1)
              ]),
              I.value ? (h(), g("div", Wo, [
                (h(!0), g(q, null, pe(a(oe), (s) => (h(), g("div", {
                  key: s.id,
                  class: "ap-row ap-row-off"
                }, [
                  e[40] || (e[40] = n("span", {
                    class: "ap-grip ap-grip-ghost",
                    "aria-hidden": "true"
                  }, null, -1)),
                  n("span", qo, [
                    y(a(v), {
                      icon: s.icon || "tabler:square",
                      "aria-hidden": "true"
                    }, null, 8, ["icon"])
                  ]),
                  n("span", Yo, M(s.label), 1),
                  n("button", {
                    class: "ap-icon-btn",
                    "aria-label": "Show",
                    title: "Show",
                    onClick: (m) => a(i)(s, !1)
                  }, [
                    y(a(v), {
                      icon: "tabler:eye-plus",
                      "aria-hidden": "true"
                    })
                  ], 8, Jo)
                ]))), 128))
              ])) : x("", !0)
            ])) : x("", !0)
          ])
        ]))
      ])
    ]));
  }
}), ia = {
  rootComponent: Xo,
  plugins: [Rt]
};
export {
  ia as mountConfig
};
//# sourceMappingURL=lazy-mount-G0CpYMIb.js.map

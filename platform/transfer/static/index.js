import { u as nr, W as cr } from "./wc-runtime-DZZltuMO.js";
import pr from "primevue/config";
import sr from "primevue/contextmenu";
import lr from "primevue/menu";
import dr from "primevue/portal";
import { renderSlot as $, createCommentVNode as C, h as ur, Teleport as fr, defineComponent as mr, ref as f, computed as z, watch as hr, onMounted as vr, onUnmounted as gr, openBlock as u, createBlock as br, unref as yr, withCtx as F, createElementVNode as s, withDirectives as wr, vModelText as xr, createElementBlock as m, toDisplayString as v, Fragment as kr, renderList as Cr, normalizeClass as _r } from "vue";
import { api as T, define as Lr } from "@wippy-fe/proxy";
import Sr from "primevue/dialog";
import "@iconify/vue";
const Er = "data-wippy-overlay-layer";
function K() {
  return typeof window < "u" && typeof window.document < "u";
}
function J() {
  return K() && typeof HTMLElement < "u" && Object.hasOwn(HTMLElement.prototype, "popover");
}
function zr() {
  return J() && typeof CSS < "u" && typeof CSS.supports == "function" && CSS.supports("anchor-name: --a") && CSS.supports("position-area", "bottom span-right") && CSS.supports("position-try-fallbacks", "flip-block") && CSS.supports("min-width", "min(anchor-size(width), 100vw)") && CSS.supports("max-width", "stretch");
}
const Tr = /\bp-(?:select|multiselect|treeselect|cascadeselect)-overlay\b/;
let Pr = 0;
const _ = /* @__PURE__ */ new WeakMap();
function V(r, e) {
  const i = r.style;
  i.setProperty("position", "fixed", "important"), i.setProperty("inset", "auto", "important"), i.setProperty("margin", "0", "important"), i.setProperty("position-anchor", e), i.setProperty("position-area", "bottom span-right"), i.setProperty("position-try-fallbacks", "flip-block, flip-inline, flip-block flip-inline"), i.setProperty("min-width", "min(anchor-size(width), 100vw)", "important"), i.setProperty("max-width", "stretch", "important");
}
function Or(r, e) {
  if (!Tr.test(r.className))
    return;
  const i = r.style.cssText;
  V(r, e), r.getAttribute("popover") !== "manual" && r.setAttribute("popover", "manual");
  try {
    r.matches(":popover-open") || r.showPopover();
  } catch {
  }
  if (!r.matches(":popover-open")) {
    r.removeAttribute("popover"), r.style.cssText = i;
    return;
  }
  if (!_.has(r)) {
    const l = new MutationObserver(() => {
      const n = r.style;
      (n.top !== "auto" || n.left !== "auto" || n.margin !== "0px" || n.getPropertyPriority("top") !== "important" || n.getPropertyPriority("left") !== "important" || n.getPropertyPriority("margin") !== "important" || n.getPropertyPriority("min-width") !== "important" || n.maxWidth !== "stretch" || n.getPropertyPriority("max-width") !== "important") && V(r, e);
    });
    l.observe(r, { attributes: !0, attributeFilter: ["style"] }), _.set(r, l);
  }
}
function A(r) {
  const e = _.get(r);
  e && (e.disconnect(), _.delete(r));
}
function Ar(r) {
  const e = r && typeof r.getRootNode == "function" ? r.getRootNode() : null;
  return e instanceof ShadowRoot ? e : null;
}
function P(r) {
  r.style.top = "0px", r.style.left = "0px";
  const e = r.getBoundingClientRect();
  r.style.top = `${-window.scrollY - e.top}px`, r.style.left = `${-window.scrollX - e.left}px`;
}
const L = /* @__PURE__ */ new Set(), M = /* @__PURE__ */ new WeakMap();
let j = !1, O = !1;
function Mr() {
  O = !1;
  for (const r of L) {
    if (!r.isConnected) {
      for (const e of Array.from(r.children))
        e instanceof HTMLElement && A(e);
      L.delete(r), M.get(r)?.disconnect();
      continue;
    }
    r.childElementCount > 0 && P(r);
  }
}
function D() {
  O || (O = !0, requestAnimationFrame(Mr));
}
function Rr(r) {
  const e = document.createElement("div");
  e.setAttribute(Er, "");
  const i = J();
  if (e.style.cssText = i ? "position:fixed;width:0 !important;height:0 !important;margin:0 !important;border:0 !important;padding:0 !important;background:transparent !important;color:inherit !important;overflow:visible !important;" : "position:fixed;top:0;left:0;width:0;height:0;", i && e.setAttribute("popover", "manual"), r.appendChild(e), i) {
    try {
      e.showPopover();
    } catch {
    }
    e.matches(":popover-open") || (e.removeAttribute("popover"), e.style.cssText = "position:fixed;top:0;left:0;width:0;height:0;");
  }
  P(e);
  const l = new MutationObserver((n) => {
    const g = e.__wippyAnchorName;
    for (const p of n) {
      if (g)
        for (const d of Array.from(p.addedNodes))
          d instanceof HTMLElement && Or(d, g);
      for (const d of Array.from(p.removedNodes))
        d instanceof HTMLElement && A(d);
    }
    e.isConnected && e.childElementCount > 0 && P(e);
  });
  return l.observe(e, { childList: !0 }), M.set(e, l), L.add(e), j || (j = !0, window.addEventListener("scroll", D, { capture: !0, passive: !0 }), window.addEventListener("resize", D, { passive: !0 })), e;
}
function H(r) {
  if (!(!r.hostRoot || r.layer) && (r.layer = Rr(r.hostRoot), zr())) {
    const e = r.$el ? r.$el.parentElement : null;
    e && (r.anchorName = `--wippy-a-${++Pr}`, r.anchorTrigger = e, e.style.setProperty("anchor-name", r.anchorName), r.layer.__wippyAnchorName = r.anchorName);
  }
}
function W(r) {
  if (r.anchorTrigger && (r.anchorTrigger.style.removeProperty("anchor-name"), r.anchorTrigger = null), r.anchorName = null, r.layer) {
    for (const e of Array.from(r.layer.children))
      e instanceof HTMLElement && A(e);
    L.delete(r.layer), M.get(r.layer)?.disconnect(), r.layer.remove(), r.layer = null;
  }
}
let q = !1;
function Nr() {
  if (q)
    return;
  const r = lr;
  !r.methods || typeof r.methods.bindOutsideClickListener != "function" || (r.methods.bindOutsideClickListener = function() {
    this.outsideClickListener || (this.outsideClickListener = (e) => {
      const i = e.composedPath(), l = this.container && !i.includes(this.container), n = !(this.target && i.includes(this.target));
      this.overlayVisible && l && n ? this.hide() : !this.popup && l && n && (this.focusedOptionIndex = -1);
    }, document.addEventListener("click", this.outsideClickListener, !0));
  }, q = !0);
}
let B = !1;
function Ur() {
  if (B)
    return;
  const r = sr;
  !r.methods || typeof r.methods.bindOutsideClickListener != "function" || (r.methods.bindOutsideClickListener = function() {
    this.outsideClickListener || (this.outsideClickListener = (e) => {
      const i = e.composedPath(), l = this.container && !i.includes(this.container), n = this.visible ? !(this.target && i.includes(this.target)) : !0;
      l && n && this.hide();
    }, document.addEventListener("click", this.outsideClickListener, !0));
  }, B = !0);
}
let Y = !1;
function Ir() {
  if (Y)
    return;
  Y = !0;
  const r = dr;
  r.computed = r.computed || {}, r.computed.inline = function() {
    return !!this.disabled || this.appendTo === "self";
  }, r.computed.resolvedTarget = function() {
    return this.appendTo == null || this.appendTo === "body" ? this.hostRoot ? this.layer : document.body : this.appendTo;
  }, r.data = function() {
    return { mounted: !1, hostRoot: null, layer: null, anchorName: null, anchorTrigger: null };
  }, r.mounted = function() {
    K() && (this.hostRoot = Ar(this.$el), this.mounted = !0, this.hostRoot && (this.inline || H(this), this.$watch("inline", (e) => {
      e ? W(this) : H(this);
    })));
  }, r.render = function() {
    return this.inline ? $(this.$slots, "default", { key: 0 }) : this.mounted ? ur(fr, { key: 1, to: this.resolvedTarget || document.body }, [
      $(this.$slots, "default")
    ]) : C("", !0);
  }, r.unmounted = function() {
    W(this);
  };
}
const $r = {
  install: (r) => {
    Nr(), Ur(), Ir(), r.use(pr, { theme: "none" });
  }
}, Fr = () => nr(), Vr = { class: "ks-panel" }, jr = { class: "ks-tools" }, Dr = { class: "ks-body" }, Hr = {
  key: 0,
  class: "ks-empty"
}, Wr = {
  key: 1,
  class: "ks-empty"
}, qr = {
  key: 2,
  class: "ks-empty"
}, Br = {
  key: 3,
  class: "ks-list",
  role: "list"
}, Yr = ["checked", "onChange"], Kr = { class: "ks-row-name" }, Jr = { class: "ks-row-meta" }, Xr = { class: "ks-tag" }, Gr = {
  key: 0,
  class: "ks-tag ks-tag--data"
}, Qr = {
  key: 4,
  class: "ks-error"
}, Zr = {
  key: 5,
  class: "ks-notice"
}, re = { class: "ks-foot" }, ee = ["disabled"], oe = { class: "ks-count" }, te = ["disabled"], ae = /* @__PURE__ */ mr({
  __name: "picker",
  setup(r) {
    const e = Fr(), i = f([]), l = f(!0), n = f(""), g = f(""), p = f(/* @__PURE__ */ new Set()), d = f(!1), w = f(!1), x = f(""), R = f(null), k = f(!0);
    function G() {
      e("close", void 0);
    }
    function Q(o) {
      o || G();
    }
    function N(o) {
      o.key === "Escape" && (k.value = !1);
    }
    function S(o) {
      if (!o) return "Component";
      const t = o.replace(/[._-]+/g, " ").trim();
      return t.charAt(0).toUpperCase() + t.slice(1);
    }
    const b = z(() => {
      const o = g.value.trim().toLowerCase();
      return [...o ? i.value.filter((a) => a.title.toLowerCase().includes(o) || (a.class || "").toLowerCase().includes(o)) : i.value].sort((a, c) => {
        const h = S(a.class), y = S(c.class);
        return h === y ? a.title.localeCompare(c.title) : h.localeCompare(y);
      });
    }), E = z(() => p.value.size), U = z(() => b.value.length > 0 && b.value.every((o) => p.value.has(o.component_id)));
    function Z(o) {
      const t = new Set(p.value);
      t.has(o) ? t.delete(o) : t.add(o), p.value = t;
    }
    function rr() {
      const o = new Set(p.value);
      if (U.value)
        for (const t of b.value) o.delete(t.component_id);
      else
        for (const t of b.value) o.add(t.component_id);
      p.value = o;
    }
    hr(p, (o) => e("selection-change", { component_ids: [...o] }));
    async function I() {
      l.value = !0, n.value = "";
      try {
        const { data: o } = await T.get("/api/v1/transfer/exportable");
        if (!o?.success) throw new Error(o?.error || "failed to load exportable components");
        i.value = o.components || [];
        const t = new Set(i.value.map((a) => a.component_id));
        p.value = new Set([...p.value].filter((a) => t.has(a)));
      } catch (o) {
        n.value = o instanceof Error ? o.message : String(o);
      } finally {
        l.value = !1;
      }
    }
    async function er() {
      if (E.value === 0 || d.value) return;
      d.value = !0, n.value = "";
      const o = [...p.value];
      try {
        const t = await T.post(
          "/api/v1/transfer/export",
          { component_ids: o },
          { responseType: "blob" }
        ), a = t?.data;
        if (!a || a.type.includes("application/json")) {
          const h = a ? await a.text() : "";
          let y = "export failed";
          try {
            y = JSON.parse(h)?.error || y;
          } catch {
          }
          throw new Error(y);
        }
        const c = or(t) || "components.zip";
        tr(a, c), e("exported", { filename: c, count: o.length });
      } catch (t) {
        n.value = t instanceof Error ? t.message : String(t);
      } finally {
        d.value = !1;
      }
    }
    function or(o) {
      const t = o?.headers?.["content-disposition"] || o?.headers?.get?.("content-disposition");
      if (typeof t != "string") return "";
      const a = t.match(/filename\*?=(?:UTF-8'')?"?([^";]+)"?/i);
      return a ? decodeURIComponent(a[1]) : "";
    }
    function tr(o, t) {
      const a = URL.createObjectURL(o), c = document.createElement("a");
      c.href = a, c.download = t, document.body.appendChild(c), c.click(), c.remove(), URL.revokeObjectURL(a);
    }
    function ar() {
      x.value = "", R.value?.click();
    }
    async function ir(o) {
      const t = o.target, a = t.files?.[0];
      if (t.value = "", !(!a || w.value)) {
        w.value = !0, n.value = "", x.value = "";
        try {
          const c = new FormData();
          c.append("file", a);
          const { data: h } = await T.post("/api/v1/transfer/import", c, {
            headers: { "Content-Type": "multipart/form-data" }
          });
          if (!h?.success) throw new Error(h?.error || "import failed");
          x.value = `Imported ${h.count} component${h.count === 1 ? "" : "s"}.`, p.value = /* @__PURE__ */ new Set(), await I();
        } catch (c) {
          n.value = c instanceof Error ? c.message : String(c);
        } finally {
          w.value = !1;
        }
      }
    }
    return vr(() => {
      window.addEventListener("keydown", N), I();
    }), gr(() => window.removeEventListener("keydown", N)), (o, t) => (u(), br(yr(Sr), {
      visible: k.value,
      "onUpdate:visible": [
        t[2] || (t[2] = (a) => k.value = a),
        Q
      ],
      modal: "",
      "dismissable-mask": !0,
      "close-on-escape": !1,
      style: { width: "560px", maxWidth: "calc(100vw - 48px)" },
      "aria-label": "Export / Import components",
      class: "ks-dialog"
    }, {
      header: F(() => [...t[3] || (t[3] = [
        s("span", { class: "ks-title" }, "Export / Import", -1)
      ])]),
      default: F(() => [
        s("div", Vr, [
          s("div", jr, [
            wr(s("input", {
              "onUpdate:modelValue": t[0] || (t[0] = (a) => g.value = a),
              class: "ks-search",
              type: "search",
              placeholder: "Search your components…",
              "aria-label": "Search components"
            }, null, 512), [
              [xr, g.value]
            ]),
            b.value.length > 0 ? (u(), m("button", {
              key: 0,
              class: "ks-link",
              type: "button",
              onClick: rr
            }, v(U.value ? "Clear" : "Select all"), 1)) : C("", !0)
          ]),
          s("div", Dr, [
            l.value ? (u(), m("p", Hr, "Loading…")) : i.value.length === 0 ? (u(), m("p", Wr, "You have no exportable components yet.")) : b.value.length === 0 ? (u(), m("p", qr, "No components match “" + v(g.value) + "”.", 1)) : (u(), m("div", Br, [
              (u(!0), m(kr, null, Cr(b.value, (a) => (u(), m("label", {
                key: a.component_id,
                class: _r(["ks-row", { "is-selected": p.value.has(a.component_id) }]),
                role: "listitem"
              }, [
                s("input", {
                  type: "checkbox",
                  class: "ks-check",
                  checked: p.value.has(a.component_id),
                  onChange: (c) => Z(a.component_id)
                }, null, 40, Yr),
                s("span", Kr, v(a.title), 1),
                s("span", Jr, [
                  s("span", Xr, v(S(a.class)), 1),
                  a.has_data ? (u(), m("span", Gr, "data")) : C("", !0)
                ])
              ], 2))), 128))
            ])),
            n.value ? (u(), m("p", Qr, v(n.value), 1)) : x.value ? (u(), m("p", Zr, v(x.value), 1)) : C("", !0)
          ]),
          s("footer", re, [
            s("input", {
              ref_key: "fileInput",
              ref: R,
              type: "file",
              accept: ".kxb",
              class: "ks-file",
              onChange: ir
            }, null, 544),
            s("button", {
              class: "ks-btn ks-btn--ghost",
              type: "button",
              disabled: w.value,
              onClick: ar
            }, v(w.value ? "Importing…" : "Import…"), 9, ee),
            s("span", oe, v(E.value) + " selected", 1),
            t[4] || (t[4] = s("div", { class: "ks-spacer" }, null, -1)),
            s("button", {
              class: "ks-btn ks-btn--ghost",
              type: "button",
              onClick: t[1] || (t[1] = (a) => k.value = !1)
            }, "Cancel"),
            s("button", {
              class: "ks-btn",
              type: "button",
              disabled: E.value === 0 || d.value,
              onClick: er
            }, v(d.value ? "Exporting…" : "Export selected"), 9, te)
          ])
        ])
      ]),
      _: 1
    }, 8, ["visible"]));
  }
}), ie = ':root{--p-form-field-padding-x: .75rem;--p-form-field-padding-y: .5rem;--p-form-field-sm-padding-x: .625rem;--p-form-field-sm-padding-y: .375rem;--p-form-field-lg-padding-x: .875rem;--p-form-field-lg-padding-y: .625rem;--p-form-field-border-radius: .375rem;--p-form-field-transition-duration: .2s;--p-form-field-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), 0 1px 2px 0 rgba(18, 18, 23, .05);--p-focus-ring-width: 1px;--p-focus-ring-style: solid;--p-focus-ring-color: color-mix(in srgb, var(--p-primary-color) 100%, transparent);--p-focus-ring-offset: 2px;--p-toggleswitch-width: 2.5rem;--p-toggleswitch-height: 1.5rem;--p-toggleswitch-border-radius: 30px;--p-toggleswitch-gap: .25rem;--p-toggleswitch-border-width: 1px;--p-toggleswitch-transition-duration: .2s;--p-toggleswitch-slide-duration: .2s;--p-toggleswitch-handle-size: 1rem;--p-toggleswitch-handle-border-radius: 9999px}:root{color-scheme:light dark;--p-primary: rgb(0, 95, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-secondary: #6f7385;--p-secondary-50: color-mix(in srgb, var(--p-secondary) 5%, white);--p-secondary-100: color-mix(in srgb, var(--p-secondary) 10%, white);--p-secondary-200: color-mix(in srgb, var(--p-secondary) 20%, white);--p-secondary-300: color-mix(in srgb, var(--p-secondary) 35%, white);--p-secondary-400: color-mix(in srgb, var(--p-secondary) 65%, white);--p-secondary-500: var(--p-secondary);--p-secondary-600: color-mix(in srgb, var(--p-secondary) 80%, black);--p-secondary-700: color-mix(in srgb, var(--p-secondary) 65%, black);--p-secondary-800: color-mix(in srgb, var(--p-secondary) 55%, black);--p-secondary-900: color-mix(in srgb, var(--p-secondary) 50%, black);--p-secondary-950: color-mix(in srgb, var(--p-secondary) 30%, black);--p-danger: rgb(239, 68, 68);--p-danger-50: color-mix(in srgb, var(--p-danger) 5%, white);--p-danger-100: color-mix(in srgb, var(--p-danger) 10%, white);--p-danger-200: color-mix(in srgb, var(--p-danger) 20%, white);--p-danger-300: color-mix(in srgb, var(--p-danger) 30%, white);--p-danger-400: color-mix(in srgb, var(--p-danger) 40%, white);--p-danger-500: var(--p-danger);--p-danger-600: color-mix(in srgb, var(--p-danger) 80%, black);--p-danger-700: color-mix(in srgb, var(--p-danger) 70%, black);--p-danger-800: color-mix(in srgb, var(--p-danger) 60%, black);--p-danger-900: color-mix(in srgb, var(--p-danger) 50%, black);--p-danger-950: color-mix(in srgb, var(--p-danger) 40%, black);--p-success: rgb(34, 197, 94);--p-success-50: color-mix(in srgb, var(--p-success) 5%, white);--p-success-100: color-mix(in srgb, var(--p-success) 10%, white);--p-success-200: color-mix(in srgb, var(--p-success) 20%, white);--p-success-300: color-mix(in srgb, var(--p-success) 30%, white);--p-success-400: color-mix(in srgb, var(--p-success) 40%, white);--p-success-500: var(--p-success);--p-success-600: color-mix(in srgb, var(--p-success) 80%, black);--p-success-700: color-mix(in srgb, var(--p-success) 70%, black);--p-success-800: color-mix(in srgb, var(--p-success) 60%, black);--p-success-900: color-mix(in srgb, var(--p-success) 50%, black);--p-success-950: color-mix(in srgb, var(--p-success) 40%, black);--p-warn: rgb(249, 115, 22);--p-warn-50: color-mix(in srgb, var(--p-warn) 5%, white);--p-warn-100: color-mix(in srgb, var(--p-warn) 10%, white);--p-warn-200: color-mix(in srgb, var(--p-warn) 20%, white);--p-warn-300: color-mix(in srgb, var(--p-warn) 30%, white);--p-warn-400: color-mix(in srgb, var(--p-warn) 40%, white);--p-warn-500: var(--p-warn);--p-warn-600: color-mix(in srgb, var(--p-warn) 80%, black);--p-warn-700: color-mix(in srgb, var(--p-warn) 70%, black);--p-warn-800: color-mix(in srgb, var(--p-warn) 60%, black);--p-warn-900: color-mix(in srgb, var(--p-warn) 50%, black);--p-warn-950: color-mix(in srgb, var(--p-warn) 40%, black);--p-info: rgb(14, 165, 233);--p-info-50: color-mix(in srgb, var(--p-info) 5%, white);--p-info-100: color-mix(in srgb, var(--p-info) 10%, white);--p-info-200: color-mix(in srgb, var(--p-info) 20%, white);--p-info-300: color-mix(in srgb, var(--p-info) 30%, white);--p-info-400: color-mix(in srgb, var(--p-info) 40%, white);--p-info-500: var(--p-info);--p-info-600: color-mix(in srgb, var(--p-info) 80%, black);--p-info-700: color-mix(in srgb, var(--p-info) 70%, black);--p-info-800: color-mix(in srgb, var(--p-info) 60%, black);--p-info-900: color-mix(in srgb, var(--p-info) 50%, black);--p-info-950: color-mix(in srgb, var(--p-info) 40%, black);--p-help: rgb(168, 85, 247);--p-help-50: color-mix(in srgb, var(--p-help) 5%, white);--p-help-100: color-mix(in srgb, var(--p-help) 10%, white);--p-help-200: color-mix(in srgb, var(--p-help) 20%, white);--p-help-300: color-mix(in srgb, var(--p-help) 30%, white);--p-help-400: color-mix(in srgb, var(--p-help) 40%, white);--p-help-500: var(--p-help);--p-help-600: color-mix(in srgb, var(--p-help) 80%, black);--p-help-700: color-mix(in srgb, var(--p-help) 70%, black);--p-help-800: color-mix(in srgb, var(--p-help) 60%, black);--p-help-900: color-mix(in srgb, var(--p-help) 50%, black);--p-help-950: color-mix(in srgb, var(--p-help) 40%, black);--p-accent: rgb(20, 184, 166);--p-accent-50: color-mix(in srgb, var(--p-accent) 5%, white);--p-accent-100: color-mix(in srgb, var(--p-accent) 10%, white);--p-accent-200: color-mix(in srgb, var(--p-accent) 20%, white);--p-accent-300: color-mix(in srgb, var(--p-accent) 30%, white);--p-accent-400: color-mix(in srgb, var(--p-accent) 40%, white);--p-accent-500: var(--p-accent);--p-accent-600: color-mix(in srgb, var(--p-accent) 80%, black);--p-accent-700: color-mix(in srgb, var(--p-accent) 70%, black);--p-accent-800: color-mix(in srgb, var(--p-accent) 60%, black);--p-accent-900: color-mix(in srgb, var(--p-accent) 50%, black);--p-accent-950: color-mix(in srgb, var(--p-accent) 40%, black);--p-surface-0: #ffffff;--p-surface-50: #fafafa;--p-surface-100: #f5f5f5;--p-surface-200: #e5e5e5;--p-surface-300: #d4d4d4;--p-surface-400: #a3a3a3;--p-surface-500: #737373;--p-surface-600: #525252;--p-surface-700: #404040;--p-surface-800: #262626;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #171717;--p-surface-950: #0a0a0a;--p-content-border-radius: 6px;--p-font-heading-family: var(--v-font-family-head, Arial);--p-font-heading-scale: 1;--p-font-heading-line-height: 1.5;--p-font-heading-letter-spacing: normal;--p-font-heading-stretch: normal;--p-font-heading-variation-settings: normal;--p-font-body-scale: 1;--p-font-body-line-height: 1.5;--p-font-body-letter-spacing: normal;--p-font-body-stretch: normal;--p-font-body-variation-settings: normal;--p-font-mono-family: ui-monospace}:root{--p-primary-color: var(--p-primary-500);--p-primary-contrast-color: var(--p-surface-0);--p-primary-hover-color: var(--p-primary-600);--p-primary-active-color: var(--p-primary-700);--p-secondary-color: var(--p-secondary-500);--p-secondary-contrast-color: var(--p-surface-0);--p-secondary-hover-color: var(--p-secondary-600);--p-secondary-active-color: var(--p-secondary-700);--p-danger-color: var(--p-danger-500);--p-danger-contrast-color: var(--p-surface-0);--p-danger-hover-color: var(--p-danger-600);--p-danger-active-color: var(--p-danger-700);--p-success-color: var(--p-success-500);--p-success-contrast-color: var(--p-surface-0);--p-success-hover-color: var(--p-success-600);--p-success-active-color: var(--p-success-700);--p-warn-color: var(--p-warn-500);--p-warn-contrast-color: var(--p-surface-0);--p-warn-hover-color: var(--p-warn-600);--p-warn-active-color: var(--p-warn-700);--p-info-color: var(--p-info-500);--p-info-contrast-color: var(--p-surface-0);--p-info-hover-color: var(--p-info-600);--p-info-active-color: var(--p-info-700);--p-help-color: var(--p-help-500);--p-help-contrast-color: var(--p-surface-0);--p-help-hover-color: var(--p-help-600);--p-help-active-color: var(--p-help-700);--p-accent-color: var(--p-accent-500);--p-accent-contrast-color: var(--p-surface-0);--p-accent-hover-color: var(--p-accent-600);--p-accent-active-color: var(--p-accent-700);--p-content-border-color: var(--p-surface-200);--p-content-hover-background: var(--p-surface-100);--p-content-hover-color: var(--p-surface-800);--p-highlight-background: var(--p-primary-50);--p-highlight-color: var(--p-primary-700);--p-highlight-focus-background: var(--p-primary-100);--p-highlight-focus-color: var(--p-primary-800);--p-content-background: var(--p-surface-0);--p-text-color: var(--p-surface-700);--p-text-hover-color: var(--p-surface-800);--p-text-muted-color: var(--p-surface-500);--p-text-hover-muted-color: var(--p-surface-600)}@media(prefers-color-scheme:dark){:root:not(.w-theme-light){--p-surface-D: #fff;--p-surface-0: #fff;--p-surface-50: #fafafa;--p-surface-100: #f4f4f5;--p-surface-200: #e4e4e7;--p-surface-300: #d4d4d8;--p-surface-400: #a1a1aa;--p-surface-500: #71717a;--p-surface-600: #545250;--p-surface-700: #403e3c;--p-surface-800: #2b2927;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #1c1a19;--p-surface-950: #0f0e0d;--p-primary: rgb(0, 125, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-primary-color: var(--p-primary-400);--p-primary-contrast-color: var(--p-surface-900);--p-primary-hover-color: var(--p-primary-300);--p-primary-active-color: var(--p-primary-200);--p-secondary-color: var(--p-secondary-400);--p-secondary-contrast-color: var(--p-surface-900);--p-secondary-hover-color: var(--p-secondary-300);--p-secondary-active-color: var(--p-secondary-200);--p-danger-color: var(--p-danger-400);--p-danger-contrast-color: var(--p-surface-900);--p-danger-hover-color: var(--p-danger-300);--p-danger-active-color: var(--p-danger-200);--p-success-color: var(--p-success-400);--p-success-contrast-color: var(--p-surface-900);--p-success-hover-color: var(--p-success-300);--p-success-active-color: var(--p-success-200);--p-warn-color: var(--p-warn-400);--p-warn-contrast-color: var(--p-surface-900);--p-warn-hover-color: var(--p-warn-300);--p-warn-active-color: var(--p-warn-200);--p-info-color: var(--p-info-400);--p-info-contrast-color: var(--p-surface-900);--p-info-hover-color: var(--p-info-300);--p-info-active-color: var(--p-info-200);--p-help-color: var(--p-help-400);--p-help-contrast-color: var(--p-surface-900);--p-help-hover-color: var(--p-help-300);--p-help-active-color: var(--p-help-200);--p-accent-color: var(--p-accent-400);--p-accent-contrast-color: var(--p-surface-900);--p-accent-hover-color: var(--p-accent-300);--p-accent-active-color: var(--p-accent-200);--p-content-border-color: var(--p-surface-700);--p-content-hover-background: var(--p-surface-800);--p-content-hover-color: var(--p-surface-0);--p-highlight-background: color-mix(in srgb, var(--p-primary-400), transparent 84%);--p-highlight-color: rgba(255, 255, 255, 87%);--p-highlight-focus-background: color-mix(in srgb, var(--p-primary-400), transparent 76%);--p-highlight-focus-color: rgba(255, 255, 255, 87%);--p-content-background: var(--p-surface-900);--p-text-color: var(--p-surface-0);--p-text-hover-color: var(--p-surface-0);--p-text-muted-color: var(--p-surface-400);--p-text-hover-muted-color: var(--p-surface-300)}}:root.w-theme-dark,.w-theme-dark{color-scheme:dark;--p-surface-D: #fff;--p-surface-0: #fff;--p-surface-50: #fafafa;--p-surface-100: #f4f4f5;--p-surface-200: #e4e4e7;--p-surface-300: #d4d4d8;--p-surface-400: #a1a1aa;--p-surface-500: #71717a;--p-surface-600: #545250;--p-surface-700: #403e3c;--p-surface-800: #2b2927;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #1c1a19;--p-surface-950: #0f0e0d;--p-primary: rgb(0, 125, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-primary-color: var(--p-primary-400);--p-primary-contrast-color: var(--p-surface-900);--p-primary-hover-color: var(--p-primary-300);--p-primary-active-color: var(--p-primary-200);--p-secondary-color: var(--p-secondary-400);--p-secondary-contrast-color: var(--p-surface-900);--p-secondary-hover-color: var(--p-secondary-300);--p-secondary-active-color: var(--p-secondary-200);--p-danger-color: var(--p-danger-400);--p-danger-contrast-color: var(--p-surface-900);--p-danger-hover-color: var(--p-danger-300);--p-danger-active-color: var(--p-danger-200);--p-success-color: var(--p-success-400);--p-success-contrast-color: var(--p-surface-900);--p-success-hover-color: var(--p-success-300);--p-success-active-color: var(--p-success-200);--p-warn-color: var(--p-warn-400);--p-warn-contrast-color: var(--p-surface-900);--p-warn-hover-color: var(--p-warn-300);--p-warn-active-color: var(--p-warn-200);--p-info-color: var(--p-info-400);--p-info-contrast-color: var(--p-surface-900);--p-info-hover-color: var(--p-info-300);--p-info-active-color: var(--p-info-200);--p-help-color: var(--p-help-400);--p-help-contrast-color: var(--p-surface-900);--p-help-hover-color: var(--p-help-300);--p-help-active-color: var(--p-help-200);--p-accent-color: var(--p-accent-400);--p-accent-contrast-color: var(--p-surface-900);--p-accent-hover-color: var(--p-accent-300);--p-accent-active-color: var(--p-accent-200);--p-content-border-color: var(--p-surface-700);--p-content-hover-background: var(--p-surface-800);--p-content-hover-color: var(--p-surface-0);--p-highlight-background: color-mix(in srgb, var(--p-primary-400), transparent 84%);--p-highlight-color: rgba(255, 255, 255, 87%);--p-highlight-focus-background: color-mix(in srgb, var(--p-primary-400), transparent 76%);--p-highlight-focus-color: rgba(255, 255, 255, 87%);--p-content-background: var(--p-surface-900);--p-text-color: var(--p-surface-0);--p-text-hover-color: var(--p-surface-0);--p-text-muted-color: var(--p-surface-400);--p-text-hover-muted-color: var(--p-surface-300)}:root.w-theme-light,.w-theme-light{color-scheme:light;--p-surface-0: #ffffff;--p-surface-50: #fafafa;--p-surface-100: #f5f5f5;--p-surface-200: #e5e5e5;--p-surface-300: #d4d4d4;--p-surface-400: #a3a3a3;--p-surface-500: #737373;--p-surface-600: #525252;--p-surface-700: #404040;--p-surface-800: #262626;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #171717;--p-surface-950: #0a0a0a;--p-primary: rgb(0, 95, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-primary-color: var(--p-primary-500);--p-primary-contrast-color: var(--p-surface-0);--p-primary-hover-color: var(--p-primary-600);--p-primary-active-color: var(--p-primary-700);--p-secondary-color: var(--p-secondary-500);--p-secondary-contrast-color: var(--p-surface-0);--p-secondary-hover-color: var(--p-secondary-600);--p-secondary-active-color: var(--p-secondary-700);--p-danger-color: var(--p-danger-500);--p-danger-contrast-color: var(--p-surface-0);--p-danger-hover-color: var(--p-danger-600);--p-danger-active-color: var(--p-danger-700);--p-success-color: var(--p-success-500);--p-success-contrast-color: var(--p-surface-0);--p-success-hover-color: var(--p-success-600);--p-success-active-color: var(--p-success-700);--p-warn-color: var(--p-warn-500);--p-warn-contrast-color: var(--p-surface-0);--p-warn-hover-color: var(--p-warn-600);--p-warn-active-color: var(--p-warn-700);--p-info-color: var(--p-info-500);--p-info-contrast-color: var(--p-surface-0);--p-info-hover-color: var(--p-info-600);--p-info-active-color: var(--p-info-700);--p-help-color: var(--p-help-500);--p-help-contrast-color: var(--p-surface-0);--p-help-hover-color: var(--p-help-600);--p-help-active-color: var(--p-help-700);--p-accent-color: var(--p-accent-500);--p-accent-contrast-color: var(--p-surface-0);--p-accent-hover-color: var(--p-accent-600);--p-accent-active-color: var(--p-accent-700);--p-content-border-color: var(--p-surface-200);--p-content-hover-background: var(--p-surface-100);--p-content-hover-color: var(--p-surface-800);--p-highlight-background: var(--p-primary-50);--p-highlight-color: var(--p-primary-700);--p-highlight-focus-background: var(--p-primary-100);--p-highlight-focus-color: var(--p-primary-800);--p-content-background: var(--p-surface-0);--p-text-color: var(--p-surface-700);--p-text-hover-color: var(--p-surface-800);--p-text-muted-color: var(--p-surface-500);--p-text-hover-muted-color: var(--p-surface-600)}*,:before,:after{--tw-border-spacing-x: 0;--tw-border-spacing-y: 0;--tw-translate-x: 0;--tw-translate-y: 0;--tw-rotate: 0;--tw-skew-x: 0;--tw-skew-y: 0;--tw-scale-x: 1;--tw-scale-y: 1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness: proximity;--tw-gradient-from-position: ;--tw-gradient-via-position: ;--tw-gradient-to-position: ;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width: 0px;--tw-ring-offset-color: #fff;--tw-ring-color: rgb(59 130 246 / .5);--tw-ring-offset-shadow: 0 0 #0000;--tw-ring-shadow: 0 0 #0000;--tw-shadow: 0 0 #0000;--tw-shadow-colored: 0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: ;--tw-contain-size: ;--tw-contain-layout: ;--tw-contain-paint: ;--tw-contain-style: }::backdrop{--tw-border-spacing-x: 0;--tw-border-spacing-y: 0;--tw-translate-x: 0;--tw-translate-y: 0;--tw-rotate: 0;--tw-skew-x: 0;--tw-skew-y: 0;--tw-scale-x: 1;--tw-scale-y: 1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness: proximity;--tw-gradient-from-position: ;--tw-gradient-via-position: ;--tw-gradient-to-position: ;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width: 0px;--tw-ring-offset-color: #fff;--tw-ring-color: rgb(59 130 246 / .5);--tw-ring-offset-shadow: 0 0 #0000;--tw-ring-shadow: 0 0 #0000;--tw-shadow: 0 0 #0000;--tw-shadow-colored: 0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: ;--tw-contain-size: ;--tw-contain-layout: ;--tw-contain-paint: ;--tw-contain-style: }*,:before,:after{box-sizing:border-box;border-width:0;border-style:solid;border-color:#e5e7eb}:before,:after{--tw-content: ""}html,:host{line-height:1.5;-webkit-text-size-adjust:100%;-moz-tab-size:4;tab-size:4;font-family:ui-sans-serif,system-ui,sans-serif,"Apple Color Emoji","Segoe UI Emoji",Segoe UI Symbol,"Noto Color Emoji";font-feature-settings:normal;font-variation-settings:normal;-webkit-tap-highlight-color:transparent}body{margin:0;line-height:inherit}hr{height:0;color:inherit;border-top-width:1px}abbr:where([title]){text-decoration:underline dotted}h1,h2,h3,h4,h5,h6{font-size:inherit;font-weight:inherit}a{color:inherit;text-decoration:inherit}b,strong{font-weight:bolder}code,kbd,samp,pre{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace;font-feature-settings:normal;font-variation-settings:normal;font-size:1em}small{font-size:80%}sub,sup{font-size:75%;line-height:0;position:relative;vertical-align:baseline}sub{bottom:-.25em}sup{top:-.5em}table{text-indent:0;border-color:inherit;border-collapse:collapse}button,input,optgroup,select,textarea{font-family:inherit;font-feature-settings:inherit;font-variation-settings:inherit;font-size:100%;font-weight:inherit;line-height:inherit;letter-spacing:inherit;color:inherit;margin:0;padding:0}button,select{text-transform:none}button,input:where([type=button]),input:where([type=reset]),input:where([type=submit]){-webkit-appearance:button;background-color:transparent;background-image:none}:-moz-focusring{outline:auto}:-moz-ui-invalid{box-shadow:none}progress{vertical-align:baseline}::-webkit-inner-spin-button,::-webkit-outer-spin-button{height:auto}[type=search]{-webkit-appearance:textfield;outline-offset:-2px}::-webkit-search-decoration{-webkit-appearance:none}::-webkit-file-upload-button{-webkit-appearance:button;font:inherit}summary{display:list-item}blockquote,dl,dd,h1,h2,h3,h4,h5,h6,hr,figure,p,pre{margin:0}fieldset{margin:0;padding:0}legend{padding:0}ol,ul,menu{list-style:none;margin:0;padding:0}dialog{padding:0}textarea{resize:vertical}input::placeholder,textarea::placeholder{opacity:1;color:#9ca3af}button,[role=button]{cursor:pointer}:disabled{cursor:default}img,svg,video,canvas,audio,iframe,embed,object{display:block;vertical-align:middle}img,video{max-width:100%;height:auto}[hidden]:where(:not([hidden=until-found])){display:none}@supports (-moz-appearance:none){*{scrollbar-color:initial;scrollbar-width:initial}}:host{display:block}*,*:before,*:after{box-sizing:border-box}.ks-title{font-weight:600;font-size:1rem}.ks-panel{display:flex;flex-direction:column}.ks-tools{display:flex;align-items:center;gap:12px;padding:0 0 12px;border-bottom:1px solid var(--p-content-border-color)}.ks-search{flex:1;appearance:none;border:1px solid var(--p-content-border-color);background:var(--p-content-background, transparent);color:inherit;border-radius:8px;padding:8px 11px;font:inherit;font-size:.85rem}.ks-link{appearance:none;border:none;background:transparent;color:var(--p-primary-color);cursor:pointer;font:inherit;font-size:.82rem;padding:4px 6px;border-radius:8px;white-space:nowrap}.ks-link:hover{background:var(--p-highlight-background)}.ks-body{padding:12px 0 4px;overflow-y:auto;flex:1;max-height:55vh}.ks-empty{color:var(--p-text-muted-color);font-size:.85rem;margin:16px 0}.ks-list{display:flex;flex-direction:column}.ks-row{display:flex;align-items:center;gap:10px;padding:5px 8px;border-radius:8px;cursor:pointer;min-width:0}.ks-row:hover,.ks-row.is-selected{background:var(--p-highlight-background)}.ks-check{width:15px;height:15px;accent-color:var(--p-primary-color);cursor:pointer;flex:none}.ks-row-name{flex:1;min-width:0;font-size:.86rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.ks-row-meta{display:flex;align-items:center;gap:6px;flex:none}.ks-tag{font-size:.68rem;line-height:1.6;color:var(--p-text-muted-color);border:1px solid var(--p-content-border-color);border-radius:999px;padding:0 8px;white-space:nowrap}.ks-tag--data{color:var(--p-primary-color);border-color:var(--p-primary-color)}.ks-foot{display:flex;align-items:center;gap:10px;padding:12px 0 0;border-top:1px solid var(--p-content-border-color)}.ks-count{color:var(--p-text-muted-color);font-size:.82rem}.ks-spacer{flex:1}.ks-btn{appearance:none;border:1px solid var(--p-primary-color);background:var(--p-primary-color);color:var(--p-button-primary-color);border-radius:8px;padding:8px 16px;font:inherit;font-size:.85rem;cursor:pointer}.ks-btn:disabled{opacity:.55;cursor:default}.ks-btn--ghost{background:transparent;color:inherit;border-color:var(--p-content-border-color)}.ks-error{color:var(--p-danger-color);font-size:.85rem;margin:12px 0 0}.ks-notice{color:var(--p-text-muted-color);font-size:.85rem;margin:12px 0 0}.ks-file{display:none}', ne = { props: { type: "object", properties: {} } }, ce = {
  wippy: ne
};
class X extends cr {
  static get wippyConfig() {
    return {
      propsSchema: ce.wippy.props,
      hostCssKeys: ["themeConfigUrl", "primeVueCssUrl"],
      inlineCss: ie
    };
  }
  static get vueConfig() {
    return { rootComponent: ae, plugins: [$r] };
  }
}
async function ge() {
  return X;
}
Lr(import.meta.url, X);
export {
  ge as webComponent
};
//# sourceMappingURL=index.js.map

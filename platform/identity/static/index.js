import { u as er, W as or } from "./wc-runtime-DZZltuMO.js";
import ar from "primevue/config";
import tr from "primevue/contextmenu";
import ir from "primevue/menu";
import nr from "primevue/portal";
import { renderSlot as M, createCommentVNode as k, h as cr, Teleport as pr, defineComponent as sr, ref as l, computed as lr, onMounted as dr, openBlock as s, createBlock as ur, unref as g, withCtx as fr, createElementVNode as p, createVNode as L, createElementBlock as d, toDisplayString as v, createTextVNode as b, Fragment as R, renderList as mr } from "vue";
import { api as x, define as vr } from "@wippy-fe/proxy";
import V from "primevue/button";
import hr from "primevue/dialog";
import gr from "primevue/select";
import "@iconify/vue";
const br = "data-wippy-overlay-layer";
function W() {
  return typeof window < "u" && typeof window.document < "u";
}
function Y() {
  return W() && typeof HTMLElement < "u" && Object.hasOwn(HTMLElement.prototype, "popover");
}
function yr() {
  return Y() && typeof CSS < "u" && typeof CSS.supports == "function" && CSS.supports("anchor-name: --a") && CSS.supports("position-area", "bottom span-right") && CSS.supports("position-try-fallbacks", "flip-block") && CSS.supports("min-width", "min(anchor-size(width), 100vw)") && CSS.supports("max-width", "stretch");
}
const wr = /\bp-(?:select|multiselect|treeselect|cascadeselect)-overlay\b/;
let xr = 0;
const C = /* @__PURE__ */ new WeakMap();
function $(r, e) {
  const o = r.style;
  o.setProperty("position", "fixed", "important"), o.setProperty("inset", "auto", "important"), o.setProperty("margin", "0", "important"), o.setProperty("position-anchor", e), o.setProperty("position-area", "bottom span-right"), o.setProperty("position-try-fallbacks", "flip-block, flip-inline, flip-block flip-inline"), o.setProperty("min-width", "min(anchor-size(width), 100vw)", "important"), o.setProperty("max-width", "stretch", "important");
}
function kr(r, e) {
  if (!wr.test(r.className))
    return;
  const o = r.style.cssText;
  $(r, e), r.getAttribute("popover") !== "manual" && r.setAttribute("popover", "manual");
  try {
    r.matches(":popover-open") || r.showPopover();
  } catch {
  }
  if (!r.matches(":popover-open")) {
    r.removeAttribute("popover"), r.style.cssText = o;
    return;
  }
  if (!C.has(r)) {
    const c = new MutationObserver(() => {
      const i = r.style;
      (i.top !== "auto" || i.left !== "auto" || i.margin !== "0px" || i.getPropertyPriority("top") !== "important" || i.getPropertyPriority("left") !== "important" || i.getPropertyPriority("margin") !== "important" || i.getPropertyPriority("min-width") !== "important" || i.maxWidth !== "stretch" || i.getPropertyPriority("max-width") !== "important") && $(r, e);
    });
    c.observe(r, { attributes: !0, attributeFilter: ["style"] }), C.set(r, c);
  }
}
function P(r) {
  const e = C.get(r);
  e && (e.disconnect(), C.delete(r));
}
function Cr(r) {
  const e = r && typeof r.getRootNode == "function" ? r.getRootNode() : null;
  return e instanceof ShadowRoot ? e : null;
}
function E(r) {
  r.style.top = "0px", r.style.left = "0px";
  const e = r.getBoundingClientRect();
  r.style.top = `${-window.scrollY - e.top}px`, r.style.left = `${-window.scrollX - e.left}px`;
}
const _ = /* @__PURE__ */ new Set(), T = /* @__PURE__ */ new WeakMap();
let D = !1, z = !1;
function _r() {
  z = !1;
  for (const r of _) {
    if (!r.isConnected) {
      for (const e of Array.from(r.children))
        e instanceof HTMLElement && P(e);
      _.delete(r), T.get(r)?.disconnect();
      continue;
    }
    r.childElementCount > 0 && E(r);
  }
}
function j() {
  z || (z = !0, requestAnimationFrame(_r));
}
function Lr(r) {
  const e = document.createElement("div");
  e.setAttribute(br, "");
  const o = Y();
  if (e.style.cssText = o ? "position:fixed;width:0 !important;height:0 !important;margin:0 !important;border:0 !important;padding:0 !important;background:transparent !important;color:inherit !important;overflow:visible !important;" : "position:fixed;top:0;left:0;width:0;height:0;", o && e.setAttribute("popover", "manual"), r.appendChild(e), o) {
    try {
      e.showPopover();
    } catch {
    }
    e.matches(":popover-open") || (e.removeAttribute("popover"), e.style.cssText = "position:fixed;top:0;left:0;width:0;height:0;");
  }
  E(e);
  const c = new MutationObserver((i) => {
    const u = e.__wippyAnchorName;
    for (const f of i) {
      if (u)
        for (const m of Array.from(f.addedNodes))
          m instanceof HTMLElement && kr(m, u);
      for (const m of Array.from(f.removedNodes))
        m instanceof HTMLElement && P(m);
    }
    e.isConnected && e.childElementCount > 0 && E(e);
  });
  return c.observe(e, { childList: !0 }), T.set(e, c), _.add(e), D || (D = !0, window.addEventListener("scroll", j, { capture: !0, passive: !0 }), window.addEventListener("resize", j, { passive: !0 })), e;
}
function F(r) {
  if (!(!r.hostRoot || r.layer) && (r.layer = Lr(r.hostRoot), yr())) {
    const e = r.$el ? r.$el.parentElement : null;
    e && (r.anchorName = `--wippy-a-${++xr}`, r.anchorTrigger = e, e.style.setProperty("anchor-name", r.anchorName), r.layer.__wippyAnchorName = r.anchorName);
  }
}
function H(r) {
  if (r.anchorTrigger && (r.anchorTrigger.style.removeProperty("anchor-name"), r.anchorTrigger = null), r.anchorName = null, r.layer) {
    for (const e of Array.from(r.layer.children))
      e instanceof HTMLElement && P(e);
    _.delete(r.layer), T.get(r.layer)?.disconnect(), r.layer.remove(), r.layer = null;
  }
}
let U = !1;
function Sr() {
  if (U)
    return;
  const r = ir;
  !r.methods || typeof r.methods.bindOutsideClickListener != "function" || (r.methods.bindOutsideClickListener = function() {
    this.outsideClickListener || (this.outsideClickListener = (e) => {
      const o = e.composedPath(), c = this.container && !o.includes(this.container), i = !(this.target && o.includes(this.target));
      this.overlayVisible && c && i ? this.hide() : !this.popup && c && i && (this.focusedOptionIndex = -1);
    }, document.addEventListener("click", this.outsideClickListener, !0));
  }, U = !0);
}
let B = !1;
function Er() {
  if (B)
    return;
  const r = tr;
  !r.methods || typeof r.methods.bindOutsideClickListener != "function" || (r.methods.bindOutsideClickListener = function() {
    this.outsideClickListener || (this.outsideClickListener = (e) => {
      const o = e.composedPath(), c = this.container && !o.includes(this.container), i = this.visible ? !(this.target && o.includes(this.target)) : !0;
      c && i && this.hide();
    }, document.addEventListener("click", this.outsideClickListener, !0));
  }, B = !0);
}
let G = !1;
function zr() {
  if (G)
    return;
  G = !0;
  const r = nr;
  r.computed = r.computed || {}, r.computed.inline = function() {
    return !!this.disabled || this.appendTo === "self";
  }, r.computed.resolvedTarget = function() {
    return this.appendTo == null || this.appendTo === "body" ? this.hostRoot ? this.layer : document.body : this.appendTo;
  }, r.data = function() {
    return { mounted: !1, hostRoot: null, layer: null, anchorName: null, anchorTrigger: null };
  }, r.mounted = function() {
    W() && (this.hostRoot = Cr(this.$el), this.mounted = !0, this.hostRoot && (this.inline || F(this), this.$watch("inline", (e) => {
      e ? H(this) : F(this);
    })));
  }, r.render = function() {
    return this.inline ? M(this.$slots, "default", { key: 0 }) : this.mounted ? cr(pr, { key: 1, to: this.resolvedTarget || document.body }, [
      M(this.$slots, "default")
    ]) : k("", !0);
  }, r.unmounted = function() {
    H(this);
  };
}
const Pr = {
  install: (r) => {
    Sr(), Er(), zr(), r.use(ar, { theme: "none" });
  }
}, Tr = () => er();
function Ar(r) {
  if (!r) return null;
  let e;
  if (typeof r == "number")
    e = r;
  else {
    const o = r.trim();
    if (/^\d+$/.test(o))
      e = Number(o);
    else {
      const c = Date.parse(o);
      return Number.isNaN(c) ? null : c;
    }
  }
  return Number.isFinite(e) ? e < 1e12 ? e * 1e3 : e : null;
}
function I(r, e) {
  const o = Ar(r);
  return o === null ? "" : new Date(o).toLocaleDateString(void 0, e);
}
const Nr = { class: "ks-body" }, Or = { class: "ks-panel" }, Mr = { class: "ks-field" }, Rr = { class: "ks-row" }, Vr = {
  key: 0,
  class: "ks-code"
}, $r = {
  key: 0,
  class: "ks-hint"
}, Dr = {
  key: 1,
  class: "ks-hint"
}, jr = { class: "ks-panel" }, Fr = {
  key: 0,
  class: "ks-empty"
}, Hr = {
  key: 1,
  class: "ks-empty"
}, Ur = {
  key: 2,
  class: "ks-list"
}, Br = { class: "ks-provider" }, Gr = { class: "ks-item-main" }, Ir = { class: "ks-item-name" }, Wr = { class: "ks-item-sub" }, Yr = {
  key: 0,
  class: "ks-error"
}, S = "kickside.dm.agents:greeter", qr = /* @__PURE__ */ sr({
  __name: "links",
  setup(r) {
    const e = Tr(), o = l([]), c = l(!0), i = l(""), u = l(!1), f = l(""), m = l(0), y = l(""), A = l([]), w = l(S), N = l(!0), K = lr(() => [
      { label: "Greeter (default)", value: S },
      ...A.value.map((a) => ({ label: a.title, value: a.id }))
    ]), h = (a) => `${a.provider}:${a.external_id}`;
    function X() {
      e("close", void 0);
    }
    function J(a) {
      a || X();
    }
    async function O() {
      c.value = !0, i.value = "";
      try {
        const { data: a } = await x.get("/api/v1/identity/links");
        if (!a?.success) throw new Error(a?.error || "failed to load linked accounts");
        o.value = a.links || [];
      } catch (a) {
        i.value = a instanceof Error ? a.message : String(a);
      } finally {
        c.value = !1;
      }
    }
    async function Q() {
      try {
        const { data: a } = await x.get("/api/v1/user-agents");
        if (!a?.success) return;
        A.value = (a.agents || []).map((t) => ({
          id: String(t.id),
          title: t.title || String(t.id)
        }));
      } catch {
      }
    }
    async function Z() {
      u.value = !0, i.value = "";
      try {
        const a = {};
        w.value && w.value !== S && (a.agent_id = `user_agent:${w.value}`);
        const { data: t } = await x.post("/api/v1/identity/link-codes", a);
        if (!t?.success) throw new Error(t?.error || "failed to generate code");
        f.value = String(t.code || ""), m.value = Number(t.expires_in_seconds || 0);
      } catch (a) {
        i.value = a instanceof Error ? a.message : String(a);
      } finally {
        u.value = !1;
      }
    }
    async function rr(a) {
      const t = h(a);
      y.value = t, i.value = "";
      try {
        const { data: n } = await x.post("/api/v1/identity/unlink", { provider: a.provider, external_id: a.external_id });
        if (!n?.success) throw new Error(n?.error || "failed to unlink");
        await O();
      } catch (n) {
        i.value = n instanceof Error ? n.message : String(n);
      } finally {
        y.value = "";
      }
    }
    return dr(async () => {
      await O(), await Q();
    }), (a, t) => (s(), ur(g(hr), {
      visible: N.value,
      "onUpdate:visible": [
        t[1] || (t[1] = (n) => N.value = n),
        J
      ],
      modal: "",
      header: "Linked accounts",
      "dismissable-mask": !0,
      style: { width: "520px", maxWidth: "calc(100vw - 48px)" },
      "aria-label": "Linked accounts"
    }, {
      default: fr(() => [
        p("div", Nr, [
          t[7] || (t[7] = p("p", { class: "ks-lead" }, "Connect a chat account (Discord, …) to your identity so a bot answers as you.", -1)),
          p("div", Or, [
            p("label", Mr, [
              t[2] || (t[2] = p("span", { class: "ks-field-label" }, "Starting agent", -1)),
              L(g(gr), {
                modelValue: w.value,
                "onUpdate:modelValue": t[0] || (t[0] = (n) => w.value = n),
                class: "ks-select",
                options: K.value,
                "option-label": "label",
                "option-value": "value",
                "aria-label": "Starting agent"
              }, null, 8, ["modelValue", "options"])
            ]),
            p("div", Rr, [
              L(g(V), {
                type: "button",
                "data-testid": "identity-generate",
                label: u.value ? "Generating…" : "Generate link code",
                loading: u.value,
                disabled: u.value,
                onClick: Z
              }, null, 8, ["label", "loading", "disabled"]),
              f.value ? (s(), d("span", Vr, v(f.value), 1)) : k("", !0)
            ]),
            f.value ? (s(), d("p", $r, [
              t[3] || (t[3] = b("DM the bot ", -1)),
              p("code", null, "link " + v(f.value), 1),
              b(" within " + v(Math.round(m.value / 60)) + " min.", 1)
            ])) : (s(), d("p", Dr, [...t[4] || (t[4] = [
              b("Generate a code, then send ", -1),
              p("code", null, "link <code>", -1),
              b(" to the bot in a direct message.", -1)
            ])]))
          ]),
          p("div", jr, [
            t[6] || (t[6] = p("div", { class: "ks-row" }, [
              p("strong", null, "Your linked accounts")
            ], -1)),
            c.value ? (s(), d("p", Fr, "Loading…")) : o.value.length === 0 ? (s(), d("p", Hr, "No accounts linked yet.")) : (s(), d("div", Ur, [
              (s(!0), d(R, null, mr(o.value, (n) => (s(), d("div", {
                key: h(n),
                class: "ks-item"
              }, [
                p("span", Br, v(n.provider), 1),
                p("div", Gr, [
                  p("span", Ir, v(n.display_name || n.external_id), 1),
                  p("span", Wr, [
                    b(v(n.external_id), 1),
                    g(I)(n.created_at) ? (s(), d(R, { key: 0 }, [
                      b(" · linked " + v(g(I)(n.created_at)), 1)
                    ], 64)) : k("", !0)
                  ])
                ]),
                t[5] || (t[5] = p("div", { class: "ks-spacer" }, null, -1)),
                L(g(V), {
                  type: "button",
                  class: "ks-item-action",
                  "data-testid": "identity-unlink",
                  "data-link-key": h(n),
                  label: y.value === h(n) ? "Removing…" : "Unlink",
                  severity: "danger",
                  outlined: "",
                  loading: y.value === h(n),
                  disabled: y.value === h(n),
                  onClick: (Qr) => rr(n)
                }, null, 8, ["data-link-key", "label", "loading", "disabled", "onClick"])
              ]))), 128))
            ]))
          ]),
          i.value ? (s(), d("p", Yr, v(i.value), 1)) : k("", !0)
        ])
      ]),
      _: 1
    }, 8, ["visible"]));
  }
}), Kr = ':root{--p-form-field-padding-x: .75rem;--p-form-field-padding-y: .5rem;--p-form-field-sm-padding-x: .625rem;--p-form-field-sm-padding-y: .375rem;--p-form-field-lg-padding-x: .875rem;--p-form-field-lg-padding-y: .625rem;--p-form-field-border-radius: .375rem;--p-form-field-transition-duration: .2s;--p-form-field-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), 0 1px 2px 0 rgba(18, 18, 23, .05);--p-focus-ring-width: 1px;--p-focus-ring-style: solid;--p-focus-ring-color: color-mix(in srgb, var(--p-primary-color) 100%, transparent);--p-focus-ring-offset: 2px;--p-toggleswitch-width: 2.5rem;--p-toggleswitch-height: 1.5rem;--p-toggleswitch-border-radius: 30px;--p-toggleswitch-gap: .25rem;--p-toggleswitch-border-width: 1px;--p-toggleswitch-transition-duration: .2s;--p-toggleswitch-slide-duration: .2s;--p-toggleswitch-handle-size: 1rem;--p-toggleswitch-handle-border-radius: 9999px}:root{color-scheme:light dark;--p-primary: rgb(0, 95, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-secondary: #6f7385;--p-secondary-50: color-mix(in srgb, var(--p-secondary) 5%, white);--p-secondary-100: color-mix(in srgb, var(--p-secondary) 10%, white);--p-secondary-200: color-mix(in srgb, var(--p-secondary) 20%, white);--p-secondary-300: color-mix(in srgb, var(--p-secondary) 35%, white);--p-secondary-400: color-mix(in srgb, var(--p-secondary) 65%, white);--p-secondary-500: var(--p-secondary);--p-secondary-600: color-mix(in srgb, var(--p-secondary) 80%, black);--p-secondary-700: color-mix(in srgb, var(--p-secondary) 65%, black);--p-secondary-800: color-mix(in srgb, var(--p-secondary) 55%, black);--p-secondary-900: color-mix(in srgb, var(--p-secondary) 50%, black);--p-secondary-950: color-mix(in srgb, var(--p-secondary) 30%, black);--p-danger: rgb(239, 68, 68);--p-danger-50: color-mix(in srgb, var(--p-danger) 5%, white);--p-danger-100: color-mix(in srgb, var(--p-danger) 10%, white);--p-danger-200: color-mix(in srgb, var(--p-danger) 20%, white);--p-danger-300: color-mix(in srgb, var(--p-danger) 30%, white);--p-danger-400: color-mix(in srgb, var(--p-danger) 40%, white);--p-danger-500: var(--p-danger);--p-danger-600: color-mix(in srgb, var(--p-danger) 80%, black);--p-danger-700: color-mix(in srgb, var(--p-danger) 70%, black);--p-danger-800: color-mix(in srgb, var(--p-danger) 60%, black);--p-danger-900: color-mix(in srgb, var(--p-danger) 50%, black);--p-danger-950: color-mix(in srgb, var(--p-danger) 40%, black);--p-success: rgb(34, 197, 94);--p-success-50: color-mix(in srgb, var(--p-success) 5%, white);--p-success-100: color-mix(in srgb, var(--p-success) 10%, white);--p-success-200: color-mix(in srgb, var(--p-success) 20%, white);--p-success-300: color-mix(in srgb, var(--p-success) 30%, white);--p-success-400: color-mix(in srgb, var(--p-success) 40%, white);--p-success-500: var(--p-success);--p-success-600: color-mix(in srgb, var(--p-success) 80%, black);--p-success-700: color-mix(in srgb, var(--p-success) 70%, black);--p-success-800: color-mix(in srgb, var(--p-success) 60%, black);--p-success-900: color-mix(in srgb, var(--p-success) 50%, black);--p-success-950: color-mix(in srgb, var(--p-success) 40%, black);--p-warn: rgb(249, 115, 22);--p-warn-50: color-mix(in srgb, var(--p-warn) 5%, white);--p-warn-100: color-mix(in srgb, var(--p-warn) 10%, white);--p-warn-200: color-mix(in srgb, var(--p-warn) 20%, white);--p-warn-300: color-mix(in srgb, var(--p-warn) 30%, white);--p-warn-400: color-mix(in srgb, var(--p-warn) 40%, white);--p-warn-500: var(--p-warn);--p-warn-600: color-mix(in srgb, var(--p-warn) 80%, black);--p-warn-700: color-mix(in srgb, var(--p-warn) 70%, black);--p-warn-800: color-mix(in srgb, var(--p-warn) 60%, black);--p-warn-900: color-mix(in srgb, var(--p-warn) 50%, black);--p-warn-950: color-mix(in srgb, var(--p-warn) 40%, black);--p-info: rgb(14, 165, 233);--p-info-50: color-mix(in srgb, var(--p-info) 5%, white);--p-info-100: color-mix(in srgb, var(--p-info) 10%, white);--p-info-200: color-mix(in srgb, var(--p-info) 20%, white);--p-info-300: color-mix(in srgb, var(--p-info) 30%, white);--p-info-400: color-mix(in srgb, var(--p-info) 40%, white);--p-info-500: var(--p-info);--p-info-600: color-mix(in srgb, var(--p-info) 80%, black);--p-info-700: color-mix(in srgb, var(--p-info) 70%, black);--p-info-800: color-mix(in srgb, var(--p-info) 60%, black);--p-info-900: color-mix(in srgb, var(--p-info) 50%, black);--p-info-950: color-mix(in srgb, var(--p-info) 40%, black);--p-help: rgb(168, 85, 247);--p-help-50: color-mix(in srgb, var(--p-help) 5%, white);--p-help-100: color-mix(in srgb, var(--p-help) 10%, white);--p-help-200: color-mix(in srgb, var(--p-help) 20%, white);--p-help-300: color-mix(in srgb, var(--p-help) 30%, white);--p-help-400: color-mix(in srgb, var(--p-help) 40%, white);--p-help-500: var(--p-help);--p-help-600: color-mix(in srgb, var(--p-help) 80%, black);--p-help-700: color-mix(in srgb, var(--p-help) 70%, black);--p-help-800: color-mix(in srgb, var(--p-help) 60%, black);--p-help-900: color-mix(in srgb, var(--p-help) 50%, black);--p-help-950: color-mix(in srgb, var(--p-help) 40%, black);--p-accent: rgb(20, 184, 166);--p-accent-50: color-mix(in srgb, var(--p-accent) 5%, white);--p-accent-100: color-mix(in srgb, var(--p-accent) 10%, white);--p-accent-200: color-mix(in srgb, var(--p-accent) 20%, white);--p-accent-300: color-mix(in srgb, var(--p-accent) 30%, white);--p-accent-400: color-mix(in srgb, var(--p-accent) 40%, white);--p-accent-500: var(--p-accent);--p-accent-600: color-mix(in srgb, var(--p-accent) 80%, black);--p-accent-700: color-mix(in srgb, var(--p-accent) 70%, black);--p-accent-800: color-mix(in srgb, var(--p-accent) 60%, black);--p-accent-900: color-mix(in srgb, var(--p-accent) 50%, black);--p-accent-950: color-mix(in srgb, var(--p-accent) 40%, black);--p-surface-0: #ffffff;--p-surface-50: #fafafa;--p-surface-100: #f5f5f5;--p-surface-200: #e5e5e5;--p-surface-300: #d4d4d4;--p-surface-400: #a3a3a3;--p-surface-500: #737373;--p-surface-600: #525252;--p-surface-700: #404040;--p-surface-800: #262626;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #171717;--p-surface-950: #0a0a0a;--p-content-border-radius: 6px;--p-font-heading-family: var(--v-font-family-head, Arial);--p-font-heading-scale: 1;--p-font-heading-line-height: 1.5;--p-font-heading-letter-spacing: normal;--p-font-heading-stretch: normal;--p-font-heading-variation-settings: normal;--p-font-body-scale: 1;--p-font-body-line-height: 1.5;--p-font-body-letter-spacing: normal;--p-font-body-stretch: normal;--p-font-body-variation-settings: normal;--p-font-mono-family: ui-monospace}:root{--p-primary-color: var(--p-primary-500);--p-primary-contrast-color: var(--p-surface-0);--p-primary-hover-color: var(--p-primary-600);--p-primary-active-color: var(--p-primary-700);--p-secondary-color: var(--p-secondary-500);--p-secondary-contrast-color: var(--p-surface-0);--p-secondary-hover-color: var(--p-secondary-600);--p-secondary-active-color: var(--p-secondary-700);--p-danger-color: var(--p-danger-500);--p-danger-contrast-color: var(--p-surface-0);--p-danger-hover-color: var(--p-danger-600);--p-danger-active-color: var(--p-danger-700);--p-success-color: var(--p-success-500);--p-success-contrast-color: var(--p-surface-0);--p-success-hover-color: var(--p-success-600);--p-success-active-color: var(--p-success-700);--p-warn-color: var(--p-warn-500);--p-warn-contrast-color: var(--p-surface-0);--p-warn-hover-color: var(--p-warn-600);--p-warn-active-color: var(--p-warn-700);--p-info-color: var(--p-info-500);--p-info-contrast-color: var(--p-surface-0);--p-info-hover-color: var(--p-info-600);--p-info-active-color: var(--p-info-700);--p-help-color: var(--p-help-500);--p-help-contrast-color: var(--p-surface-0);--p-help-hover-color: var(--p-help-600);--p-help-active-color: var(--p-help-700);--p-accent-color: var(--p-accent-500);--p-accent-contrast-color: var(--p-surface-0);--p-accent-hover-color: var(--p-accent-600);--p-accent-active-color: var(--p-accent-700);--p-content-border-color: var(--p-surface-200);--p-content-hover-background: var(--p-surface-100);--p-content-hover-color: var(--p-surface-800);--p-highlight-background: var(--p-primary-50);--p-highlight-color: var(--p-primary-700);--p-highlight-focus-background: var(--p-primary-100);--p-highlight-focus-color: var(--p-primary-800);--p-content-background: var(--p-surface-0);--p-text-color: var(--p-surface-700);--p-text-hover-color: var(--p-surface-800);--p-text-muted-color: var(--p-surface-500);--p-text-hover-muted-color: var(--p-surface-600)}@media(prefers-color-scheme:dark){:root:not(.w-theme-light){--p-surface-D: #fff;--p-surface-0: #fff;--p-surface-50: #fafafa;--p-surface-100: #f4f4f5;--p-surface-200: #e4e4e7;--p-surface-300: #d4d4d8;--p-surface-400: #a1a1aa;--p-surface-500: #71717a;--p-surface-600: #545250;--p-surface-700: #403e3c;--p-surface-800: #2b2927;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #1c1a19;--p-surface-950: #0f0e0d;--p-primary: rgb(0, 125, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-primary-color: var(--p-primary-400);--p-primary-contrast-color: var(--p-surface-900);--p-primary-hover-color: var(--p-primary-300);--p-primary-active-color: var(--p-primary-200);--p-secondary-color: var(--p-secondary-400);--p-secondary-contrast-color: var(--p-surface-900);--p-secondary-hover-color: var(--p-secondary-300);--p-secondary-active-color: var(--p-secondary-200);--p-danger-color: var(--p-danger-400);--p-danger-contrast-color: var(--p-surface-900);--p-danger-hover-color: var(--p-danger-300);--p-danger-active-color: var(--p-danger-200);--p-success-color: var(--p-success-400);--p-success-contrast-color: var(--p-surface-900);--p-success-hover-color: var(--p-success-300);--p-success-active-color: var(--p-success-200);--p-warn-color: var(--p-warn-400);--p-warn-contrast-color: var(--p-surface-900);--p-warn-hover-color: var(--p-warn-300);--p-warn-active-color: var(--p-warn-200);--p-info-color: var(--p-info-400);--p-info-contrast-color: var(--p-surface-900);--p-info-hover-color: var(--p-info-300);--p-info-active-color: var(--p-info-200);--p-help-color: var(--p-help-400);--p-help-contrast-color: var(--p-surface-900);--p-help-hover-color: var(--p-help-300);--p-help-active-color: var(--p-help-200);--p-accent-color: var(--p-accent-400);--p-accent-contrast-color: var(--p-surface-900);--p-accent-hover-color: var(--p-accent-300);--p-accent-active-color: var(--p-accent-200);--p-content-border-color: var(--p-surface-700);--p-content-hover-background: var(--p-surface-800);--p-content-hover-color: var(--p-surface-0);--p-highlight-background: color-mix(in srgb, var(--p-primary-400), transparent 84%);--p-highlight-color: rgba(255, 255, 255, 87%);--p-highlight-focus-background: color-mix(in srgb, var(--p-primary-400), transparent 76%);--p-highlight-focus-color: rgba(255, 255, 255, 87%);--p-content-background: var(--p-surface-900);--p-text-color: var(--p-surface-0);--p-text-hover-color: var(--p-surface-0);--p-text-muted-color: var(--p-surface-400);--p-text-hover-muted-color: var(--p-surface-300)}}:root.w-theme-dark,.w-theme-dark{color-scheme:dark;--p-surface-D: #fff;--p-surface-0: #fff;--p-surface-50: #fafafa;--p-surface-100: #f4f4f5;--p-surface-200: #e4e4e7;--p-surface-300: #d4d4d8;--p-surface-400: #a1a1aa;--p-surface-500: #71717a;--p-surface-600: #545250;--p-surface-700: #403e3c;--p-surface-800: #2b2927;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #1c1a19;--p-surface-950: #0f0e0d;--p-primary: rgb(0, 125, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-primary-color: var(--p-primary-400);--p-primary-contrast-color: var(--p-surface-900);--p-primary-hover-color: var(--p-primary-300);--p-primary-active-color: var(--p-primary-200);--p-secondary-color: var(--p-secondary-400);--p-secondary-contrast-color: var(--p-surface-900);--p-secondary-hover-color: var(--p-secondary-300);--p-secondary-active-color: var(--p-secondary-200);--p-danger-color: var(--p-danger-400);--p-danger-contrast-color: var(--p-surface-900);--p-danger-hover-color: var(--p-danger-300);--p-danger-active-color: var(--p-danger-200);--p-success-color: var(--p-success-400);--p-success-contrast-color: var(--p-surface-900);--p-success-hover-color: var(--p-success-300);--p-success-active-color: var(--p-success-200);--p-warn-color: var(--p-warn-400);--p-warn-contrast-color: var(--p-surface-900);--p-warn-hover-color: var(--p-warn-300);--p-warn-active-color: var(--p-warn-200);--p-info-color: var(--p-info-400);--p-info-contrast-color: var(--p-surface-900);--p-info-hover-color: var(--p-info-300);--p-info-active-color: var(--p-info-200);--p-help-color: var(--p-help-400);--p-help-contrast-color: var(--p-surface-900);--p-help-hover-color: var(--p-help-300);--p-help-active-color: var(--p-help-200);--p-accent-color: var(--p-accent-400);--p-accent-contrast-color: var(--p-surface-900);--p-accent-hover-color: var(--p-accent-300);--p-accent-active-color: var(--p-accent-200);--p-content-border-color: var(--p-surface-700);--p-content-hover-background: var(--p-surface-800);--p-content-hover-color: var(--p-surface-0);--p-highlight-background: color-mix(in srgb, var(--p-primary-400), transparent 84%);--p-highlight-color: rgba(255, 255, 255, 87%);--p-highlight-focus-background: color-mix(in srgb, var(--p-primary-400), transparent 76%);--p-highlight-focus-color: rgba(255, 255, 255, 87%);--p-content-background: var(--p-surface-900);--p-text-color: var(--p-surface-0);--p-text-hover-color: var(--p-surface-0);--p-text-muted-color: var(--p-surface-400);--p-text-hover-muted-color: var(--p-surface-300)}:root.w-theme-light,.w-theme-light{color-scheme:light;--p-surface-0: #ffffff;--p-surface-50: #fafafa;--p-surface-100: #f5f5f5;--p-surface-200: #e5e5e5;--p-surface-300: #d4d4d4;--p-surface-400: #a3a3a3;--p-surface-500: #737373;--p-surface-600: #525252;--p-surface-700: #404040;--p-surface-800: #262626;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #171717;--p-surface-950: #0a0a0a;--p-primary: rgb(0, 95, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-primary-color: var(--p-primary-500);--p-primary-contrast-color: var(--p-surface-0);--p-primary-hover-color: var(--p-primary-600);--p-primary-active-color: var(--p-primary-700);--p-secondary-color: var(--p-secondary-500);--p-secondary-contrast-color: var(--p-surface-0);--p-secondary-hover-color: var(--p-secondary-600);--p-secondary-active-color: var(--p-secondary-700);--p-danger-color: var(--p-danger-500);--p-danger-contrast-color: var(--p-surface-0);--p-danger-hover-color: var(--p-danger-600);--p-danger-active-color: var(--p-danger-700);--p-success-color: var(--p-success-500);--p-success-contrast-color: var(--p-surface-0);--p-success-hover-color: var(--p-success-600);--p-success-active-color: var(--p-success-700);--p-warn-color: var(--p-warn-500);--p-warn-contrast-color: var(--p-surface-0);--p-warn-hover-color: var(--p-warn-600);--p-warn-active-color: var(--p-warn-700);--p-info-color: var(--p-info-500);--p-info-contrast-color: var(--p-surface-0);--p-info-hover-color: var(--p-info-600);--p-info-active-color: var(--p-info-700);--p-help-color: var(--p-help-500);--p-help-contrast-color: var(--p-surface-0);--p-help-hover-color: var(--p-help-600);--p-help-active-color: var(--p-help-700);--p-accent-color: var(--p-accent-500);--p-accent-contrast-color: var(--p-surface-0);--p-accent-hover-color: var(--p-accent-600);--p-accent-active-color: var(--p-accent-700);--p-content-border-color: var(--p-surface-200);--p-content-hover-background: var(--p-surface-100);--p-content-hover-color: var(--p-surface-800);--p-highlight-background: var(--p-primary-50);--p-highlight-color: var(--p-primary-700);--p-highlight-focus-background: var(--p-primary-100);--p-highlight-focus-color: var(--p-primary-800);--p-content-background: var(--p-surface-0);--p-text-color: var(--p-surface-700);--p-text-hover-color: var(--p-surface-800);--p-text-muted-color: var(--p-surface-500);--p-text-hover-muted-color: var(--p-surface-600)}*,:before,:after{--tw-border-spacing-x: 0;--tw-border-spacing-y: 0;--tw-translate-x: 0;--tw-translate-y: 0;--tw-rotate: 0;--tw-skew-x: 0;--tw-skew-y: 0;--tw-scale-x: 1;--tw-scale-y: 1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness: proximity;--tw-gradient-from-position: ;--tw-gradient-via-position: ;--tw-gradient-to-position: ;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width: 0px;--tw-ring-offset-color: #fff;--tw-ring-color: rgb(59 130 246 / .5);--tw-ring-offset-shadow: 0 0 #0000;--tw-ring-shadow: 0 0 #0000;--tw-shadow: 0 0 #0000;--tw-shadow-colored: 0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: ;--tw-contain-size: ;--tw-contain-layout: ;--tw-contain-paint: ;--tw-contain-style: }::backdrop{--tw-border-spacing-x: 0;--tw-border-spacing-y: 0;--tw-translate-x: 0;--tw-translate-y: 0;--tw-rotate: 0;--tw-skew-x: 0;--tw-skew-y: 0;--tw-scale-x: 1;--tw-scale-y: 1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness: proximity;--tw-gradient-from-position: ;--tw-gradient-via-position: ;--tw-gradient-to-position: ;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width: 0px;--tw-ring-offset-color: #fff;--tw-ring-color: rgb(59 130 246 / .5);--tw-ring-offset-shadow: 0 0 #0000;--tw-ring-shadow: 0 0 #0000;--tw-shadow: 0 0 #0000;--tw-shadow-colored: 0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: ;--tw-contain-size: ;--tw-contain-layout: ;--tw-contain-paint: ;--tw-contain-style: }*,:before,:after{box-sizing:border-box;border-width:0;border-style:solid;border-color:#e5e7eb}:before,:after{--tw-content: ""}html,:host{line-height:1.5;-webkit-text-size-adjust:100%;-moz-tab-size:4;tab-size:4;font-family:ui-sans-serif,system-ui,sans-serif,"Apple Color Emoji","Segoe UI Emoji",Segoe UI Symbol,"Noto Color Emoji";font-feature-settings:normal;font-variation-settings:normal;-webkit-tap-highlight-color:transparent}body{margin:0;line-height:inherit}hr{height:0;color:inherit;border-top-width:1px}abbr:where([title]){text-decoration:underline dotted}h1,h2,h3,h4,h5,h6{font-size:inherit;font-weight:inherit}a{color:inherit;text-decoration:inherit}b,strong{font-weight:bolder}code,kbd,samp,pre{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace;font-feature-settings:normal;font-variation-settings:normal;font-size:1em}small{font-size:80%}sub,sup{font-size:75%;line-height:0;position:relative;vertical-align:baseline}sub{bottom:-.25em}sup{top:-.5em}table{text-indent:0;border-color:inherit;border-collapse:collapse}button,input,optgroup,select,textarea{font-family:inherit;font-feature-settings:inherit;font-variation-settings:inherit;font-size:100%;font-weight:inherit;line-height:inherit;letter-spacing:inherit;color:inherit;margin:0;padding:0}button,select{text-transform:none}button,input:where([type=button]),input:where([type=reset]),input:where([type=submit]){-webkit-appearance:button;background-color:transparent;background-image:none}:-moz-focusring{outline:auto}:-moz-ui-invalid{box-shadow:none}progress{vertical-align:baseline}::-webkit-inner-spin-button,::-webkit-outer-spin-button{height:auto}[type=search]{-webkit-appearance:textfield;outline-offset:-2px}::-webkit-search-decoration{-webkit-appearance:none}::-webkit-file-upload-button{-webkit-appearance:button;font:inherit}summary{display:list-item}blockquote,dl,dd,h1,h2,h3,h4,h5,h6,hr,figure,p,pre{margin:0}fieldset{margin:0;padding:0}legend{padding:0}ol,ul,menu{list-style:none;margin:0;padding:0}dialog{padding:0}textarea{resize:vertical}input::placeholder,textarea::placeholder{opacity:1;color:#9ca3af}button,[role=button]{cursor:pointer}:disabled{cursor:default}img,svg,video,canvas,audio,iframe,embed,object{display:block;vertical-align:middle}img,video{max-width:100%;height:auto}[hidden]:where(:not([hidden=until-found])){display:none}@supports (-moz-appearance:none){*{scrollbar-color:initial;scrollbar-width:initial}}:host{display:block}*,*:before,*:after{box-sizing:border-box}.ks-body{overflow-y:auto;display:flex;flex-direction:column;gap:16px}.ks-lead{margin:0;color:var(--p-text-muted-color);font-size:.85rem}.ks-panel{border:1px solid var(--p-content-border-color);border-radius:10px;padding:14px;display:flex;flex-direction:column;gap:10px}.ks-row{display:flex;align-items:center;gap:12px;flex-wrap:wrap}.ks-spacer{flex:1}.ks-field{display:flex;flex-direction:column;gap:5px}.ks-field-label{color:var(--p-text-muted-color);font-size:.78rem}.ks-select{width:100%}.ks-code{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:1.35rem;letter-spacing:3px;font-weight:700;background:var(--p-highlight-background);border-radius:8px;padding:6px 12px;user-select:all}.ks-hint{margin:0;color:var(--p-text-muted-color);font-size:.82rem}.ks-hint code{font-family:ui-monospace,monospace;background:var(--p-highlight-background);padding:1px 5px;border-radius:4px}.ks-list{display:flex;flex-direction:column}.ks-item{display:flex;align-items:center;gap:12px;padding:10px 0;border-top:1px solid var(--p-content-border-color)}.ks-item:first-child{border-top:none}.ks-item-main{display:flex;flex:1;flex-direction:column;gap:2px;min-width:0;overflow:hidden}.ks-item-name{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-weight:600;font-size:.9rem}.ks-item-sub{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--p-text-muted-color);font-size:.8rem}.ks-item-action{flex:none}.ks-provider{text-transform:capitalize;font-size:.72rem;border:1px solid var(--p-content-border-color);border-radius:999px;padding:2px 9px;color:var(--p-text-muted-color)}.ks-empty{color:var(--p-text-muted-color);font-size:.85rem;margin:0}.ks-error{color:var(--p-danger-color);font-size:.85rem;margin:0}', Xr = { props: { type: "object", properties: {} } }, Jr = {
  wippy: Xr
};
class q extends or {
  static get wippyConfig() {
    return {
      propsSchema: Jr.wippy.props,
      hostCssKeys: ["themeConfigUrl", "primeVueCssUrl"],
      inlineCss: Kr
    };
  }
  static get vueConfig() {
    return { rootComponent: qr, plugins: [Pr] };
  }
}
async function le() {
  return q;
}
vr(import.meta.url, q);
export {
  le as webComponent
};
//# sourceMappingURL=index.js.map

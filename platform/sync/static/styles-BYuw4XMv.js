import { hasInjectionContext as xr, inject as lt, effectScope as kr, ref as O, markRaw as _r, createApp as Sr, readonly as Cr, getCurrentInstance as dt, onMounted as Bt, nextTick as Oe, watch as H, reactive as Or, renderSlot as Ee, openBlock as E, createBlock as Ft, Teleport as Wt, createCommentVNode as z, h as Er, defineComponent as fe, onBeforeUnmount as Ut, createElementBlock as L, createElementVNode as _, createVNode as R, unref as y, Fragment as de, normalizeClass as qt, toDisplayString as J, resolveDynamicComponent as Tr, normalizeStyle as Pr, useId as $r, computed as $, withCtx as Lr, withDirectives as tt, vModelText as Kt, renderList as ht, createTextVNode as Ar, vModelCheckbox as Nr } from "vue";
import { addCollection as Rr, Icon as ie } from "@iconify/vue";
import { config as mt, addIcons as jr, on as Mr, applyThemeMode as Me, host as Ir, hostCss as Vr, loadCss as zr, loadByTagName as Dr, api as ft } from "@wippy-fe/proxy";
var rt = "data-wippy-visible";
function vt(e) {
  const t = e.getAttribute(rt);
  return t === "true" ? !0 : t === "false" ? !1 : null;
}
var Hr = Object.defineProperty, Br = (e, t, r) => t in e ? Hr(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : e[t] = r, A = (e, t, r) => Br(e, typeof t != "symbol" ? t + "" : t, r), Fr = [
  "themeConfigUrl",
  "primeVueCssUrl",
  "markdownCssUrl",
  "iframeCssUrl"
], Wr = [
  ":where([data-wippy-theme-root]).w-theme-light",
  ":where([data-wippy-theme-root]).w-theme-dark"
].join(`,
`);
function gt(e) {
  const t = e.startsWith("--") ? e : `--${e}`;
  return /^--[-\w\u0080-\uFFFF]+$/.test(t) ? t : null;
}
function Ur(...e) {
  const t = /* @__PURE__ */ new Set();
  for (const r of e)
    if (r)
      for (const [n, o] of Object.entries(r)) {
        if ((n === "@light" || n === "@dark") && o && typeof o == "object") {
          for (const [a, l] of Object.entries(o)) {
            const s = typeof l == "string" ? gt(a) : null;
            s && t.add(s);
          }
          continue;
        }
        const i = typeof o == "string" ? gt(n) : null;
        i && t.add(i);
      }
  return [...t].sort();
}
function qr(e) {
  if (e.length === 0)
    return "";
  const t = e.map((r) => `  ${r}: inherit;`).join(`
`);
  return `${Wr} {
${t}
}`;
}
function Kr(e, t) {
  const r = qr(t);
  r && Yt(e, r, "@wippy-fe/css-variables-bridge");
}
function Yr(e, t) {
  const n = (t ?? Fr).map(async (o) => {
    const i = Vr[o];
    if (!i)
      return console.warn(`[wippy-fe/webcomponent-core] hostCss key "${o}" is undefined — skipping. Remove it from hostCssKeys if the CSS was removed.`), null;
    try {
      return await zr(i);
    } catch (a) {
      return console.warn(`[wippy-fe/webcomponent-core] Failed to load hostCss "${o}" (${i}):`, a), null;
    }
  });
  return Promise.all(n).then((o) => {
    for (const i of o) {
      if (!i)
        continue;
      const a = document.createElement("style");
      a.textContent = i, a.setAttribute("role", "@wippy-fe/host-css"), e.appendChild(a);
    }
  });
}
function Gr(e, t) {
  const r = document.createElement("style");
  r.textContent = t, e.appendChild(r);
}
function Yt(e, t, r) {
  if (typeof CSSStyleSheet < "u" && "replaceSync" in CSSStyleSheet.prototype) {
    const o = new CSSStyleSheet();
    o.replaceSync(t), e.adoptedStyleSheets = [...e.adoptedStyleSheets, o];
    return;
  }
  const n = document.createElement("style");
  n.setAttribute("role", r), n.textContent = t, e.appendChild(n);
}
function Jr(e, t) {
  Yt(e, t, "@wippy-fe/custom-css");
}
function Gt(e) {
  return e.__wippyHost ?? null;
}
function Qr(e) {
  return e.replace(/-([a-z])/g, (t, r) => r.toUpperCase());
}
function Zr(e, t, r) {
  switch (r.type) {
    case "string":
      return { value: t };
    case "number": {
      const n = Number.parseFloat(t);
      return Number.isNaN(n) ? { value: void 0, error: `Invalid ${e}: expected a number` } : { value: n };
    }
    case "integer": {
      const n = Number.parseInt(t, 10);
      return Number.isNaN(n) ? { value: void 0, error: `Invalid ${e}: expected an integer` } : { value: n };
    }
    case "boolean":
      return { value: t !== "false" };
    case "array":
    case "object":
      try {
        const n = JSON.parse(t);
        return r.type === "array" && !Array.isArray(n) ? { value: void 0, error: `Invalid ${e}: expected a JSON array` } : { value: n };
      } catch {
        return { value: void 0, error: `Invalid ${e}: must be valid JSON` };
      }
    default:
      return { value: t };
  }
}
function Ze(e, t) {
  const r = {}, n = [];
  for (const [o, i] of Object.entries(t.properties)) {
    const a = e.getAttribute(o), l = Qr(o);
    if (a === null) {
      i.default !== void 0 && (r[l] = i.default);
      continue;
    }
    const s = Zr(o, a, i);
    s.error ? n.push(s.error) : r[l] = s.value;
  }
  return { props: r, errors: n };
}
var Xr = class {
  constructor(e, t) {
    A(this, "_props"), A(this, "_errors"), A(this, "_content"), A(this, "_hostVisibility"), A(this, "_propsListeners", /* @__PURE__ */ new Set()), A(this, "_contentListeners", /* @__PURE__ */ new Set()), A(this, "_hostVisibilityListeners", /* @__PURE__ */ new Set()), A(this, "_disposed", !1), A(this, "_emitToDom"), A(this, "props"), A(this, "events"), A(this, "content"), A(this, "hostVisibility"), this._props = e.props, this._errors = e.errors, this._content = e.content, this._hostVisibility = e.hostVisibility, this._emitToDom = t;
    const r = this;
    this.props = {
      get value() {
        return r._props;
      },
      get errors() {
        return r._errors;
      },
      subscribe(n, o) {
        return r._subscribeProps(n, o);
      }
    }, this.events = {
      emit(n, o) {
        r._disposed || r._emitToDom(n, o);
      }
    }, this.content = e.hasContent ? {
      get value() {
        return r._content;
      },
      subscribe(n, o) {
        return r._subscribeContent(n, o);
      }
    } : null, this.hostVisibility = {
      get value() {
        return r._hostVisibility;
      },
      subscribe(n, o) {
        return r._subscribeHostVisibility(n, o);
      }
    };
  }
  /** @internal */
  notifyProps(e, t) {
    if (!this._disposed) {
      this._props = e, this._errors = t;
      for (const r of this._propsListeners)
        r(e, t);
    }
  }
  /** @internal */
  notifyContent(e) {
    if (!this._disposed) {
      this._content = e;
      for (const t of this._contentListeners)
        t(e);
    }
  }
  /** @internal */
  notifyHostVisibility(e, t) {
    if (!(this._disposed || e === t)) {
      this._hostVisibility = e;
      for (const r of this._hostVisibilityListeners)
        r(e, t);
    }
  }
  /** @internal */
  dispose() {
    this._disposed || (this._disposed = !0, this._propsListeners.clear(), this._contentListeners.clear(), this._hostVisibilityListeners.clear());
  }
  _subscribeProps(e, t) {
    if (this._disposed || t?.signal?.aborted)
      return () => {
      };
    this._propsListeners.add(e), t?.immediate && e(this._props, this._errors);
    const r = () => {
      this._propsListeners.delete(e), t?.signal?.removeEventListener("abort", r);
    };
    return t?.signal?.addEventListener("abort", r, { once: !0 }), r;
  }
  _subscribeContent(e, t) {
    if (this._disposed || t?.signal?.aborted)
      return () => {
      };
    this._contentListeners.add(e), t?.immediate && e(this._content);
    const r = () => {
      this._contentListeners.delete(e), t?.signal?.removeEventListener("abort", r);
    };
    return t?.signal?.addEventListener("abort", r, { once: !0 }), r;
  }
  _subscribeHostVisibility(e, t) {
    if (this._disposed || t?.signal?.aborted)
      return () => {
      };
    this._hostVisibilityListeners.add(e), t?.immediate && e(this._hostVisibility, this._hostVisibility);
    const r = () => {
      this._hostVisibilityListeners.delete(e), t?.signal?.removeEventListener("abort", r);
    };
    return t?.signal?.addEventListener("abort", r, { once: !0 }), r;
  }
}, en = class extends HTMLElement {
  constructor() {
    super(), A(this, "_internals"), A(this, "_contentObserver", null), A(this, "_initialized", !1), A(this, "_container", null), A(this, "_reactive", null), A(this, "_lastProps", null), A(this, "_lastErrors", []), A(this, "_lastContent", null), A(this, "_themeUnsub", null), A(this, "_hostVisible", null), this._internals = this.attachInternals(), this._hostVisible = vt(this);
  }
  /**
   * Override to provide the component's configuration.
   * Must be static because `observedAttributes` reads it before construction.
   *
   * Specify the generic to get typed `validateProps`:
   * ```ts
   * static get wippyConfig(): WippyElementConfig<MyProps> { ... }
   * ```
   */
  static get wippyConfig() {
    return { propsSchema: { properties: {} } };
  }
  /**
   * Derived from the props schema + any `extraObservedAttributes`.
   */
  static get observedAttributes() {
    const e = this.wippyConfig, t = Object.keys(e.propsSchema.properties), r = e.extraObservedAttributes ?? [];
    return [.../* @__PURE__ */ new Set([...t, ...r, rt])];
  }
  /**
   * Host-owned logical activity. `null` means no host manages this element.
   * It is not CSS visibility or viewport intersection.
   */
  get hostVisible() {
    return this._hostVisible;
  }
  /**
   * Panel-scoped `host` wrapper attached by the managed-layout shell's
   * content resolvers (`ComponentResolver` / `WebComponentPackageLoader`).
   *
   * Inside a managed-layout panel, this is a wrapper around the universal
   * `host` API where context-aware calls (`layout.broadcast / send / on`)
   * are routed through the panel-bound bus — so `sourcePanelId` is
   * attributed correctly without postMessage indirection. Layout
   * mutations and other host methods pass through unchanged.
   *
   * `null` outside a managed-layout context (compat shell, chat sidebar,
   * standalone playground). Subclass code that needs a host in those
   * cases can fall back to `import { host } from '@wippy-fe/proxy'`.
   */
  get host() {
    return Gt(this);
  }
  /**
   * Emit a CustomEvent that bubbles and crosses shadow DOM boundaries.
   */
  emitEvent(e, t) {
    this.dispatchEvent(new CustomEvent(e, {
      bubbles: !0,
      composed: !0,
      detail: t
    }));
  }
  /**
   * Opt-in reactive adapter — framework-agnostic. Subscribe to prop
   * changes, content changes, or emit typed events from a non-Vue
   * consumer without re-rolling reactivity.
   *
   * ```ts
   * class MyEl extends WippyElement<{ count: number }, { tick: { n: number } }> {
   *   protected onMount() {
   *     const ctrl = new AbortController()
   *     this.reactive.props.subscribe(({ count }) => {
   *       this.shadowRoot!.querySelector('.n')!.textContent = String(count)
   *     }, { signal: ctrl.signal, immediate: true })
   *   }
   *   tick(n: number) { this.reactive.events.emit('tick', { n }) }
   * }
   * ```
   *
   * Allocation cost is zero unless this getter is touched. Disposed on
   * `disconnectedCallback`; a fresh adapter is allocated on the next
   * access after reconnect.
   */
  get reactive() {
    if (!this._reactive) {
      const e = this.constructor.wippyConfig, t = !!e.contentTemplate;
      let r, n;
      if (this._lastProps !== null)
        r = this._lastProps, n = this._lastErrors;
      else {
        const i = Ze(this, e.propsSchema);
        e.validateProps && i.errors.push(...e.validateProps(i.props)), r = i.props, n = i.errors, this._lastProps = r, this._lastErrors = n;
      }
      const o = t ? this._lastContent ?? this._extractContent(e.contentTemplate) : null;
      t && this._lastContent === null && (this._lastContent = o), this._reactive = new Xr(
        { props: r, errors: n, content: o, hasContent: t, hostVisibility: this._hostVisible },
        this.emitEvent.bind(this)
      );
    }
    return this._reactive;
  }
  // ── Lifecycle ──────────────────────────────────────────────
  connectedCallback() {
    this._internals.states.add("loading");
    try {
      const e = this.constructor.wippyConfig, t = this._initialized, r = this.shadowRoot ?? this.attachShadow({ mode: e.shadowMode ?? "open" });
      let n;
      if (t)
        n = this._container;
      else {
        this.onInit(r), e.inlineCss && Gr(r, e.inlineCss);
        try {
          const c = mt?.theming, p = Ur(
            c?.global?.cssVariables,
            c?.children?.cssVariables
          );
          Kr(r, p);
        } catch {
        }
        if (e.customCss !== !1)
          try {
            const c = mt?.theming, p = [c?.global?.customCSS, c?.children?.customCSS].filter(Boolean).join(`
`);
            p && Jr(r, p);
          } catch {
          }
        (e.hostCssKeys === void 0 || e.hostCssKeys.length > 0) && Yr(r, e.hostCssKeys), n = document.createElement("div"), n.setAttribute("data-wippy-theme-root", "");
        const s = e.containerClasses ?? [];
        s.length > 0 && n.classList.add(...s), r.appendChild(n), this._container = n, jr(Rr);
      }
      this._applyTheme(), this._themeUnsub || (this._themeUnsub = Mr("@theme", (s) => this._applyTheme(s)));
      const { props: o, errors: i } = Ze(this, e.propsSchema);
      e.validateProps && i.push(...e.validateProps(o));
      const a = o;
      this._lastProps = a, this._lastErrors = i;
      let l = null;
      e.contentTemplate && (l = this._extractContent(e.contentTemplate), this._lastContent = l, this._contentObserver = new MutationObserver(() => {
        const s = this._extractContent(e.contentTemplate);
        this._lastContent = s, this._reactive?.notifyContent(s), this.onContentChanged(s);
      }), this._contentObserver.observe(this, {
        childList: !0,
        characterData: !0,
        subtree: !0
      })), this.onMount(r, n, a, i, l, t), this._internals.states.delete("loading"), this._internals.states.add("ready"), t || (this._initialized = !0), this.onReady(), this.emitEvent("load");
    } catch (e) {
      this.onError(e), this._internals.states.delete("loading"), this._internals.states.add("error"), this.emitEvent("error", {
        message: e instanceof Error ? e.message : String(e),
        error: e
      });
    }
  }
  /**
   * Applies a forced theme mode to this host element AND the shadow container.
   * The container class drives in-shadow selectors (Tailwind `dark:` utilities,
   * `.w-theme-dark &`); the host-element class drives `:host(.w-theme-*)`
   * selectors. On `@theme` broadcasts the resolved `mode` is passed in directly
   * (don't re-read `getThemeMode()` — the proxy's config-vs-emit order isn't a
   * contract); on the initial connect it defaults to the host's current mode.
   * No-op for an older proxy without `getThemeMode` — `applyThemeMode` clamps
   * `undefined` to 'auto'.
   */
  _applyTheme(e = Ir.getThemeMode?.()) {
    Me(e, this), this._container && Me(e, this._container);
  }
  disconnectedCallback() {
    this._themeUnsub && (this._themeUnsub(), this._themeUnsub = null), Me("auto", this), this._container && Me("auto", this._container), this._contentObserver && (this._contentObserver.disconnect(), this._contentObserver = null), this.onUnmount(), this.emitEvent("unload"), this._internals.states.clear(), this._reactive?.dispose(), this._reactive = null, this._lastProps = null, this._lastErrors = [], this._lastContent = null, delete this.__wippyHost, delete this.__wippyHostBus;
  }
  attributeChangedCallback(e, t, r) {
    if (t === r)
      return;
    if (e === rt) {
      const l = this._hostVisible, s = vt(this);
      if (s === l)
        return;
      this._hostVisible = s, this.isConnected && this._initialized && (this._reactive?.notifyHostVisibility(s, l), this.onHostVisibilityChanged(s, l));
      return;
    }
    const n = this.constructor.wippyConfig, { props: o, errors: i } = Ze(this, n.propsSchema);
    n.validateProps && i.push(...n.validateProps(o));
    const a = o;
    this._lastProps = a, this._lastErrors = i, this._reactive?.notifyProps(a, i), this.onPropsChanged(a, i);
  }
  // ── Hooks ──────────────────────────────────────────────────
  /** Called right after shadow DOM is attached, before CSS or container. */
  onInit(e) {
  }
  /** Called after internals state is set to ready, before the `load` event. */
  onReady() {
  }
  /** Called when connectedCallback throws. Default logs to console. */
  onError(e) {
    console.error(`${this.constructor.name} initialization failed:`, e);
  }
  /** Called when observed attributes change. Override to update framework state. */
  onPropsChanged(e, t) {
  }
  /**
   * Called when the host changes logical activity. `null` means unmanaged.
   * This does not imply a DOM remount or a CSS/viewport visibility change.
   */
  onHostVisibilityChanged(e, t) {
  }
  /**
   * Extract text from a child `<template data-type="...">` element.
   * Uses `.content.textContent` since `<template>` stores content in a DocumentFragment.
   */
  _extractContent(e) {
    return this.querySelector(`template[data-type="${e}"]`)?.content.textContent?.trim() ?? null;
  }
  /** Called when child `<template>` content changes. Override to update framework state. */
  onContentChanged(e) {
  }
};
function tn(e) {
  return e.__wippyHostBus ?? null;
}
function rn(e) {
  return e.dataset.wippyPanelId ?? null;
}
/*!
 * pinia v4.0.3
 * (c) 2026 Eduardo San Martin Morote
 * @license MIT
 */
let Jt;
const Qt = (e) => Jt = e, nn = () => xr() && lt(Zt) || Jt, Zt = (
  /* istanbul ignore next */
  Symbol()
);
function on() {
  const e = kr(!0), t = e.run(() => O({}));
  let r = [], n = [];
  const o = _r({
    install(i) {
      Qt(o), o._a = i, i.provide(Zt, o), i.config.globalProperties.$pinia = o, n.forEach((a) => r.push(a)), n = [];
    },
    use(i) {
      return this._a ? r.push(i) : n.push(i), this;
    },
    _p: r,
    _a: null,
    _e: e,
    _s: /* @__PURE__ */ new Map(),
    state: t
  });
  return o;
}
var an = Object.defineProperty, sn = (e, t, r) => t in e ? an(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : e[t] = r, ye = (e, t, r) => sn(e, typeof t != "symbol" ? t + "" : t, r), Xt = /* @__PURE__ */ Symbol("wippy:emit"), er = /* @__PURE__ */ Symbol("wippy:props"), ln = /* @__PURE__ */ Symbol("wippy:props_error"), cn = /* @__PURE__ */ Symbol("wippy:content"), pn = /* @__PURE__ */ Symbol("wippy:panel-id"), un = /* @__PURE__ */ Symbol("wippy:layout-bus"), dn = /* @__PURE__ */ Symbol("wippy:host"), hn = /* @__PURE__ */ Symbol("wippy:host-visibility");
function Na() {
  const e = lt(er);
  if (!e)
    throw new Error("useProps() must be called inside a WippyVueElement");
  return e;
}
function Ra() {
  const e = lt(Xt);
  if (!e)
    throw new Error("useEvents() must be called inside a WippyVueElement");
  return e;
}
var ja = class extends en {
  constructor() {
    super(...arguments), ye(this, "_vueApp", null), ye(this, "_propsRef", O({})), ye(this, "_errorsRef", O([])), ye(this, "_contentRef", O(null)), ye(this, "_hostVisibilityRef", O(null)), ye(this, "_bridgeAbort", null);
  }
  /**
   * Override to provide Vue-specific configuration.
   */
  static get vueConfig() {
    throw new Error("WippyVueElement subclass must override static get vueConfig()");
  }
  onMount(e, t, r, n, o, i) {
    const a = this.constructor.vueConfig;
    this._propsRef.value = r, this._errorsRef.value = n, this._contentRef.value = o ?? null, this._hostVisibilityRef.value = this.hostVisible;
    for (const c of n)
      this.emitEvent("invalid", { message: c });
    const l = new AbortController();
    this._bridgeAbort = l, this.reactive.props.subscribe((c, p) => {
      this._propsRef.value = c, this._errorsRef.value = [...p];
      for (const u of p)
        this.emitEvent("invalid", { message: u });
    }, { signal: l.signal }), this.reactive.content && this.reactive.content.subscribe((c) => {
      this._contentRef.value = c;
    }, { signal: l.signal }), this.reactive.hostVisibility.subscribe((c) => {
      this._hostVisibilityRef.value = c;
    }, { signal: l.signal });
    const s = (c) => {
      if (l.signal.aborted)
        return;
      const p = nn(), u = Sr(c.rootComponent);
      this._vueApp = u;
      const d = on();
      if (c.piniaPlugins)
        for (const h of c.piniaPlugins)
          d.use(h);
      if (u.use(d), c.plugins)
        for (const h of c.plugins)
          u.use(h);
      u.provide(er, this._propsRef), u.provide(ln, this._errorsRef), u.provide(Xt, this.emitEvent.bind(this)), u.provide(cn, this._contentRef), u.provide(hn, this._hostVisibilityRef), u.provide(pn, rn(this)), u.provide(un, tn(this)), u.provide(dn, Gt(this)), c.providers && c.providers(u, this), u.mount(t), p && Qt(p);
    };
    if (a.rootComponent)
      s(a);
    else if (a.lazyConfig) {
      const c = document.createElement("wippy-loading");
      c.setAttribute("no-bg", ""), t.appendChild(c), a.lazyConfig().then((p) => {
        l.signal.aborted || (c.remove(), s(p));
      }).catch((p) => {
        if (l.signal.aborted)
          return;
        const u = p instanceof Error ? p.message : String(p), d = document.createElement("wippy-error");
        d.setAttribute("title", "Failed to load"), d.setAttribute("message", u), c.replaceWith(d), this.emitEvent("error", { message: u });
      });
    } else
      throw new Error("WippyVueElement vueConfig must provide rootComponent or lazyConfig");
  }
  onUnmount() {
    this._bridgeAbort?.abort(), this._bridgeAbort = null, this._vueApp && (this._vueApp.unmount(), this._vueApp = null);
  }
}, mn = Object.defineProperty, yt = Object.getOwnPropertySymbols, fn = Object.prototype.hasOwnProperty, vn = Object.prototype.propertyIsEnumerable, bt = (e, t, r) => t in e ? mn(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : e[t] = r, gn = (e, t) => {
  for (var r in t || (t = {})) fn.call(t, r) && bt(e, r, t[r]);
  if (yt) for (var r of yt(t)) vn.call(t, r) && bt(e, r, t[r]);
  return e;
};
function ct(e) {
  return e == null || e === "" || Array.isArray(e) && e.length === 0 || !(e instanceof Date) && typeof e == "object" && Object.keys(e).length === 0;
}
function yn(e) {
  return typeof e == "function" && "call" in e && "apply" in e;
}
function N(e) {
  return !ct(e);
}
function pe(e, t = !0) {
  return e instanceof Object && e.constructor === Object && (t || Object.keys(e).length !== 0);
}
function tr(e = {}, t = {}) {
  let r = gn({}, e);
  return Object.keys(t).forEach((n) => {
    let o = n;
    pe(t[o]) && o in e && pe(e[o]) ? r[o] = tr(e[o], t[o]) : r[o] = t[o];
  }), r;
}
function bn(...e) {
  return e.reduce((t, r, n) => n === 0 ? r : tr(t, r), {});
}
function Q(e, ...t) {
  return yn(e) ? e(...t) : e;
}
function ue(e, t = !0) {
  return typeof e == "string" && (t || e !== "");
}
function wt(e) {
  return ue(e) ? e.replace(/(-|_)/g, "").toLowerCase() : e;
}
function wn(e, t = "", r = {}) {
  let n = wt(t).split("."), o = n.shift();
  if (o) {
    if (pe(e)) {
      let i = Object.keys(e).find((a) => wt(a) === o) || "";
      return wn(Q(e[i], r), n.join("."), r);
    }
    return;
  }
  return Q(e, r);
}
function Ma(e, t = !0) {
  return Array.isArray(e) && (t || e.length !== 0);
}
function xn(e) {
  return N(e) && !isNaN(e);
}
function he(e, t) {
  if (t) {
    let r = t.test(e);
    return t.lastIndex = 0, r;
  }
  return !1;
}
function kn(...e) {
  return bn(...e);
}
function Ce(e) {
  return e && e.replace(/\/\*(?:(?!\*\/)[\s\S])*\*\/|[\r\n\t]+/g, "").replace(/ {2,}/g, " ").replace(/ ([{:}]) /g, "$1").replace(/([;,]) /g, "$1").replace(/ !/g, "!").replace(/: /g, ":").trim();
}
function Ia(e) {
  return ue(e, !1) ? e[0].toUpperCase() + e.slice(1) : e;
}
function rr(e) {
  return ue(e) ? e.replace(/(_)/g, "-").replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase() : e;
}
function nr() {
  let e = /* @__PURE__ */ new Map();
  return { on(t, r) {
    let n = e.get(t);
    return n ? n.push(r) : n = [r], e.set(t, n), this;
  }, off(t, r) {
    let n = e.get(t);
    return n && n.splice(n.indexOf(r) >>> 0, 1), this;
  }, emit(t, r) {
    let n = e.get(t);
    n && n.forEach((o) => {
      o(r);
    });
  }, clear() {
    e.clear();
  } };
}
function _n(e, t) {
  return e ? e.classList ? e.classList.contains(t) : new RegExp("(^| )" + t + "( |$)", "gi").test(e.className) : !1;
}
function Va(e, t) {
  if (e && t) {
    let r = (n) => {
      _n(e, n) || (e.classList ? e.classList.add(n) : e.className += " " + n);
    };
    [t].flat().filter(Boolean).forEach((n) => n.split(" ").forEach(r));
  }
}
function za(e, t) {
  if (e && t) {
    let r = (n) => {
      e.classList ? e.classList.remove(n) : e.className = e.className.replace(new RegExp("(^|\\b)" + n.split(" ").join("|") + "(\\b|$)", "gi"), " ");
    };
    [t].flat().filter(Boolean).forEach((n) => n.split(" ").forEach(r));
  }
}
function xt(e) {
  return e ? Math.abs(e.scrollLeft) : 0;
}
function Da(e, t) {
  return e instanceof HTMLElement ? e.offsetWidth : 0;
}
function Sn(e) {
  if (e) {
    let t = e.parentNode;
    return t && t instanceof ShadowRoot && t.host && (t = t.host), t;
  }
  return null;
}
function Cn(e) {
  return !!(e !== null && typeof e < "u" && e.nodeName && Sn(e));
}
function Ue(e) {
  return typeof Element < "u" ? e instanceof Element : e !== null && typeof e == "object" && e.nodeType === 1 && typeof e.nodeName == "string";
}
function He(e, t = {}) {
  if (Ue(e)) {
    let r = (n, o) => {
      var i, a;
      let l = (i = e?.$attrs) != null && i[n] ? [(a = e?.$attrs) == null ? void 0 : a[n]] : [];
      return [o].flat().reduce((s, c) => {
        if (c != null) {
          let p = typeof c;
          if (p === "string" || p === "number") s.push(c);
          else if (p === "object") {
            let u = Array.isArray(c) ? r(n, c) : Object.entries(c).map(([d, h]) => n === "style" && (h || h === 0) ? `${d.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase()}:${h}` : h ? d : void 0);
            s = u.length ? s.concat(u.filter((d) => !!d)) : s;
          }
        }
        return s;
      }, l);
    };
    Object.entries(t).forEach(([n, o]) => {
      if (o != null) {
        let i = n.match(/^on(.+)/);
        i ? e.addEventListener(i[1].toLowerCase(), o) : n === "p-bind" || n === "pBind" ? He(e, o) : (o = n === "class" ? [...new Set(r("class", o))].join(" ").trim() : n === "style" ? r("style", o).join(";").trim() : o, (e.$attrs = e.$attrs || {}) && (e.$attrs[n] = o), e.setAttribute(n, o));
      }
    });
  }
}
function Ha(e, t = {}, ...r) {
  {
    let n = document.createElement(e);
    return He(n, t), n.append(...r), n;
  }
}
function Ba(e, t) {
  return Ue(e) ? e.matches(t) ? e : e.querySelector(t) : null;
}
function Fa(e, t) {
  if (Ue(e)) {
    let r = e.getAttribute(t);
    return isNaN(r) ? r === "true" || r === "false" ? r === "true" : r : +r;
  }
}
function Wa(e) {
  if (e) {
    let t = e.offsetHeight, r = getComputedStyle(e);
    return t -= parseFloat(r.paddingTop) + parseFloat(r.paddingBottom) + parseFloat(r.borderTopWidth) + parseFloat(r.borderBottomWidth), t;
  }
  return 0;
}
function Ua(e) {
  if (e) {
    let t = e.getBoundingClientRect();
    return { top: t.top + (window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0), left: t.left + (window.pageXOffset || xt(document.documentElement) || xt(document.body) || 0) };
  }
  return { top: "auto", left: "auto" };
}
function qa(e, t) {
  return e ? e.offsetHeight : 0;
}
function Ka(e) {
  if (e) {
    let t = e.offsetWidth, r = getComputedStyle(e);
    return t -= parseFloat(r.paddingLeft) + parseFloat(r.paddingRight) + parseFloat(r.borderLeftWidth) + parseFloat(r.borderRightWidth), t;
  }
  return 0;
}
function or() {
  return !!(typeof window < "u" && window.document && window.document.createElement);
}
function On(e, t = "", r) {
  Ue(e) && r !== null && r !== void 0 && e.setAttribute(t, r);
}
var En = Object.defineProperty, Tn = Object.defineProperties, Pn = Object.getOwnPropertyDescriptors, Be = Object.getOwnPropertySymbols, ar = Object.prototype.hasOwnProperty, ir = Object.prototype.propertyIsEnumerable, kt = (e, t, r) => t in e ? En(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : e[t] = r, q = (e, t) => {
  for (var r in t || (t = {})) ar.call(t, r) && kt(e, r, t[r]);
  if (Be) for (var r of Be(t)) ir.call(t, r) && kt(e, r, t[r]);
  return e;
}, Xe = (e, t) => Tn(e, Pn(t)), oe = (e, t) => {
  var r = {};
  for (var n in e) ar.call(e, n) && t.indexOf(n) < 0 && (r[n] = e[n]);
  if (e != null && Be) for (var n of Be(e)) t.indexOf(n) < 0 && ir.call(e, n) && (r[n] = e[n]);
  return r;
}, $n = nr(), ae = $n, Te = /{([^}]*)}/g, sr = /(\d+\s+[\+\-\*\/]\s+\d+)/g, lr = /var\([^)]+\)/g;
function _t(e) {
  return ue(e) ? e.replace(/[A-Z]/g, (t, r) => r === 0 ? t : "." + t.toLowerCase()).toLowerCase() : e;
}
function Ln(e) {
  return pe(e) && e.hasOwnProperty("$value") && e.hasOwnProperty("$type") ? e.$value : e;
}
function An(e) {
  return e.replaceAll(/ /g, "").replace(/[^\w]/g, "-");
}
function nt(e = "", t = "") {
  return An(`${ue(e, !1) && ue(t, !1) ? `${e}-` : e}${t}`);
}
function cr(e = "", t = "") {
  return `--${nt(e, t)}`;
}
function Nn(e = "") {
  let t = (e.match(/{/g) || []).length, r = (e.match(/}/g) || []).length;
  return (t + r) % 2 !== 0;
}
function pr(e, t = "", r = "", n = [], o) {
  if (ue(e)) {
    let i = e.trim();
    if (Nn(i)) return;
    if (he(i, Te)) {
      let a = i.replaceAll(Te, (l) => {
        let s = l.replace(/{|}/g, "").split(".").filter((c) => !n.some((p) => he(c, p)));
        return `var(${cr(r, rr(s.join("-")))}${N(o) ? `, ${o}` : ""})`;
      });
      return he(a.replace(lr, "0"), sr) ? `calc(${a})` : a;
    }
    return i;
  } else if (xn(e)) return e;
}
function Rn(e, t, r) {
  ue(t, !1) && e.push(`${t}:${r};`);
}
function we(e, t) {
  return e ? `${e}{${t}}` : "";
}
function ur(e, t) {
  if (e.indexOf("dt(") === -1) return e;
  function r(a, l) {
    let s = [], c = 0, p = "", u = null, d = 0;
    for (; c <= a.length; ) {
      let h = a[c];
      if ((h === '"' || h === "'" || h === "`") && a[c - 1] !== "\\" && (u = u === h ? null : h), !u && (h === "(" && d++, h === ")" && d--, (h === "," || c === a.length) && d === 0)) {
        let b = p.trim();
        b.startsWith("dt(") ? s.push(ur(b, l)) : s.push(n(b)), p = "", c++;
        continue;
      }
      h !== void 0 && (p += h), c++;
    }
    return s;
  }
  function n(a) {
    let l = a[0];
    if ((l === '"' || l === "'" || l === "`") && a[a.length - 1] === l) return a.slice(1, -1);
    let s = Number(a);
    return isNaN(s) ? a : s;
  }
  let o = [], i = [];
  for (let a = 0; a < e.length; a++) if (e[a] === "d" && e.slice(a, a + 3) === "dt(") i.push(a), a += 2;
  else if (e[a] === ")" && i.length > 0) {
    let l = i.pop();
    i.length === 0 && o.push([l, a]);
  }
  if (!o.length) return e;
  for (let a = o.length - 1; a >= 0; a--) {
    let [l, s] = o[a], c = e.slice(l + 3, s), p = r(c, t), u = t(...p);
    e = e.slice(0, l) + u + e.slice(s + 1);
  }
  return e;
}
var me = (...e) => jn(I.getTheme(), ...e), jn = (e = {}, t, r, n) => {
  if (t) {
    let { variable: o, options: i } = I.defaults || {}, { prefix: a, transform: l } = e?.options || i || {}, s = he(t, Te) ? t : `{${t}}`;
    return n === "value" || ct(n) && l === "strict" ? I.getTokenValue(t) : pr(s, void 0, a, [o.excludedKeyRegex], r);
  }
  return "";
};
function Ie(e, ...t) {
  if (e instanceof Array) {
    let r = e.reduce((n, o, i) => {
      var a;
      return n + o + ((a = Q(t[i], { dt: me })) != null ? a : "");
    }, "");
    return ur(r, me);
  }
  return Q(e, { dt: me });
}
function Mn(e, t = {}) {
  let r = I.defaults.variable, { prefix: n = r.prefix, selector: o = r.selector, excludedKeyRegex: i = r.excludedKeyRegex } = t, a = [], l = [], s = [{ node: e, path: n }];
  for (; s.length; ) {
    let { node: p, path: u } = s.pop();
    for (let d in p) {
      let h = p[d], b = Ln(h), x = he(d, i) ? nt(u) : nt(u, rr(d));
      if (pe(b)) s.push({ node: b, path: x });
      else {
        let m = cr(x), w = pr(b, x, n, [i]);
        Rn(l, m, w);
        let g = x;
        n && g.startsWith(n + "-") && (g = g.slice(n.length + 1)), a.push(g.replace(/-/g, "."));
      }
    }
  }
  let c = l.join("");
  return { value: l, tokens: a, declarations: c, css: we(o, c) };
}
var U = { regex: { rules: { class: { pattern: /^\.([a-zA-Z][\w-]*)$/, resolve(e) {
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
  let t = Object.keys(this.rules).filter((r) => r !== "custom").map((r) => this.rules[r]);
  return [e].flat().map((r) => {
    var n;
    return (n = t.map((o) => o.resolve(r)).find((o) => o.matched)) != null ? n : this.rules.custom.resolve(r);
  });
} }, _toVariables(e, t) {
  return Mn(e, { prefix: t?.prefix });
}, getCommon({ name: e = "", theme: t = {}, params: r, set: n, defaults: o }) {
  var i, a, l, s, c, p, u;
  let { preset: d, options: h } = t, b, x, m, w, g, k, f;
  if (N(d) && h.transform !== "strict") {
    let { primitive: C, semantic: S, extend: T } = d, V = S || {}, { colorScheme: j } = V, Z = oe(V, ["colorScheme"]), K = T || {}, { colorScheme: B } = K, X = oe(K, ["colorScheme"]), Y = j || {}, { dark: ee } = Y, te = oe(Y, ["dark"]), G = B || {}, { dark: se } = G, re = oe(G, ["dark"]), F = N(C) ? this._toVariables({ primitive: C }, h) : {}, D = N(Z) ? this._toVariables({ semantic: Z }, h) : {}, ne = N(te) ? this._toVariables({ light: te }, h) : {}, ve = N(ee) ? this._toVariables({ dark: ee }, h) : {}, le = N(X) ? this._toVariables({ semantic: X }, h) : {}, Ae = N(re) ? this._toVariables({ light: re }, h) : {}, Ne = N(se) ? this._toVariables({ dark: se }, h) : {}, [qe, Ke] = [(i = F.declarations) != null ? i : "", F.tokens], [Ye, v] = [(a = D.declarations) != null ? a : "", D.tokens || []], [P, ge] = [(l = ne.declarations) != null ? l : "", ne.tokens || []], [Re, Ge] = [(s = ve.declarations) != null ? s : "", ve.tokens || []], [ke, je] = [(c = le.declarations) != null ? c : "", le.tokens || []], [Je, W] = [(p = Ae.declarations) != null ? p : "", Ae.tokens || []], [Qe, ce] = [(u = Ne.declarations) != null ? u : "", Ne.tokens || []];
    b = this.transformCSS(e, qe, "light", "variable", h, n, o), x = Ke;
    let _e = this.transformCSS(e, `${Ye}${P}`, "light", "variable", h, n, o), yr = this.transformCSS(e, `${Re}`, "dark", "variable", h, n, o);
    m = `${_e}${yr}`, w = [.../* @__PURE__ */ new Set([...v, ...ge, ...Ge])];
    let br = this.transformCSS(e, `${ke}${Je}color-scheme:light`, "light", "variable", h, n, o), wr = this.transformCSS(e, `${Qe}color-scheme:dark`, "dark", "variable", h, n, o);
    g = `${br}${wr}`, k = [.../* @__PURE__ */ new Set([...je, ...W, ...ce])], f = Q(d.css, { dt: me });
  }
  return { primitive: { css: b, tokens: x }, semantic: { css: m, tokens: w }, global: { css: g, tokens: k }, style: f };
}, getPreset({ name: e = "", preset: t = {}, options: r, params: n, set: o, defaults: i, selector: a }) {
  var l, s, c;
  let p, u, d;
  if (N(t) && r.transform !== "strict") {
    let h = e.replace("-directive", ""), b = t, { colorScheme: x, extend: m, css: w } = b, g = oe(b, ["colorScheme", "extend", "css"]), k = m || {}, { colorScheme: f } = k, C = oe(k, ["colorScheme"]), S = x || {}, { dark: T } = S, V = oe(S, ["dark"]), j = f || {}, { dark: Z } = j, K = oe(j, ["dark"]), B = N(g) ? this._toVariables({ [h]: q(q({}, g), C) }, r) : {}, X = N(V) ? this._toVariables({ [h]: q(q({}, V), K) }, r) : {}, Y = N(T) ? this._toVariables({ [h]: q(q({}, T), Z) }, r) : {}, [ee, te] = [(l = B.declarations) != null ? l : "", B.tokens || []], [G, se] = [(s = X.declarations) != null ? s : "", X.tokens || []], [re, F] = [(c = Y.declarations) != null ? c : "", Y.tokens || []], D = this.transformCSS(h, `${ee}${G}`, "light", "variable", r, o, i, a), ne = this.transformCSS(h, re, "dark", "variable", r, o, i, a);
    p = `${D}${ne}`, u = [.../* @__PURE__ */ new Set([...te, ...se, ...F])], d = Q(w, { dt: me });
  }
  return { css: p, tokens: u, style: d };
}, getPresetC({ name: e = "", theme: t = {}, params: r, set: n, defaults: o }) {
  var i;
  let { preset: a, options: l } = t, s = (i = a?.components) == null ? void 0 : i[e];
  return this.getPreset({ name: e, preset: s, options: l, params: r, set: n, defaults: o });
}, getPresetD({ name: e = "", theme: t = {}, params: r, set: n, defaults: o }) {
  var i, a;
  let l = e.replace("-directive", ""), { preset: s, options: c } = t, p = ((i = s?.components) == null ? void 0 : i[l]) || ((a = s?.directives) == null ? void 0 : a[l]);
  return this.getPreset({ name: l, preset: p, options: c, params: r, set: n, defaults: o });
}, applyDarkColorScheme(e) {
  return !(e.darkModeSelector === "none" || e.darkModeSelector === !1);
}, getColorSchemeOption(e, t) {
  var r;
  return this.applyDarkColorScheme(e) ? this.regex.resolve(e.darkModeSelector === !0 ? t.options.darkModeSelector : (r = e.darkModeSelector) != null ? r : t.options.darkModeSelector) : [];
}, getLayerOrder(e, t = {}, r, n) {
  let { cssLayer: o } = t;
  return o ? `@layer ${Q(o.order || o.name || "primeui", r)}` : "";
}, getCommonStyleSheet({ name: e = "", theme: t = {}, params: r, props: n = {}, set: o, defaults: i }) {
  let a = this.getCommon({ name: e, theme: t, params: r, set: o, defaults: i }), l = Object.entries(n).reduce((s, [c, p]) => s.push(`${c}="${p}"`) && s, []).join(" ");
  return Object.entries(a || {}).reduce((s, [c, p]) => {
    if (pe(p) && Object.hasOwn(p, "css")) {
      let u = Ce(p.css), d = `${c}-variables`;
      s.push(`<style type="text/css" data-primevue-style-id="${d}" ${l}>${u}</style>`);
    }
    return s;
  }, []).join("");
}, getStyleSheet({ name: e = "", theme: t = {}, params: r, props: n = {}, set: o, defaults: i }) {
  var a;
  let l = { name: e, theme: t, params: r, set: o, defaults: i }, s = (a = e.includes("-directive") ? this.getPresetD(l) : this.getPresetC(l)) == null ? void 0 : a.css, c = Object.entries(n).reduce((p, [u, d]) => p.push(`${u}="${d}"`) && p, []).join(" ");
  return s ? `<style type="text/css" data-primevue-style-id="${e}-variables" ${c}>${Ce(s)}</style>` : "";
}, createTokens(e = {}, t, r = "", n = "", o = {}) {
  let i = function(l, s = {}, c = []) {
    if (c.includes(this.path)) return console.warn(`Circular reference detected at ${this.path}`), { colorScheme: l, path: this.path, paths: s, value: void 0 };
    c.push(this.path), s.name = this.path, s.binding || (s.binding = {});
    let p = this.value;
    if (typeof this.value == "string" && Te.test(this.value)) {
      let u = this.value.trim().replace(Te, (d) => {
        var h;
        let b = d.slice(1, -1), x = this.tokens[b];
        if (!x) return console.warn(`Token not found for path: ${b}`), "__UNRESOLVED__";
        let m = x.computed(l, s, c);
        return Array.isArray(m) && m.length === 2 ? `light-dark(${m[0].value},${m[1].value})` : (h = m?.value) != null ? h : "__UNRESOLVED__";
      });
      p = sr.test(u.replace(lr, "0")) ? `calc(${u})` : u;
    }
    return ct(s.binding) && delete s.binding, c.pop(), { colorScheme: l, path: this.path, paths: s, value: p.includes("__UNRESOLVED__") ? void 0 : p };
  }, a = (l, s, c) => {
    Object.entries(l).forEach(([p, u]) => {
      let d = he(p, t.variable.excludedKeyRegex) ? s : s ? `${s}.${_t(p)}` : _t(p), h = c ? `${c}.${p}` : p;
      pe(u) ? a(u, d, h) : (o[d] || (o[d] = { paths: [], computed: (b, x = {}, m = []) => {
        if (o[d].paths.length === 1) return o[d].paths[0].computed(o[d].paths[0].scheme, x.binding, m);
        if (b && b !== "none") for (let w = 0; w < o[d].paths.length; w++) {
          let g = o[d].paths[w];
          if (g.scheme === b) return g.computed(b, x.binding, m);
        }
        return o[d].paths.map((w) => w.computed(w.scheme, x[w.scheme], m));
      } }), o[d].paths.push({ path: h, value: u, scheme: h.includes("colorScheme.light") ? "light" : h.includes("colorScheme.dark") ? "dark" : "none", computed: i, tokens: o }));
    });
  };
  return a(e, r, n), o;
}, getTokenValue(e, t, r) {
  var n;
  let o = ((l) => l.split(".").filter((s) => !he(s.toLowerCase(), r.variable.excludedKeyRegex)).join("."))(t), i = t.includes("colorScheme.light") ? "light" : t.includes("colorScheme.dark") ? "dark" : void 0, a = [(n = e[o]) == null ? void 0 : n.computed(i)].flat().filter((l) => l);
  return a.length === 1 ? a[0].value : a.reduce((l = {}, s) => {
    let c = s, { colorScheme: p } = c, u = oe(c, ["colorScheme"]);
    return l[p] = u, l;
  }, void 0);
}, getSelectorRule(e, t, r, n) {
  return r === "class" || r === "attr" ? we(N(t) ? `${e}${t},${e} ${t}` : e, n) : we(e, we(t ?? ":root,:host", n));
}, transformCSS(e, t, r, n, o = {}, i, a, l) {
  if (N(t)) {
    let { cssLayer: s } = o;
    if (n !== "style") {
      let c = this.getColorSchemeOption(o, a);
      t = r === "dark" ? c.reduce((p, { type: u, selector: d }) => (N(d) && (p += d.includes("[CSS]") ? d.replace("[CSS]", t) : this.getSelectorRule(d, l, u, t)), p), "") : we(l ?? ":root,:host", t);
    }
    if (s) {
      let c = { name: "primeui" };
      pe(s) && (c.name = Q(s.name, { name: e, type: n })), N(c.name) && (t = we(`@layer ${c.name}`, t), i?.layerNames(c.name));
    }
    return t;
  }
  return "";
} }, I = { defaults: { variable: { prefix: "p", selector: ":root,:host", excludedKeyRegex: /^(primitive|semantic|components|directives|variables|colorscheme|light|dark|common|root|states|extend|css)$/gi }, options: { prefix: "p", darkModeSelector: "system", cssLayer: !1 } }, _theme: void 0, _layerNames: /* @__PURE__ */ new Set(), _loadedStyleNames: /* @__PURE__ */ new Set(), _loadingStyles: /* @__PURE__ */ new Set(), _tokens: {}, update(e = {}) {
  let { theme: t } = e;
  t && (this._theme = Xe(q({}, t), { options: q(q({}, this.defaults.options), t.options) }), this._tokens = U.createTokens(this.preset, this.defaults), this.clearLoadedStyleNames());
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
  this.update({ theme: e }), ae.emit("theme:change", e);
}, getPreset() {
  return this.preset;
}, setPreset(e) {
  this._theme = Xe(q({}, this.theme), { preset: e }), this._tokens = U.createTokens(e, this.defaults), this.clearLoadedStyleNames(), ae.emit("preset:change", e), ae.emit("theme:change", this.theme);
}, getOptions() {
  return this.options;
}, setOptions(e) {
  this._theme = Xe(q({}, this.theme), { options: e }), this.clearLoadedStyleNames(), ae.emit("options:change", e), ae.emit("theme:change", this.theme);
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
  return U.getTokenValue(this.tokens, e, this.defaults);
}, getCommon(e = "", t) {
  return U.getCommon({ name: e, theme: this.theme, params: t, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } });
}, getComponent(e = "", t) {
  let r = { name: e, theme: this.theme, params: t, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } };
  return U.getPresetC(r);
}, getDirective(e = "", t) {
  let r = { name: e, theme: this.theme, params: t, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } };
  return U.getPresetD(r);
}, getCustomPreset(e = "", t, r, n) {
  let o = { name: e, preset: t, options: this.options, selector: r, params: n, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } };
  return U.getPreset(o);
}, getLayerOrderCSS(e = "") {
  return U.getLayerOrder(e, this.options, { names: this.getLayerNames() }, this.defaults);
}, transformCSS(e = "", t, r = "style", n) {
  return U.transformCSS(e, t, n, r, this.options, { layerNames: this.setLayerNames.bind(this) }, this.defaults);
}, getCommonStyleSheet(e = "", t, r = {}) {
  return U.getCommonStyleSheet({ name: e, theme: this.theme, params: t, props: r, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } });
}, getStyleSheet(e, t, r = {}) {
  return U.getStyleSheet({ name: e, theme: this.theme, params: t, props: r, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } });
}, onStyleMounted(e) {
  this._loadingStyles.add(e);
}, onStyleUpdated(e) {
  this._loadingStyles.add(e);
}, onStyleLoaded(e, { name: t }) {
  this._loadingStyles.size && (this._loadingStyles.delete(t), ae.emit(`theme:${t}:load`, e), !this._loadingStyles.size && ae.emit("theme:load"));
} }, M = {
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
}, In = `
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
function Pe(e) {
  "@babel/helpers - typeof";
  return Pe = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, Pe(e);
}
function St(e, t) {
  var r = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var n = Object.getOwnPropertySymbols(e);
    t && (n = n.filter(function(o) {
      return Object.getOwnPropertyDescriptor(e, o).enumerable;
    })), r.push.apply(r, n);
  }
  return r;
}
function Ct(e) {
  for (var t = 1; t < arguments.length; t++) {
    var r = arguments[t] != null ? arguments[t] : {};
    t % 2 ? St(Object(r), !0).forEach(function(n) {
      Vn(e, n, r[n]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(r)) : St(Object(r)).forEach(function(n) {
      Object.defineProperty(e, n, Object.getOwnPropertyDescriptor(r, n));
    });
  }
  return e;
}
function Vn(e, t, r) {
  return (t = zn(t)) in e ? Object.defineProperty(e, t, { value: r, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = r, e;
}
function zn(e) {
  var t = Dn(e, "string");
  return Pe(t) == "symbol" ? t : t + "";
}
function Dn(e, t) {
  if (Pe(e) != "object" || !e) return e;
  var r = e[Symbol.toPrimitive];
  if (r !== void 0) {
    var n = r.call(e, t);
    if (Pe(n) != "object") return n;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
function Hn(e) {
  var t = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0;
  dt() && dt().components ? Bt(e) : t ? e() : Oe(e);
}
var Bn = 0;
function Fn(e) {
  var t = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, r = O(!1), n = O(e), o = O(null), i = or() ? window.document : void 0, a = t.document, l = a === void 0 ? i : a, s = t.immediate, c = s === void 0 ? !0 : s, p = t.manual, u = p === void 0 ? !1 : p, d = t.name, h = d === void 0 ? "style_".concat(++Bn) : d, b = t.id, x = b === void 0 ? void 0 : b, m = t.media, w = m === void 0 ? void 0 : m, g = t.nonce, k = g === void 0 ? void 0 : g, f = t.first, C = f === void 0 ? !1 : f, S = t.onMounted, T = S === void 0 ? void 0 : S, V = t.onUpdated, j = V === void 0 ? void 0 : V, Z = t.onLoad, K = Z === void 0 ? void 0 : Z, B = t.props, X = B === void 0 ? {} : B, Y = function() {
  }, ee = function(se) {
    var re = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    if (l) {
      var F = Ct(Ct({}, X), re), D = F.name || h, ne = F.id || x, ve = F.nonce || k;
      o.value = l.querySelector('style[data-primevue-style-id="'.concat(D, '"]')) || l.getElementById(ne) || l.createElement("style"), o.value.isConnected || (n.value = se || e, He(o.value, {
        type: "text/css",
        id: ne,
        media: w,
        nonce: ve
      }), C ? l.head.prepend(o.value) : l.head.appendChild(o.value), On(o.value, "data-primevue-style-id", D), He(o.value, F), o.value.onload = function(le) {
        return K?.(le, {
          name: D
        });
      }, T?.(D)), !r.value && (Y = H(n, function(le) {
        o.value.textContent = le, j?.(D);
      }, {
        immediate: !0
      }), r.value = !0);
    }
  }, te = function() {
    !l || !r.value || (Y(), Cn(o.value) && l.head.removeChild(o.value), r.value = !1, o.value = null);
  };
  return c && !u && Hn(ee), {
    id: x,
    name: h,
    el: o,
    css: n,
    unload: te,
    load: ee,
    isLoaded: Cr(r)
  };
}
function $e(e) {
  "@babel/helpers - typeof";
  return $e = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, $e(e);
}
var Ot, Et, Tt, Pt;
function $t(e, t) {
  return Kn(e) || qn(e, t) || Un(e, t) || Wn();
}
function Wn() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Un(e, t) {
  if (e) {
    if (typeof e == "string") return Lt(e, t);
    var r = {}.toString.call(e).slice(8, -1);
    return r === "Object" && e.constructor && (r = e.constructor.name), r === "Map" || r === "Set" ? Array.from(e) : r === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r) ? Lt(e, t) : void 0;
  }
}
function Lt(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var r = 0, n = Array(t); r < t; r++) n[r] = e[r];
  return n;
}
function qn(e, t) {
  var r = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (r != null) {
    var n, o, i, a, l = [], s = !0, c = !1;
    try {
      if (i = (r = r.call(e)).next, t !== 0) for (; !(s = (n = i.call(r)).done) && (l.push(n.value), l.length !== t); s = !0) ;
    } catch (p) {
      c = !0, o = p;
    } finally {
      try {
        if (!s && r.return != null && (a = r.return(), Object(a) !== a)) return;
      } finally {
        if (c) throw o;
      }
    }
    return l;
  }
}
function Kn(e) {
  if (Array.isArray(e)) return e;
}
function At(e, t) {
  var r = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var n = Object.getOwnPropertySymbols(e);
    t && (n = n.filter(function(o) {
      return Object.getOwnPropertyDescriptor(e, o).enumerable;
    })), r.push.apply(r, n);
  }
  return r;
}
function et(e) {
  for (var t = 1; t < arguments.length; t++) {
    var r = arguments[t] != null ? arguments[t] : {};
    t % 2 ? At(Object(r), !0).forEach(function(n) {
      Yn(e, n, r[n]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(r)) : At(Object(r)).forEach(function(n) {
      Object.defineProperty(e, n, Object.getOwnPropertyDescriptor(r, n));
    });
  }
  return e;
}
function Yn(e, t, r) {
  return (t = Gn(t)) in e ? Object.defineProperty(e, t, { value: r, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = r, e;
}
function Gn(e) {
  var t = Jn(e, "string");
  return $e(t) == "symbol" ? t : t + "";
}
function Jn(e, t) {
  if ($e(e) != "object" || !e) return e;
  var r = e[Symbol.toPrimitive];
  if (r !== void 0) {
    var n = r.call(e, t);
    if ($e(n) != "object") return n;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
function Ve(e, t) {
  return t || (t = e.slice(0)), Object.freeze(Object.defineProperties(e, { raw: { value: Object.freeze(t) } }));
}
var Qn = function(t) {
  var r = t.dt;
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
}, Zn = {}, Xn = {}, be = {
  name: "base",
  css: Qn,
  style: In,
  classes: Zn,
  inlineStyles: Xn,
  load: function(t) {
    var r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, n = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : function(i) {
      return i;
    }, o = n(Ie(Ot || (Ot = Ve(["", ""])), t));
    return N(o) ? Fn(Ce(o), et({
      name: this.name
    }, r)) : {};
  },
  loadCSS: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    return this.load(this.css, t);
  },
  loadStyle: function() {
    var t = this, r = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "";
    return this.load(this.style, r, function() {
      var o = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "";
      return I.transformCSS(r.name || t.name, "".concat(o).concat(Ie(Et || (Et = Ve(["", ""])), n)));
    });
  },
  getCommonTheme: function(t) {
    return I.getCommon(this.name, t);
  },
  getComponentTheme: function(t) {
    return I.getComponent(this.name, t);
  },
  getDirectiveTheme: function(t) {
    return I.getDirective(this.name, t);
  },
  getPresetTheme: function(t, r, n) {
    return I.getCustomPreset(this.name, t, r, n);
  },
  getLayerOrderThemeCSS: function() {
    return I.getLayerOrderCSS(this.name);
  },
  getStyleSheet: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    if (this.css) {
      var n = Q(this.css, {
        dt: me
      }) || "", o = Ce(Ie(Tt || (Tt = Ve(["", "", ""])), n, t)), i = Object.entries(r).reduce(function(a, l) {
        var s = $t(l, 2), c = s[0], p = s[1];
        return a.push("".concat(c, '="').concat(p, '"')) && a;
      }, []).join(" ");
      return N(o) ? '<style type="text/css" data-primevue-style-id="'.concat(this.name, '" ').concat(i, ">").concat(o, "</style>") : "";
    }
    return "";
  },
  getCommonThemeStyleSheet: function(t) {
    var r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    return I.getCommonStyleSheet(this.name, t, r);
  },
  getThemeStyleSheet: function(t) {
    var r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, n = [I.getStyleSheet(this.name, t, r)];
    if (this.style) {
      var o = this.name === "base" ? "global-style" : "".concat(this.name, "-style"), i = Ie(Pt || (Pt = Ve(["", ""])), Q(this.style, {
        dt: me
      })), a = Ce(I.transformCSS(o, i)), l = Object.entries(r).reduce(function(s, c) {
        var p = $t(c, 2), u = p[0], d = p[1];
        return s.push("".concat(u, '="').concat(d, '"')) && s;
      }, []).join(" ");
      N(a) && n.push('<style type="text/css" data-primevue-style-id="'.concat(o, '" ').concat(l, ">").concat(a, "</style>"));
    }
    return n.join("");
  },
  extend: function(t) {
    return et(et({}, this), {}, {
      css: void 0,
      style: void 0
    }, t);
  }
}, ze = nr();
function Le(e) {
  "@babel/helpers - typeof";
  return Le = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, Le(e);
}
function Nt(e, t) {
  var r = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var n = Object.getOwnPropertySymbols(e);
    t && (n = n.filter(function(o) {
      return Object.getOwnPropertyDescriptor(e, o).enumerable;
    })), r.push.apply(r, n);
  }
  return r;
}
function De(e) {
  for (var t = 1; t < arguments.length; t++) {
    var r = arguments[t] != null ? arguments[t] : {};
    t % 2 ? Nt(Object(r), !0).forEach(function(n) {
      eo(e, n, r[n]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(r)) : Nt(Object(r)).forEach(function(n) {
      Object.defineProperty(e, n, Object.getOwnPropertyDescriptor(r, n));
    });
  }
  return e;
}
function eo(e, t, r) {
  return (t = to(t)) in e ? Object.defineProperty(e, t, { value: r, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = r, e;
}
function to(e) {
  var t = ro(e, "string");
  return Le(t) == "symbol" ? t : t + "";
}
function ro(e, t) {
  if (Le(e) != "object" || !e) return e;
  var r = e[Symbol.toPrimitive];
  if (r !== void 0) {
    var n = r.call(e, t);
    if (Le(n) != "object") return n;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var no = {
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
    text: [M.STARTS_WITH, M.CONTAINS, M.NOT_CONTAINS, M.ENDS_WITH, M.EQUALS, M.NOT_EQUALS],
    numeric: [M.EQUALS, M.NOT_EQUALS, M.LESS_THAN, M.LESS_THAN_OR_EQUAL_TO, M.GREATER_THAN, M.GREATER_THAN_OR_EQUAL_TO],
    date: [M.DATE_IS, M.DATE_IS_NOT, M.DATE_BEFORE, M.DATE_AFTER]
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
}, oo = Symbol();
function ao(e, t) {
  var r = {
    config: Or(t)
  };
  return e.config.globalProperties.$primevue = r, e.provide(oo, r), io(), so(e, r), r;
}
var xe = [];
function io() {
  ae.clear(), xe.forEach(function(e) {
    return e?.();
  }), xe = [];
}
function so(e, t) {
  var r = O(!1), n = function() {
    var c;
    if (((c = t.config) === null || c === void 0 ? void 0 : c.theme) !== "none" && !I.isStyleNameLoaded("common")) {
      var p, u, d = ((p = be.getCommonTheme) === null || p === void 0 ? void 0 : p.call(be)) || {}, h = d.primitive, b = d.semantic, x = d.global, m = d.style, w = {
        nonce: (u = t.config) === null || u === void 0 || (u = u.csp) === null || u === void 0 ? void 0 : u.nonce
      };
      be.load(h?.css, De({
        name: "primitive-variables"
      }, w)), be.load(b?.css, De({
        name: "semantic-variables"
      }, w)), be.load(x?.css, De({
        name: "global-variables"
      }, w)), be.loadStyle(De({
        name: "global-style"
      }, w), m), I.setLoadedStyleName("common");
    }
  };
  ae.on("theme:change", function(s) {
    r.value || (e.config.globalProperties.$primevue.config.theme = s, r.value = !0);
  });
  var o = H(t.config, function(s, c) {
    ze.emit("config:change", {
      newValue: s,
      oldValue: c
    });
  }, {
    immediate: !0,
    deep: !0
  }), i = H(function() {
    return t.config.ripple;
  }, function(s, c) {
    ze.emit("config:ripple:change", {
      newValue: s,
      oldValue: c
    });
  }, {
    immediate: !0,
    deep: !0
  }), a = H(function() {
    return t.config.theme;
  }, function(s, c) {
    r.value || I.setTheme(s), t.config.unstyled || n(), r.value = !1, ze.emit("config:theme:change", {
      newValue: s,
      oldValue: c
    });
  }, {
    immediate: !0,
    deep: !1
  }), l = H(function() {
    return t.config.unstyled;
  }, function(s, c) {
    !s && t.config.theme && n(), ze.emit("config:unstyled:change", {
      newValue: s,
      oldValue: c
    });
  }, {
    immediate: !0,
    deep: !0
  });
  xe.push(o), xe.push(i), xe.push(a), xe.push(l);
}
var lo = {
  install: function(t, r) {
    var n = kn(no, r);
    ao(t, n);
  }
}, dr = {
  data: function() {
    return {
      mounted: !1
    };
  },
  mounted: function() {
    this.mounted = or();
  },
  computed: {
    inline: function() {
      return this.disabled || this.appendTo === "self";
    }
  }
};
function co(e, t, r, n, o, i) {
  return i.inline ? Ee(e.$slots, "default", {
    key: 0
  }) : o.mounted ? (E(), Ft(Wt, {
    key: 1,
    to: r.appendTo
  }, [Ee(e.$slots, "default")], 8, ["to"])) : z("", !0);
}
dr.render = co;
const po = "data-wippy-overlay-layer";
function hr() {
  return typeof window < "u" && typeof window.document < "u";
}
function mr() {
  return hr() && typeof HTMLElement < "u" && Object.hasOwn(HTMLElement.prototype, "popover");
}
function uo() {
  return mr() && typeof CSS < "u" && typeof CSS.supports == "function" && CSS.supports("anchor-name: --a") && CSS.supports("position-area", "bottom span-right") && CSS.supports("position-try-fallbacks", "flip-block") && CSS.supports("min-width", "min(anchor-size(width), 100vw)") && CSS.supports("max-width", "stretch");
}
const ho = /\bp-(?:select|multiselect|treeselect|cascadeselect)-overlay\b/;
let mo = 0;
const Fe = /* @__PURE__ */ new WeakMap();
function Rt(e, t) {
  const r = e.style;
  r.setProperty("position", "fixed", "important"), r.setProperty("inset", "auto", "important"), r.setProperty("margin", "0", "important"), r.setProperty("position-anchor", t), r.setProperty("position-area", "bottom span-right"), r.setProperty("position-try-fallbacks", "flip-block, flip-inline, flip-block flip-inline"), r.setProperty("min-width", "min(anchor-size(width), 100vw)", "important"), r.setProperty("max-width", "stretch", "important");
}
function fo(e, t) {
  if (!ho.test(e.className))
    return;
  const r = e.style.cssText;
  Rt(e, t), e.getAttribute("popover") !== "manual" && e.setAttribute("popover", "manual");
  try {
    e.matches(":popover-open") || e.showPopover();
  } catch {
  }
  if (!e.matches(":popover-open")) {
    e.removeAttribute("popover"), e.style.cssText = r;
    return;
  }
  if (!Fe.has(e)) {
    const n = new MutationObserver(() => {
      const o = e.style;
      (o.top !== "auto" || o.left !== "auto" || o.margin !== "0px" || o.getPropertyPriority("top") !== "important" || o.getPropertyPriority("left") !== "important" || o.getPropertyPriority("margin") !== "important" || o.getPropertyPriority("min-width") !== "important" || o.maxWidth !== "stretch" || o.getPropertyPriority("max-width") !== "important") && Rt(e, t);
    });
    n.observe(e, { attributes: !0, attributeFilter: ["style"] }), Fe.set(e, n);
  }
}
function pt(e) {
  const t = Fe.get(e);
  t && (t.disconnect(), Fe.delete(e));
}
function vo(e) {
  const t = e && typeof e.getRootNode == "function" ? e.getRootNode() : null;
  return t instanceof ShadowRoot ? t : null;
}
function ot(e) {
  e.style.top = "0px", e.style.left = "0px";
  const t = e.getBoundingClientRect();
  e.style.top = `${-window.scrollY - t.top}px`, e.style.left = `${-window.scrollX - t.left}px`;
}
const We = /* @__PURE__ */ new Set(), ut = /* @__PURE__ */ new WeakMap();
let jt = !1, at = !1;
function go() {
  at = !1;
  for (const e of We) {
    if (!e.isConnected) {
      for (const t of Array.from(e.children))
        t instanceof HTMLElement && pt(t);
      We.delete(e), ut.get(e)?.disconnect();
      continue;
    }
    e.childElementCount > 0 && ot(e);
  }
}
function Mt() {
  at || (at = !0, requestAnimationFrame(go));
}
function yo(e) {
  const t = document.createElement("div");
  t.setAttribute(po, "");
  const r = mr();
  if (t.style.cssText = r ? "position:fixed;width:0 !important;height:0 !important;margin:0 !important;border:0 !important;padding:0 !important;background:transparent !important;color:inherit !important;overflow:visible !important;" : "position:fixed;top:0;left:0;width:0;height:0;", r && t.setAttribute("popover", "manual"), e.appendChild(t), r) {
    try {
      t.showPopover();
    } catch {
    }
    t.matches(":popover-open") || (t.removeAttribute("popover"), t.style.cssText = "position:fixed;top:0;left:0;width:0;height:0;");
  }
  ot(t);
  const n = new MutationObserver((o) => {
    const i = t.__wippyAnchorName;
    for (const a of o) {
      if (i)
        for (const l of Array.from(a.addedNodes))
          l instanceof HTMLElement && fo(l, i);
      for (const l of Array.from(a.removedNodes))
        l instanceof HTMLElement && pt(l);
    }
    t.isConnected && t.childElementCount > 0 && ot(t);
  });
  return n.observe(t, { childList: !0 }), ut.set(t, n), We.add(t), jt || (jt = !0, window.addEventListener("scroll", Mt, { capture: !0, passive: !0 }), window.addEventListener("resize", Mt, { passive: !0 })), t;
}
function It(e) {
  if (!(!e.hostRoot || e.layer) && (e.layer = yo(e.hostRoot), uo())) {
    const t = e.$el ? e.$el.parentElement : null;
    t && (e.anchorName = `--wippy-a-${++mo}`, e.anchorTrigger = t, t.style.setProperty("anchor-name", e.anchorName), e.layer.__wippyAnchorName = e.anchorName);
  }
}
function Vt(e) {
  if (e.anchorTrigger && (e.anchorTrigger.style.removeProperty("anchor-name"), e.anchorTrigger = null), e.anchorName = null, e.layer) {
    for (const t of Array.from(e.layer.children))
      t instanceof HTMLElement && pt(t);
    We.delete(e.layer), ut.get(e.layer)?.disconnect(), e.layer.remove(), e.layer = null;
  }
}
let zt = !1;
function bo() {
  if (zt)
    return;
  zt = !0;
  const e = dr;
  e.computed = e.computed || {}, e.computed.inline = function() {
    return !!this.disabled || this.appendTo === "self";
  }, e.computed.resolvedTarget = function() {
    return this.appendTo == null || this.appendTo === "body" ? this.hostRoot ? this.layer : document.body : this.appendTo;
  }, e.data = function() {
    return { mounted: !1, hostRoot: null, layer: null, anchorName: null, anchorTrigger: null };
  }, e.mounted = function() {
    hr() && (this.hostRoot = vo(this.$el), this.mounted = !0, this.hostRoot && (this.inline || It(this), this.$watch("inline", (t) => {
      t ? Vt(this) : It(this);
    })));
  }, e.render = function() {
    return this.inline ? Ee(this.$slots, "default", { key: 0 }) : this.mounted ? Er(Wt, { key: 1, to: this.resolvedTarget || document.body }, [
      Ee(this.$slots, "default")
    ]) : z("", !0);
  }, e.unmounted = function() {
    Vt(this);
  };
}
const Ya = {
  install: (e) => {
    bo(), e.use(lo, { theme: "none" });
  }
};
function wo(e, t) {
  if (e && typeof e == "object") {
    const r = e, n = r.response?.data?.error;
    if (typeof n == "string") return n;
    if (n && typeof n == "object" && typeof n.message == "string")
      return n.message;
    if (typeof r.message == "string" && r.message) return r.message;
  }
  return t;
}
const xo = { class: "kx-wcmount" }, ko = {
  key: 0,
  class: "kx-wcmount-fail",
  role: "alert"
}, _o = /* @__PURE__ */ fe({
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
  emits: ["change", "created", "close", "error"],
  setup(e, { emit: t }) {
    const r = e, n = t, o = O(null), i = O(!1);
    let a = null, l = 0;
    const s = /* @__PURE__ */ new Set();
    function c(f) {
      f.composedPath()[0] === a && (f.stopPropagation(), n("change", f.detail));
    }
    function p(f) {
      return f.composedPath()[0] !== a ? !1 : (f.stopPropagation(), !0);
    }
    function u(f) {
      p(f) && n("created", f.detail);
    }
    function d(f) {
      p(f) && n("close", f.detail);
    }
    function h(f) {
      p(f) && n("error", f.detail);
    }
    function b(f) {
      if (typeof f == "string") return f;
      try {
        return JSON.stringify(f ?? {});
      } catch {
        return null;
      }
    }
    function x() {
      if (!a) return;
      const f = b(r.config);
      if (f !== null && a.setAttribute("config", f), r.schema !== void 0 && r.schema !== null) {
        const S = b(r.schema);
        S !== null && a.setAttribute("schema", S);
      }
      if (r.meta !== void 0 && r.meta !== null) {
        const S = b(r.meta);
        S !== null && a.setAttribute("meta", S);
      }
      r.provider && a.setAttribute("provider", r.provider), r.label && a.setAttribute("label", r.label);
      const C = r.attrs || {};
      for (const S of [...s])
        (!(S in C) || C[S] == null) && (a.removeAttribute(S), s.delete(S));
      for (const [S, T] of Object.entries(C)) {
        if (T == null) continue;
        const V = typeof T == "object" ? b(T) : String(T);
        V !== null && (a.setAttribute(S, V), s.add(S));
      }
    }
    function m(f = a) {
      f && (f.removeEventListener("config-changed", c), f.removeEventListener("change", c), f.removeEventListener("created", u), f.removeEventListener("close", d), f.removeEventListener("error", h), f === a && (a = null), s.clear());
    }
    async function w(f) {
      if (!customElements.get(f))
        try {
          await Dr(f, { timeoutMs: 8e3 });
        } catch {
        }
    }
    async function g() {
      const f = ++l, C = o.value, S = r.tag;
      if (i.value = !1, !!C && (m(), C.innerHTML = "", !!S))
        try {
          if (await w(S), f !== l || o.value !== C || r.tag !== S) return;
          const T = document.createElement(S);
          T.classList.add("kx-wcmount-surface"), a = T, x(), T.addEventListener("config-changed", c), T.addEventListener("change", c), T.addEventListener("created", u), T.addEventListener("close", d), T.addEventListener("error", h), T.style.display = "block", C.appendChild(T), i.value = !customElements.get(S);
        } catch {
          f === l && (i.value = !0);
        }
    }
    async function k() {
      i.value = !1, await Oe(), await g();
    }
    return Bt(g), H(() => r.tag, g), H(() => [r.config, r.schema, r.meta, r.provider, r.label, r.attrs], x, { deep: !0 }), Ut(() => {
      l += 1, m();
    }), (f, C) => (E(), L("div", xo, [
      i.value ? (E(), L("div", ko, [
        C[0] || (C[0] = _("span", null, "This setup panel couldn’t load.", -1)),
        _("button", {
          type: "button",
          onClick: k
        }, "Try again")
      ])) : (E(), L("div", {
        key: 1,
        ref_key: "host",
        ref: o
      }, null, 512))
    ]));
  }
}), So = (e, t) => {
  const r = e.__vccOpts || e;
  for (const [n, o] of t)
    r[n] = o;
  return r;
}, it = /* @__PURE__ */ So(_o, [["__scopeId", "data-v-3ec70c11"]]), Co = { class: "kx-stage" }, Oo = { class: "kx-stage-head" }, Eo = { class: "kx-stage-ico" }, To = {
  class: "kx-stage-cfg",
  "data-test": "pl-trigger"
}, Po = "kickside-trigger-config", $o = /* @__PURE__ */ fe({
  __name: "SyncCreateSource",
  props: {
    icon: {},
    seed: {},
    editing: { type: Boolean }
  },
  emits: ["change"],
  setup(e, { emit: t }) {
    const r = e, n = t;
    function o(i) {
      n("change", i);
    }
    return (i, a) => (E(), L("div", Co, [
      _("div", Oo, [
        _("span", Eo, [
          R(y(ie), {
            icon: r.icon,
            "aria-hidden": "true"
          }, null, 8, ["icon"])
        ]),
        a[0] || (a[0] = _("span", { class: "kx-stage-lbl" }, "Source", -1))
      ]),
      _("div", To, [
        R(it, {
          tag: Po,
          attrs: { allowed: "source", reconfigure: r.editing ? "true" : null, value: r.seed },
          onChange: o
        }, null, 8, ["attrs"])
      ])
    ]));
  }
}), Lo = { class: "kx-stage kx-stage-mid" }, Ao = { class: "kx-stage-head" }, No = { class: "kx-stage-ico" }, Ro = {
  key: 0,
  class: "kx-stage-desc",
  "data-test": "pl-transform-hint"
}, jo = "kickside-transform-assist", Mo = /* @__PURE__ */ fe({
  __name: "SyncCreateTransform",
  props: {
    canAssist: { type: Boolean },
    detected: {},
    transform: {},
    sourceSchema: {},
    sinkSchema: {},
    inputShape: {},
    hint: {},
    value: {},
    generationPolicy: {}
  },
  emits: ["transform-confirmed"],
  setup(e, { emit: t }) {
    const r = e, n = t;
    function o(i) {
      n("transform-confirmed", i);
    }
    return (i, a) => (E(), L("div", Lo, [
      _("div", Ao, [
        _("span", No, [
          R(y(ie), {
            icon: "tabler:transform",
            "aria-hidden": "true"
          })
        ]),
        a[0] || (a[0] = _("span", { class: "kx-stage-lbl" }, "Transform", -1))
      ]),
      r.canAssist ? (E(), L(de, { key: 1 }, [
        r.detected && (!r.transform || r.transform.kind === "none") ? (E(), L("div", {
          key: 0,
          class: qt(["kx-detect", r.detected.needed && "kx-detect-warn"])
        }, [
          R(y(ie), {
            icon: r.detected.needed ? "tabler:alert-triangle" : "tabler:circle-check",
            "aria-hidden": "true"
          }, null, 8, ["icon"]),
          _("span", null, J(r.detected.reason), 1)
        ], 2)) : z("", !0),
        (E(), Ft(Tr(jo), {
          "data-test": "pl-transform",
          "source-schema": r.sourceSchema,
          "sink-schema": r.sinkSchema,
          "input-shape": r.inputShape,
          hint: r.hint,
          value: r.value,
          "generation-policy": r.generationPolicy,
          onTransformConfirmed: o
        }, null, 40, ["source-schema", "sink-schema", "input-shape", "hint", "value", "generation-policy"]))
      ], 64)) : (E(), L("p", Ro, "Pick a source and destination to define the transform."))
    ]));
  }
}), Io = 2e3;
function Dt(e) {
  const t = e.margin ?? 8, r = e.gap ?? 4, n = Math.max(0, e.viewportWidth), o = Math.max(0, e.viewportHeight), i = Math.max(0, n - t * 2), a = Math.min(Math.max(0, e.requestedWidth), i), l = e.align === "right" ? e.anchor.right - a : e.anchor.left, s = Math.max(t, Math.min(l, n - t - a)), c = Math.max(0, o - e.anchor.bottom - r - t), p = Math.max(0, e.anchor.top - r - t), u = c < e.requestedMaxHeight && p > c ? "above" : "below", d = u === "above" ? p : c, h = Math.round(Math.min(Math.max(0, e.requestedMaxHeight), d)), b = Math.min(Math.max(0, e.panelHeight ?? h), h), x = u === "above" ? e.anchor.top - r - b : e.anchor.bottom + r, m = e.containingBlockOrigin ?? { left: 0, top: 0 };
  return {
    left: Math.round(s - m.left),
    width: Math.round(a),
    maxHeight: h,
    side: u,
    top: Math.round(x - m.top)
  };
}
const Vo = /* @__PURE__ */ fe({
  __name: "AnchoredPanel",
  props: {
    open: { type: Boolean },
    anchor: {},
    align: { default: "left" },
    width: { default: "anchor" },
    minWidth: { default: 0 },
    maxHeight: { default: 340 },
    gap: { default: 4 },
    zIndex: { default: Io }
  },
  emits: ["update:open"],
  setup(e, { emit: t }) {
    const r = e, n = t, o = O(null), i = O({ position: "fixed", visibility: "hidden" });
    function a() {
      const x = r.anchor, m = o.value;
      if (!x || !m) return;
      const w = x.getBoundingClientRect(), g = r.width === "anchor" ? Math.max(r.minWidth, w.width) : Math.max(r.minWidth, r.width), k = {
        anchor: w,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
        requestedWidth: g,
        requestedMaxHeight: r.maxHeight,
        align: r.align,
        gap: r.gap
      }, f = Dt(k);
      Object.assign(m.style, {
        position: "fixed",
        left: "0px",
        top: "0px",
        right: "auto",
        bottom: "auto",
        width: `${f.width}px`,
        maxHeight: `${f.maxHeight}px`,
        visibility: "hidden"
      });
      const C = m.getBoundingClientRect(), S = Dt({
        ...k,
        containingBlockOrigin: { left: C.left, top: C.top },
        panelHeight: C.height
      }), T = {
        position: "fixed",
        left: `${S.left}px`,
        top: `${S.top}px`,
        width: `${S.width}px`,
        maxHeight: `${S.maxHeight}px`,
        "--anchored-panel-available-height": `${S.maxHeight}px`,
        margin: "0",
        zIndex: String(r.zIndex),
        visibility: "visible"
      };
      i.value = T;
    }
    let l = null, s = !1;
    function c() {
      s || !r.open || (s = !0, requestAnimationFrame(() => {
        s = !1, r.open && a();
      }));
    }
    function p() {
      typeof ResizeObserver > "u" || (l = new ResizeObserver(c), o.value && l.observe(o.value), r.anchor && l.observe(r.anchor));
    }
    function u() {
      l?.disconnect(), l = null, s = !1;
    }
    H(() => r.open, async (x) => {
      u(), x && (i.value = { position: "fixed", visibility: "hidden" }, await Oe(), a(), p());
    }, { immediate: !0 });
    function d(x) {
      if (!r.open) return;
      const m = x.composedPath();
      o.value && m.includes(o.value) || r.anchor && m.includes(r.anchor) || n("update:open", !1);
    }
    function h(x) {
      r.open && x.key === "Escape" && n("update:open", !1);
    }
    function b() {
      r.open && a();
    }
    return document.addEventListener("click", d), document.addEventListener("keydown", h), window.addEventListener("resize", b), window.addEventListener("scroll", b, !0), Ut(() => {
      u(), document.removeEventListener("click", d), document.removeEventListener("keydown", h), window.removeEventListener("resize", b), window.removeEventListener("scroll", b, !0);
    }), (x, m) => e.open ? (E(), L("div", {
      key: 0,
      ref_key: "panel",
      ref: o,
      class: "anchored-panel",
      style: Pr(i.value)
    }, [
      Ee(x.$slots, "default")
    ], 4)) : z("", !0);
  }
}), zo = ["aria-expanded", "aria-controls", "aria-label", "disabled"], Do = { class: "p-select-label" }, Ho = {
  key: 0,
  class: "kx-ps-val"
}, Bo = { class: "kx-ps-val-label" }, Fo = {
  key: 1,
  class: "kx-ps-ph"
}, Wo = { class: "p-select-dropdown" }, Uo = { class: "p-select-overlay kx-ps-panel" }, qo = { class: "p-select-header" }, Ko = ["aria-label", "aria-controls", "aria-activedescendant"], Yo = ["id", "aria-label"], Go = {
  class: "p-select-option-group",
  role: "presentation"
}, Jo = ["id", "aria-selected", "onClick", "onMousemove"], Qo = { class: "kx-ps-opt-body" }, Zo = { class: "kx-ps-opt-title" }, Xo = {
  key: 0,
  class: "kx-ps-opt-sub"
}, ea = {
  key: 0,
  class: "p-select-empty-message",
  role: "status"
}, ta = {
  key: 1,
  class: "p-select-empty-message",
  role: "presentation"
}, ra = {
  key: 0,
  class: "p-select-empty-message",
  role: "alert"
}, na = ["disabled"], oa = /* @__PURE__ */ fe({
  __name: "PickerSelect",
  props: {
    items: {},
    modelValue: {},
    placeholder: {},
    ariaLabel: {},
    disabled: { type: Boolean },
    remote: { type: Boolean },
    loading: { type: Boolean },
    more: { type: Boolean },
    error: {}
  },
  emits: ["update:modelValue", "search", "more"],
  setup(e, { emit: t }) {
    const r = e, n = t, o = O(null), i = O(null), a = O(!1), l = O(""), s = O(0), c = $r(), p = $(() => {
      const m = l.value.trim().toLowerCase(), w = /* @__PURE__ */ new Map();
      for (const k of r.items) {
        if (!r.remote && m && ![k.title, k.subtitle, k.id, k.group].some((S) => S?.toLowerCase().includes(m))) continue;
        const f = k.group || "Other", C = w.get(f);
        C ? C.push(k) : w.set(f, [k]);
      }
      let g = 0;
      return [...w.entries()].sort((k, f) => k[0].localeCompare(f[0])).map(([k, f]) => ({ group: k, items: f.map((C) => ({ item: C, index: g++ })) }));
    }), u = $(() => p.value.flatMap((m) => m.items)), d = $(() => r.items.find((m) => m.id === r.modelValue)), h = $(() => u.value[s.value] ? `${c}-${s.value}` : void 0);
    H(l, () => {
      s.value = 0;
    }), H([a, l], ([m, w]) => {
      m && r.remote && n("search", w);
    }), H(() => r.disabled, (m) => {
      m && (a.value = !1);
    }), H(a, async (m) => {
      if (!m) {
        o.value?.focus();
        return;
      }
      l.value = "", s.value = Math.max(0, u.value.findIndex(({ item: w }) => w.id === r.modelValue)), await Oe(), i.value?.focus();
    });
    function b(m) {
      r.disabled || r.loading || (n("update:modelValue", m.id), a.value = !1);
    }
    async function x(m) {
      if (m.key === "Escape" && a.value) {
        m.preventDefault(), m.stopPropagation(), a.value = !1;
        return;
      }
      if (!["ArrowDown", "ArrowUp", "Home", "End", "Enter"].includes(m.key)) return;
      if (m.preventDefault(), !a.value) {
        a.value = !0;
        return;
      }
      if (m.key === "Enter") {
        const k = u.value[s.value];
        k && b(k.item);
        return;
      }
      const w = u.value.length - 1;
      s.value = m.key === "Home" ? 0 : m.key === "End" ? w : Math.max(0, Math.min(w, s.value + (m.key === "ArrowDown" ? 1 : -1))), await Oe(), o.value?.getRootNode()?.querySelector(`[id="${h.value}"]`)?.scrollIntoView({ block: "nearest" });
    }
    return (m, w) => (E(), L(de, null, [
      _("button", {
        ref_key: "anchor",
        ref: o,
        type: "button",
        class: "kx-ps p-select",
        role: "combobox",
        "aria-haspopup": "listbox",
        "aria-expanded": a.value,
        "aria-controls": y(c),
        "aria-label": e.ariaLabel,
        disabled: e.disabled,
        onClick: w[0] || (w[0] = (g) => a.value = !a.value),
        onKeydown: x
      }, [
        _("span", Do, [
          d.value ? (E(), L("span", Ho, [
            R(y(ie), {
              icon: d.value.icon || "tabler:point",
              class: "kx-ps-val-ico",
              "aria-hidden": "true"
            }, null, 8, ["icon"]),
            _("span", Bo, J(d.value.title), 1)
          ])) : (E(), L("span", Fo, J(e.placeholder || "Select…"), 1))
        ]),
        _("span", Wo, [
          R(y(ie), {
            icon: "tabler:chevron-down",
            "aria-hidden": "true"
          })
        ])
      ], 40, zo),
      R(Vo, {
        open: a.value,
        "onUpdate:open": w[3] || (w[3] = (g) => a.value = g),
        anchor: o.value
      }, {
        default: Lr(() => [
          _("div", Uo, [
            _("div", qo, [
              tt(_("input", {
                ref_key: "search",
                ref: i,
                "onUpdate:modelValue": w[1] || (w[1] = (g) => l.value = g),
                type: "search",
                class: "p-inputtext p-select-filter",
                "aria-label": `Search ${e.ariaLabel || e.placeholder || "options"}`,
                "aria-controls": y(c),
                "aria-activedescendant": h.value,
                onKeydown: x
              }, null, 40, Ko), [
                [Kt, l.value]
              ])
            ]),
            _("ul", {
              id: y(c),
              class: "p-select-list kx-ps-options",
              role: "listbox",
              "aria-label": e.ariaLabel || e.placeholder || "Options"
            }, [
              (E(!0), L(de, null, ht(p.value, (g) => (E(), L(de, {
                key: g.group
              }, [
                _("li", Go, J(g.group), 1),
                (E(!0), L(de, null, ht(g.items, ({ item: k, index: f }) => (E(), L("li", {
                  id: `${y(c)}-${f}`,
                  key: k.id,
                  class: qt(["p-select-option kx-ps-option", { "p-select-option-selected": k.id === e.modelValue, "p-focus": f === s.value }]),
                  role: "option",
                  "aria-selected": k.id === e.modelValue,
                  onClick: (C) => b(k),
                  onMousemove: (C) => s.value = f
                }, [
                  R(y(ie), {
                    icon: k.icon || "tabler:point",
                    class: "kx-ps-opt-ico",
                    "aria-hidden": "true"
                  }, null, 8, ["icon"]),
                  _("span", Qo, [
                    _("span", Zo, J(k.title), 1),
                    k.subtitle ? (E(), L("span", Xo, J(k.subtitle), 1)) : z("", !0)
                  ])
                ], 42, Jo))), 128))
              ], 64))), 128)),
              e.loading ? (E(), L("li", ea, "Loading…")) : !u.value.length && !e.error ? (E(), L("li", ta, "No matches")) : z("", !0)
            ], 8, Yo),
            e.error ? (E(), L("div", ra, J(e.error), 1)) : z("", !0),
            e.more ? (E(), L("button", {
              key: 1,
              type: "button",
              class: "p-button p-button-secondary",
              "data-testid": "picker-more",
              disabled: e.loading || e.disabled,
              onClick: w[2] || (w[2] = (g) => n("more"))
            }, "Load more", 8, na)) : z("", !0)
          ])
        ]),
        _: 1
      }, 8, ["open", "anchor"])
    ], 64));
  }
}), aa = { class: "kx-stage" }, ia = { class: "kx-stage-head" }, sa = { class: "kx-stage-ico" }, la = {
  key: 0,
  class: "kx-stage-desc"
}, ca = {
  key: 0,
  class: "kx-stage-desc"
}, pa = { class: "kx-stage-cfg" }, ua = {
  key: 0,
  class: "kx-stage-opts"
}, da = /* @__PURE__ */ fe({
  __name: "SyncCreateDestination",
  props: {
    items: {},
    sinkId: {},
    editing: { type: Boolean },
    selectedSink: {},
    configTag: {},
    configSchema: {},
    pickerMeta: {},
    config: {},
    hasOptions: { type: Boolean },
    optionsSchema: {},
    lockedHint: {}
  },
  emits: ["update:sinkId", "update:config"],
  setup(e, { emit: t }) {
    const r = e, n = t;
    function o(i) {
      i && typeof i == "object" && n("update:config", i);
    }
    return (i, a) => (E(), L("div", aa, [
      _("div", ia, [
        _("span", sa, [
          R(y(ie), {
            icon: r.selectedSink?.icon || "tabler:database",
            "aria-hidden": "true"
          }, null, 8, ["icon"])
        ]),
        a[1] || (a[1] = _("span", { class: "kx-stage-lbl" }, "Destination", -1))
      ]),
      R(oa, {
        items: r.items,
        "model-value": r.sinkId,
        disabled: r.editing,
        placeholder: "Pick a destination…",
        "onUpdate:modelValue": a[0] || (a[0] = (l) => n("update:sinkId", l))
      }, null, 8, ["items", "model-value", "disabled"]),
      r.editing ? (E(), L("p", la, J(r.lockedHint), 1)) : z("", !0),
      r.selectedSink && !r.editing ? (E(), L(de, { key: 1 }, [
        r.selectedSink.description ? (E(), L("p", ca, J(r.selectedSink.description), 1)) : z("", !0),
        _("div", pa, [
          R(it, {
            tag: r.configTag,
            schema: r.configSchema,
            config: r.config,
            meta: r.pickerMeta,
            provider: r.selectedSink.provider,
            onChange: o
          }, null, 8, ["tag", "schema", "config", "meta", "provider"]),
          r.hasOptions ? (E(), L("div", ua, [
            a[2] || (a[2] = _("span", { class: "kx-opts-lbl" }, "Options", -1)),
            R(it, {
              tag: "wc-schema-form",
              schema: r.optionsSchema,
              config: r.config,
              onChange: o
            }, null, 8, ["schema", "config"])
          ])) : z("", !0)
        ])
      ], 64)) : z("", !0)
    ]));
  }
});
function ha(e) {
  return !!(e && typeof e.picker == "string" && e.picker && e.picker !== "wc-schema-form");
}
function fr(e) {
  return e?.config_schema;
}
function vr(e, t = "ports") {
  const r = fr(e);
  if (!r) return null;
  const n = [];
  for (const [c, p] of Object.entries(r))
    ha(p) && n.push([c, p]);
  if (n.length === 0) return null;
  n.length > 1 && console.error(`${t}: port schema declares multiple picker fields`, n.map(([c]) => c));
  const [o, i] = n[0], a = typeof i.title == "string" ? i.title : "", l = typeof i.detail == "string" ? i.detail : "", s = typeof i.delete_endpoint == "string" ? i.delete_endpoint : "";
  return { key: o, tag: i.picker ?? "", title: a, schema: { properties: { [o]: i } }, detail: l, deleteEndpoint: s };
}
function ma(e, t = "ports") {
  const r = fr(e);
  if (!r) return null;
  const n = vr(e, t)?.key, o = {};
  for (const [i, a] of Object.entries(r))
    i !== n && (o[i] = a);
  return Object.keys(o).length ? { type: "object", properties: o } : null;
}
function st(e) {
  if (!e) return null;
  if (typeof e == "string")
    try {
      return JSON.parse(e);
    } catch {
      return null;
    }
  return e;
}
function fa(e) {
  const t = st(e);
  return !!(t && t.properties && Object.keys(t.properties).length);
}
const va = "_portable_input";
function Se(e) {
  return e && typeof e == "object" && !Array.isArray(e) ? e : null;
}
function ga(e) {
  const t = Se(e);
  return t && typeof t.kind == "string" ? t : null;
}
function ya(e) {
  return e === !0 ? !0 : void 0;
}
function gr(e) {
  if (!e.transform) throw new Error("transform selection is required");
  const t = {
    title: e.title.trim(),
    trigger: e.trigger,
    sink_port: e.sinkPort,
    sink_config: e.sinkConfig,
    transform: e.transform,
    enabled: e.enabled
  };
  return e.reconcile && (t.reconcile = e.reconcile), e.outputSchema !== void 0 && (t.output_schema = e.outputSchema), t;
}
function Ga(e) {
  const t = Se(e), r = Se(t?.[va]), n = Se(r?.trigger), o = typeof r?.sink_port == "string" ? r.sink_port : "", i = ga(r?.transform), a = t?.enabled;
  return !r || !n || !o || !i || typeof a != "boolean" ? null : gr({
    title: typeof r.title == "string" ? r.title : "",
    trigger: n,
    sinkPort: o,
    sinkConfig: Se(r.sink_config) ?? {},
    transform: i,
    outputSchema: r.output_schema,
    reconcile: ya(r.reconcile),
    enabled: a
  });
}
const ba = "wc-component-picker", wa = "wc-schema-form", Ht = "Locked after install — reinstall the data sync to change it.";
function Ja(e) {
  const t = e.managed, r = O(""), n = O(""), o = O({}), i = O(!1), a = O(!0), l = O({ v: 2 }), s = O(!1), c = O(""), p = O(void 0), u = O(""), d = O(null), h = O([]), b = O([]), x = $(() => {
    const v = l.value.source;
    return typeof v == "string" ? v : "";
  }), m = $(() => h.value.filter((v) => v.id === x.value)), w = $(() => m.value[0] || null), g = $(() => b.value.find((v) => v.id === n.value) || null);
  function k() {
    t || (i.value = !1);
  }
  function f() {
    o.value = {}, i.value = !1;
  }
  function C(v) {
    const P = v ?? {};
    if (!P.spec || typeof P.spec != "object" || Array.isArray(P.spec)) return;
    const ge = x.value;
    l.value = { ...P.spec }, s.value = P.valid === !0, c.value = typeof P.error == "string" ? P.error : "", P.output_schema !== void 0 && (p.value = P.output_schema), x.value !== ge && k();
  }
  const S = $(() => {
    for (const v of m.value) {
      const P = v.reconcile;
      if (P && typeof P.pull_keys == "string" && P.pull_keys) return P;
    }
    return null;
  }), T = $(() => !S.value || !g.value || !m.value.some((P) => P.surface === "collection") ? !1 : !!(g.value.operations || {}).delete), V = $(() => b.value.map((v) => ({
    id: v.id,
    title: v.title || v.name || v.id,
    icon: v.icon || "tabler:database",
    group: v.group || "Destinations",
    subtitle: v.description
  }))), j = $(() => vr(g.value, "SyncForm")), Z = $(() => {
    if (j.value?.tag !== ba) return;
    const v = String(g.value?.class || "");
    if (v)
      return { type: "thread", thread_class: v, title: j.value?.title ?? "", component: g.value?.component, delete_endpoint: j.value?.deleteEndpoint || "" };
  }), K = $(() => j.value?.tag || wa), B = $(() => ma(g.value, "SyncForm")), X = $(() => j.value?.schema ?? B.value), Y = $(() => !!j.value && fa(B.value)), ee = $(() => g.value ? j.value ? Object.keys(o.value).length > 0 : !0 : !1), te = $(() => {
    for (const v of m.value)
      if (v.output_schema != null) return st(v.output_schema);
    return null;
  }), G = $(() => st(g.value?.input_schema) ?? (g.value ? { properties: { content: { type: "string" } }, required: ["content"] } : null)), se = $(() => {
    if (!x.value || !g.value) return null;
    const v = G.value;
    if (!v || !v.properties) return { needed: !1, reason: "Destination accepts the item as-is — no transform needed." };
    const P = new Set(Object.keys(te.value?.properties || {})), ge = /* @__PURE__ */ new Set(), Re = /* @__PURE__ */ new Map(), Ge = g.value?.config_schema || {};
    for (const [W, Qe] of Object.entries(Ge)) {
      const ce = Qe || {};
      if (typeof ce.supplies != "string") continue;
      Re.set(ce.supplies, typeof ce.title == "string" && ce.title ? ce.title : W);
      const _e = o.value[W];
      _e != null && _e !== "" && ge.add(ce.supplies);
    }
    const ke = (v.required || []).filter((W) => !P.has(W) && !ge.has(W));
    if (ke.length === 0) return { needed: !1, reason: "Fields line up — pass through works." };
    const je = t ? [] : ke.map((W) => Re.get(W)).filter((W) => !!W), Je = je.length ? `, or fill ${je.join(", ")} below` : "";
    return { needed: !0, reason: `Destination needs ${ke.join(", ")}, not in the source — map it with an Expression or LLM${Je}.` };
  }), re = $(() => !!x.value && !!g.value), F = $(() => JSON.stringify(te.value ?? {})), D = $(() => JSON.stringify(G.value ?? {})), ne = $(() => g.value?.input_shape ?? ""), ve = $(() => {
    if (!re.value) return "";
    const v = w.value?.title || w.value?.name || "source", P = g.value?.title || g.value?.name || "destination";
    return `Map ${v} items into ${P} input.`;
  }), le = $(() => d.value ? JSON.stringify(d.value) : "");
  function Ae(v) {
    const P = v.detail?.transform;
    P && typeof P.kind == "string" && (d.value = P);
  }
  const Ne = $(() => {
    if (!r.value.trim()) return "Name is required.";
    if (!s.value) return c.value || "Source is required.";
    if (!n.value) return "Destination is required.";
    if (!ee.value) return "Destination configuration is required.";
    const v = d.value;
    return v ? v.kind === "expr" && !v.expr.trim() ? "Expression is required." : v.kind === "llm" && !v.prompt.trim() ? "Prompt is required." : v.kind === "code" && !v.code.trim() ? "Code is required." : "" : "Transform selection is required.";
  });
  async function qe() {
    try {
      const [v, P] = await Promise.all([
        ft.get("/api/v1/automations/sources"),
        ft.get("/api/v1/automations/sinks")
      ]);
      return h.value = v.data?.sources || [], b.value = P.data?.sinks || [], !t && b.value.length === 1 && (n.value = b.value[0].id), "";
    } catch (v) {
      return wo(v, "failed to load catalog");
    }
  }
  function Ke(v) {
    r.value = v.title, u.value = v.trigger, l.value = v.trigger, p.value = v.output_schema, d.value = v.transform, n.value = v.sink_port, o.value = v.sink_config, i.value = v.reconcile != null, a.value = v.enabled;
  }
  function Ye() {
    return gr({
      // The trigger spec rides verbatim as input.trigger: the trigger service
      // validates and normalizes it server-side.
      title: r.value,
      trigger: l.value,
      sinkPort: n.value,
      sinkConfig: o.value,
      transform: d.value,
      outputSchema: p.value,
      reconcile: (t || T.value) && i.value ? !0 : void 0,
      enabled: a.value
    });
  }
  return {
    managed: t,
    title: r,
    sinkId: n,
    sinkConfig: o,
    reconcileEnabled: i,
    triggerSeed: u,
    transform: d,
    sources: h,
    sinks: b,
    selectedSource: w,
    selectedSink: g,
    supportsReconcile: T,
    sinkItems: V,
    sinkPickerMeta: Z,
    sinkConfigTag: K,
    sinkConfigSchema: X,
    sinkOptionsSchema: B,
    sinkHasOptions: Y,
    transformDetected: se,
    canAssist: re,
    assistSourceSchema: F,
    assistSinkSchema: D,
    assistInputShape: ne,
    assistHint: ve,
    assistValue: le,
    validationError: Ne,
    onTriggerChange: C,
    onAssistConfirmed: Ae,
    onSinkChange: f,
    loadCatalog: qe,
    seed: Ke,
    currentInput: Ye
  };
}
const xa = { class: "kx-field" }, ka = { class: "kx-pipe" }, _a = { class: "kx-pipe-conn" }, Sa = { class: "kx-pipe-conn" }, Ca = {
  key: 0,
  class: "kx-runopts"
}, Oa = { class: "kx-field" }, Ea = { class: "kx-reconcile-check" }, Ta = ["disabled"], Pa = { class: "kx-field-hint" }, Qa = /* @__PURE__ */ fe({
  __name: "SyncPipeline",
  props: {
    form: {},
    destinationLocked: { type: Boolean },
    generationPolicy: {}
  },
  setup(e) {
    const t = e, r = t.form;
    return (n, o) => (E(), L(de, null, [
      _("label", xa, [
        o[4] || (o[4] = _("span", { class: "kx-field-lbl" }, [
          Ar("Name "),
          _("span", {
            class: "kx-req",
            "aria-hidden": "true"
          }, "*")
        ], -1)),
        tt(_("input", {
          "onUpdate:modelValue": o[0] || (o[0] = (i) => y(r).title.value = i),
          "data-test": "pl-title",
          class: "kx-input",
          type: "text",
          placeholder: "Fireflies to Knowledge Base"
        }, null, 512), [
          [Kt, y(r).title.value]
        ])
      ]),
      _("div", ka, [
        R($o, {
          icon: y(r).selectedSource.value?.icon || "tabler:plug",
          seed: y(r).triggerSeed.value,
          editing: y(r).managed,
          onChange: y(r).onTriggerChange
        }, null, 8, ["icon", "seed", "editing", "onChange"]),
        _("div", _a, [
          R(y(ie), {
            icon: "tabler:arrow-down",
            "aria-hidden": "true"
          })
        ]),
        R(Mo, {
          "can-assist": y(r).canAssist.value,
          detected: y(r).transformDetected.value,
          transform: y(r).transform.value,
          "source-schema": y(r).assistSourceSchema.value,
          "sink-schema": y(r).assistSinkSchema.value,
          "input-shape": y(r).assistInputShape.value,
          hint: y(r).assistHint.value,
          value: y(r).assistValue.value,
          "generation-policy": t.generationPolicy,
          onTransformConfirmed: y(r).onAssistConfirmed
        }, null, 8, ["can-assist", "detected", "transform", "source-schema", "sink-schema", "input-shape", "hint", "value", "generation-policy", "onTransformConfirmed"]),
        _("div", Sa, [
          R(y(ie), {
            icon: "tabler:arrow-down",
            "aria-hidden": "true"
          })
        ]),
        R(da, {
          items: y(r).sinkItems.value,
          "sink-id": y(r).sinkId.value,
          editing: y(r).managed || !!t.destinationLocked,
          "selected-sink": y(r).selectedSink.value,
          "config-tag": y(r).sinkConfigTag.value,
          "config-schema": y(r).sinkConfigSchema.value,
          "picker-meta": y(r).sinkPickerMeta.value,
          config: y(r).sinkConfig.value,
          "has-options": y(r).sinkHasOptions.value,
          "options-schema": y(r).sinkOptionsSchema.value,
          "locked-hint": t.destinationLocked ? "Selected by the owning component." : y(Ht),
          "onUpdate:sinkId": o[1] || (o[1] = (i) => {
            y(r).sinkId.value = i, y(r).onSinkChange();
          }),
          "onUpdate:config": o[2] || (o[2] = (i) => {
            y(r).sinkConfig.value = { ...y(r).sinkConfig.value, ...i };
          })
        }, null, 8, ["items", "sink-id", "editing", "selected-sink", "config-tag", "config-schema", "picker-meta", "config", "has-options", "options-schema", "locked-hint"])
      ]),
      y(r).supportsReconcile.value || y(r).managed && y(r).reconcileEnabled.value ? (E(), L("div", Ca, [
        _("div", Oa, [
          _("label", Ea, [
            tt(_("input", {
              "onUpdate:modelValue": o[3] || (o[3] = (i) => y(r).reconcileEnabled.value = i),
              class: "kx-check",
              type: "checkbox",
              disabled: y(r).managed
            }, null, 8, Ta), [
              [Nr, y(r).reconcileEnabled.value]
            ]),
            o[5] || (o[5] = _("span", null, "Reconcile deleted source items", -1))
          ]),
          _("span", Pa, J(y(r).managed ? y(Ht) : "Periodically compares source keys with this sync’s owned destinations and removes items that disappeared from the source."), 1)
        ])
      ])) : z("", !0)
    ], 64));
  }
}), Za = ':root{--p-form-field-padding-x: .75rem;--p-form-field-padding-y: .5rem;--p-form-field-sm-padding-x: .625rem;--p-form-field-sm-padding-y: .375rem;--p-form-field-lg-padding-x: .875rem;--p-form-field-lg-padding-y: .625rem;--p-form-field-border-radius: .375rem;--p-form-field-transition-duration: .2s;--p-form-field-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), 0 1px 2px 0 rgba(18, 18, 23, .05);--p-focus-ring-width: 1px;--p-focus-ring-style: solid;--p-focus-ring-color: color-mix(in srgb, var(--p-primary-color) 100%, transparent);--p-focus-ring-offset: 2px;--p-toggleswitch-width: 2.5rem;--p-toggleswitch-height: 1.5rem;--p-toggleswitch-border-radius: 30px;--p-toggleswitch-gap: .25rem;--p-toggleswitch-border-width: 1px;--p-toggleswitch-transition-duration: .2s;--p-toggleswitch-slide-duration: .2s;--p-toggleswitch-handle-size: 1rem;--p-toggleswitch-handle-border-radius: 9999px}:root{color-scheme:light dark;--p-primary: rgb(0, 95, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-secondary: #6f7385;--p-secondary-50: color-mix(in srgb, var(--p-secondary) 5%, white);--p-secondary-100: color-mix(in srgb, var(--p-secondary) 10%, white);--p-secondary-200: color-mix(in srgb, var(--p-secondary) 20%, white);--p-secondary-300: color-mix(in srgb, var(--p-secondary) 35%, white);--p-secondary-400: color-mix(in srgb, var(--p-secondary) 65%, white);--p-secondary-500: var(--p-secondary);--p-secondary-600: color-mix(in srgb, var(--p-secondary) 80%, black);--p-secondary-700: color-mix(in srgb, var(--p-secondary) 65%, black);--p-secondary-800: color-mix(in srgb, var(--p-secondary) 55%, black);--p-secondary-900: color-mix(in srgb, var(--p-secondary) 50%, black);--p-secondary-950: color-mix(in srgb, var(--p-secondary) 30%, black);--p-danger: rgb(239, 68, 68);--p-danger-50: color-mix(in srgb, var(--p-danger) 5%, white);--p-danger-100: color-mix(in srgb, var(--p-danger) 10%, white);--p-danger-200: color-mix(in srgb, var(--p-danger) 20%, white);--p-danger-300: color-mix(in srgb, var(--p-danger) 30%, white);--p-danger-400: color-mix(in srgb, var(--p-danger) 40%, white);--p-danger-500: var(--p-danger);--p-danger-600: color-mix(in srgb, var(--p-danger) 80%, black);--p-danger-700: color-mix(in srgb, var(--p-danger) 70%, black);--p-danger-800: color-mix(in srgb, var(--p-danger) 60%, black);--p-danger-900: color-mix(in srgb, var(--p-danger) 50%, black);--p-danger-950: color-mix(in srgb, var(--p-danger) 40%, black);--p-success: rgb(34, 197, 94);--p-success-50: color-mix(in srgb, var(--p-success) 5%, white);--p-success-100: color-mix(in srgb, var(--p-success) 10%, white);--p-success-200: color-mix(in srgb, var(--p-success) 20%, white);--p-success-300: color-mix(in srgb, var(--p-success) 30%, white);--p-success-400: color-mix(in srgb, var(--p-success) 40%, white);--p-success-500: var(--p-success);--p-success-600: color-mix(in srgb, var(--p-success) 80%, black);--p-success-700: color-mix(in srgb, var(--p-success) 70%, black);--p-success-800: color-mix(in srgb, var(--p-success) 60%, black);--p-success-900: color-mix(in srgb, var(--p-success) 50%, black);--p-success-950: color-mix(in srgb, var(--p-success) 40%, black);--p-warn: rgb(249, 115, 22);--p-warn-50: color-mix(in srgb, var(--p-warn) 5%, white);--p-warn-100: color-mix(in srgb, var(--p-warn) 10%, white);--p-warn-200: color-mix(in srgb, var(--p-warn) 20%, white);--p-warn-300: color-mix(in srgb, var(--p-warn) 30%, white);--p-warn-400: color-mix(in srgb, var(--p-warn) 40%, white);--p-warn-500: var(--p-warn);--p-warn-600: color-mix(in srgb, var(--p-warn) 80%, black);--p-warn-700: color-mix(in srgb, var(--p-warn) 70%, black);--p-warn-800: color-mix(in srgb, var(--p-warn) 60%, black);--p-warn-900: color-mix(in srgb, var(--p-warn) 50%, black);--p-warn-950: color-mix(in srgb, var(--p-warn) 40%, black);--p-info: rgb(14, 165, 233);--p-info-50: color-mix(in srgb, var(--p-info) 5%, white);--p-info-100: color-mix(in srgb, var(--p-info) 10%, white);--p-info-200: color-mix(in srgb, var(--p-info) 20%, white);--p-info-300: color-mix(in srgb, var(--p-info) 30%, white);--p-info-400: color-mix(in srgb, var(--p-info) 40%, white);--p-info-500: var(--p-info);--p-info-600: color-mix(in srgb, var(--p-info) 80%, black);--p-info-700: color-mix(in srgb, var(--p-info) 70%, black);--p-info-800: color-mix(in srgb, var(--p-info) 60%, black);--p-info-900: color-mix(in srgb, var(--p-info) 50%, black);--p-info-950: color-mix(in srgb, var(--p-info) 40%, black);--p-help: rgb(168, 85, 247);--p-help-50: color-mix(in srgb, var(--p-help) 5%, white);--p-help-100: color-mix(in srgb, var(--p-help) 10%, white);--p-help-200: color-mix(in srgb, var(--p-help) 20%, white);--p-help-300: color-mix(in srgb, var(--p-help) 30%, white);--p-help-400: color-mix(in srgb, var(--p-help) 40%, white);--p-help-500: var(--p-help);--p-help-600: color-mix(in srgb, var(--p-help) 80%, black);--p-help-700: color-mix(in srgb, var(--p-help) 70%, black);--p-help-800: color-mix(in srgb, var(--p-help) 60%, black);--p-help-900: color-mix(in srgb, var(--p-help) 50%, black);--p-help-950: color-mix(in srgb, var(--p-help) 40%, black);--p-accent: rgb(20, 184, 166);--p-accent-50: color-mix(in srgb, var(--p-accent) 5%, white);--p-accent-100: color-mix(in srgb, var(--p-accent) 10%, white);--p-accent-200: color-mix(in srgb, var(--p-accent) 20%, white);--p-accent-300: color-mix(in srgb, var(--p-accent) 30%, white);--p-accent-400: color-mix(in srgb, var(--p-accent) 40%, white);--p-accent-500: var(--p-accent);--p-accent-600: color-mix(in srgb, var(--p-accent) 80%, black);--p-accent-700: color-mix(in srgb, var(--p-accent) 70%, black);--p-accent-800: color-mix(in srgb, var(--p-accent) 60%, black);--p-accent-900: color-mix(in srgb, var(--p-accent) 50%, black);--p-accent-950: color-mix(in srgb, var(--p-accent) 40%, black);--p-surface-0: #ffffff;--p-surface-50: #fafafa;--p-surface-100: #f5f5f5;--p-surface-200: #e5e5e5;--p-surface-300: #d4d4d4;--p-surface-400: #a3a3a3;--p-surface-500: #737373;--p-surface-600: #525252;--p-surface-700: #404040;--p-surface-800: #262626;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #171717;--p-surface-950: #0a0a0a;--p-content-border-radius: 6px;--p-font-heading-family: var(--v-font-family-head, Arial);--p-font-heading-scale: 1;--p-font-heading-line-height: 1.5;--p-font-heading-letter-spacing: normal;--p-font-heading-stretch: normal;--p-font-heading-variation-settings: normal;--p-font-body-scale: 1;--p-font-body-line-height: 1.5;--p-font-body-letter-spacing: normal;--p-font-body-stretch: normal;--p-font-body-variation-settings: normal;--p-font-mono-family: ui-monospace}:root{--p-primary-color: var(--p-primary-500);--p-primary-contrast-color: var(--p-surface-0);--p-primary-hover-color: var(--p-primary-600);--p-primary-active-color: var(--p-primary-700);--p-secondary-color: var(--p-secondary-500);--p-secondary-contrast-color: var(--p-surface-0);--p-secondary-hover-color: var(--p-secondary-600);--p-secondary-active-color: var(--p-secondary-700);--p-danger-color: var(--p-danger-500);--p-danger-contrast-color: var(--p-surface-0);--p-danger-hover-color: var(--p-danger-600);--p-danger-active-color: var(--p-danger-700);--p-success-color: var(--p-success-500);--p-success-contrast-color: var(--p-surface-0);--p-success-hover-color: var(--p-success-600);--p-success-active-color: var(--p-success-700);--p-warn-color: var(--p-warn-500);--p-warn-contrast-color: var(--p-surface-0);--p-warn-hover-color: var(--p-warn-600);--p-warn-active-color: var(--p-warn-700);--p-info-color: var(--p-info-500);--p-info-contrast-color: var(--p-surface-0);--p-info-hover-color: var(--p-info-600);--p-info-active-color: var(--p-info-700);--p-help-color: var(--p-help-500);--p-help-contrast-color: var(--p-surface-0);--p-help-hover-color: var(--p-help-600);--p-help-active-color: var(--p-help-700);--p-accent-color: var(--p-accent-500);--p-accent-contrast-color: var(--p-surface-0);--p-accent-hover-color: var(--p-accent-600);--p-accent-active-color: var(--p-accent-700);--p-content-border-color: var(--p-surface-200);--p-content-hover-background: var(--p-surface-100);--p-content-hover-color: var(--p-surface-800);--p-highlight-background: var(--p-primary-50);--p-highlight-color: var(--p-primary-700);--p-highlight-focus-background: var(--p-primary-100);--p-highlight-focus-color: var(--p-primary-800);--p-content-background: var(--p-surface-0);--p-text-color: var(--p-surface-700);--p-text-hover-color: var(--p-surface-800);--p-text-muted-color: var(--p-surface-500);--p-text-hover-muted-color: var(--p-surface-600)}@media(prefers-color-scheme:dark){:root:not(.w-theme-light){--p-surface-D: #fff;--p-surface-0: #fff;--p-surface-50: #fafafa;--p-surface-100: #f4f4f5;--p-surface-200: #e4e4e7;--p-surface-300: #d4d4d8;--p-surface-400: #a1a1aa;--p-surface-500: #71717a;--p-surface-600: #545250;--p-surface-700: #403e3c;--p-surface-800: #2b2927;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #1c1a19;--p-surface-950: #0f0e0d;--p-primary: rgb(0, 125, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-primary-color: var(--p-primary-400);--p-primary-contrast-color: var(--p-surface-900);--p-primary-hover-color: var(--p-primary-300);--p-primary-active-color: var(--p-primary-200);--p-secondary-color: var(--p-secondary-400);--p-secondary-contrast-color: var(--p-surface-900);--p-secondary-hover-color: var(--p-secondary-300);--p-secondary-active-color: var(--p-secondary-200);--p-danger-color: var(--p-danger-400);--p-danger-contrast-color: var(--p-surface-900);--p-danger-hover-color: var(--p-danger-300);--p-danger-active-color: var(--p-danger-200);--p-success-color: var(--p-success-400);--p-success-contrast-color: var(--p-surface-900);--p-success-hover-color: var(--p-success-300);--p-success-active-color: var(--p-success-200);--p-warn-color: var(--p-warn-400);--p-warn-contrast-color: var(--p-surface-900);--p-warn-hover-color: var(--p-warn-300);--p-warn-active-color: var(--p-warn-200);--p-info-color: var(--p-info-400);--p-info-contrast-color: var(--p-surface-900);--p-info-hover-color: var(--p-info-300);--p-info-active-color: var(--p-info-200);--p-help-color: var(--p-help-400);--p-help-contrast-color: var(--p-surface-900);--p-help-hover-color: var(--p-help-300);--p-help-active-color: var(--p-help-200);--p-accent-color: var(--p-accent-400);--p-accent-contrast-color: var(--p-surface-900);--p-accent-hover-color: var(--p-accent-300);--p-accent-active-color: var(--p-accent-200);--p-content-border-color: var(--p-surface-700);--p-content-hover-background: var(--p-surface-800);--p-content-hover-color: var(--p-surface-0);--p-highlight-background: color-mix(in srgb, var(--p-primary-400), transparent 84%);--p-highlight-color: rgba(255, 255, 255, 87%);--p-highlight-focus-background: color-mix(in srgb, var(--p-primary-400), transparent 76%);--p-highlight-focus-color: rgba(255, 255, 255, 87%);--p-content-background: var(--p-surface-900);--p-text-color: var(--p-surface-0);--p-text-hover-color: var(--p-surface-0);--p-text-muted-color: var(--p-surface-400);--p-text-hover-muted-color: var(--p-surface-300)}}:root.w-theme-dark,.w-theme-dark{color-scheme:dark;--p-surface-D: #fff;--p-surface-0: #fff;--p-surface-50: #fafafa;--p-surface-100: #f4f4f5;--p-surface-200: #e4e4e7;--p-surface-300: #d4d4d8;--p-surface-400: #a1a1aa;--p-surface-500: #71717a;--p-surface-600: #545250;--p-surface-700: #403e3c;--p-surface-800: #2b2927;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #1c1a19;--p-surface-950: #0f0e0d;--p-primary: rgb(0, 125, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-primary-color: var(--p-primary-400);--p-primary-contrast-color: var(--p-surface-900);--p-primary-hover-color: var(--p-primary-300);--p-primary-active-color: var(--p-primary-200);--p-secondary-color: var(--p-secondary-400);--p-secondary-contrast-color: var(--p-surface-900);--p-secondary-hover-color: var(--p-secondary-300);--p-secondary-active-color: var(--p-secondary-200);--p-danger-color: var(--p-danger-400);--p-danger-contrast-color: var(--p-surface-900);--p-danger-hover-color: var(--p-danger-300);--p-danger-active-color: var(--p-danger-200);--p-success-color: var(--p-success-400);--p-success-contrast-color: var(--p-surface-900);--p-success-hover-color: var(--p-success-300);--p-success-active-color: var(--p-success-200);--p-warn-color: var(--p-warn-400);--p-warn-contrast-color: var(--p-surface-900);--p-warn-hover-color: var(--p-warn-300);--p-warn-active-color: var(--p-warn-200);--p-info-color: var(--p-info-400);--p-info-contrast-color: var(--p-surface-900);--p-info-hover-color: var(--p-info-300);--p-info-active-color: var(--p-info-200);--p-help-color: var(--p-help-400);--p-help-contrast-color: var(--p-surface-900);--p-help-hover-color: var(--p-help-300);--p-help-active-color: var(--p-help-200);--p-accent-color: var(--p-accent-400);--p-accent-contrast-color: var(--p-surface-900);--p-accent-hover-color: var(--p-accent-300);--p-accent-active-color: var(--p-accent-200);--p-content-border-color: var(--p-surface-700);--p-content-hover-background: var(--p-surface-800);--p-content-hover-color: var(--p-surface-0);--p-highlight-background: color-mix(in srgb, var(--p-primary-400), transparent 84%);--p-highlight-color: rgba(255, 255, 255, 87%);--p-highlight-focus-background: color-mix(in srgb, var(--p-primary-400), transparent 76%);--p-highlight-focus-color: rgba(255, 255, 255, 87%);--p-content-background: var(--p-surface-900);--p-text-color: var(--p-surface-0);--p-text-hover-color: var(--p-surface-0);--p-text-muted-color: var(--p-surface-400);--p-text-hover-muted-color: var(--p-surface-300)}:root.w-theme-light,.w-theme-light{color-scheme:light;--p-surface-0: #ffffff;--p-surface-50: #fafafa;--p-surface-100: #f5f5f5;--p-surface-200: #e5e5e5;--p-surface-300: #d4d4d4;--p-surface-400: #a3a3a3;--p-surface-500: #737373;--p-surface-600: #525252;--p-surface-700: #404040;--p-surface-800: #262626;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #171717;--p-surface-950: #0a0a0a;--p-primary: rgb(0, 95, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-primary-color: var(--p-primary-500);--p-primary-contrast-color: var(--p-surface-0);--p-primary-hover-color: var(--p-primary-600);--p-primary-active-color: var(--p-primary-700);--p-secondary-color: var(--p-secondary-500);--p-secondary-contrast-color: var(--p-surface-0);--p-secondary-hover-color: var(--p-secondary-600);--p-secondary-active-color: var(--p-secondary-700);--p-danger-color: var(--p-danger-500);--p-danger-contrast-color: var(--p-surface-0);--p-danger-hover-color: var(--p-danger-600);--p-danger-active-color: var(--p-danger-700);--p-success-color: var(--p-success-500);--p-success-contrast-color: var(--p-surface-0);--p-success-hover-color: var(--p-success-600);--p-success-active-color: var(--p-success-700);--p-warn-color: var(--p-warn-500);--p-warn-contrast-color: var(--p-surface-0);--p-warn-hover-color: var(--p-warn-600);--p-warn-active-color: var(--p-warn-700);--p-info-color: var(--p-info-500);--p-info-contrast-color: var(--p-surface-0);--p-info-hover-color: var(--p-info-600);--p-info-active-color: var(--p-info-700);--p-help-color: var(--p-help-500);--p-help-contrast-color: var(--p-surface-0);--p-help-hover-color: var(--p-help-600);--p-help-active-color: var(--p-help-700);--p-accent-color: var(--p-accent-500);--p-accent-contrast-color: var(--p-surface-0);--p-accent-hover-color: var(--p-accent-600);--p-accent-active-color: var(--p-accent-700);--p-content-border-color: var(--p-surface-200);--p-content-hover-background: var(--p-surface-100);--p-content-hover-color: var(--p-surface-800);--p-highlight-background: var(--p-primary-50);--p-highlight-color: var(--p-primary-700);--p-highlight-focus-background: var(--p-primary-100);--p-highlight-focus-color: var(--p-primary-800);--p-content-background: var(--p-surface-0);--p-text-color: var(--p-surface-700);--p-text-hover-color: var(--p-surface-800);--p-text-muted-color: var(--p-surface-500);--p-text-hover-muted-color: var(--p-surface-600)}:host{--kx-picker-shadow: var(--p-select-overlay-shadow);--kx-picker-option-icon-size: 17px;--kx-picker-option-icon-gap: 10px;--kx-picker-option-stack-gap: 1px;--kx-picker-option-title-size: 13px;--kx-picker-option-title-weight: 600;--kx-picker-option-subtitle-size: 11.5px;--kx-picker-option-subtitle-line-height: 1.4}.kx-ps{width:100%;text-align:start;font:inherit}.anchored-panel>.p-select-overlay.kx-ps-panel{position:static;width:100%;display:flex;flex-direction:column;max-height:var(--anchored-panel-available-height);overflow:hidden}.kx-ps-panel>.p-select-header{flex:none}.kx-ps-options{min-height:0;overflow-y:auto}.kx-ps-options>li{flex:none}.kx-ps-val{display:flex;align-items:center;gap:8px;min-width:0}.kx-ps-val-ico{width:16px;height:16px;color:var(--p-primary-color);flex:none}.kx-ps-val-label{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.kx-ps-ph{color:var(--p-text-muted-color)}.kx-ps-option{gap:var(--kx-picker-option-icon-gap)}.kx-ps-opt-ico{width:var(--kx-picker-option-icon-size);height:var(--kx-picker-option-icon-size);flex:none}.kx-ps-opt-body{flex:1;min-width:0;display:flex;flex-direction:column;gap:var(--kx-picker-option-stack-gap)}.kx-ps-opt-title{font-size:var(--kx-picker-option-title-size);font-weight:var(--kx-picker-option-title-weight);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%}.kx-ps-opt-sub{font-size:var(--kx-picker-option-subtitle-size);line-height:var(--kx-picker-option-subtitle-line-height);color:var(--p-text-muted-color);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%}*,:before,:after{--tw-border-spacing-x: 0;--tw-border-spacing-y: 0;--tw-translate-x: 0;--tw-translate-y: 0;--tw-rotate: 0;--tw-skew-x: 0;--tw-skew-y: 0;--tw-scale-x: 1;--tw-scale-y: 1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness: proximity;--tw-gradient-from-position: ;--tw-gradient-via-position: ;--tw-gradient-to-position: ;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width: 0px;--tw-ring-offset-color: #fff;--tw-ring-color: rgb(59 130 246 / .5);--tw-ring-offset-shadow: 0 0 #0000;--tw-ring-shadow: 0 0 #0000;--tw-shadow: 0 0 #0000;--tw-shadow-colored: 0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: ;--tw-contain-size: ;--tw-contain-layout: ;--tw-contain-paint: ;--tw-contain-style: }::backdrop{--tw-border-spacing-x: 0;--tw-border-spacing-y: 0;--tw-translate-x: 0;--tw-translate-y: 0;--tw-rotate: 0;--tw-skew-x: 0;--tw-skew-y: 0;--tw-scale-x: 1;--tw-scale-y: 1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness: proximity;--tw-gradient-from-position: ;--tw-gradient-via-position: ;--tw-gradient-to-position: ;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width: 0px;--tw-ring-offset-color: #fff;--tw-ring-color: rgb(59 130 246 / .5);--tw-ring-offset-shadow: 0 0 #0000;--tw-ring-shadow: 0 0 #0000;--tw-shadow: 0 0 #0000;--tw-shadow-colored: 0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: ;--tw-contain-size: ;--tw-contain-layout: ;--tw-contain-paint: ;--tw-contain-style: }*,:before,:after{box-sizing:border-box;border-width:0;border-style:solid;border-color:#e5e7eb}:before,:after{--tw-content: ""}html,:host{line-height:1.5;-webkit-text-size-adjust:100%;-moz-tab-size:4;tab-size:4;font-family:ui-sans-serif,system-ui,sans-serif,"Apple Color Emoji","Segoe UI Emoji",Segoe UI Symbol,"Noto Color Emoji";font-feature-settings:normal;font-variation-settings:normal;-webkit-tap-highlight-color:transparent}body{margin:0;line-height:inherit}hr{height:0;color:inherit;border-top-width:1px}abbr:where([title]){text-decoration:underline dotted}h1,h2,h3,h4,h5,h6{font-size:inherit;font-weight:inherit}a{color:inherit;text-decoration:inherit}b,strong{font-weight:bolder}code,kbd,samp,pre{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace;font-feature-settings:normal;font-variation-settings:normal;font-size:1em}small{font-size:80%}sub,sup{font-size:75%;line-height:0;position:relative;vertical-align:baseline}sub{bottom:-.25em}sup{top:-.5em}table{text-indent:0;border-color:inherit;border-collapse:collapse}button,input,optgroup,select,textarea{font-family:inherit;font-feature-settings:inherit;font-variation-settings:inherit;font-size:100%;font-weight:inherit;line-height:inherit;letter-spacing:inherit;color:inherit;margin:0;padding:0}button,select{text-transform:none}button,input:where([type=button]),input:where([type=reset]),input:where([type=submit]){-webkit-appearance:button;background-color:transparent;background-image:none}:-moz-focusring{outline:auto}:-moz-ui-invalid{box-shadow:none}progress{vertical-align:baseline}::-webkit-inner-spin-button,::-webkit-outer-spin-button{height:auto}[type=search]{-webkit-appearance:textfield;outline-offset:-2px}::-webkit-search-decoration{-webkit-appearance:none}::-webkit-file-upload-button{-webkit-appearance:button;font:inherit}summary{display:list-item}blockquote,dl,dd,h1,h2,h3,h4,h5,h6,hr,figure,p,pre{margin:0}fieldset{margin:0;padding:0}legend{padding:0}ol,ul,menu{list-style:none;margin:0;padding:0}dialog{padding:0}textarea{resize:vertical}input::placeholder,textarea::placeholder{opacity:1;color:#9ca3af}button,[role=button]{cursor:pointer}:disabled{cursor:default}img,svg,video,canvas,audio,iframe,embed,object{display:block;vertical-align:middle}img,video{max-width:100%;height:auto}[hidden]:where(:not([hidden=until-found])){display:none}@supports (-moz-appearance:none){*{scrollbar-color:initial;scrollbar-width:initial}}:host{display:block;height:100%;min-height:0}:host>div{height:100%;min-height:0}*,*:before,*:after{box-sizing:border-box}.kx-field{display:flex;flex-direction:column;gap:5px}.kx-field-lbl{font-size:12.5px;font-weight:600;color:var(--p-text-color)}.kx-req{color:var(--p-danger-500)}.kx-input{height:36px;padding:0 10px;font:inherit;font-size:13px;color:var(--p-text-color);background:var(--p-content-background);border:1px solid var(--p-content-border-color);border-radius:8px;transition:border-color .15s;width:100%}.kx-select{width:100%;min-width:0}.kx-check{width:18px;height:18px;accent-color:var(--p-primary-color)}.kx-reconcile-check{display:flex;align-items:center;gap:8px;font-size:13px;color:var(--p-text-color);cursor:pointer}.kx-field-hint{font-size:11.5px;color:var(--p-text-muted-color)}.kx-2p-r-note{margin:0;font-size:12.5px;color:var(--p-text-muted-color)}.kx-alert{margin:0;padding:8px 10px;font-size:12.5px;line-height:1.4;color:var(--p-danger-600, var(--p-danger-500));border-radius:8px;border:1px solid color-mix(in srgb,var(--p-danger-500) 32%,transparent);background:color-mix(in srgb,var(--p-danger-500) 8%,transparent)}@keyframes kx-spin{to{transform:rotate(360deg)}}.kx-flow{display:flex;flex-direction:column;gap:14px;padding:6px 0 0}.kx-actions{display:flex;justify-content:flex-end;gap:10px;padding-top:4px}.kx-pipe,.kx-stage{display:flex;flex-direction:column;gap:8px}.kx-stage-mid{background:transparent}.kx-stage-head{display:flex;align-items:center;gap:8px}.kx-stage-ico{width:26px;height:26px;border-radius:11px;flex:none;display:inline-flex;align-items:center;justify-content:center;background:color-mix(in srgb,var(--p-primary-color) 14%,transparent);color:var(--p-primary-color)}.kx-stage-ico svg{width:15px;height:15px}.kx-stage-lbl{font-size:12px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;color:var(--p-text-muted-color)}.kx-stage-cfg{margin-top:2px}.kx-stage-desc{margin:0;font-size:12px;line-height:1.4;color:var(--p-text-muted-color)}.kx-stage-opts{display:flex;flex-direction:column;gap:6px;margin-top:10px;padding-top:10px;border-top:1px dashed var(--p-content-border-color)}.kx-opts-lbl{font-size:11px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;color:var(--p-text-muted-color)}.kx-pipe-conn{display:flex;align-items:center;justify-content:center;gap:6px;padding:5px 0;color:var(--p-text-muted-color);font-size:11px}.kx-pipe-conn svg{width:16px;height:16px}.kx-runopts{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px}.kx-detect{display:flex;align-items:center;gap:6px;font-size:11.5px;line-height:1.35;padding:7px 9px;border-radius:8px;color:var(--p-success-600, var(--p-success-500));background:color-mix(in srgb,var(--p-success-500) 10%,transparent)}.kx-detect svg{width:14px;height:14px;flex:none}.kx-detect-warn{color:var(--p-warn-600, var(--p-warn-500));background:color-mix(in srgb,var(--p-warn-500) 12%,transparent)}.kx-wcmount{width:100%}.kx-wcmount>div{display:block;width:100%}';
export {
  be as B,
  Ma as C,
  wn as F,
  Ua as K,
  ae as N,
  Ya as P,
  Fa as Q,
  Ka as R,
  I as S,
  Wa as T,
  Ha as U,
  ja as W,
  Qa as _,
  Ra as a,
  Ja as b,
  ue as c,
  N as d,
  wo as e,
  yn as f,
  wt as g,
  Ue as h,
  pe as i,
  ze as j,
  za as k,
  ct as l,
  Q as m,
  Ia as n,
  qa as o,
  Va as p,
  Ga as q,
  Za as s,
  Na as u,
  Da as v,
  Ba as z
};
//# sourceMappingURL=styles-BYuw4XMv.js.map

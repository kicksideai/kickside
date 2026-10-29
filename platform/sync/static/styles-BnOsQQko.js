import { hasInjectionContext as Sr, inject as ft, effectScope as Cr, ref as E, markRaw as Er, createApp as Or, readonly as Tr, getCurrentInstance as bt, onMounted as Yt, nextTick as Oe, watch as B, reactive as Pr, renderSlot as Te, openBlock as T, createBlock as Gt, Teleport as Jt, createCommentVNode as z, h as $r, defineComponent as ge, onBeforeUnmount as Qt, createElementBlock as $, createElementVNode as _, createVNode as j, unref as g, Fragment as me, normalizeClass as Zt, toDisplayString as Y, resolveDynamicComponent as Lr, normalizeStyle as Ar, useId as Nr, computed as P, withCtx as Rr, withDirectives as ct, vModelText as Xt, renderList as wt, createTextVNode as jr, vModelCheckbox as Mr } from "vue";
import { addCollection as Ir, Icon as ie } from "@iconify/vue";
import { config as xt, addIcons as Vr, on as zr, applyThemeMode as Me, host as Dr, hostCss as Hr, loadCss as Br, loadByTagName as Fr, api as nt } from "@wippy-fe/proxy";
var pt = "data-wippy-visible";
function kt(e) {
  const t = e.getAttribute(pt);
  return t === "true" ? !0 : t === "false" ? !1 : null;
}
var Wr = Object.defineProperty, Ur = (e, t, r) => t in e ? Wr(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : e[t] = r, N = (e, t, r) => Ur(e, typeof t != "symbol" ? t + "" : t, r), qr = [
  "themeConfigUrl",
  "primeVueCssUrl",
  "markdownCssUrl",
  "iframeCssUrl"
], Kr = [
  ":where([data-wippy-theme-root]).w-theme-light",
  ":where([data-wippy-theme-root]).w-theme-dark"
].join(`,
`);
function _t(e) {
  const t = e.startsWith("--") ? e : `--${e}`;
  return /^--[-\w\u0080-\uFFFF]+$/.test(t) ? t : null;
}
function Yr(...e) {
  const t = /* @__PURE__ */ new Set();
  for (const r of e)
    if (r)
      for (const [o, n] of Object.entries(r)) {
        if ((o === "@light" || o === "@dark") && n && typeof n == "object") {
          for (const [a, l] of Object.entries(n)) {
            const s = typeof l == "string" ? _t(a) : null;
            s && t.add(s);
          }
          continue;
        }
        const i = typeof n == "string" ? _t(o) : null;
        i && t.add(i);
      }
  return [...t].sort();
}
function Gr(e) {
  if (e.length === 0)
    return "";
  const t = e.map((r) => `  ${r}: inherit;`).join(`
`);
  return `${Kr} {
${t}
}`;
}
function Jr(e, t) {
  const r = Gr(t);
  r && er(e, r, "@wippy-fe/css-variables-bridge");
}
function Qr(e, t) {
  const o = (t ?? qr).map(async (n) => {
    const i = Hr[n];
    if (!i)
      return console.warn(`[wippy-fe/webcomponent-core] hostCss key "${n}" is undefined — skipping. Remove it from hostCssKeys if the CSS was removed.`), null;
    try {
      return await Br(i);
    } catch (a) {
      return console.warn(`[wippy-fe/webcomponent-core] Failed to load hostCss "${n}" (${i}):`, a), null;
    }
  });
  return Promise.all(o).then((n) => {
    for (const i of n) {
      if (!i)
        continue;
      const a = document.createElement("style");
      a.textContent = i, a.setAttribute("role", "@wippy-fe/host-css"), e.appendChild(a);
    }
  });
}
function Zr(e, t) {
  const r = document.createElement("style");
  r.textContent = t, e.appendChild(r);
}
function er(e, t, r) {
  if (typeof CSSStyleSheet < "u" && "replaceSync" in CSSStyleSheet.prototype) {
    const n = new CSSStyleSheet();
    n.replaceSync(t), e.adoptedStyleSheets = [...e.adoptedStyleSheets, n];
    return;
  }
  const o = document.createElement("style");
  o.setAttribute("role", r), o.textContent = t, e.appendChild(o);
}
function Xr(e, t) {
  er(e, t, "@wippy-fe/custom-css");
}
function tr(e) {
  return e.__wippyHost ?? null;
}
function eo(e) {
  return e.replace(/-([a-z])/g, (t, r) => r.toUpperCase());
}
function to(e, t, r) {
  switch (r.type) {
    case "string":
      return { value: t };
    case "number": {
      const o = Number.parseFloat(t);
      return Number.isNaN(o) ? { value: void 0, error: `Invalid ${e}: expected a number` } : { value: o };
    }
    case "integer": {
      const o = Number.parseInt(t, 10);
      return Number.isNaN(o) ? { value: void 0, error: `Invalid ${e}: expected an integer` } : { value: o };
    }
    case "boolean":
      return { value: t !== "false" };
    case "array":
    case "object":
      try {
        const o = JSON.parse(t);
        return r.type === "array" && !Array.isArray(o) ? { value: void 0, error: `Invalid ${e}: expected a JSON array` } : { value: o };
      } catch {
        return { value: void 0, error: `Invalid ${e}: must be valid JSON` };
      }
    default:
      return { value: t };
  }
}
function at(e, t) {
  const r = {}, o = [];
  for (const [n, i] of Object.entries(t.properties)) {
    const a = e.getAttribute(n), l = eo(n);
    if (a === null) {
      i.default !== void 0 && (r[l] = i.default);
      continue;
    }
    const s = to(n, a, i);
    s.error ? o.push(s.error) : r[l] = s.value;
  }
  return { props: r, errors: o };
}
var ro = class {
  constructor(e, t) {
    N(this, "_props"), N(this, "_errors"), N(this, "_content"), N(this, "_hostVisibility"), N(this, "_propsListeners", /* @__PURE__ */ new Set()), N(this, "_contentListeners", /* @__PURE__ */ new Set()), N(this, "_hostVisibilityListeners", /* @__PURE__ */ new Set()), N(this, "_disposed", !1), N(this, "_emitToDom"), N(this, "props"), N(this, "events"), N(this, "content"), N(this, "hostVisibility"), this._props = e.props, this._errors = e.errors, this._content = e.content, this._hostVisibility = e.hostVisibility, this._emitToDom = t;
    const r = this;
    this.props = {
      get value() {
        return r._props;
      },
      get errors() {
        return r._errors;
      },
      subscribe(o, n) {
        return r._subscribeProps(o, n);
      }
    }, this.events = {
      emit(o, n) {
        r._disposed || r._emitToDom(o, n);
      }
    }, this.content = e.hasContent ? {
      get value() {
        return r._content;
      },
      subscribe(o, n) {
        return r._subscribeContent(o, n);
      }
    } : null, this.hostVisibility = {
      get value() {
        return r._hostVisibility;
      },
      subscribe(o, n) {
        return r._subscribeHostVisibility(o, n);
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
}, oo = class extends HTMLElement {
  constructor() {
    super(), N(this, "_internals"), N(this, "_contentObserver", null), N(this, "_initialized", !1), N(this, "_container", null), N(this, "_reactive", null), N(this, "_lastProps", null), N(this, "_lastErrors", []), N(this, "_lastContent", null), N(this, "_themeUnsub", null), N(this, "_hostVisible", null), this._internals = this.attachInternals(), this._hostVisible = kt(this);
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
    return [.../* @__PURE__ */ new Set([...t, ...r, pt])];
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
    return tr(this);
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
      let r, o;
      if (this._lastProps !== null)
        r = this._lastProps, o = this._lastErrors;
      else {
        const i = at(this, e.propsSchema);
        e.validateProps && i.errors.push(...e.validateProps(i.props)), r = i.props, o = i.errors, this._lastProps = r, this._lastErrors = o;
      }
      const n = t ? this._lastContent ?? this._extractContent(e.contentTemplate) : null;
      t && this._lastContent === null && (this._lastContent = n), this._reactive = new ro(
        { props: r, errors: o, content: n, hasContent: t, hostVisibility: this._hostVisible },
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
      let o;
      if (t)
        o = this._container;
      else {
        this.onInit(r), e.inlineCss && Zr(r, e.inlineCss);
        try {
          const c = xt?.theming, p = Yr(
            c?.global?.cssVariables,
            c?.children?.cssVariables
          );
          Jr(r, p);
        } catch {
        }
        if (e.customCss !== !1)
          try {
            const c = xt?.theming, p = [c?.global?.customCSS, c?.children?.customCSS].filter(Boolean).join(`
`);
            p && Xr(r, p);
          } catch {
          }
        (e.hostCssKeys === void 0 || e.hostCssKeys.length > 0) && Qr(r, e.hostCssKeys), o = document.createElement("div"), o.setAttribute("data-wippy-theme-root", "");
        const s = e.containerClasses ?? [];
        s.length > 0 && o.classList.add(...s), r.appendChild(o), this._container = o, Vr(Ir);
      }
      this._applyTheme(), this._themeUnsub || (this._themeUnsub = zr("@theme", (s) => this._applyTheme(s)));
      const { props: n, errors: i } = at(this, e.propsSchema);
      e.validateProps && i.push(...e.validateProps(n));
      const a = n;
      this._lastProps = a, this._lastErrors = i;
      let l = null;
      e.contentTemplate && (l = this._extractContent(e.contentTemplate), this._lastContent = l, this._contentObserver = new MutationObserver(() => {
        const s = this._extractContent(e.contentTemplate);
        this._lastContent = s, this._reactive?.notifyContent(s), this.onContentChanged(s);
      }), this._contentObserver.observe(this, {
        childList: !0,
        characterData: !0,
        subtree: !0
      })), this.onMount(r, o, a, i, l, t), this._internals.states.delete("loading"), this._internals.states.add("ready"), t || (this._initialized = !0), this.onReady(), this.emitEvent("load");
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
  _applyTheme(e = Dr.getThemeMode?.()) {
    Me(e, this), this._container && Me(e, this._container);
  }
  disconnectedCallback() {
    this._themeUnsub && (this._themeUnsub(), this._themeUnsub = null), Me("auto", this), this._container && Me("auto", this._container), this._contentObserver && (this._contentObserver.disconnect(), this._contentObserver = null), this.onUnmount(), this.emitEvent("unload"), this._internals.states.clear(), this._reactive?.dispose(), this._reactive = null, this._lastProps = null, this._lastErrors = [], this._lastContent = null, delete this.__wippyHost, delete this.__wippyHostBus;
  }
  attributeChangedCallback(e, t, r) {
    if (t === r)
      return;
    if (e === pt) {
      const l = this._hostVisible, s = kt(this);
      if (s === l)
        return;
      this._hostVisible = s, this.isConnected && this._initialized && (this._reactive?.notifyHostVisibility(s, l), this.onHostVisibilityChanged(s, l));
      return;
    }
    const o = this.constructor.wippyConfig, { props: n, errors: i } = at(this, o.propsSchema);
    o.validateProps && i.push(...o.validateProps(n));
    const a = n;
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
function no(e) {
  return e.__wippyHostBus ?? null;
}
function ao(e) {
  return e.dataset.wippyPanelId ?? null;
}
/*!
 * pinia v4.0.3
 * (c) 2026 Eduardo San Martin Morote
 * @license MIT
 */
let rr;
const or = (e) => rr = e, io = () => Sr() && ft(nr) || rr, nr = (
  /* istanbul ignore next */
  Symbol()
);
function so() {
  const e = Cr(!0), t = e.run(() => E({}));
  let r = [], o = [];
  const n = Er({
    install(i) {
      or(n), n._a = i, i.provide(nr, n), i.config.globalProperties.$pinia = n, o.forEach((a) => r.push(a)), o = [];
    },
    use(i) {
      return this._a ? r.push(i) : o.push(i), this;
    },
    _p: r,
    _a: null,
    _e: e,
    _s: /* @__PURE__ */ new Map(),
    state: t
  });
  return n;
}
var lo = Object.defineProperty, co = (e, t, r) => t in e ? lo(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : e[t] = r, we = (e, t, r) => co(e, typeof t != "symbol" ? t + "" : t, r), ar = /* @__PURE__ */ Symbol("wippy:emit"), ir = /* @__PURE__ */ Symbol("wippy:props"), po = /* @__PURE__ */ Symbol("wippy:props_error"), uo = /* @__PURE__ */ Symbol("wippy:content"), ho = /* @__PURE__ */ Symbol("wippy:panel-id"), mo = /* @__PURE__ */ Symbol("wippy:layout-bus"), fo = /* @__PURE__ */ Symbol("wippy:host"), vo = /* @__PURE__ */ Symbol("wippy:host-visibility");
function Ma() {
  const e = ft(ir);
  if (!e)
    throw new Error("useProps() must be called inside a WippyVueElement");
  return e;
}
function Ia() {
  const e = ft(ar);
  if (!e)
    throw new Error("useEvents() must be called inside a WippyVueElement");
  return e;
}
var Va = class extends oo {
  constructor() {
    super(...arguments), we(this, "_vueApp", null), we(this, "_propsRef", E({})), we(this, "_errorsRef", E([])), we(this, "_contentRef", E(null)), we(this, "_hostVisibilityRef", E(null)), we(this, "_bridgeAbort", null);
  }
  /**
   * Override to provide Vue-specific configuration.
   */
  static get vueConfig() {
    throw new Error("WippyVueElement subclass must override static get vueConfig()");
  }
  onMount(e, t, r, o, n, i) {
    const a = this.constructor.vueConfig;
    this._propsRef.value = r, this._errorsRef.value = o, this._contentRef.value = n ?? null, this._hostVisibilityRef.value = this.hostVisible;
    for (const c of o)
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
      const p = io(), u = Or(c.rootComponent);
      this._vueApp = u;
      const d = so();
      if (c.piniaPlugins)
        for (const h of c.piniaPlugins)
          d.use(h);
      if (u.use(d), c.plugins)
        for (const h of c.plugins)
          u.use(h);
      u.provide(ir, this._propsRef), u.provide(po, this._errorsRef), u.provide(ar, this.emitEvent.bind(this)), u.provide(uo, this._contentRef), u.provide(vo, this._hostVisibilityRef), u.provide(ho, ao(this)), u.provide(mo, no(this)), u.provide(fo, tr(this)), c.providers && c.providers(u, this), u.mount(t), p && or(p);
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
}, go = Object.defineProperty, St = Object.getOwnPropertySymbols, yo = Object.prototype.hasOwnProperty, bo = Object.prototype.propertyIsEnumerable, Ct = (e, t, r) => t in e ? go(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : e[t] = r, wo = (e, t) => {
  for (var r in t || (t = {})) yo.call(t, r) && Ct(e, r, t[r]);
  if (St) for (var r of St(t)) bo.call(t, r) && Ct(e, r, t[r]);
  return e;
};
function vt(e) {
  return e == null || e === "" || Array.isArray(e) && e.length === 0 || !(e instanceof Date) && typeof e == "object" && Object.keys(e).length === 0;
}
function xo(e) {
  return typeof e == "function" && "call" in e && "apply" in e;
}
function R(e) {
  return !vt(e);
}
function de(e, t = !0) {
  return e instanceof Object && e.constructor === Object && (t || Object.keys(e).length !== 0);
}
function sr(e = {}, t = {}) {
  let r = wo({}, e);
  return Object.keys(t).forEach((o) => {
    let n = o;
    de(t[n]) && n in e && de(e[n]) ? r[n] = sr(e[n], t[n]) : r[n] = t[n];
  }), r;
}
function ko(...e) {
  return e.reduce((t, r, o) => o === 0 ? r : sr(t, r), {});
}
function X(e, ...t) {
  return xo(e) ? e(...t) : e;
}
function he(e, t = !0) {
  return typeof e == "string" && (t || e !== "");
}
function Et(e) {
  return he(e) ? e.replace(/(-|_)/g, "").toLowerCase() : e;
}
function _o(e, t = "", r = {}) {
  let o = Et(t).split("."), n = o.shift();
  if (n) {
    if (de(e)) {
      let i = Object.keys(e).find((a) => Et(a) === n) || "";
      return _o(X(e[i], r), o.join("."), r);
    }
    return;
  }
  return X(e, r);
}
function za(e, t = !0) {
  return Array.isArray(e) && (t || e.length !== 0);
}
function So(e) {
  return R(e) && !isNaN(e);
}
function fe(e, t) {
  if (t) {
    let r = t.test(e);
    return t.lastIndex = 0, r;
  }
  return !1;
}
function Co(...e) {
  return ko(...e);
}
function Ee(e) {
  return e && e.replace(/\/\*(?:(?!\*\/)[\s\S])*\*\/|[\r\n\t]+/g, "").replace(/ {2,}/g, " ").replace(/ ([{:}]) /g, "$1").replace(/([;,]) /g, "$1").replace(/ !/g, "!").replace(/: /g, ":").trim();
}
function Da(e) {
  return he(e, !1) ? e[0].toUpperCase() + e.slice(1) : e;
}
function lr(e) {
  return he(e) ? e.replace(/(_)/g, "-").replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase() : e;
}
function cr() {
  let e = /* @__PURE__ */ new Map();
  return { on(t, r) {
    let o = e.get(t);
    return o ? o.push(r) : o = [r], e.set(t, o), this;
  }, off(t, r) {
    let o = e.get(t);
    return o && o.splice(o.indexOf(r) >>> 0, 1), this;
  }, emit(t, r) {
    let o = e.get(t);
    o && o.forEach((n) => {
      n(r);
    });
  }, clear() {
    e.clear();
  } };
}
function Eo(e, t) {
  return e ? e.classList ? e.classList.contains(t) : new RegExp("(^| )" + t + "( |$)", "gi").test(e.className) : !1;
}
function Ha(e, t) {
  if (e && t) {
    let r = (o) => {
      Eo(e, o) || (e.classList ? e.classList.add(o) : e.className += " " + o);
    };
    [t].flat().filter(Boolean).forEach((o) => o.split(" ").forEach(r));
  }
}
function Ba(e, t) {
  if (e && t) {
    let r = (o) => {
      e.classList ? e.classList.remove(o) : e.className = e.className.replace(new RegExp("(^|\\b)" + o.split(" ").join("|") + "(\\b|$)", "gi"), " ");
    };
    [t].flat().filter(Boolean).forEach((o) => o.split(" ").forEach(r));
  }
}
function Ot(e) {
  return e ? Math.abs(e.scrollLeft) : 0;
}
function Fa(e, t) {
  return e instanceof HTMLElement ? e.offsetWidth : 0;
}
function Oo(e) {
  if (e) {
    let t = e.parentNode;
    return t && t instanceof ShadowRoot && t.host && (t = t.host), t;
  }
  return null;
}
function To(e) {
  return !!(e !== null && typeof e < "u" && e.nodeName && Oo(e));
}
function qe(e) {
  return typeof Element < "u" ? e instanceof Element : e !== null && typeof e == "object" && e.nodeType === 1 && typeof e.nodeName == "string";
}
function Be(e, t = {}) {
  if (qe(e)) {
    let r = (o, n) => {
      var i, a;
      let l = (i = e?.$attrs) != null && i[o] ? [(a = e?.$attrs) == null ? void 0 : a[o]] : [];
      return [n].flat().reduce((s, c) => {
        if (c != null) {
          let p = typeof c;
          if (p === "string" || p === "number") s.push(c);
          else if (p === "object") {
            let u = Array.isArray(c) ? r(o, c) : Object.entries(c).map(([d, h]) => o === "style" && (h || h === 0) ? `${d.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase()}:${h}` : h ? d : void 0);
            s = u.length ? s.concat(u.filter((d) => !!d)) : s;
          }
        }
        return s;
      }, l);
    };
    Object.entries(t).forEach(([o, n]) => {
      if (n != null) {
        let i = o.match(/^on(.+)/);
        i ? e.addEventListener(i[1].toLowerCase(), n) : o === "p-bind" || o === "pBind" ? Be(e, n) : (n = o === "class" ? [...new Set(r("class", n))].join(" ").trim() : o === "style" ? r("style", n).join(";").trim() : n, (e.$attrs = e.$attrs || {}) && (e.$attrs[o] = n), e.setAttribute(o, n));
      }
    });
  }
}
function Wa(e, t = {}, ...r) {
  {
    let o = document.createElement(e);
    return Be(o, t), o.append(...r), o;
  }
}
function Ua(e, t) {
  return qe(e) ? e.matches(t) ? e : e.querySelector(t) : null;
}
function qa(e, t) {
  if (qe(e)) {
    let r = e.getAttribute(t);
    return isNaN(r) ? r === "true" || r === "false" ? r === "true" : r : +r;
  }
}
function Ka(e) {
  if (e) {
    let t = e.offsetHeight, r = getComputedStyle(e);
    return t -= parseFloat(r.paddingTop) + parseFloat(r.paddingBottom) + parseFloat(r.borderTopWidth) + parseFloat(r.borderBottomWidth), t;
  }
  return 0;
}
function Ya(e) {
  if (e) {
    let t = e.getBoundingClientRect();
    return { top: t.top + (window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0), left: t.left + (window.pageXOffset || Ot(document.documentElement) || Ot(document.body) || 0) };
  }
  return { top: "auto", left: "auto" };
}
function Ga(e, t) {
  return e ? e.offsetHeight : 0;
}
function Ja(e) {
  if (e) {
    let t = e.offsetWidth, r = getComputedStyle(e);
    return t -= parseFloat(r.paddingLeft) + parseFloat(r.paddingRight) + parseFloat(r.borderLeftWidth) + parseFloat(r.borderRightWidth), t;
  }
  return 0;
}
function pr() {
  return !!(typeof window < "u" && window.document && window.document.createElement);
}
function Po(e, t = "", r) {
  qe(e) && r !== null && r !== void 0 && e.setAttribute(t, r);
}
var $o = Object.defineProperty, Lo = Object.defineProperties, Ao = Object.getOwnPropertyDescriptors, Fe = Object.getOwnPropertySymbols, ur = Object.prototype.hasOwnProperty, dr = Object.prototype.propertyIsEnumerable, Tt = (e, t, r) => t in e ? $o(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : e[t] = r, G = (e, t) => {
  for (var r in t || (t = {})) ur.call(t, r) && Tt(e, r, t[r]);
  if (Fe) for (var r of Fe(t)) dr.call(t, r) && Tt(e, r, t[r]);
  return e;
}, it = (e, t) => Lo(e, Ao(t)), ne = (e, t) => {
  var r = {};
  for (var o in e) ur.call(e, o) && t.indexOf(o) < 0 && (r[o] = e[o]);
  if (e != null && Fe) for (var o of Fe(e)) t.indexOf(o) < 0 && dr.call(e, o) && (r[o] = e[o]);
  return r;
}, No = cr(), ae = No, Pe = /{([^}]*)}/g, hr = /(\d+\s+[\+\-\*\/]\s+\d+)/g, mr = /var\([^)]+\)/g;
function Pt(e) {
  return he(e) ? e.replace(/[A-Z]/g, (t, r) => r === 0 ? t : "." + t.toLowerCase()).toLowerCase() : e;
}
function Ro(e) {
  return de(e) && e.hasOwnProperty("$value") && e.hasOwnProperty("$type") ? e.$value : e;
}
function jo(e) {
  return e.replaceAll(/ /g, "").replace(/[^\w]/g, "-");
}
function ut(e = "", t = "") {
  return jo(`${he(e, !1) && he(t, !1) ? `${e}-` : e}${t}`);
}
function fr(e = "", t = "") {
  return `--${ut(e, t)}`;
}
function Mo(e = "") {
  let t = (e.match(/{/g) || []).length, r = (e.match(/}/g) || []).length;
  return (t + r) % 2 !== 0;
}
function vr(e, t = "", r = "", o = [], n) {
  if (he(e)) {
    let i = e.trim();
    if (Mo(i)) return;
    if (fe(i, Pe)) {
      let a = i.replaceAll(Pe, (l) => {
        let s = l.replace(/{|}/g, "").split(".").filter((c) => !o.some((p) => fe(c, p)));
        return `var(${fr(r, lr(s.join("-")))}${R(n) ? `, ${n}` : ""})`;
      });
      return fe(a.replace(mr, "0"), hr) ? `calc(${a})` : a;
    }
    return i;
  } else if (So(e)) return e;
}
function Io(e, t, r) {
  he(t, !1) && e.push(`${t}:${r};`);
}
function ke(e, t) {
  return e ? `${e}{${t}}` : "";
}
function gr(e, t) {
  if (e.indexOf("dt(") === -1) return e;
  function r(a, l) {
    let s = [], c = 0, p = "", u = null, d = 0;
    for (; c <= a.length; ) {
      let h = a[c];
      if ((h === '"' || h === "'" || h === "`") && a[c - 1] !== "\\" && (u = u === h ? null : h), !u && (h === "(" && d++, h === ")" && d--, (h === "," || c === a.length) && d === 0)) {
        let x = p.trim();
        x.startsWith("dt(") ? s.push(gr(x, l)) : s.push(o(x)), p = "", c++;
        continue;
      }
      h !== void 0 && (p += h), c++;
    }
    return s;
  }
  function o(a) {
    let l = a[0];
    if ((l === '"' || l === "'" || l === "`") && a[a.length - 1] === l) return a.slice(1, -1);
    let s = Number(a);
    return isNaN(s) ? a : s;
  }
  let n = [], i = [];
  for (let a = 0; a < e.length; a++) if (e[a] === "d" && e.slice(a, a + 3) === "dt(") i.push(a), a += 2;
  else if (e[a] === ")" && i.length > 0) {
    let l = i.pop();
    i.length === 0 && n.push([l, a]);
  }
  if (!n.length) return e;
  for (let a = n.length - 1; a >= 0; a--) {
    let [l, s] = n[a], c = e.slice(l + 3, s), p = r(c, t), u = t(...p);
    e = e.slice(0, l) + u + e.slice(s + 1);
  }
  return e;
}
var ve = (...e) => Vo(V.getTheme(), ...e), Vo = (e = {}, t, r, o) => {
  if (t) {
    let { variable: n, options: i } = V.defaults || {}, { prefix: a, transform: l } = e?.options || i || {}, s = fe(t, Pe) ? t : `{${t}}`;
    return o === "value" || vt(o) && l === "strict" ? V.getTokenValue(t) : vr(s, void 0, a, [n.excludedKeyRegex], r);
  }
  return "";
};
function Ie(e, ...t) {
  if (e instanceof Array) {
    let r = e.reduce((o, n, i) => {
      var a;
      return o + n + ((a = X(t[i], { dt: ve })) != null ? a : "");
    }, "");
    return gr(r, ve);
  }
  return X(e, { dt: ve });
}
function zo(e, t = {}) {
  let r = V.defaults.variable, { prefix: o = r.prefix, selector: n = r.selector, excludedKeyRegex: i = r.excludedKeyRegex } = t, a = [], l = [], s = [{ node: e, path: o }];
  for (; s.length; ) {
    let { node: p, path: u } = s.pop();
    for (let d in p) {
      let h = p[d], x = Ro(h), y = fe(d, i) ? ut(u) : ut(u, lr(d));
      if (de(x)) s.push({ node: x, path: y });
      else {
        let m = fr(y), b = vr(x, y, o, [i]);
        Io(l, m, b);
        let w = y;
        o && w.startsWith(o + "-") && (w = w.slice(o.length + 1)), a.push(w.replace(/-/g, "."));
      }
    }
  }
  let c = l.join("");
  return { value: l, tokens: a, declarations: c, css: ke(n, c) };
}
var K = { regex: { rules: { class: { pattern: /^\.([a-zA-Z][\w-]*)$/, resolve(e) {
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
    var o;
    return (o = t.map((n) => n.resolve(r)).find((n) => n.matched)) != null ? o : this.rules.custom.resolve(r);
  });
} }, _toVariables(e, t) {
  return zo(e, { prefix: t?.prefix });
}, getCommon({ name: e = "", theme: t = {}, params: r, set: o, defaults: n }) {
  var i, a, l, s, c, p, u;
  let { preset: d, options: h } = t, x, y, m, b, w, k, A;
  if (R(d) && h.transform !== "strict") {
    let { primitive: v, semantic: O, extend: S } = d, L = O || {}, { colorScheme: D } = L, ee = ne(L, ["colorScheme"]), J = S || {}, { colorScheme: Q } = J, te = ne(J, ["colorScheme"]), M = D || {}, { dark: re } = M, se = ne(M, ["dark"]), F = Q || {}, { dark: le } = F, ce = ne(F, ["dark"]), W = R(v) ? this._toVariables({ primitive: v }, h) : {}, H = R(ee) ? this._toVariables({ semantic: ee }, h) : {}, Z = R(se) ? this._toVariables({ light: se }, h) : {}, ye = R(re) ? this._toVariables({ dark: re }, h) : {}, oe = R(te) ? this._toVariables({ semantic: te }, h) : {}, Ne = R(ce) ? this._toVariables({ light: ce }, h) : {}, Re = R(le) ? this._toVariables({ dark: le }, h) : {}, [Ke, Ye] = [(i = W.declarations) != null ? i : "", W.tokens], [Ge, Je] = [(a = H.declarations) != null ? a : "", H.tokens || []], [Qe, Ze] = [(l = Z.declarations) != null ? l : "", Z.tokens || []], [Xe, et] = [(s = ye.declarations) != null ? s : "", ye.tokens || []], [f, C] = [(c = oe.declarations) != null ? c : "", oe.tokens || []], [pe, ue] = [(p = Ne.declarations) != null ? p : "", Ne.tokens || []], [U, Se] = [(u = Re.declarations) != null ? u : "", Re.tokens || []];
    x = this.transformCSS(e, Ke, "light", "variable", h, o, n), y = Ye;
    let je = this.transformCSS(e, `${Ge}${Qe}`, "light", "variable", h, o, n), tt = this.transformCSS(e, `${Xe}`, "dark", "variable", h, o, n);
    m = `${je}${tt}`, b = [.../* @__PURE__ */ new Set([...Je, ...Ze, ...et])];
    let q = this.transformCSS(e, `${f}${pe}color-scheme:light`, "light", "variable", h, o, n), rt = this.transformCSS(e, `${U}color-scheme:dark`, "dark", "variable", h, o, n);
    w = `${q}${rt}`, k = [.../* @__PURE__ */ new Set([...C, ...ue, ...Se])], A = X(d.css, { dt: ve });
  }
  return { primitive: { css: x, tokens: y }, semantic: { css: m, tokens: b }, global: { css: w, tokens: k }, style: A };
}, getPreset({ name: e = "", preset: t = {}, options: r, params: o, set: n, defaults: i, selector: a }) {
  var l, s, c;
  let p, u, d;
  if (R(t) && r.transform !== "strict") {
    let h = e.replace("-directive", ""), x = t, { colorScheme: y, extend: m, css: b } = x, w = ne(x, ["colorScheme", "extend", "css"]), k = m || {}, { colorScheme: A } = k, v = ne(k, ["colorScheme"]), O = y || {}, { dark: S } = O, L = ne(O, ["dark"]), D = A || {}, { dark: ee } = D, J = ne(D, ["dark"]), Q = R(w) ? this._toVariables({ [h]: G(G({}, w), v) }, r) : {}, te = R(L) ? this._toVariables({ [h]: G(G({}, L), J) }, r) : {}, M = R(S) ? this._toVariables({ [h]: G(G({}, S), ee) }, r) : {}, [re, se] = [(l = Q.declarations) != null ? l : "", Q.tokens || []], [F, le] = [(s = te.declarations) != null ? s : "", te.tokens || []], [ce, W] = [(c = M.declarations) != null ? c : "", M.tokens || []], H = this.transformCSS(h, `${re}${F}`, "light", "variable", r, n, i, a), Z = this.transformCSS(h, ce, "dark", "variable", r, n, i, a);
    p = `${H}${Z}`, u = [.../* @__PURE__ */ new Set([...se, ...le, ...W])], d = X(b, { dt: ve });
  }
  return { css: p, tokens: u, style: d };
}, getPresetC({ name: e = "", theme: t = {}, params: r, set: o, defaults: n }) {
  var i;
  let { preset: a, options: l } = t, s = (i = a?.components) == null ? void 0 : i[e];
  return this.getPreset({ name: e, preset: s, options: l, params: r, set: o, defaults: n });
}, getPresetD({ name: e = "", theme: t = {}, params: r, set: o, defaults: n }) {
  var i, a;
  let l = e.replace("-directive", ""), { preset: s, options: c } = t, p = ((i = s?.components) == null ? void 0 : i[l]) || ((a = s?.directives) == null ? void 0 : a[l]);
  return this.getPreset({ name: l, preset: p, options: c, params: r, set: o, defaults: n });
}, applyDarkColorScheme(e) {
  return !(e.darkModeSelector === "none" || e.darkModeSelector === !1);
}, getColorSchemeOption(e, t) {
  var r;
  return this.applyDarkColorScheme(e) ? this.regex.resolve(e.darkModeSelector === !0 ? t.options.darkModeSelector : (r = e.darkModeSelector) != null ? r : t.options.darkModeSelector) : [];
}, getLayerOrder(e, t = {}, r, o) {
  let { cssLayer: n } = t;
  return n ? `@layer ${X(n.order || n.name || "primeui", r)}` : "";
}, getCommonStyleSheet({ name: e = "", theme: t = {}, params: r, props: o = {}, set: n, defaults: i }) {
  let a = this.getCommon({ name: e, theme: t, params: r, set: n, defaults: i }), l = Object.entries(o).reduce((s, [c, p]) => s.push(`${c}="${p}"`) && s, []).join(" ");
  return Object.entries(a || {}).reduce((s, [c, p]) => {
    if (de(p) && Object.hasOwn(p, "css")) {
      let u = Ee(p.css), d = `${c}-variables`;
      s.push(`<style type="text/css" data-primevue-style-id="${d}" ${l}>${u}</style>`);
    }
    return s;
  }, []).join("");
}, getStyleSheet({ name: e = "", theme: t = {}, params: r, props: o = {}, set: n, defaults: i }) {
  var a;
  let l = { name: e, theme: t, params: r, set: n, defaults: i }, s = (a = e.includes("-directive") ? this.getPresetD(l) : this.getPresetC(l)) == null ? void 0 : a.css, c = Object.entries(o).reduce((p, [u, d]) => p.push(`${u}="${d}"`) && p, []).join(" ");
  return s ? `<style type="text/css" data-primevue-style-id="${e}-variables" ${c}>${Ee(s)}</style>` : "";
}, createTokens(e = {}, t, r = "", o = "", n = {}) {
  let i = function(l, s = {}, c = []) {
    if (c.includes(this.path)) return console.warn(`Circular reference detected at ${this.path}`), { colorScheme: l, path: this.path, paths: s, value: void 0 };
    c.push(this.path), s.name = this.path, s.binding || (s.binding = {});
    let p = this.value;
    if (typeof this.value == "string" && Pe.test(this.value)) {
      let u = this.value.trim().replace(Pe, (d) => {
        var h;
        let x = d.slice(1, -1), y = this.tokens[x];
        if (!y) return console.warn(`Token not found for path: ${x}`), "__UNRESOLVED__";
        let m = y.computed(l, s, c);
        return Array.isArray(m) && m.length === 2 ? `light-dark(${m[0].value},${m[1].value})` : (h = m?.value) != null ? h : "__UNRESOLVED__";
      });
      p = hr.test(u.replace(mr, "0")) ? `calc(${u})` : u;
    }
    return vt(s.binding) && delete s.binding, c.pop(), { colorScheme: l, path: this.path, paths: s, value: p.includes("__UNRESOLVED__") ? void 0 : p };
  }, a = (l, s, c) => {
    Object.entries(l).forEach(([p, u]) => {
      let d = fe(p, t.variable.excludedKeyRegex) ? s : s ? `${s}.${Pt(p)}` : Pt(p), h = c ? `${c}.${p}` : p;
      de(u) ? a(u, d, h) : (n[d] || (n[d] = { paths: [], computed: (x, y = {}, m = []) => {
        if (n[d].paths.length === 1) return n[d].paths[0].computed(n[d].paths[0].scheme, y.binding, m);
        if (x && x !== "none") for (let b = 0; b < n[d].paths.length; b++) {
          let w = n[d].paths[b];
          if (w.scheme === x) return w.computed(x, y.binding, m);
        }
        return n[d].paths.map((b) => b.computed(b.scheme, y[b.scheme], m));
      } }), n[d].paths.push({ path: h, value: u, scheme: h.includes("colorScheme.light") ? "light" : h.includes("colorScheme.dark") ? "dark" : "none", computed: i, tokens: n }));
    });
  };
  return a(e, r, o), n;
}, getTokenValue(e, t, r) {
  var o;
  let n = ((l) => l.split(".").filter((s) => !fe(s.toLowerCase(), r.variable.excludedKeyRegex)).join("."))(t), i = t.includes("colorScheme.light") ? "light" : t.includes("colorScheme.dark") ? "dark" : void 0, a = [(o = e[n]) == null ? void 0 : o.computed(i)].flat().filter((l) => l);
  return a.length === 1 ? a[0].value : a.reduce((l = {}, s) => {
    let c = s, { colorScheme: p } = c, u = ne(c, ["colorScheme"]);
    return l[p] = u, l;
  }, void 0);
}, getSelectorRule(e, t, r, o) {
  return r === "class" || r === "attr" ? ke(R(t) ? `${e}${t},${e} ${t}` : e, o) : ke(e, ke(t ?? ":root,:host", o));
}, transformCSS(e, t, r, o, n = {}, i, a, l) {
  if (R(t)) {
    let { cssLayer: s } = n;
    if (o !== "style") {
      let c = this.getColorSchemeOption(n, a);
      t = r === "dark" ? c.reduce((p, { type: u, selector: d }) => (R(d) && (p += d.includes("[CSS]") ? d.replace("[CSS]", t) : this.getSelectorRule(d, l, u, t)), p), "") : ke(l ?? ":root,:host", t);
    }
    if (s) {
      let c = { name: "primeui" };
      de(s) && (c.name = X(s.name, { name: e, type: o })), R(c.name) && (t = ke(`@layer ${c.name}`, t), i?.layerNames(c.name));
    }
    return t;
  }
  return "";
} }, V = { defaults: { variable: { prefix: "p", selector: ":root,:host", excludedKeyRegex: /^(primitive|semantic|components|directives|variables|colorscheme|light|dark|common|root|states|extend|css)$/gi }, options: { prefix: "p", darkModeSelector: "system", cssLayer: !1 } }, _theme: void 0, _layerNames: /* @__PURE__ */ new Set(), _loadedStyleNames: /* @__PURE__ */ new Set(), _loadingStyles: /* @__PURE__ */ new Set(), _tokens: {}, update(e = {}) {
  let { theme: t } = e;
  t && (this._theme = it(G({}, t), { options: G(G({}, this.defaults.options), t.options) }), this._tokens = K.createTokens(this.preset, this.defaults), this.clearLoadedStyleNames());
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
  this._theme = it(G({}, this.theme), { preset: e }), this._tokens = K.createTokens(e, this.defaults), this.clearLoadedStyleNames(), ae.emit("preset:change", e), ae.emit("theme:change", this.theme);
}, getOptions() {
  return this.options;
}, setOptions(e) {
  this._theme = it(G({}, this.theme), { options: e }), this.clearLoadedStyleNames(), ae.emit("options:change", e), ae.emit("theme:change", this.theme);
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
  return K.getTokenValue(this.tokens, e, this.defaults);
}, getCommon(e = "", t) {
  return K.getCommon({ name: e, theme: this.theme, params: t, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } });
}, getComponent(e = "", t) {
  let r = { name: e, theme: this.theme, params: t, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } };
  return K.getPresetC(r);
}, getDirective(e = "", t) {
  let r = { name: e, theme: this.theme, params: t, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } };
  return K.getPresetD(r);
}, getCustomPreset(e = "", t, r, o) {
  let n = { name: e, preset: t, options: this.options, selector: r, params: o, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } };
  return K.getPreset(n);
}, getLayerOrderCSS(e = "") {
  return K.getLayerOrder(e, this.options, { names: this.getLayerNames() }, this.defaults);
}, transformCSS(e = "", t, r = "style", o) {
  return K.transformCSS(e, t, o, r, this.options, { layerNames: this.setLayerNames.bind(this) }, this.defaults);
}, getCommonStyleSheet(e = "", t, r = {}) {
  return K.getCommonStyleSheet({ name: e, theme: this.theme, params: t, props: r, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } });
}, getStyleSheet(e, t, r = {}) {
  return K.getStyleSheet({ name: e, theme: this.theme, params: t, props: r, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } });
}, onStyleMounted(e) {
  this._loadingStyles.add(e);
}, onStyleUpdated(e) {
  this._loadingStyles.add(e);
}, onStyleLoaded(e, { name: t }) {
  this._loadingStyles.size && (this._loadingStyles.delete(t), ae.emit(`theme:${t}:load`, e), !this._loadingStyles.size && ae.emit("theme:load"));
} }, I = {
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
}, Do = `
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
function $e(e) {
  "@babel/helpers - typeof";
  return $e = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, $e(e);
}
function $t(e, t) {
  var r = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(e);
    t && (o = o.filter(function(n) {
      return Object.getOwnPropertyDescriptor(e, n).enumerable;
    })), r.push.apply(r, o);
  }
  return r;
}
function Lt(e) {
  for (var t = 1; t < arguments.length; t++) {
    var r = arguments[t] != null ? arguments[t] : {};
    t % 2 ? $t(Object(r), !0).forEach(function(o) {
      Ho(e, o, r[o]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(r)) : $t(Object(r)).forEach(function(o) {
      Object.defineProperty(e, o, Object.getOwnPropertyDescriptor(r, o));
    });
  }
  return e;
}
function Ho(e, t, r) {
  return (t = Bo(t)) in e ? Object.defineProperty(e, t, { value: r, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = r, e;
}
function Bo(e) {
  var t = Fo(e, "string");
  return $e(t) == "symbol" ? t : t + "";
}
function Fo(e, t) {
  if ($e(e) != "object" || !e) return e;
  var r = e[Symbol.toPrimitive];
  if (r !== void 0) {
    var o = r.call(e, t);
    if ($e(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
function Wo(e) {
  var t = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0;
  bt() && bt().components ? Yt(e) : t ? e() : Oe(e);
}
var Uo = 0;
function qo(e) {
  var t = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, r = E(!1), o = E(e), n = E(null), i = pr() ? window.document : void 0, a = t.document, l = a === void 0 ? i : a, s = t.immediate, c = s === void 0 ? !0 : s, p = t.manual, u = p === void 0 ? !1 : p, d = t.name, h = d === void 0 ? "style_".concat(++Uo) : d, x = t.id, y = x === void 0 ? void 0 : x, m = t.media, b = m === void 0 ? void 0 : m, w = t.nonce, k = w === void 0 ? void 0 : w, A = t.first, v = A === void 0 ? !1 : A, O = t.onMounted, S = O === void 0 ? void 0 : O, L = t.onUpdated, D = L === void 0 ? void 0 : L, ee = t.onLoad, J = ee === void 0 ? void 0 : ee, Q = t.props, te = Q === void 0 ? {} : Q, M = function() {
  }, re = function(le) {
    var ce = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    if (l) {
      var W = Lt(Lt({}, te), ce), H = W.name || h, Z = W.id || y, ye = W.nonce || k;
      n.value = l.querySelector('style[data-primevue-style-id="'.concat(H, '"]')) || l.getElementById(Z) || l.createElement("style"), n.value.isConnected || (o.value = le || e, Be(n.value, {
        type: "text/css",
        id: Z,
        media: b,
        nonce: ye
      }), v ? l.head.prepend(n.value) : l.head.appendChild(n.value), Po(n.value, "data-primevue-style-id", H), Be(n.value, W), n.value.onload = function(oe) {
        return J?.(oe, {
          name: H
        });
      }, S?.(H)), !r.value && (M = B(o, function(oe) {
        n.value.textContent = oe, D?.(H);
      }, {
        immediate: !0
      }), r.value = !0);
    }
  }, se = function() {
    !l || !r.value || (M(), To(n.value) && l.head.removeChild(n.value), r.value = !1, n.value = null);
  };
  return c && !u && Wo(re), {
    id: y,
    name: h,
    el: n,
    css: o,
    unload: se,
    load: re,
    isLoaded: Tr(r)
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
var At, Nt, Rt, jt;
function Mt(e, t) {
  return Jo(e) || Go(e, t) || Yo(e, t) || Ko();
}
function Ko() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Yo(e, t) {
  if (e) {
    if (typeof e == "string") return It(e, t);
    var r = {}.toString.call(e).slice(8, -1);
    return r === "Object" && e.constructor && (r = e.constructor.name), r === "Map" || r === "Set" ? Array.from(e) : r === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r) ? It(e, t) : void 0;
  }
}
function It(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var r = 0, o = Array(t); r < t; r++) o[r] = e[r];
  return o;
}
function Go(e, t) {
  var r = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (r != null) {
    var o, n, i, a, l = [], s = !0, c = !1;
    try {
      if (i = (r = r.call(e)).next, t !== 0) for (; !(s = (o = i.call(r)).done) && (l.push(o.value), l.length !== t); s = !0) ;
    } catch (p) {
      c = !0, n = p;
    } finally {
      try {
        if (!s && r.return != null && (a = r.return(), Object(a) !== a)) return;
      } finally {
        if (c) throw n;
      }
    }
    return l;
  }
}
function Jo(e) {
  if (Array.isArray(e)) return e;
}
function Vt(e, t) {
  var r = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(e);
    t && (o = o.filter(function(n) {
      return Object.getOwnPropertyDescriptor(e, n).enumerable;
    })), r.push.apply(r, o);
  }
  return r;
}
function st(e) {
  for (var t = 1; t < arguments.length; t++) {
    var r = arguments[t] != null ? arguments[t] : {};
    t % 2 ? Vt(Object(r), !0).forEach(function(o) {
      Qo(e, o, r[o]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(r)) : Vt(Object(r)).forEach(function(o) {
      Object.defineProperty(e, o, Object.getOwnPropertyDescriptor(r, o));
    });
  }
  return e;
}
function Qo(e, t, r) {
  return (t = Zo(t)) in e ? Object.defineProperty(e, t, { value: r, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = r, e;
}
function Zo(e) {
  var t = Xo(e, "string");
  return Le(t) == "symbol" ? t : t + "";
}
function Xo(e, t) {
  if (Le(e) != "object" || !e) return e;
  var r = e[Symbol.toPrimitive];
  if (r !== void 0) {
    var o = r.call(e, t);
    if (Le(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
function Ve(e, t) {
  return t || (t = e.slice(0)), Object.freeze(Object.defineProperties(e, { raw: { value: Object.freeze(t) } }));
}
var en = function(t) {
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
}, tn = {}, rn = {}, xe = {
  name: "base",
  css: en,
  style: Do,
  classes: tn,
  inlineStyles: rn,
  load: function(t) {
    var r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, o = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : function(i) {
      return i;
    }, n = o(Ie(At || (At = Ve(["", ""])), t));
    return R(n) ? qo(Ee(n), st({
      name: this.name
    }, r)) : {};
  },
  loadCSS: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    return this.load(this.css, t);
  },
  loadStyle: function() {
    var t = this, r = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, o = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "";
    return this.load(this.style, r, function() {
      var n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "";
      return V.transformCSS(r.name || t.name, "".concat(n).concat(Ie(Nt || (Nt = Ve(["", ""])), o)));
    });
  },
  getCommonTheme: function(t) {
    return V.getCommon(this.name, t);
  },
  getComponentTheme: function(t) {
    return V.getComponent(this.name, t);
  },
  getDirectiveTheme: function(t) {
    return V.getDirective(this.name, t);
  },
  getPresetTheme: function(t, r, o) {
    return V.getCustomPreset(this.name, t, r, o);
  },
  getLayerOrderThemeCSS: function() {
    return V.getLayerOrderCSS(this.name);
  },
  getStyleSheet: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    if (this.css) {
      var o = X(this.css, {
        dt: ve
      }) || "", n = Ee(Ie(Rt || (Rt = Ve(["", "", ""])), o, t)), i = Object.entries(r).reduce(function(a, l) {
        var s = Mt(l, 2), c = s[0], p = s[1];
        return a.push("".concat(c, '="').concat(p, '"')) && a;
      }, []).join(" ");
      return R(n) ? '<style type="text/css" data-primevue-style-id="'.concat(this.name, '" ').concat(i, ">").concat(n, "</style>") : "";
    }
    return "";
  },
  getCommonThemeStyleSheet: function(t) {
    var r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    return V.getCommonStyleSheet(this.name, t, r);
  },
  getThemeStyleSheet: function(t) {
    var r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, o = [V.getStyleSheet(this.name, t, r)];
    if (this.style) {
      var n = this.name === "base" ? "global-style" : "".concat(this.name, "-style"), i = Ie(jt || (jt = Ve(["", ""])), X(this.style, {
        dt: ve
      })), a = Ee(V.transformCSS(n, i)), l = Object.entries(r).reduce(function(s, c) {
        var p = Mt(c, 2), u = p[0], d = p[1];
        return s.push("".concat(u, '="').concat(d, '"')) && s;
      }, []).join(" ");
      R(a) && o.push('<style type="text/css" data-primevue-style-id="'.concat(n, '" ').concat(l, ">").concat(a, "</style>"));
    }
    return o.join("");
  },
  extend: function(t) {
    return st(st({}, this), {}, {
      css: void 0,
      style: void 0
    }, t);
  }
}, ze = cr();
function Ae(e) {
  "@babel/helpers - typeof";
  return Ae = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, Ae(e);
}
function zt(e, t) {
  var r = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(e);
    t && (o = o.filter(function(n) {
      return Object.getOwnPropertyDescriptor(e, n).enumerable;
    })), r.push.apply(r, o);
  }
  return r;
}
function De(e) {
  for (var t = 1; t < arguments.length; t++) {
    var r = arguments[t] != null ? arguments[t] : {};
    t % 2 ? zt(Object(r), !0).forEach(function(o) {
      on(e, o, r[o]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(r)) : zt(Object(r)).forEach(function(o) {
      Object.defineProperty(e, o, Object.getOwnPropertyDescriptor(r, o));
    });
  }
  return e;
}
function on(e, t, r) {
  return (t = nn(t)) in e ? Object.defineProperty(e, t, { value: r, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = r, e;
}
function nn(e) {
  var t = an(e, "string");
  return Ae(t) == "symbol" ? t : t + "";
}
function an(e, t) {
  if (Ae(e) != "object" || !e) return e;
  var r = e[Symbol.toPrimitive];
  if (r !== void 0) {
    var o = r.call(e, t);
    if (Ae(o) != "object") return o;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var sn = {
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
    text: [I.STARTS_WITH, I.CONTAINS, I.NOT_CONTAINS, I.ENDS_WITH, I.EQUALS, I.NOT_EQUALS],
    numeric: [I.EQUALS, I.NOT_EQUALS, I.LESS_THAN, I.LESS_THAN_OR_EQUAL_TO, I.GREATER_THAN, I.GREATER_THAN_OR_EQUAL_TO],
    date: [I.DATE_IS, I.DATE_IS_NOT, I.DATE_BEFORE, I.DATE_AFTER]
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
}, ln = Symbol();
function cn(e, t) {
  var r = {
    config: Pr(t)
  };
  return e.config.globalProperties.$primevue = r, e.provide(ln, r), pn(), un(e, r), r;
}
var _e = [];
function pn() {
  ae.clear(), _e.forEach(function(e) {
    return e?.();
  }), _e = [];
}
function un(e, t) {
  var r = E(!1), o = function() {
    var c;
    if (((c = t.config) === null || c === void 0 ? void 0 : c.theme) !== "none" && !V.isStyleNameLoaded("common")) {
      var p, u, d = ((p = xe.getCommonTheme) === null || p === void 0 ? void 0 : p.call(xe)) || {}, h = d.primitive, x = d.semantic, y = d.global, m = d.style, b = {
        nonce: (u = t.config) === null || u === void 0 || (u = u.csp) === null || u === void 0 ? void 0 : u.nonce
      };
      xe.load(h?.css, De({
        name: "primitive-variables"
      }, b)), xe.load(x?.css, De({
        name: "semantic-variables"
      }, b)), xe.load(y?.css, De({
        name: "global-variables"
      }, b)), xe.loadStyle(De({
        name: "global-style"
      }, b), m), V.setLoadedStyleName("common");
    }
  };
  ae.on("theme:change", function(s) {
    r.value || (e.config.globalProperties.$primevue.config.theme = s, r.value = !0);
  });
  var n = B(t.config, function(s, c) {
    ze.emit("config:change", {
      newValue: s,
      oldValue: c
    });
  }, {
    immediate: !0,
    deep: !0
  }), i = B(function() {
    return t.config.ripple;
  }, function(s, c) {
    ze.emit("config:ripple:change", {
      newValue: s,
      oldValue: c
    });
  }, {
    immediate: !0,
    deep: !0
  }), a = B(function() {
    return t.config.theme;
  }, function(s, c) {
    r.value || V.setTheme(s), t.config.unstyled || o(), r.value = !1, ze.emit("config:theme:change", {
      newValue: s,
      oldValue: c
    });
  }, {
    immediate: !0,
    deep: !1
  }), l = B(function() {
    return t.config.unstyled;
  }, function(s, c) {
    !s && t.config.theme && o(), ze.emit("config:unstyled:change", {
      newValue: s,
      oldValue: c
    });
  }, {
    immediate: !0,
    deep: !0
  });
  _e.push(n), _e.push(i), _e.push(a), _e.push(l);
}
var dn = {
  install: function(t, r) {
    var o = Co(sn, r);
    cn(t, o);
  }
}, yr = {
  data: function() {
    return {
      mounted: !1
    };
  },
  mounted: function() {
    this.mounted = pr();
  },
  computed: {
    inline: function() {
      return this.disabled || this.appendTo === "self";
    }
  }
};
function hn(e, t, r, o, n, i) {
  return i.inline ? Te(e.$slots, "default", {
    key: 0
  }) : n.mounted ? (T(), Gt(Jt, {
    key: 1,
    to: r.appendTo
  }, [Te(e.$slots, "default")], 8, ["to"])) : z("", !0);
}
yr.render = hn;
const mn = "data-wippy-overlay-layer";
function br() {
  return typeof window < "u" && typeof window.document < "u";
}
function wr() {
  return br() && typeof HTMLElement < "u" && Object.hasOwn(HTMLElement.prototype, "popover");
}
function fn() {
  return wr() && typeof CSS < "u" && typeof CSS.supports == "function" && CSS.supports("anchor-name: --a") && CSS.supports("position-area", "bottom span-right") && CSS.supports("position-try-fallbacks", "flip-block") && CSS.supports("min-width", "min(anchor-size(width), 100vw)") && CSS.supports("max-width", "stretch");
}
const vn = /\bp-(?:select|multiselect|treeselect|cascadeselect)-overlay\b/;
let gn = 0;
const We = /* @__PURE__ */ new WeakMap();
function Dt(e, t) {
  const r = e.style;
  r.setProperty("position", "fixed", "important"), r.setProperty("inset", "auto", "important"), r.setProperty("margin", "0", "important"), r.setProperty("position-anchor", t), r.setProperty("position-area", "bottom span-right"), r.setProperty("position-try-fallbacks", "flip-block, flip-inline, flip-block flip-inline"), r.setProperty("min-width", "min(anchor-size(width), 100vw)", "important"), r.setProperty("max-width", "stretch", "important");
}
function yn(e, t) {
  if (!vn.test(e.className))
    return;
  const r = e.style.cssText;
  Dt(e, t), e.getAttribute("popover") !== "manual" && e.setAttribute("popover", "manual");
  try {
    e.matches(":popover-open") || e.showPopover();
  } catch {
  }
  if (!e.matches(":popover-open")) {
    e.removeAttribute("popover"), e.style.cssText = r;
    return;
  }
  if (!We.has(e)) {
    const o = new MutationObserver(() => {
      const n = e.style;
      (n.top !== "auto" || n.left !== "auto" || n.margin !== "0px" || n.getPropertyPriority("top") !== "important" || n.getPropertyPriority("left") !== "important" || n.getPropertyPriority("margin") !== "important" || n.getPropertyPriority("min-width") !== "important" || n.maxWidth !== "stretch" || n.getPropertyPriority("max-width") !== "important") && Dt(e, t);
    });
    o.observe(e, { attributes: !0, attributeFilter: ["style"] }), We.set(e, o);
  }
}
function gt(e) {
  const t = We.get(e);
  t && (t.disconnect(), We.delete(e));
}
function bn(e) {
  const t = e && typeof e.getRootNode == "function" ? e.getRootNode() : null;
  return t instanceof ShadowRoot ? t : null;
}
function dt(e) {
  e.style.top = "0px", e.style.left = "0px";
  const t = e.getBoundingClientRect();
  e.style.top = `${-window.scrollY - t.top}px`, e.style.left = `${-window.scrollX - t.left}px`;
}
const Ue = /* @__PURE__ */ new Set(), yt = /* @__PURE__ */ new WeakMap();
let Ht = !1, ht = !1;
function wn() {
  ht = !1;
  for (const e of Ue) {
    if (!e.isConnected) {
      for (const t of Array.from(e.children))
        t instanceof HTMLElement && gt(t);
      Ue.delete(e), yt.get(e)?.disconnect();
      continue;
    }
    e.childElementCount > 0 && dt(e);
  }
}
function Bt() {
  ht || (ht = !0, requestAnimationFrame(wn));
}
function xn(e) {
  const t = document.createElement("div");
  t.setAttribute(mn, "");
  const r = wr();
  if (t.style.cssText = r ? "position:fixed;width:0 !important;height:0 !important;margin:0 !important;border:0 !important;padding:0 !important;background:transparent !important;color:inherit !important;overflow:visible !important;" : "position:fixed;top:0;left:0;width:0;height:0;", r && t.setAttribute("popover", "manual"), e.appendChild(t), r) {
    try {
      t.showPopover();
    } catch {
    }
    t.matches(":popover-open") || (t.removeAttribute("popover"), t.style.cssText = "position:fixed;top:0;left:0;width:0;height:0;");
  }
  dt(t);
  const o = new MutationObserver((n) => {
    const i = t.__wippyAnchorName;
    for (const a of n) {
      if (i)
        for (const l of Array.from(a.addedNodes))
          l instanceof HTMLElement && yn(l, i);
      for (const l of Array.from(a.removedNodes))
        l instanceof HTMLElement && gt(l);
    }
    t.isConnected && t.childElementCount > 0 && dt(t);
  });
  return o.observe(t, { childList: !0 }), yt.set(t, o), Ue.add(t), Ht || (Ht = !0, window.addEventListener("scroll", Bt, { capture: !0, passive: !0 }), window.addEventListener("resize", Bt, { passive: !0 })), t;
}
function Ft(e) {
  if (!(!e.hostRoot || e.layer) && (e.layer = xn(e.hostRoot), fn())) {
    const t = e.$el ? e.$el.parentElement : null;
    t && (e.anchorName = `--wippy-a-${++gn}`, e.anchorTrigger = t, t.style.setProperty("anchor-name", e.anchorName), e.layer.__wippyAnchorName = e.anchorName);
  }
}
function Wt(e) {
  if (e.anchorTrigger && (e.anchorTrigger.style.removeProperty("anchor-name"), e.anchorTrigger = null), e.anchorName = null, e.layer) {
    for (const t of Array.from(e.layer.children))
      t instanceof HTMLElement && gt(t);
    Ue.delete(e.layer), yt.get(e.layer)?.disconnect(), e.layer.remove(), e.layer = null;
  }
}
let Ut = !1;
function kn() {
  if (Ut)
    return;
  Ut = !0;
  const e = yr;
  e.computed = e.computed || {}, e.computed.inline = function() {
    return !!this.disabled || this.appendTo === "self";
  }, e.computed.resolvedTarget = function() {
    return this.appendTo == null || this.appendTo === "body" ? this.hostRoot ? this.layer : document.body : this.appendTo;
  }, e.data = function() {
    return { mounted: !1, hostRoot: null, layer: null, anchorName: null, anchorTrigger: null };
  }, e.mounted = function() {
    br() && (this.hostRoot = bn(this.$el), this.mounted = !0, this.hostRoot && (this.inline || Ft(this), this.$watch("inline", (t) => {
      t ? Wt(this) : Ft(this);
    })));
  }, e.render = function() {
    return this.inline ? Te(this.$slots, "default", { key: 0 }) : this.mounted ? $r(Jt, { key: 1, to: this.resolvedTarget || document.body }, [
      Te(this.$slots, "default")
    ]) : z("", !0);
  }, e.unmounted = function() {
    Wt(this);
  };
}
const Qa = {
  install: (e) => {
    kn(), e.use(dn, { theme: "none" });
  }
};
function lt(e, t) {
  if (e && typeof e == "object") {
    const r = e, o = r.response?.data?.error;
    if (typeof o == "string") return o;
    if (o && typeof o == "object" && typeof o.message == "string")
      return o.message;
    if (typeof r.message == "string" && r.message) return r.message;
  }
  return t;
}
const _n = { class: "kx-wcmount" }, Sn = {
  key: 0,
  class: "kx-wcmount-fail",
  role: "alert"
}, Cn = /* @__PURE__ */ ge({
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
    const r = e, o = t, n = E(null), i = E(!1);
    let a = null, l = 0;
    const s = /* @__PURE__ */ new Set();
    function c(v) {
      v.composedPath()[0] === a && (v.stopPropagation(), o("change", v.detail));
    }
    function p(v) {
      return v.composedPath()[0] !== a ? !1 : (v.stopPropagation(), !0);
    }
    function u(v) {
      p(v) && o("select", v.detail);
    }
    function d(v) {
      p(v) && o("created", v.detail);
    }
    function h(v) {
      p(v) && o("close", v.detail);
    }
    function x(v) {
      p(v) && o("error", v.detail);
    }
    function y(v) {
      if (typeof v == "string") return v;
      try {
        return JSON.stringify(v ?? {});
      } catch {
        return null;
      }
    }
    function m() {
      if (!a) return;
      const v = y(r.config);
      if (v !== null && a.setAttribute("config", v), r.schema !== void 0 && r.schema !== null) {
        const S = y(r.schema);
        S !== null && a.setAttribute("schema", S);
      }
      if (r.meta !== void 0 && r.meta !== null) {
        const S = y(r.meta);
        S !== null && a.setAttribute("meta", S);
      }
      r.provider && a.setAttribute("provider", r.provider), r.label && a.setAttribute("label", r.label);
      const O = r.attrs || {};
      for (const S of [...s])
        (!(S in O) || O[S] == null) && (a.removeAttribute(S), s.delete(S));
      for (const [S, L] of Object.entries(O)) {
        if (L == null) continue;
        const D = typeof L == "object" ? y(L) : String(L);
        D !== null && (a.setAttribute(S, D), s.add(S));
      }
    }
    function b(v = a) {
      v && (v.removeEventListener("config-changed", c), v.removeEventListener("change", c), v.removeEventListener("select", u), v.removeEventListener("created", d), v.removeEventListener("close", h), v.removeEventListener("error", x), v === a && (a = null), s.clear());
    }
    async function w(v) {
      if (!customElements.get(v))
        try {
          await Fr(v, { timeoutMs: 8e3 });
        } catch {
        }
    }
    async function k() {
      const v = ++l, O = n.value, S = r.tag;
      if (i.value = !1, !!O && (b(), O.innerHTML = "", !!S))
        try {
          if (await w(S), v !== l || n.value !== O || r.tag !== S) return;
          const L = document.createElement(S);
          L.classList.add("kx-wcmount-surface"), a = L, m(), L.addEventListener("config-changed", c), L.addEventListener("change", c), L.addEventListener("select", u), L.addEventListener("created", d), L.addEventListener("close", h), L.addEventListener("error", x), L.style.display = "block", O.appendChild(L), i.value = !customElements.get(S);
        } catch {
          v === l && (i.value = !0);
        }
    }
    async function A() {
      i.value = !1, await Oe(), await k();
    }
    return Yt(k), B(() => r.tag, k), B(() => [r.config, r.schema, r.meta, r.provider, r.label, r.attrs], m, { deep: !0 }), Qt(() => {
      l += 1, b();
    }), (v, O) => (T(), $("div", _n, [
      i.value ? (T(), $("div", Sn, [
        O[0] || (O[0] = _("span", null, "This setup panel couldn’t load.", -1)),
        _("button", {
          type: "button",
          onClick: A
        }, "Try again")
      ])) : (T(), $("div", {
        key: 1,
        ref_key: "host",
        ref: n
      }, null, 512))
    ]));
  }
}), En = (e, t) => {
  const r = e.__vccOpts || e;
  for (const [o, n] of t)
    r[o] = n;
  return r;
}, mt = /* @__PURE__ */ En(Cn, [["__scopeId", "data-v-3d6a00f1"]]), On = { class: "kx-stage" }, Tn = { class: "kx-stage-head" }, Pn = { class: "kx-stage-ico" }, $n = {
  class: "kx-stage-cfg",
  "data-test": "pl-trigger"
}, Ln = "kickside-trigger-config", An = /* @__PURE__ */ ge({
  __name: "SyncCreateSource",
  props: {
    icon: {},
    seed: {},
    editing: { type: Boolean }
  },
  emits: ["change"],
  setup(e, { emit: t }) {
    const r = e, o = t;
    function n(i) {
      o("change", i);
    }
    return (i, a) => (T(), $("div", On, [
      _("div", Tn, [
        _("span", Pn, [
          j(g(ie), {
            icon: r.icon,
            "aria-hidden": "true"
          }, null, 8, ["icon"])
        ]),
        a[0] || (a[0] = _("span", { class: "kx-stage-lbl" }, "Source", -1))
      ]),
      _("div", $n, [
        j(mt, {
          tag: Ln,
          attrs: { allowed: "source", reconfigure: r.editing ? "true" : null, value: r.seed },
          onChange: n
        }, null, 8, ["attrs"])
      ])
    ]));
  }
}), Nn = { class: "kx-stage kx-stage-mid" }, Rn = { class: "kx-stage-head" }, jn = { class: "kx-stage-ico" }, Mn = {
  key: 0,
  class: "kx-stage-desc",
  "data-test": "pl-transform-hint"
}, In = {
  key: 1,
  class: "kx-stage-desc",
  role: "alert"
}, Vn = "kickside-transform-assist", zn = /* @__PURE__ */ ge({
  __name: "SyncCreateTransform",
  props: {
    canAssist: { type: Boolean },
    detected: {},
    transform: {},
    samples: {},
    sampleError: {},
    sourceSchema: {},
    sinkSchema: {},
    inputShape: {},
    hint: {},
    value: {},
    generationPolicy: {}
  },
  emits: ["transform-confirmed"],
  setup(e, { emit: t }) {
    const r = e, o = t;
    function n(i) {
      o("transform-confirmed", i);
    }
    return (i, a) => (T(), $("div", Nn, [
      _("div", Rn, [
        _("span", jn, [
          j(g(ie), {
            icon: "tabler:transform",
            "aria-hidden": "true"
          })
        ]),
        a[0] || (a[0] = _("span", { class: "kx-stage-lbl" }, "Transform", -1))
      ]),
      r.canAssist ? (T(), $(me, { key: 1 }, [
        r.detected && (!r.transform || r.transform.kind === "none") ? (T(), $("div", {
          key: 0,
          class: Zt(["kx-detect", r.detected.needed && "kx-detect-warn"])
        }, [
          j(g(ie), {
            icon: r.detected.needed ? "tabler:alert-triangle" : "tabler:circle-check",
            "aria-hidden": "true"
          }, null, 8, ["icon"]),
          _("span", null, Y(r.detected.reason), 1)
        ], 2)) : z("", !0),
        r.sampleError ? (T(), $("p", In, Y(r.sampleError), 1)) : z("", !0),
        (T(), Gt(Lr(Vn), {
          "data-test": "pl-transform",
          samples: r.samples,
          "source-schema": r.sourceSchema,
          "sink-schema": r.sinkSchema,
          "input-shape": r.inputShape,
          hint: r.hint,
          value: r.value,
          "generation-policy": r.generationPolicy,
          onTransformConfirmed: n
        }, null, 40, ["samples", "source-schema", "sink-schema", "input-shape", "hint", "value", "generation-policy"]))
      ], 64)) : (T(), $("p", Mn, "Pick a source and destination to define the transform."))
    ]));
  }
}), Dn = 2e3;
function qt(e) {
  const t = e.margin ?? 8, r = e.gap ?? 4, o = Math.max(0, e.viewportWidth), n = Math.max(0, e.viewportHeight), i = Math.max(0, o - t * 2), a = Math.min(Math.max(0, e.requestedWidth), i), l = e.align === "right" ? e.anchor.right - a : e.anchor.left, s = Math.max(t, Math.min(l, o - t - a)), c = Math.max(0, n - e.anchor.bottom - r - t), p = Math.max(0, e.anchor.top - r - t), u = c < e.requestedMaxHeight && p > c ? "above" : "below", d = u === "above" ? p : c, h = Math.round(Math.min(Math.max(0, e.requestedMaxHeight), d)), x = Math.min(Math.max(0, e.panelHeight ?? h), h), y = u === "above" ? e.anchor.top - r - x : e.anchor.bottom + r, m = e.containingBlockOrigin ?? { left: 0, top: 0 };
  return {
    left: Math.round(s - m.left),
    width: Math.round(a),
    maxHeight: h,
    side: u,
    top: Math.round(y - m.top)
  };
}
const Hn = /* @__PURE__ */ ge({
  __name: "AnchoredPanel",
  props: {
    open: { type: Boolean },
    anchor: {},
    align: { default: "left" },
    width: { default: "anchor" },
    minWidth: { default: 0 },
    maxHeight: { default: 340 },
    gap: { default: 4 },
    zIndex: { default: Dn }
  },
  emits: ["update:open"],
  setup(e, { emit: t }) {
    const r = e, o = t, n = E(null), i = E({ position: "fixed", visibility: "hidden" });
    function a() {
      const y = r.anchor, m = n.value;
      if (!y || !m) return;
      const b = y.getBoundingClientRect(), w = r.width === "anchor" ? Math.max(r.minWidth, b.width) : Math.max(r.minWidth, r.width), k = {
        anchor: b,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
        requestedWidth: w,
        requestedMaxHeight: r.maxHeight,
        align: r.align,
        gap: r.gap
      }, A = qt(k);
      Object.assign(m.style, {
        position: "fixed",
        left: "0px",
        top: "0px",
        right: "auto",
        bottom: "auto",
        width: `${A.width}px`,
        maxHeight: `${A.maxHeight}px`,
        visibility: "hidden"
      });
      const v = m.getBoundingClientRect(), O = qt({
        ...k,
        containingBlockOrigin: { left: v.left, top: v.top },
        panelHeight: v.height
      }), S = {
        position: "fixed",
        left: `${O.left}px`,
        top: `${O.top}px`,
        width: `${O.width}px`,
        maxHeight: `${O.maxHeight}px`,
        "--anchored-panel-available-height": `${O.maxHeight}px`,
        margin: "0",
        zIndex: String(r.zIndex),
        visibility: "visible"
      };
      i.value = S;
    }
    let l = null, s = !1;
    function c() {
      s || !r.open || (s = !0, requestAnimationFrame(() => {
        s = !1, r.open && a();
      }));
    }
    function p() {
      typeof ResizeObserver > "u" || (l = new ResizeObserver(c), n.value && l.observe(n.value), r.anchor && l.observe(r.anchor));
    }
    function u() {
      l?.disconnect(), l = null, s = !1;
    }
    B(() => r.open, async (y) => {
      u(), y && (i.value = { position: "fixed", visibility: "hidden" }, await Oe(), a(), p());
    }, { immediate: !0 });
    function d(y) {
      if (!r.open) return;
      const m = y.composedPath();
      n.value && m.includes(n.value) || r.anchor && m.includes(r.anchor) || o("update:open", !1);
    }
    function h(y) {
      r.open && y.key === "Escape" && o("update:open", !1);
    }
    function x() {
      r.open && a();
    }
    return document.addEventListener("click", d), document.addEventListener("keydown", h), window.addEventListener("resize", x), window.addEventListener("scroll", x, !0), Qt(() => {
      u(), document.removeEventListener("click", d), document.removeEventListener("keydown", h), window.removeEventListener("resize", x), window.removeEventListener("scroll", x, !0);
    }), (y, m) => e.open ? (T(), $("div", {
      key: 0,
      ref_key: "panel",
      ref: n,
      class: "anchored-panel",
      style: Ar(i.value)
    }, [
      Te(y.$slots, "default")
    ], 4)) : z("", !0);
  }
}), Bn = ["aria-expanded", "aria-controls", "aria-label", "disabled"], Fn = { class: "p-select-label" }, Wn = {
  key: 0,
  class: "kx-ps-val"
}, Un = { class: "kx-ps-val-label" }, qn = {
  key: 1,
  class: "kx-ps-ph"
}, Kn = { class: "p-select-dropdown" }, Yn = { class: "p-select-overlay kx-ps-panel" }, Gn = { class: "p-select-header" }, Jn = ["aria-label", "aria-controls", "aria-activedescendant"], Qn = ["id", "aria-label"], Zn = {
  class: "p-select-option-group",
  role: "presentation"
}, Xn = ["id", "aria-selected", "onClick", "onMousemove"], ea = { class: "kx-ps-opt-body" }, ta = { class: "kx-ps-opt-title" }, ra = {
  key: 0,
  class: "kx-ps-opt-sub"
}, oa = {
  key: 0,
  class: "p-select-empty-message",
  role: "status"
}, na = {
  key: 1,
  class: "p-select-empty-message",
  role: "presentation"
}, aa = {
  key: 0,
  class: "p-select-empty-message",
  role: "alert"
}, ia = ["disabled"], sa = /* @__PURE__ */ ge({
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
    const r = e, o = t, n = E(null), i = E(null), a = E(!1), l = E(""), s = E(0), c = Nr(), p = P(() => {
      const m = l.value.trim().toLowerCase(), b = /* @__PURE__ */ new Map();
      for (const k of r.items) {
        if (!r.remote && m && ![k.title, k.subtitle, k.id, k.group].some((O) => O?.toLowerCase().includes(m))) continue;
        const A = k.group || "Other", v = b.get(A);
        v ? v.push(k) : b.set(A, [k]);
      }
      let w = 0;
      return [...b.entries()].sort((k, A) => k[0].localeCompare(A[0])).map(([k, A]) => ({ group: k, items: A.map((v) => ({ item: v, index: w++ })) }));
    }), u = P(() => p.value.flatMap((m) => m.items)), d = P(() => r.items.find((m) => m.id === r.modelValue)), h = P(() => u.value[s.value] ? `${c}-${s.value}` : void 0);
    B(l, () => {
      s.value = 0;
    }), B([a, l], ([m, b]) => {
      m && r.remote && o("search", b);
    }), B(() => r.disabled, (m) => {
      m && (a.value = !1);
    }), B(a, async (m) => {
      if (!m) {
        n.value?.focus();
        return;
      }
      l.value = "", s.value = Math.max(0, u.value.findIndex(({ item: b }) => b.id === r.modelValue)), await Oe(), i.value?.focus();
    });
    function x(m) {
      r.disabled || r.loading || (o("update:modelValue", m.id), a.value = !1);
    }
    async function y(m) {
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
        k && x(k.item);
        return;
      }
      const b = u.value.length - 1;
      s.value = m.key === "Home" ? 0 : m.key === "End" ? b : Math.max(0, Math.min(b, s.value + (m.key === "ArrowDown" ? 1 : -1))), await Oe(), n.value?.getRootNode()?.querySelector(`[id="${h.value}"]`)?.scrollIntoView({ block: "nearest" });
    }
    return (m, b) => (T(), $(me, null, [
      _("button", {
        ref_key: "anchor",
        ref: n,
        type: "button",
        class: "kx-ps p-select",
        role: "combobox",
        "aria-haspopup": "listbox",
        "aria-expanded": a.value,
        "aria-controls": g(c),
        "aria-label": e.ariaLabel,
        disabled: e.disabled,
        onClick: b[0] || (b[0] = (w) => a.value = !a.value),
        onKeydown: y
      }, [
        _("span", Fn, [
          d.value ? (T(), $("span", Wn, [
            j(g(ie), {
              icon: d.value.icon || "tabler:point",
              class: "kx-ps-val-ico",
              "aria-hidden": "true"
            }, null, 8, ["icon"]),
            _("span", Un, Y(d.value.title), 1)
          ])) : (T(), $("span", qn, Y(e.placeholder || "Select…"), 1))
        ]),
        _("span", Kn, [
          j(g(ie), {
            icon: "tabler:chevron-down",
            "aria-hidden": "true"
          })
        ])
      ], 40, Bn),
      j(Hn, {
        open: a.value,
        "onUpdate:open": b[3] || (b[3] = (w) => a.value = w),
        anchor: n.value
      }, {
        default: Rr(() => [
          _("div", Yn, [
            _("div", Gn, [
              ct(_("input", {
                ref_key: "search",
                ref: i,
                "onUpdate:modelValue": b[1] || (b[1] = (w) => l.value = w),
                type: "search",
                class: "p-inputtext p-select-filter",
                "aria-label": `Search ${e.ariaLabel || e.placeholder || "options"}`,
                "aria-controls": g(c),
                "aria-activedescendant": h.value,
                onKeydown: y
              }, null, 40, Jn), [
                [Xt, l.value]
              ])
            ]),
            _("ul", {
              id: g(c),
              class: "p-select-list kx-ps-options",
              role: "listbox",
              "aria-label": e.ariaLabel || e.placeholder || "Options"
            }, [
              (T(!0), $(me, null, wt(p.value, (w) => (T(), $(me, {
                key: w.group
              }, [
                _("li", Zn, Y(w.group), 1),
                (T(!0), $(me, null, wt(w.items, ({ item: k, index: A }) => (T(), $("li", {
                  id: `${g(c)}-${A}`,
                  key: k.id,
                  class: Zt(["p-select-option kx-ps-option", { "p-select-option-selected": k.id === e.modelValue, "p-focus": A === s.value }]),
                  role: "option",
                  "aria-selected": k.id === e.modelValue,
                  onClick: (v) => x(k),
                  onMousemove: (v) => s.value = A
                }, [
                  j(g(ie), {
                    icon: k.icon || "tabler:point",
                    class: "kx-ps-opt-ico",
                    "aria-hidden": "true"
                  }, null, 8, ["icon"]),
                  _("span", ea, [
                    _("span", ta, Y(k.title), 1),
                    k.subtitle ? (T(), $("span", ra, Y(k.subtitle), 1)) : z("", !0)
                  ])
                ], 42, Xn))), 128))
              ], 64))), 128)),
              e.loading ? (T(), $("li", oa, "Loading…")) : !u.value.length && !e.error ? (T(), $("li", na, "No matches")) : z("", !0)
            ], 8, Qn),
            e.error ? (T(), $("div", aa, Y(e.error), 1)) : z("", !0),
            e.more ? (T(), $("button", {
              key: 1,
              type: "button",
              class: "p-button p-button-secondary",
              "data-testid": "picker-more",
              disabled: e.loading || e.disabled,
              onClick: b[2] || (b[2] = (w) => o("more"))
            }, "Load more", 8, ia)) : z("", !0)
          ])
        ]),
        _: 1
      }, 8, ["open", "anchor"])
    ], 64));
  }
}), la = { class: "kx-stage" }, ca = { class: "kx-stage-head" }, pa = { class: "kx-stage-ico" }, ua = {
  key: 0,
  class: "kx-stage-desc"
}, da = {
  key: 0,
  class: "kx-stage-desc"
}, ha = { class: "kx-stage-cfg" }, ma = {
  key: 0,
  class: "kx-stage-opts"
}, fa = /* @__PURE__ */ ge({
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
    const r = e, o = t;
    function n(i) {
      i && typeof i == "object" && o("update:config", i);
    }
    return (i, a) => (T(), $("div", la, [
      _("div", ca, [
        _("span", pa, [
          j(g(ie), {
            icon: r.selectedSink?.icon || "tabler:database",
            "aria-hidden": "true"
          }, null, 8, ["icon"])
        ]),
        a[1] || (a[1] = _("span", { class: "kx-stage-lbl" }, "Destination", -1))
      ]),
      j(sa, {
        items: r.items,
        "model-value": r.sinkId,
        disabled: r.editing,
        placeholder: "Pick a destination…",
        "onUpdate:modelValue": a[0] || (a[0] = (l) => o("update:sinkId", l))
      }, null, 8, ["items", "model-value", "disabled"]),
      r.editing ? (T(), $("p", ua, Y(r.lockedHint), 1)) : z("", !0),
      r.selectedSink && !r.editing ? (T(), $(me, { key: 1 }, [
        r.selectedSink.description ? (T(), $("p", da, Y(r.selectedSink.description), 1)) : z("", !0),
        _("div", ha, [
          j(mt, {
            tag: r.configTag,
            schema: r.configSchema,
            config: r.config,
            meta: r.pickerMeta,
            provider: r.selectedSink.provider,
            onChange: n
          }, null, 8, ["tag", "schema", "config", "meta", "provider"]),
          r.hasOptions ? (T(), $("div", ma, [
            a[2] || (a[2] = _("span", { class: "kx-opts-lbl" }, "Options", -1)),
            j(mt, {
              tag: "wc-schema-form",
              schema: r.optionsSchema,
              config: r.config,
              onChange: n
            }, null, 8, ["schema", "config"])
          ])) : z("", !0)
        ])
      ], 64)) : z("", !0)
    ]));
  }
});
function va(e) {
  return !!(e && typeof e.picker == "string" && e.picker && e.picker !== "wc-schema-form");
}
function xr(e) {
  return e?.config_schema;
}
function kr(e, t = "ports") {
  const r = xr(e);
  if (!r) return null;
  const o = [];
  for (const [c, p] of Object.entries(r))
    va(p) && o.push([c, p]);
  if (o.length === 0) return null;
  o.length > 1 && console.error(`${t}: port schema declares multiple picker fields`, o.map(([c]) => c));
  const [n, i] = o[0], a = typeof i.title == "string" ? i.title : "", l = typeof i.detail == "string" ? i.detail : "", s = typeof i.delete_endpoint == "string" ? i.delete_endpoint : "";
  return { key: n, tag: i.picker ?? "", title: a, schema: { properties: { [n]: i } }, detail: l, deleteEndpoint: s };
}
function ga(e, t = "ports") {
  const r = xr(e);
  if (!r) return null;
  const o = kr(e, t)?.key, n = {};
  for (const [i, a] of Object.entries(r))
    i !== o && (n[i] = a);
  return Object.keys(n).length ? { type: "object", properties: n } : null;
}
function He(e) {
  if (!e) return null;
  if (typeof e == "string")
    try {
      return JSON.parse(e);
    } catch {
      return null;
    }
  return e;
}
function ya(e) {
  const t = He(e);
  return !!(t && t.properties && Object.keys(t.properties).length);
}
const ba = "_portable_input";
function Ce(e) {
  return e && typeof e == "object" && !Array.isArray(e) ? e : null;
}
function wa(e) {
  const t = Ce(e);
  return t && typeof t.kind == "string" ? t : null;
}
function xa(e) {
  return e === !0 ? !0 : void 0;
}
function _r(e) {
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
function Za(e) {
  const t = Ce(e), r = Ce(t?.[ba]), o = Ce(r?.trigger), n = typeof r?.sink_port == "string" ? r.sink_port : "", i = wa(r?.transform), a = t?.enabled;
  return !r || !o || !n || !i || typeof a != "boolean" ? null : _r({
    title: typeof r.title == "string" ? r.title : "",
    trigger: o,
    sinkPort: n,
    sinkConfig: Ce(r.sink_config) ?? {},
    transform: i,
    outputSchema: r.output_schema,
    reconcile: xa(r.reconcile),
    enabled: a
  });
}
const ka = "wc-component-picker", _a = "wc-schema-form", Kt = "Locked after install — reinstall the data sync to change it.";
function Xa(e) {
  const t = e.managed, r = E(""), o = E(""), n = E({}), i = E(!1), a = E(!0), l = E({ v: 2 }), s = E(!1), c = E(""), p = E(void 0), u = E(""), d = E(null), h = E([]), x = E([]), y = P(() => {
    const f = l.value.source;
    return typeof f == "string" ? f : "";
  }), m = P(() => h.value.filter((f) => f.id === y.value)), b = P(() => m.value[0] || null), w = P(() => x.value.find((f) => f.id === o.value) || null);
  function k() {
    t || (i.value = !1);
  }
  function A() {
    n.value = {}, i.value = !1;
  }
  function v(f) {
    const C = f ?? {};
    if (!C.spec || typeof C.spec != "object" || Array.isArray(C.spec)) return;
    const pe = y.value;
    l.value = { ...C.spec }, s.value = C.valid === !0, c.value = typeof C.error == "string" ? C.error : "", C.output_schema !== void 0 && (p.value = C.output_schema), y.value !== pe && k();
  }
  const O = E([]), S = E(void 0), L = E(""), D = P(() => s.value && y.value ? JSON.stringify({ source: y.value, config: l.value.config ?? {}, limit: 1 }) : "");
  B(D, async (f, C, pe) => {
    let ue = !0;
    if (pe(() => {
      ue = !1;
    }), O.value = [], S.value = void 0, L.value = "", !!f)
      try {
        const { data: U } = await nt.post(
          "/api/v1/automations/source-samples",
          JSON.parse(f)
        );
        if (!ue) return;
        if (U.success !== !0 || !Array.isArray(U.samples)) throw new Error(lt(U.error, "Could not read source samples."));
        O.value = U.samples, S.value = U.output_schema;
      } catch (U) {
        ue && (L.value = lt(U, "Could not read source samples."));
      }
  });
  const ee = P(() => JSON.stringify(O.value.map((f) => ({ payload: f })))), J = P(() => {
    for (const f of m.value) {
      const C = f.reconcile;
      if (C && typeof C.pull_keys == "string" && C.pull_keys) return C;
    }
    return null;
  }), Q = P(() => !J.value || !w.value || !m.value.some((C) => C.surface === "collection") ? !1 : !!(w.value.operations || {}).delete), te = P(() => x.value.map((f) => ({
    id: f.id,
    title: f.title || f.name || f.id,
    icon: f.icon || "tabler:database",
    group: f.group || "Destinations",
    subtitle: f.description
  }))), M = P(() => kr(w.value, "SyncForm")), re = P(() => {
    if (M.value?.tag !== ka) return;
    const f = String(w.value?.class || "");
    if (f)
      return { type: "thread", thread_class: f, title: M.value?.title ?? "", component: w.value?.component, delete_endpoint: M.value?.deleteEndpoint || "" };
  }), se = P(() => M.value?.tag || _a), F = P(() => ga(w.value, "SyncForm")), le = P(() => M.value?.schema ?? F.value), ce = P(() => !!M.value && ya(F.value)), W = P(() => {
    if (!w.value) return !1;
    const f = M.value;
    if (f && w.value.config_schema?.[f.key]?.required) {
      const C = n.value[f.key];
      return C != null && C !== "" && (!Array.isArray(C) || C.length > 0);
    }
    return !0;
  }), H = P(() => {
    if (S.value != null) return He(S.value);
    for (const f of m.value)
      if (f.output_schema != null) return He(f.output_schema);
    return null;
  }), Z = P(() => He(w.value?.input_schema) ?? (w.value ? { properties: { content: { type: "string" } }, required: ["content"] } : null)), ye = P(() => {
    if (!y.value || !w.value) return null;
    const f = Z.value;
    if (!f || !f.properties) return { needed: !1, reason: "Destination accepts the item as-is — no transform needed." };
    const C = new Set(Object.keys(H.value?.properties || {})), pe = /* @__PURE__ */ new Set(), ue = /* @__PURE__ */ new Map(), U = w.value?.config_schema || {};
    for (const [q, rt] of Object.entries(U)) {
      const be = rt || {};
      if (typeof be.supplies != "string") continue;
      ue.set(be.supplies, typeof be.title == "string" && be.title ? be.title : q);
      const ot = n.value[q];
      ot != null && ot !== "" && pe.add(be.supplies);
    }
    const Se = (f.required || []).filter((q) => !C.has(q) && !pe.has(q));
    if (Se.length === 0) return { needed: !1, reason: "Fields line up — pass through works." };
    const je = t ? [] : Se.map((q) => ue.get(q)).filter((q) => !!q), tt = je.length ? `, or fill ${je.join(", ")} below` : "";
    return { needed: !0, reason: `Destination needs ${Se.join(", ")}, not in the source — map it with an Expression or LLM${tt}.` };
  }), oe = P(() => !!y.value && !!w.value), Ne = P(() => JSON.stringify(H.value ?? {})), Re = P(() => JSON.stringify(Z.value ?? {})), Ke = P(() => w.value?.input_shape ?? ""), Ye = P(() => {
    if (!oe.value) return "";
    const f = b.value?.title || b.value?.name || "source", C = w.value?.title || w.value?.name || "destination";
    return `Map ${f} items into ${C} input.`;
  }), Ge = P(() => d.value ? JSON.stringify(d.value) : "");
  function Je(f) {
    const C = f.detail?.transform;
    C && typeof C.kind == "string" && (d.value = C);
  }
  const Qe = P(() => {
    if (!r.value.trim()) return "Name is required.";
    if (!s.value) return c.value || "Source is required.";
    if (!o.value) return "Destination is required.";
    if (!W.value) return "Destination configuration is required.";
    const f = d.value;
    return f ? f.kind === "expr" && !f.expr.trim() ? "Expression is required." : f.kind === "llm" && !f.prompt.trim() ? "Prompt is required." : f.kind === "code" && !f.code.trim() ? "Code is required." : "" : "Transform selection is required.";
  });
  async function Ze() {
    try {
      const [f, C] = await Promise.all([
        nt.get("/api/v1/automations/sources"),
        nt.get("/api/v1/automations/sinks")
      ]);
      return h.value = f.data?.sources || [], x.value = C.data?.sinks || [], !t && x.value.length === 1 && (o.value = x.value[0].id), "";
    } catch (f) {
      return lt(f, "failed to load catalog");
    }
  }
  function Xe(f) {
    r.value = f.title, u.value = f.trigger, l.value = f.trigger, p.value = f.output_schema, d.value = f.transform, o.value = f.sink_port, n.value = f.sink_config, i.value = f.reconcile != null, a.value = f.enabled;
  }
  function et() {
    return _r({
      // The trigger spec rides verbatim as input.trigger: the trigger service
      // validates and normalizes it server-side.
      title: r.value,
      trigger: l.value,
      sinkPort: o.value,
      sinkConfig: n.value,
      transform: d.value,
      outputSchema: p.value,
      reconcile: (t || Q.value) && i.value ? !0 : void 0,
      enabled: a.value
    });
  }
  return {
    managed: t,
    title: r,
    sinkId: o,
    sinkConfig: n,
    reconcileEnabled: i,
    triggerSeed: u,
    transform: d,
    sources: h,
    sinks: x,
    selectedSource: b,
    selectedSink: w,
    supportsReconcile: Q,
    sinkItems: te,
    sinkPickerMeta: re,
    sinkConfigTag: se,
    sinkConfigSchema: le,
    sinkOptionsSchema: F,
    sinkHasOptions: ce,
    transformDetected: ye,
    canAssist: oe,
    assistSourceSchema: Ne,
    assistSinkSchema: Re,
    assistInputShape: Ke,
    assistHint: Ye,
    assistValue: Ge,
    validationError: Qe,
    assistSamples: ee,
    sampleError: L,
    onTriggerChange: v,
    onAssistConfirmed: Je,
    onSinkChange: A,
    loadCatalog: Ze,
    seed: Xe,
    currentInput: et
  };
}
const Sa = { class: "kx-field" }, Ca = { class: "kx-pipe" }, Ea = { class: "kx-pipe-conn" }, Oa = { class: "kx-pipe-conn" }, Ta = {
  key: 0,
  class: "kx-runopts"
}, Pa = { class: "kx-field" }, $a = { class: "kx-reconcile-check" }, La = ["disabled"], Aa = { class: "kx-field-hint" }, ei = /* @__PURE__ */ ge({
  __name: "SyncPipeline",
  props: {
    form: {},
    destinationLocked: { type: Boolean },
    generationPolicy: {}
  },
  setup(e) {
    const t = e, r = t.form;
    return (o, n) => (T(), $(me, null, [
      _("label", Sa, [
        n[4] || (n[4] = _("span", { class: "kx-field-lbl" }, [
          jr("Name "),
          _("span", {
            class: "kx-req",
            "aria-hidden": "true"
          }, "*")
        ], -1)),
        ct(_("input", {
          "onUpdate:modelValue": n[0] || (n[0] = (i) => g(r).title.value = i),
          "data-test": "pl-title",
          class: "kx-input",
          type: "text",
          placeholder: "Fireflies to Knowledge Base"
        }, null, 512), [
          [Xt, g(r).title.value]
        ])
      ]),
      _("div", Ca, [
        j(An, {
          icon: g(r).selectedSource.value?.icon || "tabler:plug",
          seed: g(r).triggerSeed.value,
          editing: g(r).managed,
          onChange: g(r).onTriggerChange
        }, null, 8, ["icon", "seed", "editing", "onChange"]),
        _("div", Ea, [
          j(g(ie), {
            icon: "tabler:arrow-down",
            "aria-hidden": "true"
          })
        ]),
        j(zn, {
          "can-assist": g(r).canAssist.value,
          detected: g(r).transformDetected.value,
          transform: g(r).transform.value,
          samples: g(r).assistSamples.value,
          "sample-error": g(r).sampleError.value,
          "source-schema": g(r).assistSourceSchema.value,
          "sink-schema": g(r).assistSinkSchema.value,
          "input-shape": g(r).assistInputShape.value,
          hint: g(r).assistHint.value,
          value: g(r).assistValue.value,
          "generation-policy": t.generationPolicy,
          onTransformConfirmed: g(r).onAssistConfirmed
        }, null, 8, ["can-assist", "detected", "transform", "samples", "sample-error", "source-schema", "sink-schema", "input-shape", "hint", "value", "generation-policy", "onTransformConfirmed"]),
        _("div", Oa, [
          j(g(ie), {
            icon: "tabler:arrow-down",
            "aria-hidden": "true"
          })
        ]),
        j(fa, {
          items: g(r).sinkItems.value,
          "sink-id": g(r).sinkId.value,
          editing: g(r).managed || !!t.destinationLocked,
          "selected-sink": g(r).selectedSink.value,
          "config-tag": g(r).sinkConfigTag.value,
          "config-schema": g(r).sinkConfigSchema.value,
          "picker-meta": g(r).sinkPickerMeta.value,
          config: g(r).sinkConfig.value,
          "has-options": g(r).sinkHasOptions.value,
          "options-schema": g(r).sinkOptionsSchema.value,
          "locked-hint": t.destinationLocked ? "Selected by the owning component." : g(Kt),
          "onUpdate:sinkId": n[1] || (n[1] = (i) => {
            g(r).sinkId.value = i, g(r).onSinkChange();
          }),
          "onUpdate:config": n[2] || (n[2] = (i) => {
            g(r).sinkConfig.value = { ...g(r).sinkConfig.value, ...i };
          })
        }, null, 8, ["items", "sink-id", "editing", "selected-sink", "config-tag", "config-schema", "picker-meta", "config", "has-options", "options-schema", "locked-hint"])
      ]),
      g(r).supportsReconcile.value || g(r).managed && g(r).reconcileEnabled.value ? (T(), $("div", Ta, [
        _("div", Pa, [
          _("label", $a, [
            ct(_("input", {
              "onUpdate:modelValue": n[3] || (n[3] = (i) => g(r).reconcileEnabled.value = i),
              class: "kx-check",
              type: "checkbox",
              disabled: g(r).managed
            }, null, 8, La), [
              [Mr, g(r).reconcileEnabled.value]
            ]),
            n[5] || (n[5] = _("span", null, "Reconcile deleted source items", -1))
          ]),
          _("span", Aa, Y(g(r).managed ? g(Kt) : "Periodically compares source keys with this sync’s owned destinations and removes items that disappeared from the source."), 1)
        ])
      ])) : z("", !0)
    ], 64));
  }
}), ti = ':root{--p-form-field-padding-x: .75rem;--p-form-field-padding-y: .5rem;--p-form-field-sm-padding-x: .625rem;--p-form-field-sm-padding-y: .375rem;--p-form-field-lg-padding-x: .875rem;--p-form-field-lg-padding-y: .625rem;--p-form-field-border-radius: .375rem;--p-form-field-transition-duration: .2s;--p-form-field-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), 0 1px 2px 0 rgba(18, 18, 23, .05);--p-focus-ring-width: 1px;--p-focus-ring-style: solid;--p-focus-ring-color: color-mix(in srgb, var(--p-primary-color) 100%, transparent);--p-focus-ring-offset: 2px;--p-toggleswitch-width: 2.5rem;--p-toggleswitch-height: 1.5rem;--p-toggleswitch-border-radius: 30px;--p-toggleswitch-gap: .25rem;--p-toggleswitch-border-width: 1px;--p-toggleswitch-transition-duration: .2s;--p-toggleswitch-slide-duration: .2s;--p-toggleswitch-handle-size: 1rem;--p-toggleswitch-handle-border-radius: 9999px}:root{color-scheme:light dark;--p-primary: rgb(0, 95, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-secondary: #6f7385;--p-secondary-50: color-mix(in srgb, var(--p-secondary) 5%, white);--p-secondary-100: color-mix(in srgb, var(--p-secondary) 10%, white);--p-secondary-200: color-mix(in srgb, var(--p-secondary) 20%, white);--p-secondary-300: color-mix(in srgb, var(--p-secondary) 35%, white);--p-secondary-400: color-mix(in srgb, var(--p-secondary) 65%, white);--p-secondary-500: var(--p-secondary);--p-secondary-600: color-mix(in srgb, var(--p-secondary) 80%, black);--p-secondary-700: color-mix(in srgb, var(--p-secondary) 65%, black);--p-secondary-800: color-mix(in srgb, var(--p-secondary) 55%, black);--p-secondary-900: color-mix(in srgb, var(--p-secondary) 50%, black);--p-secondary-950: color-mix(in srgb, var(--p-secondary) 30%, black);--p-danger: rgb(239, 68, 68);--p-danger-50: color-mix(in srgb, var(--p-danger) 5%, white);--p-danger-100: color-mix(in srgb, var(--p-danger) 10%, white);--p-danger-200: color-mix(in srgb, var(--p-danger) 20%, white);--p-danger-300: color-mix(in srgb, var(--p-danger) 30%, white);--p-danger-400: color-mix(in srgb, var(--p-danger) 40%, white);--p-danger-500: var(--p-danger);--p-danger-600: color-mix(in srgb, var(--p-danger) 80%, black);--p-danger-700: color-mix(in srgb, var(--p-danger) 70%, black);--p-danger-800: color-mix(in srgb, var(--p-danger) 60%, black);--p-danger-900: color-mix(in srgb, var(--p-danger) 50%, black);--p-danger-950: color-mix(in srgb, var(--p-danger) 40%, black);--p-success: rgb(34, 197, 94);--p-success-50: color-mix(in srgb, var(--p-success) 5%, white);--p-success-100: color-mix(in srgb, var(--p-success) 10%, white);--p-success-200: color-mix(in srgb, var(--p-success) 20%, white);--p-success-300: color-mix(in srgb, var(--p-success) 30%, white);--p-success-400: color-mix(in srgb, var(--p-success) 40%, white);--p-success-500: var(--p-success);--p-success-600: color-mix(in srgb, var(--p-success) 80%, black);--p-success-700: color-mix(in srgb, var(--p-success) 70%, black);--p-success-800: color-mix(in srgb, var(--p-success) 60%, black);--p-success-900: color-mix(in srgb, var(--p-success) 50%, black);--p-success-950: color-mix(in srgb, var(--p-success) 40%, black);--p-warn: rgb(249, 115, 22);--p-warn-50: color-mix(in srgb, var(--p-warn) 5%, white);--p-warn-100: color-mix(in srgb, var(--p-warn) 10%, white);--p-warn-200: color-mix(in srgb, var(--p-warn) 20%, white);--p-warn-300: color-mix(in srgb, var(--p-warn) 30%, white);--p-warn-400: color-mix(in srgb, var(--p-warn) 40%, white);--p-warn-500: var(--p-warn);--p-warn-600: color-mix(in srgb, var(--p-warn) 80%, black);--p-warn-700: color-mix(in srgb, var(--p-warn) 70%, black);--p-warn-800: color-mix(in srgb, var(--p-warn) 60%, black);--p-warn-900: color-mix(in srgb, var(--p-warn) 50%, black);--p-warn-950: color-mix(in srgb, var(--p-warn) 40%, black);--p-info: rgb(14, 165, 233);--p-info-50: color-mix(in srgb, var(--p-info) 5%, white);--p-info-100: color-mix(in srgb, var(--p-info) 10%, white);--p-info-200: color-mix(in srgb, var(--p-info) 20%, white);--p-info-300: color-mix(in srgb, var(--p-info) 30%, white);--p-info-400: color-mix(in srgb, var(--p-info) 40%, white);--p-info-500: var(--p-info);--p-info-600: color-mix(in srgb, var(--p-info) 80%, black);--p-info-700: color-mix(in srgb, var(--p-info) 70%, black);--p-info-800: color-mix(in srgb, var(--p-info) 60%, black);--p-info-900: color-mix(in srgb, var(--p-info) 50%, black);--p-info-950: color-mix(in srgb, var(--p-info) 40%, black);--p-help: rgb(168, 85, 247);--p-help-50: color-mix(in srgb, var(--p-help) 5%, white);--p-help-100: color-mix(in srgb, var(--p-help) 10%, white);--p-help-200: color-mix(in srgb, var(--p-help) 20%, white);--p-help-300: color-mix(in srgb, var(--p-help) 30%, white);--p-help-400: color-mix(in srgb, var(--p-help) 40%, white);--p-help-500: var(--p-help);--p-help-600: color-mix(in srgb, var(--p-help) 80%, black);--p-help-700: color-mix(in srgb, var(--p-help) 70%, black);--p-help-800: color-mix(in srgb, var(--p-help) 60%, black);--p-help-900: color-mix(in srgb, var(--p-help) 50%, black);--p-help-950: color-mix(in srgb, var(--p-help) 40%, black);--p-accent: rgb(20, 184, 166);--p-accent-50: color-mix(in srgb, var(--p-accent) 5%, white);--p-accent-100: color-mix(in srgb, var(--p-accent) 10%, white);--p-accent-200: color-mix(in srgb, var(--p-accent) 20%, white);--p-accent-300: color-mix(in srgb, var(--p-accent) 30%, white);--p-accent-400: color-mix(in srgb, var(--p-accent) 40%, white);--p-accent-500: var(--p-accent);--p-accent-600: color-mix(in srgb, var(--p-accent) 80%, black);--p-accent-700: color-mix(in srgb, var(--p-accent) 70%, black);--p-accent-800: color-mix(in srgb, var(--p-accent) 60%, black);--p-accent-900: color-mix(in srgb, var(--p-accent) 50%, black);--p-accent-950: color-mix(in srgb, var(--p-accent) 40%, black);--p-surface-0: #ffffff;--p-surface-50: #fafafa;--p-surface-100: #f5f5f5;--p-surface-200: #e5e5e5;--p-surface-300: #d4d4d4;--p-surface-400: #a3a3a3;--p-surface-500: #737373;--p-surface-600: #525252;--p-surface-700: #404040;--p-surface-800: #262626;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #171717;--p-surface-950: #0a0a0a;--p-content-border-radius: 6px;--p-font-heading-family: var(--v-font-family-head, Arial);--p-font-heading-scale: 1;--p-font-heading-line-height: 1.5;--p-font-heading-letter-spacing: normal;--p-font-heading-stretch: normal;--p-font-heading-variation-settings: normal;--p-font-body-scale: 1;--p-font-body-line-height: 1.5;--p-font-body-letter-spacing: normal;--p-font-body-stretch: normal;--p-font-body-variation-settings: normal;--p-font-mono-family: ui-monospace}:root{--p-primary-color: var(--p-primary-500);--p-primary-contrast-color: var(--p-surface-0);--p-primary-hover-color: var(--p-primary-600);--p-primary-active-color: var(--p-primary-700);--p-secondary-color: var(--p-secondary-500);--p-secondary-contrast-color: var(--p-surface-0);--p-secondary-hover-color: var(--p-secondary-600);--p-secondary-active-color: var(--p-secondary-700);--p-danger-color: var(--p-danger-500);--p-danger-contrast-color: var(--p-surface-0);--p-danger-hover-color: var(--p-danger-600);--p-danger-active-color: var(--p-danger-700);--p-success-color: var(--p-success-500);--p-success-contrast-color: var(--p-surface-0);--p-success-hover-color: var(--p-success-600);--p-success-active-color: var(--p-success-700);--p-warn-color: var(--p-warn-500);--p-warn-contrast-color: var(--p-surface-0);--p-warn-hover-color: var(--p-warn-600);--p-warn-active-color: var(--p-warn-700);--p-info-color: var(--p-info-500);--p-info-contrast-color: var(--p-surface-0);--p-info-hover-color: var(--p-info-600);--p-info-active-color: var(--p-info-700);--p-help-color: var(--p-help-500);--p-help-contrast-color: var(--p-surface-0);--p-help-hover-color: var(--p-help-600);--p-help-active-color: var(--p-help-700);--p-accent-color: var(--p-accent-500);--p-accent-contrast-color: var(--p-surface-0);--p-accent-hover-color: var(--p-accent-600);--p-accent-active-color: var(--p-accent-700);--p-content-border-color: var(--p-surface-200);--p-content-hover-background: var(--p-surface-100);--p-content-hover-color: var(--p-surface-800);--p-highlight-background: var(--p-primary-50);--p-highlight-color: var(--p-primary-700);--p-highlight-focus-background: var(--p-primary-100);--p-highlight-focus-color: var(--p-primary-800);--p-content-background: var(--p-surface-0);--p-text-color: var(--p-surface-700);--p-text-hover-color: var(--p-surface-800);--p-text-muted-color: var(--p-surface-500);--p-text-hover-muted-color: var(--p-surface-600)}@media(prefers-color-scheme:dark){:root:not(.w-theme-light){--p-surface-D: #fff;--p-surface-0: #fff;--p-surface-50: #fafafa;--p-surface-100: #f4f4f5;--p-surface-200: #e4e4e7;--p-surface-300: #d4d4d8;--p-surface-400: #a1a1aa;--p-surface-500: #71717a;--p-surface-600: #545250;--p-surface-700: #403e3c;--p-surface-800: #2b2927;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #1c1a19;--p-surface-950: #0f0e0d;--p-primary: rgb(0, 125, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-primary-color: var(--p-primary-400);--p-primary-contrast-color: var(--p-surface-900);--p-primary-hover-color: var(--p-primary-300);--p-primary-active-color: var(--p-primary-200);--p-secondary-color: var(--p-secondary-400);--p-secondary-contrast-color: var(--p-surface-900);--p-secondary-hover-color: var(--p-secondary-300);--p-secondary-active-color: var(--p-secondary-200);--p-danger-color: var(--p-danger-400);--p-danger-contrast-color: var(--p-surface-900);--p-danger-hover-color: var(--p-danger-300);--p-danger-active-color: var(--p-danger-200);--p-success-color: var(--p-success-400);--p-success-contrast-color: var(--p-surface-900);--p-success-hover-color: var(--p-success-300);--p-success-active-color: var(--p-success-200);--p-warn-color: var(--p-warn-400);--p-warn-contrast-color: var(--p-surface-900);--p-warn-hover-color: var(--p-warn-300);--p-warn-active-color: var(--p-warn-200);--p-info-color: var(--p-info-400);--p-info-contrast-color: var(--p-surface-900);--p-info-hover-color: var(--p-info-300);--p-info-active-color: var(--p-info-200);--p-help-color: var(--p-help-400);--p-help-contrast-color: var(--p-surface-900);--p-help-hover-color: var(--p-help-300);--p-help-active-color: var(--p-help-200);--p-accent-color: var(--p-accent-400);--p-accent-contrast-color: var(--p-surface-900);--p-accent-hover-color: var(--p-accent-300);--p-accent-active-color: var(--p-accent-200);--p-content-border-color: var(--p-surface-700);--p-content-hover-background: var(--p-surface-800);--p-content-hover-color: var(--p-surface-0);--p-highlight-background: color-mix(in srgb, var(--p-primary-400), transparent 84%);--p-highlight-color: rgba(255, 255, 255, 87%);--p-highlight-focus-background: color-mix(in srgb, var(--p-primary-400), transparent 76%);--p-highlight-focus-color: rgba(255, 255, 255, 87%);--p-content-background: var(--p-surface-900);--p-text-color: var(--p-surface-0);--p-text-hover-color: var(--p-surface-0);--p-text-muted-color: var(--p-surface-400);--p-text-hover-muted-color: var(--p-surface-300)}}:root.w-theme-dark,.w-theme-dark{color-scheme:dark;--p-surface-D: #fff;--p-surface-0: #fff;--p-surface-50: #fafafa;--p-surface-100: #f4f4f5;--p-surface-200: #e4e4e7;--p-surface-300: #d4d4d8;--p-surface-400: #a1a1aa;--p-surface-500: #71717a;--p-surface-600: #545250;--p-surface-700: #403e3c;--p-surface-800: #2b2927;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #1c1a19;--p-surface-950: #0f0e0d;--p-primary: rgb(0, 125, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-primary-color: var(--p-primary-400);--p-primary-contrast-color: var(--p-surface-900);--p-primary-hover-color: var(--p-primary-300);--p-primary-active-color: var(--p-primary-200);--p-secondary-color: var(--p-secondary-400);--p-secondary-contrast-color: var(--p-surface-900);--p-secondary-hover-color: var(--p-secondary-300);--p-secondary-active-color: var(--p-secondary-200);--p-danger-color: var(--p-danger-400);--p-danger-contrast-color: var(--p-surface-900);--p-danger-hover-color: var(--p-danger-300);--p-danger-active-color: var(--p-danger-200);--p-success-color: var(--p-success-400);--p-success-contrast-color: var(--p-surface-900);--p-success-hover-color: var(--p-success-300);--p-success-active-color: var(--p-success-200);--p-warn-color: var(--p-warn-400);--p-warn-contrast-color: var(--p-surface-900);--p-warn-hover-color: var(--p-warn-300);--p-warn-active-color: var(--p-warn-200);--p-info-color: var(--p-info-400);--p-info-contrast-color: var(--p-surface-900);--p-info-hover-color: var(--p-info-300);--p-info-active-color: var(--p-info-200);--p-help-color: var(--p-help-400);--p-help-contrast-color: var(--p-surface-900);--p-help-hover-color: var(--p-help-300);--p-help-active-color: var(--p-help-200);--p-accent-color: var(--p-accent-400);--p-accent-contrast-color: var(--p-surface-900);--p-accent-hover-color: var(--p-accent-300);--p-accent-active-color: var(--p-accent-200);--p-content-border-color: var(--p-surface-700);--p-content-hover-background: var(--p-surface-800);--p-content-hover-color: var(--p-surface-0);--p-highlight-background: color-mix(in srgb, var(--p-primary-400), transparent 84%);--p-highlight-color: rgba(255, 255, 255, 87%);--p-highlight-focus-background: color-mix(in srgb, var(--p-primary-400), transparent 76%);--p-highlight-focus-color: rgba(255, 255, 255, 87%);--p-content-background: var(--p-surface-900);--p-text-color: var(--p-surface-0);--p-text-hover-color: var(--p-surface-0);--p-text-muted-color: var(--p-surface-400);--p-text-hover-muted-color: var(--p-surface-300)}:root.w-theme-light,.w-theme-light{color-scheme:light;--p-surface-0: #ffffff;--p-surface-50: #fafafa;--p-surface-100: #f5f5f5;--p-surface-200: #e5e5e5;--p-surface-300: #d4d4d4;--p-surface-400: #a3a3a3;--p-surface-500: #737373;--p-surface-600: #525252;--p-surface-700: #404040;--p-surface-800: #262626;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #171717;--p-surface-950: #0a0a0a;--p-primary: rgb(0, 95, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-primary-color: var(--p-primary-500);--p-primary-contrast-color: var(--p-surface-0);--p-primary-hover-color: var(--p-primary-600);--p-primary-active-color: var(--p-primary-700);--p-secondary-color: var(--p-secondary-500);--p-secondary-contrast-color: var(--p-surface-0);--p-secondary-hover-color: var(--p-secondary-600);--p-secondary-active-color: var(--p-secondary-700);--p-danger-color: var(--p-danger-500);--p-danger-contrast-color: var(--p-surface-0);--p-danger-hover-color: var(--p-danger-600);--p-danger-active-color: var(--p-danger-700);--p-success-color: var(--p-success-500);--p-success-contrast-color: var(--p-surface-0);--p-success-hover-color: var(--p-success-600);--p-success-active-color: var(--p-success-700);--p-warn-color: var(--p-warn-500);--p-warn-contrast-color: var(--p-surface-0);--p-warn-hover-color: var(--p-warn-600);--p-warn-active-color: var(--p-warn-700);--p-info-color: var(--p-info-500);--p-info-contrast-color: var(--p-surface-0);--p-info-hover-color: var(--p-info-600);--p-info-active-color: var(--p-info-700);--p-help-color: var(--p-help-500);--p-help-contrast-color: var(--p-surface-0);--p-help-hover-color: var(--p-help-600);--p-help-active-color: var(--p-help-700);--p-accent-color: var(--p-accent-500);--p-accent-contrast-color: var(--p-surface-0);--p-accent-hover-color: var(--p-accent-600);--p-accent-active-color: var(--p-accent-700);--p-content-border-color: var(--p-surface-200);--p-content-hover-background: var(--p-surface-100);--p-content-hover-color: var(--p-surface-800);--p-highlight-background: var(--p-primary-50);--p-highlight-color: var(--p-primary-700);--p-highlight-focus-background: var(--p-primary-100);--p-highlight-focus-color: var(--p-primary-800);--p-content-background: var(--p-surface-0);--p-text-color: var(--p-surface-700);--p-text-hover-color: var(--p-surface-800);--p-text-muted-color: var(--p-surface-500);--p-text-hover-muted-color: var(--p-surface-600)}:host{--kx-picker-shadow: var(--p-select-overlay-shadow);--kx-picker-option-icon-size: 17px;--kx-picker-option-icon-gap: 10px;--kx-picker-option-stack-gap: 1px;--kx-picker-option-title-size: 13px;--kx-picker-option-title-weight: 600;--kx-picker-option-subtitle-size: 11.5px;--kx-picker-option-subtitle-line-height: 1.4}.kx-ps{width:100%;text-align:start;font:inherit}.anchored-panel>.p-select-overlay.kx-ps-panel{position:static;width:100%;display:flex;flex-direction:column;max-height:var(--anchored-panel-available-height);overflow:hidden}.kx-ps-panel>.p-select-header{flex:none}.kx-ps-options{min-height:0;overflow-y:auto}.kx-ps-options>li{flex:none}.kx-ps-val{display:flex;align-items:center;gap:8px;min-width:0}.kx-ps-val-ico{width:16px;height:16px;color:var(--p-primary-color);flex:none}.kx-ps-val-label{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.kx-ps-ph{color:var(--p-text-muted-color)}.kx-ps-option{gap:var(--kx-picker-option-icon-gap)}.kx-ps-opt-ico{width:var(--kx-picker-option-icon-size);height:var(--kx-picker-option-icon-size);flex:none}.kx-ps-opt-body{flex:1;min-width:0;display:flex;flex-direction:column;gap:var(--kx-picker-option-stack-gap)}.kx-ps-opt-title{font-size:var(--kx-picker-option-title-size);font-weight:var(--kx-picker-option-title-weight);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%}.kx-ps-opt-sub{font-size:var(--kx-picker-option-subtitle-size);line-height:var(--kx-picker-option-subtitle-line-height);color:var(--p-text-muted-color);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%}*,:before,:after{--tw-border-spacing-x: 0;--tw-border-spacing-y: 0;--tw-translate-x: 0;--tw-translate-y: 0;--tw-rotate: 0;--tw-skew-x: 0;--tw-skew-y: 0;--tw-scale-x: 1;--tw-scale-y: 1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness: proximity;--tw-gradient-from-position: ;--tw-gradient-via-position: ;--tw-gradient-to-position: ;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width: 0px;--tw-ring-offset-color: #fff;--tw-ring-color: rgb(59 130 246 / .5);--tw-ring-offset-shadow: 0 0 #0000;--tw-ring-shadow: 0 0 #0000;--tw-shadow: 0 0 #0000;--tw-shadow-colored: 0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: ;--tw-contain-size: ;--tw-contain-layout: ;--tw-contain-paint: ;--tw-contain-style: }::backdrop{--tw-border-spacing-x: 0;--tw-border-spacing-y: 0;--tw-translate-x: 0;--tw-translate-y: 0;--tw-rotate: 0;--tw-skew-x: 0;--tw-skew-y: 0;--tw-scale-x: 1;--tw-scale-y: 1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness: proximity;--tw-gradient-from-position: ;--tw-gradient-via-position: ;--tw-gradient-to-position: ;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width: 0px;--tw-ring-offset-color: #fff;--tw-ring-color: rgb(59 130 246 / .5);--tw-ring-offset-shadow: 0 0 #0000;--tw-ring-shadow: 0 0 #0000;--tw-shadow: 0 0 #0000;--tw-shadow-colored: 0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: ;--tw-contain-size: ;--tw-contain-layout: ;--tw-contain-paint: ;--tw-contain-style: }*,:before,:after{box-sizing:border-box;border-width:0;border-style:solid;border-color:#e5e7eb}:before,:after{--tw-content: ""}html,:host{line-height:1.5;-webkit-text-size-adjust:100%;-moz-tab-size:4;tab-size:4;font-family:ui-sans-serif,system-ui,sans-serif,"Apple Color Emoji","Segoe UI Emoji",Segoe UI Symbol,"Noto Color Emoji";font-feature-settings:normal;font-variation-settings:normal;-webkit-tap-highlight-color:transparent}body{margin:0;line-height:inherit}hr{height:0;color:inherit;border-top-width:1px}abbr:where([title]){text-decoration:underline dotted}h1,h2,h3,h4,h5,h6{font-size:inherit;font-weight:inherit}a{color:inherit;text-decoration:inherit}b,strong{font-weight:bolder}code,kbd,samp,pre{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace;font-feature-settings:normal;font-variation-settings:normal;font-size:1em}small{font-size:80%}sub,sup{font-size:75%;line-height:0;position:relative;vertical-align:baseline}sub{bottom:-.25em}sup{top:-.5em}table{text-indent:0;border-color:inherit;border-collapse:collapse}button,input,optgroup,select,textarea{font-family:inherit;font-feature-settings:inherit;font-variation-settings:inherit;font-size:100%;font-weight:inherit;line-height:inherit;letter-spacing:inherit;color:inherit;margin:0;padding:0}button,select{text-transform:none}button,input:where([type=button]),input:where([type=reset]),input:where([type=submit]){-webkit-appearance:button;background-color:transparent;background-image:none}:-moz-focusring{outline:auto}:-moz-ui-invalid{box-shadow:none}progress{vertical-align:baseline}::-webkit-inner-spin-button,::-webkit-outer-spin-button{height:auto}[type=search]{-webkit-appearance:textfield;outline-offset:-2px}::-webkit-search-decoration{-webkit-appearance:none}::-webkit-file-upload-button{-webkit-appearance:button;font:inherit}summary{display:list-item}blockquote,dl,dd,h1,h2,h3,h4,h5,h6,hr,figure,p,pre{margin:0}fieldset{margin:0;padding:0}legend{padding:0}ol,ul,menu{list-style:none;margin:0;padding:0}dialog{padding:0}textarea{resize:vertical}input::placeholder,textarea::placeholder{opacity:1;color:#9ca3af}button,[role=button]{cursor:pointer}:disabled{cursor:default}img,svg,video,canvas,audio,iframe,embed,object{display:block;vertical-align:middle}img,video{max-width:100%;height:auto}[hidden]:where(:not([hidden=until-found])){display:none}@supports (-moz-appearance:none){*{scrollbar-color:initial;scrollbar-width:initial}}:host{display:block;height:100%;min-height:0}:host>div{height:100%;min-height:0}*,*:before,*:after{box-sizing:border-box}.kx-field{display:flex;flex-direction:column;gap:5px}.kx-field-lbl{font-size:12.5px;font-weight:600;color:var(--p-text-color)}.kx-req{color:var(--p-danger-500)}.kx-input{height:36px;padding:0 10px;font:inherit;font-size:13px;color:var(--p-text-color);background:var(--p-content-background);border:1px solid var(--p-content-border-color);border-radius:8px;transition:border-color .15s;width:100%}.kx-select{width:100%;min-width:0}.kx-check{width:18px;height:18px;accent-color:var(--p-primary-color)}.kx-reconcile-check{display:flex;align-items:center;gap:8px;font-size:13px;color:var(--p-text-color);cursor:pointer}.kx-field-hint{font-size:11.5px;color:var(--p-text-muted-color)}.kx-2p-r-note{margin:0;font-size:12.5px;color:var(--p-text-muted-color)}.kx-alert{margin:0;padding:8px 10px;font-size:12.5px;line-height:1.4;color:var(--p-danger-600, var(--p-danger-500));border-radius:8px;border:1px solid color-mix(in srgb,var(--p-danger-500) 32%,transparent);background:color-mix(in srgb,var(--p-danger-500) 8%,transparent)}@keyframes kx-spin{to{transform:rotate(360deg)}}.kx-flow{display:flex;flex-direction:column;gap:14px;padding:6px 0 0}.kx-actions{display:flex;justify-content:flex-end;gap:10px;padding-top:4px}.kx-pipe,.kx-stage{display:flex;flex-direction:column;gap:8px}.kx-stage-mid{background:transparent}.kx-stage-head{display:flex;align-items:center;gap:8px}.kx-stage-ico{width:26px;height:26px;border-radius:11px;flex:none;display:inline-flex;align-items:center;justify-content:center;background:color-mix(in srgb,var(--p-primary-color) 14%,transparent);color:var(--p-primary-color)}.kx-stage-ico svg{width:15px;height:15px}.kx-stage-lbl{font-size:12px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;color:var(--p-text-muted-color)}.kx-stage-cfg{margin-top:2px}.kx-stage-desc{margin:0;font-size:12px;line-height:1.4;color:var(--p-text-muted-color)}.kx-stage-opts{display:flex;flex-direction:column;gap:6px;margin-top:10px;padding-top:10px;border-top:1px dashed var(--p-content-border-color)}.kx-opts-lbl{font-size:11px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;color:var(--p-text-muted-color)}.kx-pipe-conn{display:flex;align-items:center;justify-content:center;gap:6px;padding:5px 0;color:var(--p-text-muted-color);font-size:11px}.kx-pipe-conn svg{width:16px;height:16px}.kx-runopts{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px}.kx-detect{display:flex;align-items:center;gap:6px;font-size:11.5px;line-height:1.35;padding:7px 9px;border-radius:8px;color:var(--p-success-600, var(--p-success-500));background:color-mix(in srgb,var(--p-success-500) 10%,transparent)}.kx-detect svg{width:14px;height:14px;flex:none}.kx-detect-warn{color:var(--p-warn-600, var(--p-warn-500));background:color-mix(in srgb,var(--p-warn-500) 12%,transparent)}.kx-wcmount{width:100%}.kx-wcmount>div{display:block;width:100%}';
export {
  xe as B,
  za as C,
  _o as F,
  Ya as K,
  ae as N,
  Qa as P,
  qa as Q,
  Ja as R,
  V as S,
  Ka as T,
  Wa as U,
  Va as W,
  ei as _,
  Ia as a,
  Xa as b,
  he as c,
  R as d,
  lt as e,
  xo as f,
  Et as g,
  qe as h,
  de as i,
  ze as j,
  Ba as k,
  vt as l,
  X as m,
  Da as n,
  Ga as o,
  Ha as p,
  Za as q,
  ti as s,
  Ma as u,
  Fa as v,
  Ua as z
};
//# sourceMappingURL=styles-BnOsQQko.js.map

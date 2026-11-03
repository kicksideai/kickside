import { hasInjectionContext as Tr, inject as vt, effectScope as Pr, ref as E, markRaw as $r, createApp as Lr, readonly as Ar, getCurrentInstance as xt, onMounted as Jt, nextTick as Te, watch as H, reactive as Nr, renderSlot as Pe, openBlock as P, createBlock as Qt, Teleport as Zt, createCommentVNode as D, h as Rr, defineComponent as ye, onBeforeUnmount as Xt, createElementBlock as L, createElementVNode as S, createVNode as j, unref as g, Fragment as fe, normalizeClass as er, toDisplayString as Y, resolveDynamicComponent as jr, normalizeStyle as Mr, useId as Ir, computed as T, withCtx as Vr, withDirectives as pt, vModelText as tr, renderList as kt, createTextVNode as zr, vModelCheckbox as Dr } from "vue";
import { addCollection as Hr, Icon as le } from "@iconify/vue";
import { config as _t, addIcons as Br, on as Fr, applyThemeMode as Me, host as Wr, hostCss as Ur, loadCss as qr, loadByTagName as Kr, api as at } from "@wippy-fe/proxy";
var ut = "data-wippy-visible";
function St(e) {
  const t = e.getAttribute(ut);
  return t === "true" ? !0 : t === "false" ? !1 : null;
}
var Yr = Object.defineProperty, Gr = (e, t, r) => t in e ? Yr(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : e[t] = r, N = (e, t, r) => Gr(e, typeof t != "symbol" ? t + "" : t, r), Jr = [
  "themeConfigUrl",
  "primeVueCssUrl",
  "markdownCssUrl",
  "iframeCssUrl"
], Qr = [
  ":where([data-wippy-theme-root]).w-theme-light",
  ":where([data-wippy-theme-root]).w-theme-dark"
].join(`,
`);
function Ct(e) {
  const t = e.startsWith("--") ? e : `--${e}`;
  return /^--[-\w\u0080-\uFFFF]+$/.test(t) ? t : null;
}
function Zr(...e) {
  const t = /* @__PURE__ */ new Set();
  for (const r of e)
    if (r)
      for (const [n, o] of Object.entries(r)) {
        if ((n === "@light" || n === "@dark") && o && typeof o == "object") {
          for (const [a, l] of Object.entries(o)) {
            const s = typeof l == "string" ? Ct(a) : null;
            s && t.add(s);
          }
          continue;
        }
        const i = typeof o == "string" ? Ct(n) : null;
        i && t.add(i);
      }
  return [...t].sort();
}
function Xr(e) {
  if (e.length === 0)
    return "";
  const t = e.map((r) => `  ${r}: inherit;`).join(`
`);
  return `${Qr} {
${t}
}`;
}
function en(e, t) {
  const r = Xr(t);
  r && rr(e, r, "@wippy-fe/css-variables-bridge");
}
function tn(e, t) {
  const n = (t ?? Jr).map(async (o) => {
    const i = Ur[o];
    if (!i)
      return console.warn(`[wippy-fe/webcomponent-core] hostCss key "${o}" is undefined — skipping. Remove it from hostCssKeys if the CSS was removed.`), null;
    try {
      return await qr(i);
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
function rn(e, t) {
  const r = document.createElement("style");
  r.textContent = t, e.appendChild(r);
}
function rr(e, t, r) {
  if (typeof CSSStyleSheet < "u" && "replaceSync" in CSSStyleSheet.prototype) {
    const o = new CSSStyleSheet();
    o.replaceSync(t), e.adoptedStyleSheets = [...e.adoptedStyleSheets, o];
    return;
  }
  const n = document.createElement("style");
  n.setAttribute("role", r), n.textContent = t, e.appendChild(n);
}
function nn(e, t) {
  rr(e, t, "@wippy-fe/custom-css");
}
function nr(e) {
  return e.__wippyHost ?? null;
}
function on(e) {
  return e.replace(/-([a-z])/g, (t, r) => r.toUpperCase());
}
function an(e, t, r) {
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
function it(e, t) {
  const r = {}, n = [];
  for (const [o, i] of Object.entries(t.properties)) {
    const a = e.getAttribute(o), l = on(o);
    if (a === null) {
      i.default !== void 0 && (r[l] = i.default);
      continue;
    }
    const s = an(o, a, i);
    s.error ? n.push(s.error) : r[l] = s.value;
  }
  return { props: r, errors: n };
}
var sn = class {
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
}, ln = class extends HTMLElement {
  constructor() {
    super(), N(this, "_internals"), N(this, "_contentObserver", null), N(this, "_initialized", !1), N(this, "_container", null), N(this, "_reactive", null), N(this, "_lastProps", null), N(this, "_lastErrors", []), N(this, "_lastContent", null), N(this, "_themeUnsub", null), N(this, "_hostVisible", null), this._internals = this.attachInternals(), this._hostVisible = St(this);
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
    return [.../* @__PURE__ */ new Set([...t, ...r, ut])];
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
    return nr(this);
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
        const i = it(this, e.propsSchema);
        e.validateProps && i.errors.push(...e.validateProps(i.props)), r = i.props, n = i.errors, this._lastProps = r, this._lastErrors = n;
      }
      const o = t ? this._lastContent ?? this._extractContent(e.contentTemplate) : null;
      t && this._lastContent === null && (this._lastContent = o), this._reactive = new sn(
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
        this.onInit(r), e.inlineCss && rn(r, e.inlineCss);
        try {
          const c = _t?.theming, p = Zr(
            c?.global?.cssVariables,
            c?.children?.cssVariables
          );
          en(r, p);
        } catch {
        }
        if (e.customCss !== !1)
          try {
            const c = _t?.theming, p = [c?.global?.customCSS, c?.children?.customCSS].filter(Boolean).join(`
`);
            p && nn(r, p);
          } catch {
          }
        (e.hostCssKeys === void 0 || e.hostCssKeys.length > 0) && tn(r, e.hostCssKeys), n = document.createElement("div"), n.setAttribute("data-wippy-theme-root", "");
        const s = e.containerClasses ?? [];
        s.length > 0 && n.classList.add(...s), r.appendChild(n), this._container = n, Br(Hr);
      }
      this._applyTheme(), this._themeUnsub || (this._themeUnsub = Fr("@theme", (s) => this._applyTheme(s)));
      const { props: o, errors: i } = it(this, e.propsSchema);
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
  _applyTheme(e = Wr.getThemeMode?.()) {
    Me(e, this), this._container && Me(e, this._container);
  }
  disconnectedCallback() {
    this._themeUnsub && (this._themeUnsub(), this._themeUnsub = null), Me("auto", this), this._container && Me("auto", this._container), this._contentObserver && (this._contentObserver.disconnect(), this._contentObserver = null), this.onUnmount(), this.emitEvent("unload"), this._internals.states.clear(), this._reactive?.dispose(), this._reactive = null, this._lastProps = null, this._lastErrors = [], this._lastContent = null, delete this.__wippyHost, delete this.__wippyHostBus;
  }
  attributeChangedCallback(e, t, r) {
    if (t === r)
      return;
    if (e === ut) {
      const l = this._hostVisible, s = St(this);
      if (s === l)
        return;
      this._hostVisible = s, this.isConnected && this._initialized && (this._reactive?.notifyHostVisibility(s, l), this.onHostVisibilityChanged(s, l));
      return;
    }
    const n = this.constructor.wippyConfig, { props: o, errors: i } = it(this, n.propsSchema);
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
function cn(e) {
  return e.__wippyHostBus ?? null;
}
function pn(e) {
  return e.dataset.wippyPanelId ?? null;
}
/*!
 * pinia v4.0.3
 * (c) 2026 Eduardo San Martin Morote
 * @license MIT
 */
let or;
const ar = (e) => or = e, un = () => Tr() && vt(ir) || or, ir = (
  /* istanbul ignore next */
  Symbol()
);
function dn() {
  const e = Pr(!0), t = e.run(() => E({}));
  let r = [], n = [];
  const o = $r({
    install(i) {
      ar(o), o._a = i, i.provide(ir, o), i.config.globalProperties.$pinia = o, n.forEach((a) => r.push(a)), n = [];
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
var hn = Object.defineProperty, mn = (e, t, r) => t in e ? hn(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : e[t] = r, we = (e, t, r) => mn(e, typeof t != "symbol" ? t + "" : t, r), sr = /* @__PURE__ */ Symbol("wippy:emit"), lr = /* @__PURE__ */ Symbol("wippy:props"), fn = /* @__PURE__ */ Symbol("wippy:props_error"), vn = /* @__PURE__ */ Symbol("wippy:content"), gn = /* @__PURE__ */ Symbol("wippy:panel-id"), yn = /* @__PURE__ */ Symbol("wippy:layout-bus"), bn = /* @__PURE__ */ Symbol("wippy:host"), wn = /* @__PURE__ */ Symbol("wippy:host-visibility");
function Da() {
  const e = vt(lr);
  if (!e)
    throw new Error("useProps() must be called inside a WippyVueElement");
  return e;
}
function Ha() {
  const e = vt(sr);
  if (!e)
    throw new Error("useEvents() must be called inside a WippyVueElement");
  return e;
}
var Ba = class extends ln {
  constructor() {
    super(...arguments), we(this, "_vueApp", null), we(this, "_propsRef", E({})), we(this, "_errorsRef", E([])), we(this, "_contentRef", E(null)), we(this, "_hostVisibilityRef", E(null)), we(this, "_bridgeAbort", null);
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
      const p = un(), u = Lr(c.rootComponent);
      this._vueApp = u;
      const d = dn();
      if (c.piniaPlugins)
        for (const h of c.piniaPlugins)
          d.use(h);
      if (u.use(d), c.plugins)
        for (const h of c.plugins)
          u.use(h);
      u.provide(lr, this._propsRef), u.provide(fn, this._errorsRef), u.provide(sr, this.emitEvent.bind(this)), u.provide(vn, this._contentRef), u.provide(wn, this._hostVisibilityRef), u.provide(gn, pn(this)), u.provide(yn, cn(this)), u.provide(bn, nr(this)), c.providers && c.providers(u, this), u.mount(t), p && ar(p);
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
}, xn = Object.defineProperty, Et = Object.getOwnPropertySymbols, kn = Object.prototype.hasOwnProperty, _n = Object.prototype.propertyIsEnumerable, Ot = (e, t, r) => t in e ? xn(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : e[t] = r, Sn = (e, t) => {
  for (var r in t || (t = {})) kn.call(t, r) && Ot(e, r, t[r]);
  if (Et) for (var r of Et(t)) _n.call(t, r) && Ot(e, r, t[r]);
  return e;
};
function gt(e) {
  return e == null || e === "" || Array.isArray(e) && e.length === 0 || !(e instanceof Date) && typeof e == "object" && Object.keys(e).length === 0;
}
function Cn(e) {
  return typeof e == "function" && "call" in e && "apply" in e;
}
function R(e) {
  return !gt(e);
}
function de(e, t = !0) {
  return e instanceof Object && e.constructor === Object && (t || Object.keys(e).length !== 0);
}
function cr(e = {}, t = {}) {
  let r = Sn({}, e);
  return Object.keys(t).forEach((n) => {
    let o = n;
    de(t[o]) && o in e && de(e[o]) ? r[o] = cr(e[o], t[o]) : r[o] = t[o];
  }), r;
}
function En(...e) {
  return e.reduce((t, r, n) => n === 0 ? r : cr(t, r), {});
}
function Z(e, ...t) {
  return Cn(e) ? e(...t) : e;
}
function he(e, t = !0) {
  return typeof e == "string" && (t || e !== "");
}
function Tt(e) {
  return he(e) ? e.replace(/(-|_)/g, "").toLowerCase() : e;
}
function On(e, t = "", r = {}) {
  let n = Tt(t).split("."), o = n.shift();
  if (o) {
    if (de(e)) {
      let i = Object.keys(e).find((a) => Tt(a) === o) || "";
      return On(Z(e[i], r), n.join("."), r);
    }
    return;
  }
  return Z(e, r);
}
function Fa(e, t = !0) {
  return Array.isArray(e) && (t || e.length !== 0);
}
function Tn(e) {
  return R(e) && !isNaN(e);
}
function ve(e, t) {
  if (t) {
    let r = t.test(e);
    return t.lastIndex = 0, r;
  }
  return !1;
}
function Pn(...e) {
  return En(...e);
}
function Oe(e) {
  return e && e.replace(/\/\*(?:(?!\*\/)[\s\S])*\*\/|[\r\n\t]+/g, "").replace(/ {2,}/g, " ").replace(/ ([{:}]) /g, "$1").replace(/([;,]) /g, "$1").replace(/ !/g, "!").replace(/: /g, ":").trim();
}
function Wa(e) {
  return he(e, !1) ? e[0].toUpperCase() + e.slice(1) : e;
}
function pr(e) {
  return he(e) ? e.replace(/(_)/g, "-").replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase() : e;
}
function ur() {
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
function $n(e, t) {
  return e ? e.classList ? e.classList.contains(t) : new RegExp("(^| )" + t + "( |$)", "gi").test(e.className) : !1;
}
function Ua(e, t) {
  if (e && t) {
    let r = (n) => {
      $n(e, n) || (e.classList ? e.classList.add(n) : e.className += " " + n);
    };
    [t].flat().filter(Boolean).forEach((n) => n.split(" ").forEach(r));
  }
}
function qa(e, t) {
  if (e && t) {
    let r = (n) => {
      e.classList ? e.classList.remove(n) : e.className = e.className.replace(new RegExp("(^|\\b)" + n.split(" ").join("|") + "(\\b|$)", "gi"), " ");
    };
    [t].flat().filter(Boolean).forEach((n) => n.split(" ").forEach(r));
  }
}
function Pt(e) {
  return e ? Math.abs(e.scrollLeft) : 0;
}
function Ka(e, t) {
  return e instanceof HTMLElement ? e.offsetWidth : 0;
}
function Ln(e) {
  if (e) {
    let t = e.parentNode;
    return t && t instanceof ShadowRoot && t.host && (t = t.host), t;
  }
  return null;
}
function An(e) {
  return !!(e !== null && typeof e < "u" && e.nodeName && Ln(e));
}
function qe(e) {
  return typeof Element < "u" ? e instanceof Element : e !== null && typeof e == "object" && e.nodeType === 1 && typeof e.nodeName == "string";
}
function Be(e, t = {}) {
  if (qe(e)) {
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
        i ? e.addEventListener(i[1].toLowerCase(), o) : n === "p-bind" || n === "pBind" ? Be(e, o) : (o = n === "class" ? [...new Set(r("class", o))].join(" ").trim() : n === "style" ? r("style", o).join(";").trim() : o, (e.$attrs = e.$attrs || {}) && (e.$attrs[n] = o), e.setAttribute(n, o));
      }
    });
  }
}
function Ya(e, t = {}, ...r) {
  {
    let n = document.createElement(e);
    return Be(n, t), n.append(...r), n;
  }
}
function Ga(e, t) {
  return qe(e) ? e.matches(t) ? e : e.querySelector(t) : null;
}
function Ja(e, t) {
  if (qe(e)) {
    let r = e.getAttribute(t);
    return isNaN(r) ? r === "true" || r === "false" ? r === "true" : r : +r;
  }
}
function Qa(e) {
  if (e) {
    let t = e.offsetHeight, r = getComputedStyle(e);
    return t -= parseFloat(r.paddingTop) + parseFloat(r.paddingBottom) + parseFloat(r.borderTopWidth) + parseFloat(r.borderBottomWidth), t;
  }
  return 0;
}
function Za(e) {
  if (e) {
    let t = e.getBoundingClientRect();
    return { top: t.top + (window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0), left: t.left + (window.pageXOffset || Pt(document.documentElement) || Pt(document.body) || 0) };
  }
  return { top: "auto", left: "auto" };
}
function Xa(e, t) {
  return e ? e.offsetHeight : 0;
}
function ei(e) {
  if (e) {
    let t = e.offsetWidth, r = getComputedStyle(e);
    return t -= parseFloat(r.paddingLeft) + parseFloat(r.paddingRight) + parseFloat(r.borderLeftWidth) + parseFloat(r.borderRightWidth), t;
  }
  return 0;
}
function dr() {
  return !!(typeof window < "u" && window.document && window.document.createElement);
}
function Nn(e, t = "", r) {
  qe(e) && r !== null && r !== void 0 && e.setAttribute(t, r);
}
var Rn = Object.defineProperty, jn = Object.defineProperties, Mn = Object.getOwnPropertyDescriptors, Fe = Object.getOwnPropertySymbols, hr = Object.prototype.hasOwnProperty, mr = Object.prototype.propertyIsEnumerable, $t = (e, t, r) => t in e ? Rn(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : e[t] = r, G = (e, t) => {
  for (var r in t || (t = {})) hr.call(t, r) && $t(e, r, t[r]);
  if (Fe) for (var r of Fe(t)) mr.call(t, r) && $t(e, r, t[r]);
  return e;
}, st = (e, t) => jn(e, Mn(t)), ie = (e, t) => {
  var r = {};
  for (var n in e) hr.call(e, n) && t.indexOf(n) < 0 && (r[n] = e[n]);
  if (e != null && Fe) for (var n of Fe(e)) t.indexOf(n) < 0 && mr.call(e, n) && (r[n] = e[n]);
  return r;
}, In = ur(), se = In, $e = /{([^}]*)}/g, fr = /(\d+\s+[\+\-\*\/]\s+\d+)/g, vr = /var\([^)]+\)/g;
function Lt(e) {
  return he(e) ? e.replace(/[A-Z]/g, (t, r) => r === 0 ? t : "." + t.toLowerCase()).toLowerCase() : e;
}
function Vn(e) {
  return de(e) && e.hasOwnProperty("$value") && e.hasOwnProperty("$type") ? e.$value : e;
}
function zn(e) {
  return e.replaceAll(/ /g, "").replace(/[^\w]/g, "-");
}
function dt(e = "", t = "") {
  return zn(`${he(e, !1) && he(t, !1) ? `${e}-` : e}${t}`);
}
function gr(e = "", t = "") {
  return `--${dt(e, t)}`;
}
function Dn(e = "") {
  let t = (e.match(/{/g) || []).length, r = (e.match(/}/g) || []).length;
  return (t + r) % 2 !== 0;
}
function yr(e, t = "", r = "", n = [], o) {
  if (he(e)) {
    let i = e.trim();
    if (Dn(i)) return;
    if (ve(i, $e)) {
      let a = i.replaceAll($e, (l) => {
        let s = l.replace(/{|}/g, "").split(".").filter((c) => !n.some((p) => ve(c, p)));
        return `var(${gr(r, pr(s.join("-")))}${R(o) ? `, ${o}` : ""})`;
      });
      return ve(a.replace(vr, "0"), fr) ? `calc(${a})` : a;
    }
    return i;
  } else if (Tn(e)) return e;
}
function Hn(e, t, r) {
  he(t, !1) && e.push(`${t}:${r};`);
}
function ke(e, t) {
  return e ? `${e}{${t}}` : "";
}
function br(e, t) {
  if (e.indexOf("dt(") === -1) return e;
  function r(a, l) {
    let s = [], c = 0, p = "", u = null, d = 0;
    for (; c <= a.length; ) {
      let h = a[c];
      if ((h === '"' || h === "'" || h === "`") && a[c - 1] !== "\\" && (u = u === h ? null : h), !u && (h === "(" && d++, h === ")" && d--, (h === "," || c === a.length) && d === 0)) {
        let b = p.trim();
        b.startsWith("dt(") ? s.push(br(b, l)) : s.push(n(b)), p = "", c++;
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
var ge = (...e) => Bn(V.getTheme(), ...e), Bn = (e = {}, t, r, n) => {
  if (t) {
    let { variable: o, options: i } = V.defaults || {}, { prefix: a, transform: l } = e?.options || i || {}, s = ve(t, $e) ? t : `{${t}}`;
    return n === "value" || gt(n) && l === "strict" ? V.getTokenValue(t) : yr(s, void 0, a, [o.excludedKeyRegex], r);
  }
  return "";
};
function Ie(e, ...t) {
  if (e instanceof Array) {
    let r = e.reduce((n, o, i) => {
      var a;
      return n + o + ((a = Z(t[i], { dt: ge })) != null ? a : "");
    }, "");
    return br(r, ge);
  }
  return Z(e, { dt: ge });
}
function Fn(e, t = {}) {
  let r = V.defaults.variable, { prefix: n = r.prefix, selector: o = r.selector, excludedKeyRegex: i = r.excludedKeyRegex } = t, a = [], l = [], s = [{ node: e, path: n }];
  for (; s.length; ) {
    let { node: p, path: u } = s.pop();
    for (let d in p) {
      let h = p[d], b = Vn(h), w = ve(d, i) ? dt(u) : dt(u, pr(d));
      if (de(b)) s.push({ node: b, path: w });
      else {
        let f = gr(w), y = yr(b, w, n, [i]);
        Hn(l, f, y);
        let _ = w;
        n && _.startsWith(n + "-") && (_ = _.slice(n.length + 1)), a.push(_.replace(/-/g, "."));
      }
    }
  }
  let c = l.join("");
  return { value: l, tokens: a, declarations: c, css: ke(o, c) };
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
    var n;
    return (n = t.map((o) => o.resolve(r)).find((o) => o.matched)) != null ? n : this.rules.custom.resolve(r);
  });
} }, _toVariables(e, t) {
  return Fn(e, { prefix: t?.prefix });
}, getCommon({ name: e = "", theme: t = {}, params: r, set: n, defaults: o }) {
  var i, a, l, s, c, p, u;
  let { preset: d, options: h } = t, b, w, f, y, _, x, k;
  if (R(d) && h.transform !== "strict") {
    let { primitive: v, semantic: $, extend: O } = d, A = $ || {}, { colorScheme: M } = A, F = ie(A, ["colorScheme"]), J = O || {}, { colorScheme: X } = J, ee = ie(J, ["colorScheme"]), W = M || {}, { dark: te } = W, z = ie(W, ["dark"]), re = X || {}, { dark: ce } = re, Q = ie(re, ["dark"]), U = R(v) ? this._toVariables({ primitive: v }, h) : {}, B = R(F) ? this._toVariables({ semantic: F }, h) : {}, ne = R(z) ? this._toVariables({ light: z }, h) : {}, me = R(te) ? this._toVariables({ dark: te }, h) : {}, oe = R(ee) ? this._toVariables({ semantic: ee }, h) : {}, Re = R(Q) ? this._toVariables({ light: Q }, h) : {}, Se = R(ce) ? this._toVariables({ dark: ce }, h) : {}, [Ke, Ye] = [(i = U.declarations) != null ? i : "", U.tokens], [Ge, Je] = [(a = B.declarations) != null ? a : "", B.tokens || []], [Qe, Ze] = [(l = ne.declarations) != null ? l : "", ne.tokens || []], [je, Xe] = [(s = me.declarations) != null ? s : "", me.tokens || []], [et, tt] = [(c = oe.declarations) != null ? c : "", oe.tokens || []], [rt, nt] = [(p = Re.declarations) != null ? p : "", Re.tokens || []], [m, C] = [(u = Se.declarations) != null ? u : "", Se.tokens || []];
    b = this.transformCSS(e, Ke, "light", "variable", h, n, o), w = Ye;
    let pe = this.transformCSS(e, `${Ge}${Qe}`, "light", "variable", h, n, o), ue = this.transformCSS(e, `${je}`, "dark", "variable", h, n, o);
    f = `${pe}${ue}`, y = [.../* @__PURE__ */ new Set([...Je, ...Ze, ...Xe])];
    let q = this.transformCSS(e, `${et}${rt}color-scheme:light`, "light", "variable", h, n, o), Ce = this.transformCSS(e, `${m}color-scheme:dark`, "dark", "variable", h, n, o);
    _ = `${q}${Ce}`, x = [.../* @__PURE__ */ new Set([...tt, ...nt, ...C])], k = Z(d.css, { dt: ge });
  }
  return { primitive: { css: b, tokens: w }, semantic: { css: f, tokens: y }, global: { css: _, tokens: x }, style: k };
}, getPreset({ name: e = "", preset: t = {}, options: r, params: n, set: o, defaults: i, selector: a }) {
  var l, s, c;
  let p, u, d;
  if (R(t) && r.transform !== "strict") {
    let h = e.replace("-directive", ""), b = t, { colorScheme: w, extend: f, css: y } = b, _ = ie(b, ["colorScheme", "extend", "css"]), x = f || {}, { colorScheme: k } = x, v = ie(x, ["colorScheme"]), $ = w || {}, { dark: O } = $, A = ie($, ["dark"]), M = k || {}, { dark: F } = M, J = ie(M, ["dark"]), X = R(_) ? this._toVariables({ [h]: G(G({}, _), v) }, r) : {}, ee = R(A) ? this._toVariables({ [h]: G(G({}, A), J) }, r) : {}, W = R(O) ? this._toVariables({ [h]: G(G({}, O), F) }, r) : {}, [te, z] = [(l = X.declarations) != null ? l : "", X.tokens || []], [re, ce] = [(s = ee.declarations) != null ? s : "", ee.tokens || []], [Q, U] = [(c = W.declarations) != null ? c : "", W.tokens || []], B = this.transformCSS(h, `${te}${re}`, "light", "variable", r, o, i, a), ne = this.transformCSS(h, Q, "dark", "variable", r, o, i, a);
    p = `${B}${ne}`, u = [.../* @__PURE__ */ new Set([...z, ...ce, ...U])], d = Z(y, { dt: ge });
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
  return o ? `@layer ${Z(o.order || o.name || "primeui", r)}` : "";
}, getCommonStyleSheet({ name: e = "", theme: t = {}, params: r, props: n = {}, set: o, defaults: i }) {
  let a = this.getCommon({ name: e, theme: t, params: r, set: o, defaults: i }), l = Object.entries(n).reduce((s, [c, p]) => s.push(`${c}="${p}"`) && s, []).join(" ");
  return Object.entries(a || {}).reduce((s, [c, p]) => {
    if (de(p) && Object.hasOwn(p, "css")) {
      let u = Oe(p.css), d = `${c}-variables`;
      s.push(`<style type="text/css" data-primevue-style-id="${d}" ${l}>${u}</style>`);
    }
    return s;
  }, []).join("");
}, getStyleSheet({ name: e = "", theme: t = {}, params: r, props: n = {}, set: o, defaults: i }) {
  var a;
  let l = { name: e, theme: t, params: r, set: o, defaults: i }, s = (a = e.includes("-directive") ? this.getPresetD(l) : this.getPresetC(l)) == null ? void 0 : a.css, c = Object.entries(n).reduce((p, [u, d]) => p.push(`${u}="${d}"`) && p, []).join(" ");
  return s ? `<style type="text/css" data-primevue-style-id="${e}-variables" ${c}>${Oe(s)}</style>` : "";
}, createTokens(e = {}, t, r = "", n = "", o = {}) {
  let i = function(l, s = {}, c = []) {
    if (c.includes(this.path)) return console.warn(`Circular reference detected at ${this.path}`), { colorScheme: l, path: this.path, paths: s, value: void 0 };
    c.push(this.path), s.name = this.path, s.binding || (s.binding = {});
    let p = this.value;
    if (typeof this.value == "string" && $e.test(this.value)) {
      let u = this.value.trim().replace($e, (d) => {
        var h;
        let b = d.slice(1, -1), w = this.tokens[b];
        if (!w) return console.warn(`Token not found for path: ${b}`), "__UNRESOLVED__";
        let f = w.computed(l, s, c);
        return Array.isArray(f) && f.length === 2 ? `light-dark(${f[0].value},${f[1].value})` : (h = f?.value) != null ? h : "__UNRESOLVED__";
      });
      p = fr.test(u.replace(vr, "0")) ? `calc(${u})` : u;
    }
    return gt(s.binding) && delete s.binding, c.pop(), { colorScheme: l, path: this.path, paths: s, value: p.includes("__UNRESOLVED__") ? void 0 : p };
  }, a = (l, s, c) => {
    Object.entries(l).forEach(([p, u]) => {
      let d = ve(p, t.variable.excludedKeyRegex) ? s : s ? `${s}.${Lt(p)}` : Lt(p), h = c ? `${c}.${p}` : p;
      de(u) ? a(u, d, h) : (o[d] || (o[d] = { paths: [], computed: (b, w = {}, f = []) => {
        if (o[d].paths.length === 1) return o[d].paths[0].computed(o[d].paths[0].scheme, w.binding, f);
        if (b && b !== "none") for (let y = 0; y < o[d].paths.length; y++) {
          let _ = o[d].paths[y];
          if (_.scheme === b) return _.computed(b, w.binding, f);
        }
        return o[d].paths.map((y) => y.computed(y.scheme, w[y.scheme], f));
      } }), o[d].paths.push({ path: h, value: u, scheme: h.includes("colorScheme.light") ? "light" : h.includes("colorScheme.dark") ? "dark" : "none", computed: i, tokens: o }));
    });
  };
  return a(e, r, n), o;
}, getTokenValue(e, t, r) {
  var n;
  let o = ((l) => l.split(".").filter((s) => !ve(s.toLowerCase(), r.variable.excludedKeyRegex)).join("."))(t), i = t.includes("colorScheme.light") ? "light" : t.includes("colorScheme.dark") ? "dark" : void 0, a = [(n = e[o]) == null ? void 0 : n.computed(i)].flat().filter((l) => l);
  return a.length === 1 ? a[0].value : a.reduce((l = {}, s) => {
    let c = s, { colorScheme: p } = c, u = ie(c, ["colorScheme"]);
    return l[p] = u, l;
  }, void 0);
}, getSelectorRule(e, t, r, n) {
  return r === "class" || r === "attr" ? ke(R(t) ? `${e}${t},${e} ${t}` : e, n) : ke(e, ke(t ?? ":root,:host", n));
}, transformCSS(e, t, r, n, o = {}, i, a, l) {
  if (R(t)) {
    let { cssLayer: s } = o;
    if (n !== "style") {
      let c = this.getColorSchemeOption(o, a);
      t = r === "dark" ? c.reduce((p, { type: u, selector: d }) => (R(d) && (p += d.includes("[CSS]") ? d.replace("[CSS]", t) : this.getSelectorRule(d, l, u, t)), p), "") : ke(l ?? ":root,:host", t);
    }
    if (s) {
      let c = { name: "primeui" };
      de(s) && (c.name = Z(s.name, { name: e, type: n })), R(c.name) && (t = ke(`@layer ${c.name}`, t), i?.layerNames(c.name));
    }
    return t;
  }
  return "";
} }, V = { defaults: { variable: { prefix: "p", selector: ":root,:host", excludedKeyRegex: /^(primitive|semantic|components|directives|variables|colorscheme|light|dark|common|root|states|extend|css)$/gi }, options: { prefix: "p", darkModeSelector: "system", cssLayer: !1 } }, _theme: void 0, _layerNames: /* @__PURE__ */ new Set(), _loadedStyleNames: /* @__PURE__ */ new Set(), _loadingStyles: /* @__PURE__ */ new Set(), _tokens: {}, update(e = {}) {
  let { theme: t } = e;
  t && (this._theme = st(G({}, t), { options: G(G({}, this.defaults.options), t.options) }), this._tokens = K.createTokens(this.preset, this.defaults), this.clearLoadedStyleNames());
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
  this.update({ theme: e }), se.emit("theme:change", e);
}, getPreset() {
  return this.preset;
}, setPreset(e) {
  this._theme = st(G({}, this.theme), { preset: e }), this._tokens = K.createTokens(e, this.defaults), this.clearLoadedStyleNames(), se.emit("preset:change", e), se.emit("theme:change", this.theme);
}, getOptions() {
  return this.options;
}, setOptions(e) {
  this._theme = st(G({}, this.theme), { options: e }), this.clearLoadedStyleNames(), se.emit("options:change", e), se.emit("theme:change", this.theme);
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
}, getCustomPreset(e = "", t, r, n) {
  let o = { name: e, preset: t, options: this.options, selector: r, params: n, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } };
  return K.getPreset(o);
}, getLayerOrderCSS(e = "") {
  return K.getLayerOrder(e, this.options, { names: this.getLayerNames() }, this.defaults);
}, transformCSS(e = "", t, r = "style", n) {
  return K.transformCSS(e, t, n, r, this.options, { layerNames: this.setLayerNames.bind(this) }, this.defaults);
}, getCommonStyleSheet(e = "", t, r = {}) {
  return K.getCommonStyleSheet({ name: e, theme: this.theme, params: t, props: r, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } });
}, getStyleSheet(e, t, r = {}) {
  return K.getStyleSheet({ name: e, theme: this.theme, params: t, props: r, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } });
}, onStyleMounted(e) {
  this._loadingStyles.add(e);
}, onStyleUpdated(e) {
  this._loadingStyles.add(e);
}, onStyleLoaded(e, { name: t }) {
  this._loadingStyles.size && (this._loadingStyles.delete(t), se.emit(`theme:${t}:load`, e), !this._loadingStyles.size && se.emit("theme:load"));
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
}, Wn = `
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
function Le(e) {
  "@babel/helpers - typeof";
  return Le = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, Le(e);
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
function Nt(e) {
  for (var t = 1; t < arguments.length; t++) {
    var r = arguments[t] != null ? arguments[t] : {};
    t % 2 ? At(Object(r), !0).forEach(function(n) {
      Un(e, n, r[n]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(r)) : At(Object(r)).forEach(function(n) {
      Object.defineProperty(e, n, Object.getOwnPropertyDescriptor(r, n));
    });
  }
  return e;
}
function Un(e, t, r) {
  return (t = qn(t)) in e ? Object.defineProperty(e, t, { value: r, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = r, e;
}
function qn(e) {
  var t = Kn(e, "string");
  return Le(t) == "symbol" ? t : t + "";
}
function Kn(e, t) {
  if (Le(e) != "object" || !e) return e;
  var r = e[Symbol.toPrimitive];
  if (r !== void 0) {
    var n = r.call(e, t);
    if (Le(n) != "object") return n;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
function Yn(e) {
  var t = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0;
  xt() && xt().components ? Jt(e) : t ? e() : Te(e);
}
var Gn = 0;
function Jn(e) {
  var t = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, r = E(!1), n = E(e), o = E(null), i = dr() ? window.document : void 0, a = t.document, l = a === void 0 ? i : a, s = t.immediate, c = s === void 0 ? !0 : s, p = t.manual, u = p === void 0 ? !1 : p, d = t.name, h = d === void 0 ? "style_".concat(++Gn) : d, b = t.id, w = b === void 0 ? void 0 : b, f = t.media, y = f === void 0 ? void 0 : f, _ = t.nonce, x = _ === void 0 ? void 0 : _, k = t.first, v = k === void 0 ? !1 : k, $ = t.onMounted, O = $ === void 0 ? void 0 : $, A = t.onUpdated, M = A === void 0 ? void 0 : A, F = t.onLoad, J = F === void 0 ? void 0 : F, X = t.props, ee = X === void 0 ? {} : X, W = function() {
  }, te = function(ce) {
    var Q = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    if (l) {
      var U = Nt(Nt({}, ee), Q), B = U.name || h, ne = U.id || w, me = U.nonce || x;
      o.value = l.querySelector('style[data-primevue-style-id="'.concat(B, '"]')) || l.getElementById(ne) || l.createElement("style"), o.value.isConnected || (n.value = ce || e, Be(o.value, {
        type: "text/css",
        id: ne,
        media: y,
        nonce: me
      }), v ? l.head.prepend(o.value) : l.head.appendChild(o.value), Nn(o.value, "data-primevue-style-id", B), Be(o.value, U), o.value.onload = function(oe) {
        return J?.(oe, {
          name: B
        });
      }, O?.(B)), !r.value && (W = H(n, function(oe) {
        o.value.textContent = oe, M?.(B);
      }, {
        immediate: !0
      }), r.value = !0);
    }
  }, z = function() {
    !l || !r.value || (W(), An(o.value) && l.head.removeChild(o.value), r.value = !1, o.value = null);
  };
  return c && !u && Yn(te), {
    id: w,
    name: h,
    el: o,
    css: n,
    unload: z,
    load: te,
    isLoaded: Ar(r)
  };
}
function Ae(e) {
  "@babel/helpers - typeof";
  return Ae = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, Ae(e);
}
var Rt, jt, Mt, It;
function Vt(e, t) {
  return eo(e) || Xn(e, t) || Zn(e, t) || Qn();
}
function Qn() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Zn(e, t) {
  if (e) {
    if (typeof e == "string") return zt(e, t);
    var r = {}.toString.call(e).slice(8, -1);
    return r === "Object" && e.constructor && (r = e.constructor.name), r === "Map" || r === "Set" ? Array.from(e) : r === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r) ? zt(e, t) : void 0;
  }
}
function zt(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var r = 0, n = Array(t); r < t; r++) n[r] = e[r];
  return n;
}
function Xn(e, t) {
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
function eo(e) {
  if (Array.isArray(e)) return e;
}
function Dt(e, t) {
  var r = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var n = Object.getOwnPropertySymbols(e);
    t && (n = n.filter(function(o) {
      return Object.getOwnPropertyDescriptor(e, o).enumerable;
    })), r.push.apply(r, n);
  }
  return r;
}
function lt(e) {
  for (var t = 1; t < arguments.length; t++) {
    var r = arguments[t] != null ? arguments[t] : {};
    t % 2 ? Dt(Object(r), !0).forEach(function(n) {
      to(e, n, r[n]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(r)) : Dt(Object(r)).forEach(function(n) {
      Object.defineProperty(e, n, Object.getOwnPropertyDescriptor(r, n));
    });
  }
  return e;
}
function to(e, t, r) {
  return (t = ro(t)) in e ? Object.defineProperty(e, t, { value: r, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = r, e;
}
function ro(e) {
  var t = no(e, "string");
  return Ae(t) == "symbol" ? t : t + "";
}
function no(e, t) {
  if (Ae(e) != "object" || !e) return e;
  var r = e[Symbol.toPrimitive];
  if (r !== void 0) {
    var n = r.call(e, t);
    if (Ae(n) != "object") return n;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
function Ve(e, t) {
  return t || (t = e.slice(0)), Object.freeze(Object.defineProperties(e, { raw: { value: Object.freeze(t) } }));
}
var oo = function(t) {
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
}, ao = {}, io = {}, xe = {
  name: "base",
  css: oo,
  style: Wn,
  classes: ao,
  inlineStyles: io,
  load: function(t) {
    var r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, n = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : function(i) {
      return i;
    }, o = n(Ie(Rt || (Rt = Ve(["", ""])), t));
    return R(o) ? Jn(Oe(o), lt({
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
      return V.transformCSS(r.name || t.name, "".concat(o).concat(Ie(jt || (jt = Ve(["", ""])), n)));
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
  getPresetTheme: function(t, r, n) {
    return V.getCustomPreset(this.name, t, r, n);
  },
  getLayerOrderThemeCSS: function() {
    return V.getLayerOrderCSS(this.name);
  },
  getStyleSheet: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    if (this.css) {
      var n = Z(this.css, {
        dt: ge
      }) || "", o = Oe(Ie(Mt || (Mt = Ve(["", "", ""])), n, t)), i = Object.entries(r).reduce(function(a, l) {
        var s = Vt(l, 2), c = s[0], p = s[1];
        return a.push("".concat(c, '="').concat(p, '"')) && a;
      }, []).join(" ");
      return R(o) ? '<style type="text/css" data-primevue-style-id="'.concat(this.name, '" ').concat(i, ">").concat(o, "</style>") : "";
    }
    return "";
  },
  getCommonThemeStyleSheet: function(t) {
    var r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    return V.getCommonStyleSheet(this.name, t, r);
  },
  getThemeStyleSheet: function(t) {
    var r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, n = [V.getStyleSheet(this.name, t, r)];
    if (this.style) {
      var o = this.name === "base" ? "global-style" : "".concat(this.name, "-style"), i = Ie(It || (It = Ve(["", ""])), Z(this.style, {
        dt: ge
      })), a = Oe(V.transformCSS(o, i)), l = Object.entries(r).reduce(function(s, c) {
        var p = Vt(c, 2), u = p[0], d = p[1];
        return s.push("".concat(u, '="').concat(d, '"')) && s;
      }, []).join(" ");
      R(a) && n.push('<style type="text/css" data-primevue-style-id="'.concat(o, '" ').concat(l, ">").concat(a, "</style>"));
    }
    return n.join("");
  },
  extend: function(t) {
    return lt(lt({}, this), {}, {
      css: void 0,
      style: void 0
    }, t);
  }
}, ze = ur();
function Ne(e) {
  "@babel/helpers - typeof";
  return Ne = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, Ne(e);
}
function Ht(e, t) {
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
    t % 2 ? Ht(Object(r), !0).forEach(function(n) {
      so(e, n, r[n]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(r)) : Ht(Object(r)).forEach(function(n) {
      Object.defineProperty(e, n, Object.getOwnPropertyDescriptor(r, n));
    });
  }
  return e;
}
function so(e, t, r) {
  return (t = lo(t)) in e ? Object.defineProperty(e, t, { value: r, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = r, e;
}
function lo(e) {
  var t = co(e, "string");
  return Ne(t) == "symbol" ? t : t + "";
}
function co(e, t) {
  if (Ne(e) != "object" || !e) return e;
  var r = e[Symbol.toPrimitive];
  if (r !== void 0) {
    var n = r.call(e, t);
    if (Ne(n) != "object") return n;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var po = {
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
}, uo = Symbol();
function ho(e, t) {
  var r = {
    config: Nr(t)
  };
  return e.config.globalProperties.$primevue = r, e.provide(uo, r), mo(), fo(e, r), r;
}
var _e = [];
function mo() {
  se.clear(), _e.forEach(function(e) {
    return e?.();
  }), _e = [];
}
function fo(e, t) {
  var r = E(!1), n = function() {
    var c;
    if (((c = t.config) === null || c === void 0 ? void 0 : c.theme) !== "none" && !V.isStyleNameLoaded("common")) {
      var p, u, d = ((p = xe.getCommonTheme) === null || p === void 0 ? void 0 : p.call(xe)) || {}, h = d.primitive, b = d.semantic, w = d.global, f = d.style, y = {
        nonce: (u = t.config) === null || u === void 0 || (u = u.csp) === null || u === void 0 ? void 0 : u.nonce
      };
      xe.load(h?.css, De({
        name: "primitive-variables"
      }, y)), xe.load(b?.css, De({
        name: "semantic-variables"
      }, y)), xe.load(w?.css, De({
        name: "global-variables"
      }, y)), xe.loadStyle(De({
        name: "global-style"
      }, y), f), V.setLoadedStyleName("common");
    }
  };
  se.on("theme:change", function(s) {
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
    r.value || V.setTheme(s), t.config.unstyled || n(), r.value = !1, ze.emit("config:theme:change", {
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
  _e.push(o), _e.push(i), _e.push(a), _e.push(l);
}
var vo = {
  install: function(t, r) {
    var n = Pn(po, r);
    ho(t, n);
  }
}, wr = {
  data: function() {
    return {
      mounted: !1
    };
  },
  mounted: function() {
    this.mounted = dr();
  },
  computed: {
    inline: function() {
      return this.disabled || this.appendTo === "self";
    }
  }
};
function go(e, t, r, n, o, i) {
  return i.inline ? Pe(e.$slots, "default", {
    key: 0
  }) : o.mounted ? (P(), Qt(Zt, {
    key: 1,
    to: r.appendTo
  }, [Pe(e.$slots, "default")], 8, ["to"])) : D("", !0);
}
wr.render = go;
const yo = "data-wippy-overlay-layer";
function xr() {
  return typeof window < "u" && typeof window.document < "u";
}
function kr() {
  return xr() && typeof HTMLElement < "u" && Object.hasOwn(HTMLElement.prototype, "popover");
}
function bo() {
  return kr() && typeof CSS < "u" && typeof CSS.supports == "function" && CSS.supports("anchor-name: --a") && CSS.supports("position-area", "bottom span-right") && CSS.supports("position-try-fallbacks", "flip-block") && CSS.supports("min-width", "min(anchor-size(width), 100vw)") && CSS.supports("max-width", "stretch");
}
const wo = /\bp-(?:select|multiselect|treeselect|cascadeselect)-overlay\b/;
let xo = 0;
const We = /* @__PURE__ */ new WeakMap();
function Bt(e, t) {
  const r = e.style;
  r.setProperty("position", "fixed", "important"), r.setProperty("inset", "auto", "important"), r.setProperty("margin", "0", "important"), r.setProperty("position-anchor", t), r.setProperty("position-area", "bottom span-right"), r.setProperty("position-try-fallbacks", "flip-block, flip-inline, flip-block flip-inline"), r.setProperty("min-width", "min(anchor-size(width), 100vw)", "important"), r.setProperty("max-width", "stretch", "important");
}
function ko(e, t) {
  if (!wo.test(e.className))
    return;
  const r = e.style.cssText;
  Bt(e, t), e.getAttribute("popover") !== "manual" && e.setAttribute("popover", "manual");
  try {
    e.matches(":popover-open") || e.showPopover();
  } catch {
  }
  if (!e.matches(":popover-open")) {
    e.removeAttribute("popover"), e.style.cssText = r;
    return;
  }
  if (!We.has(e)) {
    const n = new MutationObserver(() => {
      const o = e.style;
      (o.top !== "auto" || o.left !== "auto" || o.margin !== "0px" || o.getPropertyPriority("top") !== "important" || o.getPropertyPriority("left") !== "important" || o.getPropertyPriority("margin") !== "important" || o.getPropertyPriority("min-width") !== "important" || o.maxWidth !== "stretch" || o.getPropertyPriority("max-width") !== "important") && Bt(e, t);
    });
    n.observe(e, { attributes: !0, attributeFilter: ["style"] }), We.set(e, n);
  }
}
function yt(e) {
  const t = We.get(e);
  t && (t.disconnect(), We.delete(e));
}
function _o(e) {
  const t = e && typeof e.getRootNode == "function" ? e.getRootNode() : null;
  return t instanceof ShadowRoot ? t : null;
}
function ht(e) {
  e.style.top = "0px", e.style.left = "0px";
  const t = e.getBoundingClientRect();
  e.style.top = `${-window.scrollY - t.top}px`, e.style.left = `${-window.scrollX - t.left}px`;
}
const Ue = /* @__PURE__ */ new Set(), bt = /* @__PURE__ */ new WeakMap();
let Ft = !1, mt = !1;
function So() {
  mt = !1;
  for (const e of Ue) {
    if (!e.isConnected) {
      for (const t of Array.from(e.children))
        t instanceof HTMLElement && yt(t);
      Ue.delete(e), bt.get(e)?.disconnect();
      continue;
    }
    e.childElementCount > 0 && ht(e);
  }
}
function Wt() {
  mt || (mt = !0, requestAnimationFrame(So));
}
function Co(e) {
  const t = document.createElement("div");
  t.setAttribute(yo, "");
  const r = kr();
  if (t.style.cssText = r ? "position:fixed;width:0 !important;height:0 !important;margin:0 !important;border:0 !important;padding:0 !important;background:transparent !important;color:inherit !important;overflow:visible !important;" : "position:fixed;top:0;left:0;width:0;height:0;", r && t.setAttribute("popover", "manual"), e.appendChild(t), r) {
    try {
      t.showPopover();
    } catch {
    }
    t.matches(":popover-open") || (t.removeAttribute("popover"), t.style.cssText = "position:fixed;top:0;left:0;width:0;height:0;");
  }
  ht(t);
  const n = new MutationObserver((o) => {
    const i = t.__wippyAnchorName;
    for (const a of o) {
      if (i)
        for (const l of Array.from(a.addedNodes))
          l instanceof HTMLElement && ko(l, i);
      for (const l of Array.from(a.removedNodes))
        l instanceof HTMLElement && yt(l);
    }
    t.isConnected && t.childElementCount > 0 && ht(t);
  });
  return n.observe(t, { childList: !0 }), bt.set(t, n), Ue.add(t), Ft || (Ft = !0, window.addEventListener("scroll", Wt, { capture: !0, passive: !0 }), window.addEventListener("resize", Wt, { passive: !0 })), t;
}
function Ut(e) {
  if (!(!e.hostRoot || e.layer) && (e.layer = Co(e.hostRoot), bo())) {
    const t = e.$el ? e.$el.parentElement : null;
    t && (e.anchorName = `--wippy-a-${++xo}`, e.anchorTrigger = t, t.style.setProperty("anchor-name", e.anchorName), e.layer.__wippyAnchorName = e.anchorName);
  }
}
function qt(e) {
  if (e.anchorTrigger && (e.anchorTrigger.style.removeProperty("anchor-name"), e.anchorTrigger = null), e.anchorName = null, e.layer) {
    for (const t of Array.from(e.layer.children))
      t instanceof HTMLElement && yt(t);
    Ue.delete(e.layer), bt.get(e.layer)?.disconnect(), e.layer.remove(), e.layer = null;
  }
}
let Kt = !1;
function Eo() {
  if (Kt)
    return;
  Kt = !0;
  const e = wr;
  e.computed = e.computed || {}, e.computed.inline = function() {
    return !!this.disabled || this.appendTo === "self";
  }, e.computed.resolvedTarget = function() {
    return this.appendTo == null || this.appendTo === "body" ? this.hostRoot ? this.layer : document.body : this.appendTo;
  }, e.data = function() {
    return { mounted: !1, hostRoot: null, layer: null, anchorName: null, anchorTrigger: null };
  }, e.mounted = function() {
    xr() && (this.hostRoot = _o(this.$el), this.mounted = !0, this.hostRoot && (this.inline || Ut(this), this.$watch("inline", (t) => {
      t ? qt(this) : Ut(this);
    })));
  }, e.render = function() {
    return this.inline ? Pe(this.$slots, "default", { key: 0 }) : this.mounted ? Rr(Zt, { key: 1, to: this.resolvedTarget || document.body }, [
      Pe(this.$slots, "default")
    ]) : D("", !0);
  }, e.unmounted = function() {
    qt(this);
  };
}
const ti = {
  install: (e) => {
    Eo(), e.use(vo, { theme: "none" });
  }
};
function ct(e, t) {
  if (e && typeof e == "object") {
    const r = e, n = r.response?.data?.error;
    if (typeof n == "string") return n;
    if (n && typeof n == "object" && typeof n.message == "string")
      return n.message;
    if (typeof r.message == "string" && r.message) return r.message;
  }
  return t;
}
const Oo = { class: "kx-wcmount" }, To = {
  key: 0,
  class: "kx-wcmount-fail",
  role: "alert"
}, Po = /* @__PURE__ */ ye({
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
    const r = e, n = t, o = E(null), i = E(!1);
    let a = null, l = 0;
    const s = /* @__PURE__ */ new Set();
    function c(v) {
      v.composedPath()[0] === a && (v.stopPropagation(), n("change", v.detail));
    }
    function p(v) {
      return v.composedPath()[0] !== a ? !1 : (v.stopPropagation(), !0);
    }
    function u(v) {
      p(v) && n("select", v.detail);
    }
    function d(v) {
      p(v) && n("created", v.detail);
    }
    function h(v) {
      p(v) && n("close", v.detail);
    }
    function b(v) {
      p(v) && n("error", v.detail);
    }
    function w(v) {
      if (typeof v == "string") return v;
      try {
        return JSON.stringify(v ?? {});
      } catch {
        return null;
      }
    }
    function f() {
      if (!a) return;
      const v = w(r.config);
      if (v !== null && a.setAttribute("config", v), r.schema !== void 0 && r.schema !== null) {
        const O = w(r.schema);
        O !== null && a.setAttribute("schema", O);
      }
      if (r.meta !== void 0 && r.meta !== null) {
        const O = w(r.meta);
        O !== null && a.setAttribute("meta", O);
      }
      r.provider && a.setAttribute("provider", r.provider), r.label && a.setAttribute("label", r.label);
      const $ = r.attrs || {};
      for (const O of [...s])
        (!(O in $) || $[O] == null) && (a.removeAttribute(O), s.delete(O));
      for (const [O, A] of Object.entries($)) {
        if (A == null) continue;
        const M = typeof A == "object" ? w(A) : String(A);
        M !== null && (a.setAttribute(O, M), s.add(O));
      }
    }
    function y(v = a) {
      v && (v.removeEventListener("config-changed", c), v.removeEventListener("change", c), v.removeEventListener("select", u), v.removeEventListener("created", d), v.removeEventListener("close", h), v.removeEventListener("error", b), v === a && (a = null), s.clear());
    }
    async function _(v) {
      if (!customElements.get(v))
        try {
          await Kr(v, { timeoutMs: 8e3 });
        } catch {
        }
    }
    async function x() {
      const v = ++l, $ = o.value, O = r.tag;
      if (i.value = !1, !!$ && (y(), $.innerHTML = "", !!O))
        try {
          if (await _(O), v !== l || o.value !== $ || r.tag !== O) return;
          const A = document.createElement(O);
          A.classList.add("kx-wcmount-surface"), a = A, f(), A.addEventListener("config-changed", c), A.addEventListener("change", c), A.addEventListener("select", u), A.addEventListener("created", d), A.addEventListener("close", h), A.addEventListener("error", b), A.style.display = "block", $.appendChild(A), i.value = !customElements.get(O);
        } catch {
          v === l && (i.value = !0);
        }
    }
    async function k() {
      i.value = !1, await Te(), await x();
    }
    return Jt(x), H(() => r.tag, x), H(() => [r.config, r.schema, r.meta, r.provider, r.label, r.attrs], f, { deep: !0 }), Xt(() => {
      l += 1, y();
    }), (v, $) => (P(), L("div", Oo, [
      i.value ? (P(), L("div", To, [
        $[0] || ($[0] = S("span", null, "This setup panel couldn’t load.", -1)),
        S("button", {
          type: "button",
          onClick: k
        }, "Try again")
      ])) : (P(), L("div", {
        key: 1,
        ref_key: "host",
        ref: o
      }, null, 512))
    ]));
  }
}), $o = (e, t) => {
  const r = e.__vccOpts || e;
  for (const [n, o] of t)
    r[n] = o;
  return r;
}, ft = /* @__PURE__ */ $o(Po, [["__scopeId", "data-v-3d6a00f1"]]), Lo = { class: "kx-stage" }, Ao = { class: "kx-stage-head" }, No = { class: "kx-stage-ico" }, Ro = {
  class: "kx-stage-cfg",
  "data-test": "pl-trigger"
}, jo = "kickside-trigger-config", Mo = /* @__PURE__ */ ye({
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
    return (i, a) => (P(), L("div", Lo, [
      S("div", Ao, [
        S("span", No, [
          j(g(le), {
            icon: r.icon,
            "aria-hidden": "true"
          }, null, 8, ["icon"])
        ]),
        a[0] || (a[0] = S("span", { class: "kx-stage-lbl" }, "Source", -1))
      ]),
      S("div", Ro, [
        j(ft, {
          tag: jo,
          attrs: { allowed: "source", reconfigure: r.editing ? "true" : null, value: r.seed },
          onChange: o
        }, null, 8, ["attrs"])
      ])
    ]));
  }
}), Io = { class: "kx-stage kx-stage-mid" }, Vo = { class: "kx-stage-head" }, zo = { class: "kx-stage-ico" }, Do = {
  key: 0,
  class: "kx-stage-desc",
  "data-test": "pl-transform-hint"
}, Ho = {
  key: 1,
  class: "kx-stage-desc",
  role: "alert"
}, Bo = "kickside-transform-assist", Fo = /* @__PURE__ */ ye({
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
    const r = e, n = t;
    function o(i) {
      n("transform-confirmed", i);
    }
    return (i, a) => (P(), L("div", Io, [
      S("div", Vo, [
        S("span", zo, [
          j(g(le), {
            icon: "tabler:transform",
            "aria-hidden": "true"
          })
        ]),
        a[0] || (a[0] = S("span", { class: "kx-stage-lbl" }, "Transform", -1))
      ]),
      r.canAssist ? (P(), L(fe, { key: 1 }, [
        r.detected && (!r.transform || r.transform.kind === "none") ? (P(), L("div", {
          key: 0,
          class: er(["kx-detect", r.detected.needed && "kx-detect-warn"])
        }, [
          j(g(le), {
            icon: r.detected.needed ? "tabler:alert-triangle" : "tabler:circle-check",
            "aria-hidden": "true"
          }, null, 8, ["icon"]),
          S("span", null, Y(r.detected.reason), 1)
        ], 2)) : D("", !0),
        r.sampleError ? (P(), L("p", Ho, Y(r.sampleError), 1)) : D("", !0),
        (P(), Qt(jr(Bo), {
          "data-test": "pl-transform",
          samples: r.samples,
          "source-schema": r.sourceSchema,
          "sink-schema": r.sinkSchema,
          "input-shape": r.inputShape,
          hint: r.hint,
          value: r.value,
          "generation-policy": r.generationPolicy,
          onTransformConfirmed: o
        }, null, 40, ["samples", "source-schema", "sink-schema", "input-shape", "hint", "value", "generation-policy"]))
      ], 64)) : (P(), L("p", Do, "Pick a source and destination to define the transform."))
    ]));
  }
}), Wo = 2e3;
function Yt(e) {
  const t = e.margin ?? 8, r = e.gap ?? 4, n = Math.max(0, e.viewportWidth), o = Math.max(0, e.viewportHeight), i = Math.max(0, n - t * 2), a = Math.min(Math.max(0, e.requestedWidth), i), l = e.align === "right" ? e.anchor.right - a : e.anchor.left, s = Math.max(t, Math.min(l, n - t - a)), c = Math.max(0, o - e.anchor.bottom - r - t), p = Math.max(0, e.anchor.top - r - t), u = c < e.requestedMaxHeight && p > c ? "above" : "below", d = u === "above" ? p : c, h = Math.round(Math.min(Math.max(0, e.requestedMaxHeight), d)), b = Math.min(Math.max(0, e.panelHeight ?? h), h), w = u === "above" ? e.anchor.top - r - b : e.anchor.bottom + r, f = e.containingBlockOrigin ?? { left: 0, top: 0 };
  return {
    left: Math.round(s - f.left),
    width: Math.round(a),
    maxHeight: h,
    side: u,
    top: Math.round(w - f.top)
  };
}
const Uo = /* @__PURE__ */ ye({
  __name: "AnchoredPanel",
  props: {
    open: { type: Boolean },
    anchor: {},
    align: { default: "left" },
    width: { default: "anchor" },
    minWidth: { default: 0 },
    maxHeight: { default: 340 },
    gap: { default: 4 },
    zIndex: { default: Wo }
  },
  emits: ["update:open"],
  setup(e, { emit: t }) {
    const r = e, n = t, o = E(null), i = E({ position: "fixed", visibility: "hidden" });
    function a() {
      const w = r.anchor, f = o.value;
      if (!w || !f) return;
      const y = w.getBoundingClientRect(), _ = r.width === "anchor" ? Math.max(r.minWidth, y.width) : Math.max(r.minWidth, r.width), x = {
        anchor: y,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
        requestedWidth: _,
        requestedMaxHeight: r.maxHeight,
        align: r.align,
        gap: r.gap
      }, k = Yt(x);
      Object.assign(f.style, {
        position: "fixed",
        left: "0px",
        top: "0px",
        right: "auto",
        bottom: "auto",
        width: `${k.width}px`,
        maxHeight: `${k.maxHeight}px`,
        visibility: "hidden"
      });
      const v = f.getBoundingClientRect(), $ = Yt({
        ...x,
        containingBlockOrigin: { left: v.left, top: v.top },
        panelHeight: v.height
      }), O = {
        position: "fixed",
        left: `${$.left}px`,
        top: `${$.top}px`,
        width: `${$.width}px`,
        maxHeight: `${$.maxHeight}px`,
        "--anchored-panel-available-height": `${$.maxHeight}px`,
        margin: "0",
        zIndex: String(r.zIndex),
        visibility: "visible"
      };
      i.value = O;
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
    H(() => r.open, async (w) => {
      u(), w && (i.value = { position: "fixed", visibility: "hidden" }, await Te(), a(), p());
    }, { immediate: !0 });
    function d(w) {
      if (!r.open) return;
      const f = w.composedPath();
      o.value && f.includes(o.value) || r.anchor && f.includes(r.anchor) || n("update:open", !1);
    }
    function h(w) {
      r.open && w.key === "Escape" && n("update:open", !1);
    }
    function b() {
      r.open && a();
    }
    return document.addEventListener("click", d), document.addEventListener("keydown", h), window.addEventListener("resize", b), window.addEventListener("scroll", b, !0), Xt(() => {
      u(), document.removeEventListener("click", d), document.removeEventListener("keydown", h), window.removeEventListener("resize", b), window.removeEventListener("scroll", b, !0);
    }), (w, f) => e.open ? (P(), L("div", {
      key: 0,
      ref_key: "panel",
      ref: o,
      class: "anchored-panel",
      style: Mr(i.value)
    }, [
      Pe(w.$slots, "default")
    ], 4)) : D("", !0);
  }
}), qo = ["aria-expanded", "aria-controls", "aria-label", "disabled"], Ko = { class: "p-select-label" }, Yo = {
  key: 0,
  class: "kx-ps-val"
}, Go = { class: "kx-ps-val-label" }, Jo = {
  key: 1,
  class: "kx-ps-ph"
}, Qo = { class: "p-select-dropdown" }, Zo = { class: "p-select-overlay kx-ps-panel" }, Xo = { class: "p-select-header" }, ea = ["aria-label", "aria-controls", "aria-activedescendant"], ta = ["id", "aria-label"], ra = {
  class: "p-select-option-group",
  role: "presentation"
}, na = ["id", "aria-selected", "onClick", "onMousemove"], oa = { class: "kx-ps-opt-body" }, aa = { class: "kx-ps-opt-title" }, ia = {
  key: 0,
  class: "kx-ps-opt-sub"
}, sa = {
  key: 0,
  class: "p-select-empty-message",
  role: "status"
}, la = {
  key: 1,
  class: "p-select-empty-message",
  role: "presentation"
}, ca = {
  key: 0,
  class: "p-select-empty-message",
  role: "alert"
}, pa = ["disabled"], ua = /* @__PURE__ */ ye({
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
    const r = e, n = t, o = E(null), i = E(null), a = E(!1), l = E(""), s = E(0), c = Ir(), p = T(() => {
      const f = l.value.trim().toLowerCase(), y = /* @__PURE__ */ new Map();
      for (const x of r.items) {
        if (!r.remote && f && ![x.title, x.subtitle, x.id, x.group].some(($) => $?.toLowerCase().includes(f))) continue;
        const k = x.group || "Other", v = y.get(k);
        v ? v.push(x) : y.set(k, [x]);
      }
      let _ = 0;
      return [...y.entries()].sort((x, k) => x[0].localeCompare(k[0])).map(([x, k]) => ({ group: x, items: k.map((v) => ({ item: v, index: _++ })) }));
    }), u = T(() => p.value.flatMap((f) => f.items)), d = T(() => r.items.find((f) => f.id === r.modelValue)), h = T(() => u.value[s.value] ? `${c}-${s.value}` : void 0);
    H(l, () => {
      s.value = 0;
    }), H([a, l], ([f, y]) => {
      f && r.remote && n("search", y);
    }), H(() => r.disabled, (f) => {
      f && (a.value = !1);
    }), H(a, async (f) => {
      if (!f) {
        o.value?.focus();
        return;
      }
      l.value = "", s.value = Math.max(0, u.value.findIndex(({ item: y }) => y.id === r.modelValue)), await Te(), i.value?.focus();
    });
    function b(f) {
      r.disabled || r.loading || (n("update:modelValue", f.id), a.value = !1);
    }
    async function w(f) {
      if (f.key === "Escape" && a.value) {
        f.preventDefault(), f.stopPropagation(), a.value = !1;
        return;
      }
      if (!["ArrowDown", "ArrowUp", "Home", "End", "Enter"].includes(f.key)) return;
      if (f.preventDefault(), !a.value) {
        a.value = !0;
        return;
      }
      if (f.key === "Enter") {
        const x = u.value[s.value];
        x && b(x.item);
        return;
      }
      const y = u.value.length - 1;
      s.value = f.key === "Home" ? 0 : f.key === "End" ? y : Math.max(0, Math.min(y, s.value + (f.key === "ArrowDown" ? 1 : -1))), await Te(), o.value?.getRootNode()?.querySelector(`[id="${h.value}"]`)?.scrollIntoView({ block: "nearest" });
    }
    return (f, y) => (P(), L(fe, null, [
      S("button", {
        ref_key: "anchor",
        ref: o,
        type: "button",
        class: "kx-ps p-select",
        role: "combobox",
        "aria-haspopup": "listbox",
        "aria-expanded": a.value,
        "aria-controls": g(c),
        "aria-label": e.ariaLabel,
        disabled: e.disabled,
        onClick: y[0] || (y[0] = (_) => a.value = !a.value),
        onKeydown: w
      }, [
        S("span", Ko, [
          d.value ? (P(), L("span", Yo, [
            j(g(le), {
              icon: d.value.icon || "tabler:point",
              class: "kx-ps-val-ico",
              "aria-hidden": "true"
            }, null, 8, ["icon"]),
            S("span", Go, Y(d.value.title), 1)
          ])) : (P(), L("span", Jo, Y(e.placeholder || "Select…"), 1))
        ]),
        S("span", Qo, [
          j(g(le), {
            icon: "tabler:chevron-down",
            "aria-hidden": "true"
          })
        ])
      ], 40, qo),
      j(Uo, {
        open: a.value,
        "onUpdate:open": y[3] || (y[3] = (_) => a.value = _),
        anchor: o.value
      }, {
        default: Vr(() => [
          S("div", Zo, [
            S("div", Xo, [
              pt(S("input", {
                ref_key: "search",
                ref: i,
                "onUpdate:modelValue": y[1] || (y[1] = (_) => l.value = _),
                type: "search",
                class: "p-inputtext p-select-filter",
                "aria-label": `Search ${e.ariaLabel || e.placeholder || "options"}`,
                "aria-controls": g(c),
                "aria-activedescendant": h.value,
                onKeydown: w
              }, null, 40, ea), [
                [tr, l.value]
              ])
            ]),
            S("ul", {
              id: g(c),
              class: "p-select-list kx-ps-options",
              role: "listbox",
              "aria-label": e.ariaLabel || e.placeholder || "Options"
            }, [
              (P(!0), L(fe, null, kt(p.value, (_) => (P(), L(fe, {
                key: _.group
              }, [
                S("li", ra, Y(_.group), 1),
                (P(!0), L(fe, null, kt(_.items, ({ item: x, index: k }) => (P(), L("li", {
                  id: `${g(c)}-${k}`,
                  key: x.id,
                  class: er(["p-select-option kx-ps-option", { "p-select-option-selected": x.id === e.modelValue, "p-focus": k === s.value }]),
                  role: "option",
                  "aria-selected": x.id === e.modelValue,
                  onClick: (v) => b(x),
                  onMousemove: (v) => s.value = k
                }, [
                  j(g(le), {
                    icon: x.icon || "tabler:point",
                    class: "kx-ps-opt-ico",
                    "aria-hidden": "true"
                  }, null, 8, ["icon"]),
                  S("span", oa, [
                    S("span", aa, Y(x.title), 1),
                    x.subtitle ? (P(), L("span", ia, Y(x.subtitle), 1)) : D("", !0)
                  ])
                ], 42, na))), 128))
              ], 64))), 128)),
              e.loading ? (P(), L("li", sa, "Loading…")) : !u.value.length && !e.error ? (P(), L("li", la, "No matches")) : D("", !0)
            ], 8, ta),
            e.error ? (P(), L("div", ca, Y(e.error), 1)) : D("", !0),
            e.more ? (P(), L("button", {
              key: 1,
              type: "button",
              class: "p-button p-button-secondary",
              "data-testid": "picker-more",
              disabled: e.loading || e.disabled,
              onClick: y[2] || (y[2] = (_) => n("more"))
            }, "Load more", 8, pa)) : D("", !0)
          ])
        ]),
        _: 1
      }, 8, ["open", "anchor"])
    ], 64));
  }
}), da = { class: "kx-stage" }, ha = { class: "kx-stage-head" }, ma = { class: "kx-stage-ico" }, fa = {
  key: 0,
  class: "kx-stage-desc"
}, va = {
  key: 0,
  class: "kx-stage-desc"
}, ga = { class: "kx-stage-cfg" }, ya = {
  key: 0,
  class: "kx-stage-opts"
}, ba = /* @__PURE__ */ ye({
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
    lockedHint: {},
    sourceContext: {},
    sourceSchema: {}
  },
  emits: ["update:sinkId", "update:config", "binding"],
  setup(e, { emit: t }) {
    const r = e, n = t;
    function o(i) {
      i && typeof i == "object" && n("update:config", i);
    }
    return (i, a) => (P(), L("div", da, [
      S("div", ha, [
        S("span", ma, [
          j(g(le), {
            icon: r.selectedSink?.icon || "tabler:database",
            "aria-hidden": "true"
          }, null, 8, ["icon"])
        ]),
        a[2] || (a[2] = S("span", { class: "kx-stage-lbl" }, "Destination", -1))
      ]),
      j(ua, {
        items: r.items,
        "model-value": r.sinkId,
        disabled: r.editing,
        placeholder: "Pick a destination…",
        "onUpdate:modelValue": a[0] || (a[0] = (l) => n("update:sinkId", l))
      }, null, 8, ["items", "model-value", "disabled"]),
      r.editing ? (P(), L("p", fa, Y(r.lockedHint), 1)) : D("", !0),
      r.selectedSink && !r.editing ? (P(), L(fe, { key: 1 }, [
        r.selectedSink.description ? (P(), L("p", va, Y(r.selectedSink.description), 1)) : D("", !0),
        S("div", ga, [
          j(ft, {
            tag: r.configTag,
            schema: r.configSchema,
            config: r.config,
            meta: r.pickerMeta,
            provider: r.selectedSink.provider,
            attrs: { "source-context": r.sourceContext, "source-schema": r.sourceSchema, "return-route": "/automations" },
            onChange: o,
            onSelect: a[1] || (a[1] = (l) => n("binding", l))
          }, null, 8, ["tag", "schema", "config", "meta", "provider", "attrs"]),
          r.hasOptions ? (P(), L("div", ya, [
            a[3] || (a[3] = S("span", { class: "kx-opts-lbl" }, "Options", -1)),
            j(ft, {
              tag: "wc-schema-form",
              schema: r.optionsSchema,
              config: r.config,
              onChange: o
            }, null, 8, ["schema", "config"])
          ])) : D("", !0)
        ])
      ], 64)) : D("", !0)
    ]));
  }
});
function wa(e) {
  return !!(e && typeof e.picker == "string" && e.picker && e.picker !== "wc-schema-form");
}
function _r(e) {
  return e?.config_schema;
}
function Sr(e, t = "ports") {
  const r = _r(e);
  if (!r) return null;
  const n = [];
  for (const [p, u] of Object.entries(r))
    wa(u) && n.push([p, u]);
  if (n.length === 0) return null;
  n.length > 1 && console.error(`${t}: port schema declares multiple picker fields`, n.map(([p]) => p));
  const [o, i] = n[0], a = typeof i.class == "string" ? i.class : "", l = typeof i.title == "string" ? i.title : "", s = typeof i.detail == "string" ? i.detail : "", c = typeof i.delete_endpoint == "string" ? i.delete_endpoint : "";
  return { key: o, tag: i.picker ?? "", threadClass: a, title: l, schema: { properties: { [o]: i } }, detail: s, deleteEndpoint: c };
}
function xa(e, t = "ports") {
  const r = _r(e);
  if (!r) return null;
  const n = Sr(e, t)?.key, o = {};
  for (const [i, a] of Object.entries(r))
    i !== n && (o[i] = a);
  return Object.keys(o).length ? { type: "object", properties: o } : null;
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
function ka(e) {
  const t = He(e);
  return !!(t && t.properties && Object.keys(t.properties).length);
}
const _a = "_portable_input";
function Ee(e) {
  return e && typeof e == "object" && !Array.isArray(e) ? e : null;
}
function Sa(e) {
  const t = Ee(e);
  return t && typeof t.kind == "string" ? t : null;
}
function Ca(e) {
  return e === !0 ? !0 : void 0;
}
function Cr(e) {
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
function ri(e) {
  const t = Ee(e), r = Ee(t?.[_a]), n = Ee(r?.trigger), o = typeof r?.sink_port == "string" ? r.sink_port : "", i = Sa(r?.transform), a = t?.enabled;
  return !r || !n || !o || !i || typeof a != "boolean" ? null : Cr({
    title: typeof r.title == "string" ? r.title : "",
    trigger: n,
    sinkPort: o,
    sinkConfig: Ee(r.sink_config) ?? {},
    transform: i,
    outputSchema: r.output_schema,
    reconcile: Ca(r.reconcile),
    enabled: a
  });
}
const Ea = "wc-component-picker", Oa = "wc-schema-form", Gt = "Locked after install — reinstall the data sync to change it.";
function ni(e) {
  const t = e.managed, r = E(""), n = E(""), o = E({}), i = E(), a = E(!1), l = E(!0), s = E({ v: 2 }), c = E(!1), p = T(() => c.value && s.value.source ? {
    source: s.value.source,
    config: s.value.config || {},
    ...s.value.filter ? { filter: s.value.filter } : {}
  } : void 0), u = E(""), d = E(void 0), h = E(""), b = E(null), w = E([]), f = E([]), y = T(() => {
    const m = s.value.source;
    return typeof m == "string" ? m : "";
  }), _ = T(() => w.value.filter((m) => m.id === y.value)), x = T(() => _.value[0] || null), k = T(() => f.value.find((m) => m.id === n.value) || null);
  function v() {
    t || (a.value = !1);
  }
  function $() {
    o.value = {}, i.value = void 0, a.value = !1;
  }
  function O(m) {
    const C = m ?? {};
    if (!C.spec || typeof C.spec != "object" || Array.isArray(C.spec)) return;
    const pe = y.value;
    s.value = { ...C.spec }, c.value = C.valid === !0, u.value = typeof C.error == "string" ? C.error : "", C.output_schema !== void 0 && (d.value = C.output_schema), y.value !== pe && v();
  }
  const A = E([]), M = E(void 0), F = E(""), J = T(() => c.value && y.value ? JSON.stringify({ source: y.value, config: s.value.config ?? {}, limit: 1 }) : "");
  H(J, async (m, C, pe) => {
    let ue = !0;
    if (pe(() => {
      ue = !1;
    }), A.value = [], M.value = void 0, F.value = "", !!m)
      try {
        const { data: q } = await at.post(
          "/api/v1/automations/source-samples",
          JSON.parse(m)
        );
        if (!ue) return;
        if (q.success !== !0 || !Array.isArray(q.samples)) throw new Error(ct(q.error, "Could not read source samples."));
        A.value = q.samples, M.value = q.output_schema;
      } catch (q) {
        ue && (F.value = ct(q, "Could not read source samples."));
      }
  });
  const X = T(() => JSON.stringify(A.value.map((m) => ({ payload: m })))), ee = T(() => {
    for (const m of _.value) {
      const C = m.reconcile;
      if (C && typeof C.pull_keys == "string" && C.pull_keys) return C;
    }
    return null;
  }), W = T(() => !ee.value || !k.value || !_.value.some((C) => C.surface === "collection") ? !1 : !!(k.value.operations || {}).delete), te = T(() => f.value.map((m) => ({
    id: m.id,
    title: m.title || m.name || m.id,
    icon: m.icon || "tabler:database",
    group: m.group || "Destinations",
    subtitle: m.description
  }))), z = T(() => Sr(k.value, "SyncForm")), re = T(() => {
    if (z.value?.tag !== Ea) return;
    const m = String(k.value?.class || "");
    if (m)
      return { type: "thread", thread_class: m, title: z.value?.title ?? "", component: k.value?.component, delete_endpoint: z.value?.deleteEndpoint || "" };
  }), ce = T(() => z.value?.tag || Oa), Q = T(() => xa(k.value, "SyncForm")), U = T(() => z.value?.schema ?? Q.value), B = T(() => !!z.value && ka(Q.value)), ne = T(() => {
    if (!k.value) return !1;
    const m = z.value;
    if (m && k.value.config_schema?.[m.key]?.required) {
      const C = o.value[m.key];
      return C != null && C !== "" && (!Array.isArray(C) || C.length > 0);
    }
    return !0;
  }), me = T(() => {
    if (M.value != null) return He(M.value);
    for (const m of _.value)
      if (m.output_schema != null) return He(m.output_schema);
    return null;
  }), oe = T(() => He(i.value ?? k.value?.input_schema) ?? (k.value ? { properties: { content: { type: "string" } }, required: ["content"] } : null)), Re = T(() => {
    if (!y.value || !k.value) return null;
    const m = oe.value;
    if (!m || !m.properties) return { needed: !1, reason: "Destination accepts the item as-is — no transform needed." };
    const C = new Set(Object.keys(me.value?.properties || {})), pe = /* @__PURE__ */ new Set(), ue = /* @__PURE__ */ new Map(), q = k.value?.config_schema || {};
    for (const [ae, Or] of Object.entries(q)) {
      const be = Or || {};
      if (typeof be.supplies != "string") continue;
      ue.set(be.supplies, typeof be.title == "string" && be.title ? be.title : ae);
      const ot = o.value[ae];
      ot != null && ot !== "" && pe.add(be.supplies);
    }
    const Ce = (m.required || []).filter((ae) => !C.has(ae) && !pe.has(ae));
    if (Ce.length === 0) return { needed: !1, reason: "Fields line up — pass through works." };
    const wt = t ? [] : Ce.map((ae) => ue.get(ae)).filter((ae) => !!ae), Er = wt.length ? `, or fill ${wt.join(", ")} below` : "";
    return { needed: !0, reason: `Destination needs ${Ce.join(", ")}, not in the source — map it with an Expression or LLM${Er}.` };
  }), Se = T(() => !!y.value && !!k.value), Ke = T(() => JSON.stringify(me.value ?? {})), Ye = T(() => JSON.stringify(oe.value ?? {})), Ge = T(() => k.value?.input_shape ?? ""), Je = T(() => {
    if (!Se.value) return "";
    const m = x.value?.title || x.value?.name || "source", C = k.value?.title || k.value?.name || "destination";
    return `Map ${m} items into ${C} input.`;
  }), Qe = T(() => b.value ? JSON.stringify(b.value) : "");
  function Ze(m) {
    je(m.detail?.transform);
  }
  function je(m) {
    const C = m;
    C && typeof C.kind == "string" && (b.value = C);
  }
  function Xe(m) {
    if (!m || typeof m != "object") return;
    const C = m;
    i.value = C.input_schema, je(C.transform);
  }
  const et = T(() => {
    if (!r.value.trim()) return "Name is required.";
    if (!c.value) return u.value || "Source is required.";
    if (!n.value) return "Destination is required.";
    if (!ne.value) return "Destination configuration is required.";
    const m = b.value;
    return m ? m.kind === "expr" && !m.expr.trim() ? "Expression is required." : m.kind === "llm" && !m.prompt.trim() ? "Prompt is required." : m.kind === "code" && !m.code.trim() ? "Code is required." : "" : "Transform selection is required.";
  });
  async function tt() {
    try {
      const [m, C] = await Promise.all([
        at.get("/api/v1/automations/sources"),
        at.get("/api/v1/automations/sinks")
      ]);
      return w.value = m.data?.sources || [], f.value = C.data?.sinks || [], !t && f.value.length === 1 && (n.value = f.value[0].id), "";
    } catch (m) {
      return ct(m, "failed to load catalog");
    }
  }
  function rt(m) {
    r.value = m.title, h.value = m.trigger, s.value = m.trigger, d.value = m.output_schema, b.value = m.transform, n.value = m.sink_port, o.value = m.sink_config, a.value = m.reconcile != null, l.value = m.enabled;
  }
  function nt() {
    return Cr({
      // The trigger spec rides verbatim as input.trigger: the trigger service
      // validates and normalizes it server-side.
      title: r.value,
      trigger: s.value,
      sinkPort: n.value,
      sinkConfig: o.value,
      transform: b.value,
      outputSchema: d.value,
      reconcile: (t || W.value) && a.value ? !0 : void 0,
      enabled: l.value
    });
  }
  return {
    managed: t,
    sourceContext: p,
    title: r,
    sinkId: n,
    sinkConfig: o,
    reconcileEnabled: a,
    triggerSeed: h,
    transform: b,
    sources: w,
    sinks: f,
    selectedSource: x,
    selectedSink: k,
    supportsReconcile: W,
    sinkItems: te,
    sinkPickerMeta: re,
    sinkConfigTag: ce,
    sinkConfigSchema: U,
    sinkOptionsSchema: Q,
    sinkHasOptions: B,
    transformDetected: Re,
    canAssist: Se,
    assistSourceSchema: Ke,
    assistSinkSchema: Ye,
    assistInputShape: Ge,
    assistHint: Je,
    assistValue: Qe,
    validationError: et,
    assistSamples: X,
    sampleError: F,
    onTriggerChange: O,
    onAssistConfirmed: Ze,
    onSinkChange: $,
    onSinkBinding: Xe,
    loadCatalog: tt,
    seed: rt,
    currentInput: nt
  };
}
const Ta = { class: "kx-field" }, Pa = { class: "kx-pipe" }, $a = { class: "kx-pipe-conn" }, La = { class: "kx-pipe-conn" }, Aa = {
  key: 0,
  class: "kx-runopts"
}, Na = { class: "kx-field" }, Ra = { class: "kx-reconcile-check" }, ja = ["disabled"], Ma = { class: "kx-field-hint" }, oi = /* @__PURE__ */ ye({
  __name: "SyncPipeline",
  props: {
    form: {},
    destinationLocked: { type: Boolean },
    generationPolicy: {}
  },
  setup(e) {
    const t = e, r = t.form;
    return (n, o) => (P(), L(fe, null, [
      S("label", Ta, [
        o[4] || (o[4] = S("span", { class: "kx-field-lbl" }, [
          zr("Name "),
          S("span", {
            class: "kx-req",
            "aria-hidden": "true"
          }, "*")
        ], -1)),
        pt(S("input", {
          "onUpdate:modelValue": o[0] || (o[0] = (i) => g(r).title.value = i),
          "data-test": "pl-title",
          class: "kx-input",
          type: "text",
          placeholder: "Fireflies to Knowledge Base"
        }, null, 512), [
          [tr, g(r).title.value]
        ])
      ]),
      S("div", Pa, [
        j(Mo, {
          icon: g(r).selectedSource.value?.icon || "tabler:plug",
          seed: g(r).triggerSeed.value,
          editing: g(r).managed,
          onChange: g(r).onTriggerChange
        }, null, 8, ["icon", "seed", "editing", "onChange"]),
        S("div", $a, [
          j(g(le), {
            icon: "tabler:arrow-down",
            "aria-hidden": "true"
          })
        ]),
        j(Fo, {
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
        S("div", La, [
          j(g(le), {
            icon: "tabler:arrow-down",
            "aria-hidden": "true"
          })
        ]),
        j(ba, {
          items: g(r).sinkItems.value,
          "sink-id": g(r).sinkId.value,
          editing: g(r).managed || !!t.destinationLocked,
          "selected-sink": g(r).selectedSink.value,
          "config-tag": g(r).sinkConfigTag.value,
          "config-schema": g(r).sinkConfigSchema.value,
          "picker-meta": g(r).sinkPickerMeta.value,
          config: g(r).sinkConfig.value,
          "source-context": g(r).sourceContext.value,
          "source-schema": g(r).assistSourceSchema.value,
          "has-options": g(r).sinkHasOptions.value,
          "options-schema": g(r).sinkOptionsSchema.value,
          "locked-hint": t.destinationLocked ? "Selected by the owning component." : g(Gt),
          "onUpdate:sinkId": o[1] || (o[1] = (i) => {
            g(r).sinkId.value = i, g(r).onSinkChange();
          }),
          "onUpdate:config": o[2] || (o[2] = (i) => {
            g(r).sinkConfig.value = { ...g(r).sinkConfig.value, ...i };
          }),
          onBinding: g(r).onSinkBinding
        }, null, 8, ["items", "sink-id", "editing", "selected-sink", "config-tag", "config-schema", "picker-meta", "config", "source-context", "source-schema", "has-options", "options-schema", "locked-hint", "onBinding"])
      ]),
      g(r).supportsReconcile.value || g(r).managed && g(r).reconcileEnabled.value ? (P(), L("div", Aa, [
        S("div", Na, [
          S("label", Ra, [
            pt(S("input", {
              "onUpdate:modelValue": o[3] || (o[3] = (i) => g(r).reconcileEnabled.value = i),
              class: "kx-check",
              type: "checkbox",
              disabled: g(r).managed
            }, null, 8, ja), [
              [Dr, g(r).reconcileEnabled.value]
            ]),
            o[5] || (o[5] = S("span", null, "Reconcile deleted source items", -1))
          ]),
          S("span", Ma, Y(g(r).managed ? g(Gt) : "Periodically compares source keys with this sync’s owned destinations and removes items that disappeared from the source."), 1)
        ])
      ])) : D("", !0)
    ], 64));
  }
}), ai = ':root{--p-form-field-padding-x: .75rem;--p-form-field-padding-y: .5rem;--p-form-field-sm-padding-x: .625rem;--p-form-field-sm-padding-y: .375rem;--p-form-field-lg-padding-x: .875rem;--p-form-field-lg-padding-y: .625rem;--p-form-field-border-radius: .375rem;--p-form-field-transition-duration: .2s;--p-form-field-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), 0 1px 2px 0 rgba(18, 18, 23, .05);--p-focus-ring-width: 1px;--p-focus-ring-style: solid;--p-focus-ring-color: color-mix(in srgb, var(--p-primary-color) 100%, transparent);--p-focus-ring-offset: 2px;--p-toggleswitch-width: 2.5rem;--p-toggleswitch-height: 1.5rem;--p-toggleswitch-border-radius: 30px;--p-toggleswitch-gap: .25rem;--p-toggleswitch-border-width: 1px;--p-toggleswitch-transition-duration: .2s;--p-toggleswitch-slide-duration: .2s;--p-toggleswitch-handle-size: 1rem;--p-toggleswitch-handle-border-radius: 9999px}:root{color-scheme:light dark;--p-primary: rgb(0, 95, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-secondary: #6f7385;--p-secondary-50: color-mix(in srgb, var(--p-secondary) 5%, white);--p-secondary-100: color-mix(in srgb, var(--p-secondary) 10%, white);--p-secondary-200: color-mix(in srgb, var(--p-secondary) 20%, white);--p-secondary-300: color-mix(in srgb, var(--p-secondary) 35%, white);--p-secondary-400: color-mix(in srgb, var(--p-secondary) 65%, white);--p-secondary-500: var(--p-secondary);--p-secondary-600: color-mix(in srgb, var(--p-secondary) 80%, black);--p-secondary-700: color-mix(in srgb, var(--p-secondary) 65%, black);--p-secondary-800: color-mix(in srgb, var(--p-secondary) 55%, black);--p-secondary-900: color-mix(in srgb, var(--p-secondary) 50%, black);--p-secondary-950: color-mix(in srgb, var(--p-secondary) 30%, black);--p-danger: rgb(239, 68, 68);--p-danger-50: color-mix(in srgb, var(--p-danger) 5%, white);--p-danger-100: color-mix(in srgb, var(--p-danger) 10%, white);--p-danger-200: color-mix(in srgb, var(--p-danger) 20%, white);--p-danger-300: color-mix(in srgb, var(--p-danger) 30%, white);--p-danger-400: color-mix(in srgb, var(--p-danger) 40%, white);--p-danger-500: var(--p-danger);--p-danger-600: color-mix(in srgb, var(--p-danger) 80%, black);--p-danger-700: color-mix(in srgb, var(--p-danger) 70%, black);--p-danger-800: color-mix(in srgb, var(--p-danger) 60%, black);--p-danger-900: color-mix(in srgb, var(--p-danger) 50%, black);--p-danger-950: color-mix(in srgb, var(--p-danger) 40%, black);--p-success: rgb(34, 197, 94);--p-success-50: color-mix(in srgb, var(--p-success) 5%, white);--p-success-100: color-mix(in srgb, var(--p-success) 10%, white);--p-success-200: color-mix(in srgb, var(--p-success) 20%, white);--p-success-300: color-mix(in srgb, var(--p-success) 30%, white);--p-success-400: color-mix(in srgb, var(--p-success) 40%, white);--p-success-500: var(--p-success);--p-success-600: color-mix(in srgb, var(--p-success) 80%, black);--p-success-700: color-mix(in srgb, var(--p-success) 70%, black);--p-success-800: color-mix(in srgb, var(--p-success) 60%, black);--p-success-900: color-mix(in srgb, var(--p-success) 50%, black);--p-success-950: color-mix(in srgb, var(--p-success) 40%, black);--p-warn: rgb(249, 115, 22);--p-warn-50: color-mix(in srgb, var(--p-warn) 5%, white);--p-warn-100: color-mix(in srgb, var(--p-warn) 10%, white);--p-warn-200: color-mix(in srgb, var(--p-warn) 20%, white);--p-warn-300: color-mix(in srgb, var(--p-warn) 30%, white);--p-warn-400: color-mix(in srgb, var(--p-warn) 40%, white);--p-warn-500: var(--p-warn);--p-warn-600: color-mix(in srgb, var(--p-warn) 80%, black);--p-warn-700: color-mix(in srgb, var(--p-warn) 70%, black);--p-warn-800: color-mix(in srgb, var(--p-warn) 60%, black);--p-warn-900: color-mix(in srgb, var(--p-warn) 50%, black);--p-warn-950: color-mix(in srgb, var(--p-warn) 40%, black);--p-info: rgb(14, 165, 233);--p-info-50: color-mix(in srgb, var(--p-info) 5%, white);--p-info-100: color-mix(in srgb, var(--p-info) 10%, white);--p-info-200: color-mix(in srgb, var(--p-info) 20%, white);--p-info-300: color-mix(in srgb, var(--p-info) 30%, white);--p-info-400: color-mix(in srgb, var(--p-info) 40%, white);--p-info-500: var(--p-info);--p-info-600: color-mix(in srgb, var(--p-info) 80%, black);--p-info-700: color-mix(in srgb, var(--p-info) 70%, black);--p-info-800: color-mix(in srgb, var(--p-info) 60%, black);--p-info-900: color-mix(in srgb, var(--p-info) 50%, black);--p-info-950: color-mix(in srgb, var(--p-info) 40%, black);--p-help: rgb(168, 85, 247);--p-help-50: color-mix(in srgb, var(--p-help) 5%, white);--p-help-100: color-mix(in srgb, var(--p-help) 10%, white);--p-help-200: color-mix(in srgb, var(--p-help) 20%, white);--p-help-300: color-mix(in srgb, var(--p-help) 30%, white);--p-help-400: color-mix(in srgb, var(--p-help) 40%, white);--p-help-500: var(--p-help);--p-help-600: color-mix(in srgb, var(--p-help) 80%, black);--p-help-700: color-mix(in srgb, var(--p-help) 70%, black);--p-help-800: color-mix(in srgb, var(--p-help) 60%, black);--p-help-900: color-mix(in srgb, var(--p-help) 50%, black);--p-help-950: color-mix(in srgb, var(--p-help) 40%, black);--p-accent: rgb(20, 184, 166);--p-accent-50: color-mix(in srgb, var(--p-accent) 5%, white);--p-accent-100: color-mix(in srgb, var(--p-accent) 10%, white);--p-accent-200: color-mix(in srgb, var(--p-accent) 20%, white);--p-accent-300: color-mix(in srgb, var(--p-accent) 30%, white);--p-accent-400: color-mix(in srgb, var(--p-accent) 40%, white);--p-accent-500: var(--p-accent);--p-accent-600: color-mix(in srgb, var(--p-accent) 80%, black);--p-accent-700: color-mix(in srgb, var(--p-accent) 70%, black);--p-accent-800: color-mix(in srgb, var(--p-accent) 60%, black);--p-accent-900: color-mix(in srgb, var(--p-accent) 50%, black);--p-accent-950: color-mix(in srgb, var(--p-accent) 40%, black);--p-surface-0: #ffffff;--p-surface-50: #fafafa;--p-surface-100: #f5f5f5;--p-surface-200: #e5e5e5;--p-surface-300: #d4d4d4;--p-surface-400: #a3a3a3;--p-surface-500: #737373;--p-surface-600: #525252;--p-surface-700: #404040;--p-surface-800: #262626;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #171717;--p-surface-950: #0a0a0a;--p-content-border-radius: 6px;--p-font-heading-family: var(--v-font-family-head, Arial);--p-font-heading-scale: 1;--p-font-heading-line-height: 1.5;--p-font-heading-letter-spacing: normal;--p-font-heading-stretch: normal;--p-font-heading-variation-settings: normal;--p-font-body-scale: 1;--p-font-body-line-height: 1.5;--p-font-body-letter-spacing: normal;--p-font-body-stretch: normal;--p-font-body-variation-settings: normal;--p-font-mono-family: ui-monospace}:root{--p-primary-color: var(--p-primary-500);--p-primary-contrast-color: var(--p-surface-0);--p-primary-hover-color: var(--p-primary-600);--p-primary-active-color: var(--p-primary-700);--p-secondary-color: var(--p-secondary-500);--p-secondary-contrast-color: var(--p-surface-0);--p-secondary-hover-color: var(--p-secondary-600);--p-secondary-active-color: var(--p-secondary-700);--p-danger-color: var(--p-danger-500);--p-danger-contrast-color: var(--p-surface-0);--p-danger-hover-color: var(--p-danger-600);--p-danger-active-color: var(--p-danger-700);--p-success-color: var(--p-success-500);--p-success-contrast-color: var(--p-surface-0);--p-success-hover-color: var(--p-success-600);--p-success-active-color: var(--p-success-700);--p-warn-color: var(--p-warn-500);--p-warn-contrast-color: var(--p-surface-0);--p-warn-hover-color: var(--p-warn-600);--p-warn-active-color: var(--p-warn-700);--p-info-color: var(--p-info-500);--p-info-contrast-color: var(--p-surface-0);--p-info-hover-color: var(--p-info-600);--p-info-active-color: var(--p-info-700);--p-help-color: var(--p-help-500);--p-help-contrast-color: var(--p-surface-0);--p-help-hover-color: var(--p-help-600);--p-help-active-color: var(--p-help-700);--p-accent-color: var(--p-accent-500);--p-accent-contrast-color: var(--p-surface-0);--p-accent-hover-color: var(--p-accent-600);--p-accent-active-color: var(--p-accent-700);--p-content-border-color: var(--p-surface-200);--p-content-hover-background: var(--p-surface-100);--p-content-hover-color: var(--p-surface-800);--p-highlight-background: var(--p-primary-50);--p-highlight-color: var(--p-primary-700);--p-highlight-focus-background: var(--p-primary-100);--p-highlight-focus-color: var(--p-primary-800);--p-content-background: var(--p-surface-0);--p-text-color: var(--p-surface-700);--p-text-hover-color: var(--p-surface-800);--p-text-muted-color: var(--p-surface-500);--p-text-hover-muted-color: var(--p-surface-600)}@media(prefers-color-scheme:dark){:root:not(.w-theme-light){--p-surface-D: #fff;--p-surface-0: #fff;--p-surface-50: #fafafa;--p-surface-100: #f4f4f5;--p-surface-200: #e4e4e7;--p-surface-300: #d4d4d8;--p-surface-400: #a1a1aa;--p-surface-500: #71717a;--p-surface-600: #545250;--p-surface-700: #403e3c;--p-surface-800: #2b2927;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #1c1a19;--p-surface-950: #0f0e0d;--p-primary: rgb(0, 125, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-primary-color: var(--p-primary-400);--p-primary-contrast-color: var(--p-surface-900);--p-primary-hover-color: var(--p-primary-300);--p-primary-active-color: var(--p-primary-200);--p-secondary-color: var(--p-secondary-400);--p-secondary-contrast-color: var(--p-surface-900);--p-secondary-hover-color: var(--p-secondary-300);--p-secondary-active-color: var(--p-secondary-200);--p-danger-color: var(--p-danger-400);--p-danger-contrast-color: var(--p-surface-900);--p-danger-hover-color: var(--p-danger-300);--p-danger-active-color: var(--p-danger-200);--p-success-color: var(--p-success-400);--p-success-contrast-color: var(--p-surface-900);--p-success-hover-color: var(--p-success-300);--p-success-active-color: var(--p-success-200);--p-warn-color: var(--p-warn-400);--p-warn-contrast-color: var(--p-surface-900);--p-warn-hover-color: var(--p-warn-300);--p-warn-active-color: var(--p-warn-200);--p-info-color: var(--p-info-400);--p-info-contrast-color: var(--p-surface-900);--p-info-hover-color: var(--p-info-300);--p-info-active-color: var(--p-info-200);--p-help-color: var(--p-help-400);--p-help-contrast-color: var(--p-surface-900);--p-help-hover-color: var(--p-help-300);--p-help-active-color: var(--p-help-200);--p-accent-color: var(--p-accent-400);--p-accent-contrast-color: var(--p-surface-900);--p-accent-hover-color: var(--p-accent-300);--p-accent-active-color: var(--p-accent-200);--p-content-border-color: var(--p-surface-700);--p-content-hover-background: var(--p-surface-800);--p-content-hover-color: var(--p-surface-0);--p-highlight-background: color-mix(in srgb, var(--p-primary-400), transparent 84%);--p-highlight-color: rgba(255, 255, 255, 87%);--p-highlight-focus-background: color-mix(in srgb, var(--p-primary-400), transparent 76%);--p-highlight-focus-color: rgba(255, 255, 255, 87%);--p-content-background: var(--p-surface-900);--p-text-color: var(--p-surface-0);--p-text-hover-color: var(--p-surface-0);--p-text-muted-color: var(--p-surface-400);--p-text-hover-muted-color: var(--p-surface-300)}}:root.w-theme-dark,.w-theme-dark{color-scheme:dark;--p-surface-D: #fff;--p-surface-0: #fff;--p-surface-50: #fafafa;--p-surface-100: #f4f4f5;--p-surface-200: #e4e4e7;--p-surface-300: #d4d4d8;--p-surface-400: #a1a1aa;--p-surface-500: #71717a;--p-surface-600: #545250;--p-surface-700: #403e3c;--p-surface-800: #2b2927;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #1c1a19;--p-surface-950: #0f0e0d;--p-primary: rgb(0, 125, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-primary-color: var(--p-primary-400);--p-primary-contrast-color: var(--p-surface-900);--p-primary-hover-color: var(--p-primary-300);--p-primary-active-color: var(--p-primary-200);--p-secondary-color: var(--p-secondary-400);--p-secondary-contrast-color: var(--p-surface-900);--p-secondary-hover-color: var(--p-secondary-300);--p-secondary-active-color: var(--p-secondary-200);--p-danger-color: var(--p-danger-400);--p-danger-contrast-color: var(--p-surface-900);--p-danger-hover-color: var(--p-danger-300);--p-danger-active-color: var(--p-danger-200);--p-success-color: var(--p-success-400);--p-success-contrast-color: var(--p-surface-900);--p-success-hover-color: var(--p-success-300);--p-success-active-color: var(--p-success-200);--p-warn-color: var(--p-warn-400);--p-warn-contrast-color: var(--p-surface-900);--p-warn-hover-color: var(--p-warn-300);--p-warn-active-color: var(--p-warn-200);--p-info-color: var(--p-info-400);--p-info-contrast-color: var(--p-surface-900);--p-info-hover-color: var(--p-info-300);--p-info-active-color: var(--p-info-200);--p-help-color: var(--p-help-400);--p-help-contrast-color: var(--p-surface-900);--p-help-hover-color: var(--p-help-300);--p-help-active-color: var(--p-help-200);--p-accent-color: var(--p-accent-400);--p-accent-contrast-color: var(--p-surface-900);--p-accent-hover-color: var(--p-accent-300);--p-accent-active-color: var(--p-accent-200);--p-content-border-color: var(--p-surface-700);--p-content-hover-background: var(--p-surface-800);--p-content-hover-color: var(--p-surface-0);--p-highlight-background: color-mix(in srgb, var(--p-primary-400), transparent 84%);--p-highlight-color: rgba(255, 255, 255, 87%);--p-highlight-focus-background: color-mix(in srgb, var(--p-primary-400), transparent 76%);--p-highlight-focus-color: rgba(255, 255, 255, 87%);--p-content-background: var(--p-surface-900);--p-text-color: var(--p-surface-0);--p-text-hover-color: var(--p-surface-0);--p-text-muted-color: var(--p-surface-400);--p-text-hover-muted-color: var(--p-surface-300)}:root.w-theme-light,.w-theme-light{color-scheme:light;--p-surface-0: #ffffff;--p-surface-50: #fafafa;--p-surface-100: #f5f5f5;--p-surface-200: #e5e5e5;--p-surface-300: #d4d4d4;--p-surface-400: #a3a3a3;--p-surface-500: #737373;--p-surface-600: #525252;--p-surface-700: #404040;--p-surface-800: #262626;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #171717;--p-surface-950: #0a0a0a;--p-primary: rgb(0, 95, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-primary-color: var(--p-primary-500);--p-primary-contrast-color: var(--p-surface-0);--p-primary-hover-color: var(--p-primary-600);--p-primary-active-color: var(--p-primary-700);--p-secondary-color: var(--p-secondary-500);--p-secondary-contrast-color: var(--p-surface-0);--p-secondary-hover-color: var(--p-secondary-600);--p-secondary-active-color: var(--p-secondary-700);--p-danger-color: var(--p-danger-500);--p-danger-contrast-color: var(--p-surface-0);--p-danger-hover-color: var(--p-danger-600);--p-danger-active-color: var(--p-danger-700);--p-success-color: var(--p-success-500);--p-success-contrast-color: var(--p-surface-0);--p-success-hover-color: var(--p-success-600);--p-success-active-color: var(--p-success-700);--p-warn-color: var(--p-warn-500);--p-warn-contrast-color: var(--p-surface-0);--p-warn-hover-color: var(--p-warn-600);--p-warn-active-color: var(--p-warn-700);--p-info-color: var(--p-info-500);--p-info-contrast-color: var(--p-surface-0);--p-info-hover-color: var(--p-info-600);--p-info-active-color: var(--p-info-700);--p-help-color: var(--p-help-500);--p-help-contrast-color: var(--p-surface-0);--p-help-hover-color: var(--p-help-600);--p-help-active-color: var(--p-help-700);--p-accent-color: var(--p-accent-500);--p-accent-contrast-color: var(--p-surface-0);--p-accent-hover-color: var(--p-accent-600);--p-accent-active-color: var(--p-accent-700);--p-content-border-color: var(--p-surface-200);--p-content-hover-background: var(--p-surface-100);--p-content-hover-color: var(--p-surface-800);--p-highlight-background: var(--p-primary-50);--p-highlight-color: var(--p-primary-700);--p-highlight-focus-background: var(--p-primary-100);--p-highlight-focus-color: var(--p-primary-800);--p-content-background: var(--p-surface-0);--p-text-color: var(--p-surface-700);--p-text-hover-color: var(--p-surface-800);--p-text-muted-color: var(--p-surface-500);--p-text-hover-muted-color: var(--p-surface-600)}:host{--kx-picker-shadow: var(--p-select-overlay-shadow);--kx-picker-option-icon-size: 17px;--kx-picker-option-icon-gap: 10px;--kx-picker-option-stack-gap: 1px;--kx-picker-option-title-size: 13px;--kx-picker-option-title-weight: 600;--kx-picker-option-subtitle-size: 11.5px;--kx-picker-option-subtitle-line-height: 1.4}.kx-ps{width:100%;text-align:start;font:inherit}.anchored-panel>.p-select-overlay.kx-ps-panel{position:static;width:100%;display:flex;flex-direction:column;max-height:var(--anchored-panel-available-height);overflow:hidden}.kx-ps-panel>.p-select-header{flex:none}.kx-ps-options{min-height:0;overflow-y:auto}.kx-ps-options>li{flex:none}.kx-ps-val{display:flex;align-items:center;gap:8px;min-width:0}.kx-ps-val-ico{width:16px;height:16px;color:var(--p-primary-color);flex:none}.kx-ps-val-label{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.kx-ps-ph{color:var(--p-text-muted-color)}.kx-ps-option{gap:var(--kx-picker-option-icon-gap)}.kx-ps-opt-ico{width:var(--kx-picker-option-icon-size);height:var(--kx-picker-option-icon-size);flex:none}.kx-ps-opt-body{flex:1;min-width:0;display:flex;flex-direction:column;gap:var(--kx-picker-option-stack-gap)}.kx-ps-opt-title{font-size:var(--kx-picker-option-title-size);font-weight:var(--kx-picker-option-title-weight);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%}.kx-ps-opt-sub{font-size:var(--kx-picker-option-subtitle-size);line-height:var(--kx-picker-option-subtitle-line-height);color:var(--p-text-muted-color);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%}*,:before,:after{--tw-border-spacing-x: 0;--tw-border-spacing-y: 0;--tw-translate-x: 0;--tw-translate-y: 0;--tw-rotate: 0;--tw-skew-x: 0;--tw-skew-y: 0;--tw-scale-x: 1;--tw-scale-y: 1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness: proximity;--tw-gradient-from-position: ;--tw-gradient-via-position: ;--tw-gradient-to-position: ;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width: 0px;--tw-ring-offset-color: #fff;--tw-ring-color: rgb(59 130 246 / .5);--tw-ring-offset-shadow: 0 0 #0000;--tw-ring-shadow: 0 0 #0000;--tw-shadow: 0 0 #0000;--tw-shadow-colored: 0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: ;--tw-contain-size: ;--tw-contain-layout: ;--tw-contain-paint: ;--tw-contain-style: }::backdrop{--tw-border-spacing-x: 0;--tw-border-spacing-y: 0;--tw-translate-x: 0;--tw-translate-y: 0;--tw-rotate: 0;--tw-skew-x: 0;--tw-skew-y: 0;--tw-scale-x: 1;--tw-scale-y: 1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness: proximity;--tw-gradient-from-position: ;--tw-gradient-via-position: ;--tw-gradient-to-position: ;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width: 0px;--tw-ring-offset-color: #fff;--tw-ring-color: rgb(59 130 246 / .5);--tw-ring-offset-shadow: 0 0 #0000;--tw-ring-shadow: 0 0 #0000;--tw-shadow: 0 0 #0000;--tw-shadow-colored: 0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: ;--tw-contain-size: ;--tw-contain-layout: ;--tw-contain-paint: ;--tw-contain-style: }*,:before,:after{box-sizing:border-box;border-width:0;border-style:solid;border-color:#e5e7eb}:before,:after{--tw-content: ""}html,:host{line-height:1.5;-webkit-text-size-adjust:100%;-moz-tab-size:4;tab-size:4;font-family:ui-sans-serif,system-ui,sans-serif,"Apple Color Emoji","Segoe UI Emoji",Segoe UI Symbol,"Noto Color Emoji";font-feature-settings:normal;font-variation-settings:normal;-webkit-tap-highlight-color:transparent}body{margin:0;line-height:inherit}hr{height:0;color:inherit;border-top-width:1px}abbr:where([title]){text-decoration:underline dotted}h1,h2,h3,h4,h5,h6{font-size:inherit;font-weight:inherit}a{color:inherit;text-decoration:inherit}b,strong{font-weight:bolder}code,kbd,samp,pre{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace;font-feature-settings:normal;font-variation-settings:normal;font-size:1em}small{font-size:80%}sub,sup{font-size:75%;line-height:0;position:relative;vertical-align:baseline}sub{bottom:-.25em}sup{top:-.5em}table{text-indent:0;border-color:inherit;border-collapse:collapse}button,input,optgroup,select,textarea{font-family:inherit;font-feature-settings:inherit;font-variation-settings:inherit;font-size:100%;font-weight:inherit;line-height:inherit;letter-spacing:inherit;color:inherit;margin:0;padding:0}button,select{text-transform:none}button,input:where([type=button]),input:where([type=reset]),input:where([type=submit]){-webkit-appearance:button;background-color:transparent;background-image:none}:-moz-focusring{outline:auto}:-moz-ui-invalid{box-shadow:none}progress{vertical-align:baseline}::-webkit-inner-spin-button,::-webkit-outer-spin-button{height:auto}[type=search]{-webkit-appearance:textfield;outline-offset:-2px}::-webkit-search-decoration{-webkit-appearance:none}::-webkit-file-upload-button{-webkit-appearance:button;font:inherit}summary{display:list-item}blockquote,dl,dd,h1,h2,h3,h4,h5,h6,hr,figure,p,pre{margin:0}fieldset{margin:0;padding:0}legend{padding:0}ol,ul,menu{list-style:none;margin:0;padding:0}dialog{padding:0}textarea{resize:vertical}input::placeholder,textarea::placeholder{opacity:1;color:#9ca3af}button,[role=button]{cursor:pointer}:disabled{cursor:default}img,svg,video,canvas,audio,iframe,embed,object{display:block;vertical-align:middle}img,video{max-width:100%;height:auto}[hidden]:where(:not([hidden=until-found])){display:none}@supports (-moz-appearance:none){*{scrollbar-color:initial;scrollbar-width:initial}}:host{display:block;height:100%;min-height:0}:host>div{height:100%;min-height:0}*,*:before,*:after{box-sizing:border-box}.kx-field{display:flex;flex-direction:column;gap:5px}.kx-field-lbl{font-size:12.5px;font-weight:600;color:var(--p-text-color)}.kx-req{color:var(--p-danger-500)}.kx-input{height:36px;padding:0 10px;font:inherit;font-size:13px;color:var(--p-text-color);background:var(--p-content-background);border:1px solid var(--p-content-border-color);border-radius:8px;transition:border-color .15s;width:100%}.kx-select{width:100%;min-width:0}.kx-check{width:18px;height:18px;accent-color:var(--p-primary-color)}.kx-reconcile-check{display:flex;align-items:center;gap:8px;font-size:13px;color:var(--p-text-color);cursor:pointer}.kx-field-hint{font-size:11.5px;color:var(--p-text-muted-color)}.kx-2p-r-note{margin:0;font-size:12.5px;color:var(--p-text-muted-color)}.kx-alert{margin:0;padding:8px 10px;font-size:12.5px;line-height:1.4;color:var(--p-danger-600, var(--p-danger-500));border-radius:8px;border:1px solid color-mix(in srgb,var(--p-danger-500) 32%,transparent);background:color-mix(in srgb,var(--p-danger-500) 8%,transparent)}@keyframes kx-spin{to{transform:rotate(360deg)}}.kx-flow{display:flex;flex-direction:column;gap:14px;padding:6px 0 0}.kx-actions{display:flex;justify-content:flex-end;gap:10px;padding-top:4px}.kx-pipe,.kx-stage{display:flex;flex-direction:column;gap:8px}.kx-stage-mid{background:transparent}.kx-stage-head{display:flex;align-items:center;gap:8px}.kx-stage-ico{width:26px;height:26px;border-radius:11px;flex:none;display:inline-flex;align-items:center;justify-content:center;background:color-mix(in srgb,var(--p-primary-color) 14%,transparent);color:var(--p-primary-color)}.kx-stage-ico svg{width:15px;height:15px}.kx-stage-lbl{font-size:12px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;color:var(--p-text-muted-color)}.kx-stage-cfg{margin-top:2px}.kx-stage-desc{margin:0;font-size:12px;line-height:1.4;color:var(--p-text-muted-color)}.kx-stage-opts{display:flex;flex-direction:column;gap:6px;margin-top:10px;padding-top:10px;border-top:1px dashed var(--p-content-border-color)}.kx-opts-lbl{font-size:11px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;color:var(--p-text-muted-color)}.kx-pipe-conn{display:flex;align-items:center;justify-content:center;gap:6px;padding:5px 0;color:var(--p-text-muted-color);font-size:11px}.kx-pipe-conn svg{width:16px;height:16px}.kx-runopts{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px}.kx-detect{display:flex;align-items:center;gap:6px;font-size:11.5px;line-height:1.35;padding:7px 9px;border-radius:8px;color:var(--p-success-600, var(--p-success-500));background:color-mix(in srgb,var(--p-success-500) 10%,transparent)}.kx-detect svg{width:14px;height:14px;flex:none}.kx-detect-warn{color:var(--p-warn-600, var(--p-warn-500));background:color-mix(in srgb,var(--p-warn-500) 12%,transparent)}.kx-wcmount{width:100%}.kx-wcmount>div{display:block;width:100%}';
export {
  xe as B,
  Fa as C,
  On as F,
  Za as K,
  se as N,
  ti as P,
  Ja as Q,
  ei as R,
  V as S,
  Qa as T,
  Ya as U,
  Ba as W,
  oi as _,
  Ha as a,
  ni as b,
  he as c,
  R as d,
  ct as e,
  Cn as f,
  Tt as g,
  qe as h,
  de as i,
  ze as j,
  qa as k,
  gt as l,
  Z as m,
  Wa as n,
  Xa as o,
  Ua as p,
  ri as q,
  ai as s,
  Da as u,
  Ka as v,
  Ga as z
};
//# sourceMappingURL=styles-DNukdoO-.js.map

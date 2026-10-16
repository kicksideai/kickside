import { hasInjectionContext as mo, inject as $t, effectScope as go, ref as B, markRaw as bo, onMounted as en, onUnmounted as vo, watch as ke, createApp as yo, readonly as xo, getCurrentInstance as un, nextTick as wo, reactive as Zn, renderSlot as E, openBlock as v, createBlock as U, Teleport as Qn, createCommentVNode as N, useId as ko, mergeProps as $, h as So, createElementBlock as O, createElementVNode as I, createTextVNode as ze, toDisplayString as W, resolveComponent as ae, resolveDirective as Xn, withDirectives as tn, resolveDynamicComponent as Et, withCtx as q, normalizeClass as ce, defineComponent as ve, computed as me, unref as j, Fragment as Se, renderList as He, createVNode as R, Transition as $o, normalizeProps as Oo, createSlots as _o, withModifiers as er, onBeforeUnmount as Co, vShow as Io } from "vue";
import { addCollection as Po, Icon as Ue } from "@iconify/vue";
import { config as pn, addIcons as To, on as Lo, applyThemeMode as ht, host as Ao, hostCss as Eo, loadCss as zo, loadByTagName as Vo, api as se } from "@wippy-fe/proxy";
var zt = "data-wippy-visible";
function fn(e) {
  const t = e.getAttribute(zt);
  return t === "true" ? !0 : t === "false" ? !1 : null;
}
var jo = Object.defineProperty, Fo = (e, t, n) => t in e ? jo(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n, D = (e, t, n) => Fo(e, typeof t != "symbol" ? t + "" : t, n), No = [
  "themeConfigUrl",
  "primeVueCssUrl",
  "markdownCssUrl",
  "iframeCssUrl"
], Mo = [
  ":where([data-wippy-theme-root]).w-theme-light",
  ":where([data-wippy-theme-root]).w-theme-dark"
].join(`,
`);
function hn(e) {
  const t = e.startsWith("--") ? e : `--${e}`;
  return /^--[-\w\u0080-\uFFFF]+$/.test(t) ? t : null;
}
function Ro(...e) {
  const t = /* @__PURE__ */ new Set();
  for (const n of e)
    if (n)
      for (const [r, o] of Object.entries(n)) {
        if ((r === "@light" || r === "@dark") && o && typeof o == "object") {
          for (const [a, l] of Object.entries(o)) {
            const s = typeof l == "string" ? hn(a) : null;
            s && t.add(s);
          }
          continue;
        }
        const i = typeof o == "string" ? hn(r) : null;
        i && t.add(i);
      }
  return [...t].sort();
}
function Do(e) {
  if (e.length === 0)
    return "";
  const t = e.map((n) => `  ${n}: inherit;`).join(`
`);
  return `${Mo} {
${t}
}`;
}
function Bo(e, t) {
  const n = Do(t);
  n && tr(e, n, "@wippy-fe/css-variables-bridge");
}
function Ho(e, t) {
  const r = (t ?? No).map(async (o) => {
    const i = Eo[o];
    if (!i)
      return console.warn(`[wippy-fe/webcomponent-core] hostCss key "${o}" is undefined — skipping. Remove it from hostCssKeys if the CSS was removed.`), null;
    try {
      return await zo(i);
    } catch (a) {
      return console.warn(`[wippy-fe/webcomponent-core] Failed to load hostCss "${o}" (${i}):`, a), null;
    }
  });
  return Promise.all(r).then((o) => {
    for (const i of o) {
      if (!i)
        continue;
      const a = document.createElement("style");
      a.textContent = i, a.setAttribute("role", "@wippy-fe/host-css"), e.appendChild(a);
    }
  });
}
function Uo(e, t) {
  const n = document.createElement("style");
  n.textContent = t, e.appendChild(n);
}
function tr(e, t, n) {
  if (typeof CSSStyleSheet < "u" && "replaceSync" in CSSStyleSheet.prototype) {
    const o = new CSSStyleSheet();
    o.replaceSync(t), e.adoptedStyleSheets = [...e.adoptedStyleSheets, o];
    return;
  }
  const r = document.createElement("style");
  r.setAttribute("role", n), r.textContent = t, e.appendChild(r);
}
function Ko(e, t) {
  tr(e, t, "@wippy-fe/custom-css");
}
function nr(e) {
  return e.__wippyHost ?? null;
}
function Wo(e) {
  return e.replace(/-([a-z])/g, (t, n) => n.toUpperCase());
}
function Go(e, t, n) {
  switch (n.type) {
    case "string":
      return { value: t };
    case "number": {
      const r = Number.parseFloat(t);
      return Number.isNaN(r) ? { value: void 0, error: `Invalid ${e}: expected a number` } : { value: r };
    }
    case "integer": {
      const r = Number.parseInt(t, 10);
      return Number.isNaN(r) ? { value: void 0, error: `Invalid ${e}: expected an integer` } : { value: r };
    }
    case "boolean":
      return { value: t !== "false" };
    case "array":
    case "object":
      try {
        const r = JSON.parse(t);
        return n.type === "array" && !Array.isArray(r) ? { value: void 0, error: `Invalid ${e}: expected a JSON array` } : { value: r };
      } catch {
        return { value: void 0, error: `Invalid ${e}: must be valid JSON` };
      }
    default:
      return { value: t };
  }
}
function It(e, t) {
  const n = {}, r = [];
  for (const [o, i] of Object.entries(t.properties)) {
    const a = e.getAttribute(o), l = Wo(o);
    if (a === null) {
      i.default !== void 0 && (n[l] = i.default);
      continue;
    }
    const s = Go(o, a, i);
    s.error ? r.push(s.error) : n[l] = s.value;
  }
  return { props: n, errors: r };
}
var qo = class {
  constructor(e, t) {
    D(this, "_props"), D(this, "_errors"), D(this, "_content"), D(this, "_hostVisibility"), D(this, "_propsListeners", /* @__PURE__ */ new Set()), D(this, "_contentListeners", /* @__PURE__ */ new Set()), D(this, "_hostVisibilityListeners", /* @__PURE__ */ new Set()), D(this, "_disposed", !1), D(this, "_emitToDom"), D(this, "props"), D(this, "events"), D(this, "content"), D(this, "hostVisibility"), this._props = e.props, this._errors = e.errors, this._content = e.content, this._hostVisibility = e.hostVisibility, this._emitToDom = t;
    const n = this;
    this.props = {
      get value() {
        return n._props;
      },
      get errors() {
        return n._errors;
      },
      subscribe(r, o) {
        return n._subscribeProps(r, o);
      }
    }, this.events = {
      emit(r, o) {
        n._disposed || n._emitToDom(r, o);
      }
    }, this.content = e.hasContent ? {
      get value() {
        return n._content;
      },
      subscribe(r, o) {
        return n._subscribeContent(r, o);
      }
    } : null, this.hostVisibility = {
      get value() {
        return n._hostVisibility;
      },
      subscribe(r, o) {
        return n._subscribeHostVisibility(r, o);
      }
    };
  }
  /** @internal */
  notifyProps(e, t) {
    if (!this._disposed) {
      this._props = e, this._errors = t;
      for (const n of this._propsListeners)
        n(e, t);
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
      for (const n of this._hostVisibilityListeners)
        n(e, t);
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
    const n = () => {
      this._propsListeners.delete(e), t?.signal?.removeEventListener("abort", n);
    };
    return t?.signal?.addEventListener("abort", n, { once: !0 }), n;
  }
  _subscribeContent(e, t) {
    if (this._disposed || t?.signal?.aborted)
      return () => {
      };
    this._contentListeners.add(e), t?.immediate && e(this._content);
    const n = () => {
      this._contentListeners.delete(e), t?.signal?.removeEventListener("abort", n);
    };
    return t?.signal?.addEventListener("abort", n, { once: !0 }), n;
  }
  _subscribeHostVisibility(e, t) {
    if (this._disposed || t?.signal?.aborted)
      return () => {
      };
    this._hostVisibilityListeners.add(e), t?.immediate && e(this._hostVisibility, this._hostVisibility);
    const n = () => {
      this._hostVisibilityListeners.delete(e), t?.signal?.removeEventListener("abort", n);
    };
    return t?.signal?.addEventListener("abort", n, { once: !0 }), n;
  }
}, Yo = class extends HTMLElement {
  constructor() {
    super(), D(this, "_internals"), D(this, "_contentObserver", null), D(this, "_initialized", !1), D(this, "_container", null), D(this, "_reactive", null), D(this, "_lastProps", null), D(this, "_lastErrors", []), D(this, "_lastContent", null), D(this, "_themeUnsub", null), D(this, "_hostVisible", null), this._internals = this.attachInternals(), this._hostVisible = fn(this);
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
    const e = this.wippyConfig, t = Object.keys(e.propsSchema.properties), n = e.extraObservedAttributes ?? [];
    return [.../* @__PURE__ */ new Set([...t, ...n, zt])];
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
      let n, r;
      if (this._lastProps !== null)
        n = this._lastProps, r = this._lastErrors;
      else {
        const i = It(this, e.propsSchema);
        e.validateProps && i.errors.push(...e.validateProps(i.props)), n = i.props, r = i.errors, this._lastProps = n, this._lastErrors = r;
      }
      const o = t ? this._lastContent ?? this._extractContent(e.contentTemplate) : null;
      t && this._lastContent === null && (this._lastContent = o), this._reactive = new qo(
        { props: n, errors: r, content: o, hasContent: t, hostVisibility: this._hostVisible },
        this.emitEvent.bind(this)
      );
    }
    return this._reactive;
  }
  // ── Lifecycle ──────────────────────────────────────────────
  connectedCallback() {
    this._internals.states.add("loading");
    try {
      const e = this.constructor.wippyConfig, t = this._initialized, n = this.shadowRoot ?? this.attachShadow({ mode: e.shadowMode ?? "open" });
      let r;
      if (t)
        r = this._container;
      else {
        this.onInit(n), e.inlineCss && Uo(n, e.inlineCss);
        try {
          const d = pn?.theming, c = Ro(
            d?.global?.cssVariables,
            d?.children?.cssVariables
          );
          Bo(n, c);
        } catch {
        }
        if (e.customCss !== !1)
          try {
            const d = pn?.theming, c = [d?.global?.customCSS, d?.children?.customCSS].filter(Boolean).join(`
`);
            c && Ko(n, c);
          } catch {
          }
        (e.hostCssKeys === void 0 || e.hostCssKeys.length > 0) && Ho(n, e.hostCssKeys), r = document.createElement("div"), r.setAttribute("data-wippy-theme-root", "");
        const s = e.containerClasses ?? [];
        s.length > 0 && r.classList.add(...s), n.appendChild(r), this._container = r, To(Po);
      }
      this._applyTheme(), this._themeUnsub || (this._themeUnsub = Lo("@theme", (s) => this._applyTheme(s)));
      const { props: o, errors: i } = It(this, e.propsSchema);
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
      })), this.onMount(n, r, a, i, l, t), this._internals.states.delete("loading"), this._internals.states.add("ready"), t || (this._initialized = !0), this.onReady(), this.emitEvent("load");
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
  _applyTheme(e = Ao.getThemeMode?.()) {
    ht(e, this), this._container && ht(e, this._container);
  }
  disconnectedCallback() {
    this._themeUnsub && (this._themeUnsub(), this._themeUnsub = null), ht("auto", this), this._container && ht("auto", this._container), this._contentObserver && (this._contentObserver.disconnect(), this._contentObserver = null), this.onUnmount(), this.emitEvent("unload"), this._internals.states.clear(), this._reactive?.dispose(), this._reactive = null, this._lastProps = null, this._lastErrors = [], this._lastContent = null, delete this.__wippyHost, delete this.__wippyHostBus;
  }
  attributeChangedCallback(e, t, n) {
    if (t === n)
      return;
    if (e === zt) {
      const l = this._hostVisible, s = fn(this);
      if (s === l)
        return;
      this._hostVisible = s, this.isConnected && this._initialized && (this._reactive?.notifyHostVisibility(s, l), this.onHostVisibilityChanged(s, l));
      return;
    }
    const r = this.constructor.wippyConfig, { props: o, errors: i } = It(this, r.propsSchema);
    r.validateProps && i.push(...r.validateProps(o));
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
function Jo(e) {
  return e.__wippyHostBus ?? null;
}
function Zo(e) {
  return e.dataset.wippyPanelId ?? null;
}
/*!
 * pinia v4.0.3
 * (c) 2026 Eduardo San Martin Morote
 * @license MIT
 */
let rr;
const or = (e) => rr = e, Qo = () => mo() && $t(ir) || rr, ir = (
  /* istanbul ignore next */
  Symbol()
);
function Xo() {
  const e = go(!0), t = e.run(() => B({}));
  let n = [], r = [];
  const o = bo({
    install(i) {
      or(o), o._a = i, i.provide(ir, o), i.config.globalProperties.$pinia = o, r.forEach((a) => n.push(a)), r = [];
    },
    use(i) {
      return this._a ? n.push(i) : r.push(i), this;
    },
    _p: n,
    _a: null,
    _e: e,
    _s: /* @__PURE__ */ new Map(),
    state: t
  });
  return o;
}
var ei = Object.defineProperty, ti = (e, t, n) => t in e ? ei(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n, Re = (e, t, n) => ti(e, typeof t != "symbol" ? t + "" : t, n), ar = /* @__PURE__ */ Symbol("wippy:emit"), sr = /* @__PURE__ */ Symbol("wippy:props"), ni = /* @__PURE__ */ Symbol("wippy:props_error"), ri = /* @__PURE__ */ Symbol("wippy:content"), oi = /* @__PURE__ */ Symbol("wippy:panel-id"), ii = /* @__PURE__ */ Symbol("wippy:layout-bus"), ai = /* @__PURE__ */ Symbol("wippy:host"), lr = /* @__PURE__ */ Symbol("wippy:host-visibility");
function nc() {
  const e = $t(sr);
  if (!e)
    throw new Error("useProps() must be called inside a WippyVueElement");
  return e;
}
function rc() {
  const e = $t(ar);
  if (!e)
    throw new Error("useEvents() must be called inside a WippyVueElement");
  return e;
}
function si() {
  const e = $t(lr);
  if (!e)
    throw new Error("useHostVisibility() must be called inside a WippyVueElement");
  return e;
}
function oc(e) {
  const t = si();
  let n = !1, r = null, o = !1;
  function i() {
    if (r)
      return o = !0, r;
    let a;
    try {
      a = Promise.resolve(e());
    } catch (s) {
      a = Promise.reject(s);
    }
    const l = a.finally(() => {
      if (r === l && (r = null, n && o))
        return o = !1, i();
    });
    return r = l, l;
  }
  return en(() => (n = !0, i())), vo(() => {
    n = !1, o = !1;
  }), ke(t, (a, l) => {
    if (n && l === !1 && a === !0)
      return i();
  }), t;
}
var ic = class extends Yo {
  constructor() {
    super(...arguments), Re(this, "_vueApp", null), Re(this, "_propsRef", B({})), Re(this, "_errorsRef", B([])), Re(this, "_contentRef", B(null)), Re(this, "_hostVisibilityRef", B(null)), Re(this, "_bridgeAbort", null);
  }
  /**
   * Override to provide Vue-specific configuration.
   */
  static get vueConfig() {
    throw new Error("WippyVueElement subclass must override static get vueConfig()");
  }
  onMount(e, t, n, r, o, i) {
    const a = this.constructor.vueConfig;
    this._propsRef.value = n, this._errorsRef.value = r, this._contentRef.value = o ?? null, this._hostVisibilityRef.value = this.hostVisible;
    for (const d of r)
      this.emitEvent("invalid", { message: d });
    const l = new AbortController();
    this._bridgeAbort = l, this.reactive.props.subscribe((d, c) => {
      this._propsRef.value = d, this._errorsRef.value = [...c];
      for (const u of c)
        this.emitEvent("invalid", { message: u });
    }, { signal: l.signal }), this.reactive.content && this.reactive.content.subscribe((d) => {
      this._contentRef.value = d;
    }, { signal: l.signal }), this.reactive.hostVisibility.subscribe((d) => {
      this._hostVisibilityRef.value = d;
    }, { signal: l.signal });
    const s = (d) => {
      if (l.signal.aborted)
        return;
      const c = Qo(), u = yo(d.rootComponent);
      this._vueApp = u;
      const p = Xo();
      if (d.piniaPlugins)
        for (const h of d.piniaPlugins)
          p.use(h);
      if (u.use(p), d.plugins)
        for (const h of d.plugins)
          u.use(h);
      u.provide(sr, this._propsRef), u.provide(ni, this._errorsRef), u.provide(ar, this.emitEvent.bind(this)), u.provide(ri, this._contentRef), u.provide(lr, this._hostVisibilityRef), u.provide(oi, Zo(this)), u.provide(ii, Jo(this)), u.provide(ai, nr(this)), d.providers && d.providers(u, this), u.mount(t), c && or(c);
    };
    if (a.rootComponent)
      s(a);
    else if (a.lazyConfig) {
      const d = document.createElement("wippy-loading");
      d.setAttribute("no-bg", ""), t.appendChild(d), a.lazyConfig().then((c) => {
        l.signal.aborted || (d.remove(), s(c));
      }).catch((c) => {
        if (l.signal.aborted)
          return;
        const u = c instanceof Error ? c.message : String(c), p = document.createElement("wippy-error");
        p.setAttribute("title", "Failed to load"), p.setAttribute("message", u), d.replaceWith(p), this.emitEvent("error", { message: u });
      });
    } else
      throw new Error("WippyVueElement vueConfig must provide rootComponent or lazyConfig");
  }
  onUnmount() {
    this._bridgeAbort?.abort(), this._bridgeAbort = null, this._vueApp && (this._vueApp.unmount(), this._vueApp = null);
  }
}, li = Object.defineProperty, mn = Object.getOwnPropertySymbols, di = Object.prototype.hasOwnProperty, ci = Object.prototype.propertyIsEnumerable, gn = (e, t, n) => t in e ? li(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n, ui = (e, t) => {
  for (var n in t || (t = {})) di.call(t, n) && gn(e, n, t[n]);
  if (mn) for (var n of mn(t)) ci.call(t, n) && gn(e, n, t[n]);
  return e;
};
function Fe(e) {
  return e == null || e === "" || Array.isArray(e) && e.length === 0 || !(e instanceof Date) && typeof e == "object" && Object.keys(e).length === 0;
}
function Vt(e, t, n = /* @__PURE__ */ new WeakSet()) {
  if (e === t) return !0;
  if (!e || !t || typeof e != "object" || typeof t != "object" || n.has(e) || n.has(t)) return !1;
  n.add(e).add(t);
  let r = Array.isArray(e), o = Array.isArray(t), i, a, l;
  if (r && o) {
    if (a = e.length, a != t.length) return !1;
    for (i = a; i-- !== 0; ) if (!Vt(e[i], t[i], n)) return !1;
    return !0;
  }
  if (r != o) return !1;
  let s = e instanceof Date, d = t instanceof Date;
  if (s != d) return !1;
  if (s && d) return e.getTime() == t.getTime();
  let c = e instanceof RegExp, u = t instanceof RegExp;
  if (c != u) return !1;
  if (c && u) return e.toString() == t.toString();
  let p = Object.keys(e);
  if (a = p.length, a !== Object.keys(t).length) return !1;
  for (i = a; i-- !== 0; ) if (!Object.prototype.hasOwnProperty.call(t, p[i])) return !1;
  for (i = a; i-- !== 0; ) if (l = p[i], !Vt(e[l], t[l], n)) return !1;
  return !0;
}
function pi(e, t) {
  return Vt(e, t);
}
function Ot(e) {
  return typeof e == "function" && "call" in e && "apply" in e;
}
function A(e) {
  return !Fe(e);
}
function we(e, t) {
  if (!e || !t) return null;
  try {
    let n = e[t];
    if (A(n)) return n;
  } catch {
  }
  if (Object.keys(e).length) {
    if (Ot(t)) return t(e);
    if (t.indexOf(".") === -1) return e[t];
    {
      let n = t.split("."), r = e;
      for (let o = 0, i = n.length; o < i; ++o) {
        if (r == null) return null;
        r = r[n[o]];
      }
      return r;
    }
  }
  return null;
}
function dr(e, t, n) {
  return n ? we(e, n) === we(t, n) : pi(e, t);
}
function be(e, t = !0) {
  return e instanceof Object && e.constructor === Object && (t || Object.keys(e).length !== 0);
}
function cr(e = {}, t = {}) {
  let n = ui({}, e);
  return Object.keys(t).forEach((r) => {
    let o = r;
    be(t[o]) && o in e && be(e[o]) ? n[o] = cr(e[o], t[o]) : n[o] = t[o];
  }), n;
}
function fi(...e) {
  return e.reduce((t, n, r) => r === 0 ? n : cr(t, n), {});
}
function bn(e, t) {
  let n = -1;
  if (A(e)) try {
    n = e.findLastIndex(t);
  } catch {
    n = e.lastIndexOf([...e].reverse().find(t));
  }
  return n;
}
function ne(e, ...t) {
  return Ot(e) ? e(...t) : e;
}
function X(e, t = !0) {
  return typeof e == "string" && (t || e !== "");
}
function ge(e) {
  return X(e) ? e.replace(/(-|_)/g, "").toLowerCase() : e;
}
function nn(e, t = "", n = {}) {
  let r = ge(t).split("."), o = r.shift();
  if (o) {
    if (be(e)) {
      let i = Object.keys(e).find((a) => ge(a) === o) || "";
      return nn(ne(e[i], n), r.join("."), n);
    }
    return;
  }
  return ne(e, n);
}
function ur(e, t = !0) {
  return Array.isArray(e) && (t || e.length !== 0);
}
function hi(e) {
  return A(e) && !isNaN(e);
}
function mi(e = "") {
  return A(e) && e.length === 1 && !!e.match(/\S| /);
}
function Ve(e, t) {
  if (t) {
    let n = t.test(e);
    return t.lastIndex = 0, n;
  }
  return !1;
}
function gi(...e) {
  return fi(...e);
}
function Je(e) {
  return e && e.replace(/\/\*(?:(?!\*\/)[\s\S])*\*\/|[\r\n\t]+/g, "").replace(/ {2,}/g, " ").replace(/ ([{:}]) /g, "$1").replace(/([;,]) /g, "$1").replace(/ !/g, "!").replace(/: /g, ":").trim();
}
function ie(e) {
  if (e && /[\xC0-\xFF\u0100-\u017E]/.test(e)) {
    let t = { A: /[\xC0-\xC5\u0100\u0102\u0104]/g, AE: /[\xC6]/g, C: /[\xC7\u0106\u0108\u010A\u010C]/g, D: /[\xD0\u010E\u0110]/g, E: /[\xC8-\xCB\u0112\u0114\u0116\u0118\u011A]/g, G: /[\u011C\u011E\u0120\u0122]/g, H: /[\u0124\u0126]/g, I: /[\xCC-\xCF\u0128\u012A\u012C\u012E\u0130]/g, IJ: /[\u0132]/g, J: /[\u0134]/g, K: /[\u0136]/g, L: /[\u0139\u013B\u013D\u013F\u0141]/g, N: /[\xD1\u0143\u0145\u0147\u014A]/g, O: /[\xD2-\xD6\xD8\u014C\u014E\u0150]/g, OE: /[\u0152]/g, R: /[\u0154\u0156\u0158]/g, S: /[\u015A\u015C\u015E\u0160]/g, T: /[\u0162\u0164\u0166]/g, U: /[\xD9-\xDC\u0168\u016A\u016C\u016E\u0170\u0172]/g, W: /[\u0174]/g, Y: /[\xDD\u0176\u0178]/g, Z: /[\u0179\u017B\u017D]/g, a: /[\xE0-\xE5\u0101\u0103\u0105]/g, ae: /[\xE6]/g, c: /[\xE7\u0107\u0109\u010B\u010D]/g, d: /[\u010F\u0111]/g, e: /[\xE8-\xEB\u0113\u0115\u0117\u0119\u011B]/g, g: /[\u011D\u011F\u0121\u0123]/g, i: /[\xEC-\xEF\u0129\u012B\u012D\u012F\u0131]/g, ij: /[\u0133]/g, j: /[\u0135]/g, k: /[\u0137,\u0138]/g, l: /[\u013A\u013C\u013E\u0140\u0142]/g, n: /[\xF1\u0144\u0146\u0148\u014B]/g, p: /[\xFE]/g, o: /[\xF2-\xF6\xF8\u014D\u014F\u0151]/g, oe: /[\u0153]/g, r: /[\u0155\u0157\u0159]/g, s: /[\u015B\u015D\u015F\u0161]/g, t: /[\u0163\u0165\u0167]/g, u: /[\xF9-\xFC\u0169\u016B\u016D\u016F\u0171\u0173]/g, w: /[\u0175]/g, y: /[\xFD\xFF\u0177]/g, z: /[\u017A\u017C\u017E]/g };
    for (let n in t) e = e.replace(t[n], n);
  }
  return e;
}
function bi(e) {
  return X(e, !1) ? e[0].toUpperCase() + e.slice(1) : e;
}
function pr(e) {
  return X(e) ? e.replace(/(_)/g, "-").replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase() : e;
}
function rn() {
  let e = /* @__PURE__ */ new Map();
  return { on(t, n) {
    let r = e.get(t);
    return r ? r.push(n) : r = [n], e.set(t, r), this;
  }, off(t, n) {
    let r = e.get(t);
    return r && r.splice(r.indexOf(n) >>> 0, 1), this;
  }, emit(t, n) {
    let r = e.get(t);
    r && r.forEach((o) => {
      o(n);
    });
  }, clear() {
    e.clear();
  } };
}
function ue(...e) {
  if (e) {
    let t = [];
    for (let n = 0; n < e.length; n++) {
      let r = e[n];
      if (!r) continue;
      let o = typeof r;
      if (o === "string" || o === "number") t.push(r);
      else if (o === "object") {
        let i = Array.isArray(r) ? [ue(...r)] : Object.entries(r).map(([a, l]) => l ? a : void 0);
        t = i.length ? t.concat(i.filter((a) => !!a)) : t;
      }
    }
    return t.join(" ").trim();
  }
}
function vi(e, t) {
  return e ? e.classList ? e.classList.contains(t) : new RegExp("(^| )" + t + "( |$)", "gi").test(e.className) : !1;
}
function jt(e, t) {
  if (e && t) {
    let n = (r) => {
      vi(e, r) || (e.classList ? e.classList.add(r) : e.className += " " + r);
    };
    [t].flat().filter(Boolean).forEach((r) => r.split(" ").forEach(n));
  }
}
function yi() {
  return window.innerWidth - document.documentElement.offsetWidth;
}
function ac(e) {
  typeof e == "string" ? jt(document.body, e || "p-overflow-hidden") : (e != null && e.variableName && document.body.style.setProperty(e.variableName, yi() + "px"), jt(document.body, e?.className || "p-overflow-hidden"));
}
function Ze(e, t) {
  if (e && t) {
    let n = (r) => {
      e.classList ? e.classList.remove(r) : e.className = e.className.replace(new RegExp("(^|\\b)" + r.split(" ").join("|") + "(\\b|$)", "gi"), " ");
    };
    [t].flat().filter(Boolean).forEach((r) => r.split(" ").forEach(n));
  }
}
function sc(e) {
  typeof e == "string" ? Ze(document.body, e || "p-overflow-hidden") : (e != null && e.variableName && document.body.style.removeProperty(e.variableName), Ze(document.body, e?.className || "p-overflow-hidden"));
}
function Ft(e) {
  for (let t of document?.styleSheets) try {
    for (let n of t?.cssRules) for (let r of n?.style) if (e.test(r)) return { name: r, value: n.style.getPropertyValue(r).trim() };
  } catch {
  }
  return null;
}
function fr(e) {
  let t = { width: 0, height: 0 };
  if (e) {
    let [n, r] = [e.style.visibility, e.style.display], o = e.getBoundingClientRect();
    e.style.visibility = "hidden", e.style.display = "block", t.width = o.width || e.offsetWidth, t.height = o.height || e.offsetHeight, e.style.display = r, e.style.visibility = n;
  }
  return t;
}
function hr() {
  let e = window, t = document, n = t.documentElement, r = t.getElementsByTagName("body")[0], o = e.innerWidth || n.clientWidth || r.clientWidth, i = e.innerHeight || n.clientHeight || r.clientHeight;
  return { width: o, height: i };
}
function Nt(e) {
  return e ? Math.abs(e.scrollLeft) : 0;
}
function xi() {
  let e = document.documentElement;
  return (window.pageXOffset || Nt(e)) - (e.clientLeft || 0);
}
function wi() {
  let e = document.documentElement;
  return (window.pageYOffset || e.scrollTop) - (e.clientTop || 0);
}
function ki(e) {
  return e ? getComputedStyle(e).direction === "rtl" : !1;
}
function Si(e, t, n = !0) {
  var r, o, i, a;
  if (e) {
    let l = e.offsetParent ? { width: e.offsetWidth, height: e.offsetHeight } : fr(e), s = l.height, d = l.width, c = t.offsetHeight, u = t.offsetWidth, p = t.getBoundingClientRect(), h = wi(), m = xi(), y = hr(), b, k, _ = "top";
    p.top + c + s > y.height ? (b = p.top + h - s, _ = "bottom", b < 0 && (b = h)) : b = c + p.top + h, p.left + d > y.width ? k = Math.max(0, p.left + m + u - d) : k = p.left + m, ki(e) ? e.style.insetInlineEnd = k + "px" : e.style.insetInlineStart = k + "px", e.style.top = b + "px", e.style.transformOrigin = _, n && (e.style.marginTop = _ === "bottom" ? `calc(${(o = (r = Ft(/-anchor-gutter$/)) == null ? void 0 : r.value) != null ? o : "2px"} * -1)` : (a = (i = Ft(/-anchor-gutter$/)) == null ? void 0 : i.value) != null ? a : "");
  }
}
function $i(e, t) {
  e && (typeof t == "string" ? e.style.cssText = t : Object.entries(t || {}).forEach(([n, r]) => e.style[n] = r));
}
function mr(e, t) {
  return e instanceof HTMLElement ? e.offsetWidth : 0;
}
function Oi(e, t, n = !0, r = void 0) {
  var o;
  if (e) {
    let i = e.offsetParent ? { width: e.offsetWidth, height: e.offsetHeight } : fr(e), a = t.offsetHeight, l = t.getBoundingClientRect(), s = hr(), d, c, u = r ?? "top";
    if (!r && l.top + a + i.height > s.height ? (d = -1 * i.height, u = "bottom", l.top + d < 0 && (d = -1 * l.top)) : d = a, i.width > s.width ? c = l.left * -1 : l.left + i.width > s.width ? c = (l.left + i.width - s.width) * -1 : c = 0, e.style.top = d + "px", e.style.insetInlineStart = c + "px", e.style.transformOrigin = u, n) {
      let p = (o = Ft(/-anchor-gutter$/)) == null ? void 0 : o.value;
      e.style.marginTop = u === "bottom" ? `calc(${p ?? "2px"} * -1)` : p ?? "";
    }
  }
}
function gr(e) {
  if (e) {
    let t = e.parentNode;
    return t && t instanceof ShadowRoot && t.host && (t = t.host), t;
  }
  return null;
}
function _i(e) {
  return !!(e !== null && typeof e < "u" && e.nodeName && gr(e));
}
function Ne(e) {
  return typeof Element < "u" ? e instanceof Element : e !== null && typeof e == "object" && e.nodeType === 1 && typeof e.nodeName == "string";
}
function yt(e, t = {}) {
  if (Ne(e)) {
    let n = (r, o) => {
      var i, a;
      let l = (i = e?.$attrs) != null && i[r] ? [(a = e?.$attrs) == null ? void 0 : a[r]] : [];
      return [o].flat().reduce((s, d) => {
        if (d != null) {
          let c = typeof d;
          if (c === "string" || c === "number") s.push(d);
          else if (c === "object") {
            let u = Array.isArray(d) ? n(r, d) : Object.entries(d).map(([p, h]) => r === "style" && (h || h === 0) ? `${p.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase()}:${h}` : h ? p : void 0);
            s = u.length ? s.concat(u.filter((p) => !!p)) : s;
          }
        }
        return s;
      }, l);
    };
    Object.entries(t).forEach(([r, o]) => {
      if (o != null) {
        let i = r.match(/^on(.+)/);
        i ? e.addEventListener(i[1].toLowerCase(), o) : r === "p-bind" || r === "pBind" ? yt(e, o) : (o = r === "class" ? [...new Set(n("class", o))].join(" ").trim() : r === "style" ? n("style", o).join(";").trim() : o, (e.$attrs = e.$attrs || {}) && (e.$attrs[r] = o), e.setAttribute(r, o));
      }
    });
  }
}
function Ci(e, t = {}, ...n) {
  {
    let r = document.createElement(e);
    return yt(r, t), r.append(...n), r;
  }
}
function Ii(e, t) {
  return Ne(e) ? Array.from(e.querySelectorAll(t)) : [];
}
function _t(e, t) {
  return Ne(e) ? e.matches(t) ? e : e.querySelector(t) : null;
}
function ye(e, t) {
  e && document.activeElement !== e && e.focus(t);
}
function Pi(e, t) {
  if (Ne(e)) {
    let n = e.getAttribute(t);
    return isNaN(n) ? n === "true" || n === "false" ? n === "true" : n : +n;
  }
}
function on(e, t = "") {
  let n = Ii(e, `button:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t},
            [href]:not([tabindex = "-1"]):not([style*="display:none"]):not([hidden])${t},
            input:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t},
            select:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t},
            textarea:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t},
            [tabIndex]:not([tabIndex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t},
            [contenteditable]:not([tabIndex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t}`), r = [];
  for (let o of n) getComputedStyle(o).display != "none" && getComputedStyle(o).visibility != "hidden" && r.push(o);
  return r;
}
function Ti(e, t) {
  let n = on(e, t);
  return n.length > 0 ? n[0] : null;
}
function Ae(e) {
  if (e) {
    let t = e.offsetHeight, n = getComputedStyle(e);
    return t -= parseFloat(n.paddingTop) + parseFloat(n.paddingBottom) + parseFloat(n.borderTopWidth) + parseFloat(n.borderBottomWidth), t;
  }
  return 0;
}
function Li(e, t) {
  let n = on(e, t);
  return n.length > 0 ? n[n.length - 1] : null;
}
function Ai(e) {
  if (e) {
    let t = e.getBoundingClientRect();
    return { top: t.top + (window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0), left: t.left + (window.pageXOffset || Nt(document.documentElement) || Nt(document.body) || 0) };
  }
  return { top: "auto", left: "auto" };
}
function Ei(e, t) {
  return e ? e.offsetHeight : 0;
}
function br(e, t = []) {
  let n = gr(e);
  return n === null ? t : br(n, t.concat([n]));
}
function zi(e) {
  let t = [];
  if (e) {
    let n = br(e), r = /(auto|scroll)/, o = (i) => {
      try {
        let a = window.getComputedStyle(i, null);
        return r.test(a.getPropertyValue("overflow")) || r.test(a.getPropertyValue("overflowX")) || r.test(a.getPropertyValue("overflowY"));
      } catch {
        return !1;
      }
    };
    for (let i of n) {
      let a = i.nodeType === 1 && i.dataset.scrollselectors;
      if (a) {
        let l = a.split(",");
        for (let s of l) {
          let d = _t(i, s);
          d && o(d) && t.push(d);
        }
      }
      i.nodeType !== 9 && o(i) && t.push(i);
    }
  }
  return t;
}
function Ee(e) {
  if (e) {
    let t = e.offsetWidth, n = getComputedStyle(e);
    return t -= parseFloat(n.paddingLeft) + parseFloat(n.paddingRight) + parseFloat(n.borderLeftWidth) + parseFloat(n.borderRightWidth), t;
  }
  return 0;
}
function Vi() {
  return /(android)/i.test(navigator.userAgent);
}
function vr() {
  return !!(typeof window < "u" && window.document && window.document.createElement);
}
function lc(e, t = "") {
  return Ne(e) ? e.matches(`button:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t},
            [href][clientHeight][clientWidth]:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t},
            input:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t},
            select:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t},
            textarea:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t},
            [tabIndex]:not([tabIndex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t},
            [contenteditable]:not([tabIndex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])${t}`) : !1;
}
function xt(e) {
  return !!(e && e.offsetParent != null);
}
function ji() {
  return "ontouchstart" in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;
}
function Fi(e, t = "", n) {
  Ne(e) && n !== null && n !== void 0 && e.setAttribute(t, n);
}
var mt = {};
function Ni(e = "pui_id_") {
  return Object.hasOwn(mt, e) || (mt[e] = 0), mt[e]++, `${e}${mt[e]}`;
}
function Mi() {
  let e = [], t = (a, l, s = 999) => {
    let d = o(a, l, s), c = d.value + (d.key === a ? 0 : s) + 1;
    return e.push({ key: a, value: c }), c;
  }, n = (a) => {
    e = e.filter((l) => l.value !== a);
  }, r = (a, l) => o(a).value, o = (a, l, s = 0) => [...e].reverse().find((d) => !0) || { key: a, value: s }, i = (a) => a && parseInt(a.style.zIndex, 10) || 0;
  return { get: i, set: (a, l, s) => {
    l && (l.style.zIndex = String(t(a, !0, s)));
  }, clear: (a) => {
    a && (n(i(a)), a.style.zIndex = "");
  }, getCurrent: (a) => r(a) };
}
var Pt = Mi(), Ri = Object.defineProperty, Di = Object.defineProperties, Bi = Object.getOwnPropertyDescriptors, wt = Object.getOwnPropertySymbols, yr = Object.prototype.hasOwnProperty, xr = Object.prototype.propertyIsEnumerable, vn = (e, t, n) => t in e ? Ri(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n, de = (e, t) => {
  for (var n in t || (t = {})) yr.call(t, n) && vn(e, n, t[n]);
  if (wt) for (var n of wt(t)) xr.call(t, n) && vn(e, n, t[n]);
  return e;
}, Tt = (e, t) => Di(e, Bi(t)), xe = (e, t) => {
  var n = {};
  for (var r in e) yr.call(e, r) && t.indexOf(r) < 0 && (n[r] = e[r]);
  if (e != null && wt) for (var r of wt(e)) t.indexOf(r) < 0 && xr.call(e, r) && (n[r] = e[r]);
  return n;
}, Hi = rn(), Y = Hi, Qe = /{([^}]*)}/g, wr = /(\d+\s+[\+\-\*\/]\s+\d+)/g, kr = /var\([^)]+\)/g;
function yn(e) {
  return X(e) ? e.replace(/[A-Z]/g, (t, n) => n === 0 ? t : "." + t.toLowerCase()).toLowerCase() : e;
}
function Ui(e) {
  return be(e) && e.hasOwnProperty("$value") && e.hasOwnProperty("$type") ? e.$value : e;
}
function Ki(e) {
  return e.replaceAll(/ /g, "").replace(/[^\w]/g, "-");
}
function Mt(e = "", t = "") {
  return Ki(`${X(e, !1) && X(t, !1) ? `${e}-` : e}${t}`);
}
function Sr(e = "", t = "") {
  return `--${Mt(e, t)}`;
}
function Wi(e = "") {
  let t = (e.match(/{/g) || []).length, n = (e.match(/}/g) || []).length;
  return (t + n) % 2 !== 0;
}
function $r(e, t = "", n = "", r = [], o) {
  if (X(e)) {
    let i = e.trim();
    if (Wi(i)) return;
    if (Ve(i, Qe)) {
      let a = i.replaceAll(Qe, (l) => {
        let s = l.replace(/{|}/g, "").split(".").filter((d) => !r.some((c) => Ve(d, c)));
        return `var(${Sr(n, pr(s.join("-")))}${A(o) ? `, ${o}` : ""})`;
      });
      return Ve(a.replace(kr, "0"), wr) ? `calc(${a})` : a;
    }
    return i;
  } else if (hi(e)) return e;
}
function Gi(e, t, n) {
  X(t, !1) && e.push(`${t}:${n};`);
}
function De(e, t) {
  return e ? `${e}{${t}}` : "";
}
function Or(e, t) {
  if (e.indexOf("dt(") === -1) return e;
  function n(a, l) {
    let s = [], d = 0, c = "", u = null, p = 0;
    for (; d <= a.length; ) {
      let h = a[d];
      if ((h === '"' || h === "'" || h === "`") && a[d - 1] !== "\\" && (u = u === h ? null : h), !u && (h === "(" && p++, h === ")" && p--, (h === "," || d === a.length) && p === 0)) {
        let m = c.trim();
        m.startsWith("dt(") ? s.push(Or(m, l)) : s.push(r(m)), c = "", d++;
        continue;
      }
      h !== void 0 && (c += h), d++;
    }
    return s;
  }
  function r(a) {
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
    let [l, s] = o[a], d = e.slice(l + 3, s), c = n(d, t), u = t(...c);
    e = e.slice(0, l) + u + e.slice(s + 1);
  }
  return e;
}
var dc = (e) => {
  var t;
  let n = F.getTheme(), r = Rt(n, e, void 0, "variable"), o = (t = r?.match(/--[\w-]+/g)) == null ? void 0 : t[0], i = Rt(n, e, void 0, "value");
  return { name: o, variable: r, value: i };
}, je = (...e) => Rt(F.getTheme(), ...e), Rt = (e = {}, t, n, r) => {
  if (t) {
    let { variable: o, options: i } = F.defaults || {}, { prefix: a, transform: l } = e?.options || i || {}, s = Ve(t, Qe) ? t : `{${t}}`;
    return r === "value" || Fe(r) && l === "strict" ? F.getTokenValue(t) : $r(s, void 0, a, [o.excludedKeyRegex], n);
  }
  return "";
};
function gt(e, ...t) {
  if (e instanceof Array) {
    let n = e.reduce((r, o, i) => {
      var a;
      return r + o + ((a = ne(t[i], { dt: je })) != null ? a : "");
    }, "");
    return Or(n, je);
  }
  return ne(e, { dt: je });
}
function qi(e, t = {}) {
  let n = F.defaults.variable, { prefix: r = n.prefix, selector: o = n.selector, excludedKeyRegex: i = n.excludedKeyRegex } = t, a = [], l = [], s = [{ node: e, path: r }];
  for (; s.length; ) {
    let { node: c, path: u } = s.pop();
    for (let p in c) {
      let h = c[p], m = Ui(h), y = Ve(p, i) ? Mt(u) : Mt(u, pr(p));
      if (be(m)) s.push({ node: m, path: y });
      else {
        let b = Sr(y), k = $r(m, y, r, [i]);
        Gi(l, b, k);
        let _ = y;
        r && _.startsWith(r + "-") && (_ = _.slice(r.length + 1)), a.push(_.replace(/-/g, "."));
      }
    }
  }
  let d = l.join("");
  return { value: l, tokens: a, declarations: d, css: De(o, d) };
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
    var r;
    return (r = t.map((o) => o.resolve(n)).find((o) => o.matched)) != null ? r : this.rules.custom.resolve(n);
  });
} }, _toVariables(e, t) {
  return qi(e, { prefix: t?.prefix });
}, getCommon({ name: e = "", theme: t = {}, params: n, set: r, defaults: o }) {
  var i, a, l, s, d, c, u;
  let { preset: p, options: h } = t, m, y, b, k, _, S, f;
  if (A(p) && h.transform !== "strict") {
    let { primitive: g, semantic: C, extend: w } = p, x = C || {}, { colorScheme: V } = x, H = xe(x, ["colorScheme"]), M = w || {}, { colorScheme: K } = M, ee = xe(M, ["colorScheme"]), te = V || {}, { dark: G } = te, Z = xe(te, ["dark"]), re = K || {}, { dark: $e } = re, pe = xe(re, ["dark"]), oe = A(g) ? this._toVariables({ primitive: g }, h) : {}, fe = A(H) ? this._toVariables({ semantic: H }, h) : {}, Ie = A(Z) ? this._toVariables({ light: Z }, h) : {}, ft = A(G) ? this._toVariables({ dark: G }, h) : {}, Me = A(ee) ? this._toVariables({ semantic: ee }, h) : {}, dn = A(pe) ? this._toVariables({ light: pe }, h) : {}, cn = A($e) ? this._toVariables({ dark: $e }, h) : {}, [Jr, Zr] = [(i = oe.declarations) != null ? i : "", oe.tokens], [Qr, Xr] = [(a = fe.declarations) != null ? a : "", fe.tokens || []], [eo, to] = [(l = Ie.declarations) != null ? l : "", Ie.tokens || []], [no, ro] = [(s = ft.declarations) != null ? s : "", ft.tokens || []], [oo, io] = [(d = Me.declarations) != null ? d : "", Me.tokens || []], [ao, so] = [(c = dn.declarations) != null ? c : "", dn.tokens || []], [lo, co] = [(u = cn.declarations) != null ? u : "", cn.tokens || []];
    m = this.transformCSS(e, Jr, "light", "variable", h, r, o), y = Zr;
    let uo = this.transformCSS(e, `${Qr}${eo}`, "light", "variable", h, r, o), po = this.transformCSS(e, `${no}`, "dark", "variable", h, r, o);
    b = `${uo}${po}`, k = [.../* @__PURE__ */ new Set([...Xr, ...to, ...ro])];
    let fo = this.transformCSS(e, `${oo}${ao}color-scheme:light`, "light", "variable", h, r, o), ho = this.transformCSS(e, `${lo}color-scheme:dark`, "dark", "variable", h, r, o);
    _ = `${fo}${ho}`, S = [.../* @__PURE__ */ new Set([...io, ...so, ...co])], f = ne(p.css, { dt: je });
  }
  return { primitive: { css: m, tokens: y }, semantic: { css: b, tokens: k }, global: { css: _, tokens: S }, style: f };
}, getPreset({ name: e = "", preset: t = {}, options: n, params: r, set: o, defaults: i, selector: a }) {
  var l, s, d;
  let c, u, p;
  if (A(t) && n.transform !== "strict") {
    let h = e.replace("-directive", ""), m = t, { colorScheme: y, extend: b, css: k } = m, _ = xe(m, ["colorScheme", "extend", "css"]), S = b || {}, { colorScheme: f } = S, g = xe(S, ["colorScheme"]), C = y || {}, { dark: w } = C, x = xe(C, ["dark"]), V = f || {}, { dark: H } = V, M = xe(V, ["dark"]), K = A(_) ? this._toVariables({ [h]: de(de({}, _), g) }, n) : {}, ee = A(x) ? this._toVariables({ [h]: de(de({}, x), M) }, n) : {}, te = A(w) ? this._toVariables({ [h]: de(de({}, w), H) }, n) : {}, [G, Z] = [(l = K.declarations) != null ? l : "", K.tokens || []], [re, $e] = [(s = ee.declarations) != null ? s : "", ee.tokens || []], [pe, oe] = [(d = te.declarations) != null ? d : "", te.tokens || []], fe = this.transformCSS(h, `${G}${re}`, "light", "variable", n, o, i, a), Ie = this.transformCSS(h, pe, "dark", "variable", n, o, i, a);
    c = `${fe}${Ie}`, u = [.../* @__PURE__ */ new Set([...Z, ...$e, ...oe])], p = ne(k, { dt: je });
  }
  return { css: c, tokens: u, style: p };
}, getPresetC({ name: e = "", theme: t = {}, params: n, set: r, defaults: o }) {
  var i;
  let { preset: a, options: l } = t, s = (i = a?.components) == null ? void 0 : i[e];
  return this.getPreset({ name: e, preset: s, options: l, params: n, set: r, defaults: o });
}, getPresetD({ name: e = "", theme: t = {}, params: n, set: r, defaults: o }) {
  var i, a;
  let l = e.replace("-directive", ""), { preset: s, options: d } = t, c = ((i = s?.components) == null ? void 0 : i[l]) || ((a = s?.directives) == null ? void 0 : a[l]);
  return this.getPreset({ name: l, preset: c, options: d, params: n, set: r, defaults: o });
}, applyDarkColorScheme(e) {
  return !(e.darkModeSelector === "none" || e.darkModeSelector === !1);
}, getColorSchemeOption(e, t) {
  var n;
  return this.applyDarkColorScheme(e) ? this.regex.resolve(e.darkModeSelector === !0 ? t.options.darkModeSelector : (n = e.darkModeSelector) != null ? n : t.options.darkModeSelector) : [];
}, getLayerOrder(e, t = {}, n, r) {
  let { cssLayer: o } = t;
  return o ? `@layer ${ne(o.order || o.name || "primeui", n)}` : "";
}, getCommonStyleSheet({ name: e = "", theme: t = {}, params: n, props: r = {}, set: o, defaults: i }) {
  let a = this.getCommon({ name: e, theme: t, params: n, set: o, defaults: i }), l = Object.entries(r).reduce((s, [d, c]) => s.push(`${d}="${c}"`) && s, []).join(" ");
  return Object.entries(a || {}).reduce((s, [d, c]) => {
    if (be(c) && Object.hasOwn(c, "css")) {
      let u = Je(c.css), p = `${d}-variables`;
      s.push(`<style type="text/css" data-primevue-style-id="${p}" ${l}>${u}</style>`);
    }
    return s;
  }, []).join("");
}, getStyleSheet({ name: e = "", theme: t = {}, params: n, props: r = {}, set: o, defaults: i }) {
  var a;
  let l = { name: e, theme: t, params: n, set: o, defaults: i }, s = (a = e.includes("-directive") ? this.getPresetD(l) : this.getPresetC(l)) == null ? void 0 : a.css, d = Object.entries(r).reduce((c, [u, p]) => c.push(`${u}="${p}"`) && c, []).join(" ");
  return s ? `<style type="text/css" data-primevue-style-id="${e}-variables" ${d}>${Je(s)}</style>` : "";
}, createTokens(e = {}, t, n = "", r = "", o = {}) {
  let i = function(l, s = {}, d = []) {
    if (d.includes(this.path)) return console.warn(`Circular reference detected at ${this.path}`), { colorScheme: l, path: this.path, paths: s, value: void 0 };
    d.push(this.path), s.name = this.path, s.binding || (s.binding = {});
    let c = this.value;
    if (typeof this.value == "string" && Qe.test(this.value)) {
      let u = this.value.trim().replace(Qe, (p) => {
        var h;
        let m = p.slice(1, -1), y = this.tokens[m];
        if (!y) return console.warn(`Token not found for path: ${m}`), "__UNRESOLVED__";
        let b = y.computed(l, s, d);
        return Array.isArray(b) && b.length === 2 ? `light-dark(${b[0].value},${b[1].value})` : (h = b?.value) != null ? h : "__UNRESOLVED__";
      });
      c = wr.test(u.replace(kr, "0")) ? `calc(${u})` : u;
    }
    return Fe(s.binding) && delete s.binding, d.pop(), { colorScheme: l, path: this.path, paths: s, value: c.includes("__UNRESOLVED__") ? void 0 : c };
  }, a = (l, s, d) => {
    Object.entries(l).forEach(([c, u]) => {
      let p = Ve(c, t.variable.excludedKeyRegex) ? s : s ? `${s}.${yn(c)}` : yn(c), h = d ? `${d}.${c}` : c;
      be(u) ? a(u, p, h) : (o[p] || (o[p] = { paths: [], computed: (m, y = {}, b = []) => {
        if (o[p].paths.length === 1) return o[p].paths[0].computed(o[p].paths[0].scheme, y.binding, b);
        if (m && m !== "none") for (let k = 0; k < o[p].paths.length; k++) {
          let _ = o[p].paths[k];
          if (_.scheme === m) return _.computed(m, y.binding, b);
        }
        return o[p].paths.map((k) => k.computed(k.scheme, y[k.scheme], b));
      } }), o[p].paths.push({ path: h, value: u, scheme: h.includes("colorScheme.light") ? "light" : h.includes("colorScheme.dark") ? "dark" : "none", computed: i, tokens: o }));
    });
  };
  return a(e, n, r), o;
}, getTokenValue(e, t, n) {
  var r;
  let o = ((l) => l.split(".").filter((s) => !Ve(s.toLowerCase(), n.variable.excludedKeyRegex)).join("."))(t), i = t.includes("colorScheme.light") ? "light" : t.includes("colorScheme.dark") ? "dark" : void 0, a = [(r = e[o]) == null ? void 0 : r.computed(i)].flat().filter((l) => l);
  return a.length === 1 ? a[0].value : a.reduce((l = {}, s) => {
    let d = s, { colorScheme: c } = d, u = xe(d, ["colorScheme"]);
    return l[c] = u, l;
  }, void 0);
}, getSelectorRule(e, t, n, r) {
  return n === "class" || n === "attr" ? De(A(t) ? `${e}${t},${e} ${t}` : e, r) : De(e, De(t ?? ":root,:host", r));
}, transformCSS(e, t, n, r, o = {}, i, a, l) {
  if (A(t)) {
    let { cssLayer: s } = o;
    if (r !== "style") {
      let d = this.getColorSchemeOption(o, a);
      t = n === "dark" ? d.reduce((c, { type: u, selector: p }) => (A(p) && (c += p.includes("[CSS]") ? p.replace("[CSS]", t) : this.getSelectorRule(p, l, u, t)), c), "") : De(l ?? ":root,:host", t);
    }
    if (s) {
      let d = { name: "primeui" };
      be(s) && (d.name = ne(s.name, { name: e, type: r })), A(d.name) && (t = De(`@layer ${d.name}`, t), i?.layerNames(d.name));
    }
    return t;
  }
  return "";
} }, F = { defaults: { variable: { prefix: "p", selector: ":root,:host", excludedKeyRegex: /^(primitive|semantic|components|directives|variables|colorscheme|light|dark|common|root|states|extend|css)$/gi }, options: { prefix: "p", darkModeSelector: "system", cssLayer: !1 } }, _theme: void 0, _layerNames: /* @__PURE__ */ new Set(), _loadedStyleNames: /* @__PURE__ */ new Set(), _loadingStyles: /* @__PURE__ */ new Set(), _tokens: {}, update(e = {}) {
  let { theme: t } = e;
  t && (this._theme = Tt(de({}, t), { options: de(de({}, this.defaults.options), t.options) }), this._tokens = le.createTokens(this.preset, this.defaults), this.clearLoadedStyleNames());
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
  this.update({ theme: e }), Y.emit("theme:change", e);
}, getPreset() {
  return this.preset;
}, setPreset(e) {
  this._theme = Tt(de({}, this.theme), { preset: e }), this._tokens = le.createTokens(e, this.defaults), this.clearLoadedStyleNames(), Y.emit("preset:change", e), Y.emit("theme:change", this.theme);
}, getOptions() {
  return this.options;
}, setOptions(e) {
  this._theme = Tt(de({}, this.theme), { options: e }), this.clearLoadedStyleNames(), Y.emit("options:change", e), Y.emit("theme:change", this.theme);
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
}, getCustomPreset(e = "", t, n, r) {
  let o = { name: e, preset: t, options: this.options, selector: n, params: r, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } };
  return le.getPreset(o);
}, getLayerOrderCSS(e = "") {
  return le.getLayerOrder(e, this.options, { names: this.getLayerNames() }, this.defaults);
}, transformCSS(e = "", t, n = "style", r) {
  return le.transformCSS(e, t, r, n, this.options, { layerNames: this.setLayerNames.bind(this) }, this.defaults);
}, getCommonStyleSheet(e = "", t, n = {}) {
  return le.getCommonStyleSheet({ name: e, theme: this.theme, params: t, props: n, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } });
}, getStyleSheet(e, t, n = {}) {
  return le.getStyleSheet({ name: e, theme: this.theme, params: t, props: n, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } });
}, onStyleMounted(e) {
  this._loadingStyles.add(e);
}, onStyleUpdated(e) {
  this._loadingStyles.add(e);
}, onStyleLoaded(e, { name: t }) {
  this._loadingStyles.size && (this._loadingStyles.delete(t), Y.emit(`theme:${t}:load`, e), !this._loadingStyles.size && Y.emit("theme:load"));
} }, J = {
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
function xn(e, t) {
  var n = typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (!n) {
    if (Array.isArray(e) || (n = Yi(e)) || t) {
      n && (e = n);
      var r = 0, o = function() {
      };
      return { s: o, n: function() {
        return r >= e.length ? { done: !0 } : { done: !1, value: e[r++] };
      }, e: function(d) {
        throw d;
      }, f: o };
    }
    throw new TypeError(`Invalid attempt to iterate non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
  }
  var i, a = !0, l = !1;
  return { s: function() {
    n = n.call(e);
  }, n: function() {
    var d = n.next();
    return a = d.done, d;
  }, e: function(d) {
    l = !0, i = d;
  }, f: function() {
    try {
      a || n.return == null || n.return();
    } finally {
      if (l) throw i;
    }
  } };
}
function Yi(e, t) {
  if (e) {
    if (typeof e == "string") return wn(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? wn(e, t) : void 0;
  }
}
function wn(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
var Ji = {
  filter: function(t, n, r, o, i) {
    var a = [];
    if (!t)
      return a;
    var l = xn(t), s;
    try {
      for (l.s(); !(s = l.n()).done; ) {
        var d = s.value;
        if (typeof d == "string") {
          if (this.filters[o](d, r, i)) {
            a.push(d);
            continue;
          }
        } else {
          var c = xn(n), u;
          try {
            for (c.s(); !(u = c.n()).done; ) {
              var p = u.value, h = we(d, p);
              if (this.filters[o](h, r, i)) {
                a.push(d);
                break;
              }
            }
          } catch (m) {
            c.e(m);
          } finally {
            c.f();
          }
        }
      }
    } catch (m) {
      l.e(m);
    } finally {
      l.f();
    }
    return a;
  },
  filters: {
    startsWith: function(t, n, r) {
      if (n == null || n === "")
        return !0;
      if (t == null)
        return !1;
      var o = ie(n.toString()).toLocaleLowerCase(r), i = ie(t.toString()).toLocaleLowerCase(r);
      return i.slice(0, o.length) === o;
    },
    contains: function(t, n, r) {
      if (n == null || n === "")
        return !0;
      if (t == null)
        return !1;
      var o = ie(n.toString()).toLocaleLowerCase(r), i = ie(t.toString()).toLocaleLowerCase(r);
      return i.indexOf(o) !== -1;
    },
    notContains: function(t, n, r) {
      if (n == null || n === "")
        return !0;
      if (t == null)
        return !1;
      var o = ie(n.toString()).toLocaleLowerCase(r), i = ie(t.toString()).toLocaleLowerCase(r);
      return i.indexOf(o) === -1;
    },
    endsWith: function(t, n, r) {
      if (n == null || n === "")
        return !0;
      if (t == null)
        return !1;
      var o = ie(n.toString()).toLocaleLowerCase(r), i = ie(t.toString()).toLocaleLowerCase(r);
      return i.indexOf(o, i.length - o.length) !== -1;
    },
    equals: function(t, n, r) {
      return n == null || n === "" ? !0 : t == null ? !1 : t.getTime && n.getTime ? t.getTime() === n.getTime() : ie(t.toString()).toLocaleLowerCase(r) == ie(n.toString()).toLocaleLowerCase(r);
    },
    notEquals: function(t, n, r) {
      return n == null || n === "" ? !1 : t == null ? !0 : t.getTime && n.getTime ? t.getTime() !== n.getTime() : ie(t.toString()).toLocaleLowerCase(r) != ie(n.toString()).toLocaleLowerCase(r);
    },
    in: function(t, n) {
      if (n == null || n.length === 0)
        return !0;
      for (var r = 0; r < n.length; r++)
        if (dr(t, n[r]))
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
}, Zi = `
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
function Xe(e) {
  "@babel/helpers - typeof";
  return Xe = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, Xe(e);
}
function kn(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(e);
    t && (r = r.filter(function(o) {
      return Object.getOwnPropertyDescriptor(e, o).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function Sn(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? kn(Object(n), !0).forEach(function(r) {
      Qi(e, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : kn(Object(n)).forEach(function(r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return e;
}
function Qi(e, t, n) {
  return (t = Xi(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Xi(e) {
  var t = ea(e, "string");
  return Xe(t) == "symbol" ? t : t + "";
}
function ea(e, t) {
  if (Xe(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (Xe(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
function ta(e) {
  var t = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0;
  un() && un().components ? en(e) : t ? e() : wo(e);
}
var na = 0;
function ra(e) {
  var t = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, n = B(!1), r = B(e), o = B(null), i = vr() ? window.document : void 0, a = t.document, l = a === void 0 ? i : a, s = t.immediate, d = s === void 0 ? !0 : s, c = t.manual, u = c === void 0 ? !1 : c, p = t.name, h = p === void 0 ? "style_".concat(++na) : p, m = t.id, y = m === void 0 ? void 0 : m, b = t.media, k = b === void 0 ? void 0 : b, _ = t.nonce, S = _ === void 0 ? void 0 : _, f = t.first, g = f === void 0 ? !1 : f, C = t.onMounted, w = C === void 0 ? void 0 : C, x = t.onUpdated, V = x === void 0 ? void 0 : x, H = t.onLoad, M = H === void 0 ? void 0 : H, K = t.props, ee = K === void 0 ? {} : K, te = function() {
  }, G = function($e) {
    var pe = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    if (l) {
      var oe = Sn(Sn({}, ee), pe), fe = oe.name || h, Ie = oe.id || y, ft = oe.nonce || S;
      o.value = l.querySelector('style[data-primevue-style-id="'.concat(fe, '"]')) || l.getElementById(Ie) || l.createElement("style"), o.value.isConnected || (r.value = $e || e, yt(o.value, {
        type: "text/css",
        id: Ie,
        media: k,
        nonce: ft
      }), g ? l.head.prepend(o.value) : l.head.appendChild(o.value), Fi(o.value, "data-primevue-style-id", fe), yt(o.value, oe), o.value.onload = function(Me) {
        return M?.(Me, {
          name: fe
        });
      }, w?.(fe)), !n.value && (te = ke(r, function(Me) {
        o.value.textContent = Me, V?.(fe);
      }, {
        immediate: !0
      }), n.value = !0);
    }
  }, Z = function() {
    !l || !n.value || (te(), _i(o.value) && l.head.removeChild(o.value), n.value = !1, o.value = null);
  };
  return d && !u && ta(G), {
    id: y,
    name: h,
    el: o,
    css: r,
    unload: Z,
    load: G,
    isLoaded: xo(n)
  };
}
function et(e) {
  "@babel/helpers - typeof";
  return et = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, et(e);
}
var $n, On, _n, Cn;
function In(e, t) {
  return sa(e) || aa(e, t) || ia(e, t) || oa();
}
function oa() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function ia(e, t) {
  if (e) {
    if (typeof e == "string") return Pn(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Pn(e, t) : void 0;
  }
}
function Pn(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function aa(e, t) {
  var n = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (n != null) {
    var r, o, i, a, l = [], s = !0, d = !1;
    try {
      if (i = (n = n.call(e)).next, t !== 0) for (; !(s = (r = i.call(n)).done) && (l.push(r.value), l.length !== t); s = !0) ;
    } catch (c) {
      d = !0, o = c;
    } finally {
      try {
        if (!s && n.return != null && (a = n.return(), Object(a) !== a)) return;
      } finally {
        if (d) throw o;
      }
    }
    return l;
  }
}
function sa(e) {
  if (Array.isArray(e)) return e;
}
function Tn(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(e);
    t && (r = r.filter(function(o) {
      return Object.getOwnPropertyDescriptor(e, o).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function Lt(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? Tn(Object(n), !0).forEach(function(r) {
      la(e, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Tn(Object(n)).forEach(function(r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return e;
}
function la(e, t, n) {
  return (t = da(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function da(e) {
  var t = ca(e, "string");
  return et(t) == "symbol" ? t : t + "";
}
function ca(e, t) {
  if (et(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (et(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
function bt(e, t) {
  return t || (t = e.slice(0)), Object.freeze(Object.defineProperties(e, { raw: { value: Object.freeze(t) } }));
}
var ua = function(t) {
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
}, pa = {}, fa = {}, z = {
  name: "base",
  css: ua,
  style: Zi,
  classes: pa,
  inlineStyles: fa,
  load: function(t) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, r = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : function(i) {
      return i;
    }, o = r(gt($n || ($n = bt(["", ""])), t));
    return A(o) ? ra(Je(o), Lt({
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
      var o = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "";
      return F.transformCSS(n.name || t.name, "".concat(o).concat(gt(On || (On = bt(["", ""])), r)));
    });
  },
  getCommonTheme: function(t) {
    return F.getCommon(this.name, t);
  },
  getComponentTheme: function(t) {
    return F.getComponent(this.name, t);
  },
  getDirectiveTheme: function(t) {
    return F.getDirective(this.name, t);
  },
  getPresetTheme: function(t, n, r) {
    return F.getCustomPreset(this.name, t, n, r);
  },
  getLayerOrderThemeCSS: function() {
    return F.getLayerOrderCSS(this.name);
  },
  getStyleSheet: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    if (this.css) {
      var r = ne(this.css, {
        dt: je
      }) || "", o = Je(gt(_n || (_n = bt(["", "", ""])), r, t)), i = Object.entries(n).reduce(function(a, l) {
        var s = In(l, 2), d = s[0], c = s[1];
        return a.push("".concat(d, '="').concat(c, '"')) && a;
      }, []).join(" ");
      return A(o) ? '<style type="text/css" data-primevue-style-id="'.concat(this.name, '" ').concat(i, ">").concat(o, "</style>") : "";
    }
    return "";
  },
  getCommonThemeStyleSheet: function(t) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    return F.getCommonStyleSheet(this.name, t, n);
  },
  getThemeStyleSheet: function(t) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, r = [F.getStyleSheet(this.name, t, n)];
    if (this.style) {
      var o = this.name === "base" ? "global-style" : "".concat(this.name, "-style"), i = gt(Cn || (Cn = bt(["", ""])), ne(this.style, {
        dt: je
      })), a = Je(F.transformCSS(o, i)), l = Object.entries(n).reduce(function(s, d) {
        var c = In(d, 2), u = c[0], p = c[1];
        return s.push("".concat(u, '="').concat(p, '"')) && s;
      }, []).join(" ");
      A(a) && r.push('<style type="text/css" data-primevue-style-id="'.concat(o, '" ').concat(l, ">").concat(a, "</style>"));
    }
    return r.join("");
  },
  extend: function(t) {
    return Lt(Lt({}, this), {}, {
      css: void 0,
      style: void 0
    }, t);
  }
}, _e = rn();
function tt(e) {
  "@babel/helpers - typeof";
  return tt = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, tt(e);
}
function Ln(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(e);
    t && (r = r.filter(function(o) {
      return Object.getOwnPropertyDescriptor(e, o).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function vt(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? Ln(Object(n), !0).forEach(function(r) {
      ha(e, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Ln(Object(n)).forEach(function(r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return e;
}
function ha(e, t, n) {
  return (t = ma(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function ma(e) {
  var t = ga(e, "string");
  return tt(t) == "symbol" ? t : t + "";
}
function ga(e, t) {
  if (tt(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (tt(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var ba = {
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
    text: [J.STARTS_WITH, J.CONTAINS, J.NOT_CONTAINS, J.ENDS_WITH, J.EQUALS, J.NOT_EQUALS],
    numeric: [J.EQUALS, J.NOT_EQUALS, J.LESS_THAN, J.LESS_THAN_OR_EQUAL_TO, J.GREATER_THAN, J.GREATER_THAN_OR_EQUAL_TO],
    date: [J.DATE_IS, J.DATE_IS_NOT, J.DATE_BEFORE, J.DATE_AFTER]
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
}, va = Symbol();
function ya(e, t) {
  var n = {
    config: Zn(t)
  };
  return e.config.globalProperties.$primevue = n, e.provide(va, n), xa(), wa(e, n), n;
}
var Be = [];
function xa() {
  Y.clear(), Be.forEach(function(e) {
    return e?.();
  }), Be = [];
}
function wa(e, t) {
  var n = B(!1), r = function() {
    var d;
    if (((d = t.config) === null || d === void 0 ? void 0 : d.theme) !== "none" && !F.isStyleNameLoaded("common")) {
      var c, u, p = ((c = z.getCommonTheme) === null || c === void 0 ? void 0 : c.call(z)) || {}, h = p.primitive, m = p.semantic, y = p.global, b = p.style, k = {
        nonce: (u = t.config) === null || u === void 0 || (u = u.csp) === null || u === void 0 ? void 0 : u.nonce
      };
      z.load(h?.css, vt({
        name: "primitive-variables"
      }, k)), z.load(m?.css, vt({
        name: "semantic-variables"
      }, k)), z.load(y?.css, vt({
        name: "global-variables"
      }, k)), z.loadStyle(vt({
        name: "global-style"
      }, k), b), F.setLoadedStyleName("common");
    }
  };
  Y.on("theme:change", function(s) {
    n.value || (e.config.globalProperties.$primevue.config.theme = s, n.value = !0);
  });
  var o = ke(t.config, function(s, d) {
    _e.emit("config:change", {
      newValue: s,
      oldValue: d
    });
  }, {
    immediate: !0,
    deep: !0
  }), i = ke(function() {
    return t.config.ripple;
  }, function(s, d) {
    _e.emit("config:ripple:change", {
      newValue: s,
      oldValue: d
    });
  }, {
    immediate: !0,
    deep: !0
  }), a = ke(function() {
    return t.config.theme;
  }, function(s, d) {
    n.value || F.setTheme(s), t.config.unstyled || r(), n.value = !1, _e.emit("config:theme:change", {
      newValue: s,
      oldValue: d
    });
  }, {
    immediate: !0,
    deep: !1
  }), l = ke(function() {
    return t.config.unstyled;
  }, function(s, d) {
    !s && t.config.theme && r(), _e.emit("config:unstyled:change", {
      newValue: s,
      oldValue: d
    });
  }, {
    immediate: !0,
    deep: !0
  });
  Be.push(o), Be.push(i), Be.push(a), Be.push(l);
}
var ka = {
  install: function(t, n) {
    var r = gi(ba, n);
    ya(t, r);
  }
}, an = {
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
    this.mounted = vr();
  },
  computed: {
    inline: function() {
      return this.disabled || this.appendTo === "self";
    }
  }
};
function Sa(e, t, n, r, o, i) {
  return i.inline ? E(e.$slots, "default", {
    key: 0
  }) : o.mounted ? (v(), U(Qn, {
    key: 1,
    to: n.appendTo
  }, [E(e.$slots, "default")], 8, ["to"])) : N("", !0);
}
an.render = Sa;
var Oe = {
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
function $a() {
  var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "pc", t = ko();
  return "".concat(e).concat(t.replace("v-", "").replaceAll("-", "_"));
}
var An = z.extend({
  name: "common"
});
function nt(e) {
  "@babel/helpers - typeof";
  return nt = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, nt(e);
}
function Oa(e) {
  return Ir(e) || _a(e) || Cr(e) || _r();
}
function _a(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function We(e, t) {
  return Ir(e) || Ca(e, t) || Cr(e, t) || _r();
}
function _r() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Cr(e, t) {
  if (e) {
    if (typeof e == "string") return Dt(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Dt(e, t) : void 0;
  }
}
function Dt(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function Ca(e, t) {
  var n = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (n != null) {
    var r, o, i, a, l = [], s = !0, d = !1;
    try {
      if (i = (n = n.call(e)).next, t === 0) {
        if (Object(n) !== n) return;
        s = !1;
      } else for (; !(s = (r = i.call(n)).done) && (l.push(r.value), l.length !== t); s = !0) ;
    } catch (c) {
      d = !0, o = c;
    } finally {
      try {
        if (!s && n.return != null && (a = n.return(), Object(a) !== a)) return;
      } finally {
        if (d) throw o;
      }
    }
    return l;
  }
}
function Ir(e) {
  if (Array.isArray(e)) return e;
}
function En(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(e);
    t && (r = r.filter(function(o) {
      return Object.getOwnPropertyDescriptor(e, o).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function T(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? En(Object(n), !0).forEach(function(r) {
      Ye(e, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : En(Object(n)).forEach(function(r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return e;
}
function Ye(e, t, n) {
  return (t = Ia(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Ia(e) {
  var t = Pa(e, "string");
  return nt(t) == "symbol" ? t : t + "";
}
function Pa(e, t) {
  if (nt(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (nt(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var Ce = {
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
        Y.off("theme:change", this._loadCoreStyles), t || (this._loadCoreStyles(), this._themeChangeListener(this._loadCoreStyles));
      }
    },
    dt: {
      immediate: !0,
      handler: function(t, n) {
        var r = this;
        Y.off("theme:change", this._themeScopedListener), t ? (this._loadScopedThemeStyles(t), this._themeScopedListener = function() {
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
    var t, n, r, o, i, a, l, s, d, c, u, p = (t = this.pt) === null || t === void 0 ? void 0 : t._usept, h = p ? (n = this.pt) === null || n === void 0 || (n = n.originalValue) === null || n === void 0 ? void 0 : n[this.$.type.name] : void 0, m = p ? (r = this.pt) === null || r === void 0 || (r = r.value) === null || r === void 0 ? void 0 : r[this.$.type.name] : this.pt;
    (o = m || h) === null || o === void 0 || (o = o.hooks) === null || o === void 0 || (i = o.onBeforeCreate) === null || i === void 0 || i.call(o);
    var y = (a = this.$primevueConfig) === null || a === void 0 || (a = a.pt) === null || a === void 0 ? void 0 : a._usept, b = y ? (l = this.$primevue) === null || l === void 0 || (l = l.config) === null || l === void 0 || (l = l.pt) === null || l === void 0 ? void 0 : l.originalValue : void 0, k = y ? (s = this.$primevue) === null || s === void 0 || (s = s.config) === null || s === void 0 || (s = s.pt) === null || s === void 0 ? void 0 : s.value : (d = this.$primevue) === null || d === void 0 || (d = d.config) === null || d === void 0 ? void 0 : d.pt;
    (c = k || b) === null || c === void 0 || (c = c[this.$.type.name]) === null || c === void 0 || (c = c.hooks) === null || c === void 0 || (u = c.onBeforeCreate) === null || u === void 0 || u.call(c), this.$attrSelector = $a(), this.uid = this.$attrs.id || this.$attrSelector.replace("pc", "pv_id_");
  },
  created: function() {
    this._hook("onCreated");
  },
  beforeMount: function() {
    var t;
    this.rootEl = _t(Ne(this.$el) ? this.$el : (t = this.$el) === null || t === void 0 ? void 0 : t.parentElement, "[".concat(this.$attrSelector, "]")), this.rootEl && (this.rootEl.$pc = T({
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
      for (var n = arguments.length, r = new Array(n > 1 ? n - 1 : 0), o = 1; o < n; o++)
        r[o - 1] = arguments[o];
      return Ot(t) ? t.apply(void 0, r) : $.apply(void 0, r);
    },
    _load: function() {
      Oe.isStyleNameLoaded("base") || (z.loadCSS(this.$styleOptions), this._loadGlobalStyles(), Oe.setLoadedStyleName("base")), this._loadThemeStyles();
    },
    _loadStyles: function() {
      this._load(), this._themeChangeListener(this._load);
    },
    _loadCoreStyles: function() {
      var t, n;
      !Oe.isStyleNameLoaded((t = this.$style) === null || t === void 0 ? void 0 : t.name) && (n = this.$style) !== null && n !== void 0 && n.name && (An.loadCSS(this.$styleOptions), this.$options.style && this.$style.loadCSS(this.$styleOptions), Oe.setLoadedStyleName(this.$style.name));
    },
    _loadGlobalStyles: function() {
      var t = this._useGlobalPT(this._getOptionValue, "global.css", this.$params);
      A(t) && z.load(t, T({
        name: "global"
      }, this.$styleOptions));
    },
    _loadThemeStyles: function() {
      var t, n;
      if (!(this.isUnstyled || this.$theme === "none")) {
        if (!F.isStyleNameLoaded("common")) {
          var r, o, i = ((r = this.$style) === null || r === void 0 || (o = r.getCommonTheme) === null || o === void 0 ? void 0 : o.call(r)) || {}, a = i.primitive, l = i.semantic, s = i.global, d = i.style;
          z.load(a?.css, T({
            name: "primitive-variables"
          }, this.$styleOptions)), z.load(l?.css, T({
            name: "semantic-variables"
          }, this.$styleOptions)), z.load(s?.css, T({
            name: "global-variables"
          }, this.$styleOptions)), z.loadStyle(T({
            name: "global-style"
          }, this.$styleOptions), d), F.setLoadedStyleName("common");
        }
        if (!F.isStyleNameLoaded((t = this.$style) === null || t === void 0 ? void 0 : t.name) && (n = this.$style) !== null && n !== void 0 && n.name) {
          var c, u, p, h, m = ((c = this.$style) === null || c === void 0 || (u = c.getComponentTheme) === null || u === void 0 ? void 0 : u.call(c)) || {}, y = m.css, b = m.style;
          (p = this.$style) === null || p === void 0 || p.load(y, T({
            name: "".concat(this.$style.name, "-variables")
          }, this.$styleOptions)), (h = this.$style) === null || h === void 0 || h.loadStyle(T({
            name: "".concat(this.$style.name, "-style")
          }, this.$styleOptions), b), F.setLoadedStyleName(this.$style.name);
        }
        if (!F.isStyleNameLoaded("layer-order")) {
          var k, _, S = (k = this.$style) === null || k === void 0 || (_ = k.getLayerOrderThemeCSS) === null || _ === void 0 ? void 0 : _.call(k);
          z.load(S, T({
            name: "layer-order",
            first: !0
          }, this.$styleOptions)), F.setLoadedStyleName("layer-order");
        }
      }
    },
    _loadScopedThemeStyles: function(t) {
      var n, r, o, i = ((n = this.$style) === null || n === void 0 || (r = n.getPresetTheme) === null || r === void 0 ? void 0 : r.call(n, t, "[".concat(this.$attrSelector, "]"))) || {}, a = i.css, l = (o = this.$style) === null || o === void 0 ? void 0 : o.load(a, T({
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
      Oe.clearLoadedStyleNames(), Y.on("theme:change", t);
    },
    _removeThemeListeners: function() {
      Y.off("theme:change", this._loadCoreStyles), Y.off("theme:change", this._load), Y.off("theme:change", this._themeScopedListener);
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
      return nn(t, n, r);
    },
    _getPTValue: function() {
      var t, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", o = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {}, i = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : !0, a = /./g.test(r) && !!o[r.split(".")[0]], l = this._getPropValue("ptOptions") || ((t = this.$primevueConfig) === null || t === void 0 ? void 0 : t.ptOptions) || {}, s = l.mergeSections, d = s === void 0 ? !0 : s, c = l.mergeProps, u = c === void 0 ? !1 : c, p = i ? a ? this._useGlobalPT(this._getPTClassValue, r, o) : this._useDefaultPT(this._getPTClassValue, r, o) : void 0, h = a ? void 0 : this._getPTSelf(n, this._getPTClassValue, r, T(T({}, o), {}, {
        global: p || {}
      })), m = this._getPTDatasets(r);
      return d || !d && h ? u ? this._mergeProps(u, p, h, m) : T(T(T({}, p), h), m) : T(T({}, h), m);
    },
    _getPTSelf: function() {
      for (var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length, r = new Array(n > 1 ? n - 1 : 0), o = 1; o < n; o++)
        r[o - 1] = arguments[o];
      return $(
        this._usePT.apply(this, [this._getPT(t, this.$name)].concat(r)),
        // Exp; <component :pt="{}"
        this._usePT.apply(this, [this.$_attrsPT].concat(r))
        // Exp; <component :pt:[passthrough_key]:[attribute]="{value}" or <component :pt:[passthrough_key]="() =>{value}"
      );
    },
    _getPTDatasets: function() {
      var t, n, r = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", o = "data-pc-", i = r === "root" && A((t = this.pt) === null || t === void 0 ? void 0 : t["data-pc-section"]);
      return r !== "transition" && T(T({}, r === "root" && T(T(Ye({}, "".concat(o, "name"), ge(i ? (n = this.pt) === null || n === void 0 ? void 0 : n["data-pc-section"] : this.$.type.name)), i && Ye({}, "".concat(o, "extend"), ge(this.$.type.name))), {}, Ye({}, "".concat(this.$attrSelector), ""))), {}, Ye({}, "".concat(o, "section"), ge(r)));
    },
    _getPTClassValue: function() {
      var t = this._getOptionValue.apply(this, arguments);
      return X(t) || ur(t) ? {
        class: t
      } : t;
    },
    _getPT: function(t) {
      var n = this, r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", o = arguments.length > 2 ? arguments[2] : void 0, i = function(l) {
        var s, d = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1, c = o ? o(l) : l, u = ge(r), p = ge(n.$name);
        return (s = d ? u !== p ? c?.[u] : void 0 : c?.[u]) !== null && s !== void 0 ? s : c;
      };
      return t != null && t.hasOwnProperty("_usept") ? {
        _usept: t._usept,
        originalValue: i(t.originalValue),
        value: i(t.value)
      } : i(t, !0);
    },
    _usePT: function(t, n, r, o) {
      var i = function(y) {
        return n(y, r, o);
      };
      if (t != null && t.hasOwnProperty("_usept")) {
        var a, l = t._usept || ((a = this.$primevueConfig) === null || a === void 0 ? void 0 : a.ptOptions) || {}, s = l.mergeSections, d = s === void 0 ? !0 : s, c = l.mergeProps, u = c === void 0 ? !1 : c, p = i(t.originalValue), h = i(t.value);
        return p === void 0 && h === void 0 ? void 0 : X(h) ? h : X(p) ? p : d || !d && h ? u ? this._mergeProps(u, p, h) : T(T({}, p), h) : h;
      }
      return i(t);
    },
    _useGlobalPT: function(t, n, r) {
      return this._usePT(this.globalPT, t, n, r);
    },
    _useDefaultPT: function(t, n, r) {
      return this._usePT(this.defaultPT, t, n, r);
    },
    ptm: function() {
      var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
      return this._getPTValue(this.pt, t, T(T({}, this.$params), n));
    },
    ptmi: function() {
      var t, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, o = $(this.$_attrsWithoutPT, this.ptm(n, r));
      return o?.hasOwnProperty("id") && ((t = o.id) !== null && t !== void 0 || (o.id = this.$id)), o;
    },
    ptmo: function() {
      var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", r = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
      return this._getPTValue(t, n, T({
        instance: this
      }, r), !1);
    },
    cx: function() {
      var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
      return this.isUnstyled ? void 0 : this._getOptionValue(this.$style.classes, t, T(T({}, this.$params), n));
    },
    sx: function() {
      var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0, r = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
      if (n) {
        var o = this._getOptionValue(this.$style.inlineStyles, t, T(T({}, this.$params), r)), i = this._getOptionValue(An.inlineStyles, t, T(T({}, this.$params), r));
        return [i, o];
      }
    }
  },
  computed: {
    globalPT: function() {
      var t, n = this;
      return this._getPT((t = this.$primevueConfig) === null || t === void 0 ? void 0 : t.pt, void 0, function(r) {
        return ne(r, {
          instance: n
        });
      });
    },
    defaultPT: function() {
      var t, n = this;
      return this._getPT((t = this.$primevueConfig) === null || t === void 0 ? void 0 : t.pt, void 0, function(r) {
        return n._getOptionValue(r, n.$name, T({}, n.$params)) || ne(r, T({}, n.$params));
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
        var o = We(r, 1), i = o[0];
        return n?.includes(i);
      }));
    },
    $theme: function() {
      var t;
      return (t = this.$primevueConfig) === null || t === void 0 ? void 0 : t.theme;
    },
    $style: function() {
      return T(T({
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
        var n = We(t, 1), r = n[0];
        return r?.startsWith("pt:");
      }).reduce(function(t, n) {
        var r = We(n, 2), o = r[0], i = r[1], a = o.split(":"), l = Oa(a), s = Dt(l).slice(1);
        return s?.reduce(function(d, c, u, p) {
          return !d[c] && (d[c] = u === p.length - 1 ? i : {}), d[c];
        }, t), t;
      }, {});
    },
    $_attrsWithoutPT: function() {
      return Object.entries(this.$attrs || {}).filter(function(t) {
        var n = We(t, 1), r = n[0];
        return !(r != null && r.startsWith("pt:"));
      }).reduce(function(t, n) {
        var r = We(n, 2), o = r[0], i = r[1];
        return t[o] = i, t;
      }, {});
    }
  }
}, Ta = `
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
`, La = z.extend({
  name: "baseicon",
  css: Ta
});
function rt(e) {
  "@babel/helpers - typeof";
  return rt = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, rt(e);
}
function zn(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(e);
    t && (r = r.filter(function(o) {
      return Object.getOwnPropertyDescriptor(e, o).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function Vn(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? zn(Object(n), !0).forEach(function(r) {
      Aa(e, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : zn(Object(n)).forEach(function(r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return e;
}
function Aa(e, t, n) {
  return (t = Ea(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Ea(e) {
  var t = za(e, "string");
  return rt(t) == "symbol" ? t : t + "";
}
function za(e, t) {
  if (rt(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (rt(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var Ke = {
  name: "BaseIcon",
  extends: Ce,
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
  style: La,
  provide: function() {
    return {
      $pcIcon: this,
      $parentInstance: this
    };
  },
  methods: {
    pti: function() {
      var t = Fe(this.label);
      return Vn(Vn({}, !this.isUnstyled && {
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
function ot(e) {
  "@babel/helpers - typeof";
  return ot = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, ot(e);
}
function jn(e, t) {
  return Na(e) || Fa(e, t) || ja(e, t) || Va();
}
function Va() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function ja(e, t) {
  if (e) {
    if (typeof e == "string") return Fn(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Fn(e, t) : void 0;
  }
}
function Fn(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function Fa(e, t) {
  var n = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (n != null) {
    var r, o, i, a, l = [], s = !0, d = !1;
    try {
      if (i = (n = n.call(e)).next, t !== 0) for (; !(s = (r = i.call(n)).done) && (l.push(r.value), l.length !== t); s = !0) ;
    } catch (c) {
      d = !0, o = c;
    } finally {
      try {
        if (!s && n.return != null && (a = n.return(), Object(a) !== a)) return;
      } finally {
        if (d) throw o;
      }
    }
    return l;
  }
}
function Na(e) {
  if (Array.isArray(e)) return e;
}
function Nn(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(e);
    t && (r = r.filter(function(o) {
      return Object.getOwnPropertyDescriptor(e, o).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function L(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? Nn(Object(n), !0).forEach(function(r) {
      Bt(e, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Nn(Object(n)).forEach(function(r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return e;
}
function Bt(e, t, n) {
  return (t = Ma(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Ma(e) {
  var t = Ra(e, "string");
  return ot(t) == "symbol" ? t : t + "";
}
function Ra(e, t) {
  if (ot(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (ot(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var P = {
  _getMeta: function() {
    return [be(arguments.length <= 0 ? void 0 : arguments[0]) || arguments.length <= 0 ? void 0 : arguments[0], ne(be(arguments.length <= 0 ? void 0 : arguments[0]) ? arguments.length <= 0 ? void 0 : arguments[0] : arguments.length <= 1 ? void 0 : arguments[1])];
  },
  _getConfig: function(t, n) {
    var r, o, i;
    return (r = (t == null || (o = t.instance) === null || o === void 0 ? void 0 : o.$primevue) || (n == null || (i = n.ctx) === null || i === void 0 || (i = i.appContext) === null || i === void 0 || (i = i.config) === null || i === void 0 || (i = i.globalProperties) === null || i === void 0 ? void 0 : i.$primevue)) === null || r === void 0 ? void 0 : r.config;
  },
  _getOptionValue: nn,
  _getPTValue: function() {
    var t, n, r = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, o = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, i = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : "", a = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : {}, l = arguments.length > 4 && arguments[4] !== void 0 ? arguments[4] : !0, s = function() {
      var _ = P._getOptionValue.apply(P, arguments);
      return X(_) || ur(_) ? {
        class: _
      } : _;
    }, d = ((t = r.binding) === null || t === void 0 || (t = t.value) === null || t === void 0 ? void 0 : t.ptOptions) || ((n = r.$primevueConfig) === null || n === void 0 ? void 0 : n.ptOptions) || {}, c = d.mergeSections, u = c === void 0 ? !0 : c, p = d.mergeProps, h = p === void 0 ? !1 : p, m = l ? P._useDefaultPT(r, r.defaultPT(), s, i, a) : void 0, y = P._usePT(r, P._getPT(o, r.$name), s, i, L(L({}, a), {}, {
      global: m || {}
    })), b = P._getPTDatasets(r, i);
    return u || !u && y ? h ? P._mergeProps(r, h, m, y, b) : L(L(L({}, m), y), b) : L(L({}, y), b);
  },
  _getPTDatasets: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", r = "data-pc-";
    return L(L({}, n === "root" && Bt({}, "".concat(r, "name"), ge(t.$name))), {}, Bt({}, "".concat(r, "section"), ge(n)));
  },
  _getPT: function(t) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", r = arguments.length > 2 ? arguments[2] : void 0, o = function(a) {
      var l, s = r ? r(a) : a, d = ge(n);
      return (l = s?.[d]) !== null && l !== void 0 ? l : s;
    };
    return t && Object.hasOwn(t, "_usept") ? {
      _usept: t._usept,
      originalValue: o(t.originalValue),
      value: o(t.value)
    } : o(t);
  },
  _usePT: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 ? arguments[1] : void 0, r = arguments.length > 2 ? arguments[2] : void 0, o = arguments.length > 3 ? arguments[3] : void 0, i = arguments.length > 4 ? arguments[4] : void 0, a = function(b) {
      return r(b, o, i);
    };
    if (n && Object.hasOwn(n, "_usept")) {
      var l, s = n._usept || ((l = t.$primevueConfig) === null || l === void 0 ? void 0 : l.ptOptions) || {}, d = s.mergeSections, c = d === void 0 ? !0 : d, u = s.mergeProps, p = u === void 0 ? !1 : u, h = a(n.originalValue), m = a(n.value);
      return h === void 0 && m === void 0 ? void 0 : X(m) ? m : X(h) ? h : c || !c && m ? p ? P._mergeProps(t, p, h, m) : L(L({}, h), m) : m;
    }
    return a(n);
  },
  _useDefaultPT: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, r = arguments.length > 2 ? arguments[2] : void 0, o = arguments.length > 3 ? arguments[3] : void 0, i = arguments.length > 4 ? arguments[4] : void 0;
    return P._usePT(t, n, r, o, i);
  },
  _loadStyles: function() {
    var t, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, r = arguments.length > 1 ? arguments[1] : void 0, o = arguments.length > 2 ? arguments[2] : void 0, i = P._getConfig(r, o), a = {
      nonce: i == null || (t = i.csp) === null || t === void 0 ? void 0 : t.nonce
    };
    P._loadCoreStyles(n, a), P._loadThemeStyles(n, a), P._loadScopedThemeStyles(n, a), P._removeThemeListeners(n), n.$loadStyles = function() {
      return P._loadThemeStyles(n, a);
    }, P._themeChangeListener(n.$loadStyles);
  },
  _loadCoreStyles: function() {
    var t, n, r = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, o = arguments.length > 1 ? arguments[1] : void 0;
    if (!Oe.isStyleNameLoaded((t = r.$style) === null || t === void 0 ? void 0 : t.name) && (n = r.$style) !== null && n !== void 0 && n.name) {
      var i;
      z.loadCSS(o), (i = r.$style) === null || i === void 0 || i.loadCSS(o), Oe.setLoadedStyleName(r.$style.name);
    }
  },
  _loadThemeStyles: function() {
    var t, n, r, o = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, i = arguments.length > 1 ? arguments[1] : void 0;
    if (!(o != null && o.isUnstyled() || (o == null || (t = o.theme) === null || t === void 0 ? void 0 : t.call(o)) === "none")) {
      if (!F.isStyleNameLoaded("common")) {
        var a, l, s = ((a = o.$style) === null || a === void 0 || (l = a.getCommonTheme) === null || l === void 0 ? void 0 : l.call(a)) || {}, d = s.primitive, c = s.semantic, u = s.global, p = s.style;
        z.load(d?.css, L({
          name: "primitive-variables"
        }, i)), z.load(c?.css, L({
          name: "semantic-variables"
        }, i)), z.load(u?.css, L({
          name: "global-variables"
        }, i)), z.loadStyle(L({
          name: "global-style"
        }, i), p), F.setLoadedStyleName("common");
      }
      if (!F.isStyleNameLoaded((n = o.$style) === null || n === void 0 ? void 0 : n.name) && (r = o.$style) !== null && r !== void 0 && r.name) {
        var h, m, y, b, k = ((h = o.$style) === null || h === void 0 || (m = h.getDirectiveTheme) === null || m === void 0 ? void 0 : m.call(h)) || {}, _ = k.css, S = k.style;
        (y = o.$style) === null || y === void 0 || y.load(_, L({
          name: "".concat(o.$style.name, "-variables")
        }, i)), (b = o.$style) === null || b === void 0 || b.loadStyle(L({
          name: "".concat(o.$style.name, "-style")
        }, i), S), F.setLoadedStyleName(o.$style.name);
      }
      if (!F.isStyleNameLoaded("layer-order")) {
        var f, g, C = (f = o.$style) === null || f === void 0 || (g = f.getLayerOrderThemeCSS) === null || g === void 0 ? void 0 : g.call(f);
        z.load(C, L({
          name: "layer-order",
          first: !0
        }, i)), F.setLoadedStyleName("layer-order");
      }
    }
  },
  _loadScopedThemeStyles: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 ? arguments[1] : void 0, r = t.preset();
    if (r && t.$attrSelector) {
      var o, i, a, l = ((o = t.$style) === null || o === void 0 || (i = o.getPresetTheme) === null || i === void 0 ? void 0 : i.call(o, r, "[".concat(t.$attrSelector, "]"))) || {}, s = l.css, d = (a = t.$style) === null || a === void 0 ? void 0 : a.load(s, L({
        name: "".concat(t.$attrSelector, "-").concat(t.$style.name)
      }, n));
      t.scopedStyleEl = d.el;
    }
  },
  _themeChangeListener: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : function() {
    };
    Oe.clearLoadedStyleNames(), Y.on("theme:change", t);
  },
  _removeThemeListeners: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    Y.off("theme:change", t.$loadStyles), t.$loadStyles = void 0;
  },
  _hook: function(t, n, r, o, i, a) {
    var l, s, d = "on".concat(bi(n)), c = P._getConfig(o, i), u = r?.$instance, p = P._usePT(u, P._getPT(o == null || (l = o.value) === null || l === void 0 ? void 0 : l.pt, t), P._getOptionValue, "hooks.".concat(d)), h = P._useDefaultPT(u, c == null || (s = c.pt) === null || s === void 0 || (s = s.directives) === null || s === void 0 ? void 0 : s[t], P._getOptionValue, "hooks.".concat(d)), m = {
      el: r,
      binding: o,
      vnode: i,
      prevVnode: a
    };
    p?.(u, m), h?.(u, m);
  },
  /* eslint-disable-next-line no-unused-vars */
  _mergeProps: function() {
    for (var t = arguments.length > 1 ? arguments[1] : void 0, n = arguments.length, r = new Array(n > 2 ? n - 2 : 0), o = 2; o < n; o++)
      r[o - 2] = arguments[o];
    return Ot(t) ? t.apply(void 0, r) : $.apply(void 0, r);
  },
  _extend: function(t) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, r = function(l, s, d, c, u) {
      var p, h, m, y;
      s._$instances = s._$instances || {};
      var b = P._getConfig(d, c), k = s._$instances[t] || {}, _ = Fe(k) ? L(L({}, n), n?.methods) : {};
      s._$instances[t] = L(L({}, k), {}, {
        /* new instance variables to pass in directive methods */
        $name: t,
        $host: s,
        $binding: d,
        $modifiers: d?.modifiers,
        $value: d?.value,
        $el: k.$el || s || void 0,
        $style: L({
          classes: void 0,
          inlineStyles: void 0,
          load: function() {
          },
          loadCSS: function() {
          },
          loadStyle: function() {
          }
        }, n?.style),
        $primevueConfig: b,
        $attrSelector: (p = s.$pd) === null || p === void 0 || (p = p[t]) === null || p === void 0 ? void 0 : p.attrSelector,
        /* computed instance variables */
        defaultPT: function() {
          return P._getPT(b?.pt, void 0, function(f) {
            var g;
            return f == null || (g = f.directives) === null || g === void 0 ? void 0 : g[t];
          });
        },
        isUnstyled: function() {
          var f, g;
          return ((f = s._$instances[t]) === null || f === void 0 || (f = f.$binding) === null || f === void 0 || (f = f.value) === null || f === void 0 ? void 0 : f.unstyled) !== void 0 ? (g = s._$instances[t]) === null || g === void 0 || (g = g.$binding) === null || g === void 0 || (g = g.value) === null || g === void 0 ? void 0 : g.unstyled : b?.unstyled;
        },
        theme: function() {
          var f;
          return (f = s._$instances[t]) === null || f === void 0 || (f = f.$primevueConfig) === null || f === void 0 ? void 0 : f.theme;
        },
        preset: function() {
          var f;
          return (f = s._$instances[t]) === null || f === void 0 || (f = f.$binding) === null || f === void 0 || (f = f.value) === null || f === void 0 ? void 0 : f.dt;
        },
        /* instance's methods */
        ptm: function() {
          var f, g = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", C = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
          return P._getPTValue(s._$instances[t], (f = s._$instances[t]) === null || f === void 0 || (f = f.$binding) === null || f === void 0 || (f = f.value) === null || f === void 0 ? void 0 : f.pt, g, L({}, C));
        },
        ptmo: function() {
          var f = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, g = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", C = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
          return P._getPTValue(s._$instances[t], f, g, C, !1);
        },
        cx: function() {
          var f, g, C = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", w = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
          return (f = s._$instances[t]) !== null && f !== void 0 && f.isUnstyled() ? void 0 : P._getOptionValue((g = s._$instances[t]) === null || g === void 0 || (g = g.$style) === null || g === void 0 ? void 0 : g.classes, C, L({}, w));
        },
        sx: function() {
          var f, g = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", C = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0, w = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
          return C ? P._getOptionValue((f = s._$instances[t]) === null || f === void 0 || (f = f.$style) === null || f === void 0 ? void 0 : f.inlineStyles, g, L({}, w)) : void 0;
        }
      }, _), s.$instance = s._$instances[t], (h = (m = s.$instance)[l]) === null || h === void 0 || h.call(m, s, d, c, u), s["$".concat(t)] = s.$instance, P._hook(t, l, s, d, c, u), s.$pd || (s.$pd = {}), s.$pd[t] = L(L({}, (y = s.$pd) === null || y === void 0 ? void 0 : y[t]), {}, {
        name: t,
        instance: s._$instances[t]
      });
    }, o = function(l) {
      var s, d, c, u = l._$instances[t], p = u?.watch, h = function(b) {
        var k, _ = b.newValue, S = b.oldValue;
        return p == null || (k = p.config) === null || k === void 0 ? void 0 : k.call(u, _, S);
      }, m = function(b) {
        var k, _ = b.newValue, S = b.oldValue;
        return p == null || (k = p["config.ripple"]) === null || k === void 0 ? void 0 : k.call(u, _, S);
      };
      u.$watchersCallback = {
        config: h,
        "config.ripple": m
      }, p == null || (s = p.config) === null || s === void 0 || s.call(u, u?.$primevueConfig), _e.on("config:change", h), p == null || (d = p["config.ripple"]) === null || d === void 0 || d.call(u, u == null || (c = u.$primevueConfig) === null || c === void 0 ? void 0 : c.ripple), _e.on("config:ripple:change", m);
    }, i = function(l) {
      var s = l._$instances[t].$watchersCallback;
      s && (_e.off("config:change", s.config), _e.off("config:ripple:change", s["config.ripple"]), l._$instances[t].$watchersCallback = void 0);
    };
    return {
      created: function(l, s, d, c) {
        l.$pd || (l.$pd = {}), l.$pd[t] = {
          name: t,
          attrSelector: Ni("pd")
        }, r("created", l, s, d, c);
      },
      beforeMount: function(l, s, d, c) {
        var u;
        P._loadStyles((u = l.$pd[t]) === null || u === void 0 ? void 0 : u.instance, s, d), r("beforeMount", l, s, d, c), o(l);
      },
      mounted: function(l, s, d, c) {
        var u;
        P._loadStyles((u = l.$pd[t]) === null || u === void 0 ? void 0 : u.instance, s, d), r("mounted", l, s, d, c);
      },
      beforeUpdate: function(l, s, d, c) {
        r("beforeUpdate", l, s, d, c);
      },
      updated: function(l, s, d, c) {
        var u;
        P._loadStyles((u = l.$pd[t]) === null || u === void 0 ? void 0 : u.instance, s, d), r("updated", l, s, d, c);
      },
      beforeUnmount: function(l, s, d, c) {
        var u;
        i(l), P._removeThemeListeners((u = l.$pd[t]) === null || u === void 0 ? void 0 : u.instance), r("beforeUnmount", l, s, d, c);
      },
      unmounted: function(l, s, d, c) {
        var u;
        (u = l.$pd[t]) === null || u === void 0 || (u = u.instance) === null || u === void 0 || (u = u.scopedStyleEl) === null || u === void 0 || (u = u.value) === null || u === void 0 || u.remove(), r("unmounted", l, s, d, c);
      }
    };
  },
  extend: function() {
    var t = P._getMeta.apply(P, arguments), n = jn(t, 2), r = n[0], o = n[1];
    return L({
      extend: function() {
        var a = P._getMeta.apply(P, arguments), l = jn(a, 2), s = l[0], d = l[1];
        return P.extend(s, L(L(L({}, o), o?.methods), d));
      }
    }, P._extend(r, o));
  }
}, Da = `
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
`, Ba = {
  root: "p-ink"
}, Ha = z.extend({
  name: "ripple-directive",
  style: Da,
  classes: Ba
}), Ua = P.extend({
  style: Ha
});
function it(e) {
  "@babel/helpers - typeof";
  return it = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, it(e);
}
function Ka(e) {
  return Ya(e) || qa(e) || Ga(e) || Wa();
}
function Wa() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Ga(e, t) {
  if (e) {
    if (typeof e == "string") return Ht(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Ht(e, t) : void 0;
  }
}
function qa(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function Ya(e) {
  if (Array.isArray(e)) return Ht(e);
}
function Ht(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function Mn(e, t, n) {
  return (t = Ja(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Ja(e) {
  var t = Za(e, "string");
  return it(t) == "symbol" ? t : t + "";
}
function Za(e, t) {
  if (it(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (it(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var Pr = Ua.extend("ripple", {
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
      n || (n = Ci("span", Mn(Mn({
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
      var n = this, r = t.currentTarget, o = this.getInk(r);
      if (!(!o || getComputedStyle(o, null).display === "none")) {
        if (!this.isUnstyled() && Ze(o, "p-ink-active"), o.setAttribute("data-p-ink-active", "false"), !Ae(o) && !Ee(o)) {
          var i = Math.max(mr(r), Ei(r));
          o.style.height = i + "px", o.style.width = i + "px";
        }
        var a = Ai(r), l = t.pageX - a.left + document.body.scrollTop - Ee(o) / 2, s = t.pageY - a.top + document.body.scrollLeft - Ae(o) / 2;
        o.style.top = s + "px", o.style.left = l + "px", !this.isUnstyled() && jt(o, "p-ink-active"), o.setAttribute("data-p-ink-active", "true"), this.timeout = setTimeout(function() {
          o && (!n.isUnstyled() && Ze(o, "p-ink-active"), o.setAttribute("data-p-ink-active", "false"));
        }, 401);
      }
    },
    onAnimationEnd: function(t) {
      this.timeout && clearTimeout(this.timeout), !this.isUnstyled() && Ze(t.currentTarget, "p-ink-active"), t.currentTarget.setAttribute("data-p-ink-active", "false");
    },
    getInk: function(t) {
      return t && t.children ? Ka(t.children).find(function(n) {
        return Pi(n, "data-pc-name") === "ripple";
      }) : void 0;
    }
  }
});
function at(e) {
  "@babel/helpers - typeof";
  return at = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, at(e);
}
function Qa(e, t) {
  if (!(e instanceof t)) throw new TypeError("Cannot call a class as a function");
}
function Xa(e, t) {
  for (var n = 0; n < t.length; n++) {
    var r = t[n];
    r.enumerable = r.enumerable || !1, r.configurable = !0, "value" in r && (r.writable = !0), Object.defineProperty(e, ts(r.key), r);
  }
}
function es(e, t, n) {
  return t && Xa(e.prototype, t), Object.defineProperty(e, "prototype", { writable: !1 }), e;
}
function ts(e) {
  var t = ns(e, "string");
  return at(t) == "symbol" ? t : t + "";
}
function ns(e, t) {
  if (at(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (at(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return String(e);
}
var rs = /* @__PURE__ */ (function() {
  function e(t) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : function() {
    };
    Qa(this, e), this.element = t, this.listener = n;
  }
  return es(e, [{
    key: "bindScrollListener",
    value: function() {
      this.scrollableParents = zi(this.element);
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
})(), os = rn();
const is = "data-wippy-overlay-layer";
function Tr() {
  return typeof window < "u" && typeof window.document < "u";
}
function Lr() {
  return Tr() && typeof HTMLElement < "u" && Object.hasOwn(HTMLElement.prototype, "popover");
}
function as() {
  return Lr() && typeof CSS < "u" && typeof CSS.supports == "function" && CSS.supports("anchor-name: --a") && CSS.supports("position-area", "bottom span-right") && CSS.supports("position-try-fallbacks", "flip-block") && CSS.supports("min-width", "min(anchor-size(width), 100vw)") && CSS.supports("max-width", "stretch");
}
const ss = /\bp-(?:select|multiselect|treeselect|cascadeselect)-overlay\b/;
let ls = 0;
const kt = /* @__PURE__ */ new WeakMap();
function Rn(e, t) {
  const n = e.style;
  n.setProperty("position", "fixed", "important"), n.setProperty("inset", "auto", "important"), n.setProperty("margin", "0", "important"), n.setProperty("position-anchor", t), n.setProperty("position-area", "bottom span-right"), n.setProperty("position-try-fallbacks", "flip-block, flip-inline, flip-block flip-inline"), n.setProperty("min-width", "min(anchor-size(width), 100vw)", "important"), n.setProperty("max-width", "stretch", "important");
}
function ds(e, t) {
  if (!ss.test(e.className))
    return;
  const n = e.style.cssText;
  Rn(e, t), e.getAttribute("popover") !== "manual" && e.setAttribute("popover", "manual");
  try {
    e.matches(":popover-open") || e.showPopover();
  } catch {
  }
  if (!e.matches(":popover-open")) {
    e.removeAttribute("popover"), e.style.cssText = n;
    return;
  }
  if (!kt.has(e)) {
    const r = new MutationObserver(() => {
      const o = e.style;
      (o.top !== "auto" || o.left !== "auto" || o.margin !== "0px" || o.getPropertyPriority("top") !== "important" || o.getPropertyPriority("left") !== "important" || o.getPropertyPriority("margin") !== "important" || o.getPropertyPriority("min-width") !== "important" || o.maxWidth !== "stretch" || o.getPropertyPriority("max-width") !== "important") && Rn(e, t);
    });
    r.observe(e, { attributes: !0, attributeFilter: ["style"] }), kt.set(e, r);
  }
}
function sn(e) {
  const t = kt.get(e);
  t && (t.disconnect(), kt.delete(e));
}
function cs(e) {
  const t = e && typeof e.getRootNode == "function" ? e.getRootNode() : null;
  return t instanceof ShadowRoot ? t : null;
}
function Ut(e) {
  e.style.top = "0px", e.style.left = "0px";
  const t = e.getBoundingClientRect();
  e.style.top = `${-window.scrollY - t.top}px`, e.style.left = `${-window.scrollX - t.left}px`;
}
const St = /* @__PURE__ */ new Set(), ln = /* @__PURE__ */ new WeakMap();
let Dn = !1, Kt = !1;
function us() {
  Kt = !1;
  for (const e of St) {
    if (!e.isConnected) {
      for (const t of Array.from(e.children))
        t instanceof HTMLElement && sn(t);
      St.delete(e), ln.get(e)?.disconnect();
      continue;
    }
    e.childElementCount > 0 && Ut(e);
  }
}
function Bn() {
  Kt || (Kt = !0, requestAnimationFrame(us));
}
function ps(e) {
  const t = document.createElement("div");
  t.setAttribute(is, "");
  const n = Lr();
  if (t.style.cssText = n ? "position:fixed;width:0 !important;height:0 !important;margin:0 !important;border:0 !important;padding:0 !important;background:transparent !important;color:inherit !important;overflow:visible !important;" : "position:fixed;top:0;left:0;width:0;height:0;", n && t.setAttribute("popover", "manual"), e.appendChild(t), n) {
    try {
      t.showPopover();
    } catch {
    }
    t.matches(":popover-open") || (t.removeAttribute("popover"), t.style.cssText = "position:fixed;top:0;left:0;width:0;height:0;");
  }
  Ut(t);
  const r = new MutationObserver((o) => {
    const i = t.__wippyAnchorName;
    for (const a of o) {
      if (i)
        for (const l of Array.from(a.addedNodes))
          l instanceof HTMLElement && ds(l, i);
      for (const l of Array.from(a.removedNodes))
        l instanceof HTMLElement && sn(l);
    }
    t.isConnected && t.childElementCount > 0 && Ut(t);
  });
  return r.observe(t, { childList: !0 }), ln.set(t, r), St.add(t), Dn || (Dn = !0, window.addEventListener("scroll", Bn, { capture: !0, passive: !0 }), window.addEventListener("resize", Bn, { passive: !0 })), t;
}
function Hn(e) {
  if (!(!e.hostRoot || e.layer) && (e.layer = ps(e.hostRoot), as())) {
    const t = e.$el ? e.$el.parentElement : null;
    t && (e.anchorName = `--wippy-a-${++ls}`, e.anchorTrigger = t, t.style.setProperty("anchor-name", e.anchorName), e.layer.__wippyAnchorName = e.anchorName);
  }
}
function Un(e) {
  if (e.anchorTrigger && (e.anchorTrigger.style.removeProperty("anchor-name"), e.anchorTrigger = null), e.anchorName = null, e.layer) {
    for (const t of Array.from(e.layer.children))
      t instanceof HTMLElement && sn(t);
    St.delete(e.layer), ln.get(e.layer)?.disconnect(), e.layer.remove(), e.layer = null;
  }
}
let Kn = !1;
function fs() {
  if (Kn)
    return;
  Kn = !0;
  const e = an;
  e.computed = e.computed || {}, e.computed.inline = function() {
    return !!this.disabled || this.appendTo === "self";
  }, e.computed.resolvedTarget = function() {
    return this.appendTo == null || this.appendTo === "body" ? this.hostRoot ? this.layer : document.body : this.appendTo;
  }, e.data = function() {
    return { mounted: !1, hostRoot: null, layer: null, anchorName: null, anchorTrigger: null };
  }, e.mounted = function() {
    Tr() && (this.hostRoot = cs(this.$el), this.mounted = !0, this.hostRoot && (this.inline || Hn(this), this.$watch("inline", (t) => {
      t ? Un(this) : Hn(this);
    })));
  }, e.render = function() {
    return this.inline ? E(this.$slots, "default", { key: 0 }) : this.mounted ? So(Qn, { key: 1, to: this.resolvedTarget || document.body }, [
      E(this.$slots, "default")
    ]) : N("", !0);
  }, e.unmounted = function() {
    Un(this);
  };
}
const cc = {
  install: (e) => {
    fs(), e.use(ka, { theme: "none" });
  }
};
var Ct = {
  name: "SpinnerIcon",
  extends: Ke
};
function hs(e) {
  return vs(e) || bs(e) || gs(e) || ms();
}
function ms() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function gs(e, t) {
  if (e) {
    if (typeof e == "string") return Wt(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Wt(e, t) : void 0;
  }
}
function bs(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function vs(e) {
  if (Array.isArray(e)) return Wt(e);
}
function Wt(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function ys(e, t, n, r, o, i) {
  return v(), O("svg", $({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), hs(t[0] || (t[0] = [I("path", {
    d: "M6.99701 14C5.85441 13.999 4.72939 13.7186 3.72012 13.1832C2.71084 12.6478 1.84795 11.8737 1.20673 10.9284C0.565504 9.98305 0.165424 8.89526 0.041387 7.75989C-0.0826496 6.62453 0.073125 5.47607 0.495122 4.4147C0.917119 3.35333 1.59252 2.4113 2.46241 1.67077C3.33229 0.930247 4.37024 0.413729 5.4857 0.166275C6.60117 -0.0811796 7.76026 -0.0520535 8.86188 0.251112C9.9635 0.554278 10.9742 1.12227 11.8057 1.90555C11.915 2.01493 11.9764 2.16319 11.9764 2.31778C11.9764 2.47236 11.915 2.62062 11.8057 2.73C11.7521 2.78503 11.688 2.82877 11.6171 2.85864C11.5463 2.8885 11.4702 2.90389 11.3933 2.90389C11.3165 2.90389 11.2404 2.8885 11.1695 2.85864C11.0987 2.82877 11.0346 2.78503 10.9809 2.73C9.9998 1.81273 8.73246 1.26138 7.39226 1.16876C6.05206 1.07615 4.72086 1.44794 3.62279 2.22152C2.52471 2.99511 1.72683 4.12325 1.36345 5.41602C1.00008 6.70879 1.09342 8.08723 1.62775 9.31926C2.16209 10.5513 3.10478 11.5617 4.29713 12.1803C5.48947 12.7989 6.85865 12.988 8.17414 12.7157C9.48963 12.4435 10.6711 11.7264 11.5196 10.6854C12.3681 9.64432 12.8319 8.34282 12.8328 7C12.8328 6.84529 12.8943 6.69692 13.0038 6.58752C13.1132 6.47812 13.2616 6.41667 13.4164 6.41667C13.5712 6.41667 13.7196 6.47812 13.8291 6.58752C13.9385 6.69692 14 6.84529 14 7C14 8.85651 13.2622 10.637 11.9489 11.9497C10.6356 13.2625 8.85432 14 6.99701 14Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
Ct.render = ys;
var xs = `
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
`, ws = {
  root: function(t) {
    var n = t.props, r = t.instance;
    return ["p-badge p-component", {
      "p-badge-circle": A(n.value) && String(n.value).length === 1,
      "p-badge-dot": Fe(n.value) && !r.$slots.default,
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
}, ks = z.extend({
  name: "badge",
  style: xs,
  classes: ws
}), Ss = {
  name: "BaseBadge",
  extends: Ce,
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
  style: ks,
  provide: function() {
    return {
      $pcBadge: this,
      $parentInstance: this
    };
  }
};
function st(e) {
  "@babel/helpers - typeof";
  return st = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, st(e);
}
function Wn(e, t, n) {
  return (t = $s(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function $s(e) {
  var t = Os(e, "string");
  return st(t) == "symbol" ? t : t + "";
}
function Os(e, t) {
  if (st(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (st(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var Ar = {
  name: "Badge",
  extends: Ss,
  inheritAttrs: !1,
  computed: {
    dataP: function() {
      return ue(Wn(Wn({
        circle: this.value != null && String(this.value).length === 1,
        empty: this.value == null && !this.$slots.default
      }, this.severity, this.severity), this.size, this.size));
    }
  }
}, _s = ["data-p"];
function Cs(e, t, n, r, o, i) {
  return v(), O("span", $({
    class: e.cx("root"),
    "data-p": i.dataP
  }, e.ptmi("root")), [E(e.$slots, "default", {}, function() {
    return [ze(W(e.value), 1)];
  })], 16, _s);
}
Ar.render = Cs;
var Is = `
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
function lt(e) {
  "@babel/helpers - typeof";
  return lt = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, lt(e);
}
function he(e, t, n) {
  return (t = Ps(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Ps(e) {
  var t = Ts(e, "string");
  return lt(t) == "symbol" ? t : t + "";
}
function Ts(e, t) {
  if (lt(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (lt(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var Ls = {
  root: function(t) {
    var n = t.instance, r = t.props;
    return ["p-button p-component", he(he(he(he(he(he(he(he(he({
      "p-button-icon-only": n.hasIcon && !r.label && !r.badge,
      "p-button-vertical": (r.iconPos === "top" || r.iconPos === "bottom") && r.label,
      "p-button-loading": r.loading,
      "p-button-link": r.link || r.variant === "link"
    }, "p-button-".concat(r.severity), r.severity), "p-button-raised", r.raised), "p-button-rounded", r.rounded), "p-button-text", r.text || r.variant === "text"), "p-button-outlined", r.outlined || r.variant === "outlined"), "p-button-sm", r.size === "small"), "p-button-lg", r.size === "large"), "p-button-plain", r.plain), "p-button-fluid", n.hasFluid)];
  },
  loadingIcon: "p-button-loading-icon",
  icon: function(t) {
    var n = t.props;
    return ["p-button-icon", he({}, "p-button-icon-".concat(n.iconPos), n.label)];
  },
  label: "p-button-label"
}, As = z.extend({
  name: "button",
  style: Is,
  classes: Ls
}), Es = {
  name: "BaseButton",
  extends: Ce,
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
  style: As,
  provide: function() {
    return {
      $pcButton: this,
      $parentInstance: this
    };
  }
};
function dt(e) {
  "@babel/helpers - typeof";
  return dt = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, dt(e);
}
function Q(e, t, n) {
  return (t = zs(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function zs(e) {
  var t = Vs(e, "string");
  return dt(t) == "symbol" ? t : t + "";
}
function Vs(e, t) {
  if (dt(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (dt(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var Er = {
  name: "Button",
  extends: Es,
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
      return $(this.asAttrs, this.a11yAttrs, this.getPTOptions("root"));
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
      return Fe(this.fluid) ? !!this.$pcFluid : this.fluid;
    },
    dataP: function() {
      return ue(Q(Q(Q(Q(Q(Q(Q(Q(Q(Q({}, this.size, this.size), "icon-only", this.hasIcon && !this.label && !this.badge), "loading", this.loading), "fluid", this.hasFluid), "rounded", this.rounded), "raised", this.raised), "outlined", this.outlined || this.variant === "outlined"), "text", this.text || this.variant === "text"), "link", this.link || this.variant === "link"), "vertical", (this.iconPos === "top" || this.iconPos === "bottom") && this.label));
    },
    dataIconP: function() {
      return ue(Q(Q({}, this.iconPos, this.iconPos), this.size, this.size));
    },
    dataLabelP: function() {
      return ue(Q(Q({}, this.size, this.size), "icon-only", this.hasIcon && !this.label && !this.badge));
    }
  },
  components: {
    SpinnerIcon: Ct,
    Badge: Ar
  },
  directives: {
    ripple: Pr
  }
}, js = ["data-p"], Fs = ["data-p"];
function Ns(e, t, n, r, o, i) {
  var a = ae("SpinnerIcon"), l = ae("Badge"), s = Xn("ripple");
  return e.asChild ? E(e.$slots, "default", {
    key: 1,
    class: ce(e.cx("root")),
    a11yAttrs: i.a11yAttrs
  }) : tn((v(), U(Et(e.as), $({
    key: 0,
    class: e.cx("root"),
    "data-p": i.dataP
  }, i.attrs), {
    default: q(function() {
      return [E(e.$slots, "default", {}, function() {
        return [e.loading ? E(e.$slots, "loadingicon", $({
          key: 0,
          class: [e.cx("loadingIcon"), e.cx("icon")]
        }, e.ptm("loadingIcon")), function() {
          return [e.loadingIcon ? (v(), O("span", $({
            key: 0,
            class: [e.cx("loadingIcon"), e.cx("icon"), e.loadingIcon]
          }, e.ptm("loadingIcon")), null, 16)) : (v(), U(a, $({
            key: 1,
            class: [e.cx("loadingIcon"), e.cx("icon")],
            spin: ""
          }, e.ptm("loadingIcon")), null, 16, ["class"]))];
        }) : E(e.$slots, "icon", $({
          key: 1,
          class: [e.cx("icon")]
        }, e.ptm("icon")), function() {
          return [e.icon ? (v(), O("span", $({
            key: 0,
            class: [e.cx("icon"), e.icon, e.iconClass],
            "data-p": i.dataIconP
          }, e.ptm("icon")), null, 16, js)) : N("", !0)];
        }), e.label ? (v(), O("span", $({
          key: 2,
          class: e.cx("label")
        }, e.ptm("label"), {
          "data-p": i.dataLabelP
        }), W(e.label), 17, Fs)) : N("", !0), e.badge ? (v(), U(l, {
          key: 3,
          value: e.badge,
          class: ce(e.badgeClass),
          severity: e.badgeSeverity,
          unstyled: e.unstyled,
          pt: e.ptm("pcBadge")
        }, null, 8, ["value", "class", "severity", "unstyled", "pt"])) : N("", !0)];
      })];
    }),
    _: 3
  }, 16, ["class", "data-p"])), [[s]]);
}
Er.render = Ns;
const At = /* @__PURE__ */ ve({
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
    const n = e, r = t, o = me(
      () => n.variant === "danger" ? "danger" : n.variant === "primary" ? void 0 : "secondary"
    );
    return (i, a) => (v(), U(j(Er), {
      type: e.type,
      severity: o.value,
      outlined: e.variant === "ghost",
      loading: e.loading,
      disabled: e.disabled || e.loading,
      size: e.small ? "small" : void 0,
      onClick: a[0] || (a[0] = (l) => r("click"))
    }, {
      default: q(() => [
        e.icon && !e.loading ? (v(), U(j(Ue), {
          key: 0,
          icon: e.icon,
          "aria-hidden": "true"
        }, null, 8, ["icon"])) : N("", !0),
        E(i.$slots, "default")
      ]),
      _: 3
    }, 8, ["type", "severity", "outlined", "loading", "disabled", "size"]));
  }
});
var zr = {
  name: "BlankIcon",
  extends: Ke
};
function Ms(e) {
  return Hs(e) || Bs(e) || Ds(e) || Rs();
}
function Rs() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Ds(e, t) {
  if (e) {
    if (typeof e == "string") return Gt(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Gt(e, t) : void 0;
  }
}
function Bs(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function Hs(e) {
  if (Array.isArray(e)) return Gt(e);
}
function Gt(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function Us(e, t, n, r, o, i) {
  return v(), O("svg", $({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), Ms(t[0] || (t[0] = [I("rect", {
    width: "1",
    height: "1",
    fill: "currentColor",
    "fill-opacity": "0"
  }, null, -1)])), 16);
}
zr.render = Us;
var Vr = {
  name: "CheckIcon",
  extends: Ke
};
function Ks(e) {
  return Ys(e) || qs(e) || Gs(e) || Ws();
}
function Ws() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Gs(e, t) {
  if (e) {
    if (typeof e == "string") return qt(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? qt(e, t) : void 0;
  }
}
function qs(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function Ys(e) {
  if (Array.isArray(e)) return qt(e);
}
function qt(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function Js(e, t, n, r, o, i) {
  return v(), O("svg", $({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), Ks(t[0] || (t[0] = [I("path", {
    d: "M4.86199 11.5948C4.78717 11.5923 4.71366 11.5745 4.64596 11.5426C4.57826 11.5107 4.51779 11.4652 4.46827 11.4091L0.753985 7.69483C0.683167 7.64891 0.623706 7.58751 0.580092 7.51525C0.536478 7.44299 0.509851 7.36177 0.502221 7.27771C0.49459 7.19366 0.506156 7.10897 0.536046 7.03004C0.565935 6.95111 0.613367 6.88 0.674759 6.82208C0.736151 6.76416 0.8099 6.72095 0.890436 6.69571C0.970973 6.67046 1.05619 6.66385 1.13966 6.67635C1.22313 6.68886 1.30266 6.72017 1.37226 6.76792C1.44186 6.81567 1.4997 6.8786 1.54141 6.95197L4.86199 10.2503L12.6397 2.49483C12.7444 2.42694 12.8689 2.39617 12.9932 2.40745C13.1174 2.41873 13.2343 2.47141 13.3251 2.55705C13.4159 2.64268 13.4753 2.75632 13.4938 2.87973C13.5123 3.00315 13.4888 3.1292 13.4271 3.23768L5.2557 11.4091C5.20618 11.4652 5.14571 11.5107 5.07801 11.5426C5.01031 11.5745 4.9368 11.5923 4.86199 11.5948Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
Vr.render = Js;
var jr = {
  name: "ChevronDownIcon",
  extends: Ke
};
function Zs(e) {
  return tl(e) || el(e) || Xs(e) || Qs();
}
function Qs() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Xs(e, t) {
  if (e) {
    if (typeof e == "string") return Yt(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Yt(e, t) : void 0;
  }
}
function el(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function tl(e) {
  if (Array.isArray(e)) return Yt(e);
}
function Yt(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function nl(e, t, n, r, o, i) {
  return v(), O("svg", $({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), Zs(t[0] || (t[0] = [I("path", {
    d: "M7.01744 10.398C6.91269 10.3985 6.8089 10.378 6.71215 10.3379C6.61541 10.2977 6.52766 10.2386 6.45405 10.1641L1.13907 4.84913C1.03306 4.69404 0.985221 4.5065 1.00399 4.31958C1.02276 4.13266 1.10693 3.95838 1.24166 3.82747C1.37639 3.69655 1.55301 3.61742 1.74039 3.60402C1.92777 3.59062 2.11386 3.64382 2.26584 3.75424L7.01744 8.47394L11.769 3.75424C11.9189 3.65709 12.097 3.61306 12.2748 3.62921C12.4527 3.64535 12.6199 3.72073 12.7498 3.84328C12.8797 3.96582 12.9647 4.12842 12.9912 4.30502C13.0177 4.48162 12.9841 4.662 12.8958 4.81724L7.58083 10.1322C7.50996 10.2125 7.42344 10.2775 7.32656 10.3232C7.22968 10.3689 7.12449 10.3944 7.01744 10.398Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
jr.render = nl;
var Fr = {
  name: "SearchIcon",
  extends: Ke
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
    if (typeof e == "string") return Jt(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Jt(e, t) : void 0;
  }
}
function al(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function sl(e) {
  if (Array.isArray(e)) return Jt(e);
}
function Jt(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function ll(e, t, n, r, o, i) {
  return v(), O("svg", $({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), rl(t[0] || (t[0] = [I("path", {
    "fill-rule": "evenodd",
    "clip-rule": "evenodd",
    d: "M2.67602 11.0265C3.6661 11.688 4.83011 12.0411 6.02086 12.0411C6.81149 12.0411 7.59438 11.8854 8.32483 11.5828C8.87005 11.357 9.37808 11.0526 9.83317 10.6803L12.9769 13.8241C13.0323 13.8801 13.0983 13.9245 13.171 13.9548C13.2438 13.985 13.3219 14.0003 13.4007 14C13.4795 14.0003 13.5575 13.985 13.6303 13.9548C13.7031 13.9245 13.7691 13.8801 13.8244 13.8241C13.9367 13.7116 13.9998 13.5592 13.9998 13.4003C13.9998 13.2414 13.9367 13.089 13.8244 12.9765L10.6807 9.8328C11.053 9.37773 11.3573 8.86972 11.5831 8.32452C11.8857 7.59408 12.0414 6.81119 12.0414 6.02056C12.0414 4.8298 11.6883 3.66579 11.0268 2.67572C10.3652 1.68564 9.42494 0.913972 8.32483 0.45829C7.22472 0.00260857 6.01418 -0.116618 4.84631 0.115686C3.67844 0.34799 2.60568 0.921393 1.76369 1.76338C0.921698 2.60537 0.348296 3.67813 0.115991 4.84601C-0.116313 6.01388 0.00291375 7.22441 0.458595 8.32452C0.914277 9.42464 1.68595 10.3649 2.67602 11.0265ZM3.35565 2.0158C4.14456 1.48867 5.07206 1.20731 6.02086 1.20731C7.29317 1.20731 8.51338 1.71274 9.41304 2.6124C10.3127 3.51206 10.8181 4.73226 10.8181 6.00457C10.8181 6.95337 10.5368 7.88088 10.0096 8.66978C9.48251 9.45868 8.73328 10.0736 7.85669 10.4367C6.98011 10.7997 6.01554 10.8947 5.08496 10.7096C4.15439 10.5245 3.2996 10.0676 2.62869 9.39674C1.95778 8.72583 1.50089 7.87104 1.31579 6.94046C1.13068 6.00989 1.22568 5.04532 1.58878 4.16874C1.95187 3.29215 2.56675 2.54292 3.35565 2.0158Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
Fr.render = ll;
var Nr = {
  name: "TimesIcon",
  extends: Ke
};
function dl(e) {
  return fl(e) || pl(e) || ul(e) || cl();
}
function cl() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function ul(e, t) {
  if (e) {
    if (typeof e == "string") return Zt(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Zt(e, t) : void 0;
  }
}
function pl(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function fl(e) {
  if (Array.isArray(e)) return Zt(e);
}
function Zt(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function hl(e, t, n, r, o, i) {
  return v(), O("svg", $({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), dl(t[0] || (t[0] = [I("path", {
    d: "M8.01186 7.00933L12.27 2.75116C12.341 2.68501 12.398 2.60524 12.4375 2.51661C12.4769 2.42798 12.4982 2.3323 12.4999 2.23529C12.5016 2.13827 12.4838 2.0419 12.4474 1.95194C12.4111 1.86197 12.357 1.78024 12.2884 1.71163C12.2198 1.64302 12.138 1.58893 12.0481 1.55259C11.9581 1.51625 11.8617 1.4984 11.7647 1.50011C11.6677 1.50182 11.572 1.52306 11.4834 1.56255C11.3948 1.60204 11.315 1.65898 11.2488 1.72997L6.99067 5.98814L2.7325 1.72997C2.59553 1.60234 2.41437 1.53286 2.22718 1.53616C2.03999 1.53946 1.8614 1.61529 1.72901 1.74767C1.59663 1.88006 1.5208 2.05865 1.5175 2.24584C1.5142 2.43303 1.58368 2.61419 1.71131 2.75116L5.96948 7.00933L1.71131 11.2675C1.576 11.403 1.5 11.5866 1.5 11.7781C1.5 11.9696 1.576 12.1532 1.71131 12.2887C1.84679 12.424 2.03043 12.5 2.2219 12.5C2.41338 12.5 2.59702 12.424 2.7325 12.2887L6.99067 8.03052L11.2488 12.2887C11.3843 12.424 11.568 12.5 11.7594 12.5C11.9509 12.5 12.1346 12.424 12.27 12.2887C12.4053 12.1532 12.4813 11.9696 12.4813 11.7781C12.4813 11.5866 12.4053 11.403 12.27 11.2675L8.01186 7.00933Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
Nr.render = hl;
var ml = `
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
`, gl = {
  root: "p-iconfield"
}, bl = z.extend({
  name: "iconfield",
  style: ml,
  classes: gl
}), vl = {
  name: "BaseIconField",
  extends: Ce,
  style: bl,
  provide: function() {
    return {
      $pcIconField: this,
      $parentInstance: this
    };
  }
}, Mr = {
  name: "IconField",
  extends: vl,
  inheritAttrs: !1
};
function yl(e, t, n, r, o, i) {
  return v(), O("div", $({
    class: e.cx("root")
  }, e.ptmi("root")), [E(e.$slots, "default")], 16);
}
Mr.render = yl;
var xl = {
  root: "p-inputicon"
}, wl = z.extend({
  name: "inputicon",
  classes: xl
}), kl = {
  name: "BaseInputIcon",
  extends: Ce,
  style: wl,
  props: {
    class: null
  },
  provide: function() {
    return {
      $pcInputIcon: this,
      $parentInstance: this
    };
  }
}, Rr = {
  name: "InputIcon",
  extends: kl,
  inheritAttrs: !1,
  computed: {
    containerClass: function() {
      return [this.cx("root"), this.class];
    }
  }
};
function Sl(e, t, n, r, o, i) {
  return v(), O("span", $({
    class: i.containerClass
  }, e.ptmi("root"), {
    "aria-hidden": "true"
  }), [E(e.$slots, "default")], 16);
}
Rr.render = Sl;
var Dr = {
  name: "BaseEditableHolder",
  extends: Ce,
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
      var r, o;
      this.controlled && (this.d_value = t, this.$emit("update:modelValue", t)), this.$emit("value-change", t), (r = (o = this.formField).onChange) === null || r === void 0 || r.call(o, {
        originalEvent: n,
        value: t
      });
    },
    // @todo move to @primeuix/utils
    findNonEmpty: function() {
      for (var t = arguments.length, n = new Array(t), r = 0; r < t; r++)
        n[r] = arguments[r];
      return n.find(A);
    }
  },
  computed: {
    $filled: function() {
      return A(this.d_value);
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
}, Br = {
  name: "BaseInput",
  extends: Dr,
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
}, $l = `
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
`, Ol = {
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
}, _l = z.extend({
  name: "inputtext",
  style: $l,
  classes: Ol
}), Cl = {
  name: "BaseInputText",
  extends: Br,
  style: _l,
  provide: function() {
    return {
      $pcInputText: this,
      $parentInstance: this
    };
  }
};
function ct(e) {
  "@babel/helpers - typeof";
  return ct = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, ct(e);
}
function Il(e, t, n) {
  return (t = Pl(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Pl(e) {
  var t = Tl(e, "string");
  return ct(t) == "symbol" ? t : t + "";
}
function Tl(e, t) {
  if (ct(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (ct(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var Hr = {
  name: "InputText",
  extends: Cl,
  inheritAttrs: !1,
  methods: {
    onInput: function(t) {
      this.writeValue(t.target.value, t);
    }
  },
  computed: {
    attrs: function() {
      return $(this.ptmi("root", {
        context: {
          filled: this.$filled,
          disabled: this.disabled
        }
      }), this.formField);
    },
    dataP: function() {
      return ue(Il({
        invalid: this.$invalid,
        fluid: this.$fluid,
        filled: this.$variant === "filled"
      }, this.size, this.size));
    }
  }
}, Ll = ["value", "name", "disabled", "aria-invalid", "data-p"];
function Al(e, t, n, r, o, i) {
  return v(), O("input", $({
    type: "text",
    class: e.cx("root"),
    value: e.d_value,
    name: e.name,
    disabled: e.disabled,
    "aria-invalid": e.$invalid || void 0,
    "data-p": i.dataP,
    onInput: t[0] || (t[0] = function() {
      return i.onInput && i.onInput.apply(i, arguments);
    })
  }, i.attrs), null, 16, Ll);
}
Hr.render = Al;
var El = `
    .p-virtualscroller-loader {
        background: dt('virtualscroller.loader.mask.background');
        color: dt('virtualscroller.loader.mask.color');
    }

    .p-virtualscroller-loading-icon {
        font-size: dt('virtualscroller.loader.icon.size');
        width: dt('virtualscroller.loader.icon.size');
        height: dt('virtualscroller.loader.icon.size');
    }
`, zl = `
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
`, Gn = z.extend({
  name: "virtualscroller",
  css: zl,
  style: El
}), Vl = {
  name: "BaseVirtualScroller",
  extends: Ce,
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
  style: Gn,
  provide: function() {
    return {
      $pcVirtualScroller: this,
      $parentInstance: this
    };
  },
  beforeMount: function() {
    var t;
    Gn.loadCSS({
      nonce: (t = this.$primevueConfig) === null || t === void 0 || (t = t.csp) === null || t === void 0 ? void 0 : t.nonce
    });
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
function qn(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(e);
    t && (r = r.filter(function(o) {
      return Object.getOwnPropertyDescriptor(e, o).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function Ge(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? qn(Object(n), !0).forEach(function(r) {
      Ur(e, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : qn(Object(n)).forEach(function(r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return e;
}
function Ur(e, t, n) {
  return (t = jl(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function jl(e) {
  var t = Fl(e, "string");
  return ut(t) == "symbol" ? t : t + "";
}
function Fl(e, t) {
  if (ut(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (ut(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var Kr = {
  name: "VirtualScroller",
  extends: Vl,
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
      xt(this.element) && (this.setContentEl(this.content), this.init(), this.calculateAutoSize(), this.defaultWidth = Ee(this.element), this.defaultHeight = Ae(this.element), this.defaultContentWidth = Ee(this.content), this.defaultContentHeight = Ae(this.content), this.initialized = !0), this.element && this.bindResizeListener();
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
      var n = this, r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "auto", o = this.isBoth(), i = this.isHorizontal(), a = o ? t.every(function(w) {
        return w > -1;
      }) : t > -1;
      if (a) {
        var l = this.first, s = this.element, d = s.scrollTop, c = d === void 0 ? 0 : d, u = s.scrollLeft, p = u === void 0 ? 0 : u, h = this.calculateNumItems(), m = h.numToleratedItems, y = this.getContentPosition(), b = this.itemSize, k = function() {
          var x = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0, V = arguments.length > 1 ? arguments[1] : void 0;
          return x <= V ? 0 : x;
        }, _ = function(x, V, H) {
          return x * V + H;
        }, S = function() {
          var x = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0, V = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0;
          return n.scrollTo({
            left: x,
            top: V,
            behavior: r
          });
        }, f = o ? {
          rows: 0,
          cols: 0
        } : 0, g = !1, C = !1;
        o ? (f = {
          rows: k(t[0], m[0]),
          cols: k(t[1], m[1])
        }, S(_(f.cols, b[1], y.left), _(f.rows, b[0], y.top)), C = this.lastScrollPos.top !== c || this.lastScrollPos.left !== p, g = f.rows !== l.rows || f.cols !== l.cols) : (f = k(t, m), i ? S(_(f, b, y.left), c) : S(p, _(f, b, y.top)), C = this.lastScrollPos !== (i ? p : c), g = f !== l), this.isRangeChanged = g, C && (this.first = f);
      }
    },
    scrollInView: function(t, n) {
      var r = this, o = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : "auto";
      if (n) {
        var i = this.isBoth(), a = this.isHorizontal(), l = i ? t.every(function(b) {
          return b > -1;
        }) : t > -1;
        if (l) {
          var s = this.getRenderedRange(), d = s.first, c = s.viewport, u = function() {
            var k = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0, _ = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0;
            return r.scrollTo({
              left: k,
              top: _,
              behavior: o
            });
          }, p = n === "to-start", h = n === "to-end";
          if (p) {
            if (i)
              c.first.rows - d.rows > t[0] ? u(c.first.cols * this.itemSize[1], (c.first.rows - 1) * this.itemSize[0]) : c.first.cols - d.cols > t[1] && u((c.first.cols - 1) * this.itemSize[1], c.first.rows * this.itemSize[0]);
            else if (c.first - d > t) {
              var m = (c.first - 1) * this.itemSize;
              a ? u(m, 0) : u(0, m);
            }
          } else if (h) {
            if (i)
              c.last.rows - d.rows <= t[0] + 1 ? u(c.first.cols * this.itemSize[1], (c.first.rows + 1) * this.itemSize[0]) : c.last.cols - d.cols <= t[1] + 1 && u((c.first.cols + 1) * this.itemSize[1], c.first.rows * this.itemSize[0]);
            else if (c.last - d <= t + 1) {
              var y = (c.first + 1) * this.itemSize;
              a ? u(y, 0) : u(0, y);
            }
          }
        }
      } else
        this.scrollToIndex(t, o);
    },
    getRenderedRange: function() {
      var t = function(u, p) {
        return Math.floor(u / (p || u));
      }, n = this.first, r = 0;
      if (this.element) {
        var o = this.isBoth(), i = this.isHorizontal(), a = this.element, l = a.scrollTop, s = a.scrollLeft;
        if (o)
          n = {
            rows: t(l, this.itemSize[0]),
            cols: t(s, this.itemSize[1])
          }, r = {
            rows: n.rows + this.numItemsInViewport.rows,
            cols: n.cols + this.numItemsInViewport.cols
          };
        else {
          var d = i ? s : l;
          n = t(d, this.itemSize), r = n + this.numItemsInViewport;
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
      var t = this.isBoth(), n = this.isHorizontal(), r = this.itemSize, o = this.getContentPosition(), i = this.element ? this.element.offsetWidth - o.left : 0, a = this.element ? this.element.offsetHeight - o.top : 0, l = function(p, h) {
        return Math.ceil(p / (h || p));
      }, s = function(p) {
        return Math.ceil(p / 2);
      }, d = t ? {
        rows: l(a, r[0]),
        cols: l(i, r[1])
      } : l(n ? i : a, r), c = this.d_numToleratedItems || (t ? [s(d.rows), s(d.cols)] : s(d));
      return {
        numItemsInViewport: d,
        numToleratedItems: c
      };
    },
    calculateOptions: function() {
      var t = this, n = this.isBoth(), r = this.first, o = this.calculateNumItems(), i = o.numItemsInViewport, a = o.numToleratedItems, l = function(c, u, p) {
        var h = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : !1;
        return t.getLast(c + u + (c < p ? 2 : 3) * p, h);
      }, s = n ? {
        rows: l(r.rows, i.rows, a[0]),
        cols: l(r.cols, i.cols, a[1], !0)
      } : l(r, i, a);
      this.last = s, this.numItemsInViewport = i, this.d_numToleratedItems = a, this.$emit("update:numToleratedItems", this.d_numToleratedItems), this.showLoader && (this.loaderArr = n ? Array.from({
        length: i.rows
      }).map(function() {
        return Array.from({
          length: i.cols
        });
      }) : Array.from({
        length: i
      })), this.lazy && Promise.resolve().then(function() {
        var d;
        t.lazyLoadState = {
          first: t.step ? n ? {
            rows: 0,
            cols: r.cols
          } : 0 : r,
          last: Math.min(t.step ? t.step : s, ((d = t.items) === null || d === void 0 ? void 0 : d.length) || 0)
        }, t.$emit("lazy-load", t.lazyLoadState);
      });
    },
    calculateAutoSize: function() {
      var t = this;
      this.autoSize && !this.d_loading && Promise.resolve().then(function() {
        if (t.content) {
          var n = t.isBoth(), r = t.isHorizontal(), o = t.isVertical();
          t.content.style.minHeight = t.content.style.minWidth = "auto", t.content.style.position = "relative", t.element.style.contain = "none";
          var i = [Ee(t.element), Ae(t.element)], a = i[0], l = i[1];
          (n || r) && (t.element.style.width = a < t.defaultWidth ? a + "px" : t.scrollWidth || t.defaultWidth + "px"), (n || o) && (t.element.style.height = l < t.defaultHeight ? l + "px" : t.scrollHeight || t.defaultHeight + "px"), t.content.style.minHeight = t.content.style.minWidth = "", t.content.style.position = "", t.element.style.contain = "";
        }
      });
    },
    getLast: function() {
      var t, n, r = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0, o = arguments.length > 1 ? arguments[1] : void 0;
      return this.items ? Math.min(o ? ((t = this.columns || this.items[0]) === null || t === void 0 ? void 0 : t.length) || 0 : ((n = this.items) === null || n === void 0 ? void 0 : n.length) || 0, r) : 0;
    },
    getContentPosition: function() {
      if (this.content) {
        var t = getComputedStyle(this.content), n = parseFloat(t.paddingLeft) + Math.max(parseFloat(t.left) || 0, 0), r = parseFloat(t.paddingRight) + Math.max(parseFloat(t.right) || 0, 0), o = parseFloat(t.paddingTop) + Math.max(parseFloat(t.top) || 0, 0), i = parseFloat(t.paddingBottom) + Math.max(parseFloat(t.bottom) || 0, 0);
        return {
          left: n,
          right: r,
          top: o,
          bottom: i,
          x: n + r,
          y: o + i
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
        var n = this.isBoth(), r = this.isHorizontal(), o = this.element.parentElement, i = this.scrollWidth || "".concat(this.element.offsetWidth || o.offsetWidth, "px"), a = this.scrollHeight || "".concat(this.element.offsetHeight || o.offsetHeight, "px"), l = function(d, c) {
          return t.element.style[d] = c;
        };
        n || r ? (l("height", a), l("width", i)) : l("height", a);
      }
    },
    setSpacerSize: function() {
      var t = this, n = this.items;
      if (n) {
        var r = this.isBoth(), o = this.isHorizontal(), i = this.getContentPosition(), a = function(s, d, c) {
          var u = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : 0;
          return t.spacerStyle = Ge(Ge({}, t.spacerStyle), Ur({}, "".concat(s), (d || []).length * c + u + "px"));
        };
        r ? (a("height", n, this.itemSize[0], i.y), a("width", this.columns || n[1], this.itemSize[1], i.x)) : o ? a("width", this.columns || n, this.itemSize, i.x) : a("height", n, this.itemSize, i.y);
      }
    },
    setContentPosition: function(t) {
      var n = this;
      if (this.content && !this.appendOnly) {
        var r = this.isBoth(), o = this.isHorizontal(), i = t ? t.first : this.first, a = function(c, u) {
          return c * u;
        }, l = function() {
          var c = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0, u = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0;
          return n.contentStyle = Ge(Ge({}, n.contentStyle), {
            transform: "translate3d(".concat(c, "px, ").concat(u, "px, 0)")
          });
        };
        if (r)
          l(a(i.cols, this.itemSize[1]), a(i.rows, this.itemSize[0]));
        else {
          var s = a(i, this.itemSize);
          o ? l(s, 0) : l(0, s);
        }
      }
    },
    onScrollPositionChange: function(t) {
      var n = this, r = t.target, o = this.isBoth(), i = this.isHorizontal(), a = this.getContentPosition(), l = function(M, K) {
        return M ? M > K ? M - K : M : 0;
      }, s = function(M, K) {
        return Math.floor(M / (K || M));
      }, d = function(M, K, ee, te, G, Z) {
        return M <= G ? G : Z ? ee - te - G : K + G - 1;
      }, c = function(M, K, ee, te, G, Z, re, $e) {
        if (M <= Z) return 0;
        var pe = Math.max(0, re ? M < K ? ee : M - Z : M > K ? ee : M - 2 * Z), oe = n.getLast(pe, $e);
        return pe > oe ? oe - G : pe;
      }, u = function(M, K, ee, te, G, Z) {
        var re = K + te + 2 * G;
        return M >= G && (re += G + 1), n.getLast(re, Z);
      }, p = l(r.scrollTop, a.top), h = l(r.scrollLeft, a.left), m = o ? {
        rows: 0,
        cols: 0
      } : 0, y = this.last, b = !1, k = this.lastScrollPos;
      if (o) {
        var _ = this.lastScrollPos.top <= p, S = this.lastScrollPos.left <= h;
        if (!this.appendOnly || this.appendOnly && (_ || S)) {
          var f = {
            rows: s(p, this.itemSize[0]),
            cols: s(h, this.itemSize[1])
          }, g = {
            rows: d(f.rows, this.first.rows, this.last.rows, this.numItemsInViewport.rows, this.d_numToleratedItems[0], _),
            cols: d(f.cols, this.first.cols, this.last.cols, this.numItemsInViewport.cols, this.d_numToleratedItems[1], S)
          };
          m = {
            rows: c(f.rows, g.rows, this.first.rows, this.last.rows, this.numItemsInViewport.rows, this.d_numToleratedItems[0], _),
            cols: c(f.cols, g.cols, this.first.cols, this.last.cols, this.numItemsInViewport.cols, this.d_numToleratedItems[1], S, !0)
          }, y = {
            rows: u(f.rows, m.rows, this.last.rows, this.numItemsInViewport.rows, this.d_numToleratedItems[0]),
            cols: u(f.cols, m.cols, this.last.cols, this.numItemsInViewport.cols, this.d_numToleratedItems[1], !0)
          }, b = m.rows !== this.first.rows || y.rows !== this.last.rows || m.cols !== this.first.cols || y.cols !== this.last.cols || this.isRangeChanged, k = {
            top: p,
            left: h
          };
        }
      } else {
        var C = i ? h : p, w = this.lastScrollPos <= C;
        if (!this.appendOnly || this.appendOnly && w) {
          var x = s(C, this.itemSize), V = d(x, this.first, this.last, this.numItemsInViewport, this.d_numToleratedItems, w);
          m = c(x, V, this.first, this.last, this.numItemsInViewport, this.d_numToleratedItems, w), y = u(x, m, this.last, this.numItemsInViewport, this.d_numToleratedItems), b = m !== this.first || y !== this.last || this.isRangeChanged, k = C;
        }
      }
      return {
        first: m,
        last: y,
        isRangeChanged: b,
        scrollPos: k
      };
    },
    onScrollChange: function(t) {
      var n = this.onScrollPositionChange(t), r = n.first, o = n.last, i = n.isRangeChanged, a = n.scrollPos;
      if (i) {
        var l = {
          first: r,
          last: o
        };
        if (this.setContentPosition(l), this.first = r, this.last = o, this.lastScrollPos = a, this.$emit("scroll-index-change", l), this.lazy && this.isPageChanged(r)) {
          var s, d, c = {
            first: this.step ? Math.min(this.getPageByFirst(r) * this.step, (((s = this.items) === null || s === void 0 ? void 0 : s.length) || 0) - this.step) : r,
            last: Math.min(this.step ? (this.getPageByFirst(r) + 1) * this.step : o, ((d = this.items) === null || d === void 0 ? void 0 : d.length) || 0)
          }, u = this.lazyLoadState.first !== c.first || this.lazyLoadState.last !== c.last;
          u && this.$emit("lazy-load", c), this.lazyLoadState = c;
        }
      }
    },
    onScroll: function(t) {
      var n = this;
      if (this.$emit("scroll", t), this.delay) {
        if (this.scrollTimeout && clearTimeout(this.scrollTimeout), this.isPageChanged()) {
          if (!this.d_loading && this.showLoader) {
            var r = this.onScrollPositionChange(t), o = r.isRangeChanged, i = o || (this.step ? this.isPageChanged() : !1);
            i && (this.d_loading = !0);
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
        if (xt(t.element)) {
          var n = t.isBoth(), r = t.isVertical(), o = t.isHorizontal(), i = [Ee(t.element), Ae(t.element)], a = i[0], l = i[1], s = a !== t.defaultWidth, d = l !== t.defaultHeight, c = n ? s || d : o ? s : r ? d : !1;
          c && (t.d_numToleratedItems = t.numToleratedItems, t.defaultWidth = a, t.defaultHeight = l, t.defaultContentWidth = Ee(t.content), t.defaultContentHeight = Ae(t.content), t.init());
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
      return Ge({
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
      this.content = t || this.content || _t(this.element, '[data-pc-section="content"]');
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
    SpinnerIcon: Ct
  }
}, Nl = ["tabindex"];
function Ml(e, t, n, r, o, i) {
  var a = ae("SpinnerIcon");
  return e.disabled ? (v(), O(Se, {
    key: 1
  }, [E(e.$slots, "default"), E(e.$slots, "content", {
    items: e.items,
    rows: e.items,
    columns: i.loadedColumns
  })], 64)) : (v(), O("div", $({
    key: 0,
    ref: i.elementRef,
    class: i.containerClass,
    tabindex: e.tabindex,
    style: e.style,
    onScroll: t[0] || (t[0] = function() {
      return i.onScroll && i.onScroll.apply(i, arguments);
    })
  }, e.ptmi("root")), [E(e.$slots, "content", {
    styleClass: i.contentClass,
    items: i.loadedItems,
    getItemOptions: i.getOptions,
    loading: o.d_loading,
    getLoaderOptions: i.getLoaderOptions,
    itemSize: e.itemSize,
    rows: i.loadedRows,
    columns: i.loadedColumns,
    contentRef: i.contentRef,
    spacerStyle: o.spacerStyle,
    contentStyle: o.contentStyle,
    vertical: i.isVertical(),
    horizontal: i.isHorizontal(),
    both: i.isBoth()
  }, function() {
    return [I("div", $({
      ref: i.contentRef,
      class: i.contentClass,
      style: o.contentStyle
    }, e.ptm("content")), [(v(!0), O(Se, null, He(i.loadedItems, function(l, s) {
      return E(e.$slots, "item", {
        key: s,
        item: l,
        options: i.getOptions(s)
      });
    }), 128))], 16)];
  }), e.showSpacer ? (v(), O("div", $({
    key: 0,
    class: "p-virtualscroller-spacer",
    style: o.spacerStyle
  }, e.ptm("spacer")), null, 16)) : N("", !0), !e.loaderDisabled && e.showLoader && o.d_loading ? (v(), O("div", $({
    key: 1,
    class: i.loaderClass
  }, e.ptm("loader")), [e.$slots && e.$slots.loader ? (v(!0), O(Se, {
    key: 0
  }, He(o.loaderArr, function(l, s) {
    return E(e.$slots, "loader", {
      key: s,
      options: i.getLoaderOptions(s, i.isBoth() && {
        numCols: e.d_numItemsInViewport.cols
      })
    });
  }), 128)) : N("", !0), E(e.$slots, "loadingicon", {}, function() {
    return [R(a, $({
      spin: "",
      class: "p-virtualscroller-loading-icon"
    }, e.ptm("loadingIcon")), null, 16)];
  })], 16)) : N("", !0)], 16, Nl));
}
Kr.render = Ml;
var Rl = `
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
`, Dl = {
  root: function(t) {
    var n = t.instance, r = t.props, o = t.state;
    return ["p-select p-component p-inputwrapper", {
      "p-disabled": r.disabled,
      "p-invalid": n.$invalid,
      "p-variant-filled": n.$variant === "filled",
      "p-focus": o.focused,
      "p-inputwrapper-filled": n.$filled,
      "p-inputwrapper-focus": o.focused || o.overlayVisible,
      "p-select-open": o.overlayVisible,
      "p-select-fluid": n.$fluid,
      "p-select-sm p-inputfield-sm": r.size === "small",
      "p-select-lg p-inputfield-lg": r.size === "large"
    }];
  },
  label: function(t) {
    var n, r = t.instance, o = t.props;
    return ["p-select-label", {
      "p-placeholder": !o.editable && r.label === o.placeholder,
      "p-select-label-empty": !o.editable && !r.$slots.value && (r.label === "p-emptylabel" || ((n = r.label) === null || n === void 0 ? void 0 : n.length) === 0)
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
    var n = t.instance, r = t.props, o = t.state, i = t.option, a = t.focusedOption;
    return ["p-select-option", {
      "p-select-option-selected": n.isSelected(i) && r.highlightOnSelect,
      "p-focus": o.focusedOptionIndex === a,
      "p-disabled": n.isOptionDisabled(i)
    }];
  },
  optionLabel: "p-select-option-label",
  optionCheckIcon: "p-select-option-check-icon",
  optionBlankIcon: "p-select-option-blank-icon",
  emptyMessage: "p-select-empty-message"
}, Bl = z.extend({
  name: "select",
  style: Rl,
  classes: Dl
}), Hl = {
  name: "BaseSelect",
  extends: Br,
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
  style: Bl,
  provide: function() {
    return {
      $pcSelect: this,
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
function Ul(e) {
  return ql(e) || Gl(e) || Wl(e) || Kl();
}
function Kl() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Wl(e, t) {
  if (e) {
    if (typeof e == "string") return Qt(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Qt(e, t) : void 0;
  }
}
function Gl(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function ql(e) {
  if (Array.isArray(e)) return Qt(e);
}
function Qt(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function Yn(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(e);
    t && (r = r.filter(function(o) {
      return Object.getOwnPropertyDescriptor(e, o).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function Jn(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? Yn(Object(n), !0).forEach(function(r) {
      Le(e, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Yn(Object(n)).forEach(function(r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return e;
}
function Le(e, t, n) {
  return (t = Yl(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Yl(e) {
  var t = Jl(e, "string");
  return pt(t) == "symbol" ? t : t + "";
}
function Jl(e, t) {
  if (pt(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (pt(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var Wr = {
  name: "Select",
  extends: Hl,
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
    this.unbindOutsideClickListener(), this.unbindResizeListener(), this.unbindLabelClickListener(), this.unbindMatchMediaOrientationListener(), this.scrollHandler && (this.scrollHandler.destroy(), this.scrollHandler = null), this.overlay && (Pt.clear(this.overlay), this.overlay = null);
  },
  methods: {
    getOptionIndex: function(t, n) {
      return this.virtualScrollerDisabled ? t : n && n(t).index;
    },
    getOptionLabel: function(t) {
      return this.optionLabel ? we(t, this.optionLabel) : t;
    },
    getOptionValue: function(t) {
      return this.optionValue ? we(t, this.optionValue) : t;
    },
    getOptionRenderKey: function(t, n) {
      return (this.dataKey ? we(t, this.dataKey) : this.getOptionLabel(t)) + "_" + n;
    },
    getPTItemOptions: function(t, n, r, o) {
      return this.ptm(o, {
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
      return this.optionDisabled ? we(t, this.optionDisabled) : !1;
    },
    isOptionGroup: function(t) {
      return this.optionGroupLabel && t.optionGroup && t.group;
    },
    getOptionGroupLabel: function(t) {
      return we(t, this.optionGroupLabel);
    },
    getOptionGroupChildren: function(t) {
      return we(t, this.optionGroupChildren);
    },
    getAriaPosInset: function(t) {
      var n = this;
      return (this.optionGroupLabel ? t - this.visibleOptions.slice(0, t).filter(function(r) {
        return n.isOptionGroup(r);
      }).length : t) + 1;
    },
    show: function(t) {
      this.$emit("before-show"), this.overlayVisible = !0, this.focusedOptionIndex = this.focusedOptionIndex !== -1 ? this.focusedOptionIndex : this.autoOptionFocus ? this.findFirstFocusedOptionIndex() : this.editable ? -1 : this.findSelectedOptionIndex(), t && ye(this.$refs.focusInput);
    },
    hide: function(t) {
      var n = this, r = function() {
        n.$emit("before-hide"), n.overlayVisible = !1, n.clicked = !1, n.focusedOptionIndex = -1, n.searchValue = "", n.resetFilterOnHide && (n.filterValue = null), t && ye(n.$refs.focusInput);
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
        var r, o;
        n.focused = !1, n.focusedOptionIndex = -1, n.searchValue = "", n.$emit("blur", t), (r = (o = n.formField).onBlur) === null || r === void 0 || r.call(o, t);
      }, 100);
    },
    onKeyDown: function(t) {
      var n = this;
      if (this.disabled) {
        t.preventDefault();
        return;
      }
      if (Vi())
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
          !r && mi(t.key) && (!this.overlayVisible && this.show(), !this.editable && this.searchOptions(t, t.key), this.filter && this.$nextTick(function() {
            n.$refs.filterInput && ye(n.$refs.filterInput.$el);
          }));
          break;
      }
      this.clicked = !1;
    },
    onEditableInput: function(t) {
      var n = t.target.value;
      this.searchValue = "";
      var r = this.searchOptions(t, n);
      !r && (this.focusedOptionIndex = -1), this.updateModel(t, n), !this.overlayVisible && A(n) && this.show();
    },
    onContainerClick: function(t) {
      this.disabled || this.loading || t.target.tagName === "INPUT" || t.target.getAttribute("data-pc-section") === "clearicon" || t.target.closest('[data-pc-section="clearicon"]') || ((!this.overlay || !this.overlay.contains(t.target)) && (this.overlayVisible ? this.hide(!0) : this.show(!0)), this.clicked = !0);
    },
    onClearClick: function(t) {
      this.updateModel(t, null), this.resetFilterOnClear && (this.filterValue = null);
    },
    onFirstHiddenFocus: function(t) {
      var n = t.relatedTarget === this.$refs.focusInput ? Ti(this.overlay, ':not([data-p-hidden-focusable="true"])') : this.$refs.focusInput;
      ye(n);
    },
    onLastHiddenFocus: function(t) {
      var n = t.relatedTarget === this.$refs.focusInput ? Li(this.overlay, ':not([data-p-hidden-focusable="true"])') : this.$refs.focusInput;
      ye(n);
    },
    onOptionSelect: function(t, n) {
      var r = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : !0;
      if (this.overlayVisible) {
        var o = this.getOptionValue(n);
        this.updateModel(t, o), r && this.hide(!0);
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
      os.emit("overlay-click", {
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
          var o = r.value.length;
          r.setSelectionRange(o, o), this.focusedOptionIndex = -1;
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
      n || (this.overlayVisible && this.hasFocusableElements() ? (ye(this.$refs.firstHiddenFocusableElementOnOverlay), t.preventDefault()) : (this.focusedOptionIndex !== -1 && this.onOptionSelect(t, this.visibleOptions[this.focusedOptionIndex]), this.overlayVisible && this.hide(this.filter)));
    },
    onBackspaceKey: function(t) {
      var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1;
      n && !this.overlayVisible && this.show();
    },
    onOverlayEnter: function(t) {
      var n = this;
      Pt.set("overlay", t, this.$primevue.config.zIndex.overlay), $i(t, {
        position: "absolute",
        top: "0"
      }), this.alignOverlay(), this.scrollInView(), this.$attrSelector && t.setAttribute(this.$attrSelector, ""), setTimeout(function() {
        n.autoFilterFocus && n.filter && ye(n.$refs.filterInput.$el), n.autoUpdateModel();
      }, 1);
    },
    onOverlayAfterEnter: function() {
      this.bindOutsideClickListener(), this.bindScrollListener(), this.bindResizeListener(), this.$emit("show");
    },
    onOverlayLeave: function(t) {
      var n = this;
      t.style.pointerEvents = "none", this.unbindOutsideClickListener(), this.unbindScrollListener(), this.unbindResizeListener(), this.autoFilterFocus && this.filter && !this.editable && this.$nextTick(function() {
        n.$refs.filterInput && ye(n.$refs.filterInput.$el);
      }), this.$emit("hide"), this.overlay = null;
    },
    onOverlayAfterLeave: function(t) {
      Pt.clear(t);
    },
    alignOverlay: function() {
      this.appendTo === "self" ? Oi(this.overlay, this.$el) : this.overlay && (this.overlay.style.minWidth = mr(this.$el) + "px", Si(this.overlay, this.$el));
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
      this.scrollHandler || (this.scrollHandler = new rs(this.$refs.container, function() {
        t.overlayVisible && t.hide();
      })), this.scrollHandler.bindScrollListener();
    },
    unbindScrollListener: function() {
      this.scrollHandler && this.scrollHandler.unbindScrollListener();
    },
    bindResizeListener: function() {
      var t = this;
      this.resizeListener || (this.resizeListener = function() {
        t.overlayVisible && !ji() && t.hide();
      }, window.addEventListener("resize", this.resizeListener));
    },
    unbindResizeListener: function() {
      this.resizeListener && (window.removeEventListener("resize", this.resizeListener), this.resizeListener = null);
    },
    bindLabelClickListener: function() {
      var t = this;
      if (!this.editable && !this.labelClickListener) {
        var n = document.querySelector('label[for="'.concat(this.labelId, '"]'));
        n && xt(n) && (this.labelClickListener = function() {
          ye(t.$refs.focusInput);
        }, n.addEventListener("click", this.labelClickListener));
      }
    },
    unbindLabelClickListener: function() {
      if (this.labelClickListener) {
        var t = document.querySelector('label[for="'.concat(this.labelId, '"]'));
        t && xt(t) && t.removeEventListener("click", this.labelClickListener);
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
      return on(this.overlay, ':not([data-p-hidden-focusable="true"])').length > 0;
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
      return A(t) && !(this.isOptionDisabled(t) || this.isOptionGroup(t));
    },
    isValidSelectedOption: function(t) {
      return this.isValidOption(t) && this.isSelected(t);
    },
    isSelected: function(t) {
      return dr(this.d_value, this.getOptionValue(t), this.equalityKey);
    },
    findFirstOptionIndex: function() {
      var t = this;
      return this.visibleOptions.findIndex(function(n) {
        return t.isValidOption(n);
      });
    },
    findLastOptionIndex: function() {
      var t = this;
      return bn(this.visibleOptions, function(n) {
        return t.isValidOption(n);
      });
    },
    findNextOptionIndex: function(t) {
      var n = this, r = t < this.visibleOptions.length - 1 ? this.visibleOptions.slice(t + 1).findIndex(function(o) {
        return n.isValidOption(o);
      }) : -1;
      return r > -1 ? r + t + 1 : t;
    },
    findPrevOptionIndex: function(t) {
      var n = this, r = t > 0 ? bn(this.visibleOptions.slice(0, t), function(o) {
        return n.isValidOption(o);
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
      var o = -1, i = !1;
      return A(this.searchValue) && (o = this.visibleOptions.findIndex(function(a) {
        return r.isOptionExactMatched(a);
      }), o === -1 && (o = this.visibleOptions.findIndex(function(a) {
        return r.isOptionStartsWith(a);
      })), o !== -1 && (i = !0), o === -1 && this.focusedOptionIndex === -1 && (o = this.findFirstFocusedOptionIndex()), o !== -1 && this.changeFocusedOptionIndex(t, o)), this.searchTimeout && clearTimeout(this.searchTimeout), this.searchTimeout = setTimeout(function() {
        r.searchValue = "", r.searchTimeout = null;
      }, 500), i;
    },
    changeFocusedOptionIndex: function(t, n) {
      this.focusedOptionIndex !== n && (this.focusedOptionIndex = n, this.scrollInView(), this.selectOnFocus && this.onOptionSelect(t, this.visibleOptions[n], !1));
    },
    scrollInView: function() {
      var t = this, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : -1;
      this.$nextTick(function() {
        var r = n !== -1 ? "".concat(t.$id, "_").concat(n) : t.focusedOptionId, o = _t(t.list, 'li[id="'.concat(r, '"]'));
        o ? o.scrollIntoView && o.scrollIntoView({
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
      return (t || []).reduce(function(r, o, i) {
        r.push({
          optionGroup: o,
          group: !0,
          index: i
        });
        var a = n.getOptionGroupChildren(o);
        return a && a.forEach(function(l) {
          return r.push(l);
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
        var r = Ji.filter(n, this.searchFields, this.filterValue, this.filterMatchMode, this.filterLocale);
        if (this.optionGroupLabel) {
          var o = this.options || [], i = [];
          return o.forEach(function(a) {
            var l = t.getOptionGroupChildren(a), s = l.filter(function(d) {
              return r.includes(d);
            });
            s.length > 0 && i.push(Jn(Jn({}, a), {}, Le({}, typeof t.optionGroupChildren == "string" ? t.optionGroupChildren : "items", Ul(s))));
          }), this.flatOptions(i);
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
      return A(this.visibleOptions) ? this.filterMessageText.replaceAll("{0}", this.visibleOptions.length) : this.emptyFilterMessageText;
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
      return ue(Le({
        invalid: this.$invalid,
        disabled: this.disabled,
        focus: this.focused,
        fluid: this.$fluid,
        filled: this.$variant === "filled"
      }, this.size, this.size));
    },
    labelDataP: function() {
      return ue(Le(Le({
        placeholder: !this.editable && this.label === this.placeholder,
        clearable: this.showClear,
        disabled: this.disabled,
        editable: this.editable
      }, this.size, this.size), "empty", !this.editable && !this.$slots.value && (this.label === "p-emptylabel" || this.label.length === 0)));
    },
    dropdownIconDataP: function() {
      return ue(Le({}, this.size, this.size));
    },
    overlayDataP: function() {
      return ue(Le({}, "portal-" + this.appendTo, "portal-" + this.appendTo));
    }
  },
  directives: {
    ripple: Pr
  },
  components: {
    InputText: Hr,
    VirtualScroller: Kr,
    Portal: an,
    InputIcon: Rr,
    IconField: Mr,
    TimesIcon: Nr,
    ChevronDownIcon: jr,
    SpinnerIcon: Ct,
    SearchIcon: Fr,
    CheckIcon: Vr,
    BlankIcon: zr
  }
}, Zl = ["id", "data-p"], Ql = ["name", "id", "value", "placeholder", "tabindex", "disabled", "aria-label", "aria-labelledby", "aria-expanded", "aria-controls", "aria-activedescendant", "aria-invalid", "data-p"], Xl = ["name", "id", "tabindex", "aria-label", "aria-labelledby", "aria-expanded", "aria-controls", "aria-activedescendant", "aria-invalid", "aria-disabled", "data-p"], ed = ["data-p"], td = ["id"], nd = ["id"], rd = ["id", "aria-label", "aria-selected", "aria-disabled", "aria-setsize", "aria-posinset", "onMousedown", "onMousemove", "data-p-selected", "data-p-focused", "data-p-disabled"];
function od(e, t, n, r, o, i) {
  var a = ae("SpinnerIcon"), l = ae("InputText"), s = ae("SearchIcon"), d = ae("InputIcon"), c = ae("IconField"), u = ae("CheckIcon"), p = ae("BlankIcon"), h = ae("VirtualScroller"), m = ae("Portal"), y = Xn("ripple");
  return v(), O("div", $({
    ref: "container",
    id: e.$id,
    class: e.cx("root"),
    onClick: t[12] || (t[12] = function() {
      return i.onContainerClick && i.onContainerClick.apply(i, arguments);
    }),
    "data-p": i.containerDataP
  }, e.ptmi("root")), [e.editable ? (v(), O("input", $({
    key: 0,
    ref: "focusInput",
    name: e.name,
    id: e.labelId || e.inputId,
    type: "text",
    class: [e.cx("label"), e.inputClass, e.labelClass],
    style: [e.inputStyle, e.labelStyle],
    value: i.editableInputValue,
    placeholder: e.placeholder,
    tabindex: e.disabled ? -1 : e.tabindex,
    disabled: e.disabled,
    autocomplete: "off",
    role: "combobox",
    "aria-label": e.ariaLabel,
    "aria-labelledby": e.ariaLabelledby,
    "aria-haspopup": "listbox",
    "aria-expanded": o.overlayVisible,
    "aria-controls": o.overlayVisible ? e.$id + "_list" : void 0,
    "aria-activedescendant": o.focused ? i.focusedOptionId : void 0,
    "aria-invalid": e.invalid || void 0,
    onFocus: t[0] || (t[0] = function() {
      return i.onFocus && i.onFocus.apply(i, arguments);
    }),
    onBlur: t[1] || (t[1] = function() {
      return i.onBlur && i.onBlur.apply(i, arguments);
    }),
    onKeydown: t[2] || (t[2] = function() {
      return i.onKeyDown && i.onKeyDown.apply(i, arguments);
    }),
    onInput: t[3] || (t[3] = function() {
      return i.onEditableInput && i.onEditableInput.apply(i, arguments);
    }),
    "data-p": i.labelDataP
  }, e.ptm("label")), null, 16, Ql)) : (v(), O("span", $({
    key: 1,
    ref: "focusInput",
    name: e.name,
    id: e.labelId || e.inputId,
    class: [e.cx("label"), e.inputClass, e.labelClass],
    style: [e.inputStyle, e.labelStyle],
    tabindex: e.disabled ? -1 : e.tabindex,
    role: "combobox",
    "aria-label": e.ariaLabel || (i.label === "p-emptylabel" ? void 0 : i.label),
    "aria-labelledby": e.ariaLabelledby,
    "aria-haspopup": "listbox",
    "aria-expanded": o.overlayVisible,
    "aria-controls": e.$id + "_list",
    "aria-activedescendant": o.focused ? i.focusedOptionId : void 0,
    "aria-invalid": e.invalid || void 0,
    "aria-disabled": e.disabled,
    onFocus: t[4] || (t[4] = function() {
      return i.onFocus && i.onFocus.apply(i, arguments);
    }),
    onBlur: t[5] || (t[5] = function() {
      return i.onBlur && i.onBlur.apply(i, arguments);
    }),
    onKeydown: t[6] || (t[6] = function() {
      return i.onKeyDown && i.onKeyDown.apply(i, arguments);
    }),
    "data-p": i.labelDataP
  }, e.ptm("label")), [E(e.$slots, "value", {
    value: e.d_value,
    placeholder: e.placeholder
  }, function() {
    var b;
    return [ze(W(i.label === "p-emptylabel" ? " " : (b = i.label) !== null && b !== void 0 ? b : "empty"), 1)];
  })], 16, Xl)), i.isClearIconVisible ? E(e.$slots, "clearicon", {
    key: 2,
    class: ce(e.cx("clearIcon")),
    clearCallback: i.onClearClick
  }, function() {
    return [(v(), U(Et(e.clearIcon ? "i" : "TimesIcon"), $({
      ref: "clearIcon",
      class: [e.cx("clearIcon"), e.clearIcon],
      onClick: i.onClearClick
    }, e.ptm("clearIcon"), {
      "data-pc-section": "clearicon"
    }), null, 16, ["class", "onClick"]))];
  }) : N("", !0), I("div", $({
    class: e.cx("dropdown")
  }, e.ptm("dropdown")), [e.loading ? E(e.$slots, "loadingicon", {
    key: 0,
    class: ce(e.cx("loadingIcon"))
  }, function() {
    return [e.loadingIcon ? (v(), O("span", $({
      key: 0,
      class: [e.cx("loadingIcon"), "pi-spin", e.loadingIcon],
      "aria-hidden": "true"
    }, e.ptm("loadingIcon")), null, 16)) : (v(), U(a, $({
      key: 1,
      class: e.cx("loadingIcon"),
      spin: "",
      "aria-hidden": "true"
    }, e.ptm("loadingIcon")), null, 16, ["class"]))];
  }) : E(e.$slots, "dropdownicon", {
    key: 1,
    class: ce(e.cx("dropdownIcon"))
  }, function() {
    return [(v(), U(Et(e.dropdownIcon ? "span" : "ChevronDownIcon"), $({
      class: [e.cx("dropdownIcon"), e.dropdownIcon],
      "aria-hidden": "true",
      "data-p": i.dropdownIconDataP
    }, e.ptm("dropdownIcon")), null, 16, ["class", "data-p"]))];
  })], 16), R(m, {
    appendTo: e.appendTo
  }, {
    default: q(function() {
      return [R($o, $({
        name: "p-anchored-overlay",
        onEnter: i.onOverlayEnter,
        onAfterEnter: i.onOverlayAfterEnter,
        onLeave: i.onOverlayLeave,
        onAfterLeave: i.onOverlayAfterLeave
      }, e.ptm("transition")), {
        default: q(function() {
          return [o.overlayVisible ? (v(), O("div", $({
            key: 0,
            ref: i.overlayRef,
            class: [e.cx("overlay"), e.panelClass, e.overlayClass],
            style: [e.panelStyle, e.overlayStyle],
            onClick: t[10] || (t[10] = function() {
              return i.onOverlayClick && i.onOverlayClick.apply(i, arguments);
            }),
            onKeydown: t[11] || (t[11] = function() {
              return i.onOverlayKeyDown && i.onOverlayKeyDown.apply(i, arguments);
            }),
            "data-p": i.overlayDataP
          }, e.ptm("overlay")), [I("span", $({
            ref: "firstHiddenFocusableElementOnOverlay",
            role: "presentation",
            "aria-hidden": "true",
            class: "p-hidden-accessible p-hidden-focusable",
            tabindex: 0,
            onFocus: t[7] || (t[7] = function() {
              return i.onFirstHiddenFocus && i.onFirstHiddenFocus.apply(i, arguments);
            })
          }, e.ptm("hiddenFirstFocusableEl"), {
            "data-p-hidden-accessible": !0,
            "data-p-hidden-focusable": !0
          }), null, 16), E(e.$slots, "header", {
            value: e.d_value,
            options: i.visibleOptions
          }), e.filter ? (v(), O("div", $({
            key: 0,
            class: e.cx("header")
          }, e.ptm("header")), [R(c, {
            unstyled: e.unstyled,
            pt: e.ptm("pcFilterContainer")
          }, {
            default: q(function() {
              return [R(l, {
                ref: "filterInput",
                type: "text",
                value: o.filterValue,
                onVnodeMounted: i.onFilterUpdated,
                onVnodeUpdated: i.onFilterUpdated,
                class: ce(e.cx("pcFilter")),
                placeholder: e.filterPlaceholder,
                variant: e.variant,
                unstyled: e.unstyled,
                role: "searchbox",
                autocomplete: "off",
                "aria-owns": e.$id + "_list",
                "aria-activedescendant": i.focusedOptionId,
                onKeydown: i.onFilterKeyDown,
                onBlur: i.onFilterBlur,
                onInput: i.onFilterChange,
                pt: e.ptm("pcFilter"),
                formControl: {
                  novalidate: !0
                }
              }, null, 8, ["value", "onVnodeMounted", "onVnodeUpdated", "class", "placeholder", "variant", "unstyled", "aria-owns", "aria-activedescendant", "onKeydown", "onBlur", "onInput", "pt"]), R(d, {
                unstyled: e.unstyled,
                pt: e.ptm("pcFilterIconContainer")
              }, {
                default: q(function() {
                  return [E(e.$slots, "filtericon", {}, function() {
                    return [e.filterIcon ? (v(), O("span", $({
                      key: 0,
                      class: e.filterIcon
                    }, e.ptm("filterIcon")), null, 16)) : (v(), U(s, Oo($({
                      key: 1
                    }, e.ptm("filterIcon"))), null, 16))];
                  })];
                }),
                _: 3
              }, 8, ["unstyled", "pt"])];
            }),
            _: 3
          }, 8, ["unstyled", "pt"]), I("span", $({
            role: "status",
            "aria-live": "polite",
            class: "p-hidden-accessible"
          }, e.ptm("hiddenFilterResult"), {
            "data-p-hidden-accessible": !0
          }), W(i.filterResultMessageText), 17)], 16)) : N("", !0), I("div", $({
            class: e.cx("listContainer"),
            style: {
              "max-height": i.virtualScrollerDisabled ? e.scrollHeight : ""
            }
          }, e.ptm("listContainer")), [R(h, $({
            ref: i.virtualScrollerRef
          }, e.virtualScrollerOptions, {
            items: i.visibleOptions,
            style: {
              height: e.scrollHeight
            },
            tabindex: -1,
            disabled: i.virtualScrollerDisabled,
            pt: e.ptm("virtualScroller")
          }), _o({
            content: q(function(b) {
              var k = b.styleClass, _ = b.contentRef, S = b.items, f = b.getItemOptions, g = b.contentStyle, C = b.itemSize;
              return [I("ul", $({
                ref: function(x) {
                  return i.listRef(x, _);
                },
                id: e.$id + "_list",
                class: [e.cx("list"), k],
                style: g,
                role: "listbox"
              }, e.ptm("list")), [(v(!0), O(Se, null, He(S, function(w, x) {
                return v(), O(Se, {
                  key: i.getOptionRenderKey(w, i.getOptionIndex(x, f))
                }, [i.isOptionGroup(w) ? (v(), O("li", $({
                  key: 0,
                  id: e.$id + "_" + i.getOptionIndex(x, f),
                  style: {
                    height: C ? C + "px" : void 0
                  },
                  class: e.cx("optionGroup"),
                  role: "option"
                }, {
                  ref_for: !0
                }, e.ptm("optionGroup")), [E(e.$slots, "optiongroup", {
                  option: w.optionGroup,
                  index: i.getOptionIndex(x, f)
                }, function() {
                  return [I("span", $({
                    class: e.cx("optionGroupLabel")
                  }, {
                    ref_for: !0
                  }, e.ptm("optionGroupLabel")), W(i.getOptionGroupLabel(w.optionGroup)), 17)];
                })], 16, nd)) : tn((v(), O("li", $({
                  key: 1,
                  id: e.$id + "_" + i.getOptionIndex(x, f),
                  class: e.cx("option", {
                    option: w,
                    focusedOption: i.getOptionIndex(x, f)
                  }),
                  style: {
                    height: C ? C + "px" : void 0
                  },
                  role: "option",
                  "aria-label": i.getOptionLabel(w),
                  "aria-selected": i.isSelected(w),
                  "aria-disabled": i.isOptionDisabled(w),
                  "aria-setsize": i.ariaSetSize,
                  "aria-posinset": i.getAriaPosInset(i.getOptionIndex(x, f)),
                  onMousedown: function(H) {
                    return i.onOptionSelect(H, w);
                  },
                  onMousemove: function(H) {
                    return i.onOptionMouseMove(H, i.getOptionIndex(x, f));
                  },
                  onClick: t[8] || (t[8] = er(function() {
                  }, ["stop"])),
                  "data-p-selected": !e.checkmark && i.isSelected(w),
                  "data-p-focused": o.focusedOptionIndex === i.getOptionIndex(x, f),
                  "data-p-disabled": i.isOptionDisabled(w)
                }, {
                  ref_for: !0
                }, i.getPTItemOptions(w, f, x, "option")), [e.checkmark ? (v(), O(Se, {
                  key: 0
                }, [i.isSelected(w) ? (v(), U(u, $({
                  key: 0,
                  class: e.cx("optionCheckIcon")
                }, {
                  ref_for: !0
                }, e.ptm("optionCheckIcon")), null, 16, ["class"])) : (v(), U(p, $({
                  key: 1,
                  class: e.cx("optionBlankIcon")
                }, {
                  ref_for: !0
                }, e.ptm("optionBlankIcon")), null, 16, ["class"]))], 64)) : N("", !0), E(e.$slots, "option", {
                  option: w,
                  selected: i.isSelected(w),
                  index: i.getOptionIndex(x, f)
                }, function() {
                  return [I("span", $({
                    class: e.cx("optionLabel")
                  }, {
                    ref_for: !0
                  }, e.ptm("optionLabel")), W(i.getOptionLabel(w)), 17)];
                })], 16, rd)), [[y]])], 64);
              }), 128)), o.filterValue && (!S || S && S.length === 0) ? (v(), O("li", $({
                key: 0,
                class: e.cx("emptyMessage"),
                role: "option"
              }, e.ptm("emptyMessage"), {
                "data-p-hidden-accessible": !0
              }), [E(e.$slots, "emptyfilter", {}, function() {
                return [ze(W(i.emptyFilterMessageText), 1)];
              })], 16)) : !e.options || e.options && e.options.length === 0 ? (v(), O("li", $({
                key: 1,
                class: e.cx("emptyMessage"),
                role: "option"
              }, e.ptm("emptyMessage"), {
                "data-p-hidden-accessible": !0
              }), [E(e.$slots, "empty", {}, function() {
                return [ze(W(i.emptyMessageText), 1)];
              })], 16)) : N("", !0)], 16, td)];
            }),
            _: 2
          }, [e.$slots.loader ? {
            name: "loader",
            fn: q(function(b) {
              var k = b.options;
              return [E(e.$slots, "loader", {
                options: k
              })];
            }),
            key: "0"
          } : void 0]), 1040, ["items", "style", "disabled", "pt"])], 16), E(e.$slots, "footer", {
            value: e.d_value,
            options: i.visibleOptions
          }), !e.options || e.options && e.options.length === 0 ? (v(), O("span", $({
            key: 1,
            role: "status",
            "aria-live": "polite",
            class: "p-hidden-accessible"
          }, e.ptm("hiddenEmptyMessage"), {
            "data-p-hidden-accessible": !0
          }), W(i.emptyMessageText), 17)) : N("", !0), I("span", $({
            role: "status",
            "aria-live": "polite",
            class: "p-hidden-accessible"
          }, e.ptm("hiddenSelectedMessage"), {
            "data-p-hidden-accessible": !0
          }), W(i.selectedMessageText), 17), I("span", $({
            ref: "lastHiddenFocusableElementOnOverlay",
            role: "presentation",
            "aria-hidden": "true",
            class: "p-hidden-accessible p-hidden-focusable",
            tabindex: 0,
            onFocus: t[9] || (t[9] = function() {
              return i.onLastHiddenFocus && i.onLastHiddenFocus.apply(i, arguments);
            })
          }, e.ptm("hiddenLastFocusableEl"), {
            "data-p-hidden-accessible": !0,
            "data-p-hidden-focusable": !0
          }), null, 16)], 16, ed)) : N("", !0)];
        }),
        _: 3
      }, 16, ["onEnter", "onAfterEnter", "onLeave", "onAfterLeave"])];
    }),
    _: 3
  }, 8, ["appendTo"])], 16, Zl);
}
Wr.render = od;
const uc = /* @__PURE__ */ ve({
  __name: "SelectField",
  props: {
    modelValue: {},
    options: {},
    ariaLabel: {},
    placeholder: {}
  },
  emits: ["update:modelValue"],
  setup(e, { emit: t }) {
    const n = t;
    return (r, o) => (v(), U(j(Wr), {
      class: "km-select",
      "model-value": e.modelValue,
      options: e.options,
      "option-label": "label",
      "option-value": "value",
      "aria-label": e.ariaLabel,
      placeholder: e.placeholder,
      "onUpdate:modelValue": o[0] || (o[0] = (i) => n("update:modelValue", i))
    }, null, 8, ["model-value", "options", "aria-label", "placeholder"]));
  }
}), id = { class: "km-field" }, ad = { class: "km-field-label" }, sd = {
  key: 0,
  class: "km-field-help"
}, Pe = /* @__PURE__ */ ve({
  __name: "FormField",
  props: {
    label: {},
    help: {}
  },
  setup(e) {
    return (t, n) => (v(), O("label", id, [
      I("span", ad, W(e.label), 1),
      E(t.$slots, "default"),
      e.help ? (v(), O("small", sd, W(e.help), 1)) : N("", !0)
    ]));
  }
}), ld = ["type", "value", "placeholder", "readonly", "disabled", "autocomplete", "min", "max", "step"], Te = /* @__PURE__ */ ve({
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
    function r(o) {
      const i = o.target;
      n("update:modelValue", i.value);
    }
    return (o, i) => (v(), O("input", {
      class: ce(["km-input", e.mono && "mono"]),
      type: e.type,
      value: e.modelValue,
      placeholder: e.placeholder,
      readonly: e.readonly,
      disabled: e.disabled,
      autocomplete: e.autocomplete,
      min: e.min,
      max: e.max,
      step: e.step,
      onInput: r
    }, null, 42, ld));
  }
});
var dd = `
    .p-toggleswitch {
        display: inline-block;
        width: dt('toggleswitch.width');
        height: dt('toggleswitch.height');
    }

    .p-toggleswitch-input {
        cursor: pointer;
        appearance: none;
        position: absolute;
        top: 0;
        inset-inline-start: 0;
        width: 100%;
        height: 100%;
        padding: 0;
        margin: 0;
        opacity: 0;
        z-index: 1;
        outline: 0 none;
        border-radius: dt('toggleswitch.border.radius');
    }

    .p-toggleswitch-slider {
        cursor: pointer;
        width: 100%;
        height: 100%;
        border-width: dt('toggleswitch.border.width');
        border-style: solid;
        border-color: dt('toggleswitch.border.color');
        background: dt('toggleswitch.background');
        transition:
            background dt('toggleswitch.transition.duration'),
            color dt('toggleswitch.transition.duration'),
            border-color dt('toggleswitch.transition.duration'),
            outline-color dt('toggleswitch.transition.duration'),
            box-shadow dt('toggleswitch.transition.duration');
        border-radius: dt('toggleswitch.border.radius');
        outline-color: transparent;
        box-shadow: dt('toggleswitch.shadow');
    }

    .p-toggleswitch-handle {
        position: absolute;
        top: 50%;
        display: flex;
        justify-content: center;
        align-items: center;
        background: dt('toggleswitch.handle.background');
        color: dt('toggleswitch.handle.color');
        width: dt('toggleswitch.handle.size');
        height: dt('toggleswitch.handle.size');
        inset-inline-start: dt('toggleswitch.gap');
        margin-block-start: calc(-1 * calc(dt('toggleswitch.handle.size') / 2));
        border-radius: dt('toggleswitch.handle.border.radius');
        transition:
            background dt('toggleswitch.transition.duration'),
            color dt('toggleswitch.transition.duration'),
            inset-inline-start dt('toggleswitch.slide.duration'),
            box-shadow dt('toggleswitch.slide.duration');
    }

    .p-toggleswitch.p-toggleswitch-checked .p-toggleswitch-slider {
        background: dt('toggleswitch.checked.background');
        border-color: dt('toggleswitch.checked.border.color');
    }

    .p-toggleswitch.p-toggleswitch-checked .p-toggleswitch-handle {
        background: dt('toggleswitch.handle.checked.background');
        color: dt('toggleswitch.handle.checked.color');
        inset-inline-start: calc(dt('toggleswitch.width') - calc(dt('toggleswitch.handle.size') + dt('toggleswitch.gap')));
    }

    .p-toggleswitch:not(.p-disabled):has(.p-toggleswitch-input:hover) .p-toggleswitch-slider {
        background: dt('toggleswitch.hover.background');
        border-color: dt('toggleswitch.hover.border.color');
    }

    .p-toggleswitch:not(.p-disabled):has(.p-toggleswitch-input:hover) .p-toggleswitch-handle {
        background: dt('toggleswitch.handle.hover.background');
        color: dt('toggleswitch.handle.hover.color');
    }

    .p-toggleswitch:not(.p-disabled):has(.p-toggleswitch-input:hover).p-toggleswitch-checked .p-toggleswitch-slider {
        background: dt('toggleswitch.checked.hover.background');
        border-color: dt('toggleswitch.checked.hover.border.color');
    }

    .p-toggleswitch:not(.p-disabled):has(.p-toggleswitch-input:hover).p-toggleswitch-checked .p-toggleswitch-handle {
        background: dt('toggleswitch.handle.checked.hover.background');
        color: dt('toggleswitch.handle.checked.hover.color');
    }

    .p-toggleswitch:not(.p-disabled):has(.p-toggleswitch-input:focus-visible) .p-toggleswitch-slider {
        box-shadow: dt('toggleswitch.focus.ring.shadow');
        outline: dt('toggleswitch.focus.ring.width') dt('toggleswitch.focus.ring.style') dt('toggleswitch.focus.ring.color');
        outline-offset: dt('toggleswitch.focus.ring.offset');
    }

    .p-toggleswitch.p-invalid > .p-toggleswitch-slider {
        border-color: dt('toggleswitch.invalid.border.color');
    }

    .p-toggleswitch.p-disabled {
        opacity: 1;
    }

    .p-toggleswitch.p-disabled .p-toggleswitch-slider {
        background: dt('toggleswitch.disabled.background');
    }

    .p-toggleswitch.p-disabled .p-toggleswitch-handle {
        background: dt('toggleswitch.handle.disabled.background');
    }
`, cd = {
  root: {
    position: "relative"
  }
}, ud = {
  root: function(t) {
    var n = t.instance, r = t.props;
    return ["p-toggleswitch p-component", {
      "p-toggleswitch-checked": n.checked,
      "p-disabled": r.disabled,
      "p-invalid": n.$invalid
    }];
  },
  input: "p-toggleswitch-input",
  slider: "p-toggleswitch-slider",
  handle: "p-toggleswitch-handle"
}, pd = z.extend({
  name: "toggleswitch",
  style: dd,
  classes: ud,
  inlineStyles: cd
}), fd = {
  name: "BaseToggleSwitch",
  extends: Dr,
  props: {
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
  style: pd,
  provide: function() {
    return {
      $pcToggleSwitch: this,
      $parentInstance: this
    };
  }
}, Gr = {
  name: "ToggleSwitch",
  extends: fd,
  inheritAttrs: !1,
  emits: ["change", "focus", "blur"],
  methods: {
    getPTOptions: function(t) {
      var n = t === "root" ? this.ptmi : this.ptm;
      return n(t, {
        context: {
          checked: this.checked,
          disabled: this.disabled
        }
      });
    },
    onChange: function(t) {
      if (!this.disabled && !this.readonly) {
        var n = this.checked ? this.falseValue : this.trueValue;
        this.writeValue(n, t), this.$emit("change", t);
      }
    },
    onFocus: function(t) {
      this.$emit("focus", t);
    },
    onBlur: function(t) {
      var n, r;
      this.$emit("blur", t), (n = (r = this.formField).onBlur) === null || n === void 0 || n.call(r, t);
    }
  },
  computed: {
    checked: function() {
      return this.d_value === this.trueValue;
    },
    dataP: function() {
      return ue({
        checked: this.checked,
        disabled: this.disabled,
        invalid: this.$invalid
      });
    }
  }
}, hd = ["data-p-checked", "data-p-disabled", "data-p"], md = ["id", "checked", "tabindex", "disabled", "readonly", "aria-checked", "aria-labelledby", "aria-label", "aria-invalid"], gd = ["data-p"], bd = ["data-p"];
function vd(e, t, n, r, o, i) {
  return v(), O("div", $({
    class: e.cx("root"),
    style: e.sx("root")
  }, i.getPTOptions("root"), {
    "data-p-checked": i.checked,
    "data-p-disabled": e.disabled,
    "data-p": i.dataP
  }), [I("input", $({
    id: e.inputId,
    type: "checkbox",
    role: "switch",
    class: [e.cx("input"), e.inputClass],
    style: e.inputStyle,
    checked: i.checked,
    tabindex: e.tabindex,
    disabled: e.disabled,
    readonly: e.readonly,
    "aria-checked": i.checked,
    "aria-labelledby": e.ariaLabelledby,
    "aria-label": e.ariaLabel,
    "aria-invalid": e.invalid || void 0,
    onFocus: t[0] || (t[0] = function() {
      return i.onFocus && i.onFocus.apply(i, arguments);
    }),
    onBlur: t[1] || (t[1] = function() {
      return i.onBlur && i.onBlur.apply(i, arguments);
    }),
    onChange: t[2] || (t[2] = function() {
      return i.onChange && i.onChange.apply(i, arguments);
    })
  }, i.getPTOptions("input")), null, 16, md), I("div", $({
    class: e.cx("slider")
  }, i.getPTOptions("slider"), {
    "data-p": i.dataP
  }), [I("div", $({
    class: e.cx("handle")
  }, i.getPTOptions("handle"), {
    "data-p": i.dataP
  }), [E(e.$slots, "handle", {
    checked: i.checked
  })], 16, bd)], 16, gd)], 16, hd);
}
Gr.render = vd;
const yd = {
  key: 0,
  class: "km-switch-label"
}, xd = /* @__PURE__ */ ve({
  __name: "Toggle",
  props: {
    modelValue: { type: Boolean },
    label: {},
    disabled: { type: Boolean }
  },
  emits: ["update:modelValue"],
  setup(e, { emit: t }) {
    const n = e, r = t, o = me({
      get: () => n.modelValue,
      set: (i) => r("update:modelValue", i)
    });
    return (i, a) => (v(), O("label", {
      class: ce(["km-switch", { disabled: e.disabled }])
    }, [
      R(j(Gr), {
        modelValue: o.value,
        "onUpdate:modelValue": a[0] || (a[0] = (l) => o.value = l),
        disabled: e.disabled
      }, null, 8, ["modelValue", "disabled"]),
      e.label ? (v(), O("span", yd, W(e.label), 1)) : N("", !0)
    ], 2));
  }
}), wd = { class: "km-notice-text" }, pc = /* @__PURE__ */ ve({
  __name: "Notice",
  props: {
    severity: { default: "info" }
  },
  emits: ["dismiss"],
  setup(e, { emit: t }) {
    const n = t;
    return (r, o) => (v(), O("div", {
      class: ce(["km-notice", `is-${e.severity}`]),
      role: "status"
    }, [
      R(j(Ue), {
        icon: e.severity === "danger" ? "tabler:alert-triangle" : "tabler:info-circle",
        "aria-hidden": "true"
      }, null, 8, ["icon"]),
      I("span", wd, [
        E(r.$slots, "default")
      ]),
      I("button", {
        class: "km-notice-x",
        "aria-label": "Dismiss",
        onClick: o[0] || (o[0] = (i) => n("dismiss"))
      }, [
        R(j(Ue), {
          icon: "tabler:x",
          "aria-hidden": "true"
        })
      ])
    ], 2));
  }
});
var kd = `
    .p-progressspinner {
        position: relative;
        margin: 0 auto;
        width: 100px;
        height: 100px;
        display: inline-block;
    }

    .p-progressspinner::before {
        content: '';
        display: block;
        padding-top: 100%;
    }

    .p-progressspinner-spin {
        height: 100%;
        transform-origin: center center;
        width: 100%;
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        margin: auto;
        animation: p-progressspinner-rotate 2s linear infinite;
    }

    .p-progressspinner-circle {
        stroke-dasharray: 89, 200;
        stroke-dashoffset: 0;
        stroke: dt('progressspinner.colorOne');
        animation:
            p-progressspinner-dash 1.5s ease-in-out infinite,
            p-progressspinner-color 6s ease-in-out infinite;
        stroke-linecap: round;
    }

    @keyframes p-progressspinner-rotate {
        100% {
            transform: rotate(360deg);
        }
    }
    @keyframes p-progressspinner-dash {
        0% {
            stroke-dasharray: 1, 200;
            stroke-dashoffset: 0;
        }
        50% {
            stroke-dasharray: 89, 200;
            stroke-dashoffset: -35px;
        }
        100% {
            stroke-dasharray: 89, 200;
            stroke-dashoffset: -124px;
        }
    }
    @keyframes p-progressspinner-color {
        100%,
        0% {
            stroke: dt('progressspinner.color.one');
        }
        40% {
            stroke: dt('progressspinner.color.two');
        }
        66% {
            stroke: dt('progressspinner.color.three');
        }
        80%,
        90% {
            stroke: dt('progressspinner.color.four');
        }
    }
`, Sd = {
  root: "p-progressspinner",
  spin: "p-progressspinner-spin",
  circle: "p-progressspinner-circle"
}, $d = z.extend({
  name: "progressspinner",
  style: kd,
  classes: Sd
}), Od = {
  name: "BaseProgressSpinner",
  extends: Ce,
  props: {
    strokeWidth: {
      type: String,
      default: "2"
    },
    fill: {
      type: String,
      default: "none"
    },
    animationDuration: {
      type: String,
      default: "2s"
    }
  },
  style: $d,
  provide: function() {
    return {
      $pcProgressSpinner: this,
      $parentInstance: this
    };
  }
}, qr = {
  name: "ProgressSpinner",
  extends: Od,
  inheritAttrs: !1,
  computed: {
    svgStyle: function() {
      return {
        "animation-duration": this.animationDuration
      };
    }
  }
}, _d = ["fill", "stroke-width"];
function Cd(e, t, n, r, o, i) {
  return v(), O("div", $({
    class: e.cx("root"),
    role: "progressbar"
  }, e.ptmi("root")), [(v(), O("svg", $({
    class: e.cx("spin"),
    viewBox: "25 25 50 50",
    style: i.svgStyle
  }, e.ptm("spin")), [I("circle", $({
    class: e.cx("circle"),
    cx: "50",
    cy: "50",
    r: "20",
    fill: e.fill,
    "stroke-width": e.strokeWidth,
    strokeMiterlimit: "10"
  }, e.ptm("circle")), null, 16, _d)], 16))], 16);
}
qr.render = Cd;
const Id = { class: "km-loading" }, Pd = { key: 0 }, fc = /* @__PURE__ */ ve({
  __name: "Spinner",
  props: {
    label: {}
  },
  setup(e) {
    return (t, n) => (v(), O("div", Id, [
      R(j(qr), {
        style: { width: "2rem", height: "2rem", margin: "0" },
        "aria-label": e.label || "Loading"
      }, null, 8, ["aria-label"]),
      e.label ? (v(), O("span", Pd, W(e.label), 1)) : N("", !0)
    ]));
  }
}), Td = /* @__PURE__ */ ve({
  __name: "Avatar",
  props: {
    icon: {},
    size: { default: "md" }
  },
  setup(e) {
    return (t, n) => (v(), O("span", {
      class: ce(["km-avatar", e.size !== "md" && e.size])
    }, [
      R(j(Ue), {
        icon: e.icon,
        "aria-hidden": "true"
      }, null, 8, ["icon"])
    ], 2));
  }
}), Ld = "wippy.llm.openai_compat:provider";
function hc(e) {
  return e === "healthy" ? "success" : e === "unhealthy" ? "danger" : e === "degraded" ? "warn" : "secondary";
}
const Ad = {
  healthy: "Healthy",
  unhealthy: "Unhealthy",
  degraded: "Degraded"
};
function mc(e) {
  return e && Ad[e] || "Unknown";
}
function gc(e) {
  return e === "registry" ? "info" : e === "discovered" ? "success" : e === "overlay" ? "warn" : "secondary";
}
function bc(e) {
  return e === "registry" ? "built-in" : e || "model";
}
function vc(e) {
  return !e || e <= 0 ? "—" : e >= 1e3 ? `${Math.round(e / 1e3)}k` : String(e);
}
function yc(e) {
  return e.icon || "tabler:plug";
}
const Ed = {
  tools: "tabler:tool",
  tool_use: "tabler:tool",
  function_calling: "tabler:tool",
  vision: "tabler:eye",
  image: "tabler:photo",
  images: "tabler:photo",
  multimodal: "tabler:photo",
  embed: "tabler:vector",
  embedding: "tabler:vector",
  embeddings: "tabler:vector",
  audio: "tabler:microphone",
  speech: "tabler:microphone",
  reasoning: "tabler:bulb",
  thinking: "tabler:bulb"
};
function xc(e) {
  return Ed[e.toLowerCase()] || "";
}
function wc(e) {
  return e.provider_id === Ld;
}
function kc(e) {
  const t = e.config || {};
  return t.base_url || t.region || t.location || "default endpoint";
}
function Sc(e) {
  return !!(e.has_api_key || e.has_api_key_env || e.secret_fields?.length);
}
function $c(e, t) {
  const n = e.options?.[t];
  return n == null || n === "" ? "" : String(n);
}
function Oc(e, t, n = () => []) {
  const r = (a) => e().find((l) => l.id === a), o = (a) => t().find((l) => l.id === a);
  return {
    adapterFor: r,
    profileFor: o,
    adapterTitle: (a) => r(a)?.title || a || "",
    profileTitle: (a) => o(a)?.name || a || "",
    isDiscoverable: (a) => r(a.provider_id)?.discoverable === !0,
    providerIcon: (a) => {
      if (!a) return "tabler:cpu";
      for (const l of n()) if (l.provider_id === a && l.icon) return l.icon;
      return "tabler:cpu";
    }
  };
}
const Xt = {
  openai_compat: {
    key: "openai_compat",
    title: "OpenAI Compatible",
    subtitle: "Chat Completions compatible endpoints, including local and hosted providers.",
    defaultProviderId: "wippy.llm.openai_compat:provider",
    icon: "tabler:plug",
    fields: [
      { key: "base_url", label: "Base URL", placeholder: "http://localhost:11434/v1", section: "endpoint", help: "Your endpoint v1 root." },
      { key: "api_key", label: "API key", type: "password", section: "auth", secret: !0, help: "Optional for local endpoints." },
      { key: "test_model", label: "Test model", placeholder: "gemma-4-12b", section: "advanced", help: "Probe model for Test connection; auto-picked from discovery when blank." },
      { key: "api_key_env", label: "API key env", placeholder: "OPENROUTER_API_KEY", section: "advanced" },
      { key: "organization", label: "Organization", section: "advanced" },
      { key: "timeout", label: "Timeout", type: "number", section: "advanced" }
    ]
  },
  openai: {
    key: "openai",
    title: "OpenAI",
    subtitle: "Native OpenAI Responses and embeddings provider.",
    defaultProviderId: "wippy.llm.openai:provider",
    icon: "tabler:brand-openai",
    fields: [
      { key: "api_key", label: "API key", type: "password", section: "auth", secret: !0 },
      { key: "base_url", label: "Base URL", placeholder: "https://api.openai.com/v1", section: "advanced" },
      { key: "test_model", label: "Test model", placeholder: "gpt-4o-mini", section: "advanced", help: "Probe model for Test connection; auto-picked when blank." },
      { key: "api_key_env", label: "API key env", placeholder: "OPENAI_API_KEY", section: "advanced" },
      { key: "organization", label: "Organization", section: "advanced" },
      { key: "timeout", label: "Timeout", type: "number", section: "advanced" }
    ]
  },
  anthropic: {
    key: "anthropic",
    title: "Anthropic",
    subtitle: "Claude Messages API provider with model discovery.",
    defaultProviderId: "wippy.llm.claude:provider",
    icon: "tabler:hexagon-letter-c",
    fields: [
      { key: "api_key", label: "API key", type: "password", section: "auth", secret: !0 },
      { key: "base_url", label: "Base URL", placeholder: "https://api.anthropic.com", section: "advanced" },
      { key: "api_key_env", label: "API key env", placeholder: "ANTHROPIC_API_KEY", section: "advanced" },
      { key: "api_version", label: "API version", placeholder: "2023-06-01", section: "advanced" },
      { key: "timeout", label: "Timeout", type: "number", section: "advanced" }
    ]
  },
  google_genai: {
    key: "google_genai",
    title: "Google Gemini",
    subtitle: "Gemini Developer API using API-key auth and models.list discovery.",
    defaultProviderId: "wippy.llm.google.generative_ai:provider",
    icon: "tabler:brand-google",
    fields: [
      { key: "api_key", label: "API key", type: "password", section: "auth", secret: !0 },
      { key: "base_url", label: "Base URL", placeholder: "https://generativelanguage.googleapis.com/v1beta/models", section: "advanced" },
      { key: "api_key_env", label: "API key env", placeholder: "GEMINI_API_KEY", section: "advanced" },
      { key: "timeout", label: "Timeout", type: "number", section: "advanced" }
    ]
  },
  google_vertex: {
    key: "google_vertex",
    title: "Google Vertex AI",
    subtitle: "Vertex context for explicit model overlays using project, location, and Google credentials.",
    defaultProviderId: "wippy.llm.google.vertex:provider",
    icon: "tabler:cloud",
    fields: [
      { key: "project", label: "Project", placeholder: "my-gcp-project", section: "endpoint", help: "Required unless the service-account JSON has project_id." },
      { key: "location", label: "Location", placeholder: "us-central1", section: "endpoint", help: "Required for Vertex model calls." },
      { key: "google_credentials", label: "Service account JSON/base64", type: "password", section: "auth", secret: !0, help: "Refreshable by the models token supervisor." },
      { key: "project_env", label: "Project env", placeholder: "GOOGLE_CLOUD_PROJECT", section: "advanced" },
      { key: "location_env", label: "Location env", placeholder: "VERTEX_AI_LOCATION", section: "advanced" },
      { key: "google_credentials_env", label: "Credentials env", placeholder: "GOOGLE_CREDENTIALS", section: "advanced", help: "Optional pointer to service-account JSON/base64." },
      { key: "access_token", label: "Access token", type: "password", section: "advanced", secret: !0, help: "For externally rotated tokens only." },
      { key: "access_token_env", label: "Access token env", placeholder: "GOOGLE_ACCESS_TOKEN", section: "advanced", help: "The supervisor does not refresh direct access tokens." },
      { key: "base_url", label: "Base URL override", placeholder: "https://us-central1-aiplatform.googleapis.com/v1", section: "advanced" },
      { key: "timeout", label: "Timeout", type: "number", section: "advanced" }
    ]
  },
  bedrock: {
    key: "bedrock",
    title: "AWS Bedrock",
    subtitle: "Bedrock Converse and InvokeModel through AWS SigV4.",
    defaultProviderId: "wippy.llm.bedrock:provider",
    icon: "tabler:brand-aws",
    fields: [
      { key: "region", label: "Region", placeholder: "us-east-1", section: "endpoint" },
      { key: "access_key", label: "Access key", type: "password", section: "auth", secret: !0 },
      { key: "secret_key", label: "Secret key", type: "password", section: "auth", secret: !0 },
      { key: "region_env", label: "Region env", placeholder: "AWS_REGION", section: "advanced" },
      { key: "access_key_env", label: "Access key env", placeholder: "AWS_ACCESS_KEY_ID", section: "advanced" },
      { key: "secret_key_env", label: "Secret key env", placeholder: "AWS_SECRET_ACCESS_KEY", section: "advanced" },
      { key: "session_token", label: "Session token", type: "password", section: "advanced", secret: !0 },
      { key: "session_token_env", label: "Session token env", placeholder: "AWS_SESSION_TOKEN", section: "advanced" },
      { key: "bedrock_provider", label: "Discovery provider filter", placeholder: "Anthropic", section: "advanced" },
      { key: "base_url", label: "Base URL override", placeholder: "https://bedrock.us-east-1.amazonaws.com", section: "advanced" },
      { key: "timeout", label: "Timeout", type: "number", section: "advanced" }
    ]
  }
}, Yr = {
  "kickside-model-provider-openai-compatible": "openai_compat",
  "kickside-model-provider-openai": "openai",
  "kickside-model-provider-anthropic": "anthropic",
  "kickside-model-provider-google-generative-ai": "google_genai",
  "kickside-model-provider-google-vertex": "google_vertex",
  "kickside-model-provider-bedrock": "bedrock"
};
function zd(e) {
  return e && Yr[e] || "openai_compat";
}
function _c(e) {
  return !!(e && Yr[e]);
}
function Cc(e) {
  return Xt[zd(e)];
}
const Vd = { class: "km-editor-head" }, jd = { class: "km-editor-head-text" }, Fd = { class: "km-editor-head-title" }, Nd = { class: "km-editor-head-sub" }, Md = { class: "km-form-sec" }, Rd = { class: "km-form-grid" }, Dd = {
  key: 0,
  class: "km-form-sec"
}, Bd = { class: "km-form-grid" }, Hd = {
  key: 1,
  class: "km-form-sec"
}, Ud = { class: "km-form-grid" }, Kd = ["aria-expanded"], Wd = {
  key: 2,
  class: "km-form-sec"
}, Gd = { class: "km-form-grid" }, qd = {
  key: 0,
  class: "km-spin",
  "aria-hidden": "true"
}, Yd = { class: "km-form-foot" }, Ic = /* @__PURE__ */ ve({
  __name: "ProviderProfileEditor",
  props: {
    mode: {},
    adapter: {},
    preset: {},
    profile: {},
    saving: { type: Boolean },
    testState: {},
    specKey: {}
  },
  emits: ["save", "cancel", "test"],
  setup(e, { emit: t }) {
    const n = e, r = t, o = me(() => Xt[n.specKey] ?? Xt.openai_compat), i = me(() => n.mode === "edit"), a = me(() => i.value), l = me(() => n.testState?.status === "testing"), s = me(() => o.value.fields), d = (S) => S.section ?? "endpoint", c = me(() => s.value.filter((S) => d(S) === "endpoint")), u = me(() => s.value.filter((S) => d(S) === "auth")), p = me(() => s.value.filter((S) => d(S) === "advanced")), h = B(!1), m = Zn({
      id: "",
      name: "",
      provider_id: "",
      retry_attempts: 0,
      retry_backoff_ms: 0,
      enabled: !0
    });
    function y(S, f) {
      if (S.secret) return "";
      const g = f[S.key];
      return S.type === "number" ? Number(g || 0) : g || "";
    }
    function b() {
      const S = n.profile?.config || n.preset?.config || {};
      m.id = n.profile?.id || "", m.name = n.profile?.name || n.preset?.title || o.value.title, m.provider_id = n.profile?.provider_id || n.preset?.provider_id || n.adapter?.id || o.value.defaultProviderId, m.retry_attempts = Number(S.retry?.attempts || 0), m.retry_backoff_ms = Number(S.retry?.backoff_ms || 0), m.enabled = n.profile?.enabled !== !1;
      for (const f of s.value) m[f.key] = y(f, S);
    }
    ke(() => [n.profile, n.preset, n.adapter, n.mode, n.specKey], b, { immediate: !0 });
    function k(S, f) {
      const g = m[f.key];
      if (f.secret) {
        typeof g == "string" && g.trim() && (S[f.key] = g);
        return;
      }
      if (f.type === "number") {
        const C = Number(g);
        Number.isFinite(C) && C > 0 && (S[f.key] = C);
        return;
      }
      if (typeof g == "string") {
        const C = g.trim();
        C && (S[f.key] = C);
        return;
      }
      g != null && g !== "" && (S[f.key] = g);
    }
    function _() {
      const S = {
        id: m.id || void 0,
        name: m.name,
        provider_id: m.provider_id,
        enabled: m.enabled
      };
      for (const f of s.value) k(S, f);
      S.retry = {
        attempts: Math.max(0, Math.floor(Number(m.retry_attempts) || 0)),
        backoff_ms: Math.max(0, Math.floor(Number(m.retry_backoff_ms) || 0))
      }, r("save", S);
    }
    return (S, f) => (v(), O("form", {
      class: "km-form",
      onSubmit: er(_, ["prevent"])
    }, [
      I("div", Vd, [
        R(j(Td), {
          icon: o.value.icon
        }, null, 8, ["icon"]),
        I("div", jd, [
          I("div", Fd, W(n.preset?.title || o.value.title), 1),
          I("div", Nd, W(o.value.subtitle), 1)
        ])
      ]),
      I("section", Md, [
        f[8] || (f[8] = I("div", { class: "km-form-sec-title" }, "Identity", -1)),
        I("div", Rd, [
          R(j(Pe), { label: "Name" }, {
            default: q(() => [
              R(j(Te), {
                modelValue: m.name,
                "onUpdate:modelValue": f[0] || (f[0] = (g) => m.name = g),
                disabled: n.saving
              }, null, 8, ["modelValue", "disabled"])
            ]),
            _: 1
          })
        ])
      ]),
      c.value.length ? (v(), O("section", Dd, [
        f[9] || (f[9] = I("div", { class: "km-form-sec-title" }, "Endpoint", -1)),
        I("div", Bd, [
          (v(!0), O(Se, null, He(c.value, (g) => (v(), U(j(Pe), {
            key: g.key,
            label: g.label,
            help: g.help
          }, {
            default: q(() => [
              R(j(Te), {
                modelValue: m[g.key],
                "onUpdate:modelValue": (C) => m[g.key] = C,
                type: g.type === "number" ? "number" : "text",
                placeholder: g.placeholder,
                disabled: n.saving
              }, null, 8, ["modelValue", "onUpdate:modelValue", "type", "placeholder", "disabled"])
            ]),
            _: 2
          }, 1032, ["label", "help"]))), 128))
        ])
      ])) : N("", !0),
      u.value.length ? (v(), O("section", Hd, [
        f[10] || (f[10] = I("div", { class: "km-form-sec-title" }, "Authentication", -1)),
        I("div", Ud, [
          (v(!0), O(Se, null, He(u.value, (g) => (v(), U(j(Pe), {
            key: g.key,
            label: g.label,
            help: g.help
          }, {
            default: q(() => [
              R(j(Te), {
                modelValue: m[g.key],
                "onUpdate:modelValue": (C) => m[g.key] = C,
                type: g.type === "password" ? "password" : "text",
                placeholder: g.placeholder,
                autocomplete: g.secret ? "new-password" : void 0,
                disabled: n.saving
              }, null, 8, ["modelValue", "onUpdate:modelValue", "type", "placeholder", "autocomplete", "disabled"])
            ]),
            _: 2
          }, 1032, ["label", "help"]))), 128))
        ])
      ])) : N("", !0),
      I("button", {
        type: "button",
        class: "km-adv-toggle",
        "aria-expanded": h.value,
        onClick: f[1] || (f[1] = (g) => h.value = !h.value)
      }, [
        R(j(Ue), {
          icon: h.value ? "tabler:chevron-down" : "tabler:chevron-right",
          "aria-hidden": "true"
        }, null, 8, ["icon"]),
        f[11] || (f[11] = I("span", null, "Advanced settings", -1))
      ], 8, Kd),
      h.value ? (v(), O("section", Wd, [
        I("div", Gd, [
          i.value ? N("", !0) : (v(), U(j(Pe), {
            key: 0,
            label: "ID",
            help: "Optional; generated when left blank."
          }, {
            default: q(() => [
              R(j(Te), {
                modelValue: m.id,
                "onUpdate:modelValue": f[2] || (f[2] = (g) => m.id = g),
                disabled: n.saving,
                placeholder: "auto"
              }, null, 8, ["modelValue", "disabled"])
            ]),
            _: 1
          })),
          (v(!0), O(Se, null, He(p.value, (g) => (v(), U(j(Pe), {
            key: g.key,
            label: g.label,
            help: g.help
          }, {
            default: q(() => [
              R(j(Te), {
                modelValue: m[g.key],
                "onUpdate:modelValue": (C) => m[g.key] = C,
                type: g.type === "number" ? "number" : g.type === "password" ? "password" : "text",
                placeholder: g.placeholder,
                autocomplete: g.secret ? "new-password" : void 0,
                disabled: n.saving
              }, null, 8, ["modelValue", "onUpdate:modelValue", "type", "placeholder", "autocomplete", "disabled"])
            ]),
            _: 2
          }, 1032, ["label", "help"]))), 128)),
          R(j(Pe), { label: "Retry attempts" }, {
            default: q(() => [
              R(j(Te), {
                modelValue: m.retry_attempts,
                "onUpdate:modelValue": f[3] || (f[3] = (g) => m.retry_attempts = g),
                type: "number",
                min: 0,
                disabled: n.saving
              }, null, 8, ["modelValue", "disabled"])
            ]),
            _: 1
          }),
          R(j(Pe), { label: "Retry backoff (ms)" }, {
            default: q(() => [
              R(j(Te), {
                modelValue: m.retry_backoff_ms,
                "onUpdate:modelValue": f[4] || (f[4] = (g) => m.retry_backoff_ms = g),
                type: "number",
                min: 0,
                disabled: n.saving
              }, null, 8, ["modelValue", "disabled"])
            ]),
            _: 1
          })
        ])
      ])) : N("", !0),
      i.value ? (v(), U(j(xd), {
        key: 3,
        modelValue: m.enabled,
        "onUpdate:modelValue": f[5] || (f[5] = (g) => m.enabled = g),
        label: "Enabled",
        disabled: n.saving
      }, null, 8, ["modelValue", "disabled"])) : N("", !0),
      n.testState && n.testState.status !== "idle" ? (v(), O("div", {
        key: 4,
        class: ce(["km-test-result", n.testState.status])
      }, [
        l.value ? (v(), O("span", qd)) : (v(), U(j(Ue), {
          key: 1,
          icon: n.testState.status === "ok" ? "tabler:circle-check" : "tabler:circle-x",
          "aria-hidden": "true"
        }, null, 8, ["icon"])),
        I("span", null, W(l.value ? "Testing connection…" : n.testState.message), 1)
      ], 2)) : N("", !0),
      I("div", Yd, [
        a.value ? (v(), U(j(At), {
          key: 0,
          variant: "soft",
          icon: "tabler:plug-connected",
          loading: l.value,
          disabled: n.saving,
          onClick: f[6] || (f[6] = (g) => r("test"))
        }, {
          default: q(() => [...f[12] || (f[12] = [
            ze(" Test connection ", -1)
          ])]),
          _: 1
        }, 8, ["loading", "disabled"])) : N("", !0),
        f[14] || (f[14] = I("span", { class: "km-form-foot-sp" }, null, -1)),
        R(j(At), {
          variant: "ghost",
          disabled: n.saving,
          onClick: f[7] || (f[7] = (g) => r("cancel"))
        }, {
          default: q(() => [...f[13] || (f[13] = [
            ze("Cancel", -1)
          ])]),
          _: 1
        }, 8, ["disabled"]),
        R(j(At), {
          type: "submit",
          icon: "tabler:device-floppy",
          loading: n.saving
        }, {
          default: q(() => [
            ze(W(n.saving ? "Saving" : "Save provider"), 1)
          ]),
          _: 1
        }, 8, ["loading"])
      ])
    ], 32));
  }
}), Jd = { class: "km-external-editor" }, Zd = {
  key: 0,
  class: "km-empty"
}, Qd = {
  key: 1,
  class: "km-test-result fail"
}, Pc = /* @__PURE__ */ ve({
  __name: "ExternalProviderEditor",
  props: {
    tag: {},
    mode: {},
    adapter: {},
    preset: {},
    profile: {},
    saving: { type: Boolean },
    testState: {}
  },
  emits: ["save", "cancel", "test"],
  setup(e, { emit: t }) {
    const n = e, r = t, o = B(null), i = B(!1), a = B("");
    let l = null, s = 0;
    function d(y) {
      r("save", y.detail || {});
    }
    function c() {
      r("cancel");
    }
    function u() {
      r("test");
    }
    function p() {
      l && (l.removeEventListener("save", d), l.removeEventListener("cancel", c), l.removeEventListener("test", u), l.remove(), l = null);
    }
    function h() {
      l && Object.assign(l, {
        mode: n.mode,
        adapter: n.adapter,
        preset: n.preset,
        profile: n.profile,
        saving: n.saving === !0,
        testState: n.testState
      });
    }
    async function m() {
      const y = ++s;
      if (p(), a.value = "", !(!o.value || !n.tag)) {
        i.value = !0;
        try {
          if (await Vo(n.tag, { timeoutMs: 8e3 }), y !== s || !o.value) return;
          const b = document.createElement(n.tag);
          b.addEventListener("save", d), b.addEventListener("cancel", c), b.addEventListener("test", u), l = b, h(), o.value.replaceChildren(b);
        } catch (b) {
          y === s && (a.value = b instanceof Error ? b.message : String(b));
        } finally {
          y === s && (i.value = !1);
        }
      }
    }
    return en(m), ke(() => n.tag, m), ke(() => [n.mode, n.adapter, n.preset, n.profile, n.saving, n.testState], h), Co(() => {
      s++, p();
    }), (y, b) => (v(), O("div", Jd, [
      i.value ? (v(), O("div", Zd, "Loading provider editor…")) : N("", !0),
      a.value ? (v(), O("div", Qd, [
        I("span", null, "Provider editor failed to load: " + W(a.value), 1),
        I("button", {
          type: "button",
          class: "km-adv-toggle",
          onClick: m
        }, "Retry")
      ])) : N("", !0),
      tn(I("div", {
        ref_key: "host",
        ref: o
      }, null, 512), [
        [Io, !i.value && !a.value]
      ])
    ]));
  }
});
function qe(e, t) {
  const n = e?.response?.data ?? e?.data;
  return typeof n?.error == "string" && n.error ? n.error : typeof n?.message == "string" && n.message ? n.message : e instanceof Error ? e.message : t;
}
function Tc() {
  const e = B([]), t = B([]), n = B([]), r = B([]), o = B([]), i = B(!0), a = B(!1), l = B(""), s = B(""), d = B("");
  let c = 0, u = 0;
  async function p() {
    const w = ++c;
    i.value = !0, d.value = "";
    try {
      const { data: x } = await se.get("/api/v1/models/admin");
      if (w !== c) return;
      e.value = x.adapters ?? [], t.value = x.presets ?? [], n.value = x.profiles ?? [], r.value = x.models ?? [];
    } catch (x) {
      w === c && (d.value = qe(x, "failed to load models"));
    } finally {
      w === c && (i.value = !1);
    }
  }
  async function h() {
    const w = ++u;
    try {
      const { data: x } = await se.get("/api/v1/models/classes");
      w === u && (o.value = x.classes ?? []);
    } catch {
      w === u && (o.value = []);
    }
  }
  async function m(w, x) {
    a.value = !0, d.value = "";
    try {
      return await w(), await p(), !0;
    } catch (V) {
      return d.value = qe(V, x), !1;
    } finally {
      a.value = !1;
    }
  }
  function y(w, x, V) {
    return m(async () => {
      w === "edit" ? await se.put(`/api/v1/models/provider-profiles/${encodeURIComponent(x)}`, V) : await se.post("/api/v1/models/provider-profiles", V);
    }, "failed to save profile");
  }
  function b(w) {
    return m(() => se.delete(`/api/v1/models/provider-profiles/${encodeURIComponent(w)}`).then(() => {
    }), "failed to delete profile");
  }
  function k(w) {
    return m(() => se.put("/api/v1/models/cards", w).then(() => {
    }), "failed to save model");
  }
  function _(w) {
    return w.length ? m(async () => {
      for (const x of w) await se.put("/api/v1/models/cards", x);
    }, "failed to save models") : Promise.resolve(!0);
  }
  function S(w) {
    return m(() => se.delete(`/api/v1/models/cards?name=${encodeURIComponent(w)}`).then(() => {
    }), "failed to delete model");
  }
  async function f(w) {
    l.value = w, d.value = "";
    try {
      const { data: x } = await se.post(`/api/v1/models/provider-profiles/${encodeURIComponent(w)}/discover`, {});
      return await p(), x && x.success === !1 ? (d.value = x.error || "connection failed", { ok: !1, message: d.value }) : { ok: !0, message: "Connection succeeded" };
    } catch (x) {
      return d.value = qe(x, "connection failed"), { ok: !1, message: d.value };
    } finally {
      l.value = "";
    }
  }
  async function g(w) {
    d.value = "";
    try {
      const { data: x } = await se.post(`/api/v1/models/provider-profiles/${encodeURIComponent(w)}/test`, {});
      return await p(), x && x.success === !1 ? (d.value = x.error || "connection test failed", { ok: !1, message: d.value }) : { ok: !0, message: x?.message || "Connection test succeeded" };
    } catch (x) {
      return d.value = qe(x, "connection test failed"), await p().catch(() => {
      }), { ok: !1, message: d.value };
    }
  }
  async function C(w) {
    s.value = w, d.value = "";
    try {
      const { data: x } = await se.post("/api/v1/models/cards/test", { name: w });
      if (x && x.success === !1) {
        const H = x.error || x.message || "model probe failed";
        return { ok: !1, message: H, data: { ...x, error: x.error || x.message || H } };
      }
      const V = x?.provider_model && x.provider_model !== x?.model ? ` (${x.provider_model})` : "";
      return { ok: !0, message: x?.message ? `${x.message}${V}` : `Model probe succeeded${V}`, data: x };
    } catch (x) {
      const V = qe(x, "model probe failed");
      return { ok: !1, message: V, data: { success: !1, model: w, error: V } };
    } finally {
      s.value = "";
    }
  }
  return {
    adapters: e,
    presets: t,
    profiles: n,
    models: r,
    classes: o,
    loading: i,
    saving: a,
    discovering: l,
    probing: s,
    error: d,
    load: p,
    loadClasses: h,
    saveProfile: y,
    deleteProfile: b,
    saveCard: k,
    saveCards: _,
    deleteCard: S,
    discover: f,
    testProfile: g,
    testModel: C
  };
}
const Lc = ':root{--p-form-field-padding-x: .75rem;--p-form-field-padding-y: .5rem;--p-form-field-sm-padding-x: .625rem;--p-form-field-sm-padding-y: .375rem;--p-form-field-lg-padding-x: .875rem;--p-form-field-lg-padding-y: .625rem;--p-form-field-border-radius: .375rem;--p-form-field-transition-duration: .2s;--p-form-field-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), 0 1px 2px 0 rgba(18, 18, 23, .05);--p-focus-ring-width: 1px;--p-focus-ring-style: solid;--p-focus-ring-color: color-mix(in srgb, var(--p-primary-color) 100%, transparent);--p-focus-ring-offset: 2px;--p-toggleswitch-width: 2.5rem;--p-toggleswitch-height: 1.5rem;--p-toggleswitch-border-radius: 30px;--p-toggleswitch-gap: .25rem;--p-toggleswitch-border-width: 1px;--p-toggleswitch-transition-duration: .2s;--p-toggleswitch-slide-duration: .2s;--p-toggleswitch-handle-size: 1rem;--p-toggleswitch-handle-border-radius: 9999px}:root{color-scheme:light dark;--p-primary: rgb(0, 95, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-secondary: #6f7385;--p-secondary-50: color-mix(in srgb, var(--p-secondary) 5%, white);--p-secondary-100: color-mix(in srgb, var(--p-secondary) 10%, white);--p-secondary-200: color-mix(in srgb, var(--p-secondary) 20%, white);--p-secondary-300: color-mix(in srgb, var(--p-secondary) 35%, white);--p-secondary-400: color-mix(in srgb, var(--p-secondary) 65%, white);--p-secondary-500: var(--p-secondary);--p-secondary-600: color-mix(in srgb, var(--p-secondary) 80%, black);--p-secondary-700: color-mix(in srgb, var(--p-secondary) 65%, black);--p-secondary-800: color-mix(in srgb, var(--p-secondary) 55%, black);--p-secondary-900: color-mix(in srgb, var(--p-secondary) 50%, black);--p-secondary-950: color-mix(in srgb, var(--p-secondary) 30%, black);--p-danger: rgb(239, 68, 68);--p-danger-50: color-mix(in srgb, var(--p-danger) 5%, white);--p-danger-100: color-mix(in srgb, var(--p-danger) 10%, white);--p-danger-200: color-mix(in srgb, var(--p-danger) 20%, white);--p-danger-300: color-mix(in srgb, var(--p-danger) 30%, white);--p-danger-400: color-mix(in srgb, var(--p-danger) 40%, white);--p-danger-500: var(--p-danger);--p-danger-600: color-mix(in srgb, var(--p-danger) 80%, black);--p-danger-700: color-mix(in srgb, var(--p-danger) 70%, black);--p-danger-800: color-mix(in srgb, var(--p-danger) 60%, black);--p-danger-900: color-mix(in srgb, var(--p-danger) 50%, black);--p-danger-950: color-mix(in srgb, var(--p-danger) 40%, black);--p-success: rgb(34, 197, 94);--p-success-50: color-mix(in srgb, var(--p-success) 5%, white);--p-success-100: color-mix(in srgb, var(--p-success) 10%, white);--p-success-200: color-mix(in srgb, var(--p-success) 20%, white);--p-success-300: color-mix(in srgb, var(--p-success) 30%, white);--p-success-400: color-mix(in srgb, var(--p-success) 40%, white);--p-success-500: var(--p-success);--p-success-600: color-mix(in srgb, var(--p-success) 80%, black);--p-success-700: color-mix(in srgb, var(--p-success) 70%, black);--p-success-800: color-mix(in srgb, var(--p-success) 60%, black);--p-success-900: color-mix(in srgb, var(--p-success) 50%, black);--p-success-950: color-mix(in srgb, var(--p-success) 40%, black);--p-warn: rgb(249, 115, 22);--p-warn-50: color-mix(in srgb, var(--p-warn) 5%, white);--p-warn-100: color-mix(in srgb, var(--p-warn) 10%, white);--p-warn-200: color-mix(in srgb, var(--p-warn) 20%, white);--p-warn-300: color-mix(in srgb, var(--p-warn) 30%, white);--p-warn-400: color-mix(in srgb, var(--p-warn) 40%, white);--p-warn-500: var(--p-warn);--p-warn-600: color-mix(in srgb, var(--p-warn) 80%, black);--p-warn-700: color-mix(in srgb, var(--p-warn) 70%, black);--p-warn-800: color-mix(in srgb, var(--p-warn) 60%, black);--p-warn-900: color-mix(in srgb, var(--p-warn) 50%, black);--p-warn-950: color-mix(in srgb, var(--p-warn) 40%, black);--p-info: rgb(14, 165, 233);--p-info-50: color-mix(in srgb, var(--p-info) 5%, white);--p-info-100: color-mix(in srgb, var(--p-info) 10%, white);--p-info-200: color-mix(in srgb, var(--p-info) 20%, white);--p-info-300: color-mix(in srgb, var(--p-info) 30%, white);--p-info-400: color-mix(in srgb, var(--p-info) 40%, white);--p-info-500: var(--p-info);--p-info-600: color-mix(in srgb, var(--p-info) 80%, black);--p-info-700: color-mix(in srgb, var(--p-info) 70%, black);--p-info-800: color-mix(in srgb, var(--p-info) 60%, black);--p-info-900: color-mix(in srgb, var(--p-info) 50%, black);--p-info-950: color-mix(in srgb, var(--p-info) 40%, black);--p-help: rgb(168, 85, 247);--p-help-50: color-mix(in srgb, var(--p-help) 5%, white);--p-help-100: color-mix(in srgb, var(--p-help) 10%, white);--p-help-200: color-mix(in srgb, var(--p-help) 20%, white);--p-help-300: color-mix(in srgb, var(--p-help) 30%, white);--p-help-400: color-mix(in srgb, var(--p-help) 40%, white);--p-help-500: var(--p-help);--p-help-600: color-mix(in srgb, var(--p-help) 80%, black);--p-help-700: color-mix(in srgb, var(--p-help) 70%, black);--p-help-800: color-mix(in srgb, var(--p-help) 60%, black);--p-help-900: color-mix(in srgb, var(--p-help) 50%, black);--p-help-950: color-mix(in srgb, var(--p-help) 40%, black);--p-accent: rgb(20, 184, 166);--p-accent-50: color-mix(in srgb, var(--p-accent) 5%, white);--p-accent-100: color-mix(in srgb, var(--p-accent) 10%, white);--p-accent-200: color-mix(in srgb, var(--p-accent) 20%, white);--p-accent-300: color-mix(in srgb, var(--p-accent) 30%, white);--p-accent-400: color-mix(in srgb, var(--p-accent) 40%, white);--p-accent-500: var(--p-accent);--p-accent-600: color-mix(in srgb, var(--p-accent) 80%, black);--p-accent-700: color-mix(in srgb, var(--p-accent) 70%, black);--p-accent-800: color-mix(in srgb, var(--p-accent) 60%, black);--p-accent-900: color-mix(in srgb, var(--p-accent) 50%, black);--p-accent-950: color-mix(in srgb, var(--p-accent) 40%, black);--p-surface-0: #ffffff;--p-surface-50: #fafafa;--p-surface-100: #f5f5f5;--p-surface-200: #e5e5e5;--p-surface-300: #d4d4d4;--p-surface-400: #a3a3a3;--p-surface-500: #737373;--p-surface-600: #525252;--p-surface-700: #404040;--p-surface-800: #262626;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #171717;--p-surface-950: #0a0a0a;--p-content-border-radius: 6px;--p-font-heading-family: var(--v-font-family-head, Arial);--p-font-heading-scale: 1;--p-font-heading-line-height: 1.5;--p-font-heading-letter-spacing: normal;--p-font-heading-stretch: normal;--p-font-heading-variation-settings: normal;--p-font-body-scale: 1;--p-font-body-line-height: 1.5;--p-font-body-letter-spacing: normal;--p-font-body-stretch: normal;--p-font-body-variation-settings: normal;--p-font-mono-family: ui-monospace}:root{--p-primary-color: var(--p-primary-500);--p-primary-contrast-color: var(--p-surface-0);--p-primary-hover-color: var(--p-primary-600);--p-primary-active-color: var(--p-primary-700);--p-secondary-color: var(--p-secondary-500);--p-secondary-contrast-color: var(--p-surface-0);--p-secondary-hover-color: var(--p-secondary-600);--p-secondary-active-color: var(--p-secondary-700);--p-danger-color: var(--p-danger-500);--p-danger-contrast-color: var(--p-surface-0);--p-danger-hover-color: var(--p-danger-600);--p-danger-active-color: var(--p-danger-700);--p-success-color: var(--p-success-500);--p-success-contrast-color: var(--p-surface-0);--p-success-hover-color: var(--p-success-600);--p-success-active-color: var(--p-success-700);--p-warn-color: var(--p-warn-500);--p-warn-contrast-color: var(--p-surface-0);--p-warn-hover-color: var(--p-warn-600);--p-warn-active-color: var(--p-warn-700);--p-info-color: var(--p-info-500);--p-info-contrast-color: var(--p-surface-0);--p-info-hover-color: var(--p-info-600);--p-info-active-color: var(--p-info-700);--p-help-color: var(--p-help-500);--p-help-contrast-color: var(--p-surface-0);--p-help-hover-color: var(--p-help-600);--p-help-active-color: var(--p-help-700);--p-accent-color: var(--p-accent-500);--p-accent-contrast-color: var(--p-surface-0);--p-accent-hover-color: var(--p-accent-600);--p-accent-active-color: var(--p-accent-700);--p-content-border-color: var(--p-surface-200);--p-content-hover-background: var(--p-surface-100);--p-content-hover-color: var(--p-surface-800);--p-highlight-background: var(--p-primary-50);--p-highlight-color: var(--p-primary-700);--p-highlight-focus-background: var(--p-primary-100);--p-highlight-focus-color: var(--p-primary-800);--p-content-background: var(--p-surface-0);--p-text-color: var(--p-surface-700);--p-text-hover-color: var(--p-surface-800);--p-text-muted-color: var(--p-surface-500);--p-text-hover-muted-color: var(--p-surface-600)}@media(prefers-color-scheme:dark){:root:not(.w-theme-light){--p-surface-D: #fff;--p-surface-0: #fff;--p-surface-50: #fafafa;--p-surface-100: #f4f4f5;--p-surface-200: #e4e4e7;--p-surface-300: #d4d4d8;--p-surface-400: #a1a1aa;--p-surface-500: #71717a;--p-surface-600: #545250;--p-surface-700: #403e3c;--p-surface-800: #2b2927;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #1c1a19;--p-surface-950: #0f0e0d;--p-primary: rgb(0, 125, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-primary-color: var(--p-primary-400);--p-primary-contrast-color: var(--p-surface-900);--p-primary-hover-color: var(--p-primary-300);--p-primary-active-color: var(--p-primary-200);--p-secondary-color: var(--p-secondary-400);--p-secondary-contrast-color: var(--p-surface-900);--p-secondary-hover-color: var(--p-secondary-300);--p-secondary-active-color: var(--p-secondary-200);--p-danger-color: var(--p-danger-400);--p-danger-contrast-color: var(--p-surface-900);--p-danger-hover-color: var(--p-danger-300);--p-danger-active-color: var(--p-danger-200);--p-success-color: var(--p-success-400);--p-success-contrast-color: var(--p-surface-900);--p-success-hover-color: var(--p-success-300);--p-success-active-color: var(--p-success-200);--p-warn-color: var(--p-warn-400);--p-warn-contrast-color: var(--p-surface-900);--p-warn-hover-color: var(--p-warn-300);--p-warn-active-color: var(--p-warn-200);--p-info-color: var(--p-info-400);--p-info-contrast-color: var(--p-surface-900);--p-info-hover-color: var(--p-info-300);--p-info-active-color: var(--p-info-200);--p-help-color: var(--p-help-400);--p-help-contrast-color: var(--p-surface-900);--p-help-hover-color: var(--p-help-300);--p-help-active-color: var(--p-help-200);--p-accent-color: var(--p-accent-400);--p-accent-contrast-color: var(--p-surface-900);--p-accent-hover-color: var(--p-accent-300);--p-accent-active-color: var(--p-accent-200);--p-content-border-color: var(--p-surface-700);--p-content-hover-background: var(--p-surface-800);--p-content-hover-color: var(--p-surface-0);--p-highlight-background: color-mix(in srgb, var(--p-primary-400), transparent 84%);--p-highlight-color: rgba(255, 255, 255, 87%);--p-highlight-focus-background: color-mix(in srgb, var(--p-primary-400), transparent 76%);--p-highlight-focus-color: rgba(255, 255, 255, 87%);--p-content-background: var(--p-surface-900);--p-text-color: var(--p-surface-0);--p-text-hover-color: var(--p-surface-0);--p-text-muted-color: var(--p-surface-400);--p-text-hover-muted-color: var(--p-surface-300)}}:root.w-theme-dark,.w-theme-dark{color-scheme:dark;--p-surface-D: #fff;--p-surface-0: #fff;--p-surface-50: #fafafa;--p-surface-100: #f4f4f5;--p-surface-200: #e4e4e7;--p-surface-300: #d4d4d8;--p-surface-400: #a1a1aa;--p-surface-500: #71717a;--p-surface-600: #545250;--p-surface-700: #403e3c;--p-surface-800: #2b2927;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #1c1a19;--p-surface-950: #0f0e0d;--p-primary: rgb(0, 125, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-primary-color: var(--p-primary-400);--p-primary-contrast-color: var(--p-surface-900);--p-primary-hover-color: var(--p-primary-300);--p-primary-active-color: var(--p-primary-200);--p-secondary-color: var(--p-secondary-400);--p-secondary-contrast-color: var(--p-surface-900);--p-secondary-hover-color: var(--p-secondary-300);--p-secondary-active-color: var(--p-secondary-200);--p-danger-color: var(--p-danger-400);--p-danger-contrast-color: var(--p-surface-900);--p-danger-hover-color: var(--p-danger-300);--p-danger-active-color: var(--p-danger-200);--p-success-color: var(--p-success-400);--p-success-contrast-color: var(--p-surface-900);--p-success-hover-color: var(--p-success-300);--p-success-active-color: var(--p-success-200);--p-warn-color: var(--p-warn-400);--p-warn-contrast-color: var(--p-surface-900);--p-warn-hover-color: var(--p-warn-300);--p-warn-active-color: var(--p-warn-200);--p-info-color: var(--p-info-400);--p-info-contrast-color: var(--p-surface-900);--p-info-hover-color: var(--p-info-300);--p-info-active-color: var(--p-info-200);--p-help-color: var(--p-help-400);--p-help-contrast-color: var(--p-surface-900);--p-help-hover-color: var(--p-help-300);--p-help-active-color: var(--p-help-200);--p-accent-color: var(--p-accent-400);--p-accent-contrast-color: var(--p-surface-900);--p-accent-hover-color: var(--p-accent-300);--p-accent-active-color: var(--p-accent-200);--p-content-border-color: var(--p-surface-700);--p-content-hover-background: var(--p-surface-800);--p-content-hover-color: var(--p-surface-0);--p-highlight-background: color-mix(in srgb, var(--p-primary-400), transparent 84%);--p-highlight-color: rgba(255, 255, 255, 87%);--p-highlight-focus-background: color-mix(in srgb, var(--p-primary-400), transparent 76%);--p-highlight-focus-color: rgba(255, 255, 255, 87%);--p-content-background: var(--p-surface-900);--p-text-color: var(--p-surface-0);--p-text-hover-color: var(--p-surface-0);--p-text-muted-color: var(--p-surface-400);--p-text-hover-muted-color: var(--p-surface-300)}:root.w-theme-light,.w-theme-light{color-scheme:light;--p-surface-0: #ffffff;--p-surface-50: #fafafa;--p-surface-100: #f5f5f5;--p-surface-200: #e5e5e5;--p-surface-300: #d4d4d4;--p-surface-400: #a3a3a3;--p-surface-500: #737373;--p-surface-600: #525252;--p-surface-700: #404040;--p-surface-800: #262626;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #171717;--p-surface-950: #0a0a0a;--p-primary: rgb(0, 95, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-primary-color: var(--p-primary-500);--p-primary-contrast-color: var(--p-surface-0);--p-primary-hover-color: var(--p-primary-600);--p-primary-active-color: var(--p-primary-700);--p-secondary-color: var(--p-secondary-500);--p-secondary-contrast-color: var(--p-surface-0);--p-secondary-hover-color: var(--p-secondary-600);--p-secondary-active-color: var(--p-secondary-700);--p-danger-color: var(--p-danger-500);--p-danger-contrast-color: var(--p-surface-0);--p-danger-hover-color: var(--p-danger-600);--p-danger-active-color: var(--p-danger-700);--p-success-color: var(--p-success-500);--p-success-contrast-color: var(--p-surface-0);--p-success-hover-color: var(--p-success-600);--p-success-active-color: var(--p-success-700);--p-warn-color: var(--p-warn-500);--p-warn-contrast-color: var(--p-surface-0);--p-warn-hover-color: var(--p-warn-600);--p-warn-active-color: var(--p-warn-700);--p-info-color: var(--p-info-500);--p-info-contrast-color: var(--p-surface-0);--p-info-hover-color: var(--p-info-600);--p-info-active-color: var(--p-info-700);--p-help-color: var(--p-help-500);--p-help-contrast-color: var(--p-surface-0);--p-help-hover-color: var(--p-help-600);--p-help-active-color: var(--p-help-700);--p-accent-color: var(--p-accent-500);--p-accent-contrast-color: var(--p-surface-0);--p-accent-hover-color: var(--p-accent-600);--p-accent-active-color: var(--p-accent-700);--p-content-border-color: var(--p-surface-200);--p-content-hover-background: var(--p-surface-100);--p-content-hover-color: var(--p-surface-800);--p-highlight-background: var(--p-primary-50);--p-highlight-color: var(--p-primary-700);--p-highlight-focus-background: var(--p-primary-100);--p-highlight-focus-color: var(--p-primary-800);--p-content-background: var(--p-surface-0);--p-text-color: var(--p-surface-700);--p-text-hover-color: var(--p-surface-800);--p-text-muted-color: var(--p-surface-500);--p-text-hover-muted-color: var(--p-surface-600)}.spin{animation:kx-spin 1s linear infinite}@keyframes kx-spin{to{transform:rotate(360deg)}}@media(prefers-reduced-motion:reduce){.spin{animation:none}}.kx-tag-sm,.kx-tag-sm.kx-tag-sm{display:inline-flex;align-items:center;gap:4px;padding:1px 7px;border-radius:var(--kx-radius-tag, 6px);font-size:10.5px;font-weight:600;line-height:1.5;white-space:nowrap}.kx-tag-sm svg,.kx-tag-sm.kx-tag-sm svg{width:12px;height:12px}.kx-tag-caps,.kx-tag-caps.kx-tag-caps{display:inline-flex;align-items:center;gap:3px;padding:2px 6px;border-radius:var(--kx-radius-tag, 6px);font-size:9px;font-weight:700;line-height:1.5;letter-spacing:.04em;text-transform:uppercase;white-space:nowrap}.kx-tag-caps svg,.kx-tag-caps.kx-tag-caps svg{width:11px;height:11px}:host,:root{--kx-surface-1: color-mix(in srgb, var(--p-content-background) 96%, var(--p-text-color) 4%);--kx-surface-2: color-mix(in srgb, var(--p-content-background) 92%, var(--p-text-color) 8%);--kx-surface-3: color-mix(in srgb, var(--p-content-background) 86%, var(--p-text-color) 14%);--kx-surface-4: color-mix(in srgb, var(--p-content-background) 78%, var(--p-text-color) 22%);--kx-border-strong: color-mix(in srgb, var(--p-content-border-color) 60%, var(--p-text-color) 40%);--kx-border-stronger: color-mix(in srgb, var(--p-content-border-color) 30%, var(--p-text-color) 70%);--kx-text-faint: color-mix(in srgb, var(--p-text-muted-color) 70%, var(--p-content-background) 30%);--kx-text-fainter: color-mix(in srgb, var(--p-text-muted-color) 45%, var(--p-content-background) 55%);--kx-wash-primary: color-mix(in srgb, var(--p-primary-color) 12%, var(--p-content-background) 88%);--kx-wash-success: color-mix(in srgb, var(--p-success-500) 12%, var(--p-content-background) 88%);--kx-wash-info: color-mix(in srgb, var(--p-info-500) 12%, var(--p-content-background) 88%);--kx-wash-warn: color-mix(in srgb, var(--p-warn-500) 12%, var(--p-content-background) 88%);--kx-wash-danger: color-mix(in srgb, var(--p-danger-500) 12%, var(--p-content-background) 88%);--kx-wash-help: color-mix(in srgb, var(--p-help-500) 12%, var(--p-content-background) 88%);--kx-font-heading: "Outfit", system-ui, sans-serif;--kx-font-body: "Inter", system-ui, sans-serif;--kx-radius-4: 4px;--kx-radius-6: 6px;--kx-radius-8: 8px;--kx-radius-10: 10px;--kx-radius-14: 14px;--kx-radius-16: 16px;--kx-radius-tag: var(--p-content-border-radius, 6px);--kx-control-height: 34px;--kx-shadow-sm: 0 1px 2px rgba(0, 0, 0, .08);--kx-shadow-md: 0 4px 24px rgba(0, 0, 0, .12);--kx-shadow-lg: 0 16px 60px rgba(0, 0, 0, .18);--kx-overlay-hover: color-mix(in srgb, var(--p-text-color) 7%, transparent);--kx-overlay-subtle: color-mix(in srgb, var(--p-text-color) 4%, transparent)}@media(prefers-color-scheme:dark){:host(:not(.w-theme-light)),:root:not(.w-theme-light){--kx-shadow-sm: 0 1px 2px rgba(0, 0, 0, .35);--kx-shadow-md: 0 4px 24px rgba(0, 0, 0, .45);--kx-shadow-lg: 0 16px 60px rgba(0, 0, 0, .6)}}:host(.w-theme-dark),:root.w-theme-dark{--kx-shadow-sm: 0 1px 2px rgba(0, 0, 0, .35);--kx-shadow-md: 0 4px 24px rgba(0, 0, 0, .45);--kx-shadow-lg: 0 16px 60px rgba(0, 0, 0, .6)}*,:before,:after{--tw-border-spacing-x: 0;--tw-border-spacing-y: 0;--tw-translate-x: 0;--tw-translate-y: 0;--tw-rotate: 0;--tw-skew-x: 0;--tw-skew-y: 0;--tw-scale-x: 1;--tw-scale-y: 1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness: proximity;--tw-gradient-from-position: ;--tw-gradient-via-position: ;--tw-gradient-to-position: ;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width: 0px;--tw-ring-offset-color: #fff;--tw-ring-color: rgb(59 130 246 / .5);--tw-ring-offset-shadow: 0 0 #0000;--tw-ring-shadow: 0 0 #0000;--tw-shadow: 0 0 #0000;--tw-shadow-colored: 0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: ;--tw-contain-size: ;--tw-contain-layout: ;--tw-contain-paint: ;--tw-contain-style: }::backdrop{--tw-border-spacing-x: 0;--tw-border-spacing-y: 0;--tw-translate-x: 0;--tw-translate-y: 0;--tw-rotate: 0;--tw-skew-x: 0;--tw-skew-y: 0;--tw-scale-x: 1;--tw-scale-y: 1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness: proximity;--tw-gradient-from-position: ;--tw-gradient-via-position: ;--tw-gradient-to-position: ;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width: 0px;--tw-ring-offset-color: #fff;--tw-ring-color: rgb(59 130 246 / .5);--tw-ring-offset-shadow: 0 0 #0000;--tw-ring-shadow: 0 0 #0000;--tw-shadow: 0 0 #0000;--tw-shadow-colored: 0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: ;--tw-contain-size: ;--tw-contain-layout: ;--tw-contain-paint: ;--tw-contain-style: }*,:before,:after{box-sizing:border-box;border-width:0;border-style:solid;border-color:#e5e7eb}:before,:after{--tw-content: ""}html,:host{line-height:1.5;-webkit-text-size-adjust:100%;-moz-tab-size:4;tab-size:4;font-family:ui-sans-serif,system-ui,sans-serif,"Apple Color Emoji","Segoe UI Emoji",Segoe UI Symbol,"Noto Color Emoji";font-feature-settings:normal;font-variation-settings:normal;-webkit-tap-highlight-color:transparent}body{margin:0;line-height:inherit}hr{height:0;color:inherit;border-top-width:1px}abbr:where([title]){text-decoration:underline dotted}h1,h2,h3,h4,h5,h6{font-size:inherit;font-weight:inherit}a{color:inherit;text-decoration:inherit}b,strong{font-weight:bolder}code,kbd,samp,pre{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace;font-feature-settings:normal;font-variation-settings:normal;font-size:1em}small{font-size:80%}sub,sup{font-size:75%;line-height:0;position:relative;vertical-align:baseline}sub{bottom:-.25em}sup{top:-.5em}table{text-indent:0;border-color:inherit;border-collapse:collapse}button,input,optgroup,select,textarea{font-family:inherit;font-feature-settings:inherit;font-variation-settings:inherit;font-size:100%;font-weight:inherit;line-height:inherit;letter-spacing:inherit;color:inherit;margin:0;padding:0}button,select{text-transform:none}button,input:where([type=button]),input:where([type=reset]),input:where([type=submit]){-webkit-appearance:button;background-color:transparent;background-image:none}:-moz-focusring{outline:auto}:-moz-ui-invalid{box-shadow:none}progress{vertical-align:baseline}::-webkit-inner-spin-button,::-webkit-outer-spin-button{height:auto}[type=search]{-webkit-appearance:textfield;outline-offset:-2px}::-webkit-search-decoration{-webkit-appearance:none}::-webkit-file-upload-button{-webkit-appearance:button;font:inherit}summary{display:list-item}blockquote,dl,dd,h1,h2,h3,h4,h5,h6,hr,figure,p,pre{margin:0}fieldset{margin:0;padding:0}legend{padding:0}ol,ul,menu{list-style:none;margin:0;padding:0}dialog{padding:0}textarea{resize:vertical}input::placeholder,textarea::placeholder{opacity:1;color:#9ca3af}button,[role=button]{cursor:pointer}:disabled{cursor:default}img,svg,video,canvas,audio,iframe,embed,object{display:block;vertical-align:middle}img,video{max-width:100%;height:auto}[hidden]:where(:not([hidden=until-found])){display:none}@supports (-moz-appearance:none){*{scrollbar-color:initial;scrollbar-width:initial}}:host{display:block;height:100%;min-height:0;--km-rail-w: 296px;--system-surface-gutter: var(--kickside-system-surface-gutter, 24px)}:host>div{height:100%;min-height:0}*,*:before,*:after{box-sizing:border-box}.km{height:100%;min-height:0;display:flex;flex-direction:column;background:var(--p-content-background);color:var(--p-text-color);font-family:inherit}.km-top-notice{width:calc(100% - (var(--system-surface-gutter) * 2));margin:12px 0 0 var(--system-surface-gutter)}.km-shell{flex:1;min-height:0;width:100%;margin:0;display:grid;grid-template-columns:var(--km-rail-w) minmax(0,1fr);border-left:1px solid var(--p-content-border-color);border-right:1px solid var(--p-content-border-color)}.km-rail{min-width:0;min-height:0;display:flex;flex-direction:column;border-right:1px solid var(--p-content-border-color)}.km-rail-body{flex:1;min-height:0;overflow:auto;padding:6px}.km-main{min-width:0;min-height:0;display:flex;flex-direction:column;overflow:hidden}.km-railhead{flex:0 0 auto;display:flex;align-items:center;justify-content:space-between;gap:8px;min-height:48px;padding:0 8px 0 14px;border-bottom:1px solid var(--p-content-border-color)}.km-railhead-title{display:inline-flex;align-items:center;gap:7px;font-size:12px;font-weight:760;letter-spacing:.03em;text-transform:uppercase;color:var(--p-text-muted-color)}.km-railhead-title b{min-width:18px;padding:1px 6px;border-radius:999px;background:var(--kx-overlay-subtle);color:var(--p-text-color);font-size:11px;font-weight:700;text-align:center}.km-railhead-acts{display:inline-flex;align-items:center;gap:2px}.km-input{width:100%;min-width:0;height:34px;padding:0 10px;border:1px solid var(--p-content-border-color);border-radius:var(--kx-radius-8);background:var(--p-content-background);color:var(--p-text-color);font:inherit;font-size:13px}.km-input:read-only{color:var(--p-text-muted-color);background:var(--kx-overlay-subtle)}.km-input:disabled{opacity:.6}.km-input.mono{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}.km-textarea{height:auto;min-height:120px;padding:9px 10px;line-height:1.45;resize:vertical}.km-search{position:relative;display:flex;align-items:center;min-width:0}.km-search-ico{position:absolute;left:9px;width:16px;height:16px;color:var(--p-text-muted-color);pointer-events:none}.km-search-input{width:100%;height:34px;padding:0 30px;border:1px solid var(--p-content-border-color);border-radius:var(--kx-radius-8);background:var(--p-content-background);color:var(--p-text-color);font:inherit;font-size:13px}.km-search-clear{position:absolute;right:6px;width:22px;height:22px;display:inline-flex;align-items:center;justify-content:center;border:0;border-radius:6px;background:transparent;color:var(--p-text-muted-color);cursor:pointer}.km-search-clear:hover{color:var(--p-text-color);background:var(--kx-overlay-hover)}.km-search-clear svg{width:14px;height:14px}.km-select{min-width:0}.km-field{min-width:0;display:flex;flex-direction:column;gap:5px}.km-field-label{color:var(--p-text-muted-color);font-size:11.5px;font-weight:680}.km-field-help{color:var(--p-text-muted-color);font-size:11.5px;line-height:1.35}.km-switch{display:inline-flex;align-items:center;gap:9px;cursor:pointer;user-select:none}.km-switch.disabled{opacity:.5;cursor:default}.km-switch-label{font-size:13px;color:var(--p-text-color)}.km-pill{max-width:190px;overflow:hidden;text-overflow:ellipsis}.km-pill-dot{width:6px;height:6px;border-radius:50%;background:currentColor}.km-prow-dot.secondary{background:color-mix(in srgb,var(--p-text-color) 35%,transparent)}.km-prow-dot.success{background:var(--p-success-500)}.km-prow-dot.danger{background:var(--p-danger-500)}.km-prow-dot.warn{background:var(--p-warn-500)}.km-prow-dot.info{background:var(--p-info-500)}.km-prow-dot.accent{background:var(--p-primary-color)}.km-notice{display:flex;align-items:center;gap:9px;padding:9px 10px 9px 12px;border:1px solid var(--p-content-border-color);border-radius:var(--kx-radius-8);font-size:13px}.km-notice svg{width:17px;height:17px;flex:0 0 auto}.km-notice-text{flex:1;min-width:0}.km-notice.is-info{color:var(--p-text-color);background:var(--kx-overlay-subtle)}.km-notice.is-danger{color:var(--p-danger-600, var(--p-danger-500));border-color:color-mix(in srgb,var(--p-danger-500) 32%,var(--p-content-border-color));background:color-mix(in srgb,var(--p-danger-500) 9%,transparent)}.km-notice-x{width:24px;height:24px;display:inline-flex;align-items:center;justify-content:center;border:0;border-radius:6px;background:transparent;color:inherit;cursor:pointer;opacity:.7}.km-notice-x:hover{opacity:1;background:color-mix(in srgb,currentColor 12%,transparent)}.km-notice-x svg{width:14px;height:14px}.km-loading{display:flex;align-items:center;justify-content:center;gap:9px;padding:40px 20px;color:var(--p-text-muted-color);font-size:13px}.km-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;padding:48px 24px;text-align:center}.km-empty-ico{width:30px;height:30px;color:var(--p-text-muted-color)}.km-empty-title{font-size:14px;font-weight:720}.km-empty-hint{margin:0;max-width:340px;color:var(--p-text-muted-color);font-size:12.5px;line-height:1.45}.km-empty .p-button{margin-top:4px}.km-avatar{width:32px;height:32px;flex:0 0 auto;display:inline-flex;align-items:center;justify-content:center;border-radius:var(--kx-radius-8);color:var(--p-primary-color);background:color-mix(in srgb,var(--p-primary-color) 12%,transparent)}.km-avatar svg{width:18px;height:18px}.km-avatar.sm{width:26px;height:26px;border-radius:8px}.km-avatar.sm svg{width:15px;height:15px}.km-avatar.lg{width:40px;height:40px}.km-avatar.lg svg{width:22px;height:22px}.km-plist{display:flex;flex-direction:column;gap:2px}.km-plist-all{width:100%;height:32px;display:flex;align-items:center;padding:0 10px;border:0;border-radius:var(--kx-radius-8);background:transparent;color:var(--p-text-muted-color);font:inherit;font-size:12.5px;font-weight:640;text-align:left;cursor:pointer}.km-plist-all:hover{background:var(--kx-overlay-hover);color:var(--p-text-color)}.km-plist-all.on{background:color-mix(in srgb,var(--p-primary-color) 12%,transparent);color:var(--p-primary-color)}.km-plist-empty{display:flex;flex-direction:column;align-items:flex-start;gap:8px;padding:10px;color:var(--p-text-muted-color);font-size:12.5px}.km-plist-empty p{margin:0}.km-prow{position:relative;display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:center;border-radius:var(--kx-radius-8)}.km-prow:hover{background:var(--kx-overlay-hover)}.km-prow.on{background:color-mix(in srgb,var(--p-primary-color) 11%,transparent)}.km-prow.on:before{content:"";position:absolute;left:0;top:7px;bottom:7px;width:3px;border-radius:0 999px 999px 0;background:var(--p-primary-color)}.km-prow-main{min-width:0;display:grid;grid-template-columns:26px minmax(0,1fr) auto;align-items:center;gap:9px;padding:7px 8px 7px 10px;border:0;background:transparent;color:inherit;font:inherit;text-align:left;cursor:pointer}.km-prow-text{min-width:0}.km-prow-name{display:flex;align-items:center;gap:6px;min-width:0;font-size:13px;font-weight:640;line-height:1.25}.km-prow-name>:first-child{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.km-prow-dot{width:7px;height:7px;flex:0 0 auto;border-radius:50%}.km-prow-cred{width:13px;height:13px;flex:0 0 auto;color:var(--p-text-muted-color)}.km-prow-sub{display:block;margin-top:1px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--p-text-muted-color);font-size:11.5px;line-height:1.3}.km-prow-acts{display:flex;align-items:center;gap:1px;padding-right:6px;opacity:0;transition:opacity .12s ease}.km-prow:hover .km-prow-acts,.km-prow:focus-within .km-prow-acts{opacity:1}.km-prow-msg{grid-column:1 / -1;padding:0 10px 7px 45px;margin-top:-4px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--p-text-muted-color);font-size:11px}.km-picker{display:flex;flex-direction:column;gap:18px}.km-picker-sec{display:flex;flex-direction:column;gap:7px}.km-picker-sec-title{color:var(--p-text-muted-color);font-size:11px;font-weight:760;letter-spacing:.03em;text-transform:uppercase}.km-picker-list{display:flex;flex-direction:column;gap:4px}.km-picker-item{display:grid;grid-template-columns:32px minmax(0,1fr) 16px;align-items:center;gap:11px;padding:9px 10px;border:1px solid var(--p-content-border-color);border-radius:var(--kx-radius-8);background:transparent;color:var(--p-text-color);font:inherit;text-align:left;cursor:pointer;transition:border-color .12s ease,background-color .12s ease}.km-picker-item:hover{border-color:color-mix(in srgb,var(--p-primary-color) 50%,var(--p-content-border-color));background:var(--kx-overlay-hover)}.km-picker-ico{width:32px;height:32px;display:inline-flex;align-items:center;justify-content:center;border-radius:var(--kx-radius-8);color:var(--p-primary-color);background:color-mix(in srgb,var(--p-primary-color) 11%,transparent)}.km-picker-ico svg{width:18px;height:18px}.km-picker-body{min-width:0;display:flex;flex-direction:column;gap:2px}.km-picker-name{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:13px;font-weight:660}.km-picker-desc{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--p-text-muted-color);font-size:11.5px}.km-picker-go{width:16px;height:16px;color:var(--p-text-muted-color)}.km-pool{flex:1;min-height:0;display:flex;flex-direction:column;--km-cols: 32px minmax(0, 1.3fr) minmax(0, 1.75fr) 76px 122px}.km-pool-head{flex:0 0 auto;display:flex;flex-direction:column;gap:10px;padding:12px 16px;border-bottom:1px solid var(--p-content-border-color)}.km-pool-head-top{display:flex;align-items:center;justify-content:space-between;gap:14px;flex-wrap:wrap}.km-pool-title{display:flex;align-items:center;gap:10px;font-size:14px;font-weight:760}.km-pool-counts{display:inline-flex;align-items:center;gap:5px}.km-pool-head-top .km-search{width:min(280px,42vw)}.km-pool-filters{display:grid;grid-template-columns:repeat(5,minmax(0,1fr)) auto;gap:8px;align-items:center}.km-pool-body{flex:1;min-height:0;display:flex;align-items:center;justify-content:center}.km-pool-table{flex:1;min-height:0;overflow:auto}.km-pool-more{display:flex;justify-content:center;padding:16px}.km-pool-cols{position:sticky;top:0;z-index:1;display:grid;grid-template-columns:var(--km-cols);gap:13px;padding:8px 16px;border-bottom:1px solid var(--p-content-border-color);background:var(--p-content-background)}.km-pool-cols span{color:var(--p-text-muted-color);font-size:10.5px;font-weight:700;letter-spacing:.04em;text-transform:uppercase}.km-pool-cols-r{text-align:right}.km-mrow{display:grid;grid-template-columns:var(--km-cols);gap:13px;align-items:center;min-height:56px;padding:9px 16px;border-bottom:1px solid var(--p-content-border-color)}.km-mrow:hover{background:var(--kx-overlay-subtle)}.km-mrow-off{opacity:.55}.km-mrow-off:hover{opacity:.85}.km-mrow-id{min-width:0}.km-mrow-title{display:flex;align-items:center;gap:8px;min-width:0;font-size:13px;font-weight:660;line-height:1.25}.km-mrow-title-text{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.km-mrow-title .km-pill{flex:0 0 auto}.km-mrow-sub{margin-top:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--p-text-muted-color);font-size:11.5px}.km-mrow-prov{font-weight:620;color:var(--p-text-color)}.km-mrow-mono{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}.km-mrow-tags{min-width:0;display:flex;flex-direction:column;align-items:flex-start;gap:4px;padding:2px 0}.km-tag-group{display:flex;align-items:center;gap:4px;flex-wrap:wrap;min-width:0;max-width:100%}.km-tag-classes .km-pill{border:1px solid color-mix(in srgb,var(--p-primary-color) 32%,transparent);font-weight:700}.km-tag-caps .km-pill{font-weight:600}.km-mrow-limits{display:flex;flex-direction:column;gap:2px;justify-self:end;text-align:right}.km-mrow-limits span{color:var(--p-text-muted-color);font-size:11px}.km-mrow-limits b{color:var(--p-text-color);font-weight:680}.km-mrow-limit-chips{display:none}.km-mrow-acts{display:flex;align-items:center;gap:1px;justify-self:end}.km-mrow-probe{grid-column:1 / -1;min-width:0;display:flex;flex-direction:column;gap:10px;margin-top:2px;padding:10px 12px 12px 46px;border:1px solid var(--p-content-border-color);border-radius:var(--kx-radius-8);background:color-mix(in srgb,var(--p-text-color) 2%,transparent);font-size:13px}.km-mrow-probe.ok{border-color:color-mix(in srgb,var(--p-success-500) 30%,var(--p-content-border-color));background:color-mix(in srgb,var(--p-success-500) 7%,transparent)}.km-mrow-probe.fail{border-color:color-mix(in srgb,var(--p-danger-500) 30%,var(--p-content-border-color));background:color-mix(in srgb,var(--p-danger-500) 7%,transparent)}.km-mrow-probe-head{min-width:0;display:flex;align-items:center;flex-wrap:wrap;gap:8px}.km-mrow-probe-head>svg{width:17px;height:17px;flex:0 0 auto}.km-mrow-probe.ok .km-mrow-probe-head>svg{color:var(--p-success-600, var(--p-success-500))}.km-mrow-probe.fail .km-mrow-probe-head>svg{color:var(--p-danger-600, var(--p-danger-500))}.km-mrow-probe-msg{flex:1 1 220px;min-width:0;overflow-wrap:anywhere}.km-mrow-probe-head .p-button{margin-left:auto}.km-mrow-probe-body{display:flex;flex-direction:column;gap:10px;min-width:0}.km-drawer-title{flex:1;min-width:0;display:inline-flex;align-items:center;gap:8px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:14px;font-weight:760}.km-drawer-title svg{width:18px;height:18px;color:var(--p-text-muted-color)}.km-drawer-content{min-height:0;overflow-y:auto;overscroll-behavior:contain}.km-form{display:flex;flex-direction:column;gap:16px}.km-editor-head{display:flex;align-items:center;gap:11px}.km-editor-head-text{min-width:0}.km-editor-head-title{font-size:14px;font-weight:740}.km-editor-head-sub{margin-top:2px;color:var(--p-text-muted-color);font-size:12px;line-height:1.4}.km-form-sec{display:flex;flex-direction:column;gap:10px}.km-form-sec+.km-form-sec{padding-top:16px;border-top:1px solid var(--p-content-border-color)}.km-form-sec-title{color:var(--p-text-muted-color);font-size:11px;font-weight:760;letter-spacing:.03em;text-transform:uppercase}.km-form-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:11px}.km-form-grid.four{grid-template-columns:repeat(4,minmax(0,1fr))}.km-adv-toggle{display:inline-flex;align-items:center;gap:6px;align-self:flex-start;padding:4px 0;background:none;border:none;cursor:pointer;color:var(--p-text-muted-color);font:inherit;font-size:12px;font-weight:700}.km-adv-toggle svg{width:15px;height:15px}.km-form-foot{position:sticky;bottom:-16px;display:flex;flex-wrap:wrap;justify-content:flex-end;gap:8px;margin:0 -16px -16px;padding:14px 16px;border-top:1px solid var(--p-content-border-color);background:var(--p-content-background)}.km-form-id{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:11.5px;color:var(--p-text-muted-color)}.km-form-foot-sp{flex:1}.km-taginput{position:relative;display:flex;flex-wrap:wrap;align-items:center;gap:6px;width:100%;min-height:36px;padding:5px 8px;border:1px solid var(--p-content-border-color);border-radius:var(--kx-radius-8);background:var(--p-content-background);cursor:text;transition:border-color .12s ease,box-shadow .12s ease}.km-taginput:focus-within{border-color:var(--p-focus-ring-color);box-shadow:var(--p-focus-ring-shadow)}.km-taginput.disabled{opacity:.6;cursor:default}.km-tag{display:inline-flex;align-items:center;gap:4px;height:24px;max-width:100%;padding:0 4px 0 9px;border-radius:6px;background:color-mix(in srgb,var(--p-primary-color) 13%,transparent);color:var(--p-text-color);font-size:12.5px}.km-tag-label{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.km-tag-x{display:inline-flex;align-items:center;justify-content:center;width:16px;height:16px;flex:0 0 auto;padding:0;border:0;border-radius:8px;background:transparent;color:var(--p-text-muted-color);cursor:pointer}.km-tag-x:hover{color:var(--p-text-color);background:color-mix(in srgb,var(--p-text-color) 14%,transparent)}.km-tag-x svg{width:12px;height:12px}.km-tag-field{flex:1;min-width:90px;height:24px;border:0;background:transparent;outline:none;color:var(--p-text-color);font:inherit;font-size:13px}.km-taginput-wrap{display:flex;flex-direction:column;gap:7px}.km-tag-sug{display:flex;flex-wrap:wrap;gap:5px}.km-tag-sug-item{display:inline-flex;align-items:center;gap:4px;height:24px;padding:0 9px 0 7px;border:1px dashed var(--p-content-border-color);border-radius:6px;background:transparent;color:var(--p-text-muted-color);font:inherit;font-size:12px;cursor:pointer;transition:border-color .12s ease,color .12s ease,background-color .12s ease}.km-tag-sug-item:hover:not(:disabled){border-style:solid;border-color:color-mix(in srgb,var(--p-primary-color) 40%,var(--p-content-border-color));color:var(--p-text-color);background:color-mix(in srgb,var(--p-primary-color) 8%,transparent)}.km-tag-sug-item:disabled{opacity:.5;cursor:default}.km-tag-sug-item svg{width:13px;height:13px}.km-adv-toggle{display:inline-flex;align-items:center;gap:6px;padding:0;border:0;background:transparent;color:var(--p-text-muted-color);font:inherit;font-size:11px;font-weight:760;letter-spacing:.03em;text-transform:uppercase;cursor:pointer}.km-adv-toggle:hover{color:var(--p-text-color)}.km-adv-chev{width:14px;height:14px;transition:transform .15s ease}.km-adv-toggle.open .km-adv-chev{transform:rotate(90deg)}.km-adv-body{display:flex;flex-direction:column;gap:10px;margin-top:10px}.km-test-result{display:flex;align-items:center;gap:8px;padding:8px 11px;border-radius:var(--kx-radius-8);font-size:12.5px}.km-test-result svg{width:16px;height:16px;flex:0 0 auto}.km-test-result span{min-width:0;overflow-wrap:anywhere}.km-test-result.testing{color:var(--p-text-muted-color);background:var(--kx-overlay-subtle)}.km-test-result.ok{color:var(--p-success-600, var(--p-success-500));background:color-mix(in srgb,var(--p-success-500) 12%,transparent)}.km-test-result.fail{color:var(--p-danger-600, var(--p-danger-500));background:color-mix(in srgb,var(--p-danger-500) 10%,transparent)}.km-probe{border:1px solid var(--p-content-border-color);border-radius:var(--kx-radius-8);font-size:13px}.km-probe.ok{border-color:color-mix(in srgb,var(--p-success-500) 30%,var(--p-content-border-color));background:color-mix(in srgb,var(--p-success-500) 8%,transparent)}.km-probe.fail{border-color:color-mix(in srgb,var(--p-danger-500) 30%,var(--p-content-border-color));background:color-mix(in srgb,var(--p-danger-500) 8%,transparent)}.km-probe-head{display:flex;flex-wrap:wrap;align-items:center;gap:9px;padding:9px 10px 9px 12px}.km-probe-head>svg{width:17px;height:17px;flex:0 0 auto}.km-probe.ok .km-probe-head>svg{color:var(--p-success-600, var(--p-success-500))}.km-probe.fail .km-probe-head>svg{color:var(--p-danger-600, var(--p-danger-500))}.km-probe-msg{flex:1;min-width:0}.km-probe-time{flex:0 0 auto;padding:1px 7px;border-radius:var(--kx-radius-tag);background:var(--kx-overlay-subtle);color:var(--p-text-muted-color);font-size:11px;font-weight:700;font-variant-numeric:tabular-nums}.km-probe-adv-btn{flex:0 0 auto}.km-probe-x{width:24px;height:24px;display:inline-flex;align-items:center;justify-content:center;flex:0 0 auto;border:0;border-radius:6px;background:transparent;color:var(--p-text-muted-color);cursor:pointer;opacity:.7}.km-probe-x:hover{opacity:1;background:color-mix(in srgb,currentColor 12%,transparent)}.km-probe-x svg{width:14px;height:14px}.km-probe-adv{display:flex;flex-direction:column;gap:10px;padding:10px 12px 12px;border-top:1px solid var(--p-content-border-color)}.km-probe-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:6px 16px}.km-probe-kv{display:flex;align-items:baseline;gap:8px;min-width:0}.km-probe-kv span{flex:0 0 96px;color:var(--p-text-muted-color);font-size:11.5px}.km-probe-kv code{min-width:0;overflow:hidden;text-overflow:ellipsis;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:11.5px}.km-probe-tokens{display:flex;flex-wrap:wrap;align-items:center;gap:6px}.km-probe-tokens-l{color:var(--p-text-muted-color);font-size:11.5px;margin-right:2px}.km-probe-tok{padding:1px 8px;border-radius:var(--kx-radius-tag);background:var(--kx-overlay-subtle);color:var(--p-text-muted-color);font-size:11px;font-variant-numeric:tabular-nums}.km-probe-tok b{color:var(--p-text-color);font-weight:700}.km-probe-out{display:flex;flex-direction:column;gap:4px}.km-probe-out span{color:var(--p-text-muted-color);font-size:11.5px;font-weight:700}.km-probe-out pre{margin:0;max-height:160px;overflow:auto;padding:9px 10px;border-radius:6px;background:var(--kx-overlay-subtle);font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:11.5px;line-height:1.45;white-space:pre-wrap;word-break:break-word}.km-tabs{flex:0 0 auto;padding:0 12px;border-bottom:1px solid var(--p-content-border-color)}.km-tabs .p-tab b{min-width:18px;padding:0 6px;border-radius:999px;background:var(--kx-overlay-subtle);color:var(--p-text-muted-color);font-size:11px;font-weight:700;text-align:center}.km-tabs .p-tab[aria-selected=true] b{background:color-mix(in srgb,var(--p-primary-color) 14%,transparent);color:var(--p-primary-color)}.km-classes{flex:1;min-height:0;display:flex;flex-direction:column}.km-classes-list{display:flex;flex-direction:column;gap:10px;padding:14px 16px}.km-class{flex:0 0 auto;border:1px solid var(--p-content-border-color);border-radius:var(--kx-radius-10);overflow:hidden}.km-class-head{display:flex;align-items:center;gap:10px;padding:10px 12px;background:var(--kx-overlay-subtle);border-bottom:1px solid var(--p-content-border-color)}.km-class-head-text{flex:1;min-width:0}.km-class-title{display:flex;align-items:center;gap:8px;font-size:13.5px;font-weight:720}.km-class-ref{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:11px;font-weight:600;color:var(--p-primary-color);background:color-mix(in srgb,var(--p-primary-color) 12%,transparent);padding:1px 6px;border-radius:6px}.km-class-desc{margin-top:3px;color:var(--p-text-muted-color);font-size:12px;line-height:1.4}.km-class-meta{display:flex;align-items:center;gap:8px;flex:0 0 auto}.km-class-count{color:var(--p-text-muted-color);font-size:11.5px;white-space:nowrap}.km-class-members{display:flex;flex-direction:column}.km-class-member{display:grid;grid-template-columns:58px minmax(0,1.2fr) minmax(0,1fr) auto;align-items:center;gap:10px;padding:8px 12px;border-bottom:1px solid var(--p-content-border-color)}.km-class-member:last-child{border-bottom:0}.km-class-member.top{background:color-mix(in srgb,var(--p-success-500) 6%,transparent)}.km-class-rank{width:20px;height:20px;display:inline-flex;align-items:center;justify-content:center;border-radius:6px;background:var(--kx-overlay-subtle);color:var(--p-text-muted-color);font-size:11px;font-weight:700}.km-class-member-name{font-size:13px;font-weight:620;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.km-class-member-id{color:var(--p-text-muted-color);font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:11px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.km-class-member-pri{color:var(--p-text-muted-color);font-size:11px;justify-self:end;white-space:nowrap}.km-class-empty{padding:12px;color:var(--p-text-muted-color);font-size:12px}.km-spin{display:inline-block;flex:0 0 auto;width:15px;height:15px;border:2px solid color-mix(in srgb,currentColor 26%,transparent);border-top-color:currentColor;border-radius:50%;animation:kx-spin .6s linear infinite}@media(max-width:1080px){.km-pool-filters{grid-template-columns:repeat(3,minmax(0,1fr))}}@media(max-width:860px){.km-shell{grid-template-columns:1fr;grid-template-rows:auto minmax(0,1fr)}.km-rail{border-right:0;border-bottom:1px solid var(--p-content-border-color);max-height:40vh}.km-pool-cols{display:none}.km-mrow{grid-template-columns:34px minmax(0,1fr) 122px;gap:6px 10px;align-items:center}.km-mrow .km-avatar{grid-column:1;grid-row:1}.km-mrow-id{grid-column:2;grid-row:1}.km-mrow-acts{grid-column:3;grid-row:1;align-self:start;justify-content:flex-end}.km-mrow-limits{display:none}.km-mrow-limit-chips{grid-column:2 / 3;grid-row:2;display:flex;align-items:center;flex-wrap:wrap;gap:5px;min-width:0}.km-mrow-limit-chips span{display:inline-flex;align-items:baseline;gap:3px;min-width:0;padding:2px 6px;border:1px solid var(--p-content-border-color);border-radius:6px;color:var(--p-text-muted-color);background:var(--kx-overlay-subtle);font-size:10.5px;line-height:1.2;white-space:nowrap}.km-mrow-limit-chips b{color:var(--p-text-color);font-weight:700}.km-mrow-tags{grid-column:2 / -1;grid-row:3;flex-direction:row;flex-wrap:wrap;align-items:center}.km-mrow-tags .km-tag-group{flex-wrap:wrap}.km-mrow-probe{grid-column:1 / -1;padding-left:10px}.km-mrow-probe-head .p-button{margin-left:0}.km-form-grid,.km-form-grid.four{grid-template-columns:1fr}.km-class-member{grid-template-columns:auto minmax(0,1fr) auto}.km-class-member-id{display:none}}@media(max-width:560px){.km-pool-filters{grid-template-columns:repeat(2,minmax(0,1fr))}.km-pool-head-top .km-search{width:100%}.km-probe-grid{grid-template-columns:1fr}}.ob{display:flex;flex-direction:column;min-height:0}.ob-stage{display:flex;flex-direction:column;gap:20px}.ob-model-warning{display:flex;align-items:flex-start;gap:9px;padding:10px 12px;border:1px solid color-mix(in srgb,var(--p-warn-500) 30%,transparent);border-radius:var(--kx-radius-8);background:color-mix(in srgb,var(--p-warn-500) 12%,transparent);color:var(--p-warn-700);font-size:12px;line-height:1.45;margin-bottom:20px}.ob-model-warning>svg{width:17px;height:17px;flex:none;margin-top:1px}.ob-model-warning strong{color:inherit}.ob-foot{display:flex;align-items:center;gap:10px;margin-top:24px;padding-top:18px;border-top:1px solid var(--p-content-border-color)}.ob-foot-sp{flex:1}.ob-btn{padding:11px 20px;border-radius:var(--kx-radius-8);border:0;cursor:pointer;font:inherit;font-size:13.5px;font-weight:700;transition:transform .15s,color .15s,filter .15s}.ob-btn:hover:not(:disabled){transform:translateY(-1px)}.ob-ghost{background:transparent;color:var(--p-text-muted-color)}.ob-ghost:hover{color:var(--p-text-color)}.ob-primary{background:var(--p-primary-color);color:var(--p-primary-contrast-color)}.ob-primary:hover:not(:disabled){filter:brightness(1.06)}.ob-primary:disabled{opacity:.5;cursor:default}.ob-result{display:flex;align-items:center;gap:8px;padding:10px 12px;border-radius:var(--kx-radius-8);font-size:12.5px}.ob-result.fail{background:color-mix(in srgb,var(--p-danger-500) 12%,transparent);color:var(--p-danger-700)}.ob-result svg{width:16px;height:16px;flex:none}.ob-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}.ob-tile{display:flex;flex-direction:column;align-items:flex-start;gap:8px;padding:16px;text-align:left;cursor:pointer;border:1px solid var(--p-content-border-color);border-radius:14px;background:var(--p-content-background);transition:border-color .15s,background .15s,transform .15s}.ob-tile:hover{border-color:var(--p-primary-color);background:var(--kx-overlay-hover);transform:translateY(-2px)}.ob-tile-ico{width:40px;height:40px;display:grid;place-items:center;border-radius:11px;background:color-mix(in srgb,var(--p-primary-color) 12%,transparent);color:var(--p-primary-color)}.ob-tile-ico svg{width:22px;height:22px}.ob-tile-name{font-size:14px;font-weight:700;color:var(--p-text-color)}.ob-tile-desc{font-size:11.5px;color:var(--p-text-muted-color);line-height:1.45}.ob-connecting{display:flex;flex-direction:column;align-items:center;gap:12px;padding:40px 24px;text-align:center;border:1px solid var(--p-content-border-color);border-radius:var(--kx-radius-10);background:var(--kx-overlay-subtle)}.ob-connecting-note{margin:0;font-size:12px;color:var(--p-text-muted-color);max-width:360px;line-height:1.5}.ob-autobar{display:flex;align-items:center;justify-content:space-between;gap:12px}.ob-auto-hint{font-size:12px;color:var(--p-text-muted-color)}.ob-block{display:flex;flex-direction:column;gap:12px}.ob-block-head{display:flex;align-items:center;justify-content:space-between;gap:10px;font-size:11px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;color:var(--p-text-muted-color)}.ob-providers{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.ob-prov{display:flex;align-items:center;gap:9px;min-width:0;padding:8px 10px;border:1px solid var(--p-content-border-color);border-radius:var(--kx-radius-8);background:var(--kx-overlay-subtle)}.ob-prov-body{flex:1;min-width:0}.ob-prov-name{font-size:12.5px;font-weight:600;color:var(--p-text-color);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.ob-prov-sub{font-size:11px;color:var(--p-text-muted-color);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.ob-dot{width:8px;height:8px;border-radius:50%;flex:none;background:color-mix(in srgb,var(--p-text-color) 25%,transparent)}.ob-dot.success{background:var(--p-success-500)}.ob-dot.danger{background:var(--p-danger-500)}.ob-dot.warn{background:var(--p-warn-500)}.ob-classes{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.ob-class{display:flex;flex-direction:column;gap:7px;min-width:0;padding:9px 11px;border:1px solid var(--p-content-border-color);border-radius:var(--kx-radius-8)}.ob-class-top{display:flex;align-items:center;gap:8px;min-width:0}.ob-class-ico{width:24px;height:24px;flex:none;display:grid;place-items:center;border-radius:6px;background:var(--kx-overlay-subtle);color:var(--p-primary-color)}.ob-class-ico svg{width:15px;height:15px}.ob-class-name{font-size:12.5px;font-weight:600;color:var(--p-text-color);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.ob-class .km-select{width:100%}@media(max-width:480px){.ob-providers,.ob-classes{grid-template-columns:1fr}}';
export {
  Ic as $,
  bc as A,
  z as B,
  Ei as C,
  xc as D,
  vc as E,
  uc as F,
  wc as G,
  yc as H,
  lc as I,
  pc as J,
  Ai as K,
  Li as L,
  Pe as M,
  Te as N,
  xd as O,
  Tc as P,
  Pi as Q,
  Pr as R,
  zd as S,
  Ae as T,
  Ci as U,
  ki as V,
  jt as W,
  _c as X,
  oc as Y,
  fc as Z,
  At as _,
  Ke as a,
  Pc as a0,
  Yr as a1,
  ic as a2,
  Lc as a3,
  cc as a4,
  nc as a5,
  rc as a6,
  Cc as a7,
  ye as b,
  Ee as c,
  Er as d,
  Ti as e,
  ue as f,
  P as g,
  A as h,
  sc as i,
  ac as j,
  dr as k,
  Nr as l,
  an as m,
  Td as n,
  Sc as o,
  kc as p,
  mc as q,
  dc as r,
  Ce as s,
  hc as t,
  Oc as u,
  mr as v,
  $c as w,
  Pt as x,
  gc as y,
  _t as z
};
//# sourceMappingURL=styles-BjS2SxRG.js.map

import { hasInjectionContext as Qr, inject as Hn, effectScope as Jr, ref as D, markRaw as Xr, onMounted as tn, onUnmounted as qn, watch as Pe, createApp as eo, readonly as to, getCurrentInstance as Bt, nextTick as nn, reactive as no, renderSlot as G, openBlock as f, createBlock as j, Teleport as Yn, createCommentVNode as A, useId as ro, mergeProps as E, h as oo, resolveDirective as At, withDirectives as ze, resolveDynamicComponent as Ve, withCtx as B, normalizeClass as fe, createElementBlock as v, createElementVNode as b, defineComponent as ie, createTextVNode as K, toDisplayString as N, resolveComponent as Rt, computed as X, unref as h, createVNode as L, Fragment as he, renderList as ve, createSlots as ao, onBeforeUnmount as io, withModifiers as Ue, vShow as dn } from "vue";
import { addCollection as so, Icon as ee } from "@iconify/vue";
import { config as un, addIcons as lo, on as co, applyThemeMode as ht, host as rn, hostCss as uo, loadCss as po, loadByTagName as fo, api as Le, define as mo } from "@wippy-fe/proxy";
var Dt = "data-wippy-visible";
function pn(e) {
  const t = e.getAttribute(Dt);
  return t === "true" ? !0 : t === "false" ? !1 : null;
}
var bo = Object.defineProperty, ho = (e, t, n) => t in e ? bo(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n, Q = (e, t, n) => ho(e, typeof t != "symbol" ? t + "" : t, n), vo = [
  "themeConfigUrl",
  "primeVueCssUrl",
  "markdownCssUrl",
  "iframeCssUrl"
], go = [
  ":where([data-wippy-theme-root]).w-theme-light",
  ":where([data-wippy-theme-root]).w-theme-dark"
].join(`,
`);
function fn(e) {
  const t = e.startsWith("--") ? e : `--${e}`;
  return /^--[-\w\u0080-\uFFFF]+$/.test(t) ? t : null;
}
function yo(...e) {
  const t = /* @__PURE__ */ new Set();
  for (const n of e)
    if (n)
      for (const [r, o] of Object.entries(n)) {
        if ((r === "@light" || r === "@dark") && o && typeof o == "object") {
          for (const [s, c] of Object.entries(o)) {
            const i = typeof c == "string" ? fn(s) : null;
            i && t.add(i);
          }
          continue;
        }
        const a = typeof o == "string" ? fn(r) : null;
        a && t.add(a);
      }
  return [...t].sort();
}
function ko(e) {
  if (e.length === 0)
    return "";
  const t = e.map((n) => `  ${n}: inherit;`).join(`
`);
  return `${go} {
${t}
}`;
}
function xo(e, t) {
  const n = ko(t);
  n && Gn(e, n, "@wippy-fe/css-variables-bridge");
}
function wo(e, t) {
  const r = (t ?? vo).map(async (o) => {
    const a = uo[o];
    if (!a)
      return console.warn(`[wippy-fe/webcomponent-core] hostCss key "${o}" is undefined — skipping. Remove it from hostCssKeys if the CSS was removed.`), null;
    try {
      return await po(a);
    } catch (s) {
      return console.warn(`[wippy-fe/webcomponent-core] Failed to load hostCss "${o}" (${a}):`, s), null;
    }
  });
  return Promise.all(r).then((o) => {
    for (const a of o) {
      if (!a)
        continue;
      const s = document.createElement("style");
      s.textContent = a, s.setAttribute("role", "@wippy-fe/host-css"), e.appendChild(s);
    }
  });
}
function $o(e, t) {
  const n = document.createElement("style");
  n.textContent = t, e.appendChild(n);
}
function Gn(e, t, n) {
  if (typeof CSSStyleSheet < "u" && "replaceSync" in CSSStyleSheet.prototype) {
    const o = new CSSStyleSheet();
    o.replaceSync(t), e.adoptedStyleSheets = [...e.adoptedStyleSheets, o];
    return;
  }
  const r = document.createElement("style");
  r.setAttribute("role", n), r.textContent = t, e.appendChild(r);
}
function So(e, t) {
  Gn(e, t, "@wippy-fe/custom-css");
}
function Zn(e) {
  return e.__wippyHost ?? null;
}
function _o(e) {
  return e.replace(/-([a-z])/g, (t, n) => n.toUpperCase());
}
function Co(e, t, n) {
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
function Nt(e, t) {
  const n = {}, r = [];
  for (const [o, a] of Object.entries(t.properties)) {
    const s = e.getAttribute(o), c = _o(o);
    if (s === null) {
      a.default !== void 0 && (n[c] = a.default);
      continue;
    }
    const i = Co(o, s, a);
    i.error ? r.push(i.error) : n[c] = i.value;
  }
  return { props: n, errors: r };
}
var To = class {
  constructor(e, t) {
    Q(this, "_props"), Q(this, "_errors"), Q(this, "_content"), Q(this, "_hostVisibility"), Q(this, "_propsListeners", /* @__PURE__ */ new Set()), Q(this, "_contentListeners", /* @__PURE__ */ new Set()), Q(this, "_hostVisibilityListeners", /* @__PURE__ */ new Set()), Q(this, "_disposed", !1), Q(this, "_emitToDom"), Q(this, "props"), Q(this, "events"), Q(this, "content"), Q(this, "hostVisibility"), this._props = e.props, this._errors = e.errors, this._content = e.content, this._hostVisibility = e.hostVisibility, this._emitToDom = t;
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
}, Po = class extends HTMLElement {
  constructor() {
    super(), Q(this, "_internals"), Q(this, "_contentObserver", null), Q(this, "_initialized", !1), Q(this, "_container", null), Q(this, "_reactive", null), Q(this, "_lastProps", null), Q(this, "_lastErrors", []), Q(this, "_lastContent", null), Q(this, "_themeUnsub", null), Q(this, "_hostVisible", null), this._internals = this.attachInternals(), this._hostVisible = pn(this);
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
    return [.../* @__PURE__ */ new Set([...t, ...n, Dt])];
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
    return Zn(this);
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
        const a = Nt(this, e.propsSchema);
        e.validateProps && a.errors.push(...e.validateProps(a.props)), n = a.props, r = a.errors, this._lastProps = n, this._lastErrors = r;
      }
      const o = t ? this._lastContent ?? this._extractContent(e.contentTemplate) : null;
      t && this._lastContent === null && (this._lastContent = o), this._reactive = new To(
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
        this.onInit(n), e.inlineCss && $o(n, e.inlineCss);
        try {
          const d = un?.theming, l = yo(
            d?.global?.cssVariables,
            d?.children?.cssVariables
          );
          xo(n, l);
        } catch {
        }
        if (e.customCss !== !1)
          try {
            const d = un?.theming, l = [d?.global?.customCSS, d?.children?.customCSS].filter(Boolean).join(`
`);
            l && So(n, l);
          } catch {
          }
        (e.hostCssKeys === void 0 || e.hostCssKeys.length > 0) && wo(n, e.hostCssKeys), r = document.createElement("div"), r.setAttribute("data-wippy-theme-root", "");
        const i = e.containerClasses ?? [];
        i.length > 0 && r.classList.add(...i), n.appendChild(r), this._container = r, lo(so);
      }
      this._applyTheme(), this._themeUnsub || (this._themeUnsub = co("@theme", (i) => this._applyTheme(i)));
      const { props: o, errors: a } = Nt(this, e.propsSchema);
      e.validateProps && a.push(...e.validateProps(o));
      const s = o;
      this._lastProps = s, this._lastErrors = a;
      let c = null;
      e.contentTemplate && (c = this._extractContent(e.contentTemplate), this._lastContent = c, this._contentObserver = new MutationObserver(() => {
        const i = this._extractContent(e.contentTemplate);
        this._lastContent = i, this._reactive?.notifyContent(i), this.onContentChanged(i);
      }), this._contentObserver.observe(this, {
        childList: !0,
        characterData: !0,
        subtree: !0
      })), this.onMount(n, r, s, a, c, t), this._internals.states.delete("loading"), this._internals.states.add("ready"), t || (this._initialized = !0), this.onReady(), this.emitEvent("load");
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
  _applyTheme(e = rn.getThemeMode?.()) {
    ht(e, this), this._container && ht(e, this._container);
  }
  disconnectedCallback() {
    this._themeUnsub && (this._themeUnsub(), this._themeUnsub = null), ht("auto", this), this._container && ht("auto", this._container), this._contentObserver && (this._contentObserver.disconnect(), this._contentObserver = null), this.onUnmount(), this.emitEvent("unload"), this._internals.states.clear(), this._reactive?.dispose(), this._reactive = null, this._lastProps = null, this._lastErrors = [], this._lastContent = null, delete this.__wippyHost, delete this.__wippyHostBus;
  }
  attributeChangedCallback(e, t, n) {
    if (t === n)
      return;
    if (e === Dt) {
      const c = this._hostVisible, i = pn(this);
      if (i === c)
        return;
      this._hostVisible = i, this.isConnected && this._initialized && (this._reactive?.notifyHostVisibility(i, c), this.onHostVisibilityChanged(i, c));
      return;
    }
    const r = this.constructor.wippyConfig, { props: o, errors: a } = Nt(this, r.propsSchema);
    r.validateProps && a.push(...r.validateProps(o));
    const s = o;
    this._lastProps = s, this._lastErrors = a, this._reactive?.notifyProps(s, a), this.onPropsChanged(s, a);
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
function Oo(e) {
  return e.__wippyHostBus ?? null;
}
function Ao(e) {
  return e.dataset.wippyPanelId ?? null;
}
/*!
 * pinia v4.0.3
 * (c) 2026 Eduardo San Martin Morote
 * @license MIT
 */
let Qn;
const Jn = (e) => Qn = e, Lo = () => Qr() && Hn(Xn) || Qn, Xn = (
  /* istanbul ignore next */
  Symbol()
);
function Eo() {
  const e = Jr(!0), t = e.run(() => D({}));
  let n = [], r = [];
  const o = Xr({
    install(a) {
      Jn(o), o._a = a, a.provide(Xn, o), a.config.globalProperties.$pinia = o, r.forEach((s) => n.push(s)), r = [];
    },
    use(a) {
      return this._a ? n.push(a) : r.push(a), this;
    },
    _p: n,
    _a: null,
    _e: e,
    _s: /* @__PURE__ */ new Map(),
    state: t
  });
  return o;
}
var No = Object.defineProperty, jo = (e, t, n) => t in e ? No(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n, Re = (e, t, n) => jo(e, typeof t != "symbol" ? t + "" : t, n), Io = /* @__PURE__ */ Symbol("wippy:emit"), zo = /* @__PURE__ */ Symbol("wippy:props"), Vo = /* @__PURE__ */ Symbol("wippy:props_error"), Bo = /* @__PURE__ */ Symbol("wippy:content"), Ro = /* @__PURE__ */ Symbol("wippy:panel-id"), Do = /* @__PURE__ */ Symbol("wippy:layout-bus"), Mo = /* @__PURE__ */ Symbol("wippy:host"), er = /* @__PURE__ */ Symbol("wippy:host-visibility");
function Fo() {
  const e = Hn(er);
  if (!e)
    throw new Error("useHostVisibility() must be called inside a WippyVueElement");
  return e;
}
function Uo(e) {
  const t = Fo();
  let n = !1, r = null, o = !1;
  function a() {
    if (r)
      return o = !0, r;
    let s;
    try {
      s = Promise.resolve(e());
    } catch (i) {
      s = Promise.reject(i);
    }
    const c = s.finally(() => {
      if (r === c && (r = null, n && o))
        return o = !1, a();
    });
    return r = c, c;
  }
  return tn(() => (n = !0, a())), qn(() => {
    n = !1, o = !1;
  }), Pe(t, (s, c) => {
    if (n && c === !1 && s === !0)
      return a();
  }), t;
}
var Wo = class extends Po {
  constructor() {
    super(...arguments), Re(this, "_vueApp", null), Re(this, "_propsRef", D({})), Re(this, "_errorsRef", D([])), Re(this, "_contentRef", D(null)), Re(this, "_hostVisibilityRef", D(null)), Re(this, "_bridgeAbort", null);
  }
  /**
   * Override to provide Vue-specific configuration.
   */
  static get vueConfig() {
    throw new Error("WippyVueElement subclass must override static get vueConfig()");
  }
  onMount(e, t, n, r, o, a) {
    const s = this.constructor.vueConfig;
    this._propsRef.value = n, this._errorsRef.value = r, this._contentRef.value = o ?? null, this._hostVisibilityRef.value = this.hostVisible;
    for (const d of r)
      this.emitEvent("invalid", { message: d });
    const c = new AbortController();
    this._bridgeAbort = c, this.reactive.props.subscribe((d, l) => {
      this._propsRef.value = d, this._errorsRef.value = [...l];
      for (const u of l)
        this.emitEvent("invalid", { message: u });
    }, { signal: c.signal }), this.reactive.content && this.reactive.content.subscribe((d) => {
      this._contentRef.value = d;
    }, { signal: c.signal }), this.reactive.hostVisibility.subscribe((d) => {
      this._hostVisibilityRef.value = d;
    }, { signal: c.signal });
    const i = (d) => {
      if (c.signal.aborted)
        return;
      const l = Lo(), u = eo(d.rootComponent);
      this._vueApp = u;
      const p = Eo();
      if (d.piniaPlugins)
        for (const m of d.piniaPlugins)
          p.use(m);
      if (u.use(p), d.plugins)
        for (const m of d.plugins)
          u.use(m);
      u.provide(zo, this._propsRef), u.provide(Vo, this._errorsRef), u.provide(Io, this.emitEvent.bind(this)), u.provide(Bo, this._contentRef), u.provide(er, this._hostVisibilityRef), u.provide(Ro, Ao(this)), u.provide(Do, Oo(this)), u.provide(Mo, Zn(this)), d.providers && d.providers(u, this), u.mount(t), l && Jn(l);
    };
    if (s.rootComponent)
      i(s);
    else if (s.lazyConfig) {
      const d = document.createElement("wippy-loading");
      d.setAttribute("no-bg", ""), t.appendChild(d), s.lazyConfig().then((l) => {
        c.signal.aborted || (d.remove(), i(l));
      }).catch((l) => {
        if (c.signal.aborted)
          return;
        const u = l instanceof Error ? l.message : String(l), p = document.createElement("wippy-error");
        p.setAttribute("title", "Failed to load"), p.setAttribute("message", u), d.replaceWith(p), this.emitEvent("error", { message: u });
      });
    } else
      throw new Error("WippyVueElement vueConfig must provide rootComponent or lazyConfig");
  }
  onUnmount() {
    this._bridgeAbort?.abort(), this._bridgeAbort = null, this._vueApp && (this._vueApp.unmount(), this._vueApp = null);
  }
}, Ko = Object.defineProperty, mn = Object.getOwnPropertySymbols, Ho = Object.prototype.hasOwnProperty, qo = Object.prototype.propertyIsEnumerable, bn = (e, t, n) => t in e ? Ko(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n, Yo = (e, t) => {
  for (var n in t || (t = {})) Ho.call(t, n) && bn(e, n, t[n]);
  if (mn) for (var n of mn(t)) qo.call(t, n) && bn(e, n, t[n]);
  return e;
};
function Be(e) {
  return e == null || e === "" || Array.isArray(e) && e.length === 0 || !(e instanceof Date) && typeof e == "object" && Object.keys(e).length === 0;
}
function Mt(e, t, n = /* @__PURE__ */ new WeakSet()) {
  if (e === t) return !0;
  if (!e || !t || typeof e != "object" || typeof t != "object" || n.has(e) || n.has(t)) return !1;
  n.add(e).add(t);
  let r = Array.isArray(e), o = Array.isArray(t), a, s, c;
  if (r && o) {
    if (s = e.length, s != t.length) return !1;
    for (a = s; a-- !== 0; ) if (!Mt(e[a], t[a], n)) return !1;
    return !0;
  }
  if (r != o) return !1;
  let i = e instanceof Date, d = t instanceof Date;
  if (i != d) return !1;
  if (i && d) return e.getTime() == t.getTime();
  let l = e instanceof RegExp, u = t instanceof RegExp;
  if (l != u) return !1;
  if (l && u) return e.toString() == t.toString();
  let p = Object.keys(e);
  if (s = p.length, s !== Object.keys(t).length) return !1;
  for (a = s; a-- !== 0; ) if (!Object.prototype.hasOwnProperty.call(t, p[a])) return !1;
  for (a = s; a-- !== 0; ) if (c = p[a], !Mt(e[c], t[c], n)) return !1;
  return !0;
}
function Go(e, t) {
  return Mt(e, t);
}
function Lt(e) {
  return typeof e == "function" && "call" in e && "apply" in e;
}
function q(e) {
  return !Be(e);
}
function Me(e, t) {
  if (!e || !t) return null;
  try {
    let n = e[t];
    if (q(n)) return n;
  } catch {
  }
  if (Object.keys(e).length) {
    if (Lt(t)) return t(e);
    if (t.indexOf(".") === -1) return e[t];
    {
      let n = t.split("."), r = e;
      for (let o = 0, a = n.length; o < a; ++o) {
        if (r == null) return null;
        r = r[n[o]];
      }
      return r;
    }
  }
  return null;
}
function wt(e, t, n) {
  return n ? Me(e, n) === Me(t, n) : Go(e, t);
}
function _e(e, t = !0) {
  return e instanceof Object && e.constructor === Object && (t || Object.keys(e).length !== 0);
}
function tr(e = {}, t = {}) {
  let n = Yo({}, e);
  return Object.keys(t).forEach((r) => {
    let o = r;
    _e(t[o]) && o in e && _e(e[o]) ? n[o] = tr(e[o], t[o]) : n[o] = t[o];
  }), n;
}
function Zo(...e) {
  return e.reduce((t, n, r) => r === 0 ? n : tr(t, n), {});
}
function pe(e, ...t) {
  return Lt(e) ? e(...t) : e;
}
function ce(e, t = !0) {
  return typeof e == "string" && (t || e !== "");
}
function Se(e) {
  return ce(e) ? e.replace(/(-|_)/g, "").toLowerCase() : e;
}
function on(e, t = "", n = {}) {
  let r = Se(t).split("."), o = r.shift();
  if (o) {
    if (_e(e)) {
      let a = Object.keys(e).find((s) => Se(s) === o) || "";
      return on(pe(e[a], n), r.join("."), n);
    }
    return;
  }
  return pe(e, n);
}
function nr(e, t = !0) {
  return Array.isArray(e) && (t || e.length !== 0);
}
function Qo(e) {
  return q(e) && !isNaN(e);
}
function je(e, t) {
  if (t) {
    let n = t.test(e);
    return t.lastIndex = 0, n;
  }
  return !1;
}
function Jo(...e) {
  return Zo(...e);
}
function Ge(e) {
  return e && e.replace(/\/\*(?:(?!\*\/)[\s\S])*\*\/|[\r\n\t]+/g, "").replace(/ {2,}/g, " ").replace(/ ([{:}]) /g, "$1").replace(/([;,]) /g, "$1").replace(/ !/g, "!").replace(/: /g, ":").trim();
}
function Xo(e) {
  return ce(e, !1) ? e[0].toUpperCase() + e.slice(1) : e;
}
function rr(e) {
  return ce(e) ? e.replace(/(_)/g, "-").replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase() : e;
}
function or() {
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
function we(...e) {
  if (e) {
    let t = [];
    for (let n = 0; n < e.length; n++) {
      let r = e[n];
      if (!r) continue;
      let o = typeof r;
      if (o === "string" || o === "number") t.push(r);
      else if (o === "object") {
        let a = Array.isArray(r) ? [we(...r)] : Object.entries(r).map(([s, c]) => c ? s : void 0);
        t = a.length ? t.concat(a.filter((s) => !!s)) : t;
      }
    }
    return t.join(" ").trim();
  }
}
function ea(e, t) {
  return e ? e.classList ? e.classList.contains(t) : new RegExp("(^| )" + t + "( |$)", "gi").test(e.className) : !1;
}
function ta(e, t) {
  if (e && t) {
    let n = (r) => {
      ea(e, r) || (e.classList ? e.classList.add(r) : e.className += " " + r);
    };
    [t].flat().filter(Boolean).forEach((r) => r.split(" ").forEach(n));
  }
}
function jt(e, t) {
  if (e && t) {
    let n = (r) => {
      e.classList ? e.classList.remove(r) : e.className = e.className.replace(new RegExp("(^|\\b)" + r.split(" ").join("|") + "(\\b|$)", "gi"), " ");
    };
    [t].flat().filter(Boolean).forEach((r) => r.split(" ").forEach(n));
  }
}
function hn(e) {
  return e ? Math.abs(e.scrollLeft) : 0;
}
function vn(e) {
  return e ? getComputedStyle(e).direction === "rtl" : !1;
}
function ar(e, t) {
  return e instanceof HTMLElement ? e.offsetWidth : 0;
}
function na(e) {
  if (e) {
    let t = e.parentNode;
    return t && t instanceof ShadowRoot && t.host && (t = t.host), t;
  }
  return null;
}
function ra(e) {
  return !!(e !== null && typeof e < "u" && e.nodeName && na(e));
}
function pt(e) {
  return typeof Element < "u" ? e instanceof Element : e !== null && typeof e == "object" && e.nodeType === 1 && typeof e.nodeName == "string";
}
function $t(e, t = {}) {
  if (pt(e)) {
    let n = (r, o) => {
      var a, s;
      let c = (a = e?.$attrs) != null && a[r] ? [(s = e?.$attrs) == null ? void 0 : s[r]] : [];
      return [o].flat().reduce((i, d) => {
        if (d != null) {
          let l = typeof d;
          if (l === "string" || l === "number") i.push(d);
          else if (l === "object") {
            let u = Array.isArray(d) ? n(r, d) : Object.entries(d).map(([p, m]) => r === "style" && (m || m === 0) ? `${p.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase()}:${m}` : m ? p : void 0);
            i = u.length ? i.concat(u.filter((p) => !!p)) : i;
          }
        }
        return i;
      }, c);
    };
    Object.entries(t).forEach(([r, o]) => {
      if (o != null) {
        let a = r.match(/^on(.+)/);
        a ? e.addEventListener(a[1].toLowerCase(), o) : r === "p-bind" || r === "pBind" ? $t(e, o) : (o = r === "class" ? [...new Set(n("class", o))].join(" ").trim() : r === "style" ? n("style", o).join(";").trim() : o, (e.$attrs = e.$attrs || {}) && (e.$attrs[r] = o), e.setAttribute(r, o));
      }
    });
  }
}
function oa(e, t = {}, ...n) {
  {
    let r = document.createElement(e);
    return $t(r, t), r.append(...n), r;
  }
}
function Je(e, t) {
  return pt(e) ? e.matches(t) ? e : e.querySelector(t) : null;
}
function aa(e, t) {
  e && document.activeElement !== e && e.focus(t);
}
function He(e, t) {
  if (pt(e)) {
    let n = e.getAttribute(t);
    return isNaN(n) ? n === "true" || n === "false" ? n === "true" : n : +n;
  }
}
function Ft(e) {
  if (e) {
    let t = e.offsetHeight, n = getComputedStyle(e);
    return t -= parseFloat(n.paddingTop) + parseFloat(n.paddingBottom) + parseFloat(n.borderTopWidth) + parseFloat(n.borderBottomWidth), t;
  }
  return 0;
}
function qe(e) {
  if (e) {
    let t = e.getBoundingClientRect();
    return { top: t.top + (window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0), left: t.left + (window.pageXOffset || hn(document.documentElement) || hn(document.body) || 0) };
  }
  return { top: "auto", left: "auto" };
}
function ir(e, t) {
  return e ? e.offsetHeight : 0;
}
function Ze(e) {
  if (e) {
    let t = e.offsetWidth, n = getComputedStyle(e);
    return t -= parseFloat(n.paddingLeft) + parseFloat(n.paddingRight) + parseFloat(n.borderLeftWidth) + parseFloat(n.borderRightWidth), t;
  }
  return 0;
}
function sr() {
  return !!(typeof window < "u" && window.document && window.document.createElement);
}
function ia(e, t = "", n) {
  pt(e) && n !== null && n !== void 0 && e.setAttribute(t, n);
}
var vt = {};
function sa(e = "pui_id_") {
  return Object.hasOwn(vt, e) || (vt[e] = 0), vt[e]++, `${e}${vt[e]}`;
}
var la = Object.defineProperty, ca = Object.defineProperties, da = Object.getOwnPropertyDescriptors, St = Object.getOwnPropertySymbols, lr = Object.prototype.hasOwnProperty, cr = Object.prototype.propertyIsEnumerable, gn = (e, t, n) => t in e ? la(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n, ke = (e, t) => {
  for (var n in t || (t = {})) lr.call(t, n) && gn(e, n, t[n]);
  if (St) for (var n of St(t)) cr.call(t, n) && gn(e, n, t[n]);
  return e;
}, It = (e, t) => ca(e, da(t)), Te = (e, t) => {
  var n = {};
  for (var r in e) lr.call(e, r) && t.indexOf(r) < 0 && (n[r] = e[r]);
  if (e != null && St) for (var r of St(e)) t.indexOf(r) < 0 && cr.call(e, r) && (n[r] = e[r]);
  return n;
}, ua = or(), ne = ua, Xe = /{([^}]*)}/g, dr = /(\d+\s+[\+\-\*\/]\s+\d+)/g, ur = /var\([^)]+\)/g;
function yn(e) {
  return ce(e) ? e.replace(/[A-Z]/g, (t, n) => n === 0 ? t : "." + t.toLowerCase()).toLowerCase() : e;
}
function pa(e) {
  return _e(e) && e.hasOwnProperty("$value") && e.hasOwnProperty("$type") ? e.$value : e;
}
function fa(e) {
  return e.replaceAll(/ /g, "").replace(/[^\w]/g, "-");
}
function Ut(e = "", t = "") {
  return fa(`${ce(e, !1) && ce(t, !1) ? `${e}-` : e}${t}`);
}
function pr(e = "", t = "") {
  return `--${Ut(e, t)}`;
}
function ma(e = "") {
  let t = (e.match(/{/g) || []).length, n = (e.match(/}/g) || []).length;
  return (t + n) % 2 !== 0;
}
function fr(e, t = "", n = "", r = [], o) {
  if (ce(e)) {
    let a = e.trim();
    if (ma(a)) return;
    if (je(a, Xe)) {
      let s = a.replaceAll(Xe, (c) => {
        let i = c.replace(/{|}/g, "").split(".").filter((d) => !r.some((l) => je(d, l)));
        return `var(${pr(n, rr(i.join("-")))}${q(o) ? `, ${o}` : ""})`;
      });
      return je(s.replace(ur, "0"), dr) ? `calc(${s})` : s;
    }
    return a;
  } else if (Qo(e)) return e;
}
function ba(e, t, n) {
  ce(t, !1) && e.push(`${t}:${n};`);
}
function De(e, t) {
  return e ? `${e}{${t}}` : "";
}
function mr(e, t) {
  if (e.indexOf("dt(") === -1) return e;
  function n(s, c) {
    let i = [], d = 0, l = "", u = null, p = 0;
    for (; d <= s.length; ) {
      let m = s[d];
      if ((m === '"' || m === "'" || m === "`") && s[d - 1] !== "\\" && (u = u === m ? null : m), !u && (m === "(" && p++, m === ")" && p--, (m === "," || d === s.length) && p === 0)) {
        let $ = l.trim();
        $.startsWith("dt(") ? i.push(mr($, c)) : i.push(r($)), l = "", d++;
        continue;
      }
      m !== void 0 && (l += m), d++;
    }
    return i;
  }
  function r(s) {
    let c = s[0];
    if ((c === '"' || c === "'" || c === "`") && s[s.length - 1] === c) return s.slice(1, -1);
    let i = Number(s);
    return isNaN(i) ? s : i;
  }
  let o = [], a = [];
  for (let s = 0; s < e.length; s++) if (e[s] === "d" && e.slice(s, s + 3) === "dt(") a.push(s), s += 2;
  else if (e[s] === ")" && a.length > 0) {
    let c = a.pop();
    a.length === 0 && o.push([c, s]);
  }
  if (!o.length) return e;
  for (let s = o.length - 1; s >= 0; s--) {
    let [c, i] = o[s], d = e.slice(c + 3, i), l = n(d, t), u = t(...l);
    e = e.slice(0, c) + u + e.slice(i + 1);
  }
  return e;
}
var Ie = (...e) => ha(Y.getTheme(), ...e), ha = (e = {}, t, n, r) => {
  if (t) {
    let { variable: o, options: a } = Y.defaults || {}, { prefix: s, transform: c } = e?.options || a || {}, i = je(t, Xe) ? t : `{${t}}`;
    return r === "value" || Be(r) && c === "strict" ? Y.getTokenValue(t) : fr(i, void 0, s, [o.excludedKeyRegex], n);
  }
  return "";
};
function gt(e, ...t) {
  if (e instanceof Array) {
    let n = e.reduce((r, o, a) => {
      var s;
      return r + o + ((s = pe(t[a], { dt: Ie })) != null ? s : "");
    }, "");
    return mr(n, Ie);
  }
  return pe(e, { dt: Ie });
}
function va(e, t = {}) {
  let n = Y.defaults.variable, { prefix: r = n.prefix, selector: o = n.selector, excludedKeyRegex: a = n.excludedKeyRegex } = t, s = [], c = [], i = [{ node: e, path: r }];
  for (; i.length; ) {
    let { node: l, path: u } = i.pop();
    for (let p in l) {
      let m = l[p], $ = pa(m), T = je(p, a) ? Ut(u) : Ut(u, rr(p));
      if (_e($)) i.push({ node: $, path: T });
      else {
        let S = pr(T), P = fr($, T, r, [a]);
        ba(c, S, P);
        let O = T;
        r && O.startsWith(r + "-") && (O = O.slice(r.length + 1)), s.push(O.replace(/-/g, "."));
      }
    }
  }
  let d = c.join("");
  return { value: c, tokens: s, declarations: d, css: De(o, d) };
}
var ye = { regex: { rules: { class: { pattern: /^\.([a-zA-Z][\w-]*)$/, resolve(e) {
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
  return va(e, { prefix: t?.prefix });
}, getCommon({ name: e = "", theme: t = {}, params: n, set: r, defaults: o }) {
  var a, s, c, i, d, l, u;
  let { preset: p, options: m } = t, $, T, S, P, O, I, x;
  if (q(p) && m.transform !== "strict") {
    let { primitive: y, semantic: F, extend: R } = p, H = F || {}, { colorScheme: oe } = H, Z = Te(H, ["colorScheme"]), de = R || {}, { colorScheme: z } = de, _ = Te(de, ["colorScheme"]), C = oe || {}, { dark: J } = C, te = Te(C, ["dark"]), ue = z || {}, { dark: me } = ue, Oe = Te(ue, ["dark"]), ge = q(y) ? this._toVariables({ primitive: y }, m) : {}, be = q(Z) ? this._toVariables({ semantic: Z }, m) : {}, se = q(te) ? this._toVariables({ light: te }, m) : {}, k = q(J) ? this._toVariables({ dark: J }, m) : {}, g = q(_) ? this._toVariables({ semantic: _ }, m) : {}, w = q(Oe) ? this._toVariables({ light: Oe }, m) : {}, ae = q(me) ? this._toVariables({ dark: me }, m) : {}, [mt, bt] = [(a = ge.declarations) != null ? a : "", ge.tokens], [Ir, zr] = [(s = be.declarations) != null ? s : "", be.tokens || []], [Vr, Br] = [(c = se.declarations) != null ? c : "", se.tokens || []], [Rr, Dr] = [(i = k.declarations) != null ? i : "", k.tokens || []], [Mr, Fr] = [(d = g.declarations) != null ? d : "", g.tokens || []], [Ur, Wr] = [(l = w.declarations) != null ? l : "", w.tokens || []], [Kr, Hr] = [(u = ae.declarations) != null ? u : "", ae.tokens || []];
    $ = this.transformCSS(e, mt, "light", "variable", m, r, o), T = bt;
    let qr = this.transformCSS(e, `${Ir}${Vr}`, "light", "variable", m, r, o), Yr = this.transformCSS(e, `${Rr}`, "dark", "variable", m, r, o);
    S = `${qr}${Yr}`, P = [.../* @__PURE__ */ new Set([...zr, ...Br, ...Dr])];
    let Gr = this.transformCSS(e, `${Mr}${Ur}color-scheme:light`, "light", "variable", m, r, o), Zr = this.transformCSS(e, `${Kr}color-scheme:dark`, "dark", "variable", m, r, o);
    O = `${Gr}${Zr}`, I = [.../* @__PURE__ */ new Set([...Fr, ...Wr, ...Hr])], x = pe(p.css, { dt: Ie });
  }
  return { primitive: { css: $, tokens: T }, semantic: { css: S, tokens: P }, global: { css: O, tokens: I }, style: x };
}, getPreset({ name: e = "", preset: t = {}, options: n, params: r, set: o, defaults: a, selector: s }) {
  var c, i, d;
  let l, u, p;
  if (q(t) && n.transform !== "strict") {
    let m = e.replace("-directive", ""), $ = t, { colorScheme: T, extend: S, css: P } = $, O = Te($, ["colorScheme", "extend", "css"]), I = S || {}, { colorScheme: x } = I, y = Te(I, ["colorScheme"]), F = T || {}, { dark: R } = F, H = Te(F, ["dark"]), oe = x || {}, { dark: Z } = oe, de = Te(oe, ["dark"]), z = q(O) ? this._toVariables({ [m]: ke(ke({}, O), y) }, n) : {}, _ = q(H) ? this._toVariables({ [m]: ke(ke({}, H), de) }, n) : {}, C = q(R) ? this._toVariables({ [m]: ke(ke({}, R), Z) }, n) : {}, [J, te] = [(c = z.declarations) != null ? c : "", z.tokens || []], [ue, me] = [(i = _.declarations) != null ? i : "", _.tokens || []], [Oe, ge] = [(d = C.declarations) != null ? d : "", C.tokens || []], be = this.transformCSS(m, `${J}${ue}`, "light", "variable", n, o, a, s), se = this.transformCSS(m, Oe, "dark", "variable", n, o, a, s);
    l = `${be}${se}`, u = [.../* @__PURE__ */ new Set([...te, ...me, ...ge])], p = pe(P, { dt: Ie });
  }
  return { css: l, tokens: u, style: p };
}, getPresetC({ name: e = "", theme: t = {}, params: n, set: r, defaults: o }) {
  var a;
  let { preset: s, options: c } = t, i = (a = s?.components) == null ? void 0 : a[e];
  return this.getPreset({ name: e, preset: i, options: c, params: n, set: r, defaults: o });
}, getPresetD({ name: e = "", theme: t = {}, params: n, set: r, defaults: o }) {
  var a, s;
  let c = e.replace("-directive", ""), { preset: i, options: d } = t, l = ((a = i?.components) == null ? void 0 : a[c]) || ((s = i?.directives) == null ? void 0 : s[c]);
  return this.getPreset({ name: c, preset: l, options: d, params: n, set: r, defaults: o });
}, applyDarkColorScheme(e) {
  return !(e.darkModeSelector === "none" || e.darkModeSelector === !1);
}, getColorSchemeOption(e, t) {
  var n;
  return this.applyDarkColorScheme(e) ? this.regex.resolve(e.darkModeSelector === !0 ? t.options.darkModeSelector : (n = e.darkModeSelector) != null ? n : t.options.darkModeSelector) : [];
}, getLayerOrder(e, t = {}, n, r) {
  let { cssLayer: o } = t;
  return o ? `@layer ${pe(o.order || o.name || "primeui", n)}` : "";
}, getCommonStyleSheet({ name: e = "", theme: t = {}, params: n, props: r = {}, set: o, defaults: a }) {
  let s = this.getCommon({ name: e, theme: t, params: n, set: o, defaults: a }), c = Object.entries(r).reduce((i, [d, l]) => i.push(`${d}="${l}"`) && i, []).join(" ");
  return Object.entries(s || {}).reduce((i, [d, l]) => {
    if (_e(l) && Object.hasOwn(l, "css")) {
      let u = Ge(l.css), p = `${d}-variables`;
      i.push(`<style type="text/css" data-primevue-style-id="${p}" ${c}>${u}</style>`);
    }
    return i;
  }, []).join("");
}, getStyleSheet({ name: e = "", theme: t = {}, params: n, props: r = {}, set: o, defaults: a }) {
  var s;
  let c = { name: e, theme: t, params: n, set: o, defaults: a }, i = (s = e.includes("-directive") ? this.getPresetD(c) : this.getPresetC(c)) == null ? void 0 : s.css, d = Object.entries(r).reduce((l, [u, p]) => l.push(`${u}="${p}"`) && l, []).join(" ");
  return i ? `<style type="text/css" data-primevue-style-id="${e}-variables" ${d}>${Ge(i)}</style>` : "";
}, createTokens(e = {}, t, n = "", r = "", o = {}) {
  let a = function(c, i = {}, d = []) {
    if (d.includes(this.path)) return console.warn(`Circular reference detected at ${this.path}`), { colorScheme: c, path: this.path, paths: i, value: void 0 };
    d.push(this.path), i.name = this.path, i.binding || (i.binding = {});
    let l = this.value;
    if (typeof this.value == "string" && Xe.test(this.value)) {
      let u = this.value.trim().replace(Xe, (p) => {
        var m;
        let $ = p.slice(1, -1), T = this.tokens[$];
        if (!T) return console.warn(`Token not found for path: ${$}`), "__UNRESOLVED__";
        let S = T.computed(c, i, d);
        return Array.isArray(S) && S.length === 2 ? `light-dark(${S[0].value},${S[1].value})` : (m = S?.value) != null ? m : "__UNRESOLVED__";
      });
      l = dr.test(u.replace(ur, "0")) ? `calc(${u})` : u;
    }
    return Be(i.binding) && delete i.binding, d.pop(), { colorScheme: c, path: this.path, paths: i, value: l.includes("__UNRESOLVED__") ? void 0 : l };
  }, s = (c, i, d) => {
    Object.entries(c).forEach(([l, u]) => {
      let p = je(l, t.variable.excludedKeyRegex) ? i : i ? `${i}.${yn(l)}` : yn(l), m = d ? `${d}.${l}` : l;
      _e(u) ? s(u, p, m) : (o[p] || (o[p] = { paths: [], computed: ($, T = {}, S = []) => {
        if (o[p].paths.length === 1) return o[p].paths[0].computed(o[p].paths[0].scheme, T.binding, S);
        if ($ && $ !== "none") for (let P = 0; P < o[p].paths.length; P++) {
          let O = o[p].paths[P];
          if (O.scheme === $) return O.computed($, T.binding, S);
        }
        return o[p].paths.map((P) => P.computed(P.scheme, T[P.scheme], S));
      } }), o[p].paths.push({ path: m, value: u, scheme: m.includes("colorScheme.light") ? "light" : m.includes("colorScheme.dark") ? "dark" : "none", computed: a, tokens: o }));
    });
  };
  return s(e, n, r), o;
}, getTokenValue(e, t, n) {
  var r;
  let o = ((c) => c.split(".").filter((i) => !je(i.toLowerCase(), n.variable.excludedKeyRegex)).join("."))(t), a = t.includes("colorScheme.light") ? "light" : t.includes("colorScheme.dark") ? "dark" : void 0, s = [(r = e[o]) == null ? void 0 : r.computed(a)].flat().filter((c) => c);
  return s.length === 1 ? s[0].value : s.reduce((c = {}, i) => {
    let d = i, { colorScheme: l } = d, u = Te(d, ["colorScheme"]);
    return c[l] = u, c;
  }, void 0);
}, getSelectorRule(e, t, n, r) {
  return n === "class" || n === "attr" ? De(q(t) ? `${e}${t},${e} ${t}` : e, r) : De(e, De(t ?? ":root,:host", r));
}, transformCSS(e, t, n, r, o = {}, a, s, c) {
  if (q(t)) {
    let { cssLayer: i } = o;
    if (r !== "style") {
      let d = this.getColorSchemeOption(o, s);
      t = n === "dark" ? d.reduce((l, { type: u, selector: p }) => (q(p) && (l += p.includes("[CSS]") ? p.replace("[CSS]", t) : this.getSelectorRule(p, c, u, t)), l), "") : De(c ?? ":root,:host", t);
    }
    if (i) {
      let d = { name: "primeui" };
      _e(i) && (d.name = pe(i.name, { name: e, type: r })), q(d.name) && (t = De(`@layer ${d.name}`, t), a?.layerNames(d.name));
    }
    return t;
  }
  return "";
} }, Y = { defaults: { variable: { prefix: "p", selector: ":root,:host", excludedKeyRegex: /^(primitive|semantic|components|directives|variables|colorscheme|light|dark|common|root|states|extend|css)$/gi }, options: { prefix: "p", darkModeSelector: "system", cssLayer: !1 } }, _theme: void 0, _layerNames: /* @__PURE__ */ new Set(), _loadedStyleNames: /* @__PURE__ */ new Set(), _loadingStyles: /* @__PURE__ */ new Set(), _tokens: {}, update(e = {}) {
  let { theme: t } = e;
  t && (this._theme = It(ke({}, t), { options: ke(ke({}, this.defaults.options), t.options) }), this._tokens = ye.createTokens(this.preset, this.defaults), this.clearLoadedStyleNames());
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
  this._theme = It(ke({}, this.theme), { preset: e }), this._tokens = ye.createTokens(e, this.defaults), this.clearLoadedStyleNames(), ne.emit("preset:change", e), ne.emit("theme:change", this.theme);
}, getOptions() {
  return this.options;
}, setOptions(e) {
  this._theme = It(ke({}, this.theme), { options: e }), this.clearLoadedStyleNames(), ne.emit("options:change", e), ne.emit("theme:change", this.theme);
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
  return ye.getTokenValue(this.tokens, e, this.defaults);
}, getCommon(e = "", t) {
  return ye.getCommon({ name: e, theme: this.theme, params: t, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } });
}, getComponent(e = "", t) {
  let n = { name: e, theme: this.theme, params: t, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } };
  return ye.getPresetC(n);
}, getDirective(e = "", t) {
  let n = { name: e, theme: this.theme, params: t, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } };
  return ye.getPresetD(n);
}, getCustomPreset(e = "", t, n, r) {
  let o = { name: e, preset: t, options: this.options, selector: n, params: r, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } };
  return ye.getPreset(o);
}, getLayerOrderCSS(e = "") {
  return ye.getLayerOrder(e, this.options, { names: this.getLayerNames() }, this.defaults);
}, transformCSS(e = "", t, n = "style", r) {
  return ye.transformCSS(e, t, r, n, this.options, { layerNames: this.setLayerNames.bind(this) }, this.defaults);
}, getCommonStyleSheet(e = "", t, n = {}) {
  return ye.getCommonStyleSheet({ name: e, theme: this.theme, params: t, props: n, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } });
}, getStyleSheet(e, t, n = {}) {
  return ye.getStyleSheet({ name: e, theme: this.theme, params: t, props: n, defaults: this.defaults, set: { layerNames: this.setLayerNames.bind(this) } });
}, onStyleMounted(e) {
  this._loadingStyles.add(e);
}, onStyleUpdated(e) {
  this._loadingStyles.add(e);
}, onStyleLoaded(e, { name: t }) {
  this._loadingStyles.size && (this._loadingStyles.delete(t), ne.emit(`theme:${t}:load`, e), !this._loadingStyles.size && ne.emit("theme:load"));
} }, re = {
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
}, ga = `
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
function et(e) {
  "@babel/helpers - typeof";
  return et = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, et(e);
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
function xn(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? kn(Object(n), !0).forEach(function(r) {
      ya(e, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : kn(Object(n)).forEach(function(r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return e;
}
function ya(e, t, n) {
  return (t = ka(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function ka(e) {
  var t = xa(e, "string");
  return et(t) == "symbol" ? t : t + "";
}
function xa(e, t) {
  if (et(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (et(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
function wa(e) {
  var t = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0;
  Bt() && Bt().components ? tn(e) : t ? e() : nn(e);
}
var $a = 0;
function Sa(e) {
  var t = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, n = D(!1), r = D(e), o = D(null), a = sr() ? window.document : void 0, s = t.document, c = s === void 0 ? a : s, i = t.immediate, d = i === void 0 ? !0 : i, l = t.manual, u = l === void 0 ? !1 : l, p = t.name, m = p === void 0 ? "style_".concat(++$a) : p, $ = t.id, T = $ === void 0 ? void 0 : $, S = t.media, P = S === void 0 ? void 0 : S, O = t.nonce, I = O === void 0 ? void 0 : O, x = t.first, y = x === void 0 ? !1 : x, F = t.onMounted, R = F === void 0 ? void 0 : F, H = t.onUpdated, oe = H === void 0 ? void 0 : H, Z = t.onLoad, de = Z === void 0 ? void 0 : Z, z = t.props, _ = z === void 0 ? {} : z, C = function() {
  }, J = function(me) {
    var Oe = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    if (c) {
      var ge = xn(xn({}, _), Oe), be = ge.name || m, se = ge.id || T, k = ge.nonce || I;
      o.value = c.querySelector('style[data-primevue-style-id="'.concat(be, '"]')) || c.getElementById(se) || c.createElement("style"), o.value.isConnected || (r.value = me || e, $t(o.value, {
        type: "text/css",
        id: se,
        media: P,
        nonce: k
      }), y ? c.head.prepend(o.value) : c.head.appendChild(o.value), ia(o.value, "data-primevue-style-id", be), $t(o.value, ge), o.value.onload = function(g) {
        return de?.(g, {
          name: be
        });
      }, R?.(be)), !n.value && (C = Pe(r, function(g) {
        o.value.textContent = g, oe?.(be);
      }, {
        immediate: !0
      }), n.value = !0);
    }
  }, te = function() {
    !c || !n.value || (C(), ra(o.value) && c.head.removeChild(o.value), n.value = !1, o.value = null);
  };
  return d && !u && wa(J), {
    id: T,
    name: m,
    el: o,
    css: r,
    unload: te,
    load: J,
    isLoaded: to(n)
  };
}
function tt(e) {
  "@babel/helpers - typeof";
  return tt = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, tt(e);
}
var wn, $n, Sn, _n;
function Cn(e, t) {
  return Pa(e) || Ta(e, t) || Ca(e, t) || _a();
}
function _a() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Ca(e, t) {
  if (e) {
    if (typeof e == "string") return Tn(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Tn(e, t) : void 0;
  }
}
function Tn(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function Ta(e, t) {
  var n = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (n != null) {
    var r, o, a, s, c = [], i = !0, d = !1;
    try {
      if (a = (n = n.call(e)).next, t !== 0) for (; !(i = (r = a.call(n)).done) && (c.push(r.value), c.length !== t); i = !0) ;
    } catch (l) {
      d = !0, o = l;
    } finally {
      try {
        if (!i && n.return != null && (s = n.return(), Object(s) !== s)) return;
      } finally {
        if (d) throw o;
      }
    }
    return c;
  }
}
function Pa(e) {
  if (Array.isArray(e)) return e;
}
function Pn(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(e);
    t && (r = r.filter(function(o) {
      return Object.getOwnPropertyDescriptor(e, o).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function zt(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? Pn(Object(n), !0).forEach(function(r) {
      Oa(e, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Pn(Object(n)).forEach(function(r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return e;
}
function Oa(e, t, n) {
  return (t = Aa(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Aa(e) {
  var t = La(e, "string");
  return tt(t) == "symbol" ? t : t + "";
}
function La(e, t) {
  if (tt(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (tt(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
function yt(e, t) {
  return t || (t = e.slice(0)), Object.freeze(Object.defineProperties(e, { raw: { value: Object.freeze(t) } }));
}
var Ea = function(t) {
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
}, Na = {}, ja = {}, W = {
  name: "base",
  css: Ea,
  style: ga,
  classes: Na,
  inlineStyles: ja,
  load: function(t) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, r = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : function(a) {
      return a;
    }, o = r(gt(wn || (wn = yt(["", ""])), t));
    return q(o) ? Sa(Ge(o), zt({
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
      return Y.transformCSS(n.name || t.name, "".concat(o).concat(gt($n || ($n = yt(["", ""])), r)));
    });
  },
  getCommonTheme: function(t) {
    return Y.getCommon(this.name, t);
  },
  getComponentTheme: function(t) {
    return Y.getComponent(this.name, t);
  },
  getDirectiveTheme: function(t) {
    return Y.getDirective(this.name, t);
  },
  getPresetTheme: function(t, n, r) {
    return Y.getCustomPreset(this.name, t, n, r);
  },
  getLayerOrderThemeCSS: function() {
    return Y.getLayerOrderCSS(this.name);
  },
  getStyleSheet: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    if (this.css) {
      var r = pe(this.css, {
        dt: Ie
      }) || "", o = Ge(gt(Sn || (Sn = yt(["", "", ""])), r, t)), a = Object.entries(n).reduce(function(s, c) {
        var i = Cn(c, 2), d = i[0], l = i[1];
        return s.push("".concat(d, '="').concat(l, '"')) && s;
      }, []).join(" ");
      return q(o) ? '<style type="text/css" data-primevue-style-id="'.concat(this.name, '" ').concat(a, ">").concat(o, "</style>") : "";
    }
    return "";
  },
  getCommonThemeStyleSheet: function(t) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    return Y.getCommonStyleSheet(this.name, t, n);
  },
  getThemeStyleSheet: function(t) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, r = [Y.getStyleSheet(this.name, t, n)];
    if (this.style) {
      var o = this.name === "base" ? "global-style" : "".concat(this.name, "-style"), a = gt(_n || (_n = yt(["", ""])), pe(this.style, {
        dt: Ie
      })), s = Ge(Y.transformCSS(o, a)), c = Object.entries(n).reduce(function(i, d) {
        var l = Cn(d, 2), u = l[0], p = l[1];
        return i.push("".concat(u, '="').concat(p, '"')) && i;
      }, []).join(" ");
      q(s) && r.push('<style type="text/css" data-primevue-style-id="'.concat(o, '" ').concat(c, ">").concat(s, "</style>"));
    }
    return r.join("");
  },
  extend: function(t) {
    return zt(zt({}, this), {}, {
      css: void 0,
      style: void 0
    }, t);
  }
}, Ee = or();
function nt(e) {
  "@babel/helpers - typeof";
  return nt = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, nt(e);
}
function On(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(e);
    t && (r = r.filter(function(o) {
      return Object.getOwnPropertyDescriptor(e, o).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function kt(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? On(Object(n), !0).forEach(function(r) {
      Ia(e, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : On(Object(n)).forEach(function(r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return e;
}
function Ia(e, t, n) {
  return (t = za(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function za(e) {
  var t = Va(e, "string");
  return nt(t) == "symbol" ? t : t + "";
}
function Va(e, t) {
  if (nt(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (nt(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var Ba = {
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
    text: [re.STARTS_WITH, re.CONTAINS, re.NOT_CONTAINS, re.ENDS_WITH, re.EQUALS, re.NOT_EQUALS],
    numeric: [re.EQUALS, re.NOT_EQUALS, re.LESS_THAN, re.LESS_THAN_OR_EQUAL_TO, re.GREATER_THAN, re.GREATER_THAN_OR_EQUAL_TO],
    date: [re.DATE_IS, re.DATE_IS_NOT, re.DATE_BEFORE, re.DATE_AFTER]
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
}, Ra = Symbol();
function Da(e, t) {
  var n = {
    config: no(t)
  };
  return e.config.globalProperties.$primevue = n, e.provide(Ra, n), Ma(), Fa(e, n), n;
}
var Fe = [];
function Ma() {
  ne.clear(), Fe.forEach(function(e) {
    return e?.();
  }), Fe = [];
}
function Fa(e, t) {
  var n = D(!1), r = function() {
    var d;
    if (((d = t.config) === null || d === void 0 ? void 0 : d.theme) !== "none" && !Y.isStyleNameLoaded("common")) {
      var l, u, p = ((l = W.getCommonTheme) === null || l === void 0 ? void 0 : l.call(W)) || {}, m = p.primitive, $ = p.semantic, T = p.global, S = p.style, P = {
        nonce: (u = t.config) === null || u === void 0 || (u = u.csp) === null || u === void 0 ? void 0 : u.nonce
      };
      W.load(m?.css, kt({
        name: "primitive-variables"
      }, P)), W.load($?.css, kt({
        name: "semantic-variables"
      }, P)), W.load(T?.css, kt({
        name: "global-variables"
      }, P)), W.loadStyle(kt({
        name: "global-style"
      }, P), S), Y.setLoadedStyleName("common");
    }
  };
  ne.on("theme:change", function(i) {
    n.value || (e.config.globalProperties.$primevue.config.theme = i, n.value = !0);
  });
  var o = Pe(t.config, function(i, d) {
    Ee.emit("config:change", {
      newValue: i,
      oldValue: d
    });
  }, {
    immediate: !0,
    deep: !0
  }), a = Pe(function() {
    return t.config.ripple;
  }, function(i, d) {
    Ee.emit("config:ripple:change", {
      newValue: i,
      oldValue: d
    });
  }, {
    immediate: !0,
    deep: !0
  }), s = Pe(function() {
    return t.config.theme;
  }, function(i, d) {
    n.value || Y.setTheme(i), t.config.unstyled || r(), n.value = !1, Ee.emit("config:theme:change", {
      newValue: i,
      oldValue: d
    });
  }, {
    immediate: !0,
    deep: !1
  }), c = Pe(function() {
    return t.config.unstyled;
  }, function(i, d) {
    !i && t.config.theme && r(), Ee.emit("config:unstyled:change", {
      newValue: i,
      oldValue: d
    });
  }, {
    immediate: !0,
    deep: !0
  });
  Fe.push(o), Fe.push(a), Fe.push(s), Fe.push(c);
}
var Ua = {
  install: function(t, n) {
    var r = Jo(Ba, n);
    Da(t, r);
  }
}, br = {
  data: function() {
    return {
      mounted: !1
    };
  },
  mounted: function() {
    this.mounted = sr();
  },
  computed: {
    inline: function() {
      return this.disabled || this.appendTo === "self";
    }
  }
};
function Wa(e, t, n, r, o, a) {
  return a.inline ? G(e.$slots, "default", {
    key: 0
  }) : o.mounted ? (f(), j(Yn, {
    key: 1,
    to: n.appendTo
  }, [G(e.$slots, "default")], 8, ["to"])) : A("", !0);
}
br.render = Wa;
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
function Ka() {
  var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "pc", t = ro();
  return "".concat(e).concat(t.replace("v-", "").replaceAll("-", "_"));
}
var An = W.extend({
  name: "common"
});
function rt(e) {
  "@babel/helpers - typeof";
  return rt = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, rt(e);
}
function Ha(e) {
  return gr(e) || qa(e) || vr(e) || hr();
}
function qa(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function We(e, t) {
  return gr(e) || Ya(e, t) || vr(e, t) || hr();
}
function hr() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function vr(e, t) {
  if (e) {
    if (typeof e == "string") return Wt(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Wt(e, t) : void 0;
  }
}
function Wt(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function Ya(e, t) {
  var n = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (n != null) {
    var r, o, a, s, c = [], i = !0, d = !1;
    try {
      if (a = (n = n.call(e)).next, t === 0) {
        if (Object(n) !== n) return;
        i = !1;
      } else for (; !(i = (r = a.call(n)).done) && (c.push(r.value), c.length !== t); i = !0) ;
    } catch (l) {
      d = !0, o = l;
    } finally {
      try {
        if (!i && n.return != null && (s = n.return(), Object(s) !== s)) return;
      } finally {
        if (d) throw o;
      }
    }
    return c;
  }
}
function gr(e) {
  if (Array.isArray(e)) return e;
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
function M(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? Ln(Object(n), !0).forEach(function(r) {
      Ye(e, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Ln(Object(n)).forEach(function(r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return e;
}
function Ye(e, t, n) {
  return (t = Ga(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Ga(e) {
  var t = Za(e, "string");
  return rt(t) == "symbol" ? t : t + "";
}
function Za(e, t) {
  if (rt(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (rt(r) != "object") return r;
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
        ne.off("theme:change", this._loadCoreStyles), t || (this._loadCoreStyles(), this._themeChangeListener(this._loadCoreStyles));
      }
    },
    dt: {
      immediate: !0,
      handler: function(t, n) {
        var r = this;
        ne.off("theme:change", this._themeScopedListener), t ? (this._loadScopedThemeStyles(t), this._themeScopedListener = function() {
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
    var t, n, r, o, a, s, c, i, d, l, u, p = (t = this.pt) === null || t === void 0 ? void 0 : t._usept, m = p ? (n = this.pt) === null || n === void 0 || (n = n.originalValue) === null || n === void 0 ? void 0 : n[this.$.type.name] : void 0, $ = p ? (r = this.pt) === null || r === void 0 || (r = r.value) === null || r === void 0 ? void 0 : r[this.$.type.name] : this.pt;
    (o = $ || m) === null || o === void 0 || (o = o.hooks) === null || o === void 0 || (a = o.onBeforeCreate) === null || a === void 0 || a.call(o);
    var T = (s = this.$primevueConfig) === null || s === void 0 || (s = s.pt) === null || s === void 0 ? void 0 : s._usept, S = T ? (c = this.$primevue) === null || c === void 0 || (c = c.config) === null || c === void 0 || (c = c.pt) === null || c === void 0 ? void 0 : c.originalValue : void 0, P = T ? (i = this.$primevue) === null || i === void 0 || (i = i.config) === null || i === void 0 || (i = i.pt) === null || i === void 0 ? void 0 : i.value : (d = this.$primevue) === null || d === void 0 || (d = d.config) === null || d === void 0 ? void 0 : d.pt;
    (l = P || S) === null || l === void 0 || (l = l[this.$.type.name]) === null || l === void 0 || (l = l.hooks) === null || l === void 0 || (u = l.onBeforeCreate) === null || u === void 0 || u.call(l), this.$attrSelector = Ka(), this.uid = this.$attrs.id || this.$attrSelector.replace("pc", "pv_id_");
  },
  created: function() {
    this._hook("onCreated");
  },
  beforeMount: function() {
    var t;
    this.rootEl = Je(pt(this.$el) ? this.$el : (t = this.$el) === null || t === void 0 ? void 0 : t.parentElement, "[".concat(this.$attrSelector, "]")), this.rootEl && (this.rootEl.$pc = M({
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
      return Lt(t) ? t.apply(void 0, r) : E.apply(void 0, r);
    },
    _load: function() {
      Ae.isStyleNameLoaded("base") || (W.loadCSS(this.$styleOptions), this._loadGlobalStyles(), Ae.setLoadedStyleName("base")), this._loadThemeStyles();
    },
    _loadStyles: function() {
      this._load(), this._themeChangeListener(this._load);
    },
    _loadCoreStyles: function() {
      var t, n;
      !Ae.isStyleNameLoaded((t = this.$style) === null || t === void 0 ? void 0 : t.name) && (n = this.$style) !== null && n !== void 0 && n.name && (An.loadCSS(this.$styleOptions), this.$options.style && this.$style.loadCSS(this.$styleOptions), Ae.setLoadedStyleName(this.$style.name));
    },
    _loadGlobalStyles: function() {
      var t = this._useGlobalPT(this._getOptionValue, "global.css", this.$params);
      q(t) && W.load(t, M({
        name: "global"
      }, this.$styleOptions));
    },
    _loadThemeStyles: function() {
      var t, n;
      if (!(this.isUnstyled || this.$theme === "none")) {
        if (!Y.isStyleNameLoaded("common")) {
          var r, o, a = ((r = this.$style) === null || r === void 0 || (o = r.getCommonTheme) === null || o === void 0 ? void 0 : o.call(r)) || {}, s = a.primitive, c = a.semantic, i = a.global, d = a.style;
          W.load(s?.css, M({
            name: "primitive-variables"
          }, this.$styleOptions)), W.load(c?.css, M({
            name: "semantic-variables"
          }, this.$styleOptions)), W.load(i?.css, M({
            name: "global-variables"
          }, this.$styleOptions)), W.loadStyle(M({
            name: "global-style"
          }, this.$styleOptions), d), Y.setLoadedStyleName("common");
        }
        if (!Y.isStyleNameLoaded((t = this.$style) === null || t === void 0 ? void 0 : t.name) && (n = this.$style) !== null && n !== void 0 && n.name) {
          var l, u, p, m, $ = ((l = this.$style) === null || l === void 0 || (u = l.getComponentTheme) === null || u === void 0 ? void 0 : u.call(l)) || {}, T = $.css, S = $.style;
          (p = this.$style) === null || p === void 0 || p.load(T, M({
            name: "".concat(this.$style.name, "-variables")
          }, this.$styleOptions)), (m = this.$style) === null || m === void 0 || m.loadStyle(M({
            name: "".concat(this.$style.name, "-style")
          }, this.$styleOptions), S), Y.setLoadedStyleName(this.$style.name);
        }
        if (!Y.isStyleNameLoaded("layer-order")) {
          var P, O, I = (P = this.$style) === null || P === void 0 || (O = P.getLayerOrderThemeCSS) === null || O === void 0 ? void 0 : O.call(P);
          W.load(I, M({
            name: "layer-order",
            first: !0
          }, this.$styleOptions)), Y.setLoadedStyleName("layer-order");
        }
      }
    },
    _loadScopedThemeStyles: function(t) {
      var n, r, o, a = ((n = this.$style) === null || n === void 0 || (r = n.getPresetTheme) === null || r === void 0 ? void 0 : r.call(n, t, "[".concat(this.$attrSelector, "]"))) || {}, s = a.css, c = (o = this.$style) === null || o === void 0 ? void 0 : o.load(s, M({
        name: "".concat(this.$attrSelector, "-").concat(this.$style.name)
      }, this.$styleOptions));
      this.scopedStyleEl = c.el;
    },
    _unloadScopedThemeStyles: function() {
      var t;
      (t = this.scopedStyleEl) === null || t === void 0 || (t = t.value) === null || t === void 0 || t.remove();
    },
    _themeChangeListener: function() {
      var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : function() {
      };
      Ae.clearLoadedStyleNames(), ne.on("theme:change", t);
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
      var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", r = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
      return on(t, n, r);
    },
    _getPTValue: function() {
      var t, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", o = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {}, a = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : !0, s = /./g.test(r) && !!o[r.split(".")[0]], c = this._getPropValue("ptOptions") || ((t = this.$primevueConfig) === null || t === void 0 ? void 0 : t.ptOptions) || {}, i = c.mergeSections, d = i === void 0 ? !0 : i, l = c.mergeProps, u = l === void 0 ? !1 : l, p = a ? s ? this._useGlobalPT(this._getPTClassValue, r, o) : this._useDefaultPT(this._getPTClassValue, r, o) : void 0, m = s ? void 0 : this._getPTSelf(n, this._getPTClassValue, r, M(M({}, o), {}, {
        global: p || {}
      })), $ = this._getPTDatasets(r);
      return d || !d && m ? u ? this._mergeProps(u, p, m, $) : M(M(M({}, p), m), $) : M(M({}, m), $);
    },
    _getPTSelf: function() {
      for (var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length, r = new Array(n > 1 ? n - 1 : 0), o = 1; o < n; o++)
        r[o - 1] = arguments[o];
      return E(
        this._usePT.apply(this, [this._getPT(t, this.$name)].concat(r)),
        // Exp; <component :pt="{}"
        this._usePT.apply(this, [this.$_attrsPT].concat(r))
        // Exp; <component :pt:[passthrough_key]:[attribute]="{value}" or <component :pt:[passthrough_key]="() =>{value}"
      );
    },
    _getPTDatasets: function() {
      var t, n, r = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", o = "data-pc-", a = r === "root" && q((t = this.pt) === null || t === void 0 ? void 0 : t["data-pc-section"]);
      return r !== "transition" && M(M({}, r === "root" && M(M(Ye({}, "".concat(o, "name"), Se(a ? (n = this.pt) === null || n === void 0 ? void 0 : n["data-pc-section"] : this.$.type.name)), a && Ye({}, "".concat(o, "extend"), Se(this.$.type.name))), {}, Ye({}, "".concat(this.$attrSelector), ""))), {}, Ye({}, "".concat(o, "section"), Se(r)));
    },
    _getPTClassValue: function() {
      var t = this._getOptionValue.apply(this, arguments);
      return ce(t) || nr(t) ? {
        class: t
      } : t;
    },
    _getPT: function(t) {
      var n = this, r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", o = arguments.length > 2 ? arguments[2] : void 0, a = function(c) {
        var i, d = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1, l = o ? o(c) : c, u = Se(r), p = Se(n.$name);
        return (i = d ? u !== p ? l?.[u] : void 0 : l?.[u]) !== null && i !== void 0 ? i : l;
      };
      return t != null && t.hasOwnProperty("_usept") ? {
        _usept: t._usept,
        originalValue: a(t.originalValue),
        value: a(t.value)
      } : a(t, !0);
    },
    _usePT: function(t, n, r, o) {
      var a = function(T) {
        return n(T, r, o);
      };
      if (t != null && t.hasOwnProperty("_usept")) {
        var s, c = t._usept || ((s = this.$primevueConfig) === null || s === void 0 ? void 0 : s.ptOptions) || {}, i = c.mergeSections, d = i === void 0 ? !0 : i, l = c.mergeProps, u = l === void 0 ? !1 : l, p = a(t.originalValue), m = a(t.value);
        return p === void 0 && m === void 0 ? void 0 : ce(m) ? m : ce(p) ? p : d || !d && m ? u ? this._mergeProps(u, p, m) : M(M({}, p), m) : m;
      }
      return a(t);
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
      var t, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, o = E(this.$_attrsWithoutPT, this.ptm(n, r));
      return o?.hasOwnProperty("id") && ((t = o.id) !== null && t !== void 0 || (o.id = this.$id)), o;
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
        var o = this._getOptionValue(this.$style.inlineStyles, t, M(M({}, this.$params), r)), a = this._getOptionValue(An.inlineStyles, t, M(M({}, this.$params), r));
        return [a, o];
      }
    }
  },
  computed: {
    globalPT: function() {
      var t, n = this;
      return this._getPT((t = this.$primevueConfig) === null || t === void 0 ? void 0 : t.pt, void 0, function(r) {
        return pe(r, {
          instance: n
        });
      });
    },
    defaultPT: function() {
      var t, n = this;
      return this._getPT((t = this.$primevueConfig) === null || t === void 0 ? void 0 : t.pt, void 0, function(r) {
        return n._getOptionValue(r, n.$name, M({}, n.$params)) || pe(r, M({}, n.$params));
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
        var o = We(r, 1), a = o[0];
        return n?.includes(a);
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
        var n = We(t, 1), r = n[0];
        return r?.startsWith("pt:");
      }).reduce(function(t, n) {
        var r = We(n, 2), o = r[0], a = r[1], s = o.split(":"), c = Ha(s), i = Wt(c).slice(1);
        return i?.reduce(function(d, l, u, p) {
          return !d[l] && (d[l] = u === p.length - 1 ? a : {}), d[l];
        }, t), t;
      }, {});
    },
    $_attrsWithoutPT: function() {
      return Object.entries(this.$attrs || {}).filter(function(t) {
        var n = We(t, 1), r = n[0];
        return !(r != null && r.startsWith("pt:"));
      }).reduce(function(t, n) {
        var r = We(n, 2), o = r[0], a = r[1];
        return t[o] = a, t;
      }, {});
    }
  }
}, Qa = `
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
`, Ja = W.extend({
  name: "baseicon",
  css: Qa
});
function ot(e) {
  "@babel/helpers - typeof";
  return ot = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, ot(e);
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
function Nn(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? En(Object(n), !0).forEach(function(r) {
      Xa(e, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : En(Object(n)).forEach(function(r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return e;
}
function Xa(e, t, n) {
  return (t = ei(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function ei(e) {
  var t = ti(e, "string");
  return ot(t) == "symbol" ? t : t + "";
}
function ti(e, t) {
  if (ot(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (ot(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var Et = {
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
  style: Ja,
  provide: function() {
    return {
      $pcIcon: this,
      $parentInstance: this
    };
  },
  methods: {
    pti: function() {
      var t = Be(this.label);
      return Nn(Nn({}, !this.isUnstyled && {
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
function at(e) {
  "@babel/helpers - typeof";
  return at = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, at(e);
}
function jn(e, t) {
  return ai(e) || oi(e, t) || ri(e, t) || ni();
}
function ni() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function ri(e, t) {
  if (e) {
    if (typeof e == "string") return In(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? In(e, t) : void 0;
  }
}
function In(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function oi(e, t) {
  var n = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (n != null) {
    var r, o, a, s, c = [], i = !0, d = !1;
    try {
      if (a = (n = n.call(e)).next, t !== 0) for (; !(i = (r = a.call(n)).done) && (c.push(r.value), c.length !== t); i = !0) ;
    } catch (l) {
      d = !0, o = l;
    } finally {
      try {
        if (!i && n.return != null && (s = n.return(), Object(s) !== s)) return;
      } finally {
        if (d) throw o;
      }
    }
    return c;
  }
}
function ai(e) {
  if (Array.isArray(e)) return e;
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
function U(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? zn(Object(n), !0).forEach(function(r) {
      Kt(e, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : zn(Object(n)).forEach(function(r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return e;
}
function Kt(e, t, n) {
  return (t = ii(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function ii(e) {
  var t = si(e, "string");
  return at(t) == "symbol" ? t : t + "";
}
function si(e, t) {
  if (at(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (at(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var V = {
  _getMeta: function() {
    return [_e(arguments.length <= 0 ? void 0 : arguments[0]) || arguments.length <= 0 ? void 0 : arguments[0], pe(_e(arguments.length <= 0 ? void 0 : arguments[0]) ? arguments.length <= 0 ? void 0 : arguments[0] : arguments.length <= 1 ? void 0 : arguments[1])];
  },
  _getConfig: function(t, n) {
    var r, o, a;
    return (r = (t == null || (o = t.instance) === null || o === void 0 ? void 0 : o.$primevue) || (n == null || (a = n.ctx) === null || a === void 0 || (a = a.appContext) === null || a === void 0 || (a = a.config) === null || a === void 0 || (a = a.globalProperties) === null || a === void 0 ? void 0 : a.$primevue)) === null || r === void 0 ? void 0 : r.config;
  },
  _getOptionValue: on,
  _getPTValue: function() {
    var t, n, r = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, o = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, a = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : "", s = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : {}, c = arguments.length > 4 && arguments[4] !== void 0 ? arguments[4] : !0, i = function() {
      var O = V._getOptionValue.apply(V, arguments);
      return ce(O) || nr(O) ? {
        class: O
      } : O;
    }, d = ((t = r.binding) === null || t === void 0 || (t = t.value) === null || t === void 0 ? void 0 : t.ptOptions) || ((n = r.$primevueConfig) === null || n === void 0 ? void 0 : n.ptOptions) || {}, l = d.mergeSections, u = l === void 0 ? !0 : l, p = d.mergeProps, m = p === void 0 ? !1 : p, $ = c ? V._useDefaultPT(r, r.defaultPT(), i, a, s) : void 0, T = V._usePT(r, V._getPT(o, r.$name), i, a, U(U({}, s), {}, {
      global: $ || {}
    })), S = V._getPTDatasets(r, a);
    return u || !u && T ? m ? V._mergeProps(r, m, $, T, S) : U(U(U({}, $), T), S) : U(U({}, T), S);
  },
  _getPTDatasets: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", r = "data-pc-";
    return U(U({}, n === "root" && Kt({}, "".concat(r, "name"), Se(t.$name))), {}, Kt({}, "".concat(r, "section"), Se(n)));
  },
  _getPT: function(t) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", r = arguments.length > 2 ? arguments[2] : void 0, o = function(s) {
      var c, i = r ? r(s) : s, d = Se(n);
      return (c = i?.[d]) !== null && c !== void 0 ? c : i;
    };
    return t && Object.hasOwn(t, "_usept") ? {
      _usept: t._usept,
      originalValue: o(t.originalValue),
      value: o(t.value)
    } : o(t);
  },
  _usePT: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 ? arguments[1] : void 0, r = arguments.length > 2 ? arguments[2] : void 0, o = arguments.length > 3 ? arguments[3] : void 0, a = arguments.length > 4 ? arguments[4] : void 0, s = function(S) {
      return r(S, o, a);
    };
    if (n && Object.hasOwn(n, "_usept")) {
      var c, i = n._usept || ((c = t.$primevueConfig) === null || c === void 0 ? void 0 : c.ptOptions) || {}, d = i.mergeSections, l = d === void 0 ? !0 : d, u = i.mergeProps, p = u === void 0 ? !1 : u, m = s(n.originalValue), $ = s(n.value);
      return m === void 0 && $ === void 0 ? void 0 : ce($) ? $ : ce(m) ? m : l || !l && $ ? p ? V._mergeProps(t, p, m, $) : U(U({}, m), $) : $;
    }
    return s(n);
  },
  _useDefaultPT: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, r = arguments.length > 2 ? arguments[2] : void 0, o = arguments.length > 3 ? arguments[3] : void 0, a = arguments.length > 4 ? arguments[4] : void 0;
    return V._usePT(t, n, r, o, a);
  },
  _loadStyles: function() {
    var t, n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, r = arguments.length > 1 ? arguments[1] : void 0, o = arguments.length > 2 ? arguments[2] : void 0, a = V._getConfig(r, o), s = {
      nonce: a == null || (t = a.csp) === null || t === void 0 ? void 0 : t.nonce
    };
    V._loadCoreStyles(n, s), V._loadThemeStyles(n, s), V._loadScopedThemeStyles(n, s), V._removeThemeListeners(n), n.$loadStyles = function() {
      return V._loadThemeStyles(n, s);
    }, V._themeChangeListener(n.$loadStyles);
  },
  _loadCoreStyles: function() {
    var t, n, r = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, o = arguments.length > 1 ? arguments[1] : void 0;
    if (!Ae.isStyleNameLoaded((t = r.$style) === null || t === void 0 ? void 0 : t.name) && (n = r.$style) !== null && n !== void 0 && n.name) {
      var a;
      W.loadCSS(o), (a = r.$style) === null || a === void 0 || a.loadCSS(o), Ae.setLoadedStyleName(r.$style.name);
    }
  },
  _loadThemeStyles: function() {
    var t, n, r, o = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, a = arguments.length > 1 ? arguments[1] : void 0;
    if (!(o != null && o.isUnstyled() || (o == null || (t = o.theme) === null || t === void 0 ? void 0 : t.call(o)) === "none")) {
      if (!Y.isStyleNameLoaded("common")) {
        var s, c, i = ((s = o.$style) === null || s === void 0 || (c = s.getCommonTheme) === null || c === void 0 ? void 0 : c.call(s)) || {}, d = i.primitive, l = i.semantic, u = i.global, p = i.style;
        W.load(d?.css, U({
          name: "primitive-variables"
        }, a)), W.load(l?.css, U({
          name: "semantic-variables"
        }, a)), W.load(u?.css, U({
          name: "global-variables"
        }, a)), W.loadStyle(U({
          name: "global-style"
        }, a), p), Y.setLoadedStyleName("common");
      }
      if (!Y.isStyleNameLoaded((n = o.$style) === null || n === void 0 ? void 0 : n.name) && (r = o.$style) !== null && r !== void 0 && r.name) {
        var m, $, T, S, P = ((m = o.$style) === null || m === void 0 || ($ = m.getDirectiveTheme) === null || $ === void 0 ? void 0 : $.call(m)) || {}, O = P.css, I = P.style;
        (T = o.$style) === null || T === void 0 || T.load(O, U({
          name: "".concat(o.$style.name, "-variables")
        }, a)), (S = o.$style) === null || S === void 0 || S.loadStyle(U({
          name: "".concat(o.$style.name, "-style")
        }, a), I), Y.setLoadedStyleName(o.$style.name);
      }
      if (!Y.isStyleNameLoaded("layer-order")) {
        var x, y, F = (x = o.$style) === null || x === void 0 || (y = x.getLayerOrderThemeCSS) === null || y === void 0 ? void 0 : y.call(x);
        W.load(F, U({
          name: "layer-order",
          first: !0
        }, a)), Y.setLoadedStyleName("layer-order");
      }
    }
  },
  _loadScopedThemeStyles: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, n = arguments.length > 1 ? arguments[1] : void 0, r = t.preset();
    if (r && t.$attrSelector) {
      var o, a, s, c = ((o = t.$style) === null || o === void 0 || (a = o.getPresetTheme) === null || a === void 0 ? void 0 : a.call(o, r, "[".concat(t.$attrSelector, "]"))) || {}, i = c.css, d = (s = t.$style) === null || s === void 0 ? void 0 : s.load(i, U({
        name: "".concat(t.$attrSelector, "-").concat(t.$style.name)
      }, n));
      t.scopedStyleEl = d.el;
    }
  },
  _themeChangeListener: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : function() {
    };
    Ae.clearLoadedStyleNames(), ne.on("theme:change", t);
  },
  _removeThemeListeners: function() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    ne.off("theme:change", t.$loadStyles), t.$loadStyles = void 0;
  },
  _hook: function(t, n, r, o, a, s) {
    var c, i, d = "on".concat(Xo(n)), l = V._getConfig(o, a), u = r?.$instance, p = V._usePT(u, V._getPT(o == null || (c = o.value) === null || c === void 0 ? void 0 : c.pt, t), V._getOptionValue, "hooks.".concat(d)), m = V._useDefaultPT(u, l == null || (i = l.pt) === null || i === void 0 || (i = i.directives) === null || i === void 0 ? void 0 : i[t], V._getOptionValue, "hooks.".concat(d)), $ = {
      el: r,
      binding: o,
      vnode: a,
      prevVnode: s
    };
    p?.(u, $), m?.(u, $);
  },
  /* eslint-disable-next-line no-unused-vars */
  _mergeProps: function() {
    for (var t = arguments.length > 1 ? arguments[1] : void 0, n = arguments.length, r = new Array(n > 2 ? n - 2 : 0), o = 2; o < n; o++)
      r[o - 2] = arguments[o];
    return Lt(t) ? t.apply(void 0, r) : E.apply(void 0, r);
  },
  _extend: function(t) {
    var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, r = function(c, i, d, l, u) {
      var p, m, $, T;
      i._$instances = i._$instances || {};
      var S = V._getConfig(d, l), P = i._$instances[t] || {}, O = Be(P) ? U(U({}, n), n?.methods) : {};
      i._$instances[t] = U(U({}, P), {}, {
        /* new instance variables to pass in directive methods */
        $name: t,
        $host: i,
        $binding: d,
        $modifiers: d?.modifiers,
        $value: d?.value,
        $el: P.$el || i || void 0,
        $style: U({
          classes: void 0,
          inlineStyles: void 0,
          load: function() {
          },
          loadCSS: function() {
          },
          loadStyle: function() {
          }
        }, n?.style),
        $primevueConfig: S,
        $attrSelector: (p = i.$pd) === null || p === void 0 || (p = p[t]) === null || p === void 0 ? void 0 : p.attrSelector,
        /* computed instance variables */
        defaultPT: function() {
          return V._getPT(S?.pt, void 0, function(x) {
            var y;
            return x == null || (y = x.directives) === null || y === void 0 ? void 0 : y[t];
          });
        },
        isUnstyled: function() {
          var x, y;
          return ((x = i._$instances[t]) === null || x === void 0 || (x = x.$binding) === null || x === void 0 || (x = x.value) === null || x === void 0 ? void 0 : x.unstyled) !== void 0 ? (y = i._$instances[t]) === null || y === void 0 || (y = y.$binding) === null || y === void 0 || (y = y.value) === null || y === void 0 ? void 0 : y.unstyled : S?.unstyled;
        },
        theme: function() {
          var x;
          return (x = i._$instances[t]) === null || x === void 0 || (x = x.$primevueConfig) === null || x === void 0 ? void 0 : x.theme;
        },
        preset: function() {
          var x;
          return (x = i._$instances[t]) === null || x === void 0 || (x = x.$binding) === null || x === void 0 || (x = x.value) === null || x === void 0 ? void 0 : x.dt;
        },
        /* instance's methods */
        ptm: function() {
          var x, y = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", F = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
          return V._getPTValue(i._$instances[t], (x = i._$instances[t]) === null || x === void 0 || (x = x.$binding) === null || x === void 0 || (x = x.value) === null || x === void 0 ? void 0 : x.pt, y, U({}, F));
        },
        ptmo: function() {
          var x = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, y = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", F = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
          return V._getPTValue(i._$instances[t], x, y, F, !1);
        },
        cx: function() {
          var x, y, F = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", R = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
          return (x = i._$instances[t]) !== null && x !== void 0 && x.isUnstyled() ? void 0 : V._getOptionValue((y = i._$instances[t]) === null || y === void 0 || (y = y.$style) === null || y === void 0 ? void 0 : y.classes, F, U({}, R));
        },
        sx: function() {
          var x, y = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "", F = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0, R = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
          return F ? V._getOptionValue((x = i._$instances[t]) === null || x === void 0 || (x = x.$style) === null || x === void 0 ? void 0 : x.inlineStyles, y, U({}, R)) : void 0;
        }
      }, O), i.$instance = i._$instances[t], (m = ($ = i.$instance)[c]) === null || m === void 0 || m.call($, i, d, l, u), i["$".concat(t)] = i.$instance, V._hook(t, c, i, d, l, u), i.$pd || (i.$pd = {}), i.$pd[t] = U(U({}, (T = i.$pd) === null || T === void 0 ? void 0 : T[t]), {}, {
        name: t,
        instance: i._$instances[t]
      });
    }, o = function(c) {
      var i, d, l, u = c._$instances[t], p = u?.watch, m = function(S) {
        var P, O = S.newValue, I = S.oldValue;
        return p == null || (P = p.config) === null || P === void 0 ? void 0 : P.call(u, O, I);
      }, $ = function(S) {
        var P, O = S.newValue, I = S.oldValue;
        return p == null || (P = p["config.ripple"]) === null || P === void 0 ? void 0 : P.call(u, O, I);
      };
      u.$watchersCallback = {
        config: m,
        "config.ripple": $
      }, p == null || (i = p.config) === null || i === void 0 || i.call(u, u?.$primevueConfig), Ee.on("config:change", m), p == null || (d = p["config.ripple"]) === null || d === void 0 || d.call(u, u == null || (l = u.$primevueConfig) === null || l === void 0 ? void 0 : l.ripple), Ee.on("config:ripple:change", $);
    }, a = function(c) {
      var i = c._$instances[t].$watchersCallback;
      i && (Ee.off("config:change", i.config), Ee.off("config:ripple:change", i["config.ripple"]), c._$instances[t].$watchersCallback = void 0);
    };
    return {
      created: function(c, i, d, l) {
        c.$pd || (c.$pd = {}), c.$pd[t] = {
          name: t,
          attrSelector: sa("pd")
        }, r("created", c, i, d, l);
      },
      beforeMount: function(c, i, d, l) {
        var u;
        V._loadStyles((u = c.$pd[t]) === null || u === void 0 ? void 0 : u.instance, i, d), r("beforeMount", c, i, d, l), o(c);
      },
      mounted: function(c, i, d, l) {
        var u;
        V._loadStyles((u = c.$pd[t]) === null || u === void 0 ? void 0 : u.instance, i, d), r("mounted", c, i, d, l);
      },
      beforeUpdate: function(c, i, d, l) {
        r("beforeUpdate", c, i, d, l);
      },
      updated: function(c, i, d, l) {
        var u;
        V._loadStyles((u = c.$pd[t]) === null || u === void 0 ? void 0 : u.instance, i, d), r("updated", c, i, d, l);
      },
      beforeUnmount: function(c, i, d, l) {
        var u;
        a(c), V._removeThemeListeners((u = c.$pd[t]) === null || u === void 0 ? void 0 : u.instance), r("beforeUnmount", c, i, d, l);
      },
      unmounted: function(c, i, d, l) {
        var u;
        (u = c.$pd[t]) === null || u === void 0 || (u = u.instance) === null || u === void 0 || (u = u.scopedStyleEl) === null || u === void 0 || (u = u.value) === null || u === void 0 || u.remove(), r("unmounted", c, i, d, l);
      }
    };
  },
  extend: function() {
    var t = V._getMeta.apply(V, arguments), n = jn(t, 2), r = n[0], o = n[1];
    return U({
      extend: function() {
        var s = V._getMeta.apply(V, arguments), c = jn(s, 2), i = c[0], d = c[1];
        return V.extend(i, U(U(U({}, o), o?.methods), d));
      }
    }, V._extend(r, o));
  }
}, li = `
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
`, ci = {
  root: "p-ink"
}, di = W.extend({
  name: "ripple-directive",
  style: li,
  classes: ci
}), ui = V.extend({
  style: di
});
function it(e) {
  "@babel/helpers - typeof";
  return it = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, it(e);
}
function pi(e) {
  return hi(e) || bi(e) || mi(e) || fi();
}
function fi() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function mi(e, t) {
  if (e) {
    if (typeof e == "string") return Ht(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Ht(e, t) : void 0;
  }
}
function bi(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function hi(e) {
  if (Array.isArray(e)) return Ht(e);
}
function Ht(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function Vn(e, t, n) {
  return (t = vi(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function vi(e) {
  var t = gi(e, "string");
  return it(t) == "symbol" ? t : t + "";
}
function gi(e, t) {
  if (it(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (it(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var ft = ui.extend("ripple", {
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
      n || (n = oa("span", Vn(Vn({
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
        if (!this.isUnstyled() && jt(o, "p-ink-active"), o.setAttribute("data-p-ink-active", "false"), !Ft(o) && !Ze(o)) {
          var a = Math.max(ar(r), ir(r));
          o.style.height = a + "px", o.style.width = a + "px";
        }
        var s = qe(r), c = t.pageX - s.left + document.body.scrollTop - Ze(o) / 2, i = t.pageY - s.top + document.body.scrollLeft - Ft(o) / 2;
        o.style.top = i + "px", o.style.left = c + "px", !this.isUnstyled() && ta(o, "p-ink-active"), o.setAttribute("data-p-ink-active", "true"), this.timeout = setTimeout(function() {
          o && (!n.isUnstyled() && jt(o, "p-ink-active"), o.setAttribute("data-p-ink-active", "false"));
        }, 401);
      }
    },
    onAnimationEnd: function(t) {
      this.timeout && clearTimeout(this.timeout), !this.isUnstyled() && jt(t.currentTarget, "p-ink-active"), t.currentTarget.setAttribute("data-p-ink-active", "false");
    },
    getInk: function(t) {
      return t && t.children ? pi(t.children).find(function(n) {
        return He(n, "data-pc-name") === "ripple";
      }) : void 0;
    }
  }
});
const yi = "data-wippy-overlay-layer";
function yr() {
  return typeof window < "u" && typeof window.document < "u";
}
function kr() {
  return yr() && typeof HTMLElement < "u" && Object.hasOwn(HTMLElement.prototype, "popover");
}
function ki() {
  return kr() && typeof CSS < "u" && typeof CSS.supports == "function" && CSS.supports("anchor-name: --a") && CSS.supports("position-area", "bottom span-right") && CSS.supports("position-try-fallbacks", "flip-block") && CSS.supports("min-width", "min(anchor-size(width), 100vw)") && CSS.supports("max-width", "stretch");
}
const xi = /\bp-(?:select|multiselect|treeselect|cascadeselect)-overlay\b/;
let wi = 0;
const _t = /* @__PURE__ */ new WeakMap();
function Bn(e, t) {
  const n = e.style;
  n.setProperty("position", "fixed", "important"), n.setProperty("inset", "auto", "important"), n.setProperty("margin", "0", "important"), n.setProperty("position-anchor", t), n.setProperty("position-area", "bottom span-right"), n.setProperty("position-try-fallbacks", "flip-block, flip-inline, flip-block flip-inline"), n.setProperty("min-width", "min(anchor-size(width), 100vw)", "important"), n.setProperty("max-width", "stretch", "important");
}
function $i(e, t) {
  if (!xi.test(e.className))
    return;
  const n = e.style.cssText;
  Bn(e, t), e.getAttribute("popover") !== "manual" && e.setAttribute("popover", "manual");
  try {
    e.matches(":popover-open") || e.showPopover();
  } catch {
  }
  if (!e.matches(":popover-open")) {
    e.removeAttribute("popover"), e.style.cssText = n;
    return;
  }
  if (!_t.has(e)) {
    const r = new MutationObserver(() => {
      const o = e.style;
      (o.top !== "auto" || o.left !== "auto" || o.margin !== "0px" || o.getPropertyPriority("top") !== "important" || o.getPropertyPriority("left") !== "important" || o.getPropertyPriority("margin") !== "important" || o.getPropertyPriority("min-width") !== "important" || o.maxWidth !== "stretch" || o.getPropertyPriority("max-width") !== "important") && Bn(e, t);
    });
    r.observe(e, { attributes: !0, attributeFilter: ["style"] }), _t.set(e, r);
  }
}
function an(e) {
  const t = _t.get(e);
  t && (t.disconnect(), _t.delete(e));
}
function Si(e) {
  const t = e && typeof e.getRootNode == "function" ? e.getRootNode() : null;
  return t instanceof ShadowRoot ? t : null;
}
function qt(e) {
  e.style.top = "0px", e.style.left = "0px";
  const t = e.getBoundingClientRect();
  e.style.top = `${-window.scrollY - t.top}px`, e.style.left = `${-window.scrollX - t.left}px`;
}
const Ct = /* @__PURE__ */ new Set(), sn = /* @__PURE__ */ new WeakMap();
let Rn = !1, Yt = !1;
function _i() {
  Yt = !1;
  for (const e of Ct) {
    if (!e.isConnected) {
      for (const t of Array.from(e.children))
        t instanceof HTMLElement && an(t);
      Ct.delete(e), sn.get(e)?.disconnect();
      continue;
    }
    e.childElementCount > 0 && qt(e);
  }
}
function Dn() {
  Yt || (Yt = !0, requestAnimationFrame(_i));
}
function Ci(e) {
  const t = document.createElement("div");
  t.setAttribute(yi, "");
  const n = kr();
  if (t.style.cssText = n ? "position:fixed;width:0 !important;height:0 !important;margin:0 !important;border:0 !important;padding:0 !important;background:transparent !important;color:inherit !important;overflow:visible !important;" : "position:fixed;top:0;left:0;width:0;height:0;", n && t.setAttribute("popover", "manual"), e.appendChild(t), n) {
    try {
      t.showPopover();
    } catch {
    }
    t.matches(":popover-open") || (t.removeAttribute("popover"), t.style.cssText = "position:fixed;top:0;left:0;width:0;height:0;");
  }
  qt(t);
  const r = new MutationObserver((o) => {
    const a = t.__wippyAnchorName;
    for (const s of o) {
      if (a)
        for (const c of Array.from(s.addedNodes))
          c instanceof HTMLElement && $i(c, a);
      for (const c of Array.from(s.removedNodes))
        c instanceof HTMLElement && an(c);
    }
    t.isConnected && t.childElementCount > 0 && qt(t);
  });
  return r.observe(t, { childList: !0 }), sn.set(t, r), Ct.add(t), Rn || (Rn = !0, window.addEventListener("scroll", Dn, { capture: !0, passive: !0 }), window.addEventListener("resize", Dn, { passive: !0 })), t;
}
function Mn(e) {
  if (!(!e.hostRoot || e.layer) && (e.layer = Ci(e.hostRoot), ki())) {
    const t = e.$el ? e.$el.parentElement : null;
    t && (e.anchorName = `--wippy-a-${++wi}`, e.anchorTrigger = t, t.style.setProperty("anchor-name", e.anchorName), e.layer.__wippyAnchorName = e.anchorName);
  }
}
function Fn(e) {
  if (e.anchorTrigger && (e.anchorTrigger.style.removeProperty("anchor-name"), e.anchorTrigger = null), e.anchorName = null, e.layer) {
    for (const t of Array.from(e.layer.children))
      t instanceof HTMLElement && an(t);
    Ct.delete(e.layer), sn.get(e.layer)?.disconnect(), e.layer.remove(), e.layer = null;
  }
}
let Un = !1;
function Ti() {
  if (Un)
    return;
  Un = !0;
  const e = br;
  e.computed = e.computed || {}, e.computed.inline = function() {
    return !!this.disabled || this.appendTo === "self";
  }, e.computed.resolvedTarget = function() {
    return this.appendTo == null || this.appendTo === "body" ? this.hostRoot ? this.layer : document.body : this.appendTo;
  }, e.data = function() {
    return { mounted: !1, hostRoot: null, layer: null, anchorName: null, anchorTrigger: null };
  }, e.mounted = function() {
    yr() && (this.hostRoot = Si(this.$el), this.mounted = !0, this.hostRoot && (this.inline || Mn(this), this.$watch("inline", (t) => {
      t ? Fn(this) : Mn(this);
    })));
  }, e.render = function() {
    return this.inline ? G(this.$slots, "default", { key: 0 }) : this.mounted ? oo(Yn, { key: 1, to: this.resolvedTarget || document.body }, [
      G(this.$slots, "default")
    ]) : A("", !0);
  }, e.unmounted = function() {
    Fn(this);
  };
}
const Pi = {
  install: (e) => {
    Ti(), e.use(Ua, { theme: "none" });
  }
};
var Oi = {
  root: function(t) {
    var n = t.instance, r = t.props;
    return ["p-tab", {
      "p-tab-active": n.active,
      "p-disabled": r.disabled
    }];
  }
}, Ai = W.extend({
  name: "tab",
  classes: Oi
}), Li = {
  name: "BaseTab",
  extends: Ce,
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
  style: Ai,
  provide: function() {
    return {
      $pcTab: this,
      $parentInstance: this
    };
  }
}, Gt = {
  name: "Tab",
  extends: Li,
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
      return r ? He(r, "data-p-disabled") || He(r, "data-pc-section") === "activebar" ? this.findNextTab(r) : Je(r, '[data-pc-name="tab"]') : null;
    },
    findPrevTab: function(t) {
      var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1, r = n ? t : t.previousElementSibling;
      return r ? He(r, "data-p-disabled") || He(r, "data-pc-section") === "activebar" ? this.findPrevTab(r) : Je(r, '[data-pc-name="tab"]') : null;
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
      aa(n), this.scrollInView(n);
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
      return wt((t = this.$pcTabs) === null || t === void 0 ? void 0 : t.d_value, this.value);
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
      return E(this.asAttrs, this.a11yAttrs, this.ptmi("root", this.ptParams));
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
      return we({
        active: this.active
      });
    }
  },
  directives: {
    ripple: ft
  }
};
function Ei(e, t, n, r, o, a) {
  var s = At("ripple");
  return e.asChild ? G(e.$slots, "default", {
    key: 1,
    dataP: a.dataP,
    class: fe(e.cx("root")),
    active: a.active,
    a11yAttrs: a.a11yAttrs,
    onClick: a.onClick
  }) : ze((f(), j(Ve(e.as), E({
    key: 0,
    class: e.cx("root"),
    "data-p": a.dataP,
    onClick: a.onClick
  }, a.attrs), {
    default: B(function() {
      return [G(e.$slots, "default")];
    }),
    _: 3
  }, 16, ["class", "data-p", "onClick"])), [[s]]);
}
Gt.render = Ei;
var xr = {
  name: "ChevronLeftIcon",
  extends: Et
};
function Ni(e) {
  return Vi(e) || zi(e) || Ii(e) || ji();
}
function ji() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Ii(e, t) {
  if (e) {
    if (typeof e == "string") return Zt(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Zt(e, t) : void 0;
  }
}
function zi(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function Vi(e) {
  if (Array.isArray(e)) return Zt(e);
}
function Zt(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function Bi(e, t, n, r, o, a) {
  return f(), v("svg", E({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), Ni(t[0] || (t[0] = [b("path", {
    d: "M9.61296 13C9.50997 13.0005 9.40792 12.9804 9.3128 12.9409C9.21767 12.9014 9.13139 12.8433 9.05902 12.7701L3.83313 7.54416C3.68634 7.39718 3.60388 7.19795 3.60388 6.99022C3.60388 6.78249 3.68634 6.58325 3.83313 6.43628L9.05902 1.21039C9.20762 1.07192 9.40416 0.996539 9.60724 1.00012C9.81032 1.00371 10.0041 1.08597 10.1477 1.22959C10.2913 1.37322 10.3736 1.56698 10.3772 1.77005C10.3808 1.97313 10.3054 2.16968 10.1669 2.31827L5.49496 6.99022L10.1669 11.6622C10.3137 11.8091 10.3962 12.0084 10.3962 12.2161C10.3962 12.4238 10.3137 12.6231 10.1669 12.7701C10.0945 12.8433 10.0083 12.9014 9.91313 12.9409C9.81801 12.9804 9.71596 13.0005 9.61296 13Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
xr.render = Bi;
var wr = {
  name: "ChevronRightIcon",
  extends: Et
};
function Ri(e) {
  return Ui(e) || Fi(e) || Mi(e) || Di();
}
function Di() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Mi(e, t) {
  if (e) {
    if (typeof e == "string") return Qt(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Qt(e, t) : void 0;
  }
}
function Fi(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function Ui(e) {
  if (Array.isArray(e)) return Qt(e);
}
function Qt(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function Wi(e, t, n, r, o, a) {
  return f(), v("svg", E({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), Ri(t[0] || (t[0] = [b("path", {
    d: "M4.38708 13C4.28408 13.0005 4.18203 12.9804 4.08691 12.9409C3.99178 12.9014 3.9055 12.8433 3.83313 12.7701C3.68634 12.6231 3.60388 12.4238 3.60388 12.2161C3.60388 12.0084 3.68634 11.8091 3.83313 11.6622L8.50507 6.99022L3.83313 2.31827C3.69467 2.16968 3.61928 1.97313 3.62287 1.77005C3.62645 1.56698 3.70872 1.37322 3.85234 1.22959C3.99596 1.08597 4.18972 1.00371 4.3928 1.00012C4.59588 0.996539 4.79242 1.07192 4.94102 1.21039L10.1669 6.43628C10.3137 6.58325 10.3962 6.78249 10.3962 6.99022C10.3962 7.19795 10.3137 7.39718 10.1669 7.54416L4.94102 12.7701C4.86865 12.8433 4.78237 12.9014 4.68724 12.9409C4.59212 12.9804 4.49007 13.0005 4.38708 13Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
wr.render = Wi;
var Ki = {
  root: "p-tablist",
  content: "p-tablist-content p-tablist-viewport",
  tabList: "p-tablist-tab-list",
  activeBar: "p-tablist-active-bar",
  prevButton: "p-tablist-prev-button p-tablist-nav-button",
  nextButton: "p-tablist-next-button p-tablist-nav-button"
}, Hi = W.extend({
  name: "tablist",
  classes: Ki
}), qi = {
  name: "BaseTabList",
  extends: Ce,
  props: {},
  style: Hi,
  provide: function() {
    return {
      $pcTabList: this,
      $parentInstance: this
    };
  }
}, $r = {
  name: "TabList",
  extends: qi,
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
      var t = this.$refs.content, n = this.getVisibleButtonWidths(), r = Ze(t) - n, o = Math.abs(t.scrollLeft), a = r * 0.8, s = o - a, c = Math.max(s, 0);
      t.scrollLeft = vn(t) ? -1 * c : c;
    },
    onNextButtonClick: function() {
      var t = this.$refs.content, n = this.getVisibleButtonWidths(), r = Ze(t) - n, o = Math.abs(t.scrollLeft), a = r * 0.8, s = o + a, c = t.scrollWidth - r, i = Math.min(s, c);
      t.scrollLeft = vn(t) ? -1 * i : i;
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
      var n = this.$refs.content, r = Je(n, '[data-pc-name="tab"][data-p-active="true"]');
      r && (this.inkBarObserver = new ResizeObserver(function() {
        return t.updateInkBar();
      }), this.inkBarObserver.observe(r));
    },
    unbindInkBarObserver: function() {
      var t;
      (t = this.inkBarObserver) === null || t === void 0 || t.disconnect(), this.inkBarObserver = void 0;
    },
    updateInkBar: function() {
      var t = this.$refs, n = t.content, r = t.inkbar, o = t.tabs;
      if (r) {
        var a = Je(n, '[data-pc-name="tab"][data-p-active="true"]');
        this.$pcTabs.isVertical() ? (r.style.height = ir(a) + "px", r.style.top = qe(a).top - qe(o).top + "px") : (r.style.width = ar(a) + "px", r.style.left = qe(a).left - qe(o).left + "px");
      }
    },
    updateButtonState: function() {
      var t = this.$refs, n = t.list, r = t.content, o = r.scrollTop, a = r.scrollWidth, s = r.scrollHeight, c = r.offsetWidth, i = r.offsetHeight, d = Math.abs(r.scrollLeft), l = [Ze(r), Ft(r)], u = l[0], p = l[1];
      this.$pcTabs.isVertical() ? (this.isPrevButtonEnabled = o !== 0, this.isNextButtonEnabled = n.offsetHeight >= i && parseInt(o) !== s - p) : (this.isPrevButtonEnabled = d !== 0, this.isNextButtonEnabled = n.offsetWidth >= c && parseInt(d) !== a - u);
    },
    getVisibleButtonWidths: function() {
      var t = this.$refs, n = t.prevButton, r = t.nextButton, o = 0;
      return this.showNavigators && (o = (n?.offsetWidth || 0) + (r?.offsetWidth || 0)), o;
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
      return we({
        scrollable: this.$pcTabs.scrollable
      });
    }
  },
  components: {
    ChevronLeftIcon: xr,
    ChevronRightIcon: wr
  },
  directives: {
    ripple: ft
  }
}, Yi = ["data-p"], Gi = ["aria-label", "tabindex"], Zi = ["data-p"], Qi = ["aria-orientation"], Ji = ["aria-label", "tabindex"];
function Xi(e, t, n, r, o, a) {
  var s = At("ripple");
  return f(), v("div", E({
    ref: "list",
    class: e.cx("root"),
    "data-p": a.dataP
  }, e.ptmi("root")), [a.showNavigators && o.isPrevButtonEnabled ? ze((f(), v("button", E({
    key: 0,
    ref: "prevButton",
    type: "button",
    class: e.cx("prevButton"),
    "aria-label": a.prevButtonAriaLabel,
    tabindex: a.$pcTabs.tabindex,
    onClick: t[0] || (t[0] = function() {
      return a.onPrevButtonClick && a.onPrevButtonClick.apply(a, arguments);
    })
  }, e.ptm("prevButton"), {
    "data-pc-group-section": "navigator"
  }), [(f(), j(Ve(a.templates.previcon || "ChevronLeftIcon"), E({
    "aria-hidden": "true"
  }, e.ptm("prevIcon")), null, 16))], 16, Gi)), [[s]]) : A("", !0), b("div", E({
    ref: "content",
    class: e.cx("content"),
    onScroll: t[1] || (t[1] = function() {
      return a.onScroll && a.onScroll.apply(a, arguments);
    }),
    "data-p": a.dataP
  }, e.ptm("content")), [b("div", E({
    ref: "tabs",
    class: e.cx("tabList"),
    role: "tablist",
    "aria-orientation": a.$pcTabs.orientation || "horizontal"
  }, e.ptm("tabList")), [G(e.$slots, "default"), b("span", E({
    ref: "inkbar",
    class: e.cx("activeBar"),
    role: "presentation",
    "aria-hidden": "true"
  }, e.ptm("activeBar")), null, 16)], 16, Qi)], 16, Zi), a.showNavigators && o.isNextButtonEnabled ? ze((f(), v("button", E({
    key: 1,
    ref: "nextButton",
    type: "button",
    class: e.cx("nextButton"),
    "aria-label": a.nextButtonAriaLabel,
    tabindex: a.$pcTabs.tabindex,
    onClick: t[2] || (t[2] = function() {
      return a.onNextButtonClick && a.onNextButtonClick.apply(a, arguments);
    })
  }, e.ptm("nextButton"), {
    "data-pc-group-section": "navigator"
  }), [(f(), j(Ve(a.templates.nexticon || "ChevronRightIcon"), E({
    "aria-hidden": "true"
  }, e.ptm("nextIcon")), null, 16))], 16, Ji)), [[s]]) : A("", !0)], 16, Yi);
}
$r.render = Xi;
var es = `
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
`, ts = {
  root: function(t) {
    var n = t.props;
    return ["p-tabs p-component", {
      "p-tabs-scrollable": n.scrollable
    }];
  }
}, ns = W.extend({
  name: "tabs",
  style: es,
  classes: ts
}), rs = {
  name: "BaseTabs",
  extends: Ce,
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
  style: ns,
  provide: function() {
    return {
      $pcTabs: this,
      $parentInstance: this
    };
  }
}, Sr = {
  name: "Tabs",
  extends: rs,
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
function os(e, t, n, r, o, a) {
  return f(), v("div", E({
    class: e.cx("root")
  }, e.ptmi("root")), [G(e.$slots, "default")], 16);
}
Sr.render = os;
const as = { class: "km-shell" }, is = { class: "km-rail" }, ss = { class: "km-main" }, ls = /* @__PURE__ */ ie({
  __name: "Shell",
  setup(e) {
    return (t, n) => (f(), v("div", as, [
      b("aside", is, [
        G(t.$slots, "rail")
      ]),
      b("main", ss, [
        G(t.$slots, "default")
      ])
    ]));
  }
}), cs = { class: "km-railhead" }, ds = { class: "km-railhead-title" }, us = { key: 0 }, ps = { class: "km-railhead-acts" }, fs = /* @__PURE__ */ ie({
  __name: "RailHeader",
  props: {
    title: {},
    count: {}
  },
  setup(e) {
    return (t, n) => (f(), v("div", cs, [
      b("span", ds, [
        K(N(e.title), 1),
        e.count !== void 0 ? (f(), v("b", us, N(e.count), 1)) : A("", !0)
      ]),
      b("div", ps, [
        G(t.$slots, "actions")
      ])
    ]));
  }
});
var ln = {
  name: "SpinnerIcon",
  extends: Et
};
function ms(e) {
  return gs(e) || vs(e) || hs(e) || bs();
}
function bs() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function hs(e, t) {
  if (e) {
    if (typeof e == "string") return Jt(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Jt(e, t) : void 0;
  }
}
function vs(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function gs(e) {
  if (Array.isArray(e)) return Jt(e);
}
function Jt(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function ys(e, t, n, r, o, a) {
  return f(), v("svg", E({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), ms(t[0] || (t[0] = [b("path", {
    d: "M6.99701 14C5.85441 13.999 4.72939 13.7186 3.72012 13.1832C2.71084 12.6478 1.84795 11.8737 1.20673 10.9284C0.565504 9.98305 0.165424 8.89526 0.041387 7.75989C-0.0826496 6.62453 0.073125 5.47607 0.495122 4.4147C0.917119 3.35333 1.59252 2.4113 2.46241 1.67077C3.33229 0.930247 4.37024 0.413729 5.4857 0.166275C6.60117 -0.0811796 7.76026 -0.0520535 8.86188 0.251112C9.9635 0.554278 10.9742 1.12227 11.8057 1.90555C11.915 2.01493 11.9764 2.16319 11.9764 2.31778C11.9764 2.47236 11.915 2.62062 11.8057 2.73C11.7521 2.78503 11.688 2.82877 11.6171 2.85864C11.5463 2.8885 11.4702 2.90389 11.3933 2.90389C11.3165 2.90389 11.2404 2.8885 11.1695 2.85864C11.0987 2.82877 11.0346 2.78503 10.9809 2.73C9.9998 1.81273 8.73246 1.26138 7.39226 1.16876C6.05206 1.07615 4.72086 1.44794 3.62279 2.22152C2.52471 2.99511 1.72683 4.12325 1.36345 5.41602C1.00008 6.70879 1.09342 8.08723 1.62775 9.31926C2.16209 10.5513 3.10478 11.5617 4.29713 12.1803C5.48947 12.7989 6.85865 12.988 8.17414 12.7157C9.48963 12.4435 10.6711 11.7264 11.5196 10.6854C12.3681 9.64432 12.8319 8.34282 12.8328 7C12.8328 6.84529 12.8943 6.69692 13.0038 6.58752C13.1132 6.47812 13.2616 6.41667 13.4164 6.41667C13.5712 6.41667 13.7196 6.47812 13.8291 6.58752C13.9385 6.69692 14 6.84529 14 7C14 8.85651 13.2622 10.637 11.9489 11.9497C10.6356 13.2625 8.85432 14 6.99701 14Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
ln.render = ys;
var ks = `
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
`, xs = {
  root: function(t) {
    var n = t.props, r = t.instance;
    return ["p-badge p-component", {
      "p-badge-circle": q(n.value) && String(n.value).length === 1,
      "p-badge-dot": Be(n.value) && !r.$slots.default,
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
}, ws = W.extend({
  name: "badge",
  style: ks,
  classes: xs
}), $s = {
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
  style: ws,
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
  return (t = Ss(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Ss(e) {
  var t = _s(e, "string");
  return st(t) == "symbol" ? t : t + "";
}
function _s(e, t) {
  if (st(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (st(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var _r = {
  name: "Badge",
  extends: $s,
  inheritAttrs: !1,
  computed: {
    dataP: function() {
      return we(Wn(Wn({
        circle: this.value != null && String(this.value).length === 1,
        empty: this.value == null && !this.$slots.default
      }, this.severity, this.severity), this.size, this.size));
    }
  }
}, Cs = ["data-p"];
function Ts(e, t, n, r, o, a) {
  return f(), v("span", E({
    class: e.cx("root"),
    "data-p": a.dataP
  }, e.ptmi("root")), [G(e.$slots, "default", {}, function() {
    return [K(N(e.value), 1)];
  })], 16, Cs);
}
_r.render = Ts;
var Ps = `
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
function $e(e, t, n) {
  return (t = Os(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Os(e) {
  var t = As(e, "string");
  return lt(t) == "symbol" ? t : t + "";
}
function As(e, t) {
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
    return ["p-button p-component", $e($e($e($e($e($e($e($e($e({
      "p-button-icon-only": n.hasIcon && !r.label && !r.badge,
      "p-button-vertical": (r.iconPos === "top" || r.iconPos === "bottom") && r.label,
      "p-button-loading": r.loading,
      "p-button-link": r.link || r.variant === "link"
    }, "p-button-".concat(r.severity), r.severity), "p-button-raised", r.raised), "p-button-rounded", r.rounded), "p-button-text", r.text || r.variant === "text"), "p-button-outlined", r.outlined || r.variant === "outlined"), "p-button-sm", r.size === "small"), "p-button-lg", r.size === "large"), "p-button-plain", r.plain), "p-button-fluid", n.hasFluid)];
  },
  loadingIcon: "p-button-loading-icon",
  icon: function(t) {
    var n = t.props;
    return ["p-button-icon", $e({}, "p-button-icon-".concat(n.iconPos), n.label)];
  },
  label: "p-button-label"
}, Es = W.extend({
  name: "button",
  style: Ps,
  classes: Ls
}), Ns = {
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
  style: Es,
  provide: function() {
    return {
      $pcButton: this,
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
function le(e, t, n) {
  return (t = js(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function js(e) {
  var t = Is(e, "string");
  return ct(t) == "symbol" ? t : t + "";
}
function Is(e, t) {
  if (ct(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (ct(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var cn = {
  name: "Button",
  extends: Ns,
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
      return E(this.asAttrs, this.a11yAttrs, this.getPTOptions("root"));
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
      return Be(this.fluid) ? !!this.$pcFluid : this.fluid;
    },
    dataP: function() {
      return we(le(le(le(le(le(le(le(le(le(le({}, this.size, this.size), "icon-only", this.hasIcon && !this.label && !this.badge), "loading", this.loading), "fluid", this.hasFluid), "rounded", this.rounded), "raised", this.raised), "outlined", this.outlined || this.variant === "outlined"), "text", this.text || this.variant === "text"), "link", this.link || this.variant === "link"), "vertical", (this.iconPos === "top" || this.iconPos === "bottom") && this.label));
    },
    dataIconP: function() {
      return we(le(le({}, this.iconPos, this.iconPos), this.size, this.size));
    },
    dataLabelP: function() {
      return we(le(le({}, this.size, this.size), "icon-only", this.hasIcon && !this.label && !this.badge));
    }
  },
  components: {
    SpinnerIcon: ln,
    Badge: _r
  },
  directives: {
    ripple: ft
  }
}, zs = ["data-p"], Vs = ["data-p"];
function Bs(e, t, n, r, o, a) {
  var s = Rt("SpinnerIcon"), c = Rt("Badge"), i = At("ripple");
  return e.asChild ? G(e.$slots, "default", {
    key: 1,
    class: fe(e.cx("root")),
    a11yAttrs: a.a11yAttrs
  }) : ze((f(), j(Ve(e.as), E({
    key: 0,
    class: e.cx("root"),
    "data-p": a.dataP
  }, a.attrs), {
    default: B(function() {
      return [G(e.$slots, "default", {}, function() {
        return [e.loading ? G(e.$slots, "loadingicon", E({
          key: 0,
          class: [e.cx("loadingIcon"), e.cx("icon")]
        }, e.ptm("loadingIcon")), function() {
          return [e.loadingIcon ? (f(), v("span", E({
            key: 0,
            class: [e.cx("loadingIcon"), e.cx("icon"), e.loadingIcon]
          }, e.ptm("loadingIcon")), null, 16)) : (f(), j(s, E({
            key: 1,
            class: [e.cx("loadingIcon"), e.cx("icon")],
            spin: ""
          }, e.ptm("loadingIcon")), null, 16, ["class"]))];
        }) : G(e.$slots, "icon", E({
          key: 1,
          class: [e.cx("icon")]
        }, e.ptm("icon")), function() {
          return [e.icon ? (f(), v("span", E({
            key: 0,
            class: [e.cx("icon"), e.icon, e.iconClass],
            "data-p": a.dataIconP
          }, e.ptm("icon")), null, 16, zs)) : A("", !0)];
        }), e.label ? (f(), v("span", E({
          key: 2,
          class: e.cx("label")
        }, e.ptm("label"), {
          "data-p": a.dataLabelP
        }), N(e.label), 17, Vs)) : A("", !0), e.badge ? (f(), j(c, {
          key: 3,
          value: e.badge,
          class: fe(e.badgeClass),
          severity: e.badgeSeverity,
          unstyled: e.unstyled,
          pt: e.ptm("pcBadge")
        }, null, 8, ["value", "class", "severity", "unstyled", "pt"])) : A("", !0)];
      })];
    }),
    _: 3
  }, 16, ["class", "data-p"])), [[i]]);
}
cn.render = Bs;
const Tt = /* @__PURE__ */ ie({
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
    const n = e, r = t, o = Bt(), a = X(
      () => Object.prototype.hasOwnProperty.call(o?.vnode.props ?? {}, "active")
    ), s = X(
      () => n.variant === "danger" ? "danger" : n.variant === "bordered" ? "secondary" : void 0
    ), c = X(
      () => n.size === "sm" ? "small" : n.size === "lg" ? "large" : void 0
    );
    return (i, d) => (f(), j(h(cn), {
      type: "button",
      severity: s.value,
      text: e.variant !== "bordered" && !e.active,
      outlined: e.variant === "bordered",
      size: c.value,
      loading: e.spin,
      disabled: e.disabled || e.spin,
      pt: {
        root: {
          "aria-label": e.label,
          "aria-pressed": a.value ? String(e.active) : void 0,
          title: e.label
        }
      },
      onClick: d[0] || (d[0] = (l) => r("click"))
    }, {
      icon: B(() => [
        L(h(ee), {
          icon: e.icon,
          "aria-hidden": "true"
        }, null, 8, ["icon"])
      ]),
      _: 1
    }, 8, ["severity", "text", "outlined", "size", "loading", "disabled", "pt"]));
  }
}), xe = /* @__PURE__ */ ie({
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
    const n = e, r = t, o = X(
      () => n.variant === "danger" ? "danger" : n.variant === "primary" ? void 0 : "secondary"
    );
    return (a, s) => (f(), j(h(cn), {
      type: e.type,
      severity: o.value,
      outlined: e.variant === "ghost",
      loading: e.loading,
      disabled: e.disabled || e.loading,
      size: e.small ? "small" : void 0,
      onClick: s[0] || (s[0] = (c) => r("click"))
    }, {
      default: B(() => [
        e.loading ? (f(), j(h(ln), {
          key: 0,
          class: "p-button-loading-icon p-button-icon",
          spin: ""
        })) : A("", !0),
        e.icon && !e.loading ? (f(), j(h(ee), {
          key: 1,
          icon: e.icon,
          "aria-hidden": "true"
        }, null, 8, ["icon"])) : A("", !0),
        G(a.$slots, "default")
      ]),
      _: 3
    }, 8, ["type", "severity", "outlined", "loading", "disabled", "size"]));
  }
}), Rs = { class: "km-search" }, Ds = ["value", "placeholder"], Kn = /* @__PURE__ */ ie({
  __name: "SearchField",
  props: {
    modelValue: {},
    placeholder: {}
  },
  emits: ["update:modelValue"],
  setup(e, { emit: t }) {
    const n = t;
    return (r, o) => (f(), v("div", Rs, [
      L(h(ee), {
        icon: "tabler:search",
        class: "km-search-ico",
        "aria-hidden": "true"
      }),
      b("input", {
        class: "km-search-input",
        value: e.modelValue,
        placeholder: e.placeholder || "Search",
        onInput: o[0] || (o[0] = (a) => n("update:modelValue", a.target.value))
      }, null, 40, Ds),
      e.modelValue ? (f(), v("button", {
        key: 0,
        class: "km-search-clear",
        "aria-label": "Clear search",
        onClick: o[1] || (o[1] = (a) => n("update:modelValue", ""))
      }, [
        L(h(ee), {
          icon: "tabler:x",
          "aria-hidden": "true"
        })
      ])) : A("", !0)
    ]));
  }
}), Ms = { class: "km-field" }, Fs = { class: "km-field-label" }, Us = {
  key: 0,
  class: "km-field-help"
}, Ne = /* @__PURE__ */ ie({
  __name: "FormField",
  props: {
    label: {},
    help: {}
  },
  setup(e) {
    return (t, n) => (f(), v("label", Ms, [
      b("span", Fs, N(e.label), 1),
      G(t.$slots, "default"),
      e.help ? (f(), v("small", Us, N(e.help), 1)) : A("", !0)
    ]));
  }
}), Ws = ["type", "value", "placeholder", "readonly", "disabled", "autocomplete", "min", "max", "step"], xt = /* @__PURE__ */ ie({
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
      const a = o.target;
      n("update:modelValue", a.value);
    }
    return (o, a) => (f(), v("input", {
      class: fe(["km-input", e.mono && "mono"]),
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
    }, null, 42, Ws));
  }
});
var Ks = `
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
`, Hs = {
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
}, qs = W.extend({
  name: "tag",
  style: Ks,
  classes: Hs
}), Ys = {
  name: "BaseTag",
  extends: Ce,
  props: {
    value: null,
    severity: null,
    rounded: Boolean,
    icon: String
  },
  style: qs,
  provide: function() {
    return {
      $pcTag: this,
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
function Gs(e, t, n) {
  return (t = Zs(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function Zs(e) {
  var t = Qs(e, "string");
  return dt(t) == "symbol" ? t : t + "";
}
function Qs(e, t) {
  if (dt(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (dt(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var Cr = {
  name: "Tag",
  extends: Ys,
  inheritAttrs: !1,
  computed: {
    dataP: function() {
      return we(Gs({
        rounded: this.rounded
      }, this.severity, this.severity));
    }
  }
}, Js = ["data-p"];
function Xs(e, t, n, r, o, a) {
  return f(), v("span", E({
    class: e.cx("root"),
    "data-p": a.dataP
  }, e.ptmi("root")), [e.$slots.icon ? (f(), j(Ve(e.$slots.icon), E({
    key: 0,
    class: e.cx("icon")
  }, e.ptm("icon")), null, 16, ["class"])) : e.icon ? (f(), v("span", E({
    key: 1,
    class: [e.cx("icon"), e.icon]
  }, e.ptm("icon")), null, 16)) : A("", !0), e.value != null || e.$slots.default ? G(e.$slots, "default", {
    key: 2
  }, function() {
    return [b("span", E({
      class: e.cx("label")
    }, e.ptm("label")), N(e.value), 17)];
  }) : A("", !0)], 16, Js);
}
Cr.render = Xs;
const el = {
  key: 0,
  class: "km-pill-dot",
  "aria-hidden": "true"
}, Pt = /* @__PURE__ */ ie({
  __name: "Pill",
  props: {
    severity: { default: "secondary" },
    dot: { type: Boolean },
    icon: {}
  },
  setup(e) {
    return (t, n) => (f(), j(h(Cr), {
      severity: e.severity || void 0,
      class: "km-pill kx-tag-sm"
    }, {
      default: B(() => [
        e.dot ? (f(), v("span", el)) : e.icon ? (f(), j(h(ee), {
          key: 1,
          icon: e.icon,
          "aria-hidden": "true"
        }, null, 8, ["icon"])) : A("", !0),
        G(t.$slots, "default")
      ]),
      _: 3
    }, 8, ["severity"]));
  }
}), tl = { class: "km-notice-text" }, Ot = /* @__PURE__ */ ie({
  __name: "Notice",
  props: {
    severity: { default: "info" }
  },
  emits: ["dismiss"],
  setup(e, { emit: t }) {
    const n = t, r = (o) => o === "danger" ? "tabler:alert-triangle" : o === "success" ? "tabler:circle-check" : "tabler:info-circle";
    return (o, a) => (f(), v("div", {
      class: fe(["km-notice", `is-${e.severity}`]),
      role: "status"
    }, [
      L(h(ee), {
        icon: r(e.severity),
        "aria-hidden": "true"
      }, null, 8, ["icon"]),
      b("span", tl, [
        G(o.$slots, "default")
      ]),
      b("button", {
        class: "km-notice-x",
        "aria-label": "Dismiss",
        onClick: a[0] || (a[0] = (s) => n("dismiss"))
      }, [
        L(h(ee), {
          icon: "tabler:x",
          "aria-hidden": "true"
        })
      ])
    ], 2));
  }
});
var nl = `
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
`, rl = {
  root: "p-progressspinner",
  spin: "p-progressspinner-spin",
  circle: "p-progressspinner-circle"
}, ol = W.extend({
  name: "progressspinner",
  style: nl,
  classes: rl
}), al = {
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
  style: ol,
  provide: function() {
    return {
      $pcProgressSpinner: this,
      $parentInstance: this
    };
  }
}, Tr = {
  name: "ProgressSpinner",
  extends: al,
  inheritAttrs: !1,
  computed: {
    svgStyle: function() {
      return {
        "animation-duration": this.animationDuration
      };
    }
  }
}, il = ["fill", "stroke-width"];
function sl(e, t, n, r, o, a) {
  return f(), v("div", E({
    class: e.cx("root"),
    role: "progressbar"
  }, e.ptmi("root")), [(f(), v("svg", E({
    class: e.cx("spin"),
    viewBox: "25 25 50 50",
    style: a.svgStyle
  }, e.ptm("spin")), [b("circle", E({
    class: e.cx("circle"),
    cx: "50",
    cy: "50",
    r: "20",
    fill: e.fill,
    "stroke-width": e.strokeWidth,
    strokeMiterlimit: "10"
  }, e.ptm("circle")), null, 16, il)], 16))], 16);
}
Tr.render = sl;
const ll = { class: "km-loading" }, cl = { key: 0 }, Pr = /* @__PURE__ */ ie({
  __name: "Spinner",
  props: {
    label: {}
  },
  setup(e) {
    return (t, n) => (f(), v("div", ll, [
      L(h(Tr), {
        style: { width: "22px", height: "22px", margin: "0" },
        "aria-label": e.label || "Loading"
      }, null, 8, ["aria-label"]),
      e.label ? (f(), v("span", cl, N(e.label), 1)) : A("", !0)
    ]));
  }
}), dl = { class: "km-empty" }, ul = { class: "km-empty-title" }, pl = {
  key: 0,
  class: "km-empty-hint"
}, fl = /* @__PURE__ */ ie({
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
    return (r, o) => (f(), v("div", dl, [
      L(h(ee), {
        icon: e.icon,
        class: "km-empty-ico",
        "aria-hidden": "true"
      }, null, 8, ["icon"]),
      b("div", ul, N(e.title), 1),
      e.hint ? (f(), v("p", pl, N(e.hint), 1)) : A("", !0),
      e.cta ? (f(), j(xe, {
        key: 1,
        icon: e.ctaIcon,
        onClick: o[0] || (o[0] = (a) => n("cta"))
      }, {
        default: B(() => [
          K(N(e.cta), 1)
        ]),
        _: 1
      }, 8, ["icon"])) : A("", !0)
    ]));
  }
});
var Or = {
  name: "TimesCircleIcon",
  extends: Et
};
function ml(e) {
  return gl(e) || vl(e) || hl(e) || bl();
}
function bl() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function hl(e, t) {
  if (e) {
    if (typeof e == "string") return Xt(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Xt(e, t) : void 0;
  }
}
function vl(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function gl(e) {
  if (Array.isArray(e)) return Xt(e);
}
function Xt(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function yl(e, t, n, r, o, a) {
  return f(), v("svg", E({
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, e.pti()), ml(t[0] || (t[0] = [b("path", {
    "fill-rule": "evenodd",
    "clip-rule": "evenodd",
    d: "M7 14C5.61553 14 4.26215 13.5895 3.11101 12.8203C1.95987 12.0511 1.06266 10.9579 0.532846 9.67879C0.00303296 8.3997 -0.13559 6.99224 0.134506 5.63437C0.404603 4.2765 1.07129 3.02922 2.05026 2.05026C3.02922 1.07129 4.2765 0.404603 5.63437 0.134506C6.99224 -0.13559 8.3997 0.00303296 9.67879 0.532846C10.9579 1.06266 12.0511 1.95987 12.8203 3.11101C13.5895 4.26215 14 5.61553 14 7C14 8.85652 13.2625 10.637 11.9497 11.9497C10.637 13.2625 8.85652 14 7 14ZM7 1.16667C5.84628 1.16667 4.71846 1.50879 3.75918 2.14976C2.79989 2.79074 2.05222 3.70178 1.61071 4.76768C1.16919 5.83358 1.05367 7.00647 1.27876 8.13803C1.50384 9.26958 2.05941 10.309 2.87521 11.1248C3.69102 11.9406 4.73042 12.4962 5.86198 12.7212C6.99353 12.9463 8.16642 12.8308 9.23232 12.3893C10.2982 11.9478 11.2093 11.2001 11.8502 10.2408C12.4912 9.28154 12.8333 8.15373 12.8333 7C12.8333 5.45291 12.2188 3.96918 11.1248 2.87521C10.0308 1.78125 8.5471 1.16667 7 1.16667ZM4.66662 9.91668C4.58998 9.91704 4.51404 9.90209 4.44325 9.87271C4.37246 9.84333 4.30826 9.8001 4.2544 9.74557C4.14516 9.6362 4.0838 9.48793 4.0838 9.33335C4.0838 9.17876 4.14516 9.0305 4.2544 8.92113L6.17553 7L4.25443 5.07891C4.15139 4.96832 4.09529 4.82207 4.09796 4.67094C4.10063 4.51982 4.16185 4.37563 4.26872 4.26876C4.3756 4.16188 4.51979 4.10066 4.67091 4.09799C4.82204 4.09532 4.96829 4.15142 5.07887 4.25446L6.99997 6.17556L8.92106 4.25446C9.03164 4.15142 9.1779 4.09532 9.32903 4.09799C9.48015 4.10066 9.62434 4.16188 9.73121 4.26876C9.83809 4.37563 9.89931 4.51982 9.90198 4.67094C9.90464 4.82207 9.84855 4.96832 9.74551 5.07891L7.82441 7L9.74554 8.92113C9.85478 9.0305 9.91614 9.17876 9.91614 9.33335C9.91614 9.48793 9.85478 9.6362 9.74554 9.74557C9.69168 9.8001 9.62748 9.84333 9.55669 9.87271C9.4859 9.90209 9.40996 9.91704 9.33332 9.91668C9.25668 9.91704 9.18073 9.90209 9.10995 9.87271C9.03916 9.84333 8.97495 9.8001 8.9211 9.74557L6.99997 7.82444L5.07884 9.74557C5.02499 9.8001 4.96078 9.84333 4.88999 9.87271C4.81921 9.90209 4.74326 9.91704 4.66662 9.91668Z",
    fill: "currentColor"
  }, null, -1)])), 16);
}
Or.render = yl;
var kl = `
    .p-chip {
        display: inline-flex;
        align-items: center;
        background: dt('chip.background');
        color: dt('chip.color');
        border-radius: dt('chip.border.radius');
        padding-block: dt('chip.padding.y');
        padding-inline: dt('chip.padding.x');
        gap: dt('chip.gap');
    }

    .p-chip-icon {
        color: dt('chip.icon.color');
        font-size: dt('chip.icon.size');
        width: dt('chip.icon.size');
        height: dt('chip.icon.size');
    }

    .p-chip-image {
        border-radius: 50%;
        width: dt('chip.image.width');
        height: dt('chip.image.height');
        margin-inline-start: calc(-1 * dt('chip.padding.y'));
    }

    .p-chip:has(.p-chip-remove-icon) {
        padding-inline-end: dt('chip.padding.y');
    }

    .p-chip:has(.p-chip-image) {
        padding-block-start: calc(dt('chip.padding.y') / 2);
        padding-block-end: calc(dt('chip.padding.y') / 2);
    }

    .p-chip-remove-icon {
        cursor: pointer;
        font-size: dt('chip.remove.icon.size');
        width: dt('chip.remove.icon.size');
        height: dt('chip.remove.icon.size');
        color: dt('chip.remove.icon.color');
        border-radius: 50%;
        transition:
            outline-color dt('chip.transition.duration'),
            box-shadow dt('chip.transition.duration');
        outline-color: transparent;
    }

    .p-chip-remove-icon:focus-visible {
        box-shadow: dt('chip.remove.icon.focus.ring.shadow');
        outline: dt('chip.remove.icon.focus.ring.width') dt('chip.remove.icon.focus.ring.style') dt('chip.remove.icon.focus.ring.color');
        outline-offset: dt('chip.remove.icon.focus.ring.offset');
    }
`, xl = {
  root: "p-chip p-component",
  image: "p-chip-image",
  icon: "p-chip-icon",
  label: "p-chip-label",
  removeIcon: "p-chip-remove-icon"
}, wl = W.extend({
  name: "chip",
  style: kl,
  classes: xl
}), $l = {
  name: "BaseChip",
  extends: Ce,
  props: {
    label: {
      type: [String, Number],
      default: null
    },
    icon: {
      type: String,
      default: null
    },
    image: {
      type: String,
      default: null
    },
    removable: {
      type: Boolean,
      default: !1
    },
    removeIcon: {
      type: String,
      default: void 0
    }
  },
  style: wl,
  provide: function() {
    return {
      $pcChip: this,
      $parentInstance: this
    };
  }
}, Ar = {
  name: "Chip",
  extends: $l,
  inheritAttrs: !1,
  emits: ["remove"],
  data: function() {
    return {
      visible: !0
    };
  },
  methods: {
    onKeydown: function(t) {
      (t.key === "Enter" || t.key === "Backspace") && this.close(t);
    },
    close: function(t) {
      this.visible = !1, this.$emit("remove", t);
    }
  },
  computed: {
    dataP: function() {
      return we({
        removable: this.removable
      });
    }
  },
  components: {
    TimesCircleIcon: Or
  }
}, Sl = ["aria-label", "data-p"], _l = ["src"];
function Cl(e, t, n, r, o, a) {
  return o.visible ? (f(), v("div", E({
    key: 0,
    class: e.cx("root"),
    "aria-label": e.label
  }, e.ptmi("root"), {
    "data-p": a.dataP
  }), [G(e.$slots, "default", {}, function() {
    return [e.image ? (f(), v("img", E({
      key: 0,
      src: e.image
    }, e.ptm("image"), {
      class: e.cx("image")
    }), null, 16, _l)) : e.$slots.icon ? (f(), j(Ve(e.$slots.icon), E({
      key: 1,
      class: e.cx("icon")
    }, e.ptm("icon")), null, 16, ["class"])) : e.icon ? (f(), v("span", E({
      key: 2,
      class: [e.cx("icon"), e.icon]
    }, e.ptm("icon")), null, 16)) : A("", !0), e.label !== null ? (f(), v("div", E({
      key: 3,
      class: e.cx("label")
    }, e.ptm("label")), N(e.label), 17)) : A("", !0)];
  }), e.removable ? G(e.$slots, "removeicon", {
    key: 0,
    removeCallback: a.close,
    keydownCallback: a.onKeydown
  }, function() {
    return [(f(), j(Ve(e.removeIcon ? "span" : "TimesCircleIcon"), E({
      class: [e.cx("removeIcon"), e.removeIcon],
      onClick: a.close,
      onKeydown: a.onKeydown
    }, e.ptm("removeIcon")), null, 16, ["class", "onClick", "onKeydown"]))];
  }) : A("", !0)], 16, Sl)) : A("", !0);
}
Ar.render = Cl;
var Lr = {
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
      return n.find(q);
    }
  },
  computed: {
    $filled: function() {
      return q(this.d_value);
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
}, Tl = `
    .p-togglebutton {
        display: inline-flex;
        cursor: pointer;
        user-select: none;
        overflow: hidden;
        position: relative;
        color: dt('togglebutton.color');
        background: dt('togglebutton.background');
        border: 1px solid dt('togglebutton.border.color');
        padding: dt('togglebutton.padding');
        font-size: 1rem;
        font-family: inherit;
        font-feature-settings: inherit;
        transition:
            background dt('togglebutton.transition.duration'),
            color dt('togglebutton.transition.duration'),
            border-color dt('togglebutton.transition.duration'),
            outline-color dt('togglebutton.transition.duration'),
            box-shadow dt('togglebutton.transition.duration');
        border-radius: dt('togglebutton.border.radius');
        outline-color: transparent;
        font-weight: dt('togglebutton.font.weight');
    }

    .p-togglebutton-content {
        display: inline-flex;
        flex: 1 1 auto;
        align-items: center;
        justify-content: center;
        gap: dt('togglebutton.gap');
        padding: dt('togglebutton.content.padding');
        background: transparent;
        border-radius: dt('togglebutton.content.border.radius');
        transition:
            background dt('togglebutton.transition.duration'),
            color dt('togglebutton.transition.duration'),
            border-color dt('togglebutton.transition.duration'),
            outline-color dt('togglebutton.transition.duration'),
            box-shadow dt('togglebutton.transition.duration');
    }

    .p-togglebutton:not(:disabled):not(.p-togglebutton-checked):hover {
        background: dt('togglebutton.hover.background');
        color: dt('togglebutton.hover.color');
    }

    .p-togglebutton.p-togglebutton-checked {
        background: dt('togglebutton.checked.background');
        border-color: dt('togglebutton.checked.border.color');
        color: dt('togglebutton.checked.color');
    }

    .p-togglebutton-checked .p-togglebutton-content {
        background: dt('togglebutton.content.checked.background');
        box-shadow: dt('togglebutton.content.checked.shadow');
    }

    .p-togglebutton:focus-visible {
        box-shadow: dt('togglebutton.focus.ring.shadow');
        outline: dt('togglebutton.focus.ring.width') dt('togglebutton.focus.ring.style') dt('togglebutton.focus.ring.color');
        outline-offset: dt('togglebutton.focus.ring.offset');
    }

    .p-togglebutton.p-invalid {
        border-color: dt('togglebutton.invalid.border.color');
    }

    .p-togglebutton:disabled {
        opacity: 1;
        cursor: default;
        background: dt('togglebutton.disabled.background');
        border-color: dt('togglebutton.disabled.border.color');
        color: dt('togglebutton.disabled.color');
    }

    .p-togglebutton-label,
    .p-togglebutton-icon {
        position: relative;
        transition: none;
    }

    .p-togglebutton-icon {
        color: dt('togglebutton.icon.color');
    }

    .p-togglebutton:not(:disabled):not(.p-togglebutton-checked):hover .p-togglebutton-icon {
        color: dt('togglebutton.icon.hover.color');
    }

    .p-togglebutton.p-togglebutton-checked .p-togglebutton-icon {
        color: dt('togglebutton.icon.checked.color');
    }

    .p-togglebutton:disabled .p-togglebutton-icon {
        color: dt('togglebutton.icon.disabled.color');
    }

    .p-togglebutton-sm {
        padding: dt('togglebutton.sm.padding');
        font-size: dt('togglebutton.sm.font.size');
    }

    .p-togglebutton-sm .p-togglebutton-content {
        padding: dt('togglebutton.content.sm.padding');
    }

    .p-togglebutton-lg {
        padding: dt('togglebutton.lg.padding');
        font-size: dt('togglebutton.lg.font.size');
    }

    .p-togglebutton-lg .p-togglebutton-content {
        padding: dt('togglebutton.content.lg.padding');
    }

    .p-togglebutton-fluid {
        width: 100%;
    }
`, Pl = {
  root: function(t) {
    var n = t.instance, r = t.props;
    return ["p-togglebutton p-component", {
      "p-togglebutton-checked": n.active,
      "p-invalid": n.$invalid,
      "p-togglebutton-fluid": r.fluid,
      "p-togglebutton-sm p-inputfield-sm": r.size === "small",
      "p-togglebutton-lg p-inputfield-lg": r.size === "large"
    }];
  },
  content: "p-togglebutton-content",
  icon: "p-togglebutton-icon",
  label: "p-togglebutton-label"
}, Ol = W.extend({
  name: "togglebutton",
  style: Tl,
  classes: Pl
}), Al = {
  name: "BaseToggleButton",
  extends: Lr,
  props: {
    onIcon: String,
    offIcon: String,
    onLabel: {
      type: String,
      default: "Yes"
    },
    offLabel: {
      type: String,
      default: "No"
    },
    readonly: {
      type: Boolean,
      default: !1
    },
    tabindex: {
      type: Number,
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
    size: {
      type: String,
      default: null
    },
    fluid: {
      type: Boolean,
      default: null
    }
  },
  style: Ol,
  provide: function() {
    return {
      $pcToggleButton: this,
      $parentInstance: this
    };
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
function Ll(e, t, n) {
  return (t = El(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function El(e) {
  var t = Nl(e, "string");
  return ut(t) == "symbol" ? t : t + "";
}
function Nl(e, t) {
  if (ut(e) != "object" || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (ut(r) != "object") return r;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
var Er = {
  name: "ToggleButton",
  extends: Al,
  inheritAttrs: !1,
  emits: ["change"],
  methods: {
    getPTOptions: function(t) {
      var n = t === "root" ? this.ptmi : this.ptm;
      return n(t, {
        context: {
          active: this.active,
          disabled: this.disabled
        }
      });
    },
    onChange: function(t) {
      !this.disabled && !this.readonly && (this.writeValue(!this.d_value, t), this.$emit("change", t));
    },
    onBlur: function(t) {
      var n, r;
      (n = (r = this.formField).onBlur) === null || n === void 0 || n.call(r, t);
    }
  },
  computed: {
    active: function() {
      return this.d_value === !0;
    },
    hasLabel: function() {
      return q(this.onLabel) && q(this.offLabel);
    },
    label: function() {
      return this.hasLabel ? this.d_value ? this.onLabel : this.offLabel : " ";
    },
    dataP: function() {
      return we(Ll({
        checked: this.active,
        invalid: this.$invalid
      }, this.size, this.size));
    }
  },
  directives: {
    ripple: ft
  }
}, jl = ["tabindex", "disabled", "aria-pressed", "aria-label", "aria-labelledby", "data-p-checked", "data-p-disabled", "data-p"], Il = ["data-p"];
function zl(e, t, n, r, o, a) {
  var s = At("ripple");
  return ze((f(), v("button", E({
    type: "button",
    class: e.cx("root"),
    tabindex: e.tabindex,
    disabled: e.disabled,
    "aria-pressed": e.d_value,
    onClick: t[0] || (t[0] = function() {
      return a.onChange && a.onChange.apply(a, arguments);
    }),
    onBlur: t[1] || (t[1] = function() {
      return a.onBlur && a.onBlur.apply(a, arguments);
    })
  }, a.getPTOptions("root"), {
    "aria-label": e.ariaLabel,
    "aria-labelledby": e.ariaLabelledby,
    "data-p-checked": a.active,
    "data-p-disabled": e.disabled,
    "data-p": a.dataP
  }), [b("span", E({
    class: e.cx("content")
  }, a.getPTOptions("content"), {
    "data-p": a.dataP
  }), [G(e.$slots, "default", {}, function() {
    return [G(e.$slots, "icon", {
      value: e.d_value,
      class: fe(e.cx("icon"))
    }, function() {
      return [e.onIcon || e.offIcon ? (f(), v("span", E({
        key: 0,
        class: [e.cx("icon"), e.d_value ? e.onIcon : e.offIcon]
      }, a.getPTOptions("icon")), null, 16)) : A("", !0)];
    }), b("span", E({
      class: e.cx("label")
    }, a.getPTOptions("label")), N(a.label), 17)];
  })], 16, Il)], 16, jl)), [[s]]);
}
Er.render = zl;
var Vl = `
    .p-selectbutton {
        display: inline-flex;
        user-select: none;
        vertical-align: bottom;
        outline-color: transparent;
        border-radius: dt('selectbutton.border.radius');
    }

    .p-selectbutton .p-togglebutton {
        border-radius: 0;
        border-width: 1px 1px 1px 0;
    }

    .p-selectbutton .p-togglebutton:focus-visible {
        position: relative;
        z-index: 1;
    }

    .p-selectbutton .p-togglebutton:first-child {
        border-inline-start-width: 1px;
        border-start-start-radius: dt('selectbutton.border.radius');
        border-end-start-radius: dt('selectbutton.border.radius');
    }

    .p-selectbutton .p-togglebutton:last-child {
        border-start-end-radius: dt('selectbutton.border.radius');
        border-end-end-radius: dt('selectbutton.border.radius');
    }

    .p-selectbutton.p-invalid {
        outline: 1px solid dt('selectbutton.invalid.border.color');
        outline-offset: 0;
    }

    .p-selectbutton-fluid {
        width: 100%;
    }
    
    .p-selectbutton-fluid .p-togglebutton {
        flex: 1 1 0;
    }
`, Bl = {
  root: function(t) {
    var n = t.props, r = t.instance;
    return ["p-selectbutton p-component", {
      "p-invalid": r.$invalid,
      // @todo: check
      "p-selectbutton-fluid": n.fluid
    }];
  }
}, Rl = W.extend({
  name: "selectbutton",
  style: Vl,
  classes: Bl
}), Dl = {
  name: "BaseSelectButton",
  extends: Lr,
  props: {
    options: Array,
    optionLabel: null,
    optionValue: null,
    optionDisabled: null,
    multiple: Boolean,
    allowEmpty: {
      type: Boolean,
      default: !0
    },
    dataKey: null,
    ariaLabelledby: {
      type: String,
      default: null
    },
    size: {
      type: String,
      default: null
    },
    fluid: {
      type: Boolean,
      default: null
    }
  },
  style: Rl,
  provide: function() {
    return {
      $pcSelectButton: this,
      $parentInstance: this
    };
  }
};
function Ml(e, t) {
  var n = typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (!n) {
    if (Array.isArray(e) || (n = Nr(e)) || t) {
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
  var a, s = !0, c = !1;
  return { s: function() {
    n = n.call(e);
  }, n: function() {
    var d = n.next();
    return s = d.done, d;
  }, e: function(d) {
    c = !0, a = d;
  }, f: function() {
    try {
      s || n.return == null || n.return();
    } finally {
      if (c) throw a;
    }
  } };
}
function Fl(e) {
  return Kl(e) || Wl(e) || Nr(e) || Ul();
}
function Ul() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Nr(e, t) {
  if (e) {
    if (typeof e == "string") return en(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? en(e, t) : void 0;
  }
}
function Wl(e) {
  if (typeof Symbol < "u" && e[Symbol.iterator] != null || e["@@iterator"] != null) return Array.from(e);
}
function Kl(e) {
  if (Array.isArray(e)) return en(e);
}
function en(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
  return r;
}
var jr = {
  name: "SelectButton",
  extends: Dl,
  inheritAttrs: !1,
  emits: ["change"],
  methods: {
    getOptionLabel: function(t) {
      return this.optionLabel ? Me(t, this.optionLabel) : t;
    },
    getOptionValue: function(t) {
      return this.optionValue ? Me(t, this.optionValue) : t;
    },
    getOptionRenderKey: function(t) {
      return this.dataKey ? Me(t, this.dataKey) : this.getOptionLabel(t);
    },
    isOptionDisabled: function(t) {
      return this.optionDisabled ? Me(t, this.optionDisabled) : !1;
    },
    isOptionReadonly: function(t) {
      if (this.allowEmpty) return !1;
      var n = this.isSelected(t);
      return this.multiple ? n && this.d_value.length === 1 : n;
    },
    onOptionSelect: function(t, n, r) {
      var o = this;
      if (!(this.disabled || this.isOptionDisabled(n) || this.isOptionReadonly(n))) {
        var a = this.isSelected(n), s = this.getOptionValue(n), c;
        if (this.multiple)
          if (a) {
            if (c = this.d_value.filter(function(i) {
              return !wt(i, s, o.equalityKey);
            }), !this.allowEmpty && c.length === 0) return;
          } else
            c = this.d_value ? [].concat(Fl(this.d_value), [s]) : [s];
        else {
          if (a && !this.allowEmpty) return;
          c = a ? null : s;
        }
        this.writeValue(c, t), this.$emit("change", {
          originalEvent: t,
          value: c
        });
      }
    },
    isSelected: function(t) {
      var n = !1, r = this.getOptionValue(t);
      if (this.multiple) {
        if (this.d_value) {
          var o = Ml(this.d_value), a;
          try {
            for (o.s(); !(a = o.n()).done; ) {
              var s = a.value;
              if (wt(s, r, this.equalityKey)) {
                n = !0;
                break;
              }
            }
          } catch (c) {
            o.e(c);
          } finally {
            o.f();
          }
        }
      } else
        n = wt(this.d_value, r, this.equalityKey);
      return n;
    }
  },
  computed: {
    equalityKey: function() {
      return this.optionValue ? null : this.dataKey;
    },
    dataP: function() {
      return we({
        invalid: this.$invalid
      });
    }
  },
  directives: {
    ripple: ft
  },
  components: {
    ToggleButton: Er
  }
}, Hl = ["aria-labelledby", "data-p"];
function ql(e, t, n, r, o, a) {
  var s = Rt("ToggleButton");
  return f(), v("div", E({
    class: e.cx("root"),
    role: "group",
    "aria-labelledby": e.ariaLabelledby
  }, e.ptmi("root"), {
    "data-p": a.dataP
  }), [(f(!0), v(he, null, ve(e.options, function(c, i) {
    return f(), j(s, {
      key: a.getOptionRenderKey(c),
      modelValue: a.isSelected(c),
      onLabel: a.getOptionLabel(c),
      offLabel: a.getOptionLabel(c),
      disabled: e.disabled || a.isOptionDisabled(c),
      unstyled: e.unstyled,
      size: e.size,
      readonly: a.isOptionReadonly(c),
      onChange: function(l) {
        return a.onOptionSelect(l, c, i);
      },
      pt: e.ptm("pcToggleButton")
    }, ao({
      _: 2
    }, [e.$slots.option ? {
      name: "default",
      fn: B(function() {
        return [G(e.$slots, "option", {
          option: c,
          index: i
        }, function() {
          return [b("span", E({
            ref_for: !0
          }, e.ptm("pcToggleButton").label), N(a.getOptionLabel(c)), 17)];
        })];
      }),
      key: "0"
    } : void 0]), 1032, ["modelValue", "onLabel", "offLabel", "disabled", "unstyled", "size", "readonly", "onChange", "pt"]);
  }), 128))], 16, Hl);
}
jr.render = ql;
const Yl = { class: "kx-wcmount" }, Gl = {
  key: 0,
  class: "kx-wcmount-fail",
  role: "alert"
}, Zl = /* @__PURE__ */ ie({
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
    const n = e, r = t, o = D(null), a = D(!1);
    let s = null, c = 0;
    const i = /* @__PURE__ */ new Set();
    function d(y) {
      y.composedPath()[0] === s && (y.stopPropagation(), r("change", y.detail));
    }
    function l(y) {
      return y.composedPath()[0] !== s ? !1 : (y.stopPropagation(), !0);
    }
    function u(y) {
      l(y) && r("select", y.detail);
    }
    function p(y) {
      l(y) && r("created", y.detail);
    }
    function m(y) {
      l(y) && r("close", y.detail);
    }
    function $(y) {
      l(y) && r("error", y.detail);
    }
    function T(y) {
      if (typeof y == "string") return y;
      try {
        return JSON.stringify(y ?? {});
      } catch {
        return null;
      }
    }
    function S() {
      if (!s) return;
      const y = T(n.config);
      if (y !== null && s.setAttribute("config", y), n.schema !== void 0 && n.schema !== null) {
        const R = T(n.schema);
        R !== null && s.setAttribute("schema", R);
      }
      if (n.meta !== void 0 && n.meta !== null) {
        const R = T(n.meta);
        R !== null && s.setAttribute("meta", R);
      }
      n.provider && s.setAttribute("provider", n.provider), n.label && s.setAttribute("label", n.label);
      const F = n.attrs || {};
      for (const R of [...i])
        (!(R in F) || F[R] == null) && (s.removeAttribute(R), i.delete(R));
      for (const [R, H] of Object.entries(F)) {
        if (H == null) continue;
        const oe = typeof H == "object" ? T(H) : String(H);
        oe !== null && (s.setAttribute(R, oe), i.add(R));
      }
    }
    function P(y = s) {
      y && (y.removeEventListener("config-changed", d), y.removeEventListener("change", d), y.removeEventListener("select", u), y.removeEventListener("created", p), y.removeEventListener("close", m), y.removeEventListener("error", $), y === s && (s = null), i.clear());
    }
    async function O(y) {
      if (!customElements.get(y))
        try {
          await fo(y, { timeoutMs: 8e3 });
        } catch {
        }
    }
    async function I() {
      const y = ++c, F = o.value, R = n.tag;
      if (a.value = !1, !!F && (P(), F.innerHTML = "", !!R))
        try {
          if (await O(R), y !== c || o.value !== F || n.tag !== R) return;
          const H = document.createElement(R);
          H.classList.add("kx-wcmount-surface"), s = H, S(), H.addEventListener("config-changed", d), H.addEventListener("change", d), H.addEventListener("select", u), H.addEventListener("created", p), H.addEventListener("close", m), H.addEventListener("error", $), H.style.display = "block", F.appendChild(H), a.value = !customElements.get(R);
        } catch {
          y === c && (a.value = !0);
        }
    }
    async function x() {
      a.value = !1, await nn(), await I();
    }
    return tn(I), Pe(() => n.tag, I), Pe(() => [n.config, n.schema, n.meta, n.provider, n.label, n.attrs], S, { deep: !0 }), io(() => {
      c += 1, P();
    }), (y, F) => (f(), v("div", Yl, [
      a.value ? (f(), v("div", Gl, [
        F[0] || (F[0] = b("span", null, "This setup panel couldn’t load.", -1)),
        b("button", {
          type: "button",
          onClick: x
        }, "Try again")
      ])) : (f(), v("div", {
        key: 1,
        ref_key: "host",
        ref: o
      }, null, 512))
    ]));
  }
}), Ql = (e, t) => {
  const n = e.__vccOpts || e;
  for (const [r, o] of t)
    n[r] = o;
  return n;
}, Vt = /* @__PURE__ */ Ql(Zl, [["__scopeId", "data-v-3d6a00f1"]]);
function Qe(e, t) {
  const n = e?.response?.data ?? e?.data;
  return typeof n?.error == "string" && n.error ? n.error : typeof n?.message == "string" && n.message ? n.message : e instanceof Error ? e.message : t;
}
function Jl() {
  const e = D([]), t = D([]), n = D(!0), r = D(!1), o = D("");
  let a = 0;
  async function s() {
    const d = ++a;
    n.value = !0, o.value = "";
    try {
      const [l, u] = await Promise.all([
        Le.get("/api/v1/security/scopes"),
        Le.get("/api/v1/security/policies")
      ]);
      if (d !== a) return;
      e.value = l.data?.scopes ?? [], t.value = u.data?.policies ?? [];
    } catch (l) {
      d === a && (o.value = Qe(l, "failed to load security"));
    } finally {
      d === a && (n.value = !1);
    }
  }
  async function c(d) {
    r.value = !0, o.value = "";
    try {
      return await Le.post("/api/v1/security/scopes", d), await s(), !0;
    } catch (l) {
      return o.value = Qe(l, "failed to save scope"), !1;
    } finally {
      r.value = !1;
    }
  }
  async function i(d) {
    r.value = !0, o.value = "";
    try {
      return await Le.delete(`/api/v1/security/scopes?slug=${encodeURIComponent(d)}`), await s(), !0;
    } catch (l) {
      return o.value = Qe(l, "failed to delete scope"), !1;
    } finally {
      r.value = !1;
    }
  }
  return { scopes: e, policies: t, loading: n, saving: r, error: o, load: s, saveScope: c, deleteScope: i };
}
function Xl() {
  const e = D([]), t = D(!1), n = D(!1), r = D(""), o = D(""), a = D(null);
  let s = 0;
  async function c() {
    const l = ++s;
    t.value = !0, r.value = "";
    try {
      const { data: u } = await Le.get("/api/v1/security/delegations");
      if (u?.success !== !0 || !Array.isArray(u.delegations))
        throw new Error(u?.error || "Delegation inventory is unconfirmed");
      l === s && (e.value = u.delegations);
    } catch (u) {
      l === s && (r.value = Qe(u, "Could not load run-as permissions"));
    } finally {
      l === s && (t.value = !1);
    }
  }
  async function i() {
    if (!a.value || n.value) return;
    const l = a.value;
    n.value = !0, r.value = "", o.value = "";
    try {
      const { data: u } = l.method === "save" ? await Le.post("/api/v1/security/delegations", l.request) : await Le.delete("/api/v1/security/delegations", { data: l.request });
      if (u?.success !== !0) throw new Error(u?.error || "Run-as request is unconfirmed");
      a.value = null, o.value = l.method === "save" ? "Run-as permission saved" : "Run-as permission revoked", await c();
    } catch (u) {
      r.value = Qe(u, "Could not confirm run-as request");
      const p = u?.response?.status;
      p && p >= 400 && p < 500 && (a.value = null);
    } finally {
      n.value = !1;
    }
  }
  async function d(l, u) {
    a.value || n.value || (a.value = { method: l, request: {
      ...u,
      principal: { ...u.principal },
      ...u.groups ? { groups: [...u.groups].sort() } : {}
    } }, await i());
  }
  return { delegations: e, loading: t, saving: n, error: r, confirmation: o, pending: a, load: c, mutate: d, submit: i };
}
const ec = {
  class: "ks-runas",
  "aria-label": "Run-as permissions"
}, tc = { class: "ks-runas-head" }, nc = { class: "ks-runas-acts" }, rc = {
  key: 0,
  role: "alert"
}, oc = { class: "ks-runas-form-head" }, ac = ["disabled", "inert"], ic = { class: "ks-runas-steps" }, sc = {
  key: 0,
  class: "ks-runas-chips",
  "aria-label": "Selected groups"
}, lc = { class: "ks-runas-form-foot" }, cc = {
  key: 3,
  class: "ks-runas-pending"
}, dc = {
  key: 5,
  class: "ks-runas-list"
}, uc = { class: "ks-runas-grant-body" }, pc = { class: "ks-runas-grant-line" }, fc = { class: "ks-runas-who" }, mc = { class: "ks-runas-who" }, bc = { class: "ks-runas-grant-meta" }, hc = { key: 0 }, vc = { key: 1 }, gc = { key: 2 }, yc = {
  key: 6,
  class: "ks-runas-empty"
}, kc = /* @__PURE__ */ ie({
  __name: "Delegations",
  props: {
    scopes: {}
  },
  setup(e, { expose: t }) {
    const n = e, r = Xl(), { delegations: o, loading: a, saving: s, error: c, confirmation: i, pending: d } = r, l = D(!1), u = D(""), p = D(""), m = D(!0), $ = [{ label: "Any component", value: !0 }, { label: "One component", value: !1 }], T = D([]), S = X(() => s.value || !!d.value), P = X(() => !!u.value && T.value.length > 0 && (m.value || !!p.value)), O = X(() => {
      const z = {};
      for (const _ of n.scopes) z[_.id] = _.label || _.id;
      return z;
    }), I = D({});
    Pe(o, async (z) => {
      const _ = [...new Set(z.map((C) => C.principal.id))].filter((C) => !I.value[C]);
      if (_.length)
        try {
          const { data: C } = await Le.post("/api/v1/principals/resolve", { refs: _.map((te) => ({ type: "user", id: te })) }), J = { ...I.value };
          for (const te of Array.isArray(C?.principals) ? C.principals : [])
            te && typeof te.id == "string" && typeof te.label == "string" && (J[te.id] = te.label);
          I.value = J;
        } catch (C) {
          c.value = C && typeof C == "object" && "message" in C ? String(C.message) : "Could not resolve account names";
        }
    });
    const x = X(() => o.value.filter((z) => z.active)), y = X(() => o.value.filter((z) => !z.active));
    function F(z, _) {
      if (!z || typeof z != "object") return;
      const C = z;
      S.value || C.type !== _ || typeof C.id != "string" || (_ === "user" ? u.value = C.id : C.id && !T.value.some((J) => J.id === C.id) && T.value.push({ id: C.id, label: typeof C.label == "string" ? C.label : C.id }));
    }
    function R(z) {
      const _ = z && typeof z == "object" ? z.thread_id : void 0;
      !S.value && typeof _ == "string" && (p.value = _);
    }
    function H(z) {
      c.value = z && typeof z == "object" && "message" in z ? String(z.message) : "Could not load the picker";
    }
    function oe() {
      u.value = "", p.value = "", m.value = !0, T.value = [], l.value = !0;
    }
    async function Z() {
      P.value && (await r.mutate("save", {
        principal: { kind: "user", id: u.value },
        root: m.value ? "*" : p.value,
        groups: T.value.map((z) => z.id)
      }), !c.value && !d.value && (l.value = !1));
    }
    async function de(z) {
      await rn.confirm({
        header: "Revoke run-as permission?",
        message: `Members of ${z.groups.map((C) => O.value[C] || C).join(", ")} can no longer choose ${I.value[z.principal.id] || z.principal.id} in the Run as setting.`,
        icon: "tabler:user-off",
        acceptLabel: "Revoke",
        rejectLabel: "Cancel",
        acceptClass: "p-button-danger"
      }) && await r.mutate("revoke", { principal: z.principal, root: z.root });
    }
    return t({ load: r.load }), (z, _) => (f(), v("section", ec, [
      b("header", tc, [
        _[8] || (_[8] = b("div", null, [
          b("h2", { class: "ks-runas-title" }, "Run-as permissions"),
          b("p", { class: "ks-runas-lede" }, [
            K(" Agents, automations and workflows run with the access of the account set in their "),
            b("b", null, "Run as"),
            K(" setting. A permission lets members of a group choose a specific account there, typically a bot account, so the component works with that account's access instead of their own. ")
          ])
        ], -1)),
        b("div", nc, [
          L(h(Tt), {
            icon: "tabler:refresh",
            label: "Refresh",
            disabled: h(a) || S.value,
            spin: h(a),
            onClick: h(r).load
          }, null, 8, ["disabled", "spin", "onClick"]),
          l.value ? A("", !0) : (f(), j(h(xe), {
            key: 0,
            variant: "primary",
            small: "",
            icon: "tabler:plus",
            onClick: oe
          }, {
            default: B(() => [..._[7] || (_[7] = [
              K("New permission", -1)
            ])]),
            _: 1
          }))
        ])
      ]),
      h(c) ? (f(), v("div", rc, [
        L(h(Ot), {
          severity: "danger",
          onDismiss: _[0] || (_[0] = (C) => c.value = "")
        }, {
          default: B(() => [
            K(N(h(c)), 1)
          ]),
          _: 1
        })
      ])) : A("", !0),
      h(i) ? (f(), j(h(Ot), {
        key: 1,
        "data-test": "delegation-confirmation",
        severity: "success",
        onDismiss: _[1] || (_[1] = (C) => i.value = "")
      }, {
        default: B(() => [
          K(N(h(i)), 1)
        ]),
        _: 1
      })) : A("", !0),
      l.value ? (f(), v("form", {
        key: 2,
        class: "ks-runas-form",
        onSubmit: Ue(Z, ["prevent"])
      }, [
        b("div", oc, [
          _[9] || (_[9] = b("span", null, "New run-as permission", -1)),
          L(h(Tt), {
            icon: "tabler:x",
            label: "Cancel",
            disabled: h(s),
            onClick: _[2] || (_[2] = (C) => l.value = !1)
          }, null, 8, ["disabled"])
        ]),
        b("fieldset", {
          disabled: S.value,
          inert: S.value
        }, [
          b("ol", ic, [
            b("li", null, [
              L(h(Ne), {
                label: "Account to run as",
                help: "The account whose access the component uses. Its group memberships decide what the component can do."
              }, {
                default: B(() => [
                  L(Vt, {
                    tag: "wc-principal-picker",
                    attrs: { kinds: "user", placeholder: "Choose an account…" },
                    config: { principal_id: u.value },
                    onChange: _[3] || (_[3] = (C) => F(C, "user")),
                    onError: H
                  }, null, 8, ["config"])
                ]),
                _: 1
              })
            ]),
            b("li", null, [
              L(h(Ne), {
                label: "Who may choose it",
                help: "Members of these groups see this account in the Run as setting. Nobody's group membership changes."
              }, {
                default: B(() => [
                  L(Vt, {
                    tag: "wc-principal-picker",
                    attrs: { kinds: "group", placeholder: "Add a group…" },
                    config: {},
                    onChange: _[4] || (_[4] = (C) => F(C, "group")),
                    onError: H
                  })
                ]),
                _: 1
              }),
              T.value.length ? (f(), v("div", sc, [
                (f(!0), v(he, null, ve(T.value, (C) => (f(), j(h(Ar), {
                  key: C.id,
                  label: C.label,
                  removable: !S.value,
                  pt: { removeIcon: { "aria-label": `Remove group ${C.label}` } },
                  onRemove: (J) => T.value = T.value.filter((te) => te.id !== C.id)
                }, null, 8, ["label", "removable", "pt", "onRemove"]))), 128))
              ])) : A("", !0)
            ]),
            b("li", null, [
              L(h(Ne), {
                label: "On which components",
                help: "The person choosing the account must also be able to manage the component."
              }, {
                default: B(() => [
                  L(h(jr), {
                    modelValue: m.value,
                    "onUpdate:modelValue": _[5] || (_[5] = (C) => m.value = C),
                    options: $,
                    "option-label": "label",
                    "option-value": "value",
                    "allow-empty": !1,
                    disabled: S.value,
                    size: "small",
                    "aria-label": "On which components"
                  }, null, 8, ["modelValue", "disabled"])
                ]),
                _: 1
              }),
              m.value ? A("", !0) : (f(), j(Vt, {
                key: 0,
                class: "ks-runas-component",
                tag: "wc-component-picker",
                attrs: { source: "/api/v1/security/delegations/roots", title: "Component", placeholder: "Choose a component you manage…" },
                config: p.value ? { thread_id: p.value } : {},
                onChange: R,
                onError: H
              }, null, 8, ["config"]))
            ])
          ])
        ], 8, ac),
        b("div", lc, [
          L(h(xe), {
            variant: "ghost",
            small: "",
            disabled: h(s),
            onClick: _[6] || (_[6] = (C) => l.value = !1)
          }, {
            default: B(() => [..._[10] || (_[10] = [
              K("Cancel", -1)
            ])]),
            _: 1
          }, 8, ["disabled"]),
          L(h(xe), {
            variant: "primary",
            small: "",
            icon: "tabler:device-floppy",
            disabled: !P.value || S.value,
            loading: h(s),
            onClick: Z
          }, {
            default: B(() => [..._[11] || (_[11] = [
              K("Save permission", -1)
            ])]),
            _: 1
          }, 8, ["disabled", "loading"])
        ])
      ], 32)) : A("", !0),
      h(d) && !h(s) ? (f(), v("div", cc, [
        _[13] || (_[13] = b("span", null, "The result is unconfirmed. Retry the same request before editing this permission.", -1)),
        L(h(xe), {
          small: "",
          onClick: h(r).submit
        }, {
          default: B(() => [..._[12] || (_[12] = [
            K("Retry", -1)
          ])]),
          _: 1
        }, 8, ["onClick"])
      ])) : A("", !0),
      h(a) && !h(o).length ? (f(), j(h(Pr), {
        key: 4,
        label: "Loading run-as permissions…"
      })) : x.value.length || y.value.length ? (f(), v("div", dc, [
        (f(!0), v(he, null, ve([...x.value, ...y.value], (C) => (f(), v("article", {
          key: C.policy_id,
          class: fe(["ks-runas-grant", { revoked: !C.active }])
        }, [
          L(h(ee), {
            class: "ks-runas-grant-icon",
            icon: "tabler:user-shield",
            "aria-hidden": "true"
          }),
          b("div", uc, [
            b("div", pc, [
              b("span", fc, N(C.groups.map((J) => O.value[J] || J).join(", ")), 1),
              _[14] || (_[14] = b("span", { class: "ks-runas-verb" }, "can run as", -1)),
              b("span", mc, N(I.value[C.principal.id] || C.principal.id), 1)
            ]),
            b("div", bc, [
              C.root === "*" ? (f(), v("span", hc, "on any component they manage")) : C.root_label ? (f(), v("span", vc, [
                _[15] || (_[15] = K("on ", -1)),
                b("b", null, N(C.root_label), 1)
              ])) : (f(), v("span", gc, [
                _[16] || (_[16] = K("on component ", -1)),
                b("code", null, N(C.root), 1)
              ]))
            ])
          ]),
          C.active ? (f(), j(h(xe), {
            key: 1,
            variant: "ghost",
            small: "",
            icon: "tabler:user-off",
            disabled: S.value,
            "aria-label": `Revoke run-as permission for ${I.value[C.principal.id] || C.principal.id}`,
            onClick: (J) => de(C)
          }, {
            default: B(() => [..._[18] || (_[18] = [
              K("Revoke", -1)
            ])]),
            _: 1
          }, 8, ["disabled", "aria-label", "onClick"])) : (f(), j(h(Pt), {
            key: 0,
            severity: "secondary"
          }, {
            default: B(() => [..._[17] || (_[17] = [
              K("revoked", -1)
            ])]),
            _: 1
          }))
        ], 2))), 128))
      ])) : !h(c) && !l.value ? (f(), v("div", yc, [
        L(h(ee), {
          icon: "tabler:user-shield",
          "aria-hidden": "true"
        }),
        _[19] || (_[19] = b("b", null, "No run-as permissions yet", -1)),
        _[20] || (_[20] = b("span", null, [
          K("Until a group gets a permission, the Run as setting offers only "),
          b("b", null, "Me"),
          K(".")
        ], -1))
      ])) : A("", !0)
    ]));
  }
}), xc = ["draggable"], wc = { class: "ks-pcard-row" }, $c = { class: "ks-pcard-body" }, Sc = { class: "ks-pcard-head" }, _c = ["title"], Cc = {
  key: 0,
  class: "ks-pcard-comment"
}, Tc = ["aria-label", "aria-expanded"], Pc = ["aria-label"], Oc = ["aria-label"], Ac = {
  key: 0,
  class: "ks-pcard-detail"
}, Lc = { class: "ks-pcard-kv" }, Ec = {
  key: 0,
  class: "ks-pcard-kv"
}, Nc = { class: "ks-pcard-kv" }, jc = { class: "ks-pcard-kv" }, Ic = { class: "ks-pcard-tags" }, zc = {
  key: 0,
  class: "ks-pcard-none"
}, Vc = { class: "ks-pcard-kv" }, Bc = { class: "ks-pcard-tags" }, Rc = {
  key: 0,
  class: "ks-pcard-none"
}, Ke = /* @__PURE__ */ ie({
  __name: "PolicyCard",
  props: {
    policy: {},
    mode: {}
  },
  emits: ["add", "remove"],
  setup(e, { emit: t }) {
    const n = e, r = t, o = D(!1);
    function a(l) {
      n.mode === "locked" || !l.dataTransfer || (l.dataTransfer.setData("text/plain", n.policy.id), l.dataTransfer.effectAllowed = n.mode === "palette" ? "copy" : "move");
    }
    function s(l) {
      return l.includes(":") ? l.split(":").slice(-1)[0] : l;
    }
    function c(l) {
      return Array.isArray(l) ? l.map(String) : typeof l == "string" && l ? [l] : [];
    }
    const i = X(() => c(n.policy.actions)), d = X(() => c(n.policy.resources));
    return (l, u) => (f(), v("div", {
      class: fe(["ks-pcard", [e.mode, { expanded: o.value }]]),
      draggable: e.mode !== "locked",
      onDragstart: a,
      onDblclick: u[3] || (u[3] = (p) => e.mode === "palette" && r("add"))
    }, [
      b("div", wc, [
        e.mode === "locked" ? (f(), j(h(ee), {
          key: 0,
          icon: "tabler:lock",
          class: "ks-pcard-grip locked",
          "aria-hidden": "true"
        })) : (f(), j(h(ee), {
          key: 1,
          icon: "tabler:grip-vertical",
          class: "ks-pcard-grip",
          "aria-hidden": "true"
        })),
        b("div", $c, [
          b("div", Sc, [
            b("span", {
              class: "ks-pcard-title",
              title: e.policy.title || s(e.policy.id)
            }, N(e.policy.title || s(e.policy.id)), 9, _c),
            e.policy.effect ? (f(), j(Pt, {
              key: 0,
              severity: e.policy.effect === "allow" ? "success" : e.policy.effect === "deny" ? "danger" : "secondary"
            }, {
              default: B(() => [
                K(N(e.policy.effect), 1)
              ]),
              _: 1
            }, 8, ["severity"])) : A("", !0)
          ]),
          e.policy.comment ? (f(), v("div", Cc, N(e.policy.comment), 1)) : A("", !0)
        ]),
        b("button", {
          class: fe(["ks-pcard-act detail", { open: o.value }]),
          "aria-label": `${o.value ? "Hide" : "Show"} details for ${e.policy.title || s(e.policy.id)}`,
          "aria-expanded": o.value,
          onClick: u[0] || (u[0] = Ue((p) => o.value = !o.value, ["stop"]))
        }, [
          L(h(ee), {
            icon: "tabler:chevron-right",
            "aria-hidden": "true"
          })
        ], 10, Tc),
        e.mode === "palette" ? (f(), v("button", {
          key: 2,
          class: "ks-pcard-act add",
          "aria-label": `Add permission ${e.policy.title || s(e.policy.id)}`,
          onClick: u[1] || (u[1] = Ue((p) => r("add"), ["stop"]))
        }, [
          L(h(ee), {
            icon: "tabler:plus",
            "aria-hidden": "true"
          })
        ], 8, Pc)) : e.mode === "selected" ? (f(), v("button", {
          key: 3,
          class: "ks-pcard-act remove",
          "aria-label": `Remove permission ${e.policy.title || s(e.policy.id)}`,
          onClick: u[2] || (u[2] = Ue((p) => r("remove"), ["stop"]))
        }, [
          L(h(ee), {
            icon: "tabler:x",
            "aria-hidden": "true"
          })
        ], 8, Oc)) : A("", !0)
      ]),
      o.value ? (f(), v("div", Ac, [
        b("div", Lc, [
          u[4] || (u[4] = b("span", null, "Policy ID", -1)),
          b("code", null, N(e.policy.id), 1)
        ]),
        e.policy.surface || e.policy.intent ? (f(), v("div", Ec, [
          u[5] || (u[5] = b("span", null, "Surface", -1)),
          b("code", null, N(e.policy.surface || e.policy.intent), 1)
        ])) : A("", !0),
        b("div", Nc, [
          u[6] || (u[6] = b("span", null, "Effect", -1)),
          b("code", {
            class: fe(["ks-eff-code", e.policy.effect])
          }, N(e.policy.effect || "—"), 3)
        ]),
        b("div", jc, [
          u[7] || (u[7] = b("span", null, "Actions", -1)),
          b("div", Ic, [
            (f(!0), v(he, null, ve(i.value, (p) => (f(), v("code", { key: p }, N(p), 1))), 128)),
            i.value.length ? A("", !0) : (f(), v("span", zc, "—"))
          ])
        ]),
        b("div", Vc, [
          u[8] || (u[8] = b("span", null, "Resources", -1)),
          b("div", Bc, [
            (f(!0), v(he, null, ve(d.value, (p) => (f(), v("code", { key: p }, N(p), 1))), 128)),
            d.value.length ? A("", !0) : (f(), v("span", Rc, "—"))
          ])
        ])
      ])) : A("", !0)
    ], 42, xc));
  }
}), Dc = { class: "ks" }, Mc = { class: "ks-rail-search" }, Fc = { class: "ks-rail-list" }, Uc = {
  key: 0,
  class: "ks-rail-group"
}, Wc = ["onClick"], Kc = { class: "ks-scope-name" }, Hc = ["onClick"], qc = { class: "ks-scope-name" }, Yc = {
  key: 0,
  class: "ks-builder"
}, Gc = { class: "ks-builder-head" }, Zc = { class: "ks-builder-title" }, Qc = { class: "ks-builder-acts" }, Jc = {
  key: 0,
  class: "ks-overlay-warn"
}, Xc = {
  key: 1,
  class: "ks-view-note"
}, ed = { class: "ks-fields" }, td = {
  key: 0,
  class: "ks-field-err"
}, nd = {
  key: 0,
  class: "ks-pane locked-pane"
}, rd = { class: "ks-pane-head" }, od = { class: "ks-pane-sub" }, ad = { class: "ks-pane-body" }, id = {
  key: 0,
  class: "ks-pane-empty"
}, sd = { class: "ks-pane" }, ld = { class: "ks-pane-search" }, cd = { class: "ks-pane-body" }, dd = {
  key: 0,
  class: "ks-pane-empty"
}, ud = { class: "ks-pane-head" }, pd = { class: "ks-pane-sub" }, fd = { class: "ks-pane-body" }, md = ["onDrop"], bd = {
  key: 0,
  class: "ks-drop-hint"
}, hd = {
  key: 1,
  class: "ks-view"
}, vd = { class: "ks-builder-head" }, gd = { class: "ks-builder-title" }, yd = { class: "ks-builder-acts" }, kd = { class: "ks-pane-body ks-view-list" }, xd = {
  key: 0,
  class: "ks-pane-empty"
}, wd = {
  key: 0,
  class: "ks-ext-block"
}, $d = { class: "ks-ext-head" }, Sd = { class: "ks-pane-body ks-view-list" }, _d = /* @__PURE__ */ ie({
  __name: "Security",
  setup(e) {
    const t = Jl(), { scopes: n, policies: r, loading: o, saving: a, error: s } = t, c = D(""), i = D(""), d = D(null), l = D(null), u = D("scopes"), p = D(null), m = D(!1);
    async function $(k) {
      u.value = String(k), k === "delegations" && (m.value = !0, await nn(), await p.value?.load());
    }
    Uo(async () => {
      await t.load(), u.value === "delegations" && await p.value?.load();
    });
    const T = X(() => {
      const k = {};
      for (const g of r.value) k[g.id] = g;
      return k;
    }), S = X(() => {
      const k = c.value.trim().toLowerCase(), g = (w) => !k || w.label.toLowerCase().includes(k) || w.id.toLowerCase().includes(k);
      return {
        custom: n.value.filter((w) => w.source === "custom" && g(w)),
        builtin: n.value.filter((w) => w.source !== "custom" && g(w))
      };
    }), P = X(() => n.value.find((k) => k.id === d.value) || null), O = X(() => P.value && P.value.source !== "custom" ? P.value : null), I = X(() => {
      if (!l.value) return [];
      const k = /* @__PURE__ */ new Set([...l.value.policies, ...l.value.base.map((w) => w.id)]), g = i.value.trim().toLowerCase();
      return r.value.filter((w) => !k.has(w.id) && (!g || (w.title || "").toLowerCase().includes(g) || w.id.toLowerCase().includes(g) || (w.comment || "").toLowerCase().includes(g)));
    }), x = X(
      () => l.value ? l.value.policies.map((k) => T.value[k] || { id: k }) : []
    );
    function y(k) {
      d.value = k.id, l.value = k.source === "custom" ? { slug: k.slug || "", label: k.label, description: k.description, policies: k.policies.map((g) => g.id), enabled: k.enabled, isNew: !1, target: "", base: [] } : null;
    }
    function F() {
      d.value = null, l.value = { slug: "", label: "", description: "", policies: [], enabled: !0, isNew: !0, target: "", base: [] };
    }
    function R(k) {
      d.value = null, l.value = {
        slug: "",
        label: k.label ? `Copy of ${k.label}` : "",
        description: k.description,
        policies: [...k.policies.map((g) => g.id), ...(k.overlay_policies ?? []).map((g) => g.id)],
        enabled: !0,
        isNew: !0,
        target: "",
        base: []
      };
    }
    function H(k) {
      return k.replace(/[^a-z0-9]+/gi, "_").replace(/^_+|_+$/g, "");
    }
    function oe(k) {
      d.value = k.id, l.value = {
        slug: k.overlay_slug || H(k.id),
        label: k.label || se(k.id),
        description: k.description,
        policies: (k.overlay_policies ?? []).map((g) => g.id),
        enabled: !0,
        isNew: !k.overlay_slug,
        target: k.id,
        base: k.policies
      };
    }
    const Z = X(() => !!l.value && l.value.target !== "");
    function de(k) {
      l.value && !l.value.policies.includes(k) && l.value.policies.push(k);
    }
    function z(k) {
      l.value && (l.value.policies = l.value.policies.filter((g) => g !== k));
    }
    function _(k) {
      const g = k.dataTransfer?.getData("text/plain");
      g && de(g);
    }
    function C(k, g) {
      k.stopPropagation();
      const w = k.dataTransfer?.getData("text/plain");
      if (!w || !l.value || w === g) return;
      const ae = l.value.policies, mt = ae.indexOf(w);
      mt !== -1 && ae.splice(mt, 1);
      const bt = ae.indexOf(g);
      ae.splice(bt === -1 ? ae.length : bt, 0, w);
    }
    const J = X(() => {
      if (!l.value || !l.value.isNew || l.value.target !== "") return "";
      const k = l.value.slug.trim();
      return k && !/^[a-z0-9][\w.-]*$/i.test(k) ? "Slug must be alphanumeric (with _.-)" : "";
    }), te = X(() => !!l.value && l.value.slug.trim() !== "" && !J.value && l.value.policies.length > 0), ue = D("");
    let me = null;
    qn(() => {
      me && clearTimeout(me);
    });
    function Oe(k) {
      ue.value = k, me && clearTimeout(me), me = setTimeout(() => {
        ue.value = "";
      }, 3e3);
    }
    async function ge() {
      if (!l.value || !te.value) return;
      const k = l.value.slug.trim(), g = l.value.target, w = l.value.label.trim() || k;
      await t.saveScope({
        slug: k,
        target: g,
        label: l.value.label.trim(),
        description: l.value.description.trim(),
        policies: l.value.policies,
        enabled: l.value.enabled
      }) && (d.value = g || `kickside.security.scopes:${k}`, Oe(`Saved “${w}”. The role will be available when assigning users.`));
    }
    async function be() {
      if (!l.value || l.value.isNew) return;
      const k = Z.value;
      if (!await rn.confirm({
        header: k ? "Remove extension?" : "Delete role?",
        message: k ? "This removes the added permissions. Users keep the role’s original permissions." : "This removes the custom role and its permissions.",
        icon: "tabler:trash",
        acceptLabel: k ? "Remove extension" : "Delete",
        rejectLabel: "Cancel",
        acceptClass: "p-button-danger"
      })) return;
      await t.deleteScope(l.value.slug) && (l.value = null, d.value = null);
    }
    function se(k) {
      return k.includes(":") ? k.split(":").slice(-1)[0] : k;
    }
    return (k, g) => (f(), v("div", Dc, [
      L(h(Sr), {
        class: "ks-tabs",
        value: u.value,
        "onUpdate:value": $
      }, {
        default: B(() => [
          L(h($r), { pt: { tabList: { "aria-label": "Security administration" } } }, {
            default: B(() => [
              L(h(Gt), { value: "scopes" }, {
                default: B(() => [...g[12] || (g[12] = [
                  K("Roles", -1)
                ])]),
                _: 1
              }),
              L(h(Gt), {
                value: "delegations",
                "data-tab": "delegations"
              }, {
                default: B(() => [...g[13] || (g[13] = [
                  K("Run as", -1)
                ])]),
                _: 1
              })
            ]),
            _: 1
          })
        ]),
        _: 1
      }, 8, ["value"]),
      m.value ? ze((f(), j(kc, {
        key: 0,
        ref_key: "delegationPanel",
        ref: p,
        scopes: h(n)
      }, null, 8, ["scopes"])), [
        [dn, u.value === "delegations"]
      ]) : A("", !0),
      h(s) ? (f(), j(h(Ot), {
        key: 1,
        severity: "danger",
        class: "ks-top-notice",
        onDismiss: g[0] || (g[0] = (w) => s.value = "")
      }, {
        default: B(() => [
          K(N(h(s)), 1)
        ]),
        _: 1
      })) : ue.value ? (f(), j(h(Ot), {
        key: 2,
        severity: "success",
        class: "ks-top-notice",
        onDismiss: g[1] || (g[1] = (w) => ue.value = "")
      }, {
        default: B(() => [
          K(N(ue.value), 1)
        ]),
        _: 1
      })) : A("", !0),
      u.value === "scopes" && h(o) && !h(n).length ? (f(), j(h(Pr), {
        key: 3,
        label: "Loading security…"
      })) : ze((f(), j(h(ls), { key: 4 }, {
        rail: B(() => [
          L(h(fs), {
            title: "Roles",
            count: h(n).length
          }, {
            actions: B(() => [
              L(h(Tt), {
                icon: "tabler:plus",
                label: "New role",
                disabled: h(a),
                onClick: F
              }, null, 8, ["disabled"]),
              L(h(Tt), {
                icon: "tabler:refresh",
                label: "Refresh",
                disabled: h(o),
                spin: h(o),
                onClick: h(t).load
              }, null, 8, ["disabled", "spin", "onClick"])
            ]),
            _: 1
          }, 8, ["count"]),
          b("div", Mc, [
            L(h(Kn), {
              modelValue: c.value,
              "onUpdate:modelValue": g[2] || (g[2] = (w) => c.value = w),
              placeholder: "Find a role…"
            }, null, 8, ["modelValue"])
          ]),
          b("div", Fc, [
            S.value.custom.length ? (f(), v("div", Uc, "Custom")) : A("", !0),
            (f(!0), v(he, null, ve(S.value.custom, (w) => (f(), v("button", {
              key: w.id,
              class: fe(["ks-scope-row", { active: w.id === d.value }]),
              onClick: (ae) => y(w)
            }, [
              b("span", Kc, N(w.label || se(w.id)), 1)
            ], 10, Wc))), 128)),
            g[14] || (g[14] = b("div", { class: "ks-rail-group" }, "Default", -1)),
            (f(!0), v(he, null, ve(S.value.builtin, (w) => (f(), v("button", {
              key: w.id,
              class: fe(["ks-scope-row", { active: w.id === d.value }]),
              onClick: (ae) => y(w)
            }, [
              b("span", qc, N(w.label || se(w.id)), 1)
            ], 10, Hc))), 128))
          ])
        ]),
        default: B(() => [
          l.value ? (f(), v("div", Yc, [
            b("div", Gc, [
              b("div", Zc, [
                L(h(ee), {
                  icon: Z.value ? "tabler:stack-2" : "tabler:shield-lock",
                  "aria-hidden": "true"
                }, null, 8, ["icon"]),
                b("span", null, N(Z.value ? `Extend ${l.value.label || se(l.value.target)}` : l.value.isNew ? "New role" : l.value.label || l.value.slug), 1),
                Z.value ? (f(), j(h(Pt), {
                  key: 0,
                  severity: "warn"
                }, {
                  default: B(() => [...g[15] || (g[15] = [
                    K("Additional permissions", -1)
                  ])]),
                  _: 1
                })) : A("", !0)
              ]),
              b("div", Qc, [
                !l.value.isNew && !Z.value && P.value ? (f(), j(h(xe), {
                  key: 0,
                  variant: "soft",
                  small: "",
                  icon: "tabler:copy",
                  disabled: h(a),
                  onClick: g[3] || (g[3] = (w) => R(P.value))
                }, {
                  default: B(() => [...g[16] || (g[16] = [
                    K("Duplicate", -1)
                  ])]),
                  _: 1
                }, 8, ["disabled"])) : A("", !0),
                l.value.isNew ? A("", !0) : (f(), j(h(xe), {
                  key: 1,
                  variant: "danger",
                  small: "",
                  icon: "tabler:trash",
                  disabled: h(a),
                  onClick: be
                }, {
                  default: B(() => [
                    K(N(Z.value ? "Remove extension" : "Delete"), 1)
                  ]),
                  _: 1
                }, 8, ["disabled"])),
                L(h(xe), {
                  variant: "primary",
                  small: "",
                  icon: "tabler:device-floppy",
                  loading: h(a),
                  disabled: !te.value,
                  onClick: ge
                }, {
                  default: B(() => [
                    K(N(Z.value ? "Save extension" : "Save role"), 1)
                  ]),
                  _: 1
                }, 8, ["loading", "disabled"])
              ])
            ]),
            Z.value ? (f(), v("div", Jc, [
              L(h(ee), {
                icon: "tabler:alert-triangle",
                "aria-hidden": "true"
              }),
              b("span", null, [
                g[17] || (g[17] = K("Adding permissions grants them to ", -1)),
                b("b", null, "everyone assigned " + N(P.value?.label || se(l.value.target)), 1),
                g[18] || (g[18] = K(". Original permissions cannot be removed here. To restrict access, create a new role with only the permissions needed.", -1))
              ])
            ])) : (f(), v("p", Xc, "Choose the permissions this role grants, then assign it in System → Users. To restrict a Member, assign this role instead of Member; other assigned roles may still grant access.")),
            b("div", ed, [
              Z.value ? (f(), j(h(Ne), {
                key: 1,
                label: "Role"
              }, {
                default: B(() => [
                  L(h(xt), {
                    "model-value": P.value?.label || l.value.target,
                    disabled: ""
                  }, null, 8, ["model-value"])
                ]),
                _: 1
              })) : (f(), j(h(Ne), {
                key: 0,
                label: "Role ID",
                help: l.value.isNew ? "Unique identifier; cannot change later." : void 0
              }, {
                default: B(() => [
                  L(h(xt), {
                    modelValue: l.value.slug,
                    "onUpdate:modelValue": g[4] || (g[4] = (w) => l.value.slug = w),
                    disabled: !l.value.isNew,
                    placeholder: "reviewer"
                  }, null, 8, ["modelValue", "disabled"]),
                  J.value ? (f(), v("span", td, N(J.value), 1)) : A("", !0)
                ]),
                _: 1
              }, 8, ["help"])),
              L(h(Ne), { label: "Name" }, {
                default: B(() => [
                  L(h(xt), {
                    modelValue: l.value.label,
                    "onUpdate:modelValue": g[5] || (g[5] = (w) => l.value.label = w),
                    placeholder: "Reviewer"
                  }, null, 8, ["modelValue"])
                ]),
                _: 1
              }),
              L(h(Ne), { label: "Description" }, {
                default: B(() => [
                  L(h(xt), {
                    modelValue: l.value.description,
                    "onUpdate:modelValue": g[6] || (g[6] = (w) => l.value.description = w),
                    placeholder: "Read-only reviewer role"
                  }, null, 8, ["modelValue"])
                ]),
                _: 1
              })
            ]),
            b("div", {
              class: fe(["ks-panes", { three: Z.value }])
            }, [
              Z.value ? (f(), v("section", nd, [
                b("header", rd, [
                  g[19] || (g[19] = b("span", null, "Original permissions", -1)),
                  b("span", od, N(l.value.base.length) + " · locked", 1)
                ]),
                b("div", ad, [
                  (f(!0), v(he, null, ve(l.value.base, (w) => (f(), j(Ke, {
                    key: w.id,
                    policy: w,
                    mode: "locked"
                  }, null, 8, ["policy"]))), 128)),
                  l.value.base.length ? A("", !0) : (f(), v("div", id, "No original permissions."))
                ])
              ])) : A("", !0),
              b("section", sd, [
                g[20] || (g[20] = b("header", { class: "ks-pane-head" }, [
                  b("span", null, "Available permissions"),
                  b("span", { class: "ks-pane-sub" }, "Click + to add")
                ], -1)),
                b("div", ld, [
                  L(h(Kn), {
                    modelValue: i.value,
                    "onUpdate:modelValue": g[7] || (g[7] = (w) => i.value = w),
                    placeholder: "Search permissions…"
                  }, null, 8, ["modelValue"])
                ]),
                b("div", cd, [
                  (f(!0), v(he, null, ve(I.value, (w) => (f(), j(Ke, {
                    key: w.id,
                    policy: w,
                    mode: "palette",
                    onAdd: (ae) => de(w.id)
                  }, null, 8, ["policy", "onAdd"]))), 128)),
                  I.value.length ? A("", !0) : (f(), v("div", dd, "No matching permissions."))
                ])
              ]),
              b("section", {
                class: "ks-pane drop",
                onDragover: g[9] || (g[9] = Ue(() => {
                }, ["prevent"])),
                onDrop: _
              }, [
                b("header", ud, [
                  b("span", null, N(Z.value ? "Added by you" : "In this role"), 1),
                  b("span", pd, N(l.value.policies.length) + " " + N(l.value.policies.length === 1 ? "permission" : "permissions"), 1)
                ]),
                b("div", fd, [
                  (f(!0), v(he, null, ve(x.value, (w) => (f(), v("div", {
                    key: w.id,
                    onDragover: g[8] || (g[8] = Ue(() => {
                    }, ["prevent"])),
                    onDrop: (ae) => C(ae, w.id)
                  }, [
                    L(Ke, {
                      policy: w,
                      mode: "selected",
                      onRemove: (ae) => z(w.id)
                    }, null, 8, ["policy", "onRemove"])
                  ], 40, md))), 128)),
                  l.value.policies.length ? A("", !0) : (f(), v("div", bd, [
                    L(h(ee), {
                      icon: "tabler:drag-drop",
                      "aria-hidden": "true"
                    }),
                    g[21] || (g[21] = b("span", null, "Use + on an available permission, or drag it here.", -1))
                  ]))
                ])
              ], 32)
            ], 2)
          ])) : O.value ? (f(), v("div", hd, [
            b("div", vd, [
              b("div", gd, [
                L(h(ee), {
                  icon: "tabler:shield",
                  "aria-hidden": "true"
                }),
                b("span", null, N(O.value.label || se(O.value.id)), 1)
              ]),
              b("div", yd, [
                L(h(xe), {
                  variant: "primary",
                  small: "",
                  icon: "tabler:stack-2",
                  onClick: g[10] || (g[10] = (w) => oe(O.value))
                }, {
                  default: B(() => [
                    K(N(O.value.overlay_slug ? "Edit extension" : "Add permissions"), 1)
                  ]),
                  _: 1
                }),
                L(h(xe), {
                  variant: "soft",
                  small: "",
                  icon: "tabler:copy",
                  onClick: g[11] || (g[11] = (w) => R(O.value))
                }, {
                  default: B(() => [...g[22] || (g[22] = [
                    K("Copy role", -1)
                  ])]),
                  _: 1
                })
              ])
            ]),
            g[24] || (g[24] = b("p", { class: "ks-view-note" }, " Included with the application. Adding permissions affects everyone with this role. For restricted access, create a new role with only the permissions needed and assign it in System → Users instead of this role. Other assigned roles may still grant access. ", -1)),
            b("div", kd, [
              (f(!0), v(he, null, ve(O.value.policies, (w) => (f(), j(Ke, {
                key: w.id,
                policy: w,
                mode: "locked"
              }, null, 8, ["policy"]))), 128)),
              O.value.policies.length ? A("", !0) : (f(), v("div", xd, "No permissions in this role."))
            ]),
            O.value.overlay_policies && O.value.overlay_policies.length ? (f(), v("div", wd, [
              b("div", $d, [
                L(h(ee), {
                  icon: "tabler:stack-2",
                  "aria-hidden": "true"
                }),
                g[23] || (g[23] = b("span", null, "Additional permissions", -1)),
                L(h(Pt), { severity: "warn" }, {
                  default: B(() => [
                    K(N(O.value.overlay_policies.length), 1)
                  ]),
                  _: 1
                })
              ]),
              b("div", Sd, [
                (f(!0), v(he, null, ve(O.value.overlay_policies, (w) => (f(), j(Ke, {
                  key: w.id,
                  policy: w,
                  mode: "locked"
                }, null, 8, ["policy"]))), 128))
              ])
            ])) : A("", !0)
          ])) : (f(), j(h(fl), {
            key: 2,
            icon: "tabler:shield-lock",
            title: "Roles",
            hint: "Choose a role to view its permissions, or create one with the permissions your team needs. Assign roles in System → Users.",
            cta: "New role",
            "cta-icon": "tabler:plus",
            onCta: F
          }))
        ]),
        _: 1
      }, 512)), [
        [dn, u.value === "scopes"]
      ])
    ]));
  }
}), Cd = ':root{--p-form-field-padding-x: .75rem;--p-form-field-padding-y: .5rem;--p-form-field-sm-padding-x: .625rem;--p-form-field-sm-padding-y: .375rem;--p-form-field-lg-padding-x: .875rem;--p-form-field-lg-padding-y: .625rem;--p-form-field-border-radius: .375rem;--p-form-field-transition-duration: .2s;--p-form-field-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), 0 1px 2px 0 rgba(18, 18, 23, .05);--p-focus-ring-width: 1px;--p-focus-ring-style: solid;--p-focus-ring-color: color-mix(in srgb, var(--p-primary-color) 100%, transparent);--p-focus-ring-offset: 2px;--p-toggleswitch-width: 2.5rem;--p-toggleswitch-height: 1.5rem;--p-toggleswitch-border-radius: 30px;--p-toggleswitch-gap: .25rem;--p-toggleswitch-border-width: 1px;--p-toggleswitch-transition-duration: .2s;--p-toggleswitch-slide-duration: .2s;--p-toggleswitch-handle-size: 1rem;--p-toggleswitch-handle-border-radius: 9999px}:root{color-scheme:light dark;--p-primary: rgb(0, 95, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-secondary: #6f7385;--p-secondary-50: color-mix(in srgb, var(--p-secondary) 5%, white);--p-secondary-100: color-mix(in srgb, var(--p-secondary) 10%, white);--p-secondary-200: color-mix(in srgb, var(--p-secondary) 20%, white);--p-secondary-300: color-mix(in srgb, var(--p-secondary) 35%, white);--p-secondary-400: color-mix(in srgb, var(--p-secondary) 65%, white);--p-secondary-500: var(--p-secondary);--p-secondary-600: color-mix(in srgb, var(--p-secondary) 80%, black);--p-secondary-700: color-mix(in srgb, var(--p-secondary) 65%, black);--p-secondary-800: color-mix(in srgb, var(--p-secondary) 55%, black);--p-secondary-900: color-mix(in srgb, var(--p-secondary) 50%, black);--p-secondary-950: color-mix(in srgb, var(--p-secondary) 30%, black);--p-danger: rgb(239, 68, 68);--p-danger-50: color-mix(in srgb, var(--p-danger) 5%, white);--p-danger-100: color-mix(in srgb, var(--p-danger) 10%, white);--p-danger-200: color-mix(in srgb, var(--p-danger) 20%, white);--p-danger-300: color-mix(in srgb, var(--p-danger) 30%, white);--p-danger-400: color-mix(in srgb, var(--p-danger) 40%, white);--p-danger-500: var(--p-danger);--p-danger-600: color-mix(in srgb, var(--p-danger) 80%, black);--p-danger-700: color-mix(in srgb, var(--p-danger) 70%, black);--p-danger-800: color-mix(in srgb, var(--p-danger) 60%, black);--p-danger-900: color-mix(in srgb, var(--p-danger) 50%, black);--p-danger-950: color-mix(in srgb, var(--p-danger) 40%, black);--p-success: rgb(34, 197, 94);--p-success-50: color-mix(in srgb, var(--p-success) 5%, white);--p-success-100: color-mix(in srgb, var(--p-success) 10%, white);--p-success-200: color-mix(in srgb, var(--p-success) 20%, white);--p-success-300: color-mix(in srgb, var(--p-success) 30%, white);--p-success-400: color-mix(in srgb, var(--p-success) 40%, white);--p-success-500: var(--p-success);--p-success-600: color-mix(in srgb, var(--p-success) 80%, black);--p-success-700: color-mix(in srgb, var(--p-success) 70%, black);--p-success-800: color-mix(in srgb, var(--p-success) 60%, black);--p-success-900: color-mix(in srgb, var(--p-success) 50%, black);--p-success-950: color-mix(in srgb, var(--p-success) 40%, black);--p-warn: rgb(249, 115, 22);--p-warn-50: color-mix(in srgb, var(--p-warn) 5%, white);--p-warn-100: color-mix(in srgb, var(--p-warn) 10%, white);--p-warn-200: color-mix(in srgb, var(--p-warn) 20%, white);--p-warn-300: color-mix(in srgb, var(--p-warn) 30%, white);--p-warn-400: color-mix(in srgb, var(--p-warn) 40%, white);--p-warn-500: var(--p-warn);--p-warn-600: color-mix(in srgb, var(--p-warn) 80%, black);--p-warn-700: color-mix(in srgb, var(--p-warn) 70%, black);--p-warn-800: color-mix(in srgb, var(--p-warn) 60%, black);--p-warn-900: color-mix(in srgb, var(--p-warn) 50%, black);--p-warn-950: color-mix(in srgb, var(--p-warn) 40%, black);--p-info: rgb(14, 165, 233);--p-info-50: color-mix(in srgb, var(--p-info) 5%, white);--p-info-100: color-mix(in srgb, var(--p-info) 10%, white);--p-info-200: color-mix(in srgb, var(--p-info) 20%, white);--p-info-300: color-mix(in srgb, var(--p-info) 30%, white);--p-info-400: color-mix(in srgb, var(--p-info) 40%, white);--p-info-500: var(--p-info);--p-info-600: color-mix(in srgb, var(--p-info) 80%, black);--p-info-700: color-mix(in srgb, var(--p-info) 70%, black);--p-info-800: color-mix(in srgb, var(--p-info) 60%, black);--p-info-900: color-mix(in srgb, var(--p-info) 50%, black);--p-info-950: color-mix(in srgb, var(--p-info) 40%, black);--p-help: rgb(168, 85, 247);--p-help-50: color-mix(in srgb, var(--p-help) 5%, white);--p-help-100: color-mix(in srgb, var(--p-help) 10%, white);--p-help-200: color-mix(in srgb, var(--p-help) 20%, white);--p-help-300: color-mix(in srgb, var(--p-help) 30%, white);--p-help-400: color-mix(in srgb, var(--p-help) 40%, white);--p-help-500: var(--p-help);--p-help-600: color-mix(in srgb, var(--p-help) 80%, black);--p-help-700: color-mix(in srgb, var(--p-help) 70%, black);--p-help-800: color-mix(in srgb, var(--p-help) 60%, black);--p-help-900: color-mix(in srgb, var(--p-help) 50%, black);--p-help-950: color-mix(in srgb, var(--p-help) 40%, black);--p-accent: rgb(20, 184, 166);--p-accent-50: color-mix(in srgb, var(--p-accent) 5%, white);--p-accent-100: color-mix(in srgb, var(--p-accent) 10%, white);--p-accent-200: color-mix(in srgb, var(--p-accent) 20%, white);--p-accent-300: color-mix(in srgb, var(--p-accent) 30%, white);--p-accent-400: color-mix(in srgb, var(--p-accent) 40%, white);--p-accent-500: var(--p-accent);--p-accent-600: color-mix(in srgb, var(--p-accent) 80%, black);--p-accent-700: color-mix(in srgb, var(--p-accent) 70%, black);--p-accent-800: color-mix(in srgb, var(--p-accent) 60%, black);--p-accent-900: color-mix(in srgb, var(--p-accent) 50%, black);--p-accent-950: color-mix(in srgb, var(--p-accent) 40%, black);--p-surface-0: #ffffff;--p-surface-50: #fafafa;--p-surface-100: #f5f5f5;--p-surface-200: #e5e5e5;--p-surface-300: #d4d4d4;--p-surface-400: #a3a3a3;--p-surface-500: #737373;--p-surface-600: #525252;--p-surface-700: #404040;--p-surface-800: #262626;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #171717;--p-surface-950: #0a0a0a;--p-content-border-radius: 6px;--p-font-heading-family: var(--v-font-family-head, Arial);--p-font-heading-scale: 1;--p-font-heading-line-height: 1.5;--p-font-heading-letter-spacing: normal;--p-font-heading-stretch: normal;--p-font-heading-variation-settings: normal;--p-font-body-scale: 1;--p-font-body-line-height: 1.5;--p-font-body-letter-spacing: normal;--p-font-body-stretch: normal;--p-font-body-variation-settings: normal;--p-font-mono-family: ui-monospace}:root{--p-primary-color: var(--p-primary-500);--p-primary-contrast-color: var(--p-surface-0);--p-primary-hover-color: var(--p-primary-600);--p-primary-active-color: var(--p-primary-700);--p-secondary-color: var(--p-secondary-500);--p-secondary-contrast-color: var(--p-surface-0);--p-secondary-hover-color: var(--p-secondary-600);--p-secondary-active-color: var(--p-secondary-700);--p-danger-color: var(--p-danger-500);--p-danger-contrast-color: var(--p-surface-0);--p-danger-hover-color: var(--p-danger-600);--p-danger-active-color: var(--p-danger-700);--p-success-color: var(--p-success-500);--p-success-contrast-color: var(--p-surface-0);--p-success-hover-color: var(--p-success-600);--p-success-active-color: var(--p-success-700);--p-warn-color: var(--p-warn-500);--p-warn-contrast-color: var(--p-surface-0);--p-warn-hover-color: var(--p-warn-600);--p-warn-active-color: var(--p-warn-700);--p-info-color: var(--p-info-500);--p-info-contrast-color: var(--p-surface-0);--p-info-hover-color: var(--p-info-600);--p-info-active-color: var(--p-info-700);--p-help-color: var(--p-help-500);--p-help-contrast-color: var(--p-surface-0);--p-help-hover-color: var(--p-help-600);--p-help-active-color: var(--p-help-700);--p-accent-color: var(--p-accent-500);--p-accent-contrast-color: var(--p-surface-0);--p-accent-hover-color: var(--p-accent-600);--p-accent-active-color: var(--p-accent-700);--p-content-border-color: var(--p-surface-200);--p-content-hover-background: var(--p-surface-100);--p-content-hover-color: var(--p-surface-800);--p-highlight-background: var(--p-primary-50);--p-highlight-color: var(--p-primary-700);--p-highlight-focus-background: var(--p-primary-100);--p-highlight-focus-color: var(--p-primary-800);--p-content-background: var(--p-surface-0);--p-text-color: var(--p-surface-700);--p-text-hover-color: var(--p-surface-800);--p-text-muted-color: var(--p-surface-500);--p-text-hover-muted-color: var(--p-surface-600)}@media(prefers-color-scheme:dark){:root:not(.w-theme-light){--p-surface-D: #fff;--p-surface-0: #fff;--p-surface-50: #fafafa;--p-surface-100: #f4f4f5;--p-surface-200: #e4e4e7;--p-surface-300: #d4d4d8;--p-surface-400: #a1a1aa;--p-surface-500: #71717a;--p-surface-600: #545250;--p-surface-700: #403e3c;--p-surface-800: #2b2927;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #1c1a19;--p-surface-950: #0f0e0d;--p-primary: rgb(0, 125, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-primary-color: var(--p-primary-400);--p-primary-contrast-color: var(--p-surface-900);--p-primary-hover-color: var(--p-primary-300);--p-primary-active-color: var(--p-primary-200);--p-secondary-color: var(--p-secondary-400);--p-secondary-contrast-color: var(--p-surface-900);--p-secondary-hover-color: var(--p-secondary-300);--p-secondary-active-color: var(--p-secondary-200);--p-danger-color: var(--p-danger-400);--p-danger-contrast-color: var(--p-surface-900);--p-danger-hover-color: var(--p-danger-300);--p-danger-active-color: var(--p-danger-200);--p-success-color: var(--p-success-400);--p-success-contrast-color: var(--p-surface-900);--p-success-hover-color: var(--p-success-300);--p-success-active-color: var(--p-success-200);--p-warn-color: var(--p-warn-400);--p-warn-contrast-color: var(--p-surface-900);--p-warn-hover-color: var(--p-warn-300);--p-warn-active-color: var(--p-warn-200);--p-info-color: var(--p-info-400);--p-info-contrast-color: var(--p-surface-900);--p-info-hover-color: var(--p-info-300);--p-info-active-color: var(--p-info-200);--p-help-color: var(--p-help-400);--p-help-contrast-color: var(--p-surface-900);--p-help-hover-color: var(--p-help-300);--p-help-active-color: var(--p-help-200);--p-accent-color: var(--p-accent-400);--p-accent-contrast-color: var(--p-surface-900);--p-accent-hover-color: var(--p-accent-300);--p-accent-active-color: var(--p-accent-200);--p-content-border-color: var(--p-surface-700);--p-content-hover-background: var(--p-surface-800);--p-content-hover-color: var(--p-surface-0);--p-highlight-background: color-mix(in srgb, var(--p-primary-400), transparent 84%);--p-highlight-color: rgba(255, 255, 255, 87%);--p-highlight-focus-background: color-mix(in srgb, var(--p-primary-400), transparent 76%);--p-highlight-focus-color: rgba(255, 255, 255, 87%);--p-content-background: var(--p-surface-900);--p-text-color: var(--p-surface-0);--p-text-hover-color: var(--p-surface-0);--p-text-muted-color: var(--p-surface-400);--p-text-hover-muted-color: var(--p-surface-300)}}:root.w-theme-dark,.w-theme-dark{color-scheme:dark;--p-surface-D: #fff;--p-surface-0: #fff;--p-surface-50: #fafafa;--p-surface-100: #f4f4f5;--p-surface-200: #e4e4e7;--p-surface-300: #d4d4d8;--p-surface-400: #a1a1aa;--p-surface-500: #71717a;--p-surface-600: #545250;--p-surface-700: #403e3c;--p-surface-800: #2b2927;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #1c1a19;--p-surface-950: #0f0e0d;--p-primary: rgb(0, 125, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-primary-color: var(--p-primary-400);--p-primary-contrast-color: var(--p-surface-900);--p-primary-hover-color: var(--p-primary-300);--p-primary-active-color: var(--p-primary-200);--p-secondary-color: var(--p-secondary-400);--p-secondary-contrast-color: var(--p-surface-900);--p-secondary-hover-color: var(--p-secondary-300);--p-secondary-active-color: var(--p-secondary-200);--p-danger-color: var(--p-danger-400);--p-danger-contrast-color: var(--p-surface-900);--p-danger-hover-color: var(--p-danger-300);--p-danger-active-color: var(--p-danger-200);--p-success-color: var(--p-success-400);--p-success-contrast-color: var(--p-surface-900);--p-success-hover-color: var(--p-success-300);--p-success-active-color: var(--p-success-200);--p-warn-color: var(--p-warn-400);--p-warn-contrast-color: var(--p-surface-900);--p-warn-hover-color: var(--p-warn-300);--p-warn-active-color: var(--p-warn-200);--p-info-color: var(--p-info-400);--p-info-contrast-color: var(--p-surface-900);--p-info-hover-color: var(--p-info-300);--p-info-active-color: var(--p-info-200);--p-help-color: var(--p-help-400);--p-help-contrast-color: var(--p-surface-900);--p-help-hover-color: var(--p-help-300);--p-help-active-color: var(--p-help-200);--p-accent-color: var(--p-accent-400);--p-accent-contrast-color: var(--p-surface-900);--p-accent-hover-color: var(--p-accent-300);--p-accent-active-color: var(--p-accent-200);--p-content-border-color: var(--p-surface-700);--p-content-hover-background: var(--p-surface-800);--p-content-hover-color: var(--p-surface-0);--p-highlight-background: color-mix(in srgb, var(--p-primary-400), transparent 84%);--p-highlight-color: rgba(255, 255, 255, 87%);--p-highlight-focus-background: color-mix(in srgb, var(--p-primary-400), transparent 76%);--p-highlight-focus-color: rgba(255, 255, 255, 87%);--p-content-background: var(--p-surface-900);--p-text-color: var(--p-surface-0);--p-text-hover-color: var(--p-surface-0);--p-text-muted-color: var(--p-surface-400);--p-text-hover-muted-color: var(--p-surface-300)}:root.w-theme-light,.w-theme-light{color-scheme:light;--p-surface-0: #ffffff;--p-surface-50: #fafafa;--p-surface-100: #f5f5f5;--p-surface-200: #e5e5e5;--p-surface-300: #d4d4d4;--p-surface-400: #a3a3a3;--p-surface-500: #737373;--p-surface-600: #525252;--p-surface-700: #404040;--p-surface-800: #262626;--p-surface-850: color-mix(in srgb, var(--p-surface-800) 50%, var(--p-surface-900));--p-surface-900: #171717;--p-surface-950: #0a0a0a;--p-primary: rgb(0, 95, 178);--p-primary-50: color-mix(in srgb, var(--p-primary) 5%, white);--p-primary-100: color-mix(in srgb, var(--p-primary) 10%, white);--p-primary-200: color-mix(in srgb, var(--p-primary) 20%, white);--p-primary-300: color-mix(in srgb, var(--p-primary) 30%, white);--p-primary-400: color-mix(in srgb, var(--p-primary) 40%, white);--p-primary-500: var(--p-primary);--p-primary-600: color-mix(in srgb, var(--p-primary) 80%, black);--p-primary-700: color-mix(in srgb, var(--p-primary) 70%, black);--p-primary-800: color-mix(in srgb, var(--p-primary) 60%, black);--p-primary-900: color-mix(in srgb, var(--p-primary) 50%, black);--p-primary-950: color-mix(in srgb, var(--p-primary) 40%, black);--p-primary-color: var(--p-primary-500);--p-primary-contrast-color: var(--p-surface-0);--p-primary-hover-color: var(--p-primary-600);--p-primary-active-color: var(--p-primary-700);--p-secondary-color: var(--p-secondary-500);--p-secondary-contrast-color: var(--p-surface-0);--p-secondary-hover-color: var(--p-secondary-600);--p-secondary-active-color: var(--p-secondary-700);--p-danger-color: var(--p-danger-500);--p-danger-contrast-color: var(--p-surface-0);--p-danger-hover-color: var(--p-danger-600);--p-danger-active-color: var(--p-danger-700);--p-success-color: var(--p-success-500);--p-success-contrast-color: var(--p-surface-0);--p-success-hover-color: var(--p-success-600);--p-success-active-color: var(--p-success-700);--p-warn-color: var(--p-warn-500);--p-warn-contrast-color: var(--p-surface-0);--p-warn-hover-color: var(--p-warn-600);--p-warn-active-color: var(--p-warn-700);--p-info-color: var(--p-info-500);--p-info-contrast-color: var(--p-surface-0);--p-info-hover-color: var(--p-info-600);--p-info-active-color: var(--p-info-700);--p-help-color: var(--p-help-500);--p-help-contrast-color: var(--p-surface-0);--p-help-hover-color: var(--p-help-600);--p-help-active-color: var(--p-help-700);--p-accent-color: var(--p-accent-500);--p-accent-contrast-color: var(--p-surface-0);--p-accent-hover-color: var(--p-accent-600);--p-accent-active-color: var(--p-accent-700);--p-content-border-color: var(--p-surface-200);--p-content-hover-background: var(--p-surface-100);--p-content-hover-color: var(--p-surface-800);--p-highlight-background: var(--p-primary-50);--p-highlight-color: var(--p-primary-700);--p-highlight-focus-background: var(--p-primary-100);--p-highlight-focus-color: var(--p-primary-800);--p-content-background: var(--p-surface-0);--p-text-color: var(--p-surface-700);--p-text-hover-color: var(--p-surface-800);--p-text-muted-color: var(--p-surface-500);--p-text-hover-muted-color: var(--p-surface-600)}.kx-tag-sm,.kx-tag-sm.kx-tag-sm{display:inline-flex;align-items:center;gap:4px;padding:1px 7px;border-radius:var(--kx-radius-tag, 6px);font-size:10.5px;font-weight:600;line-height:1.5;white-space:nowrap}.kx-tag-sm svg,.kx-tag-sm.kx-tag-sm svg{width:12px;height:12px}.kx-tag-caps,.kx-tag-caps.kx-tag-caps{display:inline-flex;align-items:center;gap:3px;padding:2px 6px;border-radius:var(--kx-radius-tag, 6px);font-size:9px;font-weight:700;line-height:1.5;letter-spacing:.04em;text-transform:uppercase;white-space:nowrap}.kx-tag-caps svg,.kx-tag-caps.kx-tag-caps svg{width:11px;height:11px}:host,:root{--kx-surface-1: color-mix(in srgb, var(--p-content-background) 96%, var(--p-text-color) 4%);--kx-surface-2: color-mix(in srgb, var(--p-content-background) 92%, var(--p-text-color) 8%);--kx-surface-3: color-mix(in srgb, var(--p-content-background) 86%, var(--p-text-color) 14%);--kx-surface-4: color-mix(in srgb, var(--p-content-background) 78%, var(--p-text-color) 22%);--kx-border-strong: color-mix(in srgb, var(--p-content-border-color) 60%, var(--p-text-color) 40%);--kx-border-stronger: color-mix(in srgb, var(--p-content-border-color) 30%, var(--p-text-color) 70%);--kx-text-faint: color-mix(in srgb, var(--p-text-muted-color) 70%, var(--p-content-background) 30%);--kx-text-fainter: color-mix(in srgb, var(--p-text-muted-color) 45%, var(--p-content-background) 55%);--kx-wash-primary: color-mix(in srgb, var(--p-primary-color) 12%, var(--p-content-background) 88%);--kx-wash-success: color-mix(in srgb, var(--p-success-500) 12%, var(--p-content-background) 88%);--kx-wash-info: color-mix(in srgb, var(--p-info-500) 12%, var(--p-content-background) 88%);--kx-wash-warn: color-mix(in srgb, var(--p-warn-500) 12%, var(--p-content-background) 88%);--kx-wash-danger: color-mix(in srgb, var(--p-danger-500) 12%, var(--p-content-background) 88%);--kx-wash-help: color-mix(in srgb, var(--p-help-500) 12%, var(--p-content-background) 88%);--kx-font-heading: "Outfit", system-ui, sans-serif;--kx-font-body: "Inter", system-ui, sans-serif;--kx-radius-4: 4px;--kx-radius-6: 6px;--kx-radius-8: 8px;--kx-radius-10: 10px;--kx-radius-14: 14px;--kx-radius-16: 16px;--kx-radius-tag: var(--p-content-border-radius, 6px);--kx-control-height: 34px;--kx-control-height-sm: 30px;--kx-rail-width: 264px;--kx-reading-measure: 880px;--kx-row-height: 32px;--kx-shadow-sm: 0 1px 2px rgba(0, 0, 0, .08);--kx-shadow-md: 0 4px 24px rgba(0, 0, 0, .12);--kx-shadow-lg: 0 16px 60px rgba(0, 0, 0, .18);--kx-overlay-hover: color-mix(in srgb, var(--p-text-color) 7%, transparent);--kx-overlay-subtle: color-mix(in srgb, var(--p-text-color) 4%, transparent)}@media(prefers-color-scheme:dark){:host(:not(.w-theme-light)),:root:not(.w-theme-light){--kx-shadow-sm: 0 1px 2px rgba(0, 0, 0, .35);--kx-shadow-md: 0 4px 24px rgba(0, 0, 0, .45);--kx-shadow-lg: 0 16px 60px rgba(0, 0, 0, .6)}}:host(.w-theme-dark),:root.w-theme-dark{--kx-shadow-sm: 0 1px 2px rgba(0, 0, 0, .35);--kx-shadow-md: 0 4px 24px rgba(0, 0, 0, .45);--kx-shadow-lg: 0 16px 60px rgba(0, 0, 0, .6)}*,:before,:after{--tw-border-spacing-x: 0;--tw-border-spacing-y: 0;--tw-translate-x: 0;--tw-translate-y: 0;--tw-rotate: 0;--tw-skew-x: 0;--tw-skew-y: 0;--tw-scale-x: 1;--tw-scale-y: 1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness: proximity;--tw-gradient-from-position: ;--tw-gradient-via-position: ;--tw-gradient-to-position: ;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width: 0px;--tw-ring-offset-color: #fff;--tw-ring-color: rgb(59 130 246 / .5);--tw-ring-offset-shadow: 0 0 #0000;--tw-ring-shadow: 0 0 #0000;--tw-shadow: 0 0 #0000;--tw-shadow-colored: 0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: ;--tw-contain-size: ;--tw-contain-layout: ;--tw-contain-paint: ;--tw-contain-style: }::backdrop{--tw-border-spacing-x: 0;--tw-border-spacing-y: 0;--tw-translate-x: 0;--tw-translate-y: 0;--tw-rotate: 0;--tw-skew-x: 0;--tw-skew-y: 0;--tw-scale-x: 1;--tw-scale-y: 1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness: proximity;--tw-gradient-from-position: ;--tw-gradient-via-position: ;--tw-gradient-to-position: ;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width: 0px;--tw-ring-offset-color: #fff;--tw-ring-color: rgb(59 130 246 / .5);--tw-ring-offset-shadow: 0 0 #0000;--tw-ring-shadow: 0 0 #0000;--tw-shadow: 0 0 #0000;--tw-shadow-colored: 0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: ;--tw-contain-size: ;--tw-contain-layout: ;--tw-contain-paint: ;--tw-contain-style: }*,:before,:after{box-sizing:border-box;border-width:0;border-style:solid;border-color:#e5e7eb}:before,:after{--tw-content: ""}html,:host{line-height:1.5;-webkit-text-size-adjust:100%;-moz-tab-size:4;tab-size:4;font-family:ui-sans-serif,system-ui,sans-serif,"Apple Color Emoji","Segoe UI Emoji",Segoe UI Symbol,"Noto Color Emoji";font-feature-settings:normal;font-variation-settings:normal;-webkit-tap-highlight-color:transparent}body{margin:0;line-height:inherit}hr{height:0;color:inherit;border-top-width:1px}abbr:where([title]){text-decoration:underline dotted}h1,h2,h3,h4,h5,h6{font-size:inherit;font-weight:inherit}a{color:inherit;text-decoration:inherit}b,strong{font-weight:bolder}code,kbd,samp,pre{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace;font-feature-settings:normal;font-variation-settings:normal;font-size:1em}small{font-size:80%}sub,sup{font-size:75%;line-height:0;position:relative;vertical-align:baseline}sub{bottom:-.25em}sup{top:-.5em}table{text-indent:0;border-color:inherit;border-collapse:collapse}button,input,optgroup,select,textarea{font-family:inherit;font-feature-settings:inherit;font-variation-settings:inherit;font-size:100%;font-weight:inherit;line-height:inherit;letter-spacing:inherit;color:inherit;margin:0;padding:0}button,select{text-transform:none}button,input:where([type=button]),input:where([type=reset]),input:where([type=submit]){-webkit-appearance:button;background-color:transparent;background-image:none}:-moz-focusring{outline:auto}:-moz-ui-invalid{box-shadow:none}progress{vertical-align:baseline}::-webkit-inner-spin-button,::-webkit-outer-spin-button{height:auto}[type=search]{-webkit-appearance:textfield;outline-offset:-2px}::-webkit-search-decoration{-webkit-appearance:none}::-webkit-file-upload-button{-webkit-appearance:button;font:inherit}summary{display:list-item}blockquote,dl,dd,h1,h2,h3,h4,h5,h6,hr,figure,p,pre{margin:0}fieldset{margin:0;padding:0}legend{padding:0}ol,ul,menu{list-style:none;margin:0;padding:0}dialog{padding:0}textarea{resize:vertical}input::placeholder,textarea::placeholder{opacity:1;color:#9ca3af}button,[role=button]{cursor:pointer}:disabled{cursor:default}img,svg,video,canvas,audio,iframe,embed,object{display:block;vertical-align:middle}img,video{max-width:100%;height:auto}[hidden]:where(:not([hidden=until-found])){display:none}@supports (-moz-appearance:none){*{scrollbar-color:initial;scrollbar-width:initial}}:host{display:block;height:100%;min-height:0;--km-rail-w: 296px;--system-surface-gutter: var(--kickside-system-surface-gutter, 24px)}:host>div{height:100%;min-height:0}*,*:before,*:after{box-sizing:border-box}.km{height:100%;min-height:0;display:flex;flex-direction:column;background:var(--p-content-background);color:var(--p-text-color);font-family:inherit}.km-top-notice{width:calc(100% - (var(--system-surface-gutter) * 2));margin:12px 0 0 var(--system-surface-gutter)}.km-shell{flex:1;min-height:0;width:100%;margin:0;display:grid;grid-template-columns:var(--km-rail-w) minmax(0,1fr);border-left:1px solid var(--p-content-border-color);border-right:1px solid var(--p-content-border-color)}.km-rail{min-width:0;min-height:0;display:flex;flex-direction:column;border-right:1px solid var(--p-content-border-color)}.km-rail-body{flex:1;min-height:0;overflow:auto;padding:6px}.km-main{min-width:0;min-height:0;display:flex;flex-direction:column;overflow:hidden}.km-railhead{flex:0 0 auto;display:flex;align-items:center;justify-content:space-between;gap:8px;min-height:48px;padding:0 8px 0 14px;border-bottom:1px solid var(--p-content-border-color)}.km-railhead-title{display:inline-flex;align-items:center;gap:7px;font-size:12px;font-weight:760;letter-spacing:.03em;text-transform:uppercase;color:var(--p-text-muted-color)}.km-railhead-title b{min-width:18px;padding:1px 6px;border-radius:999px;background:var(--kx-overlay-subtle);color:var(--p-text-color);font-size:11px;font-weight:700;text-align:center}.km-railhead-acts{display:inline-flex;align-items:center;gap:2px}.km-input{width:100%;min-width:0;height:34px;padding:0 10px;border:1px solid var(--p-content-border-color);border-radius:var(--kx-radius-8);background:var(--p-content-background);color:var(--p-text-color);font:inherit;font-size:13px}.km-input:read-only{color:var(--p-text-muted-color);background:var(--kx-overlay-subtle)}.km-input:disabled{opacity:.6}.km-input.mono{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}.km-textarea{height:auto;min-height:120px;padding:9px 10px;line-height:1.45;resize:vertical}.km-search{position:relative;display:flex;align-items:center;min-width:0}.km-search-ico{position:absolute;left:9px;width:16px;height:16px;color:var(--p-text-muted-color);pointer-events:none}.km-search-input{width:100%;height:34px;padding:0 30px;border:1px solid var(--p-content-border-color);border-radius:var(--kx-radius-8);background:var(--p-content-background);color:var(--p-text-color);font:inherit;font-size:13px}.km-search-clear{position:absolute;right:6px;width:22px;height:22px;display:inline-flex;align-items:center;justify-content:center;border:0;border-radius:6px;background:transparent;color:var(--p-text-muted-color);cursor:pointer}.km-search-clear:hover{color:var(--p-text-color);background:var(--kx-overlay-hover)}.km-search-clear svg{width:14px;height:14px}.km-select{position:relative;min-width:0;display:flex}.km-select-el{width:100%;height:34px;padding:0 30px 0 10px;border:1px solid var(--p-content-border-color);border-radius:var(--kx-radius-8);background:var(--p-content-background);color:var(--p-text-color);font:inherit;font-size:13px;cursor:pointer;appearance:none}.km-select-chev{position:absolute;right:9px;top:50%;transform:translateY(-50%);width:15px;height:15px;color:var(--p-text-muted-color);pointer-events:none}.km-field{min-width:0;display:flex;flex-direction:column;gap:5px}.km-field-label{color:var(--p-text-muted-color);font-size:11.5px;font-weight:680}.km-field-help{color:var(--p-text-muted-color);font-size:11.5px;line-height:1.35}.km-pill{max-width:190px;overflow:hidden;text-overflow:ellipsis}.km-pill-dot{width:6px;height:6px;border-radius:50%;background:currentColor}.km-notice{display:flex;align-items:center;gap:9px;padding:9px 10px 9px 12px;border:1px solid var(--p-content-border-color);border-radius:var(--kx-radius-8);font-size:13px}.km-notice svg{width:17px;height:17px;flex:0 0 auto}.km-notice-text{flex:1;min-width:0}.km-notice.is-info{color:var(--p-text-color);background:var(--kx-overlay-subtle)}.km-notice.is-danger{color:var(--p-text-color);border-color:color-mix(in srgb,var(--p-danger-500) 32%,var(--p-content-border-color));background:color-mix(in srgb,var(--p-danger-500) 9%,transparent)}.km-notice.is-success{color:var(--p-text-color);border-color:color-mix(in srgb,var(--p-success-500) 36%,var(--p-content-border-color));background:color-mix(in srgb,var(--p-success-500) 12%,transparent)}.km-notice-x{width:24px;height:24px;display:inline-flex;align-items:center;justify-content:center;border:0;border-radius:6px;background:transparent;color:inherit;cursor:pointer;opacity:.7}.km-notice-x:hover{opacity:1;background:color-mix(in srgb,currentColor 12%,transparent)}.km-notice-x svg{width:14px;height:14px}.km-loading{display:flex;align-items:center;justify-content:center;gap:9px;padding:40px 20px;color:var(--p-text-muted-color);font-size:13px}.km-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;padding:48px 24px;text-align:center}.km-empty-ico{width:30px;height:30px;color:var(--p-text-muted-color)}.km-empty-title{font-size:14px;font-weight:720}.km-empty-hint{margin:0;max-width:340px;color:var(--p-text-muted-color);font-size:12.5px;line-height:1.45}.km-empty .p-button{margin-top:4px}.km-plist{display:flex;flex-direction:column;gap:2px}.km-plist-all{width:100%;height:32px;display:flex;align-items:center;padding:0 10px;border:0;border-radius:var(--kx-radius-8);background:transparent;color:var(--p-text-muted-color);font:inherit;font-size:12.5px;font-weight:640;text-align:left;cursor:pointer}.km-plist-all:hover{background:var(--kx-overlay-hover);color:var(--p-text-color)}.km-plist-all.on{background:color-mix(in srgb,var(--p-primary-color) 12%,transparent);color:var(--p-primary-color)}.km-plist-empty{display:flex;flex-direction:column;align-items:flex-start;gap:8px;padding:10px;color:var(--p-text-muted-color);font-size:12.5px}.km-plist-empty p{margin:0}.km-picker{display:flex;flex-direction:column;gap:18px}.km-picker-sec{display:flex;flex-direction:column;gap:7px}.km-picker-sec-title{color:var(--p-text-muted-color);font-size:11px;font-weight:760;letter-spacing:.03em;text-transform:uppercase}.km-picker-list{display:flex;flex-direction:column;gap:4px}.km-picker-item{display:grid;grid-template-columns:32px minmax(0,1fr) 16px;align-items:center;gap:11px;padding:9px 10px;border:1px solid var(--p-content-border-color);border-radius:var(--kx-radius-8);background:transparent;color:var(--p-text-color);font:inherit;text-align:left;cursor:pointer;transition:border-color .12s ease,background-color .12s ease}.km-picker-item:hover{border-color:color-mix(in srgb,var(--p-primary-color) 50%,var(--p-content-border-color));background:var(--kx-overlay-hover)}.km-picker-ico{width:32px;height:32px;display:inline-flex;align-items:center;justify-content:center;border-radius:var(--kx-radius-8);color:var(--p-primary-color);background:color-mix(in srgb,var(--p-primary-color) 11%,transparent)}.km-picker-ico svg{width:18px;height:18px}.km-picker-body{min-width:0;display:flex;flex-direction:column;gap:2px}.km-picker-name{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:13px;font-weight:660}.km-picker-desc{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--p-text-muted-color);font-size:11.5px}.km-picker-go{width:16px;height:16px;color:var(--p-text-muted-color)}.km-form{display:flex;flex-direction:column;gap:16px}.km-editor-head{display:flex;align-items:center;gap:11px}.km-editor-head-text{min-width:0}.km-editor-head-title{font-size:14px;font-weight:740}.km-editor-head-sub{margin-top:2px;color:var(--p-text-muted-color);font-size:12px;line-height:1.4}.km-form-sec{display:flex;flex-direction:column;gap:10px}.km-form-sec+.km-form-sec{padding-top:16px;border-top:1px solid var(--p-content-border-color)}.km-form-sec-title{color:var(--p-text-muted-color);font-size:11px;font-weight:760;letter-spacing:.03em;text-transform:uppercase}.km-form-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:11px}.km-form-grid.four{grid-template-columns:repeat(4,minmax(0,1fr))}.km-form-foot{position:sticky;bottom:-16px;display:flex;flex-wrap:wrap;justify-content:flex-end;gap:8px;margin:0 -16px -16px;padding:14px 16px;border-top:1px solid var(--p-content-border-color);background:var(--p-content-background)}.km-form-id{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:11.5px;color:var(--p-text-muted-color)}.km-form-foot-sp{flex:1}.km-adv-toggle{display:inline-flex;align-items:center;gap:6px;padding:0;border:0;background:transparent;color:var(--p-text-muted-color);font:inherit;font-size:11px;font-weight:760;letter-spacing:.03em;text-transform:uppercase;cursor:pointer}.km-adv-toggle:hover{color:var(--p-text-color)}.km-adv-chev{width:14px;height:14px;transition:transform .15s ease}.km-adv-toggle.open .km-adv-chev{transform:rotate(90deg)}.km-adv-body{display:flex;flex-direction:column;gap:10px;margin-top:10px}.km-test-result{display:flex;align-items:center;gap:8px;padding:8px 11px;border-radius:var(--kx-radius-8);font-size:12.5px}.km-test-result svg{width:16px;height:16px;flex:0 0 auto}.km-test-result span{min-width:0;overflow-wrap:anywhere}.km-test-result.testing{color:var(--p-text-muted-color);background:var(--kx-overlay-subtle)}.km-test-result.ok{color:var(--p-success-600, var(--p-success-500));background:color-mix(in srgb,var(--p-success-500) 12%,transparent)}.km-test-result.fail{color:var(--p-danger-600, var(--p-danger-500));background:color-mix(in srgb,var(--p-danger-500) 10%,transparent)}.km-probe{border:1px solid var(--p-content-border-color);border-radius:var(--kx-radius-8);font-size:13px}.km-probe.ok{border-color:color-mix(in srgb,var(--p-success-500) 30%,var(--p-content-border-color));background:color-mix(in srgb,var(--p-success-500) 8%,transparent)}.km-probe.fail{border-color:color-mix(in srgb,var(--p-danger-500) 30%,var(--p-content-border-color));background:color-mix(in srgb,var(--p-danger-500) 8%,transparent)}.km-probe-head{display:flex;flex-wrap:wrap;align-items:center;gap:9px;padding:9px 10px 9px 12px}.km-probe-head>svg{width:17px;height:17px;flex:0 0 auto}.km-probe.ok .km-probe-head>svg{color:var(--p-success-600, var(--p-success-500))}.km-probe.fail .km-probe-head>svg{color:var(--p-danger-600, var(--p-danger-500))}.km-probe-msg{flex:1;min-width:0}.km-probe-time{flex:0 0 auto;padding:1px 7px;border-radius:var(--kx-radius-tag);background:var(--kx-overlay-subtle);color:var(--p-text-muted-color);font-size:11px;font-weight:700;font-variant-numeric:tabular-nums}.km-probe-adv-btn{flex:0 0 auto}.km-probe-x{width:24px;height:24px;display:inline-flex;align-items:center;justify-content:center;flex:0 0 auto;border:0;border-radius:6px;background:transparent;color:var(--p-text-muted-color);cursor:pointer;opacity:.7}.km-probe-x:hover{opacity:1;background:color-mix(in srgb,currentColor 12%,transparent)}.km-probe-x svg{width:14px;height:14px}.km-probe-adv{display:flex;flex-direction:column;gap:10px;padding:10px 12px 12px;border-top:1px solid var(--p-content-border-color)}.km-probe-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:6px 16px}.km-probe-kv{display:flex;align-items:baseline;gap:8px;min-width:0}.km-probe-kv span{flex:0 0 96px;color:var(--p-text-muted-color);font-size:11.5px}.km-probe-kv code{min-width:0;overflow:hidden;text-overflow:ellipsis;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:11.5px}.km-probe-tokens{display:flex;flex-wrap:wrap;align-items:center;gap:6px}.km-probe-tokens-l{color:var(--p-text-muted-color);font-size:11.5px;margin-right:2px}.km-probe-tok{padding:1px 8px;border-radius:var(--kx-radius-tag);background:var(--kx-overlay-subtle);color:var(--p-text-muted-color);font-size:11px;font-variant-numeric:tabular-nums}.km-probe-tok b{color:var(--p-text-color);font-weight:700}.km-probe-out{display:flex;flex-direction:column;gap:4px}.km-probe-out span{color:var(--p-text-muted-color);font-size:11.5px;font-weight:700}.km-probe-out pre{margin:0;max-height:160px;overflow:auto;padding:9px 10px;border-radius:6px;background:var(--kx-overlay-subtle);font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:11.5px;line-height:1.45;white-space:pre-wrap;word-break:break-word}.km-tabs{flex:0 0 auto;display:flex;gap:2px;padding:0 12px;border-bottom:1px solid var(--p-content-border-color)}.km-tab{position:relative;display:inline-flex;align-items:center;gap:7px;height:44px;padding:0 12px;border:0;background:transparent;color:var(--p-text-muted-color);font:inherit;font-size:13px;font-weight:700;cursor:pointer}.km-tab:hover,.km-tab.on{color:var(--p-text-color)}.km-tab.on:after{content:"";position:absolute;left:8px;right:8px;bottom:-1px;height:2px;border-radius:2px 2px 0 0;background:var(--p-primary-color)}.km-tab b{min-width:18px;padding:0 6px;border-radius:999px;background:var(--kx-overlay-subtle);color:var(--p-text-muted-color);font-size:11px;font-weight:700;text-align:center}.km-tab.on b{background:color-mix(in srgb,var(--p-primary-color) 14%,transparent);color:var(--p-primary-color)}.km-classes{flex:1;min-height:0;display:flex;flex-direction:column}.km-classes-list{display:flex;flex-direction:column;gap:10px;padding:14px 16px}.km-class{flex:0 0 auto;border:1px solid var(--p-content-border-color);border-radius:var(--kx-radius-10);overflow:hidden}.km-class-head{display:flex;align-items:center;gap:10px;padding:10px 12px;background:var(--kx-overlay-subtle);border-bottom:1px solid var(--p-content-border-color)}.km-class-head-text{flex:1;min-width:0}.km-class-title{display:flex;align-items:center;gap:8px;font-size:13.5px;font-weight:720}.km-class-ref{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:11px;font-weight:600;color:var(--p-primary-color);background:color-mix(in srgb,var(--p-primary-color) 12%,transparent);padding:1px 6px;border-radius:6px}.km-class-desc{margin-top:3px;color:var(--p-text-muted-color);font-size:12px;line-height:1.4}.km-class-meta{display:flex;align-items:center;gap:8px;flex:0 0 auto}.km-class-count{color:var(--p-text-muted-color);font-size:11.5px;white-space:nowrap}.km-class-members{display:flex;flex-direction:column}.km-class-member{display:grid;grid-template-columns:58px minmax(0,1.2fr) minmax(0,1fr) auto;align-items:center;gap:10px;padding:8px 12px;border-bottom:1px solid var(--p-content-border-color)}.km-class-member:last-child{border-bottom:0}.km-class-member.top{background:color-mix(in srgb,var(--p-success-500) 6%,transparent)}.km-class-rank{width:20px;height:20px;display:inline-flex;align-items:center;justify-content:center;border-radius:6px;background:var(--kx-overlay-subtle);color:var(--p-text-muted-color);font-size:11px;font-weight:700}.km-class-member-name{font-size:13px;font-weight:620;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.km-class-member-id{color:var(--p-text-muted-color);font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:11px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.km-class-member-pri{color:var(--p-text-muted-color);font-size:11px;justify-self:end;white-space:nowrap}.km-class-empty{padding:12px;color:var(--p-text-muted-color);font-size:12px}@media(max-width:860px){.km-shell{grid-template-columns:1fr;grid-template-rows:auto minmax(0,1fr)}.km-rail{border-right:0;border-bottom:1px solid var(--p-content-border-color);max-height:40vh}.km-form-grid,.km-form-grid.four{grid-template-columns:1fr}.km-class-member{grid-template-columns:auto minmax(0,1fr) auto}.km-class-member-id{display:none}}@media(max-width:560px){.km-probe-grid{grid-template-columns:1fr}}.ks{height:100%;min-height:0;display:flex;flex-direction:column;color:var(--p-text-color);background:var(--p-content-background)}.ks-tabs{padding:0 var(--system-surface-gutter);flex:none}.ks-top-notice{margin:12px var(--system-surface-gutter)}.ks-rail-search{padding:8px 10px}.ks-rail-list{padding:0 8px 10px;overflow-y:auto}.ks-rail-group{font-size:10.5px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:var(--p-text-muted-color);padding:10px 6px 4px}.ks-scope-row{width:100%;display:flex;align-items:center;justify-content:space-between;gap:8px;padding:8px 10px;border:none;border-radius:var(--kx-radius-8);background:transparent;cursor:pointer;text-align:left;color:var(--p-text-color);transition:background .12s;font:inherit}.ks-scope-row:hover{background:var(--kx-overlay-hover)}.ks-scope-row.active{background:color-mix(in srgb,var(--p-primary-color) 14%,transparent)}.ks-scope-name{font-size:13px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.ks-scope-meta{flex:none;display:flex;align-items:center;gap:6px}.ks-scope-count{font-size:11px;font-weight:700;color:var(--p-text-muted-color);min-width:18px;text-align:right}.ks-builder,.ks-view{display:flex;flex-direction:column;height:100%;min-height:0;padding:16px var(--system-surface-gutter);gap:14px;overflow:auto}.ks-builder-head{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}.ks-builder-title{display:flex;align-items:center;gap:8px;font-size:16px;font-weight:700;color:var(--p-text-color)}.ks-builder-acts{display:flex;gap:8px;flex-wrap:wrap}.ks-fields{display:grid;grid-template-columns:220px 1fr 1fr;gap:12px}.ks-field-err{display:block;margin-top:4px;font-size:11px;color:var(--p-danger-500)}.ks-panes{flex:1;min-height:0;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.ks-pane{display:flex;flex-direction:column;min-height:0;border:1px solid var(--p-content-border-color);border-radius:var(--kx-radius-10);background:var(--kx-overlay-subtle)}.ks-pane.drop{border-style:dashed}.ks-pane-head{display:flex;align-items:baseline;justify-content:space-between;gap:8px;padding:10px 12px 8px;font-size:13px;font-weight:700;color:var(--p-text-color)}.ks-pane-sub{font-size:11px;font-weight:500;color:var(--p-text-muted-color)}.ks-pane-search{padding:0 10px 8px}.ks-pane-body{flex:1;min-height:0;overflow-y:auto;padding:4px 10px 10px;display:flex;flex-direction:column;gap:8px}.ks-pane-empty{padding:16px 8px;font-size:12px;color:var(--p-text-muted-color);text-align:center}.ks-drop-hint{margin:auto;display:flex;flex-direction:column;align-items:center;gap:8px;padding:24px;color:var(--p-text-muted-color);font-size:13px;text-align:center}.ks-drop-hint svg{font-size:28px}.ks-view-note{font-size:12px;color:var(--p-text-muted-color);line-height:1.5;margin:0}.ks-view-list{border:1px solid var(--p-content-border-color);border-radius:var(--kx-radius-10);background:var(--kx-overlay-subtle);padding:4px 10px}.ks-pcard{display:flex;align-items:flex-start;gap:8px;padding:10px 10px 10px 6px;border:1px solid var(--p-content-border-color);border-radius:var(--kx-radius-8);background:var(--p-content-background);cursor:grab;transition:border-color .12s,box-shadow .12s,transform .08s}.ks-pcard:hover{border-color:var(--p-primary-color);box-shadow:0 1px 6px #0000000f}.ks-pcard:active{cursor:grabbing;transform:scale(.997)}.ks-pcard-grip{flex:none;margin-top:2px;color:var(--p-text-muted-color);font-size:15px}.ks-pcard-body{flex:1;min-width:0}.ks-pcard-head{display:flex;align-items:center;gap:8px}.ks-pcard-title{font-weight:600;font-size:13px;color:var(--p-text-color);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.ks-pcard-comment{font-size:12px;color:var(--p-text-muted-color);margin-top:2px;line-height:1.35}.ks-pcard-act{flex:none;width:24px;height:24px;display:grid;place-items:center;border:none;border-radius:6px;cursor:pointer;background:transparent;color:var(--p-text-muted-color);transition:background .12s,color .12s}.ks-pcard-act.add:hover{background:color-mix(in srgb,var(--p-success-600) 12%,transparent);color:var(--p-success-700)}.ks-pcard-act.remove:hover{background:color-mix(in srgb,var(--p-danger-500) 12%,transparent);color:var(--p-danger-700)}.ks-pcard{flex-direction:column;align-items:stretch}.ks-pcard-row{display:flex;align-items:flex-start;gap:8px}.ks-pcard.locked{cursor:default;opacity:.9}.ks-pcard.locked:hover{border-color:var(--p-content-border-color);box-shadow:none}.ks-pcard-grip.locked,.ks-pcard-act.detail{color:var(--p-text-muted-color)}.ks-pcard-act.detail svg{transition:transform .15s}.ks-pcard-act.detail.open svg{transform:rotate(90deg)}.ks-pcard-act.detail:hover{background:var(--kx-overlay-hover);color:var(--p-text-color)}.ks-pcard-detail{margin-top:8px;padding-top:8px;border-top:1px dashed var(--p-content-border-color);display:flex;flex-direction:column;gap:5px}.ks-pcard-kv{display:flex;gap:8px;font-size:11px;align-items:flex-start}.ks-pcard-kv>span{flex:none;width:64px;color:var(--p-text-muted-color);text-transform:uppercase;font-weight:700;letter-spacing:.03em;font-size:10px;padding-top:3px}.ks-pcard-tags{display:flex;flex-wrap:wrap;gap:4px}.ks-pcard-kv code,.ks-eff-code{min-width:0;overflow-wrap:anywhere;font-family:ui-monospace,Menlo,monospace;font-size:10.5px;background:var(--kx-overlay-subtle);padding:1px 5px;border-radius:4px;color:var(--p-text-color)}.ks-pcard-none{color:var(--p-text-muted-color);font-size:11px}.ks-overlay-warn{display:flex;gap:10px;align-items:flex-start;padding:10px 12px;border-radius:var(--kx-radius-8);background:color-mix(in srgb,var(--p-warn-500) 12%,transparent);border:1px solid color-mix(in srgb,var(--p-warn-500) 40%,transparent);color:var(--p-text-color);font-size:12.5px;line-height:1.45}.ks-overlay-warn svg{flex:none;margin-top:1px;color:var(--p-warn-600);font-size:18px}.ks-panes.three{grid-template-columns:repeat(3,minmax(0,1fr))}.ks-pane.locked-pane{background:var(--kx-overlay-hover)}.ks-ext-block{margin-top:14px}.ks-ext-head{display:flex;align-items:center;gap:8px;font-size:13px;font-weight:700;color:var(--p-text-color);margin-bottom:6px}.ks-ext-head svg{color:var(--p-warn-600)}.ks-runas{flex:1;min-height:0;overflow:auto;padding:16px var(--system-surface-gutter);display:flex;flex-direction:column;gap:16px;color:var(--p-text-color)}.ks-runas>*{width:100%;max-width:860px}.ks-runas-head{display:flex;align-items:flex-start;justify-content:space-between;gap:16px}.ks-runas-title{margin:0 0 6px;font-size:16px;font-weight:700}.ks-runas-lede{margin:0;max-width:640px;color:var(--p-text-muted-color);font-size:13px;line-height:1.5}.ks-runas-lede b{color:var(--p-text-color);font-weight:600}.ks-runas-acts{flex:0 0 auto;display:flex;align-items:center;gap:6px}.ks-runas-form{border:1px solid var(--p-content-border-color);border-radius:var(--kx-radius-10);background:var(--kx-overlay-subtle)}.ks-runas-form fieldset{border:0;margin:0;padding:0;min-width:0}.ks-runas-form-head{display:flex;align-items:center;justify-content:space-between;padding:10px 12px 10px 16px;border-bottom:1px solid var(--p-content-border-color);font-size:13px;font-weight:700}.ks-runas-form-foot{display:flex;justify-content:flex-end;gap:8px;padding:12px 16px;border-top:1px solid var(--p-content-border-color)}.ks-runas-steps{list-style:none;counter-reset:step;margin:0;padding:16px;display:flex;flex-direction:column;gap:18px}.ks-runas-steps>li{counter-increment:step;position:relative;padding-left:34px;display:flex;flex-direction:column;gap:8px}.ks-runas-steps>li:before{content:counter(step);position:absolute;left:0;top:0;width:22px;height:22px;border-radius:999px;display:grid;place-items:center;font-size:11.5px;font-weight:700;color:var(--p-primary-color);background:color-mix(in srgb,var(--p-primary-color) 14%,transparent)}.ks-runas-chips{display:flex;flex-wrap:wrap;gap:6px}.ks-runas-pending{display:flex;align-items:center;justify-content:space-between;gap:12px;font-size:13px}.ks-runas-list{display:flex;flex-direction:column;gap:8px}.ks-runas-grant{display:flex;align-items:center;gap:12px;padding:12px 14px;border:1px solid var(--p-content-border-color);border-radius:var(--kx-radius-10);background:var(--p-content-background)}.ks-runas-grant.revoked{opacity:.6}.ks-runas-grant-icon{flex:0 0 auto;font-size:20px;color:var(--p-primary-color)}.ks-runas-grant.revoked .ks-runas-grant-icon{color:var(--p-text-muted-color)}.ks-runas-grant-body{flex:1;min-width:0;display:flex;flex-direction:column;gap:3px}.ks-runas-grant-line{display:flex;flex-wrap:wrap;align-items:baseline;gap:6px;font-size:13.5px}.ks-runas-who{font-weight:650;overflow-wrap:anywhere}.ks-runas-verb{color:var(--p-text-muted-color)}.ks-runas-grant-meta{color:var(--p-text-muted-color);font-size:12px;overflow-wrap:anywhere}.ks-runas-grant-meta code{font-family:ui-monospace,Menlo,monospace;font-size:11px;padding:1px 5px;border-radius:4px;background:var(--kx-overlay-subtle)}.ks-runas-grant-meta b{color:var(--p-text-color);font-weight:600}.ks-runas-empty{display:flex;flex-direction:column;align-items:center;gap:8px;padding:40px 16px;text-align:center;border:1px dashed var(--p-content-border-color);border-radius:var(--kx-radius-10);color:var(--p-text-muted-color);font-size:13px}.ks-runas-empty>svg{font-size:28px}.ks-runas-empty b{color:var(--p-text-color)}@media(max-width:640px){.ks-runas{padding:16px}.ks-runas-head{flex-direction:column}.ks-runas-grant{flex-wrap:wrap}}@media(max-width:1100px){.ks-fields{grid-template-columns:1fr}.ks-panes,.ks-panes.three{flex:none;grid-template-columns:1fr}.ks-pane{min-height:180px}.ks-pane-body{max-height:360px}.ks-pane-head{flex-wrap:wrap}}', Td = { props: { type: "object", properties: {} } }, Pd = {
  wippy: Td
};
class Od extends Wo {
  static get wippyConfig() {
    return {
      propsSchema: Pd.wippy.props,
      hostCssKeys: ["themeConfigUrl", "primeVueCssUrl"],
      inlineCss: Cd
    };
  }
  static get vueConfig() {
    return { rootComponent: _d, plugins: [Pi] };
  }
}
mo(import.meta.url, Od);
//# sourceMappingURL=index.js.map
